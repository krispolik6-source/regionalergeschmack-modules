// js/views/map.js – widok mapy (Leaflet + OpenStreetMap)
import { eventBus } from '../core/eventBus.js';
import { EVENTS } from '../core/events.js';
import { CONFIG } from '../config.js';
import { t } from '../core/i18n.js';
import {
    replaceMarkers,
    updateRadiusCircle,
    resetRadiusCircle,
    updateGpsPin,
    resetGpsPin,
    resetMarkersLayer,
    focusProducerMarker,
    getOpenPopupProducerId,
    getMarkerById,
    getRegisteredMarkerCount,
    hasMarkerClusterGroup,
    reopenProducerPopup,
    logPopupLifecycle
} from '../map/map.js?v=26';
import {
    loadAllData,
    getProducers,
    filterProducersByCategory,
    getProducersInRadius,
    getDistanceKm,
    hydrateProducersFromCache,
    abortPendingDataLoads,
    isProducersEmptyArea,
    isProducersLoadSettled
} from '../data/dataService.js';
import { getActiveAbortControllerCount } from '../data/osmService.js?v=10';
import { formatDistanceLabel, formatEtaLabels } from '../presentation/geoFormat.js';
import { sortProducersByDistance } from '../presentation/smartRecommend.js';
import { filterProducersBySearch, searchGlobalResults, formatSearchNoResults } from '../presentation/searchFilter.js?v=4';
import { HOME_CATEGORY_MAP, normalizeProducerCategory } from '../data/producerHelpers.js';
import { saveLastPosition, getLastPosition, resolveUserLocation, requestCurrentPosition } from '../core/userLocation.js';
import {
    getRegionById,
    getSelectedRegionId
} from '../data/regionPresets.js';
import { addFavorite, removeFavorite, isFavorite, refreshFavoritesBadge } from './favorites.js';
import {
    openProducerModal,
    closeProducerModal,
    initProducerModal,
    isProducerModalOpen
} from './producerModal.js?v=7';
import { handleNativeAdClick } from '../presentation/nativeAds.js?v=3';
import { handlePromoFlyerToggle } from '../presentation/producerDisplay.js';
import { isProducerPromoted } from '../core/premiumService.js';
import { showToast } from '../core/toast.js';
import { logMapDriveDiag } from '../core/logger.js';
import { diffMapChanges, formatMapChangesMessage, ensureMapVisitBaseline } from '../presentation/mapChanges.js';
import {
    initMapSettings,
    MAP_STYLE_OPTIONS,
    getActiveMapStyle,
    isCategoryVisible,
    getLegendEntries
} from '../map/mapSettings.js?v=2';
import {
    ensureMapSettingsPanel,
    bindMapSettingsPanel,
    closeMapSettingsPanel
} from '../map/mapSettingsPanel.js?v=2';
import { initMapControlsDrag } from '../map/mapControlsDrag.js';
import {
    attachDraggableProducerPopup,
    detachDraggableProducerPopup
} from '../map/draggableProducerPopup.js';
import { CATEGORY_ICONS } from '../presentation/categoryIcons.js';
import {
    LIST_REFRESH_DEBOUNCE_MS,
    shouldRefreshProducerListOnGps
} from '../map/gpsListRefreshPolicy.js';

const MAP_ZOOM = 13;
const MAP_ZOOM_OVERVIEW = 6;
/** Neutralne centrum Niemiec – tylko widok mapy przed GPS, bez zapytań OSM */
const MAP_OVERVIEW_CENTER = [51.1657, 10.4515];
const RADIUS_MIN = CONFIG.minRadius ?? 1;
const RADIUS_MAX = CONFIG.maxRadius ?? 50;
const RADIUS_DEFAULT = CONFIG.defaultRadius ?? 10;
const MAP_PREFS_KEY = 'rg_map_prefs_v1';
const MAP_TOOLBAR_SHEET_MQ = '(max-width: 768px)';
/** Poniżej tej wysokości roboczej – auto-zwijanie panelu przy popupie (px). */
const MAP_TOOLBAR_AUTO_COLLAPSE_HEIGHT_PX = 700;
/** Landscape phone: sheet aktywny przy małej wysokości do tej szerokości (px). */
const MAP_TOOLBAR_COMPACT_MAX_WIDTH_PX = 1024;

function clampRadius(km) {
    const value = Number(km);
    if (!Number.isFinite(value)) return RADIUS_DEFAULT;
    return Math.min(RADIUS_MAX, Math.max(RADIUS_MIN, Math.round(value)));
}

