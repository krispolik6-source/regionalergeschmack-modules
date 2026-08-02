// Wspólna prezentacja producentów / sklepów (popup, modal, wyszukiwarka)

import { t, tProducerDescription, tProductField } from '../core/i18n.js';
import { translateSoft } from '../i18n/aiTranslationEngine.js';
import { getProducerTypeKey } from './categoryIcons.js';
import {
    getProducerDisplayName,
    buildProducerLogoHtml
} from './chainBrands.js';
import { getOpeningHoursDisplay } from '../data/openingHours.js';
import { getProducerStory } from '../data/producerStories.js';
import { getPlaceHistoryFact } from '../data/placeHistory.js';
import { buildTrustBadgeHtml, buildProducerPhotoHtml } from './producerTrust.js';
import { formatDistanceLabel, formatEtaLabels } from './geoFormat.js';
import { getDistanceKm } from '../data/producerHelpers.js';
import { getLastPosition } from '../core/userLocation.js';
import { buildCompactAvailabilityHtml } from './productAvailability.js';
import { isProducerPromoted } from '../core/premiumService.js';

function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatRatingStars(rating) {
    const value = Number(rating);
    if (!Number.isFinite(value) || value <= 0) return '';
    const full = Math.min(5, Math.round(value));
    return `${'★'.repeat(full)}${'☆'.repeat(5 - full)}`;
}

/**
 * Status otwarte/zamknięte na podstawie OSM opening_hours
 * @param {object} producer
 */
export function buildOpenStatusHtml(producer) {
    const status = getOpeningHoursDisplay(producer);
    if (!status.known) {
        return `
            <p class="home-card-status producer-open-status producer-open-status--unknown">
                <span class="producer-open-status-main">${escapeHtml(t('msg.noCurrentData'))}</span>
            </p>
        `;
    }

    if (status.isOpen) {
        const detail = status.closesAt
            ? t('home.closesAt').replace('{time}', status.closesAt)
            : '';
        return `
            <p class="home-card-status producer-open-status is-open">
                <span class="producer-open-status-main">🟢 ${escapeHtml(t('home.statusOpen'))}</span>
                ${detail ? `<span class="producer-open-status-detail">${escapeHtml(detail)}</span>` : ''}
            </p>
        `;
    }

    let detail = '';
    if (status.opensAt && status.opensTomorrow) {
        detail = t('home.opensTomorrow').replace('{time}', status.opensAt);
    } else if (status.opensAt) {
        detail = t('home.opensAt').replace('{time}', status.opensAt);
    }

    return `
        <p class="home-card-status producer-open-status is-closed">
            <span class="producer-open-status-main">🔴 ${escapeHtml(t('home.statusClosed'))}</span>
            ${detail ? `<span class="producer-open-status-detail">${escapeHtml(detail)}</span>` : ''}
        </p>
    `;
}

/**
 * Profesjonalny nagłówek panelu / popupu
 * @param {object} producer
 * @param {{ compact?: boolean }} [options]
 */
export function buildProducerHeaderHtml(producer, options = {}) {
    const displayName = getProducerDisplayName(producer);
    const logo = buildProducerLogoHtml(producer, {
        size: options.compact ? 36 : 44,
        className: 'chain-logo producer-header-logo'
    });

    const typeKey = getProducerTypeKey(producer.category);
    const typeLabel = t(`producer.types.${typeKey}`);
    const stars = formatRatingStars(producer.rating);
    const ratingNum = Number(producer.rating);
    const ratingHtml = stars && Number.isFinite(ratingNum)
        ? `<div class="producer-header-rating"><span class="producer-stars" aria-hidden="true">${stars}</span><span class="producer-rating-value">${escapeHtml(String(ratingNum))}</span></div>`
        : `<div class="producer-header-rating producer-header-rating--missing"><span class="producer-rating-new">${escapeHtml(t('msg.noCurrentData'))}</span></div>`;

    const statusHtml = buildOpenStatusHtml(producer);
    const trustHtml = buildTrustBadgeHtml(producer);
    const promotedHtml = isProducerPromoted(producer)
        ? `<span class="rg-promoted-badge">${escapeHtml(t('ads.promoted'))}</span>`
        : '';

    const distanceHtml = (() => {
        const user = getLastPosition();
        let km = Number(producer.distanceKm);
        if (!Number.isFinite(km) && user && Number.isFinite(Number(producer.lat)) && Number.isFinite(Number(producer.lng))) {
            km = getDistanceKm(user.lat, user.lng, Number(producer.lat), Number(producer.lng));
        }
        if (!Number.isFinite(km) && producer.distance) {
            return `<p class="producer-header-distance" data-distance-line>${escapeHtml(String(producer.distance))}</p>`;
        }
        if (!Number.isFinite(km)) return '';
        const dist = formatDistanceLabel(km);
        const eta = formatEtaLabels(km);
        return `
            <p class="producer-header-distance" data-distance-line data-distance-km="${km.toFixed(4)}">
                <span data-distance-label>${escapeHtml(dist)}</span>
                <span class="producer-eta" aria-label="${escapeHtml(t('a11y.eta'))}">🚶 ${escapeHtml(eta.walk)} · 🚲 ${escapeHtml(eta.bike)} · 🚗 ${escapeHtml(eta.car)}</span>
            </p>
        `;
    })();

    const promoHtml = producer.promo && !options.compact
        ? `<p class="producer-modal-promo">${escapeHtml(producer.promo)}</p>`
        : '';

    return `
        <div class="producer-header-card">
            <div class="producer-header-top">
                ${logo.html}
                <div class="producer-header-titles">
                    <h2 class="producer-header-name" id="producerModalTitle">${escapeHtml(displayName)}</h2>
                    ${promotedHtml}
                    ${ratingHtml}
                    ${trustHtml}
                </div>
            </div>
            <div class="producer-header-details">
                ${statusHtml}
                <p class="producer-header-type">${escapeHtml(typeLabel)}</p>
                ${distanceHtml}
                ${producer.address ? `<p class="producer-header-address">${escapeHtml(producer.address)}</p>` : ''}
            </div>
            ${promoHtml}
        </div>
    `;
}

