/**
 * ETAP 28D – Daily Developer Mail / Report (CLI)
 *
 * Agreguje: Health · Guardian · Learning · Virtual User · Emotion ·
 * Living Brand · Product Director · Quality Loop
 * + nowe błędy · regresje · proponowane poprawki · ocena · krytyczne · Δ vs wczoraj
 *
 * Wysyłka: TYLKO do właściciela (krispolik6@gmail.com). Nigdy do użytkowników.
 * SMTP: credentials wyłącznie z .env (patrz docs/daily/DEVELOPER-MAIL.md).
 *
 * Usage:
 *   npm run daily-report
 *   npm run daily-mail              # to samo + próba wysyłki (--send)
 *   npm run daily-report -- --send
 */
import {
    readFileSync,
    writeFileSync,
    mkdirSync,
    existsSync,
    readdirSync
} from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    OWNER_DEVELOPER_EMAIL,
    DEFAULT_SMTP_FROM,
    mailSubjectForDay,
    resolveMailConfig,
    sendDeveloperMail
} from './lib/developer-smtp.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'docs', 'daily');

const argv = process.argv.slice(2);
const wantSend = argv.includes('--send');

function dayStamp(d = new Date()) {
    return d.toISOString().slice(0, 10);
}

function yesterdayStamp(d = new Date()) {
    const x = new Date(d);
    x.setUTCDate(x.getUTCDate() - 1);
    return x.toISOString().slice(0, 10);
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
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
            v = v.slice(1, -1);
        }
        out[k] = v;
    }
    return out;
}

function clamp(n) {
    return Math.max(0, Math.min(100, Math.round(n)));
}

function isProductionCli() {
    if (process.env.NODE_ENV === 'production') return true;
    if (process.env.RG_PRODUCTION === '1') return true;
    return false;
}

function findPreviousDaily(today) {
    const y = yesterdayStamp();
    const yPath = join(OUT_DIR, `${y}.json`);
    if (existsSync(yPath)) return { day: y, report: loadJson(yPath) };
    if (!existsSync(OUT_DIR)) return { day: null, report: null };
    const days = readdirSync(OUT_DIR)
        .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
        .map((f) => f.replace(/\.json$/, ''))
        .filter((d) => d < today)
        .sort()
        .reverse();
    if (!days.length) return { day: null, report: null };
    return { day: days[0], report: loadJson(join(OUT_DIR, `${days[0]}.json`)) };
}

