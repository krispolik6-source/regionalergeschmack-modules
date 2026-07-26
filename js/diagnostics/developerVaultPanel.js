/**
 * ETAP 34A / 34C — Developer Control Center (UI)
 * Panel wyłącznie dla właściciela (PIN).
 * 34C: zarządzanie raportami (kopiuj / usuń / utrzymanie) — tylko docs/.
 * Bez nowych silników · bez autoApply/autoFix · bez zmian Home/Map/app.js.
 */

import { t } from '../core/i18n.js';
import { showToast } from '../core/toast.js';
import {
    isDevVaultUnlocked,
    unlockDevVault,
    lockDevVault
} from './devVault.js';
import { openHealthDevPanel } from './healthDevPanel.js';
import { initDeveloperDashboard, openDeveloperDashboard } from './developerDashboard.js';
import { getLastHealthReport, runHealthCheck } from './healthMonitor.js';
import {
    catalogEntry,
    copyReportToClipboard,
    deleteReportPath,
    cleanupReports,
    refreshReportsIndex,
    loadDocsStats,
    loadReportsIndex,
    isReportApiOnline
} from './reportManagerClient.js';
import { renderMemoryCleanerCard } from './memoryCleaner.js';
import {
    buildDevStatusBoardView,
    DEV_STATUS_BOARD_CSS
} from './devStatusBoard.js';
import { APP_NAME, APP_VERSION } from '../config.js';

const ROOT_ID = 'rg-dev-vault-root';
const STYLE_ID = 'rg-dev-vault-style';

let bound = false;

