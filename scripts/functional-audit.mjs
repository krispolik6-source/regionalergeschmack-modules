/**
 * Audyt funkcjonalny – dane, i18n, moduły, HTTP.
 * Run: node scripts/functional-audit.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// Mock DOM przed importem i18n (ESM: ustawiamy przed dynamic import)
if (typeof globalThis.document === 'undefined') {
    globalThis.document = { documentElement: { lang: 'de' } };
}

const { loadAllData, resetProducersForTests } = await import('../js/data/dataService.js');
const { LANG_OPTIONS, normalizeBrowserLanguage } = await import('../js/translations.js');
const { t, setLanguage } = await import('../js/core/i18n.js');
const { filterProducersBySearch, searchGlobalResults } = await import('../js/presentation/searchFilter.js');
const { focusProducerMarker, replaceMarkers } = await import('../js/map/map.js');

const ROOT = process.cwd();
const passes = [];
const failures = [];

function ok(msg) { passes.push(msg); console.log(`✅ ${msg}`); }
function fail(msg) { failures.push(msg); console.error(`❌ ${msg}`); }

if (typeof filterProducersBySearch === 'function') ok('searchFilter.filterProducersBySearch');
else fail('searchFilter.filterProducersBySearch');

if (typeof searchGlobalResults === 'function') ok('searchFilter.searchGlobalResults');
else fail('searchFilter.searchGlobalResults');

if (typeof focusProducerMarker === 'function') ok('map.focusProducerMarker');
else fail('map.focusProducerMarker');

if (typeof replaceMarkers === 'function') ok('map.replaceMarkers');
else fail('map.replaceMarkers');

if (LANG_OPTIONS.length === 36) ok(`Języki: ${LANG_OPTIONS.length}`);
else fail(`Oczekiwano 36 języków, jest ${LANG_OPTIONS.length}`);

setLanguage('pl');
if (t('nav.map') === 'Mapa') ok('Tłumaczenie PL nav.map');
else fail(`Tłumaczenie PL: ${t('nav.map')}`);

setLanguage('de');
if (t('nav.map') === 'Karte') ok('Tłumaczenie DE nav.map');
else fail(`Tłumaczenie DE: ${t('nav.map')}`);

for (const code of ['pl', 'de', 'en', 'ru', 'tr']) {
    const norm = normalizeBrowserLanguage(`${code}-${code.toUpperCase()}`);
    if (norm === code) ok(`normalizeBrowserLanguage ${code}`);
    else fail(`normalize ${code} → ${norm}`);
}

resetProducersForTests();
const lat = 52.14;
const lng = 8.04;
try {
    const loaded = await loadAllData(lat, lng, { radiusKm: 10, forceRefresh: true });
    if (loaded.producers.length > 0) {
        ok(`loadAllData: ${loaded.producers.length} producentów (${loaded.source})`);

        const filtered = filterProducersBySearch(loaded.producers, 'bäck', t);
        ok(`Wyszukiwanie: ${filtered.length} wyników dla "bäck"`);

        const breadEn = filterProducersBySearch(loaded.producers, 'bread', t);
        if (breadEn.length > 0) ok(`Wyszukiwanie EN: ${breadEn.length} wyników dla "bread"`);
        else fail('Wyszukiwanie EN: 0 wyników dla "bread"');

        const chlebPl = filterProducersBySearch(loaded.producers, 'chleb', t);
        if (chlebPl.length > 0) ok(`Wyszukiwanie PL: ${chlebPl.length} wyników dla "chleb"`);
        else fail('Wyszukiwanie PL: 0 wyników dla "chleb"');

        const global = searchGlobalResults(loaded.producers, 'restaurant', t);
        ok(`searchGlobalResults: ${global.items.length} pozycji`);
    } else {
        console.log('⚠️  Brak producentów (API/cache) – pominięto testy wyszukiwania danych');
    }

    setLanguage('pl');
    if (t('search.searching') === 'Szukanie...') ok('Tłumaczenie PL search.searching');
    else fail(`search.searching PL: ${t('search.searching')}`);
} catch (e) {
    fail(`Dane: ${e.message}`);
}

const views = ['home', 'map', 'cart', 'favorites', 'profile', 'premium'];
for (const v of views) {
    const path = join(ROOT, 'js', 'views', `${v}.js`);
    if (!existsSync(path)) fail(`Brak widoku: ${v}.js`);
    else {
        const src = readFileSync(path, 'utf8');
        const renderName = `render${v.charAt(0).toUpperCase()}${v.slice(1)}`;
        if (new RegExp(`export\\s+(?:const|function)\\s+${renderName}`).test(src)) {
            ok(`Widok ${v}: export ${renderName}`);
        } else {
            fail(`Widok ${v}: brak export ${renderName}`);
        }
    }
}

const nav = readFileSync(join(ROOT, 'js', 'controllers', 'navigation.js'), 'utf8');
for (const v of views) {
    if (nav.includes(`${v}:`)) ok(`Navigation: widok ${v}`);
    else fail(`Navigation: brak ${v}`);
}

const fav = readFileSync(join(ROOT, 'js', 'views', 'favorites.js'), 'utf8');
const favStorePath = join(ROOT, 'js', 'core', 'favoritesStore.js');
let favStore = '';
try {
    favStore = readFileSync(favStorePath, 'utf8');
} catch {
    favStore = '';
}
if (
    fav.includes('addFavorite')
    && (
        fav.includes('localStorage')
        || (fav.includes('favoritesStore') && favStore.includes('localStorage'))
    )
) {
    ok('Ulubione: localStorage API');
} else {
    fail('Ulubione: brak API');
}

const cart = readFileSync(join(ROOT, 'js', 'views', 'cart.js'), 'utf8');
if (cart.includes('localStorage') || cart.includes('getCart')) ok('Koszyk: storage API');
else fail('Koszyk: brak API');

const reviews = readFileSync(join(ROOT, 'js', 'data', 'reviews.js'), 'utf8');
if (reviews.includes('getReviews') && reviews.includes('addReview')) ok('Opinie: getReviews + addReview');
else fail('Opinie: brak API');

const settings = readFileSync(join(ROOT, 'js', 'core', 'settings.js'), 'utf8');
if (settings.includes('setDarkMode') && settings.includes('dark-mode')) ok('Tryb nocny: setDarkMode');
else fail('Tryb nocny: brak implementacji');

const sideMenu = readFileSync(join(ROOT, 'js', 'core', 'sideMenu.js'), 'utf8');
const indexHtml = readFileSync(join(ROOT, 'index.html'), 'utf8');
const sideSections = ['terms', 'privacy', 'about', 'guide', 'download', 'contact', 'qr', 'cooperation', 'report-bug', 'feedback', 'test-guide', 'share-app'];
for (const s of sideSections) {
    if (sideMenu.includes(s) || indexHtml.includes(`data-side-menu-view="${s}"`)) ok(`SideMenu: sekcja ${s}`);
    else fail(`SideMenu: brak ${s}`);
}
if (indexHtml.includes('userFeedbackForm') && indexHtml.includes('data-side-menu-action="feedback"')) {
    ok('SideMenu: formularz opinii');
} else {
    fail('SideMenu: brak formularza opinii');
}
if (indexHtml.includes('admirable-cascaron-c76940.netlify.app')) {
    ok('SideMenu: link Netlify do udostępnienia');
} else {
    fail('SideMenu: brak linku Netlify');
}
if (indexHtml.includes('data-i18n-about') && sideMenu.includes('aboutLabel')) ok('SideMenu: O aplikacji – i18n');
else fail('SideMenu: brak i18n sekcji O aplikacji');
if (indexHtml.includes('sideMenuQrImage') && sideMenu.includes('sideMenuQrImage') && !indexHtml.includes('sideMenuAboutQrImage')) {
    ok('SideMenu: QR (osobna sekcja, bez duplikatu w O aplikacji)');
} else {
    fail('SideMenu: brak QR lub duplikat w O aplikacji');
}
if (sideMenu.includes('mapControlsDrag') || readFileSync(join(ROOT, 'js', 'views', 'map.js'), 'utf8').includes('initMapControlsDrag')) ok('Mapa: przeciąganie kontrolek');
else fail('Mapa: brak initMapControlsDrag');

const authPath = join(ROOT, 'js', 'auth', 'auth.js');
if (existsSync(authPath)) {
    const authSrc = readFileSync(authPath, 'utf8');
    if (authSrc.includes('register') && authSrc.includes('logout') && authSrc.includes('wrongAccountType')) ok('Auth: register/login/logout API');
    else fail('Auth: niekompletne API');
    if (authSrc.includes('categoriesRequired')) ok('Auth: walidacja kategorii producenta');
    else fail('Auth: brak walidacji kategorii');
}

const profileSrc = readFileSync(join(ROOT, 'js', 'views', 'profile.js'), 'utf8');
if (profileSrc.includes('renderClientPanel') && profileSrc.includes('renderProducerPanel')) ok('Profil: panele klienta i producenta');
else fail('Profil: brak paneli po logowaniu');

try {
    const res = await fetch('http://127.0.0.1:3456/');
    if (res.ok) ok('HTTP: index.html 200');
    const js = await fetch('http://127.0.0.1:3456/js/app.js?v=429');
    if (js.ok) ok('HTTP: app.js dostępny');
    const mapMod = await fetch('http://127.0.0.1:3456/js/map/map.js');
    const mapTxt = await mapMod.text();
    if (mapTxt.includes('focusProducerMarker')) ok('HTTP: map.js zawiera focusProducerMarker');
    else fail('HTTP: map.js bez focusProducerMarker');
} catch (_) {
    console.log('ℹ️  Serwer nie działa – pominięto testy HTTP');
}

console.log('\n--- Podsumowanie funkcjonalne ---');
console.log(`OK: ${passes.length} | Błędy: ${failures.length}`);
if (failures.length) {
    failures.forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
}
