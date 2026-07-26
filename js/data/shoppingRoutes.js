// js/data/shoppingRoutes.js – ulubione trasy zakupowe (localStorage)

import { getDistanceKm } from './producerHelpers.js';
import { getLastPosition } from '../core/userLocation.js';
import { getProducerById } from './dataService.js';

const STORAGE_KEY = 'rg_shopping_routes_v1';
const MAX_ROUTES = 12;
const MAX_STOPS = 8;

function readAll() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
    } catch (_) {
        return [];
    }
}

function writeAll(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_ROUTES)));
}

/**
 * Sortuj ID producentów najbliższy→najdalszy od GPS (heurystyka trasy).
 * @param {string[]} producerIds
 * @param {{ lat: number, lng: number } | null} [origin]
 */
export function orderStopsByDistance(producerIds, origin = getLastPosition()) {
    const ids = (producerIds || []).map(String).filter(Boolean).slice(0, MAX_STOPS);
    if (!origin) return ids;

    return ids
        .map((id) => {
            const p = getProducerById(id);
            const d = p && Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng))
                ? getDistanceKm(origin.lat, origin.lng, Number(p.lat), Number(p.lng))
                : Infinity;
            return { id, d };
        })
        .sort((a, b) => a.d - b.d)
        .map((x) => x.id);
}

/**
 * Google Maps directions z wieloma przystankami.
 * @param {string[]} producerIds
 */
export function buildMultiStopMapsUrl(producerIds) {
    const ordered = orderStopsByDistance(producerIds);
    const coords = ordered
        .map((id) => getProducerById(id))
        .filter((p) => p && Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng)))
        .map((p) => `${Number(p.lat)},${Number(p.lng)}`);

    if (!coords.length) return '';
    if (coords.length === 1) {
        return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coords[0])}`;
    }

    const origin = coords[0];
    const destination = coords[coords.length - 1];
    const waypoints = coords.slice(1, -1).join('|');
    let url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
    if (waypoints) url += `&waypoints=${encodeURIComponent(waypoints)}`;
    return url;
}

/**
 * @param {{ name?: string, producerIds: string[] }} input
 */
export function saveShoppingRoute(input) {
    const producerIds = orderStopsByDistance(input?.producerIds || []);
    if (producerIds.length < 2) return null;

    const route = {
        id: `route_${Date.now()}`,
        name: String(input.name || '').trim() || `Route ${new Date().toLocaleDateString()}`,
        producerIds,
        createdAt: Date.now()
    };

    const list = readAll();
    list.unshift(route);
    writeAll(list);
    return route;
}

export function getShoppingRoutes() {
    return readAll();
}

export function deleteShoppingRoute(routeId) {
    writeAll(readAll().filter((r) => String(r.id) !== String(routeId)));
}

export function openRouteInMaps(routeOrIds) {
    const ids = Array.isArray(routeOrIds)
        ? routeOrIds
        : (routeOrIds?.producerIds || []);
    const url = buildMultiStopMapsUrl(ids);
    if (url && typeof window !== 'undefined') {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
    return url;
}

export default {
    orderStopsByDistance,
    buildMultiStopMapsUrl,
    saveShoppingRoute,
    getShoppingRoutes,
    deleteShoppingRoute,
    openRouteInMaps
};
