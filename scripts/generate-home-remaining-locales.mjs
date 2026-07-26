/**
 * Generuje js/translations-home-remaining-locales.js
 * returnMagic · regionSoul · livingRegion · regionalIntel · climateAmbient · placeHistory
 * 36 języków (nadpisuje EN fallback).
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RETURN_MAGIC_I18N } from '../js/translations-return-magic.js';
import { REGION_SOUL_I18N } from '../js/translations-region-soul.js';
import { LIVING_REGION_I18N } from '../js/translations-living-region.js';
import { REGIONAL_INTEL_I18N } from '../js/translations-regional-intelligence.js';
import { CLIMATE_AMBIENT_I18N } from '../js/translations-climate-ambient.js';
import { PLACE_HISTORY_I18N } from '../js/translations-place-history.js';
import { LOCALE_PACKS } from './i18n-packs/home-remaining-all.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'js/translations-home-remaining-locales.js');

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
                deepMerge(
                    deepMerge(
                        deepMerge(
                            RETURN_MAGIC_I18N[code] || RETURN_MAGIC_I18N.en,
                            REGION_SOUL_I18N[code] || REGION_SOUL_I18N.en
                        ),
                        LIVING_REGION_I18N[code] || LIVING_REGION_I18N.en
                    ),
                    REGIONAL_INTEL_I18N[code] || REGIONAL_INTEL_I18N.en
                ),
                CLIMATE_AMBIENT_I18N[code] || CLIMATE_AMBIENT_I18N.en
            ),
            PLACE_HISTORY_I18N[code] || PLACE_HISTORY_I18N.en
        ),
        {}
    );
}

const locales = {};
for (const code of ALL_CODES) {
    let pack = basePack(code);
    if (LOCALE_PACKS[code]) {
        pack = deepMerge(pack, LOCALE_PACKS[code]);
    }
    locales[code] = pack;
}

const header = `/**
 * Home remaining sections – returnMagic, regionSoul, livingRegion, regionalIntel,
 * climateAmbient, placeHistory (36 języków).
 * Wygenerowano: scripts/generate-home-remaining-locales.mjs
 */

/** @type {Record<string, object>} */
export const HOME_REMAINING_LOCALES = Object.freeze(
`;

writeFileSync(OUT, `${header}${JSON.stringify(locales, null, 4)}\n);\n`, 'utf8');
console.log('Wrote', OUT, 'languages:', ALL_CODES.length);
