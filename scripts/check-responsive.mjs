/**
 * Theme Toggle + mobile polish (14px / ≤480)
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function assert(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error(`❌ ${msg}`);
    } else {
        console.log(`✅ ${msg}`);
    }
}

const cssPath = join(ROOT, 'css/theme-toggle-premium.css');
assert(existsSync(cssPath), 'theme-toggle-premium.css istnieje');
const css = readFileSync(cssPath, 'utf8');
const style = readFileSync(join(ROOT, 'css/style.css'), 'utf8');
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
const ph = readFileSync(join(ROOT, 'css/premium-header.css'), 'utf8');
const home = readFileSync(join(ROOT, 'js/views/home.js'), 'utf8');

assert(style.includes('theme-toggle-premium.css'), 'style.css importuje theme-toggle-premium');
assert(/font-size:\s*14px/i.test(css), 'font-size 14px');
assert(/max-width:\s*480px/i.test(css), 'breakpoint ≤480px');
assert(/overflow:\s*hidden/i.test(css), 'overflow hidden');
assert(/border-radius:\s*50%/i.test(css), 'okrągły (50%)');
assert(/250ms|300ms|200ms/i.test(css), 'animacja 200–300 ms');
assert(/min-width:\s*768px/i.test(css), 'breakpoint 768 desktop');
assert(/prefers-reduced-motion/i.test(css), 'reduced-motion');
assert(/header-right/i.test(css), 'header-right nie wypycha poza ekran');
assert(html.includes('id="darkModeToggleBtn"'), 'przycisk w HTML');
assert(html.includes('theme-toggle-premium'), 'klasa theme-toggle-premium');
assert(/🌞/.test(html), 'HTML: ikona dzienna 🌞');
assert(/\.header-content/i.test(ph), 'layout nagłówka (premium-header)');
assert(/font-size:\s*14px/i.test(ph), 'premium-header dark btn 14px');
assert(
    home.includes("'farmers', 'bakeries', 'meat', 'shops', 'restaurants', 'fastFood', 'vending', 'favorites'")
    || (home.includes('farmers') && home.includes('favorites') && home.includes('CATEGORY_IDS')),
    'Home CATEGORY_IDS kanoniczna ósemka'
);
assert(!/quick-filter.*farmers|id: 'restaurants'/.test(home.split('buildQuickFiltersHtml')[1]?.slice(0, 800) || ''),
    'quick filters bez duplikatów kategorii');

if (failed) {
    console.error(`\n${failed} failed`);
    process.exit(1);
}
console.log('\n--- Responsive check ---');
console.log('OK');
