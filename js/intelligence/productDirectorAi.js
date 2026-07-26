/**
 * ETAP 45 — Product Director AI
 *
 * Łączy wnioski z modułów inteligencji i raportów jakości.
 * Codziennie max 3 rekomendacje. Żadnych automatycznych zmian.
 *
 * Raport: docs/product-director-ai/
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createModulePolicy, passesValueNotFeatureTest } from './policy.js';

export const POLICY = createModulePolicy({
    maxProposalsPerDay: 3,
    userFacing: false,
    role: 'product-director-ai',
    etapa: '45',
    aggregates: Object.freeze([
        'product-intelligence',
        'living-region',
        'regional-brain',
        'product-brain',
        'product-director',
        'self-reflection',
        'dream',
        'emotion',
        'health',
        'release-validator',
        'ui-guardian',
        'map-guardian',
        'production-polish'
    ])
});

export const HEADLINE =
    'Dzisiaj największy wpływ na jakość aplikacji będzie miało:';

function loadJson(root, rel) {
    const full = join(root, rel);
    if (!existsSync(full)) return null;
    try {
        return JSON.parse(readFileSync(full, 'utf8'));
    } catch {
        return null;
    }
}

function num(...vals) {
    for (const v of vals) {
        if (typeof v === 'number' && !Number.isNaN(v)) return v;
    }
    return null;
}

function impactWeight(impact) {
    if (impact === 'high') return 24;
    if (impact === 'medium') return 14;
    if (impact === 'low') return 6;
    return 10;
}

/** Krótka rekomendacja w stylu ETAP 45 (zdanie z kropką). */
export function toDirectorTitle(raw = '') {
    let t = String(raw)
        .replace(/\s+/g, ' ')
        .replace(/^\d+\.\s*/, '')
        .trim();
    // utnij długie tytuły techniczne do czytelnej rekomendacji
    if (t.length > 110) {
        const cut = t.slice(0, 107);
        const sp = cut.lastIndexOf(' ');
        t = (sp > 40 ? cut.slice(0, sp) : cut).trim();
    }
    if (!/[.!?…]$/.test(t)) t = `${t}.`;
    return t;
}

function themeKey(title = '') {
    const t = title.toLowerCase();
    if (/map|leaflet|marker|gps|routing/.test(t)) return 'map';
    if (/kontrast|dark|nocn|tryb noc|theme|czytel/.test(t)) return 'contrast';
    if (/zdję|photo|image|obraz|producent/.test(t)) return 'photos';
    if (/ładow|perf|bundle|start|lazy|szyb/.test(t)) return 'perf';
    if (/home|fold|ciężk|clutter|sekcj/.test(t)) return 'home';
    if (/premium|subskry/.test(t)) return 'premium';
    if (/i18n|tłumacz|translat|język/.test(t)) return 'i18n';
    if (/a11y|access|touch|aria/.test(t)) return 'a11y';
    if (/brand|logo|ikon/.test(t)) return 'brand';
    if (/offline|pwa|sw\.|service worker|manifest/.test(t)) return 'pwa';
    return t.slice(0, 48);
}

/**
 * @param {object} sources
 * @returns {object[]}
 */
