// js/data/producerHelpers.js – wspólne typy i funkcje producentów

export const HOME_CATEGORY_MAP = Object.freeze({
    all: null,
    restaurants: 'restaurant',
    fastFood: 'fast_food',
    /** Alias (nie używaj w UI – kanoniczny ID to fastFood / fast_food) */
    fastfood: 'fast_food',
    farmers: 'farmer',
    bakeries: 'bakery',
    meat: 'meat',
    shops: 'shop',
    vending: 'vending'
});

/** Kategorie producenta traktowane jak „Rolnicy” na Home. */
const FARMER_CATEGORY_SET = new Set([
    'farmer',
    'farmers',
    'farm',
    'honey',
    'dairy',
    'fruit',
    'vegetables',
    'forest'
]);

/** Ujednolica kategorię producenta (np. fastfood → fast_food, farmers → farmer). */
export function normalizeProducerCategory(category) {
    const raw = String(category || '').trim();
    if (!raw) return 'other';
    if (raw === 'fastfood' || raw === 'fastFood') return 'fast_food';
    if (raw === 'farmers' || raw === 'farm' || raw === 'landwirt' || raw === 'landwirte') {
        return 'farmer';
    }
    return raw;
}

export function filterProducersByCategory(producers, homeCategoryId = 'all') {
    const producerCategory = HOME_CATEGORY_MAP[homeCategoryId];
    if (!producerCategory) {
        return [...producers];
    }
    if (homeCategoryId === 'farmers') {
        return producers.filter((p) => FARMER_CATEGORY_SET.has(normalizeProducerCategory(p.category)));
    }
    return producers.filter((p) => normalizeProducerCategory(p.category) === producerCategory);
}

export function countProducersByHomeCategory(producers = []) {
    return Object.freeze({
        all: producers.length,
        restaurants: filterProducersByCategory(producers, 'restaurants').length,
        fastFood: filterProducersByCategory(producers, 'fastFood').length,
        farmers: filterProducersByCategory(producers, 'farmers').length,
        bakeries: filterProducersByCategory(producers, 'bakeries').length,
        meat: filterProducersByCategory(producers, 'meat').length,
        shops: filterProducersByCategory(producers, 'shops').length,
        vending: filterProducersByCategory(producers, 'vending').length
    });
}

export function getGoogleMapsDirectionsUrl(lat, lng) {
    const latitude = Number(lat);
    const longitude = Number(lng);
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

const EARTH_RADIUS_KM = 6371;

export function getDistanceKm(lat1, lng1, lat2, lng2) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getProducersInRadius(producers, radiusKm, userLocation) {
    const lat = Number(userLocation?.lat);
    const lng = Number(userLocation?.lng);
    const radius = Number(radiusKm);

    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(radius) || radius <= 0) {
        return [...producers];
    }

    return producers.filter((producer) => {
        const pLat = Number(producer?.lat);
        const pLng = Number(producer?.lng);
        if (!Number.isFinite(pLat) || !Number.isFinite(pLng)) return false;
        return getDistanceKm(lat, lng, pLat, pLng) <= radius;
    });
}

export function normalizeProducerKey(producer) {
    const name = String(producer?.name || '').toLowerCase().trim();
    const address = String(producer?.address || '').toLowerCase().trim();
    return `${name}|${address}`;
}

export function dedupeProducers(producers) {
    const seen = new Map();

    for (const producer of producers) {
        const key = normalizeProducerKey(producer);
        if (!key || key === '|') continue;

        const existing = seen.get(key);
        if (!existing) {
            seen.set(key, producer);
            continue;
        }

        const existingScore = scoreProducer(existing);
        const nextScore = scoreProducer(producer);
        if (nextScore > existingScore) {
            seen.set(key, producer);
        }
    }

    return [...seen.values()];
}

function scoreProducer(producer) {
    let score = 0;
    if (producer?.address) score += 2;
    if (producer?.phone) score += 1;
    if (producer?.website) score += 1;
    if (producer?.description) score += 1;
    if (producer?.source === 'govdata') score += 1;
    if (producer?.source === 'user') score += 5;
    return score;
}
