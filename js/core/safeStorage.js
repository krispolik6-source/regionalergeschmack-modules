// js/core/safeStorage.js – bezpieczny zapis localStorage (QuotaExceededError)

/** Szacowany limit localStorage w przeglądarkach (5 MB). */
export const LOCAL_STORAGE_QUOTA_BYTES = 5 * 1024 * 1024;

/** Próg proaktywnego cleanup (80%). */
export const LOCAL_STORAGE_HEADROOM_RATIO = 0.8;

/** Maks. rozmiar cache AI i18n po trimie. */
export const AI_I18N_CACHE_MAX_BYTES = 400 * 1024;

/** Maks. liczba wpisów cache AI i18n po trimie. */
export const AI_I18N_CACHE_MAX_ENTRIES = 500;

const AI_I18N_CACHE_KEY = 'rg_ai_i18n_v2';
const AI_I18N_LEGACY_KEY = 'rg_dyn_i18n_v1';

const CLEANUP_EXACT = new Set([
    'rg_push_content_snapshot',
    'rg_push_season_notified',
    'rg_push_nearby_ids',
    'rg_console_guardian_v1',
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
    'rg_ai_i18n_v2',
    'rg_dyn_i18n_v1',
    'rg_health_log_v1',
    'rg_health_report_v1'
]);

const CLEANUP_PREFIXES = [
    'rg_console_guardian',
    'rg_ui_guardian',
    'rg_map_guardian',
    'rg_self_heal',
    'rg_health_',
    'rg_guardian_',
    'rg_virtual_',
    'rg_real_user',
    'rg_dream_',
    'rg_weekly_premium',
    'rg_daily_dev',
    'rg_emotion_',
    'rg_living_brand',
    'rg_product_director',
    'rg_project_advisor',
    'rg_improvement_',
    'rg_osm_cache',
    'rg_weather_cache',
    'rg_living_map_rec',
    'rg_return_magic',
    'rg_taste_advisor',
    'rg_surprise_me_recent'
];

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
    'rg_admin_trust_overrides_v1',
    'cookie_consent',
    'rg_push_snapshot_v3_baseline'
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

export function isQuotaExceededError(error) {
    if (!error) return false;
    if (error.name === 'QuotaExceededError') return true;
    if (error.code === 22 || error.code === 1014) return true;
    const msg = String(error.message || '');
    return /quota/i.test(msg);
}

export function byteLen(str) {
    try {
        return new Blob([String(str ?? '')]).size;
    } catch {
        return String(str ?? '').length;
    }
}

function isProtectedKey(key) {
    const k = String(key || '');
    if (PROTECTED_EXACT.has(k)) return true;
    return PROTECTED_PREFIXES.some((prefix) => k === prefix || k.startsWith(prefix));
}

function isCleanupKey(key) {
    const k = String(key || '');
    if (isProtectedKey(k)) return false;
    if (CLEANUP_EXACT.has(k)) return true;
    return CLEANUP_PREFIXES.some((prefix) => k === prefix || k.startsWith(prefix));
}

function listLocalStorageKeys() {
    if (typeof localStorage === 'undefined') return [];
    const keys = [];
    for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (key) keys.push(key);
    }
    return keys;
}

function entryTimestamp(row) {
    if (!Array.isArray(row)) return 0;
    const val = row[1];
    if (val && typeof val === 'object' && Number.isFinite(Number(val.timestamp))) {
        return Number(val.timestamp);
    }
    return 0;
}

/**
 * LRU/FIFO trim cache AI — najstarsze wpisy usuwane pierwsze.
 * @param {{ maxBytes?: number, maxEntries?: number, removeLegacy?: boolean }} [options]
 */
