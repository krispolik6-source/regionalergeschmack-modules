/**
 * Map View — Premium Polish (CSS smoke)
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function ok(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error('FAIL', msg);
    } else {
        console.log('OK', msg);
    }
}

const style = readFileSync(join(ROOT, 'css/style.css'), 'utf8');
const map = readFileSync(join(ROOT, 'css/map-premium.css'), 'utf8');

ok(style.includes('map-premium.css?v='), 'style.css imports map-premium');
ok(map.includes('body.view-map-active'), 'scoped to map view');
ok(map.includes('--map-card-radius: 18px'), 'card radius 18px');
ok(map.includes('--map-btn-radius: 14px'), 'button radius 14px');
ok(map.includes('--map-focus'), 'gold focus token');
ok(map.includes('backdrop-filter: none'), 'no glass on map chrome');
ok(map.includes('#f3f7f2'), 'warm canvas fallback');
ok(!map.includes('#e8eef2'), 'no cool blue-gray canvas');
ok(!map.includes('#4a5568'), 'no slate category count');
ok(!map.includes('.leaflet-popup'), 'popups untouched');
ok(!map.includes('producer-marker'), 'markers untouched');
ok(map.includes('body.dark-mode.view-map-active'), 'dark mode rules');
ok(map.includes('prefers-reduced-motion'), 'reduced motion');
ok(map.includes('.map-offline-banner'), 'offline banner styled');
ok(map.includes('.map-toolbar-unified'), 'toolbar styled');

console.log(failed ? `\nRESULT FAIL ${failed}` : '\nRESULT PASS');
process.exit(failed ? 1 : 0);