function buildReport(sources) {
    const {
        health,
        guardian,
        improve,
        virtual,
        advisor,
        emotion,
        livingBrand,
        director,
        qualityLoop
    } = sources;

    const hScores = health?.scores || {};
    const gScores = guardian?.scores || {};
    const vu = virtual?.summary || {};
    const vuBy = vu.byType || {};

    const checklist = {
        jsErrors: {
            ok: !(vuBy.error > 0) && !(health?.runtime?.jsErrors > 0),
            detail: `VU errors ${vuBy.error || 0}; Health runtime JS ${health?.runtime?.jsErrors ?? '—'}`
        },
        ux: {
            ok: (hScores.ux ?? 100) >= 85,
            detail: `Health UX ${hScores.ux ?? '—'}; Guardian UX ${gScores.ux ?? '—'}`
        },
        mobile: {
            ok: (hScores.mobile ?? 100) >= 85 && !(vuBy.touch > 0),
            detail: `Mobile ${hScores.mobile ?? '—'}; touch ${vuBy.touch || 0}`
        },
        css: {
            ok: !(health?.findings || []).some((f) => f.area === 'css')
                && !(improve?.proposals || []).some((p) => /css/i.test(p.file || '')),
            detail: (health?.findings || []).filter((f) => f.area === 'css').map((f) => f.title).join('; ') || 'OK'
        },
        translations: {
            ok: (hScores.translation ?? 100) >= 95,
            detail: `Translation ${hScores.translation ?? '—'}%; missing ${health?.static?.translation?.totalMissing ?? '—'}`
        },
        performance: {
            ok: (hScores.performance ?? 100) >= 85,
            detail: `Performance ${hScores.performance ?? '—'}`
        },
        fps: {
            ok: !(vuBy.fps > 0) && (vu.avgFps == null || vu.avgFps >= 30),
            detail: `avgFps ${vu.avgFps ?? '—'}; fps issues ${vuBy.fps || 0}`
        },
        memory: {
            ok: (hScores.memory ?? 100) >= 85 && !vu.memoryLeak,
            detail: `Memory ${hScores.memory ?? '—'}; leak ${vu.memoryLeak ? 'yes' : 'no'}`
        },
        pwa: {
            ok: (hScores.pwa ?? 100) >= 90,
            detail: `PWA ${hScores.pwa ?? '—'}; Guardian ${gScores.pwa ?? '—'}`
        },
        cache: {
            ok: true,
            detail: health?.static?.cache
                ? `cache score ${health.static.cache.score ?? '—'}`
                : 'zob. sw.js / Health'
        },
        images: {
            ok: !(health?.static?.assets?.missingProduct?.length),
            detail: health?.static?.assets?.missingProduct?.length
                ? `brakujące: ${health.static.assets.missingProduct.length}`
                : `unused assets ~${health?.static?.assets?.unusedCount ?? '—'}`
        },
        producerData: {
            ok: (hScores.dataQuality ?? 100) >= 90
                && !(health?.static?.producers?.issueCount > 0),
            detail: `DQ ${hScores.dataQuality ?? '—'}; producer issues ${health?.static?.producers?.issueCount ?? 0}`
        },
        improvements: {
            ok: ((improve?.summary?.total ?? improve?.proposals?.length) || 0) < 12,
            detail: `${improve?.summary?.total ?? improve?.proposals?.length ?? 0} sugestii`
        },
        emotion: {
            ok: (emotion?.wantToReturn?.score ?? 100) >= 70,
            detail: `wantToReturn ${emotion?.wantToReturn?.score ?? '—'}`
        },
        livingBrand: {
            ok: (livingBrand?.overall ?? 100) >= 80,
            detail: `overall ${livingBrand?.overall ?? '—'}; status ${livingBrand?.status ?? '—'}`
        },
        productDirector: {
            ok: (director?.productScore ?? director?.summary?.productScore ?? 100) >= 80,
            detail: `productScore ${director?.productScore ?? director?.summary?.productScore ?? '—'}`
        }
    };

    const parts = [
        health?.overall,
        hScores.performance,
        hScores.ux,
        hScores.mobile,
        hScores.memory,
        hScores.pwa,
        hScores.translation,
        hScores.dataQuality,
        vu.score,
        emotion?.wantToReturn?.score,
        livingBrand?.overall,
        director?.productScore ?? director?.summary?.productScore,
        gScores.productionReady != null ? gScores.productionReady * 10 : null
    ].filter((n) => typeof n === 'number');

    const appScore = parts.length ? clamp(parts.reduce((a, b) => a + b, 0) / parts.length) : null;
    const failedChecks = Object.entries(checklist).filter(([, v]) => !v.ok).map(([k]) => k);

    const critical = [];
    for (const f of guardian?.findings || []) {
        if (f.severity === 'critical' || f.severity === 'high') {
            critical.push({ source: 'guardian', severity: f.severity, title: f.title });
        }
    }
    for (const f of health?.findings || []) {
        if (f.severity === 'critical' || f.severity === 'high') {
            critical.push({ source: 'health', severity: f.severity, title: f.title });
        }
    }
    for (const f of livingBrand?.findings || []) {
        if (f.severity === 'critical' || f.severity === 'high') {
            critical.push({
                source: 'living-brand',
                severity: f.severity,
                title: f.title || f.message || f.id
            });
        }
    }
    for (const f of qualityLoop?.fixes || []) {
        if (f.priority === 'critical' || f.priority === 'high') {
            critical.push({ source: 'quality-loop', severity: f.priority, title: f.title });
        }
    }
    for (const c of failedChecks) {
        critical.push({ source: 'checklist', severity: 'medium', title: `Failed check: ${c}` });
    }

    const proposedFixes = [];
    for (const f of (qualityLoop?.fixes || []).slice(0, 20)) {
        proposedFixes.push({
            id: f.id,
            priority: f.priority,
            title: f.title,
            file: f.file,
            proposedFix: f.proposedFix
        });
    }
    for (const p of (improve?.proposals || []).slice(0, 10)) {
        if (proposedFixes.some((x) => x.title === p.title)) continue;
        proposedFixes.push({
            id: p.id || null,
            priority: p.priority,
            title: p.title,
            file: p.file,
            proposedFix: p.proposedFix
        });
    }

    const day = dayStamp();
    const subject = mailSubjectForDay(day);

    const qlFixes = qualityLoop?.fixes || [];
    const doneStatuses = new Set(['applied', 'done', 'accepted', 'fixed', 'resolved']);
    const fixesDone = qlFixes
        .filter((f) => doneStatuses.has(String(f.status || '').toLowerCase()))
        .map((f) => ({
            id: f.id,
            status: f.status,
            title: f.title,
            file: f.file
        }));
    const fixesPending = qlFixes
        .filter((f) => !doneStatuses.has(String(f.status || '').toLowerCase()))
        .map((f) => ({
            id: f.id,
            status: f.status || 'pending',
            priority: f.priority,
            title: f.title,
            file: f.file,
            proposedFix: f.proposedFix
        }));
    const improvements = [];
    for (const item of qualityLoop?.diff?.improvements || []) {
        improvements.push({
            source: 'quality-loop',
            title: typeof item === 'string' ? item : item.title || item.metric || String(item)
        });
    }
    for (const p of improve?.proposals || []) {
        improvements.push({
            source: 'improvement',
            priority: p.priority,
            title: p.title,
            file: p.file,
            proposedFix: p.proposedFix
        });
    }

    return {
        id: `daily-dev-${day}-cli`,
        title: 'Daily Developer Report',
        mailSubject: subject,
        mailFrom: DEFAULT_SMTP_FROM,
        generatedAt: new Date().toISOString(),
        day,
        reason: 'cli-daily-28d',
        policy: {
            autoFix: false,
            autoModifyCode: false,
            developerOnly: true,
            ownerOnly: true,
            noUserEmail: true,
            recipient: OWNER_DEVELOPER_EMAIL,
            emailFromEnv: 'DEVELOPER_REPORT_EMAIL',
            smtpFromEnv: ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM', 'DEVELOPER_MAIL_SEND']
        },
        appScore,
        healthScore: health?.overall ?? null,
        checklist,
        failedChecks,
        critical: critical.slice(0, 40),
        proposedFixes: proposedFixes.slice(0, 30),
        fixesDone: fixesDone.slice(0, 30),
        fixesPending: fixesPending.slice(0, 30),
        improvements: improvements.slice(0, 30),
        modules: {
            health: Boolean(health),
            guardian: Boolean(guardian),
            learning: 'local-only (browser); signals via advisor',
            virtualUser: Boolean(virtual),
            emotion: Boolean(emotion),
            livingBrand: Boolean(livingBrand),
            productDirector: Boolean(director),
            qualityLoop: Boolean(qualityLoop),
            // legacy aliases (tests / browser parity)
            healthMonitor: Boolean(health),
            aiGuardian: Boolean(guardian),
            improvementEngine: Boolean(improve),
            learningEngine: 'local-only (browser)',
            projectAdvisor: Boolean(advisor)
        },
        sections: {
            health: {
                overall: health?.overall ?? null,
                scores: hScores,
                findings: (health?.findings || []).slice(0, 12),
                jsErrors: health?.runtime?.jsErrors ?? 0
            },
            guardian: guardian
                ? {
                    reportId: guardian.reportId,
                    scores: gScores,
                    findingCount: (guardian.findings || []).length,
                    topFindings: (guardian.findings || []).slice(0, 10).map((f) => ({
                        severity: f.severity,
                        title: f.title
                    }))
                }
                : { available: false },
            learning: {
                note: 'Learning Engine: lokalnie w przeglądarce (localStorage/IDB). Nie wysyłane użytkownikom.',
                fromAdvisor: advisor?.summary?.learningSignals ?? null,
                topCategory: advisor?.summary?.topCategory ?? null
            },
            virtualUser: {
                score: vu.score ?? null,
                passed: vu.passed,
                failed: vu.failed,
                avgFps: vu.avgFps,
                memoryLeak: vu.memoryLeak,
                byType: vuBy
            },
            emotion: emotion
                ? {
                    wantToReturn: emotion.wantToReturn?.score ?? null,
                    level: emotion.wantToReturn?.level ?? null,
                    headline: emotion.headline ?? null,
                    scores: emotion.scores ?? null,
                    strongest: emotion.strongest,
                    weakest: emotion.weakest
                }
                : { available: false },
            livingBrand: livingBrand
                ? {
                    overall: livingBrand.overall ?? null,
                    status: livingBrand.status ?? null,
                    verdict: livingBrand.verdict ?? null,
                    scores: livingBrand.scores ?? null,
                    summary: livingBrand.summary ?? null
                }
                : { available: false },
            productDirector: director
                ? {
                    productScore: director.productScore ?? director.summary?.productScore ?? null,
                    headline: director.headline ?? null,
                    priorities: (director.summary?.priorities || []).slice(0, 8)
                }
                : { available: false },
            qualityLoop: qualityLoop
                ? {
                    day: qualityLoop.day,
                    regressionCount: qualityLoop.summary?.regressionCount ?? (qualityLoop.diff?.regressions || []).length,
                    fixesPending: qualityLoop.summary?.fixesPending ?? (qualityLoop.fixes || []).length,
                    healthOverall: qualityLoop.summary?.healthOverall ?? null,
                    dailyAppScore: qualityLoop.summary?.dailyAppScore ?? null,
                    regressions: (qualityLoop.diff?.regressions || []).slice(0, 15),
                    improvements: (qualityLoop.diff?.improvements || []).slice(0, 15)
                }
                : { available: false },
            // legacy section names for older consumers / tests
            healthMonitor: {
                overall: health?.overall ?? null,
                scores: hScores,
                findings: (health?.findings || []).slice(0, 12),
                jsErrors: health?.runtime?.jsErrors ?? 0
            },
            aiGuardian: guardian
                ? {
                    reportId: guardian.reportId,
                    scores: gScores,
                    findingCount: (guardian.findings || []).length,
                    topFindings: (guardian.findings || []).slice(0, 10).map((f) => ({
                        severity: f.severity,
                        title: f.title,
                        files: f.files
                    }))
                }
                : { available: false, note: 'npm run guardian' },
            improvementEngine: {
                total: improve?.summary?.total ?? (improve?.proposals || []).length,
                byPriority: improve?.summary?.byPriority || null,
                proposals: (improve?.proposals || []).slice(0, 12)
            },
            learningEngine: {
                note: 'Sygnały lokalne w przeglądarce. Nie wysyłane.',
                fromAdvisor: advisor?.summary?.learningSignals ?? null,
                topCategory: advisor?.summary?.topCategory ?? null
            },
            projectAdvisor: {
                headline: advisor?.headline || null,
                questions: (advisor?.questions || []).map((q) => ({
                    question: q.question,
                    answer: q.answer
                }))
            }
        },
        suggestions: (improve?.proposals || []).slice(0, 10).map((p) => ({
            priority: p.priority,
            title: p.title,
            file: p.file,
            function: p.function,
            proposedFix: p.proposedFix
        })),
        newErrors: [],
        regressions: [],
        changesSinceYesterday: null
    };
}

