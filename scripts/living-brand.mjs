/**
 * ETAP 26 – Living Brand (CLI)
 * Codzienny strażnik Brand Book. Tylko raport — autoFix: false.
 *
 * Usage:
 *   npm run living-brand
 *   npm run living-brand -- --import=lb-dump.json
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
    BRAND_PALETTE,
    FORBIDDEN_COLD_BLUE,
    LOGO,
    FONTS,
    SHADOW_FAMILIES,
    FORBIDDEN_SHADOW,
    isColdBlueShadowValue,
    PHOTO_CLIMATE,
    POLICY,
    normalizeHex,
    isForbiddenBlue
} from '../js/diagnostics/livingBrandBook.js';
import { buildLivingBrandReport } from '../js/diagnostics/livingBrandCore.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'docs', 'living-brand');

const CSS_GLOBS = ['css'];
const SCAN_EXTS = new Set(['.css', '.html', '.js', '.mjs', '.json', '.svg', '.md']);
const SKIP_DIRS = new Set([
    'node_modules',
    '.git',
    'docs',
    'legacy',
    'js/legacy'
]);

function dayStamp() {
    return new Date().toISOString().slice(0, 10);
}

function loadImport(argv) {
    const arg = argv.find((a) => a.startsWith('--import='));
    if (!arg) return null;
    const p = arg.slice('--import='.length);
    const full = p.startsWith('/') || /^[A-Za-z]:/.test(p) ? p : join(ROOT, p);
    if (!existsSync(full)) return null;
    return JSON.parse(readFileSync(full, 'utf8'));
}

function readSafe(rel) {
    const full = join(ROOT, rel);
    if (!existsSync(full)) return '';
    return readFileSync(full, 'utf8');
}

function walkFiles(dir, out = []) {
    const full = join(ROOT, dir);
    if (!existsSync(full)) return out;
    for (const name of readdirSync(full, { withFileTypes: true })) {
        const rel = join(dir, name.name).replace(/\\/g, '/');
        if (name.isDirectory()) {
            if (SKIP_DIRS.has(name.name) || SKIP_DIRS.has(rel)) continue;
            walkFiles(rel, out);
        } else if (SCAN_EXTS.has(extname(name.name).toLowerCase())) {
            out.push(rel);
        }
    }
    return out;
}

function extractHexes(text) {
    const found = [];
    const re = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
    let m;
    while ((m = re.exec(text))) {
        found.push(normalizeHex(m[0]));
    }
    return found;
}

function extractBoxShadows(css, file) {
    const hits = [];
    const re = /box-shadow\s*:\s*([^;}+{]+)/gi;
    let m;
    while ((m = re.exec(css))) {
        const value = m[1].replace(/\s+/g, ' ').trim();
        if (!value || value === 'inherit' || value === 'initial') continue;
        hits.push({ file, value });
    }
    return hits;
}

function extractFontFamilies(css, file) {
    const hits = [];
    const re = /font-family\s*:\s*([^;}+{]+)/gi;
    let m;
    while ((m = re.exec(css))) {
        hits.push({ file, value: m[1].replace(/\s+/g, ' ').trim() });
    }
    return hits;
}

function auditLogo(findings) {
    const master = join(ROOT, LOGO.master);
    if (!existsSync(master)) {
        findings.push({
            check: 'logo',
            severity: 'critical',
            title: 'Brak logo-master.svg',
            detail: LOGO.master,
            file: LOGO.master
        });
        return;
    }

    const sources = [
        'index.html',
        'landing.html',
        'css/brand-identity-final.css',
        'js/views/home.js',
        'manifest.json',
        'sw.js'
    ];

    const logoRefs = [];
    const foreignLogo = [];

    for (const rel of sources) {
        const text = readSafe(rel);
        if (!text) continue;
        const urls = text.match(/(?:src|href|url\(|icon:)\s*[=:]?\s*['"]?([^'")\s]+logo[^'")\s]*)/gi)
            || [];
        const all = [
            ...(text.match(/\/assets\/icons\/[a-zA-Z0-9._-]+/g) || []),
            ...(text.match(/logo-[a-zA-Z0-9._-]+/g) || [])
        ];
        for (const u of all) {
            logoRefs.push({ file: rel, value: u });
            if (/logo/i.test(u) && !/logo-master\.svg/i.test(u) && !/icon-\d|favicon|maskable|apple-touch|splash|og-share|notifications/i.test(u)) {
                foreignLogo.push({ file: rel, value: u });
            }
        }
        // emoji as brand mark — only when used as logo slot without logo-master img
        if (
            /[🌾]/.test(text) &&
            /brand-mark|logo-slot|header-brand|side-menu-brand/i.test(text) &&
            !/logo-master\.svg/i.test(text) &&
            !rel.includes('brand-identity')
        ) {
            findings.push({
                check: 'logo',
                severity: 'low',
                title: 'Emoji zboża w slocie logo (bez logo-master)',
                detail: 'Zamień na <img src="/assets/icons/logo-master.svg">',
                file: rel
            });
        }
        void urls;
    }

    const masterHits = sources.filter((rel) => /logo-master\.svg/i.test(readSafe(rel)));
    if (masterHits.length < 3) {
        findings.push({
            check: 'logo',
            severity: 'high',
            title: 'logo-master.svg zbyt rzadko referencjonowane',
            detail: `Trafiliśmy w ${masterHits.length} plikach kluczowych — oczekiwano ≥3`,
            file: LOGO.master
        });
    }

    for (const f of foreignLogo.slice(0, 8)) {
        findings.push({
            check: 'logo',
            severity: 'medium',
            title: 'Podejrzenie obcego pliku logo',
            detail: f.value,
            file: f.file,
            value: f.value
        });
    }

    // header + home muszą wskazywać master
    const index = readSafe('index.html');
    if (index && !/logo-master\.svg/.test(index)) {
        findings.push({
            check: 'logo',
            severity: 'critical',
            title: 'index.html bez logo-master.svg',
            file: 'index.html'
        });
    }
    const home = readSafe('js/views/home.js');
    if (home && !/logo-master\.svg/.test(home)) {
        findings.push({
            check: 'logo',
            severity: 'high',
            title: 'home.js bez logo-master.svg (header/footer brand)',
            file: 'js/views/home.js'
        });
    }
    if (!/--brand-logo:\s*url\([^)]*logo-master\.svg/.test(readSafe('css/brand-identity-final.css'))) {
        findings.push({
            check: 'logo',
            severity: 'high',
            title: '--brand-logo nie wskazuje logo-master.svg',
            file: 'css/brand-identity-final.css'
        });
    }
}

function auditColors(findings) {
    const brandCss = readSafe('css/brand-identity-final.css');
    for (const [name, hex] of Object.entries(BRAND_PALETTE)) {
        if (['themeColor', 'backgroundColor', 'headerDeep', 'btnLocation', 'warmTerracotta', 'warmMeat', 'warmRestaurant', 'warmFast', 'textMuted', 'textLight'].includes(name)) {
            continue;
        }
        if (!brandCss.toLowerCase().includes(hex.toLowerCase())) {
            findings.push({
                check: 'colors',
                severity: 'medium',
                title: `Token palety ${name} (${hex}) nieobecny w brand-identity-final.css`,
                file: 'css/brand-identity-final.css',
                value: hex
            });
        }
    }

    const manifest = readSafe('manifest.json');
    if (manifest) {
        try {
            const m = JSON.parse(manifest);
            if (normalizeHex(m.theme_color) !== normalizeHex(BRAND_PALETTE.themeColor)) {
                findings.push({
                    check: 'colors',
                    severity: 'high',
                    title: `manifest theme_color ≠ ${BRAND_PALETTE.themeColor}`,
                    detail: String(m.theme_color),
                    file: 'manifest.json',
                    value: m.theme_color
                });
            }
            if (normalizeHex(m.background_color) !== normalizeHex(BRAND_PALETTE.backgroundColor)) {
                findings.push({
                    check: 'colors',
                    severity: 'medium',
                    title: `manifest background_color ≠ ${BRAND_PALETTE.backgroundColor}`,
                    detail: String(m.background_color),
                    file: 'manifest.json'
                });
            }
        } catch {
            /* ignore */
        }
    }
}

