/**
 * Synchronizuje wersję PWA z js/core/pwaVersion.js do wszystkich powierzchni.
 * Run: npm run sync:pwa-version
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    PWA_VERSION,
    PWA_CACHE_NAME,
    PWA_IMAGE_CACHE_NAME
} from '../js/core/pwaVersion.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const V = PWA_VERSION;

const ASSET_PATH_RE = /(\/(?:assets\/(?:icons|brand)\/[\w.-]+|manifest\.json))(\?v=\d+)?/g;

const SYNC_FILES = [
    'manifest.json',
    'index.html',
    'landing.html',
    'js/views/home.js',
    'js/views/premium.js',
    'js/core/pushNotifications.js',
    'css/brand-identity-final.css'
];

function bumpAssetQueries(text) {
    return text.replace(ASSET_PATH_RE, `$1?v=${V}`);
}

function bumpHtmlPwaRefs(text) {
    let out = bumpAssetQueries(text);
    out = out.replace(/manifest\.json\?v=\d+/g, `manifest.json?v=${V}`);
    out = out.replace(/sw\.js\?v=\d+/g, `sw.js?v=${V}`);
    out = out.replace(/app\.bundle\.js\?v=\d+/g, `app.bundle.js?v=${V}`);
    return out;
}

// global bridge for SW
const globalJs = `/**
 * SW importScripts bridge — wartości muszą być identyczne z js/core/pwaVersion.js
 * Aktualizacja: npm run sync:pwa-version
 */
// eslint-disable-next-line no-var
var PWA_VERSION = '${PWA_VERSION}';
// eslint-disable-next-line no-var
var PWA_CACHE_NAME = '${PWA_CACHE_NAME}';
// eslint-disable-next-line no-var
var PWA_IMAGE_CACHE_NAME = '${PWA_IMAGE_CACHE_NAME}';
`;
writeFileSync(join(ROOT, 'js/core/pwaVersion.global.js'), globalJs, 'utf8');
console.log(`✓ js/core/pwaVersion.global.js → ${V} · ${PWA_CACHE_NAME} · ${PWA_IMAGE_CACHE_NAME}`);

for (const rel of SYNC_FILES) {
    const path = join(ROOT, rel);
    const raw = readFileSync(path, 'utf8');
    const next = rel.endsWith('.html') ? bumpHtmlPwaRefs(raw) : bumpAssetQueries(raw);
    if (next !== raw) {
        writeFileSync(path, next, 'utf8');
        console.log(`✓ ${rel}`);
    } else {
        console.log(`· ${rel} (already ${V})`);
    }
}

console.log(`\nPWA_VERSION=${V} synced.`);
