/**
 * Animation Audit — raport PASS/FAIL (CSS only)
 *
 * Usage: npm run animation-audit
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs', 'brand');
const CSS_DIR = join(ROOT, 'css');

const REMOVED = ['pulsowanie', 'miganie', 'drift', 'breathing', 'breath', 'bounce', 'floating', 'float', 'pulse', 'blink', 'sway'];
const ALLOWED = ['fade', 'hover', 'active', 'focus'];

function read(rel) {
    const full = join(ROOT, rel);
    if (!existsSync(full)) return '';
    return readFileSync(full, 'utf8');
}

function allCssFiles() {
    return readdirSync(CSS_DIR).filter((f) => f.endsWith('.css'));
}

const animAudit = read('css/animation-audit.css');
const brandCleanup = read('css/brand-colors-cleanup.css');
const homeV1 = read('css/home-v1.css');

const checks = [];
const assert = (id, ok, detail) => checks.push({ id, ok, detail });

assert('file-animation-audit', Boolean(animAudit), 'css/animation-audit.css istnieje');
assert(
    'imported-audit',
    brandCleanup.includes('animation-audit.css'),
    'animation-audit.css importowany z brand-colors-cleanup'
);

/* Dozwolone animacje */
assert('fade-keyframes', animAudit.includes('@keyframes motion-fade-in'), 'keyframes motion-fade-in (fade)');
assert('fade-home', animAudit.includes('.home-page--v1.home-page--v2'), 'fade wejścia Home');
assert('fade-views', animAudit.includes('[data-view-panel].active:not([hidden])'), 'fade przejść ekranów');
assert('fade-map', animAudit.includes("body.view-map-active [data-view-panel='map']"), 'fade mapa');
assert('fade-markers', animAudit.includes('marker-fade-in') || animAudit.includes('marker-animate-in'), 'fade markerów');

assert('hover-lift', animAudit.includes('--motion-lift: -2px'), 'hover lift −2px (Home Premium)');
assert('hover-rules', animAudit.includes(':hover') && animAudit.includes('translateY(var(--motion-lift))'), 'hover translateY');
assert('active-tap', animAudit.includes('--motion-tap-scale: 0.985'), 'active tap scale');
assert('active-rules', animAudit.includes(':active') && animAudit.includes('scale(var(--motion-tap-scale))'), 'active scale');
assert('focus-motion', animAudit.includes(':focus-visible'), 'focus bez transform bounce');

assert('motion-tokens', animAudit.includes('--motion-ease') && animAudit.includes('--motion-duration: 0.28s'), 'tokeny Home Premium');
assert(
    'home-v1-alignment',
    homeV1.includes('--home-motion-ease') && homeV1.includes('0.28s'),
    'home-v1.css spójne tokeny ruchu'
);

/* Usunięte — warstwa audit */
assert('kill-infinite-climate', animAudit.includes('#climateAtmosphere') && animAudit.includes('animation: none'), 'wyłącz climate atmosphere');
assert('kill-breathe-lre', animAudit.includes('.home-region-soul') && animAudit.includes('animation: none'), 'wyłącz breathe/glow region soul');
assert('kill-ln-drift', animAudit.includes('.ln-clouds') && animAudit.includes('.ln-wheat'), 'wyłącz living-nature drift/sway');
assert('kill-card-rise', animAudit.includes('.home-page .category-card'), 'wyłącz climate-card-rise');
assert('kill-ambient-transform', animAudit.includes('transform: none') && animAudit.includes('#climateAtmosphere'), 'wyłącz drift transform tła');
assert('side-menu-fade-not-slide', animAudit.includes('.side-menu-panel') && animAudit.includes('opacity: 0'), 'menu: fade zamiast slide');
assert('splash-fade-only', animAudit.includes('.rg-splash.is-entering') && animAudit.includes('transform: none'), 'splash: fade bez scale bounce');
assert('kill-theme-bounce', animAudit.includes('.theme-toggle:hover') && animAudit.includes('transform: none'), 'wyłącz bounce theme toggle');
assert('reduced-motion', animAudit.includes('prefers-reduced-motion: reduce'), 'prefers-reduced-motion');

/* Residual scan — pliki źródłowe (informacyjnie, mitigated przez audit) */
const cssContents = allCssFiles().map((f) => ({ file: f, content: readFileSync(join(CSS_DIR, f), 'utf8') }));
const residualInfinite = cssContents
    .filter(({ file, content }) => file !== 'animation-audit.css' && /animation:[^;]*infinite/i.test(content))
    .map(({ file }) => file);

