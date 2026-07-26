/**
 * ETAP 30 – Guardian of the Future (CLI)
 * Trendy + prognozy. Nie zmienia kodu. autoApply: false.
 *
 * Usage:
 *   npm run future
 *   npm run future -- --dry-run
 */
import {
    readFileSync,
    writeFileSync,
    mkdirSync,
    existsSync,
    readdirSync
} from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    POLICY,
    extractMetrics,
    buildGuardianFutureReport,
    guardianFutureToMarkdown
} from '../js/diagnostics/guardianOfTheFutureCore.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs', 'guardian-future');
const HISTORY_PATH = join(OUT, 'history.json');

function dayStamp(d = new Date()) {
    return d.toISOString().slice(0, 10);
}

function loadJson(absOrRel) {
    const full = absOrRel.includes(':') || absOrRel.startsWith('/') || absOrRel.startsWith('\\')
        ? absOrRel
        : join(ROOT, absOrRel);
    if (!existsSync(full)) return null;
    try {
        return JSON.parse(readFileSync(full, 'utf8'));
    } catch {
        return null;
    }
}

function loadHistory() {
    const raw = loadJson(HISTORY_PATH);
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.series)) return raw.series;
    return [];
}

function listDatedJson(dirRel, pattern) {
    const dir = join(ROOT, dirRel);
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
        .filter((name) => pattern.test(name))
        .map((name) => ({ name, full: join(dir, name) }));
}

/**
 * Zbiera snapshoty z archiwów raportów (health, emotion, …).
 * @returns {Map<string, object>}
 */
function collectFromArchives() {
    /** @type {Map<string, { day: string, health?: object, emotion?: object, livingBrand?: object, brandProtection?: object, improve?: object, guardian?: object, selfReflection?: object, dream?: object, qualityLoop?: object }>} */
    const byDay = new Map();

    const ensure = (day) => {
        if (!byDay.has(day)) byDay.set(day, { day });
        return byDay.get(day);
    };

    // Health: health-2026-07-21T….json — bierz najnowszy per dzień
    for (const { name, full } of listDatedJson('docs/health', /^health-\d{4}-\d{2}-\d{2}/)) {
        const day = name.slice(7, 17);
        const data = loadJson(full);
        if (!data) continue;
        const slot = ensure(day);
        if (!slot.health || String(data.generatedAt || '') > String(slot.health.generatedAt || '')) {
            slot.health = data;
        }
    }
    const healthLatest = loadJson('docs/health/latest.json');
    if (healthLatest) {
        const day = (healthLatest.generatedAt || '').slice(0, 10) || dayStamp();
        const slot = ensure(day);
        slot.health = healthLatest;
    }

    // Emotion / living-brand / dream / self-reflection / brand-protection / quality-loop: YYYY-MM-DD.json
    const datedDirs = [
        ['docs/emotion', 'emotion'],
        ['docs/living-brand', 'livingBrand'],
        ['docs/dream', 'dream'],
        ['docs/self-reflection', 'selfReflection'],
        ['docs/brand-protection', 'brandProtection'],
        ['docs/quality-loop', 'qualityLoop'],
        ['docs/improvements', 'improve']
    ];
    for (const [dirRel, key] of datedDirs) {
        for (const { name, full } of listDatedJson(dirRel, /^\d{4}-\d{2}-\d{2}\.json$/)) {
            const day = name.slice(0, 10);
            const data = loadJson(full);
            if (!data) continue;
            ensure(day)[key] = data;
        }
        const latest = loadJson(`${dirRel}/latest.json`);
        if (latest) {
            const day = latest.day || (latest.generatedAt || '').slice(0, 10) || dayStamp();
            ensure(day)[key] = latest;
        }
    }

    // Brand protection compat
    const bpLegacy = loadJson('docs/brand/BRAND-PROTECTION.json');
    if (bpLegacy) {
        const day = (bpLegacy.day || bpLegacy.generatedAt || '').slice(0, 10) || dayStamp();
        ensure(day).brandProtection = bpLegacy;
    }

    // Improvements latest
    const improveLatest = loadJson('docs/improvements/latest.json');
    if (improveLatest) {
        const day = (improveLatest.generatedAt || '').slice(0, 10) || dayStamp();
        ensure(day).improve = improveLatest;
    }

    // Guardian reports
    for (const { name, full } of listDatedJson('tools/ai-guardian/reports', /^guardian-\d{8}/)) {
        const y = name.slice(9, 13);
        const m = name.slice(13, 15);
        const d = name.slice(15, 17);
        const day = `${y}-${m}-${d}`;
        const data = loadJson(full);
        if (!data) continue;
        const slot = ensure(day);
        if (!slot.guardian || String(data.generatedAt || '') > String(slot.guardian.generatedAt || '')) {
            slot.guardian = data;
        }
    }
    const guardianLatest = loadJson('tools/ai-guardian/reports/latest.json');
    if (guardianLatest) {
        const day = (guardianLatest.generatedAt || '').slice(0, 10) || dayStamp();
        ensure(day).guardian = guardianLatest;
    }

    return byDay;
}