function attachDiff(report, prev) {
    const newErrors = [];
    const prevFindings = new Set(
        (prev?.sections?.healthMonitor?.findings || prev?.sections?.health?.findings || [])
            .map((f) => f.title)
    );
    for (const f of report.sections.health.findings || []) {
        if (f.title && !prevFindings.has(f.title)) {
            newErrors.push({ source: 'health', title: f.title, severity: f.severity || 'info' });
        }
    }
    const prevJs = prev?.sections?.healthMonitor?.jsErrors ?? prev?.sections?.health?.jsErrors ?? 0;
    const jsNow = report.sections.health.jsErrors || 0;
    if (jsNow > (prevJs || 0)) {
        newErrors.push({
            source: 'runtime',
            title: `Wzrost błędów JS: ${prevJs || 0} → ${jsNow}`,
            severity: 'high'
        });
    }

    const qlRegs = report.sections.qualityLoop?.regressions || [];
    const regressions = qlRegs.length
        ? qlRegs
        : [];

    if (prev?.appScore != null && report.appScore != null && report.appScore < prev.appScore) {
        regressions.push({
            metric: 'appScore',
            yesterday: prev.appScore,
            today: report.appScore,
            delta: report.appScore - prev.appScore
        });
    }

    const prevFail = new Set(prev?.failedChecks || []);
    for (const c of report.failedChecks || []) {
        if (!prevFail.has(c)) {
            newErrors.push({ source: 'checklist', title: `Nowy fail: ${c}`, severity: 'medium' });
        }
    }

    const changes = {
        baselineDay: prev?.day || null,
        appScore: {
            yesterday: prev?.appScore ?? null,
            today: report.appScore,
            delta:
                prev?.appScore != null && report.appScore != null
                    ? report.appScore - prev.appScore
                    : null
        },
        modules: {
            health: report.sections.health.overall,
            emotion: report.sections.emotion.wantToReturn ?? null,
            livingBrand: report.sections.livingBrand.overall ?? null,
            productDirector: report.sections.productDirector.productScore ?? null,
            qualityLoopFixes: report.sections.qualityLoop.fixesPending ?? null
        },
        notes: prev
            ? [
                `Porównanie z ${prev.day}`,
                `Ocena: ${prev.appScore ?? '—'}% → ${report.appScore ?? '—'}%`,
                `Regresje QL: ${regressions.length}`,
                `Nowe błędy/sygnały: ${newErrors.length}`
            ]
            : ['Brak raportu z wczoraj — baseline.']
    };

    report.newErrors = newErrors.slice(0, 30);
    report.regressions = regressions.slice(0, 30);
    report.changesSinceYesterday = changes;
    return report;
}

