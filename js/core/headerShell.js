// js/core/headerShell.js – dwupoziomowy nagłówek: wyszukiwanie, profil, powiadomienia, scroll-away

import { eventBus } from './eventBus.js';
import { EVENTS } from './events.js';
import { t } from './i18n.js';
import { getSettings, saveSettings } from './settings.js';
import { getCurrentUser } from '../auth/auth.js';
import { trackSearchQuery } from './userHistory.js';

const HEADER_SCROLL_AWAY_THRESHOLD_PX = 24;
const HEADER_SCROLL_DELTA_PX = 6;
const NOTIF_DISMISSED_KEY = 'rg_header_notif_dismissed';

let headerSearchDebounceTimer = null;
let lastScrollY = 0;
let headerHidden = false;

function getHeaderSearchInput() {
    return document.getElementById('headerSearchInput');
}

function getHomeResultsContainer() {
    return document.querySelector('#view-home #homeSearchResults, .home-page #homeSearchResults');
}

async function renderSearchResults(query) {
    const { renderHeaderSearchResults } = await import('../views/home.js?v=44');
    renderHeaderSearchResults(query);
}

function isHomeViewActive() {
    return document.body.classList.contains('view-home-active')
        || !document.body.className.match(/view-\w+-active/);
}

function ensureHomeForSearch() {
    if (!isHomeViewActive()) {
        eventBus.emit(EVENTS.NAVIGATE, { view: 'home', force: true });
    }
}

function bindHeaderSearch() {
    const form = document.getElementById('headerSearchForm');
    const input = getHeaderSearchInput();
    if (!form || !input || form.dataset.bound === 'true') return;
    form.dataset.bound = 'true';

    const runSearch = (query) => {
        ensureHomeForSearch();
        void renderSearchResults(query);
    };

    input.addEventListener('input', () => {
        const query = input.value;
        const resultsEl = getHomeResultsContainer();
        if (headerSearchDebounceTimer) clearTimeout(headerSearchDebounceTimer);

        if (query.trim()) {
            ensureHomeForSearch();
            if (resultsEl) {
                resultsEl.hidden = false;
                resultsEl.innerHTML = `<p class="home-search-empty">${t('search.searching')}</p>`;
            }
        } else if (resultsEl) {
            resultsEl.hidden = true;
            resultsEl.innerHTML = '';
            eventBus.emit(EVENTS.SEARCH_PRODUCTS, { query: '', navigate: false });
        }

        headerSearchDebounceTimer = setTimeout(() => runSearch(query), 280);
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const query = input.value.trim();
        runSearch(query);
        trackSearchQuery(query);
        eventBus.emit(EVENTS.SEARCH_PRODUCTS, { query });
    });
}

function bindHeaderProfile() {
    const btn = document.getElementById('headerProfileBtn');
    if (!btn || btn.dataset.bound === 'true') return;
    btn.dataset.bound = 'true';

    btn.addEventListener('click', () => {
        eventBus.emit(EVENTS.NAVIGATE, { view: 'profile' });
    });
}

function bindHeaderNotifications() {
    const btn = document.getElementById('headerNotificationsBtn');
    if (!btn || btn.dataset.bound === 'true') return;
    btn.dataset.bound = 'true';

    btn.addEventListener('click', () => {
        saveSettings({ headerNotifDismissedAt: Date.now() });
        updateNotificationBadge();
        eventBus.emit(EVENTS.NAVIGATE, { view: 'profile' });
    });
}

export function updateHeaderProfileState() {
    const btn = document.getElementById('headerProfileBtn');
    const avatar = document.getElementById('headerProfileAvatar');
    if (!btn || !avatar) return;

    const user = getCurrentUser();
    if (user) {
        const initial = String(user.displayName || user.email || '?').trim().charAt(0).toUpperCase();
        avatar.textContent = initial || '👤';
        avatar.classList.add('is-logged-in');
        btn.setAttribute('aria-label', user.displayName || t('nav.profile'));
        btn.setAttribute('title', user.displayName || t('nav.profile'));
    } else {
        avatar.textContent = '👤';
        avatar.classList.remove('is-logged-in');
        btn.setAttribute('aria-label', t('nav.profile'));
        btn.setAttribute('title', t('nav.profile'));
    }
}

export function updateNotificationBadge() {
    const dot = document.getElementById('headerNotificationsDot');
    const btn = document.getElementById('headerNotificationsBtn');
    if (!dot || !btn) return;

    const settings = getSettings();
    const notificationsOn = settings.notifications !== false;
    const dismissedAt = Number(settings.headerNotifDismissedAt || localStorage.getItem(NOTIF_DISMISSED_KEY) || 0);
    const hasNew = notificationsOn && (Date.now() - dismissedAt > 1000 * 60 * 60 * 12);

    dot.hidden = !hasNew;
    btn.classList.toggle('has-unread', hasNew);
}

export function focusHeaderSearch() {
    requestAnimationFrame(() => {
        const input = getHeaderSearchInput();
        if (!input) return;
        input.focus();
        input.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
}

export function initExpandableHeaderScroll() {
    const header = document.getElementById('mainHeader');
    if (!header?.classList.contains('header-expandable')) return;

    const hiddenClass = 'header-expandable--hidden';
    let ticking = false;

    const syncHeaderVisibility = () => {
        const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
        const delta = scrollY - lastScrollY;

        if (scrollY <= HEADER_SCROLL_AWAY_THRESHOLD_PX) {
            headerHidden = false;
        } else if (delta > HEADER_SCROLL_DELTA_PX) {
            headerHidden = true;
        } else if (delta < -HEADER_SCROLL_DELTA_PX) {
            headerHidden = false;
        }

        lastScrollY = scrollY;
        header.classList.toggle(hiddenClass, headerHidden);
        header.classList.toggle('header-premium--hidden', headerHidden);
        ticking = false;
    };

    window.addEventListener(
        'scroll',
        () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(syncHeaderVisibility);
        },
        { passive: true }
    );

    syncHeaderVisibility();
}

export function refreshHeaderShell() {
    const input = getHeaderSearchInput();
    if (input) {
        input.placeholder = t('home.searchPlaceholder');
    }

    const notifBtn = document.getElementById('headerNotificationsBtn');
    if (notifBtn) {
        notifBtn.setAttribute('aria-label', t('profile.notifications'));
        notifBtn.setAttribute('title', t('profile.notifications'));
    }

    updateHeaderProfileState();
    updateNotificationBadge();
}

export function initHeaderShell() {
    bindHeaderSearch();
    bindHeaderProfile();
    bindHeaderNotifications();
    initExpandableHeaderScroll();
    refreshHeaderShell();

    eventBus.on(EVENTS.AUTH_CHANGED, () => {
        updateHeaderProfileState();
    });

    eventBus.on(EVENTS.LANGUAGE_CHANGED, () => {
        refreshHeaderShell();
    });
}

export default {
    initHeaderShell,
    refreshHeaderShell,
    updateHeaderProfileState,
    updateNotificationBadge,
    focusHeaderSearch,
    initExpandableHeaderScroll
};
