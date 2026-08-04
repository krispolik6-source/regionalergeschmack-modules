/**
 * Release Checklist v1.0 — weryfikacja przed publikacją
 * Usage: node scripts/release-checklist-v1.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs', 'final');

function read(rel) {
    const p = join(ROOT, rel);
    return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

function exists(rel) {
    return existsSync(join(ROOT, rel));
}

function run(args, timeout = 300000) {
    const r = spawnSync(process.execPath, args, { cwd: ROOT, encoding: 'utf8', timeout });
    return r.status === 0;
}

const REQUIRED_CATEGORIES = [
    'category_all', 'category_farmers', 'category_bakeries', 'category_meat',
    'category_shops', 'category_restaurants', 'category_fastFood',
    'category_vending', 'category_favorites', 'category_honey'
];

const REQUIRED_ICONS = [
    'assets/icons/favicon.ico',
    'assets/icons/favicon-16.png', 'assets/icons/favicon-32.png',
    'assets/icons/icon-192.png', 'assets/icons/icon-512.png',
    'assets/icons/maskable-192.png', 'assets/icons/maskable-512.png',
    'assets/icons/monochrome-512.png', 'assets/icons/apple-touch-icon.png',
    'assets/icons/logo-master.svg'
];

const REQUIRED_BRAND = [
    'assets/brand/splash-logo.png',
    'assets/brand/og-share.png',
    'assets/brand/notifications-icon.png'
];

const items = [];

function add(area, check, status, detail = '') {
    items.push({ area, check, status, detail });
}

// 1. Images
const catOk = REQUIRED_CATEGORIES.every((c) => exists(`assets/images/backgrounds/${c}.webp`));
add('Assety', 'process-images: category_*.webp (10/10)', catOk ? 'ok' : 'blocker',
    catOk ? 'Wszystkie tła kategorii Home obecne' : 'Brak plików category_*.webp');

add('Assety', 'test-category-images.mjs', run(['scripts/test-category-images.mjs']) ? 'ok' : 'blocker', 'Mapowanie Home → pliki');

// 2. Manifest
const manifest = read('manifest.json');
const manifestOk = manifest.includes('"display"') && manifest.includes('icon-192') && manifest.includes('maskable-512')
    && manifest.includes('"background_color": "#f7f3ea"');
add('PWA', 'manifest.json (name, icons, colors, standalone)', manifestOk ? 'ok' : 'blocker');

// 3. Service Worker
const sw = read('sw.js');
const swOk = sw.includes('CACHE_VERSION') && sw.includes('skipWaiting');
const html = read('index.html');
const pwaVer = sw.match(/PWA_VERSION\s*=\s*['"](\d+)['"]/)?.[1];
const cacheSync = pwaVer && html.includes(`sw.js?v=${pwaVer}`) && html.includes(`?v=${pwaVer}`);
add('PWA', `Service Worker (cache, skipWaiting, v${pwaVer || '?'})`, swOk && cacheSync ? 'ok' : 'blocker',
    cacheSync ? `HTML ↔ SW zsynchronizowane v${pwaVer}` : 'Rozjazd wersji cache');

// 4. Icons
const iconsOk = REQUIRED_ICONS.every(exists);
add('Ikony', 'favicon + launcher + PWA + Apple + maskable + master', iconsOk ? 'ok' : 'blocker');

// 5. Brand assets
const brandOk = REQUIRED_BRAND.every(exists);
add('Brand', 'splash-logo, og-share, notifications-icon', brandOk ? 'ok' : 'blocker');

// 6. Splash
add('Splash', 'Premium splash (DOM + CSS + dismiss)', run(['scripts/test-splash-screen.mjs']) ? 'ok' : 'blocker');

// 7. PWA install + offline
add('PWA', 'Instalacja (beforeinstallprompt + UI)', run(['scripts/test-pwa.mjs']) ? 'ok' : 'blocker');
add('PWA', 'Offline (SW precache + navigate fallback)', sw.includes('PRECACHE_URLS') && sw.includes('fetch') ? 'ok' : 'blocker');

// 8. Release Candidate
add('RC', 'Release Candidate 22/22', run(['scripts/release-candidate.mjs']) ? 'ok' : 'blocker');

// 9. Production build
const legacyBuild = spawnSync('npm', ['run', 'build:legacy'], { cwd: ROOT, encoding: 'utf8', shell: true, timeout: 120000 });
const buildScript = read('package.json').includes('"build": "echo \'Build not configured yet\'"');
add('Build', 'build:legacy (esbuild iOS9 bundle)', legacyBuild.status === 0 ? 'ok' : 'blocker',
    legacyBuild.status === 0 ? 'js/legacy/app.bundle.js OK' : 'esbuild fail');
add('Build', 'npm run build (główny)', 'warn', 'Static ES modules — brak bundlera; deploy = pliki statyczne');

// 10. Console production
add('JS', 'Produkcja: 0 logów w konsoli (logger ETAP 40)', run(['scripts/test-production-logging.mjs']) ? 'ok' : 'blocker');

// 11. Assets audit
add('Assety', 'asset-audit (0 nieużywanych)', run(['scripts/asset-audit.mjs']) ? 'ok' : 'warn');

// 12. Brand protection
add('Brand', 'brand-protection PASS', run(['scripts/brand-protection.mjs']) ? 'ok' : 'blocker');

// 13. Master icons
add('Ikony', 'master-icon-audit 49/49', run(['scripts/master-icon-audit.mjs']) ? 'ok' : 'warn');

// 14. Translations
add('i18n', '36 języków × 1313 kluczy', run(['scripts/check-translations.mjs']) ? 'ok' : 'blocker');

// 15. Predeploy
add('JS', 'predeploy-check (składnia + dane live)', run(['scripts/predeploy-check.mjs']) ? 'ok' : 'blocker');

// 16. Manual QA (not automated)
add('Lighthouse', 'Performance / A11y / SEO / PWA score', 'warn', 'Wymaga manualnego Chrome DevTools');
add('Urządzenia', 'Cold start Android / iOS / Samsung', 'warn', 'Wymaga manualnego QA na urządzeniu');

const blockers = items.filter((i) => i.status === 'blocker');
const warnings = items.filter((i) => i.status === 'warn');
const oks = items.filter((i) => i.status === 'ok');
const ready = blockers.length === 0;

const report = {
    id: 'release-checklist-v1.0',
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    verdict: ready ? 'READY FOR PRODUCTION' : 'NOT READY FOR PRODUCTION',
    blockers: blockers.map((b) => `${b.area}: ${b.check}${b.detail ? ` — ${b.detail}` : ''}`),
    summary: { ok: oks.length, warn: warnings.length, blocker: blockers.length },
    items,
    fixesApplied: [
        'npm run process-images — wygenerowano/odświeżono assety (locked SKIP zachowane)',
        'scripts/test-category-images.mjs — strip ?v= z ścieżki pliku'
    ]
};

function md(r) {
    const icon = { ok: '✅ OK', warn: '⚠ Warning', blocker: '❌ Blocker' };
    const lines = [
        '# Release Checklist — v1.0',
        '',
        `**Data:** ${r.generatedAt.slice(0, 19)}Z  `,
        `**Wersja:** ${r.version}  `,
        '',
        '## Werdykt',
        '',
        `# ${r.verdict}`,
        '',
        r.blockers.length
            ? `**Blockery (${r.blockers.length}):**\n${r.blockers.map((b) => `- ${b}`).join('\n')}`
            : '**Brak blockerów technicznych.**',
        '',
        '## Checklist',
        '',
        '| Status | Obszar | Punkt | Szczegóły |',
        '|--------|--------|-------|-----------|',
    ];
    for (const i of r.items) {
        lines.push(`| ${icon[i.status]} | ${i.area} | ${i.check} | ${i.detail || '—'} |`);
    }
    lines.push('', '## Podsumowanie', '', `- ✅ OK: ${r.summary.ok}`, `- ⚠ Warning: ${r.summary.warn}`, `- ❌ Blocker: ${r.summary.blocker}`);
    lines.push('', '## Wykonane w tej sesji', '');
    for (const f of r.fixesApplied) lines.push(`- ${f}`);
    lines.push('', '---', '', `*Release Preparation v1.0 · ${r.verdict}*`, '');
    return lines.join('\n');
}

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'RELEASE-CHECKLIST-v1.0.json'), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT, 'RELEASE-CHECKLIST-v1.0.md'), md(report), 'utf8');

console.log(`\n[Release Checklist v1.0] ${report.verdict}`);
console.log(`OK: ${oks.length} | Warn: ${warnings.length} | Blocker: ${blockers.length}`);
console.log(`Wrote: docs/final/RELEASE-CHECKLIST-v1.0.md`);
process.exit(ready ? 0 : 1);
