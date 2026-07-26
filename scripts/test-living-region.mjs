// scripts/test-living-region.mjs – ETAP 15A
import assert from 'assert';
import {
    LIVING_REGION_CATALOG,
    getLivingRegionPulse,
    buildHistoryAffinity
} from '../js/presentation/livingRegion.js';
import { TRANSLATIONS } from '../js/translations.js';

const mem = new Map();
globalThis.localStorage = {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => { mem.set(k, String(v)); },
    removeItem: (k) => { mem.delete(k); }
};

assert.ok(LIVING_REGION_CATALOG.length >= 20);

for (const lang of ['de', 'en', 'pl', 'mk']) {
    assert.ok(TRANSLATIONS[lang]?.home?.livingRegionTitle, lang);
    for (const item of LIVING_REGION_CATALOG) {
        const text = TRANSLATIONS[lang]?.livingRegion?.[item.id];
        assert.ok(text && String(text).trim().length > 12, `${lang}.${item.id}`);
    }
}

// PL – przykłady z briefu
assert.ok(TRANSLATIONS.pl.livingRegion.morningBread.includes('chleb'));
assert.ok(TRANSLATIONS.pl.livingRegion.firstPlums.includes('śliwki'));
assert.ok(TRANSLATIONS.pl.livingRegion.eveningApiary.includes('pasieki'));
assert.ok(TRANSLATIONS.pl.livingRegion.tomorrowMarketVeg.includes('warzywa'));

// Lipiec rano → pieczywo / sezonowe, deterministycznie
const julyMorning = new Date('2026-07-20T08:30:00');
mem.clear();
const a = getLivingRegionPulse(julyMorning);
const b = getLivingRegionPulse(julyMorning);
assert.deepStrictEqual(a.items.map((x) => x.id), b.items.map((x) => x.id), 'ten sam slot = ten sam zestaw');
assert.ok(a.items.length >= 3 && a.items.length <= 4);

const ids = new Set(a.items.map((x) => x.id));
assert.ok(
    ids.has('morningBread') || ids.has('morningRolls') || ids.has('firstPlums') || ids.has('berryRipening'),
    `oczekiwano porannego/sezonowego impulsu, dostano: ${[...ids].join(',')}`
);

// Wieczór lipiec → pasieka możliwa
mem.clear();
const eve = getLivingRegionPulse(new Date('2026-07-20T19:15:00'));
assert.ok(eve.items.length >= 3);
assert.notDeepStrictEqual(
    eve.items.map((x) => x.id),
    a.items.map((x) => x.id),
    'inna pora dnia → inny zestaw (zwykle)'
);

// Historia piekarni podbija affinity
const aff = buildHistoryAffinity({
    viewed: [{ id: '1', name: 'Bäckerei Müller', category: 'bakery' }],
    visited: [{ id: '1', name: 'Bäckerei Müller', category: 'bakery' }],
    searched: [],
    purchased: [],
    products: [],
    routes: [],
    reservations: []
});
assert.ok((aff.get('bakeries') || 0) >= 2);

console.log(`✅ katalog: ${LIVING_REGION_CATALOG.length}`);
console.log(`✅ lipiec rano: ${a.items.map((x) => x.id).join(', ')}`);
console.log(`✅ lipiec wieczór: ${eve.items.map((x) => x.id).join(', ')}`);
console.log('\n--- Living Region AI test ---\nOK');
