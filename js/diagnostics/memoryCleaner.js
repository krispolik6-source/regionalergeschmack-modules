/**
 * ETAP 43 — Memory Cleaner
 *
 * Pilnuje: localStorage · Cache API · IndexedDB · stare raporty/logi strażników.
 * Pokazuje Storage Health i jednym kliknięciem czyści wyłącznie bezpieczne dane.
 * Nie rusza ustawień, ulubionych, koszyka, Premium, auth, GPS, map prefs.
 */

import { showToast } from '../core/toast.js';
import { PWA_CACHE_PREFIX_KEEP } from '../core/pwaVersion.js';
const LEARNING_IDB = 'rg_learning_engine';
const LEARNING_STORE = 'signals';
const LEARNING_KEEP = 80;

/** Klucze LS — bezpieczne do usunięcia w całości. */
const SAFE_LS_EXACT = new Set([
    'rg_console_guardian_v1',
    'rg_runtime_error_feed_v1',
    'rg_ui_guardian_v1',
    'rg_map_guardian_v1',
    'rg_self_heal_log',
    'rg_self_heal_day',
    'rg_learning_events_v1',
    'rg_improvement_history_v1',
    'rg_dev_dashboard_history_v1',
    'rg_real_user_sim_report_v1',
    'rg_virtual_user_last',
    'rg_log_level',
    'rg_ai_guardian_probe',
    'rg_push_content_snapshot',
    'rg_push_season_notified',
    'rg_push_nearby_ids'
]);

const SAFE_LS_PREFIXES = [
    'rg_console_guardian',
    'rg_ui_guardian',
    'rg_map_guardian',
    'rg_self_heal',
    'rg_health_',
    'rg_guardian_',
    'rg_virtual_',
    'rg_runtime_error',
    'rg_dream_',
    'rg_weekly_premium',
    'rg_daily_dev',
    'rg_emotion_',
    'rg_living_brand',
    'rg_product_director',
    'rg_project_advisor',
    'rg_improvement_'
];

/** Nigdy nie usuwaj (produkt / konto / lokalizacja). */
const PROTECTED_EXACT = new Set([
    'regionalny_smak_settings',
    'rg_settings_v1',
    'rg_settings',
    'rs_lang',
    'rg_lang',
    'rg_last_position',
    'rg_map_prefs_v1',
    'rg_learning_model_v1',
    'rg_premium_v1',
    'rg_premium_user',
    'rg_premium_producer',
    'rg_paypal_pending',
    'rg_paypal_pending_at',
    'rg_trial_sync_mode',
    'rg_trial_last_sync',
    'rg_trial_reminder',
    'rg_push_subscription',
    'rg_favorites_v1',
    'rg_cart_v1',
    'rg_taste_diary_v1',
    'rg_user_history_v1',
    'rg_offline_queue_v1',
    'rg_referral_v1',
    'rg_community_reports_v1',
    'rg_producer_reviews',
    'rg_promoted_producers',
    'rg_admin_trust_overrides_v1'
]);

const PROTECTED_PREFIXES = [
    'regionalny_smak',
    'rg_settings',
    'rg_premium',
    'rg_auth',
    'rg_user_',
    'rg_favorites',
    'rg_cart',
    'rg_taste',
    'rg_map_prefs',
    'rg_producers_data',
    'rg_osm_',
    'rg_last_position',
    'rg_shopping',
    'supabase',
    'sb-'
];

const PANEL_ID = 'rg-memory-cleaner-root';
const STYLE_ID = 'rg-memory-cleaner-style';

function isProtectedKey(key) {
    const k = String(key || '');
    if (PROTECTED_EXACT.has(k)) return true;
    return PROTECTED_PREFIXES.some((p) => k === p || k.startsWith(p));
}

function isSafeKey(key) {
    const k = String(key || '');
    if (isProtectedKey(k)) return false;
    if (SAFE_LS_EXACT.has(k)) return true;
    return SAFE_LS_PREFIXES.some((p) => k === p || k.startsWith(p));
}