/**
 * @param {object} producer
 * @returns {object[]}
 */
export function getProducerPromotionsList(producer) {
    if (!Array.isArray(producer?.promotions)) return [];
    return producer.promotions.filter((promo) => promo?.title?.trim());
}

function formatFlyerPrice(promo) {
    if (promo?.priceLabel) return String(promo.priceLabel);
    if (promo?.price == null || promo.price === '') return '';
    if (typeof promo.price === 'string' && /€/.test(promo.price)) return promo.price.trim();
    const value = Number(promo.price);
    if (!Number.isFinite(value)) return '';
    return `${value.toFixed(2)} €`;
}

/**
 * Rozwijana gazetka promocji (popup mapy + modal).
 * @param {object} producer
 * @param {{ compact?: boolean }} [options]
 */
export function buildPromotionsFlyerHtml(producer, options = {}) {
    const promotions = getProducerPromotionsList(producer);
    if (!promotions.length) return '';

    const safeId = escapeHtml(String(producer.id || 'producer').replace(/[^a-zA-Z0-9_-]/g, '_'));
    const listId = `promo-flyer-list-${safeId}${options.compact ? '-popup' : '-modal'}`;
    const showLabel = t('producer.showAllPromotions');
    const hideLabel = t('producer.hideAllPromotions');

    const items = promotions.map((promo) => {
        const icon = escapeHtml(promo.icon || '🏷️');
        const price = formatFlyerPrice(promo);
        const discount = promo.discount
            ? `<span class="promo-flyer-discount">-${escapeHtml(String(promo.discount))}%</span>`
            : '';
        const priceHtml = price
            ? `<span class="promo-flyer-price">${escapeHtml(price)}</span>`
            : '';
        const desc = promo.description
            ? `<span class="promo-flyer-desc">${escapeHtml(promo.description)}</span>`
            : '';

        return `
            <li class="promo-flyer-item">
                <span class="promo-flyer-icon" aria-hidden="true">${icon}</span>
                <span class="promo-flyer-body">
                    <span class="promo-flyer-title">${escapeHtml(promo.title)} ${discount}</span>
                    ${desc}
                </span>
                ${priceHtml}
            </li>
        `;
    }).join('');

    return `
        <div class="promo-flyer${options.compact ? ' promo-flyer--compact' : ''}" data-promo-flyer>
            <button
                type="button"
                class="promo-flyer-toggle"
                data-promo-toggle
                aria-expanded="false"
                aria-controls="${listId}"
                data-label-show="${escapeHtml(showLabel)}"
                data-label-hide="${escapeHtml(hideLabel)}"
            >
                📰 ${escapeHtml(showLabel)}
            </button>
            <ul id="${listId}" class="promo-flyer-list" hidden>
                ${items}
            </ul>
        </div>
    `;
}

/**
 * Toggle gazetki – zwraca true, jeśli obsłużono kliknięcie.
 * @param {Element} target
 * @returns {boolean}
 */
export function handlePromoFlyerToggle(target) {
    const btn = target?.closest?.('[data-promo-toggle]');
    if (!btn) return false;

    const flyer = btn.closest('[data-promo-flyer]');
    const list = flyer?.querySelector('.promo-flyer-list');
    if (!list) return false;

    const expanded = btn.getAttribute('aria-expanded') === 'true';
    const next = !expanded;
    btn.setAttribute('aria-expanded', String(next));
    list.hidden = !next;

    const showLabel = btn.dataset.labelShow || t('producer.showAllPromotions');
    const hideLabel = btn.dataset.labelHide || t('producer.hideAllPromotions');
    btn.textContent = next ? `📰 ${hideLabel}` : `📰 ${showLabel}`;
    return true;
}

