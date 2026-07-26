/**
 * Kolorowe flagi SVG (lokalnie /assets/flags/) — mapowanie kodu UI → plik.
 * Źródło: flagcdn.com (ISO country → zapisane jako {langCode}.svg).
 */

/** @type {Readonly<Record<string, string>>} */
export const LANG_FLAG_FILES = Object.freeze({
    de: 'de.svg',
    en: 'en.svg', // GB
    pl: 'pl.svg',
    ru: 'ru.svg',
    tr: 'tr.svg',
    fr: 'fr.svg',
    es: 'es.svg',
    it: 'it.svg',
    nl: 'nl.svg',
    cs: 'cs.svg', // CZ
    sk: 'sk.svg',
    hu: 'hu.svg',
    ro: 'ro.svg',
    bg: 'bg.svg',
    el: 'el.svg', // GR
    hr: 'hr.svg',
    sr: 'sr.svg', // RS
    mk: 'mk.svg',
    sl: 'sl.svg', // SI
    lt: 'lt.svg',
    lv: 'lv.svg',
    et: 'et.svg', // EE
    fi: 'fi.svg',
    sv: 'sv.svg', // SE
    no: 'no.svg',
    da: 'da.svg', // DK
    is: 'is.svg',
    zh: 'zh.svg', // CN
    'zh-tw': 'zh-tw.svg', // TW
    ja: 'ja.svg', // JP
    ko: 'ko.svg', // KR
    vi: 'vi.svg', // VN
    ms: 'ms.svg', // MY
    id: 'id.svg',
    th: 'th.svg',
    hi: 'hi.svg' // IN
});

const FLAG_BASE = '/assets/flags';
const FLAG_CDN_FALLBACK = {
    de: 'de',
    en: 'gb',
    pl: 'pl',
    ru: 'ru',
    tr: 'tr',
    fr: 'fr',
    es: 'es',
    it: 'it',
    nl: 'nl',
    cs: 'cz',
    sk: 'sk',
    hu: 'hu',
    ro: 'ro',
    bg: 'bg',
    el: 'gr',
    hr: 'hr',
    sr: 'rs',
    mk: 'mk',
    sl: 'si',
    lt: 'lt',
    lv: 'lv',
    et: 'ee',
    fi: 'fi',
    sv: 'se',
    no: 'no',
    da: 'dk',
    is: 'is',
    zh: 'cn',
    'zh-tw': 'tw',
    ja: 'jp',
    ko: 'kr',
    vi: 'vn',
    ms: 'my',
    id: 'id',
    th: 'th',
    hi: 'in'
};

/** Lokalna ścieżka SVG dla kodu języka UI. */
export function getLanguageFlagSrc(code) {
    const key = String(code || 'de');
    const file = LANG_FLAG_FILES[key];
    if (file) return `${FLAG_BASE}/${file}`;
    const cc = FLAG_CDN_FALLBACK[key] || key.split('-')[0];
    return `https://flagcdn.com/${cc}.svg`;
}

/**
 * HTML <img> flagi (20×15).
 * @param {string} code
 * @param {{ className?: string }} [opts]
 */
export function languageFlagImgHtml(code, opts = {}) {
    const src = getLanguageFlagSrc(code);
    const cls = opts.className || 'language-option-flag-img';
    const alt = String(code || '').toUpperCase();
    return `<img class="${cls}" src="${src}" alt="${alt}" width="20" height="15" loading="lazy" decoding="async">`;
}

export default { getLanguageFlagSrc, languageFlagImgHtml, LANG_FLAG_FILES };
