// js/diagnostics/weeklyPremiumReport.js – ETAP 19C Weekly Premium Report
// Raz w tygodniu. AutoFix = false. Nie zmienia architektury.

import { isDevMode, getLastHealthReport, getHealthState } from './healthMonitor.js';
import { getLearningInsights, getLearningModel } from '../presentation/learningEngine.js';
import { getLastImprovementReport } from './improvementEngine.js';
import { getLastVirtualUserReport } from './virtualUser.js';
import { getLastAdvisorBriefing } from './projectAdvisor.js';
import { getLastDailyDeveloperReport } from './dailyDeveloperReport.js';

const REPORT_KEY = 'rg_weekly_premium_report_v1';
const WEEK_KEY = 'rg_weekly_premium_week_v1';
const ARCHIVE_KEY = 'rg_weekly_premium_archive_v1';
const MAX_ARCHIVE = 12;

const POLICY = Object.freeze({
    autoFix: false,
    autoModifyCode: false,
    cadence: 'weekly',
    advisoryOnly: true
});

const QUESTIONS = Object.freeze([
    { id: 'improved', question: 'Co poprawiono?' },
    { id: 'worsened', question: 'Co pogorszyło się?' },
    { id: 'newProblems', question: 'Jakie nowe problemy wykryto?' },
    { id: 'fragileFiles', question: 'Jakie pliki są najbardziej awaryjne?' },
    { id: 'ux', question: 'Jak poprawić UX?' },
    { id: 'mobile', question: 'Jak poprawić Mobile?' },
    { id: 'appearance', question: 'Jak poprawić wygląd?' },
    { id: 'performance', question: 'Jak poprawić wydajność?' },
    { id: 'growth', question: 'Jak zwiększyć liczbę użytkowników?' },
    { id: 'retention', question: 'Jak zwiększyć retencję?' }
]);

let lastReport = null;
let initialized = false;

/** ISO week key: 2026-W30 */
export function weekStamp(d = new Date()) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function readArchive() {
    try {
        const raw = localStorage.getItem(ARCHIVE_KEY);
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
    } catch {
        return [];
    }
}

function readDashHistory() {
    try {
        const raw = localStorage.getItem('rg_dev_dashboard_history_v1');
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
    } catch {
        return [];
    }
}

function readImproveHistory() {
    try {
        const raw = localStorage.getItem('rg_improvement_history_v1');
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
    } catch {
        return [];
    }
}

function rankFiles(improve, daily, virtual) {
    const bag = {};
    const bump = (file, w) => {
        if (!file) return;
        bag[file] = (bag[file] || 0) + w;
    };
    for (const p of improve?.proposals || []) {
        const w = p.priority === 'critical' ? 5 : p.priority === 'high' ? 3 : p.priority === 'medium' ? 2 : 1;
        bump(p.file, w);
    }
    for (const f of daily?.sections?.aiGuardian?.topFindings || []) {
        const w = f.severity === 'critical' || f.severity === 'high' ? 3 : 1;
        for (const file of f.files || []) bump(file, w);
    }
    for (const issue of virtual?.issues || []) {
        if (issue.where && String(issue.where).endsWith('.js')) bump(issue.where, 2);
    }
    return Object.entries(bag)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([file, weight]) => ({ file, weight }));
}

function buildTop20(improve, health, virtual, daily) {
    const items = [];
    for (const p of improve?.proposals || []) {
        items.push({
            source: 'improvement',
            priority: p.priority || 'medium',
            title: p.title,
            file: p.file,
            function: p.function,
            proposedFix: p.proposedFix,
            impact: p.impact,
            risk: p.risk
        });
    }
    for (const f of health?.findings || []) {
        items.push({
            source: 'health',
            priority: f.severity === 'high' ? 'high' : 'medium',
            title: f.title,
            file: f.area === 'css' ? 'css/style.css' : 'js/app.js',
            function: f.area || 'n/a',
            proposedFix: f.detail || 'Przejrzyj finding Health i popraw ręcznie.',
            impact: f.severity === 'high' ? 'high' : 'medium',
            risk: 'low'
        });
    }
    for (const i of virtual?.issues || []) {
        items.push({
            source: 'virtual-user',
            priority: i.severity || 'medium',
            title: i.title,
            file: i.where || 'runtime',
            function: i.scenario || 'scenario',
            proposedFix: i.detail || 'Napraw ścieżkę Virtual User.',
            impact: i.severity === 'high' ? 'high' : 'medium',
            risk: 'medium'
        });
    }
    for (const c of daily?.failedChecks || []) {
        items.push({
            source: 'daily',
            priority: 'medium',
            title: `Checklist fail: ${c}`,
            file: 'docs/daily/latest.json',
            function: c,
            proposedFix: `Zamknij punkt checklisty „${c}” w Daily Developer Report.`,
            impact: 'medium',
            risk: 'low'
        });
    }

    const rank = { critical: 0, high: 1, medium: 2, low: 3 };
    const seen = new Set();
    const unique = [];
    for (const it of items.sort((a, b) => (rank[a.priority] ?? 4) - (rank[b.priority] ?? 4))) {
        const key = `${it.title}|${it.file}`;
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push(it);
        if (unique.length >= 20) break;
    }
    return unique.map((it, idx) => ({ rank: idx + 1, autoApply: false, ...it }));
}

