/**
 * ETAP 18D – Virtual User (CLI raport)
 * Pełne scenariusze działają w przeglądarce (__RG_VIRTUAL__.run()).
 * CLI zapisuje raport do docs/virtual-user/ (import JSON lub szablon scenariuszy).
 *
 * Usage:
 *   npm run virtual-user
 *   npm run virtual-user -- --import=vu-report.json
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
const OUT_DIR = join(ROOT, 'docs', 'virtual-user');

const SCENARIOS = [
    'home-map-producer-back',
    'search',
    'gps',
    'filters',
    'popup',
    'modal',
    'favorites',
    'cart',
    'profile',
    'premium',
    'language',
    'dark-mode',
    'offline',
    'online',
    'restart-app'
];

const ISSUE_TYPES = [
    'flicker',
    'error',
    'fps',
    'memory-leak',
    'translation',
    'responsive',
    'touch',
    'ux'
];

function dayStamp() {
    return new Date().toISOString().slice(0, 10);
}

function loadImport(argv) {
    const arg = argv.find((a) => a.startsWith('--import='));
    if (!arg) return null;
    const p = arg.slice('--import='.length);
    const full = p.startsWith('/') || /^[A-Za-z]:/.test(p) ? p : join(ROOT, p);
    if (!existsSync(full)) {
        console.warn(`[virtual-user] brak pliku: ${full}`);
        return null;
    }
    return JSON.parse(readFileSync(full, 'utf8'));
}

function placeholderReport() {
    return {
        id: `virtual-cli-${dayStamp()}`,
        title: 'Virtual User – raport testów',
        generatedAt: new Date().toISOString(),
        reason: 'cli-placeholder',
        policy: {
            architectureUnchanged: true,
            autoFix: false,
            optIn: true,
            note: 'Uruchom scenariusze w przeglądarce: ?virtual=1 lub __RG_VIRTUAL__.run(), potem npm run virtual-user -- --import=dump.json'
        },
        summary: {
            passed: 0,
            failed: 0,
            scenarios: SCENARIOS.length,
            issueCount: 0,
            byType: Object.fromEntries(ISSUE_TYPES.map((t) => [t, 0])),
            avgFps: null,
            memoryLeak: false,
            score: null,
            status: 'awaiting-browser-run'
        },
        scenarios: SCENARIOS.map((name) => ({ name, status: 'pending' })),
        issues: [],
        hotspots: Object.fromEntries(ISSUE_TYPES.map((t) => [t, []])),
        howToRun: [
            '1. Otwórz aplikację na localhost',
            '2. Konsola: __RG_VIRTUAL__.run()  LUB  URL ?virtual=1',
            '3. Skopiuj JSON: __RG_VIRTUAL__.export()',
            '4. npm run virtual-user -- --import=dump.json'
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
        `Score: **${s.score ?? '—'}%**`,
        '',
        '## Podsumowanie',
        '',
        `- Scenariusze OK: ${s.passed ?? 0}`,
        `- Scenariusze FAIL: ${s.failed ?? 0}`,
        `- Issues: ${s.issueCount ?? 0}`,
        `- Śr. FPS: ${s.avgFps ?? '—'}`,
        `- Memory leak: ${s.memoryLeak ? 'TAK' : 'nie'}`,
        '',
        '## Typy problemów',
        ''
    ];
    for (const t of ISSUE_TYPES) {
        const n = s.byType?.[t] ?? (report.hotspots?.[t]?.length ?? 0);
        lines.push(`- **${t}**: ${n}`);
    }

    lines.push('', '## Scenariusze', '');
    for (const sc of report.scenarios || []) {
        const name = sc.name || sc;
        const st = sc.status || '—';
        lines.push(`- \`${name}\` — ${st}`);
    }

    lines.push('', '## Hotspoty / issues', '');
    const issues = report.issues || [];
    if (!issues.length) {
        lines.push('_Brak zgłoszonych issues (lub oczekiwanie na run w przeglądarce)._');
    } else {
        for (const i of issues.slice(0, 80)) {
            lines.push(`### [${i.severity || 'info'}] ${i.type} — ${i.title}`);
            lines.push('');
            lines.push(`- Scenariusz: \`${i.scenario || '—'}\``);
            if (i.where) lines.push(`- Gdzie: ${i.where}`);
            if (i.detail) lines.push(`- Detail: ${i.detail}`);
            lines.push('');
        }
    }

    lines.push('', '## Polityka', '', '- autoFix: false', '- bez zmiany architektury', '');
    if (report.howToRun) {
        lines.push('## Jak uruchomić pełny test', '');
        for (const h of report.howToRun) lines.push(`- ${h}`);
        lines.push('');
    }
    return lines.join('\n');
}

const imported = loadImport(process.argv.slice(2));
const report = imported && imported.issues
    ? { ...imported, reason: imported.reason || 'cli-import' }
    : placeholderReport();

mkdirSync(OUT_DIR, { recursive: true });
const jsonPath = join(OUT_DIR, 'latest.json');
const mdPath = join(OUT_DIR, 'latest.md');
const day = dayStamp();
writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');
writeFileSync(mdPath, toMarkdown(report), 'utf8');
writeFileSync(join(OUT_DIR, `${day}.json`), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT_DIR, `${day}.md`), toMarkdown(report), 'utf8');

console.log(`[Virtual User] ${report.title}`);
console.log(`Score: ${report.summary?.score ?? '—'} · issues: ${report.summary?.issueCount ?? 0}`);
console.log(`Wrote: ${relative(ROOT, mdPath)}`);
if (!imported) {
    console.log('Hint: pełny test w przeglądarce → __RG_VIRTUAL__.run()');
}
