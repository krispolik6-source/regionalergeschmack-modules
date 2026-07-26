// js/translations-mk.js – македонски (mk)

function ui(nav, home, categories, extra = {}) {
    return { nav, home, categories, ...extra };
}

export const MK = ui(
    { home: 'Почетна', map: 'Карта', premium: 'Премиум', favorites: 'Омилени', cart: 'Кошничка', profile: 'Профил' },
    {
        heroTitle: 'Поддржете локално.<br>Јадете свесно.<br>Живејте подобро.',
        heroTagline: '🌍 Откријте регионални производители во вашата близина',
        getLocation: 'Земете локација',
        findNearby: 'Откријте на мапа',
        recommendedTitle: '⭐ Препорачани земјоделци',
        recommendedPlaceholder: 'Наскоро: препораки од вашиот регион.',
        featured: '⭐ Препорачани производи',
        ratingNew: '🆕',
        featuredItems: {},
        footerCopyright: '© 2026 Regionaler Geschmack',
        searchPlaceholder: 'Пребарајте производи, ресторани, продавници или производители...',
        hubLabel: 'Пребарување и брз пристап',
        chipsLabel: 'Брзи филтри',
        chip: { products: 'Производи', restaurants: 'Ресторани', shops: 'Продавници', farmers: 'Земјоделци', favorites: 'Омилени' },
        premiumTeaser: 'Ексклузивни придобивки за локални откритија',
        categoriesTitle: 'Категории',
        allCategories: 'Сите категории',
        categoryActionsLabel: 'Брзи филтри по категорија'
    },
    {
        all: { name: 'Сите', desc: 'Сите категории' },
        restaurants: { name: 'Ресторани', desc: 'Регионални јадења' },
        fastFood: { name: 'Брза храна', desc: 'Брза храна и барови' },
        farmers: { name: 'Земјоделци', desc: 'Свежи производи' },
        bakeries: { name: 'Пекари', desc: 'Свежи пецива' },
        meat: { name: 'Месо / Месарници', desc: 'Регионални колбаси' },
        shops: { name: 'Продавници', desc: 'Локални производи' },
        vending: { name: 'Автомати', desc: '24/7' },
        favorites: { name: 'Омилени', desc: 'Зачувани места' }
    },
    {
        a11y: { darkMode: 'Темен режим', lightMode: 'Светол режим', chooseLanguage: 'Изберете јазик', menu: 'Мени', premium: 'Премиум', map: 'Карта', searchRadius: 'Радиус на пребарување во km' },
        map: {
            gps: 'GPS',
            osm: 'OSM',
            loadError: 'Картата не можеше да се вчита.',
            dataLoading: 'Вчитување податоци...',
            dataCached: 'Прикажани зачувани податоци',
            dataError: 'Грешка при вчитување',
            noDataInArea: 'Нема податоци во оваа околина.',
            radiusFilter: '🔵 Опсег: {km} km ({count} места)',
            producerList: 'Производители во опсег',
            listToggle: '📋 Листа ({count})',
            edit: 'Уреди',
            searchPlaceholder: 'Пребарајте производи, ресторани, продавници...',
            legend: 'Легенда',
            legendTitle: 'Категории на мапата',
            styleTitle: 'Стил на мапата',
            categoriesTitle: 'Категории',
            save: 'Зачувај',
            reset: 'Ресетирај',
            style: { light: 'Светло', dark: 'Темно', satellite: 'Сателит', terrain: 'Релеф' }
        },
        btn: { details: 'Детали', favorite: 'Омилено', favoriteSaved: 'Зачувано', addToCart: 'Додади во кошничка', addedToCart: 'Додадено', navigate: 'Навигација', close: 'Затвори', back: 'Назад', remove: 'Отстрани', more: 'Повеќе', less: 'Помалку', login: 'Најава', toMap: 'Кон мапата', discover: 'Откријте производи', checkout: 'Наплата', clearCart: 'Испразни ја кошничката' },
        favorites: { title: 'Омилени', subtitle: 'Вашите зачувани места и производители', empty: 'Немате зачувани производители', emptySub: 'Означете производители на мапата како омилени.' },
        cart: { title: 'Кошничка', subtitle: 'Вашите купувања кај регионални добавувачи', empty: 'Кошничката е празна', emptySub: 'Додадете производи од омилените места.', total: 'Вкупно', product: 'Производ', confirmClear: 'Дали сте сигурни дека сакате да ја испразните кошничката?' },
        footer: { address: 'Polikarski Krzysztof, Germany' },
        shell: { label: 'Главна навигација' },
        profile: { title: 'Профил', subtitle: 'Вашите поставки', guest: 'Гостин', guestSub: 'Најавете се за да зачувате омилени и да ги следите нарачките.', darkMode: 'Темен режим', notifications: 'Известувања', language: 'Јазик' },
        msg: { loading: 'Вчитување...', noProducts: 'Нема достапни производи.', noOfferProducts: 'Нема производи во понудата.', servicesOnContact: 'Услуги достапни по контакт.', checkoutSoon: 'Наплата – наскоро', loginSoon: 'Најава – наскоро', menuSoon: 'Мени – наскоро', premiumSoon: 'Премиум – наскоро', locationDenied: 'Пристапот до локацијата е одбиен.', locationUnavailable: 'Локацијата не можеше да се утврди.', addedToFavorites: 'Додадено во омилени', removedFromFavorites: 'Отстрането од омилени', addedToCart: 'Додадено во кошничка', removedFromCart: 'Отстрането од кошничка', connectionError: 'Грешка во врската', viewError: 'Приказот не можеше да се вчита.', error: 'Грешка' },
        search: { noResults: 'Нема резултати за ова пребарување.', noResultsFor: "Нема резултати за пребарувањето '{query}'", resultsCount: '{count} резултати', searching: 'Пребарување...' },
        producer: {
            openUntil: 'Отворено до {time}',
            distance: '{distance} m',
            contactTitle: 'Контакт',
            productsTitle: 'Производи',
            locationTitle: 'Локација',
            phone: 'Телефон',
            types: { farmer: 'Земјоделец', bakery: 'Пекарница', restaurant: 'Ресторан', meat: 'Месарница', shop: 'Супермаркет', vending: 'Автомат', honey: 'Пчеларство', dairy: 'Млекарство', fruit: 'Овошје', vegetables: 'Зеленчук', forest: 'Шумски производи', other: 'Добавувач' }
        },
        product: {
            placeholderImage: 'Примерна слика',
            placeholderNote: 'Сликата не е вистинска. Само за илустрација.'
        },
        reviews: {
            title: 'Мислења',
            add: 'Додајте мислење',
            empty: 'Нема мислења',
            userName: 'Вашето име',
            rating: 'Оценка',
            comment: 'Коментар',
            submit: 'Испрати',
            saved: '✅ Мислењето е додадено!'
        },
        productDefault: 'Регионален производ',
        header: { tagline: 'Поддржете локално. Живејте подобро.' },
        premium: {
            title: 'Премиум',
            subtitle: 'Повеќе откритија, повеќе придобивки – за свесен регионален ужиток.',
            featuresTitle: 'Премиум придобивки',
            feature1Title: 'Препораки',
            feature1Desc: 'Избрани регионални предлози во вашата близина.',
            feature2Title: 'Проширена мапа',
            feature2Desc: 'Повеќе филтри и рути до локални добавувачи.',
            feature3Title: 'Предности при купување',
            feature3Desc: 'Побрза нарачка и преглед на понуди.',
            cta: 'Отклучи Премиум'
        }
    }
);
