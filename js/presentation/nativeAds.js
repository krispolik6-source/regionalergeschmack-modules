/**
 * Subtelne reklamy natywne – bez dźwięku, bez migania, bez zasłaniania treści.
 * Premium: reklamy wyłączone.
 */
import { t } from '../core/i18n.js';
import { isPaidPremium } from '../core/premiumService.js';
import { CONTACT_EMAIL } from '../config.js';

/** Rotacja banerów Home: 5–10 s */
const ROTATE_MS = 7000;

/** Panel reklamowy Home (ex „Trasy tematyczne”) – 4 banery w karuzeli */
const HOME_BANNERS = Object.freeze([
    {
        id: 'local-box',
        icon: '🧺',
        titleKey: 'ads.bannerLocalTitle',
        textKey: 'ads.bannerLocalText',
        ctaKey: 'ads.bannerLocalCta',
        action: 'map'
    },
    {
        id: 'season',
        icon: '🥕',
        titleKey: 'ads.bannerSeasonTitle',
        textKey: 'ads.bannerSeasonText',
        ctaKey: 'ads.bannerSeasonCta',
        action: 'map'
    },
    {
        id: 'premium',
        icon: '👑',
        titleKey: 'ads.bannerPremiumTitle',
        textKey: 'ads.bannerPremiumText',
        ctaKey: 'ads.bannerPremiumCta',
        action: 'premium'
    },
    {
        id: 'partner',
        icon: '🤝',
        titleKey: 'ads.bannerPartnerTitle',
        textKey: 'ads.bannerPartnerText',
        ctaKey: 'ads.bannerPartnerCta',
        action: 'partner'
    }
]);

const POPUP_TIPS = Object.freeze([
    { id: 'tip-premium', textKey: 'ads.popupPremium', action: 'premium' },
    { id: 'tip-partner', textKey: 'ads.popupPartner', action: 'partner' },
    { id: 'tip-local', textKey: 'ads.popupLocal', action: 'map' }
]);

let homeRotateTimer = null;
let homeRotateIndex = 0;

function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** Czy pokazywać reklamy (ukryte tylko przy opłaconym Premium; trial nadal widzi). */
export function shouldShowNativeAds() {
    try {
        return !isPaidPremium();
    } catch (_) {
        return true;
    }
}

export function stopHomeAdRotation() {
    if (homeRotateTimer != null) {
        clearInterval(homeRotateTimer);
        homeRotateTimer = null;
    }
}

function partnerMailto() {
    const subject = encodeURIComponent(
        t('ads.partnerMailSubject') || 'Regionaler Geschmack – Kooperation / Werbung'
    );
    return `mailto:${CONTACT_EMAIL}?subject=${subject}`;
}

/**
 * HTML panelu reklamowego Home (karuzela 4 banerów + etykieta „Reklama”).
 * Startowy baner losowy przy każdym renderze / odświeżeniu.
 */
export function buildHomeAdBannersHtml() {
    if (!shouldShowNativeAds()) return '';

    const startIndex = Math.floor(Math.random() * HOME_BANNERS.length);
    homeRotateIndex = startIndex;

    const slides = HOME_BANNERS.map((banner, index) => {
        const active = index === startIndex ? ' is-active' : '';
        const cta = banner.action === 'partner'
            ? `<a class="rg-ad-cta" href="${escapeHtml(partnerMailto())}">${escapeHtml(t(banner.ctaKey))}</a>`
            : `<button type="button" class="rg-ad-cta" data-ad-action="${escapeHtml(banner.action)}">${escapeHtml(t(banner.ctaKey))}</button>`;

        return `
            <article class="rg-ad-slide${active}" data-ad-slide="${index}" data-ad-id="${escapeHtml(banner.id)}"${index === startIndex ? '' : ' hidden'}>
                <span class="rg-ad-label">${escapeHtml(t('ads.label'))}</span>
                <div class="rg-ad-body">
                    <span class="rg-ad-icon" aria-hidden="true">${banner.icon}</span>
                    <div class="rg-ad-copy">
                        <strong class="rg-ad-title">${escapeHtml(t(banner.titleKey))}</strong>
                        <p class="rg-ad-text">${escapeHtml(t(banner.textKey))}</p>
                        ${cta}
                    </div>
                </div>
            </article>
        `;
    }).join('');

    return `
        <section class="rg-ad-home app-section" aria-label="${escapeHtml(t('ads.sectionLabel'))}" data-home-ad-panel>
            <div class="rg-ad-banner" data-home-ad-banner>
                ${slides}
            </div>
        </section>
    `;
}

/**
 * Uruchom spokojną rotację banerów (co ~7 s, bez migania).
 * @param {ParentNode} root
 */
