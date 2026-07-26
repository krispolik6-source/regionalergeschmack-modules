// js/presentation/livingMap.js – ETAP 15C Żywa mapa (UX, lokalnie, bez requestów)
import { getLocalDayKey } from '../data/liveRegion.js';
import { getOpenTiming } from '../data/openingHours.js';
import { isSeasonalProduct, isSeasonalText } from '../data/seasonCalendar.js';
import { getUserHistory, getRecentlyViewedIds } from '../core/userHistory.js';
import { isProductOnPromo } from './productAvailability.js';
import { getSmartTodayRecommendations } from './smartToday.js';
import { getTastesOfDay } from './tastesOfDay.js';

const REC_CACHE_KEY = 'rg_living_map_rec_ids_v1';

/** @typedef {'closingSoon'|'justOpened'|'freshOpen'|'recommended'|'popular'|'freshDelivery'} LivingMapCueId */

/**
 * @typedef {{ id: LivingMapCueId, className: string }} LivingMapCue
 */

/** Kolejność: jedna wskazówka na marker (bez migania / hałasu). */
const CUE_PRIORITY = Object.freeze([
    'closingSoon',
    'justOpened',
    'freshOpen',
    'recommended',
    'popular',
    'freshDelivery'
]);

function dayHash(seed) {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i += 1) {
        h ^= seed.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function readRecommendedIds() {
    if (typeof localStorage === 'undefined') return null;
    try {
        const raw = localStorage.getItem(REC_CACHE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data || data.day !== getLocalDayKey() || !Array.isArray(data.ids)) return null;
        return new Set(data.ids.map(String));
    } catch {
        return null;
    }
}

function writeRecommendedIds(ids) {
    if (typeof localStorage === 'undefined') return;
    try {
        localStorage.setItem(REC_CACHE_KEY, JSON.stringify({
            day: getLocalDayKey(),
            ids: [...ids]
        }));
    } catch {
        /* ignore */
    }
}

/**
 * ID producentów z lokalnych rekomendacji dnia (bez sieci).
 * @returns {Set<string>}
 */
export function getLivingMapRecommendedIds() {
    const cached = readRecommendedIds();
    if (cached) return cached;

    const ids = new Set();
    try {
        const tastes = getTastesOfDay({ limit: 3 });
        for (const item of tastes.items || []) {
            if (item?.producerId) ids.add(String(item.producerId));
        }
    } catch {
        /* ignore */
    }
    try {
        const smart = getSmartTodayRecommendations({ limit: 4 });
        for (const p of smart.products || []) {
            if (p?.producerId) ids.add(String(p.producerId));
        }
    } catch {
        /* ignore */
    }

    writeRecommendedIds(ids);
    return ids;
}

function hasFreshDelivery(producer) {
    const products = producer?.products || [];
    if (products.some((p) => isSeasonalProduct(p))) return true;
    if (products.some((p) => isProductOnPromo(p))) return true;
    if (producer?.promo || (producer?.promotions && producer.promotions.length)) return true;
    if (isSeasonalText(producer?.description)) return true;
    return false;
}

function isPopularToday(producer, now = new Date()) {
    const id = String(producer?.id || '');
    if (!id) return false;
    const seed = `${getLocalDayKey(now)}:pop:${id}`;
    const h = dayHash(seed) % 100;
    // Delikatny udział: ~10–16% otwartych miejsc (deterministycznie)
    const recent = new Set(getRecentlyViewedIds(8).map(String));
    if (recent.has(id)) return h < 28;
    const history = getUserHistory();
    const visited = (history.visited || []).some((x) => String(x.id) === id);
    if (visited) return h < 20;
    return h < 11;
}

/**
 * Jedna wskazówka wizualna dla markera.
 * @param {object} producer
 * @param {{ now?: Date, recommendedIds?: Set<string> }} [opts]
 * @returns {LivingMapCue | null}
 */
export function resolveLivingMapCue(producer, opts = {}) {
    if (!producer) return null;
    const now = opts.now || new Date();
    const recommendedIds = opts.recommendedIds || getLivingMapRecommendedIds();
    const timing = getOpenTiming(producer, now);
    const id = String(producer.id || '');

    /** @type {Set<LivingMapCueId>} */
    const hits = new Set();

    if (timing.known && timing.isOpen) {
        if (Number.isFinite(timing.minutesUntilClose) && timing.minutesUntilClose <= 60) {
            hits.add('closingSoon');
        }
        if (Number.isFinite(timing.minutesSinceOpen) && timing.minutesSinceOpen <= 45) {
            hits.add('justOpened');
        } else if (Number.isFinite(timing.minutesSinceOpen) && timing.minutesSinceOpen <= 150) {
            hits.add('freshOpen');
        }
    }

    if (id && recommendedIds.has(id)) {
        hits.add('recommended');
    }

    if (timing.known && timing.isOpen && isPopularToday(producer, now)) {
        hits.add('popular');
    }

    if (hasFreshDelivery(producer)) {
        hits.add('freshDelivery');
    }

    for (const cueId of CUE_PRIORITY) {
        if (hits.has(cueId)) {
            return { id: cueId, className: `lm-cue lm-cue--${cueId}` };
        }
    }
    return null;
}

/**
 * Klasy CSS do wstawienia w HTML markera.
 * @param {object} producer
 * @param {{ now?: Date, recommendedIds?: Set<string> }} [opts]
 */
export function getLivingMapCueClassNames(producer, opts = {}) {
    const cue = resolveLivingMapCue(producer, opts);
    return cue ? cue.className : '';
}

/**
 * Klucz i18n: livingMap.{id}
 * @param {LivingMapCue | null} cue
 */
export function livingMapCueLabelKey(cue) {
    return cue ? `livingMap.${cue.id}` : '';
}

export default {
    getLivingMapRecommendedIds,
    resolveLivingMapCue,
    getLivingMapCueClassNames,
    livingMapCueLabelKey
};
