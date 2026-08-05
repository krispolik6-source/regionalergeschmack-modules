// js/diagnostics/virtualUser.js – ETAP 18D Virtual User (Wirtualny Tester)
// Automatyczne scenariusze UI. Nie zmienia architektury. Tylko obserwacja + raport.

import { navigateTo, navigateToCategory, getCurrentView } from '../controllers/navigation.js';
import { eventBus } from '../core/eventBus.js';
import { EVENTS } from '../core/events.js';
import { setDarkMode, isDarkMode, setAppLanguage, getSettings } from '../core/settings.js';
import { openProducerModal, closeProducerModal, isProducerModalOpen } from '../views/producerModal.js?v=7';
import { addFavorite, removeFavorite, isFavorite } from '../views/favorites.js';
import { addToCart, getCartCount } from '../views/cart.js';
import { getProducers } from '../data/dataService.js';
import { isDevMode } from './healthMonitor.js';

const FLAG = 'rg_virtual_user';
const REPORT_KEY = 'rg_virtual_user_report_v1';
const MAX_ISSUES = 120;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let runState = null;
let initialized = false;
let lastReport = null;

function wantsAutoRun() {
    try {
        if (localStorage.getItem(FLAG) === '1') return true;
        const q = new URLSearchParams(location.search);
        return q.get('virtual') === '1' || q.get('vu') === '1';
    } catch {
        return false;
    }
}

function pickProducer() {
    const list = getProducers().filter((p) => p?.id && p.category !== 'other');
    return list[0] || getProducers()[0] || null;
}

