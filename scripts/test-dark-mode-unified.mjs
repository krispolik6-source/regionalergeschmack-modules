/**
 * Smoke: jedna paleta Dark Mode (Brand Book)
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const files = [
    'css/dark-mode-contrast.css',
    'css/style.css',
    'css/prepublish.css'
];
let failed = 0;
function ok(c, m) { if (!c) { failed++; console.error('FAIL', m); } else console.log('OK', m); }

const banned = [
    /#121f33/i, /#16213e/i, /#1a1a2e/i, /#152536/i, /#1e3a58/i,
    /#2a3a50/i, /#1a2433/i, /rgba\(30,\s*36,\s*44/i, /rgba\(100,\s*125,\s*155/i,
    /#e8edf3/i, /#f4f7fb/i
];

for (const f of files) {
    const css = readFileSync(join(ROOT, f), 'utf8');
    const dm = css.match(/body\.dark-mode[\s\S]*?(?=\n\/\*|\nbody\.|\nhtml\.|$)/g) || [css];
    const darkChunk = dm.join('\n');
    for (const re of banned) {
        ok(!re.test(darkChunk), `${f} no ${re.source} in dark rules`);
    }
}

const dmc = readFileSync(join(ROOT, 'css/dark-mode-contrast.css'), 'utf8');
ok(dmc.includes('--dm-bg: #141810'), 'token bg');
ok(dmc.includes('--dm-surface: #1e2a20'), 'token surface');
ok(dmc.includes('--dm-green: #2a3f28'), 'token green');
ok(dmc.includes('--dm-text: #f5f5f2'), 'token text');
ok(dmc.includes('--dm-text-muted: #d4e4b0'), 'token muted');
ok(dmc.includes('--dm-gold: #c9a227'), 'token gold');

console.log(failed ? `\nRESULT FAIL ${failed}` : '\nRESULT PASS');
process.exit(failed ? 1 : 0);
