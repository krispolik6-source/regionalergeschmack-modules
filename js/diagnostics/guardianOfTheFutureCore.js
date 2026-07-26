/**
 * ETAP 30 – Guardian of the Future (core)
 * Przewiduje problemy zanim się pojawią — trendy, nie tylko stan „dziś”.
 * Nie zmienia kodu. autoApply: false.
 */

export const POLICY = Object.freeze({
    autoApply: false,
    autoFix: false,
    autoModifyCode: false,
    advisoryOnly: true,
    predictive: true,
    chatbot: false,
    userFacing: false,
    role: 'guardian-of-the-future',
    focus: 'early-warning-trends'
});

/** @typedef {'rising'|'falling'|'stable'|'unknown'} TrendDir */
/** @typedef {'CLEAR'|'WATCH'|'ALERT'} FutureStatus */

/**
 * @typedef {{
 *   id: string,
 *   label: string,
 *   unit?: string,
 *   higherIsBetter: boolean,
 *   watchSlopePerWeek: number,
 *   alertSlopePerWeek: number,
 *   softFloor?: number,
 *   softCeiling?: number,
 *   monthHorizonWarn?: number,
 *   monthHorizonAlert?: number
 * }} MetricDef
 */

export const METRICS = Object.freeze([
    {
        id: 'performance',
        label: 'Wydajność (Health)',
        higherIsBetter: true,
        watchSlopePerWeek: -1.5,
        alertSlopePerWeek: -3,
        softFloor: 92,
        monthHorizonWarn: 94,
        monthHorizonAlert: 90
    },
    {
        id: 'ux',
        label: 'UX (Health)',
        higherIsBetter: true,
        watchSlopePerWeek: -2,
        alertSlopePerWeek: -4,
        softFloor: 80,
        monthHorizonWarn: 82,
        monthHorizonAlert: 75
    },
    {
        id: 'healthOverall',
        label: 'Health overall',
        higherIsBetter: true,
        watchSlopePerWeek: -1.5,
        alertSlopePerWeek: -3,
        softFloor: 90,
        monthHorizonWarn: 92,
        monthHorizonAlert: 88
    },
    {
        id: 'cssConflicts',
        label: 'Konflikty CSS',
        higherIsBetter: false,
        watchSlopePerWeek: 3,
        alertSlopePerWeek: 8,
        softCeiling: 50,
        monthHorizonWarn: 55,
        monthHorizonAlert: 70
    },
    {
        id: 'wantToReturn',
        label: 'Chęć powrotu (Emotion)',
        higherIsBetter: true,
        watchSlopePerWeek: -2,
        alertSlopePerWeek: -4,
        softFloor: 80,
        monthHorizonWarn: 82,
        monthHorizonAlert: 75
    },
    {
        id: 'fatigue',
        label: 'Lekkość / niski fatigue (Emotion)',
        higherIsBetter: true,
        watchSlopePerWeek: -3,
        alertSlopePerWeek: -6,
        softFloor: 55,
        monthHorizonWarn: 55,
        monthHorizonAlert: 45
    },
    {
        id: 'livingBrand',
        label: 'Spójność marki (Living Brand)',
        higherIsBetter: true,
        watchSlopePerWeek: -1.5,
        alertSlopePerWeek: -3,
        softFloor: 88,
        monthHorizonWarn: 90,
        monthHorizonAlert: 85
    },
    {
        id: 'brandWarnings',
        label: 'Ostrzeżenia Brand Protection',
        higherIsBetter: false,
        watchSlopePerWeek: 1,
        alertSlopePerWeek: 3,
        softCeiling: 8,
        monthHorizonWarn: 10,
        monthHorizonAlert: 15
    },
    {
        id: 'improveCount',
        label: 'Złożoność (liczba improvement pending)',
        higherIsBetter: false,
        watchSlopePerWeek: 2,
        alertSlopePerWeek: 5,
        softCeiling: 12,
        monthHorizonWarn: 15,
        monthHorizonAlert: 25
    },
    {
        id: 'guardianFindings',
        label: 'Znaleziska Guardian (high+critical)',
        higherIsBetter: false,
        watchSlopePerWeek: 1,
        alertSlopePerWeek: 2,
        softCeiling: 5,
        monthHorizonWarn: 6,
        monthHorizonAlert: 10
    },
    {
        id: 'returnScore',
        label: 'Return Score (Self Reflection)',
        higherIsBetter: true,
        watchSlopePerWeek: -2,
        alertSlopePerWeek: -4,
        softFloor: 75,
        monthHorizonWarn: 78,
        monthHorizonAlert: 70
    },
    {
        id: 'reflectionOverall',
        label: 'Self Reflection overall',
        higherIsBetter: true,
        watchSlopePerWeek: -1.5,
        alertSlopePerWeek: -3,
        softFloor: 85,
        monthHorizonWarn: 86,
        monthHorizonAlert: 80
    }
]);

