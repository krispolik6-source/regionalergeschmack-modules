/**
 * ETAP 31A – Production Logging
 * ETAP 40 – Console Guardian: na produkcji 0 warn / 0 error w konsoli
 * (zapis lokalny przez capture hook · bez sieci).
 * DEV (localhost) → DEBUG+ · PRODUCTION → cisza w konsoli
 * Nie zmienia architektury aplikacji — filtruje console.*.
 */

export const LOG_LEVELS = Object.freeze({
    DEBUG: 10,
    INFO: 20,
    WARN: 30,
    ERROR: 40,
    FATAL: 50
});

export const LEVEL_NAMES = Object.freeze({
    10: 'DEBUG',
    20: 'INFO',
    30: 'WARN',
    40: 'ERROR',
    50: 'FATAL'
});

/** Prefiksy / słowa kluczowe logów diagnostycznych (ukryte na produkcji). */
export const DEV_LOG_PATTERNS = Object.freeze([
    /\[Health(?:\s+Monitor)?\]/i,
    /\[Guardian/i,
    /\[AI Guardian/i,
    /\[Dream/i,
    /\[Brain/i,
    /\[Product Brain/i,
    /\[Learning/i,
    /\[Emotion/i,
    /\[Living Brand/i,
    /\[Advisor/i,
    /\[Project Advisor/i,
    /\[Dev Dashboard/i,
    /\[Developer Dashboard/i,
    /\[Dashboard/i,
    /\[Virtual User/i,
    /\[Real Users/i,
    /\[Product Director/i,
    /\[Improvement/i,
    /\[Daily Report/i,
    /\[Daily Developer/i,
    /\[Quality Loop/i,
    /\[Weekly(?:\s+Premium)?/i,
    /\[Self Reflection/i,
    /\[Regional Intelligence/i,
    /\[PopupLifecycle/i,
    /\[ADSENSE DIAGNOSTICS\]/i,
    /\[MapDriveDiag\]/i,
    /__RG_[A-Z_]+/,
    /nawigacja gotowa/i
]);

const STORAGE_LEVEL = 'rg_log_level';

function hostname() {
    try {
        if (typeof location === 'undefined') return '';
        return String(location.hostname || '').toLowerCase();
    } catch {
        return '';
    }
}

function protocol() {
    try {
        if (typeof location === 'undefined') return '';
        return String(location.protocol || '');
    } catch {
        return '';
    }
}

export function isLocalhost() {
    const h = hostname();
    return h === 'localhost' || h === '127.0.0.1' || protocol() === 'file:';
}

export function isProductionHost() {
    try {
        const h = hostname();
        if (!h || h === 'localhost' || h === '127.0.0.1') return false;
        if (protocol() === 'file:') return false;
        if (h.endsWith('.netlify.app')) return true;
        if (h.includes('regionalergeschmack')) return true;
        return false;
    } catch {
        return false;
    }
}

/** DEV → DEBUG · PRODUCTION → cisza (poziom powyżej FATAL = nic nie emituj) */
export function getDefaultMinLevel() {
    if (isLocalhost()) return LOG_LEVELS.DEBUG;
    return LOG_LEVELS.FATAL + 1;
}

/** @type {null | ((level: number, args: unknown[]) => void)} */
let consoleCaptureHook = null;

/** ETAP 40 — hook do lokalnego zapisu (Console Guardian). */
export function setConsoleCaptureHook(fn) {
    consoleCaptureHook = typeof fn === 'function' ? fn : null;
}

export function parseLevel(raw) {
    if (typeof raw === 'number' && !Number.isNaN(raw)) return raw;
    const key = String(raw || '').toUpperCase();
    if (key in LOG_LEVELS) return LOG_LEVELS[key];
    return null;
}

export function getEffectiveMinLevel() {
    try {
        if (isLocalhost()) {
            const q = new URLSearchParams(location.search).get('log');
            const fromQuery = parseLevel(q);
            if (fromQuery != null) return fromQuery;
            const fromLs = parseLevel(localStorage.getItem(STORAGE_LEVEL));
            if (fromLs != null) return fromLs;
        }
    } catch {
        /* ignore */
    }
    return getDefaultMinLevel();
}

export function isDevDiagnosticMessage(text) {
    const s = String(text || '');
    return DEV_LOG_PATTERNS.some((re) => re.test(s));
}

function argsToText(args) {
    try {
        return (args || []).map((a) => {
            if (typeof a === 'string') return a;
            if (a instanceof Error) return a.message || String(a);
            try {
                return JSON.stringify(a);
            } catch {
                return String(a);
            }
        }).join(' ');
    } catch {
        return '';
    }
}

/**
 * Czy wpis powinien trafić do konsoli.
 * @param {number} level
 * @param {unknown[]} args
 */
export function shouldEmit(level, args, opts = {}) {
    const min = opts.minLevel != null ? opts.minLevel : getEffectiveMinLevel();
    if (level < min) return false;

    const productionLike = opts.forceProduction === true
        || (!isLocalhost() && (isProductionHost() || min >= LOG_LEVELS.WARN));

    if (productionLike) {
        // ETAP 40: 0 warningów / 0 błędów widocznych w konsoli produkcyjnej
        return false;
    }

    return true;
}

function emit(level, nativeFn, args) {
    if (consoleCaptureHook && level >= LOG_LEVELS.WARN) {
        try {
            consoleCaptureHook(level, args);
        } catch {
            /* ignore */
        }
    }
    if (!shouldEmit(level, args)) return;
    try {
        nativeFn.apply(console, args);
    } catch {
        /* ignore */
    }
}

/** API dla kodu aplikacji (opcjonalne). */
export const log = {
    debug: (...args) => emit(LOG_LEVELS.DEBUG, console.debug || console.log, args),
    info: (...args) => emit(LOG_LEVELS.INFO, console.info || console.log, args),
    warn: (...args) => emit(LOG_LEVELS.WARN, console.warn, args),
    error: (...args) => emit(LOG_LEVELS.ERROR, console.error, args),
    fatal: (...args) => emit(LOG_LEVELS.FATAL, console.error, ['[FATAL]', ...args])
};

let installed = false;

/**
 * Patch console.* — wywołać raz na starcie app.js.
 * Nie zmienia EventBus / Store / API.
 */
export function installProductionConsole() {
    if (typeof console === 'undefined' || installed) return { ok: false, reason: 'already-or-missing' };
    if (console.__rgLoggerPatched) return { ok: false, reason: 'already' };

    const native = {
        log: console.log.bind(console),
        info: console.info.bind(console),
        debug: (console.debug || console.log).bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console)
    };

    console.log = (...args) => emit(LOG_LEVELS.INFO, native.log, args);
    console.info = (...args) => emit(LOG_LEVELS.INFO, native.info, args);
    console.debug = (...args) => emit(LOG_LEVELS.DEBUG, native.debug, args);
    console.warn = (...args) => emit(LOG_LEVELS.WARN, native.warn, args);
    console.error = (...args) => {
        const text = argsToText(args);
        const level = /\[FATAL\]/i.test(text) ? LOG_LEVELS.FATAL : LOG_LEVELS.ERROR;
        emit(level, native.error, args);
    };

    console.__rgLoggerPatched = true;
    installed = true;

    const min = getEffectiveMinLevel();
    const env = isLocalhost() ? 'DEV' : isProductionHost() ? 'PRODUCTION' : 'PREVIEW';

    if (typeof window !== 'undefined') {
        window.__RG_LOG__ = {
            levels: LOG_LEVELS,
            getMinLevel: getEffectiveMinLevel,
            setMinLevel: (name) => {
                if (!isLocalhost()) return false;
                const n = parseLevel(name);
                if (n == null) return false;
                try {
                    localStorage.setItem(STORAGE_LEVEL, LEVEL_NAMES[n] || name);
                } catch {
                    /* ignore */
                }
                return true;
            },
            shouldEmit,
            isDevDiagnosticMessage,
            env,
            policy: {
                devDefault: 'DEBUG',
                productionDefault: 'SILENT',
                productionConsole: '0 warn / 0 error (ETAP 40)',
                autoApply: false
            }
        };
    }

    // Samoogłoszenie tylko na localhost
    if (isLocalhost()) {
        native.info(
            `[Logger] ETAP 31A · env=${env} · min=${LEVEL_NAMES[min] || min} · pełne logi DEV`
        );
    }

    return { ok: true, env, minLevel: min };
}

/** Diagnostyka jazdy / GPS mapy — wyłącznie localhost (zero wpływu na produkcję). */
export function logMapDriveDiag(event, data = {}) {
    if (!isLocalhost()) return;
    const payload = { ...data, ts: Date.now() };
    try {
        if (typeof performance !== 'undefined' && performance.memory) {
            payload.heapUsedMB = Math.round(performance.memory.usedJSHeapSize / 1048576);
            payload.heapTotalMB = Math.round(performance.memory.totalJSHeapSize / 1048576);
        }
    } catch {
        /* ignore */
    }
    console.info('[MapDriveDiag]', event, payload);
}

export default {
    LOG_LEVELS,
    log,
    installProductionConsole,
    setConsoleCaptureHook,
    shouldEmit,
    getEffectiveMinLevel,
    isLocalhost,
    isProductionHost,
    logMapDriveDiag
};
