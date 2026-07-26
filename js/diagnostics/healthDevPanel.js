// js/diagnostics/healthDevPanel.js – panel raportu zdrowia (tryb developerski)
// Nie zmienia HTML aplikacji – wstrzykuje panel tylko gdy rg_dev_mode / ?dev=1 / localhost.

import { getLastHealthReport, runHealthCheck, isDevMode } from './healthMonitor.js';
import { isDevVaultUnlocked } from './devVault.js';
import {
    getLastImprovementReport,
    generateImprovementReport
} from './improvementEngine.js';
import {
    getLastVirtualUserReport,
    runVirtualUser
} from './virtualUser.js';
import {
    getLastRealUserReport,
    runRealUserSimulation
} from './realUserSimulation.js';
import {
    getLastEmotionReport,
    generateEmotionReport
} from './emotionAi.js';
import {
    getLastLivingBrandReport,
    generateLivingBrandReport
} from './livingBrand.js';
import {
    getLastProductDirectorBriefing,
    generateProductDirectorBriefing
} from './productDirector.js';
import {
    getLastAdvisorBriefing,
    generateAdvisorBriefing
} from './projectAdvisor.js';
import {
    getLastDailyDeveloperReport,
    generateDailyDeveloperReport,
    prepareDeveloperEmailDraft
} from './dailyDeveloperReport.js';
import {
    getLastWeeklyPremiumReport,
    generateWeeklyPremiumReport
} from './weeklyPremiumReport.js';

const STYLE_ID = 'rg-health-monitor-style';
const ROOT_ID = 'rg-health-monitor-root';

