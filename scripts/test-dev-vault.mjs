/**
 * Smoke: ukryty panel deweloperski (hasło → vault, bez FAB na Home/Mapie)
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function assert(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error(`FAIL ${msg}`);
    } else {
        console.log(`OK   ${msg}`);
    }
}

const session = new Map();
globalThis.sessionStorage = {
    getItem: (k) => (session.has(k) ? session.get(k) : null),
    setItem: (k, v) => session.set(k, String(v)),
    removeItem: (k) => session.delete(k)
};

const local = new Map();
globalThis.localStorage = {
    getItem: (k) => (local.has(k) ? local.get(k) : null),
    setItem: (k, v) => local.set(k, String(v)),
    removeItem: (k) => local.delete(k)
};

const {
    DEV_VAULT_PASSWORD,
    DEV_VAULT_SESSION_KEY,
    DEV_VAULT_FAILED_ATTEMPTS_KEY,
    DEV_VAULT_LOCK_UNTIL_KEY,
    DEV_VAULT_PIN_MASK,
    isDevVaultUnlocked,
    unlockDevVault,
    lockDevVault,
    isDevVaultAccessLocked,
    getDevVaultFailedAttempts,
    resetDevVaultLock,
    getDevVaultLockMessage
} = await import(pathToFileURL(join(ROOT, 'js/diagnostics/devVault.js')).href);

assert(DEV_VAULT_PASSWORD === '1973', 'password is 1973');
assert(DEV_VAULT_PIN_MASK.length === 20, 'PIN mask is 20 dots');
assert(DEV_VAULT_SESSION_KEY === 'rg_dev_vault_ok', 'session key');
assert(!isDevVaultUnlocked(), 'locked by default');
assert(!unlockDevVault('0000').ok, 'rejects wrong password');
assert(getDevVaultFailedAttempts() === 1, 'first failed attempt counted');
assert(!isDevVaultAccessLocked(), 'not locked after one failure');
assert(!unlockDevVault('0000').ok, 'rejects second wrong password');
assert(isDevVaultAccessLocked(), 'locked after two failures');
assert(local.get(DEV_VAULT_LOCK_UNTIL_KEY), 'lockUntil stored');
assert(!unlockDevVault('1973').ok, 'correct PIN rejected while locked');
assert(unlockDevVault('1973').reason === 'locked', 'locked reason while blocked');
resetDevVaultLock();
assert(!isDevVaultAccessLocked(), 'reset clears lock');
assert(getDevVaultFailedAttempts() === 0, 'reset clears attempts');
assert(!isDevVaultUnlocked(), 'still locked after bad password');
assert(unlockDevVault('1973').ok, 'accepts 1973 after reset');
assert(isDevVaultUnlocked(), 'unlocked after 1973');
lockDevVault();
assert(!isDevVaultUnlocked(), 'locked again');
assert(getDevVaultLockMessage().includes('30 dni'), 'lock message mentions 30 days');

const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
assert(html.includes('data-side-menu-action="dev-vault"'), 'menu has dev-vault action');
assert(html.includes('data-i18n-menu="devVault"'), 'menu i18n key');
assert(html.includes('🔐'), 'menu lock icon');
assert(/js\/app\.js\?v=\d+/.test(html), 'app.js cache bust');
// vault na końcu menu (po contact)
const vaultIdx = html.indexOf('data-side-menu-action="dev-vault"');
const navEnd = html.indexOf('</nav>', vaultIdx);
assert(vaultIdx > 0 && navEnd > vaultIdx, 'vault item before </nav>');
assert(
    !html.slice(vaultIdx, navEnd).includes('data-side-menu-action="contact"'),
    'vault is after contact (end of menu)'
);

const sideMenu = readFileSync(join(ROOT, 'js/core/sideMenu.js'), 'utf8');
assert(sideMenu.includes("case 'dev-vault':"), 'sideMenu handles dev-vault');
assert(sideMenu.includes('openDeveloperVault'), 'sideMenu opens vault');
assert(sideMenu.includes("'dev-vault': 'devVault'"), 'ACTION_MENU_KEYS has devVault');
assert(sideMenu.includes('data-menu-dev-panel'), 'dev panel always visible in menu');
assert(sideMenu.includes('applyDeveloperPanelMenuVisibility'), 'dev panel visibility helper');
assert(!/INTERNAL_MENU_ACTIONS[^\n]*dev-vault/.test(sideMenu), 'dev-vault not in INTERNAL_MENU_ACTIONS');

const devVaultMod = readFileSync(join(ROOT, 'js/diagnostics/devVault.js'), 'utf8');
assert(devVaultMod.includes('isDeveloperAccessGranted'), 'canonical access API');
assert(devVaultMod.includes('devVault_failedAttempts'), 'failed attempts key');
assert(devVaultMod.includes('devVault_lockUntil'), 'lock until key');
assert(devVaultMod.includes('resetDevVaultLock'), 'owner reset API');

const rm = readFileSync(join(ROOT, 'js/diagnostics/reportManagerClient.js'), 'utf8');
assert(rm.includes('isDeveloperAccessGranted'), 'docs fetch gated by PIN only');
assert(!/isDevMode\(\)\s*&&\s*isDevVaultUnlocked/.test(rm), 'docs fetch not tied to isDevMode');
assert(rm.includes('normalizeStreamStatus'), 'stream status normalization');
assert(rm.includes('enrichStreamStatuses'), 'stream status enrichment');
assert(rm.includes('STREAM_STATUS_META'), 'stream status meta map');
assert(rm.includes('canFetchDocsRuntime'), 'docs fetch gated');
assert(!/replace\(\/\\\.md\$\/i, '\\.json'\)/.test(rm), 'no md→json status fetch spam');

const health = readFileSync(join(ROOT, 'js/diagnostics/healthDevPanel.js'), 'utf8');
assert(health.includes('isDevVaultUnlocked'), 'health gated by vault');
assert(health.includes('if (!force && !isDevVaultUnlocked()) return'), 'health skips without unlock');
assert(health.includes('showFab = false'), 'health defaults without FAB');

const dash = readFileSync(join(ROOT, 'js/diagnostics/developerDashboard.js'), 'utf8');
assert(dash.includes('isDevVaultUnlocked'), 'dev dashboard gated by vault');
assert(dash.includes('if (!force && !isDevVaultUnlocked())'), 'dev skips without unlock');
assert(dash.includes('showFab = false'), 'dev defaults without FAB');

const vault = readFileSync(join(ROOT, 'js/diagnostics/developerVaultPanel.js'), 'utf8');
assert(vault.includes('showPasswordGate'), 'password gate');
assert(vault.includes('Developer Control Center'), 'Control Center title');
assert(vault.includes('loadUnifiedReportStream'), 'unified report stream');
assert(vault.includes('renderDeveloperDashboard'), 'developer dashboard view');
assert(vault.includes('System Health'), 'system health section');
assert(vault.includes('buildDevStatusBoard'), 'status metrics from devStatusBoard');
assert(vault.includes('rg-dv-metrics-grid'), 'metric tiles grid');
assert(vault.includes('Brak raportów do wyświetlenia.'), 'empty stream message');
assert(vault.includes('rg-dv-report-tag'), 'category badge on entries');
assert(vault.includes('rg-dv-status-badge'), 'status badge on entries');
assert(vault.includes('getStreamStatusMeta'), 'stream status meta helper');
assert(!vault.includes('data-dv-tab='), 'no tab navigation');
assert(!vault.includes('loadControlCenterMetrics'), 'no legacy metrics dashboard');
assert(!vault.includes('renderSection('), 'no tab sections');
assert(vault.includes('stripMainUiDevTools'), 'strips FAB from main UI');
assert(!vault.includes('mountUnlockedTools'), 'does not remount FABs on unlock');
assert(!vault.includes('autoApply: true'), 'no autoApply true');
assert(!/AI Chat|openAiChat|chatbotUi/i.test(vault), 'no AI chat feature');
assert(vault.includes('DEV_VAULT_PIN_MASK'), 'PIN visual mask');
assert(vault.includes('isDevVaultAccessLocked'), 'lock check in panel');
assert(vault.includes('getDevVaultLockMessage'), 'lock message in panel');
assert(vault.includes('bindOwnerLockReset'), 'owner long-press reset');
assert(vault.includes('resetLock: resetDevVaultLock'), 'console reset export');
assert(vault.includes('rg-dv-pin-visual'), '20-dot visual hint');
assert(vault.includes('rg-dv-lock-msg'), 'lock message styling');
assert(vault.includes('Kopiuj raport'), '34C copy report');
assert(vault.includes('loadStreamEntryPreview'), 'report preview loader');
assert(vault.includes('data-dv-preview'), 'report preview modal');
assert(vault.includes('simpleMarkdownToHtml'), 'markdown preview formatting');
assert(vault.includes('Usuń raport'), '34C delete report');
assert(vault.includes('reportManagerClient'), '34C client import');
assert(rm.includes('filterDeveloperVaultStream'), 'stream filter helper');
assert(rm.includes('NON_CORE_STREAM_STATUSES'), 'non-core status blocklist');

const {
    filterDeveloperVaultStream,
    STREAM_STATUS
} = await import(pathToFileURL(join(ROOT, 'js/diagnostics/reportManagerClient.js')).href);

const sampleStream = [
    { streamId: '1', streamStatus: STREAM_STATUS.FIXED, rawStreamStatus: 'FIXED' },
    { streamId: '2', streamStatus: STREAM_STATUS.INFO, rawStreamStatus: 'DEBUG' },
    { streamId: '3', streamStatus: STREAM_STATUS.INFO, rawStreamStatus: 'INFO' }
];
const filtered = filterDeveloperVaultStream(sampleStream);
assert(filtered.length === 2, 'filter hides DEBUG/CACHE-style raw statuses');
assert(filtered.every((e) => e.streamId !== '2'), 'DEBUG entry hidden');
assert(filterDeveloperVaultStream(sampleStream, { showAll: true }).length === 3, 'showAll bypasses filter');

assert(vault.includes('filterDeveloperVaultStream'), 'report stream filter');
assert(vault.includes('data-dv-report-show-all'), 'show-all toggle');
assert(vault.includes('devVaultSuggestions'), 'suggestion control module');
assert(vault.includes('Wprowadź zmianę'), 'apply button label');
assert(vault.includes('Odrzuć zmianę'), 'reject button label');
assert(vault.includes('data-dv-clear-reports'), 'clear old reports button');
assert(vault.includes('clearLocalDeveloperReports'), 'local report cleanup');
assert(vault.includes('rg_app_health_report_v1'), 'health report storage key');
assert(vault.includes('selfHealingLog'), 'self healing log key');
assert(vault.includes('enrichStreamEntriesWithDescriptions'), 'md excerpt enrichment');
const suggMod = readFileSync(join(ROOT, 'js/diagnostics/devVaultSuggestions.js'), 'utf8');
assert(vault.includes('getStreamEntryApplyMeta'), 'FAILED apply meta helper');
assert(suggMod.includes('Proponowana naprawa'), 'proposed fix hint');
assert(suggMod.includes('Wymaga ręcznej analizy kodu'), 'manual analysis hint');
assert(suggMod.includes('Naprawa zatwierdzona przez użytkownika'), 'owner approved note');

const i18n = readFileSync(join(ROOT, 'js/translations-dev-vault.js'), 'utf8');
assert(i18n.includes('Panel deweloperski'), 'PL title');
assert(i18n.includes('tabReports'), 'reports i18n');

const improve = readFileSync(join(ROOT, 'js/diagnostics/improvementEngine.js'), 'utf8');
assert(improve.includes('if (isDevMode())') && improve.includes('maybeGenerateDailyImprovementReport'), 'improvement daily gated');

const advisor = readFileSync(join(ROOT, 'js/diagnostics/projectAdvisor.js'), 'utf8');
assert(advisor.includes('if (isDevMode())') && advisor.includes('maybeGenerateDailyAdvisorBriefing'), 'advisor daily gated');

const app = readFileSync(join(ROOT, 'js/app.js'), 'utf8');
assert(app.includes('initDiagnosticsOrchestrator'), 'app uses diagnostics orchestrator');
assert(!app.includes('initHealthMonitor()'), 'health monitor not eager in app.js');
assert(
    app.indexOf('initDiagnosticsOrchestrator()') < app.indexOf('window.navigateTo'),
    'orchestrator before test exports'
);

if (failed) {
    console.error(`\n${failed} failure(s)`);
    process.exit(1);
}
console.log('\nAll dev-vault checks passed.');
