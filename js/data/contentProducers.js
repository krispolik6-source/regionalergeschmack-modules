// Curated real producers – imported from producerData.js (single source of truth)

import { PRODUCERS } from './producerData.js';

/** Mapowanie niemieckich etykiet kategorii na klucze wewnętrzne aplikacji. */
const CATEGORY_FROM_LABEL = Object.freeze({
    bäckerei: 'bakery',
    backerei: 'bakery',
    bakery: 'bakery',
    metzgerei: 'meat',
    fleischerei: 'meat',
    meat: 'meat',
    hof: 'farmer',
    bauernhof: 'farmer',
    landwirt: 'farmer',
    imkerei: 'farmer',
    farmer: 'farmer',
    molkerei: 'shop',
    laden: 'shop',
    shop: 'shop',
    restaurant: 'restaurant',
    gasthof: 'restaurant',
    gaststätte: 'restaurant',
    imbiss: 'fast_food',
    'fast food': 'fast_food',
    fast_food: 'fast_food',
    automaten: 'vending',
    vending: 'vending'
});

/**
 * @param {string} label
 * @returns {string}
 */
function mapCategoryLabel(label) {
    const key = String(label || '').trim().toLowerCase();
    return CATEGORY_FROM_LABEL[key] || key || 'other';
}

/**
 * @param {import('./producerData.js').RealProducer} raw
 * @returns {object}
 */
function normalizeRealProducer(raw) {
    const id = String(raw.id);
    const category = mapCategoryLabel(raw.category);
    const products = (raw.products || []).map((entry, index) => {
        if (typeof entry === 'string') {
            return { id: `${id}-product-${index}`, name: entry.trim() };
        }
        return entry;
    });

    return {
        id,
        name: String(raw.name || '').trim(),
        category,
        lat: Number(raw.lat),
        lng: Number(raw.lng),
        description: String(raw.description || '').trim(),
        address: String(raw.address || '').trim(),
        hours: String(raw.hours || '').trim(),
        openingHours: String(raw.hours || '').trim(),
        image: String(raw.imageUrl || '').trim(),
        imageUrl: String(raw.imageUrl || '').trim(),
        products,
        source: 'content',
        verified: true,
        trustStatus: 'verified'
    };
}

/** @type {readonly object[]} */
export const CONTENT_PRODUCERS = Object.freeze(
    PRODUCERS.map((producer) => normalizeRealProducer(producer))
);

const byId = new Map(CONTENT_PRODUCERS.map((p) => [String(p.id), p]));

export function getContentProducers() {
    return [...CONTENT_PRODUCERS];
}

export function getContentProducerById(id) {
    return byId.get(String(id)) || null;
}

export default {
    CONTENT_PRODUCERS,
    getContentProducers,
    getContentProducerById
};
