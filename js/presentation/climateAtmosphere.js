// js/presentation/climateAtmosphere.js – żywa natura: ambient + krajobraz sezonowy + światło dnia
import { getSettings, saveSettings } from '../core/settings.js';
import { getCurrentSeason } from '../data/seasonCalendar.js';
import { initSeasonTheme } from './seasonTheme.js';
import { showToast } from '../core/toast.js';
import { t } from '../core/i18n.js';
import { eventBus } from '../core/eventBus.js';
import { EVENTS } from '../core/events.js';

const AMBIENT_KEY = 'ambientNature';
/** Master 11% – subtelne tło relaksacyjne (zakres 10–12%) */
export const MASTER_VOLUME = 0.11;
/** Toast przy braku sieci – 2–3 s */
const AMBIENT_OFFLINE_TOAST_MS = 2500;

/**
 * Naturalny śpiew ptaków leśnych w słoneczny dzień.
 * Primary: Freesound CDN · fallback: lokalny plik na serwerze.
 * Sterowanie: 🎵 / 🔇 na Home + Profil.
 */
const FOREST_BIRDS_URL = 'https://cdn.freesound.org/previews/623/623806_13197878-lq.mp3';
const FOREST_BIRDS_LOCAL = '/assets/audio/nature/birds_natural_forest.mp3';
const AMBIENT_SOURCE_CHAIN = Object.freeze([FOREST_BIRDS_URL, FOREST_BIRDS_LOCAL]);

const LAYERS = Object.freeze([
    { id: 'forestBirds', url: FOREST_BIRDS_URL, gain: 1 }
]);

let atmosphereReady = false;
let boundVisibility = false;
let daypartTimer = null;
/** @type {Map<string, HTMLAudioElement>} */
const players = new Map();
let fadeTimer = null;
/** Jednorazowy toast przy pierwszej nieudanej próbie włączenia (sesja) */
let offlineToastShown = false;

const LANDSCAPE_HTML = `
  <div class="ln-sky" aria-hidden="true"></div>
  <div class="ln-clouds" aria-hidden="true"></div>
  <div class="ln-fields" aria-hidden="true"></div>
  <div class="ln-orchard" aria-hidden="true"></div>
  <div class="ln-wheat" aria-hidden="true"></div>
  <div class="ln-leaves" aria-hidden="true"></div>
  <div class="ln-snow" aria-hidden="true"></div>
  <div class="climate-rays" aria-hidden="true"></div>
  <div class="climate-grass" aria-hidden="true"></div>
  <div class="ln-light" aria-hidden="true"></div>
`;

/** @returns {'morning'|'noon'|'evening'} */
export function getDayPart(date = new Date()) {
    const h = date.getHours();
    if (h >= 5 && h < 11) return 'morning';
    if (h >= 11 && h < 17) return 'noon';
    return 'evening';
}

export function syncLivingNatureScene(now = new Date()) {
    const season = initSeasonTheme(now);
    const root = document.getElementById('climateAtmosphere');
    if (!root) return { season, dayPart: getDayPart(now) };
    const dayPart = getDayPart(now);
    root.dataset.season = season;
    root.dataset.daypart = dayPart;
    document.body.dataset.daypart = dayPart;
    return { season, dayPart };
}

function ensureAtmosphereDom() {
    let root = document.getElementById('climateAtmosphere');
    if (!root) {
        root = document.createElement('div');
        root.id = 'climateAtmosphere';
        root.setAttribute('aria-hidden', 'true');
        document.body.prepend(root);
    }
    if (!root.querySelector('.ln-sky')) {
        root.innerHTML = LANDSCAPE_HTML;
    }
    return root;
}

function isLegacy() {
    try {
        return typeof document !== 'undefined'
            && document.documentElement?.classList?.contains('legacy-ios9');
    } catch {
        return false;
    }
}

/** Wieczór lokalny: 19:00–06:00 → żaby */
export function isEveningHours(date = new Date()) {
    const h = date.getHours();
    return h >= 19 || h < 6;
}

/**
 * Ambient wyłączony domyślnie (tylko explicit true).
 */
export function isAmbientNatureEnabled() {
    return getSettings()[AMBIENT_KEY] === true;
}

