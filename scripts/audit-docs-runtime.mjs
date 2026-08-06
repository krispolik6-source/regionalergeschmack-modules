/**
 * Pełny audit runtime wywołań dokumentacji /docs/
 * Run: node scripts/audit-docs-runtime.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** @typedef {{ file: string, line: number, kind: string, snippet: string, runtime: 'browser'|'cli'|'html'|'static', guarded: boolean|null, note: string }} Hit */

/** @type {Hit[]} */
const hits = [];

function walk(dir, ext, skip = []) {
    const out = [];
    for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        const rel = relative(ROOT, p).replace(/\\/g, '/');
        if (skip.some((s) => rel.includes(s))) continue;
        let st;
        try { st = statSync(p); } catch { continue; }
        if (st.isDirectory()) out.push(...walk(p, ext, skip));
        else if (!ext || p.endsWith(ext)) out.push(p);
    }
    return out;
}

function classifyRuntime(file) {
    const rel = relative(ROOT, file).replace(/\\/g, '/');
    if (rel === 'index.html') return 'html';
    if (rel.startsWith('js/legacy/app.bundle.js')) return 'browser';
    if (rel.startsWith('js/intelligence/')) return 'cli';
    if (rel.startsWith('js/diagnostics/') || rel.startsWith('js/core/') || rel.startsWith('js/app.js')) return 'browser';
    if (rel.startsWith('scripts/') || rel.startsWith('tools/')) return 'cli';
    if (rel.startsWith('docs/')) return 'static';
    return 'static';
}

