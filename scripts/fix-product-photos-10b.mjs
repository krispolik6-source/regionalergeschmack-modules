/**
 * ETAP 10B – probe + apply poprawnych zdjęć produktów.
 * node scripts/fix-product-photos-10b.mjs probe
 * node scripts/fix-product-photos-10b.mjs apply --pick=butter:0,plum:0,pretzel:0,jam:0,preserves:0
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'assets', 'images');
const probeDir = path.join(root, '_probe');
const GRADE = { brightness: 1.07, saturation: 0.97, hue: 3 };

const FIXES = {
    butter: [
        'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=1400&q=85'
    ],
    plum: [
        'https://cdn.pixabay.com/photo/2016/07/22/09/53/plums-1534499_1280.jpg',
        'https://cdn.pixabay.com/photo/2017/01/20/15/06/plums-1995066_1280.jpg'
    ],
    pretzel: [
        'https://cdn.pixabay.com/photo/2016/11/29/10/09/bread-1868925_1280.jpg',
        'https://cdn.pixabay.com/photo/2017/06/26/12/20/pretzel-2443707_1280.jpg'
    ],
    jam: [
        'https://cdn.pixabay.com/photo/2016/03/05/19/02/jam-1238248_1280.jpg',
        'https://cdn.pixabay.com/photo/2015/05/31/11/24/jam-791185_1280.jpg'
    ],
    preserves: [
        'https://cdn.pixabay.com/photo/2015/03/26/09/42/canning-690064_1280.jpg',
        'https://cdn.pixabay.com/photo/2016/11/19/12/44/bottles-1839068_1280.jpg'
    ],
    category_restaurants: [
        'https://images.pexels.com/photos/235925/pexels-photo-235925.jpeg?auto=compress&cs=tinysrgb&w=1400',
        'https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?auto=compress&cs=tinysrgb&w=1400'
    ]
};

async function fetchBuf(url) {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; RegionalerGeschmack/10B)',
            Accept: 'image/*'
        }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
}

async function saveProduct(slug, buf) {
    const webpPath = path.join(root, 'products', `${slug}.webp`);
    const jpgPath = path.join(root, 'products', `${slug}.jpg`);
    let q = 86;
    let webpBuf;
    for (let i = 0; i < 12; i += 1) {
        webpBuf = await sharp(buf)
            .resize(800, 600, { fit: 'cover', position: 'centre' })
            .modulate(GRADE)
            .gamma(1.02)
            .webp({ quality: q, effort: 6 })
            .toBuffer();
        if (webpBuf.length <= 350 * 1024) break;
        q -= 6;
    }
    let jq = 82;
    let jpgBuf;
    for (let i = 0; i < 14; i += 1) {
        jpgBuf = await sharp(buf)
            .resize(512, 384, { fit: 'cover', position: 'centre' })
            .modulate(GRADE)
            .gamma(1.02)
            .jpeg({ quality: jq, mozjpeg: true })
            .toBuffer();
        if (jpgBuf.length <= 150 * 1024) break;
        jq -= 5;
    }
    fs.writeFileSync(webpPath, webpBuf);
    fs.writeFileSync(jpgPath, jpgBuf);
    console.log('SAVED product', slug, Math.round(webpBuf.length / 1024), 'kB');
}

async function saveBackground(slug, buf) {
    const webpPath = path.join(root, 'backgrounds', `${slug}.webp`);
    const jpgPath = path.join(root, 'backgrounds', `${slug}.jpg`);
    const webpBuf = await sharp(buf)
        .resize(1200, 750, { fit: 'cover', position: 'centre' })
        .modulate(GRADE)
        .gamma(1.02)
        .webp({ quality: 84, effort: 6 })
        .toBuffer();
    const jpgBuf = await sharp(buf)
        .resize(768, 480, { fit: 'cover', position: 'centre' })
        .modulate(GRADE)
        .gamma(1.02)
        .jpeg({ quality: 78, mozjpeg: true })
        .toBuffer();
    fs.writeFileSync(webpPath, webpBuf);
    fs.writeFileSync(jpgPath, jpgBuf);
    console.log('SAVED bg', slug, Math.round(webpBuf.length / 1024), 'kB');
}

fs.mkdirSync(probeDir, { recursive: true });
const mode = process.argv[2] || 'probe';

const pickArg = process.argv.find((a) => a.startsWith('--pick='));
const picks = new Map();
if (pickArg) {
    for (const part of pickArg.slice('--pick='.length).split(',')) {
        const [slug, idx] = part.split(':');
        if (slug) picks.set(slug, Number(idx || 0));
    }
}

for (const [slug, urls] of Object.entries(FIXES)) {
    for (let i = 0; i < urls.length; i += 1) {
        const probeName = `${slug}__${i}.jpg`;
        const probePath = path.join(probeDir, probeName);
        try {
            const buf = await fetchBuf(urls[i]);
            await sharp(buf).resize(900, 600, { fit: 'inside' }).jpeg({ quality: 85 }).toFile(probePath);
            console.log('PROBE_OK', probeName);
            if (mode === 'apply' && picks.has(slug) && picks.get(slug) === i) {
                if (slug.startsWith('category_')) await saveBackground(slug, buf);
                else await saveProduct(slug, buf);
            }
        } catch (e) {
            console.error('PROBE_FAIL', probeName, e.message);
        }
    }
}

console.log('Done.');
