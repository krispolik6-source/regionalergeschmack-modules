/**
 * ETAP 24 – Real User Simulation (CLI)
 * 50 person × journey. Heurystyka z katalogu + opcjonalny import z przeglądarki.
 *
 * Usage:
 *   npm run real-users
 *   npm run real-users -- --import=rus-dump.json
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
    PERSONAS,
    JOURNEY_STEPS,
    evaluatePersona
} from '../js/diagnostics/realUserPersonas.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'docs', 'real-users');

function dayStamp() {
    return new Date().toISOString().slice(0, 10);
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

function loadImport(argv) {
    const arg = argv.find((a) => a.startsWith('--import='));
    if (!arg) return null;
    const p = arg.slice('--import='.length);
    const full = p.startsWith('/') || /^[A-Za-z]:/.test(p) ? p : join(ROOT, p);
    if (!existsSync(full)) {
        console.warn(`[real-users] brak pliku: ${full}`);
        return null;
    }
    return JSON.parse(readFileSync(full, 'utf8'));
}

function collectSignals() {
    const health = loadJson('docs/health/latest.json');
    const virtual = loadJson('docs/virtual-user/latest.json');
    return {
        healthMobile: health?.scores?.mobile ?? 90,
        healthUx: health?.scores?.ux ?? 85,
        healthPerformance: health?.scores?.performance ?? 90,
        healthAccessibility: health?.scores?.accessibility ?? 80,
        healthPwa: health?.scores?.pwa ?? 90,
        healthTranslation: health?.scores?.translation ?? 95,
        virtualScore: virtual?.summary?.score ?? 80,
        touchIssues: virtual?.summary?.byType?.touch ?? 1,
        i18nEn: true,
        i18nPl: true,
        offlineSupport: true,
        darkMode: true,
        seasonThemeOptional: true
    };
}

function buildHeuristicReport(signals) {
    const results = PERSONAS.map((p) => evaluatePersona(p, signals));
    const scores = results.map((r) => r.score);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const pass = results.filter((r) => r.status === 'pass').length;
    const warn = results.filter((r) => r.status === 'warn').length;
    const fail = results.filter((r) => r.status === 'fail').length;
    const allIssues = results.flatMap((r) => r.issues || []);
    const byPersona = results
        .map((r) => ({
            code: r.persona.code,
            name: r.persona.name,
            tagline: r.persona.tagline,
            score: r.score,
            status: r.status,
            high: r.summary?.high ?? 0
        }))
        .sort((a, b) => a.score - b.score);

    return {
        id: `real-users-cli-${dayStamp()}`,
        title: 'Real User Simulation – 50 person',
        generatedAt: new Date().toISOString(),
        reason: 'cli-heuristic',
        policy: {
            architectureUnchanged: true,
            autoFix: false,
            optIn: true,
            requiresHumanAcceptance: true,
            note: 'Pełny live run: ?realusers=1 lub __RG_REAL_USERS__.run(), potem --import='
        },
        summary: {
            personas: results.length,
            journeySteps: JOURNEY_STEPS.length,
            avgScore: avg,
            pass,
            warn,
            fail,
            issueCount: allIssues.length,
            mode: 'heuristic'
        },
        signals,
        worst: byPersona.slice(0, 10),
        best: [...byPersona].sort((a, b) => b.score - a.score).slice(0, 5),
        personas: results,
        issues: allIssues.slice(0, 200),
        catalog: PERSONAS.map((p) => ({
            id: p.id,
            code: p.code,
            name: p.name,
            tagline: p.tagline,
            role: p.role,
            device: p.device.model,
            network: p.network,
            language: p.language
        })),
        catalogSize: PERSONAS.length,
        howToRun: [
            '1. localhost → __RG_REAL_USERS__.run() lub ?realusers=1',
            '2. __RG_REAL_USERS__.runOne(7) — jedna persona (np. daltonista)',
            '3. __RG_REAL_USERS__.export() → zapisz JSON',
            '4. npm run real-users -- --import=dump.json'
        ]
    };
}

function toMarkdown(report) {
    const s = report.summary || {};
    const lines = [
        `# ${report.title}`,
        '',
        `Wygenerowano: ${report.generatedAt}`,
        `Powód: ${report.reason || '—'}`,
        `Średni score: **${s.avgScore ?? '—'}%**`,
        '',
        '## Podsumowanie',
        '',
        `- Person: ${s.personas ?? 0} / katalog ${report.catalogSize ?? 50}`,
        `- Kroki journey: ${s.journeySteps ?? JOURNEY_STEPS.length}`,
        `- Pass / Warn / Fail: ${s.pass ?? 0} / ${s.warn ?? 0} / ${s.fail ?? 0}`,
        `- Issues: ${s.issueCount ?? 0}`,
        `- Mode: ${s.mode || '—'}`,
        '',
        '## Najsłabsze persony',
        ''
    ];
    for (const w of report.worst || []) {
        lines.push(`- **${w.code}** ${w.name} — ${w.score}% (${w.status}) · ${w.tagline}`);
    }
    lines.push('', '## Najlepsze persony', '');
    for (const b of report.best || []) {
        lines.push(`- **${b.code}** ${b.name} — ${b.score}%`);
    }

    lines.push('', '## Katalog (50)', '');
    for (const p of report.catalog || []) {
        lines.push(`- \`${p.code}\` **${p.name}** — ${p.tagline} · ${p.device} · ${p.network} · ${p.language}`);
    }

    lines.push('', '## Friction (top)', '');
    const issues = report.issues || [];
    if (!issues.length) lines.push('_Brak._');
    else {
        for (const i of issues.slice(0, 40)) {
            lines.push(`- [${i.severity}] ${i.persona || ''} · ${i.step || ''} — ${i.title}`);
        }
    }

    lines.push('', '## Polityka', '', '- autoFix: false', '- bez zmiany architektury', '- opt-in', '');
    if (report.howToRun) {
        lines.push('## Live w przeglądarce', '');
        for (const h of report.howToRun) lines.push(`- ${h}`);
        lines.push('');
    }
    return lines.join('\n');
}

const imported = loadImport(process.argv.slice(2));
const report = imported?.personas?.length
    ? { ...imported, reason: imported.reason || 'cli-import' }
    : buildHeuristicReport(collectSignals());

mkdirSync(OUT_DIR, { recursive: true });
const day = dayStamp();
writeFileSync(join(OUT_DIR, 'latest.json'), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT_DIR, 'latest.md'), toMarkdown(report), 'utf8');
writeFileSync(join(OUT_DIR, `${day}.json`), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT_DIR, `${day}.md`), toMarkdown(report), 'utf8');

console.log(`[Real Users] ${report.title}`);
console.log(
    `avg ${report.summary?.avgScore}% · pass ${report.summary?.pass} · warn ${report.summary?.warn} · fail ${report.summary?.fail}`
);
console.log(`Wrote: ${relative(ROOT, join(OUT_DIR, 'latest.md'))}`);
if (!imported) {
    console.log('Hint: live → __RG_REAL_USERS__.run()');
}
