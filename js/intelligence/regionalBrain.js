/**
 * ETAP 33A — Regional Intelligence Core (Regional Brain)
 * Codzienna synteza sygnałów regionu → Region Score 0–100.
 *
 * Polityka: autoApply=false · autoFix=false · bez chatbota · bez UI.
 * Nie zmienia aplikacji — tylko raport docs/intelligence/*.
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { getCurrentSeason } from '../data/seasonCalendar.js';
import { createModulePolicy } from './policy.js';

export const POLICY = createModulePolicy({
    userFacing: false,
    newScreens: false,
    role: 'regional-brain',
    focus: 'daily-region-score',
    etapa: '33A'
});

export const SIGNAL_IDS = Object.freeze([
    'dayPart',
    'weekday',
    'season',
    'weather',
    'location',
    'openFarms',
    'placeHistory',
    'gps',
    'healthMonitor',
    'brandProtection',
    'productBrain',
    'selfReflection'
]);

const WEEKDAY_NAMES = Object.freeze([
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
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

/**
 * @param {Date} [now]
 * @returns {'morning'|'midday'|'afternoon'|'evening'|'night'}
 */
export function getDayPart(now = new Date()) {
    const h = now.getHours();
    if (h >= 5 && h < 11) return 'morning';
    if (h >= 11 && h < 14) return 'midday';
    if (h >= 14 && h < 18) return 'afternoon';
    if (h >= 18 && h < 22) return 'evening';
    return 'night';
}

/**
 * @param {string|null|undefined} weather
 */
function scoreWeather(weather) {
    if (!weather) return { score: 55, available: false, note: 'brak danych pogody' };
    const w = String(weather).toLowerCase();
    const map = {
        mild: 88,
        warm: 90,
        hot: 72,
        cool: 78,
        cold: 62,
        rain: 58,
        storm: 40,
        snow: 65,
        fog: 60
    };
    for (const [key, val] of Object.entries(map)) {
        if (w.includes(key)) {
            return { score: val, available: true, note: `pogoda: ${key}` };
        }
    }
    return { score: 70, available: true, note: `pogoda: ${w}` };
}

function scoreDayPart(dayPart) {
    const map = {
        morning: 86,
        midday: 80,
        afternoon: 82,
        evening: 84,
        night: 48
    };
    return map[dayPart] ?? 70;
}

function scoreWeekday(weekday) {
    // 0 = niedziela — rynek / hof; weekend lekko wyżej dla wizyt
    if (weekday === 0) return 88;
    if (weekday === 6) return 84;
    if (weekday >= 1 && weekday <= 5) return 76;
    return 70;
}

function scoreSeason(season) {
    const map = { spring: 86, summer: 90, autumn: 88, winter: 72 };
    return map[season] ?? 75;
}

/**
 * Zbiera sygnały z czasu + docs diagnostycznych (bez UI / bez sieci).
 * @param {object} sources
 * @param {Date} [now]
 */
export function collectSignals(sources = {}, now = new Date()) {
    const regional = sources.regionalIntelligence || sources.regional || null;
    const rec = regional?.recommendation || regional?.recommendations?.[0] || null;
    const sig = rec?.signals || {};

    const dayPart = getDayPart(now);
    const weekday = now.getDay();
    const season = getCurrentSeason(now);

    const weather = sig.weather || sources.weather?.condition || sources.weather?.label || null;
    const weatherSource = sig.weatherSource || sources.weather?.source || null;

    const hasLocation = Boolean(
        sig.hasLocation
        || sources.location?.available
        || sources.gps?.available
        || (typeof sources.location?.lat === 'number' && typeof sources.location?.lng === 'number')
    );

    const openCounts = sig.openCounts || sources.openFarms?.counts || null;
    const openFarmers = num(openCounts?.farmers, sources.openFarms?.farmers, 0) ?? 0;
    const openTotal = openCounts
        ? Object.values(openCounts).reduce((a, b) => a + (Number(b) || 0), 0)
        : num(sources.openFarms?.total, openFarmers) ?? 0;

    const placeHistory = sources.placeHistory || null;
    const placeEntries = num(
        placeHistory?.count,
        placeHistory?.entries?.length,
        placeHistory?.summary?.count,
        Array.isArray(placeHistory) ? placeHistory.length : null
    );

    const health = sources.health || sources.healthMonitor || null;
    const brandProtection = sources.brandProtection || null;
    const productBrain = sources.productBrain || sources.brain || null;
    const selfReflection = sources.selfReflection || sources.reflect || null;

    return {
        now: now.toISOString(),
        dayPart,
        weekday,
        weekdayName: WEEKDAY_NAMES[weekday] || String(weekday),
        season,
        weather,
        weatherSource,
        weatherAvailable: Boolean(weather),
        hasLocation,
        gpsAvailable: hasLocation || Boolean(sources.gps?.available),
        openCounts: openCounts || { farmers: openFarmers },
        openFarmers,
        openTotal,
        placeHistoryCount: placeEntries,
        healthOverall: num(health?.overall, health?.scores?.overall),
        healthUx: num(health?.scores?.ux),
        healthPerf: num(health?.scores?.performance),
        healthMobile: num(health?.scores?.mobile),
        brandStatus: brandProtection?.status || null,
        brandFail: num(brandProtection?.summary?.fail, 0) ?? 0,
        brandWarn: num(brandProtection?.summary?.warning, 0) ?? 0,
        brainScore: num(productBrain?.brainScore, productBrain?.productScore),
        reflectionOverall: num(selfReflection?.scores?.overall, selfReflection?.overall),
        reflectionReturn: num(selfReflection?.scores?.returnScore),
        regionalTipId: rec?.id || null,
        regionalTipScore: num(rec?.score)
    };
}