/**
 * Pure builder tygodniowego raportu Premium.
 */
export function buildWeeklyPremiumReport(input = {}) {
    const health = input.health || null;
    const improve = input.improve || null;
    const virtual = input.virtual || null;
    const learning = input.learning || null;
    const model = input.model || null;
    const advisor = input.advisor || null;
    const daily = input.daily || null;
    const history = input.history || [];
    const improveHistory = input.improveHistory || [];
    const archive = input.archive || [];
    const week = input.week || weekStamp();

    const hScores = health?.scores || {};
    const prevWeek = archive[0] || null;
    const histSorted = [...history].sort((a, b) => String(a.day).localeCompare(String(b.day)));
    const oldest = histSorted[0];
    const newest = histSorted[histSorted.length - 1];

    const delta = (a, b) => {
        if (typeof a !== 'number' || typeof b !== 'number') return null;
        return Math.round((b - a) * 10) / 10;
    };

    const healthDelta = delta(oldest?.health, newest?.health)
        ?? delta(prevWeek?.summary?.healthOverall, health?.overall);
    const scoreDelta = delta(oldest?.appScore, newest?.appScore)
        ?? delta(prevWeek?.summary?.appScore, daily?.appScore);
    const errDelta = delta(oldest?.errors, newest?.errors);

    const improved = [];
    const worsened = [];
    if (healthDelta != null && healthDelta > 0) improved.push(`Zdrowie aplikacji +${healthDelta} pkt (trend historii Dashboard).`);
    if (scoreDelta != null && scoreDelta > 0) improved.push(`Daily/app score +${scoreDelta} pkt.`);
    if (errDelta != null && errDelta < 0) improved.push(`Mniej błędów JS (Δ ${errDelta}).`);
    if ((improveHistory[0]?.total ?? 0) < (improveHistory[1]?.total ?? improveHistory[0]?.total ?? 0)) {
        improved.push('Spadła liczba otwartych propozycji Improvement – część tematów domknięta lub mniej findingów.');
    }
    if ((hScores.translation ?? 100) >= 95) improved.push('Tłumaczenia w dobrym stanie (≥95%).');
    if (!improved.length) {
        improved.push('Brak wyraźnego trendu wzrostowego w historii – utrzymano baseline; zbieraj Dashboard przez kolejne dni.');
    }

    if (healthDelta != null && healthDelta < 0) worsened.push(`Zdrowie aplikacji ${healthDelta} pkt.`);
    if (scoreDelta != null && scoreDelta < 0) worsened.push(`Daily/app score ${scoreDelta} pkt.`);
    if (errDelta != null && errDelta > 0) worsened.push(`Więcej błędów JS (Δ +${errDelta}).`);
    if ((virtual?.summary?.score ?? 100) < 80) worsened.push(`Virtual User score niski (${virtual.summary.score}%).`);
    if ((hScores.ux ?? 100) < 85) worsened.push(`UX Health ${hScores.ux}%.`);
    if ((hScores.mobile ?? 100) < 85) worsened.push(`Mobile Health ${hScores.mobile}%.`);
    if (!worsened.length) worsened.push('Brak silnych regresji w dostępnych sygnałach tygodnia.');

    const prevTitles = new Set((prevWeek?.top20 || []).map((t) => t.title));
    const newProblems = [];
    for (const f of health?.findings || []) {
        if (!prevTitles.has(f.title)) newProblems.push(`[Health] ${f.title}`);
    }
    for (const i of virtual?.issues || []) {
        if (!prevTitles.has(i.title)) newProblems.push(`[VU] ${i.title}`);
    }
    for (const c of daily?.failedChecks || []) {
        newProblems.push(`[Daily] checklist: ${c}`);
    }
    if (!newProblems.length) newProblems.push('Brak nowych problemów względem poprzedniego tygodnia (lub brak archiwum).');

    const fragile = rankFiles(improve, daily, virtual);
    const topCat = learning?.affinity?.topCategories?.[0] || model?.affinity?.topCategories?.[0];
    const peak = learning?.affinity?.peakHours?.[0] || model?.affinity?.peakHours?.[0];
    const topSearch = learning?.affinity?.topSearches?.[0] || model?.affinity?.topSearches?.[0];

    const answers = {
        improved: {
            answer: improved.map((x) => `• ${x}`).join('\n'),
            confidence: histSorted.length >= 2 ? 'medium' : 'low'
        },
        worsened: {
            answer: worsened.map((x) => `• ${x}`).join('\n'),
            confidence: histSorted.length >= 2 ? 'medium' : 'low'
        },
        newProblems: {
            answer: newProblems.slice(0, 10).map((x) => `• ${x}`).join('\n'),
            confidence: 'medium'
        },
        fragileFiles: {
            answer: fragile.length
                ? fragile.slice(0, 8).map((f) => `• \`${f.file}\` (waga ${f.weight})`).join('\n')
                : '• Brak danych o awaryjnych plikach – uruchom Improve + Guardian.',
            confidence: fragile.length ? 'high' : 'low'
        },
        ux: {
            answer: [
                '• Domknij etykiety a11y i czytelne CTA na Home/kartach.',
                '• Skróć ścieżkę Home→Mapa→Modal (Virtual User jako gate).',
                (hScores.ux ?? 100) < 85 ? `• Health UX ${hScores.ux}% – priorytet na tap targets i mniej migania.` : '• Utrzymaj UX ≥85% w Health.',
                advisor?.questions?.find((q) => q.id === 'appearance' || /wygląd|UX/i.test(q.question))?.answer
                    ? '• Zobacz też briefing Doradcy (wygląd/UX).'
                    : null
            ].filter(Boolean).map((x) => x.startsWith('•') ? x : `• ${x}`).join('\n'),
            confidence: 'medium'
        },
        mobile: {
            answer: [
                `• Health Mobile: ${hScores.mobile ?? '—'}%.`,
                '• Min. 44px cele dotykowe; brak horizontal overflow.',
                '• Testuj Virtual User na szerokości ~390px.',
                (virtual?.summary?.byType?.touch || 0) > 0
                    ? `• VU zgłasza problemy touch: ${virtual.summary.byType.touch}.`
                    : '• Brak alarmów touch w ostatnim VU (jeśli uruchomiony).'
            ].map((x) => (x.startsWith('•') ? x : `• ${x}`)).join('\n'),
            confidence: 'medium'
        },
        appearance: {
            answer: [
                '• Spójny rytm zdjęć produktów i mniej szumu nad mapą.',
                '• Uporządkuj konflikty CSS z Health (jeśli są).',
                topCat?.id ? `• Wzmocnij wizualnie kategorię „${topCat.id}” (preferencja Learning).` : '• Personalizuj Home pod lokalne kategorie Learning.',
                '• Dark mode: unikaj migania przy przełączaniu motywu.'
            ].map((x) => `• ${x.replace(/^• /, '')}`).join('\n'),
            confidence: 'medium'
        },
        performance: {
            answer: [
                `• Performance Health: ${hScores.performance ?? '—'}% · render ${health?.runtime?.avgRenderMs ?? '—'} ms.`,
                '• Defer ciężkich sekcji Home; dedupe fetch; czyść markery/listenery mapy.',
                (virtual?.summary?.avgFps != null && virtual.summary.avgFps < 30)
                    ? `• FPS VU niski (${virtual.summary.avgFps}) – batchuj aktualizacje DOM na mapie.`
                    : '• Pilnuj FPS w Virtual User przy mapie.',
                `• Memory Health: ${hScores.memory ?? '—'}%.`
            ].map((x) => (x.startsWith('•') ? x : `• ${x}`)).join('\n'),
            confidence: 'high'
        },
        growth: {
            answer: [
                '• Wzmocnij PWA install + jasną wartość „lokalne smaki w pobliżu” na pierwszym ekranie.',
                '• Udostępnianie tras zakupowych / ulubionych miejsc (lokalnie, bez spamu).',
                '• Landing + SEO lokalne (już w ekosystemie) – spójny CTA do aplikacji.',
                topSearch?.id
                    ? `• Chip szybkiego startu dla frazy „${topSearch.id}” obniża próg pierwszego sukcesu.`
                    : '• Skróć time-to-first-success (lokalizacja → 1 karta producenta).',
                '• Premium trial z jasnymi benefitami (bez ciemnych wzorców).'
            ].map((x) => `• ${x.replace(/^• /, '')}`).join('\n'),
            confidence: 'medium'
        },
        retention: {
            answer: [
                '• Magia powrotu / Taste Advisor / Smaki dnia – ciepły powrót po absencji.',
                topCat?.id ? `• „Dla Ciebie” pod „${topCat.id}” (Learning Engine).` : '• Buduj lokalny model Learning (kategorie, trasy).',
                peak && Number.isFinite(peak.hour)
                    ? `• Impuls treści ~${peak.hour}:00 (szczyt lokalny).`
                    : '• Dopasuj treści do lokalnych godzin aktywności.',
                '• „Wróć do trasy” po zapisaniu trasy zakupowej.',
                '• Cotygodniowy ten raport + Daily → świadome priorytety zamiast chaotycznych zmian.'
            ].map((x) => `• ${x.replace(/^• /, '')}`).join('\n'),
            confidence: learning?.signalCount >= 5 ? 'high' : 'medium'
        }
    };

    const questions = QUESTIONS.map((q) => ({
        id: q.id,
        question: q.question,
        answer: answers[q.id].answer,
        confidence: answers[q.id].confidence
    }));

    const top20 = buildTop20(improve, health, virtual, daily);

    return {
        id: `weekly-premium-${week}`,
        title: 'Weekly Premium Report',
        week,
        generatedAt: new Date().toISOString(),
        policy: { ...POLICY },
        summary: {
            healthOverall: health?.overall ?? null,
            appScore: daily?.appScore ?? null,
            vuScore: virtual?.summary?.score ?? null,
            improveCount: improve?.summary?.total ?? (improve?.proposals || []).length,
            learningSignals: learning?.signalCount ?? model?.signalCount ?? 0,
            healthDelta,
            scoreDelta,
            errDelta,
            advisorHeadline: advisor?.headline || null
        },
        questions,
        fragileFiles: fragile,
        top20,
        exportHint: 'CLI: npm run weekly-premium → docs/premium-weekly/'
    };
}

