/**
 * Google AdSense – baner Home (90px) nad stopką.
 *
 * Język reklam (fakt oficjalny):
 * - AdSense **nie ma** parametru `language` w `adsbygoogle.push({})`.
 * - Dobiera język z: treści strony, języka użytkownika Google/przeglądarki, IP (region).
 * - My przekazujemy sygnały dozwolone: `html[lang]`, `content-language`, `?lang=` w URL,
 *   etykiety UI w wybranym języku; przy zmianie języka — remount jednostki.
 *
 * GPS: nie jest API AdSense; region i tak idzie z IP.
 * P4: AdSense NIE pyta o GPS — tylko już zapisana pozycja (mapa/Home nadal używa GPS).
 */
import { hasCookieConsentAccepted } from '../core/cookieConsent.js';
import { t, getCurrentLanguage } from '../core/i18n.js';
import {
    SUPPORTED_LANGUAGE_CODES,
    normalizeBrowserLanguage
} from '../translations.js';
import { ADSENSE_CONFIG } from '../config.js';
import { getLastPosition } from '../core/userLocation.js';
import { eventBus } from '../core/eventBus.js';
import { EVENTS } from '../core/events.js';

const LOADER_ID = 'rg-adsense-loader';
const DIAG_PREFIX = '[ADSENSE DIAGNOSTICS]';
const ADS_DIAG_PREFIX = '[AdsDiag]';
/** P5: czas oczekiwania na data-ad-status po push (anti-CLS, bez display:none). */
const UNFILLED_WATCH_MS = 4000;
/** P1: lazy load — margines przed wejściem w viewport. */
const LAZY_ROOT_MARGIN = '200px 0px';
const LAZY_THRESHOLD = 0.01;

/** @type {WeakMap<Element, { io?: IntersectionObserver, observers?: MutationObserver[], timers?: number[] }>} */
const adHostObservers = new WeakMap();

let adsenseInitialized = false;

/** @type {{ lat: number, lng: number, source: string } | null} */
let lastKnownGeo = null;
let localeBound = false;
/** Ostatnie źródło zmiany języka (manual | navigator | url | remount | init). */
let lastLocaleSource = 'init';
/** Snapshot navigator.language do wykrycia languagechange. */
let lastNavigatorLanguage = '';
/** Ostatni język, dla którego wykonano remount (P1 – skip przy tym samym). */
let lastRemountedLanguage = '';
/** Timer debounce 200 ms na zmianę języka (P1). */
let languageRemountTimer = null;

const LANG_REMOUNT_DEBOUNCE_MS = 200;
const UI_LANG_STORAGE_KEY = 'rs_lang';

/** P4: diagnostyka runtime — tylko localhost. */
const adsRuntimeDiag = {
    activeSlots: 0,
    renders: 0,
    errors: 0,
    skippedInits: 0,
    loadTimesMs: []
};

function isLocalhostDiag() {
    if (typeof window === 'undefined') return false;
    try {
        const host = String(window.location?.hostname || '').toLowerCase();
        return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
    } catch {
        return false;
    }
}

function adsDiagLog(message, extra = {}) {
    if (!isLocalhostDiag()) return;
    try {
        console.info(ADS_DIAG_PREFIX, message, {
            activeSlots: adsRuntimeDiag.activeSlots,
            renders: adsRuntimeDiag.renders,
            errors: adsRuntimeDiag.errors,
            skippedInits: adsRuntimeDiag.skippedInits,
            avgLoadMs: adsRuntimeDiag.loadTimesMs.length
                ? Math.round(
                    adsRuntimeDiag.loadTimesMs.reduce((a, b) => a + b, 0)
                        / adsRuntimeDiag.loadTimesMs.length
                )
                : 0,
            ...extra
        });
    } catch {
        /* ignore */
    }
}

function recordAdRender(unitCount, loadMs) {
    adsRuntimeDiag.renders += 1;
    adsRuntimeDiag.activeSlots = Math.max(adsRuntimeDiag.activeSlots, unitCount);
    if (Number.isFinite(loadMs)) adsRuntimeDiag.loadTimesMs.push(loadMs);
    adsDiagLog('render', { unitCount, loadMs: Math.round(loadMs || 0) });
}

