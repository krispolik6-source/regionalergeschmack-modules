/**
 * Panel boczny (☰) – informacje, prawne, pomoc, kontakt, testy użytkowników.
 */
import { navigateTo } from '../controllers/navigation.js';
import { t, getCurrentLanguage, getLanguageOption, LANG_OPTIONS } from './i18n.js';
import { eventBus } from './eventBus.js';
import { EVENTS } from './events.js';
import { APP_DOWNLOAD_URL, CONTACT_EMAIL, MENU_RELEASE_GATES } from '../config.js';
import { promptPwaInstall } from './pwaInstall.js';
import { showToast } from './toast.js';
import { setAppLanguage } from './settings.js';
import { isLocalhost, isProductionHost } from './logger.js';
import { getLanguageFlagSrc } from '../presentation/languageFlags.js';
import {
    getTasteDiaryEntries,
    getTasteDiaryCount,
    removeTasteDiaryEntry
} from './tasteDiary.js';
import { openDeveloperVault } from '../diagnostics/developerVaultPanel.js';

const INTERNAL_MENU_ACTIONS = new Set(['feedback', 'test-guide', 'share-app', 'dev-vault']);

/** Benutzertests + Deweloper: localhost / ?dev=1 / rg_dev_mode — nigdy na hostach produkcyjnych. */
function showInternalMenuSections() {
    try {
        if (isProductionHost()) return false;
        if (isLocalhost()) return true;
        if (localStorage.getItem('rg_dev_mode') === '1') return true;
        if (new URLSearchParams(location.search).get('dev') === '1') return true;
        return false;
    } catch {
        return false;
    }
}

function setMenuGateVisible(root, gate, enabled) {
    root.querySelectorAll(`[data-menu-gate="${gate}"]`).forEach((el) => {
        el.hidden = !enabled;
    });
}

/** F1–F3 + W3: ukryj stuby pobierania oraz sekcje wewnętrzne poza trybem deweloperskim. */
function applyMenuVisibilityGates() {
    const root = getRoot();
    if (!root) return;

    const gates = MENU_RELEASE_GATES || {};
    setMenuGateVisible(root, 'apk', Boolean(gates.showApkDownload));
    setMenuGateVisible(root, 'pdf', Boolean(gates.showInstallPdf));
    setMenuGateVisible(root, 'stores', Boolean(gates.showStoreLinks));

    const showInternal = showInternalMenuSections();
    root.querySelectorAll('[data-menu-internal]').forEach((el) => {
        el.hidden = !showInternal;
    });

    // Pusty kontener pobrań w „Empfehlungen” – ukryj, gdy brak obu linków
    root.querySelectorAll('.side-menu-downloads').forEach((box) => {
        const visible = [...box.querySelectorAll('[data-menu-gate]')].some((el) => !el.hidden);
        box.hidden = !visible;
    });
}

/** Opinie z formularza ☰ → localStorage */
export const FEEDBACK_STORAGE_KEY = 'rg_user_feedback_log';
/** Ostatni język wybrany w formularzu Opinii (kod UI, np. pl) */
const FEEDBACK_LANG_KEY = 'rg_feedback_lang';

const VIEWS = {
    main: 'main',
    terms: 'terms',
    privacy: 'privacy',
    about: 'about',
    guide: 'guide',
    download: 'download',
    qr: 'qr',
    recommendations: 'recommendations',
    contact: 'contact',
    author: 'author',
    cooperation: 'cooperation',
    'report-bug': 'report-bug',
    feedback: 'feedback',
    'test-guide': 'test-guide',
    'share-app': 'share-app',
    'taste-diary': 'taste-diary'
};

const VIEW_MENU_KEYS = {
    [VIEWS.main]: 'title',
    [VIEWS.terms]: 'terms',
    [VIEWS.privacy]: 'privacy',
    [VIEWS.about]: 'about',
    [VIEWS.guide]: 'guide',
    [VIEWS.download]: 'downloadApp',
    [VIEWS.qr]: 'qr',
    [VIEWS.recommendations]: 'recommendations',
    [VIEWS.contact]: 'contact',
    [VIEWS.author]: 'author',
    [VIEWS.cooperation]: 'cooperation',
    [VIEWS['report-bug']]: 'reportBug',
    [VIEWS.feedback]: 'feedback',
    [VIEWS['test-guide']]: 'testGuide',
    [VIEWS['share-app']]: 'shareApp',
    [VIEWS['taste-diary']]: 'tasteDiary'
};

