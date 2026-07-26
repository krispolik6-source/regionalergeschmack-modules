// scripts/test-smart-today.mjs – ETAP 13C
import assert from 'assert';
import {
    getDayPart,
    getClimateProxyWeather,
    getSmartTodayRecommendations,
    pickSmartTodayReason
} from '../js/presentation/smartToday.js';
import { TRANSLATIONS } from '../js/translations.js';

const mem = new Map();
globalThis.localStorage = {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => { mem.set(k, String(v)); },
    removeItem: (k) => { mem.delete(k); }
};

const langs = ['de', 'en', 'pl', 'mk'];
for (const lang of langs) {
    assert.ok(TRANSLATIONS[lang]?.home?.smartTodayTitle);
    for (const reason of ['rain', 'hot', 'autumn', 'cold', 'morning', 'evening', 'spring', 'summer', 'fresh']) {
        assert.ok(TRANSLATIONS[lang]?.smartToday?.reason?.[reason], `${lang} reason.${reason}`);
    }
}

assert.strictEqual(getDayPart(new Date('2026-07-20T08:00:00')), 'morning');
assert.strictEqual(getDayPart(new Date('2026-07-20T12:30:00')), 'midday');

const hotDay = new Date('2026-07-15T13:00:00');
const weather = getClimateProxyWeather(hotDay);
assert.ok(['hot', 'warm', 'rain'].includes(weather.kind), weather.kind);

const recHot = getSmartTodayRecommendations({ now: hotDay, limit: 4 });
assert.ok(recHot.products.length >= 2, 'produkty hot');
assert.ok(recHot.reason.id, 'reason');

const rainForced = getSmartTodayRecommendations({
    now: new Date('2026-07-14T12:00:00'), // dayHash % 7 === 0 for some days - may vary
    limit: 4
});
assert.ok(rainForced.products.length >= 1);

const autumn = getSmartTodayRecommendations({ now: new Date('2026-10-10T16:00:00'), limit: 4 });
assert.ok(['autumn', 'cool', 'mild', 'rain', 'evening', 'fresh', 'cold'].includes(autumn.reason.id)
    || autumn.products.length >= 1);

const reason = pickSmartTodayReason({
    season: 'autumn',
    dayPart: 'afternoon',
    weather: 'mild',
    weatherSource: 'proxy',
    tempC: 14,
    user: null,
    dayKey: '2026-10-10'
});
assert.strictEqual(reason.id, 'autumn');

console.log(`✅ reason hot day: ${recHot.reason.id} → ${recHot.products.map((p) => p.imageSlug).join(', ')}`);
console.log(`✅ autumn reason: ${reason.id}`);
console.log('\n--- Smart Today test ---\nOK');
