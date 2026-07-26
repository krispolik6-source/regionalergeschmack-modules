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
const fieldMp3 = join(dir, 'field-sounds.mp3');
const fieldWav = join(dir, 'field-sounds.wav');
assert(existsSync(fieldMp3) || existsSync(fieldWav), 'file field-sounds.mp3|wav');
assert(existsSync(fieldMp3), 'field-sounds.mp3 preferred');
assert(statSync(fieldMp3).size > 1000, 'field-sounds.mp3 not empty');

for (const base of ['spring-birds', 'summer-birds', 'autumn-birds', 'winter-birds']) {
    const mp3 = join(dir, `${base}.mp3`);
    const wav = join(dir, `${base}.wav`);
    assert(existsSync(mp3) || existsSync(wav), `file ${base}.mp3|wav`);
    assert(existsSync(mp3), `${base}.mp3 preferred`);
    assert(statSync(mp3).size > 10000, `${base}.mp3 not empty`);
}
assert(existsSync(join(dir, 'CREDITS-BIRDS.txt')), 'CREDITS-BIRDS.txt');

for (const base of ['birds', 'wind', 'frogs', 'insects']) {
    const mp3 = join(dir, `${base}.mp3`);
    const wav = join(dir, `${base}.wav`);
    assert(existsSync(mp3) || existsSync(wav), `file ${base}.mp3|wav`);
    if (existsSync(mp3)) assert(statSync(mp3).size > 1000, `${base}.mp3 not empty`);
    if (existsSync(wav)) assert(statSync(wav).size > 1000, `${base}.wav not empty`);
}
assert(existsSync(join(dir, 'CREDITS.txt')), 'CREDITS.txt');

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

const src = readFileSync(join(ROOT, 'js/presentation/climateAtmosphere.js'), 'utf8');
assert(src.includes('assets/audio/nature'), 'loads from assets/audio/nature');
assert(src.includes('spring-birds'), 'spring-birds layer');
assert(src.includes('summer-birds'), 'summer-birds layer');
assert(src.includes('autumn-birds'), 'autumn-birds layer');
assert(src.includes('winter-birds'), 'winter-birds layer');
assert(src.includes('seasons'), 'season gate');
assert(src.includes("loop = true") || src.includes('audio.loop'), 'looped playback');
assert(!/prefersReducedMotion\(\)\s*\|\|/.test(src) && !src.includes('if (prefersReducedMotion()'), 'audio not gated by reduced-motion');
assert(src.includes('getActiveAmbientSrc'), 'active src helper');
assert(src.includes("'/assets/audio/nature'") || src.includes('"/assets/audio/nature"'), 'absolute audio path');

const { getActiveAmbientSrc } = await import(pathToFileURL(join(ROOT, 'js/presentation/climateAtmosphere.js')).href);
const summerSrc = getActiveAmbientSrc(new Date(2026, 6, 21, 12, 0, 0));
assert(String(summerSrc).includes('summer-birds.mp3'), `July → summer-birds (${summerSrc})`);

const profile = readFileSync(join(ROOT, 'js/views/profile.js'), 'utf8');
assert(profile.includes('profileAmbientNature'), 'settings toggle');

const home = readFileSync(join(ROOT, 'js/views/home.js'), 'utf8');
assert(home.includes('homeAmbientNatureBtn'), 'home ambient toggle');
assert(home.includes('setAmbientNatureEnabled'), 'home uses ambient API');
assert(home.includes('🎵') && home.includes('🔇'), 'home icons off/on');

const i18n = readFileSync(join(ROOT, 'js/translations-climate-ambient.js'), 'utf8');
assert(i18n.includes('Odgłosy natury'), 'PL label');
assert(i18n.includes('10–12') || i18n.includes('10-12'), 'hint mentions 10–12%');
assert(i18n.includes('ambientNaturePlay'), 'home play aria');
assert(i18n.includes('ambientNatureMute'), 'home mute aria');

if (failed) {
    console.error(`\n${failed} failure(s)`);
    process.exit(1);
}
console.log('\nNature sounds checks passed.');
