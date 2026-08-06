/**
 * ETAP 42E — Runtime Error Feed (UI)
 * Ostatnie 100 błędów · mobile/PWA · bez DevTools · tylko Dev Vault.
 */

import { showToast } from '../core/toast.js';
import { isDeveloperAccessGranted } from './devVault.js';
import {
    ERROR_CATEGORIES,
    MAX_ERRORS,
    getRuntimeErrors,
    clearRuntimeErrors,
    countRuntimeErrors,
    getCategoryLabel,
    saveRuntimeError
} from './runtimeErrorStore.js';

const PANEL_ID = 'rg-runtime-error-feed-root';
const STYLE_ID = 'rg-runtime-error-feed-style';

/** @type {string | null} */
let activeFilter = null;
/** @type {(() => void) | null} */
let liveRefresh = null;

function escapeHtml(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatTime(iso) {
    try {
        const d = new Date(iso);
        return d.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch {
        return String(iso || '');
    }
}

function levelTone(level) {
    if (level === 'info') return 'info';
    if (level === 'warn') return 'warn';
    return 'fail';
}

async function probeRuntimeSignals() {
    if ('caches' in window) {
        try {
            const keys = await caches.keys();
            if (keys.length === 0) {
                saveRuntimeError({
                    category: 'cache',
                    level: 'warn',
                    message: 'Cache API: brak zarejestrowanych cache',
                    source: 'caches.keys()'
                });
            }
        } catch (err) {
            saveRuntimeError({
                category: 'cache',
                message: `Cache probe failed: ${err?.message || err}`,
                stack: err?.stack || '',
                source: 'caches'
            });
        }
    }

    try {
        const link = document.querySelector('link[rel="manifest"]');
        const href = link?.getAttribute('href');
        if (!href) {
            saveRuntimeError({
                category: 'manifest',
                level: 'warn',
                message: 'Brak link rel=manifest w dokumencie',
                source: 'document'
            });
        } else {
            const res = await fetch(href, { cache: 'no-store' });
            if (!res.ok) {
                saveRuntimeError({
                    category: 'manifest',
                    message: `Manifest HTTP ${res.status}`,
                    source: href,
                    url: href,
                    status: res.status
                });
            }
        }
    } catch (err) {
        saveRuntimeError({
            category: 'manifest',
            message: `Manifest fetch failed: ${err?.message || err}`,
            stack: err?.stack || '',
            source: 'manifest'
        });
    }

    if (navigator.storage?.estimate) {
        try {
            const est = await navigator.storage.estimate();
            const usage = est.usage || 0;
            const quota = est.quota || 0;
            const pct = quota > 0 ? Math.round((usage / quota) * 100) : 0;
            if (pct >= 85) {
                saveRuntimeError({
                    category: 'storage',
                    level: 'warn',
                    message: `Storage ${pct}% (${Math.round(usage / 1048576)} / ${Math.round(quota / 1048576)} MB)`,
                    source: 'storage.estimate',
                    extra: { usage, quota, pct }
                });
            }
        } catch (err) {
            saveRuntimeError({
                category: 'storage',
                message: `Storage estimate failed: ${err?.message || err}`,
                source: 'storage.estimate'
            });
        }
    }

    try {
        const mem = performance?.memory;
        if (mem?.jsHeapSizeLimit && mem.usedJSHeapSize) {
            const pct = Math.round((mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100);
            if (pct >= 80) {
                saveRuntimeError({
                    category: 'memory',
                    level: 'warn',
                    message: `JS heap ${pct}% (${Math.round(mem.usedJSHeapSize / 1048576)} MB)`,
                    source: 'performance.memory',
                    extra: {
                        usedMb: Math.round(mem.usedJSHeapSize / 1048576),
                        limitMb: Math.round(mem.jsHeapSizeLimit / 1048576),
                        pct
                    }
                });
            }
        }
    } catch {
        /* ignore */
    }

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        saveRuntimeError({
            category: 'network',
            level: 'warn',
            message: 'Urządzenie offline przy otwarciu feedu',
            source: 'navigator.onLine'
        });
    }
}

function mergeHealthMonitorErrors() {
    try {
        const health = window.__RG_HEALTH__?.state?.();
        if (!health) return;
        for (const e of health.jsErrors || []) {
            saveRuntimeError({
                category: e.source === 'promise' ? 'promise' : 'js',
                message: e.msg || e.message || 'JS error',
                source: e.source || 'healthMonitor',
                extra: { from: 'healthMonitor' }
            });
        }
        for (const src of health.imageErrors || []) {
            saveRuntimeError({
                category: 'image',
                message: `Image failed: ${src}`,
                source: src,
                url: src,
                extra: { from: 'healthMonitor' }
            });
        }
    } catch {
        /* ignore */
    }
}

function buildCategoryCounts() {
    const counts = { all: countRuntimeErrors() };
    for (const c of ERROR_CATEGORIES) {
        counts[c.id] = countRuntimeErrors(c.id);
    }
    return counts;
}

function renderFilterChips(counts) {
    const chips = [
        { id: null, label: 'All', count: counts.all }
    ].concat(ERROR_CATEGORIES.map((c) => ({
        id: c.id,
        label: c.label,
        count: counts[c.id] || 0
    })));

    return chips.map((chip) => {
        const active = activeFilter === chip.id || (!activeFilter && chip.id === null);
        return `<button type="button" class="rg-ref-chip${active ? ' active' : ''}" data-ref-filter="${chip.id ?? 'all'}">
          ${escapeHtml(chip.label)}${chip.count ? ` <span class="rg-ref-chip-n">${chip.count}</span>` : ''}
        </button>`;
    }).join('');
}

function renderErrorList(errors) {
    if (!errors.length) {
        return `<p class="rg-ref-empty" role="status">Brak błędów w tej kategorii. Sesja czysta.</p>`;
    }

    return `<ul class="rg-ref-list" role="list">${errors.map((e) => {
        const tone = levelTone(e.level);
        const catLabel = getCategoryLabel(e.category);
        const details = [
            e.source ? `Source: ${e.source}` : '',
            e.url && e.url !== e.source ? `URL: ${e.url}` : '',
            e.status ? `HTTP ${e.status}` : '',
            e.online === false ? 'Offline' : '',
            e.memory ? `Heap ${e.memory.usedMb}/${e.memory.limitMb} MB` : ''
        ].filter(Boolean).join(' · ');

        return `<li class="rg-ref-item rg-ref-item--${tone}">
          <button type="button" class="rg-ref-item-head" data-ref-toggle="${escapeHtml(e.id)}" aria-expanded="false">
            <span class="rg-ref-cat">${escapeHtml(catLabel)}</span>
            <span class="rg-ref-time">${escapeHtml(formatTime(e.at))}</span>
            <span class="rg-ref-msg">${escapeHtml(e.message)}</span>
          </button>
          <div class="rg-ref-item-body" id="ref-body-${escapeHtml(e.id)}" hidden>
            ${details ? `<p class="rg-ref-meta">${escapeHtml(details)}</p>` : ''}
            ${e.stack ? `<pre class="rg-ref-stack">${escapeHtml(e.stack)}</pre>` : ''}
          </div>
        </li>`;
    }).join('')}</ul>`;
}

function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
#${PANEL_ID}{position:fixed;inset:0;z-index:100080;display:none;flex-direction:column;background:#f5efe3;font-family:'Source Sans 3',system-ui,sans-serif;color:#1c1812;-webkit-overflow-scrolling:touch}
#${PANEL_ID}.open{display:flex}
#${PANEL_ID} .rg-ref-head{flex:0 0 auto;background:linear-gradient(180deg,#1e3220,#2a3f28);color:#f5efe3;padding:14px 16px 12px;border-bottom:2px solid #c9a227}
#${PANEL_ID} .rg-ref-head h2{margin:0;font-family:Literata,Georgia,serif;font-size:clamp(1.1rem,4vw,1.35rem)}
#${PANEL_ID} .rg-ref-head p{margin:4px 0 0;font-size:.82rem;opacity:.9;line-height:1.35}
#${PANEL_ID} .rg-ref-toolbar{flex:0 0 auto;padding:10px 12px;border-bottom:1px solid rgba(42,63,40,.12);background:rgba(255,254,248,.95)}
#${PANEL_ID} .rg-ref-chips{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;scrollbar-width:thin;-webkit-overflow-scrolling:touch}
#${PANEL_ID} .rg-ref-chip{flex:0 0 auto;border:1px solid rgba(42,63,40,.22);background:#fffef8;border-radius:999px;padding:7px 12px;font:inherit;font-size:.78rem;font-weight:700;color:#2a3f28;cursor:pointer;min-height:36px;white-space:nowrap}
#${PANEL_ID} .rg-ref-chip.active{background:#2a3f28;color:#f5efe3;border-color:#2a3f28}
#${PANEL_ID} .rg-ref-chip-n{opacity:.85;font-weight:800;margin-left:2px}
#${PANEL_ID} .rg-ref-body{flex:1 1 auto;overflow:auto;padding:8px 12px 16px}
#${PANEL_ID} .rg-ref-list{list-style:none;margin:0;padding:0}
#${PANEL_ID} .rg-ref-item{border:1px solid rgba(42,63,40,.12);border-radius:12px;margin-bottom:8px;background:#fffef8;overflow:hidden}
#${PANEL_ID} .rg-ref-item--fail{border-color:rgba(180,60,60,.35)}
#${PANEL_ID} .rg-ref-item--warn{border-color:rgba(201,162,39,.45)}
#${PANEL_ID} .rg-ref-item-head{width:100%;text-align:left;border:0;background:transparent;padding:12px;font:inherit;cursor:pointer;min-height:44px}
#${PANEL_ID} .rg-ref-cat{display:inline-block;font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#2a3f28;background:rgba(42,63,40,.08);padding:2px 8px;border-radius:999px;margin-right:6px}
#${PANEL_ID} .rg-ref-time{display:block;font-size:.72rem;color:#6a5f52;margin:4px 0 2px}
#${PANEL_ID} .rg-ref-msg{display:block;font-size:.9rem;line-height:1.35;color:#1c1812;word-break:break-word}
#${PANEL_ID} .rg-ref-item-body{padding:0 12px 12px}
#${PANEL_ID} .rg-ref-meta{margin:0 0 8px;font-size:.78rem;color:#4a3f32;line-height:1.4;word-break:break-all}
#${PANEL_ID} .rg-ref-stack{margin:0;font-size:.75rem;line-height:1.4;background:rgba(42,63,40,.06);border:1px solid rgba(42,63,40,.1);border-radius:8px;padding:10px;overflow:auto;max-height:180px;white-space:pre-wrap;word-break:break-word}
#${PANEL_ID} .rg-ref-empty{margin:24px 8px;text-align:center;color:#4a3f32;font-size:.95rem}
#${PANEL_ID} .rg-ref-foot{flex:0 0 auto;display:flex;flex-wrap:wrap;gap:8px;padding:10px 12px;border-top:1px solid rgba(42,63,40,.14);background:rgba(255,254,248,.95)}
#${PANEL_ID} .rg-ref-foot button{border:0;border-radius:10px;padding:10px 14px;font-weight:700;cursor:pointer;font:inherit;min-height:44px;font-size:.88rem}
#${PANEL_ID} .rg-ref-primary{background:#2a3f28;color:#f5efe3}
#${PANEL_ID} .rg-ref-secondary{background:transparent;color:#2a3f28;border:1px solid rgba(42,63,40,.3)!important}
#${PANEL_ID} .rg-ref-danger{background:transparent;color:#6b1d1d;border:1px solid rgba(140,40,40,.35)!important}
`;
    document.head.appendChild(style);
}

function bindListInteractions(root) {
    root.querySelectorAll('[data-ref-toggle]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-ref-toggle');
            const body = root.querySelector(`#ref-body-${id}`);
            if (!body) return;
            const open = body.hidden;
            body.hidden = !open;
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    });
}

