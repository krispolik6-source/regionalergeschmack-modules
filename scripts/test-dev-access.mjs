/**
 * ZADANIE C — jeden mechanizm dostępu do panelu deweloperskiego (PIN).
 * Run: npm run check:dev-access
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function ok(msg) {
    console.log(`✅ ${msg}`);
}

function fail(msg) {
    failed += 1;
    console.error(`❌ ${msg}`);
}

const session = new Map();
globalThis.sessionStorage = {
    getItem: (k) => (session.has(k) ? session.get(k) : null),
    setItem: (k, v) => session.set(k, String(v)),
    removeItem: (k) => session.delete(k)
};

const devVault = await import(pathToFileURL(join(ROOT, 'js/diagnostics/devVault.js')).href);
const { isDeveloperAccessGranted, isDevVaultUnlocked, unlockDevVault, lockDevVault } = devVault;

if (!isDeveloperAccessGranted()) ok('domyślnie: brak dostępu bez PIN');
else fail('dostęp bez PIN');

unlockDevVault('1973');
if (isDeveloperAccessGranted() && isDevVaultUnlocked()) ok('PIN 1973 → access granted');
else fail('PIN nie odblokował dostępu');

lockDevVault();
if (!isDeveloperAccessGranted()) ok('lock → brak dostępu');
else fail('lock nie zadziałał');

const sideMenu = readFileSync(join(ROOT, 'js/core/sideMenu.js'), 'utf8');
const index = readFileSync(join(ROOT, 'index.html'), 'utf8');
const rm = readFileSync(join(ROOT, 'js/diagnostics/reportManagerClient.js'), 'utf8');
const vault = readFileSync(join(ROOT, 'js/diagnostics/developerVaultPanel.js'), 'utf8');

if (!sideMenu.includes("'dev-vault'") || !sideMenu.includes('INTERNAL_MENU_ACTIONS')) {
    fail('sideMenu structure');
} else if (sideMenu.includes("'dev-vault'") && /INTERNAL_MENU_ACTIONS\s*=\s*new Set\(\[[^\]]*'dev-vault'/.test(sideMenu)) {
    fail('dev-vault nie może być w INTERNAL_MENU_ACTIONS');
} else {
    ok('dev-vault poza INTERNAL_MENU_ACTIONS (bez localhost gate)');
}

if (sideMenu.includes('data-menu-dev-panel') && sideMenu.includes('applyDeveloperPanelMenuVisibility')) {
    ok('sideMenu: sekcja dev zawsze widoczna (PIN gate)');
} else fail('sideMenu: brak applyDeveloperPanelMenuVisibility');

if (index.includes('data-menu-dev-panel') && !index.includes('data-menu-internal hidden>🔐 Deweloper')) {
    ok('index.html: sekcja Deweloper bez data-menu-internal');
} else fail('index.html: dev section nadal za data-menu-internal');

if (rm.includes('isDeveloperAccessGranted') && !/isDevMode\(\)\s*&&\s*isDevVaultUnlocked/.test(rm)) {
    ok('reportManagerClient: /docs/ tylko po PIN (nie isDevMode)');
} else fail('reportManagerClient: nadal wymaga isDevMode');

if (vault.includes('showPasswordGate') && vault.includes('inputmode="numeric"')) {
    ok('vault: bramka PIN (mobile-friendly)');
} else fail('vault: bramka PIN');

if (vault.includes('ensureDiagnosticsLoaded') && !vault.includes('initHealthDevPanel({ force')) {
    ok('vault: init narzędzi po odblokowaniu PIN');
} else fail('vault: brak integracji orchestrator po unlock');

if (vault.includes('inset:0') && vault.includes('rg-dv-card')) {
    ok('vault CSS: fullscreen overlay + PIN card (mobile/PWA)');
} else {
    fail('vault CSS: brak layout mobile/PWA');
}

if (!sideMenu.includes('devVault.prodOnly')) ok('sideMenu: brak prodOnly toast dla dev-vault');
else fail('sideMenu: nadal prodOnly dla dev-vault');

console.log(failed ? `\nDEV ACCESS TEST FAILED (${failed})` : '\nDEV ACCESS TEST OK');
process.exit(failed ? 1 : 0);
