/**
 * Release Ready Audit — końcowy audyt aplikacji
 *
 * Usage: npm run release-ready-audit
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs', 'final');

const AREAS = [
    { id: 'home', label: 'Home', selectors: ['.home-page--v1', '.home-greeting', '.categories-grid'] },
    { id: 'map', label: 'Mapa', selectors: ['[data-view-panel="map"]', '.map-toolbar-unified', '.map-offline-banner'] },
    { id: 'producer', label: 'Profil producenta', selectors: ['.producer-modal', '.producer-modal-header', '.producer-modal-footer'] },
    { id: 'categories', label: 'Kategorie', selectors: ['.category-card--photo', '.categories-grid--2x4'] },
    { id: 'premium', label: 'Premium', selectors: ['.premium-page', '.premium-feature-card', '.premium-cta-section'] },
    { id: 'legal', label: 'Legal', selectors: ['.legal-page', '.app-legal-footer', '.legal-page-section-title'] },
    { id: 'settings', label: 'Ustawienia', selectors: ['.setting-item', '.profile-page', '.switch'] },
    { id: 'side-menu', label: 'Side Menu', selectors: ['.side-menu-panel', '.side-menu-item', '.side-menu-title'] },
    { id: 'bottom-nav', label: 'Bottom Navigation', selectors: ['.bottom-nav', '.nav-item', '.nav-label'] },
    { id: 'offline', label: 'Offline', selectors: ['.map-offline-banner', '.map-status'] },
    { id: 'pwa', label: 'PWA', selectors: ['.pwa-install-banner', 'manifest'] },
    { id: 'dark-mode', label: 'Dark Mode', selectors: ['body.dark-mode', '--dm-bg', '--rr-surface-dark'] },
    { id: 'light-mode', label: 'Light Mode', selectors: ['--rr-surface', '--rr-text', '#fffef8'] },
    { id: 'responsive', label: 'Responsive', script: 'mobile-premium-audit' },
    { id: 'accessibility', label: 'Accessibility', script: 'accessibility-audit' },
    { id: 'performance', label: 'Performance', script: 'css-performance-audit' },
    { id: 'brand-book', label: 'Brand Book', script: 'check:brand-protection' }
];

const SUB_AUDITS = [
    { id: 'mobile-premium', cmd: 'npm run mobile-premium-audit' },
    { id: 'accessibility', cmd: 'npm run accessibility-audit' },
    { id: 'animation', cmd: 'npm run animation-audit' },
    { id: 'css-performance', cmd: 'npm run css-performance-audit' },
    { id: 'brand-protection', cmd: 'npm run check:brand-protection' },
    { id: 'pwa', cmd: 'npm run check:pwa' },
    { id: 'responsive', cmd: 'npm run check:responsive' },
    { id: 'release-cleanup', cmd: 'node scripts/test-release-cleanup.mjs' },
    { id: 'brand-colors', cmd: 'node scripts/test-brand-colors-cleanup.mjs' },
    { id: 'check-accessibility-theme', cmd: 'npm run check:accessibility' }
];

function read(rel) {
    const full = join(ROOT, rel);
    if (!existsSync(full)) return '';
    return readFileSync(full, 'utf8');
}

function run(cmd) {
    const r = spawnSync(cmd, { shell: true, cwd: ROOT, encoding: 'utf8', timeout: 120000 });
    return {
        ok: r.status === 0,
        exit: r.status,
        out: `${r.stdout || ''}${r.stderr || ''}`.trim().slice(-500)
    };
}

const releaseReady = read('css/release-ready-audit.css');
const brandCleanup = read('css/brand-colors-cleanup.css');
const themeToggle = read('css/theme-toggle-premium.css');

const checks = [];
const assert = (id, ok, detail) => checks.push({ id, ok, detail });

assert('file-release-ready', Boolean(releaseReady), 'css/release-ready-audit.css istnieje');
assert('imported-release-ready', brandCleanup.includes('release-ready-audit.css'), 'import w brand-colors-cleanup');
assert('audit-stack-complete', [
    'mobile-premium-audit.css',
    'accessibility-audit.css',
    'animation-audit.css',
    'css-performance-audit.css',
    'release-ready-audit.css'
].every((f) => brandCleanup.includes(f)), 'pełny stack audit CSS');

assert('theme-focus-visible', themeToggle.includes('focus-visible'), 'theme toggle focus-visible');
assert(
    'theme-touch-ph-btn',
    themeToggle.includes('min-width: var(--ph-btn)') || themeToggle.includes('min-width: 44px'),
    'theme toggle touch ≥44px'
);

for (const area of AREAS.filter((a) => a.selectors)) {
    const pool = [
        releaseReady,
        brandCleanup,
        read('css/home-v1.css'),
        read('css/map-premium.css'),
        read('css/producer-modal-premium.css'),
        read('css/release-cleanup.css'),
        read('css/dark-mode-contrast.css')
    ].join('\n');
    const hit = area.selectors.every((sel) => {
        if (sel === 'manifest') return existsSync(join(ROOT, 'manifest.json'));
        const variants = [sel, sel.replace(/"/g, "'"), sel.replace(/'/g, '"')];
        return variants.some((v) => pool.includes(v) || pool.includes(v.split(' ').pop()));
    });
    assert(`area-${area.id}`, hit, `${area.label}: style coverage`);
}

const subResults = [];
for (const sub of SUB_AUDITS) {
    const r = run(sub.cmd);
    subResults.push({ id: sub.id, ok: r.ok, exit: r.exit, detail: r.out.split('\n').slice(-2).join(' · ') });
    assert(`sub-${sub.id}`, r.ok, `${sub.id}: ${r.ok ? 'PASS' : 'FAIL'}`);
}

const areaResults = AREAS.map((a) => {
    const sub = a.script ? subResults.find((s) => s.id === a.script || s.id === a.id) : null;
    const cssCheck = checks.find((c) => c.id === `area-${a.id}`);
    return {
        id: a.id,
        label: a.label,
        status: (cssCheck?.ok !== false && (!sub || sub.ok)) ? 'pass' : 'fail',
        css: cssCheck?.ok !== false,
        subAudit: sub ? (sub.ok ? 'pass' : 'fail') : null
    };
});

const failed = checks.filter((c) => !c.ok);
const visualPass = areaResults.every((a) => a.status === 'pass');
const report = {
    id: 'release-ready-audit',
    title: 'Release Ready — Końcowy Audyt Aplikacji',
    generatedAt: new Date().toISOString(),
    policy: {
        cssOnlyFixes: true,
        unchanged: ['JS', 'HTML', 'Store', 'EventBus', 'GPS', 'Map logic', 'Translations', 'Architecture']
    },
    verdict: {
        releaseReady: failed.length === 0 && visualPass,
        label: failed.length === 0 && visualPass ? 'PASS' : 'FAIL',
        checksPassed: checks.filter((c) => c.ok).length,
        checksTotal: checks.length
    },
    areas: areaResults,
    subAudits: subResults,
    auditStack: [
        'css/mobile-premium-audit.css',
        'css/accessibility-audit.css',
        'css/animation-audit.css',
        'css/css-performance-audit.css',
        'css/release-ready-audit.css'
    ],
    checks,
    notes: [
        'Warstwa release-ready-audit.css: spójność wizualna wszystkich ekranów (Brand Book)',
        'Stack audit ładowany przez brand-colors-cleanup.css?v=6 (ostatnia kaskada)',
        'Release Validator (ETAP 44) może nadal raportować błędy poza CSS (np. klucze tłumaczeń) — poza zakresem tego audytu'
    ]
};

report.generatedAt = new Date().toISOString();

function toMarkdown(r) {
    const lines = [
        `# ${r.title}`,
        '',
        `Wygenerowano: ${r.generatedAt}`,
        '',
        `## Werdykt: **${r.verdict.label === 'PASS' ? '✅ PASS — Release Ready' : '⚠ FAIL'}**`,
        '',
        `Checks: **${r.verdict.checksPassed}/${r.verdict.checksTotal}** · Obszary: **${r.areas.filter((a) => a.status === 'pass').length}/${r.areas.length}**`,
        '',
        '## Polityka',
        '',
        '- Poprawki wizualne: **wyłącznie CSS**',
        '- Bez zmian: JS · HTML · Store · EventBus · GPS · logika mapy · tłumaczenia · architektura',
        '',
        '## Obszary aplikacji',
        '',
        '| Obszar | Status | CSS | Sub-audit |',
        '|--------|--------|-----|-----------|'
    ];
    for (const a of r.areas) {
        lines.push(`| ${a.label} | ${a.status === 'pass' ? '✓' : '✗'} | ${a.css ? '✓' : '—'} | ${a.subAudit || '—'} |`);
    }

    lines.push('', '## Sub-audyty', '');
    for (const s of r.subAudits) {
        lines.push(`- ${s.ok ? '✓' : '✗'} **${s.id}** — ${s.detail || (s.ok ? 'PASS' : 'FAIL')}`);
    }

    lines.push('', '## Stack CSS (kolejność ładowania)', '');
    for (const f of r.auditStack) lines.push(`1. \`${f}\``);

    lines.push('', '## Checklist', '');
    for (const c of r.checks) lines.push(`- ${c.ok ? '✓' : '✗'} ${c.id} — ${c.detail}`);

    if (r.notes?.length) {
        lines.push('', '## Uwagi', '');
        for (const n of r.notes) lines.push(`- ${n}`);
    }
    lines.push('');
    return lines.join('\n');
}

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'RELEASE-READY.json'), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT, 'RELEASE-READY.md'), toMarkdown(report), 'utf8');

console.log(`[Release Ready] ${report.verdict.label} · ${report.verdict.checksPassed}/${report.verdict.checksTotal} · areas ${areaResults.filter((a) => a.status === 'pass').length}/${areaResults.length}`);
console.log(`Wrote: ${relative(ROOT, join(OUT, 'RELEASE-READY.md'))}`);
process.exit(failed.length ? 1 : 0);
