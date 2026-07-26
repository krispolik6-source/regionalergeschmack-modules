/**
 * ETAP 25 – Emotion AI (CLI)
 * „Czy ta aplikacja wywołuje emocje? Czy chce się do niej wrócić?”
 *
 * Usage:
 *   npm run emotion
 *   npm run emotion -- --import=emotion-dump.json
 */
import {
    readFileSync,
    writeFileSync,
    mkdirSync,
    existsSync,
    readdirSync
} from 'node:fs';
import { join, dirname, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateEmotion, POLICY, EMOTION_DIMENSIONS } from '../js/diagnostics/emotionAiCore.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'docs', 'emotion');

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
    if (!existsSync(full)) return null;
    return JSON.parse(readFileSync(full, 'utf8'));
}

function readSafe(rel) {
    const full = join(ROOT, rel);
    if (!existsSync(full)) return '';
    return readFileSync(full, 'utf8');
}

function countFiles(dir, exts) {
    const full = join(ROOT, dir);
    if (!existsSync(full)) return 0;
    let n = 0;
    const walk = (d) => {
        for (const name of readdirSync(d, { withFileTypes: true })) {
            const p = join(d, name.name);
            if (name.isDirectory()) walk(p);
            else if (exts.includes(extname(name.name).toLowerCase())) n += 1;
        }
    };
    walk(full);
    return n;
}