function clamp(n, lo = 0, hi = 100) {
    return Math.max(lo, Math.min(hi, Math.round(n)));
}

function num(...vals) {
    for (const v of vals) {
        if (typeof v === 'number' && !Number.isNaN(v)) return v;
    }
    return null;
}

/**
 * Prosta regresja liniowa: y = a + b*x
 * @param {{ x: number, y: number }[]} points
 */
export function linearRegression(points) {
    const pts = (points || []).filter((p) => typeof p.x === 'number' && typeof p.y === 'number');
    if (pts.length < 2) {
        return { a: pts[0]?.y ?? null, b: 0, n: pts.length, r2: null };
    }
    const n = pts.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    for (const p of pts) {
        sumX += p.x;
        sumY += p.y;
        sumXY += p.x * p.y;
        sumXX += p.x * p.x;
    }
    const den = n * sumXX - sumX * sumX;
    const b = den === 0 ? 0 : (n * sumXY - sumX * sumY) / den;
    const a = (sumY - b * sumX) / n;

    const meanY = sumY / n;
    let ssTot = 0;
    let ssRes = 0;
    for (const p of pts) {
        const pred = a + b * p.x;
        ssTot += (p.y - meanY) ** 2;
        ssRes += (p.y - pred) ** 2;
    }
    const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

    return { a, b, n, r2 };
}

/**
 * @param {number} slopePerDay
 * @param {boolean} higherIsBetter
 * @returns {TrendDir}
 */
export function trendDirection(slopePerDay, higherIsBetter, eps = 0.05) {
    if (slopePerDay == null || Number.isNaN(slopePerDay)) return 'unknown';
    if (Math.abs(slopePerDay) < eps) return 'stable';
    const rising = slopePerDay > 0;
    if (higherIsBetter) return rising ? 'rising' : 'falling';
    // for "worse when rising" metrics, rising means deteriorating
    return rising ? 'rising' : 'falling';
}

/**
 * Wyciąga metryki ze snapshotu dnia.
 * @param {object} snap
 */
export function extractMetrics(snap = {}) {
    const health = snap.health || {};
    const emotion = snap.emotion || {};
    const living = snap.livingBrand || snap.living || {};
    const brandProt = snap.brandProtection || {};
    const improve = snap.improve || snap.improvement || {};
    const guardian = snap.guardian || {};
    const reflect = snap.selfReflection || snap.reflection || {};
    const dream = snap.dream || {};

    const cssFromFinding = (() => {
        const title = (health.findings || []).find((f) => /konflikt.*css|css.*konflikt/i.test(f.title || ''))?.title;
        const m = String(title || '').match(/(\d+)/);
        return m ? Number(m[1]) : null;
    })();

    const highFindings = (guardian.findings || []).filter(
        (f) => f.severity === 'high' || f.severity === 'critical'
    ).length;

    return {
        performance: num(health.scores?.performance, snap.scores?.healthPerformance),
        ux: num(health.scores?.ux, snap.scores?.healthUx),
        healthOverall: num(health.overall, snap.scores?.healthOverall),
        cssConflicts: num(
            health.static?.css?.conflictCount,
            health.css?.conflictCount,
            cssFromFinding,
            snap.scores?.cssConflicts
        ),
        wantToReturn: num(emotion.wantToReturn?.score, emotion.scores?.wantToReturn),
        fatigue: num(emotion.scores?.fatigue),
        livingBrand: num(living.overall),
        brandWarnings: num(
            brandProt.summary?.warning,
            (brandProt.findings || []).filter((f) => f.severity === 'warning').length,
            0
        ),
        improveCount: num(
            improve.summary?.total,
            improve.proposals?.length,
            snap.scores?.improveCount
        ),
        guardianFindings: num(highFindings, snap.scores?.guardianFindings),
        returnScore: num(reflect.scores?.returnScore, dream.scores?.emotionReturn),
        reflectionOverall: num(reflect.scores?.overall, dream.dreamScore)
    };
}

