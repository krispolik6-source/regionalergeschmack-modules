/**
 * ETAP 33D — Product Intelligence (codzienne pytania produktowe)
 * Max 3 propozycje. Nie zmienia kodu aplikacji. autoApply=false.
 *
 * Raport: docs/product-intelligence/latest.md
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createModulePolicy, passesValueNotFeatureTest } from './policy.js';

export const POLICY = createModulePolicy({
    maxProposalsPerDay: 3,
    userFacing: false,
    role: 'product-intelligence-daily',
    etapa: '33D'
});

export const DAILY_QUESTIONS = Object.freeze([
    { id: 'homeHeavy', question: 'Czy Home jest zbyt ciężki?' },
    { id: 'mapSlow', question: 'Czy mapa jest za wolna?' },
    { id: 'premiumVisible', question: 'Czy Premium jest dobrze widoczne?' },
    { id: 'findProducerFast', question: 'Czy użytkownik szybko znajduje producenta?' },
    { id: 'unusedSection', question: 'Czy jakaś sekcja jest prawie nieużywana?' }
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

function fileExists(root, rel) {
    return existsSync(join(root, rel));
}

/**
 * @param {object} sources
 * @param {object} [flags] — np. homeV1Deployed
 */
export function answerDailyQuestions(sources = {}, flags = {}) {
    const health = sources.health || null;
    const emotion = sources.emotion || null;
    const reflect = sources.selfReflection || null;
    const perf = sources.performance || null;
    const homePremium = sources.homePremium || null;
    const brain = sources.productBrain || null;
    const finalReview = sources.finalReview || null;

    const hUx = num(health?.scores?.ux);
    const hPerf = num(health?.scores?.performance);
    const fatigue = num(emotion?.scores?.fatigue);
    const homeOverloaded = reflect?.qa?.find?.((q) => q.id === 'homeOverloaded')
        || (reflect?.qa || []).find((q) => q.id === 'homeOverloaded');
    const find30 = (reflect?.qa || []).find((q) => q.id === 'findProducer30s');
    const homeV1 = Boolean(flags.homeV1Deployed);
    const foldScore = num(homePremium?.foldScore, homePremium?.homeFoldScore);

    // —— 1. Home ciężki? ——
    // Home 1.0 zmniejsza ciężar foldu; emotion fatigue + gęsty dół nadal ważą
    let homeSeverity = 55;
    if (fatigue != null) homeSeverity = 100 - fatigue; // niski fatigue score = większy problem
    if (homeOverloaded?.score != null) {
        // wysoki score w self-reflection = „NIE jest przeładowany”
        homeSeverity = Math.max(homeSeverity, 100 - homeOverloaded.score);
    }
    if (hUx != null && hUx < 90) homeSeverity = Math.max(homeSeverity, 100 - hUx);
    if (homeV1) homeSeverity = Math.max(25, homeSeverity - 28);
    if (foldScore != null && foldScore < 70 && !homeV1) {
        homeSeverity = Math.max(homeSeverity, 100 - foldScore);
    }
    homeSeverity = clamp(homeSeverity);
    const homeHeavy = {
        id: 'homeHeavy',
        question: DAILY_QUESTIONS[0].question,
        answer: homeSeverity >= 55 ? 'tak' : homeSeverity >= 35 ? 'częściowo' : 'nie',
        severity: homeSeverity,
        confidence: homeV1 || fatigue != null || hUx != null ? 78 : 50,
        evidence: [
            homeV1 ? 'Home 1.0 wdrożony (fold uproszczony)' : 'Home 1.0 nie wykryty w docs',
            fatigue != null ? `Emotion fatigue ${fatigue}` : 'brak emotion fatigue',
            homeOverloaded ? `Self Reflection homeOverloaded score ${homeOverloaded.score}` : null,
            hUx != null ? `Health UX ${hUx}` : null
        ].filter(Boolean)
    };

    // —— 2. Mapa wolna? ——
    const bundleScore = num(perf?.scores?.bundle, perf?.checklist?.find?.((c) => c.id === 'bundle')?.score);
    const lazyScore = num(perf?.scores?.lazyLoading, perf?.checklist?.find?.((c) => c.id === 'lazy')?.score);
    const perfOverall = num(perf?.overallScore, perf?.performanceScore, 44);
    let mapSeverity = 40;
    if (perfOverall != null && perfOverall < 55) mapSeverity = 70;
    if (bundleScore != null && bundleScore < 40) mapSeverity = Math.max(mapSeverity, 75);
    // Leaflet eager na Home = mapa „wolna” przy starcie nawet przed otwarciem
    mapSeverity = Math.max(mapSeverity, 68);
    if (hPerf != null && hPerf >= 95) mapSeverity = Math.max(45, mapSeverity - 8);
    mapSeverity = clamp(mapSeverity);
    const mapSlow = {
        id: 'mapSlow',
        question: DAILY_QUESTIONS[1].question,
        answer: mapSeverity >= 55 ? 'tak' : mapSeverity >= 35 ? 'częściowo' : 'nie',
        severity: mapSeverity,
        confidence: 72,
        evidence: [
            `Performance overall ~${perfOverall} (ETAP 32D)`,
            'Leaflet + MarkerCluster sync w <head> na każdym starcie',
            'Eager import views/map.js w grafie app.js (~1.8 MB JS)',
            hPerf != null ? `Health performance ${hPerf} (statyczny — nie neguje kosztu startu mapy)` : null
        ].filter(Boolean)
    };

    // —— 3. Premium widoczne? ——
    // Home 1.0 świadomie schowało Premium poniżej (order 50) — widoczność spadła z premedytacją
    let premiumSeverity = homeV1 ? 62 : 45; // severity = „problemu braku widoczności”
    const premiumAnswer = homeV1
        ? 'nie' // nie jest dobrze widoczne na foldzie
        : 'częściowo';
    const premiumVisible = {
        id: 'premiumVisible',
        question: DAILY_QUESTIONS[2].question,
        answer: premiumAnswer,
        /** jak bardzo brakuje widoczności (wyżej = większy problem) */
        severity: clamp(premiumSeverity),
        confidence: 80,
        evidence: [
            homeV1
                ? 'Home 1.0: Premium order:50 — poza pierwszym ekranem (świadomy trade-off)'
                : 'Premium może konkurować z foldem (starsze warstwy CSS)',
            'Wartość „dlaczego jutro zapłacić” nadal warunkowa (Final Review / Product Status)'
        ]
    };

    // —— 4. Szybko znajduje producenta? ——
    const findScore = num(find30?.score, 70);
    // wysoki score = tak, szybko
    const findSeverity = clamp(100 - findScore); // problem gdy niski findScore
    const findProducerFast = {
        id: 'findProducerFast',
        question: DAILY_QUESTIONS[3].question,
        answer: findScore >= 85 ? 'tak' : findScore >= 65 ? 'częściowo' : 'nie',
        severity: findSeverity,
        confidence: find30 ? 85 : 55,
        evidence: [
            find30
                ? `Self Reflection findProducer30s: ${find30.score} (${find30.verdict})`
                : 'brak bezpośredniego pomiaru findProducer30s',
            homeV1 ? 'Fold: search + CTA „w pobliżu” — ścieżka do mapy czytelna' : null,
            'Mapa / GPS / kategorie dostępne w rdzeniu produktu'
        ].filter(Boolean)
    };

    // —— 5. Sekcja prawie nieużywana? ——
    // Heurystyka: gęsty stack narracji Home (smaki, doradca, nature, story…) + diagnostics
    let unusedSeverity = 58;
    const unusedJs = num(health?.static?.unusedJs?.unusedCount);
    if (unusedJs != null && unusedJs > 0) unusedSeverity = Math.max(unusedSeverity, 50 + unusedJs * 5);
    // FA dead CSS z performance
    unusedSeverity = Math.max(unusedSeverity, 60);
    unusedSeverity = clamp(unusedSeverity);
    const unusedSection = {
        id: 'unusedSection',
        question: DAILY_QUESTIONS[4].question,
        answer: unusedSeverity >= 50 ? 'tak' : 'częściowo',
        severity: unusedSeverity,
        confidence: 65,
        evidence: [
            'Home poniżej foldu: wiele sekcji narracyjnych (Smaki dnia, Doradca, Nature, Story, Live…) — ryzyko scroll fatigue',
            'Font Awesome all.min.css prawdopodobnie martwy (brak klas fa w app)',
            'Diagnostics (12+ init) w cold path — koszt bez wartości dla użytkownika końcowego',
            unusedJs != null ? `Health unusedJs count ${unusedJs}` : null
        ].filter(Boolean)
    };

    return [homeHeavy, mapSlow, premiumVisible, findProducerFast, unusedSection];
}

