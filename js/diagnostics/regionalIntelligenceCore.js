/**
 * ETAP 29B – Regional Intelligence (core, Node-safe)
 * Jedna rekomendacja / dzień. Nie chatbot. Bez reklam / sprzedaży.
 */

export const POLICY = Object.freeze({
    chatbot: false,
    aiAssistant: false,
    ads: false,
    salesPitch: false,
    maxMainRecommendations: 1,
    tone: 'calm-natural-host',
    role: 'regional-host'
});

/** @type {readonly object[]} */
export const REGIONAL_TIPS = Object.freeze([
    {
        id: 'visitApiary',
        icon: '🐝',
        months: [4, 5, 6, 7, 8, 9],
        weather: ['mild', 'warm', 'hot'],
        dayParts: ['morning', 'midday', 'afternoon'],
        affinity: ['honey', 'farmers'],
        productTags: ['honey'],
        needsOpen: 'farmers',
        category: 'farmers',
        base: 58
    },
    {
        id: 'morningBakery',
        icon: '🌾',
        dayParts: ['morning'],
        weekdays: [1, 2, 3, 4, 5, 6],
        affinity: ['bakeries'],
        productTags: ['bread', 'pastries'],
        needsOpen: 'bakeries',
        category: 'bakeries',
        base: 56
    },
    {
        id: 'sundayMarket',
        icon: '🧺',
        weekdays: [0],
        dayParts: ['morning', 'midday'],
        months: [4, 5, 6, 7, 8, 9, 10],
        affinity: ['farmers', 'shops'],
        needsOpen: 'farmers',
        category: 'farmers',
        base: 62
    },
    {
        id: 'rainWarmBread',
        icon: '🌧',
        weather: ['rain'],
        affinity: ['bakeries'],
        productTags: ['bread', 'pastries'],
        needsOpen: 'bakeries',
        category: 'bakeries',
        base: 60
    },
    {
        id: 'orchardWalk',
        icon: '🍎',
        months: [8, 9, 10],
        seasons: ['summer', 'autumn'],
        weather: ['mild', 'warm', 'cool'],
        affinity: ['farmers'],
        productTags: ['apples'],
        needsOpen: 'farmers',
        category: 'farmers',
        base: 54
    },
    {
        id: 'summerBerries',
        icon: '🍓',
        months: [6, 7, 8],
        seasons: ['summer'],
        weather: ['warm', 'hot', 'mild'],
        dayParts: ['morning', 'midday', 'afternoon'],
        affinity: ['farmers'],
        productTags: ['strawberries'],
        needsOpen: 'farmers',
        category: 'farmers',
        base: 52
    },
    {
        id: 'eveningHof',
        icon: '🌅',
        dayParts: ['evening'],
        weather: ['warm', 'mild', 'hot'],
        affinity: ['farmers'],
        needsOpen: 'farmers',
        category: 'farmers',
        base: 50
    },
    {
        id: 'middayFreshArrivals',
        icon: '🌿',
        dayParts: ['midday', 'afternoon'],
        affinity: ['farmers', 'shops'],
        needsOpen: 'farmers',
        category: 'farmers',
        base: 44
    },
    {
        id: 'coolHoneyComfort',
        icon: '🍯',
        weather: ['cool', 'cold'],
        affinity: ['honey', 'farmers', 'shops'],
        productTags: ['honey'],
        category: 'farmers',
        base: 48
    },
    {
        id: 'springBlossom',
        icon: '🌸',
        months: [3, 4, 5],
        seasons: ['spring'],
        weather: ['mild', 'warm', 'hot'],
        affinity: ['farmers'],
        category: 'farmers',
        base: 46
    },
    {
        id: 'autumnHarvest',
        icon: '🍂',
        months: [9, 10, 11],
        seasons: ['autumn'],
        affinity: ['farmers'],
        category: 'farmers',
        base: 48
    },
    {
        id: 'winterCellar',
        icon: '🥔',
        months: [12, 1, 2],
        seasons: ['winter'],
        affinity: ['farmers', 'shops'],
        category: 'farmers',
        base: 46
    },
    {
        id: 'afternoonCheese',
        icon: '🧀',
        dayParts: ['afternoon', 'midday'],
        affinity: ['shops', 'farmers'],
        productTags: ['cheese'],
        category: 'shops',
        base: 42
    },
    {
        id: 'quietNight',
        icon: '🌙',
        dayParts: ['night'],
        category: 'farmers',
        base: 36
    },
    {
        id: 'hostDefault',
        icon: '🌿',
        affinity: ['farmers', 'bakeries'],
        category: 'farmers',
        base: 18
    }
]);

