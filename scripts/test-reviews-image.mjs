// scripts/test-reviews-image.mjs – test zdjęć w opiniach

const mem = {};
globalThis.localStorage = {
    getItem: (key) => (key in mem ? mem[key] : null),
    setItem: (key, value) => { mem[key] = String(value); },
    removeItem: (key) => { delete mem[key]; }
};

import { addReview, getReviews, normalizeReviewImageUrl } from '../js/data/reviews.js';

const STORAGE_KEY = 'rg_producer_reviews';

let failures = 0;
function ok(msg) { console.log(`✅ ${msg}`); }
function fail(msg) { console.error(`❌ ${msg}`); failures += 1; }

if (normalizeReviewImageUrl('https://example.com/photo.webp')) ok('normalizeReviewImageUrl akceptuje https');
else fail('normalizeReviewImageUrl powinno akceptować https');

if (!normalizeReviewImageUrl('ftp://example.com/x.jpg')) ok('normalizeReviewImageUrl odrzuca ftp');
else fail('normalizeReviewImageUrl powinno odrzucać ftp');

const entry = addReview('test-producer', {
    user: 'Tester',
    rating: 5,
    comment: 'Świetne produkty!',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80'
});

if (entry?.imageUrl) ok('addReview zapisuje imageUrl');
else fail('addReview nie zapisało imageUrl');

const saved = getReviews('test-producer').find((r) => r.user === 'Tester');
if (saved?.imageUrl) ok('getReviews zwraca imageUrl');
else fail('getReviews nie zwraca imageUrl');

console.log(`\n--- Reviews image test ---\n${failures ? 'FAILED' : 'OK'}`);
process.exit(failures ? 1 : 0);
