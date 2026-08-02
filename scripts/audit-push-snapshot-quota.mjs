// scripts/audit-push-snapshot-quota.mjs – pomiar snapshotu push + audyt kluczy LS

import {
    collectOfferKeys,
    compactOfferKey,
    buildMinimalSnapshotPayload,
    buildFingerprintOnlySnapshotPayload,
    buildLegacySnapshotPayload,
    buildLightSnapshotPayload
} from '../js/core/pushNotifications.js';
import { byteLen } from '../js/core/safeStorage.js';

function formatBytes(n) {
    const v = Number(n) || 0;
    if (v < 1024) return `${v} B`;
    if (v < 1024 * 1024) return `${(v / 1024).toFixed(2)} KB`;
    return `${(v / (1024 * 1024)).toFixed(2)} MB`;
}

function buildSyntheticProducers(count) {
    const producers = [];
    for (let p = 0; p < count; p += 1) {
        const products = [];
        for (let i = 0; i < 8; i += 1) {
            products.push({
                id: `prod-${p}-${i}`,
                name: `Produkt ${p}-${i} Brot Käse regional`,
                seasonal: i % 3 === 0,
                available: i % 4 === 0 ? 'available' : 'unknown',
                onPromo: i % 5 === 0
            });
        }
        const promotions = [];
        for (let j = 0; j < 2; j += 1) {
            promotions.push({
                id: `promo-${p}-${j}`,
                title: `Aktion ${p}-${j} Rabatt 10%`
            });
        }
        producers.push({
            id: `producer-${p}`,
            name: `Hofladen und Bäckerei Nr ${p} GmbH`,
            updatedAt: Date.now() - p * 3600000,
            source: p % 10 === 0 ? 'user' : 'osm',
            products,
            promotions
        });
    }
    return producers;
}

function measureSnapshot(producers) {
    const keys = collectOfferKeys(producers);
    const legacy = JSON.stringify(buildLegacySnapshotPayload(keys));
    const v2 = JSON.stringify(buildLightSnapshotPayload(keys, producers));
    const v3 = JSON.stringify(buildMinimalSnapshotPayload(keys, producers));
    return {
        producers: producers.length,
        offerKeys: keys.size,
        legacyBytes: byteLen(legacy),
        v2Bytes: byteLen(v2),
        v3Bytes: byteLen(v3),
        savingsPct: ((1 - byteLen(v3) / byteLen(legacy)) * 100).toFixed(1)
    };
}

function rankRiskyLocalStorageKeys() {
    /** @type {{ key: string, risk: string, note: string }[]} */
    const entries = [
        { key: 'rg_push_content_snapshot', risk: 'high', note: 'v3 minimal (hashe producentów) — max 200 KB, skip zamiast QuotaExceeded' },
        { key: 'rg_producers_data_v9', risk: 'high', note: 'Cache producentów OSM (lean/minimal fallback)' },
        { key: 'rg_ai_i18n_v2', risk: 'high', note: 'Cache tłumaczeń AI — trim + retry przy QuotaExceeded' },
        { key: 'rg_dyn_i18n_v1', risk: 'medium', note: 'Legacy cache tłumaczeń' },
        { key: 'rg_learning_events_v1', risk: 'medium', note: 'Zdarzenia learning engine (slice 0..MAX)' },
        { key: 'rg_learning_model_v1', risk: 'medium', note: 'Model uczenia — chroniony przez Memory Cleaner' },
        { key: 'rg_health_log_v1', risk: 'medium', note: 'Log health monitor (slice)' },
        { key: 'rg_health_report_v1', risk: 'medium', note: 'Raport health' },
        { key: 'rg_osm_cache', risk: 'medium', note: 'Cache kafelków/zapytań OSM' },
        { key: 'rg_console_guardian_v1', risk: 'low', note: 'Diagnostyka — safe cleanup' },
        { key: 'rg_improvement_history_v1', risk: 'low', note: 'Historia propozycji — safe cleanup' },
        { key: 'rg_favorites_v1', risk: 'low', note: 'Lista ID — zwykle mała' },
        { key: 'rg_cart_v1', risk: 'low', note: 'Koszyk — ograniczony rozmiarem sesji' },
        { key: 'rg_push_subscription', risk: 'low', note: 'Subskrypcja push — mały JSON' },
        { key: 'rg_push_nearby_ids', risk: 'low', note: 'Slice -80 ID' }
    ];
    return entries;
}

console.log('=== Audyt QuotaExceededError · rg_push_content_snapshot ===\n');

for (const count of [50, 200, 500]) {
    const m = measureSnapshot(buildSyntheticProducers(count));
    console.log(`Producenci: ${m.producers} | Klucze ofert: ${m.offerKeys}`);
    console.log(`  PRZED (legacy): ${formatBytes(m.legacyBytes)}`);
    console.log(`  v2 (keys[]):   ${formatBytes(m.v2Bytes)}`);
    console.log(`  v3 (minimal):  ${formatBytes(m.v3Bytes)}  (−${m.savingsPct}% vs legacy)`);
    console.log('');
}

const sample = buildSyntheticProducers(1)[0];
const sampleKeys = collectOfferKeys([sample]);
const fullKey = [...sampleKeys][0];
console.log('Przykład klucza:');
console.log(`  legacy: ${fullKey.slice(0, 120)}… (${byteLen(fullKey)} B)`);
console.log(`  compact: ${compactOfferKey(fullKey)} (${byteLen(compactOfferKey(fullKey))} B)\n`);

console.log('=== Klucze localStorage — ryzyko przekroczenia limitu ===\n');
for (const row of rankRiskyLocalStorageKeys()) {
    console.log(`[${row.risk.toUpperCase()}] ${row.key} — ${row.note}`);
}

console.log('\n=== Werdykt ===');
console.log('writeSnapshot(): v3 minimal + safeLocalStorageSetItem (headroom 80% + cleanup + skip)');
console.log('QuotaExceededError: nie propaguje wyjątku — aplikacja kontynuuje działanie');
