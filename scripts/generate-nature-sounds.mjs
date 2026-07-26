/**
 * Generuje delikatne pętle ambient (WAV + MP3) do assets/audio/nature/.
 * Można podmienić plikami CC0 z Pixabay / Freesound (patrz CREDITS.txt).
 *
 * Usage: node scripts/generate-nature-sounds.mjs
 * MP3: opcjonalnie przez ffmpeg-static (npm i -D ffmpeg-static) lub PATH ffmpeg.
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const require = createRequire(import.meta.url);

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets', 'audio', 'nature');
const SR = 22050;

function clamp(n, a = -1, b = 1) {
    return Math.max(a, Math.min(b, n));
}

function writeWav(path, samples) {
    const numSamples = samples.length;
    const dataSize = numSamples * 2;
    const buf = Buffer.alloc(44 + dataSize);
    buf.write('RIFF', 0);
    buf.writeUInt32LE(36 + dataSize, 4);
    buf.write('WAVE', 8);
    buf.write('fmt ', 12);
    buf.writeUInt32LE(16, 16);
    buf.writeUInt16LE(1, 20); // PCM
    buf.writeUInt16LE(1, 22); // mono
    buf.writeUInt32LE(SR, 24);
    buf.writeUInt32LE(SR * 2, 28);
    buf.writeUInt16LE(2, 32);
    buf.writeUInt16LE(16, 34);
    buf.write('data', 36);
    buf.writeUInt32LE(dataSize, 40);
    for (let i = 0; i < numSamples; i += 1) {
        const s = Math.max(-1, Math.min(1, samples[i]));
        buf.writeInt16LE((s * 32767) | 0, 44 + i * 2);
    }
    writeFileSync(path, buf);
}

/** Pink-ish noise */
function makeNoise(n, seed = 1) {
    let s = seed;
    const out = new Float32Array(n);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < n; i += 1) {
        s = (s * 16807) % 2147483647;
        const white = (s / 2147483647) * 2 - 1;
        b0 = 0.99765 * b0 + white * 0.099046;
        b1 = 0.963 * b1 + white * 0.2965164;
        b2 = 0.99 * b2 + white * 1.052691;
        out[i] = b0 + b1 + b2 + white * 0.1848;
    }
    return out;
}

function fadeLoop(samples, fade = 900) {
    const n = samples.length;
    for (let i = 0; i < fade; i += 1) {
        const g = i / fade;
        samples[i] *= g;
        samples[n - 1 - i] *= g;
    }
    return samples;
}

/** Subtelny wiatr – szum lowpass */
function genWind(seconds = 10) {
    const n = Math.floor(SR * seconds);
    const noise = makeNoise(n, 42);
    const out = new Float32Array(n);
    let y = 0;
    for (let i = 0; i < n; i += 1) {
        // soft LFO
        const lfo = 0.55 + 0.45 * Math.sin((i / SR) * 0.35 * Math.PI * 2);
        y = y * 0.97 + noise[i] * 0.03;
        out[i] = clamp(y * 0.22 * lfo);
    }
    return fadeLoop(out);
}

/** Chirp: species = skylark | finch | blackbird */
function paintChirp(out, { t, f, dur, gain = 0.09, wobble = 0.12, trem = 6 }) {
    paintSoftChirp(out, { t, f, dur, gain, wobble, trem, soft: false });
}

/** Miękki, bardziej naturalny śpiew (relaks) – łagodna obwiednia + lekka harmonia */
function paintSoftChirp(out, {
    t, f, dur, gain = 0.06, wobble = 0.08, trem = 4, soft = true
}) {
    const start = Math.floor(t * SR);
    const len = Math.floor(dur * SR);
    const envPow = soft ? 2.4 : 1.6;
    const harmMix = soft ? 0.16 : 0.08;
    for (let i = 0; i < len; i += 1) {
        const p = i / len;
        const env = Math.sin(Math.PI * p) ** envPow;
        const freq = f * (1 + wobble * Math.sin(p * Math.PI * trem));
        const phase = (2 * Math.PI * freq * i) / SR;
        const sample = (Math.sin(phase) + Math.sin(phase * 2) * harmMix) * env * gain;
        const idx = start + i;
        if (idx < out.length) out[idx] = clamp(out[idx] + sample);
    }
}

