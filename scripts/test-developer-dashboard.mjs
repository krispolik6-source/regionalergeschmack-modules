/**
 * Smoke test ETAP 19B Developer Dashboard
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
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

const file = join(ROOT, 'js/diagnostics/developerDashboard.js');
assert(existsSync(file), 'developerDashboard.js');

const src = readFileSync(file, 'utf8');
assert(src.includes('localhost') && src.includes('127.0.0.1'), 'localhost only');
assert(src.includes('isLocalhostOnly'), 'isLocalhostOnly');
assert(src.includes('autoFix: false'), 'autoFix false');

const features = [
    'worstScreens',
    'worstFiles',
    'frequentProblems',
    'qualityTrend',
    'premium',
    'improvements',
    'performance',
    'jsCount'
];
for (const f of features) {
    assert(src.includes(f), `feature ${f}`);
}

assertLazyDiagnosticsInit(assert, ROOT, 'developerDashboard.initDeveloperDashboard', 'orchestrator lazy developerDashboard');

// Pure builder (bez DOM / premium imports – osobny plik nie wyciągnięty; testujemy przez dynamic import z stubami)
globalThis.localStorage = {
    _d: {},
    getItem(k) { return this._d[k] ?? null; },
    setItem(k, v) { this._d[k] = String(v); },
    removeItem(k) { delete this._d[k]; }
};
const noop = () => {};
globalThis.document = {
    getElementById: () => null,
    createElement: () => ({ style: {}, classList: { add: noop, remove: noop }, appendChild: noop, addEventListener: noop, querySelector: () => null }),
    head: { appendChild: noop },
    body: { appendChild: noop },
    addEventListener: noop
};
globalThis.window = {
    addEventListener: noop,
    localStorage: globalThis.localStorage,
    location: { hostname: 'localhost' },
    console
};
globalThis.location = globalThis.window.location;
globalThis.console = console;

// Import może ciągnąć premium/auth – stub minimalnie
try {
    const mod = await import(pathToFileURL(file).href);
    assert(mod.isLocalhostOnly() === true, 'isLocalhostOnly true na localhost');

    const snap = mod.buildDeveloperDashboardSnapshot({
        health: {
            overall: 88,
            scores: { performance: 80, ux: 70, mobile: 75, memory: 90, pwa: 95, translation: 100, dataQuality: 90, accessibility: 88 },
            runtime: { jsErrors: 2, avgRenderMs: 40, duplicateFetches: 1 },
            findings: [{ title: 'CSS conflict', area: 'css' }]
        },
        healthState: { jsErrors: [{ msg: 'x' }, { msg: 'y' }] },
        improve: {
            proposals: [
                { id: 'IMP-001', priority: 'high', title: 'Fix fetch', file: 'js/data/dataService.js', function: 'fetch', impact: 'high', risk: 'low' },
                { id: 'IMP-002', priority: 'medium', title: 'Touch', file: 'css/style.css', function: 'mobile', impact: 'medium', risk: 'low' }
            ]
        },
        virtual: {
            summary: { score: 70, avgFps: 25, byType: { error: 1, fps: 2 }, failed: 1 },
            scenarios: [{ name: 'popup', status: 'fail' }, { name: 'premium', status: 'fail' }],
            issues: [{ type: 'fps', title: 'FPS drop', scenario: 'map' }]
        },
        learning: { signalCount: 10 },
        model: { signalCount: 10, screens: { home: 100000, map: 10000 } },
        advisor: { headline: 'Popraw UX' },
        daily: { appScore: 82, failedChecks: ['css'], sections: { aiGuardian: { topFindings: [{ severity: 'high', title: 'leak', files: ['js/core/premiumService.js'] }] } } },
        premium: { active: false, uiState: 'offer', daysLeft: 0, status: null },
        history: [
            { day: '2026-07-18', appScore: 80, health: 85, errors: 1, vuScore: 70 },
            { day: '2026-07-19', appScore: 82, health: 88, errors: 0, vuScore: 75 }
        ]
    });

    assert(snap.errors.jsCount === 2, 'js errors');
    assert(snap.worstScreens.length > 0, 'worst screens');
    assert(snap.worstFiles.some((f) => f.file.includes('dataService') || f.file.includes('premium')), 'worst files');
    assert(snap.frequentProblems.length > 0, 'frequent problems');
    assert(typeof snap.premium.score === 'number', 'premium score');
    assert(snap.improvements.length >= 1, 'improvements');
    assert(snap.performance.score === 80, 'performance');
} catch (err) {
    console.error(err);
    assert(false, `import/build: ${err.message}`);
}

if (failed) {
    console.error(`\n${failed} failed`);
    process.exit(1);
}
console.log('\nDeveloper Dashboard smoke test OK');
