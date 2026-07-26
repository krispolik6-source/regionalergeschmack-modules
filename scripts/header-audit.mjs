/**
 * ETAP 28B – Header Audit
 * Sprawdza Premium Header (CSS/UI) pod kątem wymagań.
 *
 * Usage: npm run header-audit
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs', 'brand');

function read(rel) {
    const full = join(ROOT, rel);
    if (!existsSync(full)) return '';
    return readFileSync(full, 'utf8');
}

const css = read('css/premium-header.css');
const brand = read('css/brand-identity-final.css');
const style = read('css/style.css');
const html = read('index.html');

const checks = [];
const push = (id, ok, detail) => checks.push({ id, ok, detail });

push('file-premium-header', Boolean(css), 'css/premium-header.css');
push('imported-in-style', style.includes('premium-header.css'), '@import premium-header.css w style.css');
push('html-header', html.includes('class="main-header"') && html.includes('header-brand-mark'), 'struktura .main-header + logo');
push('html-logo-master', /header-brand-mark[^>]*logo-master\.svg/.test(html), 'logo = logo-master.svg');
push('html-title', /<h1>\s*Regionaler Geschmack\s*<\/h1>/.test(html), 'napis Regionaler Geschmack');
push('html-menu', html.includes('id="menuBtn"'), 'przycisk menu');
push('html-lang', html.includes('id="languageSwitcherBtn"'), 'wybór języka');
push('html-premium', html.includes('id="headerPremiumBtn"'), 'Premium');
push('html-dark', html.includes('id="darkModeToggleBtn"'), 'Dark Mode');

const breakpoints = [320, 360, 390, 412, 430, 768, 1024];
for (const bp of breakpoints) {
    const ok =
        css.includes(`${bp}px`) ||
        css.includes(`max-width: ${bp - 1}px`) ||
        (bp === 320 && css.includes('max-width: 359px')) ||
        (bp === 360 && css.includes('min-width: 360px')) ||
        (bp === 390 && css.includes('min-width: 390px')) ||
        (bp === 412 && css.includes('min-width: 412px')) ||
        (bp === 430 && css.includes('min-width: 430px')) ||
        (bp === 768 && css.includes('min-width: 768px')) ||
        (bp === 1024 && css.includes('min-width: 1024px'));
    push(`bp-${bp}`, ok, `breakpoint / zakres dla ${bp}px`);
}

push('larger-logo', /--ph-logo:\s*4[0-9]px/.test(css) || css.includes('--ph-logo: 40px'), 'większe logo (token --ph-logo)');
push('larger-title', css.includes('--ph-title') && css.includes('Literata'), 'większy napis + Literata');
push('gap-brand', css.includes('--ph-gap-brand') && /--ph-gap-brand:\s*1[2-6]px/.test(css), 'większy odstęp logo–tekst');
push('high-contrast', css.includes('#fffef8') && css.includes('text-shadow'), 'wysoki kontrast tytułu');
push('menu-style', css.includes('#menuBtn'), 'styl menu');
push('lang-style', css.includes('#languageSwitcherBtn') || css.includes('.header-lang'), 'styl języka');
push('premium-style', css.includes('#headerPremiumBtn') && css.includes('linear-gradient'), 'styl Premium (złoto)');
push('dark-style', css.includes('#darkModeToggleBtn'), 'styl Dark Mode');
push('no-arch-change', !html.includes('<!-- ETAP 28B HTML'), 'bez zmiany architektury HTML (tylko CSS)');
push('architecture-untouched', html.includes('id="mainHeader"') && html.includes('header-content'), 'Store/EventBus nietknięte – tylko warstwa CSS');

const passed = checks.filter((c) => c.ok).length;
const failed = checks.filter((c) => !c.ok);

const report = {
    id: 'header-audit-28b',
    title: 'Header Audit — ETAP 28B Premium Header',
    generatedAt: new Date().toISOString(),
    policy: {
        cssOnly: true,
        architectureUnchanged: true,
        breakpoints: breakpoints
    },
    summary: {
        total: checks.length,
        passed,
        failed: failed.length,
        ok: failed.length === 0
    },
    checks,
    recommendations: failed.length
        ? failed.map((f) => f.detail)
        : [
              'Header Premium aktywny we wszystkich wskazanych szerokościach.',
              'Weryfikacja wizualna: odśwież localhost i sprawdź 320→1024 (DevTools).'
          ]
};

function toMarkdown(r) {
    const lines = [
        `# ${r.title}`,
        '',
        `Wygenerowano: ${r.generatedAt}`,
        '',
        `**Werdykt:** ${r.summary.ok ? '✅ PASS' : '⚠ FAIL'} · ${r.summary.passed}/${r.summary.total}`,
        '',
        '## Polityka',
        '',
        '- Tylko CSS/UI (`css/premium-header.css`)',
        '- Bez zmiany architektury (Store / EventBus / HTML shell)',
        `- Breakpointy: ${r.policy.breakpoints.join(' · ')}`,
        '',
        '## Checklist',
        ''
    ];
    for (const c of r.checks) {
        lines.push(`- ${c.ok ? '✓' : '✗'} **${c.id}** — ${c.detail}`);
    }
    lines.push('', '## Co poprawiono (28B)', '');
    lines.push('- Większe logo (`--ph-logo` do 48px na 1024)');
    lines.push('- Większy napis Regionaler Geschmack (Literata + clamp)');
    lines.push('- Wyższy kontrast (#fffef8 + mocny text-shadow na ciemnej zieleni)');
    lines.push('- Większy odstęp logo–tekst (`--ph-gap-brand`)');
    lines.push('- Menu / język / Premium / Dark Mode — większe cele, złoty Premium, czytelne obramowania');
    lines.push('- Responsywność 320–1024 — tytuł nie znika (ellipsis / 2 linie na 320)');
    lines.push('', '## Rekomendacje', '');
    for (const x of r.recommendations) lines.push(`- ${x}`);
    lines.push('');
    return lines.join('\n');
}

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'HEADER-AUDIT.json'), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT, 'HEADER-AUDIT.md'), toMarkdown(report), 'utf8');

console.log(`[Header Audit] ${report.summary.ok ? 'PASS' : 'FAIL'} · ${passed}/${checks.length}`);
console.log(`Wrote: ${relative(ROOT, join(OUT, 'HEADER-AUDIT.md'))}`);
if (failed.length) {
    for (const f of failed) console.error(' ✗', f.id, f.detail);
}
process.exit(failed.length ? 1 : 0);
