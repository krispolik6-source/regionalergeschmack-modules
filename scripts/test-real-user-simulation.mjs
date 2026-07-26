/**
 * Smoke test ETAP 24 – Real User Simulation
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { PERSONAS, JOURNEY_STEPS, evaluatePersona } from '../js/diagnostics/realUserPersonas.js';

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

assert(PERSONAS.length === 50, `50 person (got ${PERSONAS.length})`);
assert(JOURNEY_STEPS.length >= 12, 'journey steps ≥ 12');

const codes = new Set(PERSONAS.map((p) => p.code));
assert(codes.size === 50, 'unique codes');
assert(PERSONAS.every((p) => p.id >= 1 && p.id <= 50), 'ids 1–50');

const mustHave = [
    'senior-novice', 'cyclist', 'tourist-en', 'parent', 'slow-network',
    'plain-theme', 'colorblind', 'legacy-android', 'small-phone', 'tablet'
];
for (const role of mustHave) {
    assert(PERSONAS.some((p) => p.role === role), `role ${role}`);
}

const ev = evaluatePersona(PERSONAS[0]);
assert(typeof ev.score === 'number', 'evaluatePersona score');
assert(ev.steps.length === JOURNEY_STEPS.length, 'steps per persona');

const sim = join(ROOT, 'js/diagnostics/realUserSimulation.js');
assert(existsSync(sim), 'realUserSimulation.js');
const src = readFileSync(sim, 'utf8');
assert(src.includes('autoFix: false') || src.includes('autoFix:false'), 'autoFix false');
assert(src.includes('__RG_REAL_USERS__'), '__RG_REAL_USERS__');
assert(src.includes('realusers'), 'URL flag');

const app = readFileSync(join(ROOT, 'js/app.js'), 'utf8');
assert(app.includes('initRealUserSimulation'), 'app.js init');

const panel = readFileSync(join(ROOT, 'js/diagnostics/healthDevPanel.js'), 'utf8');
assert(panel.includes('Real Users') || panel.includes('real-users'), 'dev panel');

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
assert(pkg.scripts?.['real-users'], 'npm run real-users');
assert(pkg.scripts?.['check:real-users'], 'npm run check:real-users');

const readme = join(ROOT, 'docs/real-users/README.md');
assert(existsSync(readme), 'README');

const cli = spawnSync(process.execPath, ['scripts/real-user-simulation.mjs'], {
    cwd: ROOT,
    encoding: 'utf8'
});
assert(cli.status === 0, `CLI exit 0 (got ${cli.status})`);
assert(existsSync(join(ROOT, 'docs/real-users/latest.json')), 'latest.json');
assert(existsSync(join(ROOT, 'docs/real-users/latest.md')), 'latest.md');

const latest = JSON.parse(readFileSync(join(ROOT, 'docs/real-users/latest.json'), 'utf8'));
assert(latest.policy?.autoFix === false, 'policy autoFix');
assert(latest.summary?.personas === 50, 'summary 50 personas');
assert(latest.catalogSize === 50, 'catalogSize 50');
assert(Array.isArray(latest.worst), 'worst list');

console.log(failed ? `\n${failed} failed` : '\nAll real-users checks passed.');
process.exit(failed ? 1 : 0);
