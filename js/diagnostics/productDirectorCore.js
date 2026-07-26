/**
 * ETAP 27 – AI Product Director (pure)
 * Codzienny „mózg” produktu — perspektywa biznesowa, nie tylko tech.
 * autoFix: false · advisoryOnly: true
 */

export const POLICY = Object.freeze({
    autoFix: false,
    autoModifyCode: false,
    advisoryOnly: true,
    role: 'product-director',
    focus: 'business-product-review'
});

export const DIRECTOR_QUESTIONS = Object.freeze([
    { id: 'improve', question: 'Co poprawić?' },
    { id: 'remove', question: 'Co usunąć?' },
    { id: 'simplify', question: 'Co uprościć?' },
    { id: 'slowdown', question: 'Co spowalnia aplikację?' },
    { id: 'annoy', question: 'Co denerwuje użytkownika?' },
    { id: 'returns', question: 'Co zwiększy liczbę powrotów?' },
    { id: 'competition', question: 'Jak wygląda konkurencja?' },
    { id: 'monthAgo', question: 'Czy produkt jest lepszy niż miesiąc temu?' }
]);

/** Pozycjonowanie vs konkurencja (kanoniczne, z Master Report) */
export const COMPETITION_BASELINE = Object.freeze([
    {
        name: 'Google Maps',
        theirs: 'Uniwersalna nawigacja wszystkiego, ranking reklamowy',
        ours: 'Fokus na żywność regionalną, opowieść miejsca, trasy zakupowe',
        edge: 'Emocja regionu + producenci, nie „kolejny pin”'
    },
    {
        name: 'TripAdvisor',
        theirs: 'Globalne recenzje podróży / restauracji',
        ours: 'Lokalny ekosystem żywności: gospodarstwa, piekarnie, produkty',
        edge: 'PWA regionu, nie ranking turystyczny'
    },
    {
        name: 'Yelp',
        theirs: 'Katalog biznesów + recenzje miejskie',
        ours: 'Marka regionalnego smaku, kategorie żywności, dusza regionu',
        edge: 'Klimat i zaufanie lokalne > katalog'
    },
    {
        name: 'Too Good To Go',
        theirs: 'Nadwyżki żywności z dyskontem czasowym',
        ours: 'Codzienne odkrywanie i wspieranie producentów',
        edge: 'Relacja z miejscem, nie tylko okazja last-minute'
    }
]);

function dayStamp(d = new Date()) {
    return d.toISOString().slice(0, 10);
}

function bullets(items, empty = 'Brak silnego sygnału — utrzymuj rytm produktu.') {
    const list = (items || []).filter(Boolean).slice(0, 6);
    if (!list.length) return `• ${empty}`;
    return list.map((x) => `• ${x}`).join('\n');
}

function compositeProductScore(input = {}) {
    const health = input.health?.overall ?? input.health?.scores?.performance ?? null;
    const daily = input.daily?.appScore ?? null;
    const emotion = input.emotion?.wantToReturn?.score ?? input.emotion?.overallEmotion ?? null;
    const brand = input.livingBrand?.overall ?? null;
    const vu = input.virtual?.summary?.score ?? null;
    const real = input.realUsers?.summary?.avgScore ?? null;
    const parts = [health, daily, emotion, brand, vu, real].filter((n) => typeof n === 'number');
    if (!parts.length) return null;
    return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}

/**
 * @param {object} input — raporty diagnostyczne + opcjonalnie monthBaseline
 */
