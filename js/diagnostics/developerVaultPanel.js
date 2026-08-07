/**
 * ETAP 34A / 34C — Developer Control Center (UI)
 * Panel wyłącznie dla właściciela (PIN).
 * Scentralizowany pulpit: System Health (metryki) + strumień raportów.
 * Bez nowych silników · bez autoApply/autoFix · bez zmian Home/Map/app.js.
 */

import { t } from '../core/i18n.js';
import { showToast } from '../core/toast.js';
import {
    isDevVaultUnlocked,
    unlockDevVault,
    lockDevVault,
    isDeveloperAccessGranted,
    isDevVaultAccessLocked,
    getDevVaultLockMessage,
    resetDevVaultLock,
    DEV_VAULT_PIN_MASK
} from './devVault.js';
import { ensureDiagnosticsLoaded } from './diagnosticsOrchestrator.js';
import {
    copyStreamEntry,
    deleteStreamEntry,
    filterDeveloperVaultStream,
    getStreamStatusMeta,
    loadStreamEntryPreview,
    loadUnifiedReportStream
} from './reportManagerClient.js';
import {
    applyStreamSuggestion,
    rejectStreamSuggestion,
    getStreamEntryDescription,
    isStreamEntryDeployReady,
    filterDismissedStreamEntries,
    enrichStreamEntriesWithDescriptions,
    getStreamEntryApplyMeta
} from './devVaultSuggestions.js';
import {
    buildDevStatusBoard,
    loadDevStatusBoardSources
} from './devStatusBoard.js';
import { runHealthCheck } from './healthMonitor.js';
import { APP_NAME, APP_VERSION } from '../config.js';
import {
    HEALING_REPORT_KEY,
    SELF_HEALING_LOG_KEY
} from '../core/selfHealingLogger.js';

const HEALTH_REPORT_STORAGE_KEY = 'rg_app_health_report_v1';

const ROOT_ID = 'rg-dev-vault-root';
const STYLE_ID = 'rg-dev-vault-style';

let bound = false;
/** Domyślnie tylko FIXED · SUGGESTION · INFO · FAILED */
let showAllReports = false;

