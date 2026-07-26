// Ikony kategorii – jeden kanoniczny zestaw w całej aplikacji (mapa, karty, popup, lista, home)

/** Kanoniczne emoji wg ETAP 5.1 */
export const CANONICAL_CATEGORY_ICONS = Object.freeze({
    farmer: '🌾',
    bakery: '🥖',
    restaurant: '🍽',
    fast_food: '🍔',
    meat: '🥩',
    shop: '🛒',
    vending: '🥛',
    other: '📍'
});

/**
 * Normalizacja klucza kategorii do kanonicznego typu markera.
 * Podtypy rolnika (honey, dairy…) → farmer – jeden styl ikony.
 * @param {string | null | undefined} category
 * @returns {keyof typeof CANONICAL_CATEGORY_ICONS}
 */
export function normalizeCategoryIconKey(category) {
    const raw = String(category || '').trim();
    if (raw === 'fastFood') return 'fast_food';

    const key = raw.toLowerCase();

    switch (key) {
        case 'farmer':
        case 'farmers':
        case 'farm':
        case 'honey':
        case 'dairy':
        case 'fruit':
        case 'vegetables':
        case 'forest':
        case 'products':
            return 'farmer';
        case 'bakery':
        case 'bakeries':
            return 'bakery';
        case 'restaurant':
        case 'restaurants':
            return 'restaurant';
        case 'fast_food':
        case 'fastfood':
            return 'fast_food';
        case 'meat':
            return 'meat';
        case 'shop':
        case 'shops':
            return 'shop';
        case 'vending':
            return 'vending';
        default:
            return 'other';
    }
}

/**
 * Alias mapowania Home / filtry → ikona (ten sam kanon).
 * @type {Readonly<Record<string, string>>}
 */
export const CATEGORY_ICONS = Object.freeze({
    all: '🌍',
    farmer: CANONICAL_CATEGORY_ICONS.farmer,
    farmers: CANONICAL_CATEGORY_ICONS.farmer,
    bakery: CANONICAL_CATEGORY_ICONS.bakery,
    bakeries: CANONICAL_CATEGORY_ICONS.bakery,
    restaurant: CANONICAL_CATEGORY_ICONS.restaurant,
    restaurants: CANONICAL_CATEGORY_ICONS.restaurant,
    fast_food: CANONICAL_CATEGORY_ICONS.fast_food,
    fastFood: CANONICAL_CATEGORY_ICONS.fast_food,
    fastfood: CANONICAL_CATEGORY_ICONS.fast_food,
    meat: CANONICAL_CATEGORY_ICONS.meat,
    shop: CANONICAL_CATEGORY_ICONS.shop,
    shops: CANONICAL_CATEGORY_ICONS.shop,
    vending: CANONICAL_CATEGORY_ICONS.vending,
    favorites: '⭐',
    honey: CANONICAL_CATEGORY_ICONS.farmer,
    dairy: CANONICAL_CATEGORY_ICONS.farmer,
    fruit: CANONICAL_CATEGORY_ICONS.farmer,
    vegetables: CANONICAL_CATEGORY_ICONS.farmer,
    forest: CANONICAL_CATEGORY_ICONS.farmer,
    products: CANONICAL_CATEGORY_ICONS.farmer,
    other: CANONICAL_CATEGORY_ICONS.other
});

/**
 * @param {string} category
 * @param {{ productIcon?: string }} [options] – productIcon ignorowane (spójność kanonu)
 */
export function getCategoryIcon(category, options = {}) {
    void options;
    return CANONICAL_CATEGORY_ICONS[normalizeCategoryIconKey(category)] || CANONICAL_CATEGORY_ICONS.other;
}

/** Mapowanie kategorii producenta → klucz i18n `producer.types.*` */
export const PRODUCER_TYPE_KEYS = Object.freeze({
    farmer: 'farmer',
    farmers: 'farmer',
    farm: 'farmer',
    bakery: 'bakery',
    restaurant: 'restaurant',
    fast_food: 'fast_food',
    fastfood: 'fast_food',
    fastFood: 'fast_food',
    meat: 'meat',
    shop: 'shop',
    vending: 'vending',
    honey: 'honey',
    dairy: 'dairy',
    fruit: 'fruit',
    vegetables: 'vegetables',
    forest: 'forest',
    other: 'other'
});

export function getProducerTypeKey(category) {
    return PRODUCER_TYPE_KEYS[category] || 'other';
}

export default {
    CANONICAL_CATEGORY_ICONS,
    CATEGORY_ICONS,
    normalizeCategoryIconKey,
    getCategoryIcon,
    getProducerTypeKey
};
