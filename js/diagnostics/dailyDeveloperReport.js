// js/diagnostics/dailyDeveloperReport.js – ETAP 19A Daily Developer Report
// Warstwa developerska: agregacja raportów. AutoFix=false. Bez wysyłki na produkcji.

import { isDevMode, getLastHealthReport, getHealthState } from './healthMonitor.js';
import { getLearningInsights, getLearningModel } from '../presentation/learningEngine.js';
import { getLastImprovementReport } from './improvementEngine.js';
import { getLastVirtualUserReport } from './virtualUser.js';
import { getLastAdvisorBriefing } from './projectAdvisor.js';

const REPORT_KEY = 'rg_daily_dev_report_v1';
const DAY_KEY = 'rg_daily_dev_report_day_v1';
const EMAIL_DRAFT_KEY = 'rg_daily_dev_email_draft_v1';
/** Opcjonalnie: developer może wkleić adres lokalnie – NIGDY nie hardcodujemy w repo. */
const EMAIL_LS_KEY = 'rg_developer_report_email';

const POLICY = Object.freeze({
    autoFix: false,
    autoModifyCode: false,
    developerOnly: true,
    noProductionEmail: true,
    emailFromEnv: 'DEVELOPER_REPORT_EMAIL'
});

let lastReport = null;
let initialized = false;

function dayStamp(d = new Date()) {
    return d.toISOString().slice(0, 10);
}

function isProductionHost() {
    try {
        const h = location.hostname || '';
        if (!h || h === 'localhost' || h === '127.0.0.1') return false;
        // Netlify / produkcja – nie przygotowuj wysyłki
        if (h.endsWith('.netlify.app') || h.includes('regionalergeschmack')) return true;
        return !(h === 'localhost' || h === '127.0.0.1');
    } catch {
        return true;
    }
}

