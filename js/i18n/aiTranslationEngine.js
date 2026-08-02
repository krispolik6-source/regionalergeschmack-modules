/**
 * AI Translation Engine — tłumaczenia dynamiczne w tle (bez UI).
 *
 * Użytkownik nie widzi „AI” / „Translating…”.
 * Brand „Regionaler Geschmack” oraz nazwy własne / adresy / kontakt — bez tłumaczenia.
 *
 * Providery (łatwa podmiana): libretranslate · mymemory · google · deepl · openai
 */

import { APP_NAME } from '../config.js';
import {
    SUPPORTED_LANGUAGE_CODES,
    normalizeBrowserLanguage
} from '../translations.js';
import { eventBus } from '../core/eventBus.js';
import { EVENTS } from '../core/events.js';
import {
    safeLocalStorageSetItem,
    trimAiI18nCacheStorage,
    byteLen,
    AI_I18N_CACHE_MAX_BYTES,
    AI_I18N_CACHE_MAX_ENTRIES
} from '../core/safeStorage.js';

const LANG_STORAGE_KEY = 'rs_lang';
const CACHE_KEY = 'rg_ai_i18n_v2';
const LEGACY_CACHE_KEY = 'rg_dyn_i18n_v1';
const CACHE_MAX_SIZE = 500;
const CACHE_MAX_BYTES = AI_I18N_CACHE_MAX_BYTES;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_TEXT = 1200;
const BRAND_TOKEN = '\uE000RG_BRAND\uE001';
const PROTECT_TOKEN = (i) => `\uE000RG_P${i}\uE001`;
const QUEUE_CONCURRENCY = 1;
const REQUEST_GAP_MS = 750;
const RETRY_MS = 45_000;
const RETRY_MS_RATE_LIMIT = 120_000;
const PROVIDER_RATE_LIMIT_MS = 60_000;

const IS_LOCALHOST = typeof location !== 'undefined'
    && /^(localhost|127\.0\.0\.1)$/.test(location.hostname);

/** @type {Map<string, number>} */
const providerRateLimitedUntil = new Map();

/** Metryki audytu (localhost + getAiTranslateStats). */
const auditStats = {
    requests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    libreRequests: 0,
    mymemoryRequests: 0,
    status400: 0,
    status429: 0,
    retries: 0,
    totalMs: 0,
    completed: 0,
    providerSkips: 0
};

function diag(event, detail = {}) {
    if (!IS_LOCALHOST) return;
    try {
        console.info('[AI Translation]', event, detail);
    } catch { /* ignore */ }
}

function recordCacheHit() {
    auditStats.cacheHits += 1;
    diag('cache-hit', { hits: auditStats.cacheHits, misses: auditStats.cacheMisses });
}

function recordCacheMiss() {
    auditStats.cacheMisses += 1;
    diag('cache-miss', { hits: auditStats.cacheHits, misses: auditStats.cacheMisses });
}

function recordProviderRequest(providerId) {
    auditStats.requests += 1;
    if (providerId === 'libretranslate') auditStats.libreRequests += 1;
    if (providerId === 'mymemory') auditStats.mymemoryRequests += 1;
}

function recordHttpStatus(status) {
    if (status === 400) auditStats.status400 += 1;
    if (status === 429) auditStats.status429 += 1;
}

function providerHttpError(providerId, status) {
    if (status === 400 || status === 429) recordHttpStatus(status);
    const err = new Error(`${providerId} ${status}`);
    err.status = status;
    err.provider = providerId;
    return err;
}

function isProviderRateLimited(providerId) {
    const until = providerRateLimitedUntil.get(providerId) || 0;
    return now() < until;
}

function markProviderRateLimited(providerId) {
    providerRateLimitedUntil.set(providerId, now() + PROVIDER_RATE_LIMIT_MS);
    diag('429', { provider: providerId, blockedMs: PROVIDER_RATE_LIMIT_MS });
}

function isProviderAvailable(providerId, cfg) {
    if (!PROVIDERS[providerId]) return false;
    if (isProviderRateLimited(providerId)) {
        auditStats.providerSkips += 1;
        diag('provider-skip', { provider: providerId, reason: 'rate-limited' });
        return false;
    }
    if (providerId === 'libretranslate' && !String(cfg?.libreApiKey || '').trim()) {
        auditStats.providerSkips += 1;
        diag('provider-skip', { provider: providerId, reason: 'no-api-key' });
        return false;
    }
    if (providerId === 'google' && !String(cfg?.googleApiKey || '').trim()) return false;
    if (providerId === 'deepl' && !String(cfg?.deeplApiKey || '').trim()) return false;
    if (providerId === 'openai' && !String(cfg?.openaiApiKey || '').trim()) return false;
    return true;
}

