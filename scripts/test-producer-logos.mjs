import fs from 'fs';
import {
    resolveProducerLogo,
    buildProducerLogoHtml,
    CATEGORY_DEFAULT_LOGOS,
    detectChainBrand
} from '../js/presentation/chainBrands.js';

let failed = 0;
function ok(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error('FAIL', msg);
    } else {
        console.log('OK', msg);
    }
}

for (const [cat, path] of Object.entries(CATEGORY_DEFAULT_LOGOS)) {
    if (cat === 'fastfood') continue;
    ok(fs.existsSync(path.replace(/^\//, '')), `asset ${cat}`);
}

ok(
    resolveProducerLogo({ name: 'Metzgerei Meyer', category: 'meat' }) === CATEGORY_DEFAULT_LOGOS.meat,
    'Metzgerei Meyer → meat logo'
);
ok(
    resolveProducerLogo({ name: 'Hofbäckerei Schulte', category: 'bakery' }) === CATEGORY_DEFAULT_LOGOS.bakery,
    'Hofbäckerei Schulte → bakery'
);
ok(
    resolveProducerLogo({ name: 'Demeterhofladen', category: 'farmer' }) === CATEGORY_DEFAULT_LOGOS.farmer,
    'Demeterhofladen → farmer'
);
ok(
    resolveProducerLogo({ name: 'Automat Markt', category: 'vending' }) === CATEGORY_DEFAULT_LOGOS.vending,
    'Automat → vending'
);
ok(
    resolveProducerLogo({ name: 'EDEKA Bonn', category: 'shop', chain: 'edeka' })?.includes('edeka'),
    'Edeka chain logo'
);
ok(
    resolveProducerLogo({ name: 'ALDI Süd', category: 'shop' })?.includes('aldi'),
    'Aldi from name'
);
ok(
    resolveProducerLogo({ name: 'Random Place', category: 'farmer', logo: '' }) == null,
    'no logo → null (emoji fallback)'
);
ok(
    buildProducerLogoHtml({ name: 'Random Place', category: 'farmer' }).html.includes('🌾'),
    'emoji fallback farmer'
);
ok(
    buildProducerLogoHtml({ name: 'Bäckerei Schmidt', category: 'bakery' }).url?.includes('bakery'),
    'bakery card logo'
);
ok(
    resolveProducerLogo({ name: 'X', category: 'meat', logo: 'https://example.com/logo.png' }) === 'https://example.com/logo.png',
    'own logo wins'
);
ok(detectChainBrand('Netto City')?.id === 'netto', 'netto detect');

const osm = fs.readFileSync(new URL('../js/data/osmService.js', import.meta.url), 'utf8');
ok(osm.includes('extractOsmLogoUrl') && osm.includes('logo,'), 'osm logo field');

const display = fs.readFileSync(new URL('../js/presentation/producerDisplay.js', import.meta.url), 'utf8');
ok(display.includes('buildProducerLogoHtml'), 'popup/modal header uses logo helper');

const home = fs.readFileSync(new URL('../js/views/home.js', import.meta.url), 'utf8');
ok(home.includes('buildProducerLogoHtml'), 'home cards use logo helper');

console.log(failed ? `RESULT FAIL ${failed}` : 'RESULT PASS');
process.exit(failed ? 1 : 0);
