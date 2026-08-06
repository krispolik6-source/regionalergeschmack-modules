/**
 * ETAP 43 · Zadanie 7 — test wydajności
 * Run: npm run check:performance
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { statusIcon, statusLabel, checkRuntimeNodeMeasured } from './lib/cert-check.mjs';
import { buildGateReport, gateExitCode } from './lib/cert-report.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_MD = join(ROOT, 'docs', 'certification', 'PERFORMANCE-VERIFICATION.md');
const OUT_JSON = join(ROOT, 'docs', 'certification', 'PERFORMANCE-VERIFICATION.json');
const BOOT_JSON = join(ROOT, 'docs', 'bootstrap', 'latest.json');

function read(rel) {
    const p = join(ROOT, rel);
    return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

function countMatches(src, re) {
    const m = src.match(re);
    return m ? m.length : 0;
}

function scanFile(rel) {
    const p = join(ROOT, rel);
    if (!existsSync(p)) {
        return { file: rel, bytes: 0, listeners: 0, timers: 0, observers: 0, lines: 0 };
    }
    const src = read(rel);
    return {
        file: rel,
        bytes: statSync(p).size,
        lines: src.split('\n').length,
        listeners: countMatches(src, /\.addEventListener\s*\(/g) + countMatches(src, /eventBus\.on\s*\(/g),
        timers: countMatches(src, /\bsetInterval\s*\(/g) + countMatches(src, /\bsetTimeout\s*\(/g),
        observers: countMatches(src, /new\s+(?:Performance|Mutation|Intersection|Resize)Observer/g)
    };
}

function sumScans(files) {
    const rows = files.map(scanFile);
    return rows.reduce(
        (acc, r) => {
            acc.bytes += r.bytes;
            acc.listeners += r.listeners;
            acc.timers += r.timers;
            acc.observers += r.observers;
            acc.lines += r.lines;
            return acc;
        },
        { bytes: 0, listeners: 0, timers: 0, observers: 0, lines: 0, rows }
    );
}

/** Progi PASS (ETAP 42F + mobile PWA) */
const THRESHOLDS = {
    bootstrapMs: 120,
    listenersAtBoot: 45,
    timersAtBoot: 8,
    observersAtBoot: 3,
    bundleMB: 5.5,
    renderHomeMs: 150,
    renderMapMs: 800,
    renderProducerMs: 300,
    fpsScrollMin: 30,
    memoryLeakMB: 25
};

const BOOT_SHELL = [
    'js/app.js',
    'js/core/logger.js',
    'js/diagnostics/consoleGuardian.js',
    'js/diagnostics/runtimeErrorCollector.js',
    'js/diagnostics/runtimeErrorStore.js',
    'js/diagnostics/diagnosticsOrchestrator.js',
    'js/diagnostics/developerVaultPanel.js',
    'js/diagnostics/devVault.js',
    'js/core/bootstrapProfiler.js',
    'js/controllers/navigation.js',
    'js/core/sideMenu.js',
    'js/core/settings.js',
    'js/core/pwaInstall.js',
    'js/core/offlineSync.js'
];

const VIEW_FILES = {
    home: 'js/views/home.js',
    map: 'js/views/map.js',
    producer: 'js/views/producerModal.js'
};

function runCmd(cmd, args) {
    const t0 = performance.now();
    const r = spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', shell: true });
    return {
        ok: r.status === 0,
        exit: r.status ?? 1,
        ms: Math.round((performance.now() - t0) * 100) / 100
    };
}

function check(id, metric, value, threshold, op, unit = '', note = '', layer = 'static') {
    if (layer === 'runtime' && (value == null || value === undefined)) {
        return {
            id,
            metric,
            value: null,
            threshold,
            op,
            unit,
            layer: 'runtime',
            status: 'not_verified',
            note: note || 'Wymaga pomiaru w przeglądarce/PWA — NOT VERIFIED'
        };
    }
    if (layer === 'runtime') {
        return checkRuntimeNodeMeasured(
            { id, metric, value, threshold, op, unit },
            value,
            note,
            `${note} · Node benchmark ≠ RUNTIME VERIFIED`
        );
    }
    let pass = false;
    if (value == null) pass = false;
    else if (op === '<=') pass = value <= threshold;
    else if (op === '>=') pass = value >= threshold;
    else pass = Boolean(value);
    return {
        id,
        metric,
        value,
        threshold,
        op,
        unit,
        layer,
        status: pass ? 'pass' : 'fail',
        note
    };
}

console.log('[Performance] ETAP 43 · Zadanie 7\n');

process.stdout.write('→ bootstrap-report… ');
const bootRun = runCmd('npm', ['run', 'bootstrap-report']);
console.log(bootRun.ok ? `PASS (${bootRun.ms} ms)` : `FAIL (${bootRun.exit})`);

