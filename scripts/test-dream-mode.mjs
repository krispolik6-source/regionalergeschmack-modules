/**
 * Smoke test ETAP 29A Dream Mode
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { buildDreamReport, POLICY, DREAM_QUESTIONS } from '../js/diagnostics/dreamModeCore.js';

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
assert(POLICY.autoModifyCode === false, 'autoModifyCode false');
assert(POLICY.chatbot === false, 'not chatbot');
assert(POLICY.userFacing === false, 'not user-facing');
assert(DREAM_QUESTIONS.length === 11, '11 questions');

const core = readFileSync(join(ROOT, 'js/diagnostics/dreamModeCore.js'), 'utf8');
assert(!/writeFileSync|spawnSync|fetch\s*\(/.test(core), 'core bez I/O sieci/pliku (poza eksportem)');

const sample = buildDreamReport({
    health: { overall: 98, scores: { ux: 85, performance: 99, mobile: 100 } },
    emotion: { wantToReturn: { score: 89 }, scores: { fatigue: 50, climate: 93 }, strongest: 'przyjazność', weakest: 'fatigue' },
    livingBrand: { overall: 94, findings: [] },
    director: { productScore: 92, summary: { priorities: ['A', 'B', 'C'] }, qa: [] },
    improve: { summary: { total: 3 }, proposals: [{ priority: 'medium', title: 'UX' }] },
    qualityLoop: { summary: { regressionCount: 0 } },
    daily: { appScore: 95 }
});
assert(typeof sample.dreamScore === 'number', 'dreamScore number');
assert(sample.dreamScore >= 0 && sample.dreamScore <= 100, 'dreamScore 0-100');
assert(sample.qa.length === 11, 'qa 11');
assert(sample.policy.autoApply === false, 'report policy');

const cli = spawnSync(process.execPath, ['scripts/dream-mode.mjs', '--dry-run'], {
    cwd: ROOT,
    encoding: 'utf8'
});
assert(cli.status === 0, `CLI exit 0 (got ${cli.status})`);
assert(existsSync(join(ROOT, 'docs/dream/latest.md')), 'latest.md');
assert(existsSync(join(ROOT, 'docs/dream/latest.json')), 'latest.json');

const latest = JSON.parse(readFileSync(join(ROOT, 'docs/dream/latest.json'), 'utf8'));
assert(latest.policy?.autoApply === false, 'latest autoApply');
assert(typeof latest.dreamScore === 'number', 'latest dreamScore');

const md = readFileSync(join(ROOT, 'docs/dream/latest.md'), 'utf8');
assert(/Dream score/i.test(md), 'md has dream score');
assert(/Co dzisiaj było najlepsze/i.test(md), 'md has best Q');

if (failed) {
    console.error(`\n${failed} failed`);
    process.exit(1);
}
console.log('\nDream Mode smoke test OK');
