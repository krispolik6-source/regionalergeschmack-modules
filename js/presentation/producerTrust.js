// js/presentation/producerTrust.js – badge wiarygodności, udogodnienia, zdjęcie producenta

import { t } from '../core/i18n.js';
import { getCategoryImage, getCategoryImageJpeg } from './categoryImages.js?v=8';
import { normalizeProducerCategory } from '../data/producerHelpers.js';
import { resolveProducerMood } from './producerMood.js';

function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function hasText(value) {
    return Boolean(String(value || '').trim());
}

function isPositiveTag(value) {
    const v = String(value || '').trim().toLowerCase();
    if (!v) return false;
    if (['no', 'none', 'false', '0', 'nein'].includes(v)) return false;
    return true;
}

function firstPhotoUrl(producer) {
    const photos = Array.isArray(producer?.photos) ? producer.photos : [];
    for (const item of photos) {
        const url = typeof item === 'string' ? item : item?.url;
        if (hasText(url)) return String(url).trim();
    }
    return '';
}

function isRealPhotoUrl(url) {
    const value = String(url || '').trim();
    if (!value) return false;
    // Tła kategorii / assety przykładowe ≠ zdjęcie obiektu
    if (value.includes('/assets/images/backgrounds/')
        || value.includes('/assets/images/categories/')
        || value.includes('/category_')) {
        return false;
    }
    if (/^https?:\/\//i.test(value)) return true;
    if (value.startsWith('/assets/')) return true;
    if (value.startsWith('data:image/')) return true;
    if (value.startsWith('blob:')) return true;
    return false;
}

/**
 * @param {object} producer
 * @returns {'verified'|'pending'|'community'|'confirmed'|'partial'|null}
 */
export function getProducerTrustLevel(producer) {
    if (!producer) return null;

    try {
        const raw = localStorage.getItem('rg_admin_trust_overrides_v1');
        const overrides = raw ? JSON.parse(raw) : {};
        const override = overrides?.[String(producer.id)]?.status;
        if (override === 'verified') return 'verified';
        if (override === 'rejected') return 'pending';
        if (override === 'community') return 'community';
        if (override === 'pending') return 'pending';
    } catch (_) {
        /* ignore */
    }

    const status = String(producer.trustStatus || '').toLowerCase();
    if (status === 'pending') return 'pending';
    if (status === 'community' || producer.communityEdited === true) return 'community';
    if (status === 'verified' || producer.verified === true) return 'verified';
    if (producer.source === 'content' && status !== 'pending' && status !== 'community') {
        return 'verified';
    }

    const score = [
        producer.phone,
        producer.email,
        producer.website,
        producer.openingHours || producer.hours,
        producer.address,
        producer.facebook,
        producer.instagram
    ].filter(hasText).length;

    if (score >= 3) return 'confirmed';
    if (score >= 1) return 'partial';
    return producer.source === 'osm' ? 'partial' : null;
}

/**
 * @param {object} producer
 */
export function buildTrustBadgeHtml(producer) {
    const level = getProducerTrustLevel(producer);
    if (!level) return '';

    const labels = {
        verified: t('producer.trustVerified'),
        pending: t('producer.trustPending'),
        community: t('producer.trustCommunity'),
        confirmed: t('producer.trustConfirmed'),
        partial: t('producer.trustPartial')
    };
    const dots = {
        verified: '✅',
        pending: '🟡',
        community: '🔵',
        confirmed: '🟢',
        partial: '🟡'
    };

    return `
        <span class="producer-trust-badge producer-trust-badge--${level}" role="status">
            <span aria-hidden="true">${dots[level] || '🟢'}</span>
            <span>${escapeHtml(labels[level] || level)}</span>
        </span>
    `;
}

/**
 * Lista udogodnień / social – tylko obecne wartości.
 * @param {object} producer
 */
export function collectProducerAmenities(producer) {
    if (!producer) return [];
    const items = [];

    const push = (key, value, icon) => {
        if (!isPositiveTag(value)) return;
        const label = t(`producer.amenity.${key}`);
        items.push({
            key,
            icon,
            label: label.startsWith('producer.') ? key : label,
            raw: String(value).trim()
        });
    };

    push('wheelchair', producer.wheelchair, '♿');
    push('parking', producer.parking, '🅿️');
    push('delivery', producer.delivery, '🚚');
    push('outdoorSeating', producer.outdoorSeating, '🌿');
    push('wifi', producer.wifi, '📶');
    push('paymentCards', producer.paymentCards, '💳');

    return items;
}

/**
 * @param {object} producer
 */
export function buildAmenitiesHtml(producer) {
    const items = collectProducerAmenities(producer);
    if (!items.length) return '';

    return `
        <section class="producer-amenities-section" aria-label="${escapeHtml(t('producer.amenitiesTitle'))}">
            <h3 class="producer-section-title">${escapeHtml(t('producer.amenitiesTitle'))}</h3>
            <ul class="producer-amenities-list">
                ${items.map((item) => `
                    <li class="producer-amenity-chip">
                        <span aria-hidden="true">${item.icon}</span>
                        <span>${escapeHtml(item.label)}</span>
                    </li>
                `).join('')}
            </ul>
        </section>
    `;
}

/**
 * @returns {'sample'|'producer'|'place'}
 */
export function resolveProducerPhotoSource(producer, realUrl) {
    const forced = String(producer?.imageSource || '').toLowerCase();
    if (forced === 'sample' || forced === 'producer' || forced === 'place') return forced;
    if (!isRealPhotoUrl(realUrl)) return 'sample';
    if (producer?.source === 'osm' || producer?.source === 'govdata') return 'place';
    if (producer?.source === 'user' || producer?.source === 'content') return 'producer';
    return 'producer';
}

/**
 * Zdjęcie producenta lub przykładowe według kategorii + badge.
 * @param {object} producer
 * @param {{ className?: string }} [opts]
 */
export function buildProducerPhotoHtml(producer, opts = {}) {
    const className = opts.className || 'producer-photo';
    const category = normalizeProducerCategory(producer?.category) || producer?.category || 'farmers';
    const mood = resolveProducerMood(producer);
    const catKey = String(category).toLowerCase();
    const isShopLike = catKey === 'shop' || catKey === 'shops' || catKey === 'vending';
    // Pasieka → honey tylko poza sklepami (sklep z miodem ≠ zdjęcie uli)
    const sampleKey = mood === 'honey' && !isShopLike ? 'honey' : category;
    const realUrl = String(producer?.image || producer?.logo || firstPhotoUrl(producer) || '').trim();
    const source = resolveProducerPhotoSource(producer, realUrl);
    const isSample = source === 'sample' || !isRealPhotoUrl(realUrl);

    const webp = isSample ? getCategoryImage(sampleKey) || getCategoryImage(category) || getCategoryImage('farmers') : realUrl;
    const jpeg = isSample
        ? getCategoryImageJpeg(sampleKey) || getCategoryImageJpeg(category) || getCategoryImageJpeg('farmers')
        : (realUrl.endsWith('.webp') ? realUrl.replace(/\.webp$/i, '.jpg') : realUrl);

    if (!webp) return '';

    const alt = escapeHtml(producer?.name || t('producer.photoAlt'));
    const badgeSource = isSample ? 'sample' : source;
    const badgeKey = badgeSource === 'place'
        ? 'product.placeBadge'
        : badgeSource === 'producer'
            ? 'product.producerBadge'
            : 'product.sampleBadge';
    const badge = `<span class="producer-photo-sample-badge product-image-badge--${badgeSource}">${escapeHtml(t(badgeKey))}</span>`;

    const picture = jpeg && String(webp).endsWith('.webp')
        ? `<picture>
                <source srcset="${escapeHtml(webp)}" type="image/webp">
                <img src="${escapeHtml(jpeg)}" alt="${alt}" class="${className}-img" loading="lazy" decoding="async" width="640" height="360">
           </picture>`
        : `<img src="${escapeHtml(webp)}" alt="${alt}" class="${className}-img" loading="lazy" decoding="async" width="640" height="360">`;

    return `
        <div class="${className}-frame${isSample ? ' is-sample' : ''}">
            ${picture}
            ${badge}
        </div>
    `;
}

export default {
    getProducerTrustLevel,
    buildTrustBadgeHtml,
    collectProducerAmenities,
    buildAmenitiesHtml,
    buildProducerPhotoHtml,
    resolveProducerPhotoSource
};