function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
#${ROOT_ID}{position:fixed;z-index:99999;right:12px;bottom:12px;font-family:ui-sans-serif,system-ui,sans-serif;font-size:12px;color:#1a1a1a}
#${ROOT_ID} .rg-hm-fab{border:0;border-radius:999px;background:#1f4d3a;color:#fff;padding:10px 14px;box-shadow:0 6px 20px rgba(0,0,0,.25);cursor:pointer;font-weight:600}
#${ROOT_ID} .rg-hm-panel{display:none;width:min(360px,calc(100vw - 24px));max-height:min(70vh,520px);overflow:auto;margin-bottom:8px;background:#fff;border:1px solid #d8e0da;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.2);padding:12px}
#${ROOT_ID}.open .rg-hm-panel{display:block}
#${ROOT_ID} h3{margin:0 0 8px;font-size:14px}
#${ROOT_ID} .rg-hm-overall{font-size:28px;font-weight:700;color:#1f4d3a;margin:4px 0 10px}
#${ROOT_ID} .rg-hm-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
#${ROOT_ID} .rg-hm-score{background:#f4f7f5;border-radius:8px;padding:8px}
#${ROOT_ID} .rg-hm-score b{display:block;font-size:16px}
#${ROOT_ID} .rg-hm-findings{margin-top:10px;padding:0;list-style:none}
#${ROOT_ID} .rg-hm-findings li{border-left:3px solid #c9a227;padding:6px 8px;margin:6px 0;background:#faf8f2}
#${ROOT_ID} .rg-hm-findings li.high{border-color:#b33}
#${ROOT_ID} .rg-hm-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
#${ROOT_ID} .rg-hm-actions button{border:1px solid #c5d0c8;background:#fff;border-radius:8px;padding:6px 10px;cursor:pointer}
#${ROOT_ID} .rg-hm-meta{color:#666;margin-top:8px;line-height:1.4}
#${ROOT_ID} .rg-hm-prop{border-left:3px solid #1f4d3a;padding:6px 8px;margin:6px 0;background:#f4f7f5}
#${ROOT_ID} .rg-hm-prop.critical,#${ROOT_ID} .rg-hm-prop.high{border-color:#b33}
#${ROOT_ID} .rg-hm-prop code{font-size:11px}
`;
    document.head.appendChild(style);
}

function scoreRows(scores = {}) {
    const labels = {
        performance: 'Performance',
        ux: 'UX',
        accessibility: 'Accessibility',
        memory: 'Memory',
        dataQuality: 'Data Quality',
        translation: 'Translation',
        mobile: 'Mobile',
        pwa: 'PWA'
    };
    return Object.entries(labels).map(([k, label]) => {
        const v = scores[k] ?? '—';
        return `<div class="rg-hm-score"><span>${label}</span><b>${v}%</b></div>`;
    }).join('');
}

function renderPanel(root, report) {
    const panel = root.querySelector('.rg-hm-panel');
    if (!panel) return;
    if (!report) {
        panel.innerHTML = '<h3>Application Health</h3><p>Brak raportu – uruchom check.</p>';
        return;
    }
    const findings = (report.findings || []).slice(0, 8).map((f) => `
      <li class="${f.severity || ''}">
        <strong>${f.title}</strong><br>${f.detail || ''}
      </li>`).join('') || '<li>Brak krytycznych findings.</li>';

    panel.innerHTML = `
      <h3>Application Health Monitor</h3>
      <div class="rg-hm-overall">${report.overall}%</div>
      <div class="rg-hm-grid">${scoreRows(report.scores)}</div>
      <ul class="rg-hm-findings">${findings}</ul>
      <div class="rg-hm-actions">
        <button type="button" data-hm="run">Health Check</button>
        <button type="button" data-hm="improve">Co poprawić</button>
        <button type="button" data-hm="virtual">Virtual User</button>
        <button type="button" data-hm="real-users">Real Users</button>
        <button type="button" data-hm="emotion">Emotion AI</button>
        <button type="button" data-hm="living-brand">Living Brand</button>
        <button type="button" data-hm="director">Product Director</button>
        <button type="button" data-hm="advisor">Doradca</button>
        <button type="button" data-hm="daily">Daily Report</button>
        <button type="button" data-hm="weekly">Weekly Premium</button>
        <button type="button" data-hm="copy">Kopiuj JSON</button>
        <button type="button" data-hm="close">Zamknij</button>
      </div>
      <p class="rg-hm-meta">
        Read-only · autoFix=false<br>
        Zapis na dysk: <code>npm run health</code> → <code>docs/health/</code><br>
        ${report.generatedAt || ''} · ${report.reason || ''}
      </p>
    `;
}

function renderWeeklyPanel(root, report) {
    const panel = root.querySelector('.rg-hm-panel');
    if (!panel) return;
    if (!report) {
        panel.innerHTML = `
          <h3>Weekly Premium Report</h3>
          <p>Brak raportu tygodnia.</p>
          <div class="rg-hm-actions">
            <button type="button" data-hm="weekly-run">Generuj</button>
            <button type="button" data-hm="health-view">Health</button>
            <button type="button" data-hm="close">Zamknij</button>
          </div>`;
        return;
    }
    const qa = (report.questions || []).slice(0, 10).map((q) => `
      <div class="rg-hm-prop">
        <strong>${q.question}</strong>
        <pre style="white-space:pre-wrap;margin:6px 0 0;font:inherit">${(q.answer || '').replace(/</g, '&lt;')}</pre>
      </div>`).join('');
    const top = (report.top20 || []).slice(0, 8).map((t) =>
        `<li class="${t.priority || ''}"><strong>#${t.rank}</strong> [${t.priority}] ${t.title}<br><code>${t.file || ''}</code></li>`
    ).join('');

    panel.innerHTML = `
      <h3>Weekly Premium Report</h3>
      <p class="rg-hm-meta">${report.week || ''} · autoFix=false · Top ${(report.top20 || []).length}</p>
      ${qa}
      <h3 style="margin-top:12px;font-size:14px">Top propozycje</h3>
      <ul class="rg-hm-findings">${top || '<li>Brak</li>'}</ul>
      <div class="rg-hm-actions">
        <button type="button" data-hm="weekly-run">Odśwież</button>
        <button type="button" data-hm="weekly-copy">Kopiuj JSON</button>
        <button type="button" data-hm="health-view">Health</button>
        <button type="button" data-hm="close">Zamknij</button>
      </div>
      <p class="rg-hm-meta">CLI: <code>npm run weekly-premium</code> → <code>docs/premium-weekly/</code></p>
    `;
}

