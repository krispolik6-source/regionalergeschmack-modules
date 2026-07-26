/**
 * ETAP 29A – AI Dream Mode (CLI)
 * Codziennie po diagnostyce: refleksja Product Owner.
 * Nie zmienia kodu. autoApply: false. Nie chatbot.
 *
 * Usage:
 *   npm run dream
 *   npm run dream -- --dry-run
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
    buildDreamReport,
    dreamReportToMarkdown,
    POLICY
} from '../js/diagnostics/dreamModeCore.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs', 'dream');

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

console.log('══════════════════════════════════════════');
console.log(' AI Dream Mode (ETAP 29A)');
console.log(` ${dayStamp()} · autoApply=false · nie chatbot`);
console.log('══════════════════════════════════════════');

if (dryRun) console.log('\n⏭ dry-run — tylko agregacja istniejących docs/*');

const sources = {
    health: loadJson('docs/health/latest.json'),
    guardian: loadJson('tools/ai-guardian/reports/latest.json'),
    advisor: loadJson('docs/advisor/latest.json'),
    improve: loadJson('docs/improvements/latest.json'),
    virtual: loadJson('docs/virtual-user/latest.json'),
    emotion: loadJson('docs/emotion/latest.json'),
    livingBrand: loadJson('docs/living-brand/latest.json'),
    director: loadJson('docs/product-director/latest.json'),
    realUsers: loadJson('docs/real-users/latest.json'),
    qualityLoop: loadJson('docs/quality-loop/latest.json'),
    daily: loadJson('docs/daily/latest.json')
};

const report = buildDreamReport(sources, {
    day: dayStamp(),
    reason: dryRun ? 'dry-run' : 'cli-dream'
});

const md = dreamReportToMarkdown(report);

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'latest.json'), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT, 'latest.md'), md, 'utf8');
writeFileSync(join(OUT, `${report.day}.json`), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT, `${report.day}.md`), md, 'utf8');

console.log(`\n Dream score: ${report.dreamScore}/100`);
console.log(` Headline: ${report.headline}`);
console.log(` Wrote: ${relative(ROOT, join(OUT, 'latest.md'))}`);
console.log(` Policy: autoApply=${POLICY.autoApply} · no code changes`);
console.log('══════════════════════════════════════════');
process.exit(0);
