// js/presentation/regionSoul.js – ETAP 16 Cyfrowa Dusza Regionu (UX, nie chatbot/AI)
import { getUserHistory } from '../core/userHistory.js';
import { getLocalDayKey } from '../data/liveRegion.js';
import { getProducers } from '../data/dataService.js';
import { filterProducersByCategory } from '../data/producerHelpers.js';
import { getProducerOpenStatus } from '../data/openingHours.js';
import { getSmartTodayContext, getDayPart } from './smartToday.js';
import { buildHistoryAffinity } from './livingRegion.js';
import { t } from '../core/i18n.js';

const STORAGE_KEY = 'rg_region_soul_slot_v1';

/**
 * @typedef {{
 *   id: string,
 *   icon: string,
 *   months?: number[],
 *   seasons?: string[],
 *   dayParts?: string[],
 *   weather?: string[],
 *   affinity?: string[],
 *   needsOpen?: 'bakeries'|'farmers'|'shops'|'meat',
 *   base?: number,
 *   category?: string
 * }} RegionSoulLine
 */

/**
 * Głos lokalnego gospodarza – jedna narracja na slot (dzień + pora).
 * Dobór regułami: sezon, pogoda, pora, historia, otwarte miejsca.
 * @type {readonly RegionSoulLine[]}
 */
export const REGION_SOUL_CATALOG = Object.freeze([
    {
        id: 'morningFreshBread',
        icon: '🌾',
        dayParts: ['morning'],
        affinity: ['bakeries'],
        needsOpen: 'bakeries',
        category: 'bakeries',
        base: 58
    },
    {
        id: 'morningHoneyLight',
        icon: '🌅',
        dayParts: ['morning'],
        months: [5, 6, 7, 8, 9],
        weather: ['mild', 'warm', 'hot'],
        affinity: ['honey', 'farmers'],
        category: 'farmers',
        base: 40
    },
    {
        id: 'orchardFirstApples',
        icon: '🍎',
        months: [8, 9, 10],
        seasons: ['summer', 'autumn'],
        affinity: ['farmers'],
        category: 'farmers',
        base: 56
    },
    {
        id: 'beesFairWeather',
        icon: '🐝',
        months: [4, 5, 6, 7, 8, 9],
        weather: ['warm', 'hot', 'mild'],
        dayParts: ['morning', 'midday', 'afternoon'],
        affinity: ['honey', 'farmers'],
        category: 'farmers',
        base: 54
    },
    {
        id: 'eveningCheeseHoney',
        icon: '🌅',
        dayParts: ['evening'],
        weather: ['warm', 'mild', 'hot', 'cool'],
        affinity: ['shops', 'farmers', 'honey'],
        category: 'farmers',
        base: 60
    },
    {
        id: 'eveningFarmWalk',
        icon: '🌾',
        dayParts: ['evening'],
        weather: ['warm', 'mild', 'hot'],
        affinity: ['farmers'],
        category: 'farmers',
        base: 42
    },
    {
        id: 'middayHofTables',
        icon: '🌿',
        dayParts: ['midday', 'afternoon'],
        weather: ['warm', 'hot', 'mild'],
        affinity: ['farmers', 'shops'],
        category: 'farmers',
        base: 42
    },
    {
        id: 'rainWarmKitchen',
        icon: '🌧',
        weather: ['rain'],
        affinity: ['bakeries', 'restaurants'],
        category: 'bakeries',
        base: 55
    },
    {
        id: 'coldHoneyComfort',
        icon: '🍯',
        weather: ['cold', 'cool'],
        affinity: ['honey', 'farmers', 'shops'],
        category: 'farmers',
        base: 48
    },
    {
        id: 'springBlossom',
        icon: '🌸',
        months: [3, 4, 5],
        seasons: ['spring'],
        weather: ['mild', 'warm', 'hot'],
        affinity: ['farmers'],
        category: 'farmers',
        base: 46
    },
    {
        id: 'summerBerries',
        icon: '🍓',
        months: [6, 7, 8],
        seasons: ['summer'],
        dayParts: ['morning', 'midday', 'afternoon'],
        weather: ['warm', 'hot', 'mild'],
        affinity: ['farmers'],
        category: 'farmers',
        base: 50
    },
    {
        id: 'autumnHarvest',
        icon: '🍂',
        months: [9, 10, 11],
        seasons: ['autumn'],
        affinity: ['farmers'],
        category: 'farmers',
        base: 48
    },
    {
        id: 'winterRootCellar',
        icon: '🥔',
        months: [12, 1, 2],
        seasons: ['winter'],
        affinity: ['farmers', 'shops'],
        category: 'farmers',
        base: 46
    },
    {
        id: 'afternoonCheese',
        icon: '🧀',
        dayParts: ['afternoon', 'midday'],
        affinity: ['shops', 'farmers'],
        category: 'shops',
        base: 40
    },
    {
        id: 'nightQuietRegion',
        icon: '🌙',
        dayParts: ['night'],
        affinity: ['restaurants', 'shops'],
        category: 'restaurants',
        base: 38
    },
    {
        id: 'hostDefault',
        icon: '🌿',
        affinity: ['farmers', 'bakeries'],
        category: 'farmers',
        base: 20
    }
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
        if (!data || typeof data.slot !== 'string' || !data.id) return null;
        return data;
    } catch {
        return null;
    }
}

