/**
 * ETAP 33E — Living Region AI CLI
 * Usage: npm run living-region-ai
 */
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    POLICY,
    runLivingRegionAi
} from '../js/intelligence/livingRegionAi.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const day = new Date().toISOString().slice(0, 10);

console.log('══════════════════════════════════════════');
console.log(' Living Region AI (ETAP 33E)');
console.log(` ${day} · Region Pulse · 1 zdanie · autoApply=false`);
console.log('══════════════════════════════════════════');
console.log(`\n chatbot=${POLICY.chatbot} · popups=${POLICY.popups} · uiChanges=${POLICY.uiChanges}`);

const { report, outDir } = runLivingRegionAi(ROOT, {
    day,
    reason: 'cli-living-region-ai'
});

console.log(`\n Region Pulse: ${report.regionPulse} / 100 (${report.band})`);
console.log(` Sentence: ${report.sentence}`);
console.log(` Wrote: ${relative(ROOT, join(outDir, 'latest.md')).replace(/\\/g, '/')}`);
console.log('══════════════════════════════════════════');
