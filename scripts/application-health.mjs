/**
 * Application Health Monitor – skan statyczny + zapis raportu do docs/health/
 * Polityka: TYLKO raport. NIGDY nie zmienia kodu / assetów / cache.
 *
 * Usage:
 *   npm run health
 *   npm run health -- --import=path/to/runtime-dump.json
 */
import {
    readFileSync,
    writeFileSync,
    mkdirSync,
    existsSync,
    readdirSync,
    statSync
} from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TRANSLATIONS, SUPPORTED_LANGUAGE_CODES } from '../js/translations.js';
import { CONTENT_PRODUCERS } from '../js/data/contentProducers.js';
import { PRODUCT_IMAGE_SLUGS } from '../js/data/productImages.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'docs', 'health');

function clamp(n) {
    return Math.max(0, Math.min(100, Math.round(n)));
}

function walk(dir, filter = () => true) {
    const out = [];
    if (!existsSync(dir)) return out;
    for (const name of readdirSync(dir)) {
        if (name === 'node_modules' || name === '.git') continue;
        const full = join(dir, name);
        const st = statSync(full);
        if (st.isDirectory()) out.push(...walk(full, filter));
        else if (filter(full)) out.push(full);
    }
    return out;
}

function collectKeys(obj, prefix = '') {
    const keys = [];
    for (const [k, v] of Object.entries(obj || {})) {
        const path = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === 'object' && !Array.isArray(v)) {
            keys.push(...collectKeys(v, path));
        } else {
            keys.push(path);
        }
    }
    return keys;
}

function readText(rel) {
    const full = join(ROOT, rel);
    if (!existsSync(full)) return '';
    return readFileSync(full, 'utf8');
}

function scanTranslations() {
    const refKeys = new Set(collectKeys(TRANSLATIONS.de));
    const missingByLang = {};
    let totalMissing = 0;
    for (const code of SUPPORTED_LANGUAGE_CODES) {
        if (code === 'de') continue;
        const keys = new Set(collectKeys(TRANSLATIONS[code]));
        const missing = [...refKeys].filter((k) => !keys.has(k));
        missingByLang[code] = missing.length;
        totalMissing += missing.length;
    }
    const score = clamp(100 - Math.min(60, totalMissing * 0.5));
    return {
        score,
        totalMissing,
        missingByLang,
        findings: totalMissing
            ? [{
                severity: totalMissing > 40 ? 'high' : 'medium',
                area: 'translation',
                title: `Brakujące klucze i18n: ${totalMissing}`,
                detail: Object.entries(missingByLang).map(([l, n]) => `${l}:${n}`).join(', ')
            }]
            : []
    };
}

