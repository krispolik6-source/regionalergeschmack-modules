/**
 * ETAP 28G — VISUAL BRAND VERIFICATION
 * PASS tylko gdy logo jest IDENTYCZNE na wszystkich powierzchniach
 * i nie ma ?? / missing / broken / emoji-as-brand / placeholder.
 *
 * Usage: npm run visual-brand
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs', 'brand');
const MASTER = 'assets/icons/logo-master.svg';

function read(rel) {
    const full = join(ROOT, rel);
    if (!existsSync(full)) return null;
    return readFileSync(full);
}

function readText(rel) {
    const b = read(rel);
    return b ? b.toString('utf8') : '';
}

function sha(buf) {
    return createHash('sha256').update(buf).digest('hex').slice(0, 20);
}

function exists(rel) {
    return existsSync(join(ROOT, rel));
}

const rows = [];
const failures = [];

function row(id, ok, detail, file = '') {
    rows.push({ id, ok, detail, file });
    if (!ok) failures.push({ id, detail, file });
}

// ——— 0. Regeneruj ikony (gwarancja pochodzenia z master) ———
console.log('▶ generate-icons (źródło prawdy)');
const gen = spawnSync(process.execPath, ['scripts/generate-app-icons.mjs'], {
    cwd: ROOT,
    encoding: 'utf8'
});
if (gen.status !== 0) {
    row('generate-icons', false, 'generate-icons failed', 'scripts/generate-app-icons.mjs');
}

const masterBuf = read(MASTER);
row('master-exists', Boolean(masterBuf), MASTER, MASTER);
const masterHash = masterBuf ? sha(masterBuf) : null;

// Master = glyph (bez tła kafla) — wymagane dla UI
if (masterBuf) {
    const mt = masterBuf.toString('utf8');
    row(
        'master-is-glyph',
        !/<rect[^>]+fill="#f5efe3"/.test(mt),
        'logo-master.svg musi być samym znakiem (bez kremowego kafelka)',
        MASTER
    );
    row(
        'master-has-wheat',
        /linearGradient id="grain"|ellipse/.test(mt),
        'master zawiera kłosy (grain/ellipse)',
        MASTER
    );
}

// Aliasy SVG = bajtowo master
for (const alias of ['assets/icons/icon-source.svg', 'assets/icons/icon-symbol.svg', 'assets/brand/logo-mark.svg']) {
    const b = read(alias);
    row(
        `alias-${alias.split('/').pop()}`,
        Boolean(b) && sha(b) === masterHash,
        b && sha(b) === masterHash ? 'identyczny z master' : 'INNE LOGO / brak',
        alias
    );
}

// Rodzina PNG ikony aplikacji — muszą być bitowo równe w parach
const icon512 = read('assets/icons/icon-512.png');
const h512 = icon512 ? sha(icon512) : null;
const pairs = [
    ['og-share', 'assets/brand/og-share.png'],
    ['splash', 'assets/brand/splash-logo.png'],
    ['play-store', 'assets/store/google-play/icon-512.png']
];
for (const [id, path] of pairs) {
    const b = read(path);
    row(
        `identical-${id}`,
        Boolean(b) && sha(b) === h512,
        b && sha(b) === h512 ? '= icon-512.png' : 'INNE LOGO niż icon-512',
        path
    );
}
const icon1024 = read('assets/icons/icon-1024.png');
const appStore = read('assets/store/app-store/icon-1024.png');
row(
    'identical-app-store',
    Boolean(icon1024) && Boolean(appStore) && sha(icon1024) === sha(appStore),
    'App Store 1024 = icon-1024',
    'assets/store/app-store/icon-1024.png'
);
const icon192 = read('assets/icons/icon-192.png');
const notify = read('assets/brand/notifications-icon.png');
row(
    'identical-notifications',
    Boolean(icon192) && Boolean(notify) && sha(icon192) === sha(notify),
    'notifications = icon-192',
    'assets/brand/notifications-icon.png'
);

function mustLogoMaster(rel, label) {
    const t = readText(rel);
    const ok = /logo-master\.svg/.test(t);
    row(label, ok, ok ? 'używa logo-master.svg' : 'BRAK logo-master.svg', rel);
    // FAIL: emoji / wheat emoji as brand mark in img slot
    if (/<(?:img|span)[^>]*(?:brand-mark|hero-logo|premium-hero-icon|header-brand)[^>]*>\s*[🌾👑]/u.test(t)
        || /class="[^"]*brand-mark[^"]*"[^>]*>\s*[🌾👑]/u.test(t)) {
        row(`${label}-no-emoji`, false, 'Emoji w slocie brand zamiast logo-master', rel);
    }
    // FAIL: ?? placeholder
    if (/\?\?/.test(t) && !/text \?\?/.test(t) && !/String\(text \?\?/.test(t)) {
        // allow nullish in js
        if (rel.endsWith('.js')) {
            const suspicious = [...t.matchAll(/\?\?/g)].filter((m) => {
                const ctx = t.slice(Math.max(0, m.index - 25), m.index + 5);
                return !/text \?\?|String\(text \?\?/.test(ctx);
            });
            if (suspicious.length) {
                row(`${label}-no-qq`, false, `${suspicious.length}× "??" (broken icon/text)`, rel);
            } else {
                row(`${label}-no-qq`, true, 'brak broken ??', rel);
            }
        } else if (/\?\?/.test(t)) {
            row(`${label}-no-qq`, false, 'Występuje "??" (broken encoding/icon)', rel);
        }
    } else if (!rel.endsWith('.js')) {
        row(`${label}-no-qq`, !/\?\?/.test(t), !/\?\?/.test(t) ? 'brak ??' : '?? found', rel);
    }
}

// ——— Surfaces ———
mustLogoMaster('index.html', 'Header');
mustLogoMaster('index.html', 'Menu');
row(
    'Header-img',
    /header-brand-mark[^>]+logo-master\.svg\?v=\d+/.test(readText('index.html')),
    'header-brand-mark → logo-master',
    'index.html'
);
row(
    'Menu-img',
    /side-menu-brand-mark[^>]+logo-master\.svg\?v=\d+/.test(readText('index.html')),
    'side-menu-brand-mark → logo-master',
    'index.html'
);

const premium = readText('js/views/premium.js');
row(
    'Premium',
    /premium-hero-icon[^>]+logo-master\.svg/.test(premium)
        || /class="premium-hero-icon"[^>]+logo-master\.svg/.test(premium)
        || /<img class="premium-hero-icon"[^>]+logo-master\.svg/.test(premium),
    /logo-master\.svg/.test(premium) && !/<span class="premium-hero-icon"[^>]*>👑/.test(premium)
        ? 'Premium hero = logo-master'
        : 'Premium NIE używa identycznego logo (emoji/span?)',
    'js/views/premium.js'
);

const brandCss = readText('css/brand-identity-final.css');
row(
    'Install banner',
    /pwa-install-banner::before[\s\S]{0,400}var\(--brand-logo\)/.test(brandCss)
        && /--brand-logo:[^;]*logo-master\.svg/.test(brandCss),
    'banner ::before = --brand-logo (logo-master)',
    'css/brand-identity-final.css'
);
row(
    'Splash',
    /rg-booting::before|is-loading::before/.test(brandCss)
        && /--brand-logo/.test(brandCss)
        && exists('assets/brand/splash-logo.png')
        && h512 && sha(read('assets/brand/splash-logo.png')) === h512,
    'Splash CSS + splash-logo.png = icon-512',
    'css/brand-identity-final.css + assets/brand/splash-logo.png'
);

const manifest = readText('manifest.json');
row(
    'PWA',
    /icon-192\.png\?v=\d+/.test(manifest)
        && /maskable-512\.png/.test(manifest)
        && /monochrome-512\.png/.test(manifest)
        && exists('assets/icons/icon-192.png')
        && exists('assets/icons/maskable-512.png'),
    'manifest icons z master (192/maskable/monochrome)',
    'manifest.json'
);

row(
    'Launcher',
    exists('assets/icons/icon-192.png')
        && exists('assets/icons/icon-512.png')
        && exists('assets/icons/maskable-512.png')
        && /rg-pwa-v2\d/.test(readText('sw.js'))
        && /isAppIconPath/.test(readText('sw.js')),
    'launcher assets + SW network-first',
    'assets/icons + sw.js'
);

const home = readText('js/views/home.js');
row(
    'Home',
    /home-brand-mark[^>]+logo-master\.svg/.test(home)
        && /home-premium-icon[^>]+logo-master\.svg|home-premium-icon home-brand-mark[^>]+logo-master/.test(home),
    'Home brand + Premium CTA = logo-master',
    'js/views/home.js'
);

mustLogoMaster('landing.html', 'Landing');
row(
    'Landing-imgs',
    /lp-brand-mark[^>]+logo-master\.svg/.test(readText('landing.html'))
        && /lp-hero-logo[^>]+logo-master\.svg/.test(readText('landing.html')),
    'landing header + hero = logo-master',
    'landing.html'
);

row(
    'Play Store assets',
    exists('assets/store/google-play/icon-512.png')
        && h512
        && sha(read('assets/store/google-play/icon-512.png')) === h512,
    'Play icon-512 = master PNG',
    'assets/store/google-play/icon-512.png'
);
row(
    'App Store assets',
    exists('assets/store/app-store/icon-1024.png')
        && icon1024
        && sha(read('assets/store/app-store/icon-1024.png')) === sha(icon1024),
    'App Store 1024 = master PNG',
    'assets/store/app-store/icon-1024.png'
);

// Global FAIL: broken placeholders in brand shell
for (const f of ['index.html', 'landing.html', 'js/views/home.js', 'js/views/premium.js']) {
    const t = readText(f);
    if (/missing icon|broken svg|placeholder\.png|logo-old|icon-legacy/i.test(t)) {
        row(`no-placeholder-${f}`, false, 'placeholder / legacy logo string', f);
    }
}

const tableIds = [
    'Header',
    'Install banner',
    'PWA',
    'Splash',
    'Launcher',
    'Premium',
    'Menu',
    'Home',
    'Landing',
    'Play Store assets',
    'App Store assets'
];

const ok = failures.length === 0;
const report = {
    id: 'visual-brand-verification-28g',
    title: 'VISUAL BRAND VERIFICATION — ETAP 28G',
    generatedAt: new Date().toISOString(),
    verdict: ok ? 'PASS' : 'FAIL',
    policy: {
        identicalLogoOnly: true,
        noSimilar: true,
        failOnQQ: true,
        failOnEmojiBrand: true,
        master: MASTER,
        masterHash
    },
    summary: {
        ok,
        rows: rows.length,
        failures: failures.length
    },
    table: tableIds.map((id) => {
        const related = rows.filter(
            (r) => r.id === id || r.id.startsWith(id) || r.id.includes(id.replace(/\s.*/, ''))
        );
        const failed = related.filter((r) => !r.ok);
        // also match exact
        const direct = rows.filter((r) => r.id === id || r.id === `${id}-img` || r.id === `${id}-imgs`);
        const groupFail = [...failed, ...rows.filter((r) => !r.ok && (
            (id === 'Header' && /Header|header/i.test(r.id))
            || (id === 'Menu' && /Menu|menu/i.test(r.id))
            || (id === 'Premium' && /Premium|premium/i.test(r.id))
            || (id === 'Install banner' && /Install|banner/i.test(r.id))
            || (id === 'Splash' && /Splash|splash/i.test(r.id))
            || (id === 'PWA' && r.id === 'PWA')
            || (id === 'Launcher' && /Launcher|identical-notifications/i.test(r.id))
            || (id === 'Home' && r.id === 'Home')
            || (id === 'Landing' && /Landing/i.test(r.id))
            || (id === 'Play Store assets' && /Play|play-store|identical-play/i.test(r.id))
            || (id === 'App Store assets' && /App Store|app-store|identical-app/i.test(r.id))
        ))];
        const uniqueFail = [];
        const seen = new Set();
        for (const f of groupFail) {
            if (seen.has(f.id)) continue;
            seen.add(f.id);
            uniqueFail.push(f);
        }
        const pass = uniqueFail.length === 0 && (direct.length ? direct.every((d) => d.ok) : related.every((r) => r.ok) || rows.some((r) => r.id === id && r.ok));
        // simpler: id exact match
        const exact = rows.find((r) => r.id === id);
        const surfaceOk = exact ? exact.ok && uniqueFail.length === 0 : uniqueFail.length === 0;
        return {
            surface: id,
            ok: surfaceOk,
            problems: uniqueFail.map((f) => `${f.file}: ${f.detail}`)
        };
    }),
    rows,
    failures
};

