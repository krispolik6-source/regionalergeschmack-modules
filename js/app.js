// js/app.js – bootstrap aplikacji
import { installProductionConsole } from './core/logger.js';
import { initConsoleGuardian } from './diagnostics/consoleGuardian.js';
installProductionConsole();
initConsoleGuardian();

import { APP_NAME } from './config.js';
import { initAdSense } from './presentation/adsense.js';
import { initNavigation, bindNavButtons, navigateTo, navigateToCategory, getCurrentView, updateNavLabels } from './controllers/navigation.js';
import { setSearchQuery } from './views/map.js?v=48';
import { refreshCartBadge, adoptGuestCartForCurrentUser } from './views/cart.js';
import { syncFavoritesOnStartup } from './core/favoritesStore.js';
import { invalidateTasteAdvisorDayCache } from './presentation/tasteAdvisor.js';
import { invalidateReturnMagicDayCache } from './presentation/returnMagic.js';
import { initToast } from './core/toast.js';
import { initAuth } from './auth/auth.js';
import { initLoginModal } from './auth/login.js';
import { initRegisterModal } from './auth/register.js';
import {
    isPremiumActive,
    initTrialSync,
    maybeAutoSyncTrial,
    canActivateTrial
} from './core/premiumService.js';
import { showToast } from './core/toast.js';
import { refreshFavoritesBadge, adoptGuestFavoritesForCurrentUser } from './views/favorites.js';
import { initShellSettings, updateLanguageButtonLabel, refreshShellAccessibility } from './core/settings.js';
import { syncDocumentMeta } from './core/documentMeta.js';
import { initSideMenu } from './core/sideMenu.js';
import { t } from './core/i18n.js';
import { initAiTranslationEngine } from './i18n/aiTranslationEngine.js';
import { initLivingRegion } from './livingRegion/livingRegion.js';
import { eventBus } from './core/eventBus.js';
import { EVENTS } from './core/events.js';
import { initPushNotifications, checkPushOffersNow } from './core/pushNotifications.js';
import { initPwaInstall, refreshPwaInstallUi } from './core/pwaInstall.js';
import { initOfflineSync } from './core/offlineSync.js';
import { initAnalytics } from './core/analytics.js';
import { initSeasonTheme } from './presentation/seasonTheme.js';
import { initClimateAtmosphere } from './presentation/climateAtmosphere.js';
import { initHealthMonitor } from './diagnostics/healthMonitor.js';
import { initHealthDevPanel } from './diagnostics/healthDevPanel.js';
import { initDeveloperVault } from './diagnostics/developerVaultPanel.js';
import { initSelfHealing } from './diagnostics/selfHealing.js';
import { initUiGuardian } from './diagnostics/uiGuardian.js';
import { initMapGuardian } from './diagnostics/mapGuardian.js';
import { initMemoryCleaner } from './diagnostics/memoryCleaner.js';
import { initLearningEngine } from './presentation/learningEngine.js';
import { initImprovementEngine } from './diagnostics/improvementEngine.js';
import { initVirtualUser } from './diagnostics/virtualUser.js';
import { initRealUserSimulation } from './diagnostics/realUserSimulation.js';
import { initEmotionAi } from './diagnostics/emotionAi.js';
import { initLivingBrand } from './diagnostics/livingBrand.js';
import { initProductDirector } from './diagnostics/productDirector.js';
import { initProjectAdvisor } from './diagnostics/projectAdvisor.js';
import { initDailyDeveloperReport } from './diagnostics/dailyDeveloperReport.js';
import { initDeveloperDashboard } from './diagnostics/developerDashboard.js';
import { initWeeklyPremiumReport } from './diagnostics/weeklyPremiumReport.js';

const VIEW_KEYS = ['home', 'map', 'premium', 'favorites', 'cart', 'profile'];

let bootstrapped = false;

function bindCategoryFilter() {
    eventBus.on(EVENTS.CATEGORY_SELECTED, ({ category }) => {
        navigateToCategory(category || 'all');
    });
}

function bindSearch() {
    // Nie resetuj kategorii: wyszukiwanie / wyczyszczenie query zawęża lub odblokowuje
    // wyniki w obrębie aktywnego filtra. Nawigacja na mapę opcjonalna (np. clear na home).
    eventBus.on(EVENTS.SEARCH_PRODUCTS, ({ query, navigate = true } = {}) => {
        setSearchQuery(query || '');
        if (navigate !== false) {
            navigateTo('map', { force: true });
        }
    });
}

function bindLocationAndNearby() {
    // Zachowaj aktywną kategorię – GPS / „w pobliżu” tylko aktualizują lokalizację i odległości.
    eventBus.on(EVENTS.LOCATION_REQUESTED, () => {
        navigateTo('map');
    });

    eventBus.on(EVENTS.NEARBY_SEARCH, () => {
        navigateTo('map');
    });

    eventBus.on(EVENTS.LOCATION_ERROR, ({ code } = {}) => {
        if (code === 1) {
            showToast(t('msg.locationDenied'), 'error');
            return;
        }
        showToast(t('msg.locationUnavailable'), 'error');
    });
}

function openProducerDeepLinkIfPresent() {
    try {
        const producerId = new URLSearchParams(window.location.search || '').get('producer');
        if (!producerId) return;
        import('./views/producerModal.js?v=7').then(({ initProducerModal, openProducerModal }) => {
            initProducerModal();
            window.setTimeout(() => openProducerModal(producerId), 400);
        }).catch(() => {});
    } catch (_) {
        /* ignore */
    }
}

