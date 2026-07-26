/**
 * ETAP 33A — Regional Brain CLI
 * Usage:
 *   npm run intelligence
 *   npm run intelligence -- --dry-run
 */
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    POLICY,
    runRegionalBrain
} from '../js/intelligence/regionalBrain.js';
import { runUserTasteProfile } from '../js/intelligence/userTasteProfile.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const day = new Date().toISOString().slice(0, 10);

console.log('══════════════════════════════════════════');
console.log(' Regional Brain (ETAP 33A)');
console.log(` ${day} · Region Score · bez UI`);
console.log('══════════════════════════════════════════');
console.log(`\n autoApply=${POLICY.autoApply} · autoFix=${POLICY.autoFix} · chatbot=${POLICY.chatbot}`);

if (dryRun) console.log('\n⏭ dry-run — synteza docs/* + czas lokalny');

const { report, outDir } = runRegionalBrain(ROOT, {
    day,
    reason: dryRun ? 'dry-run' : 'cli-intelligence'
});

console.log(`\n Region Score: ${report.regionScore} / 100 (${report.verdict})`);
console.log(` Wrote: ${relative(ROOT, join(outDir, 'latest.md')).replace(/\\/g, '/')}`);
console.log(` Wrote: ${relative(ROOT, join(outDir, 'latest.json')).replace(/\\/g, '/')}`);

// ETAP 33B — Taste Profile (tylko user-profile.md, bez UI / bez sieci)
const taste = runUserTasteProfile(ROOT, {
    day,
    reason: dryRun ? 'dry-run' : 'cli-intelligence'
});
console.log(`\n Taste Profile: ${taste.report.tasteProfile.label} · Return ${taste.report.returnProbability}/100`);
console.log(` Wrote: ${relative(ROOT, taste.outFile).replace(/\\/g, '/')}`);
console.log('\n══════════════════════════════════════════');
