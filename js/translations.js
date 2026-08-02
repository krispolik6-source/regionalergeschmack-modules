// js/translations.js – tłumaczenia UI (bez nazw producentów)
// Licencja: wewnętrzne tłumaczenia aplikacji Regionaler Geschmack

import { ASIAN_LANG_OPTIONS, ASIAN_TRANSLATIONS, ASIAN_CATALOG } from './translations-asian.js';
import { MENU_I18N } from './translations-menu.js';
import { ABOUT_I18N } from './translations-about.js';
import { SEARCH_I18N } from './translations-search.js';
import { TESTING_I18N } from './translations-testing.js';
import { MK } from './translations-mk.js';
import { CONTENT_I18N } from './translations-content.js';
import { ETAP8_I18N } from './translations-etap8.js';
import { I18N_GAP } from './translations-i18n-gap.js';
import { SHELL_META_I18N } from './translations-shell-meta.js';
import { LEGAL_HELP_I18N } from './translations-legal-help.js';
import { LEGAL_HELP_LOCALES } from './translations-legal-help-locales.js';
import { LIVE_REGION_I18N } from './translations-live-region.js';
import { NATURE_CALENDAR_I18N } from './translations-nature-calendar.js';
import { SMART_TODAY_I18N } from './translations-smart-today.js';
import { REGION_STORIES_I18N } from './translations-region-stories.js';
import { CLIMATE_AMBIENT_I18N } from './translations-climate-ambient.js';
import { TASTE_ADVISOR_I18N } from './translations-taste-advisor.js';
import { LIVING_REGION_I18N } from './translations-living-region.js';
import { TASTES_OF_DAY_I18N } from './translations-tastes-of-day.js';
import { LIVING_MAP_I18N } from './translations-living-map.js';
import { PLACE_HISTORY_I18N } from './translations-place-history.js';
import { RETURN_MAGIC_I18N } from './translations-return-magic.js';
import { REGION_SOUL_I18N } from './translations-region-soul.js';
import { REGIONAL_INTEL_I18N } from './translations-regional-intelligence.js';
import { TASTE_DIARY_I18N } from './translations-taste-diary.js';
import { DEV_VAULT_I18N } from './translations-dev-vault.js';
import { HOME_FILL_I18N } from './translations-home-fill.js';
import { RECOMMENDATIONS_LOCALES } from './translations-recommendations-locales.js';
import { HOME_SECTIONS_LOCALES } from './translations-home-sections-locales.js';
import { HOME_REMAINING_LOCALES } from './translations-home-remaining-locales.js';
import { HOME_UI_CORE_LOCALES } from './translations-home-ui-core-locales.js';

/** @typedef {{ code: string, flag: string, label: string, short: string }} LangMeta */

/** @type {readonly LangMeta[]} */
export const LANG_OPTIONS = Object.freeze([
    { code: 'de', flag: '🇩🇪', label: 'Deutsch', short: 'DE' },
    { code: 'en', flag: '🇬🇧', label: 'English', short: 'EN' },
    { code: 'pl', flag: '🇵🇱', label: 'Polski', short: 'PL' },
    { code: 'ru', flag: '🇷🇺', label: 'Русский', short: 'RU' },
    { code: 'tr', flag: '🇹🇷', label: 'Türkçe', short: 'TR' },
    { code: 'fr', flag: '🇫🇷', label: 'Français', short: 'FR' },
    { code: 'es', flag: '🇪🇸', label: 'Español', short: 'ES' },
    { code: 'it', flag: '🇮🇹', label: 'Italiano', short: 'IT' },
    { code: 'nl', flag: '🇳🇱', label: 'Nederlands', short: 'NL' },
    { code: 'cs', flag: '🇨🇿', label: 'Čeština', short: 'CZ' },
    { code: 'sk', flag: '🇸🇰', label: 'Slovenčina', short: 'SK' },
    { code: 'hu', flag: '🇭🇺', label: 'Magyar', short: 'HU' },
    { code: 'ro', flag: '🇷🇴', label: 'Română', short: 'RO' },
    { code: 'bg', flag: '🇧🇬', label: 'Български', short: 'BG' },
    { code: 'el', flag: '🇬🇷', label: 'Ελληνικά', short: 'GR' },
    { code: 'hr', flag: '🇭🇷', label: 'Hrvatski', short: 'HR' },
    { code: 'sr', flag: '🇷🇸', label: 'Српски', short: 'SR' },
    { code: 'mk', flag: '🇲🇰', label: 'Македонски', short: 'MK' },
    { code: 'sl', flag: '🇸🇮', label: 'Slovenščina', short: 'SL' },
    { code: 'lt', flag: '🇱🇹', label: 'Lietuvių', short: 'LT' },
    { code: 'lv', flag: '🇱🇻', label: 'Latviešu', short: 'LV' },
    { code: 'et', flag: '🇪🇪', label: 'Eesti', short: 'ET' },
    { code: 'fi', flag: '🇫🇮', label: 'Suomi', short: 'FI' },
    { code: 'sv', flag: '🇸🇪', label: 'Svenska', short: 'SV' },
    { code: 'no', flag: '🇳🇴', label: 'Norsk', short: 'NO' },
    { code: 'da', flag: '🇩🇰', label: 'Dansk', short: 'DA' },
    { code: 'is', flag: '🇮🇸', label: 'Íslenska', short: 'IS' },
    ...ASIAN_LANG_OPTIONS
]);

export const SUPPORTED_LANGUAGE_CODES = LANG_OPTIONS.map((l) => l.code);

/** Mapowanie kodów regionalnych przeglądarki */
const BROWSER_LANG_MAP = Object.freeze({
    cz: 'cs',
    gr: 'el',
    nb: 'no',
    nn: 'no',
    in: 'id'
});

/** Chiński tradycyjny – kody regionalne przeglądarki */
const ZH_TW_PATTERNS = Object.freeze(['zh-tw', 'zh-hk', 'zh-hant', 'zh-mo']);

function ui(
    nav,
    home,
    categories,
    extra = {}
) {
    return { nav, home, categories, ...extra };
}

function deepMerge(target, source) {
    const out = { ...target };
    for (const key of Object.keys(source)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            out[key] = deepMerge(out[key] || {}, source[key]);
        } else {
            out[key] = source[key];
        }
    }
    return out;
}

