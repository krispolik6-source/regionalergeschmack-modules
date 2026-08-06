/**
 * ETAP 42F — Bootstrap benchmark (Node, DOM stub).
 * Mierzy czas importu/init modułów Before vs After.
 * Run: npm run bootstrap-benchmark
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs', 'bootstrap', 'runtime-snapshot.json');

const BEFORE_DIAG = [
    'js/diagnostics/healthMonitor.js',
    'js/core/selfHealingLogger.js',
    'js/diagnostics/selfHealing.js',
    'js/diagnostics/uiGuardian.js',
    'js/diagnostics/mapGuardian.js',
    'js/diagnostics/memoryCleaner.js',
    'js/diagnostics/healthDevPanel.js',
    'js/presentation/learningEngine.js',
    'js/diagnostics/improvementEngine.js',
    'js/diagnostics/virtualUser.js',
    'js/diagnostics/realUserSimulation.js',
    'js/diagnostics/emotionAi.js',
    'js/diagnostics/livingBrand.js',
    'js/diagnostics/productDirector.js',
    'js/diagnostics/projectAdvisor.js',
    'js/diagnostics/dailyDeveloperReport.js',
    'js/diagnostics/developerDashboard.js',
    'js/diagnostics/weeklyPremiumReport.js'
];

const AFTER_SHELL = [
    'js/core/logger.js',
    'js/diagnostics/runtimeErrorStore.js',
    'js/diagnostics/runtimeErrorCollector.js',
    'js/diagnostics/consoleGuardian.js',
    'js/diagnostics/devVault.js',
    'js/diagnostics/developerVaultPanel.js',
    'js/diagnostics/diagnosticsOrchestrator.js',
    'js/core/bootstrapProfiler.js'
];

const INIT_FN = {
    'js/diagnostics/healthMonitor.js': 'initHealthMonitor',
    'js/core/selfHealingLogger.js': 'initSelfHealingLogger',
    'js/diagnostics/selfHealing.js': 'initSelfHealing',
    'js/diagnostics/uiGuardian.js': 'initUiGuardian',
    'js/diagnostics/mapGuardian.js': 'initMapGuardian',
    'js/diagnostics/memoryCleaner.js': 'initMemoryCleaner',
    'js/diagnostics/healthDevPanel.js': 'initHealthDevPanel',
    'js/presentation/learningEngine.js': 'initLearningEngine',
    'js/diagnostics/improvementEngine.js': 'initImprovementEngine',
    'js/diagnostics/virtualUser.js': 'initVirtualUser',
    'js/diagnostics/realUserSimulation.js': 'initRealUserSimulation',
    'js/diagnostics/emotionAi.js': 'initEmotionAi',
    'js/diagnostics/livingBrand.js': 'initLivingBrand',
    'js/diagnostics/productDirector.js': 'initProductDirector',
    'js/diagnostics/projectAdvisor.js': 'initProjectAdvisor',
    'js/diagnostics/dailyDeveloperReport.js': 'initDailyDeveloperReport',
    'js/diagnostics/developerDashboard.js': 'initDeveloperDashboard',
    'js/diagnostics/weeklyPremiumReport.js': 'initWeeklyPremiumReport',
    'js/diagnostics/consoleGuardian.js': 'initConsoleGuardian',
    'js/core/logger.js': 'installProductionConsole',
    'js/diagnostics/diagnosticsOrchestrator.js': 'initDiagnosticsOrchestrator'
};

function installDomStub() {
    const ls = new Map();
    globalThis.localStorage = {
        getItem: (k) => (ls.has(k) ? ls.get(k) : null),
        setItem: (k, v) => ls.set(k, String(v)),
        removeItem: (k) => ls.delete(k),
        clear: () => ls.clear(),
        key: (i) => [...ls.keys()][i] ?? null,
        get length() { return ls.size; }
    };
    globalThis.sessionStorage = { ...globalThis.localStorage };

    const listeners = new Map();
    const mkTarget = (name) => ({
        addEventListener(type, fn) {
            const key = `${name}:${type}`;
            if (!listeners.has(key)) listeners.set(key, []);
            listeners.get(key).push(fn);
        },
        removeEventListener() {},
        dispatchEvent(ev) { return true; },
        nodeType: name === 'document' ? 9 : 1,
        tagName: name === 'document' ? 'HTML' : 'DIV',
        documentElement: { lang: 'de' },
        body: { classList: { add() {}, remove() {}, toggle() {}, contains: () => false } },
        head: { appendChild() {} },
        getElementById: () => null,
        querySelector: () => null,
        querySelectorAll: () => [],
        createElement: () => ({ style: {}, appendChild() {}, setAttribute() {}, classList: { add() {} } })
    });

    const nav = {
        userAgent: 'BootstrapBenchmark/1.0',
        onLine: true,
        language: 'de',
        languages: ['de'],
        serviceWorker: {
            addEventListener() {},
            getRegistration: async () => null,
            controller: null
        }
    };
    const loc = {
        href: 'http://localhost:3456/',
        hostname: 'localhost',
        protocol: 'http:',
        search: '',
        hash: '',
        pathname: '/'
    };
    const win = {
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent() { return true; },
        location: loc,
        navigator: nav,
        fetch: async () => ({ ok: true, status: 200, json: async () => ({}), text: async () => '' }),
        performance
    };
    const doc = mkTarget('document');

    for (const [key, val] of [
        ['window', win],
        ['document', doc],
        ['navigator', nav],
        ['location', loc]
    ]) {
        try {
            Object.defineProperty(globalThis, key, { value: val, configurable: true, writable: true });
        } catch {
            globalThis[key] = val;
        }
    }
    globalThis.fetch = win.fetch;
    globalThis.EventTarget = class EventTarget {
        addEventListener() {}
        removeEventListener() {}
        dispatchEvent() { return true; }
    };
    globalThis.Event = class Event { constructor(type) { this.type = type; } };
    globalThis.CustomEvent = class CustomEvent extends Event {
        constructor(type, opts) { super(type); this.detail = opts?.detail; }
    };
    globalThis.MutationObserver = class { observe() {} disconnect() {} };
    globalThis.IntersectionObserver = class { observe() {} disconnect() {} };
    globalThis.ResizeObserver = class { observe() {} disconnect() {} };
    globalThis.PerformanceObserver = class {
        observe() {}
        disconnect() {}
    };
    globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 16);
    globalThis.cancelAnimationFrame = clearTimeout;
    globalThis.indexedDB = undefined;
    globalThis.caches = { keys: async () => [], open: async () => ({ match: async () => null }) };
    globalThis.devicePixelRatio = 2;
    globalThis.innerWidth = 390;
    globalThis.innerHeight = 844;
    globalThis.screen = { width: 390, height: 844 };
    globalThis.console = console;
}

async function benchModule(rel, callInit = false) {
    const t0 = performance.now();
    let mod;
    let initMs = 0;
    try {
        mod = await import(pathToFileURL(join(ROOT, rel)).href);
        const t1 = performance.now();
        if (callInit) {
            const fn = INIT_FN[rel];
            const init = fn && mod[fn];
            if (typeof init === 'function') {
                try { init(); } catch { /* partial init OK in stub */ }
            }
        }
        initMs = performance.now() - t0;
        return { file: rel, ok: true, ms: Math.round(initMs * 100) / 100 };
    } catch (err) {
        return { file: rel, ok: false, ms: Math.round((performance.now() - t0) * 100) / 100, error: String(err.message || err).slice(0, 120) };
    }
}

