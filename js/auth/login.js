// js/auth/login.js – formularz logowania (klient / przedsiębiorca)

import { login, ACCOUNT_TYPES } from './auth.js';
import { injectAuthModalStyles, escapeHtml } from './authModalStyles.js';
import { t } from '../core/i18n.js';
import { showToast } from '../core/toast.js';
import { navigateTo } from '../controllers/navigation.js';
import { openRegisterModal, closeRegisterModal } from './register.js';

let initialized = false;
let expectedAccountType = null;

function authErrorMessage(code) {
    const key = `auth.errors.${code}`;
    const text = t(key);
    return text === key ? t('auth.errors.generic') : text;
}

function ensureModal() {
    injectAuthModalStyles();
    if (document.getElementById('authLoginModal')) return;

    document.body.insertAdjacentHTML('beforeend', `
        <div id="authLoginModal" class="auth-modal" hidden aria-hidden="true">
            <div class="auth-modal-backdrop" data-auth-close></div>
            <div class="auth-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="authLoginTitle">
                <div class="auth-modal-header">
                    <h2 id="authLoginTitle">${escapeHtml(t('auth.loginTitle'))}</h2>
                    <button type="button" class="auth-modal-close" data-auth-close aria-label="${escapeHtml(t('btn.close'))}">×</button>
                </div>
                <p id="authLoginHint" class="auth-trial-note"></p>
                <form id="authLoginForm" class="auth-form" novalidate>
                    <div class="auth-field">
                        <label for="authLoginEmail">${escapeHtml(t('auth.email'))}</label>
                        <input id="authLoginEmail" name="email" type="email" autocomplete="email" required>
                    </div>
                    <div class="auth-field">
                        <label for="authLoginPassword">${escapeHtml(t('auth.password'))}</label>
                        <input id="authLoginPassword" name="password" type="password" autocomplete="current-password" required minlength="6">
                    </div>
                    <p id="authLoginError" class="auth-error" role="alert"></p>
                    <button type="submit" class="btn-primary">${escapeHtml(t('auth.login'))}</button>
                </form>
                <p class="auth-switch">
                    ${escapeHtml(t('auth.noAccount'))}
                    <button type="button" id="authGoRegister">${escapeHtml(t('auth.register'))}</button>
                </p>
            </div>
        </div>
    `);
}

function updateLoginModalUi(modal) {
    const title = modal.querySelector('#authLoginTitle');
    const hint = modal.querySelector('#authLoginHint');
    if (!title) return;

    if (expectedAccountType === ACCOUNT_TYPES.producer) {
        title.textContent = t('auth.loginAsProducer');
        if (hint) hint.textContent = t('profile.producerSection');
    } else if (expectedAccountType === ACCOUNT_TYPES.client) {
        title.textContent = t('auth.loginAsClient');
        if (hint) hint.textContent = t('profile.consumerSection');
    } else {
        title.textContent = t('auth.loginTitle');
        if (hint) hint.textContent = '';
    }
}

function closeLoginModal() {
    const modal = document.getElementById('authLoginModal');
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('auth-modal-open');
}

/**
 * @param {'client'|'producer'|null} accountType
 */
export function openLoginModal(accountType = null) {
    ensureModal();
    closeRegisterModal();
    const modal = document.getElementById('authLoginModal');
    const form = document.getElementById('authLoginForm');
    const error = document.getElementById('authLoginError');
    if (!modal || !form) return;

    expectedAccountType = accountType === ACCOUNT_TYPES.producer
        ? ACCOUNT_TYPES.producer
        : accountType === ACCOUNT_TYPES.client
            ? ACCOUNT_TYPES.client
            : null;

    updateLoginModalUi(modal);
    form.reset();
    if (error) error.textContent = '';
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('auth-modal-open');
    form.querySelector('#authLoginEmail')?.focus();
}

export { closeLoginModal };

async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const errorEl = document.getElementById('authLoginError');

    const result = await login({
        email: form.email.value,
        password: form.password.value,
        expectedAccountType: expectedAccountType || undefined
    });

    if (!result.ok) {
        if (errorEl) errorEl.textContent = authErrorMessage(result.error);
        return;
    }

    closeLoginModal();
    showToast(t('auth.welcome'));
    navigateTo('profile', { force: true });
}

export function initLoginModal() {
    if (initialized) return;
    ensureModal();

    const modal = document.getElementById('authLoginModal');
    const form = document.getElementById('authLoginForm');
    if (!modal || !form) return;

    form.addEventListener('submit', handleSubmit);
    modal.querySelectorAll('[data-auth-close]').forEach((el) => {
        el.addEventListener('click', closeLoginModal);
    });
    modal.querySelector('#authGoRegister')?.addEventListener('click', () => {
        closeLoginModal();
        openRegisterModal(expectedAccountType);
    });

    modal.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeLoginModal();
    });

    initialized = true;
}

export default { initLoginModal, openLoginModal, closeLoginModal };
