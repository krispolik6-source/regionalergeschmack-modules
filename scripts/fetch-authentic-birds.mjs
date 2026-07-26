/**
 * Pobiera autentyczne nagrania ptaków (CC0 via Openverse → Freesound)
 * i składa: spring/summer/autumn/winter-birds.mp3
 *
 * Usage: node scripts/fetch-authentic-birds.mjs
 */
import { mkdirSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets', 'audio', 'nature');
const SRC = join(OUT, '_src');
const UA = 'RegionalerGeschmack/1.0 (nature ambient; local build)';
const require = createRequire(import.meta.url);

/** CC0 field recordings (Freesound previews via Openverse) – ptaki, łąka/ogród */
const SOURCES = [
    {
        id: 'wild_song',
        title: "one birds song in wild",
        url: 'https://cdn.freesound.org/previews/517/517060_2495308-hq.mp3',
        page: 'https://freesound.org/people/InspectorJ/sounds/517060/',
        license: 'CC0'
    },
    {
        id: 'early_morning',
        title: 'Bird song early morning',
        url: 'https://cdn.freesound.org/previews/614/614404_11944544-hq.mp3',
        page: 'https://freesound.org/s/614404/',
        license: 'CC0'
    },
    {
        id: 'blackbird',
        title: "2015's first blackbird song",
        url: 'https://cdn.freesound.org/previews/264/264333_4539217-hq.mp3',
        page: 'https://freesound.org/s/264333/',
        license: 'CC0'
    },
    {
        id: 'chiffchaff',
        title: 'Chiff Chaff',
        url: 'https://cdn.freesound.org/previews/517/517474_8591861-hq.mp3',
        page: 'https://freesound.org/s/517474/',
        license: 'CC0'
    },
    {
        id: 'robin',
        title: 'Robin singing',
        url: 'https://cdn.freesound.org/previews/704/704646_334103-hq.mp3',
        page: 'https://freesound.org/s/704646/',
        license: 'CC0'
    },
    {
        id: 'birds_singing',
        title: 'Birds_Singing',
        url: 'https://cdn.freesound.org/previews/274/274882_3474310-hq.mp3',
        page: 'https://freesound.org/s/274882/',
        license: 'CC0'
    },
    {
        id: 'spring_call',
        title: 'Bird call in spring',
        url: 'https://cdn.freesound.org/previews/364/364663_3124312-hq.mp3',
        page: 'https://freesound.org/s/364663/',
        license: 'CC0'
    },
    {
        id: 'spring_mono',
        title: 'BIRDS-spring_mono_02',
        url: 'https://cdn.freesound.org/previews/268/268079_165310-hq.mp3',
        page: 'https://freesound.org/s/268079/',
        license: 'CC0'
    }
];

const SEASON_MIX = {
    spring: [
        { id: 'spring_mono', w: 1.0 },
        { id: 'chiffchaff', w: 0.9 },
        { id: 'spring_call', w: 0.8 },
        { id: 'robin', w: 0.7 }
    ],
    summer: [
        { id: 'birds_singing', w: 1.0 },
        { id: 'blackbird', w: 0.95 },
        { id: 'early_morning', w: 0.75 },
        { id: 'wild_song', w: 0.65 }
    ],
    autumn: [
        { id: 'blackbird', w: 0.9 },
        { id: 'wild_song', w: 0.7 },
        { id: 'early_morning', w: 0.55 },
        { id: 'birds_singing', w: 0.5 }
    ],
    winter: [
        { id: 'robin', w: 0.7 },
        { id: 'wild_song', w: 0.5 },
        { id: 'blackbird', w: 0.4 }
    ]
};

function resolveFfmpeg() {
    try {
        const mod = require('ffmpeg-static');
        if (mod && existsSync(mod)) return mod;
    } catch { /* optional */ }
    const which = spawnSync(process.platform === 'win32' ? 'where' : 'which', ['ffmpeg'], { encoding: 'utf8' });
    if (which.status === 0) {
        return String(which.stdout || '').split(/\r?\n/).map((s) => s.trim()).find(Boolean) || null;
    }
    return null;
}

async function download(src) {
    const dest = join(SRC, `${src.id}.mp3`);
    if (existsSync(dest) && statSync(dest).size > 3000) {
        console.log('SKIP', src.id);
        return dest;
    }
    console.log('GET', src.id);
    const res = await fetch(src.url, { headers: { 'User-Agent': UA, Accept: '*/*' } });
    if (!res.ok) throw new Error(`${src.id}: HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(dest, buf);
    console.log('OK', src.id, `${buf.length} B`);
    return dest;
}

function mixSeason(ffmpegBin, season, parts) {
    const inputs = [];
    const filters = [];
    let i = 0;
    for (const p of parts) {
        const src = join(SRC, `${p.id}.mp3`);
        if (!existsSync(src)) continue;
        inputs.push('-i', src);
        // highpass odcina niski wiatr/szum; soft fade; waga
        filters.push(
            `[${i}:a]atrim=0:40,asetpts=PTS-STARTPTS,highpass=f=450,lowpass=f=9500,`
            + `volume=${p.w.toFixed(2)},afade=t=in:st=0:d=1.4,afade=t=out:st=37:d=2.5[a${i}]`
        );
        i += 1;
    }
    if (i === 0) throw new Error(`No sources for ${season}`);

    const mixInputs = Array.from({ length: i }, (_, k) => `[a${k}]`).join('');
    const filterComplex = `${filters.join(';')};${mixInputs}amix=inputs=${i}:duration=longest:dropout_transition=2:normalize=0,`
        + 'alimiter=limit=0.82,afade=t=in:st=0:d=1.8,afade=t=out:st=36:d=3[out]';

    const wav = join(OUT, `${season}-birds.wav`);
    const mp3 = join(OUT, `${season}-birds.mp3`);

    const r1 = spawnSync(ffmpegBin, [
        '-y', ...inputs, '-filter_complex', filterComplex, '-map', '[out]',
        '-ac', '1', '-ar', '22050', wav
    ], { encoding: 'utf8' });
    if (r1.status !== 0) {
        console.error(r1.stderr?.slice(-900));
        throw new Error(`ffmpeg wav ${season}`);
    }
    const r2 = spawnSync(ffmpegBin, [
        '-y', '-i', wav, '-codec:a', 'libmp3lame', '-qscale:a', '5', '-ac', '1', mp3
    ], { encoding: 'utf8' });
    if (r2.status !== 0) throw new Error(`ffmpeg mp3 ${season}`);
    console.log('OK', `${season}-birds.mp3 / .wav`);
}

mkdirSync(SRC, { recursive: true });
mkdirSync(OUT, { recursive: true });

const ffmpegBin = resolveFfmpeg();
if (!ffmpegBin) {
    console.error('Brak ffmpeg – npm i -D ffmpeg-static');
    process.exit(1);
}

let failed = 0;
for (const s of SOURCES) {
    try {
        await download(s);
    } catch (e) {
        failed += 1;
        console.error('FAIL', s.id, e.message);
    }
}

for (const season of Object.keys(SEASON_MIX)) {
    try {
        mixSeason(ffmpegBin, season, SEASON_MIX[season]);
    } catch (e) {
        failed += 1;
        console.error('FAIL mix', season, e.message);
    }
}

writeFileSync(
    join(OUT, 'CREDITS-BIRDS.txt'),
    [
        'Regionaler Geschmack – authentic seasonal bird mixes (meadow / garden)',
        '',
        'Files: spring-birds | summer-birds | autumn-birds | winter-birds (.mp3|.wav)',
        'Processing: mix of CC0 field recordings; highpass to reduce wind rumble;',
        '            no synthetic FX added.',
        '',
        'Sources (CC0 – Freesound, discovered via Openverse):',
        ...SOURCES.map((s) => `  - ${s.title} (${s.license}) ${s.page}`),
        '',
        'Alternatives: Pixabay Content License, Freesound CC0 full downloads.',
        'Keep filenames: *-birds.mp3'
    ].join('\n'),
    'utf8'
);

writeFileSync(
    join(OUT, 'CREDITS.txt'),
    [
        'Regionaler Geschmack – nature ambient',
        '',
        'Primary (app): authentic seasonal bird mixes',
        '  spring-birds.mp3 | summer-birds.mp3 | autumn-birds.mp3 | winter-birds.mp3',
        '  Attribution / sources: CREDITS-BIRDS.txt',
        '',
        'Legacy procedural assets (*-forest.*) may remain unused.',
        'Master volume in app: ~10–12%.'
    ].join('\n'),
    'utf8'
);

if (failed >= SOURCES.length) {
    console.error('All downloads failed');
    process.exit(1);
}
console.log('Done', OUT, failed ? `(${failed} warnings)` : '');
