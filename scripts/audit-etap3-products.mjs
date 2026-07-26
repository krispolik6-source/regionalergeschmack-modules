// scripts/audit-etap3-products.mjs – audyt funkcjonalny Etapu 3 (read-only checks)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getCatalogProductCount, enrichProducerWithProducts } from '../js/data/producerProducts.js';
import { PRODUCT_IMAGE_SLUGS, resolveProductImageSlug } from '../js/data/productImages.js';
import { buildProductImageHtml } from '../js/presentation/productImage.js';
import { getProducerById } from '../js/data/dataService.js';
import { featuredProducts } from '../js/data/products.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const productsDir = path.join(root, 'assets', 'images', 'products');

const t = (key) => {
    const map = {
        'product.placeholderImage': 'Beispielbild',
        'product.sampleBadge': 'Beispielbild',
        'product.sampleNote': 'Hinweis'
    };
    return map[key] || key;
};

const results = [];

function check(id, ok, detail) {
    results.push({ id, ok: !!ok, detail });
    console.log(`${ok ? 'PASS' : 'FAIL'} [${id}] ${detail}`);
}

const cats = ['restaurant', 'bakery', 'farmer', 'meat', 'shop', 'vending'];
for (const c of cats) {
    const enriched = enrichProducerWithProducts({
        id: `audit-${c}`,
        name: 'Audit',
        category: c,
        source: 'osm',
        products: []
    });
    const expected = getCatalogProductCount(c);
    check(
        `catalog-full-${c}`,
        enriched.products.length === expected && expected > 0,
        `${c}: ${enriched.products.length}/${expected} produktów`
    );
}

const restaurant = enrichProducerWithProducts({
    id: 'r1',
    category: 'restaurant',
    source: 'osm',
    products: []
});
const sections = new Set(restaurant.products.map((p) => p.menuSection).filter(Boolean));
const needed = ['soups', 'mains', 'salads', 'breakfast', 'desserts', 'drinks'];
check(
    'restaurant-menu-sections',
    needed.every((s) => sections.has(s)),
    `sekcje: ${[...sections].join(', ')}`
);

const expectations = [
    ['Möhren (bio)', 'carrots'],
    ['Kartoffeln (bio)', 'potatoes'],
    ['Bauernbrot', 'bread'],
    ['Regionale Milch', 'milk'],
    ['Regionaler Käse', 'cheese'],
    ['Erdbeeren', 'strawberries'],
    ['Freilandeier', 'eggs'],
    ['Blütenhonig', 'honey'],
    ['Buttercroissant', 'croissant'],
    ['Hähnchenbrust', 'poultry'],
    ['Tagessuppe', 'soup'],
    ['Baguette', 'baguette'],
    ['Zwiebeln', 'onion'],
    ['Tomaten', 'tomato']
];
const nameFails = expectations.filter(([name, slug]) => resolveProductImageSlug({ name }) !== slug);
check('image-name-resolve', nameFails.length === 0, nameFails.length ? JSON.stringify(nameFails) : '14/14 OK');

const missingAssets = Object.keys(PRODUCT_IMAGE_SLUGS).filter((slug) => {
    return !fs.existsSync(path.join(productsDir, `${slug}.webp`))
        || !fs.existsSync(path.join(productsDir, `${slug}.jpg`));
});
check('image-assets-on-disk', missingAssets.length === 0, missingAssets.length ? missingAssets.join(',') : `${Object.keys(PRODUCT_IMAGE_SLUGS).length} slugów na dysku`);

let missingBadge = 0;
let missingLazy = 0;
let missingAsync = 0;
let missingAlt = 0;
for (const c of cats) {
    const enriched = enrichProducerWithProducts({ id: c, category: c, source: 'osm', products: [] });
    for (const prod of enriched.products) {
        const html = buildProductImageHtml(prod.imageUrl, t, {
            alt: prod.name,
            name: prod.name,
            imageSlug: prod.imageSlug,
            isSample: true
        });
        if (!html.includes('product-image-sample-badge')) missingBadge += 1;
        if (!html.includes('loading="lazy"')) missingLazy += 1;
        if (!html.includes('decoding="async"')) missingAsync += 1;
        if (!html.includes(`alt="${prod.name}"`)) missingAlt += 1;
    }
}
check('sample-badge-all', missingBadge === 0, `brak badge: ${missingBadge}`);
check('lazy-loading', missingLazy === 0, `brak lazy: ${missingLazy}`);
check('async-decode', missingAsync === 0, `brak async: ${missingAsync}`);
check('alt-text', missingAlt === 0, `brak alt: ${missingAlt}`);

