// js/data/producerProducts.js – pełne katalogi produktów wg kategorii (bez limitu)

import { resolveProductImage } from './productImages.js';

/**
 * @typedef {{
 *   slug: string,
 *   name: string,
 *   price: number,
 *   unit?: string,
 *   description?: string,
 *   promo?: string,
 *   imageSlug: string,
 *   menuSection?: string
 * }} CatalogItem
 */

/** @type {Readonly<Record<string, { promo: string, discount?: string, products: CatalogItem[], promotions?: object[] }>>} */
const CATEGORY_CATALOGS = Object.freeze({
    restaurant: {
        promo: '🍽️ Tagesgericht empfohlen!',
        promotions: [
            { id: 'rest-promo-daily', title: 'Tagesgericht', description: 'Saisonales Regionalgericht', price: 14.5, icon: '🔥' },
            { id: 'rest-promo-soup', title: 'Suppe + Brot', description: 'Tagessuppe mit Bauernbrot', price: 7.5, icon: '🏷️' },
            { id: 'rest-promo-coffee', title: 'Kaffee + Dessert', description: 'Kaffee und Hausdessert', price: 6.9, icon: '🔥' }
        ],
        products: [
            // Zupy
            { slug: 'soup', name: 'Tagessuppe', price: 6.5, description: 'Hausgemachte Suppe der Saison', imageSlug: 'soup', menuSection: 'soups', promo: '🥣 Frisch' },
            { slug: 'soup-asparagus', name: 'Spargelsuppe', price: 7.2, description: 'Cremige Suppe mit regionalem Spargel', imageSlug: 'asparagus', menuSection: 'soups' },
            { slug: 'soup-potato', name: 'Kartoffelsuppe', price: 6.8, description: 'Mit Kartoffeln vom Hof', imageSlug: 'soup', menuSection: 'soups' },
            // Dania główne
            { slug: 'daily-dish', name: 'Tagesgericht', price: 14.5, description: 'Saisonales Regionalgericht', imageSlug: 'daily-dish', menuSection: 'mains', promo: '🍽️ Empfohlen!' },
            { slug: 'burger', name: 'Rinderburger', price: 12.9, description: 'Rindfleisch von Höfen aus der Region', imageSlug: 'burger', menuSection: 'mains' },
            { slug: 'schnitzel', name: 'Schnitzel vom Schwein', price: 13.5, description: 'Mit Bratkartoffeln', imageSlug: 'pork', menuSection: 'mains' },
            { slug: 'steak-plate', name: 'Rindersteak', price: 18.9, description: 'Mit Salat und Butter', imageSlug: 'steak', menuSection: 'mains' },
            { slug: 'poultry-plate', name: 'Hähnchenbrust', price: 13.9, description: 'Mit Gemüse der Saison', imageSlug: 'poultry', menuSection: 'mains' },
            { slug: 'bratkartoffeln', name: 'Bratkartoffeln mit Ei', price: 9.5, description: 'Klassiker mit Freilandei', imageSlug: 'potatoes', menuSection: 'mains' },
            // Sałatki
            { slug: 'salad', name: 'Saisonsalat', price: 8.9, description: 'Gemüse von lokalen Lieferanten', imageSlug: 'salad', menuSection: 'salads' },
            { slug: 'salad-tomato', name: 'Tomatensalat', price: 7.5, description: 'Mit Zwiebeln und Kräuteröl', imageSlug: 'tomato', menuSection: 'salads' },
            { slug: 'salad-cucumber', name: 'Gurkensalat', price: 6.9, description: 'Frisch und leicht', imageSlug: 'cucumber', menuSection: 'salads' },
            // Śniadania
            { slug: 'breakfast', name: 'Bauernfrühstück', price: 11.5, description: 'Mit Eiern, Kartoffeln und Brot', imageSlug: 'breakfast', menuSection: 'breakfast' },
            { slug: 'brotzeit', name: 'Brotzeit', price: 9.8, description: 'Brot, Butter, Käse und Wurst', imageSlug: 'breakfast', menuSection: 'breakfast' },
            // Desery
            { slug: 'dessert', name: 'Hausdessert', price: 5.5, description: 'Süßes aus der Region', imageSlug: 'dessert', menuSection: 'desserts' },
            { slug: 'apple-strudel', name: 'Apfelstrudel', price: 5.9, description: 'Mit Äpfeln vom Obstgarten', imageSlug: 'apples', menuSection: 'desserts' },
            { slug: 'cheesecake', name: 'Käsekuchen', price: 4.8, description: 'Mit regionalem Quark', imageSlug: 'cake', menuSection: 'desserts' },
            // Napoje
            { slug: 'juice', name: 'Apfelsaft', price: 3.2, description: 'Regionaler Direktsaft', imageSlug: 'juice', menuSection: 'drinks' },
            { slug: 'soft-drink', name: 'Mineralwasser', price: 2.5, description: 'Still oder sprudelnd', imageSlug: 'soft-drink', menuSection: 'drinks' },
            { slug: 'coffee', name: 'Kaffee', price: 2.8, description: 'Espresso oder Filterkaffee', imageSlug: 'coffee', menuSection: 'drinks' }
        ]
    },
    farmer: {
        promo: '🍎 Frische Ernte!',
        promotions: [
            { id: 'farm-promo-harvest', title: 'Frische Ernte', description: 'Saisonales Obst und Gemüse vom Hof', icon: '🔥' },
            { id: 'farm-promo-box', title: 'Gemüsekiste', description: 'Wochentüte mit regionalem Gemüse', price: 12, icon: '🏷️' },
            { id: 'farm-promo-eggs', title: 'Eier + Honig', description: 'Freilandeier und Blütenhonig', price: 9.5, icon: '🔥' }
        ],
        products: [
            { slug: 'potatoes', name: 'Kartoffeln (bio)', price: 2.5, unit: 'kg', description: 'Regionale Sorten', imageSlug: 'potatoes' },
            { slug: 'carrots', name: 'Möhren (bio)', price: 2.0, unit: 'kg', description: 'Süß und knackig', imageSlug: 'carrots' },
            { slug: 'onion', name: 'Zwiebeln', price: 1.8, unit: 'kg', description: 'Lagergut vom Feld', imageSlug: 'onion' },
            { slug: 'tomato', name: 'Tomaten', price: 3.5, unit: 'kg', description: 'Sonnengereift', imageSlug: 'tomato' },
            { slug: 'cucumber', name: 'Gurken', price: 1.6, unit: 'St.', description: 'Frisch vom Beet', imageSlug: 'cucumber' },
            { slug: 'asparagus', name: 'Spargel', price: 8.5, unit: 'kg', description: 'Saisonware', imageSlug: 'asparagus', promo: '🌱 Saison!' },
            { slug: 'vegetables', name: 'Gemüsekiste', price: 12.0, unit: 'Kiste', description: 'Saisonmischung', imageSlug: 'vegetables' },
            { slug: 'apples', name: 'Äpfel (bio)', price: 3.8, unit: 'kg', description: 'Frisch vom Obstgarten', imageSlug: 'apples', promo: '🍎 Saison!' },
            { slug: 'pear', name: 'Birnen', price: 3.6, unit: 'kg', description: 'Saftige Sorten', imageSlug: 'pear' },
            { slug: 'plum', name: 'Zwetschgen', price: 4.2, unit: 'kg', description: 'Zum Einmachen ideal', imageSlug: 'plum' },
            { slug: 'strawberries', name: 'Erdbeeren', price: 4.5, unit: 'kg', description: 'Saisonfrüchte vom Feld', imageSlug: 'strawberries' },
            { slug: 'eggs', name: 'Freilandeier', price: 3.0, unit: '6 St.', description: 'Hühner mit Auslauf', imageSlug: 'eggs' },
            { slug: 'honey', name: 'Blütenhonig', price: 8.9, unit: '500 g', description: 'Von lokalen Imkereien', imageSlug: 'honey' },
            { slug: 'jam', name: 'Erdbeermarmelade', price: 4.9, unit: 'Glas', description: 'Hausgemacht', imageSlug: 'jam' },
            { slug: 'preserves', name: 'Eingekochtes Gemüse', price: 5.5, unit: 'Glas', description: 'Aus eigener Ernte', imageSlug: 'preserves' }
        ]
    },
    bakery: {
        promo: '🔥 20% auf Brot!',
        discount: '20',
        promotions: [
            { id: 'bakery-promo-combo', title: 'Brot + Brötchen', description: 'Promocja: chleb + bułki = 5.00 €', price: 5, icon: '🔥' },
            { id: 'bakery-promo-bread', title: '20% auf Brot', description: 'Aktion auf Bauernbrot bis Wochenende', discount: '20', icon: '🏷️' },
            { id: 'bakery-promo-sweet', title: '2 Croissants', description: 'Buttercroissants im Doppelpack', price: 3.5, icon: '🔥' }
        ],
        products: [
            { slug: 'bread', name: 'Bauernbrot', price: 3.5, description: 'Mit Sauerteig', imageSlug: 'bread', promo: '🔥 -20%' },
            { slug: 'bread-rye', name: 'Roggenbrot', price: 3.8, description: 'Kräftig und aromatisch', imageSlug: 'bread' },
            { slug: 'bread-spelt', name: 'Dinkelbrot', price: 4.2, description: 'Aus regionalem Dinkel', imageSlug: 'bread' },
            { slug: 'baguette', name: 'Baguette', price: 2.2, description: 'Knusprige Kruste', imageSlug: 'baguette' },
            { slug: 'rolls', name: 'Weizenbrötchen', price: 0.8, description: 'Frisch am Morgen', imageSlug: 'rolls' },
            { slug: 'rolls-seed', name: 'Körnerbrötchen', price: 0.95, description: 'Mit Saaten', imageSlug: 'rolls' },
            { slug: 'croissant', name: 'Buttercroissant', price: 2.0, description: 'Blättrig und buttrig', imageSlug: 'croissant' },
            { slug: 'pretzel', name: 'Laugenbrezel', price: 1.4, description: 'Klassiker mit Salz', imageSlug: 'pretzel' },
            { slug: 'pastries', name: 'Hefegebäck', price: 2.4, description: 'Süßes Tagesgebäck', imageSlug: 'pastries' },
            { slug: 'pastries-poppy', name: 'Mohnschnecke', price: 2.6, description: 'Mit Mohnfüllung', imageSlug: 'pastries' },
            { slug: 'cake', name: 'Blechkuchen', price: 2.8, unit: 'Stück', description: 'Saisonal belegt', imageSlug: 'cake' },
            { slug: 'cake-apple', name: 'Apfelkuchen', price: 3.2, unit: 'Stück', description: 'Mit Äpfeln vom Hof', imageSlug: 'cake' },
            { slug: 'cheesecake', name: 'Käsekuchen', price: 3.5, unit: 'Stück', description: 'Mit Quark', imageSlug: 'cake' }
        ]
    },
    meat: {
        promo: '🔥 Frische Wurst!',
        promotions: [
            { id: 'meat-promo-wurst', title: 'Frische Wurst', description: 'Hausmacherwurst nach Familienrezept', price: 3.2, icon: '🔥' },
            { id: 'meat-promo-grill', title: 'Grillpaket', description: 'Bratwurst + Aufschnitt', price: 7.5, icon: '🏷️' },
            { id: 'meat-promo-steak', title: '2× Rindersteak', description: 'Aus lokaler Haltung', price: 12.5, icon: '🔥' }
        ],
        products: [
            { slug: 'steak', name: 'Rindersteak', price: 6.9, unit: '200 g', description: 'Aus lokaler Haltung', imageSlug: 'steak' },
            { slug: 'beef-mince', name: 'Rinderhack', price: 9.5, unit: 'kg', description: 'Frisch gewolft', imageSlug: 'steak' },
            { slug: 'pork', name: 'Schweinerücken', price: 5.5, unit: 'kg', description: 'Schweinefleisch aus der Region', imageSlug: 'pork' },
            { slug: 'pork-cutlet', name: 'Schnitzelfleisch', price: 7.2, unit: 'kg', description: 'Zum Panieren', imageSlug: 'pork' },
            { slug: 'poultry', name: 'Hähnchenbrust', price: 8.9, unit: 'kg', description: 'Geflügel aus der Region', imageSlug: 'poultry' },
            { slug: 'poultry-whole', name: 'Suppenhuhn', price: 6.5, unit: 'kg', description: 'Für Brühe und Eintopf', imageSlug: 'poultry' },
            { slug: 'sausage', name: 'Hausmacherwurst', price: 3.2, unit: '3 St.', description: 'Nach Familienrezept', imageSlug: 'sausage', promo: '🔥 Frisch!' },
            { slug: 'sausage-brat', name: 'Bratwurst', price: 4.5, unit: '4 St.', description: 'Zum Grillen und Braten', imageSlug: 'sausage' },
            { slug: 'sausage-liver', name: 'Leberwurst', price: 3.8, unit: '200 g', description: 'Streichwurst hausgemacht', imageSlug: 'sausage' },
            { slug: 'cold-cuts', name: 'Aufschnitt gemischt', price: 4.2, unit: '200 g', description: 'Regionaler Wurstteller', imageSlug: 'sausage' }
        ]
    },
    shop: {
        promo: '🧈 10% auf Butter!',
        discount: '10',
        promotions: [
            { id: 'shop-promo-butter', title: '10% auf Butter', description: 'Regionale Landbutter', discount: '10', price: 2.25, icon: '🏷️' },
            { id: 'shop-promo-dairy', title: 'Milch + Joghurt', description: 'Frühstücksset vom Hof', price: 3.2, icon: '🔥' },
            { id: 'shop-promo-honey', title: 'Honig + Marmelade', description: 'Süßes aus der Region', price: 10.5, icon: '🏷️' }
        ],
        products: [
            { slug: 'milk', name: 'Regionale Milch', price: 1.5, unit: '1 l', description: 'Von Höfen aus der Nähe', imageSlug: 'milk' },
            { slug: 'yogurt', name: 'Naturjoghurt', price: 1.9, unit: '500 g', description: 'Ohne Zusätze', imageSlug: 'yogurt' },
            { slug: 'butter', name: 'Landbutter', price: 2.5, unit: '250 g', description: 'Cremig und aromatisch', imageSlug: 'butter', promo: '🧈 -10%' },
            { slug: 'cheese', name: 'Regionaler Käse', price: 4.2, unit: '200 g', description: 'Gereifter Schnittkäse', imageSlug: 'cheese' },
            { slug: 'cheese-soft', name: 'Weichkäse', price: 3.8, unit: '150 g', description: 'Mild und cremig', imageSlug: 'cheese' },
            { slug: 'eggs', name: 'Freilandeier', price: 3.0, unit: '6 St.', description: 'Von Höfen der Region', imageSlug: 'eggs' },
            { slug: 'bread', name: 'Bauernbrot', price: 3.5, description: 'Vom lokalen Bäcker', imageSlug: 'bread' },
            { slug: 'honey', name: 'Regionaler Honig', price: 7.9, unit: '500 g', description: 'Von Imkern aus der Umgebung', imageSlug: 'honey' },
            { slug: 'jam', name: 'Fruchtaufstrich', price: 3.9, unit: 'Glas', description: 'Aus regionalem Obst', imageSlug: 'jam' },
            { slug: 'juice', name: 'Direktsaft', price: 2.8, unit: '1 l', description: 'Apfelsaft naturtrüb', imageSlug: 'juice' },
            { slug: 'preserves', name: 'Eingelegtes', price: 4.5, unit: 'Glas', description: 'Gurken und Gemüse', imageSlug: 'preserves' },
            { slug: 'apples', name: 'Äpfel', price: 2.9, unit: 'kg', description: 'Lagerware regional', imageSlug: 'apples' },
            { slug: 'carrots', name: 'Möhren', price: 1.9, unit: 'kg', description: 'Frisch angeliefert', imageSlug: 'carrots' },
            { slug: 'potatoes', name: 'Kartoffeln', price: 1.8, unit: 'kg', description: 'Speisekartoffeln', imageSlug: 'potatoes' },
            { slug: 'lidl-regional', name: 'Regionalkiste', price: 9.9, unit: 'Kiste', description: 'Auswahl lokaler Produkte', imageSlug: 'lidl-regional' }
        ]
    },
    vending: {
        promo: '☕ Kaffee + Snack = 3,50 €',
        promotions: [
            { id: 'vend-promo-combo', title: 'Kaffee + Snack', description: 'Kaffee und Gebäck', price: 3.5, icon: '🔥' },
            { id: 'vend-promo-drink', title: '2 Getränke', description: 'Saft oder Erfrischungsgetränk', price: 3.5, icon: '🏷️' }
        ],
        products: [
            { slug: 'coffee', name: 'Kaffee', price: 2.5, description: 'Espresso oder Americano', imageSlug: 'coffee', promo: '☕ Combo 3,50 €' },
            { slug: 'chocolate', name: 'Schokolade', price: 1.8, description: 'Tafel Premium', imageSlug: 'chocolate' },
            { slug: 'juice', name: 'Fruchtsaft', price: 2.0, description: 'Gekühlt', imageSlug: 'juice' },
            { slug: 'soft-drink', name: 'Erfrischungsgetränk', price: 1.9, description: 'Dose oder Flasche', imageSlug: 'soft-drink' },
            { slug: 'milk', name: 'Trinkmilch', price: 1.4, description: 'Gekühlt, 0,5 l', imageSlug: 'milk' },
            { slug: 'yogurt', name: 'Trinkjoghurt', price: 1.6, description: 'Zum Mitnehmen', imageSlug: 'yogurt' },
            { slug: 'pastries', name: 'Gebäck', price: 1.5, description: 'Süßes Snackgebäck', imageSlug: 'pastries' },
            { slug: 'pretzel', name: 'Brezel', price: 1.7, description: 'Laugengebäck', imageSlug: 'pretzel' },
            { slug: 'apples', name: 'Apfel', price: 0.8, description: 'Frischobst', imageSlug: 'apples' },
            { slug: 'eggs', name: 'Eier (6er)', price: 2.9, description: 'Aus der Region', imageSlug: 'eggs' },
            { slug: 'honey', name: 'Honigglas klein', price: 4.5, description: 'Portion zum Mitnehmen', imageSlug: 'honey' },
            { slug: 'jam', name: 'Marmelade klein', price: 2.2, description: 'Aufstrich zum Mitnehmen', imageSlug: 'jam' }
        ]
    }
});

