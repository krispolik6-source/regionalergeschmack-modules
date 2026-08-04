// js/core/pwaInstall.js – instalacja PWA (beforeinstallprompt)

import { t } from './i18n.js';
import { eventBus } from './eventBus.js';
import { EVENTS } from './events.js';
import { showToast } from './toast.js';

let deferredPrompt = null;

function captureInstallPrompt(event) {
    if (!event) return;
    event.preventDefault();
    deferredPrompt = event;
    if (typeof window !== 'undefined') {
        window.__deferredPwaPrompt = event;
    }
    refreshPwaInstallUi();
    showInstallBanner();
}

// Rejestracja jak najwcześniej – zanim DOMContentLoaded / bootstrap
if (typeof window !== 'undefined') {
    if (window.__deferredPwaPrompt) {
        deferredPrompt = window.__deferredPwaPrompt;
    }
    window.addEventListener('beforeinstallprompt', captureInstallPrompt);
}

export function isPwaInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches
        || window.navigator.standalone === true;
}

export function canInstallPwa() {
    return Boolean(deferredPrompt) && !isPwaInstalled();
}

function getInstallButtons() {
    return [
        document.getElementById('pwaInstallMenuBtn'),
        document.getElementById('pwaInstallProfileBtn'),
        document.getElementById('pwaInstallBannerBtn')
    ].filter(Boolean);
}

function getInstallContainers() {
    return [
        document.getElementById('pwaInstallProfileCard'),
        document.getElementById('pwaInstallBanner')
    ].filter(Boolean);
}

function ensureInstallBanner() {
    if (typeof document === 'undefined') return null;
    let banner = document.getElementById('pwaInstallBanner');
    if (banner) return banner;

    banner = document.createElement('div');
    banner.id = 'pwaInstallBanner';
    banner.className = 'pwa-install-banner';
    banner.hidden = true;
    banner.innerHTML = `
        <p class="pwa-install-banner-text" data-pwa-banner-text></p>
        <div class="pwa-install-banner-actions">
            <button type="button" id="pwaInstallBannerBtn" class="btn-primary pwa-install-banner-btn">
                <span data-pwa-install-label></span>
            </button>
            <button type="button" id="pwaInstallBannerDismiss" class="pwa-install-banner-dismiss" aria-label="Schließen">×</button>
        </div>
    `;
    document.body.appendChild(banner);

    banner.querySelector('#pwaInstallBannerDismiss')?.addEventListener('click', () => {
        banner.hidden = true;
    });

    return banner;
}

function refreshInstallBannerI18n(banner) {
    if (!banner) return;
    const dismiss = banner.querySelector('#pwaInstallBannerDismiss');
    if (dismiss) dismiss.setAttribute('aria-label', t('btn.close'));
    const text = banner.querySelector('[data-pwa-banner-text]');
    if (text) text.textContent = t('pwa.installHint');
    const label = banner.querySelector('[data-pwa-install-label]');
    if (label) label.textContent = t('pwa.install');
}

function showInstallBanner() {
    if (!canInstallPwa()) return;
    const banner = ensureInstallBanner();
    if (!banner) return;
    refreshInstallBannerI18n(banner);
    banner.hidden = false;
    bindInstallButtons();
}

export function updateInstallButtonsVisibility() {
    const visible = canInstallPwa();
    getInstallButtons().forEach((btn) => {
        btn.hidden = !visible;
        btn.disabled = !visible;
    });
    getInstallContainers().forEach((container) => {
        if (container.id === 'pwaInstallBanner' && !visible) {
            container.hidden = true;
            return;
        }
        if (container.id !== 'pwaInstallBanner') {
            container.hidden = !visible;
        }
    });
}

function refreshInstallLabels() {
    getInstallButtons().forEach((btn) => {
        const label = btn.querySelector('[data-pwa-install-label]');
        if (label) label.textContent = t('pwa.install');
        btn.setAttribute('aria-label', t('pwa.install'));
    });
    const bannerText = document.querySelector('[data-pwa-banner-text]');
    if (bannerText) bannerText.textContent = t('pwa.installHint');
}

/**
 * Pokazuje natywny dialog instalacji przeglądarki (wymaga gestu użytkownika).
 * @returns {Promise<boolean>}
 */
export async function promptPwaInstall() {
    if (!deferredPrompt && typeof window !== 'undefined' && window.__deferredPwaPrompt) {
        deferredPrompt = window.__deferredPwaPrompt;
    }

    if (!deferredPrompt || typeof deferredPrompt.prompt !== 'function') {
        showToast(t('pwa.installHint'));
        return false;
    }

    const promptEvent = deferredPrompt;
    try {
        // Chrome/Edge: deferredPrompt.prompt() MUSI być wywołane po geście użytkownika (klik w baner / menu)
        deferredPrompt.prompt();
        const choiceResult = promptEvent.userChoice
            ? await promptEvent.userChoice
            : null;
        const outcome = choiceResult?.outcome;

        deferredPrompt = null;
        if (typeof window !== 'undefined') {
            window.__deferredPwaPrompt = null;
        }
        const banner = document.getElementById('pwaInstallBanner');
        if (banner) banner.hidden = true;
        updateInstallButtonsVisibility();

        if (outcome === 'accepted') {
            showToast(t('pwa.installed'));
            return true;
        }

        showToast(t('pwa.dismissed'));
        return false;
    } catch (error) {
        console.warn('[PWA] deferredPrompt.prompt() nieudane:', error);
        showToast(t('pwa.installHint'));
        return false;
    }
}

function bindInstallButtons() {
    getInstallButtons().forEach((btn) => {
        if (btn.dataset.bound === 'true') return;
        btn.dataset.bound = 'true';
        btn.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();
            // Klik w baner / menu → deferredPrompt.prompt()
            await promptPwaInstall();
        });
    });
}

export function refreshPwaInstallUi() {
    ensureInstallBanner();
    bindInstallButtons();
    refreshInstallLabels();
    updateInstallButtonsVisibility();
    if (canInstallPwa()) showInstallBanner();
}

let pwaInstallInitialized = false;

export function initPwaInstall() {
    if (!('serviceWorker' in navigator)) return;
    if (pwaInstallInitialized) return;
    pwaInstallInitialized = true;

    if (window.__deferredPwaPrompt && !deferredPrompt) {
        deferredPrompt = window.__deferredPwaPrompt;
    }

    window.addEventListener('rg-pwa-prompt-ready', () => {
        if (window.__deferredPwaPrompt) {
            deferredPrompt = window.__deferredPwaPrompt;
            refreshPwaInstallUi();
            showInstallBanner();
        }
    });

    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        window.__deferredPwaPrompt = null;
        const banner = document.getElementById('pwaInstallBanner');
        if (banner) banner.hidden = true;
        refreshPwaInstallUi();
        showToast(t('pwa.installed'));
    });

    refreshPwaInstallUi();

    eventBus.on(EVENTS.LANGUAGE_CHANGED, () => {
        refreshInstallLabels();
        refreshInstallBannerI18n(document.getElementById('pwaInstallBanner'));
    });
}

export default {
    initPwaInstall,
    canInstallPwa,
    promptPwaInstall,
    isPwaInstalled,
    updateInstallButtonsVisibility
};