export function trimAiI18nCacheStorage(options = {}) {
    if (typeof localStorage === 'undefined') {
        return { trimmed: 0, bytesBefore: 0, bytesAfter: 0, entriesBefore: 0, entriesAfter: 0 };
    }

    const maxBytes = options.maxBytes ?? AI_I18N_CACHE_MAX_BYTES;
    const maxEntries = options.maxEntries ?? AI_I18N_CACHE_MAX_ENTRIES;
    let trimmed = 0;

    if (options.removeLegacy !== false) {
        try {
            if (localStorage.getItem(AI_I18N_LEGACY_KEY)) {
                localStorage.removeItem(AI_I18N_LEGACY_KEY);
                trimmed += 1;
            }
        } catch {
            /* ignore */
        }
    }

    const raw = localStorage.getItem(AI_I18N_CACHE_KEY);
    if (!raw) {
        return { trimmed, bytesBefore: 0, bytesAfter: 0, entriesBefore: 0, entriesAfter: 0 };
    }

    const bytesBefore = byteLen(raw);
    let entries = [];

    try {
        const data = JSON.parse(raw);
        entries = Array.isArray(data?.entries) ? [...data.entries] : [];
    } catch {
        try {
            localStorage.removeItem(AI_I18N_CACHE_KEY);
        } catch {
            /* ignore */
        }
        return { trimmed: trimmed + 1, bytesBefore, bytesAfter: 0, entriesBefore: 0, entriesAfter: 0 };
    }

    const entriesBefore = entries.length;
    entries.sort((a, b) => entryTimestamp(a) - entryTimestamp(b));

    const buildJson = (rows) => JSON.stringify({
        v: 3,
        at: new Date().toISOString(),
        entries: rows
    });

    while (entries.length > 0 && (entries.length > maxEntries || byteLen(buildJson(entries)) > maxBytes)) {
        entries.shift();
        trimmed += 1;
    }

    const json = buildJson(entries);
    const bytesAfter = byteLen(json);

    try {
        if (entries.length === 0) {
            localStorage.removeItem(AI_I18N_CACHE_KEY);
        } else {
            localStorage.setItem(AI_I18N_CACHE_KEY, json);
        }
    } catch {
        try {
            localStorage.removeItem(AI_I18N_CACHE_KEY);
        } catch {
            /* ignore */
        }
    }

    return {
        trimmed,
        bytesBefore,
        bytesAfter: entries.length ? bytesAfter : 0,
        entriesBefore,
        entriesAfter: entries.length
    };
}

/**
 * Raport zajętości localStorage — każdy klucz + rozmiar.
 * @returns {{ keys: { key: string, bytes: number, kb: number }[], totalBytes: number, totalKb: number, quotaBytes: number, percent: number }}
 */
export function measureLocalStorage() {
    if (typeof localStorage === 'undefined') {
        return { keys: [], totalBytes: 0, totalKb: 0, quotaBytes: LOCAL_STORAGE_QUOTA_BYTES, percent: 0 };
    }

    const keys = listLocalStorageKeys().map((key) => {
        let value = '';
        try {
            value = localStorage.getItem(key) || '';
        } catch {
            value = '';
        }
        const bytes = byteLen(key) + byteLen(value);
        return { key, bytes, kb: Math.round((bytes / 1024) * 100) / 100 };
    });

    keys.sort((a, b) => b.bytes - a.bytes);
    const totalBytes = keys.reduce((sum, row) => sum + row.bytes, 0);

    return {
        keys,
        totalBytes,
        totalKb: Math.round((totalBytes / 1024) * 100) / 100,
        quotaBytes: LOCAL_STORAGE_QUOTA_BYTES,
        percent: totalBytes / LOCAL_STORAGE_QUOTA_BYTES
    };
}

/**
 * Usuwa cache/diagnostykę — nie dotyka ustawień, auth, ulubionych, koszyka.
 * @param {{ phase?: 'reactive' | 'proactive' }} [options]
 * @returns {string[]}
 */