/** Śpiew ptaków – rzadkie, delikatne chirpy na cichym tle */
function genBirds(seconds = 12) {
    const n = Math.floor(SR * seconds);
    const out = new Float32Array(n);
    const bed = makeNoise(n, 7);
    for (let i = 0; i < n; i += 1) {
        out[i] = bed[i] * 0.012;
    }

    const chirps = [
        { t: 1.2, f: 2100, dur: 0.14 },
        { t: 2.8, f: 2450, dur: 0.11 },
        { t: 4.1, f: 1900, dur: 0.16 },
        { t: 6.5, f: 2600, dur: 0.1 },
        { t: 8.2, f: 2200, dur: 0.13 },
        { t: 10.4, f: 1950, dur: 0.15 }
    ];
    for (const c of chirps) paintChirp(out, c);
    return fadeLoop(out);
}

/**
 * Pole – jedna pętla: wiatr + owady + skowronki / zięby / kosy.
 * Można podmienić CC0 z Pixabay / Freesound (field-sounds.mp3).
 */
function genFieldSounds(seconds = 16) {
    const n = Math.floor(SR * seconds);
    const out = new Float32Array(n);
    const wind = genWind(seconds);
    const insects = genInsects(seconds);
    for (let i = 0; i < n; i += 1) {
        out[i] = clamp(wind[i] * 0.85 + insects[i] * 0.7);
    }

    // Skowronek – wyższe, szybkie frazy
    const skylark = [
        { t: 0.9, f: 2800, dur: 0.18, gain: 0.07, wobble: 0.18, trem: 10 },
        { t: 1.15, f: 3100, dur: 0.12, gain: 0.06, wobble: 0.14, trem: 9 },
        { t: 5.4, f: 2950, dur: 0.16, gain: 0.065, wobble: 0.16, trem: 11 },
        { t: 11.2, f: 3200, dur: 0.14, gain: 0.055, wobble: 0.15, trem: 10 }
    ];
    // Zięba – średnie, rytmiczne
    const finch = [
        { t: 2.4, f: 2300, dur: 0.1, gain: 0.08, wobble: 0.08, trem: 5 },
        { t: 2.55, f: 2500, dur: 0.09, gain: 0.07, wobble: 0.07, trem: 5 },
        { t: 2.7, f: 2400, dur: 0.11, gain: 0.075, wobble: 0.08, trem: 5 },
        { t: 7.8, f: 2350, dur: 0.1, gain: 0.07, wobble: 0.08, trem: 5 },
        { t: 8.0, f: 2550, dur: 0.1, gain: 0.07, wobble: 0.07, trem: 5 },
        { t: 13.5, f: 2450, dur: 0.12, gain: 0.065, wobble: 0.08, trem: 5 }
    ];
    // Kos – niższe, dłuższe frazy
    const blackbird = [
        { t: 3.8, f: 1450, dur: 0.28, gain: 0.08, wobble: 0.1, trem: 3 },
        { t: 4.2, f: 1650, dur: 0.22, gain: 0.07, wobble: 0.09, trem: 3.5 },
        { t: 9.6, f: 1380, dur: 0.3, gain: 0.075, wobble: 0.1, trem: 3 },
        { t: 14.4, f: 1580, dur: 0.24, gain: 0.07, wobble: 0.09, trem: 3.2 }
    ];

    for (const c of [...skylark, ...finch, ...blackbird]) paintChirp(out, c);
    return fadeLoop(out, 1200);
}

/** Ciepły letni wiatr – jaśniejszy, miększy niż pole */
function genWarmWind(seconds = 16) {
    const n = Math.floor(SR * seconds);
    const noise = makeNoise(n, 61);
    const out = new Float32Array(n);
    let y = 0;
    for (let i = 0; i < n; i += 1) {
        const lfo = 0.62 + 0.38 * Math.sin((i / SR) * 0.28 * Math.PI * 2);
        const shimmer = 0.85 + 0.15 * Math.sin((i / SR) * 1.1 * Math.PI * 2);
        y = y * 0.965 + noise[i] * 0.035;
        out[i] = clamp(y * 0.2 * lfo * shimmer);
    }
    return fadeLoop(out);
}

