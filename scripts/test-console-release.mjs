/**
 * Browser console smoke – load app, open producer modal via API, collect console errors.
 * Requires: npm start + playwright chromium (npx playwright install chromium)
 * Run: node scripts/test-console-release.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:3456';
const errors = [];
const warns = [];

async function main() {
    let browser;
    try {
        browser = await chromium.launch({ headless: true });
    } catch (e) {
        console.error('SKIP: Playwright chromium unavailable:', e.message);
        process.exit(0);
    }

    const page = await browser.newPage();
    page.on('console', (msg) => {
        const type = msg.type();
        const text = msg.text();
        if (type === 'error') errors.push(text);
        if (type === 'warning' && /EventBus|Leaflet|Translation|Unhandled/i.test(text)) warns.push(text);
    });
    page.on('pageerror', (err) => errors.push(`PAGEERROR: ${err.message}`));

    await page.goto(`${BASE}/?dev=1`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('#app [data-view-panel]', { timeout: 45000 }).catch(() => {});
    await page.waitForTimeout(2000);

    const modalResult = await page.evaluate(async () => {
        const mod = await import('/js/views/producerModal.js');
        const { enrichProducerWithProducts } = await import('/js/data/producerProducts.js');
        const { upsertProducer } = await import('/js/data/dataService.js');
        const p = enrichProducerWithProducts({
            id: 'console-smoke-osm',
            name: 'Console Smoke Farm',
            category: 'farmer',
            source: 'osm',
            lat: 51.22,
            lng: 6.77,
            address: 'Test 1',
            products: []
        });
        upsertProducer(p);
        mod.openProducerModal('console-smoke-osm', p);
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        const html = document.getElementById('producerModalContent')?.innerHTML || '';
        return {
            open: mod.isProducerModalOpen(),
            hasProducts: html.includes('producer-products-section'),
            hasPrices: html.includes('producer-product-price'),
            hasPromo: html.includes('promo-flyer'),
            hasContact: html.includes('producer-contact'),
            productCards: (html.match(/producer-product-card/g) || []).length
        };
    });

    let failed = 0;
    function ok(c, m) {
        if (!c) { failed++; console.error('FAIL', m); } else console.log('OK', m);
    }

    ok(modalResult.open, 'Browser: modal open');
    ok(modalResult.hasProducts, 'Browser: products section');
    ok(modalResult.hasPrices, 'Browser: prices');
    ok(modalResult.hasPromo, 'Browser: promotions');
    ok(modalResult.hasContact, 'Browser: contact');
    ok(modalResult.productCards >= 1, `Browser: ${modalResult.productCards} product cards`);

    const critical = errors.filter((e) =>
        !/favicon|404|Failed to load resource.*icon/i.test(e)
        && !/Overpass|504|timeout/i.test(e)
    );
    ok(critical.length === 0, `Console errors: ${critical.length}${critical.length ? ' → ' + critical.slice(0, 3).join(' | ') : ''}`);

    await browser.close();
    console.log(critical.length ? '\nRESULT FAIL' : '\nRESULT PASS');
    process.exit(failed ? 1 : 0);
}

main().catch((e) => {
    console.error('SKIP/FAIL:', e.message);
    process.exit(1);
});
