// js/diagnostics/developerDashboard.js – ETAP 19B Developer Dashboard
// Wyłącznie localhost / 127.0.0.1. Nie zmienia architektury. AutoFix=false.

import { getLastHealthReport, getHealthState } from './healthMonitor.js';
import { getLearningModel, getLearningInsights } from '../presentation/learningEngine.js';
import { getLastImprovementReport } from './improvementEngine.js';
import { getLastVirtualUserReport } from './virtualUser.js';
import { getLastAdvisorBriefing } from './projectAdvisor.js';
import { getLastDailyDeveloperReport } from './dailyDeveloperReport.js';
import {
    isPremiumActive,
    getPremiumStatus,
    getTrialPhase,
    getTrialDaysRemaining
} from '../core/premiumService.js';
import { isDevVaultUnlocked } from './devVault.js';

const ROOT_ID = 'rg-dev-dashboard-root';
const STYLE_ID = 'rg-dev-dashboard-style';
const HISTORY_KEY = 'rg_dev_dashboard_history_v1';
const MAX_HISTORY = 14;

let initialized = false;
let open = false;

export function isLocalhostOnly() {
    try {
        const h = location.hostname || '';
        return h === 'localhost' || h === '127.0.0.1';
    } catch {
        return false;
    }
}

function dayStamp(d = new Date()) {
    return d.toISOString().slice(0, 10);
}

function clamp(n) {
    return Math.max(0, Math.min(100, Math.round(n)));
}

