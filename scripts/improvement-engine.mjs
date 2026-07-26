/**
 * ETAP 18C – Improvement Engine (CLI)
 * Analiza → docs/improvements/ · NIGDY nie zmienia kodu aplikacji.
 *
 * Usage:
 *   npm run improve
 *   npm run improve -- --import=runtime-improve.json
 */
import {
    readFileSync,
    writeFileSync,
    mkdirSync,
    existsSync
} from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'docs', 'improvements');

function dayStamp(d = new Date()) {
    return d.toISOString().slice(0, 10);
}

function clamp(n) {
    return Math.max(0, Math.min(100, Math.round(n)));
}

function loadJson(path) {
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, 'utf8'));
}

function loadRuntimeImport(argv) {
    const arg = argv.find((a) => a.startsWith('--import='));
    if (!arg) return null;
    const p = arg.slice('--import='.length);
    const full = p.startsWith('/') || /^[A-Za-z]:/.test(p) ? p : join(ROOT, p);
    return loadJson(full);
}

/** Minimalny builder zgodny z runtime (bez DOM) */
function buildProposalsFromStatic(health, learningImport) {
    const scores = health?.scores || {};
    const findings = health?.findings || [];
    const proposals = [];
    let n = 0;
    const add = (p) => {
        n += 1;
        proposals.push({ id: `IMP-${String(n).padStart(3, '0')}`, autoApply: false, ...p });
    };

    if ((scores.performance ?? 100) < 90) {
        add({
            title: 'Popraw wynik Performance z raportu Health',
            priority: (scores.performance ?? 100) < 75 ? 'high' : 'medium',
            impact: 'high',
            file: 'js/views/home.js',
            function: 'renderHome',
            risk: 'medium',
            proposedFix: 'Zredukuj pracę synchroniczną przy starcie; sprawdź long tasks i rozmiary assetów.',
            source: 'performance'
        });
    }
    if ((scores.memory ?? 100) < 90) {
        add({
            title: 'Popraw wynik Memory',
            priority: 'medium',
            impact: 'high',
            file: 'js/views/map.js',
            function: 'replaceMarkers',
            risk: 'medium',
            proposedFix: 'Audyt listenerów i referencji do dużych list producers.',
            source: 'memory'
        });
    }
    if ((scores.ux ?? 100) < 90 || (scores.mobile ?? 100) < 90) {
        add({
            title: 'Popraw UX / Mobile',
            priority: 'medium',
            impact: 'high',
            file: 'css/style.css',
            function: '@media mobile',
            risk: 'low',
            proposedFix: 'Tap targets ≥44px, brak overflow nagłówków na wąskich ekranach.',
            source: 'ux'
        });
    }
    if ((scores.accessibility ?? 100) < 95) {
        add({
            title: 'Popraw Accessibility',
            priority: 'medium',
            impact: 'medium',
            file: 'js/views/home.js',
            function: 'buildVenueCardHtml',
            risk: 'low',
            proposedFix: 'Uzupełnij aria-label dla kontrolek ikonicznych.',
            source: 'ux'
        });
    }
    if ((scores.translation ?? 100) < 100) {
        add({
            title: 'Uzupełnij tłumaczenia',
            priority: 'medium',
            impact: 'medium',
            file: 'js/translations.js',
            function: 'TRANSLATIONS',
            risk: 'low',
            proposedFix: 'npm run check:translations',
            source: 'errors'
        });
    }
    if ((scores.dataQuality ?? 100) < 95) {
        add({
            title: 'Popraw Data Quality',
            priority: 'medium',
            impact: 'medium',
            file: 'js/data/contentProducers.js',
            function: 'CONTENT_PRODUCERS',
            risk: 'low',
            proposedFix: 'Uzupełnij brakujące pola / zdjęcia (npm run check:assets).',
            source: 'errors'
        });
    }
    if ((scores.pwa ?? 100) < 95) {
        add({
            title: 'Popraw PWA / cache',
            priority: 'medium',
            impact: 'medium',
            file: 'sw.js',
            function: 'activate',
            risk: 'medium',
            proposedFix: 'Wyczyść stare cache names; zweryfikuj manifest.',
            source: 'performance'
        });
    }

    for (const f of (findings || []).slice(0, 10)) {
        add({
            title: f.title || 'Finding Health',
            priority: f.severity === 'high' ? 'high' : f.severity === 'low' ? 'low' : 'medium',
            impact: f.severity === 'high' ? 'high' : 'medium',
            file: 'docs/health/latest.json',
            function: `finding:${f.area || 'general'}`,
            risk: 'low',
            proposedFix: String(f.detail || 'Przejrzyj finding i popraw ręcznie.').slice(0, 200),
            source: 'health'
        });
    }

    const cssConflicts = health?.static?.css?.conflictCount || 0;
    if (cssConflicts > 10) {
        add({
            title: `Uporządkuj konflikty CSS (${cssConflicts})`,
            priority: 'medium',
            impact: 'medium',
            file: 'css/style.css',
            function: 'selectors',
            risk: 'medium',
            proposedFix: 'Scal zduplikowane reguły (background/z-index) wskazane w docs/health/latest.json → static.css.sample.',
            source: 'ux'
        });
    }

    const unusedAssets = health?.static?.assets?.unusedCount || 0;
    if (unusedAssets > 20) {
        add({
            title: `Przejrzyj nieużywane assety (${unusedAssets})`,
            priority: 'low',
            impact: 'low',
            file: 'assets/',
            function: 'asset-audit',
            risk: 'low',
            proposedFix: 'npm run check:assets – usuń ręcznie po weryfikacji (nie automatycznie).',
            source: 'usage'
        });
    }

    if (learningImport?.proposals) {
        for (const p of learningImport.proposals) {
            proposals.push({ ...p, autoApply: false, id: p.id || `IMP-${String(++n).padStart(3, '0')}` });
        }
    } else if (learningImport?.affinity?.topCategories?.[0]) {
        const c = learningImport.affinity.topCategories[0];
        add({
            title: `Personalizacja pod kategorię „${c.id}”`,
            priority: 'medium',
            impact: 'high',
            file: 'js/views/home.js',
            function: 'getForYouProducers',
            risk: 'low',
            proposedFix: 'Wykorzystaj lokalny Learning Engine – bez wysyłki danych.',
            source: 'behavior'
        });
    }

    if (!proposals.length) {
        add({
            title: 'Utrzymuj codzienny cykl Health → Improve',
            priority: 'low',
            impact: 'low',
            file: 'package.json',
            function: 'npm run health && npm run improve',
            risk: 'low',
            proposedFix: 'Brak krytycznych sygnałów – kontynuuj monitoring.',
            source: 'usage'
        });
    }

    const rank = { critical: 0, high: 1, medium: 2, low: 3 };
    proposals.sort((a, b) => (rank[a.priority] ?? 4) - (rank[b.priority] ?? 4));
    return proposals;
}