function recordSkippedInit(reason) {
    adsRuntimeDiag.skippedInits += 1;
    adsDiagLog('skip-init', { reason });
}

function recordAdError(err) {
    adsRuntimeDiag.errors += 1;
    adsDiagLog('error', { message: String(err?.message || err) });
}

function getHostObserverState(host) {
    if (!adHostObservers.has(host)) {
        adHostObservers.set(host, { observers: [], timers: [] });
    }
    return adHostObservers.get(host);
}

export function disconnectHostAdObservers(host) {
    if (!host) return;
    const state = adHostObservers.get(host);
    if (!state) return;
    try {
        state.io?.disconnect?.();
    } catch {
        /* ignore */
    }
    (state.observers || []).forEach((observer) => {
        try {
            observer.disconnect?.();
        } catch {
            /* ignore */
        }
    });
    (state.timers || []).forEach((timer) => clearTimeout(timer));
    adHostObservers.delete(host);
}

export function teardownHomeAdSense(root = document) {
    const seen = new Set();
    [root, document].forEach((scope) => {
        scope?.querySelectorAll?.('[data-home-adsense]')?.forEach((host) => {
            if (seen.has(host)) return;
            seen.add(host);
            disconnectHostAdObservers(host);
        });
    });
    if (isLocalhostDiag()) {
        adsRuntimeDiag.activeSlots = 0;
        adsDiagLog('teardown');
    }
}

function isElementVisibleForAds(el) {
    if (!el?.isConnected) return false;
    if (el.closest('[hidden]')) return false;

    try {
        const panel = el.closest('[data-view-panel]');
        if (panel?.hidden) return false;
        if (document.body?.classList?.contains('view-map-active')) {
            const homePanel = el.closest('[data-view-panel="home"]');
            if (homePanel && homePanel.hidden) return false;
        }
    } catch {
        /* ignore */
    }

    try {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        if (Number.parseFloat(style.opacity) === 0) return false;
    } catch {
        /* ignore */
    }
    return true;
}

function isHostAlreadyInitialized(host) {
    if (!host) return false;
    if (host.getAttribute('data-rg-ad-initialized') === '1') return true;
    const ins = host.querySelector('ins.adsbygoogle');
    return Boolean(ins?.getAttribute('data-adsbygoogle-status'));
}

function markHostInitialized(host) {
    host?.setAttribute?.('data-rg-ad-initialized', '1');
}

function isNearViewport(el) {
    if (typeof window === 'undefined' || !el?.getBoundingClientRect) return true;
    const rect = el.getBoundingClientRect();
    const margin = 200;
    return rect.bottom >= -margin && rect.top <= (window.innerHeight || 0) + margin;
}

function attachLazyAdObserver(host) {
    if (!host || typeof IntersectionObserver === 'undefined') {
        pushAdUnits(host);
        return;
    }

    disconnectHostAdObservers(host);
    const state = getHostObserverState(host);

    const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            if (!isElementVisibleForAds(host)) continue;
            disconnectHostAdObservers(host);
            pushAdUnits(host);
            break;
        }
    }, {
        root: null,
        rootMargin: LAZY_ROOT_MARGIN,
        threshold: LAZY_THRESHOLD
    });

    state.io = io;
    try {
        io.observe(host);
        adsDiagLog('lazy-observer-attached');
    } catch {
        disconnectHostAdObservers(host);
        pushAdUnits(host);
    }
}

function scheduleAdLoad(host) {
    if (!host || !shouldShowAdSense() || !isAdSenseConfigured()) return;
    if (isHostAlreadyInitialized(host)) {
        recordSkippedInit('already-init');
        return;
    }
    if (!isElementVisibleForAds(host)) {
        recordSkippedInit('hidden-container');
        return;
    }
    if (isNearViewport(host)) {
        pushAdUnits(host);
        return;
    }
    attachLazyAdObserver(host);
}