function renderDailyPanel(root, report) {
    const panel = root.querySelector('.rg-hm-panel');
    if (!panel) return;
    if (!report) {
        panel.innerHTML = `
          <h3>Daily Developer Report</h3>
          <p>Brak raportu – wygeneruj (dev-only).</p>
          <div class="rg-hm-actions">
            <button type="button" data-hm="daily-run">Generuj</button>
            <button type="button" data-hm="health-view">Health</button>
            <button type="button" data-hm="close">Zamknij</button>
          </div>`;
        return;
    }
    const checks = Object.entries(report.checklist || {}).map(([k, v]) =>
        `<div class="rg-hm-score"><span>${v.ok ? '✔' : '✖'} ${k}</span><b>${v.ok ? 'OK' : '!'}</b></div>`
    ).join('');
    const failed = (report.failedChecks || []).join(', ') || 'brak';

    panel.innerHTML = `
      <h3>Daily Developer Report</h3>
      <div class="rg-hm-overall">${report.appScore ?? '—'}%</div>
      <p class="rg-hm-meta">${report.day || ''} · autoFix=false · dev-only</p>
      <div class="rg-hm-grid">${checks}</div>
      <p class="rg-hm-meta">Failed: ${failed}</p>
      <div class="rg-hm-actions">
        <button type="button" data-hm="daily-run">Odśwież</button>
        <button type="button" data-hm="daily-copy">Kopiuj JSON</button>
        <button type="button" data-hm="daily-email">Przygotuj e-mail</button>
        <button type="button" data-hm="health-view">Health</button>
        <button type="button" data-hm="close">Zamknij</button>
      </div>
      <p class="rg-hm-meta">
        CLI: <code>npm run daily-mail</code> → <code>docs/daily/</code> · SMTP: <code>docs/daily/DEVELOPER-MAIL.md</code><br>
        Mail tylko do właściciela. Credentials w <code>.env</code>. Bez wysyłki na prod.
      </p>
    `;
}

function renderAdvisorPanel(root, briefing) {
    const panel = root.querySelector('.rg-hm-panel');
    if (!panel) return;
    if (!briefing) {
        panel.innerHTML = `
          <h3>Doradca Projektu</h3>
          <p>Brak briefingu – wygeneruj.</p>
          <div class="rg-hm-actions">
            <button type="button" data-hm="advisor-run">Briefing dnia</button>
            <button type="button" data-hm="health-view">Health</button>
            <button type="button" data-hm="close">Zamknij</button>
          </div>`;
        return;
    }
    const qa = (briefing.questions || []).map((q) => `
      <div class="rg-hm-prop">
        <strong>${q.question}</strong>
        <pre style="white-space:pre-wrap;margin:6px 0 0;font:inherit">${(q.answer || '').replace(/</g, '&lt;')}</pre>
      </div>`).join('');

    panel.innerHTML = `
      <h3>Doradca Projektu</h3>
      <p class="rg-hm-meta"><strong>${briefing.headline || ''}</strong></p>
      <p class="rg-hm-meta">${briefing.day || ''} · autoFix=false</p>
      ${qa}
      <div class="rg-hm-actions">
        <button type="button" data-hm="advisor-run">Odśwież</button>
        <button type="button" data-hm="advisor-copy">Kopiuj JSON</button>
        <button type="button" data-hm="health-view">Health</button>
        <button type="button" data-hm="close">Zamknij</button>
      </div>
      <p class="rg-hm-meta">Dyskowo: <code>npm run advisor</code> → <code>docs/advisor/</code></p>
    `;
}

