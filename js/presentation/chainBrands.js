// Wykrywanie sieci + logo producentów (karty, popup, modal)

import { getCategoryIcon } from './categoryIcons.js';

function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** Odrzuć URL mogący złamać atrybut src */
function sanitizeImageUrl(url) {
    const value = String(url || '').trim();
    if (!value) return '';
    if (/[\s"'`<>]/.test(value)) return '';
    if (/^(https?:\/\/|\/)/i.test(value)) return value;
    return '';
}

/** @typedef {{ id: string, label: string, logo: string | null }} ChainBrand */

/** Zdjęcia potraw sieci fast food (nie oficjalne logotypy). */
export const FAST_FOOD_IMAGES = Object.freeze({
    mcdonalds: '/assets/images/fastfood/mcdonalds.webp',
    kfc: '/assets/images/fastfood/kfc.webp',
    burgerking: '/assets/images/fastfood/burgerking.webp',
    subway: '/assets/images/fastfood/subway.webp',
    pizzahut: '/assets/images/fastfood/pizzahut.webp',
    dominos: '/assets/images/fastfood/dominos.webp'
});

const FAST_FOOD_FALLBACK = '/assets/images/products/burger.webp';

/** Domyślne logo kategorii (gdy brak własnego / sieci). */
export const CATEGORY_DEFAULT_LOGOS = Object.freeze({
    farmer: '/assets/images/categories/farmer.svg',
    bakery: '/assets/images/categories/bakery.svg',
    meat: '/assets/images/categories/meat.svg',
    shop: '/assets/images/categories/shop.svg',
    restaurant: '/assets/images/categories/restaurant.svg',
    fast_food: '/assets/images/categories/fast_food.svg',
    fastfood: '/assets/images/categories/fast_food.svg',
    vending: '/assets/images/categories/vending.svg',
    other: '/assets/images/categories/other.svg'
});

/** @type {readonly ChainBrand[]} */
const CHAIN_BRANDS = Object.freeze([
    { id: 'aldi', label: 'ALDI', logo: '/assets/images/chains/aldi.svg' },
    { id: 'lidl', label: 'Lidl', logo: '/assets/images/chains/lidl.svg' },
    { id: 'edeka', label: 'EDEKA', logo: '/assets/images/chains/edeka.svg' },
    { id: 'rewe', label: 'REWE', logo: '/assets/images/chains/rewe.svg' },
    { id: 'kaufland', label: 'Kaufland', logo: '/assets/images/chains/kaufland.svg' },
    { id: 'netto', label: 'Netto', logo: '/assets/images/chains/netto.svg' },
    { id: 'penny', label: 'Penny', logo: '/assets/images/chains/penny.svg' },
    { id: 'globus', label: 'Globus', logo: '/assets/images/chains/globus.svg' },
    { id: 'denns', label: "Denn's", logo: '/assets/images/chains/denns.svg' },
    { id: 'alnatura', label: 'Alnatura', logo: '/assets/images/chains/alnatura.svg' },
    { id: 'norma', label: 'Norma', logo: null },
    { id: 'tegut', label: 'tegut', logo: null },
    { id: 'carrefour', label: 'Carrefour', logo: null },
    { id: 'auchan', label: 'Auchan', logo: null },
    { id: 'tesco', label: 'Tesco', logo: null },
    { id: 'walmart', label: 'Walmart', logo: null },
    { id: 'costco', label: 'Costco', logo: null },
    { id: 'biedronka', label: 'Biedronka', logo: '/assets/images/chains/biedronka.svg' },
    { id: 'coop', label: 'Coop', logo: null },
    { id: 'migros', label: 'Migros', logo: null },
    { id: 'mcdonalds', label: "McDonald's", logo: FAST_FOOD_IMAGES.mcdonalds },
    { id: 'kfc', label: 'KFC', logo: FAST_FOOD_IMAGES.kfc },
    { id: 'burgerking', label: 'Burger King', logo: FAST_FOOD_IMAGES.burgerking },
    { id: 'subway', label: 'Subway', logo: FAST_FOOD_IMAGES.subway },
    { id: 'pizzahut', label: 'Pizza Hut', logo: FAST_FOOD_IMAGES.pizzahut },
    { id: 'dominos', label: "Domino's", logo: FAST_FOOD_IMAGES.dominos }
]);

/**
 * @param {string} chainId
 * @returns {ChainBrand | null}
 */
export function getChainById(chainId) {
    if (!chainId || typeof chainId !== 'string') return null;
    return CHAIN_BRANDS.find((brand) => brand.id === chainId) || null;
}

/**
 * @param {{ name?: string, chain?: string }} producer
 * @returns {ChainBrand | null}
 */
export function resolveProducerChain(producer) {
    const byId = getChainById(producer?.chain);
    if (byId) return byId;
    return detectChainBrand(producer?.name);
}

/**
 * @param {string | undefined | null} name
 * @returns {ChainBrand | null}
 */
export function detectChainBrand(name) {
    if (!name || typeof name !== 'string') return null;
    const lower = name.toLowerCase();
    for (const brand of CHAIN_BRANDS) {
        const label = brand.label.toLowerCase();
        if (lower.includes(label)) return brand;
        if (brand.id === 'denns' && (lower.includes("denn's") || lower.includes('denns'))) return brand;
        if (brand.id === 'alnatura' && lower.includes('alnatura')) return brand;
        if (brand.id === 'mcdonalds' && (lower.includes('mcdonald') || lower.includes('mc donald'))) return brand;
        if (brand.id === 'burgerking' && (lower.includes('burger king') || lower.includes('burgerking'))) return brand;
        if (brand.id === 'pizzahut' && (lower.includes('pizza hut') || lower.includes('pizzahut'))) return brand;
        if (brand.id === 'dominos' && (lower.includes("domino's") || lower.includes('dominos'))) return brand;
    }
    return null;
}

/**
 * @param {string | undefined | null} category
 * @returns {string | null}
 */
export function getCategoryDefaultLogo(category) {
    const key = String(category || 'other').trim();
    return CATEGORY_DEFAULT_LOGOS[key] || CATEGORY_DEFAULT_LOGOS.other;
}

function isAbstractCategoryAsset(url) {
    const value = String(url || '');
    return value.includes('/assets/images/categories/')
        || value.includes('/assets/images/backgrounds/');
}

/**
 * Logo sieci handlowej (Lidl, Aldi, …) – do markera / popup / kart.
 * @param {{ name?: string, chain?: string } | null | undefined} producer
 * @returns {string | null}
 */
export function resolveChainLogoUrl(producer) {
    const chain = resolveProducerChain(producer);
    if (chain?.logo && !isAbstractCategoryAsset(chain.logo)) return chain.logo;
    return null;
}

/**
 * Rozwiązuje URL logo producenta.
 * Kolejność: logo sieci → własne logo (nie SVG kategorii) → foto sieci FF (karty).
 * Brak URL → UI pokazuje kanoniczne emoji kategorii.
 * @param {{ name?: string, chain?: string, category?: string, logo?: string } | null | undefined} producer
 * @param {{ allowFastFoodPhoto?: boolean }} [options]
 * @returns {string | null}
 */
export function resolveProducerLogo(producer, options = {}) {
    if (!producer || typeof producer !== 'object') return null;

    const chainLogo = resolveChainLogoUrl(producer);
    if (chainLogo) return chainLogo;

    const own = String(producer.logo || '').trim();
    if (own && (/^https?:\/\//i.test(own) || own.startsWith('/')) && !isAbstractCategoryAsset(own)) {
        return own;
    }

    if (options.allowFastFoodPhoto !== false) {
        const chain = resolveProducerChain(producer);
        if (chain && FAST_FOOD_IMAGES[chain.id]) {
            return FAST_FOOD_IMAGES[chain.id];
        }
    }

    return null;
}

/**
 * Zwraca URL zdjęcia potrawy dla sieci fast food (nazwa lub id).
 * @param {string | { name?: string, chain?: string, category?: string } | null | undefined} nameOrProducer
 * @returns {string | null}
 */
export function getFastFoodImage(nameOrProducer) {
    if (nameOrProducer == null) return null;

    if (typeof nameOrProducer === 'object') {
        const byChainField = getChainById(nameOrProducer.chain);
        if (byChainField && FAST_FOOD_IMAGES[byChainField.id]) {
            return FAST_FOOD_IMAGES[byChainField.id];
        }
        const byName = detectChainBrand(nameOrProducer.name);
        if (byName && FAST_FOOD_IMAGES[byName.id]) {
            return FAST_FOOD_IMAGES[byName.id];
        }
        if (nameOrProducer.category === 'fast_food' || nameOrProducer.category === 'fastfood') {
            return FAST_FOOD_FALLBACK;
        }
        return null;
    }

    const raw = String(nameOrProducer).trim();
    if (!raw) return null;
    if (FAST_FOOD_IMAGES[raw]) return FAST_FOOD_IMAGES[raw];

    const byId = getChainById(raw.toLowerCase());
    if (byId && FAST_FOOD_IMAGES[byId.id]) return FAST_FOOD_IMAGES[byId.id];

    const byName = detectChainBrand(raw);
    if (byName && FAST_FOOD_IMAGES[byName.id]) return FAST_FOOD_IMAGES[byName.id];

    return null;
}

/**
 * @param {{ name?: string }} producer
 * @returns {string}
 */
export function getProducerDisplayName(producer) {
    const chain = resolveProducerChain(producer);
    if (chain) return chain.label;
    const name = String(producer?.name || '').trim();
    return name || 'Nieznany producent';
}

/**
 * @param {ChainBrand | null} chain
 * @param {string} fallbackIcon
 * @returns {string} HTML
 */
export function buildChainLogoHtml(chain, fallbackIcon = '🛒') {
    const safeLogo = sanitizeImageUrl(chain?.logo);
    if (safeLogo && !isAbstractCategoryAsset(safeLogo)) {
        return `<img src="${escapeHtml(safeLogo)}" alt="" class="chain-logo" width="28" height="28" loading="lazy" decoding="async" />`;
    }
    return `<span class="chain-logo-fallback" aria-hidden="true">${fallbackIcon}</span>`;
}

/**
 * Logo sieci lub kanoniczna ikona kategorii – wspólne dla kart / popup / modal.
 * @param {object} producer
 * @param {{ size?: number, className?: string, preferChainOnly?: boolean }} [options]
 * @returns {{ html: string, url: string | null, isPhoto: boolean, icon: string, isChain: boolean }}
 */
export function buildProducerLogoHtml(producer, options = {}) {
    const size = Number(options.size) || 28;
    const className = options.className || 'chain-logo';
    const icon = getCategoryIcon(producer?.category) || '📍';
    const chainUrl = resolveChainLogoUrl(producer);
    const url = chainUrl || (options.preferChainOnly
        ? null
        : resolveProducerLogo(producer, { allowFastFoodPhoto: false }));
    const isChain = Boolean(chainUrl);
    const isPhoto = Boolean(url && (url.includes('/fastfood/') || /\.(webp|jpe?g|png)(\?|$)/i.test(url)));

    const safeUrl = sanitizeImageUrl(url);
    if (safeUrl) {
        return {
            html: `<img src="${escapeHtml(safeUrl)}" alt="" class="${escapeHtml(className)}${isChain ? ' is-chain-logo' : ''}" width="${size}" height="${size}" loading="lazy" decoding="async" />`,
            url: safeUrl,
            isPhoto,
            icon,
            isChain
        };
    }

    return {
        html: `<span class="chain-logo-fallback producer-header-icon producer-category-icon" aria-hidden="true">${icon}</span>`,
        url: null,
        isPhoto: false,
        icon,
        isChain: false
    };
}

export default {
    detectChainBrand,
    getChainById,
    resolveProducerChain,
    getProducerDisplayName,
    buildChainLogoHtml,
    buildProducerLogoHtml,
    resolveProducerLogo,
    resolveChainLogoUrl,
    getCategoryDefaultLogo,
    getFastFoodImage,
    FAST_FOOD_IMAGES,
    CATEGORY_DEFAULT_LOGOS,
    CHAIN_BRANDS
};
