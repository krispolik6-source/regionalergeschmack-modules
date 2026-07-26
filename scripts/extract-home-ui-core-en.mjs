/**
 * Wyciąga strukturę EN dla home-ui-core (klucze z EN fallback na RU).
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TRANSLATIONS } from '../js/translations.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function pick(obj, paths) {
    const out = {};
    for (const path of paths) {
        const val = path.split('.').reduce((a, p) => a?.[p], obj);
        if (val === undefined) continue;
        const parts = path.split('.');
        let cur = out;
        for (let i = 0; i < parts.length - 1; i++) {
            cur[parts[i]] = cur[parts[i]] || {};
            cur = cur[parts[i]];
        }
        cur[parts[parts.length - 1]] = val;
    }
    return out;
}

const PREFIXES = [
    'home.greeting', 'home.welcomeBack', 'home.greetingSub', 'home.surpriseMe', 'home.surpriseNone',
    'home.surpriseFallbackName', 'home.surpriseNearby', 'home.surpriseFavorite', 'home.surpriseTaste',
    'home.surpriseFresh', 'home.nearbyTitle', 'home.forYouTitle', 'home.recentTitle', 'home.seasonalTitle',
    'home.quickFilters', 'home.quickOpen', 'home.quickVerified', 'home.quickNear5', 'home.quickBio',
    'home.statusOpen', 'home.statusClosed', 'home.closesAt', 'home.opensAt', 'home.opensTomorrow',
    'home.seeAll', 'home.searchSubmit', 'home.categoryCount', 'home.motto', 'home.hubLabel',
    'home.chipsLabel', 'home.premiumTeaser', 'home.categoriesTitle', 'home.allCategories',
    'home.categoryActionsLabel', 'home.smartTodaySub', 'home.tasteAdvisorSub', 'home.tastesOfDaySub',
    'home.chip.products', 'home.chip.restaurants', 'home.chip.shops', 'home.chip.farmers', 'home.chip.favorites',
    'home.featuredItems.feat-apples.name', 'home.featuredItems.feat-apples.desc',
    'home.featuredItems.feat-bread.name', 'home.featuredItems.feat-bread.desc',
    'home.featuredItems.feat-cheese.name', 'home.featuredItems.feat-cheese.desc',
    'home.featuredItems.feat-sausage.name', 'home.featuredItems.feat-sausage.desc',
    'home.featuredItems.feat-honey.name', 'home.featuredItems.feat-honey.desc',
    'home.featuredItems.feat-yogurt.name', 'home.featuredItems.feat-yogurt.desc',
    'home.featuredItems.feat-eggs.name', 'home.featuredItems.feat-eggs.desc',
    'home.featuredItems.feat-daily.name', 'home.featuredItems.feat-daily.desc',
    'smartToday.reason.rain', 'smartToday.reason.hot', 'smartToday.reason.autumn', 'smartToday.reason.cold',
    'smartToday.reason.morning', 'smartToday.reason.evening', 'smartToday.reason.spring', 'smartToday.reason.summer',
    'smartToday.reason.fresh', 'smartToday.product.soup', 'smartToday.product.strawberries', 'smartToday.product.juice',
    'smartToday.product.soft-drink', 'smartToday.product.vegetables', 'smartToday.product.pastries',
    'tasteAdvisor.helloNamed', 'tasteAdvisor.honeyVisit', 'tasteAdvisor.bakeryFresh', 'tasteAdvisor.bikeRoute',
    'tasteAdvisor.freshLocal', 'tasteAdvisor.when.lastMonth', 'tasteAdvisor.when.weeksAgo', 'tasteAdvisor.when.recently',
    'tasteAdvisor.ctaBakery', 'tasteAdvisor.ctaExplore',
    'tastesOfDay.honeyFairWeather', 'tastesOfDay.honeyCoolDay', 'tastesOfDay.strawberriesIdeal',
    'tastesOfDay.cheeseEvening', 'tastesOfDay.breadMorning', 'tastesOfDay.applesCrisp', 'tastesOfDay.yogurtHotDay',
    'tastesOfDay.soupRain', 'tastesOfDay.eggsMorning', 'tastesOfDay.juiceSummer', 'tastesOfDay.sausageAfternoon',
    'tastesOfDay.vegetablesFresh', 'tastesOfDay.pastriesRain', 'tastesOfDay.cheeseMildDay',
    'livingMap.closingSoon', 'livingMap.justOpened', 'livingMap.freshOpen', 'livingMap.popular', 'livingMap.freshDelivery',
    'seasonal.season-strawberry', 'seasonal.season-asparagus', 'seasonal.season-radish', 'seasonal.season-tomato',
    'seasonal.season-blueberry', 'seasonal.season-raspberry', 'seasonal.season-apple', 'seasonal.season-potato',
    'seasonal.season-pumpkin', 'seasonal.season-mushroom', 'seasonal.season-beet', 'seasonal.season-cabbage',
    'search.emptyCta', 'search.noResultsFor'
];

const en = TRANSLATIONS.en;
const structure = pick(en, PREFIXES);
writeFileSync(join(ROOT, 'scripts/i18n-packs/home-ui-core-en.json'), JSON.stringify(structure, null, 2));
console.log('Keys:', PREFIXES.length);
console.log('Wrote scripts/i18n-packs/home-ui-core-en.json');
