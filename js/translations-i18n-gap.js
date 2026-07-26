/**
 * ETAP i18n gap – brakujące klucze UI (DE/EN/PL/MK).
 * Merge w translations.js (po EN deepMerge, przed freeze).
 */

/** @type {Record<string, object>} */
export const I18N_GAP = Object.freeze({
    de: {
        a11y: { eta: 'Geschätzte Ankunftszeit', shareText: 'Text zum Teilen' },
        reviews: { photoAlt: 'Foto zur Bewertung' },
        producer: {
            facebook: 'Facebook',
            instagram: 'Instagram',
            tiktok: 'TikTok',
            website: 'Website'
        },
        producerPanel: {
            categoryPlaceholder: 'Brot / Käse…',
            stockPlaceholder: 'z. B. 12',
            hoursPlaceholder: 'Mo-Fr 08:00-18:00',
            defaultName: 'Regionaler Anbieter',
            defaultUnit: 'Stück'
        },
        reservations: { guestName: 'Gast' },
        map: {
            fallbackHofladen: 'Hofladen (Open.NRW)',
            fallbackHofladenName: 'Hofladen',
            unknownProducer: 'Unbekannter Anbieter'
        },
        testing: { shareOpen: 'Öffnen' },
        seasonal: {
            'season-asparagus': 'Spargel',
            'season-radish': 'Radieschen',
            'season-strawberry': 'Erdbeeren',
            'season-raspberry': 'Himbeeren',
            'season-blueberry': 'Heidelbeeren',
            'season-tomato': 'Tomaten',
            'season-pumpkin': 'Kürbis',
            'season-apple': 'Äpfel',
            'season-mushroom': 'Pilze',
            'season-cabbage': 'Kohl',
            'season-potato': 'Kartoffeln',
            'season-beet': 'Rote Bete'
        },
        stories: {
            farmer0: 'Dieser Hof arbeitet seit vielen Jahren in der Region und setzt auf saisonale Ernten. Gemüse und Obst kommen möglichst kurz nach der Ernte zu den Kunden. Familientradition verbindet sich hier mit schonender Bodenpflege. Spezialität sind Produkte vom eigenen Feld.',
            farmer1: 'Der Familienbetrieb verbindet lokale Anbauflächen mit dem Direktverkauf. Tiere haben Auslauf, und die Ernte wächst ohne unnötige Chemie. Kunden schätzen die transparente Herkunft. Region und Saison bestimmen das Tagesangebot.',
            bakery0: 'Die Bäckerei backt nach handwerklicher Tradition, oft mit Sauerteig. Das Mehl kommt von geprüften Mühlen aus der Umgebung. Täglich entstehen frische Brötchen, Brote und Hefegebäck. Spezialität ist Brot mit langer Teigführung.',
            bakery1: 'Hier reift der Teig langsam, und der Backtag beginnt noch vor Sonnenaufgang. Familienrezepte treffen auf lokale Zutaten. Gäste kommen für knusprige Brötchen und saisonale Kuchen zurück. Der Duft frischen Brotes prägt den Ort.',
            meat0: 'Fleischerei und Ladentheke arbeiten mit Betrieben aus der Region. Wurst und Aufschnitt entstehen nach eigenen Gewürzmischungen. Handarbeit und klare Herkunft stehen im Vordergrund. Spezialität sind frische Tagesprodukte.',
            meat1: 'Familientradition zeigt sich in der sorgfältigen Auswahl des Fleisches. Lokale Höfe liefern Rohware mit geprüfter Qualität. Das Angebot umfasst klassische Wurstwaren und saisonale Spezialitäten. Kundinnen und Kunden wissen, woher das Produkt kommt.',
            restaurant0: 'Die Küche setzt auf saisonale Produkte von lokalen Lieferanten. Die Speisekarte wechselt mit den Ernten der Region. Spezialität sind traditionelle Gerichte in zeitgemäßer Form. Gäste schätzen den kurzen Weg vom Feld auf den Teller.',
            restaurant1: 'Der Gasthof verbindet Gastfreundschaft mit regionalen Rezepten. Zutaten kommen von Landwirten und Bäckereien aus der Nähe. Das Tagesgericht nutzt, was gerade in der Region reift. Die Atmosphäre lädt zu einem ruhigen Essen ein.',
            shop0: 'Der Laden setzt auf lokale Lieferanten für Milchprodukte, Brot und Gemüse. Das Sortiment betont kurze Lieferwege. Regelmäßig gibt es saisonale Neuheiten aus der Region. Ein Ort für den täglichen Einkauf mit regionalem Charakter.',
            shop1: 'Hier finden Sie Milch, Käse und Spezialitäten von geprüften Erzeugern. Der Laden achtet auf Frische und klare Herkunftsangaben. Lokale Marken stehen neben saisonalen Produkten. Der Einkauf unterstützt Betriebe aus der Umgebung.',
            vending0: 'Der Automat bietet lokale Produkte rund um die Uhr. Das Sortiment umfasst frische Artikel von Erzeugern aus der Nähe. Praktisch für den regionalen Einkauf außerhalb der Ladenzeiten. Das Angebot wird regelmäßig nachgefüllt.',
            vending1: 'Die Station verbindet Komfort mit Regionalität. Drinnen liegen Produkte von geprüften Lieferanten aus der Umgebung. Ideal für einen schnellen Snack oder Milchprodukte unterwegs. Einfach, frisch und nah am Wohnort.',
            other0: 'Der lokale Erzeuger verbindet Tradition der Region mit Alltagstauglichkeit. Das Angebot beruht auf geprüften Zutaten und kurzen Wegen zum Kunden. Spezialität sind Produkte, die für die Gegend typisch sind. Authentischer Geschmack der Region.'
        }
    },
    en: {
        a11y: { eta: 'Estimated arrival time', shareText: 'Text to share' },
        reviews: { photoAlt: 'Review photo' },
        producer: {
            facebook: 'Facebook',
            instagram: 'Instagram',
            tiktok: 'TikTok',
            website: 'Website'
        },
        producerPanel: {
            categoryPlaceholder: 'Bread / cheese…',
            stockPlaceholder: 'e.g. 12',
            hoursPlaceholder: 'Mo-Fr 08:00-18:00',
            defaultName: 'Regional producer',
            defaultUnit: 'pcs'
        },
        reservations: { guestName: 'Guest' },
        map: {
            fallbackHofladen: 'Farm shop (Open.NRW)',
            fallbackHofladenName: 'Farm shop',
            unknownProducer: 'Unknown producer'
        },
        testing: { shareOpen: 'Open' },
        seasonal: {
            'season-asparagus': 'Asparagus',
            'season-radish': 'Radish',
            'season-strawberry': 'Strawberries',
            'season-raspberry': 'Raspberries',
            'season-blueberry': 'Blueberries',
            'season-tomato': 'Tomatoes',
            'season-pumpkin': 'Pumpkin',
            'season-apple': 'Apples',
            'season-mushroom': 'Mushrooms',
            'season-cabbage': 'Cabbage',
            'season-potato': 'Potatoes',
            'season-beet': 'Beetroot'
        },
        stories: {
            farmer0: 'This farm has worked in the region for many years and focuses on seasonal harvests. Vegetables and fruit reach customers as soon as possible after picking. Family tradition meets careful soil care. Specialties come from the farm’s own fields.',
            farmer1: 'The family business combines local fields with direct sales. Animals have outdoor access, and crops grow without unnecessary chemicals. Customers value transparent origin. Region and season shape the daily offer.',
            bakery0: 'The bakery follows craft tradition, often with sourdough. Flour comes from trusted mills nearby. Fresh rolls, loaves and yeast pastries are baked every day. Specialty bread uses a long fermentation.',
            bakery1: 'Dough rests slowly, and the baking day starts before sunrise. Family recipes meet local ingredients. Guests return for crusty rolls and seasonal cakes. The scent of fresh bread defines the place.',
            meat0: 'The butcher’s shop works with regional farms. Sausages and cold cuts use own spice blends. Handcraft and clear origin come first. Specialties are fresh products of the day.',
            meat1: 'Family tradition shows in careful meat selection. Local farms supply quality raw materials. The range includes classic sausages and seasonal specialties. Customers know where the product comes from.',
            restaurant0: 'The kitchen uses seasonal products from local suppliers. The menu changes with regional harvests. Specialties are traditional dishes in a modern form. Guests enjoy the short path from field to plate.',
            restaurant1: 'The inn combines hospitality with regional recipes. Ingredients come from nearby farmers and bakeries. The daily special uses what is ripe in the area. The atmosphere invites a calm meal.',
            shop0: 'The shop sources milk products, bread and vegetables locally. Short supply chains define the range. Seasonal novelties from the region appear regularly. A place for everyday shopping with regional character.',
            shop1: 'Here you find milk, cheese and specialties from trusted producers. The shop focuses on freshness and clear origin labels. Local brands sit beside seasonal products. Shopping supports nearby businesses.',
            vending0: 'The vending machine offers local products around the clock. The range includes fresh items from nearby producers. Practical for regional shopping outside shop hours. Stock is refilled regularly.',
            vending1: 'The station combines convenience with regional food. Inside are products from trusted local suppliers. Ideal for a quick snack or dairy products on the go. Simple, fresh and close to home.',
            other0: 'The local producer combines regional tradition with everyday use. The offer is based on trusted ingredients and short routes to customers. Specialties are products typical for the area. Authentic regional taste.'
        }
    },
    pl: {
        a11y: { eta: 'Szacowany czas dojazdu', shareText: 'Tekst do udostępnienia' },
        reviews: { photoAlt: 'Zdjęcie do opinii' },
        producer: {
            facebook: 'Facebook',
            instagram: 'Instagram',
            tiktok: 'TikTok',
            website: 'Strona WWW'
        },
        producerPanel: {
            categoryPlaceholder: 'Chleb / ser…',
            stockPlaceholder: 'np. 12',
            hoursPlaceholder: 'Mo-Fr 08:00-18:00',
            defaultName: 'Producent regionalny',
            defaultUnit: 'szt.'
        },
        reservations: { guestName: 'Gość' },
        map: {
            fallbackHofladen: 'Sklep gospodarski (Open.NRW)',
            fallbackHofladenName: 'Sklep gospodarski',
            unknownProducer: 'Nieznany producent'
        },
        testing: { shareOpen: 'Otwórz' },
        seasonal: {
            'season-asparagus': 'Szparagi',
            'season-radish': 'Rzodkiewka',
            'season-strawberry': 'Truskawki',
            'season-raspberry': 'Maliny',
            'season-blueberry': 'Jagody',
            'season-tomato': 'Pomidory',
            'season-pumpkin': 'Dynia',
            'season-apple': 'Jabłka',
            'season-mushroom': 'Grzyby',
            'season-cabbage': 'Kapusta',
            'season-potato': 'Ziemniaki',
            'season-beet': 'Buraki'
        },
        stories: {
            farmer0: 'To gospodarstwo od lat działa w regionie i stawia na sezonowe zbiory. Warzywa i owoce trafiają do klientów możliwie szybko po zbiorze. Tradycja rodzinna łączy się z troską o glebę. Specjalnością są produkty z własnego pola.',
            farmer1: 'Rodzinne gospodarstwo łączy lokalne uprawy ze sprzedażą bezpośrednią. Zwierzęta mają wybieg, a plony rosną bez zbędnej chemii. Klienci cenią przejrzyste pochodzenie. Region i sezon kształtują ofertę dnia.',
            bakery0: 'Piekarnia piecze według rzemieślniczej tradycji, często na zakwasie. Mąka pochodzi ze sprawdzonych młynów z okolicy. Codziennie powstają świeże bułki, chleby i drożdżówki. Specjalnością jest chleb z długim prowadzeniem ciasta.',
            bakery1: 'Ciasto dojrzewa powoli, a dzień pieczenia zaczyna się przed świtem. Rodzinne receptury spotykają lokalne składniki. Goście wracają po chrupiące bułki i sezonowe ciasta. Zapach świeżego chleba tworzy klimat miejsca.',
            meat0: 'Rzeźnia i ladę łączą dostawy z gospodarstw regionu. Kiełbasa i wędliny powstają według własnych mieszanek przypraw. Liczy się rękodzieło i jasne pochodzenie. Specjalnością są świeże produkty dnia.',
            meat1: 'Tradycja rodzinna widać w starannej selekcji mięsa. Lokalne gospodarstwa dostarczają surowiec sprawdzonej jakości. Oferta obejmuje klasyczne wędliny i sezonowe specjalności. Klienci wiedzą, skąd pochodzi produkt.',
            restaurant0: 'Kuchnia stawia na sezonowe produkty od lokalnych dostawców. Menu zmienia się wraz ze zbiorami regionu. Specjalnością są tradycyjne dania w nowoczesnej formie. Goście cenią krótką drogę z pola na talerz.',
            restaurant1: 'Gospoda łączy gościnność z regionalnymi przepisami. Składniki pochodzą od rolników i piekarni z okolicy. Danie dnia korzysta z tego, co właśnie dojrzewa w regionie. Atmosfera zachęca do spokojnego posiłku.',
            shop0: 'Sklep stawia na lokalnych dostawców nabiału, pieczywa i warzyw. Asortyment podkreśla krótkie łańcuchy dostaw. Regularnie pojawiają się sezonowe nowości z regionu. Miejsce codziennych zakupów o regionalnym charakterze.',
            shop1: 'Znajdziesz tu mleko, sery i specjalności sprawdzonych producentów. Sklep dba o świeżość i jasne oznaczenie pochodzenia. Lokalne marki stoją obok produktów sezonowych. Zakupy wspierają firmy z okolicy.',
            vending0: 'Automat oferuje lokalne produkty przez całą dobę. Asortyment obejmuje świeże artykuły od wytwórców z okolicy. Praktyczny zakup regionalny poza godzinami sklepu. Oferta jest regularnie uzupełniana.',
            vending1: 'Stacja łączy wygodę z regionalnością. W środku są produkty sprawdzonych dostawców z okolicy. Idealna na szybką przekąskę lub nabiał w drodze. Prosto, świeżo i blisko domu.',
            other0: 'Lokalny producent łączy tradycję regionu z codzienną użytecznością. Oferta opiera się na sprawdzonych składnikach i krótkiej drodze do klienta. Specjalnością są produkty typowe dla okolicy. Autentyczny smak regionu.'
        }
    },
    mk: {
        a11y: { eta: 'Проценето време на пристигнување', shareText: 'Текст за споделување' },
        reviews: { photoAlt: 'Фотографија од рецензија' },
        producer: {
            facebook: 'Facebook',
            instagram: 'Instagram',
            tiktok: 'TikTok',
            website: 'Веб-страница'
        },
        producerPanel: {
            categoryPlaceholder: 'Леб / сирење…',
            stockPlaceholder: 'на пр. 12',
            hoursPlaceholder: 'Пон-Пет 08:00-18:00',
            defaultName: 'Регионален производител',
            defaultUnit: 'пар.'
        },
        reservations: { guestName: 'Гостин' },
        map: {
            fallbackHofladen: 'Селска продавница (Open.NRW)',
            fallbackHofladenName: 'Селска продавница',
            unknownProducer: 'Непознат производител'
        },
        testing: { shareOpen: 'Отвори' },
        seasonal: {
            'season-asparagus': 'Шпаргла',
            'season-radish': 'Ротквица',
            'season-strawberry': 'Јагоди',
            'season-raspberry': 'Малини',
            'season-blueberry': 'Боровинки',
            'season-tomato': 'Домати',
            'season-pumpkin': 'Тиква',
            'season-apple': 'Јаболки',
            'season-mushroom': 'Печурки',
            'season-cabbage': 'Зелка',
            'season-potato': 'Компири',
            'season-beet': 'Цвекло'
        },
        stories: {
            farmer0: 'Оваа фарма долго години работи во регионот и се фокусира на сезонски жетви. Зеленчукот и овошјето стигнуваат до клиентите што е можно побрзо по бербата. Семејната традиција се поврзува со внимателна грижа за почвата. Специјалитет се производите од сопственото поле.',
            farmer1: 'Семејниот бизнис ги комбинира локалните површини со директна продажба. Животните имаат излез, а посевите растат без непотребна хемија. Клиентите ја ценат транспарентната потеклост. Регионот и сезоната го обликуваат дневниот понуда.',
            bakery0: 'Пекарата пече според занаетчиска традиција, често со кисело тесто. Брашното доаѓа од проверени мелници во околината. Секојдневно се прават свежи кифли, лебови и квасни печива. Специјалитет е леб со долго водење на тестото.',
            bakery1: 'Тестото созрева полека, а денот на печење почнува пред изгрејсонце. Семејните рецепти се среќаваат со локални состојки. Гостите се враќаат за крцкави кифли и сезонски торти. Мирисот на свеж леб го дефинира местото.',
            meat0: 'Месарицата работи со фарми од регионот. Колбаси и месни производи се прават според сопствени мешавини. Рачна работа и јасно потекло се во прв план. Специјалитет се свежи производи на денот.',
            meat1: 'Семејната традиција се гледа во внимателниот избор на месо. Локалните фарми доставуваат суровина со проверена квалитет. Понудата вклучува класични колбаси и сезонски специјалитети. Клиентите знаат од каде доаѓа производот.',
            restaurant0: 'Кујната користи сезонски производи од локални добавувачи. Менито се менува со жетвите во регионот. Специјалитет се традиционални јадења во современ облик. Гостите ја ценат кратката патека од поле до чинија.',
            restaurant1: 'Гостилницата комбинира гостопримство со регионални рецепти. Состојките доаѓаат од фармери и пекари во близина. Дневното јадење користи што е зрело во регионот. Атмосферата поканува на мирен оброк.',
            shop0: 'Продавницата се потпира на локални добавувачи за млечни производи, леб и зеленчук. Асортиманот ја нагласува кратката снабдувачка патека. Редовно има сезонски новитети од регионот. Место за секојдневни набавки со регионален карактер.',
            shop1: 'Овде ќе најдете млеко, сирење и специјалитети од проверени производители. Продавницата внимава на свежина и јасни ознаки за потекло. Локалните брендови стојат покрај сезонски производи. Купувањето ги поддржува бизнисите во околината.',
            vending0: 'Автоматот нуди локални производи деноноќно. Асортиманот вклучува свежи артикли од производители во близина. Практично за регионални набавки надвор од работното време. Понудата редовно се дополнува.',
            vending1: 'Станицата комбинира удобност со регионалност. Внатре има производи од проверени добавувачи од околината. Идеално за брз оброк или млечни производи на пат. Едноставно, свежо и блиску до домот.',
            other0: 'Локалниот производител ја комбинира традицијата на регионот со секојдневна употреба. Понудата се заснова на проверени состојки и кратки патеки до клиентот. Специјалитет се производи типични за крајот. Автентичен вкус на регионот.'
        }
    }
});

export default I18N_GAP;
