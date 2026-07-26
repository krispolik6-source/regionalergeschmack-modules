// js/diagnostics/healthMonitor.js – ETAP 18A Application Health Monitor
// Warstwa diagnostyczna: tylko obserwacja + raport. NIGDY nie zmienia logiki aplikacji.

const STORAGE_REPORT = 'rg_app_health_report_v1';
const STORAGE_LOG = 'rg_app_health_log_v1';
const DEV_FLAG = 'rg_dev_mode';
const MAX_LOG = 80;

const state = {
    startedAt: Date.now(),
    jsErrors: [],
    longTasks: [],
    renderSpans: [],
    listenerAdds: 0,
    listenerMap: new Map(),
    fetchLog: [],
    duplicateFetches: 0,
    imageErrors: [],
    translationMisses: [],
    notes: []
};

let patched = false;
let lastReport = null;
let healthTimer = null;

/** Hosty produkcyjne — Dev/Health całkowicie ukryte (ETAP 31). */
function isProductionHost() {
    try {
        const h = String(location.hostname || '').toLowerCase();
        if (!h || h === 'localhost' || h === '127.0.0.1') return false;
        if (location.protocol === 'file:') return false;
        if (h.endsWith('.netlify.app')) return true;
        if (h.includes('regionalergeschmack')) return true;
        return false;
    } catch {
        return false;
    }
}

/**
 * Dev tools (Health / Advisor / …) wyłącznie:
 * localhost · 127.0.0.1 · (?dev=1 | rg_dev_mode) poza produkcją.
 * Na produkcji: zawsze false.
 */
export function isDevMode() {
    try {
        if (isProductionHost()) return false;
        const h = location.hostname;
        if (h === 'localhost' || h === '127.0.0.1') return true;
        if (localStorage.getItem(DEV_FLAG) === '1') return true;
        const q = new URLSearchParams(location.search);
        if (q.get('dev') === '1') return true;
        return false;
    } catch {
        return false;
    }
}

function pushLog(entry) {
    try {
        const raw = localStorage.getItem(STORAGE_LOG);
        const list = raw ? JSON.parse(raw) : [];
        list.unshift({ ...entry, at: Date.now() });
        localStorage.setItem(STORAGE_LOG, JSON.stringify(list.slice(0, MAX_LOG)));
    } catch {
        /* ignore */
    }
}

function clampScore(n) {
    return Math.max(0, Math.min(100, Math.round(n)));
}

