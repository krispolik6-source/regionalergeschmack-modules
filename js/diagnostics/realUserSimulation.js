/**
 * ETAP 24 – Real User Simulation
 * 50 person × pełna podróż po aplikacji. Opt-in. autoFix: false.
 *
 * ?realusers=1  ·  __RG_REAL_USERS__.run()  ·  __RG_REAL_USERS__.run({ ids: [1,7,9] })
 */

import { navigateTo, navigateToCategory, getCurrentView } from '../controllers/navigation.js';
import { eventBus } from '../core/eventBus.js';
import { EVENTS } from '../core/events.js';
import { setDarkMode, isDarkMode, setAppLanguage, getSettings } from '../core/settings.js';
import { openProducerModal, closeProducerModal, isProducerModalOpen } from '../views/producerModal.js?v=7';
import { addFavorite, removeFavorite, isFavorite } from '../views/favorites.js';
import { addToCart, getCartCount } from '../views/cart.js';
import { getProducers } from '../data/dataService.js';
import { isDevMode } from './healthMonitor.js';
import {
    PERSONAS,
    JOURNEY_STEPS,
    evaluatePersona,
    getPersonaById,
    networkDelayMs
} from './realUserPersonas.js';

const FLAG = 'rg_real_users';
const REPORT_KEY = 'rg_real_user_sim_report_v1';
const STYLE_ID = 'rg-real-user-persona-style';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let initialized = false;
let running = false;
let lastReport = null;

function wantsAutoRun() {
    try {
        if (localStorage.getItem(FLAG) === '1') return true;
        const q = new URLSearchParams(location.search);
        return q.get('realusers') === '1' || q.get('rus') === '1';
    } catch {
        return false;
    }
}

function pickProducer() {
    const list = getProducers().filter((p) => p?.id && p.category !== 'other');
    return list[0] || getProducers()[0] || null;
}

function removePersonaChrome() {
    document.getElementById(STYLE_ID)?.remove();
    document.body.classList.remove(
        'rg-real-user-running',
        'rg-persona-active',
        'rg-persona-novice',
        'rg-persona-colorblind',
        'rg-persona-no-colorful',
        'rg-persona-large-text',
        'rg-persona-reduce-motion'
    );
    document.documentElement.style.removeProperty('--rg-persona-font-scale');
}

function applyPersonaChrome(persona) {
    removePersonaChrome();
    document.body.classList.add('rg-real-user-running', 'rg-persona-active');
    if (persona.traits.includes('novice')) document.body.classList.add('rg-persona-novice');
    if (persona.a11y.colorVision !== 'normal') document.body.classList.add('rg-persona-colorblind');
    if (!persona.themes.colorful) document.body.classList.add('rg-persona-no-colorful');
    if (persona.a11y.fontScale >= 1.25) document.body.classList.add('rg-persona-large-text');
    if (persona.a11y.reducedMotion) document.body.classList.add('rg-persona-reduce-motion');

    document.documentElement.style.setProperty('--rg-persona-font-scale', String(persona.a11y.fontScale));

    const filters = [];
    if (persona.a11y.colorVision === 'deuteranopia') {
        filters.push('url(#rg-deuteranopia) saturate(0.85)');
    } else if (persona.a11y.colorVision === 'protanopia') {
        filters.push('grayscale(0.35) sepia(0.15)');
    }
    if (persona.traits.includes('glare')) filters.push('contrast(1.15) brightness(1.05)');

    const css = `
#${STYLE_ID}-mark { display:none }
body.rg-persona-large-text #app { font-size: calc(100% * var(--rg-persona-font-scale, 1)); }
body.rg-persona-reduce-motion *, body.rg-persona-reduce-motion *::before, body.rg-persona-reduce-motion *::after {
  animation-duration: 0.01ms !important; transition-duration: 0.01ms !important;
}
body.rg-persona-no-colorful .season-theme, body.rg-persona-no-colorful .climate-layer {
  opacity: 0.15 !important; filter: grayscale(1) !important;
}
${filters.length ? `body.rg-persona-active #app { filter: ${filters.join(' ')}; }` : ''}
`.trim();

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);

    // SVG filter for deuteranopia approximation
    if (persona.a11y.colorVision === 'deuteranopia' && !document.getElementById('rg-colorblind-svg')) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.id = 'rg-colorblind-svg';
        svg.setAttribute('aria-hidden', 'true');
        svg.style.cssText = 'position:absolute;width:0;height:0';
        svg.innerHTML = `<filter id="rg-deuteranopia"><feColorMatrix type="matrix" values="
          0.625 0.375 0 0 0
          0.7 0.3 0 0 0
          0 0.3 0.7 0 0
          0 0 0 1 0"/></filter>`;
        document.body.appendChild(svg);
    }
}