let bootstrap = {};
try {
    bootstrap = JSON.parse(read('docs/bootstrap/latest.json'));
} catch {
    bootstrap = {};
}

const after = bootstrap.after || {};
const comparison = bootstrap.comparison || {};
const bootScan = sumScans(BOOT_SHELL);
const viewScans = Object.fromEntries(
    Object.entries(VIEW_FILES).map(([k, f]) => [k, scanFile(f)])
);

const bundleBytes = comparison.bundleBytes ?? (existsSync(join(ROOT, 'js/legacy/app.bundle.js'))
    ? statSync(join(ROOT, 'js/legacy/app.bundle.js')).size
    : null);
const bundleMB = bundleBytes != null ? Math.round((bundleBytes / 1024 / 1024) * 100) / 100 : null;

const metrics = [];

metrics.push(check(
    'P01-bootstrap',
    'Bootstrap (shell PWA)',
    after.bootstrapMs ?? bootstrap.runtimeSnapshot?.timings?.bootstrapMs,
    THRESHOLDS.bootstrapMs,
    '<=',
    'ms',
    'ETAP 42F orchestrator · Node import + shell init',
    'runtime'
));

metrics.push(check(
    'P02-listeners',
    'Listenery at boot',
    after.listenersAtBoot ?? bootScan.listeners,
    THRESHOLDS.listenersAtBoot,
    '<=',
    '',
    `shell scan: ${bootScan.listeners} · audit: ${after.listenersAtBoot ?? '—'}`,
    'runtime'
));

metrics.push(check(
    'P03-timers',
    'Timery at boot',
    after.timersAtBoot ?? bootScan.timers,
    THRESHOLDS.timersAtBoot,
    '<=',
    '',
    `deferred ${comparison.timers?.deferred ?? '—'} vs Before`,
    'runtime'
));

metrics.push(check(
    'P04-observers',
    'Obserwery at boot',
    after.observersAtBoot ?? bootScan.observers,
    THRESHOLDS.observersAtBoot,
    '<=',
    '',
    `deferred ${comparison.observers?.deferred ?? '—'} vs Before`,
    'runtime'
));

metrics.push(check(
    'P05-memory-bundle',
    'Pamięć — legacy bundle',
    bundleMB,
    THRESHOLDS.bundleMB,
    '<=',
    'MB',
    'js/legacy/app.bundle.js'
));

// Render — static wiring + complexity proxy (browser ms = manual)
const nav = read('js/controllers/navigation.js');
const hm = read('js/diagnostics/healthMonitor.js');
const vu = read('js/diagnostics/virtualUser.js');

metrics.push(check(
    'P06-render-home',
    'Render Home (wiring)',
    null,
    THRESHOLDS.renderHomeMs,
    '<=',
    'ms',
    `${viewScans.home.lines} LOC · target <${THRESHOLDS.renderHomeMs}ms · rgPerfProbe()`,
    'runtime'
));

metrics.push(check(
    'P07-render-map',
    'Render Map (wiring)',
    null,
    THRESHOLDS.renderMapMs,
    '<=',
    'ms',
    `${viewScans.map.lines} LOC · Leaflet · target <${THRESHOLDS.renderMapMs}ms · rgPerfProbe()`,
    'runtime'
));

metrics.push(check(
    'P08-render-producer',
    'Render Producer (wiring)',
    null,
    THRESHOLDS.renderProducerMs,
    '<=',
    'ms',
    `${viewScans.producer.lines} LOC · target <${THRESHOLDS.renderProducerMs}ms · rgPerfProbe()`,
    'runtime'
));

metrics.push(check(
    'P09-render-profiler',
    'Health Monitor render sample',
    null,
    THRESHOLDS.renderHomeMs,
    '<=',
    'ms',
    'measureRenderSample w przeglądarce · health monitor',
    'runtime'
));

metrics.push(check(
    'P10-fps-scroll',
    'FPS podczas przewijania (Virtual User)',
    null,
    THRESHOLDS.fpsScrollMin,
    '>=',
    'FPS',
    `Próg ≥${THRESHOLDS.fpsScrollMin} FPS · __RG_VIRTUAL__.run() lub rgPerfProbe()`,
    'runtime'
));

metrics.push(check(
    'P11-memory-leak',
    'Pamięć — leak detection (Virtual User)',
    null,
    THRESHOLDS.memoryLeakMB,
    '<=',
    'MB',
    `Alert przy +≥${THRESHOLDS.memoryLeakMB} MB w sesji · performance.memory w przeglądarce`,
    'runtime'
));

