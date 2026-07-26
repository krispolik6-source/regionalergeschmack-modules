import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const path = join(ROOT, 'index.html');
let t = readFileSync(path, 'utf8');

// Brutal but safe branded replacements
const reps = [
    [/<span id="languageSwitcherLabel">\?+ Deutsch<\/span>/, '<span id="languageSwitcherLabel">🇩🇪 Deutsch</span>'],
    [/aria-label="Sprache w\?hlen"/, 'aria-label="Sprache wählen"'],
    [/aria-label="Men\?"/, 'aria-label="Menü"'],
    [/data-i18n-aria="a11y.menu">\?<\/button>/, 'data-i18n-aria="a11y.menu">☰</button>'],
    [/header-lang-caret" aria-hidden="true">\?<\/span>/, 'header-lang-caret" aria-hidden="true">▾</span>'],
    [/aria-label="Dunkelmodus">\?\?<\/button>/, 'aria-label="Dunkelmodus">🌙</button>'],
    [/data-view="home">\s*<span class="nav-icon" aria-hidden="true">\?+<\/span>/, 'data-view="home">\n            <span class="nav-icon" aria-hidden="true">🏠</span>'],
    [/data-view="map">\s*<span class="nav-icon" aria-hidden="true">\?+<\/span>/, 'data-view="map">\n            <span class="nav-icon" aria-hidden="true">🗺️</span>'],
    [/data-view="search">\s*<span class="nav-icon" aria-hidden="true">\?+<\/span>/, 'data-view="search">\n            <span class="nav-icon" aria-hidden="true">🔍</span>'],
    [/data-view="favorites">\s*<span class="nav-icon" aria-hidden="true">\?+<\/span>/, 'data-view="favorites">\n            <span class="nav-icon" aria-hidden="true">❤️</span>'],
    [/data-view="profile">\s*<span class="nav-icon" aria-hidden="true">\?+<\/span>/, 'data-view="profile">\n            <span class="nav-icon" aria-hidden="true">👤</span>'],
    [/data-i18n-menu-section="sectionMain"[^>]*>\?+ Hauptmen.?<\/p>/, 'data-i18n-menu-section="sectionMain" data-i18n-menu-icon="🏠">🏠 Hauptmenü</p>'],
    [/data-i18n-menu-section="sectionLegal"[^>]*>\?+ Rechtliches<\/p>/, 'data-i18n-menu-section="sectionLegal" data-i18n-menu-icon="📖">📖 Rechtliches</p>'],
    [/data-i18n-menu-section="sectionHelp"[^>]*>\?+ Hilfe & Installation<\/p>/, 'data-i18n-menu-section="sectionHelp" data-i18n-menu-icon="📲">📲 Hilfe & Installation</p>'],
    [/data-i18n-menu-section="sectionTesting"[^>]*>\?+ Benutzertests<\/p>/, 'data-i18n-menu-section="sectionTesting" data-i18n-menu-icon="🧪">🧪 Benutzertests</p>'],
    [/data-i18n-menu-section="sectionContact"[^>]*>\?+ Kontakt & Autor<\/p>/, 'data-i18n-menu-section="sectionContact" data-i18n-menu-icon="💬">💬 Kontakt & Autor</p>'],
    [/<!-- Leaflet MarkerCluster \([^)]+\) -->/, '<!-- Leaflet MarkerCluster (wydajność na telefonie: grupowanie markerów) -->'],
    [/content="Regionaler Geschmack \? regionale Lebensmittel und Produzenten in deiner N\?he entdecken\./, 'content="Regionaler Geschmack – regionale Lebensmittel und Produzenten in deiner Nähe entdecken.'],
    [/content="Regionale Lebensmittel und Produzenten in deiner N\?he\."/, 'content="Regionale Lebensmittel und Produzenten in deiner Nähe."'],
    [/<!-- Google tag \(gtag\.js\) \? aktiv/, '<!-- Google tag (gtag.js) – aktiv'],
    [/<!-- Google tag \(gtag\.js\) \? aktywne/, '<!-- Google tag (gtag.js) – aktywne'],
    [/<!-- Google tag \(gtag\.js\) .\s*aktywne/, '<!-- Google tag (gtag.js) – aktywne']
];

for (const [re, to] of reps) {
    t = t.replace(re, to);
}

const byAction = {
    home: '🏠',
    map: '🗺️',
    favorites: '❤️',
    cart: '🛒',
    premium: '👑',
    terms: '📜',
    privacy: '🔒',
    about: 'ℹ️',
    'install-pwa': '📲',
    guide: '📖',
    'download-app': '⬇️',
    qr: '📷',
    recommendations: '✨',
    'download-pdf': '📄',
    feedback: '💬',
    'test-guide': '🧪',
    'share-app': '🔗',
    contact: '✉️',
    author: '👤',
    cooperation: '🤝',
    'report-bug': '🐞'
};

for (const [action, icon] of Object.entries(byAction)) {
    t = t.replace(
        new RegExp(
            `(data-side-menu-action="${action}"[^>]*>\\s*<span class="side-menu-item-icon" aria-hidden="true">)\\?+(</span>)`,
            'g'
        ),
        `$1${icon}$2`
    );
}

t = t.replace(/(<li><span aria-hidden="true">)\?+(<\/span> Krzysztof)/g, '$1👤$2');
t = t.replace(/(<li><span aria-hidden="true">)\?+(<\/span> <a href="mailto:)/g, '$1✉️$2');
t = t.replace(/(<li><span aria-hidden="true">)\?+(<\/span> Polikarski)/g, '$1📍$2');
t = t.replace(/(<p class="side-menu-detail-lead"><span aria-hidden="true">)\?+(<\/span> <a href="mailto:)/g, '$1✉️$2');
t = t.replace(/<h3 class="side-menu-detail-title">\?+ <span data-i18n-menu="feedback">/g, '<h3 class="side-menu-detail-title">💬 <span data-i18n-menu="feedback">');
t = t.replace(/<h3 class="side-menu-detail-title">\?+ <span data-i18n-menu="testGuide">/g, '<h3 class="side-menu-detail-title">🧪 <span data-i18n-menu="testGuide">');
t = t.replace(/<h3 class="side-menu-detail-title">\?+ <span data-i18n-menu="shareApp">/g, '<h3 class="side-menu-detail-title">🔗 <span data-i18n-menu="shareApp">');
t = t.replace(/\?ber die App/g, 'Über die App');
t = t.replace(/aria-label="Zur\?ck"/g, 'aria-label="Zurück"');
t = t.replace(/aria-label="Schlie\?en"/g, 'aria-label="Schließen"');
t = t.replace(/data-i18n-aria="a11y.back">\?<\/button>/g, 'data-i18n-aria="a11y.back">←</button>');
t = t.replace(/data-i18n-aria="a11y.close">\?<\/button>/g, 'data-i18n-aria="a11y.close">×</button>');

// Polish test guide lines – rewrite whole attributes if still broken
t = t.replace(
    /data-i18n-testing="testGuideStep1">[^<]+<\/li>/,
    'data-i18n-testing="testGuideStep1">Otwórz stronę główną – sprawdź ikonę aplikacji (dwa kłosy) i kategorie.</li>'
);
t = t.replace(
    /zg\?o\? b\?\?d\./g,
    'zgłoś błąd.'
);

writeFileSync(path, t, 'utf8');
const left = t.match(/\?\?/g) || [];
console.log('?? left', left.length);
console.log('flags', { home: t.includes('🏠'), de: t.includes('🇩🇪'), crown: t.includes('👑') });
if (left.length) {
    let from = 0;
    for (let i = 0; i < Math.min(8, left.length); i++) {
        const pos = t.indexOf('??', from);
        console.log(JSON.stringify(t.slice(pos - 25, pos + 35)));
        from = pos + 2;
    }
}