/** @typedef {{ id: string, translate: (text: string, from: string, to: string, cfg: object) => Promise<string> }} TranslationProvider */

export const AI_TRANSLATE_CONFIG = {
    enabled: true,
    /** Kolejność prób — kolejne providery przy błędzie */
    providers: /** @type {string[]} */ (['libretranslate', 'mymemory']),
    defaultSource: 'de',
    unsupportedTargetFallback: 'en',
    libreUrl: 'https://libretranslate.com',
    libreApiKey: '',
    mymemoryUrl: 'https://api.mymemory.translated.net/get',
    /** Placeholders pod przyszłe API (pusty = pomiń) */
    googleApiKey: '',
    googleEndpoint: 'https://translation.googleapis.com/language/translate/v2',
    deeplApiKey: '',
    deeplEndpoint: 'https://api-free.deepl.com/v2/translate',
    openaiApiKey: '',
    openaiEndpoint: 'https://api.openai.com/v1/chat/completions',
    openaiModel: 'gpt-4o-mini'
};

const LANG_MAP = Object.freeze({
    'zh-tw': 'zh',
    nb: 'no',
    nn: 'no',
    cz: 'cs',
    gr: 'el'
});

/** @type {Map<string, string>} */
let memoryCache = new Map();
/** @type {Map<string, Promise<string>>} */
const pendingByKey = new Map();
/** @type {{ text: string, from: string, to: string, protect: string[], key: string, resolve: Function }[]} */
const queue = [];
/** @type {Map<string, number>} failedAt */
const failedAt = new Map();
let activeWorkers = 0;
let lastRequestAt = 0;
let initialized = false;
/** @type {Set<AbortController>} */
const activeRequestControllers = new Set();

function now() {
    return Date.now();
}

function abortSignal(ms) {
    if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
        return AbortSignal.timeout(ms);
    }
    const c = new AbortController();
    setTimeout(() => c.abort(), ms);
    return c.signal;
}

function mergeAbortSignals(...signals) {
    const valid = signals.filter(Boolean);
    if (!valid.length) return undefined;
    if (typeof AbortController === 'undefined') return valid[0];
    const merged = new AbortController();
    for (const sig of valid) {
        if (sig.aborted) {
            merged.abort(sig.reason);
            return merged.signal;
        }
        sig.addEventListener('abort', () => merged.abort(sig.reason), { once: true });
    }
    return merged.signal;
}

function cancelAllPendingTranslations() {
    for (const controller of activeRequestControllers) {
        try { controller.abort(); } catch { /* ignore */ }
    }
    activeRequestControllers.clear();

    while (queue.length) {
        const job = queue.shift();
        try { job?.resolve?.(job.text); } catch { /* ignore */ }
    }
    pendingByKey.clear();
    activeWorkers = 0;
}

function getUiLanguage() {
    try {
        const stored = localStorage.getItem(LANG_STORAGE_KEY);
        if (stored) return normalizeBrowserLanguage(stored);
    } catch { /* ignore */ }
    try {
        return normalizeBrowserLanguage(navigator.language || 'en');
    } catch {
        return 'en';
    }
}

function mapLang(code) {
    const raw = String(code || '').toLowerCase();
    if (!raw) return AI_TRANSLATE_CONFIG.unsupportedTargetFallback;
    return LANG_MAP[raw] || raw.split('-')[0] || AI_TRANSLATE_CONFIG.unsupportedTargetFallback;
}

export function resolveTargetLanguage(lang) {
    const ui = lang || getUiLanguage() || 'en';
    if (!SUPPORTED_LANGUAGE_CODES.includes(ui)) {
        return AI_TRANSLATE_CONFIG.unsupportedTargetFallback;
    }
    return mapLang(ui);
}

/** Cache key: oryginał + język źródłowy + docelowy */
function getCacheKey(text, from, to) {
    return `${text}|${from}|${to}`;
}

/** @deprecated alias */
function makeCacheKey(text, to, from = AI_TRANSLATE_CONFIG.defaultSource) {
    return getCacheKey(text, mapLang(from), to);
}

/**
 * @param {string} text
 * @param {string} from
 * @param {string} to
 * @returns {string | null}
 */
function getCachedTranslationEntry(text, from, to) {
    const key = getCacheKey(text, from, to);
    const entry = memoryCache.get(key);
    if (!entry) return null;
    const translation = typeof entry === 'string' ? entry : entry.translation;
    const timestamp = typeof entry === 'string' ? now() : Number(entry.timestamp || 0);
    if (!translation) return null;
    if (timestamp && now() - timestamp > CACHE_TTL_MS) {
        memoryCache.delete(key);
        return null;
    }
    return translation;
}

