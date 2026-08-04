// js/data/seasonCalendar.js – sezonowość produktów (demo, bez API)

/** @typedef {'spring'|'summer'|'autumn'|'winter'} SeasonId */

const SEASON_MONTHS = Object.freeze({
    spring: [3, 4, 5],
    summer: [6, 7, 8],
    autumn: [9, 10, 11],
    winter: [12, 1, 2]
});

/** @type {Record<SeasonId, string[]>} */
export const SEASONAL_PRODUCTS = Object.freeze({
    spring: ['szparagi', 'asparagus', 'spargel', 'rzodkiewka', 'radish', 'rettich', 'truskawki', 'strawberry', 'erdbeere'],
    summer: ['maliny', 'raspberry', 'himbeere', 'jagody', 'blueberry', 'heidelbeere', 'pomidory', 'tomato', 'tomate'],
    autumn: ['dynia', 'pumpkin', 'kürbis', 'jabłka', 'apple', 'apfel', 'grzyby', 'mushroom', 'pilz'],
    winter: ['kapusta', 'cabbage', 'kohl', 'ziemniaki', 'potato', 'kartoffel', 'buraki', 'beet', 'rote bete']
});

/**
 * @param {Date} [now]
 * @returns {SeasonId}
 */
export function getCurrentSeason(now = new Date()) {
    const month = now.getMonth() + 1;
    for (const [id, months] of Object.entries(SEASON_MONTHS)) {
        if (months.includes(month)) return /** @type {SeasonId} */ (id);
    }
    return 'summer';
}

/**
 * @param {string} text
 * @param {SeasonId} [season]
 */
export function isSeasonalText(text, season = getCurrentSeason()) {
    const hay = String(text || '').toLowerCase();
    if (!hay) return false;
    return (SEASONAL_PRODUCTS[season] || []).some((term) => hay.includes(term));
}

/**
 * @param {{ name?: string, description?: string, id?: string }} product
 * @param {SeasonId} [season]
 */
export function isSeasonalProduct(product, season = getCurrentSeason()) {
    return isSeasonalText([product?.name, product?.description, product?.id].filter(Boolean).join(' '), season);
}

/**
 * @param {SeasonId} [season]
 */
export function getSeasonalDemoItems(_season = getCurrentSeason()) {
    return [];
}

export default {
    SEASONAL_PRODUCTS,
    getCurrentSeason,
    isSeasonalText,
    isSeasonalProduct,
    getSeasonalDemoItems
};
