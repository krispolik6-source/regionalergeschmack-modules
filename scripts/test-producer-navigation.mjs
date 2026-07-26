/**
 * Audyt nawigacji producentów – klik → modal, nie ogólna lista kategorii
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

const mapJs = readFileSync(join(ROOT, 'js/views/map.js'), 'utf8');
const homeJs = readFileSync(join(ROOT, 'js/views/home.js'), 'utf8');
const appJs = readFileSync(join(ROOT, 'js/app.js'), 'utf8');
const styleCss = readFileSync(join(ROOT, 'css/style.css'), 'utf8');
const lreCss = readFileSync(join(ROOT, 'css/living-region-experience.css'), 'utf8');
const modalJs = readFileSync(join(ROOT, 'js/views/producerModal.js'), 'utf8');

assert(
    mapJs.includes('openProducerModal(producerId, producer || null)'),
    'map list: klik otwiera openProducerModal'
);
assert(
    mapJs.includes('focusProducerMarker(leafletMap, producerId)'),
    'map list: nadal centruje marker'
);
assert(
    homeJs.includes('firstRef?.producerId'),
    'living region seasonal: producerId z productRefs'
);
assert(
    homeJs.includes('coverPhoto'),
    'venue card: wspólne coverPhoto (logo/zdjęcie)'
);
assert(
    appJs.includes('openProducerDeepLinkIfPresent'),
    'app: deep link ?producer='
);
assert(
    styleCss.includes('--home-venue-media-height, 120px'),
    'CSS: ujednolicona wysokość kart venue'
);
assert(
    styleCss.includes('-webkit-line-clamp: 2') && styleCss.includes('.producer-product-desc'),
    'CSS: line-clamp opisu produktu'
);
assert(
    lreCss.includes('.producer-modal .producer-header-card'),
    'CSS: header-card tylko w modalu'
);
assert(
    modalJs.includes('description ? `<p class="producer-product-desc"'),
    'modal: pusty opis bez pustego paragrafu'
);

if (failed) {
    console.error(`\n${failed} test(ów) nie przeszło`);
    process.exit(1);
}
console.log('\n✅ test-producer-navigation OK');
