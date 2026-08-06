// js/diagnostics/improvementEngine.js – ETAP 18C Improvement Engine
// Analiza → raport „Co można poprawić”. NIGDY nie zmienia kodu automatycznie.

import { getLastHealthReport, getHealthState, runHealthCheck, isDevMode } from './healthMonitor.js';
import { getLearningInsights, getLearningModel } from '../presentation/learningEngine.js';

const REPORT_KEY = 'rg_improvement_report_v1';
const DAY_KEY = 'rg_improvement_report_day_v1';
const HISTORY_KEY = 'rg_improvement_history_v1';
const MAX_HISTORY = 14;

const POLICY = Object.freeze({
    autoModifyCode: false,
    autoCommit: false,
    autoPublish: false,
    autoApply: false,
    requiresHumanAcceptance: true
});

let lastReport = null;
let initialized = false;

function dayStamp(d = new Date()) {
    return d.toISOString().slice(0, 10);
}

function priorityRank(p) {
    return { critical: 0, high: 1, medium: 2, low: 3 }[p] ?? 4;
}

/**
 * @typedef {object} ImprovementProposal
 * @property {string} id
 * @property {string} title
 * @property {'critical'|'high'|'medium'|'low'} priority
 * @property {'high'|'medium'|'low'} impact
 * @property {string} file
 * @property {string} function
 * @property {'high'|'medium'|'low'} risk
 * @property {string} proposedFix
 * @property {string} source
 * @property {boolean} autoApply
 */

/**
 * Pure: buduje listę propozycji z danych diagnostycznych.
 * @param {{ health?: object|null, healthState?: object|null, learning?: object|null, model?: object|null }} input
 * @returns {ImprovementProposal[]}
 */
