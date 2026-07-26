/**
 * Test i18n – Home UI core (greeting, seasonal, recommendations).
 */
import { TRANSLATIONS } from '../js/translations.js';

function resolve(obj, path) {
    return path.split('.').reduce((a, p) => a?.[p], obj);
}

const EN_PHRASES = [
    'Good day! 👋',
    'Your journey through the region starts here.',
    'Surprise me',
    'Nearest to you'
];

function enLeakInKeys(lang, phrase, keys) {
    return keys.some((k) => resolve(TRANSLATIONS[lang], k) === phrase);
}

const HOME_KEYS = [
    'home.greeting', 'home.greetingSub', 'home.seasonalTitle', 'home.surpriseMe',
    'home.nearbyTitle', 'home.smartTodayTitle', 'home.tasteAdvisorTitle', 'home.tastesOfDayTitle'
];

const CHECKS = {
    ru: {
        'home.greeting': 'Добрый день! 👋',
        'home.greetingSub': 'Здесь начинается ваш путь по региону.',
        'home.seasonalTitle': 'Сезонные продукты',
        'smartToday.reason.rain': 'Дождь – свежий хлеб и тёплый суп.',
        'tasteAdvisor.ctaExplore': null,
        'home.surpriseMe': null
    },
    pl: {
        'home.greeting': 'Dzień dobry! 👋',
        'home.greetingSub': 'Tu zaczyna się Twoja droga przez region.',
        'home.seasonalTitle': 'Produkty sezonowe',
        'smartToday.reason.rain': 'Deszcz – świeży chleb i ciepła zupa.'
    },
    fr: {
        'home.greeting': null,
        'home.seasonalTitle': null,
        'smartToday.reason.rain': null
    },
    de: {
        'home.greeting': 'Guten Tag! 👋',
        'home.greetingSub': 'Dein Weg durch die Region beginnt hier.',
        'home.seasonalTitle': 'Saisonale Produkte'
    }
};

let failed = 0;

for (const [lang, expected] of Object.entries(CHECKS)) {
    for (const [key, value] of Object.entries(expected)) {
        if (value === null) continue;
        const actual = resolve(TRANSLATIONS[lang], key);
        const en = resolve(TRANSLATIONS.en, key);
        const ok = actual === value;
        console.log(`${ok ? '✅' : '❌'} ${lang.toUpperCase()} ${key}`);
        if (!ok) {
            failed++;
            console.log(`   expected: ${value}`);
            console.log(`   actual:   ${actual}`);
        }
        if (actual === en && lang !== 'en' && /[A-Za-z]{4,}/.test(String(actual))) {
            console.log(`❌ ${lang.toUpperCase()} ${key} – EN leak`);
            failed++;
        }
    }
}

for (const [lang, expected] of Object.entries(CHECKS)) {
    for (const [key] of Object.entries(expected)) {
        if (expected[key] !== null) continue;
        const actual = resolve(TRANSLATIONS[lang], key);
        const en = resolve(TRANSLATIONS.en, key);
        const ok = actual && actual !== en;
        console.log(`${ok ? '✅' : '❌'} ${lang.toUpperCase()} ${key} (not EN)`);
        if (!ok) failed++;
    }
}

for (const phrase of EN_PHRASES) {
    const leak = enLeakInKeys('ru', phrase, HOME_KEYS);
    console.log(`${leak ? '❌' : '✅'} RU bez EN leak: "${phrase}"`);
    if (leak) failed++;
}

if (failed) {
    console.log(`\n${failed} test(ów) nie przeszło`);
    process.exit(1);
}

console.log('\n✅ test-home-ui-core-i18n OK');