function createObservers() {
    const issues = [];
    const push = (issue) => {
        if (issues.length >= MAX_ISSUES) return;
        issues.push({ ...issue, at: Date.now() });
    };

    const onError = (ev) => {
        push({
            type: 'error',
            severity: 'high',
            scenario: runState?.current || 'global',
            title: 'Błąd JavaScript',
            detail: String(ev?.message || ev?.error?.message || 'error').slice(0, 200),
            where: String(ev?.filename || '').slice(0, 120)
        });
    };
    const onRejection = (ev) => {
        push({
            type: 'error',
            severity: 'high',
            scenario: runState?.current || 'global',
            title: 'Unhandled promise rejection',
            detail: String(ev?.reason?.message || ev?.reason || 'rejection').slice(0, 200)
        });
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);

    // FPS
    let frames = 0;
    let lastFpsAt = performance.now();
    let fpsSamples = [];
    let rafId = 0;
    const tick = (now) => {
        frames += 1;
        if (now - lastFpsAt >= 1000) {
            fpsSamples.push(frames);
            if (frames < 28) {
                push({
                    type: 'fps',
                    severity: frames < 20 ? 'high' : 'medium',
                    scenario: runState?.current || 'global',
                    title: `Spadek FPS (${frames})`,
                    detail: `Średnia klatek/s w oknie 1s: ${frames}`,
                    where: getCurrentView?.() || 'unknown'
                });
            }
            frames = 0;
            lastFpsAt = now;
        }
        rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    // Miganie – szybkie przełączanie class/hidden na #app / body
    let mutCount = 0;
    let mutWindowStart = Date.now();
    const mo = new MutationObserver((mutations) => {
        mutCount += mutations.length;
        const now = Date.now();
        if (now - mutWindowStart > 400) {
            if (mutCount > 45) {
                push({
                    type: 'flicker',
                    severity: 'medium',
                    scenario: runState?.current || 'global',
                    title: 'Podejrzenie migania UI',
                    detail: `${mutCount} mutacji DOM w ~400ms`,
                    where: `#app / body (${getCurrentView?.() || ''})`
                });
            }
            mutCount = 0;
            mutWindowStart = now;
        }
    });
    const app = document.getElementById('app') || document.body;
    mo.observe(app, {
        attributes: true,
        childList: true,
        subtree: true,
        attributeFilter: ['class', 'hidden', 'style', 'aria-hidden']
    });

    const memBefore = snapshotMemory();

    return {
        issues,
        push,
        memBefore,
        fpsSamples,
        stop() {
            window.removeEventListener('error', onError);
            window.removeEventListener('unhandledrejection', onRejection);
            cancelAnimationFrame(rafId);
            mo.disconnect();
        }
    };
}

function snapshotMemory() {
    const mem = performance?.memory;
    if (!mem) return { supported: false };
    return {
        supported: true,
        usedMB: Math.round(mem.usedJSHeapSize / 1048576),
        totalMB: Math.round(mem.totalJSHeapSize / 1048576)
    };
}

function scanTranslations(push, scenario) {
    const bad = [];
    document.querySelectorAll('[data-i18n], [data-i18n-placeholder]').forEach((el) => {
        const key = el.getAttribute('data-i18n') || el.getAttribute('data-i18n-placeholder');
        const text = (el.textContent || el.getAttribute('placeholder') || '').trim();
        if (key && (text === key || /^[a-z]+(\.[a-zA-Z0-9_]+)+$/.test(text))) {
            bad.push(key);
        }
    });
    // widoczny tekst wyglądający jak klucz
    document.querySelectorAll('h1, h2, button, label, .nav-label').forEach((el) => {
        const text = (el.textContent || '').trim();
        if (/^(nav|home|map|premium|cart|favorites|msg)\.[a-zA-Z0-9.]+$/.test(text)) {
            bad.push(text);
        }
    });
    const uniq = [...new Set(bad)].slice(0, 15);
    if (uniq.length) {
        push({
            type: 'translation',
            severity: 'medium',
            scenario,
            title: `Niepoprawne / brakujące tłumaczenia (${uniq.length})`,
            detail: uniq.join(', '),
            where: 'DOM i18n'
        });
    }
}

function scanResponsiveness(push, scenario) {
    const w = window.innerWidth || 390;
    const issues = [];
    document.querySelectorAll('h1, h2, .home-greeting-title, .section-title').forEach((el) => {
        if (el.scrollWidth > el.clientWidth + 4) issues.push('text-overflow');
    });
    document.querySelectorAll('#app, .view, main').forEach((el) => {
        if (el.scrollWidth > w + 8) issues.push('horizontal-overflow');
    });
    if (issues.length) {
        push({
            type: 'responsive',
            severity: 'medium',
            scenario,
            title: 'Błąd responsywności',
            detail: [...new Set(issues)].join(', '),
            where: `viewport ${w}px`
        });
    }
}

function scanTouch(push, scenario) {
    if ((window.innerWidth || 400) > 520) return;
    let small = 0;
    document.querySelectorAll('button, a.nav-item, [role="button"], .map-bottom-btn').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && (r.height < 36 || r.width < 36)) small += 1;
    });
    if (small > 0) {
        push({
            type: 'touch',
            severity: small > 5 ? 'high' : 'medium',
            scenario,
            title: `Problemy z dotykiem (${small} celów < 36px)`,
            detail: 'Zalecane min. ~44px dla elementów interaktywnych',
            where: 'mobile viewport'
        });
    }
}

function scanUx(push, scenario) {
    // modal otwarty bez fokusowalnego close
    if (isProducerModalOpen()) {
        const modal = document.getElementById('producerModal');
        const closeBtn = modal?.querySelector('[data-close-modal], .producer-modal-back');
        if (!closeBtn) {
            push({
                type: 'ux',
                severity: 'high',
                scenario,
                title: 'Modal bez widocznego zamknięcia',
                detail: 'Brak [data-close-modal] / wstecz',
                where: 'producerModal'
            });
        }
    }
    // podwójne widoki widoczne
    const visibles = [...document.querySelectorAll('.view, [data-view]')].filter((el) => {
        const st = getComputedStyle(el);
        return st.display !== 'none' && st.visibility !== 'hidden' && !el.hidden;
    });
    if (visibles.length > 2) {
        push({
            type: 'ux',
            severity: 'medium',
            scenario,
            title: 'Wiele widoków jednocześnie widocznych',
            detail: `count=${visibles.length}`,
            where: 'navigation shell'
        });
    }
}

