/**
 * Audit: runtime must not fetch /docs/ outside Dev Vault on dev host.
 * Run: node scripts/test-docs-fetch-guard.mjs
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function ok(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error('FAIL', msg);
    } else {
        console.log('OK  ', msg);
    }
}

const rm = readFileSync(join(ROOT, 'js/diagnostics/reportManagerClient.js'), 'utf8');
const dsb = readFileSync(join(ROOT, 'js/diagnostics/devStatusBoard.js'), 'utf8');
const app = readFileSync(join(ROOT, 'js/app.js'), 'utf8');

ok(rm.includes('export function canFetchDocsRuntime'), 'canFetchDocsRuntime exported');
ok(/canFetchDocsRuntime\(\)/.test(rm), 'reportManagerClient guards docs fetch');
ok(!/replace\(\/\\\.md\$\/i, '\\.json'\)/.test(rm), 'no md→json derivation (404 source removed)');
ok(dsb.includes('canFetchDocsRuntime'), 'devStatusBoard imports guard');
ok(/docsFetchAllowed\s*=\s*canFetchDocsRuntime/.test(dsb), 'devStatusBoard skips docs when blocked');

// Jedyny dozwolony fetch /docs/ w runtime JS — za bramką canFetchDocsRuntime
const fetchDocsMatches = [...rm.matchAll(/fetch\s*\(\s*['"`]\/docs/g)].length;
ok(fetchDocsMatches <= 2, `reportManagerClient: at most 2 literal /docs/ fetches (${fetchDocsMatches})`);

ok(!/fetch\s*\(\s*['"`]\/docs/.test(dsb.replace(/fetchJson\('\/docs/g, '')), 'devStatusBoard uses fetchJson wrapper only');

// app.js nie pobiera docs bezpośrednio
ok(!/fetch\s*\(\s*['"`]\/docs/.test(app), 'app.js has no direct /docs/ fetch');

console.log(failed ? `\nRESULT FAIL ${failed}` : '\nRESULT PASS');
process.exit(failed ? 1 : 0);
