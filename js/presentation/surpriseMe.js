/**
 * Zaskocz mnie — dyskretny wybór producenta w okolicy.
 * Preferencje: learning + ulubione + lekka losowość. Bez komunikatów „AI”.
 */

import { getProducers } from '../data/dataService.js';
import { getProducersInRadius } from '../data/producerHelpers.js';
import { getLastPosition } from '../core/userLocation.js';
import { getLearningBoostForProducer } from './learningEngine.js';
import { getFavoriteIds } from '../core/favoritesStore.js';

const RECENT_KEY = 'rg_surprise_recent_v1';
const RECENT_MAX = 8;

function readRecent() {
    try {
        const raw = localStorage.getItem(RECENT_KEY);
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list.map(String) : [];
    } catch {
        return [];
    }
}

function pushRecent(id) {
    const list = [String(id), ...readRecent().filter((x) => x !== String(id))].slice(0, RECENT_MAX);
    try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    } catch {
        /* ignore */
    }
}

/**
 * @param {{ radiusKm?: number }} [opts]
 * @returns {{ producer: object, reason: 'nearby' | 'favorite' | 'taste' | 'fresh' } | null}
 */
export function pickSurpriseProducer(opts = {}) {
    const radiusKm = Number(opts.radiusKm) > 0 ? Number(opts.radiusKm) : 15;
    const user = getLastPosition();
    let pool;
    if (Array.isArray(opts.pool)) {
        pool = opts.pool.filter((p) => p && p.id && p.category !== 'other');
    } else {
        pool = (getProducers() || []).filter((p) => p && p.id && p.category !== 'other');
        if (user?.lat && user?.lng) {
            const near = getProducersInRadius(pool, radiusKm, user);
            if (near.length) pool = near;
            else {
                const wider = getProducersInRadius(pool, Math.max(radiusKm, 40), user);
                if (wider.length) pool = wider;
            }
        }
    }
    if (!pool.length) return null;

    const favorites = new Set(getFavoriteIds().map(String));
    const recent = new Set(readRecent());

    const scored = pool.map((p) => {
        const id = String(p.id);
        let score = 4 + Math.random() * 6;
        score += getLearningBoostForProducer(p);
        if (favorites.has(id)) score += 10;
        if (p.isPromoted || p.promoted || p.promo) score += 4;
        if (recent.has(id)) score *= 0.35;
        // lekka preferencja bliższych
        if (typeof p.distanceKm === 'number') {
            score += Math.max(0, 6 - p.distanceKm * 0.35);
        }
        return { producer: p, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, Math.min(12, scored.length));
    const total = top.reduce((s, x) => s + Math.max(0.1, x.score), 0);
    let r = Math.random() * total;
    let pick = top[0];
    for (const row of top) {
        r -= Math.max(0.1, row.score);
        if (r <= 0) {
            pick = row;
            break;
        }
    }

    const id = String(pick.producer.id);
    pushRecent(id);

    let reason = 'nearby';
    if (favorites.has(id)) reason = 'favorite';
    else if (getLearningBoostForProducer(pick.producer) >= 8) reason = 'taste';
    else if (pick.producer.promo || pick.producer.isPromoted) reason = 'fresh';

    return { producer: pick.producer, reason };
}

/**
 * @param {{ producer: object, reason: string }} result
 * @param {(key: string) => string} t
 */
export function formatSurpriseMessage(result, t) {
    if (!result?.producer) return t('home.surpriseNone');
    const name = String(result.producer.name || '').trim() || t('home.surpriseFallbackName');
    const key =
        result.reason === 'favorite'
            ? 'home.surpriseFavorite'
            : result.reason === 'taste'
              ? 'home.surpriseTaste'
              : result.reason === 'fresh'
                ? 'home.surpriseFresh'
                : 'home.surpriseNearby';
    return t(key).replace('{name}', name);
}
