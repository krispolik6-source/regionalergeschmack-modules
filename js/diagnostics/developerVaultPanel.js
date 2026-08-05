/**
 * ETAP 34A / 34C — Developer Control Center (UI)
 * Panel wyłącznie dla właściciela (PIN).
 * Scentralizowany strumień raportów — wszystkie kategorie, auto-czyszczenie >30 dni.
 * Bez nowych silników · bez autoApply/autoFix · bez zmian Home/Map/app.js.
 */

import { t } from '../core/i18n.js';
import { showToast } from '../core/toast.js';
import {
    isDevVaultUnlocked,
    unlockDevVault,
    lockDevVault
} from './devVault.js';
import {
    copyStreamEntry,
    deleteStreamEntry,
    formatSystemStreamEntry,
    loadUnifiedReportStream,
    fetchReportFullText
} from './reportManagerClient.js';
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
#${ROOT_ID} .rg-dv-report-list{list-style:none;padding:0;margin:0}
#${ROOT_ID} .rg-dv-report-list li{display:flex;align-items:flex-start;gap:10px;padding:12px 0;border-bottom:1px solid rgba(42,63,40,.12)}
#${ROOT_ID} .rg-dv-report-list li:last-child{border-bottom:0}
#${ROOT_ID} .rg-dv-report-tag{flex:0 0 auto;font-size:.72rem;font-weight:700;padding:3px 8px;border-radius:999px;background:rgba(42,63,40,.1);color:#2a3f28;white-space:nowrap;margin-top:2px;line-height:1.3}
#${ROOT_ID} .rg-dv-report-empty{margin:16px 0;padding:20px 16px;text-align:center;background:rgba(255,255,255,.55);border:1px dashed rgba(42,63,40,.18);border-radius:12px;color:#4a3f32;font-size:.95rem}
#${ROOT_ID} .rg-dcc-pre{white-space:pre-wrap;font-size:.85rem;line-height:1.45;background:rgba(255,255,255,.7);border-radius:10px;padding:10px;border:1px solid rgba(42,63,40,.1);max-height:40vh;overflow:auto}
#${ROOT_ID} .rg-dv-err{color:#8a2b2b;font-size:.9rem;margin:0 0 8px}
#${ROOT_ID} .rg-dcc-btn-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
#${ROOT_ID} .rg-dcc-btn-row button{font-size:.82rem;padding:7px 10px}
#${ROOT_ID} .rg-dcc-danger{background:transparent;color:#6b1d1d;border:1px solid rgba(140,40,40,.35)!important}
`;
    document.head.appendChild(style);
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
    const streamId = escapeHtml(entry.streamId || pathHint);
    return `
      <li>
        <span class="rg-dv-report-tag" aria-label="Kategoria">${escapeHtml(entry.categoryLabel || '[Report]')}</span>
        <div style="flex:1;min-width:0">
          <strong>${escapeHtml(title)}</strong>
          <p style="margin:4px 0 0;color:#4a3f32;font-size:.82rem">${escapeHtml(when)} · ${escapeHtml(pathHint)}</p>
          <div class="rg-dcc-btn-row">
            <button type="button" class="rg-dv-secondary" data-dv-open-id="${streamId}">${label('devVault.openReport', 'Otwórz')}</button>
            <button type="button" class="rg-dv-secondary" data-dv-copy-id="${streamId}">📋 Kopiuj raport</button>
            <button type="button" class="rg-dcc-danger" data-dv-del-id="${streamId}">🗑 Usuń raport</button>
          </div>
        </div>
      </li>`;
}

async function openReportByRel(detail, rel) {
    if (!detail) return;
    detail.textContent = label('devVault.loading', 'Ładowanie…');
    const r = await fetchReportFullText(rel);
    detail.textContent = r.ok
        ? r.text
        : label('devVault.reportMissing', 'Brak lokalnego raportu. Uruchom CLI, potem odśwież.');
}

function bindUnifiedReportListActions(body, stream, { onMutated } = {}) {
    const detail = body.querySelector('[data-dv-report-detail]');
    const byId = new Map((stream || []).map((entry) => [entry.streamId, entry]));

    body.querySelectorAll('[data-dv-open-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const entry = byId.get(btn.getAttribute('data-dv-open-id'));
            if (!entry) return;
            if (entry.kind === 'system') {
                if (detail) detail.textContent = formatSystemStreamEntry(entry.systemEntry);
                return;
            }
            void openReportByRel(detail, entry.rel);
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
                if (detail) detail.textContent = 'Raport usunięty.';
                onMutated?.();
            } else {
                showToast(r.data?.reason || 'Nie usunięto', 'error');
            }
        });
    });
}

async function renderUnifiedReportsSection(body) {
    body.innerHTML = `<p class="lead">${label('devVault.loading', 'Ładowanie…')}</p>`;

    const stream = await loadUnifiedReportStream();
    const rows = stream.map((entry) => unifiedReportRowHtml(entry)).join('');

    body.innerHTML = `
      <div class="rg-dcc-section">
        <h3>Raporty</h3>
        <p class="lead">${label('devVault.reportsHint', 'Wszystkie kategorie w jednym strumieniu. Auto-czyszczenie wpisów starszych niż 30 dni.')}</p>
        ${rows
            ? `<ul class="rg-dv-report-list">${rows}</ul>`
            : `<p class="rg-dv-report-empty" role="status">Brak raportów do wyświetlenia.</p>`}
        <div class="rg-dcc-pre" data-dv-report-detail style="margin-top:12px"></div>
        <div class="rg-dcc-btn-row" style="margin-top:12px">
          <button type="button" class="rg-dv-secondary" data-dv-reports-refresh>Odśwież strumień</button>
        </div>
      </div>
    `;

    bindUnifiedReportListActions(body, stream, {
        onMutated: () => { void renderUnifiedReportsSection(body); }
    });

    body.querySelector('[data-dv-reports-refresh]')?.addEventListener('click', () => {
        void renderUnifiedReportsSection(body);
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
          <p class="rg-dcc-sub">Version ${escapeHtml(verShort)} · Panel deweloperski · Raporty</p>
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

    await renderUnifiedReportsSection(body);
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
        unlocked: isDevVaultUnlocked
    };
}