function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
#${ROOT_ID}{--info-blue:#3b82f6}
#${ROOT_ID}{position:fixed;inset:0;z-index:100050;display:none;align-items:stretch;justify-content:center;padding:0;background:rgba(20,28,22,.62);backdrop-filter:blur(4px);font-family:'Source Sans 3',system-ui,sans-serif;color:#1c1812}
#${ROOT_ID}.open{display:flex}
#${ROOT_ID} *{box-sizing:border-box}
#${ROOT_ID} .rg-dcc-shell{width:min(920px,100%);max-height:100%;margin:auto;display:flex;flex-direction:column;background:#f5efe3;border-radius:0;box-shadow:0 20px 60px rgba(0,0,0,.35);overflow:hidden;border:1px solid rgba(42,63,40,.22)}
@media(min-width:640px){#${ROOT_ID}{padding:16px;align-items:center}#${ROOT_ID} .rg-dcc-shell{max-height:min(92vh,820px);border-radius:18px}}
#${ROOT_ID} .rg-dcc-top{flex:0 0 auto;background:linear-gradient(180deg,#1e3220 0%,#2a3f28 55%,#243d28 100%);color:#f5efe3;padding:14px 16px 12px;border-bottom:2px solid #c9a227}
#${ROOT_ID} .rg-dcc-top h2{margin:0;font-family:Literata,Georgia,serif;font-size:clamp(1.15rem,4vw,1.45rem);font-weight:700;letter-spacing:.01em}
#${ROOT_ID} .rg-dcc-top .rg-dcc-sub{margin:4px 0 0;font-size:.82rem;opacity:.88;line-height:1.35}
#${ROOT_ID} .rg-dcc-body{flex:1 1 auto;overflow:auto;padding:14px 16px 18px;min-height:280px;-webkit-overflow-scrolling:touch}
#${ROOT_ID} .rg-dcc-foot{flex:0 0 auto;display:flex;flex-wrap:wrap;gap:8px;padding:10px 14px;border-top:1px solid rgba(42,63,40,.14);background:rgba(255,254,248,.9)}
#${ROOT_ID} .rg-dv-card{width:min(400px,100%);margin:auto;background:#f5efe3;color:#1c1812;border-radius:16px;border:1px solid rgba(42,63,40,.2);box-shadow:0 18px 50px rgba(0,0,0,.28);padding:18px}
#${ROOT_ID} .rg-dv-card h2{margin:0 0 8px;font-family:Literata,Georgia,serif;font-size:1.25rem;color:#2a3f28}
#${ROOT_ID} .rg-dv-card p{margin:0 0 12px;color:#4a3f32;font-size:.95rem;line-height:1.4}
#${ROOT_ID} .rg-dv-card input{width:100%;padding:10px 12px;border-radius:10px;border:1px solid rgba(42,63,40,.25);font:inherit;margin-bottom:12px;background:#fff}
#${ROOT_ID} .rg-dv-actions{display:flex;flex-wrap:wrap;gap:8px}
#${ROOT_ID} .rg-dv-actions button,#${ROOT_ID} .rg-dcc-foot button,#${ROOT_ID} .rg-dcc-body button.rg-dv-primary,#${ROOT_ID} .rg-dcc-body button.rg-dv-secondary{border:0;border-radius:10px;padding:9px 14px;font-weight:700;cursor:pointer;font-family:inherit;font-size:.9rem}
#${ROOT_ID} .rg-dv-primary{background:#2a3f28;color:#f5efe3}
#${ROOT_ID} .rg-dv-secondary{background:transparent;color:#2a3f28;border:1px solid rgba(42,63,40,.3)!important}
#${ROOT_ID} .rg-dcc-section h3{margin:0 0 8px;font-family:Literata,Georgia,serif;font-size:1.1rem;color:#2a3f28}
#${ROOT_ID} .rg-dcc-section p.lead{margin:0 0 12px;color:#4a3f32;font-size:.9rem;line-height:1.45}
#${ROOT_ID} .rg-dv-metrics-grid{display:grid;gap:8px;grid-template-columns:repeat(2,minmax(0,1fr))}
@media(min-width:520px){#${ROOT_ID} .rg-dv-metrics-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(min-width:720px){#${ROOT_ID} .rg-dv-metrics-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
#${ROOT_ID} .rg-dv-metric{background:#fffef8;border:1px solid rgba(42,63,40,.14);border-radius:12px;padding:10px 10px 9px;min-height:68px}
#${ROOT_ID} .rg-dv-metric-k{display:block;font-size:.68rem;text-transform:uppercase;letter-spacing:.04em;color:#4a3f32;font-weight:700;line-height:1.25}
#${ROOT_ID} .rg-dv-metric-v{display:block;font-family:Literata,Georgia,serif;font-size:1.2rem;font-weight:700;margin-top:4px;color:#2a3f28;line-height:1.2}
#${ROOT_ID} .rg-dv-metric--ok{border-color:rgba(42,99,40,.4);background:rgba(42,99,40,.1)}
#${ROOT_ID} .rg-dv-metric--ok .rg-dv-metric-v{color:#1e5a24}
#${ROOT_ID} .rg-dv-metric--warn{border-color:rgba(201,162,39,.5);background:rgba(201,162,39,.14)}
#${ROOT_ID} .rg-dv-metric--warn .rg-dv-metric-v{color:#7a5a08}
#${ROOT_ID} .rg-dv-metric--fail{border-color:rgba(180,60,60,.4);background:rgba(180,60,60,.1)}
#${ROOT_ID} .rg-dv-metric[data-dv-error-feed]{cursor:pointer}
#${ROOT_ID} .rg-dv-metric[data-dv-error-feed]:focus-visible{outline:2px solid #c9a227;outline-offset:2px}
#${ROOT_ID} .rg-dv-metrics-divider{height:0;border:0;border-top:1px solid rgba(42,63,40,.14);margin:18px 0 14px}
#${ROOT_ID} .rg-dv-report-filter-row{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin:0 0 12px}
#${ROOT_ID} .rg-dv-report-filter-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
#${ROOT_ID} .rg-dv-report-filter-note{margin:0;font-size:.82rem;color:#5c5348;line-height:1.35}
#${ROOT_ID} .rg-dv-report-show-all,#${ROOT_ID} .rg-dv-clear-reports{font-size:.82rem;padding:6px 12px;border-radius:999px;border:1px solid rgba(42,63,40,.22);background:#fffef8;color:#2a3f28;cursor:pointer;font-weight:600;font-family:inherit}
#${ROOT_ID} .rg-dv-report-show-all[aria-pressed="true"]{background:rgba(59,130,246,.12);border-color:rgba(59,130,246,.45);color:#1d4ed8}
#${ROOT_ID} .rg-dv-clear-reports{border-color:rgba(201,162,39,.45);background:rgba(201,162,39,.1)}
#${ROOT_ID} .rg-dv-report-show-all:focus-visible,#${ROOT_ID} .rg-dv-clear-reports:focus-visible{outline:2px solid #c9a227;outline-offset:2px}
#${ROOT_ID} .rg-dv-report-list{list-style:none;padding:0;margin:0}
#${ROOT_ID} .rg-dv-report-list li{display:flex;align-items:flex-start;gap:10px;padding:12px 0;border-bottom:1px solid rgba(42,63,40,.12)}
#${ROOT_ID} .rg-dv-report-list li:last-child{border-bottom:0}
#${ROOT_ID} .rg-dv-report-tag{flex:0 0 auto;font-size:.72rem;font-weight:700;padding:3px 8px;border-radius:999px;background:rgba(42,63,40,.1);color:#2a3f28;white-space:nowrap;margin-top:2px;line-height:1.3}
#${ROOT_ID} .rg-dv-report-ico{flex:0 0 auto;font-size:1.1rem;line-height:1.2;margin-top:2px}
#${ROOT_ID} .rg-dv-report-title-row{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
#${ROOT_ID} .rg-dv-status-badge{display:inline-block;font-size:.68rem;font-weight:700;padding:2px 8px;border-radius:999px;color:#fff;line-height:1.35;letter-spacing:.02em}
#${ROOT_ID} .rg-dv-status-badge--fixed{background:#2a7a38}
#${ROOT_ID} .rg-dv-status-badge--suggestion{background:#c97a12}
#${ROOT_ID} .rg-dv-status-badge--failed{background:#b83232}
#${ROOT_ID} .rg-dv-status-badge--info{background:var(--info-blue,#3b82f6)}
#${ROOT_ID} .rg-dv-report-desc{margin:6px 0 0;padding:8px 10px;border-radius:10px;font-size:.84rem;line-height:1.45;border-left:3px solid rgba(42,63,40,.2);background:rgba(255,255,255,.5)}
#${ROOT_ID} .rg-dv-report-desc-k{display:block;font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin-bottom:3px}
#${ROOT_ID} .rg-dv-report-desc-v{margin:0;color:#1c1812;word-break:break-word}
#${ROOT_ID} .rg-dv-report-desc--fixed{border-left-color:#2a7a38;background:rgba(42,122,56,.08)}
#${ROOT_ID} .rg-dv-report-desc--fixed .rg-dv-report-desc-k{color:#1e5a24}
#${ROOT_ID} .rg-dv-report-desc--suggestion{border-left-color:#c97a12;background:rgba(201,122,18,.08)}
#${ROOT_ID} .rg-dv-report-desc--suggestion .rg-dv-report-desc-k{color:#7a5a08}
#${ROOT_ID} .rg-dv-report-desc--failed{border-left-color:#b83232;background:rgba(184,50,50,.08)}
#${ROOT_ID} .rg-dv-report-desc--failed .rg-dv-report-desc-k{color:#6b1d1d}
#${ROOT_ID} .rg-dv-report-desc--info{border-left-color:var(--info-blue,#3b82f6);background:rgba(59,130,246,.08)}
#${ROOT_ID} .rg-dv-report-desc--info .rg-dv-report-desc-k{color:#1d4ed8}
#${ROOT_ID} .rg-dv-deploy-badge{display:inline-block;font-size:.65rem;font-weight:700;padding:2px 7px;border-radius:999px;background:rgba(42,63,40,.12);color:#2a3f28;margin-left:4px;vertical-align:middle}
#${ROOT_ID} .rg-dv-apply{background:rgba(42,122,56,.12);color:#1e5a24;border:1px solid rgba(42,122,56,.35)!important}
#${ROOT_ID} .rg-dv-apply:disabled{opacity:.45;cursor:not-allowed}
#${ROOT_ID} .rg-dv-apply-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px;width:100%;margin-bottom:4px}
#${ROOT_ID} .rg-dv-apply-hint{font-size:.78rem;color:#4a3f32;line-height:1.35;flex:1;min-width:min(100%,200px)}
#${ROOT_ID} .rg-dv-apply-hint--warn{color:#6b1d1d}
#${ROOT_ID} .rg-dv-reject{background:rgba(180,60,60,.08);color:#6b1d1d;border:1px solid rgba(140,40,40,.28)!important}
#${ROOT_ID} .rg-dv-report-empty{margin:16px 0;padding:20px 16px;text-align:center;background:rgba(255,255,255,.55);border:1px dashed rgba(42,63,40,.18);border-radius:12px;color:#4a3f32;font-size:.95rem}
#${ROOT_ID} .rg-dcc-pre{white-space:pre-wrap;font-size:.85rem;line-height:1.45;background:rgba(255,255,255,.7);border-radius:10px;padding:10px;border:1px solid rgba(42,63,40,.1);max-height:40vh;overflow:auto}
#${ROOT_ID} .rg-dv-err{color:#8a2b2b;font-size:.9rem;margin:0 0 8px}
#${ROOT_ID} .rg-dv-pin-visual{display:block;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:1.05rem;letter-spacing:.12em;color:#4a3f32;margin:0 0 10px;user-select:none}
#${ROOT_ID} .rg-dv-lock-msg{margin:0 0 12px;padding:12px 14px;border-radius:10px;background:rgba(180,60,60,.1);border:1px solid rgba(180,60,60,.28);color:#6b1d1d;font-size:.92rem;line-height:1.45}
#${ROOT_ID} .rg-dcc-btn-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
#${ROOT_ID} .rg-dcc-btn-row button{font-size:.82rem;padding:7px 10px}
#${ROOT_ID} .rg-dcc-danger{background:transparent;color:#6b1d1d;border:1px solid rgba(140,40,40,.35)!important}
#${ROOT_ID} .rg-dv-preview{position:absolute;inset:0;z-index:20;display:flex;align-items:stretch;justify-content:center;padding:12px;background:rgba(20,28,22,.55)}
#${ROOT_ID} .rg-dv-preview[hidden]{display:none!important}
#${ROOT_ID} .rg-dv-preview-panel{width:min(760px,100%);max-height:100%;display:flex;flex-direction:column;background:#fffef8;border:1px solid rgba(42,63,40,.2);border-radius:14px;box-shadow:0 16px 48px rgba(0,0,0,.28);overflow:hidden}
#${ROOT_ID} .rg-dv-preview-head{flex:0 0 auto;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:12px 14px;border-bottom:1px solid rgba(42,63,40,.12);background:rgba(42,63,40,.06)}
#${ROOT_ID} .rg-dv-preview-head h3{margin:0;font-family:Literata,Georgia,serif;font-size:1.05rem;color:#2a3f28;line-height:1.35}
#${ROOT_ID} .rg-dv-preview-meta{margin:4px 0 0;font-size:.78rem;color:#4a3f32;word-break:break-all}
#${ROOT_ID} .rg-dv-preview-body{flex:1 1 auto;overflow:auto;padding:14px 16px 18px;font-size:.9rem;line-height:1.5;color:#1c1812;-webkit-overflow-scrolling:touch}
#${ROOT_ID} .rg-dv-md h2,#${ROOT_ID} .rg-dv-md h3,#${ROOT_ID} .rg-dv-md h4{margin:1em 0 .45em;font-family:Literata,Georgia,serif;color:#2a3f28;line-height:1.3}
#${ROOT_ID} .rg-dv-md h2{font-size:1.15rem}
#${ROOT_ID} .rg-dv-md h3{font-size:1.05rem}
#${ROOT_ID} .rg-dv-md h4{font-size:.98rem}
#${ROOT_ID} .rg-dv-md p{margin:0 0 .75em}
#${ROOT_ID} .rg-dv-md ul{margin:0 0 .85em 1.1em;padding:0}
#${ROOT_ID} .rg-dv-md li{margin:.25em 0}
#${ROOT_ID} .rg-dv-md code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.84em;background:rgba(42,63,40,.08);padding:1px 5px;border-radius:4px}
#${ROOT_ID} .rg-dv-md-pre,#${ROOT_ID} .rg-dv-preview-body pre{white-space:pre-wrap;word-break:break-word;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.82rem;line-height:1.45;background:rgba(42,63,40,.06);border:1px solid rgba(42,63,40,.1);border-radius:10px;padding:12px;margin:0 0 12px;overflow:auto}
#${ROOT_ID} .rg-dv-preview-loading{color:#4a3f32;font-style:italic}
#${ROOT_ID} .rg-dv-preview-err{color:#8a2b2b}
#${ROOT_ID} .rg-dcc-shell{position:relative}
`;
    document.head.appendChild(style);
}

const METRIC_LABELS = {
    Overall: 'OVERALL',
    Health: 'HEALTH',
    Performance: 'PERFORMANCE',
    Brand: 'BRAND',
    PWA: 'PWA',
    Offline: 'OFFLINE',
    GPS: 'GPS',
    Mapa: 'MAPA',
    UI: 'UI',
    Accessibility: 'ACCESSIBILITY',
    Security: 'SECURITY',
    Console: 'CONSOLE',
    Warnings: 'WARNINGS',
    Reports: 'REPORTS',
    Storage: 'STORAGE',
    Release: 'RELEASE'
};

function formatMetricCell(row) {
    if (row.value == null || row.value === '') return '—';
    if (row.kind === 'text' || row.kind === 'release') return String(row.value);
    if (row.kind === 'count') {
        if (row.key === 'Console') {
            const n = Number(row.value);
            if (n === 1) return '1 błąd';
            if (n > 1) return `${n} błędów`;
            return '0';
        }
        return String(row.value);
    }
    if (row.unit === '%') return `${row.value}%`;
    return `${row.value}${row.unit || ''}`;
}

function metricToneClass(row) {
    if (row.kind === 'release') {
        if (row.value === 'READY') return 'rg-dv-metric--ok';
        if (row.value === 'NOT READY') return 'rg-dv-metric--fail';
        return '';
    }
    if (row.kind === 'count') {
        if (row.key === 'Console' || row.key === 'Warnings') {
            return Number(row.value) > 0 ? 'rg-dv-metric--warn' : 'rg-dv-metric--ok';
        }
        return '';
    }
    if (row.kind === 'text') return '';
    const n = Number(row.value);
    if (!Number.isFinite(n)) return '';
    if (n > 90) return 'rg-dv-metric--ok';
    if (n >= 70) return 'rg-dv-metric--warn';
    return 'rg-dv-metric--fail';
}

function computeOverallScore(rows) {
    const nums = (rows || [])
        .filter((r) => r.unit === '%' && r.value != null)
        .map((r) => Number(r.value))
        .filter((n) => Number.isFinite(n));
    if (!nums.length) return null;
    return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function systemHealthTileHtml(row) {
    const label = METRIC_LABELS[row.key] || String(row.key || '').toUpperCase();
    const tone = metricToneClass(row);
    const clickable = row.key === 'Console' ? ' data-dv-error-feed role="button" tabindex="0" title="Otwórz Runtime Error Feed"' : '';
    return `
      <div class="rg-dv-metric ${tone}"${clickable}>
        <span class="rg-dv-metric-k">${escapeHtml(label)}</span>
        <span class="rg-dv-metric-v">${escapeHtml(formatMetricCell(row))}</span>
      </div>`;
}

function renderSystemHealthTilesHtml(board, streamCount) {
    const rows = (board?.rows || []).map((row) => (
        row.key === 'Reports' ? { ...row, value: streamCount ?? row.value } : row
    ));
    const overall = computeOverallScore(rows);
    const overallRow = {
        key: 'Overall',
        value: overall,
        unit: '%',
        kind: 'score'
    };
    const tiles = [overallRow, ...rows].map((row) => systemHealthTileHtml(row)).join('');
    return `
      <section class="rg-dcc-section" aria-label="System Health">
        <h3>System Health</h3>
        <p class="lead">${label('devVault.statusHint', 'Kluczowe metryki aplikacji — tylko odczyt, bez auto-napraw.')}</p>
        <div class="rg-dv-metrics-grid">${tiles}</div>
        <div class="rg-dcc-btn-row" style="margin-top:12px">
          <button type="button" class="rg-dv-primary" data-dv-error-feed>Runtime Error Feed</button>
          <button type="button" class="rg-dv-secondary" data-dv-health-run>${label('devVault.healthRefresh', 'Odśwież Health')}</button>
          <button type="button" class="rg-dv-secondary" data-dv-dashboard-refresh>Odśwież pulpit</button>
        </div>
      </section>`;
}

function unifiedReportRowHtml(entry) {
    const isSystem = entry.kind === 'system';
    const pathHint = isSystem
        ? `system · ${entry.systemEntry?.source || 'healing'}`
        : String(entry.rel || '').replace(/^\//, '');
    const when = formatDate(entry.mtime || (entry.sortTs ? new Date(entry.sortTs).toISOString() : null));
    const title = isSystem
        ? (entry.title || entry.name || 'System Health')
        : (entry.isLatest ? `${entry.name || 'latest'} · bieżący` : (entry.name || pathHint));
    const streamId = String(entry.streamId || pathHint);
    const statusMeta = getStreamStatusMeta(entry.streamStatus);
    const desc = getStreamEntryDescription(entry);
    const deployReady = isStreamEntryDeployReady(entry);
    const applyMeta = getStreamEntryApplyMeta(entry);
    const applyHintClass = applyMeta.hintTone === 'warn' ? ' rg-dv-apply-hint--warn' : '';
    return `
      <li>
        <span class="rg-dv-report-ico" aria-hidden="true">${statusMeta.icon}</span>
        <span class="rg-dv-report-tag" aria-label="Kategoria">${escapeHtml(entry.categoryLabel || '[Report]')}</span>
        <div style="flex:1;min-width:0">
          <div class="rg-dv-report-title-row">
            <strong>${escapeHtml(title)}</strong>
            <span class="rg-dv-status-badge ${statusMeta.badgeClass}" aria-label="Status raportu">${escapeHtml(statusMeta.label)}</span>
            ${deployReady ? '<span class="rg-dv-deploy-badge">Gotowe do wdrożenia</span>' : ''}
          </div>
          <div class="rg-dv-report-desc rg-dv-report-desc--${escapeHtml(desc.tone)}" role="note">
            <span class="rg-dv-report-desc-k">${escapeHtml(desc.heading)}</span>
            <p class="rg-dv-report-desc-v">${escapeHtml(desc.text)}</p>
          </div>
          <p style="margin:4px 0 0;color:#4a3f32;font-size:.82rem">${escapeHtml(when)} · ${escapeHtml(pathHint)}</p>
          <div class="rg-dcc-btn-row">
            <div class="rg-dv-apply-row">
              <button type="button" class="rg-dv-apply" data-dv-apply-id="${escapeHtml(streamId)}"${applyMeta.enabled ? '' : ' disabled'} title="${escapeHtml(applyMeta.title)}">✅ Wprowadź zmianę</button>
              ${applyMeta.hint ? `<span class="rg-dv-apply-hint${applyHintClass}">${escapeHtml(applyMeta.hint)}</span>` : ''}
            </div>
            <button type="button" class="rg-dv-reject" data-dv-reject-id="${escapeHtml(streamId)}">❌ Odrzuć zmianę</button>
            <button type="button" class="rg-dv-secondary" data-dv-open-id="${escapeHtml(streamId)}">${label('devVault.openReport', 'Otwórz')}</button>
            <button type="button" class="rg-dv-secondary" data-dv-copy-id="${escapeHtml(streamId)}">📋 Kopiuj raport</button>
            <button type="button" class="rg-dcc-danger" data-dv-del-id="${escapeHtml(streamId)}">🗑 Usuń raport</button>
          </div>
        </div>
      </li>`;
}

function simpleMarkdownToHtml(source) {
    const lines = String(source ?? '').split('\n');
    const out = [];
    let inCode = false;
    let codeBuf = [];
    let listOpen = false;

    const flushList = () => {
        if (listOpen) {
            out.push('</ul>');
            listOpen = false;
        }
    };

    const inlineFormat = (text) => escapeHtml(text)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.+?)__/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');

    for (const rawLine of lines) {
        const line = rawLine ?? '';

        if (line.trim().startsWith('```')) {
            flushList();
            if (inCode) {
                out.push(`<pre class="rg-dv-md-pre"><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`);
                codeBuf = [];
                inCode = false;
            } else {
                inCode = true;
            }
            continue;
        }

        if (inCode) {
            codeBuf.push(line);
            continue;
        }

        if (!line.trim()) {
            flushList();
            continue;
        }

        if (/^#{1,4}\s+/.test(line)) {
            flushList();
            const level = line.match(/^#+/)[0].length;
            const tag = level <= 2 ? 'h2' : level === 3 ? 'h3' : 'h4';
            out.push(`<${tag}>${inlineFormat(line.replace(/^#{1,4}\s+/, ''))}</${tag}>`);
            continue;
        }

        if (/^[-*]\s+/.test(line)) {
            if (!listOpen) {
                out.push('<ul>');
                listOpen = true;
            }
            out.push(`<li>${inlineFormat(line.replace(/^[-*]\s+/, ''))}</li>`);
            continue;
        }

        flushList();
        out.push(`<p>${inlineFormat(line)}</p>`);
    }

    flushList();
    if (inCode && codeBuf.length) {
        out.push(`<pre class="rg-dv-md-pre"><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`);
    }

    return `<div class="rg-dv-md">${out.join('')}</div>`;
}