// Recompute table more cleanly
report.table = tableIds.map((surface) => {
    const keys = {
        Header: ['Header', 'Header-img', 'Header-no-qq'],
        Menu: ['Menu', 'Menu-img', 'Menu-no-qq'],
        Premium: ['Premium'],
        'Install banner': ['Install banner'],
        Splash: ['Splash', 'identical-splash'],
        PWA: ['PWA'],
        Launcher: ['Launcher', 'identical-notifications'],
        Home: ['Home'],
        Landing: ['Landing', 'Landing-imgs', 'Landing-no-qq'],
        'Play Store assets': ['Play Store assets', 'identical-play-store'],
        'App Store assets': ['App Store assets', 'identical-app-store']
    }[surface] || [surface];

    const checks = rows.filter((r) => keys.includes(r.id));
    const bad = checks.filter((c) => !c.ok);
    // also any failure that mentions surface file for header/menu
    return {
        surface,
        ok: bad.length === 0 && checks.length > 0,
        problems: bad.map((b) => `${b.file || '—'} — ${b.detail}`)
    };
});

report.verdict = report.table.every((t) => t.ok) && failures.length === 0 ? 'PASS' : 'FAIL';
report.summary.ok = report.verdict === 'PASS';

function toMarkdown(r) {
    const lines = [
        `# ${r.title}`,
        '',
        `Wygenerowano: ${r.generatedAt}`,
        '',
        `## Werdykt: **${r.verdict === 'PASS' ? '✅ PASS' : '❌ FAIL'}**`,
        '',
        'Polityka: logo IDENTYCZNE (nie podobne). Brak `??` / missing / emoji-brand / placeholder.',
        '',
        `Master: \`${r.policy.master}\` · hash \`${r.policy.masterHash}\``,
        '',
        '## Tabela powierzchni',
        ''
    ];
    for (const t of r.table) {
        if (t.ok) lines.push(`- ✓ **${t.surface}**`);
        else {
            lines.push(`- ✗ **${t.surface}**`);
            for (const p of t.problems) lines.push(`  - ${p}`);
        }
    }
    lines.push('', '## Wszystkie checks', '');
    for (const c of r.rows) {
        lines.push(`- ${c.ok ? '✓' : '✗'} ${c.id} — ${c.detail}${c.file ? ` · \`${c.file}\`` : ''}`);
    }
    lines.push('');
    return lines.join('\n');
}

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'VISUAL-BRAND-VERIFICATION.json'), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT, 'VISUAL-BRAND-VERIFICATION.md'), toMarkdown(report), 'utf8');

console.log(`[Visual Brand] ${report.verdict}`);
for (const t of report.table) {
    console.log(t.ok ? `✓ ${t.surface}` : `✗ ${t.surface}`);
    if (!t.ok) t.problems.forEach((p) => console.log('   ', p));
}
console.log(`Wrote: ${relative(ROOT, join(OUT, 'VISUAL-BRAND-VERIFICATION.md'))}`);
process.exit(report.verdict === 'PASS' ? 0 : 1);