function afterStep(obs, scenario) {
    scanTranslations(obs.push, scenario);
    scanResponsiveness(obs.push, scenario);
    scanTouch(obs.push, scenario);
    scanUx(obs.push, scenario);
}

async function step(name, obs, fn) {
    runState.current = name;
    runState.log.push({ name, status: 'running', at: Date.now() });
    try {
        await fn();
        await sleep(280);
        afterStep(obs, name);
        runState.log[runState.log.length - 1].status = 'ok';
    } catch (err) {
        runState.log[runState.log.length - 1].status = 'fail';
        obs.push({
            type: 'error',
            severity: 'high',
            scenario: name,
            title: `Scenariusz nieudany: ${name}`,
            detail: String(err?.message || err).slice(0, 220)
        });
    }
}

async function runAllScenarios(obs) {
    const producer = pickProducer();
    const producerId = producer?.id ? String(producer.id) : null;

    await step('home-map-producer-back', obs, async () => {
        navigateTo('home', { force: true });
        await sleep(400);
        navigateTo('map', { force: true });
        await sleep(700);
        if (producerId) {
            openProducerModal(producerId, producer);
            await sleep(600);
            if (!isProducerModalOpen()) {
                throw new Error('Modal producenta nie otworzył się');
            }
            closeProducerModal({ force: true });
            await sleep(300);
        } else {
            throw new Error('Brak producenta do testu modala');
        }
        navigateTo('home', { force: true });
    });

    await step('search', obs, async () => {
        eventBus.emit(EVENTS.SEARCH_PRODUCTS, { query: 'brot', navigate: true });
        await sleep(500);
        navigateTo('home', { force: true });
        const input = document.getElementById('headerSearchInput') || document.getElementById('homeSearchInput');
        if (input) {
            input.value = 'käse';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            document.getElementById('headerSearchForm')?.dispatchEvent(
                new Event('submit', { bubbles: true, cancelable: true })
            );
        }
        await sleep(400);
    });

    await step('gps', obs, async () => {
        eventBus.emit(EVENTS.LOCATION_REQUESTED, { source: 'virtual-user' });
        await sleep(400);
        eventBus.emit(EVENTS.NEARBY_SEARCH, { source: 'virtual-user' });
        await sleep(500);
        // symulacja sukcesu lokalizacji (anonimowa, lokalna)
        eventBus.emit(EVENTS.LOCATION_UPDATED, {
            lat: 49.01,
            lng: 12.1,
            source: 'virtual-user'
        });
        await sleep(300);
    });

    await step('filters', obs, async () => {
        navigateToCategory('bakery');
        await sleep(500);
        eventBus.emit(EVENTS.CATEGORY_SELECTED, { category: 'farmers' });
        await sleep(400);
        navigateTo('map', { filter: 'all', force: true });
        await sleep(300);
    });

    await step('popup', obs, async () => {
        navigateTo('map', { force: true });
        await sleep(600);
        const marker = document.querySelector('.leaflet-marker-icon, .leaflet-interactive');
        if (marker) {
            marker.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            await sleep(500);
        } else {
            obs.push({
                type: 'ux',
                severity: 'low',
                scenario: 'popup',
                title: 'Brak markera Leaflet do kliknięcia',
                detail: 'Popup nieprzetestowany interakcyjnie – mapa bez markerów w DOM',
                where: 'map'
            });
        }
        // zamknij ewentualny popup
        document.querySelector('.leaflet-popup-close-button')?.click();
        await sleep(200);
    });

    await step('modal', obs, async () => {
        if (!producerId) throw new Error('Brak producenta');
        openProducerModal(producerId);
        await sleep(500);
        if (!isProducerModalOpen()) throw new Error('Modal nieotwarty');
        closeProducerModal({ force: true });
        await sleep(250);
    });

    await step('favorites', obs, async () => {
        if (!producerId) throw new Error('Brak producenta');
        const was = isFavorite(producerId);
        if (!was) addFavorite(producerId);
        await sleep(200);
        navigateTo('favorites', { force: true });
        await sleep(450);
        if (!was) removeFavorite(producerId);
        await sleep(200);
    });

    await step('cart', obs, async () => {
        const before = getCartCount();
        if (producerId) {
            addToCart({
                id: `vu-${producerId}`,
                producerId,
                name: 'Virtual User Test Item',
                price: 1
            });
        }
        await sleep(200);
        navigateTo('cart', { force: true });
        await sleep(400);
        const after = getCartCount();
        if (after < before) {
            obs.push({
                type: 'ux',
                severity: 'medium',
                scenario: 'cart',
                title: 'Koszyk nie wzrósł po addToCart',
                detail: `before=${before} after=${after}`,
                where: 'cart.js'
            });
        }
    });

    await step('profile', obs, async () => {
        navigateTo('profile', { force: true });
        await sleep(450);
        if (getCurrentView() !== 'profile') throw new Error('Nie przeszło na profil');
    });

    await step('premium', obs, async () => {
        navigateTo('premium', { force: true });
        await sleep(450);
        if (getCurrentView() !== 'premium') throw new Error('Nie przeszło na premium');
    });

    await step('language', obs, async () => {
        const prev = getSettings()?.language || 'de';
        const next = prev === 'en' ? 'de' : 'en';
        setAppLanguage(next);
        await sleep(400);
        scanTranslations(obs.push, 'language');
        setAppLanguage(prev);
        await sleep(300);
    });

    await step('dark-mode', obs, async () => {
        const prev = isDarkMode();
        setDarkMode(!prev);
        await sleep(350);
        if (isDarkMode() === prev) {
            throw new Error('Dark mode nie przełączył się');
        }
        // miganie motywu
        setDarkMode(prev);
        await sleep(250);
    });

    await step('offline', obs, async () => {
        window.dispatchEvent(new Event('offline'));
        await sleep(350);
        navigateTo('map', { force: true });
        await sleep(400);
    });

    await step('online', obs, async () => {
        window.dispatchEvent(new Event('online'));
        await sleep(400);
        navigateTo('home', { force: true });
        await sleep(300);
    });

    await step('restart-app', obs, async () => {
        // Soft restart – pełny reload przerwałby raport; symulujemy cykl widoków
        const views = ['home', 'map', 'favorites', 'cart', 'profile', 'premium', 'home'];
        for (const v of views) {
            navigateTo(v, { force: true });
            await sleep(220);
        }
        obs.push({
            type: 'ux',
            severity: 'low',
            scenario: 'restart-app',
            title: 'Soft restart wykonany (bez location.reload)',
            detail: 'Hard reload: __RG_VIRTUAL__.hardReload() – uruchom osobno',
            where: 'navigation cycle'
        });
    });
}

