// js/data/productImages.js – ścieżki + dopasowanie zdjęcia do produktu (produkcja)

const BASE = '/assets/images/products';
/** Cache-bust po ETAP 10B (dopasowanie zdjęć produktów). */
const V = 'v=3';

/** @type {Readonly<Record<string, string>>} */
export const PRODUCT_IMAGE_SLUGS = Object.freeze({
    // pieczywo
    bread: 'bread',
    rolls: 'rolls',
    croissant: 'croissant',
    pastries: 'pastries',
    cake: 'cake',
    baguette: 'baguette',
    pretzel: 'pretzel',
    // owoce
    apples: 'apples',
    strawberries: 'strawberries',
    pear: 'pear',
    plum: 'plum',
    // warzywa
    potatoes: 'potatoes',
    carrots: 'carrots',
    vegetables: 'vegetables',
    onion: 'onion',
    tomato: 'tomato',
    cucumber: 'cucumber',
    asparagus: 'asparagus',
    // nabiał
    milk: 'milk',
    cheese: 'cheese',
    yogurt: 'yogurt',
    butter: 'butter',
    eggs: 'eggs',
    // mięso
    steak: 'steak',
    pork: 'pork',
    sausage: 'sausage',
    poultry: 'poultry',
    burger: 'burger',
    // lokalne
    honey: 'honey',
    jam: 'jam',
    juice: 'juice',
    preserves: 'preserves',
    // restauracje / gotowe
    'daily-dish': 'daily-dish',
    salad: 'salad',
    soup: 'soup',
    breakfast: 'breakfast',
    dessert: 'dessert',
    // automaty / napoje
    coffee: 'coffee',
    chocolate: 'chocolate',
    'soft-drink': 'soft-drink',
    // legacy / sklep
    'lidl-regional': 'lidl-regional'
});

/** Domyślny slug gdy nie da się rozpoznać nazwy */
const CATEGORY_DEFAULT_SLUG = Object.freeze({
    restaurant: 'daily-dish',
    bakery: 'bread',
    farmer: 'vegetables',
    meat: 'steak',
    shop: 'milk',
    vending: 'coffee',
    other: 'vegetables'
});

/**
 * Kolejność ma znaczenie – bardziej specyficzne wzorce pierwsze.
 * @type {ReadonlyArray<{ re: RegExp, slug: string }>}
 */
const NAME_IMAGE_RULES = Object.freeze([
    { re: /truskawk|strawberry|erdbeer/i, slug: 'strawberries' },
    { re: /jabłk|apfel|apple/i, slug: 'apples' },
    { re: /gruszk|birne|pear/i, slug: 'pear' },
    { re: /śliwk|zwetsch|pflaume|plum/i, slug: 'plum' },
    { re: /marchew|möhre|carrot/i, slug: 'carrots' },
    { re: /ziemniak|kartoffel|potato/i, slug: 'potatoes' },
    { re: /cebula|zwiebel|onion/i, slug: 'onion' },
    { re: /pomidor|tomate|tomato/i, slug: 'tomato' },
    { re: /ogór|gurke|cucumber/i, slug: 'cucumber' },
    { re: /szparag|spargel|asparagus/i, slug: 'asparagus' },
    { re: /warzyw|gemüse|vegetable/i, slug: 'vegetables' },
    { re: /miód|honig|honey/i, slug: 'honey' },
    { re: /dżem|konfitüre|marmelade|\bjam\b/i, slug: 'jam' },
    { re: /przetwor|eingelegt|preserv/i, slug: 'preserves' },
    { re: /jogurt|joghurt|yogurt|yoghurt/i, slug: 'yogurt' },
    { re: /\bmleko\b|\bmilch\b|\bmilk\b/i, slug: 'milk' },
    { re: /\bmasło\b|\bbutter\b/i, slug: 'butter' },
    { re: /\bser\b|käse|cheese|quark/i, slug: 'cheese' },
    { re: /\bjaj|ei(er)?\b|\beggs?\b/i, slug: 'eggs' },
    { re: /bagiet|baguette/i, slug: 'baguette' },
    { re: /precel|brezel|pretzel/i, slug: 'pretzel' },
    { re: /rogal|croissant/i, slug: 'croissant' },
    { re: /bułk|brötchen|roll/i, slug: 'rolls' },
    { re: /chleb|brot(?!zeit)|\bbread\b/i, slug: 'bread' },
    { re: /drożdż|hefegebäck|pastr|wypiek/i, slug: 'pastries' },
    { re: /ciast|kuchen|cake|torte/i, slug: 'cake' },
    { re: /kiełbas|wurst|sausage|bratwurst/i, slug: 'sausage' },
    { re: /stek|steak|wołow|rind|beef/i, slug: 'steak' },
    { re: /schab|wieprz|schwein|pork/i, slug: 'pork' },
    { re: /drób|hähnchen|huhn|chicken|poultry|geflügel/i, slug: 'poultry' },
    { re: /burger/i, slug: 'burger' },
    { re: /zupa|suppe|soup/i, slug: 'soup' },
    { re: /sałatk|salat|salad/i, slug: 'salad' },
    { re: /śniadan|frühstück|breakfast|brotzeit/i, slug: 'breakfast' },
    { re: /deser|dessert|nachtisch/i, slug: 'dessert' },
    { re: /obiad|mittag|tagesgericht|danie dnia|daily/i, slug: 'daily-dish' },
    { re: /kawa|kaffee|coffee|espresso/i, slug: 'coffee' },
    { re: /czekolad|schokolade|chocolate/i, slug: 'chocolate' },
    { re: /sok|saft|juice/i, slug: 'juice' },
    { re: /napój|getränk|soft.?drink|cola|wasser|woda/i, slug: 'soft-drink' }
]);

