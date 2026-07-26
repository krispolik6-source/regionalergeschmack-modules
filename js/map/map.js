// js/map/map.js – markery, koło zasięgu i pinezka GPS

import { getGoogleMapsDirectionsUrl, getProducersInRadius } from '../data/producerHelpers.js';
import { t } from '../core/i18n.js';
import { getCategoryIcon, normalizeCategoryIconKey } from '../presentation/categoryIcons.js';
import { resolveChainLogoUrl } from '../presentation/chainBrands.js';
import { buildMapPopupHtml } from '../presentation/producerDisplay.js';
import { buildPopupAdHtml } from '../presentation/nativeAds.js?v=3';
import { getMarkerColor } from './mapSettings.js?v=2';
import { isFavorite } from '../core/favoritesStore.js';
import {
    resolveLivingMapCue,
    livingMapCueLabelKey
} from '../presentation/livingMap.js';
import { isProducerPromoted } from '../core/premiumService.js';

/** Diagnostyka lifecycle popupów (ETAP 8.1) – tymczasowe, świadome logi */
export function logPopupLifecycle(event, detail = {}) {
    try {
        const extra = Object.keys(detail).length ? detail : undefined;
        if (extra) console.info('[PopupLifecycle]', event, extra);
        else console.info('[PopupLifecycle]', event);
    } catch (_) {
        /* ignore */
    }
}

function createGpsPinIcon() {
    return window.L.divIcon({
        className: 'gps-pin-marker',
        html: `
            <div class="gps-pin" aria-hidden="true">
                <span class="gps-pin-head"></span>
                <span class="gps-pin-point"></span>
            </div>
        `,
        iconSize: [30, 38],
        iconAnchor: [15, 38],
        popupAnchor: [0, -38]
    });
}

function resolveMarkerEmoji(producer) {
    return getCategoryIcon(producer?.category);
}

