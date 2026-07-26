/**
 * Smoke B2/B3 – jedno źródło prawdy ulubionych (favoritesStore)
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

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

const storePath = join(ROOT, 'js/core/favoritesStore.js');
const storeUrl = `file://${storePath.replace(/\\/g, '/')}`;

const mem = {};
globalThis.localStorage = {
    getItem(k) { return mem[k] ?? null; },
    setItem(k, v) { mem[k] = String(v); },
    removeItem(k) { delete mem[k]; },
    key(i) { return Object.keys(mem)[i] ?? null; },
    get length() { return Object.keys(mem).length; }
};
Object.defineProperty(globalThis.localStorage, 'keys', {
    value: () => Object.keys(mem)
});
globalThis.localStorage.constructor = { name: 'Storage' };
// Polyfill Object.keys(localStorage) via collectFavoriteStorageKeys using Object.keys(localStorage)
const origKeys = Object.keys;
Object.keys = function (obj) {
    if (obj === globalThis.localStorage) return origKeys(mem);
    return origKeys(obj);
};

const store = await import(`${storeUrl}?t=${Date.now()}`);
const {
    syncFavoritesOnStartup,
    getFavoriteIds,
    setFavoriteIdsRaw,
    addFavoriteId,
    removeFavoriteId,
    isFavorite,
    FAVORITES_STORAGE_KEY_BASE
} = store;

assert(FAVORITES_STORAGE_KEY_BASE === 'regionalny_smak_favorites', 'kanoniczny klucz');

mem['rg_favorites'] = JSON.stringify(['legacy-a', 'legacy-b']);
mem['regionalny_smak_favorites'] = JSON.stringify(['guest-1']);

const sync1 = syncFavoritesOnStartup();
assert(sync1.count === 3, `sync scala legacy (got ${sync1.count})`);
assert(getFavoriteIds().includes('legacy-a'), 'legacy-a w store');
assert(getFavoriteIds().includes('guest-1'), 'guest-1 zachowany');
assert(mem['rg_favorites'] == null, 'legacy rg_favorites usunięty');

addFavoriteId('new-x');
assert(isFavorite('new-x'), 'addFavoriteId');
removeFavoriteId('legacy-b');
assert(!isFavorite('legacy-b'), 'removeFavoriteId');

setFavoriteIdsRaw(['only-one']);
assert(getFavoriteIds().length === 1 && getFavoriteIds()[0] === 'only-one', 'setFavoriteIdsRaw dedupe');

const smart = readFileSync(join(ROOT, 'js/presentation/smartRecommend.js'), 'utf8');
const surprise = readFileSync(join(ROOT, 'js/presentation/surpriseMe.js'), 'utf8');
const returnMagic = readFileSync(join(ROOT, 'js/presentation/returnMagic.js'), 'utf8');
const mapCore = readFileSync(join(ROOT, 'js/map/map.js'), 'utf8');
const app = readFileSync(join(ROOT, 'js/app.js'), 'utf8');

assert(smart.includes("from '../core/favoritesStore.js'"), 'smartRecommend → store');
assert(!smart.includes('readFavoriteIdsSafe'), 'smartRecommend bez scan LS');
assert(surprise.includes("from '../core/favoritesStore.js'"), 'surpriseMe → store');
assert(!surprise.includes('views/favorites'), 'surpriseMe bez views');
assert(returnMagic.includes("from '../core/favoritesStore.js'"), 'returnMagic → store');
assert(mapCore.includes("from '../core/favoritesStore.js'"), 'map core → store');
assert(app.includes('syncFavoritesOnStartup'), 'app sync przy starcie');

console.log(failed ? `\n${failed} failed` : '\nFavorites store checks passed.');
process.exit(failed ? 1 : 0);
