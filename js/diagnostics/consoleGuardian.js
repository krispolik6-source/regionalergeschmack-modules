/**
 * ETAP 40 — Console Guardian
 *
 * Produkcja: 0 błędów i 0 warningów w konsoli (cisza).
 * Wyjątki / warn / error → lokalny raport (LS), bez wysyłki do Internetu.
 *
 * Raport: stack · urządzenie · przeglądarka · wersja PWA · ostatnia akcja.
 */

import { APP_VERSION } from '../config.js';
import {
    isLocalhost,
    isProductionHost,
    LOG_LEVELS,
    setConsoleCaptureHook
} from '../core/logger.js';
import { eventBus } from '../core/eventBus.js';
import { EVENTS } from '../core/events.js';

const STORE_KEY = 'rg_console_guardian_v1';
const MAX_REPORTS = 40;
const MAX_STACK = 8000;
const MAX_MSG = 2000;

/** @type {{ type: string, label: string, at: string, detail?: string } | null} */
let lastAction = null;
let bound = false;

function nowIso() {
    return new Date().toISOString();
}

function safeStr(value, max = MAX_MSG) {
    let s = '';
    try {
        if (value instanceof Error) s = value.message || String(value);
        else if (typeof value === 'string') s = value;
        else s = JSON.stringify(value);
    } catch {
        s = String(value);
    }
    if (s.length > max) return `${s.slice(0, max)}…`;
    return s;
}

