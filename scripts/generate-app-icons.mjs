/**
 * Generuje komplet ikon PWA / favicon / store z logo-icon.svg + premium tło.
 * Master UI: logo-master.svg (bez zmian). Run: npm run generate-icons
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const iconsDir = path.join(root, 'assets', 'icons');
const brandDir = path.join(root, 'assets', 'brand');
const masterPath = path.join(iconsDir, 'logo-master.svg');
const iconGlyphPath = path.join(iconsDir, 'logo-icon.svg');

const BG_TOP = '#FBF8F2';
const BG_BOTTOM = '#EEE5D6';
const BG_BASE = '#F7F3EA';
const DARK = { r: 26, g: 31, b: 24, alpha: 1 };

/** Logo ~62.5% powierzchni (bezpieczny margines Android / iOS) */
const LOGO_RATIO = 0.625;
/** Maskable — pełne tło, logo w strefie bezpiecznej (~62%) */
const MASKABLE_LOGO_RATIO = 0.62;

const PNG_SIZES = [48, 72, 96, 128, 144, 152, 180, 192, 256, 384, 512, 1024];
const FAVICON_SIZES = [16, 32];

const iconGlyphSvg = fs.readFileSync(iconGlyphPath, 'utf8');
const masterSvg = fs.readFileSync(masterPath);

