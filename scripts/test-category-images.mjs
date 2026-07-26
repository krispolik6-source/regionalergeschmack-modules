import fs from 'fs';
import { CATEGORY_IMAGES, getCategoryImage, buildCategoryImageStyle } from '../js/presentation/categoryImages.js';

let failed = 0;
function ok(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error('FAIL', msg);
    } else {
        console.log('OK', msg);
    }
}

const homeIds = ['farmers', 'bakeries', 'meat', 'shops', 'restaurants', 'fastFood', 'vending', 'favorites'];
for (const id of homeIds) {
    const url = getCategoryImage(id);
    ok(Boolean(url), `map ${id}`);
    const file = String(url).replace(/^\//, '');
    ok(fs.existsSync(file), `file ${id} → ${file}`);
}

ok(getCategoryImage('honey')?.includes('honey'), 'honey mapping');
ok(fs.existsSync('assets/images/backgrounds/category_honey.webp'), 'honey file');
ok(getCategoryImage('farmer') === getCategoryImage('farmers'), 'farmer alias');
ok(buildCategoryImageStyle('fastFood').includes('--category-image'), 'style attr');

const home = fs.readFileSync(new URL('../js/views/home.js', import.meta.url), 'utf8');
ok(home.includes('buildCategoryImageStyle') && home.includes('category-card--photo'), 'home wired');
ok((home.match(/function buildCategoriesHtml/g) || []).length === 1, 'single buildCategoriesHtml');

console.log(failed ? `RESULT FAIL ${failed}` : 'RESULT PASS');
process.exit(failed ? 1 : 0);