function scanPersonaTouch(persona, push, step) {
    const min = persona.a11y.minTouchPx || 44;
    if ((window.innerWidth || 400) > 900) return;
    let small = 0;
    document.querySelectorAll('button, a.nav-item, [role="button"], .map-bottom-btn').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && (r.height < min || r.width < min)) small += 1;
    });
    if (small > 0) {
        push({
            type: 'touch',
            severity: small > 4 ? 'high' : 'medium',
            step,
            title: `Cele < ${min}px (${small}) — ${persona.code}`,
            detail: persona.tagline
        });
    }
}

function scanPersonaResponsive(persona, push, step) {
    const w = window.innerWidth || 390;
    const issues = [];
    document.querySelectorAll('#app, .view, main').forEach((el) => {
        if (el.scrollWidth > w + 8) issues.push('horizontal-overflow');
    });
    if (persona.device.width <= 375 && issues.length) {
        push({
            type: 'responsive',
            severity: 'medium',
            step,
            title: `Overflow na małym ekranie (${persona.device.model})`,
            detail: issues.join(', ')
        });
    }
}

function scanPersonaI18n(persona, push, step) {
    if (persona.language !== 'en' && persona.language !== 'pl') return;
    const bad = [];
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        const text = (el.textContent || '').trim();
        if (key && (text === key || /^[a-z]+(\.[a-zA-Z0-9_]+)+$/.test(text))) bad.push(key);
    });
    if (bad.length) {
        push({
            type: 'translation',
            severity: 'high',
            step,
            title: `i18n luk (${persona.language})`,
            detail: [...new Set(bad)].slice(0, 8).join(', ')
        });
    }
}

