// js/presentation/geoFormat.js – odległość + ETA (bez API tras)

import { t } from '../core/i18n.js';

function geoLabel(key, vars = {}) {
    let text = t(`geo.${key}`);
    if (text === `geo.${key}`) return '';
    for (const [k, v] of Object.entries(vars)) {
        text = text.replace(`{${k}}`, String(v));
    }
    return text;
}

/** @param {number|null|undefined} km */
export function formatDistanceLabel(km) {
    const value = Number(km);
    if (!Number.isFinite(value) || value < 0) return '';
    if (value < 1) {
        const meters = Math.round(value * 1000);
        if (meters < 50) return geoLabel('under50m') || '< 50 m';
        return geoLabel('meters', { n: meters }) || `${meters} m`;
    }
    if (value < 10) {
        const n = value.toFixed(1);
        return geoLabel('kmOneDecimal', { n }) || `${n} km`;
    }
    const n = Math.round(value);
    return geoLabel('km', { n }) || `${n} km`;
}

/**
 * Orientacyjne ETA: pieszo 5 km/h, rower 15, auto 50.
 * @param {number|null|undefined} km
 */
export function formatEtaLabels(km) {
    const value = Number(km);
    if (!Number.isFinite(value) || value < 0) {
        return { walk: '', bike: '', car: '', compact: '' };
    }

    const minutes = (speedKmh) => {
        const m = Math.max(1, Math.round((value / speedKmh) * 60));
        if (m >= 60) {
            const h = Math.round(m / 60);
            return geoLabel('hours', { n: h }) || `${h} h`;
        }
        return geoLabel('minutes', { n: m }) || `${m} min`;
    };

    const walk = minutes(5);
    const bike = minutes(15);
    const car = minutes(50);

    return {
        walk,
        bike,
        car,
        compact: `🚶 ${walk} · 🚲 ${bike} · 🚗 ${car}`
    };
}

/**
 * @param {number|null|undefined} km
 * @returns {string} np. "450 m · 🚶 7 min"
 */
export function formatDistanceWithEta(km) {
    const dist = formatDistanceLabel(km);
    if (!dist) return '';
    const eta = formatEtaLabels(km);
    return `${dist} · 🚶 ${eta.walk}`;
}

export default { formatDistanceLabel, formatEtaLabels, formatDistanceWithEta };
