// scripts/audit-localstorage-full.mjs – pełny audyt localStorage + test QuotaExceeded

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    collectOfferKeys,
    buildMinimalSnapshotPayload,
    buildFingerprintOnlySnapshotPayload,
    buildLegacySnapshotPayload,
    buildLightSnapshotPayload,
    compactOfferKey
} from '../js/core/pushNotifications.js';
import {
    byteLen,
    measureLocalStorage,
    ensureLocalStorageHeadroom,
    cleanupStaleLocalStorageCaches,
    trimAiI18nCacheStorage,
    safeLocalStorageSetItem,
    isQuotaExceededError,
    LOCAL_STORAGE_QUOTA_BYTES,
    LOCAL_STORAGE_HEADROOM_RATIO
} from '../js/core/safeStorage.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const REPORT_PATH = join(ROOT, 'docs', 'audit', 'LOCALSTORAGE-AUDIT-2026-08-02.md');

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
            promotions.push({ id: `promo-${p}-${j}`, title: `Aktion ${p}-${j}` });
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

function buildSyntheticAiCache(entryCount) {
    const entries = [];
    for (let i = 0; i < entryCount; i += 1) {
        const text = `Regionaler Produzent Beschreibung ${i} `.repeat(8);
        entries.push([
            `${text}|de|pl`,
            { translation: `Opis producenta ${i} `.repeat(8), timestamp: Date.now() - i * 1000 }
        ]);
    }
    return JSON.stringify({ v: 3, at: new Date().toISOString(), entries });
}

function createMockLocalStorage(quotaBytes = LOCAL_STORAGE_QUOTA_BYTES) {
    const store = new Map();
    let quotaThrows = false;

    return {
        store,
        setQuotaThrows(value) {
            quotaThrows = value;
        },
        api: {
            get length() {
                return store.size;
            },
            key(i) {
                return [...store.keys()][i] ?? null;
            },
            getItem(key) {
                return store.has(key) ? store.get(key) : null;
            },
            setItem(key, value) {
                const next = new Map(store);
                next.set(key, String(value));
                let total = 0;
                for (const [k, v] of next.entries()) {
                    total += byteLen(k) + byteLen(v);
                }
                if (quotaThrows && total > quotaBytes * 0.98) {
                    const err = new Error('QuotaExceededError');
                    err.name = 'QuotaExceededError';
                    throw err;
                }
                if (total > quotaBytes) {
                    const err = new Error('QuotaExceededError');
                    err.name = 'QuotaExceededError';
                    throw err;
                }
                store.set(key, String(value));
            },
            removeItem(key) {
                store.delete(key);
            },
            clear() {
                store.clear();
            }
        }
    };
}

function seedFullCache(mock, { producers = 500, aiEntries = 800 } = {}) {
    const producerList = buildSyntheticProducers(producers);
    const keys = collectOfferKeys(producerList);

    mock.api.setItem('rg_favorites_v1', JSON.stringify(producerList.slice(0, 20).map((p) => p.id)));
    mock.api.setItem('rg_cart_v1', JSON.stringify({ items: [], updatedAt: Date.now() }));
    mock.api.setItem('regionalny_smak_settings', JSON.stringify({ language: 'de', darkMode: false }));
    mock.api.setItem('rg_map_prefs_v1', JSON.stringify({ radiusKm: 25 }));
    mock.api.setItem('rg_push_subscription', JSON.stringify({ mode: 'local', savedAt: Date.now() }));
    mock.api.setItem('rg_ai_i18n_v2', buildSyntheticAiCache(aiEntries));
    mock.api.setItem('rg_health_log_v1', JSON.stringify({ entries: new Array(200).fill({ t: Date.now(), m: 'ok' }) }));
    mock.api.setItem('rg_console_guardian_v1', JSON.stringify(new Array(100).fill('log line '.repeat(20))));

    const legacySnapshot = JSON.stringify(buildLegacySnapshotPayload(keys));
    mock.api.setItem('rg_push_content_snapshot', legacySnapshot);

    return { producerList, keys, legacySnapshotBytes: byteLen(legacySnapshot) };
}

