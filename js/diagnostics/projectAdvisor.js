// js/diagnostics/projectAdvisor.js – ETAP 18E Doradca Projektu
// Codzienny briefing produktowy. NIGDY nie naprawia kodu – tylko odpowiada na pytania.

import { getLastHealthReport, isDevMode } from './healthMonitor.js';
import { getLearningInsights, getLearningModel } from '../presentation/learningEngine.js';
import { getLastImprovementReport } from './improvementEngine.js';
import { getLastVirtualUserReport } from './virtualUser.js';

const REPORT_KEY = 'rg_project_advisor_v1';
const DAY_KEY = 'rg_project_advisor_day_v1';

const POLICY = Object.freeze({
    autoFix: false,
    autoModifyCode: false,
    advisoryOnly: true
});

const QUESTIONS = Object.freeze([
    { id: 'improveToday', question: 'Co dziś można ulepszyć?' },
    { id: 'userFriction', question: 'Co najbardziej irytuje użytkowników?' },
    { id: 'weakestScreens', question: 'Które ekrany są najsłabsze?' },
    { id: 'performance', question: 'Jak poprawić wydajność?' },
    { id: 'appearance', question: 'Jak poprawić wygląd?' },
    { id: 'retention', question: 'Jak zwiększyć liczbę powrotów użytkowników?' },
    { id: 'nextVersion', question: 'Co warto dodać w następnej wersji?' }
]);

let lastBriefing = null;
let initialized = false;

function dayStamp(d = new Date()) {
    return d.toISOString().slice(0, 10);
}

function topImprove(improve, n = 3) {
    return (improve?.proposals || []).slice(0, n);
}

function scoreLine(scores = {}) {
    return Object.entries(scores)
        .sort((a, b) => (a[1] ?? 100) - (b[1] ?? 100))
        .slice(0, 3)
        .map(([k, v]) => `${k} ${v}%`);
}

function weakestFromScreens(model) {
    const screens = model?.screens || {};
    const entries = Object.entries(screens).sort((a, b) => (b[1] || 0) - (a[1] || 0));
    // Najsłabsze = mało czasu LUB problemy Virtual/Health na tym widoku
    return entries;
}

/**
 * Pure: buduje odpowiedzi Doradcy na podstawie lokalnych raportów.
 */
