// js/presentation/tastesOfDay.js – ETAP 15B Smaki dnia (UX, bez Store/API)
import { getUserHistory } from '../core/userHistory.js';
import { getLocalDayKey } from '../data/liveRegion.js';
import { getDistanceKm } from '../data/producerHelpers.js';
import { getProducerById, getProducers } from '../data/dataService.js';
import { getContentProducerById } from '../data/contentProducers.js';
import { getProductImageUrl } from '../data/productImages.js';
import { featuredProducts } from '../data/products.js';
import { getProducerOpenStatus } from '../data/openingHours.js';
import { getProductAvailability } from './productAvailability.js';
import { getSmartTodayContext } from './smartToday.js';
import { buildHistoryAffinity } from './livingRegion.js';

const STORAGE_KEY = 'rg_tastes_of_day_slot_v1';
const PICK_COUNT = 3;

/**
 * @typedef {{
 *   id: string,
 *   slugs: string[],
 *   months?: number[],
 *   seasons?: string[],
 *   dayParts?: string[],
 *   weather?: string[],
 *   affinity?: string[],
 *   base?: number,
 *   icon?: string
 * }} TasteNarrative
 */

/** Narracje produktowe – dobór regułami, nie losowo. */
/** @type {readonly TasteNarrative[]} */
export const TASTES_OF_DAY_CATALOG = Object.freeze([
    {
        id: 'honeyFairWeather',
        slugs: ['honey'],
        weather: ['warm', 'hot', 'mild'],
        seasons: ['spring', 'summer', 'autumn'],
        affinity: ['honey', 'farmers'],
        base: 52,
        icon: '🍯'
    },
    {
        id: 'honeyCoolDay',
        slugs: ['honey'],
        weather: ['cool', 'cold', 'rain'],
        affinity: ['honey', 'farmers'],
        base: 44,
        icon: '🍯'
    },
    {
        id: 'strawberriesIdeal',
        slugs: ['strawberries'],
        months: [5, 6, 7],
        seasons: ['spring', 'summer'],
        weather: ['warm', 'hot', 'mild'],
        affinity: ['farmers'],
        base: 54,
        icon: '🍓'
    },
    {
        id: 'cheeseEvening',
        slugs: ['cheese'],
        dayParts: ['evening', 'night', 'afternoon'],
        affinity: ['shops', 'farmers'],
        base: 50,
        icon: '🧀'
    },
    {
        id: 'breadMorning',
        slugs: ['bread', 'pastries'],
        dayParts: ['morning'],
        affinity: ['bakeries'],
        base: 50,
        icon: '🥖'
    },
    {
        id: 'applesCrisp',
        slugs: ['apples'],
        months: [8, 9, 10, 11],
        seasons: ['summer', 'autumn'],
        affinity: ['farmers'],
        base: 46,
        icon: '🍎'
    },
    {
        id: 'yogurtHotDay',
        slugs: ['yogurt'],
        weather: ['hot', 'warm'],
        dayParts: ['midday', 'afternoon'],
        affinity: ['shops', 'farmers'],
        base: 48,
        icon: '🥛'
    },
    {
        id: 'soupRain',
        slugs: ['soup', 'daily-dish'],
        weather: ['rain', 'cold', 'cool'],
        affinity: ['restaurants'],
        base: 52,
        icon: '🍲'
    },
    {
        id: 'eggsMorning',
        slugs: ['eggs'],
        dayParts: ['morning', 'midday'],
        seasons: ['spring', 'summer', 'autumn', 'winter'],
        affinity: ['farmers'],
        base: 40,
        icon: '🥚'
    },
    {
        id: 'juiceSummer',
        slugs: ['juice'],
        seasons: ['summer'],
        weather: ['hot', 'warm'],
        affinity: ['farmers'],
        base: 46,
        icon: '🧃'
    },
    {
        id: 'sausageAfternoon',
        slugs: ['sausage'],
        dayParts: ['midday', 'afternoon', 'evening'],
        affinity: ['meat'],
        base: 42,
        icon: '🌭'
    },
    {
        id: 'vegetablesFresh',
        slugs: ['vegetables'],
        seasons: ['spring', 'summer', 'autumn'],
        dayParts: ['morning', 'midday', 'afternoon'],
        affinity: ['farmers', 'shops'],
        base: 44,
        icon: '🥬'
    },
    {
        id: 'pastriesRain',
        slugs: ['pastries', 'bread'],
        weather: ['rain'],
        affinity: ['bakeries'],
        base: 48,
        icon: '🥐'
    },
    {
        id: 'cheeseMildDay',
        slugs: ['cheese'],
        weather: ['mild', 'cool'],
        dayParts: ['midday', 'afternoon'],
        affinity: ['shops'],
        base: 38,
        icon: '🧀'
    }
]);

