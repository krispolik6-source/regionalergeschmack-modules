// js/presentation/smartToday.js – ETAP 13C Inteligentne Polecenia (bez Store/API)
import { getCurrentSeason } from '../data/seasonCalendar.js';
import { getLocalDayKey } from '../data/liveRegion.js';
import { getLastPosition } from '../core/userLocation.js';
import { getDistanceKm } from '../data/producerHelpers.js';
import { getProducerById, getProducers } from '../data/dataService.js';
import { getContentProducerById } from '../data/contentProducers.js';
import { getProductImageUrl } from '../data/productImages.js';
import { featuredProducts } from '../data/products.js';
import { getProducerOpenStatus } from '../data/openingHours.js';
import { getProductAvailability } from './productAvailability.js';

const WEATHER_CACHE_KEY = 'rg_smart_today_weather_v1';
const PICK_LIMIT = 4;

/** @typedef {'hot'|'warm'|'mild'|'cool'|'cold'|'rain'} WeatherKind */
/** @typedef {'morning'|'midday'|'afternoon'|'evening'|'night'} DayPart */

/**
 * @typedef {{
 *   id: string,
 *   producerId: string,
 *   producerName?: string,
 *   price?: number,
 *   unit?: string,
 *   imageSlug: string,
 *   categoryKey: string,
 *   tags: string[],
 *   icon: string,
 *   isSampleImage?: boolean
 * }} SmartCandidate
 */

/** @type {readonly SmartCandidate[]} */
const CANDIDATE_POOL = Object.freeze([
    ...featuredProducts.map((p) => ({
        id: p.id,
        producerId: p.producerId,
        producerName: p.producerName,
        price: p.price,
        unit: p.unit,
        imageSlug: p.imageSlug,
        categoryKey: p.categoryKey,
        tags: [p.imageSlug, p.categoryKey, p.category].filter(Boolean),
        icon: p.icon,
        isSampleImage: p.isSampleImage
    }))
]);

/**
 * @param {Date} [now]
 * @returns {DayPart}
 */
export function getDayPart(now = new Date()) {
    const h = now.getHours();
    if (h >= 5 && h < 11) return 'morning';
    if (h >= 11 && h < 14) return 'midday';
    if (h >= 14 && h < 18) return 'afternoon';
    if (h >= 18 && h < 22) return 'evening';
    return 'night';
}