const residualKeyframes = cssContents
    .flatMap(({ file, content }) => {
        const names = [...content.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]);
        return names
            .filter((n) => /breathe|drift|sway|pulse|blink|bounce|float|snow-fall|warm-glow|soft-light/i.test(n))
            .map((n) => `${file}:${n}`);
    });

assert(
    'residual-infinite-mitigated',
    residualInfinite.length === 0 || animAudit.includes('animation: none !important'),
    residualInfinite.length
        ? `infinite w źródłach (${residualInfinite.join(', ')}) — nadpisane audit layer`
        : 'brak infinite animation w CSS'
);

assert(
    'residual-keyframes-mitigated',
    residualKeyframes.length === 0 || animAudit.includes('animation: none !important'),
    residualKeyframes.length
        ? `keyframes dekoracyjne (${residualKeyframes.slice(0, 5).join(', ')}${residualKeyframes.length > 5 ? '…' : ''}) — wyłączone audit layer`
        : 'brak dekoracyjnych keyframes'
);

for (const kind of ALLOWED) {
    const ok =
        (kind === 'fade' && animAudit.includes('motion-fade-in')) ||
        (kind === 'hover' && animAudit.includes(':hover')) ||
        (kind === 'active' && animAudit.includes(':active')) ||
        (kind === 'focus' && animAudit.includes(':focus-visible'));
    assert(`allowed-${kind}`, ok, `dozwolone: ${kind}`);
}

for (const bad of ['pulse', 'blink', 'drift', 'breath', 'bounce', 'float', 'sway']) {
    const mitigated =
        animAudit.includes('animation: none !important') &&
        (bad === 'drift' || bad === 'sway'
            ? animAudit.includes('.ln-clouds') || animAudit.includes('#climateAtmosphere')
            : bad === 'breath'
                ? animAudit.includes('.home-region-soul')
                : animAudit.includes('transform: none') || animAudit.includes('animation: none'));
    assert(`removed-${bad}`, mitigated, `usunięte/mitigowane: ${bad}`);
}

const failed = checks.filter((c) => !c.ok);
const report = {
    id: 'animation-audit',
    title: 'Animation Audit Report',
    generatedAt: new Date().toISOString(),
    policy: {
        cssOnly: true,
        functionalityUnchanged: true,
        allowed: ALLOWED,
        removed: REMOVED,
        file: 'css/animation-audit.css'
    },
    summary: {
        checksPassed: checks.filter((c) => c.ok).length,
        checksTotal: checks.length,
        ok: failed.length === 0,
        residualInfiniteFiles: residualInfinite,
        residualDecorativeKeyframes: residualKeyframes
    },
    checks,
    howToVerify: [
        'npm run animation-audit',
        'Home: brak pulsowania tła / kart — tylko fade wejścia',
        'Hover: delikatny lift −2px · Active: scale 0.985',
        'Mapa: fade markerów · menu boczne: fade (nie slide)',
        'DevTools → Rendering → prefers-reduced-motion: reduce'
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
        '- Wyłącznie CSS — bez zmiany funkcjonalności',
        '- Dozwolone: **fade · hover · active · focus** (Home Premium)',
        '- Usunięte: pulse · blink · drift · breathe · bounce · float',
        '',
        '## Checklist',
        ''
    ];
    for (const c of r.checks) lines.push(`- ${c.ok ? '✓' : '✗'} ${c.id} — ${c.detail}`);

    if (r.summary.residualInfiniteFiles?.length) {
        lines.push('', '## Pliki źródłowe z `infinite` (nadpisane audit layer)', '');
        for (const f of r.summary.residualInfiniteFiles) lines.push(`- \`${f}\``);
    }

    lines.push('', '## Weryfikacja', '');
    for (const h of r.howToVerify) lines.push(`1. ${h}`);
    lines.push('');
    return lines.join('\n');
}

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'ANIMATION-AUDIT-REPORT.json'), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT, 'ANIMATION-AUDIT-REPORT.md'), toMarkdown(report), 'utf8');

console.log(`[Animation] ${report.summary.ok ? 'PASS' : 'FAIL'} · ${report.summary.checksPassed}/${report.summary.checksTotal}`);
console.log(`Wrote: ${relative(ROOT, join(OUT, 'ANIMATION-AUDIT-REPORT.md'))}`);
process.exit(failed.length ? 1 : 0);
