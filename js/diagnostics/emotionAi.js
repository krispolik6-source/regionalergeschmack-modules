/**
 * ETAP 25 – Emotion AI (runtime)
 * Czy aplikacja wywołuje emocje? Czy chce się wrócić?
 * Opt-in / dev. autoFix: false.
 */

import { getCurrentView } from '../controllers/navigation.js';
import { isDevMode, getLastHealthReport } from './healthMonitor.js';
import { getLearningInsights } from '../presentation/learningEngine.js';
import { getLastRealUserReport } from './realUserSimulation.js';
import { evaluateEmotion, POLICY } from './emotionAiCore.js';

const REPORT_KEY = 'rg_emotion_ai_v1';
const DAY_KEY = 'rg_emotion_ai_day_v1';

let lastReport = null;
let initialized = false;

function dayStamp() {
    return new Date().toISOString().slice(0, 10);
}

function warmCopyHit(text) {
    return /region|geschmack|lokal|bauer|hof|frisch|heimat|smak|warm|gold|weizen|ernte|saison/i.test(text);
}

/**
 * Zbiera sygnały emocjonalne z DOM (read-only).
 */
export function collectEmotionSignals() {
    const body = document.body;
    const app = document.getElementById('app') || body;
    const cs = getComputedStyle(document.documentElement);
    const brandGreen = (cs.getPropertyValue('--brand-green') || cs.getPropertyValue('--color-primary') || '').trim();
    const brandGold = (cs.getPropertyValue('--brand-gold') || cs.getPropertyValue('--color-accent') || '').trim();
    const brandCream = (cs.getPropertyValue('--brand-cream') || cs.getPropertyValue('--color-bg') || '').trim();

    const seasonClass = [...body.classList].find((c) => c.startsWith('season-'));
    const season = seasonClass ? seasonClass.replace('season-', '') : null;

    const imgs = [...app.querySelectorAll('img')];
    const placeholderLike = imgs.filter((img) => {
        const src = img.currentSrc || img.src || '';
        return /placeholder|data:image\/svg|via\.placeholder|empty/i.test(src)
            || img.naturalWidth <= 1;
    });

    const visibleText = (app.innerText || '').replace(/\s+/g, ' ').trim();
    const paragraphs = app.querySelectorAll('p, .card-text, .section-desc, li');
    const headings = app.querySelectorAll('h1, h2, h3, .home-greeting-title, .section-title');
    const ctas = app.querySelectorAll(
        'button:not([hidden]), a.btn, .cta, [data-cta], .home-cta, .nav-item'
    );
    const blocks = app.querySelectorAll(
        'section, .card, .home-section, .panel, article, .rg-card'
    );
    const interactive = app.querySelectorAll(
        'button, a, input, select, textarea, [role="button"], .leaflet-marker-icon'
    );

    const greetingEl = app.querySelector(
        '.home-greeting, .home-greeting-title, [data-i18n*="greeting"], .welcome'
    );
    const bodyText = visibleText.slice(0, 2500);

    let softRadius = false;
    try {
        const sample = app.querySelector('button, .card, .nav-item, .home-section');
        if (sample) {
            const r = parseFloat(getComputedStyle(sample).borderRadius) || 0;
            softRadius = r >= 6;
        }
    } catch {
        /* ignore */
    }

    const health = getLastHealthReport();
    const learning = getLearningInsights?.() || null;
    const realUsers = getLastRealUserReport();

    return {
        seasonThemeActive: Boolean(seasonClass),
        climateLayerPresent: Boolean(document.getElementById('climateAtmosphere')),
        climateReady: body.classList.contains('climate-ready'),
        ambientAvailable: typeof window !== 'undefined',
        warmBrandPalette: Boolean(brandGreen && brandGold) || /2a3f28|c9a227|f5efe3/i.test(
            `${brandGreen}${brandGold}${brandCream}`
        ),
        coldBlueDominant: /#(?:0{0,2}[0-4][0-9a-f]{4}|2563eb|3b82f6|1e40af)/i.test(
            `${cs.getPropertyValue('--color-primary')}${document.body.style.backgroundColor || ''}`
        ),
        goldGreenCreamHits: [brandGreen, brandGold, brandCream].filter(Boolean).length
            + (document.querySelector('[class*="brand"], .app-header') ? 2 : 0)
            + (body.classList.contains('climate-ready') ? 1 : 0),
        imageCount: imgs.length,
        imagesWithAlt: imgs.filter((i) => (i.getAttribute('alt') || '').trim().length > 0).length,
        placeholderRatio: imgs.length ? placeholderLike.length / imgs.length : 0.5,
        visibleTextChars: visibleText.length,
        headingCount: headings.length,
        paragraphDensity: paragraphs.length,
        ctaCount: Math.min(ctas.length, 40),
        competingBlocks: blocks.length,
        interactiveCount: interactive.length,
        hasGreeting: Boolean(greetingEl) || /willkommen|welcome|cześć|hallo|guten/i.test(bodyText),
        hasWarmCopy: warmCopyHit(bodyText),
        hasEmptyStateCare: Boolean(
            app.querySelector('.empty-state, [data-empty], .favorites-empty, .cart-empty')
        ) || /noch keine|no favorites|pust/i.test(bodyText),
        softRadius,
        darkModeHarsh: body.classList.contains('dark') && !brandCream,
        activeView: getCurrentView?.() || 'unknown',
        season,
        learningReturnSignals: learning?.signalCount ?? 0,
        realUserAvg: realUsers?.summary?.avgScore ?? null,
        healthUx: health?.scores?.ux ?? null
    };
}

export function generateEmotionReport({ reason = 'manual' } = {}) {
    const signals = collectEmotionSignals();
    const evaluation = evaluateEmotion(signals);

    const report = {
        id: `emotion-${new Date().toISOString().replace(/[:.]/g, '-')}`,
        title: 'Emotion AI – czy aplikacja wywołuje emocje?',
        generatedAt: new Date().toISOString(),
        day: dayStamp(),
        reason,
        policy: { ...POLICY },
        ...evaluation,
        signals,
        overallEmotion: Math.round(
            (evaluation.scores.climate
                + evaluation.scores.colors
                + evaluation.scores.photos
                + evaluation.scores.friendliness) / 4
        )
    };

    lastReport = report;
    try {
        localStorage.setItem(REPORT_KEY, JSON.stringify(report));
        localStorage.setItem(DAY_KEY, report.day);
    } catch {
        /* ignore */
    }

    try {
        document.dispatchEvent(new CustomEvent('rg:emotion-ai-report', { detail: report }));
    } catch {
        /* ignore */
    }

    console.info(
        `[Emotion AI] ${report.wantToReturn.short} · return ${report.wantToReturn.score}% · emotion ${report.overallEmotion}%`
    );

    return report;
}

export function getLastEmotionReport() {
    if (lastReport) return lastReport;
    try {
        const raw = localStorage.getItem(REPORT_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function initEmotionAi() {
    if (initialized) return;
    initialized = true;

    window.__RG_EMOTION__ = {
        run: () => generateEmotionReport({ reason: 'manual' }),
        last: getLastEmotionReport,
        signals: collectEmotionSignals,
        export() {
            return getLastEmotionReport();
        }
    };

    if (isDevMode()) {
        console.info('[Emotion AI] gotowy. __RG_EMOTION__.run() — „Czy chce się wrócić?”');
    }
}

export default {
    initEmotionAi,
    generateEmotionReport,
    getLastEmotionReport,
    collectEmotionSignals
};
