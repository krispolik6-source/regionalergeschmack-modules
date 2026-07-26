/**
 * Producenci otwarci teraz.
 */

import { getProducerOpenStatus } from '../../data/openingHours.js';
import { LIST_LIMIT } from '../config.js';
import { scoreProducerAffinity } from '../personalize.js';
import { resolvePool } from './pool.js';

/**
 * @param {object} [ctx]
 * @returns {{
 *   kind: 'openNow',
 *   producerIds: string[],
 *   score: number
 * }}
 */
export function getOpenNow(ctx = {}) {
    const { pool, user } = resolvePool(ctx);
    const now = ctx.now || new Date();

    const open = [];
    for (const p of pool) {
        const status = getProducerOpenStatus(p, now);
        if (status?.known && status.isOpen) {
            open.push({
                id: String(p.id),
                score: scoreProducerAffinity(p, {
                    user,
                    favoriteIds: ctx.favoriteIds,
                    recentlyViewedIds: ctx.recentlyViewedIds,
                    favoriteCategories: ctx.favoriteCategories
                })
            });
        }
    }

    open.sort((a, b) => b.score - a.score);
    const producerIds = open.slice(0, LIST_LIMIT).map((x) => x.id);

    return {
        kind: 'openNow',
        producerIds,
        score: producerIds.length ? 55 + Math.min(20, producerIds.length * 2) : 0
    };
}
