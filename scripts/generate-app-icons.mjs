/**
 * Generuje WSZYSTKIE ikony wyłącznie z logo-master.svg
 * Run: npm run generate-icons
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
const masterSvg = fs.readFileSync(masterPath);

const CREAM = { r: 245, g: 239, b: 227, alpha: 1 };
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };
const DARK = { r: 26, g: 31, b: 24, alpha: 1 };

const SIZES = [48, 72, 96, 128, 144, 152, 180, 192, 256, 384, 512, 1024];

async function wheatOnBg(size, bg, padRatio = 0.12) {
  const pad = Math.round(size * padRatio);
  const inner = size - pad * 2;
  const wheat = await sharp(masterSvg)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 4, background: bg }
  })
    .composite([{ input: wheat, left: pad, top: pad }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

async function renderMaskable(size) {
  const logoSize = Math.round(size * 0.72);
  const wheat = await sharp(masterSvg)
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const offset = Math.round((size - logoSize) / 2);
  return sharp({
    create: { width: size, height: size, channels: 4, background: CREAM }
  })
    .composite([{ input: wheat, left: offset, top: offset }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** Android 13+ monochrome — biały znak na przezroczystym */
async function renderMonochrome(size) {
  const wheat = await sharp(masterSvg)
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
      // zachowaj alpha z krawędzi
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

// ——— PNG sizes (kremowe tło z master glyph) ———
for (const size of SIZES) {
  await writePng(iconsDir, `icon-${size}.png`, await wheatOnBg(size, CREAM));
}

await writePng(iconsDir, 'apple-touch-icon.png', await wheatOnBg(180, CREAM));
await writePng(iconsDir, 'maskable-512.png', await renderMaskable(512));
await writePng(iconsDir, 'monochrome-512.png', await renderMonochrome(512));

const icoImages = [];
for (const size of [16, 32, 48]) {
  icoImages.push({ size, png: await wheatOnBg(size, WHITE, 0.1) });
}
fs.writeFileSync(path.join(iconsDir, 'favicon.ico'), encodeIco(icoImages));
console.log('OK favicon.ico');

// Aliasy SVG = bajtowo master
fs.copyFileSync(masterPath, path.join(iconsDir, 'icon-source.svg'));
fs.copyFileSync(masterPath, path.join(iconsDir, 'icon-symbol.svg'));
console.log('OK icon-source.svg / icon-symbol.svg ← logo-master.svg');

// Brand pack — wyłącznie z mastera
fs.mkdirSync(brandDir, { recursive: true });
fs.copyFileSync(masterPath, path.join(brandDir, 'logo-mark.svg'));
await writePng(brandDir, 'logo-on-light.png', await wheatOnBg(512, CREAM));
await writePng(brandDir, 'logo-on-dark.png', await wheatOnBg(512, DARK));
await writePng(brandDir, 'logo-mark.png', await sharp(masterSvg)
  .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toBuffer());

// on-light / on-dark SVG = master + tło (generowane, nie osobny znak)
const masterText = masterSvg.toString('utf8');
const withBg = (fill, label) => masterText
  .replace(
    '<defs>',
    `<rect width="512" height="512" rx="96" fill="${fill}"/>\n  <defs>`
  )
  .replace('dwa złote kłosy', label);
fs.writeFileSync(path.join(brandDir, 'logo-on-light.svg'), withBg('#f5efe3', 'logo on light'));
fs.writeFileSync(path.join(brandDir, 'logo-on-dark.svg'), withBg('#1a1f18', 'logo on dark'));
console.log('OK assets/brand SVGs ← logo-master');

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

console.log('Done. Single master: logo-master.svg → all icons.');
