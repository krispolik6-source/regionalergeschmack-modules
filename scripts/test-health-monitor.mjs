/**
 * Smoke test Application Health Monitor (statyczny skrypt + pliki runtime).
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

const runtimeFiles = [
    'js/diagnostics/healthMonitor.js',
    'js/diagnostics/healthDevPanel.js',
    'scripts/application-health.mjs'
];

for (const rel of runtimeFiles) {
    assert(existsSync(join(ROOT, rel)), `plik istnieje: ${rel}`);
}

const appJs = readFileSync(join(ROOT, 'js/app.js'), 'utf8');
assert(appJs.includes('initHealthMonitor'), 'app.js wywołuje initHealthMonitor');
assert(appJs.includes('initHealthDevPanel'), 'app.js wywołuje initHealthDevPanel');

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
assert(pkg.scripts?.health, 'npm script health');

const run = spawnSync(process.execPath, ['scripts/application-health.mjs'], {
    cwd: ROOT,
    encoding: 'utf8'
});
assert(run.status === 0, `application-health.mjs exit 0 (got ${run.status})`);
if (run.stderr) console.log(run.stderr.slice(0, 400));

const latest = join(ROOT, 'docs/health/latest.json');
assert(existsSync(latest), 'docs/health/latest.json po skanie');

if (existsSync(latest)) {
    const report = JSON.parse(readFileSync(latest, 'utf8'));
    const keys = ['performance', 'ux', 'accessibility', 'memory', 'dataQuality', 'translation', 'mobile', 'pwa'];
    for (const k of keys) {
        assert(typeof report.scores?.[k] === 'number', `score ${k}`);
    }
    assert(typeof report.overall === 'number', 'overall %');
    assert(report.policy?.autoFix === false, 'policy autoFix=false');
    assert(report.policy?.readOnly === true, 'policy readOnly');
}

if (failed) {
    console.error(`\n${failed} assertion(s) failed`);
    process.exit(1);
}
console.log('\nHealth monitor smoke test OK');
