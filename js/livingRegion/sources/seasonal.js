/**
 * Produkty sezonowe — z katalogu sezonu + dopasowanie do lokalnych produktów.
 */

import { getCurrentSeason, getSeasonalDemoItems, isSeasonalProduct } from '../../data/seasonCalendar.js';
import { LIST_LIMIT } from '../config.js';
import { resolvePool } from './pool.js';

/**
 * @param {object} [ctx]
 * @returns {{
 *   kind: 'seasonal',
 *   seasonId: string,
 *   items: { id: string, name?: string, nameDe?: string, nameEn?: string, icon?: string }[],
 *   productRefs: { producerId: string, productId?: string, name?: string }[],
 *   score: number
 * }}
 */
export function getSeasonalProducts(ctx = {}) {
    const now = ctx.now || new Date();
    const seasonId = ctx.seasonId || getCurrentSeason(now);
    const demo = getSeasonalDemoItems(seasonId).slice(0, LIST_LIMIT);

    const { pool } = resolvePool(ctx);
    const productRefs = [];
    for (const p of pool) {
        const products = Array.isArray(p.products) ? p.products : [];
        for (const prod of products) {
            if (!isSeasonalProduct(prod, seasonId)) continue;
            productRefs.push({
                producerId: String(p.id),
                productId: prod.id != null ? String(prod.id) : prod.slug != null ? String(prod.slug) : undefined,
                name: prod.name != null ? String(prod.name) : undefined
            });
            if (productRefs.length >= LIST_LIMIT) break;
        }
        if (productRefs.length >= LIST_LIMIT) break;
    }

    return {
        kind: 'seasonal',
        seasonId,
        items: demo.map((x) => ({
            id: x.id,
            name: x.name,
            nameDe: x.nameDe,
            nameEn: x.nameEn,
            icon: x.icon
        })),
        productRefs,
        score: demo.length || productRefs.length ? 70 : 0
    };
}
