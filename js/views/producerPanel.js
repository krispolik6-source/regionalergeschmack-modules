// js/views/producerPanel.js – panel przedsiębiorcy/producenta

import { getCurrentUser, logout, changePassword } from '../auth/auth.js';
import {
    getProducerAccount,
    saveProducerAccount,
    PRODUCER_CATEGORIES,
    createProduct,
    createPromotion
} from '../data/userProducerStore.js';
import { t } from '../core/i18n.js';
import { navigateTo } from '../controllers/navigation.js';
import { showToast } from '../core/toast.js';
import { refreshUserProducersOnMap } from '../data/dataService.js';
import { getLastPosition } from '../core/userLocation.js';
import { renderTrialSection, bindTrialSection } from './trialSection.js';
import { renderReferralSection, bindReferralSection } from './referralSection.js';
import {
    isPremiumActive,
    isProducerPremiumFlag,
    isProducerPromoted,
    activateProfileHighlight
} from '../core/premiumService.js';
import {
    getReservationsForProducer,
    updateReservationStatus,
    RESERVATION_STATUSES
} from '../data/reservations.js';
import { getReviews, replyToReview } from '../data/reviews.js';
import { PRODUCT_AVAILABILITY } from '../presentation/productAvailability.js';

function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function loadAccount(userId) {
    const coords = getLastPosition();
    return getProducerAccount(userId) || {
        profile: {
            name: '',
            description: '',
            address: '',
            phone: '',
            email: '',
            categories: ['farmer'],
            lat: coords?.lat ?? null,
            lng: coords?.lng ?? null
        },
        products: [],
        promotions: [],
        photos: []
    };
}

function categoryLabel(id) {
    const text = t(`producer.types.${id}`);
    return text === `producer.types.${id}` ? id : text;
}

function renderProfileSection(account) {
    const p = account.profile;
    const selected = new Set(p.categories || []);
    return `
        <form id="producerProfileForm" class="account-form">
            <div class="account-field">
                <label for="producerName">${escapeHtml(t('producerPanel.name'))}</label>
                <input id="producerName" name="name" type="text" value="${escapeHtml(p.name)}" required>
            </div>
            <div class="account-field">
                <label for="producerDescription">${escapeHtml(t('producerPanel.description'))}</label>
                <textarea id="producerDescription" name="description" rows="3">${escapeHtml(p.description)}</textarea>
            </div>
            <div class="account-field">
                <label for="producerAddress">${escapeHtml(t('producerPanel.address'))}</label>
                <input id="producerAddress" name="address" type="text" value="${escapeHtml(p.address)}">
            </div>
            <div class="account-field">
                <label for="producerPhone">${escapeHtml(t('producerPanel.phone'))}</label>
                <input id="producerPhone" name="phone" type="tel" value="${escapeHtml(p.phone)}">
            </div>
            <div class="account-field">
                <label for="producerEmail">${escapeHtml(t('producerPanel.email'))}</label>
                <input id="producerEmail" name="email" type="email" value="${escapeHtml(p.email)}">
            </div>
            <div class="account-field">
                <label for="producerWebsite">${escapeHtml(t('producerPanel.website'))}</label>
                <input id="producerWebsite" name="website" type="url" placeholder="https://" value="${escapeHtml(p.website || '')}">
            </div>
            <div class="account-grid-2">
                <div class="account-field">
                    <label for="producerFacebook">${escapeHtml(t('producerPanel.facebook'))}</label>
                    <input id="producerFacebook" name="facebook" type="url" placeholder="https://facebook.com/…" value="${escapeHtml(p.facebook || '')}">
                </div>
                <div class="account-field">
                    <label for="producerInstagram">${escapeHtml(t('producerPanel.instagram'))}</label>
                    <input id="producerInstagram" name="instagram" type="url" placeholder="https://instagram.com/…" value="${escapeHtml(p.instagram || '')}">
                </div>
            </div>
            <div class="account-field">
                <label for="producerTiktok">${escapeHtml(t('producerPanel.tiktok'))}</label>
                <input id="producerTiktok" name="tiktok" type="url" placeholder="https://tiktok.com/@…" value="${escapeHtml(p.tiktok || '')}">
            </div>
            <div class="account-field">
                <label for="producerHours">${escapeHtml(t('producerPanel.openingHours'))}</label>
                <input id="producerHours" name="openingHours" type="text" placeholder="${escapeHtml(t('producerPanel.hoursPlaceholder'))}" value="${escapeHtml(p.openingHours || p.hours || '')}">
                <small class="account-field-hint">${escapeHtml(t('producerPanel.openingHoursHint'))}</small>
            </div>
            <fieldset class="account-field">
                <legend>${escapeHtml(t('producerPanel.categories'))}</legend>
                <div class="account-checkboxes">
                    ${PRODUCER_CATEGORIES.map((cat) => `
                        <label class="account-check">
                            <input type="checkbox" name="categories" value="${cat.id}" ${selected.has(cat.id) ? 'checked' : ''}>
                            ${escapeHtml(categoryLabel(cat.id))}
                        </label>
                    `).join('')}
                </div>
            </fieldset>
            <div class="account-grid-2">
                <div class="account-field">
                    <label for="producerLat">${escapeHtml(t('producerPanel.lat'))}</label>
                    <input id="producerLat" name="lat" type="number" step="0.0001" value="${escapeHtml(p.lat)}">
                </div>
                <div class="account-field">
                    <label for="producerLng">${escapeHtml(t('producerPanel.lng'))}</label>
                    <input id="producerLng" name="lng" type="number" step="0.0001" value="${escapeHtml(p.lng)}">
                </div>
            </div>
            <button type="submit" class="btn-primary">${escapeHtml(t('producerPanel.saveProfile'))}</button>
        </form>
    `;
}

