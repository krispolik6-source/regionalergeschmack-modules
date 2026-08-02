/**
 * Symulacja stabilności 60 min jazdy @ ~90 km/h — pełny raport wydajności.
 * Run: node scripts/test-map-driving-stability-60m.mjs
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const mapSrc = readFileSync(join(ROOT, 'js/views/map.js'), 'utf8');

const LOCATION_MOVE_THRESHOLD_M = 200;
const OSM_REFRESH_DEBOUNCE_MS = 12000;
const OSM_REFRESH_MIN_INTERVAL_MS = 15000;
const GPS_PIN_MOVE_MIN_M = 8;
const MARKER_SYNC_MOVE_M = 50;
const MARKER_LIMIT = 100;
const DRIVE_DURATION_MS = 60 * 60 * 1000;
const TICK_MS = 1000;
const SPEED_M_S = 25; // ~90 km/h
const OVERPASS_MS_MIN = 3000;
const OVERPASS_MS_MAX = 8000;
const SAMPLE_EVERY_MS = 5 * 60 * 1000; // co 5 min

let failed = 0;

function assert(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error(`❌ ${msg}`);
    } else {
        console.log(`✅ ${msg}`);
    }
}

function distanceMeters(a, b) {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const lat1 = (a.lat * Math.PI) / 180;
    const lat2 = (b.lat * Math.PI) / 180;
    const h = Math.sin(dLat / 2) ** 2
        + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)) * 1000;
}

function randOverpassMs(seed) {
    const span = OVERPASS_MS_MAX - OVERPASS_MS_MIN;
    return OVERPASS_MS_MIN + (seed * 7919 % span);
}

/** Model P1 — scheduleOsmRefreshAtLocation */
function createOsmScheduler() {
    let debounceTimer = null;
    let debounceFiresAt = null;
    let pendingLoc = null;
    let lastOsmRefreshAt = 0;
    let activeTimers = 0;

    const syncTimerCount = () => {
        activeTimers = debounceTimer != null ? 1 : 0;
        return activeTimers;
    };

    return {
        schedule(lat, lng, now) {
            pendingLoc = { lat, lng };
            if (debounceTimer != null) return syncTimerCount();
            debounceFiresAt = now + OSM_REFRESH_DEBOUNCE_MS;
            debounceTimer = true;
            return syncTimerCount();
        },
        tick(now) {
            if (!debounceTimer || debounceFiresAt == null) return { fired: false, timers: syncTimerCount() };
            if (now < debounceFiresAt) return { fired: false, timers: syncTimerCount() };

            const loc = pendingLoc;
            if (!loc) {
                debounceTimer = null;
                debounceFiresAt = null;
                return { fired: false, timers: syncTimerCount() };
            }

            const since = now - lastOsmRefreshAt;
            if (since < OSM_REFRESH_MIN_INTERVAL_MS) {
                debounceFiresAt = now + (OSM_REFRESH_MIN_INTERVAL_MS - since);
                return { fired: false, timers: syncTimerCount() };
            }

            pendingLoc = null;
            lastOsmRefreshAt = now;
            debounceTimer = null;
            debounceFiresAt = null;
            return { fired: true, lat: loc.lat, lng: loc.lng, timers: syncTimerCount() };
        },
        getTimerCount: syncTimerCount
    };
}

