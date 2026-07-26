/**
 * Panel deweloperski na końcu menu ☰ z ikoną 🔐 (idempotentnie) + cache-bust app.js
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const path = join(ROOT, 'index.html');
let html = readFileSync(path, 'utf8');

// Usuń wszystkie istniejące bloki sectionDev / wpisy dev-vault w menu
html = html.replace(
    /\s*<p class="side-menu-section-label"[^>]*data-i18n-menu-section="sectionDev"[\s\S]*?<\/ul>/g,
    ''
);
html = html.replace(
    /\s*<li><button type="button" class="side-menu-item" data-side-menu-action="dev-vault"[\s\S]*?<\/li>/g,
    ''
);

const block = `
                    <p class="side-menu-section-label" data-i18n-menu-section="sectionDev" data-i18n-menu-icon="🔐">🔐 Deweloper</p>
                    <ul class="side-menu-list">
                        <li><button type="button" class="side-menu-item" data-side-menu-action="dev-vault"><span class="side-menu-item-icon" aria-hidden="true">🔐</span><span class="side-menu-item-label" data-i18n-menu="devVault">Panel deweloperski</span></button></li>
                    </ul>
`;

if (!html.includes('                </nav>')) {
    console.error('nav end not found');
    process.exit(1);
}
html = html.replace('                </nav>', `${block}\n                </nav>`);
html = html.replace(/js\/app\.js\?v=\d+/, 'js/app.js?v=565');

writeFileSync(path, html, 'utf8');

const count = (html.match(/data-side-menu-action="dev-vault"/g) || []).length;
const sections = (html.match(/data-i18n-menu-section="sectionDev"/g) || []).length;
console.log('OK', { count, sections, icon: html.includes('🔐'), app: '565' });
if (count !== 1 || sections !== 1) process.exit(1);
