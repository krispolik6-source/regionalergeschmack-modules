/**
 * ETAP 45B — Dev Status Board (panel w Menu → Panel deweloperski)
 *
 * Agreguje istniejące raporty / runtime guardians.
 * Tylko odczyt — bez auto-napraw, bez zmian architektury.
 */

import { APP_NAME, APP_VERSION } from '../config.js';
import { getLastHealthReport } from './healthMonitor.js';
import { getGuardianReports } from './consoleGuardian.js';
import { getUiGuardianFindings } from './uiGuardian.js';
import { getStorageHealth } from './memoryCleaner.js';
import { loadDocsStats } from './reportManagerClient.js';

function clamp(n) {
    if (n == null || Number.isNaN(Number(n))) return null;
    return Math.max(0, Math.min(100, Math.round(Number(n))));
}

function num(...vals) {
    for (const v of vals) {
        if (typeof v === 'number' && !Number.isNaN(v)) return v;
        if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return Number(v);
    }
    return null;
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

function brandToScore(brand, livingBrand) {
    const fromLiving = num(livingBrand?.overall, livingBrand?.score);
    if (fromLiving != null) return clamp(fromLiving);
    const st = String(brand?.status || '').toUpperCase();
    if (st === 'PASS' || st === 'OK') return 100;
    if (st === 'WARNING') return 85;
    if (st === 'FAIL') return 40;
    return null;
}

function verdictToScore(verdict, ok = 100, warn = 78, fail = 45) {
    const v = String(verdict || '').toUpperCase();
    if (!v) return null;
    if (v === 'PASS' || v === 'OK' || v === 'READY') return ok;
    if (v === 'WARNING' || v === 'WARN') return warn;
    if (v === 'FAIL' || v === 'ERROR' || v === 'NO') return fail;
    return null;
}

function scoreFromBools(flags = [], base = 100, penalty = 12) {
    let s = base;
    for (const ok of flags) {
        if (ok === false) s -= penalty;
    }
    return clamp(s);
}

function displayVersion(ver = APP_VERSION) {
    const m = String(ver || '1.0.0').match(/^(\d+\.\d+)/);
    return m ? m[1] : String(ver);
}

function formatStorageMb(bytes) {
    if (bytes == null || !Number.isFinite(bytes)) return null;
    const mb = bytes / (1024 * 1024);
    if (mb < 10) return `${mb.toFixed(1)} MB`;
    return `${Math.round(mb)} MB`;
}

/**
 * @param {object} sources
 */
export function buildDevStatusBoard(sources = {}) {
    const health = sources.health || null;
    const scores = health?.scores || {};
    const runtime = health?.runtime || {};

    const consoleReports = Array.isArray(sources.consoleReports) ? sources.consoleReports : [];
    const consoleErrors = Math.max(
        consoleReports.length,
        num(runtime.jsErrors, health?.runtime?.jsErrors, 0) || 0
    );

    const uiFindings = Array.isArray(sources.uiFindings) ? sources.uiFindings : [];
    const mapSnap = sources.mapSnapshot || null;
    const storage = sources.storage || null;
    const docsStats = sources.docsStats || null;
    const release = sources.release || null;
    const brand = sources.brand || null;
    const livingBrand = sources.livingBrand || null;
    const intelligence = sources.intelligence || null;
    const livingRegion = sources.livingRegion || null;
    const trust = sources.trust || null;
    const taste = sources.taste || null;
    const mapDoc = sources.mapGuardian || null;
    const uiDoc = sources.uiGuardian || null;
    const polish = sources.productionPolish || null;

    const healthScore = clamp(num(health?.overall));
    const performance = clamp(num(scores.performance));
    const brandScore = brandToScore(brand, livingBrand);
    const pwa = clamp(num(scores.pwa));
    const accessibility = clamp(num(scores.accessibility));

    const offline = clamp(
        num(
            scores.offline,
            runtime.pwa?.sw && (runtime.cache?.caches > 0 || runtime.pwa?.manifest) ? 100 : null,
            pwa
        )
    );

    const gps = clamp(
        num(
            scores.gps,
            mapSnap ? scoreFromBools([mapSnap.gpsOk !== false], 99, 35) : null
        )
    );

    const mapa = clamp(
        num(
            scores.map,
            verdictToScore(mapDoc?.verdict),
            mapSnap
                ? scoreFromBools([
                    mapSnap.leafletCdn !== false,
                    mapSnap.markersOk !== false,
                    mapSnap.tileLoaded !== false || mapSnap.panelHidden === true,
                    mapSnap.clusterOk !== false
                ], 99, 10)
                : null
        )
    );

    const ui = clamp(
        num(
            scores.ui,
            scores.ux,
            verdictToScore(uiDoc?.verdict),
            uiFindings.length === 0 ? 100 : Math.max(55, 100 - uiFindings.length * 4)
        )
    );

    const security = clamp(
        num(
            scores.security,
            consoleErrors === 0 && String(brand?.status || 'PASS').toUpperCase() !== 'FAIL'
                ? 100
                : consoleErrors === 0
                    ? 90
                    : Math.max(40, 100 - consoleErrors * 15)
        )
    );

    const warnings = Math.max(
        0,
        num(sources.warnings, 0)
            + (Array.isArray(health?.findings)
                ? health.findings.filter((f) => /warn|medium/i.test(String(f.severity || ''))).length
                : 0)
            + (uiFindings.length > 0 ? 1 : 0)
            + (num(polish?.warn, 0) || 0)
    );

    const reportsCount = num(
        docsStats?.reportCount,
        storage?.reports,
        consoleReports.length
    );

    const storageLabel = storage?.cacheHuman
        || formatStorageMb(num(storage?.cacheBytes, storage?.estimate?.usage, docsStats?.docsBytes));

    const releaseReady = (() => {
        const r = release?.readyForProduction ?? (release?.ready === true ? 'YES' : release?.ready === false ? 'NO' : null);
        if (r === 'YES' || r === true) return 'READY';
        if (r === 'NO' || r === false) return 'NOT READY';
        const score = num(release?.releaseScore, release?.summary?.score);
        if (score != null) return score >= 90 ? 'READY' : 'NOT READY';
        if (healthScore != null && healthScore >= 95 && consoleErrors === 0) return 'READY';
        return '—';
    })();

    const regionBrain = clamp(num(intelligence?.regionScore, intelligence?.signals?.brainScore));
    const livingPulse = clamp(num(livingRegion?.regionPulse));
    const tasteScore = clamp(num(
        taste?.tasteProfile?.score,
        taste?.summary?.score,
        taste?.returnProbability,
        intelligence?.signals?.tasteScore,
        // proxy: silny Region Pulse + Brain ≈ dojrzały profil smaku
        livingRegion?.regionPulse && intelligence?.regionScore
            ? Math.round((Number(livingRegion.regionPulse) + Number(intelligence.regionScore)) / 2)
            : null
    ));
    const trustScore = clamp(num(
        trust?.summary?.averageTrustScore,
        trust?.averageTrustScore,
        trust?.trustScore,
        trust?.scores?.overall
    ));
    const returnProb = clamp(num(
        taste?.returnProbability,
        intelligence?.signals?.reflectionReturn,
        sources.selfReflection?.scores?.returnProbability,
        sources.selfReflection?.scores?.return,
        sources.selfReflection?.summary?.returnProbability
    ));

    const rows = [
        { key: 'Health', value: healthScore, unit: '%' },
        { key: 'Performance', value: performance, unit: '%' },
        { key: 'Brand', value: brandScore, unit: '%' },
        { key: 'PWA', value: pwa, unit: '%' },
        { key: 'Offline', value: offline, unit: '%' },
        { key: 'GPS', value: gps, unit: '%' },
        { key: 'Mapa', value: mapa, unit: '%' },
        { key: 'UI', value: ui, unit: '%' },
        { key: 'Accessibility', value: accessibility, unit: '%' },
        { key: 'Security', value: security, unit: '%' },
        { key: 'Console', value: consoleErrors, unit: consoleErrors === 1 ? 'błąd' : 'błędów', kind: 'count' },
        { key: 'Warnings', value: warnings, unit: '', kind: 'count' },
        { key: 'Reports', value: reportsCount, unit: '', kind: 'count' },
        { key: 'Storage', value: storageLabel, unit: '', kind: 'text' },
        { key: 'Release', value: releaseReady, unit: '', kind: 'release' }
    ];

    const intel = [
        { key: 'Region Brain', value: regionBrain },
        { key: 'Living Region', value: livingPulse },
        { key: 'Taste Profile', value: tasteScore },
        { key: 'Trust', value: trustScore },
        { key: 'Return Probability', value: returnProb, unit: '%' }
    ];

    const storeReady = releaseReady === 'READY'
        && (healthScore == null || healthScore >= 90)
        && consoleErrors === 0
        && String(brand?.status || 'PASS').toUpperCase() !== 'FAIL';

    return {
        appName: APP_NAME,
        versionLabel: `Version ${displayVersion(APP_VERSION)}`,
        version: APP_VERSION,
        rows,
        intelligence: intel,
        storeStatus: storeReady
            ? { ready: true, label: 'READY FOR STORE', emoji: '🟢' }
            : { ready: false, label: 'NOT READY FOR STORE', emoji: '🟡' },
        generatedAt: new Date().toISOString(),
        policy: { autoFix: false, readOnly: true }
    };
}

function fmtCell(row) {
    if (row.value == null || row.value === '') return '—';
    if (row.kind === 'text' || row.kind === 'release') return String(row.value);
    if (row.kind === 'count') {
        if (row.key === 'Console') return `${row.value} ${row.unit || 'błędów'}`.trim();
        return String(row.value);
    }
    if (row.unit === '%') return `${row.value}%`;
    return `${row.value}${row.unit || ''}`;
}

function toneClass(row) {
    if (row.kind === 'release') {
        return row.value === 'READY' ? 'ok' : row.value === 'NOT READY' ? 'warn' : '';
    }
    if (row.kind === 'count') {
        if (row.key === 'Console' || row.key === 'Warnings') {
            return Number(row.value) > 0 ? 'warn' : 'ok';
        }
        return '';
    }
    if (row.kind === 'text' || row.value == null) return '';
    const n = Number(row.value);
    if (!Number.isFinite(n)) return '';
    if (n >= 95) return 'ok';
    if (n >= 80) return 'warn';
    return 'fail';
}

/**
 * HTML bloku Status (do Dev Vault).
 * @param {ReturnType<typeof buildDevStatusBoard>} board
 */
export function renderDevStatusBoardHtml(board) {
    const rowHtml = (list) => list.map((r) => `
      <div class="rg-dsb-row rg-dsb-${toneClass(r)}">
        <span class="rg-dsb-k">${escapeHtml(r.key)}</span>
        <span class="rg-dsb-v">${escapeHtml(fmtCell(r))}</span>
      </div>`).join('');

    return `
      <div class="rg-dsb" data-dev-status-board>
        <header class="rg-dsb-head">
          <div class="rg-dsb-brand">${escapeHtml(board.appName)}</div>
          <div class="rg-dsb-ver">${escapeHtml(board.versionLabel)}</div>
        </header>
        <div class="rg-dsb-rule" aria-hidden="true"></div>
        <section class="rg-dsb-block" aria-label="Health metrics">
          ${rowHtml(board.rows)}
        </section>
        <div class="rg-dsb-rule" aria-hidden="true"></div>
        <section class="rg-dsb-block" aria-label="Intelligence">
          <div class="rg-dsb-section-title">Intelligence</div>
          ${rowHtml(board.intelligence)}
        </section>
        <div class="rg-dsb-rule" aria-hidden="true"></div>
        <section class="rg-dsb-status" aria-label="Store status">
          <div class="rg-dsb-section-title">Status</div>
          <div class="rg-dsb-store ${board.storeStatus.ready ? 'ok' : 'warn'}">
            ${escapeHtml(board.storeStatus.emoji)} ${escapeHtml(board.storeStatus.label)}
          </div>
        </section>
        <p class="rg-dsb-note">Tylko odczyt · autoFix=false · Menu ☰ → Panel deweloperski</p>
      </div>
    `;
}

function escapeHtml(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export const DEV_STATUS_BOARD_CSS = `
.rg-dsb{max-width:420px;margin:0 auto;font-family:'Source Sans 3',system-ui,sans-serif;color:#1c1812}
.rg-dsb-head{text-align:center;padding:4px 0 10px}
.rg-dsb-brand{font-family:Literata,Georgia,serif;font-size:1.35rem;font-weight:700;color:#2a3f28;letter-spacing:.01em}
.rg-dsb-ver{margin-top:4px;font-size:.92rem;color:#4a3f32}
.rg-dsb-rule{height:0;border:0;border-top:1px solid rgba(42,63,40,.22);margin:12px 0;letter-spacing:.2em;text-align:center}
.rg-dsb-rule::before{content:'══════════════════════';font-size:.72rem;color:rgba(42,63,40,.45);letter-spacing:.08em}
.rg-dsb-section-title{font-family:Literata,Georgia,serif;font-size:1.05rem;font-weight:700;color:#2a3f28;margin:0 0 10px}
.rg-dsb-row{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:5px 0;border-bottom:1px solid rgba(42,63,40,.06)}
.rg-dsb-row:last-child{border-bottom:0}
.rg-dsb-k{font-size:.95rem;color:#3a3228}
.rg-dsb-v{font-family:Literata,Georgia,serif;font-size:1.05rem;font-weight:700;color:#2a3f28;text-align:right;white-space:nowrap}
.rg-dsb-ok .rg-dsb-v{color:#2a3f28}
.rg-dsb-warn .rg-dsb-v{color:#8a6a12}
.rg-dsb-fail .rg-dsb-v{color:#8a2b2b}
.rg-dsb-store{font-family:Literata,Georgia,serif;font-size:1.15rem;font-weight:700;padding:10px 12px;border-radius:12px;background:rgba(42,63,40,.08);border:1px solid rgba(201,162,39,.35);text-align:center}
.rg-dsb-store.ok{background:rgba(42,63,40,.12);color:#1e3220}
.rg-dsb-store.warn{background:rgba(201,162,39,.15);color:#5c4a10}
.rg-dsb-note{margin:14px 0 0;font-size:.75rem;color:#6a5f52;text-align:center}
.rg-dsb-actions{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:14px}
`;

/**
 * Zbiera źródła runtime + docs.
 */
export async function loadDevStatusBoardSources() {
    const healthLive = getLastHealthReport();
    let mapSnapshot = null;
    try {
        const mod = await import('../views/map.js?v=48');
        mapSnapshot = mod.getMapHealthSnapshot?.() || null;
    } catch {
        mapSnapshot = null;
    }

    const [
        healthDoc,
        brand,
        livingBrand,
        intelligence,
        livingRegion,
        trust,
        taste,
        release,
        mapGuardian,
        uiGuardian,
        polish,
        selfReflection
    ] = await Promise.all([
        fetchJson('/docs/health/latest.json'),
        fetchJson('/docs/brand-protection/latest.json'),
        fetchJson('/docs/living-brand/latest.json'),
        fetchJson('/docs/intelligence/latest.json'),
        fetchJson('/docs/living-region/latest.json'),
        fetchJson('/docs/trust/latest.json'),
        fetchJson('/docs/user-taste/latest.json'),
        fetchJson('/docs/final/release-validator-latest.json'),
        fetchJson('/docs/map-guardian/latest.json'),
        fetchJson('/docs/ui-guardian/latest.json'),
        fetchJson('/docs/premium/PRODUCTION-POLISH.json'),
        fetchJson('/docs/self-reflection/latest.json')
    ]);

    let storage = null;
    try {
        storage = await getStorageHealth();
    } catch {
        storage = null;
    }

    let docsStats = null;
    try {
        docsStats = await loadDocsStats();
    } catch {
        docsStats = null;
    }

    let consoleReports = [];
    try {
        consoleReports = getGuardianReports() || [];
    } catch {
        consoleReports = [];
    }

    let uiFindings = [];
    try {
        uiFindings = getUiGuardianFindings() || [];
    } catch {
        uiFindings = [];
    }

    return {
        health: healthLive || healthDoc,
        brand,
        livingBrand,
        intelligence,
        livingRegion,
        trust,
        taste,
        release,
        mapGuardian,
        uiGuardian,
        productionPolish: polish
            ? { warn: num(polish.warn, polish.summary?.warn, 0) }
            : null,
        selfReflection,
        mapSnapshot,
        storage,
        docsStats,
        consoleReports,
        uiFindings
    };
}

/**
 * Pełny przebieg: load → build → HTML.
 */
export async function buildDevStatusBoardView() {
    const sources = await loadDevStatusBoardSources();
    const board = buildDevStatusBoard(sources);
    return { board, html: renderDevStatusBoardHtml(board), sources };
}

export default {
    buildDevStatusBoard,
    renderDevStatusBoardHtml,
    loadDevStatusBoardSources,
    buildDevStatusBoardView,
    DEV_STATUS_BOARD_CSS
};