const ACTION_MENU_KEYS = {
    home: 'home',
    map: 'map',
    favorites: 'favorites',
    cart: 'cart',
    premium: 'premium',
    terms: 'terms',
    privacy: 'privacy',
    about: 'about',
    guide: 'guide',
    'download-app': 'downloadApp',
    qr: 'qr',
    recommendations: 'recommendations',
    'download-pdf': 'downloadPdf',
    'install-pwa': 'installApp',
    contact: 'contact',
    author: 'author',
    cooperation: 'cooperation',
    'report-bug': 'reportBug',
    feedback: 'feedback',
    'test-guide': 'testGuide',
    'share-app': 'shareApp',
    'taste-diary': 'tasteDiary',
    'dev-vault': 'devVault'
};

const NAV_ACTIONS = new Set(['home', 'map', 'favorites', 'cart', 'premium']);

let initialized = false;
let isOpen = false;
let currentViewId = VIEWS.main;

function menuLabel(key) {
    const text = t(`menu.${key}`);
    return text === `menu.${key}` ? key : text;
}

function aboutLabel(key) {
    const text = t(`aboutPage.${key}`);
    return text === `aboutPage.${key}` ? key : text;
}

function testingLabel(key) {
    const text = t(`testing.${key}`);
    return text === `testing.${key}` ? key : text;
}

function legalLabel(key) {
    const text = t(`legal.${key}`);
    return text === `legal.${key}` ? key : text;
}

function helpLabel(key) {
    const text = t(`help.${key}`);
    return text === `help.${key}` ? key : text;
}

function applyI18nNodes(root, attrName, resolve) {
    root.querySelectorAll(`[${attrName}]`).forEach((el) => {
        const key = el.getAttribute(attrName);
        if (!key) return;
        const value = resolve(key);
        if (el.dataset.i18nHtml === 'true') {
            el.innerHTML = value;
        } else {
            el.textContent = value;
        }
    });
}

function detectDeviceType() {
    const ua = navigator.userAgent || '';
    const coarse = window.matchMedia?.('(pointer: coarse)')?.matches;
    const w = window.innerWidth || 0;
    if (/iPad|Tablet|Android(?!.*Mobile)/i.test(ua) || (coarse && w >= 768 && w < 1024)) {
        return 'tablet';
    }
    if (/Mobi|Android|iPhone|iPod/i.test(ua) || (coarse && w < 768)) {
        return 'phone';
    }
    if (w >= 1024) return 'desktop';
    return 'other';
}

function populateFeedbackLanguageSelect() {
    const select = document.getElementById('feedbackLanguage');
    if (!select) return;

    if (select.dataset.built !== 'true') {
        select.dataset.built = 'true';
        select.innerHTML = LANG_OPTIONS.map((lang) => {
            const short = lang.short || String(lang.code || '').toUpperCase();
            // Native <option> nie renderuje SVG — emoji + nazwa; flaga SVG obok selecta
            const flag = lang.flag || '';
            return `<option value="${lang.code}">${flag} ${lang.label} (${short})</option>`;
        }).join('');
    }

    // Synchronizacja z globalnym językiem UI (ten sam LANG_OPTIONS / i18n)
    let preferred = getCurrentLanguage();
    if (![...select.options].some((o) => o.value === preferred)) {
        preferred = LANG_OPTIONS[0]?.code || 'de';
    }
    select.value = preferred;
    updateFeedbackLanguageFlag(preferred);
}

function updateFeedbackLanguageFlag(code) {
    const img = document.getElementById('feedbackLanguageFlag');
    if (!img) return;
    img.src = getLanguageFlagSrc(code);
    img.alt = String(code || '').toUpperCase();
}

function onFeedbackLanguageChange(event) {
    const select = event?.target || document.getElementById('feedbackLanguage');
    const code = String(select?.value || '').trim();
    if (!code) return;
    try {
        localStorage.setItem(FEEDBACK_LANG_KEY, code);
    } catch {
        /* ignore */
    }
    updateFeedbackLanguageFlag(code);
    // Ten sam system i18n co główny przełącznik — UI Opinii i aplikacji się aktualizuje
    setAppLanguage(code);
}

function prepareFeedbackForm() {
    populateFeedbackLanguageSelect();
    const deviceSelect = document.getElementById('feedbackDevice');
    if (deviceSelect && !deviceSelect.dataset.userPicked) {
        deviceSelect.value = detectDeviceType();
    }
}

