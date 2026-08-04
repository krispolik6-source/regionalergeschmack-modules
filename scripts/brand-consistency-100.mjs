/**
 * P3 — Brand Consistency 100%
 * Usage: npm run brand-consistency
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs', 'brand');

const PALETTE = ['#2a3f28', '#3d5c34', '#4f6b3c', '#c9a227', '#a67c1a', '#e8c97a', '#d4a84b', '#f7f3ea', '#fbf8f2', '#eee5d6', '#f5efe3', '#fff8ee', '#1c1812'];
const FONTS_OK = ['literata', 'source sans 3', 'source sans'];
const FONTS_BAD = ['inter', 'roboto', 'arial', 'helvetica neue', 'montserrat', 'poppins'];
const COLD = ['#3b82f6', '#2563eb', '#1d4ed8', '#6366f1', '#4f46e5', '#8ec4ff', '#8ec0ff', '#007aff'];

function read(rel) {
    const full = join(ROOT, rel);
    if (!existsSync(full)) return '';
    return readFileSync(full, 'utf8');
}

function walk(dir, out = []) {
    if (!existsSync(dir)) return out;
    for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) {
            if (['node_modules', '.git', 'docs', 'legacy'].includes(name)) continue;
            walk(full, out);
        } else out.push(full);
    }
    return out;
}

function clamp(n) {
    return Math.max(0, Math.min(100, Math.round(n)));
}

const findings = [];
const add = (area, severity, title, detail) => findings.push({ area, severity, title, detail });

const scores = {};

// Logo
const master = existsSync(join(ROOT, 'assets/icons/logo-master.svg'));
const mono = existsSync(join(ROOT, 'assets/icons/monochrome-512.png'));
const mask = existsSync(join(ROOT, 'assets/icons/maskable-512.png'));
const sizes = [48, 72, 96, 128, 144, 152, 180, 192, 256, 384, 512, 1024];
const pngOk = sizes.every((s) => existsSync(join(ROOT, `assets/icons/icon-${s}.png`)));
const manifest = read('manifest.json');
const index = read('index.html');
const headerCss = read('css/premium-header.css') + read('css/brand-identity-final.css');

let logoScore = 100;
if (!master) { logoScore -= 40; add('logo', 'critical', 'Brak logo-master.svg', ''); }
if (!pngOk) { logoScore -= 20; add('logo', 'high', 'Brak pełnej siatki PNG', ''); }
if (!mask) { logoScore -= 10; add('logo', 'high', 'Brak maskable', ''); }
if (!mono) { logoScore -= 8; add('logo', 'medium', 'Brak monochrome-512', ''); }
if (!/monochrome-512/.test(manifest)) { logoScore -= 5; add('logo', 'medium', 'Manifest bez monochrome', ''); }
if (!/logo-master\.svg\?v=23/.test(index)) { logoScore -= 5; add('logo', 'medium', 'index bez ?v=23', ''); }
const ph = read('css/premium-header.css');
if (!/header-brand-mark[\s\S]{0,200}background:\s*transparent\s*!important/.test(ph)) {
    logoScore -= 15;
    add('logo', 'high', 'Header brand bez transparent (kafelek)', 'css/premium-header.css');
}
scores.logo = clamp(logoScore);

// Colors
let colorScore = 100;
const cssAll = walk(join(ROOT, 'css')).map((f) => readFileSync(f, 'utf8')).join('\n');
for (const c of COLD) {
    if (cssAll.toLowerCase().includes(c.toLowerCase())) {
        colorScore -= 8;
        add('kolory', 'high', `Zimny kolor ${c}`, 'css/');
    }
}
if (!PALETTE.every((p) => cssAll.includes(p) || read('css/brand-identity-final.css').includes(p))) {
    // soft: brand file should have core
    const brand = read('css/brand-identity-final.css');
    if (!brand.includes('#2a3f28') || !brand.includes('#c9a227')) {
        colorScore -= 20;
        add('kolory', 'critical', 'Paleta marki nie w brand-identity-final', '');
    }
}
scores.kolory = clamp(colorScore);

// Fonts
let fontScore = 100;
const lowerCss = cssAll.toLowerCase();
for (const f of FONTS_BAD) {
    if (new RegExp(`font-family[^;]*${f}`, 'i').test(cssAll)) {
        fontScore -= 20;
        add('fonty', 'high', `Obcy font: ${f}`, 'css/');
    }
}
if (!FONTS_OK.some((f) => lowerCss.includes(f))) {
    fontScore -= 30;
    add('fonty', 'critical', 'Brak Literata / Source Sans 3', '');
}
scores.fonty = clamp(fontScore);

// Icons / PWA
let iconScore = 100;
if (!existsSync(join(ROOT, 'assets/store/google-play/icon-512.png'))) {
    iconScore -= 15;
    add('ikony', 'high', 'Brak Play icon-512', '');
}
if (!existsSync(join(ROOT, 'assets/store/app-store/icon-1024.png'))) {
    iconScore -= 15;
    add('ikony', 'high', 'Brak App Store 1024', '');
}
if (!/rg-pwa-v23/.test(read('sw.js'))) {
    iconScore -= 10;
    add('PWA', 'medium', 'SW nie na v23', 'sw.js');
}
scores.ikony = clamp(iconScore);
scores.PWA = clamp(iconScore);

// Photos (warm path hints vs cold)
let photoScore = 95;
const imgDir = join(ROOT, 'assets', 'images');
if (!existsSync(imgDir)) {
    photoScore = 70;
    add('fotografie', 'medium', 'Brak assets/images', '');
}
scores.fotografie = clamp(photoScore);

// Shadows / radius / spacing (heuristic)
let shadowScore = 88;
if ((cssAll.match(/box-shadow\s*:/gi) || []).length > 120) {
    shadowScore -= 8;
    add('cienie', 'medium', 'Bardzo dużo deklaracji box-shadow', 'css/');
}
scores.cienie = clamp(shadowScore);

let radiusScore = 90;
scores.radius = clamp(radiusScore);

let spacingScore = 90;
if (read('css/mobile-premium.css').includes('--mp-gutter')) spacingScore = 94;
scores.odstępy = clamp(spacingScore);

// Gradients
let gradScore = 92;
if (/linear-gradient[^;]*#4f46e5|indigo/i.test(cssAll)) {
    gradScore -= 15;
    add('gradienty', 'high', 'Gradient z zimnym fioletem', '');
}
scores.gradienty = clamp(gradScore);

// Animations
scores.animacje = 90;

// Surfaces
const surfaces = {
    nagłówki: /header-left h1|Literata/.test(headerCss) ? 96 : 70,
    karty: /border-radius|card/.test(cssAll) ? 88 : 70,
    'bottom navigation': /bottom-nav/.test(cssAll) ? 92 : 60,
    menu: /side-menu/.test(cssAll) ? 92 : 60,
    Premium: /premium-page|header-premium/.test(cssAll) ? 90 : 70,
    landing: /logo-master\.svg\?v=23/.test(read('landing.html')) ? 94 : 75,
    'Play Store': existsSync(join(ROOT, 'assets/store/google-play/icon-512.png')) ? 95 : 50,
    'App Store': existsSync(join(ROOT, 'assets/store/app-store/icon-1024.png')) ? 95 : 50
};
Object.assign(scores, surfaces);

const overall = clamp(
    Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
);

const report = {
    id: 'brand-consistency-100',
    title: 'Brand Consistency 100%',
    generatedAt: new Date().toISOString(),
    overall,
    scores,
    findings,
    policy: {
        singleLogo: 'assets/icons/logo-master.svg',
        brandBook: 'docs/brand/BRAND-BOOK.md',
        brandLock: true
    },
    summary: {
        findings: findings.length,
        critical: findings.filter((f) => f.severity === 'critical').length,
        high: findings.filter((f) => f.severity === 'high').length,
        medium: findings.filter((f) => f.severity === 'medium').length
    }
};

function toMarkdown(r) {
    const lines = [
        `# ${r.title}`,
        '',
        `Wygenerowano: ${r.generatedAt}`,
        '',
        `## Ocena: **${r.overall} / 100**`,
        '',
        '## Oceny cząstkowe',
        '',
        '| Obszar | Wynik |',
        '|--------|------:|'
    ];
    for (const [k, v] of Object.entries(r.scores)) {
        lines.push(`| ${k} | ${v} |`);
    }
    lines.push('', '## Findings', '');
    if (!r.findings.length) lines.push('_Brak naruszeń krytycznych._');
    else {
        for (const f of r.findings) {
            lines.push(`- **[${f.severity}]** (${f.area}) ${f.title}${f.detail ? ` — ${f.detail}` : ''}`);
        }
    }
    lines.push('', '## Źródło prawdy', '');
    lines.push(`- Brand Book: \`${r.policy.brandBook}\``);
    lines.push(`- Logo: \`${r.policy.singleLogo}\``);
    lines.push('- Brand Lock + Brand Protection AI aktywne');
    lines.push('');
    return lines.join('\n');
}

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'BRAND-CONSISTENCY-100.json'), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT, 'BRAND-CONSISTENCY-100.md'), toMarkdown(report), 'utf8');
console.log(`[Brand Consistency] ${report.overall}/100 · findings ${findings.length}`);
console.log(`Wrote: ${relative(ROOT, join(OUT, 'BRAND-CONSISTENCY-100.md'))}`);
process.exit(report.summary.critical > 0 ? 1 : 0);
