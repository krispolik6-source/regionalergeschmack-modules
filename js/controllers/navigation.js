// controllers/navigation.js – przełączanie widoków w #app
import { t } from '../core/i18n.js';
import { eventBus } from '../core/eventBus.js';
import { EVENTS } from '../core/events.js';
import { renderHome, destroyHome } from '../views/home.js?v=44';
import { renderMap } from '../views/map.js?v=48';
import { renderPremium } from '../views/premium.js';
import { renderFavorites, refreshFavoritesBadge } from '../views/favorites.js';
import { renderCart, refreshCartBadge } from '../views/cart.js';
import { renderProfile } from '../views/profile.js';
import { renderImpressum, renderDatenschutz, renderAgb } from '../views/legal.js';

const VIEW_IDS = ['home', 'map', 'premium', 'favorites', 'cart', 'profile', 'impressum', 'datenschutz', 'agb'];

const viewRenderers = {
    home: renderHome,
    map: renderMap,
    premium: renderPremium,
    favorites: renderFavorites,
    cart: renderCart,
    profile: renderProfile,
    impressum: renderImpressum,
    datenschutz: renderDatenschutz,
    agb: renderAgb
};

let currentView = null;
let appContainer = null;
let isInitialized = false;
/** Zakładka „Szukaj” podświetla nav, ale renderuje home */
let navHighlightView = null;

function ensureViewPanels(container) {
    if (container.querySelector('[data-view-panel]')) return;

    container.innerHTML = VIEW_IDS.map((id) => `
        <div class="view-panel" data-view-panel="${id}" id="view-${id}" hidden></div>
    `).join('');
}

function getViewPanel(view) {
    return appContainer?.querySelector(`[data-view-panel="${view}"]`) || null;
}

function hideAllViews() {
    if (!appContainer) return;
    appContainer.querySelectorAll('[data-view-panel]').forEach((panel) => {
        panel.hidden = true;
        panel.classList.remove('active');
    });
}

function showView(view) {
    const panel = getViewPanel(view);
    if (!panel) return null;
    panel.hidden = false;
    panel.classList.add('active');
    return panel;
}

function updateMapLayoutState(view) {
    document.body.classList.toggle('view-map-active', view === 'map');
    VIEW_IDS.forEach((id) => {
        document.body.classList.toggle(`view-${id}-active`, view === id);
    });
    document.body.classList.toggle('view-legal-active', view === 'impressum' || view === 'datenschutz' || view === 'agb');
}

export function updateNavLabels() {
    document.querySelectorAll('.bottom-nav .nav-item[data-view]').forEach((item) => {
        const view = item.dataset.view;
        const label = item.querySelector('.nav-label');
        if (label && view) {
            label.textContent = t(`nav.${view}`);
        }
    });
    refreshFavoritesBadge();
    refreshCartBadge();
}

function updateActiveNavItem(view) {
    const active = navHighlightView || view;
    document.querySelectorAll('.bottom-nav .nav-item[data-view]').forEach((item) => {
        const isActive = item.dataset.view === active;
        item.classList.toggle('active', isActive);
        if (isActive) {
            item.setAttribute('aria-current', 'page');
        } else {
            item.removeAttribute('aria-current');
        }
    });
}

