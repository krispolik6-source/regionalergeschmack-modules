/**
 * Smoke K2 – GPS nie przebudowuje listy producentów przy każdym ticku.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function assert(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error(`❌ ${msg}`);
    } else {
        console.log(`✅ ${msg}`);
    }
}

const mapSrc = readFileSync(join(ROOT, 'js/views/map.js'), 'utf8');
const policyPath = join(ROOT, 'js/map/gpsListRefreshPolicy.js');

assert(existsSync(policyPath), 'gpsListRefreshPolicy.js exists');

const policy = await import(`file://${policyPath.replace(/\\/g, '/')}`);
const {
    shouldRefreshProducerListOnGps,
    LIST_REFRESH_MOVE_THRESHOLD_M,
    LIST_REFRESH_DEBOUNCE_MS
} = policy;

assert(LIST_REFRESH_MOVE_THRESHOLD_M === 100, 'próg ruchu 100 m');
assert(LIST_REFRESH_DEBOUNCE_MS === 5000, 'debounce 5 s');

const base = { lat: 52.52, lng: 13.405 };
const near = { lat: 52.5205, lng: 13.4055 }; // ~70 m
const far = { lat: 52.53, lng: 13.405 }; // ~1.1 km

assert(shouldRefreshProducerListOnGps(null, base, { isFirstFix: true }), 'isFirstFix → refresh');
assert(shouldRefreshProducerListOnGps(null, base, { isFirstFix: false }), 'brak last → refresh');
assert(!shouldRefreshProducerListOnGps(base, near, { isFirstFix: false }), 'mały ruch → bez refresh');
assert(shouldRefreshProducerListOnGps(base, far, { isFirstFix: false }), 'duży ruch → refresh');

assert(mapSrc.includes('shouldRefreshProducerListOnGps'), 'map importuje politykę');
assert(mapSrc.includes('scheduleSoftRefreshProducerList'), 'map ma scheduler listy');
assert(mapSrc.includes('isFirstFix'), 'LOCATION_UPDATED emituje isFirstFix');
assert(mapSrc.includes('immediate: !!isFirstFix'), 'pierwszy fix natychmiast');
assert(!/LOCATION_UPDATED[\s\S]{0,200}softRefreshProducerListDistances\(\)/.test(mapSrc),
    'brak bezwarunkowego softRefresh w listenerze');

const syntax = spawnSync(process.execPath, ['--check', policyPath], { encoding: 'utf8' });
assert(syntax.status === 0, 'syntax gpsListRefreshPolicy.js');

console.log(failed ? `\n${failed} failed` : '\nMap GPS list refresh checks passed.');
process.exit(failed ? 1 : 0);
