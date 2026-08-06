/**
 * ETAP 42F — Bootstrap audit (Before / After ETAP 42D–E).
 * Run: npm run bootstrap-audit
 *
 * Before = eager 18 modułów diagnostycznych w app.js (pre-orchestrator).
 * After  = lazy orchestrator + lekki shell (Console Guardian + Error Collector + Vault).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'docs', 'bootstrap');
const DAY = new Date().toISOString().slice(0, 10);

/** Moduły diagnostyczne ładowane eager przed ETAP 42D */
const BEFORE_DIAGNOSTIC_FILES = [
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

/** Shell diagnostyczny po ETAP 42D–E (sync boot) */
const AFTER_DIAG_SHELL_FILES = [
    'js/core/logger.js',
    'js/diagnostics/consoleGuardian.js',
    'js/diagnostics/runtimeErrorCollector.js',
    'js/diagnostics/runtimeErrorStore.js',
    'js/diagnostics/diagnosticsOrchestrator.js',
    'js/diagnostics/developerVaultPanel.js',
    'js/diagnostics/devVault.js',
    'js/core/bootstrapProfiler.js'
];

/** Lazy — ładowane tylko po PIN / ?dev=1 */
const AFTER_LAZY_DIAG_FILES = [
    ...BEFORE_DIAGNOSTIC_FILES,
    'js/diagnostics/runtimeErrorFeed.js'
];

const BEFORE_APP_INITS = [
    'installProductionConsole',
    'initConsoleGuardian',
    'initHealthMonitor',
    'initSelfHealingLogger',
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
    'initShellSettings',
    'initHeaderShell',
    'initAiTranslationEngine',
    'initLivingRegion',
    'initSeasonTheme',
    'initClimateAtmosphere',
    'initSideMenu',
    'initToast',
    'initAuth',
    'initLoginModal',
    'initRegisterModal',
    'initNavigation',
    'initLegalFooter',
    'initCookieBanner',
    'initTrialSync',
    'initPushNotifications',
    'initOfflineSync',
    'initPwaInstall',
    'initAnalytics',
    'initAdSense',
    'initDiagnosticsOrchestrator'
];

function read(rel) {
    const p = join(ROOT, rel);
    if (!existsSync(p)) return '';
    return readFileSync(p, 'utf8');
}

function countMatches(src, re) {
    const m = src.match(re);
    return m ? m.length : 0;
}

function scanFile(rel) {
    const src = read(rel);
    if (!src) {
        return {
            file: rel,
            bytes: 0,
            listeners: 0,
            timers: 0,
            fetches: 0,
            observers: 0,
            globalHooks: 0,
            inits: 0
        };
    }
    return {
        file: rel,
        bytes: statSync(join(ROOT, rel)).size,
        listeners: countMatches(src, /\.addEventListener\s*\(/g)
            + countMatches(src, /eventBus\.on\s*\(/g),
        timers: countMatches(src, /\bsetInterval\s*\(/g)
            + countMatches(src, /\bsetTimeout\s*\(/g),
        fetches: countMatches(src, /\bfetch\s*\(/g)
            + countMatches(src, /window\.fetch\s*=/g),
        observers: countMatches(src, /new\s+PerformanceObserver/g)
            + countMatches(src, /new\s+MutationObserver/g)
            + countMatches(src, /new\s+IntersectionObserver/g)
            + countMatches(src, /new\s+ResizeObserver/g),
        globalHooks: countMatches(src, /window\.fetch\s*=/g)
            + countMatches(src, /setConsoleCaptureHook/g)
            + countMatches(src, /prototype\.addEventListener\s*=/g)
            + countMatches(src, /Object\.defineProperty\s*\(\s*window/g)
            + countMatches(src, /window\.__RG_/g),
        inits: countMatches(src, /\binit[A-Z][A-Za-z]+\s*\(/g)
    };
}

function sumScans(files) {
    const rows = files.map(scanFile);
    const totals = rows.reduce(
        (acc, r) => {
            acc.bytes += r.bytes;
            acc.listeners += r.listeners;
            acc.timers += r.timers;
            acc.fetches += r.fetches;
            acc.observers += r.observers;
            acc.globalHooks += r.globalHooks;
            acc.inits += r.inits;
            return acc;
        },
        { bytes: 0, listeners: 0, timers: 0, fetches: 0, observers: 0, globalHooks: 0, inits: 0 }
    );
    return { rows, totals };
}

function countAppBootstrapInits() {
    const app = read('js/app.js');
    const bootstrapBlock = app.match(/async function bootstrap\(\)[\s\S]*?^}/m)?.[0] || app;
    const names = [];
    for (const m of bootstrapBlock.matchAll(/recordBootstrapInit\('([^']+)'\)/g)) {
        names.push(m[1]);
    }
    const preboot = (app.includes('installProductionConsole()') ? 1 : 0)
        + (app.includes('initConsoleGuardian()') ? 1 : 0)
        + (app.includes('startBootstrapProfile()') ? 1 : 0);
    return { names, count: names.length + preboot, preboot };
}

function bundleBytes() {
    const p = join(ROOT, 'js/legacy/app.bundle.js');
    if (!existsSync(p)) return null;
    return statSync(p).size;
}

function loadRuntimeSnapshot() {
    try {
        const raw = read('docs/bootstrap/runtime-snapshot.json');
        if (raw) return JSON.parse(raw);
    } catch {
        /* ignore */
    }
    return null;
}

function pctDelta(before, after) {
    if (!before) return null;
    return Math.round(((after - before) / before) * 1000) / 10;
}

function fmtDelta(before, after, suffix = '') {
    const d = pctDelta(before, after);
    const sign = after - before <= 0 ? '' : '+';
    const pct = d != null ? ` (${sign}${d}%)` : '';
    return `${before}${suffix} → ${after}${suffix}${pct}`;
}

const appInits = countAppBootstrapInits();
const beforeDiag = sumScans(BEFORE_DIAGNOSTIC_FILES);
const afterShell = sumScans(AFTER_DIAG_SHELL_FILES);
const afterLazy = sumScans(AFTER_LAZY_DIAG_FILES);

const beforeBoot = {
    label: 'Before (ETAP 42 pre-orchestrator)',
    etap: '42C',
    diagnosticInitsEager: 18,
    appInitCalls: BEFORE_APP_INITS.filter((n) => n.startsWith('init') || n === 'installProductionConsole').length,
    diagnosticModuleBytes: beforeDiag.totals.bytes,
    listenersAtBoot: beforeDiag.totals.listeners + countMatches(read('js/diagnostics/consoleGuardian.js'), /\.addEventListener/g),
    timersAtBoot: beforeDiag.totals.timers,
    fetchesAtBoot: beforeDiag.totals.fetches + 1,
    observersAtBoot: beforeDiag.totals.observers,
    globalHooksAtBoot: beforeDiag.totals.globalHooks + 2,
    bootstrapMs: null,
    notes: [
        '18× init diagnostyczny w app.js przed navigateTo',
        'Health Monitor: fetch patch + PerformanceObserver + EventTarget patch',
        'Self-Healing Logger: fetch patch + error listeners',
        'UI/Map Guardian: setInterval co kilka sekund',
        'Szacunek statyczny — moduły parsowane i init przy każdym starcie PWA'
    ]
};

const afterBoot = {
    label: 'After (ETAP 42D–E orchestrator)',
    etap: '42F',
    diagnosticInitsEager: 1,
    diagnosticInitsLazy: 19,
    appInitCalls: appInits.count,
    appInitNames: appInits.names,
    diagnosticShellBytes: afterShell.totals.bytes,
    diagnosticLazyBytes: afterLazy.totals.bytes,
    listenersAtBoot: afterShell.totals.listeners,
    timersAtBoot: afterShell.totals.timers,
    fetchesAtBoot: afterShell.totals.fetches,
    observersAtBoot: afterShell.totals.observers,
    globalHooksAtBoot: afterShell.totals.globalHooks,
    bootstrapMs: null,
    lazyLoadMs: null,
    notes: [
        'Produkcja: initDiagnosticsOrchestrator → tylko initDeveloperVault()',
        '19 modułów lazy (import dynamic) po PIN / ?dev=1 / localhost',
        'Console Guardian + Runtime Error Collector: lekki fetch patch + listenery',
        'Bootstrap Profiler: __RG_BOOTSTRAP__.report() po starcie'
    ]
};

const runtime = loadRuntimeSnapshot();
if (runtime?.timings) {
    afterBoot.bootstrapMs = runtime.timings.bootstrapMs ?? runtime.timings.totalToInteractiveMs;
    afterBoot.prebootMs = runtime.timings.prebootMs;
    afterBoot.lazyLoadMs = runtime.timings.lazyDiagnosticsMs;
    afterBoot.diagnosticShellMs = runtime.timings.diagnosticShellMs ?? null;
}
if (runtime?.baseline?.bootstrapMs) {
    beforeBoot.bootstrapMs = runtime.baseline.bootstrapMs;
    beforeBoot.diagnosticEagerMs = runtime.baseline.diagnosticEagerMs ?? null;
}

const comparison = {
    inits: {
        before: beforeBoot.diagnosticInitsEager + 22,
        after: afterBoot.diagnosticInitsEager + appInits.names.length,
        delta: `−${(beforeBoot.diagnosticInitsEager + 22) - (afterBoot.diagnosticInitsEager + appInits.names.length)} diagnostycznych eager`
    },
    listeners: {
        before: beforeBoot.listenersAtBoot,
        after: afterBoot.listenersAtBoot,
        deferred: beforeBoot.listenersAtBoot - afterBoot.listenersAtBoot
    },
    timers: {
        before: beforeBoot.timersAtBoot,
        after: afterBoot.timersAtBoot,
        deferred: beforeBoot.timersAtBoot - afterBoot.timersAtBoot
    },
    fetches: {
        before: beforeBoot.fetchesAtBoot,
        after: afterBoot.fetchesAtBoot
    },
    observers: {
        before: beforeBoot.observersAtBoot,
        after: afterBoot.observersAtBoot,
        deferred: beforeBoot.observersAtBoot - afterBoot.observersAtBoot
    },
    globalHooks: {
        before: beforeBoot.globalHooksAtBoot,
        after: afterBoot.globalHooksAtBoot
    },
    diagnosticBytes: {
        before: beforeBoot.diagnosticModuleBytes,
        afterShell: afterBoot.diagnosticShellBytes,
        lazyTotal: afterBoot.diagnosticLazyBytes,
        savedAtBoot: beforeBoot.diagnosticModuleBytes - afterBoot.diagnosticShellBytes
    },
    bundleBytes: bundleBytes()
};

if (beforeBoot.bootstrapMs && afterBoot.bootstrapMs) {
    comparison.bootstrapMs = {
        before: beforeBoot.bootstrapMs,
        after: afterBoot.bootstrapMs,
        saved: Math.round((beforeBoot.bootstrapMs - afterBoot.bootstrapMs) * 100) / 100,
        pct: pctDelta(beforeBoot.bootstrapMs, afterBoot.bootstrapMs)
    };
}

const report = {
    generatedAt: new Date().toISOString(),
    day: DAY,
    status: 'pending_acceptance',
    autoApply: false,
    before: beforeBoot,
    after: afterBoot,
    comparison,
    runtimeSnapshot: runtime,
    baseline: runtime?.baseline ?? null,
    policy: { readOnly: true, ownerReport: true }
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, 'latest.json'), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT_DIR, `${DAY}.json`), JSON.stringify(report, null, 2), 'utf8');

const md = `# Bootstrap — Before / After (ETAP 42F)

**Data:** ${report.generatedAt}  
**Status:** ${report.status} · autoApply=false

## Podsumowanie

| Metryka | Before | After | Δ |
|---------|--------|-------|---|
| Czas bootstrap (ms) | ${beforeBoot.bootstrapMs ?? '—'} | ${afterBoot.bootstrapMs ?? '—'} | ${comparison.bootstrapMs ? `−${comparison.bootstrapMs.saved} ms (${comparison.bootstrapMs.pct}%)` : '—'} |
| Inicjalizacje (diag+eager app) | ${comparison.inits.before} | ${comparison.inits.after} | ${comparison.inits.delta} |
| Listenery (diag @ boot) | ${comparison.listeners.before} | ${comparison.listeners.after} | −${comparison.listeners.deferred} odłożone |
| Timery (diag @ boot) | ${comparison.timers.before} | ${comparison.timers.after} | −${comparison.timers.deferred} odłożone |
| Fetch hooks/wywołania (diag) | ${comparison.fetches.before} | ${comparison.fetches.after} | |
| Observery (diag @ boot) | ${comparison.observers.before} | ${comparison.observers.after} | −${comparison.observers.deferred} odłożone |
| Globalne hooki (diag @ boot) | ${comparison.globalHooks.before} | ${comparison.globalHooks.after} | |
| Bajty modułów diag @ boot | ${Math.round(comparison.diagnosticBytes.before / 1024)} KB | ${Math.round(comparison.diagnosticBytes.afterShell / 1024)} KB shell | −${Math.round(comparison.diagnosticBytes.savedAtBoot / 1024)} KB |
| Legacy bundle | — | ${comparison.bundleBytes ? `${Math.round(comparison.bundleBytes / 1024)} KB` : '—'} | |

## Before — eager diagnostyka (pre-42D)

- **${beforeBoot.diagnosticInitsEager}×** \`init*\` diagnostycznych w \`app.js\` przy starcie
- Moduły: Health Monitor, Self-Healing, UI/Map Guardian, Memory Cleaner, Health Dev Panel, Learning, Improvement, Virtual/Real User, Emotion AI, Living Brand, Product Director, Project Advisor, Daily Report, Dev Dashboard, Weekly Premium, Self-Healing Logger
- Szacowane listenery @ boot: **${comparison.listeners.before}**
- Szacowane timery @ boot: **${comparison.timers.before}** (UI/Map Guardian intervaly)
- Observery @ boot: **${comparison.observers.before}** (Health Monitor PerformanceObserver)
- Globalne hooki: **${comparison.globalHooks.before}** (fetch patch ×2, EventTarget patch, console capture)

## After — lazy orchestrator (42D–E)

- **${afterBoot.diagnosticInitsEager}×** eager: \`initDeveloperVault\` (shell PIN)
- **${afterBoot.diagnosticInitsLazy}×** lazy po odblokowaniu / \`?dev=1\` / LAN
- Pre-boot: \`installProductionConsole\` + \`initConsoleGuardian\` + \`initRuntimeErrorCollector\`
- App bootstrap: **${appInits.count}** rejestrowanych init (profiler)
- Shell diag: **${Math.round(comparison.diagnosticBytes.afterShell / 1024)} KB** vs **${Math.round(comparison.diagnosticBytes.before / 1024)} KB** przed

### Inicjalizacje produktowe (After, \`bootstrap()\`)

${appInits.names.map((n) => `- \`${n}\``).join('\n')}

## Lazy load (tylko po PIN / dev)

Po \`ensureDiagnosticsLoaded()\`: **${afterBoot.diagnosticInitsLazy}** modułów · szac. **${Math.round(comparison.diagnosticBytes.lazyTotal / 1024)} KB** kodu.

${afterBoot.lazyLoadMs != null ? `Ostatni pomiar lazy: **${afterBoot.lazyLoadMs} ms**` : 'Pomiar lazy: odblokuj Vault lub `?dev=1` — zapis w `localStorage.rg_bootstrap_profile_v1`.'}

## Runtime — jak zmierzyć

1. Otwórz PWA (produkcja lub localhost)
2. W konsoli (dev) lub po PIN: \`__RG_BOOTSTRAP__.report()\`
3. Skopiuj JSON do \`docs/bootstrap/runtime-snapshot.json\`
4. Uruchom ponownie: \`npm run bootstrap-audit\`

## Wnioski

- Produkcja **nie płaci** za 18 diagnostycznych init + intervaly + Health Monitor observer przy starcie.
- Koszt boot: shell Vault + Console/Error Collector (minimalny fetch patch).
- Pełna diagnostyka: **on-demand** — Vault PIN lub \`?dev=1\`.

---
*Tylko odczyt · raport właściciela · bez autoApply*
`;

writeFileSync(join(OUT_DIR, 'latest.md'), md, 'utf8');
writeFileSync(join(OUT_DIR, `${DAY}.md`), md, 'utf8');

console.log('Bootstrap audit OK');
console.log(`  Before diag inits @ boot: ${beforeBoot.diagnosticInitsEager}`);
console.log(`  After  diag inits @ boot: ${afterBoot.diagnosticInitsEager} (+ ${afterBoot.diagnosticInitsLazy} lazy)`);
console.log(`  Listeners deferred: −${comparison.listeners.deferred}`);
console.log(`  Timers deferred: −${comparison.timers.deferred}`);
console.log(`  Observers deferred: −${comparison.observers.deferred}`);
console.log(`  Diag bytes saved @ boot: −${Math.round(comparison.diagnosticBytes.savedAtBoot / 1024)} KB`);
console.log(`Wrote: docs/bootstrap/latest.md`);
