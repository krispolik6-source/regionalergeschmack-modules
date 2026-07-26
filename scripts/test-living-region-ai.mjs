/**
 * Smoke test ETAP 33E — Living Region AI
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
    POLICY,
    PULSE_SIGNAL_IDS,
    enforceOneSentence,
    buildLivingRegionAiReport,
    composePulseSentence,
    collectPulseSignals,
    computeRegionPulse
} from '../js/intelligence/livingRegionAi.js';

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
assert(POLICY.chatbot === false, 'no chatbot');
assert(POLICY.popups === false, 'no popups');
assert(POLICY.aiWindow === false, 'no AI window');
assert(POLICY.uiChanges === false, 'no UI changes');
assert(POLICY.maxSentences === 1, 'max 1 sentence');
assert(PULSE_SIGNAL_IDS.length === 8, '8 pulse signals');

const core = readFileSync(join(ROOT, 'js/intelligence/livingRegionAi.js'), 'utf8');
assert(!/navigateTo|innerHTML|showToast|EventBus/.test(core), 'moduł bez UI');

assert(
    enforceOneSentence('Raz. Dwa. Trzy.') === 'Raz.',
    'enforceOneSentence keeps first only'
);

const report = buildLivingRegionAiReport({
    regionalIntelligence: {
        generatedAt: new Date().toISOString(),
        recommendation: {
            signals: {
                weather: 'warm',
                season: 'summer',
                weekday: 6,
                hasLocation: false,
                openCounts: { bakeries: 1, farmers: 3, shops: 1, meat: 0 }
            }
        }
    },
    health: { generatedAt: new Date().toISOString() },
    userTaste: {
        signalCount: 20,
        returnProbability: 70,
        tasteProfile: { confidence: 80, signalCount: 20 }
    }
}, { day: '2026-07-22', reason: 'unit' });

assert(report.regionPulse >= 0 && report.regionPulse <= 100, 'pulse range');
assert(typeof report.sentence === 'string' && report.sentence.length > 10, 'sentence present');
assert(report.sentenceCount === 1, `exactly 1 sentence (got ${report.sentenceCount})`);
assert(!/\.\s+[A-ZĄĆĘŁŃÓŚŹŻ]/.test(report.sentence.slice(0, -1)), 'no second sentence pattern');
assert(report.policy.autoApply === false, 'report policy');

const sig = collectPulseSignals({
    regionalIntelligence: {
        recommendation: { signals: { weather: 'rain', openCounts: { farmers: 0 } } }
    }
});
const pulse = computeRegionPulse(sig.dimensions);
const line = composePulseSentence(pulse, sig);
assert(enforceOneSentence(line) === line || line.endsWith('.'), 'compose one sentence');

const cli = spawnSync(process.execPath, ['scripts/living-region-ai.mjs'], {
    cwd: ROOT,
    encoding: 'utf8'
});
assert(cli.status === 0, `CLI exit 0 (got ${cli.status})`);
assert(existsSync(join(ROOT, 'docs/living-region/latest.md')), 'latest.md');

const md = readFileSync(join(ROOT, 'docs/living-region/latest.md'), 'utf8');
assert(/Region Pulse/i.test(md), 'md Region Pulse');
assert(/Zdanie dnia/i.test(md), 'md sentence');
assert(/autoApply/i.test(md), 'md autoApply');

const latest = JSON.parse(readFileSync(join(ROOT, 'docs/living-region/latest.json'), 'utf8'));
assert(latest.sentenceCount === 1, 'json sentenceCount 1');

const appJs = readFileSync(join(ROOT, 'js/app.js'), 'utf8');
assert(!/livingRegionAi/.test(appJs), 'app.js bez importu Living Region AI');

const livingUx = readFileSync(join(ROOT, 'js/presentation/livingRegion.js'), 'utf8');
assert(!/livingRegionAi|Region Pulse/.test(livingUx), 'presentation livingRegion nietknięty');

if (failed) {
    console.error(`\n${failed} failed`);
    process.exit(1);
}
console.log('\n--- Living Region AI test ---');
console.log('OK');
console.log(`\nRegion Pulse: ${latest.regionPulse} · ${latest.sentence}`);