function readMapPrefs() {
    if (typeof localStorage === 'undefined') return {};
    try {
        const raw = localStorage.getItem(MAP_PREFS_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
        return {};
    }
}

function writeMapPrefs(patch) {
    if (typeof localStorage === 'undefined') return;
    try {
        const next = { ...readMapPrefs(), ...patch, updatedAt: Date.now() };
        localStorage.setItem(MAP_PREFS_KEY, JSON.stringify(next));
    } catch (_) {
        /* ignore quota */
    }
}

/** Zapis: promień, zoom, pozycja mapy, follow, tracking, kategoria, search */
function persistMapPrefs() {
    const center = leafletMap?.getCenter?.()
        || (currentMapCenter
            ? { lat: currentMapCenter[0], lng: currentMapCenter[1] }
            : null);

    writeMapPrefs({
        radiusKm: currentRadiusKm,
        zoom: leafletMap?.getZoom?.() ?? restoredMapZoom ?? MAP_ZOOM,
        mapLat: center ? Number(center.lat) : undefined,
        mapLng: center ? Number(center.lng) : undefined,
        gpsFollow: !!gpsFollowMode,
        gpsTracking: !!gpsTrackingEnabled,
        toolbarExpanded: !!mapToolbarExpanded,
        category: activeCategoryFilter || 'all',
        searchQuery: activeSearchQuery || ''
    });
}

let persistMapPrefsTimer = null;
function schedulePersistMapPrefs() {
    if (persistMapPrefsTimer) clearTimeout(persistMapPrefsTimer);
    persistMapPrefsTimer = setTimeout(() => {
        persistMapPrefsTimer = null;
        persistMapPrefs();
    }, 250);
}

function getInitialMapCenter() {
    const prefs = readMapPrefs();
    const prefLat = Number(prefs.mapLat);
    const prefLng = Number(prefs.mapLng);
    if (Number.isFinite(prefLat) && Number.isFinite(prefLng)) {
        return [prefLat, prefLng];
    }
    const stored = getLastPosition();
    if (stored) return [stored.lat, stored.lng];
    return null;
}

/**
 * Normalizuje ID filtra z Home (fastFood / fastfood / fast_food) do klucza HOME_CATEGORY_MAP.
 * Producenci w danych mają category: 'fast_food'.
 */
function resolveCategoryFilterId(categoryId) {
    const raw = String(categoryId || 'all').trim();
    if (!raw || raw === 'all') return 'all';
    if (raw === 'fast_food' || raw === 'fastfood') return 'fastFood';
    // Singular z danych / prefs → kanoniczny ID kafelka Home
    if (raw === 'farmer' || raw === 'farm' || raw === 'landwirt' || raw === 'landwirte') {
        return 'farmers';
    }
    if (raw === 'bakery') return 'bakeries';
    if (raw === 'restaurant') return 'restaurants';
    if (raw === 'shop') return 'shops';
    if (Object.prototype.hasOwnProperty.call(HOME_CATEGORY_MAP, raw)) return raw;
    return raw;
}

function restoreMapPrefsState() {
    const prefs = readMapPrefs();
    if (Number.isFinite(Number(prefs.radiusKm))) {
        currentRadiusKm = clampRadius(prefs.radiusKm);
    }
    if (typeof prefs.category === 'string' && prefs.category) {
        activeCategoryFilter = resolveCategoryFilterId(prefs.category);
    }
    if (typeof prefs.searchQuery === 'string') {
        activeSearchQuery = prefs.searchQuery;
    }
    const zoom = Number(prefs.zoom);
    if (Number.isFinite(zoom) && zoom >= 1 && zoom <= 19) {
        restoredMapZoom = zoom;
    }
    restoredGpsFollow = !!prefs.gpsFollow;
    restoredGpsTracking = !!prefs.gpsTracking;
    if (typeof prefs.toolbarExpanded === 'boolean') {
        mapToolbarExpanded = prefs.toolbarExpanded;
    }
}

let currentRadiusKm = RADIUS_DEFAULT;
let activeCategoryFilter = 'all';
let activeSearchQuery = '';
let restoredMapZoom = null;
let restoredGpsFollow = false;
let restoredGpsTracking = false;
/** Dolny panel mapy (mobile): rozwinięty / zwinięty */
let mapToolbarExpanded = true;
/** Stan przed auto-zwinięciem przy popupie – null gdy brak popupu */
let mapToolbarExpandedBeforePopup = null;
let mapToolbarSheetCleanup = null;
let mapToolbarSheetMq = null;
let mapToolbarSheetMqHandler = null;
let mapToolbarViewportTimer = null;
/** Ostatni znany układ: sheet|compact — ogranicza zbędne sync UI */
let mapToolbarLayoutSnapshot = null;
/** Krótka ochrona przed soft-sync w trakcie otwierania popupu (przed popupopen). */
let popupOpeningGuardUntil = 0;

restoreMapPrefsState();

let currentMapCenter = getInitialMapCenter();
/** Pierwszy fix / świadome lokalizowanie – GPS wysokiej dokładności, z rozsądnym cache */
const GEO_WATCH_OPTIONS_ACTIVE = {
    enableHighAccuracy: true,
    maximumAge: 8000,
    timeout: 15000
};
/** Aktywne śledzenie (po pierwszym fixie) – bez ciągłego high-accuracy (bateria) */
const GEO_WATCH_OPTIONS_TRACKING = {
    enableHighAccuracy: false,
    maximumAge: 15000,
    timeout: 20000
};
/** Debounce przed pobraniem OSM po ruchu */
const OSM_REFRESH_DEBOUNCE_MS = 12000;
/** Minimalny ruch (m) przed ponownym pobraniem danych OSM */
const LOCATION_MOVE_THRESHOLD_M = 200;
/** Nie częściej niż co ~12–15 s */
const OSM_REFRESH_MIN_INTERVAL_MS = 15000;
/** Minimalny ruch (m) zanim przestawimy pinezkę / okrąg (anti-jitter) */
const GPS_PIN_MOVE_MIN_M = 8;
/** Sync markerów w promieniu – rzadziej niż pinezka (stabilność, bez migania) */
const MARKER_SYNC_MOVE_M = 50;
/** Throttle zapisu pozycji do localStorage */
const POSITION_SAVE_MIN_MS = 12000;
const POSITION_SAVE_MIN_M = 30;

// Optymalizacja markerów: renderuj tylko najbliższe N (sortowane po dystansie).
// Gdy MarkerCluster jest dostępny, można pokazać więcej bez „zamrożenia” UI.
const MARKER_LIMIT = typeof window !== 'undefined' && window?.L?.markerClusterGroup ? 1000 : 100;

let mapControlsDragCleanup = null;
let leafletMap = null;
let activeTileLayer = null;
let mapViewContainer = null;
let _resizeBound = false;
let _mapStatusTimer = null;
let homeLocationPending = false;
let nearbySearchPending = false;
let producersLoadStarted = false;
let geoWatchId = null;
let locationWatchActive = false;
let shouldCenterMapOnNextFix = false;
/** Follow mode: mapa podąża za GPS, aż użytkownik przesunie mapę */
let gpsFollowMode = false;
/** Live tracking włączone przez użytkownika (GPS) – trwa do wyłączenia */
let gpsTrackingEnabled = false;
let gpsLocatePending = false;
let lastTrackedLocation = null;
let lastDataFetchLocation = null;
let lastGpsPinLocation = null;
let lastMarkerSyncLocation = null;
let locationDataFetchInFlight = false;
let pendingOsmRefresh = null;
/** Najnowsza lokalizacja oczekująca na debounce OSM (bez resetu timera). */
let pendingOsmRefreshLocation = null;
let osmRefreshDebounceTimer = null;
let lastOsmRefreshAt = 0;
/** Ostatnia pozycja, przy której odświeżono listę producentów (K2). */
let lastListRefreshLocation = null;
let listRefreshDebounceTimer = null;
let pendingListRefreshLocation = null;
let lastDataEmptyArea = false;
let isPopupOpen = false;
/** Producent, którego popup ma pozostać otwarty (pan mapy / sync markerów). */
let pinnedPopupProducerId = null;
/** Zamknięcie przez X / filtr / modal — bez auto-reopen. */
let suppressPopupReopen = false;
/** Pan/zoom z otwartym popupem — odzysk po moveend. */
let mapGesturePreservePopup = false;
let popupRecoveryTimer = null;
/** Mirror flagi modala – popupclose nie może zamykać / flushować gdy true */
let isModalOpen = false;
/** Odłożony pełny sync markerów (po zamknięciu popupu / modalu) */
let deferredMarkerRefreshOpts = null;
let gpsFollowBindingsReady = false;
let lastPositionSaveAt = 0;
let lastSavedPosition = null;
let visibilityPauseBound = false;
let mapInitGeneration = 0;
let markerRefreshRaf = null;
let pendingMarkerRefreshOpts = null;
/** rAF z resumeExistingMap – anulowany przy pause (anty-GPS po opuszczeniu mapy) */
let resumeMapRaf = null;
/** Unieważnia efekty UI po opuszczeniu mapy / nowym fetchu */
let dataFetchGeneration = 0;
/** Timery odroczone (resume / init / view) – czyszczone przy wyjściu */
const deferredMapTimers = new Set();
/** Offline banner: jeden globalny listener na window (bez wycieku przy remount) */
let offlineBannerRoot = null;
let offlineBannerListenersBound = false;

function scheduleMapTimeout(fn, ms) {
    const id = setTimeout(() => {
        deferredMapTimers.delete(id);
        fn();
    }, ms);
    deferredMapTimers.add(id);
    return id;
}

function clearDeferredMapTimers() {
    for (const id of deferredMapTimers) clearTimeout(id);
    deferredMapTimers.clear();
}

/** Liczba aktywnych timerów mapy (diagnostyka localhost). */
function getMapActiveTimerCount() {
    let count = deferredMapTimers.size;
    if (osmRefreshDebounceTimer != null) count += 1;
    if (listRefreshDebounceTimer != null) count += 1;
    if (markerRefreshRaf != null) count += 1;
    if (resumeMapRaf != null) count += 1;
    return count;
}

/** Pauza pracy w tle mapy – bez wycieków timerów / kolejki OSM */
function pauseMapBackgroundWork() {
    clearGeoWatch();
    clearDeferredMapTimers();

    if (persistMapPrefsTimer) {
        clearTimeout(persistMapPrefsTimer);
        persistMapPrefsTimer = null;
    }
    if (_mapStatusTimer) {
        clearTimeout(_mapStatusTimer);
        _mapStatusTimer = null;
    }
    if (osmRefreshDebounceTimer) {
        clearTimeout(osmRefreshDebounceTimer);
        osmRefreshDebounceTimer = null;
    }
    pendingOsmRefreshLocation = null;
    if (listRefreshDebounceTimer) {
        clearTimeout(listRefreshDebounceTimer);
        listRefreshDebounceTimer = null;
    }
    pendingListRefreshLocation = null;
    if (markerRefreshRaf != null) {
        cancelAnimationFrame(markerRefreshRaf);
        markerRefreshRaf = null;
        pendingMarkerRefreshOpts = null;
    }
    if (resumeMapRaf != null) {
        cancelAnimationFrame(resumeMapRaf);
        resumeMapRaf = null;
    }
    deferredMarkerRefreshOpts = null;

    // Drag kontrolek: document/window listeners nie mogą zostać poza widokiem mapy
    if (mapControlsDragCleanup) {
        mapControlsDragCleanup();
        mapControlsDragCleanup = null;
    }
    if (mapToolbarSheetCleanup) {
        mapToolbarSheetCleanup();
        mapToolbarSheetCleanup = null;
    }
    if (mapToolbarViewportTimer) {
        clearTimeout(mapToolbarViewportTimer);
        mapToolbarViewportTimer = null;
    }
    mapToolbarLayoutSnapshot = null;
    mapToolbarExpandedBeforePopup = null;

    pendingOsmRefresh = null;
    pendingOsmRefreshLocation = null;
    dataFetchGeneration += 1;

    try {
        abortPendingDataLoads();
    } catch (_) {
        /* ignore */
    }
}

function applyDataLoadResult(result) {
    // Tylko stan wewnętrzny – bez toastów „ładowanie / cache / błąd”.
    // Aplikacja ma działać od razu; dane pojawiają się w tle (wskaźnik: kolor OSM).
    lastDataEmptyArea = !!result?.emptyArea || result?.source === 'empty-area';
}

eventBus.on(EVENTS.LOCATION_REQUESTED, () => {
    nearbySearchPending = false;
    homeLocationPending = true;
});

eventBus.on(EVENTS.NEARBY_SEARCH, () => {
    homeLocationPending = false;
    nearbySearchPending = true;
});

function distanceMeters(a, b) {
    if (!a || !b) return Infinity;
    return getDistanceKm(a.lat, a.lng, b.lat, b.lng) * 1000;
}

function clearGeoWatch() {
    if (geoWatchId != null && navigator.geolocation) {
        navigator.geolocation.clearWatch(geoWatchId);
        geoWatchId = null;
    }
    locationWatchActive = false;
}

function stopLocationWatch() {
    clearGeoWatch();
    if (osmRefreshDebounceTimer) {
        clearTimeout(osmRefreshDebounceTimer);
        osmRefreshDebounceTimer = null;
    }
    if (listRefreshDebounceTimer) {
        clearTimeout(listRefreshDebounceTimer);
        listRefreshDebounceTimer = null;
    }
    pendingListRefreshLocation = null;
    pendingOsmRefreshLocation = null;
}

function setGpsTrackingUi({ tracking = gpsTrackingEnabled, fetching = false } = {}) {
    const gpsBtn = document.querySelector('#mapGpsBtn');
    if (!gpsBtn) return;
    gpsBtn.classList.toggle('is-tracking', !!tracking);
    gpsBtn.classList.toggle('is-fetching', !!fetching);
    gpsBtn.setAttribute('aria-pressed', tracking ? 'true' : 'false');
    gpsBtn.setAttribute('aria-busy', fetching ? 'true' : 'false');
}

function hasMovedEnoughForDataRefresh(location) {
    if (!lastDataFetchLocation) return true;
    return distanceMeters(lastDataFetchLocation, location) >= LOCATION_MOVE_THRESHOLD_M;
}

function hasMovedEnoughForGpsPin(location) {
    if (!lastGpsPinLocation) return true;
    return distanceMeters(lastGpsPinLocation, location) >= GPS_PIN_MOVE_MIN_M;
}

function hasMovedEnoughForMarkerSync(location) {
    if (!lastMarkerSyncLocation) return true;
    return distanceMeters(lastMarkerSyncLocation, location) >= MARKER_SYNC_MOVE_M;
}

/**
 * P1: debounce OSM bez resetu timera przy ciągłej jeździe — aktualizuj tylko docelową lokalizację.
 */
function scheduleOsmRefreshAtLocation(lat, lng) {
    if (!leafletMap || typeof document !== 'undefined' && document.hidden) return;

    pendingOsmRefreshLocation = { lat, lng };
    if (osmRefreshDebounceTimer != null) return;

    const runScheduledOsmRefresh = () => {
        osmRefreshDebounceTimer = null;
        const loc = pendingOsmRefreshLocation;
        if (!loc || !leafletMap || (typeof document !== 'undefined' && document.hidden)) return;

        const now = Date.now();
        const sinceLast = now - lastOsmRefreshAt;
        if (sinceLast < OSM_REFRESH_MIN_INTERVAL_MS) {
            osmRefreshDebounceTimer = setTimeout(
                runScheduledOsmRefresh,
                OSM_REFRESH_MIN_INTERVAL_MS - sinceLast
            );
            return;
        }

        pendingOsmRefreshLocation = null;
        lastOsmRefreshAt = now;
        refreshOsmDataAtLocation(loc.lat, loc.lng);
    };

    osmRefreshDebounceTimer = setTimeout(runScheduledOsmRefresh, OSM_REFRESH_DEBOUNCE_MS);
}

function maybeSaveLastPosition(lat, lng) {
    const next = { lat, lng };
    const now = Date.now();
    if (
        lastSavedPosition
        && distanceMeters(lastSavedPosition, next) < POSITION_SAVE_MIN_M
        && now - lastPositionSaveAt < POSITION_SAVE_MIN_MS
    ) {
        return;
    }
    lastPositionSaveAt = now;
    lastSavedPosition = next;
    saveLastPosition(lat, lng, 'gps');
}

/** watchPosition tylko przy włączonym Live GPS albo gdy dokument widoczny */
function shouldRunLocationWatch() {
    if (!gpsTrackingEnabled) return false;
    if (typeof document !== 'undefined' && document.hidden) return false;
    return true;
}

function disableGpsFollowMode() {
    if (!gpsFollowMode) {
        updateRecenterButtonVisibility();
        return;
    }
    gpsFollowMode = false;
    updateRecenterButtonVisibility();
    schedulePersistMapPrefs();
}

const GPS_FOLLOW_PAN_MS = 320;
const GPS_FOLLOW_FLY_MS = 360;
/** Auto Follow: pan dopiero gdy pozycja wyjdzie poza ~30% od środka widoku */
const GPS_FOLLOW_EDGE_RATIO = 0.3;

function enableGpsFollowMode() {
    gpsFollowMode = true;
    shouldCenterMapOnNextFix = true;
    updateRecenterButtonVisibility();
    schedulePersistMapPrefs();
}

function getBackToLocationLabel() {
    return t('map.backToLocationLabel');
}

function updateRecenterButtonVisibility() {
    const btn = document.querySelector('#mapRecenterBtn');
    if (!btn) return;
    const canRecenter = !!(lastTrackedLocation || getLastPosition());
    const show = !gpsFollowMode && canRecenter;
    btn.hidden = !show;
}

function resumeGpsFollow() {
    const recenterBtn = document.querySelector('#mapRecenterBtn');
    if (recenterBtn?.disabled) return;

    const runRecenter = async () => {
        if (recenterBtn) recenterBtn.disabled = true;

        let loc = null;
        try {
            loc = await requestCurrentPosition({
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 12000
            });
        } catch (_) {
            loc = lastTrackedLocation || getLastPosition();
        }

        if (!loc) {
            if (!gpsTrackingEnabled) toggleGpsTracking();
            return;
        }

        if (!gpsTrackingEnabled) {
            gpsTrackingEnabled = true;
            startLocationWatch({ active: false });
            setGpsTrackingUi({ tracking: true, fetching: false });
        }

        maybeSaveLastPosition(loc.lat, loc.lng);
        lastTrackedLocation = { lat: loc.lat, lng: loc.lng };

        const latLng = [loc.lat, loc.lng];
        currentMapCenter = latLng;
        lastGpsPinLocation = { lat: loc.lat, lng: loc.lng };
        updateRadiusCircle(leafletMap, latLng, currentRadiusKm);
        updateGpsPin(leafletMap, latLng);
        enableGpsFollowMode();

        if (leafletMap) {
            const zoom = leafletMap.getZoom?.() ?? restoredMapZoom ?? MAP_ZOOM;
            leafletMap.flyTo(latLng, zoom, {
                animate: true,
                duration: GPS_FOLLOW_FLY_MS / 1000,
                easeLinearity: 0.35
            });
        }

        const location = { lat: loc.lat, lng: loc.lng };
        const needsMarkerRefresh = hasMovedEnoughForMarkerSync(location);
        const needsDataRefresh = hasMovedEnoughForDataRefresh(location);

        if (needsMarkerRefresh) {
            lastMarkerSyncLocation = location;
            refreshMapMarkers({
                fitBounds: false,
                sync: true,
                force: needsDataRefresh
            });
        }
        if (needsDataRefresh) {
            scheduleOsmRefreshAtLocation(loc.lat, loc.lng);
        }
    };

    runRecenter()
        .catch(() => {
            /* ignore */
        })
        .finally(() => {
            if (recenterBtn) recenterBtn.disabled = false;
            updateRecenterButtonVisibility();
        });
}

function getMapWorkAreaHeight() {
    if (typeof window === 'undefined') return Number.POSITIVE_INFINITY;
    const vv = window.visualViewport;
    if (vv && Number.isFinite(vv.height) && vv.height > 32) {
        return Math.round(vv.height);
    }
    const innerH = window.innerHeight;
    if (Number.isFinite(innerH) && innerH > 0) return Math.round(innerH);
    const clientH = document.documentElement?.clientHeight;
    if (Number.isFinite(clientH) && clientH > 0) return Math.round(clientH);
    return Number.POSITIVE_INFINITY;
}

function isMapWorkAreaCompact() {
    return getMapWorkAreaHeight() < MAP_TOOLBAR_AUTO_COLLAPSE_HEIGHT_PX;
}

function isMapToolbarSheetActive() {
    if (typeof window === 'undefined' || !window.matchMedia) return false;

    const compactHeight = isMapWorkAreaCompact();
    const mobileWidth = window.matchMedia(MAP_TOOLBAR_SHEET_MQ).matches;
    const viewportW = window.innerWidth
        || document.documentElement?.clientWidth
        || 0;

    if (mobileWidth) return true;

    if (compactHeight && viewportW > 0 && viewportW <= MAP_TOOLBAR_COMPACT_MAX_WIDTH_PX) {
        return true;
    }

    if (window.matchMedia('(min-width: 769px)').matches && !compactHeight) {
        return false;
    }

    return false;
}

function shouldAutoCollapseToolbarForPopup() {
    if (!isMapToolbarSheetActive()) return false;
    return isMapWorkAreaCompact();
}

function isMapPopupCurrentlyOpen() {
    if (isPopupOpen) return true;
    try {
        return Boolean(leafletMap?.isPopupOpen?.());
    } catch (_) {
        return false;
    }
}

function handleMapToolbarViewportChange(container) {
    const sheetActive = isMapToolbarSheetActive();
    const compact = isMapWorkAreaCompact();
    const layoutKey = `${sheetActive}|${compact}`;
    const popupOpen = isMapPopupCurrentlyOpen();

    if (popupOpen && sheetActive) {
        if (compact && mapToolbarExpanded) {
            if (mapToolbarExpandedBeforePopup === null) {
                mapToolbarExpandedBeforePopup = mapToolbarExpanded;
            }
            if (mapToolbarLayoutSnapshot !== `${layoutKey}|collapsed`) {
                mapToolbarLayoutSnapshot = `${layoutKey}|collapsed`;
                setMapToolbarExpanded(false, { persist: false });
            }
            return;
        }
        if (!compact && mapToolbarExpandedBeforePopup === true && !mapToolbarExpanded) {
            if (mapToolbarLayoutSnapshot !== `${layoutKey}|expanded`) {
                mapToolbarLayoutSnapshot = `${layoutKey}|expanded`;
                setMapToolbarExpanded(true, { persist: false });
            }
            return;
        }
    }

    if (mapToolbarLayoutSnapshot === layoutKey && !popupOpen) {
        return;
    }
    mapToolbarLayoutSnapshot = layoutKey;
    syncMapToolbarSheetUi(container);
}

function scheduleMapToolbarViewportSync(container) {
    if (mapToolbarViewportTimer) clearTimeout(mapToolbarViewportTimer);
    mapToolbarViewportTimer = setTimeout(() => {
        mapToolbarViewportTimer = null;
        handleMapToolbarViewportChange(container);
    }, 160);
}

function getMapBottomPanel(container) {
    const root = container || mapViewContainer;
    return root?.querySelector?.('.map-bottom-panel') || document.querySelector('.map-bottom-panel');
}

function syncMapToolbarSheetUi(container) {
    const panel = getMapBottomPanel(container);
    const handle = panel?.querySelector('#mapToolbarSheetHandle');
    if (!panel) return;

    const sheetActive = isMapToolbarSheetActive();
    const expanded = sheetActive ? mapToolbarExpanded : true;

    panel.classList.toggle('is-sheet-active', sheetActive);
    panel.classList.toggle('is-collapsed', sheetActive && !expanded);
    document.body.classList.toggle('map-toolbar-collapsed', sheetActive && !expanded);

    if (handle) {
        handle.hidden = !sheetActive;
        handle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        const label = expanded ? t('map.toolbarCollapse') : t('map.toolbarExpand');
        handle.setAttribute('aria-label', label);
        const chevron = handle.querySelector('.map-toolbar-sheet-chevron');
        if (chevron) chevron.textContent = expanded ? '▼' : '▲';
    }

    if (sheetActive && leafletMap) {
        requestAnimationFrame(() => safeInvalidateSize(false));
    }
}

function setMapToolbarExpanded(expanded, { persist = true } = {}) {
    mapToolbarExpanded = !!expanded;
    if (persist) {
        mapToolbarLayoutSnapshot = null;
    }
    syncMapToolbarSheetUi();
    if (persist && isMapToolbarSheetActive()) {
        schedulePersistMapPrefs();
    }
}

function toggleMapToolbarSheet() {
    if (!isMapToolbarSheetActive()) return;
    mapToolbarLayoutSnapshot = null;
    setMapToolbarExpanded(!mapToolbarExpanded);
}

function collapseMapToolbarForPopup() {
    if (!shouldAutoCollapseToolbarForPopup()) return;
    if (mapToolbarExpandedBeforePopup === null) {
        mapToolbarExpandedBeforePopup = mapToolbarExpanded;
    }
    if (mapToolbarExpanded) {
        setMapToolbarExpanded(false, { persist: false });
    } else {
        syncMapToolbarSheetUi();
    }
}

function restoreMapToolbarAfterPopup() {
    if (!isMapToolbarSheetActive()) {
        mapToolbarExpandedBeforePopup = null;
        mapToolbarLayoutSnapshot = null;
        return;
    }
    const wasExpanded = mapToolbarExpandedBeforePopup;
    mapToolbarExpandedBeforePopup = null;
    mapToolbarLayoutSnapshot = null;
    if (wasExpanded === true) {
        setMapToolbarExpanded(true, { persist: false });
    }
}

function bindMapToolbarSheet(container) {
    if (mapToolbarSheetCleanup) {
        mapToolbarSheetCleanup();
        mapToolbarSheetCleanup = null;
    }

    const panel = getMapBottomPanel(container);
    const handle = panel?.querySelector('#mapToolbarSheetHandle');
    if (!handle) return;

    const onHandleClick = (event) => {
        event.preventDefault();
        toggleMapToolbarSheet();
    };
    handle.addEventListener('click', onHandleClick);

    const onViewportChange = () => scheduleMapToolbarViewportSync(container);
    window.addEventListener('resize', onViewportChange, { passive: true });
    window.addEventListener('orientationchange', onViewportChange, { passive: true });
    const visualViewport = window.visualViewport;
    if (visualViewport) {
        visualViewport.addEventListener('resize', onViewportChange, { passive: true });
        visualViewport.addEventListener('scroll', onViewportChange, { passive: true });
    }

    if (!mapToolbarSheetMq && typeof window !== 'undefined' && window.matchMedia) {
        mapToolbarSheetMq = window.matchMedia(MAP_TOOLBAR_SHEET_MQ);
        mapToolbarSheetMqHandler = () => scheduleMapToolbarViewportSync(container);
        if (mapToolbarSheetMq.addEventListener) {
            mapToolbarSheetMq.addEventListener('change', mapToolbarSheetMqHandler);
        } else {
            mapToolbarSheetMq.addListener(mapToolbarSheetMqHandler);
        }
    }

    mapToolbarLayoutSnapshot = null;
    handleMapToolbarViewportChange(container);

    mapToolbarSheetCleanup = () => {
        handle.removeEventListener('click', onHandleClick);
        window.removeEventListener('resize', onViewportChange);
        window.removeEventListener('orientationchange', onViewportChange);
        if (visualViewport) {
            visualViewport.removeEventListener('resize', onViewportChange);
            visualViewport.removeEventListener('scroll', onViewportChange);
        }
        if (mapToolbarViewportTimer) {
            clearTimeout(mapToolbarViewportTimer);
            mapToolbarViewportTimer = null;
        }
        if (mapToolbarSheetMq && mapToolbarSheetMqHandler) {
            if (mapToolbarSheetMq.removeEventListener) {
                mapToolbarSheetMq.removeEventListener('change', mapToolbarSheetMqHandler);
            } else {
                mapToolbarSheetMq.removeListener(mapToolbarSheetMqHandler);
            }
            mapToolbarSheetMq = null;
            mapToolbarSheetMqHandler = null;
        }
        mapToolbarLayoutSnapshot = null;
        document.body.classList.remove('map-toolbar-collapsed');
    };
}

function bindGpsFollowInteractions(map) {
    if (!map || gpsFollowBindingsReady) return;
    gpsFollowBindingsReady = true;
    // Użytkownik przesuwa mapę / zmienia zoom → wstrzymaj Auto Follow
    map.on('dragstart', disableGpsFollowMode);
    map.on('zoomstart', (event) => {
        if (event?.originalEvent) disableGpsFollowMode();
    });
}

/**
 * true = pozycja jest blisko krawędzi widoku (poza strefą środkową ~30%).
 * false = nadal w komfortowej strefie – nie ruszaj mapy.
 */
function isNearViewEdge(latLng) {
    if (!leafletMap || !latLng) return false;

    const bounds = leafletMap.getBounds();
    if (!bounds?.isValid?.()) return true;

    const center = bounds.getCenter();
    const lat = Array.isArray(latLng) ? Number(latLng[0]) : Number(latLng.lat);
    const lng = Array.isArray(latLng) ? Number(latLng[1]) : Number(latLng.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;

    const halfLat = Math.max(1e-9, Math.abs(bounds.getNorth() - bounds.getSouth()) / 2);
    const halfLng = Math.max(1e-9, Math.abs(bounds.getEast() - bounds.getWest()) / 2);

    const ratioLat = Math.abs(lat - center.lat) / halfLat;
    const ratioLng = Math.abs(lng - center.lng) / halfLng;

    return Math.max(ratioLat, ratioLng) >= GPS_FOLLOW_EDGE_RATIO;
}

/** Delikatne podążanie za GPS – panTo/flyTo, bez setView przy każdym ticku */
function followUserOnMap(latLng, { fly = false } = {}) {
    if (!leafletMap || !latLng) return;
    // Otwarty popup: nie ruszaj widoku (autoPan / pan może zamknąć lub przeliczyć klaster)
    if (isMapInteractionBlocking()) return;

    const durationSec = (fly ? GPS_FOLLOW_FLY_MS : GPS_FOLLOW_PAN_MS) / 1000;

    if (fly) {
        leafletMap.flyTo(latLng, leafletMap.getZoom(), {
            animate: true,
            duration: durationSec,
            easeLinearity: 0.35
        });
        return;
    }

    leafletMap.panTo(latLng, {
        animate: true,
        duration: durationSec,
        easeLinearity: 0.4,
        noMoveStart: true
    });
}

/**
 * Live GPS: aktualizuj pinezkę/okrąg płynnie.
 * Mapa podąża tylko w follow mode. OSM tylko po sensownym ruchu.
 * Bez odświeżania markerów przy każdym ticku GPS (brak migania).
 */
function handlePositionUpdate(location) {
    if (!location || !leafletMap) return;

    maybeSaveLastPosition(location.lat, location.lng);
    lastTrackedLocation = location;

    const isFirstFix = !currentMapCenter;
    const pinMoved = hasMovedEnoughForGpsPin(location);
    const latLng = [location.lat, location.lng];

    // Centrum wyszukiwania / okręgu = pozycja GPS (nie wymusza widoku mapy)
    currentMapCenter = latLng;

    // Okrąg zasięgu zawsze jedzie z użytkownikiem (ten sam obiekt L.circle) — live, bez rebuild UI
    updateRadiusCircle(leafletMap, latLng, currentRadiusKm);

    if (pinMoved) {
        lastGpsPinLocation = { lat: location.lat, lng: location.lng };
        updateGpsPin(leafletMap, latLng);
        // P2: sync markerów w promieniu co MARKER_SYNC_MOVE_M — diff, bez migania
        if (hasMovedEnoughForMarkerSync(location)) {
            lastMarkerSyncLocation = { lat: location.lat, lng: location.lng };
            scheduleRefreshMapMarkers({ fitBounds: false, sync: true });
        }
    }

    if (isFirstFix) {
        enableGpsFollowMode();
        shouldCenterMapOnNextFix = false;
        const zoom = leafletMap.getZoom?.() || restoredMapZoom || MAP_ZOOM;
        if (!isMapInteractionBlocking()) {
            leafletMap.flyTo(latLng, zoom, {
                animate: true,
                duration: GPS_FOLLOW_FLY_MS / 1000,
                easeLinearity: 0.35
            });
        }
        lastMarkerSyncLocation = { lat: location.lat, lng: location.lng };
        if (isMapInteractionBlocking()) {
            deferredMarkerRefreshOpts = {
                fitBounds: !!(deferredMarkerRefreshOpts?.fitBounds),
                force: true,
                sync: true
            };
            logPopupLifecycle('SYNC_DEFERRED', { reason: 'gps-marker-sync' });
        } else {
            scheduleRefreshMapMarkers({ fitBounds: false, sync: true });
        }
    } else if (shouldCenterMapOnNextFix) {
        shouldCenterMapOnNextFix = false;
        followUserOnMap(latLng, { fly: true });
    } else if (gpsFollowMode && pinMoved && isNearViewEdge(latLng)) {
        // Inteligentne centrowanie: pan tylko przy zbliżeniu do krawędzi (~30% od środka)
        followUserOnMap(latLng, { fly: false });
    }

    if (gpsLocatePending) {
        gpsLocatePending = false;
        // Tracking zostaje włączony – tylko kończymy stan „szukam fixa”
        setGpsTrackingUi({ tracking: gpsTrackingEnabled, fetching: false });
        // Po pierwszym fixie: tryb śledzenia bez ciągłego high-accuracy
        if (gpsTrackingEnabled) {
            restartLocationWatch({ active: false });
        }
    }

    const movedEnough = hasMovedEnoughForDataRefresh(location);

    // P5: nie emituj przy każdym ticku — pinezka/okrąg aktualizowane lokalnie
    if (isFirstFix || pinMoved || movedEnough) {
        eventBus.emit(EVENTS.LOCATION_UPDATED, {
            lat: location.lat,
            lng: location.lng,
            movedEnough,
            isFirstFix,
            pinMoved
        });
    }

    if (movedEnough) {
        scheduleOsmRefreshAtLocation(location.lat, location.lng);
    }
}

function handleLocationWatchError(error) {
    const code = error?.code;
    if (gpsLocatePending) {
        gpsLocatePending = false;
        setGpsTrackingUi({ tracking: gpsTrackingEnabled, fetching: false });
    }
    if (code === 1) {
        // Brak zgody – wyłącz tracking użytkownika
        gpsTrackingEnabled = false;
        clearGeoWatch();
        setGpsTrackingUi({ tracking: false, fetching: false });
    }
    eventBus.emit(EVENTS.LOCATION_ERROR, { code });
}

function restartLocationWatch({ active = false } = {}) {
    if (!navigator.geolocation) return false;
    if (!shouldRunLocationWatch() && !active) {
        clearGeoWatch();
        return false;
    }
    clearGeoWatch();
    locationWatchActive = true;
    const options = active ? GEO_WATCH_OPTIONS_ACTIVE : GEO_WATCH_OPTIONS_TRACKING;
    geoWatchId = navigator.geolocation.watchPosition(
        (position) => {
            handlePositionUpdate({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            });
        },
        handleLocationWatchError,
        options
    );
    return true;
}

function startLocationWatch({ active = false } = {}) {
    if (!navigator.geolocation) {
        return false;
    }
    // Bez włączonego Live GPS nie trzymaj ciągłego watchPosition (bateria)
    if (!gpsTrackingEnabled && !active) {
        return false;
    }
    if (geoWatchId != null) {
        if (active) restartLocationWatch({ active: true });
        return true;
    }
    return restartLocationWatch({ active });
}

/**
 * Pobieranie producentów w tle – nie blokuje pan/zoom mapy.
 * Działa także bez gotowej mapy (prefetch przy starcie widoku).
 */
function loadProducersInBackground(lat, lng, { forceRefresh = false } = {}) {
    const latitude = Number(lat);
    const longitude = Number(lng);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

    if (locationDataFetchInFlight) {
        pendingOsmRefresh = { lat: latitude, lng: longitude, forceRefresh };
        logMapDriveDiag('osm_fetch_abort_prev', {
            lat: latitude,
            lng: longitude,
            activeTimers: getMapActiveTimerCount(),
            activeControllers: getActiveAbortControllerCount()
        });
        try {
            abortPendingDataLoads();
        } catch (_) {
            /* ignore */
        }
        return;
    }

    const fetchGen = ++dataFetchGeneration;
    locationDataFetchInFlight = true;
    setOsmFetching(true);
    logMapDriveDiag('osm_fetch_start_map', {
        lat: latitude,
        lng: longitude,
        activeTimers: getMapActiveTimerCount(),
        activeControllers: getActiveAbortControllerCount()
    });
    const mapFetchStartedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();

    loadAllData(latitude, longitude, {
        radiusKm: currentRadiusKm,
        forceRefresh
    })
        .then((result) => {
            if (fetchGen !== dataFetchGeneration) return;
            if (result?.stale || result?.aborted) return;
            applyDataLoadResult(result);
            // P4: lastDataFetchLocation dopiero po udanym pobraniu
            lastDataFetchLocation = { lat: latitude, lng: longitude };
            eventBus.emit(EVENTS.LOCATION_CHANGED, { lat: latitude, lng: longitude });
            logMapDriveDiag('osm_fetch_end_map', {
                lat: latitude,
                lng: longitude,
                totalMs: Math.round(
                    (typeof performance !== 'undefined' ? performance.now() : Date.now()) - mapFetchStartedAt
                ),
                producerCount: result.producers.length,
                source: result.source,
                aborted: false,
                activeTimers: getMapActiveTimerCount(),
                activeControllers: getActiveAbortControllerCount()
            });
            console.info(
                `[Karte] Producenci w tle: ${result.producers.length} (źródło: ${result.source})`
            );
        })
        .catch((error) => {
            if (fetchGen !== dataFetchGeneration) return;
            logMapDriveDiag('osm_fetch_end_map', {
                lat: latitude,
                lng: longitude,
                totalMs: Math.round(
                    (typeof performance !== 'undefined' ? performance.now() : Date.now()) - mapFetchStartedAt
                ),
                aborted: error?.name === 'AbortError' || /abort/i.test(String(error?.message || '')),
                error: String(error?.message || error),
                activeTimers: getMapActiveTimerCount(),
                activeControllers: getActiveAbortControllerCount()
            });
            console.warn('[Karte] Błąd pobierania w tle:', error);
        })
        .finally(() => {
            // Zawsze zwolnij flagę właściciela tego fetchu
            if (locationDataFetchInFlight) {
                locationDataFetchInFlight = false;
                setOsmFetching(false);
            }

            // Soft sync po zwolnieniu flagi — diff + fade, bez rebuild całej mapy
            if (fetchGen === dataFetchGeneration && leafletMap) {
                scheduleRefreshMapMarkers({ fitBounds: false, force: false, sync: false });
            }

            // Po pauzie / nowszym cyklu nie kontynuuj kolejki
            if (fetchGen !== dataFetchGeneration) return;

            if (!pendingOsmRefresh) return;
            const next = pendingOsmRefresh;
            pendingOsmRefresh = null;
            loadProducersInBackground(next.lat, next.lng, { forceRefresh: next.forceRefresh });
        });
}

function refreshOsmDataAtLocation(lat, lng) {
    loadProducersInBackground(lat, lng, { forceRefresh: true });
}

eventBus.on(EVENTS.LOCATION_UPDATED, ({ lat, lng, isFirstFix }) => {
    const location = { lat, lng };
    if (shouldRefreshProducerListOnGps(lastListRefreshLocation, location, { isFirstFix: !!isFirstFix })) {
        scheduleSoftRefreshProducerList(location, { immediate: !!isFirstFix });
    }
});

function formatRadiusHint(km, count) {
    return t('map.radiusFilter')
        .replace('{km}', String(km))
        .replace('{count}', String(count));
}

function updateRadiusHint(count = limitVisibleProducers(getVisibleProducers()).length) {
    const hint = document.querySelector('#radiusHint');
    if (hint) {
        hint.textContent = formatRadiusHint(currentRadiusKm, count);
    }
}

function updateCategoryHeader(resultCount = 0) {
    const header = document.querySelector('#mapCategoryHeader');
    const titleEl = document.querySelector('#mapCategoryTitle');
    const countEl = document.querySelector('#mapCategoryCount');
    if (!header || !titleEl || !countEl) return;

    if (!activeCategoryFilter || activeCategoryFilter === 'all') {
        header.hidden = true;
        titleEl.textContent = '';
        countEl.textContent = '';
        return;
    }

    const icon = CATEGORY_ICONS[activeCategoryFilter] || CATEGORY_ICONS.other;
    const name = t(`categories.${activeCategoryFilter}.name`);
    titleEl.textContent = `${icon} ${name}`;
    countEl.textContent = t('map.categoryResults')
        .replace('{count}', String(resultCount));
    header.hidden = false;
}

/** Chipów kategorii na mapie nie ma – filtr z Home; tu tylko przycisk czyszczenia nagłówka. */
function updateMapCategoryChips() {
    /* no-op: pasek chipów usunięty */
}

function bindMapCategoryChips(container) {
    const clearBtn = container?.querySelector('#mapCategoryClear');
    if (clearBtn && clearBtn.dataset.bound !== 'true') {
        clearBtn.dataset.bound = 'true';
        clearBtn.addEventListener('click', () => {
            resetCategoryFilter();
        });
    }
}

function buildListDistanceHtml(producer) {
    const user = getLastPosition()
        || (currentMapCenter ? { lat: currentMapCenter[0], lng: currentMapCenter[1] } : null)
        || lastTrackedLocation;
    if (!user || !Number.isFinite(Number(producer?.lat)) || !Number.isFinite(Number(producer?.lng))) {
        return '';
    }
    const km = getDistanceKm(user.lat, user.lng, Number(producer.lat), Number(producer.lng));
    if (!Number.isFinite(km)) return '';
    const dist = formatDistanceLabel(km);
    const eta = formatEtaLabels(km);
    return `<span class="map-list-item-meta" data-distance-km="${km.toFixed(4)}"><span data-distance-label>${escapeListLabel(dist)}</span> · ${escapeListLabel(eta.compact)}</span>`;
}

function patchListItemDistance(btn, producer) {
    if (!btn || !producer) return;
    const html = buildListDistanceHtml(producer);
    if (!html) return;
    const meta = btn.querySelector('.map-list-item-meta');
    if (!meta) {
        btn.insertAdjacentHTML('beforeend', html);
        return;
    }
    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    const next = wrap.firstElementChild;
    if (next) meta.replaceWith(next);
}

/**
 * Przestawia istniejące elementy listy bez pełnego rebuild (anty-miganie).
 * @returns {boolean} true jeśli udało się zaktualizować w miejscu
 */
function reorderProducerListDom(list, producers) {
    const buttons = [...list.querySelectorAll('.map-producer-list-btn[data-producer-id]')];
    if (!buttons.length || buttons.length !== producers.length) return false;

    const byId = new Map(buttons.map((btn) => [String(btn.dataset.producerId), btn.closest('li')]));
    if (producers.some((p) => !byId.get(String(p.id)))) return false;

    const frag = document.createDocumentFragment();
    for (const producer of producers) {
        const li = byId.get(String(producer.id));
        const btn = li?.querySelector('.map-producer-list-btn');
        patchListItemDistance(btn, producer);
        frag.appendChild(li);
    }
    list.appendChild(frag);
    return true;
}

function refreshProducerList(producers = getVisibleProducers()) {
    const list = document.querySelector('#mapProducerListItems');
    const toggle = document.querySelector('#mapListToggle');
    if (!list) return;

    const user = getLastPosition()
        || (currentMapCenter ? { lat: currentMapCenter[0], lng: currentMapCenter[1] } : null)
        || lastTrackedLocation;
    const sortedProducers = sortProducersByDistance(producers, user);
    const visibleIds = new Set(sortedProducers.map((p) => String(p.id)));

    if (activeSearchQuery.trim()) {
        const categoryFiltered = filterProducersByCategory(getProducers(), activeCategoryFilter);
        const { items } = searchGlobalResults(categoryFiltered, activeSearchQuery, t);
        const visibleItems = items.filter((item) => visibleIds.has(String(item.producerId)));
        // sort wyników wg odległości producenta
        visibleItems.sort((a, b) => {
            const pa = sortedProducers.find((p) => String(p.id) === String(a.producerId));
            const pb = sortedProducers.find((p) => String(p.id) === String(b.producerId));
            const ia = sortedProducers.indexOf(pa);
            const ib = sortedProducers.indexOf(pb);
            return (ia < 0 ? 9999 : ia) - (ib < 0 ? 9999 : ib);
        });

        if (visibleItems.length === 0) {
            list.innerHTML = `<li class="map-producer-list-empty">${formatSearchNoResults(activeSearchQuery, t, escapeListLabel)}</li>`;
        } else {
            list.innerHTML = visibleItems.map((item) => {
                const producer = getProducers().find((p) => String(p.id) === String(item.producerId));
                const promoted = producer ? isProducerPromoted(producer) : false;
                const label = String(item.name || t('map.unknownProducer') || '').trim()
                    || t('map.unknownProducer');
                return `
                <li>
                    <button
                        type="button"
                        class="map-producer-list-btn${promoted ? ' is-promoted' : ''}"
                        data-producer-id="${String(item.producerId).replace(/"/g, '&quot;')}"
                        aria-label="${escapeListLabel(label)}"
                    >
                        <span class="map-list-item-name">${escapeListLabel(label)}</span>
                        ${promoted ? `<span class="rg-promoted-badge">${escapeListLabel(t('ads.promoted'))}</span>` : ''}
                        ${item.type === 'product' ? `<span class="map-list-item-sub">${escapeListLabel(item.producerName)}</span>` : ''}
                        ${producer ? buildListDistanceHtml(producer) : ''}
                    </button>
                </li>
            `;
            }).join('');
        }

        if (toggle) {
            toggle.textContent = t('map.listToggle').replace('{count}', String(visibleItems.length));
        }
        updateRadiusHint(sortedProducers.length);
        return;
    }

    if (sortedProducers.length === 0) {
        const hasOsmData = getProducers().some(
            (p) => p.source === 'osm' || p.source === 'govdata'
        );
        const areaEmpty = lastDataEmptyArea
            || isProducersEmptyArea()
            || (isProducersLoadSettled() && !hasOsmData);
        const emptyMsg = areaEmpty ? t('map.noDataInArea') : t('search.noResults');
        list.innerHTML = `<li class="map-producer-list-empty">${emptyMsg}</li>`;
    } else if (!reorderProducerListDom(list, sortedProducers)) {
        list.innerHTML = sortedProducers.map((producer) => {
            const promoted = isProducerPromoted(producer);
            const label = String(producer.name || t('map.unknownProducer') || '').trim()
                || t('map.unknownProducer');
            return `
            <li>
                <button
                    type="button"
                    class="map-producer-list-btn${promoted ? ' is-promoted' : ''}"
                    data-producer-id="${String(producer.id).replace(/"/g, '&quot;')}"
                    aria-label="${escapeListLabel(label)}"
                >
                    <span class="map-list-item-name">${escapeListLabel(label)}</span>
                    ${promoted ? `<span class="rg-promoted-badge">${escapeListLabel(t('ads.promoted'))}</span>` : ''}
                    ${buildListDistanceHtml(producer)}
                </button>
            </li>
        `;
        }).join('');
    }

    if (toggle) {
        toggle.textContent = t('map.listToggle').replace('{count}', String(sortedProducers.length));
    }

    updateRadiusHint(sortedProducers.length);
}

/** Live GPS: aktualizuj odległości / kolejność listy bez przebudowy markerów. */
function softRefreshProducerListDistances() {
    if (!leafletMap) return;
    refreshProducerList(getVisibleProducers());
}

function runSoftRefreshProducerList(location) {
    if (!location || !leafletMap) return;
    lastListRefreshLocation = { lat: location.lat, lng: location.lng };
    softRefreshProducerListDistances();
}

/** K2: debounce 5 s; pierwszy fix natychmiast. */
function scheduleSoftRefreshProducerList(location, { immediate = false } = {}) {
    if (!leafletMap || !location) return;

    if (immediate) {
        if (listRefreshDebounceTimer) {
            clearTimeout(listRefreshDebounceTimer);
            listRefreshDebounceTimer = null;
        }
        pendingListRefreshLocation = null;
        runSoftRefreshProducerList(location);
        return;
    }

    pendingListRefreshLocation = location;
    if (listRefreshDebounceTimer) return;

    listRefreshDebounceTimer = setTimeout(() => {
        listRefreshDebounceTimer = null;
        const loc = pendingListRefreshLocation;
        pendingListRefreshLocation = null;
        if (!loc) return;
        runSoftRefreshProducerList(loc);
    }, LIST_REFRESH_DEBOUNCE_MS);
}

function escapeListLabel(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function bindProducerList(container) {
    const list = container.querySelector('#mapProducerListItems');
    const toggle = container.querySelector('#mapListToggle');
    if (!list || !toggle) return;

    // Cleanup przed ponownym bind (unikaj podwójnych listenerów)
    if (toggle._rgListClick) {
        toggle.removeEventListener('click', toggle._rgListClick);
        toggle._rgListClick = null;
    }
    if (list._rgListClick) {
        list.removeEventListener('click', list._rgListClick);
        list._rgListClick = null;
    }

    toggle._rgListClick = () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        list.hidden = expanded;
    };
    list._rgListClick = (event) => {
        const btn = event.target.closest('[data-producer-id]');
        if (!btn || !leafletMap) return;
        event.preventDefault();
        disableGpsFollowMode();
        const producerId = btn.dataset.producerId;
        focusProducerMarker(leafletMap, producerId);
        const producer = getProducers().find((p) => String(p.id) === String(producerId));
        openProducerModal(producerId, producer || null);
        btn.classList.add('is-active');
        setTimeout(() => btn.classList.remove('is-active'), 1200);
    };

    toggle.addEventListener('click', toggle._rgListClick);
    list.addEventListener('click', list._rgListClick);
    toggle.dataset.bound = 'true';
}

function applyNearbySearchDefaults() {
    if (!nearbySearchPending || !leafletMap) return;
    nearbySearchPending = false;

    const stored = getLastPosition() || lastTrackedLocation;
    if (stored) {
        currentMapCenter = [stored.lat, stored.lng];
        leafletMap.setView(currentMapCenter, MAP_ZOOM);
        applyMapCenter(currentMapCenter);
    } else {
        enableUserLocationTracking({ centerMap: true });
    }

    refreshMapMarkers({ fitBounds: false });
}

function fulfillHomeLocationIfReady() {
    if (!homeLocationPending || !leafletMap) return;
    homeLocationPending = false;
    if (!gpsTrackingEnabled) {
        toggleGpsTracking();
    } else {
        enableGpsFollowMode();
        if (lastTrackedLocation) handlePositionUpdate(lastTrackedLocation);
    }
}

function buildMapSkeletonHtml() {
    const cards = Array.from({ length: 4 }, () => `
        <div class="map-skeleton-card">
            <div class="map-skeleton-line map-skeleton-line--title"></div>
            <div class="map-skeleton-line map-skeleton-line--short"></div>
            <div class="map-skeleton-line map-skeleton-line--medium"></div>
        </div>
    `).join('');

    return `
        <div id="mapSkeleton" class="map-skeleton" role="status" aria-live="polite" aria-busy="true" aria-label="${escapeListLabel(t('map.dataLoading'))}">
            ${cards}
        </div>
    `;
}

function setOsmFetching(active) {
    const osmBtn = document.querySelector('#mapOsmBtn');
    if (!osmBtn) return;
    osmBtn.classList.toggle('is-fetching', !!active);
    osmBtn.setAttribute('aria-busy', active ? 'true' : 'false');
}

function setGpsFetching(active) {
    setGpsTrackingUi({ tracking: gpsTrackingEnabled, fetching: !!active });
}

function showMapSkeleton() {
    setOsmFetching(true);

    const mapView = document.querySelector('.map-view');
    if (!mapView) return;

    let skeleton = mapView.querySelector('#mapSkeleton');
    if (!skeleton) {
        mapView.insertAdjacentHTML('beforeend', buildMapSkeletonHtml());
        skeleton = mapView.querySelector('#mapSkeleton');
    }

    if (skeleton) skeleton.hidden = false;
}

function hideMapSkeleton() {
    setOsmFetching(false);

    const skeleton = document.querySelector('#mapSkeleton');
    if (!skeleton) return;
    skeleton.hidden = true;
}

function ensureOfflineBanner(root) {
    if (!root) return null;
    let banner = root.querySelector('#mapOfflineBanner');
    if (banner) return banner;
    banner = document.createElement('div');
    banner.id = 'mapOfflineBanner';
    banner.className = 'map-offline-banner';
    banner.setAttribute('role', 'status');
    banner.textContent = t('map.offlineNotice');
    root.appendChild(banner);
    return banner;
}

function updateOfflineBanner(root) {
    const banner = ensureOfflineBanner(root);
    if (!banner) return;
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    banner.classList.toggle('is-visible', offline);
    banner.hidden = !offline;
    if (offline) {
        banner.textContent = t('map.offlineNotice');
    }
}

function bindOfflineBanner(root) {
    if (!root) return;
    offlineBannerRoot = root;
    if (!offlineBannerListenersBound) {
        offlineBannerListenersBound = true;
        const sync = () => {
            if (offlineBannerRoot) updateOfflineBanner(offlineBannerRoot);
        };
        window.addEventListener('online', sync);
        window.addEventListener('offline', sync);
    }
    updateOfflineBanner(root);
}

function showMapStatus(message, durationMs = 4000) {
    const mapView = document.querySelector('.map-view');
    if (!mapView) return;

    let status = mapView.querySelector('.map-status');
    if (!status) {
        status = document.createElement('div');
        status.className = 'map-status';
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');
        mapView.appendChild(status);
    }

    status.textContent = message;
    status.hidden = false;

    if (_mapStatusTimer) clearTimeout(_mapStatusTimer);
    _mapStatusTimer = setTimeout(() => {
        status.hidden = true;
    }, durationMs);
}

function hasActiveVisibilityFilter() {
    return (activeCategoryFilter && activeCategoryFilter !== 'all')
        || Boolean(String(activeSearchQuery || '').trim());
}

/** Czy po filtrze warto dopasować widok mapy do markerów (kategoria / szukanie). */
function shouldFitBoundsToFilter() {
    return hasActiveVisibilityFilter();
}

/**
 * FitBounds tylko do markerów w rozsądnej odległości od centrum mapy.
 * Zapobiega „ucieczce” widoku do odległych seedów content.
 */
function getNearbyFitTargets(producers) {
    if (!currentMapCenter || !Array.isArray(producers) || !producers.length) return [];
    const maxKm = Math.max(Number(currentRadiusKm) || 0, 1);
    return getProducersInRadius(producers, maxKm, {
        lat: currentMapCenter[0],
        lng: currentMapCenter[1]
    });
}

function fitMapToProducers(producers) {
    if (!leafletMap || typeof window.L === 'undefined') return;
    // Otwarty popup: fitBounds/setView przesuwa mapę i zamyka popup (klaster)
    if (isPopupOpen || isPopupOpeningGuardActive() || leafletMap.isPopupOpen?.()) {
        logPopupLifecycle('FITBOUNDS_SKIPPED', { reason: 'popup-open' });
        return;
    }
    const list = Array.isArray(producers) ? producers : [];
    const latLngs = list
        .map((p) => {
            const lat = Number(p?.lat);
            const lng = Number(p?.lng);
            return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
        })
        .filter(Boolean);
    if (!latLngs.length) return;

    // Nie pozwól Live GPS cofnąć widoku zaraz po dopasowaniu do kategorii
    disableGpsFollowMode();

    if (latLngs.length === 1) {
        leafletMap.setView(latLngs[0], Math.max(leafletMap.getZoom?.() || 13, 13), { animate: true });
        return;
    }

    try {
        const bounds = window.L.latLngBounds(latLngs);
        if (bounds?.isValid?.()) {
            leafletMap.fitBounds(bounds.pad(0.18), { animate: true, maxZoom: 15 });
        }
    } catch (_) {
        /* ignore */
    }
}

/** invalidateSize przy otwartym popupie potrafi „drgnąć” mapą i zamknąć popup. */
function safeInvalidateSize(animate = false) {
    if (!leafletMap) return;
    if (isPopupOpen || isPopupOpeningGuardActive() || leafletMap.isPopupOpen?.()) {
        logPopupLifecycle('INVALIDATE_SKIPPED', { reason: 'popup-open' });
        return;
    }
    leafletMap.invalidateSize(animate);
}

/** Filtr z nawigacji (options.filter) – bez natychmiastowego fitBounds. */
function applyNavigationFilter(options = {}) {
    const raw = options.filter ?? options.category;
    if (raw == null || raw === '') return false;

    const next = resolveCategoryFilterId(raw);
    console.log('[Map] Filtr:', next);
    activeCategoryFilter = next;
    activeSearchQuery = '';
    schedulePersistMapPrefs();
    return true;
}

/** Zachowuj stare markery tylko przy fetch OSM bez aktywnego filtra kategorii/wyszukiwania. */
function shouldPreserveExistingMarkers(sync = false) {
    return locationDataFetchInFlight && !sync && !hasActiveVisibilityFilter();
}

function refreshMarkersAfterFilterChange() {
    schedulePersistMapPrefs();
    if (!leafletMap) return;
    scheduleRefreshMapMarkers({
        force: true,
        sync: true,
        filterChange: true,
        fitBounds: shouldFitBoundsToFilter()
    });
}

/** Czy producent przechodzi aktywny filtr (kategoria/szukaj/ustawienia) – bez limitu promienia. */
function producerPassesActiveFilter(producerId) {
    if (!producerId) return false;
    const producer = getProducers().find((p) => String(p.id) === String(producerId));
    if (!producer) return false;
    const byCategory = filterProducersByCategory([producer], activeCategoryFilter);
    if (!byCategory.length) return false;
    const bySearch = filterProducersBySearch(byCategory, activeSearchQuery, t);
    if (!bySearch.length) return false;
    const applySettingsVisibility = !activeCategoryFilter || activeCategoryFilter === 'all';
    if (applySettingsVisibility && !isCategoryVisible(normalizeProducerCategory(producer.category))) {
        return false;
    }
    return true;
}

export function setSearchQuery(query) {
    activeSearchQuery = String(query || '').trim();
    refreshMarkersAfterFilterChange();
    if (!leafletMap) return;
    if (activeSearchQuery) {
        const visible = getVisibleProducers();
        if (visible.length === 0) {
            showMapStatus(formatSearchNoResults(activeSearchQuery, t));
        }
    }
}

export function getSearchQuery() {
    return activeSearchQuery;
}

export function resetSearchQuery() {
    activeSearchQuery = '';
    refreshMarkersAfterFilterChange();
}

export function setCategoryFilter(categoryId) {
    const next = resolveCategoryFilterId(categoryId);
    console.log('[Map] Filtr:', next);
    // Zawsze nadpisz poprzednią kategorię (localStorage + widok)
    activeCategoryFilter = next;
    refreshMarkersAfterFilterChange();
    return activeCategoryFilter;
}

export function getCategoryFilter() {
    return activeCategoryFilter;
}

export function resetCategoryFilter() {
    console.log('[Map] Filtr:', 'all');
    activeCategoryFilter = 'all';
    activeSearchQuery = '';
    refreshMarkersAfterFilterChange();
    return activeCategoryFilter;
}

function resolveMapCenter() {
    if (currentMapCenter) return currentMapCenter;
    const last = getLastPosition();
    if (last && Number.isFinite(Number(last.lat)) && Number.isFinite(Number(last.lng))) {
        return [Number(last.lat), Number(last.lng)];
    }
    return null;
}

function getVisibleProducers() {
    const center = resolveMapCenter();
    const byCategory = filterProducersByCategory(getProducers(), activeCategoryFilter);
    const bySearch = filterProducersBySearch(byCategory, activeSearchQuery, t);

    // Przy filtrze Home (farmers/shops/…) nie ukrywaj przez toggles ustawień mapy –
    // inaczej wygląda to jak „zablokowana” poprzednia kategoria.
    const applySettingsVisibility = !activeCategoryFilter || activeCategoryFilter === 'all';
    const passVisibility = (producer) => (
        !applySettingsVisibility
        || isCategoryVisible(normalizeProducerCategory(producer.category))
    );
    const pool = bySearch.filter(passVisibility);

    // Wyszukiwanie bez GPS: pokaż dopasowania globalnie (limit), żeby mapa nie była pusta
    if (!center) {
        if (activeSearchQuery.trim()) {
            return limitVisibleProducers(pool);
        }
        return [];
    }

    const inRadius = getProducersInRadius(pool, currentRadiusKm, {
        lat: center[0],
        lng: center[1]
    });

    // Awaria OSM: pokaż najbliższe markery tylko gdy mamy cache/live OSM, nie ręczny fallback
    if (
        inRadius.length === 0
        && pool.length > 0
        && !activeSearchQuery.trim()
        && !lastDataEmptyArea
        && !isProducersEmptyArea()
        && isProducersLoadSettled()
    ) {
        const hasLiveOsm = pool.some((p) => p.source === 'osm' || p.source === 'govdata');
        if (hasLiveOsm) {
            const nearest = limitVisibleProducers(pool.filter((p) => p.source === 'osm' || p.source === 'govdata'));
            if (nearest.length) return nearest;
        }
    }

    return inRadius;
}

function limitVisibleProducers(producers) {
    if (!Array.isArray(producers) || producers.length <= MARKER_LIMIT) return producers || [];
    if (!currentMapCenter) return producers.slice(0, MARKER_LIMIT);

    const [lat, lng] = currentMapCenter;
    return producers
        .map((p) => ({
            p,
            d: getDistanceKm(lat, lng, Number(p?.lat), Number(p?.lng))
        }))
        .filter((x) => Number.isFinite(x.d))
        .sort((a, b) => a.d - b.d)
        .slice(0, MARKER_LIMIT)
        .map((x) => x.p);
}

/** ETAP 42 — stan kafli (Map Guardian). */
let tilesEverLoaded = false;
let tilesLastErrorAt = 0;

function applyTileLayer(styleId = getActiveMapStyle()) {
    if (!leafletMap || typeof window.L === 'undefined') return;

    const style = MAP_STYLE_OPTIONS[styleId] || MAP_STYLE_OPTIONS.light;
    if (activeTileLayer) {
        leafletMap.removeLayer(activeTileLayer);
    }

    tilesEverLoaded = false;
    activeTileLayer = window.L.tileLayer(style.url, {
        attribution: style.attribution,
        maxZoom: 19,
        referrerPolicy: 'strict-origin-when-cross-origin'
    });
    activeTileLayer.on('load', () => {
        tilesEverLoaded = true;
    });
    activeTileLayer.on('tileerror', () => {
        tilesLastErrorAt = Date.now();
    });
    activeTileLayer.addTo(leafletMap);
}

function applyMapSettingsFromPanel() {
    applyTileLayer();
    refreshMapMarkers();
    refreshMapLegend();
}

function buildMapLegendHtml() {
    return getLegendEntries(t).map((entry) => `
        <li class="map-legend-item">
            <span class="map-legend-swatch" style="background:${entry.color}" aria-hidden="true"></span>
            <span class="map-legend-icon" aria-hidden="true">${entry.icon}</span>
            <span class="map-legend-label">${escapeListLabel(entry.label)}</span>
        </li>
    `).join('');
}

function refreshMapLegend() {
    const list = document.querySelector('#mapLegendList');
    if (!list) return;
    list.innerHTML = buildMapLegendHtml();
}

function bindMapLegend(container) {
    const btn = container.querySelector('#mapLegendBtn');
    const panel = container.querySelector('#mapLegendPanel');
    if (!btn || !panel || btn.dataset.bound === 'true') return;

    btn.dataset.bound = 'true';
    refreshMapLegend();

    btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        panel.hidden = expanded;
    });
}

