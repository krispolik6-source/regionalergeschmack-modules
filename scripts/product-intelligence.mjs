/**
 * ETAP 33D — Product Intelligence CLI
 * Usage: npm run product-intelligence
 */
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    POLICY,
    runProductIntelligence
} from '../js/intelligence/productIntelligenceDaily.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const day = new Date().toISOString().slice(0, 10);

console.log('══════════════════════════════════════════');
console.log(' Product Intelligence (ETAP 33D)');
console.log(` ${day} · max ${POLICY.maxProposalsPerDay} · autoApply=false`);
console.log('══════════════════════════════════════════');

const { report, outDir } = runProductIntelligence(ROOT, {
    day,
    reason: 'cli-product-intelligence'
});

console.log('\n Odpowiedzi:');
for (const q of report.questions) {
    console.log(`  · ${q.question} → ${q.answer} (sev ${q.severity})`);
}
console.log(`\n Propozycje (${report.proposals.length}/${POLICY.maxProposalsPerDay}):`);
for (const p of report.proposals) {
    console.log(`  ${p.rank}. ${p.title}`);
}
console.log(`\n Wrote: ${relative(ROOT, join(outDir, 'latest.md')).replace(/\\/g, '/')}`);
console.log('══════════════════════════════════════════');