/** Delikatne pszczoły – średnie brzęczenie w tle */
function genBees(seconds = 16) {
    const n = Math.floor(SR * seconds);
    const out = new Float32Array(n);
    for (let i = 0; i < n; i += 1) {
        const t = i / SR;
        const swarm = Math.sin(2 * Math.PI * 265 * t)
            * (0.55 + 0.45 * Math.sin(2 * Math.PI * 3.2 * t));
        const wing = Math.sin(2 * Math.PI * 310 * t)
            * (0.5 + 0.5 * Math.sin(2 * Math.PI * 5.5 * t + 0.7));
        const near = Math.sin(2 * Math.PI * 380 * t)
            * (Math.sin(2 * Math.PI * 0.35 * t) > 0.2 ? 0.35 : 0.12);
        const space = 0.55 + 0.45 * Math.sin(2 * Math.PI * 0.11 * t);
        out[i] = clamp((swarm * 0.028 + wing * 0.022 + near * 0.018) * space);
    }
    return fadeLoop(out);
}

/**
 * Letnia łąka – wiatr + pszczoły + ptaki (legacy / opcjonalna podmiana).
 */
function genSummerMeadow(seconds = 18) {
    const n = Math.floor(SR * seconds);
    const out = new Float32Array(n);
    const wind = genWarmWind(seconds);
    const bees = genBees(seconds);
    const insects = genInsects(seconds);
    for (let i = 0; i < n; i += 1) {
        out[i] = clamp(wind[i] * 0.9 + bees[i] * 1.05 + insects[i] * 0.35);
    }

    const birds = [
        { t: 0.7, f: 2900, dur: 0.16, gain: 0.065, wobble: 0.17, trem: 10 },
        { t: 0.95, f: 3150, dur: 0.12, gain: 0.055, wobble: 0.14, trem: 9 },
        { t: 6.2, f: 3000, dur: 0.15, gain: 0.06, wobble: 0.16, trem: 11 },
        { t: 2.1, f: 2350, dur: 0.09, gain: 0.07, wobble: 0.08, trem: 5 },
        { t: 2.25, f: 2550, dur: 0.09, gain: 0.065, wobble: 0.07, trem: 5 },
        { t: 2.4, f: 2450, dur: 0.1, gain: 0.07, wobble: 0.08, trem: 5 },
        { t: 9.1, f: 2400, dur: 0.1, gain: 0.065, wobble: 0.08, trem: 5 },
        { t: 9.3, f: 2600, dur: 0.09, gain: 0.06, wobble: 0.07, trem: 5 },
        { t: 3.6, f: 1500, dur: 0.26, gain: 0.07, wobble: 0.1, trem: 3 },
        { t: 4.0, f: 1680, dur: 0.2, gain: 0.065, wobble: 0.09, trem: 3.4 },
        { t: 12.4, f: 1420, dur: 0.28, gain: 0.07, wobble: 0.1, trem: 3 },
        { t: 7.5, f: 3400, dur: 0.08, gain: 0.05, wobble: 0.12, trem: 8 },
        { t: 7.65, f: 3600, dur: 0.07, gain: 0.045, wobble: 0.11, trem: 8 },
        { t: 14.8, f: 3500, dur: 0.09, gain: 0.048, wobble: 0.12, trem: 8 },
        { t: 16.2, f: 2700, dur: 0.14, gain: 0.055, wobble: 0.13, trem: 7 }
    ];
    for (const c of birds) paintChirp(out, c);
    return fadeLoop(out, 1400);
}

/**
 * Sam śpiew ptaków – bez wiatru i owadów (główne tło aplikacji).
 * Podmiana: Pixabay / Freesound → birds-only.mp3
 */