export function gatherCandidates(sources = {}) {
    /** @type {object[]} */
    const pool = [];
    const push = (c) => {
        if (!c?.title) return;
        if (!passesValueNotFeatureTest(c)) return;
        pool.push({
            id: c.id || `cand-${pool.length + 1}`,
            title: toDirectorTitle(c.title),
            why: c.why || '',
            impact: c.impact || 'medium',
            risk: c.risk || 'low',
            effort: c.effort || '—',
            expectedEffect: c.expectedEffect || '',
            priority: Number(c.priority) || 50,
            sources: Array.isArray(c.sources) ? c.sources : [c.source || 'unknown'].filter(Boolean),
            theme: themeKey(c.title)
        });
    };

    // —— Product Intelligence ——
    for (const p of sources.productIntelligence?.proposals || []) {
        push({
            id: `pi-${p.id || p.rank}`,
            title: p.title,
            why: p.why,
            impact: p.impact,
            risk: p.risk,
            effort: p.effort,
            expectedEffect: p.expectedEffect,
            priority: (p.priority || 50) + impactWeight(p.impact) + 8,
            sources: ['product-intelligence', ...(p.sources || [])]
        });
    }
    for (const q of sources.productIntelligence?.questions || []) {
        if ((q.answer === 'tak' || q.answer === 'częściowo') && (q.severity || 0) >= 55) {
            if (q.id === 'mapSlow') {
                push({
                    id: 'signal-map-load',
                    title: 'Skrócenie czasu ładowania mapy',
                    why: `Product Intelligence: mapa za wolna (severity ${q.severity})`,
                    impact: 'high',
                    risk: 'medium',
                    effort: '4–8 h',
                    expectedEffect: 'Szybszy start widoku Map, mniej porzuceń',
                    priority: q.severity + 30,
                    sources: ['product-intelligence', 'map']
                });
            }
            if (q.id === 'homeHeavy') {
                push({
                    id: 'signal-home-weight',
                    title: 'Odciążenie pierwszego ekranu Home',
                    why: `Home zbyt ciężki (severity ${q.severity})`,
                    impact: 'high',
                    risk: 'low',
                    effort: '2–4 h',
                    expectedEffect: 'Mniej clutteru, czytelniejszy fold',
                    priority: q.severity + 22,
                    sources: ['product-intelligence', 'home']
                });
            }
        }
    }

    // —— Product Brain ——
    for (const p of sources.productBrain?.proposals || []) {
        push({
            id: `brain-${p.id || p.rank}`,
            title: p.title,
            why: p.why,
            impact: p.impact,
            risk: p.risk,
            effort: p.effort,
            expectedEffect: p.expectedEffect,
            priority: 55 + impactWeight(p.impact) + (4 - (p.rank || 1)) * 3,
            sources: ['product-brain', ...(p.sources || [])]
        });
    }

    // —— Product Director (ETAP 27 briefing) ——
    const priorities = sources.productDirector?.priorities || [];
    priorities.slice(0, 5).forEach((pr, i) => {
        const text = typeof pr === 'string' ? pr : pr?.title || pr?.text;
        if (!text) return;
        push({
            id: `dir27-${i + 1}`,
            title: text,
            why: 'Priority z Product Director (briefing)',
            impact: i === 0 ? 'high' : 'medium',
            risk: 'low',
            effort: '—',
            expectedEffect: 'Skupienie na priorytecie biznesowym dnia',
            priority: 70 - i * 8,
            sources: ['product-director']
        });
    });

    // —— Regional Brain / Living Region ——
    const regionScore = num(sources.regionalBrain?.regionScore);
    const pulse = num(sources.livingRegion?.regionPulse);
    if (regionScore != null && regionScore < 75) {
        push({
            id: 'signal-region-score',
            title: 'Wzmocnienie klimatu regionalnego na Home i Mapie',
            why: `Regional Brain score ${regionScore}`,
            impact: 'medium',
            risk: 'low',
            effort: '2–4 h',
            expectedEffect: 'Silniejszy „żywy region” bez nowych ekranów',
            priority: 100 - regionScore + 20,
            sources: ['regional-brain']
        });
    }
    if (pulse != null && pulse < 60) {
        push({
            id: 'signal-region-pulse',
            title: 'Ożywienie sygnału Region Pulse (otwarte gospodarstwa / sezon)',
            why: `Living Region pulse ${pulse}`,
            impact: 'medium',
            risk: 'low',
            effort: '1–3 h',
            expectedEffect: 'Bardziej aktualny klimat dnia w regionie',
            priority: 100 - pulse + 18,
            sources: ['living-region']
        });
    } else if (sources.livingRegion?.sentence && pulse != null && pulse >= 75) {
        // wysoki pulse — nadal można wzmocnić zdjęcia / odkrywanie
        push({
            id: 'signal-producer-photos',
            title: 'Uzupełnienie zdjęć producentów',
            why: 'Wysoki Region Pulse — wizualna wiarygodność gospodarstw podnosi konwersję odwiedzin',
            impact: 'medium',
            risk: 'low',
            effort: 'treść / assets',
            expectedEffect: 'Cieplejszy, bardziej wiarygodny katalog lokalny',
            priority: 58,
            sources: ['living-region', 'product-intelligence']
        });
    }

    // —— Emotion / Health ——
    const fatigue = num(sources.emotion?.scores?.fatigue);
    if (fatigue != null && fatigue < 55) {
        push({
            id: 'signal-fatigue',
            title: 'Redukcja zmęczenia bodźcami (mniej szumu wizualnego)',
            why: `Emotion fatigue ${fatigue}`,
            impact: 'high',
            risk: 'low',
            effort: '2–4 h',
            expectedEffect: 'Spokojniejszy UX, dłuższa sesja',
            priority: 100 - fatigue + 15,
            sources: ['emotion']
        });
    }
    const hUx = num(sources.health?.scores?.ux);
    const hPerf = num(sources.health?.scores?.performance);
    if (hUx != null && hUx < 88) {
        push({
            id: 'signal-ux',
            title: 'Poprawa czytelności i hierarchii kluczowych ekranów',
            why: `Health UX ${hUx}`,
            impact: 'high',
            risk: 'low',
            effort: '2–5 h',
            expectedEffect: 'Wyższa ocena UX bez nowych funkcji',
            priority: 100 - hUx + 18,
            sources: ['health']
        });
    }
    if (hPerf != null && hPerf < 90) {
        push({
            id: 'signal-perf',
            title: 'Skrócenie czasu ładowania krytycznej ścieżki',
            why: `Health performance ${hPerf}`,
            impact: 'high',
            risk: 'medium',
            effort: '4–8 h',
            expectedEffect: 'Szybszy start aplikacji',
            priority: 100 - hPerf + 22,
            sources: ['health']
        });
    }

    // —— Guardians / polish ——
    const uiVerdict = String(sources.uiGuardian?.verdict || '').toUpperCase();
    if (uiVerdict && uiVerdict !== 'PASS') {
        push({
            id: 'signal-ui-guardian',
            title: 'Poprawa kontrastu w trybie nocnym',
            why: `UI Guardian: ${uiVerdict}`,
            impact: 'high',
            risk: 'low',
            effort: '1–3 h',
            expectedEffect: 'Czytelniejszy dark mode, mniej błędów a11y',
            priority: 82,
            sources: ['ui-guardian']
        });
    } else if (sources.productionPolish?.warn > 0 || (sources.productionPolish?.overallScore != null && sources.productionPolish.overallScore < 92)) {
        push({
            id: 'signal-contrast-polish',
            title: 'Poprawa kontrastu w trybie nocnym',
            why: 'Production polish / dark-mode czytelność',
            impact: 'medium',
            risk: 'low',
            effort: '1–2 h',
            expectedEffect: 'Spójniejszy tryb nocny',
            priority: 64,
            sources: ['production-polish', 'ui-guardian']
        });
    }

    const mapVerdict = String(sources.mapGuardian?.verdict || '').toUpperCase();
    if (mapVerdict && mapVerdict !== 'PASS') {
        push({
            id: 'signal-map-guardian',
            title: 'Stabilizacja zdrowia mapy (kafelki, markery, GPS)',
            why: `Map Guardian: ${mapVerdict}`,
            impact: 'high',
            risk: 'medium',
            effort: '2–6 h',
            expectedEffect: 'Mniej hangów mapy, lepsza niezawodność',
            priority: 88,
            sources: ['map-guardian']
        });
    }

    // —— Release Validator ——
    const rv = sources.releaseValidator;
    const score = num(rv?.releaseScore, rv?.summary?.score);
    const ready = rv?.readyForProduction ?? (rv?.ready ? 'YES' : null);
    if (ready === 'NO' || (score != null && score < 90)) {
        const reason = rv?.reason || 'Release Score poniżej progu';
        push({
            id: 'signal-release',
            title: 'Domknięcie krytycznych punktów Release Validator przed wydaniem',
            why: reason,
            impact: 'high',
            risk: 'low',
            effort: 'zależnie od faili',
            expectedEffect: 'Ready for Production = YES',
            priority: 95,
            sources: ['release-validator']
        });
    }

    // —— Dream / Self-reflection top hints ——
    const dreamTop = sources.dream?.top3 || sources.dream?.summary?.top3 || [];
    (Array.isArray(dreamTop) ? dreamTop : []).slice(0, 3).forEach((item, i) => {
        const text = typeof item === 'string' ? item : item?.title;
        if (!text) return;
        push({
            id: `dream-${i + 1}`,
            title: text,
            why: 'Dream Mode top3',
            impact: i === 0 ? 'high' : 'medium',
            risk: 'low',
            effort: '—',
            expectedEffect: 'Focus z wieczornej refleksji',
            priority: 66 - i * 6,
            sources: ['dream']
        });
    });

    return pool;
}