function installRuntimeHooks() {
    if (patched) return;
    patched = true;

    window.addEventListener('error', (ev) => {
        const msg = String(ev?.message || ev?.error?.message || 'Error');
        state.jsErrors.push({ msg: msg.slice(0, 200), source: String(ev?.filename || '').slice(0, 120) });
        if (state.jsErrors.length > 40) state.jsErrors.shift();
        pushLog({ type: 'js-error', msg });
    });

    window.addEventListener('unhandledrejection', (ev) => {
        const msg = String(ev?.reason?.message || ev?.reason || 'unhandledrejection').slice(0, 200);
        state.jsErrors.push({ msg, source: 'promise' });
        if (state.jsErrors.length > 40) state.jsErrors.shift();
        pushLog({ type: 'promise-error', msg });
    });

    document.addEventListener('error', (ev) => {
        const t = ev.target;
        if (t && t.tagName === 'IMG') {
            const src = String(t.currentSrc || t.src || '').slice(0, 180);
            state.imageErrors.push(src);
            if (state.imageErrors.length > 30) state.imageErrors.shift();
            pushLog({ type: 'image-error', src });
        }
    }, true);

    if (typeof PerformanceObserver !== 'undefined') {
        try {
            const po = new PerformanceObserver((list) => {
                for (const e of list.getEntries()) {
                    state.longTasks.push({ ms: Math.round(e.duration), at: Date.now() });
                    if (state.longTasks.length > 30) state.longTasks.shift();
                }
            });
            po.observe({ entryTypes: ['longtask'] });
        } catch {
            /* Safari etc. */
        }
    }

    // Licznik addEventListener – hot = ten sam target + typ wielokrotnie (nie suma sesji)
    try {
        const proto = EventTarget.prototype;
        const original = proto.addEventListener;
        const originalRemove = proto.removeEventListener;
        const perTarget = new WeakMap();

        const targetKey = (target, type) =>
            `${target?.nodeName || target?.constructor?.name || 'ET'}:${type}`;
        /** Ile elementów jest aktualnie „hot” dla danego klucza typów */
        const hotRefCount = new Map();
        const hotFlags = new WeakMap();

        const syncHot = (target, type, n) => {
            const key = targetKey(target, type);
            let flags = hotFlags.get(target);
            if (!flags) {
                flags = new Set();
                hotFlags.set(target, flags);
            }
            const wasHot = flags.has(type);
            const isHot = n > 2;
            if (isHot) {
                if (!wasHot) {
                    flags.add(type);
                    hotRefCount.set(key, (hotRefCount.get(key) || 0) + 1);
                }
                state.listenerMap.set(key, Math.max(state.listenerMap.get(key) || 0, n));
            } else if (wasHot) {
                flags.delete(type);
                const left = (hotRefCount.get(key) || 1) - 1;
                if (left <= 0) {
                    hotRefCount.delete(key);
                    state.listenerMap.delete(key);
                } else {
                    hotRefCount.set(key, left);
                }
            }
        };

        proto.addEventListener = function patchedAdd(type, listener, options) {
            state.listenerAdds += 1;
            let counts = perTarget.get(this);
            if (!counts) {
                counts = new Map();
                perTarget.set(this, counts);
            }
            const n = (counts.get(type) || 0) + 1;
            counts.set(type, n);
            syncHot(this, type, n);
            return original.call(this, type, listener, options);
        };

        proto.removeEventListener = function patchedRemove(type, listener, options) {
            const counts = perTarget.get(this);
            if (counts?.has(type)) {
                const n = Math.max(0, (counts.get(type) || 1) - 1);
                if (n === 0) counts.delete(type);
                else counts.set(type, n);
                syncHot(this, type, n);
            }
            return originalRemove.call(this, type, listener, options);
        };
    } catch {
        state.notes.push('listener-patch-unavailable');
    }

    // Dedup fetch
    try {
        const originalFetch = window.fetch.bind(window);
        window.fetch = function monitoredFetch(input, init) {
            const url = String(typeof input === 'string' ? input : input?.url || '');
            const now = Date.now();
            const recent = state.fetchLog.filter((x) => now - x.at < 1500 && x.url === url);
            if (recent.length >= 1 && url && !url.startsWith('data:')) {
                state.duplicateFetches += 1;
                pushLog({ type: 'duplicate-fetch', url: url.slice(0, 160) });
            }
            state.fetchLog.push({ url: url.slice(0, 200), at: now });
            if (state.fetchLog.length > 60) state.fetchLog.shift();
            return originalFetch(input, init);
        };
    } catch {
        state.notes.push('fetch-patch-unavailable');
    }
}

function measureRenderSample() {
    return new Promise((resolve) => {
        const t0 = performance.now();
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const ms = performance.now() - t0;
                state.renderSpans.push(ms);
                if (state.renderSpans.length > 20) state.renderSpans.shift();
                resolve(ms);
            });
        });
    });
}

function checkTranslationsSample() {
    const misses = [];
    try {
        // dynamic import uniknięty – sprawdzamy DOM data-i18n jeśli są
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            const text = (el.textContent || '').trim();
            if (key && (text === key || text.startsWith('home.') || text.startsWith('nav.'))) {
                misses.push(key);
            }
        });
    } catch {
        /* ignore */
    }
    state.translationMisses = misses.slice(0, 20);
    return misses;
}

function checkMissingImagesInDom() {
    const broken = [];
    document.querySelectorAll('img').forEach((img) => {
        if (img.complete && img.naturalWidth === 0 && img.src) {
            broken.push(String(img.src).slice(0, 160));
        }
    });
    return broken;
}