/** Teksty raportu CLI (PL) — UI bierze z i18n. */
export const TIP_COPY_PL = Object.freeze({
    visitApiary: {
        headline: 'Dzisiaj warto odwiedzić pasiekę.',
        support: 'Pogoda sprzyja spacerowi, a świeży miód pojawił się rano.'
    },
    morningBakery: {
        headline: 'Dziś rano warto zajrzeć do piekarni.',
        support: 'Chleb jest świeży, a okolica jeszcze spokojna.'
    },
    sundayMarket: {
        headline: 'Niedziela dobrze smakuje na lokalnym targu.',
        support: 'Sezonowe warzywa i owoce pojawiają się zwykle przed południem.'
    },
    rainWarmBread: {
        headline: 'Przy deszczu dobrze smakuje ciepły chleb.',
        support: 'Piekarnie w regionie już pracują — bez pośpiechu.'
    },
    orchardWalk: {
        headline: 'Warto zajrzeć do sadu.',
        support: 'Jabłka dojrzewają, a powietrze jest łagodne na spacer.'
    },
    summerBerries: {
        headline: 'Dziś pasują świeże jagody z gospodarstwa.',
        support: 'Lato sprzyja zbiorom — w okolicy pojawia się sezonowy owoc.'
    },
    eveningHof: {
        headline: 'Wieczór zaprasza na spokojną wizytę w gospodarstwie.',
        support: 'Światło jest miękkie, a sklepiki często jeszcze otwarte.'
    },
    middayFreshArrivals: {
        headline: 'W południe warto zajrzeć do sklepiku gospodarskiego.',
        support: 'Wiele produktów właśnie nadeszło z pola.'
    },
    coolHoneyComfort: {
        headline: 'Przy chłodzie pasuje lokalny miód.',
        support: 'Prosty smak z sąsiedztwa — bez pośpiechu i bez reklamy.'
    },
    springBlossom: {
        headline: 'Wiosna w regionie — dobry dzień na wizytę w gospodarstwie.',
        support: 'Drzewa kwitną, a okolica pokazuje lżejszą stronę.'
    },
    autumnHarvest: {
        headline: 'Trwa zbiór — warto zajrzeć po regionalne zapasy.',
        support: 'Jabłka, korzenie i towar z gospodarstw czekają blisko.'
    },
    winterCellar: {
        headline: 'Zimą region oferuje proste zapasy z piwnicy.',
        support: 'Kapusta, ziemniaki i lokalne przetwory — spokojnie i blisko.'
    },
    afternoonCheese: {
        headline: 'Po południu pasuje świeży ser z gospodarstwa.',
        support: 'Spokojna pora na krótką wizytę bez tłoku.'
    },
    quietNight: {
        headline: 'Region już cichnie.',
        support: 'Jutro rano znów będzie pachniało świeżym chlebem.'
    },
    hostDefault: {
        headline: 'Witaj w regionie.',
        support: 'W pobliżu czekają spokojne, lokalne miejsca.'
    }
});