/**
 * Buduje pulę propozycji z odpowiedzi (status: pending_acceptance).
 * @param {ReturnType<typeof answerDailyQuestions>} answers
 */
export function buildProposalCandidates(answers = []) {
    const byId = Object.fromEntries(answers.map((a) => [a.id, a]));
    /** @type {object[]} */
    const pool = [];

    const push = (p) => {
        pool.push({
            ...p,
            status: 'pending_acceptance',
            impact: p.impact || 'medium',
            risk: p.risk || 'low'
        });
    };

    const home = byId.homeHeavy;
    if (home && home.severity >= 40) {
        push({
            id: 'pi-home-below-fold-diet',
            title: 'Utrzymaj fold Home 1.0 i odchudź sekcje narracyjne poniżej (lazy / collapse)',
            questionId: 'homeHeavy',
            why: `Home ciężki: ${home.answer} (severity ${home.severity})`,
            impact: 'high',
            risk: 'low',
            effort: '3–5 h (prezentacja, bez nowych funkcji)',
            expectedEffect: 'Mniej zmęczenia scrollowaniem, wyższa chęć powrotu',
            priority: home.severity + 15,
            sources: home.evidence
        });
    }

    const map = byId.mapSlow;
    if (map && map.severity >= 45) {
        push({
            id: 'pi-defer-leaflet',
            title: 'Ładuj Leaflet + MarkerCluster dopiero przy pierwszym wejściu na mapę',
            questionId: 'mapSlow',
            why: `Mapa / cold start: ${map.answer} (severity ${map.severity})`,
            impact: 'high',
            risk: 'medium',
            effort: '4–8 h (lazy CDN + dynamic import widoku)',
            expectedEffect: 'Szybszy Home i LCP; mapa bez regresji funkcji',
            priority: map.severity + 18,
            sources: map.evidence
        });
    }

    const premium = byId.premiumVisible;
    if (premium && premium.answer !== 'tak') {
        push({
            id: 'pi-premium-subtle-signal',
            title: 'Jedna dyskretna linia wartości Premium pod CTA (bez nowego ekranu / popupu)',
            questionId: 'premiumVisible',
            why: `Premium widoczność: ${premium.answer} (severity ${premium.severity})`,
            impact: 'medium',
            risk: 'low',
            effort: '1–2 h (copy + CSS, Brand Lock)',
            expectedEffect: 'Jasny powód subskrypcji bez psucia foldu Home 1.0',
            priority: premium.severity + 8,
            sources: premium.evidence
        });
    }

    const find = byId.findProducerFast;
    if (find && (find.answer === 'nie' || find.answer === 'częściowo') && find.severity >= 20) {
        push({
            id: 'pi-find-producer-path',
            title: 'Wzmocnij ścieżkę „szukaj → wynik / mapa” (focus search, mniej konkurencji wizualnej)',
            questionId: 'findProducerFast',
            why: `Znajdowanie producenta: ${find.answer} (severity ${find.severity})`,
            impact: 'high',
            risk: 'low',
            effort: '2–4 h',
            expectedEffect: 'Szybsze odnalezienie gospodarstwa (<30 s)',
            priority: find.severity + 12,
            sources: find.evidence
        });
    }

    const unused = byId.unusedSection;
    if (unused && unused.severity >= 45) {
        push({
            id: 'pi-hide-low-value-sections',
            title: 'Ukryj lub zwiń najniżej zaangażowane sekcje Home + usuń martwy Font Awesome z krytycznej ścieżki',
            questionId: 'unusedSection',
            why: `Prawie nieużywane: ${unused.answer} (severity ${unused.severity})`,
            impact: 'medium',
            risk: 'low',
            effort: '2–4 h',
            expectedEffect: 'Lżejszy DOM/CSS, czytelniejszy scroll, mniej szumu',
            priority: unused.severity + 10,
            sources: unused.evidence
        });
    }

    // jeśli find jest „tak” — niska priorytetowość; mapa i home i unused zostają top
    return pool.sort((a, b) => b.priority - a.priority);
}

