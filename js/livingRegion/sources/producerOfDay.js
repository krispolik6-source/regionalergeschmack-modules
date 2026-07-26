/**
 * Producent dnia — jeden wybór na dayKey.
 */

import { dayKey } from '../cache.js';
import { scoreProducerAffinity, dayJitter } from '../personalize.js';
import { resolvePool } from './pool.js';

/**
 * @param {object} [ctx]
 * @returns {{ kind: 'producerOfDay', producerId: string, score: number } | null}
 */
export function getProducerOfDay(ctx = {}) {
    const { pool, user } = resolvePool(ctx);
    if (!pool.length) return null;

    const dk = ctx.dayKey || dayKey(ctx.now || new Date());
    const fav = ctx.favoriteIds;
    const recent = ctx.recentlyViewedIds;
    const favCats = ctx.favoriteCategories;

    let best = null;
    let bestScore = -Infinity;

    for (const p of pool) {
        const base = scoreProducerAffinity(p, {
            user,
            favoriteIds: fav,
            recentlyViewedIds: recent,
            favoriteCategories: favCats
        });
        const score = base + dayJitter(dk, String(p.id)) * 4;
        if (score > bestScore) {
            bestScore = score;
            best = p;
        }
    }

    if (!best) return null;
    return {
        kind: 'producerOfDay',
        producerId: String(best.id),
        score: Math.round(bestScore * 10) / 10
    };
}
