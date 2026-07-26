// scripts/test-product-images.mjs – weryfikacja zdjęć produktów (WebP)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PRODUCT_IMAGE_SLUGS } from '../js/data/productImages.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let failures = 0;

function ok(msg) { console.log(`✅ ${msg}`); }
function fail(msg) { console.error(`❌ ${msg}`); failures += 1; }

for (const slug of Object.keys(PRODUCT_IMAGE_SLUGS)) {
    const rel = `assets/images/products/${slug}.webp`;
    const full = path.join(root, rel);
    if (fs.existsSync(full)) ok(`${slug}.webp`);
    else fail(`Brak pliku: ${rel}`);
}

console.log(`\n--- Product images test ---\n${failures ? 'FAILED' : 'OK'}`);
process.exit(failures ? 1 : 0);
