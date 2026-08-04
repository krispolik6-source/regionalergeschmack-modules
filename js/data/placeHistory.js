// js/data/placeHistory.js – ETAP 15D Historia miejsca („Czy wiesz, że…”)
import { getContentProducerById } from './contentProducers.js';
import { normalizeCategoryIconKey } from '../presentation/categoryIcons.js';

/**
 * @typedef {{
 *   id: string,
 *   categories?: string[],
 *   keywords?: RegExp,
 *   contentIds?: string[]
 * }} PlaceHistoryFact
 */

/**
 * Katalog ciekawostek (klucze i18n: placeHistory.{id}).
 * Teksty krótkie, konkretne – nie lorem ipsum.
 * @type {readonly PlaceHistoryFact[]}
 */
export const PLACE_HISTORY_CATALOG = Object.freeze([
    // Bakeries
    { id: 'bakeryFortyYears', categories: ['bakery'], keywords: /brot|bread|chleb|sauerteig|pieczyw/i },
    { id: 'bakeryDawnOven', categories: ['bakery'] },
    { id: 'bakeryLocalFlour', categories: ['bakery'] },

    // Honey / apiary (often under farmer)
    { id: 'apiaryLindens', keywords: /honey|honig|miód|мед|imker|pasiek|bienen/i },
    { id: 'apiaryMeadowFlight', keywords: /honey|honig|miód|мед|imker|pasiek|bienen/i },

    // Farms
    { id: 'farmSeasonalVeg', categories: ['farmer'], keywords: /gemüse|vegetable|warzyw|зеленч|kartoffel|potato/i },
    { id: 'farmOrchardApples', categories: ['farmer'], keywords: /apfel|apple|jabł|јабол|obst/i },
    { id: 'farmFreeRangeEggs', categories: ['farmer'], keywords: /ei|egg|jaj|јај/i },
    { id: 'farmShortPath', categories: ['farmer'] },

    // Meat
    { id: 'meatRegionalCraft', categories: ['meat'] },
    { id: 'meatWeeklyCut', categories: ['meat'] },

    // Dairy / shops
    { id: 'shopFarmCheese', categories: ['shop'], keywords: /käse|cheese|ser|сирењ|milch|joghurt|yogurt/i },
    { id: 'shopMorningMilk', categories: ['shop'] },

    // Restaurants / gasthaus
    { id: 'restaurantSeasonMenu', categories: ['restaurant'] },
    { id: 'restaurantLocalSuppliers', categories: ['restaurant'] },

    // Fast food / imbiss
    { id: 'fastFoodRegionalMeat', categories: ['fast_food'] },

    // Vending
    { id: 'vendingRoundClock', categories: ['vending'] },
    { id: 'vendingFarmFill', categories: ['vending'] },

    // Generic regional
    { id: 'placeFamilyRun', categories: ['farmer', 'bakery', 'meat', 'shop', 'restaurant', 'other'] },
    { id: 'placeShortRoutes', categories: ['farmer', 'bakery', 'meat', 'shop', 'other'] }
]);

function hashString(value) {
    let hash = 0;
    const text = String(value || '');
    for (let i = 0; i < text.length; i += 1) {
        hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
}

function producerBlob(producer) {
    const products = (producer?.products || [])
        .map((p) => `${p.name || ''} ${p.description || ''} ${p.imageSlug || ''}`)
        .join(' ');
    return [
        producer?.name,
        producer?.description,
        producer?.category,
        producer?.promo,
        products
    ].filter(Boolean).join(' ').toLowerCase();
}

/**
 * @param {object} producer
 * @returns {PlaceHistoryFact[]}
 */
function eligibleFacts(producer) {
    const id = String(producer?.id || '');
    const cat = normalizeCategoryIconKey(producer?.category);
    const blob = producerBlob(producer);
    const content = getContentProducerById(id);

    return PLACE_HISTORY_CATALOG.filter((fact) => {
        if (fact.contentIds?.length) {
            return fact.contentIds.includes(id);
        }
        if (fact.categories?.length && !fact.categories.includes(cat)) {
            return false;
        }
        if (fact.keywords) {
            const story = String(content?.story || producer?.story || '');
            if (!fact.keywords.test(blob) && !fact.keywords.test(story)) return false;
        }
        return true;
    });
}

/**
 * Jedna ciekawostka na miejsce (deterministycznie).
 * @param {object} producer
 * @returns {{ id: string } | null}
 */
export function getPlaceHistoryFact(producer) {
    if (!producer) return null;

    const pool = eligibleFacts(producer);
    if (!pool.length) return null;

    // Preferuj fakty przypisane do content ID
    const specific = pool.filter((f) => f.contentIds?.length);
    const list = specific.length ? specific : pool;
    const index = hashString(producer.id || producer.name) % list.length;
    return { id: list[index].id };
}

export default {
    PLACE_HISTORY_CATALOG,
    getPlaceHistoryFact
};
