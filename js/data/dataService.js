// js/data/dataService.js – łączenie OSM + GovData, cache, rejestr producentów

import { CONFIG } from '../config.js';
import { eventBus } from '../core/eventBus.js';
import { EVENTS } from '../core/events.js';
import { t } from '../core/i18n.js';
import {
    fetchProducers as fetchOsmProducers,
    abortInflightOsmRequests,
    isOsmAbortError
} from './osmService.js?v=10';
import { fetchGovData } from './govDataService.js';
import {
    dedupeProducers,
    HOME_CATEGORY_MAP,
    filterProducersByCategory,
    countProducersByHomeCategory,
    getGoogleMapsDirectionsUrl,
    getDistanceKm,
    getProducersInRadius,
    normalizeProducerCategory
} from './producerHelpers.js';
import { enrichProducersWithProducts, enrichProducerWithProducts } from './producerProducts.js';
import { getRegisteredUserProducers } from './userProducerStore.js';
import { getContentProducerById, getContentProducers } from './contentProducers.js';
import { isCacheNearLocation } from '../core/userLocation.js';
import { logMapDriveDiag } from '../core/logger.js';

const CACHE_KEY = 'rg_producers_data_v9';
const LEGACY_CACHE_KEYS = Object.freeze([
    'rg_producers_data_v2',
    'rg_producers_data_v3',
    'rg_producers_data_v4',
    'rg_producers_data_v5',
    'rg_producers_data_v6',
    'rg_producers_data_v7',
    'rg_producers_data_v8'
]);
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Usuwa stare klucze cache producentów (v2/v3) – wymusza świeże dane po aktualizacji. */
export function clearLegacyProducerCaches() {
    if (typeof localStorage === 'undefined') return;
    for (const key of LEGACY_CACHE_KEYS) {
        try {
            localStorage.removeItem(key);
        } catch (_) {
            /* ignore */
        }
    }
}

clearLegacyProducerCaches();

/** GovData WFS (Open.NRW) – wyłącz, jeśli CORS/proxy niedostępne; OSM pozostaje głównym źródłem. */
export const ENABLE_GOVDATA = CONFIG.ENABLE_GOVDATA !== false;

let producersRegistry = [];
/** Jedna aktywna sesja sieciowa; kolejne żądania czekają / zastępują kolejkę */
let activeLoad = null;
let queuedLoad = null;
/** Tylko wynik o najwyższym epoch może zapisać registry (race-safe) */
let registryEpoch = 0;
let lastLoadMeta = {
    source: 'none',
    fromCache: false,
    apiFailed: false,
    loadedAt: 0
};

/**
 * Anuluje pending OSM + unieważnia bieżący epoch rejestru (race-safe przy pauzie mapy / odświeżeniu).
 * Stare catch nie mogą zapisać stale-cache do registry.
 */
export function abortPendingDataLoads() {
    registryEpoch += 1;
    logMapDriveDiag('data_load_abort', { registryEpoch });
    abortInflightOsmRequests();
}

function buildAbortedLoadResult() {
    return {
        producers: getProducers(),
        fromCache: lastLoadMeta.fromCache,
        apiFailed: lastLoadMeta.apiFailed,
        source: 'aborted',
        stale: true,
        aborted: true
    };
}

if (typeof window !== 'undefined') {
    const onPageExit = () => {
        try {
            abortPendingDataLoads();
        } catch (_) {
            /* ignore */
        }
    };
    window.addEventListener('pagehide', onPageExit);
    window.addEventListener('beforeunload', onPageExit);
}

export {
    HOME_CATEGORY_MAP,
    filterProducersByCategory,
    countProducersByHomeCategory,
    getGoogleMapsDirectionsUrl,
    getDistanceKm,
    getProducersInRadius
};

export function getProducers() {
    return [...producersRegistry];
}

function normalizeProducerId(value) {
    return String(value ?? '').trim();
}

function stripOsmPrefix(id) {
    return normalizeProducerId(id).replace(/^osm-/i, '');
}

/**
 * Soft-match ID (prefiks osm-, wielkość liter, suffix numeryczny).
 * @param {string} id
 * @returns {object | null}
 */
