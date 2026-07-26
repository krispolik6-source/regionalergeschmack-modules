/**
 * Audyt zasobów – pliki nieużywane vs referencje w kodzie/CSS/HTML.
 * Run: node scripts/asset-audit.mjs
 */
import { readFileSync, existsSync, readdirSync, statSync, unlinkSync, rmdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { PRODUCT_IMAGE_SLUGS } from '../js/data/productImages.js';
const ROOT = process.cwd();
const SCAN_DIRS = ['js', 'css', 'index.html', 'landing.html', 'manifest.json', 'sw.js', 'scripts'];
const ASSET_ROOT = join(ROOT, 'assets');

function walk(dir) {
    const out = [];
    if (!existsSync(dir)) return out;
    for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        const st = statSync(full);
        if (st.isDirectory()) out.push(...walk(full));
        else out.push(full);
    }
    return out;
}

function collectReferences() {
    const refs = new Set();
    const urlRe = /url\(['"]?([^'")\s?]+)/g;
    const pathRe = /\/assets\/[^\s'"`)]+/g;

    for (const rel of SCAN_DIRS) {
        const full = join(ROOT, rel);
        if (!existsSync(full)) continue;
        const files = statSync(full).isDirectory() ? walk(full) : [full];
        for (const file of files) {
            if (!/\.(js|css|html|mjs)$/i.test(file)) continue;
            const content = readFileSync(file, 'utf8');
            let m;
            urlRe.lastIndex = 0;
            while ((m = urlRe.exec(content)) !== null) {
                const p = m[1].split('?')[0].replace(/^\//, '');
                if (p.startsWith('assets/')) refs.add(p);
            }
            pathRe.lastIndex = 0;
            while ((m = pathRe.exec(content)) !== null) {
                refs.add(m[0].split('?')[0].replace(/^\//, ''));
            }
        }
    }
    return refs;
}

function addProductImageRefs(refs) {
    for (const slug of Object.values(PRODUCT_IMAGE_SLUGS)) {
        refs.add(`assets/images/products/${slug}.webp`);
        refs.add(`assets/images/products/${slug}.jpg`);
    }
}

const refs = collectReferences();
addProductImageRefs(refs);const assets = walk(ASSET_ROOT).map((f) => relative(ROOT, f).replace(/\\/g, '/'));
const metaOnly = new Set(['sources.json', 'icon-source.svg']);

const unused = assets.filter((p) => {
    const base = p.split('/').pop();
    if (metaOnly.has(base)) return false;
    return !refs.has(p) && ![...refs].some((r) => p.endsWith(r.split('/').pop()));
});

console.log(`Referencje: ${refs.size}`);
console.log(`Pliki assets: ${assets.length}`);
console.log(`Nieużywane (poza sources.json): ${unused.length}\n`);
unused.forEach((p) => console.log(`  - ${p}`));

if (process.argv.includes('--delete')) {
    for (const rel of unused) {
        const full = join(ROOT, rel);
        if (existsSync(full)) unlinkSync(full);
    }
    // Usuń puste katalogi
    for (const dir of walk(ASSET_ROOT).filter((f) => statSync(f).isDirectory()).reverse()) {
        try {
            if (readdirSync(dir).length === 0) rmdirSync(dir);
        } catch (_) { /* ignore */ }
    }
    console.log('\nUsunięto nieużywane pliki.');
}