function auditColdBlue(findings) {
    const files = [
        ...walkFiles('css'),
        'index.html',
        'landing.html',
        'manifest.json'
    ];
    for (const rel of files) {
        const text = readSafe(rel);
        if (!text) continue;
        // pomiń komentarze „bez niebieskiego” i dokumentację w css
        const hexes = extractHexes(text);
        for (const h of hexes) {
            if (isForbiddenBlue(h)) {
                findings.push({
                    check: 'coldBlue',
                    severity: 'critical',
                    title: `Zimny niebieski ${h}`,
                    detail: 'Zakazany przez Brand Book',
                    file: rel,
                    value: h
                });
            }
        }
        // rgb blue-ish in brand layers
        if (/rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(2[0-9]{2}|1[5-9]\d)\s*\)/i.test(text)
            && /primary|accent|btn|header|nav|brand/i.test(text)
            && rel.startsWith('css/')) {
            // only flag if also looks cold (high blue channel) — soft
            const rgbBlue = [...text.matchAll(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/gi)];
            for (const m of rgbBlue.slice(0, 20)) {
                const r = +m[1];
                const g = +m[2];
                const b = +m[3];
                if (b > 180 && b > r + 40 && b > g + 40) {
                    findings.push({
                        check: 'coldBlue',
                        severity: 'high',
                        title: `RGB zimnego niebieskiego rgb(${r},${g},${b})`,
                        file: rel,
                        value: m[0]
                    });
                }
            }
        }
    }
    void FORBIDDEN_COLD_BLUE;
}

