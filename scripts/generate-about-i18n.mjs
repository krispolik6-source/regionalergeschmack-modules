/**
 * Generuje js/translations-about.js (35 języków).
 * Uruchom: node scripts/generate-about-i18n.mjs
 */
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, '..', 'js', 'translations-about.js');

const TECH = {
    techFrontend: 'Frontend: HTML5, CSS3, JavaScript (ES Modules)',
    techMap: 'Map: Leaflet (OpenStreetMap)',
    techStorage: 'Storage: localStorage (user data)',
    techI18n: 'Multilingual: 35 languages'
};

/** @type {Record<string, Record<string, string>>} */
const LANG = {
    de: {
        title: '📱 Über die App – Regionaler Geschmack',
        testWarningTitle: '⚠️ Hinweis: Testversion',
        testWarningText: 'Dies ist eine Testversion. Fehler und Änderungen sind möglich. Bitte melden Sie Probleme über das Menü.',
        purposeTitle: '📌 Zweck der App',
        purposeText: 'Plattform, die Verbraucher mit lokalen Lebensmittelproduzenten in der Region Teutoburger Wald verbindet. Die App ermöglicht die Entdeckung regionaler Produkte, Kontakt zu Produzenten und die Unterstützung der lokalen Wirtschaft.',
        techTitle: '🛠️ Technologien',
        techFrontend: 'Frontend: HTML5, CSS3, JavaScript (ES Modules)',
        techMap: 'Karte: Leaflet (OpenStreetMap)',
        techStorage: 'Datenspeicherung: localStorage (Benutzerdaten)',
        techI18n: 'Mehrsprachigkeit: 35 Sprachen',
        metaCreated: '📅 Erstellt: Juli 2026',
        metaVersion: '📌 Version: v2.0 (Beta)',
        authorTitle: '👨‍💻 Autor',
        authorRole: 'Konzept, Entwicklung und Wartung der App',
        contactTitle: '📧 Kontakt',
        downloadTitle: '📱 App herunterladen',
        downloadAndroidTitle: 'Android (APK)',
        downloadAndroidDesc: 'Laden Sie das Paket auf ein Android-Tablet (4.4+) herunter und installieren Sie es.',
        downloadApk: '📱 APK herunterladen',
        downloadPwaTitle: 'iOS / iPad (PWA)',
        downloadPwaDesc: 'Verknüpfung zum Home-Bildschirm in Safari hinzufügen:',
        downloadPwaStep1: 'Öffnen Sie Safari und rufen Sie diese Seite auf.',
        downloadPwaStep2: 'Tippen Sie auf Teilen → Zum Home-Bildschirm.',
        qrTitle: '📲 QR-Code',
        qrCaption: 'Scannen und App herunterladen',
        qrLead: 'Der Code führt zum Download von Regionaler Geschmack auf diesem Gerät.',
        qrAlt: 'QR-Code zum Herunterladen der App',
        cooperationTitle: '🤝 Zusammenarbeit',
        cooperationText: 'Ich bin offen für Vorschläge und Partnerschaften mit Produzenten, Geschäften und Restaurants.',
        cooperationInvite: 'Wenn Sie der Plattform beitreten möchten – kontaktieren Sie uns!',
        cooperationContactTitle: '📧 Kontakt für Zusammenarbeit und neue Projekte',
        cooperationContactText: 'Schreiben Sie uns – wir freuen uns auf Ihre Ideen und Kooperationsangebote.',
        legalTitle: '⚠️ Rechtliche Hinweise',
        legal1: 'Die App verbindet Nutzer mit Produzenten. Transaktionen erfolgen direkt zwischen Nutzern und Produzenten – Regionaler Geschmack ist nicht Vertragspartei.',
        legal2: 'Inhalte (Produktbeschreibungen, Fotos) stammen von Produzenten – die App übernimmt keine Haftung für deren Richtigkeit.',
        legal3: 'Die App erhebt keine personenbezogenen Daten ohne Zustimmung – alle Daten werden lokal auf dem Gerät gespeichert.',
        legal4: 'Die Karte nutzt OpenStreetMap-Daten – die App übernimmt keine Haftung für die Genauigkeit geografischer Daten.',
        copyright: '© 2026 Regionaler Geschmack – Alle Rechte vorbehalten.'
    },
    en: {
        title: '📱 About the app – Regionaler Geschmack',
        testWarningTitle: '⚠️ Note: Beta version',
        testWarningText: 'This is a beta version. Bugs and changes are possible. Please report issues via the menu.',
        purposeTitle: '📌 Purpose',
        purposeText: 'A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.',
        techTitle: '🛠️ Technologies',
        ...TECH,
        metaCreated: '📅 Created: July 2026',
        metaVersion: '📌 Version: v2.0 (beta)',
        authorTitle: '👨‍💻 Author',
        authorRole: 'Concept, development and maintenance of the app',
        contactTitle: '📧 Contact',
        downloadTitle: '📱 Download the app',
        downloadAndroidTitle: 'Android (APK)',
        downloadAndroidDesc: 'Download and install the package on an Android tablet (4.4+).',
        downloadApk: '📱 Download APK',
        downloadPwaTitle: 'iOS / iPad (PWA)',
        downloadPwaDesc: 'Add a shortcut to the home screen in Safari:',
        downloadPwaStep1: 'Open Safari and visit this page.',
        downloadPwaStep2: 'Tap Share → Add to Home Screen.',
        qrTitle: '📲 QR code',
        qrCaption: 'Scan and download the app',
        qrLead: 'The code leads to downloading Regionaler Geschmack on this device.',
        qrAlt: 'QR code to download the app',
        cooperationTitle: '🤝 Cooperation',
        cooperationText: 'I am open to proposals and partnerships with producers, shops and restaurants.',
        cooperationInvite: 'If you want to join the platform – contact us!',
        cooperationContactTitle: '📧 Contact for cooperation and new projects',
        cooperationContactText: 'Write to us – we welcome your ideas and partnership offers.',
        legalTitle: '⚠️ Legal disclaimers',
        legal1: 'The app connects users with producers. Transactions take place directly between users and producers – Regionaler Geschmack is not a party to these transactions.',
        legal2: 'Content (product descriptions, photos) comes from producers – the app is not responsible for its accuracy.',
        legal3: 'The app does not collect personal data without user consent – all data is stored locally on the device.',
        legal4: 'The map uses OpenStreetMap data – the app is not responsible for the accuracy of geographic data.',
        copyright: '© 2026 Regionaler Geschmack – All rights reserved.'
    },
    pl: {
        title: '📱 O aplikacji – Regionaler Geschmack',
        testWarningTitle: '⚠️ UWAGA: Wersja testowa',
        testWarningText: 'To jest wersja testowa. Możliwe są błędy i zmiany. Prosimy zgłaszać problemy przez menu.',
        purposeTitle: '📌 Cel aplikacji',
        purposeText: 'Platforma łącząca konsumentów z lokalnymi producentami żywności w regionie Teutoburger Wald. Aplikacja umożliwia odkrywanie regionalnych produktów, kontakt z producentami oraz wspieranie lokalnej gospodarki.',
        techTitle: '🛠️ Technologie',
        techFrontend: 'Frontend: HTML5, CSS3, JavaScript (ES Modules)',
        techMap: 'Mapa: Leaflet (OpenStreetMap)',
        techStorage: 'Przechowywanie danych: localStorage (dane użytkownika)',
        techI18n: 'Wielojęzyczność: 35 języków',
        metaCreated: '📅 Data powstania: lipiec 2026',
        metaVersion: '📌 Wersja: v2.0 (beta)',
        authorTitle: '👨‍💻 Autor',
        authorRole: 'Koncepcja, rozwój i utrzymanie aplikacji',
        contactTitle: '📧 Kontakt',
        downloadTitle: '📱 Pobierz aplikację',
        downloadAndroidTitle: 'Android (APK)',
        downloadAndroidDesc: 'Pobierz i zainstaluj pakiet na tablecie z Androidem 4.4+.',
        downloadApk: '📱 Pobierz APK',
        downloadPwaTitle: 'iOS / iPad (PWA)',
        downloadPwaDesc: 'Dodaj skrót do ekranu głównego w Safari:',
        downloadPwaStep1: 'Otwórz Safari i wejdź na tę stronę.',
        downloadPwaStep2: 'Kliknij Udostępnij → Dodaj do ekranu początkowego.',
        qrTitle: '📲 Kod QR',
        qrCaption: 'Zeskanuj i pobierz aplikację',
        qrLead: 'Kod prowadzi do pobrania aplikacji Regionaler Geschmack na tym urządzeniu.',
        qrAlt: 'Kod QR do pobrania aplikacji',
        cooperationTitle: '🤝 Współpraca',
        cooperationText: 'Jestem otwarty na propozycje i partnerstwa z producentami, sklepami i restauracjami.',
        cooperationInvite: 'Jeśli chcesz dołączyć do platformy – skontaktuj się z nami!',
        cooperationContactTitle: '📧 Kontakt do współpracy i nowych projektów',
        cooperationContactText: 'Napisz do nas – chętnie przyjmiemy Twoje pomysły i oferty współpracy.',
        legalTitle: '⚠️ Zastrzeżenia prawne',
        legal1: 'Aplikacja jest platformą łączącą użytkowników z producentami. Transakcje odbywają się bezpośrednio między użytkownikami a producentami – Regionaler Geschmack nie jest stroną w tych transakcjach.',
        legal2: 'Treści (opisy produktów, zdjęcia) pochodzą od producentów – aplikacja nie ponosi odpowiedzialności za ich prawdziwość.',
        legal3: 'Aplikacja nie gromadzi danych osobowych bez zgody użytkownika – wszelkie dane przechowywane są lokalnie na urządzeniu użytkownika.',
        legal4: 'Mapa korzysta z danych OpenStreetMap – aplikacja nie ponosi odpowiedzialności za dokładność danych geograficznych.',
        copyright: '© 2026 Regionaler Geschmack – Wszelkie prawa zastrzeżone.'
    }
};

