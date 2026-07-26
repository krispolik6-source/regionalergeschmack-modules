/**
 * ETAP 14 – Osobisty Doradca Smaku
 * DE/EN/PL/MK + EN fallback
 */

/** @type {Record<string, object>} */
export const TASTE_ADVISOR_I18N = Object.freeze({
    de: {
        home: {
            tasteAdvisorTitle: 'Dein Geschmacksberater',
            tasteAdvisorSub: 'Persönliche Hinweise aus deiner Region.'
        },
        tasteAdvisor: {
            hello: 'Guten Tag.',
            helloNamed: 'Guten Tag, {name}.',
            honeyVisit: 'In der Nähe gibt es heute frischen Honig von {place} – dort warst du {when}.',
            bakeryFresh: '{place} hat gerade die ersten Brote aus dem Ofen geholt.',
            bikeRoute: 'Das Wetter lädt zur Radtour ein – wir haben eine Route durch {count} lokale Höfe vorbereitet.',
            freshLocal: 'In deiner Nähe wartet wieder Frisches von Betrieben, die du magst.',
            when: {
                lastMonth: 'letzten Monat',
                weeksAgo: 'vor einigen Wochen',
                recently: 'kürzlich'
            },
            ctaHoney: 'Zur Imkerei',
            ctaBakery: 'Zur Bäckerei',
            ctaRoute: 'Route öffnen',
            ctaExplore: 'Region entdecken'
        }
    },
    en: {
        home: {
            tasteAdvisorTitle: 'Your taste advisor',
            tasteAdvisorSub: 'Personal notes from your region.'
        },
        tasteAdvisor: {
            hello: 'Good day.',
            helloNamed: 'Good day, {name}.',
            honeyVisit: 'Nearby there is fresh honey from {place} – a place you visited {when}.',
            bakeryFresh: '{place} has just taken the first loaves out of the oven.',
            bikeRoute: 'The weather suits a bike ride – we prepared a route through {count} local farms.',
            freshLocal: 'Nearby, fresh goods await from places you like.',
            when: {
                lastMonth: 'last month',
                weeksAgo: 'a few weeks ago',
                recently: 'recently'
            },
            ctaHoney: 'Open the apiary',
            ctaBakery: 'Open the bakery',
            ctaRoute: 'Open the route',
            ctaExplore: 'Explore the region'
        }
    },
    pl: {
        home: {
            tasteAdvisorTitle: 'Twój doradca smaku',
            tasteAdvisorSub: 'Osobiste wskazówki z Twojego regionu.'
        },
        tasteAdvisor: {
            hello: 'Dzień dobry.',
            helloNamed: 'Dzień dobry, {name}.',
            honeyVisit: 'Dzisiaj w pobliżu pojawił się świeży miód z pasieki {place}, którą odwiedzałeś {when}.',
            bakeryFresh: '{place} właśnie wyjęła pierwsze chleby z pieca.',
            bikeRoute: 'Pogoda sprzyja wycieczce rowerowej – przygotowaliśmy trasę przez {count} lokalne gospodarstwa.',
            freshLocal: 'W pobliżu znów czeka coś świeżego z miejsc, które lubisz.',
            when: {
                lastMonth: 'w zeszłym miesiącu',
                weeksAgo: 'kilka tygodni temu',
                recently: 'niedawno'
            },
            ctaHoney: 'Otwórz pasiekę',
            ctaBakery: 'Otwórz piekarnię',
            ctaRoute: 'Otwórz trasę',
            ctaExplore: 'Odkryj region'
        }
    },
    mk: {
        home: {
            tasteAdvisorTitle: 'Твој советник за вкус',
            tasteAdvisorSub: 'Лични совети од твојот регион.'
        },
        tasteAdvisor: {
            hello: 'Добар ден.',
            helloNamed: 'Добар ден, {name}.',
            honeyVisit: 'Денес во близина има свеж мед од {place} – место што го посети {when}.',
            bakeryFresh: '{place} токму ги извади првите лебови од печката.',
            bikeRoute: 'Времето одговара за велосипедска тура – подготвивме рута низ {count} локални фарми.',
            freshLocal: 'Во близина повторно чека свежо од места што ги сакаш.',
            when: {
                lastMonth: 'минатиот месец',
                weeksAgo: 'пред неколку недели',
                recently: 'недавно'
            },
            ctaHoney: 'Отвори пасека',
            ctaBakery: 'Отвори пекара',
            ctaRoute: 'Отвори рута',
            ctaExplore: 'Откриј го регионот'
        }
    }
});
