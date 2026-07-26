/**
 * ETAP 33E — Living Region AI
 * Codziennie: Region Pulse 0–100 + dokładnie jedno krótkie zdanie.
 *
 * Nie chatbot · nie popup · nie okno AI · nie zmienia wyglądu aplikacji.
 * autoApply=false · raport: docs/living-region/latest.md
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { getCurrentSeason } from '../data/seasonCalendar.js';
import { createModulePolicy } from './policy.js';

export const POLICY = createModulePolicy({
    userFacing: false,
    maxSentences: 1,
    role: 'living-region-ai',
    etapa: '33E'
});

export const PULSE_SIGNAL_IDS = Object.freeze([
    'season',
    'weather',
    'weekday',
    'openProducers',
    'regionalEvents',
    'dataFreshness',
    'location',
    'userActivity'
]);

const WEEKDAY_NAMES = Object.freeze([
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
]);

/** Proste wydarzenia sezonowe (bez sieci) — impulsy regionu */
const SEASONAL_EVENTS = Object.freeze([
    { id: 'asparagus', months: [4, 5, 6], label: 'sezon szparagów', boost: 12 },
    { id: 'berries', months: [6, 7, 8], label: 'sezon jagód', boost: 10 },
    { id: 'harvest', months: [8, 9, 10], label: 'zbiory / jabłka', boost: 11 },
    { id: 'pumpkin', months: [9, 10, 11], label: 'dynie i jesień', boost: 9 },
    { id: 'christmasMarket', months: [12], label: 'zimowy klimat rynków', boost: 8 },
    { id: 'sundayMarket', weekdays: [0], label: 'niedzielny rytm rynku', boost: 10 },
    { id: 'saturdayHof', weekdays: [6], label: 'sobotnie gospodarstwa', boost: 9 }
]);

function clamp(n) {
    return Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
}

function num(...vals) {
    for (const v of vals) {
        if (typeof v === 'number' && !Number.isNaN(v)) return v;
    }
    return null;
}

function loadJson(root, rel) {
    const full = join(root, rel);
    if (!existsSync(full)) return null;
    try {
        return JSON.parse(readFileSync(full, 'utf8'));
    } catch {
        return null;
    }
}

/**
 * Wymusza dokładnie jedno zdanie (pierwsze zakończone . ! ?).
 * @param {string} text
 */
export function enforceOneSentence(text) {
    const raw = String(text || '').replace(/\s+/g, ' ').trim();
    if (!raw) return '';
    const match = raw.match(/^(.+?[.!?])(?:\s|$)/);
    let sentence = match ? match[1].trim() : raw;
    // jeśli brak interpunkcji — dodaj kropkę
    if (!/[.!?]$/.test(sentence)) sentence = `${sentence}.`;
    // obetnij ewentualny ogon po pierwszym zdaniu
    const again = sentence.match(/^(.+?[.!?])/);
    return again ? again[1].trim() : sentence;
}

function scoreSeason(season) {
    const map = { spring: 86, summer: 92, autumn: 88, winter: 70 };
    return map[season] ?? 75;
}

function scoreWeather(weather) {
    if (!weather) return { score: 52, available: false };
    const w = String(weather).toLowerCase();
    const map = {
        mild: 90, warm: 92, hot: 74, cool: 80, cold: 60, rain: 55, storm: 38, snow: 62, fog: 58
    };
    for (const [k, v] of Object.entries(map)) {
        if (w.includes(k)) return { score: v, available: true, kind: k };
    }
    return { score: 72, available: true, kind: w };
}

function scoreWeekday(weekday) {
    if (weekday === 0) return 90;
    if (weekday === 6) return 86;
    if (weekday === 5) return 80;
    return 72;
}

function scoreOpenProducers(openTotal, openFarmers) {
    const total = Number(openTotal) || 0;
    const farmers = Number(openFarmers) || 0;
    if (total <= 0 && farmers <= 0) return 42;
    return clamp(48 + farmers * 14 + Math.min(28, total * 5));
}

