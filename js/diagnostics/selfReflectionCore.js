/**
 * ETAP 29E – Self Reflection (core)
 * Raz dziennie aplikacja ocenia samą siebie — nie tylko błędy.
 * Nie zmienia kodu. autoApply: false.
 */

export const POLICY = Object.freeze({
    autoApply: false,
    autoFix: false,
    autoModifyCode: false,
    advisoryOnly: true,
    chatbot: false,
    userFacing: false,
    role: 'self-reflection',
    focus: 'daily-self-assessment',
    dailyQuestion: 'Czy chciałbym korzystać z tej aplikacji codziennie?'
});

export const REFLECTION_QUESTIONS = Object.freeze([
    { id: 'beautiful', question: 'Czy jest piękna?' },
    { id: 'intuitive', question: 'Czy jest intuicyjna?' },
    { id: 'warm', question: 'Czy jest ciepła?' },
    { id: 'returnInvite', question: 'Czy zachęca do powrotu?' },
    { id: 'homeOverloaded', question: 'Czy ekran Home nie jest przeładowany?' },
    { id: 'findProducer30s', question: 'Czy użytkownik odnajdzie producenta w mniej niż 30 sekund?' },
    { id: 'betterThanWeek', question: 'Czy aplikacja wygląda lepiej niż tydzień temu?' },
    { id: 'brandCoherent', question: 'Czy marka jest spójna?' },
    { id: 'photosAuthentic', question: 'Czy fotografie są autentyczne?' },
    { id: 'recommendFriends', question: 'Czy użytkownik będzie chciał polecić aplikację znajomym?' }
]);