const DE = ui(
    { home: 'Home', map: 'Karte', search: 'Suche', premium: 'Premium', favorites: 'Favoriten', cart: 'Warenkorb', profile: 'Profil' },
    {
        heroTitle: 'Unterstütze lokale.<br>Iss bewusst.<br>Lebe besser.',
        heroTagline: '🌍 Entdecke regionale Produzenten in deiner Nähe',
        greeting: 'Guten Tag! 👋',
        welcomeBack: '👋 Willkommen zurück',
        greetingSub: 'Dein Weg durch die Region beginnt hier.',
            getLocation: 'Standort abrufen',
            findNearby: 'Karte öffnen',
            surpriseMe: 'Überrasch mich',
            surpriseNone: 'In der Nähe ist gerade nichts Passendes.',
            surpriseFallbackName: 'ein Ort',
            surpriseNearby: 'Vielleicht magst du: {name}',
            surpriseFavorite: 'Aus deinen Favoriten: {name}',
            surpriseTaste: 'Passt zu dir: {name}',
            surpriseFresh: 'Frisch entdeckt: {name}',
        recommendedTitle: '⭐ Empfohlene Landwirte',
        nearbyTitle: 'In deiner Nähe',
        forYouTitle: 'Für dich empfohlen',
        recentTitle: 'Zuletzt angesehen',
        seasonalTitle: 'Saisonale Produkte',
        quickFilters: 'Schnellfilter',
        quickOpen: 'Geöffnet',
        quickVerified: 'Verifiziert',
        quickNear5: 'Bis 5 km',
        quickBio: 'BIO-Produkte',
        recommendedPlaceholder: 'Bald: kuratierte Empfehlungen aus deiner Region.',
        featured: 'Empfohlene Produzenten',
        ratingNew: '🆕',
        statusOpen: 'Geöffnet',
        statusClosed: 'Geschlossen',
        closesAt: 'schließt um {time}',
        opensAt: 'öffnet um {time}',
        opensTomorrow: 'öffnet morgen um {time}',
        seeAll: 'Alle anzeigen →',
        searchSubmit: 'Suchen',
        categoryCount: '{count} Orte',
        motto: 'Kaufe lokal, unterstütze regionale Produzenten und genieße beste Qualität.',
        featuredItems: {},
        footerCopyright: '© 2026 Regionaler Geschmack',
        searchPlaceholder: 'Produkte, Restaurants, Fast Food, Läden suchen...',
        hubLabel: 'Suche und Schnellzugriff',
        chipsLabel: 'Schnellfilter',
        chip: { products: 'Produkte', restaurants: 'Restaurants', shops: 'Läden', farmers: 'Landwirte', favorites: 'Favoriten' },
        premiumTeaser: 'Exklusive Vorteile für lokale Entdeckungen',
        categoriesTitle: 'Kategorien',
        allCategories: 'Alle Kategorien',
        categoryActionsLabel: 'Schnellfilter nach Kategorie'
    },
    {
        all: { name: 'Alles', desc: 'Alle Kategorien' },
        restaurants: { name: 'Restaurants', desc: 'Regionale Gerichte' },
        fastFood: { name: 'Fast Food', desc: 'Imbiss und Schnellrestaurants' },
        farmers: { name: 'Landwirte', desc: 'Frische Produkte' },
        bakeries: { name: 'Bäckereien', desc: 'Frische Backwaren' },
        meat: { name: 'Fleisch/Fleischereien', desc: 'Regionale Wurstwaren' },
        shops: { name: 'Läden', desc: 'Lokale Produkte' },
        vending: { name: 'Automaten', desc: '24/7' },
        favorites: { name: 'Favoriten', desc: 'Gespeicherte Orte' }
    },
    {
        ads: {
            label: 'Anzeige',
            promoted: 'Gesponsert',
            sectionLabel: 'Hinweise und Partner',
            placeholder: 'Anzeige · Partnerplatz',
            bannerLocalTitle: 'Frisch aus der Region',
            bannerLocalText: 'Entdecke Hofläden und Produzenten in deiner Nähe – ohne Umwege.',
            bannerLocalCta: 'Zur Karte',
            bannerSeasonTitle: 'Saisonal genießen',
            bannerSeasonText: 'Jetzt im Angebot: regionales Gemüse und Spezialitäten der Saison.',
            bannerSeasonCta: 'Entdecken',
            bannerPremiumTitle: 'Mehr aus deiner Region',
            bannerPremiumText: 'Die App wird durch dezente Anzeigen finanziert – Suche und Kontakt bleiben kostenlos.',
            bannerPremiumCta: 'Mehr erfahren',
            bannerPartnerTitle: 'Lokal sichtbar werden',
            bannerPartnerText: 'Du bist Produzent? Platziere einen dezenten Hinweis in der App.',
            bannerPartnerCta: 'Kooperation anfragen',
            bannerBakeryTitle: 'Frisch gebacken',
            bannerBakeryText: 'Regionale Bäckereien mit Tagesangeboten – in deiner Nähe.',
            bannerBakeryCta: 'Bäckereien öffnen',
            popupPremium: 'Premium: Tipps ohne Werbung →',
            popupPartner: 'Als Partner werben →',
            popupLocal: 'Mehr Orte auf der Karte →'
        },
        a11y: { darkMode: 'Dunkelmodus', lightMode: 'Hellmodus', chooseLanguage: 'Sprache wählen', menu: 'Menü', premium: 'Premium', map: 'Karte', searchRadius: 'Suchradius in km', mainNav: 'Hauptnavigation', close: 'Schließen', back: 'Zurück', shareText: 'Text zum Teilen' },
        map: {
            gps: 'GPS',
            osm: 'OSM',
            loadError: 'Karte konnte nicht geladen werden.',
            dataLoading: 'Lade Anbieter…',
            dataCached: 'Es werden zuletzt gespeicherte Daten angezeigt.',
            dataError: 'Daten konnten gerade nicht aktualisiert werden.',
            offlineNotice: 'Keine Internetverbindung. Es werden zuletzt gespeicherte Daten angezeigt.',
            noDataInArea: 'In dieser Umgebung wurden noch keine Orte gefunden.',
            radiusFilter: '🔵 Reichweite: {km} km ({count} Orte)',
            producerList: 'Anbieter in Reichweite',
            listToggle: '📋 Liste ({count})',
            clearFilter: 'Filter zurücksetzen',
            categoryResults: 'Gefunden: {count} Orte',
            edit: 'Bearbeiten',
            searchPlaceholder: 'Produkte, Restaurants, Läden oder Produzenten suchen...',
            legend: 'Legende',
            legendTitle: 'Kategorien auf der Karte',
            styleTitle: 'Kartenstil',
            categoriesTitle: 'Kategorien',
            save: 'Speichern',
            reset: 'Zurücksetzen',
            backToLocationLabel: 'Zurück zum Standort',
            style: { light: 'Hell', dark: 'Dunkel', satellite: 'Satellit', terrain: 'Gelände' }
        },
        regions: {
            label: 'Region',
            useGps: 'Mein Standort (GPS)',
            osnabrueck: 'Osnabrück',
            bielefeld: 'Bielefeld',
            hilter: 'Hilter a.T.W.',
            muenster: 'Münster',
            switched: 'Region: {name} – OSM wird geladen…'
        },
        btn: { details: 'Details', favorite: 'Favorit', favoriteSaved: 'Gespeichert', addToCart: 'In den Warenkorb', addedToCart: 'Hinzugefügt', navigate: 'Navigieren', close: 'Schließen', back: 'Zurück', remove: 'Entfernen', more: 'Mehr', less: 'Weniger', login: 'Anmelden', toMap: 'Zur Karte', discover: 'Produkte entdecken', checkout: 'Zur Kasse', clearCart: 'Warenkorb leeren' },
        favorites: { title: 'Favoriten', subtitle: 'Deine gespeicherten Orte und Produzenten', empty: 'Noch keine Favoriten', emptySub: 'Markiere Produzenten auf der Karte als Favoriten.' },
        cart: { title: 'Warenkorb', subtitle: 'Deine Einkäufe bei regionalen Anbietern', empty: 'Warenkorb ist leer', emptySub: 'Füge Produkte von deinen Lieblingsorten hinzu.', total: 'Gesamt', product: 'Produkt', confirmClear: 'Warenkorb wirklich leeren?' },
        footer: { address: 'Polikarski Krzysztof, Germany' },
        shell: { label: 'Hauptnavigation' },
        profile: { title: 'Profil', subtitle: 'Deine Einstellungen', guest: 'Gast', guestSub: 'Melde dich an, um Favoriten zu speichern und Bestellungen zu verfolgen.', loggedInAs: 'Angemeldet als', accountClient: 'Kundenkonto', accountProducer: 'Unternehmerkonto', consumerSection: 'Konsument / Kunde', consumerDesc: 'Favoriten, Warenkorb, Bewertungen und Einkäufe.', producerSection: 'Unternehmer / Produzent', producerDesc: 'Profil, Produkte, Preise und Aktionen verwalten.', loginAsConsumer: 'Als Kunde anmelden', registerAsConsumer: 'Als Kunde registrieren', loginAsProducer: 'Als Unternehmer anmelden', registerAsProducer: 'Als Unternehmer registrieren', settingsTitle: 'Allgemeine Einstellungen', darkMode: 'Dunkelmodus', notifications: 'Benachrichtigungen', language: 'Sprache' },
        auth: {
            loginTitle: 'Anmelden', registerTitle: 'Registrieren', email: 'E-Mail', password: 'Passwort', passwordConfirm: 'Passwort bestätigen',
            accountType: 'Kontotyp', client: 'Kunde', producer: 'Unternehmer / Produzent',
            login: 'Anmelden', register: 'Registrieren', logout: 'Abmelden', loggedOut: 'Abgemeldet',
            noAccount: 'Noch kein Konto?', hasAccount: 'Bereits ein Konto?', welcome: 'Willkommen!',
            trialNote: 'Kostenlose Testphase – Unternehmerkonten werden später kostenpflichtig.',
            loginAsClient: 'Anmeldung – Kunde', loginAsProducer: 'Anmeldung – Unternehmer',
            registerAsClient: 'Registrierung – Kunde', registerAsProducer: 'Registrierung – Unternehmer',
            registerCategories: 'Wähle deine Kategorien (mehrere möglich)',
            displayName: 'Anzeigename', businessName: 'Firmenname',
            changePassword: 'Passwort ändern', currentPassword: 'Aktuelles Passwort', newPassword: 'Neues Passwort',
            passwordChanged: 'Passwort wurde geändert',
            errors: { invalidEmail: 'Ungültige E-Mail-Adresse.', passwordShort: 'Passwort mindestens 6 Zeichen.', passwordMismatch: 'Passwörter stimmen nicht überein.', emailTaken: 'E-Mail bereits registriert.', invalidCredentials: 'E-Mail oder Passwort falsch.', wrongAccountType: 'Falscher Kontotyp für diese Anmeldung.', categoriesRequired: 'Wähle mindestens eine Kategorie.', notLoggedIn: 'Bitte zuerst anmelden.', notFound: 'Konto nicht gefunden.', generic: 'Anmeldung fehlgeschlagen.' }
        },
        clientPanel: {
            title: 'Kundenbereich', subtitle: 'Profil, Bewertungen und Einkäufe', name: 'Anzeigename', saveProfile: 'Profil speichern', saved: 'Profil gespeichert',
            favoritesTitle: 'Favoriten', cartTitle: 'Warenkorb', noFavorites: 'Keine Favoriten.', noCart: 'Warenkorb ist leer.',
            reviewsTitle: 'Meine Bewertungen', reviewsHint: 'Bewertungen kannst du bei Produzenten auf der Karte hinzufügen.', noReviews: 'Noch keine Bewertungen.',
            findToReview: 'Produzenten auf der Karte finden', ordersTitle: 'Bestellhistorie', ordersHint: 'Demnächst verfügbar – deine Bestellungen erscheinen hier.'
        },
        producerPanel: {
            title: 'Unternehmerbereich', subtitle: 'Profil und Angebot verwalten', tabProfile: 'Profil', tabProducts: 'Produkte', tabPromotions: 'Aktionen', tabPhotos: 'Fotos', tabStats: 'Statistik',
            name: 'Firmenname', description: 'Beschreibung', address: 'Adresse', phone: 'Telefon', email: 'E-Mail', website: 'Website',
            openingHours: 'Öffnungszeiten', openingHoursHint: 'z. B. Mo-Fr 08:00-18:00',
            categories: 'Kategorien (mehrere möglich)',
            lat: 'Breitengrad', lng: 'Längengrad', saveProfile: 'Profil speichern', saved: 'Profil gespeichert',
            productsTitle: 'Produkte', addProduct: 'Produkt hinzufügen', noProducts: 'Noch keine Produkte.', saveProducts: 'Produkte speichern', productsSaved: 'Produkte gespeichert',
            productName: 'Produktname', price: 'Preis (€)', unit: 'Einheit', promo: 'Aktion', productDescription: 'Beschreibung', imageUrl: 'Bild-URL',
            promotionsTitle: 'Aktionen', addPromotion: 'Aktion hinzufügen', noPromotions: 'Noch keine Aktionen.', savePromotions: 'Aktionen speichern', promotionsSaved: 'Aktionen gespeichert',
            promoTitle: 'Titel', promoDescription: 'Beschreibung', promoProduct: 'Produkt', noProductSelected: '— kein Produkt —', discount: 'Rabatt',
            photosTitle: 'Fotos', photoUrl: 'Foto-URL', photoFile: 'Foto vom Gerät', addPhoto: 'Foto hinzufügen', noPhotos: 'Noch keine Fotos.', viewOnMap: 'Auf der Karte anzeigen',
            statsTitle: 'Statistiken', statsHint: 'Demnächst – Aufrufe, Klicks und Bestellungen.',
            highlightProfile: 'Profil hervorheben',
            highlightHint: 'Hebe dein Profil auf der Karte und in Listen hervor – kostenlos, ohne Zahlung in der App.',
            highlightActivated: 'Profil ist hervorgehoben.',
            highlightNote: 'Keine Zahlung in der App – Finanzierung über Anzeigen.',
            highlightRedirect: '',
            highlightActiveNote: 'Dein Profil ist hervorgehoben („Gesponsert”) auf der Karte und in Listen.',
            highlightBenefitMap: 'Kennzeichnung „Gesponsert” auf der Karte',
            highlightBenefitList: 'Bessere Sichtbarkeit in Listen und Empfehlungen',
            premiumActive: 'Premium-Profil',
            premiumActivated: 'Premium-Profil aktiv!'
        },
        msg: { loading: 'Lade...', noProducts: 'Keine Produkte verfügbar.', noOfferProducts: 'Keine Produkte im Angebot.', servicesOnContact: 'Leistungen auf Anfrage verfügbar.', checkoutSoon: 'Kasse – demnächst verfügbar', loginSoon: 'Anmeldung – demnächst verfügbar', menuSoon: 'Menü – demnächst verfügbar', premiumSoon: 'Premium – demnächst verfügbar', locationDenied: 'Standortzugriff verweigert.', locationUnavailable: 'Standort konnte nicht ermittelt werden.', addedToFavorites: 'Zu Favoriten hinzugefügt', removedFromFavorites: 'Aus Favoriten entfernt', addedToCart: 'In den Warenkorb gelegt', removedFromCart: 'Aus dem Warenkorb entfernt', connectionError: 'Verbindungsfehler', viewError: 'Der View konnte nicht geladen werden.', error: 'Fehler', producerUnavailable: 'Produzent wurde entfernt oder ist nicht verfügbar.', producerUnavailableHint: 'Die Daten wurden möglicherweise aktualisiert. Bitte die Karte neu laden.' },
        search: { noResults: 'Keine Ergebnisse für diese Suche.', noResultsFor: "Keine Ergebnisse für '{query}'", resultsCount: '{count} Ergebnisse', emptyCta: 'Karte erkunden' },
        push: {
            title: 'Regionaler Geschmack',
            enabled: 'Benachrichtigungen aktiviert',
            permissionDenied: 'Benachrichtigungen wurden blockiert.',
            newProduct: 'Neues Produkt: {name} bei {producer}',
            newPromotion: 'Neue Aktion: {title} bei {producer}',
            newOffer: 'Neues Angebot bei {producer}',
            seasonalTitle: 'Saisonale Produkte',
            seasonalBody: 'Jetzt im Fokus: {items}',
            nearbyTitle: 'Neu in deiner Nähe',
            nearbyBody: '{name} ist jetzt in der Nähe'
        },
        pwa: {
            install: 'App installieren',
            installHint: 'Installiere die App auf dem Startbildschirm für schnellen Zugriff – auch offline.',
            installed: 'App installiert',
            dismissed: 'Installation abgebrochen'
        },
        product: {
            placeholderImage: 'Beispielbild',
            placeholderNote: 'Beispielhafte Fotografie – nicht das Originalfoto dieses Betriebs.',
            sampleBadge: 'Beispielbild',
            sampleNote: 'Professionelles Beispielbild – nicht das Foto dieses Erzeugers.',
            producerBadge: 'Foto vom Erzeuger',
            producerNote: 'Foto vom Erzeuger – authentische Darstellung.',
            placeBadge: 'Objektfoto',
            placeNote: 'Foto des Ortes (OSM oder Nutzer).',
            availabilityAvailable: 'Verfügbar',
            availabilityLow: 'Wenige verfügbar',
            availabilitySoldout: 'Ausverkauft',
            seasonalBadge: 'Saisonal'
        },
        report: {
            title: 'Fehler melden',
            lead: 'Hilf mit, die Daten aktuell zu halten.',
            reason: 'Grund',
            note: 'Hinweis (optional)',
            notePlaceholder: 'Kurz beschreiben…',
            submit: 'Meldung senden',
            saved: 'Danke – Meldung gespeichert',
            error: 'Meldung konnte nicht gespeichert werden',
            hoursOutdated: 'Öffnungszeiten sind veraltet',
            closed: 'Produzent ist geschlossen',
            wrongPhone: 'Falsche Telefonnummer',
            wrongAddress: 'Falsche Adresse',
            other: 'Sonstiges'
        },
        routes: {
            title: 'Einkaufsrouten',
            subtitle: 'Mehrere Favoriten in einer Tour besuchen.',
            empty: 'Noch keine gespeicherte Route.',
            stops: 'Stopps',
            saveFromFavorites: 'Route aus Favoriten speichern',
            openNow: 'Route jetzt öffnen',
            open: 'Navigieren',
            saved: 'Route gespeichert',
            needTwo: 'Mindestens 2 Favoriten nötig'
        },
        producer: {
            openUntil: 'Geöffnet bis {time}',
            distance: '{distance} m',
            contactTitle: 'Kontakt',
            contactCta: 'Kontakt aufnehmen',
            contactHint: 'Bitte per Telefon, E-Mail oder Website kontaktieren.',
            productsTitle: 'Produkte',
            smartOfferTitle: 'Empfohlenes Angebot',
            mostBought: 'Meist gekauft',
            mostPopular: 'Beliebteste',
            recommendedProducts: 'Empfohlene Produkte',
            relatedRecipes: 'Passende Rezepte',
            promotionsTitle: 'Aktionen',
            showAllPromotions: 'Alle Aktionen anzeigen',
            hideAllPromotions: 'Aktionen ausblenden',
            locationTitle: 'Standort',
            phone: 'Telefon',
            email: 'E-Mail',
            website: 'Website',
            actionsMenu: 'Aktionen',
            actionShare: 'Produkt teilen',
            storyTitle: 'Unsere Geschichte',
            photoAlt: 'Foto des Anbieters',
            amenitiesTitle: 'Ausstattung',
            trustVerified: '✅ Verifiziert',
            trustPending: '🟡 Ausstehend',
            trustCommunity: '🔵 Von der Community bearbeitet',
            trustConfirmed: 'Daten bestätigt',
            trustPartial: 'Daten teilweise',
            amenity: {
                wheelchair: 'Barrierefrei',
                parking: 'Parkplatz',
                delivery: 'Lieferung',
                outdoorSeating: 'Außenbereich',
                wifi: 'WLAN',
                paymentCards: 'Kartenzahlung'
            },
            menuSections: {
                soups: 'Suppen',
                mains: 'Hauptgerichte',
                salads: 'Salate',
                breakfast: 'Frühstück',
                desserts: 'Desserts',
                drinks: 'Getränke'
            },
            types: { farmer: 'Landwirt', bakery: 'Bäckerei', restaurant: 'Restaurant', fast_food: 'Fast Food', meat: 'Metzgerei', shop: 'Supermarkt', vending: 'Automat', honey: 'Imkerei', dairy: 'Molkerei', fruit: 'Obst', vegetables: 'Gemüse', forest: 'Walderzeugnisse', other: 'Anbieter' }
        },
        reviews: {
            title: 'Bewertungen',
            add: 'Bewertung hinzufügen',
            empty: 'Noch keine Bewertungen.',
            userName: 'Ihr Name',
            rating: 'Bewertung',
            comment: 'Kommentar',
            imageUrl: 'Foto-URL (optional)',
            imageUrlHint: 'Link zu einem öffentlichen Bild (https://…)',
            imageFile: 'Foto vom Gerät',
            imageTooLarge: 'Foto zu groß (max. ca. 1 MB)',
            submit: 'Bewertung senden',
            saved: 'Bewertung gespeichert',
            validationError: 'Bitte Name und Kommentar ausfüllen.'
        },
        productDefault: 'Regionales Produkt',
        header: { tagline: 'Unterstützen lokale, lösbare Lösungen. Leben besser.' },
        premium: {
            title: 'Premium',
            subtitle: 'Kostenlose Suche und Kontakt – finanziert durch dezente Anzeigen.',
            adsFundedNote: 'Keine Zahlungen in der App. Regionaler Geschmack wird durch Google-Anzeigen finanziert.',
            featuresTitle: 'Premium-Vorteile',
            feature1Title: 'Empfehlungen',
            feature1Desc: 'Kuratierte regionale Highlights in deiner Nähe.',
            feature2Title: 'Erweiterte Karte',
            feature2Desc: 'Mehr Filter und Routen zu lokalen Anbietern.',
            feature3Title: 'Schnelleres Bestellen',
            feature3Desc: 'Gespeicherte Präferenzen für schnellere Bestellungen.',
            feature4Title: 'Angebots-Tracking',
            feature4Desc: 'Benachrichtigungen über Aktionen und Sonderangebote.',
            cta: 'Premium freischalten',
            loginRequired: 'Melde dich an, um Premium zu nutzen',
            loginHint: 'Premium ist nur für angemeldete Nutzer verfügbar.',
            loginBtn: 'Anmelden',
            trialBadge: '3 Monate kostenlos testen',
            monthlyPlan: 'Monatlich',
            monthlyPrice: '9,99 € / Monat',
            annualPlan: 'Jährlich',
            annualPrice: '89,99 € / Jahr',
            annualSave: '25 % sparen',
            selectPlan: 'Plan wählen',
            activate: 'Premium aktivieren',
            activated: 'Premium ist aktiv!',
            statusActive: 'Premium aktiv',
            trialRemaining: 'Noch {days} Tage Testphase',
            expiresOn: 'Gültig bis {date}',
            paymentSimulated: 'Testmodus – keine Zahlung (simuliert)',
            benefitsUnlocked: 'Premium-Vorteile freigeschaltet',
            planMonthly: 'Monatsabo',
            planAnnual: 'Jahresabo',
            payWithPaypal: 'Premium mit PayPal (3 € / Monat)',
            priceUserMonth: '2–3 € / Monat · PayPal.me 3 €',
            priceProducerMonth: '5–10 € / Monat · PayPal.me 5 €',
            paypalUserNote: 'Einfache PayPal.me-Zahlung – danach zur App zurückkehren.',
            paypalRedirect: 'Weiterleitung zu PayPal…',
            confirmPaid: 'Hast du die PayPal-Zahlung abgeschlossen? Premium jetzt aktivieren?',
            paypalActiveNote: 'Aktiviert über PayPal.me',
            trialActivateTitle: '3 Monate kostenlos testen',
            trialActivateLead: 'Aktiviere {months} Monate Premium kostenlos. Danach kannst du per PayPal verlängern.',
            trialAcceptTerms: 'Ich akzeptiere die Bedingungen des Testzeitraums',
            trialActivateBtn: '3 Monate kostenlos aktivieren',
            trialTermsRequired: 'Bitte Bedingungen akzeptieren.',
            trialActivated: 'Testzeitraum gestartet!',
            trialActiveBadge: 'Testzeitraum aktiv',
            trialEndingSoon: 'Dein Testzeitraum endet in {days} Tagen',
            trialExpiredTitle: 'Testzeitraum beendet',
            trialExpiredLead: 'Bitte Premium per PayPal freischalten, um weiterzunutzen.',
            trialPayBtn: 'Jetzt bezahlen (PayPal)',
            trialSyncLabel: 'Synchronisation',
            trialSyncAuto: 'Automatisch (alle 24 Std.)',
            trialSyncManual: 'Manuell',
            trialRefresh: 'Aktualisieren',
            trialSynced: 'Status aktualisiert',
            trialSyncAutoOn: 'Auto-Sync aktiv',
            trialSyncManualOn: 'Manuelle Sync aktiv',
            trialErrors: {
                notLoggedIn: 'Bitte anmelden',
                termsRequired: 'Bedingungen erforderlich',
                alreadyPaid: 'Premium ist bereits aktiv',
                alreadyStarted: 'Testzeitraum wurde bereits gestartet'
            }
        },
        referral: {
            title: 'Freunde werben',
            subtitle: 'Teile deinen Code – beide erhalten +{months} Monate Premium gratis.',
            yourCode: 'Dein Code',
            copy: 'Kopieren',
            copied: 'Code kopiert!',
            status: 'Du hast {count} Personen geworben. Du hast {months} Monate gratis erhalten.',
            usedCode: 'Registriert mit Code: {code}',
            registerLabel: 'Empfehlungscode (optional)',
            registerHint: 'Hast du einen Code? Format REGIO-XXXX',
            bonusApplied: '+{months} Monate Premium für dich und deinen Werber!',
            errors: { invalid: 'Ungültiger Empfehlungscode' }
        }
    }
);

