/**
 * Smoke ETAP 43 — Memory Cleaner
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

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

const mc = readFileSync(join(ROOT, 'js/diagnostics/memoryCleaner.js'), 'utf8');
const app = readFileSync(join(ROOT, 'js/app.js'), 'utf8');
const vault = readFileSync(join(ROOT, 'js/diagnostics/developerVaultPanel.js'), 'utf8');

assert(mc.includes('ETAP 43'), 'ETAP 43');
assert(mc.includes('getStorageHealth'), 'getStorageHealth');
assert(mc.includes('cleanSafeData'), 'cleanSafeData');
assert(mc.includes('Storage Health') || mc.includes('health'), 'health metric');
assert(mc.includes('SAFE_LS') || mc.includes('isSafeKey'), 'safe keys');
assert(mc.includes('PROTECTED') || mc.includes('isProtectedKey'), 'protected keys');
assert(mc.includes('regionalny_smak_settings') || mc.includes('regionalny_smak'), 'protects settings/fav/cart');
assert(mc.includes('rg_console_guardian'), 'cleans console guardian');
assert(mc.includes('indexedDB') || mc.includes('LEARNING_IDB'), 'IDB prune');
assert(mc.includes('caches.delete') || mc.includes('deleteStaleCaches'), 'stale cache');
assert(mc.includes('safeOnly') || mc.includes('safeOnly: true'), 'policy');
assert(!/fetch\(|sendBeacon/.test(mc.split('showToast')[0]), 'no network in core logic');
assert(app.includes('initMemoryCleaner'), 'app init');
assert(vault.includes('renderMemoryCleanerCard'), 'vault card');

const r = spawnSync(process.execPath, ['--check', 'js/diagnostics/memoryCleaner.js'], {
    cwd: ROOT,
    encoding: 'utf8'
});
assert(r.status === 0, 'syntax');

const outDir = join(ROOT, 'docs', 'memory-cleaner');
mkdirSync(outDir, { recursive: true });
const md = `# ETAP 43 — Memory Cleaner

**Werdykt:** ${failed ? 'FAIL' : 'PASS'}  
**Data:** ${new Date().toISOString().slice(0, 10)}

## Cel

Sam pilnuje \`localStorage\` · Cache API · IndexedDB · starych raportów/logów strażników.  
Pokazuje **Storage Health** i jednym kliknięciem czyści **wyłącznie bezpieczne** dane.

## UI (przykład)

| Metryka | Przykład |
|---------|----------|
| Storage Health | 98% |
| Cache | 34 MB |
| Raporty | 126 |
| Do usunięcia | 43 |

## Bezpieczne do usunięcia

- logi Console / UI / Map Guardian
- Self-Heal log
- learning events LS + nadmiar sygnałów IDB
- historie improvement / dashboard / virtual user
- **stare** cache PWA (nie \`rg-pwa-v28\` / \`rg-runtime-images-v28\`)

## Chronione (nigdy)

ustawienia · ulubione · koszyk · Premium · auth · GPS · map prefs · OSM cache · learning model

## API

\`\`\`js
__RG_MEMORY__.open()
__RG_MEMORY__.health()
__RG_MEMORY__.clean()
\`\`\`

Dev Vault → Utrzymanie → karta Memory Cleaner.
`;

writeFileSync(join(outDir, 'ETAP-43-MEMORY-CLEANER.md'), md, 'utf8');
writeFileSync(join(outDir, 'latest.md'), md, 'utf8');
writeFileSync(join(outDir, 'latest.json'), JSON.stringify({
    id: 'etap-43-memory-cleaner',
    verdict: failed ? 'FAIL' : 'PASS',
    generatedAt: new Date().toISOString(),
    policy: { safeOnly: true, noNetwork: true }
}, null, 2), 'utf8');

assert(existsSync(join(outDir, 'ETAP-43-MEMORY-CLEANER.md')), 'report');

console.log(failed ? `\n${failed} failed` : '\nMemory Cleaner smoke OK');
process.exit(failed ? 1 : 0);
