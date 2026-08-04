/**
 * ETAP – Final Premium UI Polish (Header + Bottom Navigation)
 * Weryfikacja kanonicznych źródeł CSS (bez osobnej warstvy audit).
 *
 * Usage: npm run etap-45-header-nav
 *        npm run check:final-premium-ui
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs', 'brand');

const VIEWPORTS = [320, 360, 375, 390, 412, 430, 480, 600, 768];

/** Czy viewport wpada w zakres media query premium-header + home-v1 nav */
function chromeBreakpointCovered(bp, headerCss, navCss) {
    const headerRanges = [
        { min: 0, max: 359, needle: 'max-width: 359px' },
        { min: 360, max: 389, needle: 'min-width: 360px' },
        { min: 390, max: 411, needle: 'min-width: 390px' },
        { min: 412, max: 429, needle: 'min-width: 412px' },
        { min: 430, max: 479, needle: 'min-width: 430px' },
        { min: 480, max: 599, needle: 'min-width: 480px' },
        { min: 600, max: 767, needle: 'min-width: 600px' },
        { min: 768, max: Infinity, needle: 'min-width: 768px' }
    ];
    const range = headerRanges.find((r) => bp >= r.min && bp <= r.max);
    if (!range) return false;
    return headerCss.includes(range.needle) && navCss.includes(range.needle);
}

function read(rel) {
    const full = join(ROOT, rel);
    if (!existsSync(full)) return '';
    return readFileSync(full, 'utf8');
}

const brandCleanup = read('css/brand-colors-cleanup.css');
const homeV1 = read('css/home-v1.css');
const premiumHeader = read('css/premium-header.css');
const themeToggle = read('css/theme-toggle-premium.css');
const mapPremium = read('css/map-premium.css');
const releaseReady = read('css/release-ready-audit.css');
const indexHtml = read('index.html');

const checks = [];
const assert = (id, ok, detail) => checks.push({ id, ok, detail });

/* ——— Polityka: brak warstw nadpisujących ——— */
assert(
    'no-overlay-layer',
    !brandCleanup.includes('etap-45-header-nav-premium.css'),
    'brak osobnej warstwy etap-45 w brand-colors-cleanup'
);
assert(
    'release-ready-no-nav-override',
    !releaseReady.includes('.bottom-nav .nav-item'),
    'release-ready-audit nie nadpisuje bottom nav (źródło: home-v1.css)'
);

/* ——— Header — premium-header.css ——— */
assert('header-gradient', premiumHeader.includes('#243528') && premiumHeader.includes('.main-header'), 'header gradient Brand Book');
assert('header-logo-token', /--ph-logo:\s*4[89]px/.test(premiumHeader), 'większe logo (--ph-logo ≥48px)');
assert('header-title-token', premiumHeader.includes('--ph-title') && premiumHeader.includes('Literata'), 'większy tytuł Literata (DE premium)');
assert('header-spacing-system', premiumHeader.includes('--ph-gap: 12px') && premiumHeader.includes('.header-brand'), 'jednolity spacing Home Premium + grupa marki');
assert('header-menu-gap', premiumHeader.includes('--ph-gap-chrome'), 'odstęp Menu ↔ marka (token --ph-gap-chrome)');
assert('header-touch-44', premiumHeader.includes('max(var(--ph-btn), 44px)'), 'header touch ≥44px');
assert('header-hover-lift', premiumHeader.includes('translateY(-2px)'), 'header hover lift Home Premium');
assert('header-active-tap', premiumHeader.includes('scale(0.985)'), 'header active tap');
assert('header-focus-gold', premiumHeader.includes('--ph-gold') && premiumHeader.includes('focus-visible'), 'focus złoty');
assert(
    'header-lang-de',
    premiumHeader.includes('text-transform: none')
        && premiumHeader.includes('.header-lang-text')
        && premiumHeader.includes('.header-lang-wrap'),
    'język DE-first: „Deutsch”, wyśrodkowany, wrap bez nachodzenia na toggle'
);
assert(
    'header-lang-wrap-reserve',
    premiumHeader.includes('calc(100vw - 15.5rem)') && premiumHeader.includes('max-width: min'),
    'rezerwa miejsca na Premium + toggle'
);
assert(
    'header-lang-centered',
    premiumHeader.includes('justify-content: center') && premiumHeader.includes('#languageSwitcherLabel'),
    'flaga + etykieta wyśrodkowane w przycisku'
);
assert('header-axis', premiumHeader.includes('align-items: center') && premiumHeader.includes('.header-left'), 'wyrównanie do jednej osi');