const EN = ui(
    { home: 'Home', map: 'Map', search: 'Search', premium: 'Premium', favorites: 'Favorites', cart: 'Cart', profile: 'Profile' },
    {
        heroTitle: 'Support local.<br>Eat consciously.<br>Live better.',
        heroTagline: '🌍 Discover regional producers near you',
        greeting: 'Good day! 👋',
        welcomeBack: '👋 Welcome back',
        greetingSub: 'Your journey through the region starts here.',
            getLocation: 'Get location',
            findNearby: 'Open map',
            surpriseMe: 'Surprise me',
            surpriseNone: 'Nothing suitable nearby right now.',
            surpriseFallbackName: 'a place',
            surpriseNearby: 'You might like: {name}',
            surpriseFavorite: 'From your favorites: {name}',
            surpriseTaste: 'Fits you: {name}',
            surpriseFresh: 'Fresh find: {name}',
        recommendedTitle: '⭐ Recommended farmers',
        nearbyTitle: 'Nearest to you',
        forYouTitle: 'Recommended for you',
        recentTitle: 'Recently viewed',
        seasonalTitle: 'Seasonal products',
        quickFilters: 'Quick filters',
        quickOpen: 'Open now',
        quickVerified: 'Verified',
        quickNear5: 'Within 5 km',
        quickBio: 'Organic (BIO)',
        recommendedPlaceholder: 'Coming soon: curated picks from your region.',
        featured: 'Recommended producers',
        ratingNew: '🆕',
        statusOpen: 'Open',
        statusClosed: 'Closed',
        closesAt: 'closes at {time}',
        opensAt: 'opens at {time}',
        opensTomorrow: 'opens tomorrow at {time}',
        seeAll: 'See all →',
        searchSubmit: 'Search',
        categoryCount: '{count} places',
        motto: 'Buy local, support regional producers and enjoy the best quality.',
        featuredItems: {},
        footerCopyright: '© 2026 Regionaler Geschmack',
        searchPlaceholder: 'Search products, restaurants, fast food, shops...',
        hubLabel: 'Search and quick access',
        chipsLabel: 'Quick filters',
        chip: { products: 'Products', restaurants: 'Restaurants', shops: 'Shops', farmers: 'Farmers', favorites: 'Favorites' },
        premiumTeaser: 'Exclusive benefits for local discovery',
        categoriesTitle: 'Categories',
        allCategories: 'All categories',
        categoryActionsLabel: 'Quick category filters'
    },
    {
        all: { name: 'All', desc: 'All categories' },
        restaurants: { name: 'Restaurants', desc: 'Regional dishes' },
        fastFood: { name: 'Fast Food', desc: 'Quick service and takeaway' },
        farmers: { name: 'Farmers', desc: 'Fresh products' },
        bakeries: { name: 'Bakeries', desc: 'Fresh baked goods' },
        meat: { name: 'Meat / Butchers', desc: 'Regional sausages' },
        shops: { name: 'Shops', desc: 'Local products' },
        vending: { name: 'Vending', desc: '24/7' },
        favorites: { name: 'Favorites', desc: 'Saved places' }
    },
    {
        ads: {
            label: 'Ad',
            promoted: 'Sponsored',
            sectionLabel: 'Tips and partners',
            placeholder: 'Ad · partner slot',
            bannerLocalTitle: 'Fresh from your region',
            bannerLocalText: 'Discover farm shops and producers nearby – without the detours.',
            bannerLocalCta: 'Open map',
            bannerSeasonTitle: 'Enjoy the season',
            bannerSeasonText: 'Regional vegetables and seasonal specialties available now.',
            bannerSeasonCta: 'Explore',
            bannerPremiumTitle: 'More from your region',
            bannerPremiumText: 'The app is funded by subtle ads – search and contact stay free.',
            bannerPremiumCta: 'Learn more',
            bannerPartnerTitle: 'Get local visibility',
            bannerPartnerText: 'Are you a producer? Place a subtle tip in the app.',
            bannerPartnerCta: 'Ask about partnership',
            bannerBakeryTitle: 'Freshly baked',
            bannerBakeryText: 'Regional bakeries with daily offers near you.',
            bannerBakeryCta: 'Open bakeries',
            popupPremium: 'Premium: tips without ads →',
            popupPartner: 'Advertise as a partner →',
            popupLocal: 'More places on the map →'
        },
        a11y: { darkMode: 'Dark mode', lightMode: 'Light mode', chooseLanguage: 'Choose language', menu: 'Menu', premium: 'Premium', map: 'Map', searchRadius: 'Search radius in km', mainNav: 'Main navigation', close: 'Close', back: 'Back', shareText: 'Share text' },
        map: {
            gps: 'GPS',
            osm: 'OSM',
            loadError: 'Map could not be loaded.',
            dataLoading: 'Loading providers…',
            dataCached: 'Showing your recently saved data.',
            dataError: 'Could not refresh places right now.',
            offlineNotice: 'You are offline. Showing your recently saved data.',
            noDataInArea: 'No places found in this area yet.',
            radiusFilter: '🔵 Radius: {km} km ({count} places)',
            producerList: 'Providers in range',
            listToggle: '📋 List ({count})',
            clearFilter: 'Clear filter',
            categoryResults: 'Found {count} places',
            edit: 'Edit',
            searchPlaceholder: 'Search products, restaurants, shops...',
            legend: 'Legend',
            legendTitle: 'Map categories',
            styleTitle: 'Map style',
            categoriesTitle: 'Categories',
            save: 'Save',
            reset: 'Reset',
            backToLocationLabel: 'Back to location',
            style: { light: 'Light', dark: 'Dark', satellite: 'Satellite', terrain: 'Terrain' }
        },
        regions: {
            label: 'Region',
            useGps: 'My location (GPS)',
            osnabrueck: 'Osnabrück',
            bielefeld: 'Bielefeld',
            hilter: 'Hilter a.T.W.',
            muenster: 'Münster',
            switched: 'Region: {name} – loading OSM…'
        },
        btn: { details: 'Details', favorite: 'Favorite', favoriteSaved: 'Saved', addToCart: 'Add to cart', addedToCart: 'Added', navigate: 'Navigate', close: 'Close', back: 'Back', remove: 'Remove', more: 'More', less: 'Less', login: 'Sign in', toMap: 'Go to map', discover: 'Discover products', checkout: 'Checkout', clearCart: 'Clear cart' },
        favorites: { title: 'Favorites', subtitle: 'Your saved places and producers', empty: 'No favorites yet', emptySub: 'Mark producers on the map as favorites.' },
        cart: { title: 'Cart', subtitle: 'Your purchases from regional providers', empty: 'Cart is empty', emptySub: 'Add products from your favorite places.', total: 'Total', product: 'Product', confirmClear: 'Clear the cart?' },
        footer: { address: 'Polikarski Krzysztof, Germany' },
        shell: { label: 'Main navigation' },
        profile: { title: 'Profile', subtitle: 'Your settings', guest: 'Guest', guestSub: 'Sign in to save favorites and track orders.', loggedInAs: 'Signed in as', accountClient: 'Client account', accountProducer: 'Business account', consumerSection: 'Consumer / Client', consumerDesc: 'Favorites, cart, reviews and purchases.', producerSection: 'Business / Producer', producerDesc: 'Manage profile, products, prices and promotions.', loginAsConsumer: 'Sign in as client', registerAsConsumer: 'Register as client', loginAsProducer: 'Sign in as business', registerAsProducer: 'Register as business', settingsTitle: 'General settings', darkMode: 'Dark mode', notifications: 'Notifications', language: 'Language' },
        auth: {
            loginTitle: 'Sign in', registerTitle: 'Register', email: 'Email', password: 'Password', passwordConfirm: 'Confirm password',
            accountType: 'Account type', client: 'Client', producer: 'Business / Producer',
            login: 'Sign in', register: 'Register', logout: 'Sign out', loggedOut: 'Signed out',
            noAccount: 'No account yet?', hasAccount: 'Already have an account?', welcome: 'Welcome!',
            trialNote: 'Free trial period – business accounts will be paid later.',
            loginAsClient: 'Sign in – client', loginAsProducer: 'Sign in – business',
            registerAsClient: 'Register – client', registerAsProducer: 'Register – business',
            registerCategories: 'Select your categories (multiple allowed)',
            displayName: 'Display name', businessName: 'Business name',
            changePassword: 'Change password', currentPassword: 'Current password', newPassword: 'New password',
            passwordChanged: 'Password changed',
            errors: { invalidEmail: 'Invalid email address.', passwordShort: 'Password must be at least 6 characters.', passwordMismatch: 'Passwords do not match.', emailTaken: 'Email already registered.', invalidCredentials: 'Incorrect email or password.', wrongAccountType: 'Wrong account type for this sign-in.', categoriesRequired: 'Select at least one category.', notLoggedIn: 'Please sign in first.', notFound: 'Account not found.', generic: 'Sign-in failed.' }
        },
        clientPanel: {
            title: 'Client area', subtitle: 'Profile, reviews and purchases', name: 'Display name', saveProfile: 'Save profile', saved: 'Profile saved',
            favoritesTitle: 'Favorites', cartTitle: 'Cart', noFavorites: 'No favorites.', noCart: 'Cart is empty.',
            reviewsTitle: 'My reviews', reviewsHint: 'Add reviews on producer pages on the map.', noReviews: 'No reviews yet.',
            findToReview: 'Find producers on map', ordersTitle: 'Order history', ordersHint: 'Coming soon – your orders will appear here.'
        },
        producerPanel: {
            title: 'Business area', subtitle: 'Manage profile and offers', tabProfile: 'Profile', tabProducts: 'Products', tabPromotions: 'Promotions', tabPhotos: 'Photos', tabStats: 'Statistics',
            name: 'Business name', description: 'Description', address: 'Address', phone: 'Phone', email: 'Email', website: 'Website',
            openingHours: 'Opening hours', openingHoursHint: 'e.g. Mo-Fr 08:00-18:00',
            categories: 'Categories (multiple allowed)',
            lat: 'Latitude', lng: 'Longitude', saveProfile: 'Save profile', saved: 'Profile saved',
            productsTitle: 'Products', addProduct: 'Add product', noProducts: 'No products yet.', saveProducts: 'Save products', productsSaved: 'Products saved',
            productName: 'Product name', price: 'Price (€)', unit: 'Unit', promo: 'Promotion', productDescription: 'Description', imageUrl: 'Image URL',
            promotionsTitle: 'Promotions', addPromotion: 'Add promotion', noPromotions: 'No promotions yet.', savePromotions: 'Save promotions', promotionsSaved: 'Promotions saved',
            promoTitle: 'Title', promoDescription: 'Description', promoProduct: 'Product', noProductSelected: '— no product —', discount: 'Discount',
            photosTitle: 'Photos', photoUrl: 'Photo URL', photoFile: 'Photo from device', addPhoto: 'Add photo', noPhotos: 'No photos yet.', viewOnMap: 'View on map',
            statsTitle: 'Statistics', statsHint: 'Coming soon – views, clicks and orders.',
            highlightProfile: 'Highlight profile',
            highlightHint: 'Highlight your profile on the map and in lists – free, no in-app payment.',
            highlightActivated: 'Profile highlighted.',
            highlightNote: 'No in-app payments – the app is funded by ads.',
            highlightRedirect: '',
            highlightActiveNote: 'Your profile is highlighted (“Promoted”) on the map and in lists.',
            highlightBenefitMap: '“Promoted” badge on the map',
            highlightBenefitList: 'Better visibility in lists and recommendations',
            premiumActive: 'Premium profile',
            premiumActivated: 'Premium profile active!'
        },
        msg: { loading: 'Just a moment…', noProducts: 'No products available yet.', noOfferProducts: 'No products on offer right now.', servicesOnContact: 'Services available on request.', checkoutSoon: 'Checkout – coming soon', loginSoon: 'Sign in – coming soon', menuSoon: 'Menu – coming soon', premiumSoon: 'Premium – coming soon', locationDenied: 'Location access denied.', locationUnavailable: 'Could not determine your location.', addedToFavorites: 'Added to favorites', removedFromFavorites: 'Removed from favorites', addedToCart: 'Added to cart', removedFromCart: 'Removed from cart', connectionError: 'Connection problem. Please try again.', viewError: 'This screen could not be opened.', error: 'Something went wrong.',             producerUnavailable: 'This place is currently unavailable.', producerUnavailableHint: 'Try opening the map again.' },
        search: { noResults: 'No results for this search.', noResultsFor: "No results for '{query}'", resultsCount: '{count} results', emptyCta: 'Browse the map' },
        push: {
            title: 'Regionaler Geschmack',
            enabled: 'Notifications enabled',
            permissionDenied: 'Notifications were blocked.',
            newProduct: 'New product: {name} at {producer}',
            newPromotion: 'New promotion: {title} at {producer}',
            newOffer: 'New offer at {producer}',
            seasonalTitle: 'Seasonal products',
            seasonalBody: 'In season now: {items}',
            nearbyTitle: 'New nearby',
            nearbyBody: '{name} is now nearby'
        },
        pwa: {
            install: 'Install app',
            installHint: 'Install the app on your home screen for quick access – even offline.',
            installed: 'App installed',
            dismissed: 'Installation cancelled'
        },
        producer: {
            openUntil: 'Open until {time}',
            distance: '{distance} m',
            contactTitle: 'Contact',
            contactCta: 'Get in touch',
            contactHint: 'Please contact by phone, email or website.',
            productsTitle: 'Products',
            smartOfferTitle: 'Smart picks',
            mostBought: 'Most bought',
            mostPopular: 'Most popular',
            recommendedProducts: 'Recommended products',
            relatedRecipes: 'Related recipes',
            promotionsTitle: 'Promotions',
            showAllPromotions: 'Show all promotions',
            hideAllPromotions: 'Hide promotions',
            locationTitle: 'Location',
            phone: 'Phone',
            email: 'Email',
            website: 'Website',
            actionsMenu: 'Actions',
            actionShare: 'Share product',
            storyTitle: 'Our story',
            photoAlt: 'Producer photo',
            amenitiesTitle: 'Amenities',
            trustVerified: '✅ Verified',
            trustPending: '🟡 Pending',
            trustCommunity: '🔵 Edited by community',
            trustConfirmed: 'Details confirmed',
            trustPartial: 'Partial details',
            amenity: {
                wheelchair: 'Accessible',
                parking: 'Parking',
                delivery: 'Delivery',
                outdoorSeating: 'Outdoor seating',
                wifi: 'Wi‑Fi',
                paymentCards: 'Card payment'
            },
            menuSections: {
                soups: 'Soups',
                mains: 'Main courses',
                salads: 'Salads',
                breakfast: 'Breakfast',
                desserts: 'Desserts',
                drinks: 'Drinks'
            },
            types: { farmer: 'Farmer', bakery: 'Bakery', restaurant: 'Restaurant', fast_food: 'Fast Food', meat: 'Butcher', shop: 'Supermarket', vending: 'Vending machine', honey: 'Apiary', dairy: 'Dairy', fruit: 'Fruit', vegetables: 'Vegetables', forest: 'Forest products', other: 'Provider' }
        },
        product: {
            placeholderImage: 'Sample photo',
            placeholderNote: 'Professional sample photography – not this producer\'s original photo.',
            sampleBadge: 'Sample photo',
            sampleNote: 'Professional sample photo – not a photo of this producer.',
            producerBadge: 'Producer photo',
            producerNote: 'Photo from the producer.',
            placeBadge: 'Place photo',
            placeNote: 'Photo of the place (OSM or user).',
            availabilityAvailable: 'Available',
            availabilityLow: 'Low stock',
            availabilitySoldout: 'Sold out',
            seasonalBadge: 'Seasonal'
        },
        report: {
            title: 'Report an issue',
            lead: 'Help keep listing details up to date.',
            reason: 'Reason',
            note: 'Note (optional)',
            notePlaceholder: 'Brief description…',
            submit: 'Send report',
            saved: 'Thanks – report saved',
            error: 'Could not save the report',
            hoursOutdated: 'Opening hours are outdated',
            closed: 'Producer is closed',
            wrongPhone: 'Wrong phone number',
            wrongAddress: 'Wrong address',
            other: 'Other'
        },
        routes: {
            title: 'Shopping routes',
            subtitle: 'Visit several favourites in one trip.',
            empty: 'No saved route yet.',
            stops: 'stops',
            saveFromFavorites: 'Save route from favourites',
            openNow: 'Open route now',
            open: 'Navigate',
            saved: 'Route saved',
            needTwo: 'At least 2 favourites needed'
        },
        reviews: {
            title: 'Reviews',
            add: 'Add a review',
            empty: 'No reviews yet.',
            userName: 'Your name',
            rating: 'Rating',
            comment: 'Comment',
            imageUrl: 'Photo URL (optional)',
            imageUrlHint: 'Link to a public image (https://…)',
            imageFile: 'Photo from device',
            imageTooLarge: 'Photo too large (max ~1 MB)',
            submit: 'Submit review',
            saved: 'Review saved',
            validationError: 'Please fill in name and comment.'
        },
        productDefault: 'Regional product',
        header: { tagline: 'Support local, sustainable solutions. Live better.' },
        premium: {
            title: 'Premium',
            subtitle: 'Free search and contact – funded by subtle ads.',
            adsFundedNote: 'No payments in the app. Regionaler Geschmack is funded by Google ads.',
            featuresTitle: 'Premium benefits',
            feature1Title: 'Recommendations',
            feature1Desc: 'Curated regional highlights near you.',
            feature2Title: 'Extended map',
            feature2Desc: 'More filters and routes to local providers.',
            feature3Title: 'Faster ordering',
            feature3Desc: 'Saved preferences for quicker checkout.',
            feature4Title: 'Offer tracking',
            feature4Desc: 'Notifications about promotions and special deals.',
            cta: 'Unlock Premium',
            loginRequired: 'Sign in to access Premium',
            loginHint: 'Premium is available for signed-in users only.',
            loginBtn: 'Sign in',
            trialBadge: '3-month free trial',
            monthlyPlan: 'Monthly',
            monthlyPrice: '€9.99 / month',
            annualPlan: 'Annual',
            annualPrice: '€89.99 / year',
            annualSave: 'Save 25%',
            selectPlan: 'Choose a plan',
            activate: 'Activate Premium',
            activated: 'Premium is active!',
            statusActive: 'Premium active',
            trialRemaining: '{days} days left in trial',
            expiresOn: 'Valid until {date}',
            paymentSimulated: 'Test mode – no charge (simulated payment)',
            benefitsUnlocked: 'Premium benefits unlocked',
            planMonthly: 'Monthly plan',
            planAnnual: 'Annual plan',
            payWithPaypal: 'Premium with PayPal (€3 / month)',
            priceUserMonth: '€2–3 / month · PayPal.me €3',
            priceProducerMonth: '€5–10 / month · PayPal.me €5',
            paypalUserNote: 'Simple PayPal.me payment – then return to the app.',
            paypalRedirect: 'Redirecting to PayPal…',
            confirmPaid: 'Did you complete the PayPal payment? Activate Premium now?',
            paypalActiveNote: 'Activated via PayPal.me',
            trialActivateTitle: 'Try 3 months free',
            trialActivateLead: 'Activate {months} months of Premium for free. Afterwards you can continue via PayPal.',
            trialAcceptTerms: 'I accept the trial terms',
            trialActivateBtn: 'Activate 3 months free',
            trialTermsRequired: 'Please accept the terms.',
            trialActivated: 'Trial started!',
            trialActiveBadge: 'Trial active',
            trialEndingSoon: 'Your trial ends in {days} days',
            trialExpiredTitle: 'Trial ended',
            trialExpiredLead: 'Please unlock Premium with PayPal to continue.',
            trialPayBtn: 'Pay now (PayPal)',
            trialSyncLabel: 'Sync',
            trialSyncAuto: 'Automatic (every 24h)',
            trialSyncManual: 'Manual',
            trialRefresh: 'Refresh',
            trialSynced: 'Status updated',
            trialSyncAutoOn: 'Auto-sync on',
            trialSyncManualOn: 'Manual sync on',
            trialErrors: {
                notLoggedIn: 'Please sign in',
                termsRequired: 'Terms required',
                alreadyPaid: 'Premium already active',
                alreadyStarted: 'Trial already started'
            }
        },
        referral: {
            title: 'Refer a friend',
            subtitle: 'Share your code – both get +{months} months of Premium free.',
            yourCode: 'Your code',
            copy: 'Copy',
            copied: 'Code copied!',
            status: 'You referred {count} people. You earned {months} free months.',
            usedCode: 'Signed up with code: {code}',
            registerLabel: 'Referral code (optional)',
            registerHint: 'Have a code? Format REGIO-XXXX',
            bonusApplied: '+{months} months Premium for you and your referrer!',
            errors: { invalid: 'Invalid referral code' }
        }
    }
);