/**
 * Ocena każdego sygnału 0–100 (+ waga w Region Score).
 * @param {ReturnType<typeof collectSignals>} signals
 */
export function scoreSignals(signals) {
    const weather = scoreWeather(signals.weather);

    let openScore = 50;
    if (signals.openTotal > 0 || signals.openFarmers > 0) {
        openScore = clamp(55 + signals.openFarmers * 12 + Math.min(20, signals.openTotal * 4));
    }

    let placeScore = 52;
    if (signals.placeHistoryCount != null && signals.placeHistoryCount > 0) {
        placeScore = clamp(60 + Math.min(30, signals.placeHistoryCount * 3));
    } else {
        placeScore = 58; // brak dumpa historii — neutralny kredyt regionu (nie kara)
    }

    const locationScore = signals.hasLocation ? 90 : 62;
    const gpsScore = signals.gpsAvailable ? 88 : 60;

    const healthScore = signals.healthOverall != null
        ? clamp(signals.healthOverall)
        : 70;

    let brandScore = 80;
    if (signals.brandStatus === 'PASS' || signals.brandStatus === 'OK') brandScore = 96;
    else if (signals.brandStatus === 'WARNING') {
        brandScore = clamp(88 - (signals.brandWarn || 0) * 2);
    } else if (signals.brandStatus === 'FAIL') {
        brandScore = clamp(40 - (signals.brandFail || 0) * 8);
    } else {
        brandScore = 72;
    }

    const brainScore = signals.brainScore != null ? clamp(signals.brainScore) : 72;
    const reflectScore = signals.reflectionOverall != null
        ? clamp(signals.reflectionOverall)
        : 72;

    /** @type {Record<string, { score: number, weight: number, note: string }>} */
    const dimensions = {
        dayPart: {
            score: scoreDayPart(signals.dayPart),
            weight: 0.06,
            note: `pora dnia: ${signals.dayPart}`
        },
        weekday: {
            score: scoreWeekday(signals.weekday),
            weight: 0.05,
            note: `dzień: ${signals.weekdayName}`
        },
        season: {
            score: scoreSeason(signals.season),
            weight: 0.08,
            note: `sezon: ${signals.season}`
        },
        weather: {
            score: weather.score,
            weight: 0.08,
            note: weather.note
        },
        location: {
            score: locationScore,
            weight: 0.08,
            note: signals.hasLocation ? 'lokalizacja znana' : 'brak lokalizacji użytkownika (CLI/proxy)'
        },
        openFarms: {
            score: openScore,
            weight: 0.10,
            note: `otwarte gospodarstwa/sklepy: farmers=${signals.openFarmers}, total≈${signals.openTotal}`
        },
        placeHistory: {
            score: placeScore,
            weight: 0.07,
            note: signals.placeHistoryCount != null
                ? `historia lokalna: ${signals.placeHistoryCount}`
                : 'historia lokalna: brak snapshotu'
        },
        gps: {
            score: gpsScore,
            weight: 0.07,
            note: signals.gpsAvailable ? 'GPS / pozycja dostępna' : 'GPS niedostępny w tym przebiegu'
        },
        healthMonitor: {
            score: healthScore,
            weight: 0.12,
            note: signals.healthOverall != null
                ? `Health overall ${signals.healthOverall}`
                : 'Health: brak latest.json'
        },
        brandProtection: {
            score: brandScore,
            weight: 0.09,
            note: signals.brandStatus
                ? `Brand Protection ${signals.brandStatus} (fail=${signals.brandFail}, warn=${signals.brandWarn})`
                : 'Brand Protection: brak raportu'
        },
        productBrain: {
            score: brainScore,
            weight: 0.10,
            note: signals.brainScore != null
                ? `Product Brain ${signals.brainScore}`
                : 'Product Brain: brak raportu'
        },
        selfReflection: {
            score: reflectScore,
            weight: 0.10,
            note: signals.reflectionOverall != null
                ? `Self Reflection ${signals.reflectionOverall}`
                : 'Self Reflection: brak raportu'
        }
    };

    return dimensions;
}