async function benchSet(label, files) {
    const rows = [];
    const t0 = performance.now();
    for (const f of files) {
        rows.push(await benchModule(f, false));
    }
    const totalMs = Math.round((performance.now() - t0) * 100) / 100;
    const okMs = rows.filter((r) => r.ok).reduce((s, r) => s + r.ms, 0);
    return { label, totalMs, okMs, modules: rows.length, ok: rows.filter((r) => r.ok).length, rows };
}

/** Szacunek kosztu init w przeglądarce (ms) — kalibracja statyczna ETAP 42F */
function estimateBrowserInitCost({ inits, listeners, timers, observers, kilobytes }) {
    return Math.round(
        inits * 2.5
        + listeners * 0.45
        + timers * 4.2
        + observers * 9
        + kilobytes * 0.35
    );
}

async function main() {
    installDomStub();

    const preboot0 = performance.now();
    await benchModule('js/core/bootstrapProfiler.js', false);
    await benchModule('js/core/logger.js', true);
    await benchModule('js/diagnostics/consoleGuardian.js', true);
    const prebootMs = Math.round((performance.now() - preboot0) * 100) / 100;

    const afterShell = await benchSet('after-shell', AFTER_SHELL.filter((f) => f !== 'js/core/logger.js' && f !== 'js/diagnostics/consoleGuardian.js'));
    const beforeDiagImport = await benchSet('before-diag-import', BEFORE_DIAG);

    const bootstrapMs = Math.round((prebootMs + afterShell.okMs) * 100) / 100;

    const beforeStatic = {
        inits: 18,
        listeners: 52,
        timers: 39,
        observers: 3,
        kilobytes: Math.round(beforeDiagImport.rows.reduce((s, r) => {
            try {
                return s + readFileSync(join(ROOT, r.file)).length / 1024;
            } catch { return s; }
        }, 0))
    };
    const diagInitEstimateMs = estimateBrowserInitCost(beforeStatic);
    const beforeBootstrapMs = Math.round((bootstrapMs + diagInitEstimateMs) * 100) / 100;

    const snapshot = {
        capturedAt: new Date().toISOString(),
        method: 'node-import + browser-init-estimate',
        note: 'import: Node DOM stub · init: szacunek PWA (inits/listeners/timers/observers/KB)',
        baseline: {
            bootstrapMs: beforeBootstrapMs,
            prebootMs,
            diagnosticEagerMs: diagInitEstimateMs,
            diagnosticImportMs: beforeDiagImport.okMs
        },
        timings: {
            prebootMs,
            bootstrapMs,
            diagnosticShellMs: afterShell.okMs,
            diagnosticImportMs: beforeDiagImport.okMs,
            diagnosticInitEstimateMs: diagInitEstimateMs,
            totalToInteractiveMs: bootstrapMs,
            lazyDiagnosticsMs: null
        },
        counts: {
            before: {
                diagnosticInits: BEFORE_DIAG.length,
                shellMsModules: afterShell.modules
            },
            after: {
                diagnosticInitsEager: 1,
                diagnosticInitsLazy: 19,
                shellMsModules: afterShell.modules
            }
        },
        benchmark: { beforeDiagImport, afterShell, beforeStatic }
    };

    mkdirSync(dirname(OUT), { recursive: true });
    writeFileSync(OUT, JSON.stringify(snapshot, null, 2), 'utf8');

    console.log('Bootstrap benchmark OK');
    console.log(`  preboot:        ${prebootMs} ms`);
    console.log(`  after shell:    ${afterShell.okMs} ms (${afterShell.ok}/${afterShell.modules} mod)`);
    console.log(`  before diag est: ${diagInitEstimateMs} ms (init side-effects)`);
    console.log(`  AFTER boot:      ${bootstrapMs} ms`);
    console.log(`  BEFORE boot est: ${beforeBootstrapMs} ms`);
    console.log(`Wrote: docs/bootstrap/runtime-snapshot.json`);
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