/**
 * @param {string} text
 * @param {string} from
 * @param {string} to
 * @param {string} translation
 */
function setCachedTranslationEntry(text, from, to, translation) {
    const key = getCacheKey(text, from, to);
    if (memoryCache.size >= CACHE_MAX_SIZE) {
        let oldestKey = null;
        let oldestTs = Infinity;
        for (const [k, entry] of memoryCache.entries()) {
            const ts = Number(entry?.timestamp) || 0;
            if (ts < oldestTs) {
                oldestTs = ts;
                oldestKey = k;
            }
        }
        if (oldestKey) memoryCache.delete(oldestKey);
    }
    memoryCache.set(key, { translation, timestamp: now() });
}

function loadCache() {
    if (memoryCache.size) return;
    try {
        const raw = localStorage.getItem(CACHE_KEY) || localStorage.getItem(LEGACY_CACHE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        const entries = Array.isArray(data?.entries) ? data.entries : [];
        const ts = now();
        for (const row of entries) {
            if (!Array.isArray(row) || typeof row[0] !== 'string') continue;
            let k = row[0];
            let val = row[1];
            // migracja v1: from|to|text → text|from|to
            if (k.includes('|') && !k.includes('::') && k.split('|').length >= 3) {
                const parts = k.split('|');
                const fromPart = parts[0];
                const toPart = parts[1];
                const textPart = parts.slice(2).join('|');
                k = getCacheKey(textPart, fromPart, toPart);
            } else if (k.includes('::')) {
                const idx = k.indexOf('::');
                const toPart = k.slice(0, idx);
                const textPart = k.slice(idx + 2);
                k = getCacheKey(textPart, AI_TRANSLATE_CONFIG.defaultSource, toPart);
            }
            if (typeof val === 'string') {
                memoryCache.set(k, { translation: val, timestamp: ts });
            } else if (val && typeof val.translation === 'string') {
                memoryCache.set(k, {
                    translation: val.translation,
                    timestamp: Number(val.timestamp) || ts
                });
            }
        }
    } catch {
        memoryCache = new Map();
    }
}

function persistCache() {
    try {
        let entries = [...memoryCache.entries()]
            .sort((a, b) => (Number(a[1]?.timestamp) || 0) - (Number(b[1]?.timestamp) || 0));

        if (entries.length > CACHE_MAX_SIZE) {
            entries = entries.slice(entries.length - CACHE_MAX_SIZE);
        }

        const buildJson = (rows) => JSON.stringify({
            v: 3,
            at: new Date().toISOString(),
            entries: rows.map(([key, val]) => [key, val])
        });

        while (entries.length > 0 && byteLen(buildJson(entries)) > CACHE_MAX_BYTES) {
            entries.shift();
        }

        memoryCache = new Map(entries);

        if (entries.length === 0) {
            try {
                localStorage.removeItem(CACHE_KEY);
            } catch { /* ignore */ }
            return;
        }

        const result = safeLocalStorageSetItem(CACHE_KEY, buildJson(entries), { skipOnQuota: true });
        if (!result.ok && result.skipped) {
            trimAiI18nCacheStorage({ maxBytes: Math.floor(CACHE_MAX_BYTES / 2), maxEntries: Math.floor(CACHE_MAX_SIZE / 2) });
        }
    } catch {
        try {
            trimAiI18nCacheStorage({ maxBytes: Math.floor(CACHE_MAX_BYTES / 2), maxEntries: Math.floor(AI_I18N_CACHE_MAX_ENTRIES / 2) });
        } catch { /* ignore */ }
    }
}

/* ——— Guards: czego nie tłumaczyć ——— */

const RE_EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const RE_URL = /https?:\/\/\S+|www\.\S+/i;
const RE_PHONE = /(\+?\d[\d\s()./-]{6,}\d)/;
const RE_GPS = /^\s*-?\d{1,3}\.\d+\s*,\s*-?\d{1,3}\.\d+\s*$/;
const RE_SKU = /^[A-Z0-9][A-Z0-9._-]{2,24}$/i;
const RE_NUMERIC = /^[\d\s.,€$%+\-–—/:]+$/;
const RE_ADDRESSISH = /\b(\d{1,4}\s*[a-zäöüß.-]*\s*)?(straße|strasse|str\.|weg|platz|allee|gasse|ul\.|ulica|street|road|avenue)\b/i;

/**
 * Czy cały tekst należy pominąć (kontakt, GPS, marka, …).
 * @param {string} text
 * @param {{ protect?: string[] }} [opts]
 */
export function shouldNotTranslate(text, opts = {}) {
    const s = String(text ?? '').trim();
    if (!s) return true;
    if (s === APP_NAME) return true;
    if (RE_EMAIL.test(s) && s.length < 80) return true;
    if (RE_URL.test(s) && !/\s/.test(s.trim())) return true;
    if (RE_PHONE.test(s) && s.replace(/\D/g, '').length >= 7 && s.length < 40) return true;
    if (RE_GPS.test(s)) return true;
    if (RE_SKU.test(s) && !/\s/.test(s)) return true;
    if (RE_NUMERIC.test(s)) return true;
    if (RE_ADDRESSISH.test(s) && s.length < 120) return true;
    for (const p of opts.protect || []) {
        if (p && s === String(p).trim()) return true;
    }
    return false;
}

function protectSpans(text, protectList = []) {
    let out = String(text).split(APP_NAME).join(BRAND_TOKEN);
    const list = [...new Set((protectList || []).filter(Boolean).map((x) => String(x).trim()))]
        .filter((x) => x && x !== APP_NAME)
        .sort((a, b) => b.length - a.length);
    list.forEach((phrase, i) => {
        if (phrase.length < 2) return;
        out = out.split(phrase).join(PROTECT_TOKEN(i));
    });
    return { text: out, list };
}

function restoreSpans(text, list = []) {
    let out = String(text).split(BRAND_TOKEN).join(APP_NAME);
    list.forEach((phrase, i) => {
        out = out.split(PROTECT_TOKEN(i)).join(phrase);
    });
    return out;
}

function normalizeInput(text) {
    const s = String(text ?? '').trim();
    if (!s || s.length < 2) return '';
    return s.length > MAX_TEXT ? s.slice(0, MAX_TEXT) : s;
}

/* ——— Providers ——— */

/** @type {Record<string, TranslationProvider>} */
const PROVIDERS = {
    libretranslate: {
        id: 'libretranslate',
        async translate(text, from, to, cfg) {
            if (!String(cfg.libreApiKey || '').trim()) {
                throw providerHttpError('libretranslate', 0);
            }
            const url = `${String(cfg.libreUrl || '').replace(/\/$/, '')}/translate`;
            const body = { q: text, source: from, target: to, format: 'text', api_key: cfg.libreApiKey };
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(body),
                signal: mergeAbortSignals(abortSignal(12000), cfg.requestSignal)
            });
            if (!res.ok) throw providerHttpError('libretranslate', res.status);
            const data = await res.json();
            const out = data?.translatedText || data?.translation;
            if (!out || typeof out !== 'string') throw new Error('libre empty');
            return out;
        }
    },
    mymemory: {
        id: 'mymemory',
        async translate(text, from, to, cfg) {
            const q = encodeURIComponent(text);
            const url = `${cfg.mymemoryUrl}?q=${q}&langpair=${from}|${to}`;
            const res = await fetch(url, {
                method: 'GET',
                headers: { Accept: 'application/json' },
                signal: mergeAbortSignals(abortSignal(12000), cfg.requestSignal)
            });
            if (!res.ok) throw providerHttpError('mymemory', res.status);
            const data = await res.json();
            const out = data?.responseData?.translatedText;
            if (!out || typeof out !== 'string') throw new Error('mymemory empty');
            if (/MYMEMORY WARNING/i.test(out)) {
                throw providerHttpError('mymemory', 429);
            }
            return out;
        }
    },
    google: {
        id: 'google',
        async translate(text, from, to, cfg) {
            if (!cfg.googleApiKey) throw new Error('google not configured');
            const url = `${cfg.googleEndpoint}?key=${encodeURIComponent(cfg.googleApiKey)}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ q: text, source: from, target: to, format: 'text' }),
                signal: mergeAbortSignals(abortSignal(12000), cfg.requestSignal)
            });
            if (!res.ok) throw new Error(`google ${res.status}`);
            const data = await res.json();
            const out = data?.data?.translations?.[0]?.translatedText;
            if (!out) throw new Error('google empty');
            return out;
        }
    },
    deepl: {
        id: 'deepl',
        async translate(text, from, to, cfg) {
            if (!cfg.deeplApiKey) throw new Error('deepl not configured');
            const params = new URLSearchParams({
                text,
                source_lang: String(from).toUpperCase(),
                target_lang: String(to).toUpperCase()
            });
            const res = await fetch(cfg.deeplEndpoint, {
                method: 'POST',
                headers: {
                    Authorization: `DeepL-Auth-Key ${cfg.deeplApiKey}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params,
                signal: mergeAbortSignals(abortSignal(12000), cfg.requestSignal)
            });
            if (!res.ok) throw new Error(`deepl ${res.status}`);
            const data = await res.json();
            const out = data?.translations?.[0]?.text;
            if (!out) throw new Error('deepl empty');
            return out;
        }
    },
    openai: {
        id: 'openai',
        async translate(text, from, to, cfg) {
            if (!cfg.openaiApiKey) throw new Error('openai not configured');
            const res = await fetch(cfg.openaiEndpoint, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${cfg.openaiApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: cfg.openaiModel,
                    temperature: 0.2,
                    messages: [
                        {
                            role: 'system',
                            content: `Translate from ${from} to ${to}. Return only the translation. Keep brand name "${APP_NAME}" unchanged. Do not translate personal/place names if marked.`
                        },
                        { role: 'user', content: text }
                    ]
                }),
                signal: mergeAbortSignals(abortSignal(20000), cfg.requestSignal)
            });
            if (!res.ok) throw new Error(`openai ${res.status}`);
            const data = await res.json();
            const out = data?.choices?.[0]?.message?.content?.trim();
            if (!out) throw new Error('openai empty');
            return out;
        }
    }
};

