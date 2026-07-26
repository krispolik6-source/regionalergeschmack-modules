/**
 * ETAP 23 – AI Quality Loop
 *
 * Codziennie:
 *   AI Guardian → Health → Virtual User → Learning → Improvement → Project Advisor
 *   → Emotion → Living Brand → Product Director
 *   → raport → porównanie z wczoraj → regresje → lista poprawek
 *   → Daily Developer Mail (tylko właściciel)
 *   → AI Dream Mode (Product Owner reflection, bez zmian kodu)
 *   → Regional Intelligence (gospodarz regionu, 1 rekomendacja)
 *   → Brand Protection AI (Brand Book, bez zmian kodu)
 *   → Product Brain (3 propozycje na jutro, bez wdrożenia)
 *   → Self Reflection (samoocena dnia, bez zmian kodu)
 *   → Guardian of the Future (trendy + prognozy, bez zmian kodu)
 *
 * NIGDY nie zmienia kodu aplikacji. autoApply = false. Ty tylko zatwierdzasz.
 *
 * Usage:
 *   npm run quality-loop
 *   npm run quality-loop -- --skip-guardian
 *   npm run quality-loop -- --dry-run   (tylko agregacja istniejących raportów)
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
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'docs', 'quality-loop');

const POLICY = Object.freeze({
    autoFix: false,
    autoApply: false,
    autoCommit: false,
    autoModifyCode: false,
    requiresHumanAcceptance: true,
    loop: 'AI Guardian → Health → Virtual User → Learning → Improvement → Advisor → Emotion → Living Brand → Director → Diff → Fixes → Daily Mail'
});

function dayStamp(d = new Date()) {
    return d.toISOString().slice(0, 10);
}

function yesterdayStamp(d = new Date()) {
    const x = new Date(d);
    x.setUTCDate(x.getUTCDate() - 1);
    return x.toISOString().slice(0, 10);
}

function loadJson(relOrAbs) {
    const full = relOrAbs.startsWith('/') || /^[A-Za-z]:/.test(relOrAbs)
        ? relOrAbs
        : join(ROOT, relOrAbs);
    if (!existsSync(full)) return null;
    try {
        return JSON.parse(readFileSync(full, 'utf8'));
    } catch {
        return null;
    }
}

function runStep(name, args, { optional = false } = {}) {
    console.log(`\n▶ [${name}] ${args.join(' ')}`);
    const started = Date.now();
    const res = spawnSync(process.execPath, args, {
        cwd: ROOT,
        encoding: 'utf8',
        env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'development' }
    });
    const ms = Date.now() - started;
    const ok = res.status === 0;
    if (!ok) {
        console.warn(`⚠ [${name}] exit ${res.status} (${ms}ms)`);
        if (res.stderr) console.warn(String(res.stderr).slice(0, 400));
        if (!optional) {
            return { name, ok: false, ms, status: res.status, optional };
        }
    } else {
        console.log(`✔ [${name}] OK (${ms}ms)`);
    }
    return { name, ok, ms, status: res.status ?? 0, optional };
}

function findPreviousReport(today) {
    const y = yesterdayStamp();
    const yPath = join(OUT_DIR, `${y}.json`);
    if (existsSync(yPath)) return { day: y, report: loadJson(yPath) };

    // najbliższy wcześniejszy dzień w archiwum
    if (!existsSync(OUT_DIR)) return { day: null, report: null };
    const days = readdirSync(OUT_DIR)
        .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
        .map((f) => f.replace(/\.json$/, ''))
        .filter((d) => d < today)
        .sort()
        .reverse();
    if (!days.length) {
        const latest = loadJson(join(OUT_DIR, 'latest.json'));
        if (latest?.day && latest.day < today) return { day: latest.day, report: latest };
        return { day: null, report: null };
    }
    return { day: days[0], report: loadJson(join(OUT_DIR, `${days[0]}.json`)) };
}

function snapshotScores({ health, guardian, improve, virtual, advisor, daily }) {
    return {
        healthOverall: health?.overall ?? null,
        healthPerformance: health?.scores?.performance ?? null,
        healthUx: health?.scores?.ux ?? null,
        healthMobile: health?.scores?.mobile ?? null,
        healthMemory: health?.scores?.memory ?? null,
        healthPwa: health?.scores?.pwa ?? null,
        healthTranslation: health?.scores?.translation ?? null,
        guardianProductionReady: guardian?.scores?.productionReady ?? null,
        guardianQuality: guardian?.scores?.quality ?? null,
        improveCount: improve?.summary?.total ?? (improve?.proposals || []).length,
        virtualScore: virtual?.summary?.score ?? null,
        virtualFailed: virtual?.summary?.failed ?? null,
        dailyAppScore: daily?.appScore ?? null,
        advisorHeadline: advisor?.headline ?? null,
        failedChecks: daily?.failedChecks || []
    };
}

function compareScores(today, prev) {
    if (!prev) {
        return { available: false, deltas: [], regressions: [], improvements: [] };
    }
    const keys = Object.keys(today).filter((k) => k !== 'failedChecks' && k !== 'advisorHeadline');
    const deltas = [];
    const regressions = [];
    const improvements = [];

    for (const k of keys) {
        const a = today[k];
        const b = prev[k];
        if (typeof a !== 'number' || typeof b !== 'number') continue;
        const d = Math.round((a - b) * 100) / 100;
        if (d === 0) continue;
        const entry = { metric: k, yesterday: b, today: a, delta: d };
        deltas.push(entry);
        // Wyższe = lepiej dla score; dla improveCount / virtualFailed niższe = lepiej
        const lowerIsBetter = k === 'improveCount' || k === 'virtualFailed';
        if (lowerIsBetter ? d > 0 : d < 0) regressions.push(entry);
        else improvements.push(entry);
    }

    // failed checks nowe
    const prevFail = new Set(prev.failedChecks || []);
    const todayFail = today.failedChecks || [];
    for (const c of todayFail) {
        if (!prevFail.has(c)) {
            regressions.push({
                metric: `failedCheck:${c}`,
                yesterday: 'ok',
                today: 'fail',
                delta: -1
            });
        }
    }

    return { available: true, deltas, regressions, improvements };
}

function buildFixList({ health, guardian, improve, virtual, daily, regressions }) {
    const fixes = [];
    let n = 0;
    const add = (f) => {
        n += 1;
        fixes.push({
            id: `QL-FIX-${String(n).padStart(3, '0')}`,
            status: 'pending_approval',
            autoApply: false,
            requiresHumanAcceptance: true,
            ...f
        });
    };

    for (const r of regressions.slice(0, 12)) {
        add({
            priority: 'high',
            source: 'regression',
            title: `Regresja: ${r.metric} (${r.yesterday} → ${r.today})`,
            file: 'docs/quality-loop/latest.md',
            function: 'quality-loop-diff',
            proposedFix: `Przywróć poziom wczorajszy metryki „${r.metric}”. Sprawdź ostatnie zmiany UI/CSS/JS związane z tą metryką.`,
            impact: 'high',
            risk: 'medium'
        });
    }

    for (const p of (improve?.proposals || []).slice(0, 12)) {
        add({
            priority: p.priority || 'medium',
            source: 'improvement',
            title: p.title,
            file: p.file,
            function: p.function,
            proposedFix: p.proposedFix,
            impact: p.impact,
            risk: p.risk
        });
    }

    for (const f of (guardian?.findings || []).filter((x) => x.severity === 'high' || x.severity === 'critical').slice(0, 8)) {
        add({
            priority: f.severity === 'critical' ? 'critical' : 'high',
            source: 'guardian',
            title: f.title,
            file: (f.files && f.files[0]) || 'n/a',
            function: 'guardian-finding',
            proposedFix: f.proposal || f.proposedSolution || 'Review Guardian finding.',
            impact: 'high',
            risk: f.regressionRisk || 'medium'
        });
    }

    for (const f of (health?.findings || []).slice(0, 6)) {
        add({
            priority: f.severity === 'high' ? 'high' : 'medium',
            source: 'health',
            title: f.title,
            file: f.area === 'css' ? 'css/style.css' : 'js/app.js',
            function: f.area || 'health',
            proposedFix: f.detail || 'Napraw finding Health.',
            impact: 'medium',
            risk: 'low'
        });
    }

    for (const i of (virtual?.issues || []).filter((x) => x.severity === 'high').slice(0, 5)) {
        add({
            priority: 'high',
            source: 'virtual-user',
            title: i.title,
            file: i.where || 'runtime',
            function: i.scenario || 'scenario',
            proposedFix: i.detail || 'Napraw scenariusz Virtual User.',
            impact: 'high',
            risk: 'medium'
        });
    }

    for (const c of daily?.failedChecks || []) {
        add({
            priority: 'medium',
            source: 'daily',
            title: `Checklist fail: ${c}`,
            file: 'docs/daily/latest.json',
            function: c,
            proposedFix: `Domknij punkt checklisty „${c}” z Daily Developer Report.`,
            impact: 'medium',
            risk: 'low'
        });
    }

    // dedupe po title+file
    const seen = new Set();
    const unique = [];
    for (const f of fixes) {
        const key = `${f.title}|${f.file}`;
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push(f);
    }

    const rank = { critical: 0, high: 1, medium: 2, low: 3 };
    unique.sort((a, b) => (rank[a.priority] ?? 4) - (rank[b.priority] ?? 4));
    return unique.slice(0, 40).map((f, i) => ({ ...f, id: `QL-FIX-${String(i + 1).padStart(3, '0')}` }));
}

function toMarkdown(report) {
    const lines = [
        `# AI Quality Loop`,
        '',
        `Dzień: **${report.day}**`,
        `Wygenerowano: ${report.generatedAt}`,
        '',
        '## Polityka',
        '',
        '- **autoApply: false** — nic nie jest wdrażane automatycznie',
        '- **requiresHumanAcceptance: true** — Ty tylko zatwierdzasz',
        `- Pipeline: \`${POLICY.loop}\``,
        '',
        '## Kroki pipeline',
        ''
    ];
    for (const s of report.steps || []) {
        lines.push(`- ${s.ok ? '✔' : '✖'} **${s.name}** (${s.ms}ms)${s.optional ? ' · optional' : ''}`);
    }

    lines.push('', '## Scores dziś', '');
    for (const [k, v] of Object.entries(report.scores || {})) {
        if (k === 'failedChecks') {
            lines.push(`- failedChecks: ${(v || []).join(', ') || 'brak'}`);
        } else {
            lines.push(`- ${k}: ${v ?? '—'}`);
        }
    }

    lines.push('', '## Porównanie z poprzednim raportem', '');
    if (!report.diff?.available) {
        lines.push('_Brak raportu z wczoraj / wcześniejszego dnia — to baseline._');
    } else {
        lines.push(`Porównanie z: **${report.diff.baselineDay}**`, '');
        lines.push('### Regresje', '');
        if (!(report.diff.regressions || []).length) lines.push('_Brak regresji numerycznych._');
        else {
            for (const r of report.diff.regressions) {
                lines.push(`- **${r.metric}**: ${r.yesterday} → ${r.today} (Δ ${r.delta})`);
            }
        }
        lines.push('', '### Ulepszenia', '');
        if (!(report.diff.improvements || []).length) lines.push('_Brak wzrostów._');
        else {
            for (const r of report.diff.improvements.slice(0, 15)) {
                lines.push(`- **${r.metric}**: ${r.yesterday} → ${r.today} (Δ +${Math.abs(r.delta)})`);
            }
        }
    }

    lines.push('', '## Learning', '', report.learning?.note || '—', '');

    lines.push('', '## Project Advisor (headline)', '', report.advisorHeadline || '—', '');

    lines.push('', '## Lista poprawek (do zatwierdzenia)', '');
    lines.push(`Łącznie: **${(report.fixes || []).length}** · wszystkie \`pending_approval\``, '');
    for (const f of report.fixes || []) {
        lines.push(`### ${f.id} — [${f.priority}] ${f.title}`);
        lines.push('');
        lines.push(`- status: \`${f.status}\``);
        lines.push(`- source: ${f.source}`);
        lines.push(`- plik: \`${f.file}\``);
        lines.push(`- funkcja: \`${f.function}\``);
        lines.push(`- autoApply: false`);
        if (f.proposedFix) lines.push(`- poprawka: ${f.proposedFix}`);
        lines.push('');
    }

    lines.push('## Jak zatwierdzić', '');
    lines.push('1. Przejrzyj `docs/quality-loop/fixes-pending.json`');
    lines.push('2. Wybierz ID poprawek do wdrożenia ręcznie (Cursor / PR)');
    lines.push('3. Opcjonalnie zapisz decyzje w `docs/quality-loop/approvals.json` (ręcznie)');
    lines.push('4. **Nie uruchamiaj żadnego auto-patch** — pętla tego nie robi');
    lines.push('');
    return lines.join('\n');
}

// ——— main ———
const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const skipGuardian = argv.includes('--skip-guardian');
const today = dayStamp();

console.log('══════════════════════════════════════════');
console.log(' AI Quality Loop (ETAP 23)');
console.log(` ${today} · autoApply=false`);
console.log('══════════════════════════════════════════');

const steps = [];

if (!dryRun) {
    if (!skipGuardian) {
        steps.push(runStep('AI Guardian', ['tools/ai-guardian/cli.mjs', 'run'], { optional: true }));
    } else {
        steps.push({ name: 'AI Guardian', ok: true, ms: 0, status: 0, optional: true, skipped: true });
        console.log('\n⏭ [AI Guardian] skipped (--skip-guardian)');
    }
    steps.push(runStep('Health', ['scripts/application-health.mjs']));
    steps.push(runStep('Virtual User', ['scripts/virtual-user.mjs'], { optional: true }));
    // Learning – brak pełnego CLI (localStorage/IDB w przeglądarce)
    steps.push({
        name: 'Learning',
        ok: true,
        ms: 0,
        status: 0,
        optional: true,
        note: 'Learning Engine działa lokalnie w przeglądarce; CLI bierze sygnały pośrednio z Advisor/Daily'
    });
    console.log('\n✔ [Learning] snapshot pośredni (browser-local engine)');
    steps.push(runStep('Improvement', ['scripts/improvement-engine.mjs']));
    steps.push(runStep('Project Advisor', ['scripts/project-advisor.mjs']));
    steps.push(runStep('Emotion', ['scripts/emotion-ai.mjs'], { optional: true }));
    steps.push(runStep('Living Brand', ['scripts/living-brand.mjs'], { optional: true }));
    steps.push(runStep('Product Director', ['scripts/product-director.mjs'], { optional: true }));
} else {
    console.log('\n⏭ dry-run — używam istniejących raportów docs/*');
    steps.push({ name: 'dry-run', ok: true, ms: 0, status: 0 });
}

const health = loadJson('docs/health/latest.json');
const guardian = loadJson('tools/ai-guardian/reports/latest.json');
const improve = loadJson('docs/improvements/latest.json');
const virtual = loadJson('docs/virtual-user/latest.json');
const advisor = loadJson('docs/advisor/latest.json');
const daily = loadJson('docs/daily/latest.json');

const scores = snapshotScores({ health, guardian, improve, virtual, advisor, daily });
const { day: baselineDay, report: prevReport } = findPreviousReport(today);
const prevScores = prevReport?.scores || null;
const diffRaw = compareScores(scores, prevScores);
const diff = {
    ...diffRaw,
    baselineDay: baselineDay || prevReport?.day || null
};

const fixes = buildFixList({
    health,
    guardian,
    improve,
    virtual,
    daily,
    regressions: diff.regressions || []
});

const report = {
    id: `quality-loop-${today}`,
    title: 'AI Quality Loop',
    day: today,
    generatedAt: new Date().toISOString(),
    policy: { ...POLICY },
    steps,
    scores,
    learning: {
        note: 'Learning Engine: wyłącznie lokalnie (localStorage/IndexedDB). CLI nie wysyła danych. Preferencje wpływają na Improve/Advisor pośrednio po sesji przeglądarki.',
        browserOnly: true
    },
    advisorHeadline: advisor?.headline || null,
    modules: {
        guardian: Boolean(guardian),
        health: Boolean(health),
        virtualUser: Boolean(virtual),
        learning: 'browser-local',
        improvement: Boolean(improve),
        advisor: Boolean(advisor),
        daily: Boolean(daily)
    },
    diff,
    fixes,
    summary: {
        stepOk: steps.filter((s) => s.ok).length,
        stepFail: steps.filter((s) => !s.ok).length,
        regressionCount: (diff.regressions || []).length,
        improvementCount: (diff.improvements || []).length,
        fixesPending: fixes.length,
        dailyAppScore: scores.dailyAppScore,
        healthOverall: scores.healthOverall
    }
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, 'latest.json'), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT_DIR, 'latest.md'), toMarkdown(report), 'utf8');
writeFileSync(join(OUT_DIR, `${today}.json`), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT_DIR, `${today}.md`), toMarkdown(report), 'utf8');
writeFileSync(
    join(OUT_DIR, 'fixes-pending.json'),
    JSON.stringify({
        day: today,
        generatedAt: report.generatedAt,
        policy: { autoApply: false, requiresHumanAcceptance: true },
        fixes
    }, null, 2),
    'utf8'
);

// szablon approvals (nie nadpisuj jeśli istnieje z decyzjami)
const approvalsPath = join(OUT_DIR, 'approvals.json');
if (!existsSync(approvalsPath)) {
    writeFileSync(
        approvalsPath,
        JSON.stringify({
            note: 'Wpisz zatwierdzone ID z fixes-pending.json. Pętla NIGDY nie aplikuje ich sama.',
            approvedIds: [],
            rejectedIds: [],
            updatedAt: null
        }, null, 2),
        'utf8'
    );
}

console.log('\n══════════════════════════════════════════');
console.log(` Raport: ${relative(ROOT, join(OUT_DIR, 'latest.md'))}`);
console.log(` Regresje: ${report.summary.regressionCount}`);
console.log(` Poprawki pending: ${report.summary.fixesPending}`);
console.log(' Policy: autoApply=false · zatwierdź ręcznie');
console.log('══════════════════════════════════════════');

// ETAP 28D – po diagnostyce: Daily Developer Mail (tylko właściciel)
if (!dryRun && !argv.includes('--skip-mail')) {
    const mailStep = runStep(
        'Daily Developer Mail',
        ['scripts/daily-developer-report.mjs', '--send'],
        { optional: true }
    );
    steps.push(mailStep);
    report.steps = steps;
    report.modules.dailyMail = mailStep.ok;
    writeFileSync(join(OUT_DIR, 'latest.json'), JSON.stringify(report, null, 2), 'utf8');
    writeFileSync(join(OUT_DIR, `${today}.json`), JSON.stringify(report, null, 2), 'utf8');
    console.log(
        mailStep.ok
            ? '\n✔ Daily Developer Mail zakończony (draft + opcjonalna wysyłka SMTP)'
            : '\n⚠ Daily Developer Mail: zob. docs/daily/DEVELOPER-MAIL.md'
    );
} else if (argv.includes('--skip-mail')) {
    console.log('\n⏭ Daily Developer Mail skipped (--skip-mail)');
}

// ETAP 29A – AI Dream Mode (refleksja PO, bez zmian kodu)
if (!dryRun && !argv.includes('--skip-dream')) {
    const dreamStep = runStep(
        'AI Dream Mode',
        ['scripts/dream-mode.mjs'],
        { optional: true }
    );
    steps.push(dreamStep);
    report.steps = steps;
    report.modules.dreamMode = dreamStep.ok;
    writeFileSync(join(OUT_DIR, 'latest.json'), JSON.stringify(report, null, 2), 'utf8');
    writeFileSync(join(OUT_DIR, `${today}.json`), JSON.stringify(report, null, 2), 'utf8');
    console.log(
        dreamStep.ok
            ? '\n✔ AI Dream Mode → docs/dream/latest.md'
            : '\n⚠ AI Dream Mode: npm run dream'
    );
} else if (argv.includes('--skip-dream')) {
    console.log('\n⏭ AI Dream Mode skipped (--skip-dream)');
}

// ETAP 29B – Regional Intelligence (gospodarz regionu)
if (!dryRun && !argv.includes('--skip-regional')) {
    const regionalStep = runStep(
        'Regional Intelligence',
        ['scripts/regional-intelligence.mjs'],
        { optional: true }
    );
    steps.push(regionalStep);
    report.steps = steps;
    report.modules.regionalIntelligence = regionalStep.ok;
    writeFileSync(join(OUT_DIR, 'latest.json'), JSON.stringify(report, null, 2), 'utf8');
    writeFileSync(join(OUT_DIR, `${today}.json`), JSON.stringify(report, null, 2), 'utf8');
    console.log(
        regionalStep.ok
            ? '\n✔ Regional Intelligence → docs/regional-intelligence/latest.md'
            : '\n⚠ Regional Intelligence: npm run regional'
    );
} else if (argv.includes('--skip-regional')) {
    console.log('\n⏭ Regional Intelligence skipped (--skip-regional)');
}

// ETAP 29C – Brand Protection AI (tylko raport, bez poprawek)
if (!dryRun && !argv.includes('--skip-brand-protection')) {
    const bpStep = runStep(
        'Brand Protection AI',
        ['scripts/brand-protection.mjs'],
        { optional: true }
    );
    steps.push(bpStep);
    report.steps = steps;
    report.modules.brandProtection = bpStep.ok;
    writeFileSync(join(OUT_DIR, 'latest.json'), JSON.stringify(report, null, 2), 'utf8');
    writeFileSync(join(OUT_DIR, `${today}.json`), JSON.stringify(report, null, 2), 'utf8');
    console.log(
        bpStep.ok
            ? '\n✔ Brand Protection AI → docs/brand-protection/latest.md'
            : '\n⚠ Brand Protection AI: npm run brand-protection'
    );
} else if (argv.includes('--skip-brand-protection')) {
    console.log('\n⏭ Brand Protection AI skipped (--skip-brand-protection)');
}

// ETAP 29D – Product Brain (max 3, czekaj na akceptację)
if (!dryRun && !argv.includes('--skip-brain')) {
    const brainStep = runStep(
        'Product Brain',
        ['scripts/product-brain.mjs'],
        { optional: true }
    );
    steps.push(brainStep);
    report.steps = steps;
    report.modules.productBrain = brainStep.ok;
    writeFileSync(join(OUT_DIR, 'latest.json'), JSON.stringify(report, null, 2), 'utf8');
    writeFileSync(join(OUT_DIR, `${today}.json`), JSON.stringify(report, null, 2), 'utf8');
    console.log(
        brainStep.ok
            ? '\n✔ Product Brain → docs/product-brain/latest.md'
            : '\n⚠ Product Brain: npm run brain'
    );
} else if (argv.includes('--skip-brain')) {
    console.log('\n⏭ Product Brain skipped (--skip-brain)');
}

// ETAP 29E – Self Reflection (samoocena, bez zmian kodu)
if (!dryRun && !argv.includes('--skip-reflect')) {
    const reflectStep = runStep(
        'Self Reflection',
        ['scripts/self-reflection.mjs'],
        { optional: true }
    );
    steps.push(reflectStep);
    report.steps = steps;
    report.modules.selfReflection = reflectStep.ok;
    writeFileSync(join(OUT_DIR, 'latest.json'), JSON.stringify(report, null, 2), 'utf8');
    writeFileSync(join(OUT_DIR, `${today}.json`), JSON.stringify(report, null, 2), 'utf8');
    console.log(
        reflectStep.ok
            ? '\n✔ Self Reflection → docs/self-reflection/latest.md'
            : '\n⚠ Self Reflection: npm run reflect'
    );
} else if (argv.includes('--skip-reflect')) {
    console.log('\n⏭ Self Reflection skipped (--skip-reflect)');
}

// ETAP 30 – Guardian of the Future (prognozy, bez zmian kodu)
if (!dryRun && !argv.includes('--skip-future')) {
    const futureStep = runStep(
        'Guardian of the Future',
        ['scripts/guardian-of-the-future.mjs'],
        { optional: true }
    );
    steps.push(futureStep);
    report.steps = steps;
    report.modules.guardianFuture = futureStep.ok;
    writeFileSync(join(OUT_DIR, 'latest.json'), JSON.stringify(report, null, 2), 'utf8');
    writeFileSync(join(OUT_DIR, `${today}.json`), JSON.stringify(report, null, 2), 'utf8');
    console.log(
        futureStep.ok
            ? '\n✔ Guardian of the Future → docs/guardian-future/latest.md'
            : '\n⚠ Guardian of the Future: npm run future'
    );
} else if (argv.includes('--skip-future')) {
    console.log('\n⏭ Guardian of the Future skipped (--skip-future)');
}