function readImproveHistory() {
    try {
        const raw = localStorage.getItem('rg_improvement_history_v1');
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function readDashboardHistory() {
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        const data = raw ? JSON.parse(raw) : [];
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function pushDashboardHistory(entry) {
    try {
        const prev = readDashboardHistory().filter((x) => x.day !== entry.day);
        const next = [entry, ...prev].slice(0, MAX_HISTORY);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        return next;
    } catch {
        return [];
    }
}

function countProblemFrequency(items) {
    const bag = {};
    for (const it of items) {
        const key = String(it).slice(0, 80);
        if (!key) continue;
        bag[key] = (bag[key] || 0) + 1;
    }
    return Object.entries(bag)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([label, count]) => ({ label, count }));
}

/**
 * Snapshot Dashboardu (pure względem źródeł).
 */
export function buildDeveloperDashboardSnapshot(input = {}) {
    const health = input.health || null;
    const healthState = input.healthState || null;
    const improve = input.improve || null;
    const virtual = input.virtual || null;
    const learning = input.learning || null;
    const model = input.model || null;
    const advisor = input.advisor || null;
    const daily = input.daily || null;
    const premium = input.premium || {};
    const history = input.history || [];

    const hScores = health?.scores || {};
    const vu = virtual?.summary || {};
    const vuBy = vu.byType || {};
    const jsErrors = healthState?.jsErrors?.length ?? health?.runtime?.jsErrors ?? 0;

    const appHealth = health?.overall
        ?? daily?.appScore
        ?? (Object.keys(hScores).length
            ? clamp(Object.values(hScores).reduce((a, b) => a + b, 0) / Object.keys(hScores).length)
            : null);

    const performance = {
        score: hScores.performance ?? null,
        avgRenderMs: health?.runtime?.avgRenderMs ?? null,
        duplicateFetches: health?.runtime?.duplicateFetches ?? 0,
        avgFps: vu.avgFps ?? null,
        fpsIssues: vuBy.fps || 0
    };

    // Najgorsze ekrany
    const screenBag = {};
    const failScenes = (virtual?.scenarios || []).filter((s) => s.status === 'fail');
    for (const s of failScenes) {
        const name = String(s.name || '');
        let screen = 'other';
        if (/map|popup|gps|filter/i.test(name)) screen = 'map';
        else if (/home|search/i.test(name)) screen = 'home';
        else if (/modal|producer/i.test(name)) screen = 'producer-modal';
        else if (/cart/i.test(name)) screen = 'cart';
        else if (/favorite/i.test(name)) screen = 'favorites';
        else if (/premium/i.test(name)) screen = 'premium';
        else if (/profile/i.test(name)) screen = 'profile';
        screenBag[screen] = (screenBag[screen] || 0) + 3;
    }
    for (const issue of virtual?.issues || []) {
        const sc = String(issue.scenario || '');
        if (sc) screenBag[sc] = (screenBag[sc] || 0) + 1;
    }
    const homeMs = Number(model?.screens?.home) || 0;
    const mapMs = Number(model?.screens?.map) || 0;
    if (homeMs > 0 && mapMs > 0 && homeMs > mapMs * 4) {
        screenBag.map = (screenBag.map || 0) + 2;
    }
    if ((hScores.mobile ?? 100) < 85) screenBag['home/mobile'] = (screenBag['home/mobile'] || 0) + 2;

    const worstScreens = Object.entries(screenBag)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, weight]) => ({ name, weight }));

    // Najgorsze pliki
    const fileBag = {};
    for (const p of improve?.proposals || []) {
        const f = p.file || 'unknown';
        fileBag[f] = (fileBag[f] || 0) + (p.priority === 'critical' ? 4 : p.priority === 'high' ? 3 : 1);
    }
    for (const f of daily?.sections?.aiGuardian?.topFindings || []) {
        for (const file of f.files || []) {
            fileBag[file] = (fileBag[file] || 0) + (f.severity === 'high' || f.severity === 'critical' ? 3 : 1);
        }
    }
    const worstFiles = Object.entries(fileBag)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([file, weight]) => ({ file, weight }));

    // Częste problemy
    const problemLabels = [
        ...(health?.findings || []).map((f) => f.title || f.area),
        ...(virtual?.issues || []).map((i) => `${i.type}: ${i.title}`),
        ...(improve?.proposals || []).map((p) => p.title),
        ...(daily?.failedChecks || []).map((c) => `check:${c}`)
    ];
    const frequentProblems = countProblemFrequency(problemLabels);

    // Trend jakości
    const qualityTrend = history.map((h) => ({
        day: h.day,
        appScore: h.appScore,
        health: h.health,
        errors: h.errors,
        vuScore: h.vuScore
    }));

    // Premium score 0–100 (stan funkcji, nie sprzedaż)
    let premiumScore = 70;
    const uiState = premium.uiState || 'none';
    if (premium.active) premiumScore = 92;
    else if (uiState === 'trial' || uiState === 'reminder') premiumScore = 85;
    else if (uiState === 'expired') premiumScore = 55;
    else if (uiState === 'offer') premiumScore = 65;
    const vuPremiumFail = failScenes.some((s) => String(s.name).includes('premium'));
    if (vuPremiumFail) premiumScore -= 15;
    if ((hScores.ux ?? 100) < 80) premiumScore -= 5;
    premiumScore = clamp(premiumScore);

    const status = (() => {
        if (jsErrors > 0 || (vu.failed || 0) > 2) return { label: 'Uwaga', level: 'warn' };
        if ((appHealth ?? 100) < 75) return { label: 'Słabe zdrowie', level: 'bad' };
        if ((appHealth ?? 100) >= 90 && jsErrors === 0) return { label: 'Stabilna', level: 'ok' };
        return { label: 'OK', level: 'ok' };
    })();

    return {
        generatedAt: new Date().toISOString(),
        day: dayStamp(),
        localhostOnly: true,
        policy: { autoFix: false, architectureUnchanged: true },
        status,
        appState: {
            healthOverall: health?.overall ?? null,
            dailyScore: daily?.appScore ?? null,
            appHealth,
            viewHint: 'localhost dashboard'
        },
        errors: {
            jsCount: jsErrors,
            jsSamples: (healthState?.jsErrors || []).slice(-5),
            vuErrors: vuBy.error || 0,
            vuFailedScenarios: failScenes.map((s) => s.name)
        },
        performance,
        health: {
            overall: health?.overall ?? null,
            scores: hScores,
            memory: health?.runtime?.memory || null,
            pwa: hScores.pwa ?? null
        },
        worstScreens,
        worstFiles,
        frequentProblems,
        qualityTrend,
        premium: {
            score: premiumScore,
            active: Boolean(premium.active),
            uiState,
            daysLeft: premium.daysLeft ?? null,
            trialEndsAt: premium.status?.trialEndsAt || null
        },
        improvements: (improve?.proposals || []).slice(0, 8).map((p) => ({
            id: p.id,
            priority: p.priority,
            title: p.title,
            file: p.file,
            function: p.function,
            impact: p.impact,
            risk: p.risk
        })),
        advisorHeadline: advisor?.headline || null,
        learningSignals: learning?.signalCount ?? model?.signalCount ?? 0
    };
}

