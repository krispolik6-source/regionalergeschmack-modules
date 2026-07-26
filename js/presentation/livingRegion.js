// js/presentation/livingRegion.js – ETAP 15A Living Region AI (tylko UX)
import { getUserHistory } from '../core/userHistory.js';
import { getLocalDayKey } from '../data/liveRegion.js';
import { getSmartTodayContext, getDayPart } from './smartToday.js';

const STORAGE_KEY = 'rg_living_region_slot_v1';
const PICK_MIN = 3;
const PICK_MAX = 4;

/**
 * @typedef {'morning'|'midday'|'afternoon'|'evening'|'night'} DayPart
 * @typedef {'hot'|'warm'|'mild'|'cool'|'cold'|'rain'} WeatherKind
 * @typedef {{
 *   id: string,
 *   months?: number[],
 *   seasons?: string[],
 *   dayParts?: DayPart[],
 *   weather?: WeatherKind[],
 *   affinity?: string[],
 *   base?: number
 * }} LivingPulseItem
 */

/** Katalog impulsów regionalnych – wybór regułami, nie losowo. */
/** @type {readonly LivingPulseItem[]} */
export const LIVING_REGION_CATALOG = Object.freeze([
    { id: 'morningBread', dayParts: ['morning'], affinity: ['bakeries'], base: 48 },
    { id: 'morningRolls', dayParts: ['morning'], affinity: ['bakeries'], base: 42 },
    { id: 'middayFarmShop', dayParts: ['midday', 'afternoon'], affinity: ['farmers', 'shops'], base: 36 },
    { id: 'eveningApiary', months: [4, 5, 6, 7, 8, 9], dayParts: ['evening'], affinity: ['farmers', 'honey'], base: 46 },
    { id: 'eveningStrollHof', dayParts: ['evening'], weather: ['warm', 'mild', 'hot'], affinity: ['farmers'], base: 34 },
    { id: 'nightQuietKitchen', dayParts: ['night'], affinity: ['restaurants', 'shops'], base: 30 },
    { id: 'firstPlums', months: [7, 8], seasons: ['summer', 'autumn'], affinity: ['farmers'], base: 50 },
    { id: 'firstApples', months: [8, 9, 10], seasons: ['summer', 'autumn'], affinity: ['farmers'], base: 44 },
    { id: 'berryRipening', months: [6, 7, 8], seasons: ['summer'], affinity: ['farmers'], base: 40 },
    { id: 'asparagusMorning', months: [4, 5, 6], seasons: ['spring'], dayParts: ['morning', 'midday'], affinity: ['farmers'], base: 42 },
    { id: 'pumpkinFields', months: [9, 10, 11], seasons: ['autumn'], affinity: ['farmers'], base: 40 },
    { id: 'winterRoots', months: [11, 12, 1, 2], seasons: ['winter', 'autumn'], affinity: ['farmers'], base: 38 },
    { id: 'tomorrowMarketVeg', months: [5, 6, 7, 8, 9, 10], dayParts: ['afternoon', 'evening'], affinity: ['farmers', 'shops'], base: 44 },
    { id: 'tomorrowMarketBread', dayParts: ['evening', 'night'], affinity: ['bakeries'], base: 32 },
    { id: 'rainSoupDay', weather: ['rain'], affinity: ['restaurants'], base: 52 },
    { id: 'rainWarmBread', weather: ['rain'], affinity: ['bakeries'], base: 46 },
    { id: 'hotOrchardShade', weather: ['hot', 'warm'], months: [6, 7, 8], affinity: ['farmers'], base: 40 },
    { id: 'coldHoneyTea', weather: ['cold', 'cool'], affinity: ['farmers', 'honey', 'shops'], base: 42 },
    { id: 'springBlossomWalk', months: [3, 4, 5], seasons: ['spring'], weather: ['mild', 'warm', 'hot'], affinity: ['farmers'], base: 36 },
    { id: 'cheeseAfternoon', dayParts: ['afternoon', 'midday'], affinity: ['shops', 'farmers'], base: 34 },
    { id: 'meatCounterFresh', dayParts: ['morning', 'midday'], affinity: ['meat'], base: 36 },
    { id: 'automatEveningFill', dayParts: ['evening', 'afternoon'], affinity: ['vending', 'farmers'], base: 30 },
    { id: 'sundayMarketHint', months: [4, 5, 6, 7, 8, 9, 10], affinity: ['farmers', 'shops'], base: 28 },
    { id: 'honeyFlowPeak', months: [5, 6, 7], seasons: ['spring', 'summer'], affinity: ['honey', 'farmers'], base: 40 }
]);

function slotKey(now = new Date()) {
    return `${getLocalDayKey(now)}:${getDayPart(now)}`;
}

function readStored() {
    if (typeof localStorage === 'undefined') return null;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data || typeof data.slot !== 'string' || !Array.isArray(data.ids)) return null;
        return data;
    } catch {
        return null;
    }
}

function writeStored(slot, ids) {
    if (typeof localStorage === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ slot, ids }));
    } catch {
        /* ignore */
    }
}

