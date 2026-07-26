/**
 * Smoke: sklep ≠ pasieka; modal photo 160px
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function assert(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error(`FAIL ${msg}`);
    } else {
        console.log(`OK   ${msg}`);
    }
}

const { resolveProducerMood } = await import(
    pathToFileURL(join(ROOT, 'js/presentation/producerMood.js')).href
);
const { getCategoryImage, CATEGORY_IMAGES } = await import(
    pathToFileURL(join(ROOT, 'js/presentation/categoryImages.js')).href
);
const { buildProducerPhotoHtml } = await import(
    pathToFileURL(join(ROOT, 'js/presentation/producerTrust.js')).href
);

// i18n stub used by producerTrust
globalThis.document = undefined;

assert(CATEGORY_IMAGES.shop.includes('category_shops'), 'shop → category_shops');
assert(CATEGORY_IMAGES.shops.includes('category_shops'), 'shops → category_shops');
assert(!CATEGORY_IMAGES.shop.includes('category_honey'), 'shop not honey asset');
assert(getCategoryImage('shop') === getCategoryImage('shops'), 'shop/shops same url');

const shopWithHoney = {
    id: 's1',
    name: 'Hofladen Test',
    category: 'shop',
    products: [{ name: 'Blütenhonig', imageSlug: 'honey' }]
};
assert(resolveProducerMood(shopWithHoney) === 'shop', 'shop mood stays shop despite honey product');

const farmerHoney = {
    id: 'f1',
    name: 'Imkerei Wald',
    category: 'farmer',
    products: [{ name: 'Honig', imageSlug: 'honey' }]
};
assert(resolveProducerMood(farmerHoney) === 'honey', 'farmer imker → honey mood');

const html = buildProducerPhotoHtml(shopWithHoney, { className: 'producer-photo' });
assert(html.includes('category_shops'), 'shop sample photo uses shops image');
assert(!html.includes('category_honey'), 'shop sample photo not honey');

const style = readFileSync(join(ROOT, 'css/style.css'), 'utf8');
assert(style.includes('--photo-modal-height: 160px'), 'modal height 160');
assert(
    /producer-modal-header \.producer-photo-frame \{[\s\S]*?margin(?:-bottom)?:\s*(?:0 0 )?16px/.test(style),
    'margin 16 under photo'
);
assert(/\.producer-modal-body\s*\{[\s\S]*?overflow-y:\s*auto/.test(style), 'body scrolls');

if (failed) {
    console.error(`\n${failed} failure(s)`);
    process.exit(1);
}
console.log('\nShop photo + modal checks passed.');