/* ——— Theme toggle — theme-toggle-premium.css ——— */
assert('theme-toggle-file', Boolean(themeToggle), 'css/theme-toggle-premium.css istnieje');
assert('theme-toggle-circle', themeToggle.includes('border-radius: 50%'), 'okrągła ikona 🌞/🌙');
assert('theme-toggle-44', /min-height:\s*44px/.test(themeToggle) && /width:\s*44px/.test(themeToggle), 'hit area 44×44 px');
assert(
    'html-header-brand',
    indexHtml.includes('class="header-brand"') && indexHtml.includes('header-brand-mark'),
    'HTML: .header-brand grupuje logo + tytuł'
);
assert(
    'theme-toggle-gap-lang',
    themeToggle.includes('margin-inline-start: var(--ph-theme-gap')
        && themeToggle.includes('flex-shrink: 0'),
    'odstęp 8–12 px od języka · toggle nie kurczy się'
);
assert(
    'theme-toggle-no-overlap',
    premiumHeader.includes('--ph-theme-gap') && premiumHeader.includes('flex-shrink: 0'),
    'header-right nie ściska toggle vs język'
);
assert('theme-toggle-emoji', themeToggle.includes('display: none') && themeToggle.includes('::after'), 'emoji z DOM (bez maski SVG)');
assert(
    'theme-toggle-no-header-icon',
    /id="darkModeToggleBtn"[^>]*class="theme-toggle-premium"/.test(indexHtml)
        && !/id="darkModeToggleBtn"[^>]*header-icon/.test(indexHtml),
    'HTML: toggle bez klasy header-icon (minimalny HTML)'
);

/* ——— Bottom nav — home-v1.css ——— */
assert('nav-home-surface', homeV1.includes('#f7f3ea') && homeV1.includes('#e6efdf'), 'nav powierzchnia Home Premium');
assert('nav-icon-before', homeV1.includes('.nav-icon::before'), 'ikona w pigułce (::before)');
assert(
    'nav-active-no-green-square',
    homeV1.includes('.nav-item.active .nav-icon::before')
        && homeV1.includes('background: #fffef8 !important')
        && !/\.nav-item\.active \.nav-icon::before[\s\S]{0,220}background:\s*#2a3f28/.test(homeV1),
    'aktywna: kremowa pigułka + delikatna ramka (bez ciemnozielonego kwadratu)'
);
assert(
    'nav-no-style-double-layer',
    !/\.bottom-nav \.nav-item\.active \.nav-icon[\s\S]{0,120}background:\s*color-mix/.test(read('css/style.css')),
    'style.css nie nakłada drugiej warstwy na aktywną ikonę'
);
assert(
    'nav-inactive-no-pill',
    homeV1.includes('.nav-item:not(.active) .nav-icon::before'),
    'nieaktywne: bez pigułki (tylko aktywna zakładka)'
);
assert('nav-touch-44', homeV1.includes('--nav-touch-min: 44px') && homeV1.includes('min-width: var(--nav-touch-min'), 'nav touch 44×44 WCAG');
assert(
    'nav-touch-no-40-override',
    !/\.bottom-nav \.nav-item[\s\S]{0,100}min-height:\s*40px/.test(read('css/production-polish.css')),
    'production-polish nie obniża touch nav poniżej 44px'
);
assert('nav-label-center', homeV1.includes('text-align: center') && homeV1.includes('grid-template-rows'), 'podpisy wyśrodkowane pod ikoną (grid)');
assert('nav-label-line-height', homeV1.includes('--nav-label-lh: 1.45'), 'line-height 1.45 — bez obcinania g/j/y/p/q');
assert(
    'nav-label-no-tight-lh',
    !/\.bottom-nav \.nav-label[\s\S]{0,80}line-height:\s*1\.0[0-9]/.test(homeV1),
    'brak ciasnego line-height na etykietach nav'
);
assert('nav-label-slot', homeV1.includes('--nav-label-slot') && homeV1.includes('--nav-label-descender'), 'stała wysokość rzędu etykiet');
assert('nav-chrome-height', homeV1.includes('--nav-chrome-h'), 'stała wysokość paska nav');
assert('nav-source-sans', homeV1.includes('Source Sans 3'), 'etykiety Source Sans 3');
assert('nav-dark', homeV1.includes('body.dark-mode .bottom-nav'), 'dark mode nav');
assert('home-v1-canonical', homeV1.includes('Premium Bottom Navigation'), 'home-v1 wzorzec bottom nav');

