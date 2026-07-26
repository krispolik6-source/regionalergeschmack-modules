/**
 * Wspólna pula producentów w okolicy (bez widoków).
 */

import { getProducers } from '../../data/dataService.js';
import { getProducersInRadius } from '../../data/producerHelpers.js';
import { getLastPosition } from '../../core/userLocation.js';
import { DEFAULT_RADIUS_KM } from '../config.js';

/**
 * @param {{
 *   producers?: object[],
 *   user?: { lat?: number, lng?: number } | null,
 *   radiusKm?: number
 * }} [ctx]
 */
export function resolvePool(ctx = {}) {
    const all = (ctx.producers || getProducers() || []).filter(
        (p) => p && p.id && p.category !== 'other'
    );
    const user = ctx.user !== undefined ? ctx.user : getLastPosition();
    const radiusKm = Number(ctx.radiusKm) > 0 ? Number(ctx.radiusKm) : DEFAULT_RADIUS_KM;

    let pool = all;
    if (user?.lat != null && user?.lng != null) {
        const near = getProducersInRadius(all, radiusKm, user);
        if (near.length) pool = near;
        else {
            const wider = getProducersInRadius(all, Math.max(radiusKm, 40), user);
            if (wider.length) pool = wider;
        }
    }

    return { pool, all, user, radiusKm };
}
