/**
 * Audit integracji Living Region Engine ↔ Home (bez przeglądarki).
 * Sprawdza: flaga ON/OFF, brak HTML w Engine, brak CSS w Engine,
 * mapowanie Home, importy, pamięć cache, regresja starego pulse.
 */
import assert from 'assert';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const mem = new Map();
globalThis.localStorage = {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => { mem.set(k, String(v)); },
    removeItem: (k) => { mem.delete(k); }
};

const findings = [];
function ok(id, msg) { findings.push({ sev: 'PASS', id, msg }); }
function warn(id, msg) { findings.push({ sev: 'WARNING', id, msg }); }
function fail(id, msg) { findings.push({ sev: 'FAIL', id, msg }); }

// --- 1) Engine: zero views / HTML / CSS ---
function walkJs(dir, out = []) {
    for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        const st = statSync(p);
        if (st.isDirectory()) walkJs(p, out);
        else if (name.endsWith('.js')) out.push(p);
    }
    return out;
}

const engineFiles = walkJs(join(root, 'js/livingRegion'));
let engineBad = 0;
for (const file of engineFiles) {
    const src = readFileSync(file, 'utf8');
    if (/from ['"].*views\//.test(src)) {
        fail('engine-views', `${file} importuje views/`);
        engineBad += 1;
    }
    if (/innerHTML|document\.|querySelector|classList/.test(src)) {
        fail('engine-dom', `${file} używa DOM`);
        engineBad += 1;
    }
    if (/\.css['"]|stylesheet/.test(src)) {
        fail('engine-css', `${file} referencja CSS`);
        engineBad += 1;
    }
}
if (!engineBad) ok('engine-pure', `Engine czysty (${engineFiles.length} plików) — brak views/DOM/CSS`);

// --- 2) Home: te same klasy, fallback ---
const homeSrc = readFileSync(join(root, 'js/views/home.js'), 'utf8');
assert.ok(homeSrc.includes('isLivingRegionEnabled'), 'Home importuje flagę Engine');
assert.ok(homeSrc.includes('getTodayHighlights'), 'Home woła Engine');
assert.ok(homeSrc.includes('getLivingRegionPulse'), 'Home zachowuje stary pulse');
assert.ok(homeSrc.includes('home-living-region-item'), 'ten sam markup klasy');
assert.ok(!homeSrc.includes('living-region-engine-panel'), 'brak nowego layoutu');
ok('home-markup', 'Home: istniejące klasy + fallback pulse');

// --- 3) CSS living-region nietknięty przez Engine (brak nowych plików CSS LR) ---
const cssLiving = readFileSync(join(root, 'css/living-region.css'), 'utf8');
assert.ok(cssLiving.includes('.home-living-region'));
assert.ok(cssLiving.includes('body.legacy-ios9') || cssLiving.includes('.home-living-region-item'));
ok('css-living', 'css/living-region.css obecny (sekcja bez przebudowy)');

const uxPolish = readFileSync(join(root, 'css/ux-polish-1.css'), 'utf8');
assert.ok(uxPolish.includes('body.dark-mode .home-living-region'));
assert.ok(uxPolish.includes('body.dark-mode .home-living-region-item'));
ok('css-dark', 'Dark mode reguły dla .home-living-region* obecne');

// --- 4) Runtime Engine ON/OFF + cache pamięć ---
const {
    initLivingRegion,
    isLivingRegionEnabled,
    getTodayHighlights,
    invalidateLivingRegionCache
} = await import('../js/livingRegion/livingRegion.js');
const { getLivingRegionPulse } = await import('../js/presentation/livingRegion.js');

const producers = [
    {
        id: 'a1',
        name: 'Hof A',
        category: 'farmer',
        lat: 52.27,
        lng: 8.05,
        products: [{ id: 'apples', name: 'Äpfel' }],
        opening_hours: 'Mo-Su 08:00-20:00'
    },
    {
        id: 'b1',
        name: 'Bäckerei B',
        category: 'bakery',
        lat: 52.271,
        lng: 8.051,
        products: [{ id: 'bread', name: 'Brot' }],
        promo: 'Frisch'
    }
];
const ctx = {
    now: new Date('2026-07-26T11:00:00'),
    producers,
    user: { lat: 52.27, lng: 8.05 },
    radiusKm: 15,
    favoriteIds: ['a1'],
    recentlyViewedIds: ['b1'],
    favoriteCategories: ['farmer']
};

mem.clear();
initLivingRegion({ enabled: true });
invalidateLivingRegionCache();
assert.strictEqual(isLivingRegionEnabled(), true);

const t0 = Date.now();
const h1 = getTodayHighlights(ctx);
const t1 = Date.now();
const h2 = getTodayHighlights(ctx);
const t2 = Date.now();

assert.ok(h1.items.length >= 1, 'ON: highlights niepuste');
assert.strictEqual(h2.cache, 'hit', 'drugie wywołanie = cache hit');
const missMs = t1 - t0;
const hitMs = t2 - t1;
ok('perf-cache', `cache miss ~${missMs}ms, hit ~${hitMs}ms`);

const cacheRaw = localStorage.getItem('rg_living_region_day_v1');
assert.ok(cacheRaw && cacheRaw.length < 50_000, 'cache dnia < 50KB');
ok('mem-cache', `rozmiar cache dnia: ${cacheRaw.length} B`);

const blob = JSON.stringify(h1);
assert.ok(!blob.includes('<'), 'Engine output bez HTML');
assert.ok(!blob.includes('home-living'), 'Engine nie zna klas Home');
ok('data-only', 'Highlights = czyste dane');

// OFF → Home powinien iść w stary pulse (symulacja ścieżki)
initLivingRegion({ enabled: false });
assert.strictEqual(isLivingRegionEnabled(), false);
const off = getTodayHighlights(ctx);
assert.strictEqual(off.enabled, false);
assert.strictEqual(off.items.length, 0);
const pulse = getLivingRegionPulse(ctx.now);
assert.ok(pulse.items.length >= 3, 'stary pulse nadal działa gdy Engine OFF');
ok('fallback-off', `OFF: Engine pusty, pulse=${pulse.items.length} pozycji`);

// --- 5) i18n engine keys ---
const { LIVING_REGION_I18N } = await import('../js/translations-living-region.js');
for (const lang of ['de', 'en', 'pl']) {
    const keys = [
        'engineProducerOfDay',
        'engineSeasonal',
        'engineNewProducers',
        'engineOpenNow',
        'engineVisitDelta'
    ];
    for (const k of keys) {
        assert.ok(LIVING_REGION_I18N[lang]?.livingRegion?.[k], `${lang}.${k}`);
    }
}
ok('i18n-engine', 'DE/EN/PL klucze engine* obecne');

// --- 6) Favorites store bez regresji klucza ---
const { FAVORITES_STORAGE_KEY_BASE, getFavoriteIds, setFavoriteIdsRaw } = await import('../js/core/favoritesStore.js');
assert.strictEqual(FAVORITES_STORAGE_KEY_BASE, 'regionalny_smak_favorites');
setFavoriteIdsRaw(['x1', 'x2']);
assert.deepStrictEqual(getFavoriteIds(), ['x1', 'x2']);
ok('favorites-store', 'favoritesStore: ten sam klucz bazowy');

// Summary
const pass = findings.filter((f) => f.sev === 'PASS').length;
const warning = findings.filter((f) => f.sev === 'WARNING').length;
const failN = findings.filter((f) => f.sev === 'FAIL').length;
const verdict = failN ? 'FAIL' : warning ? 'WARNING' : 'PASS';

console.log(JSON.stringify({ verdict, pass, warning, fail: failN, findings }, null, 2));
if (failN) process.exit(1);
