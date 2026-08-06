/**
 * Smoke: Self-Healing
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { assertLazyDiagnosticsInit } from './lib/diagnosticsOrchestratorAssert.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function assert(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error(`FAIL ${msg}`);
    } else {
        console.log(`OK   ${msg}`);
    }
}

assert(existsSync(join(ROOT, 'js/diagnostics/selfHealing.js')), 'selfHealing.js exists');

const store = new Map();
globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k)
};

const {
    healCategoryPhotos,
    healBrokenIcons,
    healModalPhotoLayout,
    runSelfHeal,
    getSelfHealLog
} = await import(pathToFileURL(join(ROOT, 'js/diagnostics/selfHealing.js')).href);

assert(typeof healCategoryPhotos === 'function', 'healCategoryPhotos');
assert(typeof healBrokenIcons === 'function', 'healBrokenIcons');
assert(typeof healModalPhotoLayout === 'function', 'healModalPhotoLayout');
assert(typeof runSelfHeal === 'function', 'runSelfHeal');

// Minimal DOM stub for photo heal
const img = {
    getAttribute: (n) => (n === 'src' ? '/assets/images/backgrounds/category_honey.webp?v=9' : null),
    setAttribute(n, v) {
        this._src = v;
    },
    currentSrc: '',
    closest(sel) {
        if (sel === 'picture') return null;
        if (sel === '.producer-photo-frame') {
            return { classList: { contains: (c) => c === 'is-sample' } };
        }
        if (sel === '[data-category]') return null;
        return null;
    }
};

const modal = {
    dataset: { category: 'shop', character: 'shop' },
    querySelectorAll(sel) {
        if (String(sel).includes('img')) return [img];
        return [];
    },
    querySelector() {
        return null;
    }
};

const root = {
    querySelector: (sel) => (String(sel).includes('producer-modal') ? modal : null),
    getElementById: () => modal,
    querySelectorAll: () => []
};

const n = healCategoryPhotos(root);
assert(n >= 1, 'heals shop honey → shops');
assert(String(img._src || '').includes('category_shops'), 'src switched to shops');

assertLazyDiagnosticsInit(assert, ROOT, 'selfHealing.initSelfHealing', 'orchestrator lazy selfHealing');

const smtp = readFileSync(join(ROOT, 'scripts/lib/developer-smtp.mjs'), 'utf8');
assert(smtp.includes('selfHealMailSubject'), 'mail subject helper');
assert(smtp.includes('Auto-naprawa'), 'Auto-naprawa subject');

const cli = readFileSync(join(ROOT, 'scripts/self-healing-daily.mjs'), 'utf8');
assert(cli.includes('selfHealMailSubject'), 'CLI uses subject');
assert(cli.includes('krispolik6@gmail.com') || cli.includes('OWNER_DEVELOPER_EMAIL'), 'owner email');

assert(Array.isArray(getSelfHealLog()), 'log array');

if (failed) {
    console.error(`\n${failed} failure(s)`);
    process.exit(1);
}
console.log('\nSelf-healing checks passed.');