const PL = ui(
    { home: 'Start', map: 'Mapa', search: 'Szukaj', premium: 'Premium', favorites: 'Ulubione', cart: 'Koszyk', profile: 'Profil' },
    {
        heroTitle: 'Wspieraj lokalnych.<br>Jedz świadomie.<br>Żyj lepiej.',
        heroTagline: '🌍 Odkryj regionalnych producentów w pobliżu',
        greeting: 'Dzień dobry! 👋',
        welcomeBack: '👋 Witaj ponownie',
        greetingSub: 'Tu zaczyna się Twoja droga przez region.',
            getLocation: 'Pobierz lokalizację',
            findNearby: 'Otwórz mapę',
            surpriseMe: 'Zaskocz mnie',
            surpriseNone: 'W okolicy nic pasującego na teraz.',
            surpriseFallbackName: 'miejsce',
            surpriseNearby: 'Może spodoba Ci się: {name}',
            surpriseFavorite: 'Z ulubionych: {name}',
            surpriseTaste: 'W Twoim stylu: {name}',
            surpriseFresh: 'Świeżo: {name}',
        recommendedTitle: '⭐ Polecani rolnicy',
        nearbyTitle: 'Najbliżej Ciebie',
        forYouTitle: 'Polecane dla Ciebie',
        recentTitle: 'Ostatnio oglądane',
        seasonalTitle: 'Produkty sezonowe',
        quickFilters: 'Szybkie filtry',
        quickOpen: 'Otwarte',
        quickVerified: 'Zweryfikowane',
        quickNear5: 'Do 5 km',
        quickBio: 'Produkty BIO',
        recommendedPlaceholder: 'Wkrótce: polecane produkty i producenci z Twojej okolicy.',
        featured: 'Polecani producenci',
        ratingNew: '🆕',
        statusOpen: 'Otwarte',
        statusClosed: 'Zamknięte',
        closesAt: 'zamyka o {time}',
        opensAt: 'otwarcie o {time}',
        opensTomorrow: 'otwarcie jutro o {time}',
        seeAll: 'Zobacz wszystkie →',
        searchSubmit: 'Szukaj',
        categoryCount: '{count} miejsc',
        motto: 'Kupuj lokalnie, wspieraj regionalnych producentów i ciesz się najlepszą jakością.',
        featuredItems: {},
        footerCopyright: '© 2026 Regionaler Geschmack',
        searchPlaceholder: 'Szukaj produktów, restauracji, fast foodów, sklepów...',
        hubLabel: 'Wyszukiwarka i szybki dostęp',
        chipsLabel: 'Szybkie filtry',
        chip: { products: 'Produkty', restaurants: 'Restauracje', shops: 'Sklepy', farmers: 'Rolnicy', favorites: 'Ulubione' },
        premiumTeaser: 'Ekskluzywne korzyści z lokalnych odkryć',
        categoriesTitle: 'Kategorie',
        allCategories: 'Wszystkie kategorie',
        categoryActionsLabel: 'Szybkie filtry kategorii'
    },
    {
        all: { name: 'Wszystkie', desc: 'Wszystkie kategorie' },
        restaurants: { name: 'Restauracje', desc: 'Dania regionalne' },
        fastFood: { name: 'Fast Food', desc: 'Fast food i bary' },
        farmers: { name: 'Rolnicy', desc: 'Świeże produkty' },
        bakeries: { name: 'Piekarnie', desc: 'Świeże wypieki' },
        meat: { name: 'Mięso / Rzeźnie', desc: 'Regionalne wędliny' },
        shops: { name: 'Sklepy', desc: 'Lokalne produkty' },
        vending: { name: 'Automaty', desc: '24/7' },
        favorites: { name: 'Ulubione', desc: 'Zapisane miejsca' }
    },
    {
        ads: {
            label: 'Reklama',
            promoted: 'Promowane',
            sectionLabel: 'Wskazówki i partnerzy',
            placeholder: 'Reklama · miejsce na partnera',
            bannerLocalTitle: 'Świeżo z regionu',
            bannerLocalText: 'Odkryj sklepy gospodarskie i producentów w pobliżu – bez zbędnych objazdów.',
            bannerLocalCta: 'Otwórz mapę',
            bannerSeasonTitle: 'Sezonowe smaki',
            bannerSeasonText: 'Regionalne warzywa i specjalności sezonu są teraz dostępne.',
            bannerSeasonCta: 'Odkryj',
            bannerPremiumTitle: 'Więcej z Twojego regionu',
            bannerPremiumText: 'Aplikacja utrzymuje się z dyskretnych reklam – wyszukiwanie i kontakt są darmowe.',
            bannerPremiumCta: 'Zobacz Premium',
            bannerPartnerTitle: 'Bądź widoczny lokalnie',
            bannerPartnerText: 'Jesteś producentem? Umieść delikatną wskazówkę w aplikacji.',
            bannerPartnerCta: 'Zapytaj o współpracę',
            bannerBakeryTitle: 'Świeżo upieczone',
            bannerBakeryText: 'Regionalne piekarnie z ofertą dnia w Twojej okolicy.',
            bannerBakeryCta: 'Otwórz piekarnie',
            popupPremium: 'Premium: wskazówki bez reklam →',
            popupPartner: 'Reklamuj się jako partner →',
            popupLocal: 'Więcej miejsc na mapie →'
        },
        a11y: { darkMode: 'Tryb nocny', lightMode: 'Tryb dzienny', chooseLanguage: 'Wybierz język', menu: 'Menu', premium: 'Premium', map: 'Mapa', searchRadius: 'Promień wyszukiwania w km', mainNav: 'Główna nawigacja', close: 'Zamknij', back: 'Wstecz', shareText: 'Tekst do udostępnienia' },
        map: {
            gps: 'GPS',
            osm: 'OSM',
            loadError: 'Nie udało się załadować mapy.',
            dataLoading: 'Ładowanie dostawców…',
            dataCached: 'Wyświetlane są ostatnio zapisane dane.',
            dataError: 'Nie udało się teraz odświeżyć miejsc.',
            offlineNotice: 'Brak Internetu. Wyświetlane są ostatnio zapisane dane.',
            noDataInArea: 'W tej okolicy nie znaleziono jeszcze miejsc.',
            radiusFilter: '🔵 Zasięg: {km} km ({count} miejsc)',
            producerList: 'Producenci w zasięgu',
            listToggle: '📋 Lista ({count})',
            clearFilter: 'Wyczyść filtr',
            categoryResults: 'Znaleziono {count} miejsc',
            edit: 'Edytuj',
            searchPlaceholder: 'Szukaj produktów, restauracji, sklepów...',
            legend: 'Legenda',
            legendTitle: 'Kategorie na mapie',
            styleTitle: 'Styl mapy',
            categoriesTitle: 'Kategorie',
            save: 'Zapisz',
            reset: 'Reset',
            backToLocationLabel: 'Powrót do lokalizacji',
            style: { light: 'Jasny', dark: 'Ciemny', satellite: 'Satelita', terrain: 'Teren' }
        },
        regions: {
            label: 'Region',
            useGps: 'Moja lokalizacja (GPS)',
            osnabrueck: 'Osnabrück',
            bielefeld: 'Bielefeld',
            hilter: 'Hilter a.T.W.',
            muenster: 'Münster',
            switched: 'Region: {name} – ładuję OSM…'
        },
        btn: { details: 'Szczegóły', favorite: 'Ulubione', favoriteSaved: 'Zapisano', addToCart: 'Dodaj do koszyka', addedToCart: 'Dodano', navigate: 'Nawiguj', close: 'Zamknij', back: 'Wróć', remove: 'Usuń', more: 'Więcej', less: 'Mniej', login: 'Zaloguj się', toMap: 'Przejdź do mapy', discover: 'Odkryj produkty', checkout: 'Do kasy', clearCart: 'Wyczyść koszyk' },
        favorites: { title: 'Ulubione', subtitle: 'Twoje zapisane miejsca i producenci', empty: 'Brak ulubionych', emptySub: 'Oznacz producentów na mapie jako ulubione.' },
        cart: { title: 'Koszyk', subtitle: 'Twoje zakupy u regionalnych dostawców', empty: 'Koszyk jest pusty', emptySub: 'Dodaj produkty z ulubionych miejsc.', total: 'Razem', product: 'Produkt', confirmClear: 'Na pewno wyczyścić koszyk?' },
        footer: { address: 'Polikarski Krzysztof, Germany' },
        shell: { label: 'Główna nawigacja' },
        profile: { title: 'Profil', subtitle: 'Twoje ustawienia', guest: 'Gość', guestSub: 'Zaloguj się, aby zapisywać ulubione i śledzić zamówienia.', loggedInAs: 'Zalogowany jako', accountClient: 'Konto klienta', accountProducer: 'Konto przedsiębiorcy', consumerSection: 'Konsument / Klient', consumerDesc: 'Ulubione, koszyk, opinie i zakupy.', producerSection: 'Przedsiębiorca / Producent', producerDesc: 'Zarządzaj profilem, produktami, cenami i promocjami.', loginAsConsumer: 'Zaloguj jako klient', registerAsConsumer: 'Zarejestruj jako klient', loginAsProducer: 'Zaloguj jako przedsiębiorca', registerAsProducer: 'Zarejestruj jako przedsiębiorca', settingsTitle: 'Ustawienia ogólne', darkMode: 'Tryb nocny', notifications: 'Powiadomienia', language: 'Język' },
        auth: {
            loginTitle: 'Logowanie', registerTitle: 'Rejestracja', email: 'E-mail', password: 'Hasło', passwordConfirm: 'Potwierdź hasło',
            accountType: 'Typ konta', client: 'Klient', producer: 'Przedsiębiorca / Producent',
            login: 'Zaloguj się', register: 'Zarejestruj się', logout: 'Wyloguj się', loggedOut: 'Wylogowano',
            noAccount: 'Nie masz konta?', hasAccount: 'Masz już konto?', welcome: 'Witamy!',
            trialNote: 'Okres testowy za darmo – konta przedsiębiorców będą płatne po testach.',
            loginAsClient: 'Logowanie – klient', loginAsProducer: 'Logowanie – przedsiębiorca',
            registerAsClient: 'Rejestracja – klient', registerAsProducer: 'Rejestracja – przedsiębiorca',
            registerCategories: 'Wybierz kategorie działalności (wiele dozwolone)',
            displayName: 'Nazwa wyświetlana', businessName: 'Nazwa firmy',
            changePassword: 'Zmień hasło', currentPassword: 'Obecne hasło', newPassword: 'Nowe hasło',
            passwordChanged: 'Hasło zostało zmienione',
            errors: { invalidEmail: 'Nieprawidłowy adres e-mail.', passwordShort: 'Hasło musi mieć min. 6 znaków.', passwordMismatch: 'Hasła nie są zgodne.', emailTaken: 'E-mail jest już zarejestrowany.', invalidCredentials: 'Nieprawidłowy e-mail lub hasło.', wrongAccountType: 'Niewłaściwy typ konta dla tego logowania.', categoriesRequired: 'Wybierz co najmniej jedną kategorię.', notLoggedIn: 'Najpierw się zaloguj.', notFound: 'Nie znaleziono konta.', generic: 'Logowanie nie powiodło się.' }
        },
        clientPanel: {
            title: 'Panel klienta', subtitle: 'Profil, opinie i zakupy', name: 'Nazwa wyświetlana', saveProfile: 'Zapisz profil', saved: 'Profil zapisany',
            favoritesTitle: 'Ulubione', cartTitle: 'Koszyk', noFavorites: 'Brak ulubionych.', noCart: 'Koszyk jest pusty.',
            reviewsTitle: 'Moje opinie', reviewsHint: 'Opinie dodajesz na stronach producentów na mapie.', noReviews: 'Brak opinii.',
            findToReview: 'Znajdź producentów na mapie', ordersTitle: 'Historia zamówień', ordersHint: 'Wkrótce dostępne – Twoje zamówienia pojawią się tutaj.'
        },
        producerPanel: {
            title: 'Panel przedsiębiorcy', subtitle: 'Zarządzaj profilem i ofertą', tabProfile: 'Profil', tabProducts: 'Produkty', tabPromotions: 'Promocje', tabPhotos: 'Zdjęcia', tabStats: 'Statystyki',
            name: 'Nazwa firmy', description: 'Opis', address: 'Adres', phone: 'Telefon', email: 'E-mail', website: 'Strona WWW',
            openingHours: 'Godziny otwarcia', openingHoursHint: 'np. Mo-Fr 08:00-18:00',
            categories: 'Kategorie (wiele dozwolone)',
            lat: 'Szerokość geogr.', lng: 'Długość geogr.', saveProfile: 'Zapisz profil', saved: 'Profil zapisany',
            productsTitle: 'Produkty', addProduct: 'Dodaj produkt', noProducts: 'Brak produktów.', saveProducts: 'Zapisz produkty', productsSaved: 'Produkty zapisane',
            productName: 'Nazwa produktu', price: 'Cena (€)', unit: 'Jednostka', promo: 'Promocja', productDescription: 'Opis', imageUrl: 'URL zdjęcia',
            promotionsTitle: 'Promocje', addPromotion: 'Dodaj promocję', noPromotions: 'Brak promocji.', savePromotions: 'Zapisz promocje', promotionsSaved: 'Promocje zapisane',
            promoTitle: 'Tytuł', promoDescription: 'Opis', promoProduct: 'Produkt', noProductSelected: '— brak produktu —', discount: 'Rabat',
            photosTitle: 'Zdjęcia', photoUrl: 'URL zdjęcia', photoFile: 'Zdjęcie z urządzenia', addPhoto: 'Dodaj zdjęcie', noPhotos: 'Brak zdjęć.', viewOnMap: 'Pokaż na mapie',
            statsTitle: 'Statystyki', statsHint: 'Wkrótce – wyświetlenia, kliknięcia i zamówienia.',
            highlightProfile: 'Wyróżnij profil',
            highlightHint: 'Wyróżnij swój profil na mapie i na listach – bezpłatnie, bez płatności w aplikacji.',
            highlightActivated: 'Profil został wyróżniony.',
            highlightNote: 'Brak płatności w aplikacji – utrzymanie z reklam.',
            highlightRedirect: '',
            highlightActiveNote: 'Twój profil jest wyróżniony („Promowane”) na mapie i na listach.',
            highlightBenefitMap: 'Oznaczenie „Promowane” na mapie',
            highlightBenefitList: 'Lepsza widoczność na listach i w rekomendacjach',
            premiumActive: 'Profil Premium',
            premiumActivated: 'Profil Premium aktywny!'
        },
        msg: { loading: 'Ładowanie...', noProducts: 'Brak dostępnych produktów.', noOfferProducts: 'Brak produktów w ofercie.', servicesOnContact: 'Usługi dostępne po kontakcie.', checkoutSoon: 'Kasa – wkrótce dostępna', loginSoon: 'Logowanie – wkrótce dostępne', menuSoon: 'Menu – wkrótce dostępne', premiumSoon: 'Premium – wkrótce dostępne', locationDenied: 'Odmowa dostępu do lokalizacji.', locationUnavailable: 'Nie udało się ustalić lokalizacji.', addedToFavorites: 'Dodano do ulubionych', removedFromFavorites: 'Usunięto z ulubionych', addedToCart: 'Dodano do koszyka', removedFromCart: 'Usunięto z koszyka', connectionError: 'Błąd połączenia', viewError: 'Nie udało się załadować widoku.', error: 'Błąd', producerUnavailable: 'Producent został usunięty lub nie jest dostępny.', producerUnavailableHint: 'Dane mogły zostać odświeżone. Spróbuj ponownie załadować mapę.' },
        search: { noResults: 'Brak wyników dla tego wyszukiwania.', noResultsFor: "Brak wyników dla „{query}”", resultsCount: '{count} wyników', emptyCta: 'Przeglądaj mapę' },
        push: {
            title: 'Regionaler Geschmack',
            enabled: 'Powiadomienia włączone',
            permissionDenied: 'Powiadomienia zostały zablokowane.',
            newProduct: 'Nowy produkt: {name} u {producer}',
            newPromotion: 'Nowa promocja: {title} u {producer}',
            newOffer: 'Nowa oferta u {producer}',
            seasonalTitle: 'Produkty sezonowe',
            seasonalBody: 'Teraz w sezonie: {items}',
            nearbyTitle: 'Nowi w pobliżu',
            nearbyBody: '{name} jest teraz w pobliżu'
        },
        pwa: {
            install: 'Zainstaluj',
            installHint: 'Zainstaluj aplikację na ekranie głównym – szybki dostęp, także offline.',
            installed: 'Aplikacja zainstalowana',
            dismissed: 'Instalacja anulowana'
        },
        producer: {
            openUntil: 'Otwarte do {time}',
            distance: '{distance} m',
            contactTitle: 'Kontakt',
            contactCta: 'Skontaktuj się',
            contactHint: 'Skontaktuj się telefonem, e-mailem lub przez stronę WWW.',
            productsTitle: 'Produkty',
            smartOfferTitle: 'Inteligentna oferta',
            mostBought: 'Najczęściej kupowane',
            mostPopular: 'Najpopularniejsze',
            recommendedProducts: 'Polecane produkty',
            relatedRecipes: 'Powiązane przepisy',
            promotionsTitle: 'Promocje',
            showAllPromotions: 'Pokaż wszystkie promocje',
            hideAllPromotions: 'Ukryj promocje',
            locationTitle: 'Lokalizacja',
            phone: 'Telefon',
            email: 'E-mail',
            website: 'Strona WWW',
            actionsMenu: 'Akcje',
            actionShare: 'Udostępnij produkt',
            storyTitle: 'Nasza historia',
            photoAlt: 'Zdjęcie producenta',
            amenitiesTitle: 'Udogodnienia',
            trustVerified: '✅ Zweryfikowany',
            trustPending: '🟡 Oczekuje',
            trustCommunity: '🔵 Edytowany przez społeczność',
            trustConfirmed: 'Dane potwierdzone',
            trustPartial: 'Dane częściowe',
            amenity: {
                wheelchair: 'Dostępność',
                parking: 'Parking',
                delivery: 'Dostawy',
                outdoorSeating: 'Ogródek',
                wifi: 'Wi‑Fi',
                paymentCards: 'Płatność kartą'
            },
            menuSections: {
                soups: 'Zupy',
                mains: 'Dania główne',
                salads: 'Sałatki',
                breakfast: 'Śniadania',
                desserts: 'Desery',
                drinks: 'Napoje'
            },
            types: { farmer: 'Rolnik', bakery: 'Piekarnia', restaurant: 'Restauracja', fast_food: 'Fast Food', meat: 'Rzeźnia', shop: 'Supermarket', vending: 'Automat', honey: 'Pasieka', dairy: 'Nabiał', fruit: 'Owoce', vegetables: 'Warzywa', forest: 'Produkty leśne', other: 'Dostawca' }
        },
        product: {
            placeholderImage: 'Zdjęcie przykładowe',
            placeholderNote: 'Profesjonalna fotografia przykładowa – nie oryginalne zdjęcie tego miejsca.',
            sampleBadge: 'Zdjęcie przykładowe',
            sampleNote: 'Profesjonalne zdjęcie przykładowe – nie fotografia tego producenta.',
            producerBadge: 'Zdjęcie producenta',
            producerNote: 'Zdjęcie pochodzi od producenta.',
            placeBadge: 'Zdjęcie obiektu',
            placeNote: 'Zdjęcie obiektu (OSM lub użytkownika).',
            availabilityAvailable: 'Dostępny',
            availabilityLow: 'Mała ilość',
            availabilitySoldout: 'Wyprzedane',
            seasonalBadge: 'Sezonowy'
        },
        report: {
            title: 'Zgłoś błąd',
            lead: 'Pomóż utrzymać aktualne dane.',
            reason: 'Powód',
            note: 'Uwaga (opcjonalnie)',
            notePlaceholder: 'Krótki opis…',
            submit: 'Wyślij zgłoszenie',
            saved: 'Dziękujemy – zgłoszenie zapisane',
            error: 'Nie udało się zapisać zgłoszenia',
            hoursOutdated: 'Godziny są nieaktualne',
            closed: 'Producent zamknięty',
            wrongPhone: 'Błędny numer telefonu',
            wrongAddress: 'Błędny adres',
            other: 'Inne'
        },
        routes: {
            title: 'Trasy zakupowe',
            subtitle: 'Odwiedź kilku ulubionych podczas jednej wycieczki.',
            empty: 'Brak zapisanej trasy.',
            stops: 'przystanków',
            saveFromFavorites: 'Zapisz trasę z ulubionych',
            openNow: 'Otwórz trasę teraz',
            open: 'Nawiguj',
            saved: 'Trasa zapisana',
            needTwo: 'Potrzeba co najmniej 2 ulubionych'
        },
        reviews: {
            title: 'Opinie',
            add: 'Dodaj opinię',
            empty: 'Brak opinii.',
            userName: 'Twoje imię',
            rating: 'Ocena',
            comment: 'Komentarz',
            imageUrl: 'URL zdjęcia (opcjonalnie)',
            imageFile: 'Zdjęcie z urządzenia',
            imageTooLarge: 'Zdjęcie za duże (max. ok. 1 MB)',
            imageUrlHint: 'Link do publicznego zdjęcia (https://…)',
            submit: 'Wyślij opinię',
            saved: 'Opinia zapisana',
            validationError: 'Uzupełnij imię i komentarz.'
        },
        productDefault: 'Produkt regionalny',
        header: { tagline: 'Wspieraj lokalnych, świadome rozwiązania. Żyj lepiej.' },
        premium: {
            title: 'Premium',
            subtitle: 'Darmowe wyszukiwanie i kontakt – utrzymanie z dyskretnych reklam.',
            adsFundedNote: 'Brak płatności w aplikacji. Regionaler Geschmack utrzymuje się z reklam Google.',
            featuresTitle: 'Korzyści Premium',
            feature1Title: 'Rekomendacje',
            feature1Desc: 'Wyselekcjonowane regionalne propozycje w pobliżu.',
            feature2Title: 'Rozszerzona mapa',
            feature2Desc: 'Więcej filtrów i tras do lokalnych dostawców.',
            feature3Title: 'Szybsze zamawianie',
            feature3Desc: 'Zapisane preferencje przyspieszają zamówienia.',
            feature4Title: 'Śledzenie ofert',
            feature4Desc: 'Powiadomienia o promocjach i ofertach specjalnych.',
            cta: 'Odblokuj Premium',
            loginRequired: 'Zaloguj się, aby uzyskać dostęp do Premium',
            loginHint: 'Premium jest dostępne tylko dla zalogowanych użytkowników.',
            loginBtn: 'Zaloguj się',
            trialBadge: '3 miesiące za darmo',
            monthlyPlan: 'Miesięczny',
            monthlyPrice: '9,99 € / miesiąc',
            annualPlan: 'Roczny',
            annualPrice: '89,99 € / rok',
            annualSave: 'Oszczędność 25%',
            selectPlan: 'Wybierz plan',
            activate: 'Aktywuj Premium',
            activated: 'Premium jest aktywne!',
            statusActive: 'Premium aktywne',
            trialRemaining: 'Pozostało {days} dni do końca okresu testowego',
            expiresOn: 'Ważne do {date}',
            paymentSimulated: 'Tryb testowy – bez płatności (symulacja)',
            benefitsUnlocked: 'Korzyści Premium odblokowane',
            planMonthly: 'Plan miesięczny',
            planAnnual: 'Plan roczny',
            payWithPaypal: 'Premium przez PayPal (3 € / miesiąc)',
            priceUserMonth: '2–3 € / miesiąc · PayPal.me 3 €',
            priceProducerMonth: '5–10 € / miesiąc · PayPal.me 5 €',
            paypalUserNote: 'Prosta płatność PayPal.me – potem wróć do aplikacji.',
            paypalRedirect: 'Przekierowanie do PayPal…',
            confirmPaid: 'Czy zakończyłeś płatność PayPal? Aktywować Premium teraz?',
            paypalActiveNote: 'Aktywowane przez PayPal.me',
            trialActivateTitle: 'Aktywuj okres testowy',
            trialActivateLead: 'Aktywuj {months} miesiące Premium za darmo. Potem możesz kontynuować przez PayPal.',
            trialAcceptTerms: 'Akceptuję warunki',
            trialActivateBtn: 'Aktywuj 3 miesiące za darmo',
            trialTermsRequired: 'Zaakceptuj warunki.',
            trialActivated: 'Okres testowy uruchomiony!',
            trialActiveBadge: 'Okres testowy aktywny',
            trialEndingSoon: 'Twój okres testowy kończy się za {days} dni',
            trialExpiredTitle: 'Okres testowy zakończony',
            trialExpiredLead: 'Odblokuj Premium przez PayPal, aby kontynuować.',
            trialPayBtn: 'Zapłać (PayPal)',
            trialSyncLabel: 'Synchronizacja',
            trialSyncAuto: 'Automatyczna (co 24h)',
            trialSyncManual: 'Manualna',
            trialRefresh: 'Odśwież',
            trialSynced: 'Status zaktualizowany',
            trialSyncAutoOn: 'Auto-sync włączony',
            trialSyncManualOn: 'Sync manualny włączony',
            trialErrors: {
                notLoggedIn: 'Zaloguj się',
                termsRequired: 'Wymagana akceptacja warunków',
                alreadyPaid: 'Premium już aktywne',
                alreadyStarted: 'Okres testowy już uruchomiony'
            }
        },
        referral: {
            title: 'Poleć znajomemu',
            subtitle: 'Udostępnij swój kod – oboje zyskujecie +{months} miesiące Premium za darmo.',
            yourCode: 'Twój kod',
            copy: 'Kopiuj',
            copied: 'Kod skopiowany!',
            status: 'Poleciłeś {count} osób. Zyskałeś {months} miesięcy za darmo.',
            usedCode: 'Rejestracja z kodem: {code}',
            registerLabel: 'Kod polecający (opcjonalnie)',
            registerHint: 'Masz kod? Format REGIO-XXXX',
            bonusApplied: '+{months} miesiące Premium dla Ciebie i polecającego!',
            errors: { invalid: 'Nieprawidłowy kod polecający' }
        }
    }
);

