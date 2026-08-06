/**
 * Release screen verification – static wiring + render smoke (Node, no network).
 * Run: node scripts/test-screens-release.mjs
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function ok(cond, msg) {
    if (!cond) { failed += 1; console.error('FAIL', msg); }
    else console.log('OK', msg);
}

const index = readFileSync(join(ROOT, 'index.html'), 'utf8');
const nav = readFileSync(join(ROOT, 'js/controllers/navigation.js'), 'utf8');
const sideMenu = readFileSync(join(ROOT, 'js/core/sideMenu.js'), 'utf8');
const app = readFileSync(join(ROOT, 'js/app.js'), 'utf8');

// Bottom nav screens
for (const view of ['home', 'map', 'search', 'favorites', 'profile']) {
    ok(index.includes(`data-view="${view}"`), `Bottom nav: ${view}`);
    ok(nav.includes(`'${view === 'search' ? 'home' : view}'`) || nav.includes(`view === '${view}'`), `Navigation: ${view} wired`);
}

// Side menu + cart/premium
ok(sideMenu.includes("cart: 'cart'") && sideMenu.includes("premium: 'premium'"), 'Side menu: cart + premium actions');
ok(nav.includes("'cart'") && nav.includes("'premium'"), 'Navigation: cart + premium views');
ok(index.includes('id="sideMenu"') || index.includes('side-menu'), 'Side menu: DOM shell');

// Settings (in profile)
const profile = readFileSync(join(ROOT, 'js/views/profile.js'), 'utf8');
ok(profile.includes('renderSettingsSection'), 'Profil/Ustawienia: sekcja ustawień w profile.js');
ok(index.includes('headerSearchInput') || index.includes('type="search"'), 'Wyszukiwanie: input w headerze');

// Categories → map
const home = readFileSync(join(ROOT, 'js/views/home.js'), 'utf8');
ok(home.includes('navigateToCategory') || app.includes('navigateToCategory'), 'Kategorie: navigateToCategory');
ok(home.includes('home-categories') || home.includes('CATEGORY_IDS'), 'Kategorie: siatka na Home');

// Producer modal in index or dynamic
ok(
    index.includes('producerModal') || readFileSync(join(ROOT, 'js/views/producerModal.js'), 'utf8').includes('ensureModal'),
    'Modal producenta: shell DOM'
);

// View renderers exist
for (const [view, file] of [
    ['home', 'js/views/home.js'],
    ['map', 'js/views/map.js'],
    ['favorites', 'js/views/favorites.js'],
    ['cart', 'js/views/cart.js'],
    ['premium', 'js/views/premium.js'],
    ['profile', 'js/views/profile.js']
]) {
    const src = readFileSync(join(ROOT, file), 'utf8');
    ok(src.includes('export function render'), `${view}: export render*`);
    ok(nav.includes(`'${view}'`), `Navigation imports ${view}`);
}

// release-cleanup modal visibility
const rc = readFileSync(join(ROOT, 'css/release-cleanup.css'), 'utf8');
ok(rc.includes('.producer-modal') && rc.includes('producer-products-section'), 'CSS: modal sections visible');

console.log(failed ? `\nRESULT FAIL (${failed})` : '\nRESULT PASS');
process.exit(failed ? 1 : 0);
