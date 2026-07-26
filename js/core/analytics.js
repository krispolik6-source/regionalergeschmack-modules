// js/core/analytics.js – śledzenie odsłon i kliknięć (Google Analytics 4)
import * as configModule from '../config.js';
import { eventBus } from './eventBus.js';
import { EVENTS } from './events.js';

/** Named export lub CONFIG – bez crasha gdy stary config.js bez eksportu. */
const GA_MEASUREMENT_ID = configModule.GA_MEASUREMENT_ID
    || configModule.CONFIG?.GA_MEASUREMENT_ID
    || '';

const PLACEHOLDER_ID = 'G-XXXXXXXXXX';

function isAnalyticsEnabled() {
    return Boolean(
        GA_MEASUREMENT_ID
        && GA_MEASUREMENT_ID !== PLACEHOLDER_ID
        && typeof window.gtag === 'function'
    );
}

export function trackPageView(pagePath, pageTitle) {
    if (!isAnalyticsEnabled()) return;
    window.gtag('event', 'page_view', {
        page_path: pagePath,
        page_title: pageTitle || document.title
    });
}

export function trackEvent(name, params = {}) {
    if (!isAnalyticsEnabled()) return;
    window.gtag('event', name, params);
}

function bindNavigationTracking() {
    eventBus.on(EVENTS.VIEW_CHANGED, ({ view }) => {
        if (!view) return;
        trackPageView(`/${view}`, document.title);
    });
}

function bindClickTracking() {
    document.addEventListener('click', (event) => {
        if (!isAnalyticsEnabled()) return;

        const target = event.target.closest(
            '[data-view], .nav-item, .btn-primary, .btn-secondary, [data-side-menu-action], [data-analytics-label]'
        );
        if (!target) return;

        const label = target.dataset.analyticsLabel
            || target.dataset.view
            || target.dataset.sideMenuAction
            || target.getAttribute('aria-label')
            || target.textContent?.trim().slice(0, 48)
            || 'unknown';

        trackEvent('click', {
            event_category: 'engagement',
            event_label: label,
            element: target.tagName.toLowerCase()
        });
    }, { capture: true, passive: true });
}

let analyticsInitialized = false;

export function initAnalytics() {
    if (analyticsInitialized) return;
    if (!isAnalyticsEnabled()) {
        console.info('[Analytics] Nieaktywne – ustaw GA_MEASUREMENT_ID w config.js i index.html');
        return;
    }
    analyticsInitialized = true;

    bindNavigationTracking();
    bindClickTracking();
    trackPageView(window.location.pathname + window.location.hash, document.title);
}
