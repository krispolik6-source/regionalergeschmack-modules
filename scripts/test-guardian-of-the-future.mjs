/**
 * Smoke test ETAP 30 Guardian of the Future
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
    POLICY,
    METRICS,
    linearRegression,
    extractMetrics,
    buildGuardianFutureReport,
    analyzeMetricTrend
} from '../js/diagnostics/guardianOfTheFutureCore.js';

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
assert(POLICY.predictive === true, 'predictive');
assert(METRICS.length >= 8, 'metrics defined');

const reg = linearRegression([
    { x: 0, y: 100 },
    { x: 1, y: 97 },
    { x: 2, y: 94 }
]);
assert(reg.b < 0, 'detects falling slope');

const declining = buildGuardianFutureReport([
    { day: '2026-07-01', metrics: { performance: 99, ux: 90, cssConflicts: 20, fatigue: 70, livingBrand: 96, wantToReturn: 92, improveCount: 2, guardianFindings: 0, brandWarnings: 0, healthOverall: 98, returnScore: 88, reflectionOverall: 90 } },
    { day: '2026-07-08', metrics: { performance: 96, ux: 86, cssConflicts: 30, fatigue: 60, livingBrand: 93, wantToReturn: 88, improveCount: 5, guardianFindings: 1, brandWarnings: 2, healthOverall: 95, returnScore: 82, reflectionOverall: 86 } },
    { day: '2026-07-15', metrics: { performance: 93, ux: 82, cssConflicts: 42, fatigue: 50, livingBrand: 90, wantToReturn: 84, improveCount: 9, guardianFindings: 2, brandWarnings: 5, healthOverall: 92, returnScore: 76, reflectionOverall: 82 } },
    { day: '2026-07-21', metrics: { performance: 90, ux: 78, cssConflicts: 55, fatigue: 42, livingBrand: 87, wantToReturn: 80, improveCount: 14, guardianFindings: 3, brandWarnings: 8, healthOverall: 88, returnScore: 70, reflectionOverall: 78 } }
]);
assert(['WATCH', 'ALERT'].includes(declining.status), `declining status WATCH/ALERT (got ${declining.status})`);
assert(declining.predictions.length > 0, 'has predictions');
assert(declining.predictions.some((p) => /miesiąc|tydzień|Home|CSS|mark/i.test(p.message)), 'predictive language');
assert(declining.policy.autoApply === false, 'report policy');

const cssTrend = analyzeMetricTrend(
    [
        { day: 'a', metrics: { cssConflicts: 20 } },
        { day: 'b', metrics: { cssConflicts: 40 } }
    ],
    METRICS.find((m) => m.id === 'cssConflicts')
);
assert(cssTrend.direction === 'rising', 'css rising');

const extracted = extractMetrics({
    health: { overall: 98, scores: { performance: 99, ux: 85 }, static: { css: { conflictCount: 40 } }, findings: [] },
    emotion: { wantToReturn: { score: 89 }, scores: { fatigue: 50 } },
    livingBrand: { overall: 95 },
    brandProtection: { summary: { warning: 5, fail: 0 } },
    improve: { proposals: [1, 2, 3] },
    guardian: { findings: [{ severity: 'high' }] },
    selfReflection: { scores: { returnScore: 80, overall: 92 } }
});
assert(extracted.cssConflicts === 40, 'extract css');
assert(extracted.improveCount === 3, 'extract improve');

const core = readFileSync(join(ROOT, 'js/diagnostics/guardianOfTheFutureCore.js'), 'utf8');
assert(!/writeFileSync|spawnSync/.test(core), 'core bez I/O zapisu');

const cli = spawnSync(process.execPath, ['scripts/guardian-of-the-future.mjs', '--dry-run'], {
    cwd: ROOT,
    encoding: 'utf8'
});
assert(cli.status === 0, `CLI exit 0 (got ${cli.status})`);
assert(existsSync(join(ROOT, 'docs/guardian-future/latest.md')), 'latest.md');
assert(existsSync(join(ROOT, 'docs/guardian-future/latest.json')), 'latest.json');

const latest = JSON.parse(readFileSync(join(ROOT, 'docs/guardian-future/latest.json'), 'utf8'));
assert(['CLEAR', 'WATCH', 'ALERT'].includes(latest.status), 'status enum');
assert(latest.policy?.autoApply === false, 'latest autoApply');
assert(Array.isArray(latest.predictions), 'predictions array');
assert(Array.isArray(latest.trends), 'trends array');

const md = readFileSync(join(ROOT, 'docs/guardian-future/latest.md'), 'utf8');
assert(/Guardian of the Future/i.test(md), 'md title');
assert(/Prognozy|CLEAR|WATCH|ALERT/i.test(md), 'md status/predictions');

// Full run writes history
const full = spawnSync(process.execPath, ['scripts/guardian-of-the-future.mjs'], {
    cwd: ROOT,
    encoding: 'utf8'
});
assert(full.status === 0, 'full CLI exit 0');
assert(existsSync(join(ROOT, 'docs/guardian-future/history.json')), 'history.json');

if (failed) {
    console.error(`\n${failed} failed`);
    process.exit(1);
}
console.log('\nGuardian of the Future smoke test OK');
