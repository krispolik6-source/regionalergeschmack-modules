/**
 * Smoke: weekly report + cleanup (bez real SMTP)
 */
import {
    existsSync,
    readFileSync,
    mkdirSync,
    writeFileSync,
    mkdtempSync,
    rmSync
} from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { cleanReportArtifacts } from './lib/report-cleanup.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function assert(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error(`FAIL ${msg}`);
    } else {
        console.log(`OK   ${msg}`);
    }
}

const smtp = readFileSync(join(ROOT, 'scripts/lib/developer-smtp.mjs'), 'utf8');
assert(smtp.includes('weeklyMailSubject'), 'weeklyMailSubject');
assert(smtp.includes('Regionaler Smak'), 'weekly From/subject brand short');
assert(smtp.includes('Raport tygodniowy'), 'weekly subject pattern');

const cleanup = readFileSync(join(ROOT, 'scripts/lib/report-cleanup.mjs'), 'utf8');
assert(cleanup.includes('docs/brand'), 'cleanup protects brand');
assert(cleanup.includes('instrukcja-instalacji.pdf'), 'cleanup keeps PDF');

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
assert(pkg.scripts?.['send-report'], 'npm send-report');
assert(pkg.scripts?.['weekly-report'], 'npm weekly-report');

const cli = spawnSync(process.execPath, ['scripts/weekly-developer-report.mjs'], {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env, NODE_ENV: 'development', DEVELOPER_MAIL_SEND: '' }
});
assert(cli.status === 0, `weekly CLI exit 0 (got ${cli.status})`);
assert(existsSync(join(ROOT, 'docs/premium-weekly/latest.md')), 'latest.md');
assert(existsSync(join(ROOT, 'docs/premium-weekly/latest.email.txt')), 'email draft');

const email = readFileSync(join(ROOT, 'docs/premium-weekly/latest.email.txt'), 'utf8');
assert(/Subject: Raport tygodniowy – Regionaler Smak \d{4}-\d{2}-\d{2}/.test(email), 'subject');
assert(email.includes('Health Score'), 'section Health');
assert(email.includes('Guardian'), 'section Guardian');
assert(email.includes('Taste Diary'), 'section Taste Diary');
assert(email.includes('Bledy (Errors)') || email.includes('Errors'), 'section Errors');
assert(email.includes('Poprawki (Fixes)') || email.includes('Fixes'), 'section Fixes');
assert(email.includes('Content-Type: text/plain'), 'plain text');
assert(!/<html/i.test(email), 'no HTML');

// Cleanup na izolowanym katalogu (nie niszczy prawdziwych raportów w repo)
const tmpRoot = mkdtempSync(join(tmpdir(), 'rg-clean-'));
mkdirSync(join(tmpRoot, 'docs', 'daily'), { recursive: true });
mkdirSync(join(tmpRoot, 'docs', 'brand'), { recursive: true });
mkdirSync(join(tmpRoot, 'downloads'), { recursive: true });
writeFileSync(join(tmpRoot, 'docs', 'daily', 'latest.json'), '{}', 'utf8');
writeFileSync(join(tmpRoot, 'docs', 'daily', 'README.md'), 'keep', 'utf8');
writeFileSync(join(tmpRoot, 'docs', 'brand', 'BRAND-BOOK.md'), 'brand', 'utf8');
writeFileSync(join(tmpRoot, 'docs', 'instrukcja-instalacji.pdf'), '%PDF', 'utf8');
writeFileSync(join(tmpRoot, 'downloads', 'app.apk'), 'x', 'utf8');

const cleaned = cleanReportArtifacts(tmpRoot);
assert(cleaned.deleted.some((d) => d.includes('latest.json')), 'tmp latest.json cleaned');
assert(existsSync(join(tmpRoot, 'docs/brand/BRAND-BOOK.md')), 'Brand Book survives');
assert(existsSync(join(tmpRoot, 'docs/instrukcja-instalacji.pdf')), 'PDF survives');
assert(existsSync(join(tmpRoot, 'docs/daily/README.md')), 'README survives');
assert(existsSync(join(tmpRoot, 'downloads/app.apk')), 'downloads survives');
rmSync(tmpRoot, { recursive: true, force: true });

const sendCli = spawnSync(
    process.execPath,
    ['scripts/send-report.mjs', '--clean'],
    {
        cwd: ROOT,
        encoding: 'utf8',
        env: {
            ...process.env,
            NODE_ENV: 'development',
            DEVELOPER_MAIL_SEND: '1',
            SMTP_HOST: '',
            SMTP_USER: '',
            SMTP_PASS: ''
        }
    }
);
assert(sendCli.status === 0, 'send-report --clean exit 0 bez SMTP');
const out = (sendCli.stdout || '') + (sendCli.stderr || '');
assert(/nie wysłano|SMTP not configured|nodemailer|pominięto/i.test(out), 'informuje o braku wysyłki');

if (failed) {
    console.error(`\n${failed} failed`);
    process.exit(1);
}
console.log('\nWeekly report / clean smoke OK');