export function cleanupStaleLocalStorageCaches(options = {}) {
    if (typeof localStorage === 'undefined') return [];

    const removed = [];
    const keys = listLocalStorageKeys();

    for (const key of keys) {
        if (!isCleanupKey(key)) continue;
        try {
            localStorage.removeItem(key);
            removed.push(key);
        } catch {
            /* ignore */
        }
    }

    if (options.phase === 'proactive') {
        trimAiI18nCacheStorage();
    }

    if (removed.length) {
        console.info('[Storage] Cleanup cache:', removed.length, 'kluczy', options.phase || 'reactive');
    }
    return removed;
}

/**
 * Przy >80% limitu: cleanup cache AI, snapshotów push, diagnostyki.
 * @returns {{ cleaned: string[], usageBefore: object, usageAfter: object, aiTrim?: object }}
 */
export function ensureLocalStorageHeadroom() {
    const usageBefore = measureLocalStorage();

    if (usageBefore.percent < LOCAL_STORAGE_HEADROOM_RATIO) {
        return { cleaned: [], usageBefore, usageAfter: usageBefore, aiTrim: null };
    }

    const cleaned = cleanupStaleLocalStorageCaches({ phase: 'proactive' });
    const aiTrim = trimAiI18nCacheStorage();
    const usageAfter = measureLocalStorage();

    if (usageAfter.percent >= LOCAL_STORAGE_HEADROOM_RATIO) {
        console.warn(
            '[Storage] Po cleanup nadal',
            `${(usageAfter.percent * 100).toFixed(1)}%`,
            'limitu localStorage'
        );
    }

    return { cleaned, usageBefore, usageAfter, aiTrim };
}

/**
 * @param {string} key
 * @param {string} value
 * @param {{ retried?: boolean, skipOnQuota?: boolean, skipHeadroomCheck?: boolean }} [options]
 * @returns {{ ok: boolean, retried?: boolean, skipped?: boolean, quotaExceeded?: boolean, error?: unknown }}
 */
export function safeLocalStorageSetItem(key, value, options = {}) {
    if (typeof localStorage === 'undefined') {
        return { ok: false, error: new Error('localStorage unavailable') };
    }

    if (!options.skipHeadroomCheck) {
        ensureLocalStorageHeadroom();
    }

    try {
        localStorage.setItem(key, value);
        return { ok: true };
    } catch (error) {
        if (!isQuotaExceededError(error)) {
            console.warn('[Storage] setItem failed:', key, error);
            return { ok: false, error };
        }

        if (options.retried) {
            const usage = measureLocalStorage();
            if (options.skipOnQuota !== false || usage.percent >= 0.95) {
                console.warn('[Storage] Pominięto zapis (brak miejsca):', key);
                return { ok: false, error, quotaExceeded: true, skipped: true };
            }
            console.warn('[Storage] QuotaExceeded po cleanup:', key);
            return { ok: false, error, quotaExceeded: true };
        }

        cleanupStaleLocalStorageCaches({ phase: 'proactive' });
        trimAiI18nCacheStorage();

        const usageAfterCleanup = measureLocalStorage();
        if (usageAfterCleanup.percent >= 0.95 && options.skipOnQuota !== false) {
            console.warn('[Storage] Pominięto zapis po cleanup (brak miejsca):', key);
            return { ok: false, error, quotaExceeded: true, skipped: true };
        }

        return safeLocalStorageSetItem(key, value, {
            ...options,
            retried: true,
            skipHeadroomCheck: true
        });
    }
}

export default {
    LOCAL_STORAGE_QUOTA_BYTES,
    LOCAL_STORAGE_HEADROOM_RATIO,
    AI_I18N_CACHE_MAX_BYTES,
    AI_I18N_CACHE_MAX_ENTRIES,
    isQuotaExceededError,
    byteLen,
    measureLocalStorage,
    ensureLocalStorageHeadroom,
    cleanupStaleLocalStorageCaches,
    trimAiI18nCacheStorage,
    safeLocalStorageSetItem
};
