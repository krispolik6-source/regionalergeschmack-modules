/**
 * Shell / meta / geo / landing – brakujące klucze i18n (DE/EN/PL + EN fallback).
 * Merge w translations.js.
 */

/** @type {Record<string, object>} */
export const SHELL_META_I18N = Object.freeze({
    de: {
        meta: {
            title: 'Regionaler Geschmack',
            description:
                'Regionaler Geschmack – regionale Lebensmittel und Produzenten in deiner Nähe entdecken. Karte, Favoriten, Bewertungen.',
            ogDescription: 'Regionale Lebensmittel und Produzenten in deiner Nähe.',
            keywords:
                'regional, Lebensmittel, Produzenten, Bauernhof, Bäckerei, Karte, lokal, Bio, Direktverkauf',
            appleTitle: 'Regionaler'
        },
        geo: {
            under50m: '< 50 m',
            meters: '{n} m',
            km: '{n} km',
            kmOneDecimal: '{n} km',
            minutes: '{n} min',
            hours: '{n} h'
        },
        map: {
            radiusKm: '{km} km'
        },
        a11y: {
            feedbackRating: 'Bewertung'
        },
        help: {
            coopMailSubject: 'Zusammenarbeit – Krzysztof Polikarski',
            bugMailSubject: 'Fehlerbericht'
        },
        testing: {
            feedbackMailSubject: '[RG Feedback] {rating}/5 · {language}',
            feedbackMailName: 'Name: {name}',
            feedbackMailRating: 'Bewertung: {rating}/5',
            feedbackMailDevice: 'Gerät: {device}',
            feedbackMailLanguage: 'Sprache: {language}',
            feedbackMailUrl: 'URL: {url}',
            feedbackMailUa: 'UA: {ua}'
        },
        ads: {
            partnerMailSubject: 'Regionaler Geschmack – Kooperation / Werbung'
        },
        landing: {
            navAria: 'Hauptnavigation',
            navFeatures: 'Funktionen',
            navScreenshots: 'Screenshots',
            navHow: "So funktioniert's",
            ctaOpenApp: 'App öffnen',
            ctaStart: 'Jetzt App starten →',
            ctaLearnMore: 'Mehr erfahren',
            eyebrow: 'Regional · Nachhaltig · Lokal',
            heroTitle: 'Entdecke regionalen Geschmack in deiner Nähe',
            heroLead:
                'verbindet dich mit Bauernhöfen, Bäckereien, Restaurants und regionalen Anbietern — auf der Karte, mit Produkten, Bewertungen und Favoriten. Bewusst genießen, lokal unterstützen.',
            metaPwa: '📲 PWA – installierbar',
            metaMap: '🗺️ Interaktive Karte',
            metaLangs: '🌍 36 Sprachen',
            phoneMapTitle: '🗺️ Karte',
            phoneMapText: 'Produzenten in der Nähe finden',
            phoneProductTitle: '🍞 Bauernbrot',
            phoneProductText: '3,50 € · Bäckerei regional',
            phoneRatingTitle: '★ 4,8',
            phoneRatingText: 'Bewertungen von Kunden',
            featuresTitle: 'Alles für bewussten Genuss aus der Region',
            featuresLead:
                'Von der Entdeckung auf der Karte bis zur Bestellung — eine App für Konsumenten und Produzenten.',
            featMapTitle: 'Interaktive Karte',
            featMapText:
                'Finde Bauernhöfe, Bäckereien, Restaurants und Automaten in deiner Umgebung — mit Filtern und Suchradius.',
            featProductsTitle: 'Produkte & Angebote',
            featProductsText:
                'Sieh Produkte mit Preisen, Fotos und Aktionen direkt beim Produzenten — transparent und aktuell.',
            featFavTitle: 'Favoriten & Warenkorb',
            featFavText:
                'Speichere Lieblingsorte und sammle regionale Produkte für deinen nächsten Einkauf.',
            featReviewsTitle: 'Bewertungen',
            featReviewsText:
                'Teile Erfahrungen mit anderen — inklusive optionaler Fotos zu deiner Bewertung.',
            featPanelTitle: 'Produzenten-Panel',
            featPanelText:
                'Unternehmer verwalten Profil, Produkte, Preise, Aktionen und Fotos — sichtbar auf der Karte.',
            featPwaTitle: 'PWA & Offline',
            featPwaText:
                'Installiere die App auf dem Homescreen, erhalte Benachrichtigungen und nutze Kernfunktionen auch offline.',
            shotsTitle: 'Ein Blick in die App',
            shotsLead:
                'Modern, übersichtlich und für Smartphone optimiert — hier ein Vorgeschmack (Platzhalter-Screenshots).',
            shotHome: 'Startseite',
            shotHomeTitle: 'Start & Empfehlungen',
            shotHomeText: 'Regionale Highlights und Kategorien auf einen Blick.',
            shotMap: 'Karte',
            shotMapTitle: 'Karte & Suche',
            shotMapText: 'Produzenten finden, filtern und Details öffnen.',
            shotProfile: 'Profil',
            shotProfileTitle: 'Profil & Panel',
            shotProfileText: 'Konto, Favoriten, Bewertungen und Unternehmerbereich.',
            howTitle: "So funktioniert's",
            howLead: 'In drei Schritten zum regionalen Einkaufserlebnis.',
            step1Title: 'App öffnen',
            step1Text:
                'Starte Regionaler Geschmack im Browser oder installiere die PWA auf deinem Gerät.',
            step2Title: 'Entdecken',
            step2Text:
                'Nutze die Karte oder Startseite, um Anbieter und Produkte in deiner Nähe zu finden.',
            step3Title: 'Genießen',
            step3Text:
                'Speichere Favoriten, lies Bewertungen und kontaktiere Produzenten direkt.',
            ctaBannerTitle: 'Bereit für regionalen Geschmack?',
            ctaBannerText:
                'Öffne die App jetzt — kostenlos, ohne Installation, direkt im Browser. Ideal für die Region und darüber hinaus.',
            ctaBannerLink: 'Zur App →',
            footerLine: '© 2026 Regionaler Geschmack · {address}',
            footerToApp: 'Zur Web-App',
            metaTitle: 'Regionaler Geschmack – Regionale Produkte entdecken',
            metaDescription:
                'Regionaler Geschmack – regionale Lebensmittel und Produzenten entdecken. Karte, Favoriten, Bewertungen und mehr.',
            metaKeywords:
                'regional, Lebensmittel, Produzenten, Bauernhof, Karte, lokal, PWA'
        }
    },
    en: {
        meta: {
            title: 'Regionaler Geschmack',
            description:
                'Regionaler Geschmack – discover regional food and producers near you. Map, favorites, reviews.',
            ogDescription: 'Regional food and producers near you.',
            keywords:
                'regional, food, producers, farm, bakery, map, local, organic, farm shop',
            appleTitle: 'Regionaler'
        },
        geo: {
            under50m: '< 50 m',
            meters: '{n} m',
            km: '{n} km',
            kmOneDecimal: '{n} km',
            minutes: '{n} min',
            hours: '{n} h'
        },
        map: {
            radiusKm: '{km} km'
        },
        a11y: {
            feedbackRating: 'Rating'
        },
        help: {
            coopMailSubject: 'Cooperation – Krzysztof Polikarski',
            bugMailSubject: 'Bug report'
        },
        testing: {
            feedbackMailSubject: '[RG Feedback] {rating}/5 · {language}',
            feedbackMailName: 'Name: {name}',
            feedbackMailRating: 'Rating: {rating}/5',
            feedbackMailDevice: 'Device: {device}',
            feedbackMailLanguage: 'Language: {language}',
            feedbackMailUrl: 'URL: {url}',
            feedbackMailUa: 'UA: {ua}'
        },
        ads: {
            partnerMailSubject: 'Regionaler Geschmack – Partnership / Advertising'
        },
        landing: {
            navAria: 'Main navigation',
            navFeatures: 'Features',
            navScreenshots: 'Screenshots',
            navHow: 'How it works',
            ctaOpenApp: 'Open app',
            ctaStart: 'Start the app now →',
            ctaLearnMore: 'Learn more',
            eyebrow: 'Regional · Sustainable · Local',
            heroTitle: 'Discover regional taste near you',
            heroLead:
                'connects you with farms, bakeries, restaurants and regional sellers — on the map, with products, reviews and favorites. Enjoy consciously, support locally.',
            metaPwa: '📲 PWA – installable',
            metaMap: '🗺️ Interactive map',
            metaLangs: '🌍 36 languages',
            phoneMapTitle: '🗺️ Map',
            phoneMapText: 'Find producers nearby',
            phoneProductTitle: '🍞 Farm bread',
            phoneProductText: '€3.50 · Regional bakery',
            phoneRatingTitle: '★ 4.8',
            phoneRatingText: 'Customer reviews',
            featuresTitle: 'Everything for mindful regional enjoyment',
            featuresLead:
                'From discovery on the map to ordering — one app for consumers and producers.',
            featMapTitle: 'Interactive map',
            featMapText:
                'Find farms, bakeries, restaurants and vending points nearby — with filters and search radius.',
            featProductsTitle: 'Products & offers',
            featProductsText:
                'See products with prices, photos and deals at the producer — transparent and up to date.',
            featFavTitle: 'Favorites & cart',
            featFavText:
                'Save favorite places and collect regional products for your next shop.',
            featReviewsTitle: 'Reviews',
            featReviewsText:
                'Share experiences with others — including optional photos with your review.',
            featPanelTitle: 'Producer panel',
            featPanelText:
                'Businesses manage profile, products, prices, deals and photos — visible on the map.',
            featPwaTitle: 'PWA & offline',
            featPwaText:
                'Install the app on your home screen, get notifications and use core features offline.',
            shotsTitle: 'A look inside the app',
            shotsLead:
                'Modern, clear and phone-first — a preview (placeholder screenshots).',
            shotHome: 'Home',
            shotHomeTitle: 'Home & recommendations',
            shotHomeText: 'Regional highlights and categories at a glance.',
            shotMap: 'Map',
            shotMapTitle: 'Map & search',
            shotMapText: 'Find producers, filter and open details.',
            shotProfile: 'Profile',
            shotProfileTitle: 'Profile & panel',
            shotProfileText: 'Account, favorites, reviews and producer area.',
            howTitle: 'How it works',
            howLead: 'Three steps to a regional shopping experience.',
            step1Title: 'Open the app',
            step1Text:
                'Start Regionaler Geschmack in the browser or install the PWA on your device.',
            step2Title: 'Explore',
            step2Text:
                'Use the map or home screen to find sellers and products near you.',
            step3Title: 'Enjoy',
            step3Text:
                'Save favorites, read reviews and contact producers directly.',
            ctaBannerTitle: 'Ready for regional taste?',
            ctaBannerText:
                'Open the app now — free, no install, right in the browser. Ideal for your region and beyond.',
            ctaBannerLink: 'Go to app →',
            footerLine: '© 2026 Regionaler Geschmack · {address}',
            footerToApp: 'To the web app',
            metaTitle: 'Regionaler Geschmack – Discover regional products',
            metaDescription:
                'Regionaler Geschmack – discover regional food and producers. Map, favorites, reviews and more.',
            metaKeywords: 'regional, food, producers, farm, map, local, PWA'
        }
    },
    pl: {
        meta: {
            title: 'Regionaler Geschmack',
            description:
                'Regionaler Geschmack – odkrywaj regionalną żywność i producentów w Twojej okolicy. Mapa, ulubione, opinie.',
            ogDescription: 'Regionalna żywność i producenci w Twojej okolicy.',
            keywords:
                'regionalne, żywność, producenci, gospodarstwo, piekarnia, mapa, lokalne, ekologiczne',
            appleTitle: 'Regionaler'
        },
        geo: {
            under50m: '< 50 m',
            meters: '{n} m',
            km: '{n} km',
            kmOneDecimal: '{n} km',
            minutes: '{n} min',
            hours: '{n} h'
        },
        map: {
            radiusKm: '{km} km'
        },
        a11y: {
            feedbackRating: 'Ocena'
        },
        help: {
            coopMailSubject: 'Współpraca – Krzysztof Polikarski',
            bugMailSubject: 'Zgłoszenie błędu'
        },
        testing: {
            feedbackMailSubject: '[RG Opinie] {rating}/5 · {language}',
            feedbackMailName: 'Imię: {name}',
            feedbackMailRating: 'Ocena: {rating}/5',
            feedbackMailDevice: 'Urządzenie: {device}',
            feedbackMailLanguage: 'Język: {language}',
            feedbackMailUrl: 'URL: {url}',
            feedbackMailUa: 'UA: {ua}'
        },
        ads: {
            partnerMailSubject: 'Regionaler Geschmack – Współpraca / Reklama'
        },
        landing: {
            navAria: 'Nawigacja główna',
            navFeatures: 'Funkcje',
            navScreenshots: 'Zrzuty ekranu',
            navHow: 'Jak to działa',
            ctaOpenApp: 'Otwórz aplikację',
            ctaStart: 'Uruchom aplikację →',
            ctaLearnMore: 'Dowiedz się więcej',
            eyebrow: 'Regionalnie · Zrównoważenie · Lokalnie',
            heroTitle: 'Odkryj regionalny smak w swojej okolicy',
            heroLead:
                'łączy Cię z gospodarstwami, piekarniami, restauracjami i lokalnymi sprzedawcami — na mapie, z produktami, opiniami i ulubionymi. Jedz świadomie, wspieraj lokalnie.',
            metaPwa: '📲 PWA – do instalacji',
            metaMap: '🗺️ Interaktywna mapa',
            metaLangs: '🌍 36 języków',
            phoneMapTitle: '🗺️ Mapa',
            phoneMapText: 'Znajdź producentów w pobliżu',
            phoneProductTitle: '🍞 Chleb wiejski',
            phoneProductText: '3,50 € · Piekarnia regionalna',
            phoneRatingTitle: '★ 4,8',
            phoneRatingText: 'Opinie klientów',
            featuresTitle: 'Wszystko dla świadomego smaku z regionu',
            featuresLead:
                'Od odkrycia na mapie po zamówienie — jedna aplikacja dla konsumentów i producentów.',
            featMapTitle: 'Interaktywna mapa',
            featMapText:
                'Znajdź gospodarstwa, piekarnie, restauracje i automaty w okolicy — z filtrami i promieniem wyszukiwania.',
            featProductsTitle: 'Produkty i oferty',
            featProductsText:
                'Zobacz produkty z cenami, zdjęciami i promocjami u producenta — przejrzyście i na bieżąco.',
            featFavTitle: 'Ulubione i koszyk',
            featFavText:
                'Zapisuj ulubione miejsca i zbieraj regionalne produkty na kolejne zakupy.',
            featReviewsTitle: 'Opinie',
            featReviewsText:
                'Dziel się doświadczeniami — także z opcjonalnymi zdjęciami przy opinii.',
            featPanelTitle: 'Panel producenta',
            featPanelText:
                'Przedsiębiorcy zarządzają profilem, produktami, cenami, promocjami i zdjęciami — widocznymi na mapie.',
            featPwaTitle: 'PWA i offline',
            featPwaText:
                'Zainstaluj aplikację na ekranie głównym, otrzymuj powiadomienia i korzystaj z podstawowych funkcji offline.',
            shotsTitle: 'Zerknij do aplikacji',
            shotsLead:
                'Nowocześnie, czytelnie i pod telefon — przedsmak (zrzuty zastępcze).',
            shotHome: 'Start',
            shotHomeTitle: 'Start i rekomendacje',
            shotHomeText: 'Regionalne wyróżnienia i kategorie w jednym miejscu.',
            shotMap: 'Mapa',
            shotMapTitle: 'Mapa i wyszukiwanie',
            shotMapText: 'Znajdź producentów, filtruj i otwieraj szczegóły.',
            shotProfile: 'Profil',
            shotProfileTitle: 'Profil i panel',
            shotProfileText: 'Konto, ulubione, opinie i strefa producenta.',
            howTitle: 'Jak to działa',
            howLead: 'Trzy kroki do regionalnych zakupów.',
            step1Title: 'Otwórz aplikację',
            step1Text:
                'Uruchom Regionaler Geschmack w przeglądarce lub zainstaluj PWA na urządzeniu.',
            step2Title: 'Odkrywaj',
            step2Text:
                'Użyj mapy lub ekranu głównego, by znaleźć sprzedawców i produkty w pobliżu.',
            step3Title: 'Ciesz się smakiem',
            step3Text:
                'Zapisuj ulubione, czytaj opinie i kontaktuj się z producentami bezpośrednio.',
            ctaBannerTitle: 'Gotowy na regionalny smak?',
            ctaBannerText:
                'Otwórz aplikację teraz — za darmo, bez instalacji, w przeglądarce. Idealna dla Twojego regionu i dalej.',
            ctaBannerLink: 'Do aplikacji →',
            footerLine: '© 2026 Regionaler Geschmack · {address}',
            footerToApp: 'Do aplikacji web',
            metaTitle: 'Regionaler Geschmack – Odkrywaj regionalne produkty',
            metaDescription:
                'Regionaler Geschmack – odkrywaj regionalną żywność i producentów. Mapa, ulubione, opinie i więcej.',
            metaKeywords: 'regionalne, żywność, producenci, gospodarstwo, mapa, lokalne, PWA'
        }
    }
});
