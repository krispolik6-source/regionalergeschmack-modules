/**
 * Checklista premiery – Home · Mapa · Taste Diary · Ulubione · Koszyk · Premium + link
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function assert(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error(`FAIL ${msg}`);
    } else {
        console.log(`OK   ${msg}`);
    }
}

const PREMIERE_URL = 'https://admirable-cascaron-c76940.netlify.app';

const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
const nav = readFileSync(join(ROOT, 'js/controllers/navigation.js'), 'utf8');
const side = readFileSync(join(ROOT, 'js/core/sideMenu.js'), 'utf8');

console.log('=== 1. HOME ===');
assert(existsSync(join(ROOT, 'js/views/home.js')), 'Home view file');
assert(nav.includes('home: renderHome'), 'nav → Home');
assert(/data-view="home"/.test(html), 'bottom nav Home');

console.log('=== 2. MAPA ===');
assert(existsSync(join(ROOT, 'js/views/map.js')), 'Map view file');
assert(existsSync(join(ROOT, 'js/map/map.js')), 'Map core file');
assert(nav.includes('map: renderMapLazy') || nav.includes('renderMapLazy'), 'nav → Map (lazy)');
assert(/data-view="map"/.test(html), 'bottom nav Map');
assert(
    existsSync(join(ROOT, 'js/core/mapLoader.js'))
    && readFileSync(join(ROOT, 'js/core/mapLoader.js'), 'utf8').includes('ensureLeafletLoaded'),
    'Leaflet lazy via mapLoader'
);

console.log('=== 3. TASTE DIARY ===');
assert(existsSync(join(ROOT, 'js/core/tasteDiary.js')), 'Taste Diary module');
assert(html.includes('data-side-menu-action="taste-diary"'), 'menu Taste Diary');
assert(html.includes('data-side-menu-view="taste-diary"'), 'Taste Diary panel');
assert(html.includes('tasteDiaryList'), 'Taste Diary list container');
assert(side.includes('taste-diary') || side.includes('tasteDiary'), 'sideMenu handles diary');

console.log('=== 4. ULUBIONE ===');
assert(existsSync(join(ROOT, 'js/views/favorites.js')), 'Favorites view');
assert(nav.includes('favorites: renderFavorites'), 'nav → Favorites');
assert(/data-view="favorites"/.test(html), 'bottom nav Favorites');
assert(html.includes('data-side-menu-action="favorites"'), 'menu Favorites');

console.log('=== 5. KOSZYK ===');
assert(existsSync(join(ROOT, 'js/views/cart.js')), 'Cart view');
assert(nav.includes('cart: renderCart'), 'nav → Cart');
assert(html.includes('data-side-menu-action="cart"'), 'menu Cart');
assert(side.includes("'cart'") || side.includes('"cart"') || side.includes('case \'cart\''), 'sideMenu opens cart');

console.log('=== 6. PREMIUM ===');
assert(existsSync(join(ROOT, 'js/views/premium.js')), 'Premium view');
assert(existsSync(join(ROOT, 'js/core/premiumService.js')), 'Premium service');
assert(nav.includes('premium: renderPremium'), 'nav → Premium');
assert(html.includes('id="headerPremiumBtn"'), 'header Premium button');
assert(html.includes('data-side-menu-action="premium"'), 'menu Premium');

console.log('=== LINK + SHARE ===');
const { APP_DOWNLOAD_URL } = await import(pathToFileURL(join(ROOT, 'js/config.js')).href);
assert(APP_DOWNLOAD_URL === PREMIERE_URL, 'APP_DOWNLOAD_URL = premiere link');

const landing = existsSync(join(ROOT, 'landing.html'))
    ? readFileSync(join(ROOT, 'landing.html'), 'utf8')
    : '';
assert(landing.includes('admirable-cascaron-c76940.netlify.app'), 'landing has premiere URL');

const share = join(ROOT, 'docs/premiere/share-copy.txt');
assert(existsSync(share), 'share copy prepared');
const shareText = readFileSync(share, 'utf8');
assert(shareText.includes(PREMIERE_URL), 'share copy has link');
assert(shareText.includes('Regionaler Geschmack'), 'share copy has brand');

console.log(`\nLink: ${PREMIERE_URL}`);

if (failed) {
    console.error(`\n${failed} failure(s)`);
    process.exit(1);
}
console.log('\nPremiere checklist OK');
