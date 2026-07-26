/**
 * Prelaunch: node --check all JS + resolve relative imports from app graph.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function walk(dir, out = []) {
    for (const name of readdirSync(dir)) {
        if (name === 'node_modules' || name === '.git') continue;
        const full = join(dir, name);
        const st = statSync(full);
        if (st.isDirectory()) walk(full, out);
        else if (/\.js$/.test(name)) out.push(full);
    }
    return out;
}

const jsFiles = [
    ...walk(join(ROOT, 'js')),
    join(ROOT, 'sw.js')
].filter((f) => existsSync(f));

console.log(`Syntax check: ${jsFiles.length} files…`);
const syntaxFails = [];
for (const f of jsFiles) {
    const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
    if (r.status !== 0) {
        syntaxFails.push({ file: relative(ROOT, f), err: (r.stderr || r.stdout || '').slice(0, 200) });
        failed += 1;
    }
}
console.log(syntaxFails.length ? `FAIL syntax: ${syntaxFails.length}` : 'OK syntax all');
for (const s of syntaxFails.slice(0, 15)) console.log(' ', s.file, s.err.split('\n')[0]);

// Import graph from app.js
const IMPORT_RE = /from\s+['"]([^'"]+)['"]/g;
const visited = new Set();
const missing = [];
const queue = [join(ROOT, 'js/app.js')];

function stripQuery(p) {
    return p.split('?')[0];
}

while (queue.length) {
    const file = queue.pop();
    const key = file.replace(/\\/g, '/');
    if (visited.has(key)) continue;
    visited.add(key);
    if (!existsSync(file)) {
        missing.push(relative(ROOT, file));
        failed += 1;
        continue;
    }
    let src;
    try {
        src = readFileSync(file, 'utf8');
    } catch {
        continue;
    }
    let m;
    while ((m = IMPORT_RE.exec(src))) {
        const spec = stripQuery(m[1]);
        if (!spec.startsWith('.')) continue;
        let target = resolve(dirname(file), spec);
        if (!existsSync(target) && !extnameSafe(target)) {
            if (existsSync(`${target}.js`)) target = `${target}.js`;
        }
        if (!existsSync(target)) {
            missing.push(`${relative(ROOT, file)} → ${spec}`);
            failed += 1;
            continue;
        }
        if (target.endsWith('.js')) queue.push(target);
    }
}

function extnameSafe(p) {
    return /\.(js|json|css|svg|webp|png)$/i.test(p);
}

console.log(`Import graph from app.js: ${visited.size} modules`);
console.log(missing.length ? `FAIL missing imports: ${missing.length}` : 'OK imports resolve');
for (const x of missing.slice(0, 20)) console.log(' ', x);

// SW + manifest quick
const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
const man = JSON.parse(readFileSync(join(ROOT, 'manifest.json'), 'utf8'));
const swOk = /caches\.open|addAll|fetch/.test(sw) && /CACHE|rg-pwa/i.test(sw);
console.log(swOk ? 'OK sw.js cache/fetch' : 'FAIL sw.js');
if (!swOk) failed += 1;

const iconOk = (man.icons || []).some((i) => /192/.test(i.sizes)) &&
    (man.icons || []).some((i) => /512/.test(i.sizes));
console.log(iconOk ? 'OK manifest icons meta' : 'FAIL manifest icons');
if (!iconOk) failed += 1;

for (const icon of man.icons || []) {
    const src = String(icon.src || '').split('?')[0].replace(/^\//, '');
    if (!existsSync(join(ROOT, src))) {
        console.log('FAIL missing icon file', src);
        failed += 1;
    }
}

if (failed) {
    console.error(`\n${failed} issue(s)`);
    process.exit(1);
}
console.log('\nPrelaunch JS/SW/PWA check OK');