function mergeSeries(history, archives) {
    /** @type {Map<string, { day: string, metrics: object, sources: string[] }>} */
    const map = new Map();

    for (const h of history) {
        if (!h?.day) continue;
        map.set(h.day, {
            day: h.day,
            metrics: { ...(h.metrics || extractMetrics(h)) },
            sources: [...(h.sources || ['history'])]
        });
    }

    for (const [day, snap] of archives.entries()) {
        const metrics = extractMetrics(snap);
        const prev = map.get(day) || { day, metrics: {}, sources: [] };
        const merged = { ...prev.metrics };
        for (const [k, v] of Object.entries(metrics)) {
            if (typeof v === 'number') merged[k] = v;
        }
        const sources = new Set([...(prev.sources || []), 'archives']);
        for (const key of Object.keys(snap)) {
            if (key !== 'day' && snap[key]) sources.add(key);
        }
        map.set(day, { day, metrics: merged, sources: [...sources] });
    }

    return [...map.values()].sort((a, b) => a.day.localeCompare(b.day));
}

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const day = dayStamp();

console.log('══════════════════════════════════════════');
console.log(' Guardian of the Future (ETAP 30)');
console.log(` ${day} · trendy + prognozy · autoApply=false`);
console.log('══════════════════════════════════════════');

if (dryRun) console.log('\n⏭ dry-run — bez aktualizacji history.json');

const history = loadHistory();
const archives = collectFromArchives();
let series = mergeSeries(history, archives);

// Upewnij się, że dzisiejszy snapshot jest w serii
if (!series.some((s) => s.day === day)) {
    const todaySnap = archives.get(day) || {
        day,
        health: loadJson('docs/health/latest.json'),
        emotion: loadJson('docs/emotion/latest.json'),
        livingBrand: loadJson('docs/living-brand/latest.json'),
        brandProtection: loadJson('docs/brand-protection/latest.json'),
        improve: loadJson('docs/improvements/latest.json'),
        guardian: loadJson('tools/ai-guardian/reports/latest.json'),
        selfReflection: loadJson('docs/self-reflection/latest.json'),
        dream: loadJson('docs/dream/latest.json')
    };
    series.push({
        day,
        metrics: extractMetrics(todaySnap),
        sources: ['today']
    });
    series.sort((a, b) => a.day.localeCompare(b.day));
}

const report = buildGuardianFutureReport(series, {
    day,
    reason: dryRun ? 'dry-run' : 'cli-future'
});

const md = guardianFutureToMarkdown(report);

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'latest.json'), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT, 'latest.md'), md, 'utf8');
writeFileSync(join(OUT, `${day}.json`), JSON.stringify(report, null, 2), 'utf8');
writeFileSync(join(OUT, `${day}.md`), md, 'utf8');

if (!dryRun) {
    // Zachowaj historię metryk (pamięć strażnika)
    const historyOut = {
        updatedAt: new Date().toISOString(),
        policy: { autoApply: false, note: 'append-only snapshots for trends' },
        series: series.map((s) => ({
            day: s.day,
            metrics: s.metrics,
            sources: s.sources
        }))
    };
    writeFileSync(HISTORY_PATH, JSON.stringify(historyOut, null, 2), 'utf8');
}

console.log(`\n Status: ${report.status} · Future score: ${report.futureScore}/100`);
console.log(` Series days: ${report.summary.samplesDays}`);
console.log(` Predictions: ${report.predictions.length} (alert ${report.summary.alerts} / watch ${report.summary.watches})`);
if (report.predictions[0]) {
    console.log(`\n → ${report.predictions[0].message}`);
}
console.log(`\n Wrote: ${relative(ROOT, join(OUT, 'latest.md'))}`);
console.log(` Policy: autoApply=${POLICY.autoApply} · nie zmienia kodu`);
console.log('══════════════════════════════════════════');
process.exit(0);
