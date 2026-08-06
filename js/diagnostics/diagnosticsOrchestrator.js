/**
 * ETAP 42D — Diagnostics Orchestrator
 *
 * Produkcja: tylko lekka powłoka (Dev Vault / PIN). Pełna diagnostyka lazy.
 * Auto-load: ?dev=1 · rg_dev_mode · localhost/LAN · sesja po PIN.
 */

import { initDeveloperVault } from './developerVaultPanel.js';
import { isDeveloperAccessGranted } from './devVault.js';
import { isLocalhost, isProductionHost } from '../core/logger.js';
import { profileLazyDiagnosticsLoad, recordBootstrapInit } from '../core/bootstrapProfiler.js';

let loaded = false;
/** @type {Promise<{ ok: boolean, reason: string }> | null} */
let loadPromise = null;

function isPrivateLanHost() {
    try {
        const h = String(location.hostname || '').toLowerCase();
        if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
        if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
        if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
        return false;
    } catch {
        return false;
    }
}

/** ?dev=1 lub rg_dev_mode — także na hoście produkcyjnym (właściciel). */
function isDevBootstrapFlag() {
    try {
        if (localStorage.getItem('rg_dev_mode') === '1') return true;
        if (new URLSearchParams(location.search).get('dev') === '1') return true;
    } catch {
        /* ignore */
    }
    return false;
}

/**
 * Czy pełny pakiet diagnostyki powinien załadować się bez czekania na PIN.
 * @returns {boolean}
 */
export function shouldAutoLoadDiagnostics() {
    if (isDeveloperAccessGranted()) return true;
    if (isDevBootstrapFlag()) return true;
    if (isProductionHost()) return false;
    if (isLocalhost() || isPrivateLanHost()) return true;
    return false;
}

/**
 * Lazy-load wszystkich modułów diagnostycznych (19× init).
 * @param {string} [reason]
 * @returns {Promise<{ ok: boolean, reason: string, modules?: number }>}
 */
export async function ensureDiagnosticsLoaded(reason = 'manual') {
    if (loaded) return { ok: true, reason: 'already-loaded' };
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
        await profileLazyDiagnosticsLoad(async () => {
            const [
                healthMonitor,
                selfHealingLogger,
                selfHealing,
                uiGuardian,
                mapGuardian,
                memoryCleaner,
                healthDevPanel,
                learningEngine,
                improvementEngine,
                virtualUser,
                realUserSimulation,
                emotionAi,
                livingBrand,
                productDirector,
                projectAdvisor,
                dailyDeveloperReport,
                developerDashboard,
                weeklyPremiumReport,
                runtimeErrorFeed
            ] = await Promise.all([
                import('./healthMonitor.js'),
                import('../core/selfHealingLogger.js'),
                import('./selfHealing.js'),
                import('./uiGuardian.js'),
                import('./mapGuardian.js'),
                import('./memoryCleaner.js'),
                import('./healthDevPanel.js'),
                import('../presentation/learningEngine.js'),
                import('./improvementEngine.js'),
                import('./virtualUser.js'),
                import('./realUserSimulation.js'),
                import('./emotionAi.js'),
                import('./livingBrand.js'),
                import('./productDirector.js'),
                import('./projectAdvisor.js'),
                import('./dailyDeveloperReport.js'),
                import('./developerDashboard.js'),
                import('./weeklyPremiumReport.js'),
                import('./runtimeErrorFeed.js')
            ]);

            healthMonitor.initHealthMonitor();
            selfHealingLogger.initSelfHealingLogger();
            selfHealing.initSelfHealing();
            uiGuardian.initUiGuardian();
            mapGuardian.initMapGuardian();
            memoryCleaner.initMemoryCleaner();
            healthDevPanel.initHealthDevPanel();
            learningEngine.initLearningEngine();
            improvementEngine.initImprovementEngine();
            virtualUser.initVirtualUser();
            realUserSimulation.initRealUserSimulation();
            emotionAi.initEmotionAi();
            livingBrand.initLivingBrand();
            productDirector.initProductDirector();
            projectAdvisor.initProjectAdvisor();
            dailyDeveloperReport.initDailyDeveloperReport();
            developerDashboard.initDeveloperDashboard();
            weeklyPremiumReport.initWeeklyPremiumReport();
            runtimeErrorFeed.initRuntimeErrorFeed();

            loaded = true;
            try {
                document.dispatchEvent(new CustomEvent('rg:diagnostics-loaded', { detail: { reason } }));
            } catch {
                /* ignore */
            }
        });
        return { ok: true, reason, modules: 19 };
    })().catch((err) => {
        loadPromise = null;
        throw err;
    });

    return loadPromise;
}

/**
 * Powłoka produkcyjna: Dev Vault (PIN). Reszta lazy.
 */
export function initDiagnosticsOrchestrator() {
    recordBootstrapInit('initDeveloperVault');
    initDeveloperVault();

    if (shouldAutoLoadDiagnostics()) {
        void ensureDiagnosticsLoaded('bootstrap').catch(() => {});
    }

    document.addEventListener('rg:dev-vault-unlocked', () => {
        void ensureDiagnosticsLoaded('vault-unlock').catch(() => {});
    });

    window.__RG_DIAGNOSTICS__ = {
        load: (reason) => ensureDiagnosticsLoaded(reason || 'api'),
        loaded: () => loaded,
        shouldAutoLoad: shouldAutoLoadDiagnostics,
        policy: {
            lazy: true,
            productionShellOnly: true,
            autoLoad: ['vault-pin', 'dev=1', 'rg_dev_mode', 'localhost', 'lan']
        }
    };
}

export function isDiagnosticsLoaded() {
    return loaded;
}

export default {
    initDiagnosticsOrchestrator,
    ensureDiagnosticsLoaded,
    shouldAutoLoadDiagnostics,
    isDiagnosticsLoaded
};