function markIntentionalPopupClose() {
    suppressPopupReopen = true;
}

function bindPopupCloseButton(popup) {
    const btn = popup?._container?.querySelector?.('.leaflet-popup-close-button');
    if (!btn || btn.dataset.rgCloseBound === '1') return;
    btn.dataset.rgCloseBound = '1';
    btn.addEventListener('click', () => markIntentionalPopupClose(), { capture: true });
}

function finishPopupClosedState() {
    isPopupOpen = false;
    popupOpeningGuardUntil = 0;
    pinnedPopupProducerId = null;
    document.body.classList.remove('map-popup-open');
    restoreMapToolbarAfterPopup();
    if (popupRecoveryTimer) {
        clearTimeout(popupRecoveryTimer);
        popupRecoveryTimer = null;
    }
    if (!syncModalOpenFlag()) {
        logPopupLifecycle('POPUP_CLOSE', { source: 'map' });
        requestAnimationFrame(() => flushDeferredMarkerRefresh());
    }
}

function schedulePinnedPopupRecovery(reason = 'recover') {
    if (!pinnedPopupProducerId || !leafletMap) {
        finishPopupClosedState();
        return;
    }
    if (suppressPopupReopen) {
        finishPopupClosedState();
        return;
    }
    if (!producerPassesActiveFilter(pinnedPopupProducerId)) {
        pinnedPopupProducerId = null;
        finishPopupClosedState();
        return;
    }

    const attemptReopen = () => {
        if (!pinnedPopupProducerId || !leafletMap || suppressPopupReopen) {
            finishPopupClosedState();
            return;
        }
        if (leafletMap.isPopupOpen?.()) {
            syncPopupOpenState();
            return;
        }
        const reopened = reopenProducerPopup(pinnedPopupProducerId);
        if (reopened) {
            logPopupLifecycle('POPUP_REOPEN', {
                id: pinnedPopupProducerId,
                reason
            });
            syncPopupOpenState();
            return;
        }
        popupRecoveryTimer = window.setTimeout(() => {
            popupRecoveryTimer = null;
            if (!pinnedPopupProducerId || !leafletMap) {
                finishPopupClosedState();
                return;
            }
            if (reopenProducerPopup(pinnedPopupProducerId)) {
                logPopupLifecycle('POPUP_REOPEN', {
                    id: pinnedPopupProducerId,
                    reason: `${reason}-retry`
                });
                syncPopupOpenState();
            } else {
                finishPopupClosedState();
            }
        }, 80);
    };

    requestAnimationFrame(() => {
        requestAnimationFrame(attemptReopen);
    });
}

