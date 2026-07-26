// js/data/liveRegion.js – ETAP 13A „Dzisiaj w regionie” (prezentacja, bez Store/API)
import { getCurrentSeason } from './seasonCalendar.js';
import { countProducersByHomeCategory } from './dataService.js';

const STORAGE_KEY = 'rg_live_region_day_v1';
const PICK_MIN = 5;
const PICK_MAX = 8;

/**
 * Katalog wiadomości społecznościowych (klucze i18n: liveRegion.{id}).
 * @typedef {{ id: string, category: string, seasons: string[], icon: string }} LiveRegionItem
 */

/** @type {readonly LiveRegionItem[]} */
export const LIVE_REGION_CATALOG = Object.freeze([
    { id: 'freshBread', category: 'bakeries', seasons: ['spring', 'summer', 'autumn', 'winter'], icon: '🍞' },
    { id: 'freshRolls', category: 'bakeries', seasons: ['spring', 'summer', 'autumn', 'winter'], icon: '🥖' },
    { id: 'freshHoney', category: 'farmers', seasons: ['spring', 'summer', 'autumn'], icon: '🍯' },
    { id: 'freshMilk', category: 'farmers', seasons: ['spring', 'summer', 'autumn', 'winter'], icon: '🥛' },
    { id: 'cheeseOfDay', category: 'shops', seasons: ['spring', 'summer', 'autumn', 'winter'], icon: '🧀' },
    { id: 'farmEggs', category: 'farmers', seasons: ['spring', 'summer', 'autumn', 'winter'], icon: '🥚' },
    { id: 'vegDelivery', category: 'farmers', seasons: ['spring', 'summer', 'autumn'], icon: '🥕' },
    { id: 'freshSausage', category: 'meat', seasons: ['spring', 'summer', 'autumn', 'winter'], icon: '🌭' },
    { id: 'automatRestock', category: 'vending', seasons: ['spring', 'summer', 'autumn', 'winter'], icon: '🥛' },
    { id: 'soupOfDay', category: 'restaurants', seasons: ['autumn', 'winter', 'spring'], icon: '🍲' },
    { id: 'gardenTables', category: 'restaurants', seasons: ['spring', 'summer'], icon: '🌸' },
    { id: 'asparagusSeason', category: 'farmers', seasons: ['spring'], icon: '🌱' },
    { id: 'firstStrawberries', category: 'farmers', seasons: ['spring', 'summer'], icon: '🍓' },
    { id: 'radishSeason', category: 'farmers', seasons: ['spring'], icon: '🌱' },
    { id: 'tomatoSeason', category: 'farmers', seasons: ['summer'], icon: '🍅' },
    { id: 'berrySeason', category: 'farmers', seasons: ['summer'], icon: '🫐' },
    { id: 'harvestBegun', category: 'farmers', seasons: ['summer', 'autumn'], icon: '🌾' },
    { id: 'appleHarvest', category: 'farmers', seasons: ['autumn'], icon: '🍎' },
    { id: 'pumpkinSeason', category: 'farmers', seasons: ['autumn'], icon: '🎃' },
    { id: 'mushroomSeason', category: 'farmers', seasons: ['autumn'], icon: '🍄' },
    { id: 'winterVeg', category: 'farmers', seasons: ['winter'], icon: '🥬' },
    { id: 'potatoSeason', category: 'farmers', seasons: ['autumn', 'winter'], icon: '🥔' },
    { id: 'jamKitchen', category: 'shops', seasons: ['summer', 'autumn'], icon: '🫙' },
    { id: 'pretzelMorning', category: 'bakeries', seasons: ['spring', 'summer', 'autumn', 'winter'], icon: '🥨' }
]);

/**
 * @param {Date} [now]
 * @returns {string} YYYY-MM-DD (lokalnie)
 */
export function getLocalDayKey(now = new Date()) {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * Deterministyczny PRNG z seeda (ten sam dzień → ta sama kolejność).
 * @param {string} seed
 */
function mulberry32(seed) {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i += 1) {
        h ^= seed.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    let t = h >>> 0;
    return () => {
        t += 0x6d2b79f5;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * @template T
 * @param {T[]} list
 * @param {() => number} rand
 */
function shuffleInPlace(list, rand) {
    for (let i = list.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rand() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
}

function readStored() {
    if (typeof localStorage === 'undefined') return null;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data || typeof data.day !== 'string' || !Array.isArray(data.ids)) return null;
        return data;
    } catch {
        return null;
    }
}

function writeStored(day, ids) {
    if (typeof localStorage === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ day, ids }));
    } catch {
        /* quota / private mode */
    }
}

/**
 * @param {string} season
 * @returns {LiveRegionItem[]}
 */
function eligibleForSeason(season) {
    return LIVE_REGION_CATALOG.filter((item) => item.seasons.includes(season));
}

/**
 * Preferuj kategorie obecne w danych (bez zmiany logiki filtrów).
 * @param {LiveRegionItem[]} pool
 */
function rankByLocalPresence(pool) {
    return pool
        .map((item) => {
            let count = 0;
            try {
                count = Number(countProducersByHomeCategory(item.category)) || 0;
            } catch {
                count = 0;
            }
            return { item, count };
        })
        .sort((a, b) => b.count - a.count || a.item.id.localeCompare(b.item.id))
        .map((row) => row.item);
}

/**
 * 5–8 wiadomości na dziś: sezon + kategorie, stałe w ciągu dnia.
 * @param {Date} [now]
 * @returns {LiveRegionItem[]}
 */
export function getTodayLiveRegionItems(now = new Date()) {
    const day = getLocalDayKey(now);
    const season = getCurrentSeason(now);
    const byId = new Map(LIVE_REGION_CATALOG.map((item) => [item.id, item]));

    const stored = readStored();
    if (stored?.day === day && stored.ids.length) {
        const restored = stored.ids.map((id) => byId.get(id)).filter(Boolean);
        if (restored.length >= PICK_MIN) return restored;
    }

    const pool = rankByLocalPresence(eligibleForSeason(season));
    const rand = mulberry32(`${day}|${season}|live-region`);
    const working = shuffleInPlace([...pool], rand);

    const target = PICK_MIN + Math.floor(rand() * (PICK_MAX - PICK_MIN + 1));
    const picked = [];
    const usedCategories = new Set();

    // Najpierw różnorodność kategorii
    for (const item of working) {
        if (picked.length >= target) break;
        if (usedCategories.has(item.category) && picked.length < Math.min(4, target)) continue;
        picked.push(item);
        usedCategories.add(item.category);
    }
    for (const item of working) {
        if (picked.length >= target) break;
        if (picked.some((p) => p.id === item.id)) continue;
        picked.push(item);
    }

    const ids = picked.map((item) => item.id);
    writeStored(day, ids);
    return picked;
}

export default {
    LIVE_REGION_CATALOG,
    getLocalDayKey,
    getTodayLiveRegionItems
};
