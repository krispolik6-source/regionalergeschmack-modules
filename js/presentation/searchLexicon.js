// Wielojęzyczny leksykon wyszukiwania – dopasowanie niezależne od języka UI

import { TRANSLATIONS, SUPPORTED_LANGUAGE_CODES } from '../translations.js';
import { getProducerTypeKey } from './categoryIcons.js';

/** Kategoria producenta → klucz categories.* w tłumaczeniach */
export const PRODUCER_TO_CATEGORY_KEY = Object.freeze({
    farmer: 'farmers',
    bakery: 'bakeries',
    restaurant: 'restaurants',
    fast_food: 'fastFood',
    fastfood: 'fastFood',
    meat: 'meat',
    shop: 'shops',
    vending: 'vending',
    honey: 'farmers',
    dairy: 'farmers',
    fruit: 'farmers',
    vegetables: 'farmers',
    forest: 'farmers',
    other: 'all'
});

/** Grupy synonimów żywności / typów miejsc (małe litery) */
const SYNONYM_GROUPS = Object.freeze([
    ['bread', 'brot', 'chleb', 'хлеб', 'ekmek', 'pain', 'pan', 'brood', 'brød', 'bröd', 'leipä', 'pão', 'хліб', 'kenyér', '面包', '麵包', 'パン', '빵', 'bánh', 'roti', 'ขนมปัง', 'रोटी', 'bäck', 'back', 'bake', 'bakery', 'bäckerei', 'piekarz', 'пекарня', 'fırın', 'boulangerie', 'panadería', 'panificio', 'bakkerij', 'pekar', 'piekarnia'],
    ['cheese', 'käse', 'ser', 'сыр', 'peynir', 'fromage', 'queso', 'formaggio', 'kaas', 'sýr', 'juust', 'brânză', 'сир', 'τυρί', 'sajt', 'sir', 'syr', 'sūris', 'siers', 'juusto', 'ost', '奶酪', 'チーズ', '치즈', 'phô', 'keju', 'ชีส', 'पनीर', 'käse', 'molkerei', 'mleko', 'dairy'],
    ['meat', 'fleisch', 'mięso', 'мясо', 'et', 'viande', 'carne', 'vlees', 'maso', 'hús', 'месо', 'κρέας', 'meso', 'mėsa', 'gaļa', 'liha', 'kjöt', 'kött', '肉', '고기', 'thịt', 'daging', 'เนื้อ', 'मांस', 'metzgerei', 'butcher', 'fleischerei', 'wurst', 'kasap'],
    ['restaurant', 'restauracja', 'ресторан', 'restoran', 'restaurante', 'ristorante', 'restaurace', 'reštaurácia', 'étterem', 'ресторант', 'εστιατόριο', 'restoran', 'ресторан', 'restavracija', 'restoranas', 'restorāns', 'ravintola', 'restaurang', 'veitingastaður', '餐厅', '餐廳', 'レストラン', '레스토랑', 'nhà hàng', 'restoran', 'ร้านอาหาร', 'रेस्तरां', 'gasthaus', 'gaststätte'],
    ['fast_food', 'fastfood', 'fast food', 'imbiss', 'snack', 'snackbar', 'snack bar', 'döner', 'doner', 'kebab', 'burger', 'hamburger', 'pizza takeaway', 'takeaway', 'take away', 'mcdonald', 'kfc', 'subway', 'schnellrestaurant', 'street food'],
    ['farm', 'farmer', 'gospodarstwo', 'ферма', 'çiftlik', 'ferme', 'granja', 'fattoria', 'boerderij', 'farma', 'gazdaság', 'fermă', 'αγρόκτημα', 'kmetija', 'ūkis', 'gård', '农场', '農場', '農場', '농장', 'trang trại', 'ladang', 'peternakan', 'ฟาร์ม', 'खेत', 'hof', 'landwirt', 'bauernhof', 'bio'],
    ['shop', 'sklep', 'магазин', 'mağaza', 'magasin', 'tienda', 'negozio', 'winkel', 'obchod', 'bolt', 'magazin', 'κατάστημα', 'trgovina', 'продавница', 'parduotuvė', 'veikals', 'pood', 'kauppa', 'butik', 'verslun', '商店', '가게', 'cửa hàng', 'kedai', 'toko', 'ร้านค้า', 'दुकान', 'supermarket', 'markt', 'lidl', 'rewe', 'edeka', 'aldi'],
    ['honey', 'honig', 'miód', 'мёд', 'bal', 'miel', 'miele', 'honing', 'med', 'méz', 'miere', 'мед', 'μέλι', 'med', 'medus', 'medus', 'hunaja', 'honung', 'honning', 'honning', 'húnang', '蜂蜜', 'ハチミツ', '꿀', 'mật', 'madu', 'น้ำผึ้ง', 'शहद', 'imkerei', 'imker'],
    ['vegetable', 'gemüse', 'warzywa', 'овощи', 'sebze', 'légume', 'verdura', 'groente', 'zelenina', 'zelenina', 'zöldség', 'legume', 'зеленчуци', 'λαχανικά', 'povrće', 'zelenjava', 'daržovės', 'dārzeņi', 'köögiviljad', 'vihannes', 'grönsak', 'grønnsak', 'grøntsag', 'grænmeti', '蔬菜', '野菜', '채소', 'rau', 'sayur', 'ผัก', 'सब्जी'],
    ['fruit', 'obst', 'owoce', 'фрукты', 'meyve', 'fruit', 'fruta', 'frutta', 'fruit', 'ovoce', 'gyümölcs', 'fructe', 'плодове', 'φρούτα', 'voće', 'sadje', 'vaisiai', 'augļi', 'puuviljad', 'hedelmä', 'frukt', 'frukt', 'frugt', 'ávöxtur', '水果', '果物', '과일', 'trái', 'buah', 'ผลไม้', 'फल'],
    ['strawberry', 'erdbeere', 'truskawka', 'клубника', 'çilek', 'fraise', 'fresa', 'fragola', 'aardbei', 'jahoda', 'jahoda', 'eper', 'căpșună', 'ягода', 'φράουλα', 'jagoda', 'jagoda', 'jagoda', 'braškė', 'zemeņu', 'maasikas', 'mansikka', 'jordgubbe', 'jordbær', 'jordbær', 'jarðarber', '草莓', '草莓', 'いちご', '딸기', 'dâu', 'stroberi', 'stroberi', 'สตรอว์เบอร์รี', 'स्ट्रॉबेरी']
]);

