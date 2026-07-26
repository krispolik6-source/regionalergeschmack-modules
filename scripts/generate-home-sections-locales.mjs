/**
 * Generuje js/translations-home-sections-locales.js
 * Nature Calendar, Region Stories, Live Region – 36 języków (nadpisuje EN fallback).
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NATURE_CALENDAR_I18N } from '../js/translations-nature-calendar.js';
import { REGION_STORIES_I18N } from '../js/translations-region-stories.js';
import { LIVE_REGION_I18N } from '../js/translations-live-region.js';
import { LOCALE_PACKS } from './i18n-packs/home-sections-all.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'js/translations-home-sections-locales.js');

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
    const nature = NATURE_CALENDAR_I18N[code] || NATURE_CALENDAR_I18N.en;
    const stories = REGION_STORIES_I18N[code] || REGION_STORIES_I18N.en;
    const live = LIVE_REGION_I18N[code] || LIVE_REGION_I18N.en;
    return deepMerge(deepMerge(nature, stories), live);
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
 * Home sections – Nature Calendar, Region Stories, Live Region (36 języków).
 * Wygenerowano: scripts/generate-home-sections-locales.mjs
 */

/** @type {Record<string, object>} */
export const HOME_SECTIONS_LOCALES = Object.freeze(
`;

writeFileSync(OUT, `${header}${JSON.stringify(locales, null, 4)}\n);\n`, 'utf8');
console.log('Wrote', OUT, 'languages:', ALL_CODES.length);
