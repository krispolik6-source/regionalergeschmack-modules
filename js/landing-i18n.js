/**
 * i18n dla landing.html — ?lang= / localStorage.rs_lang / navigator.
 * Nie ładuje całej aplikacji; tylko TRANSLATIONS + apply.
 */
import {
    TRANSLATIONS,
    SUPPORTED_LANGUAGE_CODES,
    normalizeBrowserLanguage
} from './translations.js';

const STORAGE_KEY = 'rs_lang';

function resolveLandingLang() {
    try {
        const urlLang = new URLSearchParams(window.location.search).get('lang');
        if (urlLang) {
            const n = normalizeBrowserLanguage(urlLang);
            if (SUPPORTED_LANGUAGE_CODES.includes(n)) return n;
        }
    } catch {
        /* ignore */
    }
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && SUPPORTED_LANGUAGE_CODES.includes(stored)) return stored;
    } catch {
        /* ignore */
    }
    try {
        const raw = navigator.language || navigator.languages?.[0] || 'de';
        const n = normalizeBrowserLanguage(raw);
        if (SUPPORTED_LANGUAGE_CODES.includes(n)) return n;
    } catch {
        /* ignore */
    }
    return 'de';
}

function pack(lang) {
    return TRANSLATIONS[lang] || TRANSLATIONS.en || TRANSLATIONS.de || {};
}

function landingText(lang, key) {
    const value = pack(lang)?.landing?.[key];
    if (typeof value === 'string' && value) return value;
    const fallback = pack('en')?.landing?.[key] || pack('de')?.landing?.[key];
    return typeof fallback === 'string' ? fallback : '';
}

function footerAddress(lang) {
    return pack(lang)?.footer?.address || pack('en')?.footer?.address || 'Polikarski Krzysztof, Germany';
}

function setMeta(lang) {
    const title = landingText(lang, 'metaTitle');
    const description = landingText(lang, 'metaDescription');
    const keywords = landingText(lang, 'metaKeywords');
    const og = pack(lang)?.meta?.ogDescription || landingText(lang, 'metaDescription');

    if (title) document.title = title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc && description) desc.setAttribute('content', description);
    let kw = document.querySelector('meta[name="keywords"]');
    if (!kw && keywords) {
        kw = document.createElement('meta');
        kw.setAttribute('name', 'keywords');
        document.head.appendChild(kw);
    }
    if (kw && keywords) kw.setAttribute('content', keywords);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && og) ogDesc.setAttribute('content', og);
    document.documentElement.lang = lang === 'zh-tw' ? 'zh-Hant' : lang === 'zh' ? 'zh-Hans' : lang === 'no' ? 'nb' : lang;
}

export function applyLandingI18n(explicitLang) {
    const lang = explicitLang || resolveLandingLang();
    setMeta(lang);

    document.querySelectorAll('[data-i18n-landing]').forEach((el) => {
        const key = el.getAttribute('data-i18n-landing');
        if (!key) return;
        let text = landingText(lang, key);
        if (!text) return;
        if (key === 'footerLine') {
            text = text.replace('{address}', footerAddress(lang));
        }
        if (el.dataset.i18nHtml === 'true') el.innerHTML = text;
        else el.textContent = text;
    });

    document.querySelectorAll('[data-i18n-landing-aria]').forEach((el) => {
        const key = el.getAttribute('data-i18n-landing-aria');
        const text = landingText(lang, key);
        if (text) el.setAttribute('aria-label', text);
    });

    return lang;
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => applyLandingI18n());
    } else {
        applyLandingI18n();
    }
}

export default { applyLandingI18n };