/**
 * @param {{ day: string, metrics: Record<string, number|null> }[]} series
 * @param {MetricDef} def
 */
export function analyzeMetricTrend(series, def) {
    const points = [];
    for (let i = 0; i < series.length; i += 1) {
        const y = series[i]?.metrics?.[def.id];
        if (typeof y === 'number') points.push({ x: i, y, day: series[i].day });
    }

    const reg = linearRegression(points.map((p) => ({ x: p.x, y: p.y })));
    const latest = points.length ? points[points.length - 1].y : null;
    const slopePerDay = reg.n >= 2 ? reg.b : 0;
    const slopePerWeek = slopePerDay * 7;
    const project = (days) => {
        if (latest == null) return null;
        if (reg.n < 2) return latest;
        let v = latest + slopePerDay * days;
        if (!def.higherIsBetter) v = Math.max(0, v);
        if (def.higherIsBetter) v = Math.max(0, Math.min(100, v));
        return v;
    };
    const projected7 = project(7);
    const projected30 = project(30);

    const dir = trendDirection(slopePerDay, def.higherIsBetter);

    // Is the trend "bad"?
    let severity = 'ok';
    if (reg.n >= 2) {
        if (def.higherIsBetter) {
            if (slopePerWeek <= def.alertSlopePerWeek) severity = 'alert';
            else if (slopePerWeek <= def.watchSlopePerWeek) severity = 'watch';
        } else if (slopePerWeek >= def.alertSlopePerWeek) severity = 'alert';
        else if (slopePerWeek >= def.watchSlopePerWeek) severity = 'watch';
    }

    // Horizon thresholds
    if (projected30 != null && severity !== 'alert') {
        if (def.higherIsBetter) {
            if (def.monthHorizonAlert != null && projected30 < def.monthHorizonAlert) severity = 'alert';
            else if (def.monthHorizonWarn != null && projected30 < def.monthHorizonWarn && severity === 'ok') {
                severity = 'watch';
            }
        } else if (def.monthHorizonAlert != null && projected30 > def.monthHorizonAlert) {
            severity = 'alert';
        } else if (def.monthHorizonWarn != null && projected30 > def.monthHorizonWarn && severity === 'ok') {
            severity = 'watch';
        }
    }

    // Absolute soft floors/ceilings even with thin history
    if (latest != null) {
        if (def.higherIsBetter && def.softFloor != null && latest < def.softFloor) {
            if (severity === 'ok') severity = 'watch';
        }
        if (!def.higherIsBetter && def.softCeiling != null && latest > def.softCeiling) {
            if (severity === 'ok') severity = 'watch';
        }
    }

    return {
        id: def.id,
        label: def.label,
        higherIsBetter: def.higherIsBetter,
        samples: reg.n,
        latest,
        slopePerDay: reg.n >= 2 ? Math.round(slopePerDay * 1000) / 1000 : null,
        slopePerWeek: reg.n >= 2 ? Math.round(slopePerWeek * 100) / 100 : null,
        projected7: projected7 != null ? Math.round(projected7 * 10) / 10 : null,
        projected30: projected30 != null ? Math.round(projected30 * 10) / 10 : null,
        direction: dir,
        severity,
        r2: reg.r2 != null ? Math.round(reg.r2 * 100) / 100 : null,
        history: points.map((p) => ({ day: p.day, value: p.y }))
    };
}

