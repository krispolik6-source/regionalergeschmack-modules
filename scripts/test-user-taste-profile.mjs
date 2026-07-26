/**
 * Smoke test ETAP 33B — User Taste Profile
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
    POLICY,
    buildUserTasteReport,
    computeReturnProbability,
    buildTasteProfile,
    normalizeLocalSnapshot
} from '../js/intelligence/userTasteProfile.js';

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
assert(POLICY.network === false, 'no network');
assert(POLICY.sendToInternet === false, 'no internet send');
assert(POLICY.userFacing === false, 'not user-facing');
assert(POLICY.uiChanges === false, 'no UI');

const core = readFileSync(join(ROOT, 'js/intelligence/userTasteProfile.js'), 'utf8');
assert(!/fetch\s*\(|XMLHttpRequest|navigator\.sendBeacon/.test(core), 'moduł bez wysyłki sieciowej');
assert(!/navigateTo|innerHTML|showToast/.test(core), 'moduł bez UI');

const rich = normalizeLocalSnapshot({
    signalCount: 42,
    categories: { farmers: 12, bakeries: 8, honey: 5 },
    producers: { hof_a: 9, hof_b: 4 },
    products: { bread: 6, honey_jar: 5 },
    hours: { 9: 7, 17: 5, 11: 3 },
    distancesKm: [4.2, 6.1, 5.0],
    visits: [
        { id: 'hof_a', at: Date.now() - 86400000, category: 'farmers' },
        { id: 'hof_b', at: Date.now() - 172800000, category: 'farmers' }
    ]
});
const taste = buildTasteProfile(rich);
const ret = computeReturnProbability(rich, taste);
assert(taste.label !== 'cold-start', 'rich → not cold-start');
assert(taste.favoriteCategories[0]?.id === 'farmers', 'top category farmers');
assert(taste.averageTravelDistanceKm != null, 'avg distance');
assert(ret >= 40 && ret < 100, `return in range, not maxed (got ${ret})`);

const cold = buildUserTasteReport(null, { day: '2026-07-22', reason: 'unit' });
assert(cold.tasteProfile.label === 'cold-start', 'empty → cold-start');
assert(cold.returnProbability >= 0 && cold.returnProbability <= 100, 'cold return range');
assert(cold.privacy.sendToInternet === false, 'privacy flag');

// CLI zapisuje tylko user-profile.md (nie wymuszamy json)
const cli = spawnSync(process.execPath, ['scripts/user-taste-profile.mjs'], {
    cwd: ROOT,
    encoding: 'utf8'
});
assert(cli.status === 0, `CLI exit 0 (got ${cli.status})`);
assert(existsSync(join(ROOT, 'docs/intelligence/user-profile.md')), 'user-profile.md');

const md = readFileSync(join(ROOT, 'docs/intelligence/user-profile.md'), 'utf8');
assert(/Taste Profile/i.test(md), 'md Taste Profile');
assert(/Return Probability/i.test(md), 'md Return Probability');
assert(/sendToInternet|Internetu/i.test(md), 'md privacy');

// Snapshot lokalny (opcjonalny) — test z fixture tymczasowym
const snapPath = join(ROOT, 'docs/intelligence/learning-snapshot.json');
const hadSnap = existsSync(snapPath);
let backup = null;
if (hadSnap) backup = readFileSync(snapPath, 'utf8');
mkdirSync(join(ROOT, 'docs/intelligence'), { recursive: true });
writeFileSync(snapPath, JSON.stringify({
    signalCount: 20,
    categories: { bakeries: 10 },
    producers: { bakery_1: 5 },
    products: { brot: 4 },
    hours: { 8: 6 },
    distancesKm: [3.5],
    visits: [{ id: 'bakery_1', at: Date.now(), category: 'bakeries' }]
}), 'utf8');

const cli2 = spawnSync(process.execPath, ['scripts/user-taste-profile.mjs'], {
    cwd: ROOT,
    encoding: 'utf8'
});
assert(cli2.status === 0, 'CLI with snapshot exit 0');
const md2 = readFileSync(join(ROOT, 'docs/intelligence/user-profile.md'), 'utf8');
assert(/bakeries/i.test(md2), 'snapshot categories in md');

if (hadSnap && backup != null) writeFileSync(snapPath, backup, 'utf8');
else {
    try { unlinkSync(snapPath); } catch { /* ignore */ }
}

const appJs = readFileSync(join(ROOT, 'js/app.js'), 'utf8');
assert(!/userTasteProfile/.test(appJs), 'app.js bez importu taste profile');

if (failed) {
    console.error(`\n${failed} failed`);
    process.exit(1);
}
console.log('\n--- Taste Profile test ---');
console.log('OK');
