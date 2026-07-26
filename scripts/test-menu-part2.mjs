/**
 * Smoke test Partia 2 audytu menu (W1, W2, W6, W7, W8).
 */
import { MENU_I18N } from '../js/translations-menu.js';
import { ABOUT_I18N } from '../js/translations-about.js';
import { LEGAL_HELP_I18N } from '../js/translations-legal-help.js';
import { LEGAL_HELP_LOCALES } from '../js/translations-legal-help-locales.js';
import { TRANSLATIONS } from '../js/translations.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.RG_TEST_URL || 'http://127.0.0.1:3456/';

function assert(cond, msg) {
    if (!cond) throw new Error(msg);
}

const html = await (await fetch(BASE)).text();
const style = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');
const dark = fs.readFileSync(path.join(ROOT, 'css', 'dark-mode-contrast.css'), 'utf8');
const mobile = fs.readFileSync(path.join(ROOT, 'css', 'mobile-premium.css'), 'utf8');
const settings = fs.readFileSync(path.join(ROOT, 'js', 'core', 'settings.js'), 'utf8');

// W1 – About without duplicates, with more links
assert(!html.includes('sideMenuAboutQrImage'), 'W1: about QR removed');
assert(html.includes('data-i18n-about="moreTitle"'), 'W1: moreTitle present');
assert(html.includes('side-menu-about-links'), 'W1: about links present');
assert(!/data-side-menu-view="about"[\s\S]*?data-i18n-about="cooperationText"/.test(html), 'W1: coop still in about');
assert(!/data-side-menu-view="about"[\s\S]*?data-i18n-about="downloadPwaTitle"/.test(html), 'W1: download still in about');
assert(ABOUT_I18N.de.moreTitle && ABOUT_I18N.pl.moreTitle, 'W1: about moreTitle i18n');

// W2 – legal/help for 36 langs
const core = Object.keys(LEGAL_HELP_I18N);
const locales = Object.keys(LEGAL_HELP_LOCALES);
assert(core.length === 4, `W2 core langs ${core.length}`);
assert(locales.length === 32, `W2 locales ${locales.length}`);
assert(TRANSLATIONS.fr.legal.termsTitle.includes('Conditions'), 'W2 fr terms');
assert(TRANSLATIONS.cs.help.guideTitle.includes('příručka') || TRANSLATIONS.cs.help.guideTitle.includes('Uživatel'), 'W2 cs guide');
assert(!TRANSLATIONS.ja.help.coopLead.startsWith('My name'), 'W2 ja coop not EN');

// W6 – testing labels localized
assert(MENU_I18N.cs.sectionTesting !== 'User testing', 'W6 cs');
assert(MENU_I18N.hu.feedback !== 'Feedback' || MENU_I18N.hu.testGuide !== 'Test guide', 'W6 hu');
assert(MENU_I18N.en.sectionTesting === 'User testing', 'W6 en kept');

// W7 – unified dark panel
assert(style.includes('body.dark-mode .side-menu-panel') && style.includes('#1a2218'), 'W7 style panel');
assert(!style.match(/body\.dark-mode \.side-menu-panel\s*\{[^}]*#1f2b3d/), 'W7 old blue removed');
assert(dark.includes('#1a2218'), 'W7 contrast palette');

// W8 – z-index
assert(/\.side-menu\s*\{[^}]*z-index:\s*1250/.test(style), 'W8 style side-menu 1250');
assert(/\.side-menu\s*\{[^}]*z-index:\s*1250/.test(mobile), 'W8 mobile side-menu 1250');
assert(settings.includes("zIndex = '1260'"), 'W8 dropdown z 1260');
assert(settings.includes('appendChild(dropdown)'), 'W8 reparent to body');

console.log('PASS test-menu-part2 @', BASE);
console.log('  W1 About slim + more links');
console.log('  W2 legal/help 4+32 langs');
console.log('  W6 testing labels localized');
console.log('  W7 dark #1a2218 unified');
console.log('  W8 menu 1250 / dropdown 1260 on body');