const EXTRA = {
    ru: {
        title: '📱 О приложении – Regionaler Geschmack',
        testWarningTitle: '⚠️ Внимание: тестовая версия',
        testWarningText: 'Это тестовая версия. Возможны ошибки и изменения. Сообщайте о проблемах через меню.',
        purposeTitle: '📌 Цель приложения',
        purposeText: 'Платформа, связывающая потребителей с местными производителями продуктов в регионе Тевтобургский лес.',
        techTitle: '🛠️ Технологии',
        techMap: 'Карта: Leaflet (OpenStreetMap)',
        techStorage: 'Хранение: localStorage (данные пользователя)',
        techI18n: 'Многоязычность: 35 языков',
        metaCreated: '📅 Создано: июль 2026',
        metaVersion: '📌 Версия: v2.0 (бета)',
        authorTitle: '👨‍💻 Автор',
        authorRole: 'Концепция, разработка и поддержка приложения',
        contactTitle: '📧 Контакт',
        downloadTitle: '📱 Скачать приложение',
        downloadAndroidTitle: 'Android (APK)',
        downloadAndroidDesc: 'Скачайте и установите пакет на планшет Android 4.4+.',
        downloadApk: '📱 Скачать APK',
        downloadPwaTitle: 'iOS / iPad (PWA)',
        downloadPwaDesc: 'Добавьте ярлык на главный экран в Safari:',
        downloadPwaStep1: 'Откройте Safari и перейдите на эту страницу.',
        downloadPwaStep2: 'Нажмите Поделиться → На экран «Домой».',
        qrTitle: '📲 QR-код',
        qrCaption: 'Сканируйте и скачайте приложение',
        qrLead: 'Код ведёт к загрузке Regionaler Geschmack на этом устройстве.',
        qrAlt: 'QR-код для загрузки приложения',
        cooperationTitle: '🤝 Сотрудничество',
        cooperationText: 'Открыт для предложений и партнёрства с производителями, магазинами и ресторанами.',
        cooperationInvite: 'Хотите присоединиться к платформе – свяжитесь с нами!',
        cooperationContactTitle: '📧 Контакт для сотрудничества и новых проектов',
        cooperationContactText: 'Напишите нам – мы ждём ваши идеи и предложения о сотрудничестве.',
        legalTitle: '⚠️ Правовые оговорки',
        legal1: 'Приложение связывает пользователей с производителями. Сделки происходят напрямую – Regionaler Geschmack не является стороной.',
        legal2: 'Контент (описания, фото) от производителей – приложение не отвечает за достоверность.',
        legal3: 'Приложение не собирает персональные данные без согласия – данные хранятся локально на устройстве.',
        legal4: 'Карта использует OpenStreetMap – приложение не отвечает за точность географических данных.',
        copyright: '© 2026 Regionaler Geschmack – Все права защищены.'
    },
    tr: {
        title: '📱 Uygulama hakkında – Regionaler Geschmack',
        testWarningTitle: '⚠️ Dikkat: Test sürümü',
        testWarningText: 'Bu bir test sürümüdür. Hatalar ve değişiklikler olabilir. Lütfen menüden bildirin.',
        purposeTitle: '📌 Uygulamanın amacı',
        purposeText: 'Teutoburger Wald bölgesinde tüketicileri yerel gıda üreticileriyle buluşturan platform.',
        techTitle: '🛠️ Teknolojiler',
        techMap: 'Harita: Leaflet (OpenStreetMap)',
        techStorage: 'Depolama: localStorage (kullanıcı verileri)',
        techI18n: 'Çok dilli: 35 dil',
        metaCreated: '📅 Oluşturulma: Temmuz 2026',
        metaVersion: '📌 Sürüm: v2.0 (beta)',
        authorTitle: '👨‍💻 Yazar',
        authorRole: 'Uygulamanın konsepti, geliştirme ve bakımı',
        contactTitle: '📧 İletişim',
        downloadTitle: '📱 Uygulamayı indir',
        downloadAndroidTitle: 'Android (APK)',
        downloadAndroidDesc: 'Android 4.4+ tablete paketi indirip kurun.',
        downloadApk: '📱 APK indir',
        downloadPwaTitle: 'iOS / iPad (PWA)',
        downloadPwaDesc: 'Safari\'de ana ekrana kısayol ekleyin:',
        downloadPwaStep1: 'Safari\'yi açın ve bu sayfayı ziyaret edin.',
        downloadPwaStep2: 'Paylaş → Ana Ekrana Ekle\'ye dokunun.',
        qrTitle: '📲 QR kod',
        qrCaption: 'Tarayın ve uygulamayı indirin',
        qrLead: 'Kod bu cihazda Regionaler Geschmack indirmesine yönlendirir.',
        qrAlt: 'Uygulama indirme QR kodu',
        cooperationTitle: '🤝 İş birliği',
        cooperationText: 'Üreticiler, mağazalar ve restoranlarla önerilere ve ortaklıklara açığım.',
        cooperationInvite: 'Platforma katılmak istiyorsanız – bize ulaşın!',
        cooperationContactTitle: '📧 İş birliği ve yeni projeler için iletişim',
        cooperationContactText: 'Bize yazın – fikirlerinizi ve iş birliği tekliflerinizi bekliyoruz.',
        legalTitle: '⚠️ Yasal uyarılar',
        legal1: 'Uygulama kullanıcıları üreticilerle buluşturur. İşlemler doğrudan yapılır – Regionaler Geschmack taraf değildir.',
        legal2: 'İçerik üreticilerden gelir – uygulama doğruluktan sorumlu değildir.',
        legal3: 'Uygulama onay olmadan kişisel veri toplamaz – veriler cihazda yerel saklanır.',
        legal4: 'Harita OpenStreetMap kullanır – coğrafi doğruluk garanti edilmez.',
        copyright: '© 2026 Regionaler Geschmack – Tüm hakları saklıdır.'
    }
};

