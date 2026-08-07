/**
 * Inteligentna Diagnoza — proaktywny audyt zdrowia aplikacji (Developer Vault).
 * autoApply=false · tylko raport · bez auto-napraw.
 */

import {
    addHealingReportEntry,
    getHealingReport,
    getSelfHealingLog,
    HEALING_STATUS
} from '../core/selfHealingLogger.js';
import { getStorageHealth } from './memoryCleaner.js';

export const SWEEP_REPORT_TAG = 'AUDIT';
export const SWEEP_COMPONENT = 'Inteligentna Diagnoza';

/** @typedef {'ok'|'warn'|'fail'} SweepLevel */

/**
 * @typedef {object} SweepCheck
 * @property {string} id
 * @property {string} area
 * @property {SweepLevel} level
 * @property {string} message
 */

export const SWEEP_LEVEL_ICON = Object.freeze({
    ok: '✅',
    warn: '🟡',
    fail: '🔴'
});

const FETCH_TIMEOUT_MS = 9000;
const CRITICAL_I18N_PATHS = Object.freeze([
    'nav.home',
    'nav.map',
    'nav.favorites',
    'menu.home',
    'menu.map',
    'profile.title',
    'a11y.menu',
    'a11y.close'
]);

const UI_SELECTORS = Object.freeze([
    { id: 'header', selector: '#mainHeader', label: 'Nagłówek' },
    { id: 'menuBtn', selector: '#menuBtn', label: 'Przycisk menu' },
    { id: 'search', selector: '#headerSearchInput', label: 'Pole wyszukiwania' },
    { id: 'map', selector: '#map', label: 'Mapa' }
]);

/**
 * @param {string} url
 * @param {RequestInit} [options]
 * @param {number} [ms]
 */
async function fetchWithTimeout(url, options = {}, ms = FETCH_TIMEOUT_MS) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    try {
        return await fetch(url, { cache: 'no-store', ...options, signal: ctrl.signal });
    } finally {
        clearTimeout(timer);
    }
}

/**
 * @returns {Promise<{ OVERPASS_URL?: string }>}
 */
async function loadSweepConfig() {
    try {
        const mod = await import('../config.js');
        return mod.CONFIG || mod.default || mod;
    } catch {
        try {
            const mod = await import('../config.example.js');
            return mod.CONFIG || mod.default || mod;
        } catch {
            return { OVERPASS_URL: 'https://overpass-api.de/api/interpreter' };
        }
    }
}

/**
 * @param {SweepLevel} a
 * @param {SweepLevel} b
 * @returns {SweepLevel}
 */
export function worstSweepLevel(a, b) {
    const rank = { fail: 3, warn: 2, ok: 1 };
    return (rank[a] || 0) >= (rank[b] || 0) ? a : b;
}

/**
 * @param {SweepCheck[]} checks
 * @returns {import('../core/selfHealingLogger.js').HealingStatus}
 */
export function resolveSweepOverallStatus(checks) {
    let level = 'ok';
    for (const check of checks || []) {
        level = worstSweepLevel(level, check.level);
    }
    if (level === 'fail') return HEALING_STATUS.FAILED;
    if (level === 'warn') return HEALING_STATUS.SUGGESTION;
    return HEALING_STATUS.FIXED;
}

/**
 * @param {SweepCheck} check
 * @returns {string}
 */
export function formatSweepCheckLine(check) {
    const icon = SWEEP_LEVEL_ICON[check.level] || '•';
    return `${icon} ${check.area}: ${check.message}`;
}

/**
 * @param {SweepCheck[]} checks
 * @returns {string}
 */
export function formatSweepSummaryDescription(checks) {
    return (checks || []).map(formatSweepCheckLine).join('\n');
}

/**
 * @param {string} path
 * @param {object} root
 * @returns {*}
 */
function resolvePath(root, path) {
    return String(path || '').split('.').reduce(
        (acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined),
        root
    );
}

