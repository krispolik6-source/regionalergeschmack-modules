// js/app.js – bootstrap aplikacji
import {
    startBootstrapProfile,
    finishBootstrapProfile,
    recordBootstrapInit
} from './core/bootstrapProfiler.js';
import { installProductionConsole } from './core/logger.js';
import { initConsoleGuardian } from './diagnostics/consoleGuardian.js';

const __bootPre0 = typeof performance !== 'undefined' ? performance.now() : 0;
startBootstrapProfile();
recordBootstrapInit('installProductionConsole');
installProductionConsole();
recordBootstrapInit('initConsoleGuardian');
initConsoleGuardian();
const __bootPreMs = typeof performance !== 'undefined' ? performance.now() - __bootPre0 : 0;

import { APP_NAME } from './config.js';
import { initAdSense, mountHomeAdSense } from './presentation/adsense.js';
import { initNavigation, bindNavButtons, navigateTo, navigateToCategory, getCurrentView, updateNavLabels } from './controllers/navigation.js';
import { initLegalFooter } from './views/legal.js';
import {
    COOKIE_CONSENT,
    hasCookieConsentAccepted,
    setCookieConsent,
    hideCookieBanner,
    syncCookieBannerVisibility
} from './core/cookieConsent.js';
import { queueSearchQuery } from './core/mapLoader.js';
import { refreshCartBadge, adoptGuestCartForCurrentUser } from './views/cart.js';
import { syncFavoritesOnStartup } from './core/favoritesStore.js';
import { invalidateTasteAdvisorDayCache } from './presentation/tasteAdvisor.js';
import { invalidateReturnMagicDayCache } from './presentation/returnMagic.js';
import { initToast, showToast } from './core/toast.js';
import { initAuth } from './auth/auth.js';
import { initLoginModal } from './auth/login.js';
import { initRegisterModal } from './auth/register.js';
import {
    isPremiumActive,
    initTrialSync,
    maybeAutoSyncTrial,
    canActivateTrial
} from './core/premiumService.js';
import { refreshFavoritesBadge, adoptGuestFavoritesForCurrentUser } from './views/favorites.js';
import { initShellSettings, updateLanguageButtonLabel, refreshShellAccessibility } from './core/settings.js';
import { initHeaderShell, refreshHeaderShell } from './core/headerShell.js';
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
import { initDiagnosticsOrchestrator } from './diagnostics/diagnosticsOrchestrator.js';
import { dismissSplashScreen } from './core/splashScreen.js';

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
        queueSearchQuery(query || '');
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

const HEADER_SCROLL_AWAY_THRESHOLD_PX = 50;

function initPremiumScrollAwayHeader() {
    /* Scroll-away obsługiwany w js/core/headerShell.js (header-expandable). */
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
        refreshHeaderShell();
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

function loadAdSenseAfterConsent() {
    initAdSense();
    if (getCurrentView() === 'home') {
        navigateTo('home', { force: true });
    } else {
        mountHomeAdSense();
    }
}

function initCookieBanner() {
    const banner = document.getElementById('cookieConsentBanner');
    const acceptBtn = document.getElementById('cookieAccept');
    const rejectBtn = document.getElementById('cookieReject');
    if (!banner || !acceptBtn || !rejectBtn || banner.dataset.bound === 'true') return;
    banner.dataset.bound = 'true';

    if (!syncCookieBannerVisibility(banner)) return;

    const handleChoice = (choice) => {
        setCookieConsent(choice);
        hideCookieBanner(banner, () => {
            if (choice === COOKIE_CONSENT.ACCEPTED) {
                loadAdSenseAfterConsent();
            }
        });
    };

    acceptBtn.onclick = (event) => {
        event.preventDefault();
        handleChoice(COOKIE_CONSENT.ACCEPTED);
    };

    rejectBtn.onclick = (event) => {
        event.preventDefault();
        handleChoice(COOKIE_CONSENT.REJECTED);
    };
}

async function bootstrap() {
    if (bootstrapped) return;
    bootstrapped = true;

    try {
    const app = document.getElementById('app');
    if (!app) throw new Error('Brak kontenera #app');

    recordBootstrapInit('initShellSettings'); initShellSettings();
    recordBootstrapInit('initHeaderShell'); initHeaderShell();
    recordBootstrapInit('initAiTranslationEngine'); initAiTranslationEngine();
    recordBootstrapInit('initLivingRegion'); initLivingRegion();
    recordBootstrapInit('initSeasonTheme'); initSeasonTheme();
    recordBootstrapInit('initClimateAtmosphere'); initClimateAtmosphere();
    recordBootstrapInit('initSideMenu'); initSideMenu();
    recordBootstrapInit('initToast'); initToast();
    recordBootstrapInit('initAuth'); initAuth();
    syncFavoritesOnStartup();
    recordBootstrapInit('initLoginModal'); initLoginModal();
    recordBootstrapInit('initRegisterModal'); initRegisterModal();
    recordBootstrapInit('initNavigation'); initNavigation(app);
    recordBootstrapInit('initLegalFooter'); initLegalFooter();
    recordBootstrapInit('initCookieBanner'); initCookieBanner();
    bindNavButtons();
    bindCategoryFilter();
    bindSearch();
    bindLocationAndNearby();
    bindShellEvents();
    initPremiumScrollAwayHeader();
    openProducerDeepLinkIfPresent();
    refreshFavoritesBadge();
    refreshCartBadge();
    recordBootstrapInit('initTrialSync'); initTrialSync();
    const trialSync = maybeAutoSyncTrial({ force: true });
    if (trialSync?.reminded) {
        showToast(t('premium.trialEndingSoon').replace('{days}', String(trialSync.daysLeft)));
    }
    document.body.classList.toggle('premium-active', isPremiumActive());
    recordBootstrapInit('initPushNotifications'); await initPushNotifications();
    recordBootstrapInit('initOfflineSync'); initOfflineSync();
    recordBootstrapInit('initPwaInstall'); initPwaInstall();
    recordBootstrapInit('initAnalytics'); initAnalytics();
    // Google AdSense – tylko po zgodzie cookie (RODO / AdSense)
    if (hasCookieConsentAccepted()) {
        recordBootstrapInit('initAdSense'); initAdSense();
    }

    // ETAP 42D — diagnostyka lazy (Vault / ?dev=1 / localhost); produkcja: tylko powłoka PIN
    recordBootstrapInit('initDiagnosticsOrchestrator'); initDiagnosticsOrchestrator();

    // Eksport do konsoli – do testów
    window.navigateTo = navigateTo;
    window.navigateToCategory = navigateToCategory;
    window.checkPushOffersNow = checkPushOffersNow;
    window.updatePwaInstallButtons = refreshPwaInstallUi;

    console.info(`[${APP_NAME}] nawigacja gotowa`);
    } finally {
        finishBootstrapProfile({ prebootMs: __bootPreMs });
        dismissSplashScreen();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}