function toMarkdown(report) {
    const lines = [
        `# ${report.title}`,
        '',
        `Dzień: **${report.day}**`,
        `Wygenerowano: ${report.generatedAt}`,
        `Propozycji: **${report.summary.total}**`,
        '',
        '## Polityka',
        '',
        '- **autoApply: false** — silnik nie zmienia kodu',
        '- autoCommit: false',
        '- wymaga akceptacji człowieka',
        '',
        '## Priorytety',
        '',
        `- critical: ${report.summary.byPriority.critical || 0}`,
        `- high: ${report.summary.byPriority.high || 0}`,
        `- medium: ${report.summary.byPriority.medium || 0}`,
        `- low: ${report.summary.byPriority.low || 0}`,
        '',
        '## Propozycje',
        ''
    ];

    for (const p of report.proposals) {
        lines.push(`### ${p.id} — ${p.title}`);
        lines.push('');
        lines.push(`| Pole | Wartość |`);
        lines.push(`| --- | --- |`);
        lines.push(`| Priorytet | ${p.priority} |`);
        lines.push(`| Wpływ | ${p.impact} |`);
        lines.push(`| Plik | \`${p.file}\` |`);
        lines.push(`| Funkcja | \`${p.function}\` |`);
        lines.push(`| Ryzyko | ${p.risk} |`);
        lines.push(`| Źródło | ${p.source} |`);
        lines.push(`| autoApply | false |`);
        lines.push('');
        lines.push(`**Proponowana poprawka:** ${p.proposedFix}`);
        lines.push('');
    }
    return lines.join('\n');
}

// Odśwież health jeśli brak latest
const healthPath = join(ROOT, 'docs/health/latest.json');
if (!existsSync(healthPath)) {
    console.log('[improve] brak docs/health/latest.json – uruchamiam npm run health…');
    spawnSync(process.execPath, ['scripts/application-health.mjs'], { cwd: ROOT, stdio: 'inherit' });
}

const health = loadJson(healthPath) || { scores: {}, findings: [], static: {} };
const runtimeImport = loadRuntimeImport(process.argv.slice(2));
const learning = runtimeImport?.learning || runtimeImport?.affinity
    ? runtimeImport
    : (runtimeImport?.proposals ? runtimeImport : null);

const proposals = runtimeImport?.proposals?.length
    ? runtimeImport.proposals.map((p, i) => ({
        autoApply: false,
        id: p.id || `IMP-${String(i + 1).padStart(3, '0')}`,
        ...p
    }))
    : buildProposalsFromStatic(health, learning);

const byPriority = { critical: 0, high: 0, medium: 0, low: 0 };
for (const p of proposals) byPriority[p.priority] = (byPriority[p.priority] || 0) + 1;

const report = {
    id: `improve-${dayStamp()}-cli`,
    title: 'Co można poprawić',
    generatedAt: new Date().toISOString(),
    day: dayStamp(),
    reason: runtimeImport ? 'cli+import' : 'cli-daily',
    policy: {
        autoModifyCode: false,
        autoCommit: false,
        autoPublish: false,
        autoApply: false,
        requiresHumanAcceptance: true
    },
    summary: {
        total: proposals.length,
        byPriority,
        sources: {
            healthOverall: health.overall ?? null,
            healthScores: health.scores || null
        }
    },
    proposals,
    healthRef: 'docs/health/latest.json'
};

mkdirSync(OUT_DIR, { recursive: true });
const jsonPath = join(OUT_DIR, 'latest.json');
const mdPath = join(OUT_DIR, 'latest.md');
const dayJson = join(OUT_DIR, `${report.day}.json`);
const dayMd = join(OUT_DIR, `${report.day}.md`);

writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');
writeFileSync(mdPath, toMarkdown(report), 'utf8');
writeFileSync(dayJson, JSON.stringify(report, null, 2), 'utf8');
writeFileSync(dayMd, toMarkdown(report), 'utf8');

console.log(`[Improvement Engine] ${report.title}`);
console.log(`Propozycji: ${report.summary.total}`, byPriority);
console.log(`Wrote: ${relative(ROOT, mdPath)}`);
console.log(`Wrote: ${relative(ROOT, dayMd)}`);
console.log('Policy: autoApply=false · kod NIE został zmieniony');
void clamp;