function dayHash(dayKey) {
    let h = 2166136261;
    for (let i = 0; i < dayKey.length; i += 1) {
        h ^= dayKey.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

/**
 * Proxy klimatu gdy brak API pogody.
 * @param {Date} [now]
 * @returns {{ kind: WeatherKind, source: 'proxy', tempC: number | null }}
 */
export function getClimateProxyWeather(now = new Date()) {
    const month = now.getMonth() + 1;
    const dayPart = getDayPart(now);
    const dayKey = getLocalDayKey(now);
    const rainy = dayHash(dayKey) % 7 === 0;

    if (rainy) {
        return { kind: 'rain', source: 'proxy', tempC: month >= 5 && month <= 9 ? 16 : 8 };
    }

    if (month >= 6 && month <= 8) {
        if (dayPart === 'midday' || dayPart === 'afternoon') {
            return { kind: 'hot', source: 'proxy', tempC: 28 };
        }
        return { kind: 'warm', source: 'proxy', tempC: 22 };
    }
    if (month >= 9 && month <= 11) {
        return { kind: month === 11 ? 'cool' : 'mild', source: 'proxy', tempC: month === 11 ? 7 : 14 };
    }
    if (month === 12 || month <= 2) {
        return { kind: 'cold', source: 'proxy', tempC: 2 };
    }
    return { kind: 'mild', source: 'proxy', tempC: 15 };
}

function readWeatherCache() {
    if (typeof localStorage === 'undefined') return null;
    try {
        const raw = localStorage.getItem(WEATHER_CACHE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data || data.day !== getLocalDayKey()) return null;
        if (!data.kind) return null;
        return data;
    } catch {
        return null;
    }
}

function writeWeatherCache(payload) {
    if (typeof localStorage === 'undefined') return;
    try {
        localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({
            day: getLocalDayKey(),
            ...payload
        }));
    } catch {
        /* ignore */
    }
}

/**
 * Mapuje temperaturę / kod pogody Open-Meteo → WeatherKind
 * @param {number} tempC
 * @param {number} weatherCode
 * @param {number} precip
 */
function classifyWeather(tempC, weatherCode, precip) {
    const code = Number(weatherCode) || 0;
    const rainCodes = new Set([51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99]);
    if (precip > 0.2 || rainCodes.has(code)) return 'rain';
    if (tempC >= 26) return 'hot';
    if (tempC >= 20) return 'warm';
    if (tempC >= 12) return 'mild';
    if (tempC >= 5) return 'cool';
    return 'cold';
}

/**
 * Lekki fetch Open-Meteo (bez klucza) – nie przechodzi przez Store.
 * @returns {Promise<boolean>} true jeśli cache się zmienił
 */
export async function refreshSmartTodayWeather() {
    const user = getLastPosition();
    if (!user || !Number.isFinite(user.lat) || !Number.isFinite(user.lng)) return false;

    const prev = readWeatherCache();
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${user.lat}&longitude=${user.lng}&current=temperature_2m,precipitation,weather_code&timezone=auto`;
        const res = await fetch(url, { credentials: 'omit' });
        if (!res.ok) return false;
        const json = await res.json();
        const cur = json?.current || {};
        const tempC = Number(cur.temperature_2m);
        const precip = Number(cur.precipitation) || 0;
        const code = Number(cur.weather_code);
        if (!Number.isFinite(tempC)) return false;
        const kind = classifyWeather(tempC, code, precip);
        const next = { kind, source: 'open-meteo', tempC };
        writeWeatherCache(next);
        return !prev || prev.kind !== kind || prev.tempC !== tempC;
    } catch {
        return false;
    }
}

/**
 * @param {Date} [now]
 */
export function getSmartTodayContext(now = new Date()) {
    const cached = readWeatherCache();
    const weather = cached?.kind
        ? { kind: cached.kind, source: cached.source || 'cache', tempC: cached.tempC ?? null }
        : getClimateProxyWeather(now);

    return {
        dayKey: getLocalDayKey(now),
        season: getCurrentSeason(now),
        dayPart: getDayPart(now),
        weather: weather.kind,
        weatherSource: weather.source,
        tempC: weather.tempC,
        user: getLastPosition()
    };
}

/**
 * Główny powód rekomendacji (i18n: smartToday.reason.*)
 * @param {ReturnType<typeof getSmartTodayContext>} ctx
 */
export function pickSmartTodayReason(ctx) {
    if (ctx.weather === 'rain') {
        return { id: 'rain', icon: '🌧' };
    }
    if (ctx.weather === 'hot') {
        return { id: 'hot', icon: '☀️' };
    }
    if (ctx.season === 'autumn' && (ctx.weather === 'cool' || ctx.weather === 'mild' || ctx.weather === 'cold')) {
        return { id: 'autumn', icon: '🍂' };
    }
    if (ctx.weather === 'cold' || (ctx.season === 'winter' && ctx.weather !== 'hot')) {
        return { id: 'cold', icon: '❄️' };
    }
    if (ctx.dayPart === 'morning') {
        return { id: 'morning', icon: '🌅' };
    }
    if (ctx.dayPart === 'evening' || ctx.dayPart === 'night') {
        return { id: 'evening', icon: '🌙' };
    }
    if (ctx.season === 'spring') {
        return { id: 'spring', icon: '🌸' };
    }
    if (ctx.season === 'summer') {
        return { id: 'summer', icon: '🌻' };
    }
    return { id: 'fresh', icon: '🌿' };
}

/** Preferowane tagi / slugi wg powodu */
const REASON_PREFS = Object.freeze({
    rain: ['bread', 'soup', 'pastries', 'daily-dish', 'honey'],
    hot: ['yogurt', 'juice', 'soft-drink', 'strawberries', 'ice'],
    autumn: ['apples', 'vegetables', 'honey', 'soup', 'sausage'],
    cold: ['soup', 'daily-dish', 'honey', 'cheese', 'bread'],
    morning: ['bread', 'eggs', 'yogurt', 'pastries', 'honey'],
    evening: ['daily-dish', 'soup', 'sausage', 'cheese'],
    spring: ['eggs', 'honey', 'vegetables', 'yogurt', 'strawberries'],
    summer: ['strawberries', 'juice', 'yogurt', 'honey', 'soft-drink'],
    fresh: ['bread', 'cheese', 'eggs', 'vegetables', 'honey']
});

function resolveProducer(candidate) {
    return getProducerById(candidate.producerId) || getContentProducerById(candidate.producerId) || null;
}

function candidateDistanceKm(candidate, user) {
    const producer = resolveProducer(candidate);
    if (user && producer && Number.isFinite(Number(producer.lat)) && Number.isFinite(Number(producer.lng))) {
        return getDistanceKm(user.lat, user.lng, Number(producer.lat), Number(producer.lng));
    }
    const feat = featuredProducts.find((p) => p.id === candidate.id);
    if (feat && Number.isFinite(feat.distanceKm)) return feat.distanceKm;
    return Infinity;
}

/**
 * @param {SmartCandidate} candidate
 * @param {ReturnType<typeof getSmartTodayContext>} ctx
 * @param {{ id: string }} reason
 */
function scoreCandidate(candidate, ctx, reason) {
    let score = 0;
    const prefs = REASON_PREFS[reason.id] || REASON_PREFS.fresh;
    const tags = new Set([...(candidate.tags || []), candidate.imageSlug].map((x) => String(x).toLowerCase()));

    prefs.forEach((pref, idx) => {
        if (tags.has(pref) || tags.has(String(pref).replace('-', ''))) {
            score += 40 - idx * 3;
        }
    });

    // Sezon
    if (ctx.season === 'autumn' && (tags.has('apples') || tags.has('vegetables') || tags.has('soup'))) score += 12;
    if (ctx.season === 'summer' && (tags.has('strawberries') || tags.has('juice') || tags.has('yogurt'))) score += 12;
    if (ctx.season === 'winter' && (tags.has('soup') || tags.has('honey') || tags.has('daily-dish'))) score += 12;
    if (ctx.season === 'spring' && (tags.has('eggs') || tags.has('honey') || tags.has('vegetables'))) score += 10;

    // Pora dnia
    if (ctx.dayPart === 'morning' && (tags.has('bread') || tags.has('eggs') || tags.has('pastries') || tags.has('yogurt'))) score += 14;
    if ((ctx.dayPart === 'evening' || ctx.dayPart === 'night') && (tags.has('daily-dish') || tags.has('soup') || tags.has('sausage'))) score += 14;
    if ((ctx.dayPart === 'midday' || ctx.dayPart === 'afternoon') && ctx.weather === 'hot' && (tags.has('juice') || tags.has('yogurt') || tags.has('soft-drink'))) score += 16;

    // Pogoda
    if (ctx.weather === 'rain' && (tags.has('bread') || tags.has('soup') || tags.has('pastries'))) score += 22;
    if (ctx.weather === 'hot' && (tags.has('yogurt') || tags.has('juice') || tags.has('soft-drink') || tags.has('strawberries'))) score += 22;
    if (ctx.weather === 'cold' && (tags.has('soup') || tags.has('honey') || tags.has('daily-dish'))) score += 18;

    const producer = resolveProducer(candidate);
    const open = producer ? getProducerOpenStatus(producer) : { known: false, isOpen: false };
    if (open.known && open.isOpen) score += 20;
    else if (open.known && !open.isOpen) score -= 25;

    const avail = getProductAvailability({ id: candidate.id, name: candidate.imageSlug });
    if (avail === 'available') score += 10;
    else if (avail === 'low') score += 4;
    else score -= 40;

    const dist = candidateDistanceKm(candidate, ctx.user);
    if (Number.isFinite(dist)) {
        score += Math.max(0, 28 - dist * 2.2);
    }

    // Lekki bonus jeśli producent jest w lokalnej puli
    try {
        const nearby = getProducers();
        if (Array.isArray(nearby) && nearby.some((p) => String(p.id) === String(candidate.producerId))) {
            score += 6;
        }
    } catch {
        /* ignore */
    }

    return score;
}

/**
 * @param {{ limit?: number, now?: Date }} [opts]
 */
export function getSmartTodayRecommendations(opts = {}) {
    const now = opts.now || new Date();
    const limit = opts.limit || PICK_LIMIT;
    const ctx = getSmartTodayContext(now);
    const reason = pickSmartTodayReason(ctx);

    const scored = CANDIDATE_POOL
        .map((candidate) => ({
            candidate,
            score: scoreCandidate(candidate, ctx, reason),
            distanceKm: candidateDistanceKm(candidate, ctx.user)
        }))
        .filter((row) => row.score > 0)
        .sort((a, b) => b.score - a.score || a.distanceKm - b.distanceKm);

    const seen = new Set();
    const products = [];
    for (const row of scored) {
        if (products.length >= limit) break;
        if (seen.has(row.candidate.imageSlug)) continue;
        seen.add(row.candidate.imageSlug);
        products.push({
            ...row.candidate,
            imageUrl: getProductImageUrl(row.candidate.imageSlug),
            distanceKm: Number.isFinite(row.distanceKm) ? row.distanceKm : null,
            score: row.score,
            category: row.candidate.categoryKey
        });
    }

    return { ctx, reason, products };
}

/**
 * @param {string} id
 * @returns {SmartCandidate | undefined}
 */
export function getSmartTodayCandidateById(id) {
    return CANDIDATE_POOL.find((p) => p.id === id);
}

export default {
    getDayPart,
    getClimateProxyWeather,
    refreshSmartTodayWeather,
    getSmartTodayContext,
    pickSmartTodayReason,
    getSmartTodayRecommendations,
    getSmartTodayCandidateById
};
