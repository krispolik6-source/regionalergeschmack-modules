/**
 * Smoke test ETAP 27 – AI Product Director
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
    buildProductDirectorBriefing,
    DIRECTOR_QUESTIONS,
    POLICY,
    COMPETITION_BASELINE
} from '../js/diagnostics/productDirectorCore.js';

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

assert(POLICY.autoFix === false, 'autoFix false');
assert(POLICY.role === 'product-director', 'role');
assert(DIRECTOR_QUESTIONS.length === 8, '8 questions');
assert(COMPETITION_BASELINE.length >= 4, 'competition baseline');

const ids = DIRECTOR_QUESTIONS.map((q) => q.id);
for (const id of ['improve', 'remove', 'simplify', 'slowdown', 'annoy', 'returns', 'competition', 'monthAgo']) {
    assert(ids.includes(id), `question ${id}`);
}

const briefing = buildProductDirectorBriefing({
    health: { overall: 96, scores: { performance: 90, ux: 85, mobile: 92, memory: 95, pwa: 98, translation: 100 } },
    improve: { proposals: [{ priority: 'high', title: 'Touch targets' }] },
    virtual: { summary: { score: 80, byType: { touch: 2, fps: 1 } }, issues: [{ severity: 'high', title: 'Mały przycisk', scenario: 'home' }] },
    emotion: { wantToReturn: { score: 89, short: 'Chce się wracać' }, scores: { fatigue: 55, photos: 88, textLoad: 80 } },
    livingBrand: { overall: 81, status: 'drift', verdict: 'Dryf', findings: [{ check: 'fonts', severity: 'high' }] },
    realUsers: { summary: { avgScore: 97, fail: 0 }, worst: [{ code: 'P08', score: 80, tagline: 'Starszy Samsung' }] },
    daily: { appScore: 95, failedChecks: ['fps'] },
    monthBaseline: { day: '2026-06-21', productScore: 82 }
});

assert(briefing.qa.length === 8, 'qa 8');
assert(briefing.productScore != null, 'productScore');
assert(briefing.qa.find((q) => q.id === 'monthAgo').answer.includes('82'), 'month compare');
assert(briefing.qa.find((q) => q.id === 'competition').answer.includes('Google Maps'), 'competition');
assert(briefing.policy.autoFix === false, 'briefing policy');

const runtime = join(ROOT, 'js/diagnostics/productDirector.js');
assert(existsSync(runtime), 'productDirector.js');
assert(readFileSync(runtime, 'utf8').includes('__RG_DIRECTOR__'), 'console API');

const app = readFileSync(join(ROOT, 'js/app.js'), 'utf8');
assert(app.includes('initProductDirector'), 'app.js init');

const panel = readFileSync(join(ROOT, 'js/diagnostics/healthDevPanel.js'), 'utf8');
assert(panel.includes('Product Director') || panel.includes('director'), 'dev panel');

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
assert(pkg.scripts?.director, 'npm run director');
assert(pkg.scripts?.['check:director'], 'npm run check:director');

assert(existsSync(join(ROOT, 'docs/product-director/README.md')), 'README');

const cli = spawnSync(process.execPath, ['scripts/product-director.mjs'], {
    cwd: ROOT,
    encoding: 'utf8'
});
assert(cli.status === 0, `CLI exit 0 (got ${cli.status})`);
if (cli.status !== 0) console.error(cli.stderr?.slice(0, 500));

assert(existsSync(join(ROOT, 'docs/product-director/latest.json')), 'latest.json');
assert(existsSync(join(ROOT, 'docs/product-director/latest.md')), 'latest.md');

const latest = JSON.parse(readFileSync(join(ROOT, 'docs/product-director/latest.json'), 'utf8'));
assert(latest.qa?.length === 8, 'CLI qa 8');
assert(latest.policy?.autoFix === false, 'CLI autoFix');

console.log(failed ? `\n${failed} failed` : '\nAll director checks passed.');
process.exit(failed ? 1 : 0);
