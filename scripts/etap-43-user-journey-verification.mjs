/**
 * ETAP 43 · Zadanie 6 — pełny test użytkownika (ścieżka + persist)
 * Run: npm run check:user-journey
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { statusIcon, statusLabel } from './lib/cert-check.mjs';
import { buildGateReport, gateExitCode, runtimeFromManual } from './lib/cert-report.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_MD = join(ROOT, 'docs', 'certification', 'USER-JOURNEY-VERIFICATION.md');
const OUT_JSON = join(ROOT, 'docs', 'certification', 'USER-JOURNEY-VERIFICATION.json');

function read(rel) {
    const p = join(ROOT, rel);
    return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

let failed = 0;

function check(id, step, label, cond, detail = '', layer = 'static') {
    if (layer === 'runtime') {
        return { id, step, label, status: 'not_verified', detail, layer: 'runtime' };
    }
    const ok = Boolean(cond);
    if (!ok) failed += 1;
    return { id, step, label, status: ok ? 'pass' : 'fail', detail, layer: 'static' };
}

const app = read('js/app.js');
const nav = read('js/controllers/navigation.js');
const map = read('js/views/map.js');
const producerModal = read('js/views/producerModal.js');
const favorites = read('js/views/favorites.js');
const favoritesStore = read('js/core/favoritesStore.js');
const settings = read('js/core/settings.js');
const index = read('index.html');
const virtualUser = read('js/diagnostics/virtualUser.js');
const rus = read('js/diagnostics/realUserSimulation.js');
const i18n = read('js/core/i18n.js');

const steps = [];

steps.push(check(
    'J01-open-app',
    1,
    'Otwórz aplikację',
    app.includes('async function bootstrap') && app.includes('initNavigation')
        && index.includes('id="app"') && index.includes('rgSplashScreen'),
    'bootstrap · #app · splash screen'
));

steps.push(check(
    'J02-home',
    2,
    'Przejdź Home',
    nav.includes("navigateTo('home'") || nav.includes('navigateTo("home"')
        && index.includes('data-view="home"')
        && app.includes("from './views/home.js'") || read('js/views/home.js').includes('renderHome'),
    'bottom-nav home · navigateTo · renderHome'
));

steps.push(check(
    'J03-map',
    3,
    'Otwórz mapę',
    nav.includes("view === 'map'") && index.includes('data-view="map"')
        && (map.includes('export function renderMap') || map.includes('function renderMap')),
    'navigateTo(map) · renderMap'
));

steps.push(check(
    'J04-producer',
    4,
    'Otwórz producenta',
    producerModal.includes('export function openProducerModal')
        && producerModal.includes('export function closeProducerModal')
        && producerModal.includes('isProducerModalOpen'),
    'openProducerModal · modal fullscreen'
));

steps.push(check(
    'J05-favorites',
    5,
    'Dodaj do ulubionych',
    favorites.includes('export function addFavorite')
        && favoritesStore.includes('addFavoriteId')
        && favoritesStore.includes('regionalny_smak_favorites'),
    'addFavorite → favoritesStore · localStorage'
));

steps.push(check(
    'J06-language',
    6,
    'Zmień język',
    settings.includes('export function setAppLanguage')
        && settings.includes('regionalny_smak_settings')
        && settings.includes('EVENTS.LANGUAGE_CHANGED')
        && i18n.includes('export function setLanguage'),
    'setAppLanguage → saveSettings · i18n sync'
));

steps.push(check(
    'J07-back',
    7,
    'Wróć',
    producerModal.includes('closeProducerModal')
        && nav.includes('previousView')
        && (nav.includes("navigateTo('home'") || index.includes('data-view="home"')),
    'close modal · nav home · VIEW_CHANGED'
));

steps.push(check(
    'J08-close-app',
    8,
    'Zamknij aplikację',
    favoritesStore.includes('localStorage')
        && settings.includes('localStorage')
        && !app.includes('sessionStorage.clear'),
    'stan w localStorage (nie session) · brak clear przy unmount'
));

steps.push(check(
    'J09-reopen',
    9,
    'Otwórz ponownie',
    app.includes('syncFavoritesOnStartup')
        && app.includes('initShellSettings')
        && nav.includes('export function initNavigation'),
    'bootstrap: syncFavorites · settings · navigation'
));

steps.push(check(
    'J10-persist',
    10,
    'Stan zachowany po reopen',
    favoritesStore.includes('syncFavoritesOnStartup')
        && settings.includes('getSettings')
        && app.includes('syncFavoritesOnStartup'),
    'favorites + settings persist keys · sync at boot'
));

// ——— Mapowanie Virtual User / RUS ———
steps.push(check(
    'J11-virtual-user-scenario',
    'cross',
    'Virtual User: home-map-producer + favorites + language + restart',
    false,
    '__RG_VIRTUAL__.run() w przeglądarce — wiring w kodzie ≠ wykonanie',
    'runtime'
));

steps.push(check(
    'J12-rus-steps',
    'cross',
    'Real User Simulation: open-app → map → producer → favorites → language',
    false,
    '__RG_REAL_USERS__.run() · ?realusers=1 — wymaga przeglądarki',
    'runtime'
));

steps.push(check(
    'J13-persist-runtime',
    10,
    'Runtime: ulubione + język po reopen (przeglądarka)',
    false,
    'Persist Safari/PWA/private mode — poza Node localStorage mock',
    'runtime'
));

function runTest(cmd, args) {
    const r = spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', shell: true });
    return { ok: r.status === 0, exit: r.status ?? 1 };
}

console.log('[User Journey] ETAP 43 · Zadanie 6\n');

const automated = [];
for (const [label, cmd, args] of [
    ['favorites-store', 'node', ['scripts/test-favorites-store.mjs']],
    ['real-users', 'npm', ['run', 'check:real-users']]
]) {
    process.stdout.write(`→ ${label}… `);
    const r = runTest(cmd, args);
    automated.push({ label, ...r });
    console.log(r.ok ? 'PASS' : `FAIL (${r.exit})`);
}

for (const s of steps.filter((x) => x.step !== 'cross')) {
    process.stdout.write(`${statusIcon(s)} ${s.step}. ${s.label} · ${statusLabel(s)}\n`);
}
console.log('\n— Cross (Virtual User / RUS) —');
for (const s of steps.filter((x) => x.step === 'cross')) {
    process.stdout.write(`${statusIcon(s)} ${s.label} · ${statusLabel(s)}\n`);
}

const manualScript = [
    { n: 1, action: 'Otwórz aplikację (URL / PWA)', expect: 'Splash → Home, bez białego ekranu' },
    { n: 2, action: 'Klik 🏠 Home (dolny nav)', expect: 'Widok Home aktywny' },
    { n: 3, action: 'Klik 🗺️ Mapa', expect: 'Mapa Leaflet · markery' },
    { n: 4, action: 'Klik marker / producent → modal', expect: 'Pełnoekranowy modal producenta' },
    { n: 5, action: 'Dodaj do ulubionych (❤️ w modalu)', expect: 'Toast · badge ulubionych' },
    { n: 6, action: 'Zmień język (nagłówek DE/EN/PL…)', expect: 'UI przetłumaczone · LS settings' },
    { n: 7, action: 'Wróć (zamknij modal · nav Home)', expect: 'Home bez zawieszenia' },
    { n: 8, action: 'Zamknij app (force-quit PWA / zamknij kartę)', expect: '—' },
    { n: 9, action: 'Otwórz ponownie', expect: 'Bootstrap · ten sam język' },
    { n: 10, action: '☰ Ulubione — producent nadal na liście', expect: 'Persist favorites + language' }
];

const browserAuto = `
// W konsoli (localhost / ?dev=1 / po PIN):
await __RG_VIRTUAL__.run({ scenarios: ['home-map-producer-back','favorites','language'] });
// lub pełna symulacja:
await __RG_REAL_USERS__.runOne(1);

// Hard reload persist (po ręcznym dodaniu ulubionych + zmianie języka):
location.reload();
// Po reload: localStorage.regionalny_smak_favorites · regionalny_smak_settings
`.trim();

const gateItems = [
    ...steps,
    ...runtimeFromManual(
        manualScript.map((m) => ({ id: `M-journey-${m.n}`, title: m.action, pass: m.expect, device: 'browser/PWA' })),
        (m) => m.title
    )
];
const gate = buildGateReport({
    items: gateItems,
    automated,
    etap: '45-D-T6',
    extra: {
        generatedAt: new Date().toISOString(),
        scenario: manualScript.map((m) => m.action),
        steps,
        manual: manualScript,
        browserAutomation: browserAuto,
        storageKeys: {
            favorites: 'regionalny_smak_favorites',
            settings: 'regionalny_smak_settings'
        },
        autoApply: false
    }
});
const { verdict, staticVerdict: staticVerdictStr, runtimeVerdict: runtimeVerdictStr, manualRequired } = gate;
const report = gate;

mkdirSync(join(ROOT, 'docs', 'certification'), { recursive: true });
writeFileSync(OUT_JSON, JSON.stringify(report, null, 2), 'utf8');

const md = `# User Journey Verification — ETAP 43 · Zadanie 6

**Data:** ${report.generatedAt.slice(0, 10)}  
**ETAP:** 45-D · Runtime Truth  
**Gate:** **${verdict}**  
**STATIC:** **${staticVerdictStr}**  
**RUNTIME:** **${runtimeVerdictStr}**

> **STATIC** = wiring nawigacji, store, importy. **RUNTIME** = pełna ścieżka w przeglądarce/PWA.

## Warstwy

| Warstwa | Werdykt |
|---------|---------|
| **STATIC** | **${staticVerdictStr}** (${report.static.passed}/${report.static.total}) |
| **RUNTIME** | **${runtimeVerdictStr}** (${report.runtime.pending} pending) |
| **Gate** | **${verdict}** |

## Scenariusz — STATIC (kod)

| # | Krok | Warstwa | Status |
|---|------|---------|--------|
${steps.filter((s) => typeof s.step === 'number').map((s) => `| ${s.step} | ${s.label} | ${s.layer} | ${statusLabel(s)} |`).join('\n')}

## RUNTIME — Virtual User / persist / pełna ścieżka

| Check | Status |
|-------|--------|
${steps.filter((s) => s.step === 'cross').map((s) => `| ${s.label} | ${statusLabel(s)} |`).join('\n')}

**Klucze LS:** \`regionalny_smak_favorites\` · \`regionalny_smak_settings\`

## Bramki automatyczne

| Test | Status |
|------|--------|
${automated.map((a) => `| ${a.label} | ${a.ok ? '✅ PASS' : '❌ FAIL'} |`).join('\n')}

## RUNTIME — krok po kroku (urządzenie)

${manualScript.map((m) => `${m.n}. **${m.action}** → ${m.expect}`).join('\n')}

## Automatyzacja w przeglądarce

\`\`\`javascript
${browserAuto}
\`\`\`

## Pliki kluczowe

| Plik | Rola |
|------|------|
| \`js/app.js\` | bootstrap · syncFavoritesOnStartup |
| \`js/controllers/navigation.js\` | Home · Map · widoki |
| \`js/views/producerModal.js\` | Modal producenta |
| \`js/views/favorites.js\` | addFavorite UI |
| \`js/core/favoritesStore.js\` | Persist ulubionych |
| \`js/core/settings.js\` | Persist języka |
| \`js/diagnostics/virtualUser.js\` | __RG_VIRTUAL__.run() |
| \`js/diagnostics/realUserSimulation.js\` | __RG_REAL_USERS__.run() |

---
*ETAP 43-T6 · autoApply=false · uruchom: \`npm run check:user-journey\`*
`;

writeFileSync(OUT_MD, md, 'utf8');

console.log(`\n[User Journey] ${staticVerdictStr} · ${runtimeVerdictStr} · gate ${verdict}`);
console.log(`Wrote: docs/certification/USER-JOURNEY-VERIFICATION.md`);
process.exit(gateExitCode(verdict));
