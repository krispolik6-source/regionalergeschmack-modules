/**
 * Smoke: żywa natura – krajobrazy sezonowe + światło dnia + odgłosy
 */
import { readFileSync, existsSync } from 'node:fs';
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

const rootEl = {
    dataset: {},
    querySelector: (sel) => (sel === '.ln-sky' ? {} : null),
    innerHTML: '',
    setAttribute() {}
};
const body = {
    classList: {
        remove() {},
        add() {},
        contains() { return false; }
    },
    dataset: {},
    prepend() {}
};
globalThis.document = {
    body,
    documentElement: { classList: { contains: () => false } },
    getElementById: (id) => (id === 'climateAtmosphere' ? rootEl : null),
    createElement: () => rootEl,
    addEventListener() {},
    removeEventListener() {}
};
globalThis.matchMedia = () => ({ matches: false });
globalThis.window = globalThis;

const {
    getDayPart,
    syncLivingNatureScene,
    MASTER_VOLUME,
    isAmbientNatureEnabled
} = await import(pathToFileURL(join(ROOT, 'js/presentation/climateAtmosphere.js')).href);

assert(MASTER_VOLUME >= 0.1 && MASTER_VOLUME <= 0.12, 'master volume 10–12%');
assert(isAmbientNatureEnabled() === false, 'ambient default OFF');

assert(getDayPart(new Date(2026, 6, 21, 7, 0, 0)) === 'morning', '07:00 morning');
assert(getDayPart(new Date(2026, 6, 21, 13, 0, 0)) === 'noon', '13:00 noon');
assert(getDayPart(new Date(2026, 6, 21, 20, 0, 0)) === 'evening', '20:00 evening');

const spring = syncLivingNatureScene(new Date(2026, 3, 15, 10, 0, 0));
assert(spring.season === 'spring', 'April → spring');
assert(spring.dayPart === 'morning', '10:00 → morning');
assert(rootEl.dataset.season === 'spring', 'root data-season spring');
assert(rootEl.dataset.daypart === 'morning', 'root data-daypart morning');

const winter = syncLivingNatureScene(new Date(2026, 0, 10, 14, 0, 0));
assert(winter.season === 'winter', 'January → winter');
assert(winter.dayPart === 'noon', '14:00 → noon');

const summer = syncLivingNatureScene(new Date(2026, 6, 21, 18, 0, 0));
assert(summer.season === 'summer', 'July → summer');
assert(summer.dayPart === 'evening', '18:00 → evening');

const autumn = syncLivingNatureScene(new Date(2026, 9, 5, 9, 0, 0));
assert(autumn.season === 'autumn', 'October → autumn');

const css = readFileSync(join(ROOT, 'css/living-nature.css'), 'utf8');
assert(css.includes("[data-season='spring']"), 'CSS spring');
assert(css.includes("[data-season='summer']"), 'CSS summer');
assert(css.includes("[data-season='autumn']"), 'CSS autumn');
assert(css.includes("[data-season='winter']"), 'CSS winter');
assert(css.includes("[data-daypart='morning']"), 'CSS morning light');
assert(css.includes('ln-wheat-sway'), 'wheat motion');
assert(css.includes('prefers-reduced-motion'), 'reduced motion');

const stack = readFileSync(join(ROOT, 'css/experience-stack.css'), 'utf8');
assert(stack.includes('living-nature.css'), 'experience-stack imports living-nature');

const src = readFileSync(join(ROOT, 'js/presentation/climateAtmosphere.js'), 'utf8');
assert(src.includes('ln-fields'), 'landscape fields layer');
assert(src.includes('ln-orchard'), 'orchard layer');
assert(src.includes('syncLivingNatureScene'), 'scene sync');

for (const base of ['spring-birds', 'summer-birds', 'autumn-birds', 'winter-birds']) {
    assert(existsSync(join(ROOT, 'assets/audio/nature', `${base}.mp3`)), `audio ${base}.mp3`);
}

if (failed) {
    console.error(`\n${failed} failure(s)`);
    process.exit(1);
}
console.log('\nLiving nature checks passed.');