function genBirdsOnly(seconds = 18) {
    const n = Math.floor(SR * seconds);
    const out = new Float32Array(n);
    // prawie cisza – zerowy szum tła (czysty śpiew)
    const birds = [
        // skowronek
        { t: 0.8, f: 2900, dur: 0.17, gain: 0.1, wobble: 0.17, trem: 10 },
        { t: 1.05, f: 3150, dur: 0.13, gain: 0.09, wobble: 0.14, trem: 9 },
        { t: 1.25, f: 2750, dur: 0.11, gain: 0.08, wobble: 0.15, trem: 10 },
        { t: 6.0, f: 3000, dur: 0.16, gain: 0.095, wobble: 0.16, trem: 11 },
        { t: 6.25, f: 3300, dur: 0.12, gain: 0.08, wobble: 0.14, trem: 9 },
        // zięba
        { t: 2.2, f: 2350, dur: 0.1, gain: 0.11, wobble: 0.08, trem: 5 },
        { t: 2.35, f: 2550, dur: 0.09, gain: 0.1, wobble: 0.07, trem: 5 },
        { t: 2.5, f: 2450, dur: 0.11, gain: 0.105, wobble: 0.08, trem: 5 },
        { t: 8.9, f: 2400, dur: 0.1, gain: 0.1, wobble: 0.08, trem: 5 },
        { t: 9.1, f: 2600, dur: 0.1, gain: 0.095, wobble: 0.07, trem: 5 },
        { t: 9.3, f: 2500, dur: 0.09, gain: 0.09, wobble: 0.08, trem: 5 },
        // kos
        { t: 3.7, f: 1500, dur: 0.28, gain: 0.11, wobble: 0.1, trem: 3 },
        { t: 4.1, f: 1680, dur: 0.22, gain: 0.1, wobble: 0.09, trem: 3.4 },
        { t: 4.45, f: 1550, dur: 0.18, gain: 0.09, wobble: 0.1, trem: 3 },
        { t: 12.2, f: 1420, dur: 0.3, gain: 0.105, wobble: 0.1, trem: 3 },
        { t: 12.65, f: 1600, dur: 0.2, gain: 0.09, wobble: 0.09, trem: 3.2 },
        // szczygieł
        { t: 7.4, f: 3400, dur: 0.09, gain: 0.08, wobble: 0.12, trem: 8 },
        { t: 7.55, f: 3600, dur: 0.08, gain: 0.075, wobble: 0.11, trem: 8 },
        { t: 14.6, f: 3500, dur: 0.1, gain: 0.08, wobble: 0.12, trem: 8 },
        { t: 15.9, f: 2700, dur: 0.15, gain: 0.09, wobble: 0.13, trem: 7 },
        { t: 16.8, f: 2200, dur: 0.12, gain: 0.085, wobble: 0.1, trem: 6 }
    ];
    for (const c of birds) paintChirp(out, c);
    return fadeLoop(out, 1400);
}

/**
 * Las – ptaki + delikatne szmery natury, bez wiatru (legacy).
 */
function genForestNature(seconds = 20) {
    return genSeasonalForest('summer', seconds);
}

/**
 * Sezonowy las – relaks / podprogowy spokój.
 * Bez wiatru, bez drips/creaks/sztucznych tonów – tylko miękkie tło + ptaki.
 */
