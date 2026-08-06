/**
 * Smoke ETAP 42 — Map Guardian
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
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

const mg = readFileSync(join(ROOT, 'js/diagnostics/mapGuardian.js'), 'utf8');
const map = readFileSync(join(ROOT, 'js/views/map.js'), 'utf8');
const mapCore = readFileSync(join(ROOT, 'js/map/map.js'), 'utf8');
const app = readFileSync(join(ROOT, 'js/app.js'), 'utf8');

assert(mg.includes('ETAP 42'), 'ETAP 42 header');
assert(mg.includes('restartMapOnly'), 'calls restartMapOnly');
assert(mg.includes('noFullReload') || mg.includes('restartMapOnly: true'), 'no full reload policy');
assert(mg.includes('tile-loaded') || mg.includes('tileLoaded'), 'tiles check');
assert(mg.includes('cluster'), 'cluster check');
assert(mg.includes('gps'), 'gps check');
assert(mg.includes('radius'), 'radius check');
assert(mg.includes('filter'), 'filter check');
assert(mg.includes('popup'), 'popup check');
assert(mg.includes('routing'), 'routing check');
assert(mg.includes('localOnly') || mg.includes('noNetwork'), 'local only');
assert(!/location\.reload|window\.location\s*=/.test(mg), 'no app reload');
assert(!/fetch\(|sendBeacon/.test(mg), 'no network');

assert(map.includes('export function restartMapOnly'), 'restartMapOnly export');
assert(map.includes('export function getMapHealthSnapshot'), 'getMapHealthSnapshot export');
assert(map.includes('tilesEverLoaded'), 'tile load tracking');
assert(mapCore.includes('getRegisteredMarkerCount'), 'marker count export');
assert(mapCore.includes('hasMarkerClusterGroup'), 'cluster export');
assertLazyDiagnosticsInit(assert, ROOT, 'mapGuardian.initMapGuardian', 'orchestrator lazy mapGuardian');
assert(app.includes('map.js?v=48'), 'app map v48');

for (const f of [
    'js/diagnostics/mapGuardian.js',
    'js/views/map.js',
    'js/map/map.js'
]) {
    const r = spawnSync(process.execPath, ['--check', f], { cwd: ROOT, encoding: 'utf8' });
    assert(r.status === 0, `syntax ${f}`);
}

const outDir = join(ROOT, 'docs', 'map-guardian');
mkdirSync(outDir, { recursive: true });
const md = `# ETAP 42 — Map Guardian

**Werdykt:** ${failed ? 'FAIL' : 'PASS'}  
**Data:** ${new Date().toISOString().slice(0, 10)}

## Cel

Najważniejszy strażnik mapy. Co ~5 s (gdy widok Mapa aktywny) sprawdza zdrowie Leaflet i przy zawieszeniu robi **restart tylko mapy** — bez przeładowania całej aplikacji.

## Checklista

| Check | Znaczenie |
|-------|-----------|
| leaflet-ready | \`L\` + instancja + kontener |
| tile-loaded | kafle załadowane (\`load\` / DOM) |
| markers | rejestr vs widoczni producenci |
| cluster | \`markerClusterGroup\` gdy plugin dostępny |
| gps | last-known / watch / tracking |
| radius | \`currentRadiusKm\` + slider |
| filter | \`activeCategoryFilter\` |
| popup | API Leaflet popup |
| routing | \`buildMultiStopMapsUrl\` (Google Maps dir) |

## Restart

1. Miękki \`healMapRuntimeState()\`
2. Jeśli nadal krytyczne → \`restartMapOnly()\` = \`destroyLeafletMap\` + \`renderMap\`
3. Cooldown ~28 s · bez \`location.reload\`

## API

\`\`\`js
__RG_MAP_GUARDIAN__.run()
__RG_MAP_GUARDIAN__.restart()  // force
__RG_MAP_GUARDIAN__.log()
__RG_MAP_GUARDIAN__.clear()
\`\`\`

Store: \`localStorage.rg_map_guardian_v1\`
`;

writeFileSync(join(outDir, 'ETAP-42-MAP-GUARDIAN.md'), md, 'utf8');
writeFileSync(join(outDir, 'latest.md'), md, 'utf8');
writeFileSync(join(outDir, 'latest.json'), JSON.stringify({
    id: 'etap-42-map-guardian',
    verdict: failed ? 'FAIL' : 'PASS',
    generatedAt: new Date().toISOString(),
    policy: {
        restartMapOnly: true,
        noFullReload: true,
        localOnly: true,
        intervalMs: 5000
    }
}, null, 2), 'utf8');

assert(existsSync(join(outDir, 'ETAP-42-MAP-GUARDIAN.md')), 'report');

console.log(failed ? `\n${failed} failed` : '\nMap Guardian smoke OK');
process.exit(failed ? 1 : 0);
