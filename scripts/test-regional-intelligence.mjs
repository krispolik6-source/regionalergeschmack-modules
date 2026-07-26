/**
 * Smoke test ETAP 29B Regional Intelligence
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
    POLICY,
    REGIONAL_TIPS,
    buildProxyContext,
    pickRegionalRecommendation,
    buildRegionalReport
} from '../js/diagnostics/regionalIntelligenceCore.js';

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

assert(POLICY.chatbot === false, 'not chatbot');
assert(POLICY.aiAssistant === false, 'not AI assistant');
assert(POLICY.ads === false, 'no ads');
assert(POLICY.salesPitch === false, 'no sales');
assert(POLICY.maxMainRecommendations === 1, 'max 1 recommendation');
assert(REGIONAL_TIPS.some((t) => t.id === 'visitApiary'), 'has visitApiary tip');

const summerMorning = buildProxyContext(new Date('2026-07-21T09:00:00'), {
    weather: 'warm',
    dayPart: 'morning',
    season: 'summer',
    month: 7,
    weekday: 2,
    openCounts: { bakeries: 2, farmers: 3, shops: 1, meat: 0 }
});
const picked = pickRegionalRecommendation(summerMorning, {
    affinity: new Map([['honey', 3], ['farmers', 2]])
});
assert(Boolean(picked.tip), 'picks a tip');
assert(typeof picked.score === 'number', 'has score');

const report = buildRegionalReport(summerMorning, { day: '2026-07-21' });
assert(report.recommendationsCount === 1, 'exactly one recommendation');
assert(report.recommendations.length === 1, 'recommendations array length 1');
assert(report.policy.maxMainRecommendations === 1, 'report policy');
assert(Boolean(report.recommendation?.headline), 'has headline');
assert(Boolean(report.recommendation?.support), 'has support');
assert(!/kup|promo|rabat|sale|chatbot|AI Assistant/i.test(
    `${report.recommendation.headline} ${report.recommendation.support}`
), 'no sales/chat language');

const core = readFileSync(join(ROOT, 'js/diagnostics/regionalIntelligenceCore.js'), 'utf8');
assert(!/writeFileSync|localStorage|fetch\s*\(/.test(core), 'core bez I/O przeglądarki');

const home = readFileSync(join(ROOT, 'js/views/home.js'), 'utf8');
assert(/getRegionalIntelligence/.test(home), 'home uses Regional Intelligence');
assert(/data-home-section="regional-intelligence"/.test(home), 'home has RI section');

const i18n = readFileSync(join(ROOT, 'js/translations-regional-intelligence.js'), 'utf8');
assert(/Dzisiaj warto odwiedzić pasiekę/.test(i18n), 'PL apiary example');
assert(/Pogoda sprzyja spacerowi/.test(i18n), 'PL apiary support');

const cli = spawnSync(process.execPath, ['scripts/regional-intelligence.mjs', '--dry-run'], {
    cwd: ROOT,
    encoding: 'utf8'
});
assert(cli.status === 0, `CLI exit 0 (got ${cli.status})`);
assert(existsSync(join(ROOT, 'docs/regional-intelligence/latest.md')), 'latest.md');
assert(existsSync(join(ROOT, 'docs/regional-intelligence/latest.json')), 'latest.json');

const latest = JSON.parse(readFileSync(join(ROOT, 'docs/regional-intelligence/latest.json'), 'utf8'));
assert(latest.recommendationsCount === 1, 'latest count 1');
assert(latest.policy.chatbot === false, 'latest not chatbot');

if (failed) {
    console.error(`\n${failed} failed`);
    process.exit(1);
}
console.log('\nRegional Intelligence smoke test OK');
