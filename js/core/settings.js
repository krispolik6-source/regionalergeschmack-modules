// js/core/settings.js – język, tryb nocny, kontrolki nagłówka

import { eventBus } from './eventBus.js';
import { EVENTS } from './events.js';
import {
    getCurrentLanguage,
    setLanguage,
    initLanguage,
    getLanguageOption,
    t,
    LANG_OPTIONS
} from './i18n.js';
import { syncDocumentMeta } from './documentMeta.js';
import { languageFlagImgHtml } from '../presentation/languageFlags.js';

const SETTINGS_KEY = 'regionalny_smak_settings';

export function getSettings() {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        const data = raw ? JSON.parse(raw) : {};
        return data && typeof data === 'object' ? data : {};
    } catch (_) {
        return {};
    }
}

export function saveSettings(patch) {
    const next = { ...getSettings(), ...patch };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    return next;
}

export function isDarkMode() {
    return Boolean(getSettings().darkMode);
}

export function applyDarkMode(enabled) {
    document.body.classList.toggle('dark-mode', enabled);
    const btn = document.getElementById('darkModeToggleBtn');
    if (btn) {
        // ETAP 34B — ikona = aktywny motyw (🌞 dzienny · 🌙 nocny); logika przełączania bez zmian
        btn.textContent = enabled ? '🌙' : '☀️';
        btn.setAttribute('aria-label', enabled ? t('a11y.lightMode') : t('a11y.darkMode'));
        btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    }
}

export function setDarkMode(enabled) {
    saveSettings({ darkMode: enabled });
    applyDarkMode(enabled);
    eventBus.emit(EVENTS.THEME_CHANGED, { darkMode: enabled });
}

export function setAppLanguage(code) {
    const lang = setLanguage(code);
    saveSettings({ language: lang });
    updateLanguageButtonLabel();
    eventBus.emit(EVENTS.LANGUAGE_CHANGED, { language: lang });
    return lang;
}