function toMarkdown(report) {
    const lines = [
        `# ${report.title}`,
        '',
        `Dzień: **${report.day}**`,
        `Wygenerowano: ${report.generatedAt}`,
        `Health Score: **${report.healthScore ?? report.sections?.health?.overall ?? '—'}**`,
        `Ocena aplikacji: **${report.appScore ?? '—'}%**`,
        `Temat maila: ${report.mailSubject}`,
        `Nadawca: ${report.mailFrom || DEFAULT_SMTP_FROM}`,
        '',
        '## Polityka',
        '',
        '- **autoFix: false**',
        '- developerOnly / ownerOnly: true',
        `- odbiorca: wyłącznie \`${OWNER_DEVELOPER_EMAIL}\` (nie użytkownicy)`,
        '- SMTP: credentials tylko w `.env` (nie w kodzie)',
        '',
        '## Moduły diagnostyczne',
        '',
        `- Health: ${report.modules.health ? '✔' : '✖'}`,
        `- Guardian: ${report.modules.guardian ? '✔' : '✖'}`,
        `- Learning: ${report.modules.learning}`,
        `- Virtual User: ${report.modules.virtualUser ? '✔' : '✖'}`,
        `- Emotion: ${report.modules.emotion ? '✔' : '✖'}`,
        `- Living Brand: ${report.modules.livingBrand ? '✔' : '✖'}`,
        `- Product Director: ${report.modules.productDirector ? '✔' : '✖'}`,
        `- Quality Loop: ${report.modules.qualityLoop ? '✔' : '✖'}`,
        '',
        '## Health Score',
        '',
        `**${report.healthScore ?? report.sections?.health?.overall ?? '—'}** · App score **${report.appScore ?? '—'}%**`,
        '',
        '## Checklist',
        ''
    ];

    for (const [key, val] of Object.entries(report.checklist || {})) {
        lines.push(`- ${val.ok ? '✔' : '✖'} **${key}** — ${val.detail}`);
    }
    lines.push('', `Failed: ${(report.failedChecks || []).join(', ') || 'brak'}`, '');

    lines.push('## Krytyczne problemy', '');
    if (!(report.critical || []).length) lines.push('_Brak krytycznych / high._');
    else {
        for (const c of report.critical) {
            lines.push(`- **[${c.severity}]** (${c.source}) ${c.title}`);
        }
    }

    lines.push('', '## Błędy (Errors)', '');
    if (!(report.newErrors || []).length && !(report.critical || []).length) {
        lines.push('_Brak nowych błędów / sygnałów krytycznych._');
    } else {
        for (const e of report.newErrors || []) {
            lines.push(`- **[${e.severity}]** (${e.source}) ${e.title}`);
        }
        for (const c of report.critical || []) {
            if ((report.newErrors || []).some((e) => e.title === c.title)) continue;
            lines.push(`- **[${c.severity}]** (${c.source}) ${c.title}`);
        }
    }

    lines.push('', '## Regresje', '');
    if (!(report.regressions || []).length) lines.push('_Brak regresji._');
    else {
        for (const r of report.regressions) {
            lines.push(`- **${r.metric}**: ${r.yesterday} → ${r.today} (Δ ${r.delta})`);
        }
    }

    lines.push('', '## Poprawki (Fixes)', '');
    if ((report.fixesDone || []).length) {
        lines.push('### Zastosowane / zaakceptowane', '');
        for (const f of report.fixesDone) {
            lines.push(`- **[${f.status}]** ${f.title}${f.file ? ` (\`${f.file}\`)` : ''}`);
        }
        lines.push('');
    }
    lines.push('### Oczekujące akceptacji', '');
    if (!(report.fixesPending || []).length && !(report.proposedFixes || []).length) {
        lines.push('_Brak oczekujących poprawek._');
    } else {
        for (const f of report.fixesPending || report.proposedFixes || []) {
            lines.push(`- **[${f.priority || f.status || 'pending'}]** ${f.title}`);
            if (f.file) lines.push(`  - \`${f.file}\``);
            if (f.proposedFix) lines.push(`  - ${f.proposedFix}`);
        }
    }

    lines.push('', '## Ulepszenia (Improvements)', '');
    if (!(report.improvements || []).length) lines.push('_Brak nowych ulepszeń w raportach._');
    else {
        for (const u of report.improvements) {
            lines.push(`- **(${u.source})** ${u.title}`);
            if (u.file) lines.push(`  - \`${u.file}\``);
            if (u.proposedFix) lines.push(`  - ${u.proposedFix}`);
        }
    }

    lines.push('', '## Zmiany od wczoraj', '');
    const ch = report.changesSinceYesterday;
    if (!ch?.baselineDay) lines.push('_Baseline — brak poprzedniego dnia._');
    else {
        for (const n of ch.notes || []) lines.push(`- ${n}`);
    }

    lines.push('', '## Health', '');
    const h = report.sections.health;
    lines.push(`Overall: ${h.overall ?? '—'}`);
    if (h.scores) {
        for (const [k, v] of Object.entries(h.scores)) lines.push(`- ${k}: ${v}%`);
    }

    lines.push('', '## Guardian', '');
    const g = report.sections.guardian;
    if (g.scores) {
        for (const [k, v] of Object.entries(g.scores)) lines.push(`- ${k}: ${v}`);
        for (const f of g.topFindings || []) lines.push(`- [${f.severity}] ${f.title}`);
    } else lines.push('brak');

    lines.push('', '## Learning', '', report.sections.learning.note, '');

    lines.push('', '## Virtual User', '');
    const v = report.sections.virtualUser;
    lines.push(`Score: ${v.score ?? '—'} · FPS: ${v.avgFps ?? '—'} · leak: ${v.memoryLeak ? 'yes' : 'no'}`);

    lines.push('', '## Emotion', '');
    const em = report.sections.emotion;
    if (em.available === false) lines.push('brak — `npm run emotion`');
    else {
        lines.push(`wantToReturn: ${em.wantToReturn ?? '—'} (${em.level || '—'})`);
        lines.push(em.headline || '');
    }

    lines.push('', '## Living Brand', '');
    const lb = report.sections.livingBrand;
    if (lb.available === false) lines.push('brak — `npm run living-brand`');
    else {
        lines.push(`Overall: ${lb.overall ?? '—'} · ${lb.status || ''}`);
        lines.push(lb.verdict || '');
    }

    lines.push('', '## Product Director', '');
    const pd = report.sections.productDirector;
    if (pd.available === false) lines.push('brak — `npm run director`');
    else {
        lines.push(`Score: ${pd.productScore ?? '—'} · ${pd.headline || ''}`);
        for (const p of pd.priorities || []) lines.push(`- ${p}`);
    }

    lines.push('', '## Quality Loop', '');
    const ql = report.sections.qualityLoop;
    if (ql.available === false) lines.push('brak — `npm run quality-loop`');
    else {
        lines.push(`Regresje: ${ql.regressionCount ?? 0} · poprawki pending: ${ql.fixesPending ?? 0}`);
    }

    lines.push('', '## Project Advisor', '');
    lines.push(report.sections.projectAdvisor.headline || '—');

    lines.push('');
    return lines.join('\n');
}