function scanAssets() {
    const SCAN = ['js', 'css', 'index.html', 'landing.html', 'manifest.json', 'sw.js'];
    const refs = new Set();
    const pathRe = /\/assets\/[^\s'"`)]+/g;
    const urlRe = /url\(['"]?([^'")\s?]+)/g;

    for (const rel of SCAN) {
        const full = join(ROOT, rel);
        if (!existsSync(full)) continue;
        const files = statSync(full).isDirectory()
            ? walk(full, (f) => /\.(js|css|html|mjs|json)$/i.test(f))
            : [full];
        for (const file of files) {
            const content = readFileSync(file, 'utf8');
            let m;
            pathRe.lastIndex = 0;
            while ((m = pathRe.exec(content)) !== null) {
                refs.add(m[0].split('?')[0].replace(/^\//, ''));
            }
            urlRe.lastIndex = 0;
            while ((m = urlRe.exec(content)) !== null) {
                const p = m[1].split('?')[0].replace(/^\//, '');
                if (p.startsWith('assets/')) refs.add(p);
            }
        }
    }
    for (const slug of Object.values(PRODUCT_IMAGE_SLUGS)) {
        refs.add(`assets/images/products/${slug}.webp`);
        refs.add(`assets/images/products/${slug}.jpg`);
    }

    const assets = walk(join(ROOT, 'assets')).map((f) => relative(ROOT, f).replace(/\\/g, '/'));
    const metaOnly = new Set(['sources.json', 'icon-source.svg']);
    const unused = assets.filter((p) => {
        const base = p.split('/').pop();
        if (metaOnly.has(base)) return false;
        return !refs.has(p) && ![...refs].some((r) => p.endsWith(r.split('/').pop()));
    });

    // brakujące product images
    const missingProduct = [];
    for (const slug of Object.values(PRODUCT_IMAGE_SLUGS)) {
        const webp = join(ROOT, 'assets/images/products', `${slug}.webp`);
        const jpg = join(ROOT, 'assets/images/products', `${slug}.jpg`);
        if (!existsSync(webp) && !existsSync(jpg)) {
            missingProduct.push(slug);
        }
    }

    let score = 100;
    score -= Math.min(25, unused.length * 0.5);
    score -= Math.min(40, missingProduct.length * 4);
    score = clamp(score);

    const findings = [];
    if (unused.length) {
        findings.push({
            severity: 'low',
            area: 'assets',
            title: `Nieużywane assety: ${unused.length}`,
            detail: unused.slice(0, 8).join(', ')
        });
    }
    if (missingProduct.length) {
        findings.push({
            severity: 'high',
            area: 'images',
            title: `Brakujące zdjęcia produktów: ${missingProduct.length}`,
            detail: missingProduct.slice(0, 8).join(', ')
        });
    }
    return { score, unusedCount: unused.length, missingProduct, unusedSample: unused.slice(0, 20), findings };
}

function scanProducers() {
    const issues = [];
    for (const p of CONTENT_PRODUCERS) {
        if (!p?.name) issues.push(`unnamed:${p?.id}`);
        if (p?.lat == null || p?.lng == null) issues.push(`no-coords:${p?.id}`);
        if (!p?.category && !p?.categories?.length) issues.push(`no-category:${p?.id}`);
    }
    const score = clamp(100 - Math.min(50, issues.length * 4));
    return {
        score,
        total: CONTENT_PRODUCERS.length,
        issues: issues.slice(0, 30),
        findings: issues.length
            ? [{
                severity: 'medium',
                area: 'data',
                title: `Brakujące dane producentów: ${issues.length}`,
                detail: issues.slice(0, 6).join(', ')
            }]
            : []
    };
}

function scanUnusedJsModules() {
    const jsRoot = join(ROOT, 'js');
    const files = walk(jsRoot, (f) => f.endsWith('.js') && !f.includes(`${join('legacy')}`));
    const byRel = new Map(
        files.map((f) => [relative(ROOT, f).replace(/\\/g, '/'), readFileSync(f, 'utf8')])
    );
    const corpus = [...byRel.values()].join('\n')
        + readText('index.html')
        + readText('landing.html');

    const unused = [];
    for (const rel of byRel.keys()) {
        if (rel === 'js/app.js') continue;
        if (rel.startsWith('js/diagnostics/')) continue;
        if (rel.includes('/legacy/')) continue;
        const needle = rel.replace(/^js\//, '');
        const fileName = needle.split('/').pop();
        const imported = corpus.includes(needle)
            || corpus.includes(`/${rel}`)
            || corpus.includes(`'${rel}`)
            || corpus.includes(`"${rel}`)
            || (fileName && corpus.includes(`/${fileName}`));
        // wyklucz samo-odwołanie: policz wystąpienia poza plikiem źródłowym
        if (!imported) {
            unused.push(rel);
            continue;
        }
        const self = byRel.get(rel) || '';
        const others = corpus.length - self.length;
        const countAll = corpus.split(needle).length - 1;
        const countSelf = self.split(needle).length - 1;
        if (countAll <= countSelf && !corpus.includes(`js/${needle}`) && !readText('index.html').includes(rel)) {
            // może być importowane samym basename
            const baseHits = fileName ? (corpus.split(fileName).length - 1) : 0;
            if (baseHits <= 2) unused.push(rel);
        }
        void others;
    }

    const filtered = unused;
    const score = clamp(100 - Math.min(30, filtered.length * 2));
    return {
        score,
        unusedCount: filtered.length,
        unusedSample: filtered.slice(0, 25),
        findings: filtered.length > 15
            ? [{
                severity: 'low',
                area: 'code',
                title: `Podejrzenie nieużywanego kodu: ${filtered.length} plików`,
                detail: filtered.slice(0, 6).join(', ')
            }]
            : []
    };
}

function scanCssConflicts() {
    const cssFiles = walk(join(ROOT, 'css'), (f) => f.endsWith('.css'));
    const selectorProps = new Map();
    const conflicts = [];
    const ruleRe = /([^{}@]+)\{([^}]+)\}/g;

    for (const file of cssFiles) {
        const rel = relative(ROOT, file).replace(/\\/g, '/');
        const content = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
        let m;
        ruleRe.lastIndex = 0;
        while ((m = ruleRe.exec(content)) !== null) {
            const sel = m[1].trim().replace(/\s+/g, ' ');
            if (!sel || sel.length > 80) continue;
            const body = m[2];
            const props = {};
            for (const part of body.split(';')) {
                const [k, ...rest] = part.split(':');
                if (!k || !rest.length) continue;
                const key = k.trim();
                const val = rest.join(':').trim();
                if (['display', 'position', 'z-index', 'overflow', 'color', 'background'].includes(key)) {
                    props[key] = val;
                }
            }
            if (!Object.keys(props).length) continue;
            const prev = selectorProps.get(sel);
            if (prev) {
                for (const [k, v] of Object.entries(props)) {
                    if (prev.props[k] && prev.props[k] !== v) {
                        conflicts.push({
                            selector: sel,
                            prop: k,
                            a: `${prev.file}:${prev.props[k]}`,
                            b: `${rel}:${v}`
                        });
                    }
                }
                prev.props = { ...prev.props, ...props };
            } else {
                selectorProps.set(sel, { file: rel, props: { ...props } });
            }
        }
    }

    const unique = conflicts.slice(0, 40);
    const score = clamp(100 - Math.min(35, unique.length * 2));
    return {
        score,
        conflictCount: unique.length,
        sample: unique.slice(0, 12),
        findings: unique.length
            ? [{
                severity: unique.length > 12 ? 'medium' : 'low',
                area: 'css',
                title: `Potencjalne konflikty CSS: ${unique.length}`,
                detail: unique.slice(0, 4).map((c) => `${c.selector} [${c.prop}]`).join('; ')
            }]
            : []
    };
}

function scanPwa() {
    const manifestOk = existsSync(join(ROOT, 'manifest.json'));
    const swOk = existsSync(join(ROOT, 'sw.js'));
    const index = readText('index.html');
    const hasManifestLink = /rel=["']manifest["']/.test(index);
    const hasSwRegister = /serviceWorker|sw\.js/.test(index + readText('js/core/pwaInstall.js') + readText('js/app.js'));

    let score = 100;
    if (!manifestOk) score -= 30;
    if (!swOk) score -= 30;
    if (!hasManifestLink) score -= 15;
    if (!hasSwRegister) score -= 15;
    score = clamp(score);

    const findings = [];
    if (!manifestOk || !hasManifestLink) {
        findings.push({
            severity: 'high',
            area: 'pwa',
            title: 'Problem z manifestem PWA',
            detail: !manifestOk ? 'brak manifest.json' : 'brak linku rel=manifest'
        });
    }
    if (!swOk) {
        findings.push({
            severity: 'high',
            area: 'pwa',
            title: 'Brak service workera',
            detail: 'sw.js nie znaleziony'
        });
    }
    return { score, manifestOk, swOk, hasManifestLink, hasSwRegister, findings };
}

function scanCacheHints() {
    const sw = readText('sw.js');
    const findings = [];
    let score = 100;
    if (!sw) {
        score -= 40;
        findings.push({
            severity: 'high',
            area: 'cache',
            title: 'Brak SW – brak strategii cache',
            detail: 'sw.js pusty / nie istnieje'
        });
    } else {
        if (!/caches\.open|cache\.add|CacheStorage/.test(sw)) {
            score -= 25;
            findings.push({
                severity: 'medium',
                area: 'cache',
                title: 'SW bez widocznej obsługi Cache API',
                detail: 'Brak caches.open / cache.add'
            });
        }
        // wersje cache – wiele nazw może wskazywać na brak czyszczenia
        const cacheNames = [...sw.matchAll(/['"`]([a-zA-Z0-9_-]*cache[a-zA-Z0-9_-]*)['"`]/gi)].map((m) => m[1]);
        if (cacheNames.length > 6) {
            score -= 10;
            findings.push({
                severity: 'low',
                area: 'cache',
                title: `Wiele nazw cache w SW (${cacheNames.length})`,
                detail: 'Ryzyko starego cache – sprawdź cleanup'
            });
        }
    }
    return { score: clamp(score), findings };
}

function scanMobileCss() {
    const css = walk(join(ROOT, 'css'), (f) => f.endsWith('.css'))
        .map((f) => readFileSync(f, 'utf8'))
        .join('\n');
    const hasPhone = /@media[^{]*(max-width:\s*4[0-9]{2}px|max-width:\s*480px)/i.test(css);
    const hasTouch = /touch-action|min-height:\s*4[4-8]px|min-width:\s*4[4-8]px/i.test(css);
    let score = 70;
    if (hasPhone) score += 15;
    if (hasTouch) score += 15;
    const findings = [];
    if (!hasPhone) {
        findings.push({
            severity: 'medium',
            area: 'mobile',
            title: 'Słabe pokrycie media queries telefonu',
            detail: 'Brak typowego @media max-width ~480px'
        });
    }
    return { score: clamp(score), hasPhone, hasTouch, findings };
}

function scanA11yStatic() {
    const html = readText('index.html');
    let score = 100;
    const findings = [];
    if (!/lang=/.test(html)) {
        score -= 15;
        findings.push({ severity: 'medium', area: 'a11y', title: 'Brak atrybutu lang na HTML', detail: '' });
    }
    const buttons = (html.match(/<button\b/gi) || []).length;
    const aria = (html.match(/aria-label=/gi) || []).length;
    if (buttons > 8 && aria < 3) {
        score -= 20;
        findings.push({
            severity: 'medium',
            area: 'a11y',
            title: 'Mało aria-label względem przycisków w HTML',
            detail: `buttons≈${buttons}, aria-label≈${aria}`
        });
    }
    return { score: clamp(score), findings };
}

function loadRuntimeImport(argv) {
    const arg = argv.find((a) => a.startsWith('--import='));
    if (!arg) return null;
    const path = arg.slice('--import='.length);
    const full = path.startsWith('/') || /^[A-Za-z]:/.test(path) ? path : join(ROOT, path);
    if (!existsSync(full)) {
        console.warn(`[health] nie znaleziono importu: ${full}`);
        return null;
    }
    return JSON.parse(readFileSync(full, 'utf8'));
}

function mergeRuntime(staticScores, runtime) {
    if (!runtime?.scores) return staticScores;
    const out = { ...staticScores };
    for (const [k, v] of Object.entries(runtime.scores)) {
        if (typeof v === 'number' && typeof out[k] === 'number') {
            out[k] = clamp((out[k] * 0.55) + (v * 0.45));
        }
    }
    return out;
}

function toMarkdown(report) {
    const lines = [
        '# Application Health Report',
        '',
        `Generated: ${report.generatedAt}`,
        `Overall: **${report.overall}%**`,
        '',
        '## Scores',
        ''
    ];
    for (const [k, v] of Object.entries(report.scores)) {
        lines.push(`- **${k}**: ${v}%`);
    }
    lines.push('', '## Findings', '');
    if (!report.findings.length) {
        lines.push('_Brak findings._');
    } else {
        for (const f of report.findings) {
            lines.push(`- **[${f.severity}] ${f.area}** — ${f.title}`);
            if (f.detail) lines.push(`  - ${f.detail}`);
        }
    }
    lines.push('', '## Policy', '', '- autoFix: false', '- readOnly: true', '');
    return lines.join('\n');
}

function buildReport(runtime) {
    const translation = scanTranslations();
    const assets = scanAssets();
    const producers = scanProducers();
    const unusedJs = scanUnusedJsModules();
    const css = scanCssConflicts();
    const pwa = scanPwa();
    const cache = scanCacheHints();
    const mobile = scanMobileCss();
    const a11y = scanA11yStatic();

    let scores = {
        performance: clamp(
            100
            - (assets.missingProduct.length * 2)
            - Math.min(15, unusedJs.unusedCount)
        ),
        ux: clamp((mobile.score + a11y.score) / 2),
        accessibility: a11y.score,
        memory: clamp(100 - Math.min(20, unusedJs.unusedCount)), // static proxy
        dataQuality: producers.score,
        translation: translation.score,
        mobile: mobile.score,
        pwa: clamp((pwa.score + cache.score) / 2)
    };

    // Data quality also considers images
    scores.dataQuality = clamp((producers.score + assets.score) / 2);

    // UX penalize CSS conflicts lightly
    scores.ux = clamp(scores.ux - Math.min(15, css.conflictCount));

    scores = mergeRuntime(scores, runtime);

    const findings = [
        ...translation.findings,
        ...assets.findings,
        ...producers.findings,
        ...unusedJs.findings,
        ...css.findings,
        ...pwa.findings,
        ...cache.findings,
        ...mobile.findings,
        ...a11y.findings,
        ...(runtime?.findings || [])
    ];

    const overall = clamp(
        Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
    );

    return {
        id: `health-static-${new Date().toISOString().replace(/[:.]/g, '-')}`,
        generatedAt: new Date().toISOString(),
        reason: runtime ? 'static+runtime-import' : 'static-scan',
        policy: { autoFix: false, autoCommit: false, readOnly: true },
        scores,
        overall,
        findings,
        static: {
            translation: { totalMissing: translation.totalMissing, missingByLang: translation.missingByLang },
            assets: {
                unusedCount: assets.unusedCount,
                missingProduct: assets.missingProduct,
                unusedSample: assets.unusedSample
            },
            producers: { total: producers.total, issueCount: producers.issues.length, issues: producers.issues },
            unusedJs: { unusedCount: unusedJs.unusedCount, unusedSample: unusedJs.unusedSample },
            css: { conflictCount: css.conflictCount, sample: css.sample },
            pwa,
            cache: { score: cache.score },
            mobile,
            a11y: { score: a11y.score }
        },
        runtime: runtime
            ? {
                imported: true,
                overall: runtime.overall,
                runtime: runtime.runtime,
                generatedAt: runtime.generatedAt
            }
            : { imported: false }
    };
}

function writeReports(report) {
    mkdirSync(OUT_DIR, { recursive: true });
    const jsonPath = join(OUT_DIR, 'latest.json');
    const mdPath = join(OUT_DIR, 'latest.md');
    const stamp = report.generatedAt.replace(/[:.]/g, '-');
    const archiveJson = join(OUT_DIR, `health-${stamp}.json`);

    writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');
    writeFileSync(mdPath, toMarkdown(report), 'utf8');
    writeFileSync(archiveJson, JSON.stringify(report, null, 2), 'utf8');

    return { jsonPath, mdPath, archiveJson };
}

const runtime = loadRuntimeImport(process.argv.slice(2));
const report = buildReport(runtime);
const paths = writeReports(report);

console.log(`[Application Health] Overall ${report.overall}%`);
console.log('Scores:', report.scores);
console.log(`Findings: ${report.findings.length}`);
console.log(`Wrote: ${relative(ROOT, paths.jsonPath)}`);
console.log(`Wrote: ${relative(ROOT, paths.mdPath)}`);
console.log('Policy: read-only · autoFix=false');
