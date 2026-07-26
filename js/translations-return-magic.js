/**
 * ETAP 15E – Magia powrotu
 * Ton rozmowy, nie powiadomienia systemowe. DE/EN/PL/MK + EN fallback.
 */

/** @type {Record<string, object>} */
export const RETURN_MAGIC_I18N = Object.freeze({
    de: {
        home: {
            returnMagicTitle: 'Schön, dass du wieder da bist',
            returnMagicSub: 'Ein paar Worte nach deiner Pause.'
        },
        returnMagic: {
            welcome: 'Willkommen zurück.',
            welcomeNamed: 'Willkommen zurück, {name}.',
            newProducts: 'Seit deinem letzten Besuch sind {count} neue Produkte dazugekommen – schau ruhig rein.',
            favoriteBakeryOpen: 'Deine Lieblingsbäckerei {place} hat schon geöffnet.',
            stillAvailable: 'Vor einer Woche hast du {product} angesehen – und das ist noch da.',
            missedRegion: 'In den letzten {days} Tagen hat sich in der Region einiges bewegt.',
            productFallback: 'Das Produkt',
            productApples: 'Die Äpfel',
            productHoney: 'Der Honig',
            productBread: 'Das Brot',
            productCheese: 'Der Käse',
            productStrawberries: 'Die Erdbeeren',
            ctaExplore: 'Neuigkeiten ansehen',
            ctaBakery: 'Zur Bäckerei',
            ctaProduct: 'Noch einmal ansehen'
        }
    },
    en: {
        home: {
            returnMagicTitle: 'Good to see you again',
            returnMagicSub: 'A few words after your break.'
        },
        returnMagic: {
            welcome: 'Welcome back.',
            welcomeNamed: 'Welcome back, {name}.',
            newProducts: 'Since your last visit, {count} new products have shown up – worth a look.',
            favoriteBakeryOpen: 'Your favourite bakery {place} is already open.',
            stillAvailable: '{product} you looked at a week ago are still available.',
            missedRegion: 'In the last {days} days the region has kept moving.',
            productFallback: 'That product',
            productApples: 'The apples',
            productHoney: 'The honey',
            productBread: 'The bread',
            productCheese: 'The cheese',
            productStrawberries: 'The strawberries',
            ctaExplore: 'See what is new',
            ctaBakery: 'Open the bakery',
            ctaProduct: 'Take another look'
        }
    },
    pl: {
        home: {
            returnMagicTitle: 'Miło Cię znowu widzieć',
            returnMagicSub: 'Kilka słów po Twojej przerwie.'
        },
        returnMagic: {
            welcome: 'Witamy ponownie.',
            welcomeNamed: 'Witamy ponownie, {name}.',
            newProducts: 'Od ostatniej wizyty pojawiło się {count} nowych produktów – warto zerknąć.',
            favoriteBakeryOpen: 'Twoja ulubiona piekarnia {place} jest już otwarta.',
            stillAvailable: '{product}, które oglądałeś tydzień temu, są nadal dostępne.',
            missedRegion: 'Przez ostatnie {days} dni w regionie dużo się działo.',
            productFallback: 'Ten produkt',
            productApples: 'Jabłka',
            productHoney: 'Miód',
            productBread: 'Chleb',
            productCheese: 'Sery',
            productStrawberries: 'Truskawki',
            ctaExplore: 'Zobacz nowości',
            ctaBakery: 'Otwórz piekarnię',
            ctaProduct: 'Zerknij jeszcze raz'
        }
    },
    mk: {
        home: {
            returnMagicTitle: 'Мило е што си повторно тука',
            returnMagicSub: 'Неколку зборови по паузата.'
        },
        returnMagic: {
            welcome: 'Добредојде повторно.',
            welcomeNamed: 'Добредојде повторно, {name}.',
            newProducts: 'Од последната посета се појавија {count} нови производи – вреди да ѕирнеш.',
            favoriteBakeryOpen: 'Твојата омилена пекарница {place} веќе е отворена.',
            stillAvailable: '{product} што ги гледаше пред една недела сè уште се достапни.',
            missedRegion: 'Во последните {days} дена регионот продолжи да се движи.',
            productFallback: 'Тој производ',
            productApples: 'Јаболките',
            productHoney: 'Медот',
            productBread: 'Лебот',
            productCheese: 'Сирењата',
            productStrawberries: 'Јагодите',
            ctaExplore: 'Види новини',
            ctaBakery: 'Отвори ја пекарницата',
            ctaProduct: 'Погледни уште еднаш'
        }
    }
});