function renderProductsSection(account) {
    const products = account.products || [];
    return `
        <div class="account-list-header">
            <h4>${escapeHtml(t('producerPanel.productsTitle'))}</h4>
            <button type="button" class="btn-secondary" id="producerAddProductBtn">+ ${escapeHtml(t('producerPanel.addProduct'))}</button>
        </div>
        <div id="producerProductsList" class="account-items">
            ${products.length === 0
        ? `<p class="account-empty">${escapeHtml(t('producerPanel.noProducts'))}</p>`
        : products.map((product, index) => renderProductEditor(product, index)).join('')}
        </div>
        <button type="button" id="producerSaveProductsBtn" class="btn-primary">${escapeHtml(t('producerPanel.saveProducts'))}</button>
    `;
}

function renderProductEditor(product, index) {
    const avail = product.available || PRODUCT_AVAILABILITY.available;
    return `
        <div class="account-item card" data-product-index="${index}">
            <div class="account-grid-2">
                <div class="account-field">
                    <label>${escapeHtml(t('producerPanel.productName'))}</label>
                    <input type="text" data-field="name" value="${escapeHtml(product.name)}" aria-label="${escapeHtml(t('producerPanel.productName'))}">
                </div>
                <div class="account-field">
                    <label>${escapeHtml(t('producerPanel.price'))}</label>
                    <input type="number" step="0.01" min="0" data-field="price" value="${escapeHtml(product.price)}" aria-label="${escapeHtml(t('producerPanel.price'))}">
                </div>
            </div>
            <div class="account-grid-2">
                <div class="account-field">
                    <label>${escapeHtml(t('producerPanel.unit'))}</label>
                    <input type="text" data-field="unit" value="${escapeHtml(product.unit)}">
                </div>
                <div class="account-field">
                    <label>${escapeHtml(t('producerPanel.productCategory'))}</label>
                    <input type="text" data-field="category" value="${escapeHtml(product.category || '')}" placeholder="${escapeHtml(t('producerPanel.categoryPlaceholder'))}">
                </div>
            </div>
            <div class="account-grid-2">
                <div class="account-field">
                    <label>${escapeHtml(t('producerPanel.availability'))}</label>
                    <select data-field="available" aria-label="${escapeHtml(t('producerPanel.availability'))}">
                        <option value="available" ${avail === 'available' ? 'selected' : ''}>✅ ${escapeHtml(t('product.availabilityAvailable'))}</option>
                        <option value="low" ${avail === 'low' ? 'selected' : ''}>⚠️ ${escapeHtml(t('product.availabilityLow'))}</option>
                        <option value="soldout" ${avail === 'soldout' ? 'selected' : ''}>❌ ${escapeHtml(t('product.availabilitySoldout'))}</option>
                    </select>
                </div>
                <div class="account-field">
                    <label>${escapeHtml(t('producerPanel.stockQty'))}</label>
                    <input type="number" min="0" step="1" data-field="stockQty" value="${escapeHtml(product.stockQty ?? '')}" placeholder="${escapeHtml(t('producerPanel.stockPlaceholder'))}">
                </div>
            </div>
            <div class="account-checkboxes account-checkboxes--inline">
                <label class="account-check">
                    <input type="checkbox" data-field="seasonal" ${product.seasonal ? 'checked' : ''}>
                    🌱 ${escapeHtml(t('product.seasonalBadge'))}
                </label>
                <label class="account-check">
                    <input type="checkbox" data-field="onPromo" ${product.onPromo || product.promo ? 'checked' : ''}>
                    🔥 ${escapeHtml(t('product.promoBadge'))}
                </label>
                <label class="account-check">
                    <input type="checkbox" data-field="hidden" ${product.hidden ? 'checked' : ''}>
                    ${escapeHtml(t('producerPanel.hideProduct'))}
                </label>
            </div>
            <div class="account-field">
                <label>${escapeHtml(t('producerPanel.promo'))}</label>
                <input type="text" data-field="promo" value="${escapeHtml(product.promo)}">
            </div>
            <div class="account-field">
                <label>${escapeHtml(t('producerPanel.productDescription'))}</label>
                <textarea rows="2" data-field="description">${escapeHtml(product.description)}</textarea>
            </div>
            <div class="account-field">
                <label>${escapeHtml(t('producerPanel.imageUrl'))}</label>
                <input type="url" data-field="imageUrl" value="${escapeHtml(product.imageUrl)}" placeholder="https://" aria-label="${escapeHtml(t('producerPanel.imageUrl'))}">
            </div>
            <button type="button" class="btn-secondary account-remove-btn" data-remove-product="${index}">${escapeHtml(t('btn.remove'))}</button>
        </div>
    `;
}

