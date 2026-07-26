// js/presentation/learningEngine.js – ETAP 18B Learning Engine
// Uczenie lokalne (localStorage + IndexedDB). Anonimowe. Nic nie wysyła do Internetu.
// Nie zmienia architektury Store / EventBus / API / GPS / mapy.

import { eventBus } from '../core/eventBus.js';
import { EVENTS } from '../core/events.js';
import { getUserHistory } from '../core/userHistory.js';
import {
    MAX_IDB_BYTES,
    aggregateSignals,
    compressSignalsArray,
    estimateSignalsBytes,
    planIdbCompression,
    trimSignalsToByteBudget
} from './learningEngineStorage.js';

const MODEL_KEY = 'rg_learning_model_v1';
const EVENTS_KEY = 'rg_learning_events_v1';
const LEARNING_ENABLED_KEY = 'rg_learning_enabled_v1';
const IDB_NAME = 'rg_learning_engine';
const IDB_STORE = 'signals';
const MAX_EVENTS_LS = 180;
const MAX_ROUTE_POINTS = 40;
const MODEL_VERSION = 1;
/** Maks. sygnałów w IndexedDB (starsze usuwane przy prune). */
const MAX_IDB_RECORDS = 1000;
/** Sygnały starsze niż 30 dni są usuwane z IndexedDB. */
const MAX_IDB_AGE_MS = 30 * 24 * 60 * 60 * 1000;
/** Okresowe czyszczenie IDB (6 h). */
const PRUNE_INTERVAL_MS = 6 * 60 * 60 * 1000;
/** Zapis zbiorczy sygnałów (LS + IDB). */
const FLUSH_BATCH_MS = 3000;
const FLUSH_BATCH_MAX = 25;
/** Min. odstęp między sygnałami route z GPS. */
const ROUTE_MIN_INTERVAL_MS = 5000;

/** @type {ReturnType<typeof emptyModel>} */
let cachedModel = null;
let viewStartedAt = Date.now();
let currentView = 'home';
let detailOpen = null;
let initialized = false;
let observersBound = false;
let rebuildTimer = null;
let flushBatchTimer = null;
/** @type {object[]} */
let pendingSignals = [];
let pruneAfterPersistTimer = null;
let periodicPruneTimer = null;
let lastRouteGrid = null;
let lastRouteSignalAt = 0;

function emptyModel() {
    return {
        version: MODEL_VERSION,
        updatedAt: 0,
        signalCount: 0,
        categories: {},
        hours: {},
        products: {},
        producers: {},
        screens: {},
        searches: {},
        routes: [],
        affinity: {
            topCategories: [],
            topProducers: [],
            topProducts: [],
            peakHours: [],
            topSearches: [],
            preferredScreens: []
        }
    };
}

function bump(map, key, by = 1) {
    if (!key) return;
    const k = String(key).slice(0, 64);
    map[k] = (Number(map[k]) || 0) + by;
}

