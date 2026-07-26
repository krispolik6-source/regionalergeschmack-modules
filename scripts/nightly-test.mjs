/**
 * Nocne testy Regionaler Geschmack – Health · SelfHeal · Guardian · Performance
 *
 * Harmonogram: codziennie 03:03 czasu lokalnego (zegar systemowy).
 *
 * Usage:
 *   npm run nightly-test              # jednorazowo + próba SMTP
 *   npm run nightly-test -- --no-send # tylko raport lokalny
 *   npm run nightly-test:daemon       # pętla: czekaj 03:03 → test → mail
 */
import { spawnSync } from 'node:child_process';
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
    nightlyMailSubject,
    resolveMailConfig,
    sendDeveloperMail
} from './lib/developer-smtp.mjs';
import {
    NIGHTLY_HOUR,
    NIGHTLY_MINUTE,
    localDayStamp,
    describeNightlySchedule,
    sleepUntilNextNightly
} from './lib/nightly-schedule.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'docs', 'nightly');

const argv = process.argv.slice(2);
const wantDaemon = argv.includes('--daemon');
const noSend = argv.includes('--no-send');
const wantSend = !noSend;

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

function loadJson(relOrAbs) {
    const full = relOrAbs.includes(':') || relOrAbs.startsWith('/') || relOrAbs.startsWith('\\')
        ? relOrAbs
        : join(ROOT, relOrAbs);
    if (!existsSync(full)) return null;
    try {
        return JSON.parse(readFileSync(full, 'utf8'));
    } catch {
        return null;
    }
}

function runNodeScript(scriptRel, args = []) {
    const script = join(ROOT, scriptRel);
    const started = Date.now();
    const r = spawnSync(process.execPath, [script, ...args], {
        cwd: ROOT,
        encoding: 'utf8',
        maxBuffer: 20 * 1024 * 1024,
        env: process.env
    });
    return {
        script: scriptRel,
        ok: r.status === 0,
        status: r.status,
        ms: Date.now() - started,
        stdout: (r.stdout || '').slice(-4000),
        stderr: (r.stderr || '').slice(-2000)
    };
}

function collectHealth() {
    const run = runNodeScript('scripts/application-health.mjs');
    const report = loadJson('docs/health/latest.json') || {};
    return {
        run,
        overall: report.overall ?? null,
        scores: report.scores || {},
        findings: Array.isArray(report.findings) ? report.findings : [],
        errors: (report.findings || [])
            .filter((f) => f.severity === 'high' || f.severity === 'critical')
            .map((f) => f.title || f.detail || String(f))
    };
}

function collectSelfHeal() {
    const run = runNodeScript('scripts/self-healing-daily.mjs');
    const report = loadJson('docs/self-heal/latest.json') || {};
    return {
        run,
        fixes: Array.isArray(report.fixes) ? report.fixes : [],
        issues: Array.isArray(report.issues) ? report.issues : [],
        qqLeft: report.qqLeft ?? null
    };
}

function collectGuardian() {
    const run = runNodeScript('tools/ai-guardian/cli.mjs', ['run']);
    const report =
        loadJson('tools/ai-guardian/reports/latest.json') ||
        loadJson('docs/guardian-future/latest.json') ||
        {};
    const findings =
        report.findings ||
        report.topFindings ||
        report.alerts ||
        [];
    const list = Array.isArray(findings) ? findings : [];
    return {
        run,
        status: report.status || report.level || report.summary?.status || null,
        findings: list,
        warnings: list
            .filter((f) => {
                const s = String(f.severity || f.level || '').toLowerCase();
                return s === 'warn' || s === 'warning' || s === 'medium';
            })
            .map((f) => f.title || f.message || JSON.stringify(f)),
        errors: list
            .filter((f) => {
                const s = String(f.severity || f.level || '').toLowerCase();
                return s === 'high' || s === 'critical' || s === 'error';
            })
            .map((f) => f.title || f.message || JSON.stringify(f))
    };
}

function collectPerformance(health, guardian) {
    const perfScore =
        health.scores?.performance ??
        health.scores?.Performance ??
        null;
    const guardianPerf = (guardian.findings || []).filter((f) => {
        const mod = String(f.module || f.category || f.source || '').toLowerCase();
        const title = String(f.title || f.message || '').toLowerCase();
        return mod.includes('perf') || title.includes('performance') || title.includes('wydaj');
    });
    return {
        score: perfScore,
        healthOk: typeof perfScore === 'number' ? perfScore >= 70 : null,
        findings: guardianPerf.slice(0, 12).map((f) => f.title || f.message || String(f)),
        note:
            typeof perfScore === 'number'
                ? `Health performance: ${perfScore}%`
                : 'Brak score performance w Health – patrz Guardian'
    };
}

