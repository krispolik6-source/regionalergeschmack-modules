/**
 * Modal: zdjęcie 150px, odstęp 20px, scroll body.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function patch(rel, pairs) {
    const path = join(ROOT, rel);
    let t = readFileSync(path, 'utf8');
    for (const [from, to] of pairs) {
        if (!t.includes(from)) {
            console.warn('skip missing', rel, JSON.stringify(from).slice(0, 60));
            continue;
        }
        t = t.split(from).join(to);
    }
    writeFileSync(path, t, 'utf8');
    console.log('patched', rel);
}

patch('css/style.css', [
    ['--photo-modal-height: 180px', '--photo-modal-height: 150px'],
    ['--photo-modal-height, 180px', '--photo-modal-height, 150px'],
    ['height: min(180px, 30vh)', 'height: min(150px, 28vh)'],
    ['max-height: 180px;\n        margin-bottom: 18px;', 'max-height: 150px;\n        margin-bottom: 20px;'],
    ['max-height: 180px;\n        margin-bottom: 20px;', 'max-height: 150px;\n        margin-bottom: 20px;'],
    ['margin-bottom: 16px;\n    border-radius: 14px;\n    flex-shrink: 0;', 'margin-bottom: 20px;\n    border-radius: 14px;\n    flex-shrink: 0;'],
    ['margin-bottom: 18px;\n    border-radius: 14px;\n    flex-shrink: 0;', 'margin-bottom: 20px;\n    border-radius: 14px;\n    flex-shrink: 0;'],
    ['margin-bottom: 20px;\n    border-radius: 14px;\n    flex-shrink: 0;', 'margin-bottom: 20px;\n    border-radius: 14px;\n    flex-shrink: 0;'],
    ["prepublish.css?v=6", 'prepublish.css?v=7'],
    ["experience-stack.css?v=4", 'experience-stack.css?v=5']
]);

// Ensure modal photo frame margin 20px after token height rules
{
    const path = join(ROOT, 'css/style.css');
    let t = readFileSync(path, 'utf8');
    t = t.replace(
        /\.producer-modal-header \.producer-photo-frame \{[\s\S]*?margin-bottom:\s*\d+px;/,
        (block) => block.replace(/margin-bottom:\s*\d+px;/, 'margin-bottom: 20px;')
    );
    // body scroll
    if (!/\.producer-modal-body\s*\{[\s\S]*?overflow-y:\s*auto/.test(t)) {
        console.warn('producer-modal-body overflow-y missing');
    }
    writeFileSync(path, t, 'utf8');
}

patch('css/prepublish.css', [
    ['--photo-modal-height, 180px', '--photo-modal-height, 150px'],
    ['max-height: 180px !important;', 'max-height: 150px !important;'],
    ['margin-bottom: 18px !important;', 'margin-bottom: 20px !important;'],
    ['margin-bottom: 16px !important;', 'margin-bottom: 20px !important;']
]);

patch('css/living-region-experience.css', [
    ['--photo-modal-height, 180px', '--photo-modal-height, 150px'],
    ['margin-bottom: 18px;', 'margin-bottom: 20px;'],
    ['margin-bottom: 20px;\n    overflow: hidden;', 'margin-bottom: 20px;\n    overflow: hidden;']
]);

patch('css/experience-stack.css', [
    ["living-region-experience.css?v=3", 'living-region-experience.css?v=4']
]);

patch('index.html', [['style.css?v=542', 'style.css?v=543'], ['style.css?v=541', 'style.css?v=543']]);

// Also ensure shops mapping explicit + cache bust category images
{
    const path = join(ROOT, 'js/presentation/categoryImages.js');
    let t = readFileSync(path, 'utf8');
    if (!t.includes("shops: `${BASE}/category_shops.webp")) {
        console.error('shops mapping missing');
        process.exit(1);
    }
    // bump V so clients refetch if assets changed
    t = t.replace(/const V = 'v=\d+';/, "const V = 'v=9';");
    writeFileSync(path, t, 'utf8');
    console.log('categoryImages V bumped');
}

const style = readFileSync(join(ROOT, 'css/style.css'), 'utf8');
const token = style.match(/--photo-modal-height:\s*([^;]+)/)?.[1]?.trim();
const margin = /producer-modal-header \.producer-photo-frame \{[\s\S]*?margin-bottom:\s*(\d+)px/.exec(style);
const scroll = /\.producer-modal-body\s*\{[\s\S]*?overflow-y:\s*auto/.test(style);
console.log({ token, margin: margin && margin[1], scroll });
if (token !== '150px' || (margin && margin[1] !== '20') || !scroll) {
    process.exit(1);
}
console.log('OK modal photo 150');
