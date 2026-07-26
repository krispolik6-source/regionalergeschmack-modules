/**
 * ETAP 29B – Regional Intelligence
 * Głos gospodarza regionu (nie chatbot / nie AI Assistant).
 * DE / EN / PL / MK + EN fallback w translations.js
 */

/** @type {Record<string, object>} */
export const REGIONAL_INTEL_I18N = Object.freeze({
    de: {
        home: {
            regionalIntelLabel: 'Gastgeber der Region'
        },
        regionalIntel: {
            tips: {
                visitApiary: {
                    headline: 'Heute lohnt ein Besuch bei der Imkerei.',
                    support: 'Das Wetter lädt zum Spaziergang ein, und frischer Honig ist am Morgen angekommen.'
                },
                morningBakery: {
                    headline: 'Am Morgen lohnt ein Blick in die Bäckerei.',
                    support: 'Das Brot ist frisch, und die Gegend ist noch ruhig.'
                },
                sundayMarket: {
                    headline: 'Sonntag schmeckt gut auf dem lokalen Markt.',
                    support: 'Saisonales Obst und Gemüse erscheinen meist vor dem Mittag.'
                },
                rainWarmBread: {
                    headline: 'Bei Regen schmeckt warmes Brot besonders gut.',
                    support: 'Die Bäckereien der Region arbeiten bereits – ohne Eile.'
                },
                orchardWalk: {
                    headline: 'Ein Besuch im Obstgarten lohnt sich heute.',
                    support: 'Die Äpfel reifen, und die Luft ist mild für einen Spaziergang.'
                },
                summerBerries: {
                    headline: 'Heute passen frische Beeren vom Hof.',
                    support: 'Der Sommer begünstigt die Ernte – saisonale Frucht ist in der Nähe.'
                },
                eveningHof: {
                    headline: 'Der Abend lädt zu einem ruhigen Hofbesuch ein.',
                    support: 'Das Licht ist weich, und viele Hofläden sind noch geöffnet.'
                },
                middayFreshArrivals: {
                    headline: 'Zur Mittagszeit lohnt ein Blick in den Hofladen.',
                    support: 'Vieles ist gerade frisch vom Feld angekommen.'
                },
                coolHoneyComfort: {
                    headline: 'Bei der Kühle passt lokaler Honig.',
                    support: 'Ein einfacher Geschmack aus der Nachbarschaft – ruhig und ohne Werbung.'
                },
                springBlossom: {
                    headline: 'Frühling in der Region – ein guter Tag für einen Hofbesuch.',
                    support: 'Die Bäume blühen, und die Gegend zeigt ihre leichtere Seite.'
                },
                autumnHarvest: {
                    headline: 'Die Ernte läuft – regionale Vorräte warten.',
                    support: 'Äpfel, Wurzelgemüse und Hofware sind nah.'
                },
                winterCellar: {
                    headline: 'Im Winter bietet die Region schlichte Vorräte.',
                    support: 'Kohl, Kartoffeln und lokale Vorräte – ruhig und nah.'
                },
                afternoonCheese: {
                    headline: 'Am Nachmittag passt frischer Hofkäse.',
                    support: 'Eine ruhige Zeit für einen kurzen Besuch ohne Gedränge.'
                },
                quietNight: {
                    headline: 'Die Region wird ruhig.',
                    support: 'Morgen früh duftet es wieder nach frischem Brot.'
                },
                hostDefault: {
                    headline: 'Willkommen in der Region.',
                    support: 'In der Nähe warten ruhige, lokale Orte.'
                }
            }
        }
    },
    en: {
        home: {
            regionalIntelLabel: 'Host of the region'
        },
        regionalIntel: {
            tips: {
                visitApiary: {
                    headline: 'Today is a good day to visit the apiary.',
                    support: 'The weather suits a walk, and fresh honey arrived this morning.'
                },
                morningBakery: {
                    headline: 'This morning is a good time for the bakery.',
                    support: 'The bread is fresh, and the area is still quiet.'
                },
                sundayMarket: {
                    headline: 'Sunday tastes good at the local market.',
                    support: 'Seasonal fruit and vegetables usually appear before midday.'
                },
                rainWarmBread: {
                    headline: 'In the rain, warm bread tastes especially good.',
                    support: 'Regional bakeries are already at work — no rush.'
                },
                orchardWalk: {
                    headline: 'A visit to the orchard is worthwhile today.',
                    support: 'Apples are ripening, and the air is mild for a walk.'
                },
                summerBerries: {
                    headline: 'Today fresh berries from the farm fit well.',
                    support: 'Summer favours the harvest — seasonal fruit is nearby.'
                },
                eveningHof: {
                    headline: 'The evening invites a calm visit to a farm.',
                    support: 'The light is soft, and many farm shops are still open.'
                },
                middayFreshArrivals: {
                    headline: 'Around midday the farm shop is worth a look.',
                    support: 'Much has just arrived fresh from the field.'
                },
                coolHoneyComfort: {
                    headline: 'In the cool air, local honey fits well.',
                    support: 'A simple taste from nearby — calm, with no sales pitch.'
                },
                springBlossom: {
                    headline: 'Spring in the region — a good day for a farm visit.',
                    support: 'The trees are in blossom, and the area shows its lighter side.'
                },
                autumnHarvest: {
                    headline: 'Harvest is under way — regional stores await.',
                    support: 'Apples, roots and farm goods are close by.'
                },
                winterCellar: {
                    headline: 'In winter the region offers simple stores.',
                    support: 'Cabbage, potatoes and local provisions — calm and near.'
                },
                afternoonCheese: {
                    headline: 'In the afternoon, fresh farm cheese fits well.',
                    support: 'A quiet time for a short visit without the crowd.'
                },
                quietNight: {
                    headline: 'The region grows quiet.',
                    support: 'Tomorrow morning it will smell of fresh bread again.'
                },
                hostDefault: {
                    headline: 'Welcome to the region.',
                    support: 'Nearby, calm local places await.'
                }
            }
        }
    },
    pl: {
        home: {
            regionalIntelLabel: 'Gospodarz regionu'
        },
        regionalIntel: {
            tips: {
                visitApiary: {
                    headline: 'Dzisiaj warto odwiedzić pasiekę.',
                    support: 'Pogoda sprzyja spacerowi, a świeży miód pojawił się rano.'
                },
                morningBakery: {
                    headline: 'Dziś rano warto zajrzeć do piekarni.',
                    support: 'Chleb jest świeży, a okolica jeszcze spokojna.'
                },
                sundayMarket: {
                    headline: 'Niedziela dobrze smakuje na lokalnym targu.',
                    support: 'Sezonowe warzywa i owoce pojawiają się zwykle przed południem.'
                },
                rainWarmBread: {
                    headline: 'Przy deszczu dobrze smakuje ciepły chleb.',
                    support: 'Piekarnie w regionie już pracują — bez pośpiechu.'
                },
                orchardWalk: {
                    headline: 'Warto zajrzeć do sadu.',
                    support: 'Jabłka dojrzewają, a powietrze jest łagodne na spacer.'
                },
                summerBerries: {
                    headline: 'Dziś pasują świeże jagody z gospodarstwa.',
                    support: 'Lato sprzyja zbiorom — w okolicy pojawia się sezonowy owoc.'
                },
                eveningHof: {
                    headline: 'Wieczór zaprasza na spokojną wizytę w gospodarstwie.',
                    support: 'Światło jest miękkie, a sklepiki często jeszcze otwarte.'
                },
                middayFreshArrivals: {
                    headline: 'W południe warto zajrzeć do sklepiku gospodarskiego.',
                    support: 'Wiele produktów właśnie nadeszło z pola.'
                },
                coolHoneyComfort: {
                    headline: 'Przy chłodzie pasuje lokalny miód.',
                    support: 'Prosty smak z sąsiedztwa — bez pośpiechu i bez reklamy.'
                },
                springBlossom: {
                    headline: 'Wiosna w regionie — dobry dzień na wizytę w gospodarstwie.',
                    support: 'Drzewa kwitną, a okolica pokazuje lżejszą stronę.'
                },
                autumnHarvest: {
                    headline: 'Trwa zbiór — warto zajrzeć po regionalne zapasy.',
                    support: 'Jabłka, korzenie i towar z gospodarstw czekają blisko.'
                },
                winterCellar: {
                    headline: 'Zimą region oferuje proste zapasy z piwnicy.',
                    support: 'Kapusta, ziemniaki i lokalne przetwory — spokojnie i blisko.'
                },
                afternoonCheese: {
                    headline: 'Po południu pasuje świeży ser z gospodarstwa.',
                    support: 'Spokojna pora na krótką wizytę bez tłoku.'
                },
                quietNight: {
                    headline: 'Region już cichnie.',
                    support: 'Jutro rano znów będzie pachniało świeżym chlebem.'
                },
                hostDefault: {
                    headline: 'Witaj w regionie.',
                    support: 'W pobliżu czekają spokojne, lokalne miejsca.'
                }
            }
        }
    },
    mk: {
        home: {
            regionalIntelLabel: 'Домаќин на регионот'
        },
        regionalIntel: {
            tips: {
                visitApiary: {
                    headline: 'Денес вреди да се посети пчеларникот.',
                    support: 'Времето одговара за прошетка, а свеж мед пристигна наутро.'
                },
                morningBakery: {
                    headline: 'Утрово вреди поглед во пекарницата.',
                    support: 'Лебот е свеж, а околината сè уште е мирна.'
                },
                sundayMarket: {
                    headline: 'Недела добро се чувствува на локалниот пазар.',
                    support: 'Сезонски плодови и зеленчук обично се појавуваат пред пладне.'
                },
                rainWarmBread: {
                    headline: 'При дожд особено пасува топол леб.',
                    support: 'Пекарниците во регионот веќе работат — без брзање.'
                },
                orchardWalk: {
                    headline: 'Денес вреди посета во овоштарницата.',
                    support: 'Јаболките зреат, а воздухот е благ за прошетка.'
                },
                summerBerries: {
                    headline: 'Денес пасуваат свежи бобинки од дворот.',
                    support: 'Летото ја потпомага бербата — сезонски плод е блиску.'
                },
                eveningHof: {
                    headline: 'Вечерва повикува на мирна посета на стопанство.',
                    support: 'Светлината е мека, а многу дворски продавници сè уште се отворени.'
                },
                middayFreshArrivals: {
                    headline: 'Напладне вреди поглед во дворската продавница.',
                    support: 'Многу штотуку пристигна свежо од полето.'
                },
                coolHoneyComfort: {
                    headline: 'При студенило пасува локален мед.',
                    support: 'Едноставен вкус од соседството — мирно, без реклама.'
                },
                springBlossom: {
                    headline: 'Пролет во регионот — добар ден за посета на стопанство.',
                    support: 'Дрвјата цутат, а околината ја покажува полесната страна.'
                },
                autumnHarvest: {
                    headline: 'Бербата е во тек — регионални залихи чекаат.',
                    support: 'Јаболки, корења и дворска стока се блиску.'
                },
                winterCellar: {
                    headline: 'Зиме регионот нуди едноставни залихи.',
                    support: 'Зелка, компири и локални производи — мирно и блиску.'
                },
                afternoonCheese: {
                    headline: 'Попладне пасува свежо дворско сирење.',
                    support: 'Мирно време за кратка посета без гужва.'
                },
                quietNight: {
                    headline: 'Регионот стивнува.',
                    support: 'Утре наутро пак ќе мириса на свеж леб.'
                },
                hostDefault: {
                    headline: 'Добредојде во регионот.',
                    support: 'Во близина чекаат мирни, локални места.'
                }
            }
        }
    }
});
