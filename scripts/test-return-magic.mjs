// scripts/test-return-magic.mjs – ETAP 15E
import assert from 'assert';
import {
    isReturnMagicReady,
    getReturnMagicBriefing,
    countNewProductsSinceVisit
} from '../js/presentation/returnMagic.js';
import { TRANSLATIONS } from '../js/translations.js';

const mem = new Map();
globalThis.localStorage = {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => { mem.set(k, String(v)); },
    removeItem: (k) => { mem.delete(k); }
};

for (const lang of ['de', 'en', 'pl', 'mk']) {
    assert.ok(TRANSLATIONS[lang]?.returnMagic?.welcomeNamed.includes('{name}'));
    assert.ok(TRANSLATIONS[lang]?.returnMagic?.newProducts.includes('{count}'));
    assert.ok(TRANSLATIONS[lang]?.returnMagic?.favoriteBakeryOpen.includes('{place}'));
    assert.ok(TRANSLATIONS[lang]?.returnMagic?.stillAvailable.includes('{product}'));
}

// Ton rozmowy – nie „system notification”
assert.ok(TRANSLATIONS.pl.returnMagic.welcomeNamed.includes('Witamy ponownie'));
assert.ok(!/powiadomienie|notification|alert/i.test(TRANSLATIONS.pl.returnMagic.newProducts));

// Świeża instalacja → brak magii
mem.clear();
assert.strictEqual(isReturnMagicReady(), false);
assert.strictEqual(getReturnMagicBriefing().ready, false);

// Absencja 5 dni + historia
mem.clear();
const fiveDaysAgo = Date.now() - 5 * 86400000;
mem.set('rg_return_magic_last_v1', String(fiveDaysAgo));
mem.set('rg_return_magic_snap_v1', JSON.stringify({ at: fiveDaysAgo, ids: ['old-only'] }));
mem.set('rg_user_history_v1', JSON.stringify({
    viewed: [
        { id: 'content-baeckerei-schmidt', name: 'Bäckerei Schmidt', category: 'bakery', at: fiveDaysAgo - 86400000 }
    ],
    visited: [],
    searched: [],
    purchased: [],
    products: [
        {
            id: 'content-hof-mueller-apples',
            name: 'Äpfel (bio)',
            at: Date.now() - 7 * 86400000
        }
    ],
    routes: [],
    reservations: []
}));
mem.set('rg_favorites', JSON.stringify(['content-baeckerei-schmidt']));

assert.strictEqual(isReturnMagicReady(), true);
const brief = getReturnMagicBriefing();
assert.ok(brief.ready);
assert.ok(brief.paragraphs.length >= 2);
assert.ok(brief.paragraphs.some((p) => /Willkommen|Welcome|Witamy|Добредојде/i.test(p)));

const again = getReturnMagicBriefing();
assert.deepStrictEqual(again.paragraphs, brief.paragraphs, 'ten sam dzień = ta sama rozmowa');

assert.ok(countNewProductsSinceVisit(5) >= 1);

console.log(`✅ paragraphs: ${brief.paragraphs.length}`);
console.log(`✅ sample: ${brief.paragraphs[0]}`);
console.log('\n--- Return Magic test ---\nOK');
