/**
 * Smoke test ETAP 18D Virtual User (struktura + CLI).
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

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

const file = join(ROOT, 'js/diagnostics/virtualUser.js');
assert(existsSync(file), 'virtualUser.js');

const src = readFileSync(file, 'utf8');
const scenarios = [
    'home-map-producer-back',
    'search',
    'gps',
    'filters',
    'popup',
    'modal',
    'favorites',
    'cart',
    'profile',
    'premium',
    'language',
    'dark-mode',
    'offline',
    'online',
    'restart-app'
];
for (const s of scenarios) {
    assert(src.includes(`'${s}'`) || src.includes(`"${s}"`), `scenariusz ${s}`);
}

const issueTypes = ['flicker', 'error', 'fps', 'memory-leak', 'translation', 'responsive', 'touch', 'ux'];
for (const t of issueTypes) {
    assert(src.includes(`type: '${t}'`) || src.includes(`'${t}'`), `issue type ${t}`);
}

assert(src.includes('autoFix: false') || src.includes('autoFix:false'), 'autoFix false');
assert(!/fetch\s*\(\s*['"`]https?:/.test(src), 'brak zewnętrznego fetch');

const app = readFileSync(join(ROOT, 'js/app.js'), 'utf8');
assert(app.includes('initVirtualUser'), 'app.js initVirtualUser');

const panel = readFileSync(join(ROOT, 'js/diagnostics/healthDevPanel.js'), 'utf8');
assert(panel.includes('virtual-run') || panel.includes('Virtual User'), 'dev panel Virtual User');

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
assert(pkg.scripts?.['virtual-user'], 'npm run virtual-user');

const cli = spawnSync(process.execPath, ['scripts/virtual-user.mjs'], {
    cwd: ROOT,
    encoding: 'utf8'
});
assert(cli.status === 0, `CLI exit 0 (got ${cli.status})`);
assert(existsSync(join(ROOT, 'docs/virtual-user/latest.md')), 'docs/virtual-user/latest.md');
assert(existsSync(join(ROOT, 'docs/virtual-user/latest.json')), 'docs/virtual-user/latest.json');

const latest = JSON.parse(readFileSync(join(ROOT, 'docs/virtual-user/latest.json'), 'utf8'));
assert(latest.policy?.autoFix === false, 'policy autoFix');
assert(Array.isArray(latest.scenarios) && latest.scenarios.length >= 15, '15+ scenariuszy w raporcie');

// import round-trip
const dump = {
    title: 'Virtual User – raport testów',
    generatedAt: new Date().toISOString(),
    reason: 'test-import',
    policy: { autoFix: false },
    summary: {
        passed: 14,
        failed: 1,
        scenarios: 15,
        issueCount: 2,
        byType: { error: 1, fps: 1 },
        score: 80,
        memoryLeak: false
    },
    scenarios: scenarios.map((name) => ({ name, status: 'ok' })),
    issues: [
        { type: 'error', severity: 'high', title: 'Test error', scenario: 'cart', detail: 'x' },
        { type: 'fps', severity: 'medium', title: 'FPS drop', scenario: 'map', detail: '22' }
    ],
    hotspots: {
        flicker: [],
        errors: [{ type: 'error' }],
        fps: [{ type: 'fps' }],
        memoryLeak: [],
        translations: [],
        responsive: [],
        touch: [],
        ux: []
    }
};
const dumpPath = join(ROOT, 'docs/virtual-user/_test-dump.json');
import { writeFileSync, unlinkSync } from 'node:fs';
writeFileSync(dumpPath, JSON.stringify(dump), 'utf8');
const cli2 = spawnSync(
    process.execPath,
    ['scripts/virtual-user.mjs', `--import=${dumpPath}`],
    { cwd: ROOT, encoding: 'utf8' }
);
assert(cli2.status === 0, 'CLI import exit 0');
const imported = JSON.parse(readFileSync(join(ROOT, 'docs/virtual-user/latest.json'), 'utf8'));
assert(imported.summary?.score === 80, 'import score');
try { unlinkSync(dumpPath); } catch { /* ignore */ }

if (failed) {
    console.error(`\n${failed} failed`);
    process.exit(1);
}
console.log('\nVirtual User smoke test OK');
