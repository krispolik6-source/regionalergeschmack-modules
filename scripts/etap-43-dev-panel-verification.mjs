/**
 * ETAP 43 · Zadanie 5 — weryfikacja panelu deweloperskiego
 * Run: npm run check:dev-panel
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { statusIcon, statusLabel } from './lib/cert-check.mjs';
import { buildGateReport, gateExitCode, runtimeFromManual } from './lib/cert-report.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_MD = join(ROOT, 'docs', 'certification', 'DEV-PANEL-VERIFICATION.md');
const OUT_JSON = join(ROOT, 'docs', 'certification', 'DEV-PANEL-VERIFICATION.json');

function read(rel) {
    const p = join(ROOT, rel);
    return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

const V = read('js/core/pwaVersion.js').match(/PWA_VERSION = '(\d+)'/)?.[1] || '?';
let failed = 0;

function check(id, group, label, cond, detail = '', layer = 'static') {
    if (layer === 'runtime') {
        return { id, group, label, status: 'not_verified', detail, layer: 'runtime' };
    }
    const ok = Boolean(cond);
    if (!ok) failed += 1;
    return { id, group, label, status: ok ? 'pass' : 'fail', detail, layer: 'static' };
}

const devVault = read('js/diagnostics/devVault.js');
const vault = read('js/diagnostics/developerVaultPanel.js');
const orch = read('js/diagnostics/diagnosticsOrchestrator.js');
const sideMenu = read('js/core/sideMenu.js');
const index = read('index.html');
const app = read('js/app.js');
const feed = read('js/diagnostics/runtimeErrorFeed.js');
const guardian = read('js/diagnostics/consoleGuardian.js');
const profiler = read('js/core/bootstrapProfiler.js');
const statusBoard = read('js/diagnostics/devStatusBoard.js');
const rm = read('js/diagnostics/reportManagerClient.js');

const checks = [];

// ——— Środowiska ———
checks.push(check(
    'E01-phone',
    'env:telefon',
    'Telefon — PIN mobile-friendly + fullscreen vault',
    vault.includes('inputmode="numeric"') && vault.includes('inset:0') && vault.includes('rg-dv-card'),
    'numeric PIN · overlay fullscreen · rg-dv-card'
));

checks.push(check(
    'E02-desktop',
    'env:desktop',
    'Desktop — ten sam panel (bez viewport gate)',
    !devVault.includes('matchMedia') && !vault.includes('isDesktop') && sideMenu.includes('openDeveloperVault'),
    'brak gate viewport · menu → openDeveloperVault'
));

checks.push(check(
    'E03-pwa',
    'env:PWA',
    'PWA standalone — dev-vault poza INTERNAL_MENU_ACTIONS',
    sideMenu.includes("'dev-vault'")
        && !/INTERNAL_MENU_ACTIONS[^\n]*dev-vault/.test(sideMenu),
    'dev-vault nie w INTERNAL_MENU_ACTIONS · PIN na PWA'
));

checks.push(check(
    'E04-lan',
    'env:LAN',
    'LAN — auto-load diagnostyki (192.168.x / 10.x / 172.16–31)',
    orch.includes('isPrivateLanHost') && orch.includes('192\\.168') && /isLocalhost\(\) \|\| isPrivateLanHost\(\)/.test(orch),
    'shouldAutoLoadDiagnostics: localhost OR private LAN'
));

checks.push(check(
    'E05-production',
    'env:produkcja',
    'Produkcja — shell only do PIN; pełna diag po unlock',
    orch.includes('if (isProductionHost()) return false')
        && orch.includes('productionShellOnly: true')
        && orch.includes('rg:dev-vault-unlocked'),
    'prod: brak auto-load · PIN → ensureDiagnosticsLoaded'
));

checks.push(check(
    'E06-menu-always',
    'env:wszystkie',
    'Menu Deweloper widoczne wszędzie',
    index.includes('data-menu-dev-panel') && !index.includes('data-menu-internal hidden>🔐 Deweloper')
        && sideMenu.includes('applyDeveloperPanelMenuVisibility'),
    'sekcja 🔐 Deweloper bez data-menu-internal'
));

// ——— PIN ———
checks.push(check(
    'F01-pin-api',
    'feature:PIN',
    'Kanoniczna bramka isDeveloperAccessGranted',
    devVault.includes('isDeveloperAccessGranted') && devVault.includes("DEV_VAULT_PASSWORD = '1973'"),
    'sessionStorage rg_dev_vault_ok · PIN 1973'
));

checks.push(check(
    'F02-pin-gate',
    'feature:PIN',
    'Bramka PIN w vault + dispatch unlock',
    vault.includes('showPasswordGate') && vault.includes('unlockDevVault')
        && vault.includes("CustomEvent('rg:dev-vault-unlocked')"),
    'showPasswordGate → unlock → rg:dev-vault-unlocked'
));

checks.push(check(
    'F03-pin-docs',
    'feature:PIN',
    'Raporty /docs/ tylko po PIN',
    rm.includes('isDeveloperAccessGranted') && !/isDevMode\(\)\s*&&\s*isDevVaultUnlocked/.test(rm),
    'reportManagerClient · canFetchDocsRuntime'
));

// ——— Runtime Error Feed ———
checks.push(check(
    'F04-error-feed',
    'feature:Runtime Error Feed',
    'Feed UI + max 100 + vault gate',
    feed.includes('MAX_ERRORS') && feed.includes('isDeveloperAccessGranted')
        && feed.includes('openRuntimeErrorFeedPanel'),
    'runtimeErrorFeed.js · tylko po PIN'
));

checks.push(check(
    'F05-error-feed-vault',
    'feature:Runtime Error Feed',
    'Przycisk w Dev Vault + Console tile',
    vault.includes('data-dv-error-feed') && vault.includes('Runtime Error Feed'),
    'hub button · Console metric clickable'
));

checks.push(check(
    'F06-error-feed-lazy',
    'feature:Runtime Error Feed',
    'Lazy init przez orchestrator',
    orch.includes('runtimeErrorFeed.initRuntimeErrorFeed'),
    'ensureDiagnosticsLoaded → initRuntimeErrorFeed'
));

// ——— Console Guardian ———
checks.push(check(
    'F07-guardian-boot',
    'feature:Console Guardian',
    'Boot na starcie (wszystkie środowiska)',
    app.includes('initConsoleGuardian()') && app.indexOf('initConsoleGuardian') < app.indexOf('async function bootstrap'),
    'app.js top-level · przed bootstrap()'
));

checks.push(check(
    'F08-guardian-collector',
    'feature:Console Guardian',
    'Runtime Error Collector z Guardian',
    guardian.includes('initRuntimeErrorCollector()') && guardian.includes('setConsoleCaptureHook'),
    'consoleGuardian → runtimeErrorCollector'
));

checks.push(check(
    'F09-guardian-status',
    'feature:Console Guardian',
    'Metryka Console w status board',
    statusBoard.includes('getGuardianReports') && statusBoard.includes("key: 'Console'"),
    'devStatusBoard · Console errors count'
));

checks.push(check(
    'F10-guardian-prod-silent',
    'feature:Console Guardian',
    'Produkcja: cisza w konsoli + lokalny raport',
    guardian.includes('productionSilent') && guardian.includes('zeroConsoleNoiseOnProduction'),
    '__RG_CONSOLE_GUARDIAN__ · LS reports'
));

// ——— Bootstrap Report ———
checks.push(check(
    'F11-bootstrap-profiler',
    'feature:Bootstrap Report',
    'Bootstrap Profiler w app.js',
    app.includes('startBootstrapProfile') && app.includes('finishBootstrapProfile')
        && app.includes('recordBootstrapInit'),
    'start/finish profile · init tracking'
));

checks.push(check(
    'F12-bootstrap-api',
    'feature:Bootstrap Report',
    'Global API __RG_BOOTSTRAP__.report()',
    profiler.includes('__RG_BOOTSTRAP__') && profiler.includes('report:') && profiler.includes('rg_bootstrap_profile_v1'),
    'localStorage + window API'
));

checks.push(check(
    'F13-bootstrap-orchestrator',
    'feature:Bootstrap Report',
    'Orchestrator mierzy lazy-load',
    orch.includes('profileLazyDiagnosticsLoad') && orch.includes('recordBootstrapInit'),
    'lazy diagnostics timing w raporcie'
));

checks.push(check(
    'F14-bootstrap-docs',
    'feature:Bootstrap Report',
    'Raport CLI docs/bootstrap/latest',
    existsSync(join(ROOT, 'docs/bootstrap/latest.md')) && existsSync(join(ROOT, 'docs/bootstrap/latest.json')),
    'docs/bootstrap/latest.md · latest.json'
));

// ——— Diagnostics Orchestrator ———
checks.push(check(
    'F15-orch-boot',
    'feature:Diagnostics Orchestrator',
    'Jeden eager init: initDeveloperVault',
    app.includes('initDiagnosticsOrchestrator()') && !app.includes('initHealthMonitor()'),
    'app.js · brak eager 19 modułów'
));

checks.push(check(
    'F16-orch-lazy',
    'feature:Diagnostics Orchestrator',
    'Lazy load 19 modułów',
    orch.includes('ensureDiagnosticsLoaded') && (orch.match(/import\('\.\//g) || []).length >= 15,
    'dynamic import · modules: 19'
));

checks.push(check(
    'F17-orch-api',
    'feature:Diagnostics Orchestrator',
    'Global API __RG_DIAGNOSTICS__',
    orch.includes('__RG_DIAGNOSTICS__') && orch.includes('shouldAutoLoad: shouldAutoLoadDiagnostics'),
    'load() · loaded() · policy'
));

checks.push(check(
    'F18-orch-vault',
    'feature:Diagnostics Orchestrator',
    'Vault integracja po PIN',
    vault.includes('ensureDiagnosticsLoaded') && vault.includes("'vault-unlock'"),
    'unlock → ensureDiagnosticsLoaded → showHub'
));

// PIN runtime on real device — Node mock ≠ PWA/Safari sessionStorage
checks.push(check(
    'F19-pin-runtime',
    'feature:PIN',
    'Runtime: PIN 1973 na urządzeniu/PWA',
    false,
    'Node mock nie zastępuje telefonu · macierz manual E03',
    'runtime'
));

function runTest(cmd, args) {
    const r = spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', shell: true });
    return { ok: r.status === 0, exit: r.status ?? 1 };
}

console.log('[Dev Panel] Verification — ETAP 43 · Zadanie 5\n');

const automated = [];
for (const [label, cmd, args] of [
    ['dev-access', 'npm', ['run', 'check:dev-access']],
    ['dev-vault', 'npm', ['run', 'check:dev-vault']],
    ['runtime-error-feed', 'npm', ['run', 'check:runtime-error-feed']],
    ['diagnostics-orchestrator', 'npm', ['run', 'check:diagnostics-orchestrator']],
    ['console-guardian', 'npm', ['run', 'check:console-guardian']],
    ['bootstrap', 'npm', ['run', 'check:bootstrap']]
]) {
    process.stdout.write(`→ ${label}… `);
    const r = runTest(cmd, args);
    automated.push({ label, ...r });
    console.log(r.ok ? 'PASS' : `FAIL (${r.exit})`);
}

const envChecks = checks.filter((c) => c.group.startsWith('env:'));
const featureChecks = checks.filter((c) => c.group.startsWith('feature:'));

for (const c of checks) {
    process.stdout.write(`${statusIcon(c)} [${c.group}] ${c.label} · ${statusLabel(c)}\n`);
}

const manualMatrix = [
    { id: 'M-dev-phone', env: 'Telefon (Chrome/Safari)', steps: '☰ → Panel deweloperski → PIN 1973 → hub fullscreen', pass: 'PIN klawiatura numeryczna · Error Feed scroll · bez DevTools' },
    { id: 'M-dev-desktop', env: 'Desktop (Chrome/Edge/Firefox)', steps: 'To samo z menu · Console tile → Error Feed', pass: 'Hub + metryki System Health' },
    { id: 'M-dev-pwa', env: 'PWA standalone', steps: 'Zainstalowana PWA → menu → PIN → panel', pass: 'Działa bez localhost · sessionStorage per sesja' },
    { id: 'M-dev-lan', env: 'LAN (192.168.x)', steps: 'http://LAN:port → ?dev=1 opcjonalnie · PIN', pass: 'Auto-load diag na LAN · vault po PIN' },
    { id: 'M-dev-prod', env: 'Produkcja (Netlify)', steps: 'regionalergeschmack.* → PIN (bez ?dev=1)', pass: 'Shell at boot · pełny panel dopiero po PIN · __RG_BOOTSTRAP__.report() w konsoli po unlock/?dev=1' }
];

const gateItems = [...checks, ...runtimeFromManual(manualMatrix, (m) => m.env)];
const gate = buildGateReport({
    items: gateItems,
    automated,
    etap: '45-D-T5',
    extra: {
        generatedAt: new Date().toISOString(),
        pwaVersion: V,
        pin: '1973 (sessionStorage rg_dev_vault_ok)',
        environments: envChecks,
        features: featureChecks,
        manualMatrix,
        accessPolicy: {
            menu: 'always visible (data-menu-dev-panel)',
            panel: 'PIN only (isDeveloperAccessGranted)',
            prodAutoLoad: false,
            lanAutoLoad: true,
            localhostAutoLoad: true,
            devFlag: '?dev=1 or rg_dev_mode=1'
        },
        autoApply: false
    }
});
const { verdict, staticVerdict: staticVerdictStr, runtimeVerdict: runtimeVerdictStr, manualRequired } = gate;
const report = gate;

mkdirSync(join(ROOT, 'docs', 'certification'), { recursive: true });
writeFileSync(OUT_JSON, JSON.stringify(report, null, 2), 'utf8');

const md = `# Dev Panel Verification — ETAP 43 · Zadanie 5

**Data:** ${report.generatedAt.slice(0, 10)}  
**ETAP:** 45-D · Runtime Truth  
**Gate:** **${verdict}**  
**STATIC:** **${staticVerdictStr}**  
**RUNTIME:** **${runtimeVerdictStr}**  
**PIN:** \`1973\` · sesja: \`rg_dev_vault_ok\`

> **STATIC** = wiring PIN, orchestrator, importy. **RUNTIME** = PIN i panel na telefonie/PWA.

## Warstwy

| Warstwa | Werdykt | Szczegóły |
|---------|---------|-----------|
| **STATIC** | **${staticVerdictStr}** | ${report.static.passed}/${report.static.total} |
| **RUNTIME** | **${runtimeVerdictStr}** | ${report.runtime.pending} pending |
| Subprocess | ${report.automated.passed}/${report.automated.total} | 6 bramek |
| **Gate** | **${verdict}** | |

## Polityka dostępu

| Reguła | Wartość |
|--------|---------|
| Menu Deweloper | Zawsze widoczne (telefon · desktop · PWA · LAN · prod) |
| Pełny panel | Tylko po PIN \`1973\` |
| Auto-load diag (prod) | **Nie** — tylko powłoka vault |
| Auto-load diag (LAN/localhost/?dev=1) | **Tak** — lazy w tle |
| Console Guardian | Boot zawsze (prod: cisza w konsoli) |
| Bootstrap Report | \`__RG_BOOTSTRAP__.report()\` po starcie |

## Środowiska

| Środowisko | Status | Dowód |
|------------|--------|-------|
${envChecks.map((c) => `| ${c.group.replace('env:', '')} | ${statusLabel(c)} | ${c.detail} |`).join('\n')}

## Funkcje panelu

### PIN
${featureChecks.filter((c) => c.group === 'feature:PIN').map((c) => `- ${statusIcon(c)} ${c.label} · ${statusLabel(c)} — ${c.detail}`).join('\n')}

### Runtime Error Feed
${featureChecks.filter((c) => c.group === 'feature:Runtime Error Feed').map((c) => `- ${c.status === 'pass' ? '✅' : '❌'} ${c.label} — ${c.detail}`).join('\n')}

### Console Guardian
${featureChecks.filter((c) => c.group === 'feature:Console Guardian').map((c) => `- ${c.status === 'pass' ? '✅' : '❌'} ${c.label} — ${c.detail}`).join('\n')}

### Bootstrap Report
${featureChecks.filter((c) => c.group === 'feature:Bootstrap Report').map((c) => `- ${c.status === 'pass' ? '✅' : '❌'} ${c.label} — ${c.detail}`).join('\n')}

### Diagnostics Orchestrator
${featureChecks.filter((c) => c.group === 'feature:Diagnostics Orchestrator').map((c) => `- ${c.status === 'pass' ? '✅' : '❌'} ${c.label} — ${c.detail}`).join('\n')}

## Bramki automatyczne

| Test | Status |
|------|--------|
${automated.map((a) => `| ${a.label} | ${a.ok ? '✅ PASS' : '❌ FAIL'} |`).join('\n')}

## RUNTIME — macierz urządzeń

| Środowisko | Kroki | Pass |
|------------|-------|------|
${manualMatrix.map((m) => `| ${m.env} | ${m.steps} | ${m.pass} |`).join('\n')}

## Szybka ścieżka testu

1. ☰ menu → **Panel deweloperski** (🔐)
2. PIN: \`1973\`
3. **System Health** → kafelek **Console** lub przycisk **Runtime Error Feed**
4. Konsola (po unlock / \`?dev=1\`): \`__RG_BOOTSTRAP__.report()\`
5. Konsola: \`__RG_DIAGNOSTICS__.loaded()\` → \`true\` po lazy load
6. Konsola: \`__RG_CONSOLE_GUARDIAN__.reports()\`

## Pliki kluczowe

| Plik | Rola |
|------|------|
| \`js/diagnostics/devVault.js\` | PIN · sessionStorage |
| \`js/diagnostics/developerVaultPanel.js\` | UI hub · bramka PIN |
| \`js/diagnostics/diagnosticsOrchestrator.js\` | Lazy 19 modułów |
| \`js/diagnostics/runtimeErrorFeed.js\` | Error Feed UI |
| \`js/diagnostics/consoleGuardian.js\` | Capture console · prod silent |
| \`js/core/bootstrapProfiler.js\` | Bootstrap Report |
| \`js/core/sideMenu.js\` | Menu → dev-vault |

---
*ETAP 43-T5 · autoApply=false · uruchom: \`npm run check:dev-panel\`*
`;

writeFileSync(OUT_MD, md, 'utf8');

console.log(`\n[Dev Panel] ${staticVerdictStr} · ${runtimeVerdictStr} · gate ${verdict}`);
console.log(`Wrote: docs/certification/DEV-PANEL-VERIFICATION.md`);
process.exit(gateExitCode(verdict));
