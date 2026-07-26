import { writeFileSync } from 'node:fs';
import { RETURN_MAGIC_I18N } from '../../js/translations-return-magic.js';
import { REGION_SOUL_I18N } from '../../js/translations-region-soul.js';
import { LIVING_REGION_I18N } from '../../js/translations-living-region.js';
import { REGIONAL_INTEL_I18N } from '../../js/translations-regional-intelligence.js';
import { CLIMATE_AMBIENT_I18N } from '../../js/translations-climate-ambient.js';
import { PLACE_HISTORY_I18N } from '../../js/translations-place-history.js';
import { LANGS, ROWS_HOME_RETURN } from './_rows-home-return.mjs';
import { ROWS_REGION_SOUL } from './_rows-region-soul.mjs';
import { ROWS_LIVING } from './_rows-living.mjs';
import { ROWS_REST } from './_rows-rest.mjs';

function dm(a, b) {
    const o = { ...(a || {}) };
    for (const [k, v] of Object.entries(b || {})) {
        o[k] = v && typeof v === 'object' && !Array.isArray(v) ? dm(o[k], v) : v;
    }
    return o;
}
function flat(o, p = '', out = {}) {
    for (const [k, v] of Object.entries(o || {})) {
        const np = p ? `${p}.${k}` : k;
        if (v && typeof v === 'object' && !Array.isArray(v)) flat(v, np, out);
        else out[np] = v;
    }
    return out;
}
function setN(o, p, v) {
    const ps = p.split('.');
    let c = o;
    for (let i = 0; i < ps.length - 1; i++) {
        c[ps[i]] = c[ps[i]] || {};
        c = c[ps[i]];
    }
    c[ps[ps.length - 1]] = v;
}
function unflat(f) {
    const o = {};
    for (const [p, v] of Object.entries(f)) setN(o, p, v);
    return o;
}

const enFlat = flat(dm(dm(dm(dm(dm(dm(
    RETURN_MAGIC_I18N.en, REGION_SOUL_I18N.en), LIVING_REGION_I18N.en),
    REGIONAL_INTEL_I18N.en), CLIMATE_AMBIENT_I18N.en), PLACE_HISTORY_I18N.en), {}));

const rowFlat = {};
for (const row of [...ROWS_HOME_RETURN, ...ROWS_REGION_SOUL, ...ROWS_LIVING, ...ROWS_REST]) {
    const [path, ...vals] = row;
    if (vals.length !== LANGS.length) throw new Error(`${path}: ${vals.length}`);
    LANGS.forEach((l, i) => { rowFlat[`${l}:${path}`] = vals[i]; });
}

const packs = {};
for (const lang of LANGS) {
    const missing = [];
    packs[lang] = unflat(Object.fromEntries(Object.entries(enFlat).map(([p, en]) => {
        const v = rowFlat[`${lang}:${p}`];
        if (!v) missing.push(p);
        return [p, v ?? en];
    })));
    if (missing.length) console.warn(lang, 'missing', missing.length, 'keys (EN fallback)');
}

const OUT = new URL('./home-remaining-all.mjs', import.meta.url);
const header = `/**\n * Home remaining locale packs – native overrides for EN fallback.\n * returnMagic · regionSoul · livingRegion · regionalIntel · climateAmbient · placeHistory\n */\n\n`;
writeFileSync(OUT, header + 'export const LOCALE_PACKS = ' + JSON.stringify(packs, null, 4) + ';\n');
const text = writeFileSync.length ? '' : '';
const lines = (header + 'export const LOCALE_PACKS = ' + JSON.stringify(packs, null, 4) + ';\n').split('\n').length;
console.log('Wrote', OUT.pathname, 'languages:', LANGS.length, 'keys:', Object.keys(enFlat).length, 'lines:', lines);
console.log('Sample RU:', packs.ru.home.returnMagicTitle);
