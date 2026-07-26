/**
 * Smoke — legacy shim + AI engine (kompatybilność)
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

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

const eng = readFileSync(join(ROOT, 'js/i18n/aiTranslationEngine.js'), 'utf8');
assert(/libretranslate/i.test(eng), 'LibreTranslate');
assert(/mymemory/i.test(eng), 'MyMemory fallback');
assert(/rg_ai_i18n_v2/.test(eng), 'cache key');
assert(/APP_NAME|Regionaler Geschmack/.test(eng), 'brand lock');
assert(!/showToast|AI translating|Tłumaczę/.test(eng), 'no user-facing AI UI');
assert(/localStorage/.test(eng), 'localStorage cache');
assert(/protectBrand|BRAND_TOKEN|shouldNotTranslate/.test(eng), 'protect brand helpers');
assert(/unsupportedTargetFallback:\s*'en'/.test(eng), 'EN fallback');

const i18n = readFileSync(join(ROOT, 'js/core/i18n.js'), 'utf8');
assert(/translateSoft/.test(i18n), 'i18n uses soft translate');
assert(/tProducerDescription/.test(i18n) && /translateSoft/.test(i18n), 'producer desc wired');

const app = readFileSync(join(ROOT, 'js/app.js'), 'utf8');
assert(/initAiTranslationEngine/.test(app), 'app inits engine');

const events = readFileSync(join(ROOT, 'js/core/events.js'), 'utf8');
assert(/DYNAMIC_TRANSLATIONS_UPDATED/.test(events), 'event defined');

const modal = readFileSync(join(ROOT, 'js/views/producerModal.js'), 'utf8');
assert(/DYNAMIC_TRANSLATIONS_UPDATED/.test(modal), 'modal soft-refresh');

const shim = readFileSync(join(ROOT, 'js/core/dynamicTranslateEngine.js'), 'utf8');
assert(/aiTranslationEngine/.test(shim), 'shim points to AI engine');

if (failed) {
    console.error(`\n${failed} fail(s)`);
    process.exit(1);
}
console.log('\nDynamic translate smoke OK');
