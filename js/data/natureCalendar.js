// js/data/natureCalendar.js – ETAP 13B Kalendarz Natury (prezentacja, bez Store/API)
import { getLocalDayKey } from './liveRegion.js';

const STORAGE_KEY = 'rg_nature_calendar_day_v1';
const PICK_MIN = 1;
const PICK_MAX = 2;

/**
 * @typedef {{ id: string, months: number[], icon: string }} NatureMoment
 */

/** Etapy roku według miesiąca (1–12). */
/** @type {readonly NatureMoment[]} */
export const NATURE_CALENDAR_CATALOG = Object.freeze([
    { id: 'snowdrops', months: [1, 2], icon: '🤍' },
    { id: 'willowCatkins', months: [2, 3], icon: '🌿' },
    { id: 'firstBlossoms', months: [3, 4], icon: '🌼' },
    { id: 'appleBlossom', months: [4, 5], icon: '🌸' },
    { id: 'beesNectar', months: [5, 6, 7], icon: '🐝' },
    { id: 'elderflower', months: [5, 6], icon: '⚪' },
    { id: 'strawberryRipen', months: [5, 6], icon: '🍓' },
    { id: 'lindenBloom', months: [6, 7], icon: '🌳' },
    { id: 'harvestStart', months: [7, 8], icon: '🌾' },
    { id: 'chanterelle', months: [7, 8, 9], icon: '🍄' },
    { id: 'sunflowerPeak', months: [7, 8], icon: '🌻' },
    { id: 'appleHarvest', months: [9, 10], icon: '🍎' },
    { id: 'grapeHarvest', months: [9, 10], icon: '🍇' },
    { id: 'chestnuts', months: [9, 10], icon: '🌰' },
    { id: 'autumnLeaves', months: [10, 11], icon: '🍂' },
    { id: 'firstFrost', months: [11, 12], icon: '❄️' },
    { id: 'winterQuiet', months: [12, 1], icon: '🌲' }
]);

/**
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
        /* ignore */
    }
}

/**
 * @param {Date} [now]
 * @returns {NatureMoment[]}
 */
export function getTodayNatureMoments(now = new Date()) {
    const day = getLocalDayKey(now);
    const month = now.getMonth() + 1;
    const byId = new Map(NATURE_CALENDAR_CATALOG.map((item) => [item.id, item]));

    const stored = readStored();
    if (stored?.day === day && stored.ids.length) {
        const restored = stored.ids.map((id) => byId.get(id)).filter(Boolean);
        if (restored.length >= PICK_MIN) return restored.slice(0, PICK_MAX);
    }

    let pool = NATURE_CALENDAR_CATALOG.filter((item) => item.months.includes(month));
    if (!pool.length) {
        pool = [...NATURE_CALENDAR_CATALOG];
    }

    const rand = mulberry32(`${day}|m${month}|nature`);
    const working = shuffleInPlace([...pool], rand);
    const count = PICK_MIN + Math.floor(rand() * (PICK_MAX - PICK_MIN + 1));
    const picked = working.slice(0, count);

    writeStored(day, picked.map((item) => item.id));
    return picked;
}

export default {
    NATURE_CALENDAR_CATALOG,
    getTodayNatureMoments
};
