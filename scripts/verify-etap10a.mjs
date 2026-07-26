import fs from 'node:fs';

const w = fs.readFileSync('css/warm-summer.css', 'utf8');
const s = fs.readFileSync('css/style.css', 'utf8');
const l = fs.readFileSync('css/landscapes.css', 'utf8');
const i = fs.readFileSync('index.html', 'utf8');
const m = fs.readFileSync('manifest.json', 'utf8');

const checks = [
    ['warm import', s.includes('warm-summer.css?v=1')],
    ['warm file', w.includes('ETAP 10A')],
    ['warm bg', w.includes('#f2e6d4')],
    ['compact search', w.includes('min-height: 42px')],
    ['bright cats', w.includes('0.08) 0%')],
    ['low hero', w.includes('producer-modal-header')],
    ['ls warm opacity', l.includes('--ls-bg-opacity: 0.38')],
    ['style v509', i.includes('style.css?v=509')],
    ['manifest warm', m.includes('#4f6b3c') && m.includes('#f2e6d4')],
    ['no cold gray bg', !s.includes('#cbd5df')]
];

let fail = 0;
for (const [name, ok] of checks) {
    console.log(ok ? 'OK' : 'FAIL', name);
    if (!ok) fail += 1;
}
process.exit(fail ? 1 : 0);