function clamp(n) {
    return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Pure aggregator – używany też w testach poprzez kopiowanie logiki w CLI.
 */
export function buildDailyDeveloperReport(input = {}) {
    const health = input.health || null;
    const healthState = input.healthState || null;
    const learning = input.learning || null;
    const model = input.model || null;
    const improve = input.improve || null;
    const virtual = input.virtual || null;
    const advisor = input.advisor || null;
    const guardian = input.guardian || null;

    const hScores = health?.scores || {};
    const gScores = guardian?.scores || {};
    const vu = virtual?.summary || {};
    const vuBy = vu.byType || {};

    const sections = {
        healthMonitor: {
            overall: health?.overall ?? null,
            scores: hScores,
            findings: (health?.findings || []).slice(0, 12),
            runtime: health?.runtime || null,
            jsErrors: healthState?.jsErrors?.length ?? health?.runtime?.jsErrors ?? 0
        },
        aiGuardian: guardian
            ? {
                reportId: guardian.reportId || guardian.id || null,
                scores: gScores,
                findingCount: (guardian.findings || []).length,
                topFindings: (guardian.findings || []).slice(0, 8).map((f) => ({
                    severity: f.severity,
                    title: f.title,
                    files: f.files
                })),
                available: true
            }
            : {
                available: false,
                note: 'Uruchom lokalnie: npm run guardian — raport w tools/ai-guardian/reports/'
            },
        improvementEngine: {
            total: improve?.summary?.total ?? (improve?.proposals || []).length,
            byPriority: improve?.summary?.byPriority || null,
            proposals: (improve?.proposals || []).slice(0, 10).map((p) => ({
                id: p.id,
                priority: p.priority,
                impact: p.impact,
                file: p.file,
                function: p.function,
                risk: p.risk,
                title: p.title,
                proposedFix: p.proposedFix
            }))
        },
        virtualUser: {
            score: vu.score ?? null,
            passed: vu.passed ?? null,
            failed: vu.failed ?? null,
            avgFps: vu.avgFps ?? null,
            memoryLeak: vu.memoryLeak ?? false,
            byType: vuBy,
            issues: (virtual?.issues || []).slice(0, 15)
        },
        learningEngine: {
            signalCount: learning?.signalCount ?? model?.signalCount ?? 0,
            affinity: learning?.affinity || model?.affinity || null,
            anonymous: true,
            network: false
        },
        projectAdvisor: {
            headline: advisor?.headline || null,
            questions: (advisor?.questions || []).map((q) => ({
                question: q.question,
                answer: q.answer,
                confidence: q.confidence
            }))
        }
    };

    const checklist = {
        jsErrors: {
            ok: (sections.healthMonitor.jsErrors || 0) === 0 && !(vuBy.error > 0),
            detail: `Health JS: ${sections.healthMonitor.jsErrors || 0}; VU errors: ${vuBy.error || 0}`
        },
        ux: {
            ok: (hScores.ux ?? 100) >= 85,
            detail: `Health UX ${hScores.ux ?? '—'}%; Guardian UX ${gScores.ux ?? '—'}`
        },
        mobile: {
            ok: (hScores.mobile ?? 100) >= 85 && !(vuBy.touch > 0),
            detail: `Health Mobile ${hScores.mobile ?? '—'}%; VU touch issues: ${vuBy.touch || 0}`
        },
        css: {
            ok: !(health?.findings || []).some((f) => f.area === 'css'),
            detail: (health?.findings || []).filter((f) => f.area === 'css').map((f) => f.title).join('; ') || 'brak findingów CSS'
        },
        translations: {
            ok: (hScores.translation ?? 100) >= 95 && !(vuBy.translation > 0),
            detail: `Health Translation ${hScores.translation ?? '—'}%`
        },
        performance: {
            ok: (hScores.performance ?? 100) >= 85,
            detail: `Health Performance ${hScores.performance ?? '—'}%; avgRenderMs ${health?.runtime?.avgRenderMs ?? '—'}`
        },
        fps: {
            ok: !(vuBy.fps > 0) && (vu.avgFps == null || vu.avgFps >= 30),
            detail: `VU avgFps ${vu.avgFps ?? '—'}; fps issues ${vuBy.fps || 0}`
        },
        memory: {
            ok: (hScores.memory ?? 100) >= 85 && !vu.memoryLeak,
            detail: `Health Memory ${hScores.memory ?? '—'}%; leak flag ${vu.memoryLeak ? 'yes' : 'no'}`
        },
        pwa: {
            ok: (hScores.pwa ?? 100) >= 90,
            detail: `Health PWA ${hScores.pwa ?? '—'}%; Guardian PWA ${gScores.pwa ?? '—'}`
        },
        cache: {
            ok: !(health?.findings || []).some((f) => f.area === 'cache' || f.area === 'pwa'),
            detail: health?.runtime?.cache
                ? JSON.stringify(health.runtime.cache)
                : 'zob. Health / SW'
        },
        images: {
            ok: !(health?.findings || []).some((f) => f.area === 'images')
                && !(health?.static?.assets?.missingProduct?.length),
            detail: (() => {
                const imgFindings = (health?.findings || []).filter((f) => f.area === 'images').map((f) => f.title);
                const missing = health?.static?.assets?.missingProduct?.length || 0;
                if (imgFindings.length) return imgFindings.join('; ');
                if (missing) return `brakujące product images: ${missing}`;
                return 'OK / brak sygnałów';
            })()
        },
        producerData: {
            ok: (hScores.dataQuality ?? 100) >= 90,
            detail: `Data Quality ${hScores.dataQuality ?? '—'}%; issues ${health?.static?.producers?.issueCount ?? '—'}`
        },
        improvements: {
            ok: (sections.improvementEngine.total || 0) < 8,
            detail: `${sections.improvementEngine.total || 0} propozycji (autoApply=false)`
        }
    };

    // Ocena aplikacji (0–100)
    const parts = [
        health?.overall,
        hScores.performance,
        hScores.ux,
        hScores.mobile,
        hScores.memory,
        hScores.pwa,
        hScores.translation,
        hScores.dataQuality,
        vu.score,
        gScores.productionReady != null ? gScores.productionReady * 10 : null
    ].filter((n) => typeof n === 'number');

    const appScore = parts.length
        ? clamp(parts.reduce((a, b) => a + b, 0) / parts.length)
        : null;

    const failedChecks = Object.entries(checklist).filter(([, v]) => !v.ok).map(([k]) => k);

    return {
        id: `daily-dev-${dayStamp()}-${Date.now().toString(36)}`,
        title: 'Daily Developer Report',
        generatedAt: new Date().toISOString(),
        day: dayStamp(),
        policy: { ...POLICY },
        appScore,
        checklist,
        failedChecks,
        sections,
        suggestions: (improve?.proposals || []).slice(0, 8).map((p) => ({
            priority: p.priority,
            title: p.title,
            file: p.file,
            function: p.function,
            proposedFix: p.proposedFix
        })),
        advisorHeadline: advisor?.headline || null,
        exportHint: 'Dysk: npm run daily-report · E-mail (dev): DEVELOPER_REPORT_EMAIL w .env'
    };
}

export function getLastDailyDeveloperReport() {
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
        localStorage.setItem(DAY_KEY, report.day);
    } catch {
        /* ignore */
    }
}

/**
 * Przygotuj treść e-maila. Adres TYLKO z localStorage (opcjonalnie wklejony przez dev)
 * lub null – pełna wysyłka z adresem tylko przez CLI + DEVELOPER_REPORT_EMAIL.
 * NIGDY nie wysyła na produkcji / zwykłym użytkownikom.
 */