function anonymizeQuery(q) {
    return String(q || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .slice(0, 48);
}

/** Czy Learning Engine zapisuje nowe sygnały (domyślnie włączony). */
export function isLearningEnabled() {
    try {
        const raw = localStorage.getItem(LEARNING_ENABLED_KEY);
        if (raw === '0' || raw === 'false') return false;
        return true;
    } catch {
        return true;
    }
}

/** Włącz/wyłącz zapisywanie sygnałów (odczyt modelu nadal działa). */
export function setLearningEnabled(enabled) {
    try {
        localStorage.setItem(LEARNING_ENABLED_KEY, enabled ? '1' : '0');
    } catch {
        /* ignore */
    }
    if (!enabled) {
        flushPendingSignals();
    } else if (initialized && !observersBound) {
        bindObservers();
        startPeriodicPrune();
    }
}

function normalizeLearningSignal(type, payload = {}) {
    const signal = {
        type,
        at: Date.now(),
        hour: new Date().getHours(),
        ...payload
    };
    delete signal.name;
    delete signal.email;
    delete signal.userId;
    delete signal.token;

    if (signal.query) signal.query = anonymizeQuery(signal.query);
    if (signal.category) signal.category = String(signal.category).slice(0, 40);
    if (signal.producerId) signal.producerId = String(signal.producerId).slice(0, 64);
    if (signal.productId) signal.productId = String(signal.productId).slice(0, 64);
    return signal;
}

/** Siatka ~1 km – bez precyzyjnej lokalizacji w modelu */
function gridCoord(lat, lng) {
    const la = Number(lat);
    const ln = Number(lng);
    if (!Number.isFinite(la) || !Number.isFinite(ln)) return null;
    return `${la.toFixed(2)},${ln.toFixed(2)}`;
}

function readModel() {
    if (cachedModel) return cachedModel;
    try {
        const raw = localStorage.getItem(MODEL_KEY);
        const data = raw ? JSON.parse(raw) : null;
        if (!data || typeof data !== 'object') {
            cachedModel = emptyModel();
            return cachedModel;
        }
        cachedModel = {
            ...emptyModel(),
            ...data,
            categories: data.categories || {},
            hours: data.hours || {},
            products: data.products || {},
            producers: data.producers || {},
            screens: data.screens || {},
            searches: data.searches || {},
            routes: Array.isArray(data.routes) ? data.routes : [],
            affinity: { ...emptyModel().affinity, ...(data.affinity || {}) }
        };
        return cachedModel;
    } catch {
        cachedModel = emptyModel();
        return cachedModel;
    }
}

function writeModel(model) {
    cachedModel = model;
    try {
        localStorage.setItem(MODEL_KEY, JSON.stringify(model));
    } catch {
        /* quota – ignoruj */
    }
}

function readLocalEvents() {
    try {
        const raw = localStorage.getItem(EVENTS_KEY);
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
    } catch {
        return [];
    }
}

function writeLocalEvents(list) {
    try {
        localStorage.setItem(EVENTS_KEY, JSON.stringify(list.slice(0, MAX_EVENTS_LS)));
    } catch {
        /* ignore */
    }
}

function openIdb() {
    return new Promise((resolve, reject) => {
        if (typeof indexedDB === 'undefined') {
            reject(new Error('no-idb'));
            return;
        }
        const req = indexedDB.open(IDB_NAME, 1);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(IDB_STORE)) {
                db.createObjectStore(IDB_STORE, { keyPath: 'id', autoIncrement: true });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error || new Error('idb-open'));
    });
}

async function readAllIdbSignals(db) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, 'readonly');
        const req = tx.objectStore(IDB_STORE).getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
    });
}

/**
 * Pure: wybierz rekordy do zachowania (testowalne bez IndexedDB).
 * @param {object[]} rows
 * @param {{ maxRecords?: number, maxAgeMs?: number, now?: number }} [opts]
 */
export function selectSignalsToKeep(rows = [], opts = {}) {
    const maxRecords = opts.maxRecords ?? MAX_IDB_RECORDS;
    const maxAgeMs = opts.maxAgeMs ?? MAX_IDB_AGE_MS;
    const now = opts.now ?? Date.now();

    const sorted = rows.slice().sort((a, b) => {
        const ta = Number(a?.at) || 0;
        const tb = Number(b?.at) || 0;
        if (ta !== tb) return ta - tb;
        return (Number(a?.id) || 0) - (Number(b?.id) || 0);
    });

    const withinAge = sorted.filter((row) => now - (Number(row?.at) || 0) <= maxAgeMs);
    const kept = withinAge.slice(-maxRecords);
    const keepIds = new Set(kept.map((row) => row.id));
    const deleteIds = sorted.filter((row) => !keepIds.has(row.id)).map((row) => row.id);

    return {
        keepIds,
        deleteIds,
        keptCount: kept.length,
        total: sorted.length
    };
}

/**
 * Usuwa stare / nadmiarowe sygnały z IndexedDB (limit wieku + liczby rekordów).
 * @returns {Promise<{ pruned: number, remaining: number }>}
 */