/**
 * @param {ReturnType<typeof scoreSignals>} dimensions
 */
export function computeRegionScore(dimensions) {
    let weightSum = 0;
    let acc = 0;
    for (const id of SIGNAL_IDS) {
        const d = dimensions[id];
        if (!d) continue;
        weightSum += d.weight;
        acc += d.score * d.weight;
    }
    if (weightSum <= 0) return 0;
    return clamp(acc / weightSum);
}

function regionVerdict(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'strong';
    if (score >= 70) return 'good';
    if (score >= 55) return 'fair';
    return 'weak';
}

/**
 * @param {object} sources
 * @param {object} [meta]
 */
export function buildRegionalBrainReport(sources = {}, meta = {}) {
    const now = meta.now instanceof Date ? meta.now : new Date();
    const day = meta.day || now.toISOString().slice(0, 10);
    const signals = collectSignals(sources, now);
    const dimensions = scoreSignals(signals);
    const regionScore = computeRegionScore(dimensions);

    const dimensionList = SIGNAL_IDS.map((id) => ({
        id,
        score: dimensions[id].score,
        weight: dimensions[id].weight,
        note: dimensions[id].note
    }));

    return {
        id: `regional-brain-${day}`,
        title: 'Regional Brain — Region Score',
        etapa: '33A',
        generatedAt: new Date().toISOString(),
        day,
        reason: meta.reason || 'cli-intelligence',
        policy: { ...POLICY },
        regionScore,
        verdict: regionVerdict(regionScore),
        signals: {
            dayPart: signals.dayPart,
            weekday: signals.weekday,
            weekdayName: signals.weekdayName,
            season: signals.season,
            weather: signals.weather,
            weatherAvailable: signals.weatherAvailable,
            weatherSource: signals.weatherSource,
            hasLocation: signals.hasLocation,
            gpsAvailable: signals.gpsAvailable,
            openCounts: signals.openCounts,
            openFarmers: signals.openFarmers,
            openTotal: signals.openTotal,
            placeHistoryCount: signals.placeHistoryCount,
            regionalTipId: signals.regionalTipId,
            healthOverall: signals.healthOverall,
            brandStatus: signals.brandStatus,
            brainScore: signals.brainScore,
            reflectionOverall: signals.reflectionOverall,
            reflectionReturn: signals.reflectionReturn
        },
        dimensions: dimensionList,
        sourcesUsed: Object.keys(sources).filter((k) => sources[k] != null),
        notes: [
            'Brak chatbota, UI, popupów i zmian w aplikacji.',
            'Region Score = ważona synteza sygnałów dnia + diagnostyk.',
            'autoApply=false · autoFix=false'
        ]
    };
}

/**
 * @param {ReturnType<typeof buildRegionalBrainReport>} report
 */