function renderReservationsSection(userId) {
    const producerId = `user-producer-${userId}`;
    const list = getReservationsForProducer(userId, producerId);
    if (!list.length) {
        return `<p class="account-empty">${escapeHtml(t('reservations.emptyProducer'))}</p>`;
    }
    return `
        <div class="account-items" id="producerReservationsList">
            ${list.map((res) => `
                <div class="account-item card" data-reservation-id="${escapeHtml(res.id)}">
                    <p><strong>${escapeHtml(res.userName)}</strong> · ${escapeHtml(res.pickupDay)} ${escapeHtml(res.pickupTime)}</p>
                    <ul class="reservation-items">
                        ${res.items.map((it) => `<li>${escapeHtml(String(it.quantity))}× ${escapeHtml(it.name)}</li>`).join('')}
                    </ul>
                    <label class="account-field">
                        <span>${escapeHtml(t('reservations.status'))}</span>
                        <select data-reservation-status="${escapeHtml(res.id)}" aria-label="${escapeHtml(t('reservations.status'))}">
                            ${RESERVATION_STATUSES.map((st) => `
                                <option value="${st}" ${res.status === st ? 'selected' : ''}>${escapeHtml(t(`reservations.status_${st}`))}</option>
                            `).join('')}
                        </select>
                    </label>
                </div>
            `).join('')}
        </div>
    `;
}