function buildReportText(payload) {
    const { day, schedule, health, selfHeal, guardian, performance, email } = payload;
    const lines = [
        `Raport nocny – Regionaler Smak ${day}`,
        '',
        `Odbiorca: ${OWNER_DEVELOPER_EMAIL}`,
        `Harmonogram: codziennie ${String(NIGHTLY_HOUR).padStart(2, '0')}:${String(NIGHTLY_MINUTE).padStart(2, '0')} (${schedule.timezone})`,
        `Wygenerowano: ${new Date().toISOString()}`,
        '',
        '========== HEALTH ==========',
        `Overall: ${health.overall ?? '—'}%`,
        health.run.ok ? `CLI: OK (${health.run.ms}ms)` : `CLI: FAIL (status ${health.run.status})`,
        ...Object.entries(health.scores || {}).map(([k, v]) => `  ${k}: ${v}%`),
        '',
        'Błędy / findings (wysokie):',
        ...((health.errors || []).length
            ? health.errors.slice(0, 15).map((e) => `• ${e}`)
            : ['• brak']),
        '',
        '========== SELF-HEAL ==========',
        selfHeal.run.ok ? `CLI: OK (${selfHeal.run.ms}ms)` : `CLI: FAIL (status ${selfHeal.run.status})`,
        'Naprawy / OK:',
        ...((selfHeal.fixes || []).length
            ? selfHeal.fixes.map((f) => `• ${f}`)
            : ['• (brak)']),
        'Problemy pozostałe:',
        ...((selfHeal.issues || []).length
            ? selfHeal.issues.map((f) => `• ${f}`)
            : ['• brak']),
        '',
        '========== GUARDIAN ==========',
        guardian.run.ok ? `CLI: OK (${guardian.run.ms}ms)` : `CLI: FAIL (status ${guardian.run.status})`,
        `Status: ${guardian.status ?? '—'}`,
        `Findings: ${guardian.findingsCount ?? guardian.findings?.length ?? 0}`,
        'Ostrzeżenia:',
        ...((guardian.warnings || []).length
            ? guardian.warnings.slice(0, 15).map((w) => `• ${w}`)
            : ['• brak']),
        'Błędy:',
        ...((guardian.errors || []).length
            ? guardian.errors.slice(0, 15).map((e) => `• ${e}`)
            : ['• brak']),
        '',
        '========== PERFORMANCE ==========',
        performance.note,
        typeof performance.score === 'number'
            ? `Wynik: ${performance.score}% (${performance.healthOk ? 'OK' : 'do poprawy'})`
            : 'Wynik: —',
        ...((performance.findings || []).length
            ? ['Guardian performance:', ...performance.findings.map((f) => `• ${f}`)]
            : ['• brak osobnych findingów performance']),
        '',
        '========== WYSYŁKA ==========',
        `SMTP: ${email?.sent ? 'wysłano' : email?.reason || 'nie wysłano'}`,
        '',
        'Polityka: autoFix=false · Brand Lock · bez Store/EventBus/API/GPS/Leaflet'
    ];
    return lines.join('\n');
}

