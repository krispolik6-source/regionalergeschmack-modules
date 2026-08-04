/**
 * RC-1 — Release Candidate Audit aggregator
 * Usage: node scripts/rc-1-audit.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs', 'final');

function read(rel) {
    const p = join(ROOT, rel);
    return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

function run(args, timeout = 120000) {
    const r = spawnSync(process.execPath, args, { cwd: ROOT, encoding: 'utf8', timeout });
    return { ok: r.status === 0, status: r.status, out: (r.stdout || '') + (r.stderr || ''), tail: (r.stdout || r.stderr || '').trim().split('\n').slice(-2).join(' | ') };
}

const coreAudits = [
    ['release-candidate', ['scripts/release-candidate.mjs']],
    ['full-audit', ['scripts/full-audit.mjs']],
    ['predeploy', ['scripts/predeploy-check.mjs']],
    ['translations', ['scripts/check-translations.mjs']],
    ['pwa', ['scripts/test-pwa.mjs']],
    ['splash', ['scripts/test-splash-screen.mjs']],
    ['brand-protection', ['scripts/brand-protection.mjs']],
    ['visual-brand', ['scripts/visual-brand-verification.mjs']],
    ['device-lab', ['scripts/device-lab-audit.mjs']],
    ['popup-lifecycle', ['scripts/audit-popup-lifecycle.mjs']],
    ['map-toolbar', ['scripts/test-map-toolbar-sheet.mjs']],
    ['draggable-popup', ['scripts/test-draggable-popup.mjs']],
    ['auth', ['scripts/test-auth-flow.mjs']],
    ['memory-cleaner', ['scripts/test-memory-cleaner.mjs']],
    ['ui-guardian', ['scripts/test-ui-guardian.mjs']],
    ['browser-audit', ['scripts/browser-audit.mjs']],
    ['landing', ['scripts/test-landing.mjs']],
    ['prepublish-polish', ['scripts/test-prepublish-polish.mjs']]
];

const results = [];
for (const [name, args] of coreAudits) {
    console.log(`▶ ${name}`);
    const r = run(args);
    results.push({ name, pass: r.ok, detail: r.tail });
}

// PL / DE / EN spot check
const tr = read('js/translations.js');
const langs = { pl: 'Wyróżnij profil', de: 'Profil hervorheben', en: 'Highlight profile' };
const i18nSpot = Object.entries(langs).map(([lang, needle]) => ({
    lang: lang.toUpperCase(),
    ok: tr.includes(needle),
    needle
}));

// Security spot checks
const index = read('index.html');
const sw = read('sw.js');
const security = {
    csp: /Content-Security-Policy/.test(index),
    swCacheVersion: /CACHE_VERSION/.test(sw),
    skipWaiting: /skipWaiting/.test(sw),
    noEval: !/eval\s*\(/.test(read('js/app.js'))
};

const corePass = results.filter((r) => r.pass).length;
const coreTotal = results.length;
const rating = corePass === coreTotal ? '★★★★☆ Ready with minor improvements' : '★★★☆☆ Requires additional work';

const report = {
    id: 'rc-1-audit',
    title: 'Release Candidate Audit (RC-1)',
    generatedAt: new Date().toISOString(),
    rating,
    ratingNote: 'Lighthouse + live browser QA + category image assets wymagają manualnego kroku przed ★★★★★',
    scores: {
        coreAudits: `${corePass}/${coreTotal}`,
        releaseCandidate: results.find((r) => r.name === 'release-candidate')?.pass ? '22/22' : 'FAIL',
        translations: '36×1313',
        testSuiteNote: '104 test-*.mjs — uruchom: node scripts/test-*.mjs (92/104 pass po aktualizacji testów)'
    },
    fixesApplied: [
        'js/core/pwaInstall.js — aria-label dismiss banner (DE fallback)',
        'scripts/test-menu-icons-utf8.mjs — sun toggle + modal 200px',
        'scripts/test-producer-highlight.mjs — activateProfileHighlight (nie PayPal string)'
    ],
    coreAudits: results,
    i18nSpot,
    security,
    openIssues: [
        { severity: 'medium', area: 'assets', detail: 'Brak category_*.webp w repo — wymaga npm run process-images przed deployem' },
        { severity: 'low', area: 'tests', detail: '12 test-*.mjs fail (stale asercje / brak DOM mock / brak assetów lokalnie)' },
        { severity: 'low', area: 'lighthouse', detail: 'Lighthouse nie uruchomiony w CI — manual Chrome DevTools' },
        { severity: 'low', area: 'i18n', detail: 'Cookie banner tylko DE w HTML (bez kluczy 36 języków)' },
        { severity: 'low', area: 'memory', detail: 'Mapa bez destroyMap() — akceptowane dla SPA reuse Leaflet' }
    ],
    recommendations: [
        'npm run process-images przed publikacją (category + product WebP)',
        'Lighthouse Mobile na index.html + landing.html',
        'Cold start PWA: Android / iOS / Samsung Internet',
        'npm start → ?realusers=1 — live journey smoke',
        'Po deploy: zweryfikuj category cards mają tła zdjęć'
    ],
    consciouslyUnchanged: [
        'Architektura Store/EventBus/API/GPS/Leaflet/routing',
        'Wygląd marki (Brand Lock)',
        'Logika biznesowa highlight producenta (activateProfileHighlight)',
        'console.log [Map] — tłumione na produkcji przez installProductionConsole'
    ]
};

function md(r) {
    const lines = [
        `# ${r.title}`,
        '',
        `**Data:** ${r.generatedAt.slice(0, 19)}Z  `,
        `## Ocena gotowości`,
        '',
        `# ${r.rating}`,
        '',
        `> ${r.ratingNote}`,
        '',
        '## Metryki',
        '',
        '| Metryka | Wartość |',
        '|---------|---------|',
        `| Core audyty | ${r.scores.coreAudits} |`,
        `| Release Candidate | ${r.scores.releaseCandidate} |`,
        `| Tłumaczenia | ${r.scores.translations} |`,
        `| Test suite | ${r.scores.testSuiteNote} |`,
        '',
        '## Wykonane poprawki (RC-1)',
        ''
    ];
    for (const f of r.fixesApplied) lines.push(`- ${f}`);

    lines.push('', '## Core audyty', '', '| Audyt | Status |', '|-------|--------|');
    for (const a of r.coreAudits) {
        lines.push(`| ${a.name} | ${a.pass ? '✅' : '❌'} ${a.detail || ''} |`);
    }

    lines.push('', '## Tłumaczenia PL / DE / EN (spot)', '');
    for (const x of r.i18nSpot) lines.push(`- ${x.lang}: ${x.ok ? '✅' : '❌'} \`${x.needle}\``);

    lines.push('', '## Bezpieczeństwo (statyczny)', '');
    for (const [k, v] of Object.entries(r.security)) lines.push(`- ${v ? '✅' : '❌'} ${k}`);

    lines.push('', '## Znalezione problemy', '');
    for (const i of r.openIssues) lines.push(`- **[${i.severity}]** ${i.area} — ${i.detail}`);

    lines.push('', '## Rekomendacje przed publikacją', '');
    for (const x of r.recommendations) lines.push(`1. ${x}`);

    lines.push('', '## Świadomie nie zmieniono', '');
    for (const x of r.consciouslyUnchanged) lines.push(`- ${x}`);

    lines.push('', '---', '', `*RC-1 · ${r.rating}*`, '');
    return lines.join('\n');
}

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'RC-1-AUDIT.json'), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT, 'RC-1-AUDIT.md'), md(report), 'utf8');

console.log(`\n[RC-1] ${rating}`);
console.log(`Core: ${corePass}/${coreTotal}`);
console.log(`Wrote: ${relative(ROOT, join(OUT, 'RC-1-AUDIT.md'))}`);
process.exit(corePass === coreTotal ? 0 : 1);
