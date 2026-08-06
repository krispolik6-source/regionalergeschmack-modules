/**
 * Test: inteligentny bottom sheet panelu mapy (wysokość viewportu).
 * Run: node scripts/test-map-toolbar-sheet.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const mapJs = fs.readFileSync(path.join(root, 'js/views/map.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css/style.css'), 'utf8');
const phCss = fs.readFileSync(path.join(root, 'css/premium-header.css'), 'utf8');
const mapPremiumCss = fs.readFileSync(path.join(root, 'css/map-premium.css'), 'utf8');

let ok = 0;
let fail = 0;

function assert(label, cond) {
    if (cond) {
        ok += 1;
        console.log(`  ✓ ${label}`);
    } else {
        fail += 1;
        console.log(`  ✗ ${label}`);
    }
}

console.log('\nTest: map toolbar sheet (height-aware)\n');

assert('MAP_TOOLBAR_AUTO_COLLAPSE_HEIGHT_PX = 700', /MAP_TOOLBAR_AUTO_COLLAPSE_HEIGHT_PX\s*=\s*700/.test(mapJs));
assert('getMapWorkAreaHeight()', /function getMapWorkAreaHeight/.test(mapJs));
assert('visualViewport w getMapWorkAreaHeight', /visualViewport/.test(mapJs));
assert('isMapWorkAreaCompact()', /function isMapWorkAreaCompact/.test(mapJs));
assert('shouldAutoCollapseToolbarForPopup()', /function shouldAutoCollapseToolbarForPopup/.test(mapJs));
assert('collapse używa shouldAutoCollapseToolbarForPopup', /function collapseMapToolbarForPopup[\s\S]{0,120}shouldAutoCollapseToolbarForPopup/.test(mapJs));
assert('handleMapToolbarViewportChange', /function handleMapToolbarViewportChange/.test(mapJs));
assert('scheduleMapToolbarViewportSync (debounce)', /function scheduleMapToolbarViewportSync/.test(mapJs));
assert('visualViewport resize listener', /visualViewport\.addEventListener\('resize'/.test(mapJs));
assert('visualViewport cleanup', /visualViewport\.removeEventListener\('resize'/.test(mapJs));
assert('orientationchange listener', /orientationchange/.test(mapJs));
assert('mapToolbarExpandedBeforePopup zachowany', /mapToolbarExpandedBeforePopup/.test(mapJs));
assert('persist toolbarExpanded w prefs', /toolbarExpanded/.test(mapJs));
assert('layout snapshot anty-flicker', /mapToolbarLayoutSnapshot/.test(mapJs));
assert('restoreMapToolbarAfterPopup', /function restoreMapToolbarAfterPopup/.test(mapJs));
assert('CSS: is-sheet-active bez max-width lock', /\.map-bottom-panel\.is-sheet-active[\s\S]*pointer-events/.test(css));
assert('CSS: handle ukryty bez is-sheet-active na desktop', /\.map-bottom-panel:not\(\.is-sheet-active\)[\s\S]*map-toolbar-sheet-handle/.test(css));
assert('popupopen: collapseMapToolbarForPopup', /collapseMapToolbarForPopup\(\)/.test(mapJs));
assert('finishPopup: restoreMapToolbarAfterPopup', /restoreMapToolbarAfterPopup\(\)/.test(mapJs));
assert('viewport timer cleanup w pause', /mapToolbarViewportTimer[\s\S]*pauseMapBackgroundWork|pauseMapBackgroundWork[\s\S]*mapToolbarViewportTimer/.test(mapJs));
assert('CSS: expandable header height on body', /body:has\(\.main-header\.header-expandable\)[\s\S]*--header-height/.test(phCss));
assert('CSS: map viewport uses legal-footer', /body\.view-map-active[\s\S]*--legal-footer-height/.test(mapPremiumCss));
assert('CSS: mobile map viewport includes legal-footer', /@media screen and \(max-width: 430px\)[\s\S]*--map-viewport-height[\s\S]*--legal-footer-height/.test(css));

console.log(`\nWynik: ${ok} OK, ${fail} FAIL\n`);
process.exit(fail > 0 ? 1 : 0);