const automated = [];
for (const [label, cmd, args] of [
    ['bootstrap', 'npm', ['run', 'check:bootstrap']],
    ['css-performance', 'npm', ['run', 'check:css-performance']]
]) {
    process.stdout.write(`→ ${label}… `);
    const r = runCmd(cmd, args);
    automated.push({ label, ...r });
    console.log(r.ok ? 'PASS' : `FAIL (${r.exit})`);
}

for (const m of metrics) {
    const val = m.status === 'not_verified'
        ? (m.nodeMeasured != null ? `Node ${m.nodeMeasured}${m.unit ? ` ${m.unit}` : ''}` : 'NOT VERIFIED')
        : m.value === true ? 'OK' : m.value === false ? 'FAIL' : `${m.value ?? '—'}${m.unit ? ` ${m.unit}` : ''}`;
    process.stdout.write(`${statusIcon(m)} ${m.metric}: ${val} · ${statusLabel(m)}\n`);
}

const browserProbe = `
// W przeglądarce (localhost / ?dev=1) — pomiar render + FPS scroll:
async function rgPerfProbe() {
  const m = (label, fn) => {
    const t0 = performance.now();
    return Promise.resolve(fn()).then(() => ({
      label,
      ms: Math.round(performance.now() - t0)
    }));
  };
  const out = {};
  out.bootstrap = __RG_BOOTSTRAP__?.report?.()?.timings;
  out.home = await m('render Home', () => navigateTo('home', { force: true }));
  await new Promise(r => setTimeout(r, 400));
  out.map = await m('render Map', () => navigateTo('map', { force: true }));
  await new Promise(r => setTimeout(r, 800));
  const p = window.__RG_PRODUCERS__?.[0] || document.querySelector('[data-producer-id]');
  if (p?.id || p?.dataset?.producerId) {
    const id = p.id || p.dataset.producerId;
    out.producer = await m('open Producer', () => import('./views/producerModal.js').then(m => m.openProducerModal(id)));
  }
  out.memory = performance.memory ? {
    usedMB: Math.round(performance.memory.usedJSHeapSize / 1048576),
    totalMB: Math.round(performance.memory.totalJSHeapSize / 1048576)
  } : null;
  navigateTo('home', { force: true });
  await new Promise(r => setTimeout(r, 300));
  let frames = 0, t = performance.now();
  const el = document.querySelector('.home-page') || document.getElementById('app');
  for (let i = 0; i < 20; i++) { el?.scrollBy?.(0, 120); await new Promise(r => requestAnimationFrame(r)); frames++; }
  out.fpsScroll = Math.round(frames / ((performance.now() - t) / 1000));
  console.table(out);
  return out;
}
`.trim();

const automatedWithBoot = [{ label: 'bootstrap-report', ...bootRun }, ...automated];
const gate = buildGateReport({
    items: metrics,
    automated: automatedWithBoot,
    etap: '45-D-T7',
    extra: {
        generatedAt: new Date().toISOString(),
        thresholds: THRESHOLDS,
        metrics,
        bootstrap: {
            beforeMs: comparison.bootstrapMs?.before ?? bootstrap.before?.bootstrapMs,
            afterMs: after.bootstrapMs ?? comparison.bootstrapMs?.after,
            savedMs: comparison.bootstrapMs?.saved,
            savedPct: comparison.bootstrapMs?.pct,
            prebootMs: after.prebootMs,
            listeners: { before: after.listenersAtBoot != null ? comparison.listeners?.before : null, after: after.listenersAtBoot },
            timers: { before: comparison.timers?.before, after: after.timersAtBoot },
            observers: { before: comparison.observers?.before, after: after.observersAtBoot },
            bootShellScan: bootScan
        },
        views: viewScans,
        bundle: { bytes: bundleBytes, mb: bundleMB },
        browserProbe,
        runtimeGuide: [
            { metric: 'Bootstrap', target: `≤${THRESHOLDS.bootstrapMs} ms`, how: '__RG_BOOTSTRAP__.report()' },
            { metric: 'Render Home', target: `<${THRESHOLDS.renderHomeMs} ms`, how: 'rgPerfProbe() · Performance tab' },
            { metric: 'Render Map', target: `<${THRESHOLDS.renderMapMs} ms`, how: 'navigateTo map · Leaflet tile load' },
            { metric: 'Render Producer', target: `<${THRESHOLDS.renderProducerMs} ms`, how: 'openProducerModal · modal paint' },
            { metric: 'FPS scroll', target: `≥${THRESHOLDS.fpsScrollMin}`, how: '__RG_VIRTUAL__.run() lub rgPerfProbe()' },
            { metric: 'Memory leak', target: `≤+${THRESHOLDS.memoryLeakMB} MB`, how: 'performance.memory · sesja Virtual User' }
        ],
        autoApply: false
    }
});
const { verdict, staticVerdict: staticVerdictStr, runtimeVerdict: runtimeVerdictStr, manualRequired } = gate;
const report = gate;

