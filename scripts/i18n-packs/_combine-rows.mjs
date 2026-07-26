/**
 * Combines row modules → home-remaining-all.mjs
 * Run: node scripts/i18n-packs/_combine-rows.mjs
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LANGS, ROWS_HOME_RETURN } from './_rows-home-return.mjs';
import { ROWS_REGION_SOUL } from './_rows-region-soul.mjs';
import { ROWS_LIVING } from './_rows-living.mjs';
import { ROWS_LIVING_REST } from './_rows-living-rest.mjs';
import { ROWS_INTEL } from './_rows-regional-intel.mjs';
import { ROWS_PROFILE_PLACE as ROWS_PROFILE_PLACE_A } from './_rows-profile-place-a.mjs';
import { ROWS_PROFILE_PLACE_B } from './_rows-profile-place-b.mjs';
import { ROWS_PROFILE_PLACE_C } from './_rows-profile-place-c.mjs';

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'home-remaining-all.mjs');
const ALL_ROWS = [
    ...ROWS_HOME_RETURN,
    ...ROWS_REGION_SOUL,
    ...ROWS_LIVING,
    ...ROWS_LIVING_REST,
    ...ROWS_INTEL,
    ...ROWS_PROFILE_PLACE_A,
    ...ROWS_PROFILE_PLACE_B,
    ...ROWS_PROFILE_PLACE_C
];

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
for (const lang of LANGS) LOCALE_PACKS[lang] = {};

for (const row of ALL_ROWS) {
    const [path, ...vals] = row;
    if (vals.length !== LANGS.length) {
        throw new Error(`Row ${path}: expected ${LANGS.length} langs, got ${vals.length}`);
    }
    LANGS.forEach((lang, i) => setNested(LOCALE_PACKS[lang], path, vals[i]));
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
console.log('Wrote', OUT, 'languages:', LANGS.length, 'rows:', ALL_ROWS.length);