const EU_PATCH = {
    fr: { title: '📱 À propos – Regionaler Geschmack', testWarningTitle: '⚠️ Attention : version test', purposeTitle: '📌 Objectif', techTitle: '🛠️ Technologies', authorTitle: '👨‍💻 Auteur', contactTitle: '📧 Contact', downloadTitle: '📱 Télécharger l\'app', qrTitle: '📲 Code QR', cooperationTitle: '🤝 Coopération', legalTitle: '⚠️ Mentions légales', copyright: '© 2026 Regionaler Geschmack – Tous droits réservés.' },
    es: { title: '📱 Sobre la app – Regionaler Geschmack', testWarningTitle: '⚠️ Atención: versión de prueba', purposeTitle: '📌 Propósito', techTitle: '🛠️ Tecnologías', authorTitle: '👨‍💻 Autor', contactTitle: '📧 Contacto', downloadTitle: '📱 Descargar app', qrTitle: '📲 Código QR', cooperationTitle: '🤝 Cooperación', legalTitle: '⚠️ Avisos legales', copyright: '© 2026 Regionaler Geschmack – Todos los derechos reservados.' },
    it: { title: '📱 Informazioni – Regionaler Geschmack', testWarningTitle: '⚠️ Attenzione: versione beta', purposeTitle: '📌 Scopo', techTitle: '🛠️ Tecnologie', authorTitle: '👨‍💻 Autore', contactTitle: '📧 Contatto', downloadTitle: '📱 Scarica app', qrTitle: '📲 Codice QR', cooperationTitle: '🤝 Collaborazione', legalTitle: '⚠️ Note legali', copyright: '© 2026 Regionaler Geschmack – Tutti i diritti riservati.' },
    nl: { title: '📱 Over de app – Regionaler Geschmack', testWarningTitle: '⚠️ Let op: testversie', purposeTitle: '📌 Doel', techTitle: '🛠️ Technologieën', authorTitle: '👨‍💻 Auteur', contactTitle: '📧 Contact', downloadTitle: '📱 App downloaden', qrTitle: '📲 QR-code', cooperationTitle: '🤝 Samenwerking', legalTitle: '⚠️ Juridische kennisgeving', copyright: '© 2026 Regionaler Geschmack – Alle rechten voorbehouden.' },
    cs: { title: '📱 O aplikaci – Regionaler Geschmack', testWarningTitle: '⚠️ Pozor: testovací verze', purposeTitle: '📌 Účel', techTitle: '🛠️ Technologie', authorTitle: '👨‍💻 Autor', contactTitle: '📧 Kontakt', downloadTitle: '📱 Stáhnout aplikaci', qrTitle: '📲 QR kód', cooperationTitle: '🤝 Spolupráce', legalTitle: '⚠️ Právní upozornění', copyright: '© 2026 Regionaler Geschmack – Všechna práva vyhrazena.' },
    sk: { title: '📱 O aplikácii – Regionaler Geschmack', testWarningTitle: '⚠️ Pozor: testovacia verzia', purposeTitle: '📌 Účel', techTitle: '🛠️ Technológie', authorTitle: '👨‍💻 Autor', contactTitle: '📧 Kontakt', downloadTitle: '📱 Stiahnuť aplikáciu', qrTitle: '📲 QR kód', cooperationTitle: '🤝 Spolupráca', legalTitle: '⚠️ Právne upozornenia', copyright: '© 2026 Regionaler Geschmack – Všetky práva vyhradené.' },
    hu: { title: '📱 Az alkalmazásról – Regionaler Geschmack', testWarningTitle: '⚠️ Figyelem: tesztverzió', purposeTitle: '📌 Cél', techTitle: '🛠️ Technológiák', authorTitle: '👨‍💻 Szerző', contactTitle: '📧 Kapcsolat', downloadTitle: '📱 Alkalmazás letöltése', qrTitle: '📲 QR-kód', cooperationTitle: '🤝 Együttműködés', legalTitle: '⚠️ Jogi nyilatkozatok', copyright: '© 2026 Regionaler Geschmack – Minden jog fenntartva.' },
    ro: { title: '📱 Despre aplicație – Regionaler Geschmack', testWarningTitle: '⚠️ Atenție: versiune beta', purposeTitle: '📌 Scop', techTitle: '🛠️ Tehnologii', authorTitle: '👨‍💻 Autor', contactTitle: '📧 Contact', downloadTitle: '📱 Descarcă aplicația', qrTitle: '📲 Cod QR', cooperationTitle: '🤝 Colaborare', legalTitle: '⚠️ Mențiuni legale', copyright: '© 2026 Regionaler Geschmack – Toate drepturile rezervate.' },
    bg: { title: '📱 За приложението – Regionaler Geschmack', testWarningTitle: '⚠️ Внимание: тестова версия', purposeTitle: '📌 Цел', techTitle: '🛠️ Технологии', authorTitle: '👨‍💻 Автор', contactTitle: '📧 Контакт', downloadTitle: '📱 Изтегли приложението', qrTitle: '📲 QR код', cooperationTitle: '🤝 Сътрудничество', legalTitle: '⚠️ Правни уведомления', copyright: '© 2026 Regionaler Geschmack – Всички права запазени.' },
    el: { title: '📱 Σχετικά με την εφαρμογή – Regionaler Geschmack', testWarningTitle: '⚠️ Προσοχή: δοκιμαστική έκδοση', purposeTitle: '📌 Σκοπός', techTitle: '🛠️ Τεχνολογίες', authorTitle: '👨‍💻 Συγγραφέας', contactTitle: '📧 Επικοινωνία', downloadTitle: '📱 Λήψη εφαρμογής', qrTitle: '📲 Κωδικός QR', cooperationTitle: '🤝 Συνεργασία', legalTitle: '⚠️ Νομικές αποποιήσεις', copyright: '© 2026 Regionaler Geschmack – Με επιφύλαξη παντός δικαιώματος.' },
    hr: { title: '📱 O aplikaciji – Regionaler Geschmack', testWarningTitle: '⚠️ Pažnja: testna verzija', purposeTitle: '📌 Svrha', techTitle: '🛠️ Tehnologije', authorTitle: '👨‍💻 Autor', contactTitle: '📧 Kontakt', downloadTitle: '📱 Preuzmi aplikaciju', qrTitle: '📲 QR kod', cooperationTitle: '🤝 Suradnja', legalTitle: '⚠️ Pravne napomene', copyright: '© 2026 Regionaler Geschmack – Sva prava pridržana.' },
    sr: { title: '📱 О апликацији – Regionaler Geschmack', testWarningTitle: '⚠️ Пажња: тест верзија', purposeTitle: '📌 Сврха', techTitle: '🛠️ Технологије', authorTitle: '👨‍💻 Аутор', contactTitle: '📧 Контакт', downloadTitle: '📱 Преузми апликацију', qrTitle: '📲 QR код', cooperationTitle: '🤝 Сарадња', legalTitle: '⚠️ Правна обавештења', copyright: '© 2026 Regionaler Geschmack – Сва права задржана.' },
    sl: { title: '📱 O aplikaciji – Regionaler Geschmack', testWarningTitle: '⚠️ Pozor: testna različica', purposeTitle: '📌 Namen', techTitle: '🛠️ Tehnologije', authorTitle: '👨‍💻 Avtor', contactTitle: '📧 Kontakt', downloadTitle: '📱 Prenesi aplikacijo', qrTitle: '📲 QR koda', cooperationTitle: '🤝 Sodelovanje', legalTitle: '⚠️ Pravna opozorila', copyright: '© 2026 Regionaler Geschmack – Vse pravice pridržane.' },
    lt: { title: '📱 Apie programėlę – Regionaler Geschmack', testWarningTitle: '⚠️ Dėmesio: bandomoji versija', purposeTitle: '📌 Tikslas', techTitle: '🛠️ Technologijos', authorTitle: '👨‍💻 Autorius', contactTitle: '📧 Kontaktas', downloadTitle: '📱 Atsisiųsti programėlę', qrTitle: '📲 QR kodas', cooperationTitle: '🤝 Bendradarbiavimas', legalTitle: '⚠️ Teisiniai įspėjimai', copyright: '© 2026 Regionaler Geschmack – Visos teisės saugomos.' },
    lv: { title: '📱 Par lietotni – Regionaler Geschmack', testWarningTitle: '⚠️ Uzmanību: testa versija', purposeTitle: '📌 Mērķis', techTitle: '🛠️ Tehnoloģijas', authorTitle: '👨‍💻 Autors', contactTitle: '📧 Kontakts', downloadTitle: '📱 Lejupielādēt lietotni', qrTitle: '📲 QR kods', cooperationTitle: '🤝 Sadarbība', legalTitle: '⚠️ Juridiskie brīdinājumi', copyright: '© 2026 Regionaler Geschmack – Visas tiesības aizsargātas.' },
    et: { title: '📱 Rakenduse kohta – Regionaler Geschmack', testWarningTitle: '⚠️ Tähelepanu: testversioon', purposeTitle: '📌 Eesmärk', techTitle: '🛠️ Tehnoloogiad', authorTitle: '👨‍💻 Autor', contactTitle: '📧 Kontakt', downloadTitle: '📱 Laadi rakendus alla', qrTitle: '📲 QR-kood', cooperationTitle: '🤝 Koostöö', legalTitle: '⚠️ Õiguslikud teated', copyright: '© 2026 Regionaler Geschmack – Kõik õigused kaitstud.' },
    fi: { title: '📱 Tietoja sovelluksesta – Regionaler Geschmack', testWarningTitle: '⚠️ Huomio: testiversio', purposeTitle: '📌 Tarkoitus', techTitle: '🛠️ Teknologiat', authorTitle: '👨‍💻 Tekijä', contactTitle: '📧 Yhteystiedot', downloadTitle: '📱 Lataa sovellus', qrTitle: '📲 QR-koodi', cooperationTitle: '🤝 Yhteistyö', legalTitle: '⚠️ Oikeudelliset huomautukset', copyright: '© 2026 Regionaler Geschmack – Kaikki oikeudet pidätetään.' },
    sv: { title: '📱 Om appen – Regionaler Geschmack', testWarningTitle: '⚠️ Obs: testversion', purposeTitle: '📌 Syfte', techTitle: '🛠️ Teknik', authorTitle: '👨‍💻 Författare', contactTitle: '📧 Kontakt', downloadTitle: '📱 Ladda ner appen', qrTitle: '📲 QR-kod', cooperationTitle: '🤝 Samarbete', legalTitle: '⚠️ Juridiska meddelanden', copyright: '© 2026 Regionaler Geschmack – Alla rättigheter förbehållna.' },
    no: { title: '📱 Om appen – Regionaler Geschmack', testWarningTitle: '⚠️ Merk: testversjon', purposeTitle: '📌 Formål', techTitle: '🛠️ Teknologi', authorTitle: '👨‍💻 Forfatter', contactTitle: '📧 Kontakt', downloadTitle: '📱 Last ned appen', qrTitle: '📲 QR-kode', cooperationTitle: '🤝 Samarbeid', legalTitle: '⚠️ Juridiske merknader', copyright: '© 2026 Regionaler Geschmack – Alle rettigheter forbeholdt.' },
    da: { title: '📱 Om appen – Regionaler Geschmack', testWarningTitle: '⚠️ Bemærk: testversion', purposeTitle: '📌 Formål', techTitle: '🛠️ Teknologier', authorTitle: '👨‍💻 Forfatter', contactTitle: '📧 Kontakt', downloadTitle: '📱 Download appen', qrTitle: '📲 QR-kode', cooperationTitle: '🤝 Samarbejde', legalTitle: '⚠️ Juridiske bemærkninger', copyright: '© 2026 Regionaler Geschmack – Alle rettigheder forbeholdes.' },
    is: { title: '📱 Um forritið – Regionaler Geschmack', testWarningTitle: '⚠️ Athugið: prófunarútgáfa', purposeTitle: '📌 Tilgangur', techTitle: '🛠️ Tækni', authorTitle: '👨‍💻 Höfundur', contactTitle: '📧 Samband', downloadTitle: '📱 Sækja forritið', qrTitle: '📲 QR-kóði', cooperationTitle: '🤝 Samstarf', legalTitle: '⚠️ Lagalegar athugasemdir', copyright: '© 2026 Regionaler Geschmack – Öll réttindi áskilin.' }
};

