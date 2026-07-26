/**
 * Miękkie wagi rankingu (bez agresywnego profilowania).
 */

import { getDistanceKm } from '../data/producerHelpers.js';
import { getLearningBoostForProducer } from '../presentation/learningEngine.js';

/**
 * @param {object} producer
 * @param {{
 *   user?: { lat?: number, lng?: number } | null,
 *   favoriteIds?: Set<string> | string[],
 *   recentlyViewedIds?: Set<string> | string[],
 *   favoriteCategories?: Set<string> | string[]
 * }} ctx
 */
export function scoreProducerAffinity(producer, ctx = {}) {
    if (!producer?.id) return 0;
    const id = String(producer.id);
    let score = 0;

    const fav = ctx.favoriteIds instanceof Set
        ? ctx.favoriteIds
        : new Set((ctx.favoriteIds || []).map(String));
    if (fav.has(id)) score += 12;

    const recent = ctx.recentlyViewedIds instanceof Set
        ? ctx.recentlyViewedIds
        : new Set((ctx.recentlyViewedIds || []).map(String));
    if (recent.has(id)) score += 8;

    const cat = String(producer.category || producer.type || '').toLowerCase();
    const favCats = ctx.favoriteCategories instanceof Set
        ? ctx.favoriteCategories
        : new Set((ctx.favoriteCategories || []).map((c) => String(c).toLowerCase()));
    if (cat && favCats.has(cat)) score += 6;

    const user = ctx.user;
    if (user?.lat != null && user?.lng != null && producer.lat != null && producer.lng != null) {
        const km = getDistanceKm(user.lat, user.lng, producer.lat, producer.lng);
        if (Number.isFinite(km)) {
            score += Math.max(0, 10 - km * 0.45);
        }
    }

    try {
        score += Math.min(14, getLearningBoostForProducer(producer) * 0.5);
    } catch {
        /* learning opcjonalny */
    }

    return score;
}

/**
 * Stabilny „los dnia” z dayKey + id.
 * @param {string} dayKey
 * @param {string} id
 */
export function dayJitter(dayKey, id) {
    const seed = `${dayKey}:${id}`;
    let h = 2166136261;
    for (let i = 0; i < seed.length; i += 1) {
        h ^= seed.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return (h >>> 0) % 1000 / 1000;
}
