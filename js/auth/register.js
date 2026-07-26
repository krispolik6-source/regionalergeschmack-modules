// js/auth/register.js – formularz rejestracji (klient / przedsiębiorca)

import { register, ACCOUNT_TYPES } from './auth.js';
import { PRODUCER_CATEGORIES } from '../data/userProducerStore.js';
import { injectAuthModalStyles, escapeHtml } from './authModalStyles.js';
import { t } from '../core/i18n.js';
import { showToast } from '../core/toast.js';
import { navigateTo } from '../controllers/navigation.js';
import { openLoginModal, closeLoginModal } from './login.js';

let initialized = false;
let selectedAccountType = ACCOUNT_TYPES.client;

function authErrorMessage(code) {
    const key = `auth.errors.${code}`;
    const text = t(key);
    return text === key ? t('auth.errors.generic') : text;
}

function categoryLabel(id) {
    const text = t(`producer.types.${id}`);
    return text === `producer.types.${id}` ? id : text;
}

function renderProducerCategoriesHtml() {
    return PRODUCER_CATEGORIES.map((cat) => `
        <label class="auth-check">
            <input type="checkbox" name="producerCategories" value="${cat.id}">
            ${escapeHtml(categoryLabel(cat.id))}
        </label>
    `).join('');
}

function ensureModal() {
    injectAuthModalStyles();
    if (document.getElementById('authRegisterModal')) return;

    document.body.insertAdjacentHTML('beforeend', `
        <div id="authRegisterModal" class="auth-modal" hidden aria-hidden="true">
            <div class="auth-modal-backdrop" data-auth-close></div>
            <div class="auth-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="authRegisterTitle">
                <div class="auth-modal-header">
                    <h2 id="authRegisterTitle">${escapeHtml(t('auth.registerTitle'))}</h2>
                    <button type="button" class="auth-modal-close" data-auth-close aria-label="${escapeHtml(t('btn.close'))}">×</button>
                </div>
                <form id="authRegisterForm" class="auth-form" novalidate>
                    <div class="auth-field" id="authRegisterTypeRow">
                        <label>${escapeHtml(t('auth.accountType'))}</label>
                        <div class="auth-type-row" role="group" aria-label="${escapeHtml(t('auth.accountType'))}">
                            <button type="button" class="auth-type-btn is-active" data-account-type="client">${escapeHtml(t('auth.client'))}</button>
                            <button type="button" class="auth-type-btn" data-account-type="producer">${escapeHtml(t('auth.producer'))}</button>
                        </div>
                    </div>
                    <fieldset class="auth-field" id="authRegisterCategoriesField" hidden>
                        <legend>${escapeHtml(t('auth.registerCategories'))}</legend>
                        <div class="auth-checkboxes">${renderProducerCategoriesHtml()}</div>
                    </fieldset>
                    <div class="auth-field">
                        <label for="authRegisterDisplayName" id="authRegisterDisplayNameLabel">${escapeHtml(t('auth.displayName'))}</label>
                        <input id="authRegisterDisplayName" name="displayName" type="text" autocomplete="name" maxlength="80">
                    </div>
                    <div class="auth-field">
                        <label for="authRegisterEmail">${escapeHtml(t('auth.email'))}</label>
                        <input id="authRegisterEmail" name="email" type="email" autocomplete="email" required>
                    </div>
                    <div class="auth-field">
                        <label for="authRegisterPassword">${escapeHtml(t('auth.password'))}</label>
                        <input id="authRegisterPassword" name="password" type="password" autocomplete="new-password" required minlength="6">
                    </div>
                    <div class="auth-field">
                        <label for="authRegisterPasswordConfirm">${escapeHtml(t('auth.passwordConfirm'))}</label>
                        <input id="authRegisterPasswordConfirm" name="passwordConfirm" type="password" autocomplete="new-password" required minlength="6">
                    </div>
                    <div class="auth-field">
                        <label for="authRegisterReferral">${escapeHtml(t('referral.registerLabel'))}</label>
                        <input id="authRegisterReferral" name="referralCode" type="text" maxlength="16" autocomplete="off" placeholder="REGIO-XXXX" spellcheck="false">
                        <span class="auth-field-hint">${escapeHtml(t('referral.registerHint'))}</span>
                    </div>
                    <p class="auth-trial-note">${escapeHtml(t('auth.trialNote'))}</p>
                    <p id="authRegisterError" class="auth-error" role="alert"></p>
                    <button type="submit" class="btn-primary">${escapeHtml(t('auth.register'))}</button>
                </form>
                <p class="auth-switch">
                    ${escapeHtml(t('auth.hasAccount'))}
                    <button type="button" id="authGoLogin">${escapeHtml(t('auth.login'))}</button>
                </p>
            </div>
        </div>
    `);
}