function checkProducerDataQuality() {
    const issues = [];
    try {
        // Tylko karty miejsc / lista mapy / wyniki wyszukiwania – nie formularze
        const cards = document.querySelectorAll([
            '.home-venue-card[data-producer-id]',
            '.map-producer-list-btn[data-producer-id]',
            '.search-result-card[data-producer-id]',
            '[data-search-result][data-producer-id]'
        ].join(', '));

        cards.forEach((el) => {
            if (el.closest('form, [data-review-form], [data-report-form], [data-reviews-root]')) return;
            const id = el.getAttribute('data-producer-id');
            const name = el.getAttribute('aria-label')
                || el.querySelector(
                    '.home-venue-name, .home-list-item-name, .map-list-item-name, .search-result-name'
                )?.textContent;
            if (id && !String(name || '').trim()) {
                issues.push(`producer-unnamed:${id}`);
            }
        });
    } catch {
        /* ignore */
    }
    return issues.slice(0, 20);
}

function checkImageCategoryMismatch() {
    const issues = [];
    try {
        document.querySelectorAll('[data-category] img, .category-card img, .home-product-card img').forEach((img) => {
            const card = img.closest('[data-category], .category-card, .home-product-card');
            const cat = card?.getAttribute?.('data-category') || card?.dataset?.category || '';
            const src = String(img.currentSrc || img.src || '');
            if (!cat || !src) return;
            // oczywiste niespójności slugów
            if (/meat|fleisch/i.test(cat) && /bread|rolls|bakery/i.test(src)) {
                issues.push(`mismatch:${cat}←${src.slice(-40)}`);
            }
            if (/bakery|bäck/i.test(cat) && /steak|sausage|pork/i.test(src)) {
                issues.push(`mismatch:${cat}←${src.slice(-40)}`);
            }
        });
    } catch {
        /* ignore */
    }
    return issues.slice(0, 15);
}

function checkAccessibility() {
    const issues = [];
    document.querySelectorAll('button, a[href], [role="button"]').forEach((el) => {
        const label = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('title') || '').trim();
        if (!label) issues.push('unlabeled-control');
    });
    return { unlabeled: issues.length };
}

function checkMobileLayout() {
    const w = window.innerWidth || 390;
    const issues = [];
    if (w <= 430) {
        document.querySelectorAll('button.btn-primary, button.btn-location, .map-bottom-btn').forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.height > 0 && r.height < 36) issues.push('tap-too-small');
            if (r.width > w * 0.98 && r.height > 64) issues.push('tap-too-large');
        });
        document.querySelectorAll('h1, h2, .home-greeting-title').forEach((el) => {
            if (el.scrollWidth > el.clientWidth + 2) issues.push('text-overflow');
        });
    }
    return { width: w, issues: [...new Set(issues)] };
}

function checkPwa() {
    const out = { sw: false, manifest: false, standalone: false };
    out.sw = Boolean(navigator.serviceWorker?.controller) || 'serviceWorker' in navigator;
    out.manifest = Boolean(document.querySelector('link[rel="manifest"]'));
    out.standalone = window.matchMedia('(display-mode: standalone)').matches
        || navigator.standalone === true;
    return out;
}

async function checkCache() {
    const info = { caches: 0, error: null };
    try {
        if (typeof caches !== 'undefined') {
            const keys = await caches.keys();
            info.caches = keys.length;
        }
    } catch (e) {
        info.error = String(e?.message || e);
    }
    return info;
}

function memorySnapshot() {
    const mem = performance?.memory;
    if (!mem) return { supported: false };
    return {
        supported: true,
        usedMB: Math.round(mem.usedJSHeapSize / 1048576),
        totalMB: Math.round(mem.totalJSHeapSize / 1048576),
        limitMB: Math.round(mem.jsHeapSizeLimit / 1048576)
    };
}

function scorePerformance({ renderMs, longTasks, duplicateFetches }) {
    let s = 100;
    const avgRender = renderMs.length
        ? renderMs.reduce((a, b) => a + b, 0) / renderMs.length
        : 0;
    if (avgRender > 50) s -= 15;
    if (avgRender > 100) s -= 20;
    if (longTasks.length > 3) s -= 15;
    if (longTasks.length > 8) s -= 20;
    if (duplicateFetches > 0) s -= Math.min(25, duplicateFetches * 5);
    return clampScore(s);
}

function scoreMemory(mem, listenerAdds) {
    let s = 100;
    if (mem.supported) {
        if (mem.usedMB > 80) s -= 15;
        if (mem.usedMB > 150) s -= 25;
        if (mem.usedMB / Math.max(1, mem.limitMB) > 0.5) s -= 15;
    }
    if (listenerAdds > 400) s -= 10;
    if (listenerAdds > 900) s -= 20;
    // duplikaty listenerów na tym samym elemencie
    let hot = 0;
    state.listenerMap.forEach((n) => { if (n > 2) hot += 1; });
    if (hot > 0) s -= Math.min(20, hot * 4);
    return clampScore(s);
}

