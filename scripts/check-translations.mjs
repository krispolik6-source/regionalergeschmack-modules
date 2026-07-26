/**
 * Walidacja kompletności kluczy tłumaczeń vs DE (kanoniczny zestaw UI).
 */
import { TRANSLATIONS, SUPPORTED_LANGUAGE_CODES } from '../js/translations.js';

function collectKeys(obj, prefix = '') {
    const keys = [];
    for (const [k, v] of Object.entries(obj || {})) {
        const path = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === 'object' && !Array.isArray(v)) {
            keys.push(...collectKeys(v, path));
        } else {
            keys.push(path);
        }
    }
    return keys;
}

const REF = 'de';
const refKeys = new Set(collectKeys(TRANSLATIONS[REF]));
const enKeys = collectKeys(TRANSLATIONS.en);
const enSet = new Set(enKeys);

let hasError = false;

console.log(`Języki: ${SUPPORTED_LANGUAGE_CODES.length}`);
console.log(`Klucze referencyjne (${REF}): ${refKeys.size}\n`);

for (const code of SUPPORTED_LANGUAGE_CODES) {
    const keys = collectKeys(TRANSLATIONS[code]);
    const keySet = new Set(keys);
    const missing = [...refKeys].filter((k) => !keySet.has(k));
    const extra = keys.filter((k) => !refKeys.has(k));

    if (missing.length) {
        hasError = true;
        console.log(`❌ ${code}: brakuje ${missing.length} kluczy`);
        missing.slice(0, 15).forEach((k) => console.log(`   - ${k}`));
        if (missing.length > 15) console.log(`   … i ${missing.length - 15} więcej`);
    } else {
        console.log(`✅ ${code}: komplet (${keys.length} kluczy)`);
    }
    if (extra.length) {
        console.log(`   ℹ ${code}: ${extra.length} dodatkowych kluczy spoza DE`);
    }
}

// Klucze UI wymagane w teście użytkownika
const REQUIRED = [
    'nav.home', 'nav.map', 'nav.premium', 'nav.favorites', 'nav.cart', 'nav.profile',
    'home.heroTitle', 'home.getLocation', 'home.findNearby', 'home.footerCopyright',
    'categories.all.name', 'categories.farmers.name', 'categories.favorites.name',
    'map.gps', 'map.osm', 'map.dataLoading', 'map.dataCached', 'map.dataError', 'map.noDataInArea',
    'map.radiusFilter', 'home.searchPlaceholder', 'search.noResults',
    'favorites.title', 'favorites.empty', 'cart.title', 'cart.empty', 'cart.total',
    'reviews.title', 'reviews.userName', 'reviews.rating', 'reviews.comment', 'reviews.add',
    'msg.addedToFavorites', 'msg.removedFromFavorites', 'msg.addedToCart', 'msg.removedFromCart', 'msg.connectionError',
    'shell.label'
];

console.log('\n--- Wymagane klucze testowe ---');
for (const code of SUPPORTED_LANGUAGE_CODES) {
    const missing = REQUIRED.filter((k) => {
        const parts = k.split('.');
        let cur = TRANSLATIONS[code];
        for (const p of parts) {
            cur = cur?.[p];
        }
        return cur === undefined || cur === '';
    });
    if (missing.length) {
        hasError = true;
        console.log(`❌ ${code}: brak wymaganych: ${missing.join(', ')}`);
    }
}

if (!hasError) {
    console.log('\n✅ Wszystkie języki mają wymagane klucze testowe.');
}

process.exit(hasError ? 1 : 0);