const DEFAULT_CATEGORY = 'shop';

/**
 * @param {string | undefined} category
 * @returns {keyof typeof CATEGORY_CATALOGS}
 */
function normalizeCategory(category) {
    const key = String(category || '').toLowerCase();
    if (key === 'fast_food' || key === 'fastfood') return 'restaurant';
    if (key in CATEGORY_CATALOGS) return key;
    if (key === 'other') return DEFAULT_CATEGORY;
    return DEFAULT_CATEGORY;
}

/**
 * @param {string} value
 * @returns {number}
 */
function hashString(value) {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
        hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
}

/**
 * @param {CatalogItem} item
 * @param {number} index
 * @param {string} producerId
 * @param {number} hash
 * @param {string} category
 * @returns {object}
 */
function catalogItemToProduct(item, index, producerId, hash, category) {
    const priceJitter = ((hash + index) % 5) * 0.05;
    const price = Math.round((item.price + priceJitter) * 100) / 100;
    const resolved = resolveProductImage({
        imageSlug: item.imageSlug,
        name: item.name,
        category
    });

    return {
        id: `${producerId}-${item.slug}-${index}`,
        name: item.name,
        description: item.description || '',
        price,
        unit: item.unit || '',
        promo: item.promo || '',
        imageSlug: resolved.imageSlug,
        imageUrl: resolved.imageUrl,
        isSampleImage: true,
        menuSection: item.menuSection || ''
    };
}

