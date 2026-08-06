/**
 * ETAP 42E — Runtime Error Feed smoke test.
 * Run: npm run check:runtime-error-feed
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function ok(msg) {
    console.log(`✅ ${msg}`);
}

function fail(msg) {
    failed += 1;
    console.error(`❌ ${msg}`);
}

const store = readFileSync(join(ROOT, 'js/diagnostics/runtimeErrorStore.js'), 'utf8');
const collector = readFileSync(join(ROOT, 'js/diagnostics/runtimeErrorCollector.js'), 'utf8');
const feed = readFileSync(join(ROOT, 'js/diagnostics/runtimeErrorFeed.js'), 'utf8');
const guardian = readFileSync(join(ROOT, 'js/diagnostics/consoleGuardian.js'), 'utf8');
const orch = readFileSync(join(ROOT, 'js/diagnostics/diagnosticsOrchestrator.js'), 'utf8');
const vault = readFileSync(join(ROOT, 'js/diagnostics/developerVaultPanel.js'), 'utf8');

if (store.includes('MAX_ERRORS = 100')) ok('store: max 100');
else fail('store: brak max 100');

const cats = [
    'JavaScript Errors',
    'Promise Errors',
    'Fetch Errors',
    '404',
    '500',
    'Image Errors',
    'Service Worker',
    'Cache',
    'Manifest',
    'Storage',
    'Memory',
    'Network'
];
for (const label of cats) {
    if (store.includes(label)) ok(`category: ${label}`);
    else fail(`category: brak ${label}`);
}

if (collector.includes('initRuntimeErrorCollector') && collector.includes('patchedFetch')) {
    ok('collector: fetch patch');
} else fail('collector: brak fetch patch');

if (guardian.includes('initRuntimeErrorCollector()')) ok('guardian: boot collector');
else fail('guardian: brak boot collector');

if (feed.includes('openRuntimeErrorFeedPanel') && feed.includes('isDeveloperAccessGranted')) {
    ok('feed: vault gate + open panel');
} else fail('feed: brak UI / gate');

if (feed.includes('min-height:44px') || feed.includes('min-height: 44px')) ok('feed: touch targets mobile');
else fail('feed: brak mobile touch');

if (feed.includes('__RG_ERROR_FEED__')) ok('feed: global API');
else fail('feed: brak __RG_ERROR_FEED__');

if (orch.includes('runtimeErrorFeed.initRuntimeErrorFeed')) ok('orchestrator: lazy init feed');
else fail('orchestrator: brak lazy feed');

if (vault.includes('data-dv-error-feed') && vault.includes('Runtime Error Feed')) {
    ok('vault: entry point');
} else fail('vault: brak przycisku feed');

for (const f of [
    'js/diagnostics/runtimeErrorStore.js',
    'js/diagnostics/runtimeErrorCollector.js',
    'js/diagnostics/runtimeErrorFeed.js'
]) {
    const r = spawnSync(process.execPath, ['--check', f], { cwd: ROOT, encoding: 'utf8' });
    if (r.status === 0) ok(`syntax ${f}`);
    else fail(`syntax ${f}`);
}

console.log(failed ? `\nRUNTIME ERROR FEED FAILED (${failed})` : '\nRUNTIME ERROR FEED OK');
process.exit(failed ? 1 : 0);