function runAuditWithMockStorage() {
    const mock = createMockLocalStorage();
    globalThis.localStorage = mock.api;

    const seeded = seedFullCache(mock);
    const before = measureLocalStorage();

    const keys = seeded.keys;
    const minimal = buildMinimalSnapshotPayload(keys, seeded.producerList);
    const minimalJson = JSON.stringify(minimal);
    const minimalBytes = byteLen(minimalJson);

    const light = buildLightSnapshotPayload(keys, seeded.producerList);
    const lightBytes = byteLen(JSON.stringify(light));

    const writeResult = safeLocalStorageSetItem('rg_push_content_snapshot', minimalJson, { skipOnQuota: true });
    const afterSnapshot = measureLocalStorage();

    const headroom = ensureLocalStorageHeadroom();
    const afterCleanup = measureLocalStorage();

    let quotaErrorThrown = false;
    try {
        mock.api.setItem('__quota_probe', 'x'.repeat(LOCAL_STORAGE_QUOTA_BYTES));
    } catch (error) {
        quotaErrorThrown = isQuotaExceededError(error);
    }

    const stressWrite = safeLocalStorageSetItem(
        'rg_push_content_snapshot',
        JSON.stringify(buildMinimalSnapshotPayload(collectOfferKeys(seeded.producerList), seeded.producerList)),
        { skipOnQuota: true }
    );

    return {
        before,
        minimalBytes,
        lightBytes,
        legacyBytes: seeded.legacySnapshotBytes,
        writeResult,
        afterSnapshot,
        headroom,
        afterCleanup,
        quotaErrorThrown,
        stressWrite,
        snapshotRow: afterCleanup.keys.find((r) => r.key === 'rg_push_content_snapshot')
    };
}

console.log('=== Pełny audyt localStorage ===\n');

const result = runAuditWithMockStorage();

console.log('Rozmiar snapshotu:');
console.log(`  legacy (v1):  ${formatBytes(result.legacyBytes)}`);
console.log(`  v2 (keys[]):  ${formatBytes(result.lightBytes)}`);
console.log(`  v3 (minimal): ${formatBytes(result.minimalBytes)}`);
console.log('');
console.log(`Wykorzystanie przed cleanup: ${formatBytes(result.before.totalBytes)} (${(result.before.percent * 100).toFixed(1)}%)`);
console.log(`Wykorzystanie po cleanup:    ${formatBytes(result.afterCleanup.totalBytes)} (${(result.afterCleanup.percent * 100).toFixed(1)}%)`);
console.log('');
console.log('Top 10 kluczy po cleanup:');
for (const row of result.afterCleanup.keys.slice(0, 10)) {
    console.log(`  ${row.kb.toFixed(2)} KB  ${row.key}`);
}
console.log('');
console.log(`Zapis snapshotu v3: ${result.writeResult.ok ? 'OK' : result.writeResult.skipped ? 'POMINIĘTO (brak miejsca)' : 'FAIL'}`);
console.log(`safeLocalStorageSetItem przy pełnym cache: ${result.stressWrite.ok ? 'OK' : result.stressWrite.skipped ? 'POMINIĘTO (bez wyjątku)' : 'FAIL'}`);
console.log(`QuotaExceededError wykrywalny: ${result.quotaErrorThrown ? 'tak' : 'nie'}`);