const ASIAN_PATCH = {
    zh: { title: '📱 关于应用 – Regionaler Geschmack', testWarningTitle: '⚠️ 注意：测试版', purposeTitle: '📌 应用目的', techTitle: '🛠️ 技术', authorTitle: '👨‍💻 作者', contactTitle: '📧 联系', downloadTitle: '📱 下载应用', qrTitle: '📲 二维码', cooperationTitle: '🤝 合作', legalTitle: '⚠️ 法律声明', copyright: '© 2026 Regionaler Geschmack – 版权所有。' },
    'zh-tw': { title: '📱 關於應用 – Regionaler Geschmack', testWarningTitle: '⚠️ 注意：測試版', purposeTitle: '📌 應用目的', techTitle: '🛠️ 技術', authorTitle: '👨‍💻 作者', contactTitle: '📧 聯絡', downloadTitle: '📱 下載應用', qrTitle: '📲 QR 碼', cooperationTitle: '🤝 合作', legalTitle: '⚠️ 法律聲明', copyright: '© 2026 Regionaler Geschmack – 版權所有。' },
    ja: { title: '📱 アプリについて – Regionaler Geschmack', testWarningTitle: '⚠️ 注意：テスト版', purposeTitle: '📌 目的', techTitle: '🛠️ 技術', authorTitle: '👨‍💻 作者', contactTitle: '📧 連絡先', downloadTitle: '📱 アプリをダウンロード', qrTitle: '📲 QRコード', cooperationTitle: '🤝 協力', legalTitle: '⚠️ 法的免責事項', copyright: '© 2026 Regionaler Geschmack – 全著作権所有。' },
    ko: { title: '📱 앱 정보 – Regionaler Geschmack', testWarningTitle: '⚠️ 주의: 테스트 버전', purposeTitle: '📌 목적', techTitle: '🛠️ 기술', authorTitle: '👨‍💻 작성자', contactTitle: '📧 연락처', downloadTitle: '📱 앱 다운로드', qrTitle: '📲 QR 코드', cooperationTitle: '🤝 협력', legalTitle: '⚠️ 법적 고지', copyright: '© 2026 Regionaler Geschmack – 모든 권리 보유.' },
    vi: { title: '📱 Giới thiệu ứng dụng – Regionaler Geschmack', testWarningTitle: '⚠️ Lưu ý: phiên bản thử nghiệm', purposeTitle: '📌 Mục đích', techTitle: '🛠️ Công nghệ', authorTitle: '👨‍💻 Tác giả', contactTitle: '📧 Liên hệ', downloadTitle: '📱 Tải ứng dụng', qrTitle: '📲 Mã QR', cooperationTitle: '🤝 Hợp tác', legalTitle: '⚠️ Tuyên bố pháp lý', copyright: '© 2026 Regionaler Geschmack – Bảo lưu mọi quyền.' },
    ms: { title: '📱 Perihal aplikasi – Regionaler Geschmack', testWarningTitle: '⚠️ Perhatian: versi ujian', purposeTitle: '📌 Tujuan', techTitle: '🛠️ Teknologi', authorTitle: '👨‍💻 Pengarang', contactTitle: '📧 Hubungi', downloadTitle: '📱 Muat turun aplikasi', qrTitle: '📲 Kod QR', cooperationTitle: '🤝 Kerjasama', legalTitle: '⚠️ Penafian undang-undang', copyright: '© 2026 Regionaler Geschmack – Hak cipta terpelihara.' },
    id: { title: '📱 Tentang aplikasi – Regionaler Geschmack', testWarningTitle: '⚠️ Perhatian: versi uji', purposeTitle: '📌 Tujuan', techTitle: '🛠️ Teknologi', authorTitle: '👨‍💻 Penulis', contactTitle: '📧 Kontak', downloadTitle: '📱 Unduh aplikasi', qrTitle: '📲 Kode QR', cooperationTitle: '🤝 Kerja sama', legalTitle: '⚠️ Pernyataan hukum', copyright: '© 2026 Regionaler Geschmack – Hak cipta dilindungi.' },
    th: { title: '📱 เกี่ยวกับแอป – Regionaler Geschmack', testWarningTitle: '⚠️ คำเตือน: เวอร์ชันทดสอบ', purposeTitle: '📌 วัตถุประสงค์', techTitle: '🛠️ เทคโนโลยี', authorTitle: '👨‍💻 ผู้เขียน', contactTitle: '📧 ติดต่อ', downloadTitle: '📱 ดาวน์โหลดแอป', qrTitle: '📲 รหัส QR', cooperationTitle: '🤝 ความร่วมมือ', legalTitle: '⚠️ ข้อจำกัดทางกฎหมาย', copyright: '© 2026 Regionaler Geschmack – สงวนลิขสิทธิ์' },
    hi: { title: '📱 ऐप के बारे में – Regionaler Geschmack', testWarningTitle: '⚠️ ध्यान दें: बीटा संस्करण', purposeTitle: '📌 उद्देश्य', techTitle: '🛠️ तकनीक', authorTitle: '👨‍💻 लेखक', contactTitle: '📧 संपर्क', downloadTitle: '📱 ऐप डाउनलोड करें', qrTitle: '📲 QR कोड', cooperationTitle: '🤝 सहयोग', legalTitle: '⚠️ कानूनी अस्वीकरण', copyright: '© 2026 Regionaler Geschmack – सर्वाधिकार सुरक्षित।' }
};

