/**
 * Naprawa: ikony menu (UTF-8 przez Node) + zdjęcia modalu 180px.
 * Zapis wyłącznie writeFileSync(..., 'utf8') – unika uszkodzenia emoji.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const I = {
    menu: '\u2630',
    de: '\u{1F1E9}\u{1F1EA}',
    caret: '\u25BE',
    moon: '\u{1F319}',
    home: '\u{1F3E0}',
    map: '\u{1F5FA}\uFE0F',
    search: '\u{1F50D}',
    heart: '\u2764\uFE0F',
    user: '\u{1F464}',
    book: '\u{1F4D6}',
    phone: '\u{1F4F1}',
    test: '\u{1F9EA}',
    chat: '\u{1F4AC}',
    cart: '\u{1F6D2}',
    scroll: '\u{1F4DC}',
    lock: '\u{1F512}',
    info: '\u2139\uFE0F',
    down: '\u2B07\uFE0F',
    camera: '\u{1F4F7}',
    sparkle: '\u2728',
    page: '\u{1F4C4}',
    link: '\u{1F517}',
    mail: '\u2709\uFE0F',
    handshake: '\u{1F91D}',
    bug: '\u{1F41E}',
    pin: '\u{1F4CD}',
    back: '\u2190',
    close: '\u00D7',
    diary: '\u{1F4D4}'
};

function fixIndexHtml(html) {
    let t = html;

    if (!/<meta\s+charset=["']UTF-8["']/i.test(t)) {
        t = t.replace(/<head>/i, '<head>\n    <meta charset="UTF-8">');
    }

    t = t.replace(
        /(<button type="button" id="menuBtn"[^>]*>)[^<]*(<\/button>)/,
        `$1${I.menu}$2`
    );
    t = t.replace(/aria-label="Men[^"]*"/g, 'aria-label="Menü"');

    t = t.replace(
        /(<span id="languageSwitcherLabel">)[^<]*(<\/span>)/,
        `$1${I.de} Deutsch$2`
    );
    t = t.replace(/aria-label="Sprache [^"]*"/g, 'aria-label="Sprache wählen"');
    t = t.replace(
        /(header-lang-caret" aria-hidden="true">)[^<]*(<\/span>)/,
        `$1${I.caret}$2`
    );
    t = t.replace(
        /(<button type="button" id="darkModeToggleBtn"[^>]*>)[^<]*(<\/button>)/,
        `$1${I.moon}$2`
    );

    const nav = [
        ['home', I.home],
        ['map', I.map],
        ['search', I.search],
        ['favorites', I.heart],
        ['profile', I.user]
    ];
    for (const [view, icon] of nav) {
        t = t.replace(
            new RegExp(
                `(data-view="${view}">\\s*<span class="nav-icon" aria-hidden="true">)[^<]*(</span>)`,
                'g'
            ),
            `$1${icon}$2`
        );
    }

    const sections = [
        ['sectionMain', I.home, 'Hauptmenü'],
        ['sectionLegal', I.book, 'Rechtliches'],
        ['sectionHelp', I.phone, 'Hilfe & Installation'],
        ['sectionTesting', I.test, 'Benutzertests'],
        ['sectionContact', I.chat, 'Kontakt & Autor']
    ];
    for (const [key, icon, label] of sections) {
        t = t.replace(
            new RegExp(`data-i18n-menu-section="${key}"[^>]*>[^<]*</p>`, 'g'),
            `data-i18n-menu-section="${key}" data-i18n-menu-icon="${icon}">${icon} ${label}</p>`
        );
    }

    const byAction = {
        home: I.home,
        map: I.map,
        favorites: I.heart,
        'taste-diary': I.diary,
        cart: I.cart,
        terms: I.scroll,
        privacy: I.lock,
        about: I.info,
        'install-pwa': I.phone,
        guide: I.book,
        'download-app': I.down,
        qr: I.camera,
        recommendations: I.sparkle,
        'download-pdf': I.page,
        feedback: I.chat,
        'test-guide': I.test,
        'share-app': I.link,
        contact: I.mail,
        author: I.user,
        cooperation: I.handshake,
        'report-bug': I.bug,
        'dev-vault': I.lock
    };
    for (const [action, icon] of Object.entries(byAction)) {
        t = t.replace(
            new RegExp(
                `(data-side-menu-action="${action}"[^>]*>\\s*<span class="side-menu-item-icon" aria-hidden="true">)(?!<img)[^<]*(</span>)`,
                'g'
            ),
            `$1${icon}$2`
        );
    }

    t = t.replace(
        /(class="side-menu-back"[^>]*>)[^<]*(<\/button>)/g,
        `$1${I.back}$2`
    );
    t = t.replace(
        /(class="side-menu-close"[^>]*>)[^<]*(<\/button>)/g,
        `$1${I.close}$2`
    );
    t = t.replace(/aria-label="Zur[^"]*"/g, 'aria-label="Zurück"');
    t = t.replace(/aria-label="Schlie[^"]*"/g, 'aria-label="Schließen"');
    t = t.replace(/\?ber die App/g, 'Über die App');
    t = t.replace(/Über die App/g, 'Über die App');

    t = t.replace(/(<li><span aria-hidden="true">)\?+(<\/span> Krzysztof)/g, `$1${I.user}$2`);
    t = t.replace(/(<li><span aria-hidden="true">)\?+(<\/span> <a href="mailto:)/g, `$1${I.mail}$2`);
    t = t.replace(/(<li><span aria-hidden="true">)\?+(<\/span> Polikarski)/g, `$1${I.pin}$2`);
    t = t.replace(
        /(<p class="side-menu-detail-lead"><span aria-hidden="true">)\?+(<\/span> <a href="mailto:)/g,
        `$1${I.mail}$2`
    );
    t = t.replace(
        /<h3 class="side-menu-detail-title">(?:\?+|💬|🧪|🔗) <span data-i18n-menu="feedback">/g,
        `<h3 class="side-menu-detail-title">${I.chat} <span data-i18n-menu="feedback">`
    );
    t = t.replace(
        /<h3 class="side-menu-detail-title">(?:\?+|💬|🧪|🔗) <span data-i18n-menu="testGuide">/g,
        `<h3 class="side-menu-detail-title">${I.test} <span data-i18n-menu="testGuide">`
    );
    t = t.replace(
        /<h3 class="side-menu-detail-title">(?:\?+|💬|🧪|🔗) <span data-i18n-menu="shareApp">/g,
        `<h3 class="side-menu-detail-title">${I.link} <span data-i18n-menu="shareApp">`
    );

    t = t.replace(
        /content="Regionaler Geschmack [^"]*entdecken\.[^"]*"/,
        'content="Regionaler Geschmack – regionale Lebensmittel und Produzenten in deiner Nähe entdecken. Karte, Favoriten, Bewertungen."'
    );
    t = t.replace(
        /property="og:description" content="[^"]*"/,
        'property="og:description" content="Regionale Lebensmittel und Produzenten in deiner Nähe."'
    );
    t = t.replace(
        /<!-- Google tag \(gtag\.js\)[^>]*>/,
        '<!-- Google tag (gtag.js) – aktywne tylko gdy ID jest ustawione -->'
    );
    t = t.replace(
        /<!-- Leaflet MarkerCluster [^>]*>/,
        '<!-- Leaflet MarkerCluster (grupowanie markerow) -->'
    );

    t = t.replace(/style\.css\?v=\d+/, 'style.css?v=541');

    // Polskie linie testowe (często uszkodzone) – i18n i tak nadpisze przy starcie
    t = t.replace(
        /data-i18n-testing="testGuideStep1">[^<]*<\/li>/,
        'data-i18n-testing="testGuideStep1">Otwórz stronę główną – sprawdź ikonę aplikacji (dwa kłosy) i kategorie.</li>'
    );
    t = t.replace(
        /data-i18n-testing="testGuideStep7">[^<]*<\/li>/,
        'data-i18n-testing="testGuideStep7">Otwórz kartę producenta – sprawdź badge weryfikacji i zgłoś błąd.</li>'
    );
    t = t.replace(/zg\?o\? b\?\?d\./g, 'zgłoś błąd.');
    t = t.replace(/Instrukcja test\?w/g, 'Instrukcja testów');
    t = t.replace(/Udost\?pnij aplikacj\?/g, 'Udostępnij aplikację');

    return t;
}

function replaceAll(file, pairs) {
    let text = readFileSync(file, 'utf8');
    for (const [from, to] of pairs) {
        if (!text.includes(from)) continue;
        text = text.split(from).join(to);
    }
    writeFileSync(file, text, 'utf8');
}

const indexPath = join(ROOT, 'index.html');
const after = fixIndexHtml(readFileSync(indexPath, 'utf8'));
writeFileSync(indexPath, after, 'utf8');

const checks = {
    charset: /<meta\s+charset=["']UTF-8["']/i.test(after),
    menu: after.includes(I.menu),
    homeNav: after.includes(`>${I.home}</span>`),
    mapNav: after.includes(I.map),
    searchNav: after.includes(I.search),
    heartNav: after.includes(I.heart),
    profileNav: after.includes(I.user),
    deFlag: after.includes(I.de),
    doubleQ: (after.match(/\?\?/g) || []).length
};
console.log('index', checks);

replaceAll(join(ROOT, 'css/style.css'), [
    ['--photo-modal-height: 200px', '--photo-modal-height: 180px'],
    ['--photo-modal-height, 200px', '--photo-modal-height, 180px'],
    ['height: min(200px, 32vh)', 'height: min(180px, 30vh)'],
    ['max-height: 200px;\n        margin-bottom: 16px;\n        border-radius: 12px;', 'max-height: 180px;\n        margin-bottom: 18px;\n        border-radius: 12px;'],
    ['max-height: 200px;\n        margin-bottom: 18px;', 'max-height: 180px;\n        margin-bottom: 20px;'],
    ['padding: 10px 14px 12px;', 'padding: 10px 14px 14px;'],
    ['padding: 10px 14px 14px;', 'padding: 10px 14px 14px;']
]);

replaceAll(join(ROOT, 'css/prepublish.css'), [
    ['--photo-modal-height, 200px', '--photo-modal-height, 180px'],
    ['max-height: 200px !important;', 'max-height: 180px !important;'],
    ['margin-bottom: 16px !important;', 'margin-bottom: 18px !important;']
]);

replaceAll(join(ROOT, 'css/living-region-experience.css'), [
    ['--photo-modal-height, 200px', '--photo-modal-height, 180px'],
    ['margin-bottom: 16px;', 'margin-bottom: 18px;']
]);

// prepublish / experience cache bumps (ASCII only)
replaceAll(join(ROOT, 'css/style.css'), [
    ["prepublish.css?v=4", 'prepublish.css?v=5'],
    ["experience-stack.css?v=3", 'experience-stack.css?v=4']
]);
replaceAll(join(ROOT, 'css/experience-stack.css'), [
    ["living-region-experience.css?v=2", 'living-region-experience.css?v=3']
]);

const token = readFileSync(join(ROOT, 'css/style.css'), 'utf8').match(
    /--photo-modal-height:\s*([^;]+)/
);
console.log('photo', token && token[1].trim());

const bodyOk = /\.producer-modal-body\s*\{[\s\S]*?overflow-y:\s*auto/.test(
    readFileSync(join(ROOT, 'css/style.css'), 'utf8')
);
console.log('modal body scroll', bodyOk);

// Ponownie policz ?? po pełnej naprawie (plik już zapisany wyżej – odśwież)
const after2 = readFileSync(indexPath, 'utf8');
checks.doubleQ = (after2.match(/\?\?/g) || []).length;
checks.menu = after2.includes(I.menu);
checks.homeNav = after2.includes(`>${I.home}</span>`);

if (!checks.charset || !checks.menu || !checks.homeNav || checks.doubleQ > 0) {
    console.error('FAIL menu repair', checks);
    // Pokaż pozostałe ??
    let from = 0;
    for (let i = 0; i < Math.min(5, checks.doubleQ); i++) {
        const pos = after2.indexOf('??', from);
        console.error(JSON.stringify(after2.slice(Math.max(0, pos - 30), pos + 30)));
        from = pos + 2;
    }
    process.exit(1);
}
if (!token || !token[1].includes('180')) {
    console.error('FAIL photo 180');
    process.exit(1);
}
console.log('OK fix-menu-and-modal');