async function runPersonaJourney(persona, { live = true } = {}) {
    const issues = [];
    const push = (issue) => {
        issues.push({
            ...issue,
            personaId: persona.id,
            persona: persona.code,
            at: Date.now()
        });
    };
    const stepLog = [];
    const delay = () => sleep(networkDelayMs(persona.network) + (persona.traits.includes('slow') ? 200 : 0));

    const prevLang = getSettings()?.language || 'de';
    const prevDark = isDarkMode();
    const producer = pickProducer();
    const producerId = producer?.id ? String(producer.id) : null;

    if (live) {
        applyPersonaChrome(persona);
        try {
            if (persona.language === 'en' || persona.language === 'de' || persona.language === 'pl') {
                setAppLanguage(persona.language === 'pl' ? 'de' : persona.language);
                // pl: app may fall back — note if unsupported
                if (persona.language === 'pl' && (getSettings()?.language || 'de') !== 'pl') {
                    push({
                        type: 'translation',
                        severity: 'medium',
                        step: 'language',
                        title: 'Język PL niedostępny w settings',
                        detail: 'Turysta PL — rozważ pełne pl lub EN fallback'
                    });
                }
            }
            if (persona.themes.preferDark === true) setDarkMode(true);
            if (persona.themes.preferDark === false) setDarkMode(false);
        } catch (e) {
            push({
                type: 'error',
                severity: 'medium',
                step: 'open-app',
                title: 'Nie udało się ustawić środowiska persony',
                detail: String(e?.message || e).slice(0, 160)
            });
        }
    }

    const runStep = async (step, fn) => {
        stepLog.push({ step, status: 'running' });
        try {
            await fn();
            await delay();
            if (live) {
                scanPersonaTouch(persona, push, step);
                scanPersonaResponsive(persona, push, step);
                scanPersonaI18n(persona, push, step);
            }
            stepLog[stepLog.length - 1].status = 'ok';
        } catch (err) {
            stepLog[stepLog.length - 1].status = 'fail';
            push({
                type: 'error',
                severity: 'high',
                step,
                title: `Krok nieudany: ${step}`,
                detail: String(err?.message || err).slice(0, 200)
            });
        }
    };

    if (!live) {
        // tylko heurystyka
        const heuristic = evaluatePersona(persona);
        return {
            ...heuristic,
            mode: 'heuristic',
            durationMs: 0
        };
    }

    await runStep('open-app', async () => {
        navigateTo('home', { force: true });
        await sleep(200);
    });
    await runStep('home', async () => {
        if (getCurrentView() !== 'home') throw new Error('nie na home');
    });
    await runStep('search', async () => {
        eventBus.emit(EVENTS.SEARCH_PRODUCTS, { query: 'brot', navigate: true });
        await sleep(250);
        const input = document.getElementById('homeSearchInput');
        if (input) {
            input.value = persona.language === 'en' ? 'cheese' : 'käse';
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
    await runStep('map', async () => {
        navigateTo('map', { force: true });
        await sleep(400);
        if (!persona.traits.includes('no-gps')) {
            eventBus.emit(EVENTS.LOCATION_UPDATED, {
                lat: 49.01,
                lng: 12.1,
                source: 'real-user-sim'
            });
        }
    });
    await runStep('filters', async () => {
        navigateToCategory('bakery');
        await sleep(250);
        navigateTo('map', { filter: 'all', force: true });
    });
    await runStep('producer-modal', async () => {
        if (!producerId) throw new Error('brak producenta');
        openProducerModal(producerId, producer);
        await sleep(350);
        if (!isProducerModalOpen()) throw new Error('modal nieotwarty');
        closeProducerModal({ force: true });
    });
    await runStep('favorites', async () => {
        if (!producerId) return;
        const was = isFavorite(producerId);
        if (!was) addFavorite(producerId);
        navigateTo('favorites', { force: true });
        await sleep(250);
        if (!was) removeFavorite(producerId);
    });
    await runStep('cart', async () => {
        if (producerId) {
            addToCart({
                id: `rus-${persona.id}-${producerId}`,
                producerId,
                name: `RUS ${persona.code}`,
                price: 1
            });
        }
        navigateTo('cart', { force: true });
        await sleep(200);
        getCartCount();
    });
    await runStep('profile', async () => {
        navigateTo('profile', { force: true });
        await sleep(200);
    });
    await runStep('premium', async () => {
        navigateTo('premium', { force: true });
        await sleep(200);
    });
    await runStep('language', async () => {
        const next = prevLang === 'en' ? 'de' : 'en';
        setAppLanguage(next);
        await sleep(200);
        setAppLanguage(persona.language === 'en' ? 'en' : prevLang);
    });
    await runStep('theme', async () => {
        setDarkMode(!isDarkMode());
        await sleep(150);
        setDarkMode(persona.themes.preferDark === true ? true : prevDark);
    });
    await runStep('offline', async () => {
        window.dispatchEvent(new Event('offline'));
        await sleep(200);
        navigateTo('home', { force: true });
        window.dispatchEvent(new Event('online'));
    });
    await runStep('back-home', async () => {
        navigateTo('home', { force: true });
        await sleep(150);
    });

    // restore
    try {
        setAppLanguage(prevLang);
        setDarkMode(prevDark);
    } catch {
        /* ignore */
    }
    removePersonaChrome();

    const heuristic = evaluatePersona(persona);
    const liveHigh = issues.filter((i) => i.severity === 'high').length;
    const liveMed = issues.filter((i) => i.severity === 'medium').length;
    const liveLow = issues.filter((i) => i.severity === 'low').length;
    const failedSteps = stepLog.filter((s) => s.status === 'fail').length;
    const score = Math.max(
        0,
        Math.min(
            100,
            Math.round((heuristic.score * 0.45) + (100 - failedSteps * 14 - liveHigh * 8 - liveMed * 4 - liveLow * 2) * 0.55)
        )
    );

    return {
        persona: heuristic.persona,
        score,
        status: score >= 85 ? 'pass' : score >= 70 ? 'warn' : 'fail',
        mode: 'live',
        steps: stepLog.map((s) => {
            const h = heuristic.steps.find((x) => x.step === s.step);
            return {
                step: s.step,
                status: s.status === 'fail' ? 'fail' : (h?.status || s.status),
                frictions: h?.frictions || []
            };
        }),
        issues: [...heuristic.issues, ...issues],
        summary: {
            high: liveHigh + heuristic.summary.high,
            medium: liveMed + heuristic.summary.medium,
            low: liveLow + heuristic.summary.low,
            stepCount: JOURNEY_STEPS.length,
            failedSteps
        }
    };
}

/**
 * Uruchom symulację N person (domyślnie wszystkie 50).
 * mode: 'live' | 'heuristic' | 'hybrid' (live dla ids, heuristic reszta — tu live wszystkich lub subset)
 */
export async function runRealUserSimulation({
    reason = 'manual',
    ids = null,
    mode = 'live',
    onProgress = null
} = {}) {
    if (running) {
        console.warn('[Real Users] już trwa');
        return lastReport;
    }

    const list = ids?.length
        ? ids.map((id) => getPersonaById(id)).filter(Boolean)
        : [...PERSONAS];

    if (!list.length) {
        console.warn('[Real Users] brak person');
        return null;
    }

    running = true;
    const startedAt = Date.now();
    const results = [];

    console.info(`[Real Users] start · ${list.length} person · mode=${mode}`);

    try {
        for (let i = 0; i < list.length; i += 1) {
            const persona = list[i];
            onProgress?.({ index: i, total: list.length, persona });
            console.info(`[Real Users] ${i + 1}/${list.length} ${persona.code} ${persona.name}`);
            const result = await runPersonaJourney(persona, { live: mode !== 'heuristic' });
            results.push(result);
            // krótka przerwa między personami
            await sleep(mode === 'heuristic' ? 0 : 120);
        }
    } finally {
        removePersonaChrome();
        running = false;
    }

    const scores = results.map((r) => r.score);
    const avg = scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
    const pass = results.filter((r) => r.status === 'pass').length;
    const warn = results.filter((r) => r.status === 'warn').length;
    const fail = results.filter((r) => r.status === 'fail').length;

    const allIssues = results.flatMap((r) => r.issues || []);
    const byPersona = results
        .map((r) => ({
            code: r.persona.code,
            name: r.persona.name,
            tagline: r.persona.tagline,
            score: r.score,
            status: r.status,
            high: r.summary?.high ?? 0
        }))
        .sort((a, b) => a.score - b.score);

    const worst = byPersona.slice(0, 10);
    const best = [...byPersona].sort((a, b) => b.score - a.score).slice(0, 5);

    const report = {
        id: `real-users-${new Date().toISOString().replace(/[:.]/g, '-')}`,
        title: 'Real User Simulation – 50 person',
        generatedAt: new Date().toISOString(),
        reason,
        durationMs: Date.now() - startedAt,
        policy: {
            architectureUnchanged: true,
            autoFix: false,
            optIn: true,
            requiresHumanAcceptance: true
        },
        summary: {
            personas: results.length,
            journeySteps: JOURNEY_STEPS.length,
            avgScore: avg,
            pass,
            warn,
            fail,
            issueCount: allIssues.length,
            mode
        },
        worst,
        best,
        personas: results,
        issues: allIssues.slice(0, 200),
        catalogSize: PERSONAS.length
    };

    lastReport = report;
    try {
        localStorage.setItem(REPORT_KEY, JSON.stringify(report));
    } catch {
        /* ignore quota */
    }

    console.info(
        `[Real Users] done · avg ${avg}% · pass ${pass} · warn ${warn} · fail ${fail}`
    );

    try {
        document.dispatchEvent(new CustomEvent('rg:real-user-sim-report', { detail: report }));
    } catch {
        /* ignore */
    }

    return report;
}

export function getLastRealUserReport() {
    if (lastReport) return lastReport;
    try {
        const raw = localStorage.getItem(REPORT_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function listRealUserPersonas() {
    return PERSONAS.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        tagline: p.tagline,
        role: p.role,
        device: p.device.model,
        network: p.network
    }));
}

export function initRealUserSimulation() {
    if (initialized) return;
    initialized = true;

    window.__RG_REAL_USERS__ = {
        run: (opts) => runRealUserSimulation(typeof opts === 'object' ? opts : {}),
        runOne: (id) => runRealUserSimulation({ ids: [id], reason: 'single' }),
        heuristic: () => runRealUserSimulation({ mode: 'heuristic', reason: 'heuristic' }),
        last: getLastRealUserReport,
        list: listRealUserPersonas,
        personas: PERSONAS,
        enable() {
            localStorage.setItem(FLAG, '1');
            return 'Real Users auto-run ON – reload';
        },
        disable() {
            localStorage.removeItem(FLAG);
            return 'Real Users auto-run OFF';
        },
        export() {
            return getLastRealUserReport();
        }
    };

    if (wantsAutoRun()) {
        window.setTimeout(() => {
            // auto: najpierw heuristic wszystkich, live tylko top-risk? — pełny live 50 jest długi
            // Domyślnie live wszystkich (opt-in świadomy)
            runRealUserSimulation({ reason: 'auto' }).catch((e) => {
                console.warn('[Real Users] auto fail', e);
            });
        }, 3200);
    } else if (isDevMode()) {
        console.info(
            '[Real Users] gotowy. __RG_REAL_USERS__.run() · ?realusers=1 · .heuristic() · .runOne(7)'
        );
    }
}

export default {
    initRealUserSimulation,
    runRealUserSimulation,
    getLastRealUserReport,
    listRealUserPersonas
};