function auditIcons(findings) {
    for (const rel of LOGO.derivedIcons) {
        if (!existsSync(join(ROOT, rel))) {
            findings.push({
                check: 'icons',
                severity: 'high',
                title: `Brak ikony systemowej: ${rel}`,
                file: rel
            });
        }
    }
    const index = readSafe('index.html');
    const need = ['favicon.ico', 'logo-master.svg', 'icon-192.png'];
    for (const n of need) {
        if (!index.includes(n)) {
            findings.push({
                check: 'icons',
                severity: 'medium',
                title: `index.html nie linkuje ${n}`,
                file: 'index.html'
            });
        }
    }
    const manifest = readSafe('manifest.json');
    if (manifest && !/icon-192\.png/.test(manifest)) {
        findings.push({
            check: 'icons',
            severity: 'high',
            title: 'manifest bez icon-192.png',
            file: 'manifest.json'
        });
    }
    // różne wersje cache-bust między header a favicon — ostrzeżenie
    const versions = [...index.matchAll(/logo-master\.svg\?v=(\d+)/g)].map((m) => m[1]);
    const uniq = [...new Set(versions)];
    if (uniq.length > 1) {
        findings.push({
            check: 'icons',
            severity: 'low',
            title: 'Różne ?v= dla logo-master w index.html',
            detail: uniq.join(', '),
            file: 'index.html'
        });
    }
}

function auditFonts(findings) {
    const cssFiles = walkFiles('css');
    for (const rel of cssFiles) {
        const text = readSafe(rel);
        for (const { value } of extractFontFamilies(text, rel)) {
            const lower = value.toLowerCase();
            for (const foreign of FONTS.foreignHard) {
                if (lower.includes(foreign)) {
                    findings.push({
                        check: 'fonts',
                        severity: 'high',
                        title: `Obcy font: ${foreign}`,
                        detail: value.slice(0, 120),
                        file: rel,
                        value
                    });
                }
            }
        }
    }
    const brand = readSafe('css/brand-identity-final.css');
    if (!brand.includes(FONTS.display) || !brand.includes(FONTS.sans)) {
        findings.push({
            check: 'fonts',
            severity: 'critical',
            title: 'Brand Book fonts nie ustawione w brand-identity-final.css',
            detail: `${FONTS.display} + ${FONTS.sans}`,
            file: 'css/brand-identity-final.css'
        });
    }
}