function collectStaticSignals() {
    const brandCss = readSafe('css/brand-identity-final.css');
    const styleCss = readSafe('css/style.css').slice(0, 80000);
    const indexHtml = readSafe('index.html');
    const climateJs = readSafe('js/presentation/climateAtmosphere.js');
    const seasonJs = readSafe('js/presentation/seasonTheme.js');
    const homeJs = readSafe('js/views/home.js').slice(0, 40000);
    const i18nSample = readSafe('js/translations.js').slice(0, 30000);

    const cssAll = `${brandCss}\n${styleCss}`;
    const goldGreenCreamHits = [
        /--brand-green/,
        /--brand-gold/,
        /--brand-cream/,
        /--brand-wheat/,
        /--brand-honey/,
        /#2a3f28/,
        /#c9a227/,
        /#f5efe3/
    ].filter((re) => re.test(cssAll)).length;

    const coldBlueDominant = /#2563eb|#3b82f6|#4f46e5|purple-to-indigo/i.test(cssAll)
        && !/--brand-green/.test(brandCss);

    const imageCount = countFiles('assets', ['.jpg', '.jpeg', '.png', '.webp', '.avif'])
        + (indexHtml.match(/<img\b/gi) || []).length;

    const health = loadJson('docs/health/latest.json');
    const realUsers = loadJson('docs/real-users/latest.json');

    const hasGreeting = /greeting|willkommen|home-greeting/i.test(`${homeJs}${indexHtml}${i18nSample}`);
    const hasWarmCopy = /geschmack|region|lokal|bauer|hof|heimat|saison|ernte/i.test(
        `${homeJs}${i18nSample}${indexHtml}`
    );

    // Szacunki „ekranu” z HTML/JS (CLI nie ma DOM)
    const textProxy = (indexHtml.match(/data-i18n="[^"]+"/g) || []).length;
    const ctaProxy = (indexHtml.match(/<button\b/gi) || []).length
        + (indexHtml.match(/nav-item/g) || []).length;

    return {
        seasonThemeActive: /season-|climate-ready/.test(seasonJs) || /seasonTheme/.test(readSafe('js/app.js')),
        climateLayerPresent: /climateAtmosphere|climate-rays/.test(climateJs),
        climateReady: true,
        ambientAvailable: /ambientNature|startAmbientAudio/.test(climateJs),
        warmBrandPalette: /--brand-green/.test(brandCss) && /--brand-gold/.test(brandCss),
        coldBlueDominant,
        goldGreenCreamHits,
        imageCount: Math.min(imageCount, 80),
        imagesWithAlt: Math.round(Math.min(imageCount, 80) * 0.75),
        placeholderRatio: /placeholder/i.test(`${homeJs}${indexHtml}`) ? 0.12 : 0.05,
        visibleTextChars: 900 + textProxy * 18,
        headingCount: 4,
        paragraphDensity: Math.min(12, Math.round(textProxy / 40)),
        ctaCount: Math.min(ctaProxy, 12),
        competingBlocks: 6,
        interactiveCount: 25,
        hasGreeting,
        hasWarmCopy,
        hasEmptyStateCare: /empty-state|favorites-empty|cart-empty/i.test(
            `${readSafe('js/views/favorites.js')}${readSafe('js/views/cart.js')}${indexHtml}`
        ),
        softRadius: /border-radius:\s*([8-9]|[1-9]\d)px/.test(cssAll),
        darkModeHarsh: false,
        activeView: 'static-cli',
        season: null,
        learningReturnSignals: 0,
        realUserAvg: realUsers?.summary?.avgScore ?? null,
        healthUx: health?.scores?.ux ?? null
    };
}

function toMarkdown(report) {
    const s = report.scores || {};
    const lines = [
        `# ${report.title}`,
        '',
        `Wygenerowano: ${report.generatedAt}`,
        `Powód: ${report.reason || '—'}`,
        '',
        '## Pytanie',
        '',
        `**${report.question}**`,
        '',
        report.evokesEmotion ? '→ **Tak** — jest emocja.' : '→ **Za słabo** — emocja nierówna.',
        '',
        `**${report.returnQuestion}**`,
        '',
        `→ ${report.wantToReturn?.answer || '—'}`,
        '',
        `Score powrotu: **${report.wantToReturn?.score ?? '—'}%** (${report.wantToReturn?.level || ''})`,
        '',
        `> ${report.headline || ''}`,
        '',
        '## Wymiary emocji',
        ''
    ];

    for (const k of EMOTION_DIMENSIONS) {
        const dim = report.dimensions?.[k];
        lines.push(`### ${k} — ${s[k] ?? '—'}%`);
        lines.push('');
        for (const n of dim?.notes || []) lines.push(`- ${n}`);
        lines.push('');
    }

    lines.push('## Rekomendacje (bez auto-fix)', '');
    for (const r of report.recommendations || []) {
        lines.push(`- **${r.dimension}** (${r.score}%): ${r.tip}`);
    }

    lines.push('', '## Polityka', '');
    lines.push('- autoFix: false');
    lines.push('- To nie audit „czy działa” / „czy jest szybka”');
    lines.push('- Tylko klimat, kolory, zdjęcia, tekst, zmęczenie, przyjazność, chęć powrotu');
    lines.push('');
    lines.push('## Live', '');
    lines.push('- `__RG_EMOTION__.run()`');
    lines.push('- Panel Dev → Emotion AI');
    lines.push('');
    return lines.join('\n');
}

const imported = loadImport(process.argv.slice(2));
let report;

if (imported?.wantToReturn && imported?.scores) {
    report = { ...imported, reason: imported.reason || 'cli-import' };
} else {
    const signals = collectStaticSignals();
    const evaluation = evaluateEmotion(signals);
    report = {
        id: `emotion-cli-${dayStamp()}`,
        title: 'Emotion AI – czy aplikacja wywołuje emocje?',
        generatedAt: new Date().toISOString(),
        day: dayStamp(),
        reason: 'cli-static',
        policy: { ...POLICY },
        ...evaluation,
        signals,
        overallEmotion: Math.round(
            (evaluation.scores.climate
                + evaluation.scores.colors
                + evaluation.scores.photos
                + evaluation.scores.friendliness) / 4
        ),
        howToRun: [
            'localhost → __RG_EMOTION__.run()',
            'npm run emotion -- --import=dump.json'
        ]
    };
}

mkdirSync(OUT_DIR, { recursive: true });
const day = dayStamp();
writeFileSync(join(OUT_DIR, 'latest.json'), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT_DIR, 'latest.md'), toMarkdown(report), 'utf8');
writeFileSync(join(OUT_DIR, `${day}.json`), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT_DIR, `${day}.md`), toMarkdown(report), 'utf8');

console.log(`[Emotion AI] ${report.wantToReturn?.short || ''}`);
console.log(
    `return ${report.wantToReturn?.score}% · emotion ${report.overallEmotion}% · evokes=${report.evokesEmotion}`
);
console.log(`Wrote: ${relative(ROOT, join(OUT_DIR, 'latest.md'))}`);