export function buildAdvisorBriefing(input = {}) {
    const health = input.health || null;
    const learning = input.learning || null;
    const model = input.model || null;
    const improve = input.improve || null;
    const virtual = input.virtual || null;

    const scores = health?.scores || {};
    const proposals = topImprove(improve, 5);
    const vuIssues = virtual?.issues || [];
    const vuByType = virtual?.summary?.byType || {};
    const affinity = learning?.affinity || model?.affinity || {};
    const signalCount = learning?.signalCount ?? model?.signalCount ?? 0;
    const topCat = affinity.topCategories?.[0];
    const peak = affinity.peakHours?.[0];
    const topSearch = affinity.topSearches?.[0];
    const screenEntries = weakestFromScreens(model);

    const weakScores = scoreLine(scores);
    const highVu = vuIssues.filter((i) => i.severity === 'high').slice(0, 4);
    const failScenes = (virtual?.scenarios || []).filter((s) => s.status === 'fail').map((s) => s.name);

    // ——— Odpowiedzi ———
    const improveToday = (() => {
        if (proposals.length) {
            const lines = proposals.slice(0, 3).map(
                (p) => `• [${p.priority}] ${p.title} → \`${p.file}\` / ${p.function}`
            );
            return {
                answer: `Na dziś warto ruszyć te 3 rzeczy (z Improvement Engine):\n${lines.join('\n')}`,
                confidence: 'high',
                sources: ['improvement', 'health']
            };
        }
        if (weakScores.length) {
            return {
                answer: `Brak świeżych propozycji IMP – najsłabsze obszary Health: ${weakScores.join(', ')}. Uruchom Health Check i Improve.`,
                confidence: 'medium',
                sources: ['health']
            };
        }
        return {
            answer: 'Dziś spokojny dzień diagnostyczny: uruchom Virtual User (?virtual=1) i przejrzyj docs/improvements/ – baza do decyzji na jutro.',
            confidence: 'low',
            sources: ['advisor']
        };
    })();

    const userFriction = (() => {
        const frictions = [];
        if ((vuByType.error || 0) > 0 || highVu.some((i) => i.type === 'error')) {
            frictions.push('błędy JavaScript podczas typowych ścieżek (Virtual User)');
        }
        if ((vuByType.flicker || 0) > 0) frictions.push('miganie UI przy przełączaniu widoków');
        if ((vuByType.touch || 0) > 0 || (scores.mobile ?? 100) < 85) {
            frictions.push('małe cele dotykowe / layout mobilny');
        }
        if ((vuByType.translation || 0) > 0 || (scores.translation ?? 100) < 95) {
            frictions.push('klucze zamiast tekstów (i18n)');
        }
        if ((scores.ux ?? 100) < 80) frictions.push('ogólny UX poniżej 80% w Health');
        if (failScenes.length) frictions.push(`padające scenariusze: ${failScenes.slice(0, 3).join(', ')}`);
        if (!frictions.length && signalCount < 5) {
            frictions.push('za mało lokalnych sygnałów Learning – trudno wskazać irytacje; zbieraj kategorię/wyszukiwania');
        }
        if (!frictions.length) {
            frictions.push('brak silnych sygnałów irytacji – utrzymuj płynność Home→Mapa→Modal (to najczęstsza ścieżka)');
        }
        return {
            answer: `Najbardziej irytujące teraz:\n${frictions.map((f) => `• ${f}`).join('\n')}`,
            confidence: frictions.length >= 2 ? 'high' : 'medium',
            sources: ['virtual-user', 'health', 'learning']
        };
    })();

    const weakestScreens = (() => {
        const ranked = [];
        // Virtual failures map to screens
        for (const name of failScenes) {
            if (name.includes('map') || name.includes('popup') || name.includes('gps')) ranked.push(['map', 3]);
            else if (name.includes('home') || name.includes('search')) ranked.push(['home', 2]);
            else if (name.includes('cart')) ranked.push(['cart', 2]);
            else if (name.includes('favorite')) ranked.push(['favorites', 2]);
            else if (name.includes('premium')) ranked.push(['premium', 2]);
            else if (name.includes('profile')) ranked.push(['profile', 1]);
            else if (name.includes('modal')) ranked.push(['producer-modal', 3]);
        }
        // Low time on map vs home → mapa może być słaba lub omijana
        const homeMs = Number(model?.screens?.home) || 0;
        const mapMs = Number(model?.screens?.map) || 0;
        if (homeMs > 0 && mapMs > 0 && homeMs > mapMs * 4) {
            ranked.push(['map', 2]);
            ranked.push(['home (dominuje – mapa niedostatecznie wciągająca)', 1]);
        }
        if ((scores.mobile ?? 100) < 85) ranked.push(['home/mobile shell', 2]);
        if ((vuByType.fps || 0) > 0) ranked.push(['map (FPS)', 3]);

        const bag = {};
        for (const [k, w] of ranked) bag[k] = (bag[k] || 0) + w;
        let list = Object.entries(bag).sort((a, b) => b[1] - a[1]).map(([k]) => k);

        if (!list.length && screenEntries.length) {
            // najmniej czasu = potencjalnie porzucone
            const least = [...screenEntries].sort((a, b) => (a[1] || 0) - (b[1] || 0)).slice(0, 2);
            list = least.map(([k]) => `${k} (mało czasu spędzonego)`);
        }
        if (!list.length) list = ['brak danych – uruchom Virtual User i korzystaj z aplikacji lokalnie'];

        return {
            answer: `Najsłabsze ekrany / powierzchnie:\n${list.slice(0, 4).map((x) => `• ${x}`).join('\n')}`,
            confidence: list[0]?.includes('brak') ? 'low' : 'medium',
            sources: ['learning', 'virtual-user', 'health']
        };
    })();

    const performance = (() => {
        const tips = [];
        if ((scores.performance ?? 100) < 85 || (health?.runtime?.avgRenderMs || 0) > 50) {
            tips.push('Ogranicz pełny re-render Home (defer sekcje Living Region / karuzele).');
        }
        if ((health?.runtime?.duplicateFetches || 0) > 0) {
            tips.push('Dodaj dedupe in-flight dla identycznych fetch (1–2 s).');
        }
        if ((scores.memory ?? 100) < 85 || (vuByType['memory-leak'] || 0) > 0) {
            tips.push('Czyść markery Leaflet i listenery przy filtrach / zmianie widoku (AbortController).');
        }
        if ((vuByType.fps || 0) > 0) {
            tips.push('Przy mapie unikaj ciężkich mutacji DOM w pętli; batchuj aktualizacje markerów.');
        }
        if ((scores.pwa ?? 100) < 90) {
            tips.push('Uporządkuj strategię cache SW – mniej worku przy starcie = szybszy first paint.');
        }
        if (!tips.length) {
            tips.push('Wydajność wygląda stabilnie. Utrzymaj Virtual User raz dziennie i pilnuj avgRenderMs / duplicateFetches w Health.');
        }
        return {
            answer: `Jak poprawić wydajność:\n${tips.map((t) => `• ${t}`).join('\n')}`,
            confidence: tips.length > 1 ? 'high' : 'medium',
            sources: ['health', 'virtual-user']
        };
    })();

    const appearance = (() => {
        const tips = [];
        if ((scores.ux ?? 100) < 85 || (scores.mobile ?? 100) < 85) {
            tips.push('Dopracuj CTA i odstępy na telefonie (min. 44px, brak overflow nagłówków).');
        }
        if ((vuByType.flicker || 0) > 0) {
            tips.push('Zredukuj miganie: mniej przełączania class/hidden w krótkim czasie przy nawigacji.');
        }
        if ((scores.accessibility ?? 100) < 90) {
            tips.push('Dodaj czytelne etykiety do przycisków ikonicznych – wygląd + a11y idą w parze.');
        }
        const cssFinding = (health?.findings || []).find((f) => f.area === 'css');
        if (cssFinding) {
            tips.push(`Uporządkuj konflikty CSS wskazane w Health: ${String(cssFinding.detail || '').slice(0, 100)}`);
        }
        if (topCat?.id) {
            tips.push(`Wzmocnij wizualnie kategorię „${topCat.id}” na Home (to lokalna preferencja użytkownika).`);
        }
        if (!tips.length) {
            tips.push('Wygląd bez alarmów – jeden świadomy ruch: spójny rytm zdjęć produktów i mniej „szumu” nad mapą.');
        }
        return {
            answer: `Jak poprawić wygląd:\n${tips.map((t) => `• ${t}`).join('\n')}`,
            confidence: 'medium',
            sources: ['health', 'learning', 'virtual-user']
        };
    })();

    const retention = (() => {
        const tips = [];
        tips.push('Magia powrotu / Taste Advisor / Region Soul – pilnuj, by po 2+ dniach absencji był ciepły powrót (już macie fundamenty).');
        if (topCat?.id) {
            tips.push(`Personalizuj „Dla Ciebie” pod „${topCat.id}” (Learning Engine) – rozpoznawalność przy każdym starcie.`);
        }
        if (peak && Number.isFinite(peak.hour)) {
            tips.push(`Lokalny szczyt ~${peak.hour}:00 – wtedy pokaż Smaki dnia / impuls regionu (bez push spam bez zgody).`);
        }
        if (topSearch?.id) {
            tips.push(`Chip szybkiego wyszukiwania „${topSearch.id}” skraca drogę do znanego smaku.`);
        }
        if (signalCount < 8) {
            tips.push('Zbieraj więcej lokalnych sygnałów (kategorie, trasy) – lepsza personalizacja = więcej powodów do powrotu.');
        }
        tips.push('Trasy zakupowe + ulubione: po zapisaniu trasy pokaż jasny „Wróć do trasy” przy następnym wejściu.');
        return {
            answer: `Jak zwiększyć powroty:\n${tips.slice(0, 5).map((t) => `• ${t}`).join('\n')}`,
            confidence: signalCount >= 5 ? 'high' : 'medium',
            sources: ['learning', 'presentation']
        };
    })();

    const nextVersion = (() => {
        const ideas = [];
        if ((scores.dataQuality ?? 100) < 95) {
            ideas.push('Pakiet jakości danych: brakujące zdjęcia / spójność kategorii (Content).');
        }
        if ((vuByType.touch || 0) > 0 || (scores.mobile ?? 100) < 90) {
            ideas.push('Mobile polish sprint – touch targets + responsywność (Virtual User jako gate).');
        }
        ideas.push('Cotygodniowy „raport regionu” na Home (lokalnie generowany z Learning + Living Region).');
        ideas.push('Tryb „szybka lista zakupów” z trasą i ETA – mocny powód do ponownego otwarcia.');
        if (!(virtual?.summary?.score >= 85)) {
            ideas.push('Stabilizacja ścieżki Home→Mapa→Modal do score Virtual User ≥ 85%.');
        }
        ideas.push('Eksport tygodniowego briefingu Doradcy do docs/advisor/ w CI (bez auto-fixów).');
        return {
            answer: `Warto rozważyć w następnej wersji:\n${ideas.slice(0, 5).map((t) => `• ${t}`).join('\n')}`,
            confidence: 'medium',
            sources: ['advisor', 'health', 'virtual-user', 'learning']
        };
    })();

    const answers = {
        improveToday,
        userFriction,
        weakestScreens,
        performance,
        appearance,
        retention,
        nextVersion
    };

    const qa = QUESTIONS.map((q) => ({
        id: q.id,
        question: q.question,
        ...answers[q.id]
    }));

    const headline = proposals[0]?.title
        || highVu[0]?.title
        || weakScores[0]
        || 'Utrzymaj rytm diagnostyczny (Health → Improve → Virtual → Advisor)';

    return {
        id: `advisor-${dayStamp()}-${Date.now().toString(36)}`,
        title: 'Doradca Projektu – briefing dnia',
        generatedAt: new Date().toISOString(),
        day: dayStamp(),
        policy: { ...POLICY },
        headline,
        summary: {
            healthOverall: health?.overall ?? null,
            improveCount: improve?.summary?.total ?? proposals.length,
            virtualScore: virtual?.summary?.score ?? null,
            learningSignals: signalCount,
            topCategory: topCat?.id || null
        },
        questions: qa,
        exportHint: 'Zapis na dysk: npm run advisor (docs/advisor/). Doradca nie zmienia kodu.'
    };
}

