// Wspólny komponent zdjęcia produktu – dopasowanie, badge przykładowe, a11y

import { getProductImageJpegUrl, resolveProductImage, isSampleProductImageUrl } from '../data/productImages.js';

function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * @param {string | null | undefined} imageUrl
 * @param {(key: string) => string} t
 * @param {{
 *   className?: string,
 *   alt?: string,
 *   isSample?: boolean,
 *   name?: string,
 *   imageSlug?: string,
 *   category?: string
 * }} [options]
 */
export function buildProductImageHtml(imageUrl, t, options = {}) {
    const extraClass = options.className ? ` ${options.className}` : '';
    const alt = escapeHtml(options.alt || options.name || t('product.placeholderImage'));

    const resolved = resolveProductImage({
        imageUrl: imageUrl || '',
        imageSlug: options.imageSlug,
        name: options.name || options.alt,
        category: options.category,
        isSampleImage: options.isSample
    });

    const finalUrl = resolved.imageUrl || imageUrl;
    const isSample = options.isSample === true
        || resolved.isSample
        || isSampleProductImageUrl(finalUrl);

    /** @type {'sample'|'producer'|'place'} */
    let source = isSample ? 'sample' : (options.imageSource || 'producer');
    if (!isSample && (options.fromOsm || String(finalUrl).includes('openstreetmap') || String(finalUrl).includes('wikimedia'))) {
        source = 'place';
    }

    if (!finalUrl) {
        // Ostateczny fallback – nadal zdjęcie przykładowe warzyw (nigdy emoji 📷)
        const emergency = resolveProductImage({ name: 'Gemüse', category: 'farmer' });
        return buildPictureHtml(emergency.imageUrl, emergency.jpegUrl, alt, extraClass, 'sample', t);
    }

    const jpegUrl = resolved.jpegUrl || getProductImageJpegUrl(finalUrl);
    return buildPictureHtml(finalUrl, jpegUrl, alt, extraClass, source, t);
}

/**
 * @param {string} imageUrl
 * @param {string | null} jpegUrl
 * @param {string} altEscaped
 * @param {string} extraClass
 * @param {'sample'|'producer'|'place'} source
 * @param {(key: string) => string} t
 */
function buildPictureHtml(imageUrl, jpegUrl, altEscaped, extraClass, source, t) {
    const badgeKey = source === 'sample'
        ? 'product.sampleBadge'
        : source === 'place'
            ? 'product.placeBadge'
            : 'product.producerBadge';
    const noteKey = source === 'sample'
        ? 'product.sampleNote'
        : source === 'place'
            ? 'product.placeNote'
            : 'product.producerNote';
    const badge = `<span class="product-image-sample-badge product-image-badge--${source}" title="${escapeHtml(t(noteKey))}">${escapeHtml(t(badgeKey))}</span>`;

    const webpUrl = imageUrl.endsWith('.webp') ? imageUrl : null;
    let imgInner;

    if (webpUrl && jpegUrl) {
        imgInner = `
            <picture>
                <source srcset="${escapeHtml(webpUrl)}" type="image/webp">
                <img src="${escapeHtml(jpegUrl)}" alt="${altEscaped}" class="product-image-photo${extraClass}" loading="lazy" decoding="async" />
            </picture>
        `;
    } else {
        imgInner = `<img src="${escapeHtml(imageUrl)}" alt="${altEscaped}" class="product-image-photo${extraClass}" loading="lazy" decoding="async" />`;
    }

    return `
        <div class="product-image-frame${source === 'sample' ? ' is-sample' : ''}">
            ${imgInner}
            ${badge}
        </div>
    `;
}

export default { buildProductImageHtml };
