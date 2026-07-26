// js/views/adminPanel.js – panel administratora (localStorage)

import { t } from '../core/i18n.js';
import { getRegisteredUserProducers } from '../data/userProducerStore.js';
import { listPendingReports, resolveReport, setProducerTrustOverride, setReviewModeration } from '../data/adminStore.js';
import { getAllReviews, getReviewStableKey } from '../data/reviews.js';
import { showToast } from '../core/toast.js';
import { logout } from '../auth/auth.js';
import { navigateTo } from '../controllers/navigation.js';

function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export function renderAdminPanel(container) {
    if (!container) return;

    const producers = getRegisteredUserProducers();
    const reports = listPendingReports();
    const reviews = getAllReviews().slice(0, 40);

    container.innerHTML = `
        <section class="account-panel card admin-panel">
            <h3 class="account-panel-title">${escapeHtml(t('admin.title'))}</h3>
            <p class="account-panel-sub">${escapeHtml(t('admin.subtitle'))}</p>
            <p class="account-field-hint">${escapeHtml(t('admin.seedHint'))}</p>

            <h4>${escapeHtml(t('admin.trust'))}</h4>
            <ul class="account-list">
                ${producers.length === 0
        ? `<li class="account-empty">—</li>`
        : producers.map((p) => `
                    <li class="admin-row">
                        <span>${escapeHtml(p.name)} <small>(${escapeHtml(p.id)})</small></span>
                        <button type="button" class="btn-secondary" data-admin-verify="${escapeHtml(p.id)}">${escapeHtml(t('admin.verify'))}</button>
                        <button type="button" class="btn-secondary" data-admin-reject="${escapeHtml(p.id)}">${escapeHtml(t('admin.reject'))}</button>
                    </li>
                `).join('')}
            </ul>

            <h4>${escapeHtml(t('admin.reports'))}</h4>
            <ul class="account-list">
                ${reports.length === 0
        ? `<li class="account-empty">—</li>`
        : reports.map((r) => `
                    <li class="admin-row">
                        <span>${escapeHtml(r.producerName || r.producerId)} · ${escapeHtml(r.reason)}</span>
                        <button type="button" class="btn-secondary" data-admin-resolve="${escapeHtml(r.id)}">${escapeHtml(t('admin.resolve'))}</button>
                        <button type="button" class="btn-secondary" data-admin-dismiss="${escapeHtml(r.id)}">${escapeHtml(t('admin.dismiss'))}</button>
                    </li>
                `).join('')}
            </ul>

            <h4>${escapeHtml(t('admin.reviews'))}</h4>
            <ul class="account-list">
                ${reviews.length === 0
        ? `<li class="account-empty">—</li>`
        : reviews.map((rev) => `
                    <li class="admin-row">
                        <span><strong>${escapeHtml(rev.user)}</strong>: ${escapeHtml((rev.comment || '').slice(0, 80))}</span>
                        <button type="button" class="btn-secondary" data-admin-hide-review="${escapeHtml(getReviewStableKey(rev))}">${escapeHtml(t('admin.hideReview'))}</button>
                    </li>
                `).join('')}
            </ul>

            <button type="button" id="adminLogoutBtn" class="btn-secondary account-logout">${escapeHtml(t('auth.logout'))}</button>
        </section>
    `;

    container.querySelectorAll('[data-admin-verify]').forEach((btn) => {
        btn.addEventListener('click', () => {
            setProducerTrustOverride(btn.dataset.adminVerify, 'verified');
            showToast(t('admin.verify'));
            renderAdminPanel(container);
        });
    });
    container.querySelectorAll('[data-admin-reject]').forEach((btn) => {
        btn.addEventListener('click', () => {
            setProducerTrustOverride(btn.dataset.adminReject, 'rejected');
            showToast(t('admin.reject'));
            renderAdminPanel(container);
        });
    });
    container.querySelectorAll('[data-admin-resolve]').forEach((btn) => {
        btn.addEventListener('click', () => {
            resolveReport(btn.dataset.adminResolve, 'resolved');
            showToast(t('admin.resolve'));
            renderAdminPanel(container);
        });
    });
    container.querySelectorAll('[data-admin-dismiss]').forEach((btn) => {
        btn.addEventListener('click', () => {
            resolveReport(btn.dataset.adminDismiss, 'dismissed');
            showToast(t('admin.dismiss'));
            renderAdminPanel(container);
        });
    });
    container.querySelectorAll('[data-admin-hide-review]').forEach((btn) => {
        btn.addEventListener('click', () => {
            setReviewModeration(btn.dataset.adminHideReview, 'hidden');
            showToast(t('admin.hideReview'));
            renderAdminPanel(container);
        });
    });
    container.querySelector('#adminLogoutBtn')?.addEventListener('click', () => {
        logout();
        showToast(t('auth.loggedOut'));
        navigateTo('profile', { force: true });
    });
}

export default { renderAdminPanel };
