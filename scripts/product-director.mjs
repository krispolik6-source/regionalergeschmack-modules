/**
 * ETAP 27 – AI Product Director (CLI)
 * Codzienny przegląd produktu z perspektywy biznesowej.
 *
 * Usage:
 *   npm run director
 *   npm run director -- --import=director-dump.json
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
    buildProductDirectorBriefing,
    DIRECTOR_QUESTIONS,
    POLICY
} from '../js/diagnostics/productDirectorCore.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'docs', 'product-director');

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

function findArchiveBaseline(daysAgo) {
    if (!existsSync(OUT_DIR)) return null;
    const target = new Date();
    target.setUTCDate(target.getUTCDate() - daysAgo);
    const targetDay = target.toISOString().slice(0, 10);
    const days = readdirSync(OUT_DIR)
        .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
        .map((f) => f.replace(/\.json$/, ''))
        .filter((d) => d <= targetDay)
        .sort();
    if (!days.length) {
        // najstarszy dostępny
        const all = readdirSync(OUT_DIR)
            .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
            .map((f) => f.replace(/\.json$/, ''))
            .sort();
        if (!all.length) return null;
        const oldest = loadJson(join('docs', 'product-director', `${all[0]}.json`));
        if (!oldest) return null;
        return {
            day: oldest.day || all[0],
            productScore: oldest.productScore ?? oldest.summary?.productScore ?? null
        };
    }
    const day = days[days.length - 1];
    const rep = loadJson(join('docs', 'product-director', `${day}.json`));
    return {
        day,
        productScore: rep?.productScore ?? rep?.summary?.productScore ?? null
    };
}

function gatherFromDocs() {
    return {
        health: loadJson('docs/health/latest.json'),
        improve: loadJson('docs/improvements/latest.json'),
        virtual: loadJson('docs/virtual-user/latest.json'),
        advisor: loadJson('docs/advisor/latest.json'),
        emotion: loadJson('docs/emotion/latest.json'),
        livingBrand: loadJson('docs/living-brand/latest.json'),
        realUsers: loadJson('docs/real-users/latest.json'),
        daily: loadJson('docs/daily/latest.json'),
        qualityLoop: loadJson('docs/quality-loop/latest.json'),
        learning: null,
        monthBaseline: findArchiveBaseline(30),
        weekBaseline: findArchiveBaseline(7)
    };
}

function toMarkdown(b) {
    const lines = [
        `# ${b.title}`,
        '',
        `Dzień: **${b.day}**`,
        `Wygenerowano: ${b.generatedAt}`,
        `Product score: **${b.productScore ?? '—'}%**`,
        '',
        `## Headline`,
        '',
        b.headline || '—',
        '',
        '## Priorytety dnia',
        ''
    ];
    for (const p of b.priorities || []) lines.push(`- ${p}`);

    lines.push('', '## 8 pytań Product Directora', '');
    for (const q of b.qa || []) {
        lines.push(`### ${q.question}`);
        lines.push('');
        lines.push(q.answer || '—');
        lines.push('');
        lines.push(`_confidence: ${q.confidence || '—'} · sources: ${(q.sources || []).join(', ')}_`);
        lines.push('');
    }

    lines.push('## Snapshot', '');
    const s = b.summary || {};
    lines.push(`- Health: ${s.healthOverall ?? '—'}`);
    lines.push(`- Daily app: ${s.dailyAppScore ?? '—'}`);
    lines.push(`- Emotion return: ${s.emotionReturn ?? '—'}`);
    lines.push(`- Living Brand: ${s.livingBrand ?? '—'}`);
    lines.push(`- Virtual User: ${s.virtualScore ?? '—'}`);
    lines.push(`- Real Users avg: ${s.realUsersAvg ?? '—'}`);

    lines.push('', '## Polityka', '');
    lines.push('- autoFix: false');
    lines.push('- To przegląd biznesowy — nie patch kodu');
    lines.push(`- ${b.decisionNote || ''}`);
    lines.push('');
    lines.push('## Uruchomienie', '');
    lines.push('```bash');
    lines.push('npm run director');
    lines.push('```');
    lines.push('');
    lines.push('`__RG_DIRECTOR__.run()` · Panel Dev → Product Director');
    lines.push('');
    return lines.join('\n');
}

const imported = loadImport(process.argv.slice(2));
let briefing;

if (imported?.qa?.length >= 8) {
    briefing = { ...imported, reason: imported.reason || 'cli-import' };
} else {
    const input = gatherFromDocs();
    briefing = buildProductDirectorBriefing(input);
    briefing.id = `director-cli-${dayStamp()}`;
    briefing.reason = 'cli-daily';
    briefing.policy = { ...POLICY };
}

mkdirSync(OUT_DIR, { recursive: true });
const day = briefing.day || dayStamp();
writeFileSync(join(OUT_DIR, 'latest.json'), JSON.stringify(briefing, null, 2), 'utf8');
writeFileSync(join(OUT_DIR, 'latest.md'), toMarkdown(briefing), 'utf8');
writeFileSync(join(OUT_DIR, `${day}.json`), JSON.stringify(briefing, null, 2), 'utf8');
writeFileSync(join(OUT_DIR, `${day}.md`), toMarkdown(briefing), 'utf8');

console.log(`[Product Director] ${briefing.headline}`);
console.log(`productScore ${briefing.productScore ?? '—'}% · ${DIRECTOR_QUESTIONS.length} pytań`);
console.log(`Wrote: ${relative(ROOT, join(OUT_DIR, 'latest.md'))}`);
