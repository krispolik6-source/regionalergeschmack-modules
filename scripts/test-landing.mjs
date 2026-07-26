// scripts/test-landing.mjs – weryfikacja landing.html

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let failures = 0;

function ok(msg) { console.log(`✅ ${msg}`); }
function fail(msg) { console.error(`❌ ${msg}`); failures += 1; }

const htmlPath = path.join(root, 'landing.html');
const cssPath = path.join(root, 'css', 'landing.css');

if (!fs.existsSync(htmlPath)) fail('Brak landing.html');
else ok('landing.html istnieje');

if (!fs.existsSync(cssPath)) fail('Brak css/landing.css');
else ok('css/landing.css istnieje');

const html = fs.readFileSync(htmlPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');

const required = [
    ['Opis aplikacji', /Regionaler Geschmack/],
    ['Sekcja funkcji', /id="features"/],
    ['Zrzuty ekranu', /id="screenshots"/],
    ['Placeholder screenshots', /lp-shot-placeholder/],
    ['Link do aplikacji', /https:\/\/admirable-cascaron-c76940\.netlify\.app/],
    ['Landing i18n module', /landing-i18n\.js/],
    ['Landing i18n keys', /data-i18n-landing=/],
    ['Responsywność CSS', /@media/]
];

for (const [label, pattern] of required) {
    const inHtml = pattern.test(html);
    const inCss = pattern.test(css);
    if (inHtml || inCss) ok(label);
    else fail(`Brak: ${label}`);
}

console.log(`\n--- Landing test ---\n${failures ? 'FAILED' : 'OK'}`);
process.exit(failures ? 1 : 0);
