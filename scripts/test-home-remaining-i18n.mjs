/**
 * Test i18n – pozostałe sekcje Home (returnMagic, regionSoul, livingRegion, …).
 */
import { TRANSLATIONS } from '../js/translations.js';

const EN_PHRASES = [
    'Good to see you again',
    'The region speaks',
    'Today it is worth visiting',
    'Today is a good day to visit the apiary',
    'Did you know…',
    'Welcome back.',
    'Host of the region',
    'The region is alive'
];

function resolve(obj, path) {
    return path.split('.').reduce((a, p) => a?.[p], obj);
}

function enLeak(lang, phrase) {
    const json = JSON.stringify(TRANSLATIONS[lang]);
    return json.includes(phrase);
}

const CHECKS = {
    ru: {
        'home.returnMagicTitle': 'Рад снова вас видеть',
        'home.regionSoulLabel': 'Регион говорит',
        'livingRegion.engineProducerOfDay': 'Сегодня стоит заглянуть к {name}.',
        'regionalIntel.tips.visitApiary.headline': 'Сегодня хороший день для визита на пасеку.',
        'placeHistory.title': 'Знаете ли вы…'
    },
    pl: {
        'home.returnMagicTitle': 'Miło Cię znowu widzieć',
        'home.regionSoulLabel': 'Region przemawia',
        'livingRegion.engineProducerOfDay': 'Dzisiaj warto odwiedzić: {name}.',
        'regionalIntel.tips.visitApiary.headline': 'Dzisiaj warto odwiedzić pasiekę.',
        'placeHistory.title': 'Czy wiesz, że…'
    },
    fr: {
        'home.returnMagicTitle': 'Content de vous revoir',
        'home.regionSoulLabel': 'La région parle',
        'livingRegion.engineProducerOfDay': "Aujourd'hui, ça vaut le coup de visiter {name}.",
        'regionalIntel.tips.visitApiary.headline': "Aujourd'hui est un bon jour pour visiter le rucher.",
        'placeHistory.title': 'Le saviez-vous…'
    },
    de: {
        'home.returnMagicTitle': 'Schön, dass du wieder da bist',
        'home.regionSoulLabel': 'Die Region spricht',
        'livingRegion.engineProducerOfDay': 'Heute lohnt ein Besuch bei {name}.',
        'regionalIntel.tips.visitApiary.headline': 'Heute lohnt ein Besuch bei der Imkerei.',
        'placeHistory.title': 'Wussten Sie schon…'
    }
};

let failed = 0;

for (const [lang, expected] of Object.entries(CHECKS)) {
    for (const [key, value] of Object.entries(expected)) {
        const actual = resolve(TRANSLATIONS[lang], key);
        const ok = actual === value;
        console.log(`${ok ? '✅' : '❌'} ${lang.toUpperCase()} ${key}`);
        if (!ok) {
            failed++;
            console.log(`   expected: ${value}`);
            console.log(`   actual:   ${actual}`);
        }
    }
}

for (const phrase of EN_PHRASES) {
    const leak = enLeak('ru', phrase);
    console.log(`${leak ? '❌' : '✅'} RU bez EN leak: "${phrase}"`);
    if (leak) failed++;
}

if (failed) {
    console.log(`\n${failed} test(ów) nie przeszło`);
    process.exit(1);
}

console.log('\n✅ test-home-remaining-i18n OK');
