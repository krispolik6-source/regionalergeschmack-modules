/**
 * Smoke test ETAP 29D Product Brain
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
    POLICY,
    LENSES,
    buildProductBrainReport,
    buildCandidatePool
} from '../js/diagnostics/productBrainCore.js';

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
assert(POLICY.requiresOwnerAcceptance === true, 'requires acceptance');
assert(POLICY.maxProposalsPerDay === 3, 'max 3');
assert(LENSES.length === 9, '9 lenses');

const core = readFileSync(join(ROOT, 'js/diagnostics/productBrainCore.js'), 'utf8');
assert(!/writeFileSync|spawnSync|fetch\s*\(/.test(core), 'core bez I/O');

const sample = buildProductBrainReport({
    health: { overall: 98, scores: { ux: 85, performance: 99, mobile: 100 } },
    emotion: { wantToReturn: { score: 89 }, scores: { fatigue: 50, climate: 93 } },
    livingBrand: { overall: 95 },
    director: { productScore: 92 },
    brandProtection: { status: 'WARNING', summary: { warning: 5, fail: 0 } },
    dream: { dreamScore: 88, top3: ['Home: jedna obietnica', 'Brand', 'UX'] },
    improve: { proposals: [{ id: 'a', title: 'Popraw UX / Mobile', priority: 'medium' }] }
});

assert(sample.proposals.length <= 3, `≤3 proposals (got ${sample.proposals.length})`);
assert(sample.proposals.length === 3, 'exactly 3 when rich signals');
assert(sample.proposals.every((p) => p.status === 'pending_acceptance'), 'pending acceptance');
assert(sample.proposals.every((p) => p.impact && p.risk && p.effort && p.expectedEffect), 'fields complete');
assert(sample.policy.maxProposalsPerDay === 3, 'report max 3');

const pool = buildCandidatePool({
    health: { scores: { ux: 70, mobile: 90, performance: 80 } },
    emotion: { scores: { fatigue: 40, wantToReturn: 70, climate: 80 } }
});
assert(pool.length >= 3, 'pool has candidates');

const cli = spawnSync(process.execPath, ['scripts/product-brain.mjs', '--dry-run'], {
    cwd: ROOT,
    encoding: 'utf8'
});
assert(cli.status === 0, `CLI exit 0 (got ${cli.status})`);
assert(existsSync(join(ROOT, 'docs/product-brain/latest.md')), 'latest.md');
assert(existsSync(join(ROOT, 'docs/product-brain/latest.json')), 'latest.json');
assert(existsSync(join(ROOT, 'docs/product-brain/pending-acceptance.json')), 'pending-acceptance');

const latest = JSON.parse(readFileSync(join(ROOT, 'docs/product-brain/latest.json'), 'utf8'));
assert(latest.proposals.length <= 3, 'latest ≤3');
assert(latest.policy.autoApply === false, 'latest autoApply');
assert(/właściciel/i.test(latest.question), 'owner question');

const md = readFileSync(join(ROOT, 'docs/product-brain/latest.md'), 'utf8');
assert(/3 propozycje|propozycje na jutro/i.test(md), 'md has proposals section');
assert(/Wpływ|impact/i.test(md), 'md has impact');
assert(/Ryzyko|risk/i.test(md), 'md has risk');
assert(/nie wdrażaj|akceptację/i.test(md), 'md waits for acceptance');

if (failed) {
    console.error(`\n${failed} failed`);
    process.exit(1);
}
console.log('\nProduct Brain smoke test OK');