export const SCORE_KEYS = Object.freeze([
    'ux',
    'brand',
    'performance',
    'emotion',
    'climate',
    'navigation',
    'photos',
    'returnScore',
    'overall'
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

function avg(nums) {
    const parts = nums.filter((n) => typeof n === 'number');
    if (!parts.length) return null;
    return parts.reduce((a, b) => a + b, 0) / parts.length;
}

function verdict(score) {
    if (score == null) return 'unknown';
    if (score >= 90) return 'yes';
    if (score >= 75) return 'mostly';
    if (score >= 60) return 'mixed';
    return 'no';
}

function answerLine(verdictKey, yes, mostly, mixed, no) {
    const map = { yes, mostly, mixed, no, unknown: 'Za mało sygnałów diagnostycznych, by dziś uczciwie odpowiedzieć.' };
    return map[verdictKey] || map.unknown;
}

/**
 * @param {object} sources
 * @param {object} [meta]
 */
export function buildSelfReflectionReport(sources = {}, meta = {}) {
    const day = meta.day || new Date().toISOString().slice(0, 10);
    const health = sources.health || null;
    const emotion = sources.emotion || null;
    const living = sources.livingBrand || sources.living || null;
    const brandProt = sources.brandProtection || null;
    const dream = sources.dream || null;
    const director = sources.director || sources.productDirector || null;
    const daily = sources.daily || null;
    const realUsers = sources.realUsers || null;
    const weekAgo = sources.weekAgo || sources.previousReflection || null;
    const qualityLoop = sources.qualityLoop || null;

    const hUx = num(health?.scores?.ux);
    const hMobile = num(health?.scores?.mobile);
    const hPerf = num(health?.scores?.performance);
    const hPwa = num(health?.scores?.pwa);
    const hA11y = num(health?.scores?.accessibility);
    const hOverall = num(health?.overall);

    const eReturn = num(emotion?.wantToReturn?.score, emotion?.scores?.wantToReturn);
    const eClimate = num(emotion?.scores?.climate);
    const ePhotos = num(emotion?.scores?.photos);
    const eFatigue = num(emotion?.scores?.fatigue);
    const eFriendly = num(emotion?.scores?.friendliness);
    const eColors = num(emotion?.scores?.colors);

    const livingOverall = num(living?.overall);
    const bpStatus = brandProt?.status || null;
    const bpFail = num(brandProt?.summary?.fail, 0) || 0;
    const bpWarn = num(brandProt?.summary?.warning, 0) || 0;
    const dreamScore = num(dream?.dreamScore);
    const productScore = num(director?.productScore, director?.summary?.productScore);
    const dailyScore = num(daily?.appScore);
    const realAvg = num(realUsers?.summary?.averageScore, realUsers?.summary?.avgScore);

    // Brand score from Living Brand + Brand Protection
    let brand = livingOverall;
    if (brand == null) brand = 80;
    if (bpFail > 0) brand = Math.min(brand, 55);
    else if (bpStatus === 'FAIL') brand = Math.min(brand, 60);
    else if (bpStatus === 'WARNING' || bpWarn > 0) brand = Math.min(brand, brand - Math.min(8, bpWarn));
    else if (bpStatus === 'PASS') brand = Math.max(brand, Math.min(100, brand + 2));
    brand = clamp(brand);

    const ux = clamp(avg([hUx, hMobile, hA11y, realAvg]) ?? hUx ?? 70);
    const performance = clamp(hPerf ?? dailyScore ?? 80);
    const emotionScore = clamp(avg([eFriendly, eColors, eClimate, eReturn]) ?? eReturn ?? 75);
    const climate = clamp(eClimate ?? livingOverall ?? 75);
    const navigation = clamp(avg([hUx, hMobile, hPwa, realAvg]) ?? hUx ?? 75);
    const photos = clamp(ePhotos ?? 78);

    // Return: emotion return + (100 - fatigue gap) blend
    let returnScore = eReturn ?? 70;
    if (eFatigue != null && eFatigue < 70) {
        returnScore = avg([returnScore, eFatigue + 20]) ?? returnScore;
    }
    returnScore = clamp(returnScore);

    const overall = clamp(
        avg([ux, brand, performance, emotionScore, climate, navigation, photos, returnScore]) ?? 70
    );

    const scores = {
        ux,
        brand,
        performance,
        emotion: emotionScore,
        climate,
        navigation,
        photos,
        returnScore,
        overall
    };

    // Home overload: fatigue inverted + UX
    const homeCalm = clamp(avg([eFatigue, hUx]) ?? eFatigue ?? hUx ?? 70);
    // 30s find producer: navigation + mobile + real users
    const find30 = clamp(avg([navigation, hMobile, realAvg]) ?? navigation);

    // Better than week ago
    let betterThanWeekScore = null;
    let betterThanWeekNote = 'Brak raportu sprzed tygodnia — to baseline samooceny.';
    if (weekAgo?.scores?.overall != null) {
        const delta = overall - weekAgo.scores.overall;
        betterThanWeekScore = clamp(50 + delta * 4);
        if (delta > 2) betterThanWeekNote = `Tak — overall ${weekAgo.scores.overall} → ${overall} (Δ +${delta}).`;
        else if (delta < -2) betterThanWeekNote = `Niekoniecznie — overall ${weekAgo.scores.overall} → ${overall} (Δ ${delta}).`;
        else betterThanWeekNote = `Prawie bez zmian vs tydzień temu (${weekAgo.scores.overall} → ${overall}).`;
    } else if (qualityLoop?.diff?.improvements?.length && !qualityLoop?.diff?.regressions?.length) {
        betterThanWeekScore = 82;
        betterThanWeekNote = 'Quality Loop nie pokazuje regresji, a są ulepszenia — kierunek jest w górę.';
    } else if (dreamScore != null && dreamScore >= 85) {
        betterThanWeekScore = 80;
        betterThanWeekNote = `Dream score ${dreamScore}% sugeruje zdrowy produkt — trudno mówić o cofnięciu.`;
    } else {
        betterThanWeekScore = 72;
    }

    const beauty = clamp(avg([brand, climate, photos, eColors]) ?? brand);
    const warmth = clamp(avg([climate, eColors, eFriendly, brand]) ?? climate);
    const recommend = clamp(avg([returnScore, beauty, warmth, ux, brand]) ?? overall);

    const qa = {
        beautiful: {
            ...REFLECTION_QUESTIONS[0],
            score: beauty,
            verdict: verdict(beauty),
            answer: answerLine(
                verdict(beauty),
                'Tak — ciepło marki, typografia i klimat regionu układają się w spójną urodę.',
                'W większości tak — są mocne miejsca, ale Home lub detale jeszcze szumią.',
                'Częściowo — fundament jest, lecz przeładowanie lub dryf osłabia wrażenie.',
                'Dziś trudno nazwać ją piękną — za dużo tarcia albo chłodu wizualnego.'
            )
        },
        intuitive: {
            ...REFLECTION_QUESTIONS[1],
            score: ux,
            verdict: verdict(ux),
            answer: answerLine(
                verdict(ux),
                'Tak — ścieżki są czytelne, a decyzje nie wymagają instrukcji.',
                'Raczej tak — główne ścieżki działają, drugorzędne mogą mylić.',
                'Mieszanie — UX ma luki, które kosztują pierwsze sekundy.',
                'Nie dość — użytkownik musi się domyślać zamiast płynąć.'
            )
        },
        warm: {
            ...REFLECTION_QUESTIONS[2],
            score: warmth,
            verdict: verdict(warmth),
            answer: answerLine(
                verdict(warmth),
                'Tak — zieleń, złoto, krem i ton gospodarza budują ciepło regionu.',
                'W większości tak — klimat jest, o ile nie przykryje go clutter.',
                'Ciepło jest, ale konkurują z nim zimne lub głośne akcenty.',
                'Za mało ciepła — bliżej narzędzia niż miejsca.'
            )
        },
        returnInvite: {
            ...REFLECTION_QUESTIONS[3],
            score: returnScore,
            verdict: verdict(returnScore),
            answer: answerLine(
                verdict(returnScore),
                'Tak — jest powód wrócić: klimat, gospodarz dnia, lokalny smak.',
                'Raczej tak — emocja powrotu jest, jeśli nie zmęczy pierwszym ekranem.',
                'Czasem — chce się wracać, ale Home męczy lub rozprasza.',
                'Słabo zachęca — brakuje spokojnej nagrody za powrót.'
            )
        },
        homeOverloaded: {
            ...REFLECTION_QUESTIONS[4],
            score: homeCalm,
            verdict: verdict(homeCalm),
            // pytanie sformułowane pozytywnie „Czy NIE jest przeładowany?”
            answer: answerLine(
                verdict(homeCalm),
                'Tak — Home da się objąć wzrokiem; jedna myśl prowadzi.',
                'Prawie — są nadmiary sekcji, ale da się dojść do sedna.',
                'Nie do końca — Home jest gęsty; fatigue to potwierdza.',
                'Nie — Home jest przeładowany i męczy zamiast witać.'
            )
        },
        findProducer30s: {
            ...REFLECTION_QUESTIONS[5],
            score: find30,
            verdict: verdict(find30),
            answer: answerLine(
                verdict(find30),
                'Tak — mapa / okolica / kategorie prowadzą do producenta w kilkadziesiąt sekund.',
                'Raczej tak — na telefonie ścieżka jest blisko 30 sekund przy jasnym celu.',
                'Zależy — przy clutterze Home lub wielu krokach 30 s bywa zbyt optymistyczne.',
                'Raczej nie — tarcia UX wydłużają odkrycie producenta.'
            )
        },
        betterThanWeek: {
            ...REFLECTION_QUESTIONS[6],
            score: betterThanWeekScore,
            verdict: verdict(betterThanWeekScore),
            answer: betterThanWeekNote
        },
        brandCoherent: {
            ...REFLECTION_QUESTIONS[7],
            score: brand,
            verdict: verdict(brand),
            answer: answerLine(
                verdict(brand),
                'Tak — logo, paleta i typografia trzymają się Brand Book.',
                'W większości tak — Brand Protection bez FAIL, drobne WARNING do pilnowania.',
                'Częściowo — są sygnały dryfu (WARNING/FAIL) względem Brand Book.',
                'Nie — spójność marki jest zagrożona; Brand Book nie jest respektowany.'
            )
        },
        photosAuthentic: {
            ...REFLECTION_QUESTIONS[8],
            score: photos,
            verdict: verdict(photos),
            answer: answerLine(
                verdict(photos),
                'Tak — zdjęcia wyglądają na produktowe i regionalne, nie na stockowy cyber.',
                'W większości tak — autentyczność jest, warto pilnować placeholderów.',
                'Mieszanie — część kadrów buduje miejsce, część jest słabsza.',
                'Słabo — za mało autentycznego obrazu regionu.'
            )
        },
        recommendFriends: {
            ...REFLECTION_QUESTIONS[9],
            score: recommend,
            verdict: verdict(recommend),
            answer: answerLine(
                verdict(recommend),
                'Tak — to aplikacja, którą chce się pokazać jako „nasz region”.',
                'Raczej tak — po krótkim wow klimatycznym chętnie się poleci.',
                'Może — jeśli rozmówca lubi lokalne smaki i zniesie drobne tarcia.',
                'Dziś trudno polecić z czystym sumieniem — najpierw spokój i jasność.'
            )
        }
    };

    // Daily one-sentence answer
    const dailyUse = buildDailyUseAnswer(scores, qa);

    return {
        id: `self-reflection-${day}`,
        title: 'Self Reflection — codzienna samoocena',
        generatedAt: meta.generatedAt || new Date().toISOString(),
        day,
        reason: meta.reason || 'daily-self-reflection',
        policy: { ...POLICY },
        scores,
        qa: REFLECTION_QUESTIONS.map((q) => qa[q.id]),
        dailyUse,
        summary: {
            overall: scores.overall,
            returnScore: scores.returnScore,
            dailyUseAnswer: dailyUse.answer,
            dailyUseVerdict: dailyUse.verdict,
            autoApply: false
        }
    };
}

function buildDailyUseAnswer(scores, qa) {
    const overall = scores.overall;
    const ret = scores.returnScore;
    const home = qa.homeOverloaded?.score ?? 70;
    const warm = qa.warm?.score ?? scores.climate;

    let verdictKey = 'mixed';
    let answer = 'Czasem — gdy szukam lokalnego smaku, ale nie jako odruch codzienny.';

    if (overall >= 90 && ret >= 85 && home >= 70) {
        verdictKey = 'yes';
        answer = 'Tak — chcę tu wracać codziennie: ciepło regionu, jasna wartość i spokojny klimat.';
    } else if (overall >= 82 && ret >= 78) {
        verdictKey = 'mostly';
        answer = 'Raczej tak — korzystałbym często, jeśli Home zostanie lżejszy i nadal ciepły.';
    } else if (overall >= 70 && warm >= 75) {
        verdictKey = 'mixed';
        answer = 'Czasem — klimat zaprasza, ale clutter lub tarcia UX psują codzienny odruch.';
    } else {
        verdictKey = 'no';
        answer = 'Dziś nie jako codzienny nawyk — najpierw spokój, jasność i powód powrotu.';
    }

    return {
        question: POLICY.dailyQuestion,
        verdict: verdictKey,
        answer,
        basedOn: { overall, returnScore: ret, homeCalm: home, warmth: warm }
    };
}

export function selfReflectionToMarkdown(report) {
    const lines = [
        `# ${report.title}`,
        '',
        `Dzień: **${report.day}**`,
        `Wygenerowano: ${report.generatedAt}`,
        '',
        `## Overall: **${report.scores.overall} / 100**`,
        '',
        '## Polityka',
        '',
        '- **autoApply: false** — nie zmienia kodu',
        '- Nigdy nie wdraża zmian automatycznie',
        '- To samoocena jakości i klimatu — nie tylko lista błędów',
        '',
        '## Oceny',
        ''
    ];

    const labels = {
        ux: 'UX',
        brand: 'Brand',
        performance: 'Performance',
        emotion: 'Emotion',
        climate: 'Climate',
        navigation: 'Navigation',
        photos: 'Photos',
        returnScore: 'Return Score',
        overall: 'Overall'
    };

    for (const key of SCORE_KEYS) {
        lines.push(`- **${labels[key] || key}:** ${report.scores[key] ?? '—'}`);
    }

    lines.push('', '## Pytania samooceny', '');
    for (const q of report.qa || []) {
        lines.push(`### ${q.question}`);
        lines.push('');
        lines.push(`**${q.answer}**`);
        lines.push('');
        lines.push(`_score ${q.score ?? '—'} · verdict: ${q.verdict}_`);
        lines.push('');
    }

    lines.push('## Jedno zdanie', '');
    lines.push(`### ${report.dailyUse?.question || POLICY.dailyQuestion}`);
    lines.push('');
    lines.push(`> ${report.dailyUse?.answer || '—'}`);
    lines.push('');
    return lines.join('\n');
}

export default {
    POLICY,
    REFLECTION_QUESTIONS,
    SCORE_KEYS,
    buildSelfReflectionReport,
    selfReflectionToMarkdown
};
