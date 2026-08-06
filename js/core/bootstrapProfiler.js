/**
 * ETAP 42F — Bootstrap Profiler
 * Mierzy czas uruchamienia i zasoby bootstrap (prod shell).
 * Raport: localStorage · __RG_BOOTSTRAP__ · docs/bootstrap (CLI).
 */

const STORE_KEY = 'rg_bootstrap_profile_v1';
const MAX_INIT_LOG = 120;

/** @type {ReturnType<typeof createSnapshot> | null} */
let active = null;
/** @type {object | null} */
let finalReport = null;

const moduleLoadAt = typeof performance !== 'undefined' ? performance.now() : 0;

function createSnapshot(label = 'snapshot') {
    return {
        label,
        at: performance.now(),
        inits: 0,
        initNames: [],
        listeners: 0,
        listenerSamples: [],
        fetches: 0,
        fetchSamples: [],
        timers: 0,
        timerSamples: [],
        observers: 0,
        observerSamples: [],
        globalHooks: 0,
        globalHookSamples: []
    };
}

function safeUrl(input) {
    try {
        if (typeof input === 'string') return input.slice(0, 120);
        return String(input?.url || input).slice(0, 120);
    } catch {
        return 'unknown';
    }
}

function isGlobalHookName(name) {
    return /^__(RG_|patch|wrapped|original)/i.test(name)
        || /^(fetch|console\.(log|warn|error))$/i.test(name);
}

function installPatches(snap) {
    const targets = [];

    const wrapAdd = (proto, label) => {
        if (!proto || proto.__rgBootstrapPatched) return;
        const original = proto.addEventListener;
        if (typeof original !== 'function') return;
        proto.__rgBootstrapPatched = true;
        proto.addEventListener = function patchedAdd(type, listener, options) {
            if (active === snap) {
                snap.listeners += 1;
                if (snap.listenerSamples.length < 40) {
                    snap.listenerSamples.push(`${label}:${String(type).slice(0, 40)}`);
                }
            }
            return original.call(this, type, listener, options);
        };
        targets.push({ proto, original, kind: 'addEventListener' });
    };

    wrapAdd(window?.EventTarget?.prototype, 'EventTarget');
    wrapAdd(window, 'window');

    const origSetTimeout = window.setTimeout;
    const origSetInterval = window.setInterval;
    window.setTimeout = function patchedTimeout(fn, delay, ...args) {
        if (active === snap) {
            snap.timers += 1;
            if (snap.timerSamples.length < 30) snap.timerSamples.push(`timeout:${delay ?? 0}`);
        }
        return origSetTimeout.call(window, fn, delay, ...args);
    };
    window.setInterval = function patchedInterval(fn, delay, ...args) {
        if (active === snap) {
            snap.timers += 1;
            if (snap.timerSamples.length < 30) snap.timerSamples.push(`interval:${delay ?? 0}`);
        }
        return origSetInterval.call(window, fn, delay, ...args);
    };

    const origFetch = window.fetch?.bind(window);
    if (origFetch) {
        window.fetch = function patchedFetch(input, init) {
            if (active === snap) {
                snap.fetches += 1;
                if (snap.fetchSamples.length < 30) snap.fetchSamples.push(safeUrl(input));
            }
            return origFetch(input, init);
        };
        snap.globalHooks += 1;
        snap.globalHookSamples.push('window.fetch');
    }

    const observerCtors = [
        ['PerformanceObserver', 'PerformanceObserver'],
        ['MutationObserver', 'MutationObserver'],
        ['IntersectionObserver', 'IntersectionObserver'],
        ['ResizeObserver', 'ResizeObserver']
    ];
    for (const [name, label] of observerCtors) {
        const Ctor = window[name];
        if (typeof Ctor !== 'function' || Ctor.__rgBootstrapPatched) continue;
        const Wrapped = function (...args) {
            if (active === snap) {
                snap.observers += 1;
                if (snap.observerSamples.length < 20) snap.observerSamples.push(label);
            }
            return new Ctor(...args);
        };
        Wrapped.__rgBootstrapPatched = true;
        Wrapped.prototype = Ctor.prototype;
        window[name] = Wrapped;
        snap.globalHooks += 1;
        snap.globalHookSamples.push(`window.${name}`);
    }

    const origDefine = Object.defineProperty;
    // eslint-disable-next-line no-extend-native
    Object.defineProperty = function patchedDefine(obj, prop, desc) {
        if (active === snap && obj === window && typeof prop === 'string' && isGlobalHookName(prop)) {
            snap.globalHooks += 1;
            if (snap.globalHookSamples.length < 30) snap.globalHookSamples.push(`window.${prop}`);
        }
        return origDefine.call(Object, obj, prop, desc);
    };

    return () => {
        window.setTimeout = origSetTimeout;
        window.setInterval = origSetInterval;
        if (origFetch) window.fetch = origFetch;
        Object.defineProperty = origDefine;
    };
}