function getSharePromoText() {
    const text = testingLabel('shareText');
    if (text && text !== 'shareText') return text;
    const url = APP_DOWNLOAD_URL || 'https://admirable-cascaron-c76940.netlify.app';
    return `🌾 Regionaler Geschmack\n\n📱 ${url}`;
}

function prepareSharePanel() {
    const url = APP_DOWNLOAD_URL || 'https://admirable-cascaron-c76940.netlify.app';
    const urlEl = document.getElementById('sideMenuShareUrl');
    const textEl = document.getElementById('sideMenuShareText');
    const openLink = document.getElementById('sideMenuShareOpenLink');
    const nativeBtn = document.getElementById('sideMenuShareNativeBtn');
    if (urlEl) urlEl.textContent = url;
    if (textEl) textEl.textContent = getSharePromoText();
    if (openLink) openLink.href = url;
    if (nativeBtn) {
        nativeBtn.hidden = !(typeof navigator.share === 'function');
    }
}

export function getStoredFeedback() {
    try {
        const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
    } catch (_) {
        return [];
    }
}

function storeFeedbackLocally(entry) {
    try {
        const next = getStoredFeedback();
        next.push(entry);
        localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(next.slice(-50)));
    } catch (_) {
        /* ignore */
    }
}

function submitFeedbackForm(event) {
    event.preventDefault();
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    const name = String(form.elements.namedItem('name')?.value || '').trim();
    const opinion = String(form.elements.namedItem('opinion')?.value || '').trim();
    const ratingRaw = String(form.elements.namedItem('rating')?.value || '').trim();
    const rating = Number(ratingRaw);
    const device = String(form.elements.namedItem('device')?.value || '').trim();
    // select.value = kod UI (np. pl); do maila pełna etykieta
    const langCode = String(form.elements.namedItem('language')?.value || getCurrentLanguage()).trim();
    const langOpt = getLanguageOption(langCode);
    const language = langOpt
        ? `${langOpt.flag || ''} ${langOpt.label} (${langOpt.short || langCode.toUpperCase()})`.trim()
        : langCode;

    if (!name) {
        showToast(testingLabel('feedbackNameRequired'), 'error');
        document.getElementById('feedbackName')?.focus();
        return;
    }

    if (!opinion) {
        showToast(testingLabel('feedbackRequired'), 'error');
        document.getElementById('feedbackOpinion')?.focus();
        return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        showToast(testingLabel('feedbackRatingRequired'), 'error');
        form.querySelector('[name="rating"]')?.focus();
        return;
    }

    const entry = {
        id: `fb-${Date.now().toString(36)}`,
        name,
        opinion,
        rating,
        device,
        language,
        at: new Date().toISOString(),
        ua: typeof navigator !== 'undefined' ? navigator.userAgent || '' : '',
        href: typeof window !== 'undefined' ? window.location.href : ''
    };
    storeFeedbackLocally(entry);

    const subject = encodeURIComponent(
        testingLabel('feedbackMailSubject')
            .replace('{rating}', String(rating))
            .replace('{language}', language)
    );
    const body = encodeURIComponent(
        [
            testingLabel('feedbackMailName').replace('{name}', entry.name),
            testingLabel('feedbackMailRating').replace('{rating}', String(entry.rating)),
            testingLabel('feedbackMailDevice').replace('{device}', entry.device),
            testingLabel('feedbackMailLanguage').replace('{language}', entry.language),
            testingLabel('feedbackMailUrl').replace('{url}', entry.href),
            '',
            entry.opinion,
            '',
            testingLabel('feedbackMailUa').replace('{ua}', entry.ua)
        ].join('\n')
    );
    const mail = CONTACT_EMAIL || 'krispolik6@gmail.com';
    showToast(testingLabel('feedbackThanks'), 'success');
    form.reset();
    // Opcjonalnie otwórz mail – lokalny zapis już jest w localStorage
    try {
        window.location.href = `mailto:${mail}?subject=${subject}&body=${body}`;
    } catch (_) {
        /* ignore */
    }
}

async function copyShareLink() {
    const text = getSharePromoText();
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
        } else {
            const tmp = document.createElement('textarea');
            tmp.value = text;
            tmp.setAttribute('readonly', '');
            tmp.style.position = 'fixed';
            tmp.style.opacity = '0';
            document.body.appendChild(tmp);
            tmp.select();
            document.execCommand('copy');
            tmp.remove();
        }
        showToast(testingLabel('shareCopied'), 'success');
    } catch (_) {
        showToast(APP_DOWNLOAD_URL || text, 'info');
    }
}

