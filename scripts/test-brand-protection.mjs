/**
 * Smoke test ETAP 29C Brand Protection AI
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
    POLICY,
    resolveStatus,
    brandProtectionToMarkdown
} from '../js/diagnostics/brandProtectionCore.js';

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

assert(POLICY.autoApply === false, 'autoApply false');
assert(POLICY.autoFix === false, 'autoFix false');
assert(POLICY.autoModifyCode === false, 'autoModifyCode false');
assert(POLICY.brandBookAuthority === true, 'Brand Book authority');

assert(resolveStatus([]) === 'PASS', 'empty = PASS');
assert(resolveStatus([{ severity: 'warning' }]) === 'WARNING', 'warning status');
assert(resolveStatus([{ severity: 'fail' }, { severity: 'warning' }]) === 'FAIL', 'fail wins');

const md = brandProtectionToMarkdown({
    title: 'Test',
    generatedAt: 'x',
    status: 'PASS',
    summary: { filesScanned: 1, fail: 0, warning: 0 },
    categories: { logo: { fail: 0, warning: 0 } },
    findings: []
});
assert(/Status:.*PASS/i.test(md), 'markdown has PASS');
assert(/autoApply: false/i.test(md), 'markdown policy');

const core = readFileSync(join(ROOT, 'js/diagnostics/brandProtectionCore.js'), 'utf8');
assert(!/writeFileSync|spawnSync/.test(core), 'core bez zapisu plików');

const cliSrc = readFileSync(join(ROOT, 'scripts/brand-protection.mjs'), 'utf8');
assert(/autoApply/.test(cliSrc), 'CLI mentions autoApply');
assert(!/writeFileSync\([^)]*css|writeFileSync\([^)]*html/i.test(cliSrc), 'CLI nie zapisuje CSS/HTML produktu');

const run = spawnSync(process.execPath, ['scripts/brand-protection.mjs'], {
    cwd: ROOT,
    encoding: 'utf8'
});
assert(run.status === 0, `CLI exit 0 (got ${run.status})`);
assert(existsSync(join(ROOT, 'docs/brand/BRAND-PROTECTION.md')), 'BRAND-PROTECTION.md');
assert(existsSync(join(ROOT, 'docs/brand-protection/latest.md')), 'latest.md');
assert(existsSync(join(ROOT, 'docs/brand-protection/latest.json')), 'latest.json');

const latest = JSON.parse(readFileSync(join(ROOT, 'docs/brand-protection/latest.json'), 'utf8'));
assert(['PASS', 'WARNING', 'FAIL'].includes(latest.status), 'status enum');
assert(latest.policy?.autoApply === false, 'latest autoApply');
assert(latest.policy?.autoFix === false, 'latest autoFix');
assert(typeof latest.categories?.logo === 'object', 'has logo category');
assert(typeof latest.categories?.gradients === 'object', 'has gradients category');

const reportMd = readFileSync(join(ROOT, 'docs/brand-protection/latest.md'), 'utf8');
assert(/Brand Book/i.test(reportMd), 'md mentions Brand Book');
assert(/PASS|WARNING|FAIL/.test(reportMd), 'md has status');

if (failed) {
    console.error(`\n${failed} failed`);
    process.exit(1);
}
console.log('\nBrand Protection smoke test OK');