function bindShellEvents() {
    eventBus.on(EVENTS.VIEW_CHANGED, (payload) => {
        const view = payload?.view;
        if (view && VIEW_KEYS.includes(view)) {
            document.title = `${t(`nav.${view}`)} – ${APP_NAME}`;
        }
    });

    eventBus.on(EVENTS.LANGUAGE_CHANGED, () => {
        invalidateTasteAdvisorDayCache();
        invalidateReturnMagicDayCache();
        updateNavLabels();
        updateLanguageButtonLabel();
        refreshShellAccessibility();
        syncDocumentMeta();
        const current = getCurrentView();
        if (current) {
            document.title = `${t(`nav.${current}`)} – ${APP_NAME}`;
            navigateTo(current, { force: true });
        }
    });

    eventBus.on(EVENTS.AUTH_CHANGED, ({ user } = {}) => {
        syncFavoritesOnStartup();
        if (user) {
            adoptGuestFavoritesForCurrentUser();
            adoptGuestCartForCurrentUser();
            const sync = maybeAutoSyncTrial({ force: true });
            if (sync?.reminded) {
                showToast(t('premium.trialEndingSoon').replace('{days}', String(sync.daysLeft)));
            }
        } else {
            refreshFavoritesBadge();
            refreshCartBadge();
        }
        document.body.classList.toggle('premium-active', isPremiumActive());
        const current = getCurrentView();
        if (user && canActivateTrial() && (current === 'home' || current === 'profile' || !current)) {
            navigateTo('premium', { force: true });
            return;
        }
        if (current === 'profile' || current === 'premium' || current === 'home' || current === 'favorites' || current === 'cart') {
            navigateTo(current, { force: true });
        }
    });

    eventBus.on(EVENTS.PREMIUM_ACTIVATED, ({ kind } = {}) => {
        document.body.classList.add('premium-active');
        const current = getCurrentView();
        if (kind === 'producer' && current === 'profile') {
            navigateTo('profile', { force: true });
        } else if (current === 'premium' || current === 'home' || current === 'profile') {
            navigateTo(current, { force: true });
        }
    });
}

async function bootstrap() {
    if (bootstrapped) return;
    bootstrapped = true;

    const app = document.getElementById('app');
    if (!app) throw new Error('Brak kontenera #app');

    initShellSettings();
    // AI Translation Engine — tło, bez UI (LibreTranslate → MyMemory; cache)
    initAiTranslationEngine();
    // Living Region Engine — wyłącznie dane dnia (bez UI / bez Home)
    initLivingRegion();
    initSeasonTheme();
    initClimateAtmosphere();
    initSideMenu();
    initToast();
    initAuth();
    syncFavoritesOnStartup();
    initLoginModal();
    initRegisterModal();
    initNavigation(app);
    bindNavButtons();
    bindCategoryFilter();
    bindSearch();
    bindLocationAndNearby();
    bindShellEvents();
    openProducerDeepLinkIfPresent();
    refreshFavoritesBadge();
    refreshCartBadge();
    initTrialSync();
    const trialSync = maybeAutoSyncTrial({ force: true });
    if (trialSync?.reminded) {
        showToast(t('premium.trialEndingSoon').replace('{days}', String(trialSync.daysLeft)));
    }
    document.body.classList.toggle('premium-active', isPremiumActive());
    await initPushNotifications();
    initOfflineSync();
    initPwaInstall();
    initAnalytics();
    // Google AdSense – jedyne źródło dochodu (baner Home nad stopką)
    initAdSense();

    // ETAP 18A – Application Health Monitor (read-only, tło; UI tylko po haśle)
    initHealthMonitor();
    // Panel deweloperski (☰) – Dev/Health ukryte w głównym UI, dostęp po haśle
    initDeveloperVault();
    // Self-Healing – drobne naprawy DOM (zdjęcia / ikony / układ modalu)
    initSelfHealing();
    // ETAP 41 – UI Guardian (kontrast / overflow / 44px / safe-area / popup)
    initUiGuardian();
    // ETAP 42 – Map Guardian (Leaflet/tiles/markery → restart tylko mapy)
    initMapGuardian();
    // ETAP 43 – Memory Cleaner (Storage Health · bezpieczne czyszczenie)
    initMemoryCleaner();
    // Health/Dev: stub API bez FAB (pełny UI tylko z panelu po haśle)
    initHealthDevPanel();
    // ETAP 18B – Learning Engine (lokalnie, anonimowo, bez sieci)
    initLearningEngine();
    // ETAP 18C – Improvement Engine (propozycje only, bez auto-zmian)
    initImprovementEngine();
    // ETAP 18D – Virtual User (opt-in: ?virtual=1 / __RG_VIRTUAL__.run())
    initVirtualUser();
    // ETAP 24 – Real User Simulation (50 person, opt-in: ?realusers=1)
    initRealUserSimulation();
    // ETAP 25 – Emotion AI (klimat / chęć powrotu, autoFix=false)
    initEmotionAi();
    // ETAP 26 – Living Brand (strażnik Brand Book, autoFix=false)
    initLivingBrand();
    // ETAP 27 – AI Product Director (mózg produktu, autoFix=false)
    initProductDirector();
    // ETAP 18E – Doradca Projektu (advisory-only, briefing dnia)
    initProjectAdvisor();
    // ETAP 19A – Daily Developer Report (dev-only, autoFix=false)
    initDailyDeveloperReport();
    // ETAP 19B – Developer Dashboard (bez FAB; otwierany z panelu)
    initDeveloperDashboard();
    // ETAP 19C – Weekly Premium Report (raz/tydzień, autoFix=false)
    initWeeklyPremiumReport();

    // Eksport do konsoli – do testów
    window.navigateTo = navigateTo;
    window.navigateToCategory = navigateToCategory;
    window.checkPushOffersNow = checkPushOffersNow;
    window.updatePwaInstallButtons = refreshPwaInstallUi;

    console.info(`[${APP_NAME}] nawigacja gotowa`);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}
