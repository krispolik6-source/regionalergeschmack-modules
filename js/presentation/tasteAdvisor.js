// js/presentation/tasteAdvisor.js – ETAP 14 Osobisty Doradca Smaku (prezentacja)
import { getCurrentUser } from '../auth/auth.js';
import { getUserHistory } from '../core/userHistory.js';
import { getLastPosition } from '../core/userLocation.js';
import { getDistanceKm } from '../data/producerHelpers.js';
import { getProducerById, getProducers } from '../data/dataService.js';
import { filterProducersByCategory } from '../data/producerHelpers.js';
import { getContentProducerById } from '../data/contentProducers.js';
import { getLocalDayKey } from '../data/liveRegion.js';
import { getProducerOpenStatus } from '../data/openingHours.js';
import { getSmartTodayContext } from './smartToday.js';
import { t, getCurrentLanguage } from '../core/i18n.js';

const FIRST_SEEN_KEY = 'rg_taste_advisor_first_seen_v1';
const DAY_BRIEF_KEY = 'rg_taste_advisor_day_v1';
const MIN_DAYS = 2;
const MIN_VIEWS = 3;

function ensureFirstSeen() {
    try {
        const existing = localStorage.getItem(FIRST_SEEN_KEY);
        if (existing) return Number(existing) || Date.now();
        const history = getUserHistory();
        const stamps = [
            ...(history.viewed || []).map((x) => Number(x.at) || 0),
            ...(history.visited || []).map((x) => Number(x.at) || 0),
            ...(history.searched || []).map((x) => Number(x.at) || 0)
        ].filter((n) => n > 0);
        const first = stamps.length ? Math.min(...stamps) : Date.now();
        localStorage.setItem(FIRST_SEEN_KEY, String(first));
        return first;
    } catch {
        return Date.now();
    }
}

function daysSince(ts) {
    return Math.floor((Date.now() - Number(ts || Date.now())) / 86400000);
}

function dayBriefStorageKey(lang = getCurrentLanguage()) {
    return `${DAY_BRIEF_KEY}:${lang}`;
}

function readDayBrief() {
    try {
        const raw = localStorage.getItem(dayBriefStorageKey());
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (data?.day === getLocalDayKey() && data?.lang === getCurrentLanguage()) return data;
    } catch {
        /* ignore */
    }
    return null;
}

function writeDayBrief(payload) {
    try {
        localStorage.setItem(dayBriefStorageKey(), JSON.stringify({
            day: getLocalDayKey(),
            lang: getCurrentLanguage(),
            ...payload
        }));
        // Usuń legacy cache bez języka (mieszane DE/PL po zmianie UI)
        localStorage.removeItem(DAY_BRIEF_KEY);
    } catch {
        /* ignore */
    }
}

/** Po zmianie języka – wymuś nowy briefing w aktualnym UI */
export function invalidateTasteAdvisorDayCache() {
    try {
        if (typeof localStorage === 'undefined') return;
        for (const key of Object.keys(localStorage)) {
            if (key === DAY_BRIEF_KEY || key.startsWith(`${DAY_BRIEF_KEY}:`)) {
                localStorage.removeItem(key);
            }
        }
    } catch {
        /* ignore */
    }
}

/**
 * @param {string | null | undefined} displayName
 */
export function getAdvisorFirstName(displayName) {
    const raw = String(displayName || '').trim();
    if (!raw) return '';
    const first = raw.split(/\s+/)[0];
    return first.length > 1 ? first : raw;
}

function resolveProducer(id) {
    return getProducerById(id) || getContentProducerById(id) || null;
}

function producerCategoryKey(producer) {
    const c = String(producer?.category || producer?.type || '').toLowerCase();
    if (c.includes('honey') || c.includes('imker')) return 'honey';
    if (c.includes('bakery') || c.includes('bäck') || c.includes('baeck')) return 'bakeries';
    if (c.includes('farm') || c.includes('bauer') || c.includes('hof')) return 'farmers';
    if (c.includes('meat') || c.includes('metz')) return 'meat';
    if (c.includes('restaurant') || c.includes('gasth')) return 'restaurants';
    if (c.includes('shop') || c.includes('laden')) return 'shops';
    if (c.includes('vend')) return 'vending';
    return c || 'other';
}

