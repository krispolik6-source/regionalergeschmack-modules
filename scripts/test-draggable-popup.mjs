/**
 * Statyczny test draggable popup producenta + szerokość layoutu.
 * Run: node scripts/test-draggable-popup.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getProducerPopupTargetWidth } from '../js/map/draggableProducerPopup.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let passed = 0;
let failed = 0;

function ok(msg) {
    passed += 1;
    console.log(`  ✓ ${msg}`);
}

function fail(msg) {
    failed += 1;
    console.error(`  ✗ ${msg}`);
}

function read(rel) {
    return readFileSync(join(ROOT, rel), 'utf8');
}

console.log('\nTest: draggable producer popup\n');

const modulePath = 'js/map/draggableProducerPopup.js';
const mapViewPath = 'js/views/map.js';
const stylePath = 'css/style.css';

if (!existsSync(join(ROOT, modulePath))) {
    fail('Brak js/map/draggableProducerPopup.js');
} else {
    ok('Moduł draggableProducerPopup.js istnieje');
}

const mod = read(modulePath);
const mapView = read(mapViewPath);
const styleCss = read(stylePath);

const requiredExports = [
    'attachDraggableProducerPopup',
    'detachDraggableProducerPopup',
    'ensureProducerPopupLayout',
    'getProducerPopupTargetWidth'
];
for (const name of requiredExports) {
    if (mod.includes(`export function ${name}`) || mod.includes(`function ${name}`)) ok(`Eksport: ${name}`);
    else fail(`Brak eksportu: ${name}`);
}

const requiredBehaviours = [
    ['DRAG_THRESHOLD_PX', 'próg drag'],
    ['map.dragging.disable', 'blokada panu podczas drag'],
    ['map.dragging.enable', 'przywrócenie panu po drag'],
    ['clampDragOffset', 'clamp viewport'],
    ['applyScrollConstraints', 'scroll pionowy'],
    ['ensureProducerPopupLayout', 'wymuszenie szerokości popupu'],
    ['leaflet-popup-close-button', 'ochrona przycisku zamknięcia'],
    ['.producer-header-top', 'drag tylko z nagłówka'],
    ['map-popup-drag-handle', 'uchwyt drag'],
    ['readSafeAreaInsets', 'safe area / notch'],
    ['pointerdown', 'obsługa touch + mouse'],
    ['originalUpdatePosition', 'patch _updatePosition'],
    ['PopupScrollDiag', 'diagnostyka scroll localhost'],
    ['lockMapInteraction', 'blokada mapy przy scroll'],
    ['overscrollBehavior', 'overscroll contain'],
    ['disableScrollPropagation', 'Leaflet scroll propagation off'],
    ['isInteractivePopupTarget', 'kliknięcia w przyciski bez blokady'],
    ['map-popup-scroll-active', 'klasa scroll-active']
];
for (const [token, label] of requiredBehaviours) {
    if (mod.includes(token)) ok(label);
    else fail(`Brak: ${label} (${token})`);
}

if (mapView.includes("from '../map/draggableProducerPopup.js'")) {
    ok('map.js importuje draggableProducerPopup');
} else {
    fail('map.js nie importuje draggableProducerPopup');
}

if (mapView.includes('attachDraggableProducerPopup(event.popup, leafletMap)')) {
    ok('popupopen: attach draggable');
} else {
    fail('popupopen: brak attach draggable');
}

if (mapView.includes('detachDraggableProducerPopup(event?.popup)')) {
    ok('popupclose: detach draggable');
} else {
    fail('popupclose: brak detach draggable');
}

if (mapView.includes('pinnedPopupProducerId') && mapView.includes('schedulePinnedPopupRecovery')) {
    ok('popup preserve: pin + recovery po pan mapy');
} else {
    fail('popup preserve: brak pin/recovery');
}

if (mapView.includes('bindPopupMapGesturePreserve')) {
    ok('popup preserve: movestart/moveend handlers');
} else {
    fail('popup preserve: brak gesture preserve');
}

const mapCore = read('js/map/map.js');
if (mapCore.includes('removeOutsideVisibleBounds: false')) {
    ok('cluster: removeOutsideVisibleBounds false');
} else {
    fail('cluster: brak removeOutsideVisibleBounds false');
}

if (mapCore.includes('autoClose: false')) {
    ok('bindPopup: autoClose false');
} else {
    fail('bindPopup: brak autoClose false');
}

if (mapView.includes('touch-action: pan-y') && mapView.includes('map-popup-drag-handle')) {
    ok('CSS injectMapStyles: scroll treści + drag tylko na uchwycie');
} else {
    fail('CSS injectMapStyles: brak pan-y / uchwyt drag');
}

if (mapView.includes('position: sticky') && mapView.includes('.map-popup-section--actions')) {
    ok('CSS injectMapStyles: sticky footer sekcji akcji');
} else {
    fail('CSS injectMapStyles: brak sticky footer');
}

if (styleCss.includes('position: sticky') && styleCss.includes('.map-popup-section--actions')) {
    ok('CSS style.css: sticky footer akcji');
} else {
    fail('CSS style.css: brak sticky footer akcji');
}

if (mapView.includes('safe-area-inset') && mapView.includes('90dvh')) {
    ok('CSS: responsywność + safe area');
} else {
    fail('CSS: brak safe area / 90dvh');
}

if (mapView.includes('-webkit-overflow-scrolling: touch')) {
    ok('CSS: scroll mobilny w popupie');
} else {
    fail('CSS: brak -webkit-overflow-scrolling');
}

if (mapView.includes('overscroll-behavior: contain') && styleCss.includes('overscroll-behavior: contain')) {
    ok('CSS: overscroll-behavior contain');
} else {
    fail('CSS: brak overscroll-behavior contain');
}

if (mapView.includes('map-popup-scroll-active') && styleCss.includes('map-popup-scroll-active')) {
    ok('CSS: map-popup-scroll-active');
} else {
    fail('CSS: brak map-popup-scroll-active');
}

if (styleCss.includes('min(320px, calc(100vw - 24px))')) {
    ok('CSS style.css: stała szerokość popupu mobile');
} else {
    fail('CSS style.css: brak reguły szerokości popupu');
}

if (!mod.includes('setLatLng')) {
    ok('Marker pozostaje: brak setLatLng w module drag');
} else {
    fail('Moduł drag wywołuje setLatLng – rusza marker/popup anchor');
}

console.log('\n  Szerokość popupu (getProducerPopupTargetWidth):');
for (const vw of [320, 360, 390, 430]) {
    const w = getProducerPopupTargetWidth(vw);
    if (w >= 240 && w <= 320) {
        ok(`${vw}px viewport → ${w}px popup`);
    } else {
        fail(`${vw}px viewport → ${w}px popup (poza 240–320)`);
    }
}

console.log(`\nWynik: ${passed} OK, ${failed} FAIL\n`);
process.exit(failed > 0 ? 1 : 0);