export function getLastAdvisorBriefing() {
    if (lastBriefing) return lastBriefing;
    try {
        const raw = localStorage.getItem(REPORT_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function persist(briefing) {
    lastBriefing = briefing;
    try {
        localStorage.setItem(REPORT_KEY, JSON.stringify(briefing));
        localStorage.setItem(DAY_KEY, briefing.day);
    } catch {
        /* ignore */
    }
}

export function generateAdvisorBriefing({ reason = 'manual' } = {}) {
    const briefing = buildAdvisorBriefing({
        health: getLastHealthReport(),
        learning: getLearningInsights(),
        model: getLearningModel(),
        improve: getLastImprovementReport(),
        virtual: getLastVirtualUserReport()
    });
    briefing.reason = reason;
    persist(briefing);

    if (isDevMode()) {
        console.info(`[Doradca Projektu] ${briefing.headline}`);
        for (const q of briefing.questions) {
            console.info(`Q: ${q.question}\n${q.answer}\n`);
        }
    }

    try {
        document.dispatchEvent(new CustomEvent('rg:advisor-briefing', { detail: briefing }));
    } catch {
        /* ignore */
    }

    return briefing;
}

export function maybeGenerateDailyAdvisorBriefing() {
    try {
        const today = dayStamp();
        if (localStorage.getItem(DAY_KEY) === today && getLastAdvisorBriefing()) {
            return getLastAdvisorBriefing();
        }
    } catch {
        /* continue */
    }
    return generateAdvisorBriefing({ reason: 'daily' });
}

export function initProjectAdvisor() {
    if (initialized) return;
    initialized = true;

    window.__RG_ADVISOR__ = {
        run: () => generateAdvisorBriefing({ reason: 'manual' }),
        daily: () => maybeGenerateDailyAdvisorBriefing(),
        last: getLastAdvisorBriefing,
        questions: () => QUESTIONS.slice(),
        policy: { ...POLICY },
        export() {
            return getLastAdvisorBriefing();
        }
    };

    // Po Health / Improve / Learning – dzienny briefing (tylko dev/LAN)
    if (isDevMode()) {
        window.setTimeout(() => {
            maybeGenerateDailyAdvisorBriefing();
        }, 4200);
        console.info('[Doradca Projektu] advisory-only · autoFix=false. Konsola: __RG_ADVISOR__.run()');
    }
}

export { QUESTIONS, POLICY };

export default {
    initProjectAdvisor,
    generateAdvisorBriefing,
    maybeGenerateDailyAdvisorBriefing,
    getLastAdvisorBriefing,
    buildAdvisorBriefing,
    QUESTIONS,
    POLICY
};
