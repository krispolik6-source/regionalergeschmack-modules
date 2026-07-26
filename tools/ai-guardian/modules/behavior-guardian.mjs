// MODUŁ 3 – Behavior Guardian (tylko lokalne, anonimowe statystyki)
import fs from 'fs';
import { BEHAVIOR_FILE, SEVERITY } from '../config.mjs';
import { finding } from '../lib/findings.mjs';
import { ensureDir } from '../lib/fs-utils.mjs';
import path from 'path';

/**
 * Odczyt lokalnych statystyk zapisanych przez behavior-probe (opt-in).
 * Brak PII, brak wysyłki na serwer.
 */
export function readBehaviorStats() {
    try {
        if (!fs.existsSync(BEHAVIOR_FILE)) {
            return { events: [], screens: {}, clicks: {}, updatedAt: null };
        }
        return JSON.parse(fs.readFileSync(BEHAVIOR_FILE, 'utf8'));
    } catch {
        return { events: [], screens: {}, clicks: {}, updatedAt: null };
    }
}

/**
 * Import z pliku wyeksportowanego przez probe (localStorage dump).
 * @param {object} dump
 */
export function ingestBehaviorDump(dump) {
    ensureDir(path.dirname(BEHAVIOR_FILE));
    const safe = {
        updatedAt: new Date().toISOString(),
        clicks: dump?.clicks && typeof dump.clicks === 'object' ? dump.clicks : {},
        screens: dump?.screens && typeof dump.screens === 'object' ? dump.screens : {},
        scrollDepth: dump?.scrollDepth && typeof dump.scrollDepth === 'object' ? dump.scrollDepth : {},
        dwellMs: dump?.dwellMs && typeof dump.dwellMs === 'object' ? dump.dwellMs : {},
        dropoffs: Array.isArray(dump?.dropoffs) ? dump.dropoffs.slice(0, 200) : [],
        // twardy zakaz PII
        note: 'anonymous-local-only'
    };
    fs.writeFileSync(BEHAVIOR_FILE, JSON.stringify(safe, null, 2), 'utf8');
    return safe;
}

export async function runBehaviorGuardian() {
    const findings = [];
    const stats = readBehaviorStats();
    const hasData = Object.keys(stats.clicks || {}).length > 0
        || Object.keys(stats.screens || {}).length > 0;

    if (!hasData) {
        findings.push(finding({
            module: 'behavior',
            severity: SEVERITY.cosmetic,
            title: 'Brak lokalnych statystyk zachowania',
            cause: 'Probe nie był włączony lub nie zaimportowano dumpa.',
            files: ['tools/ai-guardian/runtime/behavior-probe.js'],
            proposal: 'Na localhost: localStorage.setItem("rg_ai_guardian_probe","1") i odśwież. Potem: npm run guardian -- behavior:import --file=...',
            performanceImpact: 'n/d',
            regressionRisk: 'n/d',
            tags: ['opt-in']
        }));
        return {
            findings,
            meta: { hasData: false, policy: 'no-PII no-server' },
            proposals: []
        };
    }

    const clicks = Object.entries(stats.clicks || {}).sort((a, b) => b[1] - a[1]);
    const screens = Object.entries(stats.screens || {}).sort((a, b) => b[1] - a[1]);
    const proposals = [];

    if (clicks[0]) {
        proposals.push({
            title: `Najczęściej klikane: ${clicks[0][0]} (${clicks[0][1]})`,
            proposal: 'Utrzymaj widoczność tej kontroli; nie chowaj jej za kolejnymi warstwami UI.'
        });
    }

    const low = clicks.filter(([, n]) => n <= 1).slice(0, 8);
    if (low.length) {
        findings.push(finding({
            module: 'behavior',
            severity: SEVERITY.medium,
            title: 'Funkcje prawie nieużywane (lokalnie)',
            cause: low.map(([k, n]) => `${k}:${n}`).join(', '),
            files: ['tools/ai-guardian/data/behavior-stats.json'],
            proposal: 'Rozważ uproszczenie UI lub lepsze odkrycie tych funkcji (bez usuwania bez akceptacji).',
            performanceImpact: 'niski',
            regressionRisk: 'średnie',
            tags: ['unused-ui']
        }));
    }

    const dwell = Object.entries(stats.dwellMs || {}).sort((a, b) => b[1] - a[1]);
    if (dwell[0] && dwell[0][1] > 120000) {
        findings.push(finding({
            module: 'behavior',
            severity: SEVERITY.cosmetic,
            title: `Długi czas na ekranie: ${dwell[0][0]}`,
            cause: `${Math.round(dwell[0][1] / 1000)}s – użytkownik zatrzymuje się tutaj.`,
            files: [],
            proposal: 'Wzmacniaj treść tego ekranu; unikaj agresywnych CTA reklamowych.',
            performanceImpact: 'niski',
            regressionRisk: 'niskie',
            tags: ['dwell']
        }));
    }

    if ((stats.dropoffs || []).length >= 3) {
        findings.push(finding({
            module: 'behavior',
            severity: SEVERITY.high,
            title: 'Wykryte drop-offy (lokalne)',
            cause: `${stats.dropoffs.length} zdarzeń rezygnacji (np. zamknięcie bez akcji).`,
            files: ['tools/ai-guardian/data/behavior-stats.json'],
            proposal: 'Sprawdź friction przy modalach/mapie – za dużo kroków lub niejasny CTA.',
            performanceImpact: 'niski',
            regressionRisk: 'średnie',
            tags: ['dropoff']
        }));
    }

    return {
        findings,
        meta: {
            hasData: true,
            topClicks: clicks.slice(0, 10),
            topScreens: screens.slice(0, 8),
            policy: 'anonymous-local-only'
        },
        proposals
    };
}
