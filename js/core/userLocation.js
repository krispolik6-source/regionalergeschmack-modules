// js/core/userLocation.js – bieżąca lokalizacja użytkownika (GPS + localStorage)

import { getDistanceKm } from '../data/producerHelpers.js';

export const LAST_POSITION_KEY = 'rg_last_position';

const GEO_OPTIONS = Object.freeze({
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 20000
});

function isValidCoord(lat, lng) {
    return Number.isFinite(lat) && Number.isFinite(lng)
        && lat >= -90 && lat <= 90
        && lng >= -180 && lng <= 180;
}

/**
 * Zapisuje ostatnią znaną pozycję użytkownika.
 * @param {number} lat
 * @param {number} lng
 * @param {string} [source]
 */
export function saveLastPosition(lat, lng, source = 'gps') {
    if (!isValidCoord(Number(lat), Number(lng))) return;
    if (typeof localStorage === 'undefined') return;

    try {
        localStorage.setItem(LAST_POSITION_KEY, JSON.stringify({
            lat: Number(lat),
            lng: Number(lng),
            source,
            updatedAt: Date.now()
        }));
    } catch (_) {
        /* ignore quota errors */
    }
}

/**
 * Odczytuje zapisaną pozycję z localStorage.
 * @returns {{ lat: number, lng: number, source?: string, updatedAt?: number } | null}
 */
export function getLastPosition() {
    if (typeof localStorage === 'undefined') return null;

    try {
        const raw = localStorage.getItem(LAST_POSITION_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        const lat = Number(parsed?.lat);
        const lng = Number(parsed?.lng);
        if (!isValidCoord(lat, lng)) return null;

        return {
            lat,
            lng,
            source: parsed?.source || 'stored',
            updatedAt: parsed?.updatedAt
        };
    } catch (_) {
        return null;
    }
}

/**
 * Jednorazowe pobranie pozycji z GPS (zapisuje do localStorage).
 * @param {{ timeout?: number }} [options]
 * @returns {Promise<{ lat: number, lng: number }>}
 */
export function requestCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            reject(new Error('geolocation_unavailable'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const loc = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                saveLastPosition(loc.lat, loc.lng, 'gps');
                resolve(loc);
            },
            (error) => reject(error),
            { ...GEO_OPTIONS, ...options }
        );
    });
}

/**
 * Zwraca współrzędne do mapy/OSM: najpierw zapisane, potem GPS.
 * @param {{ preferGps?: boolean }} [options]
 * @returns {Promise<{ lat: number, lng: number } | null>}
 */
export async function resolveUserLocation(options = {}) {
    const { preferGps = false } = options;

    if (preferGps) {
        try {
            return await requestCurrentPosition();
        } catch (_) {
            return getLastPosition();
        }
    }

    const stored = getLastPosition();
    if (stored) return { lat: stored.lat, lng: stored.lng };

    try {
        return await requestCurrentPosition();
    } catch (_) {
        return null;
    }
}

/**
 * Czy cache producentów dotyczy tej samej okolicy co żądanie.
 * @param {number} cacheLat
 * @param {number} cacheLng
 * @param {number} requestLat
 * @param {number} requestLng
 * @param {number} [maxKm]
 */
export function isCacheNearLocation(cacheLat, cacheLng, requestLat, requestLng, maxKm = 20) {
    if (!isValidCoord(cacheLat, cacheLng) || !isValidCoord(requestLat, requestLng)) {
        return false;
    }
    return getDistanceKm(cacheLat, cacheLng, requestLat, requestLng) <= maxKm;
}
