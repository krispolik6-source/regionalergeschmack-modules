import { HOME_CATEGORY_MAP, filterProducersByCategory } from '../js/data/producerHelpers.js';
import { PRODUCER_TO_CATEGORY_KEY, termMatchesHaystack } from '../js/presentation/searchLexicon.js';
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

const sample = [
    { id: 1, category: 'bakery', name: 'Bäckerei Schmidt' },
    { id: 2, category: 'restaurant', name: 'Gasthaus' },
    { id: 3, category: 'fast_food', name: 'Imbiss am Bahnhof' },
    { id: 4, category: 'fast_food', name: "McDonald's" }
];

ok(HOME_CATEGORY_MAP.fastFood === 'fast_food', 'map fastFood');
ok(filterProducersByCategory(sample, 'bakeries').length === 1, 'bakeries only');
ok(filterProducersByCategory(sample, 'restaurants').every((p) => p.category === 'restaurant'), 'restaurants exclude fast_food');
ok(filterProducersByCategory(sample, 'fastFood').length === 2, 'fastFood only');

ok(PRODUCER_TO_CATEGORY_KEY.fast_food === 'fastFood', 'lexicon producer→category');
ok(!termMatchesHaystack('gasthaus restaurant regionale', 'imbiss'), 'imbiss not restaurant synonym');
ok(termMatchesHaystack('fast food imbiss döner', 'imbiss'), 'imbiss matches fast_food haystack');

const app = fs.readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
ok(!/LOCATION_REQUESTED[\s\S]{0,120}resetCategoryFilter/.test(app), 'GPS does not reset category');
ok(!/NEARBY_SEARCH[\s\S]{0,120}resetCategoryFilter/.test(app), 'nearby does not reset category');
ok(/navigate\s*=\s*true/.test(app) && /navigate !== false/.test(app), 'search supports navigate:false');

const home = fs.readFileSync(new URL('../js/views/home.js', import.meta.url), 'utf8');
ok(home.includes("navigate: false"), 'home clear search keeps category');

const osm = fs.readFileSync(new URL('../js/data/osmService.js', import.meta.url), 'utf8');
const fastIdx = osm.indexOf("value: 'fast_food'");
const restIdx = osm.indexOf("value: 'restaurant'");
ok(fastIdx > 0 && restIdx > 0 && fastIdx < restIdx, 'OSM fast_food rule before restaurant');

const lexicon = fs.readFileSync(new URL('../js/presentation/searchLexicon.js', import.meta.url), 'utf8');
ok(!/gaststätte', 'imbiss'\]/.test(lexicon) && lexicon.includes("'imbiss'"), 'imbiss moved to fast_food group');

console.log(failed ? `RESULT FAIL ${failed}` : 'RESULT PASS');
process.exit(failed ? 1 : 0);
