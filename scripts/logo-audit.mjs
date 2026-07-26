/**
 * ETAP 28A – Logo Audit
 * Jedyna oficjalna ikona aplikacji: assets/icons/logo-master.svg (dwa złote kłosy →)
 *
 * Usage: npm run logo-audit
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
import { createHash } from 'node:crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MASTER = 'assets/icons/logo-master.svg';
const OUT = join(ROOT, 'docs', 'brand');

const CANONICAL_SURFACES = [
    { id: 'header', file: 'index.html', expect: /header-brand-mark[^>]*logo-master\.svg/ },
    { id: 'side-menu', file: 'index.html', expect: /side-menu-brand-mark[^>]*logo-master\.svg/ },
    { id: 'home-greeting', file: 'js/views/home.js', expect: /home-brand-mark"\s+src="\/assets\/icons\/logo-master\.svg/ },
    { id: 'home-footer', file: 'js/views/home.js', expect: /footer-brand[\s\S]{0,200}logo-master\.svg/ },
    { id: 'favicon-ico', file: 'index.html', expect: /favicon\.ico/ },
    { id: 'favicon-svg', file: 'index.html', expect: /logo-master\.svg/ },
    { id: 'apple-touch', file: 'index.html', expect: /apple-touch-icon/ },
    { id: 'pwa-manifest', file: 'manifest.json', expect: /icon-192\.png|maskable-512/ },
    { id: 'android-maskable', file: 'manifest.json', expect: /maskable-512/ },
    { id: 'sw-precache', file: 'sw.js', expect: /logo-master\.svg/ },
    { id: 'sw-notify-icon', file: 'sw.js', expect: /icon-192\.png/ },
    { id: 'push-icon', file: 'js/core/pushNotifications.js', expect: /icon-192\.png/ },
    { id: 'og-image', file: 'index.html', expect: /og-share\.png/ },
    { id: 'landing-favicon', file: 'landing.html', expect: /logo-master\.svg/ },
    { id: 'landing-header', file: 'landing.html', expect: /lp-brand-mark[^>]*logo-master\.svg/ },
    { id: 'landing-hero', file: 'landing.html', expect: /lp-hero-logo[^>]*logo-master\.svg/ },
    { id: 'brand-css-token', file: 'css/brand-identity-final.css', expect: /--brand-logo:[^;]*logo-master\.svg/ },
    { id: 'splash-css', file: 'css/brand-identity-final.css', expect: /--brand-logo|splash/ },
    { id: 'pwa-install-banner', file: 'css/brand-identity-final.css', expect: /pwa-install-banner::before/ },
    { id: 'google-play', file: 'assets/store/google-play/icon-512.png', expect: null, exists: true },
    { id: 'app-store', file: 'assets/store/app-store/icon-1024.png', expect: null, exists: true },
    { id: 'readme', file: 'README.md', expect: /logo-master\.svg/ },
    { id: 'brand-book-md', file: 'docs/brand/BRAND-BOOK.md', expect: /logo-master\.svg/ },
    { id: 'brand-book-html', file: 'docs/brand/brand-book.html', expect: /logo-master\.svg/ },
    { id: 'notifications-asset', file: 'assets/brand/notifications-icon.png', expect: null, exists: true },
    { id: 'splash-asset', file: 'assets/brand/splash-logo.png', expect: null, exists: true },
    { id: 'og-asset', file: 'assets/brand/og-share.png', expect: null, exists: true }
];

const DERIVED_OK = new Set([
    'logo-master.svg',
    'icon-source.svg',
    'icon-symbol.svg',
    'favicon.ico',
    'apple-touch-icon.png',
    'maskable-512.png',
    'notifications-icon.png',
    'og-share.png',
    'splash-logo.png',
    'logo-on-light.svg',
    'logo-on-light.png',
    'logo-on-dark.svg',
    'logo-on-dark.png',
    'logo-mark.svg',
    'logo-mark.png',
    'feature-graphic-source.png',
    'icon-1024.png',
    'icon-512.png',
    'icon-384.png',
    'icon-256.png',
    'icon-192.png',
    'icon-180.png',
    'icon-152.png',
    'icon-144.png',
    'icon-128.png',
    'icon-96.png',
    'icon-72.png',
    'icon-48.png'
]);

function read(rel) {
    const full = join(ROOT, rel);
    if (!existsSync(full)) return null;
    return readFileSync(full, 'utf8');
}

function hashFile(rel) {
    const full = join(ROOT, rel);
    if (!existsSync(full)) return null;
    return createHash('sha256').update(readFileSync(full)).digest('hex').slice(0, 16);
}

function walk(dir, out = []) {
    const full = join(ROOT, dir);
    if (!existsSync(full)) return out;
    for (const name of readdirSync(full, { withFileTypes: true })) {
        const rel = join(dir, name.name).replace(/\\/g, '/');
        if (name.isDirectory()) {
            if (['node_modules', '.git', 'js/legacy'].includes(name.name) || rel.includes('node_modules')) continue;
            walk(rel, out);
        } else {
            out.push(rel);
        }
    }
    return out;
}

const masterHash = hashFile(MASTER);
const found = [];
const replaced = [];
const missing = [];
const notes = [];

// Surfaces
for (const s of CANONICAL_SURFACES) {
    const full = join(ROOT, s.file);
    if (!existsSync(full)) {
        missing.push({ surface: s.id, file: s.file, reason: 'plik nie istnieje' });
        continue;
    }
    if (s.exists) {
        found.push({ surface: s.id, file: s.file, status: 'ok-asset', note: 'asset pochodny z master (generate-icons)' });
        continue;
    }
    const text = read(s.file) || '';
    if (s.expect.test(text)) {
        found.push({ surface: s.id, file: s.file, status: 'ok-master', note: 'wskazuje logo-master / ikony z master' });
    } else {
        missing.push({ surface: s.id, file: s.file, reason: 'brak oczekiwanego odwołania do logo-master / ikon' });
    }
}

// Brand emoji leftovers in UI brand slots
const brandSlotFiles = ['index.html', 'landing.html'];
for (const f of brandSlotFiles) {
    const t = read(f) || '';
    const brandEmoji = /(?:header-brand-mark|side-menu-brand-mark|lp-brand-mark|lp-hero-logo|home-brand-mark)[^>]*>\s*🌾/.test(t)
        || /class="(?:lp-brand-mark|lp-hero-logo|side-menu-brand-mark)"[^>]*>\s*🌾/.test(t);
    if (brandEmoji) {
        missing.push({ surface: 'emoji-brand-slot', file: f, reason: 'emoji 🌾 nadal w slocie marki' });
    } else if (/logo-master\.svg/.test(t)) {
        replaced.push({
            surface: 'emoji→logo-master',
            file: f,
            note: 'Sloty marki używają <img logo-master.svg> zamiast emoji 🌾'
        });
    }
}

// Hash aliases
for (const alias of ['assets/icons/icon-source.svg', 'assets/icons/icon-symbol.svg']) {
    const h = hashFile(alias);
    if (h && h === masterHash) {
        found.push({ surface: 'alias', file: alias, status: 'ok-identical', note: `SHA = master (${masterHash})` });
    } else if (h) {
        missing.push({ surface: 'alias-drift', file: alias, reason: `hash ${h} ≠ master ${masterHash}` });
    } else {
        missing.push({ surface: 'alias', file: alias, reason: 'brak pliku' });
    }
}

// Scan for suspicious logo-like files
const imageFiles = [
    ...walk('assets/icons'),
    ...walk('assets/brand'),
    ...walk('assets/store')
];
const foreignLogos = [];
for (const rel of imageFiles) {
    const base = rel.split('/').pop();
    if (!/\.(svg|png|ico|jpg|webp)$/i.test(base)) continue;
    if (DERIVED_OK.has(base) || /^icon-\d+\.png$/.test(base)) continue;
    foreignLogos.push(rel);
}

// Decorative wheat motif (not app logo)
const motif = 'assets/images/motifs/wheat.svg';
if (existsSync(join(ROOT, motif))) {
    notes.push({
        type: 'not-app-logo',
        file: motif,
        note: 'Dekoracyjny motyw klimatu (1 kłos) — NIE jest ikoną aplikacji. Zachowany jako ornament UI.'
    });
}

// Replaced this etap (documented)
replaced.push(
    {
        surface: 'landing-header',
        file: 'landing.html',
        note: '🌾 → <img class="lp-brand-mark" src="logo-master.svg">'
    },
    {
        surface: 'landing-hero',
        file: 'landing.html',
        note: '🌾 → <img class="lp-hero-logo" src="logo-master.svg">'
    },
    {
        surface: 'side-menu',
        file: 'index.html',
        note: '🌾 → <img class="side-menu-brand-mark" src="logo-master.svg">'
    },
    {
        surface: 'css-brand-slots',
        file: 'css/brand-identity-final.css',
        note: 'Usunięto overlay emoji→CSS; style pod <img> logo-master'
    },
    {
        surface: 'cache-bust',
        file: 'index.html / landing / manifest / sw / home',
        note: 'Ikony ?v=20 → ?v=21 · SW rg-pwa-v21'
    }
);

const report = {
    id: 'logo-audit-28a',
    title: 'Logo Audit — ETAP 28A',
    generatedAt: new Date().toISOString(),
    policy: {
        singleLogo: true,
        master: MASTER,
        motif: 'dwa złote kłosy pochylone w prawo',
        role: 'app-icon'
    },
    master: {
        path: MASTER,
        sha256_16: masterHash,
        exists: Boolean(masterHash)
    },
    summary: {
        found: found.length,
        replaced: replaced.length,
        missing: missing.length,
        foreignLogoFiles: foreignLogos.length,
        ok: missing.length === 0 && foreignLogos.length === 0
    },
    found,
    replaced,
    missing,
    foreignLogoFiles: foreignLogos,
    notes
};

function toMarkdown(r) {
    const lines = [
        `# ${r.title}`,
        '',
        `Wygenerowano: ${r.generatedAt}`,
        '',
        '## Zasada',
        '',
        `Jedyna oficjalna **ikona aplikacji**: \`${r.policy.master}\``,
        `Motyw: **${r.policy.motif}**`,
        `Master SHA (16): \`${r.master.sha256_16 || '—'}\``,
        '',
        `**Werdykt:** ${r.summary.ok ? '✅ PASS — jedno logo wszędzie' : '⚠ wymaga uwagi'}`,
        '',
        '## ✓ Miejsca gdzie logo zostało znalezione',
        ''
    ];
    for (const f of r.found) {
        lines.push(`- **${f.surface}** — \`${f.file}\` · ${f.status}${f.note ? ` · ${f.note}` : ''}`);
    }
    lines.push('', '## ✓ Miejsca gdzie zostało podmienione (ETAP 28A)', '');
    for (const f of r.replaced) {
        lines.push(`- **${f.surface}** — \`${f.file}\` · ${f.note}`);
    }
    lines.push('', '## ✗ Miejsca których nie udało się znaleźć / problemy', '');
    if (!r.missing.length && !r.foreignLogoFiles.length) {
        lines.push('_Brak — wszystkie wymagane powierzchnie mają logo-master / pochodne._');
    } else {
        for (const m of r.missing) {
            lines.push(`- **${m.surface}** — \`${m.file}\` · ${m.reason}`);
        }
        for (const f of r.foreignLogoFiles) {
            lines.push(`- **foreign-file** — \`${f}\` · nie na liście kanonicznych pochodnych`);
        }
    }
    lines.push('', '## Notatki', '');
    for (const n of r.notes) {
        lines.push(`- \`${n.file}\` — ${n.note}`);
    }
    lines.push('', '## Powierzchnie (checklist)', '');
    lines.push('Header · Splash · PWA · favicon · Apple Touch · Android maskable · Google Play · App Store · manifest · powiadomienia · instalacja PWA · landing · README · Brand Book');
    lines.push('');
    return lines.join('\n');
}

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'LOGO-AUDIT.json'), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT, 'LOGO-AUDIT.md'), toMarkdown(report), 'utf8');

console.log(`[Logo Audit] ${report.summary.ok ? 'PASS' : 'ATTENTION'}`);
console.log(`found ${report.summary.found} · replaced ${report.summary.replaced} · missing ${report.summary.missing}`);
console.log(`Wrote: ${relative(ROOT, join(OUT, 'LOGO-AUDIT.md'))}`);
process.exit(report.summary.ok ? 0 : 1);
