/**
 * Living Region Engine — wyłącznie dostawca danych.
 *
 * Nie renderuje HTML · nie zna CSS · nie zna widoków / Home.
 * Opcjonalny: CONFIG.LIVING_REGION_ENGINE / localStorage.rg_living_region_engine
 */

import { getFavoriteIds } from '../core/favoritesStore.js';
import { getRecentlyViewedIds } from '../core/userHistory.js';
import { getProducerById } from '../data/dataService.js';
import { getLearningModel } from '../presentation/learningEngine.js';
import {
    MAX_HIGHLIGHTS,
    DEFAULT_RADIUS_KM,
    readConfigEnabled
} from './config.js';
import {
    dayKey,
    dataFingerprint,
    readDayCache,
    writeDayCache,
    clearDayCache
} from './cache.js';
import { resolvePool } from './sources/pool.js';
import { getProducerOfDay } from './sources/producerOfDay.js';
import { getSeasonalProducts as seasonalSource } from './sources/seasonal.js';
import { getNewProducers as newcomersSource } from './sources/newcomers.js';
import { getOpenNow as openNowSource } from './sources/openNow.js';
import { getChangesSinceLastVisit as visitDeltaSource } from './sources/visitDelta.js';

/** @type {boolean | null} */
let runtimeEnabled = null;

/**
 * @param {{ enabled?: boolean }} [options]
 */
export function initLivingRegion(options = {}) {
    if (typeof options.enabled === 'boolean') {
        runtimeEnabled = options.enabled;
    } else if (runtimeEnabled === null) {
        runtimeEnabled = readConfigEnabled();
    }
    return { enabled: isLivingRegionEnabled() };
}

export function isLivingRegionEnabled() {
    if (runtimeEnabled === false) return false;
    if (runtimeEnabled === true) return readConfigEnabled();
    return readConfigEnabled();
}

/**
 * @param {object} [ctx]
 */
function buildContext(ctx = {}) {
    const now = ctx.now instanceof Date ? ctx.now : new Date();
    const dk = ctx.dayKey || dayKey(now);
    const favoriteIds = ctx.favoriteIds || getFavoriteIds();
    const recentlyViewedIds = ctx.recentlyViewedIds || getRecentlyViewedIds(12);

    let favoriteCategories = ctx.favoriteCategories;
    if (!favoriteCategories) {
        const cats = new Set();
        try {
            const model = getLearningModel?.();
            for (const c of model?.affinity?.topCategories || []) {
                if (c?.id) cats.add(String(c.id).toLowerCase());
            }
        } catch {
            /* optional */
        }
        for (const id of recentlyViewedIds.slice(0, 8)) {
            try {
                const p = getProducerById?.(id);
                if (p?.category) cats.add(String(p.category).toLowerCase());
            } catch {
                /* ignore */
            }
        }
        favoriteCategories = [...cats];
    }

    const poolInfo = resolvePool(ctx);
    return {
        ...ctx,
        now,
        dayKey: dk,
        favoriteIds,
        recentlyViewedIds,
        favoriteCategories,
        user: ctx.user !== undefined ? ctx.user : poolInfo.user,
        radiusKm: ctx.radiusKm || poolInfo.radiusKm || DEFAULT_RADIUS_KM,
        producers: ctx.producers || poolInfo.all,
        _pool: poolInfo.pool
    };
}

/**
 * @param {object} sourceResult
 * @param {number} [rank]
 */
function toHighlight(sourceResult, rank = 0) {
    if (!sourceResult?.kind) return null;
    const kind = sourceResult.kind;
    const payload = { ...sourceResult };
    delete payload.kind;
    delete payload.score;
    return {
        id: `${kind}:${payload.producerId || payload.seasonId || 'batch'}`,
        kind,
        rank,
        score: Number(sourceResult.score) || 0,
        payload
    };
}

/**
 * Agregat dnia — cache po dayKey + fingerprint puli.
 * @param {object} [ctx]
 */