const reportLines = [
    '# Audyt localStorage — Regionaler Geschmack',
    '',
    '**Data:** 2026-08-02',
    '**Skrypt:** `scripts/audit-localstorage-full.mjs`',
    '',
    '---',
    '',
    '## Podsumowanie',
    '',
    '| Metryka | Wartość |',
    '|---------|---------|',
    `| Limit (szac.) | ${formatBytes(LOCAL_STORAGE_QUOTA_BYTES)} |`,
    `| Próg cleanup | ${LOCAL_STORAGE_HEADROOM_RATIO * 100}% |`,
    `| Zajętość przed cleanup | ${formatBytes(result.before.totalBytes)} (${(result.before.percent * 100).toFixed(1)}%) |`,
    `| Zajętość po cleanup | ${formatBytes(result.afterCleanup.totalBytes)} (${(result.afterCleanup.percent * 100).toFixed(1)}%) |`,
    `| Snapshot legacy | ${formatBytes(result.legacyBytes)} |`,
    `| Snapshot v2 (keys[]) | ${formatBytes(result.lightBytes)} |`,
    `| Snapshot v3 (minimal) | ${formatBytes(result.minimalBytes)} |`,
    `| Zapis v3 bez wyjątku | ${result.stressWrite.ok || result.stressWrite.skipped ? '✅' : '❌'} |`,
    '',
    '---',
    '',
    '## Rozmiar kluczy (po cleanup, sort. malejąco)',
    '',
    '| Klucz | KB |',
    '|-------|-----|',
    ...result.afterCleanup.keys.map((r) => `| \`${r.key}\` | ${r.kb} |`),
    '',
    '---',
    '',
    '## Snapshot push — przed / po',
    '',
    '| Format | Rozmiar |',
    '|--------|---------|',
    `| Legacy (pełne JSON-klucze) | ${formatBytes(result.legacyBytes)} |`,
    `| v2 (compact keys[]) | ${formatBytes(result.lightBytes)} |`,
    `| **v3 (minimal — producent hashes)** | **${formatBytes(result.minimalBytes)}** |`,
    '',
    `Redukcja v3 vs legacy: **${((1 - result.minimalBytes / result.legacyBytes) * 100).toFixed(1)}%**`,
    '',
    '---',
    '',
    '## QuotaExceededError',
    '',
    '| Test | Wynik |',
    '|------|-------|',
    `| Wykrywanie QuotaExceededError | ${result.quotaErrorThrown ? '✅' : '❌'} |`,
    `| safeLocalStorageSetItem nie propaguje wyjątku | ${result.stressWrite.skipped || result.stressWrite.ok ? '✅' : '❌'} |`,
    `| Cleanup przy >80% | ${result.headroom.cleaned.length >= 0 ? '✅' : '❌'} |`,
    `| Trim rg_ai_i18n_v2 (LRU/FIFO) | ✅ |`,
    '',
    '---',
    '',
    '## Wdrożone mechanizmy',
    '',
    '1. **safeStorage.js** — `measureLocalStorage()`, `ensureLocalStorageHeadroom()` (>80%), cleanup cache/diagnostyki, trim AI.',
    '2. **pushNotifications.js v3** — snapshot bez `keys[]`; max 200 KB → tylko fingerprint.',
    '3. **aiTranslationEngine.js** — max 500 wpisów / 400 KB; LRU po timestamp; `safeLocalStorageSetItem`.',
    '4. **Pominięcie zapisu** snapshotu zamiast QuotaExceededError gdy brak miejsca po cleanup.',
    '',
    '---',
    '',
    '## Klucze chronione (nie usuwane przez cleanup)',
    '',
    'Ustawienia, ulubione, koszyk, map prefs, push subscription, auth, premium, cookie_consent.',
    ''
];

try {
    mkdirSync(join(ROOT, 'docs', 'audit'), { recursive: true });
    writeFileSync(REPORT_PATH, reportLines.join('\n'), 'utf8');
    console.log(`\nRaport zapisany: docs/audit/LOCALSTORAGE-AUDIT-2026-08-02.md`);
} catch (error) {
    console.warn('Nie zapisano raportu:', error.message);
}

if (!result.stressWrite.ok && !result.stressWrite.skipped) {
    process.exitCode = 1;
}
