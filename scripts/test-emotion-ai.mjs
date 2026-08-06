/**
 * Smoke test ETAP 25 – Emotion AI
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { assertLazyDiagnosticsInit } from './lib/diagnosticsOrchestratorAssert.mjs';
import { evaluateEmotion, EMOTION_DIMENSIONS, POLICY } from '../js/diagnostics/emotionAiCore.js';

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

assert(POLICY.autoFix === false, 'policy autoFix');
assert(POLICY.focus === 'emotion-and-return-desire', 'focus emotion');
assert(EMOTION_DIMENSIONS.includes('climate'), 'dim climate');
assert(EMOTION_DIMENSIONS.includes('friendliness'), 'dim friendliness');

const warm = evaluateEmotion({
    seasonThemeActive: true,
    climateLayerPresent: true,
    climateReady: true,
    ambientAvailable: true,
    warmBrandPalette: true,
    coldBlueDominant: false,
    goldGreenCreamHits: 8,
    imageCount: 20,
    imagesWithAlt: 18,
    placeholderRatio: 0.05,
    visibleTextChars: 1200,
    headingCount: 3,
    paragraphDensity: 4,
    ctaCount: 3,
    competingBlocks: 4,
    interactiveCount: 20,
    hasGreeting: true,
    hasWarmCopy: true,
    hasEmptyStateCare: true,
    softRadius: true,
    healthUx: 90
});
assert(warm.wantToReturn.score >= 75, `warm return score (${warm.wantToReturn.score})`);
assert(warm.question.includes('emocje'), 'question emocje');
assert(warm.returnQuestion.includes('wrócić'), 'return question');

const cold = evaluateEmotion({
    warmBrandPalette: false,
    coldBlueDominant: true,
    climateLayerPresent: false,
    imageCount: 1,
    placeholderRatio: 0.8,
    visibleTextChars: 5000,
    ctaCount: 12,
    competingBlocks: 14,
    hasGreeting: false,
    hasWarmCopy: false
});
assert(cold.wantToReturn.score < warm.wantToReturn.score, 'cold < warm return');

const runtime = join(ROOT, 'js/diagnostics/emotionAi.js');
assert(existsSync(runtime), 'emotionAi.js');
const src = readFileSync(runtime, 'utf8');
assert(src.includes('__RG_EMOTION__'), '__RG_EMOTION__');
assert(src.includes('autoFix') || src.includes('POLICY'), 'policy ref');

assertLazyDiagnosticsInit(assert, ROOT, 'emotionAi.initEmotionAi', 'orchestrator lazy emotionAi');

const panel = readFileSync(join(ROOT, 'js/diagnostics/healthDevPanel.js'), 'utf8');
assert(panel.includes('Emotion') || panel.includes('emotion'), 'dev panel');

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
assert(pkg.scripts?.emotion, 'npm run emotion');
assert(pkg.scripts?.['check:emotion'], 'npm run check:emotion');

assert(existsSync(join(ROOT, 'docs/emotion/README.md')), 'README');

const cli = spawnSync(process.execPath, ['scripts/emotion-ai.mjs'], {
    cwd: ROOT,
    encoding: 'utf8'
});
assert(cli.status === 0, `CLI exit 0 (got ${cli.status})`);
assert(existsSync(join(ROOT, 'docs/emotion/latest.json')), 'latest.json');
assert(existsSync(join(ROOT, 'docs/emotion/latest.md')), 'latest.md');

const latest = JSON.parse(readFileSync(join(ROOT, 'docs/emotion/latest.json'), 'utf8'));
assert(latest.policy?.autoFix === false, 'CLI autoFix');
assert(latest.wantToReturn?.score != null, 'wantToReturn score');
assert(latest.scores?.climate != null, 'scores.climate');

console.log(failed ? `\n${failed} failed` : '\nAll emotion checks passed.');
process.exit(failed ? 1 : 0);