const categoryLabelsCache = new Map();

/**
 * Normalizacja do porównań (wielkość liter, znaki diakrytyczne).
 * @param {string} text
 */
export function normalizeSearchText(text) {
    return String(text ?? '')
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .toLowerCase()
        .trim();
}

/**
 * Etykiety kategorii/typu producenta we wszystkich 35 językach.
 * @param {string} producerCategory
 */
export function getMultilingualCategoryLabels(producerCategory) {
    const cacheKey = String(producerCategory || 'other');
    if (categoryLabelsCache.has(cacheKey)) {
        return categoryLabelsCache.get(cacheKey);
    }

    const typeKey = getProducerTypeKey(producerCategory);
    const catKey = PRODUCER_TO_CATEGORY_KEY[producerCategory] || 'all';
    const labels = [];

    for (const code of SUPPORTED_LANGUAGE_CODES) {
        const tr = TRANSLATIONS[code];
        if (!tr) continue;
        const cat = tr.categories?.[catKey];
        if (cat?.name) labels.push(cat.name);
        if (cat?.desc) labels.push(cat.desc);
        const typeLabel = tr.producer?.types?.[typeKey];
        if (typeLabel) labels.push(typeLabel);
        const chips = tr.home?.chip;
        if (chips) {
            Object.values(chips).forEach((v) => labels.push(v));
        }
    }

    const text = [...new Set(labels.filter(Boolean))].join(' ');
    categoryLabelsCache.set(cacheKey, text);
    return text;
}

/**
 * Czy pojedynczy termin pasuje do haystack (z synonimami wielojęzycznymi).
 * @param {string} haystack
 * @param {string} term
 */
export function termMatchesHaystack(haystack, term) {
    const normalized = normalizeSearchText(haystack);
    const nTerm = normalizeSearchText(term);
    if (!nTerm) return true;
    if (normalized.includes(nTerm)) return true;

    for (const group of SYNONYM_GROUPS) {
        const normalizedGroup = group.map((w) => normalizeSearchText(w));
        const termInGroup = normalizedGroup.some(
            (syn) => syn.includes(nTerm) || nTerm.includes(syn)
        );
        if (termInGroup) {
            return normalizedGroup.some((syn) => normalized.includes(syn));
        }
    }
    return false;
}

/**
 * @param {string} haystack
 * @param {string[]} terms – słowa z zapytania użytkownika (AND)
 */
export function matchesSearchTerms(haystack, terms) {
    const userTerms = terms.map((t) => normalizeSearchText(t)).filter(Boolean);
    if (!userTerms.length) return true;
    return userTerms.every((term) => termMatchesHaystack(haystack, term));
}

/**
 * @deprecated Używaj termMatchesHaystack – zachowane dla kompatybilności.
 * @param {string[]} terms
 * @returns {string[]}
 */
export function expandSearchTerms(terms) {
    return terms.map((t) => normalizeSearchText(t)).filter(Boolean);
}