/**
 * Buduje ludzkie ostrzeżenia predykcyjne.
 * @param {ReturnType<typeof analyzeMetricTrend>[]} trends
 */
export function buildPredictions(trends) {
    /** @type {{ id: string, severity: 'watch'|'alert', horizon: string, message: string, metric: string }[]} */
    const predictions = [];

    for (const t of trends) {
        if (t.severity === 'ok' || t.samples < 1) continue;

        if (t.id === 'cssConflicts' && (t.severity === 'watch' || t.severity === 'alert')) {
            const month = t.projected30 ?? t.latest;
            predictions.push({
                id: 'pred-css-growth',
                severity: t.severity,
                horizon: '≈ 1 miesiąc',
                metric: t.id,
                message:
                    t.samples >= 2
                        ? `Jeśli utrzyma się obecny kierunek, za miesiąc konflikty CSS mogą dojść do ~${month} — Home i warstwy CSS staną się trudniejsze w utrzymaniu.`
                        : `Już dziś konflikty CSS = ${t.latest}. Przy kolejnych warstwach stylów Home szybko stanie się zbyt ciężki wizualnie i technicznie.`
            });
        }

        if (t.id === 'performance' && t.direction === 'falling' && t.samples >= 2) {
            predictions.push({
                id: 'pred-perf-decline',
                severity: t.severity,
                horizon: '≈ 2–4 tygodnie',
                metric: t.id,
                message: `Wydajność spada (~${t.slopePerWeek}/tydzień). Jeśli nie zatrzymamy trendu, za miesiąc Performance może spaść do ~${t.projected30}.`
            });
        }

        if (t.id === 'ux' && (t.latest < 88 || (t.direction === 'falling' && t.samples >= 2))) {
            predictions.push({
                id: 'pred-home-heavy',
                severity: t.severity === 'alert' ? 'alert' : 'watch',
                horizon: '≈ 1 miesiąc',
                metric: t.id,
                message:
                    t.samples >= 2 && t.direction === 'falling'
                        ? `Jeśli utrzymamy obecny kierunek zmian, za miesiąc Home stanie się zbyt ciężki (UX → ~${t.projected30}).`
                        : `UX ${t.latest}% już dziś zostawia mało buforu — kolejne sekcje na Home pogłębią clutter w ciągu tygodni.`
            });
        }

        if (t.id === 'fatigue' && (t.latest < 60 || t.direction === 'falling')) {
            predictions.push({
                id: 'pred-fatigue',
                severity: t.latest < 50 || t.severity === 'alert' ? 'alert' : 'watch',
                horizon: '≈ 2–3 tygodnie',
                metric: t.id,
                message: `Zmęczenie bodźcami jest wysokie (fatigue ${t.latest}%). Przy kolejnych „miłych” sekcjach na Home użytkownik szybciej zrezygnuje z codziennego powrotu.`
            });
        }

        if (t.id === 'livingBrand' && (t.direction === 'falling' || t.latest < 92)) {
            predictions.push({
                id: 'pred-brand-drift',
                severity: t.severity === 'alert' ? 'alert' : 'watch',
                horizon: '≈ 3–4 tygodnie',
                metric: t.id,
                message:
                    t.samples >= 2 && t.direction === 'falling'
                        ? `Spójność marki słabnie (~${t.slopePerWeek}/tydzień). Za miesiąc Living Brand może spaść do ~${t.projected30} — Brand Book zacznie się rozjeżdżać.`
                        : `Living Brand ${t.latest}% + ostrzeżenia Brand Protection: przy kolejnych zmianach CSS łatwo o dryf palety/radius/animacji.`
            });
        }

        if (t.id === 'brandWarnings' && (t.latest > 0 || (t.slopePerWeek != null && t.slopePerWeek > 0))) {
            predictions.push({
                id: 'pred-brand-warnings',
                severity: t.severity === 'alert' ? 'alert' : 'watch',
                horizon: '≈ 2–4 tygodnie',
                metric: t.id,
                message: `Rośnie / utrzymuje się liczba ostrzeżeń Brand Protection (${t.latest}). Bez korekty kierunku za miesiąc marka będzie wyglądać na „prawie spójną”, a nie kanoniczną.`
            });
        }

        if (t.id === 'improveCount' && (t.latest >= 5 || (t.slopePerWeek != null && t.slopePerWeek > 0 && t.samples >= 2))) {
            predictions.push({
                id: 'pred-complexity',
                severity: t.severity === 'alert' ? 'alert' : 'watch',
                horizon: '≈ 1 miesiąc',
                metric: t.id,
                message:
                    t.samples >= 2
                        ? `Po ostatnich aktualizacjach lista improvement rośnie (teraz ${t.latest}, trend ~+${t.slopePerWeek}/tydzień). Za miesiąc złożoność pending może dojść do ~${t.projected30} — rozwój będzie gaszeniem pożarów.`
                        : `Pending improvement = ${t.latest}. Nowe funkcje bez redukcji długu zwiększą złożoność szybciej niż wartość dla użytkownika.`
            });
        }

        if (t.id === 'guardianFindings' && (t.latest > 0 || (t.slopePerWeek != null && t.slopePerWeek > 0))) {
            predictions.push({
                id: 'pred-js-exceptions',
                severity: t.severity === 'alert' ? 'alert' : 'watch',
                horizon: '≈ 1–3 tygodnie',
                metric: t.id,
                message:
                    t.samples >= 2 && t.slopePerWeek > 0
                        ? `Po ostatnich przebiegach rośnie liczba poważnych znalezisk Guardian (~+${t.slopePerWeek}/tydzień). To wczesny sygnał rosnącej liczby wyjątków / wycieków JS.`
                        : `Guardian zgłasza ${t.latest} finding(ów) high/critical — bez korekty trend łatwo o regresje runtime.`
            });
        }

        if (t.id === 'wantToReturn' && t.direction === 'falling' && t.samples >= 2) {
            predictions.push({
                id: 'pred-retention',
                severity: t.severity,
                horizon: '≈ 1 miesiąc',
                metric: t.id,
                message: `Chęć powrotu słabnie. Jeśli kierunek się utrzyma, za miesiąc wantToReturn ≈ ${t.projected30}% — retencja ucierpi zanim zobaczysz „twarde” churn metrics.`
            });
        }

        if (t.id === 'returnScore' && (t.latest < 82 || (t.direction === 'falling' && t.samples >= 2))) {
            predictions.push({
                id: 'pred-return-score',
                severity: t.severity === 'ok' ? 'watch' : t.severity,
                horizon: '≈ 2–4 tygodnie',
                metric: t.id,
                message: `Return Score ${t.latest}% ostrzega wcześniej niż sklepowe recenzje: codzienny odruch powrotu jest kruchy.`
            });
        }
    }

    // Deduplicate by id, keep higher severity
    const byId = new Map();
    for (const p of predictions) {
        const prev = byId.get(p.id);
        if (!prev || (prev.severity === 'watch' && p.severity === 'alert')) byId.set(p.id, p);
    }
    return [...byId.values()].sort((a, b) => {
        if (a.severity !== b.severity) return a.severity === 'alert' ? -1 : 1;
        return a.id.localeCompare(b.id);
    });
}

