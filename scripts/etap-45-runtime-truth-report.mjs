/**
 * ETAP 45-E — Runtime Truth Report
 * Run: npm run check:runtime-truth
 *
 * Generuje docs/final/ETAP-45-RUNTIME-TRUTH.md + .json
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { isRuntimeVerified, isRuntimeNotVerified, RUNTIME_REQUIRES } from './lib/cert-check.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'docs', 'final');
const OUT_MD = join(OUT_DIR, 'ETAP-45-RUNTIME-TRUTH.md');
const OUT_JSON = join(OUT_DIR, 'ETAP-45-RUNTIME-TRUTH.json');
const CERT_DIR = join(ROOT, 'docs', 'certification');
const MANUAL_PATH = join(CERT_DIR, 'manual-device-results.json');
const FINAL_PATH = join(OUT_DIR, 'FINAL-RELEASE-REPORT.json');
const ETAP43_PATH = join(OUT_DIR, 'ETAP-43-RELEASE-CERTIFICATION.json');

const FRESH = process.argv.includes('--fresh');

const GATES = [
    { zadanie: 2, id: 'Z2-pwa-lifecycle', label: 'PWA Lifecycle', file: 'PWA-LIFECYCLE-VERIFICATION.json', cmd: 'check:pwa-lifecycle' },
    { zadanie: 3, id: 'Z3-pwa-icons', label: 'Ikony PWA', file: 'ICONS-VERIFICATION.json', cmd: 'check:pwa-icons' },
    { zadanie: 4, id: 'Z4-service-worker', label: 'Service Worker', file: 'SERVICE-WORKER-VERIFICATION.json', cmd: 'check:service-worker' },
    { zadanie: 5, id: 'Z5-dev-panel', label: 'Panel deweloperski', file: 'DEV-PANEL-VERIFICATION.json', cmd: 'check:dev-panel' },
    { zadanie: 6, id: 'Z6-user-journey', label: 'User Journey', file: 'USER-JOURNEY-VERIFICATION.json', cmd: 'check:user-journey' },
    { zadanie: 7, id: 'Z7-performance', label: 'Wydajność', file: 'PERFORMANCE-VERIFICATION.json', cmd: 'check:performance' },
    { zadanie: 8, id: 'Z8-resilience', label: 'Odporność', file: 'RESILIENCE-VERIFICATION.json', cmd: 'check:resilience' }
];

/** Fałszywie pozytywne testy naprawione w ETAP 45 */
const FALSE_POSITIVES_FIXED = [
    { file: 'scripts/etap-43-pwa-lifecycle-verification.mjs', line: 'T05-uninstall', reason: 'Warunek `|| true` wymuszał PASS bez weryfikacji localStorage', impact: 'Scenariusz odinstalowania raportowany jako PASS mimo braku dowodu persist/LS' },
    { file: 'scripts/test-self-reflection.mjs', line: 'T05-uninstall', reason: '`|| true` maskowało FAIL', impact: 'Self-reflection suite fałszywie zielona' },
    { file: 'scripts/etap-43-final-report.mjs', line: 'cacheFresh()', reason: 'Cached PASS dla bramek Z2–Z8 przy świeżym cache', impact: 'Release gate PASS bez live run' },
    { file: 'scripts/etap-43-final-report.mjs', line: 'verdict override', reason: 'Static FAIL→PASS override w werdykcie', impact: 'NIEGOTOWA zamieniana na GOTOWA WARUNKOWO' },
    { file: 'scripts/etap-43-performance-verification.mjs', line: 'P10–P11', reason: 'Grep wiring liczony jako auto PASS (render/FPS)', impact: 'Wydajność PASS bez pomiaru w przeglądarce' },
    { file: 'scripts/etap-43-performance-verification.mjs', line: 'P01–P04', reason: 'Node bootstrap ms jako RUNTIME PASS', impact: 'Bootstrap raportowany PASS bez PWA/telefonu' },
    { file: 'scripts/etap-43-user-journey-verification.mjs', line: 'J11–J13', reason: 'Node mock persist / Virtual User jako auto PASS', impact: 'Pełna ścieżka użytkownika PASS bez przeglądarki' },
    { file: 'scripts/etap-43-dev-panel-verification.mjs', line: 'E03 / F19', reason: 'Logika PIN bez wymogu runtime na urządzeniu', impact: 'Panel dev PASS bez telefonu/PWA' },
    { file: 'scripts/etap-43-resilience-verification.mjs', line: 'R02 / R05', reason: 'Chaos wiring bez DevTools/telefonu', impact: 'Odporność PASS bez symulacji offline' },
    { file: 'scripts/etap-43-icons-verification.mjs', line: 'I08 shortcuts', reason: 'Brak shortcuts = auto PASS zamiast N/A/runtime', impact: 'Ikony PASS bez weryfikacji launchera' },
    { file: 'js/core/offlineSync.js', line: 'caches.open', reason: 'Hardcoded `rg-runtime-images-v1`', impact: 'Stary cache ikon po update PWA' },
    { file: 'sw.js', line: 'CACHE_VERSION', reason: 'Hardcoded cache name poza pwaVersion.js', impact: 'Rozjechane wersje cache v28/v29/v30' },
    { file: 'scripts/etap-43-*-verification.mjs', line: 'release-candidate nested', reason: 'Zagnieżdżony RC w Z2/Z4/Z6/Z8', impact: 'Flaky chain · fałszywy PASS przy cache RC' }
];

