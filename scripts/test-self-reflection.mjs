/**
 * Smoke test ETAP 29E Self Reflection
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
    POLICY,
    REFLECTION_QUESTIONS,
    SCORE_KEYS,
    buildSelfReflectionReport
} from '../js/diagnostics/selfReflectionCore.js';

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
assert(REFLECTION_QUESTIONS.length === 10, '10 questions');
assert(SCORE_KEYS.length === 9, '9 score keys');
assert(/codziennie/i.test(POLICY.dailyQuestion), 'daily question');

const core = readFileSync(join(ROOT, 'js/diagnostics/selfReflectionCore.js'), 'utf8');
assert(!/writeFileSync|spawnSync|fetch\s*\(/.test(core), 'core bez I/O');

const sample = buildSelfReflectionReport({
    health: { overall: 98, scores: { ux: 85, performance: 99, mobile: 100, pwa: 100, accessibility: 100 } },
    emotion: {
        wantToReturn: { score: 89 },
        scores: { climate: 93, photos: 88, fatigue: 50, friendliness: 100, colors: 96 }
    },
    livingBrand: { overall: 95 },
    brandProtection: { status: 'WARNING', summary: { fail: 0, warning: 5 } },
    dream: { dreamScore: 88 },
    director: { productScore: 92 },
    realUsers: { summary: { averageScore: 97 } }
});

assert(typeof sample.scores.overall === 'number', 'overall number');
assert(sample.scores.overall >= 0 && sample.scores.overall <= 100, 'overall 0-100');
for (const k of SCORE_KEYS) {
    assert(typeof sample.scores[k] === 'number', `score ${k}`);
}
assert(sample.qa.length === 10, 'qa 10');
assert(Boolean(sample.dailyUse?.answer), 'daily use answer');
assert(sample.policy.autoApply === false, 'report policy');
assert(
    !/wdraż|deploy|commit/i.test(sample.dailyUse.answer),
    'answer is reflection (no deploy wording)'
);

const withWeek = buildSelfReflectionReport(
    {
        health: { overall: 90, scores: { ux: 90, performance: 90, mobile: 90 } },
        emotion: { wantToReturn: { score: 90 }, scores: { climate: 90, photos: 90, fatigue: 80, friendliness: 90, colors: 90 } },
        livingBrand: { overall: 90 },
        previousReflection: { scores: { overall: 80 } }
    },
    { day: '2026-07-21' }
);
assert(/→|tydzień|Δ/i.test(withWeek.qa.find((q) => q.id === 'betterThanWeek')?.answer || ''), 'week compare');

const cli = spawnSync(process.execPath, ['scripts/self-reflection.mjs', '--dry-run'], {
    cwd: ROOT,
    encoding: 'utf8'
});
assert(cli.status === 0, `CLI exit 0 (got ${cli.status})`);
assert(existsSync(join(ROOT, 'docs/self-reflection/latest.md')), 'latest.md');
assert(existsSync(join(ROOT, 'docs/self-reflection/latest.json')), 'latest.json');

const latest = JSON.parse(readFileSync(join(ROOT, 'docs/self-reflection/latest.json'), 'utf8'));
assert(latest.policy?.autoApply === false, 'latest autoApply');
assert(SCORE_KEYS.every((k) => k in latest.scores), 'all scores present');

const md = readFileSync(join(ROOT, 'docs/self-reflection/latest.md'), 'utf8');
assert(/Overall/i.test(md), 'md overall');
assert(/Czy jest piękna/i.test(md), 'md beautiful Q');
assert(/Czy chciałbym korzystać/i.test(md), 'md daily Q');
assert(/Return Score/i.test(md), 'md return score');

if (failed) {
    console.error(`\n${failed} failed`);
    process.exit(1);
}
console.log('\nSelf Reflection smoke test OK');
