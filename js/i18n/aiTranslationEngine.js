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

const LANG_STORAGE_KEY = 'rs_lang';
const CACHE_KEY = 'rg_ai_i18n_v2';
const LEGACY_CACHE_KEY = 'rg_dyn_i18n_v1';
const MAX_ENTRIES = 1200;
const MAX_TEXT = 1200;
const BRAND_TOKEN = '\uE000RG_BRAND\uE001';
const PROTECT_TOKEN = (i) => `\uE000RG_P${i}\uE001`;
const QUEUE_CONCURRENCY = 2;
const REQUEST_GAP_MS = 140;
const RETRY_MS = 45_000;

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
/** @type {Set<string>} */
const inflight = new Set();
/** @type {{ text: string, from: string, to: string, protect: string[], resolve: Function }[]} */
const queue = [];
/** @type {Map<string, number>} failedAt */
const failedAt = new Map();
let activeWorkers = 0;
let lastRequestAt = 0;
let initialized = false;

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

/** Cache key: oryginał + język docelowy */
function makeCacheKey(text, to) {
    return `${to}::${text}`;
}

function loadCache() {
    if (memoryCache.size) return;
    try {
        const raw = localStorage.getItem(CACHE_KEY) || localStorage.getItem(LEGACY_CACHE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        const entries = Array.isArray(data?.entries) ? data.entries : [];
        for (const row of entries) {
            if (Array.isArray(row) && typeof row[0] === 'string' && typeof row[1] === 'string') {
                // migracja v1: from|to|text → to::text
                let k = row[0];
                if (k.includes('|') && !k.includes('::')) {
                    const parts = k.split('|');
                    if (parts.length >= 3) k = `${parts[1]}::${parts.slice(2).join('|')}`;
                }
                memoryCache.set(k, row[1]);
            }
        }
    } catch {
        memoryCache = new Map();
    }
}

function persistCache() {
    try {
        let entries = [...memoryCache.entries()];
        if (entries.length > MAX_ENTRIES) {
            entries = entries.slice(entries.length - MAX_ENTRIES);
            memoryCache = new Map(entries);
        }
        localStorage.setItem(CACHE_KEY, JSON.stringify({ v: 2, at: new Date().toISOString(), entries }));
    } catch {
        try {
            const entries = [...memoryCache.entries()].slice(-Math.floor(MAX_ENTRIES / 2));
            memoryCache = new Map(entries);
            localStorage.setItem(CACHE_KEY, JSON.stringify({ v: 2, entries }));
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
            const url = `${String(cfg.libreUrl || '').replace(/\/$/, '')}/translate`;
            const body = { q: text, source: from, target: to, format: 'text' };
            if (cfg.libreApiKey) body.api_key = cfg.libreApiKey;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(body),
                signal: abortSignal(12000)
            });
            if (!res.ok) throw new Error(`libre ${res.status}`);
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
                signal: abortSignal(12000)
            });
            if (!res.ok) throw new Error(`mymemory ${res.status}`);
            const data = await res.json();
            const out = data?.responseData?.translatedText;
            if (!out || typeof out !== 'string') throw new Error('mymemory empty');
            if (/MYMEMORY WARNING/i.test(out)) throw new Error('mymemory quota');
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
                signal: abortSignal(12000)
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
                signal: abortSignal(12000)
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
                signal: abortSignal(20000)
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

async function runProviders(text, from, to) {
    const order = AI_TRANSLATE_CONFIG.providers || [];
    let lastErr;
    for (const id of order) {
        const p = PROVIDERS[id];
        if (!p) continue;
        try {
            const out = await p.translate(text, from, to, AI_TRANSLATE_CONFIG);
            if (out && typeof out === 'string') return out;
        } catch (e) {
            lastErr = e;
        }
    }
    throw lastErr || new Error('no provider');
}

async function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

async function throttle() {
    const wait = Math.max(0, REQUEST_GAP_MS - (now() - lastRequestAt));
    if (wait) await sleep(wait);
    lastRequestAt = now();
}

