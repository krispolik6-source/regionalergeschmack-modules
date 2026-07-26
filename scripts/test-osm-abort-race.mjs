/**
 * B4 – race abort OSM vs stale-cache registry
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

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

const osmPath = join(ROOT, 'js/data/osmService.js');
const dsPath = join(ROOT, 'js/data/dataService.js');
const mapPath = join(ROOT, 'js/views/map.js');
const osmSrc = readFileSync(osmPath, 'utf8');
const dsSrc = readFileSync(dsPath, 'utf8');
const mapSrc = readFileSync(mapPath, 'utf8');

assert(osmSrc.includes('createOsmAbortError'), 'osmService: createOsmAbortError');
assert(osmSrc.includes('isOsmAbortError'), 'osmService: isOsmAbortError');
assert(osmSrc.includes('isAborted = true'), 'osmService: isAborted flag');
assert(osmSrc.includes('throwIfOsmAborted'), 'osmService: epoch guard before cache');

assert(dsSrc.includes('export function abortPendingDataLoads'), 'dataService: abortPendingDataLoads');
assert(dsSrc.includes('isOsmAbortError'), 'dataService: import isOsmAbortError');
assert(dsSrc.includes('live.aborted'), 'dataService: aborted live path');
assert(dsSrc.includes("source: 'aborted'"), 'dataService: aborted result source');
assert(dsSrc.includes('pagehide'), 'dataService: pagehide cancel');

assert(mapSrc.includes('abortPendingDataLoads'), 'map.js: abortPendingDataLoads');
assert(!mapSrc.includes('abortInflightOsmRequests'), 'map.js: bez bezpośredniego abortInflightOsmRequests');

const {
    createOsmAbortError,
    isOsmAbortError,
    getOsmAbortEpoch,
    abortInflightOsmRequests
} = await import(`file://${osmPath.replace(/\\/g, '/')}?t=${Date.now()}`);

const err = createOsmAbortError();
assert(isOsmAbortError(err), 'isOsmAbortError rozpoznaje flagę');
assert(getOsmAbortEpoch() === 0, 'początkowy osmAbortEpoch = 0');
abortInflightOsmRequests();
assert(getOsmAbortEpoch() === 1, 'abortInflightOsmRequests podbija epoch');

const mem = {};
globalThis.localStorage = {
    getItem(k) { return mem[k] ?? null; },
    setItem(k, v) { mem[k] = String(v); },
    removeItem(k) { delete mem[k]; }
};

mem['rg_producers_data_v9'] = JSON.stringify({
    timestamp: Date.now() - 999_999_999,
    lat: 51.96,
    lng: 7.63,
    producers: [{
        id: 'stale-race-1',
        name: 'Stale Race Producer',
        lat: 51.96,
        lng: 7.63,
        category: 'shop',
        source: 'osm'
    }]
});

let fetchStarted = false;
globalThis.fetch = (_url, opts) => {
    fetchStarted = true;
    return new Promise((resolve, reject) => {
        const signal = opts?.signal;
        if (signal?.aborted) {
            reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }));
            return;
        }
        signal?.addEventListener?.('abort', () => {
            reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }));
        }, { once: true });
    });
};

const dsUrl = `file://${dsPath.replace(/\\/g, '/')}?race=${Date.now()}`;
const {
    loadAllData,
    resetProducersForTests,
    getProducers,
    getLastLoadMeta,
    abortPendingDataLoads
} = await import(dsUrl);

resetProducersForTests();
const metaBefore = getLastLoadMeta().source;
const idsBefore = getProducers().map((p) => p.id);

const loadPromise = loadAllData(51.96, 7.63, { radiusKm: 10, forceRefresh: true });

await new Promise((r) => setTimeout(r, 80));
assert(fetchStarted, 'fetch OSM wystartował');

abortPendingDataLoads();
const result = await loadPromise;

assert(result.aborted || result.stale, 'wynik oznaczony aborted/stale');
assert(result.source !== 'stale-cache', 'abort nie zapisuje stale-cache do registry');
assert(
    !getProducers().some((p) => p.id === 'stale-race-1'),
    'registry bez producenta ze stale-cache po abort'
);
assert(getLastLoadMeta().source === metaBefore, 'lastLoadMeta bez zmiany po abort');

if (failed) {
    console.error(`\n${failed} test(ów) nie przeszło`);
    process.exit(1);
}
console.log('\n✅ test-osm-abort-race OK');
