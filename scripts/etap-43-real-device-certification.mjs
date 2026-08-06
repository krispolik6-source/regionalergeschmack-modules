/**
 * ETAP 45-C — Real Device Validation & Release Certification
 *
 * Nie zastępuje testów na telefonie — generuje bramkę auto (live) + macierz manualną.
 * docs/certification/manual-device-results.json — sign-off właściciela (8/8 + signedBy)
 *
 * ZASADY:
 * - brak manual 8/8 → brak CERTIFIED
 * - brak signedBy/signedAt → CONDITIONAL
 * - FAIL nigdy nie staje się PASS (zero cache / override)
 *
 * Run: npm run check:etap-43
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'docs', 'final');
const CERT_JSON = join(OUT_DIR, 'ETAP-43-RELEASE-CERTIFICATION.json');
const CERT_MD = join(OUT_DIR, 'ETAP-43-RELEASE-CERTIFICATION.md');
const MANUAL_PATH = join(ROOT, 'docs', 'certification', 'manual-device-results.json');
const DAY = new Date().toISOString().slice(0, 10);

const AUTOMATED_GATES = [
    { id: 'etap-42g', label: 'ETAP 42G full suite', cmd: 'npm', args: ['run', 'check:etap-42g'] },
    { id: 'release-candidate', label: 'Release Candidate 22/22', cmd: 'npm', args: ['run', 'release-candidate'] },
    { id: 'device-lab', label: 'Device Lab matrix', cmd: 'npm', args: ['run', 'device-lab-audit'] },
    { id: 'pwa-version', label: 'PWA version v30 sync', cmd: 'npm', args: ['run', 'check:pwa-version'] },
    { id: 'icon-refresh', label: 'Icon refresh v30', cmd: 'npm', args: ['run', 'check:icon-refresh'] },
    { id: 'dev-access', label: 'Dev Vault PIN access', cmd: 'npm', args: ['run', 'check:dev-access'] },
    { id: 'orchestrator', label: 'Diagnostics lazy orchestrator', cmd: 'npm', args: ['run', 'check:diagnostics-orchestrator'] },
    { id: 'error-feed', label: 'Runtime Error Feed', cmd: 'npm', args: ['run', 'check:runtime-error-feed'] },
    { id: 'bootstrap', label: 'Bootstrap Before/After', cmd: 'npm', args: ['run', 'check:bootstrap'] }
];

/** Macierz manualna — ETAP 42 na prawdziwym urządzeniu (właściciel). */
const MANUAL_MATRIX = [
    {
        id: '42A-pwa-version',
        etap: '42A',
        area: 'PWA / SW / wersja',
        devices: ['iPhone PWA', 'Android PWA', 'Desktop'],
        steps: [
            'Zainstaluj PWA z produkcji lub LAN',
            'DevTools → Application → Service Worker: scriptURL zawiera ?v=30',
            'Po deploy nowej wersji: SW skipWaiting + odświeżenie bez rozjechanych cache v28/v29'
        ],
        pass: 'Jedna wersja PWA (30) w SW, manifest, ikonach, bundle'
    },
    {
        id: '42B-icons',
        etap: '42B',
        area: 'Ikony launcher / splash / favicon',
        devices: ['iPhone', 'Android', 'Desktop'],
        steps: [
            'Po update PWA: ikona na ekranie domowym pokazuje aktualny master (dwa kłosy)',
            'Splash / favicon / maskable — bez starej ikony z cache',
            'Powiadomienie push (jeśli włączone) — ikona ?v=30'
        ],
        pass: 'Ikony odświeżone po update bez odinstalowania'
    },
    {
        id: '42C-dev-panel-phone',
        etap: '42C',
        area: 'Panel deweloperski · PIN',
        devices: ['iPhone Safari', 'iPhone PWA', 'Android Chrome', 'LAN telefon'],
        steps: [
            '☰ → Panel deweloperski — widoczny bez localhost/desktop gate',
            'PIN 1973 → Control Center otwarty fullscreen na telefonie',
            'Zły PIN → bramka, brak narzędzi',
            'Zablokuj → ponowne wejście wymaga PIN'
        ],
        pass: 'Ten sam mechanizm PIN na telefonie, LAN i PWA'
    },
    {
        id: '42D-prod-boot',
        etap: '42D',
        area: 'Diagnostyka lazy · produkcja',
        devices: ['Produkcja PWA', 'Telefon bez ?dev=1'],
        steps: [
            'Cold start produkcji (bez ?dev=1, bez rg_dev_mode)',
            'Aplikacja startuje normalnie — mapa, koszyk, premium działają',
            'Brak FAB Health/Dashboard na ekranie użytkownika',
            'Dopiero PIN → lazy load diagnostyki'
        ],
        pass: 'Użytkownik nie płaci kosztu 18 modułów diag przy starcie'
    },
    {
        id: '42E-error-feed-mobile',
        etap: '42E',
        area: 'Runtime Error Feed',
        devices: ['iPhone PWA', 'Android'],
        steps: [
            'PIN → Runtime Error Feed',
            'Lista kategorii scrolluje poziomo (mobile)',
            'Dotknij wpis → stack / szczegóły',
            'Odśwież · Kopiuj JSON · Zamknij — bez DevTools'
        ],
        pass: 'Feed czytelny i używalny na telefonie'
    },
    {
        id: '42F-cold-start-feel',
        etap: '42F',
        area: 'Bootstrap · cold start',
        devices: ['iPhone PWA', 'Android PWA', 'Desktop'],
        steps: [
            'Force-quit PWA → uruchom ponownie',
            'Splash znika · Home/Map gotowe bez zawieszenia',
            'Opcjonalnie: __RG_BOOTSTRAP__.report() po ?dev=1 — bootstrapMs ~50ms shell'
        ],
        pass: 'Subiektywnie szybszy cold start vs ETAP 41 (brak lag diagnostyki)'
    },
    {
        id: '43-user-journey',
        etap: '43',
        area: 'Ścieżka użytkownika (regresja)',
        devices: ['Wszystkie'],
        steps: [
            'Home → Mapa → producent → ulubione → koszyk',
            'GPS / w pobliżu — mapa reaguje',
            'Tryb offline → banner → powrót online',
            'Zmiana języka · dark mode · powrót następnego dnia (persist)'
        ],
        pass: 'Zero regresji produktu po ETAP 42'
    },
    {
        id: '43-map-toolbar',
        etap: '42 P0',
        area: 'Mapa · toolbar / footer',
        devices: ['iPhone SE', 'iPhone 15', 'Android'],
        steps: [
            'Mapa: dolny toolbar nie zasłania popupów',
            'Rozwinięty header nie psuje viewport mapy',
            'Scroll listy producentów na mapie — bez horizontal overflow'
        ],
        pass: 'Mapa używalna na małym i dużym telefonie'
    }
];

