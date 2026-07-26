/**
 * ETAP 13C – Inteligentne Polecenia („Polecamy dzisiaj”)
 * DE/EN/PL/MK + EN fallback
 */

/** @type {Record<string, object>} */
export const SMART_TODAY_I18N = Object.freeze({
    de: {
        home: {
            smartTodayTitle: 'Heute empfohlen',
            smartTodaySub: 'Passend zu Wetter, Tageszeit und Saison – in deiner Nähe.'
        },
        smartToday: {
            reason: {
                rain: 'Regen – frisches Brot und eine warme Suppe.',
                hot: 'Heiß – etwas Erfrischendes aus der Region.',
                autumn: 'Herbst – Äpfel, Gemüse und herzhafte Küche.',
                cold: 'Kalt – Wärmendes vom Hof und aus der Küche.',
                morning: 'Morgen – frische Backwaren und Frühstück vom Hof.',
                evening: 'Abend – regionale Gerichte und herzhafte Produkte.',
                spring: 'Frühling – Leichtes und Frisches aus der Region.',
                summer: 'Sommer – Beeren, Säfte und Kühles vom Hof.',
                fresh: 'Frisch und regional – was heute gut passt.'
            },
            product: {
                soup: 'Saisonale Suppe',
                strawberries: 'Erdbeeren',
                juice: 'Direktsaft',
                'soft-drink': 'Erfrischungsgetränk',
                vegetables: 'Gemüse der Saison',
                pastries: 'Frisches Gebäck'
            }
        }
    },
    en: {
        home: {
            smartTodayTitle: 'Recommended today',
            smartTodaySub: 'Matched to weather, time of day and season – near you.'
        },
        smartToday: {
            reason: {
                rain: 'Rain – fresh bread and a warm soup.',
                hot: 'Hot – something refreshing from the region.',
                autumn: 'Autumn – apples, vegetables and hearty cooking.',
                cold: 'Cold – warming food from farm and kitchen.',
                morning: 'Morning – fresh bakery and farm breakfast.',
                evening: 'Evening – regional dishes and savoury products.',
                spring: 'Spring – light and fresh from the region.',
                summer: 'Summer – berries, juices and cool farm treats.',
                fresh: 'Fresh and local – what fits today.'
            },
            product: {
                soup: 'Seasonal soup',
                strawberries: 'Strawberries',
                juice: 'Fresh juice',
                'soft-drink': 'Soft drink',
                vegetables: 'Seasonal vegetables',
                pastries: 'Fresh pastries'
            }
        }
    },
    pl: {
        home: {
            smartTodayTitle: 'Polecamy dzisiaj',
            smartTodaySub: 'Dopasowane do pogody, pory dnia i sezonu – w Twojej okolicy.'
        },
        smartToday: {
            reason: {
                rain: 'Deszcz – świeży chleb i ciepła zupa.',
                hot: 'Gorąco – coś orzeźwiającego z regionu.',
                autumn: 'Jesień – jabłka, warzywa i solidna kuchnia.',
                cold: 'Zimno – coś rozgrzewającego z gospodarstwa i kuchni.',
                morning: 'Poranek – świeże pieczywo i śniadanie z gospodarstwa.',
                evening: 'Wieczór – dania regionalne i wytrawne produkty.',
                spring: 'Wiosna – lekko i świeżo z regionu.',
                summer: 'Lato – owoce, soki i orzeźwienie z gospodarstwa.',
                fresh: 'Świeżo i lokalnie – to, co pasuje dziś.'
            },
            product: {
                soup: 'Zupa sezonowa',
                strawberries: 'Truskawki',
                juice: 'Sok tłoczony',
                'soft-drink': 'Napój orzeźwiający',
                vegetables: 'Warzywa sezonowe',
                pastries: 'Świeże wypieki'
            }
        }
    },
    mk: {
        home: {
            smartTodayTitle: 'Препорачуваме денес',
            smartTodaySub: 'Според времето, делот од денот и сезоната – во близина.'
        },
        smartToday: {
            reason: {
                rain: 'Дожд – свеж леб и топла супа.',
                hot: 'Топло – нешто освежувачко од регионот.',
                autumn: 'Есен – јаболка, зеленчук и цврста кујна.',
                cold: 'Студено – нешто што загрева од фарма и кујна.',
                morning: 'Утро – свежо печиво и појадок од фарма.',
                evening: 'Вечер – регионални јадења и солени производи.',
                spring: 'Пролет – лесно и свежо од регионот.',
                summer: 'Лето – бобинки, сокови и освежување од фарма.',
                fresh: 'Свежо и локално – она што одговара денес.'
            },
            product: {
                soup: 'Сезонска супа',
                strawberries: 'Јагоди',
                juice: 'Свеж сок',
                'soft-drink': 'Освежителен пијалок',
                vegetables: 'Сезонски зеленчук',
                pastries: 'Свежо печиво'
            }
        }
    }
});