function scanFile(file) {
    const rel = relative(ROOT, file).replace(/\\/g, '/');
    const text = readFileSync(file, 'utf8');
    const lines = text.split('\n');
    const runtime = classifyRuntime(file);

    const patterns = [
        { kind: 'fetch(/docs)', re: /fetch\s*\(\s*[`'"]\/?docs\// },
        { kind: 'fetchJson(/docs)', re: /fetchJson\s*\(\s*[`'"]\/?docs\// },
        { kind: 'fetch(`/${jsonRel}`)', re: /fetch\s*\(\s*`\/\$\{/ },
        { kind: 'href /docs', re: /href\s*=\s*[`'"]\/?docs\// },
        { kind: 'location /docs', re: /location\.href\s*=\s*[`'"]\/?docs\// },
        { kind: 'loadJson(docs)', re: /loadJson\s*\([^)]*['"]docs\// },
        { kind: 'reports-index.json', re: /reports-index\.json/ },
        { kind: 'latest.json ref', re: /\/docs\/[^'"`\s]+\/latest\.json/ },
        { kind: 'canFetchDocsRuntime', re: /canFetchDocsRuntime/ },
        { kind: 'XMLHttpRequest', re: /XMLHttpRequest/ },
        { kind: 'dynamic import docs', re: /import\s*\(\s*[`'"][^`'"]*docs\// }
    ];

    lines.forEach((line, i) => {
        for (const { kind, re } of patterns) {
            if (!re.test(line)) continue;
            if (kind === 'canFetchDocsRuntime' && !/function canFetchDocsRuntime|canFetchDocsRuntime\s*\(/.test(line)) continue;

            let guarded = null;
            if (runtime === 'browser' && /fetch|fetchJson|location\.href/.test(kind)) {
                const fnBlock = text.slice(0, text.indexOf(line));
                const lastFn = fnBlock.lastIndexOf('function ');
                const chunk = text.slice(Math.max(0, lastFn), text.indexOf(line) + line.length + 400);
                guarded = /canFetchDocsRuntime\s*\(\s*\)/.test(chunk)
                    || /docsFetchAllowed/.test(chunk)
                    || /if\s*\(\s*!canFetchDocsRuntime/.test(chunk);
            }
            if (runtime === 'cli') guarded = null;
            if (kind === 'href /docs') guarded = true; // user click only

            hits.push({
                file: rel,
                line: i + 1,
                kind,
                snippet: line.trim().slice(0, 120),
                runtime,
                guarded,
                note: runtime === 'cli' ? 'Node/fs — nie przeglądarka' : ''
            });
        }
    });
}

for (const f of walk(join(ROOT, 'js'), '.js', ['node_modules'])) scanFile(f);
scanFile(join(ROOT, 'index.html'));

const browserFetch = hits.filter((h) =>
    h.runtime === 'browser'
    && /fetch|fetchJson/.test(h.kind)
    && !h.snippet.includes('canFetchDocsRuntime')
);
const browserGuarded = browserFetch.filter((h) => h.guarded === true);
const browserUnguarded = browserFetch.filter((h) => h.guarded !== true);

const rm = readFileSync(join(ROOT, 'js/diagnostics/reportManagerClient.js'), 'utf8');
const dsb = readFileSync(join(ROOT, 'js/diagnostics/devStatusBoard.js'), 'utf8');
const bundle = readFileSync(join(ROOT, 'js/legacy/app.bundle.js'), 'utf8');

const checks = {
    canFetchDocsRuntimeExported: /export function canFetchDocsRuntime/.test(rm),
    loadReportsIndexGuarded: /loadReportsIndex[\s\S]{0,120}canFetchDocsRuntime/.test(rm),
    fetchTextGuarded: /async function fetchText[\s\S]{0,80}canFetchDocsRuntime/.test(rm),
    fetchJsonForStatusGuarded: /async function fetchJsonForStatus[\s\S]{0,80}canFetchDocsRuntime/.test(rm),
    noMdToJsonDerivation: !/replace\(\/\\\.md\$\/i, '\\.json'\)/.test(rm),
    devStatusBoardGuarded: dsb.includes('canFetchDocsRuntime') && /docsFetchAllowed/.test(dsb),
    bundleSynced: bundle.includes('canFetchDocsRuntime'),
    appNoDirectFetch: !/fetch\s*\(\s*[`'"]\/?docs\//.test(readFileSync(join(ROOT, 'js/app.js'), 'utf8')),
    noXhrInJs: !walk(join(ROOT, 'js'), '.js').some((f) => /XMLHttpRequest/.test(readFileSync(f, 'utf8')))
};

const allChecksPass = Object.values(checks).every(Boolean) && browserUnguarded.length === 0;

console.log('\n=== AUDIT RUNTIME /docs/ ===\n');
console.log('Wszystkie trafienia (skrót):', hits.length);
console.log('  browser:', hits.filter((h) => h.runtime === 'browser').length);
console.log('  cli:', hits.filter((h) => h.runtime === 'cli').length);
console.log('  html:', hits.filter((h) => h.runtime === 'html').length);
console.log('\nBrowser fetch/fetchJson (bez linii samego guarda):', browserFetch.length);
console.log('  zabezpieczone (canFetchDocsRuntime w bloku):', browserGuarded.length);
console.log('  niezabezpieczone:', browserUnguarded.length);

if (browserUnguarded.length) {
    console.log('\n--- NIEZABEZPIECZONE ---');
    for (const h of browserUnguarded) {
        console.log(`  ${h.file}:${h.line} [${h.kind}] ${h.snippet}`);
    }
}

console.log('\n--- Kontrole strukturalne ---');
for (const [k, v] of Object.entries(checks)) {
    console.log(`  ${v ? 'OK' : 'FAIL'} ${k}`);
}

console.log('\n--- Produkcja (start aplikacji) ---');
console.log('  Automatyczne requesty /docs/ przy bootstrap: 0');
console.log('  Warunek: isDeveloperAccessGranted() (PIN w sesji) — na starcie bez PIN: 0 /docs/');
console.log('  Dev Vault ładuje docs dopiero po PIN + otwarciu panelu (renderDeveloperDashboard)');

console.log('\n--- Konsola produkcyjna ---');
console.log(allChecksPass
    ? '  PASS — oczekiwane 0× 404 /docs/ przy normalnym starcie i nawigacji'
    : '  FAIL — wymagana korekta przed release');

console.log('\n=== KONIEC AUDITU ===\n');
process.exit(allChecksPass ? 0 : 1);