function formatJsonPreview(text) {
    try {
        return `<pre class="rg-dv-md-pre">${escapeHtml(JSON.stringify(JSON.parse(text), null, 2))}</pre>`;
    } catch {
        return `<pre class="rg-dv-md-pre">${escapeHtml(text)}</pre>`;
    }
}

function formatPreviewHtml(text, format) {
    if (format === 'json') return formatJsonPreview(text);
    if (format === 'markdown') return simpleMarkdownToHtml(text);
    return `<pre class="rg-dv-md-pre">${escapeHtml(text)}</pre>`;
}

function ensureReportPreview(root) {
    let preview = root.querySelector('[data-dv-preview]');
    if (preview) return preview;

    preview = document.createElement('div');
    preview.className = 'rg-dv-preview';
    preview.dataset.dvPreview = '';
    preview.hidden = true;
    preview.innerHTML = `
      <div class="rg-dv-preview-panel" role="dialog" aria-modal="true" aria-labelledby="rg-dv-preview-title">
        <header class="rg-dv-preview-head">
          <div style="min-width:0">
            <h3 id="rg-dv-preview-title">${escapeHtml(label('devVault.previewTitle', 'Podgląd raportu'))}</h3>
            <p class="rg-dv-preview-meta" data-dv-preview-meta></p>
          </div>
          <button type="button" class="rg-dv-secondary" data-dv-preview-close>${label('devVault.close', 'Zamknij')}</button>
        </header>
        <div class="rg-dv-preview-body" data-dv-preview-body></div>
      </div>
    `;

    const shell = root.querySelector('.rg-dcc-shell');
    (shell || root).appendChild(preview);

    const close = () => closeReportPreview(root);
    preview.querySelector('[data-dv-preview-close]')?.addEventListener('click', close);
    preview.addEventListener('click', (e) => {
        if (e.target === preview) close();
    });
    if (!preview.dataset.boundEscape) {
        preview.dataset.boundEscape = '1';
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            const active = document.getElementById(ROOT_ID)?.querySelector('[data-dv-preview]:not([hidden])');
            if (active) closeReportPreview(document.getElementById(ROOT_ID));
        });
    }

    return preview;
}