function buildMapPopupMissingHtml(extraClass = '') {
    const cls = ['map-popup-missing', extraClass].filter(Boolean).join(' ');
    return `<p class="${cls}">${escapeHtml(t('msg.noCurrentData'))}</p>`;
}

/**
 * @param {object} producer
 */
function buildMapPopupDistanceEtaHtml(producer) {
    const user = getLastPosition();
    let km = Number(producer.distanceKm);
    if (!Number.isFinite(km) && user && Number.isFinite(Number(producer.lat)) && Number.isFinite(Number(producer.lng))) {
        km = getDistanceKm(user.lat, user.lng, Number(producer.lat), Number(producer.lng));
    }

    if (!Number.isFinite(km) && producer.distance) {
        return {
            distance: `<p class="map-popup-distance">${escapeHtml(String(producer.distance))}</p>`,
            eta: ''
        };
    }
    if (!Number.isFinite(km)) {
        return { distance: '', eta: '' };
    }

    const dist = formatDistanceLabel(km);
    const eta = formatEtaLabels(km);
    return {
        distance: `<p class="map-popup-distance" data-distance-line data-distance-km="${km.toFixed(4)}"><span data-distance-label>${escapeHtml(dist)}</span></p>`,
        eta: `<p class="map-popup-eta" aria-label="${escapeHtml(t('a11y.eta'))}"><span>🚶 ${escapeHtml(eta.walk)}</span><span>🚲 ${escapeHtml(eta.bike)}</span><span>🚗 ${escapeHtml(eta.car)}</span></p>`
    };
}

function buildMapPopupRatingHtml(producer) {
    const stars = formatRatingStars(producer.rating);
    const ratingNum = Number(producer.rating);
    if (!stars || !Number.isFinite(ratingNum)) return '';
    return `<div class="map-popup-rating"><span class="producer-stars" aria-hidden="true">${stars}</span><span class="producer-rating-value">${escapeHtml(String(ratingNum))}</span></div>`;
}

/**
 * @param {object} producer
 * @param {{ favoriteLabel: string }} ctx
 */