function bulletLines(items, empty = '(brak)') {
    if (!items.length) return [`  ${empty}`];
    return items.map((line) => `  - ${line}`);
}

/**
 * Zwykły e-mail: tylko text/plain w treści (bez HTML, bez załączników).
 */
function buildEmailBodies(report) {
    const subject = report.mailSubject || mailSubjectForDay(report.day);
    const healthScore = report.healthScore ?? report.sections?.health?.overall ?? '—';
    const errorLines = [];
    for (const c of (report.critical || []).slice(0, 12)) {
        errorLines.push(`[${c.severity}] ${c.title}`);
    }
    for (const e of (report.newErrors || []).slice(0, 10)) {
        if (errorLines.some((l) => l.includes(e.title))) continue;
        errorLines.push(`[${e.severity || 'info'}] ${e.title}`);
    }
    for (const r of (report.regressions || []).slice(0, 8)) {
        errorLines.push(`regresja ${r.metric}: ${r.yesterday} -> ${r.today}`);
    }
    if ((report.failedChecks || []).length) {
        errorLines.push(`failed checks: ${(report.failedChecks || []).join(', ')}`);
    }

    const fixLines = [];
    for (const f of (report.fixesDone || []).slice(0, 10)) {
        fixLines.push(`[${f.status}] ${f.title}`);
    }
    for (const f of (report.fixesPending || report.proposedFixes || []).slice(0, 12)) {
        fixLines.push(`[${f.priority || f.status || 'pending'}] ${f.title}`);
    }

    const improveLines = (report.improvements || []).slice(0, 12).map((u) => {
        const p = u.priority ? `[${u.priority}] ` : '';
        return `${p}${u.title}`;
    });

    const changeNotes = report.changesSinceYesterday?.notes || [];

    const text = [
        subject,
        '='.repeat(Math.min(subject.length, 48)),
        '',
        `Dzien: ${report.day}`,
        `Odbiorca: ${OWNER_DEVELOPER_EMAIL}`,
        '',
        '=== Health Score ===',
        `  Health overall : ${healthScore}`,
        `  App score      : ${report.appScore ?? '—'}%`,
        `  Guardian       : ${report.sections.guardian.findingCount ?? '—'} findings`,
        `  Quality Loop   : ${report.sections.qualityLoop.regressionCount ?? '—'} regresji`,
        '',
        '=== Bledy (Errors) ===',
        ...bulletLines(errorLines),
        '',
        '=== Poprawki (Fixes) ===',
        ...bulletLines(fixLines),
        '',
        '=== Ulepszenia (Improvements) ===',
        ...bulletLines(improveLines),
        '',
        '=== Zmiany od wczoraj ===',
        ...bulletLines(changeNotes.length ? changeNotes : ['baseline']),
        '',
        '---',
        `Pelny raport: docs/daily/${report.day}.md`,
        'Format: text/plain w tresci (bez HTML, bez zalacznikow)',
        'Polityka: autoFix=false | tylko wlasciciel'
    ].join('\n');

    return { text, subject, format: 'text/plain' };
}

