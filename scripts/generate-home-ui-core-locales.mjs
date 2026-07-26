/**
 * Generuje js/translations-home-ui-core-locales.js
 * Home UI core: greeting, seasonal, featured, smartToday, tasteAdvisor, tastesOfDay, livingMap (36 języków).
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SMART_TODAY_I18N } from '../js/translations-smart-today.js';
import { TASTE_ADVISOR_I18N } from '../js/translations-taste-advisor.js';
import { TASTES_OF_DAY_I18N } from '../js/translations-tastes-of-day.js';
import { LIVING_MAP_I18N } from '../js/translations-living-map.js';
import { LOCALE_PACKS } from './i18n-packs/home-ui-core-all.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'js/translations-home-ui-core-locales.js');

const ALL_CODES = [
    'de', 'en', 'pl', 'ru', 'tr', 'fr', 'es', 'it', 'nl', 'cs', 'sk', 'hu', 'ro', 'bg', 'el',
    'hr', 'sr', 'mk', 'sl', 'lt', 'lv', 'et', 'fi', 'sv', 'no', 'da', 'is',
    'zh', 'zh-tw', 'ja', 'ko', 'vi', 'ms', 'id', 'th', 'hi'
];

function deepMerge(base, patch) {
    const out = { ...(base || {}) };
    for (const [k, v] of Object.entries(patch || {})) {
        if (v && typeof v === 'object' && !Array.isArray(v)) {
            out[k] = deepMerge(out[k], v);
        } else {
            out[k] = v;
        }
    }
    return out;
}

function basePack(code) {
    return deepMerge(
        deepMerge(
            deepMerge(
                deepMerge(SMART_TODAY_I18N[code] || SMART_TODAY_I18N.en, TASTE_ADVISOR_I18N[code] || TASTE_ADVISOR_I18N.en),
                TASTES_OF_DAY_I18N[code] || TASTES_OF_DAY_I18N.en
            ),
            LIVING_MAP_I18N[code] || LIVING_MAP_I18N.en
        ),
        {}
    );
}

const locales = {};
for (const code of ALL_CODES) {
    const native = ['de', 'en', 'pl', 'mk'].includes(code);
    let pack = native ? basePack(code) : {};
    if (LOCALE_PACKS[code]) {
        pack = deepMerge(pack, LOCALE_PACKS[code]);
    } else if (!native) {
        pack = deepMerge(basePack('en'), pack);
    }
    locales[code] = pack;
}

const header = `/**
 * Home UI core – greeting, seasonal, featured, recommendations modules (36 języków).
 * Wygenerowano: scripts/generate-home-ui-core-locales.mjs
 */

/** @type {Record<string, object>} */
export const HOME_UI_CORE_LOCALES = Object.freeze(
`;

writeFileSync(OUT, `${header}${JSON.stringify(locales, null, 4)}\n);\n`, 'utf8');
console.log('Wrote', OUT, 'languages:', ALL_CODES.length);
