// scripts/test-producer-mood.mjs – ETAP 17
import assert from 'assert';
import { resolveProducerMood } from '../js/presentation/producerMood.js';
import { resolveProductImageSlug } from '../js/data/productImages.js';
import { TRANSLATIONS } from '../js/translations.js';

assert.strictEqual(resolveProducerMood({
    id: 'content-imkerei-sonne',
    name: 'Imkerei Sonne',
    category: 'farmer',
    products: [{ name: 'Blütenhonig', imageSlug: 'honey' }]
}), 'honey');

assert.strictEqual(resolveProducerMood({
    name: 'Bäckerei Schmidt',
    category: 'bakery'
}), 'bakery');

assert.strictEqual(resolveProducerMood({
    name: 'Metzgerei',
    category: 'meat'
}), 'meat');

assert.strictEqual(resolveProducerMood({
    name: 'Gasthof',
    category: 'restaurant'
}), 'restaurant');

// Guard zdjęć
assert.strictEqual(
    resolveProductImageSlug({ imageSlug: 'bread', category: 'meat', name: 'Steak' }),
    'steak'
);
assert.strictEqual(
    resolveProductImageSlug({ imageSlug: 'sausage', category: 'bakery', name: 'Brot' }),
    'bread'
);
assert.strictEqual(
    resolveProductImageSlug({ name: 'Kartoffeln', category: 'farmer' }),
    'potatoes'
);
assert.strictEqual(
    resolveProductImageSlug({ name: 'Blütenhonig', category: 'farmer' }),
    'honey'
);

assert.strictEqual(TRANSLATIONS.pl.product.sampleBadge, 'Zdjęcie przykładowe');
assert.ok(TRANSLATIONS.de.product.sampleBadge);
assert.ok(TRANSLATIONS.en.product.sampleBadge);

console.log('✅ mood + image guards + sample badge');
console.log('\n--- Producer Mood / ETAP 17 ---\nOK');