function prepareEmailFile(report) {
    const { text, subject } = buildEmailBodies(report);
    const from = report.mailFrom || DEFAULT_SMTP_FROM;
    const raw = [
        `From: ${from}`,
        `To: ${OWNER_DEVELOPER_EMAIL}`,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        '',
        text
    ].join('\n');
    return { to: OWNER_DEVELOPER_EMAIL, from, subject, body: text, raw };
}

// ——— main ———
const fileEnv = loadEnvFile();
const mergedEnv = { ...fileEnv, ...process.env };

const health = loadJson('docs/health/latest.json');
const guardian = loadJson('tools/ai-guardian/reports/latest.json');
const improve = loadJson('docs/improvements/latest.json');
const virtual = loadJson('docs/virtual-user/latest.json');
const advisor = loadJson('docs/advisor/latest.json');
const emotion = loadJson('docs/emotion/latest.json');
const livingBrand = loadJson('docs/living-brand/latest.json');
const director = loadJson('docs/product-director/latest.json');
const qualityLoop = loadJson('docs/quality-loop/latest.json');

let report = buildReport({
    health,
    guardian,
    improve,
    virtual,
    advisor,
    emotion,
    livingBrand,
    director,
    qualityLoop
});

const today = report.day;
const { day: prevDay, report: prevReport } = findPreviousDaily(today);
// Avoid comparing against today's file if we overwrite — use prev only when day differs
const prevSafe =
    prevReport && prevReport.day && prevReport.day < today ? prevReport : null;
