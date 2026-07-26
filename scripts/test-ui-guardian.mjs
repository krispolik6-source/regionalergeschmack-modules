/**
 * Smoke ETAP 41 — UI Guardian
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

const ug = readFileSync(join(ROOT, 'js/diagnostics/uiGuardian.js'), 'utf8');
const app = readFileSync(join(ROOT, 'js/app.js'), 'utf8');
const region = readFileSync(join(ROOT, 'css/region-story.css'), 'utf8');
const polish = readFileSync(join(ROOT, 'css/ux-polish-1.css'), 'utf8');

assert(ug.includes('ETAP 41'), 'ETAP 41 header');
assert(ug.includes('INTERVAL_MS'), 'interval');
assert(ug.includes('touch-44') || ug.includes('TOUCH_MIN'), 'touch 44');
assert(ug.includes('contrast'), 'contrast check');
assert(ug.includes('safe-area'), 'safe-area');
assert(ug.includes('popup-bounds'), 'popup bounds');
assert(ug.includes('card-clip'), 'card clip');
assert(ug.includes('overflow'), 'overflow');
assert(ug.includes('text-visible') || ug.includes('Napisz'), 'text visible');
assert(ug.includes('localOnly') || ug.includes('noNetwork'), 'local only');
assert(!/fetch\(|sendBeacon|XMLHttpRequest/.test(ug), 'no network');
assert(ug.includes('home-region-story-label'), 'scans region story label');
assert(ug.includes('THEME_CHANGED'), 'theme rescan');

assert(app.includes('initUiGuardian'), 'app init');
assert(region.includes('home-region-story-sub') && region.includes('dark-mode'), 'region-story dark sub');
assert(polish.includes('home-region-story-label'), 'ux-polish covers region story');

const r = spawnSync(process.execPath, ['--check', 'js/diagnostics/uiGuardian.js'], {
    cwd: ROOT,
    encoding: 'utf8'
});
assert(r.status === 0, 'syntax uiGuardian.js');

const outDir = join(ROOT, 'docs', 'ui-guardian');
mkdirSync(outDir, { recursive: true });
const md = `# ETAP 41 — UI Guardian

**Werdykt:** ${failed ? 'FAIL' : 'PASS'}  
**Data:** ${new Date().toISOString().slice(0, 10)}

## Cel

Co kilka sekund (\`~4 s\`) skanuje UI i wykrywa problemy prezentacji — m.in. taki jak niewidoczny napis **„Opowieści regionu”** w trybie nocnym.

## Checklista

| Check | Opis |
|-------|------|
| offscreen | elementy poza ekranem |
| text-visible | napisy widoczne |
| contrast | stosunek kontrastu WCAG-ish |
| touch-44 | przyciski min. 44px |
| overflow | overflow dokumentu / kart |
| safe-area | notch / home indicator |
| popup-bounds | modal / menu / leaflet popup |
| card-clip | karty ucięte |

## Soft-heal (stan DOM)

- kontrast → inline \`color\`
- overflow → \`overflow-x: clip\`
- touch → \`min-height: 44px\`
- popup → \`max-width/max-height\`

Bez zmiany Store / EventBus / API / Leaflet core. Bez sieci.

## Naprawa przykładowa (CSS)

Dark mode dla \`.home-region-story-label\` / \`-sub\` (region-story + ux-polish).

## API

\`\`\`js
__RG_UI_GUARDIAN__.run()
__RG_UI_GUARDIAN__.findings()
__RG_UI_GUARDIAN__.last()
__RG_UI_GUARDIAN__.clear()
\`\`\`

Store: \`localStorage.rg_ui_guardian_v1\`
`;

writeFileSync(join(outDir, 'ETAP-41-UI-GUARDIAN.md'), md, 'utf8');
writeFileSync(join(outDir, 'latest.md'), md, 'utf8');
writeFileSync(join(outDir, 'latest.json'), JSON.stringify({
    id: 'etap-41-ui-guardian',
    verdict: failed ? 'FAIL' : 'PASS',
    generatedAt: new Date().toISOString(),
    intervalMs: 4000,
    policy: { localOnly: true, softHeal: true, noNetwork: true }
}, null, 2), 'utf8');

assert(existsSync(join(outDir, 'ETAP-41-UI-GUARDIAN.md')), 'report');

console.log(failed ? `\n${failed} failed` : '\nUI Guardian smoke OK');
process.exit(failed ? 1 : 0);
