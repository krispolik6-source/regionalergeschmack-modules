/**
 * ETAP 29D – Product Brain (CLI)
 * „Gdybym był właścicielem — co zrobiłbym jutro?”
 * Max 3 propozycje. Nie wdraża. autoApply: false.
 *
 * Usage:
 *   npm run brain
 *   npm run brain -- --dry-run
 */
import {
    readFileSync,
    writeFileSync,
    mkdirSync,
    existsSync
} from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    buildProductBrainReport,
    productBrainToMarkdown,
    POLICY
} from '../js/diagnostics/productBrainCore.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs', 'product-brain');

function dayStamp() {
    return new Date().toISOString().slice(0, 10);
}

function loadJson(rel) {
    const full = join(ROOT, rel);
    if (!existsSync(full)) return null;
    try {
        return JSON.parse(readFileSync(full, 'utf8'));
    } catch {
        return null;
    }
}

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const day = dayStamp();

console.log('══════════════════════════════════════════');
console.log(' Product Brain (ETAP 29D)');
console.log(` ${day} · max ${POLICY.maxProposalsPerDay} · czekaj na akceptację`);
console.log('══════════════════════════════════════════');
console.log(`\n ${POLICY.question}`);

if (dryRun) console.log('\n⏭ dry-run — agregacja istniejących docs/*');

const sources = {
    health: loadJson('docs/health/latest.json'),
    guardian: loadJson('tools/ai-guardian/reports/latest.json'),
    improve: loadJson('docs/improvements/latest.json'),
    emotion: loadJson('docs/emotion/latest.json'),
    livingBrand: loadJson('docs/living-brand/latest.json'),
    director: loadJson('docs/product-director/latest.json'),
    realUsers: loadJson('docs/real-users/latest.json'),
    virtual: loadJson('docs/virtual-user/latest.json'),
    qualityLoop: loadJson('docs/quality-loop/latest.json'),
    daily: loadJson('docs/daily/latest.json'),
    dream: loadJson('docs/dream/latest.json'),
    brandProtection: loadJson('docs/brand-protection/latest.json')
        || loadJson('docs/brand/BRAND-PROTECTION.json')
};

const report = buildProductBrainReport(sources, {
    day,
    reason: dryRun ? 'dry-run' : 'cli-brain'
});

const md = productBrainToMarkdown(report);

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'latest.json'), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT, 'latest.md'), md, 'utf8');
writeFileSync(join(OUT, `${day}.json`), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT, `${day}.md`), md, 'utf8');
writeFileSync(
    join(OUT, 'pending-acceptance.json'),
    JSON.stringify({
        day,
        generatedAt: report.generatedAt,
        policy: {
            autoApply: false,
            requiresOwnerAcceptance: true,
            maxProposalsPerDay: 3
        },
        proposals: report.proposals
    }, null, 2),
    'utf8'
);

console.log(`\n Brain score: ${report.brainScore}/100`);
console.log(` Proposals: ${report.proposals.length} (max ${POLICY.maxProposalsPerDay})`);
for (const p of report.proposals) {
    console.log(`  ${p.rank}. [${p.impact}/${p.risk}] ${p.title}`);
}
console.log(` Wrote: ${relative(ROOT, join(OUT, 'latest.md'))}`);
console.log(' Policy: nie wdrażaj · czekaj na akceptację właściciela');
console.log('══════════════════════════════════════════');
process.exit(0);
