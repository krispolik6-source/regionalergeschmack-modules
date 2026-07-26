/**
 * ETAP 19C – Weekly Premium Report (CLI)
 * AutoFix = false. Raz w tygodniu (plik tygodnia).
 *
 * Usage: npm run weekly-premium
 */
import {
    readFileSync,
    writeFileSync,
    mkdirSync,
    existsSync
} from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'docs', 'premium-weekly');

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

function buildTop20(improve, health, virtual, daily) {
    const items = [];
    for (const p of improve?.proposals || []) {
        items.push({
            source: 'improvement',
            priority: p.priority || 'medium',
            title: p.title,
            file: p.file,
            function: p.function,
            proposedFix: p.proposedFix,
            impact: p.impact,
            risk: p.risk
        });
    }
    for (const f of health?.findings || []) {
        items.push({
            source: 'health',
            priority: f.severity === 'high' ? 'high' : 'medium',
            title: f.title,
            file: f.area === 'css' ? 'css/style.css' : 'js/app.js',
            function: f.area || 'n/a',
            proposedFix: f.detail || 'Przejrzyj Health.',
            impact: 'medium',
            risk: 'low'
        });
    }
    for (const i of virtual?.issues || []) {
        items.push({
            source: 'virtual-user',
            priority: i.severity || 'medium',
            title: i.title,
            file: i.where || 'runtime',
            function: i.scenario || 'scenario',
            proposedFix: i.detail || 'Napraw scenariusz VU.',
            impact: 'medium',
            risk: 'medium'
        });
    }
    for (const c of daily?.failedChecks || []) {
        items.push({
            source: 'daily',
            priority: 'medium',
            title: `Checklist fail: ${c}`,
            file: 'docs/daily/latest.json',
            function: c,
            proposedFix: `Domknij checklistę „${c}”.`,
            impact: 'medium',
            risk: 'low'
        });
    }
    for (const f of daily?.sections?.aiGuardian?.topFindings || []) {
        items.push({
            source: 'guardian',
            priority: f.severity === 'critical' || f.severity === 'high' ? 'high' : 'medium',
            title: f.title,
            file: (f.files && f.files[0]) || 'n/a',
            function: 'guardian',
            proposedFix: f.proposal || f.proposedSolution || 'Review Guardian finding.',
            impact: 'medium',
            risk: 'medium'
        });
    }

    const rank = { critical: 0, high: 1, medium: 2, low: 3 };
    const seen = new Set();
    const out = [];
    for (const it of items.sort((a, b) => (rank[a.priority] ?? 4) - (rank[b.priority] ?? 4))) {
        const key = `${it.title}|${it.file}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ rank: out.length + 1, autoApply: false, ...it });
        if (out.length >= 20) break;
    }
    return out;
}

function guardianFindings(g) {
    return (g?.findings || []).slice(0, 15).map((f) => ({
        severity: f.severity,
        title: f.title,
        files: f.files,
        proposal: f.proposal
    }));
}

function fragileFiles(improve, guardian, top20) {
    const bag = {};
    const bump = (f, w) => { if (f) bag[f] = (bag[f] || 0) + w; };
    for (const p of improve?.proposals || []) {
        bump(p.file, p.priority === 'high' ? 3 : 1);
    }
    for (const f of guardian?.findings || []) {
        for (const file of f.files || []) bump(file, f.severity === 'high' ? 3 : 1);
    }
    for (const t of top20) bump(t.file, 1);
    return Object.entries(bag).sort((a, b) => b[1] - a[1]).slice(0, 10)
        .map(([file, weight]) => ({ file, weight }));
}

function buildReport() {
    const week = weekStamp();
    const health = loadJson('docs/health/latest.json');
    const improve = loadJson('docs/improvements/latest.json');
    const virtual = loadJson('docs/virtual-user/latest.json');
    const advisor = loadJson('docs/advisor/latest.json');
    const daily = loadJson('docs/daily/latest.json');
    const guardian = loadJson('tools/ai-guardian/reports/latest.json');
    const prev = loadJson(`docs/premium-weekly/${week}.json`) || loadJson('docs/premium-weekly/latest.json');

    const hScores = health?.scores || {};
    const guardianTop = daily?.sections?.aiGuardian?.topFindings?.length
        ? daily.sections.aiGuardian.topFindings
        : guardianFindings(guardian);
    const top20 = buildTop20(improve, health, virtual, {
        ...daily,
        sections: {
            ...(daily?.sections || {}),
            aiGuardian: { topFindings: guardianTop }
        }
    });
    const fragile = fragileFiles(improve, guardian, top20);

    const improved = [];
    const worsened = [];
    if (prev?.summary?.healthOverall != null && health?.overall != null) {
        const d = health.overall - prev.summary.healthOverall;
        if (d > 0) improved.push(`Health overall +${d} pkt vs poprzedni raport.`);
        if (d < 0) worsened.push(`Health overall ${d} pkt vs poprzedni raport.`);
    }
    if ((hScores.translation ?? 100) >= 95) improved.push('Tłumaczenia ≥95%.');
    if ((virtual?.summary?.score ?? 100) < 80) worsened.push(`Virtual User score ${virtual?.summary?.score}%`);
    if ((hScores.ux ?? 100) < 85) worsened.push(`UX ${hScores.ux}%`);
    if ((hScores.mobile ?? 100) < 85) worsened.push(`Mobile ${hScores.mobile}%`);
    if (!improved.length) improved.push('Brak silnego trendu + — utrzymano baseline (uruchamiaj Daily przez tydzień).');
    if (!worsened.length) worsened.push('Brak silnych regresji w dostępnych sygnałach.');

    const newProblems = [
        ...(health?.findings || []).slice(0, 5).map((f) => `[Health] ${f.title}`),
        ...(daily?.failedChecks || []).map((c) => `[Daily] ${c}`),
        ...(virtual?.issues || []).slice(0, 4).map((i) => `[VU] ${i.title}`)
    ];
    if (!newProblems.length) newProblems.push('Brak nowych sygnałów problemów.');

    const questions = [
        { id: 'improved', question: 'Co poprawiono?', answer: improved.map((x) => `• ${x}`).join('\n') },
        { id: 'worsened', question: 'Co pogorszyło się?', answer: worsened.map((x) => `• ${x}`).join('\n') },
        { id: 'newProblems', question: 'Jakie nowe problemy wykryto?', answer: newProblems.slice(0, 10).map((x) => `• ${x}`).join('\n') },
        { id: 'fragileFiles', question: 'Jakie pliki są najbardziej awaryjne?', answer: fragile.map((f) => `• \`${f.file}\` (waga ${f.weight})`).join('\n') || '• brak danych' },
        { id: 'ux', question: 'Jak poprawić UX?', answer: '• Etykiety a11y + CTA.\n• Home→Mapa→Modal bez tarcia.\n• Virtual User jako gate UX.' },
        { id: 'mobile', question: 'Jak poprawić Mobile?', answer: `• Health Mobile ${hScores.mobile ?? '—'}%.\n• Tap ≥44px, brak overflow.\n• VU na ~390px.` },
        { id: 'appearance', question: 'Jak poprawić wygląd?', answer: '• Spójne zdjęcia produktów.\n• Mniej konfliktów CSS.\n• Spokojniejszy chrome mapy.' },
        { id: 'performance', question: 'Jak poprawić wydajność?', answer: `• Performance ${hScores.performance ?? '—'}%.\n• Defer Home, dedupe fetch, czyść markery.\n• Memory ${hScores.memory ?? '—'}%.` },
        { id: 'growth', question: 'Jak zwiększyć liczbę użytkowników?', answer: '• PWA install + jasna wartość lokalna.\n• Time-to-first-success.\n• Landing/SEO + trial Premium z benefitami.' },
        { id: 'retention', question: 'Jak zwiększyć retencję?', answer: '• Magia powrotu / Taste Advisor.\n• Personalizacja Learning.\n• Wróć do trasy zakupowej.\n• Tygodniowy rytm Premium Report.' }
    ];

    // Wzbogać z Advisora jeśli jest
    if (advisor?.questions?.length) {
        const map = {
            appearance: /wygląd/,
            performance: /wydajność/,
            retention: /powrot/,
            ux: /irytuje|ekrany/
        };
        for (const q of questions) {
            const re = map[q.id];
            if (!re) continue;
            const hit = advisor.questions.find((aq) => re.test(aq.question || ''));
            if (hit?.answer) q.answer += `\n\n_Z Doradcy:_\n${hit.answer}`;
        }
    }

    return {
        id: `weekly-premium-${week}`,
        title: 'Weekly Premium Report',
        week,
        generatedAt: new Date().toISOString(),
        reason: 'cli-weekly',
        policy: { autoFix: false, autoModifyCode: false, cadence: 'weekly', advisoryOnly: true },
        summary: {
            healthOverall: health?.overall ?? null,
            appScore: daily?.appScore ?? null,
            vuScore: virtual?.summary?.score ?? null,
            improveCount: improve?.summary?.total ?? (improve?.proposals || []).length,
            guardianFindings: (guardian?.findings || []).length,
            advisorHeadline: advisor?.headline || null
        },
        questions,
        fragileFiles: fragile,
        top20
    };
}

