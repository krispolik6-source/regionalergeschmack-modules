// scripts/test-tastes-of-day.mjs – ETAP 15B
import assert from 'assert';
import {
    TASTES_OF_DAY_CATALOG,
    getTastesOfDay
} from '../js/presentation/tastesOfDay.js';
import { TRANSLATIONS } from '../js/translations.js';

const mem = new Map();
globalThis.localStorage = {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => { mem.set(k, String(v)); },
    removeItem: (k) => { mem.delete(k); }
};

assert.ok(TASTES_OF_DAY_CATALOG.length >= 10);

for (const lang of ['de', 'en', 'pl', 'mk']) {
    assert.ok(TRANSLATIONS[lang]?.home?.tastesOfDayTitle, lang);
    for (const item of TASTES_OF_DAY_CATALOG) {
        const text = TRANSLATIONS[lang]?.tastesOfDay?.[item.id];
        assert.ok(text && String(text).trim().length > 10, `${lang}.${item.id}`);
    }
}

assert.ok(TRANSLATIONS.pl.tastesOfDay.honeyFairWeather.includes('miodu'));
assert.ok(TRANSLATIONS.pl.tastesOfDay.strawberriesIdeal.includes('truskawki'));
assert.ok(TRANSLATIONS.pl.tastesOfDay.cheeseEvening.includes('sery'));

// Lipiec, pogodny dzień (proxy: warm/hot) → miód / truskawki możliwe
mem.clear();
const july = new Date('2026-07-20T11:00:00');
const a = getTastesOfDay({ now: july, limit: 3 });
const b = getTastesOfDay({ now: july, limit: 3 });
assert.deepStrictEqual(
    a.items.map((x) => x.narrativeId),
    b.items.map((x) => x.narrativeId),
    'ten sam slot = te same smaki'
);
assert.ok(a.items.length >= 2 && a.items.length <= 3);
assert.ok(a.items.every((x) => x.product?.id && x.producerId));

const ids = a.items.map((x) => x.narrativeId);
assert.ok(
    ids.some((id) => /honey|strawberr|yogurt|juice|vegetabl|sausage|cheese|apple/i.test(id)),
    `oczekiwano produktowego smaku, dostano: ${ids.join(',')}`
);

// Wieczór → sery bardziej prawdopodobne
mem.clear();
const eve = getTastesOfDay({ now: new Date('2026-07-20T19:30:00'), limit: 3 });
assert.ok(eve.items.length >= 2);

console.log(`✅ katalog: ${TASTES_OF_DAY_CATALOG.length}`);
console.log(`✅ lipiec południe: ${ids.join(', ')}`);
console.log(`✅ lipiec wieczór: ${eve.items.map((x) => x.narrativeId).join(', ')}`);
console.log('\n--- Tastes of Day test ---\nOK');
