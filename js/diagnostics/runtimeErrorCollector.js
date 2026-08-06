/**
 * ETAP 42E — lekki kolektor błędów runtime (boot, bez UI).
 * Uruchamiany z Console Guardian — produkcja: tylko zapis lokalny.
 */

import {
    saveRuntimeError,
    categoryFromHttp,
    categoryFromGuardianKind
} from './runtimeErrorStore.js';

const GUARDIAN_STORE = 'rg_console_guardian_v1';

let bound = false;
/** @type {typeof fetch | null} */
let nativeFetch = null;

function isOptionalLocalApiNoise(message = '', url = '') {
    const blob = `${message}\n${url}`;
    return /127\.0\.0\.1:3457|localhost:3457/.test(blob)
        && /(Failed to fetch|NetworkError|ERR_CONNECTION|Load failed|api-offline|Network request failed)/i.test(blob);
}

function ingestGuardianReports() {
    try {
        const raw = localStorage.getItem(GUARDIAN_STORE);
        const parsed = raw ? JSON.parse(raw) : [];
        const list = Array.isArray(parsed) ? parsed : [];
        for (const r of list) {
            saveRuntimeError({
                category: categoryFromGuardianKind(r.kind),
                message: r.message,
                stack: r.stack,
                level: r.level,
                source: r.source || r.kind,
                url: r.url,
                extra: { guardianId: r.id, kind: r.kind, imported: true }
            });
        }
    } catch {
        /* ignore */
    }
}

function bindImageErrors() {
    document.addEventListener('error', (event) => {
        const t = event.target;
        if (!t || t.tagName !== 'IMG') return;
        const src = String(t.currentSrc || t.src || '').slice(0, 400);
        saveRuntimeError({
            category: 'image',
            message: `Image failed: ${src}`,
            source: src,
            url: src,
            extra: { tag: 'IMG' }
        });
    }, true);
}

function bindNetworkEvents() {
    window.addEventListener('offline', () => {
        saveRuntimeError({
            category: 'network',
            level: 'warn',
            message: 'Network offline',
            source: 'navigator.onLine'
        });
    });

    window.addEventListener('online', () => {
        saveRuntimeError({
            category: 'network',
            level: 'info',
            message: 'Network online',
            source: 'navigator.onLine'
        });
    });
}

function bindFetchPatch() {
    if (typeof window.fetch !== 'function' || nativeFetch) return;
    nativeFetch = window.fetch.bind(window);

    window.fetch = async function patchedFetch(input, init) {
        const url = typeof input === 'string' ? input : input?.url || String(input);
        const method = (init?.method || 'GET').toUpperCase();
        try {
            const res = await nativeFetch(input, init);
            if (!res.ok) {
                const status = res.status;
                if (!isOptionalLocalApiNoise('', url)) {
                    saveRuntimeError({
                        category: categoryFromHttp(status),
                        message: `HTTP ${status} ${method} ${url}`,
                        source: url,
                        url,
                        status,
                        extra: { method, ok: false }
                    });
                }
            }
            return res;
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (!isOptionalLocalApiNoise(msg, url)) {
                saveRuntimeError({
                    category: 'network',
                    message: `Fetch failed: ${method} ${url} — ${msg}`,
                    stack: err instanceof Error ? err.stack : '',
                    source: url,
                    url,
                    extra: { method, failed: true }
                });
            }
            throw err;
        }
    };
}

function bindServiceWorkerEvents() {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('messageerror', (event) => {
        saveRuntimeError({
            category: 'service-worker',
            message: 'Service Worker messageerror',
            source: 'serviceWorker',
            extra: { data: String(event?.data ?? '').slice(0, 200) }
        });
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
        const ctrl = navigator.serviceWorker.controller;
        saveRuntimeError({
            category: 'service-worker',
            level: 'info',
            message: ctrl ? `SW controller: ${String(ctrl.scriptURL || '').slice(-80)}` : 'SW controller cleared',
            source: 'controllerchange'
        });
    });

    void navigator.serviceWorker.getRegistration().then((reg) => {
        if (!reg) return;
        reg.addEventListener('updatefound', () => {
            saveRuntimeError({
                category: 'service-worker',
                level: 'info',
                message: 'Service Worker update found',
                source: 'updatefound'
            });
        });
    }).catch((err) => {
        saveRuntimeError({
            category: 'service-worker',
            message: `SW registration error: ${err?.message || err}`,
            stack: err?.stack || '',
            source: 'getRegistration'
        });
    });
}

function bindGuardianBridge() {
    window.addEventListener('rg:console-guardian-report', (event) => {
        const r = event?.detail;
        if (!r) return;
        saveRuntimeError({
            category: categoryFromGuardianKind(r.kind),
            message: r.message,
            stack: r.stack,
            level: r.level,
            source: r.source || r.kind,
            url: r.url,
            extra: { guardianId: r.id, kind: r.kind }
        });
    });
}

/**
 * Lekki kolektor — wywołany raz przy starcie (z Console Guardian).
 */
export function initRuntimeErrorCollector() {
    if (bound || typeof window === 'undefined') {
        return { ok: false, reason: 'already-or-ssr' };
    }
    bound = true;

    bindImageErrors();
    bindNetworkEvents();
    bindFetchPatch();
    bindServiceWorkerEvents();
    bindGuardianBridge();
    ingestGuardianReports();

    window.__RG_ERROR_COLLECTOR__ = {
        ready: true,
        policy: { localOnly: true, maxErrors: 100 }
    };

    return { ok: true };
}

export default { initRuntimeErrorCollector };
