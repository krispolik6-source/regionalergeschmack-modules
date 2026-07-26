/**
 * Smoke test ETAP 26 – Living Brand
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { BRAND_PALETTE, FORBIDDEN_COLD_BLUE, LOGO, FONTS, POLICY, isForbiddenBlue } from '../js/diagnostics/livingBrandBook.js';
import { buildLivingBrandReport } from '../js/diagnostics/livingBrandCore.js';

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

assert(POLICY.autoFix === false, 'autoFix false');
assert(POLICY.daily === true, 'daily');
assert(normalizeOk(BRAND_PALETTE.green), 'palette green');
assert(isForbiddenBlue('#2563eb'), 'forbids #2563eb');
assert(!isForbiddenBlue('#2a3f28'), 'allows brand green');
assert(LOGO.master.includes('logo-master.svg'), 'logo master');
assert(FONTS.display === 'Literata', 'Literata');
assert(FONTS.sans === 'Source Sans 3', 'Source Sans 3');
assert(FORBIDDEN_COLD_BLUE.length >= 8, 'cold blue list');

const clean = buildLivingBrandReport([]);
assert(clean.status === 'aligned', 'empty = aligned');
assert(clean.overall === 100, 'empty overall 100');

const drifted = buildLivingBrandReport([
    { check: 'coldBlue', severity: 'critical', title: 'blue', file: 'x.css' },
    { check: 'fonts', severity: 'high', title: 'Inter', file: 'y.css' }
]);
assert(drifted.status === 'drift', 'drift status');
assert(drifted.findings.every((f) => f.autoApply === false), 'findings no autoApply');

function normalizeOk(h) {
    return /^#[0-9a-f]{6}$/i.test(h);
}

const runtime = join(ROOT, 'js/diagnostics/livingBrand.js');
assert(existsSync(runtime), 'livingBrand.js');
assert(readFileSync(runtime, 'utf8').includes('__RG_LIVING_BRAND__'), 'console API');

const app = readFileSync(join(ROOT, 'js/app.js'), 'utf8');
assert(app.includes('initLivingBrand'), 'app.js init');

const panel = readFileSync(join(ROOT, 'js/diagnostics/healthDevPanel.js'), 'utf8');
assert(panel.includes('Living Brand') || panel.includes('living-brand'), 'dev panel');

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
assert(pkg.scripts?.['living-brand'], 'npm run living-brand');
assert(pkg.scripts?.['check:living-brand'], 'npm run check:living-brand');

assert(existsSync(join(ROOT, 'docs/living-brand/README.md')), 'README');

const cli = spawnSync(process.execPath, ['scripts/living-brand.mjs'], {
    cwd: ROOT,
    encoding: 'utf8'
});
assert(cli.status === 0, `CLI exit 0 (got ${cli.status})`);
if (cli.status !== 0) console.error(cli.stderr?.slice(0, 400));

assert(existsSync(join(ROOT, 'docs/living-brand/latest.json')), 'latest.json');
assert(existsSync(join(ROOT, 'docs/living-brand/latest.md')), 'latest.md');

const latest = JSON.parse(readFileSync(join(ROOT, 'docs/living-brand/latest.json'), 'utf8'));
assert(latest.policy?.autoFix === false, 'CLI policy');
assert(Array.isArray(latest.checks), 'checks array');
assert(latest.checks.length === 7, '7 checks');
assert(typeof latest.overall === 'number', 'overall');

console.log(failed ? `\n${failed} failed` : '\nAll living-brand checks passed.');
process.exit(failed ? 1 : 0);
