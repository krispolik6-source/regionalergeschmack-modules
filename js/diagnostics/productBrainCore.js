/**
 * ETAP 29D – Product Brain (core)
 * „Gdybym był właścicielem — co zrobiłbym jutro?”
 * Max 3 propozycje / dzień. Nie wdraża. Czeka na akceptację.
 */

export const POLICY = Object.freeze({
    autoApply: false,
    autoFix: false,
    autoModifyCode: false,
    advisoryOnly: true,
    requiresOwnerAcceptance: true,
    maxProposalsPerDay: 3,
    chatbot: false,
    userFacing: false,
    role: 'product-brain-owner',
    question: 'Gdybym był właścicielem tej aplikacji, co zrobiłbym jutro?'
});

export const LENSES = Object.freeze([
    'ux',
    'mobile',
    'pwa',
    'performance',
    'retention',
    'look',
    'emotions',
    'ease',
    'competition'
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

/**
 * Kandydat → propozycja właściciela
 * @typedef {{
 *   id: string,
 *   title: string,
 *   lens: string,
 *   why: string,
 *   impact: 'high'|'medium'|'low',
 *   risk: 'low'|'medium'|'high',
 *   effort: string,
 *   expectedEffect: string,
 *   priority: number,
 *   status: 'pending_acceptance',
 *   sources: string[]
 * }} BrainProposal
 */

/**
 * Buduje pulę kandydatów z diagnostyk (nie więcej niż top 3 trafia do raportu).
 * @param {object} sources
 * @returns {BrainProposal[]}
 */
export function buildCandidatePool(sources = {}) {
    const health = sources.health || null;
    const emotion = sources.emotion || null;
    const living = sources.livingBrand || sources.living || null;
    const director = sources.director || sources.productDirector || null;
    const improve = sources.improve || sources.improvement || null;
    const dream = sources.dream || null;
    const brandProt = sources.brandProtection || null;
    const guardian = sources.guardian || null;
    const qualityLoop = sources.qualityLoop || null;
    const daily = sources.daily || null;
    const realUsers = sources.realUsers || null;
    const virtual = sources.virtual || sources.virtualUser || null;
    const pwaHint = sources.pwa || null;

    const hUx = num(health?.scores?.ux);
    const hMobile = num(health?.scores?.mobile);
    const hPerf = num(health?.scores?.performance);
    const hOverall = num(health?.overall);
    const emotionReturn = num(emotion?.wantToReturn?.score, emotion?.scores?.wantToReturn);
    const emotionFatigue = num(emotion?.scores?.fatigue);
    const emotionClimate = num(emotion?.scores?.climate);
    const livingOverall = num(living?.overall);
    const productScore = num(director?.productScore, director?.summary?.productScore);
    const dreamScore = num(dream?.dreamScore);
    const bpStatus = brandProt?.status || null;
    const bpWarn = num(brandProt?.summary?.warning, (brandProt?.findings || []).filter((f) => f.severity === 'warning').length);
    const bpFail = num(brandProt?.summary?.fail, (brandProt?.findings || []).filter((f) => f.severity === 'fail').length);
    const regressions = num(qualityLoop?.summary?.regressionCount, 0);
    const realAvg = num(realUsers?.summary?.averageScore, realUsers?.summary?.avgScore);

    /** @type {BrainProposal[]} */
    const pool = [];

    const push = (p) => {
        pool.push({
            ...p,
            status: 'pending_acceptance',
            impact: p.impact || 'medium',
            risk: p.risk || 'low'
        });
    };

    // UX
    if (hUx != null && hUx < 92) {
        push({
            id: 'ux-home-one-cta',
            title: 'Uprość pierwszy viewport Home do jednej obietnicy + jednego CTA',
            lens: 'ux',
            why: `UX Health ${hUx}% — tarcia w pierwszym kontakcie`,
            impact: 'high',
            risk: 'low',
            effort: '2–4 h (CSS/HTML Home, bez Store)',
            expectedEffect: 'Mniej chaosu na starcie, szybsza decyzja „mapa / okolica”',
            priority: 100 - hUx + 20,
            sources: ['health', 'emotion']
        });
    }

    // Emotions / fatigue
    if (emotionFatigue != null && emotionFatigue < 65) {
        push({
            id: 'emotion-reduce-fatigue',
            title: 'Obniż zmęczenie bodźcami: mniej sekcji narracyjnych naraz na Home',
            lens: 'emotions',
            why: `Emotion fatigue ${emotionFatigue}% — za dużo bodźców / CTA`,
            impact: 'high',
            risk: 'medium',
            effort: '3–5 h (kolejność sekcji, ukrycie drugorzędnych)',
            expectedEffect: 'Wyższy spokój, wyższa chęć powrotu (wantToReturn)',
            priority: 60 - emotionFatigue + 25,
            sources: ['emotion', 'dream']
        });
    }

    // Retention
    if (emotionReturn != null && emotionReturn < 92) {
        push({
            id: 'retention-daily-host',
            title: 'Wzmocnij jedną dzienną wskazówkę gospodarza (Regional Intelligence) — bez nowych CTA',
            lens: 'retention',
            why: `wantToReturn ${emotionReturn}% — powód powrotu musi być jeden i spokojny`,
            impact: 'high',
            risk: 'low',
            effort: '1–2 h (treść / widoczność, bez nowego modułu)',
            expectedEffect: 'Czytelniejszy rytuał „co dziś w regionie” → więcej powrotów',
            priority: 92 - emotionReturn + 18,
            sources: ['emotion', 'regional']
        });
    }

    // Mobile
    if (hMobile != null && hMobile < 98) {
        push({
            id: 'mobile-touch-targets',
            title: 'Domknij Mobile: cele dotykowe i hierarchia bottom nav na małych ekranach',
            lens: 'mobile',
            why: `Mobile Health ${hMobile}%`,
            impact: 'medium',
            risk: 'low',
            effort: '2–3 h (CSS mobile-premium)',
            expectedEffect: 'Mniej pomyłek tapnięć, pewniejsza nawigacja w terenie',
            priority: 98 - hMobile + 12,
            sources: ['health']
        });
    } else if (hUx != null && hUx < 90) {
        push({
            id: 'mobile-home-density',
            title: 'Na telefonie: jedna dominująca akcja nad fold — reszta niżej',
            lens: 'mobile',
            why: 'Telefon = główny kontekst użycia w regionie',
            impact: 'high',
            risk: 'low',
            effort: '2–3 h',
            expectedEffect: 'Home czytelny w słońcu i w ruchu',
            priority: 22,
            sources: ['health', 'emotion']
        });
    }

    // Performance
    if (hPerf != null && hPerf < 96) {
        push({
            id: 'perf-startup-weight',
            title: 'Przytnij koszt startu: mniej pracy JS na pierwszym ekranie',
            lens: 'performance',
            why: `Performance ${hPerf}%`,
            impact: 'medium',
            risk: 'medium',
            effort: '3–6 h (profilowanie, defer prezentacji)',
            expectedEffect: 'Szybsze pierwsze wrażenie, mniej porzuceń',
            priority: 96 - hPerf + 15,
            sources: ['health', 'guardian']
        });
    } else if (regressions > 0) {
        push({
            id: 'perf-regressions',
            title: 'Zatrzymaj regresje z Quality Loop zanim dołożysz nowe funkcje',
            lens: 'performance',
            why: `${regressions} regresji vs poprzedni dzień`,
            impact: 'high',
            risk: 'low',
            effort: '2–4 h (naprawa zaakceptowanych pending)',
            expectedEffect: 'Stabilny baseline, zaufanie do codziennej pętli',
            priority: 30 + regressions * 5,
            sources: ['quality-loop']
        });
    }

    // Look / brand
    if (bpFail > 0) {
        push({
            id: 'look-brand-fail',
            title: 'Usuń FAIL Brand Protection zanim cokolwiek nowego wizualnie',
            lens: 'look',
            why: `Brand Protection FAIL × ${bpFail}`,
            impact: 'high',
            risk: 'low',
            effort: '1–3 h (zgodnie z Brand Book, po akceptacji)',
            expectedEffect: 'Marka znów zgodna z najwyższym autorytetem Brand Book',
            priority: 40 + bpFail * 10,
            sources: ['brand-protection']
        });
    } else if (bpWarn > 0 || bpStatus === 'WARNING') {
        push({
            id: 'look-brand-warnings',
            title: 'Przejrzyj WARNING Brand Protection (radius / animacje) — max 1 decyzja jutro',
            lens: 'look',
            why: `Brand Protection WARNING × ${bpWarn || '?'}`,
            impact: 'medium',
            risk: 'low',
            effort: '1–2 h przeglądu + ewentualna 1 zmiana CSS',
            expectedEffect: 'Mniej „pill/glow” dryfu, cieplejsza spójność',
            priority: 16 + (bpWarn || 3),
            sources: ['brand-protection', 'living-brand']
        });
    } else if (livingOverall != null && livingOverall < 94) {
        push({
            id: 'look-living-brand',
            title: 'Domknij Living Brand do ≥94% (tokeny, cienie, spójność)',
            lens: 'look',
            why: `Living Brand ${livingOverall}%`,
            impact: 'medium',
            risk: 'low',
            effort: '2–3 h',
            expectedEffect: 'Premium bez chłodu, zgodność z Brand Book',
            priority: 94 - livingOverall + 10,
            sources: ['living-brand']
        });
    }

    // Emotions climate
    if (emotionClimate != null && emotionClimate < 90) {
        push({
            id: 'emotions-climate',
            title: 'Podnieś klimat: ciepłe zdjęcia / mniej abstrakcji w pierwszym kontakcie',
            lens: 'emotions',
            why: `Climate ${emotionClimate}%`,
            impact: 'medium',
            risk: 'low',
            effort: '2–4 h (asset + CSS atmosfery)',
            expectedEffect: 'Silniejsze „chcę tu wrócić”',
            priority: 90 - emotionClimate + 8,
            sources: ['emotion']
        });
    }

    // Ease of use
    if (hUx != null && hUx < 88) {
        push({
            id: 'ease-path-map',
            title: 'Skróć ścieżkę: Home → mapa → producent (mniej pośrednich kroków)',
            lens: 'ease',
            why: `UX ${hUx}% — łatwość obsługi boli przy odkrywaniu`,
            impact: 'high',
            risk: 'medium',
            effort: '3–5 h (prezentacja / CTA, bez zmian API/GPS core)',
            expectedEffect: 'Szybsze dotarcie do lokalnego smaku',
            priority: 88 - hUx + 14,
            sources: ['health', 'director']
        });
    }

    // PWA
    const pwaIssues = pwaHint?.issues || guardian?.findings?.filter((f) => /pwa|service.?worker|manifest|install/i.test(f.title || f.id || '')) || [];
    if (pwaIssues.length) {
        push({
            id: 'pwa-install-trust',
            title: 'Utrzymaj zaufanie PWA: ikony network-first + spójny install banner',
            lens: 'pwa',
            why: 'Sygnały PWA / Guardian wokół instalacji lub cache',
            impact: 'medium',
            risk: 'medium',
            effort: '1–3 h',
            expectedEffect: 'Ikona i instalacja = ta sama marka, bez starego cache',
            priority: 18 + Math.min(10, pwaIssues.length * 3),
            sources: ['guardian', 'pwa']
        });
    } else {
        push({
            id: 'pwa-return-surface',
            title: 'Sprawdź ścieżkę powrotu z ikony PWA: pierwszy ekran = spokój, nie clutter',
            lens: 'pwa',
            why: 'Zainstalowana PWA to główny kanał retencji na telefonie',
            impact: 'medium',
            risk: 'low',
            effort: '1 h audytu + ewentualnie 1 poprawka CSS',
            expectedEffect: 'Powrót z home screen = jasna wartość regionu',
            priority: 14,
            sources: ['pwa', 'emotion']
        });
    }

    // Competition
    const directorComp = (director?.qa || []).find((q) => q.id === 'competition');
    push({
        id: 'competition-edge',
        title: 'Wzmocnij przewagę vs Maps/Yelp: emocja regionu, nie „kolejny katalog pinów”',
        lens: 'competition',
        why: directorComp
            ? 'Product Director wskazuje na pozycjonowanie vs konkurencję'
            : 'Konkurencja wygrywa uniwersalnością — my wygrywamy klimatem lokalnym',
        impact: 'high',
        risk: 'low',
        effort: '2–3 h (treść gospodarza / Home, bez nowych funkcji)',
        expectedEffect: 'Wyraźniejsza różnica: smak regionu zamiast kolejnego pinu',
        priority: 17,
        sources: ['director', 'competition']
    });

    // Improvement top titles as soft candidates
    for (const p of (improve?.proposals || []).slice(0, 4)) {
        const title = p.title || p.id;
        if (!title) continue;
        push({
            id: `improve-${String(p.id || title).slice(0, 40)}`,
            title: String(title).slice(0, 120),
            lens: /mobile|ux/i.test(title) ? 'ux' : /css|look|brand/i.test(title) ? 'look' : 'ease',
            why: `Improvement Engine [${p.priority || 'medium'}]`,
            impact: p.priority === 'high' ? 'high' : 'medium',
            risk: 'low',
            effort: '2–4 h (po akceptacji)',
            expectedEffect: p.expectedEffect || 'Mniejszy dług produktowy z listy improvement',
            priority: p.priority === 'high' ? 24 : p.priority === 'medium' ? 12 : 8,
            sources: ['improvement']
        });
    }

    // Dream top3 as signals
    for (const [i, t] of (dream?.top3 || []).slice(0, 3).entries()) {
        push({
            id: `dream-top-${i + 1}`,
            title: String(t).replace(/^\[.*?\]\s*/, '').slice(0, 120),
            lens: /brand|wygląd|look/i.test(t) ? 'look' : /fatigue|emoc|CTA|Home/i.test(t) ? 'emotions' : 'ux',
            why: `Dream Mode top ${i + 1} (score ${dreamScore ?? '—'})`,
            impact: i === 0 ? 'high' : 'medium',
            risk: 'low',
            effort: '2–4 h',
            expectedEffect: 'Realizacja refleksji Product Owner z wczoraj',
            priority: 19 - i * 3,
            sources: ['dream']
        });
    }

    // Guardian high
    for (const f of (guardian?.findings || []).filter((x) => x.severity === 'high' || x.severity === 'critical').slice(0, 2)) {
        push({
            id: `guardian-${String(f.id || f.title).slice(0, 36)}`,
            title: `Stabilność: ${String(f.title || f.id).slice(0, 100)}`,
            lens: 'performance',
            why: `Guardian [${f.severity}]`,
            impact: 'medium',
            risk: 'medium',
            effort: '1–3 h',
            expectedEffect: 'Mniej ryzyka wycieków / timerów / regresji runtime',
            priority: f.severity === 'critical' ? 28 : 15,
            sources: ['guardian']
        });
    }

    // Real users weak path
    if (realAvg != null && realAvg < 92) {
        push({
            id: 'ease-real-users',
            title: 'Napraw najsłabszą ścieżkę persony Real Users (jedna ścieżka jutro)',
            lens: 'ease',
            why: `Real Users avg ${realAvg}%`,
            impact: 'high',
            risk: 'low',
            effort: '2–4 h',
            expectedEffect: 'Wyższa skuteczność typowego użytkownika regionu',
            priority: 92 - realAvg + 12,
            sources: ['real-users']
        });
    }

    // Virtual user stale
    if (!virtual?.summary?.score && virtual?.summary?.status) {
        push({
            id: 'ease-virtual-run',
            title: 'Odpal Virtual User w przeglądarce — zanim zgadniesz, co boli',
            lens: 'ease',
            why: `Virtual User: ${virtual.summary.status}`,
            impact: 'medium',
            risk: 'low',
            effort: '30–60 min',
            expectedEffect: 'Świeże dowody zamiast spekulacji',
            priority: 13,
            sources: ['virtual-user']
        });
    }

    // Baseline if pool thin
    if (pool.length < 3) {
        push({
            id: 'owner-keep-rhythm',
            title: 'Utrzymaj rytm: quality-loop + dream + brand-protection — bez nowych funkcji',
            lens: 'ux',
            why: `Produkt stoi solidnie (health ${hOverall ?? '—'}%, director ${productScore ?? '—'})`,
            impact: 'medium',
            risk: 'low',
            effort: '30 min przeglądu raportów',
            expectedEffect: 'Dyscyplina właściciela zamiast rozrostu scope',
            priority: 5,
            sources: ['daily', 'director']
        });
        push({
            id: 'owner-one-photo',
            title: 'Jedna prawdziwa fotografia regionu zamiast kolejnego bloku UI',
            lens: 'look',
            why: 'Klimat wygrywa z konkurencją katalogową',
            impact: 'medium',
            risk: 'low',
            effort: '1–2 h',
            expectedEffect: 'Cieplejsze pierwsze wrażenie',
            priority: 6,
            sources: ['emotion', 'competition']
        });
    }

    // Deduplicate by similar title
    const seen = new Set();
    const deduped = [];
    for (const p of pool) {
        const key = p.title.toLowerCase().slice(0, 48);
        if (seen.has(key)) continue;
        seen.add(key);
        deduped.push(p);
    }

    return deduped;
}

/**
 * Wybiera max 3 propozycje na jutro.
 * @param {object} sources
 * @param {object} [meta]
 */
export function buildProductBrainReport(sources = {}, meta = {}) {
    const day = meta.day || new Date().toISOString().slice(0, 10);
    const pool = buildCandidatePool(sources);
    const ranked = [...pool].sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
    const proposals = ranked.slice(0, POLICY.maxProposalsPerDay).map((p, i) => ({
        ...p,
        rank: i + 1,
        status: 'pending_acceptance'
    }));

    // Lens coverage summary from signals (not proposals only)
    const health = sources.health || {};
    const emotion = sources.emotion || {};
    const lenses = {
        ux: num(health?.scores?.ux),
        mobile: num(health?.scores?.mobile),
        pwa: sources.brandProtection || sources.guardian ? 80 : null,
        performance: num(health?.scores?.performance),
        retention: num(emotion?.wantToReturn?.score, emotion?.scores?.wantToReturn),
        look: num(sources.livingBrand?.overall, sources.living?.overall),
        emotions: num(emotion?.scores?.climate, emotion?.overallEmotion),
        ease: num(health?.scores?.ux),
        competition: num(sources.director?.productScore, sources.productDirector?.productScore)
    };

    const brainScore = clamp(
        (() => {
            const parts = Object.values(lenses).filter((n) => typeof n === 'number');
            if (!parts.length) return 50;
            return parts.reduce((a, b) => a + b, 0) / parts.length;
        })()
    );

    return {
        id: `product-brain-${day}`,
        title: 'Product Brain — jutro jako właściciel',
        generatedAt: meta.generatedAt || new Date().toISOString(),
        day,
        reason: meta.reason || 'daily-owner-reflection',
        policy: { ...POLICY },
        question: POLICY.question,
        brainScore,
        lenses,
        lensNotes: LENSES,
        candidatesConsidered: pool.length,
        proposals,
        summary: {
            brainScore,
            proposalsCount: proposals.length,
            maxProposalsPerDay: POLICY.maxProposalsPerDay,
            requiresOwnerAcceptance: true,
            autoApply: false,
            tomorrowFocus: proposals[0]?.title || null
        }
    };
}

export function productBrainToMarkdown(report) {
    const lines = [
        `# ${report.title}`,
        '',
        `Dzień: **${report.day}**`,
        `Wygenerowano: ${report.generatedAt}`,
        '',
        `## Pytanie`,
        '',
        `> ${report.question}`,
        '',
        `## Brain score: **${report.brainScore} / 100**`,
        '',
        '## Polityka',
        '',
        `- **Max ${report.policy.maxProposalsPerDay} propozycje dziennie**`,
        '- **Nie wdrażaj** — czekaj na akceptację właściciela',
        '- **autoApply: false**',
        '',
        '## Soczewki (sygnały)',
        ''
    ];

    for (const lens of report.lensNotes || LENSES) {
        const v = report.lenses?.[lens];
        lines.push(`- ${lens}: ${v ?? '—'}`);
    }

    lines.push('', `Kandydatów rozważonych: **${report.candidatesConsidered}** → wybrano **${report.proposals?.length || 0}**`, '');
    lines.push('## 3 propozycje na jutro', '');

    if (!(report.proposals || []).length) {
        lines.push('_Brak propozycji._', '');
    } else {
        for (const p of report.proposals) {
            lines.push(`### ${p.rank}. ${p.title}`);
            lines.push('');
            lines.push(`- **Soczewka:** ${p.lens}`);
            lines.push(`- **Dlaczego:** ${p.why}`);
            lines.push(`- **Wpływ:** ${p.impact}`);
            lines.push(`- **Ryzyko:** ${p.risk}`);
            lines.push(`- **Czas wykonania:** ${p.effort}`);
            lines.push(`- **Oczekiwany efekt:** ${p.expectedEffect}`);
            lines.push(`- **Status:** \`${p.status}\``);
            if (p.sources?.length) lines.push(`- **Źródła:** ${p.sources.join(', ')}`);
            lines.push('');
        }
    }

    lines.push('## Akceptacja', '');
    lines.push('1. Przeczytaj max 3 propozycje powyżej');
    lines.push('2. Wybierz 0–3 do wdrożenia ręcznie (Cursor / PR)');
    lines.push('3. Product Brain **nie** aplikuje zmian sam');
    lines.push('');
    return lines.join('\n');
}

export default {
    POLICY,
    LENSES,
    buildCandidatePool,
    buildProductBrainReport,
    productBrainToMarkdown
};