function auditShadows(findings) {
    const cssFiles = walkFiles('css');
    const all = [];
    for (const rel of cssFiles) {
        all.push(...extractBoxShadows(readSafe(rel), rel));
    }

    for (const s of all) {
        let badHit = isColdBlueShadowValue(s.value);
        if (!badHit) {
            for (const bad of FORBIDDEN_SHADOW) {
                if (bad.test(s.value)) {
                    badHit = true;
                    break;
                }
            }
        }
        if (badHit) {
            findings.push({
                check: 'shadows',
                severity: 'high',
                title: 'Cień spoza klimatu marki (glow / zimny)',
                detail: s.value.slice(0, 140),
                file: s.file,
                value: s.value
            });
        }
    }

    // unikalne cienie — zbyt wiele „rodzin” = niespójność
    const normalized = all.map((s) => s.value.replace(/\s+/g, ' ').slice(0, 80));
    const unique = [...new Set(normalized)];
    const known = unique.filter((v) => SHADOW_FAMILIES.some((f) => f.re.test(v)) || v === 'none');
    const unknown = unique.filter((v) => !SHADOW_FAMILIES.some((f) => f.re.test(v)) && v !== 'none');

    if (unique.length > 45) {
        findings.push({
            check: 'shadows',
            severity: 'medium',
            title: `Duża różnorodność cieni (${unique.length} unikalnych)`,
            detail: 'Brand Book preferuje spójną rodzinę miękkich cieni + złoty akcent headera',
            file: 'css/'
        });
    }

    // próbkuj nieznane — nie flooduj
    for (const v of unknown.slice(0, 6)) {
        const sample = all.find((s) => s.value.replace(/\s+/g, ' ').startsWith(v.slice(0, 40)));
        findings.push({
            check: 'shadows',
            severity: 'low',
            title: 'Cień poza kanonicznymi rodzinami',
            detail: v,
            file: sample?.file || 'css/',
            value: v
        });
    }

    void known;
}

function auditPhotos(findings) {
    const assetsDir = join(ROOT, 'assets');
    if (!existsSync(assetsDir)) return;

    const images = [];
    const walk = (d, base = 'assets') => {
        for (const name of readdirSync(d, { withFileTypes: true })) {
            const rel = `${base}/${name.name}`;
            if (name.isDirectory()) {
                if (name.name === 'icons' || name.name === 'brand' || name.name === 'store') continue;
                walk(join(d, name.name), rel);
            } else if (/\.(jpe?g|png|webp|avif)$/i.test(name.name)) {
                images.push(rel.toLowerCase());
            }
        }
    };
    walk(assetsDir);

    let cold = 0;
    let warm = 0;
    for (const p of images) {
        if (PHOTO_CLIMATE.coldPathHints.some((h) => p.includes(h))) cold += 1;
        if (PHOTO_CLIMATE.warmPathHints.some((h) => p.includes(h))) warm += 1;
    }

    if (cold > 0) {
        findings.push({
            check: 'photos',
            severity: 'medium',
            title: `Fotografie o chłodnym / obcym klimacie w nazwach (${cold})`,
            detail: 'Ścieżki sugerują neon/tech/office — nie pasują do regionalnego smaku',
            file: 'assets/'
        });
    }

    if (images.length > 5 && warm === 0) {
        findings.push({
            check: 'photos',
            severity: 'low',
            title: 'Mało sygnałów „ciepłego” klimatu w nazwach plików zdjęć',
            detail: `Przeskanowano ${images.length} obrazów poza icons/brand/store`,
            file: 'assets/'
        });
    }

    // placeholdery w views
    const home = readSafe('js/views/home.js') + readSafe('js/views/producerModal.js');
    if (/placeholder\.com|via\.placeholder|picsum\.photos/i.test(home)) {
        findings.push({
            check: 'photos',
            severity: 'high',
            title: 'Zewnętrzny placeholder zdjęć w UI',
            file: 'js/views/'
        });
    }
}