function bindPopupMapGesturePreserve(map) {
    if (!map || map.__rgPopupPreserveBound) return;
    map.__rgPopupPreserveBound = true;

    const onGestureStart = () => {
        mapGesturePreservePopup = Boolean(
            pinnedPopupProducerId && (leafletMap?.isPopupOpen?.() || isPopupOpen)
        );
    };

    const onGestureEnd = () => {
        if (mapGesturePreservePopup && pinnedPopupProducerId) {
            schedulePinnedPopupRecovery('map-gesture');
        }
        mapGesturePreservePopup = false;
    };

    map.on('movestart', onGestureStart);
    map.on('dragstart', onGestureStart);
    map.on('zoomstart', onGestureStart);
    map.on('moveend', onGestureEnd);
    map.on('dragend', onGestureEnd);
    map.on('zoomend', onGestureEnd);
}

function syncModalOpenFlag() {
    isModalOpen = Boolean(isProducerModalOpen());
    return isModalOpen;
}

function isPopupOpeningGuardActive() {
    return Date.now() < popupOpeningGuardUntil;
}

/** Synchronizuj flagę z rzeczywistym stanem Leaflet (anty-stuck isPopupOpen). */
function syncPopupOpenState() {
    if (!leafletMap) {
        isPopupOpen = false;
        popupOpeningGuardUntil = 0;
        document.body.classList.remove('map-popup-open');
        return null;
    }
    const openedPopupId = getOpenPopupProducerId(leafletMap);
    const leafletOpen = Boolean(leafletMap.isPopupOpen?.());
    if (openedPopupId || leafletOpen) {
        isPopupOpen = true;
        popupOpeningGuardUntil = 0;
        document.body.classList.add('map-popup-open');
        return openedPopupId;
    }
    if (isPopupOpeningGuardActive()) {
        // Popup w trakcie otwierania – nie kasuj ochrony, ale nie stuckuj isPopupOpen
        document.body.classList.add('map-popup-open');
        return null;
    }
    isPopupOpen = false;
    document.body.classList.remove('map-popup-open');
    return null;
}

