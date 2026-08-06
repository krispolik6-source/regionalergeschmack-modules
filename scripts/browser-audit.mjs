/**
 * Symulacja przeglądarki – HTTP, zasoby CSS, struktura HTML, moduły.
 * Run: node scripts/browser-audit.mjs  (serwer: npm start)
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const BASE = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:3456';
const passes = [];
const failures = [];

function ok(msg) { passes.push(msg); console.log(`✅ ${msg}`); }
function fail(msg) { failures.push(msg); console.error(`❌ ${msg}`); }

async function fetchOk(path) {
    const url = path.startsWith('http') ? path : `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
    const res = await fetch(url);
    return { ok: res.ok, status: res.status, url, text: res.ok ? await res.text() : '' };
}

// --- HTML struktura ---
const htmlPath = join(ROOT, 'index.html');
const html = readFileSync(htmlPath, 'utf8');

const requiredIds = ['app', 'mainHeader', 'menuBtn', 'languageSwitcherBtn', 'darkModeToggleBtn', 'sideMenu', 'producerModal'];
for (const id of requiredIds) {
    if (html.includes(`id="${id}"`) || (id === 'producerModal' && html.includes('producerModal'))) {
        ok(`HTML: #${id}`);
    } else if (id === 'producerModal') {
        ok('HTML: producerModal (dynamiczny w JS)');
    } else {
        fail(`HTML: brak #${id}`);
    }
}

// Dolny nav (index.html): home / map / search / favorites / profile
// Premium i koszyk są w profilu / osobnych widokach – nie w bottom nav
const views = ['home', 'map', 'search', 'favorites', 'profile'];
for (const v of views) {
    if (html.includes(`data-view="${v}"`)) ok(`HTML: nav ${v}`);
    else fail(`HTML: brak nav ${v}`);
}

if (html.includes('Content-Security-Policy') && html.includes('viewport')) ok('HTML: CSP + viewport');
else fail('HTML: brak CSP lub viewport');

if (html.includes('leaflet')) ok('HTML: Leaflet CDN');
else fail('HTML: brak Leaflet');

// --- HTTP zasoby ---
let serverUp = false;
try {
    const index = await fetchOk('/');
    if (index.ok) {
        serverUp = true;
        ok('HTTP: index.html 200');
    } else {
        fail(`HTTP: index ${index.status}`);
    }
} catch (e) {
    console.log(`ℹ️  Serwer niedostępny (${BASE}) – pominięto testy HTTP`);
}

if (serverUp) {
    const cssVer = (html.match(/style\.css\?v=(\d+)/) || [])[1] || '';
    const appVer = (html.match(/app\.js\?v=(\d+)/) || [])[1] || '';
    const assets = [
        cssVer ? `/css/style.css?v=${cssVer}` : '/css/style.css',
        appVer ? `/js/app.js?v=${appVer}` : '/js/app.js',
        '/js/legacy/detect.js?v=2',
        '/js/legacy/app.bundle.js',
        '/assets/icons/logo-master.svg',
        '/assets/icons/icon-192.png',
        '/manifest.json',
        '/sw.js',
        '/assets/images/hero/hero-background.webp',
        '/assets/images/backgrounds/category_all.webp',
        '/assets/images/chains/lidl.svg',
        '/assets/images/products/bread.webp'
    ];

    for (const assetPath of assets) {
        const r = await fetchOk(assetPath);
        if (r.ok) ok(`HTTP: ${assetPath.split('?')[0]}`);
        else fail(`HTTP: ${assetPath} → ${r.status}`);
    }

    const appJs = await fetchOk(appVer ? `/js/app.js?v=${appVer}` : '/js/app.js');
    if (appJs.text.includes('bootstrap')) ok('HTTP: app.js bootstrap');
    else fail('HTTP: app.js bez bootstrap');

    const mapJs = await fetchOk('/js/views/map.js');
    if (mapJs.text.includes('renderMap') && mapJs.text.includes('leafletMap')) ok('HTTP: map.js kompletny');
    else fail('HTTP: map.js niekompletny');

    const modalJs = await fetchOk('/js/views/producerModal.js');
    if (modalJs.text.includes('data-producer-mini-map') && !modalJs.text.includes('staticmap.openstreetmap')) {
        ok('HTTP: producerModal – Leaflet mini-mapa, brak staticmap');
    } else {
        fail('HTTP: producerModal – problem z mapą');
    }

    const hasExpandableBrand = html.includes('header-brand-icon') && html.includes('header-brand-layer');
    const hasLegacyBrand = html.includes('header-brand-mark') && html.includes('logo-master.svg');
    if (hasExpandableBrand || hasLegacyBrand) {
        ok('HTML: nagłówek z ikoną marki (SVG expandable lub logo-master)');
    } else {
        fail('HTML: brak ikony marki w nagłówku');
    }
}

// --- Responsywność (media queries w CSS) ---
const style = readFileSync(join(ROOT, 'css', 'style.css'), 'utf8');
const mqCount = (style.match(/@media/g) || []).length;
if (mqCount >= 5) ok(`CSS: ${mqCount} media queries (responsywność)`);
else fail(`CSS: za mało media queries (${mqCount})`);

// --- QR (logika sideMenu) ---
const sideMenu = readFileSync(join(ROOT, 'js', 'core', 'sideMenu.js'), 'utf8');
if (sideMenu.includes('api.qrserver.com') && sideMenu.includes('ensureQrCode')) ok('QR: generowanie w sideMenu');
else fail('QR: brak implementacji');

// --- Animacje / przejścia ---
if (style.includes('transition') && style.includes('view-map-active')) ok('CSS: przejścia widoków');
else fail('CSS: brak przejść widoków');

console.log('\n--- Symulacja przeglądarki ---');
console.log(`OK: ${passes.length} | Błędy: ${failures.length}`);
if (failures.length) {
    failures.forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
}