function findProducerInRegistry(id) {
    const raw = normalizeProducerId(id);
    if (!raw) return null;

    const exact = producersRegistry.find((p) => String(p.id) === raw);
    if (exact) return exact;

    const lower = raw.toLowerCase();
    const rawOsm = stripOsmPrefix(raw).toLowerCase();

    return producersRegistry.find((p) => {
        const pid = String(p.id || '');
        const pidLower = pid.toLowerCase();
        const pidOsm = stripOsmPrefix(pid).toLowerCase();
        return pidLower === lower
            || pidOsm === rawOsm
            || pid.endsWith(raw)
            || raw.endsWith(pid)
            || pidOsm.endsWith(rawOsm)
            || rawOsm.endsWith(pidOsm);
    }) || null;
}

/**
 * Upsert do rejestru (np. fallback z mapy), żeby getProducerProducts działał.
 * @param {object} producer
 */
export function upsertProducer(producer) {
    if (!producer?.id) return;
    const enriched = enrichProducerWithProducts(producer);
    const id = String(enriched.id);
    const idx = producersRegistry.findIndex((p) => String(p.id) === id);
    if (idx >= 0) {
        producersRegistry[idx] = enriched;
    } else {
        producersRegistry.push(enriched);
    }
    return enriched;
}

/**
 * Szuka producenta po współrzędnych (gdy ID z popupu nie trafia w rejestr).
 * @param {number} lat
 * @param {number} lng
 * @param {number} [maxKm=0.05]
 */
export function findProducerNear(lat, lng, maxKm = 0.05) {
    const la = Number(lat);
    const ln = Number(lng);
    if (!Number.isFinite(la) || !Number.isFinite(ln)) return null;

    let best = null;
    let bestDist = Infinity;
    for (const p of producersRegistry) {
        const dist = getDistanceKm(la, ln, Number(p.lat), Number(p.lng));
        if (!Number.isFinite(dist) || dist > maxKm) continue;
        if (dist < bestDist) {
            best = p;
            bestDist = dist;
        }
    }
    return best;
}

export function getProducerById(id) {
    const fromRegistry = findProducerInRegistry(id);
    if (fromRegistry) return fromRegistry;
    const content = getContentProducerById(id);
    if (!content) return null;
    return enrichProducerWithProducts(content);
}

export function getProducerProducts(producerId) {
    const producer = getProducerById(producerId);
    if (!producer?.products) return [];
    return [...producer.products];
}

export function getLastLoadMeta() {
    return { ...lastLoadMeta };
}

/** True gdy OSM zwrócił pusty wynik dla obszaru (bez fallbacku na ręczne dane). */
export function isProducersEmptyArea() {
    return !!lastLoadMeta.emptyArea;
}

/** Czy zakończono co najmniej jedno pobranie OSM (live / cache / pusty obszar). */
export function isProducersLoadSettled() {
    const source = lastLoadMeta.source;
    if (!source || source === 'empty-seed' || source === 'none') return false;
    return lastLoadMeta.loadedAt > 0;
}

/**
 * Synchronicznie wstaw producentów z localStorage (świeży lub stale cache)
 * — markery widoczne zanim wróci sieć OSM.
 * @param {number} lat
 * @param {number} lng
 * @returns {{ ok: boolean, count: number, source: string }}
 */
export function hydrateProducersFromCache(lat, lng) {
    const latitude = Number(lat);
    const longitude = Number(lng);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return { ok: false, count: 0, source: 'no-location' };
    }

    const fresh = readCache();
    if (
        fresh?.producers?.length
        && isCacheNearLocation(fresh.lat, fresh.lng, latitude, longitude)
    ) {
        const enriched = enrichProducersWithProducts(fresh.producers);
        setRegistry(enriched, {
            source: 'cache-hydrate',
            fromCache: true,
            apiFailed: false,
            supplementContent: true
        });
        return { ok: true, count: getProducers().length, source: 'cache-hydrate' };
    }

    const stale = readStaleCache();
    if (stale?.producers?.length) {
        const near = isCacheNearLocation(stale.lat, stale.lng, latitude, longitude);
        if (near || stale.producers.length > 0) {
            const enriched = enrichProducersWithProducts(stale.producers);
            setRegistry(enriched, {
                source: 'stale-cache-hydrate',
                fromCache: true,
                apiFailed: false,
                supplementContent: true
            });
            return { ok: true, count: getProducers().length, source: 'stale-cache-hydrate' };
        }
    }

    return { ok: false, count: getProducers().length, source: 'miss' };
}

