// js/presentation/climateAtmosphere.js – żywa natura: ambient + krajobraz sezonowy + światło dnia
import { getSettings, saveSettings } from '../core/settings.js';
import { getCurrentSeason } from '../data/seasonCalendar.js';
import { initSeasonTheme } from './seasonTheme.js';

const AMBIENT_KEY = 'ambientNature';
/** Master 11% – subtelne tło relaksacyjne (zakres 10–12%) */
export const MASTER_VOLUME = 0.11;
const AUDIO_BASE = '/assets/audio/nature';
/** Cache-bust ścieżek audio (SW / przeglądarka) */
const AUDIO_CACHE_VER = '3';

/**
 * Tło: autentyczne sezonowe nagrania ptaków z łąki (wg miesiąca).
 * Sterowanie: 🎵 / 🔇 na Home + Profil.
 */
const LAYERS = Object.freeze([
    { id: 'springBirds', file: 'spring-birds', gain: 1, seasons: Object.freeze(['spring']) },
    { id: 'summerBirds', file: 'summer-birds', gain: 1, seasons: Object.freeze(['summer']) },
    { id: 'autumnBirds', file: 'autumn-birds', gain: 1, seasons: Object.freeze(['autumn']) },
    { id: 'winterBirds', file: 'winter-birds', gain: 1, seasons: Object.freeze(['winter']) }
]);

/** Preferencja: mp3 → wav → webm */
const EXT_CANDIDATES = Object.freeze(['mp3', 'wav', 'webm']);

let atmosphereReady = false;
let boundVisibility = false;
let daypartTimer = null;
/** @type {Map<string, HTMLAudioElement>} */
const players = new Map();
let fadeTimer = null;

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

export function setAmbientNatureEnabled(enabled) {
    saveSettings({ [AMBIENT_KEY]: Boolean(enabled) });
    if (typeof document === 'undefined') return Boolean(enabled);
    if (enabled) startAmbientAudio();
    else stopAmbientAudio();
    return Boolean(enabled);
}

function layerSrc(fileBase) {
    return EXT_CANDIDATES.map(
        (ext) => `${AUDIO_BASE}/${fileBase}.${ext}?v=${AUDIO_CACHE_VER}`
    );
}

/** Aktywny plik sezonu (diagnostyka / test) */
export function getActiveAmbientSrc(now = new Date()) {
    const season = getCurrentSeason(now);
    const layer = LAYERS.find((l) => !l.seasons || l.seasons.includes(season));
    if (!layer) return null;
    return layerSrc(layer.file)[0];
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

    const sources = layerSrc(layer.file);
    let i = 0;
    const assign = () => {
        if (i >= sources.length) return;
        audio.src = sources[i];
        i += 1;
        try { audio.load(); } catch { /* ignore */ }
    };
    audio.addEventListener('error', () => assign());
    assign();
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

async function playSafe(audio) {
    if (!audio) return;
    try {
        audio.muted = false;
        if (!audio.src) return;
        if (audio.readyState < 2) {
            await new Promise((resolve) => {
                let done = false;
                const finish = () => {
                    if (done) return;
                    done = true;
                    audio.removeEventListener('canplay', finish);
                    audio.removeEventListener('error', finish);
                    resolve();
                };
                audio.addEventListener('canplay', finish, { once: true });
                audio.addEventListener('error', finish, { once: true });
                try { audio.load(); } catch { /* ignore */ }
                setTimeout(finish, 2000);
            });
        }
        const p = audio.play();
        if (p && typeof p.then === 'function') await p;
    } catch {
        /* autoplay zablokowany – kolejny gest użytkownika (🎵) odblokuje */
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

export function startAmbientAudio() {
    // reduced-motion nie wycisza ambientu – tylko legacy iOS9
    if (isLegacy()) return;
    if (!isAmbientNatureEnabled()) return;

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
            void playSafe(audio);
        } else {
            try { audio.pause(); } catch { /* ignore */ }
        }
    }
    fadeAllTo(targets, 1200);
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
