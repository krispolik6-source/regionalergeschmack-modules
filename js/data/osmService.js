// js/data/osmService.js – producenci z OpenStreetMap (Overpass API)

import { CONFIG } from '../config.js';
import { isCacheNearLocation } from '../core/userLocation.js';
import { t } from '../core/i18n.js';

const DEFAULT_RADIUS_M = 5000;

const OVERPASS_ENDPOINTS = dedupeUrls([
    CONFIG.OVERPASS_URL,
    ...(CONFIG.OVERPASS_MIRROR_URLS || [])
]);

const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);
const MAX_ATTEMPTS = Math.max(
    3,
    Number(CONFIG.OVERPASS_RETRIES) || 3,
    OVERPASS_ENDPOINTS.length
);

/** @param {string[]} urls */
function dedupeUrls(urls) {
    const seen = new Set();
    const out = [];
    for (const raw of urls) {
        const url = String(raw || '').trim();
        if (!url || seen.has(url)) continue;
        seen.add(url);
        out.push(url);
    }
    return out;
}

/** Fisher–Yates – losowa kolejność luster po 504 / błędzie retryable */
function shuffleUrls(urls) {
    const arr = urls.slice();
    for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
    return arr;
}

/**
 * Plan endpointów: primary → po pierwszym błędzie retryable (np. 504)
 * pozostałe lustra w losowej kolejności.
 * @param {number} [failedStatus]
 */
function planOverpassEndpoints(failedStatus) {
    const primary = OVERPASS_ENDPOINTS[0];
    const mirrors = OVERPASS_ENDPOINTS.slice(1);
    if (!mirrors.length) return primary ? [primary] : [];

    // Po 504 (i innych retryable) – losowa kolejność luster
    if (failedStatus == null || RETRYABLE_STATUS.has(failedStatus) || failedStatus === 0) {
        return [primary, ...shuffleUrls(mirrors)].filter(Boolean);
    }
    return [primary, ...mirrors].filter(Boolean);
}

const OSM_CACHE_KEY = 'rg_osm_overpass_cache_v5';
const LEGACY_OSM_CACHE_KEYS = Object.freeze([
    'rg_osm_overpass_cache_v2',
    'rg_osm_overpass_cache_v3',
    'rg_osm_overpass_cache_v4'
]);
const OSM_CACHE_TTL_MS = Number(CONFIG.cacheTTL) || 24 * 60 * 60 * 1000;
let inflightOsmRequests = new Map();
/** Aktywne AbortController – anulowanie przy zmianie lokalizacji / wyjściu z mapy */
const activeAbortControllers = new Set();
let osmAbortEpoch = 0;

/** Błąd anulowania – flaga isAborted blokuje zapis stale-cache po race. */
export function createOsmAbortError() {
    const error = new Error('Overpass aborted');
    error.isAborted = true;
    return error;
}

export function isOsmAbortError(error) {
    return !!(error?.isAborted || String(error?.message || '') === 'Overpass aborted');
}

export function getOsmAbortEpoch() {
    return osmAbortEpoch;
}

function throwIfOsmAborted(epochAtStart) {
    if (epochAtStart !== osmAbortEpoch) {
        throw createOsmAbortError();
    }
}

/** Usuwa stare cache Overpass – wymusza ponowne pobranie m.in. amenity=fast_food. */
function clearLegacyOsmCaches() {
    if (typeof localStorage === 'undefined') return;
    for (const key of LEGACY_OSM_CACHE_KEYS) {
        try {
            localStorage.removeItem(key);
        } catch (_) {
            /* ignore */
        }
    }
}

clearLegacyOsmCaches();

/**
 * Anuluje trwające requesty Overpass (stare wyniki nie mają prawa nadpisać nowych).
 */
export function abortInflightOsmRequests() {
    osmAbortEpoch += 1;
    for (const controller of activeAbortControllers) {
        try {
            controller.abort();
        } catch (_) {
            /* ignore */
        }
    }
    activeAbortControllers.clear();
    inflightOsmRequests.clear();
}