function scoreUx(mobile, a11y) {
    let s = 100;
    if (mobile.issues.includes('tap-too-small')) s -= 20;
    if (mobile.issues.includes('tap-too-large')) s -= 10;
    if (mobile.issues.includes('text-overflow')) s -= 15;
    if (a11y.unlabeled > 5) s -= 15;
    if (a11y.unlabeled > 20) s -= 20;
    return clampScore(s);
}

function scoreA11y(a11y) {
    let s = 100;
    s -= Math.min(50, a11y.unlabeled * 2);
    return clampScore(s);
}

function scoreData(producerIssues, mismatch, brokenImages) {
    let s = 100;
    s -= Math.min(30, producerIssues.length * 3);
    s -= Math.min(30, mismatch.length * 5);
    s -= Math.min(30, brokenImages.length * 4);
    return clampScore(s);
}

function scoreTranslation(misses) {
    let s = 100;
    s -= Math.min(60, misses.length * 8);
    return clampScore(s);
}

function scoreMobile(mobile) {
    let s = 100;
    if (mobile.width <= 360) s -= 0; // ok
    s -= Math.min(40, mobile.issues.length * 12);
    return clampScore(s);
}

function scorePwa(pwa, cache) {
    let s = 100;
    if (!pwa.manifest) s -= 30;
    if (!pwa.sw) s -= 25;
    if (cache.error) s -= 15;
    if (cache.caches === 0 && pwa.sw) s -= 10;
    return clampScore(s);
}

/**
 * Pełny Health Check (tylko raport, bez mutacji stanu aplikacji).
 */
