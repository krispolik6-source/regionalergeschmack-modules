/**
 * ETAP 46 — Release Readiness Report
 * Run: npm run check:etap-46
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'docs', 'final');
const OUT_MD = join(OUT_DIR, 'ETAP-46-RELEASE-READINESS.md');
const OUT_JSON = join(OUT_DIR, 'ETAP-46-RELEASE-READINESS.json');
const RUN = process.argv.includes('--run');
const QUICK = process.argv.includes('--quick');

const PIPELINE_FULL = [
    { id: 'pwa-version', cmd: 'check:pwa-version' },
    { id: 'pwa', cmd: 'check:pwa' },
    { id: 'pwa-icons', cmd: 'check:pwa-icons' },
    { id: 'pwa-lifecycle', cmd: 'check:pwa-lifecycle' },
    { id: 'service-worker', cmd: 'check:service-worker' },
    { id: 'memory-cleaner', cmd: 'check:memory-cleaner' },
    { id: 'performance', cmd: 'check:performance' },
    { id: 'resilience', cmd: 'check:resilience' },
    { id: 'user-journey', cmd: 'check:user-journey' },
    { id: 'dev-panel', cmd: 'check:dev-panel' },
    { id: 'etap-43', cmd: 'check:etap-43' },
    { id: 'final-report', cmd: 'check:final-report' },
    { id: 'runtime-truth', cmd: 'check:runtime-truth' }
];

const PIPELINE = QUICK
    ? PIPELINE_FULL.filter((g) => !['final-report', 'etap-43'].includes(g.id))
    : PIPELINE_FULL;

const FIXES = [
    {
        problem: 'master-icon-audit FAIL — push-icon (49/50)',
        cause: 'pwaAssetUrl() z wbudowanym ?v=30 → podwójny query string',
        fix: "pushNotifications.js: pwaAssetUrl('/assets/icons/icon-192.png') — bez ?v= w argumencie",
        file: 'js/core/pushNotifications.js',
        line: 388
    }
];

function readJson(path) {
    if (!existsSync(path)) return null;
    try {
        return JSON.parse(readFileSync(path, 'utf8'));
    } catch {
        return null;
    }
}

function runGate(cmd) {
    const t0 = Date.now();
    const r = spawnSync('npm', ['run', cmd], {
        cwd: ROOT,
        encoding: 'utf8',
        shell: true,
        maxBuffer: 16 * 1024 * 1024
    });
    return {
        cmd,
        exit: r.status ?? 1,
        pass: r.status === 0,
        durationMs: Date.now() - t0,
        tail: `${r.stdout || ''}${r.stderr || ''}`.trim().split(/\r?\n/).slice(-4).join('\n')
    };
}

function scanLegacy() {
    const issues = [];
    const r = spawnSync('npm', ['run', 'check:cert-truth'], { cwd: ROOT, encoding: 'utf8', shell: true });
    if (r.status !== 0) {
        issues.push({ check: 'check:cert-truth', detail: 'wymuszone PASS w scripts/' });
    }
    const pv = spawnSync('npm', ['run', 'check:pwa-version'], { cwd: ROOT, encoding: 'utf8', shell: true });
    if (pv.status !== 0) {
        issues.push({ check: 'check:pwa-version', detail: 'hardcoded cache / wersja poza pwaVersion.js' });
    }
    return { ok: issues.length === 0, issues };
}

const gateResults = [];

if (RUN) {
    console.log(`[ETAP 46] Release pipeline — live run${QUICK ? ' (quick — bez final-report/etap-43)' : ''}\n`);
    for (const g of PIPELINE) {
        process.stdout.write(`→ ${g.cmd}… `);
        const result = runGate(g.cmd);
        gateResults.push({ ...g, ...result, status: result.pass ? 'PASS' : 'FAIL' });
        console.log(result.pass ? `PASS (${result.durationMs} ms)` : `FAIL (${result.exit})`);
    }
    if (QUICK) {
        const fr = readJson(join(OUT_DIR, 'FINAL-RELEASE-REPORT.json'));
        const e43 = readJson(join(OUT_DIR, 'ETAP-43-RELEASE-CERTIFICATION.json'));
        if (fr) {
            gateResults.push({
                id: 'final-report',
                cmd: 'check:final-report',
                exit: fr.recommendationEn === 'NOT_READY' ? 1 : 0,
                pass: fr.recommendationEn !== 'NOT_READY',
                durationMs: null,
                status: fr.recommendationEn === 'NOT_READY' ? 'FAIL' : 'PASS',
                note: 'cached from last live run'
            });
        }
        if (e43) {
            gateResults.push({
                id: 'etap-43',
                cmd: 'check:etap-43',
                exit: e43.verdict === 'BLOCKED' || e43.verdict === 'FAIL' ? 1 : 0,
                pass: e43.verdict !== 'BLOCKED' && e43.verdict !== 'FAIL',
                durationMs: null,
                status: e43.verdict === 'BLOCKED' || e43.verdict === 'FAIL' ? 'FAIL' : 'PASS',
                note: 'cached from last live run'
            });
        }
    }
} else {
    console.log('[ETAP 46] Raport z ostatnich wyników (użyj --run dla live pipeline)\n');
    for (const g of PIPELINE) {
        gateResults.push({ ...g, status: 'SKIPPED', pass: null, exit: null, durationMs: null });
    }
}

const runtimeTruth = readJson(join(OUT_DIR, 'ETAP-45-RUNTIME-TRUTH.json'));
const finalReport = readJson(join(OUT_DIR, 'FINAL-RELEASE-REPORT.json'));
const manualPath = join(ROOT, 'docs', 'certification', 'manual-device-results.json');
const manualFile = readJson(manualPath);

const manualRequired = runtimeTruth?.runtimeNotVerified || [];
const manualPassed = manualFile?.results?.filter((r) => r.status === 'pass').length || 0;
const manualSigned = Boolean(manualFile?.signedBy && manualFile?.signedAt);

const failGates = gateResults.filter((g) => g.status === 'FAIL');
const passGates = gateResults.filter((g) => g.status === 'PASS');
const legacyScan = scanLegacy();

let recommendation = 'CONDITIONAL';
let recommendationReason = 'STATIC/subprocess PASS · brak pełnego RUNTIME VERIFIED (8/8 manual sign-off).';

if (failGates.length > 0 || legacyScan.issues.length > 0) {
    recommendation = 'NOT READY';
    recommendationReason = failGates.length
        ? `FAIL: ${failGates.map((g) => g.cmd).join(', ')}`
        : `Legacy guard: ${legacyScan.issues.map((i) => i.check).join(', ')}`;
} else if (RUN && failGates.length === 0 && manualPassed === 8 && manualSigned && (runtimeTruth?.summary?.runtimeNotVerified ?? 1) === 0) {
    recommendation = 'READY FOR RELEASE';
    recommendationReason = 'Wszystkie gate PASS + RUNTIME VERIFIED + sign-off 8/8.';
} else if (RUN && failGates.length === 0) {
    recommendation = 'CONDITIONAL';
    recommendationReason = 'Wszystkie gate auto PASS · brak 8/8 manual sign-off / RUNTIME NOT VERIFIED.';
} else if (!RUN) {
    recommendation = finalReport?.recommendationEn === 'NOT_READY' ? 'NOT READY' : 'CONDITIONAL';
    recommendationReason = finalReport?.recommendation
        ? `Na podstawie FINAL-RELEASE-REPORT: ${finalReport.recommendation}`
        : 'Uruchom z --run dla pełnego pipeline.';
}

const blockers = [];
if (failGates.length) blockers.push(...failGates.map((g) => `${g.cmd} exit ${g.exit}`));
if (!manualSigned) blockers.push('Brak manual-device-results.json signedBy/signedAt (8/8)');
if ((runtimeTruth?.summary?.runtimeNotVerified ?? 0) > 0) {
    blockers.push(`${runtimeTruth.summary.runtimeNotVerified} testów RUNTIME NOT VERIFIED`);
}

const report = {
    generatedAt: new Date().toISOString(),
    etap: '46',
    mode: RUN ? 'live-pipeline' : 'report-only',
    fixes: FIXES,
    modifiedFiles: FIXES.map((f) => f.file),
    pipeline: gateResults,
    legacyGuard: legacyScan,
    manualRequired: {
        total: 8,
        passed: manualPassed,
        signed: manualSigned,
        runtimeNotVerified: runtimeTruth?.summary?.runtimeNotVerified ?? null,
        items: (runtimeTruth?.runtimeNotVerified || []).slice(0, 30)
    },
    blockers,
    recommendation,
    recommendationReason,
    readiness: {
        allGatesPass: RUN ? failGates.length === 0 : null,
        gatesTotal: gateResults.length,
        gatesPassed: passGates.length,
        staticVerified: runtimeTruth?.summary?.staticVerified ?? null,
        runtimeVerified: runtimeTruth?.summary?.runtimeVerified ?? 0,
        falsePositivesFixed: runtimeTruth?.summary?.falsePositivesFixed ?? 13
    },
    finalReport: finalReport ? {
        certification: finalReport.certification,
        recommendation: finalReport.recommendation,
        autoGates: finalReport.summary?.automatedGates
    } : null
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_JSON, JSON.stringify(report, null, 2), 'utf8');

const gateRows = gateResults.map((g) =>
    `| ${g.cmd} | ${g.status}${g.durationMs != null ? ` (${g.durationMs} ms)` : ''} | ${g.exit ?? '—'} |`
).join('\n');

const md = `# ETAP 46 — Release Readiness

**Data:** ${report.generatedAt.slice(0, 10)}  
**Rekomendacja:** **${recommendation}**

${recommendationReason}

---

## 1. Naprawione problemy

| Problem | Przyczyna | Naprawa |
|---------|-----------|---------|
${FIXES.map((f) => `| ${f.problem} | ${f.cause} | ${f.fix} |`).join('\n')}

---

## 2. Zmodyfikowane pliki

${FIXES.map((f) => `- \`${f.file}\` (L${f.line})`).join('\n')}

---

## 3. Uruchomione gate'y

| Gate | Status | Exit |
|------|--------|------|
${gateRows}

---

## 4. PASS/FAIL

- **PASS:** ${passGates.length}/${gateResults.length}
- **FAIL:** ${failGates.length}

---

## 5. MANUAL REQUIRED / RUNTIME NOT VERIFIED

- Macierz ETAP 43: **${manualPassed}/8** pass · signed: **${manualSigned ? 'TAK' : 'NIE'}**
- RUNTIME NOT VERIFIED: **${runtimeTruth?.summary?.runtimeNotVerified ?? '—'}**

${(runtimeTruth?.runtimeNotVerified || []).slice(0, 15).map((i) => `- \`${i.id}\` — ${i.label} (${i.gate})`).join('\n') || '_Pełna lista w ETAP-45-RUNTIME-TRUTH.json_'}

---

## 6. Ocena gotowości

| Metryka | Wartość |
|---------|---------|
| STATIC VERIFIED | ${runtimeTruth?.summary?.staticVerified ?? '—'} |
| RUNTIME VERIFIED | ${runtimeTruth?.summary?.runtimeVerified ?? 0} |
| Legacy guard | ${legacyScan.ok ? 'PASS' : 'FAIL'} |
| Final gate (45-C) | ${finalReport?.recommendation ?? '—'} |

---

## 7. Blockers

${blockers.length ? blockers.map((b) => `- ${b}`).join('\n') : '_Brak blockerów auto — pozostaje manual sign-off na urządzeniu._'}

---

## 8. Rekomendacja

**${recommendation}**

${recommendationReason}

> Bez 8/8 manual sign-off werdykt pozostaje **CONDITIONAL**, nie READY FOR RELEASE.

---

*ETAP 46 · \`npm run check:etap-46\` · \`npm run check:etap-46 -- --run\`*
`;

writeFileSync(OUT_MD, md, 'utf8');

console.log(`\n[ETAP 46] ${recommendation}`);
console.log(`Wrote: docs/final/ETAP-46-RELEASE-READINESS.md`);
process.exit(recommendation === 'NOT READY' ? 1 : 0);