export function collectDeveloperDashboardSnapshot() {
    let premium = {};
    try {
        premium = {
            active: isPremiumActive(),
            uiState: getTrialPhase(),
            daysLeft: getTrialDaysRemaining(),
            status: getPremiumStatus()
        };
    } catch {
        premium = { active: false, uiState: 'none', daysLeft: 0, status: null };
    }

    const daily = getLastDailyDeveloperReport();
    const health = getLastHealthReport();
    const virtual = getLastVirtualUserReport();

    const snap = buildDeveloperDashboardSnapshot({
        health,
        healthState: getHealthState(),
        improve: getLastImprovementReport(),
        virtual,
        learning: getLearningInsights(),
        model: getLearningModel(),
        advisor: getLastAdvisorBriefing(),
        daily,
        premium,
        history: readDashboardHistory()
    });

    const hist = pushDashboardHistory({
        day: snap.day,
        at: snap.generatedAt,
        appScore: daily?.appScore ?? snap.appState.appHealth,
        health: health?.overall ?? null,
        errors: snap.errors.jsCount,
        vuScore: virtual?.summary?.score ?? null
    });
    snap.qualityTrend = hist.map((h) => ({
        day: h.day,
        appScore: h.appScore,
        health: h.health,
        errors: h.errors,
        vuScore: h.vuScore
    }));

    return snap;
}