/**
 * Rejestracja / podmiana providera bez zmian w reszcie aplikacji.
 * @param {TranslationProvider} provider
 */
export function registerProvider(provider) {
    if (provider?.id && typeof provider.translate === 'function') {
        PROVIDERS[provider.id] = provider;
    }
}

async function runProviders(text, from, to, requestSignal) {
    const order = AI_TRANSLATE_CONFIG.providers || [];
    const cfg = { ...AI_TRANSLATE_CONFIG, requestSignal };
    let lastErr;
    for (const id of order) {
        if (!isProviderAvailable(id, cfg)) continue;
        const p = PROVIDERS[id];
        const started = now();
        try {
            recordProviderRequest(id);
            diag('request-start', { provider: id, queue: queue.length, from, to });
            const out = await p.translate(text, from, to, cfg);
            const elapsed = now() - started;
            auditStats.totalMs += elapsed;
            auditStats.completed += 1;
            diag('request-ok', { provider: id, status: 200, ms: elapsed });
            if (out && typeof out === 'string') return out;
        } catch (e) {
            const elapsed = now() - started;
            auditStats.totalMs += elapsed;
            if (e?.name === 'AbortError' || requestSignal?.aborted) throw e;
            const status = Number(e?.status) || parseHttpStatus(String(e?.message || ''));
            if (status === 400 || status === 429) recordHttpStatus(status);
            if (status === 429) markProviderRateLimited(id);
            diag('request-fail', { provider: id, status: status || 'error', ms: elapsed, retry: false });
            lastErr = e;
        }
    }
    throw lastErr || new Error('no provider');
}

