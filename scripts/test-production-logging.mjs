/**
 * Smoke test ETAP 31A Production Logging
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    LOG_LEVELS,
    shouldEmit,
    isDevDiagnosticMessage,
    getDefaultMinLevel,
    DEV_LOG_PATTERNS
} from '../js/core/logger.js';

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

assert(LOG_LEVELS.DEBUG < LOG_LEVELS.INFO, 'DEBUG < INFO');
assert(LOG_LEVELS.INFO < LOG_LEVELS.WARN, 'INFO < WARN');
assert(LOG_LEVELS.WARN < LOG_LEVELS.ERROR, 'WARN < ERROR');
assert(LOG_LEVELS.ERROR < LOG_LEVELS.FATAL, 'ERROR < FATAL');
assert(DEV_LOG_PATTERNS.length >= 10, 'diagnostic patterns');

assert(isDevDiagnosticMessage('[Health Monitor] Overall 98%'), 'detect Health');
assert(isDevDiagnosticMessage('[Emotion AI] gotowy'), 'detect Emotion');
assert(isDevDiagnosticMessage('[Product Director] mózg'), 'detect Director');
assert(isDevDiagnosticMessage('[Virtual User] start'), 'detect VU');
assert(isDevDiagnosticMessage('[Real Users] start'), 'detect RU');
assert(isDevDiagnosticMessage('[Living Brand] gotowy'), 'detect LB');
assert(isDevDiagnosticMessage('[Dev Dashboard] niedostępny'), 'detect Dashboard');
assert(isDevDiagnosticMessage('[Improvement] x'), 'detect Improvement');
assert(isDevDiagnosticMessage('[Daily Report] draft'), 'detect Daily');
assert(isDevDiagnosticMessage('[Weekly Premium]'), 'detect Weekly');
assert(!isDevDiagnosticMessage('[DataService] OSM error'), 'allow DataService');
assert(!isDevDiagnosticMessage('[Map] Błąd bindPopup'), 'allow Map errors');
assert(!isDevDiagnosticMessage('EventBus: błąd w listenerze'), 'allow EventBus');

// ETAP 40: produkcja = pełna cisza konsoli (raporty lokalnie w Console Guardian)
assert(
    !shouldEmit(LOG_LEVELS.INFO, ['[Home] click'], { minLevel: LOG_LEVELS.WARN, forceProduction: true }),
    'prod blocks INFO'
);
assert(
    !shouldEmit(LOG_LEVELS.DEBUG, ['debug'], { minLevel: LOG_LEVELS.WARN, forceProduction: true }),
    'prod blocks DEBUG'
);
assert(
    !shouldEmit(LOG_LEVELS.WARN, ['[Health Monitor] x'], { minLevel: LOG_LEVELS.WARN, forceProduction: true }),
    'prod blocks diagnostic WARN'
);
assert(
    !shouldEmit(LOG_LEVELS.WARN, ['[DataService] API failed'], { minLevel: LOG_LEVELS.WARN, forceProduction: true }),
    'prod silent real WARN (ETAP 40)'
);
assert(
    !shouldEmit(LOG_LEVELS.ERROR, ['[Map] crash'], { minLevel: LOG_LEVELS.WARN, forceProduction: true }),
    'prod silent ERROR (ETAP 40)'
);
assert(
    !shouldEmit(LOG_LEVELS.FATAL, ['[FATAL] boom'], { minLevel: LOG_LEVELS.WARN, forceProduction: true }),
    'prod silent FATAL (ETAP 40)'
);

// DEV: DEBUG ok
assert(
    shouldEmit(LOG_LEVELS.DEBUG, ['[Health Monitor] x'], { minLevel: LOG_LEVELS.DEBUG, forceProduction: false }),
    'dev allows diagnostic DEBUG when min=DEBUG'
);

const app = readFileSync(join(ROOT, 'js/app.js'), 'utf8');
assert(/installProductionConsole/.test(app), 'app.js installs logger');
assert(app.indexOf('installProductionConsole') < app.indexOf('initDiagnosticsOrchestrator'), 'logger before diagnostics orchestrator');

const core = readFileSync(join(ROOT, 'js/core/logger.js'), 'utf8');
assert(!/eventBus|leaflet|Store/.test(core) || /Nie zmienia/.test(core), 'logger isolated');

// Report
const day = new Date().toISOString();
const md = `# PRODUCTION LOGGING — ETAP 31A

Wygenerowano: ${day}

## Cel

Przygotowanie konsoli do wersji produkcyjnej: cisza diagnostyczna, pełne logi tylko na localhost.

## Poziomy

| Poziom | Wartość | Produkcja | Localhost |
|--------|--------:|:---------:|:---------:|
| DEBUG | ${LOG_LEVELS.DEBUG} | ukryty | ✔ |
| INFO | ${LOG_LEVELS.INFO} | ukryty | ✔ |
| WARN | ${LOG_LEVELS.WARN} | cisza (ETAP 40 → lokalny raport) | ✔ |
| ERROR | ${LOG_LEVELS.ERROR} | cisza (ETAP 40 → lokalny raport) | ✔ |
| FATAL | ${LOG_LEVELS.FATAL} | cisza (ETAP 40 → lokalny raport) | ✔ |

## Sterowanie

- **DEV** (localhost / 127.0.0.1 / file:) → domyślnie **DEBUG**
- **PRODUCTION** (Netlify / regionalergeschmack*) → **cisza konsoli** (ETAP 40)
- Localhost override: \`?log=INFO\` lub \`localStorage.rg_log_level\` · \`__RG_LOG__.setMinLevel('WARN')\`
- Raporty wyjątków: \`__RG_CONSOLE_GUARDIAN__.reports()\` · **bez sieci**

## ETAP 40 — Console Guardian

Na produkcji **0 warn / 0 error** w DevTools.  
Każdy wyjątek / warn / error → \`localStorage\` (\`rg_console_guardian_v1\`) ze stackiem, urządzeniem, przeglądarką, wersją PWA i ostatnią akcją.

## Implementacja

| Plik | Rola |
|------|------|
| \`js/core/logger.js\` | poziomy, filtr, \`installProductionConsole()\` |
| \`js/app.js\` | instalacja na starcie (przed diagnostykami) |

## Polityka

- **Nie zmienia architektury** (Store / EventBus / API / GPS / Leaflet / routing)
- **Nie zmienia funkcjonalności** produktu
- autoApply: false

## Smoke

\`npm run check:logging\` — ${failed ? 'FAIL' : 'PASS'}
`;

mkdirSync(join(ROOT, 'docs', 'logging'), { recursive: true });
writeFileSync(join(ROOT, 'docs', 'logging', 'PRODUCTION-LOGGING.md'), md, 'utf8');
writeFileSync(
    join(ROOT, 'docs', 'logging', 'PRODUCTION-LOGGING.json'),
    JSON.stringify({
        id: 'production-logging-31a',
        generatedAt: day,
        levels: LOG_LEVELS,
        policy: {
            devDefault: 'DEBUG',
            productionDefault: 'SILENT',
            etap40: true,
            autoApply: false
        },
        patterns: DEV_LOG_PATTERNS.length,
        smokeOk: failed === 0
    }, null, 2),
    'utf8'
);

assert(existsSync(join(ROOT, 'docs/logging/PRODUCTION-LOGGING.md')), 'report md');

if (failed) {
    console.error(`\n${failed} failed`);
    process.exit(1);
}
console.log('\nProduction Logging smoke OK');
console.log('Wrote: docs/logging/PRODUCTION-LOGGING.md');