/**
 * Deduplikacja po theme + wybór top N.
 * @param {object[]} candidates
 * @param {number} [max]
 */
export function pickTopRecommendations(candidates = [], max = POLICY.maxProposalsPerDay) {
    const sorted = [...candidates].sort((a, b) => b.priority - a.priority);
    const seen = new Set();
    const picked = [];
    for (const c of sorted) {
        if (seen.has(c.theme)) continue;
        seen.add(c.theme);
        picked.push({
            ...c,
            rank: picked.length + 1,
            status: 'pending_acceptance'
        });
        if (picked.length >= max) break;
    }
    return picked;
}

/**
 * @param {object} sources
 * @param {object} [meta]
 */
export function buildProductDirectorAiReport(sources = {}, meta = {}) {
    const day = meta.day || new Date().toISOString().slice(0, 10);
    const candidates = gatherCandidates(sources);
    const recommendations = pickTopRecommendations(candidates, POLICY.maxProposalsPerDay);
    const sourcePresence = Object.fromEntries(
        Object.entries(sources).map(([k, v]) => [k, Boolean(v)])
    );

    return {
        id: `product-director-ai-${day}`,
        title: 'Product Director AI — dzienne rekomendacje',
        etapa: '45',
        generatedAt: new Date().toISOString(),
        day,
        reason: meta.reason || 'cli-product-director-ai',
        policy: { ...POLICY },
        headline: HEADLINE,
        recommendations,
        candidatesConsidered: candidates.length,
        sourcesAvailable: sourcePresence,
        summary: {
            recommendationsCount: recommendations.length,
            maxPerDay: POLICY.maxProposalsPerDay,
            autoApply: false,
            requiresOwnerAcceptance: true,
            boardLines: recommendations.map((r) => r.title)
        },
        notes: [
            'Żadnych automatycznych zmian w kodzie ani danych.',
            'Max 3 rekomendacje dziennie — czekają na akceptację właściciela.',
            'Agreguje Product Intelligence, Living Region AI, Regional Brain, Product Brain i raporty jakości.'
        ]
    };
}