function runGate(gate) {
    const r = spawnSync(gate.cmd, gate.args, {
        cwd: ROOT,
        encoding: 'utf8',
        shell: true,
        env: { ...process.env, FORCE_COLOR: '0' }
    });
    return {
        ...gate,
        ok: r.status === 0,
        exitCode: r.status ?? 1,
        tail: `${r.stdout || ''}${r.stderr || ''}`.trim().split(/\r?\n/).slice(-5).join('\n')
    };
}

function loadManualResults() {
    if (!existsSync(MANUAL_PATH)) return null;
    try {
        return JSON.parse(readFileSync(MANUAL_PATH, 'utf8'));
    } catch {
        return null;
    }
}

function mergeManual(manualFile) {
    const byId = new Map((manualFile?.results || []).map((r) => [r.id, r]));
    return MANUAL_MATRIX.map((row) => {
        const signed = byId.get(row.id);
        return {
            ...row,
            status: signed?.status || 'pending',
            testedAt: signed?.testedAt || null,
            device: signed?.device || null,
            notes: signed?.notes || null,
            tester: signed?.tester || null
        };
    });
}

console.log('[ETAP 43] Release Certification — automated gates\n');

const automated = [];
for (const gate of AUTOMATED_GATES) {
    process.stdout.write(`→ ${gate.label}… `);
    const res = runGate(gate);
    automated.push(res);
    console.log(res.ok ? 'PASS' : `FAIL (${res.exitCode})`);
}

