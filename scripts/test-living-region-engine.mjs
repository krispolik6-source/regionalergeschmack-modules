/**
 * Smoke: Living Region Engine — tylko dane, bez UI.
 */
import assert from 'assert';
import {
    initLivingRegion,
    isLivingRegionEnabled,
    getTodayHighlights,
    getSeasonalProducts,
    getNewProducers,
    getOpenNow,
    getChangesSinceLastVisit,
    invalidateLivingRegionCache
} from '../js/livingRegion/livingRegion.js';

const mem = new Map();
globalThis.localStorage = {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => { mem.set(k, String(v)); },
    removeItem: (k) => { mem.delete(k); }
};

const sampleProducers = [
    {
        id: 'p-bakery',
        name: 'Bäckerei Test',
        category: 'bakery',
        lat: 52.27,
        lng: 8.05,
        products: [
            { id: 'bread', name: 'Bauernbrot' },
            { id: 'asparagus-roll', name: 'Spargelbrötchen' }
        ],
        promo: 'Frisch',
        opening_hours: 'Mo-Su 08:00-18:00'
    },
    {
        id: 'p-farm',
        name: 'Hof Test',
        category: 'farmer',
        lat: 52.28,
        lng: 8.06,
        products: [{ id: 'apples', name: 'Äpfel' }],
        promotions: [{ id: 'box', title: 'Gemüsekiste' }]
    },
    {
        id: 'p-new',
        name: 'Neu dabei',
        category: 'shop',
        lat: 52.275,
        lng: 8.055,
        products: [{ id: 'honey', name: 'Honig' }]
    }
];

const ctxBase = {
    now: new Date('2026-07-26T10:00:00'),
    producers: sampleProducers,
    user: { lat: 52.27, lng: 8.05 },
    radiusKm: 20,
    favoriteIds: ['p-bakery'],
    recentlyViewedIds: ['p-farm'],
    favoriteCategories: ['bakery', 'farmer']
};

initLivingRegion({ enabled: true });
assert.strictEqual(isLivingRegionEnabled(), true);

invalidateLivingRegionCache();
mem.clear();

// Pierwsza baza nowości / wizyty
const firstNew = getNewProducers(ctxBase);
assert.strictEqual(firstNew.firstBaseline, true);
assert.strictEqual(firstNew.producerIds.length, 0);

const firstVisit = getChangesSinceLastVisit(ctxBase);
assert.strictEqual(firstVisit.firstVisit, true);

invalidateLivingRegionCache();

const seasonal = getSeasonalProducts(ctxBase);
assert.strictEqual(seasonal.kind, 'seasonal');
assert.ok(seasonal.seasonId);
assert.ok(Array.isArray(seasonal.items));

const open = getOpenNow(ctxBase);
assert.strictEqual(open.kind, 'openNow');
assert.ok(Array.isArray(open.producerIds));

const highlights = getTodayHighlights(ctxBase);
assert.strictEqual(highlights.enabled, true);
assert.ok(highlights.dayKey);
assert.ok(Array.isArray(highlights.items));
assert.ok(highlights.items.length >= 1, 'oczekiwano ≥1 highlight (sezon / producent dnia)');
assert.ok(highlights.items.every((h) => h.kind && h.payload && typeof h.rank === 'number'));
assert.ok(!JSON.stringify(highlights).includes('home-living'), 'brak śladów Home/CSS');
assert.ok(!JSON.stringify(highlights).includes('<'), 'brak HTML');

const cached = getTodayHighlights(ctxBase);
assert.strictEqual(cached.cache, 'hit');
assert.deepStrictEqual(
    cached.items.map((x) => x.id),
    highlights.items.map((x) => x.id)
);

// Wyłączenie
initLivingRegion({ enabled: false });
assert.strictEqual(isLivingRegionEnabled(), false);
const off = getTodayHighlights(ctxBase);
assert.strictEqual(off.enabled, false);
assert.strictEqual(off.items.length, 0);

initLivingRegion({ enabled: true });
console.log('OK living-region-engine', {
    highlights: highlights.items.map((h) => h.kind),
    cache: cached.cache,
    seasonal: seasonal.seasonId
});
