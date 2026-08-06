/**
 * Release verification – producer modal data flow + section render (Node smoke).
 * Run: node scripts/test-producer-modal-release.mjs
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function ok(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error('FAIL', msg);
    } else {
        console.log('OK', msg);
    }
}

// ─── Minimal DOM for openProducerModal ───
const store = new Map();
globalThis.localStorage = {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k)
};

class Cls {
    constructor() { this._set = new Set(); }
    add(v) { this._set.add(v); return this; }
    remove(v) { this._set.delete(v); return this; }
    toggle(v) { this._set.has(v) ? this._set.delete(v) : this._set.add(v); return this; }
    contains(v) { return this._set.has(v); }
}

const byId = {};

function el(tag, { id = '', className = '' } = {}) {
    const node = {
        tagName: tag.toUpperCase(),
        id,
        className,
        classList: new Cls(),
        hidden: false,
        inert: false,
        dataset: {},
        style: {},
        children: [],
        parentElement: null,
        _html: '',
        get innerHTML() { return this._html; },
        set innerHTML(v) { this._html = String(v); },
        textContent: '',
        attributes: {},
        setAttribute(k, v) { this.attributes[k] = v; },
        getAttribute(k) { return this.attributes[k] ?? null; },
        removeAttribute(k) { delete this.attributes[k]; },
        contains(child) { return this.children.includes(child) || child === this; },
        blur() {},
        focus() {},
        addEventListener() {},
        removeEventListener() {},
        querySelector(sel) {
            if (sel.startsWith('#')) return byId[sel.slice(1)] || null;
            if (sel === '.producer-modal-back') {
                return this._html.includes('producer-modal-back') ? { focus() {} } : null;
            }
            if (sel === '.producer-modal-backdrop') return null;
            return null;
        },
        querySelectorAll() { return []; },
        appendChild(c) { this.children.push(c); c.parentElement = this; if (c.id) byId[c.id] = c; return c; }
    };
    if (id) byId[id] = node;
    return node;
}

const body = el('body');
body.insertAdjacentHTML = (_pos, html) => {
    if (html.includes('id="producerModal"')) {
        const modal = el('div', { id: 'producerModal', className: 'producer-modal' });
        modal.hidden = true;
        const content = el('div', { id: 'producerModalContent', className: 'producer-modal-content' });
        modal.children.push(content);
        content.parentElement = modal;
        body.children.push(modal);
        modal.parentElement = body;
    }
};

globalThis.document = {
    body,
    documentElement: { lang: 'de', classList: new Cls(), setAttribute() {}, getAttribute: () => null },
    getElementById: (id) => byId[id] || null,
    querySelector: (sel) => (sel === '.bottom-nav' ? el('nav') : null),
    querySelectorAll: () => [],
    createElement: (tag) => el(tag),
    addEventListener: () => {},
    get activeElement() { return body; }
};

globalThis.window = {
    scrollY: 0,
    innerWidth: 390,
    innerHeight: 844,
    location: { href: 'http://127.0.0.1:3456/', search: '', pathname: '/', origin: 'http://127.0.0.1:3456' },
    history: { replaceState() {} },
    addEventListener: () => {},
    removeEventListener: () => {},
    requestAnimationFrame: (cb) => { cb(); return 1; },
    setTimeout: (cb) => { cb(); return 1; },
    open: () => {},
    L: undefined,
    document: globalThis.document
};

// ─── Data layer ───
const { enrichProducerWithProducts } = await import('../js/data/producerProducts.js');
const { upsertProducer, getProducerById } = await import('../js/data/dataService.js');
const { buildPromotionsFlyerHtml, buildOpenStatusHtml } = await import('../js/presentation/producerDisplay.js');
const { buildProducerPhotoHtml } = await import('../js/presentation/producerTrust.js');
const { getProducerStory } = await import('../js/data/producerStories.js');
const { setLanguage } = await import('../js/core/i18n.js');

setLanguage('de');

const osmProducer = {
    id: 'release-test-osm-farm',
    name: 'Hofladen Müller',
    category: 'farmer',
    source: 'osm',
    lat: 51.2277,
    lng: 6.7735,
    address: 'Musterstraße 1, Düsseldorf',
    phone: '+49 211 123456',
    email: 'hof@example.de',
    website: 'https://example.de',
    opening_hours: 'Mo-Fr 08:00-18:00',
    rating: 4.5,
    products: []
};

const enriched = enrichProducerWithProducts(osmProducer);
ok(enriched.products.length >= 10, `OSM enrich: ${enriched.products.length} produktów`);
ok(enriched.promotions?.length >= 2, `OSM enrich: ${enriched.promotions?.length} promocji`);
ok(Boolean(enriched.promo), 'OSM enrich: promo tekst');
ok(enriched.products[0]?.price > 0, 'OSM enrich: cena produktu');

ok(buildPromotionsFlyerHtml(enriched).includes('promo-flyer'), 'Promocje: HTML gazetki');
ok(buildProducerPhotoHtml(enriched).includes('producer-photo'), 'Zdjęcie: photo frame');
ok(typeof buildOpenStatusHtml(enriched) === 'string', 'Godziny: status HTML');
ok(typeof getProducerStory(enriched) === 'string', 'Opis: story dostępna');

// ─── Modal open + render ───
const { openProducerModal, initProducerModal, isProducerModalOpen, resetProducerModalOpeningState } =
    await import('../js/views/producerModal.js');

upsertProducer(enriched);
ok(getProducerById('release-test-osm-farm')?.products?.length >= 10, 'Registry: producent z produktami');

resetProducerModalOpeningState();
initProducerModal();
openProducerModal('release-test-osm-farm', enriched);

ok(isProducerModalOpen(), 'Modal: otwarty po openProducerModal');

const contentEl = byId.producerModalContent;
const html = contentEl?.innerHTML || '';
ok(html.includes('Hofladen') || html.includes('producerModalTitle'), 'Modal: nazwa producenta');
ok(html.includes('producer-photo') || html.includes('producer-modal-photo'), 'Modal: zdjęcie');
ok(html.includes('producer-products-section'), 'Modal: sekcja produktów');
ok(html.includes('producer-product-price'), 'Modal: ceny');
ok(html.includes('promo-flyer') || html.includes('producer-modal-promo'), 'Modal: promocje');
ok(html.includes('producer-open-status') || html.includes('producer-modal-chip-status'), 'Modal: status/godziny');
ok(html.includes('producer-contact-section') || html.includes('producer-contact-item'), 'Modal: kontakt');
ok(html.includes('producer-location-section') || html.includes('producer-location-address'), 'Modal: adres/lokalizacja');
ok(html.includes('data-close-modal'), 'Modal: przyciski akcji');
ok(html.includes('producer-reviews-section') || html.includes('data-review-form'), 'Modal: opinie');
ok((html.match(/producer-product-card/g) || []).length >= 1, 'Modal: karty produktów w HTML');

// ─── Map → modal wiring (static) ───
const mapJs = readFileSync(join(ROOT, 'js/views/map.js'), 'utf8');
const modalJs = readFileSync(join(ROOT, 'js/views/producerModal.js'), 'utf8');
const prodJs = readFileSync(join(ROOT, 'js/data/producerProducts.js'), 'utf8');

ok(mapJs.includes('openProducerModal(producerId'), 'Mapa: openProducerModal z producerId');
ok(modalJs.includes('upsertProducer(found)'), 'Modal: upsertProducer(found)');
ok(!prodJs.includes('EXTERNAL_CATALOG_SOURCES.has'), 'Dane: brak OSM catalog block');

console.log(failed ? `\nRESULT FAIL (${failed})` : '\nRESULT PASS');
process.exit(failed ? 1 : 0);
