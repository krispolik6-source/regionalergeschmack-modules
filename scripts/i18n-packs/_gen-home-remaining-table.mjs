/**
 * Generates home-remaining-all.mjs from flat translation table.
 * Run: node scripts/i18n-packs/_gen-home-remaining-table.mjs
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TRANSLATIONS } from './_home-remaining-translations.mjs';

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'home-remaining-all.mjs');
const LANGS = ['ru','tr','fr','es','it','nl','cs','sk','hu','ro','bg','el','hr','sr','sl','lt','lv','et','fi','sv','no','da','is','zh','zh-tw','ja','ko','vi','ms','id','th','hi'];

function setNested(obj, path, value) {
    const parts = path.split('.');
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        cur[parts[i]] = cur[parts[i]] || {};
        cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
}

const LOCALE_PACKS = {};
for (const lang of LANGS) {
    LOCALE_PACKS[lang] = {};
    for (const [path, byLang] of Object.entries(TRANSLATIONS)) {
        if (byLang[lang]) setNested(LOCALE_PACKS[lang], path, byLang[lang]);
    }
}

function serialize(obj, indent = 4) {
    const pad = (n) => ' '.repeat(n);
    const lines = ['export const LOCALE_PACKS = {'];
    for (const [code, pack] of Object.entries(obj)) {
        lines.push(`${pad(indent)}"${code}": ${JSON.stringify(pack, null, indent + 4).replace(/\n/g, '\n' + pad(indent))},`);
    }
    lines.push('};');
    lines.push('');
    return `/**\n * Home remaining locale packs – native overrides for EN fallback.\n * returnMagic · regionSoul · livingRegion · regionalIntel · climateAmbient · placeHistory\n */\n\n${lines.join('\n')}`;
}

writeFileSync(OUT, serialize(LOCALE_PACKS), 'utf8');
console.log('Wrote', OUT, 'languages:', LANGS.length, 'keys:', Object.keys(TRANSLATIONS).length);