/* ——— Breakpoints ——— */
for (const bp of VIEWPORTS) {
    assert(
        `bp-header-nav-${bp}`,
        chromeBreakpointCovered(bp, premiumHeader, homeV1),
        `viewport ${bp}px — header + bottom nav (premium-header + home-v1)`
    );
}

assert(
    'responsive-nav-section',
    homeV1.includes('Bottom Navigation — Responsive (320 · 360 · 375 · 390 · 412 · 430 · 480 · 600 · 768)'),
    'home-v1: sekcja responsive nav ze wszystkimi viewportami'
);
assert(
    'responsive-header-480-600',
    premiumHeader.includes('min-width: 480px') && premiumHeader.includes('min-width: 600px'),
    'premium-header: breakpointy 480 · 600'
);

assert('reduced-motion', homeV1.includes('prefers-reduced-motion: reduce'), 'reduced motion');

/* ——— Animacje chrome — Home Premium (fade · hover lift · active scale) ——— */
assert(
    'motion-header-hover-lift',
    premiumHeader.includes('translateY(-2px) !important') && premiumHeader.includes(':hover'),
    'header: hover lift −2px'
);
assert(
    'motion-header-active-scale',
    premiumHeader.includes('scale(0.985) !important') && premiumHeader.includes(':active'),
    'header: active scale 0.985'
);
assert(
    'motion-nav-active-scale',
    homeV1.includes('.bottom-nav .nav-item:active') && homeV1.includes('scale(0.985) !important'),
    'bottom nav: active scale'
);
assert(
    'motion-nav-no-hover-lift',
    homeV1.includes('.bottom-nav .nav-item:hover') && homeV1.includes('transform: none !important'),
    'bottom nav: bez hover lift (tylko kolor + fade pigułki)'
);
assert(
    'motion-no-bounce-pulse-float',
    !/(?:animation\s*:[^;]*(?:bounce|pulse|float|floating)|@keyframes\s+(?:bounce|pulse|float))/i.test(premiumHeader)
        && homeV1.includes('bez bounce / pulse / floating')
        && !/\.bottom-nav \.nav-item[^}]*animation\s*:[^;]*(?:bounce|pulse|float)/i.test(homeV1),
    'chrome: brak bounce · pulse · floating (tylko fade · lift · scale)'
);
assert(
    'motion-header-animation-none',
    premiumHeader.includes('animation: none !important'),
    'header przyciski: animation none (tylko transition)'
);
assert(
    'motion-nav-fade-before',
    homeV1.includes('.nav-icon::before') && homeV1.includes('opacity'),
    'nav aktywna pigułka: fade przez opacity ::before'
);

/* ——— Brand Book — bez zmian kolorów · tokenów · fontów · radius · cieni ——— */
const FORBIDDEN_FONTS = /\bInter\b|\bRoboto\b|\bPoppins\b|\bMontserrat\b|\bNunito\b/i;
const FORBIDDEN_BLUE = /#2563eb|#2980b9|#3498db|#456696/i;

assert(
    'brand-fonts-chrome',
    premiumHeader.includes('Literata') && premiumHeader.includes('Source Sans 3')
        && homeV1.includes('Source Sans 3')
        && !FORBIDDEN_FONTS.test(premiumHeader) && !FORBIDDEN_FONTS.test(homeV1.split('Premium Bottom Navigation')[1] || ''),
    'fonty chrome: Literata + Source Sans 3 · bez Inter/Roboto'
);
assert(
    'brand-colors-chrome',
    premiumHeader.includes('#2a3f28') && premiumHeader.includes('#c9a227')
        && homeV1.includes('#f7f3ea') && homeV1.includes('#e6efdf'),
    'kolory chrome zgodne z paletą Brand Book'
);
assert(
    'brand-no-cold-blue',
    !FORBIDDEN_BLUE.test(premiumHeader) && !FORBIDDEN_BLUE.test(homeV1.split('Premium Bottom Navigation')[0] + (homeV1.split('Premium Bottom Navigation')[1] || '').slice(0, 2500)),
    'brak zimnego niebieskiego w chrome'
);
assert(
    'brand-radius-shadow-tokens',
    premiumHeader.includes('--ph-btn-radius: 14px') && premiumHeader.includes('--ph-btn-shadow')
        && !premiumHeader.includes('--ph-btn-radius: 12px'),
    'radius i cienie header — istniejące tokeny --ph-* (bez nowej palety)'
);
assert(
    'brand-dark-mode-chrome',
    premiumHeader.includes('body.dark-mode .main-header') && homeV1.includes('body.dark-mode .bottom-nav'),
    'dark mode chrome — istniejące reguły (bez zmiany tokenów marki)'
);
assert(
    'brand-no-chrome-token-drift',
    !premiumHeader.includes('--brand-green:') && !homeV1.match(/\.bottom-nav[\s\S]{0,900}--brand-green:/),
    'chrome nie nadpisuje globalnych tokenów --brand-*'
);

