/**
 * Symulacja 30 min jazdy — polityka GPS/OSM/markerów mapy (bez przeglądarki).
 * Run: node scripts/test-map-driving-simulation.mjs
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
const DRIVE_DURATION_MS = 30 * 60 * 1000;
const TICK_MS = 1000;
const SPEED_M_S = 4; // ~14 km/h — realistyczny GPS co 1 s (nie każdy tick = pinMoved)

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

/** Model P1: debounce bez resetu — jak scheduleOsmRefreshAtLocation */
function createOsmScheduler() {
    let debounceTimer = null;
    let pendingLoc = null;
    let lastOsmRefreshAt = 0;
    let fetchCount = 0;
    let debounceResets = 0;

    return {
        schedule(lat, lng, now) {
            pendingLoc = { lat, lng };
            if (debounceTimer != null) {
                debounceResets += 1;
                return;
            }
            const run = () => {
                debounceTimer = null;
                const loc = pendingLoc;
                if (!loc) return;
                const since = now - lastOsmRefreshAt;
                if (since < OSM_REFRESH_MIN_INTERVAL_MS) return;
                pendingLoc = null;
                lastOsmRefreshAt = now;
                fetchCount += 1;
            };
            debounceTimer = { firedAt: now + OSM_REFRESH_DEBOUNCE_MS, run };
        },
        tick(now) {
            if (debounceTimer && now >= debounceTimer.firedAt) {
                debounceTimer.run();
                debounceTimer = null;
            }
        },
        stats: () => ({ fetchCount, debounceResets })
    };
}

/** Model starego buga: clearTimeout + nowy timer przy każdym movedEnough */
function createBrokenOsmScheduler() {
    let debounceTimer = null;
    let fetchCount = 0;

    return {
        schedule(_lat, _lng, now) {
            if (debounceTimer) debounceTimer = null;
            debounceTimer = { firedAt: now + OSM_REFRESH_DEBOUNCE_MS };
        },
        tick(now) {
            if (debounceTimer && now >= debounceTimer.firedAt) {
                fetchCount += 1;
                debounceTimer = null;
            }
        },
        stats: () => ({ fetchCount })
    };
}

function simulateDrive(schedulerFactory) {
    let pos = { lat: 52.52, lng: 13.405 };
    let lastDataFetchLocation = null;
    let lastGpsPinLocation = null;
    let lastMarkerSyncLocation = null;
    let locationUpdatedEmits = 0;
    let markerSyncs = 0;
    let abortCalls = 0;
    let fetchInFlight = false;

    const osm = schedulerFactory();

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
            }
        }

        if (pinMoved || movedEnough) locationUpdatedEmits += 1;

        if (movedEnough) {
            if (fetchInFlight) abortCalls += 1;
            osm.schedule(pos.lat, pos.lng, t);
        }

        osm.tick(t);

        // P4: lastDataFetchLocation dopiero po fetch
        if (osm.stats().fetchCount > (lastDataFetchLocation ? 1 : 0) && movedEnough) {
            if (!fetchInFlight) {
                fetchInFlight = true;
            }
        }
        const currentFetches = osm.stats().fetchCount;
        if (currentFetches > 0 && (!lastDataFetchLocation || movedEnough)) {
            lastDataFetchLocation = { ...pos };
            fetchInFlight = false;
        }
    }

    return {
        locationUpdatedEmits,
        markerSyncs,
        abortCalls,
        ...osm.stats(),
        totalTicks: DRIVE_DURATION_MS / TICK_MS + 1
    };
}

console.log('\n=== Map driving simulation (30 min @ ~90 km/h) ===\n');

const fixed = simulateDrive(createOsmScheduler);
const broken = simulateDrive(createBrokenOsmScheduler);

console.log('Fixed policy:', fixed);
console.log('Broken policy (old debounce reset):', broken);

assert(fixed.fetchCount >= 10, `P1: OSM fetch during drive (${fixed.fetchCount} ≥ 10)`);
assert(broken.fetchCount === 0, `P1 baseline: old reset blocks fetch (${broken.fetchCount} = 0)`);
assert(fixed.debounceResets >= 30, `P1: debounce not reset (${fixed.debounceResets} timer skips while driving)`);
assert(fixed.markerSyncs >= 50, `P2: marker syncs (${fixed.markerSyncs} ≥ 50)`);
assert(fixed.locationUpdatedEmits < fixed.totalTicks,
    `P5: fewer LOCATION_UPDATED than ticks (${fixed.locationUpdatedEmits} < ${fixed.totalTicks})`);
assert(fixed.locationUpdatedEmits > fixed.totalTicks * 0.05,
    `P5: still emits on movement (${fixed.locationUpdatedEmits} > 5% ticks)`);

assert(mapSrc.includes('scheduleOsmRefreshAtLocation'), 'map: scheduleOsmRefreshAtLocation');
assert(mapSrc.includes('pendingOsmRefreshLocation'), 'map: pendingOsmRefreshLocation');
assert(mapSrc.includes('abortPendingDataLoads()'), 'map: abort on new fetch P3');
assert(mapSrc.includes('lastDataFetchLocation = { lat: latitude, lng: longitude }'),
    'map: lastDataFetchLocation after fetch P4');
assert(!/if \(movedEnough\)[\s\S]{0,120}lastDataFetchLocation/.test(mapSrc),
    'map: no lastDataFetchLocation before fetch');
assert(/isFirstFix \|\| pinMoved \|\| movedEnough/.test(mapSrc),
    'map: throttled LOCATION_UPDATED P5');
assert(mapSrc.includes('scheduleRefreshMapMarkers({ fitBounds: false, sync: true })'),
    'map: marker sync on GPS P2');

console.log(failed ? `\n${failed} FAIL` : '\n30 min driving simulation OK');
process.exit(failed ? 1 : 0);