function activeEvents(now = new Date()) {
    const month = now.getMonth() + 1;
    const weekday = now.getDay();
    return SEASONAL_EVENTS.filter((e) => {
        if (Array.isArray(e.months) && !e.months.includes(month)) return false;
        if (Array.isArray(e.weekdays) && !e.weekdays.includes(weekday)) return false;
        return true;
    });
}

function scoreEvents(events) {
    if (!events.length) return { score: 48, labels: [] };
    const boost = events.reduce((a, e) => a + (e.boost || 0), 0);
    return {
        score: clamp(55 + Math.min(40, boost)),
        labels: events.map((e) => e.label)
    };
}

/**
 * Świeżość danych diagnostycznych (im nowsze, tym wyżej).
 * @param {object} sources
 * @param {Date} now
 */
function scoreDataFreshness(sources, now = new Date()) {
    const stamps = [
        sources.regionalIntelligence?.generatedAt,
        sources.regionalBrain?.generatedAt,
        sources.health?.generatedAt,
        sources.trust?.generatedAt,
        sources.livingBrand?.generatedAt
    ].filter(Boolean);

    if (!stamps.length) return { score: 50, ageHours: null, note: 'brak znaczników świeżości' };

    let bestAgeH = Infinity;
    for (const s of stamps) {
        const t = Date.parse(s);
        if (!Number.isFinite(t)) continue;
        const ageH = (now.getTime() - t) / (3600 * 1000);
        if (ageH < bestAgeH) bestAgeH = ageH;
    }
    if (!Number.isFinite(bestAgeH)) return { score: 50, ageHours: null, note: 'nieparsowalne daty' };

    let score = 40;
    if (bestAgeH <= 24) score = 92;
    else if (bestAgeH <= 72) score = 78;
    else if (bestAgeH <= 168) score = 62;
    else score = 45;

    return {
        score,
        ageHours: Math.round(bestAgeH * 10) / 10,
        note: `najświeższy sygnał ~${Math.round(bestAgeH)} h temu`
    };
}

function scoreLocation(hasLocation) {
    return hasLocation ? 88 : 58;
}

function scoreUserActivity(sources) {
    const taste = sources.userTaste || sources.tasteProfile || null;
    const profile = taste?.tasteProfile || taste;
    const ret = num(taste?.returnProbability, profile?.returnProbability);
    const conf = num(profile?.confidence, taste?.confidence);
    const signals = num(profile?.signalCount, taste?.signalCount, 0) ?? 0;

    if (ret == null && conf == null && signals <= 0) {
        return { score: 48, note: 'brak lokalnej aktywności (cold start)' };
    }
    let score = 50;
    if (signals >= 5) score += 12;
    if (signals >= 20) score += 10;
    if (conf != null) score += Math.round(conf * 0.15);
    if (ret != null) score += Math.round(ret * 0.2);
    return { score: clamp(score), note: `aktywność: signals=${signals}, return=${ret ?? '—'}, conf=${conf ?? '—'}` };
}

/**
 * @param {object} sources
 * @param {Date} [now]
 */
