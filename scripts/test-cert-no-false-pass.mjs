/**
 * ETAP 45-B — guard against forced PASS patterns in scripts/
 * Run: node scripts/test-cert-no-false-pass.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPTS = join(ROOT, 'scripts');
let failed = 0;

function fail(msg) {
    failed += 1;
    console.error(`❌ ${msg}`);
}

function ok(msg) {
    console.log(`✅ ${msg}`);
}

const hits = [];

function walk(dir) {
    for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        const rel = relative(ROOT, full).replace(/\\/g, '/');
        if (name === 'node_modules' || name === 'lib' && rel === 'scripts/lib') {
            // still scan lib
        }
        const st = statSync(full);
        if (st.isDirectory()) {
            if (name === 'node_modules' || name === 'i18n-packs') continue;
            walk(full);
        } else if (/\.mjs$/.test(name)) {
            scan(rel, readFileSync(full, 'utf8'));
        }
    }
}

function scan(rel, text) {
    if (rel === 'scripts/test-cert-no-false-pass.mjs') return;
    if (rel === 'scripts/etap-45-runtime-truth-report.mjs') return;
    if (rel === 'scripts/etap-46-release-readiness.mjs') return;
    const lines = text.split('\n');
    lines.forEach((line, i) => {
        const n = i + 1;
        if (/\|\|\s*true\b/.test(line) && !line.trim().startsWith('//') && !/kind:\s*['"]/.test(line)) {
            hits.push({ rel, n, kind: '|| true', line: line.trim() });
        }
        if (/\&\&\s*true\b/.test(line) && !line.trim().startsWith('//') && !/kind:\s*['"]/.test(line)) {
            hits.push({ rel, n, kind: '&& true', line: line.trim() });
        }
    });

    if (/etap-43-.*-verification\.mjs/.test(rel) && /staticOk\s*&&\s*autoOk/.test(text) && !text.includes('buildGateReport')) {
        hits.push({ rel, n: 0, kind: 'legacy verdict without buildGateReport', line: 'use buildGateReport from cert-report.mjs' });
    }

    if (/etap-43-.*-verification\.mjs/.test(rel) && /layer:\s*['"]auto['"]/.test(text)) {
        hits.push({ rel, n: 0, kind: 'layer auto forbidden', line: "use layer: 'static' or 'runtime'" });
    }

    if (rel === 'scripts/etap-43-final-report.mjs') {
        for (const pat of ['cacheFresh', 'CACHE_MAX_AGE', "source: 'cached'", "status: 'PASS' && cache"]) {
            if (text.includes(pat)) {
                hits.push({ rel, n: 0, kind: 'release gate cache/override', line: pat });
            }
        }
    }
}

walk(SCRIPTS);

if (hits.length === 0) {
    ok('no || true / && true / contradictory includes in scripts/');
} else {
    for (const h of hits) {
        fail(`${h.rel}:${h.n} [${h.kind}] ${h.line}`);
    }
}

process.exit(failed ? 1 : 0);
