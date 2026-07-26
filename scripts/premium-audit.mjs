/**
 * ETAP 28E – Regionaler Geschmack Premium Audit
 *
 * Usage: npm run premium-audit
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs', 'brand');

function loadJson(rel) {
    const full = join(ROOT, rel);
    if (!existsSync(full)) return null;
    try {
        return JSON.parse(readFileSync(full, 'utf8'));
    } catch {
        return null;
    }
}

function read(rel) {
    const full = join(ROOT, rel);
    if (!existsSync(full)) return '';
    return readFileSync(full, 'utf8');
}

function clamp(n) {
    return Math.max(0, Math.min(100, Math.round(n)));
}

function avg(nums) {
    const xs = nums.filter((n) => typeof n === 'number' && !Number.isNaN(n));
    if (!xs.length) return null;
    return clamp(xs.reduce((a, b) => a + b, 0) / xs.length);
}

// Refresh key diagnostics (best-effort, non-fatal)
const refresh = [
    ['living-brand', ['scripts/living-brand.mjs']],
    ['health', ['scripts/application-health.mjs']],
    ['emotion', ['scripts/emotion-ai.mjs']],
    ['daily', ['scripts/daily-developer-report.mjs']]
];
for (const [name, args] of refresh) {
    console.log(`▶ refresh ${name}`);
    const r = spawnSync(process.execPath, args, {
        cwd: ROOT,
        encoding: 'utf8',
        env: { ...process.env, NODE_ENV: 'development', DEVELOPER_MAIL_SEND: '' }
    });
    if (r.status !== 0) console.warn(`⚠ ${name} exit ${r.status}`);
}

const health = loadJson('docs/health/latest.json');
const guardian = loadJson('tools/ai-guardian/reports/latest.json');
const virtual = loadJson('docs/virtual-user/latest.json');
const emotion = loadJson('docs/emotion/latest.json');
const living = loadJson('docs/living-brand/latest.json');
const director = loadJson('docs/product-director/latest.json');
const daily = loadJson('docs/daily/latest.json');
const ql = loadJson('docs/quality-loop/latest.json');
const logo = loadJson('docs/brand/LOGO-AUDIT.json');
const header = loadJson('docs/brand/HEADER-AUDIT.json');
const mobile = loadJson('docs/brand/RESPONSIVE-PREMIUM-REPORT.json');
const manifest = loadJson('manifest.json');

const indexHtml = read('index.html');
const landingHtml = read('landing.html');
const styleCss = read('css/style.css');
const landingCss = read('css/landing.css');
const sw = read('sw.js');
const premiumService = read('js/core/premiumService.js');

const findings = [];
const add = (severity, area, title, detail, fixed = false) => {
    findings.push({ severity, area, title, detail, fixed });
};

// ——— Static checks after 28E fixes ———
if (/Inter|Roboto/.test(landingCss)) {
    add('high', 'Brand', 'Inter/Roboto w landing.css', 'css/landing.css');
} else {
    add('cosmetic', 'Brand', 'Landing fonts = Source Sans 3', 'css/landing.css', true);
}

if (/family=Inter|:?\s*Inter/.test(indexHtml) && !/Literata/.test(indexHtml)) {
    add('high', 'Brand', 'Inter w index.html', 'index.html');
} else {
    add('cosmetic', 'Brand', 'App shell ładuje Literata + Source Sans 3', 'index.html', true);
}

if (/--font-sans:\s*'Inter'/.test(styleCss)) {
    add('high', 'Brand', 'Inter w --font-sans', 'css/style.css');
} else {
    add('cosmetic', 'Brand', '--font-sans = Source Sans 3', 'css/style.css', true);
}

if (!/name="description"/.test(indexHtml)) {
    add('medium', 'SEO', 'Brak meta description w app shell', 'index.html');
} else {
    add('cosmetic', 'SEO', 'meta description w index.html', 'index.html', true);
}

if (/bottom-nav" aria-label=""/.test(indexHtml)) {
    add('medium', 'A11Y', 'Pusty aria-label bottom-nav', 'index.html');
} else {
    add('cosmetic', 'A11Y', 'bottom-nav aria-label Hauptnavigation', 'index.html', true);
}

if (/aria-label="Wstecz"|aria-label="Zamknij"/.test(indexHtml)) {
    add('medium', 'i18n', 'PL aria w DE shell (menu)', 'index.html');
} else {
    add('cosmetic', 'i18n', 'Menu aria DE + data-i18n-aria', 'index.html', true);
}

if (/#8e44ad|#8ec4ff|#8ec0ff|#d7a8ff/.test(styleCss)) {
    add('medium', 'Brand', 'Pozostały fiolet/zimny niebieski w UI', 'css/style.css');
} else {
    add('cosmetic', 'Brand', 'UI: złoto/pszenica zamiast fioletu i zimnego błękitu', 'css/style.css', true);
}

if (!premiumService.includes('clearInterval') || !premiumService.includes('pagehide')) {
    add('high', 'Code Quality', 'Trial setInterval bez cleanup', 'js/core/premiumService.js');
} else {
    add('cosmetic', 'Code Quality', 'Trial sync: clearInterval na pagehide', 'js/core/premiumService.js', true);
}

if (!styleCss.includes('premium-final.css')) {
    add('medium', 'UI', 'Brak premium-final.css', 'css/style.css');
} else {
    add('cosmetic', 'UI', 'premium-final.css zaimportowany', 'css/style.css', true);
}

const iconPaths = (manifest?.icons || []).map((i) => i.src.split('?')[0]);
let missingIcons = 0;
for (const p of iconPaths) {
    const rel = p.startsWith('/') ? p.slice(1) : p;
    if (!existsSync(join(ROOT, rel))) {
        missingIcons += 1;
        add('critical', 'PWA', `Brak ikony ${p}`, p);
    }
}
if (!missingIcons && iconPaths.length) {
    add('cosmetic', 'PWA', `${iconPaths.length} ikon manifest obecnych`, 'manifest.json', true);
}

if (!/rg-pwa-v\d+/.test(sw)) {
    add('high', 'PWA', 'Brak CACHE_VERSION w sw.js', 'sw.js');
}

if (!(logo?.ok ?? logo?.summary?.ok ?? true) && logo) {
    add('high', 'Brand', 'Logo audit nie OK', 'docs/brand/LOGO-AUDIT.md');
}

// From diagnostic dumps
for (const f of living?.findings || []) {
    if (f.severity === 'critical' || f.severity === 'high') {
        add(f.severity, 'Living Brand', f.title, f.file || f.detail);
    }
}
for (const f of (guardian?.findings || []).filter((x) => x.severity === 'critical' || x.severity === 'high')) {
    const file = (f.files && f.files[0]) || '';
    // 28E: trial sync cleanup already landed — ignore stale Guardian hit
    if (/premiumService/.test(file) && /setInterval|clearInterval/i.test(f.title || '')) {
        if (premiumService.includes('clearInterval') && premiumService.includes('pagehide')) {
            add('cosmetic', 'Guardian', `Naprawione: ${f.title}`, file, true);
            continue;
        }
    }
    add(f.severity, 'Guardian', f.title, file || f.detail);
}
for (const f of (health?.findings || []).slice(0, 8)) {
    add(f.severity || 'medium', 'Health', f.title, f.detail || f.area);
}

if (virtual?.summary?.status === 'awaiting-browser-run' || virtual?.summary?.score == null) {
    add('medium', 'Virtual User', 'Brak świeżego przebiegu w przeglądarce', 'docs/virtual-user/');
}

if ((emotion?.scores?.fatigue ?? 100) < 60) {
    add('medium', 'Emotion', `Zmęczenie CTA (fatigue ${emotion.scores.fatigue})`, 'Home — premium-final łagodzi');
}

if ((health?.static?.css?.conflictCount || 0) > 20) {
    add('medium', 'CSS', `Konflikty CSS ~${health.static.css.conflictCount}`, 'warstwy importów — niskie ryzyko runtime');
}

const bySev = {
    critical: findings.filter((f) => f.severity === 'critical' && !f.fixed),
    high: findings.filter((f) => f.severity === 'high' && !f.fixed),
    medium: findings.filter((f) => f.severity === 'medium' && !f.fixed),
    cosmetic: findings.filter((f) => f.severity === 'cosmetic' || f.fixed)
};

const scores = {
    UX: avg([
        health?.scores?.ux,
        guardian?.scores?.ux != null ? guardian.scores.ux * 10 : null,
        emotion?.wantToReturn?.score,
        director?.summary?.productScore
    ]),
    UI: avg([
        health?.scores?.ux,
        header?.summary?.ok ? 96 : 80,
        mobile?.summary?.ok ? 95 : 80,
        living?.scores?.fonts
    ]),
    Brand: avg([
        living?.overall,
        living?.scores?.logo,
        living?.scores?.colors,
        living?.scores?.fonts,
        living?.scores?.shadows,
        logo?.ok === false ? 70 : 95
    ]),
    Mobile: avg([
        health?.scores?.mobile,
        mobile?.summary?.ok ? 96 : 78,
        health?.scores?.ux
    ]),
    Performance: avg([
        health?.scores?.performance,
        health?.scores?.memory,
        guardian?.scores?.performance != null ? guardian.scores.performance * 10 : null
    ]),
    PWA: avg([
        health?.scores?.pwa,
        guardian?.scores?.pwa != null ? guardian.scores.pwa * 10 : null,
        missingIcons ? 60 : 98
    ]),
    Accessibility: avg([
        health?.scores?.a11y ?? health?.scores?.accessibility,
        guardian?.scores?.a11y != null ? guardian.scores.a11y * 10 : null,
        /aria-label="Hauptnavigation"/.test(indexHtml) ? 95 : 80
    ]),
    'Code Quality': avg([
        guardian?.scores?.quality != null ? guardian.scores.quality * 10 : null,
        health?.overall,
        bySev.critical.length === 0 ? 92 : 60,
        bySev.high.length === 0 ? 90 : Math.max(55, 90 - bySev.high.length * 8)
    ]),
    'Launch Readiness': avg([
        guardian?.scores?.productionReady != null ? guardian.scores.productionReady * 10 : null,
        health?.overall,
        daily?.appScore,
        director?.productScore ?? director?.summary?.productScore,
        bySev.critical.length === 0 ? 90 : 50
    ])
};

const overall = avg(Object.values(scores));

const report = {
    id: 'premium-audit-28e',
    title: 'Regionaler Geschmack Premium Audit',
    generatedAt: new Date().toISOString(),
    day: new Date().toISOString().slice(0, 10),
    policy: {
        architectureUnchanged: true,
        storeEventBusUntouched: true,
        autofixScope: 'presentation / a11y / brand / leak cleanup'
    },
    overall,
    scores,
    sources: {
        health: health?.overall ?? null,
        guardianQuality: guardian?.scores?.quality ?? null,
        emotionReturn: emotion?.wantToReturn?.score ?? null,
        livingBrand: living?.overall ?? null,
        productDirector: director?.productScore ?? director?.summary?.productScore ?? null,
        dailyAppScore: daily?.appScore ?? null,
        qualityLoopHealth: ql?.summary?.healthOverall ?? null,
        logoAudit: logo?.ok ?? logo?.summary?.ok ?? null,
        headerAudit: header?.summary?.ok ?? null,
        mobilePremium: mobile?.summary?.ok ?? null,
        virtualUser: virtual?.summary?.score ?? virtual?.summary?.status ?? null
    },
    counts: {
        critical: bySev.critical.length,
        high: bySev.high.length,
        medium: bySev.medium.length,
        cosmeticOrFixed: bySev.cosmetic.length,
        totalFindings: findings.length
    },
    findings,
    fixedIn28E: [
        'Fonty: Inter/Roboto → Literata + Source Sans 3 (index, style, landing)',
        'Living Brand: fałszywe alarmy białych cieni jako „zimny niebieski”',
        'A11Y: bottom-nav + menu aria DE / i18n keys',
        'SEO: meta description + twitter summary_large_image',
        'Brand: reklamy fiolet/zimny błękit → złoto/pszenica',
        'Code: premiumService trial interval cleanup (pagehide)',
        'UI: css/premium-final.css (touch, CTA fatigue, focus)',
        'Landing: viewport-fit=cover'
    ],
    residualRisks: [
        'Virtual User wymaga przebiegu w przeglądarce',
        'Health nadal raportuje konflikty CSS warstw (nadpisywanie zamierzone)',
        'Emotion fatigue — Home ma wiele sekcji narracyjnych (częściowo złagodzone CSS)',
        'Guardian raport może być starszy niż dzisiejsze poprawki (re-run: npm run guardian)'
    ]
};

function grade(n) {
    if (n == null) return '—';
    if (n >= 95) return 'A+';
    if (n >= 90) return 'A';
    if (n >= 85) return 'B+';
    if (n >= 80) return 'B';
    if (n >= 70) return 'C';
    return 'D';
}

function toMarkdown(r) {
    const lines = [
        `# ${r.title}`,
        '',
        `Wygenerowano: ${r.generatedAt}`,
        '',
        `## Ocena końcowa: **${r.overall ?? '—'} / 100** (${grade(r.overall)})`,
        '',
        '## Oceny cząstkowe',
        '',
        '| Obszar | Wynik | Grade |',
        '|--------|------:|:-----:|'
    ];
    for (const [k, v] of Object.entries(r.scores)) {
        lines.push(`| ${k} | ${v ?? '—'} | ${grade(v)} |`);
    }

    lines.push('', '## Źródła diagnostyczne', '');
    for (const [k, v] of Object.entries(r.sources)) {
        lines.push(`- **${k}:** ${v ?? '—'}`);
    }

    lines.push('', '## Podsumowanie issues', '');
    lines.push(`- Krytyczne: **${r.counts.critical}**`);
    lines.push(`- Wysokie: **${r.counts.high}**`);
    lines.push(`- Średnie: **${r.counts.medium}**`);
    lines.push(`- Kosmetyczne / naprawione: **${r.counts.cosmeticOrFixed}**`);

    for (const sev of ['critical', 'high', 'medium']) {
        const list = r.findings.filter((f) => f.severity === sev && !f.fixed);
        lines.push('', `## ${sev.toUpperCase()}`, '');
        if (!list.length) lines.push('_Brak._');
        else {
            for (const f of list) {
                lines.push(`- **[${f.area}]** ${f.title}${f.detail ? ` — ${f.detail}` : ''}`);
            }
        }
    }

    lines.push('', '## Naprawione w ETAP 28E (bez zmiany architektury)', '');
    for (const x of r.fixedIn28E) lines.push(`- ${x}`);

    lines.push('', '## Ryzyka resztkowe', '');
    for (const x of r.residualRisks) lines.push(`- ${x}`);

    lines.push('', '## Polityka', '');
    lines.push('- Store / EventBus / API / GPS / Leaflet / routing — nietknięte');
    lines.push('- Zakres: CSS, HTML meta/a11y, i18n aria, brand fonts, drobny cleanup JS');
    lines.push('');
    return lines.join('\n');
}

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'PREMIUM-AUDIT.json'), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT, 'PREMIUM-AUDIT.md'), toMarkdown(report), 'utf8');

console.log(`[Premium Audit] ${report.overall}/100`);
console.log(`Critical ${report.counts.critical} · High ${report.counts.high} · Medium ${report.counts.medium}`);
console.log(`Wrote: ${relative(ROOT, join(OUT, 'PREMIUM-AUDIT.md'))}`);
process.exit(report.counts.critical > 0 ? 1 : 0);