/**
 * @param {object[]} candidates
 * @param {number} [max]
 */
export function pickTopProposals(candidates = [], max = POLICY.maxProposalsPerDay) {
    const valued = candidates.filter((p) => passesValueNotFeatureTest(p));
    return valued.slice(0, max).map((p, i) => ({ ...p, rank: i + 1 }));
}

/**
 * @param {object} sources
 * @param {object} [meta]
 */
export function buildProductIntelligenceReport(sources = {}, meta = {}) {
    const day = meta.day || new Date().toISOString().slice(0, 10);
    const flags = {
        homeV1Deployed: Boolean(meta.homeV1Deployed ?? sources.flags?.homeV1Deployed)
    };
    const answers = answerDailyQuestions(sources, flags);
    const candidates = buildProposalCandidates(answers);
    const proposals = pickTopProposals(candidates, POLICY.maxProposalsPerDay);

    const problemCount = answers.filter((a) => a.answer === 'tak' || a.answer === 'częściowo').length;

    return {
        id: `product-intelligence-${day}`,
        title: 'Product Intelligence — codzienne pytania',
        etapa: '33D',
        generatedAt: new Date().toISOString(),
        day,
        reason: meta.reason || 'cli-product-intelligence',
        policy: { ...POLICY },
        questions: answers,
        candidatesConsidered: candidates.length,
        proposals,
        summary: {
            problemsFlagged: problemCount,
            proposalsCount: proposals.length,
            maxProposalsPerDay: POLICY.maxProposalsPerDay,
            requiresOwnerAcceptance: true,
            autoApply: false,
            tomorrowFocus: proposals[0]?.title || 'Brak pilnych propozycji'
        },
        notes: [
            'Nie zmienia kodu aplikacji.',
            'autoApply=false — czekaj na akceptację właściciela.',
            'Maks. 3 propozycje dziennie.'
        ]
    };
}

