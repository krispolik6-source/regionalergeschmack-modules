/**
 * Smoke test ETAP 19C Weekly Premium Report
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { assertLazyDiagnosticsInit } from './lib/diagnosticsOrchestratorAssert.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function assert(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error(`❌ ${msg}`);
    } else {
        console.log(`✅ ${msg}`);
    }
}

const file = join(ROOT, 'js/diagnostics/weeklyPremiumReport.js');
assert(existsSync(file), 'weeklyPremiumReport.js');

const src = readFileSync(file, 'utf8');
const questions = [
    'Co poprawiono?',
    'Co pogorszyło się?',
    'Jakie nowe problemy wykryto?',
    'Jakie pliki są najbardziej awaryjne?',
    'Jak poprawić UX?',
    'Jak poprawić Mobile?',
    'Jak poprawić wygląd?',
    'Jak poprawić wydajność?',
    'Jak zwiększyć liczbę użytkowników?',
    'Jak zwiększyć retencję?'
];
for (const q of questions) {
    assert(src.includes(q), `Q: ${q}`);
}
assert(src.includes('autoFix: false'), 'autoFix false');
assert(src.includes('top20') || src.includes('Top 20'), 'top20');

assertLazyDiagnosticsInit(assert, ROOT, 'weeklyPremiumReport.initWeeklyPremiumReport', 'orchestrator lazy weeklyPremiumReport');

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
assert(pkg.scripts?.['weekly-premium'], 'npm script');

const cli = spawnSync(process.execPath, ['scripts/weekly-premium-report.mjs'], {
    cwd: ROOT,
    encoding: 'utf8'
});
assert(cli.status === 0, `CLI exit 0 (got ${cli.status})`);
assert(existsSync(join(ROOT, 'docs/premium-weekly/latest.md')), 'latest.md');
const latest = JSON.parse(readFileSync(join(ROOT, 'docs/premium-weekly/latest.json'), 'utf8'));
assert(latest.questions?.length === 10, 'CLI 10 Q');
assert((latest.top20 || []).length >= 1 && (latest.top20 || []).length <= 20, 'CLI top20');
assert(latest.top20.every((t) => t.autoApply === false), 'top20 autoApply false');
assert(latest.policy?.autoFix === false, 'CLI policy');
assert(typeof latest.week === 'string' && latest.week.includes('-W'), 'week stamp');

const md = readFileSync(join(ROOT, 'docs/premium-weekly/latest.md'), 'utf8');
assert(md.includes('Top 20'), 'md Top 20');
for (const q of questions) {
    assert(md.includes(q), `md Q ${q}`);
}

if (failed) {
    console.error(`\n${failed} failed`);
    process.exit(1);
}
console.log('\nWeekly Premium Report smoke test OK');