export function setAmbientNatureEnabled(enabled, options = {}) {
    saveSettings({ [AMBIENT_KEY]: Boolean(enabled) });
    if (typeof document === 'undefined') return Boolean(enabled);
    if (enabled) {
        startAmbientAudio({ userInitiated: Boolean(options.userInitiated) });
    } else {
        stopAmbientAudio();
    }
    return Boolean(enabled);
}

/** Aktywny URL ambientu (diagnostyka / test) */
export function getActiveAmbientSrc() {
    const layer = LAYERS.find((l) => l.url);
    return layer?.url ?? null;
}

/** Ciche wyciszenie przy błędzie sieci / braku pliku – bez rzucania wyjątku */
function silentStopAudio(audio) {
    if (!audio) return;
    try {
        audio.pause();
        audio.volume = 0;
    } catch { /* brak sieci / decode error – ignoruj */ }
}

function notifyAmbientUnavailable(userInitiated) {
    if (!userInitiated) return;
    saveSettings({ [AMBIENT_KEY]: false });
    stopAmbientAudio();
    if (!offlineToastShown) {
        offlineToastShown = true;
        try {
            showToast(t('home.ambientNatureOffline'), 'info', AMBIENT_OFFLINE_TOAST_MS);
        } catch { /* ignore */ }
    }
    try {
        eventBus.emit(EVENTS.AMBIENT_UNAVAILABLE);
    } catch { /* ignore */ }
}

function waitForCanPlay(audio, timeoutMs = 4500) {
    if (audio.readyState >= 2 && !audio.error) return Promise.resolve(true);
    return new Promise((resolve) => {
        let settled = false;
        const done = (ok) => {
            if (settled) return;
            settled = true;
            audio.removeEventListener('canplay', onReady);
            audio.removeEventListener('error', onError);
            resolve(ok);
        };
        const onReady = () => done(true);
        const onError = () => done(false);
        audio.addEventListener('canplay', onReady, { once: true });
        audio.addEventListener('error', onError, { once: true });
        try { audio.load(); } catch { done(false); return; }
        window.setTimeout(() => {
            done(!audio.error && audio.readyState >= 2);
        }, timeoutMs);
    });
}

async function assignSource(audio, src) {
    try {
        audio.loop = true;
        audio.src = src;
        return await waitForCanPlay(audio);
    } catch {
        return false;
    }
}

function createLayerAudio(layer) {
    const audio = new Audio();
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;
    audio.playsInline = true;
    audio.setAttribute('playsinline', '');
    audio.setAttribute('webkit-playsinline', '');
    audio.dataset.layer = layer.id;

    try {
        audio.src = layer.url;
        audio.load();
    } catch { /* playSafe próbuje fallback */ }

    return audio;
}

function ensurePlayers() {
    if (players.size === LAYERS.length) return;
    for (const layer of LAYERS) {
        if (!players.has(layer.id)) {
            players.set(layer.id, createLayerAudio(layer));
        }
    }
}

/** Wymuś odświeżenie src (po naprawie plików / SW) */
function resetPlayers() {
    players.forEach((a) => {
        try {
            a.pause();
            a.removeAttribute('src');
            a.load();
        } catch { /* ignore */ }
    });
    players.clear();
}

function targetVolumeFor(layer, season = getCurrentSeason()) {
    if (layer.eveningOnly && !isEveningHours()) return 0;
    if (Array.isArray(layer.seasons) && layer.seasons.length
        && !layer.seasons.includes(season)) {
        return 0;
    }
    return MASTER_VOLUME * layer.gain;
}

function clearFade() {
    if (fadeTimer != null) {
        clearInterval(fadeTimer);
        fadeTimer = null;
    }
}

function fadeAllTo(targets, ms = 900) {
    clearFade();
    ensurePlayers();
    const start = performance.now();
    const from = new Map();
    players.forEach((a, id) => from.set(id, a.volume));

    fadeTimer = window.setInterval(() => {
        const t = Math.min(1, (performance.now() - start) / ms);
        players.forEach((audio, id) => {
            const goal = targets.get(id) ?? 0;
            const a0 = from.get(id) ?? 0;
            audio.volume = Math.max(0, Math.min(1, a0 + (goal - a0) * t));
        });
        if (t >= 1) clearFade();
    }, 40);
}

