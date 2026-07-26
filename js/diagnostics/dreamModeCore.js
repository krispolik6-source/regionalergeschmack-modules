/**
 * ETAP 29A – AI Dream Mode (core)
 * Codzienna refleksja Product Owner. Tylko analiza. autoApply: false.
 */

export const POLICY = Object.freeze({
    autoFix: false,
    autoApply: false,
    autoModifyCode: false,
    advisoryOnly: true,
    chatbot: false,
    userFacing: false,
    role: 'product-owner-dream',
    focus: 'end-of-day-product-reflection'
});

export const DREAM_QUESTIONS = Object.freeze([
    { id: 'best', question: 'Co dzisiaj było najlepsze?' },
    { id: 'worst', question: 'Co było najgorsze?' },
    { id: 'simplifyScreens', question: 'Które ekrany wymagają uproszczenia?' },
    { id: 'unused', question: 'Które funkcje są prawie nieużywane?' },
    { id: 'remove', question: 'Co można usunąć?' },
    { id: 'simplify', question: 'Co można uprościć?' },
    { id: 'faster', question: 'Co można przyspieszyć?' },
    { id: 'look', question: 'Jak poprawić wygląd?' },
    { id: 'returns', question: 'Jak zwiększyć liczbę powrotów użytkowników?' },
    { id: 'climate', question: 'Jak poprawić klimat aplikacji?' },
    { id: 'top3', question: 'Jakie trzy zmiany dadzą największy efekt?' }
]);

function clamp(n) {
    return Math.max(0, Math.min(100, Math.round(n)));
}

function num(...vals) {
    for (const v of vals) {
        if (typeof v === 'number' && !Number.isNaN(v)) return v;
    }
    return null;
}

function bullets(items, fallback = '_Brak sygnału w dzisiejszych raportach._') {
    const list = (items || []).filter(Boolean);
    if (!list.length) return fallback;
    return list.map((x) => `• ${x}`).join('\n');
}

/**
 * @param {object} sources — latest JSON dumps
 */
