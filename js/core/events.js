// js/core/events.js – stałe zdarzeń aplikacji

export const EVENTS = Object.freeze({
    // Aplikacja
    APP_INIT: 'app:init',
    APP_READY: 'app:ready',
    APP_ERROR: 'app:error',

    // Nawigacja
    NAVIGATE: 'navigate',
    VIEW_CHANGED: 'view:changed',

    // Lokalizacja
    LOCATION_REQUESTED: 'location:requested',
    LOCATION_UPDATED: 'location:updated',
    LOCATION_CHANGED: 'location:changed',
    LOCATION_ERROR: 'location:error',
    NEARBY_SEARCH: 'nearby:search',

    // Kategorie
    CATEGORY_SELECTED: 'category:selected',

    // Mapa
    MAP_READY: 'map:ready',
    MAP_LOADED: 'map:loaded',
    MAP_MOVED: 'map:moved',
    MAP_ZOOM_CHANGED: 'map:zoom:changed',
    MAP_CLICKED: 'map:clicked',
    MAP_MARKER_CLICKED: 'map:marker:clicked',
    MAP_ERROR: 'map:error',
    MARKERS_ADDED: 'markers:added',

    // Dane / miejsca
    PLACES_LOADED: 'places:loaded',
    PLACES_CHANGED: 'places:changed',
    PLACES_FILTERED: 'places:filtered',

    // Ulubione
    FAVORITES_CHANGED: 'favorites:changed',
    FAVORITE_ADDED: 'favorite:added',
    FAVORITE_REMOVED: 'favorite:removed',

    // Koszyk
    CART_CHANGED: 'cart:changed',
    CART_ADDED: 'cart:added',
    CART_REMOVED: 'cart:removed',
    CART_UPDATED: 'cart:updated',

    // Filtry
    FILTERS_APPLY: 'filters:apply',
    FILTERS_RESET: 'filters:reset',
    FILTER_RADIUS_CHANGED: 'filters:radius:changed',

    // Szczegóły
    SHOW_DETAIL: 'detail:show',
    HIDE_DETAIL: 'detail:hide',

    // UI
    TOAST_SHOW: 'toast:show',
    TOAST_HIDE: 'toast:hide',
    /** Ambient natury – brak sieci / oba źródła niedostępne */
    AMBIENT_UNAVAILABLE: 'ambient:unavailable',
    LOADING_SHOW: 'loading:show',
    LOADING_HIDE: 'loading:hide',
    LOADING_CHANGED: 'loading:changed',
    PROGRESS_UPDATE: 'progress:update',
    UI_READY: 'ui:ready',
    THEME_CHANGED: 'theme:changed',
    LANGUAGE_CHANGED: 'language:changed',
    /** Tłumaczenie dynamiczne w tle (cache zaktualizowany) — bez UI */
    DYNAMIC_TRANSLATIONS_UPDATED: 'i18n:dynamic-updated',

    // Storage
    STORE_RESET: 'store:reset',
    CACHE_UPDATED: 'cache:updated',

    // Premium
    OPEN_PREMIUM: 'premium:open',
    PREMIUM_ACTIVATED: 'premium:activated',
    PREMIUM_EXPIRED: 'premium:expired',
    PREMIUM_SUBSCRIBE_APPROVED: 'premium:subscribe:approved',
    DONATION_COMPLETED: 'donation:completed',

    // Auth / biznes
    AUTH_CHANGED: 'auth:changed',
    BUSINESS_DATA_CHANGED: 'business:data:changed',

    // Supabase
    SUPABASE_INIT: 'supabase:init',
    SUPABASE_READY: 'supabase:ready',
    SUPABASE_ERROR: 'supabase:error',

    // Open Food Facts / wyszukiwanie
    SEARCH_PRODUCTS: 'food:search:products',
    PRODUCTS_FOUND: 'food:products:found',
    GET_PRODUCT: 'food:get:product',
    PRODUCT_LOADED: 'food:product:loaded',
    LOCAL_PRODUCTS: 'food:local:products',

    // OSM
    OSM_PROGRESS: 'osm:progress',

    // Recenzje
    REVIEW_SUBMITTED: 'review:submitted',
    REVIEWS_CHANGED: 'reviews:changed',

    // Rezerwacje (ETAP 8)
    RESERVATIONS_CHANGED: 'reservations:changed',

    // Menu
    MENU_OPEN_TAB: 'menu:open:tab',

    // Waluta / liczniki
    CURRENCY_CHANGED: 'currency:changed',
    COUNTERS_UPDATED: 'counters:updated'
});

/** @deprecated Użyj EVENTS */
export const Events = EVENTS;
