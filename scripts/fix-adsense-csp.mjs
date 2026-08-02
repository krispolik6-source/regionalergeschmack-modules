import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const path = join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let html = readFileSync(path, 'utf8');

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

writeFileSync(path, html, 'utf8');
console.log('OK CSP fixed', html.includes('script-src') && html.includes('pagead2.googlesyndication.com'));
