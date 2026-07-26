/**
 * ETAP 25 – Emotion AI (pure)
 * Pytanie główne: czy aplikacja wywołuje emocje / czy chce się wrócić?
 * Nie ocenia „czy działa” ani „czy jest szybka”.
 */

export const EMOTION_DIMENSIONS = Object.freeze([
    'climate',
    'colors',
    'photos',
    'textLoad',
    'fatigue',
    'friendliness'
]);

export const POLICY = Object.freeze({
    autoFix: false,
    autoModifyCode: false,
    advisoryOnly: true,
    focus: 'emotion-and-return-desire',
    notAbout: ['does-it-work', 'is-it-fast', 'bug-count']
});

/**
 * @typedef {object} EmotionSignals
 * @property {boolean} [seasonThemeActive]
 * @property {boolean} [climateLayerPresent]
 * @property {boolean} [climateReady]
 * @property {boolean} [ambientAvailable]
 * @property {boolean} [warmBrandPalette]
 * @property {boolean} [coldBlueDominant]
 * @property {number} [goldGreenCreamHits]
 * @property {number} [imageCount]
 * @property {number} [imagesWithAlt]
 * @property {number} [placeholderRatio]
 * @property {number} [visibleTextChars]
 * @property {number} [headingCount]
 * @property {number} [paragraphDensity]
 * @property {number} [ctaCount]
 * @property {number} [competingBlocks]
 * @property {number} [interactiveCount]
 * @property {boolean} [hasGreeting]
 * @property {boolean} [hasWarmCopy]
 * @property {boolean} [hasEmptyStateCare]
 * @property {boolean} [softRadius]
 * @property {boolean} [darkModeHarsh]
 * @property {string} [activeView]
 * @property {string} [season]
 * @property {number} [learningReturnSignals]
 * @property {number} [realUserAvg]
 * @property {number} [healthUx]
 */

function clamp(n, lo = 0, hi = 100) {
    return Math.max(lo, Math.min(hi, Math.round(n)));
}

function scoreClimate(s) {
    let score = 55;
    const notes = [];
    if (s.seasonThemeActive || s.climateReady) {
        score += 18;
        notes.push('Motyw sezonowy / climate-ready buduje nastrój pór roku');
    } else {
        score -= 8;
        notes.push('Brak wyraźnego klimatu sezonowego na body');
    }
    if (s.climateLayerPresent) {
        score += 14;
        notes.push('Warstwa climate (promienie / trawa) dodaje głębi');
    } else {
        notes.push('Warstwa atmosfery niewidoczna w DOM');
    }
    if (s.ambientAvailable) {
        score += 6;
        notes.push('Ambient natury dostępny (opcjonalnie) — potencjał immersji');
    }
    if (s.season) notes.push(`Sezon: ${s.season}`);
    return { score: clamp(score), notes };
}

function scoreColors(s) {
    let score = 50;
    const notes = [];
    if (s.warmBrandPalette) {
        score += 28;
        notes.push('Ciepła paleta (zieleń / złoto / cream / wheat) — regionalny klimat');
    } else {
        score -= 15;
        notes.push('Paleta nie czyta się jako ciepła / lokalna');
    }
    if (s.coldBlueDominant) {
        score -= 22;
        notes.push('Zimny niebieski dominuje — osłabia „smak regionu”');
    } else {
        score += 8;
        notes.push('Brak dominującego zimnego niebieskiego');
    }
    const hits = s.goldGreenCreamHits ?? 0;
    if (hits >= 6) {
        score += 10;
        notes.push(`Silne kotwice brandowe w CSS (${hits})`);
    } else if (hits >= 3) {
        score += 5;
        notes.push('Częściowe kotwice kolorów brandu');
    }
    return { score: clamp(score), notes };
}

function scorePhotos(s) {
    let score = 48;
    const notes = [];
    const imgs = s.imageCount ?? 0;
    const alt = s.imagesWithAlt ?? 0;
    const ph = s.placeholderRatio ?? 0;

    if (imgs >= 8) {
        score += 22;
        notes.push(`Bogata obecność obrazów (${imgs}) — miejsce i produkt widać`);
    } else if (imgs >= 3) {
        score += 12;
        notes.push(`Umiarkowana liczba zdjęć (${imgs})`);
    } else {
        score -= 12;
        notes.push('Mało zdjęć — trudniej poczuć miejsce');
    }

    if (imgs > 0 && alt / imgs >= 0.7) {
        score += 8;
        notes.push('Większość obrazów ma opis (alt) — szacunek i kontekst');
    } else if (imgs > 0) {
        score -= 4;
        notes.push('Część zdjęć bez alt — mniej „ludzkiego” kontekstu');
    }

    if (ph > 0.4) {
        score -= 18;
        notes.push('Dużo placeholderów — emocja spada (puste pudełka zamiast smaku)');
    } else if (ph > 0.15) {
        score -= 8;
        notes.push('Część placeholderów osłabia wiarygodność');
    } else if (imgs > 0) {
        score += 10;
        notes.push('Zdjęcia wyglądają na autentyczne / produktowe');
    }

    return { score: clamp(score), notes };
}

