// js/views/clientPanel.js – panel konsumenta / klienta

import { getCurrentUser, updateClientProfile, changePassword, logout } from '../auth/auth.js';
import { getProducerById } from '../data/dataService.js';
import { removeFavorite, getFavoriteIds } from './favorites.js';
import { getCartItems, removeCartItem, refreshCartBadge } from './cart.js';
import { getReviewsForUser, buildReviewImageHtml } from '../data/reviews.js';
import { getReservationsForUser } from '../data/reservations.js';
import { t, formatCurrency } from '../core/i18n.js';
import { navigateTo } from '../controllers/navigation.js';
import { showToast } from '../core/toast.js';
import { eventBus } from '../core/eventBus.js';
import { EVENTS } from '../core/events.js';
import { renderReferralSection, bindReferralSection } from './referralSection.js';

function renderClientReservations(userId) {
    const list = getReservationsForUser(userId);
    if (!list.length) {
        return `<p class="account-empty">${escapeHtml(t('reservations.empty'))}</p>`;
    }
    return `
        <ul class="account-list">
            ${list.map((res) => `
                <li class="client-reservation-item">
                    <strong>${escapeHtml(res.producerName || res.producerId)}</strong>
                    <span> · ${escapeHtml(t(`reservations.status_${res.status}`))}</span>
                    <p>${escapeHtml(res.pickupDay)} ${escapeHtml(res.pickupTime)}</p>
                    <ul>${res.items.map((it) => `<li>${escapeHtml(String(it.quantity))}× ${escapeHtml(it.name)}</li>`).join('')}</ul>
                </li>
            `).join('')}
        </ul>
    `;
}

let clientPanelUnsubscribe = null;

function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function authErrorMessage(code) {
    const key = `auth.errors.${code}`;
    const text = t(key);
    return text === key ? t('auth.errors.generic') : text;
}

function renderFavoritesList() {
    const ids = getFavoriteIds();
    if (!ids.length) {
        return `<p class="account-empty">${escapeHtml(t('clientPanel.noFavorites'))}</p>`;
    }

    return ids.map((id) => {
        const producer = getProducerById(id);
        const name = producer?.name || id;
        return `
            <div class="account-row" data-favorite-id="${escapeHtml(id)}">
                <div class="account-row-info">
                    <div class="account-row-name">${escapeHtml(name)}</div>
                </div>
                <button type="button" class="btn-remove-inline" data-remove-favorite="${escapeHtml(id)}">${escapeHtml(t('btn.remove'))}</button>
            </div>
        `;
    }).join('');
}

function renderCartList() {
    const items = getCartItems();
    if (!items.length) {
        return `<p class="account-empty">${escapeHtml(t('clientPanel.noCart'))}</p>`;
    }

    return items.map((item) => `
        <div class="account-row" data-cart-id="${escapeHtml(item.id)}">
            <div class="account-row-info">
                <div class="account-row-name">${escapeHtml(item.name || t('cart.product'))}</div>
                <div class="account-row-meta">${escapeHtml(item.place || '')} · ${escapeHtml(formatCurrency((item.price || 0) * (item.quantity || 1)))}</div>
            </div>
            <button type="button" class="btn-remove-inline" data-remove-cart="${escapeHtml(item.id)}">${escapeHtml(t('btn.remove'))}</button>
        </div>
    `).join('');
}

function renderPasswordForm() {
    return `
        <section class="account-panel card">
            <h3 class="account-panel-title">${escapeHtml(t('auth.changePassword'))}</h3>
            <form id="clientPasswordForm" class="account-form">
                <div class="account-field">
                    <label for="clientCurrentPassword">${escapeHtml(t('auth.currentPassword'))}</label>
                    <input id="clientCurrentPassword" name="currentPassword" type="password" autocomplete="current-password" required minlength="6">
                </div>
                <div class="account-field">
                    <label for="clientNewPassword">${escapeHtml(t('auth.newPassword'))}</label>
                    <input id="clientNewPassword" name="newPassword" type="password" autocomplete="new-password" required minlength="6">
                </div>
                <div class="account-field">
                    <label for="clientNewPasswordConfirm">${escapeHtml(t('auth.passwordConfirm'))}</label>
                    <input id="clientNewPasswordConfirm" name="newPasswordConfirm" type="password" autocomplete="new-password" required minlength="6">
                </div>
                <p id="clientPasswordError" class="auth-error" role="alert"></p>
                <button type="submit" class="btn-primary">${escapeHtml(t('auth.changePassword'))}</button>
            </form>
        </section>
    `;
}