/**
 * @param {{ day: string, metrics: Record<string, number|null> }[]} series
 * @param {object} [meta]
 */
export function buildGuardianFutureReport(series = [], meta = {}) {
    const day = meta.day || new Date().toISOString().slice(0, 10);
    const sorted = [...series].sort((a, b) => String(a.day).localeCompare(String(b.day)));
    const trends = METRICS.map((def) => analyzeMetricTrend(sorted, def));
    const predictions = buildPredictions(trends);

    const alertCount = predictions.filter((p) => p.severity === 'alert').length;
    const watchCount = predictions.filter((p) => p.severity === 'watch').length;
    /** @type {FutureStatus} */
    let status = 'CLEAR';
    if (alertCount > 0) status = 'ALERT';
    else if (watchCount > 0) status = 'WATCH';

    const futureScore = clamp(
        100
        - alertCount * 18
        - watchCount * 8
        - trends.filter((t) => t.severity === 'alert').length * 4
        - trends.filter((t) => t.severity === 'watch').length * 2
    );

    const headline = predictions[0]?.message
        || (status === 'CLEAR'
            ? 'Trendy są stabilne — przy obecnym kierunku nie widać nadchodzącego kryzysu jakości.'
            : 'Wykryto sygnały wczesnego ostrzegania — zobacz prognozy poniżej.');

    return {
        id: `guardian-future-${day}`,
        title: 'Guardian of the Future — ETAP 30',
        generatedAt: meta.generatedAt || new Date().toISOString(),
        day,
        reason: meta.reason || 'predictive-scan',
        policy: { ...POLICY },
        status,
        futureScore,
        headline,
        summary: {
            status,
            futureScore,
            samplesDays: sorted.length,
            predictions: predictions.length,
            alerts: alertCount,
            watches: watchCount,
            autoApply: false
        },
        seriesDays: sorted.map((s) => s.day),
        trends,
        predictions,
        planningNotes: [
            'To nie jest lista bugów do hotfixu — to mapa ryzyka na 1–4 tygodnie.',
            'Używaj z Product Brain (max 3 zmiany jutro) i czekaj na akceptację właściciela.',
            'Guardian of the Future nigdy nie zmienia kodu (autoApply: false).'
        ]
    };
}

