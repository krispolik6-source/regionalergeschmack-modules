/**
 * Smoke test — Dev Status Board (panel w Menu)
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDevStatusBoard, renderDevStatusBoardHtml } from '../js/diagnostics/devStatusBoard.js';

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

const core = readFileSync(join(ROOT, 'js/diagnostics/devStatusBoard.js'), 'utf8');
assert(!/navigateTo|location\.reload|skipWaiting/.test(core), 'bez mutacji runtime');
assert(/autoFix:\s*false/.test(core) || /autoFix=false/.test(core), 'read-only note');

const board = buildDevStatusBoard({
    health: {
        overall: 99,
        scores: {
            performance: 97,
            pwa: 100,
            accessibility: 100,
            ux: 100
        },
        runtime: { jsErrors: 0, pwa: { sw: true, manifest: true }, cache: { caches: 2 } },
        findings: []
    },
    brand: { status: 'PASS' },
    livingBrand: { overall: 100 },
    mapSnapshot: {
        gpsOk: true,
        leafletCdn: true,
        markersOk: true,
        tileLoaded: true,
        clusterOk: true,
        panelHidden: true
    },
    consoleReports: [],
    uiFindings: [],
    storage: { cacheHuman: '42 MB', reports: 12 },
    docsStats: { reportCount: 143 },
    release: { readyForProduction: 'YES', releaseScore: 97 },
    intelligence: { regionScore: 91, signals: { reflectionReturn: 88 } },
    livingRegion: { regionPulse: 87 },
    trust: { summary: { averageTrustScore: 93 } },
    taste: { returnProbability: 85, tasteProfile: { score: 85 } },
    mapGuardian: { verdict: 'PASS' },
    uiGuardian: { verdict: 'PASS' }
});

assert(board.appName === 'Regionaler Geschmack', 'app name');
assert(/Version 1\.0/.test(board.versionLabel), 'version label');
assert(board.rows.find((r) => r.key === 'Health')?.value === 99, 'health 99');
assert(board.rows.find((r) => r.key === 'Performance')?.value === 97, 'perf 97');
assert(board.rows.find((r) => r.key === 'Release')?.value === 'READY', 'release READY');
assert(board.rows.find((r) => r.key === 'Console')?.value === 0, 'console 0');
assert(board.intelligence.find((r) => r.key === 'Region Brain')?.value === 91, 'region brain');
assert(board.intelligence.find((r) => r.key === 'Living Region')?.value === 87, 'living region');
assert(board.intelligence.find((r) => r.key === 'Trust')?.value === 93, 'trust');
assert(board.storeStatus.ready === true, 'store ready');
assert(/READY FOR STORE/.test(board.storeStatus.label), 'store label');

const html = renderDevStatusBoardHtml(board);
assert(/Regionaler Geschmack/.test(html), 'html brand');
assert(/Intelligence/.test(html), 'html intelligence');
assert(/READY FOR STORE/.test(html), 'html store');
assert(/data-dev-status-board/.test(html), 'html root attr');

const vault = readFileSync(join(ROOT, 'js/diagnostics/developerVaultPanel.js'), 'utf8');
assert(/devStatusBoard/.test(vault), 'vault imports status board');
assert(/data-dv-tab="status"/.test(vault), 'status tab');
assert(/setTab\('status'\)/.test(vault), 'default status tab');

assert(existsSync(join(ROOT, 'js/diagnostics/devStatusBoard.js')), 'file exists');

if (failed) {
    console.error(`\nDev Status Board: ${failed} fail(s)`);
    process.exit(1);
}
console.log('\nDev Status Board smoke OK');
