// js/core/offlineSync.js – kolejka akcji offline + flush po powrocie sieci

const QUEUE_KEY = 'rg_offline_sync_queue_v1';
const MAX = 80;

let bound = false;

function readQueue() {
    try {
        const raw = localStorage.getItem(QUEUE_KEY);
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
    } catch (_) {
        return [];
    }
}

function writeQueue(list) {
    try {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(list.slice(0, MAX)));
    } catch (_) {
        /* ignore quota */
    }
}

/**
 * @param {{ type: string, payload?: object }} action
 */
export function enqueueOfflineAction(action) {
    if (!action?.type) return;
    const queue = readQueue();
    queue.push({
        id: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: action.type,
        payload: action.payload || {},
        createdAt: Date.now(),
        online: typeof navigator !== 'undefined' ? navigator.onLine !== false : true
    });
    writeQueue(queue);
}

export function getOfflineQueueSize() {
    return readQueue().length;
}

/**
 * Brak backendu – oznaczamy pozycje jako „synced lokalnie” i czyścimy kolejkę,
 * gdy jesteśmy online (przygotowanie pod przyszły endpoint).
 */
export function flushOfflineQueue() {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        return { flushed: 0, offline: true };
    }
    const queue = readQueue();
    if (!queue.length) return { flushed: 0 };

    // Lokalnie utrwalone dane już są w swoich store'ach – kolejka służy do replay
    writeQueue([]);
    console.info(`[OfflineSync] Zsynchronizowano lokalnie ${queue.length} akcji`);
    return { flushed: queue.length };
}

export function initOfflineSync() {
    if (bound || typeof window === 'undefined') return;
    bound = true;

    window.addEventListener('online', () => {
        flushOfflineQueue();
        try {
            caches.open('rg-runtime-images-v1').catch(() => {});
        } catch (_) {
            /* ignore */
        }
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            navigator.serviceWorker.ready
                .then((reg) => reg.sync?.register('rg-offline-sync'))
                .catch(() => {});
        }
    });

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event?.data?.type === 'FLUSH_OFFLINE_QUEUE') flushOfflineQueue();
        });
    }

    if (navigator.onLine !== false) {
        flushOfflineQueue();
    }
}

export default {
    enqueueOfflineAction,
    getOfflineQueueSize,
    flushOfflineQueue,
    initOfflineSync
};
