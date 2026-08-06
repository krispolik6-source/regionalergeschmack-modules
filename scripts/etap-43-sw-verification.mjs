/**
 * ETAP 43 · Zadanie 4 — weryfikacja Service Worker
 * Run: npm run check:service-worker
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
    readPwaVersionFromModule,
    readPwaVersionFromGlobal,
    readPwaVersionFromSw
} from './lib/read-pwa-version.mjs';
import {
    PWA_CACHE_NAME,
    PWA_IMAGE_CACHE_NAME,
    PWA_VERSION
} from '../js/core/pwaVersion.js';
import { statusIcon, statusLabel } from './lib/cert-check.mjs';
import { buildGateReport, gateExitCode, runtimeFromManual } from './lib/cert-report.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_MD = join(ROOT, 'docs', 'certification', 'SERVICE-WORKER-VERIFICATION.md');
const OUT_JSON = join(ROOT, 'docs', 'certification', 'SERVICE-WORKER-VERIFICATION.json');

function read(rel) {
    const p = join(ROOT, rel);
    return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

const V = PWA_VERSION;
let failed = 0;

function check(id, area, label, cond, detail = '') {
    const ok = Boolean(cond);
    if (!ok) failed += 1;
    return { id, area, label, status: ok ? 'pass' : 'fail', detail, layer: 'static' };
}

const sw = read('sw.js');
const index = read('index.html');
const pwaVerModule = read('js/core/pwaVersion.js');
const pwaVerGlobal = read('js/core/pwaVersion.global.js');
const memoryCleaner = read('js/diagnostics/memoryCleaner.js');
const selfHealing = read('js/diagnostics/selfHealing.js');
const offlineSync = read('js/core/offlineSync.js');

const checks = [];

// ——— 1. install ———
checks.push(check(
    'SW01-install-handler',
    'install',
    'install event + waitUntil',
    sw.includes("addEventListener('install'") && sw.includes('event.waitUntil'),
    'sw.js: install listener · event.waitUntil'
));

checks.push(check(
    'SW01-install-precache',
    'install',
    'Precache shell (PRECACHE_URLS)',
    sw.includes('PRECACHE_URLS') && sw.includes('cache.addAll(PRECACHE_URLS)')
        && sw.includes("'/'") && sw.includes("'/index.html'")
        && sw.includes('/js/app.js'),
    'index.html · CSS · ikony · manifest w precache'
));

checks.push(check(
    'SW01-install-cache-open',
    'install',
    'Otwarcie CACHE_VERSION przy install',
    sw.includes('caches.open(CACHE_VERSION)') && sw.includes('CACHE_VERSION = PWA_CACHE_NAME'),
    `precache do ${PWA_CACHE_NAME}`
));

// ——— 2. activate ———
checks.push(check(
    'SW02-activate-handler',
    'activate',
    'activate event + waitUntil',
    sw.includes("addEventListener('activate'") && /activate[\s\S]{0,200}event\.waitUntil/.test(sw),
    'sw.js: activate listener'
));

checks.push(check(
    'SW02-activate-keys',
    'activate',
    'activate czyta caches.keys()',
    /activate[\s\S]{0,400}caches\.keys\(\)/.test(sw),
    'enumerate cache przed cleanup'
));

// ——— 3. skipWaiting ———
checks.push(check(
    'SW03-skip-waiting',
    'skipWaiting',
    'skipWaiting po precache',
    /install[\s\S]{0,400}skipWaiting\(\)/.test(sw),
    'install → addAll → skipWaiting (natychmiastowa aktywacja nowego SW)'
));

checks.push(check(
    'SW03-no-client-skip',
    'skipWaiting',
    'Klient nie wywołuje skipWaiting (selfHealing)',
    selfHealing.includes('healServiceWorker')
        && selfHealing.includes('bez agresywnego skipWaiting')
        && !selfHealing.includes('skipWaiting()'),
    'ETAP 39: prompt odświeżenia zamiast skipWaiting z klienta'
));

// ——— 4. clients.claim ———
checks.push(check(
    'SW04-clients-claim',
    'clients.claim',
    'clients.claim po cleanup',
    sw.includes('clients.claim()')
        && /addEventListener\('activate'[\s\S]*clients\.claim\(\)/.test(sw),
    'activate → purge → clients.claim (kontrola od razu)'
));

// ——— 5. cache cleanup ———
checks.push(check(
    'SW05-cleanup-purge',
    'cache cleanup',
    'Usuwa stare rg-pwa-* i rg-runtime-images-*',
    sw.includes("key.startsWith('rg-pwa-')") && sw.includes("key.startsWith('rg-runtime-images-')")
        && sw.includes('caches.delete(key)'),
    'filter + delete · zachowuje CACHE_VERSION + IMAGE_CACHE'
));

checks.push(check(
    'SW05-cleanup-keep-current',
    'cache cleanup',
    'Nie usuwa bieżących cache',
    /filter[\s\S]{0,200}key === CACHE_VERSION[\s\S]{0,80}key === IMAGE_CACHE/.test(sw),
    'wyjątek dla bieżącej wersji'
));

checks.push(check(
    'SW05-memory-cleaner-sync',
    'cache cleanup',
    'Memory Cleaner — deleteStaleCaches',
    memoryCleaner.includes('deleteStaleCaches') && memoryCleaner.includes('PWA_CACHE_PREFIX_KEEP'),
    'memoryCleaner.js · import z pwaVersion.js'
));

// ——— 6. runtime cache ———
checks.push(check(
    'SW06-runtime-image-cache',
    'runtime cache',
    'IMAGE_CACHE dla obrazów runtime',
    sw.includes('IMAGE_CACHE = PWA_IMAGE_CACHE_NAME')
        && /isImage[\s\S]{0,300}caches\.open\(IMAGE_CACHE\)/.test(sw),
    `${PWA_IMAGE_CACHE_NAME} · cache-first z network update`
));

checks.push(check(
    'SW06-runtime-code-cache',
    'runtime cache',
    'Runtime cache dla JS/CSS (network-first)',
    /isCodeAsset[\s\S]{0,400}safeCachePut/.test(sw)
        && /isCodeAsset[\s\S]{0,400}caches\.open\(CACHE_VERSION\)/.test(sw),
    'fetch → put CACHE_VERSION · offline caches.match'
));

checks.push(check(
    'SW06-runtime-nav-cache',
    'runtime cache',
    'Navigate — aktualizacja index.html w cache',
    /request\.mode === 'navigate'[\s\S]{0,300}safeCachePut\(cache, '\/index.html'/.test(sw),
    'network navigate → update cached shell'
));

checks.push(check(
    'SW06-safe-cache-put',
    'runtime cache',
    'safeCachePut — tylko 200 basic',
    sw.includes('function safeCachePut') && sw.includes("response.status !== 200")
        && sw.includes("response.type !== 'basic'"),
    'bez cache 206 / opaque / error'
));

// ——— 7. offline cache ———
checks.push(check(
    'SW07-offline-precache',
    'offline cache',
    'Precache offline shell',
    sw.includes('PRECACHE_URLS') && sw.includes('cache.addAll'),
    `${(sw.match(/PRECACHE_URLS = \[([\s\S]*?)\];/)?.[1] || '').split('\n').filter((l) => l.trim().startsWith("'") || l.trim().startsWith('`')).length} URL w precache`
));

checks.push(check(
    'SW07-offline-navigate-fallback',
    'offline cache',
    'Navigate offline → index.html',
    /navigate[\s\S]{0,400}caches\.match\('\/index\.html'\)/.test(sw),
    'fetch fail → cached /index.html lub /'
));

checks.push(check(
    'SW07-offline-code-fallback',
    'offline cache',
    'JS/CSS offline → caches.match(request)',
    sw.includes('isCodeAsset')
        && sw.includes('.catch(() => caches.match(request))'),
    'code assets offline fallback'
));

checks.push(check(
    'SW07-offline-icons',
    'offline cache',
    'Ikony offline — wersjonowany fallback',
    sw.includes('versionedIconUrl') && sw.includes('fetchPwaIconAsset'),
    'network-first · offline tylko ?v= bieżącej wersji'
));

checks.push(check(
    'SW07-offline-sync-bridge',
    'offline cache',
    'Background sync + offline queue flush',
    sw.includes("addEventListener('sync'") && sw.includes('rg-offline-sync')
        && sw.includes('FLUSH_OFFLINE_QUEUE')
        && offlineSync.includes('flushOfflineQueue'),
    'SW sync → postMessage · offlineSync.js online handler'
));

// ——— 8. version sync ———
checks.push(check(
    'SW08-bridge-import',
    'version sync',
    'SW importScripts pwaVersion.global.js',
    sw.includes("importScripts('/js/core/pwaVersion.global.js')")
        && !/const PWA_VERSION\s*=/.test(sw),
    'brak lokalnej kopii PWA_VERSION w sw.js'
));

checks.push(check(
    'SW08-version-canonical',
    'version sync',
    'PWA_VERSION spójna (module = global = SW bridge)',
    readPwaVersionFromGlobal(ROOT) === V && readPwaVersionFromSw(ROOT) === V,
    `PWA_VERSION=${V} · pwaVersion.js = pwaVersion.global.js`
));

checks.push(check(
    'SW08-index-register',
    'version sync',
    'index.html rejestruje sw.js?v=',
    index.includes('serviceWorker.register') && index.includes(`sw.js?v=${V}`),
    `register('/sw.js?v=${V}')`
));

checks.push(check(
    'SW08-cache-names',
    'version sync',
    'Nazwy cache zsynchronizowane z PWA_VERSION',
    pwaVerModule.includes('PWA_CACHE_NAME') && pwaVerModule.includes('PWA_IMAGE_CACHE_NAME')
        && pwaVerGlobal.includes(`PWA_VERSION = '${V}'`)
        && pwaVerGlobal.includes('PWA_CACHE_NAME')
        && sw.includes('CACHE_VERSION = PWA_CACHE_NAME'),
    `${PWA_CACHE_NAME} · ${PWA_IMAGE_CACHE_NAME}`
));

checks.push(check(
    'SW08-self-healing-version',
    'version sync',
    'selfHealing używa pwaAssetUrl',
    selfHealing.includes("from '../core/pwaVersion.js'") && selfHealing.includes('pwaAssetUrl'),
    'dynamiczny cache-bust w diagnostyce'
));

function runTest(cmd, args) {
    const r = spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', shell: true });
    return { ok: r.status === 0, exit: r.status ?? 1, tail: `${r.stdout || ''}${r.stderr || ''}`.trim().split(/\r?\n/).slice(-3).join('\n') };
}

console.log('[Service Worker] Verification — ETAP 43 · Zadanie 4\n');

const automated = [];
for (const [label, cmd, args] of [
    ['test-pwa', 'npm', ['run', 'check:pwa']],
    ['pwa-version-sync', 'npm', ['run', 'check:pwa-version']]
]) {
    process.stdout.write(`→ ${label}… `);
    const r = runTest(cmd, args);
    automated.push({ label, ...r });
    console.log(r.ok ? 'PASS' : `FAIL (${r.exit})`);
}

const byArea = {};
for (const c of checks) {
    if (!byArea[c.area]) byArea[c.area] = [];
    byArea[c.area].push(c);
}

for (const c of checks) {
    process.stdout.write(`${statusIcon(c)} [${c.area}] ${c.label} · ${statusLabel(c)}\n`);
}

const manualSteps = [
    {
        id: 'M-sw-install',
        title: 'Install + precache',
        device: 'Chrome DevTools',
        steps: [
            'Application → Service Workers → Update / Register',
            `Cache Storage: pojawia się ${PWA_CACHE_NAME} z index.html, CSS, ikonami`,
            'Status: activated · skipWaiting wykonany'
        ],
        pass: `Precache w ${PWA_CACHE_NAME} bez błędów addAll`
    },
    {
        id: 'M-sw-update',
        title: 'Update + cleanup starych cache',
        device: 'Chrome / PWA',
        steps: [
            'Bump PWA_VERSION → deploy',
            'Nowy SW: installing → activated',
            `Cache Storage: tylko ${PWA_CACHE_NAME} + ${PWA_IMAGE_CACHE_NAME}`,
            'Stare rg-pwa-* / rg-runtime-images-* usunięte'
        ],
        pass: 'Activate purge · brak starych cache'
    },
    {
        id: 'M-sw-offline',
        title: 'Offline shell',
        device: 'Telefon PWA',
        steps: [
            'Odwiedź app online (precache)',
            'Tryb samolotowy ON',
            'Reload → Home/Map z cache · banner offline'
        ],
        pass: 'Aplikacja działa offline po precache'
    },
    {
        id: 'M-sw-online',
        title: 'Powrót online + runtime cache',
        device: 'Chrome',
        steps: [
            'Online → nawigacja odświeża index.html w cache',
            `Obrazy runtime w ${PWA_IMAGE_CACHE_NAME}`,
            'Offline queue flush (offlineSync)'
        ],
        pass: 'Runtime cache aktualizuje się · sync działa'
    }
];

const gateItems = [...checks, ...runtimeFromManual(manualSteps, (m) => m.title)];
const gate = buildGateReport({
    items: gateItems,
    automated,
    etap: '45-D-T4',
    extra: {
        generatedAt: new Date().toISOString(),
        pwaVersion: V,
        cacheNames: { shell: PWA_CACHE_NAME, images: PWA_IMAGE_CACHE_NAME },
        areas: byArea,
        lifecycle: {
            install: 'precache PRECACHE_URLS → skipWaiting',
            activate: 'purge stale rg-* caches → clients.claim',
            fetch: 'icons network-first · navigate/code network-first · images IMAGE_CACHE · default stale-while-revalidate'
        },
        manual: manualSteps,
        autoApply: false
    }
});
const { verdict, staticVerdict: staticVerdictStr, runtimeVerdict: runtimeVerdictStr } = gate;
const report = gate;

mkdirSync(join(ROOT, 'docs', 'certification'), { recursive: true });
writeFileSync(OUT_JSON, JSON.stringify(report, null, 2), 'utf8');

const areaOrder = ['install', 'activate', 'skipWaiting', 'clients.claim', 'cache cleanup', 'runtime cache', 'offline cache', 'version sync'];
const areaLabels = {
    install: 'Install',
    activate: 'Activate',
    skipWaiting: 'skipWaiting',
    'clients.claim': 'clients.claim',
    'cache cleanup': 'Cache cleanup',
    'runtime cache': 'Runtime cache',
    'offline cache': 'Offline cache',
    'version sync': 'Version sync'
};

const md = `# Service Worker Verification — ETAP 43 · Zadanie 4

**Data:** ${report.generatedAt.slice(0, 10)}  
**ETAP:** 45-D · Runtime Truth  
**Gate:** **${verdict}**  
**STATIC:** **${staticVerdictStr}**  
**RUNTIME:** **${runtimeVerdictStr}**  
**PWA version:** ${V}  
**Cache:** \`${PWA_CACHE_NAME}\` · \`${PWA_IMAGE_CACHE_NAME}\`

> **STATIC** = sw.js, manifest wiring, wersje. **RUNTIME** = DevTools / telefon.

## Warstwy

| Warstwa | Werdykt | Szczegóły |
|---------|---------|-----------|
| **STATIC** | **${staticVerdictStr}** | ${report.static.passed}/${report.static.total} obszarów |
| **RUNTIME** | **${runtimeVerdictStr}** | ${report.runtime.pending} pending |
| Subprocess | ${report.automated.passed}/${report.automated.total} | npm gates |
| **Gate** | **${verdict}** | |

## Cykl życia SW

\`\`\`
install  → caches.open(CACHE_VERSION) → addAll(PRECACHE_URLS) → skipWaiting()
activate → caches.keys() → delete stale rg-pwa-* / rg-runtime-images-* → clients.claim()
fetch    → icons: network-first | navigate/code: network-first + cache | images: IMAGE_CACHE | default: cache-first
\`\`\`

## Obszary weryfikacji

${areaOrder.map((area) => {
    const items = byArea[area] || [];
    return `
### ${areaLabels[area] || area}

| Check | Status | Dowód |
|-------|--------|-------|
${items.map((i) => `| ${i.label} | ${statusLabel(i)} | ${i.detail} |`).join('\n')}`;
}).join('\n')}

## Bramki automatyczne

| Test | Status |
|------|--------|
${automated.map((a) => `| ${a.label} | ${a.ok ? '✅ PASS' : '❌ FAIL'} |`).join('\n')}

## RUNTIME — potwierdzenie

${manualSteps.map((m) => `
### ${m.id} — ${m.title}

**Urządzenie:** ${m.device}

1. ${m.steps.join('\n1. ')}

**Pass:** ${m.pass}
`).join('\n')}

## Pliki kluczowe

| Plik | Rola |
|------|------|
| \`sw.js\` | install · activate · fetch · push · sync |
| \`js/core/pwaVersion.global.js\` | Bridge PWA_VERSION dla importScripts |
| \`js/core/pwaVersion.js\` | Kanoniczna wersja · cache names · pwaAssetUrl |
| \`index.html\` | \`serviceWorker.register('/sw.js?v=${V}')\` |
| \`js/diagnostics/memoryCleaner.js\` | Usuwanie starych cache (PWA_CACHE_PREFIX_KEEP) |
| \`js/diagnostics/selfHealing.js\` | Prompt odświeżenia przy waiting SW |
| \`js/core/offlineSync.js\` | Flush kolejki po online / FLUSH_OFFLINE_QUEUE |

---
*ETAP 43-T4 · autoApply=false · uruchom: \`npm run check:service-worker\`*
`;

writeFileSync(OUT_MD, md, 'utf8');

console.log(`\n[Service Worker] ${staticVerdictStr} · ${runtimeVerdictStr} · gate ${verdict}`);
console.log(`Wrote: docs/certification/SERVICE-WORKER-VERIFICATION.md`);
process.exit(gateExitCode(verdict));