const RU = ui(
    { home: 'Главная', map: 'Карта', premium: 'Премиум', favorites: 'Избранное', cart: 'Корзина', profile: 'Профиль' },
    {
        heroTitle: 'Поддержи местных.<br>Ешь осознанно.<br>Живи лучше.',
        heroTagline: '🌍 Открой региональных производителей рядом',
        getLocation: 'Получить местоположение',
        findNearby: 'Найти рядом',
        recommendedTitle: '⭐ Рекомендуемые фермеры',
        recommendedPlaceholder: 'Скоро: подборка из вашего региона.',
        featured: '⭐ Рекомендуемые товары',
        footerCopyright: '© 2026 Regionaler Geschmack'
    },
    {
        all: { name: 'Все', desc: 'Все категории' },
        restaurants: { name: 'Рестораны', desc: 'Региональные блюда' },
        fastFood: { name: 'Fast Food', desc: 'Фастфуд' },
        farmers: { name: 'Фермеры', desc: 'Свежие продукты' },
        bakeries: { name: 'Пекарни', desc: 'Свежая выпечка' },
        meat: { name: 'Мясо / Мясные', desc: 'Региональные колбасы' },
        shops: { name: 'Магазины', desc: 'Местные продукты' },
        vending: { name: 'Автоматы', desc: '24/7' },
        favorites: { name: 'Избранное', desc: 'Сохранённые места' }
    },
    {
        a11y: { darkMode: 'Тёмный режим', lightMode: 'Светлый режим', chooseLanguage: 'Выбор языка', menu: 'Меню', premium: 'Премиум', map: 'Карта', searchRadius: 'Радиус поиска в км' },
        map: {
            gps: 'GPS',
            osm: 'OSM',
            loadError: 'Не удалось загрузить карту.',
            dataLoading: 'Загрузка поставщиков…',
            dataCached: 'API недоступен – показаны сохранённые данные.',
            dataError: 'Не удалось загрузить данные.'
        },
        btn: { details: 'Подробнее', favorite: 'Избранное', favoriteSaved: 'Сохранено', addToCart: 'В корзину', addedToCart: 'Добавлено', navigate: 'Навигация', close: 'Закрыть', remove: 'Удалить', more: 'Больше', less: 'Меньше', login: 'Войти', toMap: 'На карту', discover: 'Найти продукты', checkout: 'К оплате', clearCart: 'Очистить корзину' },
        favorites: { title: 'Избранное', subtitle: 'Ваши сохранённые места и производители', empty: 'Пока нет избранного', emptySub: 'Отмечайте производителей на карте.' },
        cart: { title: 'Корзина', subtitle: 'Ваши покупки у региональных поставщиков', empty: 'Корзина пуста', emptySub: 'Добавьте продукты из любимых мест.', total: 'Итого', product: 'Продукт', confirmClear: 'Очистить корзину?' },
        footer: { address: 'Polikarski Krzysztof, Germany' },
        shell: { label: 'Главная навигация' },
        profile: { title: 'Профиль', subtitle: 'Ваши настройки', guest: 'Гость', guestSub: 'Войдите, чтобы сохранять избранное и отслеживать заказы.', darkMode: 'Тёмный режим', notifications: 'Уведомления', language: 'Язык' },
        msg: { loading: 'Загрузка...', noProducts: 'Нет доступных продуктов.', checkoutSoon: 'Оплата – скоро', loginSoon: 'Вход – скоро', addedToFavorites: 'Добавлено в избранное', removedFromFavorites: 'Удалено из избранного', addedToCart: 'Добавлено в корзину', removedFromCart: 'Удалено из корзины', connectionError: 'Ошибка соединения', viewError: 'Не удалось загрузить экран.', error: 'Ошибка' },
        product: { placeholderImage: 'Пример фото', placeholderNote: 'Фото не настоящее. Только для наглядности.' },
        reviews: { title: 'Отзывы', add: 'Добавить отзыв', empty: 'Пока нет отзывов.', userName: 'Ваше имя', rating: 'Оценка', comment: 'Комментарий', submit: 'Отправить', saved: 'Отзыв сохранён' },
        producer: { contactTitle: 'Контакт', productsTitle: 'Товары', locationTitle: 'Местоположение', phone: 'Телефон' },
        productDefault: 'Региональный продукт',
        search: { noResults: 'Нет результатов для этого поиска.' }
    }
);

const TR = ui(
    { home: 'Ana Sayfa', map: 'Harita', premium: 'Premium', favorites: 'Favoriler', cart: 'Sepet', profile: 'Profil' },
    {
        heroTitle: 'Yerel üreticileri destekle.<br>Bilinçli ye.<br>Daha iyi yaşa.',
        heroTagline: '🌍 Yakınındaki bölgesel üreticileri keşfet',
        getLocation: 'Konum al',
        findNearby: 'Yakında bul',
        recommendedTitle: '⭐ Önerilen çiftçiler',
        recommendedPlaceholder: 'Yakında: bölgenizden seçilmiş öneriler.',
        featured: '⭐ Önerilen Ürünler',
        footerCopyright: '© 2026 Regionaler Geschmack'
    },
    {
        all: { name: 'Tümü', desc: 'Tüm kategoriler' },
        restaurants: { name: 'Restoranlar', desc: 'Bölgesel yemekler' },
        fastFood: { name: 'Fast Food', desc: 'Hızlı yemek' },
        farmers: { name: 'Çiftçiler', desc: 'Taze ürünler' },
        bakeries: { name: 'Fırınlar', desc: 'Taze fırın ürünleri' },
        meat: { name: 'Et / Kasaplar', desc: 'Bölgesel sucuklar' },
        shops: { name: 'Mağazalar', desc: 'Yerel ürünler' },
        vending: { name: 'Otomatlar', desc: '7/24' },
        favorites: { name: 'Favoriler', desc: 'Kayıtlı yerler' }
    },
    {
        a11y: { darkMode: 'Karanlık mod', lightMode: 'Aydınlık mod', chooseLanguage: 'Dil seç', menu: 'Menü', premium: 'Premium', map: 'Harita', searchRadius: 'Arama yarıçapı (km)' },
        map: {
            gps: 'GPS',
            osm: 'OSM',
            loadError: 'Harita yüklenemedi.',
            dataLoading: 'Tedarikçiler yükleniyor…',
            dataCached: 'API kullanılamıyor – kayıtlı veriler gösteriliyor.',
            dataError: 'Veriler yüklenemedi.'
        },
        btn: { details: 'Detaylar', favorite: 'Favori', favoriteSaved: 'Kaydedildi', addToCart: 'Sepete ekle', addedToCart: 'Eklendi', navigate: 'Yol tarifi', close: 'Kapat', remove: 'Kaldır', more: 'Daha fazla', less: 'Daha az', login: 'Giriş yap', toMap: 'Haritaya git', discover: 'Ürünleri keşfet', checkout: 'Ödeme', clearCart: 'Sepeti temizle' },
        favorites: { title: 'Favoriler', subtitle: 'Kayıtlı yerlerin ve üreticilerin', empty: 'Henüz favori yok', emptySub: 'Haritada üreticileri favorilere ekle.' },
        cart: { title: 'Sepet', subtitle: 'Bölgesel satıcılardan alışverişlerin', empty: 'Sepet boş', emptySub: 'Favori yerlerinden ürün ekle.', total: 'Toplam', product: 'Ürün', confirmClear: 'Sepeti temizlemek istediğine emin misin?' },
        footer: { address: 'Polikarski Krzysztof, Germany' },
        shell: { label: 'Ana gezinme' },
        profile: { title: 'Profil', subtitle: 'Ayarların', guest: 'Misafir', guestSub: 'Favorileri kaydetmek ve siparişleri takip etmek için giriş yap.', darkMode: 'Karanlık mod', notifications: 'Bildirimler', language: 'Dil' },
        msg: { loading: 'Yükleniyor...', noProducts: 'Ürün bulunamadı.', checkoutSoon: 'Ödeme – yakında', loginSoon: 'Giriş – yakında', addedToFavorites: 'Favorilere eklendi', removedFromFavorites: 'Favorilerden kaldırıldı', addedToCart: 'Sepete eklendi', removedFromCart: 'Sepetten kaldırıldı', connectionError: 'Bağlantı hatası', viewError: 'Ekran yüklenemedi.', error: 'Hata' },
        product: { placeholderImage: 'Örnek fotoğraf', placeholderNote: 'Fotoğraf gerçek değil. Sadece örnek amaçlı.' },
        reviews: { title: 'Yorumlar', add: 'Yorum ekle', empty: 'Henüz yorum yok.', userName: 'Adınız', rating: 'Puan', comment: 'Yorum', submit: 'Gönder', saved: 'Yorum kaydedildi' },
        producer: { contactTitle: 'İletişim', productsTitle: 'Ürünler', locationTitle: 'Konum', phone: 'Telefon' },
        productDefault: 'Bölgesel ürün',
        search: { noResults: 'Bu arama için sonuç yok.' }
    }
);

