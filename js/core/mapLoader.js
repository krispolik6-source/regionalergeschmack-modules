/**
 * Lazy load: Leaflet + MarkerCluster + js/views/map.js — dopiero przy wejściu na mapę.
 */
import { t } from './i18n.js';

export const MAP_MODULE_VERSION = 48;
export const MAP_MODULE_URL = `../views/map.js?v=${MAP_MODULE_VERSION}`;

const LEAFLET_VERSION = '1.9.4';
const MARKER_CLUSTER_VERSION = '1.5.3';

let leafletPromise = null;
let mapModulePromise = null;
/** @type {import('../views/map.js?v=48') | null} */
let mapModule = null;
let pendingSearchQuery = null;
let renderGeneration = 0;

function loadStylesheet(href, id) {
    if (document.getElementById(id)) return Promise.resolve();
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = href;
        link.crossOrigin = 'anonymous';
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`CSS failed: ${href}`));
        document.head.appendChild(link);
    });
}

function loadScript(src, id) {
    const existing = document.getElementById(id);
    if (existing) {
        if (existing.dataset.rgLoaded === 'true') return Promise.resolve();
        return new Promise((resolve, reject) => {
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error(`Script failed: ${src}`)), { once: true });
        });
    }
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.id = id;
        script.src = src;
        script.crossOrigin = 'anonymous';
        script.async = false;
        script.onload = () => {
            script.dataset.rgLoaded = 'true';
            resolve();
        };
        script.onerror = () => reject(new Error(`Script failed: ${src}`));
        document.head.appendChild(script);
    });
}

export function ensureLeafletLoaded() {
    if (window.L && typeof window.L.markerClusterGroup === 'function') {
        return Promise.resolve(window.L);
    }
    if (leafletPromise) return leafletPromise;

    leafletPromise = (async () => {
        await loadStylesheet(
            `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`,
            'rg-leaflet-css'
        );
        await loadScript(
            `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`,
            'rg-leaflet-js'
        );
        await loadStylesheet(
            `https://unpkg.com/leaflet.markercluster@${MARKER_CLUSTER_VERSION}/dist/MarkerCluster.css`,
            'rg-markercluster-css'
        );
        await loadStylesheet(
            `https://unpkg.com/leaflet.markercluster@${MARKER_CLUSTER_VERSION}/dist/MarkerCluster.Default.css`,
            'rg-markercluster-default-css'
        );
        await loadScript(
            `https://unpkg.com/leaflet.markercluster@${MARKER_CLUSTER_VERSION}/dist/leaflet.markercluster.js`,
            'rg-markercluster-js'
        );
        if (typeof window.L === 'undefined') {
            throw new Error('Leaflet unavailable after load');
        }
        return window.L;
    })().catch((error) => {
        leafletPromise = null;
        throw error;
    });

    return leafletPromise;
}

function applyPendingSearch(mod) {
    if (pendingSearchQuery === null || !mod?.setSearchQuery) return;
    mod.setSearchQuery(pendingSearchQuery);
    pendingSearchQuery = null;
}

export function queueSearchQuery(query) {
    pendingSearchQuery = query || '';
    if (mapModule?.setSearchQuery) {
        mapModule.setSearchQuery(pendingSearchQuery);
        pendingSearchQuery = null;
    }
}

export function loadMapModule() {
    if (mapModule) return Promise.resolve(mapModule);
    if (mapModulePromise) return mapModulePromise;

    mapModulePromise = ensureLeafletLoaded()
        .then(() => import(/* @vite-ignore */ MAP_MODULE_URL))
        .then((mod) => {
            mapModule = mod;
            applyPendingSearch(mod);
            return mod;
        })
        .catch((error) => {
            mapModulePromise = null;
            throw error;
        });

    return mapModulePromise;
}

export function showMapLoadingPanel(panel) {
    if (!panel) return;
    panel.innerHTML = `
        <div class="map-view-loading" role="status" aria-live="polite" aria-busy="true">
            <div class="map-view-loading__spinner" aria-hidden="true"></div>
            <p class="map-view-loading__text">${t('msg.loading')}</p>
        </div>
    `;
}

export async function renderMapLazy(panel, options = {}) {
    if (!panel) return;

    const gen = ++renderGeneration;
    if (!mapModule) {
        showMapLoadingPanel(panel);
    }

    try {
        const mod = await loadMapModule();
        if (gen !== renderGeneration) return;
        mod.renderMap(panel, options);
    } catch (error) {
        if (gen !== renderGeneration) return;
        console.error('[MapLoader] render failed', error);
        panel.innerHTML = `
            <div class="error-view map-view-loading map-view-loading--error">
                <h2>❌ ${t('msg.error')}</h2>
                <p>${t('map.loadError')}</p>
            </div>
        `;
    }
}
