/**
 * ZADANIE B — test strategii odświeżania ikon po aktualizacji PWA.
 * Run: npm run check:icon-refresh
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPwaVersionFromModule } from './lib/read-pwa-version.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const V = readPwaVersionFromModule(ROOT);
const vQ = `?v=${V}`;
let failed = 0;

function ok(msg) {
    console.log(`✅ ${msg}`);
}

function fail(msg) {
    failed += 1;
    console.error(`❌ ${msg}`);
}

function read(rel) {
    return readFileSync(join(ROOT, rel), 'utf8');
}

const sw = read('sw.js');
const manifest = read('manifest.json');
const index = read('index.html');
const landing = read('landing.html');
const brandCss = read('css/brand-identity-final.css');
const netlify = read('netlify.toml');

// ——— Service Worker ———
if (sw.includes('function isPwaIconAsset') || sw.includes('isPwaIconAsset(')) {
    ok('SW: isPwaIconAsset()');
} else fail('SW: brak isPwaIconAsset()');

if (sw.includes('fetchPwaIconAsset') && sw.includes("cache: 'no-store'")) {
    ok('SW: ikony network-first + cache no-store');
} else fail('SW: brak fetchPwaIconAsset / no-store');

if (sw.includes('versionedIconUrl') && !sw.includes('caches.match(url.pathname)')) {
    ok('SW: offline fallback tylko wersjonowany (bez pathname bez ?v=)');
} else fail('SW: niebezpieczny fallback caches.match(url.pathname)');

if (/key\.startsWith\(['"]rg-pwa-['"]\)/.test(sw) && /key\.startsWith\(['"]rg-runtime-images-['"]\)/.test(sw)) {
    ok('SW activate: czyści stare cache PWA po bump wersji');
} else fail('SW activate: brak czyszczenia starych cache');

// ——— Precache offline (launcher + splash + push) ———
const PRECACHE_REQUIRED = [
    ['manifest.json', /manifest\.json\?v=\$\{ICON_VERSION\}/],
    ['favicon.ico', /favicon\.ico\?v=\$\{ICON_VERSION\}/],
    ['favicon-16.png', /favicon-16\.png\?v=\$\{ICON_VERSION\}/],
    ['favicon-32.png', /favicon-32\.png\?v=\$\{ICON_VERSION\}/],
    ['logo-master.svg', /logo-master\.svg\?v=\$\{ICON_VERSION\}/],
    ['apple-touch-icon.png', /apple-touch-icon\.png\?v=\$\{ICON_VERSION\}/],
    ['icon-180.png', /icon-180\.png\?v=\$\{ICON_VERSION\}/],
    ['icon-192.png', /icon-192\.png\?v=\$\{ICON_VERSION\}/],
    ['icon-512.png', /icon-512\.png\?v=\$\{ICON_VERSION\}/],
    ['maskable-192.png', /maskable-192\.png\?v=\$\{ICON_VERSION\}/],
    ['maskable-512.png', /maskable-512\.png\?v=\$\{ICON_VERSION\}/],
    ['monochrome-512.png', /monochrome-512\.png\?v=\$\{ICON_VERSION\}/],
    ['splash-logo.png', /splash-logo\.png\?v=\$\{ICON_VERSION\}/],
    ['notifications-icon.png', /notifications-icon\.png\?v=\$\{ICON_VERSION\}/]
];

for (const [name, re] of PRECACHE_REQUIRED) {
    if (re.test(sw)) ok(`SW precache: ${name}`);
    else fail(`SW precache: brak ${name} (?v=\${ICON_VERSION})`);
}

// ——— Manifest (launcher PWA) ———
const manifestJson = JSON.parse(manifest);
if (manifestJson.icons?.every((i) => String(i.src).includes(vQ))) {
    ok(`manifest: wszystkie ikony ${vQ}`);
} else fail('manifest: mieszane wersje ikon');

const purposes = new Set(manifestJson.icons.map((i) => i.purpose || 'any'));
if (purposes.has('maskable')) ok('manifest: maskable launcher');
else fail('manifest: brak maskable');
if (purposes.has('monochrome')) ok('manifest: monochrome');
else fail('manifest: brak monochrome');
if (manifestJson.icons.some((i) => /apple-touch-icon/.test(i.src))) ok('manifest: apple-touch-icon');
else fail('manifest: brak apple-touch-icon');

// ——— index.html (desktop + apple + splash) ———
const INDEX_CHECKS = [
    ['favicon.ico', 'desktop favicon'],
    ['favicon-16.png', 'favicon 16'],
    ['favicon-32.png', 'favicon 32'],
    ['apple-touch-icon.png', 'apple-touch-icon'],
    ['icon-180.png', 'apple 180'],
    ['icon-144.png', 'msapplication tile'],
    ['logo-master.svg', 'splash logo'],
    [`manifest.json?v=${V}`, 'manifest link'],
    [`sw.js?v=${V}`, 'SW register hint in page']
];

for (const [needle, label] of INDEX_CHECKS) {
    if (index.includes(needle) && index.includes(vQ.split('=')[0])) ok(`index: ${label}`);
    else if (index.includes(needle) && needle.includes('manifest')) ok(`index: ${label}`);
    else if (index.includes(needle) && needle.includes('sw.js')) ok(`index: ${label}`);
    else fail(`index: brak ${label}`);
}

if (index.includes('rg-splash__logo') && index.includes(`logo-master.svg${vQ}`)) {
    ok('index: splash screen icon');
} else fail('index: splash bez wersjonowanej ikony');

// ——— landing.html ———
if (landing.includes(`favicon.ico${vQ}`) && landing.includes(`apple-touch-icon.png${vQ}`)) {
    ok('landing: favicon + apple');
} else fail('landing: brak wersjonowanych ikon');

// ——— CSS splash (offline background) ———
if (brandCss.includes(`splash-logo.png${vQ}`)) ok('CSS: splash-logo wersjonowany');
else fail('CSS: splash-logo bez ?v=');

const RUNTIME_FILES = [
    'index.html', 'landing.html', 'manifest.json',
    'css/brand-identity-final.css'
];
const unversioned = [];
const iconRefRe = /\/assets\/(?:icons|brand)\/[\w.-]+\.(?:png|svg|ico)(?!\?v=)/g;
for (const rel of RUNTIME_FILES) {
    const text = read(rel);
    const hits = text.match(iconRefRe) || [];
    for (const h of hits) {
        unversioned.push(`${rel}: ${h}`);
    }
}

const push = read('js/core/pushNotifications.js');
if (push.includes('pwaAssetUrl(')) ok('pushNotifications: pwaAssetUrl (dynamic version)');
else fail('pushNotifications: brak pwaAssetUrl');

const selfHeal = read('js/diagnostics/selfHealing.js');
if (selfHeal.includes('pwaAssetUrl(')) ok('selfHealing: pwaAssetUrl (dynamic version)');
else fail('selfHealing: brak pwaAssetUrl');

if (unversioned.length === 0) ok('runtime HTML/manifest/CSS: brak niewersjonowanych URL ikon');
else unversioned.forEach((h) => fail(`runtime unversioned: ${h}`));

// ——— Push / SW notifications ———
if (sw.includes('DEFAULT_ICON') && sw.includes('ICON_VERSION')) {
    ok('SW: DEFAULT_ICON wersjonowany');
} else fail('SW: brak DEFAULT_ICON z ICON_VERSION');
if (netlify.includes('/assets/icons/*') && netlify.includes('must-revalidate')) {
    ok('netlify: Cache-Control must-revalidate dla /assets/icons/*');
} else fail('netlify: brak nagłówków cache dla ikon');

if (netlify.includes('/manifest.json') && netlify.includes('must-revalidate')) {
    ok('netlify: Cache-Control must-revalidate dla manifest.json');
} else fail('netlify: brak nagłówków cache dla manifest');

// ——— Pliki na dysku ———
const DISK_ICONS = [
    'assets/icons/favicon.ico',
    'assets/icons/apple-touch-icon.png',
    'assets/icons/icon-192.png',
    'assets/icons/icon-512.png',
    'assets/icons/maskable-512.png',
    'assets/icons/monochrome-512.png',
    'assets/brand/splash-logo.png',
    'assets/brand/notifications-icon.png'
];
for (const rel of DISK_ICONS) {
    if (existsSync(join(ROOT, rel))) ok(`asset: ${rel}`);
    else fail(`asset: brak ${rel}`);
}

console.log(failed ? `\nICON REFRESH TEST FAILED (${failed})` : `\nICON REFRESH TEST OK (PWA v${V})`);
process.exit(failed ? 1 : 0);