function isHoneyish(producer, meta = {}) {
    const blob = [
        producer?.name,
        producer?.description,
        producer?.category,
        meta?.name,
        meta?.category,
        ...(producer?.products || []).map((p) => `${p.name || ''} ${p.id || ''}`)
    ].join(' ').toLowerCase();
    return /honey|honig|miód|мед|imker|pasiek|bee/.test(blob)
        || producerCategoryKey(producer) === 'honey';
}

function isBakery(producer) {
    const key = producerCategoryKey(producer);
    if (key === 'bakeries') return true;
    const blob = `${producer?.name || ''} ${producer?.category || ''}`.toLowerCase();
    return /bäck|baeck|bakery|piekarn|пекар/.test(blob);
}

function whenLabel(at) {
    const days = daysSince(at);
    if (days >= 25 && days <= 45) return 'lastMonth';
    if (days >= 7 && days < 25) return 'weeksAgo';
    if (days >= 2) return 'recently';
    return 'recently';
}

/**
 * Czy doradca już „zna” użytkownika wystarczająco.
 */
export function isTasteAdvisorReady() {
    ensureFirstSeen();
    const first = Number(localStorage.getItem(FIRST_SEEN_KEY) || Date.now());
    const history = getUserHistory();
    const views = (history.viewed || []).length;
    const visited = (history.visited || []).length;
    const days = daysSince(first);
    return days >= MIN_DAYS || views >= MIN_VIEWS || visited >= 2;
}

function pickRevisitedHoney(history) {
    const pool = [...(history.visited || []), ...(history.viewed || [])];
    const monthAgo = Date.now() - 45 * 86400000;
    const weekAgo = Date.now() - 7 * 86400000;

    const scored = pool
        .map((entry) => {
            const producer = resolveProducer(entry.id);
            if (!producer || !isHoneyish(producer, entry)) return null;
            const at = Number(entry.at) || 0;
            // Preferuj wizyty sprzed ~miesiąca, ale akceptuj starsze / nowsze
            let score = 10;
            if (at > 0 && at < weekAgo) score += 20;
            if (at > 0 && at < monthAgo + 10 * 86400000 && at > monthAgo - 20 * 86400000) score += 30;
            return { producer, at, score };
        })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score);

    return scored[0] || null;
}

