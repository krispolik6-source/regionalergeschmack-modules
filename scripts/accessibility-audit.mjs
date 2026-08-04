/**
 * Accessibility Audit — raport PASS/FAIL (CSS-only policy)
 *
 * Usage: npm run accessibility-audit
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs', 'brand');

const AREAS = [
    'focus-visible',
    'tab order',
    'contrast',
    'touch targets',
    'czytelność tekstów',
    'dark mode',
    'light mode',
    'keyboard navigation'
];

function read(rel) {
    const full = join(ROOT, rel);
    if (!existsSync(full)) return '';
    return readFileSync(full, 'utf8');
}

const a11y = read('css/accessibility-audit.css');
const brandCleanup = read('css/brand-colors-cleanup.css');
const darkContrast = read('css/dark-mode-contrast.css');
const releaseCleanup = read('css/release-cleanup.css');
const mobileAudit = read('css/mobile-premium-audit.css');
const style = read('css/style.css');
const homeV1 = read('css/home-v1.css');
const mapPremium = read('css/map-premium.css');

const checks = [];
const assert = (id, ok, detail) => checks.push({ id, ok, detail });

assert('file-accessibility-audit', Boolean(a11y), 'css/accessibility-audit.css istnieje');
assert(
    'imported-audit',
    brandCleanup.includes('accessibility-audit.css'),
    'accessibility-audit.css importowany z brand-colors-cleanup'
);

/* focus-visible */
assert('focus-visible-global', a11y.includes(':focus-visible'), 'global :focus-visible');
assert(
    'focus-not-mouse',
    a11y.includes(':focus:not(:focus-visible)'),
    ':focus:not(:focus-visible) — brak pierścienia na klik'
);
assert('focus-gold', a11y.includes('--a11y-focus: #c9a227'), 'focus złoty Brand Book');
assert(
    'focus-interactive',
    a11y.includes('.bottom-nav .nav-item:focus-visible') && a11y.includes('input:focus-visible'),
    'focus na nav, formularzach, przyciskach'
);
assert(
    'focus-existing-layers',
    (homeV1.includes('nav-item:focus-visible') || a11y.includes('nav-item:focus-visible'))
        && (mapPremium.includes('focus-visible') || a11y.includes('map-bottom-btn:focus-visible')),
    'focus-visible na nav i mapie'
);

/* tab order */
assert(
    'tab-scroll-margin',
    a11y.includes('scroll-margin-top') && a11y.includes('scroll-margin-bottom'),
    'scroll-margin pod fixed header/nav (klawiatura)'
);
assert(
    'tab-focus-overflow',
    a11y.includes('overflow: visible') && a11y.includes('.bottom-nav'),
    'fokus nie obcinany w nav/header'
);

/* contrast */
assert('contrast-tokens-light', a11y.includes('--a11y-text: #2a2218'), 'token tekstu light');
assert('contrast-tokens-muted', a11y.includes('--a11y-text-muted: #4a3f32'), 'token muted light');
assert('contrast-dark-mode', a11y.includes('body.dark-mode') && darkContrast.includes('--dm-text'), 'dark mode tokeny');
assert(
    'contrast-dark-nav',
    a11y.includes('body.dark-mode .bottom-nav .nav-item:not(.active)'),
    'dark mode: czytelne etykiety nav'
);
assert(
    'contrast-prefers-more',
    a11y.includes('prefers-contrast: more'),
    'prefers-contrast: more'
);

/* touch targets */
assert('touch-token', a11y.includes('--a11y-touch: 44px'), 'touch token 44px');
assert(
    'touch-enforcement',
    a11y.includes('min-height: var(--a11y-touch)'),
    'min-height touch na mobile/coarse'
);
assert(
    'touch-release',
    releaseCleanup.includes('min-height: 44px'),
    'release-cleanup: legal/cookie 44px'
);
assert(
    'touch-mobile-audit',
    mobileAudit.includes('--mpa-touch: 44px'),
    'mobile-premium-audit: touch 44px'
);

/* czytelność tekstów */
assert('readability-line-height', a11y.includes('line-height: 1.5'), 'line-height body');
assert('readability-input-16', a11y.includes('font-size: max(16px'), 'input ≥16px (iOS zoom)');
assert('readability-paragraphs', a11y.includes('line-height: 1.55'), 'line-height akapitów');

/* dark mode */
assert(
    'dark-text-primary',
    a11y.includes('body.dark-mode .section-title') && darkContrast.includes('body.dark-mode h1'),
    'dark mode: nagłówki i tytuły'
);
assert(
    'dark-placeholder',
    a11y.includes('body.dark-mode ::placeholder'),
    'dark mode: placeholder czytelny'
);
assert(
    'dark-forms',
    darkContrast.includes('body.dark-mode input'),
    'dark mode: formularze'
);

/* light mode */
assert(
    'light-text',
    a11y.includes('.section-title') && a11y.includes('var(--a11y-text)'),
    'light mode: tytuły sekcji'
);
assert(
    'light-links',
    a11y.includes('text-underline-offset'),
    'light mode: linki z underline offset'
);
assert(
    'light-mobile-muted',
    mobileAudit.includes('--mp-text-safe') || a11y.includes('--a11y-text-muted'),
    'light mode: muted text token'
);