/** Historyczne odwołania do cache usunięte w ETAP 45 */
const CACHE_ARTIFACTS_REMOVED = [
    { file: 'js/core/offlineSync.js', artifact: 'rg-runtime-images-v1', replacement: 'PWA_IMAGE_CACHE_NAME z pwaVersion.js' },
    { file: 'sw.js', artifact: 'hardcoded CACHE_VERSION / IMAGE_CACHE', replacement: 'PWA_CACHE_NAME bridge z pwaVersion.global.js' },
    { file: 'scripts/etap-43-final-report.mjs', artifact: 'cacheFresh() / CACHE_MAX_AGE_MS', replacement: 'live-only run (ETAP 45-C)' },
    { file: 'scripts/etap-43-final-report.mjs', artifact: 'cached PASS / source:cached', replacement: 'usunięte — werdykt tylko z live run' },
    { file: 'scripts/test-pwa-version-sync.mjs', artifact: 'hardcoded rg-pwa-v30', replacement: 'import z pwaVersion.js' },
    { file: 'scripts/etap-43-sw-verification.mjs', artifact: 'hardcoded rg-pwa-v30', replacement: 'PWA_CACHE_NAME z pwaVersion.js' },
    { file: 'scripts/etap-43-icons-verification.mjs', artifact: 'rg-runtime-images-v1 w runtime paths', replacement: 'skan + PWA_IMAGE_CACHE_NAME' }
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
    const r = spawnSync('npm', ['run', cmd], { cwd: ROOT, encoding: 'utf8', shell: true });
    return r.status === 0;
}

function collectLayerItems(node, gate, file, path = '') {
    const out = [];
    if (!node || typeof node !== 'object') return out;
    const hasIdentity = node.id || node.label || node.metric;
    if (node.layer && hasIdentity) {
        out.push({
            gate: gate.id,
            gateLabel: gate.label,
            zadanie: gate.zadanie,
            file: `docs/certification/${gate.file}`,
            path,
            id: node.id || node.metric,
            label: node.label || node.metric,
            layer: node.layer,
            status: node.status,
            detail: node.detail || node.note || '',
            nodeMeasured: node.nodeMeasured ?? null
        });
    }
    if (Array.isArray(node)) {
        node.forEach((v, i) => out.push(...collectLayerItems(v, gate, file, `${path}[${i}]`)));
    } else {
        for (const [k, v] of Object.entries(node)) {
            if (v && typeof v === 'object') {
                out.push(...collectLayerItems(v, gate, file, path ? `${path}.${k}` : k));
            }
        }
    }
    return out;
}

