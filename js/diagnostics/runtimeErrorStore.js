/**
 * ETAP 42E — Runtime Error Feed · magazyn (ring buffer, max 100).
 * Lokalnie · bez sieci · współdzielony przez collector + UI.
 */

import { APP_VERSION } from '../config.js';

export const STORE_KEY = 'rg_runtime_error_feed_v1';
export const MAX_ERRORS = 100;

/** @typedef {'js'|'promise'|'fetch'|'http-404'|'http-500'|'image'|'service-worker'|'cache'|'manifest'|'storage'|'memory'|'network'} ErrorCategory */

export const ERROR_CATEGORIES = [
    { id: 'js', label: 'JavaScript Errors' },
    { id: 'promise', label: 'Promise Errors' },
    { id: 'fetch', label: 'Fetch Errors' },
    { id: 'http-404', label: '404' },
    { id: 'http-500', label: '500' },
    { id: 'image', label: 'Image Errors' },
    { id: 'service-worker', label: 'Service Worker' },
    { id: 'cache', label: 'Cache' },
    { id: 'manifest', label: 'Manifest' },
    { id: 'storage', label: 'Storage' },
    { id: 'memory', label: 'Memory' },
    { id: 'network', label: 'Network' }
];

const MAX_MSG = 2000;
const MAX_STACK = 6000;
const MAX_URL = 500;

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

function memorySnapshot() {
    try {
        const mem = performance?.memory;
        if (!mem) return null;
        return {
            usedMb: Math.round((mem.usedJSHeapSize || 0) / (1024 * 1024)),
            totalMb: Math.round((mem.totalJSHeapSize || 0) / (1024 * 1024)),
            limitMb: Math.round((mem.jsHeapSizeLimit || 0) / (1024 * 1024))
        };
    } catch {
        return null;
    }
}

function loadList() {
    try {
        const raw = localStorage.getItem(STORE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function persistList(list) {
    try {
        localStorage.setItem(STORE_KEY, JSON.stringify(list));
        return true;
    } catch {
        try {
            localStorage.setItem(STORE_KEY, JSON.stringify(list.slice(-Math.max(10, Math.floor(MAX_ERRORS / 3)))));
            return true;
        } catch {
            return false;
        }
    }
}

/**
 * @param {string} kind
 * @param {number} [status]
 * @returns {ErrorCategory}
 */
export function categoryFromHttp(status, kind = 'fetch') {
    if (status === 404) return 'http-404';
    if (status >= 500) return 'http-500';
    return kind === 'fetch' ? 'fetch' : 'network';
}

/**
 * Map Console Guardian kind → feed category.
 * @param {string} kind
 */
export function categoryFromGuardianKind(kind) {
    const k = String(kind || '');
    if (k === 'unhandledrejection') return 'promise';
    if (k === 'window-error' || k === 'console-error' || k === 'console-warn') return 'js';
    if (k.startsWith('fetch') || k === 'http') return 'fetch';
    if (k === 'image') return 'image';
    if (k.includes('sw') || k.includes('service-worker')) return 'service-worker';
    return 'js';
}

/**
 * @param {{
 *   category?: ErrorCategory,
 *   message?: string,
 *   stack?: string,
 *   level?: string,
 *   source?: string,
 *   url?: string,
 *   status?: number,
 *   extra?: object
 * }} payload
 */
export function saveRuntimeError(payload = {}) {
    const category = payload.category || 'js';
    const entry = {
        id: `re-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        at: nowIso(),
        category,
        level: payload.level || 'error',
        message: safeStr(payload.message || 'unknown'),
        stack: safeStr(payload.stack || '', MAX_STACK),
        source: safeStr(payload.source || '', 400),
        url: safeStr(payload.url || (typeof location !== 'undefined' ? location.href : ''), MAX_URL),
        status: payload.status ?? null,
        online: typeof navigator !== 'undefined' ? navigator.onLine : null,
        appVersion: APP_VERSION,
        memory: memorySnapshot(),
        extra: payload.extra && typeof payload.extra === 'object' ? payload.extra : undefined,
        transport: 'local-only'
    };

    const list = loadList();

    if (payload.extra?.guardianId) {
        const existing = list.find((e) => e.extra?.guardianId === payload.extra.guardianId);
        if (existing) return existing;
    }

    const dup = list.find((e) =>
        e.category === entry.category
        && e.message === entry.message
        && e.source === entry.source
        && Date.now() - Date.parse(e.at) < 3000
    );
    if (dup) return dup;

    list.unshift(entry);
    while (list.length > MAX_ERRORS) list.pop();
    persistList(list);

    try {
        window.dispatchEvent(new CustomEvent('rg:runtime-error', { detail: entry }));
    } catch {
        /* ignore */
    }

    return entry;
}

export function getRuntimeErrors() {
    return loadList();
}

export function clearRuntimeErrors() {
    try {
        localStorage.removeItem(STORE_KEY);
    } catch {
        /* ignore */
    }
    return true;
}

export function countRuntimeErrors(category = null) {
    const list = loadList();
    if (!category) return list.length;
    return list.filter((e) => e.category === category).length;
}

export function getCategoryLabel(id) {
    return ERROR_CATEGORIES.find((c) => c.id === id)?.label || id;
}

export default {
    STORE_KEY,
    MAX_ERRORS,
    ERROR_CATEGORIES,
    saveRuntimeError,
    getRuntimeErrors,
    clearRuntimeErrors,
    countRuntimeErrors,
    categoryFromHttp,
    categoryFromGuardianKind,
    getCategoryLabel
};
