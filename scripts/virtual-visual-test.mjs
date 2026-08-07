/**
 * Wirtualny test wizualny + funkcjonalny – Regionaler Geschmack
 * Run: node scripts/virtual-visual-test.mjs
 * Opcjonalnie z serwerem: npm start & AUDIT_BASE_URL=http://127.0.0.1:3456 node scripts/virtual-visual-test.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createServer } from 'http';
import { createReadStream, existsSync, statSync } from 'fs';
import { extname, join } from 'path';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let failures = 0;
const fixed = [];
const tested = [];

function ok(msg) {
    tested.push({ status: 'ok', msg });
    console.log(`✅ ${msg}`);
}
function fail(msg) {
    failures += 1;
    tested.push({ status: 'fail', msg });
    console.error(`❌ ${msg}`);
}
function info(msg) {
    console.log(`ℹ️  ${msg}`);
}

function read(rel) {
    return fs.readFileSync(path.join(root, rel), 'utf8');
}

function exists(rel) {
    return fs.existsSync(path.join(root, rel));
}

// ─── 1. NAGŁÓWEK ─────────────────────────────────────────────
console.log('\n=== 1. NAGŁÓWEK ===');
const index = read('index.html');
const style = read('css/style.css');

const hasExpandableHeaderBrand = index.includes('header-brand-icon') && index.includes('header-brand-layer');
const hasLegacyHeaderBrand = index.includes('header-brand-mark') && /header-brand-mark[^>]*logo-master\.svg/.test(index);
if (hasExpandableHeaderBrand || hasLegacyHeaderBrand) {
    ok('Nagłówek: ikona marki (expandable SVG lub logo-master)');
} else fail('Nagłówek: brak ikony marki');

if (hasExpandableHeaderBrand) {
    ok('Nagłówek: jedna ikona marki (expandable SVG)');
} else if ((index.match(/header-brand-mark/g) || []).length === 1) {
    ok('Nagłówek: jedna ikona marki (legacy img)');
} else {
    fail('Nagłówek: zduplikowana lub brakująca ikona marki');
}

if (index.includes('side-menu-brand-mark') && /side-menu-brand-mark[^>]*logo-master\.svg/.test(index) && index.includes('sideMenuTitleText')) {
    ok('Menu ☰: ikona aplikacji logo-master.svg');
} else fail('Menu ☰: brak logo-master.svg w tytule');

if (/<h1>\s*Regionaler Geschmack\s*<\/h1>/.test(index)) {
    ok('Nagłówek: tytuł „Regionaler Geschmack”');
} else fail('Nagłówek: brak tytułu');

if (index.includes('id="languageSwitcherBtn"') && index.includes('id="darkModeToggleBtn"')) {
    ok('Nagłówek: przełączniki język + tryb nocny w DOM');
} else fail('Nagłówek: brak language/dark toggle');

const settings = read('js/core/settings.js');
if (settings.includes('initShellSettings') && settings.includes('applyDarkMode') && settings.includes('setLanguage')) {
    ok('Nagłówek: settings.js – dark mode + język');
} else fail('Nagłówek: settings.js niekompletny');

if (style.includes('.header-brand-icon') || style.includes('.header-brand-mark')) {
    ok('Nagłówek/menu: style CSS dla logo marki');
} else fail('Nagłówek/menu: brak stylów logo marki');

// ─── 2. KATEGORIE ────────────────────────────────────────────
console.log('\n=== 2. KATEGORIE ===');
const home = read('js/views/home.js');
const nav = read('js/controllers/navigation.js');
const app = read('js/app.js');

if (home.includes("t('home.allCategories')") && home.includes('home-categories')) {
    ok('Kategorie: przycisk Wszystkie kategorie (home.allCategories)');
} else fail('Kategorie: brak przycisku allCategories');

if (home.includes("t('home.categoryCount')") && home.includes('category-count')) {
    ok('Kategorie: liczniki (categoryCount)');
} else fail('Kategorie: brak liczników');

if (home.includes('CATEGORY_IDS') && home.includes("'farmers'") && home.includes("'fastFood'")) {
    ok('Kategorie: siatka ID (farmers…fastFood)');
} else fail('Kategorie: niepełna lista ID');

if (app.includes('navigateToCategory') && nav.includes('navigateToCategory') && nav.includes('options.filter')) {
    ok('Kategorie: klik → navigateToCategory + filter');
} else fail('Kategorie: brak ścieżki filtra do mapy');

const translations = read('js/translations.js');
if (translations.includes('categoryCount:') || translations.includes("categoryCount:")) {
    ok('Kategorie: tłumaczenie categoryCount');
} else fail('Kategorie: brak tłumaczenia categoryCount');

// ─── 3. PWA / IKONY ──────────────────────────────────────────
console.log('\n=== 3. IKONY PWA ===');
const manifest = JSON.parse(read('manifest.json'));
const sw = read('sw.js');

if (manifest.name === 'Regionaler Geschmack' && Array.isArray(manifest.icons) && manifest.icons.length >= 10) {
    ok('PWA: manifest.json poprawny (name + ikony)');
} else fail('PWA: manifest niekompletny');

const requiredIconFiles = [
    'icon-48.png', 'icon-192.png', 'icon-512.png', 'maskable-512.png',
    'apple-touch-icon.png', 'favicon.ico', 'logo-master.svg'
];
for (const file of requiredIconFiles) {
    if (exists(`assets/icons/${file}`)) ok(`PWA: plik assets/icons/${file}`);
    else fail(`PWA: brak ${file}`);
}

const pwaMod = read('js/core/pwaVersion.js');
const pwaVerMatch = pwaMod.match(/export const PWA_VERSION = '(\d+)'/);
const pwaVer = pwaVerMatch?.[1] || '';
if (!pwaVer) fail('PWA: brak PWA_VERSION w js/core/pwaVersion.js');
else ok(`PWA: canonical PWA_VERSION v${pwaVer}`);

const allIconsSynced = manifest.icons.every((i) => String(i.src).includes(`?v=${pwaVer}`));
if (allIconsSynced) ok(`PWA: ikony w manifest z ?v=${pwaVer}`);
else fail('PWA: niespójna wersja ikon w manifest');

if (index.includes(`manifest.json?v=${pwaVer}`) && index.includes(`serviceWorker.register('/sw.js?v=${pwaVer}')`)) {
    ok(`PWA: index rejestruje SW v${pwaVer} + manifest v${pwaVer}`);
} else fail('PWA: niespójna rejestracja SW/manifest w index');

if (sw.includes('importScripts') && sw.includes('pwaVersion.global.js')) {
    ok('PWA: sw.js importScripts pwaVersion.global.js');
} else fail('PWA: sw.js bez importScripts pwaVersion.global.js');

if (sw.includes('icon-192.png?v=${ICON_VERSION}')) {
    ok(`PWA: sw.js DEFAULT_ICON via ICON_VERSION`);
} else fail('PWA: sw.js wersje nieaktualne');

if (index.includes('favicon.ico') && index.includes('apple-touch-icon') && index.includes('icon-192.png')) {
    ok('PWA: index favicon.ico + apple-touch → icon-192');
} else fail('PWA: brak poprawnych linków favicon/apple-touch w index');

if (sw.includes('logo-master.svg')) ok('PWA: precache logo-master.svg');
else fail('PWA: brak logo-master w precache');

// ─── 4. MAPA / MODAL ─────────────────────────────────────────
console.log('\n=== 4. MAPA / MODAL ===');
const mapView = read('js/views/map.js');
const mapCore = read('js/map/map.js');
const modal = read('js/views/producerModal.js');

if (mapView.includes('replaceMarkers') && mapCore.includes('createProducerMarker') && mapCore.includes('producerId')) {
    ok('Mapa: markery z producerId');
} else fail('Mapa: brak producerId na markerze');

if (mapCore.includes("console.log('[Map] Marker kliknięty:") && mapView.includes('popupopen')) {
    ok('Mapa: click + popupopen zarejestrowane');
} else fail('Mapa: brak obsługi click/popupopen');

if (mapView.includes('[data-details-id]') && mapView.includes('openProducerModal')) {
    ok('Mapa: przycisk Szczegóły → openProducerModal');
} else fail('Mapa: brak ścieżki Szczegóły');

if (modal.includes('MODAL_CLOSE_GUARD_MS') && modal.includes('[Modal] Otwieranie:')) {
    ok('Modal: guard ghost-click + logi');
} else fail('Modal: brak guarda / logów');

const mapLoader = read('js/core/mapLoader.js');
const appMapVer = mapLoader.match(/MAP_MODULE_VERSION\s*=\s*(\d+)/)?.[1];
const navMapLazy = nav.includes('mapLoader') && nav.includes('renderMapLazy');
if (appMapVer && navMapLazy) {
    ok(`Mapa: lazy load map.js?v=${appMapVer} (mapLoader + navigation)`);
} else fail('Mapa: brak spójnego lazy load mapLoader');

if (mapView.includes("osmService.js?v=10")) {
    ok('Mapa: osmService?v=10 (zgodne z dataService)');
} else fail('Mapa: osmService wersja niezgodna');

// ─── 5. LOGIKA DANYCH (szybki import) ─────────────────────────
console.log('\n=== 5. DANE / FILTR ===');
try {
    const helpersUrl = pathToFileURL(path.join(root, 'js/data/producerHelpers.js')).href;
    const contentUrl = pathToFileURL(path.join(root, 'js/data/contentProducers.js')).href;
    const { filterProducersByCategory, countProducersByHomeCategory, normalizeProducerCategory } =
        await import(helpersUrl);
    const { CONTENT_PRODUCERS } = await import(contentUrl);

    if (normalizeProducerCategory('farmers') === 'farmer') ok('Dane: farmers → farmer');
    else fail('Dane: normalize farmers');

    if (Array.isArray(CONTENT_PRODUCERS) && CONTENT_PRODUCERS.length === 0) {
        ok('Dane: CONTENT_PRODUCERS pusta (tryb produkcyjny bez seed)');
    } else {
        fail(`Dane: CONTENT_PRODUCERS powinna być pusta, jest ${CONTENT_PRODUCERS.length}`);
    }

    const farmers = filterProducersByCategory(CONTENT_PRODUCERS, 'farmers');
    if (farmers.length === 0) ok('Dane: filter farmers na pustej tablicy = 0');
    else fail(`Dane: oczekiwano 0 farmers, jest ${farmers.length}`);

    const counts = countProducersByHomeCategory(CONTENT_PRODUCERS);
    if (counts.all === 0 && counts.farmers === 0 && counts.fastFood === 0) {
        ok('Dane: liczniki kategorii = 0 (brak seed demo)');
    } else {
        fail(`Dane: liczniki seed niezerowe – ${JSON.stringify(counts)}`);
    }
} catch (e) {
    fail(`Dane: import failed – ${e.message}`);
}

// ─── 6. HTTP (lokalny serwer tymczasowy) ──────────────────────
console.log('\n=== 6. HTTP (tymczasowy serwer) ===');
const MIME = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp'
};

function startTempServer(port = 8769) {
    return new Promise((resolve) => {
        const server = createServer((req, res) => {
            const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
            const filePath = join(root, urlPath === '/' ? 'index.html' : urlPath.replace(/^\//, ''));
            if (!existsSync(filePath) || !statSync(filePath).isFile()) {
                res.writeHead(404);
                res.end('not found');
                return;
            }
            res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
            createReadStream(filePath).pipe(res);
        });
        server.listen(port, '127.0.0.1', () => resolve({ server, port }));
    });
}

const { server, port } = await startTempServer();
const base = `http://127.0.0.1:${port}`;

async function httpOk(p) {
    const res = await fetch(`${base}${p}`);
    return res.ok;
}

try {
    if (await httpOk('/')) ok('HTTP: / → 200');
    else fail('HTTP: / nie działa');

    if (await httpOk('/manifest.json')) ok('HTTP: manifest.json');
    else fail('HTTP: manifest.json');

    if (await httpOk('/sw.js')) ok('HTTP: sw.js');
    else fail('HTTP: sw.js');

    if (await httpOk('/assets/icons/logo-master.svg')) ok('HTTP: logo-master.svg');
    else fail('HTTP: logo-master.svg');

    if (await httpOk('/assets/icons/icon-192.png')) ok('HTTP: icon-192.png');
    else fail('HTTP: icon-192.png');

    if (await httpOk('/assets/icons/icon-512.png')) ok('HTTP: icon-512.png');
    else fail('HTTP: icon-512.png');

    if (await httpOk('/js/app.js')) ok('HTTP: app.js');
    else fail('HTTP: app.js');

    if (await httpOk('/js/views/home.js')) ok('HTTP: home.js');
    else fail('HTTP: home.js');

    if (await httpOk('/js/views/map.js')) ok('HTTP: map.js');
    else fail('HTTP: map.js');

    if (await httpOk('/css/style.css')) ok('HTTP: style.css');
    else fail('HTTP: style.css');

    const htmlRes = await fetch(`${base}/`);
    const htmlBody = await htmlRes.text();
    const httpHasBrand = (htmlBody.includes('header-brand-icon') && htmlBody.includes('header-brand-layer'))
        || (htmlBody.includes('header-brand-mark') && htmlBody.includes('logo-master.svg'));
    if (httpHasBrand) {
        ok('HTTP HTML: nagłówek z ikoną marki');
    } else fail('HTTP HTML: brak ikony marki w odpowiedzi');
} finally {
    server.close();
}

// ─── PODSUMOWANIE ────────────────────────────────────────────
console.log(`\n=== WYNIK ===`);
console.log(`Przetestowano: ${tested.length}`);
console.log(`PASS: ${tested.filter((t) => t.status === 'ok').length}`);
console.log(`FAIL: ${failures}`);
if (fixed.length) {
    console.log('Naprawione w tej sesji:');
    fixed.forEach((f) => console.log(`  • ${f}`));
}
process.exit(failures ? 1 : 0);