function summarizeIssues(issues) {
    const byType = {};
    for (const i of issues) {
        byType[i.type] = (byType[i.type] || 0) + 1;
    }
    return byType;
}

function buildReport(obs, startedAt) {
    const memAfter = snapshotMemory();
    let memoryLeak = false;
    if (obs.memBefore.supported && memAfter.supported) {
        const delta = memAfter.usedMB - obs.memBefore.usedMB;
        if (delta >= 25) {
            memoryLeak = true;
            obs.push({
                type: 'memory-leak',
                severity: delta >= 50 ? 'high' : 'medium',
                scenario: 'suite',
                title: `Podejrzenie memory leak (+${delta} MB)`,
                detail: `Przed: ${obs.memBefore.usedMB} MB → Po: ${memAfter.usedMB} MB`,
                where: 'performance.memory'
            });
        }
    }

    const avgFps = obs.fpsSamples.length
        ? Math.round(obs.fpsSamples.reduce((a, b) => a + b, 0) / obs.fpsSamples.length)
        : null;

    const failed = (runState?.log || []).filter((x) => x.status === 'fail').length;
    const passed = (runState?.log || []).filter((x) => x.status === 'ok').length;
    const byType = summarizeIssues(obs.issues);

    const score = Math.max(
        0,
        100
        - failed * 12
        - (byType.error || 0) * 8
        - (byType.fps || 0) * 4
        - (byType['memory-leak'] || 0) * 10
        - (byType.flicker || 0) * 3
        - (byType.translation || 0) * 3
        - (byType.responsive || 0) * 3
        - (byType.touch || 0) * 3
        - (byType.ux || 0) * 2
    );

    return {
        id: `virtual-${new Date().toISOString().replace(/[:.]/g, '-')}`,
        title: 'Virtual User – raport testów',
        generatedAt: new Date().toISOString(),
        durationMs: Date.now() - startedAt,
        policy: {
            architectureUnchanged: true,
            autoFix: false,
            optIn: true
        },
        summary: {
            passed,
            failed,
            scenarios: (runState?.log || []).length,
            issueCount: obs.issues.length,
            byType,
            avgFps,
            memoryLeak,
            memory: { before: obs.memBefore, after: memAfter },
            score
        },
        scenarios: runState?.log || [],
        issues: obs.issues,
        hotspots: {
            flicker: obs.issues.filter((i) => i.type === 'flicker'),
            errors: obs.issues.filter((i) => i.type === 'error'),
            fps: obs.issues.filter((i) => i.type === 'fps'),
            memoryLeak: obs.issues.filter((i) => i.type === 'memory-leak'),
            translations: obs.issues.filter((i) => i.type === 'translation'),
            responsive: obs.issues.filter((i) => i.type === 'responsive'),
            touch: obs.issues.filter((i) => i.type === 'touch'),
            ux: obs.issues.filter((i) => i.type === 'ux')
        }
    };
}

