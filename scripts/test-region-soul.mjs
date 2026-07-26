// scripts/test-region-soul.mjs – ETAP 16
import assert from 'assert';
import { REGION_SOUL_CATALOG, getRegionSoulNarration } from '../js/presentation/regionSoul.js';
import { TRANSLATIONS } from '../js/translations.js';

const mem = new Map();
globalThis.localStorage = {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => { mem.set(k, String(v)); },
    removeItem: (k) => { mem.delete(k); }
};

assert.ok(REGION_SOUL_CATALOG.length >= 12);

for (const lang of ['de', 'en', 'pl', 'mk']) {
    assert.ok(TRANSLATIONS[lang]?.home?.regionSoulLabel, lang);
    for (const line of REGION_SOUL_CATALOG) {
        const text = TRANSLATIONS[lang]?.regionSoul?.[line.id];
        assert.ok(text && String(text).trim().length > 24, `${lang}.${line.id}`);
        assert.ok(!/chatbot|lorem|ipsum|AI\b/i.test(text), `${lang}.${line.id}`);
    }
}

// PL – przykłady z briefu
assert.ok(TRANSLATIONS.pl.regionSoul.morningFreshBread.includes('chlebem'));
assert.ok(TRANSLATIONS.pl.regionSoul.orchardFirstApples.includes('jabłka'));
assert.ok(TRANSLATIONS.pl.regionSoul.beesFairWeather.includes('pszczołom'));
assert.ok(TRANSLATIONS.pl.regionSoul.eveningCheeseHoney.includes('serami'));

mem.clear();
const morning = getRegionSoulNarration(new Date('2026-07-20T08:15:00'));
assert.ok(morning?.text);
assert.ok(morning.icon);
const morning2 = getRegionSoulNarration(new Date('2026-07-20T08:15:00'));
assert.strictEqual(morning2.id, morning.id, 'ten sam slot = ta sama dusza');

mem.clear();
const evening = getRegionSoulNarration(new Date('2026-07-20T19:30:00'));
assert.ok(evening?.id);
// Różna pora zwykle → inna narracja (nie gwarantowane przy hostDefault)
console.log(`✅ rano: ${morning.id} ${morning.icon}`);
console.log(`✅ wieczór: ${evening.id} ${evening.icon}`);
console.log(`✅ katalog: ${REGION_SOUL_CATALOG.length}`);
console.log('\n--- Region Soul test ---\nOK');