function genSeasonalForest(season, seconds = 24) {
    const n = Math.floor(SR * seconds);
    const out = new Float32Array(n);
    const seed = { spring: 71, summer: 77, autumn: 83, winter: 91 }[season] || 77;
    const hush = makeNoise(n, seed);
    // bardzo ciche „powietrze lasu” (brown-ish), nie wiatr
    const bedGain = { spring: 0.01, summer: 0.014, autumn: 0.016, winter: 0.007 }[season] || 0.012;
    const leafRate = { spring: 0.994, summer: 0.991, autumn: 0.99, winter: 0.9965 }[season] || 0.993;
    const leafIn = 1 - leafRate;

    let y = 0;
    let z = 0;
    for (let i = 0; i < n; i += 1) {
        y = y * leafRate + hush[i] * leafIn;
        z = z * 0.997 + y * 0.003;
        // lato/jesień: odrobinę więcej szmeru liści (nadal szum, nie sinus)
        const leafBoost = (season === 'summer' || season === 'autumn') ? 1.2 : 1;
        out[i] = clamp(z * bedGain * leafBoost);
    }

    /** @type {Array<{t:number,f:number,dur:number,gain?:number,wobble?:number,trem?:number}>} */
    let birds = [];
    if (season === 'spring') {
        // świeżość – wiele gatunków, żywe ale miękkie frazy
        birds = [
            { t: 0.8, f: 2850, dur: 0.18, gain: 0.062, wobble: 0.12, trem: 7 },
            { t: 1.15, f: 3050, dur: 0.14, gain: 0.055, wobble: 0.11, trem: 7 },
            { t: 2.4, f: 2280, dur: 0.12, gain: 0.06, wobble: 0.07, trem: 4 },
            { t: 2.65, f: 2480, dur: 0.11, gain: 0.055, wobble: 0.07, trem: 4 },
            { t: 2.9, f: 2380, dur: 0.12, gain: 0.058, wobble: 0.07, trem: 4 },
            { t: 4.2, f: 1520, dur: 0.32, gain: 0.065, wobble: 0.08, trem: 2.6 },
            { t: 4.7, f: 1680, dur: 0.24, gain: 0.055, wobble: 0.07, trem: 2.8 },
            { t: 6.5, f: 3300, dur: 0.1, gain: 0.045, wobble: 0.1, trem: 6 },
            { t: 6.75, f: 3500, dur: 0.09, gain: 0.042, wobble: 0.1, trem: 6 },
            { t: 8.3, f: 2100, dur: 0.16, gain: 0.055, wobble: 0.09, trem: 5 },
            { t: 9.6, f: 2750, dur: 0.15, gain: 0.055, wobble: 0.11, trem: 6 },
            { t: 9.9, f: 2950, dur: 0.12, gain: 0.05, wobble: 0.1, trem: 6 },
            { t: 11.4, f: 2320, dur: 0.11, gain: 0.055, wobble: 0.07, trem: 4 },
            { t: 11.65, f: 2520, dur: 0.1, gain: 0.05, wobble: 0.07, trem: 4 },
            { t: 13.2, f: 1450, dur: 0.3, gain: 0.06, wobble: 0.08, trem: 2.5 },
            { t: 13.7, f: 1600, dur: 0.22, gain: 0.05, wobble: 0.07, trem: 2.7 },
            { t: 15.5, f: 3180, dur: 0.12, gain: 0.048, wobble: 0.11, trem: 7 },
            { t: 17.0, f: 1880, dur: 0.18, gain: 0.05, wobble: 0.09, trem: 4 },
            { t: 18.6, f: 2650, dur: 0.14, gain: 0.052, wobble: 0.1, trem: 5 },
            { t: 20.2, f: 3400, dur: 0.1, gain: 0.042, wobble: 0.1, trem: 6 },
            { t: 21.5, f: 2200, dur: 0.14, gain: 0.05, wobble: 0.08, trem: 4 },
            { t: 22.6, f: 1580, dur: 0.26, gain: 0.055, wobble: 0.07, trem: 2.6 }
        ];
    } else if (season === 'summer') {
        // ciepło – spokojniejsze frazy + miękkie tło liści
        birds = [
            { t: 1.0, f: 2700, dur: 0.18, gain: 0.055, wobble: 0.11, trem: 6 },
            { t: 1.35, f: 2920, dur: 0.14, gain: 0.048, wobble: 0.1, trem: 6 },
            { t: 3.2, f: 2200, dur: 0.12, gain: 0.055, wobble: 0.07, trem: 4 },
            { t: 3.45, f: 2380, dur: 0.11, gain: 0.05, wobble: 0.07, trem: 4 },
            { t: 5.0, f: 1480, dur: 0.34, gain: 0.06, wobble: 0.08, trem: 2.4 },
            { t: 5.55, f: 1620, dur: 0.24, gain: 0.05, wobble: 0.07, trem: 2.6 },
            { t: 7.8, f: 3100, dur: 0.11, gain: 0.042, wobble: 0.1, trem: 6 },
            { t: 9.4, f: 1950, dur: 0.16, gain: 0.05, wobble: 0.09, trem: 4 },
            { t: 11.2, f: 2550, dur: 0.14, gain: 0.052, wobble: 0.09, trem: 5 },
            { t: 11.5, f: 2700, dur: 0.12, gain: 0.048, wobble: 0.09, trem: 5 },
            { t: 13.6, f: 1400, dur: 0.3, gain: 0.055, wobble: 0.08, trem: 2.4 },
            { t: 14.1, f: 1550, dur: 0.22, gain: 0.048, wobble: 0.07, trem: 2.5 },
            { t: 16.4, f: 3000, dur: 0.13, gain: 0.045, wobble: 0.1, trem: 6 },
            { t: 18.2, f: 2300, dur: 0.12, gain: 0.05, wobble: 0.07, trem: 4 },
            { t: 18.45, f: 2450, dur: 0.11, gain: 0.048, wobble: 0.07, trem: 4 },
            { t: 20.5, f: 1750, dur: 0.18, gain: 0.048, wobble: 0.09, trem: 3.5 },
            { t: 22.2, f: 2800, dur: 0.15, gain: 0.05, wobble: 0.1, trem: 5 }
        ];
    } else if (season === 'autumn') {
        // spokój – rzadsze, niższe frazy + szelest
        birds = [
            { t: 1.4, f: 2000, dur: 0.2, gain: 0.048, wobble: 0.08, trem: 3.2 },
            { t: 3.8, f: 1500, dur: 0.36, gain: 0.055, wobble: 0.07, trem: 2.2 },
            { t: 4.4, f: 1640, dur: 0.26, gain: 0.048, wobble: 0.06, trem: 2.4 },
            { t: 7.2, f: 2250, dur: 0.14, gain: 0.045, wobble: 0.07, trem: 3.5 },
            { t: 10.0, f: 1720, dur: 0.22, gain: 0.045, wobble: 0.08, trem: 3 },
            { t: 12.8, f: 1420, dur: 0.32, gain: 0.05, wobble: 0.07, trem: 2.2 },
            { t: 15.6, f: 2100, dur: 0.16, gain: 0.042, wobble: 0.07, trem: 3.2 },
            { t: 18.4, f: 1580, dur: 0.28, gain: 0.048, wobble: 0.06, trem: 2.3 },
            { t: 21.2, f: 1900, dur: 0.18, gain: 0.042, wobble: 0.08, trem: 3 }
        ];
    } else {
        // zima – natura w spoczynku, bardzo rzadko
        birds = [
            { t: 3.5, f: 1650, dur: 0.26, gain: 0.032, wobble: 0.06, trem: 2.2 },
            { t: 9.0, f: 1380, dur: 0.34, gain: 0.035, wobble: 0.05, trem: 2 },
            { t: 15.5, f: 1800, dur: 0.2, gain: 0.03, wobble: 0.07, trem: 2.5 },
            { t: 21.0, f: 1500, dur: 0.28, gain: 0.032, wobble: 0.05, trem: 2.1 }
        ];
    }

    for (const c of birds) paintSoftChirp(out, { ...c, soft: true });
    return fadeLoop(out, 2400);
}

