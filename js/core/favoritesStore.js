/**
 * Ulubione – jedyne źródło prawdy (localStorage, per gość / konto).
 * Widoki i rekomendacje czytają wyłącznie stąd.
 */

import { getCurrentUser } from '../auth/auth.js';

const STORAGE_KEY = 'regionalny_smak_favorites';
const LEGACY_PREFIXES = ['rg_favorites', 'rg_favorites_v1'];

function readIds(key) {
    try {
        if (typeof localStorage === 'undefined') return [];
        const raw = localStorage.getItem(key);
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list.map(String) : [];
    } catch {
        return [];
    }
}

function writeIds(key, ids) {
    if (typeof localStorage === 'undefined') return;
    try {
        localStorage.setItem(key, JSON.stringify([...new Set((ids || []).map(String))]));
    } catch {
        /* ignore quota */
    }
}

export function favoritesStorageKey(user = getCurrentUser()) {
    return user?.id ? `${STORAGE_KEY}__${user.id}` : STORAGE_KEY;
}

export function getGuestFavoritesStorageKey() {
    return STORAGE_KEY;
}

/** @returns {string[]} */
export function getFavoriteIds() {
    return readIds(favoritesStorageKey());
}

export function isFavorite(id) {
    return getFavoriteIds().includes(String(id));
}

/**
 * @param {string[]} ids
 */
export function setFavoriteIdsRaw(ids) {
    writeIds(favoritesStorageKey(), ids);
}

/**
 * @param {string} id
 * @returns {string[]} zaktualizowana lista
 */
export function addFavoriteId(id) {
    const sid = String(id);
    const ids = getFavoriteIds();
    if (ids.includes(sid)) return ids;
    const next = [...ids, sid];
    setFavoriteIdsRaw(next);
    return next;
}

/**
 * @param {string} id
 * @returns {string[]} zaktualizowana lista
 */
export function removeFavoriteId(id) {
    const next = getFavoriteIds().filter((fid) => fid !== String(id));
    setFavoriteIdsRaw(next);
    return next;
}

/**
 * @param {string} key
 * @returns {string[]}
 */
export function readFavoriteIdsForKey(key) {
    return readIds(key);
}

/**
 * @param {string} key
 * @param {string[]} ids
 */
export function writeFavoriteIdsForKey(key, ids) {
    writeIds(key, ids);
}

function isLegacyFavoriteKey(key) {
    if (LEGACY_PREFIXES.some((p) => key === p || key.startsWith(`${p}__`))) return true;
    return false;
}

/** Wszystkie klucze LS związane z ulubionymi (kanoniczne + legacy). */
export function collectFavoriteStorageKeys() {
    if (typeof localStorage === 'undefined') return [];
    return Object.keys(localStorage).filter((key) =>
        key === STORAGE_KEY
        || key.startsWith(`${STORAGE_KEY}__`)
        || isLegacyFavoriteKey(key)
    );
}

/**
 * Przy starcie: scal legacy (`rg_favorites*`) do kanonicznego klucza bieżącego użytkownika/gościa.
 * @returns {{ count: number, merged: number, removedKeys: string[] }}
 */
export function syncFavoritesOnStartup() {
    if (typeof localStorage === 'undefined') {
        return { count: 0, merged: 0, removedKeys: [] };
    }

    const user = getCurrentUser();
    const canonicalKey = favoritesStorageKey(user);
    const mergedSet = new Set(readIds(canonicalKey));
    const before = mergedSet.size;

    for (const key of collectFavoriteStorageKeys()) {
        if (key === canonicalKey) continue;
        for (const id of readIds(key)) {
            mergedSet.add(String(id));
        }
    }

    const merged = [...mergedSet];
    if (merged.length !== before || merged.some((id, i) => readIds(canonicalKey)[i] !== id)) {
        writeIds(canonicalKey, merged);
    }

    const removedKeys = [];
    for (const key of collectFavoriteStorageKeys()) {
        if (key === canonicalKey) continue;
        if (isLegacyFavoriteKey(key)) {
            try {
                localStorage.removeItem(key);
                removedKeys.push(key);
            } catch {
                /* ignore */
            }
            continue;
        }
        // Zduplikowany klucz innego konta — tylko po scaleniu ID
        if (user?.id && key.startsWith(`${STORAGE_KEY}__`) && key !== canonicalKey) {
            try {
                localStorage.removeItem(key);
                removedKeys.push(key);
            } catch {
                /* ignore */
            }
        }
    }

    return {
        count: merged.length,
        merged: Math.max(0, merged.length - before),
        removedKeys
    };
}

export { STORAGE_KEY as FAVORITES_STORAGE_KEY_BASE };