function renderReviewsReplySection(userId) {
    const producerId = `user-producer-${userId}`;
    const reviews = getReviews(producerId, 'newest').slice(0, 12);
    if (!reviews.length) {
        return `<p class="account-empty">${escapeHtml(t('reviews.empty'))}</p>`;
    }
    return `
        <div class="account-items">
            ${reviews.map((rev) => `
                <div class="account-item card" data-review-id="${escapeHtml(rev.id || '')}">
                    <p><strong>${escapeHtml(rev.user)}</strong> ${'★'.repeat(rev.rating || 0)}</p>
                    <p>${escapeHtml(rev.comment)}</p>
                    ${rev.reply?.text ? `<p class="producer-review-reply"><em>${escapeHtml(t('reviews.replyLabel'))}:</em> ${escapeHtml(rev.reply.text)}</p>` : ''}
                    <form class="producer-reply-form" data-reply-review="${escapeHtml(rev.id || '')}">
                        <label class="account-field">
                            <span>${escapeHtml(t('reviews.replyPlaceholder'))}</span>
                            <textarea name="reply" rows="2" required maxlength="800" aria-label="${escapeHtml(t('reviews.replyPlaceholder'))}"></textarea>
                        </label>
                        <button type="submit" class="btn-secondary">${escapeHtml(t('reviews.replySubmit'))}</button>
                    </form>
                </div>
            `).join('')}
        </div>
    `;
}

function renderPromotionEditor(promo, index, products) {
    const productOptions = [
        `<option value="">${escapeHtml(t('producerPanel.noProductSelected'))}</option>`,
        ...products.map((product) => `
            <option value="${escapeHtml(product.id)}" ${promo.productId === product.id ? 'selected' : ''}>
                ${escapeHtml(product.name || product.id)}
            </option>
        `)
    ].join('');

    return `
        <div class="account-item card" data-promo-index="${index}">
            <div class="account-field">
                <label>${escapeHtml(t('producerPanel.promoTitle'))}</label>
                <input type="text" data-promo-field="title" value="${escapeHtml(promo.title)}">
            </div>
            <div class="account-field">
                <label>${escapeHtml(t('producerPanel.promoDescription'))}</label>
                <textarea rows="2" data-promo-field="description">${escapeHtml(promo.description)}</textarea>
            </div>
            <div class="account-grid-2">
                <div class="account-field">
                    <label>${escapeHtml(t('producerPanel.promoProduct'))}</label>
                    <select data-promo-field="productId">${productOptions}</select>
                </div>
                <div class="account-field">
                    <label>${escapeHtml(t('producerPanel.discount'))}</label>
                    <input type="text" data-promo-field="discount" value="${escapeHtml(promo.discount)}" placeholder="10%">
                </div>
            </div>
            <button type="button" class="btn-secondary account-remove-btn" data-remove-promo="${index}">${escapeHtml(t('btn.remove'))}</button>
        </div>
    `;
}

function renderPromotionsSection(account) {
    const promotions = account.promotions || [];
    const products = account.products || [];
    return `
        <div class="account-list-header">
            <h4>${escapeHtml(t('producerPanel.promotionsTitle'))}</h4>
            <button type="button" class="btn-secondary" id="producerAddPromoBtn">+ ${escapeHtml(t('producerPanel.addPromotion'))}</button>
        </div>
        <div id="producerPromotionsList" class="account-items">
            ${promotions.length === 0
        ? `<p class="account-empty">${escapeHtml(t('producerPanel.noPromotions'))}</p>`
        : promotions.map((promo, index) => renderPromotionEditor(promo, index, products)).join('')}
        </div>
        <button type="button" id="producerSavePromosBtn" class="btn-primary">${escapeHtml(t('producerPanel.savePromotions'))}</button>
    `;
}

