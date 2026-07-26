import fs from 'fs';
import { getFastFoodImage, FAST_FOOD_IMAGES, detectChainBrand } from '../js/presentation/chainBrands.js';

let failed = 0;
function ok(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error('FAIL', msg);
    } else {
        console.log('OK', msg);
    }
}

for (const id of Object.keys(FAST_FOOD_IMAGES)) {
    const p = `assets/images/fastfood/${id}.webp`;
    ok(fs.existsSync(p), `file ${id}`);
    ok(getFastFoodImage(id) === FAST_FOOD_IMAGES[id], `by id ${id}`);
}

ok(getFastFoodImage("McDonald's Bonn")?.includes('mcdonalds'), 'detect mcdonalds');
ok(getFastFoodImage({ name: 'KFC Köln', category: 'fast_food' })?.includes('kfc'), 'kfc producer');
ok(getFastFoodImage({ name: 'Imbiss am Markt', category: 'fast_food' })?.includes('burger'), 'fallback imbiss');
ok(detectChainBrand('Burger King')?.id === 'burgerking', 'burgerking detect');
ok(getFastFoodImage('subway')?.includes('subway'), 'subway id');

const home = fs.readFileSync(new URL('../js/views/home.js', import.meta.url), 'utf8');
ok(home.includes('getFastFoodImage'), 'home uses getFastFoodImage');

console.log(failed ? `RESULT FAIL ${failed}` : 'RESULT PASS');
process.exit(failed ? 1 : 0);
