// js/map/gpsListRefreshPolicy.js – K2: kiedy odświeżać listę producentów po GPS

import { getDistanceKm } from '../data/dataService.js';

/** Minimalny ruch (m) zanim odświeżymy listę producentów. */
export const LIST_REFRESH_MOVE_THRESHOLD_M = 100;
/** Debounce odświeżenia listy po sensownym ruchu GPS. */
export const LIST_REFRESH_DEBOUNCE_MS = 5000;

export function gpsListDistanceMeters(a, b) {
    if (!a || !b) return Infinity;
    return getDistanceKm(a.lat, a.lng, b.lat, b.lng) * 1000;
}

/**
 * Czy przebudować listę producentów po ticku GPS.
 * Pierwszy fix zawsze tak; kolejne tylko gdy ruch ≥ thresholdM.
 */
export function shouldRefreshProducerListOnGps(lastRefreshLocation, location, {
    isFirstFix = false,
    thresholdM = LIST_REFRESH_MOVE_THRESHOLD_M
} = {}) {
    if (isFirstFix) return true;
    if (!lastRefreshLocation) return true;
    if (!location) return false;
    return gpsListDistanceMeters(lastRefreshLocation, location) >= thresholdM;
}
