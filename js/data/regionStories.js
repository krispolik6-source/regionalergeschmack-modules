// js/data/regionStories.js – ETAP 13D Opowieści Regionu (jedna historia / dzień)
import { getLocalDayKey } from './liveRegion.js';

const STORAGE_KEY = 'rg_region_story_day_v1';
/** Nie powtarzaj historii przez tyle dni */
export const COOLDOWN_DAYS = 14;

/**
 * @typedef {{ id: string, icon: string, theme: 'producer'|'tradition'|'product'|'custom'|'place' }} RegionStoryMeta
 */

/** @type {readonly RegionStoryMeta[]} */
export const REGION_STORY_CATALOG = Object.freeze([
    { id: 'orchardDawn', icon: '🍎', theme: 'producer' },
    { id: 'sourdoughNight', icon: '🥖', theme: 'tradition' },
    { id: 'honeyMeadow', icon: '🐝', theme: 'product' },
    { id: 'marketMorning', icon: '🧺', theme: 'custom' },
    { id: 'millstonePath', icon: '🛤️', theme: 'place' },
    { id: 'cheeseCellar', icon: '🧀', theme: 'tradition' },
    { id: 'harvestWreath', icon: '🌾', theme: 'custom' },
    { id: 'smokehouseTale', icon: '🔥', theme: 'producer' },
    { id: 'villageWell', icon: '💧', theme: 'place' },
    { id: 'plumJamDay', icon: '🫙', theme: 'product' },
    { id: 'shepherdTrail', icon: '🐑', theme: 'tradition' },
    { id: 'oakBenchSquare', icon: '🌳', theme: 'place' },
    { id: 'asparagusDawn', icon: '🌱', theme: 'product' },
    { id: 'winterBread', icon: '❄️', theme: 'custom' },
    { id: 'riverMill', icon: '⚙️', theme: 'place' },
    { id: 'herbGarden', icon: '🌿', theme: 'producer' }
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

function readStore() {
    if (typeof localStorage === 'undefined') return null;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data || typeof data !== 'object') return null;
        return data;
    } catch {
        return null;
    }
}

function writeStore(data) {
    if (typeof localStorage === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
        /* ignore */
    }
}

/**
 * @param {Date} [now]
 * @returns {RegionStoryMeta}
 */
export function getTodayRegionStory(now = new Date()) {
    const day = getLocalDayKey(now);
    const byId = new Map(REGION_STORY_CATALOG.map((s) => [s.id, s]));
    const store = readStore() || { day: '', id: '', recent: [] };

    if (store.day === day && store.id && byId.has(store.id)) {
        return byId.get(store.id);
    }

    const recent = Array.isArray(store.recent) ? store.recent.map(String) : [];
    const blocked = new Set(recent.slice(-COOLDOWN_DAYS));
    let pool = REGION_STORY_CATALOG.filter((s) => !blocked.has(s.id));
    if (!pool.length) pool = [...REGION_STORY_CATALOG];

    const rand = mulberry32(`${day}|region-story`);
    const pick = pool[Math.floor(rand() * pool.length)] || REGION_STORY_CATALOG[0];

    const nextRecent = [...recent.filter((id) => id !== pick.id), pick.id].slice(-COOLDOWN_DAYS);
    writeStore({ day, id: pick.id, recent: nextRecent });
    return pick;
}

export default {
    REGION_STORY_CATALOG,
    getTodayRegionStory,
    COOLDOWN_DAYS
};