function mergeManualDeviceVerified(items, manualFile) {
    const results = manualFile?.results || [];
    const byId = new Map(results.map((r) => [r.id, r]));
    const deviceMatrix = [
        { id: '42A-pwa-version', label: 'PWA / SW / wersja', requires: ['PWA', 'Service Worker', 'Cache Storage'] },
        { id: '42B-icons', label: 'Ikony launcher / splash', requires: ['PWA', 'phone', 'Cache Storage'] },
        { id: '42C-dev-panel-phone', label: 'Panel deweloperski · PIN', requires: ['phone', 'PWA', 'sessionStorage'] },
        { id: '42D-prod-boot', label: 'Diagnostyka lazy · produkcja', requires: ['PWA', 'phone'] },
        { id: '42E-error-feed-mobile', label: 'Runtime Error Feed mobile', requires: ['phone', 'PWA'] },
        { id: '42F-cold-start-feel', label: 'Bootstrap · cold start', requires: ['PWA', 'phone'] },
        { id: '43-user-journey', label: 'Ścieżka użytkownika', requires: ['browser', 'PWA', 'localStorage'] },
        { id: '43-map-toolbar', label: 'Mapa · toolbar', requires: ['phone', 'browser'] }
    ];

    for (const row of deviceMatrix) {
        const signed = byId.get(row.id);
        const base = {
            gate: 'ETAP-43',
            gateLabel: 'Real Device Matrix',
            zadanie: 43,
            file: 'docs/certification/manual-device-results.json',
            path: `results.${row.id}`,
            id: row.id,
            label: row.label,
            layer: 'runtime',
            requires: row.requires,
            detail: signed?.notes || 'Macierz ETAP 43 — sign-off właściciela'
        };
        if (signed?.status === 'pass') {
            items.push({ ...base, status: 'verified', runtimeVerified: true, device: signed.device, testedAt: signed.testedAt });
        } else if (signed?.status === 'fail') {
            items.push({ ...base, status: 'fail' });
        } else {
            items.push({ ...base, status: 'not_verified' });
        }
    }
    return items;
}

function mapReleaseDecision({ staticFail, gateFail, manualFail, manualComplete, manualSigned, runtimeNotVerified }) {
    if (staticFail > 0 || gateFail > 0 || manualFail > 0) {
        return {
            decision: 'NOT READY',
            reason: staticFail > 0
                ? `${staticFail} obszar(ów) STATIC FAIL lub bramka subprocess FAIL.`
                : manualFail > 0
                    ? `${manualFail} test(ów) manual FAIL na urządzeniu.`
                    : 'Co najmniej jedna bramka live FAIL (np. ikony / RC).'
        };
    }
    if (manualComplete && manualSigned && runtimeNotVerified === 0) {
        return {
            decision: 'CERTIFIED',
            reason: 'STATIC VERIFIED + RUNTIME VERIFIED + sign-off 8/8 na urządzeniu.'
        };
    }
    return {
        decision: 'CONDITIONAL',
        reason: `STATIC VERIFIED · ${runtimeNotVerified} test(ów) RUNTIME NOT VERIFIED · brak pełnego sign-off (${manualComplete ? 'brak signedBy' : 'manual pending'}).`
    };
}

if (FRESH) {
    console.log('[ETAP 45-E] Odświeżanie bramek Z2–Z8…\n');
    for (const g of GATES) {
        process.stdout.write(`→ ${g.label}… `);
        console.log(runGate(g.cmd) ? 'OK' : 'FAIL');
    }
}

const allItems = [];
const gateSummaries = [];

for (const g of GATES) {
    const data = readJson(join(CERT_DIR, g.file));
    if (!data) continue;
    const items = collectLayerItems(data, g, g.file);
    allItems.push(...items);
    gateSummaries.push({
        zadanie: g.zadanie,
        gate: g.id,
        label: g.label,
        file: g.file,
        verdict: data.verdict,
        staticVerdict: data.staticVerdict,
        runtimeVerdict: data.runtimeVerdict,
        subprocess: data.automated ? `${data.automated.passed}/${data.automated.total}` : '—'
    });
}

