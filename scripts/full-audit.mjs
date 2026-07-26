/**
 * Pełny audyt JS – składnia, importy, eksporty, linki HTML.
 * Run: node scripts/full-audit.mjs
 */
import { execSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const JS_DIR = join(ROOT, 'js');
const CSS_DIR = join(ROOT, 'css');
const errors = [];
const warnings = [];
const passes = [];
const fixes = [];

function fail(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }
function pass(msg) { passes.push(msg); }

function walk(dir, ext, skip = []) {
    const out = [];
    if (!existsSync(dir)) return out;
    for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        if (skip.some((s) => full.includes(s))) continue;
        const st = statSync(full);
        if (st.isDirectory()) out.push(...walk(full, ext, skip));
        else if (!ext || full.endsWith(ext)) out.push(full);
    }
    return out;
}

function stripQuery(spec) {
    return String(spec).split('?')[0];
}

function resolveImport(fromFile, spec) {
    if (!spec.startsWith('.')) return null;
    const base = stripQuery(spec);
    let target = resolve(dirname(fromFile), base);
    const candidates = [
        target,
        `${target}.js`,
        join(target, 'index.js')
    ];
    for (const c of candidates) {
        if (existsSync(c) && statSync(c).isFile()) return c;
    }
    return null;
}

const IMPORT_RE = /import\s+(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g;
const EXPORT_RE = /export\s+(?:const|let|var|function|class)\s+(\w+)|export\s*\{\s*([^}]+)\s*\}/g;

// --- 1. Składnia JS ---
const jsFiles = walk(JS_DIR, '.js', ['legacy\\app.bundle.js', 'legacy/app.bundle.js']);
const syntaxSkip = new Set([
    join(JS_DIR, 'legacy', 'app.bundle.js'),
    join(JS_DIR, 'legacy', 'detect.js'),
    join(JS_DIR, 'legacy', 'polyfills.js')
]);

for (const file of jsFiles) {
    if (syntaxSkip.has(file)) continue;
    try {
        execSync(`node --check "${file}"`, { stdio: 'pipe' });
        pass(`Składnia OK: ${relative(ROOT, file)}`);
    } catch (e) {
        fail(`Składnia: ${relative(ROOT, file)} – ${e.stderr?.toString().trim() || e.message}`);
    }
}

// --- 2. Importy lokalne ---
const moduleFiles = jsFiles.filter((f) => !syntaxSkip.has(f));

for (const file of moduleFiles) {
    const content = readFileSync(file, 'utf8');
    let m;
    IMPORT_RE.lastIndex = 0;
    while ((m = IMPORT_RE.exec(content)) !== null) {
        const spec = m[1];
        if (!spec.startsWith('.')) continue;
        const resolved = resolveImport(file, spec);
        if (!resolved) {
            fail(`Brak pliku: ${relative(ROOT, file)} importuje "${spec}"`);
        }
    }
}

// --- 3. Dynamiczny import modułów (eksporty) ---
const entryImports = [
    './js/views/map.js',
    './js/views/home.js',
    './js/views/cart.js',
    './js/views/favorites.js',
    './js/views/profile.js',
    './js/views/premium.js',
    './js/presentation/searchFilter.js',
    './js/map/map.js',
    './js/data/dataService.js',
    './js/controllers/navigation.js',
    './js/core/settings.js',
    './js/auth/auth.js',
    './js/core/events.js',
    './js/core/analytics.js',
    './js/views/clientPanel.js',
    './js/views/producerPanel.js',
    './js/data/userProducerStore.js'
];