function writeStored(slot, id) {
    if (typeof localStorage === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ slot, id }));
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

function countOpenInCategory(homeCategoryId) {
    try {
        const list = filterProducersByCategory(getProducers() || [], homeCategoryId) || [];
        let n = 0;
        for (const p of list) {
            const open = getProducerOpenStatus(p);
            if (open.known && open.isOpen) n += 1;
        }
        return n;
    } catch {
        return 0;
    }
}

function isEligible(line, ctx) {
    if (line.months?.length && !line.months.includes(ctx.month)) return false;
    if (line.seasons?.length && !line.seasons.includes(ctx.season)) return false;
    if (line.dayParts?.length && !line.dayParts.includes(ctx.dayPart)) return false;
    if (line.weather?.length && !line.weather.includes(ctx.weather)) return false;
    return true;
}

/**
 * @param {RegionSoulLine} line
 * @param {object} ctx
 * @param {Map<string, number>} affinity
 * @param {string} seed
 * @param {Record<string, number>} openCounts
 */
function scoreLine(line, ctx, affinity, seed, openCounts) {
    let score = Number(line.base) || 20;

    if (line.dayParts?.includes(ctx.dayPart)) score += 36;
    if (line.weather?.includes(ctx.weather)) score += 26;
    if (line.months?.includes(ctx.month)) score += 20;
    if (line.seasons?.includes(ctx.season)) score += 12;

    for (const key of line.affinity || []) {
        const hit = affinity.get(key) || 0;
        if (hit > 0) score += Math.min(24, 6 + hit * 4);
    }

    if (line.needsOpen) {
        const open = openCounts[line.needsOpen] || 0;
        const hasLocalData = Object.values(openCounts).some((n) => n > 0);
        if (open > 0) score += 18 + Math.min(10, open);
        else if (hasLocalData) score -= 12;
        // Brak danych producentów → nie karaj (np. test / zimny start)
    }

    score += dayHash(`${seed}:${line.id}`) % 5;
    return score;
}

/**
 * Główna narracja gospodarza na ten moment.
 * @param {Date} [now]
 * @returns {{ id: string, icon: string, text: string, category: string, slot: string } | null}
 */
export function getRegionSoulNarration(now = new Date()) {
    const slot = slotKey(now);
    const cached = readStored();
    if (cached?.slot === slot && cached.id) {
        const line = REGION_SOUL_CATALOG.find((x) => x.id === cached.id);
        if (line) {
            const text = t(`regionSoul.${line.id}`);
            if (text && text !== `regionSoul.${line.id}`) {
                return {
                    id: line.id,
                    icon: line.icon,
                    text,
                    category: line.category || 'farmers',
                    slot
                };
            }
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
    const affinity = buildHistoryAffinity(getUserHistory());
    const openCounts = {
        bakeries: countOpenInCategory('bakeries'),
        farmers: countOpenInCategory('farmers'),
        shops: countOpenInCategory('shops'),
        meat: countOpenInCategory('meat')
    };

    const ranked = REGION_SOUL_CATALOG
        .filter((line) => line.id === 'hostDefault' || isEligible(line, ctx))
        .map((line) => ({
            line,
            score: scoreLine(line, ctx, affinity, slot, openCounts)
        }))
        .sort((a, b) => b.score - a.score || a.line.id.localeCompare(b.line.id));

    const winner = ranked[0]?.line || REGION_SOUL_CATALOG.find((x) => x.id === 'hostDefault');
    if (!winner) return null;

    const text = t(`regionSoul.${winner.id}`);
    if (!text || text === `regionSoul.${winner.id}`) return null;

    writeStored(slot, winner.id);
    return {
        id: winner.id,
        icon: winner.icon,
        text,
        category: winner.category || 'farmers',
        slot
    };
}

export default {
    REGION_SOUL_CATALOG,
    getRegionSoulNarration
};