function readCache() {
    if (typeof localStorage === 'undefined') return null;
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        const producers = sanitizeProducers(parsed.producers);
        if (!producers.length) return null;
        if (!parsed.timestamp || Date.now() - parsed.timestamp > CACHE_TTL_MS) return null;
        return {
            timestamp: Number(parsed.timestamp),
            lat: Number(parsed.lat),
            lng: Number(parsed.lng),
            producers
        };
    } catch (_) {
        console.warn('[DataService] Uszkodzony cache – usuwam', CACHE_KEY);
        try {
            localStorage.removeItem(CACHE_KEY);
        } catch (__) {
            /* ignore */
        }
        return null;
    }
}

/**
 * Nazwa widoczna w UI / Health Check – nigdy pusta.
 * @param {object} producer
 * @returns {string}
 */
function ensureProducerName(producer) {
    const direct = String(producer?.name || '').trim();
    if (direct) return direct;

    const brand = String(producer?.brand || producer?.operator || producer?.chain || '').trim();
    if (brand) return brand;

    const street = String(producer?.address || '')
        .split(',')
        .map((part) => part.trim())
        .find(Boolean);
    const kind = String(producer?.category || producer?.amenity || producer?.shop || '')
        .replace(/_/g, ' ')
        .trim();
    const unknown = t('map.unknownProducer') || 'Nieznany producent';

    if (street && kind) return `${unknown} (${kind}, ${street})`;
    if (street) return `${unknown} · ${street}`;
    if (kind) return `${unknown} (${kind})`;
    return unknown;
}

/**
 * Zostawia tylko rekordy z poprawnym id + współrzędnymi (markery).
 * @param {unknown} list
 * @returns {object[]}
 */
function sanitizeProducers(list) {
    if (!Array.isArray(list)) return [];
    return list.filter((p) => {
        if (!p || typeof p !== 'object') return false;
        if (!String(p.id || '').trim()) return false;
        const lat = Number(p.lat);
        const lng = Number(p.lng);
        return Number.isFinite(lat) && Number.isFinite(lng)
            && lat >= -90 && lat <= 90
            && lng >= -180 && lng <= 180;
    }).map((p) => ({
        ...p,
        name: ensureProducerName(p),
        category: normalizeProducerCategory(p.category)
    }));
}

function writeCache(lat, lng, producers) {
    if (typeof localStorage === 'undefined') return;
    const safe = sanitizeProducers(producers);
    if (!safe.length) return;
    try {
        // Cache bez ciężkich list produktów – enrich przy odczycie
        const lean = safe.map((p) => {
            const { products, promotions, ...rest } = p;
            return {
                ...rest,
                products: Array.isArray(products)
                    ? products.filter((item) => item?.source === 'osm' || item?.id?.includes?.('-osm-')).slice(0, 20)
                    : []
            };
        });
        localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
                timestamp: Date.now(),
                lat: Number(lat),
                lng: Number(lng),
                producers: lean
            })
        );
    } catch (error) {
        console.warn('[DataService] Nie udało się zapisać cache:', error);
        try {
            // Awaryjnie – tylko meta + id/coords/name/category
            const minimal = safe.map((p) => ({
                id: p.id,
                name: p.name,
                category: p.category,
                lat: p.lat,
                lng: p.lng,
                source: p.source || 'cache',
                products: []
            }));
            localStorage.setItem(
                CACHE_KEY,
                JSON.stringify({
                    timestamp: Date.now(),
                    lat: Number(lat),
                    lng: Number(lng),
                    producers: minimal
                })
            );
        } catch (_) {
            /* ignore */
        }
    }
}

