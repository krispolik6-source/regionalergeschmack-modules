/**
 * ETAP 16 – Cyfrowa Dusza Regionu
 * Głos lokalnego gospodarza (nie chatbot). DE/EN/PL/MK + EN fallback.
 */

/** @type {Record<string, object>} */
export const REGION_SOUL_I18N = Object.freeze({
    de: {
        home: {
            regionSoulLabel: 'Die Region spricht',
            regionSoulHint: 'Guten Tag vom Gastgeber der Region.'
        },
        regionSoul: {
            morningFreshBread: 'Der Morgen riecht heute nach frischem Brot. Die Bäckereien arbeiten schon.',
            morningHoneyLight: 'Das Licht ist weich – ein guter Moment für Honig vom Hof.',
            orchardFirstApples: 'In den Obstgärten reifen die ersten Äpfel. Ein guter Zeitpunkt für einen Besuch.',
            beesFairWeather: 'Das Wetter heute begünstigt die Bienen. Lokaler Honig ist besonders empfehlenswert.',
            eveningCheeseHoney: 'Am Abend lohnt ein Besuch bei Höfen mit Käse und Honig.',
            eveningFarmWalk: 'Der Abend lädt zu einem ruhigen Gang zu den Höfen ein.',
            middayHofTables: 'Zur Mittagszeit lohnt ein Blick in die Hofläden – vieles ist frisch angekommen.',
            rainWarmKitchen: 'Bei dem Regen duftet es nach warmem Brot und einfacher Küche.',
            coldHoneyComfort: 'Bei der Kühle passt ein Glas Honig aus der Nachbarschaft besonders gut.',
            springBlossom: 'Die Obstbäume blühen – die Region zeigt sich von ihrer leichten Seite.',
            summerBerries: 'Beerenzeit: an den Sträuchern färbt sich schon die Ernte.',
            autumnHarvest: 'Die Ernte ist im Gang – Äpfel, Wurzelgemüse und Hofware warten.',
            winterRootCellar: 'Im Winterkeller liegen regionale Vorräte – schlicht und nah.',
            afternoonCheese: 'Am Nachmittag liegt frischer Hofkäse bereit.',
            nightQuietRegion: 'Die Region wird ruhig – morgen früh duftet es wieder nach Brot.',
            hostDefault: 'Willkommen in der Region – frische Betriebe warten in deiner Nähe.'
        }
    },
    en: {
        home: {
            regionSoulLabel: 'The region speaks',
            regionSoulHint: 'Good day from the host of the region.'
        },
        regionSoul: {
            morningFreshBread: 'The morning smells of fresh bread today. The bakeries are already at work.',
            morningHoneyLight: 'The light is soft – a good moment for honey from the farm.',
            orchardFirstApples: 'In the orchards the first apples are ripening. A good time to visit.',
            beesFairWeather: 'Today\'s weather suits the bees. Local honeys are especially worth trying.',
            eveningCheeseHoney: 'In the evening it is worth visiting farms with cheese and honey.',
            eveningFarmWalk: 'The evening invites a quiet walk to the farms.',
            middayHofTables: 'Around midday the farm shops are worth a look – much has just arrived.',
            rainWarmKitchen: 'In this rain it smells of warm bread and simple cooking.',
            coldHoneyComfort: 'In the cool air a jar of honey from nearby fits especially well.',
            springBlossom: 'The fruit trees are in blossom – the region shows its lighter side.',
            summerBerries: 'Berry time: the harvest is already colouring on the bushes.',
            autumnHarvest: 'Harvest is under way – apples, roots and farm goods await.',
            winterRootCellar: 'In the winter cellar regional stores wait – simple and close by.',
            afternoonCheese: 'In the afternoon fresh farm cheese is ready.',
            nightQuietRegion: 'The region grows quiet – tomorrow morning it will smell of bread again.',
            hostDefault: 'Welcome to the region – fresh places await nearby.'
        }
    },
    pl: {
        home: {
            regionSoulLabel: 'Region przemawia',
            regionSoulHint: 'Dzień dobry od gospodarza regionu.'
        },
        regionSoul: {
            morningFreshBread: 'Poranek pachnie dziś świeżym chlebem. Piekarnie już pracują.',
            morningHoneyLight: 'Światło jest miękkie – dobry moment na miód z gospodarstwa.',
            orchardFirstApples: 'W sadach dojrzewają pierwsze jabłka. To dobry moment na wizytę.',
            beesFairWeather: 'Dzisiejsza pogoda sprzyja pszczołom. Lokalne miody są szczególnie polecane.',
            eveningCheeseHoney: 'Wieczorem warto odwiedzić gospodarstwa z serami i miodem.',
            eveningFarmWalk: 'Wieczór zaprasza na spokojny spacer do gospodarstw.',
            middayHofTables: 'W południe warto zajrzeć do sklepików gospodarskich – dużo właśnie nadeszło.',
            rainWarmKitchen: 'Przy tym deszczu pachnie ciepłym chlebem i prostą kuchnią.',
            coldHoneyComfort: 'Przy chłodzie szczególnie pasuje słoik miodu z sąsiedztwa.',
            springBlossom: 'Drzewa owocowe kwitną – region pokazuje swoją lżejszą stronę.',
            summerBerries: 'Czas jagód: na krzewach już nabiera barwy zbiór.',
            autumnHarvest: 'Trwa zbiór – jabłka, korzenie i towar z gospodarstw czekają.',
            winterRootCellar: 'W zimowej piwnicy leżą regionalne zapasy – prosto i blisko.',
            afternoonCheese: 'Po południu czeka świeży ser z gospodarstwa.',
            nightQuietRegion: 'Region cichnie – jutro rano znów będzie pachniało chlebem.',
            hostDefault: 'Witaj w regionie – w pobliżu czekają świeże miejsca.'
        }
    },
    mk: {
        home: {
            regionSoulLabel: 'Регионот зборува',
            regionSoulHint: 'Добар ден од домаќинот на регионот.'
        },
        regionSoul: {
            morningFreshBread: 'Утрото денес мириса на свеж леб. Пекарниците веќе работат.',
            morningHoneyLight: 'Светлината е мека – добар момент за мед од дворот.',
            orchardFirstApples: 'Во овоштарниците зреат првите јаболки. Добар момент за посета.',
            beesFairWeather: 'Денешното време им одговара на пчелите. Локалните медови се особено препорачливи.',
            eveningCheeseHoney: 'Навечер вреди да се посетат стопанства со сирења и мед.',
            eveningFarmWalk: 'Вечерва повикува на мирен од до дворските стопанства.',
            middayHofTables: 'Напладне вреди поглед во дворските продавници – многу штотуку стигна.',
            rainWarmKitchen: 'При овој дожд мириса на топол леб и едноставна кујна.',
            coldHoneyComfort: 'При студенило особено пасува тегла мед од соседството.',
            springBlossom: 'Овошките цутат – регионот ја покажува полесната страна.',
            summerBerries: 'Време на бобинки: на грмушките веќе се бои бербата.',
            autumnHarvest: 'Бербата е во тек – јаболки, корења и дворска стока чекаат.',
            winterRootCellar: 'Во зимскиот подрум лежат регионални залихи – едноставно и блиску.',
            afternoonCheese: 'Попладне чека свежо дворско сирење.',
            nightQuietRegion: 'Регионот стивнува – утре наутро пак ќе мириса на леб.',
            hostDefault: 'Добредојде во регионот – во близина чекаат свежи места.'
        }
    }
});