export async function runHealthCheck({ reason = 'manual' } = {}) {
    await measureRenderSample();
    const translationMisses = checkTranslationsSample();
    const brokenImages = [...new Set([...state.imageErrors, ...checkMissingImagesInDom()])];
    const producerIssues = checkProducerDataQuality();
    const mismatch = checkImageCategoryMismatch();
    const a11y = checkAccessibility();
    const mobile = checkMobileLayout();
    const pwa = checkPwa();
    const cache = await checkCache();
    const mem = memorySnapshot();

    const scores = {
        performance: scorePerformance({
            renderMs: state.renderSpans,
            longTasks: state.longTasks,
            duplicateFetches: state.duplicateFetches
        }),
        ux: scoreUx(mobile, a11y),
        accessibility: scoreA11y(a11y),
        memory: scoreMemory(mem, state.listenerAdds),
        dataQuality: scoreData(producerIssues, mismatch, brokenImages),
        translation: scoreTranslation(translationMisses),
        mobile: scoreMobile(mobile),
        pwa: scorePwa(pwa, cache)
    };

    const overall = clampScore(
        Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
    );

    const findings = [];
    if (state.jsErrors.length) {
        findings.push({
            severity: 'high',
            area: 'js',
            title: `Błędy JavaScript: ${state.jsErrors.length}`,
            detail: state.jsErrors.slice(-3).map((e) => e.msg).join(' | ')
        });
    }
    if (state.duplicateFetches > 0) {
        findings.push({
            severity: 'medium',
            area: 'network',
            title: `Podwójne requesty: ${state.duplicateFetches}`,
            detail: 'Wykryto powtórzone fetch w oknie 1.5s'
        });
    }
    let hotListeners = 0;
    state.listenerMap.forEach((n) => { if (n > 2) hotListeners += 1; });
    if (hotListeners) {
        findings.push({
            severity: 'medium',
            area: 'memory',
            title: `Podejrzenie podwójnych listenerów (${hotListeners} typów)`,
            detail: 'Ten sam element ma wielokrotnie ten sam typ zdarzenia (brak cleanup)'
        });
    }
    if (brokenImages.length) {
        findings.push({
            severity: 'high',
            area: 'images',
            title: `Brakujące/uszkodzone zdjęcia: ${brokenImages.length}`,
            detail: brokenImages.slice(0, 3).join(', ')
        });
    }
    if (mismatch.length) {
        findings.push({
            severity: 'medium',
            area: 'images',
            title: 'Niezgodność zdjęcia z kategorią',
            detail: mismatch.slice(0, 3).join(', ')
        });
    }
    if (translationMisses.length) {
        findings.push({
            severity: 'medium',
            area: 'i18n',
            title: `Podejrzenie błędów tłumaczeń: ${translationMisses.length}`,
            detail: translationMisses.slice(0, 5).join(', ')
        });
    }
    if (producerIssues.length) {
        findings.push({
            severity: 'medium',
            area: 'data',
            title: `Brakujące dane producentów: ${producerIssues.length}`,
            detail: producerIssues.slice(0, 5).join(', ')
        });
    }
    if (mobile.issues.length) {
        findings.push({
            severity: 'medium',
            area: 'mobile',
            title: 'Problemy layoutu mobilnego',
            detail: mobile.issues.join(', ')
        });
    }
    if (a11y.unlabeled > 8) {
        findings.push({
            severity: 'medium',
            area: 'a11y',
            title: `Kontrolki bez etykiety: ${a11y.unlabeled}`,
            detail: 'Brak aria-label / tekstu'
        });
    }

    const report = {
        id: `health-${new Date().toISOString().replace(/[:.]/g, '-')}`,
        generatedAt: new Date().toISOString(),
        reason,
        policy: {
            autoFix: false,
            autoCommit: false,
            readOnly: true
        },
        scores,
        overall,
        findings,
        runtime: {
            uptimeSec: Math.round((Date.now() - state.startedAt) / 1000),
            jsErrors: state.jsErrors.length,
            longTasks: state.longTasks.length,
            avgRenderMs: state.renderSpans.length
                ? Math.round(state.renderSpans.reduce((a, b) => a + b, 0) / state.renderSpans.length)
                : null,
            listenerAdds: state.listenerAdds,
            duplicateFetches: state.duplicateFetches,
            memory: mem,
            pwa,
            cache,
            mobile
        },
        exportHint: 'Aby zapisać do docs/health/: skopiuj raport (dev panel) i uruchom npm run health -- --import=dump.json'
    };

    lastReport = report;
    try {
        localStorage.setItem(STORAGE_REPORT, JSON.stringify(report));
    } catch {
        /* ignore */
    }
    pushLog({ type: 'health-check', overall, reason });

    if (isDevMode()) {
        console.info('[Health Monitor] Overall', overall + '%', scores);
    }

    try {
        document.dispatchEvent(new CustomEvent('rg:health-report', { detail: report }));
    } catch {
        /* ignore */
    }

    return report;
}

export function getLastHealthReport() {
    if (lastReport) return lastReport;
    try {
        const raw = localStorage.getItem(STORAGE_REPORT);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function getHealthState() {
    return {
        ...state,
        listenerHot: [...state.listenerMap.entries()]
            .filter(([, n]) => n > 10)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
    };
}

/**
 * Start monitora w tle + automatyczny Health Check po starcie.
 */
export function initHealthMonitor() {
    installRuntimeHooks();

    // Auto Health Check po starcie (lekko opóźniony – DOM gotowy)
    window.setTimeout(() => {
        runHealthCheck({ reason: 'app-start' }).catch(() => {});
    }, 1800);

    // Okresowy lekki check w tle (tylko obserwacja)
    if (healthTimer) clearInterval(healthTimer);
    healthTimer = window.setInterval(() => {
        runHealthCheck({ reason: 'interval' }).catch(() => {});
    }, 5 * 60 * 1000);

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            measureRenderSample();
        }
    });

    window.__RG_HEALTH__ = {
        run: () => runHealthCheck({ reason: 'manual' }),
        last: getLastHealthReport,
        state: getHealthState,
        enableDev() {
            localStorage.setItem(DEV_FLAG, '1');
            return 'dev mode on – reload for panel';
        },
        disableDev() {
            localStorage.removeItem(DEV_FLAG);
            return 'dev mode off';
        },
        export() {
            return getLastHealthReport();
        }
    };

    console.info('[Health Monitor] aktywny (read-only). Konsola: __RG_HEALTH__.run()');
}

export default {
    initHealthMonitor,
    runHealthCheck,
    getLastHealthReport,
    getHealthState,
    isDevMode
};