async function fetchTranslation(text, from, to, protect = []) {
    const { text: protectedText, list } = protectSpans(text, protect);
    const raw = await runProviders(protectedText, from, to);
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
    const { text, from, to, protect, resolve } = job;
    const key = makeCacheKey(text, to);
    try {
        await throttle();
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            failedAt.set(key, now());
            resolve(text);
            return;
        }
        const out = await fetchTranslation(text, from, to, protect);
        memoryCache.set(key, out);
        failedAt.delete(key);
        persistCache();
        emitUpdated({ from, to, text, translation: out });
        resolve(out);
    } catch {
        failedAt.set(key, now());
        // cicho — oryginał; ponów później
        scheduleRetry(text, from, to, protect);
        resolve(text);
    } finally {
        inflight.delete(key);
        activeWorkers -= 1;
        if (queue.length) void processQueue();
    }
}

function scheduleRetry(text, from, to, protect) {
    if (typeof window === 'undefined' || typeof window.setTimeout !== 'function') return;
    const key = makeCacheKey(text, to);
    window.setTimeout(() => {
        if (memoryCache.has(key)) return;
        void translate(text, { from, to, protect });
    }, RETRY_MS);
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

    const key = makeCacheKey(input, to);
    const hit = memoryCache.get(key);
    if (hit) return Promise.resolve(hit);

    const failTs = failedAt.get(key);
    if (failTs && now() - failTs < RETRY_MS) {
        return Promise.resolve(input);
    }

    if (inflight.has(key)) {
        return new Promise((resolve) => {
            queue.push({ text: input, from, to, protect, resolve });
            void processQueue();
        });
    }

    inflight.add(key);
    return new Promise((resolve) => {
        queue.push({ text: input, from, to, protect, resolve });
        void processQueue();
    });
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
    const hit = memoryCache.get(makeCacheKey(input, to));
    if (hit) return hit;
    void translate(input, { from, to, protect });
    return input;
}

/**
 * @param {string[]} texts
 * @param {{ to?: string, from?: string, protect?: string[] }} [opts]
 */
export function translateBatch(texts, opts = {}) {
    const list = Array.isArray(texts) ? texts : [];
    return Promise.all(list.map((t) => translate(t, opts)));
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
    const jobs = [];
    nodes.forEach((el) => {
        if (!(el instanceof HTMLElement)) return;
        // Nie tłumacz nazw własnych oznaczonych data-rg-ai-skip
        if (el.hasAttribute('data-rg-ai-skip')) return;
        const src = el.getAttribute('data-rg-ai-src') || (el.textContent || '').trim();
        if (!src) return;
        el.setAttribute('data-rg-ai-src', src);
        el.setAttribute('data-rg-ai-lang', to);
        const cached = memoryCache.get(makeCacheKey(src, to));
        if (cached) {
            if (el.textContent !== cached) {
                el.setAttribute('data-rg-ai-prev', cached);
                el.textContent = cached;
                updated += 1;
            }
            return;
        }
        jobs.push(
            translate(src, { to, from }).then((tr) => {
                if (tr && tr !== src) {
                    el.setAttribute('data-rg-ai-prev', tr);
                    el.textContent = tr;
                    updated += 1;
                }
            })
        );
    });
    await Promise.all(jobs);
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
    return memoryCache.get(makeCacheKey(input, to)) || null;
}

export function invalidateCache(filter) {
    loadCache();
    if (!filter) {
        memoryCache = new Map();
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
    return {
        cached: memoryCache.size,
        queued: queue.length,
        inflight: inflight.size,
        failed: failedAt.size,
        providers: [...(AI_TRANSLATE_CONFIG.providers || [])],
        enabled: AI_TRANSLATE_CONFIG.enabled
    };
}

export function initAiTranslationEngine() {
    loadCache();
    if (initialized) return;
    initialized = true;

    eventBus.on?.(EVENTS.LANGUAGE_CHANGED, ({ language } = {}) => {
        queue.length = 0;
        inflight.clear();
        // Cache zostaje (per język). Odśwież oznaczone węzły w tle.
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