function scoreTextLoad(s) {
    // Wyższy score = lepszy oddech (mniej ściany tekstu)
    let score = 70;
    const notes = [];
    const chars = s.visibleTextChars ?? 0;
    const density = s.paragraphDensity ?? 0;
    const headings = s.headingCount ?? 0;

    if (chars > 4200) {
        score -= 28;
        notes.push('Dużo tekstu na widoku — ryzyko „czytanki” zamiast klimatu');
    } else if (chars > 2800) {
        score -= 14;
        notes.push('Tekst gęsty — warto dać więcej powietrza');
    } else if (chars > 900) {
        score += 6;
        notes.push('Ilość tekstu w zdrowym zakresie');
    } else {
        score += 4;
        notes.push('Mało tekstu — przestrzeń na obraz i nastrój');
    }

    if (density > 8) {
        score -= 12;
        notes.push('Wiele bloków akapitowych blisko siebie');
    }
    if (headings >= 2 && headings <= 6) {
        score += 8;
        notes.push('Nagłówki nadają rytm, nie ścianę');
    }

    return { score: clamp(score), notes };
}

function scoreFatigue(s) {
    // Wyższy = mniej zmęczenia
    let score = 72;
    const notes = [];
    const cta = s.ctaCount ?? 0;
    const blocks = s.competingBlocks ?? 0;
    const interactive = s.interactiveCount ?? 0;

    if (cta > 8) {
        score -= 22;
        notes.push(`Za dużo CTA (${cta}) — wybór męczy`);
    } else if (cta > 5) {
        score -= 10;
        notes.push('Kilka konkurujących wezwań do działania');
    } else {
        score += 8;
        notes.push('Umiarkowana liczba CTA — spokojniejszy oddech');
    }

    if (blocks > 10) {
        score -= 18;
        notes.push('Wiele konkurujących bloków na pierwszym planie');
    } else if (blocks > 6) {
        score -= 8;
        notes.push('Sekcje zaczynają się ścigać o uwagę');
    }

    if (interactive > 40) {
        score -= 12;
        notes.push('Dużo elementów interaktywnych naraz');
    }

    if ((s.paragraphDensity ?? 0) > 6 && (s.visibleTextChars ?? 0) > 2500) {
        score -= 10;
        notes.push('Tekst + gęstość UI = zmęczenie poznawcze');
    }

    return { score: clamp(score), notes };
}

function scoreFriendliness(s) {
    let score = 55;
    const notes = [];
    if (s.hasGreeting) {
        score += 14;
        notes.push('Powitanie / ludzki ton na starcie');
    } else {
        score -= 6;
        notes.push('Brak ciepłego powitania');
    }
    if (s.hasWarmCopy) {
        score += 12;
        notes.push('Ciepłe sformułowania (region, smak, lokalność)');
    }
    if (s.hasEmptyStateCare) {
        score += 8;
        notes.push('Puste stany zadbane — nie zostawiają użytkownika samego');
    }
    if (s.softRadius) {
        score += 6;
        notes.push('Miękkie kształty UI (przyjazność wizualna)');
    }
    if (s.darkModeHarsh) {
        score -= 10;
        notes.push('Ciemny motyw wygląda ostro / technicznie');
    }
    if ((s.healthUx ?? 85) >= 85) {
        score += 6;
        notes.push('UX health wspiera poczucie „tu jest okej”');
    } else if ((s.healthUx ?? 85) < 75) {
        score -= 8;
        notes.push('Słabszy UX obniża przyjazność emocjonalną');
    }
    return { score: clamp(score), notes };
}

function wantToReturnScore(dims, s) {
    // Wagi: klimat + kolory + zdjęcia + przyjazność mocniej niż sam tekst
    const w = {
        climate: 0.2,
        colors: 0.18,
        photos: 0.18,
        textLoad: 0.12,
        fatigue: 0.14,
        friendliness: 0.18
    };
    let raw = 0;
    for (const k of EMOTION_DIMENSIONS) {
        raw += (dims[k].score ?? 0) * w[k];
    }
    // Learning return signals = ludzie już wracają lokalnie
    if ((s.learningReturnSignals ?? 0) > 20) raw += 4;
    if ((s.realUserAvg ?? 90) >= 90) raw += 2;
    return clamp(raw);
}