/** Popup / modal – background sync odkładamy; force (filtr) zawsze aktualizuje warstwę. */
function isMapInteractionBlocking() {
    if (!leafletMap) return false;
    syncPopupOpenState();
    syncModalOpenFlag();
    if (isPopupOpeningGuardActive()) return true;
    if (isPopupOpen || leafletMap.isPopupOpen?.()) return true;
    if (isModalOpen) return true;
    return false;
}

function flushDeferredMarkerRefresh() {
    if (!deferredMarkerRefreshOpts || !leafletMap) return;
    if (isMapInteractionBlocking()) return;
    const opts = deferredMarkerRefreshOpts;
    deferredMarkerRefreshOpts = null;
    logPopupLifecycle('QUEUE_FLUSH', {
        force: true,
        sync: true,
        filterChange: !!opts.filterChange,
        fitBounds: !!opts.fitBounds
    });
    scheduleRefreshMapMarkers({ ...opts, force: true, sync: true });
}

function refreshMapMarkers({
    fitBounds = false,
    force = false,
    sync = false,
    filterChange = false
} = {}) {
    if (!leafletMap) return 0;

    let openedPopupId = syncPopupOpenState();
    const modalOpen = syncModalOpenFlag();

    // Filtr usuwa producenta z mapy → świadome zamknięcie popupu, potem pełny sync
    if (filterChange && openedPopupId && !producerPassesActiveFilter(openedPopupId)) {
        logPopupLifecycle('POPUP_CLOSE', {
            id: openedPopupId,
            reason: 'filter-excludes-producer'
        });
        markIntentionalPopupClose();
        try {
            leafletMap.closePopup();
        } catch (_) {
            /* ignore */
        }
        openedPopupId = syncPopupOpenState();
    }

    // Nie ufaj stuck isPopupOpen bez potwierdzenia Leaflet
    const leafletPopupOpen = Boolean(openedPopupId) || Boolean(leafletMap.isPopupOpen?.());
    if (isPopupOpen && !leafletPopupOpen && !isPopupOpeningGuardActive()) {
        isPopupOpen = false;
        document.body.classList.remove('map-popup-open');
    }
    const popupOpen = leafletPopupOpen || isPopupOpeningGuardActive();
    const interactionOpen = popupOpen || modalOpen;

    // Filtr kategorii: natychmiastowy diff markerów (nie odkładaj – UX filtra)
    // OSM / GPS przy popupie: odłóż add/remove
    const deferLayerChurn = interactionOpen && !filterChange;

    if (deferLayerChurn) {
        deferredMarkerRefreshOpts = {
            fitBounds: !!(deferredMarkerRefreshOpts?.fitBounds || fitBounds),
            force: true,
            sync: true,
            filterChange: !!(deferredMarkerRefreshOpts?.filterChange || filterChange)
        };
        logPopupLifecycle('SYNC_DEFERRED', {
            id: openedPopupId || null,
            force,
            sync,
            filterChange,
            modalOpen
        });
        // Nie ruszaj warstwy Leaflet ani listy – zero churn przy otwartym popupie
        return 0;
    }

    const visibleAll = getVisibleProducers();
    let visible = limitVisibleProducers(visibleAll);

    // Zachowaj marker otwartego popupu tylko gdy nadal w filtrze (np. wypadł z limitu)
    if (openedPopupId && producerPassesActiveFilter(openedPopupId)
        && !visible.some((p) => String(p.id) === String(openedPopupId))) {
        const openProducer = getProducers().find((p) => String(p.id) === String(openedPopupId));
        if (openProducer) visible = [...visible, openProducer];
    }

    const preserveExisting = !force && !filterChange && shouldPreserveExistingMarkers(sync);

    const markerCount = replaceMarkers(leafletMap, visible, {
        fitBounds: false,
        preserveExisting,
        deferRemovals: false,
        deferAdds: false,
        openedPopupId,
        allowReopen: Boolean(openedPopupId)
    });

    // Lista / nagłówek / markery – ten sam zbiór (po limicie MARKER_LIMIT)
    refreshProducerList(visible);
    updateCategoryHeader(visible.length);
    updateMapCategoryChips();

    // Nigdy fitBounds / setView przy otwartym popupie
    if (fitBounds && visible.length > 0 && !popupOpen && !modalOpen) {
        const near = getNearbyFitTargets(visible);
        if (near.length > 0) {
            fitMapToProducers(near);
        }
    }

    eventBus.emit(EVENTS.PLACES_FILTERED, {
        producers: visible,
        category: activeCategoryFilter,
        query: activeSearchQuery,
        radius: currentRadiusKm
    });

    // Pierwsza baza „Co nowego?” — tylko gdy brak poprzedniej wizyty
    try {
        ensureMapVisitBaseline(currentRadiusKm);
    } catch {
        /* ignore */
    }

    return markerCount;
}

