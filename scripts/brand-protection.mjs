/**
 * ETAP 29C – Brand Protection AI
 * Brand Book = najwyższy autorytet.
 * Skan: HTML · CSS · SVG · PNG · Manifest · PWA
 * Kategorie: logo · kolory · fonty · ikony · cienie · fotografie ·
 *            odstępy · radius · gradienty · animacje
 *
 * NIGDY nie zmienia kodu. autoApply: false. Tylko raport.
 *
 * Usage:
 *   npm run brand-protection
 *   npm run brand-protection -- --strict   # exit 1 przy FAIL
 */
import {
    readFileSync,
    writeFileSync,
    mkdirSync,
    existsSync,
    readdirSync,
    statSync
} from 'node:fs';
import { join, dirname, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    POLICY,
    BRAND,
    COLD_HEX,
    FOREIGN_FONTS,
    PURPLE_GLOW,
    REQUIRED_PNG,
    resolveStatus,
    brandProtectionToMarkdown
} from '../js/diagnostics/brandProtectionCore.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_BRAND = join(ROOT, 'docs', 'brand');
const OUT_ETAP = join(ROOT, 'docs', 'brand-protection');

const argv = process.argv.slice(2);
const strict = argv.includes('--strict');

/** @type {import('../js/diagnostics/brandProtectionCore.js').Finding[]} */
const findings = [];
const scanned = new Set();

function rel(file) {
    return relative(ROOT, file).replace(/\\/g, '/');
}

function add(severity, category, file, detail, id) {
    const pathStr = String(file);
    const fileRel = existsSync(pathStr) || pathStr.includes(':') || pathStr.startsWith(ROOT)
        ? rel(pathStr)
        : pathStr.replace(/\\/g, '/');
    findings.push({
        id: id || `${category}-${findings.length + 1}`,
        severity,
        category,
        file: fileRel,
        detail,
        message: POLICY.warning
    });
}

function fail(category, file, detail, id) {
    add('fail', category, file, detail, id);
}

function warn(category, file, detail, id) {
    add('warning', category, file, detail, id);
}

function walk(dir, exts, out = []) {
    if (!existsSync(dir)) return out;
    for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        let st;
        try {
            st = statSync(full);
        } catch {
            continue;
        }
        if (st.isDirectory()) {
            if (['node_modules', '.git', 'legacy', 'js/legacy', 'dist', 'coverage'].includes(name)) continue;
            // docs/brand HTML is ok to skip for product scan; still scan product
            if (name === 'docs' && !dir.endsWith('docs')) continue;
            walk(full, exts, out);
        } else if (exts.includes(extname(name).toLowerCase())) {
            out.push(full);
        }
    }
    return out;
}

function readText(file) {
    try {
        return readFileSync(file, 'utf8');
    } catch {
        return null;
    }
}

function markScanned(file) {
    scanned.add(rel(file));
}

// ——— collect files ———
const htmlFiles = ['index.html', 'landing.html']
    .map((f) => join(ROOT, f))
    .filter(existsSync);

const cssFiles = walk(join(ROOT, 'css'), ['.css']);
const svgFiles = [
    ...walk(join(ROOT, 'assets', 'icons'), ['.svg']),
    ...walk(join(ROOT, 'assets', 'brand'), ['.svg'])
];
const manifestPath = join(ROOT, 'manifest.json');
const swPath = join(ROOT, 'sw.js');

console.log('══════════════════════════════════════════');
console.log(' Brand Protection AI (ETAP 29C)');
console.log(' Brand Book = najwyższy autorytet');
console.log(` autoApply=${POLICY.autoApply} · autoFix=${POLICY.autoFix}`);
console.log('══════════════════════════════════════════');