function getFilteredErrors() {
    const all = getRuntimeErrors();
    if (!activeFilter) return all;
    return all.filter((e) => e.category === activeFilter);
}

async function paintPanel(root) {
    const counts = buildCategoryCounts();
    const errors = getFilteredErrors();
    const toolbar = root.querySelector('[data-ref-toolbar]');
    const body = root.querySelector('[data-ref-body]');
    const subtitle = root.querySelector('[data-ref-subtitle]');

    if (subtitle) {
        subtitle.textContent = `${counts.all} / ${MAX_ERRORS} błędów · lokalnie · bez DevTools`;
    }
    if (toolbar) toolbar.innerHTML = renderFilterChips(counts);
    if (body) {
        body.innerHTML = renderErrorList(errors);
        bindListInteractions(root);
    }

    toolbar?.querySelectorAll('[data-ref-filter]').forEach((chip) => {
        chip.addEventListener('click', () => {
            const v = chip.getAttribute('data-ref-filter');
            activeFilter = v === 'all' ? null : v;
            void paintPanel(root);
        });
    });
}

function closeRuntimeErrorFeedPanel() {
    const root = document.getElementById(PANEL_ID);
    if (!root) return;
    root.classList.remove('open');
    root.hidden = true;
    if (liveRefresh) {
        window.removeEventListener('rg:runtime-error', liveRefresh);
        liveRefresh = null;
    }
}

