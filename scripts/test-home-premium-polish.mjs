/**
 * Zadanie 10 — Final Premium Polish (Home v1 smoke)
 */
import { readFileSync, existsSync } from 'node:fs';
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

const css = readFileSync(join(ROOT, 'css/home-v1.css'), 'utf8');
const style = readFileSync(join(ROOT, 'css/style.css'), 'utf8');

ok(style.includes('home-v1.css?v='), 'style.css imports home-v1');
ok(css.includes('Zadanie 10'), 'final polish section');
ok(css.includes('Ostatni Premium Polish'), 'micro polish section');
ok(css.includes('--home-section-icon-size'), 'section icon token');
ok(css.includes('--home-v1-gap'), 'section gap token');
ok(css.includes('--home-btn-radius'), 'button radius token');
ok(css.includes('--home-card-radius'), 'card radius token');
ok(css.includes('animation: none'), 'disabled breathe/pulse');
ok(css.includes('body.dark-mode .home-page--v1'), 'dark mode rules');

const breakpoints = ['320px', '360px', '390px', '430px', '768px', '1024px'];
for (const bp of breakpoints) {
    ok(css.includes(bp), `breakpoint ${bp}`);
}

ok(/backdrop-filter:\s*none/i.test(css), 'no glass on hero shell');
ok(css.includes('home-v1-enter-fade'), 'subtle page fade');
ok(existsSync(join(ROOT, 'js/views/home.js')), 'home.js exists');

const home = readFileSync(join(ROOT, 'js/views/home.js'), 'utf8');
ok(home.includes('home-page--v1'), 'home-page--v1 class wired');
ok(!home.includes('buildCategoriesHtml(') || (home.match(/function buildCategoriesHtml/g) || []).length === 1,
    'single buildCategoriesHtml');

console.log(failed ? `\nRESULT FAIL ${failed}` : '\nRESULT PASS');
process.exit(failed ? 1 : 0);
