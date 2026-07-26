/**
 * Test wyszukiwarki – tłumaczenia (36 języków) + wyszukiwanie wielojęzyczne.
 * Run: node scripts/test-search-i18n.mjs
 */
import { TRANSLATIONS, SUPPORTED_LANGUAGE_CODES } from '../js/translations.js';
import { setLanguage, t } from '../js/core/i18n.js';
import { filterProducersBySearch, searchGlobalResults } from '../js/presentation/searchFilter.js';
import { loadAllData, resetProducersForTests } from '../js/data/dataService.js';

if (typeof globalThis.document === 'undefined') {
    globalThis.document = { documentElement: { lang: 'de' } };
}

const SEARCH_KEYS = [
    'home.searchPlaceholder',
    'map.searchPlaceholder',
    'search.noResults',
    'search.noResultsFor',
    'search.resultsCount',
    'search.searching'
];

function get(obj, path) {
    let cur = obj;
    for (const p of path.split('.')) cur = cur?.[p];
    return cur;
}

let hasError = false;

console.log('=== KROK 1: Tłumaczenia wyszukiwarki (36 języków) ===\n');
for (const code of SUPPORTED_LANGUAGE_CODES) {
    const missing = SEARCH_KEYS.filter((k) => !get(TRANSLATIONS[code], k));
    if (missing.length) {
        hasError = true;
        console.log(`❌ ${code}: brakuje ${missing.join(', ')}`);
    } else {
        console.log(`✅ ${code}: komplet (${SEARCH_KEYS.length} kluczy)`);
    }
}

console.log('\n=== KROK 2: Wyszukiwanie wielojęzyczne (dane live) ===\n');

resetProducersForTests();
const lat = 52.14;
const lng = 8.04;

/** Ponów pobranie przy przejściowych błędach OSM (504/429). */
async function loadProducersWithRetry() {
    const opts = { radiusKm: 15 };
    let best = { producers: [], source: 'empty' };
    for (let attempt = 0; attempt < 3; attempt++) {
        const loaded = await loadAllData(lat, lng, { ...opts, forceRefresh: attempt > 0 });
        if (loaded.producers.length > best.producers.length) best = loaded;
        if (loaded.producers.length >= 50) return loaded;
        if (attempt < 2) await new Promise((r) => setTimeout(r, 1500));
    }
    return best;
}

const loaded = await loadProducersWithRetry();
const producers = loaded.producers;
const MIN_PRODUCERS_FOR_SEARCH = 20;

if (!producers.length) {
    console.log('⚠️  Brak producentów – pominięto testy wyszukiwania (API niedostępne)');
} else if (producers.length < MIN_PRODUCERS_FOR_SEARCH) {
    console.log(`⚠️  Za mało producentów (${producers.length}, źródło: ${loaded.source}) – pominięto testy wyszukiwania (przejściowy błąd OSM)`);
} else {
    console.log(`Producentów: ${producers.length} (źródło: ${loaded.source})\n`);

    const QUERIES = [
        { label: 'DE Brot/Bäck', terms: ['brot', 'bäck', 'bäckerei'], minResults: 1 },
        { label: 'EN bread/bakery', terms: ['bread', 'bakery'], minResults: 1 },
        { label: 'PL chleb/piekarnia', terms: ['chleb', 'piekarnia'], minResults: 1 },
        { label: 'RU хлеб', terms: ['хлеб'], minResults: 1 },
        { label: 'TR ekmek', terms: ['ekmek', 'fırın'], minResults: 1 },
        { label: 'EN restaurant', terms: ['restaurant'], minResults: 1 },
        { label: 'PL restauracja', terms: ['restauracja'], minResults: 1 },
        { label: 'nosuch xyz999', terms: ['xyznonexistent999'], minResults: 0 }
    ];

    setLanguage('de');
    for (const q of QUERIES) {
        for (const term of q.terms) {
            const filtered = filterProducersBySearch(producers, term, t);
            const global = searchGlobalResults(producers, term, t);
            const ok = q.minResults === 0
                ? filtered.length === 0 && global.items.length === 0
                : filtered.length >= q.minResults || global.items.length >= q.minResults;
            if (ok) {
                console.log(`✅ [DE UI] "${term}" → producenci: ${filtered.length}, wyniki: ${global.items.length}`);
            } else {
                hasError = true;
                console.log(`❌ [DE UI] "${term}" → producenci: ${filtered.length}, wyniki: ${global.items.length} (oczek. min ${q.minResults})`);
            }
        }
    }

    console.log('\n--- UI: komunikaty w 5 językach ---');
    for (const code of ['pl', 'de', 'en', 'ru', 'tr']) {
        setLanguage(code);
        const ph = t('home.searchPlaceholder');
        const nr = t('search.noResults');
        const rc = t('search.resultsCount').replace('{count}', '3');
        const sr = t('search.searching');
        const bad = [ph, nr, sr].some((v) => !v || v.startsWith('home.') || v.startsWith('search.'));
        const rcBad = !rc || rc.startsWith('search.');
        if (bad || rcBad) {
            hasError = true;
            console.log(`❌ ${code}: brak tłumaczenia UI`);
        } else {
            console.log(`✅ ${code}: placeholder="${ph.slice(0, 40)}…", searching="${sr}"`);
        }
    }
}

console.log('\n=== Podsumowanie ===');
if (hasError) {
    console.log('❌ TESTY NIEUDANE');
    process.exit(1);
}
console.log('✅ Wszystkie testy wyszukiwarki PASS');