function hasManualUiLanguage() {
    try {
        return Boolean(localStorage.getItem(UI_LANG_STORAGE_KEY));
    } catch {
        return false;
    }
}

/**
 * P1: debounce + skip gdy język bez zmian.
 * @param {{ source?: string, event?: string, language?: string }} opts
 */
function scheduleLanguageRemount(opts = {}) {
    if (languageRemountTimer != null) {
        clearTimeout(languageRemountTimer);
        languageRemountTimer = null;
    }
    languageRemountTimer = setTimeout(() => {
        languageRemountTimer = null;
        const source = opts.source || 'remount';
        const eventName = opts.event || 'language-changed+remount';
        const next = resolveAdSenseLanguage(opts.language || getCurrentLanguage());
        if (next === lastRemountedLanguage) return;
        syncAdSenseDocumentLocale(next);
        remountHomeAdSense(document, { source, event: eventName });
    }, LANG_REMOUNT_DEBOUNCE_MS);
}

function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * P6: pełna mapa BCP-47 dla wszystkich 36 kodów UI → html[lang] / content-language.
 * Specjalne: zh→zh-Hans, zh-tw→zh-Hant, no→nb; pozostałe 1:1.
 */
const HTML_LANG_MAP = Object.freeze({
    de: 'de',
    en: 'en',
    pl: 'pl',
    ru: 'ru',
    tr: 'tr',
    fr: 'fr',
    es: 'es',
    it: 'it',
    nl: 'nl',
    cs: 'cs',
    sk: 'sk',
    hu: 'hu',
    ro: 'ro',
    bg: 'bg',
    el: 'el',
    hr: 'hr',
    sr: 'sr',
    mk: 'mk',
    sl: 'sl',
    lt: 'lt',
    lv: 'lv',
    et: 'et',
    fi: 'fi',
    sv: 'sv',
    no: 'nb',
    da: 'da',
    is: 'is',
    zh: 'zh-Hans',
    'zh-tw': 'zh-Hant',
    ja: 'ja',
    ko: 'ko',
    vi: 'vi',
    ms: 'ms',
    id: 'id',
    th: 'th',
    hi: 'hi'
});

export function shouldShowAdSense() {
    if (!hasCookieConsentAccepted()) return false;
    return ADSENSE_CONFIG?.enabled !== false;
}

export function isAdSenseConfigured() {
    const client = String(ADSENSE_CONFIG?.clientId || '').trim();
    const slot = String(ADSENSE_CONFIG?.slotBanner || '').trim();
    return Boolean(client && slot && client.startsWith('ca-pub-'));
}

/** navigator.language → kod z 36 obsługiwanych (fallback de). */
export function detectBrowserAdLanguage() {
    try {
        const raw = (typeof navigator !== 'undefined' && (navigator.language || navigator.languages?.[0])) || 'de';
        return normalizeBrowserLanguage(raw);
    } catch {
        return 'de';
    }
}

/**
 * Język dla sygnałów AdSense: wybór UI (36 języków) → przeglądarka → de.
 */
export function resolveAdSenseLanguage(explicit) {
    if (explicit) {
        const n = normalizeBrowserLanguage(explicit);
        if (SUPPORTED_LANGUAGE_CODES.includes(n)) return n;
    }
    try {
        const ui = getCurrentLanguage();
        if (ui && SUPPORTED_LANGUAGE_CODES.includes(ui)) return ui;
    } catch {
        /* ignore */
    }
    const browser = detectBrowserAdLanguage();
    if (SUPPORTED_LANGUAGE_CODES.includes(browser)) return browser;
    return 'de';
}

export function toHtmlLang(code) {
    const raw = String(code || 'de').trim();
    if (HTML_LANG_MAP[raw]) return HTML_LANG_MAP[raw];
    const base = raw.split('-')[0] || 'de';
    if (HTML_LANG_MAP[base]) return HTML_LANG_MAP[base];
    return base || 'de';
}

