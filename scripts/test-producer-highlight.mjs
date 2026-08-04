/**
 * Smoke: Premium producenta – „Wyróżnij profil” + Promowane na mapie/listach
 */
import { readFileSync } from 'node:fs';
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

const {
    PROMOTED_PRODUCERS_KEY,
    markProducerPromoted,
    isProducerPromoted,
    getPromotedProducerIds
} = await import(pathToFileURL(join(ROOT, 'js/core/premiumService.js')).href);

assert(PROMOTED_PRODUCERS_KEY === 'rg_promoted_producers', 'promoted storage key');
assert(!isProducerPromoted('user-producer-demo'), 'not promoted by default');
assert(markProducerPromoted('user-producer-demo'), 'markProducerPromoted returns true');
assert(isProducerPromoted('user-producer-demo'), 'isProducerPromoted after mark');
assert(isProducerPromoted({ id: 'user-producer-demo' }), 'isProducerPromoted via object id');
assert(isProducerPromoted({ id: 'x', promoted: true }), 'flag promoted on object');
assert(getPromotedProducerIds().includes('user-producer-demo'), 'ids list includes marked');

const panel = readFileSync(join(ROOT, 'js/views/producerPanel.js'), 'utf8');
assert(panel.includes('producerHighlightBtn'), 'panel has highlight button id');
assert(panel.includes('renderHighlightProfileCta'), 'panel renders highlight CTA');
assert(panel.includes('activateProfileHighlight'), 'CTA activates profile highlight');
assert(panel.includes('highlightProfile'), 'uses highlightProfile i18n');

const mapCore = readFileSync(join(ROOT, 'js/map/map.js'), 'utf8');
assert(mapCore.includes('isProducerPromoted'), 'map markers check promoted');
assert(mapCore.includes('producer-marker-promoted'), 'map has promoted chip');
assert(mapCore.includes('is-promoted'), 'map marker class is-promoted');

const mapView = readFileSync(join(ROOT, 'js/views/map.js'), 'utf8');
assert(mapView.includes('rg-promoted-badge'), 'map list shows promoted badge');
assert(mapView.includes('isProducerPromoted'), 'map list uses isProducerPromoted');

const home = readFileSync(join(ROOT, 'js/views/home.js'), 'utf8');
assert(home.includes('rg-promoted-badge'), 'home cards show promoted badge');

const display = readFileSync(join(ROOT, 'js/presentation/producerDisplay.js'), 'utf8');
assert(display.includes('rg-promoted-badge'), 'producer modal header shows badge');

const premium = readFileSync(join(ROOT, 'js/core/premiumService.js'), 'utf8');
assert(premium.includes('markProducerPromoted(`user-producer-${user.id}`)'), 'PayPal activate marks producer');

const css = readFileSync(join(ROOT, 'css/style.css'), 'utf8');
assert(css.includes('.rg-promoted-badge'), 'CSS for promoted badge');
assert(css.includes('.producer-marker-badge.is-promoted'), 'CSS for promoted marker');

const i18n = readFileSync(join(ROOT, 'js/translations.js'), 'utf8');
assert(i18n.includes("highlightProfile: 'Wyróżnij profil'"), 'PL highlightProfile');
assert(i18n.includes("promoted: 'Promowane'"), 'PL ads.promoted');
assert(i18n.includes('highlightActiveNote:'), 'highlightActiveNote in i18n');
assert(i18n.includes('priceProducerMonth:'), 'priceProducerMonth in i18n');

if (failed) {
    console.error(`\n${failed} failure(s)`);
    process.exit(1);
}
console.log('\nAll producer-highlight checks passed.');