export function regionalBrainToMarkdown(report) {
    const lines = [];
    lines.push('# Regional Brain — Region Score');
    lines.push('');
    lines.push(`**Dzień:** ${report.day}`);
    lines.push(`**Wygenerowano:** ${report.generatedAt}`);
    lines.push(`**Etap:** ${report.etapa}`);
    lines.push(`**Powód:** ${report.reason}`);
    lines.push('');
    lines.push('## Polityka');
    lines.push('');
    lines.push('- **autoApply:** false');
    lines.push('- **autoFix:** false');
    lines.push('- Bez chatbota · bez UI · bez popupów · bez zmian aplikacji');
    lines.push('');
    lines.push('## Region Score');
    lines.push('');
    lines.push(`# **${report.regionScore} / 100**`);
    lines.push('');
    lines.push(`**Werdykt:** ${report.verdict}`);
    lines.push('');
    lines.push('## Sygnały dnia');
    lines.push('');
    lines.push('| Sygnał | Wartość |');
    lines.push('|--------|---------|');
    const s = report.signals || {};
    lines.push(`| Pora dnia | ${s.dayPart} |`);
    lines.push(`| Dzień tygodnia | ${s.weekdayName} (${s.weekday}) |`);
    lines.push(`| Sezon | ${s.season} |`);
    lines.push(`| Pogoda | ${s.weather ?? '—'} ${s.weatherAvailable ? '' : '(niedostępna)'} |`);
    lines.push(`| Lokalizacja | ${s.hasLocation ? 'tak' : 'nie'} |`);
    lines.push(`| GPS | ${s.gpsAvailable ? 'tak' : 'nie'} |`);
    lines.push(`| Otwarte (farmers / total) | ${s.openFarmers} / ${s.openTotal} |`);
    lines.push(`| Historia lokalna (count) | ${s.placeHistoryCount ?? '—'} |`);
    lines.push(`| Tip regionalny | ${s.regionalTipId ?? '—'} |`);
    lines.push(`| Health Monitor | ${s.healthOverall ?? '—'} |`);
    lines.push(`| Brand Protection | ${s.brandStatus ?? '—'} |`);
    lines.push(`| Product Brain | ${s.brainScore ?? '—'} |`);
    lines.push(`| Self Reflection | ${s.reflectionOverall ?? '—'} (return ${s.reflectionReturn ?? '—'}) |`);
    lines.push('');
    lines.push('## Wymiary (score × waga)');
    lines.push('');
    lines.push('| Wymiar | Score | Waga | Notatka |');
    lines.push('|--------|------:|-----:|---------|');
    for (const d of report.dimensions || []) {
        lines.push(`| ${d.id} | ${d.score} | ${d.weight} | ${d.note} |`);
    }
    lines.push('');
    lines.push('## Źródła');
    lines.push('');
    if (report.sourcesUsed?.length) {
        for (const src of report.sourcesUsed) lines.push(`- \`${src}\``);
    } else {
        lines.push('- (brak zewnętrznych JSON — tylko czas lokalny)');
    }
    lines.push('');
    lines.push('## Notatki');
    lines.push('');
    for (const n of report.notes || []) lines.push(`- ${n}`);
    lines.push('');
    return lines.join('\n');
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
 * Ładuje domyślne źródła diagnostyczne z docs/.
 * @param {string} root
 */
export function loadDefaultSources(root) {
    return {
        health: loadJson(root, 'docs/health/latest.json'),
        healthMonitor: loadJson(root, 'docs/health/latest.json'),
        brandProtection: loadJson(root, 'docs/brand-protection/latest.json')
            || loadJson(root, 'docs/brand/BRAND-PROTECTION.json'),
        productBrain: loadJson(root, 'docs/product-brain/latest.json'),
        selfReflection: loadJson(root, 'docs/self-reflection/latest.json'),
        regionalIntelligence: loadJson(root, 'docs/regional-intelligence/latest.json'),
        placeHistory: loadJson(root, 'docs/place-history/latest.json'),
        emotion: loadJson(root, 'docs/emotion/latest.json'),
        livingBrand: loadJson(root, 'docs/living-brand/latest.json')
    };
}

/**
 * Buduje raport i zapisuje docs/intelligence/latest.{md,json} (+ kopia dnia).
 * @param {string} root — katalog repo
 * @param {object} [options]
 */
export function runRegionalBrain(root, options = {}) {
    const sources = options.sources || loadDefaultSources(root);
    const report = buildRegionalBrainReport(sources, {
        day: options.day,
        reason: options.reason || 'cli-intelligence',
        now: options.now
    });
    const md = regionalBrainToMarkdown(report);
    const outDir = join(root, 'docs', 'intelligence');
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'latest.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    writeFileSync(join(outDir, 'latest.md'), md, 'utf8');
    writeFileSync(join(outDir, `${report.day}.json`), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    writeFileSync(join(outDir, `${report.day}.md`), md, 'utf8');
    return { report, md, outDir };
}

export default {
    POLICY,
    SIGNAL_IDS,
    getDayPart,
    collectSignals,
    scoreSignals,
    computeRegionScore,
    buildRegionalBrainReport,
    regionalBrainToMarkdown,
    loadDefaultSources,
    runRegionalBrain
};