export function buildMapPopupHtml(producer, ctx) {
    const displayName = getProducerDisplayName(producer);
    const description = tProducerDescription(
        producer.id,
        producer.description,
        undefined,
        [producer.name, producer.address].filter(Boolean)
    );
    const storyRaw = getProducerStory(producer);
    const story = storyRaw
        ? translateSoft(storyRaw, { from: 'de', protect: [producer.name, producer.address].filter(Boolean) })
        : '';
    const photoHtml = buildProducerPhotoHtml(producer, { className: 'map-popup-photo' });
    const statusHtml = buildOpenStatusHtml(producer);
    const { distance: distanceHtml, eta: etaHtml } = buildMapPopupDistanceEtaHtml(producer);
    const ratingHtml = buildMapPopupRatingHtml(producer);
    const trustHtml = buildTrustBadgeHtml(producer);
    const promotedHtml = isProducerPromoted(producer)
        ? `<span class="rg-promoted-badge map-popup-promoted">${escapeHtml(t('ads.promoted'))}</span>`
        : '';
    const flyerHtml = buildPromotionsFlyerHtml(producer, { compact: true });

    const mediaHtml = photoHtml
        ? `<div class="map-popup-media">${photoHtml}</div>`
        : `<div class="map-popup-media map-popup-media--empty">${buildMapPopupMissingHtml('map-popup-missing--photo')}</div>`;

    const nameText = String(displayName || producer.name || '').trim() || t('msg.noCurrentData');
    const titleMetaHtml = (promotedHtml || trustHtml || ratingHtml)
        ? `<div class="map-popup-title-meta">${promotedHtml}${trustHtml}${ratingHtml}</div>`
        : '';

    const distanceSection = distanceHtml || buildMapPopupMissingHtml();
    const etaSection = etaHtml || buildMapPopupMissingHtml();

    const addressSection = producer.address
        ? `<p class="map-popup-address">${escapeHtml(producer.address)}</p>`
        : buildMapPopupMissingHtml();

    const descParts = [];
    if (description) {
        descParts.push(`<p class="map-popup-desc">${escapeHtml(description)}</p>`);
    }
    if (story) {
        descParts.push(`<p class="map-popup-story">${escapeHtml(story)}</p>`);
    }
    const descSection = descParts.length
        ? descParts.join('')
        : buildMapPopupMissingHtml();

    const statusChips = (producer.products || [])
        .slice(0, 3)
        .map((p, index) => {
            const chip = buildCompactAvailabilityHtml(p, t);
            if (!chip) return '';
            const pname = tProductField(producer.id, index, 'name', p.name || '');
            return `<li class="map-popup-product-status"><span class="map-popup-product-name">${escapeHtml(pname)}</span>${chip}</li>`;
        })
        .filter(Boolean)
        .join('');

    const productsSection = statusChips
        ? `<ul class="map-popup-product-statuses">${statusChips}</ul>`
        : buildMapPopupMissingHtml();

    const promoSection = flyerHtml || buildMapPopupMissingHtml();
    const promoSectionClass = flyerHtml ? 'map-popup-section map-popup-section--promo map-popup-promo-card' : 'map-popup-section map-popup-section--promo';

    const adHtml = typeof ctx.buildAdHtml === 'function'
        ? ctx.buildAdHtml(producer.id)
        : '';

    return `
        <div class="map-popup"
            data-producer-id="${escapeHtml(producer.id)}"
            data-producer-name="${escapeHtml(displayName || producer.name || t('map.unknownProducer') || '')}"
            data-producer-lat="${Number.isFinite(Number(producer.lat)) ? Number(producer.lat) : ''}"
            data-producer-lng="${Number.isFinite(Number(producer.lng)) ? Number(producer.lng) : ''}"
            data-producer-category="${escapeHtml(producer.category || '')}"
            data-producer-address="${escapeHtml(producer.address || '')}"
        >
            ${mediaHtml}
            <div class="map-popup-stack">
                <section class="map-popup-section map-popup-section--title producer-header-top">
                    <h2 class="map-popup-name producer-header-name">${escapeHtml(nameText)}</h2>
                    ${titleMetaHtml}
                </section>
                <section class="map-popup-section map-popup-section--status">${statusHtml}</section>
                <section class="map-popup-section map-popup-section--distance">${distanceSection}</section>
                <section class="map-popup-section map-popup-section--eta">${etaSection}</section>
                <section class="map-popup-section map-popup-section--address">${addressSection}</section>
                <section class="map-popup-section map-popup-section--desc" aria-label="${escapeHtml(t('btn.details'))}">${descSection}</section>
                <section class="map-popup-section map-popup-section--products" aria-label="${escapeHtml(t('nav.search'))}">${productsSection}</section>
                <section class="${promoSectionClass}">${promoSection}</section>
                <section class="map-popup-section map-popup-section--actions">
                    <div class="map-popup-actions">
                        <button type="button" class="map-popup-btn" data-details-id="${escapeHtml(producer.id)}">${t('btn.details')}</button>
                        <button type="button" class="map-popup-btn" data-favorite-id="${escapeHtml(producer.id)}">${ctx.favoriteLabel}</button>
                        <a class="map-popup-btn map-popup-btn--link" href="${escapeHtml(ctx.navUrl)}" target="_blank" rel="noopener noreferrer">${t('btn.navigate')}</a>
                    </div>
                </section>
                ${adHtml}
            </div>
        </div>
    `;
}

/**
 * Sekcja historii producenta (modal / szczegóły)
 * @param {object} producer
 */
export function buildProducerStoryHtml(producer) {
    const storyRaw = getProducerStory(producer);
    if (!storyRaw) return '';
    const story = translateSoft(storyRaw, {
        from: 'de',
        protect: [producer.name, producer.address].filter(Boolean)
    });

    return `
        <section class="producer-story" aria-label="${escapeHtml(t('producer.storyTitle'))}">
            <h3 class="producer-section-title">${escapeHtml(t('producer.storyTitle'))}</h3>
            <p class="producer-story-text">${escapeHtml(story)}</p>
        </section>
    `;
}

/** ETAP 15D – „Czy wiesz, że…” (krótka ciekawostka) */
export function buildPlaceHistoryHtml(producer) {
    const fact = getPlaceHistoryFact(producer);
    if (!fact?.id) return '';
    const text = t(`placeHistory.${fact.id}`);
    if (!text || text === `placeHistory.${fact.id}`) return '';

    return `
        <section class="place-history" aria-labelledby="placeHistoryHeading" data-place-history="${escapeHtml(fact.id)}">
            <p class="place-history-label" id="placeHistoryHeading">${escapeHtml(t('placeHistory.title'))}</p>
            <p class="place-history-text">${escapeHtml(text)}</p>
        </section>
    `;
}

export default {
    buildProducerHeaderHtml,
    buildMapPopupHtml,
    buildOpenStatusHtml,
    buildPromotionsFlyerHtml,
    handlePromoFlyerToggle,
    getProducerPromotionsList,
    buildProducerStoryHtml,
    buildPlaceHistoryHtml
};
