// ============================================================
// js/views/profile.js – profil: dwie ścieżki logowania + panele
// ============================================================

import { APP_NAME, APP_VERSION, APP_BUILD, CONTACT_EMAIL } from '../config.js';
import { LANG_OPTIONS, getCurrentLanguage, t } from '../core/i18n.js';
import { getSettings, saveSettings, setDarkMode, isDarkMode, setAppLanguage } from '../core/settings.js';
import { getCurrentUser, isProducer, isAdmin, logout, ACCOUNT_TYPES } from '../auth/auth.js';
import { openLoginModal } from '../auth/login.js';
import { openRegisterModal } from '../auth/register.js';
import { renderClientPanel } from './clientPanel.js';
import { renderProducerPanel } from './producerPanel.js';
import { renderAdminPanel } from './adminPanel.js';
import { showToast } from '../core/toast.js';
import { syncPushWithSettings } from '../core/pushNotifications.js';
import { promptPwaInstall, refreshPwaInstallUi } from '../core/pwaInstall.js';
import { eventBus } from '../core/eventBus.js';
import { EVENTS } from '../core/events.js';
import {
    isAmbientNatureEnabled,
    setAmbientNatureEnabled
} from '../presentation/climateAtmosphere.js';

function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export function renderProfile(container) {
    if (!container) return;
    injectStyles();
    render(container);
    bindEvents(container);
}

export function initProfile() {
    const container = document.getElementById('profileView');
    if (!container) return;
    injectStyles();
    render(container);
    bindEvents(container);
}

function injectStyles() {
    if (document.getElementById('profile-view-styles')) return;

    const style = document.createElement('style');
    style.id = 'profile-view-styles';
    style.textContent = `
        .profile-page { display: flex; flex-direction: column; gap: var(--space-xl); }
        .profile-card { padding: var(--space-xl); }
        .profile-card-center { text-align: center; }
        .profile-avatar { font-size: 48px; display: block; margin-bottom: var(--space-sm); }
        .profile-card h3 { font-size: var(--text-lg); margin: 0 0 var(--space-xs); }
        .profile-sub { font-size: var(--text-sm); color: var(--text-muted); margin: 0 0 var(--space-md); }
        .profile-auth-paths { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
        .profile-path-actions { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
        .profile-settings-title { margin: 0 0 var(--space-sm); font-size: var(--text-md); color: var(--color-primary); }
        .profile-settings { display: flex; flex-direction: column; gap: var(--space-md); }
        .setting-item { display: flex; align-items: center; justify-content: space-between; gap: var(--space-md); padding: var(--space-md) var(--space-lg); }
        .setting-label { display: flex; align-items: center; justify-content: space-between; gap: var(--space-md); width: 100%; font-weight: 500; cursor: pointer; }
        .setting-item select { min-height: 40px; padding: var(--space-sm) var(--space-md); border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-card); color: var(--color-text); }
        .switch { position: relative; display: inline-flex; align-items: center; width: 50px; height: 44px; min-height: 44px; flex-shrink: 0; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; inset: 0; background: var(--color-border); border-radius: 34px; cursor: pointer; transition: 0.2s; }
        .slider::before { content: ''; position: absolute; height: 20px; width: 20px; left: 4px; bottom: 4px; background: white; border-radius: 50%; transition: 0.2s; }
        .switch input:checked + .slider { background: var(--color-primary); }
        .switch input:checked + .slider::before { transform: translateX(22px); }
        .profile-meta { font-size: var(--text-sm); color: var(--text-muted); text-align: center; }
        .profile-meta a { color: var(--color-accent); }
        .profile-account-wrap { display: flex; flex-direction: column; gap: var(--space-md); }
        .account-panel { padding: var(--space-lg); }
        .account-panel-title { margin: 0 0 4px; font-size: var(--text-lg); }
        .account-panel-sub { margin: 0 0 12px; color: var(--text-muted); font-size: var(--text-sm); }
        .account-form { display: flex; flex-direction: column; gap: 10px; }
        .account-field label, .account-field legend { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 4px; }
        .account-field input, .account-field textarea, .account-field select { width: 100%; min-height: 40px; padding: 8px 10px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font: inherit; background: var(--color-card); color: var(--color-text); box-sizing: border-box; }
        .account-field textarea { min-height: 72px; resize: vertical; }
        .account-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .account-checkboxes { display: flex; flex-wrap: wrap; gap: 8px 12px; }
        .account-check { display: flex; align-items: center; gap: 6px; font-size: 0.9rem; }
        .account-tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
        .account-tab { border: 1px solid var(--color-border); background: var(--color-card); border-radius: var(--radius-sm); padding: 8px 10px; font: inherit; font-size: 0.85rem; cursor: pointer; }
        .account-tab.is-active { background: rgba(79, 107, 60, 0.12); border-color: var(--color-primary); color: var(--color-primary); font-weight: 600; }
        .account-list-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
        .account-list-header h4 { margin: 0; }
        .account-items { display: flex; flex-direction: column; gap: 10px; }
        .account-item { padding: 12px; }
        .account-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--color-border); }
        .account-row:last-child { border-bottom: none; }
        .account-row-info { flex: 1; min-width: 0; }
        .account-row-name { font-weight: 600; }
        .account-row-meta { font-size: 0.85rem; color: var(--text-muted); }
        .account-empty { color: var(--text-muted); font-size: 0.9rem; }
        .auth-error { color: var(--color-error, #b42318); font-size: 0.85rem; margin: 0; min-height: 1.2em; }
        .account-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
        .account-actions { display: flex; flex-wrap: wrap; gap: 8px; }
        .account-logout { width: 100%; }
        .account-photo-item { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .account-photo-item img { object-fit: cover; border-radius: 8px; border: 1px solid var(--color-border); }
        .account-inline-form { flex-direction: row; align-items: flex-end; flex-wrap: wrap; }
        .account-remove-btn { margin-top: 4px; }
        .btn-secondary { min-height: 44px; padding: 10px 14px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-card); color: var(--color-text); font: inherit; font-weight: 600; cursor: pointer; }
        .btn-remove-inline { min-height: 44px; min-width: 44px; padding: 8px 12px; font-size: 0.85rem; color: var(--color-error, #b42318); border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: transparent; cursor: pointer; }
        .profile-install-btn { width: 100%; }
        .profile-install-hint { margin: 8px 0 0; text-align: center; }
        @media (max-width: 600px) { .profile-auth-paths { grid-template-columns: 1fr; } .account-grid-2 { grid-template-columns: 1fr; } }
    `;
    document.head.appendChild(style);
}