function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
#${ROOT_ID}{position:fixed;z-index:100000;inset:0;pointer-events:none;font-family:ui-sans-serif,system-ui,sans-serif;font-size:13px;color:#14201a}
#${ROOT_ID} .rg-dd-fab{pointer-events:auto;position:fixed;left:12px;bottom:12px;border:0;border-radius:999px;background:#0f3d2e;color:#f4f7f5;padding:10px 14px;font-weight:700;cursor:pointer;box-shadow:0 8px 28px rgba(0,0,0,.28)}
#${ROOT_ID} .rg-dd-overlay{pointer-events:auto;display:none;position:fixed;inset:0;background:rgba(10,20,16,.45);backdrop-filter:blur(2px);padding:16px;overflow:auto}
#${ROOT_ID}.open .rg-dd-overlay{display:block}
#${ROOT_ID} .rg-dd-panel{max-width:980px;margin:24px auto;background:linear-gradient(165deg,#f7faf8 0%,#eef5f0 48%,#f8f4ec 100%);border:1px solid #c5d4cb;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.28);padding:18px 18px 22px}
#${ROOT_ID} .rg-dd-head{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start;justify-content:space-between;margin-bottom:14px}
#${ROOT_ID} .rg-dd-head h2{margin:0;font-size:20px;letter-spacing:-.02em}
#${ROOT_ID} .rg-dd-badge{display:inline-block;padding:4px 10px;border-radius:999px;font-weight:700;font-size:12px}
#${ROOT_ID} .rg-dd-badge.ok{background:#d7efe0;color:#0f3d2e}
#${ROOT_ID} .rg-dd-badge.warn{background:#f7e7c4;color:#6a4a00}
#${ROOT_ID} .rg-dd-badge.bad{background:#f5d0d0;color:#7a1010}
#${ROOT_ID} .rg-dd-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin:12px 0}
#${ROOT_ID} .rg-dd-card{background:rgba(255,255,255,.72);border:1px solid #d5e0d8;border-radius:12px;padding:12px}
#${ROOT_ID} .rg-dd-card h3{margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#4a5c52}
#${ROOT_ID} .rg-dd-metric{font-size:28px;font-weight:800;color:#0f3d2e;line-height:1.1}
#${ROOT_ID} .rg-dd-sub{color:#55665c;margin-top:4px;line-height:1.35}
#${ROOT_ID} .rg-dd-list{margin:0;padding:0;list-style:none}
#${ROOT_ID} .rg-dd-list li{padding:6px 0;border-bottom:1px solid #e2ebe5}
#${ROOT_ID} .rg-dd-list li:last-child{border-bottom:0}
#${ROOT_ID} .rg-dd-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
#${ROOT_ID} .rg-dd-actions button{border:1px solid #b9c9bf;background:#fff;border-radius:8px;padding:7px 12px;cursor:pointer}
#${ROOT_ID} .rg-dd-trend{display:flex;gap:6px;align-items:flex-end;height:64px;margin-top:8px}
#${ROOT_ID} .rg-dd-bar{flex:1;background:#1f4d3a;border-radius:4px 4px 0 0;min-width:8px;opacity:.85}
#${ROOT_ID} .rg-dd-meta{color:#66776e;font-size:11px;margin-top:10px}
#${ROOT_ID} code{font-size:11px;background:#e8f0eb;padding:1px 4px;border-radius:4px}
`;
    document.head.appendChild(style);
}

function esc(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function renderTrend(trend) {
    const rows = (trend || []).slice(0, 10).reverse();
    if (!rows.length) return '<p class="rg-dd-sub">Brak historii – odśwież Dashboard przez kilka dni.</p>';
    const max = Math.max(1, ...rows.map((r) => Number(r.appScore) || Number(r.health) || 1));
    const bars = rows.map((r) => {
        const v = Number(r.appScore) || Number(r.health) || 0;
        const h = Math.max(6, Math.round((v / max) * 56));
        return `<div class="rg-dd-bar" title="${esc(r.day)}: ${v}%" style="height:${h}px"></div>`;
    }).join('');
    return `<div class="rg-dd-trend">${bars}</div>
      <p class="rg-dd-sub">${rows.map((r) => `${r.day.slice(5)}:${r.appScore ?? r.health ?? '—'}`).join(' · ')}</p>`;
}

function renderDashboard(root, snap) {
    const panel = root.querySelector('.rg-dd-panel');
    if (!panel || !snap) return;

    const scores = snap.health.scores || {};
    const scoreGrid = Object.entries(scores).map(([k, v]) =>
        `<div class="rg-dd-card"><h3>${esc(k)}</h3><div class="rg-dd-metric">${v ?? '—'}%</div></div>`
    ).join('');

    const screens = (snap.worstScreens || []).map((s) =>
        `<li><strong>${esc(s.name)}</strong> <span class="rg-dd-sub">waga ${s.weight}</span></li>`
    ).join('') || '<li>Brak sygnałów</li>';

    const files = (snap.worstFiles || []).map((f) =>
        `<li><code>${esc(f.file)}</code> <span class="rg-dd-sub">×${f.weight}</span></li>`
    ).join('') || '<li>Brak sygnałów</li>';

    const problems = (snap.frequentProblems || []).map((p) =>
        `<li>${esc(p.label)} <strong>×${p.count}</strong></li>`
    ).join('') || '<li>Brak</li>';

    const improvs = (snap.improvements || []).map((p) =>
        `<li><strong>[${esc(p.priority)}]</strong> ${esc(p.title)}<br><code>${esc(p.file)}</code> → ${esc(p.function)}</li>`
    ).join('') || '<li>Brak propozycji</li>';

    panel.innerHTML = `
      <div class="rg-dd-head">
        <div>
          <h2>Developer Dashboard</h2>
          <p class="rg-dd-sub">localhost only · autoFix=false · ${esc(snap.day)}</p>
        </div>
        <div>
          <span class="rg-dd-badge ${esc(snap.status.level)}">${esc(snap.status.label)}</span>
        </div>
      </div>

      <div class="rg-dd-grid">
        <div class="rg-dd-card">
          <h3>Stan aplikacji</h3>
          <div class="rg-dd-metric">${esc(snap.status.label)}</div>
          <p class="rg-dd-sub">Health ${snap.appState.healthOverall ?? '—'}% · Daily ${snap.appState.dailyScore ?? '—'}%</p>
        </div>
        <div class="rg-dd-card">
          <h3>Błędy</h3>
          <div class="rg-dd-metric">${snap.errors.jsCount}</div>
          <p class="rg-dd-sub">JS · VU errors ${snap.errors.vuErrors} · fail scen. ${(snap.errors.vuFailedScenarios || []).length}</p>
        </div>
        <div class="rg-dd-card">
          <h3>Wydajność</h3>
          <div class="rg-dd-metric">${snap.performance.score ?? '—'}%</div>
          <p class="rg-dd-sub">render ${snap.performance.avgRenderMs ?? '—'}ms · FPS ${snap.performance.avgFps ?? '—'} · dup fetch ${snap.performance.duplicateFetches}</p>
        </div>
        <div class="rg-dd-card">
          <h3>Zdrowie</h3>
          <div class="rg-dd-metric">${snap.appState.appHealth ?? '—'}%</div>
          <p class="rg-dd-sub">PWA ${snap.health.pwa ?? '—'}% · sygnały Learning ${snap.learningSignals}</p>
        </div>
        <div class="rg-dd-card">
          <h3>Ocena Premium</h3>
          <div class="rg-dd-metric">${snap.premium.score}%</div>
          <p class="rg-dd-sub">${snap.premium.active ? 'active' : esc(snap.premium.uiState)} · dni ${snap.premium.daysLeft ?? '—'}</p>
        </div>
      </div>

      <div class="rg-dd-grid">${scoreGrid}</div>

      <div class="rg-dd-grid">
        <div class="rg-dd-card">
          <h3>Najgorsze ekrany</h3>
          <ul class="rg-dd-list">${screens}</ul>
        </div>
        <div class="rg-dd-card">
          <h3>Najgorsze pliki</h3>
          <ul class="rg-dd-list">${files}</ul>
        </div>
        <div class="rg-dd-card">
          <h3>Najczęstsze problemy</h3>
          <ul class="rg-dd-list">${problems}</ul>
        </div>
      </div>

      <div class="rg-dd-card">
        <h3>Zmiany jakości (ostatnie dni)</h3>
        ${renderTrend(snap.qualityTrend)}
      </div>

      <div class="rg-dd-card" style="margin-top:10px">
        <h3>Propozycje ulepszeń</h3>
        <p class="rg-dd-sub">${esc(snap.advisorHeadline || '')}</p>
        <ul class="rg-dd-list">${improvs}</ul>
      </div>

      <div class="rg-dd-actions">
        <button type="button" data-dd="refresh">Odśwież</button>
        <button type="button" data-dd="copy">Kopiuj JSON</button>
        <button type="button" data-dd="close">Zamknij</button>
      </div>
      <p class="rg-dd-meta">ETAP 19B · nie zmienia Store/EventBus/API/GPS/Leaflet/Routing/HTML</p>
    `;
}

async function copyJson(snap) {
    const text = JSON.stringify(snap, null, 2);
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        console.info('[Dev Dashboard]', text);
        return false;
    }
}

export function openDeveloperDashboard() {
    if (!isDevVaultUnlocked()) return null;
    const root = document.getElementById(ROOT_ID);
    if (!root) return null;
    const snap = collectDeveloperDashboardSnapshot();
    renderDashboard(root, snap);
    root.classList.add('open');
    open = true;
    window.__RG_DASHBOARD_LAST__ = snap;
    return snap;
}

export function closeDeveloperDashboard() {
    const root = document.getElementById(ROOT_ID);
    root?.classList.remove('open');
    open = false;
}

/**
 * Dev dashboard – tylko po odblokowaniu vault (hasło).
 * Domyślnie bez FAB na Home/Mapie (otwierany z panelu deweloperskiego).
 * @param {{ force?: boolean, showFab?: boolean }} [opts]
 */
export function initDeveloperDashboard(opts = {}) {
    const { force = false, showFab = false } = opts;
    if (!force && !isDevVaultUnlocked()) {
        // brak UI na starcie (także na localhost)
        window.__RG_DASHBOARD__ = {
            open: () => {
                console.info('[Dev Dashboard] odblokuj: ☰ → Panel deweloperski (hasło)');
                return null;
            },
            close: closeDeveloperDashboard,
            snapshot: collectDeveloperDashboardSnapshot,
            policy: { vaultRequired: true, autoFix: false }
        };
        return;
    }

    if (document.getElementById(ROOT_ID)) {
        initialized = true;
        return;
    }
    initialized = true;

    ensureStyles();

    const root = document.createElement('div');
    root.id = ROOT_ID;
    root.innerHTML = showFab
        ? `
      <div class="rg-dd-overlay" data-dd="backdrop">
        <div class="rg-dd-panel" role="dialog" aria-label="Developer Dashboard"></div>
      </div>
      <button type="button" class="rg-dd-fab" title="Developer Dashboard">Dev</button>
    `
        : `
      <div class="rg-dd-overlay" data-dd="backdrop">
        <div class="rg-dd-panel" role="dialog" aria-label="Developer Dashboard"></div>
      </div>
    `;
    document.body.appendChild(root);

    root.querySelector('.rg-dd-fab')?.addEventListener('click', () => {
        if (open) closeDeveloperDashboard();
        else openDeveloperDashboard();
    });

    root.addEventListener('click', async (ev) => {
        const btn = ev.target.closest('[data-dd]');
        if (!btn) return;
        const act = btn.getAttribute('data-dd');
        if (act === 'backdrop' && ev.target === btn) {
            closeDeveloperDashboard();
            return;
        }
        if (act === 'close') {
            closeDeveloperDashboard();
            return;
        }
        if (act === 'refresh') {
            openDeveloperDashboard();
            return;
        }
        if (act === 'copy') {
            const ok = await copyJson(window.__RG_DASHBOARD_LAST__ || collectDeveloperDashboardSnapshot());
            btn.textContent = ok ? 'Skopiowano' : 'Konsola';
            setTimeout(() => { btn.textContent = 'Kopiuj JSON'; }, 1400);
        }
    });

    window.__RG_DASHBOARD__ = {
        open: openDeveloperDashboard,
        close: closeDeveloperDashboard,
        snapshot: collectDeveloperDashboardSnapshot,
        policy: { vaultRequired: true, autoFix: false }
    };

    console.info('[Dev Dashboard] vault · bez FAB · __RG_DASHBOARD__.open()');
}

export default {
    initDeveloperDashboard,
    openDeveloperDashboard,
    closeDeveloperDashboard,
    collectDeveloperDashboardSnapshot,
    buildDeveloperDashboardSnapshot,
    isLocalhostOnly
};
