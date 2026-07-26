// js/map/mapSettings.js – ustawienia mapy (localStorage)

import { getCategoryIcon, getProducerTypeKey } from '../presentation/categoryIcons.js';

/** v3 – kolory kategorii z wymuszonym resetem czarnych/uszkodzonych wartości */
export const STORAGE_KEY = 'regionaler_smak_map_settings_v3';

/** Kategorie widoczne w legendzie mapy */
export const LEGEND_CATEGORIES = Object.freeze([
    'restaurant',
    'fast_food',
    'farmer',
    'bakery',
    'meat',
    'shop',
    'vending'
]);

export const MAP_CATEGORIES = Object.freeze([
    'farmer',
    'bakery',
    'restaurant',
    'fast_food',
    'meat',
    'shop',
    'vending',
    'other'
]);

/** Kolory kanoniczne kategorii (markery na mapie) */
export const DEFAULT_MARKER_COLORS = Object.freeze({
    farmer: '#27ae60',      // Rolnicy – zielony
    bakery: '#f39c12',      // Piekarnie – złoty
    restaurant: '#e67e22',  // Restauracje – pomarańczowy
    fast_food: '#8e44ad',   // Fast food – fioletowy
    meat: '#e74c3c',        // Mięso – czerwony
    shop: '#2980b9',        // Sklepy – niebieski
    vending: '#2c3e50',     // Automaty – ciemnoszary
    other: '#6b7280'        // Inne – szary (nie czarny)
});

export const MAP_STYLE_OPTIONS = Object.freeze({
    light: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors'
    },
    dark: {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '© CARTO © OpenStreetMap'
    },
    satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '© Esri'
    },
    terrain: {
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '© OpenTopoMap © OpenStreetMap'
    }
});

let runtimeSettings = null;

function defaultCategoryVisibility() {
    return MAP_CATEGORIES.reduce((acc, cat) => {
        acc[cat] = true;
        return acc;
    }, {});
}

export function getDefaultMapSettings() {
    return {
        markerColors: { ...DEFAULT_MARKER_COLORS },
        categoryVisibility: defaultCategoryVisibility(),
        mapStyle: 'light'
    };
}

function isSafeMarkerColor(value) {
    if (typeof value !== 'string') return false;
    const hex = value.trim();
    if (!/^#[0-9A-Fa-f]{3,8}$/.test(hex)) return false;
    // Odrzuć czarne / prawie czarne – wyglądają jak „zepsute” markery
    const raw = hex.slice(1);
    const full = raw.length === 3
        ? raw.split('').map((c) => c + c).join('')
        : raw.slice(0, 6);
    if (full.length < 6) return false;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    if (![r, g, b].every((n) => Number.isFinite(n))) return false;
    // Za ciemne = odrzuć (max składowa < 40)
    if (Math.max(r, g, b) < 40) return false;
    return true;
}

function normalizeSettings(raw) {
    const defaults = getDefaultMapSettings();
    const source = raw && typeof raw === 'object' ? raw : {};

    const markerColors = { ...defaults.markerColors };
    if (source.markerColors && typeof source.markerColors === 'object') {
        for (const cat of MAP_CATEGORIES) {
            if (isSafeMarkerColor(source.markerColors[cat])) {
                markerColors[cat] = source.markerColors[cat].trim();
            }
        }
    }

    const categoryVisibility = { ...defaults.categoryVisibility };
    if (source.categoryVisibility && typeof source.categoryVisibility === 'object') {
        for (const cat of MAP_CATEGORIES) {
            if (typeof source.categoryVisibility[cat] === 'boolean') {
                categoryVisibility[cat] = source.categoryVisibility[cat];
            }
        }
    }

    const mapStyle = MAP_STYLE_OPTIONS[source.mapStyle] ? source.mapStyle : defaults.mapStyle;

    return { markerColors, categoryVisibility, mapStyle };
}

export function loadMapSettings() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return getDefaultMapSettings();
        return normalizeSettings(JSON.parse(raw));
    } catch (_) {
        return getDefaultMapSettings();
    }
}

export function saveMapSettings(settings) {
    const normalized = normalizeSettings(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    runtimeSettings = normalized;
    return normalized;
}

export function resetMapSettings() {
    localStorage.removeItem(STORAGE_KEY);
    runtimeSettings = getDefaultMapSettings();
    return runtimeSettings;
}

export function initMapSettings() {
    runtimeSettings = loadMapSettings();
    return runtimeSettings;
}

export function getMapSettings() {
    if (!runtimeSettings) initMapSettings();
    return runtimeSettings;
}

export function setRuntimeMapSettings(settings) {
    runtimeSettings = normalizeSettings(settings);
    return runtimeSettings;
}

export function getMarkerColor(category) {
    const colors = getMapSettings().markerColors;
    let key = category;
    if (category === 'fastfood' || category === 'fastFood') key = 'fast_food';
    else if (category === 'farmers' || category === 'farm' || category === 'honey'
        || category === 'dairy' || category === 'fruit' || category === 'vegetables'
        || category === 'forest') {
        key = 'farmer';
    } else if (category === 'bakeries') key = 'bakery';
    else if (category === 'restaurants') key = 'restaurant';
    else if (category === 'shops') key = 'shop';
    const candidate = colors[key] || colors.other || DEFAULT_MARKER_COLORS[key] || DEFAULT_MARKER_COLORS.other;
    if (isSafeMarkerColor(candidate)) return candidate.trim();
    return DEFAULT_MARKER_COLORS[key] || DEFAULT_MARKER_COLORS.other;
}

export function isCategoryVisible(category) {
    const visibility = getMapSettings().categoryVisibility;
    let key = category;
    if (category === 'fastfood' || category === 'fastFood') key = 'fast_food';
    else if (category === 'farmers' || category === 'farm') key = 'farmer';
    if (visibility[key] === false) return false;
    // Brak wpisu w starych ustawieniach = widoczna (domyślnie true)
    return visibility[key] !== false;
}

export function getActiveMapStyle() {
    return getMapSettings().mapStyle || 'light';
}

/**
 * Wpisy legendy – kolory z ustawień użytkownika, ikony spójne z aplikacją.
 * @param {(key: string) => string} [t]
 */
export function getLegendEntries(t = (k) => k) {
    const settings = getMapSettings();

    return LEGEND_CATEGORIES.map((category) => ({
        category,
        icon: getCategoryIcon(category),
        color: settings.markerColors[category] || DEFAULT_MARKER_COLORS[category],
        label: t(`producer.types.${getProducerTypeKey(category)}`)
    }));
}

export default {
    STORAGE_KEY,
    MAP_CATEGORIES,
    DEFAULT_MARKER_COLORS,
    MAP_STYLE_OPTIONS,
    getDefaultMapSettings,
    loadMapSettings,
    saveMapSettings,
    resetMapSettings,
    initMapSettings,
    getMapSettings,
    setRuntimeMapSettings,
    getMarkerColor,
    isCategoryVisible,
    getActiveMapStyle,
    LEGEND_CATEGORIES,
    getLegendEntries
};
