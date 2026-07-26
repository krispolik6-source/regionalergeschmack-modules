/**
 * i18n rekomendacji – cache per język + klucze tłumaczeń
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

const tasteAdvisor = readFileSync(join(ROOT, 'js/presentation/tasteAdvisor.js'), 'utf8');
const returnMagic = readFileSync(join(ROOT, 'js/presentation/returnMagic.js'), 'utf8');
const appJs = readFileSync(join(ROOT, 'js/app.js'), 'utf8');

assert(tasteAdvisor.includes('dayBriefStorageKey'), 'tasteAdvisor: cache per język');
assert(tasteAdvisor.includes('lang: getCurrentLanguage()'), 'tasteAdvisor: zapis lang w cache');
assert(tasteAdvisor.includes('invalidateTasteAdvisorDayCache'), 'tasteAdvisor: invalidate export');
assert(returnMagic.includes('dayBriefStorageKey'), 'returnMagic: cache per język');
assert(appJs.includes('invalidateTasteAdvisorDayCache()'), 'app: invalidate przy LANGUAGE_CHANGED');

const { TRANSLATIONS, SUPPORTED_LANGUAGE_CODES } = await import(`file://${join(ROOT, 'js/translations.js').replace(/\\/g, '/')}?t=${Date.now()}`);

const keys = [
    'home.tasteAdvisorTitle',
    'home.smartTodayTitle',
    'home.tastesOfDayTitle',
    'tasteAdvisor.hello',
    'tasteAdvisor.ctaHoney',
    'tasteAdvisor.ctaRoute',
    'tastesOfDay.soupRain',
    'smartToday.reason.rain',
    'livingMap.recommended'
];

function resolve(obj, path) {
    return path.split('.').reduce((a, p) => a?.[p], obj);
}

for (const code of ['de', 'en', 'pl', 'fr']) {
    for (const key of keys) {
        const val = resolve(TRANSLATIONS[code], key);
        assert(val && val !== key, `${code}: ${key} → "${String(val).slice(0, 40)}..."`);
    }
}

assert(
    TRANSLATIONS.pl.tasteAdvisor.ctaRoute === 'Otwórz trasę',
    'PL: Route öffnen → Otwórz trasę'
);
assert(
    TRANSLATIONS.pl.tasteAdvisor.ctaHoney === 'Otwórz pasiekę',
    'PL: Zur Imkerei → Otwórz pasiekę'
);
assert(
    TRANSLATIONS.fr.tasteAdvisor.ctaRoute.includes('itin'),
    'FR: ctaRoute po francusku'
);
assert(SUPPORTED_LANGUAGE_CODES.length === 36, '36 języków');

if (failed) {
    console.error(`\n${failed} test(ów) nie przeszło`);
    process.exit(1);
}
console.log('\n✅ test-recommendations-i18n OK');