const manualFile = readJson(MANUAL_PATH);
const deviceItems = mergeManualDeviceVerified([], manualFile);

const staticVerified = allItems.filter((i) => i.layer === 'static' && i.status === 'pass');
const staticFailed = allItems.filter((i) => i.layer === 'static' && i.status === 'fail');

const runtimeFromGates = allItems.filter((i) => i.layer === 'runtime');
const runtimeVerified = [
    ...runtimeFromGates.filter((i) => isRuntimeVerified(i)),
    ...deviceItems.filter((i) => isRuntimeVerified(i))
];
const runtimeNotVerified = [
    ...runtimeFromGates.filter((i) => isRuntimeNotVerified(i)),
    ...deviceItems.filter((i) => isRuntimeNotVerified(i))
];
const runtimeFailed = [
    ...runtimeFromGates.filter((i) => i.status === 'fail'),
    ...deviceItems.filter((i) => i.status === 'fail')
];

const finalReport = readJson(FINAL_PATH);
const etap43 = readJson(ETAP43_PATH);
const gateFailCount = gateSummaries.filter((g) => g.verdict === 'FAIL').length;
const subprocessFailCount = gateSummaries.filter((g) => {
    const data = readJson(join(CERT_DIR, g.file));
    return data?.automated && data.automated.passed < data.automated.total;
}).length;

const manualResults = manualFile?.results || [];
const manualPassed = manualResults.filter((r) => r.status === 'pass').length;
const manualFailed = manualResults.filter((r) => r.status === 'fail').length;
const manualSigned = Boolean(manualFile?.signedBy && manualFile?.signedAt);
const manualComplete = manualPassed === 8 && manualFailed === 0;

const release = mapReleaseDecision({
    staticFail: staticFailed.length,
    gateFail: gateFailCount + (subprocessFailCount > 0 && gateFailCount === 0 ? 1 : 0),
    manualFail: manualFailed,
    manualComplete,
    manualSigned,
    runtimeNotVerified: runtimeNotVerified.length
});

const report = {
    generatedAt: new Date().toISOString(),
    etap: '45-E',
    runtimeRequires: RUNTIME_REQUIRES,
    policy: {
        runtimeNeverPassWithoutExecution: true,
        unverifiedStatus: 'NOT VERIFIED',
        staticLabel: 'STATIC VERIFIED'
    },
    summary: {
        staticVerified: staticVerified.length,
        staticFailed: staticFailed.length,
        runtimeVerified: runtimeVerified.length,
        runtimeNotVerified: runtimeNotVerified.length,
        runtimeFailed: runtimeFailed.length,
        falsePositivesFixed: FALSE_POSITIVES_FIXED.length,
        cacheArtifactsRemoved: CACHE_ARTIFACTS_REMOVED.length,
        manualVerificationStillRequired: runtimeNotVerified.length,
        releaseDecision: release.decision
    },
    staticVerified: staticVerified.map((i) => ({
        id: i.id,
        label: i.label,
        gate: i.gateLabel,
        file: i.file,
        path: i.path,
        detail: i.detail
    })),
    runtimeVerified: runtimeVerified.map((i) => ({
        id: i.id,
        label: i.label,
        gate: i.gateLabel,
        file: i.file,
        path: i.path,
        detail: i.detail,
        device: i.device || null
    })),
    runtimeNotVerified: runtimeNotVerified.map((i) => ({
        id: i.id,
        label: i.label,
        gate: i.gateLabel,
        file: i.file,
        path: i.path,
        detail: i.detail,
        requires: i.requires || RUNTIME_REQUIRES,
        nodeMeasured: i.nodeMeasured ?? null
    })),
    falsePositive: FALSE_POSITIVES_FIXED,
    cacheArtifactsRemoved: CACHE_ARTIFACTS_REMOVED,
    gateSummaries,
    releaseDecision: release,
    etap43Verdict: etap43?.verdict ?? null,
    finalGate: finalReport?.recommendationEn ?? null
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_JSON, JSON.stringify(report, null, 2), 'utf8');