function renderGuestPaths() {
    return `
        <div class="profile-auth-paths">
            <article class="profile-card card">
                <span class="profile-avatar" aria-hidden="true">🛍️</span>
                <h3>${escapeHtml(t('profile.consumerSection'))}</h3>
                <p class="profile-sub">${escapeHtml(t('profile.consumerDesc'))}</p>
                <div class="profile-path-actions">
                    <button type="button" class="btn-primary" data-login-type="client">${escapeHtml(t('profile.loginAsConsumer'))}</button>
                    <button type="button" class="btn-secondary" data-register-type="client">${escapeHtml(t('profile.registerAsConsumer'))}</button>
                </div>
            </article>
            <article class="profile-card card">
                <span class="profile-avatar" aria-hidden="true">🏪</span>
                <h3>${escapeHtml(t('profile.producerSection'))}</h3>
                <p class="profile-sub">${escapeHtml(t('profile.producerDesc'))}</p>
                <div class="profile-path-actions">
                    <button type="button" class="btn-primary" data-login-type="producer">${escapeHtml(t('profile.loginAsProducer'))}</button>
                    <button type="button" class="btn-secondary" data-register-type="producer">${escapeHtml(t('profile.registerAsProducer'))}</button>
                </div>
            </article>
        </div>
    `;
}

function renderLoggedInCard(user) {
    const typeLabel = user.accountType === 'producer'
        ? t('profile.accountProducer')
        : t('profile.accountClient');
    const icon = user.accountType === 'producer' ? '🏪' : '🛍️';
    return `
        <div class="profile-card card profile-card-center">
            <span class="profile-avatar" aria-hidden="true">${icon}</span>
            <h3>${escapeHtml(user.displayName)}</h3>
            <p class="profile-sub">${escapeHtml(t('profile.loggedInAs'))} ${escapeHtml(user.email)}<br>${escapeHtml(typeLabel)}</p>
            <button type="button" id="profileLogoutBtn" class="btn-secondary">${escapeHtml(t('auth.logout'))}</button>
        </div>
    `;
}

