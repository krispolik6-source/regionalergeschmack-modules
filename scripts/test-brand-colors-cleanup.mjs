/**
 * Brand Book color cleanup — smoke test
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function ok(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error('FAIL', msg);
    } else {
        console.log('OK', msg);
    }
}

const css = readFileSync(join(ROOT, 'css/brand-colors-cleanup.css'), 'utf8');
const index = readFileSync(join(ROOT, 'index.html'), 'utf8');
const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');

ok(index.includes('brand-colors-cleanup.css'), 'index.html loads brand-colors-cleanup');
ok(sw.includes('brand-colors-cleanup.css'), 'sw precaches brand-colors-cleanup');
ok(css.includes('--color-primary: #2a3f28'), 'primary green canonical');
ok(css.includes('--color-accent: #c9a227'), 'accent gold canonical');
ok(css.includes('#f3f7f2'), 'map canvas warm');
ok(css.includes('#243528'), 'marker other green');

const banned = ['#e8eef2', '#4a5568', '#6b7280', '#c8d0da', '#1c2430', '#94a3b8', '#5a6470'];
for (const hex of banned) {
    ok(!css.toLowerCase().includes(hex.toLowerCase()), `cleanup file has no ${hex}`);
}

console.log(failed ? `\nRESULT FAIL ${failed}` : '\nRESULT PASS');
process.exit(failed ? 1 : 0);
