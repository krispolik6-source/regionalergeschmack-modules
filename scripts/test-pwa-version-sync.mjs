/**
 * Weryfikuje jedno źródło wersji PWA (js/core/pwaVersion.js).
 * Run: node scripts/test-pwa-version-sync.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    readPwaVersionFromModule,
    readPwaVersionFromGlobal,
    readPwaVersionFromSw,
    readPwaCacheNamesFromGlobal
} from './lib/read-pwa-version.mjs';
import { PWA_CACHE_NAME, PWA_IMAGE_CACHE_NAME } from '../js/core/pwaVersion.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function ok(msg) {
    console.log(`✅ ${msg}`);
}

function fail(msg) {
    failed += 1;
    console.error(`❌ ${msg}`);
}

const canonical = readPwaVersionFromModule(ROOT);
ok(`canonical PWA_VERSION=${canonical} (js/core/pwaVersion.js)`);

const globalV = readPwaVersionFromGlobal(ROOT);
if (globalV === canonical) ok('pwaVersion.global.js synced');
else fail(`pwaVersion.global.js=${globalV} ≠ ${canonical}`);

try {
    const swV = readPwaVersionFromSw(ROOT);
    if (swV === canonical) ok('sw.js uses importScripts bridge');
    else fail(`sw bridge=${swV} ≠ ${canonical}`);
} catch (err) {
    fail(String(err.message || err));
}

try {
    const globalNames = readPwaCacheNamesFromGlobal(ROOT);
    if (globalNames.PWA_CACHE_NAME === PWA_CACHE_NAME && globalNames.PWA_IMAGE_CACHE_NAME === PWA_IMAGE_CACHE_NAME) {
        ok('pwaVersion.global.js cache names synced');
    } else {
        fail(`global cache names ≠ pwaVersion.js (${globalNames.PWA_CACHE_NAME} / ${globalNames.PWA_IMAGE_CACHE_NAME})`);
    }
} catch (err) {
    fail(String(err.message || err));
}

const offlineSync = readFileSync(join(ROOT, 'js/core/offlineSync.js'), 'utf8');
if (offlineSync.includes('PWA_IMAGE_CACHE_NAME') && !/\brg-runtime-images-v\d+\b/.test(offlineSync)) {
    ok('offlineSync uses PWA_IMAGE_CACHE_NAME');
} else {
    fail('offlineSync must import PWA_IMAGE_CACHE_NAME — no hardcoded rg-runtime-images-v*');
}

const mc = readFileSync(join(ROOT, 'js/diagnostics/memoryCleaner.js'), 'utf8');
if (mc.includes("from '../core/pwaVersion.js'") && mc.includes('PWA_CACHE_PREFIX_KEEP')) {
    ok('memoryCleaner imports pwaVersion.js');
} else {
    fail('memoryCleaner must import PWA_CACHE_PREFIX_KEEP from pwaVersion.js');
}

const sh = readFileSync(join(ROOT, 'js/diagnostics/selfHealing.js'), 'utf8');
if (sh.includes("from '../core/pwaVersion.js'") && sh.includes('pwaAssetUrl')) {
    ok('selfHealing imports pwaAssetUrl');
} else {
    fail('selfHealing must use pwaAssetUrl from pwaVersion.js');
}

const index = readFileSync(join(ROOT, 'index.html'), 'utf8');
const checks = [
    [`manifest.json?v=${canonical}`, 'index manifest'],
    [`sw.js?v=${canonical}`, 'index SW register'],
    [`app.bundle.js?v=${canonical}`, 'index legacy bundle'],
    [`?v=${canonical}`, 'index icon cache-bust']
];
for (const [needle, label] of checks) {
    if (index.includes(needle)) ok(label);
    else fail(`index.html missing ${label} (${needle})`);
}

const manifest = readFileSync(join(ROOT, 'manifest.json'), 'utf8');
const manifestVersions = [...manifest.matchAll(/\?v=(\d+)/g)].map((m) => m[1]);
if (manifestVersions.length > 0 && manifestVersions.every((v) => v === canonical)) {
    ok('manifest.json icon versions');
} else {
    fail(`manifest.json has mixed icon ?v= versions (${[...new Set(manifestVersions)].join(', ')})`);
}

// Scan runtime sources for stale PWA version literals (28–32 outside canonical)
const SCAN_DIRS = ['js', 'css', 'index.html', 'landing.html', 'manifest.json', 'sw.js'];
const FORBIDDEN = ['28', '29', '31', '32'].filter((n) => n !== canonical);
const staleHits = [];

function scanFile(rel) {
    const text = readFileSync(join(ROOT, rel), 'utf8');
    if (rel === 'js/core/pwaVersion.js' || rel === 'js/core/pwaVersion.global.js') return;

    for (const bad of FORBIDDEN) {
        if (new RegExp(`\\?v=${bad}\\b`).test(text)) {
            staleHits.push({ rel, bad });
        }
        if (new RegExp(`rg-pwa-v${bad}\\b`).test(text)) {
            staleHits.push({ rel, bad: `rg-pwa-v${bad}` });
        }
    }

    if (rel !== 'js/core/pwaVersion.js' && new RegExp(`PWA_VERSION\\s*=\\s*['"]\\d+['"]`).test(text)) {
        staleHits.push({ rel, bad: 'local PWA_VERSION declaration' });
    }
}

function walk(dir) {
    for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        const rel = relative(ROOT, full).replace(/\\/g, '/');
        if (name === 'legacy' && dir.endsWith('js')) continue;
        if (name === 'node_modules' || name === '.git') continue;
        const st = statSync(full);
        if (st.isDirectory()) walk(full);
        else if (/\.(js|html|json|css|mjs)$/.test(name)) scanFile(rel);
    }
}

walk(join(ROOT, 'js'));
for (const f of ['index.html', 'landing.html', 'manifest.json', 'sw.js']) {
    scanFile(f);
}

function scanHardcodedCacheNames(rel) {
    if (rel === 'js/core/pwaVersion.js' || rel === 'js/core/pwaVersion.global.js') return;
    const text = readFileSync(join(ROOT, rel), 'utf8');
    const hits = text.match(/\brg-(?:pwa-v|runtime-images-v)\d+\b/g);
    if (hits?.length) {
        staleHits.push({ rel, bad: [...new Set(hits)].join(', ') });
    }
}

function walkRuntimeCacheScan(dir) {
    for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        const rel = relative(ROOT, full).replace(/\\/g, '/');
        if (name === 'legacy' && dir.endsWith('js')) continue;
        if (name === 'node_modules' || name === '.git') continue;
        const st = statSync(full);
        if (st.isDirectory()) walkRuntimeCacheScan(full);
        else if (/\.js$/.test(name)) scanHardcodedCacheNames(rel);
    }
}

walkRuntimeCacheScan(join(ROOT, 'js'));
scanHardcodedCacheNames('sw.js');

if (staleHits.length === 0) {
    ok('no stale v28/v29/v31 in runtime sources');
    ok('no hardcoded rg-pwa-v* / rg-runtime-images-v* outside pwaVersion.js');
} else {
    for (const h of staleHits) {
        fail(`${h.rel}: stale ${h.bad}`);
    }
}

console.log(failed ? `\nFAILED (${failed})` : '\nPWA version sync OK');
process.exit(failed ? 1 : 0);