// Pozostałe języki EU – pełne UI (deepMerge z EN + lokalne nadpisania)
const FR = deepMerge(EN, {
    nav: { home: 'Accueil', map: 'Carte', premium: 'Premium', favorites: 'Favoris', cart: 'Panier', profile: 'Profil' },
    home: { heroTitle: 'Soutenez le local.<br>Mangez conscient.<br>Vivez mieux.', heroTagline: '🌍 Découvrez les producteurs régionaux près de chez vous', getLocation: 'Obtenir la position', findNearby: 'Découvrir sur la carte', recommendedTitle: '⭐ Agriculteurs recommandés', recommendedPlaceholder: 'Bientôt : sélection de votre région.', featured: '⭐ Produits recommandés', footerCopyright: '© 2026 Regionaler Geschmack' },
    categories: { all: { name: 'Tout', desc: 'Toutes catégories' }, restaurants: { name: 'Restaurants', desc: 'Plats régionaux' }, fastFood: { name: 'Fast Food', desc: 'Restauration rapide' }, farmers: { name: 'Agriculteurs', desc: 'Produits frais' }, bakeries: { name: 'Boulangeries', desc: 'Viennoiseries fraîches' }, meat: { name: 'Viande / Boucheries', desc: 'Charcuteries régionales' }, shops: { name: 'Magasins', desc: 'Produits locaux' }, vending: { name: 'Distributeurs', desc: '24/7' }, favorites: { name: 'Favoris', desc: 'Lieux enregistrés' } },
    a11y: { darkMode: 'Mode sombre', lightMode: 'Mode clair', chooseLanguage: 'Choisir la langue', menu: 'Menu', premium: 'Premium', map: 'Carte', searchRadius: 'Rayon de recherche en km' },
    map: { loadError: 'Impossible de charger la carte.', dataLoading: 'Chargement des fournisseurs…', dataCached: 'API indisponible – données enregistrées affichées.', dataError: 'Impossible de charger les données.', radiusFilter: '🔵 Rayon : {km} km ({count} lieux)', searchPlaceholder: 'Rechercher produits, restaurants, magasins...' },
    btn: { details: 'Détails', favorite: 'Favori', favoriteSaved: 'Enregistré', addToCart: 'Ajouter au panier', addedToCart: 'Ajouté', navigate: 'Naviguer', close: 'Fermer', remove: 'Supprimer', login: 'Connexion', toMap: 'Vers la carte', discover: 'Découvrir les produits', checkout: 'Paiement', clearCart: 'Vider le panier' },
    favorites: { title: 'Favoris', subtitle: 'Vos lieux et producteurs enregistrés', empty: 'Pas encore de favoris', emptySub: 'Marquez des producteurs sur la carte.' },
    cart: { title: 'Panier', subtitle: 'Vos achats chez des fournisseurs régionaux', empty: 'Panier vide', emptySub: 'Ajoutez des produits de vos lieux favoris.', total: 'Total' },
    profile: { title: 'Profil', subtitle: 'Vos paramètres', guest: 'Invité', guestSub: 'Connectez-vous pour enregistrer vos favoris.', darkMode: 'Mode sombre', notifications: 'Notifications', language: 'Langue' },
    shell: { label: 'Navigation principale' },
    search: { noResults: 'Aucun résultat pour cette recherche.' },
    reviews: { title: 'Avis', add: 'Ajouter un avis', empty: 'Pas encore d\'avis.', userName: 'Votre nom', rating: 'Note', comment: 'Commentaire', submit: 'Envoyer', saved: 'Avis enregistré' },
    msg: { loading: 'Chargement...', noProducts: 'Aucun produit disponible.', checkoutSoon: 'Paiement – bientôt', loginSoon: 'Connexion – bientôt', addedToFavorites: 'Ajouté aux favoris', removedFromFavorites: 'Retiré des favoris', addedToCart: 'Ajouté au panier', removedFromCart: 'Retiré du panier', connectionError: 'Erreur de connexion', viewError: 'Impossible de charger la vue.', error: 'Erreur' }
});

const ES = deepMerge(EN, {
    nav: { home: 'Inicio', map: 'Mapa', premium: 'Premium', favorites: 'Favoritos', cart: 'Carrito', profile: 'Perfil' },
    home: { heroTitle: 'Apoya lo local.<br>Come con conciencia.<br>Vive mejor.', heroTagline: '🌍 Descubre productores regionales cerca de ti', getLocation: 'Obtener ubicación', findNearby: 'Explorar en el mapa', recommendedTitle: '⭐ Agricultores recomendados', recommendedPlaceholder: 'Pronto: selección de tu región.', featured: '⭐ Productos destacados', footerCopyright: '© 2026 Regionaler Geschmack' },
    categories: { all: { name: 'Todo', desc: 'Todas las categorías' }, restaurants: { name: 'Restaurantes', desc: 'Platos regionales' }, fastFood: { name: 'Fast Food', desc: 'Comida rápida' }, farmers: { name: 'Agricultores', desc: 'Productos frescos' }, bakeries: { name: 'Panaderías', desc: 'Productos de panadería' }, meat: { name: 'Carne / Carnicerías', desc: 'Embutidos regionales' }, shops: { name: 'Tiendas', desc: 'Productos locales' }, vending: { name: 'Máquinas', desc: '24/7' }, favorites: { name: 'Favoritos', desc: 'Lugares guardados' } },
    a11y: { chooseLanguage: 'Elegir idioma', darkMode: 'Modo oscuro', lightMode: 'Modo claro', menu: 'Menú', premium: 'Premium', map: 'Mapa', searchRadius: 'Radio de búsqueda en km' },
    map: { loadError: 'No se pudo cargar el mapa.', dataLoading: 'Cargando proveedores…', dataCached: 'API no disponible – mostrando datos guardados.', dataError: 'No se pudieron cargar los datos.', radiusFilter: '🔵 Radio: {km} km ({count} lugares)', searchPlaceholder: 'Buscar productos, restaurantes, tiendas...' },
    btn: { details: 'Detalles', favorite: 'Favorito', favoriteSaved: 'Guardado', addToCart: 'Añadir al carrito', addedToCart: 'Añadido', navigate: 'Navegar', close: 'Cerrar', remove: 'Eliminar', login: 'Iniciar sesión', toMap: 'Ir al mapa', discover: 'Descubrir productos', checkout: 'Pagar', clearCart: 'Vaciar carrito' },
    favorites: { title: 'Favoritos', subtitle: 'Tus lugares y productores guardados', empty: 'Sin favoritos aún', emptySub: 'Marca productores en el mapa.' },
    cart: { title: 'Carrito', subtitle: 'Tus compras de proveedores regionales', empty: 'Carrito vacío', emptySub: 'Añade productos de tus lugares favoritos.', total: 'Total' },
    profile: { title: 'Perfil', subtitle: 'Tu configuración', guest: 'Invitado', guestSub: 'Inicia sesión para guardar favoritos.', darkMode: 'Modo oscuro', notifications: 'Notificaciones', language: 'Idioma' },
    shell: { label: 'Navegación principal' },
    search: { noResults: 'No hay resultados para esta búsqueda.' },
    reviews: { title: 'Opiniones', add: 'Añadir opinión', empty: 'Sin opiniones aún.', userName: 'Tu nombre', rating: 'Valoración', comment: 'Comentario', submit: 'Enviar', saved: 'Opinión guardada' },
    msg: { loading: 'Cargando...', noProducts: 'No hay productos disponibles.', checkoutSoon: 'Pago – próximamente', loginSoon: 'Inicio de sesión – próximamente', addedToFavorites: 'Añadido a favoritos', removedFromFavorites: 'Eliminado de favoritos', addedToCart: 'Añadido al carrito', removedFromCart: 'Eliminado del carrito', connectionError: 'Error de conexión', viewError: 'No se pudo cargar la vista.', error: 'Error' }
});

const IT = deepMerge(EN, {
    nav: { home: 'Home', map: 'Mappa', premium: 'Premium', favorites: 'Preferiti', cart: 'Carrello', profile: 'Profilo' },
    home: { heroTitle: 'Sostieni il locale.<br>Mangia consapevolmente.<br>Vivi meglio.', heroTagline: '🌍 Scopri i produttori regionali vicino a te', getLocation: 'Ottieni posizione', findNearby: 'Scopri sulla mappa', recommendedTitle: '⭐ Agricoltori consigliati', recommendedPlaceholder: 'Presto: selezione dalla tua regione.', featured: '⭐ Prodotti consigliati', footerCopyright: '© 2026 Regionaler Geschmack' },
    categories: { all: { name: 'Tutto', desc: 'Tutte le categorie' }, restaurants: { name: 'Ristoranti', desc: 'Piatti regionali' }, fastFood: { name: 'Fast Food', desc: 'Fast food' }, farmers: { name: 'Agricoltori', desc: 'Prodotti freschi' }, bakeries: { name: 'Panetterie', desc: 'Prodotti da forno' }, meat: { name: 'Carne / Macellerie', desc: 'Salumi regionali' }, shops: { name: 'Negozi', desc: 'Prodotti locali' }, vending: { name: 'Distributori', desc: '24/7' }, favorites: { name: 'Preferiti', desc: 'Luoghi salvati' } },
    btn: { details: 'Dettagli', favorite: 'Preferito', favoriteSaved: 'Salvato', addToCart: 'Aggiungi al carrello', addedToCart: 'Aggiunto', navigate: 'Naviga', close: 'Chiudi', remove: 'Rimuovi', login: 'Accedi', toMap: 'Vai alla mappa', discover: 'Scopri prodotti', checkout: 'Cassa', clearCart: 'Svuota carrello' },
    favorites: { title: 'Preferiti', subtitle: 'I tuoi luoghi e produttori salvati', empty: 'Nessun preferito', emptySub: 'Segna i produttori sulla mappa.' },
    cart: { title: 'Carrello', subtitle: 'I tuoi acquisti da fornitori regionali', empty: 'Carrello vuoto', emptySub: 'Aggiungi prodotti dai tuoi luoghi preferiti.', total: 'Totale' },
    profile: { title: 'Profilo', subtitle: 'Le tue impostazioni', guest: 'Ospite', guestSub: 'Accedi per salvare i preferiti.', darkMode: 'Modalità scura', notifications: 'Notifiche', language: 'Lingua' },
    shell: { label: 'Navigazione principale' },
    map: { dataLoading: 'Caricamento fornitori…', dataCached: 'API non disponibile – dati salvati mostrati.', dataError: 'Impossibile caricare i dati.', radiusFilter: '🔵 Raggio: {km} km ({count} luoghi)', searchPlaceholder: 'Cerca prodotti, ristoranti, negozi...' },
    search: { noResults: 'Nessun risultato per questa ricerca.' },
    reviews: { title: 'Recensioni', add: 'Aggiungi recensione', empty: 'Nessuna recensione.', userName: 'Il tuo nome', rating: 'Valutazione', comment: 'Commento', submit: 'Invia', saved: 'Recensione salvata' },
    msg: { loading: 'Caricamento...', noProducts: 'Nessun prodotto disponibile.', checkoutSoon: 'Cassa – presto', loginSoon: 'Accesso – presto', addedToFavorites: 'Aggiunto ai preferiti', removedFromFavorites: 'Rimosso dai preferiti', addedToCart: 'Aggiunto al carrello', removedFromCart: 'Rimosso dal carrello', connectionError: 'Errore di connessione', viewError: 'Impossibile caricare la vista.', error: 'Errore' }
});

const NL = deepMerge(EN, {
    nav: { home: 'Home', map: 'Kaart', premium: 'Premium', favorites: 'Favorieten', cart: 'Winkelwagen', profile: 'Profiel' },
    home: { heroTitle: 'Steun lokaal.<br>Eet bewust.<br>Leef beter.', heroTagline: '🌍 Ontdek regionale producenten bij jou in de buurt', getLocation: 'Locatie ophalen', findNearby: 'Ontdek op de kaart', recommendedTitle: '⭐ Aanbevolen boeren', recommendedPlaceholder: 'Binnenkort: selectie uit jouw regio.', featured: '⭐ Aanbevolen producten', footerCopyright: '© 2026 Regionaler Geschmack' },
    categories: { all: { name: 'Alles', desc: 'Alle categorieën' }, restaurants: { name: 'Restaurants', desc: 'Regionale gerechten' }, fastFood: { name: 'Fast Food', desc: 'Fastfood' }, farmers: { name: 'Boeren', desc: 'Verse producten' }, bakeries: { name: 'Bakkerijen', desc: 'Vers gebak' }, meat: { name: 'Vlees / Slagerijen', desc: 'Regionale worst' }, shops: { name: 'Winkels', desc: 'Lokale producten' }, vending: { name: 'Automaten', desc: '24/7' }, favorites: { name: 'Favorieten', desc: 'Opgeslagen plaatsen' } },
    btn: { details: 'Details', favorite: 'Favoriet', favoriteSaved: 'Opgeslagen', addToCart: 'In winkelwagen', addedToCart: 'Toegevoegd', navigate: 'Navigeren', close: 'Sluiten', remove: 'Verwijderen', login: 'Inloggen', toMap: 'Naar kaart', discover: 'Producten ontdekken', checkout: 'Afrekenen', clearCart: 'Winkelwagen legen' },
    favorites: { title: 'Favorieten', subtitle: 'Je opgeslagen plaatsen en producenten', empty: 'Nog geen favorieten', emptySub: 'Markeer producenten op de kaart.' },
    cart: { title: 'Winkelwagen', subtitle: 'Je aankopen bij regionale aanbieders', empty: 'Winkelwagen is leeg', emptySub: 'Voeg producten toe van favoriete plaatsen.', total: 'Totaal' },
    profile: { title: 'Profiel', subtitle: 'Je instellingen', guest: 'Gast', guestSub: 'Log in om favorieten op te slaan.', darkMode: 'Donkere modus', notifications: 'Meldingen', language: 'Taal' },
    shell: { label: 'Hoofdnavigatie' },
    map: { dataLoading: 'Aanbieders laden…', dataCached: 'API niet beschikbaar – opgeslagen gegevens worden getoond.', dataError: 'Gegevens konden niet worden geladen.', radiusFilter: '🔵 Bereik: {km} km ({count} plaatsen)', searchPlaceholder: 'Zoek producten, restaurants, winkels...' },
    search: { noResults: 'Geen resultaten voor deze zoekopdracht.' },
    reviews: { title: 'Beoordelingen', add: 'Beoordeling toevoegen', empty: 'Nog geen beoordelingen.', userName: 'Uw naam', rating: 'Beoordeling', comment: 'Opmerking', submit: 'Verzenden', saved: 'Beoordeling opgeslagen' },
    msg: { loading: 'Laden...', noProducts: 'Geen producten beschikbaar.', checkoutSoon: 'Afrekenen – binnenkort', loginSoon: 'Inloggen – binnenkort', addedToFavorites: 'Toegevoegd aan favorieten', removedFromFavorites: 'Verwijderd uit favorieten', addedToCart: 'Toegevoegd aan winkelwagen', removedFromCart: 'Verwijderd uit winkelwagen', connectionError: 'Verbindingsfout', viewError: 'Weergave kon niet worden geladen.', error: 'Fout' }
});

// Katalog – tłumaczenia opisów producentów z OSM (bez danych demo)
export const CATALOG_TRANSLATIONS = Object.freeze({
    pl: {},
    en: {},
    ru: {},
    tr: {},
    ...ASIAN_CATALOG
});