const autoPass = automated.filter((g) => g.ok).length;
const autoOk = autoPass === automated.length;

const manualFile = loadManualResults();
const manualRows = mergeManual(manualFile);
const manualDone = manualRows.filter((r) => r.status === 'pass').length;
const manualFail = manualRows.filter((r) => r.status === 'fail').length;
const manualPending = manualRows.filter((r) => r.status === 'pending').length;
const manualSigned = Boolean(manualFile?.signedBy && manualFile?.signedAt);
const manualComplete = manualDone === manualRows.length && manualFail === 0;

let verdict = 'BLOCKED';
let verdictLabel = 'BLOCKED — napraw bramki automatyczne';
if (autoOk && manualComplete && manualSigned) {
    verdict = 'CERTIFIED';
    verdictLabel = 'CERTIFIED — auto + real device sign-off (8/8 + signedBy)';
} else if (autoOk && manualFail === 0) {
    verdict = 'CONDITIONAL';
    const why = !manualComplete
        ? `manual ${manualDone}/${manualRows.length} pending`
        : 'brak signedBy/signedAt';
    verdictLabel = `CONDITIONAL — auto PASS · ${why}`;
} else if (autoOk && manualFail > 0) {
    verdict = 'FAIL';
    verdictLabel = `FAIL — ${manualFail} manual test(s) failed`;
}

const report = {
    generatedAt: new Date().toISOString(),
    day: DAY,
    etap: '45-C',
    role: 'Real Device Validation & Release Certification',
    verdict,
    verdictLabel,
    autoApply: false,
    mode: 'live-only',
    policy: {
        liveRunOnly: true,
        noCachedPass: true,
        noFailOverride: true,
        noStaticPassReplacingFail: true,
        certifiedRequiresManual: `${manualRows.length}/${manualRows.length}`,
        conditionalWithoutSignOff: true,
        noNewFeatures: true,
        noRefactor: true,
        noUiChanges: true,
        ownerSignOffRequired: true
    },
    automated: {
        passed: autoPass,
        total: automated.length,
        ok: autoOk,
        gates: automated
    },
    manual: {
        total: manualRows.length,
        pass: manualDone,
        fail: manualFail,
        pending: manualPending,
        signed: manualSigned,
        complete: manualComplete,
        signedBy: manualFile?.signedBy ?? null,
        signedAt: manualFile?.signedAt ?? null,
        resultsPath: 'docs/certification/manual-device-results.json',
        matrix: manualRows
    },
    etap42Scope: ['42A PWA version', '42B Icons', '42C Dev PIN', '42D Orchestrator', '42E Error Feed', '42F Bootstrap', '42G Test suite'],
    releaseDecision: autoOk
        ? (verdict === 'CERTIFIED'
            ? 'Gotowe do release — właściciel podpisał urządzenia.'
            : 'Nie release bez manual sign-off na telefonie/PWA.')
        : 'Nie release — bramki auto nie przeszły.'
};

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(join(ROOT, 'docs', 'certification'), { recursive: true });
writeFileSync(CERT_JSON, JSON.stringify(report, null, 2), 'utf8');