export function collectPulseSignals(sources = {}, now = new Date()) {
    const regional = sources.regionalIntelligence || null;
    const brain = sources.regionalBrain || null;
    const sig = regional?.recommendation?.signals
        || brain?.signals
        || {};

    const season = sig.season || getCurrentSeason(now);
    const weather = sig.weather || sources.weather?.condition || null;
    const weekday = typeof sig.weekday === 'number' ? sig.weekday : now.getDay();
    const openCounts = sig.openCounts || {};
    const openFarmers = num(openCounts.farmers, 0) ?? 0;
    const openTotal = Object.values(openCounts).reduce((a, b) => a + (Number(b) || 0), 0)
        || num(sig.openTotal, 0)
        || 0;
    const hasLocation = Boolean(sig.hasLocation || sources.location?.available || brain?.signals?.hasLocation);
    const events = activeEvents(now);
    const freshness = scoreDataFreshness(sources, now);
    const activity = scoreUserActivity(sources);
    const weatherScored = scoreWeather(weather);
    const eventScored = scoreEvents(events);

    return {
        now: now.toISOString(),
        season,
        weather,
        weatherKind: weatherScored.kind || null,
        weatherAvailable: weatherScored.available,
        weekday,
        weekdayName: WEEKDAY_NAMES[weekday] || String(weekday),
        openFarmers,
        openTotal,
        openCounts,
        events: eventScored.labels,
        eventIds: events.map((e) => e.id),
        hasLocation,
        dataFreshnessHours: freshness.ageHours,
        dataFreshnessNote: freshness.note,
        userActivityNote: activity.note,
        dimensions: {
            season: { score: scoreSeason(season), weight: 0.12 },
            weather: { score: weatherScored.score, weight: 0.14 },
            weekday: { score: scoreWeekday(weekday), weight: 0.10 },
            openProducers: { score: scoreOpenProducers(openTotal, openFarmers), weight: 0.18 },
            regionalEvents: { score: eventScored.score, weight: 0.12 },
            dataFreshness: { score: freshness.score, weight: 0.12 },
            location: { score: scoreLocation(hasLocation), weight: 0.10 },
            userActivity: { score: activity.score, weight: 0.12 }
        }
    };
}

/**
 * @param {ReturnType<typeof collectPulseSignals>['dimensions']} dimensions
 */
export function computeRegionPulse(dimensions) {
    let wSum = 0;
    let acc = 0;
    for (const id of PULSE_SIGNAL_IDS) {
        const d = dimensions[id];
        if (!d) continue;
        wSum += d.weight;
        acc += d.score * d.weight;
    }
    if (wSum <= 0) return 0;
    return clamp(acc / wSum);
}

function pulseBand(score) {
    if (score >= 88) return 'exceptional';
    if (score >= 75) return 'vivid';
    if (score >= 60) return 'alive';
    if (score >= 45) return 'quiet';
    return 'dormant';
}

/**
 * Dokładnie jedno zdanie — katalog wg pasma + kontekstu.
 * @param {number} pulse
 * @param {ReturnType<typeof collectPulseSignals>} signals
 */
export function composePulseSentence(pulse, signals) {
    const band = pulseBand(pulse);
    const open = signals.openFarmers > 0 || signals.openTotal > 0;
    const weekend = signals.weekday === 0 || signals.weekday === 6;
    const warm = ['warm', 'mild', 'hot'].includes(String(signals.weatherKind || ''));
    const eventHint = signals.events?.[0] || null;

    /** @type {Record<string, string[]>} */
    const pool = {
        exceptional: [
            'Dziś region żyje wyjątkowo intensywnie — to dobry dzień na odwiedzenie lokalnych gospodarstw.',
            'Puls regionu jest dziś bardzo wysoki: warto wyjść i poczuć lokalny smak w terenie.',
            'Region bije dziś mocnym rytmem — gospodarstwa i sklepiki zapraszają do odkrywania.'
        ],
        vivid: [
            'Region jest dziś wyraźnie żywy — krótka wizyta u lokalnego producenta ma sens.',
            'Dziś okolica tętni spokojną aktywnością: dobry moment na świeże produkty z regionu.',
            'Puls regionu jest wysoki — mapa lokalnych smaków zasługuje dziś na uwagę.'
        ],
        alive: [
            'Region żyje dziś miarowym rytmem — spokojna wizyta w okolicy będzie udana.',
            'Jest dobry dzień, by zajrzeć do lokalnych miejsc i poczuć klimat regionu.',
            'Puls regionu jest solidny: warto sprawdzić, co dziś oferują pobliskie gospodarstwa.'
        ],
        quiet: [
            'Region oddycha dziś ciszej — to dobry czas na spokojne, świadome odkrywanie smaków.',
            'Puls regionu jest umiarkowany: nawet krótka lokalna wizyta może być wartościowa.',
            'Dziś okolica jest spokojniejsza — idealny moment na spokojny spacer między lokalnymi adresami.'
        ],
        dormant: [
            'Region jest dziś wyciszony — zostań blisko domu i wróć do mapy, gdy okolica się obudzi.',
            'Puls regionu jest niski: dziś wystarczy spokojne planowanie kolejnej lokalnej wizyty.',
            'Okolica odpoczywa — zachowaj spokój i wróć do regionalnych smaków innym razem.'
        ]
    };

    let candidates = pool[band] || pool.alive;

    // lekkie dopasowanie (nadal jedno zdanie z puli)
    if (band === 'exceptional' || band === 'vivid') {
        if (open && warm) {
            candidates = [
                'Dziś region żyje wyjątkowo intensywnie — to dobry dzień na odwiedzenie lokalnych gospodarstw.',
                ...candidates
            ];
        } else if (weekend && open) {
            candidates = [
                'Weekendowy rytm regionu jest dziś wyraźny — lokalne gospodarstwa zasługują na wizytę.',
                ...candidates
            ];
        } else if (eventHint) {
            candidates = [
                `Dziś region pulsuje mocniej dzięki klimatowi „${eventHint}” — warto zajrzeć do lokalnych producentów.`,
                ...candidates
            ];
        }
    }

    // stabilny wybór dnia (nie los — deterministyczny)
    const dayKey = `${signals.weekday}-${signals.season}-${Math.round(pulse)}`;
    let hash = 0;
    for (let i = 0; i < dayKey.length; i += 1) hash = (hash + dayKey.charCodeAt(i) * (i + 1)) % 997;
    const picked = candidates[hash % candidates.length];
    return enforceOneSentence(picked);
}

