// scripts/test-living-map.mjs – ETAP 15C
import assert from 'assert';
import { getOpenTiming } from '../js/data/openingHours.js';
import { resolveLivingMapCue } from '../js/presentation/livingMap.js';
import { TRANSLATIONS } from '../js/translations.js';

const mem = new Map();
globalThis.localStorage = {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => { mem.set(k, String(v)); },
    removeItem: (k) => { mem.delete(k); }
};

for (const lang of ['de', 'en', 'pl', 'mk']) {
    for (const id of ['closingSoon', 'justOpened', 'freshOpen', 'recommended', 'popular', 'freshDelivery']) {
        assert.ok(TRANSLATIONS[lang]?.livingMap?.[id], `${lang}.${id}`);
    }
}

// Poniedziałek 09:20, otwarte 09:00–18:00 → właśnie otworzył
const monMorning = new Date('2026-07-20T09:20:00'); // Mon
assert.strictEqual(monMorning.getDay(), 1);
const bakery = {
    id: 'test-bakery',
    openingHours: 'Mo-Su 09:00-18:00',
    products: []
};
const timing = getOpenTiming(bakery, monMorning);
assert.strictEqual(timing.isOpen, true);
assert.ok(timing.minutesSinceOpen != null && timing.minutesSinceOpen <= 45);
assert.ok(timing.minutesUntilClose != null && timing.minutesUntilClose > 60);

const cueJust = resolveLivingMapCue(bakery, {
    now: monMorning,
    recommendedIds: new Set()
});
assert.strictEqual(cueJust?.id, 'justOpened');

// 17:20 → zamyka za godzinę (priorytet nad innymi)
const monEve = new Date('2026-07-20T17:20:00');
const cueClose = resolveLivingMapCue(bakery, {
    now: monEve,
    recommendedIds: new Set()
});
assert.strictEqual(cueClose?.id, 'closingSoon');

// Polecane wygrywa gdy brak sygnału godzin
const midday = new Date('2026-07-20T12:00:00');
const cueRec = resolveLivingMapCue(
    { id: 'rec-1', openingHours: 'Mo-Su 08:00-20:00', products: [] },
    { now: midday, recommendedIds: new Set(['rec-1']) }
);
assert.strictEqual(cueRec?.id, 'recommended');

// Świeża dostawa (sezon / promo) gdy brak wyższych
const delivery = resolveLivingMapCue(
    {
        id: 'unique-delivery-xyz-99',
        openingHours: '',
        promo: 'Frisch heute',
        products: [{ name: 'Tomaten', available: 'available' }]
    },
    { now: midday, recommendedIds: new Set() }
);
assert.strictEqual(delivery?.id, 'freshDelivery');

// Jedna wskazówka – className bez animacji w nazwie
assert.ok(cueJust.className.includes('lm-cue--justOpened'));
assert.ok(!/blink|pulse|flash/i.test(cueJust.className));

console.log('✅ timing + priority cues');
console.log(`✅ justOpened @09:20, closingSoon @17:20, recommended, delivery`);
console.log('\n--- Living Map test ---\nOK');