/**
 * @param {ReturnType<typeof buildProductDirectorAiReport>} report
 */
export function productDirectorAiToMarkdown(report) {
    const lines = [
        '# ETAP 45 — Product Director AI',
        '',
        `**Dzień:** ${report.day}  `,
        `**Wygenerowano:** ${report.generatedAt}  `,
        `**autoApply:** false · max ${report.summary.maxPerDay}`,
        '',
        `## ${report.headline}`,
        ''
    ];
    if (!report.recommendations.length) {
        lines.push('_Brak silnych sygnałów — dziś bez nowych rekomendacji._', '');
    } else {
        for (const r of report.recommendations) {
            lines.push(`${r.rank}. ${r.title}`);
        }
        lines.push('');
    }

    lines.push('## Szczegóły', '');
    for (const r of report.recommendations) {
        lines.push(`### ${r.rank}. ${r.title}`, '');
        lines.push(`- **ID:** \`${r.id}\``);
        lines.push(`- **Dlaczego:** ${r.why || '—'}`);
        lines.push(`- **Wpływ:** ${r.impact} · **Ryzyko:** ${r.risk}`);
        lines.push(`- **Effort:** ${r.effort}`);
        if (r.expectedEffect) lines.push(`- **Efekt:** ${r.expectedEffect}`);
        lines.push(`- **Źródła:** ${(r.sources || []).join(', ')}`);
        lines.push(`- **Status:** \`${r.status}\``);
        lines.push('');
    }

    lines.push('## Źródła (obecność raportów)', '');
    lines.push('| Źródło | Dostępne |');
    lines.push('|--------|:--------:|');
    for (const [k, ok] of Object.entries(report.sourcesAvailable || {})) {
        lines.push(`| ${k} | ${ok ? 'yes' : 'no'} |`);
    }
    lines.push('');
    lines.push('## Polityka', '');
    for (const n of report.notes || []) lines.push(`- ${n}`);
    lines.push('');
    return lines.join('\n');
}

