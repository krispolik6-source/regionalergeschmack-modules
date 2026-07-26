/**
 * Smoke — AI Translation Engine
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    shouldNotTranslate,
    AI_TRANSLATE_CONFIG,
    translateSoft,
    invalidateCache,
    resolveTargetLanguage
} from '../js/i18n/aiTranslationEngine.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function assert(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error(`❌ ${msg}`);
    } else {
        console.log(`✅ ${msg}`);
    }
}

assert(shouldNotTranslate('Regionaler Geschmack'), 'skip brand');
assert(shouldNotTranslate('info@example.com'), 'skip email');
assert(shouldNotTranslate('https://example.com/x'), 'skip url');
assert(shouldNotTranslate('+49 123 4567890'), 'skip phone');
assert(shouldNotTranslate('52.1200, 8.3400'), 'skip gps');
assert(shouldNotTranslate('ABC-12345'), 'skip sku-like');
assert(shouldNotTranslate('12 Hauptstraße'), 'skip addressish');
assert(!shouldNotTranslate('Frisches Sauerteigbrot aus der Region'), 'translate product prose');

assert(AI_TRANSLATE_CONFIG.providers.includes('libretranslate'), 'libre provider');
assert(AI_TRANSLATE_CONFIG.providers.includes('mymemory'), 'mymemory provider');
assert(AI_TRANSLATE_CONFIG.unsupportedTargetFallback === 'en', 'EN fallback');

const eng = readFileSync(join(ROOT, 'js/i18n/aiTranslationEngine.js'), 'utf8');
assert(/export function translate\b/.test(eng), 'translate()');
assert(/export function translateBatch\b/.test(eng), 'translateBatch()');
assert(/export async function translateProduct\b/.test(eng), 'translateProduct()');
assert(/export async function translatePage\b/.test(eng), 'translatePage()');
assert(/export function invalidateCache\b/.test(eng), 'invalidateCache()');
assert(/registerProvider/.test(eng), 'registerProvider');
assert(/google:|deepl:|openai:/.test(eng), 'future providers stubbed');
assert(!/showToast|Translating\.\.\.|Tłumaczę/i.test(eng), 'no user-facing AI copy');
assert(/data-rg-ai-src/.test(eng), 'DOM soft patch');

const app = readFileSync(join(ROOT, 'js/app.js'), 'utf8');
assert(/initAiTranslationEngine/.test(app), 'app wires engine');

const shim = readFileSync(join(ROOT, 'js/core/dynamicTranslateEngine.js'), 'utf8');
assert(/aiTranslationEngine/.test(shim), 'legacy shim');

invalidateCache();
const sample = 'Bauernbrot mit Sauerteig';
const soft = translateSoft(sample, { to: 'en', from: 'de' });
assert(soft === sample, 'soft returns original when uncached (no block)');
assert(typeof resolveTargetLanguage('pl') === 'string', 'resolveTargetLanguage');

if (failed) {
    console.error(`\n${failed} fail(s)`);
    process.exit(1);
}
console.log('\nAI Translation Engine smoke OK');
