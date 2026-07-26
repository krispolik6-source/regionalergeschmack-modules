/**
 * Presety regionów – skalowanie OSM (centrum + promień).
 * Bez zmiany Store / EventBus / Leaflet core.
 */

export const REGION_STORAGE_KEY = 'rg_selected_region';

/** @typedef {{ id: string, lat: number, lng: number, radiusKm: number, nameKey: string }} RegionPreset */

/** @type {readonly RegionPreset[]} */
export const REGION_PRESETS = Object.freeze([
    {
        id: 'osnabrueck',
        lat: 52.2799,
        lng: 8.0472,
        radiusKm: 15,
        nameKey: 'regions.osnabrueck'
    },
    {
        id: 'bielefeld',
        lat: 52.0302,
        lng: 8.5325,
        radiusKm: 15,
        nameKey: 'regions.bielefeld'
    },
    {
        id: 'hilter',
        lat: 52.1478,
        lng: 8.1506,
        radiusKm: 10,
        nameKey: 'regions.hilter'
    },
    {
        id: 'muenster',
        lat: 51.9607,
        lng: 7.6261,
        radiusKm: 15,
        nameKey: 'regions.muenster'
    }
]);

/**
 * @param {string} id
 * @returns {RegionPreset | null}
 */
export function getRegionById(id) {
    const key = String(id || '').trim();
    if (!key) return null;
    return REGION_PRESETS.find((r) => r.id === key) || null;
}

export function getSelectedRegionId() {
    try {
        return String(localStorage.getItem(REGION_STORAGE_KEY) || '').trim() || '';
    } catch (_) {
        return '';
    }
}

/**
 * @param {string} id
 */
export function setSelectedRegionId(id) {
    try {
        const key = String(id || '').trim();
        if (!key) localStorage.removeItem(REGION_STORAGE_KEY);
        else localStorage.setItem(REGION_STORAGE_KEY, key);
    } catch (_) {
        /* ignore */
    }
}

/**
 * @deprecated ETAP 32B — UI select Region usunięty z mapy; zostawione pod testy (`test-region-presets`).
 * @param {(key: string) => string} t
 * @param {string} [selectedId]
 */
export function buildRegionSelectOptionsHtml(t, selectedId = getSelectedRegionId()) {
    const sel = String(selectedId || '');
    const parts = [];
    // Bez opcji „Moja lokalizacja (GPS)” – lokalizacja zostaje przy przycisku #mapGpsBtn
    if (!sel) {
        parts.push('<option value="" selected disabled hidden></option>');
    }
    for (const r of REGION_PRESETS) {
        const label = String(t(r.nameKey) || r.id).replace(/</g, '&lt;');
        const selected = r.id === sel ? ' selected' : '';
        parts.push(`<option value="${r.id}"${selected}>${label}</option>`);
    }
    return parts.join('');
}