/** Scal wielokrotne refresh w jedną klatkę – bez blokowania UI */
function scheduleRefreshMapMarkers(opts = {}) {
    pendingMarkerRefreshOpts = {
        fitBounds: !!(pendingMarkerRefreshOpts?.fitBounds || opts.fitBounds),
        force: !!(pendingMarkerRefreshOpts?.force || opts.force),
        sync: !!(pendingMarkerRefreshOpts?.sync || opts.sync),
        filterChange: !!(pendingMarkerRefreshOpts?.filterChange || opts.filterChange)
    };
    if (markerRefreshRaf != null) return;
    markerRefreshRaf = requestAnimationFrame(() => {
        markerRefreshRaf = null;
        const next = pendingMarkerRefreshOpts || {};
        pendingMarkerRefreshOpts = null;
        refreshMapMarkers(next);
    });
}

function canReuseLeafletMap(container) {
    if (!leafletMap || !container) return false;
    const mapEl = container.querySelector('#map');
    if (!mapEl?.isConnected) return false;
    try {
        return leafletMap.getContainer?.() === mapEl;
    } catch (_) {
        return false;
    }
}

function destroyLeafletMap() {
    mapInitGeneration += 1;
    pauseMapBackgroundWork();
    markIntentionalPopupClose();
    pinnedPopupProducerId = null;
    mapGesturePreservePopup = false;
    if (popupRecoveryTimer) {
        clearTimeout(popupRecoveryTimer);
        popupRecoveryTimer = null;
    }

    if (mapControlsDragCleanup) {
        mapControlsDragCleanup();
        mapControlsDragCleanup = null;
    }
    if (mapToolbarSheetCleanup) {
        mapToolbarSheetCleanup();
        mapToolbarSheetCleanup = null;
    }
    mapToolbarExpandedBeforePopup = null;

    if (leafletMap) {
        try {
            leafletMap.remove();
        } catch (_) {
            /* ignore */
        }
        leafletMap = null;
    }

    gpsFollowBindingsReady = false;
    resetRadiusCircle();
    resetGpsPin();
    resetMarkersLayer();
    activeTileLayer = null;
    tilesEverLoaded = false;
}

function refreshMapChromeLabels(container) {
    if (!container) return;

    const gpsBtn = container.querySelector('#mapGpsBtn');
    if (gpsBtn) {
        gpsBtn.innerHTML = `<span class="map-btn-emoji" aria-hidden="true">📍</span> ${t('map.gps')}`;
        setGpsTrackingUi({
            tracking: gpsTrackingEnabled,
            fetching: gpsLocatePending
        });
    }

    const osmBtn = container.querySelector('#mapOsmBtn');
    if (osmBtn) {
        osmBtn.innerHTML = `<span class="map-btn-emoji" aria-hidden="true">🗺️</span> ${t('map.osm')}`;
    }

    const legendBtn = container.querySelector('#mapLegendBtn');
    if (legendBtn) {
        legendBtn.innerHTML = `<span class="map-btn-emoji" aria-hidden="true">📋</span> ${t('map.legend')}`;
    }

    const legendTitle = container.querySelector('.map-legend-title');
    if (legendTitle) legendTitle.textContent = t('map.legendTitle');

    const recenterBtn = container.querySelector('#mapRecenterBtn');
    if (recenterBtn) {
        const label = getBackToLocationLabel();
        recenterBtn.textContent = label;
        recenterBtn.setAttribute('aria-label', label);
    }

    container.querySelector('#map')?.setAttribute('aria-label', t('a11y.map'));
    container.querySelector('#radiusSlider')?.setAttribute('aria-label', t('a11y.searchRadius'));

    updateRadiusHint();
    refreshMapLegend();
    updateCategoryHeader(limitVisibleProducers(getVisibleProducers()).length);
    updateMapCategoryChips();
    updateRecenterButtonVisibility();
    syncMapToolbarSheetUi(container);
}

/** Usuń stare okno Region (gdy mapa wznawiana ze starym DOM). */
function removeRegionControlDom(container) {
    container?.querySelector('#mapRegionControl')?.remove();
}

function resumeExistingMap(container, { filterChange = false } = {}) {
    mapViewContainer = container;
    refreshMapChromeLabels(container);
    // Leaflet zatrzymuje bubble z popupu – listener musi być ponownie na panelu (capture)
    bindPopupActions(container);
    bindMapCategoryChips(container);
    bindOfflineBanner(container.querySelector('.map-view') || container);
    removeRegionControlDom(container);
    // Producer modal: init idempotent; kanoniczna jednorazowa rejestracja listenerów
    initProducerModal();

    bindMapToolbarSheet(container);

    // Po pause() cleanup – przywróć przeciąganie kontrolek
    const bottomPanel = container.querySelector('.map-bottom-panel') || container;
    if (!mapControlsDragCleanup && bottomPanel) {
        mapControlsDragCleanup = initMapControlsDrag(bottomPanel, { map: leafletMap });
    }

    if (resumeMapRaf != null) cancelAnimationFrame(resumeMapRaf);
    resumeMapRaf = requestAnimationFrame(() => {
        resumeMapRaf = null;
        // Po szybkim wyjściu z mapy pause anuluje rAF; dodatkowa ochrona
        if (!leafletMap || !mapViewContainer?.isConnected) return;
        const panel = mapViewContainer.closest?.('.view-panel') || mapViewContainer;
        if (panel?.hidden) return;

        safeInvalidateSize(false);

        // Okrąg / pinezka – bez setView (zachowaj ręczny pan użytkownika)
        if (lastTrackedLocation) {
            const latLng = [lastTrackedLocation.lat, lastTrackedLocation.lng];
            updateRadiusCircle(leafletMap, latLng, currentRadiusKm);
            updateGpsPin(leafletMap, latLng);
        } else if (currentMapCenter) {
            applyMapCenter(currentMapCenter);
        }

        scheduleRefreshMapMarkers({
            // Po nawigacji z kategorii: odśwież markery, fitBounds tylko lokalnie (getNearbyFitTargets)
            fitBounds: hasActiveVisibilityFilter(),
            force: true,
            sync: true,
            filterChange: !!filterChange
        });

        fulfillHomeLocationIfReady();
        applyNearbySearchDefaults();

        if (gpsTrackingEnabled) {
            startLocationWatch({ active: false });
            setGpsTrackingUi({ tracking: true, fetching: false });
        }

        scheduleMapTimeout(() => safeInvalidateSize(false), 120);
    });
}