async function nativeShareApp() {
    const url = APP_DOWNLOAD_URL || 'https://admirable-cascaron-c76940.netlify.app';
    const text = getSharePromoText();
    if (typeof navigator.share !== 'function') {
        await copyShareLink();
        return;
    }
    try {
        await navigator.share({
            title: 'Regionaler Geschmack',
            text,
            url
        });
    } catch (err) {
        if (err && err.name === 'AbortError') return;
        await copyShareLink();
    }
}

function getRoot() {
    return document.getElementById('sideMenu');
}

function ensureQrCode() {
    const target = APP_DOWNLOAD_URL;
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(target)}`;

    const img = document.getElementById('sideMenuQrImage');
    if (!img || img.dataset.loaded === 'true') return;
    img.src = url;
    img.dataset.loaded = 'true';
}

function refreshSideMenuI18n() {
    const root = getRoot();
    if (!root) return;

    root.querySelectorAll('[data-i18n-menu]').forEach((el) => {
        const key = el.dataset.i18nMenu;
        if (key) el.textContent = menuLabel(key);
    });

    root.querySelectorAll('[data-i18n-menu-section]').forEach((el) => {
        const key = el.dataset.i18nMenuSection;
        if (key) {
            const icon = el.dataset.i18nMenuIcon || '';
            el.textContent = icon ? `${icon} ${menuLabel(key)}` : menuLabel(key);
        }
    });

    root.querySelectorAll('[data-side-menu-action]').forEach((btn) => {
        const action = btn.dataset.sideMenuAction;
        const menuKey = ACTION_MENU_KEYS[action];
        const labelEl = btn.querySelector('.side-menu-item-label');
        if (menuKey && labelEl) labelEl.textContent = menuLabel(menuKey);
    });

    refreshTasteDiaryMenuCount();

    const backBtn = root.querySelector('[data-side-menu-action="back"]');
    if (backBtn) backBtn.setAttribute('aria-label', menuLabel('back'));

    const closeBtn = root.querySelector('.side-menu-close');
    if (closeBtn) closeBtn.setAttribute('aria-label', menuLabel('close'));

    const titleText = root.querySelector('#sideMenuTitleText') || root.querySelector('#sideMenuTitle');
    if (titleText) {
        const viewKey = VIEW_MENU_KEYS[currentViewId] || 'title';
        titleText.textContent = menuLabel(viewKey);
    }

    root.querySelectorAll('[data-i18n-about]').forEach((el) => {
        const key = el.dataset.i18nAbout;
        if (key) el.textContent = aboutLabel(key);
    });

    applyI18nNodes(root, 'data-i18n-legal', legalLabel);
    applyI18nNodes(root, 'data-i18n-help', helpLabel);

    root.querySelectorAll('[data-i18n-testing]').forEach((el) => {
        const key = el.dataset.i18nTesting;
        if (key) el.textContent = testingLabel(key);
    });

    root.querySelectorAll('[data-i18n-testing-option]').forEach((el) => {
        const key = el.dataset.i18nTestingOption;
        if (key) el.textContent = testingLabel(key);
    });

    root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
        const key = el.dataset.i18nAria;
        if (key) el.setAttribute('aria-label', t(key));
    });

    root.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (!key) return;
        const value = t(key);
        if (value && value !== key) el.textContent = value;
    });

    const mail = CONTACT_EMAIL || 'krispolik6@gmail.com';
    const coopLink = root.querySelector('[data-side-menu-view="cooperation"] a[href^="mailto"]');
    if (coopLink) {
        coopLink.href = `mailto:${mail}?subject=${encodeURIComponent(helpLabel('coopMailSubject'))}`;
    }
    const bugLink = root.querySelector('[data-side-menu-view="report-bug"] a[href^="mailto"]');
    if (bugLink) {
        bugLink.href = `mailto:${mail}?subject=${encodeURIComponent(helpLabel('bugMailSubject'))}`;
    }

    const menuQr = document.getElementById('sideMenuQrImage');
    if (menuQr) menuQr.alt = helpLabel('qrAlt');

    if (currentViewId === VIEWS.feedback) prepareFeedbackForm();
    if (currentViewId === VIEWS['taste-diary']) {
        const title = document.getElementById('tasteDiaryPanelTitle');
        if (title) title.textContent = t('tasteDiary.title');
        renderTasteDiaryPanel();
    }
    prepareSharePanel();
}

function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatDiaryDate(iso) {
    try {
        const lang = getCurrentLanguage() || undefined;
        return new Date(iso).toLocaleDateString(lang, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch {
        return String(iso || '').slice(0, 10);
    }
}

/** Etykieta ☰: „Pamiętnik smaków (3)” */
export function refreshTasteDiaryMenuCount() {
    const root = getRoot();
    const labelEl = root?.querySelector(
        '[data-side-menu-action="taste-diary"] .side-menu-item-label'
    );
    if (!labelEl) return;
    const count = getTasteDiaryCount();
    const base = menuLabel('tasteDiary');
    labelEl.textContent = `${base} (${count})`;
}

function renderTasteDiaryPanel() {
    const listEl = document.getElementById('tasteDiaryList');
    if (!listEl) return;

    refreshTasteDiaryMenuCount();

    const entries = getTasteDiaryEntries();
    if (!entries.length) {
        listEl.innerHTML = `
            <p class="taste-diary-empty">${escapeHtml(t('tasteDiary.empty'))}</p>
        `;
        return;
    }

    listEl.innerHTML = entries
        .map((entry) => {
            const stars = '★'.repeat(Math.max(1, Math.min(5, entry.rating || 0)));
            const img = entry.image
                ? `<img class="taste-diary-thumb" src="${escapeHtml(entry.image)}" alt="" loading="lazy">`
                : '';
            const dateLabel = formatDiaryDate(entry.date);
            return `
                <article class="taste-diary-item" data-taste-diary-id="${escapeHtml(entry.id)}">
                    ${img}
                    <div class="taste-diary-item-body">
                        <h4 class="taste-diary-item-title">${escapeHtml(entry.productName)}</h4>
                        <p class="taste-diary-item-date">${escapeHtml(dateLabel)}</p>
                        <p class="taste-diary-item-meta">${escapeHtml(entry.producerName || entry.producerId)} · ${escapeHtml(stars)}</p>
                        ${entry.note ? `<p class="taste-diary-item-note">${escapeHtml(entry.note)}</p>` : ''}
                        <button type="button" class="btn-secondary taste-diary-delete" data-taste-diary-delete="${escapeHtml(entry.id)}">${escapeHtml(t('tasteDiary.delete'))}</button>
                    </div>
                </article>
            `;
        })
        .join('');
}

function showView(viewId) {
    const root = getRoot();
    if (!root) return;

    currentViewId = viewId;

    root.querySelectorAll('[data-side-menu-view]').forEach((el) => {
        const match = el.dataset.sideMenuView === viewId;
        el.hidden = !match;
    });

    const backBtn = root.querySelector('[data-side-menu-action="back"]');
    if (backBtn) backBtn.hidden = viewId === VIEWS.main;

    refreshSideMenuI18n();

    const body = root.querySelector('.side-menu-body');
    if (body) body.scrollTop = 0;

    if (viewId === VIEWS.qr) ensureQrCode();
    if (viewId === VIEWS.feedback) prepareFeedbackForm();
    if (viewId === VIEWS['share-app']) prepareSharePanel();
    if (viewId === VIEWS['taste-diary']) renderTasteDiaryPanel();
}

function openSideMenu() {
    const root = getRoot();
    if (!root || isOpen) return;

    isOpen = true;
    root.hidden = false;
    root.setAttribute('aria-hidden', 'false');
    document.body.classList.add('side-menu-open');
    showView(VIEWS.main);

    const menuBtn = document.getElementById('menuBtn');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');

    requestAnimationFrame(() => {
        root.classList.add('is-open');
    });

    const closeBtn = root.querySelector('.side-menu-close');
    if (closeBtn) closeBtn.focus();
}

function closeSideMenu() {
    const root = getRoot();
    if (!root || !isOpen) return;

    isOpen = false;
    root.classList.remove('is-open');
    root.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('side-menu-open');

    const menuBtn = document.getElementById('menuBtn');
    if (menuBtn) {
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.focus();
    }

    window.setTimeout(() => {
        if (!isOpen) root.hidden = true;
    }, 300);
}

function handleAction(action) {
    if (NAV_ACTIONS.has(action)) {
        navigateTo(action);
        closeSideMenu();
        return;
    }

    if (INTERNAL_MENU_ACTIONS.has(action) && !showInternalMenuSections()) {
        return;
    }

    switch (action) {
        case 'download-pdf':
            if (!MENU_RELEASE_GATES?.showInstallPdf) return;
            window.location.href = '/docs/instrukcja-instalacji.pdf';
            break;
        case 'install-pwa':
            promptPwaInstall().finally(() => closeSideMenu());
            break;
        case 'download-app':
            showView(VIEWS.download);
            break;
        case 'terms':
        case 'privacy':
        case 'about':
        case 'guide':
        case 'qr':
        case 'recommendations':
        case 'contact':
        case 'author':
        case 'cooperation':
        case 'report-bug':
        case 'feedback':
        case 'test-guide':
        case 'share-app':
        case 'taste-diary':
            showView(VIEWS[action] || VIEWS.main);
            break;
        case 'dev-vault':
            closeSideMenu();
            openDeveloperVault();
            break;
        case 'back':
            showView(VIEWS.main);
            break;
        default:
            break;
    }
}

function bindEvents() {
    const root = getRoot();
    if (!root || root.dataset.bound === 'true') return;
    root.dataset.bound = 'true';

    const menuBtn = document.getElementById('menuBtn');
    if (menuBtn && menuBtn.dataset.sideMenuBound !== 'true') {
        menuBtn.dataset.sideMenuBound = 'true';
        menuBtn.setAttribute('aria-controls', 'sideMenu');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            if (isOpen) closeSideMenu();
            else openSideMenu();
        });
    }

    root.addEventListener('click', (event) => {
        const closeTarget = event.target.closest('[data-side-menu-close]');
        if (closeTarget) {
            closeSideMenu();
            return;
        }

        const actionBtn = event.target.closest('[data-side-menu-action]');
        if (actionBtn) {
            handleAction(actionBtn.dataset.sideMenuAction);
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || !isOpen) return;
        const rootEl = getRoot();
        const mainView = rootEl?.querySelector('[data-side-menu-view="main"]');
        if (mainView && mainView.hidden) {
            showView(VIEWS.main);
        } else {
            closeSideMenu();
        }
    });

    const feedbackForm = document.getElementById('userFeedbackForm');
    if (feedbackForm && feedbackForm.dataset.bound !== 'true') {
        feedbackForm.dataset.bound = 'true';
        feedbackForm.addEventListener('submit', submitFeedbackForm);
        const deviceSelect = document.getElementById('feedbackDevice');
        deviceSelect?.addEventListener('change', () => {
            deviceSelect.dataset.userPicked = 'true';
        });
        const langSelect = document.getElementById('feedbackLanguage');
        langSelect?.addEventListener('change', onFeedbackLanguageChange);
    }

    const copyBtn = document.getElementById('sideMenuShareCopyBtn');
    if (copyBtn && copyBtn.dataset.bound !== 'true') {
        copyBtn.dataset.bound = 'true';
        copyBtn.addEventListener('click', () => {
            void copyShareLink();
        });
    }

    const nativeBtn = document.getElementById('sideMenuShareNativeBtn');
    if (nativeBtn && nativeBtn.dataset.bound !== 'true') {
        nativeBtn.dataset.bound = 'true';
        nativeBtn.addEventListener('click', () => {
            void nativeShareApp();
        });
    }

    const diaryList = document.getElementById('tasteDiaryList');
    if (diaryList && diaryList.dataset.bound !== 'true') {
        diaryList.dataset.bound = 'true';
        diaryList.addEventListener('click', (event) => {
            const btn = event.target.closest('[data-taste-diary-delete]');
            if (!btn) return;
            const id = btn.getAttribute('data-taste-diary-delete');
            if (!id) return;
            removeTasteDiaryEntry(id);
            showToast(t('tasteDiary.deleted'));
            refreshTasteDiaryMenuCount();
            renderTasteDiaryPanel();
        });
    }
}

export function initSideMenu() {
    if (initialized) return;
    initialized = true;
    prepareSharePanel();
    bindEvents();
    applyMenuVisibilityGates();
    refreshSideMenuI18n();
    eventBus.on(EVENTS.LANGUAGE_CHANGED, () => {
        applyMenuVisibilityGates();
        refreshSideMenuI18n();
    });
}

export function openMenu() {
    openSideMenu();
}

export function closeMenu() {
    closeSideMenu();
}

export default { initSideMenu, openMenu, closeMenu };