function renderVirtualPanel(root, report) {
    const panel = root.querySelector('.rg-hm-panel');
    if (!panel) return;
    if (!report) {
        panel.innerHTML = `
          <h3>Virtual User</h3>
          <p>Brak raportu. Uruchomienie zajmie ~15–30 s.</p>
          <div class="rg-hm-actions">
            <button type="button" data-hm="virtual-run">Start testów</button>
            <button type="button" data-hm="health-view">Health</button>
            <button type="button" data-hm="close">Zamknij</button>
          </div>`;
        return;
    }
    const s = report.summary || {};
    const hot = report.hotspots || {};
    const rows = [
        ['miganie', (hot.flicker || []).length],
        ['błędy', (hot.errors || []).length],
        ['FPS', (hot.fps || []).length],
        ['memory leak', (hot.memoryLeak || []).length],
        ['tłumaczenia', (hot.translations || []).length],
        ['responsywność', (hot.responsive || []).length],
        ['dotyk', (hot.touch || []).length],
        ['UX', (hot.ux || []).length]
    ].map(([k, v]) => `<div class="rg-hm-score"><span>${k}</span><b>${v}</b></div>`).join('');

    const issues = (report.issues || []).slice(0, 8).map((i) => `
      <div class="rg-hm-prop ${i.severity || ''}">
        <strong>[${i.type}] ${i.title}</strong><br>
        ${i.scenario || ''} · ${i.detail || ''}
      </div>`).join('') || '<p>Brak issues.</p>';

    panel.innerHTML = `
      <h3>Virtual User</h3>
      <div class="rg-hm-overall">${s.score ?? '—'}%</div>
      <p class="rg-hm-meta">OK ${s.passed ?? 0} · FAIL ${s.failed ?? 0} · issues ${s.issueCount ?? 0}</p>
      <div class="rg-hm-grid">${rows}</div>
      ${issues}
      <div class="rg-hm-actions">
        <button type="button" data-hm="virtual-run">Uruchom ponownie</button>
        <button type="button" data-hm="virtual-copy">Kopiuj JSON</button>
        <button type="button" data-hm="health-view">Health</button>
        <button type="button" data-hm="close">Zamknij</button>
      </div>
      <p class="rg-hm-meta">Dyskowo: <code>npm run virtual-user -- --import=…</code></p>
    `;
}

function renderRealUsersPanel(root, report) {
    const panel = root.querySelector('.rg-hm-panel');
    if (!panel) return;
    if (!report) {
        panel.innerHTML = `
          <h3>Real User Simulation</h3>
          <p>50 person × pełna podróż. Live ~kilka minut; heuristic jest szybki.</p>
          <div class="rg-hm-actions">
            <button type="button" data-hm="real-users-run">Live 50</button>
            <button type="button" data-hm="real-users-heuristic">Heuristic</button>
            <button type="button" data-hm="health-view">Health</button>
            <button type="button" data-hm="close">Zamknij</button>
          </div>`;
        return;
    }
    const s = report.summary || {};
    const worst = (report.worst || []).slice(0, 6).map((w) => `
      <div class="rg-hm-prop ${w.status === 'fail' ? 'high' : ''}">
        <strong>${w.code} ${w.name}</strong> — ${w.score}%<br>${w.tagline || ''}
      </div>`).join('') || '<p>Brak.</p>';

    panel.innerHTML = `
      <h3>Real User Simulation</h3>
      <div class="rg-hm-overall">${s.avgScore ?? '—'}%</div>
      <p class="rg-hm-meta">pass ${s.pass ?? 0} · warn ${s.warn ?? 0} · fail ${s.fail ?? 0} · ${s.personas ?? 0} person · ${s.mode || ''}</p>
      <p class="rg-hm-meta"><strong>Najsłabsze:</strong></p>
      ${worst}
      <div class="rg-hm-actions">
        <button type="button" data-hm="real-users-run">Live 50</button>
        <button type="button" data-hm="real-users-heuristic">Heuristic</button>
        <button type="button" data-hm="real-users-copy">Kopiuj JSON</button>
        <button type="button" data-hm="health-view">Health</button>
        <button type="button" data-hm="close">Zamknij</button>
      </div>
      <p class="rg-hm-meta">CLI: <code>npm run real-users</code> · <code>?realusers=1</code></p>
    `;
}

