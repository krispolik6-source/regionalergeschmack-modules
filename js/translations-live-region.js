/**
 * ETAP 13A – „Dzisiaj w regionie” / Live Region
 * DE/EN/PL/MK natywnie; pozostałe języki → EN (deepMerge w translations.js)
 */

/** @type {Record<string, object>} */
export const LIVE_REGION_I18N = Object.freeze({
    de: {
        home: {
            liveRegionTitle: 'Heute in der Region',
            liveRegionSub: 'Kurze Notizen aus der Nachbarschaft – ohne Werbung.'
        },
        liveRegion: {
            freshBread: 'Frisch gebackenes Brot duftet schon in den Hofläden.',
            freshRolls: 'Warme Brötchen – heute früh aus dem Ofen.',
            freshHoney: 'Neuer Honig von den regionalen Imkern.',
            freshMilk: 'Frische Milch direkt vom Hof ist wieder da.',
            cheeseOfDay: 'Lokaler Käse des Tages liegt in den Läden bereit.',
            farmEggs: 'Freilandeier von kleinen Höfen – heute nachgefüllt.',
            vegDelivery: 'Neue Gemüselieferung aus den Gärten der Umgebung.',
            freshSausage: 'Frischwurst von der regionalen Fleischerei.',
            automatRestock: 'Hofautomat wieder aufgefüllt – kurze Wege lohnen sich.',
            soupOfDay: 'Saisonale Suppe des Tages in den Gaststuben.',
            gardenTables: 'Gartenplätze sind wieder geöffnet – Sonne inklusive.',
            asparagusSeason: 'Spargelzeit: die ersten Stangen sind geerntet.',
            firstStrawberries: 'Erste Erdbeeren aus der Region sind da.',
            radishSeason: 'Knackige Radieschen frisch vom Feld.',
            tomatoSeason: 'Reife Tomaten aus dem Gewächshaus und Freiland.',
            berrySeason: 'Beerenzeit – Himbeeren und Heidelbeeren vom Strauch.',
            harvestBegun: 'Die Ernte hat begonnen – Getreide und Feldgemüse.',
            appleHarvest: 'Apfelernte: knackige Sorten vom Streuobst.',
            pumpkinSeason: 'Kürbiszeit auf den Höfen der Region.',
            mushroomSeason: 'Waldpilze und Hofpilze – Saison hat begonnen.',
            winterVeg: 'Wintergemüse vom Feld – robust und regional.',
            potatoSeason: 'Neue Kartoffeln und Lagerware aus der Nähe.',
            jamKitchen: 'Hausgemachte Marmeladen und Eingemachtes frisch abgefüllt.',
            pretzelMorning: 'Laugenbrezeln – knusprig am frühen Morgen.'
        }
    },
    en: {
        home: {
            liveRegionTitle: 'Today in the region',
            liveRegionSub: 'Short notes from the neighbourhood – not ads.'
        },
        liveRegion: {
            freshBread: 'Freshly baked bread is already warming the farm shops.',
            freshRolls: 'Warm rolls – out of the oven this morning.',
            freshHoney: 'New honey from local beekeepers.',
            freshMilk: 'Fresh farm milk is back on the shelves.',
            cheeseOfDay: 'Local cheese of the day is ready in the shops.',
            farmEggs: 'Free-range eggs from small farms – restocked today.',
            vegDelivery: 'A new vegetable delivery from nearby gardens.',
            freshSausage: 'Fresh sausage from the regional butcher.',
            automatRestock: 'Farm vending machine refilled – short trips pay off.',
            soupOfDay: 'Seasonal soup of the day in local eateries.',
            gardenTables: 'Garden seating is open again – sunshine included.',
            asparagusSeason: 'Asparagus season: the first spears are harvested.',
            firstStrawberries: 'The first strawberries from the region are here.',
            radishSeason: 'Crisp radishes fresh from the field.',
            tomatoSeason: 'Ripe tomatoes from greenhouse and open ground.',
            berrySeason: 'Berry time – raspberries and blueberries from the bush.',
            harvestBegun: 'Harvest has begun – grain and field vegetables.',
            appleHarvest: 'Apple harvest: crisp varieties from local orchards.',
            pumpkinSeason: 'Pumpkin season on the region’s farms.',
            mushroomSeason: 'Forest and farm mushrooms – the season has started.',
            winterVeg: 'Winter vegetables from the field – hardy and local.',
            potatoSeason: 'New potatoes and stored stock from nearby.',
            jamKitchen: 'Homemade jams and preserves freshly filled.',
            pretzelMorning: 'Soft pretzels – crisp early in the morning.'
        }
    },
    pl: {
        home: {
            liveRegionTitle: 'Dzisiaj w regionie',
            liveRegionSub: 'Krótkie wieści z okolicy – bez reklam.'
        },
        liveRegion: {
            freshBread: 'Świeżo upieczony chleb już pachnie w sklepikach gospodarskich.',
            freshRolls: 'Ciepłe bułki – dziś rano prosto z pieca.',
            freshHoney: 'Nowy miód od lokalnych pszczelarzy.',
            freshMilk: 'Świeże mleko prosto z gospodarstwa znów jest dostępne.',
            cheeseOfDay: 'Lokalny ser dnia czeka w sklepach.',
            farmEggs: 'Jaja od małych gospodarstw – dziś uzupełnione.',
            vegDelivery: 'Nowa dostawa warzyw z okolicznych ogrodów.',
            freshSausage: 'Świeża kiełbasa z regionalnej rzeźni.',
            automatRestock: 'Automat przy gospodarstwie znów pełny – warto zajrzeć.',
            soupOfDay: 'Sezonowa zupa dnia w lokalnych knajpkach.',
            gardenTables: 'Ogródki znów otwarte – słońce w zestawie.',
            asparagusSeason: 'Sezon na szparagi: pierwsze pędy zebrane.',
            firstStrawberries: 'Pierwsze truskawki z regionu już są.',
            radishSeason: 'Chrupiąca rzodkiewka prosto z pola.',
            tomatoSeason: 'Dojrzałe pomidory z tunelu i z gruntu.',
            berrySeason: 'Czas na jagody – maliny i borówki z krzewu.',
            harvestBegun: 'Żniwa się zaczęły – zboże i warzywa polowe.',
            appleHarvest: 'Zbiór jabłek: chrupiące odmiany z sadów.',
            pumpkinSeason: 'Sezon dyni w gospodarstwach regionu.',
            mushroomSeason: 'Grzyby leśne i hodowlane – sezon wystartował.',
            winterVeg: 'Warzywa zimowe z pola – solidne i lokalne.',
            potatoSeason: 'Nowe ziemniaki i zapasy z okolicy.',
            jamKitchen: 'Domowe dżemy i przetwory świeżo rozlane.',
            pretzelMorning: 'Precle – chrupiące już wczesnym rankiem.'
        }
    },
    mk: {
        home: {
            liveRegionTitle: 'Денес во регионот',
            liveRegionSub: 'Кратки вести од соседството – без реклами.'
        },
        liveRegion: {
            freshBread: 'Свежо печени лебови веќе мирисаат во селските продавници.',
            freshRolls: 'Топли кифлички – утрово директно од печка.',
            freshHoney: 'Нов мед од локални пчелари.',
            freshMilk: 'Свежо млеко од фарма повторно е достапно.',
            cheeseOfDay: 'Локалното сирење на денот чека во продавниците.',
            farmEggs: 'Јајца од мали фарми – денес надополнети.',
            vegDelivery: 'Нова испорака зеленчук од околните градини.',
            freshSausage: 'Свежа колбас од регионална месара.',
            automatRestock: 'Автоматот кај фарма е повторно полн.',
            soupOfDay: 'Сезонска супа на денот во локалните гостилници.',
            gardenTables: 'Градинските маси се повторно отворени.',
            asparagusSeason: 'Сезона на шпаргла: првите стебла се собрани.',
            firstStrawberries: 'Првите јагоди од регионот пристигнаа.',
            radishSeason: 'Крцкава ротквица директно од поле.',
            tomatoSeason: 'Зрели домати од стаклена градина и нива.',
            berrySeason: 'Време за бобинки – малини и боровинки.',
            harvestBegun: 'Жетвата започна – жита и полски зеленчук.',
            appleHarvest: 'Берба на јаболка: крцкави сорти од овоштарници.',
            pumpkinSeason: 'Сезона на тикви на фармите во регионот.',
            mushroomSeason: 'Шумски и фармерски печурки – сезоната почна.',
            winterVeg: 'Зимски зеленчук од поле – локален и издржлив.',
            potatoSeason: 'Нови компири и резерви од околината.',
            jamKitchen: 'Домашни џемови и зимници свежо наполнети.',
            pretzelMorning: 'Переци – крцкави уште рано наутро.'
        }
    }
});