/**
 * Rejestruj init() wykryty w bootstrap.
 * @param {string} name
 */
export function recordBootstrapInit(name) {
    const snap = active || finalReport?.productionBootstrap;
    if (!snap) return;
    snap.inits += 1;
    if (snap.initNames.length < MAX_INIT_LOG) {
        snap.initNames.push(String(name || 'init'));
    }
}

/**
 * Start profilowania (przed initConsoleGuardian / bootstrap).
 */
export function startBootstrapProfile() {
    if (typeof window === 'undefined') return null;
    const snap = createSnapshot('production-bootstrap');
    const uninstall = installPatches(snap);
    active = snap;
    snap._uninstall = uninstall;
    snap.moduleLoadMs = moduleLoadAt;
    snap.startedAt = performance.now();
    return snap;
}

function summarizeSnapshot(snap) {
    if (!snap) return null;
    return {
        label: snap.label,
        durationMs: snap.startedAt != null ? Math.round((snap.at - snap.startedAt) * 100) / 100 : null,
        inits: snap.inits,
        initNames: snap.initNames.slice(0, 40),
        listeners: snap.listeners,
        listenerSamples: snap.listenerSamples.slice(0, 20),
        fetches: snap.fetches,
        fetchSamples: snap.fetchSamples.slice(0, 15),
        timers: snap.timers,
        timerSamples: snap.timerSamples.slice(0, 15),
        observers: snap.observers,
        observerSamples: snap.observerSamples.slice(0, 15),
        globalHooks: snap.globalHooks,
        globalHookSamples: snap.globalHookSamples.slice(0, 20)
    };
}

/**
 * @param {{ phase?: string, prebootMs?: number }} [meta]
 */
export function finishBootstrapProfile(meta = {}) {
    if (!active) return null;
    active.at = performance.now();
    if (typeof active._uninstall === 'function') {
        try { active._uninstall(); } catch { /* ignore */ }
    }
    const summary = summarizeSnapshot(active);
    finalReport = {
        generatedAt: new Date().toISOString(),
        moduleLoadMs: Math.round(moduleLoadAt * 100) / 100,
        prebootMs: meta.prebootMs ?? null,
        productionBootstrap: summary,
        timings: {
            moduleLoadMs: Math.round(moduleLoadAt * 100) / 100,
            prebootMs: meta.prebootMs ?? null,
            bootstrapMs: summary?.durationMs ?? null,
            totalToInteractiveMs: meta.prebootMs != null && summary?.durationMs != null
                ? Math.round((meta.prebootMs + summary.durationMs) * 100) / 100
                : null
        },
        policy: { localOnly: true, autoFix: false }
    };
    active = null;

    try {
        localStorage.setItem(STORE_KEY, JSON.stringify(finalReport));
    } catch {
        /* ignore */
    }

    try {
        window.dispatchEvent(new CustomEvent('rg:bootstrap-profile', { detail: finalReport }));
    } catch {
        /* ignore */
    }

    window.__RG_BOOTSTRAP__ = {
        report: () => finalReport,
        refresh: () => finalReport,
        storeKey: STORE_KEY,
        recordInit: recordBootstrapInit
    };

    return finalReport;
}

/**
 * Profil lazy-load diagnostyki (orchestrator).
 * @param {() => Promise<void>} loader
 */
export async function profileLazyDiagnosticsLoad(loader) {
    const snap = createSnapshot('lazy-diagnostics');
    const uninstall = installPatches(snap);
    active = snap;
    snap.startedAt = performance.now();
    try {
        await loader();
    } finally {
        snap.at = performance.now();
        uninstall();
        active = null;
    }
    const summary = summarizeSnapshot(snap);
    if (finalReport) {
        finalReport.lazyDiagnostics = summary;
        finalReport.timings = finalReport.timings || {};
        finalReport.timings.lazyDiagnosticsMs = summary.durationMs;
        try {
            localStorage.setItem(STORE_KEY, JSON.stringify(finalReport));
        } catch {
            /* ignore */
        }
    }
    return summary;
}

export function getBootstrapProfile() {
    if (finalReport) return finalReport;
    try {
        const raw = localStorage.getItem(STORE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export default {
    startBootstrapProfile,
    finishBootstrapProfile,
    recordBootstrapInit,
    profileLazyDiagnosticsLoad,
    getBootstrapProfile
};
