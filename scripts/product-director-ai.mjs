/**
 * ETAP 45 — Product Director AI (CLI)
 * Agreguje raporty inteligencji → max 3 rekomendacje / dzień.
 * Żadnych automatycznych zmian.
 *
 * Usage:
 *   npm run director-ai
 *   npm run product-director-ai
 *   npm run director-ai -- --verbose
 */
import { relative, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    POLICY,
    HEADLINE,
    formatDirectorBoard,
    runProductDirectorAi
} from '../js/intelligence/productDirectorAi.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const VERBOSE = args.includes('--verbose') || args.includes('-v');
const day = new Date().toISOString().slice(0, 10);

const { report, outDir } = runProductDirectorAi(ROOT, {
    day,
    reason: 'cli-product-director-ai'
});

if (VERBOSE) {
    console.log('══════════════════════════════════════════');
    console.log(' Product Director AI (ETAP 45)');
    console.log(` ${day} · max ${POLICY.maxProposalsPerDay} · autoApply=false`);
    console.log('══════════════════════════════════════════');
    console.log(` Kandydaci: ${report.candidatesConsidered}`);
    console.log(` Źródła z danymi: ${Object.values(report.sourcesAvailable).filter(Boolean).length}`);
    console.log(` Wrote: ${relative(ROOT, join(outDir, 'latest.md')).replace(/\\/g, '/')}`);
}

// Domyslnie: tylko board (jak w briefie)
console.log(formatDirectorBoard(report));

// Upewnij się, że headline jest w outputcie (formatDirectorBoard już zawiera)
if (!VERBOSE && !report.recommendations.length) {
    // już wypisane
}

process.exit(0);