export function renderMap(container, options = {}) {
    if (!container) return;

    mapViewContainer = container;
    injectMapStyles();

    const filterApplied = applyNavigationFilter(options);
    if (!filterApplied) {
        console.log('[Map] Filtr:', activeCategoryFilter);
    }

    // Prefetch: wybrany region → ostatnia pozycja → centrum mapy
    const regionSeed = getRegionById(getSelectedRegionId());
    if (regionSeed) {
        currentRadiusKm = clampRadius(regionSeed.radiusKm);
        currentMapCenter = [regionSeed.lat, regionSeed.lng];
    }
    const seed =
        regionSeed
            ? { lat: regionSeed.lat, lng: regionSeed.lng }
            : (getLastPosition()
                || lastTrackedLocation
                || (currentMapCenter
                    ? { lat: currentMapCenter[0], lng: currentMapCenter[1] }
                    : null));
    // Cache → rejestr od razu (markery zanim skończy się OSM)
    if (seed) {
        try {
            hydrateProducersFromCache(seed.lat, seed.lng);
        } catch {
            /* ignore */
        }
    }
    if (seed && !producersLoadStarted) {
        producersLoadStarted = true;
        loadProducersInBackground(seed.lat, seed.lng);
    }

    // Stabilność: nie reinicjalizuj Leaflet przy każdym wejściu na widok
    if (canReuseLeafletMap(container)) {
        resumeExistingMap(container, { filterChange: filterApplied });
        return;
    }

    destroyLeafletMap();
    initMapSettings();

    container.innerHTML = `
        <div class="map-view">
            <div id="map" role="region" aria-label="${t('a11y.map')}"></div>
            ${buildMapSkeletonHtml()}
            <div class="map-bottom-panel">
                <button type="button" id="mapToolbarSheetHandle" class="map-toolbar-sheet-handle" hidden aria-expanded="true" aria-controls="mapToolbarSheetBody">
                    <span class="map-toolbar-sheet-chevron" aria-hidden="true">▼</span>
                </button>
                <div id="mapToolbarSheetBody" class="map-toolbar-sheet-body">
                <div class="map-toolbar-unified" role="toolbar" aria-label="${escapeListLabel(t('a11y.map'))}">
                    <div class="map-toolbar-section map-toolbar-section--radius">
                        <div id="radiusControl" class="radius-control">
                            <div class="radius-control-row">
                                <span id="radiusValue" class="radius-value">${currentRadiusKm} km</span>
                                <input
                                    type="range"
                                    id="radiusSlider"
                                    min="${RADIUS_MIN}"
                                    max="${RADIUS_MAX}"
                                    value="${currentRadiusKm}"
                                    step="1"
                                    aria-label="${t('a11y.searchRadius')}"
                                >
                            </div>
                            <p id="radiusHint" class="radius-hint">${formatRadiusHint(currentRadiusKm, 0)}</p>
                        </div>
                    </div>
                    <div class="map-toolbar-section map-toolbar-section--actions">
                        <button type="button" id="mapGpsBtn" class="map-bottom-btn"><span class="map-btn-emoji" aria-hidden="true">📍</span> ${t('map.gps')}</button>
                        <button type="button" id="mapRecenterBtn" class="map-bottom-btn map-recenter-btn" hidden aria-label="${escapeListLabel(getBackToLocationLabel())}">
                            ${getBackToLocationLabel()}
                        </button>
                        <div id="mapLegendWrap" class="map-legend-wrap">
                            <button type="button" id="mapLegendBtn" class="map-bottom-btn map-legend-btn" aria-expanded="false" aria-controls="mapLegendPanel">
                                <span class="map-btn-emoji" aria-hidden="true">📋</span> ${t('map.legend')}
                            </button>
                            <div id="mapLegendPanel" class="map-legend-panel" hidden>
                                <p class="map-legend-title">${t('map.legendTitle')}</p>
                                <ul id="mapLegendList" class="map-legend-list"></ul>
                            </div>
                        </div>
                        <nav id="mapProducerList" class="map-producer-list" aria-label="${t('map.producerList')}">
                            <div id="mapCategoryHeader" class="map-category-header" hidden>
                                <h2 id="mapCategoryTitle" class="map-category-title"></h2>
                                <p id="mapCategoryCount" class="map-category-count"></p>
                                <button type="button" id="mapCategoryClear" class="map-category-clear">
                                    ${t('map.clearFilter')}
                                </button>
                            </div>
                            <button type="button" id="mapListToggle" class="map-bottom-btn map-list-toggle" aria-expanded="false" aria-controls="mapProducerListItems">
                                ${t('map.listToggle').replace('{count}', '0')}
                            </button>
                            <ul id="mapProducerListItems" class="map-producer-list-items" hidden></ul>
                        </nav>
                    </div>
                    <div class="map-toolbar-section map-toolbar-section--extra">
                        <button type="button" id="mapOsmBtn" class="map-bottom-btn"><span class="map-btn-emoji" aria-hidden="true">🗺️</span> ${t('map.osm')}</button>
                        <button type="button" id="mapWhatsNewBtn" class="map-bottom-btn" aria-label="${t('map.whatsNew')}">
                            <span class="map-btn-emoji" aria-hidden="true">🔄</span> ${t('map.whatsNew')}
                        </button>
                    </div>
                </div>
                </div>
            </div>
        </div>
    `;

    if (typeof window.L === 'undefined') {
        console.error('[Karte] Leaflet nie załadowany – sprawdź CDN w index.html');
        container.innerHTML = `<p class="error-view">${t('map.loadError')}</p>`;        return;
    }

    if (window.L.TileLayer?.prototype?.options) {
        window.L.TileLayer.prototype.options.referrerPolicy = 'strict-origin-when-cross-origin';
    }

    const mapEl = container.querySelector('#map');
    if (!mapEl) return;

    // Panel był ukryty (display:none) – wymuś reflow przed pomiarem przez Leaflet
    void container.offsetHeight;
    void mapEl.offsetHeight;

    const initGeneration = mapInitGeneration;

    const startLeaflet = () => {
        if (!mapEl.isConnected || initGeneration !== mapInitGeneration) return;

        const initialZoom = currentMapCenter
            ? (restoredMapZoom ?? MAP_ZOOM)
            : MAP_ZOOM_OVERVIEW;

        leafletMap = window.L.map(mapEl, {
            center: currentMapCenter || MAP_OVERVIEW_CENTER,
            zoom: initialZoom,
            zoomControl: true,
            attributionControl: true
        });

        leafletMap.on('popupopen', (event) => {
            isPopupOpen = true;
            popupOpeningGuardUntil = 0;
            suppressPopupReopen = false;
            document.body.classList.add('map-popup-open');
            collapseMapToolbarForPopup();
            // GPS follow + autoPan nie mogą ruszać mapy przy otwartym popupie
            disableGpsFollowMode();
            try {
                if (event?.popup?.options) event.popup.options.autoPan = false;
            } catch (_) {
                /* ignore */
            }
            if (event?.popup?._container?.classList?.contains('producer-leaflet-popup')) {
                attachDraggableProducerPopup(event.popup, leafletMap);
                bindPopupCloseButton(event.popup);
            }
            const source = event?.popup?._source;
            const producerId = source?.options?.producerId
                || source?.__rgMeta?.id
                || '';
            if (producerId) {
                pinnedPopupProducerId = String(producerId);
            }
            console.log('[Map] Popup open:', producerId || '(brak id)');
            logPopupLifecycle('OPEN', { id: producerId || null, source: 'map' });
            if (!producerId) {
                console.warn('[Map] popupopen bez producerId na markerze');
            }
        });
        leafletMap.on('popupclose', (event) => {
            popupOpeningGuardUntil = 0;
            detachDraggableProducerPopup(event?.popup);

            if (syncModalOpenFlag()) {
                logPopupLifecycle('POPUP_CLOSE', {
                    source: 'map',
                    reason: 'modal-open-skip-flush'
                });
                return;
            }

            if (suppressPopupReopen) {
                suppressPopupReopen = false;
                finishPopupClosedState();
                return;
            }

            if (pinnedPopupProducerId) {
                logPopupLifecycle('POPUP_CLOSE', {
                    id: pinnedPopupProducerId,
                    reason: 'recover-after-gesture',
                    source: 'map'
                });
                schedulePinnedPopupRecovery('popupclose');
                return;
            }

            finishPopupClosedState();
        });

        bindPopupMapGesturePreserve(leafletMap);

        if (!document.documentElement.dataset.rgMarkerClickBound) {
            document.documentElement.dataset.rgMarkerClickBound = 'true';
            document.addEventListener('rg:marker-click', (event) => {
                // Tylko krótki guard – nie stuckuj isPopupOpen gdy popup się nie otworzy
                popupOpeningGuardUntil = Date.now() + 700;
                document.body.classList.add('map-popup-open');
                const producerId = event?.detail?.producerId || '';
                console.log('[Map] Marker kliknięty (view):', producerId);
                window.setTimeout(() => {
                    if (!isPopupOpeningGuardActive()) return;
                    syncPopupOpenState();
                }, 720);
            });
        }

        // Po zamknięciu modala – dopełnij odłożony sync markerów
        if (!document.documentElement.dataset.rgModalFlushBound) {
            document.documentElement.dataset.rgModalFlushBound = 'true';
            const modalFlushObserver = new MutationObserver(() => {
                const open = document.body.classList.contains('producer-modal-open');
                isModalOpen = open || Boolean(isProducerModalOpen());
                // Flush tylko po faktycznym zamknięciu modala – nie przy usunięciu map-popup-open
                if (!open && !isProducerModalOpen()) {
                    requestAnimationFrame(() => flushDeferredMarkerRefresh());
                }
            });
            modalFlushObserver.observe(document.body, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
        // moveend / zoomend – tylko prefs, bez refreshMapMarkers (nie zamykaj popupu)
        leafletMap.on('moveend', () => {
            schedulePersistMapPrefs();
        });
        leafletMap.on('zoomend', () => {
            restoredMapZoom = leafletMap?.getZoom?.() ?? restoredMapZoom;
            schedulePersistMapPrefs();
        });
        bindGpsFollowInteractions(leafletMap);

        applyTileLayer();

        ensureMapSettingsPanel(container.querySelector('.map-view'));
        bindMapSettingsPanel(container, { onApply: applyMapSettingsFromPanel });

        bindResizeEvents();
        bindPopupActions(container);
        bindRadiusControl(container);
        bindMapToolbar(container);
        bindMapToolbarSheet(container);
        bindMapCategoryChips(container);
        bindProducerList(container);
        bindMapLegend(container);
        bindOfflineBanner(container.querySelector('.map-view') || container);
        initProducerModal();

        const bottomPanel = container.querySelector('.map-bottom-panel');
        if (bottomPanel) {
            mapControlsDragCleanup = initMapControlsDrag(bottomPanel, { map: leafletMap });
        }

        const finishMapInit = () => {
            if (!leafletMap || initGeneration !== mapInitGeneration) return;

            const viewZoom = restoredMapZoom ?? MAP_ZOOM;

            // Przywróć Live GPS / Auto Follow z poprzedniej sesji
            if (restoredGpsTracking && !gpsTrackingEnabled) {
                gpsTrackingEnabled = true;
            }
            if (restoredGpsFollow) {
                gpsFollowMode = true;
                shouldCenterMapOnNextFix = true;
            }

            // Przywróć wskaźnik OSM, jeśli prefetch jeszcze trwa
            if (locationDataFetchInFlight) setOsmFetching(true);
            if (gpsTrackingEnabled) {
                setGpsTrackingUi({ tracking: true, fetching: gpsLocatePending });
                if (!geoWatchId) startLocationWatch({ active: false });
            }

            if (!currentMapCenter) {
                // Jednorazowy fix – bez ciągłego watch, jeśli Live GPS wyłączone
                if (gpsTrackingEnabled) {
                    startLocationWatch({ active: true });
                }
                resolveUserLocation()
                    .then((resolved) => {
                        if (!resolved || !leafletMap || initGeneration !== mapInitGeneration) return;
                        currentMapCenter = [resolved.lat, resolved.lng];
                        leafletMap.setView(currentMapCenter, viewZoom, { animate: false });
                        applyMapCenter(currentMapCenter);
                        schedulePersistMapPrefs();
                        if (!producersLoadStarted) {
                            producersLoadStarted = true;
                            loadProducersInBackground(resolved.lat, resolved.lng);
                        } else {
                            scheduleRefreshMapMarkers({ fitBounds: false });
                        }
                    })
                    .catch(() => { /* czekamy na watchPosition / zgodę GPS */ });
            }

            if (currentMapCenter) {
                safeInvalidateSize(false);
                leafletMap.setView(currentMapCenter, viewZoom, { animate: false });
                applyMapCenter(currentMapCenter);
            } else {
                safeInvalidateSize(false);
            }

            updateRecenterButtonVisibility();

            // Od razu pokaż mapę + ewentualne markery z pamięci; dane doładują się w tle
            const visibleAll = getVisibleProducers();
            const visibleProducers = limitVisibleProducers(visibleAll);
            const markerCount = currentMapCenter
                ? replaceMarkers(leafletMap, visibleProducers, {
                    fitBounds: false,
                    preserveExisting: shouldPreserveExistingMarkers(false)
                })
                : 0;
            refreshProducerList(visibleProducers);
            updateCategoryHeader(visibleProducers.length);

            if (hasActiveVisibilityFilter() && visibleProducers.length > 0) {
                const near = getNearbyFitTargets(visibleProducers);
                if (near.length > 0) {
                    fitMapToProducers(near);
                }
            }

            if (currentMapCenter && !producersLoadStarted) {
                producersLoadStarted = true;
                loadProducersInBackground(currentMapCenter[0], currentMapCenter[1]);
            }

            if (activeSearchQuery && visibleProducers.length === 0 && currentMapCenter) {
                showMapStatus(formatSearchNoResults(activeSearchQuery, t));
            }

            if (homeLocationPending) {
                scheduleMapTimeout(() => fulfillHomeLocationIfReady(), 150);
            } else if (nearbySearchPending) {
                scheduleMapTimeout(() => applyNearbySearchDefaults(), 150);
            }

            scheduleMapTimeout(() => {
                if (initGeneration === mapInitGeneration) {
                    safeInvalidateSize(false);
                }
            }, 120);

            persistMapPrefs();

            eventBus.emit(EVENTS.MAP_READY, {
                center: currentMapCenter,
                zoom: currentMapCenter ? viewZoom : MAP_ZOOM_OVERVIEW,
                markers: markerCount,
                category: activeCategoryFilter,
                query: activeSearchQuery
            });
            eventBus.emit(EVENTS.PLACES_FILTERED, {
                producers: visibleProducers,
                category: activeCategoryFilter,
                query: activeSearchQuery,
                radius: currentRadiusKm
            });
            console.info(`[Karte] ${markerCount} markerów (filtr: ${activeCategoryFilter})`);
        };

        leafletMap.whenReady(() => {
            requestAnimationFrame(finishMapInit);
        });
    };

    requestAnimationFrame(() => {
        requestAnimationFrame(startLeaflet);
    });
}

function applyMapCenter(center) {
    if (!leafletMap) return;
    updateRadiusCircle(leafletMap, center, currentRadiusKm);
    updateGpsPin(leafletMap, center);
}

function enableUserLocationTracking({ centerMap = false, active = false } = {}) {
    if (centerMap) enableGpsFollowMode();

    if (!startLocationWatch({ active: active || centerMap })) {
        if (gpsLocatePending) {
            gpsLocatePending = false;
            setGpsTrackingUi({ tracking: gpsTrackingEnabled, fetching: false });
        }
        return false;
    }

    if (lastTrackedLocation) {
        handlePositionUpdate(lastTrackedLocation);
    }

    return true;
}

/**
 * Live GPS – przełącznik:
 * ON  → watchPosition() aż do wyłączenia przez użytkownika
 * OFF → clearWatch()
 */
function toggleGpsTracking() {
    if (gpsTrackingEnabled) {
        gpsTrackingEnabled = false;
        gpsLocatePending = false;
        disableGpsFollowMode();
        clearGeoWatch();
        setGpsTrackingUi({ tracking: false, fetching: false });
        updateRecenterButtonVisibility();
        schedulePersistMapPrefs();
        return false;
    }

    gpsTrackingEnabled = true;
    gpsLocatePending = true;
    setGpsTrackingUi({ tracking: true, fetching: true });
    const started = enableUserLocationTracking({ centerMap: true, active: true });
    if (!started) {
        gpsTrackingEnabled = false;
        gpsLocatePending = false;
        setGpsTrackingUi({ tracking: false, fetching: false });
        updateRecenterButtonVisibility();
        schedulePersistMapPrefs();
        return false;
    }
    updateRecenterButtonVisibility();
    schedulePersistMapPrefs();
    return true;
}

function applyUserLocation() {
    toggleGpsTracking();
}

let popupClickHandler = null;
let popupClickContainer = null;

/**
 * Leaflet wywołuje stopPropagation na popupie – klik w „Szczegóły” nie dochodzi
 * do kontenera w fazie bubble. Używamy capture, żeby obsłużyć przycisk.
 */
function bindPopupActions(container) {
    if (!container) return;

    if (popupClickHandler && popupClickContainer) {
        popupClickContainer.removeEventListener('click', popupClickHandler, true);
    }
    popupClickContainer = container;

    popupClickHandler = (event) => {
        const targetEl = event.target instanceof Element
            ? event.target
            : event.target?.parentElement;
        if (!targetEl?.closest) return;

        if (handlePromoFlyerToggle(targetEl)) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        const detailsBtn = targetEl.closest('[data-details-id]');
        if (detailsBtn) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation?.();
            const producerId = String(detailsBtn.dataset.detailsId || '').trim();
            if (!producerId) {
                console.warn('[Karte] Szczegóły: brak data-details-id');
                return;
            }
            console.log('[Map] Szczegóły kliknięte:', producerId);
            const popupRoot = detailsBtn.closest('.map-popup');
            const hint = popupRoot
                ? {
                    id: producerId,
                    name: popupRoot.dataset.producerName || '',
                    lat: Number(popupRoot.dataset.producerLat),
                    lng: Number(popupRoot.dataset.producerLng),
                    category: popupRoot.dataset.producerCategory || '',
                    address: popupRoot.dataset.producerAddress || '',
                    source: 'map-popup'
                }
                : null;
            try {
                openProducerModal(producerId, hint);
                syncModalOpenFlag();
                // Zamknij popup dopiero po klatce – unikaj ghost-click na backdrop
                window.setTimeout(() => {
                    if (!isProducerModalOpen()) return;
                    try {
                        logPopupLifecycle('POPUP_CLOSE', {
                            id: producerId,
                            reason: 'details-open-modal'
                        });
                        markIntentionalPopupClose();
                        leafletMap?.closePopup?.();
                    } catch (_) {
                        /* ignore */
                    }
                }, 50);
            } catch (error) {
                console.error('[Karte] Nie udało się otworzyć szczegółów producenta:', error);
            }
            return;
        }

        const favBtn = targetEl.closest('[data-favorite-id]');
        if (favBtn) {
            event.preventDefault();
            event.stopPropagation();
            const id = String(favBtn.dataset.favoriteId || '').trim();
            if (!id) return;
            if (isFavorite(id)) {
                removeFavorite(id);
            } else {
                addFavorite(id);
            }
            favBtn.textContent = isFavorite(id)
                ? `⭐ ${t('btn.favoriteSaved')}`
                : `⭐ ${t('btn.favorite')}`;
            refreshFavoritesBadge();
            return;
        }

        if (targetEl.closest('[data-ad-action]')) {
            handleNativeAdClick(event, {
                navigateTo: (view) => eventBus.emit(EVENTS.NAVIGATE, { view }),
                navigateToCategory: (category) => eventBus.emit(EVENTS.NAVIGATE, {
                    view: 'map',
                    filter: category
                })
            });
        }
    };

    // capture: true – zanim Leaflet zatrzyma bubble w .leaflet-popup
    container.addEventListener('click', popupClickHandler, true);
}

function bindMapToolbar(container) {
    const gpsBtn = container.querySelector('#mapGpsBtn');
    const osmBtn = container.querySelector('#mapOsmBtn');
    const recenterBtn = container.querySelector('#mapRecenterBtn');
    if (gpsBtn?.dataset.bound === 'true') {
        updateRecenterButtonVisibility();
        return;
    }
    if (gpsBtn) gpsBtn.dataset.bound = 'true';

    gpsBtn?.addEventListener('click', () => {
        toggleGpsTracking();
        updateRecenterButtonVisibility();
    });

    recenterBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        resumeGpsFollow();
    });

    osmBtn?.addEventListener('click', () => {
        if (!leafletMap) return;

        const stored = getLastPosition() || lastTrackedLocation;
        if (!stored) {
            if (!gpsTrackingEnabled) toggleGpsTracking();
            return;
        }

        currentMapCenter = [stored.lat, stored.lng];
        lastDataFetchLocation = { lat: stored.lat, lng: stored.lng };
        leafletMap.setView(currentMapCenter, MAP_ZOOM);
        applyMapCenter(currentMapCenter);
        // Odświeżenie OSM w tle – mapa zostaje interaktywna
        refreshOsmDataAtLocation(stored.lat, stored.lng);
    });

    const whatsNewBtn = container.querySelector('#mapWhatsNewBtn');
    whatsNewBtn?.addEventListener('click', () => {
        const diff = diffMapChanges({ radiusKm: currentRadiusKm });
        const message = formatMapChangesMessage(diff, t);
        showToast(message);
        const focusId = diff?.newProducers?.[0]?.id || diff?.newPromos?.[0]?.id;
        if (focusId && leafletMap) {
            focusProducerMarker(leafletMap, focusId);
        }
    });

    updateRecenterButtonVisibility();
}

function bindRadiusControl(container) {
    const slider = container.querySelector('#radiusSlider');
    const valueLabel = container.querySelector('#radiusValue');
    if (!slider || !valueLabel) return;
    if (slider.dataset.bound === 'true') return;
    slider.dataset.bound = 'true';

    const updateSliderFill = () => {
        const min = Number(slider.min);
        const max = Number(slider.max);
        const val = Number(slider.value);
        const pct = ((val - min) / (max - min)) * 100;
        slider.style.setProperty('--radius-pct', `${pct}%`);
    };

    const updateRadius = (km) => {
        currentRadiusKm = km;
        valueLabel.textContent = t('map.radiusKm').replace('{km}', String(km));
        updateSliderFill();

        if (leafletMap && currentMapCenter) {
            updateRadiusCircle(leafletMap, currentMapCenter, km);
            refreshMapMarkers();
            eventBus.emit(EVENTS.FILTER_RADIUS_CHANGED, { radius: km });
        }
        schedulePersistMapPrefs();
    };

    slider.addEventListener('input', () => {
        updateRadius(Number(slider.value));
    });

    updateSliderFill();
}

function bindResizeEvents() {
    if (_resizeBound) return;
    _resizeBound = true;

    eventBus.on(EVENTS.VIEW_CHANGED, ({ view }) => {
        if (view !== 'map') {
            markIntentionalPopupClose();
            pinnedPopupProducerId = null;
            closeProducerModal({ force: true });
            isModalOpen = false;
            if (mapViewContainer) closeMapSettingsPanel(mapViewContainer);
            // Pauza GPS / timerów / kolejki OSM – flaga gpsTrackingEnabled zostaje
            pauseMapBackgroundWork();
            return;
        }

        // Powrót na mapę: resumeExistingMap / finishMapInit robią robotę.
        // Tu tylko invalidateSize jeśli mapa już żyje – bez setView (skakanie).
        if (!leafletMap) return;
        scheduleMapTimeout(() => {
            if (!leafletMap) return;
            safeInvalidateSize(false);
            if (gpsTrackingEnabled && !geoWatchId) {
                startLocationWatch({ active: false });
                setGpsTrackingUi({ tracking: true, fetching: false });
            }
        }, 150);
    });

    eventBus.on(EVENTS.PLACES_LOADED, () => {
        if (!leafletMap) return;
        // Nie odświeżaj markerów poza aktywnym cyklem mapy
        scheduleRefreshMapMarkers({
            fitBounds: false,
            sync: hasActiveVisibilityFilter() || !locationDataFetchInFlight
        });
    });

    bindVisibilityBatteryPause();
}