function closeReportPreview(root) {
    const preview = root?.querySelector?.('[data-dv-preview]')
        || document.getElementById(ROOT_ID)?.querySelector('[data-dv-preview]');
    if (!preview) return;
    preview.hidden = true;
    const body = preview.querySelector('[data-dv-preview-body]');
    if (body) body.innerHTML = '';
}

async function openReportPreview(root, entry) {
    if (!root || !entry) return;

    const preview = ensureReportPreview(root);
    const titleEl = preview.querySelector('#rg-dv-preview-title');
    const metaEl = preview.querySelector('[data-dv-preview-meta]');
    const bodyEl = preview.querySelector('[data-dv-preview-body]');

    const displayTitle = entry.title || entry.name || entry.rel || label('devVault.previewTitle', 'Podgląd raportu');
    if (titleEl) titleEl.textContent = displayTitle;
    if (metaEl) {
        metaEl.textContent = entry.kind === 'system'
            ? `system · ${entry.systemEntry?.source || 'healing'}`
            : String(entry.rel || '').replace(/^\//, '');
    }
    if (bodyEl) {
        bodyEl.innerHTML = `<p class="rg-dv-preview-loading">${escapeHtml(label('devVault.loading', 'Ładowanie…'))}</p>`;
    }

    preview.hidden = false;
    preview.querySelector('[data-dv-preview-close]')?.focus();

    const result = await loadStreamEntryPreview(entry);
    if (!bodyEl) return;

    if (!result.ok || !result.text) {
        bodyEl.innerHTML = `<p class="rg-dv-preview-err">${escapeHtml(label('devVault.reportMissing', 'Brak lokalnego raportu. Uruchom CLI, potem odśwież.'))}</p>`;
        return;
    }

    bodyEl.innerHTML = formatPreviewHtml(result.text, result.format);
}

function bindUnifiedReportListActions(root, body, stream, { onMutated } = {}) {
    const byId = new Map((stream || []).map((entry) => [String(entry.streamId), entry]));

    body.querySelectorAll('[data-dv-open-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const entry = byId.get(btn.getAttribute('data-dv-open-id'));
            if (!entry) {
                showToast('Nie znaleziono wpisu raportu', 'error');
                return;
            }
            void openReportPreview(root, entry);
        });
    });

    body.querySelectorAll('[data-dv-copy-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const entry = byId.get(btn.getAttribute('data-dv-copy-id'));
            if (entry) void copyStreamEntry(entry);
        });
    });

    body.querySelectorAll('[data-dv-del-id]').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const entry = byId.get(btn.getAttribute('data-dv-del-id'));
            if (!entry) return;
            const labelPath = entry.rel || entry.title || entry.name || 'wpis';
            const ok = window.confirm(`Usunąć raport?\n${labelPath}`);
            if (!ok) return;
            const r = await deleteStreamEntry(entry);
            if (r.offline) return;
            if (r.ok) {
                showToast('Raport usunięty');
                closeReportPreview(root);
                onMutated?.();
            } else {
                showToast(r.data?.reason || 'Nie usunięto', 'error');
            }
        });
    });

    body.querySelectorAll('[data-dv-apply-id]').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const entry = byId.get(btn.getAttribute('data-dv-apply-id'));
            if (!entry || btn.disabled) return;
            btn.disabled = true;
            const result = await applyStreamSuggestion(entry);
            if (result.ok) {
                showToast(result.message || (result.applied ? 'Zmiana wprowadzona' : 'Gotowe do wdrożenia'));
                closeReportPreview(root);
                onMutated?.();
            } else {
                showToast('Nie udało się zatwierdzić sugestii', 'error');
                btn.disabled = false;
            }
        });
    });

    body.querySelectorAll('[data-dv-reject-id]').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const entry = byId.get(btn.getAttribute('data-dv-reject-id'));
            if (!entry) return;
            const r = await rejectStreamSuggestion(entry);
            if (r.ok) {
                showToast('Sugestia odrzucona');
                closeReportPreview(root);
                onMutated?.();
            } else {
                showToast('Nie udało się odrzucić', 'error');
            }
        });
    });
}

