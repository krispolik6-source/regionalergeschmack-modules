/**
 * ETAP 29B – Regional Intelligence (browser)
 * Gospodarz regionu: jedna krótka rekomendacja na dzień.
 * Nie chatbot · nie AI Assistant · bez reklam · bez sprzedaży.
 */
import { getLastPosition } from '../core/userLocation.js';
import { getUserHistory } from '../core/userHistory.js';
import { getProducers } from '../data/dataService.js';
import { filterProducersByCategory, getDistanceKm } from '../data/producerHelpers.js';
import { getProducerOpenStatus } from '../data/openingHours.js';
import { featuredProducts } from '../data/products.js';
import { getProductAvailability } from './productAvailability.js';
import { getSmartTodayContext } from './smartToday.js';
import { buildHistoryAffinity } from './livingRegion.js';
import { t } from '../core/i18n.js';
import {
    POLICY,
    REGIONAL_TIPS,
    isTipEligible,
    scoreTip,
    regionalReportToMarkdown,
    buildProxyContext
} from '../diagnostics/regionalIntelligenceCore.js';

const STORAGE_KEY = 'rg_regional_intel_day_v1';

export { POLICY, REGIONAL_TIPS, regionalReportToMarkdown };

function readStored() {
    if (typeof localStorage === 'undefined') return null;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data || typeof data.day !== 'string' || !data.id) return null;
        return data;
    } catch {
        return null;
    }
}

function writeStored(day, id) {
    if (typeof localStorage === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ day, id }));
    } catch {
        /* ignore */
    }
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

function nearestOpenKm(homeCategoryId, user) {
    if (!user || !Number.isFinite(user.lat)) return null;
    try {
        const list = filterProducersByCategory(getProducers() || [], homeCategoryId) || [];
        let best = Infinity;
        for (const p of list) {
            const open = getProducerOpenStatus(p);
            if (!(open.known && open.isOpen)) continue;
            if (!Number.isFinite(Number(p.lat)) || !Number.isFinite(Number(p.lng))) continue;
            const km = getDistanceKm(user.lat, user.lng, Number(p.lat), Number(p.lng));
            if (km < best) best = km;
        }
        return Number.isFinite(best) ? best : null;
    } catch {
        return null;
    }
}

function availabilityBoost(tags = []) {
    if (!tags.length) return 0;
    let boost = 0;
    for (const product of featuredProducts || []) {
        const blob = [product.imageSlug, product.categoryKey, product.category, product.id]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
        const hit = tags.some((tag) => blob.includes(String(tag).toLowerCase()));
        if (!hit) continue;
        const status = getProductAvailability(product);
        if (status === 'available') boost += 10;
        else if (status === 'low') boost += 4;
        else if (status === 'soldout') boost -= 14;
    }
    return boost;
}

function locationBoostForTip(tip, nearestKmByCategory) {
    if (!tip.needsOpen) return 0;
    const km = nearestKmByCategory?.[tip.needsOpen];
    if (typeof km !== 'number') return 0;
    if (km <= 8) return 12;
    if (km <= 20) return 6;
    return 0;
}

export function buildRegionalContext(now = new Date()) {
    const smart = getSmartTodayContext(now);
    const user = smart.user || getLastPosition();
    const openCounts = {
        bakeries: countOpenInCategory('bakeries'),
        farmers: countOpenInCategory('farmers'),
        shops: countOpenInCategory('shops'),
        meat: countOpenInCategory('meat')
    };
    const nearestKmByCategory = {
        bakeries: nearestOpenKm('bakeries', user),
        farmers: nearestOpenKm('farmers', user),
        shops: nearestOpenKm('shops', user),
        meat: nearestOpenKm('meat', user)
    };

    return {
        ...buildProxyContext(now, {
            dayKey: smart.dayKey,
            dayPart: smart.dayPart,
            weather: smart.weather,
            weatherSource: smart.weatherSource,
            season: smart.season,
            hasLocation: Boolean(user && Number.isFinite(user.lat)),
            openCounts
        }),
        user,
        nearestKmByCategory
    };
}

/**
 * Jedna główna rekomendacja gospodarza na dzień.
 * @param {Date} [now]
 */
export function getRegionalIntelligence(now = new Date()) {
    const ctx = buildRegionalContext(now);
    const stored = readStored();
    const cacheId = stored?.day === ctx.dayKey ? stored.id : null;
    const affinity = buildHistoryAffinity(getUserHistory());

    let tip = null;
    let score = 0;
    let fromCache = false;

    if (cacheId) {
        const cached = REGIONAL_TIPS.find((x) => x.id === cacheId);
        if (cached) {
            tip = cached;
            score = scoreTip(cached, ctx, affinity, { openCounts: ctx.openCounts });
            fromCache = true;
        }
    }

    if (!tip) {
        const ranked = REGIONAL_TIPS
            .filter((candidate) => isTipEligible(candidate, ctx))
            .map((candidate) => ({
                tip: candidate,
                score: scoreTip(candidate, ctx, affinity, {
                    openCounts: ctx.openCounts,
                    availabilityBoost: availabilityBoost(candidate.productTags || []),
                    locationBoost: locationBoostForTip(candidate, ctx.nearestKmByCategory)
                })
            }))
            .sort((a, b) => b.score - a.score || a.tip.id.localeCompare(b.tip.id));

        tip = ranked[0]?.tip || REGIONAL_TIPS.find((x) => x.id === 'hostDefault');
        score = ranked[0]?.score || 0;
        fromCache = false;
    }

    if (!tip) return null;

    const headline = t(`regionalIntel.tips.${tip.id}.headline`);
    const support = t(`regionalIntel.tips.${tip.id}.support`);
    if (!headline || headline === `regionalIntel.tips.${tip.id}.headline`) return null;

    if (!fromCache) writeStored(ctx.dayKey, tip.id);

    const recommendation = {
        id: tip.id,
        icon: tip.icon,
        headline,
        support: support && support !== `regionalIntel.tips.${tip.id}.support` ? support : '',
        category: tip.category || 'farmers',
        dayKey: ctx.dayKey,
        score,
        fromCache,
        signals: {
            weather: ctx.weather,
            weatherSource: ctx.weatherSource,
            season: ctx.season,
            dayPart: ctx.dayPart,
            weekday: ctx.weekday,
            hasLocation: ctx.hasLocation,
            openCounts: ctx.openCounts
        }
    };

    return {
        policy: { ...POLICY },
        dayKey: ctx.dayKey,
        recommendation,
        recommendations: [recommendation].slice(0, POLICY.maxMainRecommendations)
    };
}

export default {
    POLICY,
    REGIONAL_TIPS,
    getRegionalIntelligence,
    buildRegionalContext,
    regionalReportToMarkdown
};
