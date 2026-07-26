/**
 * ETAP 26 – Living Brand (runtime)
 * Codzienny strażnik marki w przeglądarce. autoFix: false.
 */

import { isDevMode } from './healthMonitor.js';
import {
    BRAND_PALETTE,
    LOGO,
    FONTS,
    FORBIDDEN_COLD_BLUE,
    POLICY,
    normalizeHex,
    isForbiddenBlue
} from './livingBrandBook.js';
import { buildLivingBrandReport } from './livingBrandCore.js';

const REPORT_KEY = 'rg_living_brand_v1';
const DAY_KEY = 'rg_living_brand_day_v1';

let lastReport = null;
let initialized = false;

function dayStamp() {
    return new Date().toISOString().slice(0, 10);
}

/**
 * Szybki audit DOM + computed styles (uzupełnia CLI).
 */
export function collectLivingBrandFindings() {
    const findings = [];
    const push = (f) => findings.push(f);

    // Logo
    document.querySelectorAll('.header-brand-mark, .home-brand-mark').forEach((img) => {
        const src = img.getAttribute('src') || '';
        if (!/logo-master\.svg/i.test(src)) {
            push({
                check: 'logo',
                severity: 'critical',
                title: 'Element marki bez logo-master.svg',
                detail: src || '(brak src)',
                file: 'DOM',
                value: src
            });
        }
    });

    const brandLogo = getComputedStyle(document.documentElement)
        .getPropertyValue('--brand-logo') || '';
    if (brandLogo && !/logo-master\.svg/i.test(brandLogo)) {
        push({
            check: 'logo',
            severity: 'high',
            title: 'CSS --brand-logo nie wskazuje master',
            detail: brandLogo.slice(0, 120),
            file: 'computed'
        });
    }

    // Colors – tokeny
    const root = getComputedStyle(document.documentElement);
    const tokenMap = {
        '--brand-green': BRAND_PALETTE.green,
        '--brand-gold': BRAND_PALETTE.gold,
        '--brand-cream': BRAND_PALETTE.cream,
        '--brand-wheat': BRAND_PALETTE.wheat,
        '--brand-honey': BRAND_PALETTE.honey
    };
    for (const [prop, expected] of Object.entries(tokenMap)) {
        const raw = root.getPropertyValue(prop).trim();
        if (!raw) {
            push({
                check: 'colors',
                severity: 'high',
                title: `Brak tokenu ${prop}`,
                file: 'computed'
            });
            continue;
        }
        // computed może być rgb()
        if (raw.startsWith('#') && normalizeHex(raw) !== normalizeHex(expected)) {
            push({
                check: 'colors',
                severity: 'medium',
                title: `${prop} ≠ Brand Book ${expected}`,
                detail: raw,
                file: 'computed',
                value: raw
            });
        }
    }

    // Cold blue w inline / computed primary
    const primary = root.getPropertyValue('--color-primary').trim();
    if (primary.startsWith('#') && isForbiddenBlue(primary)) {
        push({
            check: 'coldBlue',
            severity: 'critical',
            title: `--color-primary zimny niebieski ${primary}`,
            file: 'computed',
            value: primary
        });
    }

    // Fonts
    const bodyFont = (getComputedStyle(document.body).fontFamily || '').toLowerCase();
    if (!bodyFont.includes('source sans')) {
        push({
            check: 'fonts',
            severity: 'medium',
            title: 'body nie używa Source Sans 3',
            detail: bodyFont.slice(0, 100),
            file: 'computed'
        });
    }
    for (const foreign of ['inter', 'roboto', 'poppins', 'montserrat']) {
        if (bodyFont.includes(foreign)) {
            push({
                check: 'fonts',
                severity: 'high',
                title: `Obcy font na body: ${foreign}`,
                file: 'computed'
            });
        }
    }

    const h1 = document.querySelector('.main-header h1, .header-left h1');
    if (h1) {
        const ff = (getComputedStyle(h1).fontFamily || '').toLowerCase();
        if (!ff.includes('literata') && !ff.includes('georgia')) {
            push({
                check: 'fonts',
                severity: 'medium',
                title: 'Nagłówek marki bez Literata / Georgia fallback',
                detail: ff.slice(0, 100),
                file: 'DOM'
            });
        }
    }

    // Shadows – sample header
    const header = document.querySelector('.main-header');
    if (header) {
        const sh = getComputedStyle(header).boxShadow || '';
        if (/rgb\(\s*\d+\s*,\s*\d+\s*,\s*255/i.test(sh) || /purple|indigo/i.test(sh)) {
            push({
                check: 'shadows',
                severity: 'high',
                title: 'Header ma obcy / zimny cień',
                detail: sh.slice(0, 120),
                file: 'DOM'
            });
        }
    }

    // Icons – link rel
    const iconHrefs = [...document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]')]
        .map((l) => l.getAttribute('href') || '');
    if (!iconHrefs.some((h) => /logo-master\.svg|favicon\.ico|icon-192/i.test(h))) {
        push({
            check: 'icons',
            severity: 'high',
            title: 'Brak kanonicznych ikon w <link rel=icon>',
            file: 'document.head'
        });
    }

    // Photos – widoczne img
    const imgs = [...document.querySelectorAll('#app img')];
    const placeholders = imgs.filter((img) => {
        const s = img.currentSrc || img.src || '';
        return /placeholder|picsum|via\.placeholder/i.test(s);
    });
    if (placeholders.length) {
        push({
            check: 'photos',
            severity: 'high',
            title: `Placeholdery zdjęć w UI (${placeholders.length})`,
            file: 'DOM'
        });
    }

    void LOGO;
    void FONTS;
    void FORBIDDEN_COLD_BLUE;

    return findings;
}

export function generateLivingBrandReport({ reason = 'manual' } = {}) {
    const findings = collectLivingBrandFindings();
    const report = buildLivingBrandReport(findings, {
        day: dayStamp(),
        reason,
        generatedAt: new Date().toISOString(),
        extra: { source: 'runtime-dom' }
    });

    lastReport = report;
    try {
        localStorage.setItem(REPORT_KEY, JSON.stringify(report));
        localStorage.setItem(DAY_KEY, report.day);
    } catch {
        /* ignore */
    }

    try {
        document.dispatchEvent(new CustomEvent('rg:living-brand-report', { detail: report }));
    } catch {
        /* ignore */
    }

    console.info(
        `[Living Brand] ${report.status} · ${report.overall}% · findings ${report.summary.findings}`
    );
    return report;
}

export function getLastLivingBrandReport() {
    if (lastReport) return lastReport;
    try {
        const raw = localStorage.getItem(REPORT_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function initLivingBrand() {
    if (initialized) return;
    initialized = true;

    window.__RG_LIVING_BRAND__ = {
        run: () => generateLivingBrandReport({ reason: 'manual' }),
        last: getLastLivingBrandReport,
        findings: collectLivingBrandFindings,
        book: { BRAND_PALETTE, LOGO, FONTS, POLICY },
        export() {
            return getLastLivingBrandReport();
        }
    };

    if (isDevMode()) {
        console.info('[Living Brand] gotowy. __RG_LIVING_BRAND__.run() — codzienny strażnik marki');
    }
}

export default {
    initLivingBrand,
    generateLivingBrandReport,
    getLastLivingBrandReport,
    collectLivingBrandFindings
};