function parseColorToRgb(color) {
    const s = String(color || '').trim();
    if (!s) return null;
    const rgbMatch = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (rgbMatch) {
        return [Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3])];
    }
    const hex = s.match(/^#([0-9a-f]{3,8})$/i);
    if (!hex) return null;
    let h = hex[1];
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h.slice(0, 6), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function relativeLuminance([r, g, b]) {
    const channel = (v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(fgRgb, bgRgb) {
    const L1 = relativeLuminance(fgRgb);
    const L2 = relativeLuminance(bgRgb);
    const lighter = Math.max(L1, L2);
    const darker = Math.min(L1, L2);
    return (lighter + 0.05) / (darker + 0.05);
}

function isElementVisible(el) {
    if (!el || typeof getComputedStyle !== 'function') return false;
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) {
        return false;
    }
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}

/**
 * @returns {Promise<SweepCheck>}
 */
export async function checkNetworkConnectivity() {
    const cfg = await loadSweepConfig();
    const overpassUrl = String(cfg.OVERPASS_URL || 'https://overpass-api.de/api/interpreter');
    const parts = [];

    try {
        const q = '[out:json][timeout:15];node(1);out;';
        const res = await fetchWithTimeout(`${overpassUrl}?data=${encodeURIComponent(q)}`);
        if (res.ok) {
            parts.push('Overpass OK');
        } else {
            return {
                id: 'network',
                area: 'Sieć',
                level: 'fail',
                message: `Połączenie z Overpass: błąd HTTP ${res.status}`
            };
        }
    } catch {
        return {
            id: 'network',
            area: 'Sieć',
            level: 'fail',
            message: 'Połączenie z Overpass: brak odpowiedzi'
        };
    }

    try {
        const mmUrl = 'https://api.mymemory.translated.net/get?q=hello&langpair=en|de';
        const res = await fetchWithTimeout(mmUrl);
        if (res.ok) {
            parts.push('MyMemory OK');
        } else {
            parts.push(`MyMemory HTTP ${res.status}`);
        }
    } catch {
        parts.push('MyMemory niedostępne');
    }

    let adsenseState = 'brak skryptu';
    if (typeof document !== 'undefined') {
        const hasScript = Boolean(
            document.querySelector('[data-rg-adsense]')
            || document.querySelector('script[src*="pagead2.googlesyndication.com"]')
        );
        if (hasScript) {
            try {
                await fetchWithTimeout(
                    'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
                    { mode: 'no-cors' },
                    6000
                );
                adsenseState = 'OK';
            } catch {
                adsenseState = 'skrypt obecny, sieć niepotwierdzona';
            }
        }
    }

    parts.push(`AdSense ${adsenseState}`);

    const hasFail = parts.some((p) => /HTTP|niedostępne|brak odpowiedzi/i.test(p));
    const hasWarn = parts.some((p) => /niepotwierdzona|HTTP [45]/.test(p));

    return {
        id: 'network',
        area: 'Sieć',
        level: hasFail ? 'fail' : (hasWarn || adsenseState !== 'OK' ? 'warn' : 'ok'),
        message: parts.join(' · ')
    };
}

/**
 * @returns {Promise<SweepCheck>}
 */
export async function checkCacheHealth() {
    try {
        const health = await getStorageHealth();
        const pressure = health.estimate?.quota
            ? health.estimate.usage / Math.max(health.estimate.quota, 1)
            : 0;

        if (pressure > 0.92) {
            return {
                id: 'cache',
                area: 'Cache',
                level: 'fail',
                message: `localStorage przepełniony (${Math.round(pressure * 100)}% limitu)`
            };
        }

        if (health.toDelete > 0 || health.health < 65 || health.staleCaches > 0) {
            return {
                id: 'cache',
                area: 'Cache',
                level: 'warn',
                message: `wymaga czyszczenia (${health.toDelete} wpisów · health ${health.health}%)`
            };
        }

        return {
            id: 'cache',
            area: 'Cache',
            level: 'ok',
            message: `OK (health ${health.health}% · ${health.localStorage?.keys || 0} kluczy LS)`
        };
    } catch {
        return {
            id: 'cache',
            area: 'Cache',
            level: 'warn',
            message: 'nie udało się ocenić pamięci podręcznej'
        };
    }
}

/**
 * @returns {Promise<SweepCheck>}
 */
export async function checkProducersRegistry() {
    try {
        const { getContentProducers } = await import('../data/contentProducers.js');
        const producers = getContentProducers();
        const count = producers.length;

        if (count === 0) {
            return {
                id: 'data',
                area: 'Dane',
                level: 'warn',
                message: 'rejestr producentów pusty'
            };
        }

        const ids = producers.map((p) => String(p.id));
        const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
        if (dupes.length) {
            return {
                id: 'data',
                area: 'Dane',
                level: 'fail',
                message: `wykryto duplikaty ID (${dupes.slice(0, 3).join(', ')})`
            };
        }

        const incomplete = producers.filter((p) =>
            !p.name?.trim() || !Number.isFinite(p.lat) || !Number.isFinite(p.lng)
        ).length;

        if (incomplete > 0) {
            return {
                id: 'data',
                area: 'Dane',
                level: 'warn',
                message: `${incomplete} producentów z niepełnymi danymi (${count} łącznie)`
            };
        }

        return {
            id: 'data',
            area: 'Dane',
            level: 'ok',
            message: `rejestr producentów OK (${count} wpisów, bez duplikatów)`
        };
    } catch {
        return {
            id: 'data',
            area: 'Dane',
            level: 'fail',
            message: 'nie udało się wczytać rejestru producentów'
        };
    }
}

/**
 * @returns {Promise<SweepCheck>}
 */
export async function checkPwaHealth() {
    const issues = [];
    let level = 'ok';

    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        try {
            const reg = await navigator.serviceWorker.getRegistration('/');
            if (!reg) {
                issues.push('Service Worker niezarejestrowany');
                level = 'warn';
            } else if (!navigator.serviceWorker.controller && reg.installing) {
                issues.push('SW w trakcie instalacji');
                level = worstSweepLevel(level, 'warn');
            } else {
                issues.push('Service Worker OK');
            }
        } catch {
            issues.push('Service Worker: błąd odczytu');
            level = 'warn';
        }
    } else {
        issues.push('Service Worker niedostępny');
        level = 'warn';
    }

    try {
        const res = await fetchWithTimeout('/manifest.json', {}, 6000);
        if (!res.ok) {
            issues.push(`manifest HTTP ${res.status}`);
            level = worstSweepLevel(level, 'fail');
        } else {
            const manifest = await res.json();
            if (!manifest?.name || !Array.isArray(manifest.icons) || manifest.icons.length < 1) {
                issues.push('manifest niekompletny');
                level = worstSweepLevel(level, 'warn');
            } else {
                issues.push('manifest OK');
            }
        }
    } catch {
        issues.push('manifest niedostępny');
        level = worstSweepLevel(level, 'fail');
    }

    return {
        id: 'pwa',
        area: 'PWA',
        level,
        message: issues.join(' · ')
    };
}

/**
 * @returns {Promise<SweepCheck>}
 */
export async function checkUiUxElements() {
    if (typeof document === 'undefined') {
        return { id: 'ui', area: 'UI/UX', level: 'warn', message: 'brak DOM — pominięto skan UI' };
    }

    const missing = [];
    for (const item of UI_SELECTORS) {
        const el = document.querySelector(item.selector);
        if (!isElementVisible(el)) missing.push(item.label);
    }

    let contrastNote = '';
    const header = document.querySelector('#mainHeader');
    if (header) {
        const style = getComputedStyle(header);
        const fg = parseColorToRgb(style.color);
        const bg = parseColorToRgb(style.backgroundColor);
        if (fg && bg) {
            const ratio = contrastRatio(fg, bg);
            contrastNote = `kontrast nagłówka ${ratio.toFixed(1)}:1`;
            if (ratio < 4.5) {
                return {
                    id: 'ui',
                    area: 'UI/UX',
                    level: 'warn',
                    message: `niski kontrast nagłówka (${ratio.toFixed(1)}:1)`
                };
            }
        }
    }

    if (missing.length) {
        return {
            id: 'ui',
            area: 'UI/UX',
            level: missing.includes('Mapa') ? 'warn' : 'fail',
            message: `niewidoczne: ${missing.join(', ')}`
        };
    }

    return {
        id: 'ui',
        area: 'UI/UX',
        level: 'ok',
        message: contrastNote ? `elementy widoczne · ${contrastNote}` : 'elementy kluczowe widoczne'
    };
}

/**
 * @returns {Promise<SweepCheck>}
 */
export async function checkSelfHealingStack() {
    try {
        const report = getHealingReport();
        const log = getSelfHealingLog();
        const failedRecent = (report.entries || []).filter((e) => e.status === HEALING_STATUS.FAILED).length;
        const logErrors = (log.entries || []).filter((e) =>
            e.type === 'error' || e.type === 'error-fixed'
        ).length;

        const { listSafeMitigations } = await import('../core/selfHealingFixer.js');
        const mitigations = listSafeMitigations?.() || [];

        if (failedRecent > 0) {
            return {
                id: 'selfhealing',
                area: 'Self-Healing',
                level: 'fail',
                message: `${failedRecent} błędów FAILED w raporcie · logger aktywny`
            };
        }

        if (logErrors > 5) {
            return {
                id: 'selfhealing',
                area: 'Self-Healing',
                level: 'warn',
                message: `${logErrors} wpisów błędów w logu · ${mitigations.length} mitigacji`
            };
        }

        return {
            id: 'selfhealing',
            area: 'Self-Healing',
            level: 'ok',
            message: `logger i fixer aktywne · ${mitigations.length} mitigacji · brak krytycznych błędów`
        };
    } catch {
        return {
            id: 'selfhealing',
            area: 'Self-Healing',
            level: 'warn',
            message: 'nie udało się odczytać stanu logger/fixer'
        };
    }
}

/**
 * @returns {Promise<SweepCheck>}
 */
export async function checkPerformanceSignals() {
    const notes = [];
    let level = 'ok';

    if (typeof performance !== 'undefined' && performance.memory) {
        const mem = performance.memory;
        const ratio = mem.usedJSHeapSize / Math.max(mem.jsHeapSizeLimit, 1);
        notes.push(`pamięć JS ${Math.round(ratio * 100)}%`);
        if (ratio > 0.85) level = 'fail';
        else if (ratio > 0.65) level = 'warn';
    } else {
        notes.push('pamięć JS niedostępna');
    }

    if (typeof document !== 'undefined') {
        const mapEl = document.querySelector('#map');
        if (mapEl && isElementVisible(mapEl)) {
            notes.push('mapa załadowana');
            if (typeof globalThis.L !== 'undefined') {
                notes.push('Leaflet OK');
            } else {
                notes.push('Leaflet oczekuje');
                level = worstSweepLevel(level, 'warn');
            }
        } else {
            notes.push('mapa niewidoczna (poza widokiem)');
        }
    }

    const navEntry = performance?.getEntriesByType?.('navigation')?.[0];
    if (navEntry?.loadEventEnd && navEntry.loadEventEnd > 6000) {
        level = worstSweepLevel(level, 'warn');
        notes.push(`ładowanie ${Math.round(navEntry.loadEventEnd)} ms`);
    }

    return {
        id: 'performance',
        area: 'Wydajność',
        level,
        message: notes.join(' · ') || 'OK'
    };
}

/**
 * @returns {Promise<SweepCheck>}
 */
export async function checkTranslationKeys() {
    try {
        const { TRANSLATIONS, SUPPORTED_LANGUAGE_CODES } = await import('../translations.js');
        const missing = [];

        for (const lang of SUPPORTED_LANGUAGE_CODES) {
            const bundle = TRANSLATIONS[lang];
            if (!bundle) {
                missing.push(`${lang}:*`);
                continue;
            }
            for (const path of CRITICAL_I18N_PATHS) {
                const val = resolvePath(bundle, path);
                if (val === undefined || val === null || String(val).trim() === '') {
                    missing.push(`${lang}:${path}`);
                }
            }
        }

        if (missing.length > 8) {
            return {
                id: 'i18n',
                area: 'Tłumaczenia',
                level: 'fail',
                message: `brak ${missing.length} kluczy (${missing.slice(0, 2).join(', ')}…)`
            };
        }

        if (missing.length > 0) {
            return {
                id: 'i18n',
                area: 'Tłumaczenia',
                level: 'warn',
                message: `brakuje ${missing.length} kluczy (${missing.slice(0, 3).join(', ')})`
            };
        }

        return {
            id: 'i18n',
            area: 'Tłumaczenia',
            level: 'ok',
            message: `klucze DE/EN/PL kompletne (${CRITICAL_I18N_PATHS.length} ścieżek)`
        };
    } catch {
        return {
            id: 'i18n',
            area: 'Tłumaczenia',
            level: 'warn',
            message: 'nie udało się zweryfikować tłumaczeń'
        };
    }
}

/**
 * @param {object} [options]
 * @returns {Promise<{ checks: SweepCheck[], overallStatus: string, summary: string, durationMs: number }>}
 */
export async function runDiagnosticSweep(options = {}) {
    const started = Date.now();
    const runners = [
        checkNetworkConnectivity,
        checkCacheHealth,
        checkProducersRegistry,
        checkPwaHealth,
        checkUiUxElements,
        checkSelfHealingStack,
        checkPerformanceSignals,
        checkTranslationKeys
    ];

    const results = await Promise.all(runners.map(async (fn) => {
        try {
            return await fn();
        } catch (err) {
            return {
                id: fn.name || 'check',
                area: 'Audyt',
                level: 'warn',
                message: String(err?.message || 'błąd kontroli').slice(0, 120)
            };
        }
    }));

    const checks = results.filter(Boolean);
    const overallStatus = resolveSweepOverallStatus(checks);
    const summary = formatSweepSummaryDescription(checks);

    return {
        checks,
        overallStatus,
        summary,
        durationMs: Date.now() - started,
        reason: options.reason || 'dev-vault'
    };
}

/**
 * Zapisuje wynik audytu w healingReport (etykieta [AUDIT]).
 * @param {{ checks: SweepCheck[], overallStatus: string, summary: string, durationMs?: number }} result
 * @returns {string|null}
 */
export function persistDiagnosticSweepReport(result) {
    if (!result?.checks?.length) return null;

    const status = result.overallStatus || resolveSweepOverallStatus(result.checks);
    const headline = `[AUDIT] ${SWEEP_COMPONENT} · ${result.checks.length} kontroli · ${result.durationMs || 0} ms`;

    return addHealingReportEntry({
        status,
        component: SWEEP_COMPONENT,
        description: result.summary || formatSweepSummaryDescription(result.checks),
        reportTag: SWEEP_REPORT_TAG,
        auditChecks: result.checks,
        auditHeadline: headline
    });
}

export default {
    runDiagnosticSweep,
    persistDiagnosticSweepReport,
    resolveSweepOverallStatus,
    formatSweepSummaryDescription
};
