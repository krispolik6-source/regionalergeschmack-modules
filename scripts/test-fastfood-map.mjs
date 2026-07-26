import fs from 'fs';
import { HOME_CATEGORY_MAP, filterProducersByCategory, normalizeProducerCategory } from '../js/data/producerHelpers.js';
import { isCategoryVisible, initMapSettings, getMarkerColor } from '../js/map/mapSettings.js';

let failed = 0;
function ok(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error('FAIL', msg);
    } else {
        console.log('OK', msg);
    }
}

const sample = [
    { id: 'a', category: 'fast_food', name: 'Imbiss', lat: 50.7, lng: 7.1 },
    { id: 'b', category: 'fastfood', name: 'Alias', lat: 50.71, lng: 7.11 },
    { id: 'c', category: 'restaurant', name: 'Gasthaus', lat: 50.72, lng: 7.12 }
];

ok(normalizeProducerCategory('fastfood') === 'fast_food', 'normalize fastfood');
ok(filterProducersByCategory(sample, 'fastFood').length === 2, 'filter treats aliases');
ok(HOME_CATEGORY_MAP.fastFood === 'fast_food', 'home map');

initMapSettings();
ok(isCategoryVisible('fast_food') === true, 'visible fast_food');
ok(isCategoryVisible('fastfood') === true, 'visible fastfood alias');
ok(getMarkerColor('fastFood') === getMarkerColor('fast_food'), 'marker color alias');

const app = fs.readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
const nav = fs.readFileSync(new URL('../js/controllers/navigation.js', import.meta.url), 'utf8');
const map = fs.readFileSync(new URL('../js/views/map.js', import.meta.url), 'utf8');

const appMapImport = app.match(/from ['"](\.\/views\/map\.js[^'"]*)['"]/)?.[1];
const navMapImport = nav.match(/from ['"](\.\.\/views\/map\.js[^'"]*)['"]/)?.[1];
ok(Boolean(appMapImport) && Boolean(navMapImport), 'map imports present');
ok(
    appMapImport?.replace(/^\.\//, '') === navMapImport?.replace(/^\.\.\//, ''),
    `same map module URL (app=${appMapImport}, nav=${navMapImport})`
);

ok(!map.includes("dataService.js?v="), 'map uses shared dataService (no ?v=)');
ok(map.includes('resolveCategoryFilterId'), 'map resolves category aliases');
ok(map.includes('fitMapToProducers'), 'map fits bounds for category filter');
ok(
    /activeCategoryFilter = resolveCategoryFilterId/.test(map),
    'setCategoryFilter normalizes id'
);

console.log(failed ? `RESULT FAIL ${failed}` : 'RESULT PASS');
process.exit(failed ? 1 : 0);