function extractSvgInner(svgText) {
  return svgText
    .replace(/<\?xml[^?]*\?>\s*/i, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .trim();
}

const glyphInner = extractSvgInner(iconGlyphSvg);

function buildPremiumIconSvg(size, logoRatio = LOGO_RATIO) {
  const inner = size * logoRatio;
  const scale = inner / 512;
  const tx = (size - inner) / 2;
  const ty = (size - inner) / 2;
  const shadowDy = Math.max(1, size * 0.008);
  const shadowBlur = Math.max(1.5, size * 0.012);
  const highlightCy = size * 0.12;
  const highlightR = size * 0.55;

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="${size}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${BG_TOP}"/>
      <stop offset="1" stop-color="${BG_BOTTOM}"/>
    </linearGradient>
    <radialGradient id="topLight" cx="${size / 2}" cy="${highlightCy}" r="${highlightR}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.30"/>
      <stop offset="0.55" stop-color="#FFFFFF" stop-opacity="0.06"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
    <filter id="logoShadow" x="-18%" y="-12%" width="136%" height="145%" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="${shadowDy.toFixed(2)}" stdDeviation="${shadowBlur.toFixed(2)}" flood-color="#2a3f28" flood-opacity="0.10"/>
    </filter>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#bgGrad)"/>
  <rect width="${size}" height="${size}" fill="url(#topLight)"/>
  <g filter="url(#logoShadow)" transform="translate(${tx.toFixed(3)} ${ty.toFixed(3)}) scale(${scale.toFixed(6)})">
    ${glyphInner}
  </g>
</svg>`);
}

async function renderPremiumIcon(size, { maskable = false } = {}) {
  const ratio = maskable ? MASKABLE_LOGO_RATIO : LOGO_RATIO;
  const svg = buildPremiumIconSvg(size, ratio);
  return sharp(svg)
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

/** Android 13+ monochrome — biały znak na przezroczystym */
async function renderMonochrome(size) {
  const wheat = await sharp(iconGlyphPath)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = wheat;
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 8) {
      data[i] = data[i + 1] = data[i + 2] = 0;
      data[i + 3] = 0;
    } else {
      data[i] = data[i + 1] = data[i + 2] = 255;
    }
  }

  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

function encodeIco(images) {
  const count = images.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const entries = images.map((img) => {
    const entry = {
      width: img.size >= 256 ? 0 : img.size,
      height: img.size >= 256 ? 0 : img.size,
      bytes: img.png.length,
      offset
    };
    offset += img.png.length;
    return entry;
  });

  const buf = Buffer.alloc(offset);
  buf.writeUInt16LE(0, 0);
  buf.writeUInt16LE(1, 2);
  buf.writeUInt16LE(count, 4);

  let entryAt = 6;
  for (const e of entries) {
    buf.writeUInt8(e.width, entryAt);
    buf.writeUInt8(e.height, entryAt + 1);
    buf.writeUInt8(0, entryAt + 2);
    buf.writeUInt8(0, entryAt + 3);
    buf.writeUInt16LE(1, entryAt + 4);
    buf.writeUInt16LE(32, entryAt + 6);
    buf.writeUInt32LE(e.bytes, entryAt + 8);
    buf.writeUInt32LE(e.offset, entryAt + 12);
    entryAt += 16;
  }

  let dataAt = headerSize;
  for (const img of images) {
    img.png.copy(buf, dataAt);
    dataAt += img.png.length;
  }
  return buf;
}

async function writePng(dir, filename, buffer) {
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, filename);
  fs.writeFileSync(out, buffer);
  console.log('OK', path.relative(root, out), `${Math.round(buffer.length / 1024)} KB`);
}

// ——— PNG (premium gradient + cień) ———
for (const size of PNG_SIZES) {
  await writePng(iconsDir, `icon-${size}.png`, await renderPremiumIcon(size));
}

for (const size of FAVICON_SIZES) {
  await writePng(iconsDir, `favicon-${size}.png`, await renderPremiumIcon(size));
}

await writePng(iconsDir, 'apple-touch-icon.png', await renderPremiumIcon(180));
await writePng(iconsDir, 'maskable-192.png', await renderPremiumIcon(192, { maskable: true }));
await writePng(iconsDir, 'maskable-512.png', await renderPremiumIcon(512, { maskable: true }));
await writePng(iconsDir, 'monochrome-512.png', await renderMonochrome(512));

const icoImages = [];
for (const size of [16, 32, 48]) {
  icoImages.push({ size, png: await renderPremiumIcon(size) });
}
fs.writeFileSync(path.join(iconsDir, 'favicon.ico'), encodeIco(icoImages));
console.log('OK favicon.ico');

// Aliasy SVG = bajtowo master (UI w aplikacji)
fs.copyFileSync(masterPath, path.join(iconsDir, 'icon-source.svg'));
fs.copyFileSync(masterPath, path.join(iconsDir, 'icon-symbol.svg'));
console.log('OK icon-source.svg / icon-symbol.svg ← logo-master.svg');

// Brand pack — premium ikony + master glyph
fs.mkdirSync(brandDir, { recursive: true });
fs.copyFileSync(masterPath, path.join(brandDir, 'logo-mark.svg'));
await writePng(brandDir, 'logo-on-light.png', await renderPremiumIcon(512));
await writePng(brandDir, 'logo-on-dark.png', await renderPremiumIcon(512));
await writePng(brandDir, 'logo-mark.png', await sharp(iconGlyphPath)
  .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toBuffer());

const masterText = masterSvg.toString('utf8');
const withPremiumBg = (label) => masterText
  .replace(
    '<defs>',
    `<defs>
    <linearGradient id="iconBg" x1="0" y1="0" x2="0" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${BG_TOP}"/>
      <stop offset="1" stop-color="${BG_BOTTOM}"/>
    </linearGradient>
    <radialGradient id="iconHi" cx="256" cy="64" r="280" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>`
  )
  .replace(
    '<g transform="translate(256 268)">',
    `<rect width="512" height="512" fill="url(#iconBg)"/>
  <rect width="512" height="512" fill="url(#iconHi)"/>
  <g transform="translate(256 268)">`
  )
  .replace('dwa złote kłosy', label);
fs.writeFileSync(path.join(brandDir, 'logo-on-light.svg'), withPremiumBg('logo on light'));
fs.writeFileSync(
  path.join(brandDir, 'logo-on-dark.svg'),
  withPremiumBg('logo on dark').replace(BG_TOP, '#1a1f18').replace(BG_BOTTOM, '#141810')
);
console.log('OK assets/brand ← premium icon pack');

const copies = [
  ['assets/brand/og-share.png', 'icon-512.png'],
  ['assets/brand/splash-logo.png', 'icon-512.png'],
  ['assets/brand/notifications-icon.png', 'icon-192.png'],
  ['assets/store/google-play/icon-512.png', 'icon-512.png'],
  ['assets/store/google-play/feature-graphic-source.png', 'icon-1024.png'],
  ['assets/store/app-store/icon-1024.png', 'icon-1024.png']
];
for (const [destRel, srcName] of copies) {
  const dest = path.join(root, destRel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(path.join(iconsDir, srcName), dest);
  console.log('OK', destRel, '←', srcName);
}

console.log('Done. logo-icon.svg → premium icons · logo-master.svg → UI / aliases.');