export function updateLanguageButtonLabel() {
    const label = document.getElementById('languageSwitcherLabel');
    const option = getLanguageOption(getCurrentLanguage());
    if (label && option) {
        label.innerHTML = `${languageFlagImgHtml(option.code, { className: 'header-lang-flag-img' })} <span class="header-lang-text">${option.label}</span>`;
    }

    document.querySelectorAll('.language-option').forEach((btn) => {
        const active = btn.dataset.lang === getCurrentLanguage();
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
}

function getLanguageWrap() {
    return document.querySelector('.header-lang-wrap:not([hidden])')
        || document.querySelector('.header-lang-wrap');
}

function mountLanguageSwitcherInHeader() {
    const wrap = getLanguageWrap();
    if (!wrap || wrap.dataset.mounted === 'true') return;

    const toggle = document.getElementById('languageSwitcherBtn');
    const label = document.getElementById('languageSwitcherLabel');
    if (toggle && label && !toggle.contains?.(label)) {
        if (typeof toggle.appendChild === 'function') {
            toggle.appendChild(label);
        }
    }

    const actionGroup = document.querySelector('.main-header .header-action-group');
    const themeBtn = document.getElementById('darkModeToggleBtn');
    if (!actionGroup || !toggle) return;

    wrap.removeAttribute('hidden');
    wrap.removeAttribute('aria-hidden');
    wrap.classList.remove('header-lang-wrap--legacy');
    toggle.removeAttribute('tabindex');

    if (themeBtn && wrap.nextElementSibling !== themeBtn) {
        actionGroup.insertBefore(wrap, themeBtn);
    } else if (!wrap.parentElement?.classList.contains('header-action-group')) {
        actionGroup.appendChild(wrap);
    }

    wrap.dataset.mounted = 'true';
}

function positionLanguageDropdown() {
    const dropdown = document.getElementById('languageDropdown');
    const toggle = document.getElementById('languageSwitcherBtn');
    if (!dropdown || !toggle || dropdown.hidden) return;

    // fixed + body — poza stacking contextem headera (menu ☰ = 1250)
    const rect = toggle.getBoundingClientRect();
    const gap = 6;
    const maxH = Math.min(320, Math.max(160, window.innerHeight - rect.bottom - gap - 12));
    if (dropdown.parentElement !== document.body) {
        dropdown.dataset.langHome = 'header';
        document.body.appendChild(dropdown);
    }
    dropdown.style.position = 'fixed';
    dropdown.style.top = `${Math.round(rect.bottom + gap)}px`;
    dropdown.style.right = `${Math.max(8, Math.round(window.innerWidth - rect.right))}px`;
    dropdown.style.left = 'auto';
    dropdown.style.zIndex = '1260';
    dropdown.style.maxHeight = `${maxH}px`;
}

function closeLanguageDropdown() {
    const dropdown = document.getElementById('languageDropdown');
    const toggle = document.getElementById('languageSwitcherBtn');
    const wrap = getLanguageWrap();
    if (dropdown) {
        dropdown.hidden = true;
        dropdown.style.position = '';
        dropdown.style.top = '';
        dropdown.style.right = '';
        dropdown.style.left = '';
        dropdown.style.zIndex = '';
        dropdown.style.maxHeight = '';
        if (dropdown.dataset.langHome === 'header' && wrap && dropdown.parentElement === document.body) {
            wrap.appendChild(dropdown);
            delete dropdown.dataset.langHome;
        }
    }
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    wrap?.classList.remove('is-open');
}

function openLanguageDropdown() {
    const dropdown = document.getElementById('languageDropdown');
    const toggle = document.getElementById('languageSwitcherBtn');
    const wrap = getLanguageWrap();
    if (!dropdown) return;
    if (!dropdown.dataset.built) populateLanguageDropdown();
    dropdown.hidden = false;
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
    wrap?.classList.add('is-open');
    positionLanguageDropdown();
}

function bindLanguageDropdown() {
    const toggle = document.getElementById('languageSwitcherBtn');
    const dropdown = document.getElementById('languageDropdown');
    if (!toggle || !dropdown) return;
    if (toggle.dataset.bound === 'true') return;
    toggle.dataset.bound = 'true';

    toggle.setAttribute('aria-label', t('a11y.chooseLanguage'));
    toggle.setAttribute('aria-controls', 'languageDropdown');
    toggle.setAttribute('aria-haspopup', 'listbox');

    toggle.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (dropdown.hidden) {
            openLanguageDropdown();
        } else {
            closeLanguageDropdown();
        }
    });

    // Delegacja — działa też po przebudowie listy
    dropdown.addEventListener('click', (event) => {
        const btn = event.target?.closest?.('.language-option');
        if (!btn || !dropdown.contains(btn)) return;
        event.preventDefault();
        event.stopPropagation();
        const code = btn.dataset.lang;
        if (code) setAppLanguage(code);
        closeLanguageDropdown();
        toggle.focus();
    });

    document.addEventListener('click', (event) => {
        if (dropdown.hidden) return;
        const t = event.target;
        if (toggle.contains(t) || dropdown.contains(t) || getLanguageWrap()?.contains(t)) return;
        closeLanguageDropdown();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !dropdown.hidden) {
            closeLanguageDropdown();
            toggle.focus();
        }
    });

    window.addEventListener(
        'resize',
        () => {
            if (!dropdown.hidden) positionLanguageDropdown();
        },
        { passive: true }
    );
    window.addEventListener(
        'scroll',
        () => {
            if (!dropdown.hidden) positionLanguageDropdown();
        },
        { passive: true, capture: true }
    );
}

function bindShellPlaceholders() {
    /* Menu ☰ – obsługa w js/core/sideMenu.js */
}

