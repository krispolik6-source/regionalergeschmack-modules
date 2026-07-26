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
export function getSeasonalDemoItems(season = getCurrentSeason()) {
    const labels = {
        spring: [
            { id: 'season-asparagus', name: 'Szparagi', nameDe: 'Spargel', nameEn: 'Asparagus', icon: '🌱' },
            { id: 'season-radish', name: 'Rzodkiewka', nameDe: 'Radieschen', nameEn: 'Radish', icon: '🌱' },
            { id: 'season-strawberry', name: 'Truskawki', nameDe: 'Erdbeeren', nameEn: 'Strawberries', icon: '🍓' }
        ],
        summer: [
            { id: 'season-raspberry', name: 'Maliny', nameDe: 'Himbeeren', nameEn: 'Raspberries', icon: '🫐' },
            { id: 'season-blueberry', name: 'Jagody', nameDe: 'Heidelbeeren', nameEn: 'Blueberries', icon: '🫐' },
            { id: 'season-tomato', name: 'Pomidory', nameDe: 'Tomaten', nameEn: 'Tomatoes', icon: '🍅' }
        ],
        autumn: [
            { id: 'season-pumpkin', name: 'Dynia', nameDe: 'Kürbis', nameEn: 'Pumpkin', icon: '🎃' },
            { id: 'season-apple', name: 'Jabłka', nameDe: 'Äpfel', nameEn: 'Apples', icon: '🍎' },
            { id: 'season-mushroom', name: 'Grzyby', nameDe: 'Pilze', nameEn: 'Mushrooms', icon: '🍄' }
        ],
        winter: [
            { id: 'season-cabbage', name: 'Kapusta', nameDe: 'Kohl', nameEn: 'Cabbage', icon: '🥬' },
            { id: 'season-potato', name: 'Ziemniaki', nameDe: 'Kartoffeln', nameEn: 'Potatoes', icon: '🥔' },
            { id: 'season-beet', name: 'Buraki', nameDe: 'Rote Bete', nameEn: 'Beetroot', icon: '🟣' }
        ]
    };
    return labels[season] || labels.summer;
}

export default {
    SEASONAL_PRODUCTS,
    getCurrentSeason,
    isSeasonalText,
    isSeasonalProduct,
    getSeasonalDemoItems
};