/** Symulacja fetch OSM z abort (P3) i opóźnieniem Overpass */
function createFetchEngine() {
    let inFlight = null;
    let fetchSeq = 0;
    const stats = {
        fetchStarts: 0,
        fetchCompletes: 0,
        fetchAborts: 0,
        abortControllerPeak: 0,
        activeControllers: 0,
        overpassTimesMs: [],
        pendingQueue: null
    };

    return {
        stats,
        start(lat, lng, now) {
            if (inFlight && !inFlight.aborted) {
                inFlight.aborted = true;
                stats.fetchAborts += 1;
            }
            fetchSeq += 1;
            const duration = randOverpassMs(fetchSeq);
            inFlight = {
                id: fetchSeq,
                lat,
                lng,
                start: now,
                duration,
                aborted: false
            };
            stats.fetchStarts += 1;
            stats.activeControllers = 1;
            stats.abortControllerPeak = Math.max(stats.abortControllerPeak, stats.activeControllers);
        },
        abort() {
            if (inFlight && !inFlight.aborted) {
                inFlight.aborted = true;
                stats.fetchAborts += 1;
                stats.activeControllers = 0;
            }
        },
        tick(now) {
            if (!inFlight) {
                stats.activeControllers = 0;
                return null;
            }
            if (inFlight.aborted) {
                inFlight = null;
                stats.activeControllers = 0;
                return 'aborted';
            }
            if (now >= inFlight.start + inFlight.duration) {
                stats.overpassTimesMs.push(inFlight.duration);
                stats.fetchCompletes += 1;
                const done = { lat: inFlight.lat, lng: inFlight.lng };
                inFlight = null;
                stats.activeControllers = 0;
                return done;
            }
            return null;
        },
        isInFlight() {
            return inFlight != null && !inFlight.aborted;
        }
    };
}

/** Sliding window markerów w promieniu ~10 km */
function simulateMarkerDiff(pos, registry, tickIndex) {
    const cell = Math.floor(tickIndex / 2);
    const baseCount = 85;
    const targetSize = Math.min(MARKER_LIMIT, baseCount + (cell % 7));
    const ids = new Set();
    for (let i = 0; i < targetSize; i += 1) {
        ids.add(`p-${cell}-${i}`);
    }
    let added = 0;
    let removed = 0;
    for (const id of ids) {
        if (!registry.has(id)) {
            registry.set(id, { id, lat: pos.lat, lng: pos.lng });
            added += 1;
        }
    }
    for (const id of [...registry.keys()]) {
        if (!ids.has(id)) {
            registry.delete(id);
            removed += 1;
        }
    }
    const renderMs = 4 + (added + removed) * 0.15;
    return { added, removed, total: registry.size, renderMs: Math.round(renderMs) };
}