function parseHttpStatus(message) {
    const m = String(message || '').match(/\b(400|429|5\d{2})\b/);
    return m ? Number(m[1]) : 0;
}

async function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

async function throttle() {
    const wait = Math.max(0, REQUEST_GAP_MS - (now() - lastRequestAt));
    if (wait) await sleep(wait);
    lastRequestAt = now();
}

async function fetchTranslation(text, from, to, protect = [], requestSignal) {
    const { text: protectedText, list } = protectSpans(text, protect);
    const raw = await runProviders(protectedText, from, to, requestSignal);
    return restoreSpans(raw, list).trim() || text;
}

function emitUpdated(payload) {
    try {
        eventBus.emit?.(EVENTS.DYNAMIC_TRANSLATIONS_UPDATED, payload);
    } catch { /* ignore */ }
    // Cicha aktualizacja DOM (tylko elementy z data-rg-ai-src)
    try {
        patchDomTranslations(payload);
    } catch { /* ignore */ }
}

function patchDomTranslations(payload) {
    if (typeof document === 'undefined' || !payload?.text || !payload?.translation) return;
    const nodes = document.querySelectorAll('[data-rg-ai-src]');
    nodes.forEach((el) => {
        const src = el.getAttribute('data-rg-ai-src');
        if (src !== payload.text) return;
        const lang = el.getAttribute('data-rg-ai-lang') || '';
        if (lang && lang !== payload.to) return;
        // Aktualizuj tylko gdy treść nadal = oryginał lub poprzedni wynik (bez migotania losowych edycji)
        const cur = el.textContent || '';
        if (cur === src || cur === el.getAttribute('data-rg-ai-prev') || !cur.trim()) {
            el.setAttribute('data-rg-ai-prev', payload.translation);
            el.textContent = payload.translation;
        }
    });
}

