/**
 * ETAP 42 — Map Guardian (najważniejszy strażnik mapy)
 *
 * Sprawdza: Leaflet · tiles · markery · cluster · GPS · promień · filtr · popup · routing.
 * Gdy mapa się zawiesi → restart TYLKO mapy (restartMapOnly), bez reload całej aplikacji.
 *
 * Lokalne raporty. Bez sieci. Bez zmiany Store / API / routingu core.
 */

import { getCurrentView } from '../controllers/navigation.js';
import { buildMultiStopMapsUrl } from '../data/shoppingRoutes.js';

const STORE_KEY = 'rg_map_guardian_v1';
const MAX_LOG = 50;
const INTERVAL_MS = 5000;
const RESTART_COOLDOWN_MS = 28000;
const HANG_TICKS = 2;

let bound = false;
let timer = null;
let lastRestartAt = 0;
let failStreak = 0;
/** @type {string[]} */
let lastFailKeys = [];

function nowIso() {
    return new Date().toISOString();
}

function loadStore() {
    try {
        const raw = localStorage.getItem(STORE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        return parsed && typeof parsed === 'object'
            ? parsed
            : { events: [], restarts: 0, scans: 0 };
    } catch {
        return { events: [], restarts: 0, scans: 0 };
    }
}

function saveStore(data) {
    try {
        localStorage.setItem(STORE_KEY, JSON.stringify(data));
    } catch {
        try {
            data.events = (data.events || []).slice(-15);
            localStorage.setItem(STORE_KEY, JSON.stringify(data));
        } catch {
            /* ignore */
        }
    }
}

function pushEvent(store, event) {
    store.events = store.events || [];
    store.events.push({ at: nowIso(), ...event });
    while (store.events.length > MAX_LOG) store.events.shift();
}

function isMapViewActive() {
    try {
        if (getCurrentView() === 'map') return true;
    } catch {
        /* ignore */
    }
    const panel = document.querySelector?.('[data-view-panel="map"]');
    return Boolean(panel && !panel.hidden);
}

/**
 * Routing = generator URL Google Maps (shopping routes) działa lokalnie.
 * Nie otwiera okna — tylko buduje URL.
 */
function checkRouting() {
    try {
        if (typeof buildMultiStopMapsUrl !== 'function') {
            return { ok: false, detail: 'missing-builder' };
        }
        // Pusta / nieznane ID → '' bez throw; prawdziwe coords → https URL
        const empty = buildMultiStopMapsUrl([]);
        const sample = buildMultiStopMapsUrl(['rg-map-guardian-smoke']);
        const emptyOk = empty === '' || empty == null;
        const sampleOk = sample === '' || sample == null || /^https?:\/\//i.test(String(sample));
        const ok = emptyOk && sampleOk;
        return {
            ok,
            detail: ok ? 'maps-url-builder-ok' : 'bad-url',
            sample: sample ? String(sample).slice(0, 80) : ''
        };
    } catch (err) {
        return { ok: false, detail: err?.message || 'routing-throw' };
    }
}

/**
 * @param {object} snap
 * @returns {{ fails: string[], ok: boolean }}
 */
function evaluateSnapshot(snap, routing) {
    const fails = [];
    if (!snap) {
        fails.push('no-snapshot');
        return { fails, ok: false };
    }
    if (!snap.leafletCdn) fails.push('leaflet-cdn');
    if (!snap.leafletReady) fails.push('leaflet-ready');
    if (snap.instanceOk && !snap.sizeOk) fails.push('map-size');
    if (snap.instanceOk && !snap.tileLoaded) fails.push('tile-loaded');
    if (!snap.markersOk) fails.push('markers');
    if (!snap.clusterOk) fails.push('cluster');
    if (!snap.gpsOk) fails.push('gps');
    if (!snap.radiusOk) fails.push('radius');
    if (!snap.filterOk) fails.push('filter');
    if (!snap.popupOk) fails.push('popup');
    if (!routing?.ok) fails.push('routing');
    return { fails, ok: fails.length === 0 };
}

/**
 * Czy warto restartować mapę (hang / krytyczne awarie Leaflet).
 */
function shouldRestart(fails) {
    const critical = fails.some((f) =>
        f === 'leaflet-ready'
        || f === 'leaflet-cdn'
        || f === 'map-size'
        || f === 'tile-loaded'
        || f === 'markers'
        || f === 'cluster'
        || f === 'popup'
    );
    return critical;
}

/**
 * Pełny przebieg Map Guardian.
 * @param {{ forceRestart?: boolean }} [opts]
 */
export async function runMapGuardian(opts = {}) {
    const store = loadStore();
    store.scans = (store.scans || 0) + 1;

    if (!isMapViewActive() && !opts.forceRestart) {
        failStreak = 0;
        store.lastSummary = {
            at: nowIso(),
            skipped: true,
            reason: 'map-view-hidden'
        };
        saveStore(store);
        return { skipped: true, ok: true, summary: store.lastSummary };
    }

    let mapMod;
    try {
        mapMod = await import('../views/map.js?v=48');
    } catch (err) {
        pushEvent(store, { type: 'import-fail', detail: err?.message || 'error' });
        saveStore(store);
        return { ok: false, error: 'import-fail' };
    }

    const snap = mapMod.getMapHealthSnapshot?.() || null;
    const routing = checkRouting();
    const { fails, ok } = evaluateSnapshot(snap, routing);

    // GPS: na starcie bez permission często fail — nie restartuj samej mapy przez GPS
    const restartFails = fails.filter((f) => f !== 'gps');

    store.lastSummary = {
        at: nowIso(),
        ok,
        fails,
        snap: snap
            ? {
                leafletReady: snap.leafletReady,
                tileLoaded: snap.tileLoaded,
                markerCount: snap.markerCount,
                visibleProducers: snap.visibleProducers,
                clusterOk: snap.clusterOk,
                gpsOk: snap.gpsOk,
                radiusKm: snap.radiusKm,
                filter: snap.filter,
                popupOk: snap.popupOk
            }
            : null,
        routing
    };

    if (ok) {
        failStreak = 0;
        lastFailKeys = [];
        saveStore(store);
        return { ok: true, fails: [], restarted: false, summary: store.lastSummary };
    }

    const key = restartFails.slice().sort().join('|');
    if (key && key === lastFailKeys.join('|')) {
        failStreak += 1;
    } else {
        failStreak = 1;
        lastFailKeys = restartFails.slice();
    }

    pushEvent(store, { type: 'check-fail', fails, streak: failStreak });

    let restarted = false;
    const cooldownOk = Date.now() - lastRestartAt >= RESTART_COOLDOWN_MS;
    const hang = failStreak >= HANG_TICKS || opts.forceRestart;

    if (hang && cooldownOk && shouldRestart(restartFails)) {
        // Najpierw miękki heal (markery / GPS last), potem twardy restart mapy
        try {
            mapMod.healMapRuntimeState?.();
        } catch {
            /* ignore */
        }

        const afterHeal = mapMod.getMapHealthSnapshot?.();
        const again = evaluateSnapshot(afterHeal, routing);
        const stillCritical = shouldRestart(again.fails.filter((f) => f !== 'gps'));

        if (stillCritical || opts.forceRestart) {
            const result = mapMod.restartMapOnly?.(
                `map-guardian:${restartFails.join(',')}`
            ) || { ok: false };
            restarted = Boolean(result.ok);
            if (restarted) {
                lastRestartAt = Date.now();
                failStreak = 0;
                store.restarts = (store.restarts || 0) + 1;
                pushEvent(store, {
                    type: 'map-restart',
                    reason: restartFails.join(','),
                    detail: result.reason
                });
                console.info('[Map Guardian] restart TYLKO mapy —', restartFails.join(', '));
            } else {
                pushEvent(store, { type: 'restart-fail', detail: result.reason });
            }
        }
    }

    saveStore(store);
    return {
        ok: false,
        fails,
        restarted,
        streak: failStreak,
        summary: store.lastSummary
    };
}

export function getMapGuardianLog() {
    return loadStore();
}

export function clearMapGuardianLog() {
    saveStore({ events: [], restarts: 0, scans: 0 });
    failStreak = 0;
    lastFailKeys = [];
    return true;
}

export function initMapGuardian() {
    if (bound || typeof window === 'undefined') {
        return { ok: false, reason: 'already' };
    }
    bound = true;

    const tick = () => {
        if (document.visibilityState === 'hidden') return;
        runMapGuardian().catch(() => { /* ignore */ });
    };

    requestAnimationFrame(() => setTimeout(tick, 1800));
    timer = window.setInterval(tick, INTERVAL_MS);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') tick();
    });

    window.__RG_MAP_GUARDIAN__ = {
        run: runMapGuardian,
        log: getMapGuardianLog,
        clear: clearMapGuardianLog,
        restart: () => runMapGuardian({ forceRestart: true }),
        policy: {
            intervalMs: INTERVAL_MS,
            restartCooldownMs: RESTART_COOLDOWN_MS,
            hangTicks: HANG_TICKS,
            restartMapOnly: true,
            noFullReload: true,
            localOnly: true,
            noNetwork: true,
            architectureUnchanged: true
        }
    };

    console.info(
        '[Map Guardian] ETAP 42 active · co',
        INTERVAL_MS / 1000,
        's · restart tylko mapy · __RG_MAP_GUARDIAN__.run()'
    );
    return { ok: true, intervalMs: INTERVAL_MS };
}

export default {
    initMapGuardian,
    runMapGuardian,
    getMapGuardianLog,
    clearMapGuardianLog
};
