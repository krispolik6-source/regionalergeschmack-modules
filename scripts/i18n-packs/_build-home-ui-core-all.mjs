/**
 * One-off builder for home-ui-core-all.mjs
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'home-ui-core-all.mjs');

const FEAT = {
    'feat-apples': {
        de: ['Bio-Äpfel', 'Frisch vom Hof Müller – knackig und regional.'],
        pl: ['Jabłka bio', 'Prosto z Hof Müller – chrupiące i regionalne.']
    },
    'feat-bread': {
        de: ['Bauernbrot', 'Sauerteigbrot aus der Bäckerei Schmidt.'],
        pl: ['Chleb wiejski', 'Na zakwasie z Bäckerei Schmidt.']
    },
    'feat-cheese': {
        de: ['Regionaler Käse', 'Reifung über dem Rhein – mild und aromatisch.'],
        pl: ['Ser regionalny', 'Dojrzewający nad Renem – łagodny i aromatyczny.']
    },
    'feat-sausage': {
        de: ['Hausmacherwurst', 'Nach Familienrezept von Metzgerei Berg.'],
        pl: ['Kiełbasa domowa', 'Według rodzinnej receptury Metzgerei Berg.']
    },
    'feat-honey': {
        de: ['Blütenhonig', 'Von der Imkerei Sonne aus der Rheinebene.'],
        pl: ['Miód kwiatowy', 'Z Imkerei Sonne z Niziny Nadreńskiej.']
    },
    'feat-yogurt': {
        de: ['Naturjoghurt', 'Mild und cremig – ohne Zusatzstoffe.'],
        pl: ['Jogurt naturalny', 'Łagodny i kremowy – bez dodatków.']
    },
    'feat-eggs': {
        de: ['Freilandeier', 'Von Hühnern mit Auslauf auf dem Hof Müller.'],
        pl: ['Jaja od kur z wolnego wybiegu', 'Z Hof Müller – kury z dostępem do wybiegów.']
    },
    'feat-daily': {
        de: ['Tagesgericht', 'Saisonal zubereitet im Gasthof Eifelblick.'],
        pl: ['Danie dnia', 'Sezonowe danie w Gasthof Eifelblick.']
    }
};

function featured(lang, items) {
    const out = {};
    for (const [id, [name, desc]] of Object.entries(items)) {
        out[id] = { name, desc };
    }
    return out;
}

/** @type {Record<string, object>} */
const PACKS = {
    ru: {
        home: {
            greeting: 'Добрый день! 👋',
            welcomeBack: '👋 С возвращением',
            greetingSub: 'Здесь начинается ваш путь по региону.',
            surpriseMe: 'Удиви меня',
            surpriseNone: 'Поблизости сейчас ничего подходящего.',
            surpriseFallbackName: 'место',
            surpriseNearby: 'Вам может понравиться: {name}',
            surpriseFavorite: 'Из избранного: {name}',
            surpriseTaste: 'Вам подойдёт: {name}',
            surpriseFresh: 'Свежее: {name}',
            nearbyTitle: 'Ближе всего к вам',
            forYouTitle: 'Рекомендуем для вас',
            recentTitle: 'Недавно просмотренные',
            seasonalTitle: 'Сезонные продукты',
            quickFilters: 'Быстрые фильтры',
            quickOpen: 'Открыто сейчас',
            quickVerified: 'Проверенные',
            quickNear5: 'В радиусе 5 км',
            quickBio: 'Органика (BIO)',
            statusOpen: 'Открыто',
            statusClosed: 'Закрыто',
            closesAt: 'закрывается в {time}',
            opensAt: 'открывается в {time}',
            opensTomorrow: 'откроется завтра в {time}',
            seeAll: 'Смотреть все →',
            searchSubmit: 'Поиск',
            categoryCount: '{count} мест',
            motto: 'Покупайте местное, поддерживайте региональных производителей и наслаждайтесь лучшим качеством.',
            hubLabel: 'Поиск и быстрый доступ',
            chipsLabel: 'Быстрые фильтры',
            premiumTeaser: 'Эксклюзивные возможности для местных открытий',
            categoriesTitle: 'Категории',
            allCategories: 'Все категории',
            categoryActionsLabel: 'Быстрые фильтры категорий',
            smartTodaySub: 'С учётом погоды, времени суток и сезона — рядом с вами.',
            tasteAdvisorSub: 'Личные заметки из вашего региона.',
            tastesOfDaySub: 'Что сегодня подходит из региона.',
            chip: { products: 'Продукты', restaurants: 'Рестораны', shops: 'Магазины', farmers: 'Фермеры', favorites: 'Избранное' },
            featuredItems: featured('ru', {
                'feat-apples': ['Яблоки органические', 'Свежие с Hof Müller – хрустящие и местные.'],
                'feat-bread': ['Деревенский хлеб', 'На закваске из Bäckerei Schmidt.'],
                'feat-cheese': ['Региональный сыр', 'Выдержка у Рейна – мягкий и ароматный.'],
                'feat-sausage': ['Домашняя колбаса', 'Семейный рецепт Metzgerei Berg.'],
                'feat-honey': ['Цветочный мёд', 'От Imkerei Sonne из Рейнской равнины.'],
                'feat-yogurt': ['Натуральный йогурт', 'Мягкий и сливочный – без добавок.'],
                'feat-eggs': ['Яйца свободного выгула', 'От кур с выгулом на Hof Müller.'],
                'feat-daily': ['Блюдо дня', 'Сезонная кухня в Gasthof Eifelblick.']
            })
        },
        smartToday: {
            reason: {
                rain: 'Дождь – свежий хлеб и тёплый суп.',
                hot: 'Жарко – что-то освежающее из региона.',
                autumn: 'Осень – яблоки, овощи и сытная кухня.',
                cold: 'Холодно – согревающее с хозяйства и из кухни.',
                morning: 'Утро – свежая выпечка и завтрак с фермы.',
                evening: 'Вечер – региональные блюда и сытные продукты.',
                spring: 'Весна – лёгкое и свежее из региона.',
                summer: 'Лето – ягоды, соки и прохлада с хозяйства.',
                fresh: 'Свежее и местное – что подходит сегодня.'
            },
            product: {
                soup: 'Сезонный суп',
                strawberries: 'Клубника',
                juice: 'Свежий сок',
                'soft-drink': 'Освежающий напиток',
                vegetables: 'Сезонные овощи',
                pastries: 'Свежая выпечка'
            }
        },
        tasteAdvisor: {
            helloNamed: 'Добрый день, {name}.',
            honeyVisit: 'Поблизости есть свежий мёд от {place} – вы были там {when}.',
            bakeryFresh: '{place} только что вынула первые буханки из печи.',
            bikeRoute: 'Погода располагает к велопрогулке – мы подготовили маршрут через {count} местных хозяйств.',
            freshLocal: 'Рядом снова ждёт свежее из мест, которые вам нравятся.',
            when: { lastMonth: 'в прошлом месяце', weeksAgo: 'несколько недель назад', recently: 'недавно' },
            ctaBakery: 'Открыть пекарню',
            ctaExplore: 'Исследовать регион'
        },
        tastesOfDay: {
            honeyFairWeather: 'Сегодня хороший день для свежего мёда – пчёлы трудились в хорошую погоду.',
            honeyCoolDay: 'В такую погоду банка регионального мёда особенно к месту.',
            strawberriesIdeal: 'Идеальный день для свежей клубники.',
            cheeseEvening: 'Вечером рекомендуем местные сыры.',
            breadMorning: 'Утром в пекарнях пахнет свежим хлебом.',
            applesCrisp: 'Хрустящие яблоки из региона – сегодня особенно хороши.',
            yogurtHotDay: 'В тепло хорошо подходит свежий фермерский йогурт.',
            soupRain: 'В дождь сезонный суп из трактира согреет.',
            eggsMorning: 'Свежие яйца с хозяйства – хорошее начало дня.',
            juiceSummer: 'Прохладный региональный сок подходит к летней погоде.',
            sausageAfternoon: 'Региональная колбаса от мясника – сегодня свежо нарезана.',
            vegetablesFresh: 'Свежие овощи с поля – короткий путь и хруст.',
            pastriesRain: 'В сырую погоду тёплая выпечка из пекарни как нельзя кстати.',
            cheeseMildDay: 'Сегодня между делом хорошо подойдёт кусочек фермерского сыра.'
        },
        livingMap: {
            closingSoon: 'Закроется примерно через час',
            justOpened: 'Только что открылось',
            freshOpen: 'Свежее открытие',
            popular: 'Популярно сегодня',
            freshDelivery: 'Свежая поставка'
        },
        seasonal: {
            'season-strawberry': 'Клубника',
            'season-asparagus': 'Спаржа',
            'season-radish': 'Редис',
            'season-tomato': 'Помидоры',
            'season-blueberry': 'Черника',
            'season-raspberry': 'Малина',
            'season-apple': 'Яблоки',
            'season-potato': 'Картофель',
            'season-pumpkin': 'Тыква',
            'season-mushroom': 'Грибы',
            'season-beet': 'Свёкла',
            'season-cabbage': 'Капуста'
        },
        search: {
            emptyCta: 'Открыть карту',
            noResultsFor: 'Нет результатов для запроса «{query}»'
        }
    }
};

// Import remaining languages from data file
import { PACKS_REST } from './_home-ui-core-packs-rest.mjs';
Object.assign(PACKS, PACKS_REST);

const header = `/**
 * Home UI core locale packs – greeting, seasonal, featured, recommendation modules.
 */
export const LOCALE_PACKS = `;

writeFileSync(OUT, `${header}${JSON.stringify(PACKS, null, 4)};\n`, 'utf8');
console.log('Wrote', OUT, 'languages:', Object.keys(PACKS).length);