export function prepareDeveloperEmailDraft(report = getLastDailyDeveloperReport()) {
    if (!report) return null;
    if (!isDevMode() || isProductionHost()) {
        return {
            prepared: false,
            reason: 'blocked: not developer mode or production host',
            to: null,
            autoSend: false
        };
    }

    let to = null;
    try {
        const ls = localStorage.getItem(EMAIL_LS_KEY);
        if (ls && ls.includes('@')) to = ls.trim();
    } catch {
        /* ignore */
    }

    const subject = `[RG Daily] ${report.day} · score ${report.appScore ?? '—'}%`;
    const lines = [
        report.title,
        `Dzień: ${report.day}`,
        `Ocena aplikacji: ${report.appScore ?? '—'}%`,
        `AutoFix: false`,
        '',
        'Failed checks: ' + (report.failedChecks?.join(', ') || 'brak'),
        '',
        '— Health —',
        `Overall: ${report.sections?.healthMonitor?.overall ?? '—'}`,
        `JS errors: ${report.sections?.healthMonitor?.jsErrors ?? 0}`,
        '',
        '— Virtual User —',
        `Score: ${report.sections?.virtualUser?.score ?? '—'} FPS: ${report.sections?.virtualUser?.avgFps ?? '—'}`,
        '',
        '— Improvement —',
        `Proposals: ${report.sections?.improvementEngine?.total ?? 0}`,
        ...(report.suggestions || []).slice(0, 5).map((s) => `• [${s.priority}] ${s.title}`),
        '',
        '— Advisor —',
        report.advisorHeadline || '—',
        '',
        'Pełny JSON w załączniku / docs/daily/ (CLI: npm run daily-report).',
        'Adres odbiorcy na CLI: zmienna środowiskowa DEVELOPER_REPORT_EMAIL (nie w kodzie).'
    ];
    const body = lines.join('\n');

    const draft = {
        prepared: true,
        autoSend: false,
        to,
        toSource: to ? 'localStorage(rg_developer_report_email)' : 'unset – użyj CLI + DEVELOPER_REPORT_EMAIL',
        subject,
        body,
        mailto: to
            ? `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.slice(0, 1800))}`
            : null,
        policy: { ...POLICY }
    };

    try {
        localStorage.setItem(EMAIL_DRAFT_KEY, JSON.stringify(draft));
    } catch {
        /* ignore */
    }

    return draft;
}

export function generateDailyDeveloperReport({ reason = 'manual', guardian = null } = {}) {
    if (!isDevMode()) {
        console.info('[Daily Developer Report] pominięto – nie tryb developerski');
        return null;
    }

    const report = buildDailyDeveloperReport({
        health: getLastHealthReport(),
        healthState: getHealthState(),
        learning: getLearningInsights(),
        model: getLearningModel(),
        improve: getLastImprovementReport(),
        virtual: getLastVirtualUserReport(),
        advisor: getLastAdvisorBriefing(),
        guardian
    });
    report.reason = reason;
    persist(report);

    const email = prepareDeveloperEmailDraft(report);
    report.emailDraft = {
        prepared: Boolean(email?.prepared),
        hasRecipient: Boolean(email?.to),
        autoSend: false
    };

    console.info(
        `[Daily Developer Report] score ${report.appScore ?? '—'}% · failed: ${(report.failedChecks || []).join(', ') || 'none'}`
    );

    try {
        document.dispatchEvent(new CustomEvent('rg:daily-dev-report', { detail: report }));
    } catch {
        /* ignore */
    }

    return report;
}

export function maybeGenerateDailyDeveloperReport() {
    if (!isDevMode()) return null;
    try {
        const today = dayStamp();
        if (localStorage.getItem(DAY_KEY) === today && getLastDailyDeveloperReport()) {
            return getLastDailyDeveloperReport();
        }
    } catch {
        /* continue */
    }
    return generateDailyDeveloperReport({ reason: 'daily' });
}

export function initDailyDeveloperReport() {
    if (initialized) return;
    initialized = true;

    window.__RG_DAILY__ = {
        run: () => generateDailyDeveloperReport({ reason: 'manual' }),
        daily: () => maybeGenerateDailyDeveloperReport(),
        last: getLastDailyDeveloperReport,
        prepareEmail: () => prepareDeveloperEmailDraft(),
        policy: { ...POLICY },
        /** Tylko lokalnie – wklej adres; nie commituj. Alternatywa: CLI + DEVELOPER_REPORT_EMAIL */
        setEmailLocal(email) {
            if (!isDevMode() || isProductionHost()) return 'blocked';
            if (!email || !String(email).includes('@')) {
                localStorage.removeItem(EMAIL_LS_KEY);
                return 'cleared';
            }
            localStorage.setItem(EMAIL_LS_KEY, String(email).trim());
            return 'ok – lokalnie, nie w kodzie';
        },
        export() {
            return getLastDailyDeveloperReport();
        }
    };

    if (isDevMode()) {
        window.setTimeout(() => {
            maybeGenerateDailyDeveloperReport();
        }, 5200);
        console.info('[Daily Developer Report] dev-only · autoFix=false · __RG_DAILY__.run()');
    }
}

export { POLICY };

export default {
    initDailyDeveloperReport,
    generateDailyDeveloperReport,
    maybeGenerateDailyDeveloperReport,
    getLastDailyDeveloperReport,
    buildDailyDeveloperReport,
    prepareDeveloperEmailDraft,
    POLICY
};