function renderEmotionPanel(root, report) {
    const panel = root.querySelector('.rg-hm-panel');
    if (!panel) return;
    if (!report) {
        panel.innerHTML = `
          <h3>Emotion AI</h3>
          <p>Nie „czy działa” — <strong>czy chce się wrócić?</strong></p>
          <div class="rg-hm-actions">
            <button type="button" data-hm="emotion-run">Oceń emocje</button>
            <button type="button" data-hm="health-view">Health</button>
            <button type="button" data-hm="close">Zamknij</button>
          </div>`;
        return;
    }
    const s = report.scores || {};
    const rows = [
        ['klimat', s.climate],
        ['kolory', s.colors],
        ['zdjęcia', s.photos],
        ['tekst', s.textLoad],
        ['zmęczenie↓', s.fatigue],
        ['przyjazność', s.friendliness]
    ].map(([k, v]) => `<div class="rg-hm-score"><span>${k}</span><b>${v ?? '—'}%</b></div>`).join('');

    const tips = (report.recommendations || []).slice(0, 4).map((r) => `
      <div class="rg-hm-prop">
        <strong>${r.dimension}</strong> (${r.score}%)<br>${r.tip || ''}
      </div>`).join('');

    panel.innerHTML = `
      <h3>Emotion AI</h3>
      <div class="rg-hm-overall">${report.wantToReturn?.score ?? '—'}%</div>
      <p class="rg-hm-meta"><strong>Czy chce się wrócić?</strong><br>${report.wantToReturn?.short || ''}</p>
      <p class="rg-hm-meta">${report.wantToReturn?.answer || ''}</p>
      <div class="rg-hm-grid">${rows}</div>
      ${tips}
      <div class="rg-hm-actions">
        <button type="button" data-hm="emotion-run">Odśwież</button>
        <button type="button" data-hm="emotion-copy">Kopiuj JSON</button>
        <button type="button" data-hm="health-view">Health</button>
        <button type="button" data-hm="close">Zamknij</button>
      </div>
      <p class="rg-hm-meta">CLI: <code>npm run emotion</code> · autoFix=false</p>
    `;
}

function renderLivingBrandPanel(root, report) {
    const panel = root.querySelector('.rg-hm-panel');
    if (!panel) return;
    if (!report) {
        panel.innerHTML = `
          <h3>Living Brand</h3>
          <p>Strażnik Brand Book — logo, kolory, ikony, zdjęcia, niebieski, fonty, cienie.</p>
          <div class="rg-hm-actions">
            <button type="button" data-hm="living-brand-run">Sprawdź markę</button>
            <button type="button" data-hm="health-view">Health</button>
            <button type="button" data-hm="close">Zamknij</button>
          </div>`;
        return;
    }
    const rows = (report.checks || []).map((c) => `
      <div class="rg-hm-score"><span>${c.id}</span><b>${c.score}%</b></div>`).join('');
    const findings = (report.findings || []).slice(0, 8).map((f) => `
      <div class="rg-hm-prop ${f.severity === 'critical' || f.severity === 'high' ? 'high' : ''}">
        <strong>[${f.check}] ${f.title}</strong><br>
        ${f.file || ''} ${f.detail || ''}
      </div>`).join('') || '<p>Brak odstępstw.</p>';

    panel.innerHTML = `
      <h3>Living Brand</h3>
      <div class="rg-hm-overall">${report.overall ?? '—'}%</div>
      <p class="rg-hm-meta"><strong>${report.status}</strong> — ${report.verdict || ''}</p>
      <div class="rg-hm-grid">${rows}</div>
      ${findings}
      <div class="rg-hm-actions">
        <button type="button" data-hm="living-brand-run">Odśwież</button>
        <button type="button" data-hm="living-brand-copy">Kopiuj JSON</button>
        <button type="button" data-hm="health-view">Health</button>
        <button type="button" data-hm="close">Zamknij</button>
      </div>
      <p class="rg-hm-meta">CLI: <code>npm run living-brand</code> · autoFix=false</p>
    `;
}

function renderDirectorPanel(root, report) {
    const panel = root.querySelector('.rg-hm-panel');
    if (!panel) return;
    if (!report) {
        panel.innerHTML = `
          <h3>AI Product Director</h3>
          <p>Codzienny mózg produktu — 8 pytań biznesowych.</p>
          <div class="rg-hm-actions">
            <button type="button" data-hm="director-run">Briefing dnia</button>
            <button type="button" data-hm="health-view">Health</button>
            <button type="button" data-hm="close">Zamknij</button>
          </div>`;
        return;
    }
    const qa = (report.qa || []).slice(0, 8).map((q) => `
      <div class="rg-hm-prop">
        <strong>${q.question}</strong><br>
        <span style="white-space:pre-wrap">${(q.answer || '').replace(/</g, '&lt;')}</span>
      </div>`).join('');

    panel.innerHTML = `
      <h3>AI Product Director</h3>
      <div class="rg-hm-overall">${report.productScore ?? '—'}%</div>
      <p class="rg-hm-meta"><strong>${report.headline || ''}</strong></p>
      ${qa}
      <div class="rg-hm-actions">
        <button type="button" data-hm="director-run">Odśwież</button>
        <button type="button" data-hm="director-copy">Kopiuj JSON</button>
        <button type="button" data-hm="health-view">Health</button>
        <button type="button" data-hm="close">Zamknij</button>
      </div>
      <p class="rg-hm-meta">CLI: <code>npm run director</code> · autoFix=false</p>
    `;
}