function pickFreshBakery(user) {
    let list = [];
    try {
        list = filterProducersByCategory(getProducers(), 'bakeries') || [];
    } catch {
        list = [];
    }
    if (!list.length) {
        list = (getProducers() || []).filter((p) => isBakery(p));
    }

    return list
        .map((producer) => {
            const open = getProducerOpenStatus(producer);
            let score = 0;
            if (open.known && open.isOpen) score += 25;
            if (user && Number.isFinite(producer.lat) && Number.isFinite(producer.lng)) {
                const d = getDistanceKm(user.lat, user.lng, Number(producer.lat), Number(producer.lng));
                if (Number.isFinite(d)) score += Math.max(0, 30 - d * 2);
            }
            return { producer, score };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)[0] || null;
}

function pickFarmRoute(user, history) {
    let farmers = [];
    try {
        farmers = filterProducersByCategory(getProducers(), 'farmers') || [];
    } catch {
        farmers = [];
    }

    const visitedIds = new Set([
        ...(history.visited || []).map((x) => String(x.id)),
        ...(history.viewed || []).map((x) => String(x.id))
    ]);

    const ranked = farmers
        .map((producer) => {
            let score = visitedIds.has(String(producer.id)) ? 12 : 0;
            if (user && Number.isFinite(producer.lat) && Number.isFinite(producer.lng)) {
                const d = getDistanceKm(user.lat, user.lng, Number(producer.lat), Number(producer.lng));
                if (Number.isFinite(d)) score += Math.max(0, 28 - d * 1.8);
            }
            const open = getProducerOpenStatus(producer);
            if (open.known && open.isOpen) score += 8;
            return { producer, score };
        })
        .filter((x) => x.score > 5)
        .sort((a, b) => b.score - a.score);

    const picks = ranked.slice(0, 3).map((x) => x.producer);
    return picks.length >= 2 ? picks : [];
}

function weatherSupportsBike(ctx) {
    return ['hot', 'warm', 'mild'].includes(ctx.weather) && ctx.weather !== 'rain';
}

function fill(template, vars) {
    return String(template || '').replace(/\{(\w+)\}/g, (_, key) => (
        vars[key] != null ? String(vars[key]) : `{${key}}`
    ));
}

/**
 * Buduje dzienny briefing osobisty.
 * @returns {{ ready: boolean, paragraphs: string[], actions: object[], firstName: string } | null}
 */
export function getTasteAdvisorBriefing() {
    ensureFirstSeen();
    if (!isTasteAdvisorReady()) {
        return { ready: false, paragraphs: [], actions: [], firstName: '' };
    }

    const cached = readDayBrief();
    if (cached?.paragraphs?.length) {
        return {
            ready: true,
            paragraphs: cached.paragraphs,
            actions: cached.actions || [],
            firstName: cached.firstName || ''
        };
    }

    const user = getCurrentUser();
    const firstName = getAdvisorFirstName(user?.displayName);
    const history = getUserHistory();
    const pos = getLastPosition();
    const ctx = getSmartTodayContext();

    const paragraphs = [];
    const actions = [];

    const helloKey = firstName ? 'tasteAdvisor.helloNamed' : 'tasteAdvisor.hello';
    paragraphs.push(fill(t(helloKey), { name: firstName }));

    const honey = pickRevisitedHoney(history);
    if (honey) {
        const whenKey = whenLabel(honey.at);
        paragraphs.push(fill(t('tasteAdvisor.honeyVisit'), {
            place: honey.producer.name || t('producer.types.farmer'),
            when: t(`tasteAdvisor.when.${whenKey}`)
        }));
        actions.push({
            type: 'producer',
            producerId: String(honey.producer.id),
            labelKey: 'tasteAdvisor.ctaHoney'
        });
    }

    const bakery = pickFreshBakery(pos);
    if (bakery) {
        paragraphs.push(fill(t('tasteAdvisor.bakeryFresh'), {
            place: bakery.producer.name || t('categories.bakeries.name')
        }));
        if (!actions.some((a) => a.producerId === String(bakery.producer.id))) {
            actions.push({
                type: 'producer',
                producerId: String(bakery.producer.id),
                labelKey: 'tasteAdvisor.ctaBakery'
            });
        }
    }

    const farms = pickFarmRoute(pos, history);
    if (weatherSupportsBike(ctx) && farms.length >= 2) {
        paragraphs.push(fill(t('tasteAdvisor.bikeRoute'), {
            count: String(Math.min(3, farms.length))
        }));
        actions.push({
            type: 'mapFarms',
            producerIds: farms.map((p) => String(p.id)),
            labelKey: 'tasteAdvisor.ctaRoute'
        });
    } else if (paragraphs.length < 3) {
        paragraphs.push(t('tasteAdvisor.freshLocal'));
        actions.push({
            type: 'map',
            labelKey: 'tasteAdvisor.ctaExplore'
        });
    }

    // Max 4 zdania – przewodnik, nie esej
    const brief = {
        ready: true,
        firstName,
        paragraphs: paragraphs.slice(0, 4),
        actions: actions.slice(0, 3)
    };
    writeDayBrief(brief);
    return brief;
}

export default {
    getAdvisorFirstName,
    isTasteAdvisorReady,
    getTasteAdvisorBriefing
};