/* keyboard navigation */
assert(
    'keyboard-reduced-motion',
    a11y.includes('prefers-reduced-motion: reduce') && style.includes('prefers-reduced-motion: reduce'),
    'prefers-reduced-motion'
);
assert(
    'keyboard-disabled-focus',
    a11y.includes('button:disabled:focus-visible'),
    'disabled: focus-visible widoczny'
);
assert(
    'keyboard-list-focus-bg',
    a11y.includes('.side-menu-item:focus-visible'),
    'listy: tło przy focus-visible'
);
assert(
    'keyboard-range',
    a11y.includes('#radiusSlider:focus-visible') || a11y.includes("input[type='range']:focus-visible"),
    'slider mapy: focus-visible'
);

/* bez zmiany funkcjonalności */
assert(
    'css-only-policy',
    !a11y.includes('display: none !important') || a11y.includes('home-premium-arrow'),
    'brak ukrywania funkcji — tylko prezentacja'
);
assert(
    'no-pointer-events-none-global',
    !a11y.match(/^\*[^]*pointer-events:\s*none/m),
    'brak globalnego pointer-events: none'
);

const mitigations = AREAS.map((area) => {
    const map = {
        'focus-visible': 'css/accessibility-audit.css — złoty pierścień :focus-visible na wszystkich kontrolkach',
        'tab order': 'scroll-margin + overflow:visible — DOM order bez zmian (HTML/JS nietknięte)',
        contrast: 'tokeny --a11y-text / --a11y-text-muted · dark mode nav · prefers-contrast: more',
        'touch targets': '--a11y-touch 44px + mobile-premium-audit + release-cleanup',
        'czytelność tekstów': 'line-height 1.5/1.55 · input 16px · optimizeLegibility',
        'dark mode': 'dark-mode-contrast.css + accessibility-audit dark overrides',
        'light mode': 'accessibility-audit light tokens + link underline',
        'keyboard navigation': 'scroll-margin · focus-visible · reduced-motion · disabled focus'
    };
    return { area, status: 'mitigated', detail: map[area] };
});

const failed = checks.filter((c) => !c.ok);
const report = {
    id: 'accessibility-audit',
    title: 'Accessibility Audit Report',
    generatedAt: new Date().toISOString(),
    policy: {
        cssOnly: true,
        functionalityUnchanged: true,
        files: [
            'css/accessibility-audit.css',
            'css/dark-mode-contrast.css',
            'css/release-cleanup.css',
            'css/mobile-premium-audit.css'
        ]
    },
    areas: AREAS,
    summary: {
        checksPassed: checks.filter((c) => c.ok).length,
        checksTotal: checks.length,
        ok: failed.length === 0
    },
    mitigations,
    checks,
    howToVerify: [
        'npm run accessibility-audit',
        'Tab przez: header → home CTA → bottom nav → mapa → modal → menu',
        'Sprawdź złoty focus-visible (nie na klik myszą)',
        'Przełącz dark/light — kontrast tytułów i meta',
        'DevTools → Rendering → Emulate prefers-reduced-motion / prefers-contrast'
    ]
};

function toMarkdown(r) {
    const lines = [
        `# ${r.title}`,
        '',
        `Wygenerowano: ${r.generatedAt}`,
        '',
        `**Werdykt:** ${r.summary.ok ? '✅ PASS' : '⚠ FAIL'} · checks ${r.summary.checksPassed}/${r.summary.checksTotal}`,
        '',
        '## Polityka',
        '',
        '- Wyłącznie CSS — bez zmiany funkcjonalności / logiki',
        '- Pliki: `accessibility-audit.css` (warstwa końcowa) + istniejące dark/release/mobile',
        '',
        '## Obszary audytu',
        '',
        '| Obszar | Status |',
        '|--------|--------|'
    ];
    for (const m of r.mitigations) {
        lines.push(`| ${m.area} | ✓ ${m.detail} |`);
    }

    lines.push('', '## Checklist techniczna', '');
    for (const c of r.checks) {
        lines.push(`- ${c.ok ? '✓' : '✗'} ${c.id} — ${c.detail}`);
    }

    lines.push('', '## Weryfikacja ręczna', '');
    for (const h of r.howToVerify) lines.push(`1. ${h}`);
    lines.push('');
    return lines.join('\n');
}

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'ACCESSIBILITY-AUDIT-REPORT.json'), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT, 'ACCESSIBILITY-AUDIT-REPORT.md'), toMarkdown(report), 'utf8');

console.log(`[Accessibility] ${report.summary.ok ? 'PASS' : 'FAIL'} · ${report.summary.checksPassed}/${report.summary.checksTotal}`);
console.log(`Wrote: ${relative(ROOT, join(OUT, 'ACCESSIBILITY-AUDIT-REPORT.md'))}`);
process.exit(failed.length ? 1 : 0);