export function buildImprovementProposals(input = {}) {
    const health = input.health || null;
    const state = input.healthState || null;
    const learning = input.learning || null;
    const model = input.model || null;
    /** @type {ImprovementProposal[]} */
    const out = [];
    let n = 0;
    const add = (p) => {
        n += 1;
        out.push({
            id: `IMP-${String(n).padStart(3, '0')}`,
            autoApply: false,
            ...p
        });
    };

    const scores = health?.scores || {};
    const findings = health?.findings || [];
    const runtime = health?.runtime || {};

    // ——— Błędy JS ———
    const jsErrors = state?.jsErrors?.length || runtime.jsErrors || 0;
    if (jsErrors > 0) {
        const sample = state?.jsErrors?.[state.jsErrors.length - 1]?.msg || findings.find((f) => f.area === 'js')?.detail || '';
        add({
            title: `Napraw powtarzające się błędy JavaScript (${jsErrors})`,
            priority: jsErrors >= 5 ? 'critical' : 'high',
            impact: 'high',
            file: guessFileFromError(sample) || 'js/app.js',
            function: guessFunctionFromError(sample) || 'bootstrap',
            risk: 'medium',
            proposedFix: 'Zidentyfikuj stack z Health Monitor (jsErrors), dodaj guard na null/undefined i regresyjny test smoke dla ścieżki użytkownika.',
            source: 'errors'
        });
    }

    // ——— Wydajność ———
    if ((scores.performance ?? 100) < 85 || (runtime.avgRenderMs || 0) > 50) {
        add({
            title: 'Skróć czas renderowania / long tasks',
            priority: (scores.performance ?? 100) < 70 ? 'high' : 'medium',
            impact: 'high',
            file: 'js/views/home.js',
            function: 'renderHome',
            risk: 'medium',
            proposedFix: 'Ogranicz ciężkie sekcje przy pierwszym paint (defer Living Region / carousele), unikaj pełnego innerHTML przy małych refreshach.',
            source: 'performance'
        });
    }

    if ((runtime.duplicateFetches || state?.duplicateFetches || 0) > 0) {
        add({
            title: 'Wyeliminuj podwójne requesty sieciowe',
            priority: 'high',
            impact: 'medium',
            file: 'js/data/dataService.js',
            function: 'fetch / loadPlaces',
            risk: 'low',
            proposedFix: 'Wprowadź in-flight dedupe (Map url→Promise) lub krótkie cache dla identycznych GET w oknie 1–2 s.',
            source: 'performance'
        });
    }

    // ——— Pamięć / listenery ———
    if ((scores.memory ?? 100) < 85 || (runtime.listenerAdds || state?.listenerAdds || 0) > 500) {
        const hot = state?.listenerHot?.[0];
        add({
            title: 'Ogranicz ryzyko wycieków listenerów',
            priority: (scores.memory ?? 100) < 70 ? 'high' : 'medium',
            impact: 'high',
            file: hot ? guessFileFromListener(hot[0]) : 'js/controllers/navigation.js',
            function: hot ? `addEventListener(${String(hot[0]).split(':').pop()})` : 'navigateTo',
            risk: 'medium',
            proposedFix: 'Przy zmianie widoku zdejmuj handlery (AbortController / off). Sprawdź hot typy w __RG_HEALTH__.state().listenerHot.',
            source: 'memory'
        });
    }

    if (runtime.memory?.supported && (runtime.memory.usedMB || 0) > 120) {
        add({
            title: `Wysokie zużycie heap (${runtime.memory.usedMB} MB)`,
            priority: 'high',
            impact: 'high',
            file: 'js/views/map.js',
            function: 'replaceMarkers / render',
            risk: 'medium',
            proposedFix: 'Czyść warstwy Leaflet przy filtrach, unikaj trzymania dużych kopii producers w closure; rozważ lazy import ciężkich modułów.',
            source: 'memory'
        });
    }

    // ——— UX / a11y / mobile z health ———
    if ((scores.ux ?? 100) < 85 || (scores.mobile ?? 100) < 85) {
        add({
            title: 'Popraw UX / layout mobilny (tap targets, overflow)',
            priority: 'medium',
            impact: 'high',
            file: 'css/style.css',
            function: '@media (max-width: 480px)',
            risk: 'low',
            proposedFix: 'Ustaw min-height 44px na głównych CTA; sprawdź text-overflow w home-greeting; zweryfikuj findings.mobile w raporcie Health.',
            source: 'ux'
        });
    }

    if ((scores.accessibility ?? 100) < 90) {
        add({
            title: 'Uzupełnij etykiety dostępności kontrolek',
            priority: 'medium',
            impact: 'medium',
            file: 'js/views/home.js',
            function: 'buildVenueCardHtml',
            risk: 'low',
            proposedFix: 'Dodaj aria-label / widoczny tekst do przycisków ikonicznych (ulubione, koszyk, zamknięcie modala).',
            source: 'ux'
        });
    }

    if ((scores.translation ?? 100) < 95) {
        add({
            title: 'Domknij brakujące klucze tłumaczeń',
            priority: 'medium',
            impact: 'medium',
            file: 'js/translations.js',
            function: 'TRANSLATIONS',
            risk: 'low',
            proposedFix: 'Uruchom npm run check:translations i uzupełnij brakujące klucze względem DE.',
            source: 'errors'
        });
    }

    if ((scores.dataQuality ?? 100) < 90) {
        add({
            title: 'Popraw jakość danych / zdjęć producentów',
            priority: 'medium',
            impact: 'medium',
            file: 'js/data/contentProducers.js',
            function: 'CONTENT_PRODUCERS',
            risk: 'low',
            proposedFix: 'Uzupełnij name/lat/lng/category; napraw brakujące assety produktów (npm run check:assets).',
            source: 'errors'
        });
    }

    if ((scores.pwa ?? 100) < 90) {
        add({
            title: 'Wzmocnij PWA / strategię cache',
            priority: 'medium',
            impact: 'medium',
            file: 'sw.js',
            function: 'install / activate / fetch',
            risk: 'medium',
            proposedFix: 'Upewnij się, że Cache API czyści stare nazwy cache; zweryfikuj manifest + rejestrację SW.',
            source: 'performance'
        });
    }

    // Mapowanie findings health → propozycje (jeśli brak duplikatu tematu)
    for (const f of findings.slice(0, 8)) {
        const title = String(f.title || '');
        if (out.some((p) => p.title.includes(title.slice(0, 24)) || title.includes(p.title.slice(0, 24)))) {
            continue;
        }
        add({
            title: title || 'Finding z Health Monitor',
            priority: mapSeverity(f.severity),
            impact: f.severity === 'high' ? 'high' : 'medium',
            file: mapAreaToFile(f.area),
            function: mapAreaToFunction(f.area),
            risk: f.severity === 'high' ? 'medium' : 'low',
            proposedFix: f.detail
                ? `Na podstawie: ${String(f.detail).slice(0, 160)}. Wprowadź poprawkę ręcznie po review.`
                : 'Przejrzyj finding w raporcie Health i napraw ręcznie.',
            source: 'health'
        });
    }

    // ——— Zachowania / Learning ———
    const affinity = learning?.affinity || model?.affinity || {};
    const signalCount = learning?.signalCount ?? model?.signalCount ?? 0;

    if (signalCount < 5) {
        add({
            title: 'Wzmocnij pierwsze sygnały personalizacji (cold start)',
            priority: 'low',
            impact: 'medium',
            file: 'js/presentation/learningEngine.js',
            function: 'initLearningEngine',
            risk: 'low',
            proposedFix: 'Po 1–2 interakcjach (kategoria / wyszukiwanie) odśwież sekcję „Dla Ciebie” bez pełnego reload Home.',
            source: 'behavior'
        });
    }

    const topCat = affinity.topCategories?.[0];
    if (topCat && (topCat.score || 0) >= 4) {
        add({
            title: `Personalizuj Home pod kategorię „${topCat.id}”`,
            priority: 'medium',
            impact: 'high',
            file: 'js/views/home.js',
            function: 'getForYouProducers',
            risk: 'low',
            proposedFix: `Użytkownik lokalnie preferuje „${topCat.id}” – podnieś learningWeight lub wstaw soft-pin pierwszej karty z tej kategorii (bez zmiany API mapy).`,
            source: 'behavior'
        });
    }

    const peak = affinity.peakHours?.[0];
    if (peak && Number.isFinite(peak.hour)) {
        add({
            title: `Dopasuj komunikaty do godziny szczytu (~${peak.hour}:00)`,
            priority: 'low',
            impact: 'medium',
            file: 'js/presentation/tasteAdvisor.js',
            function: 'getTasteAdvisorBriefing',
            risk: 'low',
            proposedFix: 'Użyj lokalnego peakHours z Learning Engine do wariantu copy (poranek/wieczór) – bez wysyłki danych.',
            source: 'behavior'
        });
    }

    const topSearch = affinity.topSearches?.[0];
    if (topSearch?.id) {
        add({
            title: `Skróć ścieżkę do frazy „${topSearch.id}”`,
            priority: 'low',
            impact: 'medium',
            file: 'js/presentation/searchFilter.js',
            function: 'searchGlobalResults',
            risk: 'low',
            proposedFix: 'Pokaż lokalną sugestię (chip) z najczęściej wyszukiwanej frazy na Home – tylko z localStorage Learning.',
            source: 'behavior'
        });
    }

    const screenHome = Number(model?.screens?.home) || 0;
    const screenMap = Number(model?.screens?.map) || 0;
    if (screenMap > 0 && screenHome > screenMap * 4) {
        add({
            title: 'Mapa rzadziej używana vs Home – uprość CTA „w pobliżu”',
            priority: 'low',
            impact: 'medium',
            file: 'js/views/home.js',
            function: 'bindLocationAndNearby / renderHome',
            risk: 'low',
            proposedFix: 'Wzmocnij widoczność przycisku lokalizacji / nearby na Home; rozważ mini-podgląd odległości na kartach.',
            source: 'usage'
        });
    }

    // ——— Domyślne utrzymaniowe (gdy mało sygnałów) ———
    if (out.length < 3) {
        add({
            title: 'Uruchom pełny audyt statyczny przed releasem',
            priority: 'low',
            impact: 'medium',
            file: 'package.json',
            function: 'scripts.check:all / npm run health',
            risk: 'low',
            proposedFix: 'Raz dziennie: npm run health && npm run improve – przejrzyj docs/improvements/latest.md przed mergem.',
            source: 'usage'
        });
    }

    out.sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
    return out;
}