async function processQueue() {
    if (activeWorkers >= QUEUE_CONCURRENCY) return;
    const job = queue.shift();
    if (!job) return;
    activeWorkers += 1;
    const { text, from, to, protect, resolve, key: jobKey } = job;
    const key = jobKey || getCacheKey(text, from, to);
    const requestController = typeof AbortController !== 'undefined' ? new AbortController() : null;
    if (requestController) activeRequestControllers.add(requestController);
    const requestSignal = requestController?.signal;
    try {
        const cachedBeforeRequest = getCachedTranslationEntry(text, from, to);
        if (cachedBeforeRequest) {
            recordCacheHit();
            emitUpdated({ from, to, text, translation: cachedBeforeRequest });
            resolve(cachedBeforeRequest);
            return;
        }

        await throttle();
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            failedAt.set(key, now());
            resolve(text);
            return;
        }

        recordCacheMiss();
        const out = await fetchTranslation(text, from, to, protect, requestSignal);
        setCachedTranslationEntry(text, from, to, out);
        failedAt.delete(key);
        persistCache();
        emitUpdated({ from, to, text, translation: out });
        resolve(out);
    } catch (err) {
        if (err?.name === 'AbortError' || requestSignal?.aborted) {
            resolve(text);
            return;
        }
        const msg = String(err?.message || err || '');
        const status = Number(err?.status) || parseHttpStatus(msg);
        const rateLimited = status === 429 || /\b429\b|quota|rate limit/i.test(msg);
        failedAt.set(key, now());
        auditStats.retries += 1;
        diag('retry-scheduled', { key: key.slice(0, 48), status, rateLimited, queue: queue.length });
        scheduleRetry(text, from, to, protect, rateLimited);
        resolve(text);
    } finally {
        if (requestController) activeRequestControllers.delete(requestController);
        activeWorkers -= 1;
        if (queue.length) void processQueue();
    }
}

function scheduleRetry(text, from, to, protect, rateLimited = false) {
    if (typeof window === 'undefined' || typeof window.setTimeout !== 'function') return;
    const key = getCacheKey(text, from, to);
    if (pendingByKey.has(key)) return;
    const delay = rateLimited ? RETRY_MS_RATE_LIMIT : RETRY_MS;
    window.setTimeout(() => {
        if (getCachedTranslationEntry(text, from, to)) return;
        void translate(text, { from, to, protect });
    }, delay);
}

function enqueueTranslation(input, from, to, protect) {
    const key = getCacheKey(input, from, to);

    const existing = pendingByKey.get(key);
    if (existing) return existing;

    let resolveFn = () => {};
    const promise = new Promise((resolve) => {
        resolveFn = resolve;
    });
    pendingByKey.set(key, promise);

    queue.push({ text: input, from, to, protect, key, resolve: resolveFn });
    void processQueue();

    promise.finally(() => {
        pendingByKey.delete(key);
    });
    return promise;
}

/**
 * @param {string} text
 * @param {{ to?: string, from?: string, protect?: string[] }} [opts]
 * @returns {Promise<string>}
 */
export function translate(text, opts = {}) {
    if (!AI_TRANSLATE_CONFIG.enabled) return Promise.resolve(String(text ?? ''));
    loadCache();
    const input = normalizeInput(text);
    const from = mapLang(opts.from || AI_TRANSLATE_CONFIG.defaultSource);
    const to = resolveTargetLanguage(opts.to || getUiLanguage());
    const protect = opts.protect || [];

    if (!input || from === to || shouldNotTranslate(input, { protect })) {
        return Promise.resolve(input || String(text ?? ''));
    }

    const key = getCacheKey(input, from, to);
    const hit = getCachedTranslationEntry(input, from, to);
    if (hit) {
        recordCacheHit();
        return Promise.resolve(hit);
    }

    const failTs = failedAt.get(key);
    if (failTs && now() - failTs < RETRY_MS_RATE_LIMIT) {
        return Promise.resolve(input);
    }

    return enqueueTranslation(input, from, to, protect);
}

/** Sync: cache lub oryginał + kolejka w tle (nie blokuje UI). */
export function translateSoft(text, opts = {}) {
    if (!AI_TRANSLATE_CONFIG.enabled) return String(text ?? '');
    loadCache();
    const input = normalizeInput(text);
    const from = mapLang(opts.from || AI_TRANSLATE_CONFIG.defaultSource);
    const to = resolveTargetLanguage(opts.to || getUiLanguage());
    const protect = opts.protect || [];
    if (!input || from === to || shouldNotTranslate(input, { protect })) {
        return input || String(text ?? '');
    }
    const hit = getCachedTranslationEntry(input, from, to);
    if (hit) {
        recordCacheHit();
        return hit;
    }
    recordCacheMiss();
    void translate(input, { from, to, protect });
    return input;
}

