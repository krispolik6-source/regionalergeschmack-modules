// scripts/test-taste-advisor.mjs – ETAP 14
import assert from 'assert';
import {
    getAdvisorFirstName,
    isTasteAdvisorReady,
    getTasteAdvisorBriefing
} from '../js/presentation/tasteAdvisor.js';
import { TRANSLATIONS } from '../js/translations.js';

const mem = new Map();
globalThis.localStorage = {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => { mem.set(k, String(v)); },
    removeItem: (k) => { mem.delete(k); }
};

for (const lang of ['de', 'en', 'pl', 'mk']) {
    assert.ok(TRANSLATIONS[lang]?.home?.tasteAdvisorTitle);
    assert.ok(TRANSLATIONS[lang]?.tasteAdvisor?.honeyVisit.includes('{place}'));
    assert.ok(TRANSLATIONS[lang]?.tasteAdvisor?.helloNamed.includes('{name}'));
}

assert.strictEqual(getAdvisorFirstName('Kris Polikarski'), 'Kris');
assert.strictEqual(getAdvisorFirstName(''), '');

// Brak historii → nie gotowy
assert.strictEqual(isTasteAdvisorReady(), false);
let brief = getTasteAdvisorBriefing();
assert.strictEqual(brief.ready, false);

// Symulacja kilku dni + wizyt
const old = Date.now() - 5 * 86400000;
mem.set('rg_taste_advisor_first_seen_v1', String(old));
mem.set('rg_user_history_v1', JSON.stringify({
    viewed: [
        { id: 'content-imkerei-sonne', name: 'Imkerei Sonne', category: 'farmer', at: Date.now() - 32 * 86400000 },
        { id: 'content-baeckerei-schmidt', name: 'Bäckerei Schmidt', category: 'bakery', at: Date.now() - 3 * 86400000 },
        { id: 'content-hof-mueller', name: 'Hof Müller', category: 'farmer', at: Date.now() - 10 * 86400000 }
    ],
    visited: [
        { id: 'content-imkerei-sonne', name: 'Imkerei Sonne', category: 'honey', at: Date.now() - 32 * 86400000 }
    ],
    searched: [],
    purchased: [],
    products: [],
    routes: [],
    reservations: []
}));

assert.strictEqual(isTasteAdvisorReady(), true);
brief = getTasteAdvisorBriefing();
assert.ok(brief.ready);
assert.ok(brief.paragraphs.length >= 2);
assert.ok(brief.paragraphs.some((p) => /Honig|honey|miód|мед/i.test(p) || /Imkerei|pasiek|Sonne/i.test(p)));

const again = getTasteAdvisorBriefing();
assert.deepStrictEqual(again.paragraphs, brief.paragraphs, 'ten sam dzień = ten sam briefing');

console.log('✅ ready + honey narrative');
console.log(`✅ paragraphs: ${brief.paragraphs.length}`);
console.log('\n--- Taste Advisor test ---\nOK');