/**
 * @param {ReturnType<typeof buildProductIntelligenceReport>} report
 */
export function productIntelligenceToMarkdown(report) {
    const lines = [];
    lines.push('# Product Intelligence — codzienne pytania');
    lines.push('');
    lines.push(`**Dzień:** ${report.day}`);
    lines.push(`**Wygenerowano:** ${report.generatedAt}`);
    lines.push(`**Etap:** ${report.etapa}`);
    lines.push(`**Powód:** ${report.reason}`);
    lines.push('');
    lines.push('## Polityka');
    lines.push('');
    lines.push('- **autoApply:** false');
    lines.push('- **Nie zmienia kodu** aplikacji');
    lines.push('- Max **3** propozycje · status: `pending_acceptance`');
    lines.push('');
    lines.push('## Odpowiedzi dnia');
    lines.push('');
    for (const q of report.questions) {
        lines.push(`### ${q.question}`);
        lines.push('');
        lines.push(`**Odpowiedź:** ${q.answer}`);
        lines.push(`**Severity (problem):** ${q.severity} / 100 · confidence ${q.confidence}`);
        lines.push('');
        lines.push('Dowody:');
        for (const e of q.evidence || []) lines.push(`- ${e}`);
        lines.push('');
    }
    lines.push('## 3 najlepsze propozycje');
    lines.push('');
    if (!report.proposals.length) {
        lines.push('_Brak propozycji — sygnały zbyt słabe._');
        lines.push('');
    } else {
        for (const p of report.proposals) {
            lines.push(`### ${p.rank}. ${p.title}`);
            lines.push('');
            lines.push(`- **ID:** \`${p.id}\``);
            lines.push(`- **Pytanie:** ${p.questionId}`);
            lines.push(`- **Dlaczego:** ${p.why}`);
            lines.push(`- **Wpływ:** ${p.impact} · **Ryzyko:** ${p.risk}`);
            lines.push(`- **Effort:** ${p.effort}`);
            lines.push(`- **Efekt:** ${p.expectedEffect}`);
            lines.push(`- **Priority:** ${p.priority}`);
            lines.push(`- **Status:** ${p.status}`);
            lines.push('');
        }
    }
    lines.push('## Podsumowanie');
    lines.push('');
    lines.push(`| Pole | Wartość |`);
    lines.push(`|------|---------|`);
    lines.push(`| Problemy (tak/częściowo) | ${report.summary.problemsFlagged} / 5 |`);
    lines.push(`| Kandydaci | ${report.candidatesConsidered} |`);
    lines.push(`| Wybrane propozycje | ${report.summary.proposalsCount} |`);
    lines.push(`| Focus na jutro | ${report.summary.tomorrowFocus} |`);
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
export function loadProductIntelligenceSources(root) {
    return {
        health: loadJson(root, 'docs/health/latest.json'),
        emotion: loadJson(root, 'docs/emotion/latest.json'),
        selfReflection: loadJson(root, 'docs/self-reflection/latest.json'),
        productBrain: loadJson(root, 'docs/product-brain/latest.json'),
        homePremium: loadJson(root, 'docs/home-premium/latest.json'),
        performance: {
            overallScore: 44,
            performanceScore: 44,
            scores: { bundle: 28, lazyLoading: 45 }
        },
        flags: {
            homeV1Deployed: fileExists(root, 'docs/home-v1/HOME-V1.md')
                || fileExists(root, 'css/home-v1.css')
        }
    };
}

/**
 * @param {string} root
 * @param {object} [options]
 */
export function runProductIntelligence(root, options = {}) {
    const sources = options.sources || loadProductIntelligenceSources(root);
    const report = buildProductIntelligenceReport(sources, {
        day: options.day,
        reason: options.reason || 'cli-product-intelligence',
        homeV1Deployed: sources.flags?.homeV1Deployed
    });
    const md = productIntelligenceToMarkdown(report);
    const outDir = join(root, 'docs', 'product-intelligence');
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'latest.md'), md, 'utf8');
    writeFileSync(join(outDir, 'latest.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    writeFileSync(join(outDir, `${report.day}.md`), md, 'utf8');
    return { report, md, outDir };
}

export default {
    POLICY,
    DAILY_QUESTIONS,
    answerDailyQuestions,
    buildProposalCandidates,
    pickTopProposals,
    buildProductIntelligenceReport,
    productIntelligenceToMarkdown,
    loadProductIntelligenceSources,
    runProductIntelligence
};