function renderPhotosSection(account) {
    const photos = account.photos || [];
    return `
        <div class="account-list-header">
            <h4>${escapeHtml(t('producerPanel.photosTitle'))}</h4>
        </div>
        <form id="producerPhotoForm" class="account-form account-inline-form">
            <div class="account-field">
                <label for="producerPhotoUrl">${escapeHtml(t('producerPanel.photoUrl'))}</label>
                <input id="producerPhotoUrl" type="url" placeholder="https://">
            </div>
            <div class="account-field">
                <label for="producerPhotoFile">${escapeHtml(t('producerPanel.photoFile'))}</label>
                <input id="producerPhotoFile" type="file" accept="image/*">
            </div>
            <button type="submit" class="btn-secondary">${escapeHtml(t('producerPanel.addPhoto'))}</button>
        </form>
        <ul id="producerPhotosList" class="account-list">
            ${photos.length === 0
        ? `<li class="account-empty">${escapeHtml(t('producerPanel.noPhotos'))}</li>`
        : photos.map((url, index) => `
                <li class="account-photo-item">
                    <img src="${escapeHtml(url)}" alt="${escapeHtml(t('producerPanel.photoAlt'))}" loading="lazy" width="72" height="72">
                    <span>${escapeHtml(url)}</span>
                    <button type="button" class="btn-secondary" data-remove-photo="${index}">${escapeHtml(t('btn.remove'))}</button>
                </li>
            `).join('')}
        </ul>
    `;
}

function renderHighlightProfileCta(userId) {
    const producerId = `user-producer-${userId}`;
    const active = isProducerPremiumFlag() || isProducerPromoted(producerId);

    if (active) {
        return `
            <section class="account-panel card producer-highlight-card producer-highlight-card--active" data-producer-highlight>
                <p class="producer-premium-badge" role="status">⭐ ${escapeHtml(t('ads.promoted'))}</p>
                <p class="account-panel-sub">${escapeHtml(t('producerPanel.highlightActiveNote'))}</p>
            </section>
        `;
    }

    return `
        <section class="account-panel card producer-highlight-card" data-producer-highlight>
            <h4 class="account-panel-title">⭐ ${escapeHtml(t('producerPanel.highlightProfile'))}</h4>
            <p class="account-panel-sub">${escapeHtml(t('producerPanel.highlightHint'))}</p>
            <ul class="producer-highlight-benefits">
                <li>${escapeHtml(t('producerPanel.highlightBenefitMap'))}</li>
                <li>${escapeHtml(t('producerPanel.highlightBenefitList'))}</li>
            </ul>
            <button type="button" class="btn-primary" id="producerHighlightBtn" data-producer-highlight-cta>
                ⭐ ${escapeHtml(t('producerPanel.highlightProfile'))}
            </button>
            <p class="text-muted">${escapeHtml(t('premium.adsFundedNote'))}</p>
        </section>
    `;
}