function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
#${ROOT_ID}{position:fixed;inset:0;z-index:100050;display:none;align-items:stretch;justify-content:center;padding:0;background:rgba(20,28,22,.62);backdrop-filter:blur(4px);font-family:'Source Sans 3',system-ui,sans-serif;color:#1c1812}
#${ROOT_ID}.open{display:flex}
#${ROOT_ID} *{box-sizing:border-box}
#${ROOT_ID} .rg-dcc-shell{width:min(920px,100%);max-height:100%;margin:auto;display:flex;flex-direction:column;background:#f5efe3;border-radius:0;box-shadow:0 20px 60px rgba(0,0,0,.35);overflow:hidden;border:1px solid rgba(42,63,40,.22)}
@media(min-width:640px){#${ROOT_ID}{padding:16px;align-items:center}#${ROOT_ID} .rg-dcc-shell{max-height:min(92vh,820px);border-radius:18px}}
#${ROOT_ID} .rg-dcc-top{flex:0 0 auto;background:linear-gradient(180deg,#1e3220 0%,#2a3f28 55%,#243d28 100%);color:#f5efe3;padding:14px 16px 12px;border-bottom:2px solid #c9a227}
#${ROOT_ID} .rg-dcc-top h2{margin:0;font-family:Literata,Georgia,serif;font-size:clamp(1.15rem,4vw,1.45rem);font-weight:700;letter-spacing:.01em}
#${ROOT_ID} .rg-dcc-top .rg-dcc-sub{margin:4px 0 0;font-size:.82rem;opacity:.88;line-height:1.35}
#${ROOT_ID} .rg-dcc-scores{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}
@media(min-width:520px){#${ROOT_ID} .rg-dcc-scores{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media(min-width:800px){#${ROOT_ID} .rg-dcc-scores{grid-template-columns:repeat(8,minmax(0,1fr))}}
#${ROOT_ID} .rg-dcc-score{background:rgba(0,0,0,.22);border:1px solid rgba(201,162,39,.35);border-radius:12px;padding:8px 8px 7px;min-width:0}
#${ROOT_ID} .rg-dcc-score .k{display:block;font-size:.68rem;text-transform:uppercase;letter-spacing:.04em;opacity:.8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#${ROOT_ID} .rg-dcc-score .v{display:block;font-family:Literata,Georgia,serif;font-size:1.15rem;font-weight:700;margin-top:2px;color:#e8c97a}
#${ROOT_ID} .rg-dcc-score.rg-dcc-score--warn .v{color:#f0d78a}
#${ROOT_ID} .rg-dcc-score.rg-dcc-score--fail .v{color:#f5b5b5}
#${ROOT_ID} .rg-dcc-score.rg-dcc-score--ok .v{color:#c8e6c0}
#${ROOT_ID} .rg-dcc-meta{margin-top:8px;font-size:.75rem;opacity:.85}
#${ROOT_ID} .rg-dcc-nav{flex:0 0 auto;display:flex;gap:4px;overflow-x:auto;padding:8px 10px;background:rgba(42,63,40,.06);border-bottom:1px solid rgba(42,63,40,.12);-webkit-overflow-scrolling:touch;scrollbar-width:thin}
#${ROOT_ID} .rg-dcc-nav button{flex:0 0 auto;border:1px solid rgba(42,63,40,.22);background:#fffef8;color:#2a3f28;border-radius:999px;padding:7px 12px;font-weight:700;font-size:.82rem;cursor:pointer;white-space:nowrap}
#${ROOT_ID} .rg-dcc-nav button.active{background:#2a3f28;color:#f5efe3;border-color:#2a3f28}
#${ROOT_ID} .rg-dcc-body{flex:1 1 auto;overflow:auto;padding:14px 16px 18px;min-height:200px;-webkit-overflow-scrolling:touch}
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
#${ROOT_ID} .rg-dcc-grid{display:grid;gap:10px;grid-template-columns:1fr}
@media(min-width:560px){#${ROOT_ID} .rg-dcc-grid{grid-template-columns:1fr 1fr}}
#${ROOT_ID} .rg-dcc-tile{background:#fffef8;border:1px solid rgba(42,63,40,.14);border-radius:12px;padding:12px;min-height:72px}
#${ROOT_ID} .rg-dcc-tile h4{margin:0 0 4px;font-size:.95rem;color:#2a3f28}
#${ROOT_ID} .rg-dcc-tile p{margin:0;font-size:.82rem;color:#4a3f32;line-height:1.35}
#${ROOT_ID} .rg-dcc-tile .rg-dcc-tile-val{font-family:Literata,Georgia,serif;font-size:1.4rem;font-weight:700;color:#2a3f28;margin:4px 0}
#${ROOT_ID} .rg-dv-report-list{list-style:none;padding:0;margin:0}
#${ROOT_ID} .rg-dv-report-list li{display:flex;align-items:flex-start;gap:10px;padding:12px 0;border-bottom:1px solid rgba(42,63,40,.12)}
#${ROOT_ID} .rg-dv-report-list li:last-child{border-bottom:0}
#${ROOT_ID} .rg-dv-report-ico{flex:0 0 auto;font-size:1.15rem;line-height:1.2}
#${ROOT_ID} .rg-dcc-pre{white-space:pre-wrap;font-size:.85rem;line-height:1.45;background:rgba(255,255,255,.7);border-radius:10px;padding:10px;border:1px solid rgba(42,63,40,.1);max-height:40vh;overflow:auto}
#${ROOT_ID} .rg-dv-err{color:#8a2b2b;font-size:.9rem;margin:0 0 8px}
#${ROOT_ID} .rg-dcc-badge{display:inline-block;padding:2px 8px;border-radius:999px;font-size:.72rem;font-weight:700;background:rgba(201,162,39,.2);color:#2a3f28}
#${ROOT_ID} .rg-dcc-badge.warn{background:rgba(201,162,39,.35)}
#${ROOT_ID} .rg-dcc-badge.fail{background:rgba(180,60,60,.2);color:#6b1d1d}
#${ROOT_ID} .rg-dcc-btn-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
#${ROOT_ID} .rg-dcc-btn-row button{font-size:.82rem;padding:7px 10px}
#${ROOT_ID} .rg-dcc-danger{background:transparent;color:#6b1d1d;border:1px solid rgba(140,40,40,.35)!important}
#${ROOT_ID} .rg-dcc-stats{display:grid;gap:8px;grid-template-columns:1fr 1fr;margin:10px 0 14px}
#${ROOT_ID} .rg-dcc-file-list{list-style:none;padding:0;margin:10px 0 0;max-height:36vh;overflow:auto}
#${ROOT_ID} .rg-dcc-file-list li{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid rgba(42,63,40,.1);font-size:.82rem}
#${ROOT_ID} .rg-dcc-file-list .path{flex:1 1 160px;min-width:0;word-break:break-all;color:#2a3f28}
#${ROOT_ID} .rg-dcc-api{font-size:.78rem;color:#4a3f32;margin:0 0 10px}
${DEV_STATUS_BOARD_CSS}
`;
    document.head.appendChild(style);
}

function reportRowHtml(entry) {
    const pathHint = (entry.md || '').replace(/^\//, '');
    return `
      <li>
        <span class="rg-dv-report-ico" aria-hidden="true">${entry.ico}</span>
        <div style="flex:1;min-width:0">
          <strong>${escapeHtml(entry.title)}</strong>
          <p style="margin:4px 0 0;color:#4a3f32;font-size:.82rem">${escapeHtml(pathHint)}</p>
          <div class="rg-dcc-btn-row">
            <button type="button" class="rg-dv-secondary" data-dv-report="${entry.key}">${label('devVault.openReport', 'Otwórz')}</button>
            <button type="button" class="rg-dv-secondary" data-dv-copy-report="${entry.key}">📋 Kopiuj raport</button>
            <button type="button" class="rg-dcc-danger" data-dv-del-report="${entry.key}">🗑 Usuń raport</button>
          </div>
        </div>
      </li>`;
}

function bindReportListActions(body) {
    const detail = body.querySelector('[data-dv-report-detail]');
    body.querySelectorAll('[data-dv-report]').forEach((btn) => {
        btn.addEventListener('click', () => {
            void renderReportSource(detail, btn.getAttribute('data-dv-report'));
        });
    });
    body.querySelectorAll('[data-dv-copy-report]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const entry = catalogEntry(btn.getAttribute('data-dv-copy-report'));
            if (entry) void copyReportToClipboard(entry);
        });
    });
    body.querySelectorAll('[data-dv-del-report]').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const entry = catalogEntry(btn.getAttribute('data-dv-del-report'));
            if (!entry) return;
            const relMd = entry.md.replace(/^\//, '');
            const relJson = entry.json.replace(/^\//, '');
            const ok = window.confirm(
                `Usunąć raport „${entry.title}”?\n\nZostaną usunięte (jeśli istnieją):\n• ${relMd}\n• ${relJson}\n\nTylko docs/. latest wymaga potwierdzenia.`
            );
            if (!ok) return;
            const r1 = await deleteReportPath(relMd, { allowLatest: true });
            const r2 = await deleteReportPath(relJson, { allowLatest: true });
            if (r1.offline || r2.offline) return;
            if (r1.ok || r2.ok) {
                showToast('Raport usunięty');
                if (detail) detail.textContent = 'Raport usunięty — odśwież listę w Utrzymanie.';
            } else {
                showToast(r1.data?.reason || r2.data?.reason || 'Nie usunięto', 'error');
            }
        });
    });
}

async function renderReportManagerPanel(host) {
    if (!host) return;

    const paint = async () => {
        const online = await isReportApiOnline();
        const stats = await loadDocsStats();
        const index = await loadReportsIndex();
        host.innerHTML = `
          <div class="rg-dcc-tile" style="margin-top:12px">
            <h4>Zarządzanie raportami</h4>
            <p class="rg-dcc-api">API lokalne: ${online ? '🟢 online (127.0.0.1:3457)' : '⚪ offline — uruchom npm run report-manager:api'}</p>
            <div class="rg-dcc-stats">
              <div><span class="k" style="font-size:.72rem;opacity:.8">Liczba raportów</span><div class="rg-dcc-tile-val">${escapeHtml(String(stats.reportCount ?? '—'))}</div></div>
              <div><span class="k" style="font-size:.72rem;opacity:.8">Rozmiar docs/</span><div class="rg-dcc-tile-val" style="font-size:1.15rem">${escapeHtml(stats.docsHuman || '—')}</div></div>
            </div>
            <div class="rg-dcc-btn-row">
              <button type="button" class="rg-dv-secondary" data-rm-refresh>Odśwież listę raportów</button>
              <button type="button" class="rg-dv-secondary" data-rm-size>Pokaż rozmiar katalogu docs</button>
              <button type="button" class="rg-dv-secondary" data-rm-count>Liczba wszystkich raportów</button>
              <button type="button" class="rg-dcc-danger" data-rm-old>Usuń stare raporty</button>
            </div>
            <p style="margin:10px 0 0;font-size:.8rem;color:#4a3f32">Auto-czyszczenie nie usuwa latest.md / latest.json. Nigdy: js/, css/, assets/, index.html, manifest.json, sw.js, package.json.</p>
            <ul class="rg-dcc-file-list" data-rm-files>
              ${(index.reports || []).slice(0, 80).map((f) => `
                <li>
                  <span class="path">${escapeHtml(f.rel)}${f.isLatest ? ' · latest' : ''}</span>
                  <button type="button" class="rg-dv-secondary" data-rm-copy="${escapeHtml(f.rel)}">📋 Kopiuj</button>
                  <button type="button" class="rg-dcc-danger" data-rm-del="${escapeHtml(f.rel)}">🗑 Usuń</button>
                </li>`).join('') || '<li>Brak listy — odśwież lub wygeneruj index (npm run report-manager).</li>'}
            </ul>
          </div>
        `;

        host.querySelector('[data-rm-refresh]')?.addEventListener('click', async () => {
            await refreshReportsIndex();
            await paint();
        });
        host.querySelector('[data-rm-size]')?.addEventListener('click', async () => {
            const s = await loadDocsStats();
            showToast(`docs/: ${s.docsHuman || '—'} (${s.docsBytes ?? 0} B)`);
        });
        host.querySelector('[data-rm-count]')?.addEventListener('click', async () => {
            const s = await loadDocsStats();
            showToast(`Raportów: ${s.reportCount ?? 0}`);
        });
        host.querySelector('[data-rm-old]')?.addEventListener('click', async () => {
            const choice = window.prompt(
                'Usuń stare raporty:\n1 = starsze niż 30 dni\n2 = pozostaw ostatnich 20 / moduł\n\nWpisz 1 lub 2 (latest.md/json bez zmian):',
                '1'
            );
            if (choice !== '1' && choice !== '2') return;
            const mode = choice === '2' ? 'keep-20' : 'older-30';
            const labelMode = mode === 'keep-20' ? 'pozostawić 20/moduł' : 'usunąć >30 dni';
            if (!window.confirm(`Na pewno ${labelMode}? Tylko docs/. latest.md/json zachowane.`)) return;
            const r = await cleanupReports(mode);
            if (r.offline) return;
            if (r.ok) {
                showToast(`Usunięto: ${r.data?.deletedCount ?? 0}`);
                await paint();
            } else {
                showToast(r.data?.reason || 'Cleanup nieudany', 'error');
            }
        });
        host.querySelectorAll('[data-rm-copy]').forEach((btn) => {
            btn.addEventListener('click', () => {
                void copyReportToClipboard(btn.getAttribute('data-rm-copy'));
            });
        });
        host.querySelectorAll('[data-rm-del]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const rel = btn.getAttribute('data-rm-del');
                if (!rel) return;
                const isLatest = /\/latest\.(md|json)$/i.test(rel);
                const msg = isLatest
                    ? `Usunąć LATEST?\n${rel}\n\nTo może wyczyścić score w Dashboard.`
                    : `Usunąć raport?\n${rel}`;
                if (!window.confirm(msg)) return;
                const r = await deleteReportPath(rel, { allowLatest: true });
                if (r.offline) return;
                if (r.ok) {
                    showToast('Raport usunięty');
                    await paint();
                } else {
                    showToast(r.data?.reason || 'Nie usunięto', 'error');
                }
            });
        });
    };

    await paint();
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

async function fetchJson(url) {
    try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

function num(...vals) {
    for (const v of vals) {
        if (typeof v === 'number' && !Number.isNaN(v)) return v;
    }
    return null;
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
    root.classList.remove('open');
    root.hidden = true;
    root.innerHTML = '';
}

/**
 * Agregacja score z istniejących raportów (bez nowych silników).
 */
async function loadControlCenterMetrics() {
    const healthLive = getLastHealthReport();
    const [
        healthDoc,
        brand,
        future,
        livingBrand,
        brain,
        reflect,
        intelligence,
        livingRegion,
        trust
    ] = await Promise.all([
        fetchJson('/docs/health/latest.json'),
        fetchJson('/docs/brand-protection/latest.json'),
        fetchJson('/docs/guardian-future/latest.json'),
        fetchJson('/docs/living-brand/latest.json'),
        fetchJson('/docs/product-brain/latest.json'),
        fetchJson('/docs/self-reflection/latest.json'),
        fetchJson('/docs/intelligence/latest.json'),
        fetchJson('/docs/living-region/latest.json'),
        fetchJson('/docs/trust/latest.json')
    ]);

    const health = healthLive || healthDoc;
    const healthScore = num(health?.overall);
    const performanceScore = num(health?.scores?.performance);
    const brandScore = num(
        livingBrand?.overall,
        brand?.status === 'PASS' || brand?.status === 'OK' ? 96 : null,
        brand?.status === 'WARNING' ? 78 : null,
        brand?.status === 'FAIL' ? 40 : null
    );
    const futureScore = num(future?.futureScore, future?.summary?.futureScore);
    const brainScore = num(brain?.brainScore);
    const reflectScore = num(reflect?.scores?.overall);
    const regionScore = num(intelligence?.regionScore);
    const pulse = num(livingRegion?.regionPulse);
    const trustAvg = num(trust?.summary?.averageTrustScore);

    const parts = [healthScore, performanceScore, brandScore, futureScore, brainScore, reflectScore]
        .filter((n) => n != null);
    const overall = parts.length
        ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length)
        : null;

    const warn = num(brand?.summary?.warning, 0) ?? 0;
    const fail = num(brand?.summary?.fail, 0) ?? 0;
    const healthFindings = Array.isArray(health?.findings) ? health.findings : [];
    const warnExtra = healthFindings.filter((f) => /warn|medium/i.test(String(f.severity || ''))).length;
    const failExtra = healthFindings.filter((f) => /fail|critical|high/i.test(String(f.severity || ''))).length;

    const dates = [
        health?.generatedAt,
        brand?.generatedAt,
        future?.generatedAt,
        brain?.generatedAt,
        intelligence?.generatedAt,
        livingRegion?.generatedAt
    ].filter(Boolean).map((d) => Date.parse(d)).filter((t) => Number.isFinite(t));
    const lastTs = dates.length ? Math.max(...dates) : null;

    return {
        overall,
        health: healthScore,
        performance: performanceScore,
        brand: brandScore,
        future: futureScore,
        warnings: warn + warnExtra,
        fails: fail + failExtra,
        lastReportAt: lastTs ? new Date(lastTs).toISOString() : null,
        extras: {
            brainScore,
            reflectScore,
            regionScore,
            pulse,
            trustAvg,
            brandStatus: brand?.status || null,
            futureStatus: future?.status || future?.summary?.status || null
        },
        raw: { health, brand, future, brain, reflect, intelligence, livingRegion, trust, livingBrand }
    };
}

function scoreClass(value, warnAt = 80, failAt = 55) {
    if (value == null) return '';
    if (value < failAt) return 'rg-dcc-score--fail';
    if (value < warnAt) return 'rg-dcc-score--warn';
    return 'rg-dcc-score--ok';
}

function renderScoreStrip(metrics) {
    const cells = [
        { k: 'Overall', v: metrics.overall, cls: scoreClass(metrics.overall) },
        { k: 'Health', v: metrics.health, cls: scoreClass(metrics.health) },
        { k: 'Performance', v: metrics.performance, cls: scoreClass(metrics.performance) },
        { k: 'Brand', v: metrics.brand, cls: scoreClass(metrics.brand, 85, 60) },
        { k: 'Future', v: metrics.future, cls: scoreClass(metrics.future, 75, 55) },
        { k: 'Warning', v: metrics.warnings, cls: metrics.warnings > 0 ? 'rg-dcc-score--warn' : 'rg-dcc-score--ok' },
        { k: 'Fail', v: metrics.fails, cls: metrics.fails > 0 ? 'rg-dcc-score--fail' : 'rg-dcc-score--ok' },
        { k: 'Ostatni raport', v: formatDate(metrics.lastReportAt), cls: '', raw: true }
    ];
    return cells.map((c) => `
      <div class="rg-dcc-score ${c.cls}">
        <span class="k">${escapeHtml(c.k)}</span>
        <span class="v">${c.raw ? escapeHtml(c.v) : escapeHtml(c.v == null ? '—' : String(c.v))}</span>
      </div>
    `).join('');
}

async function renderReportSource(body, tab) {
    const urls = {
        guardian: [
            '/docs/guardian-future/latest.json',
            '/tools/ai-guardian/reports/latest.json'
        ],
        dream: ['/docs/dream/latest.json'],
        brain: ['/docs/product-brain/latest.json'],
        health: ['/docs/health/latest.json'],
        brand: ['/docs/brand-protection/latest.json'],
        intelligence: ['/docs/intelligence/latest.json'],
        livingRegion: ['/docs/living-region/latest.json'],
        productIntel: ['/docs/product-intelligence/latest.json'],
        trust: ['/docs/trust/latest.json'],
        reflect: ['/docs/self-reflection/latest.json']
    };
    const list = urls[tab] || [];
    let data = null;
    let used = '';
    for (const u of list) {
        data = await fetchJson(u);
        if (data) {
            used = u;
            break;
        }
    }
    if (!data) {
        body.textContent = label(
            'devVault.reportMissing',
            'Brak lokalnego raportu. Uruchom CLI, potem odśwież.'
        );
        return;
    }

    if (tab === 'guardian') {
        const findings = data.findings || data.topFindings || data.alerts || data.predictions || [];
        const status = data.status || data.level || data.summary?.status || '—';
        body.textContent = [
            `Źródło: ${used}`,
            `Status: ${status}`,
            `Future Score: ${data.futureScore ?? data.summary?.futureScore ?? '—'}`,
            `Findings: ${Array.isArray(findings) ? findings.length : '—'}`,
            '',
            ...(Array.isArray(findings) ? findings : [])
                .slice(0, 12)
                .map((f) => `• [${f.severity || f.level || f.status || '?'}] ${f.title || f.headline || f.message || JSON.stringify(f)}`)
        ].join('\n');
        return;
    }

    if (tab === 'dream') {
        body.textContent = [
            `Źródło: ${used}`,
            data.headline || data.title || '',
            data.oneLiner || data.summary || '',
            '',
            JSON.stringify(data.reflection || data.answers || data.score || data, null, 2).slice(0, 3500)
        ].join('\n');
        return;
    }

    if (tab === 'brain' || tab === 'productIntel') {
        const proposals = data.proposals || data.items || [];
        body.textContent = [
            `Źródło: ${used}`,
            data.headline || data.title || 'Raport',
            data.summary?.tomorrowFocus ? `Focus: ${data.summary.tomorrowFocus}` : '',
            '',
            ...(Array.isArray(proposals) ? proposals : [])
                .slice(0, 5)
                .map((p, i) => `${i + 1}. ${p.title || p.text || JSON.stringify(p)}`)
        ].join('\n');
        return;
    }

    body.textContent = [
        `Źródło: ${used}`,
        data.title || data.id || '',
        `Wygenerowano: ${data.generatedAt || data.day || '—'}`,
        '',
        JSON.stringify({
            overall: data.overall ?? data.regionScore ?? data.regionPulse ?? data.brainScore ?? data.summary,
            status: data.status,
            scores: data.scores,
            summary: data.summary
        }, null, 2).slice(0, 4000)
    ].join('\n');
}

async function renderSection(body, section, metrics) {
    body.innerHTML = `<p class="lead">${label('devVault.loading', 'Ładowanie…')}</p>`;

    if (section === 'status') {
        try {
            const { board, html } = await buildDevStatusBoardView();
            body.innerHTML = `
              <div class="rg-dcc-section">
                ${html}
                <div class="rg-dsb-actions">
                  <button type="button" class="rg-dv-primary" data-dv-status-refresh>Odśwież Status</button>
                  <button type="button" class="rg-dv-secondary" data-dv-health-run>${label('devVault.healthRefresh', 'Odśwież Health')}</button>
                </div>
              </div>
            `;
            body.querySelector('[data-dv-status-refresh]')?.addEventListener('click', () => {
                void renderSection(body, 'status', metrics);
            });
            body.querySelector('[data-dv-health-run]')?.addEventListener('click', async () => {
                try {
                    await runHealthCheck({ reason: 'dev-vault-status' });
                } catch { /* ignore */ }
                const next = await loadControlCenterMetrics();
                updateScoreStrip(next);
                void renderSection(body, 'status', next);
            });
            // Sync header strip with board release/store
            const meta = document.querySelector(`#${ROOT_ID} [data-dcc-meta]`);
            if (meta) {
                meta.textContent = `${board.storeStatus.emoji} ${board.storeStatus.label} · Release ${board.rows.find((r) => r.key === 'Release')?.value ?? '—'}`;
            }
        } catch (e) {
            body.innerHTML = `<p class="rg-dv-err">Status board: ${escapeHtml(e?.message || e)}</p>`;
        }
        return;
    }

    if (section === 'dashboard') {
        const x = metrics.extras || {};
        body.innerHTML = `
          <div class="rg-dcc-section">
            <h3>Dashboard</h3>
            <p class="lead">Podgląd jakości z istniejących raportów. Bez automatycznych napraw.</p>
            <div class="rg-dcc-grid">
              <div class="rg-dcc-tile">
                <h4>Overall</h4>
                <div class="rg-dcc-tile-val">${metrics.overall ?? '—'}</div>
                <p>Średnia z dostępnych score (Health, Perf, Brand, Future, Brain, Reflect).</p>
              </div>
              <div class="rg-dcc-tile">
                <h4>Health / Performance</h4>
                <div class="rg-dcc-tile-val">${metrics.health ?? '—'} / ${metrics.performance ?? '—'}</div>
                <p>Źródło: Health Monitor / docs/health</p>
              </div>
              <div class="rg-dcc-tile">
                <h4>Brand</h4>
                <div class="rg-dcc-tile-val">${metrics.brand ?? '—'}</div>
                <p>Status: <span class="rg-dcc-badge ${(metrics.extras?.brandStatus || '').toLowerCase() === 'warning' ? 'warn' : ''}">${escapeHtml(x.brandStatus || '—')}</span></p>
              </div>
              <div class="rg-dcc-tile">
                <h4>Future</h4>
                <div class="rg-dcc-tile-val">${metrics.future ?? '—'}</div>
                <p>Guardian of the Future · ${escapeHtml(x.futureStatus || '—')}</p>
              </div>
              <div class="rg-dcc-tile">
                <h4>Inteligencja</h4>
                <p>Region Score ${x.regionScore ?? '—'} · Pulse ${x.pulse ?? '—'} · Brain ${x.brainScore ?? '—'}</p>
              </div>
              <div class="rg-dcc-tile">
                <h4>Trust / Reflect</h4>
                <p>Trust avg ${x.trustAvg ?? '—'} · Self Reflection ${x.reflectScore ?? '—'}</p>
              </div>
            </div>
            <div class="rg-dv-actions" style="margin-top:14px">
              <button type="button" class="rg-dv-primary" data-dv-health-run>${label('devVault.healthRefresh', 'Odśwież Health')}</button>
              <button type="button" class="rg-dv-secondary" data-dv-reload-metrics>Odśwież score</button>
            </div>
          </div>
        `;
        body.querySelector('[data-dv-health-run]')?.addEventListener('click', async () => {
            body.innerHTML = `<p class="lead">${label('devVault.loading', 'Ładowanie…')}</p>`;
            try {
                await runHealthCheck({ reason: 'dev-vault' });
            } catch { /* ignore */ }
            const next = await loadControlCenterMetrics();
            updateScoreStrip(next);
            void renderSection(body, 'dashboard', next);
        });
        body.querySelector('[data-dv-reload-metrics]')?.addEventListener('click', async () => {
            const next = await loadControlCenterMetrics();
            updateScoreStrip(next);
            void renderSection(body, 'dashboard', next);
        });
        return;
    }

    if (section === 'reports') {
        const keys = ['guardian', 'dream', 'brain', 'health', 'brand', 'reflect'];
        const rows = keys.map((k) => catalogEntry(k)).filter(Boolean).map((e) => reportRowHtml(e)).join('');
        body.innerHTML = `
          <div class="rg-dcc-section">
            <h3>Raporty</h3>
            <p class="lead">${label('devVault.reportsHint', 'Raporty diagnostyczne — otwórz, kopiuj lub usuń (tylko docs/).')}</p>
            <ul class="rg-dv-report-list">${rows}</ul>
            <div class="rg-dcc-pre" data-dv-report-detail style="margin-top:12px"></div>
          </div>
        `;
        bindReportListActions(body);
        return;
    }

    if (section === 'tools') {
        body.innerHTML = `
          <div class="rg-dcc-section">
            <h3>Narzędzia</h3>
            <p class="lead">${label('devVault.devHint', 'Istniejące narzędzia (bez nowych silników).')}</p>
            <div class="rg-dcc-grid">
              <div class="rg-dcc-tile">
                <h4>Developer Dashboard</h4>
                <p>Panel Dev (istniejący).</p>
                <div class="rg-dv-actions" style="margin-top:10px">
                  <button type="button" class="rg-dv-primary" data-dv-open-dev>${label('devVault.openDev', 'Otwórz Dev')}</button>
                </div>
              </div>
              <div class="rg-dcc-tile">
                <h4>Health Panel</h4>
                <p>${label('devVault.healthTitle', 'Zdrowie aplikacji')}</p>
                <div class="rg-dv-actions" style="margin-top:10px">
                  <button type="button" class="rg-dv-primary" data-dv-health-full>${label('devVault.healthOpen', 'Pełny panel Health')}</button>
                  <button type="button" class="rg-dv-secondary" data-dv-health-run>${label('devVault.healthRefresh', 'Odśwież Health')}</button>
                </div>
              </div>
            </div>
            <p style="margin-top:12px;color:#4a3f32;font-size:.85rem">Konsola: __RG_HEALTH__, __RG_DASHBOARD__, __RG_DAILY__, __RG_DEV_VAULT__</p>
          </div>
        `;
        body.querySelector('[data-dv-open-dev]')?.addEventListener('click', () => {
            closeVaultUi();
            try {
                initDeveloperDashboard({ force: true, showFab: false });
                openDeveloperDashboard?.();
            } catch (e) {
                console.warn('[DevVault] Dev dashboard:', e);
            }
        });
        body.querySelector('[data-dv-health-full]')?.addEventListener('click', () => {
            closeVaultUi();
            openHealthDevPanel();
        });
        body.querySelector('[data-dv-health-run]')?.addEventListener('click', async () => {
            try {
                await runHealthCheck({ reason: 'dev-vault' });
                showToast(label('devVault.healthRefresh', 'Odśwież Health'));
                const next = await loadControlCenterMetrics();
                updateScoreStrip(next);
            } catch { /* ignore */ }
        });
        return;
    }

    if (section === 'intelligence') {
        const keys = ['intelligence', 'livingRegion', 'productIntel', 'trust'];
        const rows = keys.map((k) => catalogEntry(k)).filter(Boolean).map((e) => reportRowHtml(e)).join('');
        body.innerHTML = `
          <div class="rg-dcc-section">
            <h3>Inteligencja</h3>
            <p class="lead">Moduły dyskretnej inteligencji — raporty (autoApply=false). Kopiuj / usuń tylko docs/.</p>
            <ul class="rg-dv-report-list">${rows}</ul>
            <div class="rg-dcc-pre" data-dv-report-detail style="margin-top:12px"></div>
          </div>
        `;
        bindReportListActions(body);
        return;
    }

    if (section === 'maintenance') {
        body.innerHTML = `
          <div class="rg-dcc-section">
            <h3>Utrzymanie</h3>
            <p class="lead">Sesja + zarządzanie raportami — bez autoFix / autoApply. Usuwanie tylko docs/ po potwierdzeniu.</p>
            <div class="rg-dcc-grid">
              <div class="rg-dcc-tile">
                <h4>Sesja panelu</h4>
                <p>PIN chroni dostęp. Zablokuj po zakończeniu pracy.</p>
                <div class="rg-dv-actions" style="margin-top:10px">
                  <button type="button" class="rg-dv-secondary" data-dv-lock>${label('devVault.lock', 'Zablokuj')}</button>
                </div>
              </div>
              <div class="rg-dcc-tile">
                <h4>Polityka</h4>
                <p>autoApply=false · autoFix=false · advisory only · raporty dla właściciela.</p>
                <p style="margin-top:8px"><span class="rg-dcc-badge">docs/intelligence/POLICY.md</span></p>
              </div>
              <div class="rg-dcc-tile">
                <h4>Warning / Fail</h4>
                <div class="rg-dcc-tile-val">${metrics.warnings} / ${metrics.fails}</div>
                <p>Z Brand Protection + Health findings (odczyt).</p>
              </div>
              <div class="rg-dcc-tile">
                <h4>FAB UI</h4>
                <p>Dev/Health nie pojawiają się jako FAB na Home/Mapie.</p>
                <div class="rg-dv-actions" style="margin-top:10px">
                  <button type="button" class="rg-dv-secondary" data-dv-strip-fab>Wyczyść FAB</button>
                </div>
              </div>
            </div>
            <div data-rm-panel></div>
            <div data-mc-panel></div>
          </div>
        `;
        body.querySelector('[data-dv-lock]')?.addEventListener('click', () => {
            lockDevVault();
            stripMainUiDevTools();
            closeVaultUi();
            showToast(label('devVault.locked', 'Panel zablokowany'));
        });
        body.querySelector('[data-dv-strip-fab]')?.addEventListener('click', () => {
            stripMainUiDevTools();
            showToast('FAB usunięte z UI');
        });
        void renderReportManagerPanel(body.querySelector('[data-rm-panel]'));
        void renderMemoryCleanerCard(body.querySelector('[data-mc-panel]'));
        return;
    }

    // info
    body.innerHTML = `
      <div class="rg-dcc-section">
        <h3>Informacje</h3>
        <p class="lead">Developer Control Center — panel właściciela (ETAP 34A).</p>
        <div class="rg-dcc-tile">
          <h4>Zakres</h4>
          <p>Wyłącznie organizacja i wygląd panelu. Bez nowych silników diagnostycznych. Bez zmian Home, Mapy, GPS, Premium, PWA, EventBus, app.js.</p>
        </div>
        <div class="rg-dcc-tile" style="margin-top:10px">
          <h4>Dostęp</h4>
          <p>PIN sesyjny (sessionStorage). Menu ☰ → Panel deweloperski.</p>
        </div>
        <div class="rg-dcc-tile" style="margin-top:10px">
          <h4>Ostatni raport (agregat)</h4>
          <p>${escapeHtml(formatDate(metrics.lastReportAt))}</p>
        </div>
      </div>
    `;
}

