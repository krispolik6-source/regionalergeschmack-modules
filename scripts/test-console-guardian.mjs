/**
 * Smoke ETAP 40 — Console Guardian
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { LOG_LEVELS, shouldEmit } from '../js/core/logger.js';

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

const cg = readFileSync(join(ROOT, 'js/diagnostics/consoleGuardian.js'), 'utf8');
const logger = readFileSync(join(ROOT, 'js/core/logger.js'), 'utf8');
const app = readFileSync(join(ROOT, 'js/app.js'), 'utf8');

assert(cg.includes('ETAP 40'), 'ETAP 40 header');
assert(cg.includes('local-only') || cg.includes('noNetwork'), 'local-only policy');
assert(cg.includes('saveGuardianReport'), 'saveGuardianReport');
assert(cg.includes('lastAction') || cg.includes('recordUserAction'), 'last action');
assert(cg.includes('getPwaVersion'), 'pwa version');
assert(cg.includes('getDeviceInfo') || cg.includes('device:'), 'device');
assert(cg.includes('browser'), 'browser');
assert(cg.includes('stack'), 'stack');
assert(!/fetch\(|XMLHttpRequest|navigator\.sendBeacon|WebSocket/.test(cg), 'no network APIs');

assert(logger.includes('setConsoleCaptureHook'), 'capture hook');
assert(logger.includes('SILENT') || logger.includes('0 warn'), 'silent production policy');

assert(app.includes('initConsoleGuardian'), 'app init');
assert(app.indexOf('installProductionConsole') < app.indexOf('initConsoleGuardian'), 'logger before guardian');

// Production-like: zero console emission
assert(
    !shouldEmit(LOG_LEVELS.WARN, ['real warn'], { minLevel: LOG_LEVELS.WARN, forceProduction: true }),
    'prod silent WARN'
);
assert(
    !shouldEmit(LOG_LEVELS.ERROR, ['real error'], { minLevel: LOG_LEVELS.WARN, forceProduction: true }),
    'prod silent ERROR'
);
assert(
    !shouldEmit(LOG_LEVELS.FATAL, ['[FATAL] x'], { minLevel: LOG_LEVELS.WARN, forceProduction: true }),
    'prod silent FATAL'
);
assert(
    !shouldEmit(LOG_LEVELS.INFO, ['info'], { minLevel: LOG_LEVELS.WARN, forceProduction: true }),
    'prod silent INFO'
);

// DEV still allows
assert(
    shouldEmit(LOG_LEVELS.WARN, ['dev warn'], { minLevel: LOG_LEVELS.DEBUG, forceProduction: false }),
    'dev allows WARN'
);

for (const f of ['js/diagnostics/consoleGuardian.js', 'js/core/logger.js']) {
    const r = spawnSync(process.execPath, ['--check', f], { cwd: ROOT, encoding: 'utf8' });
    assert(r.status === 0, `syntax ${f}`);
}

const outDir = join(ROOT, 'docs', 'console-guardian');
mkdirSync(outDir, { recursive: true });
const md = `# ETAP 40 — Console Guardian

**Werdykt:** ${failed ? 'FAIL' : 'PASS'}  
**Data:** ${new Date().toISOString().slice(0, 10)}

## Produkcja

- **0 warningów** w konsoli
- **0 błędów** w konsoli
- Wyjątki / warn / error → **lokalny raport** (\`localStorage\`: \`rg_console_guardian_v1\`)
- **Bez wysyłania do Internetu**

## Pola raportu

| Pole | Opis |
|------|------|
| message | treść |
| stack | stack trace |
| device | UA, screen, viewport, memory… |
| browser | Chrome / Safari / … |
| pwaVersion | z \`?v=\` / SW |
| lastAction | ostatni click / navigate |
| transport | \`local-only\` |

## API

\`\`\`js
__RG_CONSOLE_GUARDIAN__.reports()
__RG_CONSOLE_GUARDIAN__.clear()
__RG_CONSOLE_GUARDIAN__.lastAction()
__RG_CONSOLE_GUARDIAN__.capture('msg', error)
\`\`\`

## Pliki

- \`js/diagnostics/consoleGuardian.js\`
- \`js/core/logger.js\` (hook + cisza produkcji)
- \`js/app.js\` — \`initConsoleGuardian()\` po loggerze
`;

writeFileSync(join(outDir, 'ETAP-40-CONSOLE-GUARDIAN.md'), md, 'utf8');
writeFileSync(join(outDir, 'latest.md'), md, 'utf8');
writeFileSync(join(outDir, 'latest.json'), JSON.stringify({
    id: 'etap-40-console-guardian',
    verdict: failed ? 'FAIL' : 'PASS',
    generatedAt: new Date().toISOString(),
    policy: {
        productionSilent: true,
        localOnly: true,
        noNetwork: true
    }
}, null, 2), 'utf8');

assert(existsSync(join(outDir, 'ETAP-40-CONSOLE-GUARDIAN.md')), 'report written');

console.log(failed ? `\n${failed} failed` : '\nConsole Guardian smoke OK');
process.exit(failed ? 1 : 0);
