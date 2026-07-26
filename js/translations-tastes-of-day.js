/**
 * ETAP 15B – Smaki dnia
 * Narracyjne rekomendacje produktów (DE/EN/PL/MK + EN fallback)
 */

/** @type {Record<string, object>} */
export const TASTES_OF_DAY_I18N = Object.freeze({
    de: {
        home: {
            tastesOfDayTitle: 'Geschmäcker des Tages',
            tastesOfDaySub: 'Was heute aus der Region passt.'
        },
        tastesOfDay: {
            honeyFairWeather: 'Heute lohnt frischer Honig – die Bienen waren bei schönem Wetter fleißig.',
            honeyCoolDay: 'Bei dem Wetter schmeckt ein Glas regionaler Honig besonders gut.',
            strawberriesIdeal: 'Ein idealer Tag für frische Erdbeeren.',
            cheeseEvening: 'Am Abend empfehlen wir lokale Käsesorten.',
            breadMorning: 'Am Morgen duftet frisches Brot aus den Bäckereien.',
            applesCrisp: 'Knackige Äpfel aus der Region – heute besonders gut.',
            yogurtHotDay: 'Bei der Wärme passt frischer Joghurt vom Hof.',
            soupRain: 'Bei Regen wärmt eine saisonale Suppe aus der Gaststube.',
            eggsMorning: 'Frische Eier vom Hof – gut für den Start in den Tag.',
            juiceSummer: 'Kühler Obstsaft aus der Region passt zum Sommerwetter.',
            sausageAfternoon: 'Regionale Wurst vom Metzger – heute frisch aufgeschnitten.',
            vegetablesFresh: 'Frisches Gemüse vom Feld – kurz und knackig.',
            pastriesRain: 'Bei Nässe schmecken warme Stückchen aus der Bäckerei.',
            cheeseMildDay: 'Heute passt ein Stück Hofkäse zwischendurch.'
        }
    },
    en: {
        home: {
            tastesOfDayTitle: 'Flavours of the day',
            tastesOfDaySub: 'What fits from the region today.'
        },
        tastesOfDay: {
            honeyFairWeather: 'Today is a good day for fresh honey – the bees were busy in fine weather.',
            honeyCoolDay: 'In this weather a jar of regional honey tastes especially good.',
            strawberriesIdeal: 'An ideal day for fresh strawberries.',
            cheeseEvening: 'In the evening we recommend local cheeses.',
            breadMorning: 'In the morning fresh bread is baking in the bakeries.',
            applesCrisp: 'Crisp regional apples – especially good today.',
            yogurtHotDay: 'In the warmth, fresh farm yogurt fits well.',
            soupRain: 'In the rain a seasonal soup from the inn warms you up.',
            eggsMorning: 'Fresh farm eggs – a good start to the day.',
            juiceSummer: 'Cool regional juice suits the summer weather.',
            sausageAfternoon: 'Regional sausage from the butcher – freshly cut today.',
            vegetablesFresh: 'Fresh vegetables from the field – short and crisp.',
            pastriesRain: 'In wet weather warm pastries from the bakery taste right.',
            cheeseMildDay: 'Today a piece of farm cheese fits in between.'
        }
    },
    pl: {
        home: {
            tastesOfDayTitle: 'Smaki dnia',
            tastesOfDaySub: 'Co dziś pasuje z regionu.'
        },
        tastesOfDay: {
            honeyFairWeather: 'Dzisiaj warto spróbować świeżego miodu – pszczoły pracowały przy pięknej pogodzie.',
            honeyCoolDay: 'Przy takiej pogodzie słoik regionalnego miodu smakuje szczególnie.',
            strawberriesIdeal: 'Idealny dzień na świeże truskawki.',
            cheeseEvening: 'Wieczorem polecamy lokalne sery.',
            breadMorning: 'Rano w piekarniach pachnie świeżym chlebem.',
            applesCrisp: 'Chrupiące jabłka z regionu – dziś szczególnie dobre.',
            yogurtHotDay: 'Przy cieple pasuje świeży jogurt z gospodarstwa.',
            soupRain: 'Przy deszczu rozgrzewa sezonowa zupa z gospody.',
            eggsMorning: 'Świeże jaja z gospodarstwa – dobry początek dnia.',
            juiceSummer: 'Chłodny sok z regionu pasuje do letniej pogody.',
            sausageAfternoon: 'Regionalna kiełbasa z masarni – dziś świeżo pokrojona.',
            vegetablesFresh: 'Świeże warzywa z pola – krótko i chrupko.',
            pastriesRain: 'Przy mokrej pogodzie smakują ciepłe wypieki z piekarni.',
            cheeseMildDay: 'Dziś pasuje kawałek sera z gospodarstwa.'
        }
    },
    mk: {
        home: {
            tastesOfDayTitle: 'Вкусеви на денот',
            tastesOfDaySub: 'Што денес пасува од регионот.'
        },
        tastesOfDay: {
            honeyFairWeather: 'Денес вреди свеж мед – пчелите работеа при убаво време.',
            honeyCoolDay: 'При вакво време тегла регионален мед особено се цени.',
            strawberriesIdeal: 'Идеален ден за свежи јагоди.',
            cheeseEvening: 'Навечер препорачуваме локални сирења.',
            breadMorning: 'Наутро во пекарниците мириса на свеж леб.',
            applesCrisp: 'Крцкави јаболки од регионот – денес особено добри.',
            yogurtHotDay: 'При топлина пасува свеж јогурт од дворот.',
            soupRain: 'При дожд загрева сезонска супа од гостилницата.',
            eggsMorning: 'Свежи јајца од дворот – добар почеток на денот.',
            juiceSummer: 'Ладен сок од регионот пасува на летната времето.',
            sausageAfternoon: 'Регионална колбаса од месарницата – денес свежо сечена.',
            vegetablesFresh: 'Свеж зеленчук од полето – кратко и крцкаво.',
            pastriesRain: 'При влажно време топло печиво од пекарницата е на место.',
            cheeseMildDay: 'Денес пасува парче дворско сирење.'
        }
    }
});