function renderSettingsSection(darkMode, notifications, language, ambientNature) {
    return `
        <section class="profile-settings">
            <h3 class="profile-settings-title">${escapeHtml(t('profile.settingsTitle'))}</h3>
            <div class="setting-item card profile-install-card" id="pwaInstallProfileCard" hidden>
                <button type="button" id="pwaInstallProfileBtn" class="btn-primary profile-install-btn">
                    <span data-pwa-install-label>⬇️ ${escapeHtml(t('pwa.install'))}</span>
                </button>
                <p class="profile-sub profile-install-hint">${escapeHtml(t('pwa.installHint'))}</p>
            </div>
            <div class="setting-item card">
                <label class="setting-label" for="profileDarkMode">
                    <span id="profileDarkModeLabel">🌙 ${t('profile.darkMode')}</span>
                    <span class="switch">
                        <input type="checkbox" id="profileDarkMode" aria-labelledby="profileDarkModeLabel" ${darkMode ? 'checked' : ''}>
                        <span class="slider"></span>
                    </span>
                </label>
            </div>
            <div class="setting-item card">
                <label class="setting-label" for="profileNotifications">
                    <span id="profileNotificationsLabel">🔔 ${t('profile.notifications')}</span>
                    <span class="switch">
                        <input type="checkbox" id="profileNotifications" aria-labelledby="profileNotificationsLabel" ${notifications ? 'checked' : ''}>
                        <span class="slider"></span>
                    </span>
                </label>
            </div>
            <div class="setting-item card">
                <label class="setting-label" for="profileAmbientNature">
                    <span id="profileAmbientNatureLabel">🌿 ${t('profile.ambientNature')}</span>
                    <span class="switch">
                        <input type="checkbox" id="profileAmbientNature" aria-labelledby="profileAmbientNatureLabel" ${ambientNature ? 'checked' : ''}>
                        <span class="slider"></span>
                    </span>
                </label>
                <p class="profile-sub profile-ambient-hint">${escapeHtml(t('profile.ambientNatureHint'))}</p>
            </div>
            <div class="setting-item card">
                <label class="setting-label" for="profileLanguage">
                    <span id="profileLanguageLabel">🌍 ${t('profile.language')}</span>
                    <select id="profileLanguage" aria-labelledby="profileLanguageLabel">
                    ${LANG_OPTIONS.map((lang) => `
                        <option value="${lang.code}" ${lang.code === language ? 'selected' : ''}>${lang.flag} ${lang.label} (${lang.short})</option>
                    `).join('')}
                    </select>
                </label>
            </div>
        </section>
    `;
}

function render(container) {
    const settings = getSettings();
    const darkMode = isDarkMode();
    const notifications = settings.notifications !== false;
    const ambientNature = isAmbientNatureEnabled();
    const language = getCurrentLanguage();
    const user = getCurrentUser();

    container.innerHTML = `
        <div class="profile-page">
            <header class="view-hero">
                <h2>👤 ${t('profile.title')}</h2>
                <p class="text-muted">${t('profile.subtitle')}</p>
            </header>

            ${user ? renderLoggedInCard(user) : renderGuestPaths()}

            <div id="profileAccountPanel" class="profile-account-wrap"></div>

            ${renderSettingsSection(darkMode, notifications, language, ambientNature)}

            <div class="profile-meta surface-panel">
                <p>${APP_NAME} · v${APP_VERSION} (${APP_BUILD})</p>
                <p><a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
            </div>
        </div>
    `;

    const panelHost = container.querySelector('#profileAccountPanel');
    if (user && panelHost) {
        if (isAdmin()) {
            renderAdminPanel(panelHost);
        } else if (isProducer()) {
            renderProducerPanel(panelHost);
        } else {
            renderClientPanel(panelHost);
        }
    }
}

function bindEvents(container) {
    container.querySelectorAll('[data-login-type]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.loginType === 'producer'
                ? ACCOUNT_TYPES.producer
                : ACCOUNT_TYPES.client;
            openLoginModal(type);
        });
    });

    container.querySelectorAll('[data-register-type]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.registerType === 'producer'
                ? ACCOUNT_TYPES.producer
                : ACCOUNT_TYPES.client;
            openRegisterModal(type);
        });
    });

    container.querySelector('#profileLogoutBtn')?.addEventListener('click', () => {
        logout();
        showToast(t('auth.loggedOut'));
        renderProfile(container);
    });

    container.querySelector('#profileDarkMode')?.addEventListener('change', (e) => {
        setDarkMode(e.target.checked);
    });

    container.querySelector('#profileNotifications')?.addEventListener('change', async (e) => {
        const enabled = e.target.checked;
        const ok = await syncPushWithSettings(enabled);
        if (!ok) {
            e.target.checked = false;
            showToast(t('push.permissionDenied'));
            return;
        }
        saveSettings({ notifications: enabled });
        if (enabled) showToast(t('push.enabled'));
    });

    container.querySelector('#profileAmbientNature')?.addEventListener('change', (e) => {
        setAmbientNatureEnabled(e.target.checked, { userInitiated: e.target.checked });
    });

    eventBus.on(EVENTS.AMBIENT_UNAVAILABLE, () => {
        const cb = container.querySelector('#profileAmbientNature');
        if (cb) cb.checked = false;
    });

    container.querySelector('#profileLanguage')?.addEventListener('change', (e) => {
        setAppLanguage(e.target.value);
    });

    container.querySelector('#pwaInstallProfileBtn')?.addEventListener('click', async () => {
        await promptPwaInstall();
    });

    refreshPwaInstallUi();
}

export function getProfileSettings() {
    return getSettings();
}
