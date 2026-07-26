/**
 * Smoke test ETAP 23 – AI Quality Loop
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

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

const cliPath = join(ROOT, 'scripts/ai-quality-loop.mjs');
assert(existsSync(cliPath), 'scripts/ai-quality-loop.mjs');

const src = readFileSync(cliPath, 'utf8');
assert(src.includes('autoApply: false') || src.includes('autoApply:false'), 'autoApply false');
assert(src.includes('requiresHumanAcceptance'), 'requiresHumanAcceptance');
assert(src.includes('pending_approval'), 'pending_approval');
assert(!src.includes('autoFix: true'), 'brak autoFix true');
assert(src.includes('AI Guardian') || src.includes('guardian'), 'Guardian step');
assert(src.includes('application-health'), 'Health step');
assert(src.includes('virtual-user'), 'Virtual User step');
assert(src.includes('Learning'), 'Learning step');
assert(src.includes('improvement-engine'), 'Improvement step');
assert(src.includes('project-advisor'), 'Advisor step');

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
assert(pkg.scripts?.['quality-loop'], 'npm run quality-loop');
assert(pkg.scripts?.['check:quality-loop'], 'npm run check:quality-loop');

const readme = join(ROOT, 'docs/quality-loop/README.md');
assert(existsSync(readme), 'docs/quality-loop/README.md');
assert(readFileSync(readme, 'utf8').includes('autoApply: false'), 'README policy');

const cli = spawnSync(process.execPath, ['scripts/ai-quality-loop.mjs', '--dry-run'], {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env, NODE_ENV: 'development' }
});
assert(cli.status === 0, `dry-run exit 0 (got ${cli.status})`);
if (cli.status !== 0 && cli.stderr) console.error(cli.stderr.slice(0, 500));

assert(existsSync(join(ROOT, 'docs/quality-loop/latest.md')), 'latest.md');
assert(existsSync(join(ROOT, 'docs/quality-loop/latest.json')), 'latest.json');
assert(existsSync(join(ROOT, 'docs/quality-loop/fixes-pending.json')), 'fixes-pending.json');

const latest = JSON.parse(readFileSync(join(ROOT, 'docs/quality-loop/latest.json'), 'utf8'));
assert(latest.policy?.autoApply === false, 'policy.autoApply');
assert(latest.policy?.requiresHumanAcceptance === true, 'policy.requiresHumanAcceptance');
assert(Array.isArray(latest.fixes), 'fixes array');
assert(latest.fixes.every((f) => f.autoApply === false), 'all fixes autoApply false');
assert(latest.fixes.every((f) => f.status === 'pending_approval'), 'all pending_approval');
assert(latest.diff != null, 'diff present');
assert(latest.scores != null, 'scores present');

const pending = JSON.parse(readFileSync(join(ROOT, 'docs/quality-loop/fixes-pending.json'), 'utf8'));
assert(pending.policy?.autoApply === false, 'fixes-pending policy');

console.log(failed ? `\n${failed} failed` : '\nAll quality-loop checks passed.');
process.exit(failed ? 1 : 0);
