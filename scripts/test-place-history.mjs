// scripts/test-place-history.mjs – ETAP 15D
import assert from 'assert';
import { PLACE_HISTORY_CATALOG, getPlaceHistoryFact } from '../js/data/placeHistory.js';
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

// OSM-like producers → ciekawostki kategorii (bez curated content)
const osmBakeryNamed = {
    id: 'osm-bakery-schmidt-like',
    category: 'bakery',
    name: 'Dorfbäckerei Schmidt',
    products: [{ name: 'Brot', imageSlug: 'bread' }]
};
const osmHoney = {
    id: 'osm-farm-honey',
    category: 'farmer',
    name: 'Imkerei Lindens',
    products: [{ name: 'Honig', description: 'Lindenhonig' }]
};
const osmFarm = {
    id: 'osm-farm-veg',
    category: 'farmer',
    name: 'Hof Gemüse',
    products: [{ name: 'Kartoffeln', description: 'Saisonales Gemüse' }]
};

const bakeryFact = getPlaceHistoryFact(osmBakeryNamed);
const honeyFact = getPlaceHistoryFact(osmHoney);
const farmFact = getPlaceHistoryFact(osmFarm);

assert.ok(bakeryFact?.id);
assert.ok(honeyFact?.id);
assert.ok(farmFact?.id);

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
console.log(`✅ OSM: bakery→${bakeryFact.id}, honey→${honeyFact.id}, farm→${farmFact.id}`);
console.log(`✅ OSM bakery: ${fact.id}`);
console.log('\n--- Place History test ---\nOK');
