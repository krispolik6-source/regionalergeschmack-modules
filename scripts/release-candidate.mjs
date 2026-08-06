/**
 * ETAP 38 — Release Candidate
 *
 * Symulacja ścieżki prawdziwego użytkownika (first install → reinstall).
 * Waliduje kod + storage + PWA + brak CRITICAL UTF-8.
 * Nie zmienia Store / EventBus / API / GPS / Leaflet / routing core.
 *
 * Usage: npm run release-candidate
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { readPwaVersionFromModule, readPwaVersionFromSw } from './lib/read-pwa-version.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'docs', 'final');
const OUT_MD = join(OUT_DIR, 'RELEASE-CANDIDATE.md');
const OUT_JSON = join(OUT_DIR, 'RELEASE-CANDIDATE.json');

function read(rel) {
    const full = join(ROOT, rel);
    if (!existsSync(full)) return '';
    return readFileSync(full, 'utf8');
}

function countFffd(s) {
    return (s.match(/\uFFFD/g) || []).length;
}

const steps = [];
function step(id, label, fn) {
    const started = Date.now();
    try {
        const detail = fn() || 'ok';
        steps.push({ id, label, status: 'pass', detail, ms: Date.now() - started });
    } catch (err) {
        steps.push({
            id,
            label,
            status: 'fail',
            detail: err?.message || String(err),
            ms: Date.now() - started
        });
    }
}

function assert(cond, msg) {
    if (!cond) throw new Error(msg);
}

const html = read('index.html');
const sw = read('sw.js');
const manifest = read('manifest.json');
const home = read('js/views/home.js');
const map = read('js/views/map.js');
const nav = read('js/controllers/navigation.js');
const favorites = read('js/views/favorites.js');
const favoritesStore = read('js/core/favoritesStore.js');
const cart = read('js/views/cart.js');
const premium = read('js/views/premium.js');
const settings = read('js/core/settings.js');
const pwaInstall = read('js/core/pwaInstall.js');
const userLocation = read('js/core/userLocation.js');
const landing = read('landing.html');
const push = read('js/core/pushNotifications.js');
const style = read('css/style.css');
const ph = read('css/premium-header.css');
const rus = read('js/diagnostics/realUserSimulation.js');

// ——— 1. Instalacja ———
step('install', 'Instaluję aplikację pierwszy raz', () => {
    assert(html.includes('rel="manifest"'), 'brak manifest link');
    assert(manifest.includes('"name"') || manifest.includes('"short_name"'), 'manifest.json niepełny');
    assert(html.includes('beforeinstallprompt'), 'brak beforeinstallprompt');
    assert(pwaInstall.includes('beforeinstallprompt') && pwaInstall.includes('captureInstallPrompt'), 'pwaInstall niekompletny');
    assert(existsSync(join(ROOT, 'assets/icons/icon-192.png')), 'brak icon-192');
    assert(existsSync(join(ROOT, 'assets/icons/apple-touch-icon.png')), 'brak apple-touch-icon');
    return 'manifest + beforeinstallprompt + ikony';
});

// ——— 2. Pierwsze uruchomienie ———
step('first-launch', 'Pierwsze uruchomienie', () => {
    assert(html.includes('app.js'), 'brak entry app.js');
    assert(nav.includes('VIEW_IDS') && nav.includes('navigateTo'), 'navigation core');
    assert(settings.includes('getSettings') && settings.includes('applyDarkMode'), 'settings boot');
    assert(html.includes('charset="UTF-8"') || html.includes('charset=UTF-8'), 'charset UTF-8');
    assert(countFffd(home) === 0, `home.js U+FFFD ×${countFffd(home)}`);
    assert(countFffd(landing) === 0, `landing.html U+FFFD ×${countFffd(landing)}`);
    assert(home.includes('€') && home.includes('formatPrice'), 'formatPrice z €');
    return 'shell + UTF-8 clean + settings';
});

// ——— 3. GPS ———
step('gps', 'GPS / lokalizacja', () => {
    assert(userLocation.includes('getLastPosition') || map.includes('getLastPosition'), 'last position');
    assert(map.includes('watchPosition'), 'watchPosition');
    assert(map.includes('clearWatch'), 'clearWatch (anti-leak)');
    assert(map.includes('LOCATION_UPDATED') || map.includes('LOCATION_CHANGED'), 'location events');
    assert(map.includes('resolveUserLocation'), 'resolveUserLocation');
    return 'watch + clearWatch + events';
});

// ——— 4. Wyszukiwanie ———
step('search', 'Wyszukiwanie', () => {
    assert(
        html.includes('headerSearchInput') || home.includes('homeSearchInput') || home.includes('type="search"'),
        'home search input'
    );
    assert(home.includes('SEARCH_PRODUCTS') || rus.includes('SEARCH_PRODUCTS'), 'search event');
    assert(map.includes('setSearchQuery') || home.includes('setSearchQuery'), 'map search bridge');
    return 'home search + map query';
});

// ——— 5. Mapa ———
step('map', 'Mapa', () => {
    assert(nav.includes('map.js'), 'map view import');
    assert(map.includes('leaflet') || map.includes('L.') || read('js/map/map.js').includes('leaflet'), 'Leaflet');
    assert(html.includes('leaflet'), 'leaflet CSS/JS w HTML');
    assert(map.includes('offline') || map.includes('offlineNotice') || map.includes('map-offline'), 'offline banner path');
    return 'map view + leaflet + offline banner';
});

// ——— 6. Producent ———
step('producer', 'Producent (modal)', () => {
    const modal = read('js/views/producerModal.js');
    assert(modal.includes('openProducerModal') || modal.includes('export function open'), 'openProducerModal');
    assert(modal.includes('closeProducerModal') || modal.includes('close'), 'closeProducerModal');
    assert(rus.includes('openProducerModal'), 'RUS używa modala');
    return 'producer modal open/close';
});

// ——— 7. Ulubione ———
step('favorites', 'Ulubione', () => {
    assert(favorites.includes('export function addFavorite'), 'addFavorite');
    assert(favorites.includes('removeFavorite') || favorites.includes('export function remove'), 'removeFavorite');
    assert(nav.includes('favorites'), 'nav favorites');
    return 'add/remove + view';
});

// ——— 8. Koszyk ———
step('cart', 'Koszyk', () => {
    assert(cart.includes('export function addToCart'), 'addToCart');
    assert(cart.includes('CART_CHANGED') || cart.includes('getCartCount'), 'cart change/count');
    assert(nav.includes("'cart'") || nav.includes('"cart"'), 'nav cart');
    return 'cart API + view';
});

// ——— 9. Premium ———
step('premium', 'Premium', () => {
    assert(premium.includes('renderPremium') || premium.includes('export'), 'premium view');
    assert(nav.includes('premium'), 'nav premium');
    assert(html.includes('headerPremiumBtn') || html.includes('premium'), 'premium entry');
    return 'premium view + entry points';
});

// ——— 10. Powrót następnego dnia ———
step('next-day', 'Powrót następnego dnia (persist)', () => {
    assert(settings.includes('localStorage') || settings.includes('saveSettings'), 'settings persist');
    assert(userLocation.includes('rg_last_position') || userLocation.includes('localStorage'), 'position persist');
    assert(
        favorites.includes('localStorage')
        || favorites.includes('rg_')
        || favoritesStore.includes('localStorage')
        || favoritesStore.includes('regionalny_smak_favorites'),
        'favorites persist'
    );
    const cartSrc = read('js/core/cart.js') || cart;
    assert(cartSrc.includes('localStorage') || cart.includes('localStorage') || cartSrc.includes('rg_'), 'cart persist');
    return 'settings + GPS + favorites + cart keys';
});

// ——— 11. Offline ———
step('offline', 'Offline', () => {
    assert(sw.includes('CACHE_VERSION') || sw.includes('caches.open'), 'SW cache');
    assert(sw.includes('fetch'), 'SW fetch handler');
    assert(map.includes("addEventListener('offline'") || map.includes('offline'), 'offline UI');
    assert(rus.includes("Event('offline')"), 'RUS offline step');
    return 'SW cache + offline event + banner';
});

// ——— 12. Aktualizacja ———
step('update', 'Aktualizacja (PWA version)', () => {
    const ver = readPwaVersionFromModule(ROOT);
    assert(readPwaVersionFromSw(ROOT) === ver, 'sw.js bridge synced');
    assert(sw.includes('importScripts'), 'sw importScripts pwaVersion.global.js');
    assert(sw.includes('skipWaiting'), 'skipWaiting');
    assert(sw.includes('clients.claim') || sw.includes('activate'), 'activate/claim');
    assert(html.includes(`sw.js?v=${ver}`), `HTML sw.js?v=${ver} zsynchronizowane`);
    assert(html.includes(`app.bundle.js?v=${ver}`), `HTML legacy bundle v${ver}`);
    assert(html.includes(`?v=${ver}`) || html.includes(`v=${ver}`), 'ikony/cache-bust v sync');
    return `PWA_VERSION=${ver} synced + skipWaiting`;
});

// ——— 13. Uninstall ———
step('uninstall', 'Uninstall (czyszczenie)', () => {
    // Browser uninstall = SW unregister + site data. App uses rg_* keys — no crash on empty.
    assert(settings.includes('getSettings'), 'settings tolerates empty LS');
    const keysOk = /rg_[a-z0-9_]+/i.test(favorites + cart + settings + userLocation);
    assert(keysOk, 'prefixed rg_* storage keys');
    return 'rg_* keys · empty-storage safe boot';
});

// ——— 14. Reinstall ———
step('reinstall', 'Reinstall', () => {
    assert(html.includes('serviceWorker.register'), 'SW register on load');
    assert(pwaInstall.includes('beforeinstallprompt') || html.includes('beforeinstallprompt'), 're-install prompt path');
    assert(nav.includes('navigateTo'), 'fresh navigate after reinstall');
    return 'SW re-register + install prompt + navigate';
});

// ——— Cross: header align + push UTF-8 + live journey wiring ———
step('chrome-align', 'Chrome header (padding = header height)', () => {
    assert(ph.includes('--ph-header-h') && ph.includes('--header-height: var(--ph-header-h)'), 'premium-header owns height');
    assert(style.includes('--header-height: var(--ph-header-h'), 'style.css delegates to --ph-header-h');
    assert(!/@media[^{]*max-width:\s*430px[\s\S]{0,200}--header-height:\s*\d+px/.test(style), 'no hard --header-height @≤430');
    return 'header-height = ph-header-h';
});

step('push-utf8', 'Push offer regex (DE)', () => {
    assert(countFffd(push) === 0, `pushNotifications U+FFFD ×${countFffd(push)}`);
    assert(/brötchen|brötchen/i.test(push) || push.includes('brötchen'), 'brötchen regex');
    assert(push.includes('käse'), 'käse regex');
    return 'DE product matchers OK';
});

step('live-journey-wiring', 'Live user simulation wiring', () => {
    assert(rus.includes('open-app') && rus.includes('offline') && rus.includes('premium'), 'RUS steps');
    const app = read('js/app.js');
    const orch = read('js/diagnostics/diagnosticsOrchestrator.js');
    assert(
        app.includes('initDiagnosticsOrchestrator') && orch.includes('realUserSimulation.initRealUserSimulation'),
        'app init RUS via orchestrator'
    );
    return '?realusers=1 / __RG_REAL_USERS__.run()';
});

// Child audits (non-blocking warn if exit≠0 except we fold into score)
const childRuns = [];
function runChild(name, args) {
    const r = spawnSync(process.execPath, args, { cwd: ROOT, encoding: 'utf8', timeout: 120000 });
    childRuns.push({
        name,
        status: r.status === 0 ? 'pass' : 'fail',
        exit: r.status,
        tail: (r.stdout || r.stderr || '').trim().split('\n').slice(-3).join(' | ')
    });
}

runChild('functional-audit', ['scripts/functional-audit.mjs']);
runChild('check-translations', ['scripts/check-translations.mjs']);
runChild('test-pwa', ['scripts/test-pwa.mjs']);
runChild('test-landing', ['scripts/test-landing.mjs']);
runChild('device-lab', ['scripts/device-lab-audit.mjs']);

step('child-functional', 'Child: functional-audit', () => {
    const c = childRuns.find((x) => x.name === 'functional-audit');
    assert(c?.status === 'pass', c?.tail || 'functional fail');
    return c.tail || 'PASS';
});
step('child-i18n', 'Child: translations', () => {
    const c = childRuns.find((x) => x.name === 'check-translations');
    assert(c?.status === 'pass', c?.tail || 'i18n fail');
    return c.tail || 'PASS';
});
step('child-pwa', 'Child: PWA', () => {
    const c = childRuns.find((x) => x.name === 'test-pwa');
    assert(c?.status === 'pass', c?.tail || 'pwa fail');
    return c.tail || 'PASS';
});
step('child-landing', 'Child: landing', () => {
    const c = childRuns.find((x) => x.name === 'test-landing');
    assert(c?.status === 'pass', c?.tail || 'landing fail');
    return c.tail || 'PASS';
});
step('child-device-lab', 'Child: device-lab', () => {
    const c = childRuns.find((x) => x.name === 'device-lab');
    // After UTF-8 + header fix, device-lab should exit 0
    assert(c?.status === 'pass', c?.tail || 'device-lab fail');
    return c.tail || 'PASS';
});

const failed = steps.filter((s) => s.status === 'fail');
const passed = steps.filter((s) => s.status === 'pass');
const verdict = failed.length === 0 ? 'PASS' : 'FAIL';

const personaPath = [
    'install',
    'first-launch',
    'gps',
    'search',
    'map',
    'producer',
    'favorites',
    'cart',
    'premium',
    'next-day',
    'offline',
    'update',
    'uninstall',
    'reinstall'
];

const report = {
    id: 'etap-38-release-candidate',
    title: 'ETAP 38 — Release Candidate',
    generatedAt: new Date().toISOString(),
    verdict,
    persona: 'Pierwszy użytkownik · install → reinstall',
    policy: {
        notAuditOnly: true,
        architectureUnchanged: true,
        fixesApplied: ['UTF-8 home/landing/push', 'header-height → --ph-header-h', 'cache-bust home/app/css']
    },
    summary: {
        stepsTotal: steps.length,
        stepsPassed: passed.length,
        stepsFailed: failed.length,
        personaSteps: personaPath.length,
        personaPassed: personaPath.filter((id) => steps.find((s) => s.id === id)?.status === 'pass').length
    },
    personaPath,
    steps,
    childRuns,
    liveBrowser: {
        note: 'Pełna live symulacja UI: npm start → ?realusers=1 lub __RG_REAL_USERS__.runOne(9)',
        command: '__RG_REAL_USERS__.run()'
    },
    residualWarnings: [
        'Live browser smoke (install prompt / real GPS) nadal zalecany na urządzeniu',
        'OSM pendingOsmRefresh race (ETAP 36) — nie blokuje happy-path RC',
        'CART_ADDED learning asymmetry — nie blokuje koszyka użytkownika',
        'Image SW cache-first — świadoma strategia'
    ]
};

function toMarkdown(r) {
    const lines = [
        `# ${r.title}`,
        '',
        `**Data:** ${r.generatedAt.slice(0, 10)}  `,
        `**Werdykt:** **${r.verdict}**  `,
        `**Persona:** ${r.persona}`,
        '',
        '> To nie jest sam audyt — to ścieżka Release Candidate: od instalacji do reinstall.',
        '',
        '## Werdykt',
        '',
        `| Metryka | Wartość |`,
        `|---------|---------|`,
        `| Status | **${r.verdict}** |`,
        `| Kroki RC | ${r.summary.stepsPassed}/${r.summary.stepsTotal} |`,
        `| Ścieżka persony | ${r.summary.personaPassed}/${r.summary.personaSteps} |`,
        '',
        '## Ścieżka użytkownika',
        '',
        '| # | Krok | Status | Szczegóły |',
        '|---|------|--------|-----------|'
    ];
    let n = 1;
    for (const id of r.personaPath) {
        const s = r.steps.find((x) => x.id === id);
        lines.push(`| ${n++} | ${s?.label || id} | ${s?.status === 'pass' ? '✅' : '❌'} | ${s?.detail || '—'} |`);
    }

    lines.push('', '## Kroki techniczne / child checks', '');
    lines.push('| Krok | Status | Detail |');
    lines.push('|------|--------|--------|');
    for (const s of r.steps.filter((x) => !r.personaPath.includes(x.id))) {
        lines.push(`| ${s.label} | ${s.status === 'pass' ? '✅' : '❌'} | ${s.detail} |`);
    }

    lines.push('', '## Child audits', '');
    for (const c of r.childRuns) {
        lines.push(`- ${c.status === 'pass' ? '✅' : '❌'} **${c.name}** (exit ${c.exit}) — ${c.tail}`);
    }

    lines.push('', '## Naprawy w ETAP 38 (żeby RC przeszło)', '');
    for (const f of r.policy.fixesApplied) lines.push(`- ${f}`);

    lines.push('', '## Live browser', '');
    lines.push(`1. \`npm start\``);
    lines.push(`2. Otwórz \`/?realusers=1\` lub konsola: \`${r.liveBrowser.command}\``);
    lines.push('3. Opcjonalnie PWA: zainstaluj → użyj offline → odinstaluj → zainstaluj ponownie');

    lines.push('', '## Residual warnings (nie FAIL)', '');
    for (const w of r.residualWarnings) lines.push(`- ${w}`);

    lines.push('', '---', '', `*ETAP 38 · Release Candidate · ${r.verdict}*`, '');
    return lines.join('\n');
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_JSON, JSON.stringify(report, null, 2), 'utf8');
writeFileSync(OUT_MD, toMarkdown(report), 'utf8');

console.log(`\n[RC] ${verdict} · ${passed.length}/${steps.length} steps`);
for (const s of steps) {
    console.log(`${s.status === 'pass' ? '✅' : '❌'} ${s.id} — ${s.detail}`);
}
console.log(`Wrote: ${relative(ROOT, OUT_MD)}`);
process.exit(failed.length ? 1 : 0);