function clearLocalDeveloperReports() {
    try {
        localStorage.removeItem(SELF_HEALING_LOG_KEY);
        localStorage.removeItem(HEALING_REPORT_KEY);
        localStorage.removeItem(HEALTH_REPORT_STORAGE_KEY);
        return true;
    } catch {
        return false;
    }
}

async function handleClearOldReports(body) {
    const confirmed = window.confirm(
        label('devVault.clearReportsConfirm', 'Czy na pewno chcesz usunąć wszystkie raporty?')
    );
    if (!confirmed) return;

    if (!clearLocalDeveloperReports()) {
        showToast(label('devVault.clearReportsFail', 'Nie udało się wyczyścić raportów.'), 'error');
        return;
    }

    const root = document.getElementById(ROOT_ID);
    closeReportPreview(root);
    showToast(label('devVault.clearReportsDone', '🧹 Wszystkie raporty zostały wyczyszczone.'));
    await renderDeveloperDashboard(body);
}

async function renderDeveloperDashboard(body) {
    body.innerHTML = `<p class="lead">${label('devVault.loading', 'Ładowanie…')}</p>`;

    const [sources, stream] = await Promise.all([
        loadDevStatusBoardSources(),
        loadUnifiedReportStream()
    ]);
    const board = buildDevStatusBoard(sources);
    const visibleStream = filterDismissedStreamEntries(
        filterDeveloperVaultStream(stream, { showAll: showAllReports })
    );
    await enrichStreamEntriesWithDescriptions(visibleStream);
    const hiddenCount = stream.length - visibleStream.length;
    const rows = visibleStream.map((entry) => unifiedReportRowHtml(entry)).join('');
    const filterNote = showAllReports
        ? `Pełna lista (${stream.length} wpisów).`
        : hiddenCount > 0
            ? `Widoczne: ${visibleStream.length} z ${stream.length} (ukryto ${hiddenCount} wpisów technicznych).`
            : `Widoczne: ${visibleStream.length} wpisów (FIXED · SUGGESTION · INFO · FAILED).`;

    body.innerHTML = `
      ${renderSystemHealthTilesHtml(board, stream.length)}
      <div class="rg-dv-metrics-divider" aria-hidden="true"></div>
      <div class="rg-dcc-section">
        <h3>Raporty</h3>
        <p class="lead">${label('devVault.reportsHint', 'Tylko istotne statusy: naprawione, sugestie, info UI/UX i błędy. Auto-czyszczenie wpisów starszych niż 30 dni.')}</p>
        <div class="rg-dv-report-filter-row">
          <p class="rg-dv-report-filter-note" role="status">${escapeHtml(filterNote)}</p>
          <div class="rg-dv-report-filter-actions">
            <button type="button" class="rg-dv-report-show-all" data-dv-report-show-all aria-pressed="${showAllReports ? 'true' : 'false'}">
              ${showAllReports ? 'Pokaż tylko istotne' : 'Pokaż wszystko'}
            </button>
            <button type="button" class="rg-dv-clear-reports" data-dv-clear-reports>
              ${label('devVault.clearReports', '🧹 Wyczyść stare raporty')}
            </button>
          </div>
        </div>
        ${rows
            ? `<ul class="rg-dv-report-list">${rows}</ul>`
            : `<p class="rg-dv-report-empty" role="status">${showAllReports || !hiddenCount
                ? 'Brak raportów do wyświetlenia.'
                : 'Brak istotnych raportów — włącz „Pokaż wszystko”, aby zobaczyć wpisy techniczne.'}</p>`}
      </div>
    `;

    const root = document.getElementById(ROOT_ID);
    bindUnifiedReportListActions(root, body, visibleStream, {
        onMutated: () => { void renderDeveloperDashboard(body); }
    });

    body.querySelector('[data-dv-report-show-all]')?.addEventListener('click', () => {
        showAllReports = !showAllReports;
        void renderDeveloperDashboard(body);
    });

    body.querySelector('[data-dv-clear-reports]')?.addEventListener('click', () => {
        void handleClearOldReports(body);
    });

    const refresh = () => { void renderDeveloperDashboard(body); };
    body.querySelector('[data-dv-dashboard-refresh]')?.addEventListener('click', refresh);
    const openErrorFeed = async () => {
        try {
            const mod = await import('./runtimeErrorFeed.js');
            await mod.openRuntimeErrorFeedPanel();
        } catch {
            showToast('Nie udało się otworzyć Error Feed');
        }
    };
    body.querySelectorAll('[data-dv-error-feed]').forEach((el) => {
        el.addEventListener('click', () => { void openErrorFeed(); });
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                void openErrorFeed();
            }
        });
    });
    body.querySelector('[data-dv-health-run]')?.addEventListener('click', async () => {
        try {
            await runHealthCheck({ reason: 'dev-vault' });
            showToast(label('devVault.healthRefresh', 'Odśwież Health'));
        } catch { /* ignore */ }
        refresh();
    });
}