function renderImprovePanel(root, report) {
    const panel = root.querySelector('.rg-hm-panel');
    if (!panel) return;
    if (!report) {
        panel.innerHTML = `
          <h3>Co można poprawić</h3>
          <p>Brak raportu – wygeneruj.</p>
          <div class="rg-hm-actions">
            <button type="button" data-hm="improve-run">Generuj raport</button>
            <button type="button" data-hm="health-view">Health</button>
            <button type="button" data-hm="close">Zamknij</button>
          </div>`;
        return;
    }
    const items = (report.proposals || []).slice(0, 10).map((p) => `
      <div class="rg-hm-prop ${p.priority || ''}">
        <strong>${p.id} · ${p.title}</strong><br>
        priorytet: ${p.priority} · wpływ: ${p.impact} · ryzyko: ${p.risk}<br>
        <code>${p.file}</code> → <code>${p.function}</code><br>
        ${p.proposedFix || ''}
      </div>`).join('') || '<p>Brak propozycji.</p>';

    panel.innerHTML = `
      <h3>${report.title || 'Co można poprawić'}</h3>
      <div class="rg-hm-overall">${report.summary?.total ?? 0}</div>
      <p class="rg-hm-meta">propozycji · autoApply=false · ${report.day || ''}</p>
      ${items}
      <div class="rg-hm-actions">
        <button type="button" data-hm="improve-run">Odśwież</button>
        <button type="button" data-hm="improve-copy">Kopiuj JSON</button>
        <button type="button" data-hm="health-view">Health</button>
        <button type="button" data-hm="close">Zamknij</button>
      </div>
      <p class="rg-hm-meta">
        Dyskowo: <code>npm run improve</code> → <code>docs/improvements/</code><br>
        Silnik <strong>nie</strong> zmienia kodu automatycznie.
      </p>
    `;
}

async function copyReport(report) {
    const text = JSON.stringify(report, null, 2);
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        console.info('[Health Monitor] JSON report:\n', text);
        return false;
    }
}

/**
 * Panel Health – tylko po odblokowaniu vault (hasło) lub force.
 * Domyślnie bez FAB na Home/Mapie (narzędzia tylko w panelu deweloperskim).
 * @param {{ force?: boolean, showFab?: boolean }} [opts]
 */