export function renderClientPanel(container) {
    const user = getCurrentUser();
    if (!user) return;

    const reviews = getReviewsForUser(user);

    container.innerHTML = `
        <section class="account-panel card">
            <h3 class="account-panel-title">${escapeHtml(t('clientPanel.title'))}</h3>
            <p class="account-panel-sub">${escapeHtml(t('clientPanel.subtitle'))}</p>

            <form id="clientProfileForm" class="account-form">
                <div class="account-field">
                    <label for="clientDisplayName">${escapeHtml(t('clientPanel.name'))}</label>
                    <input id="clientDisplayName" name="displayName" type="text" value="${escapeHtml(user.displayName)}" required>
                </div>
                <div class="account-field">
                    <label for="clientEmail">${escapeHtml(t('auth.email'))}</label>
                    <input id="clientEmail" type="email" value="${escapeHtml(user.email)}" disabled>
                </div>
                <button type="submit" class="btn-primary">${escapeHtml(t('clientPanel.saveProfile'))}</button>
            </form>
        </section>

        ${renderReferralSection(user.id)}

        ${renderPasswordForm()}

        <section class="account-panel card">
            <h3 class="account-panel-title">❤️ ${escapeHtml(t('clientPanel.favoritesTitle'))}</h3>
            <div id="clientFavoritesList">${renderFavoritesList()}</div>
        </section>

        <section class="account-panel card">
            <h3 class="account-panel-title">🛒 ${escapeHtml(t('clientPanel.cartTitle'))}</h3>
            <div id="clientCartList">${renderCartList()}</div>
        </section>

        <section class="account-panel card">
            <h3 class="account-panel-title">${escapeHtml(t('clientPanel.reviewsTitle'))}</h3>
            <p class="account-panel-sub">${escapeHtml(t('clientPanel.reviewsHint'))}</p>
            ${reviews.length === 0
        ? `<p class="account-empty">${escapeHtml(t('clientPanel.noReviews'))}</p>`
        : `<ul class="account-list">${reviews.map((r) => `
                    <li class="client-review-item">
                        <strong>${escapeHtml(r.user)}</strong> · ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
                        <p>${escapeHtml(r.comment)}</p>
                        ${buildReviewImageHtml(r.imageUrl, 'client-review-image')}
                    </li>
                `).join('')}</ul>`}
            <button type="button" class="btn-secondary" id="clientGoMapBtn">${escapeHtml(t('clientPanel.findToReview'))}</button>
        </section>

        <section class="account-panel card">
            <h3 class="account-panel-title">📦 ${escapeHtml(t('reservations.title'))}</h3>
            ${renderClientReservations(user.id)}
        </section>

        <button type="button" id="clientLogoutBtn" class="btn-secondary account-logout">${escapeHtml(t('auth.logout'))}</button>
    `;

    bindClientPanelEvents(container);
    bindReferralSection(container);
}

function refreshClientLists(container) {
    const favList = container.querySelector('#clientFavoritesList');
    const cartList = container.querySelector('#clientCartList');
    if (favList) favList.innerHTML = renderFavoritesList();
    if (cartList) cartList.innerHTML = renderCartList();
    bindClientListActions(container);
}

function bindClientListActions(container) {
    container.querySelectorAll('[data-remove-favorite]').forEach((btn) => {
        btn.replaceWith(btn.cloneNode(true));
    });
    container.querySelectorAll('[data-remove-cart]').forEach((btn) => {
        btn.replaceWith(btn.cloneNode(true));
    });

    container.querySelectorAll('[data-remove-favorite]').forEach((btn) => {
        btn.addEventListener('click', () => {
            removeFavorite(btn.dataset.removeFavorite);
            showToast(t('msg.removedFromFavorites'));
            refreshClientLists(container);
        });
    });

    container.querySelectorAll('[data-remove-cart]').forEach((btn) => {
        btn.addEventListener('click', () => {
            removeCartItem(btn.dataset.removeCart);
            refreshCartBadge();
            showToast(t('msg.removedFromCart'));
            refreshClientLists(container);
        });
    });
}

function bindClientPanelEvents(container) {
    container.querySelector('#clientProfileForm')?.addEventListener('submit', (event) => {
        event.preventDefault();
        updateClientProfile({ displayName: event.currentTarget.displayName.value });
        showToast(t('clientPanel.saved'));
    });

    container.querySelector('#clientPasswordForm')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const errorEl = container.querySelector('#clientPasswordError');
        const result = await changePassword({
            currentPassword: form.currentPassword.value,
            newPassword: form.newPassword.value,
            newPasswordConfirm: form.newPasswordConfirm.value
        });
        if (!result.ok) {
            if (errorEl) errorEl.textContent = authErrorMessage(result.error);
            return;
        }
        if (errorEl) errorEl.textContent = '';
        form.reset();
        showToast(t('auth.passwordChanged'));
    });

    container.querySelector('#clientLogoutBtn')?.addEventListener('click', () => {
        logout();
        showToast(t('auth.loggedOut'));
        navigateTo('profile', { force: true });
    });

    container.querySelector('#clientGoMapBtn')?.addEventListener('click', () => {
        navigateTo('map');
    });

    bindClientListActions(container);

    if (clientPanelUnsubscribe) {
        clientPanelUnsubscribe();
        clientPanelUnsubscribe = null;
    }

    const onDataChange = () => {
        if (!container.isConnected) {
            clientPanelUnsubscribe?.();
            clientPanelUnsubscribe = null;
            return;
        }
        refreshClientLists(container);
    };
    const unsubFav = eventBus.on(EVENTS.FAVORITES_CHANGED, onDataChange);
    const unsubCart = eventBus.on(EVENTS.CART_CHANGED, onDataChange);
    clientPanelUnsubscribe = () => {
        unsubFav();
        unsubCart();
    };
}

export default { renderClientPanel };
