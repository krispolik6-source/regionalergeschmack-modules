import { HOME_CATEGORY_MAP, filterProducersByCategory, countProducersByHomeCategory, normalizeProducerCategory } from '../js/data/producerHelpers.js';
import { CATEGORY_ICONS, PRODUCER_TYPE_KEYS } from '../js/presentation/categoryIcons.js';
import { MAP_CATEGORIES, LEGEND_CATEGORIES, DEFAULT_MARKER_COLORS } from '../js/map/mapSettings.js';
import fs from 'fs';

const sample = [
    { id: 1, category: 'farmer', name: 'Hof A' },
    { id: 2, category: 'bakery', name: 'Schmidt' },
    { id: 3, category: 'restaurant', name: 'Gasthaus' },
    { id: 4, category: 'fast_food', name: "McDonald's" },
    { id: 5, category: 'shop', name: 'Markt' },
    { id: 6, category: 'meat', name: 'Metzger' },
    { id: 7, category: 'vending', name: 'Automat' },
    { id: 8, category: 'fastfood', name: 'Alias Imbiss' }
];

let failed = 0;
function ok(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error('FAIL', msg);
    } else {
        console.log('OK', msg);
    }
}

ok(HOME_CATEGORY_MAP.fastFood === 'fast_food', 'HOME_CATEGORY_MAP.fastFood');
ok(HOME_CATEGORY_MAP.fastfood === 'fast_food', 'HOME_CATEGORY_MAP.fastfood alias');
ok(normalizeProducerCategory('fastfood') === 'fast_food', 'normalize fastfood');
ok(normalizeProducerCategory('farmers') === 'farmer', 'normalize farmers → farmer');
ok(normalizeProducerCategory('farm') === 'farmer', 'normalize farm → farmer');
ok(
    filterProducersByCategory(sample, 'farmers').length === 1
    && filterProducersByCategory(sample, 'farmers')[0].category === 'farmer',
    'filter farmers'
);
ok(
    filterProducersByCategory(
        [...sample, { id: 9, category: 'farmers', name: 'Plural' }, { id: 10, category: 'honey', name: 'Honig' }],
        'farmers'
    ).length === 3,
    'filter farmers includes plural + honey'
);
ok(
    filterProducersByCategory(sample, 'restaurants').length === 1
    && filterProducersByCategory(sample, 'restaurants')[0].category === 'restaurant',
    'filter restaurants excludes fast_food'
);
ok(
    filterProducersByCategory(sample, 'fastFood').length === 2,
    'filter fastFood includes alias'
);
ok(filterProducersByCategory(sample, 'bakeries').every((p) => p.category === 'bakery'), 'filter bakeries');

const counts = countProducersByHomeCategory(sample);
ok(counts.fastFood === 2 && counts.restaurants === 1 && counts.all === 8, 'counts');
ok(CATEGORY_ICONS.fastFood === '🍔' && PRODUCER_TYPE_KEYS.fast_food === 'fast_food', 'icons/types');
ok(
    MAP_CATEGORIES.includes('fast_food')
    && LEGEND_CATEGORIES.includes('fast_food')
    && Boolean(DEFAULT_MARKER_COLORS.fast_food),
    'map settings'
);

const osm = fs.readFileSync(new URL('../js/data/osmService.js', import.meta.url), 'utf8');
ok(
    osm.includes("value: 'fast_food'")
    && osm.includes('fast_food|')
    && osm.includes('rg_osm_overpass_cache_v6')
    && osm.includes("value: 'cafe'")
    && osm.includes("value: 'marketplace'")
    && osm.includes("value: 'brewery'")
    && osm.includes("'wine'")
    && osm.includes("value: 'farm'")
    && osm.includes("category: 'farmer'")
    && osm.includes('beekeeper')
    && osm.includes("amenity === 'fast_food'"),
    'osmService DE tags (cafe, marketplace, brewery, wine) + cache v6'
);

const map = fs.readFileSync(new URL('../js/views/map.js', import.meta.url), 'utf8');
ok(
    map.includes('shouldPreserveExistingMarkers')
    && map.includes('updateCategoryHeader')
    && map.includes('hasActiveVisibilityFilter')
    && map.includes('filterProducersByCategory')
    && map.includes("return 'farmers'")
    && map.includes('getNearbyFitTargets')
    && map.includes('applyNavigationFilter')
    && map.includes('[Map] Filtr:'),
    'map filter helpers + nearby fit + navigation filter'
);

const app = fs.readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
ok(!/SEARCH_PRODUCTS[\s\S]{0,220}setCategoryFilter\('all'\)/.test(app), 'search does not clear category');
ok(app.includes('mapLoader') && app.includes('queueSearchQuery'), 'app uses lazy mapLoader');

const nav = fs.readFileSync(new URL('../js/controllers/navigation.js', import.meta.url), 'utf8');
ok(
    nav.includes('navigateToCategory')
    && nav.includes('[Navigation] Kategoria:')
    && nav.includes('options.filter')
    && nav.includes('mapLoader')
    && nav.includes('renderMapLazy'),
    'navigation passes filter to lazy map'
);

const home = fs.readFileSync(new URL('../js/views/home.js', import.meta.url), 'utf8');
ok(home.includes("'fastFood'") && home.includes('data-carousel="fastFood"'), 'home CATEGORY_IDS + section');

const ds = fs.readFileSync(new URL('../js/data/dataService.js', import.meta.url), 'utf8');
ok(ds.includes('rg_producers_data_v7') && ds.includes('osmService.js?v=10'), 'producers cache v7 + osm import');

const content = fs.readFileSync(new URL('../js/data/contentProducers.js', import.meta.url), 'utf8');
ok(content.includes("category: 'fast_food'") && content.includes('content-imbiss-markt'), 'content seed Fast Food');
ok(content.includes('52.1412') && content.includes("category: 'farmer'"), 'content farmers near Hilter');

const lexicon = fs.readFileSync(new URL('../js/presentation/searchLexicon.js', import.meta.url), 'utf8');
ok(lexicon.includes("fast_food: 'fastFood'") && lexicon.includes('imbiss'), 'search lexicon fast food');

console.log(failed ? `RESULT FAIL ${failed}` : 'RESULT PASS');
process.exit(failed ? 1 : 0);
