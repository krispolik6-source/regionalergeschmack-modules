/**
 * ETAP 33C — Producer Trust Audit CLI
 * Usage: npm run trust
 */
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    POLICY,
    runProducerTrustAudit
} from '../js/intelligence/producerTrustAudit.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const day = new Date().toISOString().slice(0, 10);

console.log('══════════════════════════════════════════');
console.log(' Producer Trust Audit (ETAP 33C)');
console.log(` ${day} · Trust Score · autoFix=false`);
console.log('══════════════════════════════════════════');
console.log(`\n autoFix=${POLICY.autoFix} · mutatesData=${POLICY.mutatesProducerData}`);

const { report, outFile } = runProducerTrustAudit(ROOT, {
    day,
    reason: 'cli-trust'
});

console.log(`\n Producers: ${report.summary.producersScanned}`);
console.log(` Average Trust Score: ${report.summary.averageTrustScore} / 100`);
console.log(` Min/Max: ${report.summary.minTrustScore} / ${report.summary.maxTrustScore}`);
console.log(` Wrote: ${relative(ROOT, outFile).replace(/\\/g, '/')}`);
console.log('\n══════════════════════════════════════════');
