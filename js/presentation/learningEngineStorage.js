// js/presentation/learningEngineStorage.js – K3: agregacja, kompresja, limit rozmiaru

/** Maks. szacowany rozmiar sygnałów w IndexedDB (~10 MB). */
export const MAX_IDB_BYTES = 10 * 1024 * 1024;
/** Sygnały surowe starsze niż 7 dni → agregat skompresowany. */
export const COMPRESS_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function estimateSignalsBytes(signals) {
    if (!Array.isArray(signals) || !signals.length) return 0;
    try {
        if (typeof Blob !== 'undefined') {
            return new Blob([JSON.stringify(signals)]).size;
        }
    } catch {
        /* fallback */
    }
    return JSON.stringify(signals).length * 2;
}

export function aggregationKey(signal) {
    if (!signal?.type) return `unknown:${signal?.at ?? 0}`;
    switch (signal.type) {
        case 'route':
            return `route:${signal.grid || ''}`;
        case 'category':
            return `category:${signal.category || ''}`;
        case 'producer':
            return `producer:${signal.producerId || ''}`;
        case 'product':
            return `product:${signal.productId || ''}`;
        case 'search':
            return `search:${signal.query || ''}`;
        case 'screen':
            return `screen:${signal.view || ''}`;
        default:
            return `${signal.type}:${signal.at ?? 0}`;
    }
}

export function mergeAggregatedSignals(target, next) {
    target.w = (Number(target.w) || 1) + (Number(next.w) || 1);
    target.at = Math.max(Number(target.at) || 0, Number(next.at) || 0);
    target.aggregated = (Number(target.aggregated) || 1) + (Number(next.aggregated) || 1);
    if (target.type === 'screen') {
        target.ms = (Number(target.ms) || 0) + (Number(next.ms) || 0);
    }
}

/**
 * Agreguje podobne sygnały w partii (np. wiele ticków GPS → jeden route/grid).
 * @param {object[]} signals
 */
export function aggregateSignals(signals = []) {
    const map = new Map();
    for (const raw of signals) {
        if (!raw?.type) continue;
        const key = aggregationKey(raw);
        const prev = map.get(key);
        if (prev) {
            mergeAggregatedSignals(prev, raw);
        } else {
            map.set(key, { ...raw, aggregated: Number(raw.aggregated) || 1 });
        }
    }
    return [...map.values()];
}

/**
 * Kompresja starszych surowych sygnałów do zagregowanych rekordów (LS / pamięć).
 */
export function compressSignalsArray(signals = [], {
    compressAgeMs = COMPRESS_AGE_MS,
    now = Date.now()
} = {}) {
    const compressed = [];
    const fresh = [];
    const stale = [];

    for (const s of signals) {
        if (!s?.type) continue;
        if (s.compressed) {
            compressed.push(s);
            continue;
        }
        if (now - (Number(s.at) || 0) > compressAgeMs) stale.push(s);
        else fresh.push(s);
    }

    const staleBuckets = aggregateSignals(stale).map((s) => ({
        ...s,
        compressed: true,
        compressedAt: now
    }));

    return [...staleBuckets, ...compressed, ...fresh];
}

/**
 * Plan kompresji IDB: usuń stare surowe wiersze, dodaj agregaty.
 * @returns {{ deleteIds: number[], toAdd: object[], keepRows: object[] }}
 */
export function planIdbCompression(rows = [], {
    compressAgeMs = COMPRESS_AGE_MS,
    now = Date.now()
} = {}) {
    const deleteIds = [];
    const keepRows = [];
    const stale = [];

    for (const row of rows) {
        if (!row?.type) continue;
        if (row.compressed) {
            keepRows.push(row);
            continue;
        }
        if (now - (Number(row.at) || 0) > compressAgeMs) {
            stale.push(row);
            if (row.id != null) deleteIds.push(row.id);
        } else {
            keepRows.push(row);
        }
    }

    const toAdd = aggregateSignals(stale).map((s) => ({
        ...s,
        compressed: true,
        compressedAt: now
    }));

    return { deleteIds, toAdd, keepRows };
}

/** Przytnij najstarsze sygnały aż szacunek bajtów ≤ maxBytes. */
export function trimSignalsToByteBudget(signals = [], maxBytes = MAX_IDB_BYTES) {
    if (!signals.length || maxBytes <= 0) return [];
    const sorted = signals.slice().sort((a, b) => (Number(a.at) || 0) - (Number(b.at) || 0));
    while (sorted.length > 1 && estimateSignalsBytes(sorted) > maxBytes) {
        sorted.shift();
    }
    if (sorted.length && estimateSignalsBytes(sorted) > maxBytes) {
        return sorted.slice(-1);
    }
    return sorted;
}