export function initHealthDevPanel(opts = {}) {
    const { force = false, showFab = false } = opts;
    if (!force && !isDevVaultUnlocked()) return;
    if (document.getElementById(ROOT_ID)) return;

    ensureStyles();
    const root = document.createElement('div');
    root.id = ROOT_ID;
    root.innerHTML = showFab
        ? `
      <div class="rg-hm-panel" aria-live="polite"></div>
      <button type="button" class="rg-hm-fab" title="Application Health Monitor">Health</button>
    `
        : `<div class="rg-hm-panel" aria-live="polite"></div>`;
    document.body.appendChild(root);

    const fab = root.querySelector('.rg-hm-fab');
    fab?.addEventListener('click', () => {
        root.classList.toggle('open');
        if (root.classList.contains('open')) {
            renderPanel(root, getLastHealthReport());
        }
    });

    root.addEventListener('click', async (ev) => {
        const btn = ev.target.closest('[data-hm]');
        if (!btn) return;
        const act = btn.getAttribute('data-hm');
        if (act === 'close') {
            root.classList.remove('open');
            return;
        }
        if (act === 'run') {
            const report = await runHealthCheck({ reason: 'dev-panel' });
            renderPanel(root, report);
            return;
        }
        if (act === 'improve' || act === 'improve-run') {
            const report = act === 'improve-run'
                ? await generateImprovementReport({ reason: 'dev-panel' })
                : (getLastImprovementReport() || await generateImprovementReport({ reason: 'dev-panel' }));
            renderImprovePanel(root, report);
            return;
        }
        if (act === 'weekly' || act === 'weekly-run') {
            const report = act === 'weekly-run'
                ? generateWeeklyPremiumReport({ reason: 'dev-panel' })
                : (getLastWeeklyPremiumReport() || generateWeeklyPremiumReport({ reason: 'dev-panel' }));
            renderWeeklyPanel(root, report);
            return;
        }
        if (act === 'weekly-copy') {
            const ok = await copyReport(getLastWeeklyPremiumReport());
            btn.textContent = ok ? 'Skopiowano' : 'Zobacz konsolę';
            setTimeout(() => { btn.textContent = 'Kopiuj JSON'; }, 1600);
            return;
        }
        if (act === 'daily' || act === 'daily-run') {
            const report = act === 'daily-run'
                ? generateDailyDeveloperReport({ reason: 'dev-panel' })
                : (getLastDailyDeveloperReport() || generateDailyDeveloperReport({ reason: 'dev-panel' }));
            renderDailyPanel(root, report);
            return;
        }
        if (act === 'daily-copy') {
            const ok = await copyReport(getLastDailyDeveloperReport());
            btn.textContent = ok ? 'Skopiowano' : 'Zobacz konsolę';
            setTimeout(() => { btn.textContent = 'Kopiuj JSON'; }, 1600);
            return;
        }
        if (act === 'daily-email') {
            const draft = prepareDeveloperEmailDraft();
            if (!draft?.prepared) {
                btn.textContent = 'Zablokowane';
            } else if (draft.mailto) {
                window.open(draft.mailto, '_blank');
                btn.textContent = 'mailto…';
            } else {
                console.info('[Daily Report] draft (ustaw DEVELOPER_REPORT_EMAIL w CLI lub __RG_DAILY__.setEmailLocal):', draft);
                btn.textContent = 'Draft w konsoli';
            }
            setTimeout(() => { btn.textContent = 'Przygotuj e-mail'; }, 1800);
            return;
        }
        if (act === 'advisor' || act === 'advisor-run') {
            const briefing = act === 'advisor-run'
                ? generateAdvisorBriefing({ reason: 'dev-panel' })
                : (getLastAdvisorBriefing() || generateAdvisorBriefing({ reason: 'dev-panel' }));
            renderAdvisorPanel(root, briefing);
            return;
        }
        if (act === 'advisor-copy') {
            const ok = await copyReport(getLastAdvisorBriefing());
            btn.textContent = ok ? 'Skopiowano' : 'Zobacz konsolę';
            setTimeout(() => { btn.textContent = 'Kopiuj JSON'; }, 1600);
            return;
        }
        if (act === 'virtual') {
            renderVirtualPanel(root, getLastVirtualUserReport());
            return;
        }
        if (act === 'virtual-run') {
            btn.textContent = 'Testuję…';
            btn.disabled = true;
            try {
                const report = await runVirtualUser({ reason: 'dev-panel' });
                renderVirtualPanel(root, report);
            } finally {
                btn.disabled = false;
            }
            return;
        }
        if (act === 'virtual-copy') {
            const ok = await copyReport(getLastVirtualUserReport());
            btn.textContent = ok ? 'Skopiowano' : 'Zobacz konsolę';
            setTimeout(() => { btn.textContent = 'Kopiuj JSON'; }, 1600);
            return;
        }
        if (act === 'real-users') {
            renderRealUsersPanel(root, getLastRealUserReport());
            return;
        }
        if (act === 'real-users-run' || act === 'real-users-heuristic') {
            const live = act === 'real-users-run';
            btn.textContent = live ? 'Live…' : 'Heuristic…';
            btn.disabled = true;
            try {
                const report = await runRealUserSimulation({
                    reason: 'dev-panel',
                    mode: live ? 'live' : 'heuristic'
                });
                renderRealUsersPanel(root, report);
            } finally {
                btn.disabled = false;
            }
            return;
        }
        if (act === 'real-users-copy') {
            const ok = await copyReport(getLastRealUserReport());
            btn.textContent = ok ? 'Skopiowano' : 'Zobacz konsolę';
            setTimeout(() => { btn.textContent = 'Kopiuj JSON'; }, 1600);
            return;
        }
        if (act === 'emotion') {
            renderEmotionPanel(root, getLastEmotionReport());
            return;
        }
        if (act === 'emotion-run') {
            const report = generateEmotionReport({ reason: 'dev-panel' });
            renderEmotionPanel(root, report);
            return;
        }
        if (act === 'emotion-copy') {
            const ok = await copyReport(getLastEmotionReport());
            btn.textContent = ok ? 'Skopiowano' : 'Zobacz konsolę';
            setTimeout(() => { btn.textContent = 'Kopiuj JSON'; }, 1600);
            return;
        }
        if (act === 'living-brand') {
            renderLivingBrandPanel(root, getLastLivingBrandReport());
            return;
        }
        if (act === 'living-brand-run') {
            const report = generateLivingBrandReport({ reason: 'dev-panel' });
            renderLivingBrandPanel(root, report);
            return;
        }
        if (act === 'living-brand-copy') {
            const ok = await copyReport(getLastLivingBrandReport());
            btn.textContent = ok ? 'Skopiowano' : 'Zobacz konsolę';
            setTimeout(() => { btn.textContent = 'Kopiuj JSON'; }, 1600);
            return;
        }
        if (act === 'director') {
            renderDirectorPanel(root, getLastProductDirectorBriefing());
            return;
        }
        if (act === 'director-run') {
            const report = generateProductDirectorBriefing({ reason: 'dev-panel' });
            renderDirectorPanel(root, report);
            return;
        }
        if (act === 'director-copy') {
            const ok = await copyReport(getLastProductDirectorBriefing());
            btn.textContent = ok ? 'Skopiowano' : 'Zobacz konsolę';
            setTimeout(() => { btn.textContent = 'Kopiuj JSON'; }, 1600);
            return;
        }
        if (act === 'health-view') {
            renderPanel(root, getLastHealthReport());
            return;
        }
        if (act === 'copy') {
            const ok = await copyReport(getLastHealthReport());
            btn.textContent = ok ? 'Skopiowano' : 'Zobacz konsolę';
            setTimeout(() => { btn.textContent = 'Kopiuj JSON'; }, 1600);
            return;
        }
        if (act === 'improve-copy') {
            const ok = await copyReport(getLastImprovementReport());
            btn.textContent = ok ? 'Skopiowano' : 'Zobacz konsolę';
            setTimeout(() => { btn.textContent = 'Kopiuj JSON'; }, 1600);
        }
    });

    document.addEventListener('rg:health-report', (ev) => {
        if (root.classList.contains('open') && !root.dataset.viewImprove) {
            renderPanel(root, ev.detail);
        }
        const overall = ev.detail?.overall;
        if (typeof overall === 'number' && fab) {
            fab.textContent = `Health ${overall}%`;
        }
    });

    document.addEventListener('rg:improvement-report', (ev) => {
        if (root.classList.contains('open')) {
            renderImprovePanel(root, ev.detail);
        }
    });

    document.addEventListener('rg:virtual-user-report', (ev) => {
        if (root.classList.contains('open')) {
            renderVirtualPanel(root, ev.detail);
        }
    });

    document.addEventListener('rg:advisor-briefing', (ev) => {
        if (root.classList.contains('open')) {
            renderAdvisorPanel(root, ev.detail);
        }
    });

    document.addEventListener('rg:daily-dev-report', (ev) => {
        if (root.classList.contains('open')) {
            renderDailyPanel(root, ev.detail);
        }
    });

    document.addEventListener('rg:weekly-premium-report', (ev) => {
        if (root.classList.contains('open')) {
            renderWeeklyPanel(root, ev.detail);
        }
    });

    window.__RG_HEALTH__ = {
        open: openHealthDevPanel,
        close: () => document.getElementById(ROOT_ID)?.classList.remove('open'),
        init: initHealthDevPanel
    };
}

/** Otwórz panel Health (bez FAB na Home/Mapie). */
export function openHealthDevPanel() {
    if (!isDevVaultUnlocked()) {
        console.info('[Health] odblokuj: ☰ → Panel deweloperski (hasło)');
        return null;
    }
    initHealthDevPanel({ force: true, showFab: false });
    const root = document.getElementById(ROOT_ID);
    if (!root) return null;
    root.classList.add('open');
    renderPanel(root, getLastHealthReport());
    return root;
}

export default { initHealthDevPanel, openHealthDevPanel };