function dayHash(seed) {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i += 1) {
        h ^= seed.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

/**
 * Mapa zainteresowań z historii (kategorie + słowa kluczowe).
 * @returns {Map<string, number>}
 */
export function buildHistoryAffinity(history = getUserHistory()) {
    const scores = new Map();
    const bump = (key, n = 1) => {
        if (!key) return;
        scores.set(key, (scores.get(key) || 0) + n);
    };

    const blobOf = (entry) => [
        entry?.category,
        entry?.type,
        entry?.name,
        entry?.query
    ].filter(Boolean).join(' ').toLowerCase();

    const classify = (blob) => {
        if (/bäck|baeck|bakery|piekarn|пекар|brot|chleb/.test(blob)) bump('bakeries', 2);
        if (/honey|honig|miód|мед|imker|pasiek/.test(blob)) bump('honey', 3);
        if (/farm|bauer|hof|gospodar|сад|farmer/.test(blob)) bump('farmers', 2);
        if (/meat|metz|fleisch|mięso|mesar/.test(blob)) bump('meat', 2);
        if (/restaurant|gasth|gastro|resta/.test(blob)) bump('restaurants', 2);
        if (/shop|laden|sklep|магазин/.test(blob)) bump('shops', 1);
        if (/vend|automat/.test(blob)) bump('vending', 1);
        if (/farmer|farmers/.test(blob)) bump('farmers', 1);
        if (/baker/.test(blob)) bump('bakeries', 1);
    };

    for (const entry of [...(history.visited || []), ...(history.viewed || [])]) {
        classify(blobOf(entry));
        const cat = String(entry?.category || '').toLowerCase();
        if (cat) bump(cat, 1);
    }
    for (const entry of history.searched || []) {
        classify(blobOf(entry));
    }
    for (const entry of history.products || []) {
        classify(blobOf(entry));
    }

    return scores;
}

function isEligible(item, ctx) {
    const month = ctx.month;
    if (item.months?.length && !item.months.includes(month)) return false;
    if (item.seasons?.length && !item.seasons.includes(ctx.season)) return false;
    if (item.dayParts?.length && !item.dayParts.includes(ctx.dayPart)) return false;
    if (item.weather?.length && !item.weather.includes(ctx.weather)) return false;
    return true;
}

/**
 * @param {LivingPulseItem} item
 * @param {object} ctx
 * @param {Map<string, number>} affinity
 * @param {string} seed
 */
function scoreItem(item, ctx, affinity, seed) {
    let score = Number(item.base) || 20;

    if (item.dayParts?.includes(ctx.dayPart)) score += 28;
    if (item.weather?.includes(ctx.weather)) score += 24;
    if (item.months?.includes(ctx.month)) score += 18;
    if (item.seasons?.includes(ctx.season)) score += 10;

    for (const key of item.affinity || []) {
        const hit = affinity.get(key) || 0;
        if (hit > 0) score += Math.min(22, 6 + hit * 4);
    }

    // Deterministyczny tie-break (nie „losowość” treści)
    const h = dayHash(`${seed}:${item.id}`);
    score += (h % 7);

    return score;
}

function pickCount(seed) {
    return PICK_MIN + (dayHash(seed) % (PICK_MAX - PICK_MIN + 1));
}

/**
 * Mapowanie affinity → kategoria Home (nawigacja, nie reklama).
 * @param {LivingPulseItem} item
 */
export function livingPulseCategory(item) {
    const a = item.affinity || [];
    if (a.includes('bakeries')) return 'bakeries';
    if (a.includes('meat')) return 'meat';
    if (a.includes('restaurants')) return 'restaurants';
    if (a.includes('shops')) return 'shops';
    if (a.includes('vending')) return 'vending';
    if (a.includes('honey') || a.includes('farmers')) return 'farmers';
    return 'farmers';
}

/**
 * @param {Date} [now]
 * @returns {{ slot: string, items: Array<LivingPulseItem & { score: number }> }}
 */
export function getLivingRegionPulse(now = new Date()) {
    const slot = slotKey(now);
    const cached = readStored();
    if (cached?.slot === slot && cached.ids?.length) {
        const byId = new Map(LIVING_REGION_CATALOG.map((x) => [x.id, x]));
        const items = cached.ids.map((id) => byId.get(id)).filter(Boolean);
        if (items.length) {
            return { slot, items: items.map((x) => ({ ...x, score: 0 })) };
        }
    }

    const smart = getSmartTodayContext(now);
    const ctx = {
        dayKey: smart.dayKey,
        dayPart: smart.dayPart,
        weather: smart.weather,
        season: smart.season,
        month: now.getMonth() + 1
    };
    const affinity = buildHistoryAffinity();
    const seed = slot;

    const ranked = LIVING_REGION_CATALOG
        .filter((item) => isEligible(item, ctx))
        .map((item) => ({ ...item, score: scoreItem(item, ctx, affinity, seed) }))
        .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

    // Różnorodność: unikaj dwóch z tą samą główną affinity z rzędu
    const picked = [];
    const usedAffinity = new Set();
    const want = pickCount(seed);

    for (const item of ranked) {
        if (picked.length >= want) break;
        const primary = (item.affinity && item.affinity[0]) || item.id;
        if (usedAffinity.has(primary) && picked.length < want - 1) {
            continue;
        }
        picked.push(item);
        usedAffinity.add(primary);
    }

    // Uzupełnij jeśli filtr różnorodności za mocny
    if (picked.length < PICK_MIN) {
        for (const item of ranked) {
            if (picked.length >= want) break;
            if (picked.some((p) => p.id === item.id)) continue;
            picked.push(item);
        }
    }

    const ids = picked.map((x) => x.id);
    writeStored(slot, ids);
    return { slot, items: picked };
}

export default {
    LIVING_REGION_CATALOG,
    buildHistoryAffinity,
    getLivingRegionPulse,
    livingPulseCategory
};
