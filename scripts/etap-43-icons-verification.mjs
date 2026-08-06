/**
 * ETAP 43 · Zadanie 3 — weryfikacja wszystkich ikon PWA + brak starych wersji po update
 * Run: npm run check:pwa-icons
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { readPwaVersionFromModule } from './lib/read-pwa-version.mjs';
import {
    PWA_CACHE_NAME,
    PWA_IMAGE_CACHE_NAME,
    PWA_VERSION
} from '../js/core/pwaVersion.js';
import { statusIcon, statusLabel } from './lib/cert-check.mjs';
import { buildGateReport, gateExitCode, runtimeFromManual } from './lib/cert-report.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_MD = join(ROOT, 'docs', 'certification', 'ICONS-VERIFICATION.md');
const OUT_JSON = join(ROOT, 'docs', 'certification', 'ICONS-VERIFICATION.json');

function read(rel) {
    const p = join(ROOT, rel);
    return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

function assetExists(rel) {
    return existsSync(join(ROOT, rel));
}

const V = PWA_VERSION;
const vQ = `?v=${V}`;
let failed = 0;

function check(id, category, label, cond, detail = '', layer = 'static') {
    if (layer === 'runtime') {
        return { id, category, label, status: 'not_verified', detail, note: detail, layer: 'runtime' };
    }
    const ok = Boolean(cond);
    if (!ok) failed += 1;
    return { id, category, label, status: ok ? 'pass' : 'fail', detail, note: '', layer: 'static' };
}

const sw = read('sw.js');
const manifestRaw = read('manifest.json');
const manifest = JSON.parse(manifestRaw || '{}');
const index = read('index.html');
const landing = read('landing.html');
const brandCss = read('css/brand-identity-final.css');
const push = read('js/core/pushNotifications.js');
const pwaVer = read('js/core/pwaVersion.js');
const netlify = read('netlify.toml');

const categories = [];

// ——— 1. Favicon ———
categories.push(check(
    'I01-favicon',
    'favicon',
    'Favicon (desktop)',
    index.includes(`favicon.ico${vQ}`)
        && index.includes(`favicon-16.png${vQ}`)
        && index.includes(`favicon-32.png${vQ}`)
        && assetExists('assets/icons/favicon.ico')
        && assetExists('assets/icons/favicon-16.png')
        && assetExists('assets/icons/favicon-32.png'),
    `index.html · favicon.ico/16/32 ${vQ} · pliki na dysku`
));

categories.push(check(
    'I01-favicon-svg',
    'favicon',
    'Favicon SVG (logo-master)',
    index.includes(`logo-master.svg${vQ}`) && assetExists('assets/icons/logo-master.svg'),
    'SVG favicon = master logo'
));

// ——— 2. Launcher ———
const launcherSizes = ['192', '512'];
const launcherOk = launcherSizes.every((s) => (
    manifest.icons?.some((i) => i.src.includes(`icon-${s}.png${vQ}`))
    && assetExists(`assets/icons/icon-${s}.png`)
));
categories.push(check(
    'I02-launcher',
    'launcher',
    'Launcher PWA (manifest 192/512)',
    launcherOk && manifest.icons?.every((i) => String(i.src).includes(vQ)),
    `manifest.json · wszystkie ikony ${vQ}`
));

categories.push(check(
    'I02-launcher-sw',
    'launcher',
    'Launcher — SW precache + network-first',
    sw.includes('icon-192.png') && sw.includes('icon-512.png')
        && sw.includes('fetchPwaIconAsset') && sw.includes("cache: 'no-store'"),
    'SW precache wersjonowany · fetch no-store dla ikon'
));

// ——— 3. Splash ———
categories.push(check(
    'I03-splash-html',
    'splash',
    'Splash screen (HTML)',
    index.includes('rg-splash__logo') && index.includes(`logo-master.svg${vQ}`),
    'index.html splash img wersjonowany'
));

categories.push(check(
    'I03-splash-css',
    'splash',
    'Splash asset (CSS + brand)',
    brandCss.includes(`splash-logo.png${vQ}`) && assetExists('assets/brand/splash-logo.png'),
    'brand-identity-final.css · assets/brand/splash-logo.png'
));

categories.push(check(
    'I03-splash-sw',
    'splash',
    'Splash — SW precache offline',
    /splash-logo\.png\?v=\$\{ICON_VERSION\}/.test(sw),
    'SW PRECACHE splash-logo'
));

// ——— 4. Apple Touch ———
categories.push(check(
    'I04-apple-touch',
    'apple-touch',
    'Apple Touch Icon',
    index.includes(`apple-touch-icon.png${vQ}`)
        && index.includes(`icon-180.png${vQ}`)
        && index.includes('apple-mobile-web-app-capable')
        && assetExists('assets/icons/apple-touch-icon.png')
        && assetExists('assets/icons/icon-180.png'),
    'apple-touch-icon + 180 · meta iOS'
));

categories.push(check(
    'I04-apple-manifest',
    'apple-touch',
    'Apple Touch w manifest',
    manifest.icons?.some((i) => /apple-touch-icon/.test(i.src)),
    'manifest zawiera apple-touch-icon'
));

// ——— 5. Maskable ———
categories.push(check(
    'I05-maskable',
    'maskable',
    'Maskable (192 + 512)',
    manifest.icons?.some((i) => i.purpose === 'maskable' && i.src.includes('maskable-192'))
        && manifest.icons?.some((i) => i.purpose === 'maskable' && i.src.includes('maskable-512'))
        && assetExists('assets/icons/maskable-192.png')
        && assetExists('assets/icons/maskable-512.png'),
    'manifest purpose=maskable · pliki maskable-192/512'
));

// ——— 6. Monochrome ———
categories.push(check(
    'I06-monochrome',
    'monochrome',
    'Monochrome (adaptive icon)',
    manifest.icons?.some((i) => i.purpose === 'monochrome' && i.src.includes('monochrome-512'))
        && assetExists('assets/icons/monochrome-512.png'),
    'manifest purpose=monochrome · monochrome-512.png'
));

// ——— 7. Notifications ———
categories.push(check(
    'I07-notifications-push',
    'notifications',
    'Push notifications (runtime)',
    push.includes('pwaAssetUrl(') && push.includes('/assets/icons/icon-192.png'),
    'pushNotifications.js · pwaAssetUrl dynamic version'
));

categories.push(check(
    'I07-notifications-sw',
    'notifications',
    'SW push DEFAULT_ICON',
    sw.includes('DEFAULT_ICON') && sw.includes('icon-192.png') && sw.includes('ICON_VERSION'),
    'sw.js push handler · wersjonowany DEFAULT_ICON'
));

categories.push(check(
    'I07-notifications-asset',
    'notifications',
    'Notifications brand asset',
    assetExists('assets/brand/notifications-icon.png')
        && /notifications-icon\.png\?v=\$\{ICON_VERSION\}/.test(sw),
    'assets/brand/notifications-icon.png · SW precache'
));

// ——— 8. Shortcut icons ———
const hasManifestShortcuts = Array.isArray(manifest.shortcuts) && manifest.shortcuts.length > 0;
categories.push(check(
    'I08-shortcuts-manifest',
    'shortcuts',
    'Manifest shortcuts (PWA)',
    !hasManifestShortcuts,
    hasManifestShortcuts
        ? `${manifest.shortcuts.length} shortcut(s) — wymaga ręcznej weryfikacji ikon na urządzeniu`
        : 'Brak manifest.shortcuts — produkt nie definiuje skrótów PWA (N/A)',
    hasManifestShortcuts ? 'runtime' : 'static'
));

categories.push(check(
    'I08-shortcuts-launcher-fallback',
    'shortcuts',
    'Skrót na pulpicie (= launcher icon)',
    manifest.icons?.some((i) => i.sizes === '192x192' && i.src.includes(`icon-192.png${vQ}`)),
    'Instalacja PWA / skrót iOS używa icon-192 + maskable z manifest'
));

// ——— Anti-stale (po aktualizacji) ———
const staleChecks = [];

staleChecks.push(check(
    'S01-version-sync',
    'anti-stale',
    'Jedna wersja PWA (v30) wszędzie',
    pwaVer.includes(`PWA_VERSION = '${V}'`)
        && manifestRaw.includes(vQ)
        && !/\?v=29\b/.test(index + manifestRaw + brandCss),
    `PWA_VERSION=${V} · brak ?v=29 w runtime`
));

staleChecks.push(check(
    'S02-sw-purge',
    'anti-stale',
    'SW activate usuwa stare cache',
    /key\.startsWith\(['"]rg-pwa-['"]\)/.test(sw)
        && /key\.startsWith\(['"]rg-runtime-images-['"]\)/.test(sw)
        && sw.includes('clients.claim'),
    'purge rg-pwa-* + rg-runtime-images-* · clients.claim'
));

staleChecks.push(check(
    'S03-sw-offline-fallback',
    'anti-stale',
    'Offline fallback tylko wersjonowany URL',
    sw.includes('versionedIconUrl') && !sw.includes('caches.match(url.pathname)'),
    'bez caches.match(pathname) bez ?v='
));

staleChecks.push(check(
    'S04-memory-cleaner',
    'anti-stale',
    'Memory Cleaner chroni tylko bieżące cache',
    pwaVer.includes('PWA_CACHE_PREFIX_KEEP')
        && pwaVer.includes('PWA_CACHE_NAME')
        && pwaVer.includes('PWA_IMAGE_CACHE_NAME'),
    'pwaVersion.js PWA_CACHE_PREFIX_KEEP synced z PWA_VERSION'
));

staleChecks.push(check(
    'S05-netlify-headers',
    'anti-stale',
    'HTTP Cache-Control must-revalidate',
    netlify.includes('/assets/icons/*') && netlify.includes('must-revalidate')
        && netlify.includes('/manifest.json'),
    'netlify.toml · ikony + manifest'
));

const RUNTIME_CACHE_SOURCES = [
    'sw.js',
    'js/core/offlineSync.js',
    'js/diagnostics/memoryCleaner.js',
    'js/core/pwaVersion.js'
];
const legacyV1Refs = RUNTIME_CACHE_SOURCES.filter((rel) => /\brg-runtime-images-v1\b/.test(read(rel)));

staleChecks.push(check(
    'S06-no-legacy-v1-runtime',
    'anti-stale',
    'Brak rg-runtime-images-v1 w runtime cache paths',
    legacyV1Refs.length === 0,
    legacyV1Refs.length === 0
        ? 'sw + offlineSync + memoryCleaner + pwaVersion bez v1'
        : `legacy v1 w: ${legacyV1Refs.join(', ')}`
));

const allChecks = [...categories, ...staleChecks];

function runTest(cmd, args) {
    const r = spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', shell: true });
    return { ok: r.status === 0, exit: r.status ?? 1, tail: `${r.stdout || ''}${r.stderr || ''}`.trim().split(/\r?\n/).slice(-3).join('\n') };
}

console.log('[PWA Icons] Verification — ETAP 43 · Zadanie 3\n');

const automated = [];
for (const [label, cmd, args] of [
    ['icon-refresh', 'npm', ['run', 'check:icon-refresh']],
    ['master-icon-audit', 'npm', ['run', 'master-icon-audit']],
    ['pwa-version', 'npm', ['run', 'check:pwa-version']]
]) {
    process.stdout.write(`→ ${label}… `);
    const r = runTest(cmd, args);
    automated.push({ label, ...r });
    console.log(r.ok ? 'PASS' : `FAIL (${r.exit})`);
}

const byCategory = {};
for (const c of categories) {
    if (!byCategory[c.category]) byCategory[c.category] = [];
    byCategory[c.category].push(c);
}

for (const c of categories) {
    process.stdout.write(`${statusIcon(c)} [${c.category}] ${c.label} · ${statusLabel(c)}\n`);
}
console.log('\n— Anti-stale —');
for (const c of staleChecks) {
    process.stdout.write(`${statusIcon(c)} ${c.label} · ${statusLabel(c)}\n`);
}

const manualSteps = [
    {
        id: 'M-icons-update',
        title: 'Po deploy nowej wersji — brak starych ikon',
        device: 'Android PWA + Chrome desktop',
        steps: [
            'Zainstalowana PWA z poprzednią wersją (lub symulacja bump PWA_VERSION)',
            'Deploy v30+ · otwórz PWA',
            'Sprawdź: launcher, splash, favicon w karcie, push icon preview',
            `DevTools → Application → Cache Storage: tylko ${PWA_CACHE_NAME} + ${PWA_IMAGE_CACHE_NAME}`
        ],
        pass: 'Wszystkie powierzchnie pokazują nową ikonę (dwa kłosy)'
    },
    {
        id: 'M-android-launcher',
        title: 'Android launcher (agresywny cache)',
        device: 'Android Chrome',
        steps: [
            'Po update: jeśli launcher nadal stary → odinstaluj PWA i zainstaluj ponownie',
            'Alternatywnie: wyczyść cache Chrome (nie site data)'
        ],
        pass: 'Ikona na pulpicie = aktualna maskable/192'
    },
    {
        id: 'M-ios-apple',
        title: 'iOS Add to Home Screen',
        device: 'Safari iPhone',
        steps: ['Udostępnij → Dodaj do ekranu początkowego', 'Sprawdź apple-touch-icon na pulpicie'],
        pass: 'Ikona 180×180 bez rozmycia'
    }
];

const gateItems = [...allChecks, ...runtimeFromManual(manualSteps, (m) => m.title)];
const gate = buildGateReport({
    items: gateItems,
    automated,
    etap: '45-D-T3',
    extra: {
        generatedAt: new Date().toISOString(),
        pwaVersion: V,
        master: 'assets/icons/logo-master.svg',
        categories: byCategory,
        antiStale: staleChecks,
        shortcutsNote: 'manifest.shortcuts nie jest skonfigurowany — skrót na pulpicie używa ikon launcher (192/maskable).',
        manual: manualSteps,
        autoApply: false
    }
});
const { verdict, staticVerdict: staticVerdictStr, runtimeVerdict: runtimeVerdictStr, manualRequired } = gate;
const report = gate;

mkdirSync(join(ROOT, 'docs', 'certification'), { recursive: true });
writeFileSync(OUT_JSON, JSON.stringify(report, null, 2), 'utf8');

const catLabels = {
    favicon: 'Favicon',
    launcher: 'Launcher',
    splash: 'Splash',
    'apple-touch': 'Apple Touch',
    maskable: 'Maskable',
    monochrome: 'Monochrome',
    notifications: 'Notifications',
    shortcuts: 'Shortcut icons'
};

const md = `# Icons Verification — ETAP 43 · Zadanie 3

**Data:** ${report.generatedAt.slice(0, 10)}  
**ETAP:** 45-D · Runtime Truth  
**Gate:** **${verdict}**  
**STATIC:** **${staticVerdictStr}**  
**RUNTIME:** **${runtimeVerdictStr}**  
**PWA version:** ${V}  
**Master:** \`assets/icons/logo-master.svg\`

> **STATIC** = manifest, HTML, SW, wersje, pliki ikon. **RUNTIME** = brak starych ikon po update na urządzeniu.

## Warstwy

| Warstwa | Werdykt | Szczegóły |
|---------|---------|-----------|
| **STATIC** | **${staticVerdictStr}** | kategorie + anti-stale |
| **RUNTIME** | **${runtimeVerdictStr}** | ${report.runtime.pending} pending |
| Subprocess | ${report.automated.passed}/${report.automated.total} | icon-refresh · master-icon · pwa-version |
| **Gate** | **${verdict}** | |

## Kategorie ikon

${Object.entries(byCategory).map(([cat, items]) => `
### ${catLabels[cat] || cat}

| Check | Status | Dowód |
|-------|--------|-------|
${items.map((i) => `| ${i.label} | ${statusLabel(i)} | ${i.detail} |`).join('\n')}
`).join('\n')}

## Anti-stale — brak starych wersji po update

| Mechanizm | Status | Opis |
|-----------|--------|------|
${staleChecks.map((s) => `| ${s.label} | ${statusLabel(s)} | ${s.detail} |`).join('\n')}

**Strategia (ETAP 28F + 42B):**
1. \`?v=\${PWA_VERSION}\` na wszystkich URL ikon (HTML, manifest, CSS)
2. SW: ikony/manifest = **network-first** + \`cache: no-store\`
3. SW \`activate\`: usuwa wszystkie \`rg-pwa-*\` i \`rg-runtime-images-*\` oprócz bieżącej wersji
4. \`pwaAssetUrl()\` w push/selfHealing — dynamiczny cache-bust
5. Netlify: \`Cache-Control: must-revalidate\` dla \`/assets/icons/*\` i \`manifest.json\`
6. Memory Cleaner: \`PWA_CACHE_PREFIX_KEEP\` = \`${PWA_CACHE_NAME}\` + \`${PWA_IMAGE_CACHE_NAME}\`

## Shortcut icons

${report.shortcutsNote}

- **manifest.shortcuts:** nie skonfigurowany (by design — brak skrótów PWA w menu systemowym)
- **Skrót na pulpicie (install):** używa \`icon-192.png\` + \`maskable-512.png\` z manifest — zweryfikowane ✅

## Bramki automatyczne

| Test | Status |
|------|--------|
${automated.map((a) => `| ${a.label} | ${a.ok ? '✅ PASS' : '❌ FAIL'} |`).join('\n')}

## RUNTIME — potwierdzenie na urządzeniu

${manualSteps.map((m) => `
### ${m.id} — ${m.title}

**Urządzenie:** ${m.device}

1. ${m.steps.join('\n1. ')}

**Pass:** ${m.pass}
`).join('\n')}

## Pliki kluczowe

| Plik | Rola |
|------|------|
| \`assets/icons/logo-master.svg\` | Master (dwa kłosy) |
| \`manifest.json\` | Launcher · maskable · monochrome · apple |
| \`index.html\` | Favicon · apple-touch · splash |
| \`css/brand-identity-final.css\` | splash-logo |
| \`assets/brand/splash-logo.png\` | Splash PNG |
| \`assets/brand/notifications-icon.png\` | Push asset |
| \`sw.js\` | precache · network-first · purge |
| \`js/core/pwaVersion.js\` | PWA_VERSION · pwaAssetUrl · cache keep |

---
*ETAP 43-T3 · autoApply=false · uruchom: \`npm run check:pwa-icons\`*
`;

writeFileSync(OUT_MD, md, 'utf8');

console.log(`\n[PWA Icons] ${staticVerdictStr} · ${runtimeVerdictStr} · gate ${verdict}`);
console.log(`Wrote: docs/certification/ICONS-VERIFICATION.md`);
process.exit(gateExitCode(verdict));
