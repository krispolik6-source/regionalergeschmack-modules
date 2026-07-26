// js/core/userHistory.js – lokalna historia użytkownika (ETAP 8)

const KEY = 'rg_user_history_v1';
const MAX = 24;

function empty() {
    return {
        viewed: [],
        searched: [],
        visited: [],
        purchased: [],
        products: [],
        routes: [],
        reservations: []
    };
}

function read() {
    try {
        const raw = localStorage.getItem(KEY);
        const data = raw ? JSON.parse(raw) : null;
        if (!data || typeof data !== 'object') return empty();
        return {
            viewed: Array.isArray(data.viewed) ? data.viewed : [],
            searched: Array.isArray(data.searched) ? data.searched : [],
            visited: Array.isArray(data.visited) ? data.visited : [],
            purchased: Array.isArray(data.purchased) ? data.purchased : [],
            products: Array.isArray(data.products) ? data.products : [],
            routes: Array.isArray(data.routes) ? data.routes : [],
            reservations: Array.isArray(data.reservations) ? data.reservations : []
        };
    } catch (_) {
        return empty();
    }
}

function write(data) {
    try {
        localStorage.setItem(KEY, JSON.stringify(data));
    } catch (_) {
        /* ignore */
    }
}

function pushUnique(list, entry, idKey = 'id') {
    const id = String(entry?.[idKey] || '');
    if (!id) return list;
    const next = [{ ...entry, at: Date.now() }, ...list.filter((x) => String(x?.[idKey]) !== id)];
    return next.slice(0, MAX);
}

export function getUserHistory() {
    return read();
}

export function trackProducerViewed(producerId, meta = {}) {
    if (!producerId) return;
    const store = read();
    store.viewed = pushUnique(store.viewed, { id: String(producerId), ...meta });
    store.visited = pushUnique(store.visited, { id: String(producerId), ...meta });
    write(store);
}

export function trackProductViewed(productId, meta = {}) {
    if (!productId) return;
    const store = read();
    store.products = pushUnique(store.products, { id: String(productId), ...meta });
    write(store);
}

export function trackSearchQuery(query) {
    const q = String(query || '').trim();
    if (q.length < 2) return;
    const store = read();
    store.searched = pushUnique(store.searched, { id: q.toLowerCase(), query: q }, 'id');
    write(store);
}

export function trackPurchase(productId, meta = {}) {
    if (!productId) return;
    const store = read();
    store.purchased = pushUnique(store.purchased, { id: String(productId), ...meta });
    write(store);
}

export function trackRouteSaved(routeId, meta = {}) {
    if (!routeId) return;
    const store = read();
    store.routes = pushUnique(store.routes, { id: String(routeId), ...meta });
    write(store);
}

export function trackReservation(reservationId, meta = {}) {
    if (!reservationId) return;
    const store = read();
    store.reservations = pushUnique(store.reservations, { id: String(reservationId), ...meta });
    write(store);
}

export function getRecentlyViewedIds(limit = 8) {
    return read().viewed.slice(0, limit).map((x) => x.id);
}

export function getFavoriteProductHints(limit = 12) {
    const store = read();
    const ids = [
        ...store.products.map((x) => x.id),
        ...store.purchased.map((x) => x.id)
    ];
    return [...new Set(ids)].slice(0, limit);
}

export default {
    getUserHistory,
    trackProducerViewed,
    trackProductViewed,
    trackSearchQuery,
    trackPurchase,
    trackRouteSaved,
    trackReservation,
    getRecentlyViewedIds,
    getFavoriteProductHints
};