function byteLen(str) {
    try {
        return new Blob([String(str ?? '')]).size;
    } catch {
        return String(str ?? '').length;
    }
}

function formatBytes(n) {
    const v = Number(n) || 0;
    if (v < 1024) return `${v} B`;
    if (v < 1024 * 1024) return `${(v / 1024).toFixed(1)} KB`;
    return `${(v / (1024 * 1024)).toFixed(1)} MB`;
}

function listLocalStorageEntries() {
    const items = [];
    if (typeof localStorage === 'undefined') return items;
    for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (!key) continue;
        let value = '';
        try {
            value = localStorage.getItem(key) || '';
        } catch {
            value = '';
        }
        const bytes = byteLen(key) + byteLen(value);
        let entries = 1;
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) entries = parsed.length;
            else if (parsed && Array.isArray(parsed.findings)) entries = parsed.findings.length;
            else if (parsed && Array.isArray(parsed.events)) entries = parsed.events.length;
            else if (parsed && Array.isArray(parsed.fixes)) entries = parsed.fixes.length;
        } catch {
            /* scalar */
        }
        items.push({
            key,
            bytes,
            entries,
            safe: isSafeKey(key),
            protected: isProtectedKey(key)
        });
    }
    return items;
}

async function measureCaches() {
    const result = {
        names: [],
        staleNames: [],
        keepNames: [],
        bytes: 0,
        entryCount: 0
    };
    if (typeof caches === 'undefined') return result;

    let names = [];
    try {
        names = await caches.keys();
    } catch {
        return result;
    }

    result.names = names;
    for (const name of names) {
        const keep = PWA_CACHE_PREFIX_KEEP.some((p) => name === p || name.startsWith(p));
        if (keep) result.keepNames.push(name);
        else result.staleNames.push(name);

        try {
            const cache = await caches.open(name);
            const reqs = await cache.keys();
            result.entryCount += reqs.length;
            // Próbka rozmiaru (max 40 odpowiedzi / cache) — bez pełnego pobierania sieci
            const sample = reqs.slice(0, 40);
            for (const req of sample) {
                try {
                    const res = await cache.match(req);
                    if (!res) continue;
                    const clone = res.clone();
                    const buf = await clone.arrayBuffer();
                    result.bytes += buf.byteLength;
                } catch {
                    result.bytes += 8 * 1024; // estimate
                }
            }
            if (reqs.length > sample.length) {
                const avg = sample.length ? result.bytes / sample.length : 12 * 1024;
                result.bytes += Math.round(avg * (reqs.length - sample.length));
            }
        } catch {
            /* ignore */
        }
    }
    return result;
}

