/**
 * Statyczny audyt lifecycle markerów/popupów (ETAP 8.1).
 * Uruchom: node scripts/audit-popup-lifecycle.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mapCore = fs.readFileSync(path.join(root, 'js/map/map.js'), 'utf8');
const mapView = fs.readFileSync(path.join(root, 'js/views/map.js'), 'utf8');

let failed = 0;
function ok(label) {
    console.log(`✅ ${label}`);
}
function bad(label) {
    failed += 1;
    console.error(`❌ ${label}`);
}

// 1. addMarkers nie woła clearLayers
const addMarkersFn = mapCore.slice(
    mapCore.indexOf('export function addMarkers'),
    mapCore.indexOf('export function replaceMarkers')
);
if (/clearLayers\s*\(/.test(addMarkersFn)) bad('addMarkers zawiera clearLayers()');
else ok('addMarkers bez clearLayers()');

// 2. Ochrona otwartego popupu przy detach
if (/isPopupOpen\?\.?\(\)/.test(mapCore) && /detach-blocked-popup-open|Nigdy nie usuwaj markera/.test(mapCore)) {
    ok('detachMarker chroni marker z otwartym popupem');
} else bad('Brak ochrony isPopupOpen w detachMarker');

// 3. Helpery + diagnostyka
if (mapCore.includes('export function getOpenPopupProducerId')
    && mapCore.includes('export function logPopupLifecycle')
    && mapCore.includes('[PopupLifecycle]')) {
    ok('Eksport getOpenPopupProducerId / logPopupLifecycle');
} else bad('Brak helperów popup lifecycle / logów');

// 4. deferAdds / deferRemovals – jawne flagi (filtr kategorii nie jest blokowany przez popup)
if (mapCore.includes('deferRemovals') && mapCore.includes('deferAdds')
    && /deferRemovals\s*=\s*Boolean\(deferRemovalsOpt\)/.test(mapCore)
    && mapCore.includes('openedPopupId && id === String(openedPopupId)')) {
    ok('addMarkers: defer jawny + ochrona pojedynczego markera z popupem');
} else bad('addMarkers: brak defer/ochrony markera popupu');

// 5. refreshMapMarkers: filtr natychmiastowy; OSM defer gdy popup; brak reopen po sync
const refreshFn = mapView.slice(
    mapView.indexOf('function refreshMapMarkers'),
    mapView.indexOf('function scheduleRefreshMapMarkers')
);
if (refreshFn.includes('deferLayerChurn')
    && refreshFn.includes('filterChange')
    && refreshFn.includes('producerPassesActiveFilter')
    && !/reopenProducerPopup\s*\(/.test(refreshFn)
    && /Nie ruszaj warstwy Leaflet|zero churn/.test(refreshFn)
    && /return 0;/.test(refreshFn)) {
    ok('refreshMapMarkers: filtr natychmiastowy, pełny skip warstwy przy popupie');
} else bad('refreshMapMarkers nie chroni popupu / filtra wg ETAP 8.1+fix');

// 6. Usunięty niebezpieczny timeout force refresh po kliknięciu
const clickIdx = mapView.indexOf('rg:marker-click');
const clickSlice = mapView.slice(clickIdx, clickIdx + 600);
if (/force:\s*true/.test(clickSlice)) bad('Handler rg:marker-click nadal force refresh');
else ok('Handler markera bez force refresh');

// 7. moveend/zoomend nie wołają refreshMapMarkers
const moveSlice = mapView.slice(mapView.indexOf("on('moveend'"), mapView.indexOf("on('moveend'") + 200);
const zoomSlice = mapView.slice(mapView.indexOf("on('zoomend'"), mapView.indexOf("on('zoomend'") + 200);
if (/refreshMapMarkers/.test(moveSlice)) bad('moveend woła refreshMapMarkers');
else ok('moveend bez refreshMapMarkers');
if (/refreshMapMarkers/.test(zoomSlice)) bad('zoomend woła refreshMapMarkers');
else ok('zoomend bez refreshMapMarkers');

// 8. loadProducersInBackground → scheduleRefresh (nie renderMap)
const loadSlice = mapView.slice(
    mapView.indexOf('function loadProducersInBackground'),
    mapView.indexOf('function refreshOsmDataAtLocation')
);
if (/renderMap\s*\(/.test(loadSlice) || /resetMarkersLayer\s*\(/.test(loadSlice)) {
    bad('loadProducersInBackground woła renderMap/resetMarkersLayer');
} else if (/scheduleRefreshMapMarkers/.test(loadSlice)) {
    ok('loadProducersInBackground → scheduleRefreshMapMarkers (bez renderMap)');
} else bad('loadProducersInBackground nie odświeża markerów');

// 9. clearLayers tylko w resetMarkersLayer
const clearIdx = [...mapCore.matchAll(/clearLayers\s*\(/g)];
const resetIdx = mapCore.indexOf('export function resetMarkersLayer');
const focusIdx = mapCore.indexOf('export function focusProducerMarker');
const onlyInReset = clearIdx.every((m) => m.index > resetIdx && m.index < focusIdx);
if (onlyInReset) ok('clearLayers() tylko w resetMarkersLayer');
else bad(`clearLayers poza resetMarkersLayer (${clearIdx.length})`);

// 10. GPS nie syncuje markerów przy otwartym popupie
if (mapView.includes("reason: 'gps-marker-sync'")
    && mapView.includes('isMapInteractionBlocking()')) {
    ok('GPS odkłada sync markerów przy popupie');
} else bad('Brak defer GPS przy otwartym popupie');

// 12. fitBounds / invalidateSize chronione przy popupie; popup bez autoPan
if (mapView.includes('FITBOUNDS_SKIPPED') && mapView.includes('safeInvalidateSize')) {
    ok('fitBounds/invalidateSize pomijane przy otwartym popupie');
} else bad('Brak ochrony fitBounds/invalidateSize przy popupie');
if (/autoPan:\s*false/.test(mapCore)) {
    ok('bindPopup: autoPan:false (anty-shift klastra)');
} else bad('bindPopup nadal z autoPan:true');

// 11. Logi diagnostyczne wymagane w ETAP 8.1
const requiredLogs = [
    'OPEN', 'SYNC_START', 'SYNC_DEFERRED', 'MARKER_UPDATED', 'MARKER_SKIPPED',
    'QUEUE_FLUSH', 'POPUP_CLOSE', 'POPUP_REOPEN', 'POPUP_DESTROY'
];
const missing = requiredLogs.filter((name) => {
    const inCore = mapCore.includes(`'${name}'`) || mapCore.includes(`"${name}"`);
    const inView = mapView.includes(`'${name}'`) || mapView.includes(`"${name}"`);
    return !inCore && !inView;
});
if (missing.length) bad(`Brak logów: ${missing.join(', ')}`);
else ok('Wszystkie tagi [PopupLifecycle] obecne w kodzie');

if (failed) {
    console.error(`\nAudyt: ${failed} błędów`);
    process.exit(1);
}
console.log('\nAudyt popup lifecycle: OK');