export function renderProducerPanel(container) {
    const user = getCurrentUser();
    if (!user) return;

    let account = loadAccount(user.id);

    container.innerHTML = `
        <section class="account-panel card">
            <h3 class="account-panel-title">${escapeHtml(t('producerPanel.title'))}</h3>
            <p class="account-panel-sub">${escapeHtml(t('producerPanel.subtitle'))}</p>
            <p class="auth-trial-note">${escapeHtml(t('auth.trialNote'))}</p>
            ${renderHighlightProfileCta(user.id)}
            ${renderTrialSection('producer')}
            ${renderReferralSection(user.id)}
            <div class="account-tabs" role="tablist" aria-label="${escapeHtml(t('producerPanel.title'))}">
                <button type="button" class="account-tab is-active" role="tab" aria-selected="true" data-tab="profile">${escapeHtml(t('producerPanel.tabProfile'))}</button>
                <button type="button" class="account-tab" role="tab" aria-selected="false" data-tab="products">${escapeHtml(t('producerPanel.tabProducts'))}</button>
                <button type="button" class="account-tab" role="tab" aria-selected="false" data-tab="promotions">${escapeHtml(t('producerPanel.tabPromotions'))}</button>
                <button type="button" class="account-tab" role="tab" aria-selected="false" data-tab="photos">${escapeHtml(t('producerPanel.tabPhotos'))}</button>
                <button type="button" class="account-tab" role="tab" aria-selected="false" data-tab="reservations">${escapeHtml(t('producerPanel.tabReservations'))}</button>
                <button type="button" class="account-tab" role="tab" aria-selected="false" data-tab="reviews">${escapeHtml(t('producerPanel.tabReviews'))}</button>
                <button type="button" class="account-tab" role="tab" aria-selected="false" data-tab="stats">${escapeHtml(t('producerPanel.tabStats'))}</button>
            </div>
        </section>

        <section class="account-panel card" id="producerTabProfile" role="tabpanel">${renderProfileSection(account)}</section>
        <section class="account-panel card" id="producerTabProducts" role="tabpanel" hidden>${renderProductsSection(account)}</section>
        <section class="account-panel card" id="producerTabPromotions" role="tabpanel" hidden>${renderPromotionsSection(account)}</section>
        <section class="account-panel card" id="producerTabPhotos" role="tabpanel" hidden>${renderPhotosSection(account)}</section>
        <section class="account-panel card" id="producerTabReservations" role="tabpanel" hidden>
            <h4>${escapeHtml(t('reservations.title'))}</h4>
            ${renderReservationsSection(user.id)}
        </section>
        <section class="account-panel card" id="producerTabReviews" role="tabpanel" hidden>
            <h4>${escapeHtml(t('reviews.replySectionTitle'))}</h4>
            ${renderReviewsReplySection(user.id)}
        </section>
        <section class="account-panel card" id="producerTabStats" role="tabpanel" hidden>
            <h4>${escapeHtml(t('producerPanel.statsTitle'))}</h4>
            <ul class="account-stats-list">
                <li>${escapeHtml(t('producerPanel.statsProducts'))}: <strong>${(account.products || []).length}</strong></li>
                <li>${escapeHtml(t('producerPanel.statsPhotos'))}: <strong>${(account.photos || []).length}</strong></li>
                <li>${escapeHtml(t('producerPanel.statsReviews'))}: <strong>${getReviews(`user-producer-${user.id}`).length}</strong></li>
                <li>${escapeHtml(t('producerPanel.statsReservations'))}: <strong>${getReservationsForProducer(user.id, `user-producer-${user.id}`).length}</strong></li>
            </ul>
        </section>

        <section class="account-panel card">
            <h3 class="account-panel-title">${escapeHtml(t('auth.changePassword'))}</h3>
            <form id="producerPasswordForm" class="account-form">
                <div class="account-field">
                    <label for="producerCurrentPassword">${escapeHtml(t('auth.currentPassword'))}</label>
                    <input id="producerCurrentPassword" name="currentPassword" type="password" autocomplete="current-password" required minlength="6">
                </div>
                <div class="account-field">
                    <label for="producerNewPassword">${escapeHtml(t('auth.newPassword'))}</label>
                    <input id="producerNewPassword" name="newPassword" type="password" autocomplete="new-password" required minlength="6">
                </div>
                <div class="account-field">
                    <label for="producerNewPasswordConfirm">${escapeHtml(t('auth.passwordConfirm'))}</label>
                    <input id="producerNewPasswordConfirm" name="newPasswordConfirm" type="password" autocomplete="new-password" required minlength="6">
                </div>
                <p id="producerPasswordError" class="auth-error" role="alert"></p>
                <button type="submit" class="btn-primary">${escapeHtml(t('auth.changePassword'))}</button>
            </form>
        </section>

        <div class="account-actions">
            <button type="button" id="producerViewMapBtn" class="btn-secondary">${escapeHtml(t('producerPanel.viewOnMap'))}</button>
            <button type="button" id="producerLogoutBtn" class="btn-secondary account-logout">${escapeHtml(t('auth.logout'))}</button>
        </div>
    `;

    bindProducerPanelEvents(container, user.id, account);
    bindTrialSection(container, {
        role: 'producer',
        onChanged: () => renderProducerPanel(container)
    });
    bindReferralSection(container);

    container.querySelector('#producerHighlightBtn')?.addEventListener('click', () => {
        const result = activateProfileHighlight(`user-producer-${user.id}`);
        if (result?.ok) {
            showToast(t('producerPanel.highlightActivated'));
            renderProducerPanel(container);
        } else {
            showToast(t('auth.errors.generic'));
        }
    });

    document.body.classList.toggle('premium-active', isPremiumActive());
}