function readStaleCache() {
    if (typeof localStorage === 'undefined') return null;
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        const producers = sanitizeProducers(parsed?.producers);
        if (!producers.length) return null;
        return {
            timestamp: Number(parsed.timestamp) || 0,
            lat: Number(parsed.lat),
            lng: Number(parsed.lng),
            producers
        };
    } catch (_) {
        return null;
    }
}

function setRegistry(producers, meta) {
    const normalized = (Array.isArray(producers) ? producers : []).map((p) => ({
        ...p,
        name: ensureProducerName(p),
        category: normalizeProducerCategory(p.category)
    }));
    const withBaselines = mergeBaselineProducers(normalized, meta);
    producersRegistry = [...withBaselines];
    lastLoadMeta = {
        source: meta.source,
        fromCache: !!meta.fromCache,
        apiFailed: !!meta.apiFailed,
        emptyArea: !!meta.emptyArea,
        loadedAt: Date.now()
    };

    eventBus.emit(EVENTS.PLACES_LOADED, {
        producers: producersRegistry,
        ...lastLoadMeta
    });
    eventBus.emit(EVENTS.PLACES_CHANGED, {
        producers: producersRegistry,
        ...lastLoadMeta
    });
    eventBus.emit(EVENTS.CACHE_UPDATED, { key: CACHE_KEY, ...lastLoadMeta });
}

const LIVE_OSM_SOURCES = new Set([
    'live',
    'cache',
    'cache-hydrate',
    'stale-cache',
    'stale-cache-hydrate'
]);

/**
 * Ręczni producenci (producerData.js) tylko gdy OSM zwrócił dane dla obszaru.
 * @param {object[]} incoming – OSM (+ GovData) z fetchLiveData / cache
 * @param {object} [meta]
 */
function mergeBaselineProducers(incoming, meta = {}) {
    const live = Array.isArray(incoming) ? incoming : [];
    const userProducers = getRegisteredUserProducers();

    const supplementContent = !meta.emptyArea
        && live.length > 0
        && (meta.supplementContent === true || LIVE_OSM_SOURCES.has(meta.source));

    const curated = supplementContent
        ? getContentProducers().map((p) => enrichProducerWithProducts({ ...p }))
        : [];

    // OSM/live pierwsze, potem ręczne uzupełnienie (dedupe preferuje OSM), na końcu user
    return dedupeProducers([...live, ...curated, ...userProducers]);
}

function mergeUserProducers(producers) {
    return mergeBaselineProducers(producers, lastLoadMeta);
}

export function refreshUserProducersOnMap() {
    const liveOnly = producersRegistry.filter((p) => p.source !== 'user' && p.source !== 'content');
    setRegistry(liveOnly, { ...lastLoadMeta, source: lastLoadMeta.source || 'refresh' });
}

// Pusty rejestr do czasu załadowania OSM – bez ręcznych producentów jako fallback
producersRegistry = [];
lastLoadMeta = {
    source: 'empty-seed',
    fromCache: false,
    apiFailed: false,
    emptyArea: false,
    loadedAt: 0
};

function buildLoadKey(lat, lng, radiusKm) {
    return [
        Number(lat).toFixed(5),
        Number(lng).toFixed(5),
        Number(radiusKm).toFixed(2)
    ].join(':');
}

function applyRegistryIfCurrent(epoch, producers, meta) {
    if (epoch !== registryEpoch) {
        return {
            producers: getProducers(),
            fromCache: lastLoadMeta.fromCache,
            apiFailed: lastLoadMeta.apiFailed,
            source: 'stale-superseded',
            stale: true
        };
    }
    setRegistry(producers, meta);
    return {
        producers: getProducers(),
        fromCache: !!meta.fromCache,
        apiFailed: !!meta.apiFailed,
        emptyArea: !!meta.emptyArea,
        source: meta.source
    };
}

function drainQueuedLoad() {
    const next = queuedLoad;
    queuedLoad = null;
    if (!next) return;

    const promise = runLoadAllData(next.lat, next.lng, next.radiusKm, next.forceRefresh);
    next.waiters.forEach(({ resolve, reject }) => {
        promise.then(resolve, reject);
    });
}