function bindDarkModeToggle() {
    const btn = document.getElementById('darkModeToggleBtn');
    if (!btn || btn.dataset.bound === 'true') return;
    btn.dataset.bound = 'true';

    btn.addEventListener('click', () => {
        setDarkMode(!isDarkMode());
        const profileCheckbox = document.getElementById('profileDarkMode');
        if (profileCheckbox) profileCheckbox.checked = isDarkMode();
    });
}

function bindHeaderPremium() {
    const btn = document.getElementById('headerPremiumBtn');
    if (!btn || btn.dataset.bound === 'true') return;
    btn.dataset.bound = 'true';
    btn.addEventListener('click', () => {
        eventBus.emit(EVENTS.NAVIGATE, { view: 'premium' });
    });
}

function populateLanguageDropdown() {
    const dropdown = document.getElementById('languageDropdown');
    if (!dropdown || dropdown.dataset.built === 'true') return;
    dropdown.dataset.built = 'true';
    // Format: [SVG flaga] Deutsch (DE)
    dropdown.innerHTML = LANG_OPTIONS.map((lang) => {
        const label = lang.label || lang.code;
        const short = lang.short || String(lang.code || '').toUpperCase();
        const flagImg = languageFlagImgHtml(lang.code);
        return `
        <li>
            <button type="button" class="language-option" role="option" data-lang="${lang.code}" aria-label="${label} (${short})">
                ${flagImg}
                <span class="language-option-label">${label}</span>
                <span class="language-option-short">(${short})</span>
            </button>
        </li>`;
    }).join('');
}

export function refreshShellAccessibility() {
    const menuBtn = document.getElementById('menuBtn');
    const langToggle = document.getElementById('languageSwitcherBtn');
    const premiumBtn = document.getElementById('headerPremiumBtn');
    const notifBtn = document.getElementById('headerNotificationsBtn');
    const profileBtn = document.getElementById('headerProfileBtn');
    const bottomNav = document.querySelector('.bottom-nav');
    if (menuBtn) menuBtn.setAttribute('aria-label', t('a11y.menu'));
    if (langToggle) langToggle.setAttribute('aria-label', t('a11y.chooseLanguage'));
    if (premiumBtn) {
        premiumBtn.setAttribute('aria-label', t('nav.premium'));
        premiumBtn.setAttribute('title', t('nav.premium'));
    }
    if (notifBtn) {
        notifBtn.setAttribute('aria-label', t('profile.notifications'));
        notifBtn.setAttribute('title', t('profile.notifications'));
    }
    if (profileBtn) {
        profileBtn.setAttribute('aria-label', t('nav.profile'));
        profileBtn.setAttribute('title', t('nav.profile'));
    }
    if (bottomNav) bottomNav.setAttribute('aria-label', t('shell.label'));

    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
        const key = el.getAttribute('data-i18n-aria');
        if (!key) return;
        const value = t(key);
        if (value && value !== key) el.setAttribute('aria-label', value);
    });

    applyDarkMode(isDarkMode());
}

export function initShellSettings() {
    const settings = getSettings();

    try {
        if (!localStorage.getItem('rs_lang') && settings.language) {
            setLanguage(settings.language);
        } else {
            initLanguage();
        }
    } catch (_) {
        initLanguage();
    }

    const current = getCurrentLanguage();
    if (settings.language !== current) {
        saveSettings({ language: current });
    }

    applyDarkMode(Boolean(settings.darkMode));
    mountLanguageSwitcherInHeader();
    populateLanguageDropdown();
    updateLanguageButtonLabel();
    refreshShellAccessibility();
    syncDocumentMeta();
    bindLanguageDropdown();
    bindDarkModeToggle();
    bindHeaderPremium();
    bindShellPlaceholders();
}

export default {
    getSettings,
    saveSettings,
    isDarkMode,
    setDarkMode,
    applyDarkMode,
    setAppLanguage,
    initShellSettings,
    updateLanguageButtonLabel,
    refreshShellAccessibility
};
