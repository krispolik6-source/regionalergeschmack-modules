/**
 * Smoke: ikony menu (UTF-8) + zdjęcia modalu 180px
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
const style = readFileSync(join(ROOT, 'css/style.css'), 'utf8');
let failed = 0;

function assert(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error(`FAIL ${msg}`);
    } else {
        console.log(`OK   ${msg}`);
    }
}

assert(/<meta\s+charset=["']UTF-8["']/i.test(html), 'meta charset UTF-8');
assert(html.includes('\u2630'), 'header menu hamburger');
assert(html.includes('\u{1F1E9}\u{1F1EA}'), 'DE flag');
assert(html.includes('\u{1F319}'), 'dark mode moon');
assert(html.includes('\u{1F3E0}'), 'bottom home');
assert(html.includes('\u{1F5FA}'), 'bottom map');
assert(html.includes('\u{1F50D}'), 'bottom search');
assert(html.includes('\u2764'), 'bottom favorites');
assert(html.includes('\u{1F464}'), 'bottom profile');
assert((html.match(/\?\?/g) || []).length === 0, 'no ?? in index.html');
assert(style.includes('--photo-modal-height: 160px'), 'modal photo 160px');
assert(/\.producer-modal-body\s*\{[\s\S]*?overflow-y:\s*auto/.test(style), 'modal body scrolls');

if (failed) {
    console.error(`\n${failed} failure(s)`);
    process.exit(1);
}
console.log('\nMenu + modal checks passed.');
