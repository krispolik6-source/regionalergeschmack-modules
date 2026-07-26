import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const path = join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let html = readFileSync(path, 'utf8');
html = html.replace(/js\/app\.js\?v=\d+/, 'js/app.js?v=569');
writeFileSync(path, html, 'utf8');
console.log('app cache → 569');