/**
 * Konsola — tylko board rekomendacji (jak w briefie ETAP 45).
 * @param {ReturnType<typeof buildProductDirectorAiReport>} report
 */
export function formatDirectorBoard(report) {
    const lines = ['', report.headline, ''];
    if (!report.recommendations.length) {
        lines.push('(brak rekomendacji na dziś)', '');
    } else {
        for (const r of report.recommendations) {
            lines.push(`${r.rank}. ${r.title}`);
        }
        lines.push('');
    }
    lines.push('Żadnych automatycznych zmian — tylko rekomendacje.');
    lines.push('');
    return lines.join('\n');
}

/**
 * @param {string} root
 */
export function loadProductDirectorAiSources(root) {
    const polish = loadJson(root, 'docs/premium/PRODUCTION-POLISH.json')
        || loadJson(root, 'docs/production-polish/latest.json');
    return {
        productIntelligence: loadJson(root, 'docs/product-intelligence/latest.json'),
        livingRegion: loadJson(root, 'docs/living-region/latest.json'),
        regionalBrain: loadJson(root, 'docs/intelligence/latest.json'),
        productBrain: loadJson(root, 'docs/product-brain/latest.json'),
        productDirector: loadJson(root, 'docs/product-director/latest.json'),
        selfReflection: loadJson(root, 'docs/self-reflection/latest.json'),
        dream: loadJson(root, 'docs/dream/latest.json'),
        emotion: loadJson(root, 'docs/emotion/latest.json'),
        health: loadJson(root, 'docs/health/latest.json'),
        releaseValidator: loadJson(root, 'docs/final/release-validator-latest.json')
            || loadJson(root, 'docs/final/RELEASE-VALIDATOR.json'),
        uiGuardian: loadJson(root, 'docs/ui-guardian/latest.json'),
        mapGuardian: loadJson(root, 'docs/map-guardian/latest.json'),
        productionPolish: polish
            ? {
                overallScore: num(polish.overallScore, polish.summary?.overall),
                warn: num(polish.warn, polish.summary?.warn, 0),
                fail: num(polish.fail, polish.summary?.fail, 0)
            }
            : null
    };
}

/**
 * @param {string} root
 * @param {object} [options]
 */
export function runProductDirectorAi(root, options = {}) {
    const sources = options.sources || loadProductDirectorAiSources(root);
    const report = buildProductDirectorAiReport(sources, {
        day: options.day,
        reason: options.reason || 'cli-product-director-ai'
    });
    const md = productDirectorAiToMarkdown(report);
    const outDir = join(root, 'docs', 'product-director-ai');
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'latest.md'), md, 'utf8');
    writeFileSync(join(outDir, 'latest.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    writeFileSync(join(outDir, `${report.day}.md`), md, 'utf8');
    writeFileSync(join(outDir, `${report.day}.json`), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    writeFileSync(
        join(outDir, 'pending-acceptance.json'),
        `${JSON.stringify({
            day: report.day,
            generatedAt: report.generatedAt,
            headline: report.headline,
            policy: {
                autoApply: false,
                requiresOwnerAcceptance: true,
                maxProposalsPerDay: 3
            },
            recommendations: report.recommendations
        }, null, 2)}\n`,
        'utf8'
    );
    return { report, outDir, md };
}

export default {
    POLICY,
    HEADLINE,
    gatherCandidates,
    pickTopRecommendations,
    buildProductDirectorAiReport,
    productDirectorAiToMarkdown,
    formatDirectorBoard,
    loadProductDirectorAiSources,
    runProductDirectorAi,
    toDirectorTitle
};
