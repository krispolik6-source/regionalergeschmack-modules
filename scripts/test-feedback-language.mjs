import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;
function assert(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error(`FAIL ${msg}`);
    } else console.log(`OK   ${msg}`);
}

const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
const js = readFileSync(join(ROOT, 'js/core/sideMenu.js'), 'utf8');

assert(/<select[^>]*id="feedbackLanguage"/.test(html), 'feedback language is <select>');
assert(!/id="feedbackLanguage"[^>]*readonly/.test(html), 'not readonly');
assert(html.includes('feedbackLanguageFlag'), 'SVG flag preview img');
assert(js.includes('LANG_OPTIONS.map'), 'options from LANG_OPTIONS');
assert(js.includes('setAppLanguage(code)'), 'changes app language via i18n');
assert(js.includes('getLanguageFlagSrc'), 'uses SVG flag helper');
assert(js.includes('FEEDBACK_LANG_KEY'), 'persists choice');
assert(js.includes('onFeedbackLanguageChange'), 'change handler');

if (failed) process.exit(1);
console.log('\nFeedback language checks passed.');