function label(key, fallback) {
    const v = t(key);
    return v === key ? fallback : v;
}

function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatDate(iso) {
    if (!iso) return '—';
    try {
        const d = new Date(iso);
        if (!Number.isFinite(d.getTime())) return String(iso).slice(0, 10);
        return d.toLocaleString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch {
        return String(iso).slice(0, 16);
    }
}

function stripMainUiDevTools() {
    document.getElementById('rg-health-monitor-root')?.remove();
    document.getElementById('rg-dev-dashboard-root')?.remove();
}

function ensureRoot() {
    ensureStyles();
    let root = document.getElementById(ROOT_ID);
    if (root) return root;
    root = document.createElement('div');
    root.id = ROOT_ID;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'Developer Control Center');
    root.hidden = true;
    document.body.appendChild(root);
    return root;
}

function closeVaultUi() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    closeReportPreview(root);
    root.classList.remove('open');
    root.hidden = true;
    root.innerHTML = '';
}

async function showHub() {
    const root = ensureRoot();
    root.hidden = false;
    root.classList.add('open');
    stripMainUiDevTools();

    const verShort = String(APP_VERSION || '1.0.0').replace(/^(\d+\.\d+).*/, '$1');
    root.innerHTML = `
      <div class="rg-dcc-shell" role="document">
        <header class="rg-dcc-top">
          <h2>${escapeHtml(APP_NAME)}</h2>
          <p class="rg-dcc-sub">Version ${escapeHtml(verShort)} · Panel deweloperski · Status &amp; Raporty</p>
        </header>
        <div class="rg-dcc-body" data-dv-body></div>
        <footer class="rg-dcc-foot">
          <button type="button" class="rg-dv-secondary" data-dv-lock>${label('devVault.lock', 'Zablokuj')}</button>
          <button type="button" class="rg-dv-secondary" data-dv-close>${label('devVault.close', 'Zamknij')}</button>
        </footer>
      </div>
    `;

    const body = root.querySelector('[data-dv-body]');
    root.querySelector('[data-dv-close]')?.addEventListener('click', closeVaultUi);
    root.querySelector('[data-dv-lock]')?.addEventListener('click', () => {
        lockDevVault();
        stripMainUiDevTools();
        closeVaultUi();
        showToast(label('devVault.locked', 'Panel zablokowany'));
    });

    await renderDeveloperDashboard(body);
}