assert('map-z-index', mapPremium.includes('body.view-map-active .bottom-nav'), 'mapa: warstwy chrome (map-premium.css)');

const failed = checks.filter((c) => !c.ok);
const report = {
    id: 'final-premium-ui-polish-header-nav',
    etap: 45,
    title: 'ETAP – Final Premium UI Polish (Header + Bottom Navigation)',
    generatedAt: new Date().toISOString(),
    policy: {
        cssOnly: true,
        htmlMinimal: true,
        market: 'DE primary — spokojny, elegancki, uporządkowany UI premium',
        translations: 'poboczne (ułatwienie dla turystów)',
        visualReference: 'Home Premium',
        unchanged: [
            'logika aplikacji',
            'EventBus',
            'Store',
            'GPS',
            'Leaflet',
            'popupów',
            'mapy',
            'routing',
            'danych',
            'tłumaczeń',
            'architektury',
            'Brand Book'
        ],
        canonicalSources: [
            'css/premium-header.css',
            'css/theme-toggle-premium.css',
            'css/home-v1.css',
            'css/map-premium.css'
        ]
    },
    summary: {
        checksPassed: checks.filter((c) => c.ok).length,
        checksTotal: checks.length,
        ok: failed.length === 0
    },
    scope: [
        'Header Premium (logo, tytuł, odstępy, oś, przyciski 44px)',
        'Przełącznik dzień/noc (okrągła ikona, odstęp od języka)',
        'Bottom Navigation (biała aktywna pigułka, bez zielonego kwadratu)',
        'Podpisy nav (wyśrodkowanie, line-height, bez obcinania liter)',
        'Dark Mode · Responsive 320–768 (375 · 480 · 600)',
        'Animacje: fade · hover lift · active scale (bez bounce/pulse/floating)',
        'Brand Book: kolory · tokeny · fonty · radius · cieni · dark mode — bez zmian'
    ],
    checks
};

function toMarkdown(r) {
    return [
        `# ${r.title}`,
        '',
        `Wygenerowano: ${r.generatedAt}`,
        '',
        `**Werdykt:** ${r.summary.ok ? '✅ PASS' : '⚠ FAIL'} · ${r.summary.checksPassed}/${r.summary.checksTotal}`,
        '',
        '## Cel',
        '',
        'Wyłącznie poprawki wizualne (CSS + minimalny HTML). Rynek DE — spokojny, elegancki, czytelny chrome.',
        '',
        '## Bez zmian',
        '',
        ...r.policy.unchanged.map((u) => `- ${u}`),
        '',
        '## Kanoniczne źródła (bez warstwy audit)',
        '',
        ...r.policy.canonicalSources.map((s) => `- \`${s}\``),
        '',
        '## Zakres',
        '',
        ...r.scope.map((s) => `- ${s}`),
        '',
        '## Checklist',
        '',
        ...r.checks.map((c) => `- ${c.ok ? '✓' : '✗'} ${c.id} — ${c.detail}`),
        ''
    ].join('\n');
}

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'ETAP-45-HEADER-NAV-PREMIUM.json'), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT, 'ETAP-45-HEADER-NAV-PREMIUM.md'), toMarkdown(report), 'utf8');

console.log(`[Final Premium UI] ${report.summary.ok ? 'PASS' : 'FAIL'} · ${report.summary.checksPassed}/${report.summary.checksTotal}`);
console.log(`Wrote: ${relative(ROOT, join(OUT, 'ETAP-45-HEADER-NAV-PREMIUM.md'))}`);
process.exit(failed.length ? 1 : 0);