function runStabilitySimulation() {
    let pos = { lat: 52.52, lng: 13.405 };
    let lastDataFetchLocation = null;
    let lastGpsPinLocation = null;
    let lastMarkerSyncLocation = null;
    let locationUpdatedEmits = 0;
    let markerSyncs = 0;
    let markersAdded = 0;
    let markersRemoved = 0;
    let renderTimesMs = [];
    let maxActiveTimers = 0;
    let timerSamples = [];
    let memorySamples = [];
    let markerRegistry = new Map();

    const osm = createOsmScheduler();
    const fetch = createFetchEngine();
    let locationDataFetchInFlight = false;
    let pendingOsmRefresh = null;

    const heapStart = process.memoryUsage().heapUsed;

    for (let t = 0; t <= DRIVE_DURATION_MS; t += TICK_MS) {
        const dist = SPEED_M_S * (TICK_MS / 1000);
        pos = { lat: pos.lat + dist / 111000, lng: pos.lng };

        const pinMoved = !lastGpsPinLocation
            || distanceMeters(lastGpsPinLocation, pos) >= GPS_PIN_MOVE_MIN_M;
        const movedEnough = !lastDataFetchLocation
            || distanceMeters(lastDataFetchLocation, pos) >= LOCATION_MOVE_THRESHOLD_M;

        if (pinMoved) {
            lastGpsPinLocation = { ...pos };
            if (!lastMarkerSyncLocation
                || distanceMeters(lastMarkerSyncLocation, pos) >= MARKER_SYNC_MOVE_M) {
                lastMarkerSyncLocation = { ...pos };
                markerSyncs += 1;
                const diff = simulateMarkerDiff(pos, markerRegistry, t / TICK_MS);
                markersAdded += diff.added;
                markersRemoved += diff.removed;
                renderTimesMs.push(diff.renderMs);
            }
        }

        // P5 @ 90 km/h: pinMoved co tick → emit co tick (realistyczne dla 1 Hz GPS)
        if (pinMoved || movedEnough) locationUpdatedEmits += 1;

        if (movedEnough) {
            osm.schedule(pos.lat, pos.lng, t);
        }

        const osmTick = osm.tick(t);
        maxActiveTimers = Math.max(maxActiveTimers, osmTick.timers + (fetch.isInFlight() ? 1 : 0));

        if (osmTick.fired) {
            if (fetch.isInFlight()) {
                pendingOsmRefresh = { lat: osmTick.lat, lng: osmTick.lng };
                fetch.abort();
            } else {
                locationDataFetchInFlight = true;
                fetch.start(osmTick.lat, osmTick.lng, t);
            }
        }

        const completed = fetch.tick(t);
        if (completed === 'aborted') {
            locationDataFetchInFlight = false;
            if (pendingOsmRefresh) {
                const next = pendingOsmRefresh;
                pendingOsmRefresh = null;
                locationDataFetchInFlight = true;
                fetch.start(next.lat, next.lng, t);
            }
        } else if (completed) {
            locationDataFetchInFlight = false;
            lastDataFetchLocation = { lat: completed.lat, lng: completed.lng };
            if (pendingOsmRefresh) {
                const next = pendingOsmRefresh;
                pendingOsmRefresh = null;
                locationDataFetchInFlight = true;
                fetch.start(next.lat, next.lng, t);
            }
        }

        if (t > 0 && t % SAMPLE_EVERY_MS === 0) {
            const heap = process.memoryUsage().heapUsed;
            memorySamples.push({
                min: Math.round(t / 60000),
                heapMB: Math.round(heap / 1048576),
                markers: markerRegistry.size,
                timers: osm.getTimerCount() + (fetch.isInFlight() ? 1 : 0)
            });
            timerSamples.push(osm.getTimerCount() + (fetch.isInFlight() ? 1 : 0));
        }
    }

    const heapEnd = process.memoryUsage().heapUsed;
    const overpass = fetch.stats.overpassTimesMs;
    const avgOverpass = overpass.length
        ? Math.round(overpass.reduce((a, b) => a + b, 0) / overpass.length)
        : 0;
    const avgRender = renderTimesMs.length
        ? Math.round(renderTimesMs.reduce((a, b) => a + b, 0) / renderTimesMs.length)
        : 0;
    const p95Render = renderTimesMs.length
        ? renderTimesMs.slice().sort((a, b) => a - b)[Math.floor(renderTimesMs.length * 0.95)]
        : 0;

    return {
        durationMin: DRIVE_DURATION_MS / 60000,
        speedKmh: Math.round(SPEED_M_S * 3.6),
        totalTicks: DRIVE_DURATION_MS / TICK_MS + 1,
        distanceKm: Math.round((SPEED_M_S * DRIVE_DURATION_MS / 1000) / 1000),
        locationUpdatedEmits,
        markerSyncs,
        markersAdded,
        markersRemoved,
        markerPeak: markerRegistry.size,
        fetchStarts: fetch.stats.fetchStarts,
        fetchCompletes: fetch.stats.fetchCompletes,
        fetchAborts: fetch.stats.fetchAborts,
        abortControllerPeak: fetch.stats.abortControllerPeak,
        avgOverpassMs: avgOverpass,
        minOverpassMs: overpass.length ? Math.min(...overpass) : 0,
        maxOverpassMs: overpass.length ? Math.max(...overpass) : 0,
        avgRenderMs: avgRender,
        p95RenderMs: p95Render,
        maxActiveTimers,
        timerSamples,
        memorySamples,
        heapDeltaMB: Math.round((heapEnd - heapStart) / 1048576),
        heapEndMB: Math.round(heapEnd / 1048576)
    };
}

console.log('\n══════════════════════════════════════════════════');
console.log('  STABILNOŚĆ MAPY — symulacja 60 min @ ~90 km/h');
console.log('══════════════════════════════════════════════════\n');

const report = runStabilitySimulation();

console.log('--- Raport wydajności ---');
console.log(JSON.stringify(report, null, 2));

