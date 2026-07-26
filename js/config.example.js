// ============================================================
// js/config.example.js – SZABLON KONFIGURACJI
// Skopiuj jako js/config.js i uzupełnij własne klucze API.
// ============================================================

export const APP_NAME = 'Regionaler Geschmack';
export const APP_VERSION = '1.0.0';
export const APP_BUILD = '2026.07';

export const CONTACT_EMAIL = 'krispolik6@gmail.com';
export const CONTACT_ADDRESS = 'Polikarski Krzysztof, Germany';
export const APP_DOWNLOAD_URL = 'https://your-app-url.example';

/** Google Analytics 4 – podmień na Measurement ID (np. G-ABC123XYZ) */
export const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

export const Z_INDEX = {
    map: 100,
    mapControls: 200,
    mapProgress: 210,
    adBanner: 890,
    footer: 895,
    bottomNav: 900,
    header: 1000,
    headerDropdown: 1010,
    search: 1100,
    sidebar: 1200,
    sideMenuOverlay: 1250,
    sideMenu: 1251,
    filters: 1300,
    detail: 1400,
    premium: 1500,
    dashboard: 1550,
    lightbox: 1600,
    ftueHint: 1690,
    ftue: 1700,
    cookieBanner: 1760,
    toast: 1800,
    offlineBar: 1850,
    loading: 1900,
    skipLink: 2000
};

export const SUPABASE_CONFIG = {
    url: 'https://YOUR_PROJECT.supabase.co',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
};

export const FIREBASE_DEMO_MODE = true;

export const FIREBASE_CONFIG = {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
};

/** PayPal wyłączony – dochód wyłącznie z AdSense */
export const PAYPAL_ME_PRODUCER_URL = '';
export const PAYPAL_ME_USER_URL = '';
export const PAYMENTS_ENABLED = false;

export const PAYPAL_CONFIG = {
    mode: 'sandbox',
    clientId: '',
    planId: '',
    merchantEmail: CONTACT_EMAIL,
    currency: 'EUR'
};

/** Google AdSense – jedyne źródło dochodu (baner Home 90px) */
export const ADSENSE_CONFIG = {
    enabled: true,
    clientId: '', // ca-pub-xxxxxxxxxxxxxxxx
    slotBanner: '', // slot banera Home 90px
    slotInline: '',
    showPlaceholder: true
};

export const CONFIG = {
    // Mapa – centrum startowe z GPS (rg_last_position), bez stałej lokalizacji
    DEFAULT_ZOOM: 13,
    MAX_ZOOM: 19,
    MIN_ZOOM: 3,

    OSM_TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    OSM_ATTRIBUTION: '© OpenStreetMap contributors',

    OVERPASS_URL: 'https://overpass-api.de/api/interpreter',
    OVERPASS_MIRROR_URLS: [
        'https://overpass.kumi.systems/api/interpreter',
        'https://overpass.openstreetmap.fr/api/interpreter',
        'https://overpass.osm.rambler.ru/cgi/interpreter',
        'https://overpass.nchc.org.tw/api/interpreter'
    ],
    OVERPASS_TIMEOUT: 60000,
    OVERPASS_QUERY_TIMEOUT: 60,
    OVERPASS_RETRIES: 5,
    NOMINATIM_URL: 'https://nominatim.openstreetmap.org/search',

    /** GovData WFS – false wyłącza zapytania (OSM jako jedyne źródło). CKAN nie ma CORS. */
    ENABLE_GOVDATA: true,

    REQUEST_IDS: {
        OVERPASS: 'osm-overpass',
        NOMINATIM: 'osm-nominatim',
        NOMINATIM_REVERSE: 'osm-nominatim-reverse',
        PRODUCT_API: 'product-api',
        OFF_SEARCH: 'off-search'
    },

    defaultRadius: 5,
    maxRadius: 50,
    minRadius: 1,
    DEFAULT_RADIUS: 5,
    MAX_RADIUS: 50,
    MIN_RADIUS: 1,

    cacheTTL: 86400000,
    maxCacheSize: 50,
    CACHE_TTL: 86400000,
    MAX_CACHE_SIZE: 50,

    fetchTimeout: 30000,
    FETCH_TIMEOUT: 30000,

    filterDebounce: 200,
    scrollThrottle: 100,
    FILTER_DEBOUNCE: 200,
    SCROLL_THROTTLE: 100,
    SEARCH_DEBOUNCE: 500,

    version: APP_VERSION,
    build: APP_BUILD,
    VERSION: APP_VERSION,

    ANIMATION_FAST: 200,
    ANIMATION_MEDIUM: 250,
    ANIMATION_DURATION: 300,

    FTUE_MAP_HINT_MS: 3000,

    adsEnabled: true,
    TOAST_DURATION: 1800,

    /** Google Analytics 4 */
    GA_MEASUREMENT_ID,

    // Powiadomienia push (web push)
    PUSH_VAPID_PUBLIC_KEY: '',
    PUSH_POLL_INTERVAL_MS: 5 * 60 * 1000,

    /** Demo w koszyku – wyłączone (tylko prawdziwe dane) */
    DEMO_CART_ENABLED: false
};

export const PUSH_VAPID_PUBLIC_KEY = CONFIG.PUSH_VAPID_PUBLIC_KEY;
export const PUSH_POLL_INTERVAL_MS = CONFIG.PUSH_POLL_INTERVAL_MS;
