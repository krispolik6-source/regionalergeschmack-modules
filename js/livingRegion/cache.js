/**
 * Cache dzienny highlights (localStorage).
 */

import { CACHE_KEY } from './config.js';

/**
 * @param {Date} [now]
 */
export function dayKey(now = new Date()) {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * @param {string[]} producerIds
 * @param {number} [radiusKm]
 */
export function dataFingerprint(producerIds = [], radiusKm = 0) {
    const ids = [...producerIds].map(String).sort();
    let h = 2166136261;
    const seed = `${ids.length}|${radiusKm}|${ids.slice(0, 40).join(',')}`;
    for (let i = 0; i < seed.length; i += 1) {
        h ^= seed.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36);
}

export function readDayCache() {
    try {
        if (typeof localStorage === 'undefined') return null;
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data || typeof data.dayKey !== 'string' || !Array.isArray(data.items)) return null;
        return data;
    } catch {
        return null;
    }
}

/**
 * @param {object} payload
 */
export function writeDayCache(payload) {
    try {
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch {
        /* ignore */
    }
}

export function clearDayCache() {
    try {
        if (typeof localStorage !== 'undefined') localStorage.removeItem(CACHE_KEY);
    } catch {
        /* ignore */
    }
}
