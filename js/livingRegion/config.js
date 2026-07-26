/**
 * Living Region Engine — konfiguracja (bez UI).
 */

import { CONFIG } from '../config.js';

export const ENGINE_LS_OVERRIDE = 'rg_living_region_engine';
export const CACHE_KEY = 'rg_living_region_day_v1';
export const KNOWN_SET_KEY = 'rg_living_region_known_v1';
export const VISIT_SNAP_KEY = 'rg_living_region_visit_v1';

/** Max highlightów w getTodayHighlights */
export const MAX_HIGHLIGHTS = 5;

/** Promień okolicy (km) gdy jest GPS */
export const DEFAULT_RADIUS_KM = Number(CONFIG.defaultRadius) || 15;

/** Limit pozycji w payloadach list */
export const LIST_LIMIT = 8;

export function readConfigEnabled() {
    if (CONFIG.LIVING_REGION_ENGINE === false) return false;
    try {
        if (typeof localStorage !== 'undefined') {
            const v = localStorage.getItem(ENGINE_LS_OVERRIDE);
            if (v === '0' || v === 'false') return false;
            if (v === '1' || v === 'true') return true;
        }
    } catch {
        /* ignore */
    }
    return CONFIG.LIVING_REGION_ENGINE !== false;
}