// Generuj pozostałe języki z EN jako bazą + lokalne nav/home/categories
const EXTRA_LANGS = {
    cs: { nav: { home: 'Domů', map: 'Mapa', favorites: 'Oblíbené', cart: 'Košík', profile: 'Profil' }, home: { getLocation: 'Získat polohu', findNearby: 'Najít v okolí' }, btn: { details: 'Podrobnosti', addToCart: 'Do košíku', navigate: 'Navigovat', close: 'Zavřít' } },
    sk: { nav: { home: 'Domov', map: 'Mapa', favorites: 'Obľúbené', cart: 'Košík', profile: 'Profil' }, home: { getLocation: 'Získať polohu', findNearby: 'Nájsť v okolí' }, btn: { details: 'Podrobnosti', addToCart: 'Do košíka', navigate: 'Navigovať', close: 'Zavrieť' } },
    hu: { nav: { home: 'Kezdőlap', map: 'Térkép', favorites: 'Kedvencek', cart: 'Kosár', profile: 'Profil' }, home: { getLocation: 'Helymeghatározás', findNearby: 'Közeli keresés' }, btn: { details: 'Részletek', addToCart: 'Kosárba', navigate: 'Navigáció', close: 'Bezárás' } },
    ro: { nav: { home: 'Acasă', map: 'Hartă', favorites: 'Favorite', cart: 'Coș', profile: 'Profil' }, home: { getLocation: 'Obține locația', findNearby: 'Găsește în apropiere' }, btn: { details: 'Detalii', addToCart: 'Adaugă în coș', navigate: 'Navigare', close: 'Închide' } },
    bg: { nav: { home: 'Начало', map: 'Карта', favorites: 'Любими', cart: 'Количка', profile: 'Профил' }, home: { getLocation: 'Вземи местоположение', findNearby: 'Намери наблизо' }, btn: { details: 'Подробности', addToCart: 'В количката', navigate: 'Навигация', close: 'Затвори' } },
    el: { nav: { home: 'Αρχική', map: 'Χάρτης', favorites: 'Αγαπημένα', cart: 'Καλάθι', profile: 'Προφίλ' }, home: { getLocation: 'Λήψη τοποθεσίας', findNearby: 'Εύρεση κοντά' }, btn: { details: 'Λεπτομέρειες', addToCart: 'Στο καλάθι', navigate: 'Πλοήγηση', close: 'Κλείσιμο' } },
    hr: { nav: { home: 'Početna', map: 'Karta', favorites: 'Favoriti', cart: 'Košarica', profile: 'Profil' }, home: { getLocation: 'Dohvati lokaciju', findNearby: 'Pronađi u blizini' }, btn: { details: 'Detalji', addToCart: 'U košaricu', navigate: 'Navigacija', close: 'Zatvori' } },
    sr: { nav: { home: 'Почетна', map: 'Мапа', favorites: 'Омиљено', cart: 'Корпа', profile: 'Профил' }, home: { getLocation: 'Преузми локацију', findNearby: 'Пронађи у близини' }, btn: { details: 'Детаљи', addToCart: 'У корпу', navigate: 'Навигација', close: 'Затвори' } },
    sl: { nav: { home: 'Domov', map: 'Zemljevid', favorites: 'Priljubljeno', cart: 'Košarica', profile: 'Profil' }, home: { getLocation: 'Pridobi lokacijo', findNearby: 'Najdi v bližini' }, btn: { details: 'Podrobnosti', addToCart: 'V košarico', navigate: 'Navigacija', close: 'Zapri' } },
    lt: { nav: { home: 'Pradžia', map: 'Žemėlapis', favorites: 'Mėgstami', cart: 'Krepšelis', profile: 'Profilis' }, home: { getLocation: 'Gauti vietą', findNearby: 'Rasti netoliese' }, btn: { details: 'Išsamiau', addToCart: 'Į krepšelį', navigate: 'Navigacija', close: 'Uždaryti' } },
    lv: { nav: { home: 'Sākums', map: 'Karte', favorites: 'Izlase', cart: 'Grozs', profile: 'Profils' }, home: { getLocation: 'Iegūt atrašanās vietu', findNearby: 'Atrast tuvumā' }, btn: { details: 'Detaļas', addToCart: 'Pievienot grozam', navigate: 'Navigācija', close: 'Aizvērt' } },
    et: { nav: { home: 'Avaleht', map: 'Kaart', favorites: 'Lemmikud', cart: 'Ostukorv', profile: 'Profiil' }, home: { getLocation: 'Hangi asukoht', findNearby: 'Leia lähedalt' }, btn: { details: 'Üksikasjad', addToCart: 'Lisa korvi', navigate: 'Navigeeri', close: 'Sulge' } },
    fi: { nav: { home: 'Koti', map: 'Kartta', favorites: 'Suosikit', cart: 'Ostoskori', profile: 'Profiili' }, home: { getLocation: 'Hae sijainti', findNearby: 'Etsi läheltä' }, btn: { details: 'Tiedot', addToCart: 'Lisää koriin', navigate: 'Navigoi', close: 'Sulje' } },
    sv: { nav: { home: 'Hem', map: 'Karta', favorites: 'Favoriter', cart: 'Varukorg', profile: 'Profil' }, home: { getLocation: 'Hämta plats', findNearby: 'Hitta i närheten' }, btn: { details: 'Detaljer', addToCart: 'Lägg i varukorg', navigate: 'Navigera', close: 'Stäng' } },
    no: { nav: { home: 'Hjem', map: 'Kart', favorites: 'Favoritter', cart: 'Handlekurv', profile: 'Profil' }, home: { getLocation: 'Hent posisjon', findNearby: 'Finn i nærheten' }, btn: { details: 'Detaljer', addToCart: 'Legg i handlekurv', navigate: 'Naviger', close: 'Lukk' } },
    da: { nav: { home: 'Hjem', map: 'Kort', favorites: 'Favoritter', cart: 'Kurv', profile: 'Profil' }, home: { getLocation: 'Hent placering', findNearby: 'Find i nærheden' }, btn: { details: 'Detaljer', addToCart: 'Tilføj til kurv', navigate: 'Naviger', close: 'Luk' } },
    is: { nav: { home: 'Heim', map: 'Kort', favorites: 'Uppáhald', cart: 'Karfa', profile: 'Prófíll' }, home: { getLocation: 'Fá staðsetningu', findNearby: 'Finna nálægt' }, btn: { details: 'Nánar', addToCart: 'Setja í körfu', navigate: 'Leiðsögn', close: 'Loka' } }
};

/** Tytuł sekcji „Polecane produkty” – wszystkie 35 języków */
const HOME_FEATURED_I18N = Object.freeze({
    zh: '⭐ 推荐产品',
    'zh-tw': '⭐ 推薦產品',
    ja: '⭐ おすすめ商品',
    ko: '⭐ 추천 제품',
    vi: '⭐ Sản phẩm được đề xuất',
    ms: '⭐ Produk disyorkan',
    id: '⭐ Produk rekomendasi',
    th: '⭐ สินค้าแนะนำ',
    hi: '⭐ अनुशंसित उत्पाद',
    cs: '⭐ Doporučené produkty',
    sk: '⭐ Odporúčané produkty',
    hu: '⭐ Ajánlott termékek',
    ro: '⭐ Produse recomandate',
    bg: '⭐ Препоръчани продукти',
    el: '⭐ Προτεινόμενα προϊόντα',
    hr: '⭐ Preporučeni proizvodi',
    sr: '⭐ Препоручени производи',
    mk: '⭐ Препорачани производи',
    sl: '⭐ Priporočeni izdelki',
    lt: '⭐ Rekomenduojami produktai',
    lv: '⭐ Ieteicamie produkti',
    et: '⭐ Soovitatud tooted',
    fi: '⭐ Suositellut tuotteet',
    sv: '⭐ Rekommenderade produkter',
    no: '⭐ Anbefalte produkter',
    da: '⭐ Anbefalede produkter',
    is: '⭐ Mælt með vörum'
});

const built = { de: DE, en: EN, pl: PL, ru: RU, tr: TR, fr: FR, es: ES, it: IT, nl: NL, mk: MK, ...ASIAN_TRANSLATIONS };
for (const [code, overrides] of Object.entries(EXTRA_LANGS)) {
    built[code] = deepMerge(EN, overrides);
}
const EU_UI_CORE = {
    cs: { favorites: { empty: 'Zatím žádné oblíbené' }, cart: { empty: 'Košík je prázdný', total: 'Celkem' }, search: { noResults: 'Žádné výsledky pro tento dotaz.' }, map: { dataLoading: 'Načítání dodavatelů…', dataCached: 'API nedostupné – zobrazena uložená data.', dataError: 'Data se nepodařilo načíst.', radiusFilter: '🔵 Dosah: {km} km ({count} míst)' }, msg: { addedToFavorites: 'Přidáno do oblíbených', removedFromFavorites: 'Odebráno z oblíbených', addedToCart: 'Přidáno do košíku', removedFromCart: 'Odebráno z košíku', connectionError: 'Chyba připojení' }, reviews: { title: 'Recenze', add: 'Přidat recenzi', userName: 'Vaše jméno', rating: 'Hodnocení', comment: 'Komentář' }, shell: { label: 'Hlavní navigace' } },
    sk: { favorites: { empty: 'Zatiaľ žiadne obľúbené' }, cart: { empty: 'Košík je prázdny', total: 'Spolu' }, search: { noResults: 'Žiadne výsledky pre tento dotaz.' }, map: { dataLoading: 'Načítavanie dodávateľov…', dataCached: 'API nedostupné – zobrazené uložené dáta.', dataError: 'Nepodarilo sa načítať dáta.', radiusFilter: '🔵 Dosah: {km} km ({count} miest)' }, msg: { addedToFavorites: 'Pridané do obľúbených', removedFromFavorites: 'Odstránené z obľúbených', addedToCart: 'Pridané do košíka', removedFromCart: 'Odstránené z košíka', connectionError: 'Chyba pripojenia' }, reviews: { title: 'Recenzie', add: 'Pridať recenziu', userName: 'Vaše meno', rating: 'Hodnotenie', comment: 'Komentár' }, shell: { label: 'Hlavná navigácia' } },
    hu: { favorites: { empty: 'Még nincs kedvenc' }, cart: { empty: 'A kosár üres', total: 'Összesen' }, search: { noResults: 'Nincs találat erre a keresésre.' }, map: { dataLoading: 'Szolgáltatók betöltése…', dataCached: 'API nem elérhető – mentett adatok megjelenítése.', dataError: 'Az adatok betöltése sikertelen.', radiusFilter: '🔵 Hatótáv: {km} km ({count} hely)' }, msg: { addedToFavorites: 'Hozzáadva a kedvencekhez', removedFromFavorites: 'Eltávolítva a kedvencekből', addedToCart: 'Kosárba adva', removedFromCart: 'Eltávolítva a kosárból', connectionError: 'Kapcsolati hiba' }, reviews: { title: 'Értékelések', add: 'Értékelés hozzáadása', userName: 'Neved', rating: 'Értékelés', comment: 'Hozzászólás' }, shell: { label: 'Fő navigáció' } },
    ro: { favorites: { empty: 'Niciun favorit încă' }, cart: { empty: 'Coșul este gol', total: 'Total' }, search: { noResults: 'Niciun rezultat pentru această căutare.' }, map: { dataLoading: 'Se încarcă furnizorii…', dataCached: 'API indisponibil – date salvate afișate.', dataError: 'Datele nu au putut fi încărcate.', radiusFilter: '🔵 Rază: {km} km ({count} locuri)' }, msg: { addedToFavorites: 'Adăugat la favorite', removedFromFavorites: 'Eliminat din favorite', addedToCart: 'Adăugat în coș', removedFromCart: 'Eliminat din coș', connectionError: 'Eroare de conexiune' }, reviews: { title: 'Recenzii', add: 'Adaugă recenzie', userName: 'Numele tău', rating: 'Evaluare', comment: 'Comentariu' }, shell: { label: 'Navigare principală' } },
    bg: { favorites: { empty: 'Все още няма любими' }, cart: { empty: 'Количката е празна', total: 'Общо' }, search: { noResults: 'Няма резултати за това търсене.' }, map: { dataLoading: 'Зареждане на доставчици…', dataCached: 'API недостъпно – показани запазени данни.', dataError: 'Данните не можаха да се заредят.', radiusFilter: '🔵 Обхват: {km} км ({count} места)' }, msg: { addedToFavorites: 'Добавено в любими', removedFromFavorites: 'Премахнато от любими', addedToCart: 'Добавено в количката', removedFromCart: 'Премахнато от количката', connectionError: 'Грешка при връзка' }, reviews: { title: 'Отзиви', add: 'Добави отзив', userName: 'Вашето име', rating: 'Оценка', comment: 'Коментар' }, shell: { label: 'Основна навигация' } },
    el: { favorites: { empty: 'Δεν υπάρχουν αγαπημένα ακόμα' }, cart: { empty: 'Το καλάθι είναι άδειο', total: 'Σύνολο' }, search: { noResults: 'Δεν υπάρχουν αποτελέσματα για αυτή την αναζήτηση.' }, map: { dataLoading: 'Φόρτωση παρόχων…', dataCached: 'API μη διαθέσιμο – εμφάνιση αποθηκευμένων δεδομένων.', dataError: 'Αποτυχία φόρτωσης δεδομένων.', radiusFilter: '🔵 Εμβέλεια: {km} χλμ ({count} μέρη)' }, msg: { addedToFavorites: 'Προστέθηκε στα αγαπημένα', removedFromFavorites: 'Αφαιρέθηκε από τα αγαπημένα', addedToCart: 'Προστέθηκε στο καλάθι', removedFromCart: 'Αφαιρέθηκε από το καλάθι', connectionError: 'Σφάλμα σύνδεσης' }, reviews: { title: 'Κριτικές', add: 'Προσθήκη κριτικής', userName: 'Το όνομά σας', rating: 'Βαθμολογία', comment: 'Σχόλιο' }, shell: { label: 'Κύρια πλοήγηση' } },
    hr: { favorites: { empty: 'Još nema favorita' }, cart: { empty: 'Košarica je prazna', total: 'Ukupno' }, search: { noResults: 'Nema rezultata za ovu pretragu.' }, map: { dataLoading: 'Učitavanje dobavljača…', dataCached: 'API nedostupan – prikaz spremljenih podataka.', dataError: 'Podaci se nisu mogli učitati.', radiusFilter: '🔵 Doseg: {km} km ({count} mjesta)' }, msg: { addedToFavorites: 'Dodano u favorite', removedFromFavorites: 'Uklonjeno iz favorita', addedToCart: 'Dodano u košaricu', removedFromCart: 'Uklonjeno iz košarice', connectionError: 'Greška veze' }, reviews: { title: 'Recenzije', add: 'Dodaj recenziju', userName: 'Vaše ime', rating: 'Ocjena', comment: 'Komentar' }, shell: { label: 'Glavna navigacija' } },
    sr: { favorites: { empty: 'Још нема омиљених' }, cart: { empty: 'Корпа је празна', total: 'Укупно' }, search: { noResults: 'Нема резултата за ову претрагу.' }, map: { dataLoading: 'Учитавање добављача…', dataCached: 'API недоступан – приказ сачуваних података.', dataError: 'Подаци се нису могли учитати.', radiusFilter: '🔵 Досег: {km} km ({count} места)' }, msg: { addedToFavorites: 'Додато у омиљено', removedFromFavorites: 'Уклоњено из омиљеног', addedToCart: 'Додато у корпу', removedFromCart: 'Уклоњено из корпе', connectionError: 'Грешка везе' }, reviews: { title: 'Рецензије', add: 'Додај рецензију', userName: 'Ваше име', rating: 'Оцена', comment: 'Коментар' }, shell: { label: 'Главна навигација' } },
    sl: { favorites: { empty: 'Še ni priljubljenih' }, cart: { empty: 'Košarica je prazna', total: 'Skupaj' }, search: { noResults: 'Ni rezultatov za to iskanje.' }, map: { dataLoading: 'Nalaganje ponudnikov…', dataCached: 'API ni na voljo – prikaz shranjenih podatkov.', dataError: 'Podatkov ni bilo mogoče naložiti.', radiusFilter: '🔵 Doseg: {km} km ({count} krajev)' }, msg: { addedToFavorites: 'Dodano med priljubljene', removedFromFavorites: 'Odstranjeno iz priljubljenih', addedToCart: 'Dodano v košarico', removedFromCart: 'Odstranjeno iz košarice', connectionError: 'Napaka povezave' }, reviews: { title: 'Ocene', add: 'Dodaj oceno', userName: 'Vaše ime', rating: 'Ocena', comment: 'Komentar' }, shell: { label: 'Glavna navigacija' } },
    lt: { favorites: { empty: 'Dar nėra mėgstamų' }, cart: { empty: 'Krepšelis tuščias', total: 'Iš viso' }, search: { noResults: 'Šiai paieškai rezultatų nėra.' }, map: { dataLoading: 'Įkeliami tiekėjai…', dataCached: 'API nepasiekiamas – rodomi išsaugoti duomenys.', dataError: 'Nepavyko įkelti duomenų.', radiusFilter: '🔵 Spindulys: {km} km ({count} vietų)' }, msg: { addedToFavorites: 'Pridėta į mėgstamus', removedFromFavorites: 'Pašalinta iš mėgstamų', addedToCart: 'Pridėta į krepšelį', removedFromCart: 'Pašalinta iš krepšelio', connectionError: 'Ryšio klaida' }, reviews: { title: 'Atsiliepimai', add: 'Pridėti atsiliepimą', userName: 'Jūsų vardas', rating: 'Įvertinimas', comment: 'Komentaras' }, shell: { label: 'Pagrindinė navigacija' } },
    lv: { favorites: { empty: 'Vēl nav izlases' }, cart: { empty: 'Grozs ir tukšs', total: 'Kopā' }, search: { noResults: 'Šai meklēšanai rezultātu nav.' }, map: { dataLoading: 'Ielādē piegādātājus…', dataCached: 'API nav pieejams – rāda saglabātos datus.', dataError: 'Neizdevās ielādēt datus.', radiusFilter: '🔵 Attālums: {km} km ({count} vietas)' }, msg: { addedToFavorites: 'Pievienots izlasei', removedFromFavorites: 'Noņemts no izlases', addedToCart: 'Pievienots grozam', removedFromCart: 'Noņemts no groza', connectionError: 'Savienojuma kļūda' }, reviews: { title: 'Atsauksmes', add: 'Pievienot atsauksmi', userName: 'Jūsu vārds', rating: 'Vērtējums', comment: 'Komentārs' }, shell: { label: 'Galvenā navigācija' } },
    et: { favorites: { empty: 'Lemmikuid veel pole' }, cart: { empty: 'Ostukorv on tühi', total: 'Kokku' }, search: { noResults: 'Selle otsingu jaoks tulemusi pole.' }, map: { dataLoading: 'Tarnijate laadimine…', dataCached: 'API pole saadaval – kuvatakse salvestatud andmeid.', dataError: 'Andmeid ei õnnestunud laadida.', radiusFilter: '🔵 Ulatus: {km} km ({count} kohta)' }, msg: { addedToFavorites: 'Lisatud lemmikutesse', removedFromFavorites: 'Eemaldatud lemmikutest', addedToCart: 'Lisatud korvi', removedFromCart: 'Eemaldatud korvist', connectionError: 'Ühenduse viga' }, reviews: { title: 'Arvustused', add: 'Lisa arvustus', userName: 'Teie nimi', rating: 'Hinnang', comment: 'Kommentaar' }, shell: { label: 'Peamine navigatsioon' } },
    fi: { favorites: { empty: 'Ei vielä suosikkeja' }, cart: { empty: 'Ostoskori on tyhjä', total: 'Yhteensä' }, search: { noResults: 'Ei tuloksia tälle haulle.' }, map: { dataLoading: 'Ladataan toimittajia…', dataCached: 'API ei käytettävissä – näytetään tallennettuja tietoja.', dataError: 'Tietoja ei voitu ladata.', radiusFilter: '🔵 Säde: {km} km ({count} paikkaa)' }, msg: { addedToFavorites: 'Lisätty suosikkeihin', removedFromFavorites: 'Poistettu suosikeista', addedToCart: 'Lisätty koriin', removedFromCart: 'Poistettu korista', connectionError: 'Yhteysvirhe' }, reviews: { title: 'Arvostelut', add: 'Lisää arvostelu', userName: 'Nimesi', rating: 'Arvio', comment: 'Kommentti' }, shell: { label: 'Päänavigointi' } },
    sv: { favorites: { empty: 'Inga favoriter ännu' }, cart: { empty: 'Varukorgen är tom', total: 'Totalt' }, search: { noResults: 'Inga resultat för denna sökning.' }, map: { dataLoading: 'Laddar leverantörer…', dataCached: 'API otillgängligt – visar sparad data.', dataError: 'Kunde inte ladda data.', radiusFilter: '🔵 Räckvidd: {km} km ({count} platser)' }, msg: { addedToFavorites: 'Tillagd i favoriter', removedFromFavorites: 'Borttagen från favoriter', addedToCart: 'Tillagd i varukorgen', removedFromCart: 'Borttagen från varukorgen', connectionError: 'Anslutningsfel' }, reviews: { title: 'Recensioner', add: 'Lägg till recension', userName: 'Ditt namn', rating: 'Betyg', comment: 'Kommentar' }, shell: { label: 'Huvudnavigering' } },
    no: { favorites: { empty: 'Ingen favoritter ennå' }, cart: { empty: 'Handlekurven er tom', total: 'Totalt' }, search: { noResults: 'Ingen resultater for dette søket.' }, map: { dataLoading: 'Laster leverandører…', dataCached: 'API utilgjengelig – viser lagrede data.', dataError: 'Kunne ikke laste data.', radiusFilter: '🔵 Rekkevidde: {km} km ({count} steder)' }, msg: { addedToFavorites: 'Lagt til i favoritter', removedFromFavorites: 'Fjernet fra favoritter', addedToCart: 'Lagt i handlekurven', removedFromCart: 'Fjernet fra handlekurven', connectionError: 'Tilkoblingsfeil' }, reviews: { title: 'Anmeldelser', add: 'Legg til anmeldelse', userName: 'Ditt navn', rating: 'Vurdering', comment: 'Kommentar' }, shell: { label: 'Hovednavigasjon' } },
    da: { favorites: { empty: 'Ingen favoritter endnu' }, cart: { empty: 'Kurven er tom', total: 'I alt' }, search: { noResults: 'Ingen resultater for denne søgning.' }, map: { dataLoading: 'Indlæser leverandører…', dataCached: 'API utilgængelig – viser gemte data.', dataError: 'Kunne ikke indlæse data.', radiusFilter: '🔵 Rækkevidde: {km} km ({count} steder)' }, msg: { addedToFavorites: 'Tilføjet til favoritter', removedFromFavorites: 'Fjernet fra favoritter', addedToCart: 'Tilføjet til kurv', removedFromCart: 'Fjernet fra kurv', connectionError: 'Forbindelsesfejl' }, reviews: { title: 'Anmeldelser', add: 'Tilføj anmeldelse', userName: 'Dit navn', rating: 'Bedømmelse', comment: 'Kommentar' }, shell: { label: 'Hovednavigation' } },
    is: { favorites: { empty: 'Engin uppáhald ennþá' }, cart: { empty: 'Karfan er tóm', total: 'Samtals' }, search: { noResults: 'Engar niðurstöður fyrir þessa leit.' }, map: { dataLoading: 'Hleður birgjum…', dataCached: 'API ekki tiltækt – sýnir vistað gögn.', dataError: 'Gat ekki hlaðið gögnum.', radiusFilter: '🔵 Umfang: {km} km ({count} staðir)' }, msg: { addedToFavorites: 'Bætt við uppáhald', removedFromFavorites: 'Fjarlægt úr uppáhaldi', addedToCart: 'Bætt í körfu', removedFromCart: 'Fjarlægt úr körfu', connectionError: 'Tengivilla' }, reviews: { title: 'Umsagnir', add: 'Bæta við umsögn', userName: 'Nafn þitt', rating: 'Einkunn', comment: 'Athugasemd' }, shell: { label: 'Aðalflakk' } }
};
for (const code of Object.keys(EU_UI_CORE)) {
    const nav = built[code]?.nav;
    if (nav) {
        built[code] = deepMerge(built[code], deepMerge(EU_UI_CORE[code], {
            nav: { premium: 'Premium' },
            favorites: { title: nav.favorites },
            cart: { title: nav.cart }
        }));
    }
}
for (const [code, featured] of Object.entries(HOME_FEATURED_I18N)) {
    if (built[code]) {
        built[code] = deepMerge(built[code], { home: { featured } });
    }
}
for (const [code, menu] of Object.entries(MENU_I18N)) {
    if (built[code]) {
        // ETAP 32B cleanup: domknij klucze dev (sectionDev / tasteDiary / devVault) fallbackiem EN
        const menuEn = MENU_I18N.en || {};
        built[code] = deepMerge(built[code], {
            menu: {
                ...menu,
                sectionDev: menu.sectionDev || menuEn.sectionDev || 'Developer',
                tasteDiary: menu.tasteDiary || menuEn.tasteDiary || 'Taste Diary',
                devVault: menu.devVault || menuEn.devVault || 'Developer panel'
            }
        });
    }
}
for (const [code, testing] of Object.entries(TESTING_I18N)) {
    if (built[code]) {
        built[code] = deepMerge(built[code], { testing });
    }
}
// Pozostałe języki: fallback EN dla tekstów testów
const testingEn = TESTING_I18N.en;
for (const code of Object.keys(built)) {
    if (!built[code].testing && testingEn) {
        built[code] = deepMerge(built[code], { testing: testingEn });
    }
}
for (const [code, aboutPage] of Object.entries(ABOUT_I18N)) {
    if (built[code]) {
        built[code] = deepMerge(built[code], { aboutPage });
    }
}
for (const [code, search] of Object.entries(SEARCH_I18N)) {
    if (built[code]) {
        built[code] = deepMerge(built[code], {
            home: { searchPlaceholder: search.homeSearchPlaceholder },
            map: { searchPlaceholder: search.mapSearchPlaceholder },
            search: {
                noResults: search.noResults,
                noResultsFor: search.noResultsFor || "No results for search '{query}'",
                resultsCount: search.resultsCount,
                searching: search.searching
            }
        });
    }
}
for (const code of Object.keys(built)) {
    if (code !== 'de') {
        built[code] = deepMerge(EN, built[code]);
    }
    if (built[code].nav && !built[code].nav.premium && built[code].a11y?.premium) {
        built[code] = deepMerge(built[code], { nav: { premium: built[code].a11y.premium } });
    }
}
for (const [code, content] of Object.entries(CONTENT_I18N)) {
    if (built[code]) {
        built[code] = deepMerge(built[code], content);
    }
}
for (const [code, patch] of Object.entries(ETAP8_I18N)) {
    if (built[code]) {
        built[code] = deepMerge(built[code], patch);
    }
}
// Języki bez lokalnego ETAP8 (mk, ru, …) – fallback EN, komplet kluczy vs DE
const etap8Fallback = ETAP8_I18N.en;
if (etap8Fallback) {
    for (const code of Object.keys(built)) {
        if (!ETAP8_I18N[code]) {
            built[code] = deepMerge(built[code], etap8Fallback);
        }
    }
}
// Języki bez lokalnego contentu (featured/recipes) – fallback EN, żeby klucze DE były kompletne
const contentFallback = CONTENT_I18N.en;
if (contentFallback) {
    for (const code of Object.keys(built)) {
        if (!CONTENT_I18N[code]) {
            built[code] = deepMerge(built[code], contentFallback);
        }
    }
}