function bindOwnerLockReset(button) {
    if (!button) return;
    const HOLD_MS = 3000;
    let holdTimer = null;
    let resetTriggered = false;

    const clearHold = () => {
        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;
        }
    };

    button.addEventListener('pointerdown', () => {
        resetTriggered = false;
        clearHold();
        holdTimer = setTimeout(() => {
            holdTimer = null;
            resetTriggered = true;
            resetDevVaultLock();
            showToast('Blokada dostępu zresetowana');
            showPasswordGate();
        }, HOLD_MS);
    });
    button.addEventListener('pointerup', clearHold);
    button.addEventListener('pointerleave', clearHold);
    button.addEventListener('pointercancel', clearHold);
    button.addEventListener('click', (e) => {
        if (!resetTriggered) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        resetTriggered = false;
    }, true);
}

function showPasswordGate() {
    const root = ensureRoot();
    root.hidden = false;
    root.classList.add('open');

    if (isDevVaultAccessLocked()) {
        root.innerHTML = `
      <div class="rg-dv-card">
        <h2>Developer Control Center</h2>
        <p class="rg-dv-lock-msg" role="alert">${escapeHtml(getDevVaultLockMessage())}</p>
        <div class="rg-dv-actions">
          <button type="button" class="rg-dv-secondary" data-dv-cancel>${label('devVault.cancel', 'Anuluj')}</button>
        </div>
      </div>
    `;
        const cancelBtn = root.querySelector('[data-dv-cancel]');
        cancelBtn?.addEventListener('click', closeVaultUi);
        bindOwnerLockReset(cancelBtn);
        return;
    }

    const pinMask = escapeHtml(DEV_VAULT_PIN_MASK);
    root.innerHTML = `
      <div class="rg-dv-card">
        <h2>Developer Control Center</h2>
        <p>${label('devVault.passwordPrompt', 'Wpisz hasło, aby odblokować narzędzia Dev / Health.')}</p>
        <span class="rg-dv-pin-visual" aria-hidden="true">${pinMask}</span>
        <p class="rg-dv-err" data-dv-err hidden></p>
        <input type="password" inputmode="numeric" autocomplete="off" data-dv-pass
          aria-label="${label('devVault.password', 'Hasło')}"
          placeholder="${pinMask}" maxlength="24">
        <div class="rg-dv-actions">
          <button type="button" class="rg-dv-primary" data-dv-submit>${label('devVault.unlock', 'Odblokuj')}</button>
          <button type="button" class="rg-dv-secondary" data-dv-cancel>${label('devVault.cancel', 'Anuluj')}</button>
        </div>
      </div>
    `;

    const input = root.querySelector('[data-dv-pass]');
    const err = root.querySelector('[data-dv-err]');
    const submit = () => {
        const result = unlockDevVault(input?.value);
        if (!result.ok) {
            if (result.reason === 'locked') {
                showPasswordGate();
                return;
            }
            if (err) {
                err.hidden = false;
                err.textContent = label('devVault.badPassword', 'Nieprawidłowe hasło');
            }
            input?.focus();
            input?.select?.();
            return;
        }
        showToast(label('devVault.unlockedToast', 'Panel odblokowany'));
        try {
            document.dispatchEvent(new CustomEvent('rg:dev-vault-unlocked'));
        } catch {
            /* ignore */
        }
        void ensureDiagnosticsLoaded('vault-unlock').then(() => showHub());
    };
    const cancelBtn = root.querySelector('[data-dv-cancel]');
    root.querySelector('[data-dv-submit]')?.addEventListener('click', submit);
    cancelBtn?.addEventListener('click', closeVaultUi);
    bindOwnerLockReset(cancelBtn);
    input?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submit();
        if (e.key === 'Escape') closeVaultUi();
    });
    input?.focus();
}

/** Wejście z menu ☰ */
export function openDeveloperVault() {
    if (isDevVaultUnlocked()) {
        void ensureDiagnosticsLoaded('vault-open').then(() => showHub());
        return;
    }
    showPasswordGate();
}

export function initDeveloperVault() {
    if (bound) return;
    bound = true;
    stripMainUiDevTools();
    window.__RG_DEV_VAULT__ = {
        open: openDeveloperVault,
        unlock: unlockDevVault,
        lock: lockDevVault,
        unlocked: isDevVaultUnlocked,
        accessGranted: isDeveloperAccessGranted,
        resetLock: resetDevVaultLock,
        isAccessLocked: isDevVaultAccessLocked
    };
}
