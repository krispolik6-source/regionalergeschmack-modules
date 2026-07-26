/**
 * Audyt spójności ikon kategorii (ETAP 5.1).
 * node scripts/audit-category-icons.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const icons = fs.readFileSync(path.join(root, 'js/presentation/categoryIcons.js'), 'utf8');
const mapCore = fs.readFileSync(path.join(root, 'js/map/map.js'), 'utf8');
const settings = fs.readFileSync(path.join(root, 'js/map/mapSettings.js'), 'utf8');
const chains = fs.readFileSync(path.join(root, 'js/presentation/chainBrands.js'), 'utf8');
const home = fs.readFileSync(path.join(root, 'js/views/home.js'), 'utf8');

let failed = 0;
const ok = (m) => console.log(`✅ ${m}`);
const bad = (m) => { failed += 1; console.error(`❌ ${m}`); };

const expect = {
    farmer: '🌾',
    bakery: '🥖',
    restaurant: '🍽',
    meat: '🥩',
    shop: '🛒',
    vending: '🥛'
};

for (const [cat, emoji] of Object.entries(expect)) {
    if (icons.includes(`${cat}: '${emoji}'`) || icons.includes(`${cat}: "${emoji}"`)) {
        ok(`Kanon ${cat} → ${emoji}`);
    } else bad(`Brak kanonu ${cat} → ${emoji}`);
}

if (/shop:\s*'🏪'/.test(icons) || /vending:\s*'🤖'/.test(icons) || /honey:\s*'🍯'/.test(icons)) {
    bad('Stare warianty ikon nadal w CATEGORY_ICONS');
} else ok('Brak starych wariantów 🏪/🤖/🍯 w kanonie kategorii');

if (settings.includes("farmer: '#1b7f58'")
    && settings.includes("restaurant: '#e67e22'")
    && settings.includes("shop: '#2563eb'")
    && settings.includes("vending: '#7c3aed'")
    && settings.includes("bakery: '#c9a227'")
    && settings.includes("meat: '#c0392b'")) {
    ok('Kolory DEFAULT_MARKER_COLORS zgodne z ETAP 5.1');
} else bad('Kolory DEFAULT_MARKER_COLORS niekompletne');

if (mapCore.includes('resolveChainLogoUrl') && mapCore.includes('iconCreateFunction')) {
    ok('Markery: logo sieci + iconCreateFunction klastrów');
} else bad('Brak logo sieci lub klastrów w map.js');

if (/productIcon:\s*isShop\s*\?\s*'🏪'/.test(mapCore)) {
    bad('map.js nadal nadpisuje sklep ikoną 🏪');
} else ok('map.js bez nadpisywania sklepu 🏪');

if (chains.includes('resolveChainLogoUrl') && !chains.includes('PRODUCER_NAME_LOGOS')) {
    ok('chainBrands bez abstrakcyjnych SVG kategorii z nazw');
} else bad('chainBrands nadal mapuje nazwy na SVG kategorii');

if (home.includes("CATEGORY_ICONS.shops") || !home.includes("icon: '🏪'")) {
    ok('Home quick filter sklepów bez 🏪');
} else bad('Home nadal używa 🏪 dla sklepów');

if (failed) {
    console.error(`\nAudyt ikon: ${failed} błędów`);
    process.exit(1);
}
console.log('\nAudyt ikon kategorii: OK');