function authErrorMessage(code) {
    const key = `auth.errors.${code}`;
    const text = t(key);
    return text === key ? t('auth.errors.generic') : text;
}

function bindProducerPanelEvents(container, userId, account) {
    const getAccount = () => loadAccount(userId);

    container.querySelector('#producerPasswordForm')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const errorEl = container.querySelector('#producerPasswordError');
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

    container.querySelectorAll('.account-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
            const id = tab.dataset.tab;
            container.querySelectorAll('.account-tab').forEach((btn) => {
                const active = btn === tab;
                btn.classList.toggle('is-active', active);
                btn.setAttribute('aria-selected', active ? 'true' : 'false');
            });
            ['profile', 'products', 'promotions', 'photos', 'reservations', 'reviews', 'stats'].forEach((name) => {
                const panel = container.querySelector(`#producerTab${name.charAt(0).toUpperCase()}${name.slice(1)}`);
                if (panel) panel.hidden = name !== id;
            });
        });
    });

    container.querySelector('#producerProfileForm')?.addEventListener('submit', (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const current = getAccount();
        const categories = Array.from(form.querySelectorAll('input[name="categories"]:checked')).map((el) => el.value);
        current.profile = {
            ...current.profile,
            name: form.name.value.trim(),
            description: form.description.value.trim(),
            address: form.address.value.trim(),
            phone: form.phone.value.trim(),
            email: form.email.value.trim(),
            website: form.website?.value?.trim() || '',
            facebook: form.facebook?.value?.trim() || '',
            instagram: form.instagram?.value?.trim() || '',
            tiktok: form.tiktok?.value?.trim() || '',
            openingHours: form.openingHours?.value?.trim() || '',
            categories: categories.length ? categories : ['farmer'],
            lat: Number(form.lat.value) || current.profile.lat,
            lng: Number(form.lng.value) || current.profile.lng
        };
        saveProducerAccount(userId, current);
        refreshUserProducersOnMap();
        showToast(t('producerPanel.saved'));
    });

    container.querySelector('#producerAddProductBtn')?.addEventListener('click', () => {
        const current = getAccount();
        current.products.push(createProduct());
        saveProducerAccount(userId, current);
        renderProducerPanel(container);
    });

    container.querySelector('#producerSaveProductsBtn')?.addEventListener('click', () => {
        const current = getAccount();
        const items = container.querySelectorAll('[data-product-index]');
        current.products = Array.from(items).map((item, index) => {
            const base = current.products[index] || createProduct();
            const read = (field) => item.querySelector(`[data-field="${field}"]`)?.value ?? '';
            const checked = (field) => Boolean(item.querySelector(`[data-field="${field}"]`)?.checked);
            const stockRaw = read('stockQty').trim();
            return {
                ...base,
                name: read('name').trim(),
                price: Number(read('price')) || 0,
                unit: read('unit').trim(),
                category: read('category').trim(),
                available: read('available') || 'available',
                stockQty: stockRaw === '' ? null : Math.max(0, Number(stockRaw) || 0),
                seasonal: checked('seasonal'),
                onPromo: checked('onPromo'),
                hidden: checked('hidden'),
                promo: read('promo').trim(),
                description: read('description').trim(),
                imageUrl: read('imageUrl').trim(),
                isSampleImage: !read('imageUrl').trim()
            };
        }).filter((p) => p.name);
        saveProducerAccount(userId, current);
        refreshUserProducersOnMap();
        showToast(t('producerPanel.productsSaved'));
    });

    container.querySelectorAll('[data-remove-product]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const current = getAccount();
            current.products.splice(Number(btn.dataset.removeProduct), 1);
            saveProducerAccount(userId, current);
            renderProducerPanel(container);
        });
    });

    container.querySelector('#producerAddPromoBtn')?.addEventListener('click', () => {
        const current = getAccount();
        current.promotions.push(createPromotion());
        saveProducerAccount(userId, current);
        renderProducerPanel(container);
    });

    container.querySelector('#producerSavePromosBtn')?.addEventListener('click', () => {
        const current = getAccount();
        const items = container.querySelectorAll('[data-promo-index]');
        current.promotions = Array.from(items).map((item, index) => {
            const base = current.promotions[index] || createPromotion();
            const read = (field) => item.querySelector(`[data-promo-field="${field}"]`)?.value ?? '';
            return {
                ...base,
                title: read('title').trim(),
                description: read('description').trim(),
                productId: read('productId').trim(),
                discount: read('discount').trim()
            };
        }).filter((p) => p.title);
        saveProducerAccount(userId, current);
        refreshUserProducersOnMap();
        showToast(t('producerPanel.promotionsSaved'));
    });

    container.querySelectorAll('[data-remove-promo]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const current = getAccount();
            current.promotions.splice(Number(btn.dataset.removePromo), 1);
            saveProducerAccount(userId, current);
            renderProducerPanel(container);
        });
    });

    container.querySelector('#producerPhotoForm')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const input = container.querySelector('#producerPhotoUrl');
        const fileInput = container.querySelector('#producerPhotoFile');
        const url = input?.value?.trim();
        const file = fileInput?.files?.[0];
        let photoUrl = url || '';
        if (file) {
            if (file.size > 1_200_000) {
                showToast(t('reviews.imageTooLarge'), 'error');
                return;
            }
            photoUrl = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result || ''));
                reader.onerror = () => resolve('');
                reader.readAsDataURL(file);
            });
        }
        if (!photoUrl) return;
        const current = getAccount();
        current.photos.push(photoUrl);
        saveProducerAccount(userId, current);
        refreshUserProducersOnMap();
        renderProducerPanel(container);
    });

    container.querySelectorAll('[data-remove-photo]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const current = getAccount();
            current.photos.splice(Number(btn.dataset.removePhoto), 1);
            saveProducerAccount(userId, current);
            refreshUserProducersOnMap();
            renderProducerPanel(container);
        });
    });

    container.querySelectorAll('[data-reservation-status]').forEach((select) => {
        select.addEventListener('change', () => {
            const id = select.getAttribute('data-reservation-status');
            const updated = updateReservationStatus(id, select.value);
            if (updated) showToast(t('reservations.statusUpdated'));
        });
    });

    container.querySelectorAll('.producer-reply-form').forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const reviewId = form.getAttribute('data-reply-review');
            const text = new FormData(form).get('reply');
            const updated = replyToReview(reviewId, text, userId);
            if (!updated) {
                showToast(t('reviews.replyError'), 'error');
                return;
            }
            showToast(t('reviews.replySaved'));
            renderProducerPanel(container);
        });
    });

    container.querySelector('#producerViewMapBtn')?.addEventListener('click', () => {
        navigateTo('map', { force: true });
    });

    container.querySelector('#producerLogoutBtn')?.addEventListener('click', () => {
        logout();
        showToast(t('auth.loggedOut'));
        navigateTo('profile', { force: true });
    });
}

export default { renderProducerPanel };