const OSM_CATEGORY_RULES = [
    { key: 'shop', value: 'bakery', category: 'bakery' },
    { key: 'shop', value: 'butcher', category: 'meat' },
    // fast_food przed restaurant – nigdy nie mieszać z restauracjami
    { key: 'amenity', value: 'fast_food', category: 'fast_food' },
    { key: 'amenity', value: 'restaurant', category: 'restaurant' },
    // Rolnicy / Hofläden (Home: farmers → farmer)
    { key: 'shop', value: 'farm', category: 'farmer' },
    { key: 'shop', value: 'honey', category: 'farmer' },
    { key: 'craft', value: 'beekeeper', category: 'farmer' },
    { key: 'amenity', value: 'vending_machine', category: 'vending' }
];

/** Sklepy ogólne (supermarket, convenience itd.) → kategoria shop */
const OSM_SHOP_VALUES = Object.freeze([
    'supermarket',
    'convenience',
    'general',
    'greengrocer',
    'deli',
    'kiosk',
    'variety_store',
    'country_store',
    'department_store'
]);

/** Wzorzec tagów shop w jednym zapytaniu Overpass (mniej obciążenia API) */
const OSM_SHOP_TAG_REGEX = '^(bakery|butcher|farm|honey|supermarket|convenience|general|greengrocer|deli|kiosk|variety_store|country_store|department_store)$';
const OSM_AMENITY_TAG_REGEX = '^(restaurant|fast_food|vending_machine)$';
const OSM_CRAFT_TAG_REGEX = '^(beekeeper)$';

function buildOverpassQuery(lat, lng, radiusM) {
    const around = `around:${radiusM},${lat},${lng}`;
    const queryTimeout = Math.max(25, Number(CONFIG.OVERPASS_QUERY_TIMEOUT) || 55);

    return `[out:json][timeout:${queryTimeout}];(
        nwr(${around})["shop"~"${OSM_SHOP_TAG_REGEX}"];
        nwr(${around})["amenity"~"${OSM_AMENITY_TAG_REGEX}"];
        nwr(${around})["craft"~"${OSM_CRAFT_TAG_REGEX}"];
    );out center;`;
}

function resolveCategory(tags = {}) {
    for (const rule of OSM_CATEGORY_RULES) {
        if (tags[rule.key] === rule.value) return rule.category;
    }
    if (tags.shop && OSM_SHOP_VALUES.includes(tags.shop)) {
        return 'shop';
    }
    return 'other';
}

function getElementCoords(element) {
    const lat = Number(element.lat ?? element.center?.lat);
    const lng = Number(element.lon ?? element.center?.lon);
    return { lat, lng };
}