/** @type {readonly object[]} */
const PRODUCT_POOL = Object.freeze([
    ...featuredProducts.map((p) => ({
        id: p.id,
        producerId: p.producerId,
        producerName: p.producerName,
        price: p.price,
        unit: p.unit,
        imageSlug: p.imageSlug,
        categoryKey: p.categoryKey,
        distanceKm: p.distanceKm,
        icon: p.icon,
        isSampleImage: p.isSampleImage
    }))
]);

function slotKey(now = new Date()) {
    const ctx = getSmartTodayContext(now);
    return `${getLocalDayKey(now)}:${ctx.dayPart}`;
}

function readStored() {
    if (typeof localStorage === 'undefined') return null;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data || typeof data.slot !== 'string' || !Array.isArray(data.picks)) return null;
        return data;
    } catch {
        return null;
    }
}

function writeStored(slot, picks) {
    if (typeof localStorage === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ slot, picks }));
    } catch {
        /* ignore */
    }
}

function resolveProducer(producerId) {
    return getProducerById(producerId) || getContentProducerById(producerId) || null;
}

function productDistanceKm(product, user) {
    const producer = resolveProducer(product.producerId);
    if (user && producer && Number.isFinite(Number(producer.lat)) && Number.isFinite(Number(producer.lng))) {
        return getDistanceKm(user.lat, user.lng, Number(producer.lat), Number(producer.lng));
    }
    if (Number.isFinite(product.distanceKm)) return product.distanceKm;
    return Infinity;
}

function findProductsForSlugs(slugs) {
    const set = new Set(slugs.map((s) => String(s).toLowerCase()));
    return PRODUCT_POOL.filter((p) => set.has(String(p.imageSlug).toLowerCase()));
}

function isNarrativeEligible(item, ctx) {
    const month = ctx.month;
    if (item.months?.length && !item.months.includes(month)) return false;
    if (item.seasons?.length && !item.seasons.includes(ctx.season)) return false;
    if (item.dayParts?.length && !item.dayParts.includes(ctx.dayPart)) return false;
    if (item.weather?.length && !item.weather.includes(ctx.weather)) return false;
    return true;
}

/**
 * Scoring produktu: otwarte, dystans, dostępność, obecność lokalna, historia.
 */
function scoreProduct(product, ctx, affinity) {
    let score = 10;
    const producer = resolveProducer(product.producerId);
    const open = producer ? getProducerOpenStatus(producer) : { known: false, isOpen: false };
    if (open.known && open.isOpen) score += 24;
    else if (open.known && !open.isOpen) score -= 22;

    const avail = getProductAvailability({ id: product.id, name: product.imageSlug });
    if (avail === 'available') score += 12;
    else if (avail === 'low') score += 4;
    else score -= 30;

    const dist = productDistanceKm(product, ctx.user);
    if (Number.isFinite(dist)) {
        score += Math.max(0, 30 - dist * 2.4);
    }

    const slug = String(product.imageSlug || '').toLowerCase();
    const cat = String(product.categoryKey || '').toLowerCase();
    if (slug === 'honey' && (affinity.get('honey') || 0) > 0) score += 16;
    if (cat && (affinity.get(cat) || 0) > 0) score += Math.min(18, 4 + affinity.get(cat) * 3);

    try {
        const list = getProducers();
        if (Array.isArray(list) && list.some((p) => String(p.id) === String(product.producerId))) {
            score += 6;
        }
    } catch {
        /* ignore */
    }

    return { score, distanceKm: dist, open: Boolean(open.known && open.isOpen) };
}

