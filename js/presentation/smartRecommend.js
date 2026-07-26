// js/presentation/smartRecommend.js – ranking Polecane / inteligentne listy (ETAP 8)

import { getDistanceKm } from '../data/producerHelpers.js';
import { getAverageRating } from '../data/reviews.js';
import { getProducerOpenStatus } from '../data/openingHours.js';
import { getProducerTrustLevel } from './producerTrust.js';
import { isSeasonalProduct, isSeasonalText } from '../data/seasonCalendar.js';
import { getLastPosition } from '../core/userLocation.js';
import { getUserHistory, getRecentlyViewedIds, getFavoriteProductHints } from '../core/userHistory.js';
import { isProductOnPromo, getProductAvailability } from './productAvailability.js';
import { getLearningBoostForProducer } from './learningEngine.js';
import { getFavoriteIds } from '../core/favoritesStore.js';

function getWeatherBoost() {
    // Placeholder – brak API pogody; lekki boost latem (VII–VIII)
    const month = new Date().getMonth() + 1;
    if (month >= 6 && month <= 8) return 4;
    if (month === 12 || month <= 2) return 2;
    return 0;
}

/**
 * @param {object} producer
 * @param {{ lat: number, lng: number } | null} user
 * @param {{ learningWeight?: number }} [options]
 */
export function scoreProducer(producer, user = getLastPosition(), options = {}) {
    if (!producer) return -Infinity;
    let score = 0;
    const learningWeight = Number.isFinite(Number(options.learningWeight))
        ? Number(options.learningWeight)
        : 1;

    let distanceKm = Infinity;
    if (user && Number.isFinite(Number(producer.lat)) && Number.isFinite(Number(producer.lng))) {
        distanceKm = getDistanceKm(user.lat, user.lng, Number(producer.lat), Number(producer.lng));
        score += Math.max(0, 40 - distanceKm * 4);
    }

    const rating = getAverageRating(producer.id, producer.rating);
    if (Number.isFinite(rating) && rating > 0) score += rating * 6;

    const open = getProducerOpenStatus(producer);
    if (open.known && open.isOpen) score += 18;

    if (producer.promo || (producer.promotions && producer.promotions.length)) score += 12;

    const trust = getProducerTrustLevel(producer);
    if (trust === 'verified') score += 14;
    else if (trust === 'confirmed') score += 8;

    const products = producer.products || [];
    const fresh = products.some((p) => isSeasonalProduct(p)) || isSeasonalText(producer.description);
    if (fresh) score += 10;

    if (products.some((p) => isProductOnPromo(p))) score += 8;
    if (products.some((p) => getProductAvailability(p) === 'available' && p.available === 'available')) {
        score += 4;
    }

    // Nowe produkty (id z timestampem / świeże konto)
    if (String(producer.source) === 'user' || String(producer.id || '').startsWith('content-')) {
        score += 3;
    }

    score += getWeatherBoost();

    // Historia / ulubione
    const recentIds = new Set(getRecentlyViewedIds(12));
    if (recentIds.has(String(producer.id))) score += 10;

    const favs = getFavoriteIds();
    if (favs.some((id) => String(id) === String(producer.id))) {
        score += 16;
    }

    const history = getUserHistory();
    const visited = new Set((history.visited || []).map((x) => String(x.id)));
    if (visited.has(String(producer.id))) score += 6;

    const productHints = new Set(getFavoriteProductHints(16).map((x) => String(x).toLowerCase()));
    if (productHints.size && products.some((p) => productHints.has(String(p.id || '').toLowerCase())
        || productHints.has(String(p.name || '').toLowerCase()))) {
        score += 12;
    }

    const searchBlob = (history.searched || []).map((s) => String(s.query || '').toLowerCase()).join(' ');
    if (searchBlob) {
        const name = String(producer.name || '').toLowerCase();
        const cat = String(producer.category || '').toLowerCase();
        if (searchBlob.includes(name.slice(0, 6)) || (cat && searchBlob.includes(cat))) {
            score += 8;
        }
    }

    // ETAP 18B – lokalny Learning Engine (anonimowy, bez sieci)
    try {
        score += getLearningBoostForProducer(producer) * learningWeight;
    } catch (_) {
        /* ignore */
    }

    return score;
}

/**
 * @param {object[]} producers
 * @param {number} [limit]
 * @param {{ lat: number, lng: number } | null} [user]
 * @param {{ learningWeight?: number }} [options]
 */
export function rankProducersSmart(producers, limit = 8, user = getLastPosition(), options = {}) {
    const list = Array.isArray(producers) ? [...producers] : [];
    list.sort((a, b) => scoreProducer(b, user, options) - scoreProducer(a, user, options));
    return limit ? list.slice(0, limit) : list;
}

/**
 * @param {object[]} producers
 * @param {{ lat: number, lng: number } | null} [user]
 */
export function sortProducersByDistance(producers, user = getLastPosition()) {
    const list = Array.isArray(producers) ? [...producers] : [];
    if (!user) return list;
    return list.sort((a, b) => {
        const da = getDistanceKm(user.lat, user.lng, Number(a.lat), Number(a.lng));
        const db = getDistanceKm(user.lat, user.lng, Number(b.lat), Number(b.lng));
        const aOk = Number.isFinite(da);
        const bOk = Number.isFinite(db);
        if (aOk && bOk) return da - db;
        if (aOk) return -1;
        if (bOk) return 1;
        return 0;
    });
}

export default { scoreProducer, rankProducersSmart, sortProducersByDistance };
