/**
 * Smoke: Taste Diary P1
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function assert(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error(`FAIL ${msg}`);
    } else {
        console.log(`OK   ${msg}`);
    }
}

// localStorage polyfill for Node
const store = new Map();
globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k)
};

const {
    TASTE_DIARY_STORAGE_KEY,
    getTasteDiaryEntries,
    getTasteDiaryCount,
    addTasteDiaryEntry,
    removeTasteDiaryEntry
} = await import(pathToFileURL(join(ROOT, 'js/core/tasteDiary.js')).href);

assert(TASTE_DIARY_STORAGE_KEY === 'rg_taste_diary', 'storage key');
assert(getTasteDiaryEntries().length === 0, 'starts empty');

const bad = addTasteDiaryEntry({ producerId: 'p1', productName: '', rating: 5 });
assert(!bad.ok, 'rejects empty product');

const older = addTasteDiaryEntry({
    producerId: 'p0',
    producerName: 'Alt',
    productName: 'Stary',
    rating: 3,
    note: '',
    image: ''
});
assert(older.ok, 'adds older');
// Backdate first entry
const stored = JSON.parse(localStorage.getItem('rg_taste_diary'));
stored[0].date = '2020-01-01T12:00:00.000Z';
localStorage.setItem('rg_taste_diary', JSON.stringify(stored));

const ok = addTasteDiaryEntry({
    producerId: 'p1',
    producerName: 'Hof Test',
    productName: 'Miód lipowy',
    rating: 5,
    note: 'Pyszny',
    image: ''
});
assert(ok.ok && ok.entry?.id, 'adds entry');
assert(getTasteDiaryCount() === 2, 'count 2');
assert(getTasteDiaryEntries()[0].productName === 'Miód lipowy', 'newest first');
assert(getTasteDiaryEntries()[1].productName === 'Stary', 'older second');

const raw = JSON.parse(localStorage.getItem('rg_taste_diary'));
assert(Array.isArray(raw) && raw.some((e) => e.producerId === 'p1'), 'localStorage shape');

removeTasteDiaryEntry(ok.entry.id);
assert(getTasteDiaryCount() === 1, 'count after delete');
removeTasteDiaryEntry(older.entry.id);
assert(getTasteDiaryEntries().length === 0, 'delete works');

const modal = readFileSync(join(ROOT, 'js/views/producerModal.js'), 'utf8');
assert(modal.includes('buildTasteDiaryHtml'), 'modal has diary UI');
assert(modal.includes('data-taste-diary-toggle'), 'modal toggle button');
assert(modal.includes('tasteDiary.add'), 'modal i18n add');

const side = readFileSync(join(ROOT, 'js/core/sideMenu.js'), 'utf8');
assert(side.includes('taste-diary'), 'side menu action');
assert(side.includes('renderTasteDiaryPanel'), 'side menu list');
assert(side.includes('refreshTasteDiaryMenuCount'), 'menu count helper');
assert(side.includes('month: \'long\'') || side.includes('month: "long"'), 'long date format');

const idx = readFileSync(join(ROOT, 'index.html'), 'utf8');
assert(idx.includes('data-side-menu-action="taste-diary"'), 'index menu item');
assert(idx.includes('data-side-menu-view="taste-diary"'), 'index panel');
assert(idx.includes('id="tasteDiaryList"'), 'index list container');

const i18n = readFileSync(join(ROOT, 'js/translations-taste-diary.js'), 'utf8');
assert(i18n.includes('Dodaj do Pamiętnika'), 'PL add');
assert(i18n.includes('Zum Tagebuch hinzufügen'), 'DE add');
assert(i18n.includes('Add to Diary'), 'EN add');
assert(i18n.includes('Pamiętnik smaków'), 'PL title');
assert(i18n.includes('Geschmackstagebuch'), 'DE title');
assert(i18n.includes('Taste Diary'), 'EN title');
assert(i18n.includes('Dodano do Pamiętnika!'), 'PL toast saved');
assert(i18n.includes('Brak wpisów. Dodaj swój pierwszy smak!'), 'PL empty placeholder');

assert(existsSync(join(ROOT, 'js/core/tasteDiary.js')), 'core file');

// no new bottom nav tab
assert(!/data-view="taste-diary"/.test(idx), 'no bottom nav tab');

if (failed) {
    console.error(`\n${failed} failed`);
    process.exit(1);
}
console.log('\nTaste Diary P1 smoke OK');