export function guardianFutureToMarkdown(report) {
    const badge = report.status === 'CLEAR' ? '✅ CLEAR' : report.status === 'WATCH' ? '⚠️ WATCH' : '🚨 ALERT';
    const lines = [
        `# ${report.title}`,
        '',
        `Dzień: **${report.day}**`,
        `Wygenerowano: ${report.generatedAt}`,
        '',
        `## Status: **${badge}** · Future score: **${report.futureScore} / 100**`,
        '',
        '## Polityka',
        '',
        '- Przewiduje problemy **zanim** się pojawią',
        '- **autoApply: false** — nie zmienia kodu',
        '- Ostrzega, nie wdraża',
        '',
        '## Headline',
        '',
        `> ${report.headline}`,
        '',
        `Dni w serii: **${report.summary?.samplesDays ?? 0}** · Prognozy: **${report.summary?.predictions ?? 0}** (alert ${report.summary?.alerts ?? 0} / watch ${report.summary?.watches ?? 0})`,
        '',
        '## Prognozy (wczesne ostrzeżenia)',
        ''
    ];

    if (!(report.predictions || []).length) {
        lines.push('_Brak ostrzeżeń predykcyjnych — kierunek wygląda stabilnie._', '');
    } else {
        for (const p of report.predictions) {
            const tag = p.severity === 'alert' ? 'ALERT' : 'WATCH';
            lines.push(`### [${tag}] ${p.horizon}`);
            lines.push('');
            lines.push(p.message);
            lines.push('');
            lines.push(`_metric: \`${p.metric}\`_`);
            lines.push('');
        }
    }

    lines.push('## Trendy metryk', '');
    for (const t of report.trends || []) {
        if (t.samples < 1) continue;
        const arrow = t.direction === 'rising' ? '↑' : t.direction === 'falling' ? '↓' : '→';
        lines.push(
            `- **${t.label}**: ${t.latest ?? '—'} ${arrow} · tydzień ${t.slopePerWeek ?? '—'} · +7d ~${t.projected7 ?? '—'} · +30d ~${t.projected30 ?? '—'} · \`${t.severity}\` (${t.samples} próbek)`
        );
    }

    lines.push('', '## Jak planować', '');
    for (const n of report.planningNotes || []) lines.push(`- ${n}`);
    lines.push('');
    return lines.join('\n');
}

export default {
    POLICY,
    METRICS,
    linearRegression,
    extractMetrics,
    analyzeMetricTrend,
    buildPredictions,
    buildGuardianFutureReport,
    guardianFutureToMarkdown
};
