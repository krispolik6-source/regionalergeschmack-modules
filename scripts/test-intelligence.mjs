/**
 * Smoke test ETAP 33A — Regional Brain / check:intelligence
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
    POLICY,
    SIGNAL_IDS,
    buildRegionalBrainReport,
    computeRegionScore,
    scoreSignals,
    collectSignals,
    regionalBrainToMarkdown
} from '../js/intelligence/regionalBrain.js';

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
assert(POLICY.chatbot === false, 'no chatbot');
assert(POLICY.userFacing === false, 'not user-facing');
assert(POLICY.uiChanges === false, 'no UI changes');
assert(SIGNAL_IDS.length === 12, '12 signal dimensions');

const core = readFileSync(join(ROOT, 'js/intelligence/regionalBrain.js'), 'utf8');
assert(!/navigateTo|innerHTML|showToast|EventBus/.test(core), 'moduł bez UI / EventBus');

const sample = buildRegionalBrainReport({
    health: { overall: 96, scores: { ux: 85, performance: 99, mobile: 100 } },
    brandProtection: { status: 'WARNING', summary: { warning: 7, fail: 0 } },
    productBrain: { brainScore: 91 },
    selfReflection: { scores: { overall: 92, returnScore: 80 } },
    regionalIntelligence: {
        recommendation: {
            id: 'eveningHof',
            score: 134,
            signals: {
                weather: 'warm',
                weatherSource: 'proxy',
                hasLocation: false,
                openCounts: { bakeries: 1, farmers: 2, shops: 1, meat: 0 }
            }
        }
    }
}, { day: '2026-07-22', reason: 'unit-test' });

assert(typeof sample.regionScore === 'number', 'regionScore number');
assert(sample.regionScore >= 0 && sample.regionScore <= 100, 'regionScore 0–100');
assert(sample.dimensions.length === 12, '12 dimensions in report');
assert(sample.policy.autoApply === false, 'report policy');

const dims = scoreSignals(collectSignals({
    health: { overall: 50 }
}));
const lowish = computeRegionScore(dims);
assert(lowish >= 0 && lowish <= 100, 'computeRegionScore range');

const md = regionalBrainToMarkdown(sample);
assert(/Region Score/i.test(md), 'md has Region Score');
assert(/Health Monitor/i.test(md), 'md lists Health');
assert(/Brand Protection/i.test(md), 'md lists Brand');
assert(/Product Brain/i.test(md), 'md lists Product Brain');
assert(/Self Reflection/i.test(md), 'md lists Self Reflection');

const cli = spawnSync(process.execPath, ['scripts/intelligence.mjs', '--dry-run'], {
    cwd: ROOT,
    encoding: 'utf8'
});
assert(cli.status === 0, `CLI exit 0 (got ${cli.status})`);
assert(existsSync(join(ROOT, 'docs/intelligence/latest.md')), 'latest.md');
assert(existsSync(join(ROOT, 'docs/intelligence/latest.json')), 'latest.json');

const latest = JSON.parse(readFileSync(join(ROOT, 'docs/intelligence/latest.json'), 'utf8'));
assert(latest.regionScore >= 0 && latest.regionScore <= 100, 'latest regionScore');
assert(latest.policy.autoApply === false, 'latest autoApply');
assert(latest.etapa === '33A', 'etapa 33A');
assert(Array.isArray(latest.dimensions) && latest.dimensions.length === 12, 'latest 12 dims');

// app.js nie powinien importować intelligence (zero zmian aplikacji)
const appJs = readFileSync(join(ROOT, 'js/app.js'), 'utf8');
assert(!/intelligence\/regionalBrain/.test(appJs), 'app.js bez importu Regional Brain');

if (failed) {
    console.error(`\n${failed} failed`);
    process.exit(1);
}
console.log('\n--- Intelligence test ---');
console.log('OK');
console.log(`\nRegion Score (latest): ${latest.regionScore} / 100 (${latest.verdict})`);