/**
 * @param {object} product
 * @param {string} producerId
 * @param {number} index
 * @param {string} category
 * @returns {object}
 */
function normalizeProductImage(product, producerId, index, category) {
    const resolved = resolveProductImage({
        imageUrl: product.imageUrl,
        imageSlug: product.imageSlug,
        name: product.name,
        category,
        isSampleImage: product.isSampleImage
    });

    return {
        ...product,
        id: product.id || `${producerId}-item-${index}`,
        imageSlug: resolved.imageSlug || product.imageSlug || '',
        imageUrl: resolved.imageUrl,
        isSampleImage: resolved.isSample
    };
}

/**
 * @param {number|string|undefined|null} price
 * @returns {string}
 */
function formatPromoPrice(price) {
    if (price == null || price === '') return '';
    if (typeof price === 'string' && /€/.test(price)) return price.trim();
    const value = Number(price);
    if (!Number.isFinite(value)) return String(price);
    return `${value.toFixed(2)} €`;
}

/**
 * @param {object[]} products
 * @param {{ promo: string, discount?: string, promotions?: object[] }} catalog
 * @returns {object[]}
 */
function buildDefaultPromotions(products, catalog) {
    if (Array.isArray(catalog.promotions) && catalog.promotions.length) {
        return catalog.promotions.map((promo, index) => {
            const matched = products.find((p) =>
                promo.productId && p.id === promo.productId
            ) || products.find((p) =>
                promo.title && String(p.name || '').toLowerCase().includes(
                    String(promo.title).toLowerCase().split(/[+&/]/)[0].trim()
                )
            ) || products.find((p) => p.promo) || products[index] || products[0];

            return {
                id: promo.id || `catalog-promo-${index + 1}`,
                title: promo.title || catalog.promo,
                description: promo.description || matched?.name || '',
                productId: promo.productId || matched?.id || '',
                discount: promo.discount != null ? String(promo.discount) : (catalog.discount || ''),
                price: promo.price != null ? promo.price : matched?.price,
                priceLabel: formatPromoPrice(
                    promo.price != null ? promo.price : (promo.priceLabel || matched?.price)
                ),
                icon: promo.icon || (index === 0 ? '🔥' : '🏷️')
            };
        });
    }

    if (!catalog.promo || !products.length) return [];

    const featured = products.find((p) => p.promo) || products[0];
    return [{
        id: 'catalog-promo-1',
        title: catalog.promo,
        description: featured?.name ? String(featured.name) : '',
        productId: featured?.id || '',
        discount: catalog.discount || '',
        price: featured?.price,
        priceLabel: formatPromoPrice(featured?.price),
        icon: '🔥'
    }];
}