/** Skąd wzięliśmy język przy starcie: url → zapiszeń UI → navigator. */
export function detectAdSenseLocaleSource() {
    try {
        const urlLang = new URLSearchParams(window.location.search || '').get('lang');
        if (urlLang && String(urlLang).trim()) return 'url';
    } catch {
        /* ignore */
    }
    try {
        if (localStorage.getItem('rs_lang')) return 'manual';
    } catch {
        /* ignore */
    }
    return 'navigator';
}

/**
 * Czytelny blok diagnostyczny w konsoli (tylko logi — bez wpływu na AdSense).
 * @param {string} [source] manual | navigator | url | remount | init
 * @param {{ event?: string }} [extra]
 */
export function logAdSenseDiagnostics(source = lastLocaleSource || 'unknown', extra = {}) {
    if (typeof console === 'undefined' || typeof console.info !== 'function') return;

    lastLocaleSource = String(source || 'unknown');
    const uiLang = resolveAdSenseLanguage();
    const regionCode = toHtmlLang(uiLang);
    let htmlLang = regionCode;
    try {
        if (typeof document !== 'undefined' && document.documentElement?.lang) {
            htmlLang = String(document.documentElement.lang);
        }
    } catch {
        /* ignore */
    }

    let browserRaw = '';
    try {
        browserRaw = String(navigator?.language || navigator?.languages?.[0] || '');
    } catch {
        browserRaw = '';
    }

    let urlLang = '';
    try {
        urlLang = new URLSearchParams(window.location.search || '').get('lang') || '';
    } catch {
        urlLang = '';
    }

    const timestamp = new Date().toISOString();
    const eventLabel = extra.event || 'locale';
    const line = (key, value) => `${DIAG_PREFIX} ${key}: ${value}`;
    const headStyle = 'color:#0b5;font-weight:700;background:#0b5a0b14;padding:2px 6px;border-radius:4px';
    const bodyStyle = 'color:#1a3a2a;font-weight:500';

    try {
        console.groupCollapsed(
            `%c${DIAG_PREFIX} ==================================`,
            headStyle
        );
        console.info(`%c${line('Timestamp', timestamp)}`, bodyStyle);
        console.info(`%c${line('Event', eventLabel)}`, bodyStyle);
        console.info(`%c${line('UI Language', uiLang)}`, bodyStyle);
        console.info(`%c${line('html[lang]', htmlLang)}`, bodyStyle);
        console.info(
            `%c${line('Region Code', regionCode)}${regionCode !== uiLang ? ' (mapped from UI)' : ''}`,
            bodyStyle
        );
        console.info(`%c${line('Source', lastLocaleSource)}`, bodyStyle);
        console.info(`%c${line('navigator.language', browserRaw || '—')}`, bodyStyle);
        console.info(`%c${line('URL ?lang', urlLang || '—')}`, bodyStyle);
        console.info(
            `%c${line('AdSense language param', 'NOT SUPPORTED (Google uses context signals only)')}`,
            'color:#a60;font-weight:600'
        );
        console.info(
            `%c${DIAG_PREFIX} ==================================`,
            headStyle
        );
        console.groupEnd();
    } catch {
        // Fallback bez %c / group
        console.info(DIAG_PREFIX, '==================================');
        console.info(line('Timestamp', timestamp));
        console.info(line('Event', eventLabel));
        console.info(line('UI Language', uiLang));
        console.info(line('html[lang]', htmlLang));
        console.info(line('Region Code', regionCode));
        console.info(line('Source', lastLocaleSource));
        console.info(line('navigator.language', browserRaw || '—'));
        console.info(line('URL ?lang', urlLang || '—'));
        console.info(
            line('AdSense language param', 'NOT SUPPORTED (Google uses context signals only)')
        );
        console.info(DIAG_PREFIX, '==================================');
    }
}

/**
 * Kontekst język/lokalizacja (diagnostyka + sygnały strony).
 * `adsenseAcceptsLanguageParam: false` — brak oficjalnego push({ language }).
 */