export function getLastWeeklyPremiumReport() {
    if (lastReport) return lastReport;
    try {
        const raw = localStorage.getItem(REPORT_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function persist(report) {
    lastReport = report;
    try {
        localStorage.setItem(REPORT_KEY, JSON.stringify(report));
        localStorage.setItem(WEEK_KEY, report.week);
        const arch = readArchive().filter((x) => x.week !== report.week);
        arch.unshift({
            week: report.week,
            at: report.generatedAt,
            summary: report.summary,
            top20: (report.top20 || []).slice(0, 20)
        });
        localStorage.setItem(ARCHIVE_KEY, JSON.stringify(arch.slice(0, MAX_ARCHIVE)));
    } catch {
        /* ignore */
    }
}

export function generateWeeklyPremiumReport({ reason = 'manual' } = {}) {
    const report = buildWeeklyPremiumReport({
        health: getLastHealthReport(),
        healthState: getHealthState(),
        improve: getLastImprovementReport(),
        virtual: getLastVirtualUserReport(),
        learning: getLearningInsights(),
        model: getLearningModel(),
        advisor: getLastAdvisorBriefing(),
        daily: getLastDailyDeveloperReport(),
        history: readDashHistory(),
        improveHistory: readImproveHistory(),
        archive: readArchive(),
        week: weekStamp()
    });
    report.reason = reason;
    persist(report);

    if (isDevMode()) {
        console.info(`[Weekly Premium] ${report.week} · Top20=${report.top20.length} · autoFix=false`);
    }

    try {
        document.dispatchEvent(new CustomEvent('rg:weekly-premium-report', { detail: report }));
    } catch {
        /* ignore */
    }

    return report;
}

export function maybeGenerateWeeklyPremiumReport() {
    const week = weekStamp();
    try {
        if (localStorage.getItem(WEEK_KEY) === week && getLastWeeklyPremiumReport()) {
            return getLastWeeklyPremiumReport();
        }
    } catch {
        /* continue */
    }
    return generateWeeklyPremiumReport({ reason: 'weekly' });
}

export function initWeeklyPremiumReport() {
    if (initialized) return;
    initialized = true;

    window.__RG_WEEKLY__ = {
        run: () => generateWeeklyPremiumReport({ reason: 'manual' }),
        weekly: () => maybeGenerateWeeklyPremiumReport(),
        last: getLastWeeklyPremiumReport,
        week: weekStamp,
        policy: { ...POLICY },
        export() {
            return getLastWeeklyPremiumReport();
        }
    };

    // Raz w tygodniu – po Daily/Advisor
    window.setTimeout(() => {
        if (isDevMode()) maybeGenerateWeeklyPremiumReport();
    }, 6500);

    console.info('[Weekly Premium Report] autoFix=false · __RG_WEEKLY__.run() · raz/tydzień');
}

export { QUESTIONS, POLICY };

export default {
    initWeeklyPremiumReport,
    generateWeeklyPremiumReport,
    maybeGenerateWeeklyPremiumReport,
    getLastWeeklyPremiumReport,
    buildWeeklyPremiumReport,
    weekStamp,
    QUESTIONS,
    POLICY
};
