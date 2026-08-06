/**
 * ETAP 42D — test orchestratora diagnostyki (lazy load).
 * Run: npm run check:diagnostics-orchestrator
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function ok(msg) {
    console.log(`✅ ${msg}`);
}

function fail(msg) {
    failed += 1;
    console.error(`❌ ${msg}`);
}

const app = readFileSync(join(ROOT, 'js/app.js'), 'utf8');
const orch = readFileSync(join(ROOT, 'js/diagnostics/diagnosticsOrchestrator.js'), 'utf8');
const vault = readFileSync(join(ROOT, 'js/diagnostics/developerVaultPanel.js'), 'utf8');

const EAGER_INITS = [
    'initHealthMonitor',
    'initSelfHealing',
    'initUiGuardian',
    'initMapGuardian',
    'initMemoryCleaner',
    'initHealthDevPanel',
    'initLearningEngine',
    'initImprovementEngine',
    'initVirtualUser',
    'initRealUserSimulation',
    'initEmotionAi',
    'initLivingBrand',
    'initProductDirector',
    'initProjectAdvisor',
    'initDailyDeveloperReport',
    'initDeveloperDashboard',
    'initWeeklyPremiumReport',
    'initSelfHealingLogger'
];

for (const name of EAGER_INITS) {
    if (!app.includes(`${name}(`)) ok(`app.js: brak eager ${name}()`);
    else fail(`app.js: nadal eager ${name}()`);
}

if (app.includes('initDiagnosticsOrchestrator()')) ok('app.js: initDiagnosticsOrchestrator');
else fail('app.js: brak initDiagnosticsOrchestrator');

if (app.includes("from './diagnostics/diagnosticsOrchestrator.js'")) ok('app.js: import orchestrator');
else fail('app.js: brak import orchestrator');

if (orch.includes('export async function ensureDiagnosticsLoaded') && orch.includes('import(')) {
    ok('orchestrator: dynamic import lazy load');
} else fail('orchestrator: brak lazy load');

const lazyModules = [
    './healthMonitor.js',
    './selfHealing.js',
    './uiGuardian.js',
    './mapGuardian.js',
    './memoryCleaner.js',
    './healthDevPanel.js',
    './improvementEngine.js'
];
for (const mod of lazyModules) {
    if (orch.includes(`import('${mod}')`) || orch.includes(`import("${mod}")`)) {
        ok(`orchestrator lazy: ${mod}`);
    } else {
        fail(`orchestrator lazy: brak ${mod}`);
    }
}

if (orch.includes('shouldAutoLoadDiagnostics') && orch.includes("get('dev') === '1'")) {
    ok('orchestrator: auto-load na ?dev=1');
} else fail('orchestrator: brak ?dev=1 auto-load');

if (orch.includes('isDeveloperAccessGranted') && orch.includes('rg:dev-vault-unlocked')) {
    ok('orchestrator: vault unlock listener');
} else fail('orchestrator: brak vault listener');

if (orch.includes('runtimeErrorFeed.initRuntimeErrorFeed')) ok('orchestrator lazy: runtimeErrorFeed');
else fail('orchestrator lazy: brak runtimeErrorFeed');

if (orch.includes('initDeveloperVault()') && orch.includes('productionShellOnly')) {
    ok('orchestrator: powłoka vault na produkcji');
} else fail('orchestrator: brak production shell');

if (vault.includes('ensureDiagnosticsLoaded') && vault.includes('rg:dev-vault-unlocked')) {
    ok('vault: dispatch + lazy load po PIN');
} else fail('vault: brak integracji z orchestrator');

if (!vault.includes('initHealthDevPanel({ force')) {
    ok('vault: bez duplikatu init health/dashboard');
} else fail('vault: nadal duplikuje init modułów');

console.log(failed ? `\nDIAGNOSTICS ORCHESTRATOR FAILED (${failed})` : '\nDIAGNOSTICS ORCHESTRATOR OK');
process.exit(failed ? 1 : 0);
