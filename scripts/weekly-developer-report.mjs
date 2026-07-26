/**
 * Tygodniowy raport developerski (Health · Guardian · Taste Diary · Fixes · Errors)
 *
 * Usage:
 *   node scripts/weekly-developer-report.mjs
 *   node scripts/weekly-developer-report.mjs --send
 *   node scripts/weekly-developer-report.mjs --send --clean
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
    OWNER_DEVELOPER_EMAIL,
    DEFAULT_SMTP_FROM_WEEKLY,
    weeklyMailSubject,
    resolveMailConfig,
    sendDeveloperMail
} from './lib/developer-smtp.mjs';
import { cleanReportArtifacts } from './lib/report-cleanup.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'docs', 'premium-weekly');

const argv = process.argv.slice(2);
const wantSend = argv.includes('--send');
const wantClean = argv.includes('--clean');

function dayStamp(d = new Date()) {
    return d.toISOString().slice(0, 10);
}

function weekStamp(d = new Date()) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
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

function loadEnvFile() {
    const envPath = join(ROOT, '.env');
    if (!existsSync(envPath)) return {};
    const out = {};
    for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
        const t = line.trim();
        if (!t || t.startsWith('#')) continue;
        const i = t.indexOf('=');
        if (i < 1) continue;
        const k = t.slice(0, i).trim();
        let v = t.slice(i + 1).trim();
        if (
            (v.startsWith('"') && v.endsWith('"')) ||
            (v.startsWith("'") && v.endsWith("'"))
        ) {
            v = v.slice(1, -1);
        }
        out[k] = v;
    }
    return out;
}

function isProductionCli() {
    return process.env.NODE_ENV === 'production' || process.env.RG_PRODUCTION === '1';
}

function bullet(items, empty = '(brak)') {
    if (!items.length) return [`  ${empty}`];
    return items.map((x) => `  - ${x}`);
}

function buildWeeklyReport() {
    const day = dayStamp();
    const week = weekStamp();
    const subject = weeklyMailSubject(day);

    const health = loadJson('docs/health/latest.json');
    const guardian = loadJson('tools/ai-guardian/reports/latest.json');
    const improve = loadJson('docs/improvements/latest.json');
    const qualityLoop = loadJson('docs/quality-loop/latest.json');
    const daily = loadJson('docs/daily/latest.json');

    const healthScore = health?.overall ?? daily?.healthScore ?? null;
    const appScore = daily?.appScore ?? null;

    const errors = [];
    for (const f of guardian?.findings || []) {
        if (f.severity === 'critical' || f.severity === 'high') {
            errors.push(`[${f.severity}] ${f.title}`);
        }
    }
    for (const f of health?.findings || []) {
        if (f.severity === 'critical' || f.severity === 'high') {
            errors.push(`[health/${f.severity}] ${f.title}`);
        }
    }
    for (const c of daily?.critical || []) {
        errors.push(`[${c.severity || 'med'}] ${c.title}`);
    }
    for (const c of daily?.failedChecks || []) {
        errors.push(`failed check: ${c}`);
    }

    const fixes = [];
    for (const f of qualityLoop?.fixes || []) {
        fixes.push(`[${f.status || f.priority || 'pending'}] ${f.title}`);
    }
    for (const p of improve?.proposals || []) {
        if (fixes.some((x) => x.includes(p.title))) continue;
        fixes.push(`[${p.priority || 'idea'}] ${p.title}`);
    }

    // Taste Diary – tylko przeglądarka (localStorage); CLI nie ma dostępu
    const tasteDiary = {
        note: 'Taste Diary: dane w localStorage przegladarki (rg_taste_diary). CLI nie odczytuje wpisow uzytkownika.',
        storageKey: 'rg_taste_diary',
        availableInCli: false
    };

    const report = {
        id: `weekly-dev-${week}`,
        title: 'Raport tygodniowy',
        week,
        day,
        mailSubject: subject,
        mailFrom: DEFAULT_SMTP_FROM_WEEKLY,
        generatedAt: new Date().toISOString(),
        policy: {
            autoFix: false,
            ownerOnly: true,
            recipient: OWNER_DEVELOPER_EMAIL
        },
        healthScore,
        appScore,
        guardianFindings: (guardian?.findings || []).length,
        errors: errors.slice(0, 40),
        fixes: fixes.slice(0, 40),
        tasteDiary,
        modules: {
            health: Boolean(health),
            guardian: Boolean(guardian),
            qualityLoop: Boolean(qualityLoop),
            improvements: Boolean(improve),
            daily: Boolean(daily),
            tasteDiary: 'browser-localStorage'
        }
    };

    const text = [
        subject,
        '='.repeat(Math.min(subject.length, 52)),
        '',
        `Tydzien: ${week}`,
        `Data: ${day}`,
        `Odbiorca: ${OWNER_DEVELOPER_EMAIL}`,
        '',
        '=== Health Score ===',
        `  Health overall : ${healthScore ?? '—'}`,
        `  App score      : ${appScore ?? '—'}%`,
        '',
        '=== Guardian ===',
        `  Findings: ${report.guardianFindings}`,
        ...bullet(
            (guardian?.findings || [])
                .slice(0, 8)
                .map((f) => `[${f.severity}] ${f.title}`),
            '(brak lub brak raportu – uruchom guardian)'
        ),
        '',
        '=== Taste Diary ===',
        `  ${tasteDiary.note}`,
        `  Klucz: ${tasteDiary.storageKey}`,
        '',
        '=== Bledy (Errors) ===',
        ...bullet(errors.slice(0, 20)),
        '',
        '=== Poprawki (Fixes) ===',
        ...bullet(fixes.slice(0, 20)),
        '',
        '---',
        'Format: text/plain w tresci (bez HTML, bez zalacznikow)',
        'Polityka: autoFix=false | tylko wlasciciel'
    ].join('\n');

    return { report, text, subject };
}

function writeFiles(report, text) {
    mkdirSync(OUT_DIR, { recursive: true });
    const week = report.week;
    writeFileSync(join(OUT_DIR, 'latest.json'), JSON.stringify(report, null, 2), 'utf8');
    writeFileSync(join(OUT_DIR, 'latest.md'), text, 'utf8');
    writeFileSync(join(OUT_DIR, `${week}.json`), JSON.stringify(report, null, 2), 'utf8');
    writeFileSync(join(OUT_DIR, `${week}.md`), text, 'utf8');
    writeFileSync(
        join(OUT_DIR, 'latest.email.txt'),
        [
            `From: ${DEFAULT_SMTP_FROM_WEEKLY}`,
            `To: ${OWNER_DEVELOPER_EMAIL}`,
            `Subject: ${report.mailSubject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            '',
            text
        ].join('\n'),
        'utf8'
    );
    console.log(`[Weekly Report] wrote ${relative(ROOT, join(OUT_DIR, 'latest.md'))}`);
}

// ——— main ———
const fileEnv = loadEnvFile();
const mergedEnv = { ...fileEnv, ...process.env };
const { report, text, subject } = buildWeeklyReport();
writeFiles(report, text);

let emailMeta = {
    prepared: true,
    sent: false,
    to: OWNER_DEVELOPER_EMAIL,
    from: DEFAULT_SMTP_FROM_WEEKLY,
    subject
};

if (isProductionCli()) {
    console.log('[Weekly Report] produkcja – pomijam wysyłkę');
    emailMeta = { ...emailMeta, prepared: false, reason: 'production' };
} else if (wantSend) {
    const cfg = resolveMailConfig(mergedEnv);
    const sendEnv = {
        ...mergedEnv,
        DEVELOPER_MAIL_SEND: mergedEnv.DEVELOPER_MAIL_SEND || '1',
        DEVELOPER_REPORT_EMAIL: OWNER_DEVELOPER_EMAIL,
        SMTP_FROM: mergedEnv.SMTP_FROM || DEFAULT_SMTP_FROM_WEEKLY
    };
    try {
        const result = await sendDeveloperMail({ subject, text }, sendEnv);
        emailMeta = {
            ...emailMeta,
            sendAttempted: true,
            smtpConfigured: cfg.configured,
            ...result,
            sent: Boolean(result.ok)
        };
        if (result.ok) {
            console.log(`[Weekly Mail] ✔ wysłano do ${result.to}`);
        } else {
            console.log(`[Weekly Mail] ⏭ nie wysłano: ${result.reason}`);
            if (result.setupDoc) console.log(`  → ${result.setupDoc}`);
        }
    } catch (err) {
        emailMeta = {
            ...emailMeta,
            sendAttempted: true,
            sent: false,
            error: String(err?.message || err)
        };
        console.warn('[Weekly Mail] błąd SMTP:', err?.message || err);
    }
} else {
    console.log('[Weekly Mail] bez --send. Użyj: npm run send-report');
}

report.email = emailMeta;
writeFileSync(join(OUT_DIR, 'latest.json'), JSON.stringify(report, null, 2), 'utf8');

if (wantClean) {
    if (emailMeta.sent) {
        const result = cleanReportArtifacts(ROOT);
        console.log(
            `[Weekly Clean] usunięto ${result.deleted.length} plików raportów`
        );
        for (const d of result.deleted.slice(0, 30)) console.log(`  - ${d}`);
        if (result.deleted.length > 30) {
            console.log(`  … +${result.deleted.length - 30} więcej`);
        }
        for (const s of result.skippedDirs) console.log(`  keep: ${s}`);
        writeFileSync(
            join(ROOT, 'docs', 'premium-weekly', 'last-clean.json'),
            JSON.stringify(
                {
                    at: new Date().toISOString(),
                    deletedCount: result.deleted.length,
                    deleted: result.deleted,
                    kept: result.kept,
                    skippedDirs: result.skippedDirs
                },
                null,
                2
            ),
            'utf8'
        );
    } else {
        console.log(
            '[Weekly Clean] pominięto – raport nie został wysłany (SMTP / skip)'
        );
        console.log(
            '  Wskazówka: ustaw .env (SMTP_*) i DEVELOPER_MAIL_SEND=1, potem: npm run send-report -- --clean'
        );
    }
}

console.log(`[Weekly Report] ${weekStamp()} · Health ${report.healthScore ?? '—'} · Errors ${report.errors.length}`);