const md = `# ETAP 45 — Runtime Truth Report

**Data:** ${report.generatedAt.slice(0, 10)}  
**Release Decision:** **${release.decision}**

${release.reason}

---

## 1. STATIC VERIFIED

Obszary potwierdzone analizą kodu (struktura · importy · wersje · manifest · SW · konfiguracja).

**${staticVerified.length}** check(ów) · **${staticFailed.length}** FAIL

| ID | Obszar | Gate | Plik |
|----|--------|------|------|
${staticVerified.slice(0, 80).map((i) => `| ${i.id} | ${i.label} | ${i.gate} | \`${relative(ROOT, join(ROOT, i.file))}\` |`).join('\n')}
${staticVerified.length > 80 ? `\n*… i ${staticVerified.length - 80} więcej (pełna lista w JSON)*` : ''}

${staticFailed.length ? `\n### STATIC FAIL\n${staticFailed.map((i) => `- **${i.id}** (${i.gateLabel}): ${i.detail}`).join('\n')}` : ''}

---

## 2. RUNTIME VERIFIED

Testy rzeczywiście wykonane (przeglądarka · PWA · telefon · SW · storage).

**${runtimeVerified.length}** test(ów)

${runtimeVerified.length
    ? runtimeVerified.map((i) => `- **${i.id}** — ${i.label} · ${i.gateLabel}${i.device ? ` · ${i.device}` : ''}`).join('\n')
    : '_Brak — wymaga sign-off na urządzeniu._'}

---

## 3. RUNTIME NOT VERIFIED

Testy wymagające prawdziwego urządzenia / przeglądarki. Status: **NOT VERIFIED** (nigdy PASS).

**${runtimeNotVerified.length}** test(ów)

| ID | Test | Gate | Wymaga |
|----|------|------|--------|
${runtimeNotVerified.slice(0, 60).map((i) => `| ${i.id} | ${i.label} | ${i.gate} | ${(i.requires || RUNTIME_REQUIRES).slice(0, 3).join(', ')}… |`).join('\n')}
${runtimeNotVerified.length > 60 ? `\n*… i ${runtimeNotVerified.length - 60} więcej*` : ''}

---

## 4. FALSE POSITIVE

Testy, które wcześniej mogły zwracać PASS mimo braku rzeczywistej weryfikacji — **naprawione w ETAP 45**.

| Plik | Linia / ID | Przyczyna | Wpływ |
|------|------------|-----------|-------|
${FALSE_POSITIVES_FIXED.map((f) => `| \`${f.file}\` | ${f.line} | ${f.reason} | ${f.impact} |`).join('\n')}

---

## 5. Release Decision

**${release.decision}**

${release.reason}

| Sygnał | Wartość |
|--------|---------|
| STATIC VERIFIED | ${staticVerified.length} |
| STATIC FAIL | ${staticFailed.length} |
| RUNTIME VERIFIED | ${runtimeVerified.length} |
| RUNTIME NOT VERIFIED | ${runtimeNotVerified.length} |
| Fałszywie pozytywne (naprawione) | ${FALSE_POSITIVES_FIXED.length} |
| Cache artifacts usunięte | ${CACHE_ARTIFACTS_REMOVED.length} |
| Final gate (45-C) | ${finalReport?.recommendationEn ?? '—'} |

---

*ETAP 45-E · \`npm run check:runtime-truth\` · \`--fresh\` odświeża Z2–Z8*
`;

writeFileSync(OUT_MD, md, 'utf8');

const exitCode = release.decision === 'NOT READY' ? 1 : 0;

console.log(`\nPoprawione fałszywie pozytywne testy: ${FALSE_POSITIVES_FIXED.length}`);
console.log(`Usunięte historyczne odwołania do cache: ${CACHE_ARTIFACTS_REMOVED.length}`);
console.log(`Miejsc wymagających ręcznej weryfikacji: ${runtimeNotVerified.length}`);
console.log(`Końcowy status: ${release.decision}`);
console.log(`\nWrote: docs/final/ETAP-45-RUNTIME-TRUTH.md`);

process.exit(exitCode);
