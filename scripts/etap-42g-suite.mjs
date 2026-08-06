/**
 * ETAP 42G — pełna weryfikacja po zadaniach A–F.
 * Run: npm run check:etap-42g
 */
import { spawnSync } from 'node:child_process';
import { existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs', 'audit', 'ETAP-42G-SUITE.json');

const STEPS = [
    { area: 'Bootstrap', cmd: 'npm', args: ['run', 'check:bootstrap'] },
    { area: 'Bootstrap report', cmd: 'npm', args: ['run', 'bootstrap-report'] },
    { area: 'PWA', cmd: 'npm', args: ['run', 'check:pwa'] },
    { area: 'PWA version', cmd: 'npm', args: ['run', 'check:pwa-version'] },
    { area: 'Service Worker', cmd: 'npm', args: ['run', 'check:pwa-version'] },
    { area: 'Manifest', cmd: 'npm', args: ['run', 'check:pwa'] },
    { area: 'Icons', cmd: 'node', args: ['scripts/test-icon-refresh.mjs'] },
    { area: 'Offline', cmd: 'npm', args: ['run', 'check:pwa'] },
    { area: 'Translations', cmd: 'npm', args: ['run', 'check:translations'] },
    { area: 'Map', cmd: 'npm', args: ['run', 'check:map-guardian'] },
    { area: 'Premium', cmd: 'npm', args: ['run', 'check:premium-audit'] },
    { area: 'Vault', cmd: 'npm', args: ['run', 'check:dev-vault'] },
    { area: 'Developer Panel', cmd: 'node', args: ['scripts/test-dev-access.mjs'] },
    { area: 'Diagnostics orchestrator', cmd: 'npm', args: ['run', 'check:diagnostics-orchestrator'] },
    { area: 'Health', cmd: 'npm', args: ['run', 'check:health'] },
    { area: 'Console', cmd: 'npm', args: ['run', 'check:console-guardian'] },
    { area: 'Console logging', cmd: 'npm', args: ['run', 'check:logging'] },
    { area: '404 / docs guard', cmd: 'node', args: ['scripts/test-docs-fetch-guard.mjs'] },
    { area: 'Runtime Error Feed', cmd: 'node', args: ['scripts/test-runtime-error-feed.mjs'] },
    { area: 'Performance', cmd: 'npm', args: ['run', 'check:css-performance'] },
    { area: 'Memory', cmd: 'npm', args: ['run', 'check:memory-cleaner'] },
    { area: 'Functional', cmd: 'npm', args: ['run', 'check:functional'] },
    { area: 'Release Candidate', cmd: 'npm', args: ['run', 'release-candidate'] }
];

function runStep(step) {
    const r = spawnSync(step.cmd, step.args, {
        cwd: ROOT,
        encoding: 'utf8',
        shell: true,
        env: { ...process.env, FORCE_COLOR: '0' }
    });
    const out = `${r.stdout || ''}${r.stderr || ''}`.trim();
    const tail = out.split(/\r?\n/).slice(-8).join('\n');
    return {
        area: step.area,
        ok: r.status === 0,
        exitCode: r.status ?? 1,
        tail
    };
}

console.log('[ETAP 42G] Full verification suite\n');

const seen = new Set();
const results = [];
for (const step of STEPS) {
    const key = `${step.cmd} ${step.args.join(' ')}`;
    if (seen.has(key)) continue;
    seen.add(key);
    process.stdout.write(`→ ${step.area}… `);
    const res = runStep(step);
    results.push(res);
    console.log(res.ok ? 'PASS' : `FAIL (${res.exitCode})`);
    if (!res.ok) console.log(res.tail);
}

const passed = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok);
const report = {
    generatedAt: new Date().toISOString(),
    etap: '42G',
    passed,
    total: results.length,
    ok: failed.length === 0,
    results
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');

console.log(`\n[ETAP 42G] ${passed}/${results.length} PASS`);
if (failed.length) {
    console.log('Failed:');
    for (const f of failed) console.log(`  ✗ ${f.area}`);
    process.exit(1);
}
console.log(`Wrote: docs/audit/ETAP-42G-SUITE.json`);