mkdirSync(join(ROOT, 'docs', 'certification'), { recursive: true });
writeFileSync(OUT_JSON, JSON.stringify(report, null, 2), 'utf8');

const md = `# Performance Verification — ETAP 45-D · Zadanie 7

**Data:** ${report.generatedAt.slice(0, 10)}  
**Gate:** **${verdict}**  
**STATIC:** **${staticVerdictStr}**  
**RUNTIME:** **${runtimeVerdictStr}**

> **STATIC** = bundle size, wiring scan. **RUNTIME** = bootstrap ms, render, FPS w przeglądarce.

## Warstwy

| Warstwa | Werdykt |
|---------|---------|
| **STATIC** | **${staticVerdictStr}** |
| **RUNTIME** | **${runtimeVerdictStr}** (${report.runtime.pending} pending · ${report.runtime.passed} pass) |
| **Gate** | **${verdict}** |

## Metryki

| Metryka | Warstwa | Wartość | Próg | Status |
|---------|---------|---------|------|--------|
${metrics.map((m) => {
    const v = m.value === true ? '✓ wired' : m.value === false ? '✗' : `${m.value ?? '—'}${m.unit ? ` ${m.unit}` : ''}`;
    const t = m.op === '<=' ? `≤ ${m.threshold}${m.unit ? ` ${m.unit}` : ''}` : m.op === '>=' ? `≥ ${m.threshold}` : String(m.threshold);
    return `| ${m.metric} | ${m.layer} | ${v} | ${t} | ${statusLabel(m)} |`;
}).join('\n')}

## Bootstrap (ETAP 42F)

| | Before | After |
|---|--------|-------|
| bootstrapMs | ${comparison.bootstrapMs?.before ?? '—'} | **${after.bootstrapMs ?? '—'}** |
| Listeners | ${comparison.listeners?.before ?? '—'} | **${after.listenersAtBoot ?? '—'}** |
| Timery | ${comparison.timers?.before ?? '—'} | **${after.timersAtBoot ?? '—'}** |
| Obserwery | ${comparison.observers?.before ?? '—'} | **${after.observersAtBoot ?? '—'}** |
| Oszczędność boot | — | **${comparison.bootstrapMs?.saved ?? '—'} ms (${comparison.bootstrapMs?.pct ?? '—'}%)** |

## Widoki (złożoność statyczna)

| Widok | LOC | KB | Listeners | Timery | Observers |
|-------|-----|-----|-----------|--------|-----------|
| Home | ${viewScans.home.lines} | ${Math.round(viewScans.home.bytes / 1024)} | ${viewScans.home.listeners} | ${viewScans.home.timers} | ${viewScans.home.observers} |
| Map | ${viewScans.map.lines} | ${Math.round(viewScans.map.bytes / 1024)} | ${viewScans.map.listeners} | ${viewScans.map.timers} | ${viewScans.map.observers} |
| Producer | ${viewScans.producer.lines} | ${Math.round(viewScans.producer.bytes / 1024)} | ${viewScans.producer.listeners} | ${viewScans.producer.timers} | ${viewScans.producer.observers} |

## Pamięć

| Asset | Rozmiar |
|-------|---------|
| legacy bundle | ${bundleMB ?? '—'} MB |
| diag shell (boot) | ${Math.round((after.diagnosticShellBytes ?? 0) / 1024)} KB |
| diag lazy (PIN) | ${Math.round((after.diagnosticLazyBytes ?? 0) / 1024)} KB |

## Bramki automatyczne

| Test | Status |
|------|--------|
| bootstrap-report | ${bootRun.ok ? '✅ PASS' : '❌ FAIL'} |
${automated.map((a) => `| ${a.label} | ${a.ok ? '✅ PASS' : '❌ FAIL'} |`).join('\n')}

## Pomiar w przeglądarce

\`\`\`javascript
${browserProbe}
\`\`\`

## RUNTIME — pomiar w przeglądarce

${(report.runtimeGuide || []).map((m) => `- **${m.metric}** — ${m.target} · ${m.how}`).join('\n')}

---
*ETAP 43-T7 · autoApply=false · uruchom: \`npm run check:performance\`*
`;

writeFileSync(OUT_MD, md, 'utf8');

console.log(`\n[Performance] ${staticVerdictStr} · ${runtimeVerdictStr} · gate ${verdict}`);
console.log(`Bootstrap: ${after.bootstrapMs ?? '—'} ms · listeners ${after.listenersAtBoot ?? '—'} · timers ${after.timersAtBoot ?? '—'} · observers ${after.observersAtBoot ?? '—'}`);
console.log(`Wrote: docs/certification/PERFORMANCE-VERIFICATION.md`);
process.exit(gateExitCode(verdict));