export function buildDreamReport(sources = {}, meta = {}) {
    const health = sources.health || null;
    const guardian = sources.guardian || null;
    const learning = sources.learning || sources.advisor || null;
    const improve = sources.improve || sources.improvement || null;
    const virtual = sources.virtual || sources.virtualUser || null;
    const emotion = sources.emotion || null;
    const living = sources.livingBrand || sources.living || null;
    const director = sources.director || sources.productDirector || null;
    const realUsers = sources.realUsers || null;
    const qualityLoop = sources.qualityLoop || null;
    const daily = sources.daily || null;

    const hOverall = num(health?.overall);
    const hUx = num(health?.scores?.ux);
    const hPerf = num(health?.scores?.performance);
    const hMobile = num(health?.scores?.mobile);
    const emotionReturn = num(emotion?.wantToReturn?.score, emotion?.scores?.wantToReturn);
    const emotionFatigue = num(emotion?.scores?.fatigue);
    const livingOverall = num(living?.overall);
    const productScore = num(director?.productScore, director?.summary?.productScore);
    const dailyScore = num(daily?.appScore);
    const vuScore = num(virtual?.summary?.score, virtual?.score);
    const realAvg = num(
        realUsers?.summary?.averageScore,
        realUsers?.summary?.avgScore,
        realUsers?.averageScore
    );
    const gQuality = num(guardian?.scores?.quality);
    const gReady = num(guardian?.scores?.productionReady);
    const improveCount = num(
        improve?.summary?.total,
        improve?.proposals?.length,
        (improve?.proposals || []).length
    );
    const regressions = num(
        qualityLoop?.summary?.regressionCount,
        (qualityLoop?.diff?.regressions || []).length,
        0
    );

    const modules = {
        health: Boolean(health),
        guardian: Boolean(guardian),
        learning: Boolean(learning) || 'browser-local / advisor proxy',
        improvement: Boolean(improve),
        virtualUser: Boolean(virtual),
        emotion: Boolean(emotion),
        livingBrand: Boolean(living),
        productDirector: Boolean(director),
        realUsers: Boolean(realUsers)
    };

    // dream-score: zdrowie produktu + emocja powrotu + brand − regresje/fatigue
    const parts = [
        hOverall,
        hUx,
        hPerf,
        emotionReturn,
        livingOverall,
        productScore,
        dailyScore,
        realAvg,
        vuScore,
        gQuality != null ? gQuality * 10 : null,
        gReady != null ? gReady * 10 : null
    ].filter((n) => typeof n === 'number');

    let dreamScore = parts.length
        ? parts.reduce((a, b) => a + b, 0) / parts.length
        : 50;

    if (emotionFatigue != null && emotionFatigue < 60) {
        dreamScore -= (60 - emotionFatigue) * 0.15;
    }
    if (regressions > 0) dreamScore -= Math.min(12, regressions * 3);
    if ((improveCount || 0) > 10) dreamScore -= 4;
    dreamScore = clamp(dreamScore);

    const strengths = [];
    if (hOverall != null && hOverall >= 95) strengths.push(`Health overall ${hOverall}% — aplikacja stoi solidnie`);
    if (hMobile != null && hMobile >= 95) strengths.push(`Mobile ${hMobile}% — ścieżka telefonu jest czysta`);
    if (hPerf != null && hPerf >= 95) strengths.push(`Performance ${hPerf}% — szybkość nie boli`);
    if (emotionReturn != null && emotionReturn >= 85) {
        strengths.push(`Emotion wantToReturn ${emotionReturn}% — klimat zaprasza do powrotu`);
    }
    if (livingOverall != null && livingOverall >= 90) {
        strengths.push(`Living Brand ${livingOverall}% — marka trzyma się Brand Book`);
    }
    if (realAvg != null && realAvg >= 90) {
        strengths.push(`Real Users średnio ${realAvg}% — persony przechodzą ścieżki`);
    }
    if (productScore != null && productScore >= 90) {
        strengths.push(`Product Director ${productScore}% — kierunek produktu spójny`);
    }
    if (!strengths.length && parts.length) {
        strengths.push(`Baseline dream-score ${dreamScore} — są fundamenty do dopracowania`);
    }

    const weaknesses = [];
    if (hUx != null && hUx < 90) weaknesses.push(`UX Health ${hUx}% — tarcia w pierwszym kontakcie`);
    if (emotionFatigue != null && emotionFatigue < 60) {
        weaknesses.push(`Emotion fatigue ${emotionFatigue}% — za dużo bodźców / CTA`);
    }
    if (livingOverall != null && livingOverall < 90) {
        weaknesses.push(`Living Brand ${livingOverall}% — dryf lub niespójność wizualna`);
    }
    if (vuScore == null && virtual?.summary?.status) {
        weaknesses.push(`Virtual User: ${virtual.summary.status} — brak świeżego przebiegu przeglądarki`);
    }
    if (regressions > 0) weaknesses.push(`Quality Loop: ${regressions} regresji vs poprzedni dzień`);
    if ((improveCount || 0) > 0) {
        const top = (improve?.proposals || []).slice(0, 2).map((p) => p.title).filter(Boolean);
        if (top.length) weaknesses.push(`Improvement: ${top.join('; ')}`);
    }
    for (const f of (guardian?.findings || []).filter((x) => x.severity === 'high' || x.severity === 'critical').slice(0, 2)) {
        weaknesses.push(`Guardian [${f.severity}]: ${f.title}`);
    }
    if (!weaknesses.length) weaknesses.push('Brak ostrego „najgorszego” — pilnuj, by nie dokładać złożoności');

    const directorPriorities = (director?.summary?.priorities || []).slice(0, 5);
    const improveTitles = (improve?.proposals || []).slice(0, 6).map((p) => `[${p.priority || 'medium'}] ${p.title}`);

    const answers = {
        best: {
            ...DREAM_QUESTIONS[0],
            answer: bullets(strengths),
            confidence: strengths.length ? 'high' : 'low',
            sources: ['health', 'emotion', 'living-brand', 'real-users', 'director']
        },
        worst: {
            ...DREAM_QUESTIONS[1],
            answer: bullets(weaknesses),
            confidence: weaknesses.length ? 'high' : 'medium',
            sources: ['health', 'emotion', 'guardian', 'quality-loop', 'improvement']
        },
        simplifyScreens: {
            ...DREAM_QUESTIONS[2],
            answer: bullets([
                hUx != null && hUx < 92 ? 'Home — za dużo sekcji i CTA w pierwszym viewportcie' : null,
                emotionFatigue != null && emotionFatigue < 65 ? 'Home / Premium — zmęczenie bodźcami (Emotion)' : null,
                'Mapa — kontrolki i filtry: zostaw jedną dominującą akcję na telefonie',
                'Profil / Menu — długie listy: pogrupuj, ukryj rzadkie pozycje',
                ...directorPriorities.filter((p) => /home|ux|mobile|viewport|cta/i.test(p))
            ]),
            confidence: 'medium',
            sources: ['emotion', 'director', 'health']
        },
        unused: {
            ...DREAM_QUESTIONS[3],
            answer: bullets([
                'Sekcje Home bez jednej dominującej akcji (narracje „nice to have” poniżej fold)',
                'Rzadkie pozycje side-menu (testy / PDF), jeśli nie prowadzą do konwersji',
                learning?.summary?.topCategory
                    ? `Learning sugeruje fokus na: ${learning.summary.topCategory} — reszta może być drugoplanowa`
                    : 'Learning (browser-local) — po sesjach sprawdź, które kategorie nie dostają sygnału',
                vuScore == null ? 'Scenariusze Virtual User nieodpalone — nie wiemy, które ścieżki są martwe w runtime' : null
            ]),
            confidence: 'medium',
            sources: ['learning', 'virtual-user', 'emotion']
        },
        remove: {
            ...DREAM_QUESTIONS[4],
            answer: bullets([
                ...(director?.qa || [])
                    .filter((q) => q.id === 'remove')
                    .flatMap((q) => String(q.answer || '').split('\n').map((l) => l.replace(/^[•\-]\s*/, '').trim()))
                    .filter(Boolean)
                    .slice(0, 4),
                emotionFatigue != null && emotionFatigue < 55
                    ? 'Konkurujące CTA / bloki na Home, które męczą zamiast witać'
                    : null,
                'Szum diagnostyczny w UI użytkownika (jeśli kiedykolwiek wycieknie z Dev Panel)'
            ]),
            confidence: 'medium',
            sources: ['director', 'emotion', 'living-brand']
        },
        simplify: {
            ...DREAM_QUESTIONS[5],
            answer: bullets([
                'Pierwszy viewport Home: jedna obietnica + jedno CTA',
                'Bottom nav etykiety — już clamp; pilnuj, by nie wracały długie nazwy',
                'Warstwy CSS — mniej konfliktów = mniej niespodzianek wizualnych',
                ...improveTitles.slice(0, 3)
            ]),
            confidence: 'high',
            sources: ['improvement', 'emotion', 'health']
        },
        faster: {
            ...DREAM_QUESTIONS[6],
            answer: bullets([
                hPerf != null && hPerf < 95 ? `Dobij Performance (dziś ${hPerf}%)` : 'Utrzymaj Performance — unikaj ciężkich skryptów na starcie',
                'Mapa: MarkerCluster już jest — nie dokładaj ciężkich warstw bez potrzeby',
                'Obrazy produktów / kategorii: pilnuj rozmiarów i lazy gdzie jest',
                'Service Worker: ikony network-first (już) — nie wracaj do cache-first na brand assets'
            ]),
            confidence: 'medium',
            sources: ['health', 'guardian']
        },
        look: {
            ...DREAM_QUESTIONS[7],
            answer: bullets([
                livingOverall != null && livingOverall < 95
                    ? `Domknij Living Brand (dziś ${livingOverall}%) — fonty/cienie/spójność`
                    : 'Utrzymaj Brand Lock: Literata + Source Sans 3, logo-master, paleta z Brand Book',
                'Header: same kłosy bez kafelka — nie przywracaj mini-ikony z tłem',
                'Kontrast w słońcu na headerze i CTA — już wzmocniony; nie rozmywaj',
                ...((living?.findings || []).filter((f) => f.severity === 'high' || f.severity === 'medium').slice(0, 3).map((f) => f.title))
            ]),
            confidence: 'high',
            sources: ['living-brand', 'emotion']
        },
        returns: {
            ...DREAM_QUESTIONS[8],
            answer: bullets([
                emotionReturn != null
                    ? `Cel: utrzymaj / podnieś wantToReturn (dziś ${emotionReturn}%)`
                    : 'Zmierz Emotion wantToReturn codziennie',
                'Jedna jasna nagroda za powrót: lokalne smaki / „dziś w okolicy”, nie 12 banerów',
                'Skróć ścieżkę mapa → producent → kontakt',
                'Zmniejsz fatigue — mniej CTA = więcej chęci wrócić',
                realAvg != null ? `Real Users ${realAvg}% — wzmacniaj ścieżki person z najniższym score` : null
            ]),
            confidence: 'high',
            sources: ['emotion', 'real-users', 'director']
        },
        climate: {
            ...DREAM_QUESTIONS[9],
            answer: bullets([
                emotion?.strongest ? `Wzmocnij to, co działa: ${emotion.strongest}` : 'Wzmocnij ciepło: zdjęcia, złoto, spokojna typografia',
                emotion?.weakest ? `Podciągnij najsłabszy wymiar: ${emotion.weakest}` : null,
                'Fotografie i motywy regionalne zamiast abstrakcyjnych gradientów',
                'Mniej „AI glow” / zimnych akcentów — Brand Book',
                num(emotion?.scores?.climate) != null ? `Climate score: ${emotion.scores.climate}%` : null
            ]),
            confidence: 'high',
            sources: ['emotion', 'living-brand']
        },
        top3: {
            ...DREAM_QUESTIONS[10],
            answer: bullets(
                [
                    ...directorPriorities.slice(0, 2),
                    emotionFatigue != null && emotionFatigue < 65
                        ? 'Home: jedna obietnica + jedno CTA (obniż fatigue)'
                        : null,
                    livingOverall != null && livingOverall < 92
                        ? 'Domknij spójność marki (Living Brand / Visual Brand)'
                        : null,
                    hUx != null && hUx < 90 ? `Podnieś UX Health (dziś ${hUx}%)` : null,
                    ...improveTitles.slice(0, 2)
                ]
                    .filter(Boolean)
                    .slice(0, 3)
            ),
            confidence: 'high',
            sources: ['director', 'emotion', 'improvement', 'living-brand']
        }
    };

    const day = meta.day || new Date().toISOString().slice(0, 10);

    return {
        id: `dream-${day}`,
        title: 'AI Dream Mode — codzienny Product Owner',
        generatedAt: meta.generatedAt || new Date().toISOString(),
        day,
        reason: meta.reason || 'end-of-day',
        policy: { ...POLICY },
        dreamScore,
        headline: answers.top3.answer.split('\n')[0]?.replace(/^•\s*/, '') || `Dream score ${dreamScore}`,
        modules,
        scores: {
            dreamScore,
            healthOverall: hOverall,
            healthUx: hUx,
            healthPerformance: hPerf,
            emotionReturn,
            emotionFatigue,
            livingBrand: livingOverall,
            productDirector: productScore,
            dailyAppScore: dailyScore,
            virtualUser: vuScore,
            realUsersAvg: realAvg,
            guardianQuality: gQuality,
            regressions
        },
        qa: DREAM_QUESTIONS.map((q) => answers[q.id]),
        top3: (answers.top3.answer.match(/^• .+$/gm) || []).map((l) => l.replace(/^•\s*/, '')),
        summary: {
            dreamScore,
            best: strengths[0] || null,
            worst: weaknesses[0] || null,
            modulesPresent: Object.values(modules).filter((v) => v && v !== false).length,
            autoApply: false
        }
    };
}

