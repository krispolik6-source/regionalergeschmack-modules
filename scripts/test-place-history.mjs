// scripts/test-place-history.mjs – ETAP 15D
import assert from 'assert';
import { PLACE_HISTORY_CATALOG, getPlaceHistoryFact } from '../js/data/placeHistory.js';
import { getContentProducerById } from '../js/data/contentProducers.js';
import { TRANSLATIONS } from '../js/translations.js';

assert.ok(PLACE_HISTORY_CATALOG.length >= 20);

const ids = PLACE_HISTORY_CATALOG.map((f) => f.id);
for (const lang of ['de', 'en', 'pl', 'mk']) {
    assert.ok(TRANSLATIONS[lang]?.placeHistory?.title, lang);
    for (const id of ids) {
        const text = TRANSLATIONS[lang]?.placeHistory?.[id];
        assert.ok(text && String(text).trim().length > 20, `${lang}.${id}`);
        assert.ok(!/lorem|ipsum|placeholder|TODO/i.test(text), `${lang}.${id} wygląda na wypełniacz`);
    }
}

// Przykłady z briefu (PL)
assert.ok(TRANSLATIONS.pl.placeHistory.bakeryFortyYears.includes('40'));
assert.ok(TRANSLATIONS.pl.placeHistory.apiaryLindens.includes('lipy'));
assert.ok(TRANSLATIONS.pl.placeHistory.farmSeasonalVeg.includes('sezonow'));

const bakery = getContentProducerById('content-baeckerei-schmidt');
const honey = getContentProducerById('content-imkerei-sonne');
const farm = getContentProducerById('content-hof-mueller');

assert.strictEqual(getPlaceHistoryFact(bakery)?.id, 'schmidtGenerations');
assert.strictEqual(getPlaceHistoryFact(honey)?.id, 'imkereiLindens');
assert.strictEqual(getPlaceHistoryFact(farm)?.id, 'hofSeasonalVeg');

// OSM-like bakery → ogólna ciekawostka piekarnicza
const osmBakery = {
    id: 'osm-bakery-99',
    category: 'bakery',
    name: 'Dorfbäckerei',
    products: [{ name: 'Brot', imageSlug: 'bread' }]
};
const fact = getPlaceHistoryFact(osmBakery);
assert.ok(fact?.id);
assert.ok(/bakery|place/i.test(fact.id));

const again = getPlaceHistoryFact(osmBakery);
assert.strictEqual(again.id, fact.id, 'ten sam producent = ta sama ciekawostka');

console.log(`✅ katalog: ${ids.length}`);
console.log(`✅ content: Schmidt→${getPlaceHistoryFact(bakery).id}, Imkerei→${getPlaceHistoryFact(honey).id}, Hof→${getPlaceHistoryFact(farm).id}`);
console.log(`✅ OSM bakery: ${fact.id}`);
console.log('\n--- Place History test ---\nOK');