/**
 * @param {string | null | undefined} slug
 * @returns {boolean}
 */
export function hasProductImageSlug(slug) {
    return Boolean(slug && PRODUCT_IMAGE_SLUGS[slug]);
}

/**
 * @param {string | null | undefined} slug
 * @returns {string | null}
 */
export function getProductImageUrl(slug) {
    if (!hasProductImageSlug(slug)) return null;
    return `${BASE}/${PRODUCT_IMAGE_SLUGS[slug]}.webp?${V}`;
}

/**
 * @param {string | null | undefined} webpUrl
 * @returns {string | null}
 */
export function getProductImageJpegUrl(webpUrl) {
    if (!webpUrl || typeof webpUrl !== 'string') return webpUrl || null;
    if (!webpUrl.includes('.webp')) return webpUrl;
    return webpUrl.replace(/\.webp(\?|$)/i, '.jpg$1');
}

/**
 * Czy URL to lokalne zdjęcie przykładowe z assets.
 * @param {string | null | undefined} url
 */
export function isSampleProductImageUrl(url) {
    if (!url || typeof url !== 'string') return false;
    return url.includes('/assets/images/products/');
}

/**
 * @param {{ imageSlug?: string, name?: string, category?: string }} input
 * @returns {string}
 */
const BAKERY_SLUGS = new Set(['bread', 'rolls', 'croissant', 'pastries', 'cake', 'baguette', 'pretzel']);
const MEAT_SLUGS = new Set(['steak', 'pork', 'sausage', 'poultry', 'burger']);

export function resolveProductImageSlug(input = {}) {
    const category = String(input.category || 'other').toLowerCase();
    const direct = input.imageSlug;
    if (hasProductImageSlug(direct)) {
        // ETAP 17 – nigdy chleb przy mięsie / mięso przy pieczywie
        if (/meat|fleisch|mięso|metz/.test(category) && BAKERY_SLUGS.has(direct)) {
            return CATEGORY_DEFAULT_SLUG.meat;
        }
        if (/bakery|bäck|baeck|piekarn/.test(category) && MEAT_SLUGS.has(direct)) {
            return CATEGORY_DEFAULT_SLUG.bakery;
        }
        return direct;
    }

    const name = String(input.name || '');
    for (const rule of NAME_IMAGE_RULES) {
        if (rule.re.test(name) && hasProductImageSlug(rule.slug)) {
            const slug = rule.slug;
            if (/meat|fleisch|mięso|metz/.test(category) && BAKERY_SLUGS.has(slug)) continue;
            if (/bakery|bäck|baeck|piekarn/.test(category) && MEAT_SLUGS.has(slug)) continue;
            return slug;
        }
    }

    const fallback = CATEGORY_DEFAULT_SLUG[category] || CATEGORY_DEFAULT_SLUG.other;
    return hasProductImageSlug(fallback) ? fallback : 'vegetables';
}

/**
 * Pełne rozwiązanie zdjęcia produktu.
 * Własne zdjęcie (zewnętrzne URL) → isSample=false.
 * Brak / assets przykładowe → matching sample + isSample=true.
 *
 * @param {{ imageUrl?: string, imageSlug?: string, name?: string, category?: string, isSampleImage?: boolean }} product
 * @param {{ category?: string }} [context]
 * @returns {{ imageUrl: string, imageSlug: string, isSample: boolean, jpegUrl: string | null }}
 */
export function resolveProductImage(product = {}, context = {}) {
    const category = product.category || context.category || 'other';
    const ownUrl = typeof product.imageUrl === 'string' ? product.imageUrl.trim() : '';
    const ownIsExternal = ownUrl
        && !isSampleProductImageUrl(ownUrl)
        && !ownUrl.startsWith('data:');

    if (ownIsExternal && product.isSampleImage !== true) {
        return {
            imageUrl: ownUrl,
            imageSlug: '',
            isSample: false,
            jpegUrl: null
        };
    }

    const slug = resolveProductImageSlug({
        imageSlug: product.imageSlug,
        name: product.name,
        category
    });
    const imageUrl = getProductImageUrl(slug) || getProductImageUrl('vegetables');

    return {
        imageUrl,
        imageSlug: slug,
        isSample: true,
        jpegUrl: getProductImageJpegUrl(imageUrl)
    };
}

export default {
    PRODUCT_IMAGE_SLUGS,
    getProductImageUrl,
    getProductImageJpegUrl,
    hasProductImageSlug,
    isSampleProductImageUrl,
    resolveProductImageSlug,
    resolveProductImage
};