async function runNightlyOnce() {
    const day = localDayStamp();
    const schedule = describeNightlySchedule();
    console.log(`[Nightly] start ${day} · TZ ${schedule.timezone}`);
    console.log(
        `[Nightly] harmonogram: ${String(NIGHTLY_HOUR).padStart(2, '0')}:${String(NIGHTLY_MINUTE).padStart(2, '0')} lokalnie · następny: ${schedule.nextLocal} (${schedule.humanUntil})`
    );

    console.log('[Nightly] 1/4 Health…');
    const health = collectHealth();
    console.log('[Nightly] 2/4 SelfHeal…');
    const selfHeal = collectSelfHeal();
    console.log('[Nightly] 3/4 Guardian…');
    const guardian = collectGuardian();
    console.log('[Nightly] 4/4 Performance…');
    const performance = collectPerformance(health, guardian);

    const subject = nightlyMailSubject(day);
    let email = {
        prepared: true,
        sent: false,
        to: OWNER_DEVELOPER_EMAIL,
        subject
    };

    const payload = {
        day,
        schedule,
        health: {
            overall: health.overall,
            scores: health.scores,
            errors: health.errors,
            findingsCount: health.findings.length,
            run: { ok: health.run.ok, status: health.run.status, ms: health.run.ms }
        },
        selfHeal: {
            fixes: selfHeal.fixes,
            issues: selfHeal.issues,
            qqLeft: selfHeal.qqLeft,
            run: { ok: selfHeal.run.ok, status: selfHeal.run.status, ms: selfHeal.run.ms }
        },
        guardian: {
            status: guardian.status,
            findingsCount: guardian.findings.length,
            warnings: guardian.warnings,
            errors: guardian.errors,
            run: { ok: guardian.run.ok, status: guardian.run.status, ms: guardian.run.ms }
        },
        performance,
        email,
        policy: { autoFix: false, schedule: '03:03 local' }
    };

    // email meta filled after send attempt — rebuild text after
    let text = buildReportText({ ...payload, email });

    mkdirSync(OUT_DIR, { recursive: true });
    writeFileSync(join(OUT_DIR, 'latest.json'), JSON.stringify(payload, null, 2), 'utf8');
    writeFileSync(join(OUT_DIR, `nightly-${day}.json`), JSON.stringify(payload, null, 2), 'utf8');
    writeFileSync(join(OUT_DIR, 'latest.md'), text, 'utf8');
    writeFileSync(join(OUT_DIR, `nightly-${day}.md`), text, 'utf8');

    const fileEnv = loadEnvFile();
    const mergedEnv = { ...fileEnv, ...process.env };
    const isProd =
        mergedEnv.NODE_ENV === 'production' || mergedEnv.RG_PRODUCTION === '1';

    if (isProd) {
        email = { ...email, sent: false, reason: 'production – brak wysyłki' };
    } else if (!wantSend) {
        email = { ...email, sent: false, reason: 'pominięto (--no-send)' };
    } else {
        const sendEnv = {
            ...mergedEnv,
            DEVELOPER_MAIL_SEND: mergedEnv.DEVELOPER_MAIL_SEND || '1',
            DEVELOPER_REPORT_EMAIL: OWNER_DEVELOPER_EMAIL,
            SMTP_FROM: mergedEnv.SMTP_FROM || DEFAULT_SMTP_FROM_WEEKLY
        };
        const cfg = resolveMailConfig(sendEnv);
        try {
            const result = await sendDeveloperMail({ subject, text }, sendEnv);
            email = {
                ...email,
                sendAttempted: true,
                smtpConfigured: cfg.configured,
                ...result,
                sent: Boolean(result.ok),
                reason: result.ok ? 'ok' : result.reason || result.error
            };
            if (result.ok) {
                console.log(`[Nightly] ✔ wysłano: ${subject} → ${result.to}`);
            } else {
                console.log(`[Nightly] ⏭ nie wysłano: ${result.reason || result.error}`);
                if (result.setupDoc) console.log(`  → ${result.setupDoc}`);
            }
        } catch (err) {
            email = {
                ...email,
                sendAttempted: true,
                sent: false,
                reason: String(err?.message || err)
            };
            console.warn('[Nightly] błąd SMTP:', err?.message || err);
        }
    }

    payload.email = email;
    text = buildReportText(payload);
    writeFileSync(join(OUT_DIR, 'latest.json'), JSON.stringify(payload, null, 2), 'utf8');
    writeFileSync(join(OUT_DIR, 'latest.md'), text, 'utf8');
    writeFileSync(
        join(OUT_DIR, 'latest.email.txt'),
        [
            `From: ${DEFAULT_SMTP_FROM_WEEKLY}`,
            `To: ${OWNER_DEVELOPER_EMAIL}`,
            `Subject: ${subject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            '',
            text
        ].join('\n'),
        'utf8'
    );

    console.log(text);
    console.log(`\n[Nightly] zapisano ${relative(ROOT, join(OUT_DIR, 'latest.md'))}`);
    return { payload, text, subject, email };
}

async function main() {
    if (!wantDaemon) {
        await runNightlyOnce();
        return;
    }

    console.log('[Nightly] tryb daemon – zegar systemowy, codziennie 03:03 lokalnie');
    console.log(JSON.stringify(describeNightlySchedule(), null, 2));

    // eslint-disable-next-line no-constant-condition
    while (true) {
        await sleepUntilNextNightly({
            chunkMs: 60_000,
            onWait: (info) => {
                console.log(`[Nightly] czekam na 03:03… ${info.humanUntil} (następny: ${info.nextLocal})`);
            }
        });
        console.log('[Nightly] slot 03:03 – uruchamiam testy');
        try {
            await runNightlyOnce();
        } catch (err) {
            console.error('[Nightly] błąd przebiegu:', err?.message || err);
        }
        // uniknij podwójnego startu w tej samej minucie
        await new Promise((r) => setTimeout(r, 70_000));
    }
}

await main();