function focusHomeSearch() {
    requestAnimationFrame(() => {
        const input = document.querySelector('#view-home #homeSearchInput, .home-page #homeSearchInput');
        if (!input) return;
        input.focus();
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}

function renderView(view, panel, options = {}) {
    const renderer = viewRenderers[view];
    if (!renderer || !panel) return;

    try {
        if (view === 'map') {
            renderer(panel, options);
        } else {
            renderer(panel);
        }
    } catch (error) {
        console.error(`Navigation: błąd renderowania "${view}"`, error);
        panel.innerHTML = `
            <div class="error-view">
                <h2>❌ ${t('msg.error')}</h2>
                <p>${t('msg.viewError')}</p>
            </div>
        `;
    }
}

/**
 * Przejście na mapę z filtrem kategorii (Home → Mapa).
 * Filtr jest przekazywany do renderMap przez options.filter.
 */
export function navigateToCategory(category) {
    const filter = category || 'all';
    console.log('[Navigation] Kategoria:', filter);
    navigateTo('map', { filter });
}

export function navigateTo(view, options = {}) {
    if (view === 'search') {
        navHighlightView = 'search';
        navigateTo('home', { ...options, force: true, focusSearch: true });
        updateActiveNavItem('search');
        return;
    }

    if (!view || !viewRenderers[view]) {
        console.warn(`Navigation: nieznany widok "${view}"`);
        return;
    }

    if (!appContainer) {
        console.warn('Navigation: brak kontenera #app');
        return;
    }

    const previousView = currentView;
    const force = Boolean(options.force);
    const hasMapFilter = view === 'map'
        && (options.filter != null || options.category != null);

    if (previousView === 'home' && view !== 'home') {
        destroyHome();
    }

    // Ten sam widok mapy + nowy filtr: zastosuj filtr bez pełnego remountu
    if (view === currentView && !force) {
        if (hasMapFilter) {
            const panel = getViewPanel('map');
            if (panel) {
                panel.hidden = false;
                panel.classList.add('active');
                updateMapLayoutState('map');
                renderView('map', panel, options);
            }
            updateActiveNavItem('map');
            return;
        }
        if (options.focusSearch) {
            updateActiveNavItem(view);
            focusHomeSearch();
        }
        return;
    }

    if (!options.focusSearch) {
        navHighlightView = null;
    }

    currentView = view;

    hideAllViews();
    const panel = showView(view);
    updateMapLayoutState(view);

    if (panel) {
        void panel.offsetHeight;
        renderView(view, panel, options);
    }

    updateActiveNavItem(view);
    updateNavLabels();
    eventBus.emit(EVENTS.VIEW_CHANGED, { view, previousView });
    eventBus.emit(EVENTS.NAVIGATE, { view, previousView });

    if (options.focusSearch) {
        focusHomeSearch();
    }

    console.log(`Navigation: widok "${view}"`, hasMapFilter ? `{ filter: ${options.filter ?? options.category} }` : '');
}

export function bindNavButtons() {
    document.querySelectorAll('.bottom-nav .nav-item[data-view]').forEach((btn) => {
        if (btn.dataset.navBound === 'true') return;
        btn.dataset.navBound = 'true';
        btn.addEventListener('click', (event) => {
            event.preventDefault();
            const view = btn.dataset.view;
            // Filtry kategorii/wyszukiwania są zapamiętywane – nie resetuj przy wejściu na mapę
            if (view) navigateTo(view);
        });
    });
}

/** Handler NAVIGATE – trzymany jako referencja pod ETAP 39 self-heal (idempotentny rebind). */
let navigateBusHandler = null;

function getNavigateBusHandler() {
    if (!navigateBusHandler) {
        navigateBusHandler = (payload) => {
            const view = typeof payload === 'string' ? payload : payload?.view;
            if (!view) return;
            const options = typeof payload === 'object' && payload
                ? { ...payload }
                : {};
            delete options.view;
            delete options.previousView;
            if (view !== currentView || options.filter != null || options.category != null || options.force) {
                navigateTo(view, options);
            }
        };
    }
    return navigateBusHandler;
}

/**
 * ETAP 39 — przywróć listenery nawigacji (stan runtime, bez zmiany routingu).
 * @returns {{ navButtons: number, navigateBus: number }}
 */
export function ensureNavigationHealed() {
    const beforeBtns = document.querySelectorAll('.bottom-nav .nav-item[data-view]:not([data-nav-bound="true"])').length;
    bindNavButtons();
    const handler = getNavigateBusHandler();
    eventBus.off(EVENTS.NAVIGATE, handler);
    eventBus.on(EVENTS.NAVIGATE, handler);
    return {
        navButtons: beforeBtns,
        navigateBus: 1
    };
}

export function initNavigation(container) {
    if (isInitialized) return;

    appContainer = container;

    if (!appContainer) {
        console.warn('Navigation: brak kontenera #app');
        return;
    }

    ensureViewPanels(appContainer);
    ensureNavigationHealed();

    // Cold start z powiadomienia / deep link: /?view=map
    let initialView = 'home';
    try {
        const viewParam = new URLSearchParams(window.location.search || '').get('view');
        if (viewParam && VIEW_IDS.includes(viewParam)) {
            initialView = viewParam;
        }
    } catch (_) {
        /* ignore */
    }
    navigateTo(initialView);
    isInitialized = true;
    console.log('Navigation: zainicjalizowany');
}

export function getCurrentView() {
    return currentView;
}

export default {
    initNavigation,
    navigateTo,
    navigateToCategory,
    bindNavButtons,
    ensureNavigationHealed,
    getCurrentView,
    updateNavLabels
};
