/**
 * Wysyłka raportu do właściciela + opcjonalne czyszczenie artefaktów.
 *
 * Usage:
 *   npm run send-report                 # raport tygodniowy + SMTP
 *   npm run send-report -- --clean      # po udanej wysyłce usuń pliki raportów
 *   npm run send-report -- --clean-force  # wyczyść artefakty (nawet bez SMTP)
 *   npm run send-report -- --fresh      # najpierw quality-loop, potem tygodniowy mail
 *   npm run send-report -- --daily      # stary tryb daily (bez weekly subject)
 *
 * Harmonogram: poniedziałek ~20:00 CEST — .github/workflows/daily-report.yml
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanReportArtifacts } from './lib/report-cleanup.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const fresh = argv.includes('--fresh');
const clean = argv.includes('--clean');
const cleanForce = argv.includes('--clean-force');
const daily = argv.includes('--daily');

function run(scriptArgs, label) {
    console.log(`[send-report] ${label}…`);
    const r = spawnSync(process.execPath, scriptArgs, {
        cwd: ROOT,
        stdio: 'inherit',
        env: {
            ...process.env,
            DEVELOPER_MAIL_SEND: process.env.DEVELOPER_MAIL_SEND || '1'
        }
    });
    return r.status ?? 1;
}

let code = 0;

if (fresh) {
    code = run(['scripts/ai-quality-loop.mjs', '--skip-mail'], 'quality-loop (bez maila)');
    if (code !== 0) process.exit(code);
}

const reportArgs = daily
    ? ['scripts/daily-developer-report.mjs', '--send']
    : ['scripts/weekly-developer-report.mjs', '--send'];

if (clean && !cleanForce) {
    reportArgs.push('--clean');
}

code = run(
    reportArgs,
    daily ? 'daily report + send' : 'weekly report + send'
);

if (code !== 0) process.exit(code);

if (cleanForce) {
    const result = cleanReportArtifacts(ROOT);
    console.log(
        `[send-report] --clean-force: usunięto ${result.deleted.length} plików raportów`
    );
    for (const d of result.deleted.slice(0, 25)) console.log(`  - ${d}`);
    if (result.deleted.length > 25) {
        console.log(`  … +${result.deleted.length - 25}`);
    }
    for (const s of result.skippedDirs) console.log(`  keep: ${s}`);
}

console.log('[send-report] gotowe · odbiorca: krispolik6@gmail.com');
