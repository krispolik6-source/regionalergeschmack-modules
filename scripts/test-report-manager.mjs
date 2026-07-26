/**
 * ETAP 34C — testy Report Manager (bezpieczeństwo docs/)
 */
import {
    mkdirSync,
    writeFileSync,
    readFileSync,
    existsSync,
    rmSync,
    utimesSync,
    readdirSync
} from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    resolveSafeDocsPath,
    deleteReportFile,
    cleanupOlderThanDays,
    cleanupKeepLastPerModule,
    getDocsStats,
    writeReportsIndex,
    isLatestArtifact,
    NEVER_TOUCH
} from './lib/report-manager-core.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TMP = join(ROOT, 'docs', '_rm-test-tmp-root');
let failed = 0;

function assert(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error(`FAIL ${msg}`);
    } else {
        console.log(`OK   ${msg}`);
    }
}

function resetTmp() {
    try {
        rmSync(TMP, { recursive: true, force: true });
    } catch { /* ignore */ }
    const mod = join(TMP, 'docs', 'mod-a');
    mkdirSync(mod, { recursive: true });
    return mod;
}

// --- path safety (real root) ---
assert(!resolveSafeDocsPath(ROOT, 'js/app.js').ok, 'blocks js/');
assert(!resolveSafeDocsPath(ROOT, 'css/style.css').ok, 'blocks css/');
assert(!resolveSafeDocsPath(ROOT, 'assets/icons/x.svg').ok, 'blocks assets/');
assert(!resolveSafeDocsPath(ROOT, 'index.html').ok, 'blocks index.html');
assert(!resolveSafeDocsPath(ROOT, 'manifest.json').ok, 'blocks manifest');
assert(!resolveSafeDocsPath(ROOT, 'sw.js').ok, 'blocks sw.js');
assert(!resolveSafeDocsPath(ROOT, 'package.json').ok, 'blocks package.json');
assert(!resolveSafeDocsPath(ROOT, 'docs/../js/app.js').ok, 'blocks .. escape');
assert(!resolveSafeDocsPath(ROOT, 'docs/brand/BRAND-BOOK.md').ok, 'blocks docs/brand');
assert(resolveSafeDocsPath(ROOT, 'docs/health/latest.md').ok, 'allows docs/health');
assert(NEVER_TOUCH.some((x) => x.startsWith('js')), 'NEVER_TOUCH has js');
assert(isLatestArtifact('latest.md') && isLatestArtifact('latest.json'), 'latest detect');

// --- isolated tmp root for delete / cleanup ---
const mod = resetTmp();
const old = Date.now() - 40 * 86400000;
const recent = Date.now() - 2 * 86400000;

writeFileSync(join(mod, 'latest.md'), 'KEEP_LATEST_MD', 'utf8');
writeFileSync(join(mod, 'latest.json'), '{"keep":true}', 'utf8');
writeFileSync(join(mod, 'README.md'), 'doc', 'utf8');

for (let i = 1; i <= 25; i += 1) {
    const p = join(mod, `2026-01-${String(i).padStart(2, '0')}.md`);
    writeFileSync(p, `old-${i}`, 'utf8');
    utimesSync(p, new Date(old - i * 1000), new Date(old - i * 1000));
}
writeFileSync(join(mod, '2026-07-20.md'), 'recent', 'utf8');
utimesSync(join(mod, '2026-07-20.md'), new Date(recent), new Date(recent));

{
    const victim = 'docs/mod-a/2026-01-01.md';
    const r = deleteReportFile(TMP, victim, { allowLatest: false });
    assert(r.ok, 'delete dated report');
    assert(!existsSync(join(mod, '2026-01-01.md')), 'file gone');
}

{
    const r = deleteReportFile(TMP, 'docs/mod-a/README.md', { allowLatest: true });
    assert(!r.ok, 'blocks README');
}

{
    const r = deleteReportFile(TMP, 'js/app.js', { allowLatest: true });
    assert(!r.ok, 'delete rejects js/');
}

{
    const beforeLatest = readFileSync(join(mod, 'latest.md'), 'utf8');
    const r = cleanupOlderThanDays(TMP, 30);
    assert(r.ok, 'cleanup older-30 runs');
    assert(existsSync(join(mod, 'latest.md')), 'keeps latest.md');
    assert(existsSync(join(mod, 'latest.json')), 'keeps latest.json');
    assert(readFileSync(join(mod, 'latest.md'), 'utf8') === beforeLatest, 'latest.md untouched');
    assert(existsSync(join(mod, '2026-07-20.md')), 'keeps recent dated');
    assert(!existsSync(join(mod, '2026-01-02.md')), 'removes old dated');
}

{
    for (let i = 0; i < 30; i += 1) {
        const p = join(mod, `bulk-${String(i).padStart(2, '0')}.md`);
        writeFileSync(p, `b-${i}`, 'utf8');
        utimesSync(p, new Date(recent - i * 1000), new Date(recent - i * 1000));
    }
    const r = cleanupKeepLastPerModule(TMP, 20);
    assert(r.ok, 'keep-last-20 runs');
    assert(existsSync(join(mod, 'latest.md')), 'keep-20 preserves latest.md');
    assert(existsSync(join(mod, 'latest.json')), 'keep-20 preserves latest.json');
    const bulkLeft = readdirSync(mod).filter((n) => n.startsWith('bulk-'));
    assert(bulkLeft.length <= 20, `bulk left ≤20 (got ${bulkLeft.length})`);
}

try {
    rmSync(TMP, { recursive: true, force: true });
} catch { /* ignore */ }

// --- index / UI / stats (read-only on real root) ---
{
    const { path, index } = writeReportsIndex(ROOT);
    assert(path.includes('reports-index.json'), 'index path');
    assert(existsSync(join(ROOT, path)), 'index exists');
    assert(typeof index.stats.reportCount === 'number', 'reportCount');
}

{
    const vault = readFileSync(join(ROOT, 'js/diagnostics/developerVaultPanel.js'), 'utf8');
    assert(vault.includes('Zarządzanie raportami'), 'UI section');
    assert(vault.includes('Kopiuj raport'), 'copy button');
    assert(vault.includes('Usuń stare raporty'), 'cleanup button');
    const client = readFileSync(join(ROOT, 'js/diagnostics/reportManagerClient.js'), 'utf8');
    assert(client.includes('Raport skopiowany'), 'toast copy text');
    assert(client.includes('127.0.0.1:3457'), 'local API');
    const api = readFileSync(join(ROOT, 'scripts/dev-report-api.mjs'), 'utf8');
    assert(api.includes('127.0.0.1'), 'API bind localhost');
}

{
    const s = getDocsStats(ROOT);
    assert(s.docsBytes > 0, 'docs size > 0');
    assert(s.reportCount > 0, 'report count > 0');
}

if (failed) {
    console.error(`\n${failed} failure(s)`);
    process.exit(1);
}
console.log('\nAll report-manager checks passed.');
