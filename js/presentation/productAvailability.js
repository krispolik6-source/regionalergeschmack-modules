// js/presentation/productAvailability.js – statusy dostępności produktów (ETAP 8)

export const PRODUCT_AVAILABILITY = Object.freeze({
    available: 'available',
    low: 'low',
    soldout: 'soldout'
});

/**
 * @param {{ id?: string, name?: string, available?: string, hidden?: boolean }} product
 * @returns {'available'|'low'|'soldout'}
 */
export function getProductAvailability(product) {
    if (product?.hidden === true) return 'soldout';

    const forced = String(product?.available || '').toLowerCase();
    if (forced === 'available' || forced === 'low' || forced === 'soldout') return forced;

    // Brak jawnego statusu (OSM/demo) – deterministyczny fallback
    const key = String(product?.id || product?.name || 'x');
    let hash = 0;
    for (let i = 0; i < key.length; i += 1) hash = (hash + key.charCodeAt(i) * (i + 1)) % 97;
    if (hash % 11 === 0) return 'soldout';
    if (hash % 4 === 0) return 'low';
    return 'available';
}

export function isProductSeasonal(product) {
    return product?.seasonal === true || product?.seasonal === 'true' || product?.seasonal === 1;
}

export function isProductOnPromo(product) {
    if (product?.onPromo === true || product?.onPromo === 'true') return true;
    return Boolean(String(product?.promo || '').trim());
}

/**
 * @param {object} product
 * @param {(key: string) => string} t
 */
export function buildAvailabilityBadgeHtml(product, t) {
    if (product?.hidden === true) {
        return '';
    }

    const status = getProductAvailability(product);
    const map = {
        available: { icon: '✅', key: 'product.availabilityAvailable' },
        low: { icon: '⚠️', key: 'product.availabilityLow' },
        soldout: { icon: '❌', key: 'product.availabilitySoldout' }
    };
    const item = map[status];
    const label = t(item.key);
    const parts = [
        `<span class="product-availability-badge is-${status}" title="${label}">${item.icon} ${label}</span>`
    ];

    if (isProductSeasonal(product)) {
        const seasonalLabel = t('product.seasonalBadge');
        parts.push(
            `<span class="product-availability-badge is-seasonal" title="${seasonalLabel}">🌱 ${seasonalLabel}</span>`
        );
    }

    if (isProductOnPromo(product)) {
        const promoLabel = t('product.promoBadge');
        parts.push(
            `<span class="product-availability-badge is-promo" title="${promoLabel}">🔥 ${promoLabel}</span>`
        );
    }

    return `<span class="product-status-badges">${parts.join('')}</span>`;
}

/** Compact chip for map popup / home cards */
export function buildCompactAvailabilityHtml(product, t) {
    const status = getProductAvailability(product);
    if (status === 'available' && !isProductSeasonal(product) && !isProductOnPromo(product)) {
        return '';
    }
    return buildAvailabilityBadgeHtml(product, t);
}

export default {
    PRODUCT_AVAILABILITY,
    getProductAvailability,
    isProductSeasonal,
    isProductOnPromo,
    buildAvailabilityBadgeHtml,
    buildCompactAvailabilityHtml
};
