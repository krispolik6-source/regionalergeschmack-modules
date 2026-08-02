// scripts/test-push-notifications.mjs – test logiki powiadomień push

import {
    collectOfferKeys,
    parseOfferKey,
    compactOfferKey,
    buildMinimalSnapshotPayload,
    buildLightSnapshotPayload,
    buildLegacySnapshotPayload
} from '../js/core/pushNotifications.js';
import { byteLen } from '../js/core/safeStorage.js';

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

const compactPrevious = new Set([...keys].map(compactOfferKey));
const compactAdded = [...keysAfter].filter((key) => !compactPrevious.has(compactOfferKey(key)));
if (compactAdded.length !== 1) {
    fail(`Compact diff: oczekiwano 1 nowej oferty, jest ${compactAdded.length}`);
} else {
    ok('Wykrywanie nowych ofert (compact snapshot) działa');
}

const minimalPayload = JSON.stringify(buildMinimalSnapshotPayload(keysAfter, producers));
const v2Payload = JSON.stringify(buildLightSnapshotPayload(keysAfter, producers));
const legacyPayload = JSON.stringify(buildLegacySnapshotPayload(keysAfter));
const savings = ((1 - byteLen(minimalPayload) / byteLen(legacyPayload)) * 100).toFixed(0);
if (byteLen(minimalPayload) >= byteLen(legacyPayload)) {
    fail(`Minimal snapshot nie jest mniejszy (${byteLen(minimalPayload)} vs ${byteLen(legacyPayload)} B)`);
} else {
    ok(`Minimal snapshot mniejszy o ~${savings}% (${byteLen(legacyPayload)} B → ${byteLen(minimalPayload)} B)`);
}

if (JSON.parse(minimalPayload).keys) {
    fail('Minimal snapshot nie powinien zawierać keys[]');
} else {
    ok('Minimal snapshot bez keys[] (tylko hashe producentów)');
}

console.log('\n--- Push notifications test ---');
console.log(process.exitCode ? 'FAILED' : 'OK');