export function getAdSenseLocaleContext() {
    const language = resolveAdSenseLanguage();
    const browserLanguage = detectBrowserAdLanguage();
    const geo = lastKnownGeo || getLastPosition();
    return {
        language,
        htmlLang: toHtmlLang(language),
        browserLanguage,
        supportedCount: SUPPORTED_LANGUAGE_CODES.length,
        adsenseAcceptsLanguageParam: false,
        adsenseAcceptsGps: false,
        languageSignal: 'html-lang+content-language+url-lang',
        geotargeting: 'ip-automatic',
        position: geo && Number.isFinite(geo.lat) && Number.isFinite(geo.lng)
            ? { lat: geo.lat, lng: geo.lng, source: geo.source || 'unknown' }
            : null
    };
}

/**
 * P7: `?lang=xx` tylko przy realnej zmianie wartości.
 * Nie czyści innych query (UTM itd.) — mutuje wyłącznie klucz `lang`.
 */
export function syncAdSenseUrlLang(lang = resolveAdSenseLanguage()) {
    if (typeof window === 'undefined' || !window.history?.replaceState) return lang;
    try {
        const url = new URL(window.location.href);
        const current = url.searchParams.get('lang');
        if (current === lang) return lang;
        url.searchParams.set('lang', lang);
        window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    } catch {
        /* ignore */
    }
    return lang;
}