function createCategoryIcon(producer, { entering = false } = {}) {
    const categoryKey = normalizeCategoryIconKey(producer?.category);
    // Tylko logo sieci (Lidl, Aldi, …) – bez abstrakcyjnych SVG kategorii
    const logoUrl = resolveChainLogoUrl(producer);
    const emoji = resolveMarkerEmoji(producer);
    const color = getMarkerColor(categoryKey);
    const enteringClass = entering ? ' is-entering' : '';
    const useLogo = Boolean(logoUrl);
    const cue = resolveLivingMapCue(producer);
    const cueClass = cue ? ` ${cue.className}` : '';
    const cueTitle = cue ? t(livingMapCueLabelKey(cue)) : '';
    const promoted = isProducerPromoted(producer);
    const promotedClass = promoted ? ' is-promoted' : '';
    const promotedLabel = String(t('ads.promoted') || 'Promowane').replace(/"/g, '&quot;');
    const titleAttr = cueTitle
        ? ` title="${String(cueTitle).replace(/"/g, '&quot;')}" data-lm-cue="${cue.id}"`
        : (promoted ? ` title="${promotedLabel}"` : '');
    const inner = useLogo
        ? `<img src="${logoUrl}" alt="" class="producer-marker-logo" width="22" height="22" loading="lazy" decoding="async" />`
        : `<span class="producer-marker-emoji">${emoji}</span>`;
    const promotedChip = promoted
        ? `<span class="producer-marker-promoted" aria-label="${promotedLabel}">★</span>`
        : '';

    const safeColor = /^#[0-9A-Fa-f]{3,8}$/.test(String(color || '')) ? color : '#6b7280';
    return window.L.divIcon({
        className: 'producer-marker-icon',
        html: `
            <div class="producer-marker-badge producer-marker-badge--${categoryKey}${enteringClass}${useLogo ? ' has-chain-logo' : ''}${cueClass}${promotedClass}" style="--marker-color:${safeColor}" data-category="${categoryKey}"${promoted ? ' data-promoted="1"' : ''}${titleAttr}>
                ${inner}
                ${promotedChip}
            </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20]
    });
}

/** ETAP 15C – odśwież klasy wskazówek bez setIcon (gdy badge już w DOM). */
function syncLivingMapCueOnMarker(marker, producer) {
    const badge = getMarkerBadge(marker);
    if (!badge || !producer) return;
    const cue = resolveLivingMapCue(producer);
    const prev = marker.__rgMeta?.livingCue || '';
    const next = cue?.id || '';
    if (prev === next && badge.dataset.lmCue === next) return;

    badge.classList.remove(
        'lm-cue',
        'lm-cue--closingSoon',
        'lm-cue--justOpened',
        'lm-cue--freshOpen',
        'lm-cue--recommended',
        'lm-cue--popular',
        'lm-cue--freshDelivery'
    );
    if (cue) {
        cue.className.split(/\s+/).filter(Boolean).forEach((c) => badge.classList.add(c));
        badge.dataset.lmCue = cue.id;
        badge.title = t(livingMapCueLabelKey(cue));
    } else {
        delete badge.dataset.lmCue;
        badge.removeAttribute('title');
    }
    if (marker.__rgMeta) marker.__rgMeta.livingCue = next;
}

function createClusterIcon(cluster) {
    const markers = cluster.getAllChildMarkers?.() || [];
    const categories = new Set(
        markers.map((m) => normalizeCategoryIconKey(m.options?.category || m.__rgMeta?.category))
    );
    const count = cluster.getChildCount?.() ?? markers.length;
    let color = '#6b7280';
    let emoji = '';
    if (categories.size === 1) {
        const cat = [...categories][0];
        color = getMarkerColor(cat);
        emoji = getCategoryIcon(cat);
    }

    return window.L.divIcon({
        className: 'rg-cluster-icon',
        html: `
            <div class="rg-cluster-badge" style="--marker-color:${color}">
                <span class="rg-cluster-count">${count}</span>
                ${emoji ? `<span class="rg-cluster-emoji" aria-hidden="true">${emoji}</span>` : ''}
            </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
    });
}

function favoriteLabel(id) {
    return isFavorite(id)
        ? `⭐ ${t('btn.favoriteSaved')}`
        : `⭐ ${t('btn.favorite')}`;
}

function buildPopupHtml(producer) {
    return buildMapPopupHtml(producer, {
        favoriteLabel: favoriteLabel(producer.id),
        navUrl: getGoogleMapsDirectionsUrl(producer.lat, producer.lng),
        buildAdHtml: buildPopupAdHtml
    });
}

let markerRegistry = new Map();
let markerClusterGroup = null;
let markersLayerGroup = null;
let markerBatchToken = 0;

const MARKER_BATCH_SIZE = 12;
/** Nowe markery: opacity 0 → 1 */
const MARKER_FADE_IN_MS = 200;
/** Usuwanie: opacity 1 → 0 */
const MARKER_FADE_OUT_MS = 150;

function getMarkerBadge(marker) {
    const iconEl = marker?.getElement?.() || marker?._icon;
    return iconEl?.querySelector?.('.producer-marker-badge') || null;
}

function cancelMarkerLeave(marker) {
    if (!marker) return;
    if (marker.__rgLeaveTimer) {
        clearTimeout(marker.__rgLeaveTimer);
        marker.__rgLeaveTimer = null;
    }
    marker.__rgLeaving = false;
    getMarkerBadge(marker)?.classList.remove('is-leaving');
}

function finishMarkerEnter(marker) {
    const badge = getMarkerBadge(marker);
    if (!badge?.classList.contains('is-entering')) return;

    const clearEntering = () => {
        badge.classList.remove('is-entering');
        badge.removeEventListener('animationend', clearEntering);
        if (marker) marker.__rgEnterTimer = null;
    };
    badge.addEventListener('animationend', clearEntering);
    if (marker.__rgEnterTimer) clearTimeout(marker.__rgEnterTimer);
    marker.__rgEnterTimer = window.setTimeout(clearEntering, MARKER_FADE_IN_MS + 50);
}

function ensureMarkerLayers(map) {
    const clusterAvailable = typeof window.L.markerClusterGroup === 'function';

    if (clusterAvailable) {
        if (!markerClusterGroup) {
            markerClusterGroup = window.L.markerClusterGroup({
                chunkedLoading: true,
                chunkDelay: 40,
                chunkInterval: 120,
                spiderfyOnMaxZoom: true,
                showCoverageOnHover: false,
                animate: false,
                // Bez animacji klastrów – stabilniejszy widok przy zoom/pan
                animateAddingMarkers: false,
                // Wygląd klastra: kolor/emoji gdy jedna kategoria (logika grupowania bez zmian)
                iconCreateFunction: createClusterIcon
            }).addTo(map);
        } else if (map && !map.hasLayer(markerClusterGroup)) {
            markerClusterGroup.addTo(map);
        }
        if (!markersLayerGroup) {
            markersLayerGroup = window.L.featureGroup().addTo(map);
        } else if (map && !map.hasLayer(markersLayerGroup)) {
            markersLayerGroup.addTo(map);
        }
        return;
    }

    markerClusterGroup = null;
    if (!markersLayerGroup) {
        markersLayerGroup = window.L.featureGroup().addTo(map);
    } else if (map && !map.hasLayer(markersLayerGroup)) {
        markersLayerGroup.addTo(map);
    }
}

function createProducerMarker(producer) {
    const lat = Number(producer?.lat);
    const lng = Number(producer?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    const producerId = String(producer.id || '').trim();
    if (!producerId) return null;

    const categoryKey = normalizeCategoryIconKey(producer.category);
    const marker = window.L.marker([lat, lng], {
        icon: createCategoryIcon(producer, { entering: true }),
        title: producer.name || '',
        producerId,
        category: categoryKey
    });

    try {
        marker.bindPopup(buildPopupHtml(producer), {
            maxWidth: 320,
            minWidth: 240,
            // autoPan przesuwa mapę → MarkerCluster przelicza warstwę i zamyka popup
            autoPan: false,
            closeOnClick: false,
            className: 'producer-leaflet-popup'
        });
    } catch (error) {
        console.error('[Map] Błąd bindPopup:', producerId, error);
        return null;
    }

    const livingCue = resolveLivingMapCue(producer)?.id || '';
    marker.__rgMeta = {
        id: producerId,
        lat,
        lng,
        category: categoryKey,
        name: String(producer.name || ''),
        promo: String(producer.promo || ''),
        livingCue
    };

    marker.on('popupopen', () => {
        logPopupLifecycle('OPEN', { id: producerId });
    });
    marker.on('popupclose', () => {
        logPopupLifecycle('POPUP_CLOSE', { id: producerId, source: 'marker' });
    });

    marker.on('click', () => {
        console.log('[Map] Marker kliknięty:', producerId);
        try {
            const popup = marker.getPopup?.();
            if (popup?.options) popup.options.autoPan = false;
            // Wymuś otwarcie – chroni przed race z odświeżeniem warstwy / klastrem
            if (!marker.isPopupOpen?.()) {
                marker.openPopup();
            }
        } catch (error) {
            console.warn('[Map] openPopup:', producerId, error);
        }
        try {
            document.dispatchEvent(new CustomEvent('rg:marker-click', {
                detail: { producerId }
            }));
        } catch (_) {
            /* ignore */
        }
    });

    return marker;
}

function updateExistingMarker(marker, producer) {
    if (!marker || !producer) return;

    const lat = Number(producer.lat);
    const lng = Number(producer.lng);
    const meta = marker.__rgMeta || {};
    const category = normalizeCategoryIconKey(producer.category);
    const name = String(producer.name || '');
    const promo = String(producer.promo || '');
    const popupOpen = Boolean(marker.isPopupOpen?.());
    const producerId = String(producer.id || meta.id || '');

    // Otwarty popup: NIE ruszaj latLng/ikony (klaster zamyka popup)
    if (popupOpen) {
        logPopupLifecycle('MARKER_SKIPPED', { id: producerId, reason: 'popup-open-no-latlng-icon' });
    } else if (Number.isFinite(lat) && Number.isFinite(lng)) {
        const cur = marker.getLatLng?.();
        if (!cur || Math.abs(cur.lat - lat) > 1e-6 || Math.abs(cur.lng - lng) > 1e-6) {
            marker.setLatLng([lat, lng]);
        }
    }

    const livingCue = resolveLivingMapCue(producer)?.id || '';

    if (!popupOpen && (meta.category !== category || meta.name !== name)) {
        marker.setIcon(createCategoryIcon(producer));
        if (marker.options) {
            marker.options.title = name;
            marker.options.category = category;
        }
    } else if (!popupOpen) {
        // ETAP 15C – tylko klasy wskazówek (bez nowego setIcon / Leaflet API)
        syncLivingMapCueOnMarker(marker, producer);
    }

    // Wyłącz autoPan na istniejących markerach (stare bindPopup miało autoPan:true)
    try {
        const popup = marker.getPopup?.();
        if (popup?.options) popup.options.autoPan = false;
    } catch (_) {
        /* ignore */
    }

    // Treść popupu wolno odświeżyć także przy otwartym popupie
    if (meta.name !== name || meta.promo !== promo || meta.category !== category) {
        try {
            marker.setPopupContent(buildPopupHtml(producer));
            logPopupLifecycle('MARKER_UPDATED', { id: producerId, contentOnly: popupOpen });
        } catch (error) {
            console.warn('[Map] setPopupContent:', error);
        }
    }

    marker.__rgMeta = {
        id: String(producer.id),
        lat: Number.isFinite(lat) ? lat : meta.lat,
        lng: Number.isFinite(lng) ? lng : meta.lng,
        category,
        name,
        promo,
        livingCue
    };
}

/** @returns {string|null} */
export function getOpenPopupProducerId(map = null) {
    for (const [id, marker] of markerRegistry.entries()) {
        if (marker?.isPopupOpen?.()) return id;
    }
    const source = map?._popup?._source;
    const fromMap = source?.__rgMeta?.id || source?.options?.producerId || '';
    return fromMap ? String(fromMap) : null;
}

/** ETAP 42 — liczba markerów w rejestrze (Map Guardian). */
export function getRegisteredMarkerCount() {
    return markerRegistry.size;
}

/** ETAP 42 — czy warstwa klastrów jest aktywna. */
export function hasMarkerClusterGroup() {
    return Boolean(markerClusterGroup);
}

export function getMarkerById(producerId) {
    if (!producerId) return null;
    return markerRegistry.get(String(producerId)) || null;
}

/**
 * Ponownie otwórz popup bez zmiany pozycji / zoom mapy.
 * @returns {boolean}
 */
export function reopenProducerPopup(producerId) {
    const marker = getMarkerById(producerId);
    if (!marker) return false;
    if (marker.isPopupOpen?.()) return true;
    try {
        logPopupLifecycle('POPUP_REOPEN', { id: String(producerId) });
        marker.openPopup();
        return Boolean(marker.isPopupOpen?.());
    } catch (error) {
        console.warn('[Map] reopenProducerPopup:', producerId, error);
        return false;
    }
}

function attachMarker(marker) {
    if (markerClusterGroup) {
        markerClusterGroup.addLayer(marker);
    } else if (markersLayerGroup) {
        marker.addTo(markersLayerGroup);
    }
}

function removeMarkerFromLayer(marker) {
    if (!marker) return;
    if (markerClusterGroup) {
        markerClusterGroup.removeLayer(marker);
    } else if (markersLayerGroup) {
        markersLayerGroup.removeLayer(marker);
    }
}

/** Płynne znikanie markera (opacity 1 → 0, ~150 ms) – bez bounce / scale */
function detachMarker(marker, { animate = true, force = false } = {}) {
    if (!marker) return;

    // Nigdy nie usuwaj markera z otwartym popupem (ani clearLayers / removeLayer)
    if (!force && marker.isPopupOpen?.()) {
        logPopupLifecycle('MARKER_SKIPPED', {
            id: marker.__rgMeta?.id,
            reason: 'detach-blocked-popup-open'
        });
        return;
    }

    const id = String(marker.__rgMeta?.id ?? '');
    if (marker.__rgEnterTimer) {
        clearTimeout(marker.__rgEnterTimer);
        marker.__rgEnterTimer = null;
    }

    if (!animate) {
        cancelMarkerLeave(marker);
        if (id) markerRegistry.delete(id);
        removeMarkerFromLayer(marker);
        return;
    }

    if (marker.__rgLeaving) return;

    const badge = getMarkerBadge(marker);
    if (!badge) {
        if (id) markerRegistry.delete(id);
        removeMarkerFromLayer(marker);
        return;
    }

    marker.__rgLeaving = true;
    badge.classList.remove('is-entering');
    badge.classList.add('is-leaving');
    marker.__rgLeaveTimer = window.setTimeout(() => {
        marker.__rgLeaveTimer = null;
        marker.__rgLeaving = false;
        // Popup mógł się otworzyć w trakcie fade-out
        if (marker.isPopupOpen?.()) {
            marker.__rgLeaving = false;
            getMarkerBadge(marker)?.classList.remove('is-leaving');
            return;
        }
        if (id) markerRegistry.delete(id);
        removeMarkerFromLayer(marker);
    }, MARKER_FADE_OUT_MS);
}

/**
 * Inteligentne markery w promieniu – diff bez migania:
 * + nowe w zasięgu (fade-in ~200 ms)
 * − poza zasięgiem (fade-out ~150 ms)
 * ~ aktualizacja istniejących IN PLACE (ten sam producer.id → ta sama instancja L.Marker)
 */
export function addMarkers(map, producers = [], options = {}) {
    if (!map || typeof window.L === 'undefined') return 0;

    const {
        fitBounds = false,
        batchSize = MARKER_BATCH_SIZE,
        preserveExisting = false,
        deferRemovals: deferRemovalsOpt = false,
        deferAdds: deferAddsOpt = false,
        openedPopupId: openedPopupIdOpt = null,
        allowReopen = false
    } = options;
    ensureMarkerLayers(map);

    const openedPopupId = openedPopupIdOpt || getOpenPopupProducerId(map);
    // Defer tylko gdy jawnie zlecone (OSM soft-sync). Otwarty popup NIE blokuje
    // usuwania innych markerów (filtr kategorii) – chronimy wyłącznie ten jeden id.
    const deferRemovals = Boolean(deferRemovalsOpt);
    const deferAdds = Boolean(deferAddsOpt);
    const preserve = Boolean(preserveExisting);

    if (deferAdds || deferRemovals) {
        logPopupLifecycle('SYNC_DEFERRED', {
            id: openedPopupId,
            deferAdds,
            deferRemovals,
            toPreserve: preserve
        });
    } else {
        logPopupLifecycle('SYNC_START', {
            count: Array.isArray(producers) ? producers.length : 0,
            openedPopupId: openedPopupId || null
        });
    }

    const list = Array.isArray(producers) ? producers : [];
    const desiredIds = new Set();
    const toAdd = [];

    for (const producer of list) {
        const id = String(producer?.id ?? '');
        if (!id) continue;
        desiredIds.add(id);

        const existing = markerRegistry.get(id);
        if (existing) {
            // Anuluj fade-out, jeśli wrócił do promienia – bez nowej instancji
            cancelMarkerLeave(existing);
            updateExistingMarker(existing, producer);
            continue;
        }
        toAdd.push(producer);
    }

    // Usuwaj tylko gdy nie ma otwartego popupu / nie ma defer
    if (!preserve && !deferRemovals) {
        for (const [id, marker] of [...markerRegistry.entries()]) {
            if (desiredIds.has(id)) continue;
            if (openedPopupId && id === String(openedPopupId)) continue;
            if (marker.isPopupOpen?.()) continue;
            detachMarker(marker, { animate: true });
        }
    }

    const finishSync = () => {
        // reopen TYLKO gdy jawnie dozwolone i popup faktycznie zgasł (nie po OSM sync)
        if (allowReopen && openedPopupId) {
            const marker = getMarkerById(openedPopupId);
            if (marker && !marker.isPopupOpen?.()) {
                requestAnimationFrame(() => reopenProducerPopup(openedPopupId));
            }
        }

        if (fitBounds && !openedPopupId && markerRegistry.size > 0) {
            const boundsSource = markerClusterGroup || markersLayerGroup;
            const bounds = boundsSource?.getBounds?.();
            if (bounds?.isValid?.()) {
                map.fitBounds(bounds.pad(0.12));
            }
        }
    };

    if (deferAdds || toAdd.length === 0) {
        if (deferAdds && toAdd.length > 0) {
            logPopupLifecycle('SYNC_DEFERRED', {
                id: openedPopupId,
                queuedAdds: toAdd.length
            });
        }
        finishSync();
        return preserve || deferRemovals || deferAdds
            ? markerRegistry.size
            : desiredIds.size;
    }

    const token = ++markerBatchToken;
    const chunk = Math.max(1, Number(batchSize) || MARKER_BATCH_SIZE);

    const addBatch = (startIndex) => {
        if (token !== markerBatchToken) return;

        const endIndex = Math.min(startIndex + chunk, toAdd.length);
        for (let i = startIndex; i < endIndex; i++) {
            const producer = toAdd[i];
            const id = String(producer.id);
            // Ten sam id → nigdy nowej instancji
            if (markerRegistry.has(id)) continue;

            const marker = createProducerMarker(producer);
            if (!marker) continue;

            attachMarker(marker);
            markerRegistry.set(id, marker);
            requestAnimationFrame(() => finishMarkerEnter(marker));
        }

        if (endIndex < toAdd.length) {
            requestAnimationFrame(() => addBatch(endIndex));
            return;
        }

        finishSync();
    };

    addBatch(0);

    return preserve || deferRemovals
        ? markerRegistry.size
        : desiredIds.size;
}

export function replaceMarkers(map, producers = [], options = {}) {
    if (!map || typeof window.L === 'undefined') return 0;
    return addMarkers(map, producers, options);
}

/**
 * Filtruje producentów w promieniu i odświeża markery na mapie.
 */
export function filterMarkersByRadius(map, producers, center, radiusKm) {
    const lat = Number(center?.lat ?? center?.[0]);
    const lng = Number(center?.lng ?? center?.[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return replaceMarkers(map, producers);
    }
    const inRadius = getProducersInRadius(producers, radiusKm, { lat, lng });
    return replaceMarkers(map, inRadius);
}

export function resetMarkersLayer() {
    const openId = getOpenPopupProducerId();
    if (openId) {
        logPopupLifecycle('POPUP_DESTROY', { id: openId, reason: 'resetMarkersLayer' });
    }
    markerBatchToken += 1;
    for (const marker of markerRegistry.values()) {
        cancelMarkerLeave(marker);
        if (marker.__rgEnterTimer) {
            clearTimeout(marker.__rgEnterTimer);
            marker.__rgEnterTimer = null;
        }
    }
    if (markerClusterGroup) {
        markerClusterGroup.clearLayers();
    }
    if (markersLayerGroup) {
        markersLayerGroup.clearLayers();
    }
    markersLayerGroup = null;
    markerClusterGroup = null;
    markerRegistry.clear();
}

export function focusProducerMarker(map, producerId) {
    if (!map || typeof window.L === 'undefined') return false;
    const marker = markerRegistry.get(String(producerId));
    if (!marker) return false;

    const latLng = marker.getLatLng();
    map.setView(latLng, Math.max(map.getZoom(), 15), { animate: true });

    if (markerClusterGroup?.zoomToShowLayer) {
        markerClusterGroup.zoomToShowLayer(marker, () => marker.openPopup());
    } else {
        marker.openPopup();
    }
    return true;
}

export function resetRadiusCircle() {
    if (radiusCircleLayer) {
        try {
            radiusCircleLayer.remove();
        } catch (_) {
            /* ignore */
        }
    }
    radiusCircleLayer = null;
}

export function resetGpsPin() {
    if (gpsMarkerLayer) {
        try {
            gpsMarkerLayer.remove();
        } catch (_) {
            /* ignore */
        }
    }
    gpsMarkerLayer = null;
}

let radiusCircleLayer = null;
let gpsMarkerLayer = null;

/**
 * Okrąg zasięgu – jeden obiekt Leaflet.
 * Przy kolejnych update'ach tylko setLatLng / setRadius (bez new L.circle).
 */
export function updateRadiusCircle(map, center, radiusKm) {
    if (!map || !center || typeof window.L === 'undefined') return null;

    const radiusM = Number(radiusKm) * 1000;
    if (!Number.isFinite(radiusM) || radiusM <= 0) return null;

    const latLng = Array.isArray(center)
        ? center
        : [center.lat ?? center.latitude, center.lng ?? center.longitude];
    const lat = Number(latLng[0]);
    const lng = Number(latLng[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    if (radiusCircleLayer && map.hasLayer(radiusCircleLayer)) {
        radiusCircleLayer.setLatLng([lat, lng]);
        radiusCircleLayer.setRadius(radiusM);
        return radiusCircleLayer;
    }

    // Warstwa zgubiona (np. po rebuild mapy) – jeden nowy obiekt, potem tylko update
    if (radiusCircleLayer) {
        try {
            radiusCircleLayer.remove();
        } catch (_) {
            /* ignore */
        }
        radiusCircleLayer = null;
    }

    radiusCircleLayer = window.L.circle([lat, lng], {
        radius: radiusM,
        color: '#456696',
        fillColor: '#456696',
        fillOpacity: 0.15,
        weight: 2,
        opacity: 0.75
    }).addTo(map);

    return radiusCircleLayer;
}

export function updateGpsPin(map, center) {
    if (!map || typeof window.L === 'undefined') return null;

    const latLng = Array.isArray(center) ? center : [center.lat, center.lng];
    const lat = Number(latLng[0] ?? latLng.lat);
    const lng = Number(latLng[1] ?? latLng.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    if (gpsMarkerLayer && map.hasLayer(gpsMarkerLayer)) {
        gpsMarkerLayer.setLatLng([lat, lng]);
        return gpsMarkerLayer;
    }

    if (gpsMarkerLayer) {
        try {
            gpsMarkerLayer.remove();
        } catch (_) {
            /* ignore */
        }
        gpsMarkerLayer = null;
    }

    gpsMarkerLayer = window.L.marker([lat, lng], {
        icon: createGpsPinIcon(),
        zIndexOffset: 1000,
        interactive: false
    }).addTo(map);

    return gpsMarkerLayer;
}

export function getCategoryIconForMap(category, producer) {
    return getCategoryIcon(producer?.category || category);
}

export default {
    addMarkers,
    replaceMarkers,
    filterMarkersByRadius,
    resetMarkersLayer,
    updateRadiusCircle,
    resetRadiusCircle,
    updateGpsPin,
    resetGpsPin,
    focusProducerMarker,
    getOpenPopupProducerId,
    getMarkerById,
    reopenProducerPopup,
    logPopupLifecycle,
    getCategoryIconForMap
};
