/**
 * Generuje js/translations-search.js (35 języków – wyszukiwarka).
 * Run: node scripts/generate-search-i18n.mjs
 */
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, '..', 'js', 'translations-search.js');

/** @type {Record<string, Record<string, string>>} */
const LANG = {
    de: {
        homeSearchPlaceholder: 'Produkte, Restaurants, Läden oder Produzenten suchen...',
        mapSearchPlaceholder: 'Produkte, Restaurants, Läden oder Produzenten suchen...',
        noResults: 'Keine Ergebnisse für diese Suche.',
        resultsCount: '{count} Ergebnisse',
        searching: 'Suche läuft...'
    },
    en: {
        homeSearchPlaceholder: 'Search products, restaurants, shops or producers...',
        mapSearchPlaceholder: 'Search products, restaurants, shops or producers...',
        noResults: 'No results for this search.',
        resultsCount: '{count} results',
        searching: 'Searching...'
    },
    pl: {
        homeSearchPlaceholder: 'Szukaj produktów, restauracji, sklepów lub producentów...',
        mapSearchPlaceholder: 'Szukaj produktów, restauracji, sklepów lub producentów...',
        noResults: 'Brak wyników dla tego wyszukiwania.',
        resultsCount: '{count} wyników',
        searching: 'Szukanie...'
    },
    ru: {
        homeSearchPlaceholder: 'Искать продукты, рестораны, магазины или производителей...',
        mapSearchPlaceholder: 'Искать продукты, рестораны, магазины или производителей...',
        noResults: 'Нет результатов для этого поиска.',
        resultsCount: '{count} результатов',
        searching: 'Поиск...'
    },
    tr: {
        homeSearchPlaceholder: 'Ürün, restoran, mağaza veya üretici ara...',
        mapSearchPlaceholder: 'Ürün, restoran, mağaza veya üretici ara...',
        noResults: 'Bu arama için sonuç yok.',
        resultsCount: '{count} sonuç',
        searching: 'Aranıyor...'
    },
    fr: {
        homeSearchPlaceholder: 'Rechercher produits, restaurants, magasins ou producteurs...',
        mapSearchPlaceholder: 'Rechercher produits, restaurants, magasins ou producteurs...',
        noResults: 'Aucun résultat pour cette recherche.',
        resultsCount: '{count} résultats',
        searching: 'Recherche...'
    },
    es: {
        homeSearchPlaceholder: 'Buscar productos, restaurantes, tiendas o productores...',
        mapSearchPlaceholder: 'Buscar productos, restaurantes, tiendas o productores...',
        noResults: 'No hay resultados para esta búsqueda.',
        resultsCount: '{count} resultados',
        searching: 'Buscando...'
    },
    it: {
        homeSearchPlaceholder: 'Cerca prodotti, ristoranti, negozi o produttori...',
        mapSearchPlaceholder: 'Cerca prodotti, ristoranti, negozi o produttori...',
        noResults: 'Nessun risultato per questa ricerca.',
        resultsCount: '{count} risultati',
        searching: 'Ricerca...'
    },
    nl: {
        homeSearchPlaceholder: 'Zoek producten, restaurants, winkels of producenten...',
        mapSearchPlaceholder: 'Zoek producten, restaurants, winkels of producenten...',
        noResults: 'Geen resultaten voor deze zoekopdracht.',
        resultsCount: '{count} resultaten',
        searching: 'Zoeken...'
    },
    cs: {
        homeSearchPlaceholder: 'Hledat produkty, restaurace, obchody nebo výrobce...',
        mapSearchPlaceholder: 'Hledat produkty, restaurace, obchody nebo výrobce...',
        noResults: 'Žádné výsledky pro tento dotaz.',
        resultsCount: '{count} výsledků',
        searching: 'Vyhledávání...'
    },
    sk: {
        homeSearchPlaceholder: 'Hľadať produkty, reštaurácie, obchody alebo výrobcov...',
        mapSearchPlaceholder: 'Hľadať produkty, reštaurácie, obchody alebo výrobcov...',
        noResults: 'Žiadne výsledky pre tento dotaz.',
        resultsCount: '{count} výsledkov',
        searching: 'Vyhľadávanie...'
    },
    hu: {
        homeSearchPlaceholder: 'Termékek, éttermek, üzletek vagy termelők keresése...',
        mapSearchPlaceholder: 'Termékek, éttermek, üzletek vagy termelők keresése...',
        noResults: 'Nincs találat erre a keresésre.',
        resultsCount: '{count} találat',
        searching: 'Keresés...'
    },
    ro: {
        homeSearchPlaceholder: 'Căutați produse, restaurante, magazine sau producători...',
        mapSearchPlaceholder: 'Căutați produse, restaurante, magazine sau producători...',
        noResults: 'Niciun rezultat pentru această căutare.',
        resultsCount: '{count} rezultate',
        searching: 'Se caută...'
    },
    bg: {
        homeSearchPlaceholder: 'Търсене на продукти, ресторанти, магазини или производители...',
        mapSearchPlaceholder: 'Търсене на продукти, ресторанти, магазини или производители...',
        noResults: 'Няма резултати за това търсене.',
        resultsCount: '{count} резултата',
        searching: 'Търсене...'
    },
    el: {
        homeSearchPlaceholder: 'Αναζήτηση προϊόντων, εστιατορίων, καταστημάτων ή παραγωγών...',
        mapSearchPlaceholder: 'Αναζήτηση προϊόντων, εστιατορίων, καταστημάτων ή παραγωγών...',
        noResults: 'Δεν υπάρχουν αποτελέσματα για αυτή την αναζήτηση.',
        resultsCount: '{count} αποτελέσματα',
        searching: 'Αναζήτηση...'
    },
    hr: {
        homeSearchPlaceholder: 'Pretraži proizvode, restorane, trgovine ili proizvođače...',
        mapSearchPlaceholder: 'Pretraži proizvode, restorane, trgovine ili proizvođače...',
        noResults: 'Nema rezultata za ovu pretragu.',
        resultsCount: '{count} rezultata',
        searching: 'Pretraživanje...'
    },
    sr: {
        homeSearchPlaceholder: 'Претражи производе, ресторане, продавнице или произвођаче...',
        mapSearchPlaceholder: 'Претражи производе, ресторане, продавнице или произвођаче...',
        noResults: 'Нема резултата за ову претрагу.',
        resultsCount: '{count} резултата',
        searching: 'Претрага...'
    },
    sl: {
        homeSearchPlaceholder: 'Išči izdelke, restavracije, trgovine ali proizvajalce...',
        mapSearchPlaceholder: 'Išči izdelke, restavracije, trgovine ali proizvajalce...',
        noResults: 'Ni rezultatov za to iskanje.',
        resultsCount: '{count} rezultatov',
        searching: 'Iskanje...'
    },
    lt: {
        homeSearchPlaceholder: 'Ieškoti produktų, restoranų, parduotuvių ar gamintojų...',
        mapSearchPlaceholder: 'Ieškoti produktų, restoranų, parduotuvių ar gamintojų...',
        noResults: 'Šiai paieškai rezultatų nėra.',
        resultsCount: '{count} rezultatų',
        searching: 'Ieškoma...'
    },
    lv: {
        homeSearchPlaceholder: 'Meklēt produktus, restorānus, veikalus vai ražotājus...',
        mapSearchPlaceholder: 'Meklēt produktus, restorānus, veikalus vai ražotājus...',
        noResults: 'Šai meklēšanai rezultātu nav.',
        resultsCount: '{count} rezultāti',
        searching: 'Meklē...'
    },
    et: {
        homeSearchPlaceholder: 'Otsi tooteid, restorane, poode või tootjaid...',
        mapSearchPlaceholder: 'Otsi tooteid, restorane, poode või tootjaid...',
        noResults: 'Selle otsingu jaoks tulemusi pole.',
        resultsCount: '{count} tulemust',
        searching: 'Otsimine...'
    },
    fi: {
        homeSearchPlaceholder: 'Etsi tuotteita, ravintoloita, kauppoja tai tuottajia...',
        mapSearchPlaceholder: 'Etsi tuotteita, ravintoloita, kauppoja tai tuottajia...',
        noResults: 'Ei tuloksia tälle haulle.',
        resultsCount: '{count} tulosta',
        searching: 'Haetaan...'
    },
    sv: {
        homeSearchPlaceholder: 'Sök produkter, restauranger, butiker eller producenter...',
        mapSearchPlaceholder: 'Sök produkter, restauranger, butiker eller producenter...',
        noResults: 'Inga resultat för denna sökning.',
        resultsCount: '{count} resultat',
        searching: 'Söker...'
    },
    no: {
        homeSearchPlaceholder: 'Søk produkter, restauranter, butikker eller produsenter...',
        mapSearchPlaceholder: 'Søk produkter, restauranter, butikker eller produsenter...',
        noResults: 'Ingen resultater for dette søket.',
        resultsCount: '{count} resultater',
        searching: 'Søker...'
    },
    da: {
        homeSearchPlaceholder: 'Søg produkter, restauranter, butikker eller producenter...',
        mapSearchPlaceholder: 'Søg produkter, restauranter, butikker eller producenter...',
        noResults: 'Ingen resultater for denne søgning.',
        resultsCount: '{count} resultater',
        searching: 'Søger...'
    },
    is: {
        homeSearchPlaceholder: 'Leita að vörum, veitingastöðum, verslunum eða framleiðendum...',
        mapSearchPlaceholder: 'Leita að vörum, veitingastöðum, verslunum eða framleiðendum...',
        noResults: 'Engar niðurstöður fyrir þessa leit.',
        resultsCount: '{count} niðurstöður',
        searching: 'Leita...'
    },
    zh: {
        homeSearchPlaceholder: '搜索产品、餐厅、商店或生产商...',
        mapSearchPlaceholder: '在地图上搜索产品、餐厅、商店或生产商...',
        noResults: '此搜索无结果。',
        resultsCount: '{count} 个结果',
        searching: '搜索中...'
    },
    'zh-tw': {
        homeSearchPlaceholder: '搜尋產品、餐廳、商店或生產商...',
        mapSearchPlaceholder: '在地圖上搜尋產品、餐廳、商店或生產商...',
        noResults: '此搜尋無結果。',
        resultsCount: '{count} 個結果',
        searching: '搜尋中...'
    },
    ja: {
        homeSearchPlaceholder: '製品、レストラン、店舗、生産者を検索...',
        mapSearchPlaceholder: '地図で製品、レストラン、店舗、生産者を検索...',
        noResults: 'この検索の結果はありません。',
        resultsCount: '{count} 件の結果',
        searching: '検索中...'
    },
    ko: {
        homeSearchPlaceholder: '제품, 레스토랑, 상점 또는 생산자 검색...',
        mapSearchPlaceholder: '지도에서 제품, 레스토랑, 상점 또는 생산자 검색...',
        noResults: '이 검색에 대한 결과가 없습니다.',
        resultsCount: '{count}개 결과',
        searching: '검색 중...'
    },
    vi: {
        homeSearchPlaceholder: 'Tìm sản phẩm, nhà hàng, cửa hàng hoặc nhà sản xuất...',
        mapSearchPlaceholder: 'Tìm trên bản đồ: sản phẩm, nhà hàng, cửa hàng...',
        noResults: 'Không có kết quả cho tìm kiếm này.',
        resultsCount: '{count} kết quả',
        searching: 'Đang tìm...'
    },
    ms: {
        homeSearchPlaceholder: 'Cari produk, restoran, kedai atau pengeluar...',
        mapSearchPlaceholder: 'Cari pada peta: produk, restoran, kedai...',
        noResults: 'Tiada hasil untuk carian ini.',
        resultsCount: '{count} hasil',
        searching: 'Mencari...'
    },
    id: {
        homeSearchPlaceholder: 'Cari produk, restoran, toko, atau produsen...',
        mapSearchPlaceholder: 'Cari di peta: produk, restoran, toko...',
        noResults: 'Tidak ada hasil untuk pencarian ini.',
        resultsCount: '{count} hasil',
        searching: 'Mencari...'
    },
    th: {
        homeSearchPlaceholder: 'ค้นหาผลิตภัณฑ์ ร้านอาหาร ร้านค้า หรือผู้ผลิต...',
        mapSearchPlaceholder: 'ค้นหาบนแผนที่: ผลิตภัณฑ์ ร้านอาหาร ร้านค้า...',
        noResults: 'ไม่พบผลลัพธ์สำหรับการค้นหานี้',
        resultsCount: '{count} ผลลัพธ์',
        searching: 'กำลังค้นหา...'
    },
    hi: {
        homeSearchPlaceholder: 'उत्पाद, रेस्तरां, दुकानें या उत्पादक खोजें...',
        mapSearchPlaceholder: 'मानचित्र पर उत्पाद, रेस्तरां, दुकानें खोजें...',
        noResults: 'इस खोज के लिए कोई परिणाम नहीं।',
        resultsCount: '{count} परिणाम',
        searching: 'खोज रहे हैं...'
    }
};

const ALL_CODES = Object.keys(LANG);

function fmtEntry(code, obj) {
    const key = /^[a-z][a-z0-9]*$/i.test(code) ? code : JSON.stringify(code);
    const lines = Object.entries(obj).map(([k, v]) => `        ${k}: ${JSON.stringify(v)}`);
    return `    ${key}: {\n${lines.join(',\n')}\n    }`;
}

const body = ALL_CODES.map((c) => fmtEntry(c, LANG[c])).join(',\n');
const file = `// Tłumaczenia wyszukiwarki – wszystkie 35 języków
// Wygenerowano: node scripts/generate-search-i18n.mjs

/** @type {Record<string, Record<string, string>>} */
export const SEARCH_I18N = Object.freeze({\n${body}\n});\n`;

writeFileSync(outPath, file, 'utf8');
console.log(`Wrote ${outPath} (${ALL_CODES.length} languages)`);