/** Rechot żab – niskie „croak” (wieczór) */
function genFrogs(seconds = 10) {
    const n = Math.floor(SR * seconds);
    const out = new Float32Array(n);
    const croaks = [0.8, 2.6, 4.3, 6.1, 7.9];
    for (const t0 of croaks) {
        const start = Math.floor(t0 * SR);
        const len = Math.floor(0.28 * SR);
        for (let i = 0; i < len; i += 1) {
            const p = i / len;
            const env = Math.sin(Math.PI * Math.min(1, p * 1.4)) * Math.exp(-p * 2.2);
            const f = 180 + 40 * Math.sin(p * 18);
            const buzz = Math.sin((2 * Math.PI * f * i) / SR)
                * (0.55 + 0.45 * Math.sin((2 * Math.PI * 28 * i) / SR));
            const idx = start + i;
            if (idx < n) out[idx] = clamp(out[idx] + buzz * env * 0.11);
        }
    }
    // lekki nocny szum
    const noise = makeNoise(n, 99);
    for (let i = 0; i < n; i += 1) out[i] = clamp(out[i] + noise[i] * 0.008);
    return fadeLoop(out);
}

/** Brzęczenie owadów – wysokie, miękkie */
function genInsects(seconds = 10) {
    const n = Math.floor(SR * seconds);
    const out = new Float32Array(n);
    for (let i = 0; i < n; i += 1) {
        const t = i / SR;
        const shimmer = Math.sin(2 * Math.PI * 4200 * t)
            * (0.4 + 0.6 * Math.sin(2 * Math.PI * 7.3 * t));
        const cricket = Math.sin(2 * Math.PI * 5100 * t)
            * (Math.sin(2 * Math.PI * 14 * t) > 0.65 ? 1 : 0.15);
        const lfo = 0.6 + 0.4 * Math.sin(2 * Math.PI * 0.2 * t);
        out[i] = clamp((shimmer * 0.035 + cricket * 0.028) * lfo);
    }
    return fadeLoop(out);
}

