/**
 * Wstrzykuje kod AdSense + CSP do index.html (UTF-8).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const path = join(ROOT, 'index.html');
let html = readFileSync(path, 'utf8');

const ADSENSE_BLOCK = `
    <!-- Google AdSense – client/slot: js/config.js → ADSENSE_CONFIG -->
    <script>
        window.adsbygoogle = window.adsbygoogle || [];
    </script>
    <script async
        id="rg-adsense-loader"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9002110535592311"
        crossorigin="anonymous"
        data-rg-adsense="1"></script>
`;

// Usuń poprzedni blok AdSense (idempotentnie)
html = html.replace(
    /\s*<!-- Google AdSense[\s\S]*?data-rg-adsense="1"><\/script>\s*/g,
    '\n'
);

if (!html.includes('data-rg-adsense="1"')) {
    if (html.includes('<!-- Google tag (gtag.js)')) {
        html = html.replace('<!-- Google tag (gtag.js)', `${ADSENSE_BLOCK.trim()}\n\n    <!-- Google tag (gtag.js)`);
    } else {
        html = html.replace('</head>', `${ADSENSE_BLOCK}</head>`);
    }
}

// CSP: AdSense scripts + iframes (pełna polityka – nie dopinaj hostów do font-src)
const CSP = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://unpkg.com https://esm.sh https://www.gstatic.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://partner.googleadservices.com https://www.googletagservices.com https://ep2.adtrafficquality.google",
    "media-src 'self' https://cdn.freesound.org",
    "style-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https: wss:",
    "font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com",
    "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com https://pagead2.googlesyndication.com https://ep2.adtrafficquality.google"
].join('; ');
html = html.replace(
    /<meta http-equiv="Content-Security-Policy" content="[^"]*">/,
    `<meta http-equiv="Content-Security-Policy" content="${CSP}">`
);

// Cache-bust
html = html.replace(/css\/style\.css\?v=\d+/, 'css/style.css?v=548');
html = html.replace(/js\/app\.js\?v=\d+/, (m) => {
    const n = Number((/v=(\d+)/.exec(m) || [])[1] || 565) + 1;
    return `js/app.js?v=${n}`;
});

writeFileSync(path, html, 'utf8');
console.log('OK AdSense inject', {
    loader: html.includes('data-rg-adsense="1"'),
    pagead: html.includes('pagead2.googlesyndication.com'),
    frameSrc: html.includes('frame-src'),
    style: /style\.css\?v=(\d+)/.exec(html)?.[1],
    app: /app\.js\?v=(\d+)/.exec(html)?.[1]
});