export function getTodayHighlights(ctx = {}) {
    if (!isLivingRegionEnabled()) {
        return {
            enabled: false,
            dayKey: dayKey(ctx.now || new Date()),
            generatedAt: Date.now(),
            items: [],
            cache: 'disabled'
        };
    }

    const full = buildContext(ctx);
    const ids = (full._pool || []).map((p) => String(p.id));
    const fp = dataFingerprint(ids, full.radiusKm);
    const cached = readDayCache();

    if (
        cached
        && cached.dayKey === full.dayKey
        && cached.fingerprint === fp
        && Array.isArray(cached.items)
    ) {
        return {
            enabled: true,
            dayKey: full.dayKey,
            generatedAt: cached.generatedAt || Date.now(),
            items: cached.items,
            cache: 'hit'
        };
    }

    const candidates = [];

    const pod = getProducerOfDay(full);
    if (pod) candidates.push(toHighlight(pod));

    const seasonal = seasonalSource(full);
    if (seasonal.score > 0) candidates.push(toHighlight(seasonal));

    const newcomers = newcomersSource(full);
    if (!newcomers.firstBaseline && newcomers.score > 0) {
        candidates.push(toHighlight(newcomers));
    }

    const open = openNowSource(full);
    if (open.producerIds?.length) candidates.push(toHighlight(open));

    const delta = visitDeltaSource(full);
    if (!delta.firstVisit && delta.score > 0) {
        candidates.push(toHighlight(delta));
    }

    const items = candidates
        .filter(Boolean)
        .sort((a, b) => b.score - a.score || a.kind.localeCompare(b.kind))
        .slice(0, MAX_HIGHLIGHTS)
        .map((item, index) => ({ ...item, rank: index + 1 }));

    const generatedAt = Date.now();
    writeDayCache({
        dayKey: full.dayKey,
        fingerprint: fp,
        generatedAt,
        items
    });

    return {
        enabled: true,
        dayKey: full.dayKey,
        generatedAt,
        items,
        cache: 'miss'
    };
}

/** @param {object} [ctx] */
export function getSeasonalProducts(ctx = {}) {
    if (!isLivingRegionEnabled()) {
        return { kind: 'seasonal', seasonId: '', items: [], productRefs: [], score: 0, enabled: false };
    }
    return { ...seasonalSource(buildContext(ctx)), enabled: true };
}

/** @param {object} [ctx] */
export function getNewProducers(ctx = {}) {
    if (!isLivingRegionEnabled()) {
        return {
            kind: 'newProducers',
            producerIds: [],
            productRefs: [],
            firstBaseline: true,
            score: 0,
            enabled: false
        };
    }
    return { ...newcomersSource(buildContext(ctx)), enabled: true };
}

/** @param {object} [ctx] */
export function getOpenNow(ctx = {}) {
    if (!isLivingRegionEnabled()) {
        return { kind: 'openNow', producerIds: [], score: 0, enabled: false };
    }
    return { ...openNowSource(buildContext(ctx)), enabled: true };
}

/** @param {object} [ctx] */
export function getChangesSinceLastVisit(ctx = {}) {
    if (!isLivingRegionEnabled()) {
        return {
            kind: 'visitDelta',
            firstVisit: true,
            newProducerIds: [],
            newPromoProducerIds: [],
            removedCount: 0,
            score: 0,
            enabled: false
        };
    }
    return { ...visitDeltaSource(buildContext(ctx)), enabled: true };
}

/** Test / diagnostyka — czyści cache dnia (nie czyści known/visit). */
export function invalidateLivingRegionCache() {
    clearDayCache();
}

export default {
    initLivingRegion,
    isLivingRegionEnabled,
    getTodayHighlights,
    getSeasonalProducts,
    getNewProducers,
    getOpenNow,
    getChangesSinceLastVisit,
    invalidateLivingRegionCache
};
