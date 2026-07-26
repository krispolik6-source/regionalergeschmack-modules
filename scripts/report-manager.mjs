#!/usr/bin/env node
/**
 * ETAP 34C — CLI Developer Report Manager
 * Usage:
 *   node scripts/report-manager.mjs index
 *   node scripts/report-manager.mjs stats
 *   node scripts/report-manager.mjs list
 *   node scripts/report-manager.mjs delete --path docs/health/foo.json --yes
 *   node scripts/report-manager.mjs cleanup --mode older-30 --yes
 *   node scripts/report-manager.mjs cleanup --mode keep-20 --yes
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    buildReportsIndex,
    writeReportsIndex,
    getDocsStats,
    listManagedReports,
    deleteReportFile,
    cleanupOlderThanDays,
    cleanupKeepLastPerModule,
    readReportText
} from './lib/report-manager-core.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const cmd = args[0] || 'index';

function flag(name) {
    return args.includes(name);
}

function opt(name) {
    const i = args.indexOf(name);
    if (i < 0) return null;
    return args[i + 1] || null;
}

if (cmd === 'index') {
    const { path, index } = writeReportsIndex(ROOT);
    console.log(`Wrote ${path}`);
    console.log(`Reports: ${index.stats.reportCount} · docs: ${index.stats.docsHuman}`);
    process.exit(0);
}

if (cmd === 'stats') {
    const s = getDocsStats(ROOT);
    console.log(JSON.stringify(s, null, 2));
    process.exit(0);
}

if (cmd === 'list') {
    const rows = listManagedReports(ROOT);
    for (const r of rows.slice(0, 200)) {
        console.log(`${r.isLatest ? 'L' : ' '} ${r.rel}  (${r.bytes} B)`);
    }
    console.log(`\nTotal managed: ${rows.length}`);
    process.exit(0);
}

if (cmd === 'read') {
    const p = opt('--path');
    if (!p) {
        console.error('Need --path docs/...');
        process.exit(1);
    }
    const r = readReportText(ROOT, p);
    if (!r.ok) {
        console.error(r.reason);
        process.exit(1);
    }
    process.stdout.write(r.text);
    process.exit(0);
}

if (cmd === 'delete') {
    const p = opt('--path');
    if (!p) {
        console.error('Need --path docs/...');
        process.exit(1);
    }
    if (!flag('--yes')) {
        console.error('Add --yes to confirm deletion');
        process.exit(1);
    }
    const allowLatest = flag('--allow-latest');
    const r = deleteReportFile(ROOT, p, { allowLatest });
    console.log(JSON.stringify(r, null, 2));
    if (r.ok) writeReportsIndex(ROOT);
    process.exit(r.ok ? 0 : 1);
}

if (cmd === 'cleanup') {
    const mode = opt('--mode') || 'older-30';
    if (!flag('--yes')) {
        console.error('Add --yes to confirm cleanup');
        process.exit(1);
    }
    let r;
    if (mode === 'keep-20' || mode === 'keep-last-20') {
        r = cleanupKeepLastPerModule(ROOT, 20);
    } else {
        r = cleanupOlderThanDays(ROOT, 30);
    }
    console.log(JSON.stringify({
        mode: r.mode,
        deletedCount: r.deleted.length,
        deleted: r.deleted.slice(0, 50),
        skippedCount: r.skipped.length
    }, null, 2));
    writeReportsIndex(ROOT);
    process.exit(0);
}

console.log(`Unknown command: ${cmd}`);
console.log('Commands: index | stats | list | read | delete | cleanup');
process.exit(1);
