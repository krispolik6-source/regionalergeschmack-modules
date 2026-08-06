/**
 * Smoke test ETAP 18E Doradca Projektu
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

const file = join(ROOT, 'js/diagnostics/projectAdvisor.js');
assert(existsSync(file), 'projectAdvisor.js');

const src = readFileSync(file, 'utf8');
const questions = [
    'Co dziś można ulepszyć?',
    'Co najbardziej irytuje użytkowników?',
    'Które ekrany są najsłabsze?',
    'Jak poprawić wydajność?',
    'Jak poprawić wygląd?',
    'Jak zwiększyć liczbę powrotów użytkowników?',
    'Co warto dodać w następnej wersji?'
];
for (const q of questions) {
    assert(src.includes(q), `pytanie: ${q}`);
}
assert(src.includes('advisoryOnly: true'), 'polityka advisory');
assert(src.includes('buildAdvisorBriefing'), 'buildAdvisorBriefing');
assert(!/writeFileSync/.test(src), 'runtime nie zapisuje plików projektu');

assertLazyDiagnosticsInit(assert, ROOT, 'projectAdvisor.initProjectAdvisor', 'orchestrator lazy projectAdvisor');

const panel = readFileSync(join(ROOT, 'js/diagnostics/healthDevPanel.js'), 'utf8');
assert(panel.includes('advisor') && panel.includes('Doradca'), 'dev panel Doradca');

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
assert(pkg.scripts?.advisor, 'npm run advisor');

const cli = spawnSync(process.execPath, ['scripts/project-advisor.mjs'], {
    cwd: ROOT,
    encoding: 'utf8'
});
assert(cli.status === 0, `CLI exit 0 (got ${cli.status})`);
assert(existsSync(join(ROOT, 'docs/advisor/latest.md')), 'docs/advisor/latest.md');

const latest = JSON.parse(readFileSync(join(ROOT, 'docs/advisor/latest.json'), 'utf8'));
assert(latest.questions?.length === 7, 'CLI 7 pytań');
assert(latest.policy?.autoFix === false, 'CLI policy');
assert(latest.questions.every((q) => q.question && q.answer), 'każde Q ma A');

const md = readFileSync(join(ROOT, 'docs/advisor/latest.md'), 'utf8');
for (const q of questions) {
    assert(md.includes(q), `md: ${q}`);
}

if (failed) {
    console.error(`\n${failed} failed`);
    process.exit(1);
}
console.log('\nProject Advisor smoke test OK');
