/**
 * Zmiany od ostatniej wizyty — własny snapshot Engine (nie miesza toastu mapy).
 */

import { VISIT_SNAP_KEY, LIST_LIMIT } from '../config.js';
import { resolvePool } from './pool.js';

function promoKeysFor(producer) {
    const keys = [];
    if (!producer?.id) return keys;
    const id = String(producer.id);
    if (producer.promo) keys.push(`${id}::promo::${String(producer.promo).slice(0, 80)}`);
    if (producer.isPromoted || producer.promoted) keys.push(`${id}::flag::promoted`);
    const list = Array.isArray(producer.promotions) ? producer.promotions : [];
    for (const p of list) {
        const pid = p?.id || p?.title || p?.name;
        if (pid) keys.push(`${id}::prom::${String(pid)}`);
    }
    return keys;
}

function buildSnapshot(producers) {
    const producerIds = [];
    const promoKeys = [];
    for (const p of producers) {
        if (!p?.id) continue;
        producerIds.push(String(p.id));
        promoKeys.push(...promoKeysFor(p));
    }
    return {
        at: Date.now(),
        producerIds,
        promoKeys: [...new Set(promoKeys)]
    };
}

function readSnap() {
    try {
        if (typeof localStorage === 'undefined') return null;
        const raw = localStorage.getItem(VISIT_SNAP_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data || !Array.isArray(data.producerIds)) return null;
        return data;
    } catch {
        return null;
    }
}

function writeSnap(snap) {
    try {
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem(VISIT_SNAP_KEY, JSON.stringify(snap));
    } catch {
        /* ignore */
    }
}

/**
 * @param {object} [ctx]
 * @returns {{
 *   kind: 'visitDelta',
 *   firstVisit: boolean,
 *   newProducerIds: string[],
 *   newPromoProducerIds: string[],
 *   removedCount: number,
 *   score: number
 * }}
 */
export function getChangesSinceLastVisit(ctx = {}) {
    const { pool } = resolvePool(ctx);
    const current = buildSnapshot(pool);
    const prev = readSnap();

    if (!prev) {
        writeSnap(current);
        return {
            kind: 'visitDelta',
            firstVisit: true,
            newProducerIds: [],
            newPromoProducerIds: [],
            removedCount: 0,
            score: 0
        };
    }

    const prevIds = new Set(prev.producerIds.map(String));
    const prevPromos = new Set(prev.promoKeys || []);
    const newProducerIds = current.producerIds.filter((id) => !prevIds.has(id)).slice(0, LIST_LIMIT);

    const promoSet = new Set();
    for (const key of current.promoKeys) {
        if (!prevPromos.has(key)) {
            const id = String(key).split('::')[0];
            if (id) promoSet.add(id);
        }
    }
    const newPromoProducerIds = [...promoSet].slice(0, LIST_LIMIT);

    let removedCount = 0;
    const curr = new Set(current.producerIds);
    for (const id of prevIds) {
        if (!curr.has(id)) removedCount += 1;
    }

    writeSnap(current);

    const score = newProducerIds.length * 14 + newPromoProducerIds.length * 8;
    return {
        kind: 'visitDelta',
        firstVisit: false,
        newProducerIds,
        newPromoProducerIds,
        removedCount,
        score
    };
}
