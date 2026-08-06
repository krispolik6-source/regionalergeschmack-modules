/**
 * ETAP 43 · Zadanie 2 — weryfikacja cyklu życia PWA (10 scenariuszy)
 * Run: npm run check:pwa-lifecycle
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { readPwaVersionFromModule, readPwaVersionFromSw } from './lib/read-pwa-version.mjs';
import { PWA_CACHE_NAME } from '../js/core/pwaVersion.js';
import { statusIcon, statusLabel } from './lib/cert-check.mjs';
import { buildGateReport, gateExitCode, runtimeFromManual } from './lib/cert-report.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_MD = join(ROOT, 'docs', 'certification', 'PWA-LIFECYCLE-VERIFICATION.md');
const OUT_JSON = join(ROOT, 'docs', 'certification', 'PWA-LIFECYCLE-VERIFICATION.json');

function read(rel) {
    const p = join(ROOT, rel);
    return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

let failed = 0;

function check(id, label, cond, detail = '') {
    const ok = Boolean(cond);
    if (!ok) failed += 1;
    return { id, label, status: ok ? 'pass' : 'fail', detail, layer: 'static' };
}

const html = read('index.html');
const sw = read('sw.js');
const app = read('js/app.js');
const pwaInstall = read('js/core/pwaInstall.js');
const splash = read('js/core/splashScreen.js');
const offlineSync = read('js/core/offlineSync.js');
const map = read('js/views/map.js');
const settings = read('js/core/settings.js');
const memoryCleaner = read('js/diagnostics/memoryCleaner.js');
const pwaVer = readPwaVersionFromModule(ROOT);

const scenarios = [
    check('T01-first-launch', 'Pierwsze uruchomienie', (
        app.includes('async function bootstrap')
        && app.includes('dismissSplashScreen')
        && splash.includes('dismissSplashScreen')
        && html.includes('id="app"')
        && settings.includes('getSettings')
    ), 'bootstrap → splash dismiss · settings toleruje pusty LS'),

    check('T02-relaunch', 'Ponowne uruchomienie', (
        app.includes('let bootstrapped = false')
        && app.includes('if (bootstrapped) return')
        && settings.includes('regionalny_smak_settings')
        && read('js/core/favoritesStore.js').includes('syncFavoritesOnStartup')
    ), 'idempotent bootstrap · persist settings/fav/cart'),

    check('T03-pwa-update', 'Aktualizacja PWA', (
        sw.includes('skipWaiting')
        && sw.includes('clients.claim')
        && readPwaVersionFromSw(ROOT) === pwaVer
        && html.includes(`sw.js?v=${pwaVer}`)
        && sw.includes('PWA_CACHE_NAME')
    ), `PWA v${pwaVer} · skipWaiting · activate purge starych cache`),

    check('T04-pwa-install', 'Instalacja PWA', (
        pwaInstall.includes('beforeinstallprompt')
        && pwaInstall.includes('promptPwaInstall')
        && pwaInstall.includes('appinstalled')
        && html.includes('manifest.json')
        && html.includes('beforeinstallprompt')
    ), 'beforeinstallprompt · appinstalled · manifest'),

    check('T05-uninstall', 'Odinstalowanie', (
        settings.includes('getSettings')
        && settings.includes('try {')
        && read('js/core/favoritesStore.js').includes('rg_favorites')
        && read('js/core/favoritesStore.js').includes('try {')
        && read('js/views/cart.js').includes('regionalny_smak_cart')
        && read('js/views/cart.js').includes('try {')
        && !app.includes('localStorage.getItem(')
    ), 'getSettings try/catch · stores try/catch · app bez bezpośredniego LS'),

    check('T06-reinstall', 'Ponowna instalacja', (
        html.includes('serviceWorker.register')
        && html.includes(`sw.js?v=${pwaVer}`)
        && pwaInstall.includes('beforeinstallprompt')
        && read('js/controllers/navigation.js').includes('navigateTo')
    ), 'SW re-register · install prompt · navigate'),

    check('T07-cache-clear', 'Wyczyszczenie cache', (
        sw.includes('caches.keys')
        && sw.includes('caches.delete')
        && memoryCleaner.includes('deleteStaleCaches')
        && memoryCleaner.includes('caches.delete')
    ), 'SW activate purge · Memory Cleaner stale caches'),

    check('T08-site-data-clear', 'Wyczyszczenie danych strony', (
        memoryCleaner.includes('cleanSafeData')
        && memoryCleaner.includes('PROTECTED_EXACT')
        && memoryCleaner.includes('regionalny_smak_settings')
        && memoryCleaner.includes('rg_favorites')
        && memoryCleaner.includes('rg_cart')
    ), 'Memory Cleaner: safe vs protected · settings/fav/cart chronione'),

    check('T09-offline', 'Tryb offline', (
        sw.includes('caches.open')
        && sw.includes("caches.match('/index.html')")
        && map.includes('map-offline-banner')
        && map.includes("addEventListener('offline'")
        && offlineSync.includes('enqueueOfflineAction')
    ), 'SW precache · map banner · offline queue'),

    check('T10-online-return', 'Powrót online', (
        map.includes("addEventListener('online'")
        && offlineSync.includes("addEventListener('online'")
        && offlineSync.includes('flushOfflineQueue')
        && offlineSync.includes('PWA_IMAGE_CACHE_NAME')
        && map.includes('updateOfflineBanner')
    ), 'online event → banner hide · flush queue · cache v=PWA_VERSION')
];

function runTest(cmd, args) {
    const r = spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', shell: true });
    return { ok: r.status === 0, exit: r.status ?? 1, tail: `${r.stdout || ''}${r.stderr || ''}`.trim().split(/\r?\n/).slice(-4).join('\n') };
}

console.log('[PWA Lifecycle] Static verification + automated gates\n');

const automated = [];
for (const [label, cmd, args] of [
    ['test-pwa', 'npm', ['run', 'check:pwa']],
    ['pwa-version', 'npm', ['run', 'check:pwa-version']],
    ['icon-refresh', 'npm', ['run', 'check:icon-refresh']]
]) {
    process.stdout.write(`→ ${label}… `);
    const r = runTest(cmd, args);
    automated.push({ label, ...r });
    console.log(r.ok ? 'PASS' : `FAIL (${r.exit})`);
}

for (const s of scenarios) {
    process.stdout.write(`${s.status === 'pass' ? '✅' : '❌'} ${s.label}\n`);
}

const manualSteps = [
    {
        id: 'T01-first-launch',
        device: 'Telefon PWA lub przeglądarka',
        steps: ['Wyczyść dane strony (1×) LUB pierwsza wizyta', 'Otwórz prod/LAN', 'Splash znika · Home widoczny · cookie banner'],
        pass: 'Brak białego ekranu · nawigacja działa'
    },
    {
        id: 'T02-relaunch',
        device: 'PWA standalone',
        steps: ['Force-quit aplikację', 'Uruchom z ikony', 'Home/ustawienia/język jak przed zamknięciem'],
        pass: 'Persist bez pełnego onboarding'
    },
    {
        id: 'T03-pwa-update',
        device: 'PWA zainstalowana',
        steps: ['Deploy nowej wersji (v30+)', 'Otwórz PWA', 'SW skipWaiting · nowe ikony · brak starych cache'],
        pass: 'Update bez odinstalowania'
    },
    {
        id: 'T04-pwa-install',
        device: 'Chrome Android / Desktop',
        steps: ['Otwórz w Chrome', 'Baner/menu → Zainstaluj', 'Ikona na pulpicie · standalone'],
        pass: 'Instalacja native prompt'
    },
    {
        id: 'T05-uninstall',
        device: 'PWA',
        steps: ['Usuń ikonę / odinstaluj z systemu', 'Otwórz URL w przeglądarce', 'App boot bez crash'],
        pass: 'Czysty start jak nowy użytkownik (LS pusty)'
    },
    {
        id: 'T06-reinstall',
        device: 'PWA',
        steps: ['Po uninstall → zainstaluj ponownie', 'SW register · prompt install', 'Nawigacja Home/Map'],
        pass: 'Pełna ścieżka reinstall'
    },
    {
        id: 'T07-cache-clear',
        device: 'Chrome DevTools / Ustawienia',
        steps: ['Application → Clear cache (NIE site data)', 'Reload', 'App działa · SW re-cache'],
        pass: 'Cache wyczyszczony · dane użytkownika zostają'
    },
    {
        id: 'T08-site-data-clear',
        device: 'Chrome / Safari',
        steps: ['Wyczyść dane strony / localStorage', 'Reload', 'App boot · ustawienia domyślne · brak crash'],
        pass: 'Safe boot na pustym LS'
    },
    {
        id: 'T09-offline',
        device: 'Telefon PWA',
        steps: ['Tryb samolotowy ON', 'Otwórz PWA (już odwiedzoną)', 'Home/Map cache · banner offline'],
        pass: 'Aplikacja użyteczna offline (shell + mapa cache)'
    },
    {
        id: 'T10-online-return',
        device: 'Telefon PWA',
        steps: ['Tryb samolotowy OFF', 'Banner znika', 'Mapa/GPS odświeża · sync queue flush'],
        pass: 'Powrót online bez reload'
    }
];

const gateItems = [...scenarios, ...runtimeFromManual(manualSteps, (m) => scenarios.find((s) => s.id === m.id)?.label || m.id)];
const gate = buildGateReport({
    items: gateItems,
    automated,
    etap: '45-D-T2',
    extra: {
        generatedAt: new Date().toISOString(),
        pwaVersion: pwaVer,
        scenarios,
        manual: manualSteps,
        note: 'STATIC = kod/konfiguracja. RUNTIME = potwierdzenie T01–T10 na urządzeniu (DEVICE-TEST-PLAN S04).',
        autoApply: false
    }
});
const { verdict, staticVerdict: staticVerdictStr, runtimeVerdict: runtimeVerdictStr } = gate;
const report = gate;

mkdirSync(join(ROOT, 'docs', 'certification'), { recursive: true });
writeFileSync(OUT_JSON, JSON.stringify(report, null, 2), 'utf8');

const md = `# PWA Lifecycle — weryfikacja (ETAP 43 · Zadanie 2)

**Data:** ${report.generatedAt.slice(0, 10)}  
**ETAP:** 45-D · Runtime Truth  
**Gate:** **${verdict}**  
**STATIC:** **${staticVerdictStr}**  
**RUNTIME:** **${runtimeVerdictStr}**  
**PWA version:** ${pwaVer}

> **STATIC** = struktura, importy, wersje, SW wiring w kodzie. **RUNTIME** = potwierdzenie na urządzeniu.

## Warstwy

| Warstwa | Werdykt | Szczegóły |
|---------|---------|-----------|
| **STATIC** | **${staticVerdictStr}** | ${report.static.passed}/${report.static.total} scenariuszy kodu |
| **RUNTIME** | **${runtimeVerdictStr}** | ${report.runtime.pending} pending · ${report.runtime.passed} pass |
| Subprocess | ${report.automated.passed}/${report.automated.total} | npm gates |
| **Gate** | **${verdict}** | |

## Scenariusze — STATIC (kod / konfiguracja)

| # | Scenariusz | Status | Dowód |
|---|------------|--------|-------|
${scenarios.map((s, i) => `| ${i + 1} | ${s.label} | ${statusLabel(s)} | ${s.detail} |`).join('\n')}

## Bramki automatyczne

| Test | Status |
|------|--------|
${automated.map((a) => `| ${a.label} | ${a.ok ? '✅ PASS' : '❌ FAIL'} |`).join('\n')}

## RUNTIME — potwierdzenie na urządzeniu

${manualSteps.map((m) => `
### ${m.id} — ${scenarios.find((s) => s.id === m.id)?.label || m.id}

**Urządzenie:** ${m.device}

1. ${m.steps.join('\n1. ')}

**Pass:** ${m.pass}
`).join('\n')}

## Mapowanie RC (Release Candidate)

| RC step | Scenariusz |
|---------|------------|
| first-launch | T01 |
| next-day | T02 (persist) |
| update | T03 |
| install | T04 |
| uninstall | T05 |
| reinstall | T06 |
| offline | T09 |
| (online sync) | T10 |

## Pliki kluczowe

| Plik | Rola |
|------|------|
| \`index.html\` | SW register \`sw.js?v=${pwaVer}\` |
| \`sw.js\` | install · activate · fetch · skipWaiting |
| \`js/core/pwaInstall.js\` | beforeinstallprompt · appinstalled |
| \`js/core/splashScreen.js\` | pierwsze uruchomienie |
| \`js/core/offlineSync.js\` | online → flush queue |
| \`js/views/map.js\` | banner offline/online |
| \`js/diagnostics/memoryCleaner.js\` | cache + safe LS clean |

---
*ETAP 43-T2 · autoApply=false · uruchom: \`npm run check:pwa-lifecycle\`*
`;

writeFileSync(OUT_MD, md, 'utf8');

console.log(`\n[PWA Lifecycle] ${staticVerdictStr} · ${runtimeVerdictStr} · gate ${verdict}`);
console.log(`Wrote: docs/certification/PWA-LIFECYCLE-VERIFICATION.md`);
process.exit(gateExitCode(verdict));
