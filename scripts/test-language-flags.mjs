/**
 * Smoke: lokalne flagi SVG + HTML dropdown
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;
function assert(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error(`FAIL ${msg}`);
    } else console.log(`OK   ${msg}`);
}

const { LANG_OPTIONS } = await import(pathToFileURL(join(ROOT, 'js/translations.js')).href);
const { getLanguageFlagSrc, languageFlagImgHtml } = await import(
    pathToFileURL(join(ROOT, 'js/presentation/languageFlags.js')).href
);

const dir = join(ROOT, 'assets/flags');
assert(existsSync(dir), 'assets/flags exists');
const files = readdirSync(dir).filter((f) => f.endsWith('.svg'));
assert(files.length === 36, `36 svg files (got ${files.length})`);

for (const lang of LANG_OPTIONS) {
    const src = getLanguageFlagSrc(lang.code);
    assert(src.startsWith('/assets/flags/'), `${lang.code} local src`);
    const path = join(ROOT, src.replace(/^\//, ''));
    assert(existsSync(path), `${lang.code} file exists (${src})`);
    const head = readFileSync(path, 'utf8').slice(0, 80);
    assert(/<svg/i.test(head), `${lang.code} is SVG`);
}

const html = languageFlagImgHtml('pl');
assert(html.includes('src="/assets/flags/pl.svg"'), 'img src pl');
assert(html.includes('width="20"') && html.includes('height="15"'), 'img 20x15');
assert(html.includes('language-option-flag-img'), 'img class');

const settings = readFileSync(join(ROOT, 'js/core/settings.js'), 'utf8');
assert(settings.includes('languageFlagImgHtml'), 'settings uses SVG helper');
assert(!/language-option-flag" aria-hidden="true">\$\{flag\}/.test(settings), 'no emoji span in dropdown');

if (failed) {
    console.error(`\n${failed} failure(s)`);
    process.exit(1);
}
console.log('\nLanguage SVG flag checks passed.');
