/**
 * Smoke test ETAP 18B Learning Engine (pure model builders).
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function assert(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error(`❌ ${msg}`);
    } else {
        console.log(`✅ ${msg}`);
    }
}

const file = join(ROOT, 'js/presentation/learningEngine.js');
assert(existsSync(file), 'learningEngine.js exists');

const src = readFileSync(file, 'utf8');
assert(src.includes('localStorage'), 'używa localStorage');
assert(src.includes('indexedDB'), 'używa IndexedDB');
assert(src.includes('pruneIndexedDB'), 'pruneIndexedDB export');
assert(src.includes('selectSignalsToKeep'), 'selectSignalsToKeep export');
assert(src.includes('MAX_IDB_RECORDS'), 'limit rekordów IDB');
assert(src.includes('MAX_IDB_AGE_MS'), 'limit wieku IDB');
assert(src.includes('isLearningEnabled'), 'flaga isLearningEnabled');
assert(src.includes('flushPendingSignals'), 'zapis zbiorczy');
assert(src.includes('MAX_IDB_BYTES'), 'limit 10MB IDB');
assert(src.includes('aggregateSignals'), 'agregacja sygnałów');
assert(!/fetch\s*\(\s*['"`]https?:/.test(src), 'brak fetch HTTP w module');
assert(src.includes('anonymous') || src.includes('Anonim'), 'polityka anonimowa');

const app = readFileSync(join(ROOT, 'js/app.js'), 'utf8');
assert(app.includes('initLearningEngine'), 'app.js initLearningEngine');

const smart = readFileSync(join(ROOT, 'js/presentation/smartRecommend.js'), 'utf8');
assert(smart.includes('getLearningBoostForProducer'), 'smartRecommend używa learning boost');

const home = readFileSync(join(ROOT, 'js/views/home.js'), 'utf8');
assert(home.includes('learningWeight'), 'home Dla Ciebie – learningWeight');

const modal = readFileSync(join(ROOT, 'js/views/producerModal.js'), 'utf8');
assert(modal.includes('SHOW_DETAIL') && modal.includes('HIDE_DETAIL'), 'modal emituje detail events');

// Pure logic test via dynamic import of exported builders
// (browser globals stub)
globalThis.localStorage = {
    _d: {},
    getItem(k) { return this._d[k] ?? null; },
    setItem(k, v) { this._d[k] = String(v); },
    removeItem(k) { delete this._d[k]; }
};
globalThis.indexedDB = undefined;
globalThis.document = { addEventListener() {} };
globalThis.window = globalThis;
globalThis.console = console;

const modUrl = pathToFileURL(file).href;
const storageUrl = pathToFileURL(join(ROOT, 'js/presentation/learningEngineStorage.js')).href;
const storage = await import(storageUrl);
const {
    aggregateSignals,
    compressSignalsArray,
    trimSignalsToByteBudget,
    estimateSignalsBytes,
    planIdbCompression,
    MAX_IDB_BYTES
} = storage;

assert(MAX_IDB_BYTES === 10 * 1024 * 1024, 'limit 10 MB');

const routes = [
    { type: 'route', grid: '52.52,13.40', at: Date.now(), w: 1 },
    { type: 'route', grid: '52.52,13.40', at: Date.now() + 1, w: 1 },
    { type: 'route', grid: '52.53,13.41', at: Date.now() + 2, w: 1 }
];
const agg = aggregateSignals(routes);
assert(agg.length === 2, `agregacja route: 2 (got ${agg.length})`);
assert(agg.find((s) => s.grid === '52.52,13.40')?.aggregated === 2, 'route grid zliczone');

const oldAt = Date.now() - 8 * 24 * 60 * 60 * 1000;
const compressed = compressSignalsArray([
    { type: 'category', category: 'farmers', at: oldAt, w: 2 },
    { type: 'category', category: 'farmers', at: oldAt + 1, w: 3 },
    { type: 'search', query: 'chleb', at: Date.now(), w: 1 }
]);
assert(compressed.some((s) => s.compressed && s.category === 'farmers'), 'stare skompresowane');
assert(compressed.some((s) => s.query === 'chleb' && !s.compressed), 'świeże bez kompresji');

const plan = planIdbCompression([
    { id: 1, type: 'producer', producerId: 'a', at: oldAt, w: 1 },
    { id: 2, type: 'producer', producerId: 'b', at: Date.now(), w: 1 }
]);
assert(plan.deleteIds.includes(1), 'plan usuwa stary surowy');
assert(plan.toAdd.length === 1, 'plan dodaje agregat');

const bulky = Array.from({ length: 40 }, (_, i) => ({
    type: 'search',
    query: `q-${i}-${'x'.repeat(200)}`,
    at: Date.now() - i
}));
const trimmed = trimSignalsToByteBudget(bulky, 4096);
assert(trimmed.length < bulky.length, 'trim do budżetu bajtów');
assert(estimateSignalsBytes(trimmed) <= 4096, 'trim mieści się w limicie');

const mod = await import(modUrl);
const {
    buildModelFromSignals,
    computeAffinity,
    getLearningBoostForProducer,
    selectSignalsToKeep,
    isLearningEnabled,
    setLearningEnabled,
    recordLearningSignal,
    flushPendingSignals
} = mod;

assert(isLearningEnabled(), 'learning domyślnie włączony');
setLearningEnabled(false);
assert(!isLearningEnabled(), 'learning wyłączony');
assert(recordLearningSignal('category', { category: 'farmers' }) === null, 'record noop gdy off');
setLearningEnabled(true);
recordLearningSignal('category', { category: 'bakeries', w: 1 });
recordLearningSignal('category', { category: 'bakeries', w: 1 });
const flushed = flushPendingSignals();
assert(flushed.length === 1, `batch agreguje do 1 (got ${flushed.length})`);
assert(flushed[0]?.aggregated === 2, 'aggregated count w batch');

const now = Date.now();
const oldMs = 31 * 24 * 60 * 60 * 1000;
const pruneRows = [];
for (let i = 0; i < 1050; i += 1) {
    pruneRows.push({
        id: i + 1,
        type: 'category',
        at: i < 50 ? now - oldMs - i : now - i * 1000
    });
}
const pruneResult = selectSignalsToKeep(pruneRows, { maxRecords: 1000, maxAgeMs: 30 * 24 * 60 * 60 * 1000, now });
assert(pruneResult.keptCount === 1000, `prune limit 1000 (got ${pruneResult.keptCount})`);
assert(pruneResult.deleteIds.length === 50, `prune usuwa 50 (got ${pruneResult.deleteIds.length})`);
assert(pruneResult.deleteIds.includes(1), 'prune usuwa najstarsze po wieku');
assert(!pruneResult.keepIds.has(1), 'rekord >30 dni poza keep');

const model = buildModelFromSignals([
    { type: 'category', category: 'bakery', hour: 9, w: 3 },
    { type: 'category', category: 'bakery', hour: 9, w: 1 },
    { type: 'producer', producerId: 'p1', category: 'bakery', hour: 10, w: 2 },
    { type: 'search', query: 'chleb', hour: 10, w: 2 },
    { type: 'screen', view: 'home', ms: 12000, hour: 9 },
    { type: 'route', stops: ['p1', 'p2'], at: Date.now() }
], {
    viewed: [{ id: 'p1', category: 'bakery' }],
    products: [{ id: 'bread-1' }],
    purchased: [],
    searched: [{ id: 'chleb', query: 'chleb' }],
    routes: []
});

assert(model.categories.bakery > 0, 'kategorie zliczone');
assert(model.producers.p1 > 0, 'producenci zliczeni');
assert(model.searches.chleb > 0, 'wyszukiwania zliczone');
assert(model.affinity.topCategories[0]?.id === 'bakery', 'affinity top category');

writeModelForBoost(model);
function writeModelForBoost(m) {
    localStorage.setItem('rg_learning_model_v1', JSON.stringify(m));
}

const boost = getLearningBoostForProducer({
    id: 'p1',
    category: 'bakery',
    name: 'Piekarz',
    products: [{ id: 'bread-1', name: 'Chleb' }]
});
assert(boost > 0, `learning boost > 0 (got ${boost})`);

const aff = computeAffinity(model);
assert(Array.isArray(aff.peakHours), 'peakHours');

if (failed) {
    console.error(`\n${failed} failed`);
    process.exit(1);
}
console.log('\nLearning Engine smoke test OK');
