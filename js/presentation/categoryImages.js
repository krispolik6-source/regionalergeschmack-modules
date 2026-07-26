// Mapowanie kategorii Home / producent → tematyczne zdjęcie tła

const BASE = '/assets/images/backgrounds';
/** Cache-bust po odświeżeniu zdjęć przykładowych kategorii. */
const V = 'v=9';

/**
 * Klucze: ID kafelka Home (farmers, bakeries…) oraz aliasy producenta (farmer, bakery…).
 * @type {Readonly<Record<string, string>>}
 */
export const CATEGORY_IMAGES = Object.freeze({
    all: `${BASE}/category_all.webp?${V}`,
    farmers: `${BASE}/category_farmers.webp?${V}`,
    farmer: `${BASE}/category_farmers.webp?${V}`,
    honey: `${BASE}/category_honey.webp?${V}`,
    bakeries: `${BASE}/category_bakeries.webp?${V}`,
    bakery: `${BASE}/category_bakeries.webp?${V}`,
    meat: `${BASE}/category_meat.webp?${V}`,
    // Sklepy / Hofladen – category_shops (nie category_honey)
    shops: `${BASE}/category_shops.webp?${V}`,
    shop: `${BASE}/category_shops.webp?${V}`,
    laden: `${BASE}/category_shops.webp?${V}`,
    supermarket: `${BASE}/category_shops.webp?${V}`,
    restaurants: `${BASE}/category_restaurants.webp?${V}`,
    restaurant: `${BASE}/category_restaurants.webp?${V}`,
    fastFood: `${BASE}/category_fastFood.webp?${V}`,
    fast_food: `${BASE}/category_fastFood.webp?${V}`,
    fastfood: `${BASE}/category_fastFood.webp?${V}`,
    vending: `${BASE}/category_vending.webp?${V}`,
    favorites: `${BASE}/category_favorites.webp?${V}`
});

/**
 * @param {string | null | undefined} categoryId
 * @returns {string | null}
 */
export function getCategoryImage(categoryId) {
    const key = String(categoryId || '').trim();
    if (!key) return null;
    return CATEGORY_IMAGES[key] || null;
}

/**
 * JPEG fallback (iOS 9 / starsze).
 * @param {string | null | undefined} categoryId
 * @returns {string | null}
 */
export function getCategoryImageJpeg(categoryId) {
    const webp = getCategoryImage(categoryId);
    if (!webp) return null;
    return webp.replace(/\.webp(\?|$)/i, '.jpg$1');
}

/**
 * Atrybut style z CSS variable --category-image.
 * @param {string | null | undefined} categoryId
 * @returns {string}
 */
export function buildCategoryImageStyle(categoryId) {
    const url = getCategoryImage(categoryId);
    if (!url) return '';
    const safe = String(url).replace(/'/g, '%27').replace(/"/g, '');
    return `style="--category-image:url('${safe}')"`;
}

export default {
    CATEGORY_IMAGES,
    getCategoryImage,
    getCategoryImageJpeg,
    buildCategoryImageStyle
};