export async function pruneIndexedDB() {
    if (typeof indexedDB === 'undefined') return { pruned: 0, remaining: 0, compressed: 0 };

    try {
        const db = await openIdb();
        if (!db.objectStoreNames.contains(IDB_STORE)) {
            db.close();
            return { pruned: 0, remaining: 0, compressed: 0 };
        }

        let rows = await readAllIdbSignals(db);
        let compressed = 0;

        const compression = planIdbCompression(rows);
        if (compression.deleteIds.length) {
            await deleteIdbIds(db, compression.deleteIds);
            for (const signal of compression.toAdd) {
                await addIdbSignal(db, signal);
            }
            compressed = compression.toAdd.length;
            rows = await readAllIdbSignals(db);
        }

        const { deleteIds: ageCountDeleteIds } = selectSignalsToKeep(rows);
        let kept = rows.filter((row) => row.id == null || !ageCountDeleteIds.includes(row.id));
        kept = trimSignalsToByteBudget(kept, MAX_IDB_BYTES);

        const keepIds = new Set(kept.map((row) => row.id).filter((id) => id != null));
        const pruneIds = [...new Set([
            ...ageCountDeleteIds.filter((id) => id != null),
            ...rows
                .filter((row) => row.id != null && !keepIds.has(row.id))
                .map((row) => row.id)
        ])];

        if (pruneIds.length) {
            await deleteIdbIds(db, pruneIds);
        }
        db.close();

        const pruned = pruneIds.length;
        const remaining = Math.max(0, rows.length - pruned);
        if (pruned > 0 || compressed > 0) {
            console.info(
                `[Learning Engine] IDB prune: usunięto ${pruned}, skompresowano ${compressed}, pozostało ${remaining}, ~${Math.round(estimateSignalsBytes(kept) / 1024)} KB`
            );
        }
        return { pruned, remaining, compressed };
    } catch {
        return { pruned: 0, remaining: 0, compressed: 0 };
    }
}

async function deleteIdbIds(db, ids) {
    if (!ids.length) return;
    await new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, 'readwrite');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        const store = tx.objectStore(IDB_STORE);
        for (const id of ids) store.delete(id);
    });
}

async function addIdbSignal(db, signal) {
    await new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, 'readwrite');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.objectStore(IDB_STORE).add(signal);
    });
}

function schedulePruneAfterPersist() {
    if (pruneAfterPersistTimer) clearTimeout(pruneAfterPersistTimer);
    pruneAfterPersistTimer = setTimeout(() => {
        pruneAfterPersistTimer = null;
        pruneIndexedDB().catch(() => {});
    }, 1200);
}

function startPeriodicPrune() {
    if (periodicPruneTimer) return;
    periodicPruneTimer = setInterval(() => {
        pruneIndexedDB().catch(() => {});
    }, PRUNE_INTERVAL_MS);
}

async function persistSignalsIdbBatch(signals) {
    if (!signals.length || typeof indexedDB === 'undefined') return;
    try {
        const db = await openIdb();
        await new Promise((resolve, reject) => {
            const tx = db.transaction(IDB_STORE, 'readwrite');
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
            const store = tx.objectStore(IDB_STORE);
            for (const signal of signals) store.add(signal);
        });
        db.close();
        schedulePruneAfterPersist();
    } catch {
        /* fallback LS only */
    }
}

function scheduleFlushBatch() {
    if (flushBatchTimer) return;
    flushBatchTimer = setTimeout(() => {
        flushBatchTimer = null;
        flushPendingSignals();
    }, FLUSH_BATCH_MS);
}

/** Zapis zbiorczy: agregacja w partii + jeden zapis LS + jedna transakcja IDB. */
export function flushPendingSignals() {
    if (!pendingSignals.length) return [];

    if (flushBatchTimer) {
        clearTimeout(flushBatchTimer);
        flushBatchTimer = null;
    }

    const batch = pendingSignals.splice(0);
    const aggregated = aggregateSignals(batch);

    let list = readLocalEvents();
    list.unshift(...aggregated);
    list = compressSignalsArray(list);
    list = trimSignalsToByteBudget(list.slice(0, MAX_EVENTS_LS), Math.min(MAX_IDB_BYTES, 512 * 1024));
    writeLocalEvents(list);

    persistSignalsIdbBatch(aggregated);
    scheduleRebuild();
    return aggregated;
}