/**
 * @param {object} sources
 * @param {object} [meta]
 */
export function buildLivingRegionAiReport(sources = {}, meta = {}) {
    const now = meta.now instanceof Date ? meta.now : new Date();
    const day = meta.day || now.toISOString().slice(0, 10);
    const signals = collectPulseSignals(sources, now);
    const regionPulse = computeRegionPulse(signals.dimensions);
    const sentence = composePulseSentence(regionPulse, signals);
    const band = pulseBand(regionPulse);

    const dimensions = PULSE_SIGNAL_IDS.map((id) => ({
        id,
        score: signals.dimensions[id].score,
        weight: signals.dimensions[id].weight
    }));

    // twarda gwarancja: jedno zdanie
    const sentenceCount = (sentence.match(/[.!?]/g) || []).length;

    return {
        id: `living-region-ai-${day}`,
        title: 'Living Region AI — Region Pulse',
        etapa: '33E',
        generatedAt: new Date().toISOString(),
        day,
        reason: meta.reason || 'cli-living-region-ai',
        policy: { ...POLICY },
        regionPulse,
        band,
        sentence,
        sentenceCount,
        signals: {
            season: signals.season,
            weather: signals.weather,
            weatherKind: signals.weatherKind,
            weekday: signals.weekday,
            weekdayName: signals.weekdayName,
            openFarmers: signals.openFarmers,
            openTotal: signals.openTotal,
            openCounts: signals.openCounts,
            events: signals.events,
            hasLocation: signals.hasLocation,
            dataFreshnessHours: signals.dataFreshnessHours,
            dataFreshnessNote: signals.dataFreshnessNote,
            userActivityNote: signals.userActivityNote
        },
        dimensions,
        notes: [
            'Nie chatbot · nie popup · nie okno AI.',
            'Nie zmienia wyglądu aplikacji.',
            'Dokładnie jedno zdanie dziennie.',
            'autoApply=false'
        ]
    };
}

/**
 * @param {ReturnType<typeof buildLivingRegionAiReport>} report
 */