function runAudit() {
    /** @type {import('../js/diagnostics/livingBrandCore.js').BrandFinding[]} */
    const findings = [];
    auditLogo(findings);
    auditColors(findings);
    auditIcons(findings);
    auditPhotos(findings);
    auditColdBlue(findings);
    auditFonts(findings);
    auditShadows(findings);

    // dedupe title+file+value
    const seen = new Set();
    const unique = [];
    for (const f of findings) {
        const key = `${f.check}|${f.title}|${f.file}|${f.value || ''}`;
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push(f);
    }

    return buildLivingBrandReport(unique, {
        day: dayStamp(),
        reason: 'cli-daily',
        generatedAt: new Date().toISOString(),
        extra: {
            scannedCss: walkFiles('css').length,
            policyNote: 'Living Brand nigdy nie patchuje — tylko raportuje'
        }
    });
}

function toMarkdown(report) {
    const lines = [
        `# ${report.title}`,
        '',
        `Dzień: **${report.day}**`,
        `Wygenerowano: ${report.generatedAt}`,
        `Status: **${report.status}** · overall **${report.overall}%**`,
        '',
        `## ${report.question}`,
        '',
        report.verdict,
        '',
        '## Scores',
        ''
    ];
    for (const c of report.checks || []) {
        lines.push(`- **${c.id}**: ${c.score}% · findings ${c.findingCount}${c.ok ? ' · OK' : ''}`);
    }

    lines.push('', '## Brand Book', '');
    lines.push(`- Logo: \`${report.brandBook.logo}\` (${report.brandBook.motif})`);
    lines.push(`- Paleta: ${report.brandBook.palette}`);
    lines.push(`- Fonty: ${report.brandBook.fonts}`);
    lines.push(`- Zakaz: ${report.brandBook.ban}`);

    lines.push('', '## Odstępstwa', '');
    const findings = report.findings || [];
    if (!findings.length) {
        lines.push('_Brak odstępstw — marka trzyma linię._');
    } else {
        for (const f of findings) {
            lines.push(`### ${f.id} [${f.severity}] ${f.check} — ${f.title}`);
            lines.push('');
            if (f.file) lines.push(`- plik: \`${f.file}\``);
            if (f.detail) lines.push(`- ${f.detail}`);
            if (f.value) lines.push(`- wartość: \`${String(f.value).slice(0, 100)}\``);
            lines.push(`- autoApply: false`);
            lines.push('');
        }
    }

    lines.push('## Polityka', '', '- autoFix: false', '- codzienny raport', '- Ty zatwierdzasz poprawki', '');
    lines.push('## Uruchomienie', '', '```bash', 'npm run living-brand', '```', '');
    lines.push('Przeglądarka: `__RG_LIVING_BRAND__.run()`', '');
    return lines.join('\n');
}

const imported = loadImport(process.argv.slice(2));
const report = imported?.checks && imported?.findings
    ? { ...imported, reason: imported.reason || 'cli-import' }
    : runAudit();

// attach policy reminder
report.policy = { ...POLICY, ...(report.policy || {}) };

mkdirSync(OUT_DIR, { recursive: true });
const day = report.day || dayStamp();
writeFileSync(join(OUT_DIR, 'latest.json'), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT_DIR, 'latest.md'), toMarkdown(report), 'utf8');
writeFileSync(join(OUT_DIR, `${day}.json`), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT_DIR, `${day}.md`), toMarkdown(report), 'utf8');

console.log(`[Living Brand] ${report.status} · ${report.overall}% · findings ${report.summary?.findings ?? 0}`);
console.log(report.verdict);
console.log(`Wrote: ${relative(ROOT, join(OUT_DIR, 'latest.md'))}`);
void CSS_GLOBS;
void statSync;