/**
 * @param {string[]} texts
 * @param {{ to?: string, from?: string, protect?: string[] }} [opts]
 */
export function translateBatch(texts, opts = {}) {
    const list = Array.isArray(texts) ? texts : [];
    const unique = [...new Set(list.map((t) => String(t ?? '').trim()).filter(Boolean))];
    return Promise.all(unique.map((t) => translate(t, opts))).then((results) => {
        const byText = new Map(unique.map((t, i) => [t, results[i]]));
        return list.map((t) => byText.get(String(t ?? '').trim()) ?? String(t ?? ''));
    });
}

/**
 * Produkt — tłumaczy name/description/promo; nie rusza cen, SKU, jednostek.
 * @param {object} product
 * @param {{ producerName?: string, address?: string, to?: string, from?: string }} [opts]
 */
export async function translateProduct(product, opts = {}) {
    if (!product || typeof product !== 'object') return product;
    const protect = [opts.producerName, opts.address].filter(Boolean);
    const to = opts.to;
    const from = opts.from || AI_TRANSLATE_CONFIG.defaultSource;
    const [name, description, promo] = await Promise.all([
        product.name ? translate(String(product.name), { to, from, protect }) : Promise.resolve(product.name),
        product.description
            ? translate(String(product.description), { to, from, protect })
            : Promise.resolve(product.description),
        product.promo ? translate(String(product.promo), { to, from, protect }) : Promise.resolve(product.promo)
    ]);
    return { ...product, name, description, promo };
}

/**
 * Opis / treść profilu producenta — bez nazwy i adresu.
 * @param {object} producer
 * @param {{ to?: string, from?: string }} [opts]
 */
export async function translateProducerProfile(producer, opts = {}) {
    if (!producer || typeof producer !== 'object') return producer;
    const protect = [producer.name, producer.address, producer.city, producer.phone, producer.email]
        .filter(Boolean)
        .map(String);
    const to = opts.to;
    const from = opts.from || AI_TRANSLATE_CONFIG.defaultSource;
    const description = producer.description
        ? await translate(String(producer.description), { to, from, protect })
        : producer.description;
    const products = Array.isArray(producer.products)
        ? await Promise.all(
            producer.products.map((p) =>
                translateProduct(p, { producerName: producer.name, address: producer.address, to, from })
            )
        )
        : producer.products;
    return { ...producer, description, products };
}

/**
 * Tłumaczy elementy oznaczone data-rg-ai (lub data-rg-ai-src).
 * Nie zmienia layoutu — tylko textContent.
 * @param {ParentNode} [root]
 * @param {{ to?: string, from?: string }} [opts]
 */
export async function translatePage(root, opts = {}) {
    if (typeof document === 'undefined') return { updated: 0 };
    const scope = root || document;
    const nodes = scope.querySelectorAll?.('[data-rg-ai], [data-rg-ai-src]') || [];
    const to = resolveTargetLanguage(opts.to || getUiLanguage());
    const from = mapLang(opts.from || AI_TRANSLATE_CONFIG.defaultSource);
    let updated = 0;
    /** @type {Map<string, HTMLElement[]>} */
    const bySource = new Map();

    nodes.forEach((el) => {
        if (!(el instanceof HTMLElement)) return;
        if (el.hasAttribute('data-rg-ai-skip')) return;
        const src = el.getAttribute('data-rg-ai-src') || (el.textContent || '').trim();
        if (!src) return;
        el.setAttribute('data-rg-ai-src', src);
        el.setAttribute('data-rg-ai-lang', to);
        const cached = getCachedTranslationEntry(src, from, to);
        if (cached) {
            if (el.textContent !== cached) {
                el.setAttribute('data-rg-ai-prev', cached);
                el.textContent = cached;
                updated += 1;
            }
            return;
        }
        if (!bySource.has(src)) bySource.set(src, []);
        bySource.get(src).push(el);
    });

    const pendingSources = [...bySource.keys()];
    if (!pendingSources.length) return { updated };

    const translations = await Promise.all(
        pendingSources.map((src) => translate(src, { to, from }))
    );
    const translationMap = new Map(pendingSources.map((src, i) => [src, translations[i]]));

    for (const [src, elements] of bySource) {
        const tr = translationMap.get(src);
        if (tr && tr !== src) {
            elements.forEach((el) => {
                el.setAttribute('data-rg-ai-prev', tr);
                el.textContent = tr;
            });
            updated += elements.length;
        }
    }
    return { updated };
}

