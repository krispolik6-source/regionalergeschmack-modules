import { enrichProducerWithProducts } from '../js/data/producerProducts.js';
import { buildPromotionsFlyerHtml, getProducerPromotionsList } from '../js/presentation/producerDisplay.js';
import fs from 'fs';

let failed = 0;
function ok(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error('FAIL', msg);
    } else {
        console.log('OK', msg);
    }
}

const bakery = enrichProducerWithProducts({
    id: 'test-bakery',
    name: 'Bäckerei Schmidt',
    category: 'bakery',
    source: 'content',
    products: [],
    promotions: [{ title: 'Only one' }]
});

ok(Array.isArray(bakery.promotions) && bakery.promotions.length >= 2, 'bakery catalog promotions');
ok(
    bakery.promotions.some((p) => String(p.description || p.title).includes('5.00') || Number(p.price) === 5),
    'bread+rolls promo 5€'
);

const list = getProducerPromotionsList(bakery);
ok(list.length >= 2, 'getProducerPromotionsList');

const html = buildPromotionsFlyerHtml(bakery, { compact: true });
ok(html.includes('data-promo-toggle'), 'toggle button');
ok(html.includes('promo-flyer-list'), 'flyer list');
ok(html.includes('hidden'), 'list collapsed by default');

const display = fs.readFileSync(new URL('../js/presentation/producerDisplay.js', import.meta.url), 'utf8');
ok(display.includes('buildPromotionsFlyerHtml') && display.includes('handlePromoFlyerToggle'), 'display helpers');

const mapView = fs.readFileSync(new URL('../js/views/map.js', import.meta.url), 'utf8');
ok(mapView.includes('handlePromoFlyerToggle'), 'map binds flyer toggle');

const modal = fs.readFileSync(new URL('../js/views/producerModal.js', import.meta.url), 'utf8');
ok(modal.includes('buildPromotionsFlyerHtml') && modal.includes('handlePromoFlyerToggle'), 'modal flyer');

console.log(failed ? `RESULT FAIL ${failed}` : 'RESULT PASS');
process.exit(failed ? 1 : 0);
