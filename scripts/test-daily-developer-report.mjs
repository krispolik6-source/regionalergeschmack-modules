/**
 * Smoke test Daily Developer Report / Mail (19A + 28D)
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

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

const file = join(ROOT, 'js/diagnostics/dailyDeveloperReport.js');
assert(existsSync(file), 'dailyDeveloperReport.js');

const src = readFileSync(file, 'utf8');
assert(src.includes('autoFix: false'), 'autoFix false');
assert(src.includes('developerOnly: true'), 'developerOnly');
assert(src.includes('DEVELOPER_REPORT_EMAIL'), 'env var name referenced');
assert(!/[\w.+-]+@[\w.-]+\.\w+/.test(src.replace(/DEVELOPER_REPORT_EMAIL/g, '')), 'browser: brak hardcodowanego e-maila');
assert(!/fetch\s*\(\s*['"`]https?:/.test(src), 'brak zewnętrznego fetch');

const modules = [
    'healthMonitor',
    'aiGuardian',
    'improvementEngine',
    'virtualUser',
    'learningEngine',
    'projectAdvisor'
];
for (const m of modules) {
    assert(src.includes(m), `sekcja ${m}`);
}

const checks = [
    'jsErrors', 'ux', 'mobile', 'css', 'translations', 'performance',
    'fps', 'memory', 'pwa', 'cache', 'images', 'producerData', 'improvements'
];
for (const c of checks) {
    assert(src.includes(c), `checklist ${c}`);
}

const app = readFileSync(join(ROOT, 'js/app.js'), 'utf8');
assert(app.includes('initDailyDeveloperReport'), 'app.js init');

const panel = readFileSync(join(ROOT, 'js/diagnostics/healthDevPanel.js'), 'utf8');
assert(panel.includes('daily-run') || panel.includes('Daily Report'), 'dev panel');

const envEx = readFileSync(join(ROOT, '.env.example'), 'utf8');
assert(envEx.includes('DEVELOPER_REPORT_EMAIL'), '.env.example email');
assert(envEx.includes('SMTP_HOST'), '.env.example SMTP');
assert(envEx.includes('DEVELOPER_MAIL_SEND'), '.env.example send flag');
assert(/^SMTP_PASS=\s*$/m.test(envEx), 'SMTP_PASS puste w .env.example');

const smtp = readFileSync(join(ROOT, 'scripts/lib/developer-smtp.mjs'), 'utf8');
assert(smtp.includes('krispolik6@gmail.com'), 'owner recipient in SMTP helper');
assert(smtp.includes('Raport – Regionaler Geschmack'), 'mail subject pattern');
assert(smtp.includes('raporty@regionalergeschmack.com'), 'default From');
assert(smtp.includes('mailSubjectForDay'), 'mailSubjectForDay helper');
assert(!/SMTP_PASS\s*=\s*['"][^'"]+['"]/.test(smtp), 'brak hardcodowanego SMTP_PASS');

const doc = join(ROOT, 'docs/daily/DEVELOPER-MAIL.md');
assert(existsSync(doc), 'DEVELOPER-MAIL.md');
assert(readFileSync(doc, 'utf8').includes('npm run send-report'), 'docs send-report');

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
assert(pkg.scripts?.['daily-report'], 'npm run daily-report');
assert(pkg.scripts?.['daily-mail'], 'npm run daily-mail');
assert(pkg.scripts?.['send-report'], 'npm run send-report');
assert(existsSync(join(ROOT, 'scripts/send-report.mjs')), 'send-report.mjs');

const cli = spawnSync(process.execPath, ['scripts/daily-developer-report.mjs'], {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env, NODE_ENV: 'development', DEVELOPER_MAIL_SEND: '' }
});
assert(cli.status === 0, `CLI exit 0 (got ${cli.status})`);
assert(existsSync(join(ROOT, 'docs/daily/latest.md')), 'docs/daily/latest.md');
assert(existsSync(join(ROOT, 'docs/daily/latest.json')), 'docs/daily/latest.json');
assert(existsSync(join(ROOT, 'docs/daily/latest.email.txt')), 'latest.email.txt draft');

const latest = JSON.parse(readFileSync(join(ROOT, 'docs/daily/latest.json'), 'utf8'));
assert(latest.policy?.autoFix === false, 'CLI autoFix');
assert(latest.policy?.ownerOnly === true, 'ownerOnly');
assert(latest.policy?.noUserEmail === true, 'noUserEmail');
assert(typeof latest.appScore === 'number' || latest.appScore === null, 'appScore');
assert(latest.checklist?.jsErrors, 'checklist jsErrors');
assert(latest.sections?.healthMonitor, 'section health legacy');
assert(latest.sections?.health, 'section health 28d');
assert(latest.sections?.emotion != null, 'section emotion');
assert(latest.sections?.livingBrand != null, 'section livingBrand');
assert(latest.sections?.productDirector != null, 'section productDirector');
assert(latest.sections?.qualityLoop != null, 'section qualityLoop');
assert(latest.sections?.projectAdvisor, 'section advisor');
assert(Array.isArray(latest.critical), 'critical list');
assert(Array.isArray(latest.newErrors), 'newErrors');
assert(Array.isArray(latest.regressions), 'regressions');
assert(Array.isArray(latest.proposedFixes), 'proposedFixes');
assert(latest.changesSinceYesterday != null, 'changesSinceYesterday');
assert(
    /^Raport – Regionaler Geschmack \d{4}-\d{2}-\d{2}$/.test(latest.mailSubject || ''),
    'mail subject with date'
);
assert(Array.isArray(latest.improvements), 'improvements');
assert(Array.isArray(latest.fixesPending) || Array.isArray(latest.proposedFixes), 'fixes');
assert(latest.healthScore != null || latest.sections?.health?.overall != null, 'healthScore');

const emailRaw = readFileSync(join(ROOT, 'docs/daily/latest.email.txt'), 'utf8');
assert(emailRaw.includes('To: krispolik6@gmail.com'), 'To owner');
assert(/Subject: Raport – Regionaler Geschmack \d{4}-\d{2}-\d{2}/.test(emailRaw), 'Subject');
assert(emailRaw.includes('Content-Type: text/plain'), 'draft text/plain');
assert(!/<html|<h1|<ul>/i.test(emailRaw), 'draft bez HTML');
assert(!/Content-Disposition:\s*attachment/i.test(emailRaw), 'draft bez zalacznika');
assert(/Bledy \(Errors\)|Błędy \(Errors\)/.test(emailRaw), 'email Errors section');
assert(emailRaw.includes('Poprawki (Fixes)'), 'email Fixes section');
assert(emailRaw.includes('Ulepszenia (Improvements)'), 'email Improvements section');
assert(emailRaw.includes('Health Score'), 'email Health Score section');
assert(emailRaw.includes('text/plain'), 'plain body note');

const smtpSrc = readFileSync(join(ROOT, 'scripts/lib/developer-smtp.mjs'), 'utf8');
assert(smtpSrc.includes('text,'), 'SMTP wysyla text');
assert(!/attachments\s*:/.test(smtpSrc.replace(/attachments:\s*false/g, '')), 'SMTP bez attachments payload');
assert(!/html:\s*payload/.test(smtpSrc), 'SMTP bez HTML payload');

// production blocks email prepare
const cliProd = spawnSync(process.execPath, ['scripts/daily-developer-report.mjs'], {
    cwd: ROOT,
    encoding: 'utf8',
    env: {
        ...process.env,
        NODE_ENV: 'production',
        DEVELOPER_MAIL_SEND: '1'
    }
});
assert(cliProd.status === 0, 'CLI prod exit 0');
const prodOut = (cliProd.stdout || '') + (cliProd.stderr || '');
assert(/produkcja|production/i.test(prodOut), 'prod blokuje e-mail');

// --send without SMTP → skip, no crash
const cliSend = spawnSync(process.execPath, ['scripts/daily-developer-report.mjs', '--send'], {
    cwd: ROOT,
    encoding: 'utf8',
    env: {
        ...process.env,
        NODE_ENV: 'development',
        RG_PRODUCTION: '',
        DEVELOPER_MAIL_SEND: '1',
        SMTP_HOST: '',
        SMTP_USER: '',
        SMTP_PASS: ''
    }
});
assert(cliSend.status === 0, 'CLI --send exit 0 bez SMTP');
const sendOut = (cliSend.stdout || '') + (cliSend.stderr || '');
assert(/nie wysłano|SMTP not configured|nodemailer/i.test(sendOut), 'informuje o braku SMTP');

const ql = readFileSync(join(ROOT, 'scripts/ai-quality-loop.mjs'), 'utf8');
assert(ql.includes('Daily Developer Mail') || ql.includes('--send'), 'quality-loop wywołuje mail');

if (failed) {
    console.error(`\n${failed} failed`);
    process.exit(1);
}
console.log('\nDaily Developer Report / Mail smoke test OK');