const ALL_CODES = [
    'de', 'en', 'pl', 'ru', 'tr', 'fr', 'es', 'it', 'nl', 'cs', 'sk', 'hu', 'ro', 'bg', 'el', 'hr', 'sr', 'sl', 'lt', 'lv', 'et', 'fi', 'sv', 'no', 'da', 'is',
    'zh', 'zh-tw', 'ja', 'ko', 'vi', 'ms', 'id', 'th', 'hi'
];

function buildLang(code) {
    const base = { ...LANG.en };
    if (LANG[code]) return { ...LANG[code] };
    if (EXTRA[code]) return { ...base, ...EXTRA[code], techFrontend: base.techFrontend };
    const patch = EU_PATCH[code] || ASIAN_PATCH[code] || {};
    return { ...base, ...patch };
}

const ABOUT_I18N = {};
for (const code of ALL_CODES) {
    ABOUT_I18N[code] = buildLang(code);
}

function fmtEntry(code, obj) {
    const key = /^[a-z][a-z0-9]*$/i.test(code) ? code : JSON.stringify(code);
    const lines = Object.entries(obj).map(([k, v]) => `        ${k}: ${JSON.stringify(v)}`);
    return `    ${key}: {\n${lines.join(',\n')}\n    }`;
}

const body = ALL_CODES.map((c) => fmtEntry(c, ABOUT_I18N[c])).join(',\n');

const file = `// Tłumaczenia sekcji „O aplikacji” – wszystkie 35 języków
// Wygenerowano: node scripts/generate-about-i18n.mjs

/** @type {Record<string, Record<string, string>>} */
export const ABOUT_I18N = Object.freeze({\n${body}\n});\n`;

writeFileSync(outPath, file, 'utf8');
console.log(`Wrote ${outPath} (${ALL_CODES.length} languages, ${Object.keys(ABOUT_I18N.de).length} keys)`);
