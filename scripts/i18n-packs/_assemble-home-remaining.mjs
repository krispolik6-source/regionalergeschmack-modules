/**
 * Assembles home-remaining-all.mjs from batch pack modules.
 * Run: node scripts/i18n-packs/_assemble-home-remaining.mjs
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BATCH1 } from './_packs-batch1.mjs';
import { BATCH2 } from './_packs-batch2.mjs';
import { BATCH3 } from './_packs-batch3.mjs';
import { BATCH4 } from './_packs-batch4.mjs';

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'home-remaining-all.mjs');

const LOCALE_PACKS = { ...BATCH1, ...BATCH2, ...BATCH3, ...BATCH4 };

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
console.log('Wrote', OUT, 'languages:', Object.keys(LOCALE_PACKS).length);