/** Pauza GPS + OSM gdy karta / aplikacja w tle */
function bindVisibilityBatteryPause() {
    if (visibilityPauseBound || typeof document === 'undefined') return;
    visibilityPauseBound = true;

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearGeoWatch();
            if (osmRefreshDebounceTimer) {
                clearTimeout(osmRefreshDebounceTimer);
                osmRefreshDebounceTimer = null;
            }
            pendingOsmRefresh = null;
            pendingOsmRefreshLocation = null;
            dataFetchGeneration += 1;
            try {
                abortPendingDataLoads();
            } catch (_) {
                /* ignore */
            }
            return;
        }

        // Wróć do śledzenia tylko na widoku mapy i przy włączonym Live GPS
        if (!gpsTrackingEnabled || !leafletMap) return;
        const mapPanel = document.querySelector('[data-view-panel="map"]');
        const mapVisible = mapPanel && !mapPanel.hasAttribute('hidden')
            && mapPanel.style.display !== 'none';
        if (!mapVisible) return;

        startLocationWatch({ active: false });
        setGpsTrackingUi({ tracking: true, fetching: false });
    });
}

function injectMapStyles() {
    let style = document.getElementById('map-view-styles');
    if (!style) {
        style = document.createElement('style');
        style.id = 'map-view-styles';
        document.head.appendChild(style);
    }

    style.textContent = `
        [data-view-panel="map"] .leaflet-container {
            height: 100% !important;
            width: 100% !important;
            font-family: var(--font-sans);
        }
        .map-popup {
            font-size: 13px;
            line-height: 1.45;
            --map-popup-gap: 12px;
        }
        .leaflet-popup.producer-leaflet-popup,
        .leaflet-popup-pane {
            z-index: 1200 !important;
        }
        .leaflet-popup.producer-leaflet-popup {
            width: min(320px, calc(100vw - 24px)) !important;
            min-width: min(280px, calc(100vw - 24px)) !important;
            max-width: min(320px, calc(100vw - 24px)) !important;
            box-sizing: border-box;
        }
        .leaflet-popup.producer-leaflet-popup .leaflet-popup-content-wrapper {
            width: 100% !important;
            min-width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box;
            overflow-x: hidden;
            overflow-y: auto;
            max-height: min(90dvh, calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 72px));
            -webkit-overflow-scrolling: touch;
            touch-action: pan-y;
            overscroll-behavior: contain;
        }
        body.map-popup-scroll-active .leaflet-container {
            touch-action: none;
        }
        body.map-popup-scroll-active .leaflet-popup.producer-leaflet-popup .leaflet-popup-content-wrapper {
            touch-action: pan-y;
            overscroll-behavior: contain;
            -webkit-overflow-scrolling: touch;
        }
        .map-popup-btn,
        .map-popup-btn--link,
        .leaflet-popup.producer-leaflet-popup .leaflet-popup-close-button,
        .promo-flyer-toggle {
            touch-action: manipulation;
        }
        .leaflet-popup.producer-leaflet-popup .leaflet-popup-content {
            margin: 0;
            width: 100% !important;
            min-width: 0;
            max-width: 100%;
            box-sizing: border-box;
        }
        .map-popup {
            width: 100%;
            min-width: 0;
            box-sizing: border-box;
        }
        .map-popup-section--actions {
            position: sticky;
            bottom: 0;
            z-index: 2;
            padding-bottom: max(4px, env(safe-area-inset-bottom, 0px));
            background: linear-gradient(180deg, rgba(255, 252, 245, 0.92) 0%, rgba(255, 252, 245, 0.98) 24%, rgba(255, 252, 245, 1) 100%);
        }
        .map-popup-drag-handle {
            touch-action: none;
        }
        .leaflet-popup {
            pointer-events: auto;
        }
        body.map-popup-open .leaflet-popup-pane {
            z-index: 1300 !important;
        }
        .map-popup .producer-header-top {
            align-items: flex-start;
            cursor: grab;
        }
        .map-popup-desc,
        .map-popup em {
            color: var(--color-text-muted);
            font-style: normal;
        }
        .map-popup-actions {
            display: flex;
            flex-direction: column;
            gap: var(--map-popup-gap, 10px);
            margin: 0;
        }
        .map-popup-btn,
        .map-popup-btn--link {
            font-size: 13px;
            font-weight: 600;
            padding: 0 12px;
            min-height: 44px;
            height: 44px;
            border: 1px solid rgba(42, 63, 40, 0.16);
            border-radius: 10px;
            background: var(--color-card, #fff);
            cursor: pointer;
            text-align: center;
            text-decoration: none;
            color: var(--color-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: inherit;
            box-sizing: border-box;
            width: 100%;
        }
        .map-popup-btn:hover,
        .map-popup-btn:focus-visible,
        .map-popup-btn--link:hover,
        .map-popup-btn--link:focus-visible {
            background: rgba(79, 107, 60, 0.08);
            border-color: rgba(79, 107, 60, 0.28);
            outline: none;
        }
        .map-bottom-controls {
            display: none;
        }
        .map-draggable-control {
            z-index: 800;
            touch-action: none;
        }
        .map-draggable-control.is-dragging {
            cursor: grabbing;
            z-index: 850;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
        }
        .map-producer-list {
            position: relative;
            pointer-events: auto;
        }
        .map-list-toggle {
            width: 100%;
            min-height: auto;
        }
        .map-legend-panel {
            position: absolute;
            bottom: calc(100% + 6px);
            right: 0;
            min-width: 200px;
            padding: 10px 12px;
            background: rgba(255, 255, 255, 0.96);
            border: 1px solid rgba(90, 55, 20, 0.15);
            border-radius: var(--radius-md);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
            z-index: 900;
        }
        .map-legend-title {
            margin: 0 0 8px;
            font-size: 11px;
            font-weight: 700;
            color: var(--color-text-muted);
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }
        .map-legend-list {
            list-style: none;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .map-legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            font-weight: 600;
            color: var(--color-text, #2a2218);
        }
        .map-legend-swatch {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 1px solid rgba(0, 0, 0, 0.12);
            flex-shrink: 0;
        }
        .map-legend-icon {
            font-size: 16px;
            line-height: 1;
        }
        .map-legend-wrap {
            position: relative;
            pointer-events: auto;
        }
        .map-legend-btn {
            min-height: auto;
        }
        .map-producer-list-items {
            list-style: none;
            position: absolute;
            bottom: calc(100% + 6px);
            left: 0;
            right: 0;
            margin: 0;
            padding: 0;
            max-height: 34vh;
            overflow-y: auto;
            background: rgba(255, 255, 255, 0.92);
            border: 1px solid rgba(90, 55, 20, 0.12);
            border-radius: var(--radius-md);
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
            z-index: 900;
        }
        .map-producer-list-btn {
            width: 100%;
            min-height: 44px;
            padding: 10px 12px;
            border: none;
            border-bottom: 1px solid rgba(90, 55, 20, 0.08);
            background: transparent;
            text-align: left;
            font-family: inherit;
            font-size: 12px;
            font-weight: 600;
            color: var(--color-text, #2a2218);
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 2px;
        }
        .map-list-item-name {
            font-weight: 700;
        }
        .map-list-item-sub {
            font-size: 11px;
            font-weight: 500;
            color: var(--color-text-muted);
        }
        .map-producer-list-btn.is-active,
        .map-producer-list-btn:focus-visible {
            background: rgba(90, 55, 20, 0.12);
            outline: 2px solid var(--color-accent);
            outline-offset: -2px;
        }
        .map-producer-list-empty {
            padding: 12px;
            font-size: 12px;
            color: var(--color-text-muted);
        }
        .radius-hint {
            margin: 0;
            width: 100%;
            font-size: 11px;
            font-weight: 600;
            color: var(--color-primary);
            text-align: center;
        }
        .radius-control-row {
            display: flex;
            align-items: center;
            gap: 10px;
            width: 100%;
        }
    `;
}

export function isMapReady() {
    return leafletMap !== null;
}

/**
 * ETAP 42 — restart TYLKO mapy (destroy + renderMap), bez reload całej aplikacji.
 * @param {string} [reason]
 * @returns {{ ok: boolean, reason: string }}
 */
export function restartMapOnly(reason = 'map-guardian') {
    const container = mapViewContainer
        || document.querySelector?.('[data-view-panel="map"]')
        || document.getElementById?.('view-map');

    if (!container) {
        return { ok: false, reason: 'no-container' };
    }

    try {
        const filter = activeCategoryFilter;
        const query = activeSearchQuery;
        destroyLeafletMap();
        tilesEverLoaded = false;
        renderMap(container, {
            filter: filter && filter !== 'all' ? filter : undefined,
            category: filter && filter !== 'all' ? filter : undefined
        });
        if (query) {
            try {
                setSearchQuery(query);
            } catch (_) {
                /* ignore */
            }
        }
        console.info('[Map] restartMapOnly:', reason);
        return { ok: true, reason };
    } catch (err) {
        return { ok: false, reason: err?.message || 'restart-fail' };
    }
}

/**
 * ETAP 42 — migawka zdrowia mapy dla Map Guardian (bez mutacji).
 * @returns {object}
 */
export function getMapHealthSnapshot() {
    const container = mapViewContainer
        || document.querySelector?.('[data-view-panel="map"]')
        || document.getElementById?.('view-map');
    const panelHidden = Boolean(container?.hidden);
    const mapEl = container?.querySelector?.('#map') || null;
    const leafletOk = typeof window.L !== 'undefined';
    const instanceOk = Boolean(leafletMap);
    let sizeOk = false;
    let containerMatch = false;
    try {
        const size = leafletMap?.getSize?.();
        sizeOk = Boolean(size && size.x >= 8 && size.y >= 8);
        containerMatch = Boolean(leafletMap && mapEl && leafletMap.getContainer?.() === mapEl);
    } catch (_) {
        containerMatch = false;
    }

    const tileDom = mapEl
        ? mapEl.querySelectorAll('.leaflet-tile-loaded').length
        : 0;
    const tileLoaded = tilesEverLoaded || tileDom > 0;

    const visible = (() => {
        try {
            return limitVisibleProducers(getVisibleProducers());
        } catch (_) {
            return [];
        }
    })();
    const markerCount = (() => {
        try {
            return getRegisteredMarkerCount();
        } catch (_) {
            return 0;
        }
    })();
    const clusterOk = leafletOk
        && (typeof window.L.markerClusterGroup === 'function'
            ? hasMarkerClusterGroup() || visible.length === 0
            : true);

    const last = getLastPosition() || lastTrackedLocation;
    const gpsOk = Boolean(
        (last && Number.isFinite(last.lat) && Number.isFinite(last.lng))
        || geoWatchId != null
        || gpsTrackingEnabled
    );

    const radiusEl = container?.querySelector?.('#radiusSlider');
    const radiusOk = Number.isFinite(currentRadiusKm)
        && currentRadiusKm >= RADIUS_MIN
        && currentRadiusKm <= RADIUS_MAX
        && (!mapEl || Boolean(radiusEl));

    const filterOk = typeof activeCategoryFilter === 'string' && activeCategoryFilter.length > 0;

    let popupOk = true;
    try {
        if (leafletMap) {
            // API Leaflet dostępne; otwarty popup nie jest wymagany
            popupOk = typeof leafletMap.openPopup === 'function'
                || typeof leafletMap.closePopup === 'function';
        }
    } catch (_) {
        popupOk = false;
    }

    return {
        at: new Date().toISOString(),
        panelHidden,
        leafletReady: leafletOk && instanceOk && containerMatch && !container?.querySelector?.('.error-view'),
        leafletCdn: leafletOk,
        instanceOk,
        sizeOk,
        containerMatch,
        tileLoaded,
        tileDomCount: tileDom,
        tilesLastErrorAt,
        markerCount,
        visibleProducers: visible.length,
        markersOk: visible.length === 0 || markerCount > 0 || panelHidden,
        clusterOk,
        clusterAvailable: leafletOk && typeof window.L?.markerClusterGroup === 'function',
        gpsOk,
        gpsTracking: gpsTrackingEnabled,
        geoWatchActive: geoWatchId != null,
        radiusOk,
        radiusKm: currentRadiusKm,
        filterOk,
        filter: activeCategoryFilter,
        searchQuery: activeSearchQuery || '',
        popupOk,
        popupOpen: Boolean(isPopupOpen || leafletMap?.isPopupOpen?.()),
        ready: isMapReady()
    };
}

/**
 * ETAP 39 — Self-Heal map runtime (tylko stan, bez zmiany logiki domenowej).
 * Leaflet re-init · GPS last-known · odtworzenie markerów.
 * @returns {{ map: number, gps: number, markers: number, detail: string[] }}
 */
export function healMapRuntimeState() {
    const result = { map: 0, gps: 0, markers: 0, detail: [] };
    const container = mapViewContainer
        || document.querySelector?.('[data-view-panel="map"]')
        || document.getElementById?.('view-map');

    if (!container || container.hidden) {
        return result;
    }

    if (typeof window.L === 'undefined') {
        result.detail.push('leaflet-cdn-missing');
        return result;
    }

    const mapEl = container.querySelector('#map');
    const hasError = Boolean(container.querySelector('.error-view'));
    let containerMismatch = false;
    try {
        containerMismatch = Boolean(leafletMap && mapEl && leafletMap.getContainer?.() !== mapEl);
    } catch (_) {
        containerMismatch = true;
    }

    const leafletBroken = !leafletMap || !mapEl || hasError || containerMismatch;

    if (leafletBroken) {
        try {
            destroyLeafletMap();
            renderMap(container, {});
            result.map = 1;
            result.detail.push('leaflet-reinit');
        } catch (err) {
            result.detail.push(`leaflet-reinit-fail:${err?.message || 'error'}`);
            return result;
        }
    } else {
        try {
            const size = leafletMap.getSize?.();
            if (size && (size.x < 8 || size.y < 8)) {
                safeInvalidateSize(false);
                result.map = 1;
                result.detail.push('invalidate-size');
            }
        } catch (_) {
            /* ignore */
        }
    }

    if (!leafletMap) return result;

    const last = getLastPosition() || lastTrackedLocation;
    if (last && Number.isFinite(last.lat) && Number.isFinite(last.lng)) {
        const missingLive = !lastTrackedLocation;
        const missingCenter = !currentMapCenter;
        if (missingLive || missingCenter) {
            try {
                handlePositionUpdate({
                    lat: last.lat,
                    lng: last.lng,
                    source: 'self-heal-last'
                });
                eventBus.emit(EVENTS.LOCATION_UPDATED, {
                    lat: last.lat,
                    lng: last.lng,
                    source: 'self-heal-last'
                });
                result.gps = 1;
                result.detail.push('gps-last-known');
            } catch (_) {
                result.detail.push('gps-fallback-fail');
            }
        }
    }

    // Markery: odtwórz gdy są producenci, a brakuje wpisów w rejestrze
    try {
        const visible = limitVisibleProducers(getVisibleProducers());
        if (visible.length > 0) {
            const sample = visible.slice(0, 8);
            const missing = sample.some((p) => !getMarkerById(p.id));
            if (missing) {
                const count = refreshMapMarkers({ force: true, sync: true, fitBounds: false });
                result.markers = 1;
                result.detail.push(`markers-rebuilt:${count}`);
            }
        }
    } catch (_) {
        result.detail.push('markers-heal-fail');
    }

    return result;
}

export default {
    renderMap,
    isMapReady,
    healMapRuntimeState,
    getMapHealthSnapshot,
    restartMapOnly
};