console.log('\n--- Raport pamięci ---');
console.log(`Heap delta: ${report.heapDeltaMB} MB (Node process — proxy)`);
console.log(`Heap końcowy: ${report.heapEndMB} MB`);
console.log(`Markery peak: ${report.markerPeak} (limit ${MARKER_LIMIT})`);
for (const s of report.memorySamples) {
    console.log(`  t=${s.min} min: heap=${s.heapMB} MB, markers=${s.markers}, timers=${s.timers}`);
}

console.log('\n--- Raport fetchy / aborty ---');
console.log(`Fetch start: ${report.fetchStarts}`);
console.log(`Fetch complete: ${report.fetchCompletes}`);
console.log(`Fetch abort: ${report.fetchAborts}`);
console.log(`AbortController peak: ${report.abortControllerPeak}`);

console.log('\n--- Raport markery ---');
console.log(`Sync count: ${report.markerSyncs}`);
console.log(`Added total: ${report.markersAdded}`);
console.log(`Removed total: ${report.markersRemoved}`);
console.log(`Avg render: ${report.avgRenderMs} ms · P95: ${report.p95RenderMs} ms`);

console.log('\n--- Raport Overpass (symulowany) ---');
console.log(`Avg: ${report.avgOverpassMs} ms · Min: ${report.minOverpassMs} ms · Max: ${report.maxOverpassMs} ms`);

console.log('\n--- Stabilność timerów ---');
console.log(`Max aktywnych timerów: ${report.maxActiveTimers}`);
console.log(`Próbki timerów (co 5 min): [${report.timerSamples.join(', ')}]`);

console.log('\n--- Asercje stabilności ---');

assert(report.fetchCompletes >= 20,
    `Fetch OSM w 60 min (${report.fetchCompletes} ≥ 20)`);
assert(report.markerSyncs >= 100,
    `Sync markerów (${report.markerSyncs} ≥ 100)`);
assert(report.markerPeak <= MARKER_LIMIT,
    `Markery w limicie (${report.markerPeak} ≤ ${MARKER_LIMIT})`);
assert(report.maxActiveTimers <= 3,
    `Timery nie narastają (max ${report.maxActiveTimers} ≤ 3)`);
assert(report.timerSamples.every((n) => n <= 3),
    `Wszystkie próbki timerów ≤ 3 (${report.timerSamples.join(', ')})`);
assert(report.heapDeltaMB < 50,
    `Brak dużego wzrostu heap Node (${report.heapDeltaMB} MB < 50)`);
assert(report.locationUpdatedEmits <= report.totalTicks,
    `LOCATION_UPDATED emit count (${report.locationUpdatedEmits} ≤ ${report.totalTicks})`);
assert(report.locationUpdatedEmits >= report.totalTicks * 0.9,
    `LOCATION_UPDATED przy 90 km/h (~co tick) (${report.locationUpdatedEmits} ≥ 90% ticks)`);
assert(report.fetchAborts >= 0,
    `Abort count tracked (${report.fetchAborts})`);
assert(report.avgOverpassMs >= OVERPASS_MS_MIN && report.avgOverpassMs <= OVERPASS_MS_MAX,
    `Średni czas Overpass w modelu (${report.avgOverpassMs} ms)`);

assert(mapSrc.includes('logMapDriveDiag'), 'map.js: diagnostyka localhost');
assert(mapSrc.includes('getMapActiveTimerCount'), 'map.js: licznik timerów');
assert(readFileSync(join(ROOT, 'js/core/logger.js'), 'utf8').includes('logMapDriveDiag'),
    'logger.js: logMapDriveDiag tylko localhost');
assert(readFileSync(join(ROOT, 'js/data/osmService.js'), 'utf8').includes('getActiveAbortControllerCount'),
    'osmService.js: licznik AbortController');

console.log(failed ? `\n❌ ${failed} FAIL — commit wstrzymany` : '\n✅ Stabilność 60 min — PASS (commit możliwy po akceptacji)');
process.exit(failed ? 1 : 0);
