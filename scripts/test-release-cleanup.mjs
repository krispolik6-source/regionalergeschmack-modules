/**
 * Final Release Cleanup — smoke tests
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function ok(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error('FAIL', msg);
    } else {
        console.log('OK', msg);
    }
}

const legal = readFileSync(join(ROOT, 'js/views/legal.js'), 'utf8');
const legalHelp = readFileSync(join(ROOT, 'js/translations-legal-help.js'), 'utf8');
const home = readFileSync(join(ROOT, 'js/views/home.js'), 'utf8');
const style = readFileSync(join(ROOT, 'css/style.css'), 'utf8');
const cleanup = readFileSync(join(ROOT, 'css/release-cleanup.css'), 'utf8');
const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
const index = readFileSync(join(ROOT, 'index.html'), 'utf8');

ok(!legal.includes('PLACEHOLDERS'), 'legal.js: no PLACEHOLDERS');
ok(!legal.includes('wklej wygenerowany'), 'legal.js: no paste placeholder');
ok(legal.includes('legalText('), 'legal.js: uses i18n legal keys');
ok(legalHelp.includes('impressumTitle'), 'legal-help: impressum content');
ok(!legalHelp.includes('demnächst'), 'legal-help: no demnächst in DE help');
ok(!home.includes('recommendedPlaceholder'), 'home.js: no coming-soon strip');

ok(style.includes('release-cleanup.css'), 'style.css imports release-cleanup');
ok(cleanup.includes('--legal-footer-height: 44px'), 'legal footer height 44px');
ok(cleanup.includes('.favorite-item .name'), 'name class dark mode fix');

ok(sw.includes('style.css?v=572'), 'sw precache matches index');
ok(index.includes('style.css?v=572'), 'index cache bust');

const cart = readFileSync(join(ROOT, 'js/views/cart.js'), 'utf8');
const fav = readFileSync(join(ROOT, 'js/views/favorites.js'), 'utf8');
ok(cart.includes('44px'), 'cart qty buttons 44px');
ok(fav.includes('min-height: 44px'), 'favorite remove 44px');

console.log(failed ? `\nRESULT FAIL ${failed}` : '\nRESULT PASS');
process.exit(failed ? 1 : 0);
