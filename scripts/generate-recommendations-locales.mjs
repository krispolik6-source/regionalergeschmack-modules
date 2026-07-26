/**
 * Generuje js/translations-recommendations-locales.js – rekomendacje Home (36 języków).
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SMART_TODAY_I18N } from '../js/translations-smart-today.js';
import { TASTE_ADVISOR_I18N } from '../js/translations-taste-advisor.js';
import { TASTES_OF_DAY_I18N } from '../js/translations-tastes-of-day.js';
import { LIVING_MAP_I18N } from '../js/translations-living-map.js';
import { HOME_FILL_I18N } from '../js/translations-home-fill.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'js/translations-recommendations-locales.js');

/** @type {string[]} */
const ALL_CODES = [
    'de', 'en', 'pl', 'ru', 'tr', 'fr', 'es', 'it', 'nl', 'cs', 'sk', 'hu', 'ro', 'bg', 'el',
    'hr', 'sr', 'mk', 'sl', 'lt', 'lv', 'et', 'fi', 'sv', 'no', 'da', 'is',
    'zh', 'zh-tw', 'ja', 'ko', 'vi', 'ms', 'id', 'th', 'hi'
];

/** Ręczne tłumaczenia kluczowych fraz (pozostałe z EN packów modułów). */
const OVERRIDES = {
    ru: {
        home: {
            tasteAdvisorTitle: 'Ваш гастрономический советник',
            smartTodayTitle: 'Рекомендуем сегодня',
            tastesOfDayTitle: 'Вкусы дня'
        },
        tasteAdvisor: {
            hello: 'Добрый день.',
            ctaHoney: 'Открыть пасеку',
            ctaRoute: 'Открыть маршрут'
        },
        tastesOfDay: {
            soupRain: 'В дождь согревает сезонный суп из трактира.'
        },
        smartToday: { reason: { rain: 'Дождь – свежий хлеб и тёплый суп.' } },
        livingMap: { recommended: 'Рекомендуем сегодня' }
    },
    tr: {
        home: {
            tasteAdvisorTitle: 'Lezzet danışmanınız',
            smartTodayTitle: 'Bugün önerilen',
            tastesOfDayTitle: 'Günün lezzetleri'
        },
        tasteAdvisor: {
            hello: 'İyi günler.',
            ctaHoney: 'Arıcılığa git',
            ctaRoute: 'Rotayı aç'
        },
        tastesOfDay: {
            soupRain: 'Yağmurda handan gelen mevsim çorbası ısıtır.'
        },
        smartToday: { reason: { rain: 'Yağmur – taze ekmek ve sıcak çorba.' } },
        livingMap: { recommended: 'Bugün önerilen' }
    },
    fr: {
        home: {
            tasteAdvisorTitle: 'Votre conseiller gustatif',
            smartTodayTitle: 'Recommandé aujourd\u2019hui',
            tastesOfDayTitle: 'Saveurs du jour'
        },
        tasteAdvisor: {
            hello: 'Bonjour.',
            ctaHoney: 'Ouvrir la rucher',
            ctaRoute: 'Ouvrir l\u2019itinéraire'
        },
        tastesOfDay: {
            soupRain: 'Sous la pluie, une soupe de saison de l\u2019auberge réchauffe.'
        },
        smartToday: { reason: { rain: 'Pluie – pain frais et soupe chaude.' } },
        livingMap: { recommended: 'Recommandé aujourd\u2019hui' }
    },
    es: {
        home: {
            tasteAdvisorTitle: 'Tu asesor de sabor',
            smartTodayTitle: 'Recomendado hoy',
            tastesOfDayTitle: 'Sabores del día'
        },
        tasteAdvisor: {
            hello: 'Buenos días.',
            ctaHoney: 'Abrir el apiario',
            ctaRoute: 'Abrir la ruta'
        },
        tastesOfDay: {
            soupRain: 'Con lluvia, una sopa de temporada de la posada calienta.'
        }
    },
    it: {
        home: {
            tasteAdvisorTitle: 'Il tuo consigliere di gusto',
            smartTodayTitle: 'Consigliato oggi',
            tastesOfDayTitle: 'Sapori del giorno'
        },
        tasteAdvisor: {
            hello: 'Buongiorno.',
            ctaHoney: 'Apri l\u2019apicoltura',
            ctaRoute: 'Apri il percorso'
        },
        tastesOfDay: {
            soupRain: 'Con la pioggia, una zuppa di stagione dalla locanda scalda.'
        }
    },
    nl: {
        home: {
            tasteAdvisorTitle: 'Jouw smaakadviseur',
            smartTodayTitle: 'Vandaag aanbevolen',
            tastesOfDayTitle: 'Smaken van de dag'
        },
        tasteAdvisor: {
            hello: 'Goedendag.',
            ctaHoney: 'Open de imkerij',
            ctaRoute: 'Route openen'
        },
        tastesOfDay: {
            soupRain: 'Bij regen warmt een seizoenssoep uit de herberg.'
        }
    },
    zh: {
        home: {
            tasteAdvisorTitle: '你的风味顾问',
            smartTodayTitle: '今日推荐',
            tastesOfDayTitle: '今日风味'
        },
        tasteAdvisor: {
            hello: '您好。',
            ctaHoney: '打开养蜂场',
            ctaRoute: '打开路线'
        },
        tastesOfDay: {
            soupRain: '雨天里，客栈的季节汤最暖身。'
        }
    },
    ja: {
        home: {
            tasteAdvisorTitle: 'あなたの味覚アドバイザー',
            smartTodayTitle: '本日のおすすめ',
            tastesOfDayTitle: '今日の味'
        },
        tasteAdvisor: {
            hello: 'こんにちは。',
            ctaHoney: '養蜂場を開く',
            ctaRoute: 'ルートを開く'
        },
        tastesOfDay: {
            soupRain: '雨の日は宿の季節のスープが心を温めます。'
        },
        smartToday: { reason: { rain: '雨 – 焼きたてのパンと温かいスープ。' } },
        livingMap: { recommended: '本日のおすすめ' }
    },
    cs: {
        home: { tasteAdvisorTitle: 'Váš chuťový poradce', smartTodayTitle: 'Dnes doporučeno', tastesOfDayTitle: 'Chutě dne' },
        tasteAdvisor: { hello: 'Dobrý den.', ctaHoney: 'Otevřít včelnictví', ctaRoute: 'Otevřít trasu' },
        tastesOfDay: { soupRain: 'V dešti zahřeje sezónní polévka z hospody.' },
        smartToday: { reason: { rain: 'Déšť – čerstvý chléb a teplá polévka.' } },
        livingMap: { recommended: 'Dnes doporučeno' }
    },
    sk: {
        home: { tasteAdvisorTitle: 'Váš chuťový poradca', smartTodayTitle: 'Dnes odporúčané', tastesOfDayTitle: 'Chute dňa' },
        tasteAdvisor: { hello: 'Dobrý deň.', ctaHoney: 'Otvoriť včelín', ctaRoute: 'Otvoriť trasu' },
        tastesOfDay: { soupRain: 'V daždi zahreje sezónna polievka z hostinca.' },
        smartToday: { reason: { rain: 'Dážď – čerstvý chlieb a teplá polievka.' } },
        livingMap: { recommended: 'Dnes odporúčané' }
    },
    hu: {
        home: { tasteAdvisorTitle: 'Az ízlés tanácsadód', smartTodayTitle: 'Ma ajánlott', tastesOfDayTitle: 'A nap ízei' },
        tasteAdvisor: { hello: 'Jó napot.', ctaHoney: 'Méhészet megnyitása', ctaRoute: 'Útvonal megnyitása' },
        tastesOfDay: { soupRain: 'Esőben jól esik egy szezonális leves a csárdából.' },
        smartToday: { reason: { rain: 'Eső – friss kenyér és meleg leves.' } },
        livingMap: { recommended: 'Ma ajánlott' }
    },
    ko: {
        home: { tasteAdvisorTitle: '당신의 미식 어드바이저', smartTodayTitle: '오늘의 추천', tastesOfDayTitle: '오늘의 맛' },
        tasteAdvisor: { hello: '안녕하세요.', ctaHoney: '양봉장 열기', ctaRoute: '경로 열기' },
        tastesOfDay: { soupRain: '비 오는 날 여관의 제철 수프가 몸을 데웁니다.' },
        smartToday: { reason: { rain: '비 – 갓 구운 빵과 따뜻한 수프.' } },
        livingMap: { recommended: '오늘의 추천' }
    },
    'zh-tw': {
        home: { tasteAdvisorTitle: '你的風味顧問', smartTodayTitle: '今日推薦', tastesOfDayTitle: '今日風味' },
        tasteAdvisor: { hello: '您好。', ctaHoney: '開啟養蜂場', ctaRoute: '開啟路線' },
        tastesOfDay: { soupRain: '雨天裡，客棧的季節湯最暖身。' },
        smartToday: { reason: { rain: '雨天 – 新鮮麵包與熱湯。' } },
        livingMap: { recommended: '今日推薦' }
    }
};

