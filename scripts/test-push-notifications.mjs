// scripts/test-push-notifications.mjs – test logiki powiadomień push

import { collectOfferKeys, parseOfferKey } from '../js/core/pushNotifications.js';

const producers = [
    {
        id: 'p1',
        name: 'Bäckerei Test',
        products: [{ id: 'prod-1', name: 'Brot' }],
        promotions: [{ id: 'promo-1', title: 'Rabatt 10%' }]
    }
];

function ok(msg) { console.log(`✅ ${msg}`); }
function fail(msg) { console.error(`❌ ${msg}`); process.exitCode = 1; }

const keys = collectOfferKeys(producers);
// produkt + promocja + heurystyka fresh_bread dla „Brot” (ETAP 8)
if (keys.size < 2) {
    fail(`Oczekiwano ≥2 kluczy ofert, jest ${keys.size}`);
} else {
    ok(`collectOfferKeys zwraca produkty/promocje/heurystyki (${keys.size})`);
}

const sample = [...keys][0];
const parsed = parseOfferKey(sample);
if (!parsed.type || !parsed.producerName || !parsed.itemLabel) {
    fail('parseOfferKey nie zwraca wymaganych pól');
} else {
    ok('parseOfferKey działa');
}

const keysAfter = collectOfferKeys([
    ...producers,
    {
        id: 'p2',
        name: 'Hofladen',
        products: [{ id: 'prod-2', name: 'Eier' }],
        promotions: []
    }
]);

const previous = new Set(keys);
const added = [...keysAfter].filter((key) => !previous.has(key));
if (added.length !== 1) {
    fail(`Oczekiwano 1 nowej oferty, jest ${added.length}`);
} else {
    ok('Wykrywanie nowych ofert działa');
}

console.log('\n--- Push notifications test ---');
console.log(process.exitCode ? 'FAILED' : 'OK');