mkdirSync(OUT, { recursive: true });

const springBirds = genSeasonalForest('spring');
const summerBirds = genSeasonalForest('summer');
const autumnBirds = genSeasonalForest('autumn');
const winterBirds = genSeasonalForest('winter');

const files = [
    ['birds.wav', genBirds()],
    ['wind.wav', genWind()],
    ['frogs.wav', genFrogs()],
    ['insects.wav', genInsects()],
    ['field-sounds.wav', genFieldSounds()],
    ['summer-meadow.wav', genSummerMeadow()],
    ['birds-only.wav', genBirdsOnly()],
    ['forest-nature.wav', genForestNature()],
    ['spring-forest.wav', springBirds],
    ['summer-forest.wav', summerBirds],
    ['autumn-forest.wav', autumnBirds],
    ['winter-forest.wav', winterBirds],
    // App paths (climateAtmosphere.js): seasonal *-birds.*
    ['spring-birds.wav', springBirds],
    ['summer-birds.wav', summerBirds],
    ['autumn-birds.wav', autumnBirds],
    ['winter-birds.wav', winterBirds]
];

function resolveFfmpeg() {
    try {
        const mod = require('ffmpeg-static');
        if (mod && existsSync(mod)) return mod;
    } catch {
        /* optional – mp3 files can be committed / converted separately */
    }
    const which = spawnSync(process.platform === 'win32' ? 'where' : 'which', ['ffmpeg'], {
        encoding: 'utf8'
    });
    if (which.status === 0) {
        const line = String(which.stdout || '')
            .split(/\r?\n/)
            .map((s) => s.trim())
            .find(Boolean);
        if (line) return line;
    }
    return null;
}

function wavToMp3(wavPath, mp3Path, ffmpegBin) {
    const r = spawnSync(
        ffmpegBin,
        ['-y', '-i', wavPath, '-codec:a', 'libmp3lame', '-qscale:a', '6', '-ac', '1', mp3Path],
        { encoding: 'utf8' }
    );
    return r.status === 0;
}

for (const [name, samples] of files) {
    const path = join(OUT, name);
    writeWav(path, samples);
    console.log('OK', name, `${(samples.length / SR).toFixed(1)}s`);
}

const ffmpegBin = resolveFfmpeg();
if (ffmpegBin) {
    for (const base of [
        'birds', 'wind', 'frogs', 'insects', 'field-sounds', 'summer-meadow',
        'birds-only', 'forest-nature',
        'spring-forest', 'summer-forest', 'autumn-forest', 'winter-forest',
        'spring-birds', 'summer-birds', 'autumn-birds', 'winter-birds'
    ]) {
        const wavPath = join(OUT, `${base}.wav`);
        const mp3Path = join(OUT, `${base}.mp3`);
        if (wavToMp3(wavPath, mp3Path, ffmpegBin)) console.log('OK', `${base}.mp3`);
        else console.warn('SKIP mp3', base);
    }
} else {
    console.warn('SKIP mp3 – zainstaluj ffmpeg lub: npm i -D ffmpeg-static');
}

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

console.log('Wrote', OUT);