report = attachDiff(report, prevSafe || (prevDay && prevDay < today ? prevReport : null));

mkdirSync(OUT_DIR, { recursive: true });
const jsonPath = join(OUT_DIR, 'latest.json');
const mdPath = join(OUT_DIR, 'latest.md');
const md = toMarkdown(report);

writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');
writeFileSync(mdPath, md, 'utf8');
writeFileSync(join(OUT_DIR, `${today}.json`), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT_DIR, `${today}.md`), md, 'utf8');

const draft = prepareEmailFile(report);
writeFileSync(join(OUT_DIR, 'latest.email.txt'), draft.raw, 'utf8');
writeFileSync(
    join(OUT_DIR, 'latest.mailto.txt'),
    `mailto:${draft.to}?subject=${encodeURIComponent(draft.subject)}`,
    'utf8'
);

const subject = report.mailSubject || mailSubjectForDay(today);

let emailMeta = {
    prepared: true,
    autoSend: false,
    to: OWNER_DEVELOPER_EMAIL,
    from: DEFAULT_SMTP_FROM,
    subject,
    files: ['docs/daily/latest.email.txt', 'docs/daily/latest.mailto.txt'],
    sent: false
};

if (isProductionCli()) {
    emailMeta = {
        prepared: false,
        reason: 'blocked: production (NODE_ENV/RG_PRODUCTION)',
        to: OWNER_DEVELOPER_EMAIL,
        from: DEFAULT_SMTP_FROM,
        subject,
        sent: false
    };
    console.log('[Daily Report] produkcja – pomijam przygotowanie/wysyłkę e-maila');
} else {
    console.log(`[Daily Report] draft → docs/daily/latest.email.txt · To: ${OWNER_DEVELOPER_EMAIL}`);

    if (wantSend) {
        const cfg = resolveMailConfig(mergedEnv);
        const bodies = buildEmailBodies(report);
        const sendEnv = {
            ...mergedEnv,
            DEVELOPER_MAIL_SEND: mergedEnv.DEVELOPER_MAIL_SEND || '1',
            DEVELOPER_REPORT_EMAIL: OWNER_DEVELOPER_EMAIL,
            SMTP_FROM: mergedEnv.SMTP_FROM || DEFAULT_SMTP_FROM
        };
        try {
            const result = await sendDeveloperMail(
                { subject: bodies.subject || subject, text: bodies.text },
                sendEnv
            );
            emailMeta = {
                ...emailMeta,
                sendAttempted: true,
                smtpConfigured: cfg.configured,
                from: cfg.from || DEFAULT_SMTP_FROM,
                ...result,
                sent: Boolean(result.ok),
                autoSend: Boolean(result.ok)
            };
            if (result.ok) {
                console.log(`[Daily Mail] ✔ wysłano do ${result.to} · ${result.messageId || ''}`);
            } else {
                console.log(`[Daily Mail] ⏭ nie wysłano: ${result.reason}`);
                if (result.setupDoc) console.log(`  → instrukcja: ${result.setupDoc}`);
            }
        } catch (err) {
            emailMeta = {
                ...emailMeta,
                sendAttempted: true,
                sent: false,
                error: String(err?.message || err)
            };
            console.warn('[Daily Mail] błąd SMTP:', err?.message || err);
        }
    } else {
        console.log('[Daily Mail] bez --send (tylko pliki). Użyj: npm run send-report');
    }
}

report.email = emailMeta;
writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT_DIR, `${today}.json`), JSON.stringify(report, null, 2), 'utf8');

console.log(`[Daily Developer Report] score ${report.appScore ?? '—'}%`);
console.log(`Failed checks: ${(report.failedChecks || []).join(', ') || 'brak'}`);
console.log(`Critical: ${(report.critical || []).length} · New errors: ${(report.newErrors || []).length} · Regressions: ${(report.regressions || []).length}`);
console.log(`Wrote: ${relative(ROOT, mdPath)}`);
console.log(`Policy: autoFix=false · ownerOnly · ${OWNER_DEVELOPER_EMAIL}`);