function updateScoreStrip(metrics) {
    const el = document.querySelector(`#${ROOT_ID} [data-dcc-scores]`);
    if (el) el.innerHTML = renderScoreStrip(metrics);
    const meta = document.querySelector(`#${ROOT_ID} [data-dcc-meta]`);
    if (meta) {
        meta.textContent = `Ostatni raport: ${formatDate(metrics.lastReportAt)} · Warning ${metrics.warnings} · Fail ${metrics.fails}`;
    }
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
          <p class="rg-dcc-sub">Version ${escapeHtml(verShort)} · Panel deweloperski · autoApply=false</p>
          <div class="rg-dcc-scores" data-dcc-scores>
            <div class="rg-dcc-score"><span class="k">Overall</span><span class="v">…</span></div>
          </div>
          <p class="rg-dcc-meta" data-dcc-meta>Ładowanie metryk…</p>
        </header>
        <nav class="rg-dcc-nav" role="tablist" aria-label="Sekcje Control Center">
          <button type="button" class="active" data-dv-tab="status">Status</button>
          <button type="button" data-dv-tab="dashboard">Dashboard</button>
          <button type="button" data-dv-tab="reports">Raporty</button>
          <button type="button" data-dv-tab="tools">Narzędzia</button>
          <button type="button" data-dv-tab="intelligence">Inteligencja</button>
          <button type="button" data-dv-tab="maintenance">Utrzymanie</button>
          <button type="button" data-dv-tab="info">Informacje</button>
        </nav>
        <div class="rg-dcc-body" data-dv-body></div>
        <footer class="rg-dcc-foot">
          <button type="button" class="rg-dv-secondary" data-dv-lock>${label('devVault.lock', 'Zablokuj')}</button>
          <button type="button" class="rg-dv-secondary" data-dv-close>${label('devVault.close', 'Zamknij')}</button>
        </footer>
      </div>
    `;

    const body = root.querySelector('[data-dv-body]');
    const tabs = [...root.querySelectorAll('[data-dv-tab]')];
    let metrics = {
        overall: null, health: null, performance: null, brand: null, future: null,
        warnings: 0, fails: 0, lastReportAt: null, extras: {}
    };

    const setTab = (name) => {
        tabs.forEach((b) => b.classList.toggle('active', b.dataset.dvTab === name));
        void renderSection(body, name, metrics);
    };

    tabs.forEach((b) => b.addEventListener('click', () => setTab(b.dataset.dvTab)));
    root.querySelector('[data-dv-close]')?.addEventListener('click', closeVaultUi);
    root.querySelector('[data-dv-lock]')?.addEventListener('click', () => {
        lockDevVault();
        stripMainUiDevTools();
        closeVaultUi();
        showToast(label('devVault.locked', 'Panel zablokowany'));
    });

    metrics = await loadControlCenterMetrics();
    updateScoreStrip(metrics);
    setTab('status');
}

function showPasswordGate() {
    const root = ensureRoot();
    root.hidden = false;
    root.classList.add('open');
    root.innerHTML = `
      <div class="rg-dv-card">
        <h2>Developer Control Center</h2>
        <p>${label('devVault.passwordPrompt', 'Wpisz hasło, aby odblokować narzędzia Dev / Health.')}</p>
        <p class="rg-dv-err" data-dv-err hidden></p>
        <input type="password" inputmode="numeric" autocomplete="off" data-dv-pass
          aria-label="${label('devVault.password', 'Hasło')}"
          placeholder="••••" maxlength="16">
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
            if (err) {
                err.hidden = false;
                err.textContent = label('devVault.badPassword', 'Nieprawidłowe hasło');
            }
            input?.focus();
            return;
        }
        showToast(label('devVault.unlockedToast', 'Panel odblokowany'));
        void showHub();
    };
    root.querySelector('[data-dv-submit]')?.addEventListener('click', submit);
    root.querySelector('[data-dv-cancel]')?.addEventListener('click', closeVaultUi);
    input?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submit();
        if (e.key === 'Escape') closeVaultUi();
    });
    input?.focus();
}

/** Wejście z menu ☰ */
export function openDeveloperVault() {
    if (isDevVaultUnlocked()) {
        void showHub();
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
        status: () => buildDevStatusBoardView()
    };
}