// Luki i18n (ARIA, seasonal, stories, placeholdery) – DE/EN/PL/MK + EN fallback
const gapEn = I18N_GAP.en;
for (const code of Object.keys(built)) {
    const gap = I18N_GAP[code] || gapEn;
    if (gap) built[code] = deepMerge(built[code], gap);
}

// Shell / meta / geo / landing – DE/EN/PL + EN fallback (36 języków)
const shellMetaEn = SHELL_META_I18N.en;
for (const code of Object.keys(built)) {
    const pack = SHELL_META_I18N[code] || shellMetaEn;
    if (pack) built[code] = deepMerge(built[code], pack);
}

// Regulamin / prywatność / pomoc – DE/EN/PL/MK + 32 locales (fr…hi)
const legalHelpEn = LEGAL_HELP_I18N.en;
for (const code of Object.keys(built)) {
    const pack = LEGAL_HELP_I18N[code] || LEGAL_HELP_LOCALES[code] || legalHelpEn;
    if (pack) built[code] = deepMerge(built[code], pack);
}

// ETAP 13A – Dzisiaj w regionie (DE/EN/PL/MK + EN fallback)
const liveRegionEn = LIVE_REGION_I18N.en;
for (const code of Object.keys(built)) {
    const pack = LIVE_REGION_I18N[code] || liveRegionEn;
    if (pack) built[code] = deepMerge(built[code], pack);
}

// ETAP 13B – Kalendarz Natury (DE/EN/PL/MK + EN fallback)
const natureCalendarEn = NATURE_CALENDAR_I18N.en;
for (const code of Object.keys(built)) {
    const pack = NATURE_CALENDAR_I18N[code] || natureCalendarEn;
    if (pack) built[code] = deepMerge(built[code], pack);
}

// ETAP 13C – Polecamy dzisiaj (DE/EN/PL/MK + EN fallback)
const smartTodayEn = SMART_TODAY_I18N.en;
for (const code of Object.keys(built)) {
    const pack = SMART_TODAY_I18N[code] || smartTodayEn;
    if (pack) built[code] = deepMerge(built[code], pack);
}

// ETAP 13D – Opowieści Regionu (DE/EN/PL/MK + EN fallback)
const regionStoriesEn = REGION_STORIES_I18N.en;
for (const code of Object.keys(built)) {
    const pack = REGION_STORIES_I18N[code] || regionStoriesEn;
    if (pack) built[code] = deepMerge(built[code], pack);
}

// ETAP 13E – ambient natury (DE/EN/PL/MK + EN fallback)
const climateAmbientEn = CLIMATE_AMBIENT_I18N.en;
for (const code of Object.keys(built)) {
    const pack = CLIMATE_AMBIENT_I18N[code] || climateAmbientEn;
    if (pack) built[code] = deepMerge(built[code], pack);
}

// ETAP 14 – Osobisty Doradca Smaku (DE/EN/PL/MK + EN fallback)
const tasteAdvisorEn = TASTE_ADVISOR_I18N.en;
for (const code of Object.keys(built)) {
    const pack = TASTE_ADVISOR_I18N[code] || tasteAdvisorEn;
    if (pack) built[code] = deepMerge(built[code], pack);
}

// ETAP 15A – Living Region AI (DE/EN/PL/MK + EN fallback)
const livingRegionEn = LIVING_REGION_I18N.en;
for (const code of Object.keys(built)) {
    const pack = LIVING_REGION_I18N[code] || livingRegionEn;
    if (pack) built[code] = deepMerge(built[code], pack);
}

// ETAP 15B – Smaki dnia (DE/EN/PL/MK + EN fallback)
const tastesOfDayEn = TASTES_OF_DAY_I18N.en;
for (const code of Object.keys(built)) {
    const pack = TASTES_OF_DAY_I18N[code] || tastesOfDayEn;
    if (pack) built[code] = deepMerge(built[code], pack);
}

// ETAP 15C – Żywa mapa (DE/EN/PL/MK + EN fallback)
const livingMapEn = LIVING_MAP_I18N.en;
for (const code of Object.keys(built)) {
    const pack = LIVING_MAP_I18N[code] || livingMapEn;
    if (pack) built[code] = deepMerge(built[code], pack);
}

// ETAP 15D – Historia miejsca (DE/EN/PL/MK + EN fallback)
const placeHistoryEn = PLACE_HISTORY_I18N.en;
for (const code of Object.keys(built)) {
    const pack = PLACE_HISTORY_I18N[code] || placeHistoryEn;
    if (pack) built[code] = deepMerge(built[code], pack);
}

// ETAP 15E – Magia powrotu (DE/EN/PL/MK + EN fallback)
const returnMagicEn = RETURN_MAGIC_I18N.en;
for (const code of Object.keys(built)) {
    const pack = RETURN_MAGIC_I18N[code] || returnMagicEn;
    if (pack) built[code] = deepMerge(built[code], pack);
}

// ETAP 16 – Cyfrowa Dusza Regionu (DE/EN/PL/MK + EN fallback)
const regionSoulEn = REGION_SOUL_I18N.en;
for (const code of Object.keys(built)) {
    const pack = REGION_SOUL_I18N[code] || regionSoulEn;
    if (pack) built[code] = deepMerge(built[code], pack);
}

// ETAP 29B – Regional Intelligence (DE/EN/PL/MK + EN fallback)
const regionalIntelEn = REGIONAL_INTEL_I18N.en;
for (const code of Object.keys(built)) {
    const pack = REGIONAL_INTEL_I18N[code] || regionalIntelEn;
    if (pack) built[code] = deepMerge(built[code], pack);
}

// Taste Diary (DE/EN/PL + EN fallback)
const tasteDiaryEn = TASTE_DIARY_I18N.en;
for (const code of Object.keys(built)) {
    const pack = TASTE_DIARY_I18N[code] || tasteDiaryEn;
    if (pack) built[code] = deepMerge(built[code], pack);
    // menu label (☰)
    const menuTitle =
        (MENU_I18N[code] && MENU_I18N[code].tasteDiary) ||
        MENU_I18N.en?.tasteDiary ||
        'Taste Diary';
    built[code] = deepMerge(built[code], { menu: { tasteDiary: menuTitle } });
}

// Dev vault (DE/EN/PL + EN fallback)
const devVaultEn = DEV_VAULT_I18N.en;
for (const code of Object.keys(built)) {
    const pack = DEV_VAULT_I18N[code] || devVaultEn;
    if (pack) built[code] = deepMerge(built[code], pack);
}

// Home fill — ambient / regional intel / living region titles (wszystkie języki)
const homeFillEn = HOME_FILL_I18N.en;
for (const code of Object.keys(built)) {
    const pack = HOME_FILL_I18N[code] || homeFillEn;
    if (pack) built[code] = deepMerge(built[code], pack);
}

// Nature Calendar, Region Stories, Live Region – 36 języków (nadpisuje EN fallback)
for (const code of Object.keys(built)) {
    const pack = HOME_SECTIONS_LOCALES[code];
    if (pack) built[code] = deepMerge(built[code], pack);
}

// returnMagic, regionSoul, livingRegion, regionalIntel, climateAmbient, placeHistory – 36 języków
for (const code of Object.keys(built)) {
    const pack = HOME_REMAINING_LOCALES[code];
    if (pack) built[code] = deepMerge(built[code], pack);
}

// Rekomendacje Home – tytuły sekcji (36 języków)
for (const code of Object.keys(built)) {
    const pack = RECOMMENDATIONS_LOCALES[code];
    if (pack) built[code] = deepMerge(built[code], pack);
}

// Home UI core – pełne tłumaczenia Home (36 języków; nadpisuje EN z rekomendacji)
for (const code of Object.keys(built)) {
    const pack = HOME_UI_CORE_LOCALES[code];
    if (pack) built[code] = deepMerge(built[code], pack);
}

// Domknij etykiety menu (nie nadpisuj EN z DEV_VAULT_I18N fallback)
for (const [code, menu] of Object.entries(MENU_I18N)) {
    if (!built[code] || !menu) continue;
    built[code] = deepMerge(built[code], {
        menu: {
            tasteDiary: menu.tasteDiary,
            sectionDev: menu.sectionDev,
            devVault: menu.devVault
        }
    });
}

const NO_CURRENT_DATA_I18N = Object.freeze({
    de: 'Keine aktuellen Daten',
    en: 'No current data',
    pl: 'Brak aktualnych danych'
});
for (const code of Object.keys(built)) {
    built[code] = deepMerge(built[code], {
        msg: { noCurrentData: NO_CURRENT_DATA_I18N[code] || NO_CURRENT_DATA_I18N.en }
    });
}

export const TRANSLATIONS = Object.freeze(built);

export function normalizeBrowserLanguage(raw) {
    if (!raw || typeof raw !== 'string') return 'de';
    const lower = raw.toLowerCase().replace(/_/g, '-');

    if (SUPPORTED_LANGUAGE_CODES.includes(lower)) return lower;

    if (ZH_TW_PATTERNS.some((p) => lower === p || lower.startsWith(`${p}-`))) {
        return SUPPORTED_LANGUAGE_CODES.includes('zh-tw') ? 'zh-tw' : 'de';
    }
    if (lower.startsWith('zh')) {
        return SUPPORTED_LANGUAGE_CODES.includes('zh') ? 'zh' : 'de';
    }

    const part = lower.split('-')[0];
    const mapped = BROWSER_LANG_MAP[part] || part;
    return SUPPORTED_LANGUAGE_CODES.includes(mapped) ? mapped : 'de';
}

export function detectBrowserLanguage() {
    const list = navigator.languages?.length
        ? navigator.languages
        : [navigator.language || 'de'];
    for (const raw of list) {
        const code = normalizeBrowserLanguage(raw);
        if (SUPPORTED_LANGUAGE_CODES.includes(code)) return code;
    }
    return 'de';
}