/**
 * @param {string} category
 * @returns {object[]}
 */
export function getProductCatalogForCategory(category) {
    const key = normalizeCategory(category);
    const catalog = CATEGORY_CATALOGS[key];
    return catalog.products.map((item, index) =>
        catalogItemToProduct(item, index, `catalog-${key}`, index, key)
    );
}

/**
 * Liczba pozycji w katalogu kategorii (do raportów / testów).
 * @param {string} [category]
 */
export function getCatalogProductCount(category) {
    if (category) {
        return CATEGORY_CATALOGS[normalizeCategory(category)]?.products?.length || 0;
    }
    return Object.values(CATEGORY_CATALOGS).reduce((sum, cat) => sum + cat.products.length, 0);
}

/**
 * @param {object} producer
 * @returns {object}
 */
const EXTERNAL_CATALOG_SOURCES = new Set(['osm', 'govdata', 'map-fallback']);

export function enrichProducerWithProducts(producer) {
    if (!producer || typeof producer !== 'object') return producer;

    const existing = Array.isArray(producer.products) ? producer.products : [];
    const categoryKey = normalizeCategory(producer.category);

    if (producer.source === 'user') {
        return {
            ...producer,
            products: existing.map((product, index) =>
                normalizeProductImage(product, String(producer.id), index, categoryKey)
            )
        };
    }

    // OSM / govdata / map-fallback: tylko rzeczywiste produkty – bez syntetycznego katalogu
    // (pełny katalog w modalu blokował wątek główny na mobile przy innerHTML).
    if (EXTERNAL_CATALOG_SOURCES.has(producer.source)) {
        return {
            ...producer,
            products: existing.map((product, index) =>
                normalizeProductImage(product, String(producer.id), index, categoryKey)
            ),
            promo: producer.promo || '',
            promotions: Array.isArray(producer.promotions) ? producer.promotions : []
        };
    }

    const catalog = CATEGORY_CATALOGS[categoryKey];
    const hash = hashString(String(producer.id || producer.name || ''));

    const catalogProducts = catalog.products.map((item, index) =>
        catalogItemToProduct(item, index, String(producer.id), hash, categoryKey)
    );

    const osmExtras = existing
        .filter((p) => p?.name && !catalogProducts.some((c) => c.name === p.name))
        .map((p, index) => normalizeProductImage(
            { ...p, id: p.id || `${producer.id}-osm-${index}` },
            String(producer.id),
            index,
            categoryKey
        ));

    const products = [...catalogProducts, ...osmExtras];
    const promo = producer.promo || catalog.promo;
    const catalogPromos = buildDefaultPromotions(products, catalog);
    const ownPromos = Array.isArray(producer.promotions)
        ? producer.promotions.filter((p) => p?.title?.trim())
        : [];
    // Katalog ma bogatszą gazetkę – użyj go, gdy własne promocje są puste lub tylko 1
    const promotions = ownPromos.length >= 2 ? ownPromos : (catalogPromos.length ? catalogPromos : ownPromos);

    return {
        ...producer,
        products,
        promo,
        promotions
    };
}

/**
 * @param {object[]} producers
 * @returns {object[]}
 */
export function enrichProducersWithProducts(producers) {
    if (!Array.isArray(producers)) return [];
    return producers.map(enrichProducerWithProducts);
}

export default {
    enrichProducerWithProducts,
    enrichProducersWithProducts,
    getProductCatalogForCategory,
    getCatalogProductCount
};