function detectBrowser(ua) {
    const s = String(ua || '');
    if (/Edg\//i.test(s)) return 'Edge';
    if (/Chrome\//i.test(s) && !/Edg\//i.test(s)) return 'Chrome';
    if (/Firefox\//i.test(s)) return 'Firefox';
    if (/Safari\//i.test(s) && !/Chrome\//i.test(s)) return 'Safari';
    if (/OPR\//i.test(s) || /Opera/i.test(s)) return 'Opera';
    return 'Unknown';
}

function getDeviceInfo() {
    const nav = typeof navigator !== 'undefined' ? navigator : {};
    const scr = typeof screen !== 'undefined' ? screen : {};
    let vv = null;
    try {
        vv = window.visualViewport;
    } catch {
        /* ignore */
    }
    return {
        userAgent: String(nav.userAgent || '').slice(0, 400),
        platform: String(nav.platform || ''),
        language: String(nav.language || ''),
        languages: Array.isArray(nav.languages) ? nav.languages.slice(0, 6) : [],
        cookieEnabled: Boolean(nav.cookieEnabled),
        online: typeof nav.onLine === 'boolean' ? nav.onLine : null,
        deviceMemory: nav.deviceMemory ?? null,
        hardwareConcurrency: nav.hardwareConcurrency ?? null,
        maxTouchPoints: nav.maxTouchPoints ?? null,
        screen: {
            width: scr.width || null,
            height: scr.height || null,
            availWidth: scr.availWidth || null,
            availHeight: scr.availHeight || null,
            pixelRatio: typeof devicePixelRatio === 'number' ? devicePixelRatio : null
        },
        viewport: {
            innerWidth: typeof innerWidth === 'number' ? innerWidth : null,
            innerHeight: typeof innerHeight === 'number' ? innerHeight : null,
            visualWidth: vv?.width ?? null,
            visualHeight: vv?.height ?? null
        }
    };
}

function getBrowserInfo() {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    return {
        name: detectBrowser(ua),
        userAgent: String(ua).slice(0, 400),
        vendor: typeof navigator !== 'undefined' ? String(navigator.vendor || '') : ''
    };
}

/** Wersja PWA z URL SW / manifestu (cache-bust), fallback APP_VERSION. */
export function getPwaVersion() {
    try {
        const sw = document.querySelector('script[src*="sw.js"]');
        // rejestracja jest inline — szukaj w HTML nie zawsze; fallback scriptURL
    } catch {
        /* ignore */
    }
    try {
        const links = document.querySelectorAll('link[href*="manifest"], link[href*="icon"], script[src*="app.js"]');
        for (const el of links) {
            const href = el.getAttribute('href') || el.getAttribute('src') || '';
            const m = href.match(/[?&]v=(\d+)/);
            if (m) return m[1];
        }
    } catch {
        /* ignore */
    }
    try {
        if (typeof navigator !== 'undefined' && navigator.serviceWorker?.controller) {
            const url = navigator.serviceWorker.controller.scriptURL || '';
            const m = url.match(/[?&]v=(\d+)/);
            if (m) return m[1];
        }
    } catch {
        /* ignore */
    }
    return String(APP_VERSION || 'unknown');
}

export function getLastUserAction() {
    return lastAction ? { ...lastAction } : null;
}

/**
 * Zapisz ostatnią akcję użytkownika (lokalnie, w pamięci).
 * @param {string} type
 * @param {string} label
 * @param {string} [detail]
 */
export function recordUserAction(type, label, detail = '') {
    lastAction = {
        type: String(type || 'action'),
        label: String(label || '').slice(0, 200),
        detail: detail ? String(detail).slice(0, 400) : '',
        at: nowIso()
    };
}

function loadReports() {
    try {
        const raw = localStorage.getItem(STORE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function persistReports(list) {
    try {
        localStorage.setItem(STORE_KEY, JSON.stringify(list));
        return true;
    } catch {
        // Quota — zostaw ostatnie połowę
        try {
            const half = list.slice(-Math.max(5, Math.floor(MAX_REPORTS / 2)));
            localStorage.setItem(STORE_KEY, JSON.stringify(half));
            return true;
        } catch {
            return false;
        }
    }
}

/**
 * @param {{
 *   kind?: string,
 *   message?: string,
 *   stack?: string,
 *   level?: string,
 *   source?: string,
 *   extra?: object
 * }} payload
 */
export function saveGuardianReport(payload = {}) {
    const report = {
        id: `cg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        at: nowIso(),
        kind: payload.kind || 'exception',
        level: payload.level || 'error',
        message: safeStr(payload.message || 'unknown'),
        stack: safeStr(payload.stack || '', MAX_STACK),
        source: safeStr(payload.source || '', 500),
        url: typeof location !== 'undefined' ? String(location.href || '').slice(0, 500) : '',
        device: getDeviceInfo(),
        browser: getBrowserInfo(),
        pwaVersion: getPwaVersion(),
        appVersion: APP_VERSION,
        lastAction: getLastUserAction(),
        online: typeof navigator !== 'undefined' ? navigator.onLine : null,
        extra: payload.extra && typeof payload.extra === 'object' ? payload.extra : undefined,
        /** Jawna polityka: brak wysyłki */
        transport: 'local-only'
    };

    const list = loadReports();
    list.push(report);
    while (list.length > MAX_REPORTS) list.shift();
    persistReports(list);

    if (typeof window !== 'undefined') {
        try {
            window.dispatchEvent(new CustomEvent('rg:console-guardian-report', { detail: report }));
        } catch {
            /* ignore */
        }
    }

    return report;
}

export function getGuardianReports() {
    return loadReports();
}

export function clearGuardianReports() {
    try {
        localStorage.removeItem(STORE_KEY);
    } catch {
        /* ignore */
    }
    return true;
}

function stackFromArgs(args) {
    for (const a of args || []) {
        if (a instanceof Error && a.stack) return a.stack;
        if (a && typeof a === 'object' && typeof a.stack === 'string') return a.stack;
    }
    return '';
}

/** Opcjonalne lokalne API raportów — nie raportuj szumu gdy serwer nie działa. */
function isOptionalLocalApiNoise(message = '', stack = '') {
    const blob = `${message}\n${stack}`;
    return /127\.0\.0\.1:3457|localhost:3457/.test(blob)
        && /(Failed to fetch|NetworkError|ERR_CONNECTION|Load failed|api-offline|Network request failed)/i.test(blob);
}

function captureFromConsole(level, args) {
    if (level < LOG_LEVELS.WARN) return;
    const message = (args || []).map((a) => safeStr(a, 500)).join(' ');
    if (isOptionalLocalApiNoise(message, stackFromArgs(args))) return;
    saveGuardianReport({
        kind: level >= LOG_LEVELS.ERROR ? 'console-error' : 'console-warn',
        level: level >= LOG_LEVELS.FATAL ? 'fatal' : level >= LOG_LEVELS.ERROR ? 'error' : 'warn',
        message,
        stack: stackFromArgs(args),
        source: 'console'
    });
}

function describeTarget(el) {
    if (!el || el.nodeType !== 1) return 'document';
    const tag = el.tagName?.toLowerCase() || 'node';
    const id = el.id ? `#${el.id}` : '';
    const cls = el.classList?.[0] ? `.${el.classList[0]}` : '';
    const view = el.closest?.('[data-view]')?.dataset?.view
        || el.closest?.('[data-view-panel]')?.dataset?.viewPanel
        || '';
    const action = el.getAttribute?.('data-side-menu-action')
        || el.getAttribute?.('data-action')
        || '';
    const label = [tag + id + cls, view && `view:${view}`, action && `action:${action}`]
        .filter(Boolean)
        .join(' ');
    return label.slice(0, 180);
}

function bindLastActionTracking() {
    if (typeof document === 'undefined') return;

    document.addEventListener('click', (event) => {
        const t = event.target;
        const el = t?.closest?.('button, a, [role="button"], .nav-item, input, select, textarea, [data-view]') || t;
        recordUserAction('click', describeTarget(el), el?.textContent?.trim?.()?.slice(0, 80) || '');
    }, true);

    document.addEventListener('submit', (event) => {
        recordUserAction('submit', describeTarget(event.target), '');
    }, true);

    window.addEventListener('hashchange', () => {
        recordUserAction('hashchange', location.hash || '#', location.href);
    });

    window.addEventListener('popstate', () => {
        recordUserAction('popstate', location.pathname || '/', location.href);
    });

    try {
        eventBus.on(EVENTS.VIEW_CHANGED, (payload) => {
            const view = payload?.view || '';
            recordUserAction('navigate', view, payload?.previousView ? `from:${payload.previousView}` : '');
        });
        eventBus.on(EVENTS.NAVIGATE, (payload) => {
            const view = typeof payload === 'string' ? payload : payload?.view;
            if (view) recordUserAction('navigate-intent', view, '');
        });
    } catch {
        /* ignore */
    }
}

function bindGlobalHandlers() {
    window.addEventListener('error', (event) => {
        const err = event.error;
        saveGuardianReport({
            kind: 'window-error',
            level: 'error',
            message: err?.message || event.message || 'Script error',
            stack: err?.stack || '',
            source: [event.filename, event.lineno, event.colno].filter((x) => x != null).join(':'),
            extra: { type: event.type }
        });
    });

    window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;
        const message = reason instanceof Error
            ? reason.message
            : safeStr(reason);
        const stack = reason instanceof Error ? reason.stack : '';
        if (isOptionalLocalApiNoise(message, stack)) return;
        saveGuardianReport({
            kind: 'unhandledrejection',
            level: 'error',
            message,
            stack: stack || '',
            source: 'promise'
        });
    });
}

/**
 * Produkcja = cisza konsoli (0 warn / 0 error widocznych).
 * Lokalnie: logi jak dotychczas + zapis raportów.
 */
export function initConsoleGuardian() {
    if (bound || typeof window === 'undefined') {
        return { ok: false, reason: 'already-or-ssr' };
    }
    bound = true;

    setConsoleCaptureHook(captureFromConsole);
    bindLastActionTracking();
    bindGlobalHandlers();
    recordUserAction('boot', 'app-start', location.href);

    const productionSilent = !isLocalhost() && (isProductionHost() || !isLocalhost());

    window.__RG_CONSOLE_GUARDIAN__ = {
        reports: getGuardianReports,
        clear: clearGuardianReports,
        lastAction: getLastUserAction,
        recordAction: recordUserAction,
        capture: (msg, err) => saveGuardianReport({
            kind: 'manual',
            level: 'error',
            message: msg,
            stack: err?.stack || '',
            source: 'manual'
        }),
        pwaVersion: getPwaVersion,
        policy: {
            productionSilent: true,
            zeroConsoleNoiseOnProduction: true,
            localOnly: true,
            noNetwork: true,
            maxReports: MAX_REPORTS,
            storeKey: STORE_KEY
        },
        env: isLocalhost() ? 'DEV' : isProductionHost() ? 'PRODUCTION' : 'PREVIEW'
    };

    if (isLocalhost()) {
        console.info(
            '[ConsoleGuardian] ETAP 40 · local-only reports · production=silent warn/error · __RG_CONSOLE_GUARDIAN__.reports()'
        );
    }

    return {
        ok: true,
        productionSilent,
        env: window.__RG_CONSOLE_GUARDIAN__.env
    };
}

export default {
    initConsoleGuardian,
    saveGuardianReport,
    getGuardianReports,
    clearGuardianReports,
    recordUserAction,
    getLastUserAction,
    getPwaVersion
};