// ——— 1. LOGO ———
const masterPath = join(ROOT, BRAND.masterLogo);
markScanned(masterPath);
if (!existsSync(masterPath)) {
    fail('logo', BRAND.masterLogo, 'Brak logo-master.svg', 'logo-missing');
} else {
    const master = readText(masterPath) || '';
    if (!/grain|ellipse|kłos/i.test(master)) {
        fail('logo', masterPath, 'logo-master nie wygląda na dwa kłosy (grain/ellipse)', 'logo-content');
    }
    if (/<rect[^>]+fill=["']#f5efe3["']/i.test(master)) {
        warn('logo', masterPath, 'Master ma kremowy kafelek — Brand Book: glyph bez tła w UI', 'logo-tile');
    }
    if (/Inter|Roboto|Poppins/i.test(master)) {
        fail('logo', masterPath, 'Obcy font w SVG logo', 'logo-font');
    }
    if (/#[0-9a-f]{3,8}/i.test(master)) {
        for (const hex of COLD_HEX) {
            if (master.toLowerCase().includes(hex.toLowerCase())) {
                fail('logo', masterPath, `Zimny kolor ${hex} w logo-master`, 'logo-cold');
            }
        }
    }
}

for (const alias of [
    'assets/icons/icon-source.svg',
    'assets/icons/icon-symbol.svg',
    'assets/brand/logo-mark.svg'
]) {
    const full = join(ROOT, alias);
    markScanned(full);
    if (!existsSync(full)) {
        warn('logo', alias, 'Brak aliasu logo (powinien = master)', 'logo-alias-missing');
    }
}

// ——— 2. PNG / IKONY ———
for (const png of REQUIRED_PNG) {
    const full = join(ROOT, png);
    markScanned(full);
    if (!existsSync(full)) {
        fail('icons', png, 'Wymagany asset PNG z Brand Book — brak pliku', 'png-missing');
    } else {
        const st = statSync(full);
        if (st.size < 200) {
            fail('icons', png, `Plik PNG podejrzanie mały (${st.size} B)`, 'png-tiny');
        }
    }
}

if (!existsSync(join(ROOT, 'assets/icons/favicon.ico'))) {
    warn('icons', 'assets/icons/favicon.ico', 'Brak favicon.ico z Brand Book', 'favicon-missing');
}

// ——— 3. MANIFEST / PWA ———
markScanned(manifestPath);
if (!existsSync(manifestPath)) {
    fail('icons', 'manifest.json', 'Brak manifest.json', 'manifest-missing');
} else {
    const manText = readText(manifestPath) || '';
    let man;
    try {
        man = JSON.parse(manText);
    } catch {
        fail('icons', 'manifest.json', 'manifest.json nieparsowalny', 'manifest-parse');
        man = null;
    }
    if (man) {
        const theme = String(man.theme_color || '').toLowerCase();
        const bg = String(man.background_color || '').toLowerCase();
        if (theme && theme !== BRAND.themeColor) {
            fail('colors', 'manifest.json', `theme_color ${theme} ≠ Brand Book ${BRAND.themeColor}`, 'manifest-theme');
        }
        if (bg && bg !== BRAND.backgroundColor) {
            fail('colors', 'manifest.json', `background_color ${bg} ≠ Brand Book ${BRAND.backgroundColor}`, 'manifest-bg');
        }
        const icons = JSON.stringify(man.icons || []);
        if (!/icon-192\.png/.test(icons) || !/icon-512\.png/.test(icons)) {
            fail('icons', 'manifest.json', 'Manifest bez icon-192 / icon-512', 'manifest-icons');
        }
        if (!/maskable-512/.test(icons)) {
            warn('icons', 'manifest.json', 'Brak maskable-512 w manifest', 'manifest-maskable');
        }
        if (!/monochrome-512/.test(icons)) {
            warn('icons', 'manifest.json', 'Brak monochrome-512 (Android 13+)', 'manifest-mono');
        }
        if (/emoji|🌾|placeholder|logo-old|icon-legacy/i.test(icons)) {
            fail('icons', 'manifest.json', 'Manifest wskazuje na legacy/placeholder/emoji', 'manifest-legacy');
        }
    }
}

markScanned(swPath);
if (!existsSync(swPath)) {
    warn('icons', 'sw.js', 'Brak Service Worker (PWA)', 'sw-missing');
} else {
    const sw = readText(swPath) || '';
    if (!/isAppIconPath|logo-master|icon-192|icon-512/i.test(sw)) {
        warn('icons', 'sw.js', 'SW nie wygląda na świadomy ikon marki', 'sw-icons');
    }
    // cache-first na ikony = ryzyko starej ikony (znane z 28F)
    if (/cache-first[\s\S]{0,80}icon|icons[\s\S]{0,120}cacheFirst/i.test(sw)
        && !/network-first|networkFirst/i.test(sw)) {
        warn('icons', 'sw.js', 'Możliwy cache-first dla ikon — ryzyko starego logo', 'sw-cache');
    }
}

// ——— 4. HTML / CSS / SVG text scan ———
const textFiles = [...htmlFiles, ...cssFiles, ...svgFiles];
for (const file of textFiles) {
    markScanned(file);
    const text = readText(file);
    if (text == null) continue;
    const pathRel = rel(file);
    const lower = text.toLowerCase();

    // colors
    for (const hex of COLD_HEX) {
        if (lower.includes(hex.toLowerCase())) {
            // allow in comments? still flag — Brand Book zakazuje
            const sev = pathRel.includes('brand-identity') || pathRel.endsWith('.html')
                ? 'fail'
                : 'warning';
            add(sev, 'colors', file, `Zimny/fioletowy hex ${hex}`, `cold-${hex}`);
        }
    }

    // fonts
    for (const font of FOREIGN_FONTS) {
        if (new RegExp(`font-family[^;{]*${font}`, 'i').test(text)) {
            fail('fonts', file, `Obcy font marki: ${font}`, `font-${font}`);
        }
        if (pathRel.endsWith('.html') && new RegExp(`family=${font.replace(/\s+/g, '+')}`, 'i').test(text)) {
            fail('fonts', file, `Google Fonts ładuje obcy font: ${font}`, `gfont-${font}`);
        }
    }

    // logo refs in HTML
    if (pathRel.endsWith('.html')) {
        if (/brand-mark|header-brand|lp-brand|lp-hero-logo|home-brand-mark|premium-hero-icon/i.test(text)
            && !/logo-master\.svg/i.test(text)) {
            fail('logo', file, 'Slot marki bez logo-master.svg', 'html-missing-master');
        }
        // emoji as brand in img/span brand slots
        if (/<(?:img|span)[^>]*(?:brand-mark|hero-logo|premium-hero-icon|header-brand)[^>]*>\s*[🌾👑]/u.test(text)
            || /class="[^"]*brand-mark[^"]*"[^>]*>\s*[🌾👑]/u.test(text)) {
            fail('logo', file, 'Emoji w slocie brand zamiast logo-master', 'html-emoji-brand');
        }
        if (/\?\?/.test(text) && /brand-mark|logo-master|favicon/i.test(text)) {
            warn('logo', file, 'Możliwe uszkodzone „??” przy brand/ikonach', 'html-qq');
        }
    }

    // extra logo svg
    if (pathRel.includes('logo') && pathRel.endsWith('.svg')
        && !/logo-master|logo-on-|logo-mark|icon-source|icon-symbol/.test(pathRel)) {
        warn('logo', file, 'Dodatkowy plik logo poza master/alias', 'extra-logo-svg');
    }

    // shadows — purple / neon glow
    for (const glow of PURPLE_GLOW) {
        if (lower.includes(glow.toLowerCase())) {
            fail('shadows', file, `Cień/glow naruszający Brand Book: ${glow}`, 'purple-glow');
        }
    }
    if (/box-shadow:\s*[^;]*(0\s+0\s+\d{2,}px|0\s+0\s+\d+px\s+\d+px)\s+rgba?\(\s*(100|110|120|124|139)\s*,/i.test(text)) {
        warn('shadows', file, 'Podejrzany neonowy / szeroki glow box-shadow', 'neon-shadow');
    }
    if (/filter:\s*drop-shadow\([^)]*(99,\s*102,\s*241|124,\s*58,\s*237|139,\s*92,\s*246)/i.test(text)) {
        fail('shadows', file, 'drop-shadow w fiolecie / startup glow', 'drop-shadow-purple');
    }

    // photos / placeholders
    if (/placeholder\.(png|jpg|webp)|logo-old|icon-legacy|missing[-_]icon|broken[-_]svg/i.test(text)) {
        warn('photos', file, 'Placeholder / legacy asset w treści', 'photo-placeholder');
    }
    if (/unsplash\.com|picsum\.photos|via\.placeholder/i.test(text)) {
        warn('photos', file, 'Zewnętrzny stock/placeholder URL (ryzyko klimatu marki)', 'photo-stock');
    }

    // spacing — chaos vs tokens (soft)
    if (pathRel.endsWith('.css') && /padding:\s*\d{3,}px/i.test(text)) {
        warn('spacing', file, 'Bardzo duży padding px (sprawdź spójność odstępów Brand Book)', 'spacing-huge');
    }

    // radius — extreme pills on brand chrome
    if (pathRel.endsWith('.css')) {
        if (/border-radius:\s*(9999?px|50%)/i.test(text)
            && /header|brand|premium-hero|home-greeting/i.test(text)) {
            warn('radius', file, 'Ekstremalny radius (pill) w kontekście brand/hero', 'radius-pill-brand');
        }
        // count extreme pills globally as soft signal
        const pills = text.match(/border-radius:\s*9999?px/gi) || [];
        if (pills.length >= 12) {
            warn('radius', file, `${pills.length}× border-radius 999px — ryzyko „pill cluster”`, 'radius-pill-cluster');
        }
    }

    // gradients — purple / cold
    if (/linear-gradient|radial-gradient/i.test(text)) {
        if (/#(7c3aed|8b5cf6|6366f1|4f46e5|a855f7)/i.test(text)) {
            fail('gradients', file, 'Gradient fioletowy / startup — zakaz Brand Book', 'grad-purple');
        }
        if (/linear-gradient\([^)]*#(2563eb|3b82f6|0ea5e9)/i.test(text)) {
            fail('gradients', file, 'Gradient zimnego niebieskiego', 'grad-cold');
        }
    }

    // animations — AI glow / neon pulse
    if (/@keyframes/i.test(text)) {
        const blocks = text.split(/@keyframes/i).slice(1);
        for (const block of blocks.slice(0, 40)) {
            const head = block.slice(0, 80);
            const body = block.slice(0, 600);
            if (/glow|neon|pulse-ai|shimmer-ai/i.test(head)
                || PURPLE_GLOW.some((g) => body.toLowerCase().includes(g.toLowerCase()))) {
                warn('animations', file, `Animacja podejrzana o glow/neon: ${head.split('{')[0].trim()}`, 'anim-glow');
            }
        }
    }
}

// ——— 5. Header tile / typography presence ———
const brandCss = join(ROOT, 'css/brand-identity-final.css');
if (existsSync(brandCss)) {
    markScanned(brandCss);
    const bc = readText(brandCss) || '';
    if (!/Literata/i.test(bc) || !/Source Sans 3/i.test(bc)) {
        fail('fonts', brandCss, 'brand-identity-final bez Literata / Source Sans 3', 'brand-fonts');
    }
    if (!/--brand-green:\s*#2a3f28/i.test(bc) || !/--brand-gold:\s*#c9a227/i.test(bc)
        || !/--brand-cream:\s*#f5efe3/i.test(bc)) {
        fail('colors', brandCss, 'Tokeny --brand-* nie zgadzają się z Brand Book', 'brand-tokens');
    }
    if (!/logo-master\.svg/i.test(bc)) {
        fail('logo', brandCss, '--brand-logo / CSS bez logo-master.svg', 'brand-logo-token');
    }
}

const premiumHeader = join(ROOT, 'css/premium-header.css');
if (existsSync(premiumHeader)) {
    markScanned(premiumHeader);
    const ph = readText(premiumHeader) || '';
    if (/header-brand-mark[\s\S]{0,200}background:\s*(?!transparent)(?!none)[#a-z]/i.test(ph)) {
        warn('logo', premiumHeader, 'Header mark może mieć kafelek tła (Brand Book: glyph)', 'header-tile');
    }
}

// ——— 6. Deduplicate findings (same rule+file+detail) ———
const seen = new Set();
const unique = [];
for (const f of findings) {
    const key = `${f.severity}|${f.category}|${f.file}|${f.detail}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(f);
}

const status = resolveStatus(unique);
const categories = {};
for (const cat of [
    'logo', 'colors', 'fonts', 'icons', 'shadows',
    'photos', 'spacing', 'radius', 'gradients', 'animations'
]) {
    categories[cat] = {
        fail: unique.filter((f) => f.category === cat && f.severity === 'fail').length,
        warning: unique.filter((f) => f.category === cat && f.severity === 'warning').length
    };
}

const day = new Date().toISOString().slice(0, 10);
const report = {
    id: 'brand-protection-29c',
    title: 'Brand Protection AI — ETAP 29C',
    generatedAt: new Date().toISOString(),
    day,
    status,
    policy: { ...POLICY },
    summary: {
        filesScanned: scanned.size,
        findings: unique.length,
        fail: unique.filter((f) => f.severity === 'fail').length,
        warning: unique.filter((f) => f.severity === 'warning').length,
        ok: status === 'PASS'
    },
    categories,
    findings: unique,
    // compat with older consumers
    violations: unique.map((f) => ({
        file: f.file,
        rule: f.id,
        detail: `[${f.severity}] ${f.category}: ${f.detail}`,
        message: f.message
    }))
};

const md = brandProtectionToMarkdown(report);

mkdirSync(OUT_BRAND, { recursive: true });
mkdirSync(OUT_ETAP, { recursive: true });
writeFileSync(join(OUT_BRAND, 'BRAND-PROTECTION.json'), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT_BRAND, 'BRAND-PROTECTION.md'), md, 'utf8');
writeFileSync(join(OUT_ETAP, 'latest.json'), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT_ETAP, 'latest.md'), md, 'utf8');
writeFileSync(join(OUT_ETAP, `${day}.json`), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT_ETAP, `${day}.md`), md, 'utf8');

console.log(`\n Status: ${status}`);
console.log(` FAIL: ${report.summary.fail} · WARNING: ${report.summary.warning}`);
console.log(` Files: ${report.summary.filesScanned}`);
console.log(` Wrote: docs/brand/BRAND-PROTECTION.md`);
console.log(` Wrote: docs/brand-protection/latest.md`);
console.log(' Policy: autoApply=false · nie zmienia kodu');
console.log('══════════════════════════════════════════');

if (strict && status === 'FAIL') process.exit(1);
process.exit(0);
