/**
 * Smoke test ETAP 18C Improvement Engine
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { assertLazyDiagnosticsInit } from './lib/diagnosticsOrchestratorAssert.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function assert(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error(`❌ ${msg}`);
    } else {
        console.log(`✅ ${msg}`);
    }
}

const eng = join(ROOT, 'js/diagnostics/improvementEngine.js');
assert(existsSync(eng), 'improvementEngine.js');

const src = readFileSync(eng, 'utf8');
assert(src.includes('autoApply: false') || src.includes('autoApply:false'), 'autoApply false');
assert(src.includes('autoModifyCode: false'), 'autoModifyCode false');
assert(!/writeFileSync|fs\.write/.test(src), 'runtime nie zapisuje plików projektu');

assertLazyDiagnosticsInit(assert, ROOT, 'improvementEngine.initImprovementEngine', 'orchestrator lazy improvementEngine');

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
assert(pkg.scripts?.improve, 'npm run improve');

// Pure builder via stubs
globalThis.localStorage = {
    _d: {},
    getItem(k) { return this._d[k] ?? null; },
    setItem(k, v) { this._d[k] = String(v); },
    removeItem(k) { delete this._d[k]; }
};
globalThis.indexedDB = undefined;
globalThis.document = {
    addEventListener() {},
    dispatchEvent() { return true; }
};
globalThis.window = globalThis;
globalThis.console = console;
globalThis.performance = { now: () => 0, memory: undefined };
globalThis.PerformanceObserver = undefined;
try {
    Object.defineProperty(globalThis, 'navigator', {
        value: { serviceWorker: undefined, standalone: false },
        configurable: true
    });
} catch {
    /* Node ma własny navigator */
}
globalThis.caches = undefined;

const mod = await import(pathToFileURL(eng).href);
const proposals = mod.buildImprovementProposals({
    health: {
        overall: 72,
        scores: {
            performance: 60,
            ux: 70,
            accessibility: 80,
            memory: 65,
            dataQuality: 90,
            translation: 100,
            mobile: 75,
            pwa: 88
        },
        findings: [{
            severity: 'high',
            area: 'network',
            title: 'Podwójne requesty: 3',
            detail: 'dup fetch'
        }],
        runtime: {
            jsErrors: 2,
            avgRenderMs: 80,
            duplicateFetches: 3,
            listenerAdds: 600,
            memory: { supported: true, usedMB: 140 }
        }
    },
    healthState: {
        jsErrors: [{ msg: 'TypeError at renderHome' }],
        duplicateFetches: 3,
        listenerAdds: 600,
        listenerHot: [['DIV:click', 20]]
    },
    learning: {
        signalCount: 12,
        affinity: {
            topCategories: [{ id: 'bakery', score: 8 }],
            peakHours: [{ hour: 18, score: 5 }],
            topSearches: [{ id: 'chleb', score: 4 }]
        }
    },
    model: {
        signalCount: 12,
        screens: { home: 120000, map: 10000 },
        affinity: {
            topCategories: [{ id: 'bakery', score: 8 }],
            peakHours: [{ hour: 18, score: 5 }],
            topSearches: [{ id: 'chleb', score: 4 }]
        }
    }
});

assert(proposals.length >= 3, `propozycje >= 3 (got ${proposals.length})`);
assert(proposals.every((p) => p.autoApply === false), 'wszystkie autoApply=false');
assert(proposals.every((p) => p.priority && p.impact && p.file && p.function && p.risk && p.proposedFix), 'pola kompletne');

const report = mod.buildImprovementReport({
    health: { overall: 72, scores: { performance: 60 }, findings: [], runtime: {} },
    learning: { signalCount: 0, affinity: {} },
    model: { signalCount: 0, screens: {} },
    reason: 'test'
});
assert(report.title === 'Co można poprawić', 'tytuł raportu');
assert(report.policy.autoApply === false, 'policy autoApply');

const cli = spawnSync(process.execPath, ['scripts/improvement-engine.mjs'], {
    cwd: ROOT,
    encoding: 'utf8'
});
assert(cli.status === 0, `CLI exit 0 (got ${cli.status})`);
assert(existsSync(join(ROOT, 'docs/improvements/latest.md')), 'docs/improvements/latest.md');
assert(existsSync(join(ROOT, 'docs/improvements/latest.json')), 'docs/improvements/latest.json');

const latest = JSON.parse(readFileSync(join(ROOT, 'docs/improvements/latest.json'), 'utf8'));
assert(latest.policy?.autoApply === false, 'CLI policy');
assert(Array.isArray(latest.proposals), 'CLI proposals');

if (failed) {
    console.error(`\n${failed} failed`);
    process.exit(1);
}
console.log('\nImprovement Engine smoke test OK');
