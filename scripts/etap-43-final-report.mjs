/**
 * ETAP 45-C · Release Gate — raport końcowy certyfikacji
 * Run: npm run check:final-report
 *
 * ZASADY:
 * - Zawsze live run (zero cache / override PASS)
 * - FAIL nigdy nie staje się PASS
 * - brak manual 8/8 → brak CERTIFIED / GOTOWA DO WYDANIA
 * - brak sign-off → CONDITIONAL / GOTOWA WARUNKOWO
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { readPwaVersionFromModule } from './lib/read-pwa-version.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'docs', 'final');
const OUT_MD = join(OUT_DIR, 'FINAL-RELEASE-REPORT.md');
const OUT_JSON = join(OUT_DIR, 'FINAL-RELEASE-REPORT.json');
const CERT_DIR = join(ROOT, 'docs', 'certification');
const MANUAL_PATH = join(CERT_DIR, 'manual-device-results.json');
const MANUAL_REQUIRED = 8;

function readJson(path) {
    if (!existsSync(path)) return null;
    try {
        return JSON.parse(readFileSync(path, 'utf8'));
    } catch {
        return null;
    }
}

function runGate(id, label, cmd, args) {
    const t0 = Date.now();
    const r = spawnSync(cmd, args, {
        cwd: ROOT,
        encoding: 'utf8',
        shell: true,
        maxBuffer: 16 * 1024 * 1024
    });
    const pass = r.status === 0;
    return {
        id,
        label,
        cmd,
        args,
        status: pass ? 'PASS' : 'FAIL',
        exit: r.status ?? 1,
        durationMs: Date.now() - t0,
        source: 'live',
        tail: `${r.stdout || ''}${r.stderr || ''}`.trim().split(/\r?\n/).slice(-8).join('\n')
    };
}

const ZADANIA = [
    { id: 'Z2-pwa-lifecycle', zadanie: 2, label: 'PWA Lifecycle (10 scenariuszy)', cmd: 'check:pwa-lifecycle' },
    { id: 'Z3-pwa-icons', zadanie: 3, label: 'Ikony PWA (8 kategorii + anti-stale)', cmd: 'check:pwa-icons' },
    { id: 'Z4-service-worker', zadanie: 4, label: 'Service Worker (8 obszarów)', cmd: 'check:service-worker' },
    { id: 'Z5-dev-panel', zadanie: 5, label: 'Panel deweloperski (PIN + diag)', cmd: 'check:dev-panel' },
    { id: 'Z6-user-journey', zadanie: 6, label: 'Pełny test użytkownika + persist', cmd: 'check:user-journey' },
    { id: 'Z7-performance', zadanie: 7, label: 'Test wydajności', cmd: 'check:performance' },
    { id: 'Z8-resilience', zadanie: 8, label: 'Test odporności (7 scenariuszy)', cmd: 'check:resilience' }
];

const CORE_GATES = [
    { id: 'etap-43', label: 'ETAP 43 — certyfikacja auto (9 bramek)', cmd: 'npm', args: ['run', 'check:etap-43'] },
    { id: 'release-candidate', label: 'Release Candidate (22/22)', cmd: 'npm', args: ['run', 'release-candidate'] },
    { id: 'device-test-plan', label: 'Device Test Plan (macierz S01–S12)', cmd: 'npm', args: ['run', 'check:device-test-plan'] }
];

console.log('[Release Gate] ETAP 45-C · live certification (no cache)\n');

const gateResults = [];
let autoFail = false;

for (const z of ZADANIA) {
    process.stdout.write(`→ ${z.label}… `);
    const result = runGate(z.id, z.label, 'npm', ['run', z.cmd]);
    gateResults.push(result);
    if (result.status === 'FAIL') {
        autoFail = true;
        console.log(`FAIL (${result.exit})`);
    } else {
        console.log(`PASS (${result.durationMs} ms)`);
    }
}

for (const g of CORE_GATES) {
    process.stdout.write(`→ ${g.label}… `);
    const result = runGate(g.id, g.label, g.cmd, g.args);
    gateResults.push(result);
    if (result.status === 'FAIL') {
        autoFail = true;
        console.log(`FAIL (${result.exit})`);
    } else {
        console.log(`PASS (${result.durationMs} ms)`);
    }
}

const VERIFICATION_FILES = {
        'Z2-pwa-lifecycle': 'PWA-LIFECYCLE-VERIFICATION.json',
        'Z3-pwa-icons': 'ICONS-VERIFICATION.json',
        'Z4-service-worker': 'SERVICE-WORKER-VERIFICATION.json',
        'Z5-dev-panel': 'DEV-PANEL-VERIFICATION.json',
        'Z6-user-journey': 'USER-JOURNEY-VERIFICATION.json',
        'Z7-performance': 'PERFORMANCE-VERIFICATION.json',
        'Z8-resilience': 'RESILIENCE-VERIFICATION.json'
};

const verificationSnapshots = ZADANIA.map((z) => {
    const file = VERIFICATION_FILES[z.id];
    const data = readJson(join(CERT_DIR, file));
    return { zadanie: z.zadanie, file, verdict: data?.verdict ?? 'unknown', staticVerdict: data?.staticVerdict ?? null, runtimeVerdict: data?.runtimeVerdict ?? null, manualRequired: data?.manualRequired ?? data?.runtime?.pending ?? null };
});

const bootstrap = readJson(join(ROOT, 'docs/bootstrap/latest.json'));
const etap43 = readJson(join(OUT_DIR, 'ETAP-43-RELEASE-CERTIFICATION.json'));
const pwaVersion = readPwaVersionFromModule(ROOT);

const manualFile = readJson(MANUAL_PATH);
const manualItems = manualFile?.results || manualFile?.scenarios || [];
const manualPassed = manualItems.filter((m) => m.status === 'pass' || m.result === 'pass').length;
const manualFailed = manualItems.filter((m) => m.status === 'fail' || m.result === 'fail').length;
const manualPending = manualItems.length === 0
    ? MANUAL_REQUIRED
    : Math.max(0, MANUAL_REQUIRED - manualPassed - manualFailed);
const manualSigned = Boolean(manualFile?.signedBy && manualFile?.signedAt);
const manualComplete = manualPassed === MANUAL_REQUIRED && manualFailed === 0;

const etap43Verdict = etap43?.verdict ?? 'unknown';
const autoPassed = gateResults.filter((g) => g.status === 'PASS').length;
const autoFailed = gateResults.filter((g) => g.status === 'FAIL');

let certification;
let recommendation;
let recommendationEn;
let riskLevel;

if (autoFail || manualFailed > 0) {
    certification = 'BLOCKED';
    recommendation = 'NIEGOTOWA';
    recommendationEn = 'NOT_READY';
    riskLevel = 'WYSOKI';
} else if (!manualComplete || !manualSigned) {
    certification = 'CONDITIONAL';
    recommendation = 'GOTOWA WARUNKOWO';
    recommendationEn = 'CONDITIONAL';
    riskLevel = manualPending > 0 ? 'ŚREDNI' : 'ŚREDNI';
} else {
    certification = 'CERTIFIED';
    recommendation = 'GOTOWA DO WYDANIA';
    recommendationEn = 'READY';
    riskLevel = 'NISKI';
}

const issues = [];

for (const f of autoFailed) {
    issues.push({
        severity: 'critical',
        source: f.id,
        problem: `Bramka FAIL: ${f.label}`,
        files: [`npm run ${f.args?.slice(1).join(':').replace('run:', '') || f.cmd}`],
        repairPlan: [
            `Uruchom izolowanie: npm run ${ZADANIA.find((z) => z.id === f.id)?.cmd || f.args?.[1] || '…'}`,
            'Napraw pierwszy FAIL — bez override PASS',
            'Ponownie: npm run check:final-report'
        ],
        tail: f.tail
    });
}

if (manualFailed > 0) {
    issues.push({
        severity: 'critical',
        source: 'manual-device',
        problem: `${manualFailed} scenariusz(y) manual FAIL na urządzeniu`,
        files: [MANUAL_PATH],
        repairPlan: ['Napraw regresję na telefonie/PWA', 'Zaktualizuj manual-device-results.json', 'npm run check:final-report']
    });
}

if (!autoFail && !manualComplete) {
    issues.push({
        severity: 'medium',
        source: 'manual-device',
        problem: `Sign-off real device: ${manualPassed}/${MANUAL_REQUIRED} pass · ${manualPending} pending`,
        files: [MANUAL_PATH, 'docs/certification/DEVICE-TEST-PLAN.md'],
        repairPlan: [
            'Przejdź macierz DEVICE-TEST-PLAN (min. iPhone + Android PWA)',
            'Wypełnij manual-device-results.json (8/8 pass + signedBy/signedAt)',
            'npm run check:final-report → CERTIFIED / GOTOWA DO WYDANIA'
        ]
    });
}

if (!manualSigned && !autoFail && manualFailed === 0) {
    issues.push({
        severity: 'medium',
        source: 'manual-sign-off',
        problem: 'Brak signedBy / signedAt w manual-device-results.json',
        files: [MANUAL_PATH],
        repairPlan: ['Dodaj signedBy i signedAt po przejściu macierzy 8/8']
    });
}

issues.push({
    severity: 'low',
    source: 'browser-metrics',
    problem: 'Render ms · FPS · PIN PWA · Virtual User — MANUAL REQUIRED w raportach Z5–Z7',
    files: ['docs/certification/PERFORMANCE-VERIFICATION.md'],
    repairPlan: ['rgPerfProbe() · __RG_VIRTUAL__.run() · macierz manual device']
});

const report = {
    generatedAt: new Date().toISOString(),
    etap: '45-C',
    certification,
    recommendation,
    recommendationEn,
    riskLevel,
    mode: 'live-only',
    policy: {
        liveRunOnly: true,
        noCachedPass: true,
        noFailOverride: true,
        noStaticPassReplacingFail: true,
        certifiedRequiresManual: `${MANUAL_REQUIRED}/${MANUAL_REQUIRED}`,
        conditionalWithoutSignOff: true,
        ownerSignOffRequired: true
    },
    summary: {
        automatedGates: { passed: autoPassed, total: gateResults.length, failed: autoFailed.length },
        etap43Certification: etap43Verdict,
        zadania2to8: verificationSnapshots,
        manualDevice: {
            required: MANUAL_REQUIRED,
            passed: manualPassed,
            failed: manualFailed,
            pending: manualPending,
            signed: manualSigned,
            complete: manualComplete
        },
        criticalIssues: issues.filter((i) => i.severity === 'critical').length,
        mediumIssues: issues.filter((i) => i.severity === 'medium').length,
        lowIssues: issues.filter((i) => i.severity === 'low').length
    },
    metrics: {
        bootstrapMs: bootstrap?.after?.bootstrapMs,
        listenersAtBoot: bootstrap?.after?.listenersAtBoot,
        timersAtBoot: bootstrap?.after?.timersAtBoot,
        observersAtBoot: bootstrap?.after?.observersAtBoot,
        pwaVersion
    },
    gates: gateResults,
    etap43: etap43 || null,
    issues
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_JSON, JSON.stringify(report, null, 2), 'utf8');

const gateRows = gateResults.map((g, i) =>
    `| ${i + 1} | ${g.label} | \`${g.args?.join(' ') || g.cmd}\` | ${g.status === 'PASS' ? '✅ PASS' : '❌ FAIL'} |`
).join('\n');

const issueBlocks = issues.map((issue, i) => `
### ${i + 1}. [${issue.severity.toUpperCase()}] ${issue.problem}

- **Źródło:** ${issue.source}
- **Pliki:** ${issue.files.map((f) => `\`${f}\``).join(', ')}
- **Plan naprawy:**
${issue.repairPlan.map((p, j) => `  ${j + 1}. ${p}`).join('\n')}
${issue.tail ? `\n\`\`\`\n${issue.tail}\n\`\`\`` : ''}`).join('\n');

const md = `# Raport końcowy — Release Gate

**Data:** ${report.generatedAt.slice(0, 10)}  
**ETAP:** 45-C  
**Certification:** **${certification}**  
**Rekomendacja:** **${recommendation}**  
**Poziom ryzyka:** **${riskLevel}**

---

## Werdykt (stan faktyczny)

| Warstwa | Wynik |
|---------|--------|
| Bramki automatyczne (live) | **${autoPassed}/${gateResults.length} PASS** |
| ETAP 43 certification | **${etap43Verdict}** |
| Manual real device | **${manualPassed}/${MANUAL_REQUIRED} pass · ${manualFailed} fail · ${manualPending} pending** |
| Sign-off (signedBy/signedAt) | **${manualSigned ? 'TAK' : 'NIE'}** |
| **Certification** | **${certification}** |
| **Rekomendacja release** | **${recommendation}** |

### Skala

| Certification | Warunek |
|---------------|---------|
| **CERTIFIED / GOTOWA DO WYDANIA** | Live auto 10/10 PASS + manual 8/8 pass + signedBy |
| **CONDITIONAL / GOTOWA WARUNKOWO** | Live auto PASS · brak pełnego manual sign-off |
| **BLOCKED / NIEGOTOWA** | Choć jeden live FAIL lub manual FAIL |

> **Release Gate:** Zero cache · zero override · FAIL pozostaje FAIL.

---

## Wykonane testy (live)

| # | Test | Komenda | Wynik |
|---|------|---------|-------|
${gateRows}

---

## Metryki (auto)

| Metryka | Wartość |
|---------|---------|
| Bootstrap | ${report.metrics.bootstrapMs ?? '—'} ms |
| Listeners at boot | ${report.metrics.listenersAtBoot ?? '—'} |
| Timery at boot | ${report.metrics.timersAtBoot ?? '—'} |
| Obserwery at boot | ${report.metrics.observersAtBoot ?? '—'} |
| PWA version | v${report.metrics.pwaVersion} |

---

## Wykryte problemy

${issueBlocks}

---

## Następne kroki

${recommendation === 'GOTOWA DO WYDANIA'
    ? '1. Deploy\n2. Monitoring 48h (Error Feed)\n3. Archiwizuj FINAL-RELEASE-REPORT.json'
    : recommendation === 'GOTOWA WARUNKOWO'
        ? `1. Wypełnij \`docs/certification/manual-device-results.json\` (8/8 pass + signedBy/signedAt)\n2. \`npm run check:final-report\` → CERTIFIED\n3. Deploy dopiero po GOTOWA DO WYDANIA`
        : `1. **STOP deploy**\n2. Napraw FAIL z sekcji powyżej\n3. \`npm run check:final-report\` (live)`}

---

*ETAP 45-C · \`npm run check:final-report\` · zawsze live · bez cache*
`;

writeFileSync(OUT_MD, md, 'utf8');

const exitCode = recommendation === 'NIEGOTOWA' ? 1 : 0;
console.log(`\n[Release Gate] ${certification} · ${recommendation} · ryzyko: ${riskLevel}`);
console.log(`Auto: ${autoPassed}/${gateResults.length} PASS · Manual: ${manualPassed}/${MANUAL_REQUIRED} · signed: ${manualSigned ? 'yes' : 'no'}`);
console.log(`Wrote: docs/final/FINAL-RELEASE-REPORT.md`);
process.exit(exitCode);
