// ============================================================
// js/views/favorites.js – ulubione (KROK 5)
// ============================================================

import { getProducers, getProducerById } from '../data/dataService.js';
import { navigateTo } from '../controllers/navigation.js';
import { eventBus } from '../core/eventBus.js';
import { EVENTS } from '../core/events.js';
import { t, formatNavLabel } from '../core/i18n.js';
import { getCategoryIcon } from '../presentation/categoryIcons.js';
import { getProducerDisplayName } from '../presentation/chainBrands.js';
import { openProducerModal, initProducerModal } from './producerModal.js?v=7';
import { getCurrentUser } from '../auth/auth.js';
import { trackRouteSaved } from '../core/userHistory.js';
import { recordLearningSignal } from '../presentation/learningEngine.js';
import {
    saveShoppingRoute,
    getShoppingRoutes,
    deleteShoppingRoute,
    openRouteInMaps,
    orderStopsByDistance
} from '../data/shoppingRoutes.js';
import { showToast } from '../core/toast.js';
import {
    FAVORITES_STORAGE_KEY_BASE as STORAGE_KEY,
    getFavoriteIds as readFavoriteIdsFromStore,
    setFavoriteIdsRaw,
    isFavorite as isFavoriteInStore,
    readFavoriteIdsForKey,
    writeFavoriteIdsForKey,
    favoritesStorageKey
} from '../core/favoritesStore.js';

function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function readIds(key) {
    return readFavoriteIdsForKey(key);
}

const CATEGORY_ICONS = {
    farmer: getCategoryIcon('farmer'),
    bakery: getCategoryIcon('bakery'),
    restaurant: getCategoryIcon('restaurant'),
    meat: getCategoryIcon('meat'),
    shop: getCategoryIcon('shop'),
    vending: getCategoryIcon('vending'),
    other: getCategoryIcon('other')
};

let _initialized = false;

export function renderFavorites(container) {
    if (!container) return;
    injectStyles();
    initProducerModal();
    render(container);
    bindEvents(container);
}

export function initFavorites() {
    if (_initialized) return;

    const container = document.getElementById('favoritesView');
    if (!container) return;

    // initProducerModal: tylko w renderFavorites (navigation) — bez podwójnej inicjalizacji
    injectStyles();
    render(container);
    bindEvents(container);
    _initialized = true;
}

function injectStyles() {
    if (document.getElementById('favorites-view-styles')) return;

    const style = document.createElement('style');
    style.id = 'favorites-view-styles';
    style.textContent = `
        .favorites-page { display: flex; flex-direction: column; gap: var(--space-lg); }
        .view-hero { margin-bottom: var(--space-sm); }
        .view-hero h2 { font-size: var(--text-2xl); color: var(--color-accent); margin-bottom: var(--space-xs); }
        .view-hero p { font-size: var(--text-sm); }
        .favorites-list { display: flex; flex-direction: column; gap: var(--space-sm); }
        .favorite-item { display: flex; align-items: center; gap: var(--space-md); }
        .favorite-item .icon { font-size: var(--icon-lg); flex-shrink: 0; }
        .favorite-item .info { flex: 1; min-width: 0; }
        .favorite-item .name { font-weight: 600; margin-bottom: 2px; }
        .favorite-item .meta { font-size: var(--text-sm); color: var(--text-muted); }
        .favorite-remove { min-height: 44px; min-width: 44px; padding: var(--space-xs) var(--space-md); font-size: var(--text-sm); color: var(--color-error); background: transparent; border: 1px solid var(--color-border); border-radius: var(--radius-sm); }
        .favorites-route-actions { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0 16px; }
        .favorites-routes { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
        .favorite-route-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; }
        .favorite-route-item .info { flex: 1; min-width: 0; }
        .empty-state { text-align: center; padding: var(--space-2xl) var(--space-lg); }
        .empty-state .empty-icon { font-size: 48px; display: block; margin-bottom: var(--space-md); }
        .empty-state p { margin-bottom: var(--space-sm); }
        .empty-sub { font-size: var(--text-sm); color: var(--text-muted); margin-bottom: var(--space-lg) !important; }
    `;
    document.head.appendChild(style);
}

export function getFavoriteIds() {
    return readFavoriteIdsFromStore();
}

function setFavoriteIds(ids) {
    const next = (ids || []).map(String);
    setFavoriteIdsRaw(next);
    eventBus.emit(EVENTS.FAVORITES_CHANGED, { favorites: next });
    updateNavBadge(next.length);
}

/** Po logowaniu przejmuje ulubione gościa, jeśli konto jeszcze ich nie ma. */
export function adoptGuestFavoritesForCurrentUser() {
    const user = getCurrentUser();
    if (!user) return;
    const userKey = `${STORAGE_KEY}__${user.id}`;
    const userIds = readFavoriteIdsForKey(userKey);
    if (userIds.length) {
        updateNavBadge(userIds.length);
        return;
    }
    const guestIds = readFavoriteIdsForKey(STORAGE_KEY);
    if (!guestIds.length) {
        updateNavBadge(0);
        return;
    }
    writeFavoriteIdsForKey(userKey, guestIds);
    eventBus.emit(EVENTS.FAVORITES_CHANGED, { favorites: guestIds });
    updateNavBadge(guestIds.length);
}

function updateNavBadge(count) {
    const label = document.querySelector('[data-view="favorites"] .nav-label');
    if (label) {
        label.textContent = formatNavLabel('favorites', count);
    }
}
function getFavoritePlaces() {
    const ids = getFavoriteIds();
    return ids
        .map((id) => getProducerById(id))
        .filter(Boolean);
}