const md = `# ETAP 45-C — Real Device Validation & Release Certification

**Data:** ${report.generatedAt.slice(0, 10)}  
**Werdykt:** **${verdict}**  
**${verdictLabel}**

> Testy automatyczne ≠ sukces na urządzeniu. **Live only** — zero cache · zero override · FAIL pozostaje FAIL.

## Werdykt

| Warstwa | Wynik |
|---------|--------|
| Bramki automatyczne (live) | **${autoPass}/${automated.length}** ${autoOk ? 'PASS' : 'FAIL'} |
| Macierz manualna (real device) | **${manualDone}/${manualRows.length}** pass · ${manualPending} pending · ${manualFail} fail |
| Sign-off (signedBy/signedAt) | **${manualSigned ? 'TAK' : 'NIE'}** |
| **Certification** | **${verdict}** |

### Skala

| Certification | Warunek |
|---------------|---------|
| **CERTIFIED** | Live auto PASS + manual 8/8 pass + signedBy |
| **CONDITIONAL** | Live auto PASS · brak pełnego sign-off |
| **BLOCKED / FAIL** | Auto FAIL lub manual FAIL |

## ETAP 42 — zakres do potwierdzenia na urządzeniu

| ID | Obszar | Auto | Manual |
|----|--------|------|--------|
| 42A | PWA version v30 (SW/manifest/bundle) | ✅ check:pwa-version | ${manualRows.find(r => r.id === '42A-pwa-version')?.status || 'pending'} |
| 42B | Icon refresh po update | ✅ check:icon-refresh | ${manualRows.find(r => r.id === '42B-icons')?.status || 'pending'} |
| 42C | Dev Panel · PIN (phone/LAN/PWA) | ✅ check:dev-access | ${manualRows.find(r => r.id === '42C-dev-panel-phone')?.status || 'pending'} |
| 42D | Diagnostyka lazy · prod shell | ✅ orchestrator | ${manualRows.find(r => r.id === '42D-prod-boot')?.status || 'pending'} |
| 42E | Runtime Error Feed mobile | ✅ error-feed | ${manualRows.find(r => r.id === '42E-error-feed-mobile')?.status || 'pending'} |
| 42F | Bootstrap cold start | ✅ bootstrap | ${manualRows.find(r => r.id === '42F-cold-start-feel')?.status || 'pending'} |
| 42G | Pełny suite | ✅ etap-42g | — (auto) |

## Bramki automatyczne

| Gate | Status |
|------|--------|
${automated.map((g) => `| ${g.label} | ${g.ok ? '✅ PASS' : '❌ FAIL'} |`).join('\n')}

## Macierz manualna — jak prawdziwy użytkownik

${manualRows.map((r) => `
### ${r.id} — ${r.area} (${r.etap})

**Urządzenia:** ${r.devices.join(' · ')}  
**Status:** \`${r.status}\`${r.device ? ` · ${r.device}` : ''}${r.testedAt ? ` · ${r.testedAt}` : ''}

1. ${r.steps.join('\n1. ')}

**Pass:** ${r.pass}
`).join('\n')}

## Sign-off właściciela (real device)

1. Wykonaj macierz na **iPhone (Safari + PWA)** i **Android (Chrome + PWA)** minimum.
2. LAN: \`npm start\` → telefon \`http://192.168.x.x:3456\`
3. Wypełnij \`docs/certification/manual-device-results.json\` (szablon poniżej).
4. Uruchom ponownie: \`npm run etap-43-certification\`

\`\`\`json
{
  "signedBy": "właściciel",
  "signedAt": "${new Date().toISOString()}",
  "results": [
    { "id": "42A-pwa-version", "status": "pass", "device": "iPhone 15 PWA", "testedAt": "${DAY}", "notes": "" }
  ]
}
\`\`\`

## Decyzja release

${report.releaseDecision}

---
*ETAP 45-C · live-only · autoApply=false · pending_acceptance do manual sign-off*
`;

writeFileSync(CERT_MD, md, 'utf8');

if (!existsSync(MANUAL_PATH)) {
    writeFileSync(MANUAL_PATH.replace('.json', '.template.json'), JSON.stringify({
        signedBy: null,
        signedAt: null,
        results: MANUAL_MATRIX.map((r) => ({
            id: r.id,
            status: 'pending',
            device: null,
            testedAt: null,
            notes: null
        }))
    }, null, 2), 'utf8');
}

console.log(`\n[ETAP 45-C] ${verdict} · auto ${autoPass}/${automated.length} · manual ${manualDone}/${manualRows.length} · signed: ${manualSigned ? 'yes' : 'no'}`);
console.log(`Wrote: docs/final/ETAP-43-RELEASE-CERTIFICATION.md`);
if (!autoOk || manualFail > 0) process.exit(1);
process.exit(0);