function enqueueLearningSignal(signal) {
    pendingSignals.push(signal);
    if (pendingSignals.length >= FLUSH_BATCH_MAX) {
        flushPendingSignals();
        return;
    }
    scheduleFlushBatch();
}

async function loadIdbSignals(limit = 400) {
    try {
        const db = await openIdb();
        const rows = await new Promise((resolve, reject) => {
            const tx = db.transaction(IDB_STORE, 'readonly');
            const req = tx.objectStore(IDB_STORE).getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
        db.close();
        return rows.slice(-limit);
    } catch {
        return [];
    }
}

/**
 * Pure: zbuduj model z listy sygnałów (+ opcjonalna historia).
 * Eksportowane pod testy.
 */
export function buildModelFromSignals(signals = [], history = null) {
    const model = emptyModel();
    const nowHour = new Date().getHours();

    for (const s of signals) {
        if (!s || !s.type) continue;
        model.signalCount += 1;
        const hour = Number.isFinite(s.hour) ? s.hour : nowHour;
        bump(model.hours, String(hour), 1);

        switch (s.type) {
            case 'category':
                bump(model.categories, s.category, s.w || 1);
                break;
            case 'producer':
                bump(model.producers, s.producerId, s.w || 1);
                if (s.category) bump(model.categories, s.category, 0.6);
                break;
            case 'product':
                bump(model.products, s.productId, s.w || 1);
                break;
            case 'search':
                bump(model.searches, s.query, s.w || 1);
                break;
            case 'screen':
                bump(model.screens, s.view, Number(s.ms) || 0);
                break;
            case 'route':
                if (Array.isArray(s.stops) && s.stops.length) {
                    model.routes.unshift({
                        stops: s.stops.map(String).slice(0, 12),
                        at: s.at || Date.now()
                    });
                } else if (s.grid) {
                    model.routes.unshift({ grid: String(s.grid), at: s.at || Date.now() });
                }
                break;
            default:
                break;
        }
    }

    // Wzbogać z istniejącej historii (bez PII)
    if (history) {
        for (const v of history.viewed || []) {
            bump(model.producers, v.id, 1);
            if (v.category) bump(model.categories, v.category, 0.5);
        }
        for (const p of history.products || []) bump(model.products, p.id, 1.2);
        for (const p of history.purchased || []) bump(model.products, p.id, 2);
        for (const s of history.searched || []) {
            bump(model.searches, anonymizeQuery(s.query || s.id), 1);
        }
        for (const r of history.routes || []) {
            const stops = r.producerIds || r.stops || (r.id ? [r.id] : []);
            if (stops.length) {
                model.routes.unshift({
                    stops: stops.map(String).slice(0, 12),
                    at: r.at || Date.now()
                });
            }
        }
    }

    model.routes = model.routes.slice(0, MAX_ROUTE_POINTS);
    model.affinity = computeAffinity(model);
    model.updatedAt = Date.now();
    return model;
}

function topEntries(map, limit = 5) {
    return Object.entries(map || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([k, v]) => ({ id: k, score: Math.round(v * 10) / 10 }));
}

export function computeAffinity(model) {
    return {
        topCategories: topEntries(model.categories, 6),
        topProducers: topEntries(model.producers, 8),
        topProducts: topEntries(model.products, 8),
        peakHours: topEntries(model.hours, 4).map((x) => ({ hour: Number(x.id), score: x.score })),
        topSearches: topEntries(model.searches, 6),
        preferredScreens: topEntries(model.screens, 4)
    };
}

function scheduleRebuild() {
    if (rebuildTimer) clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(() => {
        rebuildLearningModel().catch(() => {});
    }, 400);
}

/**
 * Zapis sygnału lokalnie (LS + IDB, zbiorczo). Bez sieci.
 */
export function recordLearningSignal(type, payload = {}) {
    if (!isLearningEnabled()) return null;

    const signal = normalizeLearningSignal(type, payload);
    enqueueLearningSignal(signal);
    return signal;
}

export async function rebuildLearningModel() {
    const ls = readLocalEvents();
    const idb = await loadIdbSignals(400);
    const merged = [...idb, ...ls]
        .sort((a, b) => (a.at || 0) - (b.at || 0))
        .slice(-500);
    const history = getUserHistory();
    const model = buildModelFromSignals(merged, history);
    writeModel(model);
    try {
        eventBus.emit('learning:model-updated', {
            signalCount: model.signalCount,
            topCategories: model.affinity.topCategories.slice(0, 3)
        });
    } catch {
        /* ignore */
    }
    return model;
}

export function getLearningModel() {
    return readModel();
}

/**
 * Boost punktowy do rankingu (0–~28). Sync, z cache modelu.
 */
export function getLearningBoostForProducer(producer) {
    if (!producer) return 0;
    const model = readModel();
    if (!model.signalCount && !Object.keys(model.producers).length) return 0;

    let boost = 0;
    const id = String(producer.id || '');
    const cat = String(producer.category || producer.type || '').toLowerCase();
    const pScore = Number(model.producers[id]) || 0;
    if (pScore > 0) boost += Math.min(14, 4 + pScore * 1.5);

    if (cat) {
        const cScore = Number(model.categories[cat]) || 0;
        // też dopasowanie częściowe kluczy kategorii
        let catBoost = cScore;
        for (const [k, v] of Object.entries(model.categories)) {
            if (k !== cat && (cat.includes(k) || k.includes(cat))) {
                catBoost = Math.max(catBoost, Number(v) || 0);
            }
        }
        if (catBoost > 0) boost += Math.min(10, 2 + catBoost);

        // trasy: producent na wcześniej zapisywanych trasach
        const onRoute = (model.routes || []).some((r) =>
            Array.isArray(r.stops) && r.stops.map(String).includes(id)
        );
        if (onRoute) boost += 6;
    }

    // godzina szczytu użytkownika
    const hour = String(new Date().getHours());
    const hourScore = Number(model.hours[hour]) || 0;
    if (hourScore >= 3) boost += 3;

    // wyszukiwania vs nazwa/kategoria
    const products = producer.products || [];
    const searchKeys = Object.keys(model.searches || {});
    if (searchKeys.length) {
        const blob = `${producer.name || ''} ${cat} ${products.map((p) => p.name || p.id).join(' ')}`.toLowerCase();
        for (const q of searchKeys.slice(0, 12)) {
            if (q.length >= 3 && blob.includes(q)) {
                boost += Math.min(8, 2 + (Number(model.searches[q]) || 1));
                break;
            }
        }
    }

    // produkty
    const productHits = products.filter((p) => model.products[String(p.id)] || model.products[String(p.name || '').toLowerCase()]);
    if (productHits.length) boost += Math.min(10, productHits.length * 3);

    return Math.min(28, Math.round(boost * 10) / 10);
}

export function getLearningInsights() {
    const model = readModel();
    return {
        anonymous: true,
        network: false,
        updatedAt: model.updatedAt,
        signalCount: model.signalCount,
        affinity: model.affinity
    };
}

function flushScreenTime(nextView) {
    const ms = Date.now() - viewStartedAt;
    if (currentView && ms > 800) {
        recordLearningSignal('screen', { view: currentView, ms: Math.min(ms, 30 * 60 * 1000) });
    }
    currentView = nextView || currentView;
    viewStartedAt = Date.now();
}

function bindObservers() {
    if (observersBound) return;
    observersBound = true;

    eventBus.on(EVENTS.VIEW_CHANGED, (payload) => {
        const view = payload?.view || payload?.to || 'home';
        flushScreenTime(view);
    });

    eventBus.on(EVENTS.CATEGORY_SELECTED, (payload) => {
        const category = payload?.category || payload?.id || payload?.filter;
        if (category) recordLearningSignal('category', { category: String(category), w: 1.5 });
    });

    eventBus.on(EVENTS.SEARCH_PRODUCTS, (payload) => {
        const q = anonymizeQuery(payload?.query);
        if (q.length >= 2) recordLearningSignal('search', { query: q, w: 1.2 });
    });

    eventBus.on(EVENTS.FAVORITES_CHANGED, () => {
        // lekki sygnał – przebudowa z historii
        scheduleRebuild();
    });

    eventBus.on(EVENTS.CART_ADDED, (payload) => {
        const productId = payload?.productId || payload?.id;
        if (productId) recordLearningSignal('product', { productId: String(productId), w: 2 });
    });

    eventBus.on(EVENTS.SHOW_DETAIL, (payload) => {
        const producerId = payload?.id || payload?.producerId;
        if (!producerId) return;
        detailOpen = {
            id: String(producerId),
            category: payload?.category || '',
            at: Date.now()
        };
        recordLearningSignal('producer', {
            producerId: detailOpen.id,
            category: detailOpen.category,
            w: 1.5
        });
    });

    eventBus.on(EVENTS.HIDE_DETAIL, (payload) => {
        const id = String(payload?.id || detailOpen?.id || '');
        const dwell = Number(payload?.dwellMs) || (detailOpen ? Date.now() - detailOpen.at : 0);
        if (id && dwell > 2500) {
            recordLearningSignal('producer', {
                producerId: id,
                category: payload?.category || detailOpen?.category || '',
                w: Math.min(4, 1 + dwell / 15000)
            });
        }
        detailOpen = null;
    });

    eventBus.on(EVENTS.LOCATION_UPDATED, (payload) => {
        if (!isLearningEnabled()) return;
        const grid = gridCoord(payload?.lat ?? payload?.latitude, payload?.lng ?? payload?.longitude);
        if (!grid) return;
        const now = Date.now();
        if (grid === lastRouteGrid && now - lastRouteSignalAt < ROUTE_MIN_INTERVAL_MS) return;
        lastRouteGrid = grid;
        lastRouteSignalAt = now;
        recordLearningSignal('route', { grid, at: now });
    });

    // Trasy zapisane w historii – synchronizuj przy zmianie ulubionych / okresowo
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            flushScreenTime(currentView);
            flushPendingSignals();
        } else {
            viewStartedAt = Date.now();
        }
    });
}

