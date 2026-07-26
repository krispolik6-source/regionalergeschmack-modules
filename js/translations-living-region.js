/**
 * ETAP 15A – Living Region AI / Inteligencja regionalna
 * Naturalny język mieszkańców – bez reklamy i marketingu.
 * DE/EN/PL/MK natywnie; pozostałe → EN (deepMerge).
 */

/** @type {Record<string, object>} */
export const LIVING_REGION_I18N = Object.freeze({
    de: {
        home: {
            livingRegionTitle: 'Die Region lebt',
            livingRegionSub: 'Kurze Stimmen aus der Nachbarschaft.'
        },
        livingRegion: {
            morningBread: 'Heute früh backen die Bäckereien frisches Brot.',
            morningRolls: 'Warme Brötchen – der Duft liegt schon über dem Dorf.',
            middayFarmShop: 'Mittags lohnt ein Blick in die Hofläden – vieles ist gerade angekommen.',
            eveningApiary: 'Am Abend lohnt ein Besuch bei den Imkern.',
            eveningStrollHof: 'Der Abend lädt zu einem ruhigen Gang zu den Höfen ein.',
            nightQuietKitchen: 'In den Küchen wird noch leise für den morgen vorbereitet.',
            firstPlums: 'In den Obstgärten reifen die ersten Pflaumen.',
            firstApples: 'Die ersten Äpfel werden schwer an den Zweigen.',
            berryRipening: 'Beeren färben sich an den Sträuchern – die Saison ist da.',
            asparagusMorning: 'Morgens liegen die ersten Spargelstangen frisch vom Feld bereit.',
            pumpkinFields: 'Auf den Feldern leuchten die ersten Kürbisse.',
            winterRoots: 'Wurzelgemüse aus dem Winterfeld – schlicht und regional.',
            tomorrowMarketVeg: 'Morgen wird der lokale Markt besonders reich an Gemüse sein.',
            tomorrowMarketBread: 'Für morgen legen die Bäcker schon extra Brot zurück.',
            rainSoupDay: 'Bei dem Regen duftet es in den Gaststuben nach warmer Suppe.',
            rainWarmBread: 'Nasses Wetter – frisches Brot schmeckt jetzt besonders.',
            hotOrchardShade: 'Bei der Hitze ist es unter den Obstbäumen angenehm kühl.',
            coldHoneyTea: 'Bei der Kühle passt ein Glas Honig von nebenan.',
            springBlossomWalk: 'Die Obstbäume blühen – ein ruhiger Gang durch die Gärten lohnt sich.',
            cheeseAfternoon: 'Nachmittags liegt neuer Hofkäse in den Läden.',
            meatCounterFresh: 'Heute Morgen wurde an den Fleischtheken frisch aufgeschnitten.',
            automatEveningFill: 'Abends sind die Hofautomaten wieder aufgefüllt.',
            sundayMarketHint: 'Der Wochenmarkt füllt sich – Gemüse und Brot von hier.',
            honeyFlowPeak: 'Die Tracht läuft – die Imker holen gerade neuen Honig.',
            engineProducerOfDay: 'Heute lohnt ein Besuch bei {name}.',
            engineSeasonal: 'Saison gerade jetzt: {names}.',
            engineNewProducers: 'Neu in der Region: {count} Orte.',
            engineNewProducts: 'Neue Produkte in der Nähe ({count}).',
            engineOpenNow: 'Jetzt geöffnet: {count} Orte in der Nähe.',
            engineVisitDelta: 'Seit deinem letzten Besuch: {summary}.',
            engineVisitDeltaProducers: '{count} neue Orte',
            engineVisitDeltaPromos: '{count} neue Angebote',
            engineFallbackName: 'ein Hof in der Nähe'
        }
    },
    en: {
        home: {
            livingRegionTitle: 'The region is alive',
            livingRegionSub: 'Short voices from the neighbourhood.'
        },
        livingRegion: {
            morningBread: 'This morning the bakeries are baking fresh bread.',
            morningRolls: 'Warm rolls – the smell is already over the village.',
            middayFarmShop: 'Around midday the farm shops are worth a look – much has just arrived.',
            eveningApiary: 'In the evening it is worth visiting the apiaries.',
            eveningStrollHof: 'The evening invites a quiet walk to the farms.',
            nightQuietKitchen: 'In the kitchens they are still quietly preparing for tomorrow.',
            firstPlums: 'In the orchards the first plums are beginning to ripen.',
            firstApples: 'The first apples are growing heavy on the branches.',
            berryRipening: 'Berries are colouring on the bushes – the season is here.',
            asparagusMorning: 'In the morning the first asparagus lies fresh from the field.',
            pumpkinFields: 'On the fields the first pumpkins are glowing.',
            winterRoots: 'Root vegetables from the winter field – simple and local.',
            tomorrowMarketVeg: 'Tomorrow the local market will be especially rich in vegetables.',
            tomorrowMarketBread: 'For tomorrow the bakers are already setting aside extra bread.',
            rainSoupDay: 'In this rain the inns smell of warm soup.',
            rainWarmBread: 'Wet weather – fresh bread tastes especially good now.',
            hotOrchardShade: 'In the heat it is pleasantly cool under the orchard trees.',
            coldHoneyTea: 'In the cool air a jar of honey from nearby fits well.',
            springBlossomWalk: 'The fruit trees are in blossom – a quiet walk through the gardens is worth it.',
            cheeseAfternoon: 'In the afternoon new farm cheese is in the shops.',
            meatCounterFresh: 'This morning the meat counters were freshly cut.',
            automatEveningFill: 'In the evening the farm vending machines are stocked again.',
            sundayMarketHint: 'The weekly market is filling up – vegetables and bread from here.',
            honeyFlowPeak: 'The nectar flow is on – beekeepers are bringing in new honey.',
            engineProducerOfDay: 'Today it is worth visiting {name}.',
            engineSeasonal: 'In season now: {names}.',
            engineNewProducers: 'New in the region: {count} places.',
            engineNewProducts: 'New products nearby ({count}).',
            engineOpenNow: 'Open now: {count} places nearby.',
            engineVisitDelta: 'Since your last visit: {summary}.',
            engineVisitDeltaProducers: '{count} new places',
            engineVisitDeltaPromos: '{count} new offers',
            engineFallbackName: 'a place nearby'
        }
    },
    pl: {
        home: {
            livingRegionTitle: 'Region żyje',
            livingRegionSub: 'Krótkie głosy od mieszkańców.'
        },
        livingRegion: {
            morningBread: 'Dziś rano piekarnie wypiekają świeży chleb.',
            morningRolls: 'Ciepłe bułki – zapach już unosi się nad wsią.',
            middayFarmShop: 'W południe warto zajrzeć do sklepików gospodarskich – dużo właśnie nadeszło.',
            eveningApiary: 'Wieczorem warto odwiedzić pasieki.',
            eveningStrollHof: 'Wieczór zaprasza na spokojny spacer do gospodarstw.',
            nightQuietKitchen: 'W kuchniach wciąż cicho przygotowują jutro.',
            firstPlums: 'W sadach zaczynają dojrzewać pierwsze śliwki.',
            firstApples: 'Pierwsze jabłka robią się ciężkie na gałęziach.',
            berryRipening: 'Owoce jagodowe nabierają barwy – sezon już trwa.',
            asparagusMorning: 'Rano leżą pierwsze szparagi prosto z pola.',
            pumpkinFields: 'Na polach świecą pierwsze dynie.',
            winterRoots: 'Warzywa korzeniowe z zimowego pola – prosto i lokalnie.',
            tomorrowMarketVeg: 'Jutro lokalny targ będzie wyjątkowo bogaty w warzywa.',
            tomorrowMarketBread: 'Na jutro piekarze odkładają już dodatkowy chleb.',
            rainSoupDay: 'Przy tym deszczu w gospodach pachnie ciepłą zupą.',
            rainWarmBread: 'Mokra pogoda – świeży chleb smakuje teraz szczególnie.',
            hotOrchardShade: 'Przy upale pod drzewami w sadzie jest przyjemnie chłodno.',
            coldHoneyTea: 'Przy chłodzie pasuje słoik miodu z sąsiedztwa.',
            springBlossomWalk: 'Drzewa owocowe kwitną – spokojny spacer między sadami się opłaca.',
            cheeseAfternoon: 'Po południu w sklepach leży świeży ser z gospodarstw.',
            meatCounterFresh: 'Dziś rano przy ladach mięsnych świeżo pokrojono.',
            automatEveningFill: 'Wieczorem automaty gospodarskie znów są uzupełnione.',
            sundayMarketHint: 'Targ się zapełnia – warzywa i chleb stąd.',
            honeyFlowPeak: 'Pożytek trwa – pszczelarze zbierają świeży miód.',
            engineProducerOfDay: 'Dzisiaj warto odwiedzić: {name}.',
            engineSeasonal: 'Trwa sezon: {names}.',
            engineNewProducers: 'Nowości w regionie: {count} miejsc.',
            engineNewProducts: 'Nowe produkty w okolicy ({count}).',
            engineOpenNow: 'Otwarte teraz: {count} miejsc w okolicy.',
            engineVisitDelta: 'Od Twojej ostatniej wizyty: {summary}.',
            engineVisitDeltaProducers: '{count} nowych miejsc',
            engineVisitDeltaPromos: '{count} nowych ofert',
            engineFallbackName: 'miejsce w okolicy'
        }
    },
    mk: {
        home: {
            livingRegionTitle: 'Регионот живее',
            livingRegionSub: 'Кратки гласови од соседите.'
        },
        livingRegion: {
            morningBread: 'Утрово пекарниците печат свеж леб.',
            morningRolls: 'Топли кифли – мирисот веќе лебди над селото.',
            middayFarmShop: 'Напладне вреди поглед во дворските продавници – многу штотуку стигна.',
            eveningApiary: 'Навечер вреди да се посетат пчеларниците.',
            eveningStrollHof: 'Вечерва повикува на мирен од до дворските стопанства.',
            nightQuietKitchen: 'Во кујните сè уште тивко се подготвува за утре.',
            firstPlums: 'Во овоштарниците почнуваат да зреат првите сливи.',
            firstApples: 'Првите јаболки стануваат тешки на гранките.',
            berryRipening: 'Бобинките се обојуваат на грмушките – сезоната е тука.',
            asparagusMorning: 'Наутро лежат првите шпаргали свежи од полето.',
            pumpkinFields: 'На полињата светкаат првите тикви.',
            winterRoots: 'Коренести зеленчуци од зимското поле – едноставно и локално.',
            tomorrowMarketVeg: 'Утре локалниот пазар ќе биде особено богат со зеленчук.',
            tomorrowMarketBread: 'За утре пекарите веќе одвојуваат дополнителен леб.',
            rainSoupDay: 'При овој дожд во гостилниците мириса на топла супа.',
            rainWarmBread: 'Влажно време – свежиот леб сега особено се цени.',
            hotOrchardShade: 'При жештината под овошките е пријатно ладно.',
            coldHoneyTea: 'При студенило пасува тегла мед од соседството.',
            springBlossomWalk: 'Овошките цутат – мирен од меѓу градините вреди.',
            cheeseAfternoon: 'Попладне во продавниците има свежо дворско сирење.',
            meatCounterFresh: 'Утрово на месните тезги свежо се сечело.',
            automatEveningFill: 'Навечер дворските автомати повторно се наполнети.',
            sundayMarketHint: 'Пазарот се полни – зеленчук и леб одтука.',
            honeyFlowPeak: 'Пашата тече – пчеларите носат нов мед.',
            engineProducerOfDay: 'Денес вреди да се посети {name}.',
            engineSeasonal: 'Сезона сега: {names}.',
            engineNewProducers: 'Ново во регионот: {count} места.',
            engineNewProducts: 'Нови производи во близина ({count}).',
            engineOpenNow: 'Отворено сега: {count} места во близина.',
            engineVisitDelta: 'Од последната посета: {summary}.',
            engineVisitDeltaProducers: '{count} нови места',
            engineVisitDeltaPromos: '{count} нови понуди',
            engineFallbackName: 'место во близина'
        }
    }
});
