/**
 * ETAP 27 – AI Product Director (runtime)
 * Codzienny mózg produktu. advisoryOnly · autoFix: false
 */

import { isDevMode, getLastHealthReport } from './healthMonitor.js';
import { getLastImprovementReport } from './improvementEngine.js';
import { getLastVirtualUserReport } from './virtualUser.js';
import { getLastAdvisorBriefing } from './projectAdvisor.js';
import { getLastEmotionReport } from './emotionAi.js';
import { getLastLivingBrandReport } from './livingBrand.js';
import { getLastRealUserReport } from './realUserSimulation.js';
import { getLastDailyDeveloperReport } from './dailyDeveloperReport.js';
import { getLearningInsights } from '../presentation/learningEngine.js';
import {
    buildProductDirectorBriefing,
    POLICY,
    DIRECTOR_QUESTIONS
} from './productDirectorCore.js';

const REPORT_KEY = 'rg_product_director_v1';
const DAY_KEY = 'rg_product_director_day_v1';
const HISTORY_KEY = 'rg_product_director_history_v1';

let lastBriefing = null;
let initialized = false;

function dayStamp() {
    return new Date().toISOString().slice(0, 10);
}

function loadHistory() {
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveHistory(entry) {
    try {
        const hist = loadHistory().filter((h) => h.day !== entry.day);
        hist.push(entry);
        hist.sort((a, b) => a.day.localeCompare(b.day));
        // trzymaj ~90 dni
        const trimmed = hist.slice(-90);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    } catch {
        /* ignore */
    }
}

function findBaseline(hist, daysAgo) {
    if (!hist.length) return null;
    const target = new Date();
    target.setUTCDate(target.getUTCDate() - daysAgo);
    const targetDay = target.toISOString().slice(0, 10);
    // najbliższy ≤ targetDay
    const older = hist.filter((h) => h.day <= targetDay && h.productScore != null);
    if (older.length) return older[older.length - 1];
    // najstarszy dostępny jako „tydzień / early”
    const withScore = hist.filter((h) => h.productScore != null);
    return withScore[0] || null;
}

function gatherInput() {
    const hist = loadHistory();
    const monthBaseline = findBaseline(hist, 30);
    const weekBaseline = findBaseline(hist, 7);
    return {
        health: getLastHealthReport(),
        improve: getLastImprovementReport(),
        virtual: getLastVirtualUserReport(),
        advisor: getLastAdvisorBriefing(),
        emotion: getLastEmotionReport(),
        livingBrand: getLastLivingBrandReport(),
        realUsers: getLastRealUserReport(),
        daily: getLastDailyDeveloperReport(),
        learning: getLearningInsights?.() || null,
        qualityLoop: null,
        monthBaseline: monthBaseline?.day
            ? { day: monthBaseline.day, productScore: monthBaseline.productScore }
            : null,
        weekBaseline: weekBaseline?.day
            ? { day: weekBaseline.day, productScore: weekBaseline.productScore }
            : null
    };
}

export function generateProductDirectorBriefing({ reason = 'manual' } = {}) {
    const input = gatherInput();
    const briefing = buildProductDirectorBriefing(input);
    briefing.id = `director-${briefing.day}-${Date.now().toString(36)}`;
    briefing.reason = reason;
    briefing.policy = { ...POLICY };

    lastBriefing = briefing;
    try {
        localStorage.setItem(REPORT_KEY, JSON.stringify(briefing));
        localStorage.setItem(DAY_KEY, briefing.day);
        if (typeof briefing.productScore === 'number') {
            saveHistory({
                day: briefing.day,
                productScore: briefing.productScore,
                emotionReturn: briefing.summary?.emotionReturn ?? null,
                livingBrand: briefing.summary?.livingBrand ?? null
            });
        }
    } catch {
        /* ignore */
    }

    try {
        document.dispatchEvent(new CustomEvent('rg:product-director', { detail: briefing }));
    } catch {
        /* ignore */
    }

    console.info(
        `[Product Director] ${briefing.headline} · score ${briefing.productScore ?? '—'}%`
    );
    return briefing;
}

export function getLastProductDirectorBriefing() {
    if (lastBriefing) return lastBriefing;
    try {
        const raw = localStorage.getItem(REPORT_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function initProductDirector() {
    if (initialized) return;
    initialized = true;

    window.__RG_DIRECTOR__ = {
        run: () => generateProductDirectorBriefing({ reason: 'manual' }),
        last: getLastProductDirectorBriefing,
        questions: () => DIRECTOR_QUESTIONS,
        history: loadHistory,
        export() {
            return getLastProductDirectorBriefing();
        }
    };

    // raz dziennie w dev
    if (isDevMode()) {
        try {
            if (localStorage.getItem(DAY_KEY) !== dayStamp()) {
                window.setTimeout(() => {
                    generateProductDirectorBriefing({ reason: 'daily-auto' });
                }, 4200);
            }
        } catch {
            /* ignore */
        }
        console.info('[Product Director] gotowy. __RG_DIRECTOR__.run() — mózg produktu');
    }
}

export default {
    initProductDirector,
    generateProductDirectorBriefing,
    getLastProductDirectorBriefing
};