function enqueueLoad(lat, lng, radiusKm, forceRefresh) {
    return new Promise((resolve, reject) => {
        if (
            queuedLoad
            && queuedLoad.lat === lat
            && queuedLoad.lng === lng
            && queuedLoad.radiusKm === radiusKm
            && queuedLoad.forceRefresh === forceRefresh
        ) {
            queuedLoad.waiters.push({ resolve, reject });
            return;
        }

        // Nowe żądanie zastępuje poprzednie w kolejce (starsi waiters dostaną wynik nowego)
        const previousWaiters = queuedLoad?.waiters || [];
        queuedLoad = {
            lat,
            lng,
            radiusKm,
            forceRefresh,
            waiters: [...previousWaiters, { resolve, reject }]
        };
    });
}

async function fetchLiveData(lat, lng, radiusKm) {
    const radiusM = Math.max(1000, Math.round(Number(radiusKm || 10) * 1000));

    const govPromise = ENABLE_GOVDATA
        ? fetchGovData('farmer', lat, lng, radiusKm)
        : Promise.resolve([]);

    const [osmResult, govResult] = await Promise.allSettled([
        fetchOsmProducers(lat, lng, radiusM),
        govPromise
    ]);

    const osmAborted = osmResult.status === 'rejected' && isOsmAbortError(osmResult.reason);
    if (osmAborted) {
        return {
            producers: [],
            apiFailed: false,
            partialFailure: false,
            emptyArea: false,
            aborted: true
        };
    }

    const osmProducers = osmResult.status === 'fulfilled' ? osmResult.value : [];
    const govProducers = govResult.status === 'fulfilled' ? govResult.value : [];

    if (osmResult.status === 'rejected') {
        console.warn('[DataService] OSM error:', osmResult.reason);
    }
    if (ENABLE_GOVDATA && govResult.status === 'rejected') {
        console.warn('[DataService] GovData error:', govResult.reason);
    }

    const osmOk = osmResult.status === 'fulfilled';
    const govOk = !ENABLE_GOVDATA || govResult.status === 'fulfilled';
    const govFailed = ENABLE_GOVDATA && govResult.status === 'rejected';
    const partialFailure = osmResult.status === 'rejected' || govFailed;
    const merged = enrichProducersWithProducts(dedupeProducers([...osmProducers, ...govProducers]));
    const emptyArea = osmOk && govOk && merged.length === 0;
    const apiFailed = !osmOk && (!ENABLE_GOVDATA || govFailed);

    return { producers: merged, apiFailed, partialFailure, emptyArea };
}