/**
 * Otwórz pełnoekranowy feed błędów (mobile / PWA).
 */
export async function openRuntimeErrorFeedPanel() {
    if (!isDeveloperAccessGranted()) {
        showToast('Odblokuj Panel deweloperski (PIN)');
        return;
    }

    ensureStyles();
    let root = document.getElementById(PANEL_ID);
    if (!root) {
        root = document.createElement('div');
        root.id = PANEL_ID;
        root.setAttribute('role', 'dialog');
        root.setAttribute('aria-modal', 'true');
        root.setAttribute('aria-label', 'Runtime Error Feed');
        document.body.appendChild(root);
    }

    root.innerHTML = `
      <header class="rg-ref-head">
        <h2>Runtime Error Feed</h2>
        <p data-ref-subtitle>Ładowanie…</p>
      </header>
      <div class="rg-ref-toolbar" data-ref-toolbar></div>
      <div class="rg-ref-body" data-ref-body><p class="rg-ref-empty">Ładowanie…</p></div>
      <footer class="rg-ref-foot">
        <button type="button" class="rg-ref-primary" data-ref-refresh>Odśwież</button>
        <button type="button" class="rg-ref-secondary" data-ref-copy>Kopiuj JSON</button>
        <button type="button" class="rg-ref-danger" data-ref-clear>Wyczyść</button>
        <button type="button" class="rg-ref-secondary" data-ref-close>Zamknij</button>
      </footer>
    `;

    root.classList.add('open');
    root.hidden = false;

    root.querySelector('[data-ref-close]')?.addEventListener('click', closeRuntimeErrorFeedPanel);
    root.querySelector('[data-ref-refresh]')?.addEventListener('click', async () => {
        await probeRuntimeSignals();
        mergeHealthMonitorErrors();
        await paintPanel(root);
        showToast('Feed odświeżony');
    });
    root.querySelector('[data-ref-clear]')?.addEventListener('click', () => {
        if (!window.confirm('Wyczyścić wszystkie wpisy feedu?')) return;
        clearRuntimeErrors();
        void paintPanel(root);
        showToast('Feed wyczyszczony');
    });
    root.querySelector('[data-ref-copy]')?.addEventListener('click', async () => {
        try {
            const json = JSON.stringify(getRuntimeErrors(), null, 2);
            await navigator.clipboard.writeText(json);
            showToast('Skopiowano JSON');
        } catch {
            showToast('Nie udało się skopiować');
        }
    });

    if (liveRefresh) window.removeEventListener('rg:runtime-error', liveRefresh);
    liveRefresh = () => { void paintPanel(root); };
    window.addEventListener('rg:runtime-error', liveRefresh);

    await probeRuntimeSignals();
    mergeHealthMonitorErrors();
    await paintPanel(root);
}

export function initRuntimeErrorFeed() {
    window.__RG_ERROR_FEED__ = {
        open: () => openRuntimeErrorFeedPanel(),
        reports: getRuntimeErrors,
        clear: clearRuntimeErrors,
        count: countRuntimeErrors,
        categories: ERROR_CATEGORIES,
        policy: {
            autoFix: false,
            localOnly: true,
            maxErrors: MAX_ERRORS,
            devVaultOnly: true
        }
    };
}

export default {
    initRuntimeErrorFeed,
    openRuntimeErrorFeedPanel
};
