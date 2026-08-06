/**
 * Premium splash screen – struktura HTML, CSS (transform/opacity), dismiss bez opóźnień.
 * Run: node scripts/test-splash-screen.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { readPwaVersionFromModule } from './lib/read-pwa-version.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const pwaV = readPwaVersionFromModule(root);
let failures = 0;

function ok(msg) { console.log(`✅ ${msg}`); }
function fail(msg) { console.error(`❌ ${msg}`); failures += 1; }

function read(rel) {
    return fs.readFileSync(path.join(root, rel), 'utf8');
}

const index = read('index.html');
const brandCss = read('css/brand-identity-final.css');
const splashJs = read('js/core/splashScreen.js');
const appJs = read('js/app.js');

if (index.includes('id="rgSplashScreen"') && index.includes('class="rg-splash"')) {
    ok('index.html: element #rgSplashScreen');
} else fail('index.html: brak #rgSplashScreen');

if (new RegExp(`logo-master\\.svg\\?v=${pwaV}`).test(index) && index.includes('rg-splash__logo')) {
    ok('index.html: logo-master.svg na splash');
} else fail('index.html: brak logo-master na splash');

if (index.includes('rg-splash-critical') && /#f7f3ea/.test(index) && /#fbf8f2/.test(index)) {
    ok('index.html: krytyczny CSS anty-biały-błysk');
} else fail('index.html: brak krytycznego CSS splash');

if (index.includes("classList.add('rg-booting')") && index.includes('dark-mode-boot')) {
    ok('index.html: wykrywanie dark mode przed paint');
} else fail('index.html: brak boot script rg-booting / dark-mode-boot');

if (index.includes("classList.add('is-entering')")) {
    ok('index.html: animacja wejścia (is-entering)');
} else fail('index.html: brak skryptu is-entering');

if (splashJs.includes('export function dismissSplashScreen')) {
    ok('splashScreen.js: dismissSplashScreen');
} else fail('splashScreen.js: brak dismissSplashScreen');

if (!/setTimeout\s*\([^,]+,\s*[5-9]\d{3,}/.test(splashJs)) {
    ok('splashScreen.js: brak sztucznych opóźnień (>5s)');
} else fail('splashScreen.js: wykryto długie opóźnienie');

if (appJs.includes("from './core/splashScreen.js'") && appJs.includes('dismissSplashScreen()')) {
    ok('app.js: dismiss w bootstrap (finally)');
} else fail('app.js: brak dismissSplashScreen w bootstrap');

if (/\.rg-splash/.test(brandCss) && /rg-splash-enter/.test(brandCss)) {
    ok('brand CSS: klasy splash + animacja');
} else fail('brand CSS: brak .rg-splash / animacji');

if (/transform:\s*scale\(0\.96\)/.test(brandCss) && /opacity/.test(brandCss)) {
    ok('brand CSS: animacja opacity + transform');
} else fail('brand CSS: brak scale 0.96 / opacity');

if (/prefers-reduced-motion:\s*reduce/.test(brandCss)) {
    ok('brand CSS: prefers-reduced-motion');
} else fail('brand CSS: brak prefers-reduced-motion');

if (!/animation:[^;]*(width|height|top|left|margin)/.test(brandCss)) {
    ok('brand CSS: brak animacji layout (width/height/top/left/margin)');
} else fail('brand CSS: animacja layout – ryzyko CLS');

if (/html\.dark-mode-boot \.rg-splash|body\.dark-mode \.rg-splash/.test(brandCss)) {
    ok('brand CSS: wariant dark mode');
} else fail('brand CSS: brak dark mode splash');

console.log(`\n--- Splash screen test ---\n${failures ? 'FAILED' : 'OK'}`);
process.exit(failures ? 1 : 0);