function mapSeverity(s) {
    if (s === 'high' || s === 'critical') return s === 'critical' ? 'critical' : 'high';
    if (s === 'low') return 'low';
    return 'medium';
}

function mapAreaToFile(area) {
    const m = {
        js: 'js/app.js',
        network: 'js/data/dataService.js',
        memory: 'js/controllers/navigation.js',
        images: 'js/presentation/productImage.js',
        i18n: 'js/translations.js',
        data: 'js/data/contentProducers.js',
        mobile: 'css/style.css',
        a11y: 'js/views/home.js',
        css: 'css/style.css',
        pwa: 'sw.js',
        cache: 'sw.js'
    };
    return m[area] || 'js/app.js';
}

function mapAreaToFunction(area) {
    const m = {
        js: 'window.onerror path',
        network: 'fetch',
        memory: 'addEventListener',
        images: 'buildProductImageHtml',
        i18n: 't()',
        data: 'CONTENT_PRODUCERS',
        mobile: 'media queries',
        a11y: 'aria-label',
        css: 'selectors',
        pwa: 'serviceWorker',
        cache: 'caches.open'
    };
    return m[area] || 'n/a';
}

function guessFileFromError(msg) {
    const m = String(msg || '').match(/([\w./-]+\.js)/);
    return m ? m[1].replace(/^\//, '') : '';
}

function guessFunctionFromError(msg) {
    const m = String(msg || '').match(/at\s+(\w+)/);
    return m ? m[1] : '';
}

function guessFileFromListener(key) {
    const k = String(key || '').toLowerCase();
    if (k.includes('map')) return 'js/views/map.js';
    if (k.includes('home')) return 'js/views/home.js';
    if (k.includes('modal')) return 'js/views/producerModal.js';
    return 'js/app.js';
}

export function buildImprovementReport({ health, healthState, learning, model, reason = 'daily' } = {}) {
    const proposals = buildImprovementProposals({ health, healthState, learning, model });
    const byPriority = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const p of proposals) byPriority[p.priority] = (byPriority[p.priority] || 0) + 1;

    return {
        id: `improve-${dayStamp()}-${Date.now().toString(36)}`,
        title: 'Co można poprawić',
        generatedAt: new Date().toISOString(),
        day: dayStamp(),
        reason,
        policy: { ...POLICY },
        summary: {
            total: proposals.length,
            byPriority,
            sources: {
                healthOverall: health?.overall ?? null,
                learningSignals: learning?.signalCount ?? model?.signalCount ?? 0
            }
        },
        proposals,
        exportHint: 'Zapis na dysk: npm run improve (docs/improvements/). Silnik NIE aplikuje zmian.'
    };
}