export function livingRegionAiToMarkdown(report) {
    const lines = [];
    lines.push('# Living Region AI — Region Pulse');
    lines.push('');
    lines.push(`**Dzień:** ${report.day}`);
    lines.push(`**Wygenerowano:** ${report.generatedAt}`);
    lines.push(`**Etap:** ${report.etapa}`);
    lines.push(`**Powód:** ${report.reason}`);
    lines.push('');
    lines.push('## Polityka');
    lines.push('');
    lines.push('- **autoApply:** false');
    lines.push('- Nie chatbot · nie popup · nie okno AI');
    lines.push('- Nie zmienia wyglądu aplikacji');
    lines.push('- **Max 1 zdanie**');
    lines.push('');
    lines.push('## Region Pulse');
    lines.push('');
    lines.push(`# **${report.regionPulse} / 100**`);
    lines.push('');
    lines.push(`**Pasmo:** ${report.band}`);
    lines.push('');
    lines.push('## Zdanie dnia');
    lines.push('');
    lines.push(`> ${report.sentence}`);
    lines.push('');
    lines.push(`_(licznik zdań: ${report.sentenceCount} — musi być 1)_`);
    lines.push('');
    lines.push('## Sygnały');
    lines.push('');
    lines.push('| Sygnał | Wartość |');
    lines.push('|--------|---------|');
    const s = report.signals;
    lines.push(`| Sezon | ${s.season} |`);
    lines.push(`| Pogoda | ${s.weather ?? '—'} (${s.weatherKind ?? 'n/a'}) |`);
    lines.push(`| Dzień tygodnia | ${s.weekdayName} (${s.weekday}) |`);
    lines.push(`| Otwarte (farmers / total) | ${s.openFarmers} / ${s.openTotal} |`);
    lines.push(`| Wydarzenia regionalne | ${s.events?.length ? s.events.join(', ') : '—'} |`);
    lines.push(`| Świeżość danych | ${s.dataFreshnessNote} |`);
    lines.push(`| Lokalizacja | ${s.hasLocation ? 'tak' : 'nie'} |`);
    lines.push(`| Aktywność użytkownika | ${s.userActivityNote} |`);
    lines.push('');
    lines.push('## Wymiary Pulse');
    lines.push('');
    lines.push('| Wymiar | Score | Waga |');
    lines.push('|--------|------:|-----:|');
    for (const d of report.dimensions) {
        lines.push(`| ${d.id} | ${d.score} | ${d.weight} |`);
    }
    lines.push('');
    lines.push('## Notatki');
    lines.push('');
    for (const n of report.notes || []) lines.push(`- ${n}`);
    lines.push('');
    return lines.join('\n');
}

/**
 * @param {string} root
 */
export function loadLivingRegionSources(root) {
    const tasteMdOnly = null; // profil smaku jest MD; opcjonalny JSON snapshot
    return {
        regionalIntelligence: loadJson(root, 'docs/regional-intelligence/latest.json'),
        regionalBrain: loadJson(root, 'docs/intelligence/latest.json'),
        health: loadJson(root, 'docs/health/latest.json'),
        trust: loadJson(root, 'docs/trust/latest.json'),
        livingBrand: loadJson(root, 'docs/living-brand/latest.json'),
        userTaste: loadJson(root, 'docs/intelligence/learning-snapshot.json'),
        tasteProfile: tasteMdOnly,
        emotion: loadJson(root, 'docs/emotion/latest.json')
    };
}

/**
 * @param {string} root
 * @param {object} [options]
 */
export function runLivingRegionAi(root, options = {}) {
    const sources = options.sources || loadLivingRegionSources(root);
    const report = buildLivingRegionAiReport(sources, {
        day: options.day,
        reason: options.reason || 'cli-living-region-ai',
        now: options.now
    });
    // twardy assert jednozdaniowości
    report.sentence = enforceOneSentence(report.sentence);
    report.sentenceCount = (report.sentence.match(/[.!?]/g) || []).length;

    const md = livingRegionAiToMarkdown(report);
    const outDir = join(root, 'docs', 'living-region');
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'latest.md'), md, 'utf8');
    writeFileSync(join(outDir, 'latest.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    writeFileSync(join(outDir, `${report.day}.md`), md, 'utf8');
    return { report, md, outDir };
}

export default {
    POLICY,
    PULSE_SIGNAL_IDS,
    enforceOneSentence,
    collectPulseSignals,
    computeRegionPulse,
    composePulseSentence,
    buildLivingRegionAiReport,
    livingRegionAiToMarkdown,
    loadLivingRegionSources,
    runLivingRegionAi
};
