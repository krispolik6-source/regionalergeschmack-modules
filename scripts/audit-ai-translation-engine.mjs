/**
 * Audyt AI Translation Engine — requesty, cache, 400/429 (symulacja bez sieci).
 */
import {
    AI_TRANSLATE_CONFIG,
    registerProvider,
    translate,
    translateBatch,
    invalidateCache,
    getAiTranslateStats
} from '../js/i18n/aiTranslationEngine.js';

const g = globalThis;

function installMocks() {
    const store = new Map();
    g.localStorage = {
        getItem: (k) => store.get(k) ?? null,
        setItem: (k, v) => store.set(k, String(v)),
        removeItem: (k) => store.delete(k),
        key: (i) => [...store.keys()][i] ?? null,
        get length() { return store.size; }
    };
    g.location = { hostname: 'localhost' };
    g.document = {
        querySelectorAll: () => [],
        documentElement: { lang: 'en' }
    };
    g.window = g;
    g.AbortController = class {
        constructor() { this.signal = { aborted: false }; }
        abort() { this.signal.aborted = true; }
    };
}

function installMockProviders(behavior = {}) {
    const counts = { libre: 0, mymemory: 0 };
    registerProvider({
        id: 'libretranslate',
        async translate(text, from, to, cfg) {
            if (!String(cfg?.libreApiKey || '').trim()) {
                const err = new Error('libretranslate 0');
                err.status = 0;
                err.provider = 'libretranslate';
                throw err;
            }
            counts.libre += 1;
            await sleep(behavior.delayMs || 10);
            if (behavior.libreStatus === 400) {
                const err = new Error('libretranslate 400');
                err.status = 400;
                err.provider = 'libretranslate';
                throw err;
            }
            return `[LT] ${text}`;
        }
    });
    registerProvider({
        id: 'mymemory',
        async translate(text) {
            counts.mymemory += 1;
            await sleep(behavior.delayMs || 10);
            if (behavior.mymemoryStatus === 429) {
                const err = new Error('mymemory 429');
                err.status = 429;
                err.provider = 'mymemory';
                throw err;
            }
            return `[MM] ${text}`;
        }
    });
    return counts;
}

async function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

async function runScenario(name, fn) {
    invalidateCache();
    AI_TRANSLATE_CONFIG.libreApiKey = '';
    AI_TRANSLATE_CONFIG.providers = ['libretranslate', 'mymemory'];
    const result = await fn();
    await sleep(100);
    const stats = getAiTranslateStats();
    return { name, ...result, stats };
}

installMocks();

const results = [];

results.push(await runScenario('P1 — skip LibreTranslate bez klucza', async () => {
    const counts = installMockProviders();
    const out = await translate('Frisches Bauernbrot', { to: 'en', from: 'de' });
    await sleep(900);
    return {
        out,
        libre: counts.libre,
        mymemory: counts.mymemory,
        pass: counts.libre === 0 && counts.mymemory === 1 && out.startsWith('[MM]')
    };
}));

results.push(await runScenario('P2 — cache hit', async () => {
    const counts = installMockProviders();
    await translate('Frisches Sauerteigbrot', { to: 'en', from: 'de' });
    await sleep(900);
    const before = counts.mymemory;
    await translate('Frisches Sauerteigbrot', { to: 'en', from: 'de' });
    await sleep(100);
    const stats = getAiTranslateStats();
    return {
        requestsAfterCache: counts.mymemory - before,
        cacheHits: stats.audit.cacheHits,
        pass: counts.mymemory - before === 0 && stats.audit.cacheHits >= 1
    };
}));

results.push(await runScenario('P5/P8 — deduplikacja sesji', async () => {
    const counts = installMockProviders();
    await Promise.all([
        translate('Frisches Dinkelbrot', { to: 'en', from: 'de' }),
        translate('Frisches Dinkelbrot', { to: 'en', from: 'de' }),
        translate('Frisches Dinkelbrot', { to: 'en', from: 'de' }),
        translate('Frisches Dinkelbrot', { to: 'en', from: 'de' }),
        translate('Frisches Dinkelbrot', { to: 'en', from: 'de' })
    ]);
    await sleep(900);
    return {
        parallelSameTextRequests: counts.mymemory,
        pass: counts.mymemory === 1
    };
}));

results.push(await runScenario('P4 — 429 rate limit provider', async () => {
    const counts = installMockProviders({ mymemoryStatus: 429 });
    const out = await translate('Frisches Roggenbrot', { to: 'en', from: 'de' });
    await sleep(100);
    const stats = getAiTranslateStats();
    return {
        out,
        status429: stats.audit.status429,
        mymemoryRequests: counts.mymemory,
        pass: stats.audit.status429 >= 1 && out === 'Frisches Roggenbrot' && counts.mymemory === 1
    };
}));

results.push(await runScenario('P8 — translateBatch dedup', async () => {
    const counts = installMockProviders();
    await translateBatch(['Produkt A', 'Produkt B', 'Produkt A', 'Produkt B', 'Produkt C'], { to: 'en', from: 'de' });
    await sleep(2800);
    return {
        requests: counts.mymemory,
        pass: counts.mymemory === 3
    };
}));

results.push(await runScenario('P1/P4 — Libre 400 → MyMemory', async () => {
    AI_TRANSLATE_CONFIG.libreApiKey = 'test-key';
    const counts = installMockProviders({ libreStatus: 400 });
    const out = await translate('Frisches Vollkornbrot', { to: 'en', from: 'de' });
    await sleep(900);
    const stats = getAiTranslateStats();
    return {
        out,
        libre: counts.libre,
        mymemory: counts.mymemory,
        status400: stats.audit.status400,
        pass: counts.libre === 1 && counts.mymemory === 1 && stats.audit.status400 >= 1 && out.startsWith('[MM]')
    };
}));

console.log('=== Audyt AI Translation Engine ===\n');

let failed = 0;
for (const r of results) {
    const mark = r.pass ? '✅' : '❌';
    if (!r.pass) failed += 1;
    console.log(`${mark} ${r.name}`);
    const { stats, ...rest } = r;
    console.log(JSON.stringify(rest, null, 2));
    console.log('');
}

const last = getAiTranslateStats();
console.log('=== Podsumowanie metryk (ostatni scenariusz) ===');
console.log(`Requesty łącznie:     ${last.audit.requests}`);
console.log(`LibreTranslate:       ${last.audit.libreRequests}`);
console.log(`MyMemory:             ${last.audit.mymemoryRequests}`);
console.log(`HTTP 400:             ${last.audit.status400}`);
console.log(`HTTP 429:             ${last.audit.status429}`);
console.log(`Cache hit ratio:      ${(last.audit.cacheHitRatio * 100).toFixed(1)}%`);
console.log(`Cache hits / misses:  ${last.audit.cacheHits} / ${last.audit.cacheMisses}`);
console.log(`Średni czas requestu: ${last.audit.avgMs} ms`);
console.log(`Odstęp kolejki:       ${last.audit.requestGapMs} ms`);
console.log(`Retry zaplanowane:    ${last.audit.retries}`);
console.log(`Provider skips:       ${last.audit.providerSkips}`);

console.log('\n=== P9 — wspólny cache ===');
console.log('translate · translateSoft · translateBatch · translatePage · translateProduct · producerModal → memoryCache + rg_ai_i18n_v2');

console.log('\n=== Regresje ===');
console.log(failed ? `${failed} scenariusz(y) FAIL` : 'Brak regresji w scenariuszach audytu');

if (failed) process.exit(1);