function toMarkdown(report) {
    const lines = [
        `# ${report.title}`,
        '',
        `Tydzień: **${report.week}**`,
        `Wygenerowano: ${report.generatedAt}`,
        '',
        '## Polityka',
        '',
        '- **autoFix: false**',
        '- cadence: weekly',
        '',
        '## Podsumowanie',
        '',
        `- Health: ${report.summary.healthOverall ?? '—'}%`,
        `- Daily score: ${report.summary.appScore ?? '—'}%`,
        `- Virtual User: ${report.summary.vuScore ?? '—'}%`,
        `- Improve proposals: ${report.summary.improveCount ?? '—'}`,
        '',
        '## Pytania tygodnia',
        ''
    ];
    for (const q of report.questions || []) {
        lines.push(`### ${q.question}`, '', q.answer || '—', '');
    }
    lines.push('## Top 20 propozycji ulepszeń', '');
    for (const t of report.top20 || []) {
        lines.push(`### ${t.rank}. [${t.priority}] ${t.title}`);
        lines.push('');
        lines.push(`- Źródło: ${t.source}`);
        lines.push(`- Plik: \`${t.file}\``);
        lines.push(`- Funkcja: \`${t.function}\``);
        if (t.proposedFix) lines.push(`- Poprawka: ${t.proposedFix}`);
        lines.push(`- autoApply: false`);
        lines.push('');
    }
    return lines.join('\n');
}

const report = buildReport();
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, 'latest.json'), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT_DIR, 'latest.md'), toMarkdown(report), 'utf8');
writeFileSync(join(OUT_DIR, `${report.week}.json`), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT_DIR, `${report.week}.md`), toMarkdown(report), 'utf8');

console.log(`[Weekly Premium] ${report.week} · Top20=${report.top20.length}`);
console.log(`Wrote: ${relative(ROOT, join(OUT_DIR, 'latest.md'))}`);
console.log('Policy: autoFix=false');
