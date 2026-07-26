import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const config = readFileSync(resolve(root, 'js/config.js'), 'utf8');
const analytics = readFileSync(resolve(root, 'js/core/analytics.js'), 'utf8');

const checks = [
    ['index.html: gtag.js loader', html.includes('googletagmanager.com/gtag/js')],
    ['index.html: GA gate (only when ID set)', html.includes('window.__GA_ID__') && html.includes('if (window.__GA_ID__)')],
    ['index.html: CSP googletagmanager', html.includes('https://www.googletagmanager.com')],
    ['config.js: GA_MEASUREMENT_ID export (disabled by default)', config.includes("export const GA_MEASUREMENT_ID = ''")],
    // Shorthand w CONFIG: { GA_MEASUREMENT_ID, } ≡ GA_MEASUREMENT_ID: GA_MEASUREMENT_ID
    ['config.js: GA_MEASUREMENT_ID in CONFIG', /GA_MEASUREMENT_ID\s*[,}]/.test(config) && config.includes('CONFIG')],
    ['analytics.js: trackPageView', analytics.includes('trackPageView')],
    ['analytics.js: trackEvent', analytics.includes("trackEvent('click'")],
    ['app.js: initAnalytics', readFileSync(resolve(root, 'js/app.js'), 'utf8').includes('initAnalytics()')]
];

let failed = 0;
for (const [label, ok] of checks) {
    if (ok) console.log(`OK  ${label}`);
    else {
        console.error(`FAIL ${label}`);
        failed += 1;
    }
}

if (failed) process.exit(1);
console.log(`\n${checks.length - failed}/${checks.length} testów analytics OK`);