function buildAddress(tags = {}) {
    const parts = [
        [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(' '),
        [tags['addr:postcode'], tags['addr:city']].filter(Boolean).join(' ')
    ].filter(Boolean);

    if (parts.length) return parts.join(', ');
    if (tags.address) return String(tags.address);
    return '';
}

function resolveProducerName(tags, element) {
    const direct = String(tags.name || '').trim();
    if (direct) return direct;

    const brand = String(tags.brand || tags.operator || '').trim();
    if (brand) return brand;

    if (tags.amenity === 'vending_machine') {
        const product = String(tags.vending || tags['vending:food'] || tags['vending:drinks'] || '').trim();
        if (product) return `Automat (${product})`;
        const street = String(tags['addr:street'] || '').trim();
        if (street) return `Automat ${street}`;
        return `Automat #${element.id}`;
    }

    // Nienazwane Imbissy – nie porzucaj (elementToProducer wymaga nazwy)
    if (tags.amenity === 'fast_food') {
        const street = String(tags['addr:street'] || '').trim();
        if (street) return `Imbiss ${street}`;
        const cuisine = String(tags.cuisine || '').trim().replace(/_/g, ' ');
        if (cuisine) return `Imbiss (${cuisine})`;
        return `Imbiss #${element.id}`;
    }

    // Nienazwane Hofläden / farm shops / imkerie
    if (tags.shop === 'farm' || tags.shop === 'honey' || tags.craft === 'beekeeper') {
        const street = String(tags['addr:street'] || '').trim();
        if (tags.shop === 'farm') {
            const label = t('map.fallbackHofladenName');
            if (street) return `${label} ${street}`;
            return `${label} #${element.id}`;
        }
        if (tags.shop === 'honey' || tags.craft === 'beekeeper') {
            if (street) return `Imkerei ${street}`;
            return `Imkerei #${element.id}`;
        }
    }

    if (tags.shop && OSM_SHOP_VALUES.includes(tags.shop)) {
        const shopLabel = tags.shop.replace(/_/g, ' ');
        const street = String(tags['addr:street'] || '').trim();
        if (street) return `${shopLabel} ${street}`;
        return `${shopLabel} #${element.id}`;
    }

    const street = String(tags['addr:street'] || '').trim();
    if (street) return street;

    // Zawsze nazwa – nigdy „unnamed” w UI / Health Check
    const amenity = String(tags.amenity || tags.shop || tags.craft || '').replace(/_/g, ' ').trim();
    if (amenity) {
        return `${t('map.unknownProducer')} (${amenity})`;
    }
    return t('map.unknownProducer') || 'Nieznany producent';
}

function parseOsmPrice(tags = {}) {
    const raw = String(tags.charge || tags.fee || tags.price || '').trim();
    if (!raw) return 0;
    const match = raw.replace(',', '.').match(/(\d+(?:\.\d+)?)/);
    const value = match ? Number(match[1]) : NaN;
    return Number.isFinite(value) ? value : 0;
}

/** Produkty wyłącznie z tagów OSM (vending, product) – bez danych demo */
function extractProductsFromTags(tags = {}, elementId = '') {
    const products = [];
    const price = parseOsmPrice(tags);
    const vending = String(
        tags.vending || tags['vending:food'] || tags['vending:drinks'] || ''
    ).trim();

    if (vending) {
        vending.split(';').map((part) => part.trim()).filter(Boolean).forEach((item, index) => {
            products.push({
                id: `osm-${elementId}-vending-${index}`,
                name: item.replace(/_/g, ' '),
                description: '',
                price,
                unit: '',
                promo: ''
            });
        });
    }

    const productTag = String(tags.product || '').trim();
    if (productTag && products.length === 0) {
        productTag.split(';').map((part) => part.trim()).filter(Boolean).forEach((item, index) => {
            products.push({
                id: `osm-${elementId}-product-${index}`,
                name: item.replace(/_/g, ' '),
                description: '',
                price,
                unit: '',
                promo: ''
            });
        });
    }

    return products;
}

function extractOsmLogoUrl(tags = {}) {
    const candidates = [
        tags.logo,
        tags.image,
        tags['brand:logo'],
        tags['contact:logo'],
        tags['image:logo']
    ];
    for (const raw of candidates) {
        const url = String(raw || '').trim();
        if (/^https?:\/\//i.test(url)) return url;
    }
    return '';
}

function elementToProducer(element) {
    const tags = element.tags || {};
    const { lat, lng } = getElementCoords(element);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    const name = resolveProducerName(tags, element);
    if (!name) return null;

    const category = resolveCategory(tags);
    const chain = detectChain(tags);
    const osmType = element.type || 'node';

    const hours = String(tags.opening_hours || '').trim();
    const logo = extractOsmLogoUrl(tags);

    return {
        id: `osm-${osmType}-${element.id}`,
        name,
        category: chain ? 'shop' : category,
        chain,
        logo,
        image: logo,
        address: buildAddress(tags),
        lat,
        lng,
        description: tags.description || tags.cuisine || '',
        rating: null,
        promo: '',
        phone: tags.phone || tags['contact:phone'] || '',
        email: tags.email || tags['contact:email'] || '',
        website: tags.website || tags['contact:website'] || '',
        facebook: tags['contact:facebook'] || tags.facebook || '',
        instagram: tags['contact:instagram'] || tags.instagram || '',
        wheelchair: tags.wheelchair || '',
        parking: tags.parking || tags['parking:lane'] || '',
        delivery: tags.delivery || '',
        outdoorSeating: tags.outdoor_seating || '',
        wifi: tags.internet_access || tags.wifi || '',
        paymentCards: tags['payment:credit_cards']
            || tags['payment:debit_cards']
            || tags['payment:mastercard']
            || tags['payment:visa']
            || '',
        hours,
        openingHours: hours,
        products: extractProductsFromTags(tags, element.id),
        promotions: [],
        source: 'osm'
    };
}

function detectChain(tags = {}) {
    const brand = String(tags.brand || tags.operator || '').toLowerCase();
    if (brand.includes('lidl')) return 'lidl';
    if (brand.includes('aldi')) return 'aldi';
    if (brand.includes('rewe')) return 'rewe';
    if (brand.includes('edeka')) return 'edeka';
    if (brand.includes('kaufland')) return 'kaufland';
    if (brand.includes('netto')) return 'netto';
    if (brand.includes('penny')) return 'penny';
    if (brand.includes('globus')) return 'globus';
    if (brand.includes("denn's") || brand.includes('denns')) return 'denns';
    if (brand.includes('alnatura')) return 'alnatura';
    if (brand.includes('biedronka')) return 'biedronka';
    return '';
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function readOsmCache({ allowStale = false } = {}) {
    if (typeof localStorage === 'undefined') return null;
    try {
        const raw = localStorage.getItem(OSM_CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed?.producers)) return null;
        const producers = parsed.producers.filter((p) => {
            if (!p?.id) return false;
            const lat = Number(p.lat);
            const lng = Number(p.lng);
            return Number.isFinite(lat) && Number.isFinite(lng);
        });
        if (!producers.length) return null;
        if (!allowStale) {
            if (!parsed?.timestamp || Date.now() - parsed.timestamp > OSM_CACHE_TTL_MS) return null;
        }
        return { ...parsed, producers };
    } catch (_) {
        return null;
    }
}

function writeOsmCache(lat, lng, radiusM, producers) {
    if (typeof localStorage === 'undefined') return;
    try {
        localStorage.setItem(OSM_CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            lat,
            lng,
            radiusM,
            producers
        }));
    } catch (_) {
        /* ignore quota */
    }
}