export function dreamReportToMarkdown(report) {
    const lines = [
        `# ${report.title}`,
        '',
        `Dzień: **${report.day}**`,
        `Wygenerowano: ${report.generatedAt}`,
        '',
        `## Dream score: **${report.dreamScore} / 100**`,
        '',
        '## Polityka',
        '',
        '- **autoApply: false** — nie zmienia kodu',
        '- Nie chatbot · nie odpowiada użytkownikowi',
        '- Tylko refleksja Product Owner na koniec dnia',
        '',
        '## Moduły wejściowe',
        ''
    ];

    for (const [k, v] of Object.entries(report.modules || {})) {
        lines.push(`- ${k}: ${v === true ? '✔' : v === false ? '✖' : v}`);
    }

    lines.push('', '## Scores', '');
    for (const [k, v] of Object.entries(report.scores || {})) {
        lines.push(`- ${k}: ${v ?? '—'}`);
    }

    lines.push('', '## Pytania Product Owner', '');
    for (const q of report.qa || []) {
        lines.push(`### ${q.question}`, '', q.answer || '—', '');
        if (q.sources?.length) lines.push(`_Źródła: ${q.sources.join(', ')}_`, '');
    }

    lines.push('## Trzy zmiany o największym efekcie', '');
    for (const t of report.top3 || []) lines.push(`1. ${t}`);
    lines.push('');
    return lines.join('\n');
}

export default {
    POLICY,
    DREAM_QUESTIONS,
    buildDreamReport,
    dreamReportToMarkdown
};
