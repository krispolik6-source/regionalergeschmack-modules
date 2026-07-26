// scripts/test-nature-calendar.mjs – ETAP 13B
import assert from 'assert';
import { NATURE_CALENDAR_CATALOG, getTodayNatureMoments } from '../js/data/natureCalendar.js';
import { TRANSLATIONS } from '../js/translations.js';

const langs = ['de', 'en', 'pl', 'mk'];
const ids = NATURE_CALENDAR_CATALOG.map((i) => i.id);

assert.ok(ids.length >= 12, 'katalog natury');

for (const id of ids) {
    for (const lang of langs) {
        assert.ok(TRANSLATIONS[lang]?.natureCalendar?.[id], `natureCalendar.${id} ${lang}`);
    }
    assert.ok(TRANSLATIONS.fr?.natureCalendar?.[id], `EN fallback ${id}`);
}

for (const lang of langs) {
    assert.ok(TRANSLATIONS[lang]?.home?.natureCalendarTitle);
}

const mem = new Map();
globalThis.localStorage = {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => { mem.set(k, String(v)); },
    removeItem: (k) => { mem.delete(k); }
};

const july = new Date('2026-07-20T12:00:00');
const a = getTodayNatureMoments(july);
const b = getTodayNatureMoments(july);
assert.ok(a.length >= 1 && a.length <= 2, `count ${a.length}`);
assert.deepStrictEqual(a.map((i) => i.id), b.map((i) => i.id));
assert.ok(a.every((i) => i.months.includes(7)), 'lipiec = miesiące lipcowe');

console.log(`✅ katalog: ${ids.length}`);
console.log(`✅ dziś: ${a.map((i) => i.id).join(', ')}`);
console.log('\n--- Nature Calendar test ---\nOK');
