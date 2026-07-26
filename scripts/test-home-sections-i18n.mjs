/**
 * Audyt i18n sekcji Home – Nature Calendar, Region Stories, Live Region
 */
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function assert(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error(`❌ ${msg}`);
    } else {
        console.log(`✅ ${msg}`);
    }
}

const { TRANSLATIONS } = await import(`file://${join(ROOT, 'js/translations.js').replace(/\\/g, '/')}?t=${Date.now()}`);

function resolve(obj, path) {
    return path.split('.').reduce((a, p) => a?.[p], obj);
}

const RU_EXPECT = {
    'home.natureCalendarTitle': 'Природный календарь',
    'home.natureCalendarSub': 'Чем живёт пейзаж прямо сейчас.',
    'natureCalendar.beesNectar': 'Пчёлы собирают нектар на лугах.',
    'natureCalendar.chanterelle': 'Сезон лисичек в лесу.',
    'home.regionStoryTitle': 'Истории региона',
    'home.liveRegionTitle': 'Сегодня в регионе',
    'home.liveRegionSub': 'Короткие заметки из окрестностей — не реклама.',
    'liveRegion.automatRestock': 'Фермерский автомат снова пополнен — стоит заглянуть по дороге.',
    'liveRegion.gardenTables': 'Столики в саду снова открыты — солнце в комплекте.',
    'liveRegion.jamKitchen': 'Домашнее варенье и заготовки только что расфасованы.',
    'liveRegion.farmEggs': 'Яйца от небольших хозяйств — сегодня снова пополнили запасы.'
};

for (const [key, expected] of Object.entries(RU_EXPECT)) {
    const val = resolve(TRANSLATIONS.ru, key);
    assert(val === expected, `RU ${key}`);
}

const ruHoney = resolve(TRANSLATIONS.ru, 'regionStory.honeyMeadow');
assert(ruHoney?.startsWith('Над лугом пчёлы'), 'RU honeyMeadow po rosyjsku');
assert(!ruHoney?.includes('Over the meadow'), 'RU honeyMeadow bez EN');

const FR_EXPECT = {
    'home.natureCalendarTitle': 'Calendrier de la nature',
    'home.liveRegionTitle': "Aujourd'hui dans la région"
};

for (const [key, expected] of Object.entries(FR_EXPECT)) {
    const val = resolve(TRANSLATIONS.fr, key);
    assert(val === expected, `FR ${key}`);
}

const PL_EXPECT = {
    'home.natureCalendarTitle': 'Kalendarz natury',
    'home.liveRegionTitle': 'Dzisiaj w regionie'
};

for (const [key, expected] of Object.entries(PL_EXPECT)) {
    assert(resolve(TRANSLATIONS.pl, key) === expected, `PL ${key}`);
}

// Brak angielskich fraz w RU dla kluczowych sekcji
const enLeak = [
    'Today in the region',
    'Nature calendar',
    'Stories of the region',
    'Bees are gathering nectar',
    'Farm vending machine refilled'
];
for (const phrase of enLeak) {
    const ruBlob = JSON.stringify({
        home: TRANSLATIONS.ru.home,
        natureCalendar: TRANSLATIONS.ru.natureCalendar,
        liveRegion: TRANSLATIONS.ru.liveRegion,
        regionStory: TRANSLATIONS.ru.regionStory
    });
    assert(!ruBlob.includes(phrase), `RU bez EN leak: "${phrase}"`);
}

if (failed) {
    console.error(`\n${failed} test(ów) nie przeszło`);
    process.exit(1);
}
console.log('\n✅ test-home-sections-i18n OK');
