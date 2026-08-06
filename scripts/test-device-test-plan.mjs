/**
 * Smoke: plan testów urządzeń ETAP 43-T1
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function ok(m) { console.log(`✅ ${m}`); }
function fail(m) { failed++; console.error(`❌ ${m}`); }

const md = readFileSync(join(ROOT, 'docs/certification/DEVICE-TEST-PLAN.md'), 'utf8');
const json = JSON.parse(readFileSync(join(ROOT, 'docs/certification/DEVICE-TEST-PLAN.json'), 'utf8'));

for (const term of ['Android', 'iPhone', 'Chrome', 'Edge', 'Firefox', 'Samsung Internet', 'PWA', 'Desktop', 'Tablet']) {
    if (md.includes(term)) ok(`plan mentions ${term}`);
    else fail(`plan missing ${term}`);
}

for (const suite of ['S01', 'S02', 'S03', 'S04', 'S05', 'S08', 'S09']) {
    if (md.includes(suite)) ok(`suite ${suite}`);
    else fail(`missing suite ${suite}`);
}

if (json.browserMatrix?.length >= 6) ok('browserMatrix');
else fail('browserMatrix');

if (json.minimumCoverage?.beforeRelease?.length >= 7) ok('minimumCoverage');
else fail('minimumCoverage');

if (existsSync(join(ROOT, 'docs/certification/manual-device-results.template.json'))) {
    ok('sign-off template');
} else fail('sign-off template');

console.log(failed ? `\nDEVICE TEST PLAN FAILED (${failed})` : '\nDEVICE TEST PLAN OK');
process.exit(failed ? 1 : 0);
