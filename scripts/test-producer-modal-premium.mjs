/**
 * Producer Modal — Premium Polish (CSS smoke)
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

const style = readFileSync(join(ROOT, 'css/style.css'), 'utf8');
const pm = readFileSync(join(ROOT, 'css/producer-modal-premium.css'), 'utf8');

ok(style.includes('producer-modal-premium.css?v='), 'style.css imports producer-modal-premium');
ok(pm.includes('--pm-card-radius: 18px'), 'card radius 18px');
ok(pm.includes('--pm-btn-radius: 14px'), 'button radius 14px');
ok(pm.includes('--pm-focus'), 'gold focus token');
ok(pm.includes('backdrop-filter: none'), 'no glass on modal shell');
ok(pm.includes('display: none !important'), 'landscapes wash disabled');
ok(pm.includes('#2a3f28'), 'brand green text');
ok(pm.includes('#c9a227'), 'brand gold accents');
ok(!pm.includes('#c8d0da'), 'no navy story text');
ok(!pm.includes('#d5dbe3'), 'no navy product placeholder');
ok(pm.includes('body.dark-mode .producer-modal'), 'dark mode rules');
ok(pm.includes('prefers-reduced-motion'), 'reduced motion');

console.log(failed ? `\nRESULT FAIL ${failed}` : '\nRESULT PASS');
process.exit(failed ? 1 : 0);