function scoreNarrative(item, ctx, affinity) {
    let score = Number(item.base) || 20;
    if (item.dayParts?.includes(ctx.dayPart)) score += 26;
    if (item.weather?.includes(ctx.weather)) score += 22;
    if (item.months?.includes(ctx.month)) score += 16;
    if (item.seasons?.includes(ctx.season)) score += 10;
    for (const key of item.affinity || []) {
        const hit = affinity.get(key) || 0;
        if (hit > 0) score += Math.min(20, 5 + hit * 3);
    }
    return score;
}

function hydratePick(pick) {
    const narrative = TASTES_OF_DAY_CATALOG.find((x) => x.id === pick.narrativeId);
    const product = PRODUCT_POOL.find((x) => x.id === pick.productId);
    if (!narrative || !product) return null;
    return {
        narrativeId: narrative.id,
        icon: narrative.icon || product.icon || '🌿',
        product: {
            ...product,
            imageUrl: getProductImageUrl(product.imageSlug)
        },
        producerId: product.producerId,
        open: pick.open,
        distanceKm: pick.distanceKm,
        score: pick.score
    };
}

/**
 * @param {{ now?: Date, limit?: number }} [opts]
 * @returns {{ slot: string, items: object[] }}
 */
export function getTastesOfDay(opts = {}) {
    const now = opts.now || new Date();
    const limit = opts.limit || PICK_COUNT;
    const slot = slotKey(now);

    const cached = readStored();
    if (cached?.slot === slot && cached.picks?.length) {
        const items = cached.picks.map(hydratePick).filter(Boolean);
        if (items.length) return { slot, items };
    }

    const smart = getSmartTodayContext(now);
    const ctx = {
        ...smart,
        month: now.getMonth() + 1
    };
    const affinity = buildHistoryAffinity(getUserHistory());

    const ranked = [];
    for (const narrative of TASTES_OF_DAY_CATALOG) {
        if (!isNarrativeEligible(narrative, ctx)) continue;
        const products = findProductsForSlugs(narrative.slugs);
        if (!products.length) continue;

        let best = null;
        for (const product of products) {
            const meta = scoreProduct(product, ctx, affinity);
            if (!best || meta.score > best.meta.score) {
                best = { product, meta };
            }
        }
        if (!best || best.meta.score < 8) continue;

        const nScore = scoreNarrative(narrative, ctx, affinity);
        ranked.push({
            narrativeId: narrative.id,
            productId: best.product.id,
            open: best.meta.open,
            distanceKm: Number.isFinite(best.meta.distanceKm) ? best.meta.distanceKm : null,
            score: nScore + best.meta.score
        });
    }

    ranked.sort((a, b) => b.score - a.score || String(a.narrativeId).localeCompare(String(b.narrativeId)));

    const picked = [];
    const usedSlugs = new Set();
    for (const row of ranked) {
        if (picked.length >= limit) break;
        const product = PRODUCT_POOL.find((p) => p.id === row.productId);
        const slug = product?.imageSlug;
        if (slug && usedSlugs.has(slug)) continue;
        if (slug) usedSlugs.add(slug);
        picked.push(row);
    }

    writeStored(slot, picked);
    return {
        slot,
        items: picked.map(hydratePick).filter(Boolean)
    };
}

/**
 * @param {string} productId
 */
export function getTastesOfDayProductById(productId) {
    return PRODUCT_POOL.find((p) => p.id === productId) || null;
}

export default {
    TASTES_OF_DAY_CATALOG,
    getTastesOfDay,
    getTastesOfDayProductById
};