function renderRoutesBlock() {
    const routes = getShoppingRoutes();
    return `
        <section class="favorites-routes-section" aria-label="${t('routes.title')}">
            <h3 class="favorites-routes-title">🗺️ ${t('routes.title')}</h3>
            <p class="text-muted">${t('routes.subtitle')}</p>
            <div class="favorites-routes" id="favoritesRoutesList">
                ${routes.length === 0
        ? `<p class="empty-sub">${t('routes.empty')}</p>`
        : routes.map((route) => `
                    <article class="favorite-route-item card" data-route-id="${escapeHtml(route.id)}">
                        <div class="info">
                            <div class="name">${escapeHtml(route.name)}</div>
                            <div class="meta">${route.producerIds.length} ${escapeHtml(t('routes.stops'))}</div>
                        </div>
                        <button type="button" class="btn-secondary" data-open-route="${escapeHtml(route.id)}">${escapeHtml(t('routes.open'))}</button>
                        <button type="button" class="favorite-remove" data-delete-route="${escapeHtml(route.id)}" aria-label="${escapeHtml(t('btn.remove'))}">✕</button>
                    </article>
                `).join('')}
            </div>
        </section>
    `;
}

function render(container) {
    const places = getFavoritePlaces();
    const count = places.length;

    container.innerHTML = `
        <div class="favorites-page">
            <header class="view-hero">
                <h2>⭐ ${t('favorites.title')}</h2>
                <p class="text-muted">${t('favorites.subtitle')}</p>
            </header>
            ${count >= 2 ? `
                <div class="favorites-route-actions">
                    <button type="button" class="btn-primary" id="favoritesSaveRouteBtn">${t('routes.saveFromFavorites')}</button>
                    <button type="button" class="btn-secondary" id="favoritesOpenRouteBtn">${t('routes.openNow')}</button>
                </div>
            ` : ''}
            ${count === 0 ? renderEmpty() : renderList(places)}
            ${renderRoutesBlock()}
        </div>
    `;
}

function renderEmpty() {
    return `
        <div class="empty-state card">
            <span class="empty-icon" aria-hidden="true">⭐</span>
            <p>${t('favorites.empty')}</p>
            <p class="empty-sub">${t('favorites.emptySub')}</p>
            <button type="button" id="favoritesGoMapBtn" class="btn-primary">${t('btn.toMap')}</button>
        </div>
    `;
}
function renderList(places) {
    return `
        <div class="favorites-list" id="favoritesList">
            ${places.map((place) => `
                <article class="list-item favorite-item card" data-id="${escapeHtml(place.id)}">
                    <span class="icon" aria-hidden="true">${CATEGORY_ICONS[place.category] || '📍'}</span>
                    <div class="info">
                        <div class="name">${escapeHtml(getProducerDisplayName(place))}</div>
                        <div class="meta">${escapeHtml(place.address || '')}</div>
                    </div>
                    <button type="button" class="favorite-remove" data-remove="${escapeHtml(place.id)}" aria-label="${escapeHtml(t('btn.remove'))}">✕</button>
                </article>
            `).join('')}
        </div>
    `;
}

export function refreshFavoritesBadge() {
    updateNavBadge(getFavoriteIds().length);
}

export function getFavoritesCount() {
    return getFavoriteIds().length;
}

function bindEvents(container) {
    if (container.dataset.eventsBound === 'true') return;
    container.dataset.eventsBound = 'true';

    container.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('[data-remove]');
        if (removeBtn) {
            const id = removeBtn.dataset.remove;
            const ids = getFavoriteIds().filter((fid) => fid !== id);
            setFavoriteIds(ids);
            render(container);
            return;
        }

        const item = e.target.closest('.favorite-item');
        if (item?.dataset.id) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[Home] Kliknięto szczegóły:', item.dataset.id);
            openProducerModal(item.dataset.id);
            return;
        }

        if (e.target.closest('#favoritesGoMapBtn')) {
            navigateTo('map');
            return;
        }

        if (e.target.closest('#favoritesSaveRouteBtn')) {
            const ids = orderStopsByDistance(getFavoriteIds());
            const route = saveShoppingRoute({ producerIds: ids });
            if (!route) {
                showToast(t('routes.needTwo'), 'error');
                return;
            }
            trackRouteSaved(route.id, { name: route.name, stops: route.producerIds?.length });
            recordLearningSignal('route', {
                stops: (route.producerIds || []).map(String).slice(0, 12)
            });
            showToast(t('routes.saved'));
            render(container);
            return;
        }

        if (e.target.closest('#favoritesOpenRouteBtn')) {
            const url = openRouteInMaps(getFavoriteIds());
            if (!url) showToast(t('routes.needTwo'), 'error');
            return;
        }

        const openRouteBtn = e.target.closest('[data-open-route]');
        if (openRouteBtn) {
            const route = getShoppingRoutes().find((r) => String(r.id) === String(openRouteBtn.dataset.openRoute));
            if (route) openRouteInMaps(route);
            return;
        }

        const deleteRouteBtn = e.target.closest('[data-delete-route]');
        if (deleteRouteBtn) {
            deleteShoppingRoute(deleteRouteBtn.dataset.deleteRoute);
            render(container);
        }
    });

    updateNavBadge(getFavoriteIds().length);
}

export function addFavorite(id) {
    const sid = String(id);
    const ids = getFavoriteIds();
    if (!ids.includes(sid)) {
        setFavoriteIds([...ids, sid]);
    }
}

export function removeFavorite(id) {
    setFavoriteIds(getFavoriteIds().filter((fid) => fid !== String(id)));
}

export function isFavorite(id) {
    return isFavoriteInStore(id);
}