export function buildProductDirectorBriefing(input = {}) {
    const health = input.health || {};
    const scores = health.scores || {};
    const improve = input.improve || {};
    const proposals = improve.proposals || [];
    const virtual = input.virtual || {};
    const vuBy = virtual.summary?.byType || {};
    const vuIssues = virtual.issues || [];
    const advisor = input.advisor || {};
    const emotion = input.emotion || {};
    const livingBrand = input.livingBrand || {};
    const realUsers = input.realUsers || {};
    const daily = input.daily || {};
    const qualityLoop = input.qualityLoop || {};
    const learning = input.learning || {};
    const monthBaseline = input.monthBaseline || null;

    const productScore = compositeProductScore(input);
    const failedChecks = daily.failedChecks || [];
    const brandDrift = livingBrand.status === 'drift' || (livingBrand.overall ?? 100) < 85;
    const emotionReturn = emotion.wantToReturn?.score ?? null;
    const worstPersona = realUsers.worst?.[0];
    const qlRegressions = qualityLoop.diff?.regressions || qualityLoop.summary?.regressionCount || 0;

    // ——— Co poprawić? ———
    const improveItems = [];
    for (const p of proposals.slice(0, 3)) {
        improveItems.push(`[${p.priority || 'med'}] ${p.title}`);
    }
    if (brandDrift) {
        improveItems.push(
            `Spójność marki (Living Brand ${livingBrand.overall ?? '—'}%): ${livingBrand.verdict || 'usuń dryf fontów/cieni/logo'}`
        );
    }
    if (typeof emotionReturn === 'number' && emotionReturn < 80) {
        improveItems.push(`Emocja powrotu ${emotionReturn}% — dogrzaj najsłabszy wymiar Emotion AI`);
    }
    if (worstPersona && worstPersona.score < 85) {
        improveItems.push(
            `Persona ${worstPersona.code} (${worstPersona.tagline || worstPersona.name}) — ${worstPersona.score}%`
        );
    }
    if ((scores.ux ?? 100) < 88) improveItems.push(`UX Health ${scores.ux}% — ergonomia pierwszego viewportu`);
    if (!improveItems.length) {
        improveItems.push(advisor.headline || 'Utrzymaj rytm: Health → Emotion → Living Brand → Director');
    }

    // ——— Co usunąć? ———
    const removeItems = [];
    if (brandDrift && (livingBrand.findings || []).some((f) => f.check === 'fonts')) {
        removeItems.push('Obce fonty (Inter / Roboto…) z landing / warstw CSS — zostaw Literata + Source Sans 3');
    }
    if ((livingBrand.findings || []).some((f) => f.check === 'coldBlue')) {
        removeItems.push('Wszelki zimny niebieski z UI marki');
    }
    if ((emotion.scores?.fatigue ?? 100) < 60) {
        removeItems.push('Konkurujące CTA / bloki na Home, które męczą zamiast witać');
    }
    if ((vuBy.flicker || 0) > 2) {
        removeItems.push('Zbędne przełączanie class/hidden powodujące miganie');
    }
    // biznesowo: rzeczy które „szumią”
    removeItems.push('Szum produktowy: sekcje Home bez jednej dominującej akcji (przytnij, nie doklejaj)');
    if (proposals.some((p) => /legacy|dead|unused|duplikat/i.test(p.title || ''))) {
        removeItems.push('Martwy / zduplikowany kod wskazany przez Improvement Engine');
    }
    if (removeItems.length < 2) {
        removeItems.push('Placeholderowe treści i puste „karty na siłę” — lepiej mniej, ale autentycznie');
    }

    // ——— Co uprościć? ———
    const simplifyItems = [];
    simplifyItems.push('Pierwszy viewport Home: jedna obietnica + jedno CTA (mapa lub „Dla Ciebie”)');
    if ((scores.mobile ?? 100) < 95 || (vuBy.touch || 0) > 0) {
        simplifyItems.push('Ścieżka nowicjusza: Home → najbliższy producent w ≤3 tapnięciach');
    }
    if ((realUsers.summary?.fail || 0) > 0 || worstPersona?.code === 'P01') {
        simplifyItems.push('Tryb „prosty” dla seniorów / nowicjuszy (większe cele, mniej opcji)');
    }
    simplifyItems.push('Premium: jedna jasna wartość, bez ściany benefitów');
    if ((emotion.scores?.textLoad ?? 100) < 75) {
        simplifyItems.push('Tekst na ekranach: krótsze bloki, więcej powietrza i zdjęć');
    }

    // ——— Co spowalnia? ———
    const slowItems = [];
    if ((scores.performance ?? 100) < 90 || (health.runtime?.avgRenderMs || 0) > 40) {
        slowItems.push(`Render / Performance Health ${scores.performance ?? '—'}% (avgRenderMs: ${health.runtime?.avgRenderMs ?? '—'})`);
    }
    if ((health.runtime?.duplicateFetches || 0) > 0) {
        slowItems.push(`Zduplikowane fetch (${health.runtime.duplicateFetches})`);
    }
    if ((vuBy.fps || 0) > 0 || (scores.memory ?? 100) < 90) {
        slowItems.push('Mapa Leaflet: FPS / pamięć przy markerach i filtrach');
    }
    if ((scores.pwa ?? 100) < 92) {
        slowItems.push('PWA / Service Worker — koszt startu i cache');
    }
    if (failedChecks.includes('fps') || failedChecks.includes('performance')) {
        slowItems.push(`Daily checklist: ${failedChecks.filter((c) => /fps|perf|memory/i.test(c)).join(', ') || 'wydajność'}`);
    }
    if (!slowItems.length) {
        slowItems.push('Brak alarmu wydajności — pilnuj mapy i Home przy kolejnych feature’ach');
    }

    // ——— Co denerwuje? ———
    const annoyItems = [];
    for (const i of vuIssues.filter((x) => x.severity === 'high').slice(0, 3)) {
        annoyItems.push(`${i.title}${i.scenario ? ` (${i.scenario})` : ''}`);
    }
    if ((vuBy.touch || 0) > 0) annoyItems.push('Za małe cele dotykowe na mobile');
    if ((vuBy.translation || 0) > 0 || (scores.translation ?? 100) < 98) {
        annoyItems.push('Luki i18n / klucze zamiast tekstu');
    }
    if ((vuBy.error || 0) > 0) annoyItems.push('Błędy JS na typowych ścieżkach');
    if (worstPersona && worstPersona.score < 85) {
        annoyItems.push(`Tarcia persony: ${worstPersona.code} — ${worstPersona.tagline || ''}`);
    }
    const advisorFriction = advisor.qa?.find?.((q) => q.id === 'userFriction')?.answer
        || advisor.answers?.userFriction?.answer;
    if (!annoyItems.length && advisorFriction) {
        annoyItems.push('Patrz briefing Doradcy (user friction) — brak świeżych high VU');
    }
    if (!annoyItems.length) {
        annoyItems.push('Brak ostrych sygnałów — największe ryzyko to przeładowany Home, nie pojedynczy bug');
    }

    // ——— Powroty ———
    const returnItems = [];
    if (typeof emotionReturn === 'number') {
        returnItems.push(
            `Emotion AI powrót ${emotionReturn}% — ${emotion.wantToReturn?.short || emotion.headline || 'dogrzewaj klimat'}`
        );
    }
    const topCat = learning?.affinity?.topCategories?.[0]?.id;
    if (topCat) {
        returnItems.push(`Personalizacja „Dla Ciebie” pod kategorię „${topCat}” (Learning)`);
    } else {
        returnItems.push('Wzmacniaj Learning lokalnie — rozpoznawalny Home po 2–3 sesjach');
    }
    returnItems.push('Ciepły powrót po przerwie (magia powrotu / smaki dnia) — jeden impuls, nie spam');
    returnItems.push('Ulubione + trasa zakupowa jako kotwica „wróć do mojego regionu”');
    if (brandDrift) {
        returnItems.push('Spójna marka (Living Brand) buduje zaufanie — dryf osłabia chęć powrotu');
    }
    if ((emotion.scores?.photos ?? 100) < 80) {
        returnItems.push('Więcej autentycznych zdjęć producentów — smak widać, więc się wraca');
    }

    // ——— Konkurencja ———
    const compLines = COMPETITION_BASELINE.map(
        (c) => `${c.name}: my wygrywamy „${c.edge}” (oni: ${c.theirs.slice(0, 60)}…)`
    );
    let compExtra = '';
    if (typeof emotionReturn === 'number' && emotionReturn >= 85) {
        compExtra = 'Dziś Emotion AI wspiera przewagę emocjonalną vs katalogi (Maps/Yelp).';
    } else if (typeof emotionReturn === 'number') {
        compExtra = 'Emocja powrotu poniżej 85% — tu konkurencja „narzędziowa” może wygrać wygodą.';
    } else {
        compExtra = 'Uruchom Emotion AI, by zmierzyć przewagę emocjonalną vs konkurencję.';
    }

    // ——— Miesiąc temu ———
    let monthAnswer;
    let monthConfidence = 'low';
    const monthScore = monthBaseline?.productScore ?? monthBaseline?.overall ?? null;
    if (typeof productScore === 'number' && typeof monthScore === 'number') {
        const delta = Math.round((productScore - monthScore) * 10) / 10;
        monthConfidence = 'high';
        if (delta >= 3) {
            monthAnswer = `Tak — produktScore ${productScore}% vs ${monthScore}% miesiąc temu (Δ +${delta}). Kierunek wzrostowy.`;
        } else if (delta <= -3) {
            monthAnswer = `Nie do końca — produktScore ${productScore}% vs ${monthScore}% (Δ ${delta}). Regresja produktowa do przejrzenia.`;
        } else {
            monthAnswer = `Stabilnie — ${productScore}% vs ${monthScore}% (Δ ${delta >= 0 ? '+' : ''}${delta}). Ewolucja, nie skok.`;
        }
        if (monthBaseline?.day) {
            monthAnswer += `\nBaseline: ${monthBaseline.day}`;
        }
    } else if (typeof productScore === 'number' && input.weekBaseline?.productScore != null) {
        const wb = input.weekBaseline;
        const delta = Math.round((productScore - wb.productScore) * 10) / 10;
        monthConfidence = 'medium';
        monthAnswer = `Brak pełnego baseline’u sprzed miesiąca. Vs wcześniejszy zapis (${wb.day || 'archiwum'}): ${productScore}% vs ${wb.productScore}% (Δ ${delta >= 0 ? '+' : ''}${delta}). Za ~30 dni będzie pełne porównanie.`;
    } else {
        monthAnswer = `Dziś ustalamy baseline produktScore: ${productScore ?? '—'}%. Za miesiąc Director odpowie porównaniem. Archiwum: docs/product-director/.`;
        monthConfidence = 'low';
    }

    const answers = {
        improve: {
            answer: bullets(improveItems),
            confidence: proposals.length ? 'high' : 'medium',
            sources: ['improvement', 'living-brand', 'emotion', 'real-users']
        },
        remove: {
            answer: bullets(removeItems),
            confidence: 'medium',
            sources: ['living-brand', 'emotion', 'improvement']
        },
        simplify: {
            answer: bullets(simplifyItems),
            confidence: 'high',
            sources: ['emotion', 'real-users', 'expert-review']
        },
        slowdown: {
            answer: bullets(slowItems),
            confidence: (scores.performance ?? 100) < 90 ? 'high' : 'medium',
            sources: ['health', 'virtual-user', 'daily']
        },
        annoy: {
            answer: bullets(annoyItems),
            confidence: vuIssues.length ? 'high' : 'medium',
            sources: ['virtual-user', 'real-users', 'advisor']
        },
        returns: {
            answer: bullets(returnItems),
            confidence: typeof emotionReturn === 'number' ? 'high' : 'medium',
            sources: ['emotion', 'learning', 'living-brand']
        },
        competition: {
            answer: `${bullets(compLines)}\n\n${compExtra}`,
            confidence: 'high',
            sources: ['master-report', 'emotion', 'positioning']
        },
        monthAgo: {
            answer: monthAnswer,
            confidence: monthConfidence,
            sources: ['product-director-archive', 'health', 'emotion', 'daily']
        }
    };

    const qa = DIRECTOR_QUESTIONS.map((q) => ({
        id: q.id,
        question: q.question,
        ...answers[q.id]
    }));

    const priorities = [
        improveItems[0],
        removeItems[0],
        simplifyItems[0],
        typeof qlRegressions === 'number' && qlRegressions > 0
            ? `Quality Loop: ${qlRegressions} regresji do przejrzenia`
            : null
    ].filter(Boolean);

    const headline = priorities[0] || 'Produkt w rytmie — trzymaj kurs emocji i marki';

    return {
        title: 'AI Product Director – codzienny przegląd produktu',
        generatedAt: new Date().toISOString(),
        day: dayStamp(),
        policy: { ...POLICY },
        headline,
        productScore,
        summary: {
            productScore,
            healthOverall: health.overall ?? null,
            dailyAppScore: daily.appScore ?? null,
            emotionReturn,
            livingBrand: livingBrand.overall ?? null,
            virtualScore: virtual.summary?.score ?? null,
            realUsersAvg: realUsers.summary?.avgScore ?? null,
            priorities: priorities.slice(0, 4),
            monthBaselineDay: monthBaseline?.day || null,
            weekBaselineDay: input.weekBaseline?.day || null
        },
        qa,
        competition: COMPETITION_BASELINE,
        priorities: priorities.slice(0, 5),
        decisionNote: 'To briefing biznesowy. Żadna poprawka nie jest wdrażana automatycznie — Ty decydujesz.'
    };
}

export { compositeProductScore, dayStamp };
export default { buildProductDirectorBriefing, DIRECTOR_QUESTIONS, POLICY };
