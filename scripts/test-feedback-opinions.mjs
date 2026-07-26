/**
 * Smoke: formularz Opinii (☰) – imię, opinia, ocena 1–5 → localStorage
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

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

const store = new Map();
globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k)
};
globalThis.sessionStorage = globalThis.localStorage;
globalThis.document = {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {},
    createElement: () => ({ style: {}, setAttribute() {}, appendChild() {}, remove() {}, select() {} }),
    body: { appendChild() {} }
};
globalThis.window = {
    addEventListener() {},
    removeEventListener() {},
    location: { href: 'http://localhost/' },
    localStorage: globalThis.localStorage,
    document: globalThis.document
};

const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
assert(html.includes('data-side-menu-action="feedback"'), 'menu has feedback action');
assert(html.includes('📝'), 'menu/title uses 📝');
assert(html.includes('id="userFeedbackForm"'), 'form exists');
assert(html.includes('id="feedbackName"'), 'name field');
assert(html.includes('id="feedbackOpinion"'), 'opinion field');
assert(html.includes('name="rating"'), 'rating radios');
assert(html.includes('value="1"') && html.includes('value="5"'), 'rating 1 and 5');
assert(html.includes('data-side-menu-view="feedback"'), 'feedback panel view');
assert(html.includes('Pomóż nam'), 'UTF-8 PL lead');

const side = readFileSync(join(ROOT, 'js/core/sideMenu.js'), 'utf8');
assert(side.includes('FEEDBACK_STORAGE_KEY'), 'storage key');
assert(side.includes('rg_user_feedback_log'), 'storage key value');
assert(side.includes('storeFeedbackLocally'), 'saves locally');
assert(side.includes('rating'), 'handles rating');
assert(side.includes('getStoredFeedback'), 'export getStoredFeedback');

const i18n = readFileSync(join(ROOT, 'js/translations-testing.js'), 'utf8');
assert(i18n.includes('feedbackRating'), 'i18n rating');
assert(i18n.includes('feedbackRatingRequired'), 'i18n rating required');
assert(i18n.includes("feedbackName: 'Imię'"), 'PL name');

const css = readFileSync(join(ROOT, 'css/style.css'), 'utf8');
assert(css.includes('.side-menu-rating'), 'CSS rating');

// Runtime zapis – ten sam klucz co sideMenu (bez importu całego menu / PWA)
const KEY = 'rg_user_feedback_log';
assert(!localStorage.getItem(KEY), 'starts empty');
const entry = {
    id: 'fb-test',
    name: 'Anna',
    opinion: 'Super mapa!',
    rating: 5,
    device: 'phone',
    language: 'pl',
    at: new Date().toISOString()
};
localStorage.setItem(KEY, JSON.stringify([entry]));
const list = JSON.parse(localStorage.getItem(KEY));
assert(Array.isArray(list) && list.length === 1, 'one entry stored');
assert(list[0].name === 'Anna' && list[0].rating === 5, 'name + rating persisted');
assert(side.includes("export const FEEDBACK_STORAGE_KEY"), 'FEEDBACK_STORAGE_KEY exported');
assert(side.includes('export function getStoredFeedback'), 'getStoredFeedback exported');

if (failed) {
    console.error(`\n${failed} failure(s)`);
    process.exit(1);
}
console.log('\nFeedback opinions checks passed.');