/**
 * Start Learning Engine – tylko obserwacja + lokalny model.
 */
export function initLearningEngine() {
    if (initialized) return;
    initialized = true;
    readModel();

    if (isLearningEnabled()) {
        bindObservers();
        pruneIndexedDB()
            .then(() => rebuildLearningModel())
            .catch(() => rebuildLearningModel().catch(() => {}));
        startPeriodicPrune();
    } else {
        rebuildLearningModel().catch(() => {});
    }

    window.__RG_LEARNING__ = {
        model: getLearningModel,
        insights: getLearningInsights,
        rebuild: rebuildLearningModel,
        record: recordLearningSignal,
        boost: getLearningBoostForProducer,
        prune: pruneIndexedDB,
        flush: flushPendingSignals,
        enabled: isLearningEnabled,
        setEnabled: setLearningEnabled,
        policy: {
            anonymous: true,
            localOnly: true,
            network: false,
            storage: ['localStorage', 'IndexedDB'],
            idbMaxRecords: MAX_IDB_RECORDS,
            idbMaxAgeDays: 30,
            idbMaxBytes: MAX_IDB_BYTES,
            batchFlushMs: FLUSH_BATCH_MS,
            batchMax: FLUSH_BATCH_MAX
        }
    };

    console.info('[Learning Engine] lokalny · anonimowy · bez sieci. Konsola: __RG_LEARNING__');
}

export default {
    initLearningEngine,
    recordLearningSignal,
    rebuildLearningModel,
    getLearningModel,
    getLearningBoostForProducer,
    getLearningInsights,
    buildModelFromSignals,
    computeAffinity,
    pruneIndexedDB,
    selectSignalsToKeep,
    flushPendingSignals,
    isLearningEnabled,
    setLearningEnabled
};
