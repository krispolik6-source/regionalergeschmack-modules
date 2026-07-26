/**
 * Smoke test ETAP 45 — Product Director AI
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
    POLICY,
    HEADLINE,
    gatherCandidates,
    pickTopRecommendations,
    buildProductDirectorAiReport,
    formatDirectorBoard,
    toDirectorTitle
} from '../js/intelligence/productDirectorAi.js';

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
assert(/wpływ na jakość/.test(HEADLINE), 'headline PL');

const core = readFileSync(join(ROOT, 'js/intelligence/productDirectorAi.js'), 'utf8');
assert(!/navigateTo|innerHTML|showToast/.test(core), 'bez UI runtime');
assert(!/docs\/product-director-ai/.test(core) === false, 'pisze tylko do docs/product-director-ai');
assert(!/join\(root,\s*'js\//.test(core) && !/join\(root,\s*'css\//.test(core), 'nie mutuje js/css produktu');
assert(POLICY.autoApply === false, 'policy lock');

assert(toDirectorTitle('Skrócenie czasu ładowania mapy') === 'Skrócenie czasu ładowania mapy.', 'title ends with period');

const sources = {
    productIntelligence: {
        questions: [
            { id: 'mapSlow', answer: 'tak', severity: 70 },
            { id: 'homeHeavy', answer: 'nie', severity: 20 }
        ],
        proposals: [
            {
                id: 'pi-map',
                title: 'Odłóż Leaflet do lazy load przy otwarciu Map',
                why: 'mapa',
                impact: 'high',
                priority: 80,
                status: 'pending_acceptance'
            }
        ]
    },
    livingRegion: { regionPulse: 79, sentence: 'Region żyje' },
    regionalBrain: { regionScore: 82 },
    productBrain: {
        proposals: [
            { id: 'b1', title: 'Poprawa kontrastu w trybie nocnym', impact: 'high', rank: 1 },
            { id: 'b2', title: 'Nowa funkcja chatbot AI', impact: 'high', rank: 2, addsFeature: true }
        ]
    },
    emotion: { scores: { fatigue: 48 } },
    health: { scores: { ux: 90, performance: 99 } },
    uiGuardian: { verdict: 'WARNING' },
    releaseValidator: { releaseScore: 97, readyForProduction: 'YES' }
};

const cands = gatherCandidates(sources);
assert(cands.length >= 3, `candidates ≥3 (got ${cands.length})`);
assert(!cands.some((c) => /chatbot/i.test(c.title)), 'feature-bloat filtered');

const top = pickTopRecommendations(cands, 3);
assert(top.length <= 3, `top ≤3 (got ${top.length})`);
assert(top.every((r) => r.status === 'pending_acceptance'), 'pending_acceptance');
assert(new Set(top.map((r) => r.theme)).size === top.length, 'unique themes');

const report = buildProductDirectorAiReport(sources, { day: '2026-07-23', reason: 'unit' });
assert(report.recommendations.length <= 3, 'report ≤3');
assert(report.policy.autoApply === false, 'report autoApply');
assert(report.headline === HEADLINE, 'report headline');

const board = formatDirectorBoard(report);
assert(board.includes(HEADLINE), 'board has headline');
assert(/^\d+\. /m.test(board), 'board numbered list');
assert(/Żadnych automatycznych zmian/.test(board), 'board no-auto note');

const cli = spawnSync(process.execPath, ['scripts/product-director-ai.mjs'], {
    cwd: ROOT,
    encoding: 'utf8'
});
assert(cli.status === 0, `CLI exit 0 (got ${cli.status})`);
assert(cli.stdout.includes(HEADLINE), 'CLI prints headline');
assert(existsSync(join(ROOT, 'docs/product-director-ai/latest.md')), 'latest.md');
assert(existsSync(join(ROOT, 'docs/product-director-ai/latest.json')), 'latest.json');
assert(existsSync(join(ROOT, 'docs/product-director-ai/pending-acceptance.json')), 'pending-acceptance');

const md = readFileSync(join(ROOT, 'docs/product-director-ai/latest.md'), 'utf8');
assert(/ETAP 45/.test(md), 'md etapa');
assert(/autoApply/.test(md), 'md policy');

const pending = JSON.parse(
    readFileSync(join(ROOT, 'docs/product-director-ai/pending-acceptance.json'), 'utf8')
);
assert(pending.policy.autoApply === false, 'pending autoApply');
assert((pending.recommendations || []).length <= 3, 'pending ≤3');

if (failed) {
    console.error(`\nProduct Director AI smoke: ${failed} fail(s)`);
    process.exit(1);
}
console.log('\nProduct Director AI smoke OK');
