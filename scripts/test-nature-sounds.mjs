/**
 * Smoke: odgłosy natury – pliki + domyślnie OFF + głośność 10–15%
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
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

const dir = join(ROOT, 'assets/audio/nature');
const forestMp3 = join(dir, 'birds_natural_forest.mp3');
assert(existsSync(forestMp3), 'birds_natural_forest.mp3');
assert(statSync(forestMp3).size > 10000, 'birds_natural_forest.mp3 not empty');
assert(existsSync(join(dir, 'CREDITS.txt')), 'CREDITS.txt');
assert(existsSync(join(dir, 'birds_natural_forest.README.txt')), 'birds_natural_forest.README.txt');

const store = new Map();
globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k)
};

const {
    isAmbientNatureEnabled,
    setAmbientNatureEnabled,
    isEveningHours,
    MASTER_VOLUME
} = await import(pathToFileURL(join(ROOT, 'js/presentation/climateAtmosphere.js')).href);

assert(MASTER_VOLUME >= 0.1 && MASTER_VOLUME <= 0.12, 'master 10–12%');
assert(isAmbientNatureEnabled() === false, 'default OFF');
// W Node bez DOM – tylko flaga settings (bez startu Audio)
assert(setAmbientNatureEnabled(true) === true, 'can enable');
assert(isAmbientNatureEnabled() === true, 'enabled flag');
assert(setAmbientNatureEnabled(false) === false, 'can disable');
assert(isAmbientNatureEnabled() === false, 'disabled again');

assert(isEveningHours(new Date(2026, 6, 21, 20, 0, 0)) === true, '20:00 evening');
assert(isEveningHours(new Date(2026, 6, 21, 12, 0, 0)) === false, '12:00 not evening');

const FREESOUND_URL = 'https://cdn.freesound.org/previews/623/623806_13197878-lq.mp3';

const src = readFileSync(join(ROOT, 'js/presentation/climateAtmosphere.js'), 'utf8');
assert(src.includes(FREESOUND_URL), 'loads external Freesound URL');
assert(src.includes('birds_natural_forest.mp3'), 'local fallback path');
assert(src.includes('AMBIENT_SOURCE_CHAIN'), 'source fallback chain');
assert(src.includes('notifyAmbientUnavailable'), 'offline toast handler');
assert(src.includes('offlineToastShown'), 'toast once per session');
assert(/naturalny śpiew ptaków leśnych/i.test(src), 'forest birds description');
assert(src.includes('silentStopAudio'), 'silent network error handler');
assert(src.includes('showToast'), 'toast on total failure');
assert(src.includes('AMBIENT_UNAVAILABLE'), 'ambient unavailable event');
assert(src.includes("loop = true") || src.includes('audio.loop'), 'looped playback');
assert(!/prefersReducedMotion\(\)\s*\|\|/.test(src) && !src.includes('if (prefersReducedMotion()'), 'audio not gated by reduced-motion');
assert(src.includes('getActiveAmbientSrc'), 'active src helper');

const { getActiveAmbientSrc } = await import(pathToFileURL(join(ROOT, 'js/presentation/climateAtmosphere.js')).href);
const activeSrc = getActiveAmbientSrc();
assert(activeSrc === FREESOUND_URL, `active → Freesound (${activeSrc})`);

const profile = readFileSync(join(ROOT, 'js/views/profile.js'), 'utf8');
assert(profile.includes('profileAmbientNature'), 'settings toggle');

const home = readFileSync(join(ROOT, 'js/views/home.js'), 'utf8');
assert(home.includes('homeAmbientNatureBtn'), 'home ambient toggle');
assert(home.includes('home-ambient-control'), 'home ambient control wrapper');
assert(home.includes('home-ambient-status'), 'home ambient status label');
assert(home.includes('HOME_AMBIENT_SPEAKER_SVG'), 'home speaker SVG icon');
assert(home.includes('setAmbientNatureEnabled'), 'home uses ambient API');
assert(home.includes('syncHomeAmbientToggle'), 'home ambient UI sync');
assert(home.includes('AMBIENT_UNAVAILABLE'), 'home listens for ambient failure');
assert(home.includes('userInitiated'), 'home passes user gesture flag');
assert(home.includes('ambientNatureStatusOn'), 'home status on i18n key');
assert(home.includes('ambientNatureStatusOff'), 'home status off i18n key');

const i18n = readFileSync(join(ROOT, 'js/translations-climate-ambient.js'), 'utf8');
assert(i18n.includes('Odgłosy natury'), 'PL label');
assert(i18n.includes('10–12') || i18n.includes('10-12'), 'hint mentions 10–12%');
assert(i18n.includes('ambientNatureOffline'), 'offline toast i18n key');
assert(i18n.includes('Brak połączenia z siecią'), 'PL offline toast');
assert(i18n.includes('Keine Netzwerkverbindung'), 'DE offline toast');
assert(i18n.includes('ambientNaturePlay'), 'home play aria');
assert(i18n.includes('ambientNatureMute'), 'home mute aria');
assert(i18n.includes('ambientNatureStatusOn'), 'home status on label');
assert(i18n.includes('ambientNatureStatusOff'), 'home status off label');
assert(i18n.includes('Dźwięk włączony'), 'PL status on text');
assert(i18n.includes('Dźwięk wyłączony'), 'PL status off text');

if (failed) {
    console.error(`\n${failed} failure(s)`);
    process.exit(1);
}
console.log('\nNature sounds checks passed.');