/** html[lang] + content-language — sygnały strony dla AdSense / Search. */
export function syncAdSenseDocumentLocale(lang) {
    const code = resolveAdSenseLanguage(lang);
    const htmlLang = toHtmlLang(code);
    if (typeof document === 'undefined') return code;
    try {
        document.documentElement.lang = htmlLang;
        document.documentElement.setAttribute('data-rg-ui-lang', code);
        let meta = document.querySelector('meta[http-equiv="content-language"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('http-equiv', 'content-language');
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', htmlLang);
        syncAdSenseUrlLang(code);
    } catch {
        /* ignore */
    }
    return code;
}

/**
 * P4: wyłącznie już zapisana pozycja — bez requestCurrentPosition / promptu GPS.
 * GPS zostaje mapie/Home; AdSense i tak geotargetuje po IP.
 */
export function refreshAdSenseUserLocation() {
    const stored = getLastPosition();
    if (stored && Number.isFinite(stored.lat) && Number.isFinite(stored.lng)) {
        lastKnownGeo = {
            lat: stored.lat,
            lng: stored.lng,
            source: stored.source || 'stored'
        };
        annotateAdHostsWithGeo();
    }
    return Promise.resolve(getAdSenseLocaleContext());
}

function annotateAdHostsWithGeo(root = document) {
    if (!root?.querySelectorAll) return;
    const lang = resolveAdSenseLanguage();
    root.querySelectorAll('[data-home-adsense]').forEach((host) => {
        host.setAttribute('data-rg-ad-lang', lang);
        host.setAttribute('data-rg-ad-html-lang', toHtmlLang(lang));
        if (lastKnownGeo) {
            host.setAttribute('data-rg-user-lat', String(lastKnownGeo.lat));
            host.setAttribute('data-rg-user-lng', String(lastKnownGeo.lng));
            host.setAttribute('data-rg-user-geo-source', lastKnownGeo.source);
            host.setAttribute('data-rg-adsense-gps', 'app-only');
        }
    });
}

export function ensureAdSenseScript() {
    if (!hasCookieConsentAccepted()) return false;
    if (!isAdSenseConfigured()) return false;
    const client = String(ADSENSE_CONFIG.clientId).trim();
    const src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
    let el = document.getElementById(LOADER_ID);
    if (el) {
        if (!String(el.src || '').includes(client)) el.src = src;
        return true;
    }
    el = document.createElement('script');
    el.id = LOADER_ID;
    el.async = true;
    el.crossOrigin = 'anonymous';
    el.src = src;
    el.setAttribute('data-rg-adsense', '1');
    document.head.appendChild(el);
    return true;
}

function buildInsHtml(client, slot) {
    // P8: full-width responsive; wysokość 90px bez zmian (inline + .rg-adsense-frame)
    return `<ins class="adsbygoogle rg-adsense-ins"
                style="display:block;width:100%;height:90px"
                data-ad-client="${client}"
                data-ad-slot="${slot}"
                data-ad-format="horizontal"
                data-full-width-responsive="true"></ins>`;
}

export function buildHomeAdSenseHtml() {
    if (!shouldShowAdSense()) return '';

    const lang = syncAdSenseDocumentLocale();
    const label = escapeHtml(t('ads.label') || 'Reklama');
    const aria = escapeHtml(t('ads.sectionLabel') || 'Reklama');
    const configured = isAdSenseConfigured();
    const client = escapeHtml(String(ADSENSE_CONFIG.clientId || '').trim());
    const slot = escapeHtml(String(ADSENSE_CONFIG.slotBanner || '').trim());
    const geo = lastKnownGeo || getLastPosition();
    const geoAttrs =
        geo && Number.isFinite(geo.lat) && Number.isFinite(geo.lng)
            ? ` data-rg-user-lat="${escapeHtml(geo.lat)}" data-rg-user-lng="${escapeHtml(geo.lng)}" data-rg-user-geo-source="${escapeHtml(geo.source || 'stored')}" data-rg-adsense-gps="app-only"`
            : ' data-rg-adsense-gps="none"';

    const inner = configured
        ? buildInsHtml(client, slot)
        : `<div class="rg-adsense-placeholder" data-adsense-placeholder>
                <span class="rg-adsense-placeholder-text">${escapeHtml(t('ads.placeholder') || 'Reklama')}</span>
           </div>`;

    return `
        <aside class="rg-adsense-home app-section" role="complementary" aria-label="${aria}" data-home-adsense data-rg-ad-lang="${escapeHtml(lang)}" data-rg-ad-html-lang="${escapeHtml(toHtmlLang(lang))}"${geoAttrs}>
            <span class="rg-adsense-label rg-ad-label" aria-hidden="true">${label}</span>
            <div class="rg-adsense-frame" role="region" aria-label="${aria}">
                ${inner}
            </div>
        </aside>
    `;
}

/**
 * P5: obserwuj data-ad-status="unfilled" po push.
 * Nie ustawia display:none na ins (polityka AdSense) — wysokość 90px zostaje (anti-CLS).
 */
function watchAdUnitFill(host) {
    if (!host || typeof document === 'undefined') return;
    const state = getHostObserverState(host);
    const units = host.querySelectorAll?.('ins.adsbygoogle') || [];
    units.forEach((ins) => {
        if (!ins || ins.getAttribute('data-rg-unfilled-watch') === '1') return;
        ins.setAttribute('data-rg-unfilled-watch', '1');

        let settled = false;
        const finish = (observer, timer) => {
            if (settled) return;
            settled = true;
            try {
                observer?.disconnect?.();
            } catch {
                /* ignore */
            }
            if (timer != null) {
                clearTimeout(timer);
                const idx = state.timers.indexOf(timer);
                if (idx >= 0) state.timers.splice(idx, 1);
            }
            if (observer && state.observers) {
                const oIdx = state.observers.indexOf(observer);
                if (oIdx >= 0) state.observers.splice(oIdx, 1);
            }
        };

        const reportUnfilled = () => {
            ins.setAttribute('data-rg-ad-unfilled', '1');
            host.setAttribute('data-rg-ad-unfilled', '1');
            if (isLocalhostDiag()) {
                try {
                    console.info(
                        `${DIAG_PREFIX} Ad unit unfilled (data-ad-status=unfilled) — height preserved, no display:none`
                    );
                } catch {
                    /* ignore */
                }
            }
        };

        const check = () => {
            const status = String(ins.getAttribute('data-ad-status') || '').toLowerCase();
            if (status === 'unfilled') {
                reportUnfilled();
                return true;
            }
            if (status === 'filled') return true;
            return false;
        };

        if (check()) {
            finish(null, null);
            return;
        }

        let observer = null;
        let timer = null;
        if (typeof MutationObserver !== 'undefined') {
            observer = new MutationObserver(() => {
                if (check()) finish(observer, timer);
            });
            try {
                observer.observe(ins, {
                    attributes: true,
                    attributeFilter: ['data-ad-status', 'data-adsbygoogle-status']
                });
                state.observers.push(observer);
            } catch {
                observer = null;
            }
        }

        timer = setTimeout(() => {
            check();
            finish(observer, timer);
        }, UNFILLED_WATCH_MS);
        state.timers.push(timer);
    });
}

function pushAdUnits(host) {
    if (!host || !hasCookieConsentAccepted() || !isAdSenseConfigured()) return false;
    if (!isElementVisibleForAds(host)) {
        recordSkippedInit('hidden-on-push');
        return false;
    }
    if (isHostAlreadyInitialized(host)) {
        recordSkippedInit('already-init-on-push');
        return false;
    }

    ensureAdSenseScript();
    const started = typeof performance !== 'undefined' ? performance.now() : 0;

    try {
        window.adsbygoogle = window.adsbygoogle || [];
        const units = host.querySelectorAll('ins.adsbygoogle:not([data-adsbygoogle-status])');
        if (!units.length) {
            recordSkippedInit('no-pending-units');
            return false;
        }
        units.forEach(() => {
            window.adsbygoogle.push({});
        });
        markHostInitialized(host);
        recordAdRender(units.length, typeof performance !== 'undefined' ? performance.now() - started : 0);
        watchAdUnitFill(host);
        return true;
    } catch (e) {
        recordAdError(e);
        console.warn('[AdSense]', e);
        return false;
    }
}

/**
 * Remount jednostki po zmianie języka (nowe żądanie przy zaktualizowanym html[lang] + ?lang=).
 * @param {ParentNode} [root]
 * @param {{ source?: string, event?: string, force?: boolean }} [opts]
 */
export function remountHomeAdSense(root = document, opts = {}) {
    const source = opts.source || 'remount';
    const eventName = opts.event || 'remount';
    const lang = resolveAdSenseLanguage();

    // P1 – skip remount przy tym samym języku
    if (!opts.force && lang === lastRemountedLanguage) {
        return;
    }

    if (!shouldShowAdSense()) {
        logAdSenseDiagnostics(source, { event: eventName === 'remount' ? 'remount-skipped' : eventName });
        return;
    }
    const host = root.querySelector?.('[data-home-adsense]') || document.querySelector('[data-home-adsense]');
    if (!host) {
        logAdSenseDiagnostics(source, { event: 'remount-no-host' });
        return;
    }

    syncAdSenseDocumentLocale(lang);
    host.setAttribute('data-rg-ad-lang', lang);
    host.setAttribute('data-rg-ad-html-lang', toHtmlLang(lang));
    host.setAttribute('aria-label', t('ads.sectionLabel') || 'Reklama');

    const label = host.querySelector('.rg-adsense-label');
    if (label) label.textContent = t('ads.label') || 'Reklama';

    const frame = host.querySelector('.rg-adsense-frame');
    if (!frame) {
        logAdSenseDiagnostics(source, { event: 'remount-no-frame' });
        return;
    }

    if (!isAdSenseConfigured()) {
        const ph = frame.querySelector('[data-adsense-placeholder] .rg-adsense-placeholder-text');
        if (ph) ph.textContent = t('ads.placeholder') || 'Reklama';
        lastRemountedLanguage = lang;
        logAdSenseDiagnostics(source, {
            event: eventName === 'remount' ? 'remount-placeholder' : eventName
        });
        return;
    }

    const client = escapeHtml(String(ADSENSE_CONFIG.clientId || '').trim());
    const slot = escapeHtml(String(ADSENSE_CONFIG.slotBanner || '').trim());
    disconnectHostAdObservers(host);
    host.removeAttribute('data-rg-ad-initialized');
    host.removeAttribute('data-rg-ad-unfilled');
    frame.innerHTML = buildInsHtml(client, slot);
    scheduleAdLoad(host);
    lastRemountedLanguage = lang;
    logAdSenseDiagnostics(source, { event: eventName });
}

export function mountHomeAdSense(root = document) {
    if (!shouldShowAdSense()) return;
    const host = root.querySelector?.('[data-home-adsense]') || document.querySelector('[data-home-adsense]');
    if (!host) return;

    syncAdSenseDocumentLocale();
    annotateAdHostsWithGeo(root);

    if (!isAdSenseConfigured()) return;

    void refreshAdSenseUserLocation().then(() => annotateAdHostsWithGeo(root));
    scheduleAdLoad(host);
}

function bindLocaleListeners() {
    if (localeBound || typeof window === 'undefined') return;
    localeBound = true;

    try {
        lastNavigatorLanguage = String(navigator?.language || '');
    } catch {
        lastNavigatorLanguage = '';
    }

    // P1 debounce 200ms · P3 jeden log: language-changed+remount
    eventBus.on?.(EVENTS.LANGUAGE_CHANGED, ({ language } = {}) => {
        scheduleLanguageRemount({
            source: 'manual',
            event: 'language-changed+remount',
            language: language || getCurrentLanguage()
        });
    });

    // P2: languagechange nie nadpisuje ręcznego UI (rs_lang)
    window.addEventListener('languagechange', () => {
        let next = '';
        try {
            next = String(navigator?.language || '');
        } catch {
            next = '';
        }
        if (next && next === lastNavigatorLanguage) return;
        lastNavigatorLanguage = next;

        if (hasManualUiLanguage()) {
            // Tylko diagnostyka navigator.language — bez sync UI i bez remount
            logAdSenseDiagnostics('navigator', { event: 'navigator-languagechange-diag-only' });
            return;
        }

        scheduleLanguageRemount({
            source: 'navigator',
            event: 'navigator-languagechange+remount',
            language: detectBrowserAdLanguage()
        });
    });

    eventBus.on?.(EVENTS.LOCATION_UPDATED, (payload) => {
        const lat = Number(payload?.lat ?? payload?.latitude);
        const lng = Number(payload?.lng ?? payload?.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        lastKnownGeo = { lat, lng, source: 'gps' };
        annotateAdHostsWithGeo();
    });
}

export function initAdSense() {
    if (!hasCookieConsentAccepted()) return;
    if (adsenseInitialized) return;
    adsenseInitialized = true;

    window.adsbygoogle = window.adsbygoogle || [];
    const initSource = detectAdSenseLocaleSource();
    const initLang = syncAdSenseDocumentLocale(getCurrentLanguage() || detectBrowserAdLanguage());
    lastRemountedLanguage = initLang;
    bindLocaleListeners();
    logAdSenseDiagnostics(initSource, { event: 'init' });
    adsDiagLog('init');

    if (isAdSenseConfigured()) ensureAdSenseScript();
    void refreshAdSenseUserLocation();

    window.__RG_ADSENSE__ = {
        config: () => ({ ...ADSENSE_CONFIG }),
        mount: mountHomeAdSense,
        remount: remountHomeAdSense,
        teardown: teardownHomeAdSense,
        configured: isAdSenseConfigured,
        shouldShow: shouldShowAdSense,
        locale: getAdSenseLocaleContext,
        refreshLocation: refreshAdSenseUserLocation,
        syncLocale: syncAdSenseDocumentLocale,
        resolveLanguage: resolveAdSenseLanguage,
        detectBrowserLanguage: detectBrowserAdLanguage,
        supportedLanguages: () => [...SUPPORTED_LANGUAGE_CODES],
        logDiagnostics: logAdSenseDiagnostics,
        acceptsLanguageParam: false,
        acceptsGps: false,
        ...(isLocalhostDiag()
            ? {
                diag: () => ({ ...adsRuntimeDiag }),
                logAdsDiag: adsDiagLog
            }
            : {})
    };
}

export default {
    initAdSense,
    buildHomeAdSenseHtml,
    mountHomeAdSense,
    remountHomeAdSense,
    teardownHomeAdSense,
    disconnectHostAdObservers,
    shouldShowAdSense,
    isAdSenseConfigured,
    ensureAdSenseScript,
    getAdSenseLocaleContext,
    refreshAdSenseUserLocation,
    syncAdSenseDocumentLocale,
    resolveAdSenseLanguage,
    detectBrowserAdLanguage,
    toHtmlLang,
    logAdSenseDiagnostics,
    detectAdSenseLocaleSource
};
