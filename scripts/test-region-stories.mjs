// scripts/test-region-stories.mjs – ETAP 13D
import assert from 'assert';
import { REGION_STORY_CATALOG, getTodayRegionStory, COOLDOWN_DAYS } from '../js/data/regionStories.js';
import { TRANSLATIONS } from '../js/translations.js';

const mem = new Map();
globalThis.localStorage = {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => { mem.set(k, String(v)); },
    removeItem: (k) => { mem.delete(k); }
};

const langs = ['de', 'en', 'pl', 'mk'];
const ids = REGION_STORY_CATALOG.map((s) => s.id);
assert.ok(ids.length >= 12);
assert.ok(COOLDOWN_DAYS >= 7);

for (const id of ids) {
    for (const lang of langs) {
        const text = TRANSLATIONS[lang]?.regionStory?.[id];
        assert.ok(text && String(text).trim(), `${lang} ${id}`);
        const words = String(text).trim().split(/\s+/).filter(Boolean).length;
        assert.ok(words >= 35 && words <= 70, `${lang}.${id} words=${words} (oczekiwano ~40–60)`);
    }
}

const day1 = new Date('2026-07-20T10:00:00');
const a = getTodayRegionStory(day1);
const b = getTodayRegionStory(day1);
assert.strictEqual(a.id, b.id, 'ten sam dzień = ta sama historia');

const seen = new Set([a.id]);
for (let i = 1; i <= 10; i += 1) {
    const d = new Date(day1);
    d.setDate(d.getDate() + i);
    seen.add(getTodayRegionStory(d).id);
}
assert.ok(seen.size >= 8, `różnorodność w 11 dniach: ${seen.size}`);

console.log(`✅ katalog: ${ids.length}, cooldown: ${COOLDOWN_DAYS} dni`);
console.log(`✅ dziś: ${a.id}`);
console.log('\n--- Region Stories test ---\nOK');