async function runLoadAllData(latitude, longitude, radiusKm, forceRefresh) {
    const loadKey = buildLoadKey(latitude, longitude, radiusKm);
    const epoch = ++registryEpoch;

    if (activeLoad) {
        activeLoad.key = loadKey;
        activeLoad.epoch = epoch;
    } else {
        activeLoad = { key: loadKey, epoch, promise: null };
    }

    try {
        if (!forceRefresh) {
            const freshCache = readCache();
            if (
                freshCache?.producers?.length
                && isCacheNearLocation(freshCache.lat, freshCache.lng, latitude, longitude)
            ) {
                const enriched = enrichProducersWithProducts(freshCache.producers);
                return applyRegistryIfCurrent(epoch, enriched, {
                    source: 'cache',
                    fromCache: true,
                    apiFailed: false,
                    supplementContent: true
                });
            }
        }

        try {
            // Nowa lokalizacja – anuluj stare Overpass, żeby nie walczyć o sieć
            abortInflightOsmRequests();
            const live = await fetchLiveData(latitude, longitude, radiusKm);

            if (live.aborted) {
                if (epoch !== registryEpoch) {
                    return {
                        producers: getProducers(),
                        fromCache: lastLoadMeta.fromCache,
                        apiFailed: lastLoadMeta.apiFailed,
                        source: 'stale-superseded',
                        stale: true
                    };
                }
                return buildAbortedLoadResult();
            }

            if (live.emptyArea) {
                return applyRegistryIfCurrent(epoch, [], {
                    source: 'empty-area',
                    fromCache: false,
                    apiFailed: false,
                    emptyArea: true
                });
            }

            if (live.producers.length > 0) {
                writeCache(latitude, longitude, live.producers);
                return applyRegistryIfCurrent(epoch, live.producers, {
                    source: 'live',
                    fromCache: false,
                    apiFailed: live.partialFailure,
                    supplementContent: true
                });
            }

            throw new Error('API failed');
        } catch (error) {
            // Request anulowany / zastąpiony – nie nadpisuj registry
            if (epoch !== registryEpoch || isOsmAbortError(error)) {
                return epoch !== registryEpoch
                    ? {
                        producers: getProducers(),
                        fromCache: lastLoadMeta.fromCache,
                        apiFailed: lastLoadMeta.apiFailed,
                        source: 'stale-superseded',
                        stale: true
                    }
                    : buildAbortedLoadResult();
            }

            console.warn('[DataService] API failed, using stale cache:', error);

            const staleCache = readStaleCache();
            if (staleCache?.producers?.length) {
                const near = isCacheNearLocation(staleCache.lat, staleCache.lng, latitude, longitude);
                // Przy błędzie API (np. Overpass 504) użyj cache nawet jeśli lokalizacja lekko odbiega
                if (near || staleCache.producers.length > 0) {
                    const enriched = enrichProducersWithProducts(staleCache.producers);
                    return applyRegistryIfCurrent(epoch, enriched, {
                        source: 'stale-cache',
                        fromCache: true,
                        apiFailed: true,
                        supplementContent: true
                    });
                }
            }

            // Offline / błąd sieci: zachowaj aktualny stan mapy zamiast opróżniać registry.
            if (producersRegistry.length > 0) {
                if (epoch === registryEpoch) {
                    lastLoadMeta = {
                        source: 'stale-memory',
                        fromCache: true,
                        apiFailed: true,
                        loadedAt: Date.now()
                    };
                }
                return {
                    producers: getProducers(),
                    fromCache: true,
                    apiFailed: true,
                    source: epoch === registryEpoch ? 'stale-memory' : 'stale-superseded',
                    stale: epoch !== registryEpoch
                };
            }

            // Brak cache i OSM – pusty rejestr
            return applyRegistryIfCurrent(epoch, [], {
                source: 'empty-fallback',
                fromCache: false,
                apiFailed: true
            });
        }
    } finally {
        if (activeLoad?.epoch === epoch) {
            activeLoad = null;
        }
        drainQueuedLoad();
    }
}

/**
 * Ładuje producentów z OSM (+ opcjonalnie GovData WFS) przy pierwszym otwarciu mapy.
 * Maksymalnie jeden aktywny request sieciowy; identyczne żądania są współdzielone,
 * różne lokalizacje kolejkowane (ostatnie wygrywa).
 * @param {number} lat
 * @param {number} lng
 * @param {{ radiusKm?: number, forceRefresh?: boolean }} [options]
 */
export async function loadAllData(lat, lng, options = {}) {
    const latitude = Number(lat);
    const longitude = Number(lng);
    const radiusKm = Number(options.radiusKm ?? 10);
    const forceRefresh = !!options.forceRefresh;

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return {
            producers: [],
            fromCache: false,
            apiFailed: true,
            source: 'no-location'
        };
    }

    const loadKey = buildLoadKey(latitude, longitude, radiusKm);

    if (activeLoad?.key === loadKey && activeLoad.promise) {
        return activeLoad.promise;
    }

    if (activeLoad) {
        // Nowa lokalizacja w kolejce – unieważnij wynik trwającego requestu i anuluj OSM
        if (activeLoad.key !== loadKey) {
            abortPendingDataLoads();
        }
        return enqueueLoad(latitude, longitude, radiusKm, forceRefresh);
    }

    const holder = { key: loadKey, epoch: 0, promise: null };
    activeLoad = holder;
    holder.promise = runLoadAllData(latitude, longitude, radiusKm, forceRefresh);
    return holder.promise;
}

export function resetProducersForTests() {
    producersRegistry = [];
    activeLoad = null;
    queuedLoad = null;
    registryEpoch = 0;
    lastLoadMeta = {
        source: 'empty-seed',
        fromCache: false,
        apiFailed: false,
        emptyArea: false,
        loadedAt: 0
    };
}
