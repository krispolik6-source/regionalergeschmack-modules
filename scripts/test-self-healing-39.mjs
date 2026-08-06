/**
 * Smoke ETAP 39 — Self Healing module surface
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import { assertLazyDiagnosticsInit } from './lib/diagnosticsOrchestratorAssert.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function assert(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error(`❌ ${msg}`);
    } else {
        console.log(`✅ ${msg}`);
    }
}

const sh = readFileSync(join(ROOT, 'js/diagnostics/selfHealing.js'), 'utf8');
const map = readFileSync(join(ROOT, 'js/views/map.js'), 'utf8');
const nav = readFileSync(join(ROOT, 'js/controllers/navigation.js'), 'utf8');
const app = readFileSync(join(ROOT, 'js/app.js'), 'utf8');

assert(sh.includes('healMapRuntime'), 'healMapRuntime');
assert(sh.includes('healEventBusListeners'), 'healEventBusListeners');
assert(sh.includes('healBrokenImages'), 'healBrokenImages');
assert(sh.includes('healServiceWorker'), 'healServiceWorker');
assert(sh.includes('repairsStateOnly'), 'policy repairsStateOnly');
assert(sh.includes('doesNotRewriteSource'), 'policy doesNotRewriteSource');
assert(map.includes('export function healMapRuntimeState'), 'map healMapRuntimeState export');
assert(nav.includes('export function ensureNavigationHealed'), 'nav ensureNavigationHealed');
assertLazyDiagnosticsInit(assert, ROOT, 'selfHealing.initSelfHealing', 'orchestrator lazy selfHealing');
assert(sh.includes('map.js?v=48'), 'selfHeal imports map v48');
assert(nav.includes('map.js?v=48'), 'nav map v48');
assert(existsSync(join(ROOT, 'docs/self-heal/ETAP-39-SELF-HEALING.md')), 'report md');

for (const f of ['js/diagnostics/selfHealing.js', 'js/views/map.js', 'js/controllers/navigation.js']) {
    const r = spawnSync(process.execPath, ['--check', f], { cwd: ROOT, encoding: 'utf8' });
    assert(r.status === 0, `syntax ${f}`);
}

console.log(failed ? `\n${failed} failed` : '\nETAP 39 self-heal checks passed.');
process.exit(failed ? 1 : 0);