export function startHomeAdRotation(root) {
    stopHomeAdRotation();
    if (!shouldShowNativeAds() || !root) return;

    const banner = root.querySelector('[data-home-ad-banner]');
    if (!banner) return;
    const slides = [...banner.querySelectorAll('[data-ad-slide]')];
    if (slides.length < 2) return;

    const activeEl = banner.querySelector('[data-ad-slide].is-active');
    const fromDom = activeEl ? Number(activeEl.dataset.adSlide) : 0;
    homeRotateIndex = Number.isFinite(fromDom) ? fromDom : 0;

    slides.forEach((slide, i) => {
        const on = i === homeRotateIndex;
        slide.classList.toggle('is-active', on);
        if (on) slide.removeAttribute('hidden');
        else slide.setAttribute('hidden', '');
    });

    homeRotateTimer = window.setInterval(() => {
        if (!banner.isConnected) {
            stopHomeAdRotation();
            return;
        }
        const prev = homeRotateIndex;
        homeRotateIndex = (homeRotateIndex + 1) % slides.length;
        slides[prev]?.classList.remove('is-active');
        slides[prev]?.setAttribute('hidden', '');
        slides[homeRotateIndex]?.classList.add('is-active');
        slides[homeRotateIndex]?.removeAttribute('hidden');
    }, ROTATE_MS);
}

/**
 * Karta „Promowane” – wygląda jak wynik, z oznaczeniem.
 * @param {object} producer
 * @param {(p: object) => string} buildVenueCardHtml
 */
export function buildSponsoredVenueCardHtml(producer, buildVenueCardHtml) {
    if (!producer || typeof buildVenueCardHtml !== 'function') return '';
    const card = buildVenueCardHtml(producer);
    if (!card) return '';
    return card.replace(
        'class="home-venue-card',
        `class="home-venue-card home-venue-card--sponsored`
    ).replace(
        '<div class="home-venue-body">',
        `<div class="home-venue-body"><span class="rg-ad-promoted">${escapeHtml(t('ads.promoted'))}</span>`
    );
}

/**
 * Wstaw 1 wynik sponsorowany na początek listy (jeśli jest kandydat).
 * @param {object[]} producers
 * @param {(p: object) => string} buildVenueCardHtml
 */
export function buildVenueCardsWithSponsoredHtml(producers, buildVenueCardHtml) {
    const list = Array.isArray(producers) ? producers : [];
    if (!list.length) {
        return typeof buildVenueCardHtml === 'function'
            ? ''
            : '';
    }

    if (!shouldShowNativeAds()) {
        return list.map((p) => buildVenueCardHtml(p)).join('');
    }

    const sponsored = pickSponsoredProducer(list);
    const rest = sponsored
        ? list.filter((p) => String(p.id) !== String(sponsored.id))
        : list;

    const parts = [];
    if (sponsored) {
        parts.push(buildSponsoredVenueCardHtml(sponsored, buildVenueCardHtml));
    }
    parts.push(...rest.map((p) => buildVenueCardHtml(p)));
    return parts.join('');
}

function pickSponsoredProducer(list) {
    const withPromo = list.find((p) => String(p?.promo || '').trim());
    if (withPromo) return withPromo;
    const premium = list.find((p) => p?.premium || p?.sponsored || p?.verified);
    if (premium) return premium;
    return list[0] || null;
}

/**
 * Mały pasek na dole popupu markera.
 */
export function buildPopupAdHtml(producerId = '') {
    if (!shouldShowNativeAds()) return '';
    const tip = POPUP_TIPS[Math.abs(hashId(producerId)) % POPUP_TIPS.length];
    const cta = tip.action === 'partner'
        ? `<a class="rg-ad-popup-link" href="${escapeHtml(partnerMailto())}">${escapeHtml(t(tip.textKey))}</a>`
        : `<button type="button" class="rg-ad-popup-link" data-ad-action="${escapeHtml(tip.action)}">${escapeHtml(t(tip.textKey))}</button>`;

    return `
        <div class="rg-ad-popup" data-popup-ad>
            <span class="rg-ad-label rg-ad-label--inline">${escapeHtml(t('ads.label'))}</span>
            ${cta}
        </div>
    `;
}

function hashId(id) {
    const s = String(id || 'x');
    let h = 0;
    for (let i = 0; i < s.length; i += 1) h = ((h << 5) - h) + s.charCodeAt(i);
    return h | 0;
}

/**
 * Obsługa kliknięć CTA reklam (delegacja).
 * @param {Event} event
 * @param {{ navigateTo?: Function, navigateToCategory?: Function }} nav
 */
export function handleNativeAdClick(event, nav = {}) {
    const target = event.target instanceof Element
        ? event.target
        : event.target?.parentElement;
    const btn = target?.closest?.('[data-ad-action]');
    if (!btn) return false;

    event.preventDefault();
    event.stopPropagation();
    const action = String(btn.getAttribute('data-ad-action') || '');

    if (action === 'premium') {
        nav.navigateTo?.('premium');
        return true;
    }
    if (action === 'map') {
        nav.navigateTo?.('map');
        return true;
    }
    if (action === 'bakeries') {
        nav.navigateToCategory?.('bakeries');
        return true;
    }
    if (action === 'partner') {
        window.location.href = partnerMailto();
        return true;
    }
    return false;
}

export default {
    shouldShowNativeAds,
    buildHomeAdBannersHtml,
    startHomeAdRotation,
    stopHomeAdRotation,
    buildVenueCardsWithSponsoredHtml,
    buildPopupAdHtml,
    handleNativeAdClick
};
