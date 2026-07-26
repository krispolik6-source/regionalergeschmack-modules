/**
 * Pobiera brakujące zdjęcia produktów z Unsplash (tylko te, których jeszcze nie ma).
 * Run: node scripts/fetch-missing-products.mjs
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'assets', 'images');
const GRADE = { brightness: 1.07, saturation: 0.97, hue: 3 };

const missingOnly = [
  { out: 'products/potatoes.webp', jpg: 'products/potatoes.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=85', theme: 'organic potatoes' },
  { out: 'products/apples.webp', jpg: 'products/apples.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1685967836586-aaefdda7b517?auto=format&fit=crop&w=1200&q=85', theme: 'fresh apples' },
  { out: 'products/carrots.webp', jpg: 'products/carrots.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1549407704-7ee851db3acd?auto=format&fit=crop&w=1200&q=85', theme: 'fresh carrots' },
  { out: 'products/eggs.webp', jpg: 'products/eggs.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1642463028853-706f378f2323?auto=format&fit=crop&w=1200&q=85', theme: 'farm eggs' },
  { out: 'products/rolls.webp', jpg: 'products/rolls.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=1200&q=85', theme: 'fresh bread rolls' },
  { out: 'products/pork.webp', jpg: 'products/pork.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1200&q=85', theme: 'pork cutlet' },
  { out: 'products/milk.webp', jpg: 'products/milk.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1577223625811-75403f0bab9f?auto=format&fit=crop&w=1200&q=85', theme: 'fresh milk bottle' },
  { out: 'products/butter.webp', jpg: 'products/butter.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=85', theme: 'farm butter' },
  { out: 'products/coffee.webp', jpg: 'products/coffee.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=85', theme: 'espresso coffee' },
  { out: 'products/chocolate.webp', jpg: 'products/chocolate.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1474176857210-7287d38d27c6?auto=format&fit=crop&w=1200&q=85', theme: 'chocolate bar' },
  { out: 'products/juice.webp', jpg: 'products/juice.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=1200&q=85', theme: 'fresh orange juice' },
];

async function fetchBuffer(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'RegionalerGeschmack/1.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function saveWebp(buf, item) {
  let quality = 86;
  let outBuf;
  for (let i = 0; i < 12; i++) {
    outBuf = await sharp(buf)
      .resize(item.w, item.h, { fit: 'cover', position: 'centre' })
      .modulate(GRADE)
      .gamma(1.02)
      .webp({ quality, effort: 6 })
      .toBuffer();
    if (outBuf.length <= item.maxKb * 1024) break;
    quality -= 6;
  }
  const outPath = path.join(root, item.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, outBuf);
  return Math.round(outBuf.length / 1024);
}

async function saveJpeg(buf, item) {
  let quality = 82;
  let outBuf;
  for (let i = 0; i < 14; i++) {
    outBuf = await sharp(buf)
      .resize(item.jpgW, item.jpgH, { fit: 'cover', position: 'centre' })
      .modulate(GRADE)
      .gamma(1.02)
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    if (outBuf.length <= item.jpgMaxKb * 1024) break;
    quality -= 5;
  }
  const outPath = path.join(root, item.jpg);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, outBuf);
  return Math.round(outBuf.length / 1024);
}

let failures = 0;
for (const item of missingOnly) {
  const webpPath = path.join(root, item.out);
  if (fs.existsSync(webpPath)) {
    console.log('SKIP', item.out);
    continue;
  }
  try {
    const buf = await fetchBuffer(item.url);
    const webpKb = await saveWebp(buf, item);
    const jpgKb = await saveJpeg(buf, item);
    console.log('OK', item.out, `${webpKb}kB`, item.jpg, `${jpgKb}kB`);
  } catch (error) {
    failures += 1;
    console.error('FAIL', item.out, error.message);
  }
}

process.exit(failures ? 1 : 0);
