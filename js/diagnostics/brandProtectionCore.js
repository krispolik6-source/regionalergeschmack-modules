/**
 * ETAP 29C – Brand Protection AI (core)
 * Brand Book = najwyższy autorytet. Tylko raport. autoApply: false.
 */

export const POLICY = Object.freeze({
    autoApply: false,
    autoFix: false,
    autoModifyCode: false,
    brandBookAuthority: true,
    brandBook: 'docs/brand/BRAND-BOOK.md',
    warning: '⚠️ Zmiana narusza Brand Book – wymaga akceptacji właściciela.',
    role: 'brand-protection-ai'
});

/** Kanoniczne tokeny z Brand Book */
export const BRAND = Object.freeze({
    green: '#2a3f28',
    greenMid: '#3d5c34',
    greenSoft: '#4f6b3c',
    gold: '#c9a227',
    goldDeep: '#a67c1a',
    wheat: '#e8c97a',
    honey: '#d4a84b',
    cream: '#f5efe3',
    creamCard: '#fff8ee',
    ink: '#1c1812',
    themeColor: '#2a3f28',
    backgroundColor: '#f5efe3',
    displayFont: 'Literata',
    uiFont: 'Source Sans 3',
    masterLogo: 'assets/icons/logo-master.svg'
});

export const COLD_HEX = Object.freeze([
    '#3b82f6', '#2563eb', '#1d4ed8', '#6366f1', '#4f46e5',
    '#7c3aed', '#8b5cf6', '#8ec4ff', '#8ec0ff', '#2980b9',
    '#3498db', '#456696', '#0ea5e9', '#06b6d4'
]);

export const FOREIGN_FONTS = Object.freeze([
    'inter', 'roboto', 'montserrat', 'poppins', 'nunito', 'raleway', 'helvetica neue'
]);

export const PURPLE_GLOW = Object.freeze([
    'rgba(124, 58, 237', 'rgba(139, 92, 246', 'rgba(99, 102, 241',
    '#7c3aed', '#8b5cf6', '#a855f7', 'hsl(270', 'hsl(262'
]);

export const REQUIRED_PNG = Object.freeze([
    'assets/icons/icon-192.png',
    'assets/icons/icon-512.png',
    'assets/icons/maskable-512.png',
    'assets/icons/monochrome-512.png',
    'assets/icons/apple-touch-icon.png',
    'assets/brand/og-share.png',
    'assets/brand/splash-logo.png',
    'assets/brand/notifications-icon.png',
    'assets/store/google-play/icon-512.png',
    'assets/store/app-store/icon-1024.png'
]);

/**
 * @typedef {'fail'|'warning'} Severity
 * @typedef {{
 *   id: string,
 *   severity: Severity,
 *   category: string,
 *   file: string,
 *   detail: string,
 *   message: string
 * }} Finding
 */

/**
 * @param {Finding[]} findings
 * @returns {'PASS'|'WARNING'|'FAIL'}
 */
export function resolveStatus(findings) {
    if ((findings || []).some((f) => f.severity === 'fail')) return 'FAIL';
    if ((findings || []).some((f) => f.severity === 'warning')) return 'WARNING';
    return 'PASS';
}

/**
 * @param {object} report
 */
export function brandProtectionToMarkdown(report) {
    const status = report.status;
    const badge = status === 'PASS' ? '✅ PASS' : status === 'WARNING' ? '⚠️ WARNING' : '❌ FAIL';
    const lines = [
        `# ${report.title}`,
        '',
        `Wygenerowano: ${report.generatedAt}`,
        '',
        `## Status: **${badge}**`,
        '',
        '## Polityka',
        '',
        '- **Brand Book = najwyższy autorytet**',
        '- **autoApply: false** — nie zmienia kodu',
        '- **autoFix: false** — nie poprawia naruszeń',
        '- Przy naruszeniu: tylko ostrzeżenie w raporcie',
        '',
        `> ${POLICY.warning}`,
        '',
        '## Zakres skanu',
        '',
        `- HTML · CSS · SVG · PNG · Manifest · PWA`,
        `- Kategorie: ${Object.keys(report.categories || {}).join(' · ') || '—'}`,
        `- Pliki: **${report.summary?.filesScanned ?? 0}**`,
        `- FAIL: **${report.summary?.fail ?? 0}** · WARNING: **${report.summary?.warning ?? 0}**`,
        '',
        '## Kategorie',
        ''
    ];

    for (const [cat, c] of Object.entries(report.categories || {})) {
        const mark = c.fail ? '❌' : c.warning ? '⚠️' : '✅';
        lines.push(`- ${mark} **${cat}** — fail ${c.fail || 0}, warning ${c.warning || 0}`);
    }

    lines.push('', '## Naruszenia', '');
    if (!(report.findings || []).length) {
        lines.push('_Brak. Spójność z Brand Book._', '');
    } else {
        for (const f of report.findings) {
            const sev = f.severity === 'fail' ? 'FAIL' : 'WARNING';
            lines.push(`- **[${sev}]** \`${f.category}\` · \`${f.file}\` — ${f.detail}`);
            lines.push(`  - ${f.message}`);
        }
        lines.push('');
    }

    lines.push('## Zasady Brand Book', '');
    lines.push(`- Logo master: \`${BRAND.masterLogo}\``);
    lines.push(`- Paleta: ${BRAND.green} / ${BRAND.gold} / ${BRAND.cream}`);
    lines.push(`- Fonty: ${BRAND.displayFont} + ${BRAND.uiFont}`);
    lines.push(`- Manifest: theme ${BRAND.themeColor} · background ${BRAND.backgroundColor}`);
    lines.push('');
    return lines.join('\n');
}

export default {
    POLICY,
    BRAND,
    resolveStatus,
    brandProtectionToMarkdown
};
