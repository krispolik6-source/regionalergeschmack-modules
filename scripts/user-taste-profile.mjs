/**
 * ETAP 33B — User Taste Profile CLI
 * Lokalnie, anonimowo, bez Internetu. Zapisuje tylko docs/intelligence/user-profile.md
 *
 * Usage:
 *   npm run taste-profile
 */
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    POLICY,
    runUserTasteProfile
} from '../js/intelligence/userTasteProfile.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const day = new Date().toISOString().slice(0, 10);

console.log('══════════════════════════════════════════');
console.log(' User Taste Profile (ETAP 33B)');
console.log(` ${day} · lokalnie · anonimowo · bez UI`);
console.log('══════════════════════════════════════════');
console.log(`\n network=${POLICY.network} · sendToInternet=${POLICY.sendToInternet} · autoApply=${POLICY.autoApply}`);

const { report, outFile } = runUserTasteProfile(ROOT, {
    day,
    reason: 'cli-taste-profile'
});

console.log(`\n Taste Profile: ${report.tasteProfile.label} (confidence ${report.tasteProfile.confidence})`);
console.log(` Return Probability: ${report.returnProbability} / 100 (${report.returnBand})`);
console.log(` Wrote: ${relative(ROOT, outFile).replace(/\\/g, '/')}`);
console.log('\n══════════════════════════════════════════');
