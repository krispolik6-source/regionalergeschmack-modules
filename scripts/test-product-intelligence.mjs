/**
 * Smoke test ETAP 33D — Product Intelligence
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
    POLICY,
    DAILY_QUESTIONS,
    buildProductIntelligenceReport,
    pickTopProposals,
    buildProposalCandidates,
    answerDailyQuestions
} from '../js/intelligence/productIntelligenceDaily.js';

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
assert(POLICY.maxProposalsPerDay === 3, 'max 3');
assert(DAILY_QUESTIONS.length === 5, '5 questions');

const core = readFileSync(join(ROOT, 'js/intelligence/productIntelligenceDaily.js'), 'utf8');
assert(!/navigateTo|innerHTML|showToast/.test(core), 'bez UI');

const answers = answerDailyQuestions({
    emotion: { scores: { fatigue: 50 } },
    selfReflection: {
        qa: [
            { id: 'homeOverloaded', score: 68 },
            { id: 'findProducer30s', score: 98, verdict: 'yes' }
        ]
    },
    health: { scores: { ux: 85, performance: 99 } }
}, { homeV1Deployed: true });

assert(answers.length === 5, '5 answers');
assert(answers.every((a) => a.answer && a.question), 'answers shaped');

const report = buildProductIntelligenceReport({
    emotion: { scores: { fatigue: 50 } },
    selfReflection: {
        qa: [
            { id: 'homeOverloaded', score: 68 },
            { id: 'findProducer30s', score: 98, verdict: 'yes' }
        ]
    },
    health: { scores: { ux: 85, performance: 99 } },
    flags: { homeV1Deployed: true }
}, { day: '2026-07-22', reason: 'unit', homeV1Deployed: true });

assert(report.proposals.length <= 3, `≤3 proposals (got ${report.proposals.length})`);
assert(report.proposals.length === 3, 'exactly 3 when signals rich');
assert(report.proposals.every((p) => p.status === 'pending_acceptance'), 'pending');
assert(report.policy.autoApply === false, 'report autoApply');

const many = buildProposalCandidates(answers);
assert(pickTopProposals(many, 3).length <= 3, 'pick top ≤3');

const cli = spawnSync(process.execPath, ['scripts/product-intelligence.mjs'], {
    cwd: ROOT,
    encoding: 'utf8'
});
assert(cli.status === 0, `CLI exit 0 (got ${cli.status})`);
assert(existsSync(join(ROOT, 'docs/product-intelligence/latest.md')), 'latest.md');

const md = readFileSync(join(ROOT, 'docs/product-intelligence/latest.md'), 'utf8');
assert(/3 najlepsze propozycje/i.test(md), 'md has 3 proposals section');
assert(/autoApply/i.test(md), 'md autoApply');
assert(/Czy Home jest zbyt ciężki/i.test(md), 'md Q1');

const appJs = readFileSync(join(ROOT, 'js/app.js'), 'utf8');
assert(!/productIntelligenceDaily/.test(appJs), 'app.js bez importu');

if (failed) {
    console.error(`\n${failed} failed`);
    process.exit(1);
}
console.log('\n--- Product Intelligence test ---');
console.log('OK');