async function playSafe(audio, { userInitiated = false } = {}) {
    if (!audio) return false;
    try {
        audio.muted = false;
        let loaded = false;

        if (audio.src && !audio.error && audio.readyState >= 2) {
            loaded = true;
        } else {
            for (const src of AMBIENT_SOURCE_CHAIN) {
                if (await assignSource(audio, src)) {
                    loaded = true;
                    break;
                }
            }
        }

        if (!loaded || audio.error) {
            silentStopAudio(audio);
            notifyAmbientUnavailable(userInitiated);
            return false;
        }

        const p = audio.play();
        if (p && typeof p.then === 'function') await p;
        return true;
    } catch {
        silentStopAudio(audio);
        notifyAmbientUnavailable(userInitiated);
        return false;
    }
}

/** Krajobraz sezonowy + promienie/trawa + opcjonalny ambient */
export function initClimateAtmosphere() {
    if (atmosphereReady || isLegacy()) return;
    atmosphereReady = true;

    ensureAtmosphereDom();
    syncLivingNatureScene();

    if (!daypartTimer && typeof window !== 'undefined') {
        daypartTimer = window.setInterval(() => {
            syncLivingNatureScene();
            if (isAmbientNatureEnabled()) startAmbientAudio();
        }, 15 * 60 * 1000);
    }

    // Audio NIE zależy od prefers-reduced-motion (to dotyczy animacji wizualnych)
    if (isAmbientNatureEnabled()) {
        const unlock = () => {
            startAmbientAudio();
            document.removeEventListener('pointerdown', unlock);
            document.removeEventListener('keydown', unlock);
        };
        document.addEventListener('pointerdown', unlock, { once: true, passive: true });
        document.addEventListener('keydown', unlock, { once: true });
    }

    if (!boundVisibility) {
        boundVisibility = true;
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) pauseAmbientAudio();
            else if (isAmbientNatureEnabled()) resumeAmbientAudio();
        });
    }

    window.__RG_NATURE_AUDIO__ = {
        start: startAmbientAudio,
        stop: stopAmbientAudio,
        enabled: isAmbientNatureEnabled,
        masterVolume: MASTER_VOLUME,
        evening: isEveningHours,
        sync: syncLivingNatureScene,
        dayPart: getDayPart,
        season: () => getCurrentSeason(),
        activeSrc: getActiveAmbientSrc,
        reset: () => { resetPlayers(); if (isAmbientNatureEnabled()) startAmbientAudio(); }
    };
}

export function startAmbientAudio(options = {}) {
    // reduced-motion nie wycisza ambientu – tylko legacy iOS9
    if (isLegacy()) return;
    if (!isAmbientNatureEnabled()) return;

    const userInitiated = Boolean(options.userInitiated);

    try {
        ensurePlayers();
        const season = getCurrentSeason();
        const targets = new Map();
        for (const layer of LAYERS) {
            const audio = players.get(layer.id);
            if (!audio) continue;
            const vol = targetVolumeFor(layer, season);
            targets.set(layer.id, vol);
            if (vol > 0) {
                audio.muted = false;
                // od razu słyszalny poziom (fade domyka resztę) – unikamy „ciszy przy volume 0”
                if (audio.volume < 0.02) audio.volume = Math.min(MASTER_VOLUME, 0.06);
                void playSafe(audio, { userInitiated });
            } else {
                try { audio.pause(); } catch { /* ignore */ }
            }
        }
        fadeAllTo(targets, 1200);
    } catch {
        players.forEach((a) => silentStopAudio(a));
        notifyAmbientUnavailable(userInitiated);
    }
}

function pauseAmbientAudio() {
    const targets = new Map();
    players.forEach((_, id) => targets.set(id, 0));
    fadeAllTo(targets, 500);
    window.setTimeout(() => {
        players.forEach((a) => {
            try { a.pause(); } catch { /* ignore */ }
        });
    }, 550);
}

function resumeAmbientAudio() {
    if (!isAmbientNatureEnabled()) return;
    startAmbientAudio();
}

export function stopAmbientAudio() {
    const targets = new Map();
    players.forEach((_, id) => targets.set(id, 0));
    fadeAllTo(targets, 300);
    window.setTimeout(() => {
        players.forEach((a) => {
            try {
                a.pause();
                a.currentTime = 0;
            } catch { /* ignore */ }
        });
    }, 350);
}

export default {
    initClimateAtmosphere,
    isAmbientNatureEnabled,
    setAmbientNatureEnabled,
    startAmbientAudio,
    stopAmbientAudio,
    isEveningHours,
    getDayPart,
    syncLivingNatureScene,
    getActiveAmbientSrc,
    MASTER_VOLUME
};