function updateRegisterModalUi(modal, lockType = false) {
    const title = modal.querySelector('#authRegisterTitle');
    const typeRow = modal.querySelector('#authRegisterTypeRow');
    const categoriesField = modal.querySelector('#authRegisterCategoriesField');
    const nameLabel = modal.querySelector('#authRegisterDisplayNameLabel');
    const nameInput = modal.querySelector('#authRegisterDisplayName');

    if (title) {
        title.textContent = selectedAccountType === ACCOUNT_TYPES.producer
            ? t('auth.registerAsProducer')
            : t('auth.registerAsClient');
    }

    if (nameLabel) {
        nameLabel.textContent = selectedAccountType === ACCOUNT_TYPES.producer
            ? t('auth.businessName')
            : t('auth.displayName');
    }
    if (nameInput) {
        nameInput.placeholder = selectedAccountType === ACCOUNT_TYPES.producer
            ? t('auth.businessName')
            : t('auth.displayName');
    }

    if (typeRow) typeRow.hidden = lockType;
    if (categoriesField) categoriesField.hidden = selectedAccountType !== ACCOUNT_TYPES.producer;

    modal.querySelectorAll('[data-account-type]').forEach((btn) => {
        btn.classList.toggle('is-active', btn.dataset.accountType === selectedAccountType);
    });
}

export function closeRegisterModal() {
    const modal = document.getElementById('authRegisterModal');
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('auth-modal-open');
}

/**
 * @param {'client'|'producer'|null} accountType
 */
export function openRegisterModal(accountType = null) {
    ensureModal();
    closeLoginModal();
    const modal = document.getElementById('authRegisterModal');
    const form = document.getElementById('authRegisterForm');
    const error = document.getElementById('authRegisterError');
    if (!modal || !form) return;

    selectedAccountType = accountType === ACCOUNT_TYPES.producer
        ? ACCOUNT_TYPES.producer
        : ACCOUNT_TYPES.client;

    updateRegisterModalUi(modal, accountType != null);
    form.reset();
    if (error) error.textContent = '';
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('auth-modal-open');
    form.querySelector('#authRegisterEmail')?.focus();
}

async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const errorEl = document.getElementById('authRegisterError');
    const producerCategories = selectedAccountType === ACCOUNT_TYPES.producer
        ? Array.from(form.querySelectorAll('input[name="producerCategories"]:checked')).map((el) => el.value)
        : [];

    const result = await register({
        email: form.email.value,
        password: form.password.value,
        passwordConfirm: form.passwordConfirm.value,
        accountType: selectedAccountType,
        displayName: form.displayName.value,
        producerCategories,
        referralCode: form.referralCode?.value || ''
    });

    if (!result.ok) {
        if (errorEl) {
            errorEl.textContent = result.error === 'invalidReferral'
                ? t('referral.errors.invalid')
                : authErrorMessage(result.error);
        }
        return;
    }

    closeRegisterModal();
    if (result.referral?.ok) {
        showToast(t('referral.bonusApplied').replace('{months}', String(result.referral.months)));
    } else {
        showToast(t('auth.welcome'));
    }
    navigateTo('profile', { force: true });
}

export function initRegisterModal() {
    if (initialized) return;
    ensureModal();

    const modal = document.getElementById('authRegisterModal');
    const form = document.getElementById('authRegisterForm');
    if (!modal || !form) return;

    form.addEventListener('submit', handleSubmit);
    modal.querySelectorAll('[data-auth-close]').forEach((el) => {
        el.addEventListener('click', closeRegisterModal);
    });
    modal.querySelector('#authGoLogin')?.addEventListener('click', () => {
        closeRegisterModal();
        openLoginModal(selectedAccountType);
    });
    modal.querySelectorAll('[data-account-type]').forEach((btn) => {
        btn.addEventListener('click', () => {
            selectedAccountType = btn.dataset.accountType === ACCOUNT_TYPES.producer
                ? ACCOUNT_TYPES.producer
                : ACCOUNT_TYPES.client;
            updateRegisterModalUi(modal, false);
        });
    });

    modal.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeRegisterModal();
    });

    initialized = true;
}

export default { initRegisterModal, openRegisterModal, closeRegisterModal };