/** Przypisz źródło do elementu (soft + przyszły patch DOM). */
export function bindAiText(el, sourceText, opts = {}) {
    if (!el || sourceText == null) return String(sourceText ?? '');
    const src = String(sourceText);
    const to = resolveTargetLanguage(opts.to || getUiLanguage());
    el.setAttribute('data-rg-ai-src', src);
    el.setAttribute('data-rg-ai-lang', to);
    const soft = translateSoft(src, opts);
    el.setAttribute('data-rg-ai-prev', soft);
    el.textContent = soft;
    return soft;
}

export function getCachedTranslation(text, toLang, fromLang = AI_TRANSLATE_CONFIG.defaultSource) {
    loadCache();
    const input = normalizeInput(text);
    const to = resolveTargetLanguage(toLang);
    const from = mapLang(fromLang);
    if (!input || from === to || shouldNotTranslate(input)) return null;
    return getCachedTranslationEntry(input, from, to);
}

export function invalidateCache(filter) {
    loadCache();
    if (!filter) {
        memoryCache = new Map();
        pendingByKey.clear();
        failedAt.clear();
        providerRateLimitedUntil.clear();
        queue.length = 0;
        activeWorkers = 0;
        Object.assign(auditStats, {
            requests: 0,
            cacheHits: 0,
            cacheMisses: 0,
            libreRequests: 0,
            mymemoryRequests: 0,
            status400: 0,
            status429: 0,
            retries: 0,
            totalMs: 0,
            completed: 0,
            providerSkips: 0
        });
        try {
            localStorage.removeItem(CACHE_KEY);
            localStorage.removeItem(LEGACY_CACHE_KEY);
        } catch { /* ignore */ }
        return;
    }
    const needle = String(filter);
    for (const k of [...memoryCache.keys()]) {
        if (k.includes(needle)) memoryCache.delete(k);
    }
    persistCache();
}

export function getAiTranslateStats() {
    loadCache();
    const hits = auditStats.cacheHits;
    const misses = auditStats.cacheMisses;
    const lookups = hits + misses;
    return {
        cached: memoryCache.size,
        queued: queue.length,
        inflight: pendingByKey.size,
        failed: failedAt.size,
        providers: [...(AI_TRANSLATE_CONFIG.providers || [])],
        enabled: AI_TRANSLATE_CONFIG.enabled,
        audit: {
            requests: auditStats.requests,
            cacheHits: hits,
            cacheMisses: misses,
            cacheHitRatio: lookups ? Number((hits / lookups).toFixed(4)) : 0,
            libreRequests: auditStats.libreRequests,
            mymemoryRequests: auditStats.mymemoryRequests,
            status400: auditStats.status400,
            status429: auditStats.status429,
            retries: auditStats.retries,
            providerSkips: auditStats.providerSkips,
            avgMs: auditStats.completed
                ? Math.round(auditStats.totalMs / auditStats.completed)
                : 0,
            requestGapMs: REQUEST_GAP_MS
        }
    };
}

export function initAiTranslationEngine() {
    loadCache();
    if (initialized) return;
    initialized = true;

    eventBus.on?.(EVENTS.LANGUAGE_CHANGED, ({ language } = {}) => {
        cancelAllPendingTranslations();
        const to = resolveTargetLanguage(language || getUiLanguage());
        void translatePage(document, { to }).catch(() => {});
    });

    if (typeof window !== 'undefined') {
        window.__RG_AI_I18N__ = {
            translate,
            translateBatch,
            translateProduct,
            translatePage,
            translateSoft,
            invalidateCache,
            stats: getAiTranslateStats,
            registerProvider,
            config: AI_TRANSLATE_CONFIG
        };
        // kompatybilność wsteczna
        window.__RG_DYN_I18N__ = {
            translate,
            soft: translateSoft,
            cached: getCachedTranslation,
            stats: getAiTranslateStats,
            clear: () => invalidateCache()
        };
    }
}

/* Aliasy kompatybilne z poprzednim silnikiem */
export const translateDynamic = translate;
export const translateDynamicSoft = translateSoft;
export const clearDynamicTranslateCache = () => invalidateCache();
export const getDynamicTranslateStats = getAiTranslateStats;
export const initDynamicTranslate = initAiTranslationEngine;
export const DYNAMIC_TRANSLATE_CONFIG = AI_TRANSLATE_CONFIG;

export default {
    translate,
    translateBatch,
    translateProduct,
    translateProducerProfile,
    translatePage,
    translateSoft,
    bindAiText,
    invalidateCache,
    getCachedTranslation,
    getAiTranslateStats,
    registerProvider,
    initAiTranslationEngine,
    shouldNotTranslate,
    resolveTargetLanguage,
    AI_TRANSLATE_CONFIG
};
