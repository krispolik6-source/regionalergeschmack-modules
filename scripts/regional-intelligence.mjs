/**
 * ETAP 29B – Regional Intelligence (CLI)
 * Codzienna rekomendacja gospodarza regionu (nie chatbot).
 *
 * Usage:
 *   npm run regional
 *   npm run regional -- --dry-run
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    POLICY,
    buildProxyContext,
    buildRegionalReport,
    regionalReportToMarkdown
} from '../js/diagnostics/regionalIntelligenceCore.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs', 'regional-intelligence');

function dayStamp() {
    return new Date().toISOString().slice(0, 10);
}

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const now = new Date();
const day = dayStamp();

console.log('══════════════════════════════════════════');
console.log(' Regional Intelligence (ETAP 29B)');
console.log(` ${day} · gospodarz regionu · nie chatbot`);
console.log('══════════════════════════════════════════');

if (dryRun) console.log('\n⏭ dry-run — proxy context (bez lokalizacji użytkownika)');

const ctx = buildProxyContext(now, {
    dayKey: day,
    hasLocation: false
});

const report = buildRegionalReport(ctx, {
    day,
    reason: dryRun ? 'dry-run' : 'cli-regional'
});

const md = regionalReportToMarkdown(report);

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'latest.json'), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT, 'latest.md'), md, 'utf8');
writeFileSync(join(OUT, `${day}.json`), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT, `${day}.md`), md, 'utf8');

console.log(`\n Tip: ${report.recommendation?.id}`);
console.log(` ${report.recommendation?.headline}`);
if (report.recommendation?.support) console.log(` ${report.recommendation.support}`);
console.log(` Wrote: ${relative(ROOT, join(OUT, 'latest.md'))}`);
console.log(
    ` Policy: max=${POLICY.maxMainRecommendations} · chatbot=${POLICY.chatbot} · ads=${POLICY.ads}`
);
console.log('══════════════════════════════════════════');
process.exit(0);
