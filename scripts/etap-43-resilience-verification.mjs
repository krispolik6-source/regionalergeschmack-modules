/**
 * ETAP 43 · Zadanie 8 — test odporności (resilience)
 * Run: npm run check:resilience
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { PWA_CACHE_NAME } from '../js/core/pwaVersion.js';
import { statusIcon, statusLabel } from './lib/cert-check.mjs';
import { buildGateReport, gateExitCode, runtimeFromManual } from './lib/cert-report.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_MD = join(ROOT, 'docs', 'certification', 'RESILIENCE-VERIFICATION.md');
const OUT_JSON = join(ROOT, 'docs', 'certification', 'RESILIENCE-VERIFICATION.json');

function read(rel) {
    const p = join(ROOT, rel);
    return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

let failed = 0;

function check(id, scenario, label, cond, detail = '', recovery = '', layer = 'static') {
    if (layer === 'runtime') {
        return { id, scenario, label, status: 'not_verified', detail, recovery, layer: 'runtime' };
    }
    const ok = Boolean(cond);
    if (!ok) failed += 1;
    return { id, scenario, label, status: ok ? 'pass' : 'fail', detail, recovery, layer: 'static' };
}

const sw = read('sw.js');
const map = read('js/views/map.js');
const offlineSync = read('js/core/offlineSync.js');
const collector = read('js/diagnostics/runtimeErrorCollector.js');
const feed = read('js/diagnostics/runtimeErrorFeed.js');
const selfHeal = read('js/diagnostics/selfHealing.js');
const memoryCleaner = read('js/diagnostics/memoryCleaner.js');
const app = read('js/app.js');
const index = read('index.html');
const rus = read('js/diagnostics/realUserSimulation.js');
const vu = read('js/diagnostics/virtualUser.js');
const gov = read('js/data/govDataService.js');

const checks = [];

// ——— 1. Brak internetu ———
checks.push(check(
    'R01-offline-sw',
    'brak-internetu',
    'SW offline shell (precache + navigate fallback)',
    sw.includes('PRECACHE_URLS') && /navigate[\s\S]{0,400}caches\.match\('\/index\.html'\)/.test(sw),
    'precache index.html · navigate → cache fallback'
));

checks.push(check(
    'R01-offline-ui',
    'brak-internetu',
    'Banner offline na mapie + online sync',
    map.includes('map-offline-banner') && map.includes("addEventListener('offline'")
        && map.includes("addEventListener('online'"),
    'updateOfflineBanner · eventy online/offline'
));

checks.push(check(
    'R01-offline-queue',
    'brak-internetu',
    'Kolejka offline + flush po online',
    offlineSync.includes('enqueueOfflineAction') && offlineSync.includes('flushOfflineQueue')
        && offlineSync.includes("addEventListener('online'"),
    'rg_offline_sync_queue_v1 · SW sync tag'
));

checks.push(check(
    'R01-offline-events',
    'brak-internetu',
    'Rejestracja offline w Error Collector',
    collector.includes("addEventListener('offline'") && collector.includes('Network offline'),
    'runtimeErrorCollector · kategoria network'
));

// ——— 2. Wolny internet ———
checks.push(check(
    'R02-slow-map',
    'wolny-internet',
    'Mapa: fetch w tle bez blokowania UI',
    map.includes('locationDataFetchInFlight') && map.includes('dataFetchGeneration')
        && map.includes('.catch((error)'),
    'generacja fetch · catch · finally — UI nie zawiesza się'
));

checks.push(check(
    'R02-slow-sw',
    'wolny-internet',
    'SW: network-first z fallback cache',
    sw.includes('cached || networkFetch') || sw.includes('.catch(() => cached)'),
    'stale-while-revalidate / cache fallback'
));

checks.push(check(
    'R02-slow-rus',
    'wolny-internet',
    'Symulacja RUS/VU: offline + online',
    false,
    'Wykonanie __RG_VIRTUAL__ / __RG_REAL_USERS__ w przeglądarce — wiring ≠ chaos test',
    '',
    'runtime'
));

// ——— 3. Timeout ———
checks.push(check(
    'R03-timeout-map',
    'timeout',
    'Mapa: timeout GPS / OSM + AbortController',
    map.includes('timeout:') && map.includes('AbortController')
        && map.includes('AbortError'),
    'timeout 12–20s · abort poprzedniego fetchu'
));

checks.push(check(
    'R03-timeout-gov',
    'timeout',
    'GovData: AbortController + timeout error',
    gov.includes('AbortController') && gov.includes('timeout'),
    'govDataService FETCH_TIMEOUT_MS'
));

checks.push(check(
    'R03-timeout-fetch-catch',
    'timeout',
    'Fetch errors nie crashują app',
    collector.includes('Fetch failed') && map.includes('.catch((error)'),
    'runtimeErrorCollector log · map catch'
));

// ——— 4. Uszkodzony cache ———
checks.push(check(
    'R04-cache-purge',
    'uszkodzony-cache',
    'SW activate: purge starych cache',
    sw.includes('caches.delete') && sw.includes("key.startsWith('rg-pwa-')"),
    'activate → delete stale rg-* caches'
));

checks.push(check(
    'R04-cache-safe-put',
    'uszkodzony-cache',
    'safeCachePut — tylko 200 basic (bez corrupt partial)',
    sw.includes('function safeCachePut') && sw.includes("response.status !== 200"),
    'ignoruje 206 / opaque responses'
));

checks.push(check(
    'R04-cache-cleaner',
    'uszkodzony-cache',
    'Memory Cleaner: deleteStaleCaches',
    memoryCleaner.includes('deleteStaleCaches') && memoryCleaner.includes('staleNames'),
    'Dev Vault → safe clean stale PWA cache'
));

checks.push(check(
    'R04-cache-probe',
    'uszkodzony-cache',
    'Runtime Error Feed: probe cache',
    feed.includes('caches.keys') && feed.includes("category: 'cache'"),
    'probeRuntimeSignals · warn gdy brak cache'
));

// ——— 5. Brak manifestu ———
checks.push(check(
    'R05-manifest-link',
    'brak-manifestu',
    'index.html link manifest (normal path)',
    index.includes('rel="manifest"') && index.includes('manifest.json'),
    'standardowy link manifest'
));

checks.push(check(
    'R05-manifest-probe',
    'brak-manifestu',
    'Wykrycie braku manifestu (feed)',
    feed.includes('link[rel="manifest"]') && feed.includes('Brak link rel=manifest'),
    'probeRuntimeSignals · nie crash'
));

checks.push(check(
    'R05-manifest-degrade',
    'brak-manifestu',
    'App boot bez twardego wymagania manifest',
    app.includes('bootstrap') && !/manifest[\s\S]{0,120}throw/.test(app),
    'PWA install może zawieść · shell działa'
));

// ——— 6. Brak ikon ———
checks.push(check(
    'R06-icons-sw-fallback',
    'brak-ikon',
    'SW: ikony offline fallback wersjonowany',
    sw.includes('fetchPwaIconAsset') && sw.includes('versionedIconUrl')
        && sw.includes('DEFAULT_ICON'),
    'network-first · offline ?v= · push DEFAULT_ICON'
));

checks.push(check(
    'R06-icons-heal',
    'brak-ikon',
    'Self-Heal: broken images / icons',
    selfHeal.includes('healBrokenImages') && selfHeal.includes('healBrokenIcons')
        && selfHeal.includes('PLACEHOLDER_SRC'),
    'logo-master placeholder · nav text fallback'
));

checks.push(check(
    'R06-icons-collector',
    'brak-ikon',
    'Image error collector',
    collector.includes("t.tagName !== 'IMG'") || collector.includes("tagName !== 'IMG'")
        && collector.includes("category: 'image'"),
    'IMG error → runtimeErrorStore'
));

// ——— 7. Restart Service Workera ———
checks.push(check(
    'R07-sw-restart',
    'restart-sw',
    'SW skipWaiting + clients.claim',
    sw.includes('skipWaiting') && sw.includes('clients.claim'),
    'nowy SW przejmuje kontrolę po activate'
));

checks.push(check(
    'R07-sw-heal',
    'restart-sw',
    'Self-Heal: healServiceWorker + prompt',
    selfHeal.includes('healServiceWorker') && selfHeal.includes('showSwRefreshPrompt')
        && selfHeal.includes('updatefound'),
    'ETAP 39: prompt odświeżenia · nie skipWaiting z klienta'
));

checks.push(check(
    'R07-sw-controller',
    'restart-sw',
    'controllerchange logging',
    collector.includes('controllerchange') && collector.includes('service-worker'),
    'runtimeErrorCollector · SW lifecycle events'
));

checks.push(check(
    'R07-sw-register',
    'restart-sw',
    'Re-register on load',
    index.includes('serviceWorker.register') && sw.includes('addEventListener(\'install\''),
    'index.html register · install precache'
));

function runTest(cmd, args) {
    const r = spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', shell: true });
    return { ok: r.status === 0, exit: r.status ?? 1 };
}

console.log('[Resilience] ETAP 43 · Zadanie 8\n');

const automated = [];
for (const [label, cmd, args] of [
    ['pwa-lifecycle', 'npm', ['run', 'check:pwa-lifecycle']],
    ['service-worker', 'npm', ['run', 'check:service-worker']],
    ['runtime-error-feed', 'npm', ['run', 'check:runtime-error-feed']]
]) {
    process.stdout.write(`→ ${label}… `);
    const r = runTest(cmd, args);
    automated.push({ label, ...r });
    console.log(r.ok ? 'PASS' : `FAIL (${r.exit})`);
}

const byScenario = {};
for (const c of checks) {
    if (!byScenario[c.scenario]) byScenario[c.scenario] = [];
    byScenario[c.scenario].push(c);
}

const scenarioLabels = {
    'brak-internetu': 'Brak internetu',
    'wolny-internet': 'Wolny internet',
    'timeout': 'Timeout',
    'uszkodzony-cache': 'Uszkodzony cache',
    'brak-manifestu': 'Brak manifestu',
    'brak-ikon': 'Brak ikon',
    'restart-sw': 'Restart Service Workera'
};

for (const [key, label] of Object.entries(scenarioLabels)) {
    const items = byScenario[key] || [];
    const staticItems = items.filter((i) => i.layer === 'static');
    const runtimeItems = items.filter((i) => i.layer === 'runtime');
    const ok = staticItems.every((i) => i.status === 'pass');
    const runtimeTag = runtimeItems.length ? ` · ${runtimeItems.length} RUNTIME` : '';
    process.stdout.write(`${ok ? '✅' : '❌'} ${label} (${staticItems.filter((i) => i.status === 'pass').length}/${staticItems.length})${runtimeTag}\n`);
}

const manualMatrix = [
    {
        scenario: 'brak-internetu',
        steps: ['DevTools → Offline / tryb samolotowy', 'Otwórz PWA (po wcześniejszej wizycie)', 'Home/Map z cache · banner offline'],
        pass: 'Brak białego ekranu · nawigacja działa · powrót online OK'
    },
    {
        scenario: 'wolny-internet',
        steps: ['DevTools → Network → Slow 3G', 'Przejdź Home → Map → producent'],
        pass: 'UI responsywne · skeleton/map · brak freeze'
    },
    {
        scenario: 'timeout',
        steps: ['Network → Offline podczas ładowania OSM', 'Czekaj >15s', 'Włącz online'],
        pass: 'console.warn OSM · mapa odświeża markery · brak crash'
    },
    {
        scenario: 'uszkodzony-cache',
        steps: [`Application → Cache Storage → usuń ${PWA_CACHE_NAME}`, 'Lub Memory Cleaner → safe clean', 'Reload'],
        pass: 'SW re-precache · app boot OK'
    },
    {
        scenario: 'brak-manifestu',
        steps: ['Application → Manifest → simulate missing / block manifest.json', 'Reload'],
        pass: 'App działa · brak crash · ewentualny warn w Error Feed'
    },
    {
        scenario: 'brak-ikon',
        steps: ['Block /assets/icons/* w Network', 'Reload / otwórz PWA'],
        pass: 'Placeholder / cache fallback · Self-Heal opcjonalnie · brak crash'
    },
    {
        scenario: 'restart-sw',
        steps: ['Application → Service Workers → Update / Unregister + Reload', 'Lub deploy nowej wersji SW'],
        pass: 'skipWaiting · clients.claim · prompt refresh · shell działa'
    }
];

const browserSim = `
// Symulacje w konsoli (localhost / ?dev=1):
// 1. Offline
window.dispatchEvent(new Event('offline'));
// 2. Online
window.dispatchEvent(new Event('online'));
// 3. SW update check
navigator.serviceWorker?.getRegistration()?.then(r => r?.update());
// 4. Cache keys
caches.keys().then(console.log);
// 5. Pełna symulacja sieci
await __RG_REAL_USERS__.runOne(1); // zawiera offline step
await __RG_VIRTUAL__.run({ scenarios: ['offline','online'] });
`.trim();

const scenarioLabelsDisplay = {
    'brak-internetu': 'Brak internetu',
    'wolny-internet': 'Wolny internet',
    'timeout': 'Timeout',
    'uszkodzony-cache': 'Uszkodzony cache',
    'brak-manifestu': 'Brak manifestu',
    'brak-ikon': 'Brak ikon',
    'restart-sw': 'Restart Service Workera'
};

const gateItems = [
    ...checks,
    ...runtimeFromManual(
        manualMatrix.map((m) => ({ id: `M-res-${m.scenario}`, title: scenarioLabelsDisplay[m.scenario] || m.scenario, pass: m.pass, steps: m.steps })),
        (m) => m.title
    )
];
const gate = buildGateReport({
    items: gateItems,
    automated,
    etap: '45-D-T8',
    extra: {
        generatedAt: new Date().toISOString(),
        scenarios: byScenario,
        manualMatrix,
        browserSim,
        expectedBehavior: {
            noWhiteScreen: true,
            offlineShell: true,
            gracefulDegradation: true,
            noAutoFix: true,
            errorsLoggedLocally: true
        },
        autoApply: false
    }
});
const { verdict, staticVerdict: staticVerdictStr, runtimeVerdict: runtimeVerdictStr, manualRequired } = gate;
const report = gate;

mkdirSync(join(ROOT, 'docs', 'certification'), { recursive: true });
writeFileSync(OUT_JSON, JSON.stringify(report, null, 2), 'utf8');

const md = `# Resilience Verification — ETAP 45-D · Zadanie 8

**Data:** ${report.generatedAt.slice(0, 10)}  
**Gate:** **${verdict}**  
**STATIC:** **${staticVerdictStr}**  
**RUNTIME:** **${runtimeVerdictStr}**

> **STATIC** = wiring offline/SW/error handling. **RUNTIME** = chaos test DevTools/telefon.

## Warstwy

| Warstwa | Werdykt |
|---------|---------|
| **STATIC** | **${staticVerdictStr}** (${report.static.passed}/${report.static.total}) |
| **RUNTIME** | **${runtimeVerdictStr}** (${report.runtime.pending} pending) |
| Subprocess | ${report.automated.passed}/${report.automated.total} |
| **Gate** | **${verdict}** |

## Scenariusze

${Object.entries(scenarioLabels).map(([key, title]) => {
    const items = byScenario[key] || [];
    const ok = items.every((i) => i.status === 'pass');
    return `
### ${ok ? '✅' : '❌'} ${title}

| Check | Status | Odporność |
|-------|--------|-----------|
${items.map((i) => `| ${i.label} | ${i.status === 'pass' ? '✅' : '❌'} | ${i.detail} |`).join('\n')}`;
}).join('\n')}

## Zachowanie oczekiwane

| Reguła | Wartość |
|--------|---------|
| Brak białego ekranu | ✅ shell offline |
| Graceful degradation | ✅ manifest/ikony opcjonalne |
| Błędy | ✅ lokalny log (Error Feed / Guardian) |
| Auto-fix danych | ❌ wyłączone (autoApply=false) |

## Bramki automatyczne

| Test | Status |
|------|--------|
${automated.map((a) => `| ${a.label} | ${a.ok ? '✅ PASS' : '❌ FAIL'} |`).join('\n')}

## RUNTIME — macierz chaos

| Scenariusz | Kroki | Pass |
|------------|-------|------|
${manualMatrix.map((m) => `| ${scenarioLabels[m.scenario] || m.scenario} | ${m.steps.join(' → ')} | ${m.pass} |`).join('\n')}

## Symulacja w konsoli

\`\`\`javascript
${browserSim}
\`\`\`

## Pliki kluczowe

| Plik | Rola |
|------|------|
| \`sw.js\` | offline precache · fetch fallback · cache purge |
| \`js/views/map.js\` | banner offline · OSM timeout/abort |
| \`js/core/offlineSync.js\` | kolejka offline |
| \`js/diagnostics/runtimeErrorCollector.js\` | network/SW/image errors |
| \`js/diagnostics/selfHealing.js\` | heal SW · icons · images |
| \`js/diagnostics/memoryCleaner.js\` | stale cache clean |

---
*ETAP 43-T8 · autoApply=false · uruchom: \`npm run check:resilience\`*
`;

writeFileSync(OUT_MD, md, 'utf8');

console.log(`\n[Resilience] ${staticVerdictStr} · ${runtimeVerdictStr} · gate ${verdict}`);
console.log(`Wrote: docs/certification/RESILIENCE-VERIFICATION.md`);
process.exit(gateExitCode(verdict));
