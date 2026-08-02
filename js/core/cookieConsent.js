// js/core/cookieConsent.js – zgoda na cookies (RODO / AdSense)

export const COOKIE_CONSENT_KEY = 'cookie_consent';
const BANNER_HIDE_MS = 280;

export const COOKIE_CONSENT = Object.freeze({
    ACCEPTED: 'accepted',
    REJECTED: 'rejected'
});

export function getCookieConsent() {
    try {
        const value = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (value === COOKIE_CONSENT.ACCEPTED || value === COOKIE_CONSENT.REJECTED) {
            return value;
        }
    } catch {
        /* ignore */
    }
    return null;
}

export function hasCookieConsentAccepted() {
    return getCookieConsent() === COOKIE_CONSENT.ACCEPTED;
}

export function setCookieConsent(value) {
    try {
        localStorage.setItem(COOKIE_CONSENT_KEY, value);
    } catch {
        /* ignore */
    }
}

function finalizeHiddenBanner(banner) {
    if (!banner) return;
    banner.style.display = 'none';
    banner.hidden = true;
    banner.setAttribute('aria-hidden', 'true');
    banner.classList.remove('is-hiding');
    banner.classList.add('is-hidden');
    delete banner.dataset.hiding;
}

export function hideCookieBanner(banner, onHidden) {
    if (!banner || banner.dataset.hiding === 'true') return;

    banner.dataset.hiding = 'true';
    document.body.classList.remove('cookie-consent-visible');
    banner.classList.add('is-hiding');

    let finished = false;
    const finish = () => {
        if (finished) return;
        finished = true;
        finalizeHiddenBanner(banner);
        if (typeof onHidden === 'function') onHidden();
    };

    const onTransitionEnd = (event) => {
        if (event.target !== banner || event.propertyName !== 'opacity') return;
        banner.removeEventListener('transitionend', onTransitionEnd);
        finish();
    };

    banner.addEventListener('transitionend', onTransitionEnd);
    window.setTimeout(finish, BANNER_HIDE_MS + 80);
}

export function showCookieBanner(banner) {
    if (!banner) return;
    banner.hidden = false;
    banner.style.display = 'flex';
    banner.removeAttribute('aria-hidden');
    banner.classList.remove('is-hidden', 'is-hiding');
    document.body.classList.add('cookie-consent-visible');
}

export function syncCookieBannerVisibility(banner = document.getElementById('cookieConsentBanner')) {
    if (!banner) return false;

    if (getCookieConsent()) {
        finalizeHiddenBanner(banner);
        document.body.classList.remove('cookie-consent-visible');
        return false;
    }

    showCookieBanner(banner);
    return true;
}

export default {
    COOKIE_CONSENT_KEY,
    COOKIE_CONSENT,
    getCookieConsent,
    hasCookieConsentAccepted,
    setCookieConsent,
    hideCookieBanner,
    showCookieBanner,
    syncCookieBannerVisibility
};
