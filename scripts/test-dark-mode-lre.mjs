/**
 * Smoke K5/K6 — dark mode: Home LRE + karty producenta
 */
import { readFileSync, existsSync } from 'node:fs';
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

const dark = readFileSync(join(ROOT, 'css/dark-mode-contrast.css'), 'utf8');
const style = readFileSync(join(ROOT, 'css/style.css'), 'utf8');
const lre = readFileSync(join(ROOT, 'css/living-region-experience.css'), 'utf8');

assert(existsSync(join(ROOT, 'css/dark-mode-contrast.css')), 'dark-mode-contrast.css');
assert(style.includes('dark-mode-contrast.css?v=2'), 'style import v=2 cache bust');

assert(/body\.dark-mode \.home-page--v2[\s\S]*#2d2d2d/.test(dark), 'K5 home-page--v2 dark bg');
assert(/body\.dark-mode \.home-living-region[\s\S]*#2d2d2d/.test(dark), 'K5 LRE panel dark bg');
assert(/body\.dark-mode \.home-living-region[\s\S]*#f0f0f0/.test(dark), 'K5 LRE text #f0f0f0');
assert(/body\.dark-mode \.home-region-soul[\s\S]*#2d2d2d/.test(dark), 'K5 region soul dark');

assert(/body\.dark-mode \.producer-header-card[\s\S]*#1e1e1e/.test(dark), 'K6 producer card dark bg');
assert(/body\.dark-mode \.producer-header-card[\s\S]*#444/.test(dark), 'K6 producer card border');
assert(/body\.dark-mode \.producer-header-card[\s\S]*#e8e8e8/.test(dark), 'K6 producer card text');
assert(dark.includes("data-character='honey'] .producer-header-card"), 'K6 honey character override');
assert(dark.includes('map-popup .producer-header-card'), 'K6 map popup card');

assert(lre.includes('.home-page--v2'), 'LRE defines home-page--v2 (overridden in dark)');
assert(lre.includes('.producer-header-card'), 'LRE defines producer-header-card');

console.log(failed ? `\n${failed} failed` : '\nDark mode LRE contrast checks passed.');
process.exit(failed ? 1 : 0);