export function getLastImprovementReport() {
    if (lastReport) return lastReport;
    try {
        const raw = localStorage.getItem(REPORT_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function persistReport(report) {
    lastReport = report;
    try {
        localStorage.setItem(REPORT_KEY, JSON.stringify(report));
        localStorage.setItem(DAY_KEY, report.day);
        const histRaw = localStorage.getItem(HISTORY_KEY);
        const hist = histRaw ? JSON.parse(histRaw) : [];
        const next = [
            { day: report.day, at: report.generatedAt, total: report.summary.total, byPriority: report.summary.byPriority },
            ...(Array.isArray(hist) ? hist : [])
        ].slice(0, MAX_HISTORY);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {
        /* ignore */
    }
}

/**
 * Generuje raport (opcjonalnie wymusza Health Check).
 */
export async function generateImprovementReport({ reason = 'manual', refreshHealth = true } = {}) {
    let health = getLastHealthReport();
    if (refreshHealth) {
        try {
            health = await runHealthCheck({ reason: 'improvement-engine' });
        } catch {
            /* użyj ostatniego */
        }
    }
    const report = buildImprovementReport({
        health,
        healthState: getHealthState(),
        learning: getLearningInsights(),
        model: getLearningModel(),
        reason
    });
    persistReport(report);

    if (isDevMode()) {
        console.info(`[Improvement Engine] ${report.title}: ${report.summary.total} propozycji`, report.summary.byPriority);
    }

    try {
        document.dispatchEvent(new CustomEvent('rg:improvement-report', { detail: report }));
    } catch {
        /* ignore */
    }

    return report;
}

/**
 * Raz dziennie – jeśli brak raportu na dziś.
 */
export async function maybeGenerateDailyImprovementReport() {
    try {
        const today = dayStamp();
        const stored = localStorage.getItem(DAY_KEY);
        if (stored === today && getLastImprovementReport()) {
            return getLastImprovementReport();
        }
    } catch {
        /* continue */
    }
    return generateImprovementReport({ reason: 'daily', refreshHealth: true });
}

export function initImprovementEngine() {
    if (initialized) return;
    initialized = true;

    // Dzienny raport po starcie (po Health / Learning) — tylko dev/LAN
    if (isDevMode()) {
        window.setTimeout(() => {
            maybeGenerateDailyImprovementReport().catch(() => {});
        }, 3200);
    }

    window.__RG_IMPROVE__ = {
        run: () => generateImprovementReport({ reason: 'manual' }),
        daily: () => maybeGenerateDailyImprovementReport(),
        last: getLastImprovementReport,
        policy: { ...POLICY },
        export() {
            return getLastImprovementReport();
        }
    };

    if (isDevMode()) {
        console.info('[Improvement Engine] propozycje only · autoApply=false. Konsola: __RG_IMPROVE__.run()');
    }
}

export default {
    initImprovementEngine,
    generateImprovementReport,
    maybeGenerateDailyImprovementReport,
    getLastImprovementReport,
    buildImprovementProposals,
    buildImprovementReport,
    POLICY
};