async function requestOverpass(endpoint, query, signal) {
    // POST – mniejsza szansa na ucięcie długiego URL / limity proxy
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'User-Agent': 'RegionalerGeschmack/1.0'
        },
        body: `data=${encodeURIComponent(query)}`,
        signal
    });

    if (!response.ok) {
        const error = new Error(`Overpass HTTP ${response.status}`);
        error.status = response.status;
        throw error;
    }

    const payload = await response.json();
    const elements = Array.isArray(payload?.elements) ? payload.elements : [];

    return elements
        .map(elementToProducer)
        .filter(Boolean);
}

/**
 * Pobiera producentów z Overpass API w promieniu od punktu.
 * Próbuje główny endpoint i lustra z CONFIG przy błędach 429/502/503/504.
 * Po 504/timeout – pozostałe lustra w losowej kolejności.
 * @param {number} lat
 * @param {number} lng
 * @param {number} [radiusM] promień w metrach (domyślnie 5000)
 * @returns {Promise<object[]>}
 */
export async function fetchProducers(lat, lng, radiusM = DEFAULT_RADIUS_M) {
    const latitude = Number(lat);
    const longitude = Number(lng);
    const radius = Number(radiusM);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error('Invalid coordinates');
    }

    const query = buildOverpassQuery(latitude, longitude, radius);
    const requestKey = `${latitude.toFixed(5)}:${longitude.toFixed(5)}:${radius}`;
    const timeoutMs = Math.max(
        60000,
        Number(CONFIG.OVERPASS_TIMEOUT) || 60000,
        Number(CONFIG.fetchTimeout) || 0
    );
    const errors = [];
    const maxAttempts = Math.max(MAX_ATTEMPTS, OVERPASS_ENDPOINTS.length);

    if (inflightOsmRequests.has(requestKey)) {
        return inflightOsmRequests.get(requestKey);
    }

    const epochAtStart = osmAbortEpoch;

    const requestPromise = (async () => {
        // Start: primary + lustra; po 504 kolejność luster jest tasowana
        let endpointPlan = planOverpassEndpoints();
        let shuffledAfter504 = false;

        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
            throwIfOsmAborted(epochAtStart);

            const endpoint = endpointPlan[attempt % endpointPlan.length];
            const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
            if (controller) activeAbortControllers.add(controller);
            const timer = controller
                ? setTimeout(() => controller.abort(), timeoutMs)
                : null;

            try {
                if (attempt > 0) {
                    console.info(`[OSM] Retry ${attempt + 1}/${maxAttempts} → ${endpoint}`);
                }
                const producers = await requestOverpass(endpoint, query, controller?.signal);
                throwIfOsmAborted(epochAtStart);
                writeOsmCache(latitude, longitude, radius, producers);
                return producers;
            } catch (error) {
                throwIfOsmAborted(epochAtStart);
                if (isOsmAbortError(error)) {
                    throw error;
                }
                const aborted = error?.name === 'AbortError';
                const status = aborted ? 0 : error?.status;
                const message = aborted
                    ? 'Overpass timeout'
                    : String(error?.message || error);
                errors.push(`${endpoint}: ${message}`);

                const retryable = aborted || !status || RETRYABLE_STATUS.has(status);
                if (!retryable || attempt >= maxAttempts - 1) {
                    break;
                }

                // Po 504 (lub timeout) – przetasuj pozostałe lustra (raz)
                if (!shuffledAfter504 && (status === 504 || aborted)) {
                    const tried = new Set(endpointPlan.slice(0, attempt + 1));
                    const remaining = shuffleUrls(
                        OVERPASS_ENDPOINTS.filter((url) => !tried.has(url))
                    );
                    endpointPlan = [...endpointPlan.slice(0, attempt + 1), ...remaining];
                    shuffledAfter504 = true;
                    console.info('[OSM] 504/timeout – losowa kolejność luster Overpass');
                }

                // Coraz dłuższa przerwa między mirrorami (2s, 3s, 4s…)
                await delay(2000 + attempt * 1000);
            } finally {
                if (timer) clearTimeout(timer);
                if (controller) activeAbortControllers.delete(controller);
            }
        }

        throwIfOsmAborted(epochAtStart);

        // Po wyczerpaniu retry – cache localStorage (także stale), tylko gdy request nie anulowany
        const cached = readOsmCache({ allowStale: true });
        if (cached?.producers?.length) {
            throwIfOsmAborted(epochAtStart);
            const near = isCacheNearLocation(
                cached.lat,
                cached.lng,
                latitude,
                longitude,
                Math.max(50, radius / 1000)
            );
            if (near || cached.producers.length > 0) {
                console.warn(
                    '[OSM] Overpass niedostępne (504/timeout) – używam cache localStorage.',
                    errors[errors.length - 1] || ''
                );
                return cached.producers;
            }
        }

        throw new Error(errors[errors.length - 1] || 'Overpass request failed');
    })().finally(() => {
        if (inflightOsmRequests.get(requestKey) === requestPromise) {
            inflightOsmRequests.delete(requestKey);
        }
    });

    inflightOsmRequests.set(requestKey, requestPromise);
    return requestPromise;
}

export { DEFAULT_RADIUS_M };
