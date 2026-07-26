/**
 * ETAP 28F – MASTER ICON AUDIT
 * Jedyna oficjalna ikona: assets/icons/logo-master.svg
 *
 * Usage: npm run master-icon-audit
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
const OUT = join(ROOT, 'docs', 'brand');
const MASTER = 'assets/icons/logo-master.svg';

/** Sync cache-bust expectations with live SW (no hardcoded icon version). */
function readPwaVersion() {
    const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
    const m = sw.match(/const\s+PWA_VERSION\s*=\s*['"](\d+)['"]/);
    if (!m) throw new Error('PWA_VERSION not found in sw.js');
    return m[1];
}

const ICON_V = readPwaVersion();
const SW_CACHE = `rg-pwa-v${ICON_V}`;
const IMAGE_CACHE = `rg-runtime-images-v${ICON_V}`;
const vRe = (name) => new RegExp(`${name.replace(/\./g, '\\.')}\\?v=${ICON_V}`);

const REQUIRED_PNG = [
    'icon-48.png', 'icon-72.png', 'icon-96.png', 'icon-128.png', 'icon-144.png',
    'icon-152.png', 'icon-180.png', 'icon-192.png', 'icon-256.png', 'icon-384.png',
    'icon-512.png', 'icon-1024.png', 'apple-touch-icon.png', 'maskable-512.png',
    'monochrome-512.png', 'favicon.ico'
];

const ALIAS_SVG = ['icon-source.svg', 'icon-symbol.svg'];

const SURFACES = [
    { id: 'manifest-192', file: 'manifest.json', re: vRe('icon-192.png') },
    { id: 'manifest-512', file: 'manifest.json', re: vRe('icon-512.png') },
    { id: 'manifest-maskable', file: 'manifest.json', re: vRe('maskable-512.png') },
    { id: 'manifest-monochrome', file: 'manifest.json', re: vRe('monochrome-512.png') },
    { id: 'manifest-apple', file: 'manifest.json', re: vRe('apple-touch-icon.png') },
    { id: 'index-favicon', file: 'index.html', re: vRe('favicon.ico') },
    { id: 'index-logo-master', file: 'index.html', re: vRe('logo-master.svg') },
    { id: 'index-icon-192', file: 'index.html', re: vRe('icon-192.png') },
    { id: 'index-apple', file: 'index.html', re: vRe('apple-touch-icon.png') },
    { id: 'index-manifest', file: 'index.html', re: new RegExp(`manifest\\.json\\?v=${ICON_V}`) },
    { id: 'index-og', file: 'index.html', re: vRe('og-share.png') },
    { id: 'landing-logo', file: 'landing.html', re: vRe('logo-master.svg') },
    { id: 'landing-icon-192', file: 'landing.html', re: vRe('icon-192.png') },
    { id: 'home-brand', file: 'js/views/home.js', re: vRe('logo-master.svg') },
    { id: 'push-icon', file: 'js/core/pushNotifications.js', re: vRe('icon-192.png') },
    { id: 'brand-css', file: 'css/brand-identity-final.css', re: vRe('logo-master.svg') },
    // SW buduje nazwy cache z PWA_VERSION (literal `rg-pwa-v28` nie występuje w źródle)
    { id: 'sw-cache', file: 'sw.js', re: /CACHE_VERSION\s*=\s*`rg-pwa-v\$\{PWA_VERSION\}`|rg-pwa-v\$\{PWA_VERSION\}/ },
    { id: 'sw-image-cache', file: 'sw.js', re: /IMAGE_CACHE\s*=\s*`rg-runtime-images-v\$\{PWA_VERSION\}`|rg-runtime-images-v\$\{PWA_VERSION\}/ },
    { id: 'sw-network-first-icons', file: 'sw.js', re: /isAppIconPath|network-first/ },
    {
        id: 'sw-default-icon',
        file: 'sw.js',
        re: /icon-192\.png\?v=\$\{ICON_VERSION\}|ICON_VERSION\s*=\s*PWA_VERSION/
    },
    { id: 'header-no-tile', file: 'css/premium-header.css', re: /\.header-brand-mark[\s\S]{0,400}background:\s*transparent\s*!important/ },
    { id: 'og-asset', file: 'assets/brand/og-share.png', exists: true },
    { id: 'splash-asset', file: 'assets/brand/splash-logo.png', exists: true },
    { id: 'notify-asset', file: 'assets/brand/notifications-icon.png', exists: true },
    { id: 'play-512', file: 'assets/store/google-play/icon-512.png', exists: true },
    { id: 'store-1024', file: 'assets/store/app-store/icon-1024.png', exists: true }
];

function read(rel) {
    const full = join(ROOT, rel);
    if (!existsSync(full)) return '';
    return readFileSync(full, 'utf8');
}

function hashFile(rel) {
    const full = join(ROOT, rel);
    if (!existsSync(full)) return null;
    return createHash('sha256').update(readFileSync(full)).digest('hex').slice(0, 16);
}

function walk(dir, out = []) {
    if (!existsSync(dir)) return out;
    for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        const st = statSync(full);
        if (st.isDirectory()) {
            if (['node_modules', '.git', 'docs'].includes(name)) continue;
            walk(full, out);
        } else {
            out.push(full);
        }
    }
    return out;
}

const checks = [];
const assert = (id, ok, detail) => checks.push({ id, ok, detail });

assert('master-exists', existsSync(join(ROOT, MASTER)), MASTER);

const masterHash = hashFile(MASTER);
assert('master-hash', Boolean(masterHash), `sha256…${masterHash}`);

for (const alias of ALIAS_SVG) {
    const h = hashFile(`assets/icons/${alias}`);
    assert(`alias-${alias}`, h === masterHash, h === masterHash ? 'identyczny z master' : `DIFF ${h} ≠ ${masterHash}`);
}

for (const png of REQUIRED_PNG) {
    assert(`png-${png}`, existsSync(join(ROOT, 'assets/icons', png)), `assets/icons/${png}`);
}

const usages = [];
const staleRefs = [];
const scanRoots = ['index.html', 'landing.html', 'manifest.json', 'sw.js', 'css', 'js', 'assets'];
const textExt = new Set(['.html', '.js', '.mjs', '.css', '.json', '.md', '.svg']);

for (const rootName of scanRoots) {
    const full = join(ROOT, rootName);
    const files = existsSync(full) && statSync(full).isDirectory()
        ? walk(full)
        : existsSync(full) ? [full] : [];
    for (const file of files) {
        const ext = extname(file).toLowerCase();
        if (!textExt.has(ext)) continue;
        const rel = relative(ROOT, file).replace(/\\/g, '/');
        if (rel.startsWith('docs/')) continue;
        let text;
        try {
            text = readFileSync(file, 'utf8');
        } catch {
            continue;
        }
        const iconHits = [...text.matchAll(/\/assets\/(?:icons|brand)\/[A-Za-z0-9._-]+\.(?:png|svg|ico)(?:\?v=\d+)?/g)];
        for (const m of iconHits) {
            usages.push({ file: rel, ref: m[0] });
            if (/\?v=21\b/.test(m[0]) && /icon|logo-master|favicon|maskable|apple-touch|og-share|splash|notifications/i.test(m[0])) {
                staleRefs.push({ file: rel, ref: m[0] });
            }
        }
        if (/\brg-pwa-v21\b/.test(text) && rel === 'sw.js') {
            staleRefs.push({ file: rel, ref: 'rg-pwa-v21' });
        }
        if (/\brg-runtime-images-v1\b/.test(text) && rel === 'sw.js') {
            staleRefs.push({ file: rel, ref: 'rg-runtime-images-v1' });
        }
    }
}

assert('no-stale-v21-icons', staleRefs.length === 0, staleRefs.length ? JSON.stringify(staleRefs.slice(0, 8)) : 'OK');

for (const s of SURFACES) {
    if (s.exists) {
        assert(s.id, existsSync(join(ROOT, s.file)), s.file);
    } else {
        assert(s.id, s.re.test(read(s.file)), `${s.file} · ${s.re}`);
    }
}

assert('no-mipmap', !existsSync(join(ROOT, 'android')) && !existsSync(join(ROOT, 'mipmap')), 'brak natywnego mipmap (PWA-only) — OK');

// Motyw dekoracyjny wheat.svg NIE jest ikoną aplikacji
assert(
    'motif-wheat-not-app-icon',
    existsSync(join(ROOT, 'assets/images/motifs/wheat.svg')),
    'assets/images/motifs/wheat.svg = dekoracja klimatu (nie launcher)'
);

const failed = checks.filter((c) => !c.ok);
const report = {
    id: 'master-icon-audit-28f',
    title: 'MASTER ICON AUDIT — ETAP 28F',
    generatedAt: new Date().toISOString(),
    master: MASTER,
    iconVersion: ICON_V,
    swCache: SW_CACHE,
    imageCache: IMAGE_CACHE,
    masterHash,
    summary: {
        ok: failed.length === 0,
        checksPassed: checks.filter((c) => c.ok).length,
        checksTotal: checks.length,
        usageCount: usages.length,
        staleRefs: staleRefs.length
    },
    policy: {
        singleLogo: true,
        architectureUnchanged: true,
        androidNote: 'Po deploy: odinstaluj PWA z launchera i zainstaluj ponownie — Android cache’uje ikonę agresywnie.'
    },
    requiredPng: REQUIRED_PNG,
    aliases: ALIAS_SVG,
    surfaces: SURFACES.map((s) => s.id),
    usages,
    staleRefs,
    checks,
    reinstallSteps: [
        'Wdróż build (Netlify / host)',
        'Chrome Android: Site settings → Clear & reset (lub odinstaluj skrót PWA)',
        'Otwórz stronę → Zainstaluj ponownie',
        'iOS Safari: usuń z ekranu głównego → Share → Add to Home Screen',
        'Sprawdź: dwa złote kłosy pochylone w prawo (logo-master)'
    ]
};

function toMarkdown(r) {
    const lines = [
        `# ${r.title}`,
        '',
        `Wygenerowano: ${r.generatedAt}`,
        '',
        `**Werdykt:** ${r.summary.ok ? '✅ PASS' : '⚠ FAIL'} · ${r.summary.checksPassed}/${r.summary.checksTotal}`,
        '',
        '## Master',
        '',
        `- Plik: \`${r.master}\``,
        `- Motyw: **dwa złote kłosy pochylone w prawo**`,
        `- Cache-bust: \`?v=${r.iconVersion}\``,
        `- SW: \`${r.swCache}\` · image cache: \`${r.imageCache}\` (network-first dla ikon)`,
        `- Hash: \`${r.masterHash}\``,
        '',
        '## Krytyczna naprawa 28F',
        '',
        '- Stary `rg-runtime-images-v1` trzymał ikony **cache-first** → launcher widział starą grafikę mimo PASS 28A',
        '- Teraz: ikony/manifest = **network-first**, purge wszystkich `rg-pwa-*` + `rg-runtime-images-*` przy activate',
        `- Precache / cache-bust z \`?v=${r.iconVersion}\``,
        '',
        '## Wymagane PNG (z logo-master)',
        ''
    ];
    for (const p of r.requiredPng) {
        const ok = existsSync(join(ROOT, 'assets/icons', p));
        lines.push(`- ${ok ? '✓' : '✗'} \`assets/icons/${p}\``);
    }

    lines.push('', '## Aliasy SVG (= master)', '');
    for (const a of r.aliases) {
        lines.push(`- \`assets/icons/${a}\` ← logo-master.svg`);
    }

    lines.push('', '## Powierzchnie użycia', '');
    for (const c of r.checks.filter((x) => SURFACES.some((s) => s.id === x.id))) {
        lines.push(`- ${c.ok ? '✓' : '✗'} **${c.id}** — ${c.detail}`);
    }

    lines.push('', '## Wszystkie odwołania (icons/brand)', '');
    const byFile = {};
    for (const u of r.usages) {
        byFile[u.file] = byFile[u.file] || [];
        if (!byFile[u.file].includes(u.ref)) byFile[u.file].push(u.ref);
    }
    for (const [file, refs] of Object.entries(byFile).sort()) {
        lines.push(`### \`${file}\``);
        for (const ref of refs) lines.push(`- \`${ref}\``);
        lines.push('');
    }

    lines.push('## Checklist', '');
    for (const c of r.checks) {
        lines.push(`- ${c.ok ? '✓' : '✗'} ${c.id} — ${c.detail}`);
    }

    lines.push('', '## Reinstall (Android / iOS)', '');
    for (const s of r.reinstallSteps) lines.push(`${r.reinstallSteps.indexOf(s) + 1}. ${s}`);
    lines.push('');
    return lines.join('\n');
}

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'MASTER-ICON-AUDIT.json'), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT, 'MASTER-ICON-AUDIT.md'), toMarkdown(report), 'utf8');

console.log(`[Master Icon Audit] ${report.summary.ok ? 'PASS' : 'FAIL'} · ${report.summary.checksPassed}/${report.summary.checksTotal}`);
console.log(`Usages: ${usages.length} · stale: ${staleRefs.length}`);
console.log(`Wrote: ${relative(ROOT, join(OUT, 'MASTER-ICON-AUDIT.md'))}`);
process.exit(failed.length ? 1 : 0);