const requiredExports = {
    './js/presentation/searchFilter.js': ['filterProducersBySearch', 'searchGlobalResults', 'buildSearchResultCardHtml'],
    './js/map/map.js': ['replaceMarkers', 'updateRadiusCircle', 'resetRadiusCircle', 'updateGpsPin', 'resetGpsPin', 'resetMarkersLayer', 'focusProducerMarker'],
    './js/data/dataService.js': ['loadAllData', 'getProducers', 'filterProducersByCategory', 'getProducersInRadius'],
    './js/auth/auth.js': ['register', 'login', 'logout', 'getCurrentUser', 'ACCOUNT_TYPES'],
    './js/views/clientPanel.js': ['renderClientPanel'],
    './js/views/producerPanel.js': ['renderProducerPanel'],
    './js/data/userProducerStore.js': ['initProducerAccount', 'getProducerAccount', 'PRODUCER_CATEGORIES']
};

for (const rel of entryImports) {
    const abs = join(ROOT, rel.replace(/^\.\//, '').split('?')[0]);
    if (!existsSync(abs)) {
        fail(`Brak entry: ${rel}`);
        continue;
    }
    try {
        const mod = await import(pathToFileURL(abs).href);
        const req = requiredExports[rel];
        if (req) {
            for (const name of req) {
                if (typeof mod[name] === 'undefined') {
                    fail(`Brak eksportu "${name}" w ${rel}`);
                } else {
                    pass(`Eksport OK: ${rel} → ${name}`);
                }
            }
        }
    } catch (e) {
        fail(`Import modułu ${rel}: ${e.message}`);
    }
}

// --- 4. index.html ---
const htmlPath = join(ROOT, 'index.html');
if (!existsSync(htmlPath)) {
    fail('Brak index.html');
} else {
    const html = readFileSync(htmlPath, 'utf8');
    const hrefRe = /(?:href|src)=["']([^"']+)["']/g;
    let hm;
    while ((hm = hrefRe.exec(html)) !== null) {
        const url = hm[1];
        if (url.startsWith('http') || url.startsWith('//') || url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('#')) continue;
        const clean = url.split('?')[0].replace(/^\//, '');
        const local = join(ROOT, clean);
        if (!existsSync(local)) {
            fail(`index.html – brak zasobu: ${url}`);
        }
    }
    if (html.includes('viewport') && html.includes('charset')) {
        pass('index.html – meta viewport i charset OK');
    }
    if (!html.includes('Regionaler Geschmack')) {
        warn('index.html – brak nazwy aplikacji w treści');
    }
    pass('index.html – linki lokalne sprawdzone');
}

// --- 5. CSS pliki istnieją ---
for (const css of walk(CSS_DIR, '.css')) {
    pass(`CSS istnieje: ${relative(ROOT, css)}`);
}

// --- 6. Pliki tymczasowe ---
const tempPatterns = ['.bak', '.tmp', '.log'];
for (const root of [ROOT, JS_DIR, CSS_DIR]) {
    for (const f of walk(root, '')) {
        if (tempPatterns.some((p) => f.endsWith(p))) {
            warn(`Plik tymczasowy: ${relative(ROOT, f)}`);
        }
    }
}

// --- 7. Demo patterns ---
const forbidden = ['seedDemoCartItem', 'SAMPLE_REVIEWS', 'fallbackProducers'];
for (const pat of forbidden) {
    for (const file of moduleFiles) {
        const c = readFileSync(file, 'utf8');
        if (c.includes(pat)) warn(`Wzorzec demo "${pat}" w ${relative(ROOT, file)}`);
    }
}

// --- Raport ---
console.log('\n========== AUDYT JS/CSS/HTML ==========\n');
console.log(`✅ OK: ${passes.length}`);
console.log(`⚠️  Ostrzeżenia: ${warnings.length}`);
console.log(`❌ Błędy: ${errors.length}\n`);

if (warnings.length) {
    console.log('--- Ostrzeżenia ---');
    warnings.forEach((w) => console.log(`  ⚠️  ${w}`));
}
if (errors.length) {
    console.log('--- Błędy ---');
    errors.forEach((e) => console.log(`  ❌ ${e}`));
    process.exit(1);
}
console.log('\nAudyt statyczny: PASS');