async function measureLearningIdb() {
    const out = { name: LEARNING_IDB, count: 0, bytesEstimate: 0, excess: 0 };
    if (typeof indexedDB === 'undefined') return out;

    try {
        const db = await new Promise((resolve, reject) => {
            const req = indexedDB.open(LEARNING_IDB, 1);
            req.onupgradeneeded = () => {
                const d = req.result;
                if (!d.objectStoreNames.contains(LEARNING_STORE)) {
                    d.createObjectStore(LEARNING_STORE, { keyPath: 'id', autoIncrement: true });
                }
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });

        const rows = await new Promise((resolve, reject) => {
            try {
                const tx = db.transaction(LEARNING_STORE, 'readonly');
                const r = tx.objectStore(LEARNING_STORE).getAll();
                r.onsuccess = () => resolve(r.result || []);
                r.onerror = () => reject(r.error);
            } catch (e) {
                resolve([]);
            }
        });
        db.close();
        out.count = rows.length;
        out.excess = Math.max(0, rows.length - LEARNING_KEEP);
        try {
            out.bytesEstimate = byteLen(JSON.stringify(rows.slice(0, 20))) * Math.ceil(rows.length / 20);
        } catch {
            out.bytesEstimate = rows.length * 256;
        }
    } catch {
        /* ignore */
    }
    return out;
}

async function storageEstimate() {
    try {
        if (navigator.storage?.estimate) {
            const e = await navigator.storage.estimate();
            return {
                usage: e.usage || 0,
                quota: e.quota || 0
            };
        }
    } catch {
        /* ignore */
    }
    return { usage: 0, quota: 0 };
}

/**
 * Pełny raport Storage Health.
 */
export async function getStorageHealth() {
    const ls = listLocalStorageEntries();
    const cachesInfo = await measureCaches();
    const idb = await measureLearningIdb();
    const estimate = await storageEstimate();

    const safeItems = ls.filter((x) => x.safe);
    const protectedItems = ls.filter((x) => x.protected);
    const otherItems = ls.filter((x) => !x.safe && !x.protected);

    const reportEntries = safeItems.reduce((n, x) => n + (x.entries || 1), 0) + idb.count;
    const toDeleteKeys = safeItems.length + cachesInfo.staleNames.length + (idb.excess > 0 ? 1 : 0);
    const toDeleteEntries = safeItems.reduce((n, x) => n + (x.entries || 1), 0)
        + cachesInfo.staleNames.length
        + idb.excess;

    const lsBytes = ls.reduce((n, x) => n + x.bytes, 0);
    const safeBytes = safeItems.reduce((n, x) => n + x.bytes, 0);
    const cacheBytes = cachesInfo.bytes;

    // Health: im więcej śmieci / ciśnienia, tym niżej
    const quota = estimate.quota || 50 * 1024 * 1024;
    const usage = estimate.usage || (lsBytes + cacheBytes + idb.bytesEstimate);
    const pressure = Math.min(1, usage / Math.max(quota, 1));
    const junkRatio = Math.min(1, (safeBytes + idb.excess * 200) / Math.max(lsBytes + 1, 1));
    const staleCachePenalty = Math.min(0.25, cachesInfo.staleNames.length * 0.06);
    const health = Math.round(
        Math.max(0, Math.min(100, 100 - pressure * 35 - junkRatio * 40 - staleCachePenalty * 100))
    );

    return {
        at: new Date().toISOString(),
        health,
        cacheBytes,
        cacheHuman: formatBytes(cacheBytes),
        cacheNames: cachesInfo.names.length,
        staleCaches: cachesInfo.staleNames.length,
        keepCaches: cachesInfo.keepNames,
        reports: reportEntries,
        toDelete: toDeleteEntries,
        toDeleteKeys,
        localStorage: {
            keys: ls.length,
            bytes: lsBytes,
            human: formatBytes(lsBytes),
            safeKeys: safeItems.length,
            protectedKeys: protectedItems.length,
            otherKeys: otherItems.length,
            safeItems: safeItems.map((x) => ({ key: x.key, bytes: x.bytes, entries: x.entries }))
        },
        indexedDB: idb,
        estimate: {
            usage,
            quota,
            usageHuman: formatBytes(usage),
            quotaHuman: formatBytes(quota)
        },
        policy: {
            safeOnly: true,
            noNetwork: true,
            protects: ['settings', 'favorites', 'cart', 'premium', 'auth', 'gps', 'map-prefs', 'osm-cache']
        }
    };
}

async function pruneLearningIdb() {
    if (typeof indexedDB === 'undefined') return { pruned: 0 };
    try {
        const db = await new Promise((resolve, reject) => {
            const req = indexedDB.open(LEARNING_IDB, 1);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
        if (!db.objectStoreNames.contains(LEARNING_STORE)) {
            db.close();
            return { pruned: 0 };
        }
        const rows = await new Promise((resolve, reject) => {
            const tx = db.transaction(LEARNING_STORE, 'readonly');
            const r = tx.objectStore(LEARNING_STORE).getAllKeys();
            r.onsuccess = () => resolve(r.result || []);
            r.onerror = () => reject(r.error);
        });
        if (rows.length <= LEARNING_KEEP) {
            db.close();
            return { pruned: 0 };
        }
        const toRemove = rows.slice(0, rows.length - LEARNING_KEEP);
        await new Promise((resolve, reject) => {
            const tx = db.transaction(LEARNING_STORE, 'readwrite');
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
            const store = tx.objectStore(LEARNING_STORE);
            for (const id of toRemove) store.delete(id);
        });
        db.close();
        return { pruned: toRemove.length };
    } catch {
        return { pruned: 0 };
    }
}

async function deleteStaleCaches() {
    if (typeof caches === 'undefined') return { deleted: [] };
    const deleted = [];
    try {
        const names = await caches.keys();
        for (const name of names) {
            const keep = PWA_CACHE_PREFIX_KEEP.some((p) => name === p || name.startsWith(p));
            if (keep) continue;
            // Tylko stare rg-* / workbox-like — nie ruszaj obcych
            if (!/^rg-|^runtime-|^workbox/i.test(name)) continue;
            const ok = await caches.delete(name);
            if (ok) deleted.push(name);
        }
    } catch {
        /* ignore */
    }
    return { deleted };
}

/**
 * Jedno kliknięcie — tylko bezpieczne dane.
 */
export async function cleanSafeData() {
    const before = await getStorageHealth();
    const removedKeys = [];
    let removedEntries = 0;

    for (const item of before.localStorage.safeItems) {
        try {
            localStorage.removeItem(item.key);
            removedKeys.push(item.key);
            removedEntries += item.entries || 1;
        } catch {
            /* ignore */
        }
    }

    // session flags
    try {
        sessionStorage.removeItem('rg_self_heal_sw_prompt');
    } catch {
        /* ignore */
    }

    const idb = await pruneLearningIdb();
    const cachesResult = await deleteStaleCaches();
    const after = await getStorageHealth();

    const result = {
        ok: true,
        removedKeys,
        removedKeyCount: removedKeys.length,
        removedEntries: removedEntries + idb.pruned + cachesResult.deleted.length,
        idbPruned: idb.pruned,
        cachesDeleted: cachesResult.deleted,
        healthBefore: before.health,
        healthAfter: after.health,
        before,
        after
    };

    console.info('[Memory Cleaner]', result);
    return result;
}

function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
#${PANEL_ID}{position:fixed;inset:0;z-index:100060;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(20,28,22,.55);font-family:'Source Sans 3',system-ui,sans-serif;color:#1c1812}
#${PANEL_ID}.open{display:flex}
#${PANEL_ID} .rg-mc-card{width:min(440px,100%);background:#f5efe3;border-radius:18px;border:1px solid rgba(42,63,40,.2);box-shadow:0 18px 50px rgba(0,0,0,.3);overflow:hidden}
#${PANEL_ID} .rg-mc-head{background:linear-gradient(180deg,#1e3220,#2a3f28);color:#f5efe3;padding:14px 16px;border-bottom:2px solid #c9a227}
#${PANEL_ID} .rg-mc-head h2{margin:0;font-family:Literata,Georgia,serif;font-size:1.25rem}
#${PANEL_ID} .rg-mc-head p{margin:4px 0 0;font-size:.82rem;opacity:.9}
#${PANEL_ID} .rg-mc-body{padding:14px 16px 16px}
#${PANEL_ID} .rg-mc-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
#${PANEL_ID} .rg-mc-tile{background:#fffef8;border:1px solid rgba(42,63,40,.14);border-radius:12px;padding:12px}
#${PANEL_ID} .rg-mc-tile .k{display:block;font-size:.72rem;text-transform:uppercase;letter-spacing:.04em;color:#6b5a45}
#${PANEL_ID} .rg-mc-tile .v{display:block;font-family:Literata,Georgia,serif;font-size:1.45rem;font-weight:700;color:#2a3f28;margin-top:2px}
#${PANEL_ID} .rg-mc-tile.ok .v{color:#2a3f28}
#${PANEL_ID} .rg-mc-tile.warn .v{color:#8a6a12}
#${PANEL_ID} .rg-mc-note{margin:12px 0 0;font-size:.82rem;color:#4a3f32;line-height:1.4}
#${PANEL_ID} .rg-mc-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
#${PANEL_ID} .rg-mc-actions button{border:0;border-radius:10px;padding:10px 14px;font-weight:700;cursor:pointer;font:inherit}
#${PANEL_ID} .rg-mc-primary{background:#2a3f28;color:#f5efe3;min-height:44px}
#${PANEL_ID} .rg-mc-secondary{background:transparent;color:#2a3f28;border:1px solid rgba(42,63,40,.3)!important;min-height:44px}
`;
    document.head.appendChild(style);
}

function healthTone(h) {
    if (h >= 90) return 'ok';
    if (h >= 70) return 'warn';
    return 'warn';
}

/**
 * Osobny panel Storage Health (też z Dev Vault / __RG_MEMORY__.open()).
 */
export async function openMemoryCleanerPanel() {
    ensureStyles();
    let root = document.getElementById(PANEL_ID);
    if (!root) {
        root = document.createElement('div');
        root.id = PANEL_ID;
        root.setAttribute('role', 'dialog');
        root.setAttribute('aria-modal', 'true');
        root.setAttribute('aria-label', 'Memory Cleaner');
        document.body.appendChild(root);
    }

    const paint = async () => {
        root.innerHTML = `
          <div class="rg-mc-card">
            <div class="rg-mc-head">
              <h2>Memory Cleaner</h2>
              <p>Storage Health · tylko bezpieczne dane · bez sieci</p>
            </div>
            <div class="rg-mc-body">
              <p class="rg-mc-note">Ładowanie…</p>
            </div>
          </div>
        `;
        root.classList.add('open');
        root.hidden = false;

        const report = await getStorageHealth();
        const body = root.querySelector('.rg-mc-body');
        if (!body) return;

        body.innerHTML = `
          <div class="rg-mc-grid">
            <div class="rg-mc-tile ${healthTone(report.health)}">
              <span class="k">Storage Health</span>
              <span class="v">${report.health}%</span>
            </div>
            <div class="rg-mc-tile">
              <span class="k">Cache</span>
              <span class="v">${escapeHtml(report.cacheHuman)}</span>
            </div>
            <div class="rg-mc-tile">
              <span class="k">Raporty / logi</span>
              <span class="v">${report.reports}</span>
            </div>
            <div class="rg-mc-tile ${report.toDelete > 0 ? 'warn' : 'ok'}">
              <span class="k">Do usunięcia</span>
              <span class="v">${report.toDelete}</span>
            </div>
          </div>
          <p class="rg-mc-note">
            LS: ${report.localStorage.keys} kluczy (${escapeHtml(report.localStorage.human)}) ·
            IDB signals: ${report.indexedDB.count} (nadmiar ${report.indexedDB.excess}) ·
            Stare cache: ${report.staleCaches}<br>
            Chronione: ustawienia, ulubione, koszyk, Premium, GPS, mapa, OSM.
          </p>
          <div class="rg-mc-actions">
            <button type="button" class="rg-mc-primary" data-mc-clean ${report.toDelete === 0 ? 'disabled' : ''}>
              Wyczyść bezpieczne dane
            </button>
            <button type="button" class="rg-mc-secondary" data-mc-refresh>Odśwież</button>
            <button type="button" class="rg-mc-secondary" data-mc-close>Zamknij</button>
          </div>
        `;

        body.querySelector('[data-mc-close]')?.addEventListener('click', closeMemoryCleanerPanel);
        body.querySelector('[data-mc-refresh]')?.addEventListener('click', () => { void paint(); });
        body.querySelector('[data-mc-clean]')?.addEventListener('click', async () => {
            if (!window.confirm(
                'Usunąć wyłącznie bezpieczne dane?\n\n'
                + '• logi strażników (Console / UI / Map / Self-Heal)\n'
                + '• stare cache PWA (nie bieżące v28)\n'
                + '• nadmiar sygnałów IndexedDB\n\n'
                + 'NIE usuwa: ustawień, ulubionych, koszyka, Premium, GPS.'
            )) return;
            const btn = body.querySelector('[data-mc-clean]');
            if (btn) btn.disabled = true;
            const r = await cleanSafeData();
            showToast(
                `Wyczyszczono ${r.removedEntries} wpisów · Health ${r.healthBefore}% → ${r.healthAfter}%`
            );
            void paint();
        });
    };

    root.addEventListener('click', (e) => {
        if (e.target === root) closeMemoryCleanerPanel();
    });

    await paint();
}

export function closeMemoryCleanerPanel() {
    const root = document.getElementById(PANEL_ID);
    if (!root) return;
    root.classList.remove('open');
    root.hidden = true;
}

function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Karta HTML do osadzenia w Dev Vault (Utrzymanie).
 */
export async function renderMemoryCleanerCard(host) {
    if (!host) return;
    host.innerHTML = `<p class="lead">Ładowanie Storage Health…</p>`;
    const report = await getStorageHealth();
    host.innerHTML = `
      <div class="rg-dcc-section" style="margin-top:14px">
        <h3>Memory Cleaner</h3>
        <p class="lead">Storage Health · cache · raporty · bezpieczne czyszczenie jednym kliknięciem.</p>
        <div class="rg-dcc-grid">
          <div class="rg-dcc-tile">
            <h4>Storage Health</h4>
            <div class="rg-dcc-tile-val">${report.health}%</div>
          </div>
          <div class="rg-dcc-tile">
            <h4>Cache</h4>
            <div class="rg-dcc-tile-val">${escapeHtml(report.cacheHuman)}</div>
          </div>
          <div class="rg-dcc-tile">
            <h4>Raporty</h4>
            <div class="rg-dcc-tile-val">${report.reports}</div>
          </div>
          <div class="rg-dcc-tile">
            <h4>Do usunięcia</h4>
            <div class="rg-dcc-tile-val">${report.toDelete}</div>
          </div>
        </div>
        <div class="rg-dv-actions" style="margin-top:12px">
          <button type="button" class="rg-dv-primary" data-mc-vault-clean>Wyczyść bezpieczne dane</button>
          <button type="button" class="rg-dv-secondary" data-mc-vault-open>Otwórz panel</button>
          <button type="button" class="rg-dv-secondary" data-mc-vault-refresh>Odśwież</button>
        </div>
      </div>
    `;
    host.querySelector('[data-mc-vault-open]')?.addEventListener('click', () => {
        void openMemoryCleanerPanel();
    });
    host.querySelector('[data-mc-vault-refresh]')?.addEventListener('click', () => {
        void renderMemoryCleanerCard(host);
    });
    host.querySelector('[data-mc-vault-clean]')?.addEventListener('click', async () => {
        if (!window.confirm('Usunąć wyłącznie bezpieczne logi / stare cache / nadmiar IDB?')) return;
        const r = await cleanSafeData();
        showToast(`Wyczyszczono ${r.removedEntries} · Health ${r.healthAfter}%`);
        void renderMemoryCleanerCard(host);
    });
}

export function initMemoryCleaner() {
    if (typeof window === 'undefined') return { ok: false };
    window.__RG_MEMORY__ = {
        health: getStorageHealth,
        clean: cleanSafeData,
        open: openMemoryCleanerPanel,
        close: closeMemoryCleanerPanel,
        policy: {
            safeOnly: true,
            noNetwork: true,
            protectsProductData: true
        }
    };
    console.info('[Memory Cleaner] ETAP 43 · __RG_MEMORY__.open() · .clean()');
    return { ok: true };
}

export default {
    initMemoryCleaner,
    getStorageHealth,
    cleanSafeData,
    openMemoryCleanerPanel,
    closeMemoryCleanerPanel,
    renderMemoryCleanerCard
};
