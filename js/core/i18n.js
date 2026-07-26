// js/core/i18n.js – tłumaczenia i wybór języka

import {
    LANG_OPTIONS,
    SUPPORTED_LANGUAGE_CODES,
    TRANSLATIONS,
    CATALOG_TRANSLATIONS,
    detectBrowserLanguage,
    normalizeBrowserLanguage
} from '../translations.js';
import {
    translateSoft,
    translate,
    translateProduct,
    translateProducerProfile
} from '../i18n/aiTranslationEngine.js';

const LANG_STORAGE_KEY = 'rs_lang';

let currentLanguage = 'de';

function resolvePath(obj, path) {
    return path.split('.').reduce(
        (acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined),
        obj
    );
}

export { LANG_OPTIONS, SUPPORTED_LANGUAGE_CODES };

export function getCurrentLanguage() {
    return currentLanguage;
}

export function isSupportedLanguage(code) {
    return SUPPORTED_LANGUAGE_CODES.includes(code);
}

export function setLanguage(code) {
    const normalized = normalizeBrowserLanguage(code);
    // UI: obsługiwany język albo fallback EN (nie DE — poza jawnym de)
    const valid = isSupportedLanguage(normalized);
    currentLanguage = valid ? normalized : 'en';
    try {
        localStorage.setItem(LANG_STORAGE_KEY, currentLanguage);
    } catch (_) { /* ignore */ }
    document.documentElement.lang = currentLanguage;
    return currentLanguage;
}

/** Kolejność: zapisany wybór → język przeglądarki → EN jeśli nieobsługiwany */
export function initLanguage() {
    try {
        const stored = localStorage.getItem(LANG_STORAGE_KEY);
        if (stored && isSupportedLanguage(stored)) {
            return setLanguage(stored);
        }
    } catch (_) { /* ignore */ }

    const browser = detectBrowserLanguage();
    if (isSupportedLanguage(browser)) return setLanguage(browser);
    return setLanguage('en');
}

export function loadStoredLanguage() {
    return initLanguage();
}

export function t(key, lang = currentLanguage) {
    const value = resolvePath(TRANSLATIONS[lang], key)
        ?? resolvePath(TRANSLATIONS.en, key)
        ?? resolvePath(TRANSLATIONS.de, key);
    return value ?? key;
}

export function getLanguageOption(code = currentLanguage) {
    return LANG_OPTIONS.find((l) => l.code === code) || LANG_OPTIONS[0];
}

/**
 * Opis producenta – katalog statyczny, potem cache silnika dynamicznego (tło).
 * Nazwa firmy pozostaje w danych źródłowych.
 */
export function tProducerDescription(producerId, fallbackDescription, lang = currentLanguage, protect = []) {
    if (!fallbackDescription) return fallbackDescription;
    if (lang === 'de') return fallbackDescription;
    const entry = CATALOG_TRANSLATIONS[lang]?.[producerId];
    if (entry?.description) return entry.description;
    return translateSoft(fallbackDescription, { to: lang, from: 'de', protect });
}

/** Produkt w katalogu – nazwa/opis; brak w katalogu → tłumaczenie dynamiczne (cache). */
export function tProductField(producerId, productIndex, field, fallback, lang = currentLanguage) {
    if (fallback == null || fallback === '') return fallback;
    if (lang === 'de') return fallback;
    const entry = CATALOG_TRANSLATIONS[lang]?.[producerId]?.products?.[productIndex];
    if (entry?.[field]) return entry[field];
    if (field === 'name' || field === 'description') {
        return translateSoft(String(fallback), { to: lang, from: 'de' });
    }
    return fallback;
}

/** Async — wymuś tłumaczenie (np. przed otwarciem modala). */
export function translateDynamicContent(text, lang = currentLanguage) {
    return translate(text, { to: lang, from: 'de' });
}

export { translateProduct, translateProducerProfile, translateSoft, translate };

export function formatNavLabel(viewKey, count = 0) {
    const label = t(`nav.${viewKey}`);
    return count > 0 ? `${label} (${count})` : label;
}

const currencyFormatters = new Map();

export function formatCurrency(value, lang = currentLanguage) {
    const localeMap = {
        de: 'de-DE',
        pl: 'pl-PL',
        en: 'en-GB',
        fr: 'fr-FR',
        es: 'es-ES',
        it: 'it-IT',
        nl: 'nl-NL',
        tr: 'tr-TR',
        ru: 'ru-RU'
    };
    const locale = localeMap[lang] || 'de-DE';
    if (!currencyFormatters.has(locale)) {
        currencyFormatters.set(locale, new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'EUR'
        }));
    }
    return currencyFormatters.get(locale).format(Number(value) || 0);
}

export default {
    t,
    setLanguage,
    getCurrentLanguage,
    initLanguage,
    loadStoredLanguage,
    translateDynamicContent,
    LANG_OPTIONS,
    tProducerDescription,
    tProductField,
    formatNavLabel,
    formatCurrency,
    detectBrowserLanguage
};
