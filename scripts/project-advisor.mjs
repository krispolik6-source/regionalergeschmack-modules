/**
 * ETAP 18E – Doradca Projektu (CLI)
 * Codzienny briefing. NIE zmienia kodu.
 *
 * Usage:
 *   npm run advisor
 *   npm run advisor -- --import=advisor-dump.json
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
const OUT_DIR = join(ROOT, 'docs', 'advisor');

function dayStamp() {
    return new Date().toISOString().slice(0, 10);
}

function loadJson(relOrAbs) {
    const full = relOrAbs.startsWith('/') || /^[A-Za-z]:/.test(relOrAbs)
        ? relOrAbs
        : join(ROOT, relOrAbs);
    if (!existsSync(full)) return null;
    return JSON.parse(readFileSync(full, 'utf8'));
}

function loadImport(argv) {
    const arg = argv.find((a) => a.startsWith('--import='));
    if (!arg) return null;
    return loadJson(arg.slice('--import='.length));
}

/** Lekki builder CLI (bez DOM) – spójny z runtime */
function buildFromDocs() {
    const health = loadJson('docs/health/latest.json') || {};
    const improve = loadJson('docs/improvements/latest.json') || {};
    const virtual = loadJson('docs/virtual-user/latest.json') || {};
    const scores = health.scores || {};
    const proposals = (improve.proposals || []).slice(0, 5);
    const weak = Object.entries(scores)
        .sort((a, b) => (a[1] ?? 100) - (b[1] ?? 100))
        .slice(0, 3);

    const improveToday = proposals.length
        ? `Na dziś warto ruszyć:\n${proposals.slice(0, 3).map((p) => `• [${p.priority}] ${p.title} → \`${p.file}\``).join('\n')}`
        : weak.length
            ? `Najsłabsze obszary Health: ${weak.map(([k, v]) => `${k} ${v}%`).join(', ')}.`
            : 'Uruchom `npm run health && npm run improve` oraz Virtual User w przeglądarce.';

    const vuBy = virtual.summary?.byType || {};
    const frictions = [];
    if ((vuBy.error || 0) > 0) frictions.push('błędy JS na ścieżkach Virtual User');
    if ((vuBy.flicker || 0) > 0) frictions.push('miganie UI');
    if ((vuBy.touch || 0) > 0 || (scores.mobile ?? 100) < 85) frictions.push('cele dotykowe / mobile');
    if ((scores.ux ?? 100) < 80) frictions.push('niski UX w Health');
    if (!frictions.length) frictions.push('brak silnych sygnałów – pilnuj ścieżki Home→Mapa→Modal');

    const screens = [];
    if ((vuBy.fps || 0) > 0) screens.push('map (FPS)');
    if ((scores.mobile ?? 100) < 85) screens.push('home/mobile shell');
    const fails = (virtual.scenarios || []).filter((s) => s.status === 'fail').map((s) => s.name);
    for (const f of fails.slice(0, 3)) screens.push(f);
    if (!screens.length) screens.push('za mało danych runtime – uruchom __RG_VIRTUAL__.run()');

    const perf = [];
    if ((scores.performance ?? 100) < 85) perf.push('Defer ciężkich sekcji Home / mniej synchronicznego renderu.');
    if ((scores.memory ?? 100) < 85) perf.push('Czyść markery i listenery przy zmianie widoku.');
    if ((health.runtime?.duplicateFetches || 0) > 0 || (improve.proposals || []).some((p) => /request|fetch/i.test(p.title))) {
        perf.push('Dedupe równoległych requestów.');
    }
    if (!perf.length) perf.push('Wydajność stabilna – utrzymuj dzienny Health + Virtual User.');

    const look = [];
    if ((scores.ux ?? 100) < 85) look.push('CTA i rytm na mobile (44px, overflow).');
    if ((improve.proposals || []).some((p) => /css|wygląd|UX|Mobile/i.test(p.title))) {
        look.push('Zrealizuj propozycje UX/CSS z Improvement Engine (ręcznie).');
    }
    if (!look.length) look.push('Jeden ruch: spójniejsze zdjęcia produktów i spokojniejszy chrome mapy.');

    const retention = [
        'Wzmacniaj powrót: Taste Advisor / Magia powrotu po absencji.',
        'Personalizacja „Dla Ciebie” z Learning Engine.',
        'Jasna ścieżka „Wróć do trasy zakupowej”.'
    ];

    const next = [
        'Mobile polish gated Virtual User score ≥ 85%.',
        'Cotygodniowy lokalny „raport regionu” na Home.',
        'Szybka lista zakupów z trasą i ETA.',
        'Briefing Doradcy w CI → docs/advisor/ (bez auto-fix).'
    ];

    const qa = [
        { id: 'improveToday', question: 'Co dziś można ulepszyć?', answer: improveToday, confidence: 'high', sources: ['improvement', 'health'] },
        { id: 'userFriction', question: 'Co najbardziej irytuje użytkowników?', answer: `Najbardziej irytujące teraz:\n${frictions.map((f) => `• ${f}`).join('\n')}`, confidence: 'medium', sources: ['virtual-user', 'health'] },
        { id: 'weakestScreens', question: 'Które ekrany są najsłabsze?', answer: `Najsłabsze ekrany / powierzchnie:\n${screens.slice(0, 4).map((s) => `• ${s}`).join('\n')}`, confidence: 'medium', sources: ['virtual-user', 'health'] },
        { id: 'performance', question: 'Jak poprawić wydajność?', answer: `Jak poprawić wydajność:\n${perf.map((t) => `• ${t}`).join('\n')}`, confidence: 'medium', sources: ['health'] },
        { id: 'appearance', question: 'Jak poprawić wygląd?', answer: `Jak poprawić wygląd:\n${look.map((t) => `• ${t}`).join('\n')}`, confidence: 'medium', sources: ['health', 'improvement'] },
        { id: 'retention', question: 'Jak zwiększyć liczbę powrotów użytkowników?', answer: `Jak zwiększyć powroty:\n${retention.map((t) => `• ${t}`).join('\n')}`, confidence: 'medium', sources: ['learning', 'presentation'] },
        { id: 'nextVersion', question: 'Co warto dodać w następnej wersji?', answer: `Warto rozważyć w następnej wersji:\n${next.map((t) => `• ${t}`).join('\n')}`, confidence: 'medium', sources: ['advisor'] }
    ];

    return {
        id: `advisor-${dayStamp()}-cli`,
        title: 'Doradca Projektu – briefing dnia',
        generatedAt: new Date().toISOString(),
        day: dayStamp(),
        reason: 'cli-daily',
        policy: { autoFix: false, autoModifyCode: false, advisoryOnly: true },
        headline: proposals[0]?.title || weak[0]?.[0] || 'Utrzymaj rytm diagnostyczny',
        summary: {
            healthOverall: health.overall ?? null,
            improveCount: improve.summary?.total ?? proposals.length,
            virtualScore: virtual.summary?.score ?? null
        },
        questions: qa
    };
}

function toMarkdown(b) {
    const lines = [
        `# ${b.title}`,
        '',
        `Dzień: **${b.day}**`,
        `Wygenerowano: ${b.generatedAt}`,
        `Headline: **${b.headline}**`,
        '',
        '## Polityka',
        '',
        '- advisoryOnly: true',
        '- autoFix: false — Doradca **nie** naprawia kodu',
        '',
        '## Pytania dnia',
        ''
    ];
    for (const q of b.questions || []) {
        lines.push(`### ${q.question}`);
        lines.push('');
        lines.push(q.answer || '_—_');
        lines.push('');
        lines.push(`_confidence: ${q.confidence || '—'} · sources: ${(q.sources || []).join(', ')}_`);
        lines.push('');
    }
    return lines.join('\n');
}

const imported = loadImport(process.argv.slice(2));
const briefing = imported?.questions?.length
    ? { ...imported, reason: imported.reason || 'cli-import', policy: { autoFix: false, advisoryOnly: true, ...(imported.policy || {}) } }
    : buildFromDocs();

mkdirSync(OUT_DIR, { recursive: true });
const jsonPath = join(OUT_DIR, 'latest.json');
const mdPath = join(OUT_DIR, 'latest.md');
const day = briefing.day || dayStamp();

writeFileSync(jsonPath, JSON.stringify(briefing, null, 2), 'utf8');
writeFileSync(mdPath, toMarkdown(briefing), 'utf8');
writeFileSync(join(OUT_DIR, `${day}.json`), JSON.stringify(briefing, null, 2), 'utf8');
writeFileSync(join(OUT_DIR, `${day}.md`), toMarkdown(briefing), 'utf8');

console.log(`[Doradca Projektu] ${briefing.headline}`);
console.log(`Pytania: ${(briefing.questions || []).length}`);
console.log(`Wrote: ${relative(ROOT, mdPath)}`);
console.log('Policy: advisoryOnly · autoFix=false');