function verdictForReturn(score) {
    if (score >= 88) {
        return {
            level: 'strong',
            answer: 'Tak — aplikacja budzi klimat, do którego chce się wracać. To nie tylko narzędzie: jest smak, ciepło i miejsce.',
            short: 'Chce się wracać.'
        };
    }
    if (score >= 75) {
        return {
            level: 'likely',
            answer: 'Raczej tak — jest emocja i klimat, ale kilka rzeczy (tekst, zmęczenie lub zdjęcia) mogą osłabiać powrót. Dopracuj najsłabszy wymiar.',
            short: 'Prawie — warto dogrzać najsłabszy wymiar.'
        };
    }
    if (score >= 60) {
        return {
            level: 'mixed',
            answer: 'Czasem — działa i wygląda poprawnie, ale emocja jest nierówna. Użytkownik wróci z potrzeby, nie z tęsknoty.',
            short: 'Raczej z potrzeby niż z tęsknoty.'
        };
    }
    return {
        level: 'weak',
        answer: 'Na razie słabo — aplikacja bardziej „działa” niż „wabi”. Klimat, zdjęcia i oddech ekranu potrzebują więcej ciepła.',
        short: 'Za mało emocji, by wracać z przyjemności.'
    };
}

function emotionHeadline(dims, want) {
    const ranked = EMOTION_DIMENSIONS
        .map((k) => ({ k, score: dims[k].score }))
        .sort((a, b) => b.score - a.score);
    const best = ranked[0];
    const worst = ranked[ranked.length - 1];
    const labels = {
        climate: 'klimat',
        colors: 'kolory',
        photos: 'zdjęcia',
        textLoad: 'oddech tekstu',
        fatigue: 'lekkość (mniej zmęczenia)',
        friendliness: 'przyjazność'
    };
    return {
        strongest: labels[best.k],
        weakest: labels[worst.k],
        line: `Najmocniej: ${labels[best.k]} (${best.score}%). Najsłabiej: ${labels[worst.k]} (${worst.score}%). Powrót: ${want.short}`
    };
}

/**
 * Główna ocena emocji na podstawie sygnałów.
 * @param {EmotionSignals} signals
 */
export function evaluateEmotion(signals = {}) {
    const dims = {
        climate: scoreClimate(signals),
        colors: scoreColors(signals),
        photos: scorePhotos(signals),
        textLoad: scoreTextLoad(signals),
        fatigue: scoreFatigue(signals),
        friendliness: scoreFriendliness(signals)
    };

    const scores = Object.fromEntries(
        EMOTION_DIMENSIONS.map((k) => [k, dims[k].score])
    );

    const wantScore = wantToReturnScore(dims, signals);
    const want = verdictForReturn(wantScore);
    const headline = emotionHeadline(dims, want);

    const evokesEmotion = wantScore >= 70 && (scores.climate + scores.colors + scores.photos) / 3 >= 65;

    const recommendations = [];
    const weak = EMOTION_DIMENSIONS
        .map((k) => ({ k, score: scores[k] }))
        .filter((x) => x.score < 75)
        .sort((a, b) => a.score - b.score);

    for (const w of weak.slice(0, 4)) {
        const tip = {
            climate: 'Wzmocnij warstwę sezonową / climate na Home — niech pierwsze 2 sekundy pachną regionem.',
            colors: 'Utrzymaj ciepło brandu (zieleń, złoto, cream); unikaj zimnego UI-niebieskiego.',
            photos: 'Więcej autentycznych zdjęć producentów i produktów; mniej placeholderów.',
            textLoad: 'Skróć bloki tekstu; jeden krótki akapit + obraz > ściana copy.',
            fatigue: 'Jedna główna czynność na viewport; mniej konkurujących CTA.',
            friendliness: 'Cieplejsze powitanie, miękkie empty states, ludzki ton mikrocopy.'
        }[w.k];
        recommendations.push({
            dimension: w.k,
            score: w.score,
            tip,
            autoApply: false
        });
    }

    return {
        question: 'Czy ta aplikacja wywołuje emocje?',
        returnQuestion: 'Czy chce się do niej wrócić?',
        evokesEmotion,
        wantToReturn: {
            score: wantScore,
            ...want
        },
        headline: headline.line,
        strongest: headline.strongest,
        weakest: headline.weakest,
        scores,
        dimensions: dims,
        recommendations,
        policy: { ...POLICY },
        meta: {
            activeView: signals.activeView || null,
            season: signals.season || null
        }
    };
}

export default { evaluateEmotion, EMOTION_DIMENSIONS, POLICY };
