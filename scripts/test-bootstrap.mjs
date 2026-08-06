/**
 * ETAP 42F — bootstrap audit smoke test
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function ok(m) { console.log(`✅ ${m}`); }
function fail(m) { failed++; console.error(`❌ ${m}`); }

const app = readFileSync(join(ROOT, 'js/app.js'), 'utf8');
const profiler = readFileSync(join(ROOT, 'js/core/bootstrapProfiler.js'), 'utf8');
const orch = readFileSync(join(ROOT, 'js/diagnostics/diagnosticsOrchestrator.js'), 'utf8');

if (app.includes('startBootstrapProfile') && app.includes('finishBootstrapProfile')) ok('app: bootstrap profiler');
else fail('app: brak profiler');

if (app.includes('recordBootstrapInit')) ok('app: init tracking');
else fail('app: brak recordBootstrapInit');

if (!app.includes('initHealthMonitor()')) ok('app: brak eager health monitor');
else fail('app: nadal eager health');

if (profiler.includes('__RG_BOOTSTRAP__')) ok('profiler: global API');
else fail('profiler: brak API');

if (orch.includes('profileLazyDiagnosticsLoad')) ok('orchestrator: lazy profile');
else fail('orchestrator: brak lazy profile');

const run = spawnSync(process.execPath, ['scripts/bootstrap-benchmark.mjs'], { cwd: ROOT, encoding: 'utf8' });
if (run.status === 0) ok('bootstrap-benchmark.mjs exit 0');
else fail(`bootstrap-benchmark exit ${run.status}: ${run.stderr?.slice(0, 200)}`);

const run2 = spawnSync(process.execPath, ['scripts/bootstrap-audit.mjs'], { cwd: ROOT, encoding: 'utf8' });
if (run2.status === 0) ok('bootstrap-audit.mjs exit 0');
else fail(`bootstrap-audit exit ${run2.status}`);

if (existsSync(join(ROOT, 'docs/bootstrap/latest.md'))) ok('report latest.md');
else fail('brak latest.md');

if (existsSync(join(ROOT, 'docs/bootstrap/latest.json'))) ok('report latest.json');
else fail('brak latest.json');

const json = JSON.parse(readFileSync(join(ROOT, 'docs/bootstrap/latest.json'), 'utf8'));
if (json.before?.diagnosticInitsEager === 18) ok('report: before 18 eager');
else fail('report: before baseline');

if (json.after?.diagnosticInitsEager === 1) ok('report: after 1 eager shell');
else fail('report: after shell');

if (json.comparison?.listeners?.deferred > 0) ok('report: listeners deferred');
else fail('report: listeners delta');

if (json.after?.bootstrapMs != null && json.after.bootstrapMs > 0) ok(`report: bootstrapMs ${json.after.bootstrapMs}`);
else fail('report: brak bootstrapMs — uruchom npm run bootstrap-report');

const beforeMs = json.before?.bootstrapMs ?? json.baseline?.bootstrapMs;
if (beforeMs != null && beforeMs > 0) ok(`report: before bootstrapMs ${beforeMs}`);
else fail('report: brak before bootstrapMs');

console.log(failed ? `\nBOOTSTRAP TEST FAILED (${failed})` : '\nBOOTSTRAP TEST OK');
process.exit(failed ? 1 : 0);
