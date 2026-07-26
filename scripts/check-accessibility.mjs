/**
 * ETAP 33F — check:accessibility (Theme Toggle Premium)
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

const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
const settings = readFileSync(join(ROOT, 'js/core/settings.js'), 'utf8');
const css = readFileSync(join(ROOT, 'css/theme-toggle-premium.css'), 'utf8');

assert(/id="darkModeToggleBtn"[^>]*aria-label=/i.test(html)
    || /aria-label="[^"]*"[^>]*id="darkModeToggleBtn"/i.test(html)
    || html.includes('id="darkModeToggleBtn"') && html.includes('aria-label='), 'HTML aria-label obecny');

const btnChunk = html.match(/<button[^>]*id="darkModeToggleBtn"[^>]*>[\s\S]*?<\/button>/);
assert(Boolean(btnChunk), 'znaleziono przycisk darkModeToggleBtn');
assert(/aria-label=/i.test(btnChunk?.[0] || ''), 'aria-label na przycisku');
assert(/aria-pressed=/i.test(btnChunk?.[0] || ''), 'aria-pressed na przycisku');
assert(/type="button"/i.test(btnChunk?.[0] || ''), 'type=button');

assert(/setAttribute\(\s*['"]aria-label['"]/i.test(settings), 'settings aktualizuje aria-label');
assert(/setAttribute\(\s*['"]aria-pressed['"]/i.test(settings), 'settings aktualizuje aria-pressed');
assert(/a11y\.lightMode|a11y\.darkMode/i.test(settings), 'etykiety a11y light/dark');
assert(/focus-visible/i.test(css), 'focus-visible styl');
assert(/min-width:\s*var\(--ph-btn/i.test(css) && /min-height:\s*var\(--ph-btn/i.test(css),
    'touch target = --ph-btn (header)');

// Ikona odzwierciedla aktywny motyw (ETAP 34B: 🌞 / 🌙)
assert(/enabled\s*\?\s*['"]🌙['"]\s*:\s*['"]🌞['"]/.test(settings)
    || (settings.includes('🌙') && settings.includes('🌞') && settings.includes('enabled ?')),
    '🌞 dzienny / 🌙 nocny w applyDarkMode');

if (failed) {
    console.error(`\n${failed} failed`);
    process.exit(1);
}
console.log('\n--- Accessibility check ---');
console.log('OK');