/**
 * Uruchom pełny zestaw testów Virtual User.
 */
export async function runVirtualUser({ reason = 'manual' } = {}) {
    if (runState?.running) {
        console.warn('[Virtual User] już trwa');
        return lastReport;
    }

    const startedAt = Date.now();
    runState = { running: true, current: null, log: [], reason };
    const obs = createObservers();

    console.info('[Virtual User] start scenariuszy…');
    document.body.classList.add('rg-virtual-user-running');

    try {
        await runAllScenarios(obs);
    } finally {
        obs.stop();
        document.body.classList.remove('rg-virtual-user-running');
        runState.running = false;
    }

    const report = buildReport(obs, startedAt);
    report.reason = reason;
    lastReport = report;

    try {
        localStorage.setItem(REPORT_KEY, JSON.stringify(report));
    } catch {
        /* ignore */
    }

    console.info(
        `[Virtual User] done · score ${report.summary.score}% · issues ${report.summary.issueCount}`,
        report.summary.byType
    );

    try {
        document.dispatchEvent(new CustomEvent('rg:virtual-user-report', { detail: report }));
    } catch {
        /* ignore */
    }

    return report;
}

export function getLastVirtualUserReport() {
    if (lastReport) return lastReport;
    try {
        const raw = localStorage.getItem(REPORT_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function initVirtualUser() {
    if (initialized) return;
    initialized = true;

    window.__RG_VIRTUAL__ = {
        run: () => runVirtualUser({ reason: 'manual' }),
        last: getLastVirtualUserReport,
        enable() {
            localStorage.setItem(FLAG, '1');
            return 'Virtual User auto-run ON – reload';
        },
        disable() {
            localStorage.removeItem(FLAG);
            return 'Virtual User auto-run OFF';
        },
        hardReload() {
            localStorage.setItem(FLAG, '1');
            location.reload();
        },
        export() {
            return getLastVirtualUserReport();
        }
    };

    // Auto tylko przy świadomym opt-in (nie na każdym localhost)
    if (wantsAutoRun()) {
        window.setTimeout(() => {
            runVirtualUser({ reason: 'auto' }).catch((e) => {
                console.warn('[Virtual User] auto fail', e);
            });
        }, 2800);
    } else if (isDevMode()) {
        console.info('[Virtual User] gotowy. Uruchom: __RG_VIRTUAL__.run() lub ?virtual=1');
    }
}

export default {
    initVirtualUser,
    runVirtualUser,
    getLastVirtualUserReport
};