function dayHash(seed) {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i += 1) {
        h ^= seed.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

export function getDayPart(now = new Date()) {
    const h = now.getHours();
    if (h >= 5 && h < 11) return 'morning';
    if (h >= 11 && h < 14) return 'midday';
    if (h >= 14 && h < 18) return 'afternoon';
    if (h >= 18 && h < 22) return 'evening';
    return 'night';
}

export function getSeason(now = new Date()) {
    const month = now.getMonth() + 1;
    if ([3, 4, 5].includes(month)) return 'spring';
    if ([6, 7, 8].includes(month)) return 'summer';
    if ([9, 10, 11].includes(month)) return 'autumn';
    return 'winter';
}

export function getClimateProxyWeather(now = new Date()) {
    const month = now.getMonth() + 1;
    const dayPart = getDayPart(now);
    const dayKey = now.toISOString().slice(0, 10);
    const rainy = dayHash(dayKey) % 7 === 0;
    if (rainy) return 'rain';
    if (month >= 6 && month <= 8) {
        return dayPart === 'midday' || dayPart === 'afternoon' ? 'hot' : 'warm';
    }
    if (month >= 9 && month <= 11) return month === 11 ? 'cool' : 'mild';
    if (month === 12 || month <= 2) return 'cold';
    return 'mild';
}

export function isTipEligible(tip, ctx) {
    if (tip.id === 'hostDefault') return true;
    if (tip.months?.length && !tip.months.includes(ctx.month)) return false;
    if (tip.seasons?.length && !tip.seasons.includes(ctx.season)) return false;
    if (tip.dayParts?.length && !tip.dayParts.includes(ctx.dayPart)) return false;
    if (tip.weekdays?.length && !tip.weekdays.includes(ctx.weekday)) return false;
    if (tip.weather?.length && !tip.weather.includes(ctx.weather)) return false;
    return true;
}

export function scoreTip(tip, ctx, affinity = new Map(), extras = {}) {
    let score = Number(tip.base) || 20;
    const openCounts = extras.openCounts || ctx.openCounts || {};

    if (tip.dayParts?.includes(ctx.dayPart)) score += 34;
    if (tip.weather?.includes(ctx.weather)) score += 28;
    if (tip.months?.includes(ctx.month)) score += 18;
    if (tip.seasons?.includes(ctx.season)) score += 12;
    if (tip.weekdays?.includes(ctx.weekday)) score += 30;

    for (const key of tip.affinity || []) {
        const hit = affinity.get(key) || 0;
        if (hit > 0) score += Math.min(22, 5 + hit * 4);
    }

    if (tip.needsOpen) {
        const open = openCounts[tip.needsOpen] || 0;
        const hasLocalData = Object.values(openCounts).some((n) => n > 0);
        if (open > 0) score += 16 + Math.min(10, open);
        else if (hasLocalData) score -= 14;
    }

    if (extras.availabilityBoost) score += Number(extras.availabilityBoost) || 0;
    if (extras.locationBoost) score += Number(extras.locationBoost) || 0;

    score += dayHash(`${ctx.dayKey}:${tip.id}`) % 5;
    return score;
}

export function buildProxyContext(now = new Date(), overrides = {}) {
    return {
        dayKey: overrides.dayKey || now.toISOString().slice(0, 10),
        dayPart: overrides.dayPart || getDayPart(now),
        weather: overrides.weather || getClimateProxyWeather(now),
        weatherSource: overrides.weatherSource || 'proxy',
        season: overrides.season || getSeason(now),
        month: overrides.month ?? now.getMonth() + 1,
        weekday: overrides.weekday ?? now.getDay(),
        hasLocation: Boolean(overrides.hasLocation),
        openCounts: overrides.openCounts || { bakeries: 1, farmers: 2, shops: 1, meat: 0 },
        ...overrides
    };
}

export function pickRegionalRecommendation(ctx, opts = {}) {
    const tips = opts.tips || REGIONAL_TIPS;
    const affinity = opts.affinity || new Map();

    if (opts.dayCacheId) {
        const cached = tips.find((x) => x.id === opts.dayCacheId);
        if (cached && isTipEligible(cached, ctx)) {
            return {
                tip: cached,
                score: scoreTip(cached, ctx, affinity, opts),
                fromCache: true
            };
        }
    }

    const ranked = tips
        .filter((tip) => isTipEligible(tip, ctx))
        .map((tip) => ({
            tip,
            score: scoreTip(tip, ctx, affinity, opts),
            fromCache: false
        }))
        .sort((a, b) => b.score - a.score || a.tip.id.localeCompare(b.tip.id));

    return ranked[0] || {
        tip: tips.find((x) => x.id === 'hostDefault') || tips[0],
        score: 0,
        fromCache: false
    };
}

export function resolveTipCopy(tipId, lang = 'pl') {
    const pl = TIP_COPY_PL[tipId] || TIP_COPY_PL.hostDefault;
    return pl;
}

export function buildRegionalReport(ctx, meta = {}) {
    const day = meta.day || ctx.dayKey || new Date().toISOString().slice(0, 10);
    const picked = pickRegionalRecommendation(ctx, meta.pickOpts || {});
    const tip = picked.tip;
    const copy = resolveTipCopy(tip.id);
    const recommendation = {
        id: tip.id,
        icon: tip.icon,
        headline: copy.headline,
        support: copy.support,
        category: tip.category || 'farmers',
        dayKey: day,
        score: picked.score,
        fromCache: Boolean(picked.fromCache),
        signals: {
            weather: ctx.weather,
            weatherSource: ctx.weatherSource || 'proxy',
            season: ctx.season,
            dayPart: ctx.dayPart,
            weekday: ctx.weekday,
            hasLocation: Boolean(ctx.hasLocation),
            openCounts: ctx.openCounts || null
        }
    };

    return {
        id: `regional-intelligence-${day}`,
        title: 'Regional Intelligence — gospodarz regionu',
        generatedAt: meta.generatedAt || new Date().toISOString(),
        day,
        policy: { ...POLICY },
        recommendation,
        recommendations: [recommendation],
        recommendationsCount: 1,
        signals: recommendation.signals,
        summary: {
            tipId: recommendation.id,
            headline: recommendation.headline,
            support: recommendation.support,
            maxMainRecommendations: 1,
            chatbot: false,
            ads: false,
            salesPitch: false
        }
    };
}

export function regionalReportToMarkdown(report) {
    const rec = report.recommendation;
    const lines = [
        `# ${report.title}`,
        '',
        `Dzień: **${report.day}**`,
        `Wygenerowano: ${report.generatedAt}`,
        '',
        '## Polityka',
        '',
        '- Nie chatbot · nie AI Assistant',
        '- **Jedna** główna rekomendacja na dzień',
        '- Bez reklam · bez sprzedaży · spokojny ton gospodarza',
        '',
        '## Rekomendacja dnia',
        ''
    ];

    if (!rec) {
        lines.push('_Brak rekomendacji._', '');
    } else {
        lines.push(`${rec.icon || '🌿'} **${rec.headline}**`);
        if (rec.support) lines.push('', rec.support);
        lines.push('', `_id: \`${rec.id}\` · category: ${rec.category}_`, '');
    }

    const s = report.signals || rec?.signals;
    if (s) {
        lines.push('## Sygnały', '');
        lines.push(`- pogoda: ${s.weather ?? '—'} (${s.weatherSource || '—'})`);
        lines.push(`- sezon: ${s.season ?? '—'}`);
        lines.push(`- pora dnia: ${s.dayPart ?? '—'}`);
        lines.push(`- dzień tygodnia: ${s.weekday ?? '—'}`);
        lines.push(`- lokalizacja: ${s.hasLocation ? 'tak' : 'brak / proxy'}`);
        if (s.openCounts) {
            lines.push(
                `- otwarte: bakeries ${s.openCounts.bakeries ?? 0}, farmers ${s.openCounts.farmers ?? 0}`
            );
        }
        lines.push('');
    }

    return lines.join('\n');
}

export default {
    POLICY,
    REGIONAL_TIPS,
    TIP_COPY_PL,
    buildProxyContext,
    pickRegionalRecommendation,
    buildRegionalReport,
    regionalReportToMarkdown
};
