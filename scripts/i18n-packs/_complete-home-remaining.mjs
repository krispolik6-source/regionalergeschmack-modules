/**
 * Completes missing rows from EN + native packs, writes home-remaining-all.mjs
 * Run: node scripts/i18n-packs/_complete-home-remaining.mjs
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RETURN_MAGIC_I18N } from '../../js/translations-return-magic.js';
import { REGION_SOUL_I18N } from '../../js/translations-region-soul.js';
import { LIVING_REGION_I18N } from '../../js/translations-living-region.js';
import { REGIONAL_INTEL_I18N } from '../../js/translations-regional-intelligence.js';
import { CLIMATE_AMBIENT_I18N } from '../../js/translations-climate-ambient.js';
import { PLACE_HISTORY_I18N } from '../../js/translations-place-history.js';
import { LANGS, ROWS_HOME_RETURN } from './_rows-home-return.mjs';
import { ROWS_REGION_SOUL } from './_rows-region-soul.mjs';
import { ROWS_LIVING as ROWS_LIVING_PARTIAL } from './_rows-living.mjs';

const DIR = dirname(fileURLToPath(import.meta.url));
const OUT = join(DIR, 'home-remaining-all.mjs');

const PACK_FILES = [
    './_packs-tr.mjs','./_packs-fr.mjs','./_packs-es.mjs','./_packs-it.mjs',
    './_packs-nl.mjs','./_packs-cs.mjs','./_packs-sk.mjs','./_packs-hu.mjs',
    './_packs-ro.mjs','./_packs-bg.mjs','./_packs-el.mjs','./_packs-hr.mjs',
    './_packs-sr.mjs','./_packs-sl.mjs','./_packs-lt.mjs','./_packs-lv.mjs',
    './_packs-et.mjs','./_packs-fi.mjs','./_packs-sv.mjs','./_packs-no.mjs',
    './_packs-da.mjs','./_packs-is.mjs','./_packs-zh.mjs','./_packs-zht.mjs',
    './_packs-ja.mjs','./_packs-ko.mjs','./_packs-vi.mjs','./_packs-ms.mjs',
    './_packs-id.mjs','./_packs-th.mjs','./_packs-hi.mjs','./_packs-ru.mjs'
];

function deepMerge(a, b) {
    const out = { ...(a || {}) };
    for (const [k, v] of Object.entries(b || {})) {
        out[k] = v && typeof v === 'object' && !Array.isArray(v) ? deepMerge(out[k], v) : v;
    }
    return out;
}

function flatten(obj, prefix = '', out = {}) {
    for (const [k, v] of Object.entries(obj || {})) {
        const p = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, p, out);
        else out[p] = v;
    }
    return out;
}

function setNested(obj, path, value) {
    const parts = path.split('.');
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        cur[parts[i]] = cur[parts[i]] || {};
        cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
}

function unflatten(flat) {
    const out = {};
    for (const [p, v] of Object.entries(flat)) setNested(out, p, v);
    return out;
}

function baseEn() {
    return deepMerge(
        deepMerge(
            deepMerge(
                deepMerge(
                    deepMerge(
                        deepMerge(RETURN_MAGIC_I18N.en, REGION_SOUL_I18N.en),
                        LIVING_REGION_I18N.en
                    ),
                    REGIONAL_INTEL_I18N.en
                ),
                CLIMATE_AMBIENT_I18N.en
            ),
            PLACE_HISTORY_I18N.en
        ),
        {}
    );
}

function rowsToFlat(rows) {
    const flat = {};
    for (const row of rows) {
        const [path, ...vals] = row;
        LANGS.forEach((lang, i) => { flat[`${lang}:${path}`] = vals[i]; });
    }
    return flat;
}

async function loadLangPacks() {
    const packs = {};
    for (const f of PACK_FILES) {
        try {
            const mod = await import(f);
            Object.assign(packs, mod.default || mod.PACK || mod.LANG_PACK);
        } catch { /* optional per-lang pack files */ }
    }
    return packs;
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

const enFlat = flatten(baseEn());
const rowFlat = rowsToFlat([...ROWS_HOME_RETURN, ...ROWS_REGION_SOUL, ...ROWS_LIVING_PARTIAL]);

const LOCALE_PACKS = {};
for (const lang of LANGS) {
    LOCALE_PACKS[lang] = unflatten(Object.fromEntries(
        Object.entries(enFlat).map(([path, enVal]) => {
            const override = rowFlat[`${lang}:${path}`];
            return [path, override ?? enVal];
        })
    ));
}

writeFileSync(OUT, serialize(LOCALE_PACKS), 'utf8');
const lines = readFileSync(OUT, 'utf8').split('\n').length;
console.log('Wrote', OUT, 'languages:', LANGS.length, 'lines:', lines);
console.log('NOTE: Keys without row overrides still use EN fallback — add pack files or rows.');
