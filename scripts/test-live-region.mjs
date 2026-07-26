// scripts/test-live-region.mjs – ETAP 13A
import assert from 'assert';
import {
    LIVE_REGION_CATALOG,
    getLocalDayKey,
    getTodayLiveRegionItems
} from '../js/data/liveRegion.js';
import { TRANSLATIONS } from '../js/translations.js';

const langs = ['de', 'en', 'pl', 'mk'];
const ids = LIVE_REGION_CATALOG.map((i) => i.id);

assert.ok(ids.length >= 16, 'katalog powinien mieć bogaty pool');

for (const id of ids) {
    for (const lang of langs) {
        const text = TRANSLATIONS[lang]?.liveRegion?.[id];
        assert.ok(text && String(text).trim(), `brak liveRegion.${id} w ${lang}`);
    }
    const enFallback = TRANSLATIONS.fr?.liveRegion?.[id];
    assert.ok(enFallback, `brak EN fallback liveRegion.${id} we fr`);
}

for (const lang of langs) {
    assert.ok(TRANSLATIONS[lang]?.home?.liveRegionTitle, `home.liveRegionTitle ${lang}`);
    assert.ok(TRANSLATIONS[lang]?.home?.liveRegionSub, `home.liveRegionSub ${lang}`);
}

// Mock localStorage dla Node
const mem = new Map();
globalThis.localStorage = {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => { mem.set(k, String(v)); },
    removeItem: (k) => { mem.delete(k); }
};

const dayA = new Date('2026-07-20T10:00:00');
const dayB = new Date('2026-07-21T10:00:00');
assert.strictEqual(getLocalDayKey(dayA), '2026-07-20');

const first = getTodayLiveRegionItems(dayA);
const second = getTodayLiveRegionItems(dayA);
assert.ok(first.length >= 5 && first.length <= 8, `pick size ${first.length}`);
assert.deepStrictEqual(
    first.map((i) => i.id),
    second.map((i) => i.id),
    'ten sam dzień = ten sam zestaw'
);

const nextDay = getTodayLiveRegionItems(dayB);
assert.ok(nextDay.length >= 5 && nextDay.length <= 8);
const sameAsPrev = first.map((i) => i.id).join() === nextDay.map((i) => i.id).join();
assert.ok(!sameAsPrev, 'kolejny dzień powinien dać inny zestaw (z dużym prawdopodobieństwem)');

console.log(`✅ katalog: ${ids.length} pozycji`);
console.log(`✅ i18n DE/EN/PL/MK + EN fallback`);
console.log(`✅ persist dnia: ${first.length} pozycji`);
console.log('\n--- Live Region test ---\nOK');