function deepMerge(base, patch) {
    const out = { ...(base || {}) };
    for (const [k, v] of Object.entries(patch || {})) {
        if (v && typeof v === 'object' && !Array.isArray(v)) {
            out[k] = deepMerge(out[k], v);
        } else {
            out[k] = v;
        }
    }
    return out;
}

function packFor(code) {
    const taste = TASTE_ADVISOR_I18N[code] || TASTE_ADVISOR_I18N.en;
    const smart = SMART_TODAY_I18N[code] || SMART_TODAY_I18N.en;
    const tastes = TASTES_OF_DAY_I18N[code] || TASTES_OF_DAY_I18N.en;
    const living = LIVING_MAP_I18N[code] || LIVING_MAP_I18N.en;
    const homeFill = HOME_FILL_I18N[code] || HOME_FILL_I18N.en;
    let pack = deepMerge(taste, smart);
    pack = deepMerge(pack, tastes);
    pack = deepMerge(pack, { livingMap: living.livingMap });
    if (homeFill?.home?.regionalIntelLabel) {
        pack = deepMerge(pack, { home: { regionalIntelLabel: homeFill.home.regionalIntelLabel } });
    }
    if (OVERRIDES[code]) {
        pack = deepMerge(pack, OVERRIDES[code]);
    }
    return pack;
}

const locales = {};
for (const code of ALL_CODES) {
    locales[code] = packFor(code);
}

const header = `/**
 * Rekomendacje Home – pełne pakiety dla 36 języków (tasteAdvisor, smartToday, tastesOfDay, livingMap).
 * Wygenerowano: scripts/generate-recommendations-locales.mjs
 */

/** @type {Record<string, object>} */
export const RECOMMENDATIONS_LOCALES = Object.freeze(
`;

writeFileSync(
    OUT,
    `${header}${JSON.stringify(locales, null, 4)}\n);\n`,
    'utf8'
);
console.log('Wrote', OUT, 'languages:', ALL_CODES.length);
