/**
 * ETAP 29E – Self Reflection (CLI)
 * Raz dziennie aplikacja ocenia samą siebie.
 * Nie zmienia kodu. autoApply: false.
 *
 * Usage:
 *   npm run reflect
 *   npm run reflect -- --dry-run
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
    buildSelfReflectionReport,
    selfReflectionToMarkdown,
    POLICY
} from '../js/diagnostics/selfReflectionCore.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs', 'self-reflection');

function dayStamp(d = new Date()) {
    return d.toISOString().slice(0, 10);
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

function loadWeekAgoReflection() {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 7);
    const day = dayStamp(d);
    return loadJson(`docs/self-reflection/${day}.json`);
}

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const day = dayStamp();

console.log('══════════════════════════════════════════');
console.log(' Self Reflection (ETAP 29E)');
console.log(` ${day} · autoApply=false · nie tylko błędy`);
console.log('══════════════════════════════════════════');

if (dryRun) console.log('\n⏭ dry-run — agregacja istniejących docs/*');

const sources = {
    health: loadJson('docs/health/latest.json'),
    emotion: loadJson('docs/emotion/latest.json'),
    livingBrand: loadJson('docs/living-brand/latest.json'),
    brandProtection: loadJson('docs/brand-protection/latest.json')
        || loadJson('docs/brand/BRAND-PROTECTION.json'),
    dream: loadJson('docs/dream/latest.json'),
    director: loadJson('docs/product-director/latest.json'),
    daily: loadJson('docs/daily/latest.json'),
    realUsers: loadJson('docs/real-users/latest.json'),
    qualityLoop: loadJson('docs/quality-loop/latest.json'),
    previousReflection: loadWeekAgoReflection()
};

const report = buildSelfReflectionReport(sources, {
    day,
    reason: dryRun ? 'dry-run' : 'cli-reflect'
});

const md = selfReflectionToMarkdown(report);

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'latest.json'), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT, 'latest.md'), md, 'utf8');
writeFileSync(join(OUT, `${day}.json`), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT, `${day}.md`), md, 'utf8');

console.log('\n Scores:');
for (const [k, v] of Object.entries(report.scores)) {
    console.log(`  ${k}: ${v}`);
}
console.log(`\n ${POLICY.dailyQuestion}`);
console.log(` → ${report.dailyUse.answer}`);
console.log(`\n Wrote: ${relative(ROOT, join(OUT, 'latest.md'))}`);
console.log(' Policy: nie zmienia kodu · nie wdraża automatycznie');
console.log('══════════════════════════════════════════');
process.exit(0);
