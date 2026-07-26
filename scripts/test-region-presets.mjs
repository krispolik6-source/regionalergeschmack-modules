/**
 * Smoke: wybór regionu + OSM presets (Osnabrück, Bielefeld…)
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function assert(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error(`FAIL ${msg}`);
    } else {
        console.log(`OK   ${msg}`);
    }
}

const store = new Map();
globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k)
};

const {
    REGION_PRESETS,
    REGION_STORAGE_KEY,
    getRegionById,
    getSelectedRegionId,
    setSelectedRegionId,
    buildRegionSelectOptionsHtml
} = await import(pathToFileURL(join(ROOT, 'js/data/regionPresets.js')).href);

assert(REGION_STORAGE_KEY === 'rg_selected_region', 'storage key');
assert(REGION_PRESETS.length >= 2, 'at least 2 regions');
assert(REGION_PRESETS.some((r) => r.id === 'osnabrueck'), 'Osnabrück preset');
assert(REGION_PRESETS.some((r) => r.id === 'bielefeld'), 'Bielefeld preset');

const os = getRegionById('osnabrueck');
assert(os && Number.isFinite(os.lat) && Number.isFinite(os.lng), 'Osnabrück coords');
assert(os.radiusKm >= 5, 'Osnabrück radius');

assert(getSelectedRegionId() === '', 'no selection by default');
setSelectedRegionId('bielefeld');
assert(getSelectedRegionId() === 'bielefeld', 'persists selection');
setSelectedRegionId('');
assert(getSelectedRegionId() === '', 'clears selection');

const htmlOpts = buildRegionSelectOptionsHtml((k) => k, 'osnabrueck');
assert(htmlOpts.includes('value="osnabrueck"'), 'options include osnabrueck');
assert(htmlOpts.includes('selected'), 'selected option');
assert(htmlOpts.includes('value="bielefeld"'), 'options include bielefeld');

const map = readFileSync(join(ROOT, 'js/views/map.js'), 'utf8');
assert(map.includes('mapRegionSelect'), 'map has region select');
assert(map.includes('bindRegionControl'), 'map binds region control');
assert(map.includes('refreshOsmDataAtLocation'), 'region triggers OSM refresh');
assert(map.includes('region-preset'), 'saves position as region-preset');

const css = readFileSync(join(ROOT, 'css/style.css'), 'utf8');
assert(css.includes('.map-region-select'), 'CSS for region select');

const i18n = readFileSync(join(ROOT, 'js/translations.js'), 'utf8');
assert(i18n.includes('regions:'), 'regions i18n block');
assert(i18n.includes("osnabrueck: 'Osnabrück'"), 'Osnabrück label');
assert(i18n.includes("bielefeld: 'Bielefeld'"), 'Bielefeld label');

if (failed) {
    console.error(`\n${failed} failure(s)`);
    process.exit(1);
}
console.log('\nRegion presets checks passed.');