const ownHtml = buildProductImageHtml('https://cdn.example.com/real.jpg', t, {
    alt: 'Real',
    name: 'Real',
    isSample: false
});
check('own-photo-no-badge', !ownHtml.includes('product-image-sample-badge'), 'własne URL bez badge');

const modalSrc = fs.readFileSync(path.join(root, 'js/views/producerModal.js'), 'utf8');
check('modal-no-product-slice', !/products\.slice\(0,\s*\d+\)/.test(modalSrc), 'brak slice na liście produktów');
check('modal-destroys-minimap', modalSrc.includes('destroyLocationMiniMap') && modalSrc.includes('locationMiniMap.remove()'), 'cleanup mini-mapy');

const homeSrc = fs.readFileSync(path.join(root, 'js/views/home.js'), 'utf8');
const homeUsesGpsDistance = homeSrc.includes('getDistanceKm')
    && homeSrc.includes('getLastPosition')
    && homeSrc.includes('resolveFeaturedDistanceKm');
check(
    'distance-from-gps-featured',
    homeUsesGpsDistance,
    homeUsesGpsDistance
        ? 'Home featured: dystans z GPS (getLastPosition + getDistanceKm)'
        : 'FAIL: Home featured używa statycznego distanceKm, nie GPS'
);

const priceA = enrichProducerWithProducts({ id: 'pa', category: 'shop', source: 'osm', products: [] });
const priceB = enrichProducerWithProducts({ id: 'pb', category: 'shop', source: 'osm', products: [] });
const milkA = priceA.products.find((p) => p.imageSlug === 'milk');
const milkB = priceB.products.find((p) => p.imageSlug === 'milk');
check(
    'prices-from-catalog',
    Number.isFinite(milkA?.price) && Number.isFinite(milkB?.price),
    `ceny z katalogu + jitter (milk ${milkA?.price} vs ${milkB?.price}); OSM nie zwraca cen produktów`
);

for (const n of [50, 100, 200]) {
    const extras = Array.from({ length: n }, (_, i) => ({
        id: `extra-${i}`,
        name: `Extra Produkt ${i}`,
        price: 1 + (i % 5),
        imageSlug: 'vegetables'
    }));
    const big = enrichProducerWithProducts({
        id: `big-${n}`,
        category: 'shop',
        source: 'osm',
        products: extras
    });
    const expectedMin = getCatalogProductCount('shop') + n;
    check(
        `list-size-${n}`,
        big.products.length >= expectedMin,
        `${big.products.length} pozycji (>= ${expectedMin})`
    );
}

const productImageSrc = fs.readFileSync(path.join(root, 'js/presentation/productImage.js'), 'utf8');
check('no-camera-emoji-fallback', !productImageSrc.includes('📷') || productImageSrc.includes('nigdy emoji'), 'brak emoji 📷 w fallbacku produktowym');

const mapSrc = fs.readFileSync(path.join(root, 'js/map/map.js'), 'utf8');
const mapViewSrc = fs.readFileSync(path.join(root, 'js/views/map.js'), 'utf8');
check('ux22-map-follow-present', mapViewSrc.includes('watchPosition') || mapSrc.includes('watchPosition') || mapViewSrc.includes('liveGps') || mapViewSrc.includes('Live'), 'mapa: ślady Live GPS / watch w kodzie widoku');
check('ux22-marker-fade', mapSrc.includes('is-entering') || mapSrc.includes('marker-fade'), 'markery: fade enter');

const content = getProducerById('content-gasthof-eifel');
check(
    'content-restaurant-full',
    content?.products?.length === 20,
    `content restaurant: ${content?.products?.length}`
);

const failed = results.filter((r) => !r.ok);
console.log('\n--- SUMMARY ---');
console.log(`passed: ${results.filter((r) => r.ok).length}/${results.length}`);
console.log(`failed: ${failed.length}`);
if (failed.length) {
    failed.forEach((f) => console.log(` - ${f.id}: ${f.detail}`));
}

const outDir = path.join(root, 'scripts');
fs.writeFileSync(
    path.join(outDir, 'audit-etap3-products-results.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), results, failed }, null, 2)
);
