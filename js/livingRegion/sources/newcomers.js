/**
 * Nowi producenci / produkty względem lokalnej bazy „known”.
 */

import { KNOWN_SET_KEY, LIST_LIMIT } from '../config.js';
import { resolvePool } from './pool.js';

function readKnown() {
    try {
        if (typeof localStorage === 'undefined') return null;
        const raw = localStorage.getItem(KNOWN_SET_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data || !Array.isArray(data.producerIds)) return null;
        return {
            producerIds: data.producerIds.map(String),
            productKeys: Array.isArray(data.productKeys) ? data.productKeys.map(String) : []
        };
    } catch {
        return null;
    }
}

function writeKnown(producerIds, productKeys) {
    try {
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem(
            KNOWN_SET_KEY,
            JSON.stringify({
                at: Date.now(),
                producerIds: [...new Set(producerIds.map(String))],
                productKeys: [...new Set(productKeys.map(String))]
            })
        );
    } catch {
        /* ignore */
    }
}

function productKey(producerId, prod) {
    const pid = prod?.id ?? prod?.slug ?? prod?.name;
    return `${producerId}::${String(pid || '')}`;
}

/**
 * @param {object} [ctx]
 * @returns {{
 *   kind: 'newProducers',
 *   producerIds: string[],
 *   productRefs: { producerId: string, productId?: string, name?: string }[],
 *   firstBaseline: boolean,
 *   score: number
 * }}
 */
export function getNewProducers(ctx = {}) {
    const { pool } = resolvePool(ctx);
    const producerIds = pool.map((p) => String(p.id));
    const productKeys = [];
    const productByKey = new Map();

    for (const p of pool) {
        const products = Array.isArray(p.products) ? p.products : [];
        for (const prod of products) {
            const key = productKey(p.id, prod);
            if (!key.endsWith('::')) {
                productKeys.push(key);
                productByKey.set(key, {
                    producerId: String(p.id),
                    productId: prod.id != null ? String(prod.id) : prod.slug != null ? String(prod.slug) : undefined,
                    name: prod.name != null ? String(prod.name) : undefined
                });
            }
        }
    }

    const known = readKnown();
    if (!known) {
        writeKnown(producerIds, productKeys);
        return {
            kind: 'newProducers',
            producerIds: [],
            productRefs: [],
            firstBaseline: true,
            score: 0
        };
    }

    const knownP = new Set(known.producerIds);
    const knownProd = new Set(known.productKeys);
    const newProducerIds = producerIds.filter((id) => !knownP.has(id)).slice(0, LIST_LIMIT);
    const newProductRefs = [];
    for (const key of productKeys) {
        if (knownProd.has(key)) continue;
        const ref = productByKey.get(key);
        if (ref) newProductRefs.push(ref);
        if (newProductRefs.length >= LIST_LIMIT) break;
    }

    // Aktualizuj bazę (merge) — bez utraty starych ID poza pulą
    const mergedP = [...new Set([...known.producerIds, ...producerIds])].slice(-500);
    const mergedProd = [...new Set([...known.productKeys, ...productKeys])].slice(-2000);
    writeKnown(mergedP, mergedProd);

    const score = newProducerIds.length * 12 + newProductRefs.length * 4;
    return {
        kind: 'newProducers',
        producerIds: newProducerIds,
        productRefs: newProductRefs,
        firstBaseline: false,
        score
    };
}
