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

const {
    DEV_VAULT_PASSWORD,
    DEV_VAULT_SESSION_KEY,
    isDevVaultUnlocked,
    unlockDevVault,
    lockDevVault
} = await import(pathToFileURL(join(ROOT, 'js/diagnostics/devVault.js')).href);

assert(DEV_VAULT_PASSWORD === '1973', 'password is 1973');
assert(DEV_VAULT_SESSION_KEY === 'rg_dev_vault_ok', 'session key');
assert(!isDevVaultUnlocked(), 'locked by default');
assert(!unlockDevVault('0000').ok, 'rejects wrong password');
assert(!isDevVaultUnlocked(), 'still locked after bad password');
assert(unlockDevVault('1973').ok, 'accepts 1973');
assert(isDevVaultUnlocked(), 'unlocked after 1973');
lockDevVault();
assert(!isDevVaultUnlocked(), 'locked again');

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
assert(vault.includes('unlockDevVault'), 'keeps PIN unlock');
assert(vault.includes('Kopiuj raport'), '34C copy report');
assert(vault.includes('loadStreamEntryPreview'), 'report preview loader');
assert(vault.includes('data-dv-preview'), 'report preview modal');
assert(vault.includes('simpleMarkdownToHtml'), 'markdown preview formatting');
assert(vault.includes('Usuń raport'), '34C delete report');
assert(vault.includes('reportManagerClient'), '34C client import');
assert(vault.includes('purgeExpiredReports') || vault.includes('loadUnifiedReportStream'), '30-day retention via stream load');

const rm = readFileSync(join(ROOT, 'js/diagnostics/reportManagerClient.js'), 'utf8');
assert(rm.includes('normalizeStreamStatus'), 'stream status normalization');
assert(rm.includes('enrichStreamStatuses'), 'stream status enrichment');
assert(rm.includes('STREAM_STATUS_META'), 'stream status meta map');
assert(rm.includes('loadStreamEntryPreview'), 'stream entry preview loader');

const i18n = readFileSync(join(ROOT, 'js/translations-dev-vault.js'), 'utf8');
assert(i18n.includes('Panel deweloperski'), 'PL title');
assert(i18n.includes('tabReports'), 'reports i18n');

const app = readFileSync(join(ROOT, 'js/app.js'), 'utf8');
assert(app.includes('initDeveloperVault'), 'app inits vault');
assert(
    app.indexOf('initDeveloperVault()') < app.indexOf('initHealthDevPanel()'),
    'vault before Health init'
);

if (failed) {
    console.error(`\n${failed} failure(s)`);
    process.exit(1);
}
console.log('\nAll dev-vault checks passed.');
