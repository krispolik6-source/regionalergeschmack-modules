// scripts/test-pwa.mjs – test plików PWA

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    readPwaVersionFromModule,
    readPwaVersionFromGlobal,
    readPwaVersionFromSw
} from './lib/read-pwa-version.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let failures = 0;

function ok(msg) { console.log(`✅ ${msg}`); }
function fail(msg) { console.error(`❌ ${msg}`); failures += 1; }

const manifestPath = path.join(root, 'manifest.json');
const swPath = path.join(root, 'sw.js');
const indexPath = path.join(root, 'index.html');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const requiredManifest = ['name', 'short_name', 'start_url', 'display', 'theme_color', 'background_color', 'icons'];
requiredManifest.forEach((key) => {
    if (manifest[key]) ok(`manifest.json: ${key}`);
    else fail(`manifest.json: brak ${key}`);
});

if (manifest.icons?.some((icon) => icon.sizes === '192x192') && manifest.icons?.some((icon) => icon.sizes === '512x512')) {
    ok('manifest.json: ikony 192 i 512');
} else {
    fail('manifest.json: brak wymaganych ikon');
}

const sw = fs.readFileSync(swPath, 'utf8');
if (sw.includes('addEventListener(\'install\'') && sw.includes('caches.open')) ok('sw.js: cache offline');
else fail('sw.js: brak cache offline');

if (sw.includes('addEventListener(\'fetch\'') && sw.includes('navigate')) ok('sw.js: fallback nawigacji');
else fail('sw.js: brak fallback nawigacji');

const index = fs.readFileSync(indexPath, 'utf8');
if (index.includes('rel="manifest"')) ok('index.html: link manifest');
else fail('index.html: brak link manifest');

if (index.includes('serviceWorker.register')) ok('index.html: rejestracja SW');
else fail('index.html: brak rejestracji SW');

if (index.includes('pwaInstallMenuBtn')) ok('index.html: przycisk instalacji w menu');
else fail('index.html: brak przycisku instalacji');

if (index.includes('id="rgSplashScreen"') && index.includes('rg-splash-critical')) {
    ok('index.html: premium splash (DOM + critical CSS)');
} else {
    fail('index.html: brak premium splash');
}

['icon-192.png', 'icon-512.png'].forEach((file) => {
    const iconPath = path.join(root, 'assets', 'icons', file);
    if (fs.existsSync(iconPath)) ok(`ikona: ${file}`);
    else fail(`brak ikony: ${file}`);
});

const pwaInstall = fs.readFileSync(path.join(root, 'js', 'core', 'pwaInstall.js'), 'utf8');
if (pwaInstall.includes('deferredPrompt.prompt()') || pwaInstall.includes('promptEvent.prompt()')) {
    ok('pwaInstall.js: wywołanie prompt()');
} else {
    fail('pwaInstall.js: brak deferredPrompt.prompt()');
}

if (pwaInstall.includes('beforeinstallprompt')) ok('pwaInstall.js: beforeinstallprompt');
else fail('pwaInstall.js: brak beforeinstallprompt');

const pwaVer = readPwaVersionFromModule(root);
ok(`pwaVersion.js: PWA_VERSION=${pwaVer}`);

if (readPwaVersionFromGlobal(root) === pwaVer) ok('pwaVersion.global.js synced');
else fail('pwaVersion.global.js niezgodny z pwaVersion.js');

try {
    if (readPwaVersionFromSw(root) === pwaVer) ok('sw.js importScripts bridge synced');
    else fail('sw.js bridge niezgodny z pwaVersion.js');
} catch (err) {
    fail(String(err.message || err));
}

if (sw.includes('importScripts') && !/const PWA_VERSION\s*=/.test(sw)) {
    ok('sw.js: brak lokalnej kopii PWA_VERSION');
} else {
    fail('sw.js: powinien używać importScripts zamiast lokalnego PWA_VERSION');
}

if (pwaVer && index.includes(`manifest.json?v=${pwaVer}`) && index.includes(`sw.js?v=${pwaVer}`)) {
    ok(`index.html: manifest + SW cache-bust v${pwaVer}`);
} else {
    fail('index.html: manifest/SW cache-bust niezgodne z PWA_VERSION');
}

if (pwaVer && index.includes(`app.bundle.js?v=${pwaVer}`)) {
    ok(`index.html: legacy bundle v${pwaVer}`);
} else {
    fail('index.html: app.bundle.js cache-bust niezgodny z PWA_VERSION');
}

if (pwaVer && manifest.icons?.every((icon) => String(icon.src).includes(`?v=${pwaVer}`))) {
    ok(`manifest.json: ikony ?v=${pwaVer}`);
} else {
    fail('manifest.json: ikony niezgodne z PWA_VERSION');
}

const memoryCleaner = fs.readFileSync(path.join(root, 'js', 'diagnostics', 'memoryCleaner.js'), 'utf8');
if (
    pwaVer
    && memoryCleaner.includes("from '../core/pwaVersion.js'")
    && memoryCleaner.includes('PWA_CACHE_PREFIX_KEEP')
) {
    ok('memoryCleaner.js: import z pwaVersion.js (jedno źródło)');
} else {
    fail('memoryCleaner.js: musi importować PWA_CACHE_PREFIX_KEEP z pwaVersion.js');
}

console.log(`\n--- PWA test ---\n${failures ? 'FAILED' : 'OK'}`);
process.exit(failures ? 1 : 0);
