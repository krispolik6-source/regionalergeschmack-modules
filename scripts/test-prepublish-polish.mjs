/**
 * Smoke: 5 poprawek przed premierą (CSS · Home · Mapa · Zdjęcia · Logo)
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

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

const style = readFileSync(join(ROOT, 'css/style.css'), 'utf8');
assert(style.includes("experience-stack.css"), 'P1 experience-stack');
assert(style.includes('brand-stack.css'), 'P1 brand-stack');
assert(style.includes('prepublish.css'), 'P1 prepublish');
assert(style.includes('--photo-card-height: 180px'), 'P1/P4 token card 180');
assert(style.includes('--photo-modal-height: 200px'), 'P1/P4 token modal 200');
const imports = (style.match(/@import/g) || []).length;
assert(imports <= 14, `P1 top-level imports <= 14 (got ${imports})`);

const home = readFileSync(join(ROOT, 'js/views/home.js'), 'utf8');
const g = home.indexOf('home-greeting');
const h = home.indexOf('home-hub');
const a = home.indexOf('class="home-actions');
const p = home.indexOf('home-premium-section');
const lrCall = home.indexOf('${buildLivingRegionSectionHtml()}', a);
assert(g > -1 && h > g && a > h, 'P2 fold: greeting → hub → actions');
assert(p > a, 'P2 premium below actions');
assert(lrCall > a, 'P2 living region below actions');
assert(home.includes('logo-master.svg'), 'P5 home logo-master');

const homeV1 = readFileSync(join(ROOT, 'css/home-v1.css'), 'utf8');
assert(homeV1.includes('home-greeting { order: 1'), 'P2 CSS order greeting (home-v1)');
assert(homeV1.includes('home-actions { order: 3'), 'P2 CSS order actions (home-v1)');

const prep = readFileSync(join(ROOT, 'css/prepublish.css'), 'utf8');
assert(prep.includes('map-viewport-height'), 'P3 map viewport height');
assert(!/home-living-region[\s\S]{0,120}display:\s*none/.test(prep), 'P2 living region not force-hidden');
assert(prep.includes('--photo-card-height') || prep.includes('180px'), 'P4 card height in prepublish');
assert(prep.includes('--photo-modal-height') || prep.includes('200px'), 'P4 modal height in prepublish');
assert(prep.includes('margin-top: 0') || prep.includes('margin-top:0'), 'P4 header card no overlap');

const idx = readFileSync(join(ROOT, 'index.html'), 'utf8');
assert(idx.includes('logo-master.svg'), 'P5 index SVG logo');
assert(idx.includes('favicon.ico'), 'P5 favicon');
assert(idx.includes('apple-touch-icon'), 'P5 apple-touch');
assert(/style\.css\?v=\d+/.test(idx), 'P1 cache bust style');

const land = readFileSync(join(ROOT, 'landing.html'), 'utf8');
assert(land.includes('logo-master.svg'), 'P5 landing logo-master');

const brand = readFileSync(join(ROOT, 'css/brand-identity-final.css'), 'utf8');
assert(brand.includes('logo-master.svg'), 'P5 brand CSS logo-master');

assert(existsSync(join(ROOT, 'assets/icons/logo-master.svg')), 'P5 master file exists');

if (failed) {
    console.error(`\n${failed} failed`);
    process.exit(1);
}
console.log('\nPrepublish polish smoke OK');
