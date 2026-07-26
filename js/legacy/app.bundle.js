var RGApp = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __pow = Math.pow;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // js/config.js
  var APP_NAME = "Regionaler Geschmack";
  var APP_VERSION = "1.0.0";
  var APP_BUILD = "2026.07";
  var CONTACT_EMAIL = "krispolik6@gmail.com";
  var APP_DOWNLOAD_URL = "https://admirable-cascaron-c76940.netlify.app";
  var GA_MEASUREMENT_ID = "G-XXXXXXXXXX";
  var Z_INDEX = {
    map: 100,
    mapControls: 200,
    mapProgress: 210,
    adBanner: 890,
    footer: 895,
    bottomNav: 900,
    header: 1e3,
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
    skipLink: 2e3
  };
  var CONFIG = {
    // Mapa – centrum startowe z GPS (rg_last_position), bez stałej lokalizacji
    DEFAULT_ZOOM: 13,
    MAX_ZOOM: 19,
    MIN_ZOOM: 3,
    OSM_TILE_URL: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    OSM_ATTRIBUTION: "\xA9 OpenStreetMap contributors",
    OVERPASS_URL: "https://overpass-api.de/api/interpreter",
    OVERPASS_MIRROR_URLS: ["https://overpass.kumi.systems/api/interpreter"],
    OVERPASS_TIMEOUT: 6e4,
    OVERPASS_QUERY_TIMEOUT: 60,
    OVERPASS_RETRIES: 3,
    NOMINATIM_URL: "https://nominatim.openstreetmap.org/search",
    /** GovData (WFS Open.NRW). CKAN bez CORS – używamy tylko WFS. Ustaw false, by wyłączyć całkowicie. */
    ENABLE_GOVDATA: true,
    REQUEST_IDS: {
      OVERPASS: "osm-overpass",
      NOMINATIM: "osm-nominatim",
      NOMINATIM_REVERSE: "osm-nominatim-reverse",
      PRODUCT_API: "product-api",
      OFF_SEARCH: "off-search"
    },
    // Zasięg
    defaultRadius: 5,
    maxRadius: 50,
    minRadius: 1,
    DEFAULT_RADIUS: 5,
    MAX_RADIUS: 50,
    MIN_RADIUS: 1,
    // Cache
    cacheTTL: 864e5,
    maxCacheSize: 50,
    CACHE_TTL: 864e5,
    MAX_CACHE_SIZE: 50,
    // Timeout
    fetchTimeout: 3e4,
    FETCH_TIMEOUT: 3e4,
    // Filtry / wyszukiwanie
    filterDebounce: 200,
    scrollThrottle: 100,
    FILTER_DEBOUNCE: 200,
    SCROLL_THROTTLE: 100,
    SEARCH_DEBOUNCE: 500,
    // Wersja
    version: APP_VERSION,
    build: APP_BUILD,
    VERSION: APP_VERSION,
    // Animacje (ms)
    ANIMATION_FAST: 200,
    ANIMATION_MEDIUM: 250,
    ANIMATION_DURATION: 300,
    // FTUE
    FTUE_MAP_HINT_MS: 3e3,
    // Reklamy
    adsEnabled: false,
    DEMO_CART_ENABLED: false,
    /** Google Analytics 4 – podmień placeholder na prawdziwe Measurement ID */
    GA_MEASUREMENT_ID: "G-XXXXXXXXXX",
    // Powiadomienia push (web push)
    PUSH_VAPID_PUBLIC_KEY: "BL_grIk9oDY01n7lo3os6LgIzU_-DfHoDfzhFqmd44rrSn3mkiMhqlniNN7Wh2Oh0ORCRJ19eGNDyWCJi5gT7Cc",
    PUSH_POLL_INTERVAL_MS: 5 * 60 * 1e3,
    TOAST_DURATION: 1800
  };
  var PUSH_VAPID_PUBLIC_KEY = CONFIG.PUSH_VAPID_PUBLIC_KEY;
  var PUSH_POLL_INTERVAL_MS = CONFIG.PUSH_POLL_INTERVAL_MS;

  // js/translations-asian.js
  function ui(nav, home, categories, extra = {}) {
    return __spreadValues({ nav, home, categories }, extra);
  }
  var ASIAN_LANG_OPTIONS = Object.freeze([
    { code: "zh", flag: "\u{1F1E8}\u{1F1F3}", label: "\u7B80\u4F53\u4E2D\u6587", short: "ZH" },
    { code: "zh-tw", flag: "\u{1F1F9}\u{1F1FC}", label: "\u7E41\u9AD4\u4E2D\u6587", short: "ZH-TW" },
    { code: "ja", flag: "\u{1F1EF}\u{1F1F5}", label: "\u65E5\u672C\u8A9E", short: "JA" },
    { code: "ko", flag: "\u{1F1F0}\u{1F1F7}", label: "\uD55C\uAD6D\uC5B4", short: "KO" },
    { code: "vi", flag: "\u{1F1FB}\u{1F1F3}", label: "Ti\u1EBFng Vi\u1EC7t", short: "VI" },
    { code: "ms", flag: "\u{1F1F2}\u{1F1FE}", label: "Bahasa Melayu", short: "MS" },
    { code: "id", flag: "\u{1F1EE}\u{1F1E9}", label: "Bahasa Indonesia", short: "ID" },
    { code: "th", flag: "\u{1F1F9}\u{1F1ED}", label: "\u0E20\u0E32\u0E29\u0E32\u0E44\u0E17\u0E22", short: "TH" },
    { code: "hi", flag: "\u{1F1EE}\u{1F1F3}", label: "\u0939\u093F\u0928\u094D\u0926\u0940", short: "HI" }
  ]);
  var ZH = ui(
    { home: "\u9996\u9875", map: "\u5730\u56FE", premium: "\u9AD8\u7EA7\u7248", favorites: "\u6536\u85CF", cart: "\u8D2D\u7269\u8F66", profile: "\u4E2A\u4EBA\u8D44\u6599" },
    {
      heroTitle: "\u652F\u6301\u672C\u5730\u3002<br>\u6709\u610F\u8BC6\u996E\u98DF\u3002<br>\u66F4\u597D\u751F\u6D3B\u3002",
      heroTagline: "\u{1F30D} \u53D1\u73B0\u60A8\u9644\u8FD1\u7684\u533A\u57DF\u751F\u4EA7\u5546",
      getLocation: "\u83B7\u53D6\u4F4D\u7F6E",
      findNearby: "\u67E5\u627E\u9644\u8FD1",
      recommendedTitle: "\u2B50 \u63A8\u8350\u519C\u6237",
      recommendedPlaceholder: "\u5373\u5C06\u63A8\u51FA\uFF1A\u7CBE\u9009\u63A8\u8350",
      footerCopyright: "\xA9 2026 Regionaler Geschmack",
      searchPlaceholder: "\u641C\u7D22\u4EA7\u54C1\u3001\u9910\u5385\u3001\u5546\u5E97\u6216\u751F\u4EA7\u5546...",
      hubLabel: "\u641C\u7D22\u4E0E\u5FEB\u6377\u5165\u53E3",
      chipsLabel: "\u5FEB\u6377\u7B5B\u9009",
      chip: { products: "\u4EA7\u54C1", restaurants: "\u9910\u5385", shops: "\u5546\u5E97", farmers: "\u519C\u6C11", favorites: "\u6536\u85CF" }
    },
    {
      all: { name: "\u5168\u90E8", desc: "\u6240\u6709\u7C7B\u522B" },
      restaurants: { name: "\u9910\u5385", desc: "\u5730\u65B9\u7279\u8272\u83DC" },
      farmers: { name: "\u519C\u6C11", desc: "\u65B0\u9C9C\u519C\u4EA7\u54C1" },
      bakeries: { name: "\u9762\u5305\u5E97", desc: "\u65B0\u9C9C\u70D8\u7119\u98DF\u54C1" },
      meat: { name: "\u8089\u7C7B/\u8089\u5E97", desc: "\u5730\u65B9\u9999\u80A0\u4E0E\u8089\u5236\u54C1" },
      shops: { name: "\u5546\u5E97", desc: "\u672C\u5730\u4EA7\u54C1" },
      vending: { name: "\u81EA\u52A8\u552E\u8D27\u673A", desc: "24\u5C0F\u65F6" },
      favorites: { name: "\u6536\u85CF", desc: "\u5DF2\u4FDD\u5B58\u5730\u70B9" }
    },
    {
      a11y: { darkMode: "\u6DF1\u8272\u6A21\u5F0F", lightMode: "\u6D45\u8272\u6A21\u5F0F", chooseLanguage: "\u9009\u62E9\u8BED\u8A00", menu: "\u83DC\u5355", premium: "\u9AD8\u7EA7\u7248", map: "\u5730\u56FE", searchRadius: "\u641C\u7D22\u534A\u5F84\uFF08\u516C\u91CC\uFF09" },
      map: { gps: "GPS", osm: "OSM", loadError: "\u65E0\u6CD5\u52A0\u8F7D\u5730\u56FE\u3002" },
      btn: { details: "\u8BE6\u60C5", favorite: "\u6536\u85CF", favoriteSaved: "\u5DF2\u6536\u85CF", addToCart: "\u52A0\u5165\u8D2D\u7269\u8F66", addedToCart: "\u5DF2\u6DFB\u52A0", navigate: "\u5BFC\u822A", close: "\u5173\u95ED", back: "\u8FD4\u56DE", remove: "\u79FB\u9664", more: "\u66F4\u591A", less: "\u66F4\u5C11", login: "\u767B\u5F55", toMap: "\u524D\u5F80\u5730\u56FE", discover: "\u53D1\u73B0\u4EA7\u54C1", checkout: "\u7ED3\u8D26", clearCart: "\u6E05\u7A7A\u8D2D\u7269\u8F66" },
      favorites: { title: "\u6536\u85CF", subtitle: "\u60A8\u4FDD\u5B58\u7684\u5730\u70B9\u548C\u751F\u4EA7\u5546", empty: "\u6682\u65E0\u6536\u85CF", emptySub: "\u5728\u5730\u56FE\u4E0A\u5C06\u751F\u4EA7\u5546\u6807\u8BB0\u4E3A\u6536\u85CF\u3002" },
      cart: { title: "\u8D2D\u7269\u8F66", subtitle: "\u60A8\u5728\u533A\u57DF\u4F9B\u5E94\u5546\u5904\u7684\u8D2D\u7269", empty: "\u8D2D\u7269\u8F66\u4E3A\u7A7A", emptySub: "\u4ECE\u60A8\u559C\u7231\u7684\u5730\u65B9\u6DFB\u52A0\u4EA7\u54C1\u3002", total: "\u5408\u8BA1", product: "\u4EA7\u54C1" },
      profile: { title: "\u4E2A\u4EBA\u8D44\u6599", subtitle: "\u60A8\u7684\u8BBE\u7F6E", guest: "\u8BBF\u5BA2", guestSub: "\u767B\u5F55\u4EE5\u4FDD\u5B58\u6536\u85CF\u5E76\u8DDF\u8E2A\u8BA2\u5355\u3002", darkMode: "\u6DF1\u8272\u6A21\u5F0F", notifications: "\u901A\u77E5", language: "\u8BED\u8A00" },
      msg: { loading: "\u52A0\u8F7D\u4E2D...", noProducts: "\u6682\u65E0\u53EF\u7528\u4EA7\u54C1\u3002", checkoutSoon: "\u7ED3\u8D26 \u2013 \u5373\u5C06\u63A8\u51FA", loginSoon: "\u767B\u5F55 \u2013 \u5373\u5C06\u63A8\u51FA", menuSoon: "\u83DC\u5355 \u2013 \u5373\u5C06\u63A8\u51FA", premiumSoon: "\u9AD8\u7EA7\u7248 \u2013 \u5373\u5C06\u63A8\u51FA", locationDenied: "\u4F4D\u7F6E\u8BBF\u95EE\u88AB\u62D2\u7EDD\u3002", locationUnavailable: "\u65E0\u6CD5\u786E\u5B9A\u60A8\u7684\u4F4D\u7F6E\u3002", addedToFavorites: "\u5DF2\u6DFB\u52A0\u5230\u6536\u85CF", removedFromFavorites: "\u5DF2\u4ECE\u6536\u85CF\u79FB\u9664", viewError: "\u65E0\u6CD5\u52A0\u8F7D\u6B64\u89C6\u56FE\u3002", error: "\u9519\u8BEF" },
      search: { noResults: "\u6B64\u641C\u7D22\u65E0\u7ED3\u679C\u3002" },
      producer: {
        openUntil: "\u8425\u4E1A\u81F3 {time}",
        distance: "{distance} \u7C73",
        types: { farmer: "\u519C\u6237", bakery: "\u9762\u5305\u5E97", restaurant: "\u9910\u5385", meat: "\u8089\u5E97", shop: "\u8D85\u5E02", vending: "\u81EA\u52A8\u552E\u8D27\u673A", honey: "\u517B\u8702\u573A", dairy: "\u4E73\u5236\u54C1", fruit: "\u6C34\u679C", vegetables: "\u852C\u83DC", forest: "\u6797\u4EA7\u54C1", other: "\u4F9B\u5E94\u5546" }
      },
      productDefault: "\u533A\u57DF\u4EA7\u54C1"
    }
  );
  var ZH_TW = ui(
    { home: "\u9996\u9801", map: "\u5730\u5716", favorites: "\u6536\u85CF", cart: "\u8CFC\u7269\u8ECA", profile: "\u500B\u4EBA\u8CC7\u6599" },
    {
      heroTitle: "\u652F\u6301\u672C\u5730\u3002<br>\u6709\u610F\u8B58\u98F2\u98DF\u3002<br>\u66F4\u597D\u751F\u6D3B\u3002",
      heroTagline: "\u{1F30D} \u767C\u73FE\u60A8\u9644\u8FD1\u7684\u5340\u57DF\u751F\u7522\u5546",
      getLocation: "\u7372\u53D6\u4F4D\u7F6E",
      findNearby: "\u67E5\u627E\u9644\u8FD1",
      recommendedTitle: "\u2B50 \u63A8\u85A6\u8FB2\u6236",
      recommendedPlaceholder: "\u5373\u5C07\u63A8\u51FA\uFF1A\u7CBE\u9078\u63A8\u85A6",
      footerCopyright: "\xA9 2026 Regionaler Geschmack",
      searchPlaceholder: "\u641C\u5C0B\u7522\u54C1\u3001\u9910\u5EF3\u3001\u5546\u5E97\u6216\u751F\u7522\u5546...",
      hubLabel: "\u641C\u5C0B\u8207\u5FEB\u6377\u5165\u53E3",
      chipsLabel: "\u5FEB\u6377\u7BE9\u9078",
      chip: { products: "\u7522\u54C1", restaurants: "\u9910\u5EF3", shops: "\u5546\u5E97", farmers: "\u8FB2\u6C11", favorites: "\u6536\u85CF" }
    },
    {
      all: { name: "\u5168\u90E8", desc: "\u6240\u6709\u985E\u5225" },
      restaurants: { name: "\u9910\u5EF3", desc: "\u5730\u65B9\u7279\u8272\u83DC" },
      farmers: { name: "\u8FB2\u6C11", desc: "\u65B0\u9BAE\u8FB2\u7522\u54C1" },
      bakeries: { name: "\u9EB5\u5305\u5E97", desc: "\u65B0\u9BAE\u70D8\u7119\u98DF\u54C1" },
      meat: { name: "\u8089\u985E/\u8089\u5E97", desc: "\u5730\u65B9\u9999\u8178\u8207\u8089\u88FD\u54C1" },
      shops: { name: "\u5546\u5E97", desc: "\u672C\u5730\u7522\u54C1" },
      vending: { name: "\u81EA\u52D5\u8CA9\u8CE3\u6A5F", desc: "24\u5C0F\u6642" },
      favorites: { name: "\u6536\u85CF", desc: "\u5DF2\u5132\u5B58\u5730\u9EDE" }
    },
    {
      a11y: { darkMode: "\u6DF1\u8272\u6A21\u5F0F", lightMode: "\u6DFA\u8272\u6A21\u5F0F", chooseLanguage: "\u9078\u64C7\u8A9E\u8A00", menu: "\u9078\u55AE", premium: "\u9032\u968E\u7248", map: "\u5730\u5716", searchRadius: "\u641C\u5C0B\u534A\u5F91\uFF08\u516C\u91CC\uFF09" },
      map: { gps: "GPS", osm: "OSM", loadError: "\u7121\u6CD5\u8F09\u5165\u5730\u5716\u3002" },
      btn: { details: "\u8A73\u60C5", favorite: "\u6536\u85CF", favoriteSaved: "\u5DF2\u6536\u85CF", addToCart: "\u52A0\u5165\u8CFC\u7269\u8ECA", addedToCart: "\u5DF2\u65B0\u589E", navigate: "\u5C0E\u822A", close: "\u95DC\u9589", remove: "\u79FB\u9664", more: "\u66F4\u591A", less: "\u66F4\u5C11", login: "\u767B\u5165", toMap: "\u524D\u5F80\u5730\u5716", discover: "\u767C\u73FE\u7522\u54C1", checkout: "\u7D50\u5E33", clearCart: "\u6E05\u7A7A\u8CFC\u7269\u8ECA" },
      favorites: { title: "\u6536\u85CF", subtitle: "\u60A8\u5132\u5B58\u7684\u5730\u9EDE\u548C\u751F\u7522\u5546", empty: "\u66AB\u7121\u6536\u85CF", emptySub: "\u5728\u5730\u5716\u4E0A\u5C07\u751F\u7522\u5546\u6A19\u8A18\u70BA\u6536\u85CF\u3002" },
      cart: { title: "\u8CFC\u7269\u8ECA", subtitle: "\u60A8\u5728\u5340\u57DF\u4F9B\u61C9\u5546\u7684\u8CFC\u7269", empty: "\u8CFC\u7269\u8ECA\u70BA\u7A7A", emptySub: "\u5F9E\u60A8\u559C\u611B\u7684\u5730\u65B9\u65B0\u589E\u7522\u54C1\u3002", total: "\u5408\u8A08", product: "\u7522\u54C1" },
      profile: { title: "\u500B\u4EBA\u8CC7\u6599", subtitle: "\u60A8\u7684\u8A2D\u5B9A", guest: "\u8A2A\u5BA2", guestSub: "\u767B\u5165\u4EE5\u5132\u5B58\u6536\u85CF\u4E26\u8FFD\u8E64\u8A02\u55AE\u3002", darkMode: "\u6DF1\u8272\u6A21\u5F0F", notifications: "\u901A\u77E5", language: "\u8A9E\u8A00" },
      msg: { loading: "\u8F09\u5165\u4E2D...", noProducts: "\u66AB\u7121\u53EF\u7528\u7522\u54C1\u3002", checkoutSoon: "\u7D50\u5E33 \u2013 \u5373\u5C07\u63A8\u51FA", loginSoon: "\u767B\u5165 \u2013 \u5373\u5C07\u63A8\u51FA", menuSoon: "\u9078\u55AE \u2013 \u5373\u5C07\u63A8\u51FA", premiumSoon: "\u9032\u968E\u7248 \u2013 \u5373\u5C07\u63A8\u51FA", locationDenied: "\u4F4D\u7F6E\u5B58\u53D6\u88AB\u62D2\u7D55\u3002", locationUnavailable: "\u7121\u6CD5\u78BA\u5B9A\u60A8\u7684\u4F4D\u7F6E\u3002", addedToFavorites: "\u5DF2\u65B0\u589E\u5230\u6536\u85CF", removedFromFavorites: "\u5DF2\u5F9E\u6536\u85CF\u79FB\u9664", viewError: "\u7121\u6CD5\u8F09\u5165\u6B64\u6AA2\u8996\u3002", error: "\u932F\u8AA4" },
      search: { noResults: "\u6B64\u641C\u5C0B\u7121\u7D50\u679C\u3002" },
      producer: {
        openUntil: "\u71DF\u696D\u81F3 {time}",
        distance: "{distance} \u516C\u5C3A",
        types: { farmer: "\u8FB2\u6236", bakery: "\u9EB5\u5305\u5E97", restaurant: "\u9910\u5EF3", meat: "\u8089\u5E97", shop: "\u8D85\u5E02", vending: "\u81EA\u52D5\u8CA9\u8CE3\u6A5F", honey: "\u990A\u8702\u5834", dairy: "\u4E73\u88FD\u54C1", fruit: "\u6C34\u679C", vegetables: "\u852C\u83DC", forest: "\u6797\u7522\u54C1", other: "\u4F9B\u61C9\u5546" }
      },
      productDefault: "\u5340\u57DF\u7522\u54C1"
    }
  );
  var JA = ui(
    { home: "\u30DB\u30FC\u30E0", map: "\u5730\u56F3", favorites: "\u304A\u6C17\u306B\u5165\u308A", cart: "\u30AB\u30FC\u30C8", profile: "\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB" },
    {
      heroTitle: "\u5730\u5143\u3092\u652F\u63F4\u3002<br>\u610F\u8B58\u3057\u3066\u98DF\u3079\u308B\u3002<br>\u3088\u308A\u826F\u304F\u66AE\u3089\u3059\u3002",
      heroTagline: "\u{1F30D} \u8FD1\u304F\u306E\u5730\u57DF\u751F\u7523\u8005\u3092\u767A\u898B",
      getLocation: "\u4F4D\u7F6E\u60C5\u5831\u3092\u53D6\u5F97",
      findNearby: "\u8FD1\u304F\u3092\u63A2\u3059",
      recommendedTitle: "\u2B50 \u304A\u3059\u3059\u3081\u306E\u8FB2\u5BB6",
      recommendedPlaceholder: "\u8FD1\u65E5\u516C\u958B\uFF1A\u304A\u3059\u3059\u3081\u306E\u8FB2\u5BB6",
      footerCopyright: "\xA9 2026 Regionaler Geschmack",
      searchPlaceholder: "\u88FD\u54C1\u3001\u30EC\u30B9\u30C8\u30E9\u30F3\u3001\u5E97\u8217\u3001\u751F\u7523\u8005\u3092\u691C\u7D22...",
      hubLabel: "\u691C\u7D22\u3068\u30AF\u30A4\u30C3\u30AF\u30A2\u30AF\u30BB\u30B9",
      chipsLabel: "\u30AF\u30A4\u30C3\u30AF\u30D5\u30A3\u30EB\u30BF\u30FC",
      chip: { products: "\u88FD\u54C1", restaurants: "\u30EC\u30B9\u30C8\u30E9\u30F3", shops: "\u5E97\u8217", farmers: "\u8FB2\u5BB6", favorites: "\u304A\u6C17\u306B\u5165\u308A" }
    },
    {
      all: { name: "\u3059\u3079\u3066", desc: "\u3059\u3079\u3066\u306E\u30AB\u30C6\u30B4\u30EA" },
      restaurants: { name: "\u30EC\u30B9\u30C8\u30E9\u30F3", desc: "\u90F7\u571F\u6599\u7406" },
      farmers: { name: "\u8FB2\u5BB6", desc: "\u65B0\u9BAE\u306A\u8FB2\u7523\u7269" },
      bakeries: { name: "\u30D1\u30F3\u5C4B", desc: "\u713C\u304D\u305F\u3066\u306E\u30D1\u30F3" },
      meat: { name: "\u8089/\u7CBE\u8089\u5E97", desc: "\u5730\u57DF\u306E\u30BD\u30FC\u30BB\u30FC\u30B8" },
      shops: { name: "\u5E97\u8217", desc: "\u5730\u5143\u306E\u88FD\u54C1" },
      vending: { name: "\u81EA\u52D5\u8CA9\u58F2\u6A5F", desc: "24\u6642\u9593" },
      favorites: { name: "\u304A\u6C17\u306B\u5165\u308A", desc: "\u4FDD\u5B58\u3057\u305F\u5834\u6240" }
    },
    {
      a11y: { darkMode: "\u30C0\u30FC\u30AF\u30E2\u30FC\u30C9", lightMode: "\u30E9\u30A4\u30C8\u30E2\u30FC\u30C9", chooseLanguage: "\u8A00\u8A9E\u3092\u9078\u629E", menu: "\u30E1\u30CB\u30E5\u30FC", premium: "\u30D7\u30EC\u30DF\u30A2\u30E0", map: "\u5730\u56F3", searchRadius: "\u691C\u7D22\u534A\u5F84\uFF08km\uFF09" },
      map: { gps: "GPS", osm: "OSM", loadError: "\u5730\u56F3\u3092\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3067\u3057\u305F\u3002" },
      btn: { details: "\u8A73\u7D30", favorite: "\u304A\u6C17\u306B\u5165\u308A", favoriteSaved: "\u4FDD\u5B58\u6E08\u307F", addToCart: "\u30AB\u30FC\u30C8\u306B\u8FFD\u52A0", addedToCart: "\u8FFD\u52A0\u3057\u307E\u3057\u305F", navigate: "\u30CA\u30D3\u30B2\u30FC\u30C8", close: "\u9589\u3058\u308B", remove: "\u524A\u9664", more: "\u3082\u3063\u3068", less: "\u6E1B\u3089\u3059", login: "\u30ED\u30B0\u30A4\u30F3", toMap: "\u5730\u56F3\u3078", discover: "\u88FD\u54C1\u3092\u63A2\u3059", checkout: "\u30EC\u30B8\u3078", clearCart: "\u30AB\u30FC\u30C8\u3092\u7A7A\u306B\u3059\u308B" },
      favorites: { title: "\u304A\u6C17\u306B\u5165\u308A", subtitle: "\u4FDD\u5B58\u3057\u305F\u5834\u6240\u3068\u751F\u7523\u8005", empty: "\u304A\u6C17\u306B\u5165\u308A\u306F\u3042\u308A\u307E\u305B\u3093", emptySub: "\u5730\u56F3\u3067\u751F\u7523\u8005\u3092\u304A\u6C17\u306B\u5165\u308A\u306B\u8FFD\u52A0\u3057\u3066\u304F\u3060\u3055\u3044\u3002" },
      cart: { title: "\u30AB\u30FC\u30C8", subtitle: "\u5730\u57DF\u306E\u63D0\u4F9B\u8005\u304B\u3089\u306E\u8CFC\u5165", empty: "\u30AB\u30FC\u30C8\u306F\u7A7A\u3067\u3059", emptySub: "\u304A\u6C17\u306B\u5165\u308A\u306E\u5834\u6240\u304B\u3089\u88FD\u54C1\u3092\u8FFD\u52A0\u3057\u3066\u304F\u3060\u3055\u3044\u3002", total: "\u5408\u8A08", product: "\u88FD\u54C1" },
      profile: { title: "\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB", subtitle: "\u8A2D\u5B9A", guest: "\u30B2\u30B9\u30C8", guestSub: "\u30ED\u30B0\u30A4\u30F3\u3057\u3066\u304A\u6C17\u306B\u5165\u308A\u3092\u4FDD\u5B58\u3057\u6CE8\u6587\u3092\u8FFD\u8DE1\u3002", darkMode: "\u30C0\u30FC\u30AF\u30E2\u30FC\u30C9", notifications: "\u901A\u77E5", language: "\u8A00\u8A9E" },
      msg: { loading: "\u8AAD\u307F\u8FBC\u307F\u4E2D...", noProducts: "\u5229\u7528\u53EF\u80FD\u306A\u88FD\u54C1\u304C\u3042\u308A\u307E\u305B\u3093\u3002", checkoutSoon: "\u30EC\u30B8 \u2013 \u8FD1\u65E5\u516C\u958B", loginSoon: "\u30ED\u30B0\u30A4\u30F3 \u2013 \u8FD1\u65E5\u516C\u958B", menuSoon: "\u30E1\u30CB\u30E5\u30FC \u2013 \u8FD1\u65E5\u516C\u958B", premiumSoon: "\u30D7\u30EC\u30DF\u30A2\u30E0 \u2013 \u8FD1\u65E5\u516C\u958B", locationDenied: "\u4F4D\u7F6E\u60C5\u5831\u3078\u306E\u30A2\u30AF\u30BB\u30B9\u304C\u62D2\u5426\u3055\u308C\u307E\u3057\u305F\u3002", locationUnavailable: "\u4F4D\u7F6E\u3092\u7279\u5B9A\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002", addedToFavorites: "\u304A\u6C17\u306B\u5165\u308A\u306B\u8FFD\u52A0\u3057\u307E\u3057\u305F", removedFromFavorites: "\u304A\u6C17\u306B\u5165\u308A\u304B\u3089\u524A\u9664\u3057\u307E\u3057\u305F", viewError: "\u30D3\u30E5\u30FC\u3092\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3067\u3057\u305F\u3002", error: "\u30A8\u30E9\u30FC" },
      search: { noResults: "\u3053\u306E\u691C\u7D22\u306E\u7D50\u679C\u306F\u3042\u308A\u307E\u305B\u3093\u3002" },
      producer: {
        openUntil: "{time}\u307E\u3067\u55B6\u696D",
        distance: "{distance} m",
        types: { farmer: "\u8FB2\u5BB6", bakery: "\u30D1\u30F3\u5C4B", restaurant: "\u30EC\u30B9\u30C8\u30E9\u30F3", meat: "\u7CBE\u8089\u5E97", shop: "\u30B9\u30FC\u30D1\u30FC", vending: "\u81EA\u52D5\u8CA9\u58F2\u6A5F", honey: "\u990A\u8702\u5834", dairy: "\u4E73\u88FD\u54C1", fruit: "\u679C\u7269", vegetables: "\u91CE\u83DC", forest: "\u6797\u7523\u7269", other: "\u63D0\u4F9B\u8005" }
      },
      productDefault: "\u5730\u57DF\u306E\u88FD\u54C1"
    }
  );
  var KO = ui(
    { home: "\uD648", map: "\uC9C0\uB3C4", favorites: "\uC990\uACA8\uCC3E\uAE30", cart: "\uC7A5\uBC14\uAD6C\uB2C8", profile: "\uD504\uB85C\uD544" },
    {
      heroTitle: "\uC9C0\uC5ED\uC744 \uC751\uC6D0\uD558\uC138\uC694.<br>\uC758\uC2DD\uC801\uC73C\uB85C \uBA39\uC73C\uC138\uC694.<br>\uB354 \uB098\uC740 \uC0B6.",
      heroTagline: "\u{1F30D} \uADFC\uCC98 \uC9C0\uC5ED \uC0DD\uC0B0\uC790\uB97C \uBC1C\uACAC\uD558\uC138\uC694",
      getLocation: "\uC704\uCE58 \uAC00\uC838\uC624\uAE30",
      findNearby: "\uC8FC\uBCC0 \uCC3E\uAE30",
      recommendedTitle: "\u2B50 \uCD94\uCC9C \uB18D\uBD80",
      recommendedPlaceholder: "\uACE7 \uC81C\uACF5: \uCD94\uCC9C \uB18D\uBD80",
      footerCopyright: "\xA9 2026 Regionaler Geschmack",
      searchPlaceholder: "\uC81C\uD488, \uB808\uC2A4\uD1A0\uB791, \uC0C1\uC810 \uB610\uB294 \uC0DD\uC0B0\uC790 \uAC80\uC0C9...",
      hubLabel: "\uAC80\uC0C9 \uBC0F \uBE60\uB978 \uC811\uADFC",
      chipsLabel: "\uBE60\uB978 \uD544\uD130",
      chip: { products: "\uC81C\uD488", restaurants: "\uB808\uC2A4\uD1A0\uB791", shops: "\uC0C1\uC810", farmers: "\uB18D\uBD80", favorites: "\uC990\uACA8\uCC3E\uAE30" }
    },
    {
      all: { name: "\uC804\uCCB4", desc: "\uBAA8\uB4E0 \uCE74\uD14C\uACE0\uB9AC" },
      restaurants: { name: "\uB808\uC2A4\uD1A0\uB791", desc: "\uC9C0\uC5ED \uC694\uB9AC" },
      farmers: { name: "\uB18D\uBD80", desc: "\uC2E0\uC120\uD55C \uB18D\uC0B0\uBB3C" },
      bakeries: { name: "\uBE75\uC9D1", desc: "\uAC13 \uAD6C\uC6B4 \uBE75" },
      meat: { name: "\uC721\uB958/\uC815\uC721\uC810", desc: "\uC9C0\uC5ED \uC18C\uC2DC\uC9C0" },
      shops: { name: "\uC0C1\uC810", desc: "\uC9C0\uC5ED \uC81C\uD488" },
      vending: { name: "\uC790\uD310\uAE30", desc: "24\uC2DC\uAC04" },
      favorites: { name: "\uC990\uACA8\uCC3E\uAE30", desc: "\uC800\uC7A5\uD55C \uC7A5\uC18C" }
    },
    {
      a11y: { darkMode: "\uB2E4\uD06C \uBAA8\uB4DC", lightMode: "\uB77C\uC774\uD2B8 \uBAA8\uB4DC", chooseLanguage: "\uC5B8\uC5B4 \uC120\uD0DD", menu: "\uBA54\uB274", premium: "\uD504\uB9AC\uBBF8\uC5C4", map: "\uC9C0\uB3C4", searchRadius: "\uAC80\uC0C9 \uBC18\uACBD(km)" },
      map: { gps: "GPS", osm: "OSM", loadError: "\uC9C0\uB3C4\uB97C \uBD88\uB7EC\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4." },
      btn: { details: "\uC0C1\uC138\uC815\uBCF4", favorite: "\uC990\uACA8\uCC3E\uAE30", favoriteSaved: "\uC800\uC7A5\uB428", addToCart: "\uC7A5\uBC14\uAD6C\uB2C8\uC5D0 \uB2F4\uAE30", addedToCart: "\uCD94\uAC00\uB428", navigate: "\uAE38\uCC3E\uAE30", close: "\uB2EB\uAE30", remove: "\uC0AD\uC81C", more: "\uB354\uBCF4\uAE30", less: "\uC904\uC774\uAE30", login: "\uB85C\uADF8\uC778", toMap: "\uC9C0\uB3C4\uB85C \uC774\uB3D9", discover: "\uC81C\uD488 \uD0D0\uC0C9", checkout: "\uACB0\uC81C", clearCart: "\uC7A5\uBC14\uAD6C\uB2C8 \uBE44\uC6B0\uAE30" },
      favorites: { title: "\uC990\uACA8\uCC3E\uAE30", subtitle: "\uC800\uC7A5\uD55C \uC7A5\uC18C\uC640 \uC0DD\uC0B0\uC790", empty: "\uC990\uACA8\uCC3E\uAE30 \uC5C6\uC74C", emptySub: "\uC9C0\uB3C4\uC5D0\uC11C \uC0DD\uC0B0\uC790\uB97C \uC990\uACA8\uCC3E\uAE30\uC5D0 \uCD94\uAC00\uD558\uC138\uC694." },
      cart: { title: "\uC7A5\uBC14\uAD6C\uB2C8", subtitle: "\uC9C0\uC5ED \uACF5\uAE09\uC5C5\uCCB4\uC5D0\uC11C\uC758 \uAD6C\uB9E4", empty: "\uC7A5\uBC14\uAD6C\uB2C8\uAC00 \uBE44\uC5B4 \uC788\uC2B5\uB2C8\uB2E4", emptySub: "\uC990\uACA8\uCC3E\uB294 \uACF3\uC5D0\uC11C \uC81C\uD488\uC744 \uCD94\uAC00\uD558\uC138\uC694.", total: "\uD569\uACC4", product: "\uC81C\uD488" },
      profile: { title: "\uD504\uB85C\uD544", subtitle: "\uC124\uC815", guest: "\uAC8C\uC2A4\uD2B8", guestSub: "\uB85C\uADF8\uC778\uD558\uC5EC \uC990\uACA8\uCC3E\uAE30\uB97C \uC800\uC7A5\uD558\uACE0 \uC8FC\uBB38\uC744 \uCD94\uC801\uD558\uC138\uC694.", darkMode: "\uB2E4\uD06C \uBAA8\uB4DC", notifications: "\uC54C\uB9BC", language: "\uC5B8\uC5B4" },
      msg: { loading: "\uB85C\uB529 \uC911...", noProducts: "\uC774\uC6A9 \uAC00\uB2A5\uD55C \uC81C\uD488\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.", checkoutSoon: "\uACB0\uC81C \u2013 \uACE7 \uC81C\uACF5", loginSoon: "\uB85C\uADF8\uC778 \u2013 \uACE7 \uC81C\uACF5", menuSoon: "\uBA54\uB274 \u2013 \uACE7 \uC81C\uACF5", premiumSoon: "\uD504\uB9AC\uBBF8\uC5C4 \u2013 \uACE7 \uC81C\uACF5", locationDenied: "\uC704\uCE58 \uC811\uADFC\uC774 \uAC70\uBD80\uB418\uC5C8\uC2B5\uB2C8\uB2E4.", locationUnavailable: "\uC704\uCE58\uB97C \uD655\uC778\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.", addedToFavorites: "\uC990\uACA8\uCC3E\uAE30\uC5D0 \uCD94\uAC00\uB428", removedFromFavorites: "\uC990\uACA8\uCC3E\uAE30\uC5D0\uC11C \uC81C\uAC70\uB428", viewError: "\uD654\uBA74\uC744 \uBD88\uB7EC\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.", error: "\uC624\uB958" },
      search: { noResults: "\uC774 \uAC80\uC0C9\uC5D0 \uB300\uD55C \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4." },
      producer: {
        openUntil: "{time}\uAE4C\uC9C0 \uC601\uC5C5",
        distance: "{distance} m",
        types: { farmer: "\uB18D\uBD80", bakery: "\uBE75\uC9D1", restaurant: "\uB808\uC2A4\uD1A0\uB791", meat: "\uC815\uC721\uC810", shop: "\uC288\uD37C\uB9C8\uCF13", vending: "\uC790\uD310\uAE30", honey: "\uC591\uBD09\uC7A5", dairy: "\uC720\uC81C\uD488", fruit: "\uACFC\uC77C", vegetables: "\uCC44\uC18C", forest: "\uC784\uC0B0\uBB3C", other: "\uACF5\uAE09\uC5C5\uCCB4" }
      },
      productDefault: "\uC9C0\uC5ED \uC81C\uD488"
    }
  );
  var VI = ui(
    { home: "Trang ch\u1EE7", map: "B\u1EA3n \u0111\u1ED3", favorites: "Y\xEAu th\xEDch", cart: "Gi\u1ECF h\xE0ng", profile: "H\u1ED3 s\u01A1" },
    {
      heroTitle: "\u1EE6ng h\u1ED9 \u0111\u1ECBa ph\u01B0\u01A1ng.<br>\u0102n u\u1ED1ng c\xF3 \xFD th\u1EE9c.<br>S\u1ED1ng t\u1ED1t h\u01A1n.",
      heroTagline: "\u{1F30D} Kh\xE1m ph\xE1 nh\xE0 s\u1EA3n xu\u1EA5t \u0111\u1ECBa ph\u01B0\u01A1ng g\u1EA7n b\u1EA1n",
      getLocation: "L\u1EA5y v\u1ECB tr\xED",
      findNearby: "T\xECm g\u1EA7n \u0111\xE2y",
      recommendedTitle: "\u2B50 N\xF4ng d\xE2n \u0111\u01B0\u1EE3c \u0111\u1EC1 xu\u1EA5t",
      recommendedPlaceholder: "S\u1EAFp ra m\u1EAFt: n\xF4ng d\xE2n \u0111\u01B0\u1EE3c \u0111\u1EC1 xu\u1EA5t",
      footerCopyright: "\xA9 2026 Regionaler Geschmack",
      searchPlaceholder: "T\xECm s\u1EA3n ph\u1EA9m, nh\xE0 h\xE0ng, c\u1EEDa h\xE0ng ho\u1EB7c nh\xE0 s\u1EA3n xu\u1EA5t...",
      hubLabel: "T\xECm ki\u1EBFm v\xE0 truy c\u1EADp nhanh",
      chipsLabel: "B\u1ED9 l\u1ECDc nhanh",
      chip: { products: "S\u1EA3n ph\u1EA9m", restaurants: "Nh\xE0 h\xE0ng", shops: "C\u1EEDa h\xE0ng", farmers: "N\xF4ng d\xE2n", favorites: "Y\xEAu th\xEDch" }
    },
    {
      all: { name: "T\u1EA5t c\u1EA3", desc: "T\u1EA5t c\u1EA3 danh m\u1EE5c" },
      restaurants: { name: "Nh\xE0 h\xE0ng", desc: "M\xF3n \u0103n \u0111\u1ECBa ph\u01B0\u01A1ng" },
      farmers: { name: "N\xF4ng d\xE2n", desc: "S\u1EA3n ph\u1EA9m t\u01B0\u01A1i" },
      bakeries: { name: "Ti\u1EC7m b\xE1nh", desc: "B\xE1nh m\u1EDBi n\u01B0\u1EDBng" },
      meat: { name: "Th\u1ECBt/C\u1EEDa h\xE0ng th\u1ECBt", desc: "X\xFAc x\xEDch \u0111\u1ECBa ph\u01B0\u01A1ng" },
      shops: { name: "C\u1EEDa h\xE0ng", desc: "S\u1EA3n ph\u1EA9m \u0111\u1ECBa ph\u01B0\u01A1ng" },
      vending: { name: "M\xE1y b\xE1n h\xE0ng t\u1EF1 \u0111\u1ED9ng", desc: "24/7" },
      favorites: { name: "Y\xEAu th\xEDch", desc: "\u0110\u1ECBa \u0111i\u1EC3m \u0111\xE3 l\u01B0u" }
    },
    {
      a11y: { darkMode: "Ch\u1EBF \u0111\u1ED9 t\u1ED1i", lightMode: "Ch\u1EBF \u0111\u1ED9 s\xE1ng", chooseLanguage: "Ch\u1ECDn ng\xF4n ng\u1EEF", menu: "Menu", premium: "Premium", map: "B\u1EA3n \u0111\u1ED3", searchRadius: "B\xE1n k\xEDnh t\xECm ki\u1EBFm (km)" },
      map: { gps: "GPS", osm: "OSM", loadError: "Kh\xF4ng th\u1EC3 t\u1EA3i b\u1EA3n \u0111\u1ED3." },
      btn: { details: "Chi ti\u1EBFt", favorite: "Y\xEAu th\xEDch", favoriteSaved: "\u0110\xE3 l\u01B0u", addToCart: "Th\xEAm v\xE0o gi\u1ECF h\xE0ng", addedToCart: "\u0110\xE3 th\xEAm", navigate: "\u0110i\u1EC1u h\u01B0\u1EDBng", close: "\u0110\xF3ng", remove: "X\xF3a", more: "Th\xEAm", less: "\xCDt h\u01A1n", login: "\u0110\u0103ng nh\u1EADp", toMap: "\u0110\u1EBFn b\u1EA3n \u0111\u1ED3", discover: "Kh\xE1m ph\xE1 s\u1EA3n ph\u1EA9m", checkout: "Thanh to\xE1n", clearCart: "X\xF3a gi\u1ECF h\xE0ng" },
      favorites: { title: "Y\xEAu th\xEDch", subtitle: "\u0110\u1ECBa \u0111i\u1EC3m v\xE0 nh\xE0 s\u1EA3n xu\u1EA5t \u0111\xE3 l\u01B0u", empty: "Ch\u01B0a c\xF3 m\u1EE5c y\xEAu th\xEDch", emptySub: "\u0110\xE1nh d\u1EA5u nh\xE0 s\u1EA3n xu\u1EA5t tr\xEAn b\u1EA3n \u0111\u1ED3 l\xE0 y\xEAu th\xEDch." },
      cart: { title: "Gi\u1ECF h\xE0ng", subtitle: "Mua s\u1EAFm t\u1EEB nh\xE0 cung c\u1EA5p \u0111\u1ECBa ph\u01B0\u01A1ng", empty: "Gi\u1ECF h\xE0ng tr\u1ED1ng", emptySub: "Th\xEAm s\u1EA3n ph\u1EA9m t\u1EEB \u0111\u1ECBa \u0111i\u1EC3m y\xEAu th\xEDch.", total: "T\u1ED5ng", product: "S\u1EA3n ph\u1EA9m" },
      profile: { title: "H\u1ED3 s\u01A1", subtitle: "C\xE0i \u0111\u1EB7t c\u1EE7a b\u1EA1n", guest: "Kh\xE1ch", guestSub: "\u0110\u0103ng nh\u1EADp \u0111\u1EC3 l\u01B0u y\xEAu th\xEDch v\xE0 theo d\xF5i \u0111\u01A1n h\xE0ng.", darkMode: "Ch\u1EBF \u0111\u1ED9 t\u1ED1i", notifications: "Th\xF4ng b\xE1o", language: "Ng\xF4n ng\u1EEF" },
      msg: { loading: "\u0110ang t\u1EA3i...", noProducts: "Kh\xF4ng c\xF3 s\u1EA3n ph\u1EA9m.", checkoutSoon: "Thanh to\xE1n \u2013 s\u1EAFp c\xF3", loginSoon: "\u0110\u0103ng nh\u1EADp \u2013 s\u1EAFp c\xF3", menuSoon: "Menu \u2013 s\u1EAFp c\xF3", premiumSoon: "Premium \u2013 s\u1EAFp c\xF3", locationDenied: "Quy\u1EC1n truy c\u1EADp v\u1ECB tr\xED b\u1ECB t\u1EEB ch\u1ED1i.", locationUnavailable: "Kh\xF4ng th\u1EC3 x\xE1c \u0111\u1ECBnh v\u1ECB tr\xED.", addedToFavorites: "\u0110\xE3 th\xEAm v\xE0o y\xEAu th\xEDch", removedFromFavorites: "\u0110\xE3 x\xF3a kh\u1ECFi y\xEAu th\xEDch", viewError: "Kh\xF4ng th\u1EC3 t\u1EA3i m\xE0n h\xECnh.", error: "L\u1ED7i" },
      search: { noResults: "Kh\xF4ng c\xF3 k\u1EBFt qu\u1EA3 cho t\xECm ki\u1EBFm n\xE0y." },
      producer: {
        openUntil: "M\u1EDF \u0111\u1EBFn {time}",
        distance: "{distance} m",
        types: { farmer: "N\xF4ng d\xE2n", bakery: "Ti\u1EC7m b\xE1nh", restaurant: "Nh\xE0 h\xE0ng", meat: "C\u1EEDa h\xE0ng th\u1ECBt", shop: "Si\xEAu th\u1ECB", vending: "M\xE1y b\xE1n h\xE0ng", honey: "Tr\u1EA1i ong", dairy: "S\u1EEFa", fruit: "Tr\xE1i c\xE2y", vegetables: "Rau c\u1EE7", forest: "S\u1EA3n ph\u1EA9m r\u1EEBng", other: "Nh\xE0 cung c\u1EA5p" }
      },
      productDefault: "S\u1EA3n ph\u1EA9m \u0111\u1ECBa ph\u01B0\u01A1ng"
    }
  );
  var MS = ui(
    { home: "Utama", map: "Peta", favorites: "Kegemaran", cart: "Troli", profile: "Profil" },
    {
      heroTitle: "Sokong tempatan.<br>Makan dengan sedar.<br>Hidup lebih baik.",
      heroTagline: "\u{1F30D} Temui pengeluar serantau berhampiran anda",
      getLocation: "Dapatkan lokasi",
      findNearby: "Cari berdekatan",
      recommendedTitle: "\u2B50 Petani disyorkan",
      recommendedPlaceholder: "Tidak lama lagi: petani pilihan",
      footerCopyright: "\xA9 2026 Regionaler Geschmack",
      searchPlaceholder: "Cari produk, restoran, kedai atau pengeluar...",
      hubLabel: "Carian dan akses pantas",
      chipsLabel: "Penapis pantas",
      chip: { products: "Produk", restaurants: "Restoran", shops: "Kedai", farmers: "Petani", favorites: "Kegemaran" }
    },
    {
      all: { name: "Semua", desc: "Semua kategori" },
      restaurants: { name: "Restoran", desc: "Hidangan serantau" },
      farmers: { name: "Petani", desc: "Produk segar" },
      bakeries: { name: "Kedai roti", desc: "Roti segar" },
      meat: { name: "Daging/Kedai daging", desc: "Sosej serantau" },
      shops: { name: "Kedai", desc: "Produk tempatan" },
      vending: { name: "Mesin layan diri", desc: "24/7" },
      favorites: { name: "Kegemaran", desc: "Tempat tersimpan" }
    },
    {
      a11y: { darkMode: "Mod gelap", lightMode: "Mod cerah", chooseLanguage: "Pilih bahasa", menu: "Menu", premium: "Premium", map: "Peta", searchRadius: "Jejari carian (km)" },
      map: { gps: "GPS", osm: "OSM", loadError: "Peta tidak dapat dimuatkan." },
      btn: { details: "Butiran", favorite: "Kegemaran", favoriteSaved: "Disimpan", addToCart: "Masukkan ke troli", addedToCart: "Ditambah", navigate: "Navigasi", close: "Tutup", remove: "Buang", more: "Lagi", less: "Kurang", login: "Log masuk", toMap: "Ke peta", discover: "Terokai produk", checkout: "Bayar", clearCart: "Kosongkan troli" },
      favorites: { title: "Kegemaran", subtitle: "Tempat dan pengeluar tersimpan", empty: "Tiada kegemaran lagi", emptySub: "Tandakan pengeluar pada peta sebagai kegemaran." },
      cart: { title: "Troli", subtitle: "Pembelian anda dari pembekal serantau", empty: "Troli kosong", emptySub: "Tambah produk dari tempat kegemaran.", total: "Jumlah", product: "Produk" },
      profile: { title: "Profil", subtitle: "Tetapan anda", guest: "Tetamu", guestSub: "Log masuk untuk menyimpan kegemaran dan menjejak pesanan.", darkMode: "Mod gelap", notifications: "Pemberitahuan", language: "Bahasa" },
      msg: { loading: "Memuatkan...", noProducts: "Tiada produk tersedia.", checkoutSoon: "Bayar \u2013 tidak lama lagi", loginSoon: "Log masuk \u2013 tidak lama lagi", menuSoon: "Menu \u2013 tidak lama lagi", premiumSoon: "Premium \u2013 tidak lama lagi", locationDenied: "Akses lokasi ditolak.", locationUnavailable: "Lokasi tidak dapat ditentukan.", addedToFavorites: "Ditambah ke kegemaran", removedFromFavorites: "Dikeluarkan dari kegemaran", viewError: "Paparan tidak dapat dimuatkan.", error: "Ralat" },
      search: { noResults: "Tiada hasil untuk carian ini." },
      producer: {
        openUntil: "Buka hingga {time}",
        distance: "{distance} m",
        types: { farmer: "Petani", bakery: "Kedai roti", restaurant: "Restoran", meat: "Kedai daging", shop: "Pasar raya", vending: "Mesin layan diri", honey: "Lebah", dairy: "Tenusu", fruit: "Buah-buahan", vegetables: "Sayur-sayuran", forest: "Produk hutan", other: "Pembekal" }
      },
      productDefault: "Produk serantau"
    }
  );
  var ID = ui(
    { home: "Beranda", map: "Peta", favorites: "Favorit", cart: "Keranjang", profile: "Profil" },
    {
      heroTitle: "Dukung lokal.<br>Makan dengan sadar.<br>Hidup lebih baik.",
      heroTagline: "\u{1F30D} Temukan produsen regional di dekat Anda",
      getLocation: "Dapatkan lokasi",
      findNearby: "Cari di sekitar",
      recommendedTitle: "\u2B50 Petani rekomendasi",
      recommendedPlaceholder: "Segera: petani rekomendasi",
      footerCopyright: "\xA9 2026 Regionaler Geschmack",
      searchPlaceholder: "Cari produk, restoran, toko, atau produsen...",
      hubLabel: "Pencarian dan akses cepat",
      chipsLabel: "Filter cepat",
      chip: { products: "Produk", restaurants: "Restoran", shops: "Toko", farmers: "Petani", favorites: "Favorit" }
    },
    {
      all: { name: "Semua", desc: "Semua kategori" },
      restaurants: { name: "Restoran", desc: "Hidangan regional" },
      farmers: { name: "Petani", desc: "Produk segar" },
      bakeries: { name: "Toko roti", desc: "Roti segar" },
      meat: { name: "Daging/Toko daging", desc: "Sosis regional" },
      shops: { name: "Toko", desc: "Produk lokal" },
      vending: { name: "Mesin penjual otomatis", desc: "24/7" },
      favorites: { name: "Favorit", desc: "Tempat tersimpan" }
    },
    {
      a11y: { darkMode: "Mode gelap", lightMode: "Mode terang", chooseLanguage: "Pilih bahasa", menu: "Menu", premium: "Premium", map: "Peta", searchRadius: "Radius pencarian (km)" },
      map: { gps: "GPS", osm: "OSM", loadError: "Peta tidak dapat dimuat." },
      btn: { details: "Detail", favorite: "Favorit", favoriteSaved: "Tersimpan", addToCart: "Tambahkan ke keranjang", addedToCart: "Ditambahkan", navigate: "Navigasi", close: "Tutup", remove: "Hapus", more: "Lebih", less: "Kurang", login: "Masuk", toMap: "Ke peta", discover: "Temukan produk", checkout: "Bayar", clearCart: "Kosongkan keranjang" },
      favorites: { title: "Favorit", subtitle: "Tempat dan produsen tersimpan", empty: "Belum ada favorit", emptySub: "Tandai produsen di peta sebagai favorit." },
      cart: { title: "Keranjang", subtitle: "Pembelian Anda dari pemasok regional", empty: "Keranjang kosong", emptySub: "Tambahkan produk dari tempat favorit.", total: "Total", product: "Produk" },
      profile: { title: "Profil", subtitle: "Pengaturan Anda", guest: "Tamu", guestSub: "Masuk untuk menyimpan favorit dan melacak pesanan.", darkMode: "Mode gelap", notifications: "Notifikasi", language: "Bahasa" },
      msg: { loading: "Memuat...", noProducts: "Tidak ada produk tersedia.", checkoutSoon: "Bayar \u2013 segera hadir", loginSoon: "Masuk \u2013 segera hadir", menuSoon: "Menu \u2013 segera hadir", premiumSoon: "Premium \u2013 segera hadir", locationDenied: "Akses lokasi ditolak.", locationUnavailable: "Lokasi tidak dapat ditentukan.", addedToFavorites: "Ditambahkan ke favorit", removedFromFavorites: "Dihapus dari favorit", viewError: "Tampilan tidak dapat dimuat.", error: "Kesalahan" },
      search: { noResults: "Tidak ada hasil untuk pencarian ini." },
      producer: {
        openUntil: "Buka hingga {time}",
        distance: "{distance} m",
        types: { farmer: "Petani", bakery: "Toko roti", restaurant: "Restoran", meat: "Toko daging", shop: "Supermarket", vending: "Mesin otomatis", honey: "Peternakan lebah", dairy: "Susu", fruit: "Buah", vegetables: "Sayuran", forest: "Produk hutan", other: "Pemasok" }
      },
      productDefault: "Produk regional"
    }
  );
  var TH = ui(
    { home: "\u0E2B\u0E19\u0E49\u0E32\u0E41\u0E23\u0E01", map: "\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48", favorites: "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E42\u0E1B\u0E23\u0E14", cart: "\u0E15\u0E30\u0E01\u0E23\u0E49\u0E32\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32", profile: "\u0E42\u0E1B\u0E23\u0E44\u0E1F\u0E25\u0E4C" },
    {
      heroTitle: "\u0E2A\u0E19\u0E31\u0E1A\u0E2A\u0E19\u0E38\u0E19\u0E17\u0E49\u0E2D\u0E07\u0E16\u0E34\u0E48\u0E19.<br>\u0E01\u0E34\u0E19\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E21\u0E35\u0E2A\u0E15\u0E34.<br>\u0E43\u0E0A\u0E49\u0E0A\u0E35\u0E27\u0E34\u0E15\u0E17\u0E35\u0E48\u0E14\u0E35\u0E02\u0E36\u0E49\u0E19.",
      heroTagline: "\u{1F30D} \u0E04\u0E49\u0E19\u0E1E\u0E1A\u0E1C\u0E39\u0E49\u0E1C\u0E25\u0E34\u0E15\u0E43\u0E19\u0E20\u0E39\u0E21\u0E34\u0E20\u0E32\u0E04\u0E43\u0E01\u0E25\u0E49\u0E04\u0E38\u0E13",
      getLocation: "\u0E23\u0E31\u0E1A\u0E15\u0E33\u0E41\u0E2B\u0E19\u0E48\u0E07",
      findNearby: "\u0E04\u0E49\u0E19\u0E2B\u0E32\u0E43\u0E01\u0E25\u0E49\u0E40\u0E04\u0E35\u0E22\u0E07",
      recommendedTitle: "\u2B50 \u0E40\u0E01\u0E29\u0E15\u0E23\u0E01\u0E23\u0E41\u0E19\u0E30\u0E19\u0E33",
      recommendedPlaceholder: "\u0E40\u0E23\u0E47\u0E27\u0E46 \u0E19\u0E35\u0E49: \u0E40\u0E01\u0E29\u0E15\u0E23\u0E01\u0E23\u0E41\u0E19\u0E30\u0E19\u0E33",
      footerCopyright: "\xA9 2026 Regionaler Geschmack",
      searchPlaceholder: "\u0E04\u0E49\u0E19\u0E2B\u0E32\u0E1C\u0E25\u0E34\u0E15\u0E20\u0E31\u0E13\u0E11\u0E4C \u0E23\u0E49\u0E32\u0E19\u0E2D\u0E32\u0E2B\u0E32\u0E23 \u0E23\u0E49\u0E32\u0E19\u0E04\u0E49\u0E32 \u0E2B\u0E23\u0E37\u0E2D\u0E1C\u0E39\u0E49\u0E1C\u0E25\u0E34\u0E15...",
      hubLabel: "\u0E04\u0E49\u0E19\u0E2B\u0E32\u0E41\u0E25\u0E30\u0E17\u0E32\u0E07\u0E25\u0E31\u0E14",
      chipsLabel: "\u0E15\u0E31\u0E27\u0E01\u0E23\u0E2D\u0E07\u0E14\u0E48\u0E27\u0E19",
      chip: { products: "\u0E1C\u0E25\u0E34\u0E15\u0E20\u0E31\u0E13\u0E11\u0E4C", restaurants: "\u0E23\u0E49\u0E32\u0E19\u0E2D\u0E32\u0E2B\u0E32\u0E23", shops: "\u0E23\u0E49\u0E32\u0E19\u0E04\u0E49\u0E32", farmers: "\u0E0A\u0E32\u0E27\u0E19\u0E32", favorites: "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E42\u0E1B\u0E23\u0E14" }
    },
    {
      all: { name: "\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14", desc: "\u0E17\u0E38\u0E01\u0E2B\u0E21\u0E27\u0E14\u0E2B\u0E21\u0E39\u0E48" },
      restaurants: { name: "\u0E23\u0E49\u0E32\u0E19\u0E2D\u0E32\u0E2B\u0E32\u0E23", desc: "\u0E2D\u0E32\u0E2B\u0E32\u0E23\u0E17\u0E49\u0E2D\u0E07\u0E16\u0E34\u0E48\u0E19" },
      farmers: { name: "\u0E0A\u0E32\u0E27\u0E19\u0E32", desc: "\u0E1C\u0E25\u0E34\u0E15\u0E20\u0E31\u0E13\u0E11\u0E4C\u0E2A\u0E14" },
      bakeries: { name: "\u0E23\u0E49\u0E32\u0E19\u0E40\u0E1A\u0E40\u0E01\u0E2D\u0E23\u0E35\u0E48", desc: "\u0E02\u0E19\u0E21\u0E1B\u0E31\u0E07\u0E2A\u0E14" },
      meat: { name: "\u0E40\u0E19\u0E37\u0E49\u0E2D/\u0E23\u0E49\u0E32\u0E19\u0E02\u0E32\u0E22\u0E40\u0E19\u0E37\u0E49\u0E2D", desc: "\u0E44\u0E2A\u0E49\u0E01\u0E23\u0E2D\u0E01\u0E17\u0E49\u0E2D\u0E07\u0E16\u0E34\u0E48\u0E19" },
      shops: { name: "\u0E23\u0E49\u0E32\u0E19\u0E04\u0E49\u0E32", desc: "\u0E1C\u0E25\u0E34\u0E15\u0E20\u0E31\u0E13\u0E11\u0E4C\u0E17\u0E49\u0E2D\u0E07\u0E16\u0E34\u0E48\u0E19" },
      vending: { name: "\u0E40\u0E04\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E08\u0E33\u0E2B\u0E19\u0E48\u0E32\u0E22\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34", desc: "24 \u0E0A\u0E21." },
      favorites: { name: "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E42\u0E1B\u0E23\u0E14", desc: "\u0E2A\u0E16\u0E32\u0E19\u0E17\u0E35\u0E48\u0E17\u0E35\u0E48\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01" }
    },
    {
      a11y: { darkMode: "\u0E42\u0E2B\u0E21\u0E14\u0E21\u0E37\u0E14", lightMode: "\u0E42\u0E2B\u0E21\u0E14\u0E2A\u0E27\u0E48\u0E32\u0E07", chooseLanguage: "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E20\u0E32\u0E29\u0E32", menu: "\u0E40\u0E21\u0E19\u0E39", premium: "\u0E1E\u0E23\u0E35\u0E40\u0E21\u0E35\u0E22\u0E21", map: "\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48", searchRadius: "\u0E23\u0E31\u0E28\u0E21\u0E35\u0E04\u0E49\u0E19\u0E2B\u0E32 (\u0E01\u0E21.)" },
      map: { gps: "GPS", osm: "OSM", loadError: "\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E42\u0E2B\u0E25\u0E14\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48\u0E44\u0E14\u0E49" },
      btn: { details: "\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14", favorite: "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E42\u0E1B\u0E23\u0E14", favoriteSaved: "\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E41\u0E25\u0E49\u0E27", addToCart: "\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E43\u0E19\u0E15\u0E30\u0E01\u0E23\u0E49\u0E32", addedToCart: "\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E41\u0E25\u0E49\u0E27", navigate: "\u0E19\u0E33\u0E17\u0E32\u0E07", close: "\u0E1B\u0E34\u0E14", remove: "\u0E25\u0E1A", more: "\u0E40\u0E1E\u0E34\u0E48\u0E21", less: "\u0E25\u0E14", login: "\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A", toMap: "\u0E44\u0E1B\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48", discover: "\u0E04\u0E49\u0E19\u0E1E\u0E1A\u0E1C\u0E25\u0E34\u0E15\u0E20\u0E31\u0E13\u0E11\u0E4C", checkout: "\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E07\u0E34\u0E19", clearCart: "\u0E25\u0E49\u0E32\u0E07\u0E15\u0E30\u0E01\u0E23\u0E49\u0E32" },
      favorites: { title: "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E42\u0E1B\u0E23\u0E14", subtitle: "\u0E2A\u0E16\u0E32\u0E19\u0E17\u0E35\u0E48\u0E41\u0E25\u0E30\u0E1C\u0E39\u0E49\u0E1C\u0E25\u0E34\u0E15\u0E17\u0E35\u0E48\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01", empty: "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E42\u0E1B\u0E23\u0E14", emptySub: "\u0E17\u0E33\u0E40\u0E04\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E2B\u0E21\u0E32\u0E22\u0E1C\u0E39\u0E49\u0E1C\u0E25\u0E34\u0E15\u0E1A\u0E19\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48\u0E40\u0E1B\u0E47\u0E19\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E42\u0E1B\u0E23\u0E14" },
      cart: { title: "\u0E15\u0E30\u0E01\u0E23\u0E49\u0E32\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32", subtitle: "\u0E01\u0E32\u0E23\u0E0B\u0E37\u0E49\u0E2D\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13\u0E08\u0E32\u0E01\u0E1C\u0E39\u0E49\u0E08\u0E31\u0E14\u0E2B\u0E32\u0E17\u0E49\u0E2D\u0E07\u0E16\u0E34\u0E48\u0E19", empty: "\u0E15\u0E30\u0E01\u0E23\u0E49\u0E32\u0E27\u0E48\u0E32\u0E07", emptySub: "\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E1C\u0E25\u0E34\u0E15\u0E20\u0E31\u0E13\u0E11\u0E4C\u0E08\u0E32\u0E01\u0E2A\u0E16\u0E32\u0E19\u0E17\u0E35\u0E48\u0E42\u0E1B\u0E23\u0E14", total: "\u0E23\u0E27\u0E21", product: "\u0E1C\u0E25\u0E34\u0E15\u0E20\u0E31\u0E13\u0E11\u0E4C" },
      profile: { title: "\u0E42\u0E1B\u0E23\u0E44\u0E1F\u0E25\u0E4C", subtitle: "\u0E01\u0E32\u0E23\u0E15\u0E31\u0E49\u0E07\u0E04\u0E48\u0E32\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13", guest: "\u0E1C\u0E39\u0E49\u0E40\u0E22\u0E35\u0E48\u0E22\u0E21\u0E0A\u0E21", guestSub: "\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E42\u0E1B\u0E23\u0E14\u0E41\u0E25\u0E30\u0E15\u0E34\u0E14\u0E15\u0E32\u0E21\u0E04\u0E33\u0E2A\u0E31\u0E48\u0E07\u0E0B\u0E37\u0E49\u0E2D", darkMode: "\u0E42\u0E2B\u0E21\u0E14\u0E21\u0E37\u0E14", notifications: "\u0E01\u0E32\u0E23\u0E41\u0E08\u0E49\u0E07\u0E40\u0E15\u0E37\u0E2D\u0E19", language: "\u0E20\u0E32\u0E29\u0E32" },
      msg: { loading: "\u0E01\u0E33\u0E25\u0E31\u0E07\u0E42\u0E2B\u0E25\u0E14...", noProducts: "\u0E44\u0E21\u0E48\u0E21\u0E35\u0E1C\u0E25\u0E34\u0E15\u0E20\u0E31\u0E13\u0E11\u0E4C", checkoutSoon: "\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E07\u0E34\u0E19 \u2013 \u0E40\u0E23\u0E47\u0E27\u0E46 \u0E19\u0E35\u0E49", loginSoon: "\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A \u2013 \u0E40\u0E23\u0E47\u0E27\u0E46 \u0E19\u0E35\u0E49", menuSoon: "\u0E40\u0E21\u0E19\u0E39 \u2013 \u0E40\u0E23\u0E47\u0E27\u0E46 \u0E19\u0E35\u0E49", premiumSoon: "\u0E1E\u0E23\u0E35\u0E40\u0E21\u0E35\u0E22\u0E21 \u2013 \u0E40\u0E23\u0E47\u0E27\u0E46 \u0E19\u0E35\u0E49", locationDenied: "\u0E1B\u0E0F\u0E34\u0E40\u0E2A\u0E18\u0E01\u0E32\u0E23\u0E40\u0E02\u0E49\u0E32\u0E16\u0E36\u0E07\u0E15\u0E33\u0E41\u0E2B\u0E19\u0E48\u0E07", locationUnavailable: "\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E23\u0E30\u0E1A\u0E38\u0E15\u0E33\u0E41\u0E2B\u0E19\u0E48\u0E07\u0E44\u0E14\u0E49", addedToFavorites: "\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E43\u0E19\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E42\u0E1B\u0E23\u0E14\u0E41\u0E25\u0E49\u0E27", removedFromFavorites: "\u0E25\u0E1A\u0E2D\u0E2D\u0E01\u0E08\u0E32\u0E01\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E42\u0E1B\u0E23\u0E14\u0E41\u0E25\u0E49\u0E27", viewError: "\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E42\u0E2B\u0E25\u0E14\u0E2B\u0E19\u0E49\u0E32\u0E08\u0E2D\u0E44\u0E14\u0E49", error: "\u0E02\u0E49\u0E2D\u0E1C\u0E34\u0E14\u0E1E\u0E25\u0E32\u0E14" },
      search: { noResults: "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E1C\u0E25\u0E25\u0E31\u0E1E\u0E18\u0E4C\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E04\u0E49\u0E19\u0E2B\u0E32\u0E19\u0E35\u0E49" },
      producer: {
        openUntil: "\u0E40\u0E1B\u0E34\u0E14\u0E16\u0E36\u0E07 {time}",
        distance: "{distance} \u0E21.",
        types: { farmer: "\u0E40\u0E01\u0E29\u0E15\u0E23\u0E01\u0E23", bakery: "\u0E23\u0E49\u0E32\u0E19\u0E40\u0E1A\u0E40\u0E01\u0E2D\u0E23\u0E35\u0E48", restaurant: "\u0E23\u0E49\u0E32\u0E19\u0E2D\u0E32\u0E2B\u0E32\u0E23", meat: "\u0E23\u0E49\u0E32\u0E19\u0E02\u0E32\u0E22\u0E40\u0E19\u0E37\u0E49\u0E2D", shop: "\u0E0B\u0E39\u0E40\u0E1B\u0E2D\u0E23\u0E4C\u0E21\u0E32\u0E23\u0E4C\u0E40\u0E01\u0E47\u0E15", vending: "\u0E15\u0E39\u0E49\u0E08\u0E33\u0E2B\u0E19\u0E48\u0E32\u0E22\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34", honey: "\u0E1F\u0E32\u0E23\u0E4C\u0E21\u0E1C\u0E36\u0E49\u0E07", dairy: "\u0E19\u0E21", fruit: "\u0E1C\u0E25\u0E44\u0E21\u0E49", vegetables: "\u0E1C\u0E31\u0E01", forest: "\u0E1C\u0E25\u0E34\u0E15\u0E20\u0E31\u0E13\u0E11\u0E4C\u0E1B\u0E48\u0E32", other: "\u0E1C\u0E39\u0E49\u0E08\u0E31\u0E14\u0E2B\u0E32" }
      },
      productDefault: "\u0E1C\u0E25\u0E34\u0E15\u0E20\u0E31\u0E13\u0E11\u0E4C\u0E17\u0E49\u0E2D\u0E07\u0E16\u0E34\u0E48\u0E19"
    }
  );
  var HI = ui(
    { home: "\u0939\u094B\u092E", map: "\u092E\u093E\u0928\u091A\u093F\u0924\u094D\u0930", favorites: "\u092A\u0938\u0902\u0926\u0940\u0926\u093E", cart: "\u0915\u093E\u0930\u094D\u091F", profile: "\u092A\u094D\u0930\u094B\u092B\u093C\u093E\u0907\u0932" },
    {
      heroTitle: "\u0938\u094D\u0925\u093E\u0928\u0940\u092F \u0915\u093E \u0938\u092E\u0930\u094D\u0925\u0928 \u0915\u0930\u0947\u0902.<br>\u091C\u093E\u0917\u0930\u0942\u0915\u0924\u093E \u0938\u0947 \u0916\u093E\u090F\u0902.<br>\u092C\u0947\u0939\u0924\u0930 \u091C\u0940\u0935\u0928\u0964",
      heroTagline: "\u{1F30D} \u0905\u092A\u0928\u0947 \u092A\u093E\u0938 \u0915\u0947 \u0915\u094D\u0937\u0947\u0924\u094D\u0930\u0940\u092F \u0909\u0924\u094D\u092A\u093E\u0926\u0915\u094B\u0902 \u0915\u094B \u0916\u094B\u091C\u0947\u0902",
      getLocation: "\u0938\u094D\u0925\u093E\u0928 \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0915\u0930\u0947\u0902",
      findNearby: "\u092A\u093E\u0938 \u092E\u0947\u0902 \u0916\u094B\u091C\u0947\u0902",
      recommendedTitle: "\u2B50 \u0905\u0928\u0941\u0936\u0902\u0938\u093F\u0924 \u0915\u093F\u0938\u093E\u0928",
      recommendedPlaceholder: "\u091C\u0932\u094D\u0926: \u0905\u0928\u0941\u0936\u0902\u0938\u093F\u0924 \u0915\u093F\u0938\u093E\u0928",
      footerCopyright: "\xA9 2026 Regionaler Geschmack",
      searchPlaceholder: "\u0909\u0924\u094D\u092A\u093E\u0926, \u0930\u0947\u0938\u094D\u0924\u0930\u093E\u0902, \u0926\u0941\u0915\u093E\u0928\u0947\u0902 \u092F\u093E \u0909\u0924\u094D\u092A\u093E\u0926\u0915 \u0916\u094B\u091C\u0947\u0902...",
      hubLabel: "\u0916\u094B\u091C \u0914\u0930 \u0924\u094D\u0935\u0930\u093F\u0924 \u092A\u0939\u0941\u0901\u091A",
      chipsLabel: "\u0924\u094D\u0935\u0930\u093F\u0924 \u092B\u093C\u093F\u0932\u094D\u091F\u0930",
      chip: { products: "\u0909\u0924\u094D\u092A\u093E\u0926", restaurants: "\u0930\u0947\u0938\u094D\u0924\u0930\u093E\u0902", shops: "\u0926\u0941\u0915\u093E\u0928\u0947\u0902", farmers: "\u0915\u093F\u0938\u093E\u0928", favorites: "\u092A\u0938\u0902\u0926\u0940\u0926\u093E" }
    },
    {
      all: { name: "\u0938\u092D\u0940", desc: "\u0938\u092D\u0940 \u0936\u094D\u0930\u0947\u0923\u093F\u092F\u093E\u0901" },
      restaurants: { name: "\u0930\u0947\u0938\u094D\u0924\u0930\u093E\u0902", desc: "\u0915\u094D\u0937\u0947\u0924\u094D\u0930\u0940\u092F \u0935\u094D\u092F\u0902\u091C\u0928" },
      farmers: { name: "\u0915\u093F\u0938\u093E\u0928", desc: "\u0924\u093E\u091C\u093C\u0947 \u0909\u0924\u094D\u092A\u093E\u0926" },
      bakeries: { name: "\u092C\u0947\u0915\u0930\u0940", desc: "\u0924\u093E\u091C\u093C\u0940 \u092C\u0947\u0915\u0930\u0940 \u0935\u0938\u094D\u0924\u0941\u090F\u0901" },
      meat: { name: "\u092E\u093E\u0902\u0938/\u0915\u0938\u093E\u0908 \u0915\u0940 \u0926\u0941\u0915\u093E\u0928", desc: "\u0915\u094D\u0937\u0947\u0924\u094D\u0930\u0940\u092F \u0938\u0949\u0938\u0947\u091C" },
      shops: { name: "\u0926\u0941\u0915\u093E\u0928\u0947\u0902", desc: "\u0938\u094D\u0925\u093E\u0928\u0940\u092F \u0909\u0924\u094D\u092A\u093E\u0926" },
      vending: { name: "\u0935\u0947\u0902\u0921\u093F\u0902\u0917 \u092E\u0936\u0940\u0928", desc: "24/7" },
      favorites: { name: "\u092A\u0938\u0902\u0926\u0940\u0926\u093E", desc: "\u0938\u0939\u0947\u091C\u0947 \u0917\u090F \u0938\u094D\u0925\u093E\u0928" }
    },
    {
      a11y: { darkMode: "\u0921\u093E\u0930\u094D\u0915 \u092E\u094B\u0921", lightMode: "\u0932\u093E\u0907\u091F \u092E\u094B\u0921", chooseLanguage: "\u092D\u093E\u0937\u093E \u091A\u0941\u0928\u0947\u0902", menu: "\u092E\u0947\u0928\u0942", premium: "\u092A\u094D\u0930\u0940\u092E\u093F\u092F\u092E", map: "\u092E\u093E\u0928\u091A\u093F\u0924\u094D\u0930", searchRadius: "\u0916\u094B\u091C \u0924\u094D\u0930\u093F\u091C\u094D\u092F\u093E (\u0915\u093F\u092E\u0940)" },
      map: { gps: "GPS", osm: "OSM", loadError: "\u092E\u093E\u0928\u091A\u093F\u0924\u094D\u0930 \u0932\u094B\u0921 \u0928\u0939\u0940\u0902 \u0939\u094B \u0938\u0915\u093E\u0964" },
      btn: { details: "\u0935\u093F\u0935\u0930\u0923", favorite: "\u092A\u0938\u0902\u0926\u0940\u0926\u093E", favoriteSaved: "\u0938\u0939\u0947\u091C\u093E \u0917\u092F\u093E", addToCart: "\u0915\u093E\u0930\u094D\u091F \u092E\u0947\u0902 \u091C\u094B\u0921\u093C\u0947\u0902", addedToCart: "\u091C\u094B\u0921\u093C\u093E \u0917\u092F\u093E", navigate: "\u0928\u0947\u0935\u093F\u0917\u0947\u091F \u0915\u0930\u0947\u0902", close: "\u092C\u0902\u0926 \u0915\u0930\u0947\u0902", remove: "\u0939\u091F\u093E\u090F\u0901", more: "\u0905\u0927\u093F\u0915", less: "\u0915\u092E", login: "\u0938\u093E\u0907\u0928 \u0907\u0928", toMap: "\u092E\u093E\u0928\u091A\u093F\u0924\u094D\u0930 \u092A\u0930 \u091C\u093E\u090F\u0901", discover: "\u0909\u0924\u094D\u092A\u093E\u0926 \u0916\u094B\u091C\u0947\u0902", checkout: "\u091A\u0947\u0915\u0906\u0909\u091F", clearCart: "\u0915\u093E\u0930\u094D\u091F \u0916\u093E\u0932\u0940 \u0915\u0930\u0947\u0902" },
      favorites: { title: "\u092A\u0938\u0902\u0926\u0940\u0926\u093E", subtitle: "\u0906\u092A\u0915\u0947 \u0938\u0939\u0947\u091C\u0947 \u0938\u094D\u0925\u093E\u0928 \u0914\u0930 \u0909\u0924\u094D\u092A\u093E\u0926\u0915", empty: "\u0905\u092D\u0940 \u0915\u094B\u0908 \u092A\u0938\u0902\u0926\u0940\u0926\u093E \u0928\u0939\u0940\u0902", emptySub: "\u092E\u093E\u0928\u091A\u093F\u0924\u094D\u0930 \u092A\u0930 \u0909\u0924\u094D\u092A\u093E\u0926\u0915\u094B\u0902 \u0915\u094B \u092A\u0938\u0902\u0926\u0940\u0926\u093E \u091A\u093F\u0939\u094D\u0928\u093F\u0924 \u0915\u0930\u0947\u0902\u0964" },
      cart: { title: "\u0915\u093E\u0930\u094D\u091F", subtitle: "\u0915\u094D\u0937\u0947\u0924\u094D\u0930\u0940\u092F \u0906\u092A\u0942\u0930\u094D\u0924\u093F\u0915\u0930\u094D\u0924\u093E\u0913\u0902 \u0938\u0947 \u0906\u092A\u0915\u0940 \u0916\u0930\u0940\u0926\u093E\u0930\u0940", empty: "\u0915\u093E\u0930\u094D\u091F \u0916\u093E\u0932\u0940 \u0939\u0948", emptySub: "\u092A\u0938\u0902\u0926\u0940\u0926\u093E \u0938\u094D\u0925\u093E\u0928\u094B\u0902 \u0938\u0947 \u0909\u0924\u094D\u092A\u093E\u0926 \u091C\u094B\u0921\u093C\u0947\u0902\u0964", total: "\u0915\u0941\u0932", product: "\u0909\u0924\u094D\u092A\u093E\u0926" },
      profile: { title: "\u092A\u094D\u0930\u094B\u092B\u093C\u093E\u0907\u0932", subtitle: "\u0906\u092A\u0915\u0940 \u0938\u0947\u091F\u093F\u0902\u0917\u094D\u0938", guest: "\u0905\u0924\u093F\u0925\u093F", guestSub: "\u092A\u0938\u0902\u0926\u0940\u0926\u093E \u0938\u0939\u0947\u091C\u0928\u0947 \u0914\u0930 \u0911\u0930\u094D\u0921\u0930 \u091F\u094D\u0930\u0948\u0915 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0938\u093E\u0907\u0928 \u0907\u0928 \u0915\u0930\u0947\u0902\u0964", darkMode: "\u0921\u093E\u0930\u094D\u0915 \u092E\u094B\u0921", notifications: "\u0938\u0942\u091A\u0928\u093E\u090F\u0901", language: "\u092D\u093E\u0937\u093E" },
      msg: { loading: "\u0932\u094B\u0921 \u0939\u094B \u0930\u0939\u093E \u0939\u0948...", noProducts: "\u0915\u094B\u0908 \u0909\u0924\u094D\u092A\u093E\u0926 \u0909\u092A\u0932\u092C\u094D\u0927 \u0928\u0939\u0940\u0902\u0964", checkoutSoon: "\u091A\u0947\u0915\u0906\u0909\u091F \u2013 \u091C\u0932\u094D\u0926 \u0906 \u0930\u0939\u093E \u0939\u0948", loginSoon: "\u0938\u093E\u0907\u0928 \u0907\u0928 \u2013 \u091C\u0932\u094D\u0926 \u0906 \u0930\u0939\u093E \u0939\u0948", menuSoon: "\u092E\u0947\u0928\u0942 \u2013 \u091C\u0932\u094D\u0926 \u0906 \u0930\u0939\u093E \u0939\u0948", premiumSoon: "\u092A\u094D\u0930\u0940\u092E\u093F\u092F\u092E \u2013 \u091C\u0932\u094D\u0926 \u0906 \u0930\u0939\u093E \u0939\u0948", locationDenied: "\u0938\u094D\u0925\u093E\u0928 \u092A\u0939\u0941\u0901\u091A \u0905\u0938\u094D\u0935\u0940\u0915\u0943\u0924\u0964", locationUnavailable: "\u0938\u094D\u0925\u093E\u0928 \u0928\u093F\u0930\u094D\u0927\u093E\u0930\u093F\u0924 \u0928\u0939\u0940\u0902 \u0939\u094B \u0938\u0915\u093E\u0964", addedToFavorites: "\u092A\u0938\u0902\u0926\u0940\u0926\u093E \u092E\u0947\u0902 \u091C\u094B\u0921\u093C\u093E \u0917\u092F\u093E", removedFromFavorites: "\u092A\u0938\u0902\u0926\u0940\u0926\u093E \u0938\u0947 \u0939\u091F\u093E\u092F\u093E \u0917\u092F\u093E", viewError: "\u0926\u0943\u0936\u094D\u092F \u0932\u094B\u0921 \u0928\u0939\u0940\u0902 \u0939\u094B \u0938\u0915\u093E\u0964", error: "\u0924\u094D\u0930\u0941\u091F\u093F" },
      search: { noResults: "\u0907\u0938 \u0916\u094B\u091C \u0915\u0947 \u0932\u093F\u090F \u0915\u094B\u0908 \u092A\u0930\u093F\u0923\u093E\u092E \u0928\u0939\u0940\u0902\u0964" },
      producer: {
        openUntil: "{time} \u0924\u0915 \u0916\u0941\u0932\u093E",
        distance: "{distance} \u092E\u0940",
        types: { farmer: "\u0915\u093F\u0938\u093E\u0928", bakery: "\u092C\u0947\u0915\u0930\u0940", restaurant: "\u0930\u0947\u0938\u094D\u0924\u0930\u093E\u0902", meat: "\u0915\u0938\u093E\u0908", shop: "\u0938\u0941\u092A\u0930\u092E\u093E\u0930\u094D\u0915\u0947\u091F", vending: "\u0935\u0947\u0902\u0921\u093F\u0902\u0917 \u092E\u0936\u0940\u0928", honey: "\u092E\u0927\u0941\u092E\u0915\u094D\u0916\u0940 \u092A\u093E\u0932\u0928", dairy: "\u0921\u0947\u092F\u0930\u0940", fruit: "\u092B\u0932", vegetables: "\u0938\u092C\u094D\u091C\u093C\u093F\u092F\u093E\u0901", forest: "\u0935\u0928 \u0909\u0924\u094D\u092A\u093E\u0926", other: "\u0906\u092A\u0942\u0930\u094D\u0924\u093F\u0915\u0930\u094D\u0924\u093E" }
      },
      productDefault: "\u0915\u094D\u0937\u0947\u0924\u094D\u0930\u0940\u092F \u0909\u0924\u094D\u092A\u093E\u0926"
    }
  );
  function asianDeepMerge(target, source) {
    const out = __spreadValues({}, target);
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        out[key] = asianDeepMerge(out[key] || {}, source[key]);
      } else {
        out[key] = source[key];
      }
    }
    return out;
  }
  var ASIAN_UI_EXTRA = {
    zh: {
      map: { dataLoading: "\u6B63\u5728\u52A0\u8F7D\u4F9B\u5E94\u5546\u2026", dataCached: "API \u4E0D\u53EF\u7528 \u2013 \u663E\u793A\u5DF2\u4FDD\u5B58\u6570\u636E\u3002", dataError: "\u65E0\u6CD5\u52A0\u8F7D\u6570\u636E\u3002", radiusFilter: "\u{1F535} \u8303\u56F4\uFF1A{km} \u516C\u91CC\uFF08{count} \u4E2A\u5730\u70B9\uFF09" },
      shell: { label: "\u4E3B\u5BFC\u822A" },
      reviews: { title: "\u8BC4\u4EF7", add: "\u6DFB\u52A0\u8BC4\u4EF7", empty: "\u6682\u65E0\u8BC4\u4EF7\u3002", userName: "\u60A8\u7684\u59D3\u540D", rating: "\u8BC4\u5206", comment: "\u8BC4\u8BBA", submit: "\u63D0\u4EA4", saved: "\u8BC4\u4EF7\u5DF2\u4FDD\u5B58" },
      msg: { addedToCart: "\u5DF2\u52A0\u5165\u8D2D\u7269\u8F66", removedFromCart: "\u5DF2\u4ECE\u8D2D\u7269\u8F66\u79FB\u9664", connectionError: "\u8FDE\u63A5\u9519\u8BEF" }
    },
    "zh-tw": {
      nav: { premium: "\u9032\u968E\u7248" },
      map: { dataLoading: "\u6B63\u5728\u8F09\u5165\u4F9B\u61C9\u5546\u2026", dataCached: "API \u7121\u6CD5\u4F7F\u7528 \u2013 \u986F\u793A\u5DF2\u5132\u5B58\u8CC7\u6599\u3002", dataError: "\u7121\u6CD5\u8F09\u5165\u8CC7\u6599\u3002", radiusFilter: "\u{1F535} \u7BC4\u570D\uFF1A{km} \u516C\u91CC\uFF08{count} \u500B\u5730\u9EDE\uFF09" },
      shell: { label: "\u4E3B\u5C0E\u822A" },
      reviews: { title: "\u8A55\u50F9", add: "\u65B0\u589E\u8A55\u50F9", empty: "\u66AB\u7121\u8A55\u50F9\u3002", userName: "\u60A8\u7684\u59D3\u540D", rating: "\u8A55\u5206", comment: "\u8A55\u8AD6", submit: "\u9001\u51FA", saved: "\u8A55\u50F9\u5DF2\u5132\u5B58" },
      msg: { addedToCart: "\u5DF2\u52A0\u5165\u8CFC\u7269\u8ECA", removedFromCart: "\u5DF2\u5F9E\u8CFC\u7269\u8ECA\u79FB\u9664", connectionError: "\u9023\u7DDA\u932F\u8AA4" }
    },
    ja: {
      nav: { premium: "\u30D7\u30EC\u30DF\u30A2\u30E0" },
      map: { dataLoading: "\u63D0\u4F9B\u8005\u3092\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026", dataCached: "API \u5229\u7528\u4E0D\u53EF \u2013 \u4FDD\u5B58\u30C7\u30FC\u30BF\u3092\u8868\u793A\u4E2D\u3002", dataError: "\u30C7\u30FC\u30BF\u3092\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3067\u3057\u305F\u3002", radiusFilter: "\u{1F535} \u7BC4\u56F2\uFF1A{km} km\uFF08{count} \u4EF6\uFF09" },
      shell: { label: "\u30E1\u30A4\u30F3\u30CA\u30D3\u30B2\u30FC\u30B7\u30E7\u30F3" },
      reviews: { title: "\u30EC\u30D3\u30E5\u30FC", add: "\u30EC\u30D3\u30E5\u30FC\u3092\u8FFD\u52A0", empty: "\u30EC\u30D3\u30E5\u30FC\u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093\u3002", userName: "\u304A\u540D\u524D", rating: "\u8A55\u4FA1", comment: "\u30B3\u30E1\u30F3\u30C8", submit: "\u9001\u4FE1", saved: "\u30EC\u30D3\u30E5\u30FC\u3092\u4FDD\u5B58\u3057\u307E\u3057\u305F" },
      msg: { addedToCart: "\u30AB\u30FC\u30C8\u306B\u8FFD\u52A0\u3057\u307E\u3057\u305F", removedFromCart: "\u30AB\u30FC\u30C8\u304B\u3089\u524A\u9664\u3057\u307E\u3057\u305F", connectionError: "\u63A5\u7D9A\u30A8\u30E9\u30FC" }
    },
    ko: {
      nav: { premium: "\uD504\uB9AC\uBBF8\uC5C4" },
      map: { dataLoading: "\uACF5\uAE09\uC790 \uB85C\uB529 \uC911\u2026", dataCached: "API \uC0AC\uC6A9 \uBD88\uAC00 \u2013 \uC800\uC7A5\uB41C \uB370\uC774\uD130 \uD45C\uC2DC.", dataError: "\uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.", radiusFilter: "\u{1F535} \uBC94\uC704: {km} km ({count}\uACF3)" },
      shell: { label: "\uC8FC \uB0B4\uBE44\uAC8C\uC774\uC158" },
      reviews: { title: "\uB9AC\uBDF0", add: "\uB9AC\uBDF0 \uCD94\uAC00", empty: "\uC544\uC9C1 \uB9AC\uBDF0\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.", userName: "\uC774\uB984", rating: "\uD3C9\uC810", comment: "\uB313\uAE00", submit: "\uC81C\uCD9C", saved: "\uB9AC\uBDF0\uAC00 \uC800\uC7A5\uB418\uC5C8\uC2B5\uB2C8\uB2E4" },
      msg: { addedToCart: "\uC7A5\uBC14\uAD6C\uB2C8\uC5D0 \uCD94\uAC00\uB428", removedFromCart: "\uC7A5\uBC14\uAD6C\uB2C8\uC5D0\uC11C \uC81C\uAC70\uB428", connectionError: "\uC5F0\uACB0 \uC624\uB958" }
    },
    vi: {
      nav: { premium: "Premium" },
      map: { dataLoading: "\u0110ang t\u1EA3i nh\xE0 cung c\u1EA5p\u2026", dataCached: "API kh\xF4ng kh\u1EA3 d\u1EE5ng \u2013 hi\u1EC3n th\u1ECB d\u1EEF li\u1EC7u \u0111\xE3 l\u01B0u.", dataError: "Kh\xF4ng th\u1EC3 t\u1EA3i d\u1EEF li\u1EC7u.", radiusFilter: "\u{1F535} Ph\u1EA1m vi: {km} km ({count} \u0111\u1ECBa \u0111i\u1EC3m)" },
      shell: { label: "\u0110i\u1EC1u h\u01B0\u1EDBng ch\xEDnh" },
      reviews: { title: "\u0110\xE1nh gi\xE1", add: "Th\xEAm \u0111\xE1nh gi\xE1", empty: "Ch\u01B0a c\xF3 \u0111\xE1nh gi\xE1.", userName: "T\xEAn c\u1EE7a b\u1EA1n", rating: "X\u1EBFp h\u1EA1ng", comment: "B\xECnh lu\u1EADn", submit: "G\u1EEDi", saved: "\u0110\xE1nh gi\xE1 \u0111\xE3 l\u01B0u" },
      msg: { addedToCart: "\u0110\xE3 th\xEAm v\xE0o gi\u1ECF h\xE0ng", removedFromCart: "\u0110\xE3 x\xF3a kh\u1ECFi gi\u1ECF h\xE0ng", connectionError: "L\u1ED7i k\u1EBFt n\u1ED1i" }
    },
    ms: {
      nav: { premium: "Premium" },
      map: { dataLoading: "Memuatkan pembekal\u2026", dataCached: "API tidak tersedia \u2013 data tersimpan dipaparkan.", dataError: "Data tidak dapat dimuatkan.", radiusFilter: "\u{1F535} Julat: {km} km ({count} tempat)" },
      shell: { label: "Navigasi utama" },
      reviews: { title: "Ulasan", add: "Tambah ulasan", empty: "Tiada ulasan lagi.", userName: "Nama anda", rating: "Penilaian", comment: "Komen", submit: "Hantar", saved: "Ulasan disimpan" },
      msg: { addedToCart: "Ditambah ke troli", removedFromCart: "Dikeluarkan dari troli", connectionError: "Ralat sambungan" }
    },
    id: {
      nav: { premium: "Premium" },
      map: { dataLoading: "Memuat pemasok\u2026", dataCached: "API tidak tersedia \u2013 menampilkan data tersimpan.", dataError: "Data tidak dapat dimuat.", radiusFilter: "\u{1F535} Jangkauan: {km} km ({count} tempat)" },
      shell: { label: "Navigasi utama" },
      reviews: { title: "Ulasan", add: "Tambah ulasan", empty: "Belum ada ulasan.", userName: "Nama Anda", rating: "Penilaian", comment: "Komentar", submit: "Kirim", saved: "Ulasan disimpan" },
      msg: { addedToCart: "Ditambahkan ke keranjang", removedFromCart: "Dihapus dari keranjang", connectionError: "Kesalahan koneksi" }
    },
    th: {
      nav: { premium: "\u0E1E\u0E23\u0E35\u0E40\u0E21\u0E35\u0E22\u0E21" },
      map: { dataLoading: "\u0E01\u0E33\u0E25\u0E31\u0E07\u0E42\u0E2B\u0E25\u0E14\u0E1C\u0E39\u0E49\u0E43\u0E2B\u0E49\u0E1A\u0E23\u0E34\u0E01\u0E32\u0E23\u2026", dataCached: "API \u0E44\u0E21\u0E48\u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19 \u2013 \u0E41\u0E2A\u0E14\u0E07\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E35\u0E48\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E44\u0E27\u0E49", dataError: "\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E42\u0E2B\u0E25\u0E14\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E14\u0E49", radiusFilter: "\u{1F535} \u0E23\u0E31\u0E28\u0E21\u0E35: {km} \u0E01\u0E21. ({count} \u0E41\u0E2B\u0E48\u0E07)" },
      shell: { label: "\u0E01\u0E32\u0E23\u0E19\u0E33\u0E17\u0E32\u0E07\u0E2B\u0E25\u0E31\u0E01" },
      reviews: { title: "\u0E23\u0E35\u0E27\u0E34\u0E27", add: "\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E23\u0E35\u0E27\u0E34\u0E27", empty: "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E23\u0E35\u0E27\u0E34\u0E27", userName: "\u0E0A\u0E37\u0E48\u0E2D\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13", rating: "\u0E04\u0E30\u0E41\u0E19\u0E19", comment: "\u0E04\u0E27\u0E32\u0E21\u0E04\u0E34\u0E14\u0E40\u0E2B\u0E47\u0E19", submit: "\u0E2A\u0E48\u0E07", saved: "\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E23\u0E35\u0E27\u0E34\u0E27\u0E41\u0E25\u0E49\u0E27" },
      msg: { addedToCart: "\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E43\u0E19\u0E15\u0E30\u0E01\u0E23\u0E49\u0E32\u0E41\u0E25\u0E49\u0E27", removedFromCart: "\u0E25\u0E1A\u0E2D\u0E2D\u0E01\u0E08\u0E32\u0E01\u0E15\u0E30\u0E01\u0E23\u0E49\u0E32\u0E41\u0E25\u0E49\u0E27", connectionError: "\u0E02\u0E49\u0E2D\u0E1C\u0E34\u0E14\u0E1E\u0E25\u0E32\u0E14\u0E01\u0E32\u0E23\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E21\u0E15\u0E48\u0E2D" }
    },
    hi: {
      nav: { premium: "\u092A\u094D\u0930\u0940\u092E\u093F\u092F\u092E" },
      map: { dataLoading: "\u0906\u092A\u0942\u0930\u094D\u0924\u093F\u0915\u0930\u094D\u0924\u093E \u0932\u094B\u0921 \u0939\u094B \u0930\u0939\u0947 \u0939\u0948\u0902\u2026", dataCached: "API \u0909\u092A\u0932\u092C\u094D\u0927 \u0928\u0939\u0940\u0902 \u2013 \u0938\u0939\u0947\u091C\u093E \u0921\u0947\u091F\u093E \u0926\u093F\u0916\u093E\u092F\u093E \u091C\u093E \u0930\u0939\u093E \u0939\u0948\u0964", dataError: "\u0921\u0947\u091F\u093E \u0932\u094B\u0921 \u0928\u0939\u0940\u0902 \u0939\u094B \u0938\u0915\u093E\u0964", radiusFilter: "\u{1F535} \u0926\u093E\u092F\u0930\u093E: {km} \u0915\u093F\u092E\u0940 ({count} \u0938\u094D\u0925\u093E\u0928)" },
      shell: { label: "\u092E\u0941\u0916\u094D\u092F \u0928\u0947\u0935\u093F\u0917\u0947\u0936\u0928" },
      reviews: { title: "\u0938\u092E\u0940\u0915\u094D\u0937\u093E\u090F\u0901", add: "\u0938\u092E\u0940\u0915\u094D\u0937\u093E \u091C\u094B\u0921\u093C\u0947\u0902", empty: "\u0905\u092D\u0940 \u0915\u094B\u0908 \u0938\u092E\u0940\u0915\u094D\u0937\u093E \u0928\u0939\u0940\u0902\u0964", userName: "\u0906\u092A\u0915\u093E \u0928\u093E\u092E", rating: "\u0930\u0947\u091F\u093F\u0902\u0917", comment: "\u091F\u093F\u092A\u094D\u092A\u0923\u0940", submit: "\u091C\u092E\u093E \u0915\u0930\u0947\u0902", saved: "\u0938\u092E\u0940\u0915\u094D\u0937\u093E \u0938\u0939\u0947\u091C\u0940 \u0917\u0908" },
      msg: { addedToCart: "\u0915\u093E\u0930\u094D\u091F \u092E\u0947\u0902 \u091C\u094B\u0921\u093C\u093E \u0917\u092F\u093E", removedFromCart: "\u0915\u093E\u0930\u094D\u091F \u0938\u0947 \u0939\u091F\u093E\u092F\u093E \u0917\u092F\u093E", connectionError: "\u0915\u0928\u0947\u0915\u094D\u0936\u0928 \u0924\u094D\u0930\u0941\u091F\u093F" }
    }
  };
  var ASIAN_RAW = { zh: ZH, "zh-tw": ZH_TW, ja: JA, ko: KO, vi: VI, ms: MS, id: ID, th: TH, hi: HI };
  var ASIAN_BUILT = {};
  for (const [code, lang] of Object.entries(ASIAN_RAW)) {
    ASIAN_BUILT[code] = asianDeepMerge(lang, ASIAN_UI_EXTRA[code] || {});
  }
  var ASIAN_TRANSLATIONS = Object.freeze(ASIAN_BUILT);
  var ASIAN_CATALOG = Object.freeze({
    zh: {},
    "zh-tw": {},
    ja: {},
    ko: {},
    vi: {},
    ms: {},
    id: {},
    th: {},
    hi: {}
  });

  // js/translations-menu.js
  var MENU_I18N = Object.freeze({
    de: {
      title: "Men\xFC",
      back: "Zur\xFCck",
      close: "Schlie\xDFen",
      sectionMain: "Hauptmen\xFC",
      sectionLegal: "Rechtliches",
      sectionHelp: "Hilfe & Installation",
      sectionContact: "Kontakt & Autor",
      home: "Startseite",
      map: "Karte",
      favorites: "Favoriten",
      cart: "Warenkorb",
      terms: "Nutzungsbedingungen",
      privacy: "Datenschutz",
      about: "\xDCber die App",
      guide: "Bedienungsanleitung",
      downloadApp: "App herunterladen",
      qr: "QR-Code",
      recommendations: "Empfehlungen",
      downloadPdf: "Installationsanleitung (PDF)",
      contact: "Kontakt",
      author: "Autor",
      cooperation: "Zusammenarbeit",
      reportBug: "Fehler melden"
    },
    en: {
      title: "Menu",
      back: "Back",
      close: "Close",
      sectionMain: "Main",
      sectionLegal: "Legal information",
      sectionHelp: "Help & installation",
      sectionContact: "Contact & author",
      home: "Home",
      map: "Map",
      favorites: "Favorites",
      cart: "Cart",
      terms: "Terms of use",
      privacy: "Privacy policy",
      about: "About the app",
      guide: "User guide",
      downloadApp: "Download app",
      qr: "QR code",
      recommendations: "Recommendations",
      downloadPdf: "Installation guide (PDF)",
      contact: "Contact",
      author: "Author",
      cooperation: "Cooperation",
      reportBug: "Report a bug"
    },
    pl: {
      title: "Menu",
      back: "Wstecz",
      close: "Zamknij",
      sectionMain: "G\u0142\xF3wne",
      sectionLegal: "Informacje prawne",
      sectionHelp: "Pomoc i instalacja",
      sectionContact: "Kontakt i autor",
      home: "Strona g\u0142\xF3wna",
      map: "Mapa",
      favorites: "Ulubione",
      cart: "Koszyk",
      terms: "Regulamin",
      privacy: "Polityka prywatno\u015Bci",
      about: "O aplikacji",
      guide: "Instrukcja obs\u0142ugi",
      downloadApp: "Pobierz aplikacj\u0119",
      qr: "Kod QR",
      recommendations: "Zalecenia",
      downloadPdf: "Instrukcja instalacji (PDF)",
      contact: "Kontakt",
      author: "Autor",
      cooperation: "Wsp\xF3\u0142praca",
      reportBug: "Zg\u0142o\u015B b\u0142\u0105d"
    },
    ru: {
      title: "\u041C\u0435\u043D\u044E",
      back: "\u041D\u0430\u0437\u0430\u0434",
      close: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C",
      sectionMain: "\u0413\u043B\u0430\u0432\u043D\u043E\u0435",
      sectionLegal: "\u041F\u0440\u0430\u0432\u043E\u0432\u0430\u044F \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F",
      sectionHelp: "\u041F\u043E\u043C\u043E\u0449\u044C \u0438 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0430",
      sectionContact: "\u041A\u043E\u043D\u0442\u0430\u043A\u0442 \u0438 \u0430\u0432\u0442\u043E\u0440",
      home: "\u0413\u043B\u0430\u0432\u043D\u0430\u044F",
      map: "\u041A\u0430\u0440\u0442\u0430",
      favorites: "\u0418\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435",
      cart: "\u041A\u043E\u0440\u0437\u0438\u043D\u0430",
      terms: "\u0423\u0441\u043B\u043E\u0432\u0438\u044F \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044F",
      privacy: "\u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0430 \u043A\u043E\u043D\u0444\u0438\u0434\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u0438",
      about: "\u041E \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0438",
      guide: "\u0418\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u044F",
      downloadApp: "\u0421\u043A\u0430\u0447\u0430\u0442\u044C \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435",
      qr: "QR-\u043A\u043E\u0434",
      recommendations: "\u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u0438",
      downloadPdf: "\u0418\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u044F \u043F\u043E \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0435 (PDF)",
      contact: "\u041A\u043E\u043D\u0442\u0430\u043A\u0442",
      author: "\u0410\u0432\u0442\u043E\u0440",
      cooperation: "\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u0447\u0435\u0441\u0442\u0432\u043E",
      reportBug: "\u0421\u043E\u043E\u0431\u0449\u0438\u0442\u044C \u043E\u0431 \u043E\u0448\u0438\u0431\u043A\u0435"
    },
    tr: {
      title: "Men\xFC",
      back: "Geri",
      close: "Kapat",
      sectionMain: "Ana",
      sectionLegal: "Yasal bilgiler",
      sectionHelp: "Yard\u0131m ve kurulum",
      sectionContact: "\u0130leti\u015Fim ve yazar",
      home: "Ana Sayfa",
      map: "Harita",
      favorites: "Favoriler",
      cart: "Sepet",
      terms: "Kullan\u0131m \u015Fartlar\u0131",
      privacy: "Gizlilik politikas\u0131",
      about: "Uygulama hakk\u0131nda",
      guide: "Kullan\u0131m k\u0131lavuzu",
      downloadApp: "Uygulamay\u0131 indir",
      qr: "QR kod",
      recommendations: "\xD6neriler",
      downloadPdf: "Kurulum k\u0131lavuzu (PDF)",
      contact: "\u0130leti\u015Fim",
      author: "Yazar",
      cooperation: "\u0130\u015F birli\u011Fi",
      reportBug: "Hata bildir"
    },
    fr: {
      title: "Menu",
      back: "Retour",
      close: "Fermer",
      sectionMain: "Principal",
      sectionLegal: "Informations l\xE9gales",
      sectionHelp: "Aide et installation",
      sectionContact: "Contact et auteur",
      home: "Accueil",
      map: "Carte",
      favorites: "Favoris",
      cart: "Panier",
      terms: "Conditions d'utilisation",
      privacy: "Politique de confidentialit\xE9",
      about: "\xC0 propos de l'app",
      guide: "Mode d'emploi",
      downloadApp: "T\xE9l\xE9charger l'app",
      qr: "Code QR",
      recommendations: "Recommandations",
      downloadPdf: "Guide d'installation (PDF)",
      contact: "Contact",
      author: "Auteur",
      cooperation: "Coop\xE9ration",
      reportBug: "Signaler un bug"
    },
    es: {
      title: "Men\xFA",
      back: "Atr\xE1s",
      close: "Cerrar",
      sectionMain: "Principal",
      sectionLegal: "Informaci\xF3n legal",
      sectionHelp: "Ayuda e instalaci\xF3n",
      sectionContact: "Contacto y autor",
      home: "Inicio",
      map: "Mapa",
      favorites: "Favoritos",
      cart: "Carrito",
      terms: "T\xE9rminos de uso",
      privacy: "Pol\xEDtica de privacidad",
      about: "Sobre la aplicaci\xF3n",
      guide: "Manual de usuario",
      downloadApp: "Descargar app",
      qr: "C\xF3digo QR",
      recommendations: "Recomendaciones",
      downloadPdf: "Gu\xEDa de instalaci\xF3n (PDF)",
      contact: "Contacto",
      author: "Autor",
      cooperation: "Cooperaci\xF3n",
      reportBug: "Reportar error"
    },
    it: {
      title: "Menu",
      back: "Indietro",
      close: "Chiudi",
      sectionMain: "Principale",
      sectionLegal: "Informazioni legali",
      sectionHelp: "Aiuto e installazione",
      sectionContact: "Contatto e autore",
      home: "Home",
      map: "Mappa",
      favorites: "Preferiti",
      cart: "Carrello",
      terms: "Termini di utilizzo",
      privacy: "Informativa sulla privacy",
      about: "Informazioni sull'app",
      guide: "Manuale utente",
      downloadApp: "Scarica app",
      qr: "Codice QR",
      recommendations: "Raccomandazioni",
      downloadPdf: "Guida installazione (PDF)",
      contact: "Contatto",
      author: "Autore",
      cooperation: "Collaborazione",
      reportBug: "Segnala bug"
    },
    nl: {
      title: "Menu",
      back: "Terug",
      close: "Sluiten",
      sectionMain: "Hoofdmenu",
      sectionLegal: "Juridische informatie",
      sectionHelp: "Hulp en installatie",
      sectionContact: "Contact en auteur",
      home: "Home",
      map: "Kaart",
      favorites: "Favorieten",
      cart: "Winkelwagen",
      terms: "Gebruiksvoorwaarden",
      privacy: "Privacybeleid",
      about: "Over de app",
      guide: "Gebruikershandleiding",
      downloadApp: "App downloaden",
      qr: "QR-code",
      recommendations: "Aanbevelingen",
      downloadPdf: "Installatiehandleiding (PDF)",
      contact: "Contact",
      author: "Auteur",
      cooperation: "Samenwerking",
      reportBug: "Bug melden"
    },
    cs: {
      title: "Menu",
      back: "Zp\u011Bt",
      close: "Zav\u0159\xEDt",
      sectionMain: "Hlavn\xED",
      sectionLegal: "Pr\xE1vn\xED informace",
      sectionHelp: "N\xE1pov\u011Bda a instalace",
      sectionContact: "Kontakt a autor",
      home: "Dom\u016F",
      map: "Mapa",
      favorites: "Obl\xEDben\xE9",
      cart: "Ko\u0161\xEDk",
      terms: "Podm\xEDnky pou\u017Eit\xED",
      privacy: "Z\xE1sady ochrany soukrom\xED",
      about: "O aplikaci",
      guide: "N\xE1vod k pou\u017Eit\xED",
      downloadApp: "St\xE1hnout aplikaci",
      qr: "QR k\xF3d",
      recommendations: "Doporu\u010Den\xED",
      downloadPdf: "Instala\u010Dn\xED n\xE1vod (PDF)",
      contact: "Kontakt",
      author: "Autor",
      cooperation: "Spolupr\xE1ce",
      reportBug: "Nahl\xE1sit chybu"
    },
    sk: {
      title: "Menu",
      back: "Sp\xE4\u0165",
      close: "Zavrie\u0165",
      sectionMain: "Hlavn\xE9",
      sectionLegal: "Pr\xE1vne inform\xE1cie",
      sectionHelp: "Pomoc a in\u0161tal\xE1cia",
      sectionContact: "Kontakt a autor",
      home: "Domov",
      map: "Mapa",
      favorites: "Ob\u013E\xFAben\xE9",
      cart: "Ko\u0161\xEDk",
      terms: "Podmienky pou\u017E\xEDvania",
      privacy: "Z\xE1sady ochrany s\xFAkromia",
      about: "O aplik\xE1cii",
      guide: "N\xE1vod na pou\u017Eitie",
      downloadApp: "Stiahnu\u0165 aplik\xE1ciu",
      qr: "QR k\xF3d",
      recommendations: "Odpor\xFA\u010Dania",
      downloadPdf: "In\u0161tala\u010Dn\xFD n\xE1vod (PDF)",
      contact: "Kontakt",
      author: "Autor",
      cooperation: "Spolupr\xE1ca",
      reportBug: "Nahl\xE1si\u0165 chybu"
    },
    hu: {
      title: "Men\xFC",
      back: "Vissza",
      close: "Bez\xE1r\xE1s",
      sectionMain: "F\u0151men\xFC",
      sectionLegal: "Jogi inform\xE1ci\xF3k",
      sectionHelp: "S\xFAg\xF3 \xE9s telep\xEDt\xE9s",
      sectionContact: "Kapcsolat \xE9s szerz\u0151",
      home: "Kezd\u0151lap",
      map: "T\xE9rk\xE9p",
      favorites: "Kedvencek",
      cart: "Kos\xE1r",
      terms: "Felhaszn\xE1l\xE1si felt\xE9telek",
      privacy: "Adatv\xE9delmi ir\xE1nyelvek",
      about: "Az alkalmaz\xE1sr\xF3l",
      guide: "Haszn\xE1lati \xFAtmutat\xF3",
      downloadApp: "Alkalmaz\xE1s let\xF6lt\xE9se",
      qr: "QR-k\xF3d",
      recommendations: "Aj\xE1nl\xE1sok",
      downloadPdf: "Telep\xEDt\xE9si \xFAtmutat\xF3 (PDF)",
      contact: "Kapcsolat",
      author: "Szerz\u0151",
      cooperation: "Egy\xFCttm\u0171k\xF6d\xE9s",
      reportBug: "Hiba bejelent\xE9se"
    },
    ro: {
      title: "Meniu",
      back: "\xCEnapoi",
      close: "\xCEnchide",
      sectionMain: "Principal",
      sectionLegal: "Informa\u021Bii legale",
      sectionHelp: "Ajutor \u0219i instalare",
      sectionContact: "Contact \u0219i autor",
      home: "Acas\u0103",
      map: "Hart\u0103",
      favorites: "Favorite",
      cart: "Co\u0219",
      terms: "Termeni de utilizare",
      privacy: "Politica de confiden\u021Bialitate",
      about: "Despre aplica\u021Bie",
      guide: "Ghid de utilizare",
      downloadApp: "Descarc\u0103 aplica\u021Bia",
      qr: "Cod QR",
      recommendations: "Recomand\u0103ri",
      downloadPdf: "Ghid de instalare (PDF)",
      contact: "Contact",
      author: "Autor",
      cooperation: "Colaborare",
      reportBug: "Raporteaz\u0103 o eroare"
    },
    bg: {
      title: "\u041C\u0435\u043D\u044E",
      back: "\u041D\u0430\u0437\u0430\u0434",
      close: "\u0417\u0430\u0442\u0432\u043E\u0440\u0438",
      sectionMain: "\u041E\u0441\u043D\u043E\u0432\u043D\u043E",
      sectionLegal: "\u041F\u0440\u0430\u0432\u043D\u0430 \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F",
      sectionHelp: "\u041F\u043E\u043C\u043E\u0449 \u0438 \u0438\u043D\u0441\u0442\u0430\u043B\u0430\u0446\u0438\u044F",
      sectionContact: "\u041A\u043E\u043D\u0442\u0430\u043A\u0442 \u0438 \u0430\u0432\u0442\u043E\u0440",
      home: "\u041D\u0430\u0447\u0430\u043B\u043E",
      map: "\u041A\u0430\u0440\u0442\u0430",
      favorites: "\u041B\u044E\u0431\u0438\u043C\u0438",
      cart: "\u041A\u043E\u043B\u0438\u0447\u043A\u0430",
      terms: "\u0423\u0441\u043B\u043E\u0432\u0438\u044F \u0437\u0430 \u043F\u043E\u043B\u0437\u0432\u0430\u043D\u0435",
      privacy: "\u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0430 \u0437\u0430 \u043F\u043E\u0432\u0435\u0440\u0438\u0442\u0435\u043B\u043D\u043E\u0441\u0442",
      about: "\u0417\u0430 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435\u0442\u043E",
      guide: "\u0420\u044A\u043A\u043E\u0432\u043E\u0434\u0441\u0442\u0432\u043E",
      downloadApp: "\u0418\u0437\u0442\u0435\u0433\u043B\u0438 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435\u0442\u043E",
      qr: "QR \u043A\u043E\u0434",
      recommendations: "\u041F\u0440\u0435\u043F\u043E\u0440\u044A\u043A\u0438",
      downloadPdf: "\u0420\u044A\u043A\u043E\u0432\u043E\u0434\u0441\u0442\u0432\u043E \u0437\u0430 \u0438\u043D\u0441\u0442\u0430\u043B\u0430\u0446\u0438\u044F (PDF)",
      contact: "\u041A\u043E\u043D\u0442\u0430\u043A\u0442",
      author: "\u0410\u0432\u0442\u043E\u0440",
      cooperation: "\u0421\u044A\u0442\u0440\u0443\u0434\u043D\u0438\u0447\u0435\u0441\u0442\u0432\u043E",
      reportBug: "\u0414\u043E\u043A\u043B\u0430\u0434\u0432\u0430\u0439 \u0433\u0440\u0435\u0448\u043A\u0430"
    },
    el: {
      title: "\u039C\u03B5\u03BD\u03BF\u03CD",
      back: "\u03A0\u03AF\u03C3\u03C9",
      close: "\u039A\u03BB\u03B5\u03AF\u03C3\u03B9\u03BC\u03BF",
      sectionMain: "\u039A\u03CD\u03C1\u03B9\u03BF",
      sectionLegal: "\u039D\u03BF\u03BC\u03B9\u03BA\u03AD\u03C2 \u03C0\u03BB\u03B7\u03C1\u03BF\u03C6\u03BF\u03C1\u03AF\u03B5\u03C2",
      sectionHelp: "\u0392\u03BF\u03AE\u03B8\u03B5\u03B9\u03B1 \u03BA\u03B1\u03B9 \u03B5\u03B3\u03BA\u03B1\u03C4\u03AC\u03C3\u03C4\u03B1\u03C3\u03B7",
      sectionContact: "\u0395\u03C0\u03B9\u03BA\u03BF\u03B9\u03BD\u03C9\u03BD\u03AF\u03B1 \u03BA\u03B1\u03B9 \u03C3\u03C5\u03B3\u03B3\u03C1\u03B1\u03C6\u03AD\u03B1\u03C2",
      home: "\u0391\u03C1\u03C7\u03B9\u03BA\u03AE",
      map: "\u03A7\u03AC\u03C1\u03C4\u03B7\u03C2",
      favorites: "\u0391\u03B3\u03B1\u03C0\u03B7\u03BC\u03AD\u03BD\u03B1",
      cart: "\u039A\u03B1\u03BB\u03AC\u03B8\u03B9",
      terms: "\u038C\u03C1\u03BF\u03B9 \u03C7\u03C1\u03AE\u03C3\u03B7\u03C2",
      privacy: "\u03A0\u03BF\u03BB\u03B9\u03C4\u03B9\u03BA\u03AE \u03B1\u03C0\u03BF\u03C1\u03C1\u03AE\u03C4\u03BF\u03C5",
      about: "\u03A3\u03C7\u03B5\u03C4\u03B9\u03BA\u03AC \u03BC\u03B5 \u03C4\u03B7\u03BD \u03B5\u03C6\u03B1\u03C1\u03BC\u03BF\u03B3\u03AE",
      guide: "\u039F\u03B4\u03B7\u03B3\u03CC\u03C2 \u03C7\u03C1\u03AE\u03C3\u03B7\u03C2",
      downloadApp: "\u039B\u03AE\u03C8\u03B7 \u03B5\u03C6\u03B1\u03C1\u03BC\u03BF\u03B3\u03AE\u03C2",
      qr: "\u039A\u03C9\u03B4\u03B9\u03BA\u03CC\u03C2 QR",
      recommendations: "\u03A3\u03C5\u03C3\u03C4\u03AC\u03C3\u03B5\u03B9\u03C2",
      downloadPdf: "\u039F\u03B4\u03B7\u03B3\u03CC\u03C2 \u03B5\u03B3\u03BA\u03B1\u03C4\u03AC\u03C3\u03C4\u03B1\u03C3\u03B7\u03C2 (PDF)",
      contact: "\u0395\u03C0\u03B9\u03BA\u03BF\u03B9\u03BD\u03C9\u03BD\u03AF\u03B1",
      author: "\u03A3\u03C5\u03B3\u03B3\u03C1\u03B1\u03C6\u03AD\u03B1\u03C2",
      cooperation: "\u03A3\u03C5\u03BD\u03B5\u03C1\u03B3\u03B1\u03C3\u03AF\u03B1",
      reportBug: "\u0391\u03BD\u03B1\u03C6\u03BF\u03C1\u03AC \u03C3\u03C6\u03AC\u03BB\u03BC\u03B1\u03C4\u03BF\u03C2"
    },
    hr: {
      title: "Izbornik",
      back: "Natrag",
      close: "Zatvori",
      sectionMain: "Glavno",
      sectionLegal: "Pravne informacije",
      sectionHelp: "Pomo\u0107 i instalacija",
      sectionContact: "Kontakt i autor",
      home: "Po\u010Detna",
      map: "Karta",
      favorites: "Favoriti",
      cart: "Ko\u0161arica",
      terms: "Uvjeti kori\u0161tenja",
      privacy: "Pravila privatnosti",
      about: "O aplikaciji",
      guide: "Upute za kori\u0161tenje",
      downloadApp: "Preuzmi aplikaciju",
      qr: "QR kod",
      recommendations: "Preporuke",
      downloadPdf: "Upute za instalaciju (PDF)",
      contact: "Kontakt",
      author: "Autor",
      cooperation: "Suradnja",
      reportBug: "Prijavi gre\u0161ku"
    },
    sr: {
      title: "\u041C\u0435\u043D\u0438",
      back: "\u041D\u0430\u0437\u0430\u0434",
      close: "\u0417\u0430\u0442\u0432\u043E\u0440\u0438",
      sectionMain: "\u0413\u043B\u0430\u0432\u043D\u043E",
      sectionLegal: "\u041F\u0440\u0430\u0432\u043D\u0435 \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u0458\u0435",
      sectionHelp: "\u041F\u043E\u043C\u043E\u045B \u0438 \u0438\u043D\u0441\u0442\u0430\u043B\u0430\u0446\u0438\u0458\u0430",
      sectionContact: "\u041A\u043E\u043D\u0442\u0430\u043A\u0442 \u0438 \u0430\u0443\u0442\u043E\u0440",
      home: "\u041F\u043E\u0447\u0435\u0442\u043D\u0430",
      map: "\u041C\u0430\u043F\u0430",
      favorites: "\u041E\u043C\u0438\u0459\u0435\u043D\u043E",
      cart: "\u041A\u043E\u0440\u043F\u0430",
      terms: "\u0423\u0441\u043B\u043E\u0432\u0438 \u043A\u043E\u0440\u0438\u0448\u045B\u0435\u045A\u0430",
      privacy: "\u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0430 \u043F\u0440\u0438\u0432\u0430\u0442\u043D\u043E\u0441\u0442\u0438",
      about: "\u041E \u0430\u043F\u043B\u0438\u043A\u0430\u0446\u0438\u0458\u0438",
      guide: "\u0423\u043F\u0443\u0442\u0441\u0442\u0432\u043E",
      downloadApp: "\u041F\u0440\u0435\u0443\u0437\u043C\u0438 \u0430\u043F\u043B\u0438\u043A\u0430\u0446\u0438\u0458\u0443",
      qr: "QR \u043A\u043E\u0434",
      recommendations: "\u041F\u0440\u0435\u043F\u043E\u0440\u0443\u043A\u0435",
      downloadPdf: "\u0423\u043F\u0443\u0442\u0441\u0442\u0432\u043E \u0437\u0430 \u0438\u043D\u0441\u0442\u0430\u043B\u0430\u0446\u0438\u0458\u0443 (PDF)",
      contact: "\u041A\u043E\u043D\u0442\u0430\u043A\u0442",
      author: "\u0410\u0443\u0442\u043E\u0440",
      cooperation: "\u0421\u0430\u0440\u0430\u0434\u045A\u0430",
      reportBug: "\u041F\u0440\u0438\u0458\u0430\u0432\u0438 \u0433\u0440\u0435\u0448\u043A\u0443"
    },
    sl: {
      title: "Meni",
      back: "Nazaj",
      close: "Zapri",
      sectionMain: "Glavno",
      sectionLegal: "Pravne informacije",
      sectionHelp: "Pomo\u010D in namestitev",
      sectionContact: "Kontakt in avtor",
      home: "Domov",
      map: "Zemljevid",
      favorites: "Priljubljeno",
      cart: "Ko\u0161arica",
      terms: "Pogoji uporabe",
      privacy: "Politika zasebnosti",
      about: "O aplikaciji",
      guide: "Navodila za uporabo",
      downloadApp: "Prenesi aplikacijo",
      qr: "QR koda",
      recommendations: "Priporo\u010Dila",
      downloadPdf: "Navodila za namestitev (PDF)",
      contact: "Kontakt",
      author: "Avtor",
      cooperation: "Sodelovanje",
      reportBug: "Prijavi napako"
    },
    lt: {
      title: "Meniu",
      back: "Atgal",
      close: "U\u017Edaryti",
      sectionMain: "Pagrindinis",
      sectionLegal: "Teisin\u0117 informacija",
      sectionHelp: "Pagalba ir diegimas",
      sectionContact: "Kontaktai ir autorius",
      home: "Prad\u017Eia",
      map: "\u017Dem\u0117lapis",
      favorites: "M\u0117gstami",
      cart: "Krep\u0161elis",
      terms: "Naudojimo s\u0105lygos",
      privacy: "Privatumo politika",
      about: "Apie program\u0117l\u0119",
      guide: "Naudojimo instrukcija",
      downloadApp: "Atsisi\u0173sti program\u0117l\u0119",
      qr: "QR kodas",
      recommendations: "Rekomendacijos",
      downloadPdf: "Diegimo instrukcija (PDF)",
      contact: "Kontaktas",
      author: "Autorius",
      cooperation: "Bendradarbiavimas",
      reportBug: "Prane\u0161ti apie klaid\u0105"
    },
    lv: {
      title: "Izv\u0113lne",
      back: "Atpaka\u013C",
      close: "Aizv\u0113rt",
      sectionMain: "Galvenais",
      sectionLegal: "Juridisk\u0101 inform\u0101cija",
      sectionHelp: "Pal\u012Bdz\u012Bba un instal\u0101cija",
      sectionContact: "Kontakti un autors",
      home: "S\u0101kums",
      map: "Karte",
      favorites: "Izlase",
      cart: "Grozs",
      terms: "Lieto\u0161anas noteikumi",
      privacy: "Priv\u0101tuma politika",
      about: "Par lietotni",
      guide: "Lieto\u0161anas instrukcija",
      downloadApp: "Lejupiel\u0101d\u0113t lietotni",
      qr: "QR kods",
      recommendations: "Ieteikumi",
      downloadPdf: "Instal\u0101cijas instrukcija (PDF)",
      contact: "Kontakts",
      author: "Autors",
      cooperation: "Sadarb\u012Bba",
      reportBug: "Zi\u0146ot par k\u013C\u016Bdu"
    },
    et: {
      title: "Men\xFC\xFC",
      back: "Tagasi",
      close: "Sulge",
      sectionMain: "Peamine",
      sectionLegal: "Juriidiline info",
      sectionHelp: "Abi ja paigaldus",
      sectionContact: "Kontakt ja autor",
      home: "Avaleht",
      map: "Kaart",
      favorites: "Lemmikud",
      cart: "Ostukorv",
      terms: "Kasutustingimused",
      privacy: "Privaatsuspoliitika",
      about: "Rakendusest",
      guide: "Kasutusjuhend",
      downloadApp: "Laadi rakendus alla",
      qr: "QR-kood",
      recommendations: "Soovitused",
      downloadPdf: "Paigaldusjuhend (PDF)",
      contact: "Kontakt",
      author: "Autor",
      cooperation: "Koost\xF6\xF6",
      reportBug: "Teata veast"
    },
    fi: {
      title: "Valikko",
      back: "Takaisin",
      close: "Sulje",
      sectionMain: "P\xE4\xE4valikko",
      sectionLegal: "Oikeudelliset tiedot",
      sectionHelp: "Ohje ja asennus",
      sectionContact: "Yhteystiedot ja tekij\xE4",
      home: "Koti",
      map: "Kartta",
      favorites: "Suosikit",
      cart: "Ostoskori",
      terms: "K\xE4ytt\xF6ehdot",
      privacy: "Tietosuojak\xE4yt\xE4nt\xF6",
      about: "Tietoa sovelluksesta",
      guide: "K\xE4ytt\xF6ohje",
      downloadApp: "Lataa sovellus",
      qr: "QR-koodi",
      recommendations: "Suositukset",
      downloadPdf: "Asennusohje (PDF)",
      contact: "Yhteystiedot",
      author: "Tekij\xE4",
      cooperation: "Yhteisty\xF6",
      reportBug: "Ilmoita virheest\xE4"
    },
    sv: {
      title: "Meny",
      back: "Tillbaka",
      close: "St\xE4ng",
      sectionMain: "Huvudmeny",
      sectionLegal: "Juridisk information",
      sectionHelp: "Hj\xE4lp och installation",
      sectionContact: "Kontakt och f\xF6rfattare",
      home: "Hem",
      map: "Karta",
      favorites: "Favoriter",
      cart: "Varukorg",
      terms: "Anv\xE4ndarvillkor",
      privacy: "Integritetspolicy",
      about: "Om appen",
      guide: "Anv\xE4ndarguide",
      downloadApp: "Ladda ner appen",
      qr: "QR-kod",
      recommendations: "Rekommendationer",
      downloadPdf: "Installationsguide (PDF)",
      contact: "Kontakt",
      author: "F\xF6rfattare",
      cooperation: "Samarbete",
      reportBug: "Rapportera fel"
    },
    no: {
      title: "Meny",
      back: "Tilbake",
      close: "Lukk",
      sectionMain: "Hovedmeny",
      sectionLegal: "Juridisk informasjon",
      sectionHelp: "Hjelp og installasjon",
      sectionContact: "Kontakt og forfatter",
      home: "Hjem",
      map: "Kart",
      favorites: "Favoritter",
      cart: "Handlekurv",
      terms: "Vilk\xE5r for bruk",
      privacy: "Personvernregler",
      about: "Om appen",
      guide: "Brukerveiledning",
      downloadApp: "Last ned appen",
      qr: "QR-kode",
      recommendations: "Anbefalinger",
      downloadPdf: "Installasjonsveiledning (PDF)",
      contact: "Kontakt",
      author: "Forfatter",
      cooperation: "Samarbeid",
      reportBug: "Rapporter feil"
    },
    da: {
      title: "Menu",
      back: "Tilbage",
      close: "Luk",
      sectionMain: "Hovedmenu",
      sectionLegal: "Juridisk information",
      sectionHelp: "Hj\xE6lp og installation",
      sectionContact: "Kontakt og forfatter",
      home: "Hjem",
      map: "Kort",
      favorites: "Favoritter",
      cart: "Kurv",
      terms: "Brugsbetingelser",
      privacy: "Privatlivspolitik",
      about: "Om appen",
      guide: "Brugervejledning",
      downloadApp: "Download appen",
      qr: "QR-kode",
      recommendations: "Anbefalinger",
      downloadPdf: "Installationsvejledning (PDF)",
      contact: "Kontakt",
      author: "Forfatter",
      cooperation: "Samarbejde",
      reportBug: "Rapporter fejl"
    },
    is: {
      title: "Valmynd",
      back: "Til baka",
      close: "Loka",
      sectionMain: "A\xF0alvalmynd",
      sectionLegal: "Lagalegar uppl\xFDsingar",
      sectionHelp: "Hj\xE1lp og uppsetning",
      sectionContact: "Samband og h\xF6fundur",
      home: "Heim",
      map: "Kort",
      favorites: "Upp\xE1hald",
      cart: "Karfa",
      terms: "Notkunarskilm\xE1lar",
      privacy: "Pers\xF3nuverndarstefna",
      about: "Um forriti\xF0",
      guide: "Notkunarlei\xF0beiningar",
      downloadApp: "S\xE6kja forriti\xF0",
      qr: "QR-k\xF3\xF0i",
      recommendations: "Till\xF6gur",
      downloadPdf: "Uppsetningarlei\xF0beiningar (PDF)",
      contact: "Samband",
      author: "H\xF6fundur",
      cooperation: "Samstarf",
      reportBug: "Tilkynna villu"
    },
    zh: {
      title: "\u83DC\u5355",
      back: "\u8FD4\u56DE",
      close: "\u5173\u95ED",
      sectionMain: "\u4E3B\u8981",
      sectionLegal: "\u6CD5\u5F8B\u4FE1\u606F",
      sectionHelp: "\u5E2E\u52A9\u4E0E\u5B89\u88C5",
      sectionContact: "\u8054\u7CFB\u4E0E\u4F5C\u8005",
      home: "\u9996\u9875",
      map: "\u5730\u56FE",
      favorites: "\u6536\u85CF",
      cart: "\u8D2D\u7269\u8F66",
      terms: "\u4F7F\u7528\u6761\u6B3E",
      privacy: "\u9690\u79C1\u653F\u7B56",
      about: "\u5173\u4E8E\u5E94\u7528",
      guide: "\u4F7F\u7528\u8BF4\u660E",
      downloadApp: "\u4E0B\u8F7D\u5E94\u7528",
      qr: "\u4E8C\u7EF4\u7801",
      recommendations: "\u5EFA\u8BAE",
      downloadPdf: "\u5B89\u88C5\u8BF4\u660E (PDF)",
      contact: "\u8054\u7CFB",
      author: "\u4F5C\u8005",
      cooperation: "\u5408\u4F5C",
      reportBug: "\u62A5\u544A\u9519\u8BEF"
    },
    "zh-tw": {
      title: "\u9078\u55AE",
      back: "\u8FD4\u56DE",
      close: "\u95DC\u9589",
      sectionMain: "\u4E3B\u8981",
      sectionLegal: "\u6CD5\u5F8B\u8CC7\u8A0A",
      sectionHelp: "\u8AAA\u660E\u8207\u5B89\u88DD",
      sectionContact: "\u806F\u7D61\u8207\u4F5C\u8005",
      home: "\u9996\u9801",
      map: "\u5730\u5716",
      favorites: "\u6536\u85CF",
      cart: "\u8CFC\u7269\u8ECA",
      terms: "\u4F7F\u7528\u689D\u6B3E",
      privacy: "\u96B1\u79C1\u653F\u7B56",
      about: "\u95DC\u65BC\u61C9\u7528\u7A0B\u5F0F",
      guide: "\u4F7F\u7528\u8AAA\u660E",
      downloadApp: "\u4E0B\u8F09\u61C9\u7528\u7A0B\u5F0F",
      qr: "QR \u78BC",
      recommendations: "\u5EFA\u8B70",
      downloadPdf: "\u5B89\u88DD\u8AAA\u660E (PDF)",
      contact: "\u806F\u7D61",
      author: "\u4F5C\u8005",
      cooperation: "\u5408\u4F5C",
      reportBug: "\u56DE\u5831\u932F\u8AA4"
    },
    ja: {
      title: "\u30E1\u30CB\u30E5\u30FC",
      back: "\u623B\u308B",
      close: "\u9589\u3058\u308B",
      sectionMain: "\u30E1\u30A4\u30F3",
      sectionLegal: "\u6CD5\u7684\u60C5\u5831",
      sectionHelp: "\u30D8\u30EB\u30D7\u3068\u30A4\u30F3\u30B9\u30C8\u30FC\u30EB",
      sectionContact: "\u9023\u7D61\u5148\u3068\u4F5C\u8005",
      home: "\u30DB\u30FC\u30E0",
      map: "\u5730\u56F3",
      favorites: "\u304A\u6C17\u306B\u5165\u308A",
      cart: "\u30AB\u30FC\u30C8",
      terms: "\u5229\u7528\u898F\u7D04",
      privacy: "\u30D7\u30E9\u30A4\u30D0\u30B7\u30FC\u30DD\u30EA\u30B7\u30FC",
      about: "\u30A2\u30D7\u30EA\u306B\u3064\u3044\u3066",
      guide: "\u53D6\u6271\u8AAC\u660E\u66F8",
      downloadApp: "\u30A2\u30D7\u30EA\u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9",
      qr: "QR\u30B3\u30FC\u30C9",
      recommendations: "\u63A8\u5968\u4E8B\u9805",
      downloadPdf: "\u30A4\u30F3\u30B9\u30C8\u30FC\u30EB\u30AC\u30A4\u30C9 (PDF)",
      contact: "\u9023\u7D61\u5148",
      author: "\u4F5C\u8005",
      cooperation: "\u5354\u529B",
      reportBug: "\u30D0\u30B0\u3092\u5831\u544A"
    },
    ko: {
      title: "\uBA54\uB274",
      back: "\uB4A4\uB85C",
      close: "\uB2EB\uAE30",
      sectionMain: "\uBA54\uC778",
      sectionLegal: "\uBC95\uC801 \uC815\uBCF4",
      sectionHelp: "\uB3C4\uC6C0\uB9D0 \uBC0F \uC124\uCE58",
      sectionContact: "\uC5F0\uB77D\uCC98 \uBC0F \uC791\uC131\uC790",
      home: "\uD648",
      map: "\uC9C0\uB3C4",
      favorites: "\uC990\uACA8\uCC3E\uAE30",
      cart: "\uC7A5\uBC14\uAD6C\uB2C8",
      terms: "\uC774\uC6A9 \uC57D\uAD00",
      privacy: "\uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC\uBC29\uCE68",
      about: "\uC571 \uC815\uBCF4",
      guide: "\uC0AC\uC6A9 \uC124\uBA85\uC11C",
      downloadApp: "\uC571 \uB2E4\uC6B4\uB85C\uB4DC",
      qr: "QR \uCF54\uB4DC",
      recommendations: "\uAD8C\uC7A5 \uC0AC\uD56D",
      downloadPdf: "\uC124\uCE58 \uAC00\uC774\uB4DC (PDF)",
      contact: "\uC5F0\uB77D\uCC98",
      author: "\uC791\uC131\uC790",
      cooperation: "\uD611\uB825",
      reportBug: "\uC624\uB958 \uC2E0\uACE0"
    },
    vi: {
      title: "Menu",
      back: "Quay l\u1EA1i",
      close: "\u0110\xF3ng",
      sectionMain: "Ch\xEDnh",
      sectionLegal: "Th\xF4ng tin ph\xE1p l\xFD",
      sectionHelp: "Tr\u1EE3 gi\xFAp & c\xE0i \u0111\u1EB7t",
      sectionContact: "Li\xEAn h\u1EC7 & t\xE1c gi\u1EA3",
      home: "Trang ch\u1EE7",
      map: "B\u1EA3n \u0111\u1ED3",
      favorites: "Y\xEAu th\xEDch",
      cart: "Gi\u1ECF h\xE0ng",
      terms: "\u0110i\u1EC1u kho\u1EA3n s\u1EED d\u1EE5ng",
      privacy: "Ch\xEDnh s\xE1ch b\u1EA3o m\u1EADt",
      about: "Gi\u1EDBi thi\u1EC7u \u1EE9ng d\u1EE5ng",
      guide: "H\u01B0\u1EDBng d\u1EABn s\u1EED d\u1EE5ng",
      downloadApp: "T\u1EA3i \u1EE9ng d\u1EE5ng",
      qr: "M\xE3 QR",
      recommendations: "Khuy\u1EBFn ngh\u1ECB",
      downloadPdf: "H\u01B0\u1EDBng d\u1EABn c\xE0i \u0111\u1EB7t (PDF)",
      contact: "Li\xEAn h\u1EC7",
      author: "T\xE1c gi\u1EA3",
      cooperation: "H\u1EE3p t\xE1c",
      reportBug: "B\xE1o l\u1ED7i"
    },
    ms: {
      title: "Menu",
      back: "Kembali",
      close: "Tutup",
      sectionMain: "Utama",
      sectionLegal: "Maklumat undang-undang",
      sectionHelp: "Bantuan & pemasangan",
      sectionContact: "Hubungi & pengarang",
      home: "Utama",
      map: "Peta",
      favorites: "Kegemaran",
      cart: "Troli",
      terms: "Terma penggunaan",
      privacy: "Dasar privasi",
      about: "Perihal aplikasi",
      guide: "Panduan pengguna",
      downloadApp: "Muat turun aplikasi",
      qr: "Kod QR",
      recommendations: "Cadangan",
      downloadPdf: "Panduan pemasangan (PDF)",
      contact: "Hubungi",
      author: "Pengarang",
      cooperation: "Kerjasama",
      reportBug: "Laporkan pepijat"
    },
    id: {
      title: "Menu",
      back: "Kembali",
      close: "Tutup",
      sectionMain: "Utama",
      sectionLegal: "Informasi hukum",
      sectionHelp: "Bantuan & instalasi",
      sectionContact: "Kontak & penulis",
      home: "Beranda",
      map: "Peta",
      favorites: "Favorit",
      cart: "Keranjang",
      terms: "Syarat penggunaan",
      privacy: "Kebijakan privasi",
      about: "Tentang aplikasi",
      guide: "Panduan pengguna",
      downloadApp: "Unduh aplikasi",
      qr: "Kode QR",
      recommendations: "Rekomendasi",
      downloadPdf: "Panduan instalasi (PDF)",
      contact: "Kontak",
      author: "Penulis",
      cooperation: "Kerja sama",
      reportBug: "Laporkan bug"
    },
    th: {
      title: "\u0E40\u0E21\u0E19\u0E39",
      back: "\u0E01\u0E25\u0E31\u0E1A",
      close: "\u0E1B\u0E34\u0E14",
      sectionMain: "\u0E2B\u0E25\u0E31\u0E01",
      sectionLegal: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E32\u0E07\u0E01\u0E0E\u0E2B\u0E21\u0E32\u0E22",
      sectionHelp: "\u0E04\u0E27\u0E32\u0E21\u0E0A\u0E48\u0E27\u0E22\u0E40\u0E2B\u0E25\u0E37\u0E2D\u0E41\u0E25\u0E30\u0E01\u0E32\u0E23\u0E15\u0E34\u0E14\u0E15\u0E31\u0E49\u0E07",
      sectionContact: "\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D\u0E41\u0E25\u0E30\u0E1C\u0E39\u0E49\u0E40\u0E02\u0E35\u0E22\u0E19",
      home: "\u0E2B\u0E19\u0E49\u0E32\u0E41\u0E23\u0E01",
      map: "\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48",
      favorites: "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E42\u0E1B\u0E23\u0E14",
      cart: "\u0E15\u0E30\u0E01\u0E23\u0E49\u0E32\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32",
      terms: "\u0E02\u0E49\u0E2D\u0E01\u0E33\u0E2B\u0E19\u0E14\u0E01\u0E32\u0E23\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19",
      privacy: "\u0E19\u0E42\u0E22\u0E1A\u0E32\u0E22\u0E04\u0E27\u0E32\u0E21\u0E40\u0E1B\u0E47\u0E19\u0E2A\u0E48\u0E27\u0E19\u0E15\u0E31\u0E27",
      about: "\u0E40\u0E01\u0E35\u0E48\u0E22\u0E27\u0E01\u0E31\u0E1A\u0E41\u0E2D\u0E1B",
      guide: "\u0E04\u0E39\u0E48\u0E21\u0E37\u0E2D\u0E01\u0E32\u0E23\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19",
      downloadApp: "\u0E14\u0E32\u0E27\u0E19\u0E4C\u0E42\u0E2B\u0E25\u0E14\u0E41\u0E2D\u0E1B",
      qr: "\u0E23\u0E2B\u0E31\u0E2A QR",
      recommendations: "\u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33",
      downloadPdf: "\u0E04\u0E39\u0E48\u0E21\u0E37\u0E2D\u0E01\u0E32\u0E23\u0E15\u0E34\u0E14\u0E15\u0E31\u0E49\u0E07 (PDF)",
      contact: "\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D",
      author: "\u0E1C\u0E39\u0E49\u0E40\u0E02\u0E35\u0E22\u0E19",
      cooperation: "\u0E04\u0E27\u0E32\u0E21\u0E23\u0E48\u0E27\u0E21\u0E21\u0E37\u0E2D",
      reportBug: "\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E02\u0E49\u0E2D\u0E1C\u0E34\u0E14\u0E1E\u0E25\u0E32\u0E14"
    },
    hi: {
      title: "\u092E\u0947\u0928\u0942",
      back: "\u0935\u093E\u092A\u0938",
      close: "\u092C\u0902\u0926 \u0915\u0930\u0947\u0902",
      sectionMain: "\u092E\u0941\u0916\u094D\u092F",
      sectionLegal: "\u0915\u093E\u0928\u0942\u0928\u0940 \u091C\u093E\u0928\u0915\u093E\u0930\u0940",
      sectionHelp: "\u0938\u0939\u093E\u092F\u0924\u093E \u0914\u0930 \u0907\u0902\u0938\u094D\u091F\u0949\u0932\u0947\u0936\u0928",
      sectionContact: "\u0938\u0902\u092A\u0930\u094D\u0915 \u0914\u0930 \u0932\u0947\u0916\u0915",
      home: "\u0939\u094B\u092E",
      map: "\u092E\u093E\u0928\u091A\u093F\u0924\u094D\u0930",
      favorites: "\u092A\u0938\u0902\u0926\u0940\u0926\u093E",
      cart: "\u0915\u093E\u0930\u094D\u091F",
      terms: "\u0909\u092A\u092F\u094B\u0917 \u0915\u0940 \u0936\u0930\u094D\u0924\u0947\u0902",
      privacy: "\u0917\u094B\u092A\u0928\u0940\u092F\u0924\u093E \u0928\u0940\u0924\u093F",
      about: "\u0910\u092A \u0915\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902",
      guide: "\u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E \u0917\u093E\u0907\u0921",
      downloadApp: "\u0910\u092A \u0921\u093E\u0909\u0928\u0932\u094B\u0921 \u0915\u0930\u0947\u0902",
      qr: "QR \u0915\u094B\u0921",
      recommendations: "\u0938\u093F\u092B\u093E\u0930\u093F\u0936\u0947\u0902",
      downloadPdf: "\u0907\u0902\u0938\u094D\u091F\u0949\u0932\u0947\u0936\u0928 \u0917\u093E\u0907\u0921 (PDF)",
      contact: "\u0938\u0902\u092A\u0930\u094D\u0915",
      author: "\u0932\u0947\u0916\u0915",
      cooperation: "\u0938\u0939\u092F\u094B\u0917",
      reportBug: "\u092C\u0917 \u0930\u093F\u092A\u094B\u0930\u094D\u091F \u0915\u0930\u0947\u0902"
    },
    mk: {
      title: "\u041C\u0435\u043D\u0438",
      back: "\u041D\u0430\u0437\u0430\u0434",
      close: "\u0417\u0430\u0442\u0432\u043E\u0440\u0438",
      sectionMain: "\u0413\u043B\u0430\u0432\u043D\u043E",
      sectionLegal: "\u041F\u0440\u0430\u0432\u043D\u0438 \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u0438",
      sectionHelp: "\u041F\u043E\u043C\u043E\u0448 \u0438 \u0438\u043D\u0441\u0442\u0430\u043B\u0430\u0446\u0438\u0458\u0430",
      sectionContact: "\u041A\u043E\u043D\u0442\u0430\u043A\u0442 \u0438 \u0430\u0432\u0442\u043E\u0440",
      home: "\u041F\u043E\u0447\u0435\u0442\u043D\u0430",
      map: "\u041A\u0430\u0440\u0442\u0430",
      favorites: "\u041E\u043C\u0438\u043B\u0435\u043D\u0438",
      cart: "\u041A\u043E\u0448\u043D\u0438\u0447\u043A\u0430",
      terms: "\u041F\u0440\u0430\u0432\u0438\u043B\u0430",
      privacy: "\u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0430 \u0437\u0430 \u043F\u0440\u0438\u0432\u0430\u0442\u043D\u043E\u0441\u0442",
      about: "\u0417\u0430 \u0430\u043F\u043B\u0438\u043A\u0430\u0446\u0438\u0458\u0430\u0442\u0430",
      guide: "\u0423\u043F\u0430\u0442\u0441\u0442\u0432\u043E",
      downloadApp: "\u041F\u0440\u0435\u0437\u0435\u043C\u0438 \u0430\u043F\u043B\u0438\u043A\u0430\u0446\u0438\u0458\u0430",
      qr: "QR \u043A\u043E\u0434",
      recommendations: "\u041F\u0440\u0435\u043F\u043E\u0440\u0430\u043A\u0438",
      downloadPdf: "\u0423\u043F\u0430\u0442\u0441\u0442\u0432\u043E \u0437\u0430 \u0438\u043D\u0441\u0442\u0430\u043B\u0430\u0446\u0438\u0458\u0430 (PDF)",
      contact: "\u041A\u043E\u043D\u0442\u0430\u043A\u0442",
      author: "\u0410\u0432\u0442\u043E\u0440",
      cooperation: "\u0421\u043E\u0440\u0430\u0431\u043E\u0442\u043A\u0430",
      reportBug: "\u041F\u0440\u0438\u0458\u0430\u0432\u0438 \u0433\u0440\u0435\u0448\u043A\u0430"
    }
  });

  // js/translations-about.js
  var ABOUT_I18N = Object.freeze({
    de: {
      title: "\u{1F4F1} \xDCber die App \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F Hinweis: Testversion",
      testWarningText: "Dies ist eine Testversion. Fehler und \xC4nderungen sind m\xF6glich. Bitte melden Sie Probleme \xFCber das Men\xFC.",
      purposeTitle: "\u{1F4CC} Zweck der App",
      purposeText: "Plattform, die Verbraucher mit lokalen Lebensmittelproduzenten in der Region Teutoburger Wald verbindet. Die App erm\xF6glicht die Entdeckung regionaler Produkte, Kontakt zu Produzenten und die Unterst\xFCtzung der lokalen Wirtschaft.",
      techTitle: "\u{1F6E0}\uFE0F Technologien",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Karte: Leaflet (OpenStreetMap)",
      techStorage: "Datenspeicherung: localStorage (Benutzerdaten)",
      techI18n: "Mehrsprachigkeit: 35 Sprachen",
      metaCreated: "\u{1F4C5} Erstellt: Juli 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (Beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} Autor",
      authorRole: "Konzept, Entwicklung und Wartung der App",
      contactTitle: "\u{1F4E7} Kontakt",
      downloadTitle: "\u{1F4F1} App herunterladen",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Laden Sie das Paket auf ein Android-Tablet (4.4+) herunter und installieren Sie es.",
      downloadApk: "\u{1F4F1} APK herunterladen",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Verkn\xFCpfung zum Home-Bildschirm in Safari hinzuf\xFCgen:",
      downloadPwaStep1: "\xD6ffnen Sie Safari und rufen Sie diese Seite auf.",
      downloadPwaStep2: "Tippen Sie auf Teilen \u2192 Zum Home-Bildschirm.",
      qrTitle: "\u{1F4F2} QR-Code",
      qrCaption: "Scannen und App herunterladen",
      qrLead: "Der Code f\xFChrt zum Download von Regionaler Geschmack auf diesem Ger\xE4t.",
      qrAlt: "QR-Code zum Herunterladen der App",
      cooperationTitle: "\u{1F91D} Zusammenarbeit",
      cooperationText: "Ich bin offen f\xFCr Vorschl\xE4ge und Partnerschaften mit Produzenten, Gesch\xE4ften und Restaurants.",
      cooperationInvite: "Wenn Sie der Plattform beitreten m\xF6chten \u2013 kontaktieren Sie uns!",
      cooperationContactTitle: "\u{1F4E7} Kontakt f\xFCr Zusammenarbeit und neue Projekte",
      cooperationContactText: "Schreiben Sie uns \u2013 wir freuen uns auf Ihre Ideen und Kooperationsangebote.",
      legalTitle: "\u26A0\uFE0F Rechtliche Hinweise",
      legal1: "Die App verbindet Nutzer mit Produzenten. Transaktionen erfolgen direkt zwischen Nutzern und Produzenten \u2013 Regionaler Geschmack ist nicht Vertragspartei.",
      legal2: "Inhalte (Produktbeschreibungen, Fotos) stammen von Produzenten \u2013 die App \xFCbernimmt keine Haftung f\xFCr deren Richtigkeit.",
      legal3: "Die App erhebt keine personenbezogenen Daten ohne Zustimmung \u2013 alle Daten werden lokal auf dem Ger\xE4t gespeichert.",
      legal4: "Die Karte nutzt OpenStreetMap-Daten \u2013 die App \xFCbernimmt keine Haftung f\xFCr die Genauigkeit geografischer Daten.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 Alle Rechte vorbehalten."
    },
    en: {
      title: "\u{1F4F1} About the app \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F Note: Beta version",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} Purpose",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F Technologies",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} Author",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} Contact",
      downloadTitle: "\u{1F4F1} Download the app",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} QR code",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} Cooperation",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F Legal disclaimers",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 All rights reserved."
    },
    pl: {
      title: "\u{1F4F1} O aplikacji \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F UWAGA: Wersja testowa",
      testWarningText: "To jest wersja testowa. Mo\u017Cliwe s\u0105 b\u0142\u0119dy i zmiany. Prosimy zg\u0142asza\u0107 problemy przez menu.",
      purposeTitle: "\u{1F4CC} Cel aplikacji",
      purposeText: "Platforma \u0142\u0105cz\u0105ca konsument\xF3w z lokalnymi producentami \u017Cywno\u015Bci w regionie Teutoburger Wald. Aplikacja umo\u017Cliwia odkrywanie regionalnych produkt\xF3w, kontakt z producentami oraz wspieranie lokalnej gospodarki.",
      techTitle: "\u{1F6E0}\uFE0F Technologie",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Mapa: Leaflet (OpenStreetMap)",
      techStorage: "Przechowywanie danych: localStorage (dane u\u017Cytkownika)",
      techI18n: "Wieloj\u0119zyczno\u015B\u0107: 35 j\u0119zyk\xF3w",
      metaCreated: "\u{1F4C5} Data powstania: lipiec 2026",
      metaVersion: "\u{1F4CC} Wersja: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} Autor",
      authorRole: "Koncepcja, rozw\xF3j i utrzymanie aplikacji",
      contactTitle: "\u{1F4E7} Kontakt",
      downloadTitle: "\u{1F4F1} Pobierz aplikacj\u0119",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Pobierz i zainstaluj pakiet na tablecie z Androidem 4.4+.",
      downloadApk: "\u{1F4F1} Pobierz APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Dodaj skr\xF3t do ekranu g\u0142\xF3wnego w Safari:",
      downloadPwaStep1: "Otw\xF3rz Safari i wejd\u017A na t\u0119 stron\u0119.",
      downloadPwaStep2: "Kliknij Udost\u0119pnij \u2192 Dodaj do ekranu pocz\u0105tkowego.",
      qrTitle: "\u{1F4F2} Kod QR",
      qrCaption: "Zeskanuj i pobierz aplikacj\u0119",
      qrLead: "Kod prowadzi do pobrania aplikacji Regionaler Geschmack na tym urz\u0105dzeniu.",
      qrAlt: "Kod QR do pobrania aplikacji",
      cooperationTitle: "\u{1F91D} Wsp\xF3\u0142praca",
      cooperationText: "Jestem otwarty na propozycje i partnerstwa z producentami, sklepami i restauracjami.",
      cooperationInvite: "Je\u015Bli chcesz do\u0142\u0105czy\u0107 do platformy \u2013 skontaktuj si\u0119 z nami!",
      cooperationContactTitle: "\u{1F4E7} Kontakt do wsp\xF3\u0142pracy i nowych projekt\xF3w",
      cooperationContactText: "Napisz do nas \u2013 ch\u0119tnie przyjmiemy Twoje pomys\u0142y i oferty wsp\xF3\u0142pracy.",
      legalTitle: "\u26A0\uFE0F Zastrze\u017Cenia prawne",
      legal1: "Aplikacja jest platform\u0105 \u0142\u0105cz\u0105c\u0105 u\u017Cytkownik\xF3w z producentami. Transakcje odbywaj\u0105 si\u0119 bezpo\u015Brednio mi\u0119dzy u\u017Cytkownikami a producentami \u2013 Regionaler Geschmack nie jest stron\u0105 w tych transakcjach.",
      legal2: "Tre\u015Bci (opisy produkt\xF3w, zdj\u0119cia) pochodz\u0105 od producent\xF3w \u2013 aplikacja nie ponosi odpowiedzialno\u015Bci za ich prawdziwo\u015B\u0107.",
      legal3: "Aplikacja nie gromadzi danych osobowych bez zgody u\u017Cytkownika \u2013 wszelkie dane przechowywane s\u0105 lokalnie na urz\u0105dzeniu u\u017Cytkownika.",
      legal4: "Mapa korzysta z danych OpenStreetMap \u2013 aplikacja nie ponosi odpowiedzialno\u015Bci za dok\u0142adno\u015B\u0107 danych geograficznych.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 Wszelkie prawa zastrze\u017Cone."
    },
    ru: {
      title: "\u{1F4F1} \u041E \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0438 \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F \u0412\u043D\u0438\u043C\u0430\u043D\u0438\u0435: \u0442\u0435\u0441\u0442\u043E\u0432\u0430\u044F \u0432\u0435\u0440\u0441\u0438\u044F",
      testWarningText: "\u042D\u0442\u043E \u0442\u0435\u0441\u0442\u043E\u0432\u0430\u044F \u0432\u0435\u0440\u0441\u0438\u044F. \u0412\u043E\u0437\u043C\u043E\u0436\u043D\u044B \u043E\u0448\u0438\u0431\u043A\u0438 \u0438 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F. \u0421\u043E\u043E\u0431\u0449\u0430\u0439\u0442\u0435 \u043E \u043F\u0440\u043E\u0431\u043B\u0435\u043C\u0430\u0445 \u0447\u0435\u0440\u0435\u0437 \u043C\u0435\u043D\u044E.",
      purposeTitle: "\u{1F4CC} \u0426\u0435\u043B\u044C \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u044F",
      purposeText: "\u041F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430, \u0441\u0432\u044F\u0437\u044B\u0432\u0430\u044E\u0449\u0430\u044F \u043F\u043E\u0442\u0440\u0435\u0431\u0438\u0442\u0435\u043B\u0435\u0439 \u0441 \u043C\u0435\u0441\u0442\u043D\u044B\u043C\u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F\u043C\u0438 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u043E\u0432 \u0432 \u0440\u0435\u0433\u0438\u043E\u043D\u0435 \u0422\u0435\u0432\u0442\u043E\u0431\u0443\u0440\u0433\u0441\u043A\u0438\u0439 \u043B\u0435\u0441.",
      techTitle: "\u{1F6E0}\uFE0F \u0422\u0435\u0445\u043D\u043E\u043B\u043E\u0433\u0438\u0438",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "\u041A\u0430\u0440\u0442\u0430: Leaflet (OpenStreetMap)",
      techStorage: "\u0425\u0440\u0430\u043D\u0435\u043D\u0438\u0435: localStorage (\u0434\u0430\u043D\u043D\u044B\u0435 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F)",
      techI18n: "\u041C\u043D\u043E\u0433\u043E\u044F\u0437\u044B\u0447\u043D\u043E\u0441\u0442\u044C: 35 \u044F\u0437\u044B\u043A\u043E\u0432",
      metaCreated: "\u{1F4C5} \u0421\u043E\u0437\u0434\u0430\u043D\u043E: \u0438\u044E\u043B\u044C 2026",
      metaVersion: "\u{1F4CC} \u0412\u0435\u0440\u0441\u0438\u044F: v2.0 (\u0431\u0435\u0442\u0430)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} \u0410\u0432\u0442\u043E\u0440",
      authorRole: "\u041A\u043E\u043D\u0446\u0435\u043F\u0446\u0438\u044F, \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0438 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0430 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u044F",
      contactTitle: "\u{1F4E7} \u041A\u043E\u043D\u0442\u0430\u043A\u0442",
      downloadTitle: "\u{1F4F1} \u0421\u043A\u0430\u0447\u0430\u0442\u044C \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "\u0421\u043A\u0430\u0447\u0430\u0439\u0442\u0435 \u0438 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0435 \u043F\u0430\u043A\u0435\u0442 \u043D\u0430 \u043F\u043B\u0430\u043D\u0448\u0435\u0442 Android 4.4+.",
      downloadApk: "\u{1F4F1} \u0421\u043A\u0430\u0447\u0430\u0442\u044C APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "\u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u044F\u0440\u043B\u044B\u043A \u043D\u0430 \u0433\u043B\u0430\u0432\u043D\u044B\u0439 \u044D\u043A\u0440\u0430\u043D \u0432 Safari:",
      downloadPwaStep1: "\u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 Safari \u0438 \u043F\u0435\u0440\u0435\u0439\u0434\u0438\u0442\u0435 \u043D\u0430 \u044D\u0442\u0443 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443.",
      downloadPwaStep2: "\u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u041F\u043E\u0434\u0435\u043B\u0438\u0442\u044C\u0441\u044F \u2192 \u041D\u0430 \u044D\u043A\u0440\u0430\u043D \xAB\u0414\u043E\u043C\u043E\u0439\xBB.",
      qrTitle: "\u{1F4F2} QR-\u043A\u043E\u0434",
      qrCaption: "\u0421\u043A\u0430\u043D\u0438\u0440\u0443\u0439\u0442\u0435 \u0438 \u0441\u043A\u0430\u0447\u0430\u0439\u0442\u0435 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435",
      qrLead: "\u041A\u043E\u0434 \u0432\u0435\u0434\u0451\u0442 \u043A \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0435 Regionaler Geschmack \u043D\u0430 \u044D\u0442\u043E\u043C \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0435.",
      qrAlt: "QR-\u043A\u043E\u0434 \u0434\u043B\u044F \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u044F",
      cooperationTitle: "\u{1F91D} \u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u0447\u0435\u0441\u0442\u0432\u043E",
      cooperationText: "\u041E\u0442\u043A\u0440\u044B\u0442 \u0434\u043B\u044F \u043F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u0439 \u0438 \u043F\u0430\u0440\u0442\u043D\u0451\u0440\u0441\u0442\u0432\u0430 \u0441 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F\u043C\u0438, \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0430\u043C\u0438 \u0438 \u0440\u0435\u0441\u0442\u043E\u0440\u0430\u043D\u0430\u043C\u0438.",
      cooperationInvite: "\u0425\u043E\u0442\u0438\u0442\u0435 \u043F\u0440\u0438\u0441\u043E\u0435\u0434\u0438\u043D\u0438\u0442\u044C\u0441\u044F \u043A \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0435 \u2013 \u0441\u0432\u044F\u0436\u0438\u0442\u0435\u0441\u044C \u0441 \u043D\u0430\u043C\u0438!",
      cooperationContactTitle: "\u{1F4E7} \u041A\u043E\u043D\u0442\u0430\u043A\u0442 \u0434\u043B\u044F \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u0447\u0435\u0441\u0442\u0432\u0430 \u0438 \u043D\u043E\u0432\u044B\u0445 \u043F\u0440\u043E\u0435\u043A\u0442\u043E\u0432",
      cooperationContactText: "\u041D\u0430\u043F\u0438\u0448\u0438\u0442\u0435 \u043D\u0430\u043C \u2013 \u043C\u044B \u0436\u0434\u0451\u043C \u0432\u0430\u0448\u0438 \u0438\u0434\u0435\u0438 \u0438 \u043F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u044F \u043E \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u0447\u0435\u0441\u0442\u0432\u0435.",
      legalTitle: "\u26A0\uFE0F \u041F\u0440\u0430\u0432\u043E\u0432\u044B\u0435 \u043E\u0433\u043E\u0432\u043E\u0440\u043A\u0438",
      legal1: "\u041F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0441\u0432\u044F\u0437\u044B\u0432\u0430\u0435\u0442 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439 \u0441 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F\u043C\u0438. \u0421\u0434\u0435\u043B\u043A\u0438 \u043F\u0440\u043E\u0438\u0441\u0445\u043E\u0434\u044F\u0442 \u043D\u0430\u043F\u0440\u044F\u043C\u0443\u044E \u2013 Regionaler Geschmack \u043D\u0435 \u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u0441\u0442\u043E\u0440\u043E\u043D\u043E\u0439.",
      legal2: "\u041A\u043E\u043D\u0442\u0435\u043D\u0442 (\u043E\u043F\u0438\u0441\u0430\u043D\u0438\u044F, \u0444\u043E\u0442\u043E) \u043E\u0442 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0435\u0439 \u2013 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u043D\u0435 \u043E\u0442\u0432\u0435\u0447\u0430\u0435\u0442 \u0437\u0430 \u0434\u043E\u0441\u0442\u043E\u0432\u0435\u0440\u043D\u043E\u0441\u0442\u044C.",
      legal3: "\u041F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u043D\u0435 \u0441\u043E\u0431\u0438\u0440\u0430\u0435\u0442 \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435 \u0431\u0435\u0437 \u0441\u043E\u0433\u043B\u0430\u0441\u0438\u044F \u2013 \u0434\u0430\u043D\u043D\u044B\u0435 \u0445\u0440\u0430\u043D\u044F\u0442\u0441\u044F \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u043E \u043D\u0430 \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0435.",
      legal4: "\u041A\u0430\u0440\u0442\u0430 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442 OpenStreetMap \u2013 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u043D\u0435 \u043E\u0442\u0432\u0435\u0447\u0430\u0435\u0442 \u0437\u0430 \u0442\u043E\u0447\u043D\u043E\u0441\u0442\u044C \u0433\u0435\u043E\u0433\u0440\u0430\u0444\u0438\u0447\u0435\u0441\u043A\u0438\u0445 \u0434\u0430\u043D\u043D\u044B\u0445.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 \u0412\u0441\u0435 \u043F\u0440\u0430\u0432\u0430 \u0437\u0430\u0449\u0438\u0449\u0435\u043D\u044B."
    },
    tr: {
      title: "\u{1F4F1} Uygulama hakk\u0131nda \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F Dikkat: Test s\xFCr\xFCm\xFC",
      testWarningText: "Bu bir test s\xFCr\xFCm\xFCd\xFCr. Hatalar ve de\u011Fi\u015Fiklikler olabilir. L\xFCtfen men\xFCden bildirin.",
      purposeTitle: "\u{1F4CC} Uygulaman\u0131n amac\u0131",
      purposeText: "Teutoburger Wald b\xF6lgesinde t\xFCketicileri yerel g\u0131da \xFCreticileriyle bulu\u015Fturan platform.",
      techTitle: "\u{1F6E0}\uFE0F Teknolojiler",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Harita: Leaflet (OpenStreetMap)",
      techStorage: "Depolama: localStorage (kullan\u0131c\u0131 verileri)",
      techI18n: "\xC7ok dilli: 35 dil",
      metaCreated: "\u{1F4C5} Olu\u015Fturulma: Temmuz 2026",
      metaVersion: "\u{1F4CC} S\xFCr\xFCm: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} Yazar",
      authorRole: "Uygulaman\u0131n konsepti, geli\u015Ftirme ve bak\u0131m\u0131",
      contactTitle: "\u{1F4E7} \u0130leti\u015Fim",
      downloadTitle: "\u{1F4F1} Uygulamay\u0131 indir",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Android 4.4+ tablete paketi indirip kurun.",
      downloadApk: "\u{1F4F1} APK indir",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Safari'de ana ekrana k\u0131sayol ekleyin:",
      downloadPwaStep1: "Safari'yi a\xE7\u0131n ve bu sayfay\u0131 ziyaret edin.",
      downloadPwaStep2: "Payla\u015F \u2192 Ana Ekrana Ekle'ye dokunun.",
      qrTitle: "\u{1F4F2} QR kod",
      qrCaption: "Taray\u0131n ve uygulamay\u0131 indirin",
      qrLead: "Kod bu cihazda Regionaler Geschmack indirmesine y\xF6nlendirir.",
      qrAlt: "Uygulama indirme QR kodu",
      cooperationTitle: "\u{1F91D} \u0130\u015F birli\u011Fi",
      cooperationText: "\xDCreticiler, ma\u011Fazalar ve restoranlarla \xF6nerilere ve ortakl\u0131klara a\xE7\u0131\u011F\u0131m.",
      cooperationInvite: "Platforma kat\u0131lmak istiyorsan\u0131z \u2013 bize ula\u015F\u0131n!",
      cooperationContactTitle: "\u{1F4E7} \u0130\u015F birli\u011Fi ve yeni projeler i\xE7in ileti\u015Fim",
      cooperationContactText: "Bize yaz\u0131n \u2013 fikirlerinizi ve i\u015F birli\u011Fi tekliflerinizi bekliyoruz.",
      legalTitle: "\u26A0\uFE0F Yasal uyar\u0131lar",
      legal1: "Uygulama kullan\u0131c\u0131lar\u0131 \xFCreticilerle bulu\u015Fturur. \u0130\u015Flemler do\u011Frudan yap\u0131l\u0131r \u2013 Regionaler Geschmack taraf de\u011Fildir.",
      legal2: "\u0130\xE7erik \xFCreticilerden gelir \u2013 uygulama do\u011Fruluktan sorumlu de\u011Fildir.",
      legal3: "Uygulama onay olmadan ki\u015Fisel veri toplamaz \u2013 veriler cihazda yerel saklan\u0131r.",
      legal4: "Harita OpenStreetMap kullan\u0131r \u2013 co\u011Frafi do\u011Fruluk garanti edilmez.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 T\xFCm haklar\u0131 sakl\u0131d\u0131r."
    },
    fr: {
      title: "\u{1F4F1} \xC0 propos \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F Attention : version test",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} Objectif",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F Technologies",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} Auteur",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} Contact",
      downloadTitle: "\u{1F4F1} T\xE9l\xE9charger l'app",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} Code QR",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} Coop\xE9ration",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F Mentions l\xE9gales",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 Tous droits r\xE9serv\xE9s."
    },
    es: {
      title: "\u{1F4F1} Sobre la app \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F Atenci\xF3n: versi\xF3n de prueba",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} Prop\xF3sito",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F Tecnolog\xEDas",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} Autor",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} Contacto",
      downloadTitle: "\u{1F4F1} Descargar app",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} C\xF3digo QR",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} Cooperaci\xF3n",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F Avisos legales",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 Todos los derechos reservados."
    },
    it: {
      title: "\u{1F4F1} Informazioni \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F Attenzione: versione beta",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} Scopo",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F Tecnologie",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} Autore",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} Contatto",
      downloadTitle: "\u{1F4F1} Scarica app",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} Codice QR",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} Collaborazione",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F Note legali",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 Tutti i diritti riservati."
    },
    nl: {
      title: "\u{1F4F1} Over de app \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F Let op: testversie",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} Doel",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F Technologie\xEBn",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} Auteur",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} Contact",
      downloadTitle: "\u{1F4F1} App downloaden",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} QR-code",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} Samenwerking",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F Juridische kennisgeving",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 Alle rechten voorbehouden."
    },
    cs: {
      title: "\u{1F4F1} O aplikaci \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F Pozor: testovac\xED verze",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} \xDA\u010Del",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F Technologie",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} Autor",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} Kontakt",
      downloadTitle: "\u{1F4F1} St\xE1hnout aplikaci",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} QR k\xF3d",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} Spolupr\xE1ce",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F Pr\xE1vn\xED upozorn\u011Bn\xED",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 V\u0161echna pr\xE1va vyhrazena."
    },
    sk: {
      title: "\u{1F4F1} O aplik\xE1cii \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F Pozor: testovacia verzia",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} \xDA\u010Del",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F Technol\xF3gie",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} Autor",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} Kontakt",
      downloadTitle: "\u{1F4F1} Stiahnu\u0165 aplik\xE1ciu",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} QR k\xF3d",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} Spolupr\xE1ca",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F Pr\xE1vne upozornenia",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 V\u0161etky pr\xE1va vyhraden\xE9."
    },
    hu: {
      title: "\u{1F4F1} Az alkalmaz\xE1sr\xF3l \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F Figyelem: tesztverzi\xF3",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} C\xE9l",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F Technol\xF3gi\xE1k",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} Szerz\u0151",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} Kapcsolat",
      downloadTitle: "\u{1F4F1} Alkalmaz\xE1s let\xF6lt\xE9se",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} QR-k\xF3d",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} Egy\xFCttm\u0171k\xF6d\xE9s",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F Jogi nyilatkozatok",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 Minden jog fenntartva."
    },
    ro: {
      title: "\u{1F4F1} Despre aplica\u021Bie \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F Aten\u021Bie: versiune beta",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} Scop",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F Tehnologii",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} Autor",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} Contact",
      downloadTitle: "\u{1F4F1} Descarc\u0103 aplica\u021Bia",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} Cod QR",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} Colaborare",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F Men\u021Biuni legale",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 Toate drepturile rezervate."
    },
    bg: {
      title: "\u{1F4F1} \u0417\u0430 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435\u0442\u043E \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F \u0412\u043D\u0438\u043C\u0430\u043D\u0438\u0435: \u0442\u0435\u0441\u0442\u043E\u0432\u0430 \u0432\u0435\u0440\u0441\u0438\u044F",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} \u0426\u0435\u043B",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F \u0422\u0435\u0445\u043D\u043E\u043B\u043E\u0433\u0438\u0438",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} \u0410\u0432\u0442\u043E\u0440",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} \u041A\u043E\u043D\u0442\u0430\u043A\u0442",
      downloadTitle: "\u{1F4F1} \u0418\u0437\u0442\u0435\u0433\u043B\u0438 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435\u0442\u043E",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} QR \u043A\u043E\u0434",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} \u0421\u044A\u0442\u0440\u0443\u0434\u043D\u0438\u0447\u0435\u0441\u0442\u0432\u043E",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F \u041F\u0440\u0430\u0432\u043D\u0438 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 \u0412\u0441\u0438\u0447\u043A\u0438 \u043F\u0440\u0430\u0432\u0430 \u0437\u0430\u043F\u0430\u0437\u0435\u043D\u0438."
    },
    el: {
      title: "\u{1F4F1} \u03A3\u03C7\u03B5\u03C4\u03B9\u03BA\u03AC \u03BC\u03B5 \u03C4\u03B7\u03BD \u03B5\u03C6\u03B1\u03C1\u03BC\u03BF\u03B3\u03AE \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F \u03A0\u03C1\u03BF\u03C3\u03BF\u03C7\u03AE: \u03B4\u03BF\u03BA\u03B9\u03BC\u03B1\u03C3\u03C4\u03B9\u03BA\u03AE \u03AD\u03BA\u03B4\u03BF\u03C3\u03B7",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} \u03A3\u03BA\u03BF\u03C0\u03CC\u03C2",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F \u03A4\u03B5\u03C7\u03BD\u03BF\u03BB\u03BF\u03B3\u03AF\u03B5\u03C2",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} \u03A3\u03C5\u03B3\u03B3\u03C1\u03B1\u03C6\u03AD\u03B1\u03C2",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} \u0395\u03C0\u03B9\u03BA\u03BF\u03B9\u03BD\u03C9\u03BD\u03AF\u03B1",
      downloadTitle: "\u{1F4F1} \u039B\u03AE\u03C8\u03B7 \u03B5\u03C6\u03B1\u03C1\u03BC\u03BF\u03B3\u03AE\u03C2",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} \u039A\u03C9\u03B4\u03B9\u03BA\u03CC\u03C2 QR",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} \u03A3\u03C5\u03BD\u03B5\u03C1\u03B3\u03B1\u03C3\u03AF\u03B1",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F \u039D\u03BF\u03BC\u03B9\u03BA\u03AD\u03C2 \u03B1\u03C0\u03BF\u03C0\u03BF\u03B9\u03AE\u03C3\u03B5\u03B9\u03C2",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 \u039C\u03B5 \u03B5\u03C0\u03B9\u03C6\u03CD\u03BB\u03B1\u03BE\u03B7 \u03C0\u03B1\u03BD\u03C4\u03CC\u03C2 \u03B4\u03B9\u03BA\u03B1\u03B9\u03CE\u03BC\u03B1\u03C4\u03BF\u03C2."
    },
    hr: {
      title: "\u{1F4F1} O aplikaciji \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F Pa\u017Enja: testna verzija",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} Svrha",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F Tehnologije",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} Autor",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} Kontakt",
      downloadTitle: "\u{1F4F1} Preuzmi aplikaciju",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} QR kod",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} Suradnja",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F Pravne napomene",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 Sva prava pridr\u017Eana."
    },
    sr: {
      title: "\u{1F4F1} \u041E \u0430\u043F\u043B\u0438\u043A\u0430\u0446\u0438\u0458\u0438 \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F \u041F\u0430\u0436\u045A\u0430: \u0442\u0435\u0441\u0442 \u0432\u0435\u0440\u0437\u0438\u0458\u0430",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} \u0421\u0432\u0440\u0445\u0430",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F \u0422\u0435\u0445\u043D\u043E\u043B\u043E\u0433\u0438\u0458\u0435",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} \u0410\u0443\u0442\u043E\u0440",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} \u041A\u043E\u043D\u0442\u0430\u043A\u0442",
      downloadTitle: "\u{1F4F1} \u041F\u0440\u0435\u0443\u0437\u043C\u0438 \u0430\u043F\u043B\u0438\u043A\u0430\u0446\u0438\u0458\u0443",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} QR \u043A\u043E\u0434",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} \u0421\u0430\u0440\u0430\u0434\u045A\u0430",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F \u041F\u0440\u0430\u0432\u043D\u0430 \u043E\u0431\u0430\u0432\u0435\u0448\u0442\u0435\u045A\u0430",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 \u0421\u0432\u0430 \u043F\u0440\u0430\u0432\u0430 \u0437\u0430\u0434\u0440\u0436\u0430\u043D\u0430."
    },
    sl: {
      title: "\u{1F4F1} O aplikaciji \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F Pozor: testna razli\u010Dica",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} Namen",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F Tehnologije",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} Avtor",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} Kontakt",
      downloadTitle: "\u{1F4F1} Prenesi aplikacijo",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} QR koda",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} Sodelovanje",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F Pravna opozorila",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 Vse pravice pridr\u017Eane."
    },
    lt: {
      title: "\u{1F4F1} Apie program\u0117l\u0119 \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F D\u0117mesio: bandomoji versija",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} Tikslas",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F Technologijos",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} Autorius",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} Kontaktas",
      downloadTitle: "\u{1F4F1} Atsisi\u0173sti program\u0117l\u0119",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} QR kodas",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} Bendradarbiavimas",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F Teisiniai \u012Fsp\u0117jimai",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 Visos teis\u0117s saugomos."
    },
    lv: {
      title: "\u{1F4F1} Par lietotni \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F Uzman\u012Bbu: testa versija",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} M\u0113r\u0137is",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F Tehnolo\u0123ijas",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} Autors",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} Kontakts",
      downloadTitle: "\u{1F4F1} Lejupiel\u0101d\u0113t lietotni",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} QR kods",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} Sadarb\u012Bba",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F Juridiskie br\u012Bdin\u0101jumi",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 Visas ties\u012Bbas aizsarg\u0101tas."
    },
    et: {
      title: "\u{1F4F1} Rakenduse kohta \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F T\xE4helepanu: testversioon",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} Eesm\xE4rk",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F Tehnoloogiad",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} Autor",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} Kontakt",
      downloadTitle: "\u{1F4F1} Laadi rakendus alla",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} QR-kood",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} Koost\xF6\xF6",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F \xD5iguslikud teated",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 K\xF5ik \xF5igused kaitstud."
    },
    fi: {
      title: "\u{1F4F1} Tietoja sovelluksesta \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F Huomio: testiversio",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} Tarkoitus",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F Teknologiat",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} Tekij\xE4",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} Yhteystiedot",
      downloadTitle: "\u{1F4F1} Lataa sovellus",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} QR-koodi",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} Yhteisty\xF6",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F Oikeudelliset huomautukset",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 Kaikki oikeudet pid\xE4tet\xE4\xE4n."
    },
    sv: {
      title: "\u{1F4F1} Om appen \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F Obs: testversion",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} Syfte",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F Teknik",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} F\xF6rfattare",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} Kontakt",
      downloadTitle: "\u{1F4F1} Ladda ner appen",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} QR-kod",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} Samarbete",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F Juridiska meddelanden",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 Alla r\xE4ttigheter f\xF6rbeh\xE5llna."
    },
    no: {
      title: "\u{1F4F1} Om appen \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F Merk: testversjon",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} Form\xE5l",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F Teknologi",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} Forfatter",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} Kontakt",
      downloadTitle: "\u{1F4F1} Last ned appen",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} QR-kode",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} Samarbeid",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F Juridiske merknader",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 Alle rettigheter forbeholdt."
    },
    da: {
      title: "\u{1F4F1} Om appen \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F Bem\xE6rk: testversion",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} Form\xE5l",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F Teknologier",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} Forfatter",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} Kontakt",
      downloadTitle: "\u{1F4F1} Download appen",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} QR-kode",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} Samarbejde",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F Juridiske bem\xE6rkninger",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 Alle rettigheder forbeholdes."
    },
    is: {
      title: "\u{1F4F1} Um forriti\xF0 \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F Athugi\xF0: pr\xF3funar\xFAtg\xE1fa",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} Tilgangur",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F T\xE6kni",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} H\xF6fundur",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} Samband",
      downloadTitle: "\u{1F4F1} S\xE6kja forriti\xF0",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} QR-k\xF3\xF0i",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} Samstarf",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F Lagalegar athugasemdir",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 \xD6ll r\xE9ttindi \xE1skilin."
    },
    zh: {
      title: "\u{1F4F1} \u5173\u4E8E\u5E94\u7528 \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F \u6CE8\u610F\uFF1A\u6D4B\u8BD5\u7248",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} \u5E94\u7528\u76EE\u7684",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F \u6280\u672F",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} \u4F5C\u8005",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} \u8054\u7CFB",
      downloadTitle: "\u{1F4F1} \u4E0B\u8F7D\u5E94\u7528",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} \u4E8C\u7EF4\u7801",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} \u5408\u4F5C",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F \u6CD5\u5F8B\u58F0\u660E",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 \u7248\u6743\u6240\u6709\u3002"
    },
    "zh-tw": {
      title: "\u{1F4F1} \u95DC\u65BC\u61C9\u7528 \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F \u6CE8\u610F\uFF1A\u6E2C\u8A66\u7248",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} \u61C9\u7528\u76EE\u7684",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F \u6280\u8853",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} \u4F5C\u8005",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} \u806F\u7D61",
      downloadTitle: "\u{1F4F1} \u4E0B\u8F09\u61C9\u7528",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} QR \u78BC",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} \u5408\u4F5C",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F \u6CD5\u5F8B\u8072\u660E",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 \u7248\u6B0A\u6240\u6709\u3002"
    },
    ja: {
      title: "\u{1F4F1} \u30A2\u30D7\u30EA\u306B\u3064\u3044\u3066 \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F \u6CE8\u610F\uFF1A\u30C6\u30B9\u30C8\u7248",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} \u76EE\u7684",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F \u6280\u8853",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} \u4F5C\u8005",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} \u9023\u7D61\u5148",
      downloadTitle: "\u{1F4F1} \u30A2\u30D7\u30EA\u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} QR\u30B3\u30FC\u30C9",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} \u5354\u529B",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F \u6CD5\u7684\u514D\u8CAC\u4E8B\u9805",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 \u5168\u8457\u4F5C\u6A29\u6240\u6709\u3002"
    },
    ko: {
      title: "\u{1F4F1} \uC571 \uC815\uBCF4 \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F \uC8FC\uC758: \uD14C\uC2A4\uD2B8 \uBC84\uC804",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} \uBAA9\uC801",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F \uAE30\uC220",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} \uC791\uC131\uC790",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} \uC5F0\uB77D\uCC98",
      downloadTitle: "\u{1F4F1} \uC571 \uB2E4\uC6B4\uB85C\uB4DC",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} QR \uCF54\uB4DC",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} \uD611\uB825",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F \uBC95\uC801 \uACE0\uC9C0",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 \uBAA8\uB4E0 \uAD8C\uB9AC \uBCF4\uC720."
    },
    vi: {
      title: "\u{1F4F1} Gi\u1EDBi thi\u1EC7u \u1EE9ng d\u1EE5ng \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F L\u01B0u \xFD: phi\xEAn b\u1EA3n th\u1EED nghi\u1EC7m",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} M\u1EE5c \u0111\xEDch",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F C\xF4ng ngh\u1EC7",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} T\xE1c gi\u1EA3",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} Li\xEAn h\u1EC7",
      downloadTitle: "\u{1F4F1} T\u1EA3i \u1EE9ng d\u1EE5ng",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} M\xE3 QR",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} H\u1EE3p t\xE1c",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F Tuy\xEAn b\u1ED1 ph\xE1p l\xFD",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 B\u1EA3o l\u01B0u m\u1ECDi quy\u1EC1n."
    },
    ms: {
      title: "\u{1F4F1} Perihal aplikasi \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F Perhatian: versi ujian",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} Tujuan",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F Teknologi",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} Pengarang",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} Hubungi",
      downloadTitle: "\u{1F4F1} Muat turun aplikasi",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} Kod QR",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} Kerjasama",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F Penafian undang-undang",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 Hak cipta terpelihara."
    },
    id: {
      title: "\u{1F4F1} Tentang aplikasi \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F Perhatian: versi uji",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} Tujuan",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F Teknologi",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} Penulis",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} Kontak",
      downloadTitle: "\u{1F4F1} Unduh aplikasi",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} Kode QR",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} Kerja sama",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F Pernyataan hukum",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 Hak cipta dilindungi."
    },
    th: {
      title: "\u{1F4F1} \u0E40\u0E01\u0E35\u0E48\u0E22\u0E27\u0E01\u0E31\u0E1A\u0E41\u0E2D\u0E1B \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F \u0E04\u0E33\u0E40\u0E15\u0E37\u0E2D\u0E19: \u0E40\u0E27\u0E2D\u0E23\u0E4C\u0E0A\u0E31\u0E19\u0E17\u0E14\u0E2A\u0E2D\u0E1A",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} \u0E27\u0E31\u0E15\u0E16\u0E38\u0E1B\u0E23\u0E30\u0E2A\u0E07\u0E04\u0E4C",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F \u0E40\u0E17\u0E04\u0E42\u0E19\u0E42\u0E25\u0E22\u0E35",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} \u0E1C\u0E39\u0E49\u0E40\u0E02\u0E35\u0E22\u0E19",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} \u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D",
      downloadTitle: "\u{1F4F1} \u0E14\u0E32\u0E27\u0E19\u0E4C\u0E42\u0E2B\u0E25\u0E14\u0E41\u0E2D\u0E1B",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} \u0E23\u0E2B\u0E31\u0E2A QR",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} \u0E04\u0E27\u0E32\u0E21\u0E23\u0E48\u0E27\u0E21\u0E21\u0E37\u0E2D",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F \u0E02\u0E49\u0E2D\u0E08\u0E33\u0E01\u0E31\u0E14\u0E17\u0E32\u0E07\u0E01\u0E0E\u0E2B\u0E21\u0E32\u0E22",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 \u0E2A\u0E07\u0E27\u0E19\u0E25\u0E34\u0E02\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C"
    },
    hi: {
      title: "\u{1F4F1} \u0910\u092A \u0915\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902 \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F \u0927\u094D\u092F\u093E\u0928 \u0926\u0947\u0902: \u092C\u0940\u091F\u093E \u0938\u0902\u0938\u094D\u0915\u0930\u0923",
      testWarningText: "This is a beta version. Bugs and changes are possible. Please report issues via the menu.",
      purposeTitle: "\u{1F4CC} \u0909\u0926\u094D\u0926\u0947\u0936\u094D\u092F",
      purposeText: "A platform connecting consumers with local food producers in the Teutoburger Wald region. The app helps discover regional products, contact producers, and support the local economy.",
      techTitle: "\u{1F6E0}\uFE0F \u0924\u0915\u0928\u0940\u0915",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "Map: Leaflet (OpenStreetMap)",
      techStorage: "Storage: localStorage (user data)",
      techI18n: "Multilingual: 35 languages",
      metaCreated: "\u{1F4C5} Created: July 2026",
      metaVersion: "\u{1F4CC} Version: v2.0 (beta)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} \u0932\u0947\u0916\u0915",
      authorRole: "Concept, development and maintenance of the app",
      contactTitle: "\u{1F4E7} \u0938\u0902\u092A\u0930\u094D\u0915",
      downloadTitle: "\u{1F4F1} \u0910\u092A \u0921\u093E\u0909\u0928\u0932\u094B\u0921 \u0915\u0930\u0947\u0902",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "Download and install the package on an Android tablet (4.4+).",
      downloadApk: "\u{1F4F1} Download APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "Add a shortcut to the home screen in Safari:",
      downloadPwaStep1: "Open Safari and visit this page.",
      downloadPwaStep2: "Tap Share \u2192 Add to Home Screen.",
      qrTitle: "\u{1F4F2} QR \u0915\u094B\u0921",
      qrCaption: "Scan and download the app",
      qrLead: "The code leads to downloading Regionaler Geschmack on this device.",
      qrAlt: "QR code to download the app",
      cooperationTitle: "\u{1F91D} \u0938\u0939\u092F\u094B\u0917",
      cooperationText: "I am open to proposals and partnerships with producers, shops and restaurants.",
      cooperationInvite: "If you want to join the platform \u2013 contact us!",
      cooperationContactTitle: "\u{1F4E7} Contact for cooperation and new projects",
      cooperationContactText: "Write to us \u2013 we welcome your ideas and partnership offers.",
      legalTitle: "\u26A0\uFE0F \u0915\u093E\u0928\u0942\u0928\u0940 \u0905\u0938\u094D\u0935\u0940\u0915\u0930\u0923",
      legal1: "The app connects users with producers. Transactions take place directly between users and producers \u2013 Regionaler Geschmack is not a party to these transactions.",
      legal2: "Content (product descriptions, photos) comes from producers \u2013 the app is not responsible for its accuracy.",
      legal3: "The app does not collect personal data without user consent \u2013 all data is stored locally on the device.",
      legal4: "The map uses OpenStreetMap data \u2013 the app is not responsible for the accuracy of geographic data.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 \u0938\u0930\u094D\u0935\u093E\u0927\u093F\u0915\u093E\u0930 \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924\u0964"
    },
    mk: {
      title: "\u{1F4F1} \u0417\u0430 \u0430\u043F\u043B\u0438\u043A\u0430\u0446\u0438\u0458\u0430\u0442\u0430 \u2013 Regionaler Geschmack",
      testWarningTitle: "\u26A0\uFE0F \u0412\u043D\u0438\u043C\u0430\u043D\u0438\u0435: \u0442\u0435\u0441\u0442 \u0432\u0435\u0440\u0437\u0438\u0458\u0430",
      testWarningText: "\u041E\u0432\u0430 \u0435 \u0442\u0435\u0441\u0442 \u0432\u0435\u0440\u0437\u0438\u0458\u0430. \u041C\u043E\u0436\u043D\u0438 \u0441\u0435 \u0433\u0440\u0435\u0448\u043A\u0438 \u0438 \u043F\u0440\u043E\u043C\u0435\u043D\u0438. \u0412\u0435 \u043C\u043E\u043B\u0438\u043C\u0435 \u043F\u0440\u0438\u0458\u0430\u0432\u0435\u0442\u0435 \u043F\u0440\u043E\u0431\u043B\u0435\u043C\u0438 \u043F\u0440\u0435\u043A\u0443 \u043C\u0435\u043D\u0438\u0442\u043E.",
      purposeTitle: "\u{1F4CC} \u0426\u0435\u043B \u043D\u0430 \u0430\u043F\u043B\u0438\u043A\u0430\u0446\u0438\u0458\u0430\u0442\u0430",
      purposeText: "\u041F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430 \u0448\u0442\u043E \u0433\u0438 \u043F\u043E\u0432\u0440\u0437\u0443\u0432\u0430 \u043F\u043E\u0442\u0440\u043E\u0448\u0443\u0432\u0430\u0447\u0438\u0442\u0435 \u0441\u043E \u043B\u043E\u043A\u0430\u043B\u043D\u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0438 \u043D\u0430 \u0445\u0440\u0430\u043D\u0430 \u0432\u043E \u0440\u0435\u0433\u0438\u043E\u043D\u043E\u0442 \u0422\u0435\u0443\u0442\u043E\u0431\u0443\u0440\u0448\u043A\u0430 \u0448\u0443\u043C\u0430. \u0410\u043F\u043B\u0438\u043A\u0430\u0446\u0438\u0458\u0430\u0442\u0430 \u043E\u0432\u043E\u0437\u043C\u043E\u0436\u0443\u0432\u0430 \u043E\u0442\u043A\u0440\u0438\u0432\u0430\u045A\u0435 \u0440\u0435\u0433\u0438\u043E\u043D\u0430\u043B\u043D\u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438, \u043A\u043E\u043D\u0442\u0430\u043A\u0442 \u0441\u043E \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0438 \u0438 \u043F\u043E\u0434\u0434\u0440\u0448\u043A\u0430 \u043D\u0430 \u043B\u043E\u043A\u0430\u043B\u043D\u0430\u0442\u0430 \u0435\u043A\u043E\u043D\u043E\u043C\u0438\u0458\u0430.",
      techTitle: "\u{1F6E0}\uFE0F \u0422\u0435\u0445\u043D\u043E\u043B\u043E\u0433\u0438\u0438",
      techFrontend: "Frontend: HTML5, CSS3, JavaScript (ES Modules)",
      techMap: "\u041C\u0430\u043F\u0430: Leaflet (OpenStreetMap)",
      techStorage: "\u0421\u043A\u043B\u0430\u0434\u0438\u0440\u0430\u045A\u0435: localStorage (\u043A\u043E\u0440\u0438\u0441\u043D\u0438\u0447\u043A\u0438 \u043F\u043E\u0434\u0430\u0442\u043E\u0446\u0438)",
      techI18n: "\u041F\u043E\u0432\u0435\u045C\u0435\u0458\u0430\u0437\u0438\u0447\u043D\u043E\u0441\u0442: 36 \u0458\u0430\u0437\u0438\u0446\u0438",
      metaCreated: "\u{1F4C5} \u0421\u043E\u0437\u0434\u0430\u0434\u0435\u043D\u0430: \u0458\u0443\u043B\u0438 2026",
      metaVersion: "\u{1F4CC} \u0412\u0435\u0440\u0437\u0438\u0458\u0430: v2.0 (\u0431\u0435\u0442\u0430)",
      authorTitle: "\u{1F468}\u200D\u{1F4BB} \u0410\u0432\u0442\u043E\u0440",
      authorRole: "\u041A\u043E\u043D\u0446\u0435\u043F\u0442, \u0440\u0430\u0437\u0432\u043E\u0458 \u0438 \u043E\u0434\u0440\u0436\u0443\u0432\u0430\u045A\u0435 \u043D\u0430 \u0430\u043F\u043B\u0438\u043A\u0430\u0446\u0438\u0458\u0430\u0442\u0430",
      contactTitle: "\u{1F4E7} \u041A\u043E\u043D\u0442\u0430\u043A\u0442",
      downloadTitle: "\u{1F4F1} \u041F\u0440\u0435\u0437\u0435\u043C\u0438 \u0458\u0430 \u0430\u043F\u043B\u0438\u043A\u0430\u0446\u0438\u0458\u0430\u0442\u0430",
      downloadAndroidTitle: "Android (APK)",
      downloadAndroidDesc: "\u041F\u0440\u0435\u0437\u0435\u043C\u0435\u0442\u0435 \u0438 \u0438\u043D\u0441\u0442\u0430\u043B\u0438\u0440\u0430\u0458\u0442\u0435 \u0433\u043E \u043F\u0430\u043A\u0435\u0442\u043E\u0442 \u043D\u0430 Android \u0442\u0430\u0431\u043B\u0435\u0442 (4.4+).",
      downloadApk: "\u{1F4F1} \u041F\u0440\u0435\u0437\u0435\u043C\u0438 APK",
      downloadPwaTitle: "iOS / iPad (PWA)",
      downloadPwaDesc: "\u0414\u043E\u0434\u0430\u0434\u0435\u0442\u0435 \u043A\u0440\u0430\u0442\u0435\u043D\u043A\u0430 \u043D\u0430 \u043F\u043E\u0447\u0435\u0442\u043D\u0438\u043E\u0442 \u0435\u043A\u0440\u0430\u043D \u0432\u043E Safari:",
      downloadPwaStep1: "\u041E\u0442\u0432\u043E\u0440\u0435\u0442\u0435 Safari \u0438 \u043F\u043E\u0441\u0435\u0442\u0435\u0442\u0435 \u0458\u0430 \u043E\u0432\u0430\u0430 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0430.",
      downloadPwaStep2: "\u0414\u043E\u043F\u0440\u0435\u0442\u0435 \u0421\u043F\u043E\u0434\u0435\u043B\u0438 \u2192 \u0414\u043E\u0434\u0430\u0434\u0438 \u043D\u0430 \u043F\u043E\u0447\u0435\u0442\u0435\u043D \u0435\u043A\u0440\u0430\u043D.",
      qrTitle: "\u{1F4F2} QR \u043A\u043E\u0434",
      qrCaption: "\u0421\u043A\u0435\u043D\u0438\u0440\u0430\u0458\u0442\u0435 \u0438 \u043F\u0440\u0435\u0437\u0435\u043C\u0435\u0442\u0435 \u0458\u0430 \u0430\u043F\u043B\u0438\u043A\u0430\u0446\u0438\u0458\u0430\u0442\u0430",
      qrLead: "\u041A\u043E\u0434\u043E\u0442 \u0432\u043E\u0434\u0438 \u0434\u043E \u043F\u0440\u0435\u0437\u0435\u043C\u0430\u045A\u0435 \u043D\u0430 Regionaler Geschmack \u043D\u0430 \u043E\u0432\u043E\u0458 \u0443\u0440\u0435\u0434.",
      qrAlt: "QR \u043A\u043E\u0434 \u0437\u0430 \u043F\u0440\u0435\u0437\u0435\u043C\u0430\u045A\u0435 \u043D\u0430 \u0430\u043F\u043B\u0438\u043A\u0430\u0446\u0438\u0458\u0430\u0442\u0430",
      cooperationTitle: "\u{1F91D} \u0421\u043E\u0440\u0430\u0431\u043E\u0442\u043A\u0430",
      cooperationText: "\u041E\u0442\u0432\u043E\u0440\u0435\u043D \u0441\u0443\u043C \u0437\u0430 \u043F\u0440\u0435\u0434\u043B\u043E\u0437\u0438 \u0438 \u043F\u0430\u0440\u0442\u043D\u0435\u0440\u0441\u0442\u0432\u0430 \u0441\u043E \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0438, \u043F\u0440\u043E\u0434\u0430\u0432\u043D\u0438\u0446\u0438 \u0438 \u0440\u0435\u0441\u0442\u043E\u0440\u0430\u043D\u0438.",
      cooperationInvite: "\u0410\u043A\u043E \u0441\u0430\u043A\u0430\u0442\u0435 \u0434\u0430 \u0441\u0435 \u043F\u0440\u0438\u043A\u043B\u0443\u0447\u0438\u0442\u0435 \u043D\u0430 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430\u0442\u0430 \u2013 \u043A\u043E\u043D\u0442\u0430\u043A\u0442\u0438\u0440\u0430\u0458\u0442\u0435 \u043D\u0435!",
      cooperationContactTitle: "\u{1F4E7} \u041A\u043E\u043D\u0442\u0430\u043A\u0442 \u0437\u0430 \u0441\u043E\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0438 \u043D\u043E\u0432\u0438 \u043F\u0440\u043E\u0435\u043A\u0442\u0438",
      cooperationContactText: "\u041F\u0438\u0448\u0435\u0442\u0435 \u043D\u0438 \u2013 \u0441\u043E \u0437\u0430\u0434\u043E\u0432\u043E\u043B\u0441\u0442\u0432\u043E \u045C\u0435 \u0433\u0438 \u043F\u0440\u0438\u043C\u0438\u043C\u0435 \u0432\u0430\u0448\u0438\u0442\u0435 \u0438\u0434\u0435\u0438 \u0438 \u043F\u043E\u043D\u0443\u0434\u0438 \u0437\u0430 \u0441\u043E\u0440\u0430\u0431\u043E\u0442\u043A\u0430.",
      legalTitle: "\u26A0\uFE0F \u041F\u0440\u0430\u0432\u043D\u0438 \u043D\u0430\u043F\u043E\u043C\u0435\u043D\u0438",
      legal1: "\u0410\u043F\u043B\u0438\u043A\u0430\u0446\u0438\u0458\u0430\u0442\u0430 \u0433\u0438 \u043F\u043E\u0432\u0440\u0437\u0443\u0432\u0430 \u043A\u043E\u0440\u0438\u0441\u043D\u0438\u0446\u0438\u0442\u0435 \u0441\u043E \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0438. \u0422\u0440\u0430\u043D\u0441\u0430\u043A\u0446\u0438\u0438\u0442\u0435 \u0441\u0435 \u043E\u0434\u0432\u0438\u0432\u0430\u0430\u0442 \u0434\u0438\u0440\u0435\u043A\u0442\u043D\u043E \u043F\u043E\u043C\u0435\u0453\u0443 \u043A\u043E\u0440\u0438\u0441\u043D\u0438\u0446\u0438\u0442\u0435 \u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0438\u0442\u0435 \u2013 Regionaler Geschmack \u043D\u0435 \u0435 \u0441\u0442\u0440\u0430\u043D\u0430 \u0432\u043E \u0442\u0438\u0435 \u0442\u0440\u0430\u043D\u0441\u0430\u043A\u0446\u0438\u0438.",
      legal2: "\u0421\u043E\u0434\u0440\u0436\u0438\u043D\u0438\u0442\u0435 (\u043E\u043F\u0438\u0441\u0438 \u043D\u0430 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438, \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0438) \u043F\u043E\u0442\u0435\u043A\u043D\u0443\u0432\u0430\u0430\u0442 \u043E\u0434 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0438 \u2013 \u0430\u043F\u043B\u0438\u043A\u0430\u0446\u0438\u0458\u0430\u0442\u0430 \u043D\u0435 \u0435 \u043E\u0434\u0433\u043E\u0432\u043E\u0440\u043D\u0430 \u0437\u0430 \u043D\u0438\u0432\u043D\u0430\u0442\u0430 \u0442\u043E\u0447\u043D\u043E\u0441\u0442.",
      legal3: "\u0410\u043F\u043B\u0438\u043A\u0430\u0446\u0438\u0458\u0430\u0442\u0430 \u043D\u0435 \u0441\u043E\u0431\u0438\u0440\u0430 \u043B\u0438\u0447\u043D\u0438 \u043F\u043E\u0434\u0430\u0442\u043E\u0446\u0438 \u0431\u0435\u0437 \u0441\u043E\u0433\u043B\u0430\u0441\u043D\u043E\u0441\u0442 \u043D\u0430 \u043A\u043E\u0440\u0438\u0441\u043D\u0438\u043A\u043E\u0442 \u2013 \u0441\u0438\u0442\u0435 \u043F\u043E\u0434\u0430\u0442\u043E\u0446\u0438 \u0441\u0435 \u0441\u043A\u043B\u0430\u0434\u0438\u0440\u0430\u0430\u0442 \u043B\u043E\u043A\u0430\u043B\u043D\u043E \u043D\u0430 \u0443\u0440\u0435\u0434\u043E\u0442.",
      legal4: "\u041C\u0430\u043F\u0430\u0442\u0430 \u043A\u043E\u0440\u0438\u0441\u0442\u0438 \u043F\u043E\u0434\u0430\u0442\u043E\u0446\u0438 \u043E\u0434 OpenStreetMap \u2013 \u0430\u043F\u043B\u0438\u043A\u0430\u0446\u0438\u0458\u0430\u0442\u0430 \u043D\u0435 \u0435 \u043E\u0434\u0433\u043E\u0432\u043E\u0440\u043D\u0430 \u0437\u0430 \u0442\u043E\u0447\u043D\u043E\u0441\u0442\u0430 \u043D\u0430 \u0433\u0435\u043E\u0433\u0440\u0430\u0444\u0441\u043A\u0438\u0442\u0435 \u043F\u043E\u0434\u0430\u0442\u043E\u0446\u0438.",
      copyright: "\xA9 2026 Regionaler Geschmack \u2013 \u0421\u0438\u0442\u0435 \u043F\u0440\u0430\u0432\u0430 \u0437\u0430\u0434\u0440\u0436\u0430\u043D\u0438."
    }
  });

  // js/translations-search.js
  var SEARCH_I18N = Object.freeze({
    de: {
      homeSearchPlaceholder: "Produkte, Restaurants, L\xE4den oder Produzenten suchen...",
      mapSearchPlaceholder: "Produkte, Restaurants, L\xE4den oder Produzenten suchen...",
      noResults: "Keine Ergebnisse f\xFCr diese Suche.",
      noResultsFor: "Keine Ergebnisse f\xFCr die Suche '{query}'",
      resultsCount: "{count} Ergebnisse",
      searching: "Suche l\xE4uft..."
    },
    en: {
      homeSearchPlaceholder: "Search products, restaurants, shops or producers...",
      mapSearchPlaceholder: "Search products, restaurants, shops or producers...",
      noResults: "No results for this search.",
      noResultsFor: "No results for search '{query}'",
      resultsCount: "{count} results",
      searching: "Searching..."
    },
    pl: {
      homeSearchPlaceholder: "Szukaj produkt\xF3w, restauracji, sklep\xF3w lub producent\xF3w...",
      mapSearchPlaceholder: "Szukaj produkt\xF3w, restauracji, sklep\xF3w lub producent\xF3w...",
      noResults: "Brak wynik\xF3w dla tego wyszukiwania.",
      noResultsFor: "Brak wynik\xF3w dla wyszukiwania '{query}'",
      resultsCount: "{count} wynik\xF3w",
      searching: "Szukanie..."
    },
    ru: {
      homeSearchPlaceholder: "\u0418\u0441\u043A\u0430\u0442\u044C \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u044B, \u0440\u0435\u0441\u0442\u043E\u0440\u0430\u043D\u044B, \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u044B \u0438\u043B\u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0435\u0439...",
      mapSearchPlaceholder: "\u0418\u0441\u043A\u0430\u0442\u044C \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u044B, \u0440\u0435\u0441\u0442\u043E\u0440\u0430\u043D\u044B, \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u044B \u0438\u043B\u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0435\u0439...",
      noResults: "\u041D\u0435\u0442 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u043E\u0432 \u0434\u043B\u044F \u044D\u0442\u043E\u0433\u043E \u043F\u043E\u0438\u0441\u043A\u0430.",
      resultsCount: "{count} \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u043E\u0432",
      searching: "\u041F\u043E\u0438\u0441\u043A..."
    },
    tr: {
      homeSearchPlaceholder: "\xDCr\xFCn, restoran, ma\u011Faza veya \xFCretici ara...",
      mapSearchPlaceholder: "\xDCr\xFCn, restoran, ma\u011Faza veya \xFCretici ara...",
      noResults: "Bu arama i\xE7in sonu\xE7 yok.",
      resultsCount: "{count} sonu\xE7",
      searching: "Aran\u0131yor..."
    },
    fr: {
      homeSearchPlaceholder: "Rechercher produits, restaurants, magasins ou producteurs...",
      mapSearchPlaceholder: "Rechercher produits, restaurants, magasins ou producteurs...",
      noResults: "Aucun r\xE9sultat pour cette recherche.",
      resultsCount: "{count} r\xE9sultats",
      searching: "Recherche..."
    },
    es: {
      homeSearchPlaceholder: "Buscar productos, restaurantes, tiendas o productores...",
      mapSearchPlaceholder: "Buscar productos, restaurantes, tiendas o productores...",
      noResults: "No hay resultados para esta b\xFAsqueda.",
      resultsCount: "{count} resultados",
      searching: "Buscando..."
    },
    it: {
      homeSearchPlaceholder: "Cerca prodotti, ristoranti, negozi o produttori...",
      mapSearchPlaceholder: "Cerca prodotti, ristoranti, negozi o produttori...",
      noResults: "Nessun risultato per questa ricerca.",
      resultsCount: "{count} risultati",
      searching: "Ricerca..."
    },
    nl: {
      homeSearchPlaceholder: "Zoek producten, restaurants, winkels of producenten...",
      mapSearchPlaceholder: "Zoek producten, restaurants, winkels of producenten...",
      noResults: "Geen resultaten voor deze zoekopdracht.",
      resultsCount: "{count} resultaten",
      searching: "Zoeken..."
    },
    cs: {
      homeSearchPlaceholder: "Hledat produkty, restaurace, obchody nebo v\xFDrobce...",
      mapSearchPlaceholder: "Hledat produkty, restaurace, obchody nebo v\xFDrobce...",
      noResults: "\u017D\xE1dn\xE9 v\xFDsledky pro tento dotaz.",
      resultsCount: "{count} v\xFDsledk\u016F",
      searching: "Vyhled\xE1v\xE1n\xED..."
    },
    sk: {
      homeSearchPlaceholder: "H\u013Eada\u0165 produkty, re\u0161taur\xE1cie, obchody alebo v\xFDrobcov...",
      mapSearchPlaceholder: "H\u013Eada\u0165 produkty, re\u0161taur\xE1cie, obchody alebo v\xFDrobcov...",
      noResults: "\u017Diadne v\xFDsledky pre tento dotaz.",
      resultsCount: "{count} v\xFDsledkov",
      searching: "Vyh\u013Ead\xE1vanie..."
    },
    hu: {
      homeSearchPlaceholder: "Term\xE9kek, \xE9ttermek, \xFCzletek vagy termel\u0151k keres\xE9se...",
      mapSearchPlaceholder: "Term\xE9kek, \xE9ttermek, \xFCzletek vagy termel\u0151k keres\xE9se...",
      noResults: "Nincs tal\xE1lat erre a keres\xE9sre.",
      resultsCount: "{count} tal\xE1lat",
      searching: "Keres\xE9s..."
    },
    ro: {
      homeSearchPlaceholder: "C\u0103uta\u021Bi produse, restaurante, magazine sau produc\u0103tori...",
      mapSearchPlaceholder: "C\u0103uta\u021Bi produse, restaurante, magazine sau produc\u0103tori...",
      noResults: "Niciun rezultat pentru aceast\u0103 c\u0103utare.",
      resultsCount: "{count} rezultate",
      searching: "Se caut\u0103..."
    },
    bg: {
      homeSearchPlaceholder: "\u0422\u044A\u0440\u0441\u0435\u043D\u0435 \u043D\u0430 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0438, \u0440\u0435\u0441\u0442\u043E\u0440\u0430\u043D\u0442\u0438, \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0438 \u0438\u043B\u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0438...",
      mapSearchPlaceholder: "\u0422\u044A\u0440\u0441\u0435\u043D\u0435 \u043D\u0430 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0438, \u0440\u0435\u0441\u0442\u043E\u0440\u0430\u043D\u0442\u0438, \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0438 \u0438\u043B\u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0438...",
      noResults: "\u041D\u044F\u043C\u0430 \u0440\u0435\u0437\u0443\u043B\u0442\u0430\u0442\u0438 \u0437\u0430 \u0442\u043E\u0432\u0430 \u0442\u044A\u0440\u0441\u0435\u043D\u0435.",
      resultsCount: "{count} \u0440\u0435\u0437\u0443\u043B\u0442\u0430\u0442\u0430",
      searching: "\u0422\u044A\u0440\u0441\u0435\u043D\u0435..."
    },
    el: {
      homeSearchPlaceholder: "\u0391\u03BD\u03B1\u03B6\u03AE\u03C4\u03B7\u03C3\u03B7 \u03C0\u03C1\u03BF\u03CA\u03CC\u03BD\u03C4\u03C9\u03BD, \u03B5\u03C3\u03C4\u03B9\u03B1\u03C4\u03BF\u03C1\u03AF\u03C9\u03BD, \u03BA\u03B1\u03C4\u03B1\u03C3\u03C4\u03B7\u03BC\u03AC\u03C4\u03C9\u03BD \u03AE \u03C0\u03B1\u03C1\u03B1\u03B3\u03C9\u03B3\u03CE\u03BD...",
      mapSearchPlaceholder: "\u0391\u03BD\u03B1\u03B6\u03AE\u03C4\u03B7\u03C3\u03B7 \u03C0\u03C1\u03BF\u03CA\u03CC\u03BD\u03C4\u03C9\u03BD, \u03B5\u03C3\u03C4\u03B9\u03B1\u03C4\u03BF\u03C1\u03AF\u03C9\u03BD, \u03BA\u03B1\u03C4\u03B1\u03C3\u03C4\u03B7\u03BC\u03AC\u03C4\u03C9\u03BD \u03AE \u03C0\u03B1\u03C1\u03B1\u03B3\u03C9\u03B3\u03CE\u03BD...",
      noResults: "\u0394\u03B5\u03BD \u03C5\u03C0\u03AC\u03C1\u03C7\u03BF\u03C5\u03BD \u03B1\u03C0\u03BF\u03C4\u03B5\u03BB\u03AD\u03C3\u03BC\u03B1\u03C4\u03B1 \u03B3\u03B9\u03B1 \u03B1\u03C5\u03C4\u03AE \u03C4\u03B7\u03BD \u03B1\u03BD\u03B1\u03B6\u03AE\u03C4\u03B7\u03C3\u03B7.",
      resultsCount: "{count} \u03B1\u03C0\u03BF\u03C4\u03B5\u03BB\u03AD\u03C3\u03BC\u03B1\u03C4\u03B1",
      searching: "\u0391\u03BD\u03B1\u03B6\u03AE\u03C4\u03B7\u03C3\u03B7..."
    },
    hr: {
      homeSearchPlaceholder: "Pretra\u017Ei proizvode, restorane, trgovine ili proizvo\u0111a\u010De...",
      mapSearchPlaceholder: "Pretra\u017Ei proizvode, restorane, trgovine ili proizvo\u0111a\u010De...",
      noResults: "Nema rezultata za ovu pretragu.",
      resultsCount: "{count} rezultata",
      searching: "Pretra\u017Eivanje..."
    },
    sr: {
      homeSearchPlaceholder: "\u041F\u0440\u0435\u0442\u0440\u0430\u0436\u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0435, \u0440\u0435\u0441\u0442\u043E\u0440\u0430\u043D\u0435, \u043F\u0440\u043E\u0434\u0430\u0432\u043D\u0438\u0446\u0435 \u0438\u043B\u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0452\u0430\u0447\u0435...",
      mapSearchPlaceholder: "\u041F\u0440\u0435\u0442\u0440\u0430\u0436\u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0435, \u0440\u0435\u0441\u0442\u043E\u0440\u0430\u043D\u0435, \u043F\u0440\u043E\u0434\u0430\u0432\u043D\u0438\u0446\u0435 \u0438\u043B\u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0452\u0430\u0447\u0435...",
      noResults: "\u041D\u0435\u043C\u0430 \u0440\u0435\u0437\u0443\u043B\u0442\u0430\u0442\u0430 \u0437\u0430 \u043E\u0432\u0443 \u043F\u0440\u0435\u0442\u0440\u0430\u0433\u0443.",
      resultsCount: "{count} \u0440\u0435\u0437\u0443\u043B\u0442\u0430\u0442\u0430",
      searching: "\u041F\u0440\u0435\u0442\u0440\u0430\u0433\u0430..."
    },
    sl: {
      homeSearchPlaceholder: "I\u0161\u010Di izdelke, restavracije, trgovine ali proizvajalce...",
      mapSearchPlaceholder: "I\u0161\u010Di izdelke, restavracije, trgovine ali proizvajalce...",
      noResults: "Ni rezultatov za to iskanje.",
      resultsCount: "{count} rezultatov",
      searching: "Iskanje..."
    },
    lt: {
      homeSearchPlaceholder: "Ie\u0161koti produkt\u0173, restoran\u0173, parduotuvi\u0173 ar gamintoj\u0173...",
      mapSearchPlaceholder: "Ie\u0161koti produkt\u0173, restoran\u0173, parduotuvi\u0173 ar gamintoj\u0173...",
      noResults: "\u0160iai paie\u0161kai rezultat\u0173 n\u0117ra.",
      resultsCount: "{count} rezultat\u0173",
      searching: "Ie\u0161koma..."
    },
    lv: {
      homeSearchPlaceholder: "Mekl\u0113t produktus, restor\u0101nus, veikalus vai ra\u017Eot\u0101jus...",
      mapSearchPlaceholder: "Mekl\u0113t produktus, restor\u0101nus, veikalus vai ra\u017Eot\u0101jus...",
      noResults: "\u0160ai mekl\u0113\u0161anai rezult\u0101tu nav.",
      resultsCount: "{count} rezult\u0101ti",
      searching: "Mekl\u0113..."
    },
    et: {
      homeSearchPlaceholder: "Otsi tooteid, restorane, poode v\xF5i tootjaid...",
      mapSearchPlaceholder: "Otsi tooteid, restorane, poode v\xF5i tootjaid...",
      noResults: "Selle otsingu jaoks tulemusi pole.",
      resultsCount: "{count} tulemust",
      searching: "Otsimine..."
    },
    fi: {
      homeSearchPlaceholder: "Etsi tuotteita, ravintoloita, kauppoja tai tuottajia...",
      mapSearchPlaceholder: "Etsi tuotteita, ravintoloita, kauppoja tai tuottajia...",
      noResults: "Ei tuloksia t\xE4lle haulle.",
      resultsCount: "{count} tulosta",
      searching: "Haetaan..."
    },
    sv: {
      homeSearchPlaceholder: "S\xF6k produkter, restauranger, butiker eller producenter...",
      mapSearchPlaceholder: "S\xF6k produkter, restauranger, butiker eller producenter...",
      noResults: "Inga resultat f\xF6r denna s\xF6kning.",
      resultsCount: "{count} resultat",
      searching: "S\xF6ker..."
    },
    no: {
      homeSearchPlaceholder: "S\xF8k produkter, restauranter, butikker eller produsenter...",
      mapSearchPlaceholder: "S\xF8k produkter, restauranter, butikker eller produsenter...",
      noResults: "Ingen resultater for dette s\xF8ket.",
      resultsCount: "{count} resultater",
      searching: "S\xF8ker..."
    },
    da: {
      homeSearchPlaceholder: "S\xF8g produkter, restauranter, butikker eller producenter...",
      mapSearchPlaceholder: "S\xF8g produkter, restauranter, butikker eller producenter...",
      noResults: "Ingen resultater for denne s\xF8gning.",
      resultsCount: "{count} resultater",
      searching: "S\xF8ger..."
    },
    is: {
      homeSearchPlaceholder: "Leita a\xF0 v\xF6rum, veitingast\xF6\xF0um, verslunum e\xF0a framlei\xF0endum...",
      mapSearchPlaceholder: "Leita a\xF0 v\xF6rum, veitingast\xF6\xF0um, verslunum e\xF0a framlei\xF0endum...",
      noResults: "Engar ni\xF0urst\xF6\xF0ur fyrir \xFEessa leit.",
      resultsCount: "{count} ni\xF0urst\xF6\xF0ur",
      searching: "Leita..."
    },
    zh: {
      homeSearchPlaceholder: "\u641C\u7D22\u4EA7\u54C1\u3001\u9910\u5385\u3001\u5546\u5E97\u6216\u751F\u4EA7\u5546...",
      mapSearchPlaceholder: "\u5728\u5730\u56FE\u4E0A\u641C\u7D22\u4EA7\u54C1\u3001\u9910\u5385\u3001\u5546\u5E97\u6216\u751F\u4EA7\u5546...",
      noResults: "\u6B64\u641C\u7D22\u65E0\u7ED3\u679C\u3002",
      resultsCount: "{count} \u4E2A\u7ED3\u679C",
      searching: "\u641C\u7D22\u4E2D..."
    },
    "zh-tw": {
      homeSearchPlaceholder: "\u641C\u5C0B\u7522\u54C1\u3001\u9910\u5EF3\u3001\u5546\u5E97\u6216\u751F\u7522\u5546...",
      mapSearchPlaceholder: "\u5728\u5730\u5716\u4E0A\u641C\u5C0B\u7522\u54C1\u3001\u9910\u5EF3\u3001\u5546\u5E97\u6216\u751F\u7522\u5546...",
      noResults: "\u6B64\u641C\u5C0B\u7121\u7D50\u679C\u3002",
      resultsCount: "{count} \u500B\u7D50\u679C",
      searching: "\u641C\u5C0B\u4E2D..."
    },
    ja: {
      homeSearchPlaceholder: "\u88FD\u54C1\u3001\u30EC\u30B9\u30C8\u30E9\u30F3\u3001\u5E97\u8217\u3001\u751F\u7523\u8005\u3092\u691C\u7D22...",
      mapSearchPlaceholder: "\u5730\u56F3\u3067\u88FD\u54C1\u3001\u30EC\u30B9\u30C8\u30E9\u30F3\u3001\u5E97\u8217\u3001\u751F\u7523\u8005\u3092\u691C\u7D22...",
      noResults: "\u3053\u306E\u691C\u7D22\u306E\u7D50\u679C\u306F\u3042\u308A\u307E\u305B\u3093\u3002",
      resultsCount: "{count} \u4EF6\u306E\u7D50\u679C",
      searching: "\u691C\u7D22\u4E2D..."
    },
    ko: {
      homeSearchPlaceholder: "\uC81C\uD488, \uB808\uC2A4\uD1A0\uB791, \uC0C1\uC810 \uB610\uB294 \uC0DD\uC0B0\uC790 \uAC80\uC0C9...",
      mapSearchPlaceholder: "\uC9C0\uB3C4\uC5D0\uC11C \uC81C\uD488, \uB808\uC2A4\uD1A0\uB791, \uC0C1\uC810 \uB610\uB294 \uC0DD\uC0B0\uC790 \uAC80\uC0C9...",
      noResults: "\uC774 \uAC80\uC0C9\uC5D0 \uB300\uD55C \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
      resultsCount: "{count}\uAC1C \uACB0\uACFC",
      searching: "\uAC80\uC0C9 \uC911..."
    },
    vi: {
      homeSearchPlaceholder: "T\xECm s\u1EA3n ph\u1EA9m, nh\xE0 h\xE0ng, c\u1EEDa h\xE0ng ho\u1EB7c nh\xE0 s\u1EA3n xu\u1EA5t...",
      mapSearchPlaceholder: "T\xECm tr\xEAn b\u1EA3n \u0111\u1ED3: s\u1EA3n ph\u1EA9m, nh\xE0 h\xE0ng, c\u1EEDa h\xE0ng...",
      noResults: "Kh\xF4ng c\xF3 k\u1EBFt qu\u1EA3 cho t\xECm ki\u1EBFm n\xE0y.",
      resultsCount: "{count} k\u1EBFt qu\u1EA3",
      searching: "\u0110ang t\xECm..."
    },
    ms: {
      homeSearchPlaceholder: "Cari produk, restoran, kedai atau pengeluar...",
      mapSearchPlaceholder: "Cari pada peta: produk, restoran, kedai...",
      noResults: "Tiada hasil untuk carian ini.",
      resultsCount: "{count} hasil",
      searching: "Mencari..."
    },
    id: {
      homeSearchPlaceholder: "Cari produk, restoran, toko, atau produsen...",
      mapSearchPlaceholder: "Cari di peta: produk, restoran, toko...",
      noResults: "Tidak ada hasil untuk pencarian ini.",
      resultsCount: "{count} hasil",
      searching: "Mencari..."
    },
    th: {
      homeSearchPlaceholder: "\u0E04\u0E49\u0E19\u0E2B\u0E32\u0E1C\u0E25\u0E34\u0E15\u0E20\u0E31\u0E13\u0E11\u0E4C \u0E23\u0E49\u0E32\u0E19\u0E2D\u0E32\u0E2B\u0E32\u0E23 \u0E23\u0E49\u0E32\u0E19\u0E04\u0E49\u0E32 \u0E2B\u0E23\u0E37\u0E2D\u0E1C\u0E39\u0E49\u0E1C\u0E25\u0E34\u0E15...",
      mapSearchPlaceholder: "\u0E04\u0E49\u0E19\u0E2B\u0E32\u0E1A\u0E19\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48: \u0E1C\u0E25\u0E34\u0E15\u0E20\u0E31\u0E13\u0E11\u0E4C \u0E23\u0E49\u0E32\u0E19\u0E2D\u0E32\u0E2B\u0E32\u0E23 \u0E23\u0E49\u0E32\u0E19\u0E04\u0E49\u0E32...",
      noResults: "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E1C\u0E25\u0E25\u0E31\u0E1E\u0E18\u0E4C\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E04\u0E49\u0E19\u0E2B\u0E32\u0E19\u0E35\u0E49",
      resultsCount: "{count} \u0E1C\u0E25\u0E25\u0E31\u0E1E\u0E18\u0E4C",
      searching: "\u0E01\u0E33\u0E25\u0E31\u0E07\u0E04\u0E49\u0E19\u0E2B\u0E32..."
    },
    hi: {
      homeSearchPlaceholder: "\u0909\u0924\u094D\u092A\u093E\u0926, \u0930\u0947\u0938\u094D\u0924\u0930\u093E\u0902, \u0926\u0941\u0915\u093E\u0928\u0947\u0902 \u092F\u093E \u0909\u0924\u094D\u092A\u093E\u0926\u0915 \u0916\u094B\u091C\u0947\u0902...",
      mapSearchPlaceholder: "\u092E\u093E\u0928\u091A\u093F\u0924\u094D\u0930 \u092A\u0930 \u0909\u0924\u094D\u092A\u093E\u0926, \u0930\u0947\u0938\u094D\u0924\u0930\u093E\u0902, \u0926\u0941\u0915\u093E\u0928\u0947\u0902 \u0916\u094B\u091C\u0947\u0902...",
      noResults: "\u0907\u0938 \u0916\u094B\u091C \u0915\u0947 \u0932\u093F\u090F \u0915\u094B\u0908 \u092A\u0930\u093F\u0923\u093E\u092E \u0928\u0939\u0940\u0902\u0964",
      resultsCount: "{count} \u092A\u0930\u093F\u0923\u093E\u092E",
      searching: "\u0916\u094B\u091C \u0930\u0939\u0947 \u0939\u0948\u0902..."
    },
    mk: {
      homeSearchPlaceholder: "\u041F\u0440\u0435\u0431\u0430\u0440\u0430\u0458\u0442\u0435 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438, \u0440\u0435\u0441\u0442\u043E\u0440\u0430\u043D\u0438, \u043F\u0440\u043E\u0434\u0430\u0432\u043D\u0438\u0446\u0438 \u0438\u043B\u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0438...",
      mapSearchPlaceholder: "\u041F\u0440\u0435\u0431\u0430\u0440\u0430\u0458\u0442\u0435 \u043D\u0430 \u043C\u0430\u043F\u0430\u0442\u0430: \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438, \u0440\u0435\u0441\u0442\u043E\u0440\u0430\u043D\u0438, \u043F\u0440\u043E\u0434\u0430\u0432\u043D\u0438\u0446\u0438...",
      noResults: "\u041D\u0435\u043C\u0430 \u0440\u0435\u0437\u0443\u043B\u0442\u0430\u0442\u0438 \u0437\u0430 \u043E\u0432\u0430 \u043F\u0440\u0435\u0431\u0430\u0440\u0443\u0432\u0430\u045A\u0435.",
      noResultsFor: "\u041D\u0435\u043C\u0430 \u0440\u0435\u0437\u0443\u043B\u0442\u0430\u0442\u0438 \u0437\u0430 \u043F\u0440\u0435\u0431\u0430\u0440\u0443\u0432\u0430\u045A\u0435\u0442\u043E '{query}'",
      resultsCount: "{count} \u0440\u0435\u0437\u0443\u043B\u0442\u0430\u0442\u0438",
      searching: "\u041F\u0440\u0435\u0431\u0430\u0440\u0443\u0432\u0430\u045A\u0435..."
    }
  });

  // js/translations-mk.js
  function ui2(nav, home, categories, extra = {}) {
    return __spreadValues({ nav, home, categories }, extra);
  }
  var MK = ui2(
    { home: "\u041F\u043E\u0447\u0435\u0442\u043D\u0430", map: "\u041A\u0430\u0440\u0442\u0430", premium: "\u041F\u0440\u0435\u043C\u0438\u0443\u043C", favorites: "\u041E\u043C\u0438\u043B\u0435\u043D\u0438", cart: "\u041A\u043E\u0448\u043D\u0438\u0447\u043A\u0430", profile: "\u041F\u0440\u043E\u0444\u0438\u043B" },
    {
      heroTitle: "\u041F\u043E\u0434\u0434\u0440\u0436\u0435\u0442\u0435 \u043B\u043E\u043A\u0430\u043B\u043D\u043E.<br>\u0408\u0430\u0434\u0435\u0442\u0435 \u0441\u0432\u0435\u0441\u043D\u043E.<br>\u0416\u0438\u0432\u0435\u0458\u0442\u0435 \u043F\u043E\u0434\u043E\u0431\u0440\u043E.",
      heroTagline: "\u{1F30D} \u041E\u0442\u043A\u0440\u0438\u0458\u0442\u0435 \u0440\u0435\u0433\u0438\u043E\u043D\u0430\u043B\u043D\u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0438 \u0432\u043E \u0432\u0430\u0448\u0430\u0442\u0430 \u0431\u043B\u0438\u0437\u0438\u043D\u0430",
      getLocation: "\u0417\u0435\u043C\u0435\u0442\u0435 \u043B\u043E\u043A\u0430\u0446\u0438\u0458\u0430",
      findNearby: "\u041E\u0442\u043A\u0440\u0438\u0458\u0442\u0435 \u043D\u0430 \u043C\u0430\u043F\u0430",
      recommendedTitle: "\u2B50 \u041F\u0440\u0435\u043F\u043E\u0440\u0430\u0447\u0430\u043D\u0438 \u0437\u0435\u043C\u0458\u043E\u0434\u0435\u043B\u0446\u0438",
      recommendedPlaceholder: "\u041D\u0430\u0441\u043A\u043E\u0440\u043E: \u043F\u0440\u0435\u043F\u043E\u0440\u0430\u043A\u0438 \u043E\u0434 \u0432\u0430\u0448\u0438\u043E\u0442 \u0440\u0435\u0433\u0438\u043E\u043D.",
      featured: "\u2B50 \u041F\u0440\u0435\u043F\u043E\u0440\u0430\u0447\u0430\u043D\u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438",
      ratingNew: "\u2B50 \u041D\u043E\u0432\u043E",
      featuredItems: {},
      footerCopyright: "\xA9 2026 Regionaler Geschmack",
      searchPlaceholder: "\u041F\u0440\u0435\u0431\u0430\u0440\u0430\u0458\u0442\u0435 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438, \u0440\u0435\u0441\u0442\u043E\u0440\u0430\u043D\u0438, \u043F\u0440\u043E\u0434\u0430\u0432\u043D\u0438\u0446\u0438 \u0438\u043B\u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0438...",
      hubLabel: "\u041F\u0440\u0435\u0431\u0430\u0440\u0443\u0432\u0430\u045A\u0435 \u0438 \u0431\u0440\u0437 \u043F\u0440\u0438\u0441\u0442\u0430\u043F",
      chipsLabel: "\u0411\u0440\u0437\u0438 \u0444\u0438\u043B\u0442\u0440\u0438",
      chip: { products: "\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438", restaurants: "\u0420\u0435\u0441\u0442\u043E\u0440\u0430\u043D\u0438", shops: "\u041F\u0440\u043E\u0434\u0430\u0432\u043D\u0438\u0446\u0438", farmers: "\u0417\u0435\u043C\u0458\u043E\u0434\u0435\u043B\u0446\u0438", favorites: "\u041E\u043C\u0438\u043B\u0435\u043D\u0438" },
      premiumTeaser: "\u0415\u043A\u0441\u043A\u043B\u0443\u0437\u0438\u0432\u043D\u0438 \u043F\u0440\u0438\u0434\u043E\u0431\u0438\u0432\u043A\u0438 \u0437\u0430 \u043B\u043E\u043A\u0430\u043B\u043D\u0438 \u043E\u0442\u043A\u0440\u0438\u0442\u0438\u0458\u0430",
      categoriesTitle: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438",
      categoryActionsLabel: "\u0411\u0440\u0437\u0438 \u0444\u0438\u043B\u0442\u0440\u0438 \u043F\u043E \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0458\u0430"
    },
    {
      all: { name: "\u0421\u0438\u0442\u0435", desc: "\u0421\u0438\u0442\u0435 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438" },
      restaurants: { name: "\u0420\u0435\u0441\u0442\u043E\u0440\u0430\u043D\u0438", desc: "\u0420\u0435\u0433\u0438\u043E\u043D\u0430\u043B\u043D\u0438 \u0458\u0430\u0434\u0435\u045A\u0430" },
      farmers: { name: "\u0417\u0435\u043C\u0458\u043E\u0434\u0435\u043B\u0446\u0438", desc: "\u0421\u0432\u0435\u0436\u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438" },
      bakeries: { name: "\u041F\u0435\u043A\u0430\u0440\u0438", desc: "\u0421\u0432\u0435\u0436\u0438 \u043F\u0435\u0446\u0438\u0432\u0430" },
      meat: { name: "\u041C\u0435\u0441\u043E / \u041C\u0435\u0441\u0430\u0440\u043D\u0438\u0446\u0438", desc: "\u0420\u0435\u0433\u0438\u043E\u043D\u0430\u043B\u043D\u0438 \u043A\u043E\u043B\u0431\u0430\u0441\u0438" },
      shops: { name: "\u041F\u0440\u043E\u0434\u0430\u0432\u043D\u0438\u0446\u0438", desc: "\u041B\u043E\u043A\u0430\u043B\u043D\u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438" },
      vending: { name: "\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438", desc: "24/7" },
      favorites: { name: "\u041E\u043C\u0438\u043B\u0435\u043D\u0438", desc: "\u0417\u0430\u0447\u0443\u0432\u0430\u043D\u0438 \u043C\u0435\u0441\u0442\u0430" }
    },
    {
      a11y: { darkMode: "\u0422\u0435\u043C\u0435\u043D \u0440\u0435\u0436\u0438\u043C", lightMode: "\u0421\u0432\u0435\u0442\u043E\u043B \u0440\u0435\u0436\u0438\u043C", chooseLanguage: "\u0418\u0437\u0431\u0435\u0440\u0435\u0442\u0435 \u0458\u0430\u0437\u0438\u043A", menu: "\u041C\u0435\u043D\u0438", premium: "\u041F\u0440\u0435\u043C\u0438\u0443\u043C", map: "\u041A\u0430\u0440\u0442\u0430", searchRadius: "\u0420\u0430\u0434\u0438\u0443\u0441 \u043D\u0430 \u043F\u0440\u0435\u0431\u0430\u0440\u0443\u0432\u0430\u045A\u0435 \u0432\u043E km" },
      map: {
        gps: "GPS",
        osm: "OSM",
        loadError: "\u041A\u0430\u0440\u0442\u0430\u0442\u0430 \u043D\u0435 \u043C\u043E\u0436\u0435\u0448\u0435 \u0434\u0430 \u0441\u0435 \u0432\u0447\u0438\u0442\u0430.",
        dataLoading: "\u0412\u0447\u0438\u0442\u0443\u0432\u0430\u045A\u0435 \u043F\u043E\u0434\u0430\u0442\u043E\u0446\u0438...",
        dataCached: "\u041F\u0440\u0438\u043A\u0430\u0436\u0430\u043D\u0438 \u0437\u0430\u0447\u0443\u0432\u0430\u043D\u0438 \u043F\u043E\u0434\u0430\u0442\u043E\u0446\u0438",
        dataError: "\u0413\u0440\u0435\u0448\u043A\u0430 \u043F\u0440\u0438 \u0432\u0447\u0438\u0442\u0443\u0432\u0430\u045A\u0435",
        noDataInArea: "\u041D\u0435\u043C\u0430 \u043F\u043E\u0434\u0430\u0442\u043E\u0446\u0438 \u0432\u043E \u043E\u0432\u0430\u0430 \u043E\u043A\u043E\u043B\u0438\u043D\u0430.",
        radiusFilter: "\u{1F535} \u041E\u043F\u0441\u0435\u0433: {km} km ({count} \u043C\u0435\u0441\u0442\u0430)",
        producerList: "\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0438 \u0432\u043E \u043E\u043F\u0441\u0435\u0433",
        listToggle: "\u{1F4CB} \u041B\u0438\u0441\u0442\u0430 ({count})",
        edit: "\u0423\u0440\u0435\u0434\u0438",
        searchPlaceholder: "\u041F\u0440\u0435\u0431\u0430\u0440\u0430\u0458\u0442\u0435 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438, \u0440\u0435\u0441\u0442\u043E\u0440\u0430\u043D\u0438, \u043F\u0440\u043E\u0434\u0430\u0432\u043D\u0438\u0446\u0438...",
        legend: "\u041B\u0435\u0433\u0435\u043D\u0434\u0430",
        legendTitle: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438 \u043D\u0430 \u043C\u0430\u043F\u0430\u0442\u0430",
        styleTitle: "\u0421\u0442\u0438\u043B \u043D\u0430 \u043C\u0430\u043F\u0430\u0442\u0430",
        categoriesTitle: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438",
        save: "\u0417\u0430\u0447\u0443\u0432\u0430\u0458",
        reset: "\u0420\u0435\u0441\u0435\u0442\u0438\u0440\u0430\u0458",
        style: { light: "\u0421\u0432\u0435\u0442\u043B\u043E", dark: "\u0422\u0435\u043C\u043D\u043E", satellite: "\u0421\u0430\u0442\u0435\u043B\u0438\u0442", terrain: "\u0420\u0435\u043B\u0435\u0444" }
      },
      btn: { details: "\u0414\u0435\u0442\u0430\u043B\u0438", favorite: "\u041E\u043C\u0438\u043B\u0435\u043D\u043E", favoriteSaved: "\u0417\u0430\u0447\u0443\u0432\u0430\u043D\u043E", addToCart: "\u0414\u043E\u0434\u0430\u0434\u0438 \u0432\u043E \u043A\u043E\u0448\u043D\u0438\u0447\u043A\u0430", addedToCart: "\u0414\u043E\u0434\u0430\u0434\u0435\u043D\u043E", navigate: "\u041D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u0458\u0430", close: "\u0417\u0430\u0442\u0432\u043E\u0440\u0438", back: "\u041D\u0430\u0437\u0430\u0434", remove: "\u041E\u0442\u0441\u0442\u0440\u0430\u043D\u0438", more: "\u041F\u043E\u0432\u0435\u045C\u0435", less: "\u041F\u043E\u043C\u0430\u043B\u043A\u0443", login: "\u041D\u0430\u0458\u0430\u0432\u0430", toMap: "\u041A\u043E\u043D \u043C\u0430\u043F\u0430\u0442\u0430", discover: "\u041E\u0442\u043A\u0440\u0438\u0458\u0442\u0435 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438", checkout: "\u041D\u0430\u043F\u043B\u0430\u0442\u0430", clearCart: "\u0418\u0441\u043F\u0440\u0430\u0437\u043D\u0438 \u0458\u0430 \u043A\u043E\u0448\u043D\u0438\u0447\u043A\u0430\u0442\u0430" },
      favorites: { title: "\u041E\u043C\u0438\u043B\u0435\u043D\u0438", subtitle: "\u0412\u0430\u0448\u0438\u0442\u0435 \u0437\u0430\u0447\u0443\u0432\u0430\u043D\u0438 \u043C\u0435\u0441\u0442\u0430 \u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0438", empty: "\u041D\u0435\u043C\u0430\u0442\u0435 \u0437\u0430\u0447\u0443\u0432\u0430\u043D\u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0438", emptySub: "\u041E\u0437\u043D\u0430\u0447\u0435\u0442\u0435 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0438 \u043D\u0430 \u043C\u0430\u043F\u0430\u0442\u0430 \u043A\u0430\u043A\u043E \u043E\u043C\u0438\u043B\u0435\u043D\u0438." },
      cart: { title: "\u041A\u043E\u0448\u043D\u0438\u0447\u043A\u0430", subtitle: "\u0412\u0430\u0448\u0438\u0442\u0435 \u043A\u0443\u043F\u0443\u0432\u0430\u045A\u0430 \u043A\u0430\u0458 \u0440\u0435\u0433\u0438\u043E\u043D\u0430\u043B\u043D\u0438 \u0434\u043E\u0431\u0430\u0432\u0443\u0432\u0430\u0447\u0438", empty: "\u041A\u043E\u0448\u043D\u0438\u0447\u043A\u0430\u0442\u0430 \u0435 \u043F\u0440\u0430\u0437\u043D\u0430", emptySub: "\u0414\u043E\u0434\u0430\u0434\u0435\u0442\u0435 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438 \u043E\u0434 \u043E\u043C\u0438\u043B\u0435\u043D\u0438\u0442\u0435 \u043C\u0435\u0441\u0442\u0430.", total: "\u0412\u043A\u0443\u043F\u043D\u043E", product: "\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434", confirmClear: "\u0414\u0430\u043B\u0438 \u0441\u0442\u0435 \u0441\u0438\u0433\u0443\u0440\u043D\u0438 \u0434\u0435\u043A\u0430 \u0441\u0430\u043A\u0430\u0442\u0435 \u0434\u0430 \u0458\u0430 \u0438\u0441\u043F\u0440\u0430\u0437\u043D\u0438\u0442\u0435 \u043A\u043E\u0448\u043D\u0438\u0447\u043A\u0430\u0442\u0430?" },
      footer: { address: "Polikarski Krzysztof, Germany" },
      shell: { label: "\u0413\u043B\u0430\u0432\u043D\u0430 \u043D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u0458\u0430" },
      profile: { title: "\u041F\u0440\u043E\u0444\u0438\u043B", subtitle: "\u0412\u0430\u0448\u0438\u0442\u0435 \u043F\u043E\u0441\u0442\u0430\u0432\u043A\u0438", guest: "\u0413\u043E\u0441\u0442\u0438\u043D", guestSub: "\u041D\u0430\u0458\u0430\u0432\u0435\u0442\u0435 \u0441\u0435 \u0437\u0430 \u0434\u0430 \u0437\u0430\u0447\u0443\u0432\u0430\u0442\u0435 \u043E\u043C\u0438\u043B\u0435\u043D\u0438 \u0438 \u0434\u0430 \u0433\u0438 \u0441\u043B\u0435\u0434\u0438\u0442\u0435 \u043D\u0430\u0440\u0430\u0447\u043A\u0438\u0442\u0435.", darkMode: "\u0422\u0435\u043C\u0435\u043D \u0440\u0435\u0436\u0438\u043C", notifications: "\u0418\u0437\u0432\u0435\u0441\u0442\u0443\u0432\u0430\u045A\u0430", language: "\u0408\u0430\u0437\u0438\u043A" },
      msg: { loading: "\u0412\u0447\u0438\u0442\u0443\u0432\u0430\u045A\u0435...", noProducts: "\u041D\u0435\u043C\u0430 \u0434\u043E\u0441\u0442\u0430\u043F\u043D\u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438.", noOfferProducts: "\u041D\u0435\u043C\u0430 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438 \u0432\u043E \u043F\u043E\u043D\u0443\u0434\u0430\u0442\u0430.", servicesOnContact: "\u0423\u0441\u043B\u0443\u0433\u0438 \u0434\u043E\u0441\u0442\u0430\u043F\u043D\u0438 \u043F\u043E \u043A\u043E\u043D\u0442\u0430\u043A\u0442.", checkoutSoon: "\u041D\u0430\u043F\u043B\u0430\u0442\u0430 \u2013 \u043D\u0430\u0441\u043A\u043E\u0440\u043E", loginSoon: "\u041D\u0430\u0458\u0430\u0432\u0430 \u2013 \u043D\u0430\u0441\u043A\u043E\u0440\u043E", menuSoon: "\u041C\u0435\u043D\u0438 \u2013 \u043D\u0430\u0441\u043A\u043E\u0440\u043E", premiumSoon: "\u041F\u0440\u0435\u043C\u0438\u0443\u043C \u2013 \u043D\u0430\u0441\u043A\u043E\u0440\u043E", locationDenied: "\u041F\u0440\u0438\u0441\u0442\u0430\u043F\u043E\u0442 \u0434\u043E \u043B\u043E\u043A\u0430\u0446\u0438\u0458\u0430\u0442\u0430 \u0435 \u043E\u0434\u0431\u0438\u0435\u043D.", locationUnavailable: "\u041B\u043E\u043A\u0430\u0446\u0438\u0458\u0430\u0442\u0430 \u043D\u0435 \u043C\u043E\u0436\u0435\u0448\u0435 \u0434\u0430 \u0441\u0435 \u0443\u0442\u0432\u0440\u0434\u0438.", addedToFavorites: "\u0414\u043E\u0434\u0430\u0434\u0435\u043D\u043E \u0432\u043E \u043E\u043C\u0438\u043B\u0435\u043D\u0438", removedFromFavorites: "\u041E\u0442\u0441\u0442\u0440\u0430\u043D\u0435\u0442\u043E \u043E\u0434 \u043E\u043C\u0438\u043B\u0435\u043D\u0438", addedToCart: "\u0414\u043E\u0434\u0430\u0434\u0435\u043D\u043E \u0432\u043E \u043A\u043E\u0448\u043D\u0438\u0447\u043A\u0430", removedFromCart: "\u041E\u0442\u0441\u0442\u0440\u0430\u043D\u0435\u0442\u043E \u043E\u0434 \u043A\u043E\u0448\u043D\u0438\u0447\u043A\u0430", connectionError: "\u0413\u0440\u0435\u0448\u043A\u0430 \u0432\u043E \u0432\u0440\u0441\u043A\u0430\u0442\u0430", viewError: "\u041F\u0440\u0438\u043A\u0430\u0437\u043E\u0442 \u043D\u0435 \u043C\u043E\u0436\u0435\u0448\u0435 \u0434\u0430 \u0441\u0435 \u0432\u0447\u0438\u0442\u0430.", error: "\u0413\u0440\u0435\u0448\u043A\u0430" },
      search: { noResults: "\u041D\u0435\u043C\u0430 \u0440\u0435\u0437\u0443\u043B\u0442\u0430\u0442\u0438 \u0437\u0430 \u043E\u0432\u0430 \u043F\u0440\u0435\u0431\u0430\u0440\u0443\u0432\u0430\u045A\u0435.", noResultsFor: "\u041D\u0435\u043C\u0430 \u0440\u0435\u0437\u0443\u043B\u0442\u0430\u0442\u0438 \u0437\u0430 \u043F\u0440\u0435\u0431\u0430\u0440\u0443\u0432\u0430\u045A\u0435\u0442\u043E '{query}'", resultsCount: "{count} \u0440\u0435\u0437\u0443\u043B\u0442\u0430\u0442\u0438", searching: "\u041F\u0440\u0435\u0431\u0430\u0440\u0443\u0432\u0430\u045A\u0435..." },
      producer: {
        openUntil: "\u041E\u0442\u0432\u043E\u0440\u0435\u043D\u043E \u0434\u043E {time}",
        distance: "{distance} m",
        contactTitle: "\u041A\u043E\u043D\u0442\u0430\u043A\u0442",
        productsTitle: "\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438",
        locationTitle: "\u041B\u043E\u043A\u0430\u0446\u0438\u0458\u0430",
        phone: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D",
        types: { farmer: "\u0417\u0435\u043C\u0458\u043E\u0434\u0435\u043B\u0435\u0446", bakery: "\u041F\u0435\u043A\u0430\u0440\u043D\u0438\u0446\u0430", restaurant: "\u0420\u0435\u0441\u0442\u043E\u0440\u0430\u043D", meat: "\u041C\u0435\u0441\u0430\u0440\u043D\u0438\u0446\u0430", shop: "\u0421\u0443\u043F\u0435\u0440\u043C\u0430\u0440\u043A\u0435\u0442", vending: "\u0410\u0432\u0442\u043E\u043C\u0430\u0442", honey: "\u041F\u0447\u0435\u043B\u0430\u0440\u0441\u0442\u0432\u043E", dairy: "\u041C\u043B\u0435\u043A\u0430\u0440\u0441\u0442\u0432\u043E", fruit: "\u041E\u0432\u043E\u0448\u0458\u0435", vegetables: "\u0417\u0435\u043B\u0435\u043D\u0447\u0443\u043A", forest: "\u0428\u0443\u043C\u0441\u043A\u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438", other: "\u0414\u043E\u0431\u0430\u0432\u0443\u0432\u0430\u0447" }
      },
      product: {
        placeholderImage: "\u041F\u0440\u0438\u043C\u0435\u0440\u043D\u0430 \u0441\u043B\u0438\u043A\u0430",
        placeholderNote: "\u0421\u043B\u0438\u043A\u0430\u0442\u0430 \u043D\u0435 \u0435 \u0432\u0438\u0441\u0442\u0438\u043D\u0441\u043A\u0430. \u0421\u0430\u043C\u043E \u0437\u0430 \u0438\u043B\u0443\u0441\u0442\u0440\u0430\u0446\u0438\u0458\u0430."
      },
      reviews: {
        title: "\u041C\u0438\u0441\u043B\u0435\u045A\u0430",
        add: "\u0414\u043E\u0434\u0430\u0458\u0442\u0435 \u043C\u0438\u0441\u043B\u0435\u045A\u0435",
        empty: "\u041D\u0435\u043C\u0430 \u043C\u0438\u0441\u043B\u0435\u045A\u0430",
        userName: "\u0412\u0430\u0448\u0435\u0442\u043E \u0438\u043C\u0435",
        rating: "\u041E\u0446\u0435\u043D\u043A\u0430",
        comment: "\u041A\u043E\u043C\u0435\u043D\u0442\u0430\u0440",
        submit: "\u0418\u0441\u043F\u0440\u0430\u0442\u0438",
        saved: "\u2705 \u041C\u0438\u0441\u043B\u0435\u045A\u0435\u0442\u043E \u0435 \u0434\u043E\u0434\u0430\u0434\u0435\u043D\u043E!"
      },
      productDefault: "\u0420\u0435\u0433\u0438\u043E\u043D\u0430\u043B\u0435\u043D \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434",
      header: { tagline: "\u041F\u043E\u0434\u0434\u0440\u0436\u0435\u0442\u0435 \u043B\u043E\u043A\u0430\u043B\u043D\u043E. \u0416\u0438\u0432\u0435\u0458\u0442\u0435 \u043F\u043E\u0434\u043E\u0431\u0440\u043E." },
      premium: {
        title: "\u041F\u0440\u0435\u043C\u0438\u0443\u043C",
        subtitle: "\u041F\u043E\u0432\u0435\u045C\u0435 \u043E\u0442\u043A\u0440\u0438\u0442\u0438\u0458\u0430, \u043F\u043E\u0432\u0435\u045C\u0435 \u043F\u0440\u0438\u0434\u043E\u0431\u0438\u0432\u043A\u0438 \u2013 \u0437\u0430 \u0441\u0432\u0435\u0441\u0435\u043D \u0440\u0435\u0433\u0438\u043E\u043D\u0430\u043B\u0435\u043D \u0443\u0436\u0438\u0442\u043E\u043A.",
        featuresTitle: "\u041F\u0440\u0435\u043C\u0438\u0443\u043C \u043F\u0440\u0438\u0434\u043E\u0431\u0438\u0432\u043A\u0438",
        feature1Title: "\u041F\u0440\u0435\u043F\u043E\u0440\u0430\u043A\u0438",
        feature1Desc: "\u0418\u0437\u0431\u0440\u0430\u043D\u0438 \u0440\u0435\u0433\u0438\u043E\u043D\u0430\u043B\u043D\u0438 \u043F\u0440\u0435\u0434\u043B\u043E\u0437\u0438 \u0432\u043E \u0432\u0430\u0448\u0430\u0442\u0430 \u0431\u043B\u0438\u0437\u0438\u043D\u0430.",
        feature2Title: "\u041F\u0440\u043E\u0448\u0438\u0440\u0435\u043D\u0430 \u043C\u0430\u043F\u0430",
        feature2Desc: "\u041F\u043E\u0432\u0435\u045C\u0435 \u0444\u0438\u043B\u0442\u0440\u0438 \u0438 \u0440\u0443\u0442\u0438 \u0434\u043E \u043B\u043E\u043A\u0430\u043B\u043D\u0438 \u0434\u043E\u0431\u0430\u0432\u0443\u0432\u0430\u0447\u0438.",
        feature3Title: "\u041F\u0440\u0435\u0434\u043D\u043E\u0441\u0442\u0438 \u043F\u0440\u0438 \u043A\u0443\u043F\u0443\u0432\u0430\u045A\u0435",
        feature3Desc: "\u041F\u043E\u0431\u0440\u0437\u0430 \u043D\u0430\u0440\u0430\u0447\u043A\u0430 \u0438 \u043F\u0440\u0435\u0433\u043B\u0435\u0434 \u043D\u0430 \u043F\u043E\u043D\u0443\u0434\u0438.",
        cta: "\u041E\u0442\u043A\u043B\u0443\u0447\u0438 \u041F\u0440\u0435\u043C\u0438\u0443\u043C"
      }
    }
  );

  // js/translations.js
  var LANG_OPTIONS = Object.freeze([
    { code: "de", flag: "\u{1F1E9}\u{1F1EA}", label: "Deutsch", short: "DE" },
    { code: "en", flag: "\u{1F1EC}\u{1F1E7}", label: "English", short: "EN" },
    { code: "pl", flag: "\u{1F1F5}\u{1F1F1}", label: "Polski", short: "PL" },
    { code: "ru", flag: "\u{1F1F7}\u{1F1FA}", label: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439", short: "RU" },
    { code: "tr", flag: "\u{1F1F9}\u{1F1F7}", label: "T\xFCrk\xE7e", short: "TR" },
    { code: "fr", flag: "\u{1F1EB}\u{1F1F7}", label: "Fran\xE7ais", short: "FR" },
    { code: "es", flag: "\u{1F1EA}\u{1F1F8}", label: "Espa\xF1ol", short: "ES" },
    { code: "it", flag: "\u{1F1EE}\u{1F1F9}", label: "Italiano", short: "IT" },
    { code: "nl", flag: "\u{1F1F3}\u{1F1F1}", label: "Nederlands", short: "NL" },
    { code: "cs", flag: "\u{1F1E8}\u{1F1FF}", label: "\u010Ce\u0161tina", short: "CZ" },
    { code: "sk", flag: "\u{1F1F8}\u{1F1F0}", label: "Sloven\u010Dina", short: "SK" },
    { code: "hu", flag: "\u{1F1ED}\u{1F1FA}", label: "Magyar", short: "HU" },
    { code: "ro", flag: "\u{1F1F7}\u{1F1F4}", label: "Rom\xE2n\u0103", short: "RO" },
    { code: "bg", flag: "\u{1F1E7}\u{1F1EC}", label: "\u0411\u044A\u043B\u0433\u0430\u0440\u0441\u043A\u0438", short: "BG" },
    { code: "el", flag: "\u{1F1EC}\u{1F1F7}", label: "\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC", short: "GR" },
    { code: "hr", flag: "\u{1F1ED}\u{1F1F7}", label: "Hrvatski", short: "HR" },
    { code: "sr", flag: "\u{1F1F7}\u{1F1F8}", label: "\u0421\u0440\u043F\u0441\u043A\u0438", short: "SR" },
    { code: "mk", flag: "\u{1F1F2}\u{1F1F0}", label: "\u041C\u0430\u043A\u0435\u0434\u043E\u043D\u0441\u043A\u0438", short: "MK" },
    { code: "sl", flag: "\u{1F1F8}\u{1F1EE}", label: "Sloven\u0161\u010Dina", short: "SL" },
    { code: "lt", flag: "\u{1F1F1}\u{1F1F9}", label: "Lietuvi\u0173", short: "LT" },
    { code: "lv", flag: "\u{1F1F1}\u{1F1FB}", label: "Latvie\u0161u", short: "LV" },
    { code: "et", flag: "\u{1F1EA}\u{1F1EA}", label: "Eesti", short: "ET" },
    { code: "fi", flag: "\u{1F1EB}\u{1F1EE}", label: "Suomi", short: "FI" },
    { code: "sv", flag: "\u{1F1F8}\u{1F1EA}", label: "Svenska", short: "SV" },
    { code: "no", flag: "\u{1F1F3}\u{1F1F4}", label: "Norsk", short: "NO" },
    { code: "da", flag: "\u{1F1E9}\u{1F1F0}", label: "Dansk", short: "DA" },
    { code: "is", flag: "\u{1F1EE}\u{1F1F8}", label: "\xCDslenska", short: "IS" },
    ...ASIAN_LANG_OPTIONS
  ]);
  var SUPPORTED_LANGUAGE_CODES = LANG_OPTIONS.map((l) => l.code);
  var BROWSER_LANG_MAP = Object.freeze({
    cz: "cs",
    gr: "el",
    nb: "no",
    nn: "no",
    in: "id"
  });
  var ZH_TW_PATTERNS = Object.freeze(["zh-tw", "zh-hk", "zh-hant", "zh-mo"]);
  function ui3(nav, home, categories, extra = {}) {
    return __spreadValues({ nav, home, categories }, extra);
  }
  function deepMerge(target, source) {
    const out = __spreadValues({}, target);
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        out[key] = deepMerge(out[key] || {}, source[key]);
      } else {
        out[key] = source[key];
      }
    }
    return out;
  }
  var DE = ui3(
    { home: "Home", map: "Karte", premium: "Premium", favorites: "Favoriten", cart: "Warenkorb", profile: "Profil" },
    {
      heroTitle: "Unterst\xFCtze lokale.<br>Iss bewusst.<br>Lebe besser.",
      heroTagline: "\u{1F30D} Entdecke regionale Produzenten in deiner N\xE4he",
      getLocation: "Standort abrufen",
      findNearby: "Auf der Karte entdecken",
      recommendedTitle: "\u2B50 Empfohlene Landwirte",
      recommendedPlaceholder: "Bald: kuratierte Empfehlungen aus deiner Region.",
      featured: "\u2B50 Empfohlene Produkte",
      ratingNew: "\u2B50 Neu",
      featuredItems: {},
      footerCopyright: "\xA9 2026 Regionaler Geschmack",
      searchPlaceholder: "Produkte, Restaurants, L\xE4den oder Produzenten suchen...",
      hubLabel: "Suche und Schnellzugriff",
      chipsLabel: "Schnellfilter",
      chip: { products: "Produkte", restaurants: "Restaurants", shops: "L\xE4den", farmers: "Landwirte", favorites: "Favoriten" },
      premiumTeaser: "Exklusive Vorteile f\xFCr lokale Entdeckungen",
      categoriesTitle: "Kategorien",
      categoryActionsLabel: "Schnellfilter nach Kategorie"
    },
    {
      all: { name: "Alles", desc: "Alle Kategorien" },
      restaurants: { name: "Restaurants", desc: "Regionale Gerichte" },
      farmers: { name: "Landwirte", desc: "Frische Produkte" },
      bakeries: { name: "B\xE4ckereien", desc: "Frische Backwaren" },
      meat: { name: "Fleisch/Fleischereien", desc: "Regionale Wurstwaren" },
      shops: { name: "L\xE4den", desc: "Lokale Produkte" },
      vending: { name: "Automaten", desc: "24/7" },
      favorites: { name: "Favoriten", desc: "Gespeicherte Orte" }
    },
    {
      a11y: { darkMode: "Dunkelmodus", lightMode: "Hellmodus", chooseLanguage: "Sprache w\xE4hlen", menu: "Men\xFC", premium: "Premium", map: "Karte", searchRadius: "Suchradius in km" },
      map: {
        gps: "GPS",
        osm: "OSM",
        loadError: "Karte konnte nicht geladen werden.",
        dataLoading: "Lade Anbieter\u2026",
        dataCached: "API nicht erreichbar \u2013 gespeicherte Daten werden angezeigt.",
        dataError: "Daten konnten nicht geladen werden.",
        noDataInArea: "Keine Daten in dieser Umgebung.",
        radiusFilter: "\u{1F535} Reichweite: {km} km ({count} Orte)",
        producerList: "Anbieter in Reichweite",
        listToggle: "\u{1F4CB} Liste ({count})",
        edit: "Bearbeiten",
        searchPlaceholder: "Produkte, Restaurants, L\xE4den oder Produzenten suchen...",
        legend: "Legende",
        legendTitle: "Kategorien auf der Karte",
        styleTitle: "Kartenstil",
        categoriesTitle: "Kategorien",
        save: "Speichern",
        reset: "Zur\xFCcksetzen",
        style: { light: "Hell", dark: "Dunkel", satellite: "Satellit", terrain: "Gel\xE4nde" }
      },
      btn: { details: "Details", favorite: "Favorit", favoriteSaved: "Gespeichert", addToCart: "In den Warenkorb", addedToCart: "Hinzugef\xFCgt", navigate: "Navigieren", close: "Schlie\xDFen", back: "Zur\xFCck", remove: "Entfernen", more: "Mehr", less: "Weniger", login: "Anmelden", toMap: "Zur Karte", discover: "Produkte entdecken", checkout: "Zur Kasse", clearCart: "Warenkorb leeren" },
      favorites: { title: "Favoriten", subtitle: "Deine gespeicherten Orte und Produzenten", empty: "Noch keine Favoriten", emptySub: "Markiere Produzenten auf der Karte als Favoriten." },
      cart: { title: "Warenkorb", subtitle: "Deine Eink\xE4ufe bei regionalen Anbietern", empty: "Warenkorb ist leer", emptySub: "F\xFCge Produkte von deinen Lieblingsorten hinzu.", total: "Gesamt", product: "Produkt", confirmClear: "Warenkorb wirklich leeren?" },
      footer: { address: "Polikarski Krzysztof, Germany" },
      shell: { label: "Hauptnavigation" },
      profile: { title: "Profil", subtitle: "Deine Einstellungen", guest: "Gast", guestSub: "Melde dich an, um Favoriten zu speichern und Bestellungen zu verfolgen.", loggedInAs: "Angemeldet als", accountClient: "Kundenkonto", accountProducer: "Unternehmerkonto", consumerSection: "Konsument / Kunde", consumerDesc: "Favoriten, Warenkorb, Bewertungen und Eink\xE4ufe.", producerSection: "Unternehmer / Produzent", producerDesc: "Profil, Produkte, Preise und Aktionen verwalten.", loginAsConsumer: "Als Kunde anmelden", registerAsConsumer: "Als Kunde registrieren", loginAsProducer: "Als Unternehmer anmelden", registerAsProducer: "Als Unternehmer registrieren", settingsTitle: "Allgemeine Einstellungen", darkMode: "Dunkelmodus", notifications: "Benachrichtigungen", language: "Sprache" },
      auth: {
        loginTitle: "Anmelden",
        registerTitle: "Registrieren",
        email: "E-Mail",
        password: "Passwort",
        passwordConfirm: "Passwort best\xE4tigen",
        accountType: "Kontotyp",
        client: "Kunde",
        producer: "Unternehmer / Produzent",
        login: "Anmelden",
        register: "Registrieren",
        logout: "Abmelden",
        loggedOut: "Abgemeldet",
        noAccount: "Noch kein Konto?",
        hasAccount: "Bereits ein Konto?",
        welcome: "Willkommen!",
        trialNote: "Kostenlose Testphase \u2013 Unternehmerkonten werden sp\xE4ter kostenpflichtig.",
        loginAsClient: "Anmeldung \u2013 Kunde",
        loginAsProducer: "Anmeldung \u2013 Unternehmer",
        registerAsClient: "Registrierung \u2013 Kunde",
        registerAsProducer: "Registrierung \u2013 Unternehmer",
        registerCategories: "W\xE4hle deine Kategorien (mehrere m\xF6glich)",
        errors: { invalidEmail: "Ung\xFCltige E-Mail-Adresse.", passwordShort: "Passwort mindestens 6 Zeichen.", passwordMismatch: "Passw\xF6rter stimmen nicht \xFCberein.", emailTaken: "E-Mail bereits registriert.", invalidCredentials: "E-Mail oder Passwort falsch.", wrongAccountType: "Falscher Kontotyp f\xFCr diese Anmeldung.", categoriesRequired: "W\xE4hle mindestens eine Kategorie.", generic: "Anmeldung fehlgeschlagen." }
      },
      clientPanel: {
        title: "Kundenbereich",
        subtitle: "Profil, Bewertungen und Eink\xE4ufe",
        name: "Anzeigename",
        saveProfile: "Profil speichern",
        saved: "Profil gespeichert",
        favoritesTitle: "Favoriten",
        cartTitle: "Warenkorb",
        noFavorites: "Keine Favoriten.",
        noCart: "Warenkorb ist leer.",
        reviewsTitle: "Meine Bewertungen",
        reviewsHint: "Bewertungen kannst du bei Produzenten auf der Karte hinzuf\xFCgen.",
        noReviews: "Noch keine Bewertungen.",
        findToReview: "Produzenten auf der Karte finden",
        ordersTitle: "Bestellhistorie",
        ordersHint: "Demn\xE4chst verf\xFCgbar \u2013 deine Bestellungen erscheinen hier."
      },
      producerPanel: {
        title: "Unternehmerbereich",
        subtitle: "Profil und Angebot verwalten",
        tabProfile: "Profil",
        tabProducts: "Produkte",
        tabPromotions: "Aktionen",
        tabPhotos: "Fotos",
        tabStats: "Statistik",
        name: "Firmenname",
        description: "Beschreibung",
        address: "Adresse",
        phone: "Telefon",
        email: "E-Mail",
        categories: "Kategorien (mehrere m\xF6glich)",
        lat: "Breitengrad",
        lng: "L\xE4ngengrad",
        saveProfile: "Profil speichern",
        saved: "Profil gespeichert",
        productsTitle: "Produkte",
        addProduct: "Produkt hinzuf\xFCgen",
        noProducts: "Noch keine Produkte.",
        saveProducts: "Produkte speichern",
        productsSaved: "Produkte gespeichert",
        productName: "Produktname",
        price: "Preis (\u20AC)",
        unit: "Einheit",
        promo: "Aktion",
        productDescription: "Beschreibung",
        imageUrl: "Bild-URL",
        promotionsTitle: "Aktionen",
        addPromotion: "Aktion hinzuf\xFCgen",
        noPromotions: "Noch keine Aktionen.",
        savePromotions: "Aktionen speichern",
        promotionsSaved: "Aktionen gespeichert",
        promoTitle: "Titel",
        promoDescription: "Beschreibung",
        promoProduct: "Produkt",
        noProductSelected: "\u2014 kein Produkt \u2014",
        discount: "Rabatt",
        photosTitle: "Fotos",
        photoUrl: "Foto-URL",
        addPhoto: "Foto hinzuf\xFCgen",
        noPhotos: "Noch keine Fotos.",
        viewOnMap: "Auf der Karte anzeigen",
        statsTitle: "Statistiken",
        statsHint: "Demn\xE4chst \u2013 Aufrufe, Klicks und Bestellungen."
      },
      msg: { loading: "Lade...", noProducts: "Keine Produkte verf\xFCgbar.", noOfferProducts: "Keine Produkte im Angebot.", servicesOnContact: "Leistungen auf Anfrage verf\xFCgbar.", checkoutSoon: "Kasse \u2013 demn\xE4chst verf\xFCgbar", loginSoon: "Anmeldung \u2013 demn\xE4chst verf\xFCgbar", menuSoon: "Men\xFC \u2013 demn\xE4chst verf\xFCgbar", premiumSoon: "Premium \u2013 demn\xE4chst verf\xFCgbar", locationDenied: "Standortzugriff verweigert.", locationUnavailable: "Standort konnte nicht ermittelt werden.", addedToFavorites: "Zu Favoriten hinzugef\xFCgt", removedFromFavorites: "Aus Favoriten entfernt", addedToCart: "In den Warenkorb gelegt", removedFromCart: "Aus dem Warenkorb entfernt", connectionError: "Verbindungsfehler", viewError: "Der View konnte nicht geladen werden.", error: "Fehler" },
      search: { noResults: "Keine Ergebnisse f\xFCr diese Suche.", noResultsFor: "Keine Ergebnisse f\xFCr die Suche '{query}'", resultsCount: "{count} Ergebnisse" },
      push: {
        title: "Regionaler Geschmack",
        enabled: "Benachrichtigungen aktiviert",
        permissionDenied: "Benachrichtigungen wurden blockiert.",
        newProduct: "Neues Produkt: {name} bei {producer}",
        newPromotion: "Neue Aktion: {title} bei {producer}",
        newOffer: "Neues Angebot bei {producer}"
      },
      pwa: {
        install: "App installieren",
        installHint: "Installiere die App auf dem Startbildschirm f\xFCr schnellen Zugriff \u2013 auch offline.",
        installed: "App installiert",
        dismissed: "Installation abgebrochen"
      },
      producer: {
        openUntil: "Ge\xF6ffnet bis {time}",
        distance: "{distance} m",
        contactTitle: "Kontakt",
        productsTitle: "Produkte",
        promotionsTitle: "Aktionen",
        locationTitle: "Standort",
        phone: "Telefon",
        types: { farmer: "Landwirt", bakery: "B\xE4ckerei", restaurant: "Restaurant", meat: "Metzgerei", shop: "Supermarkt", vending: "Automat", honey: "Imkerei", dairy: "Molkerei", fruit: "Obst", vegetables: "Gem\xFCse", forest: "Walderzeugnisse", other: "Anbieter" }
      },
      product: {
        placeholderImage: "Beispielbild",
        placeholderNote: "Das Foto ist nicht echt. Nur zur Veranschaulichung."
      },
      reviews: {
        title: "Bewertungen",
        add: "Bewertung hinzuf\xFCgen",
        empty: "Noch keine Bewertungen.",
        userName: "Ihr Name",
        rating: "Bewertung",
        comment: "Kommentar",
        imageUrl: "Foto-URL (optional)",
        imageUrlHint: "Link zu einem \xF6ffentlichen Bild (https://\u2026)",
        submit: "Bewertung senden",
        saved: "Bewertung gespeichert"
      },
      productDefault: "Regionales Produkt",
      header: { tagline: "Unterst\xFCtzen lokale, l\xF6sbare L\xF6sungen. Leben besser." },
      premium: {
        title: "Premium",
        subtitle: "Mehr Entdeckungen, mehr Vorteile \u2013 f\xFCr bewussten Genuss aus der Region.",
        featuresTitle: "Premium-Vorteile",
        feature1Title: "Empfehlungen",
        feature1Desc: "Kuratierte regionale Highlights in deiner N\xE4he.",
        feature2Title: "Erweiterte Karte",
        feature2Desc: "Mehr Filter und Routen zu lokalen Anbietern.",
        feature3Title: "Schnelleres Bestellen",
        feature3Desc: "Gespeicherte Pr\xE4ferenzen f\xFCr schnellere Bestellungen.",
        feature4Title: "Angebots-Tracking",
        feature4Desc: "Benachrichtigungen \xFCber Aktionen und Sonderangebote.",
        cta: "Premium freischalten",
        loginRequired: "Melde dich an, um Premium zu nutzen",
        loginHint: "Premium ist nur f\xFCr angemeldete Nutzer verf\xFCgbar.",
        loginBtn: "Anmelden",
        trialBadge: "7 Tage kostenlos testen",
        monthlyPlan: "Monatlich",
        monthlyPrice: "9,99 \u20AC / Monat",
        annualPlan: "J\xE4hrlich",
        annualPrice: "89,99 \u20AC / Jahr",
        annualSave: "25 % sparen",
        selectPlan: "Plan w\xE4hlen",
        activate: "Premium aktivieren",
        activated: "Premium ist aktiv!",
        statusActive: "Premium aktiv",
        trialRemaining: "Noch {days} Tage Testphase",
        expiresOn: "G\xFCltig bis {date}",
        paymentSimulated: "Testmodus \u2013 keine Zahlung (simuliert)",
        benefitsUnlocked: "Premium-Vorteile freigeschaltet",
        planMonthly: "Monatsabo",
        planAnnual: "Jahresabo"
      }
    }
  );
  var EN = ui3(
    { home: "Home", map: "Map", premium: "Premium", favorites: "Favorites", cart: "Cart", profile: "Profile" },
    {
      heroTitle: "Support local.<br>Eat consciously.<br>Live better.",
      heroTagline: "\u{1F30D} Discover regional producers near you",
      getLocation: "Get location",
      findNearby: "Explore on map",
      recommendedTitle: "\u2B50 Recommended farmers",
      recommendedPlaceholder: "Coming soon: curated picks from your region.",
      featured: "\u2B50 Featured products",
      ratingNew: "\u2B50 New",
      featuredItems: {},
      footerCopyright: "\xA9 2026 Regionaler Geschmack",
      searchPlaceholder: "Search products, restaurants, shops or producers...",
      hubLabel: "Search and quick access",
      chipsLabel: "Quick filters",
      chip: { products: "Products", restaurants: "Restaurants", shops: "Shops", farmers: "Farmers", favorites: "Favorites" },
      premiumTeaser: "Exclusive benefits for local discovery",
      categoriesTitle: "Categories",
      categoryActionsLabel: "Quick category filters"
    },
    {
      all: { name: "All", desc: "All categories" },
      restaurants: { name: "Restaurants", desc: "Regional dishes" },
      farmers: { name: "Farmers", desc: "Fresh products" },
      bakeries: { name: "Bakeries", desc: "Fresh baked goods" },
      meat: { name: "Meat / Butchers", desc: "Regional sausages" },
      shops: { name: "Shops", desc: "Local products" },
      vending: { name: "Vending", desc: "24/7" },
      favorites: { name: "Favorites", desc: "Saved places" }
    },
    {
      a11y: { darkMode: "Dark mode", lightMode: "Light mode", chooseLanguage: "Choose language", menu: "Menu", premium: "Premium", map: "Map", searchRadius: "Search radius in km" },
      map: {
        gps: "GPS",
        osm: "OSM",
        loadError: "Map could not be loaded.",
        dataLoading: "Loading providers\u2026",
        dataCached: "API unavailable \u2013 showing saved data.",
        dataError: "Could not load provider data.",
        noDataInArea: "No data in this area.",
        radiusFilter: "\u{1F535} Radius: {km} km ({count} places)",
        producerList: "Providers in range",
        listToggle: "\u{1F4CB} List ({count})",
        edit: "Edit",
        searchPlaceholder: "Search products, restaurants, shops...",
        legend: "Legend",
        legendTitle: "Map categories",
        styleTitle: "Map style",
        categoriesTitle: "Categories",
        save: "Save",
        reset: "Reset",
        style: { light: "Light", dark: "Dark", satellite: "Satellite", terrain: "Terrain" }
      },
      btn: { details: "Details", favorite: "Favorite", favoriteSaved: "Saved", addToCart: "Add to cart", addedToCart: "Added", navigate: "Navigate", close: "Close", back: "Back", remove: "Remove", more: "More", less: "Less", login: "Sign in", toMap: "Go to map", discover: "Discover products", checkout: "Checkout", clearCart: "Clear cart" },
      favorites: { title: "Favorites", subtitle: "Your saved places and producers", empty: "No favorites yet", emptySub: "Mark producers on the map as favorites." },
      cart: { title: "Cart", subtitle: "Your purchases from regional providers", empty: "Cart is empty", emptySub: "Add products from your favorite places.", total: "Total", product: "Product", confirmClear: "Clear the cart?" },
      footer: { address: "Polikarski Krzysztof, Germany" },
      shell: { label: "Main navigation" },
      profile: { title: "Profile", subtitle: "Your settings", guest: "Guest", guestSub: "Sign in to save favorites and track orders.", loggedInAs: "Signed in as", accountClient: "Client account", accountProducer: "Business account", consumerSection: "Consumer / Client", consumerDesc: "Favorites, cart, reviews and purchases.", producerSection: "Business / Producer", producerDesc: "Manage profile, products, prices and promotions.", loginAsConsumer: "Sign in as client", registerAsConsumer: "Register as client", loginAsProducer: "Sign in as business", registerAsProducer: "Register as business", settingsTitle: "General settings", darkMode: "Dark mode", notifications: "Notifications", language: "Language" },
      auth: {
        loginTitle: "Sign in",
        registerTitle: "Register",
        email: "Email",
        password: "Password",
        passwordConfirm: "Confirm password",
        accountType: "Account type",
        client: "Client",
        producer: "Business / Producer",
        login: "Sign in",
        register: "Register",
        logout: "Sign out",
        loggedOut: "Signed out",
        noAccount: "No account yet?",
        hasAccount: "Already have an account?",
        welcome: "Welcome!",
        trialNote: "Free trial period \u2013 business accounts will be paid later.",
        loginAsClient: "Sign in \u2013 client",
        loginAsProducer: "Sign in \u2013 business",
        registerAsClient: "Register \u2013 client",
        registerAsProducer: "Register \u2013 business",
        registerCategories: "Select your categories (multiple allowed)",
        errors: { invalidEmail: "Invalid email address.", passwordShort: "Password must be at least 6 characters.", passwordMismatch: "Passwords do not match.", emailTaken: "Email already registered.", invalidCredentials: "Incorrect email or password.", wrongAccountType: "Wrong account type for this sign-in.", categoriesRequired: "Select at least one category.", generic: "Sign-in failed." }
      },
      clientPanel: {
        title: "Client area",
        subtitle: "Profile, reviews and purchases",
        name: "Display name",
        saveProfile: "Save profile",
        saved: "Profile saved",
        favoritesTitle: "Favorites",
        cartTitle: "Cart",
        noFavorites: "No favorites.",
        noCart: "Cart is empty.",
        reviewsTitle: "My reviews",
        reviewsHint: "Add reviews on producer pages on the map.",
        noReviews: "No reviews yet.",
        findToReview: "Find producers on map",
        ordersTitle: "Order history",
        ordersHint: "Coming soon \u2013 your orders will appear here."
      },
      producerPanel: {
        title: "Business area",
        subtitle: "Manage profile and offers",
        tabProfile: "Profile",
        tabProducts: "Products",
        tabPromotions: "Promotions",
        tabPhotos: "Photos",
        tabStats: "Statistics",
        name: "Business name",
        description: "Description",
        address: "Address",
        phone: "Phone",
        email: "Email",
        categories: "Categories (multiple allowed)",
        lat: "Latitude",
        lng: "Longitude",
        saveProfile: "Save profile",
        saved: "Profile saved",
        productsTitle: "Products",
        addProduct: "Add product",
        noProducts: "No products yet.",
        saveProducts: "Save products",
        productsSaved: "Products saved",
        productName: "Product name",
        price: "Price (\u20AC)",
        unit: "Unit",
        promo: "Promotion",
        productDescription: "Description",
        imageUrl: "Image URL",
        promotionsTitle: "Promotions",
        addPromotion: "Add promotion",
        noPromotions: "No promotions yet.",
        savePromotions: "Save promotions",
        promotionsSaved: "Promotions saved",
        promoTitle: "Title",
        promoDescription: "Description",
        promoProduct: "Product",
        noProductSelected: "\u2014 no product \u2014",
        discount: "Discount",
        photosTitle: "Photos",
        photoUrl: "Photo URL",
        addPhoto: "Add photo",
        noPhotos: "No photos yet.",
        viewOnMap: "View on map",
        statsTitle: "Statistics",
        statsHint: "Coming soon \u2013 views, clicks and orders."
      },
      msg: { loading: "Loading...", noProducts: "No products available.", noOfferProducts: "No products on offer.", servicesOnContact: "Services available on request.", checkoutSoon: "Checkout \u2013 coming soon", loginSoon: "Sign in \u2013 coming soon", menuSoon: "Menu \u2013 coming soon", premiumSoon: "Premium \u2013 coming soon", locationDenied: "Location access denied.", locationUnavailable: "Could not determine your location.", addedToFavorites: "Added to favorites", removedFromFavorites: "Removed from favorites", addedToCart: "Added to cart", removedFromCart: "Removed from cart", connectionError: "Connection error", viewError: "The view could not be loaded.", error: "Error" },
      search: { noResults: "No results for this search.", noResultsFor: "No results for search '{query}'", resultsCount: "{count} results" },
      push: {
        title: "Regionaler Geschmack",
        enabled: "Notifications enabled",
        permissionDenied: "Notifications were blocked.",
        newProduct: "New product: {name} at {producer}",
        newPromotion: "New promotion: {title} at {producer}",
        newOffer: "New offer at {producer}"
      },
      pwa: {
        install: "Install app",
        installHint: "Install the app on your home screen for quick access \u2013 even offline.",
        installed: "App installed",
        dismissed: "Installation cancelled"
      },
      producer: {
        openUntil: "Open until {time}",
        distance: "{distance} m",
        contactTitle: "Contact",
        productsTitle: "Products",
        promotionsTitle: "Promotions",
        locationTitle: "Location",
        phone: "Phone",
        types: { farmer: "Farmer", bakery: "Bakery", restaurant: "Restaurant", meat: "Butcher", shop: "Supermarket", vending: "Vending machine", honey: "Apiary", dairy: "Dairy", fruit: "Fruit", vegetables: "Vegetables", forest: "Forest products", other: "Provider" }
      },
      product: {
        placeholderImage: "Sample photo",
        placeholderNote: "This photo is not real. For illustration only."
      },
      reviews: {
        title: "Reviews",
        add: "Add a review",
        empty: "No reviews yet.",
        userName: "Your name",
        rating: "Rating",
        comment: "Comment",
        imageUrl: "Photo URL (optional)",
        imageUrlHint: "Link to a public image (https://\u2026)",
        submit: "Submit review",
        saved: "Review saved"
      },
      productDefault: "Regional product",
      header: { tagline: "Support local, sustainable solutions. Live better." },
      premium: {
        title: "Premium",
        subtitle: "More discoveries, more benefits \u2013 for conscious regional enjoyment.",
        featuresTitle: "Premium benefits",
        feature1Title: "Recommendations",
        feature1Desc: "Curated regional highlights near you.",
        feature2Title: "Extended map",
        feature2Desc: "More filters and routes to local providers.",
        feature3Title: "Faster ordering",
        feature3Desc: "Saved preferences for quicker checkout.",
        feature4Title: "Offer tracking",
        feature4Desc: "Notifications about promotions and special deals.",
        cta: "Unlock Premium",
        loginRequired: "Sign in to access Premium",
        loginHint: "Premium is available for signed-in users only.",
        loginBtn: "Sign in",
        trialBadge: "7-day free trial",
        monthlyPlan: "Monthly",
        monthlyPrice: "\u20AC9.99 / month",
        annualPlan: "Annual",
        annualPrice: "\u20AC89.99 / year",
        annualSave: "Save 25%",
        selectPlan: "Choose a plan",
        activate: "Activate Premium",
        activated: "Premium is active!",
        statusActive: "Premium active",
        trialRemaining: "{days} days left in trial",
        expiresOn: "Valid until {date}",
        paymentSimulated: "Test mode \u2013 no charge (simulated payment)",
        benefitsUnlocked: "Premium benefits unlocked",
        planMonthly: "Monthly plan",
        planAnnual: "Annual plan"
      }
    }
  );
  var PL = ui3(
    { home: "Start", map: "Mapa", premium: "Premium", favorites: "Ulubione", cart: "Koszyk", profile: "Profil" },
    {
      heroTitle: "Wspieraj lokalnych.<br>Jedz \u015Bwiadomie.<br>\u017Byj lepiej.",
      heroTagline: "\u{1F30D} Odkryj regionalnych producent\xF3w w pobli\u017Cu",
      getLocation: "Pobierz lokalizacj\u0119",
      findNearby: "Odkryj na mapie",
      recommendedTitle: "\u2B50 Polecani rolnicy",
      recommendedPlaceholder: "Wkr\xF3tce: polecane produkty i producenci z Twojej okolicy.",
      featured: "\u2B50 Polecane produkty",
      ratingNew: "\u2B50 Nowy",
      featuredItems: {},
      footerCopyright: "\xA9 2026 Regionaler Geschmack",
      searchPlaceholder: "Szukaj produkt\xF3w, restauracji, sklep\xF3w...",
      hubLabel: "Wyszukiwarka i szybki dost\u0119p",
      chipsLabel: "Szybkie filtry",
      chip: { products: "Produkty", restaurants: "Restauracje", shops: "Sklepy", farmers: "Rolnicy", favorites: "Ulubione" },
      premiumTeaser: "Ekskluzywne korzy\u015Bci z lokalnych odkry\u0107",
      categoriesTitle: "Kategorie",
      categoryActionsLabel: "Szybkie filtry kategorii"
    },
    {
      all: { name: "Wszystkie", desc: "Wszystkie kategorie" },
      restaurants: { name: "Restauracje", desc: "Dania regionalne" },
      farmers: { name: "Rolnicy", desc: "\u015Awie\u017Ce produkty" },
      bakeries: { name: "Piekarnie", desc: "\u015Awie\u017Ce wypieki" },
      meat: { name: "Mi\u0119so / Rze\u017Anie", desc: "Regionalne w\u0119dliny" },
      shops: { name: "Sklepy", desc: "Lokalne produkty" },
      vending: { name: "Automaty", desc: "24/7" },
      favorites: { name: "Ulubione", desc: "Zapisane miejsca" }
    },
    {
      a11y: { darkMode: "Tryb nocny", lightMode: "Tryb dzienny", chooseLanguage: "Wybierz j\u0119zyk", menu: "Menu", premium: "Premium", map: "Mapa", searchRadius: "Promie\u0144 wyszukiwania w km" },
      map: {
        gps: "GPS",
        osm: "OSM",
        loadError: "Nie uda\u0142o si\u0119 za\u0142adowa\u0107 mapy.",
        dataLoading: "\u0141adowanie dostawc\xF3w\u2026",
        dataCached: "API niedost\u0119pne \u2013 wy\u015Bwietlam zapisane dane.",
        dataError: "Nie uda\u0142o si\u0119 za\u0142adowa\u0107 danych.",
        noDataInArea: "Brak danych w tej okolicy.",
        radiusFilter: "\u{1F535} Zasi\u0119g: {km} km ({count} miejsc)",
        producerList: "Producenci w zasi\u0119gu",
        listToggle: "\u{1F4CB} Lista ({count})",
        edit: "Edytuj",
        searchPlaceholder: "Szukaj produkt\xF3w, restauracji, sklep\xF3w...",
        legend: "Legenda",
        legendTitle: "Kategorie na mapie",
        styleTitle: "Styl mapy",
        categoriesTitle: "Kategorie",
        save: "Zapisz",
        reset: "Reset",
        style: { light: "Jasny", dark: "Ciemny", satellite: "Satelita", terrain: "Teren" }
      },
      btn: { details: "Szczeg\xF3\u0142y", favorite: "Ulubione", favoriteSaved: "Zapisano", addToCart: "Dodaj do koszyka", addedToCart: "Dodano", navigate: "Nawiguj", close: "Zamknij", back: "Wr\xF3\u0107", remove: "Usu\u0144", more: "Wi\u0119cej", less: "Mniej", login: "Zaloguj si\u0119", toMap: "Przejd\u017A do mapy", discover: "Odkryj produkty", checkout: "Do kasy", clearCart: "Wyczy\u015B\u0107 koszyk" },
      favorites: { title: "Ulubione", subtitle: "Twoje zapisane miejsca i producenci", empty: "Brak ulubionych", emptySub: "Oznacz producent\xF3w na mapie jako ulubione." },
      cart: { title: "Koszyk", subtitle: "Twoje zakupy u regionalnych dostawc\xF3w", empty: "Koszyk jest pusty", emptySub: "Dodaj produkty z ulubionych miejsc.", total: "Razem", product: "Produkt", confirmClear: "Na pewno wyczy\u015Bci\u0107 koszyk?" },
      footer: { address: "Polikarski Krzysztof, Germany" },
      shell: { label: "G\u0142\xF3wna nawigacja" },
      profile: { title: "Profil", subtitle: "Twoje ustawienia", guest: "Go\u015B\u0107", guestSub: "Zaloguj si\u0119, aby zapisywa\u0107 ulubione i \u015Bledzi\u0107 zam\xF3wienia.", loggedInAs: "Zalogowany jako", accountClient: "Konto klienta", accountProducer: "Konto przedsi\u0119biorcy", consumerSection: "Konsument / Klient", consumerDesc: "Ulubione, koszyk, opinie i zakupy.", producerSection: "Przedsi\u0119biorca / Producent", producerDesc: "Zarz\u0105dzaj profilem, produktami, cenami i promocjami.", loginAsConsumer: "Zaloguj jako klient", registerAsConsumer: "Zarejestruj jako klient", loginAsProducer: "Zaloguj jako przedsi\u0119biorca", registerAsProducer: "Zarejestruj jako przedsi\u0119biorca", settingsTitle: "Ustawienia og\xF3lne", darkMode: "Tryb nocny", notifications: "Powiadomienia", language: "J\u0119zyk" },
      auth: {
        loginTitle: "Logowanie",
        registerTitle: "Rejestracja",
        email: "E-mail",
        password: "Has\u0142o",
        passwordConfirm: "Potwierd\u017A has\u0142o",
        accountType: "Typ konta",
        client: "Klient",
        producer: "Przedsi\u0119biorca / Producent",
        login: "Zaloguj si\u0119",
        register: "Zarejestruj si\u0119",
        logout: "Wyloguj si\u0119",
        loggedOut: "Wylogowano",
        noAccount: "Nie masz konta?",
        hasAccount: "Masz ju\u017C konto?",
        welcome: "Witamy!",
        trialNote: "Okres testowy za darmo \u2013 konta przedsi\u0119biorc\xF3w b\u0119d\u0105 p\u0142atne po testach.",
        loginAsClient: "Logowanie \u2013 klient",
        loginAsProducer: "Logowanie \u2013 przedsi\u0119biorca",
        registerAsClient: "Rejestracja \u2013 klient",
        registerAsProducer: "Rejestracja \u2013 przedsi\u0119biorca",
        registerCategories: "Wybierz kategorie dzia\u0142alno\u015Bci (wiele dozwolone)",
        errors: { invalidEmail: "Nieprawid\u0142owy adres e-mail.", passwordShort: "Has\u0142o musi mie\u0107 min. 6 znak\xF3w.", passwordMismatch: "Has\u0142a nie s\u0105 zgodne.", emailTaken: "E-mail jest ju\u017C zarejestrowany.", invalidCredentials: "Nieprawid\u0142owy e-mail lub has\u0142o.", wrongAccountType: "Niew\u0142a\u015Bciwy typ konta dla tego logowania.", categoriesRequired: "Wybierz co najmniej jedn\u0105 kategori\u0119.", generic: "Logowanie nie powiod\u0142o si\u0119." }
      },
      clientPanel: {
        title: "Panel klienta",
        subtitle: "Profil, opinie i zakupy",
        name: "Nazwa wy\u015Bwietlana",
        saveProfile: "Zapisz profil",
        saved: "Profil zapisany",
        favoritesTitle: "Ulubione",
        cartTitle: "Koszyk",
        noFavorites: "Brak ulubionych.",
        noCart: "Koszyk jest pusty.",
        reviewsTitle: "Moje opinie",
        reviewsHint: "Opinie dodajesz na stronach producent\xF3w na mapie.",
        noReviews: "Brak opinii.",
        findToReview: "Znajd\u017A producent\xF3w na mapie",
        ordersTitle: "Historia zam\xF3wie\u0144",
        ordersHint: "Wkr\xF3tce dost\u0119pne \u2013 Twoje zam\xF3wienia pojawi\u0105 si\u0119 tutaj."
      },
      producerPanel: {
        title: "Panel przedsi\u0119biorcy",
        subtitle: "Zarz\u0105dzaj profilem i ofert\u0105",
        tabProfile: "Profil",
        tabProducts: "Produkty",
        tabPromotions: "Promocje",
        tabPhotos: "Zdj\u0119cia",
        tabStats: "Statystyki",
        name: "Nazwa firmy",
        description: "Opis",
        address: "Adres",
        phone: "Telefon",
        email: "E-mail",
        categories: "Kategorie (wiele dozwolone)",
        lat: "Szeroko\u015B\u0107 geogr.",
        lng: "D\u0142ugo\u015B\u0107 geogr.",
        saveProfile: "Zapisz profil",
        saved: "Profil zapisany",
        productsTitle: "Produkty",
        addProduct: "Dodaj produkt",
        noProducts: "Brak produkt\xF3w.",
        saveProducts: "Zapisz produkty",
        productsSaved: "Produkty zapisane",
        productName: "Nazwa produktu",
        price: "Cena (\u20AC)",
        unit: "Jednostka",
        promo: "Promocja",
        productDescription: "Opis",
        imageUrl: "URL zdj\u0119cia",
        promotionsTitle: "Promocje",
        addPromotion: "Dodaj promocj\u0119",
        noPromotions: "Brak promocji.",
        savePromotions: "Zapisz promocje",
        promotionsSaved: "Promocje zapisane",
        promoTitle: "Tytu\u0142",
        promoDescription: "Opis",
        promoProduct: "Produkt",
        noProductSelected: "\u2014 brak produktu \u2014",
        discount: "Rabat",
        photosTitle: "Zdj\u0119cia",
        photoUrl: "URL zdj\u0119cia",
        addPhoto: "Dodaj zdj\u0119cie",
        noPhotos: "Brak zdj\u0119\u0107.",
        viewOnMap: "Poka\u017C na mapie",
        statsTitle: "Statystyki",
        statsHint: "Wkr\xF3tce \u2013 wy\u015Bwietlenia, klikni\u0119cia i zam\xF3wienia."
      },
      msg: { loading: "\u0141adowanie...", noProducts: "Brak dost\u0119pnych produkt\xF3w.", noOfferProducts: "Brak produkt\xF3w w ofercie.", servicesOnContact: "Us\u0142ugi dost\u0119pne po kontakcie.", checkoutSoon: "Kasa \u2013 wkr\xF3tce dost\u0119pna", loginSoon: "Logowanie \u2013 wkr\xF3tce dost\u0119pne", menuSoon: "Menu \u2013 wkr\xF3tce dost\u0119pne", premiumSoon: "Premium \u2013 wkr\xF3tce dost\u0119pne", locationDenied: "Odmowa dost\u0119pu do lokalizacji.", locationUnavailable: "Nie uda\u0142o si\u0119 ustali\u0107 lokalizacji.", addedToFavorites: "Dodano do ulubionych", removedFromFavorites: "Usuni\u0119to z ulubionych", addedToCart: "Dodano do koszyka", removedFromCart: "Usuni\u0119to z koszyka", connectionError: "B\u0142\u0105d po\u0142\u0105czenia", viewError: "Nie uda\u0142o si\u0119 za\u0142adowa\u0107 widoku.", error: "B\u0142\u0105d" },
      search: { noResults: "Brak wynik\xF3w dla tego wyszukiwania.", noResultsFor: "Brak wynik\xF3w dla wyszukiwania '{query}'", resultsCount: "{count} wynik\xF3w" },
      push: {
        title: "Regionaler Geschmack",
        enabled: "Powiadomienia w\u0142\u0105czone",
        permissionDenied: "Powiadomienia zosta\u0142y zablokowane.",
        newProduct: "Nowy produkt: {name} u {producer}",
        newPromotion: "Nowa promocja: {title} u {producer}",
        newOffer: "Nowa oferta u {producer}"
      },
      pwa: {
        install: "Zainstaluj",
        installHint: "Zainstaluj aplikacj\u0119 na ekranie g\u0142\xF3wnym \u2013 szybki dost\u0119p, tak\u017Ce offline.",
        installed: "Aplikacja zainstalowana",
        dismissed: "Instalacja anulowana"
      },
      producer: {
        openUntil: "Otwarte do {time}",
        distance: "{distance} m",
        contactTitle: "Kontakt",
        productsTitle: "Produkty",
        promotionsTitle: "Promocje",
        locationTitle: "Lokalizacja",
        phone: "Telefon",
        types: { farmer: "Rolnik", bakery: "Piekarnia", restaurant: "Restauracja", meat: "Rze\u017Ania", shop: "Supermarket", vending: "Automat", honey: "Pasieka", dairy: "Nabia\u0142", fruit: "Owoce", vegetables: "Warzywa", forest: "Produkty le\u015Bne", other: "Dostawca" }
      },
      product: {
        placeholderImage: "Zdj\u0119cie pogl\u0105dowe",
        placeholderNote: "Zdj\u0119cie nie jest prawdziwe. To tylko pogl\u0105dowe."
      },
      reviews: {
        title: "Opinie",
        add: "Dodaj opini\u0119",
        empty: "Brak opinii.",
        userName: "Twoje imi\u0119",
        rating: "Ocena",
        comment: "Komentarz",
        imageUrl: "URL zdj\u0119cia (opcjonalnie)",
        imageUrlHint: "Link do publicznego zdj\u0119cia (https://\u2026)",
        submit: "Wy\u015Blij opini\u0119",
        saved: "Opinia zapisana"
      },
      productDefault: "Produkt regionalny",
      header: { tagline: "Wspieraj lokalnych, \u015Bwiadome rozwi\u0105zania. \u017Byj lepiej." },
      premium: {
        title: "Premium",
        subtitle: "Wi\u0119cej odkry\u0107, wi\u0119cej korzy\u015Bci \u2013 dla \u015Bwiadomego regionalnego smaku.",
        featuresTitle: "Korzy\u015Bci Premium",
        feature1Title: "Rekomendacje",
        feature1Desc: "Wyselekcjonowane regionalne propozycje w pobli\u017Cu.",
        feature2Title: "Rozszerzona mapa",
        feature2Desc: "Wi\u0119cej filtr\xF3w i tras do lokalnych dostawc\xF3w.",
        feature3Title: "Szybsze zamawianie",
        feature3Desc: "Zapisane preferencje przyspieszaj\u0105 zam\xF3wienia.",
        feature4Title: "\u015Aledzenie ofert",
        feature4Desc: "Powiadomienia o promocjach i ofertach specjalnych.",
        cta: "Odblokuj Premium",
        loginRequired: "Zaloguj si\u0119, aby uzyska\u0107 dost\u0119p do Premium",
        loginHint: "Premium jest dost\u0119pne tylko dla zalogowanych u\u017Cytkownik\xF3w.",
        loginBtn: "Zaloguj si\u0119",
        trialBadge: "7 dni za darmo",
        monthlyPlan: "Miesi\u0119czny",
        monthlyPrice: "9,99 \u20AC / miesi\u0105c",
        annualPlan: "Roczny",
        annualPrice: "89,99 \u20AC / rok",
        annualSave: "Oszcz\u0119dno\u015B\u0107 25%",
        selectPlan: "Wybierz plan",
        activate: "Aktywuj Premium",
        activated: "Premium jest aktywne!",
        statusActive: "Premium aktywne",
        trialRemaining: "Pozosta\u0142o {days} dni okresu pr\xF3bnego",
        expiresOn: "Wa\u017Cne do {date}",
        paymentSimulated: "Tryb testowy \u2013 bez p\u0142atno\u015Bci (symulacja)",
        benefitsUnlocked: "Korzy\u015Bci Premium odblokowane",
        planMonthly: "Plan miesi\u0119czny",
        planAnnual: "Plan roczny"
      }
    }
  );
  var RU = ui3(
    { home: "\u0413\u043B\u0430\u0432\u043D\u0430\u044F", map: "\u041A\u0430\u0440\u0442\u0430", premium: "\u041F\u0440\u0435\u043C\u0438\u0443\u043C", favorites: "\u0418\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435", cart: "\u041A\u043E\u0440\u0437\u0438\u043D\u0430", profile: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C" },
    {
      heroTitle: "\u041F\u043E\u0434\u0434\u0435\u0440\u0436\u0438 \u043C\u0435\u0441\u0442\u043D\u044B\u0445.<br>\u0415\u0448\u044C \u043E\u0441\u043E\u0437\u043D\u0430\u043D\u043D\u043E.<br>\u0416\u0438\u0432\u0438 \u043B\u0443\u0447\u0448\u0435.",
      heroTagline: "\u{1F30D} \u041E\u0442\u043A\u0440\u043E\u0439 \u0440\u0435\u0433\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0445 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0435\u0439 \u0440\u044F\u0434\u043E\u043C",
      getLocation: "\u041F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u043C\u0435\u0441\u0442\u043E\u043F\u043E\u043B\u043E\u0436\u0435\u043D\u0438\u0435",
      findNearby: "\u041D\u0430\u0439\u0442\u0438 \u0440\u044F\u0434\u043E\u043C",
      recommendedTitle: "\u2B50 \u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u043C\u044B\u0435 \u0444\u0435\u0440\u043C\u0435\u0440\u044B",
      recommendedPlaceholder: "\u0421\u043A\u043E\u0440\u043E: \u043F\u043E\u0434\u0431\u043E\u0440\u043A\u0430 \u0438\u0437 \u0432\u0430\u0448\u0435\u0433\u043E \u0440\u0435\u0433\u0438\u043E\u043D\u0430.",
      featured: "\u2B50 \u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u043C\u044B\u0435 \u0442\u043E\u0432\u0430\u0440\u044B",
      footerCopyright: "\xA9 2026 Regionaler Geschmack"
    },
    {
      all: { name: "\u0412\u0441\u0435", desc: "\u0412\u0441\u0435 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438" },
      restaurants: { name: "\u0420\u0435\u0441\u0442\u043E\u0440\u0430\u043D\u044B", desc: "\u0420\u0435\u0433\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u0431\u043B\u044E\u0434\u0430" },
      farmers: { name: "\u0424\u0435\u0440\u043C\u0435\u0440\u044B", desc: "\u0421\u0432\u0435\u0436\u0438\u0435 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u044B" },
      bakeries: { name: "\u041F\u0435\u043A\u0430\u0440\u043D\u0438", desc: "\u0421\u0432\u0435\u0436\u0430\u044F \u0432\u044B\u043F\u0435\u0447\u043A\u0430" },
      meat: { name: "\u041C\u044F\u0441\u043E / \u041C\u044F\u0441\u043D\u044B\u0435", desc: "\u0420\u0435\u0433\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u043A\u043E\u043B\u0431\u0430\u0441\u044B" },
      shops: { name: "\u041C\u0430\u0433\u0430\u0437\u0438\u043D\u044B", desc: "\u041C\u0435\u0441\u0442\u043D\u044B\u0435 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u044B" },
      vending: { name: "\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u044B", desc: "24/7" },
      favorites: { name: "\u0418\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435", desc: "\u0421\u043E\u0445\u0440\u0430\u043D\u0451\u043D\u043D\u044B\u0435 \u043C\u0435\u0441\u0442\u0430" }
    },
    {
      a11y: { darkMode: "\u0422\u0451\u043C\u043D\u044B\u0439 \u0440\u0435\u0436\u0438\u043C", lightMode: "\u0421\u0432\u0435\u0442\u043B\u044B\u0439 \u0440\u0435\u0436\u0438\u043C", chooseLanguage: "\u0412\u044B\u0431\u043E\u0440 \u044F\u0437\u044B\u043A\u0430", menu: "\u041C\u0435\u043D\u044E", premium: "\u041F\u0440\u0435\u043C\u0438\u0443\u043C", map: "\u041A\u0430\u0440\u0442\u0430", searchRadius: "\u0420\u0430\u0434\u0438\u0443\u0441 \u043F\u043E\u0438\u0441\u043A\u0430 \u0432 \u043A\u043C" },
      map: {
        gps: "GPS",
        osm: "OSM",
        loadError: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043A\u0430\u0440\u0442\u0443.",
        dataLoading: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A\u043E\u0432\u2026",
        dataCached: "API \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D \u2013 \u043F\u043E\u043A\u0430\u0437\u0430\u043D\u044B \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435.",
        dataError: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435."
      },
      btn: { details: "\u041F\u043E\u0434\u0440\u043E\u0431\u043D\u0435\u0435", favorite: "\u0418\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435", favoriteSaved: "\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u043E", addToCart: "\u0412 \u043A\u043E\u0440\u0437\u0438\u043D\u0443", addedToCart: "\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u043E", navigate: "\u041D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F", close: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C", remove: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C", more: "\u0411\u043E\u043B\u044C\u0448\u0435", less: "\u041C\u0435\u043D\u044C\u0448\u0435", login: "\u0412\u043E\u0439\u0442\u0438", toMap: "\u041D\u0430 \u043A\u0430\u0440\u0442\u0443", discover: "\u041D\u0430\u0439\u0442\u0438 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u044B", checkout: "\u041A \u043E\u043F\u043B\u0430\u0442\u0435", clearCart: "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u043A\u043E\u0440\u0437\u0438\u043D\u0443" },
      favorites: { title: "\u0418\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435", subtitle: "\u0412\u0430\u0448\u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D\u043D\u044B\u0435 \u043C\u0435\u0441\u0442\u0430 \u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0438", empty: "\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E", emptySub: "\u041E\u0442\u043C\u0435\u0447\u0430\u0439\u0442\u0435 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0435\u0439 \u043D\u0430 \u043A\u0430\u0440\u0442\u0435." },
      cart: { title: "\u041A\u043E\u0440\u0437\u0438\u043D\u0430", subtitle: "\u0412\u0430\u0448\u0438 \u043F\u043E\u043A\u0443\u043F\u043A\u0438 \u0443 \u0440\u0435\u0433\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0445 \u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A\u043E\u0432", empty: "\u041A\u043E\u0440\u0437\u0438\u043D\u0430 \u043F\u0443\u0441\u0442\u0430", emptySub: "\u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u044B \u0438\u0437 \u043B\u044E\u0431\u0438\u043C\u044B\u0445 \u043C\u0435\u0441\u0442.", total: "\u0418\u0442\u043E\u0433\u043E", product: "\u041F\u0440\u043E\u0434\u0443\u043A\u0442", confirmClear: "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u043A\u043E\u0440\u0437\u0438\u043D\u0443?" },
      footer: { address: "Polikarski Krzysztof, Germany" },
      shell: { label: "\u0413\u043B\u0430\u0432\u043D\u0430\u044F \u043D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F" },
      profile: { title: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C", subtitle: "\u0412\u0430\u0448\u0438 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438", guest: "\u0413\u043E\u0441\u0442\u044C", guestSub: "\u0412\u043E\u0439\u0434\u0438\u0442\u0435, \u0447\u0442\u043E\u0431\u044B \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u0442\u044C \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435 \u0438 \u043E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u0442\u044C \u0437\u0430\u043A\u0430\u0437\u044B.", darkMode: "\u0422\u0451\u043C\u043D\u044B\u0439 \u0440\u0435\u0436\u0438\u043C", notifications: "\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F", language: "\u042F\u0437\u044B\u043A" },
      msg: { loading: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...", noProducts: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0445 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u043E\u0432.", checkoutSoon: "\u041E\u043F\u043B\u0430\u0442\u0430 \u2013 \u0441\u043A\u043E\u0440\u043E", loginSoon: "\u0412\u0445\u043E\u0434 \u2013 \u0441\u043A\u043E\u0440\u043E", addedToFavorites: "\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u043E \u0432 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435", removedFromFavorites: "\u0423\u0434\u0430\u043B\u0435\u043D\u043E \u0438\u0437 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E", addedToCart: "\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u043E \u0432 \u043A\u043E\u0440\u0437\u0438\u043D\u0443", removedFromCart: "\u0423\u0434\u0430\u043B\u0435\u043D\u043E \u0438\u0437 \u043A\u043E\u0440\u0437\u0438\u043D\u044B", connectionError: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u044F", viewError: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u044D\u043A\u0440\u0430\u043D.", error: "\u041E\u0448\u0438\u0431\u043A\u0430" },
      product: { placeholderImage: "\u041F\u0440\u0438\u043C\u0435\u0440 \u0444\u043E\u0442\u043E", placeholderNote: "\u0424\u043E\u0442\u043E \u043D\u0435 \u043D\u0430\u0441\u0442\u043E\u044F\u0449\u0435\u0435. \u0422\u043E\u043B\u044C\u043A\u043E \u0434\u043B\u044F \u043D\u0430\u0433\u043B\u044F\u0434\u043D\u043E\u0441\u0442\u0438." },
      reviews: { title: "\u041E\u0442\u0437\u044B\u0432\u044B", add: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043E\u0442\u0437\u044B\u0432", empty: "\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u043E\u0442\u0437\u044B\u0432\u043E\u0432.", userName: "\u0412\u0430\u0448\u0435 \u0438\u043C\u044F", rating: "\u041E\u0446\u0435\u043D\u043A\u0430", comment: "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439", submit: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C", saved: "\u041E\u0442\u0437\u044B\u0432 \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D" },
      producer: { contactTitle: "\u041A\u043E\u043D\u0442\u0430\u043A\u0442", productsTitle: "\u0422\u043E\u0432\u0430\u0440\u044B", locationTitle: "\u041C\u0435\u0441\u0442\u043E\u043F\u043E\u043B\u043E\u0436\u0435\u043D\u0438\u0435", phone: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D" },
      productDefault: "\u0420\u0435\u0433\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u0440\u043E\u0434\u0443\u043A\u0442",
      search: { noResults: "\u041D\u0435\u0442 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u043E\u0432 \u0434\u043B\u044F \u044D\u0442\u043E\u0433\u043E \u043F\u043E\u0438\u0441\u043A\u0430." }
    }
  );
  var TR = ui3(
    { home: "Ana Sayfa", map: "Harita", premium: "Premium", favorites: "Favoriler", cart: "Sepet", profile: "Profil" },
    {
      heroTitle: "Yerel \xFCreticileri destekle.<br>Bilin\xE7li ye.<br>Daha iyi ya\u015Fa.",
      heroTagline: "\u{1F30D} Yak\u0131n\u0131ndaki b\xF6lgesel \xFCreticileri ke\u015Ffet",
      getLocation: "Konum al",
      findNearby: "Yak\u0131nda bul",
      recommendedTitle: "\u2B50 \xD6nerilen \xE7ift\xE7iler",
      recommendedPlaceholder: "Yak\u0131nda: b\xF6lgenizden se\xE7ilmi\u015F \xF6neriler.",
      featured: "\u2B50 \xD6nerilen \xDCr\xFCnler",
      footerCopyright: "\xA9 2026 Regionaler Geschmack"
    },
    {
      all: { name: "T\xFCm\xFC", desc: "T\xFCm kategoriler" },
      restaurants: { name: "Restoranlar", desc: "B\xF6lgesel yemekler" },
      farmers: { name: "\xC7ift\xE7iler", desc: "Taze \xFCr\xFCnler" },
      bakeries: { name: "F\u0131r\u0131nlar", desc: "Taze f\u0131r\u0131n \xFCr\xFCnleri" },
      meat: { name: "Et / Kasaplar", desc: "B\xF6lgesel sucuklar" },
      shops: { name: "Ma\u011Fazalar", desc: "Yerel \xFCr\xFCnler" },
      vending: { name: "Otomatlar", desc: "7/24" },
      favorites: { name: "Favoriler", desc: "Kay\u0131tl\u0131 yerler" }
    },
    {
      a11y: { darkMode: "Karanl\u0131k mod", lightMode: "Ayd\u0131nl\u0131k mod", chooseLanguage: "Dil se\xE7", menu: "Men\xFC", premium: "Premium", map: "Harita", searchRadius: "Arama yar\u0131\xE7ap\u0131 (km)" },
      map: {
        gps: "GPS",
        osm: "OSM",
        loadError: "Harita y\xFCklenemedi.",
        dataLoading: "Tedarik\xE7iler y\xFCkleniyor\u2026",
        dataCached: "API kullan\u0131lam\u0131yor \u2013 kay\u0131tl\u0131 veriler g\xF6steriliyor.",
        dataError: "Veriler y\xFCklenemedi."
      },
      btn: { details: "Detaylar", favorite: "Favori", favoriteSaved: "Kaydedildi", addToCart: "Sepete ekle", addedToCart: "Eklendi", navigate: "Yol tarifi", close: "Kapat", remove: "Kald\u0131r", more: "Daha fazla", less: "Daha az", login: "Giri\u015F yap", toMap: "Haritaya git", discover: "\xDCr\xFCnleri ke\u015Ffet", checkout: "\xD6deme", clearCart: "Sepeti temizle" },
      favorites: { title: "Favoriler", subtitle: "Kay\u0131tl\u0131 yerlerin ve \xFCreticilerin", empty: "Hen\xFCz favori yok", emptySub: "Haritada \xFCreticileri favorilere ekle." },
      cart: { title: "Sepet", subtitle: "B\xF6lgesel sat\u0131c\u0131lardan al\u0131\u015Fveri\u015Flerin", empty: "Sepet bo\u015F", emptySub: "Favori yerlerinden \xFCr\xFCn ekle.", total: "Toplam", product: "\xDCr\xFCn", confirmClear: "Sepeti temizlemek istedi\u011Fine emin misin?" },
      footer: { address: "Polikarski Krzysztof, Germany" },
      shell: { label: "Ana gezinme" },
      profile: { title: "Profil", subtitle: "Ayarlar\u0131n", guest: "Misafir", guestSub: "Favorileri kaydetmek ve sipari\u015Fleri takip etmek i\xE7in giri\u015F yap.", darkMode: "Karanl\u0131k mod", notifications: "Bildirimler", language: "Dil" },
      msg: { loading: "Y\xFCkleniyor...", noProducts: "\xDCr\xFCn bulunamad\u0131.", checkoutSoon: "\xD6deme \u2013 yak\u0131nda", loginSoon: "Giri\u015F \u2013 yak\u0131nda", addedToFavorites: "Favorilere eklendi", removedFromFavorites: "Favorilerden kald\u0131r\u0131ld\u0131", addedToCart: "Sepete eklendi", removedFromCart: "Sepetten kald\u0131r\u0131ld\u0131", connectionError: "Ba\u011Flant\u0131 hatas\u0131", viewError: "Ekran y\xFCklenemedi.", error: "Hata" },
      product: { placeholderImage: "\xD6rnek foto\u011Fraf", placeholderNote: "Foto\u011Fraf ger\xE7ek de\u011Fil. Sadece \xF6rnek ama\xE7l\u0131." },
      reviews: { title: "Yorumlar", add: "Yorum ekle", empty: "Hen\xFCz yorum yok.", userName: "Ad\u0131n\u0131z", rating: "Puan", comment: "Yorum", submit: "G\xF6nder", saved: "Yorum kaydedildi" },
      producer: { contactTitle: "\u0130leti\u015Fim", productsTitle: "\xDCr\xFCnler", locationTitle: "Konum", phone: "Telefon" },
      productDefault: "B\xF6lgesel \xFCr\xFCn",
      search: { noResults: "Bu arama i\xE7in sonu\xE7 yok." }
    }
  );
  var FR = deepMerge(EN, {
    nav: { home: "Accueil", map: "Carte", premium: "Premium", favorites: "Favoris", cart: "Panier", profile: "Profil" },
    home: { heroTitle: "Soutenez le local.<br>Mangez conscient.<br>Vivez mieux.", heroTagline: "\u{1F30D} D\xE9couvrez les producteurs r\xE9gionaux pr\xE8s de chez vous", getLocation: "Obtenir la position", findNearby: "D\xE9couvrir sur la carte", recommendedTitle: "\u2B50 Agriculteurs recommand\xE9s", recommendedPlaceholder: "Bient\xF4t : s\xE9lection de votre r\xE9gion.", featured: "\u2B50 Produits recommand\xE9s", footerCopyright: "\xA9 2026 Regionaler Geschmack" },
    categories: { all: { name: "Tout", desc: "Toutes cat\xE9gories" }, restaurants: { name: "Restaurants", desc: "Plats r\xE9gionaux" }, farmers: { name: "Agriculteurs", desc: "Produits frais" }, bakeries: { name: "Boulangeries", desc: "Viennoiseries fra\xEEches" }, meat: { name: "Viande / Boucheries", desc: "Charcuteries r\xE9gionales" }, shops: { name: "Magasins", desc: "Produits locaux" }, vending: { name: "Distributeurs", desc: "24/7" }, favorites: { name: "Favoris", desc: "Lieux enregistr\xE9s" } },
    a11y: { darkMode: "Mode sombre", lightMode: "Mode clair", chooseLanguage: "Choisir la langue", menu: "Menu", premium: "Premium", map: "Carte", searchRadius: "Rayon de recherche en km" },
    map: { loadError: "Impossible de charger la carte.", dataLoading: "Chargement des fournisseurs\u2026", dataCached: "API indisponible \u2013 donn\xE9es enregistr\xE9es affich\xE9es.", dataError: "Impossible de charger les donn\xE9es.", radiusFilter: "\u{1F535} Rayon : {km} km ({count} lieux)", searchPlaceholder: "Rechercher produits, restaurants, magasins..." },
    btn: { details: "D\xE9tails", favorite: "Favori", favoriteSaved: "Enregistr\xE9", addToCart: "Ajouter au panier", addedToCart: "Ajout\xE9", navigate: "Naviguer", close: "Fermer", remove: "Supprimer", login: "Connexion", toMap: "Vers la carte", discover: "D\xE9couvrir les produits", checkout: "Paiement", clearCart: "Vider le panier" },
    favorites: { title: "Favoris", subtitle: "Vos lieux et producteurs enregistr\xE9s", empty: "Pas encore de favoris", emptySub: "Marquez des producteurs sur la carte." },
    cart: { title: "Panier", subtitle: "Vos achats chez des fournisseurs r\xE9gionaux", empty: "Panier vide", emptySub: "Ajoutez des produits de vos lieux favoris.", total: "Total" },
    profile: { title: "Profil", subtitle: "Vos param\xE8tres", guest: "Invit\xE9", guestSub: "Connectez-vous pour enregistrer vos favoris.", darkMode: "Mode sombre", notifications: "Notifications", language: "Langue" },
    shell: { label: "Navigation principale" },
    search: { noResults: "Aucun r\xE9sultat pour cette recherche." },
    reviews: { title: "Avis", add: "Ajouter un avis", empty: "Pas encore d'avis.", userName: "Votre nom", rating: "Note", comment: "Commentaire", submit: "Envoyer", saved: "Avis enregistr\xE9" },
    msg: { loading: "Chargement...", noProducts: "Aucun produit disponible.", checkoutSoon: "Paiement \u2013 bient\xF4t", loginSoon: "Connexion \u2013 bient\xF4t", addedToFavorites: "Ajout\xE9 aux favoris", removedFromFavorites: "Retir\xE9 des favoris", addedToCart: "Ajout\xE9 au panier", removedFromCart: "Retir\xE9 du panier", connectionError: "Erreur de connexion", viewError: "Impossible de charger la vue.", error: "Erreur" }
  });
  var ES = deepMerge(EN, {
    nav: { home: "Inicio", map: "Mapa", premium: "Premium", favorites: "Favoritos", cart: "Carrito", profile: "Perfil" },
    home: { heroTitle: "Apoya lo local.<br>Come con conciencia.<br>Vive mejor.", heroTagline: "\u{1F30D} Descubre productores regionales cerca de ti", getLocation: "Obtener ubicaci\xF3n", findNearby: "Explorar en el mapa", recommendedTitle: "\u2B50 Agricultores recomendados", recommendedPlaceholder: "Pronto: selecci\xF3n de tu regi\xF3n.", featured: "\u2B50 Productos destacados", footerCopyright: "\xA9 2026 Regionaler Geschmack" },
    categories: { all: { name: "Todo", desc: "Todas las categor\xEDas" }, restaurants: { name: "Restaurantes", desc: "Platos regionales" }, farmers: { name: "Agricultores", desc: "Productos frescos" }, bakeries: { name: "Panader\xEDas", desc: "Productos de panader\xEDa" }, meat: { name: "Carne / Carnicer\xEDas", desc: "Embutidos regionales" }, shops: { name: "Tiendas", desc: "Productos locales" }, vending: { name: "M\xE1quinas", desc: "24/7" }, favorites: { name: "Favoritos", desc: "Lugares guardados" } },
    a11y: { chooseLanguage: "Elegir idioma", darkMode: "Modo oscuro", lightMode: "Modo claro", menu: "Men\xFA", premium: "Premium", map: "Mapa", searchRadius: "Radio de b\xFAsqueda en km" },
    map: { loadError: "No se pudo cargar el mapa.", dataLoading: "Cargando proveedores\u2026", dataCached: "API no disponible \u2013 mostrando datos guardados.", dataError: "No se pudieron cargar los datos.", radiusFilter: "\u{1F535} Radio: {km} km ({count} lugares)", searchPlaceholder: "Buscar productos, restaurantes, tiendas..." },
    btn: { details: "Detalles", favorite: "Favorito", favoriteSaved: "Guardado", addToCart: "A\xF1adir al carrito", addedToCart: "A\xF1adido", navigate: "Navegar", close: "Cerrar", remove: "Eliminar", login: "Iniciar sesi\xF3n", toMap: "Ir al mapa", discover: "Descubrir productos", checkout: "Pagar", clearCart: "Vaciar carrito" },
    favorites: { title: "Favoritos", subtitle: "Tus lugares y productores guardados", empty: "Sin favoritos a\xFAn", emptySub: "Marca productores en el mapa." },
    cart: { title: "Carrito", subtitle: "Tus compras de proveedores regionales", empty: "Carrito vac\xEDo", emptySub: "A\xF1ade productos de tus lugares favoritos.", total: "Total" },
    profile: { title: "Perfil", subtitle: "Tu configuraci\xF3n", guest: "Invitado", guestSub: "Inicia sesi\xF3n para guardar favoritos.", darkMode: "Modo oscuro", notifications: "Notificaciones", language: "Idioma" },
    shell: { label: "Navegaci\xF3n principal" },
    search: { noResults: "No hay resultados para esta b\xFAsqueda." },
    reviews: { title: "Opiniones", add: "A\xF1adir opini\xF3n", empty: "Sin opiniones a\xFAn.", userName: "Tu nombre", rating: "Valoraci\xF3n", comment: "Comentario", submit: "Enviar", saved: "Opini\xF3n guardada" },
    msg: { loading: "Cargando...", noProducts: "No hay productos disponibles.", checkoutSoon: "Pago \u2013 pr\xF3ximamente", loginSoon: "Inicio de sesi\xF3n \u2013 pr\xF3ximamente", addedToFavorites: "A\xF1adido a favoritos", removedFromFavorites: "Eliminado de favoritos", addedToCart: "A\xF1adido al carrito", removedFromCart: "Eliminado del carrito", connectionError: "Error de conexi\xF3n", viewError: "No se pudo cargar la vista.", error: "Error" }
  });
  var IT = deepMerge(EN, {
    nav: { home: "Home", map: "Mappa", premium: "Premium", favorites: "Preferiti", cart: "Carrello", profile: "Profilo" },
    home: { heroTitle: "Sostieni il locale.<br>Mangia consapevolmente.<br>Vivi meglio.", heroTagline: "\u{1F30D} Scopri i produttori regionali vicino a te", getLocation: "Ottieni posizione", findNearby: "Scopri sulla mappa", recommendedTitle: "\u2B50 Agricoltori consigliati", recommendedPlaceholder: "Presto: selezione dalla tua regione.", featured: "\u2B50 Prodotti consigliati", footerCopyright: "\xA9 2026 Regionaler Geschmack" },
    categories: { all: { name: "Tutto", desc: "Tutte le categorie" }, restaurants: { name: "Ristoranti", desc: "Piatti regionali" }, farmers: { name: "Agricoltori", desc: "Prodotti freschi" }, bakeries: { name: "Panetterie", desc: "Prodotti da forno" }, meat: { name: "Carne / Macellerie", desc: "Salumi regionali" }, shops: { name: "Negozi", desc: "Prodotti locali" }, vending: { name: "Distributori", desc: "24/7" }, favorites: { name: "Preferiti", desc: "Luoghi salvati" } },
    btn: { details: "Dettagli", favorite: "Preferito", favoriteSaved: "Salvato", addToCart: "Aggiungi al carrello", addedToCart: "Aggiunto", navigate: "Naviga", close: "Chiudi", remove: "Rimuovi", login: "Accedi", toMap: "Vai alla mappa", discover: "Scopri prodotti", checkout: "Cassa", clearCart: "Svuota carrello" },
    favorites: { title: "Preferiti", subtitle: "I tuoi luoghi e produttori salvati", empty: "Nessun preferito", emptySub: "Segna i produttori sulla mappa." },
    cart: { title: "Carrello", subtitle: "I tuoi acquisti da fornitori regionali", empty: "Carrello vuoto", emptySub: "Aggiungi prodotti dai tuoi luoghi preferiti.", total: "Totale" },
    profile: { title: "Profilo", subtitle: "Le tue impostazioni", guest: "Ospite", guestSub: "Accedi per salvare i preferiti.", darkMode: "Modalit\xE0 scura", notifications: "Notifiche", language: "Lingua" },
    shell: { label: "Navigazione principale" },
    map: { dataLoading: "Caricamento fornitori\u2026", dataCached: "API non disponibile \u2013 dati salvati mostrati.", dataError: "Impossibile caricare i dati.", radiusFilter: "\u{1F535} Raggio: {km} km ({count} luoghi)", searchPlaceholder: "Cerca prodotti, ristoranti, negozi..." },
    search: { noResults: "Nessun risultato per questa ricerca." },
    reviews: { title: "Recensioni", add: "Aggiungi recensione", empty: "Nessuna recensione.", userName: "Il tuo nome", rating: "Valutazione", comment: "Commento", submit: "Invia", saved: "Recensione salvata" },
    msg: { loading: "Caricamento...", noProducts: "Nessun prodotto disponibile.", checkoutSoon: "Cassa \u2013 presto", loginSoon: "Accesso \u2013 presto", addedToFavorites: "Aggiunto ai preferiti", removedFromFavorites: "Rimosso dai preferiti", addedToCart: "Aggiunto al carrello", removedFromCart: "Rimosso dal carrello", connectionError: "Errore di connessione", viewError: "Impossibile caricare la vista.", error: "Errore" }
  });
  var NL = deepMerge(EN, {
    nav: { home: "Home", map: "Kaart", premium: "Premium", favorites: "Favorieten", cart: "Winkelwagen", profile: "Profiel" },
    home: { heroTitle: "Steun lokaal.<br>Eet bewust.<br>Leef beter.", heroTagline: "\u{1F30D} Ontdek regionale producenten bij jou in de buurt", getLocation: "Locatie ophalen", findNearby: "Ontdek op de kaart", recommendedTitle: "\u2B50 Aanbevolen boeren", recommendedPlaceholder: "Binnenkort: selectie uit jouw regio.", featured: "\u2B50 Aanbevolen producten", footerCopyright: "\xA9 2026 Regionaler Geschmack" },
    categories: { all: { name: "Alles", desc: "Alle categorie\xEBn" }, restaurants: { name: "Restaurants", desc: "Regionale gerechten" }, farmers: { name: "Boeren", desc: "Verse producten" }, bakeries: { name: "Bakkerijen", desc: "Vers gebak" }, meat: { name: "Vlees / Slagerijen", desc: "Regionale worst" }, shops: { name: "Winkels", desc: "Lokale producten" }, vending: { name: "Automaten", desc: "24/7" }, favorites: { name: "Favorieten", desc: "Opgeslagen plaatsen" } },
    btn: { details: "Details", favorite: "Favoriet", favoriteSaved: "Opgeslagen", addToCart: "In winkelwagen", addedToCart: "Toegevoegd", navigate: "Navigeren", close: "Sluiten", remove: "Verwijderen", login: "Inloggen", toMap: "Naar kaart", discover: "Producten ontdekken", checkout: "Afrekenen", clearCart: "Winkelwagen legen" },
    favorites: { title: "Favorieten", subtitle: "Je opgeslagen plaatsen en producenten", empty: "Nog geen favorieten", emptySub: "Markeer producenten op de kaart." },
    cart: { title: "Winkelwagen", subtitle: "Je aankopen bij regionale aanbieders", empty: "Winkelwagen is leeg", emptySub: "Voeg producten toe van favoriete plaatsen.", total: "Totaal" },
    profile: { title: "Profiel", subtitle: "Je instellingen", guest: "Gast", guestSub: "Log in om favorieten op te slaan.", darkMode: "Donkere modus", notifications: "Meldingen", language: "Taal" },
    shell: { label: "Hoofdnavigatie" },
    map: { dataLoading: "Aanbieders laden\u2026", dataCached: "API niet beschikbaar \u2013 opgeslagen gegevens worden getoond.", dataError: "Gegevens konden niet worden geladen.", radiusFilter: "\u{1F535} Bereik: {km} km ({count} plaatsen)", searchPlaceholder: "Zoek producten, restaurants, winkels..." },
    search: { noResults: "Geen resultaten voor deze zoekopdracht." },
    reviews: { title: "Beoordelingen", add: "Beoordeling toevoegen", empty: "Nog geen beoordelingen.", userName: "Uw naam", rating: "Beoordeling", comment: "Opmerking", submit: "Verzenden", saved: "Beoordeling opgeslagen" },
    msg: { loading: "Laden...", noProducts: "Geen producten beschikbaar.", checkoutSoon: "Afrekenen \u2013 binnenkort", loginSoon: "Inloggen \u2013 binnenkort", addedToFavorites: "Toegevoegd aan favorieten", removedFromFavorites: "Verwijderd uit favorieten", addedToCart: "Toegevoegd aan winkelwagen", removedFromCart: "Verwijderd uit winkelwagen", connectionError: "Verbindingsfout", viewError: "Weergave kon niet worden geladen.", error: "Fout" }
  });
  var CATALOG_TRANSLATIONS = Object.freeze(__spreadValues({
    pl: {},
    en: {},
    ru: {},
    tr: {}
  }, ASIAN_CATALOG));
  var EXTRA_LANGS = {
    cs: { nav: { home: "Dom\u016F", map: "Mapa", favorites: "Obl\xEDben\xE9", cart: "Ko\u0161\xEDk", profile: "Profil" }, home: { getLocation: "Z\xEDskat polohu", findNearby: "Naj\xEDt v okol\xED" }, btn: { details: "Podrobnosti", addToCart: "Do ko\u0161\xEDku", navigate: "Navigovat", close: "Zav\u0159\xEDt" } },
    sk: { nav: { home: "Domov", map: "Mapa", favorites: "Ob\u013E\xFAben\xE9", cart: "Ko\u0161\xEDk", profile: "Profil" }, home: { getLocation: "Z\xEDska\u0165 polohu", findNearby: "N\xE1js\u0165 v okol\xED" }, btn: { details: "Podrobnosti", addToCart: "Do ko\u0161\xEDka", navigate: "Navigova\u0165", close: "Zavrie\u0165" } },
    hu: { nav: { home: "Kezd\u0151lap", map: "T\xE9rk\xE9p", favorites: "Kedvencek", cart: "Kos\xE1r", profile: "Profil" }, home: { getLocation: "Helymeghat\xE1roz\xE1s", findNearby: "K\xF6zeli keres\xE9s" }, btn: { details: "R\xE9szletek", addToCart: "Kos\xE1rba", navigate: "Navig\xE1ci\xF3", close: "Bez\xE1r\xE1s" } },
    ro: { nav: { home: "Acas\u0103", map: "Hart\u0103", favorites: "Favorite", cart: "Co\u0219", profile: "Profil" }, home: { getLocation: "Ob\u021Bine loca\u021Bia", findNearby: "G\u0103se\u0219te \xEEn apropiere" }, btn: { details: "Detalii", addToCart: "Adaug\u0103 \xEEn co\u0219", navigate: "Navigare", close: "\xCEnchide" } },
    bg: { nav: { home: "\u041D\u0430\u0447\u0430\u043B\u043E", map: "\u041A\u0430\u0440\u0442\u0430", favorites: "\u041B\u044E\u0431\u0438\u043C\u0438", cart: "\u041A\u043E\u043B\u0438\u0447\u043A\u0430", profile: "\u041F\u0440\u043E\u0444\u0438\u043B" }, home: { getLocation: "\u0412\u0437\u0435\u043C\u0438 \u043C\u0435\u0441\u0442\u043E\u043F\u043E\u043B\u043E\u0436\u0435\u043D\u0438\u0435", findNearby: "\u041D\u0430\u043C\u0435\u0440\u0438 \u043D\u0430\u0431\u043B\u0438\u0437\u043E" }, btn: { details: "\u041F\u043E\u0434\u0440\u043E\u0431\u043D\u043E\u0441\u0442\u0438", addToCart: "\u0412 \u043A\u043E\u043B\u0438\u0447\u043A\u0430\u0442\u0430", navigate: "\u041D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F", close: "\u0417\u0430\u0442\u0432\u043E\u0440\u0438" } },
    el: { nav: { home: "\u0391\u03C1\u03C7\u03B9\u03BA\u03AE", map: "\u03A7\u03AC\u03C1\u03C4\u03B7\u03C2", favorites: "\u0391\u03B3\u03B1\u03C0\u03B7\u03BC\u03AD\u03BD\u03B1", cart: "\u039A\u03B1\u03BB\u03AC\u03B8\u03B9", profile: "\u03A0\u03C1\u03BF\u03C6\u03AF\u03BB" }, home: { getLocation: "\u039B\u03AE\u03C8\u03B7 \u03C4\u03BF\u03C0\u03BF\u03B8\u03B5\u03C3\u03AF\u03B1\u03C2", findNearby: "\u0395\u03CD\u03C1\u03B5\u03C3\u03B7 \u03BA\u03BF\u03BD\u03C4\u03AC" }, btn: { details: "\u039B\u03B5\u03C0\u03C4\u03BF\u03BC\u03AD\u03C1\u03B5\u03B9\u03B5\u03C2", addToCart: "\u03A3\u03C4\u03BF \u03BA\u03B1\u03BB\u03AC\u03B8\u03B9", navigate: "\u03A0\u03BB\u03BF\u03AE\u03B3\u03B7\u03C3\u03B7", close: "\u039A\u03BB\u03B5\u03AF\u03C3\u03B9\u03BC\u03BF" } },
    hr: { nav: { home: "Po\u010Detna", map: "Karta", favorites: "Favoriti", cart: "Ko\u0161arica", profile: "Profil" }, home: { getLocation: "Dohvati lokaciju", findNearby: "Prona\u0111i u blizini" }, btn: { details: "Detalji", addToCart: "U ko\u0161aricu", navigate: "Navigacija", close: "Zatvori" } },
    sr: { nav: { home: "\u041F\u043E\u0447\u0435\u0442\u043D\u0430", map: "\u041C\u0430\u043F\u0430", favorites: "\u041E\u043C\u0438\u0459\u0435\u043D\u043E", cart: "\u041A\u043E\u0440\u043F\u0430", profile: "\u041F\u0440\u043E\u0444\u0438\u043B" }, home: { getLocation: "\u041F\u0440\u0435\u0443\u0437\u043C\u0438 \u043B\u043E\u043A\u0430\u0446\u0438\u0458\u0443", findNearby: "\u041F\u0440\u043E\u043D\u0430\u0452\u0438 \u0443 \u0431\u043B\u0438\u0437\u0438\u043D\u0438" }, btn: { details: "\u0414\u0435\u0442\u0430\u0459\u0438", addToCart: "\u0423 \u043A\u043E\u0440\u043F\u0443", navigate: "\u041D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u0458\u0430", close: "\u0417\u0430\u0442\u0432\u043E\u0440\u0438" } },
    sl: { nav: { home: "Domov", map: "Zemljevid", favorites: "Priljubljeno", cart: "Ko\u0161arica", profile: "Profil" }, home: { getLocation: "Pridobi lokacijo", findNearby: "Najdi v bli\u017Eini" }, btn: { details: "Podrobnosti", addToCart: "V ko\u0161arico", navigate: "Navigacija", close: "Zapri" } },
    lt: { nav: { home: "Prad\u017Eia", map: "\u017Dem\u0117lapis", favorites: "M\u0117gstami", cart: "Krep\u0161elis", profile: "Profilis" }, home: { getLocation: "Gauti viet\u0105", findNearby: "Rasti netoliese" }, btn: { details: "I\u0161samiau", addToCart: "\u012E krep\u0161el\u012F", navigate: "Navigacija", close: "U\u017Edaryti" } },
    lv: { nav: { home: "S\u0101kums", map: "Karte", favorites: "Izlase", cart: "Grozs", profile: "Profils" }, home: { getLocation: "Ieg\u016Bt atra\u0161an\u0101s vietu", findNearby: "Atrast tuvum\u0101" }, btn: { details: "Deta\u013Cas", addToCart: "Pievienot grozam", navigate: "Navig\u0101cija", close: "Aizv\u0113rt" } },
    et: { nav: { home: "Avaleht", map: "Kaart", favorites: "Lemmikud", cart: "Ostukorv", profile: "Profiil" }, home: { getLocation: "Hangi asukoht", findNearby: "Leia l\xE4hedalt" }, btn: { details: "\xDCksikasjad", addToCart: "Lisa korvi", navigate: "Navigeeri", close: "Sulge" } },
    fi: { nav: { home: "Koti", map: "Kartta", favorites: "Suosikit", cart: "Ostoskori", profile: "Profiili" }, home: { getLocation: "Hae sijainti", findNearby: "Etsi l\xE4helt\xE4" }, btn: { details: "Tiedot", addToCart: "Lis\xE4\xE4 koriin", navigate: "Navigoi", close: "Sulje" } },
    sv: { nav: { home: "Hem", map: "Karta", favorites: "Favoriter", cart: "Varukorg", profile: "Profil" }, home: { getLocation: "H\xE4mta plats", findNearby: "Hitta i n\xE4rheten" }, btn: { details: "Detaljer", addToCart: "L\xE4gg i varukorg", navigate: "Navigera", close: "St\xE4ng" } },
    no: { nav: { home: "Hjem", map: "Kart", favorites: "Favoritter", cart: "Handlekurv", profile: "Profil" }, home: { getLocation: "Hent posisjon", findNearby: "Finn i n\xE6rheten" }, btn: { details: "Detaljer", addToCart: "Legg i handlekurv", navigate: "Naviger", close: "Lukk" } },
    da: { nav: { home: "Hjem", map: "Kort", favorites: "Favoritter", cart: "Kurv", profile: "Profil" }, home: { getLocation: "Hent placering", findNearby: "Find i n\xE6rheden" }, btn: { details: "Detaljer", addToCart: "Tilf\xF8j til kurv", navigate: "Naviger", close: "Luk" } },
    is: { nav: { home: "Heim", map: "Kort", favorites: "Upp\xE1hald", cart: "Karfa", profile: "Pr\xF3f\xEDll" }, home: { getLocation: "F\xE1 sta\xF0setningu", findNearby: "Finna n\xE1l\xE6gt" }, btn: { details: "N\xE1nar", addToCart: "Setja \xED k\xF6rfu", navigate: "Lei\xF0s\xF6gn", close: "Loka" } }
  };
  var HOME_FEATURED_I18N = Object.freeze({
    zh: "\u2B50 \u63A8\u8350\u4EA7\u54C1",
    "zh-tw": "\u2B50 \u63A8\u85A6\u7522\u54C1",
    ja: "\u2B50 \u304A\u3059\u3059\u3081\u5546\u54C1",
    ko: "\u2B50 \uCD94\uCC9C \uC81C\uD488",
    vi: "\u2B50 S\u1EA3n ph\u1EA9m \u0111\u01B0\u1EE3c \u0111\u1EC1 xu\u1EA5t",
    ms: "\u2B50 Produk disyorkan",
    id: "\u2B50 Produk rekomendasi",
    th: "\u2B50 \u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32\u0E41\u0E19\u0E30\u0E19\u0E33",
    hi: "\u2B50 \u0905\u0928\u0941\u0936\u0902\u0938\u093F\u0924 \u0909\u0924\u094D\u092A\u093E\u0926",
    cs: "\u2B50 Doporu\u010Den\xE9 produkty",
    sk: "\u2B50 Odpor\xFA\u010Dan\xE9 produkty",
    hu: "\u2B50 Aj\xE1nlott term\xE9kek",
    ro: "\u2B50 Produse recomandate",
    bg: "\u2B50 \u041F\u0440\u0435\u043F\u043E\u0440\u044A\u0447\u0430\u043D\u0438 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0438",
    el: "\u2B50 \u03A0\u03C1\u03BF\u03C4\u03B5\u03B9\u03BD\u03CC\u03BC\u03B5\u03BD\u03B1 \u03C0\u03C1\u03BF\u03CA\u03CC\u03BD\u03C4\u03B1",
    hr: "\u2B50 Preporu\u010Deni proizvodi",
    sr: "\u2B50 \u041F\u0440\u0435\u043F\u043E\u0440\u0443\u0447\u0435\u043D\u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438",
    mk: "\u2B50 \u041F\u0440\u0435\u043F\u043E\u0440\u0430\u0447\u0430\u043D\u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438",
    sl: "\u2B50 Priporo\u010Deni izdelki",
    lt: "\u2B50 Rekomenduojami produktai",
    lv: "\u2B50 Ieteicamie produkti",
    et: "\u2B50 Soovitatud tooted",
    fi: "\u2B50 Suositellut tuotteet",
    sv: "\u2B50 Rekommenderade produkter",
    no: "\u2B50 Anbefalte produkter",
    da: "\u2B50 Anbefalede produkter",
    is: "\u2B50 M\xE6lt me\xF0 v\xF6rum"
  });
  var built = __spreadValues({ de: DE, en: EN, pl: PL, ru: RU, tr: TR, fr: FR, es: ES, it: IT, nl: NL, mk: MK }, ASIAN_TRANSLATIONS);
  for (const [code, overrides] of Object.entries(EXTRA_LANGS)) {
    built[code] = deepMerge(EN, overrides);
  }
  var EU_UI_CORE = {
    cs: { favorites: { empty: "Zat\xEDm \u017E\xE1dn\xE9 obl\xEDben\xE9" }, cart: { empty: "Ko\u0161\xEDk je pr\xE1zdn\xFD", total: "Celkem" }, search: { noResults: "\u017D\xE1dn\xE9 v\xFDsledky pro tento dotaz." }, map: { dataLoading: "Na\u010D\xEDt\xE1n\xED dodavatel\u016F\u2026", dataCached: "API nedostupn\xE9 \u2013 zobrazena ulo\u017Een\xE1 data.", dataError: "Data se nepoda\u0159ilo na\u010D\xEDst.", radiusFilter: "\u{1F535} Dosah: {km} km ({count} m\xEDst)" }, msg: { addedToFavorites: "P\u0159id\xE1no do obl\xEDben\xFDch", removedFromFavorites: "Odebr\xE1no z obl\xEDben\xFDch", addedToCart: "P\u0159id\xE1no do ko\u0161\xEDku", removedFromCart: "Odebr\xE1no z ko\u0161\xEDku", connectionError: "Chyba p\u0159ipojen\xED" }, reviews: { title: "Recenze", add: "P\u0159idat recenzi", userName: "Va\u0161e jm\xE9no", rating: "Hodnocen\xED", comment: "Koment\xE1\u0159" }, shell: { label: "Hlavn\xED navigace" } },
    sk: { favorites: { empty: "Zatia\u013E \u017Eiadne ob\u013E\xFAben\xE9" }, cart: { empty: "Ko\u0161\xEDk je pr\xE1zdny", total: "Spolu" }, search: { noResults: "\u017Diadne v\xFDsledky pre tento dotaz." }, map: { dataLoading: "Na\u010D\xEDtavanie dod\xE1vate\u013Eov\u2026", dataCached: "API nedostupn\xE9 \u2013 zobrazen\xE9 ulo\u017Een\xE9 d\xE1ta.", dataError: "Nepodarilo sa na\u010D\xEDta\u0165 d\xE1ta.", radiusFilter: "\u{1F535} Dosah: {km} km ({count} miest)" }, msg: { addedToFavorites: "Pridan\xE9 do ob\u013E\xFAben\xFDch", removedFromFavorites: "Odstr\xE1nen\xE9 z ob\u013E\xFAben\xFDch", addedToCart: "Pridan\xE9 do ko\u0161\xEDka", removedFromCart: "Odstr\xE1nen\xE9 z ko\u0161\xEDka", connectionError: "Chyba pripojenia" }, reviews: { title: "Recenzie", add: "Prida\u0165 recenziu", userName: "Va\u0161e meno", rating: "Hodnotenie", comment: "Koment\xE1r" }, shell: { label: "Hlavn\xE1 navig\xE1cia" } },
    hu: { favorites: { empty: "M\xE9g nincs kedvenc" }, cart: { empty: "A kos\xE1r \xFCres", total: "\xD6sszesen" }, search: { noResults: "Nincs tal\xE1lat erre a keres\xE9sre." }, map: { dataLoading: "Szolg\xE1ltat\xF3k bet\xF6lt\xE9se\u2026", dataCached: "API nem el\xE9rhet\u0151 \u2013 mentett adatok megjelen\xEDt\xE9se.", dataError: "Az adatok bet\xF6lt\xE9se sikertelen.", radiusFilter: "\u{1F535} Hat\xF3t\xE1v: {km} km ({count} hely)" }, msg: { addedToFavorites: "Hozz\xE1adva a kedvencekhez", removedFromFavorites: "Elt\xE1vol\xEDtva a kedvencekb\u0151l", addedToCart: "Kos\xE1rba adva", removedFromCart: "Elt\xE1vol\xEDtva a kos\xE1rb\xF3l", connectionError: "Kapcsolati hiba" }, reviews: { title: "\xC9rt\xE9kel\xE9sek", add: "\xC9rt\xE9kel\xE9s hozz\xE1ad\xE1sa", userName: "Neved", rating: "\xC9rt\xE9kel\xE9s", comment: "Hozz\xE1sz\xF3l\xE1s" }, shell: { label: "F\u0151 navig\xE1ci\xF3" } },
    ro: { favorites: { empty: "Niciun favorit \xEEnc\u0103" }, cart: { empty: "Co\u0219ul este gol", total: "Total" }, search: { noResults: "Niciun rezultat pentru aceast\u0103 c\u0103utare." }, map: { dataLoading: "Se \xEEncarc\u0103 furnizorii\u2026", dataCached: "API indisponibil \u2013 date salvate afi\u0219ate.", dataError: "Datele nu au putut fi \xEEnc\u0103rcate.", radiusFilter: "\u{1F535} Raz\u0103: {km} km ({count} locuri)" }, msg: { addedToFavorites: "Ad\u0103ugat la favorite", removedFromFavorites: "Eliminat din favorite", addedToCart: "Ad\u0103ugat \xEEn co\u0219", removedFromCart: "Eliminat din co\u0219", connectionError: "Eroare de conexiune" }, reviews: { title: "Recenzii", add: "Adaug\u0103 recenzie", userName: "Numele t\u0103u", rating: "Evaluare", comment: "Comentariu" }, shell: { label: "Navigare principal\u0103" } },
    bg: { favorites: { empty: "\u0412\u0441\u0435 \u043E\u0449\u0435 \u043D\u044F\u043C\u0430 \u043B\u044E\u0431\u0438\u043C\u0438" }, cart: { empty: "\u041A\u043E\u043B\u0438\u0447\u043A\u0430\u0442\u0430 \u0435 \u043F\u0440\u0430\u0437\u043D\u0430", total: "\u041E\u0431\u0449\u043E" }, search: { noResults: "\u041D\u044F\u043C\u0430 \u0440\u0435\u0437\u0443\u043B\u0442\u0430\u0442\u0438 \u0437\u0430 \u0442\u043E\u0432\u0430 \u0442\u044A\u0440\u0441\u0435\u043D\u0435." }, map: { dataLoading: "\u0417\u0430\u0440\u0435\u0436\u0434\u0430\u043D\u0435 \u043D\u0430 \u0434\u043E\u0441\u0442\u0430\u0432\u0447\u0438\u0446\u0438\u2026", dataCached: "API \u043D\u0435\u0434\u043E\u0441\u0442\u044A\u043F\u043D\u043E \u2013 \u043F\u043E\u043A\u0430\u0437\u0430\u043D\u0438 \u0437\u0430\u043F\u0430\u0437\u0435\u043D\u0438 \u0434\u0430\u043D\u043D\u0438.", dataError: "\u0414\u0430\u043D\u043D\u0438\u0442\u0435 \u043D\u0435 \u043C\u043E\u0436\u0430\u0445\u0430 \u0434\u0430 \u0441\u0435 \u0437\u0430\u0440\u0435\u0434\u044F\u0442.", radiusFilter: "\u{1F535} \u041E\u0431\u0445\u0432\u0430\u0442: {km} \u043A\u043C ({count} \u043C\u0435\u0441\u0442\u0430)" }, msg: { addedToFavorites: "\u0414\u043E\u0431\u0430\u0432\u0435\u043D\u043E \u0432 \u043B\u044E\u0431\u0438\u043C\u0438", removedFromFavorites: "\u041F\u0440\u0435\u043C\u0430\u0445\u043D\u0430\u0442\u043E \u043E\u0442 \u043B\u044E\u0431\u0438\u043C\u0438", addedToCart: "\u0414\u043E\u0431\u0430\u0432\u0435\u043D\u043E \u0432 \u043A\u043E\u043B\u0438\u0447\u043A\u0430\u0442\u0430", removedFromCart: "\u041F\u0440\u0435\u043C\u0430\u0445\u043D\u0430\u0442\u043E \u043E\u0442 \u043A\u043E\u043B\u0438\u0447\u043A\u0430\u0442\u0430", connectionError: "\u0413\u0440\u0435\u0448\u043A\u0430 \u043F\u0440\u0438 \u0432\u0440\u044A\u0437\u043A\u0430" }, reviews: { title: "\u041E\u0442\u0437\u0438\u0432\u0438", add: "\u0414\u043E\u0431\u0430\u0432\u0438 \u043E\u0442\u0437\u0438\u0432", userName: "\u0412\u0430\u0448\u0435\u0442\u043E \u0438\u043C\u0435", rating: "\u041E\u0446\u0435\u043D\u043A\u0430", comment: "\u041A\u043E\u043C\u0435\u043D\u0442\u0430\u0440" }, shell: { label: "\u041E\u0441\u043D\u043E\u0432\u043D\u0430 \u043D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F" } },
    el: { favorites: { empty: "\u0394\u03B5\u03BD \u03C5\u03C0\u03AC\u03C1\u03C7\u03BF\u03C5\u03BD \u03B1\u03B3\u03B1\u03C0\u03B7\u03BC\u03AD\u03BD\u03B1 \u03B1\u03BA\u03CC\u03BC\u03B1" }, cart: { empty: "\u03A4\u03BF \u03BA\u03B1\u03BB\u03AC\u03B8\u03B9 \u03B5\u03AF\u03BD\u03B1\u03B9 \u03AC\u03B4\u03B5\u03B9\u03BF", total: "\u03A3\u03CD\u03BD\u03BF\u03BB\u03BF" }, search: { noResults: "\u0394\u03B5\u03BD \u03C5\u03C0\u03AC\u03C1\u03C7\u03BF\u03C5\u03BD \u03B1\u03C0\u03BF\u03C4\u03B5\u03BB\u03AD\u03C3\u03BC\u03B1\u03C4\u03B1 \u03B3\u03B9\u03B1 \u03B1\u03C5\u03C4\u03AE \u03C4\u03B7\u03BD \u03B1\u03BD\u03B1\u03B6\u03AE\u03C4\u03B7\u03C3\u03B7." }, map: { dataLoading: "\u03A6\u03CC\u03C1\u03C4\u03C9\u03C3\u03B7 \u03C0\u03B1\u03C1\u03CC\u03C7\u03C9\u03BD\u2026", dataCached: "API \u03BC\u03B7 \u03B4\u03B9\u03B1\u03B8\u03AD\u03C3\u03B9\u03BC\u03BF \u2013 \u03B5\u03BC\u03C6\u03AC\u03BD\u03B9\u03C3\u03B7 \u03B1\u03C0\u03BF\u03B8\u03B7\u03BA\u03B5\u03C5\u03BC\u03AD\u03BD\u03C9\u03BD \u03B4\u03B5\u03B4\u03BF\u03BC\u03AD\u03BD\u03C9\u03BD.", dataError: "\u0391\u03C0\u03BF\u03C4\u03C5\u03C7\u03AF\u03B1 \u03C6\u03CC\u03C1\u03C4\u03C9\u03C3\u03B7\u03C2 \u03B4\u03B5\u03B4\u03BF\u03BC\u03AD\u03BD\u03C9\u03BD.", radiusFilter: "\u{1F535} \u0395\u03BC\u03B2\u03AD\u03BB\u03B5\u03B9\u03B1: {km} \u03C7\u03BB\u03BC ({count} \u03BC\u03AD\u03C1\u03B7)" }, msg: { addedToFavorites: "\u03A0\u03C1\u03BF\u03C3\u03C4\u03AD\u03B8\u03B7\u03BA\u03B5 \u03C3\u03C4\u03B1 \u03B1\u03B3\u03B1\u03C0\u03B7\u03BC\u03AD\u03BD\u03B1", removedFromFavorites: "\u0391\u03C6\u03B1\u03B9\u03C1\u03AD\u03B8\u03B7\u03BA\u03B5 \u03B1\u03C0\u03CC \u03C4\u03B1 \u03B1\u03B3\u03B1\u03C0\u03B7\u03BC\u03AD\u03BD\u03B1", addedToCart: "\u03A0\u03C1\u03BF\u03C3\u03C4\u03AD\u03B8\u03B7\u03BA\u03B5 \u03C3\u03C4\u03BF \u03BA\u03B1\u03BB\u03AC\u03B8\u03B9", removedFromCart: "\u0391\u03C6\u03B1\u03B9\u03C1\u03AD\u03B8\u03B7\u03BA\u03B5 \u03B1\u03C0\u03CC \u03C4\u03BF \u03BA\u03B1\u03BB\u03AC\u03B8\u03B9", connectionError: "\u03A3\u03C6\u03AC\u03BB\u03BC\u03B1 \u03C3\u03CD\u03BD\u03B4\u03B5\u03C3\u03B7\u03C2" }, reviews: { title: "\u039A\u03C1\u03B9\u03C4\u03B9\u03BA\u03AD\u03C2", add: "\u03A0\u03C1\u03BF\u03C3\u03B8\u03AE\u03BA\u03B7 \u03BA\u03C1\u03B9\u03C4\u03B9\u03BA\u03AE\u03C2", userName: "\u03A4\u03BF \u03CC\u03BD\u03BF\u03BC\u03AC \u03C3\u03B1\u03C2", rating: "\u0392\u03B1\u03B8\u03BC\u03BF\u03BB\u03BF\u03B3\u03AF\u03B1", comment: "\u03A3\u03C7\u03CC\u03BB\u03B9\u03BF" }, shell: { label: "\u039A\u03CD\u03C1\u03B9\u03B1 \u03C0\u03BB\u03BF\u03AE\u03B3\u03B7\u03C3\u03B7" } },
    hr: { favorites: { empty: "Jo\u0161 nema favorita" }, cart: { empty: "Ko\u0161arica je prazna", total: "Ukupno" }, search: { noResults: "Nema rezultata za ovu pretragu." }, map: { dataLoading: "U\u010Ditavanje dobavlja\u010Da\u2026", dataCached: "API nedostupan \u2013 prikaz spremljenih podataka.", dataError: "Podaci se nisu mogli u\u010Ditati.", radiusFilter: "\u{1F535} Doseg: {km} km ({count} mjesta)" }, msg: { addedToFavorites: "Dodano u favorite", removedFromFavorites: "Uklonjeno iz favorita", addedToCart: "Dodano u ko\u0161aricu", removedFromCart: "Uklonjeno iz ko\u0161arice", connectionError: "Gre\u0161ka veze" }, reviews: { title: "Recenzije", add: "Dodaj recenziju", userName: "Va\u0161e ime", rating: "Ocjena", comment: "Komentar" }, shell: { label: "Glavna navigacija" } },
    sr: { favorites: { empty: "\u0408\u043E\u0448 \u043D\u0435\u043C\u0430 \u043E\u043C\u0438\u0459\u0435\u043D\u0438\u0445" }, cart: { empty: "\u041A\u043E\u0440\u043F\u0430 \u0458\u0435 \u043F\u0440\u0430\u0437\u043D\u0430", total: "\u0423\u043A\u0443\u043F\u043D\u043E" }, search: { noResults: "\u041D\u0435\u043C\u0430 \u0440\u0435\u0437\u0443\u043B\u0442\u0430\u0442\u0430 \u0437\u0430 \u043E\u0432\u0443 \u043F\u0440\u0435\u0442\u0440\u0430\u0433\u0443." }, map: { dataLoading: "\u0423\u0447\u0438\u0442\u0430\u0432\u0430\u045A\u0435 \u0434\u043E\u0431\u0430\u0432\u0459\u0430\u0447\u0430\u2026", dataCached: "API \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0430\u043D \u2013 \u043F\u0440\u0438\u043A\u0430\u0437 \u0441\u0430\u0447\u0443\u0432\u0430\u043D\u0438\u0445 \u043F\u043E\u0434\u0430\u0442\u0430\u043A\u0430.", dataError: "\u041F\u043E\u0434\u0430\u0446\u0438 \u0441\u0435 \u043D\u0438\u0441\u0443 \u043C\u043E\u0433\u043B\u0438 \u0443\u0447\u0438\u0442\u0430\u0442\u0438.", radiusFilter: "\u{1F535} \u0414\u043E\u0441\u0435\u0433: {km} km ({count} \u043C\u0435\u0441\u0442\u0430)" }, msg: { addedToFavorites: "\u0414\u043E\u0434\u0430\u0442\u043E \u0443 \u043E\u043C\u0438\u0459\u0435\u043D\u043E", removedFromFavorites: "\u0423\u043A\u043B\u043E\u045A\u0435\u043D\u043E \u0438\u0437 \u043E\u043C\u0438\u0459\u0435\u043D\u043E\u0433", addedToCart: "\u0414\u043E\u0434\u0430\u0442\u043E \u0443 \u043A\u043E\u0440\u043F\u0443", removedFromCart: "\u0423\u043A\u043B\u043E\u045A\u0435\u043D\u043E \u0438\u0437 \u043A\u043E\u0440\u043F\u0435", connectionError: "\u0413\u0440\u0435\u0448\u043A\u0430 \u0432\u0435\u0437\u0435" }, reviews: { title: "\u0420\u0435\u0446\u0435\u043D\u0437\u0438\u0458\u0435", add: "\u0414\u043E\u0434\u0430\u0458 \u0440\u0435\u0446\u0435\u043D\u0437\u0438\u0458\u0443", userName: "\u0412\u0430\u0448\u0435 \u0438\u043C\u0435", rating: "\u041E\u0446\u0435\u043D\u0430", comment: "\u041A\u043E\u043C\u0435\u043D\u0442\u0430\u0440" }, shell: { label: "\u0413\u043B\u0430\u0432\u043D\u0430 \u043D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u0458\u0430" } },
    sl: { favorites: { empty: "\u0160e ni priljubljenih" }, cart: { empty: "Ko\u0161arica je prazna", total: "Skupaj" }, search: { noResults: "Ni rezultatov za to iskanje." }, map: { dataLoading: "Nalaganje ponudnikov\u2026", dataCached: "API ni na voljo \u2013 prikaz shranjenih podatkov.", dataError: "Podatkov ni bilo mogo\u010De nalo\u017Eiti.", radiusFilter: "\u{1F535} Doseg: {km} km ({count} krajev)" }, msg: { addedToFavorites: "Dodano med priljubljene", removedFromFavorites: "Odstranjeno iz priljubljenih", addedToCart: "Dodano v ko\u0161arico", removedFromCart: "Odstranjeno iz ko\u0161arice", connectionError: "Napaka povezave" }, reviews: { title: "Ocene", add: "Dodaj oceno", userName: "Va\u0161e ime", rating: "Ocena", comment: "Komentar" }, shell: { label: "Glavna navigacija" } },
    lt: { favorites: { empty: "Dar n\u0117ra m\u0117gstam\u0173" }, cart: { empty: "Krep\u0161elis tu\u0161\u010Dias", total: "I\u0161 viso" }, search: { noResults: "\u0160iai paie\u0161kai rezultat\u0173 n\u0117ra." }, map: { dataLoading: "\u012Ekeliami tiek\u0117jai\u2026", dataCached: "API nepasiekiamas \u2013 rodomi i\u0161saugoti duomenys.", dataError: "Nepavyko \u012Fkelti duomen\u0173.", radiusFilter: "\u{1F535} Spindulys: {km} km ({count} viet\u0173)" }, msg: { addedToFavorites: "Prid\u0117ta \u012F m\u0117gstamus", removedFromFavorites: "Pa\u0161alinta i\u0161 m\u0117gstam\u0173", addedToCart: "Prid\u0117ta \u012F krep\u0161el\u012F", removedFromCart: "Pa\u0161alinta i\u0161 krep\u0161elio", connectionError: "Ry\u0161io klaida" }, reviews: { title: "Atsiliepimai", add: "Prid\u0117ti atsiliepim\u0105", userName: "J\u016Bs\u0173 vardas", rating: "\u012Evertinimas", comment: "Komentaras" }, shell: { label: "Pagrindin\u0117 navigacija" } },
    lv: { favorites: { empty: "V\u0113l nav izlases" }, cart: { empty: "Grozs ir tuk\u0161s", total: "Kop\u0101" }, search: { noResults: "\u0160ai mekl\u0113\u0161anai rezult\u0101tu nav." }, map: { dataLoading: "Iel\u0101d\u0113 pieg\u0101d\u0101t\u0101jus\u2026", dataCached: "API nav pieejams \u2013 r\u0101da saglab\u0101tos datus.", dataError: "Neizdev\u0101s iel\u0101d\u0113t datus.", radiusFilter: "\u{1F535} Att\u0101lums: {km} km ({count} vietas)" }, msg: { addedToFavorites: "Pievienots izlasei", removedFromFavorites: "No\u0146emts no izlases", addedToCart: "Pievienots grozam", removedFromCart: "No\u0146emts no groza", connectionError: "Savienojuma k\u013C\u016Bda" }, reviews: { title: "Atsauksmes", add: "Pievienot atsauksmi", userName: "J\u016Bsu v\u0101rds", rating: "V\u0113rt\u0113jums", comment: "Koment\u0101rs" }, shell: { label: "Galven\u0101 navig\u0101cija" } },
    et: { favorites: { empty: "Lemmikuid veel pole" }, cart: { empty: "Ostukorv on t\xFChi", total: "Kokku" }, search: { noResults: "Selle otsingu jaoks tulemusi pole." }, map: { dataLoading: "Tarnijate laadimine\u2026", dataCached: "API pole saadaval \u2013 kuvatakse salvestatud andmeid.", dataError: "Andmeid ei \xF5nnestunud laadida.", radiusFilter: "\u{1F535} Ulatus: {km} km ({count} kohta)" }, msg: { addedToFavorites: "Lisatud lemmikutesse", removedFromFavorites: "Eemaldatud lemmikutest", addedToCart: "Lisatud korvi", removedFromCart: "Eemaldatud korvist", connectionError: "\xDChenduse viga" }, reviews: { title: "Arvustused", add: "Lisa arvustus", userName: "Teie nimi", rating: "Hinnang", comment: "Kommentaar" }, shell: { label: "Peamine navigatsioon" } },
    fi: { favorites: { empty: "Ei viel\xE4 suosikkeja" }, cart: { empty: "Ostoskori on tyhj\xE4", total: "Yhteens\xE4" }, search: { noResults: "Ei tuloksia t\xE4lle haulle." }, map: { dataLoading: "Ladataan toimittajia\u2026", dataCached: "API ei k\xE4ytett\xE4viss\xE4 \u2013 n\xE4ytet\xE4\xE4n tallennettuja tietoja.", dataError: "Tietoja ei voitu ladata.", radiusFilter: "\u{1F535} S\xE4de: {km} km ({count} paikkaa)" }, msg: { addedToFavorites: "Lis\xE4tty suosikkeihin", removedFromFavorites: "Poistettu suosikeista", addedToCart: "Lis\xE4tty koriin", removedFromCart: "Poistettu korista", connectionError: "Yhteysvirhe" }, reviews: { title: "Arvostelut", add: "Lis\xE4\xE4 arvostelu", userName: "Nimesi", rating: "Arvio", comment: "Kommentti" }, shell: { label: "P\xE4\xE4navigointi" } },
    sv: { favorites: { empty: "Inga favoriter \xE4nnu" }, cart: { empty: "Varukorgen \xE4r tom", total: "Totalt" }, search: { noResults: "Inga resultat f\xF6r denna s\xF6kning." }, map: { dataLoading: "Laddar leverant\xF6rer\u2026", dataCached: "API otillg\xE4ngligt \u2013 visar sparad data.", dataError: "Kunde inte ladda data.", radiusFilter: "\u{1F535} R\xE4ckvidd: {km} km ({count} platser)" }, msg: { addedToFavorites: "Tillagd i favoriter", removedFromFavorites: "Borttagen fr\xE5n favoriter", addedToCart: "Tillagd i varukorgen", removedFromCart: "Borttagen fr\xE5n varukorgen", connectionError: "Anslutningsfel" }, reviews: { title: "Recensioner", add: "L\xE4gg till recension", userName: "Ditt namn", rating: "Betyg", comment: "Kommentar" }, shell: { label: "Huvudnavigering" } },
    no: { favorites: { empty: "Ingen favoritter enn\xE5" }, cart: { empty: "Handlekurven er tom", total: "Totalt" }, search: { noResults: "Ingen resultater for dette s\xF8ket." }, map: { dataLoading: "Laster leverand\xF8rer\u2026", dataCached: "API utilgjengelig \u2013 viser lagrede data.", dataError: "Kunne ikke laste data.", radiusFilter: "\u{1F535} Rekkevidde: {km} km ({count} steder)" }, msg: { addedToFavorites: "Lagt til i favoritter", removedFromFavorites: "Fjernet fra favoritter", addedToCart: "Lagt i handlekurven", removedFromCart: "Fjernet fra handlekurven", connectionError: "Tilkoblingsfeil" }, reviews: { title: "Anmeldelser", add: "Legg til anmeldelse", userName: "Ditt navn", rating: "Vurdering", comment: "Kommentar" }, shell: { label: "Hovednavigasjon" } },
    da: { favorites: { empty: "Ingen favoritter endnu" }, cart: { empty: "Kurven er tom", total: "I alt" }, search: { noResults: "Ingen resultater for denne s\xF8gning." }, map: { dataLoading: "Indl\xE6ser leverand\xF8rer\u2026", dataCached: "API utilg\xE6ngelig \u2013 viser gemte data.", dataError: "Kunne ikke indl\xE6se data.", radiusFilter: "\u{1F535} R\xE6kkevidde: {km} km ({count} steder)" }, msg: { addedToFavorites: "Tilf\xF8jet til favoritter", removedFromFavorites: "Fjernet fra favoritter", addedToCart: "Tilf\xF8jet til kurv", removedFromCart: "Fjernet fra kurv", connectionError: "Forbindelsesfejl" }, reviews: { title: "Anmeldelser", add: "Tilf\xF8j anmeldelse", userName: "Dit navn", rating: "Bed\xF8mmelse", comment: "Kommentar" }, shell: { label: "Hovednavigation" } },
    is: { favorites: { empty: "Engin upp\xE1hald enn\xFE\xE1" }, cart: { empty: "Karfan er t\xF3m", total: "Samtals" }, search: { noResults: "Engar ni\xF0urst\xF6\xF0ur fyrir \xFEessa leit." }, map: { dataLoading: "Hle\xF0ur birgjum\u2026", dataCached: "API ekki tilt\xE6kt \u2013 s\xFDnir vista\xF0 g\xF6gn.", dataError: "Gat ekki hla\xF0i\xF0 g\xF6gnum.", radiusFilter: "\u{1F535} Umfang: {km} km ({count} sta\xF0ir)" }, msg: { addedToFavorites: "B\xE6tt vi\xF0 upp\xE1hald", removedFromFavorites: "Fjarl\xE6gt \xFAr upp\xE1haldi", addedToCart: "B\xE6tt \xED k\xF6rfu", removedFromCart: "Fjarl\xE6gt \xFAr k\xF6rfu", connectionError: "Tengivilla" }, reviews: { title: "Umsagnir", add: "B\xE6ta vi\xF0 ums\xF6gn", userName: "Nafn \xFEitt", rating: "Einkunn", comment: "Athugasemd" }, shell: { label: "A\xF0alflakk" } }
  };
  var _a;
  for (const code of Object.keys(EU_UI_CORE)) {
    const nav = (_a = built[code]) == null ? void 0 : _a.nav;
    if (nav) {
      built[code] = deepMerge(built[code], deepMerge(EU_UI_CORE[code], {
        nav: { premium: "Premium" },
        favorites: { title: nav.favorites },
        cart: { title: nav.cart }
      }));
    }
  }
  for (const [code, featured] of Object.entries(HOME_FEATURED_I18N)) {
    if (built[code]) {
      built[code] = deepMerge(built[code], { home: { featured } });
    }
  }
  for (const [code, menu] of Object.entries(MENU_I18N)) {
    if (built[code]) {
      built[code] = deepMerge(built[code], { menu });
    }
  }
  for (const [code, aboutPage] of Object.entries(ABOUT_I18N)) {
    if (built[code]) {
      built[code] = deepMerge(built[code], { aboutPage });
    }
  }
  for (const [code, search] of Object.entries(SEARCH_I18N)) {
    if (built[code]) {
      built[code] = deepMerge(built[code], {
        home: { searchPlaceholder: search.homeSearchPlaceholder },
        map: { searchPlaceholder: search.mapSearchPlaceholder },
        search: {
          noResults: search.noResults,
          noResultsFor: search.noResultsFor || "No results for search '{query}'",
          resultsCount: search.resultsCount,
          searching: search.searching
        }
      });
    }
  }
  var _a2;
  for (const code of Object.keys(built)) {
    if (code !== "de") {
      built[code] = deepMerge(EN, built[code]);
    }
    if (built[code].nav && !built[code].nav.premium && ((_a2 = built[code].a11y) == null ? void 0 : _a2.premium)) {
      built[code] = deepMerge(built[code], { nav: { premium: built[code].a11y.premium } });
    }
  }
  var TRANSLATIONS = Object.freeze(built);
  function normalizeBrowserLanguage(raw) {
    if (!raw || typeof raw !== "string") return "de";
    const lower = raw.toLowerCase().replace(/_/g, "-");
    if (SUPPORTED_LANGUAGE_CODES.includes(lower)) return lower;
    if (ZH_TW_PATTERNS.some((p) => lower === p || lower.startsWith(`${p}-`))) {
      return SUPPORTED_LANGUAGE_CODES.includes("zh-tw") ? "zh-tw" : "de";
    }
    if (lower.startsWith("zh")) {
      return SUPPORTED_LANGUAGE_CODES.includes("zh") ? "zh" : "de";
    }
    const part = lower.split("-")[0];
    const mapped = BROWSER_LANG_MAP[part] || part;
    return SUPPORTED_LANGUAGE_CODES.includes(mapped) ? mapped : "de";
  }
  function detectBrowserLanguage() {
    var _a7;
    const list = ((_a7 = navigator.languages) == null ? void 0 : _a7.length) ? navigator.languages : [navigator.language || "de"];
    for (const raw of list) {
      const code = normalizeBrowserLanguage(raw);
      if (SUPPORTED_LANGUAGE_CODES.includes(code)) return code;
    }
    return "de";
  }

  // js/core/i18n.js
  var LANG_STORAGE_KEY = "rs_lang";
  var currentLanguage = "de";
  function resolvePath(obj, path) {
    return path.split(".").reduce(
      (acc, part) => acc && acc[part] !== void 0 ? acc[part] : void 0,
      obj
    );
  }
  function getCurrentLanguage() {
    return currentLanguage;
  }
  function isSupportedLanguage(code) {
    return SUPPORTED_LANGUAGE_CODES.includes(code);
  }
  function setLanguage(code) {
    const normalized = normalizeBrowserLanguage(code);
    const valid = isSupportedLanguage(normalized);
    currentLanguage = valid ? normalized : "de";
    try {
      localStorage.setItem(LANG_STORAGE_KEY, currentLanguage);
    } catch (_) {
    }
    document.documentElement.lang = currentLanguage;
    return currentLanguage;
  }
  function initLanguage() {
    try {
      const stored = localStorage.getItem(LANG_STORAGE_KEY);
      if (stored && isSupportedLanguage(stored)) {
        return setLanguage(stored);
      }
    } catch (_) {
    }
    return setLanguage(detectBrowserLanguage());
  }
  function t(key, lang = currentLanguage) {
    var _a7, _b;
    const value = (_b = (_a7 = resolvePath(TRANSLATIONS[lang], key)) != null ? _a7 : resolvePath(TRANSLATIONS.en, key)) != null ? _b : resolvePath(TRANSLATIONS.de, key);
    return value != null ? value : key;
  }
  function getLanguageOption(code = currentLanguage) {
    return LANG_OPTIONS.find((l) => l.code === code) || LANG_OPTIONS[0];
  }
  function tProducerDescription(producerId, fallbackDescription, lang = currentLanguage) {
    var _a7, _b;
    if (lang === "de") return fallbackDescription;
    const entry = (_a7 = CATALOG_TRANSLATIONS[lang]) == null ? void 0 : _a7[producerId];
    return (_b = entry == null ? void 0 : entry.description) != null ? _b : fallbackDescription;
  }
  function tProductField(producerId, productIndex, field, fallback, lang = currentLanguage) {
    var _a7, _b, _c, _d;
    if (lang === "de") return fallback;
    const entry = (_c = (_b = (_a7 = CATALOG_TRANSLATIONS[lang]) == null ? void 0 : _a7[producerId]) == null ? void 0 : _b.products) == null ? void 0 : _c[productIndex];
    return (_d = entry == null ? void 0 : entry[field]) != null ? _d : fallback;
  }
  function formatNavLabel(viewKey, count = 0) {
    const label = t(`nav.${viewKey}`);
    return count > 0 ? `${label} (${count})` : label;
  }
  var currencyFormatters = /* @__PURE__ */ new Map();
  function formatCurrency(value, lang = currentLanguage) {
    const localeMap = {
      de: "de-DE",
      pl: "pl-PL",
      en: "en-GB",
      fr: "fr-FR",
      es: "es-ES",
      it: "it-IT",
      nl: "nl-NL",
      tr: "tr-TR",
      ru: "ru-RU"
    };
    const locale = localeMap[lang] || "de-DE";
    if (!currencyFormatters.has(locale)) {
      currencyFormatters.set(locale, new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "EUR"
      }));
    }
    return currencyFormatters.get(locale).format(Number(value) || 0);
  }

  // js/core/events.js
  var EVENTS2 = Object.freeze({
    // Aplikacja
    APP_INIT: "app:init",
    APP_READY: "app:ready",
    APP_ERROR: "app:error",
    // Nawigacja
    NAVIGATE: "navigate",
    VIEW_CHANGED: "view:changed",
    // Lokalizacja
    LOCATION_REQUESTED: "location:requested",
    LOCATION_UPDATED: "location:updated",
    LOCATION_CHANGED: "location:changed",
    LOCATION_ERROR: "location:error",
    NEARBY_SEARCH: "nearby:search",
    // Kategorie
    CATEGORY_SELECTED: "category:selected",
    // Mapa
    MAP_READY: "map:ready",
    MAP_LOADED: "map:loaded",
    MAP_MOVED: "map:moved",
    MAP_ZOOM_CHANGED: "map:zoom:changed",
    MAP_CLICKED: "map:clicked",
    MAP_MARKER_CLICKED: "map:marker:clicked",
    MAP_ERROR: "map:error",
    MARKERS_ADDED: "markers:added",
    // Dane / miejsca
    PLACES_LOADED: "places:loaded",
    PLACES_CHANGED: "places:changed",
    PLACES_FILTERED: "places:filtered",
    // Ulubione
    FAVORITES_CHANGED: "favorites:changed",
    FAVORITE_ADDED: "favorite:added",
    FAVORITE_REMOVED: "favorite:removed",
    // Koszyk
    CART_CHANGED: "cart:changed",
    CART_ADDED: "cart:added",
    CART_REMOVED: "cart:removed",
    CART_UPDATED: "cart:updated",
    // Filtry
    FILTERS_APPLY: "filters:apply",
    FILTERS_RESET: "filters:reset",
    FILTER_RADIUS_CHANGED: "filters:radius:changed",
    // Szczegóły
    SHOW_DETAIL: "detail:show",
    HIDE_DETAIL: "detail:hide",
    // UI
    TOAST_SHOW: "toast:show",
    TOAST_HIDE: "toast:hide",
    LOADING_SHOW: "loading:show",
    LOADING_HIDE: "loading:hide",
    LOADING_CHANGED: "loading:changed",
    PROGRESS_UPDATE: "progress:update",
    UI_READY: "ui:ready",
    THEME_CHANGED: "theme:changed",
    LANGUAGE_CHANGED: "language:changed",
    // Storage
    STORE_RESET: "store:reset",
    CACHE_UPDATED: "cache:updated",
    // Premium
    OPEN_PREMIUM: "premium:open",
    PREMIUM_ACTIVATED: "premium:activated",
    PREMIUM_EXPIRED: "premium:expired",
    PREMIUM_SUBSCRIBE_APPROVED: "premium:subscribe:approved",
    DONATION_COMPLETED: "donation:completed",
    // Auth / biznes
    AUTH_CHANGED: "auth:changed",
    BUSINESS_DATA_CHANGED: "business:data:changed",
    // Supabase
    SUPABASE_INIT: "supabase:init",
    SUPABASE_READY: "supabase:ready",
    SUPABASE_ERROR: "supabase:error",
    // Open Food Facts / wyszukiwanie
    SEARCH_PRODUCTS: "food:search:products",
    PRODUCTS_FOUND: "food:products:found",
    GET_PRODUCT: "food:get:product",
    PRODUCT_LOADED: "food:product:loaded",
    LOCAL_PRODUCTS: "food:local:products",
    // OSM
    OSM_PROGRESS: "osm:progress",
    // Recenzje
    REVIEW_SUBMITTED: "review:submitted",
    REVIEWS_CHANGED: "reviews:changed",
    // Menu
    MENU_OPEN_TAB: "menu:open:tab",
    // Waluta / liczniki
    CURRENCY_CHANGED: "currency:changed",
    COUNTERS_UPDATED: "counters:updated"
  });

  // js/core/eventBus.js
  var EventBus = class {
    constructor() {
      this.listeners = /* @__PURE__ */ new Map();
      this.onceListeners = /* @__PURE__ */ new Map();
    }
    on(event, callback) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
      return () => this.off(event, callback);
    }
    once(event, callback) {
      if (!this.onceListeners.has(event)) {
        this.onceListeners.set(event, []);
      }
      this.onceListeners.get(event).push(callback);
    }
    off(event, callback) {
      if (this.listeners.has(event)) {
        const listeners = this.listeners.get(event);
        const index = listeners.indexOf(callback);
        if (index !== -1) listeners.splice(index, 1);
      }
      if (this.onceListeners.has(event)) {
        const listeners = this.onceListeners.get(event);
        const index = listeners.indexOf(callback);
        if (index !== -1) listeners.splice(index, 1);
      }
    }
    emit(event, data) {
      if (this.listeners.has(event)) {
        this.listeners.get(event).forEach((callback) => {
          try {
            callback(data);
          } catch (error) {
            console.warn(`EventBus: b\u0142\u0105d w listenerze dla ${event}`, error);
          }
        });
      }
      if (this.onceListeners.has(event)) {
        const callbacks = this.onceListeners.get(event);
        this.onceListeners.delete(event);
        callbacks.forEach((callback) => {
          try {
            callback(data);
          } catch (error) {
            console.warn(`EventBus: b\u0142\u0105d w once listenerze dla ${event}`, error);
          }
        });
      }
    }
    removeAllListeners(event) {
      if (event) {
        this.listeners.delete(event);
        this.onceListeners.delete(event);
      } else {
        this.listeners.clear();
        this.onceListeners.clear();
      }
    }
    hasListeners(event) {
      return this.listeners.has(event) || this.onceListeners.has(event);
    }
  };
  var eventBus2 = new EventBus();

  // js/data/osmService.js
  var DEFAULT_RADIUS_M = 5e3;
  var OVERPASS_ENDPOINTS = [
    CONFIG.OVERPASS_URL,
    ...CONFIG.OVERPASS_MIRROR_URLS || []
  ].filter(Boolean);
  var RETRYABLE_STATUS = /* @__PURE__ */ new Set([429, 502, 503, 504]);
  var MAX_ATTEMPTS = Math.max(1, Number(CONFIG.OVERPASS_RETRIES) || 3);
  var OSM_CATEGORY_RULES = [
    { key: "shop", value: "bakery", category: "bakery" },
    { key: "shop", value: "butcher", category: "meat" },
    { key: "amenity", value: "restaurant", category: "restaurant" },
    { key: "shop", value: "farm", category: "farmer" },
    { key: "amenity", value: "vending_machine", category: "vending" }
  ];
  var OSM_SHOP_VALUES = Object.freeze([
    "supermarket",
    "convenience",
    "general",
    "greengrocer",
    "deli",
    "kiosk",
    "variety_store",
    "country_store",
    "department_store"
  ]);
  var OSM_SHOP_TAG_REGEX = "^(bakery|butcher|farm|supermarket|convenience|general|greengrocer|deli|kiosk|variety_store|country_store|department_store)$";
  var OSM_AMENITY_TAG_REGEX = "^(restaurant|vending_machine)$";
  function buildOverpassQuery(lat, lng, radiusM) {
    const around = `around:${radiusM},${lat},${lng}`;
    return `[out:json][timeout:45];(
        nwr(${around})["shop"~"${OSM_SHOP_TAG_REGEX}"];
        nwr(${around})["amenity"~"${OSM_AMENITY_TAG_REGEX}"];
    );out center;`;
  }
  function resolveCategory(tags = {}) {
    for (const rule of OSM_CATEGORY_RULES) {
      if (tags[rule.key] === rule.value) return rule.category;
    }
    if (tags.shop && OSM_SHOP_VALUES.includes(tags.shop)) {
      return "shop";
    }
    return "other";
  }
  function getElementCoords(element) {
    var _a7, _b, _c, _d;
    const lat = Number((_b = element.lat) != null ? _b : (_a7 = element.center) == null ? void 0 : _a7.lat);
    const lng = Number((_d = element.lon) != null ? _d : (_c = element.center) == null ? void 0 : _c.lon);
    return { lat, lng };
  }
  function buildAddress(tags = {}) {
    const parts = [
      [tags["addr:street"], tags["addr:housenumber"]].filter(Boolean).join(" "),
      [tags["addr:postcode"], tags["addr:city"]].filter(Boolean).join(" ")
    ].filter(Boolean);
    if (parts.length) return parts.join(", ");
    if (tags.address) return String(tags.address);
    return "";
  }
  function resolveProducerName(tags, element) {
    const direct = String(tags.name || "").trim();
    if (direct) return direct;
    const brand = String(tags.brand || tags.operator || "").trim();
    if (brand) return brand;
    if (tags.amenity === "vending_machine") {
      const product = String(tags.vending || tags["vending:food"] || tags["vending:drinks"] || "").trim();
      if (product) return `Automat (${product})`;
      const street2 = String(tags["addr:street"] || "").trim();
      if (street2) return `Automat ${street2}`;
      return `Automat #${element.id}`;
    }
    if (tags.shop && OSM_SHOP_VALUES.includes(tags.shop)) {
      const shopLabel = tags.shop.replace(/_/g, " ");
      const street2 = String(tags["addr:street"] || "").trim();
      if (street2) return `${shopLabel} ${street2}`;
      return `${shopLabel} #${element.id}`;
    }
    const street = String(tags["addr:street"] || "").trim();
    if (street) return street;
    return "";
  }
  function parseOsmPrice(tags = {}) {
    const raw = String(tags.charge || tags.fee || tags.price || "").trim();
    if (!raw) return 0;
    const match = raw.replace(",", ".").match(/(\d+(?:\.\d+)?)/);
    const value = match ? Number(match[1]) : NaN;
    return Number.isFinite(value) ? value : 0;
  }
  function extractProductsFromTags(tags = {}, elementId = "") {
    const products = [];
    const price = parseOsmPrice(tags);
    const vending = String(
      tags.vending || tags["vending:food"] || tags["vending:drinks"] || ""
    ).trim();
    if (vending) {
      vending.split(";").map((part) => part.trim()).filter(Boolean).forEach((item, index) => {
        products.push({
          id: `osm-${elementId}-vending-${index}`,
          name: item.replace(/_/g, " "),
          description: "",
          price,
          unit: "",
          promo: ""
        });
      });
    }
    const productTag = String(tags.product || "").trim();
    if (productTag && products.length === 0) {
      productTag.split(";").map((part) => part.trim()).filter(Boolean).forEach((item, index) => {
        products.push({
          id: `osm-${elementId}-product-${index}`,
          name: item.replace(/_/g, " "),
          description: "",
          price,
          unit: "",
          promo: ""
        });
      });
    }
    return products;
  }
  function elementToProducer(element) {
    const tags = element.tags || {};
    const { lat, lng } = getElementCoords(element);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    const name = resolveProducerName(tags, element);
    if (!name) return null;
    const category = resolveCategory(tags);
    const chain = detectChain(tags);
    const osmType = element.type || "node";
    return {
      id: `osm-${osmType}-${element.id}`,
      name,
      category: chain ? "shop" : category,
      chain,
      address: buildAddress(tags),
      lat,
      lng,
      description: tags.description || tags.cuisine || "",
      rating: null,
      promo: "",
      phone: tags.phone || tags["contact:phone"] || "",
      email: tags.email || tags["contact:email"] || "",
      website: tags.website || tags["contact:website"] || "",
      products: extractProductsFromTags(tags, element.id),
      promotions: [],
      source: "osm"
    };
  }
  function detectChain(tags = {}) {
    const brand = String(tags.brand || tags.operator || "").toLowerCase();
    if (brand.includes("lidl")) return "lidl";
    if (brand.includes("aldi")) return "aldi";
    if (brand.includes("rewe")) return "rewe";
    if (brand.includes("edeka")) return "edeka";
    if (brand.includes("kaufland")) return "kaufland";
    if (brand.includes("netto")) return "netto";
    if (brand.includes("penny")) return "penny";
    if (brand.includes("biedronka")) return "biedronka";
    return "";
  }
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  function requestOverpass(endpoint, query, signal) {
    return __async(this, null, function* () {
      const response = yield fetch(`${endpoint}?data=${encodeURIComponent(query)}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "RegionalerGeschmack/1.0"
        },
        signal
      });
      if (!response.ok) {
        const error = new Error(`Overpass HTTP ${response.status}`);
        error.status = response.status;
        throw error;
      }
      const payload = yield response.json();
      const elements = Array.isArray(payload == null ? void 0 : payload.elements) ? payload.elements : [];
      return elements.map(elementToProducer).filter(Boolean);
    });
  }
  function fetchProducers(_0, _1) {
    return __async(this, arguments, function* (lat, lng, radiusM = DEFAULT_RADIUS_M) {
      const latitude = Number(lat);
      const longitude = Number(lng);
      const radius = Number(radiusM);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error("Invalid coordinates");
      }
      const query = buildOverpassQuery(latitude, longitude, radius);
      const timeoutMs = Number(CONFIG.fetchTimeout) || 3e4;
      const errors = [];
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
        const endpoint = OVERPASS_ENDPOINTS[attempt % OVERPASS_ENDPOINTS.length];
        const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
        const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
        try {
          const producers = yield requestOverpass(endpoint, query, controller == null ? void 0 : controller.signal);
          return producers;
        } catch (error) {
          const status = error == null ? void 0 : error.status;
          const message = (error == null ? void 0 : error.name) === "AbortError" ? "Overpass timeout" : String((error == null ? void 0 : error.message) || error);
          errors.push(`${endpoint}: ${message}`);
          const retryable = !status || RETRYABLE_STATUS.has(status);
          if (!retryable || attempt >= MAX_ATTEMPTS - 1) {
            break;
          }
          yield delay(400 * (attempt + 1));
        } finally {
          if (timer) clearTimeout(timer);
        }
      }
      throw new Error(errors[errors.length - 1] || "Overpass request failed");
    });
  }

  // js/data/govDataService.js
  var WFS_BASE = "https://geo.kreis-viersen.de/ows/osm-daten";
  var FETCH_TIMEOUT_MS = 3e4;
  function bboxFromCenter(lat, lng, radiusKm) {
    const radius = Number(radiusKm) || 10;
    const latDelta = radius / 111.32;
    const lngDelta = radius / (111.32 * Math.cos(lat * Math.PI / 180));
    return {
      minLng: lng - lngDelta,
      minLat: lat - latDelta,
      maxLng: lng + lngDelta,
      maxLat: lat + latDelta
    };
  }
  function buildWfsGeoJsonUrl(lat, lng, radiusKm) {
    const { minLng, minLat, maxLng, maxLat } = bboxFromCenter(lat, lng, radiusKm);
    const params = new URLSearchParams({
      SERVICE: "WFS",
      REQUEST: "GetFeature",
      VERSION: "1.1.0",
      TYPENAME: "hoflaeden_nrw",
      SRSNAME: "EPSG:4326",
      BBOX: `${minLng},${minLat},${maxLng},${maxLat},EPSG:4326`,
      outputFormat: "GeoJSON"
    });
    return `${WFS_BASE}?${params.toString()}`;
  }
  function buildAddress2(props = {}) {
    if (props.adresse) return String(props.adresse).trim();
    const parts = [
      [props.strasse || props.addr_street, props.hausnummer || props.addr_housenumber].filter(Boolean).join(" "),
      [props.plz || props.addr_postcode, props.ort || props.addr_city].filter(Boolean).join(" ")
    ].filter(Boolean);
    if (parts.length) return parts.join(", ");
    return "";
  }
  function featureToProducer(feature, index) {
    var _a7;
    const props = feature.properties || {};
    const geometry = feature.geometry || {};
    let lat;
    let lng;
    if (geometry.type === "Point" && Array.isArray(geometry.coordinates)) {
      lng = Number(geometry.coordinates[0]);
      lat = Number(geometry.coordinates[1]);
    } else if (geometry.type === "MultiPoint" && ((_a7 = geometry.coordinates) == null ? void 0 : _a7[0])) {
      lng = Number(geometry.coordinates[0][0]);
      lat = Number(geometry.coordinates[0][1]);
    } else {
      return null;
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    const name = String(props.name || props.bezeichnung || props.title || "").trim();
    if (!name) return null;
    const idSuffix = props.osm_id || props.id || index;
    return {
      id: `gov-hofladen-${idSuffix}`,
      name,
      category: "farmer",
      chain: "",
      address: buildAddress2(props),
      lat,
      lng,
      description: props.beschreibung || "Hofladen (Open.NRW)",
      rating: null,
      promo: "",
      phone: props.telefon || props.phone || "",
      email: props.email || "",
      website: props.website || props.internet || props.url || "",
      products: [],
      source: "govdata"
    };
  }
  function fetchWithTimeout(_0) {
    return __async(this, arguments, function* (url, options = {}) {
      const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
      const timer = controller ? setTimeout(() => controller.abort(), options.timeoutMs || FETCH_TIMEOUT_MS) : null;
      try {
        const response = yield fetch(url, __spreadProps(__spreadValues({}, options), {
          signal: controller == null ? void 0 : controller.signal,
          headers: __spreadValues({
            Accept: "application/json"
          }, options.headers || {})
        }));
        return response;
      } catch (error) {
        if ((error == null ? void 0 : error.name) === "AbortError") {
          throw new Error("GovData request timeout");
        }
        throw error;
      } finally {
        if (timer) clearTimeout(timer);
      }
    });
  }
  function fetchGovData(category = "farmer", lat, lng, radiusKm = 10) {
    return __async(this, null, function* () {
      if (category && !["farmer", "farmers", "all"].includes(category)) {
        return [];
      }
      const latitude = Number(lat);
      const longitude = Number(lng);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return [];
      }
      try {
        const wfsUrl = buildWfsGeoJsonUrl(latitude, longitude, radiusKm);
        const geoRes = yield fetchWithTimeout(wfsUrl);
        if (!geoRes.ok) {
          throw new Error(`WFS HTTP ${geoRes.status}`);
        }
        const geojson = yield geoRes.json();
        const features = Array.isArray(geojson == null ? void 0 : geojson.features) ? geojson.features : [];
        return features.map((feature, index) => featureToProducer(feature, index)).filter(Boolean);
      } catch (error) {
        if ((error == null ? void 0 : error.name) !== "AbortError") {
          console.warn("[GovData] WFS fetch failed:", error);
        }
        throw error;
      }
    });
  }

  // js/data/producerHelpers.js
  var HOME_CATEGORY_MAP = Object.freeze({
    all: null,
    restaurants: "restaurant",
    farmers: "farmer",
    bakeries: "bakery",
    meat: "meat",
    shops: "shop",
    vending: "vending"
  });
  function filterProducersByCategory(producers, homeCategoryId = "all") {
    const producerCategory = HOME_CATEGORY_MAP[homeCategoryId];
    if (!producerCategory) {
      return [...producers];
    }
    return producers.filter((p) => p.category === producerCategory);
  }
  function countProducersByHomeCategory(producers = []) {
    return Object.freeze({
      all: producers.length,
      restaurants: filterProducersByCategory(producers, "restaurants").length,
      farmers: filterProducersByCategory(producers, "farmers").length,
      bakeries: filterProducersByCategory(producers, "bakeries").length,
      meat: filterProducersByCategory(producers, "meat").length,
      shops: filterProducersByCategory(producers, "shops").length,
      vending: filterProducersByCategory(producers, "vending").length
    });
  }
  function getGoogleMapsDirectionsUrl(lat, lng) {
    const latitude = Number(lat);
    const longitude = Number(lng);
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  }
  var EARTH_RADIUS_KM = 6371;
  function getDistanceKm(lat1, lng1, lat2, lng2) {
    const toRad = (deg) => deg * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = __pow(Math.sin(dLat / 2), 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * __pow(Math.sin(dLng / 2), 2);
    return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  function getProducersInRadius(producers, radiusKm, userLocation) {
    const lat = Number(userLocation == null ? void 0 : userLocation.lat);
    const lng = Number(userLocation == null ? void 0 : userLocation.lng);
    const radius = Number(radiusKm);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(radius) || radius <= 0) {
      return [...producers];
    }
    return producers.filter((producer) => {
      const pLat = Number(producer == null ? void 0 : producer.lat);
      const pLng = Number(producer == null ? void 0 : producer.lng);
      if (!Number.isFinite(pLat) || !Number.isFinite(pLng)) return false;
      return getDistanceKm(lat, lng, pLat, pLng) <= radius;
    });
  }
  function normalizeProducerKey(producer) {
    const name = String((producer == null ? void 0 : producer.name) || "").toLowerCase().trim();
    const address = String((producer == null ? void 0 : producer.address) || "").toLowerCase().trim();
    return `${name}|${address}`;
  }
  function dedupeProducers(producers) {
    const seen = /* @__PURE__ */ new Map();
    for (const producer of producers) {
      const key = normalizeProducerKey(producer);
      if (!key || key === "|") continue;
      const existing = seen.get(key);
      if (!existing) {
        seen.set(key, producer);
        continue;
      }
      const existingScore = scoreProducer(existing);
      const nextScore = scoreProducer(producer);
      if (nextScore > existingScore) {
        seen.set(key, producer);
      }
    }
    return [...seen.values()];
  }
  function scoreProducer(producer) {
    let score = 0;
    if (producer == null ? void 0 : producer.address) score += 2;
    if (producer == null ? void 0 : producer.phone) score += 1;
    if (producer == null ? void 0 : producer.website) score += 1;
    if (producer == null ? void 0 : producer.description) score += 1;
    if ((producer == null ? void 0 : producer.source) === "govdata") score += 1;
    if ((producer == null ? void 0 : producer.source) === "user") score += 5;
    return score;
  }

  // js/data/productImages.js
  var BASE = "/assets/images/products";
  var PRODUCT_IMAGE_SLUGS = Object.freeze({
    bread: "bread",
    strawberries: "strawberries",
    cheese: "cheese",
    steak: "steak",
    "daily-dish": "daily-dish",
    vegetables: "vegetables",
    "lidl-regional": "lidl-regional",
    burger: "burger",
    salad: "salad",
    soup: "soup",
    potatoes: "potatoes",
    apples: "apples",
    carrots: "carrots",
    eggs: "eggs",
    croissant: "croissant",
    cake: "cake",
    rolls: "rolls",
    sausage: "sausage",
    pork: "pork",
    milk: "milk",
    butter: "butter",
    coffee: "coffee",
    chocolate: "chocolate",
    juice: "juice"
  });
  function getProductImageUrl(slug) {
    if (!slug || !PRODUCT_IMAGE_SLUGS[slug]) return null;
    return `${BASE}/${PRODUCT_IMAGE_SLUGS[slug]}.webp`;
  }
  function getProductImageJpegUrl(webpUrl) {
    if (!webpUrl || !webpUrl.endsWith(".webp")) return webpUrl || null;
    return webpUrl.replace(/\.webp$/, ".jpg");
  }

  // js/data/producerProducts.js
  var CATEGORY_CATALOGS = Object.freeze({
    restaurant: {
      promo: "\u{1F37D}\uFE0F Polecamy danie dnia!",
      products: [
        { slug: "daily-dish", name: "Danie dnia", price: 14.5, description: "Sezonowe danie kuchni regionalnej", imageSlug: "daily-dish", promo: "\u{1F37D}\uFE0F Polecamy!" },
        { slug: "burger", name: "Burger wo\u0142owy", price: 12.9, description: "Wo\u0142owina z okolicznych farm", imageSlug: "burger" },
        { slug: "salad", name: "Sa\u0142atka sezonowa", price: 8.9, description: "Warzywa od lokalnych dostawc\xF3w", imageSlug: "salad" },
        { slug: "soup", name: "Zupa dnia", price: 6.5, description: "Domowa zupa na bazie warzyw sezonowych", imageSlug: "soup" }
      ]
    },
    farmer: {
      promo: "\u{1F34E} \u015Awie\u017Ce zbiory!",
      products: [
        { slug: "potatoes", name: "Ziemniaki (bio)", price: 2.5, unit: "kg", description: "Odmiany regionalne, bez pestycyd\xF3w", imageSlug: "potatoes" },
        { slug: "apples", name: "Jab\u0142ka (bio)", price: 3.8, unit: "kg", description: "Prosto z sadu", imageSlug: "apples", promo: "\u{1F34E} Sezon!" },
        { slug: "carrots", name: "Marchew (bio)", price: 2, unit: "kg", description: "S\u0142odka marchew z pola", imageSlug: "carrots" },
        { slug: "eggs", name: "Jaja (bio)", price: 3, unit: "6 szt", description: "Kury z wolnego wybiegu", imageSlug: "eggs" },
        { slug: "vegetables", name: "Skrzynka warzyw", price: 12, unit: "karton", description: "Mieszanka sezonowa", imageSlug: "vegetables" }
      ]
    },
    bakery: {
      promo: "\u{1F525} 20% zni\u017Cki na chleb!",
      discount: "20",
      products: [
        { slug: "bread", name: "Chleb wiejski", price: 3.5, description: "Pieczony na zakwasie", imageSlug: "bread", promo: "\u{1F525} -20%" },
        { slug: "croissant", name: "Rogaliki", price: 2, description: "Ma\u015Blane, \u015Bwie\u017Co pieczone", imageSlug: "croissant" },
        { slug: "cake", name: "Ciasto dro\u017Cd\u017Cowe", price: 4.5, description: "Tradycyjne ciasto z owocami", imageSlug: "cake" },
        { slug: "rolls", name: "Bu\u0142ki", price: 0.8, description: "Chrupi\u0105ce bu\u0142ki pszenne", imageSlug: "rolls" }
      ]
    },
    meat: {
      promo: "\u{1F525} \u015Awie\u017Ca kie\u0142basa!",
      products: [
        { slug: "steak", name: "Stek wo\u0142owy", price: 6.9, unit: "200 g", description: "Mi\u0119so z lokalnej hodowli", imageSlug: "steak" },
        { slug: "sausage", name: "Kie\u0142basa domowa", price: 3.2, unit: "3 szt", description: "Wed\u0142ug receptury rodzinnej", imageSlug: "sausage", promo: "\u{1F525} \u015Awie\u017Ca!" },
        { slug: "pork", name: "Schab", price: 5.5, unit: "kg", description: "Mi\u0119so wieprzowe z regionu", imageSlug: "pork" }
      ]
    },
    shop: {
      promo: "\u{1F9C8} Taniej o 10%!",
      discount: "10",
      products: [
        { slug: "milk", name: "Mleko lokalne", price: 1.5, unit: "1 l", description: "Od regionalnych dostawc\xF3w", imageSlug: "milk" },
        { slug: "eggs", name: "Jaja (bio)", price: 3, unit: "6 szt", description: "Z okolicznych gospodarstw", imageSlug: "eggs" },
        { slug: "butter", name: "Mas\u0142o", price: 2.5, unit: "250 g", description: "Kremowe mas\u0142o rolne", imageSlug: "butter", promo: "\u{1F9C8} -10%" },
        { slug: "cheese", name: "Ser regionalny", price: 4.2, unit: "200 g", description: "Dojrzewaj\u0105cy ser z mleka krowiego", imageSlug: "cheese" }
      ]
    },
    vending: {
      promo: "\u2615 Kawa + ciastko = 3.50 \u20AC",
      products: [
        { slug: "coffee", name: "Kawa", price: 2.5, description: "Espresso lub americano", imageSlug: "coffee", promo: "\u2615 Combo 3,50 \u20AC" },
        { slug: "chocolate", name: "Czekolada", price: 1.8, description: "Tabliczka premium", imageSlug: "chocolate" },
        { slug: "juice", name: "Nap\xF3j", price: 2, description: "Sok lub woda mineralna", imageSlug: "juice" }
      ]
    }
  });
  var DEFAULT_CATEGORY = "shop";
  function normalizeCategory(category) {
    const key = String(category || "").toLowerCase();
    if (key in CATEGORY_CATALOGS) return key;
    if (key === "other") return DEFAULT_CATEGORY;
    return DEFAULT_CATEGORY;
  }
  function hashString(value) {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(i) | 0;
    }
    return Math.abs(hash);
  }
  function catalogItemToProduct(item, index, producerId, hash) {
    const priceJitter = (hash + index) % 5 * 0.05;
    const price = Math.round((item.price + priceJitter) * 100) / 100;
    return {
      id: `${producerId}-${item.slug}-${index}`,
      name: item.name,
      description: item.description || "",
      price,
      unit: item.unit || "",
      promo: item.promo || "",
      imageUrl: getProductImageUrl(item.imageSlug) || ""
    };
  }
  function buildDefaultPromotions(products, catalog) {
    if (!catalog.promo || !products.length) return [];
    const featured = products.find((p) => p.promo) || products[0];
    return [{
      id: "catalog-promo-1",
      title: catalog.promo,
      description: (featured == null ? void 0 : featured.name) ? String(featured.name) : "",
      productId: (featured == null ? void 0 : featured.id) || "",
      discount: catalog.discount || ""
    }];
  }
  function enrichProducerWithProducts(producer) {
    if (!producer || typeof producer !== "object") return producer;
    const existing = Array.isArray(producer.products) ? producer.products : [];
    if (producer.source === "user") {
      return __spreadProps(__spreadValues({}, producer), {
        products: existing.map((product) => __spreadProps(__spreadValues({}, product), {
          imageUrl: product.imageUrl || ""
        }))
      });
    }
    const categoryKey = normalizeCategory(producer.category);
    const catalog = CATEGORY_CATALOGS[categoryKey];
    const hash = hashString(String(producer.id || producer.name || ""));
    const catalogProducts = catalog.products.map(
      (item, index) => catalogItemToProduct(item, index, String(producer.id), hash)
    );
    const osmExtras = existing.filter((p) => (p == null ? void 0 : p.name) && !catalogProducts.some((c) => c.name === p.name)).map((p, index) => __spreadProps(__spreadValues({}, p), {
      id: p.id || `${producer.id}-osm-${index}`,
      imageUrl: p.imageUrl || ""
    }));
    const products = [...catalogProducts, ...osmExtras];
    const promo = producer.promo || catalog.promo;
    const promotions = Array.isArray(producer.promotions) && producer.promotions.length ? producer.promotions : buildDefaultPromotions(products, catalog);
    return __spreadProps(__spreadValues({}, producer), {
      products,
      promo,
      promotions
    });
  }
  function enrichProducersWithProducts(producers) {
    if (!Array.isArray(producers)) return [];
    return producers.map(enrichProducerWithProducts);
  }

  // js/core/userLocation.js
  var LAST_POSITION_KEY = "rg_last_position";
  var GEO_OPTIONS = Object.freeze({
    enableHighAccuracy: true,
    maximumAge: 5e3,
    timeout: 3e4
  });
  function isValidCoord(lat, lng) {
    return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }
  function saveLastPosition(lat, lng, source = "gps") {
    if (!isValidCoord(Number(lat), Number(lng))) return;
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(LAST_POSITION_KEY, JSON.stringify({
        lat: Number(lat),
        lng: Number(lng),
        source,
        updatedAt: Date.now()
      }));
    } catch (_) {
    }
  }
  function getLastPosition() {
    if (typeof localStorage === "undefined") return null;
    try {
      const raw = localStorage.getItem(LAST_POSITION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const lat = Number(parsed == null ? void 0 : parsed.lat);
      const lng = Number(parsed == null ? void 0 : parsed.lng);
      if (!isValidCoord(lat, lng)) return null;
      return {
        lat,
        lng,
        source: (parsed == null ? void 0 : parsed.source) || "stored",
        updatedAt: parsed == null ? void 0 : parsed.updatedAt
      };
    } catch (_) {
      return null;
    }
  }
  function requestCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        reject(new Error("geolocation_unavailable"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          saveLastPosition(loc.lat, loc.lng, "gps");
          resolve(loc);
        },
        (error) => reject(error),
        __spreadValues(__spreadValues({}, GEO_OPTIONS), options)
      );
    });
  }
  function resolveUserLocation() {
    return __async(this, arguments, function* (options = {}) {
      const { preferGps = false } = options;
      if (preferGps) {
        try {
          return yield requestCurrentPosition();
        } catch (_) {
          return getLastPosition();
        }
      }
      const stored = getLastPosition();
      if (stored) return { lat: stored.lat, lng: stored.lng };
      try {
        return yield requestCurrentPosition();
      } catch (_) {
        return null;
      }
    });
  }
  function isCacheNearLocation(cacheLat, cacheLng, requestLat, requestLng, maxKm = 20) {
    if (!isValidCoord(cacheLat, cacheLng) || !isValidCoord(requestLat, requestLng)) {
      return false;
    }
    return getDistanceKm(cacheLat, cacheLng, requestLat, requestLng) <= maxKm;
  }

  // js/data/userProducerStore.js
  var STORE_KEY = "rg_user_producer_accounts";
  var PRODUCER_CATEGORIES = Object.freeze([
    { id: "farmer", labelKey: "producer.types.farmer" },
    { id: "bakery", labelKey: "producer.types.bakery" },
    { id: "restaurant", labelKey: "producer.types.restaurant" },
    { id: "meat", labelKey: "producer.types.meat" },
    { id: "shop", labelKey: "producer.types.shop" },
    { id: "vending", labelKey: "producer.types.vending" }
  ]);
  function readAll() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      const data = raw ? JSON.parse(raw) : {};
      return data && typeof data === "object" ? data : {};
    } catch (_) {
      return {};
    }
  }
  function writeAll(data) {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  }
  function createId(prefix = "item") {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
  function defaultProfileCoords() {
    const stored = getLastPosition();
    if (stored) {
      return { lat: stored.lat, lng: stored.lng };
    }
    return { lat: null, lng: null };
  }
  function defaultAccount(name = "", email = "") {
    const coords = defaultProfileCoords();
    return {
      profile: {
        name,
        description: "",
        address: "",
        phone: "",
        email,
        categories: ["farmer"],
        lat: coords.lat,
        lng: coords.lng
      },
      products: [],
      promotions: [],
      photos: []
    };
  }
  function initProducerAccount(userId, { name = "", email = "", categories = ["farmer"] } = {}) {
    const all = readAll();
    const cats = Array.isArray(categories) && categories.length ? [...categories] : ["farmer"];
    if (!all[userId]) {
      all[userId] = defaultAccount(name, email);
      all[userId].profile.categories = cats;
      writeAll(all);
    }
    return all[userId];
  }
  function getProducerAccount(userId) {
    if (!userId) return null;
    const all = readAll();
    return all[userId] ? structuredClone(all[userId]) : null;
  }
  function saveProducerAccount(userId, account) {
    if (!userId || !account) return null;
    const all = readAll();
    all[userId] = structuredClone(account);
    writeAll(all);
    eventBus2.emit(EVENTS2.BUSINESS_DATA_CHANGED, { userId });
    eventBus2.emit(EVENTS2.PLACES_CHANGED, {});
    return all[userId];
  }
  function applyPromotionsToProducts(products, promotions) {
    const items = (products || []).map((product) => __spreadValues({}, product));
    for (const promo of promotions || []) {
      if (!(promo == null ? void 0 : promo.productId)) continue;
      const product = items.find((item) => item.id === promo.productId);
      if (!product) continue;
      const parts = [promo.title];
      if (promo.discount) parts.push(`-${promo.discount}%`);
      product.promo = parts.filter(Boolean).join(" ");
    }
    return items;
  }
  function buildProducerPromoSummary(products, promotions) {
    const lines = (promotions || []).filter((promo) => {
      var _a7;
      return (_a7 = promo == null ? void 0 : promo.title) == null ? void 0 : _a7.trim();
    }).map((promo) => {
      const product = products.find((item) => item.id === promo.productId);
      const prefix = (product == null ? void 0 : product.name) ? `${product.name}: ` : "";
      const discount = promo.discount ? ` (-${promo.discount}%)` : "";
      return `${prefix}${promo.title.trim()}${discount}`;
    });
    return lines.join(" \xB7 ");
  }
  function accountToProducer(userId, account) {
    const profile = (account == null ? void 0 : account.profile) || {};
    const categories = Array.isArray(profile.categories) && profile.categories.length ? profile.categories : ["farmer"];
    const primaryCategory = categories[0];
    const products = applyPromotionsToProducts(account.products || [], account.promotions || []);
    const promoSummary = buildProducerPromoSummary(products, account.promotions || []);
    const coords = defaultProfileCoords();
    return {
      id: `user-producer-${userId}`,
      name: profile.name || "Regionaler Anbieter",
      category: primaryCategory,
      categories,
      description: profile.description || "",
      address: profile.address || "",
      phone: profile.phone || "",
      email: profile.email || "",
      lat: Number(profile.lat) || coords.lat,
      lng: Number(profile.lng) || coords.lng,
      products,
      promotions: account.promotions || [],
      photos: account.photos || [],
      promo: promoSummary,
      source: "user",
      ownerId: userId,
      rating: 0
    };
  }
  function getRegisteredUserProducers() {
    const all = readAll();
    return Object.entries(all).filter(([, account]) => {
      var _a7, _b;
      return (_b = (_a7 = account == null ? void 0 : account.profile) == null ? void 0 : _a7.name) == null ? void 0 : _b.trim();
    }).map(([userId, account]) => accountToProducer(userId, account)).filter((producer) => Number.isFinite(producer.lat) && Number.isFinite(producer.lng));
  }
  function createProduct() {
    return {
      id: createId("product"),
      name: "",
      price: 0,
      unit: "St\xFCck",
      promo: "",
      description: "",
      imageUrl: ""
    };
  }
  function createPromotion() {
    return {
      id: createId("promo"),
      title: "",
      description: "",
      productId: "",
      discount: ""
    };
  }

  // js/data/dataService.js
  var CACHE_KEY = "rg_producers_data_v3";
  var CACHE_TTL_MS = 24 * 60 * 60 * 1e3;
  var ENABLE_GOVDATA = CONFIG.ENABLE_GOVDATA !== false;
  var producersRegistry = [];
  var loadPromise = null;
  var lastLoadMeta = {
    source: "none",
    fromCache: false,
    apiFailed: false,
    loadedAt: 0
  };
  function getProducers() {
    return [...producersRegistry];
  }
  function getProducerById(id) {
    return producersRegistry.find((p) => String(p.id) === String(id)) || null;
  }
  function getProducerProducts(producerId) {
    const producer = getProducerById(producerId);
    if (!(producer == null ? void 0 : producer.products)) return [];
    return [...producer.products];
  }
  function readCache() {
    if (typeof localStorage === "undefined") return null;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!(parsed == null ? void 0 : parsed.producers) || !Array.isArray(parsed.producers)) return null;
      if (!parsed.timestamp || Date.now() - parsed.timestamp > CACHE_TTL_MS) return null;
      return parsed;
    } catch (_) {
      return null;
    }
  }
  function writeCache(lat, lng, producers) {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          lat,
          lng,
          producers
        })
      );
    } catch (error) {
      console.warn("[DataService] Nie uda\u0142o si\u0119 zapisa\u0107 cache:", error);
    }
  }
  function readStaleCache() {
    if (typeof localStorage === "undefined") return null;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!(parsed == null ? void 0 : parsed.producers) || !Array.isArray(parsed.producers)) return null;
      return parsed;
    } catch (_) {
      return null;
    }
  }
  function setRegistry(producers, meta) {
    const withUserProducers = mergeUserProducers(producers);
    producersRegistry = [...withUserProducers];
    lastLoadMeta = {
      source: meta.source,
      fromCache: !!meta.fromCache,
      apiFailed: !!meta.apiFailed,
      loadedAt: Date.now()
    };
    eventBus2.emit(EVENTS2.PLACES_LOADED, __spreadValues({
      producers: producersRegistry
    }, lastLoadMeta));
    eventBus2.emit(EVENTS2.PLACES_CHANGED, __spreadValues({
      producers: producersRegistry
    }, lastLoadMeta));
    eventBus2.emit(EVENTS2.CACHE_UPDATED, __spreadValues({ key: CACHE_KEY }, lastLoadMeta));
  }
  function mergeUserProducers(producers) {
    const userProducers = getRegisteredUserProducers();
    if (!userProducers.length) return producers;
    return dedupeProducers([...producers, ...userProducers]);
  }
  function refreshUserProducersOnMap() {
    const osmOnly = producersRegistry.filter((p) => p.source !== "user");
    setRegistry(osmOnly, __spreadProps(__spreadValues({}, lastLoadMeta), { source: lastLoadMeta.source || "refresh" }));
  }
  function fetchLiveData(lat, lng, radiusKm) {
    return __async(this, null, function* () {
      const radiusM = Math.max(1e3, Math.round(Number(radiusKm || 10) * 1e3));
      const govPromise = ENABLE_GOVDATA ? fetchGovData("farmer", lat, lng, radiusKm) : Promise.resolve([]);
      const [osmResult, govResult] = yield Promise.allSettled([
        fetchProducers(lat, lng, radiusM),
        govPromise
      ]);
      const osmProducers = osmResult.status === "fulfilled" ? osmResult.value : [];
      const govProducers = govResult.status === "fulfilled" ? govResult.value : [];
      if (osmResult.status === "rejected") {
        console.warn("[DataService] OSM error:", osmResult.reason);
      }
      if (ENABLE_GOVDATA && govResult.status === "rejected") {
        console.warn("[DataService] GovData error:", govResult.reason);
      }
      const osmOk = osmResult.status === "fulfilled";
      const govOk = !ENABLE_GOVDATA || govResult.status === "fulfilled";
      const govFailed = ENABLE_GOVDATA && govResult.status === "rejected";
      const partialFailure = osmResult.status === "rejected" || govFailed;
      const merged = enrichProducersWithProducts(dedupeProducers([...osmProducers, ...govProducers]));
      const emptyArea = osmOk && govOk && merged.length === 0;
      const apiFailed = !osmOk && (!ENABLE_GOVDATA || govFailed);
      return { producers: merged, apiFailed, partialFailure, emptyArea };
    });
  }
  function loadAllData(_0, _1) {
    return __async(this, arguments, function* (lat, lng, options = {}) {
      var _a7;
      const latitude = Number(lat);
      const longitude = Number(lng);
      const radiusKm = Number((_a7 = options.radiusKm) != null ? _a7 : 10);
      const forceRefresh = !!options.forceRefresh;
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return {
          producers: [],
          fromCache: false,
          apiFailed: true,
          source: "no-location"
        };
      }
      if (loadPromise && !forceRefresh) {
        return loadPromise;
      }
      loadPromise = (() => __async(null, null, function* () {
        var _a8, _b;
        if (!forceRefresh) {
          const freshCache = readCache();
          if (((_a8 = freshCache == null ? void 0 : freshCache.producers) == null ? void 0 : _a8.length) && isCacheNearLocation(freshCache.lat, freshCache.lng, latitude, longitude)) {
            const enriched = enrichProducersWithProducts(freshCache.producers);
            setRegistry(enriched, {
              source: "cache",
              fromCache: true,
              apiFailed: false
            });
            return {
              producers: getProducers(),
              fromCache: true,
              apiFailed: false,
              source: "cache"
            };
          }
        }
        try {
          const live = yield fetchLiveData(latitude, longitude, radiusKm);
          if (live.emptyArea) {
            setRegistry([], {
              source: "empty-area",
              fromCache: false,
              apiFailed: false
            });
            return {
              producers: getProducers(),
              fromCache: false,
              apiFailed: false,
              emptyArea: true,
              source: "empty-area"
            };
          }
          if (live.producers.length > 0) {
            writeCache(latitude, longitude, live.producers);
            setRegistry(live.producers, {
              source: "live",
              fromCache: false,
              apiFailed: live.partialFailure
            });
            return {
              producers: getProducers(),
              fromCache: false,
              apiFailed: live.partialFailure,
              source: "live"
            };
          }
          throw new Error("API failed");
        } catch (error) {
          console.warn("[DataService] API failed, using stale cache:", error);
          const staleCache = readStaleCache();
          if (((_b = staleCache == null ? void 0 : staleCache.producers) == null ? void 0 : _b.length) && isCacheNearLocation(staleCache.lat, staleCache.lng, latitude, longitude)) {
            const enriched = enrichProducersWithProducts(staleCache.producers);
            setRegistry(enriched, {
              source: "stale-cache",
              fromCache: true,
              apiFailed: true
            });
            return {
              producers: getProducers(),
              fromCache: true,
              apiFailed: true,
              source: "stale-cache"
            };
          }
          setRegistry([], {
            source: "empty",
            fromCache: false,
            apiFailed: true
          });
          return {
            producers: [],
            fromCache: false,
            apiFailed: true,
            source: "empty"
          };
        } finally {
          loadPromise = null;
        }
      }))();
      return loadPromise;
    });
  }

  // js/data/products.js
  var featuredProducts = Object.freeze([]);
  function getFeaturedProductLabel(productId, field, t2) {
    const key = `home.featuredItems.${productId}.${field}`;
    const value = t2(key);
    return value !== key ? value : "";
  }
  function getFeaturedProductName(product, t2) {
    return getFeaturedProductLabel(product.id, "name", t2) || product.id;
  }
  function getFeaturedProductDesc(product, t2) {
    return getFeaturedProductLabel(product.id, "desc", t2) || "";
  }
  function getFeaturedProducerName(product) {
    var _a7;
    return ((_a7 = getProducerById(product.producerId)) == null ? void 0 : _a7.name) || "";
  }

  // js/data/reviews.js
  var STORAGE_KEY = "rg_producer_reviews";
  function readStored() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (_) {
      return [];
    }
  }
  function writeStored(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
  function normalizeReviewImageUrl(value) {
    const url = String(value || "").trim();
    if (!url || url.length > 500) return "";
    if (!/^https?:\/\//i.test(url)) return "";
    return url;
  }
  function escapeHtml(text) {
    return String(text != null ? text : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function buildReviewImageHtml(imageUrl, className = "producer-review-image") {
    const url = normalizeReviewImageUrl(imageUrl);
    if (!url) return "";
    return `
        <div class="producer-review-image-wrap">
            <img
                src="${escapeHtml(url)}"
                alt=""
                class="${escapeHtml(className)}"
                loading="lazy"
                decoding="async"
                referrerpolicy="no-referrer"
            >
        </div>
    `;
  }
  function getReviews(producerId) {
    const id = String(producerId);
    return readStored().filter((r) => String(r.producerId) === id).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }
  function addReview(producerId, review) {
    const imageUrl = normalizeReviewImageUrl(review.imageUrl);
    const entry = {
      producerId: String(producerId),
      user: String(review.user || "").trim(),
      rating: Math.min(5, Math.max(1, Number(review.rating) || 5)),
      comment: String(review.comment || "").trim(),
      date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
    };
    if (imageUrl) entry.imageUrl = imageUrl;
    if (!entry.user || !entry.comment) return null;
    const list = readStored();
    list.push(entry);
    writeStored(list);
    eventBus2.emit(EVENTS2.REVIEWS_CHANGED, { producerId: entry.producerId, review: entry });
    return entry;
  }
  function getAverageRating(producerId, fallbackRating = 0) {
    const reviews = getReviews(producerId);
    if (reviews.length === 0) {
      const fb = Number(fallbackRating);
      return Number.isFinite(fb) && fb > 0 ? fb : 0;
    }
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    return Math.round(sum / reviews.length * 10) / 10;
  }
  function formatRatingStars(rating) {
    const value = Number(rating);
    if (!Number.isFinite(value) || value <= 0) return "";
    const full = Math.min(5, Math.round(value));
    return `${"\u2605".repeat(full)}${"\u2606".repeat(5 - full)}`;
  }

  // js/presentation/categoryIcons.js
  var CATEGORY_ICONS = Object.freeze({
    all: "\u{1F30D}",
    farmer: "\u{1F33E}",
    farmers: "\u{1F33E}",
    bakery: "\u{1F956}",
    bakeries: "\u{1F956}",
    restaurant: "\u{1F37D}\uFE0F",
    restaurants: "\u{1F37D}\uFE0F",
    meat: "\u{1F969}",
    shop: "\u{1F3EA}",
    shops: "\u{1F6D2}",
    vending: "\u{1F916}",
    favorites: "\u2B50",
    honey: "\u{1F36F}",
    dairy: "\u{1F9C0}",
    fruit: "\u{1F34E}",
    vegetables: "\u{1F96C}",
    forest: "\u{1F332}",
    products: "\u{1F955}",
    other: "\u{1F4CD}"
  });
  function getCategoryIcon(category, options = {}) {
    if (options.productIcon) return options.productIcon;
    return CATEGORY_ICONS[category] || CATEGORY_ICONS.other;
  }
  var PRODUCER_TYPE_KEYS = Object.freeze({
    farmer: "farmer",
    bakery: "bakery",
    restaurant: "restaurant",
    meat: "meat",
    shop: "shop",
    vending: "vending",
    honey: "honey",
    dairy: "dairy",
    fruit: "fruit",
    vegetables: "vegetables",
    forest: "forest",
    other: "other"
  });
  function getProducerTypeKey(category) {
    return PRODUCER_TYPE_KEYS[category] || "other";
  }

  // js/presentation/chainBrands.js
  var CHAIN_BRANDS = Object.freeze([
    { id: "aldi", label: "ALDI", logo: "/assets/images/chains/aldi.svg" },
    { id: "lidl", label: "Lidl", logo: "/assets/images/chains/lidl.svg" },
    { id: "edeka", label: "EDEKA", logo: "/assets/images/chains/edeka.svg" },
    { id: "rewe", label: "REWE", logo: "/assets/images/chains/rewe.svg" },
    { id: "kaufland", label: "Kaufland", logo: "/assets/images/chains/kaufland.svg" },
    { id: "netto", label: "Netto", logo: "/assets/images/chains/netto.svg" },
    { id: "penny", label: "Penny", logo: "/assets/images/chains/penny.svg" },
    { id: "globus", label: "Globus", logo: null },
    { id: "norma", label: "Norma", logo: null },
    { id: "denns", label: "Denn's", logo: null },
    { id: "tegut", label: "tegut", logo: null },
    { id: "carrefour", label: "Carrefour", logo: null },
    { id: "auchan", label: "Auchan", logo: null },
    { id: "tesco", label: "Tesco", logo: null },
    { id: "walmart", label: "Walmart", logo: null },
    { id: "costco", label: "Costco", logo: null },
    { id: "biedronka", label: "Biedronka", logo: "/assets/images/chains/biedronka.svg" },
    { id: "coop", label: "Coop", logo: null },
    { id: "migros", label: "Migros", logo: null }
  ]);
  function getChainById(chainId) {
    if (!chainId || typeof chainId !== "string") return null;
    return CHAIN_BRANDS.find((brand) => brand.id === chainId) || null;
  }
  function resolveProducerChain(producer) {
    const byId = getChainById(producer == null ? void 0 : producer.chain);
    if (byId) return byId;
    return detectChainBrand(producer == null ? void 0 : producer.name);
  }
  function detectChainBrand(name) {
    if (!name || typeof name !== "string") return null;
    const lower = name.toLowerCase();
    for (const brand of CHAIN_BRANDS) {
      if (lower.includes(brand.label.toLowerCase())) return brand;
    }
    return null;
  }
  function getProducerDisplayName(producer) {
    const chain = resolveProducerChain(producer);
    if (chain) return chain.label;
    return (producer == null ? void 0 : producer.name) || "";
  }
  function buildChainLogoHtml(chain, fallbackIcon = "\u{1F3EA}") {
    if (chain == null ? void 0 : chain.logo) {
      return `<img src="${chain.logo}" alt="" class="chain-logo" width="28" height="28" loading="lazy" decoding="async" />`;
    }
    return `<span class="chain-logo-fallback" aria-hidden="true">${fallbackIcon}</span>`;
  }

  // js/presentation/productImage.js
  function escapeHtml2(text) {
    return String(text != null ? text : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function buildProductImageHtml(imageUrl, t2, options = {}) {
    const extraClass = options.className ? ` ${options.className}` : "";
    if (imageUrl) {
      const jpegUrl = getProductImageJpegUrl(imageUrl);
      const webpUrl = imageUrl.endsWith(".webp") ? imageUrl : null;
      if (webpUrl && jpegUrl) {
        return `
                <picture>
                    <source srcset="${escapeHtml2(webpUrl)}" type="image/webp">
                    <img src="${escapeHtml2(jpegUrl)}" alt="" class="product-image-photo${extraClass}" loading="lazy" decoding="async" />
                </picture>
            `;
      }
      return `<img src="${escapeHtml2(imageUrl)}" alt="" class="product-image-photo${extraClass}" loading="lazy" decoding="async" />`;
    }
    const label = t2("product.placeholderImage");
    const note = t2("product.placeholderNote");
    return `
        <div class="product-image-fallback${extraClass}" title="${escapeHtml2(note)}">
            <span class="product-image-fallback-icon" aria-hidden="true">\u{1F4F7}</span>
            <span class="product-image-fallback-label">${escapeHtml2(label)}</span>
        </div>
    `;
  }

  // js/presentation/producerDisplay.js
  function escapeHtml3(text) {
    return String(text != null ? text : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function formatRatingStars2(rating) {
    const value = Number(rating);
    if (!Number.isFinite(value) || value <= 0) return "";
    const full = Math.min(5, Math.round(value));
    return `${"\u2605".repeat(full)}${"\u2606".repeat(5 - full)}`;
  }
  function buildProducerHeaderHtml(producer, options = {}) {
    const chain = resolveProducerChain(producer);
    const displayName = getProducerDisplayName(producer);
    const isShop = producer.category === "shop" || !!chain;
    const icon = getCategoryIcon(producer.category, { productIcon: isShop ? "\u{1F3EA}" : void 0 });
    const logoHtml = chain ? buildChainLogoHtml(chain, icon) : `<span class="producer-header-icon" aria-hidden="true">${icon}</span>`;
    const typeKey = getProducerTypeKey(producer.category);
    const typeLabel = t(`producer.types.${typeKey}`);
    const stars = formatRatingStars2(producer.rating);
    const ratingHtml = stars ? `<div class="producer-header-rating"><span class="producer-stars" aria-hidden="true">${stars}</span><span class="producer-rating-value">${producer.rating}</span></div>` : "";
    const hoursHtml = producer.hours ? `<p class="producer-header-meta">${escapeHtml3(producer.hours)}</p>` : producer.openUntil ? `<p class="producer-header-meta">${escapeHtml3(t("producer.openUntil").replace("{time}", producer.openUntil))}</p>` : "";
    const distanceHtml = producer.distance ? `<p class="producer-header-distance">${escapeHtml3(t("producer.distance").replace("{distance}", producer.distance))}</p>` : "";
    const promoHtml = producer.promo && !options.compact ? `<p class="producer-modal-promo">${escapeHtml3(producer.promo)}</p>` : "";
    return `
        <div class="producer-header-card">
            <div class="producer-header-top">
                ${logoHtml}
                <div class="producer-header-titles">
                    <h2 class="producer-header-name" id="producerModalTitle">${escapeHtml3(displayName)}</h2>
                    ${ratingHtml}
                </div>
            </div>
            <div class="producer-header-details">
                ${hoursHtml}
                <p class="producer-header-type">${escapeHtml3(typeLabel)}</p>
                ${distanceHtml}
                ${producer.address ? `<p class="producer-header-address">${escapeHtml3(producer.address)}</p>` : ""}
            </div>
            ${promoHtml}
        </div>
    `;
  }
  function buildMapPopupHtml(producer, ctx) {
    const description = tProducerDescription(producer.id, producer.description);
    const header = buildProducerHeaderHtml(producer, { compact: true });
    const promoHtml = producer.promo ? `<div class="map-popup-promo">${escapeHtml3(producer.promo)}</div>` : "";
    return `
        <div class="map-popup" data-producer-id="${escapeHtml3(producer.id)}">
            ${header}
            <p class="map-popup-desc"><em>${escapeHtml3(description)}</em></p>
            ${promoHtml}
            <div class="map-popup-actions">
                <button type="button" class="map-popup-btn map-popup-btn-details" data-details-id="${escapeHtml3(producer.id)}">\u{1F4CB} ${t("btn.details")}</button>
                <button type="button" class="map-popup-btn" data-favorite-id="${escapeHtml3(producer.id)}">${ctx.favoriteLabel}</button>
                <a class="map-popup-btn map-popup-nav" href="${escapeHtml3(ctx.navUrl)}" target="_blank" rel="noopener noreferrer">\u{1F9ED} ${t("btn.navigate")}</a>
            </div>
        </div>
    `;
  }

  // js/auth/auth.js
  var USERS_KEY = "rg_auth_users";
  var SESSION_KEY = "rg_auth_session";
  var ACCOUNT_TYPES = Object.freeze({
    client: "client",
    producer: "producer"
  });
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function readUsers() {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (_) {
      return [];
    }
  }
  function writeUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  function readSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }
  function writeSession(session) {
    if (!session) {
      localStorage.removeItem(SESSION_KEY);
      return;
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  function createId2() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `u_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
  function bytesToHex(bytes) {
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  function hashPassword(password, salt) {
    return __async(this, null, function* () {
      const enc = new TextEncoder();
      const keyMaterial = yield crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
      );
      const bits = yield crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          salt: enc.encode(salt),
          iterations: 1e5,
          hash: "SHA-256"
        },
        keyMaterial,
        256
      );
      return bytesToHex(new Uint8Array(bits));
    });
  }
  function validateEmail(email) {
    return EMAIL_RE.test(String(email || "").trim().toLowerCase());
  }
  function validatePassword(password) {
    return String(password || "").length >= 6;
  }
  function getCurrentUser() {
    const session = readSession();
    if (!(session == null ? void 0 : session.userId)) return null;
    const user = readUsers().find((u) => u.id === session.userId);
    if (!user) {
      writeSession(null);
      return null;
    }
    return {
      id: user.id,
      email: user.email,
      accountType: user.accountType,
      displayName: user.displayName || user.email.split("@")[0],
      createdAt: user.createdAt
    };
  }
  function isLoggedIn() {
    return getCurrentUser() !== null;
  }
  function isProducer() {
    var _a7;
    return ((_a7 = getCurrentUser()) == null ? void 0 : _a7.accountType) === ACCOUNT_TYPES.producer;
  }
  function register(data) {
    return __async(this, null, function* () {
      var _a7;
      const email = String(data.email || "").trim().toLowerCase();
      const password = String(data.password || "");
      const passwordConfirm = String((_a7 = data.passwordConfirm) != null ? _a7 : password);
      const accountType = data.accountType === ACCOUNT_TYPES.producer ? ACCOUNT_TYPES.producer : ACCOUNT_TYPES.client;
      const displayName = String(data.displayName || "").trim();
      if (!validateEmail(email)) {
        return { ok: false, error: "invalidEmail" };
      }
      if (!validatePassword(password)) {
        return { ok: false, error: "passwordShort" };
      }
      if (password !== passwordConfirm) {
        return { ok: false, error: "passwordMismatch" };
      }
      const users = readUsers();
      if (users.some((u) => u.email === email)) {
        return { ok: false, error: "emailTaken" };
      }
      const producerCategories = accountType === ACCOUNT_TYPES.producer ? Array.isArray(data.producerCategories) ? data.producerCategories.filter(Boolean) : [] : [];
      if (accountType === ACCOUNT_TYPES.producer && producerCategories.length === 0) {
        return { ok: false, error: "categoriesRequired" };
      }
      const salt = createId2();
      const passwordHash = yield hashPassword(password, salt);
      const user = {
        id: createId2(),
        email,
        accountType,
        displayName: displayName || email.split("@")[0],
        passwordHash,
        salt,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      users.push(user);
      writeUsers(users);
      if (accountType === ACCOUNT_TYPES.producer) {
        initProducerAccount(user.id, {
          name: user.displayName,
          email: user.email,
          categories: producerCategories
        });
      }
      writeSession({ userId: user.id, loggedInAt: (/* @__PURE__ */ new Date()).toISOString() });
      const current = getCurrentUser();
      eventBus2.emit(EVENTS2.AUTH_CHANGED, { user: current });
      return { ok: true, user: current };
    });
  }
  function login(data) {
    return __async(this, null, function* () {
      const email = String(data.email || "").trim().toLowerCase();
      const password = String(data.password || "");
      if (!validateEmail(email)) {
        return { ok: false, error: "invalidEmail" };
      }
      if (!validatePassword(password)) {
        return { ok: false, error: "passwordShort" };
      }
      const user = readUsers().find((u) => u.email === email);
      if (!user) {
        return { ok: false, error: "invalidCredentials" };
      }
      const passwordHash = yield hashPassword(password, user.salt);
      if (passwordHash !== user.passwordHash) {
        return { ok: false, error: "invalidCredentials" };
      }
      if (data.expectedAccountType && user.accountType !== data.expectedAccountType) {
        return { ok: false, error: "wrongAccountType" };
      }
      writeSession({ userId: user.id, loggedInAt: (/* @__PURE__ */ new Date()).toISOString() });
      const current = getCurrentUser();
      eventBus2.emit(EVENTS2.AUTH_CHANGED, { user: current });
      return { ok: true, user: current };
    });
  }
  function logout() {
    writeSession(null);
    eventBus2.emit(EVENTS2.AUTH_CHANGED, { user: null });
  }
  function updateClientProfile(patch) {
    const current = getCurrentUser();
    if (!current) return { ok: false, error: "notLoggedIn" };
    const users = readUsers();
    const idx = users.findIndex((u) => u.id === current.id);
    if (idx === -1) return { ok: false, error: "notFound" };
    if (patch.displayName != null) {
      users[idx].displayName = String(patch.displayName).trim() || users[idx].email.split("@")[0];
    }
    writeUsers(users);
    const user = getCurrentUser();
    eventBus2.emit(EVENTS2.AUTH_CHANGED, { user });
    return { ok: true, user };
  }
  function initAuth() {
    const user = getCurrentUser();
    if (user) {
      eventBus2.emit(EVENTS2.AUTH_CHANGED, { user });
    }
  }

  // js/core/toast.js
  var toastEl = null;
  var hideTimer = null;
  function showToast(message, type = "info") {
    var _a7;
    if (!message) return;
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.id = "appToast";
      toastEl.className = "app-toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.dataset.type = type;
    toastEl.hidden = false;
    toastEl.classList.add("app-toast--visible");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      toastEl == null ? void 0 : toastEl.classList.remove("app-toast--visible");
      if (toastEl) toastEl.hidden = true;
    }, (_a7 = CONFIG.TOAST_DURATION) != null ? _a7 : 1800);
  }
  function initToast() {
    if (!document.getElementById("toast-styles")) {
      const style = document.createElement("style");
      style.id = "toast-styles";
      style.textContent = `
            .app-toast {
                position: fixed;
                left: 50%;
                bottom: calc(var(--nav-height) + var(--safe-bottom) + 16px);
                transform: translateX(-50%) translateY(12px);
                z-index: ${Z_INDEX.toast};
                max-width: min(420px, calc(100vw - 32px));
                padding: 12px 18px;
                border-radius: var(--radius-pill, 999px);
                background: rgba(20, 28, 40, 0.82);
                color: #f5f8fa;
                font-size: 13px;
                font-weight: 600;
                line-height: 1.4;
                text-align: center;
                border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.18));
                box-shadow: var(--glass-shadow, 0 6px 24px rgba(15, 40, 30, 0.22));
                -webkit-backdrop-filter: blur(var(--glass-blur, 8px)) saturate(var(--glass-saturate, 128%));
                backdrop-filter: blur(var(--glass-blur, 8px)) saturate(var(--glass-saturate, 128%));
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s ease, transform 0.2s ease;
            }
            .app-toast--visible {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            body.dark-mode .app-toast {
                background: rgba(12, 18, 28, 0.9);
                border-color: rgba(255, 255, 255, 0.14);
            }
            @media (prefers-reduced-motion: reduce) {
                .app-toast { transition: none; }
            }
        `;
      document.head.appendChild(style);
    }
  }

  // js/views/producerModal.js
  var initialized = false;
  var lastFocusedElement = null;
  var locationMiniMap = null;
  var MODAL_MAP_ZOOM = 14;
  var MODAL_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  function escapeHtml4(text) {
    return String(text != null ? text : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function formatPrice(value) {
    return `${Number(value || 0).toFixed(2)} \u20AC`;
  }
  function ensureModal() {
    if (document.getElementById("producerModal")) return;
    document.body.insertAdjacentHTML("beforeend", `
        <div id="producerModal" class="producer-modal" hidden aria-hidden="true">
            <div class="producer-modal-backdrop" data-close-modal></div>
            <div class="producer-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="producerModalTitle">
                <div class="producer-modal-content" id="producerModalContent"></div>
            </div>
        </div>
    `);
  }
  function getFocusableElements(root) {
    if (!root) return [];
    return Array.from(root.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ));
  }
  function handleModalKeydown(event) {
    const modal = document.getElementById("producerModal");
    if (!modal || modal.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeProducerModal();
      return;
    }
    if (event.key !== "Tab") return;
    const dialog = modal.querySelector(".producer-modal-dialog");
    const focusable = getFocusableElements(dialog);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  function buildContactHtml(producer) {
    const items = [];
    if (producer.phone) {
      const tel = producer.phone.replace(/\s/g, "");
      items.push(`<a class="producer-contact-item" href="tel:${escapeHtml4(tel)}">\u{1F4DE} ${escapeHtml4(producer.phone)}</a>`);
    }
    if (producer.email) {
      items.push(`<a class="producer-contact-item" href="mailto:${escapeHtml4(producer.email)}">\u2709\uFE0F ${escapeHtml4(producer.email)}</a>`);
    }
    if (producer.website) {
      items.push(`<a class="producer-contact-item" href="${escapeHtml4(producer.website)}" target="_blank" rel="noopener noreferrer">\u{1F310} ${escapeHtml4(producer.website.replace(/^https?:\/\//, ""))}</a>`);
    }
    if (items.length === 0) return "";
    return `
        <section class="producer-contact-section">
            <h3 class="producer-section-title">${t("producer.contactTitle")}</h3>
            <div class="producer-contact-list">${items.join("")}</div>
        </section>
    `;
  }
  function destroyLocationMiniMap() {
    if (!locationMiniMap) return;
    locationMiniMap.remove();
    locationMiniMap = null;
  }
  function initLocationMiniMap(root) {
    destroyLocationMiniMap();
    const el = root == null ? void 0 : root.querySelector("[data-producer-mini-map]");
    if (!el || typeof window.L === "undefined") return;
    const lat = Number(el.dataset.lat);
    const lng = Number(el.dataset.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    locationMiniMap = window.L.map(el, {
      zoomControl: false,
      attributionControl: true,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      boxZoom: false,
      keyboard: false
    }).setView([lat, lng], MODAL_MAP_ZOOM);
    window.L.tileLayer(MODAL_TILE_URL, {
      attribution: "\xA9 OpenStreetMap",
      maxZoom: 19
    }).addTo(locationMiniMap);
    window.L.marker([lat, lng]).addTo(locationMiniMap);
    requestAnimationFrame(() => locationMiniMap == null ? void 0 : locationMiniMap.invalidateSize(true));
  }
  function buildLocationHtml(producer) {
    const lat = Number(producer.lat);
    const lng = Number(producer.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "";
    const mapsUrl = getGoogleMapsDirectionsUrl(lat, lng);
    return `
        <section class="producer-location-section">
            <h3 class="producer-section-title">${t("producer.locationTitle")}</h3>
            <div class="producer-location-preview">
                <div
                    class="producer-location-map"
                    data-producer-mini-map
                    data-lat="${lat}"
                    data-lng="${lng}"
                    role="img"
                    aria-label="${escapeHtml4(producer.address || producer.name)}"
                ></div>
                <a class="producer-location-nav" href="${escapeHtml4(mapsUrl)}" target="_blank" rel="noopener noreferrer">
                    \u{1F4CD} ${escapeHtml4(t("btn.navigate"))}
                </a>
            </div>
            ${producer.address ? `<p class="producer-location-address">${escapeHtml4(producer.address)}</p>` : ""}
        </section>
    `;
  }
  function buildReviewsHtml(producer) {
    var _a7;
    const reviews = getReviews(producer.id);
    const avg = getAverageRating(producer.id, producer.rating);
    const stars = formatRatingStars(avg);
    const listHtml = reviews.length ? reviews.map((review) => `
            <article class="producer-review-card">
                <div class="producer-review-head">
                    <strong>${escapeHtml4(review.user)}</strong>
                    <span class="producer-review-stars" aria-label="${review.rating}">${formatRatingStars(review.rating)}</span>
                </div>
                <p class="producer-review-comment">${escapeHtml4(review.comment)}</p>
                ${buildReviewImageHtml(review.imageUrl)}
                <time class="producer-review-date" datetime="${escapeHtml4(review.date)}">${escapeHtml4(review.date)}</time>
            </article>
        `).join("") : `<p class="producer-reviews-empty">${t("reviews.empty")}</p>`;
    const reviewUserName = ((_a7 = getCurrentUser()) == null ? void 0 : _a7.displayName) || "";
    return `
        <section class="producer-reviews-section">
            <h3 class="producer-section-title">${t("reviews.title")}${avg ? ` <span class="producer-reviews-avg">${stars} ${avg}</span>` : ""}</h3>
            <div class="producer-reviews-list">${listHtml}</div>
            <form class="producer-review-form" data-review-form data-producer-id="${escapeHtml4(producer.id)}">
                <h4 class="producer-review-form-title">${t("reviews.add")}</h4>
                <label class="producer-review-field">
                    <span>${t("reviews.userName")}</span>
                    <input type="text" name="user" required maxlength="40" autocomplete="name" value="${escapeHtml4(reviewUserName)}">
                </label>
                <label class="producer-review-field">
                    <span>${t("reviews.rating")}</span>
                    <select name="rating" required>
                        <option value="5">5 \u2605</option>
                        <option value="4">4 \u2605</option>
                        <option value="3">3 \u2605</option>
                        <option value="2">2 \u2605</option>
                        <option value="1">1 \u2605</option>
                    </select>
                </label>
                <label class="producer-review-field">
                    <span>${t("reviews.comment")}</span>
                    <textarea name="comment" rows="3" required maxlength="500"></textarea>
                </label>
                <label class="producer-review-field">
                    <span>${t("reviews.imageUrl")}</span>
                    <input type="url" name="imageUrl" inputmode="url" maxlength="500" placeholder="https://">
                    <small class="producer-review-field-hint">${escapeHtml4(t("reviews.imageUrlHint"))}</small>
                </label>
                <button type="submit" class="btn-primary producer-review-submit">${t("reviews.submit")}</button>
            </form>
        </section>
    `;
  }
  function buildProductCard(producerId, product, index) {
    const name = tProductField(producerId, index, "name", product.name);
    const description = tProductField(producerId, index, "description", product.description || "");
    const priceLabel = `${formatPrice(product.price)}${product.unit ? ` / ${escapeHtml4(product.unit)}` : ""}`;
    const imageHtml = buildProductImageHtml(product.imageUrl || null, t);
    return `
        <article class="producer-product-card">
            <div class="producer-product-image">
                ${imageHtml}
            </div>
            <div class="producer-product-info">
                <h3 class="producer-product-name">${escapeHtml4(name)}</h3>
                <p class="producer-product-desc">${escapeHtml4(description)}</p>
                <p class="producer-product-price">${priceLabel}</p>
                ${product.promo ? `<p class="producer-product-promo">${escapeHtml4(product.promo)}</p>` : ""}
            </div>
        </article>
    `;
  }
  function isExternalProducerWithoutCatalog(producer) {
    return (producer.source === "osm" || producer.source === "govdata") && getProducerProducts(producer.id).length === 0;
  }
  function buildPromotionsHtml(producer) {
    const promotions = (producer.promotions || []).filter((promo) => {
      var _a7;
      return (_a7 = promo == null ? void 0 : promo.title) == null ? void 0 : _a7.trim();
    });
    if (!promotions.length) return "";
    const products = getProducerProducts(producer.id);
    const cards = promotions.map((promo) => {
      const product = products.find((item) => item.id === promo.productId);
      const discount = promo.discount ? `<span class="producer-promo-discount">-${escapeHtml4(promo.discount)}%</span>` : "";
      const productLabel = (product == null ? void 0 : product.name) ? `<p class="producer-promo-product">${escapeHtml4(product.name)}</p>` : "";
      return `
            <article class="producer-promo-card">
                <h4 class="producer-promo-title">${escapeHtml4(promo.title)} ${discount}</h4>
                ${productLabel}
                ${promo.description ? `<p class="producer-promo-desc">${escapeHtml4(promo.description)}</p>` : ""}
            </article>
        `;
    }).join("");
    return `
        <section class="producer-promotions-section">
            <h3 class="producer-section-title">${t("producer.promotionsTitle")}</h3>
            <div class="producer-promotions-list">${cards}</div>
        </section>
    `;
  }
  function buildProductsHtml(producer) {
    const products = getProducerProducts(producer.id);
    if (!products.length) {
      const messageKey = isExternalProducerWithoutCatalog(producer) ? "msg.noOfferProducts" : "msg.noProducts";
      return `
            <section class="producer-products-section">
                <h3 class="producer-section-title">${t("producer.productsTitle")}</h3>
                <p class="producer-modal-empty">${t(messageKey)}</p>
            </section>
        `;
    }
    return `
        <section class="producer-products-section">
            <h3 class="producer-section-title">${t("producer.productsTitle")}</h3>
            <div class="producer-modal-grid">
                ${products.map((product, index) => buildProductCard(producer.id, product, index)).join("")}
            </div>
        </section>
    `;
  }
  function bindReviewForm(content, producerId) {
    const form = content.querySelector("[data-review-form]");
    if (!form || form.dataset.bound === "true") return;
    form.dataset.bound = "true";
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const entry = addReview(producerId, {
        user: data.get("user"),
        rating: data.get("rating"),
        comment: data.get("comment"),
        imageUrl: data.get("imageUrl")
      });
      if (!entry) return;
      showToast(t("reviews.saved"));
      const producer = getProducerById(producerId);
      if (producer) {
        content.innerHTML = renderModalContent(producer);
        bindReviewForm(content, producerId);
        initLocationMiniMap(content);
      }
    });
  }
  function renderModalContent(producer) {
    return `
        <div class="producer-modal-toolbar">
            <button type="button" class="producer-modal-back" data-close-modal aria-label="${t("btn.back")}">
                \u2190 ${t("btn.back")}
            </button>
        </div>
        <header class="producer-modal-header">
            ${buildProducerHeaderHtml(producer)}
        </header>
        <div class="producer-modal-body">
            ${buildProductsHtml(producer)}
            ${buildPromotionsHtml(producer)}
            ${buildContactHtml(producer)}
            ${buildReviewsHtml(producer)}
            ${buildLocationHtml(producer)}
        </div>
        <footer class="producer-modal-footer">
            <button type="button" class="producer-modal-close" data-close-modal>${t("btn.close")}</button>
        </footer>
    `;
  }
  function openProducerModal(producerId) {
    const producer = getProducerById(producerId);
    if (!producer) return;
    ensureModal();
    const modal = document.getElementById("producerModal");
    const content = document.getElementById("producerModalContent");
    if (!modal || !content) return;
    lastFocusedElement = document.activeElement;
    content.innerHTML = renderModalContent(producer);
    bindReviewForm(content, producer.id);
    initLocationMiniMap(content);
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("producer-modal-open");
    const backBtn = content.querySelector(".producer-modal-back");
    backBtn == null ? void 0 : backBtn.focus();
  }
  function closeProducerModal() {
    const modal = document.getElementById("producerModal");
    if (!modal || modal.hidden) return;
    destroyLocationMiniMap();
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("producer-modal-open");
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
    lastFocusedElement = null;
  }
  function initProducerModal() {
    if (initialized) return;
    initialized = true;
    ensureModal();
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-close-modal]")) {
        closeProducerModal();
      }
    });
    document.addEventListener("keydown", handleModalKeydown);
  }

  // js/views/favorites.js
  var STORAGE_KEY2 = "regionalny_smak_favorites";
  var CATEGORY_ICONS2 = {
    farmer: getCategoryIcon("farmer"),
    bakery: getCategoryIcon("bakery"),
    restaurant: getCategoryIcon("restaurant"),
    meat: getCategoryIcon("meat"),
    shop: getCategoryIcon("shop"),
    vending: getCategoryIcon("vending"),
    other: getCategoryIcon("other")
  };
  function renderFavorites(container) {
    if (!container) return;
    injectStyles();
    initProducerModal();
    render(container);
    bindEvents(container);
  }
  function injectStyles() {
    if (document.getElementById("favorites-view-styles")) return;
    const style = document.createElement("style");
    style.id = "favorites-view-styles";
    style.textContent = `
        .favorites-page { display: flex; flex-direction: column; gap: var(--space-lg); }
        .view-hero { margin-bottom: var(--space-sm); }
        .view-hero h2 { font-size: var(--text-2xl); color: var(--color-accent); margin-bottom: var(--space-xs); }
        .view-hero p { font-size: var(--text-sm); }
        .favorites-list { display: flex; flex-direction: column; gap: var(--space-sm); }
        .favorite-item { display: flex; align-items: center; gap: var(--space-md); }
        .favorite-item .icon { font-size: var(--icon-lg); flex-shrink: 0; }
        .favorite-item .info { flex: 1; min-width: 0; }
        .favorite-item .name { font-weight: 600; margin-bottom: 2px; }
        .favorite-item .meta { font-size: var(--text-sm); color: var(--text-muted); }
        .favorite-remove { min-height: 36px; padding: var(--space-xs) var(--space-md); font-size: var(--text-sm); color: var(--color-error); background: transparent; border: 1px solid var(--color-border); border-radius: var(--radius-sm); }
        .empty-state { text-align: center; padding: var(--space-2xl) var(--space-lg); }
        .empty-state .empty-icon { font-size: 48px; display: block; margin-bottom: var(--space-md); }
        .empty-state p { margin-bottom: var(--space-sm); }
        .empty-sub { font-size: var(--text-sm); color: var(--text-muted); margin-bottom: var(--space-lg) !important; }
    `;
    document.head.appendChild(style);
  }
  function getFavoriteIds() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY2);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list.map(String) : [];
    } catch (_) {
      return [];
    }
  }
  function setFavoriteIds(ids) {
    localStorage.setItem(STORAGE_KEY2, JSON.stringify(ids));
    eventBus2.emit(EVENTS2.FAVORITES_CHANGED, { favorites: ids });
    updateNavBadge(ids.length);
  }
  function updateNavBadge(count) {
    const label = document.querySelector('[data-view="favorites"] .nav-label');
    if (label) {
      label.textContent = formatNavLabel("favorites", count);
    }
  }
  function getFavoritePlaces() {
    const ids = getFavoriteIds();
    return ids.map((id) => getProducerById(id)).filter(Boolean);
  }
  function render(container) {
    const places = getFavoritePlaces();
    const count = places.length;
    container.innerHTML = `
        <div class="favorites-page">
            <header class="view-hero">
                <h2>\u2B50 ${t("favorites.title")}</h2>
                <p class="text-muted">${t("favorites.subtitle")}</p>
            </header>
            ${count === 0 ? renderEmpty() : renderList(places)}
        </div>
    `;
  }
  function renderEmpty() {
    return `
        <div class="empty-state card">
            <span class="empty-icon" aria-hidden="true">\u2B50</span>
            <p>${t("favorites.empty")}</p>
            <p class="empty-sub">${t("favorites.emptySub")}</p>
            <button type="button" id="favoritesGoMapBtn" class="btn-primary">${t("btn.toMap")}</button>
        </div>
    `;
  }
  function renderList(places) {
    return `
        <div class="favorites-list" id="favoritesList">
            ${places.map((place) => `
                <article class="list-item favorite-item" data-id="${place.id}">
                    <span class="icon" aria-hidden="true">${CATEGORY_ICONS2[place.category] || "\u{1F4CD}"}</span>
                    <div class="info">
                        <div class="name">${getProducerDisplayName(place)}</div>
                        <div class="meta">${place.address || ""}</div>
                    </div>
                    <button type="button" class="favorite-remove" data-remove="${place.id}" aria-label="${t("btn.remove")}">\u2715</button>                </article>
            `).join("")}
        </div>
    `;
  }
  function refreshFavoritesBadge() {
    updateNavBadge(getFavoriteIds().length);
  }
  function bindEvents(container) {
    if (container.dataset.eventsBound === "true") return;
    container.dataset.eventsBound = "true";
    container.addEventListener("click", (e) => {
      const removeBtn = e.target.closest("[data-remove]");
      if (removeBtn) {
        const id = removeBtn.dataset.remove;
        const ids = getFavoriteIds().filter((fid) => fid !== id);
        setFavoriteIds(ids);
        render(container);
        return;
      }
      const item = e.target.closest(".favorite-item");
      if (item == null ? void 0 : item.dataset.id) {
        openProducerModal(item.dataset.id);
        return;
      }
      if (e.target.closest("#favoritesGoMapBtn")) {
        navigateTo("map");
      }
    });
    updateNavBadge(getFavoriteIds().length);
  }
  function addFavorite(id) {
    const sid = String(id);
    const ids = getFavoriteIds();
    if (!ids.includes(sid)) {
      setFavoriteIds([...ids, sid]);
    }
  }
  function removeFavorite(id) {
    setFavoriteIds(getFavoriteIds().filter((fid) => fid !== String(id)));
  }
  function isFavorite(id) {
    return getFavoriteIds().includes(String(id));
  }

  // js/presentation/searchLexicon.js
  var PRODUCER_TO_CATEGORY_KEY = Object.freeze({
    farmer: "farmers",
    bakery: "bakeries",
    restaurant: "restaurants",
    meat: "meat",
    shop: "shops",
    vending: "vending",
    honey: "farmers",
    dairy: "farmers",
    fruit: "farmers",
    vegetables: "farmers",
    forest: "farmers",
    other: "all"
  });
  var SYNONYM_GROUPS = Object.freeze([
    ["bread", "brot", "chleb", "\u0445\u043B\u0435\u0431", "ekmek", "pain", "pan", "brood", "br\xF8d", "br\xF6d", "leip\xE4", "p\xE3o", "\u0445\u043B\u0456\u0431", "keny\xE9r", "\u9762\u5305", "\u9EB5\u5305", "\u30D1\u30F3", "\uBE75", "b\xE1nh", "roti", "\u0E02\u0E19\u0E21\u0E1B\u0E31\u0E07", "\u0930\u094B\u091F\u0940", "b\xE4ck", "back", "bake", "bakery", "b\xE4ckerei", "piekarz", "\u043F\u0435\u043A\u0430\u0440\u043D\u044F", "f\u0131r\u0131n", "boulangerie", "panader\xEDa", "panificio", "bakkerij", "pekar", "piekarnia"],
    ["cheese", "k\xE4se", "ser", "\u0441\u044B\u0440", "peynir", "fromage", "queso", "formaggio", "kaas", "s\xFDr", "juust", "br\xE2nz\u0103", "\u0441\u0438\u0440", "\u03C4\u03C5\u03C1\u03AF", "sajt", "sir", "syr", "s\u016Bris", "siers", "juusto", "ost", "\u5976\u916A", "\u30C1\u30FC\u30BA", "\uCE58\uC988", "ph\xF4", "keju", "\u0E0A\u0E35\u0E2A", "\u092A\u0928\u0940\u0930", "k\xE4se", "molkerei", "mleko", "dairy"],
    ["meat", "fleisch", "mi\u0119so", "\u043C\u044F\u0441\u043E", "et", "viande", "carne", "vlees", "maso", "h\xFAs", "\u043C\u0435\u0441\u043E", "\u03BA\u03C1\u03AD\u03B1\u03C2", "meso", "m\u0117sa", "ga\u013Ca", "liha", "kj\xF6t", "k\xF6tt", "\u8089", "\uACE0\uAE30", "th\u1ECBt", "daging", "\u0E40\u0E19\u0E37\u0E49\u0E2D", "\u092E\u093E\u0902\u0938", "metzgerei", "butcher", "fleischerei", "wurst", "kasap"],
    ["restaurant", "restauracja", "\u0440\u0435\u0441\u0442\u043E\u0440\u0430\u043D", "restoran", "restaurante", "ristorante", "restaurace", "re\u0161taur\xE1cia", "\xE9tterem", "\u0440\u0435\u0441\u0442\u043E\u0440\u0430\u043D\u0442", "\u03B5\u03C3\u03C4\u03B9\u03B1\u03C4\u03CC\u03C1\u03B9\u03BF", "restoran", "\u0440\u0435\u0441\u0442\u043E\u0440\u0430\u043D", "restavracija", "restoranas", "restor\u0101ns", "ravintola", "restaurang", "veitingasta\xF0ur", "\u9910\u5385", "\u9910\u5EF3", "\u30EC\u30B9\u30C8\u30E9\u30F3", "\uB808\uC2A4\uD1A0\uB791", "nh\xE0 h\xE0ng", "restoran", "\u0E23\u0E49\u0E32\u0E19\u0E2D\u0E32\u0E2B\u0E32\u0E23", "\u0930\u0947\u0938\u094D\u0924\u0930\u093E\u0902", "gasthaus", "gastst\xE4tte", "imbiss"],
    ["farm", "farmer", "gospodarstwo", "\u0444\u0435\u0440\u043C\u0430", "\xE7iftlik", "ferme", "granja", "fattoria", "boerderij", "farma", "gazdas\xE1g", "ferm\u0103", "\u03B1\u03B3\u03C1\u03CC\u03BA\u03C4\u03B7\u03BC\u03B1", "kmetija", "\u016Bkis", "g\xE5rd", "\u519C\u573A", "\u8FB2\u5834", "\u8FB2\u5834", "\uB18D\uC7A5", "trang tr\u1EA1i", "ladang", "peternakan", "\u0E1F\u0E32\u0E23\u0E4C\u0E21", "\u0916\u0947\u0924", "hof", "landwirt", "bauernhof", "bio"],
    ["shop", "sklep", "\u043C\u0430\u0433\u0430\u0437\u0438\u043D", "ma\u011Faza", "magasin", "tienda", "negozio", "winkel", "obchod", "bolt", "magazin", "\u03BA\u03B1\u03C4\u03AC\u03C3\u03C4\u03B7\u03BC\u03B1", "trgovina", "\u043F\u0440\u043E\u0434\u0430\u0432\u043D\u0438\u0446\u0430", "parduotuv\u0117", "veikals", "pood", "kauppa", "butik", "verslun", "\u5546\u5E97", "\uAC00\uAC8C", "c\u1EEDa h\xE0ng", "kedai", "toko", "\u0E23\u0E49\u0E32\u0E19\u0E04\u0E49\u0E32", "\u0926\u0941\u0915\u093E\u0928", "supermarket", "markt", "lidl", "rewe", "edeka", "aldi"],
    ["honey", "honig", "mi\xF3d", "\u043C\u0451\u0434", "bal", "miel", "miele", "honing", "med", "m\xE9z", "miere", "\u043C\u0435\u0434", "\u03BC\u03AD\u03BB\u03B9", "med", "medus", "medus", "hunaja", "honung", "honning", "honning", "h\xFAnang", "\u8702\u871C", "\u30CF\u30C1\u30DF\u30C4", "\uAFC0", "m\u1EADt", "madu", "\u0E19\u0E49\u0E33\u0E1C\u0E36\u0E49\u0E07", "\u0936\u0939\u0926", "imkerei", "imker"],
    ["vegetable", "gem\xFCse", "warzywa", "\u043E\u0432\u043E\u0449\u0438", "sebze", "l\xE9gume", "verdura", "groente", "zelenina", "zelenina", "z\xF6lds\xE9g", "legume", "\u0437\u0435\u043B\u0435\u043D\u0447\u0443\u0446\u0438", "\u03BB\u03B1\u03C7\u03B1\u03BD\u03B9\u03BA\u03AC", "povr\u0107e", "zelenjava", "dar\u017Eov\u0117s", "d\u0101rze\u0146i", "k\xF6\xF6giviljad", "vihannes", "gr\xF6nsak", "gr\xF8nnsak", "gr\xF8ntsag", "gr\xE6nmeti", "\u852C\u83DC", "\u91CE\u83DC", "\uCC44\uC18C", "rau", "sayur", "\u0E1C\u0E31\u0E01", "\u0938\u092C\u094D\u091C\u0940"],
    ["fruit", "obst", "owoce", "\u0444\u0440\u0443\u043A\u0442\u044B", "meyve", "fruit", "fruta", "frutta", "fruit", "ovoce", "gy\xFCm\xF6lcs", "fructe", "\u043F\u043B\u043E\u0434\u043E\u0432\u0435", "\u03C6\u03C1\u03BF\u03CD\u03C4\u03B1", "vo\u0107e", "sadje", "vaisiai", "aug\u013Ci", "puuviljad", "hedelm\xE4", "frukt", "frukt", "frugt", "\xE1v\xF6xtur", "\u6C34\u679C", "\u679C\u7269", "\uACFC\uC77C", "tr\xE1i", "buah", "\u0E1C\u0E25\u0E44\u0E21\u0E49", "\u092B\u0932"],
    ["strawberry", "erdbeere", "truskawka", "\u043A\u043B\u0443\u0431\u043D\u0438\u043A\u0430", "\xE7ilek", "fraise", "fresa", "fragola", "aardbei", "jahoda", "jahoda", "eper", "c\u0103p\u0219un\u0103", "\u044F\u0433\u043E\u0434\u0430", "\u03C6\u03C1\u03AC\u03BF\u03C5\u03BB\u03B1", "jagoda", "jagoda", "jagoda", "bra\u0161k\u0117", "zeme\u0146u", "maasikas", "mansikka", "jordgubbe", "jordb\xE6r", "jordb\xE6r", "jar\xF0arber", "\u8349\u8393", "\u8349\u8393", "\u3044\u3061\u3054", "\uB538\uAE30", "d\xE2u", "stroberi", "stroberi", "\u0E2A\u0E15\u0E23\u0E2D\u0E27\u0E4C\u0E40\u0E1A\u0E2D\u0E23\u0E4C\u0E23\u0E35", "\u0938\u094D\u091F\u094D\u0930\u0949\u092C\u0947\u0930\u0940"]
  ]);
  var categoryLabelsCache = /* @__PURE__ */ new Map();
  function normalizeSearchText(text) {
    return String(text != null ? text : "").normalize("NFD").replace(new RegExp("\\p{M}", "gu"), "").toLowerCase().trim();
  }
  function getMultilingualCategoryLabels(producerCategory) {
    var _a7, _b, _c, _d;
    const cacheKey = String(producerCategory || "other");
    if (categoryLabelsCache.has(cacheKey)) {
      return categoryLabelsCache.get(cacheKey);
    }
    const typeKey = getProducerTypeKey(producerCategory);
    const catKey = PRODUCER_TO_CATEGORY_KEY[producerCategory] || "all";
    const labels = [];
    for (const code of SUPPORTED_LANGUAGE_CODES) {
      const tr = TRANSLATIONS[code];
      if (!tr) continue;
      const cat = (_a7 = tr.categories) == null ? void 0 : _a7[catKey];
      if (cat == null ? void 0 : cat.name) labels.push(cat.name);
      if (cat == null ? void 0 : cat.desc) labels.push(cat.desc);
      const typeLabel = (_c = (_b = tr.producer) == null ? void 0 : _b.types) == null ? void 0 : _c[typeKey];
      if (typeLabel) labels.push(typeLabel);
      const chips = (_d = tr.home) == null ? void 0 : _d.chip;
      if (chips) {
        Object.values(chips).forEach((v) => labels.push(v));
      }
    }
    const text = [...new Set(labels.filter(Boolean))].join(" ");
    categoryLabelsCache.set(cacheKey, text);
    return text;
  }
  function termMatchesHaystack(haystack, term) {
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
  function matchesSearchTerms(haystack, terms) {
    const userTerms = terms.map((t2) => normalizeSearchText(t2)).filter(Boolean);
    if (!userTerms.length) return true;
    return userTerms.every((term) => termMatchesHaystack(haystack, term));
  }

  // js/presentation/searchFilter.js?v=2
  function filterProducersByQuery(producers, query, t2 = (k) => k) {
    const trimmed = String(query || "").trim();
    if (!trimmed) return [...producers];
    const terms = String(query || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [...producers];
    return producers.filter((producer) => {
      const chain = detectChainBrand(producer.name);
      const typeKey = getProducerTypeKey(producer.category);
      const typeLabel = t2(`producer.types.${typeKey}`);
      const multilingualLabels = getMultilingualCategoryLabels(producer.category);
      const haystack = [
        producer.name,
        producer.description,
        producer.address,
        producer.category,
        typeLabel,
        multilingualLabels,
        chain == null ? void 0 : chain.label,
        ...(producer.products || []).flatMap((p) => [p.name, p.description])
      ].filter(Boolean).join(" ");
      return matchesSearchTerms(haystack, terms);
    });
  }
  function getSearchTerms(query) {
    return String(query || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
  }
  function matchesTerms(haystack, terms) {
    return matchesSearchTerms(haystack, terms);
  }
  function searchProducts(producers, query, t2 = (k) => k) {
    var _a7, _b, _c;
    const terms = getSearchTerms(query);
    if (!terms.length) return [];
    const hits = [];
    const seen = /* @__PURE__ */ new Set();
    for (const product of featuredProducts) {
      const name = getFeaturedProductName(product, t2);
      const desc = getFeaturedProductDesc(product, t2);
      const producerName = getFeaturedProducerName(product) || ((_a7 = getProducerById(product.producerId)) == null ? void 0 : _a7.name) || "";
      const producer = getProducerById(product.producerId);
      const multilingualLabels = producer ? getMultilingualCategoryLabels(producer.category) : "";
      const haystack = [name, desc, producerName, product.id, multilingualLabels].join(" ");
      if (!matchesTerms(haystack, terms)) continue;
      const key = `feat-${product.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      hits.push({
        id: key,
        type: "product",
        name,
        producerId: product.producerId,
        producerName,
        price: (_b = product.price) != null ? _b : null,
        unit: product.unit,
        category: product.category,
        icon: product.icon || getCategoryIcon(product.category)
      });
    }
    for (const producer of producers) {
      const multilingualLabels = getMultilingualCategoryLabels(producer.category);
      for (const product of producer.products || []) {
        const haystack = [
          product.name,
          product.description,
          producer.name,
          producer.description,
          multilingualLabels
        ].filter(Boolean).join(" ");
        if (!matchesTerms(haystack, terms)) continue;
        const key = `prod-${producer.id}-${product.name}`;
        if (seen.has(key)) continue;
        seen.add(key);
        hits.push({
          id: key,
          type: "product",
          name: product.name,
          producerId: producer.id,
          producerName: producer.name,
          price: (_c = product.price) != null ? _c : null,
          unit: product.unit,
          category: producer.category,
          icon: product.icon || getCategoryIcon(producer.category)
        });
      }
    }
    return hits;
  }
  function filterProducersBySearch(producers, query, t2 = (k) => k) {
    const trimmed = String(query || "").trim();
    if (!trimmed) return [...producers];
    const { producers: directMatches, products } = searchGlobalResults(producers, query, t2);
    const ids = /* @__PURE__ */ new Set([
      ...directMatches.map((p) => String(p.id)),
      ...products.map((p) => String(p.producerId))
    ]);
    return producers.filter((p) => ids.has(String(p.id)));
  }
  function searchGlobalResults(producers, query, t2 = (k) => k) {
    const terms = getSearchTerms(query);
    if (!terms.length) {
      return { items: [], producers: [], products: [] };
    }
    const products = searchProducts(producers, query, t2);
    const matchedProducers = filterProducersByQuery(producers, query, t2);
    const items = [];
    const seenItemIds = /* @__PURE__ */ new Set();
    const producerIdsFromProducts = new Set(products.map((p) => String(p.producerId)));
    for (const product of products) {
      if (seenItemIds.has(product.id)) continue;
      seenItemIds.add(product.id);
      items.push(product);
    }
    for (const producer of matchedProducers) {
      if (producerIdsFromProducts.has(String(producer.id))) continue;
      const id = `producer-${producer.id}`;
      if (seenItemIds.has(id)) continue;
      seenItemIds.add(id);
      items.push({
        id,
        type: "producer",
        name: producer.name,
        producerId: producer.id,
        producerName: producer.name,
        price: null,
        unit: null,
        category: producer.category,
        icon: getCategoryIcon(producer.category)
      });
    }
    return { items, producers: matchedProducers, products };
  }
  function escapeHtml5(text) {
    return String(text != null ? text : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function buildSearchResultCardHtml(item, t2, formatPrice4 = (v) => `${Number(v).toFixed(2)} \u20AC`) {
    const typeKey = getProducerTypeKey(item.category);
    const categoryLabel3 = t2(`producer.types.${typeKey}`);
    const priceHtml = item.price != null ? `<span class="search-result-price">${escapeHtml5(formatPrice4(item.price))}${item.unit ? ` / ${escapeHtml5(item.unit)}` : ""}</span>` : "";
    const subtitle = item.type === "product" ? escapeHtml5(item.producerName) : escapeHtml5(categoryLabel3);
    return `
        <button
            type="button"
            class="search-result-card"
            data-producer-id="${escapeHtml5(item.producerId)}"
            data-search-type="${escapeHtml5(item.type)}"
        >
            <span class="search-result-icon" aria-hidden="true">${item.icon || "\u{1F4CD}"}</span>
            <span class="search-result-body">
                <span class="search-result-name">${escapeHtml5(item.name)}</span>
                <span class="search-result-meta">${subtitle}${priceHtml ? ` \xB7 ${priceHtml}` : ""}</span>
            </span>
            <span class="search-result-category">${escapeHtml5(categoryLabel3)}</span>
        </button>
    `;
  }
  function formatSearchNoResults(query, t2, escapeFn = (text) => text) {
    const trimmed = String(query || "").trim();
    if (!trimmed) return t2("search.noResults");
    const label = escapeFn(trimmed);
    const text = t2("search.noResultsFor");
    return text.includes("{query}") ? text.replace("{query}", label) : `${text} '${label}'`;
  }

  // js/core/premiumService.js
  var STORE_KEY2 = "rg_premium_subscriptions";
  var LEGACY_FLAG_KEY = "premium_active";
  var TRIAL_DAYS = 7;
  var TEST_MODE_FREE = true;
  var PLANS = Object.freeze({
    monthly: { id: "monthly", price: 9.99, interval: "month" },
    annual: { id: "annual", price: 89.99, interval: "year", savingsPercent: 25 }
  });
  function readStore() {
    try {
      const raw = localStorage.getItem(STORE_KEY2);
      const data = raw ? JSON.parse(raw) : {};
      return data && typeof data === "object" ? data : {};
    } catch (_) {
      return {};
    }
  }
  function writeStore(data) {
    localStorage.setItem(STORE_KEY2, JSON.stringify(data));
  }
  function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }
  function addMonths(date, months) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  }
  function addYears(date, years) {
    const d = new Date(date);
    d.setFullYear(d.getFullYear() + years);
    return d;
  }
  function getPremiumStatus(userId = ((_a7) => (_a7 = getCurrentUser()) == null ? void 0 : _a7.id)()) {
    if (!userId) return null;
    const store = readStore();
    return store[userId] || null;
  }
  function isPremiumActive(userId = ((_a7) => (_a7 = getCurrentUser()) == null ? void 0 : _a7.id)()) {
    const status = getPremiumStatus(userId);
    if (!(status == null ? void 0 : status.active)) return false;
    if (TEST_MODE_FREE) return true;
    const now = Date.now();
    if (status.trialEndsAt && new Date(status.trialEndsAt).getTime() > now) return true;
    if (status.expiresAt && new Date(status.expiresAt).getTime() > now) return true;
    return false;
  }
  function getTrialDaysRemaining(userId = ((_a7) => (_a7 = getCurrentUser()) == null ? void 0 : _a7.id)()) {
    const status = getPremiumStatus(userId);
    if (!(status == null ? void 0 : status.trialEndsAt)) return 0;
    const diff = new Date(status.trialEndsAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1e3)));
  }
  function getSelectedPlan(userId = ((_a7) => (_a7 = getCurrentUser()) == null ? void 0 : _a7.id)()) {
    var _a8;
    return ((_a8 = getPremiumStatus(userId)) == null ? void 0 : _a8.plan) || null;
  }
  function activatePremium(planId = "monthly") {
    const user = getCurrentUser();
    if (!user) return { ok: false, error: "notLoggedIn" };
    const plan = PLANS[planId] ? planId : "monthly";
    const now = /* @__PURE__ */ new Date();
    const trialEndsAt = addDays(now, TRIAL_DAYS);
    const expiresAt = plan === "annual" ? addYears(trialEndsAt, 1) : addMonths(trialEndsAt, 1);
    const entry = {
      active: true,
      premium_active: true,
      plan,
      activatedAt: now.toISOString(),
      trialEndsAt: trialEndsAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      paymentSimulated: true,
      testMode: TEST_MODE_FREE
    };
    const store = readStore();
    store[user.id] = entry;
    writeStore(store);
    localStorage.setItem(LEGACY_FLAG_KEY, "true");
    eventBus2.emit(EVENTS2.PREMIUM_ACTIVATED, __spreadValues({ userId: user.id }, entry));
    eventBus2.emit(EVENTS2.PREMIUM_SUBSCRIBE_APPROVED, { userId: user.id, plan });
    return { ok: true, status: entry };
  }
  function formatPremiumExpiryDate(isoDate) {
    if (!isoDate) return "";
    try {
      return new Date(isoDate).toLocaleDateString();
    } catch (_) {
      return isoDate.slice(0, 10);
    }
  }

  // js/views/home.js
  var SEARCH_DEBOUNCE_MS = 280;
  var FAVORITES_STORAGE_KEY = "regionalny_smak_favorites";
  var CATEGORY_IDS = ["all", "restaurants", "farmers", "bakeries", "meat", "shops", "vending", "favorites"];
  function getFavoritesCount() {
    try {
      const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list.length : 0;
    } catch (_) {
      return 0;
    }
  }
  function escapeHtml6(text) {
    return String(text != null ? text : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function formatPrice2(value) {
    return `${Number(value || 0).toFixed(2)} \u20AC`;
  }
  function buildProducerLabel(product) {
    const producer = getProducerById(product.producerId);
    if (!producer) return escapeHtml6(getFeaturedProducerName(product));
    const chain = resolveProducerChain(producer);
    const name = escapeHtml6(producer.name);
    if (chain == null ? void 0 : chain.logo) {
      return `${buildChainLogoHtml(chain)}<span class="home-product-producer-name">${name}</span>`;
    }
    return `<span class="home-product-producer-name">${name}</span>`;
  }
  function buildRatingHtml(product) {
    const producer = getProducerById(product.producerId);
    if (!producer) {
      return `<p class="home-product-rating">${escapeHtml6(t("home.ratingNew"))}</p>`;
    }
    const reviews = getReviews(producer.id);
    if (reviews.length === 0) {
      return `<p class="home-product-rating">${escapeHtml6(t("home.ratingNew"))}</p>`;
    }
    const avg = getAverageRating(producer.id, producer.rating);
    const stars = formatRatingStars(avg);
    return `<p class="home-product-rating" aria-label="${avg}"><span aria-hidden="true">${stars}</span> <span class="home-product-rating-value">${avg}</span></p>`;
  }
  function buildFavoriteBtnHtml(producerId) {
    const fav = isFavorite(producerId);
    const label = fav ? t("btn.favoriteSaved") : t("btn.favorite");
    return `<button type="button" class="home-product-btn home-product-btn-favorite${fav ? " is-favorite" : ""}" data-favorite-id="${escapeHtml6(producerId)}" aria-pressed="${fav}">\u2764\uFE0F ${escapeHtml6(label)}</button>`;
  }
  function buildProductCardsHtml(limit) {
    const list = limit ? featuredProducts.slice(0, limit) : featuredProducts;
    return list.map((product) => {
      const name = escapeHtml6(getFeaturedProductName(product, t));
      const desc = escapeHtml6(getFeaturedProductDesc(product, t));
      const producerLabel = buildProducerLabel(product);
      const ratingHtml = buildRatingHtml(product);
      const priceLabel = `${formatPrice2(product.price)}${product.unit ? ` / ${escapeHtml6(product.unit)}` : ""}`;
      const imageHtml = buildProductImageHtml(product.imageUrl, t, { className: "home-product-card-photo" });
      const contactLabel = escapeHtml6(t("producer.contactTitle"));
      return `
        <article class="home-product-card home-product-card-open" data-product-id="${escapeHtml6(product.id)}" data-producer-id="${escapeHtml6(product.producerId)}" tabindex="0" role="button" aria-label="${name}">
            <div class="home-product-card-media">
                <div class="home-product-image">
                    ${imageHtml}
                </div>
            </div>
            <div class="home-product-card-body">
                <h3 class="home-product-name">${name}</h3>
                <p class="home-product-producer">${producerLabel}</p>
                ${ratingHtml}
                ${desc ? `<p class="home-product-desc">${desc}</p>` : ""}
                <p class="home-product-price"><span aria-hidden="true">\u{1F4B0}</span> ${priceLabel}</p>
                <div class="home-product-actions">
                    <button type="button" class="home-product-btn home-product-btn-contact" data-contact-id="${escapeHtml6(product.producerId)}">\u{1F4DE} ${contactLabel}</button>
                    ${buildFavoriteBtnHtml(product.producerId)}
                </div>
            </div>
        </article>
    `;
    }).join("");
  }
  var renderHome = (container) => {
    if (!container) {
      console.warn("Home: brak kontenera");
      return;
    }
    const counts = countProducersByHomeCategory(getProducers());
    const favoritesCount = getFavoritesCount();
    const categoriesHTML = CATEGORY_IDS.map((id) => {
      const name = t(`categories.${id}.name`);
      const desc = t(`categories.${id}.desc`);
      const icon = id === "favorites" ? "\u2B50" : CATEGORY_ICONS[id] || CATEGORY_ICONS.other;
      const count = id === "favorites" ? favoritesCount : counts[id];
      return `
        <button type="button" class="category-card" data-category="${id}">
            <span class="category-icon" aria-hidden="true">${icon}</span>
            <span class="category-name">${name} (${count})</span>
            <span class="category-desc">${desc}</span>
        </button>
    `;
    }).join("");
    container.innerHTML = `
        <div class="home-page">
            <section class="home-hero">
                <h2 class="home-hero-brand">Regionaler Geschmack</h2>
                <p class="home-hero-title">${t("home.heroTitle")}</p>
                <p class="home-hero-tagline">${t("home.heroTagline")}</p>
            </section>

            <section class="app-section home-premium-section">
                <button type="button" class="home-premium-cta" id="homePremiumBtn" aria-label="${t("premium.title")}">
                    <span class="home-premium-icon" aria-hidden="true">\u{1F451}</span>
                    <span class="home-premium-text">
                        <strong class="home-premium-title">${t("premium.title")}${isPremiumActive() ? ` \xB7 ${t("premium.statusActive")}` : ""}</strong>
                        <span class="home-premium-desc">${isPremiumActive() ? t("premium.benefitsUnlocked") : t("home.premiumTeaser")}</span>
                    </span>
                    <span class="home-premium-arrow" aria-hidden="true">\u203A</span>
                </button>
            </section>

            <section class="home-hub app-section" aria-label="${t("home.hubLabel")}">
                <form class="home-search" id="homeSearchForm" role="search">
                    <label class="home-search-field" for="homeSearchInput">
                        <span class="home-search-icon" aria-hidden="true">\u{1F50D}</span>
                        <input
                            type="search"
                            id="homeSearchInput"
                            class="home-search-input"
                            placeholder="${t("home.searchPlaceholder")}"
                            autocomplete="off"
                            enterkeyhint="search"
                        >
                    </label>
                </form>
                <div id="homeSearchResults" class="home-search-results" hidden aria-live="polite"></div>
            </section>

            <section class="home-actions app-section">
                <button type="button" class="btn-location" id="getLocationBtn">
                    <span aria-hidden="true">\u{1F4CD}</span> ${t("home.getLocation")}
                </button>
                <button type="button" class="btn-nearby" id="findNearbyBtn">
                    <span aria-hidden="true">\u{1F5FA}\uFE0F</span> ${t("home.findNearby")}
                </button>
            </section>

            <section class="home-categories app-section">
                <div class="section-header-row">
                    <h2 class="section-heading">${t("home.categoriesTitle")}</h2>
                </div>
                <div class="categories-grid">
                    ${categoriesHTML}
                </div>
            </section>

            <section class="home-recommended app-section" aria-label="${t("home.recommendedTitle")}">
                <h2 class="section-title">${t("home.recommendedTitle")}</h2>
                ${isPremiumActive() ? `<div class="home-products-grid">${buildProductCardsHtml(3) || `<p class="placeholder">${t("msg.noProducts")}</p>`}</div>` : `<p class="placeholder">${t("home.recommendedPlaceholder")}</p>`}
            </section>

            <section class="home-recommended home-featured app-section" aria-label="${t("home.featured")}">
                <h2 class="section-title">${t("home.featured")}</h2>
                <div class="home-products-grid">
                    ${featuredProducts.length ? buildProductCardsHtml() : `<p class="placeholder">${t("msg.noProducts")}</p>`}
                </div>
            </section>

            <footer class="home-footer">
                <p class="footer-brand"><span aria-hidden="true">\u{1F33E}</span> Regionaler Geschmack</p>
                <p class="footer-row">
                    <span aria-hidden="true">\u{1F4E7}</span>
                    <a href="mailto:krispolik6@gmail.com">krispolik6@gmail.com</a>
                </p>
                <p class="footer-row">
                    <span aria-hidden="true">\u{1F4CD}</span>
                    ${t("footer.address")}
                </p>
                <p class="copyright">${t("home.footerCopyright")}</p>
            </footer>
        </div>
    `;
    setupEvents(container);
  };
  function renderHomeSearchResults(container, query) {
    const resultsEl = container.querySelector("#homeSearchResults");
    if (!resultsEl) return;
    const trimmed = String(query || "").trim();
    if (!trimmed) {
      resultsEl.hidden = true;
      resultsEl.innerHTML = "";
      return;
    }
    const { items } = searchGlobalResults(getProducers(), trimmed, t);
    if (items.length === 0) {
      resultsEl.hidden = false;
      resultsEl.innerHTML = `<p class="home-search-empty">${formatSearchNoResults(trimmed, t, escapeHtml6)}</p>`;
      return;
    }
    resultsEl.hidden = false;
    resultsEl.innerHTML = `
        <p class="home-search-results-label">${t("search.resultsCount").replace("{count}", String(items.length))}</p>
        <div class="home-search-results-list" role="list">
            ${items.map((item) => buildSearchResultCardHtml(item, t, formatCurrency)).join("")}
        </div>
    `;
  }
  function bindHomeSearch(container) {
    var _a7;
    const searchForm = container.querySelector("#homeSearchForm");
    const searchInput = container.querySelector("#homeSearchInput");
    let debounceTimer = null;
    const runSearch = (query) => {
      renderHomeSearchResults(container, query);
    };
    searchInput == null ? void 0 : searchInput.addEventListener("input", () => {
      const query = searchInput.value;
      const resultsEl = container.querySelector("#homeSearchResults");
      if (debounceTimer) clearTimeout(debounceTimer);
      if (query.trim() && resultsEl) {
        resultsEl.hidden = false;
        resultsEl.innerHTML = `<p class="home-search-empty">${t("search.searching")}</p>`;
      } else if (resultsEl) {
        resultsEl.hidden = true;
        resultsEl.innerHTML = "";
      }
      debounceTimer = setTimeout(() => runSearch(query), SEARCH_DEBOUNCE_MS);
    });
    searchForm == null ? void 0 : searchForm.addEventListener("submit", (event) => {
      var _a8;
      event.preventDefault();
      const query = ((_a8 = searchInput == null ? void 0 : searchInput.value) == null ? void 0 : _a8.trim()) || "";
      runSearch(query);
      eventBus2.emit(EVENTS2.SEARCH_PRODUCTS, { query });
    });
    (_a7 = container.querySelector("#homeSearchResults")) == null ? void 0 : _a7.addEventListener("click", (event) => {
      const card = event.target.closest("[data-producer-id]");
      if (!card) return;
      const producerId = card.dataset.producerId;
      if (producerId) openProducerModal(producerId);
    });
  }
  function updateFavoriteButton(btn) {
    const id = btn.dataset.favoriteId;
    const fav = isFavorite(id);
    btn.classList.toggle("is-favorite", fav);
    btn.setAttribute("aria-pressed", String(fav));
    btn.textContent = fav ? `\u2764\uFE0F ${t("btn.favoriteSaved")}` : `\u2764\uFE0F ${t("btn.favorite")}`;
  }
  function refreshProductRatings(container) {
    container.querySelectorAll(".home-product-card[data-product-id]").forEach((card) => {
      const product = featuredProducts.find((p) => p.id === card.dataset.productId);
      const ratingEl = card.querySelector(".home-product-rating");
      if (!product || !ratingEl) return;
      const wrapper = document.createElement("div");
      wrapper.innerHTML = buildRatingHtml(product);
      ratingEl.replaceWith(wrapper.firstElementChild);
    });
  }
  var placesListenerBound = false;
  var reviewsListenerBound = false;
  function refreshCategoryCounts(container) {
    const counts = countProducersByHomeCategory(getProducers());
    const favoritesCount = getFavoritesCount();
    container.querySelectorAll(".category-card").forEach((item) => {
      const id = item.dataset.category;
      const count = id === "favorites" ? favoritesCount : counts[id];
      const nameEl = item.querySelector(".category-name");
      if (nameEl && id) {
        nameEl.textContent = `${t(`categories.${id}.name`)} (${count})`;
      }
    });
  }
  function bindPlacesRefresh(container) {
    if (placesListenerBound) return;
    placesListenerBound = true;
    eventBus2.on(EVENTS2.PLACES_LOADED, () => {
      const home = document.querySelector(".home-page");
      if (home) {
        refreshCategoryCounts(home);
        const input = home.querySelector("#homeSearchInput");
        if (input == null ? void 0 : input.value.trim()) {
          renderHomeSearchResults(home.parentElement || container, input.value);
        }
      }
    });
  }
  function bindReviewsRefresh(container) {
    if (reviewsListenerBound) return;
    reviewsListenerBound = true;
    eventBus2.on(EVENTS2.REVIEWS_CHANGED, () => {
      const home = document.querySelector(".home-page");
      if (!home) return;
      refreshProductRatings(home);
    });
  }
  function setupEvents(container) {
    var _a7, _b, _c;
    initProducerModal();
    bindPlacesRefresh(container);
    (_a7 = container.querySelector("#homePremiumBtn")) == null ? void 0 : _a7.addEventListener("click", () => {
      eventBus2.emit(EVENTS2.NAVIGATE, { view: "premium" });
    });
    (_b = container.querySelector("#getLocationBtn")) == null ? void 0 : _b.addEventListener("click", () => {
      eventBus2.emit(EVENTS2.LOCATION_REQUESTED);
    });
    (_c = container.querySelector("#findNearbyBtn")) == null ? void 0 : _c.addEventListener("click", () => {
      eventBus2.emit(EVENTS2.NEARBY_SEARCH);
    });
    container.querySelectorAll(".category-card").forEach((item) => {
      item.addEventListener("click", () => {
        const category = item.dataset.category;
        if (category === "favorites") {
          eventBus2.emit(EVENTS2.NAVIGATE, { view: "favorites" });
          return;
        }
        eventBus2.emit(EVENTS2.CATEGORY_SELECTED, { category });
      });
    });
    container.querySelectorAll("[data-contact-id]").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.stopPropagation();
        const producerId = btn.dataset.contactId;
        if (producerId) openProducerModal(producerId);
      });
    });
    container.querySelectorAll("[data-favorite-id]").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.stopPropagation();
        const id = btn.dataset.favoriteId;
        if (isFavorite(id)) {
          removeFavorite(id);
        } else {
          addFavorite(id);
        }
        updateFavoriteButton(btn);
        refreshFavoritesBadge();
      });
    });
    const productsGrid = container.querySelector(".home-products-grid");
    productsGrid == null ? void 0 : productsGrid.addEventListener("click", (event) => {
      if (event.target.closest(".home-product-actions")) return;
      const card = event.target.closest(".home-product-card-open");
      if (!card) return;
      const producerId = card.dataset.producerId;
      if (producerId) openProducerModal(producerId);
    });
    productsGrid == null ? void 0 : productsGrid.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const card = event.target.closest(".home-product-card-open");
      if (!card || event.target.closest(".home-product-actions")) return;
      event.preventDefault();
      const producerId = card.dataset.producerId;
      if (producerId) openProducerModal(producerId);
    });
    bindHomeSearch(container);
    bindReviewsRefresh(container);
  }

  // js/map/mapSettings.js
  var STORAGE_KEY3 = "regionaler_smak_map_settings";
  var LEGEND_CATEGORIES = Object.freeze([
    "restaurant",
    "farmer",
    "bakery",
    "meat",
    "shop",
    "vending"
  ]);
  var MAP_CATEGORIES = Object.freeze([
    "farmer",
    "bakery",
    "restaurant",
    "meat",
    "shop",
    "vending",
    "other"
  ]);
  var DEFAULT_MARKER_COLORS = Object.freeze({
    farmer: "#1b7f58",
    bakery: "#c47c3a",
    restaurant: "#456696",
    meat: "#b83b3b",
    shop: "#6b4c9a",
    vending: "#5a6470",
    other: "#888888"
  });
  var MAP_STYLE_OPTIONS = Object.freeze({
    light: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "\xA9 OpenStreetMap contributors"
    },
    dark: {
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution: "\xA9 CARTO \xA9 OpenStreetMap"
    },
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "\xA9 Esri"
    },
    terrain: {
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution: "\xA9 OpenTopoMap \xA9 OpenStreetMap"
    }
  });
  var runtimeSettings = null;
  function defaultCategoryVisibility() {
    return MAP_CATEGORIES.reduce((acc, cat) => {
      acc[cat] = true;
      return acc;
    }, {});
  }
  function getDefaultMapSettings() {
    return {
      markerColors: __spreadValues({}, DEFAULT_MARKER_COLORS),
      categoryVisibility: defaultCategoryVisibility(),
      mapStyle: "light"
    };
  }
  function normalizeSettings(raw) {
    const defaults = getDefaultMapSettings();
    const source = raw && typeof raw === "object" ? raw : {};
    const markerColors = __spreadValues({}, defaults.markerColors);
    if (source.markerColors && typeof source.markerColors === "object") {
      for (const cat of MAP_CATEGORIES) {
        if (typeof source.markerColors[cat] === "string") {
          markerColors[cat] = source.markerColors[cat];
        }
      }
    }
    const categoryVisibility = __spreadValues({}, defaults.categoryVisibility);
    if (source.categoryVisibility && typeof source.categoryVisibility === "object") {
      for (const cat of MAP_CATEGORIES) {
        if (typeof source.categoryVisibility[cat] === "boolean") {
          categoryVisibility[cat] = source.categoryVisibility[cat];
        }
      }
    }
    const mapStyle = MAP_STYLE_OPTIONS[source.mapStyle] ? source.mapStyle : defaults.mapStyle;
    return { markerColors, categoryVisibility, mapStyle };
  }
  function loadMapSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY3);
      if (!raw) return getDefaultMapSettings();
      return normalizeSettings(JSON.parse(raw));
    } catch (_) {
      return getDefaultMapSettings();
    }
  }
  function saveMapSettings(settings) {
    const normalized = normalizeSettings(settings);
    localStorage.setItem(STORAGE_KEY3, JSON.stringify(normalized));
    runtimeSettings = normalized;
    return normalized;
  }
  function resetMapSettings() {
    localStorage.removeItem(STORAGE_KEY3);
    runtimeSettings = getDefaultMapSettings();
    return runtimeSettings;
  }
  function initMapSettings() {
    runtimeSettings = loadMapSettings();
    return runtimeSettings;
  }
  function getMapSettings() {
    if (!runtimeSettings) initMapSettings();
    return runtimeSettings;
  }
  function setRuntimeMapSettings(settings) {
    runtimeSettings = normalizeSettings(settings);
    return runtimeSettings;
  }
  function getMarkerColor(category) {
    const colors = getMapSettings().markerColors;
    return colors[category] || colors.other || DEFAULT_MARKER_COLORS.other;
  }
  function isCategoryVisible(category) {
    const visibility = getMapSettings().categoryVisibility;
    if (visibility[category] === false) return false;
    return visibility[category] !== false;
  }
  function getActiveMapStyle() {
    return getMapSettings().mapStyle || "light";
  }
  function getLegendEntries(t2 = (k) => k) {
    const settings = getMapSettings();
    return LEGEND_CATEGORIES.map((category) => {
      const iconKey = category === "shop" ? "shops" : category;
      return {
        category,
        icon: getCategoryIcon(iconKey),
        color: settings.markerColors[category] || DEFAULT_MARKER_COLORS[category],
        label: t2(`producer.types.${getProducerTypeKey(category)}`)
      };
    });
  }

  // js/map/map.js?v=2
  var FAVORITES_STORAGE_KEY2 = "regionalny_smak_favorites";
  function isFavoriteInStorage(id) {
    try {
      const raw = localStorage.getItem(FAVORITES_STORAGE_KEY2);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) && list.map(String).includes(String(id));
    } catch (_) {
      return false;
    }
  }
  function createGpsPinIcon() {
    return window.L.divIcon({
      className: "gps-pin-marker",
      html: `
            <div class="gps-pin" aria-hidden="true">
                <span class="gps-pin-head"></span>
                <span class="gps-pin-point"></span>
            </div>
        `,
      iconSize: [30, 38],
      iconAnchor: [15, 38],
      popupAnchor: [0, -38]
    });
  }
  function resolveMarkerEmoji(producer) {
    const chain = resolveProducerChain(producer);
    const isShop = (producer == null ? void 0 : producer.category) === "shop" || !!chain;
    return getCategoryIcon(producer == null ? void 0 : producer.category, { productIcon: isShop ? "\u{1F3EA}" : void 0 });
  }
  function createCategoryIcon(producer) {
    const category = producer == null ? void 0 : producer.category;
    const emoji = resolveMarkerEmoji(producer);
    const color = getMarkerColor(category);
    return window.L.divIcon({
      className: "producer-marker-icon",
      html: `
            <div class="producer-marker-badge" style="--marker-color:${color}">
                <span class="producer-marker-emoji">${emoji}</span>
            </div>
        `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -20]
    });
  }
  function favoriteLabel(id) {
    return isFavoriteInStorage(id) ? `\u2B50 ${t("btn.favoriteSaved")}` : `\u2B50 ${t("btn.favorite")}`;
  }
  function buildPopupHtml(producer) {
    return buildMapPopupHtml(producer, {
      favoriteLabel: favoriteLabel(producer.id),
      navUrl: getGoogleMapsDirectionsUrl(producer.lat, producer.lng)
    });
  }
  var markerRegistry = /* @__PURE__ */ new Map();
  var markerClusterGroup = null;
  function addMarkers(map, producers = [], options = {}) {
    if (!map || typeof window.L === "undefined") return 0;
    const { fitBounds = false, batchSize = 75 } = options;
    const clusterAvailable = typeof window.L.markerClusterGroup === "function";
    if (clusterAvailable) {
      if (markerClusterGroup) {
        markerClusterGroup.clearLayers();
      } else {
        markerClusterGroup = window.L.markerClusterGroup({
          chunkedLoading: true,
          chunkDelay: 30,
          chunkInterval: 200,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false
        }).addTo(map);
      }
      if (!markersLayerGroup) {
        markersLayerGroup = window.L.featureGroup().addTo(map);
      } else {
        markersLayerGroup.clearLayers();
      }
    } else {
      markerClusterGroup = null;
      if (markersLayerGroup) {
        markersLayerGroup.clearLayers();
      } else {
        markersLayerGroup = window.L.featureGroup().addTo(map);
      }
    }
    markerRegistry.clear();
    const list = Array.isArray(producers) ? producers : [];
    const total = list.length;
    if (total === 0) return 0;
    let added = 0;
    const addBatch = (startIndex) => {
      var _a7;
      const endIndex = Math.min(startIndex + Math.max(1, Number(batchSize) || 75), total);
      for (let i = startIndex; i < endIndex; i++) {
        const producer = list[i];
        const lat = Number(producer == null ? void 0 : producer.lat);
        const lng = Number(producer == null ? void 0 : producer.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
        const marker = window.L.marker([lat, lng], {
          icon: createCategoryIcon(producer),
          title: producer.name || ""
        });
        marker.bindPopup(buildPopupHtml(producer), { maxWidth: 320, minWidth: 240 });
        if (markerClusterGroup) {
          markerClusterGroup.addLayer(marker);
        } else {
          marker.addTo(markersLayerGroup);
        }
        markerRegistry.set(String(producer.id), marker);
        added++;
      }
      if (endIndex < total) {
        requestAnimationFrame(() => addBatch(endIndex));
        return;
      }
      if (fitBounds && added > 0) {
        const boundsSource = markerClusterGroup || markersLayerGroup;
        const bounds = (_a7 = boundsSource == null ? void 0 : boundsSource.getBounds) == null ? void 0 : _a7.call(boundsSource);
        if (bounds.isValid()) {
          map.fitBounds(bounds.pad(0.12));
        }
      }
    };
    addBatch(0);
    return total;
  }
  var radiusCircleLayer = null;
  var gpsMarkerLayer = null;
  var markersLayerGroup = null;
  function replaceMarkers(map, producers = [], options = {}) {
    if (!map || typeof window.L === "undefined") return 0;
    return addMarkers(map, producers, options);
  }
  function resetMarkersLayer() {
    markersLayerGroup = null;
    markerClusterGroup = null;
    markerRegistry.clear();
  }
  function focusProducerMarker(map, producerId) {
    if (!map || typeof window.L === "undefined") return false;
    const marker = markerRegistry.get(String(producerId));
    if (!marker) return false;
    const latLng = marker.getLatLng();
    map.setView(latLng, Math.max(map.getZoom(), 15), { animate: true });
    if (markerClusterGroup == null ? void 0 : markerClusterGroup.zoomToShowLayer) {
      markerClusterGroup.zoomToShowLayer(marker, () => marker.openPopup());
    } else {
      marker.openPopup();
    }
    return true;
  }
  function resetRadiusCircle() {
    radiusCircleLayer = null;
  }
  function resetGpsPin() {
    gpsMarkerLayer = null;
  }
  function updateRadiusCircle(map, center, radiusKm) {
    if (!map || typeof window.L === "undefined") return null;
    const radiusM = Number(radiusKm) * 1e3;
    if (!Number.isFinite(radiusM) || radiusM <= 0) return null;
    const latLng = Array.isArray(center) ? center : [center.lat, center.lng];
    if (radiusCircleLayer) {
      radiusCircleLayer.setLatLng(latLng);
      radiusCircleLayer.setRadius(radiusM);
    } else {
      radiusCircleLayer = window.L.circle(latLng, {
        radius: radiusM,
        color: "#456696",
        fillColor: "#456696",
        fillOpacity: 0.15,
        weight: 2,
        opacity: 0.75
      }).addTo(map);
    }
    return radiusCircleLayer;
  }
  function updateGpsPin(map, center) {
    if (!map || typeof window.L === "undefined") return null;
    const latLng = Array.isArray(center) ? center : [center.lat, center.lng];
    if (gpsMarkerLayer) {
      gpsMarkerLayer.setLatLng(latLng);
    } else {
      gpsMarkerLayer = window.L.marker(latLng, {
        icon: createGpsPinIcon(),
        zIndexOffset: 1e3,
        interactive: false
      }).addTo(map);
    }
    return gpsMarkerLayer;
  }

  // js/map/mapSettingsPanel.js
  function escapeHtml7(text) {
    return String(text != null ? text : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function getCategoryLabel(category) {
    const key = `producer.types.${category}`;
    const label = t(key);
    return label !== key ? label : category;
  }
  function getStyleLabel(styleId) {
    const key = `map.style.${styleId}`;
    const label = t(key);
    return label !== key ? label : styleId;
  }
  function readPanelSettings(root) {
    const settings = getMapSettings();
    const markerColors = __spreadValues({}, settings.markerColors);
    const categoryVisibility = __spreadValues({}, settings.categoryVisibility);
    root.querySelectorAll("[data-map-color]").forEach((input) => {
      const cat = input.dataset.mapColor;
      if (cat) markerColors[cat] = input.value;
    });
    root.querySelectorAll("[data-map-category-toggle]").forEach((input) => {
      const cat = input.dataset.mapCategoryToggle;
      if (cat) categoryVisibility[cat] = input.checked;
    });
    const styleInput = root.querySelector('input[name="mapStyle"]:checked');
    const mapStyle = (styleInput == null ? void 0 : styleInput.value) || settings.mapStyle;
    return { markerColors, categoryVisibility, mapStyle };
  }
  function buildCategoryRows(settings) {
    return MAP_CATEGORIES.map((category) => {
      const color = settings.markerColors[category];
      const visible = settings.categoryVisibility[category] !== false;
      const icon = getCategoryIcon(category);
      const label = escapeHtml7(getCategoryLabel(category));
      return `
            <div class="map-settings-category-row">
                <label class="map-settings-category-toggle">
                    <input type="checkbox" data-map-category-toggle="${category}" ${visible ? "checked" : ""}>
                    <span class="map-settings-category-icon" aria-hidden="true">${icon}</span>
                    <span>${label}</span>
                </label>
                <input type="color" class="map-settings-color-input" data-map-color="${category}" value="${escapeHtml7(color)}" aria-label="${label}">
            </div>
        `;
    }).join("");
  }
  function buildStyleOptions(settings) {
    return Object.keys(MAP_STYLE_OPTIONS).map((styleId) => `
        <label class="map-settings-style-option">
            <input type="radio" name="mapStyle" value="${styleId}" ${settings.mapStyle === styleId ? "checked" : ""}>
            <span>${escapeHtml7(getStyleLabel(styleId))}</span>
        </label>
    `).join("");
  }
  function ensureMapSettingsPanel(container) {
    if (!container || container.querySelector("#mapSettingsPanel")) return;
    const settings = getMapSettings();
    container.insertAdjacentHTML("beforeend", `
        <div id="mapSettingsPanel" class="map-settings-panel" hidden aria-hidden="true">
            <div class="map-settings-backdrop" data-map-settings-close></div>
            <div class="map-settings-sheet" role="dialog" aria-modal="true" aria-labelledby="mapSettingsTitle">
                <header class="map-settings-header">
                    <h3 id="mapSettingsTitle">\u2699\uFE0F ${escapeHtml7(t("map.edit"))}</h3>
                    <button type="button" class="map-settings-close" data-map-settings-close aria-label="${escapeHtml7(t("btn.close"))}">\xD7</button>
                </header>
                <div class="map-settings-body">
                    <section class="map-settings-section">
                        <h4 class="map-settings-section-title">${escapeHtml7(t("map.styleTitle"))}</h4>
                        <div class="map-settings-style-grid">${buildStyleOptions(settings)}</div>
                    </section>
                    <section class="map-settings-section">
                        <h4 class="map-settings-section-title">${escapeHtml7(t("map.categoriesTitle"))}</h4>
                        <div class="map-settings-categories">${buildCategoryRows(settings)}</div>
                    </section>
                </div>
                <footer class="map-settings-footer">
                    <button type="button" class="map-settings-btn map-settings-btn-reset" data-map-settings-reset>${escapeHtml7(t("map.reset"))}</button>
                    <button type="button" class="map-settings-btn map-settings-btn-save" data-map-settings-save>${escapeHtml7(t("map.save"))}</button>
                </footer>
            </div>
        </div>
    `);
  }
  function bindMapSettingsPanel(container, { onApply }) {
    const panel = container == null ? void 0 : container.querySelector("#mapSettingsPanel");
    if (!panel || panel.dataset.bound === "true") return;
    panel.dataset.bound = "true";
    const applyFromPanel = () => {
      const next = readPanelSettings(panel);
      setRuntimeMapSettings(next);
      onApply == null ? void 0 : onApply(next);
    };
    panel.addEventListener("change", (event) => {
      if (event.target.closest("#mapSettingsPanel")) {
        applyFromPanel();
      }
    });
    panel.addEventListener("input", (event) => {
      if (event.target.matches("[data-map-color]")) {
        applyFromPanel();
      }
    });
    panel.addEventListener("click", (event) => {
      if (event.target.closest("[data-map-settings-close]")) {
        closeMapSettingsPanel(container);
        return;
      }
      if (event.target.closest("[data-map-settings-save]")) {
        const next = readPanelSettings(panel);
        saveMapSettings(next);
        onApply == null ? void 0 : onApply(next);
        closeMapSettingsPanel(container);
        return;
      }
      if (event.target.closest("[data-map-settings-reset]")) {
        const defaults = resetMapSettings();
        refreshMapSettingsPanel(container);
        onApply == null ? void 0 : onApply(defaults);
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      const panelEl = container == null ? void 0 : container.querySelector("#mapSettingsPanel");
      if (panelEl && !panelEl.hidden) {
        closeMapSettingsPanel(container);
      }
    });
  }
  function refreshMapSettingsPanel(container) {
    const panel = container == null ? void 0 : container.querySelector("#mapSettingsPanel");
    if (!panel) return;
    const settings = getMapSettings();
    const categoriesEl = panel.querySelector(".map-settings-categories");
    const stylesEl = panel.querySelector(".map-settings-style-grid");
    if (categoriesEl) categoriesEl.innerHTML = buildCategoryRows(settings);
    if (stylesEl) stylesEl.innerHTML = buildStyleOptions(settings);
  }
  function closeMapSettingsPanel(container) {
    var _a7;
    const panel = container == null ? void 0 : container.querySelector("#mapSettingsPanel");
    if (!panel || panel.hidden) return;
    panel.hidden = true;
    panel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("map-settings-open");
    (_a7 = container.querySelector("#mapGpsBtn")) == null ? void 0 : _a7.focus();
  }

  // js/map/mapControlsDrag.js
  var STORAGE_POSITIONS = "map_icons_positions";
  var STORAGE_SCALE = "map_icons_scale";
  var DRAG_THRESHOLD_PX = 8;
  var SCALE_MIN = 0.75;
  var SCALE_MAX = 1.45;
  var DEFAULT_POSITIONS = Object.freeze({
    gps: { x: 2, y: 82 },
    osm: { x: 16, y: 82 },
    lista: { x: 32, y: 82 },
    legenda: { x: 68, y: 82 },
    suwak: { x: 2, y: 70 }
  });
  var DEFAULT_SCALES = Object.freeze({
    gps: 1,
    osm: 1,
    lista: 1,
    legenda: 1,
    suwak: 1
  });
  var CONTROL_SELECTORS = {
    gps: "#mapGpsBtn",
    osm: "#mapOsmBtn",
    lista: "#mapProducerList",
    legenda: "#mapLegendWrap",
    suwak: "#radiusControl"
  };
  var activeSession = null;
  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return __spreadValues({}, fallback);
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : __spreadValues({}, fallback);
    } catch (_) {
      return __spreadValues({}, fallback);
    }
  }
  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {
    }
  }
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }
  function touchDistance(touches) {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  }
  function isInteractiveDragBlocker(target) {
    if (!target || !(target instanceof Element)) return false;
    if (target.closest('input[type="range"]')) return true;
    if (target.closest(".map-producer-list-items")) return true;
    if (target.closest(".map-legend-panel")) return true;
    return false;
  }
  function getPanelMetrics(panel) {
    const rect = panel.getBoundingClientRect();
    return { rect, width: rect.width || 1, height: rect.height || 1 };
  }
  function applyControlLayout(control, panel, positions, scales) {
    var _a7, _b;
    const id = control.dataset.mapControlId;
    if (!id) return;
    const pos = positions[id] || DEFAULT_POSITIONS[id];
    const scale = (_b = (_a7 = scales[id]) != null ? _a7 : DEFAULT_SCALES[id]) != null ? _b : 1;
    const { width, height } = getPanelMetrics(panel);
    const leftPx = Number(pos.x) / 100 * width;
    const topPx = Number(pos.y) / 100 * height;
    control.style.position = "absolute";
    control.style.left = `${leftPx}px`;
    control.style.top = `${topPx}px`;
    control.style.right = "auto";
    control.style.bottom = "auto";
    control.style.margin = "0";
    control.style.transform = `scale(${scale})`;
    control.style.transformOrigin = "top left";
    if (id === "suwak") {
      const maxW = Math.max(160, width - leftPx - 8);
      control.style.width = `${Math.min(maxW, width * 0.96)}px`;
    } else if (id === "lista") {
      const maxW = Math.max(120, width * 0.42);
      control.style.maxWidth = `${maxW}px`;
    }
  }
  function clampControlInPanel(control, panel) {
    const { rect, width, height } = getPanelMetrics(panel);
    const box = control.getBoundingClientRect();
    const currentLeft = box.left - rect.left;
    const currentTop = box.top - rect.top;
    const maxLeft = Math.max(0, width - box.width);
    const maxTop = Math.max(0, height - box.height);
    const left = clamp(currentLeft, 0, maxLeft);
    const top = clamp(currentTop, 0, maxTop);
    return {
      x: left / width * 100,
      y: top / height * 100
    };
  }
  function saveControlPosition(id, control, panel, positions) {
    const next = clampControlInPanel(control, panel);
    positions[id] = next;
    writeJson(STORAGE_POSITIONS, positions);
  }
  function saveControlScale(id, scale, scales) {
    scales[id] = clamp(scale, SCALE_MIN, SCALE_MAX);
    writeJson(STORAGE_SCALE, scales);
  }
  function getPointer(event) {
    var _a7;
    if ((_a7 = event.touches) == null ? void 0 : _a7.length) {
      return { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }
    return { x: event.clientX, y: event.clientY };
  }
  function initMapControlsDrag(panel, options = {}) {
    if (!panel) return () => {
    };
    const leafletMap2 = options.map || null;
    const positions = __spreadValues(__spreadValues({}, DEFAULT_POSITIONS), readJson(STORAGE_POSITIONS, {}));
    const scales = __spreadValues(__spreadValues({}, DEFAULT_SCALES), readJson(STORAGE_SCALE, {}));
    const controls = Object.entries(CONTROL_SELECTORS).map(([id, selector]) => {
      const el = panel.querySelector(selector);
      if (!el) return null;
      el.dataset.mapControlId = id;
      el.classList.add("map-draggable-control");
      applyControlLayout(el, panel, positions, scales);
      return { id, el };
    }).filter(Boolean);
    const endSession = () => {
      if (!activeSession) return;
      const { control, panel: p, positions: pos, scales: sc, map, moved, id } = activeSession;
      control.classList.remove("is-dragging");
      document.body.classList.remove("map-control-drag-active");
      if (activeSession.mode === "drag" && moved) {
        saveControlPosition(id, control, p, pos);
        control.dataset.dragSuppressed = "true";
        setTimeout(() => {
          delete control.dataset.dragSuppressed;
        }, 0);
      }
      if (activeSession.mode === "pinch") {
        saveControlScale(id, activeSession.currentScale, sc);
      }
      if (map == null ? void 0 : map.dragging) {
        map.dragging.enable();
      }
      activeSession = null;
    };
    const onPointerMove = (event) => {
      var _a7;
      if (!activeSession) return;
      const { control, panel: p, startPointer, originLeft, originTop, rect } = activeSession;
      if (((_a7 = event.touches) == null ? void 0 : _a7.length) === 2 && activeSession.mode === "pinch") {
        event.preventDefault();
        const dist = touchDistance(event.touches);
        if (!dist || !activeSession.pinchStartDist) return;
        const nextScale = clamp(
          activeSession.pinchStartScale * (dist / activeSession.pinchStartDist),
          SCALE_MIN,
          SCALE_MAX
        );
        activeSession.currentScale = nextScale;
        control.style.transform = `scale(${nextScale})`;
        return;
      }
      if (activeSession.mode !== "drag") return;
      const pointer = getPointer(event);
      const dx = pointer.x - startPointer.x;
      const dy = pointer.y - startPointer.y;
      if (!activeSession.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) {
        return;
      }
      if (!activeSession.moved) {
        activeSession.moved = true;
        control.classList.add("is-dragging");
        document.body.classList.add("map-control-drag-active");
        if (leafletMap2 == null ? void 0 : leafletMap2.dragging) {
          leafletMap2.dragging.disable();
        }
      }
      event.preventDefault();
      const left = originLeft + dx;
      const top = originTop + dy;
      const { width, height } = getPanelMetrics(p);
      const box = control.getBoundingClientRect();
      const maxLeft = Math.max(0, width - box.width);
      const maxTop = Math.max(0, height - box.height);
      control.style.left = `${clamp(left - rect.left, 0, maxLeft)}px`;
      control.style.top = `${clamp(top - rect.top, 0, maxTop)}px`;
    };
    const onPointerEnd = () => {
      endSession();
    };
    const onWheel = (event) => {
      var _a7;
      if (!event.shiftKey) return;
      const control = event.target.closest(".map-draggable-control");
      if (!control || !panel.contains(control)) return;
      const id = control.dataset.mapControlId;
      if (!id) return;
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.05 : 0.05;
      const current = (_a7 = scales[id]) != null ? _a7 : 1;
      const next = clamp(current + delta, SCALE_MIN, SCALE_MAX);
      scales[id] = next;
      control.style.transform = `scale(${next})`;
      saveControlScale(id, next, scales);
    };
    const onControlPointerDown = (event) => {
      var _a7, _b, _c;
      const control = event.currentTarget;
      const id = control.dataset.mapControlId;
      if (!id) return;
      if (isInteractiveDragBlocker(event.target)) return;
      if (((_a7 = event.touches) == null ? void 0 : _a7.length) === 2) {
        activeSession = {
          mode: "pinch",
          id,
          control,
          panel,
          positions,
          scales,
          map: leafletMap2,
          pinchStartDist: touchDistance(event.touches),
          pinchStartScale: (_b = scales[id]) != null ? _b : 1,
          currentScale: (_c = scales[id]) != null ? _c : 1,
          moved: false
        };
        return;
      }
      const { rect } = getPanelMetrics(panel);
      const box = control.getBoundingClientRect();
      const pointer = getPointer(event);
      activeSession = {
        mode: "drag",
        id,
        control,
        panel,
        positions,
        scales,
        map: leafletMap2,
        startPointer: pointer,
        originLeft: box.left,
        originTop: box.top,
        rect,
        moved: false
      };
    };
    const onControlClick = (event) => {
      const control = event.currentTarget;
      if (control.dataset.dragSuppressed === "true") {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    controls.forEach(({ el }) => {
      el.addEventListener("mousedown", onControlPointerDown);
      el.addEventListener("touchstart", onControlPointerDown, { passive: false });
      el.addEventListener("click", onControlClick, true);
    });
    document.addEventListener("mousemove", onPointerMove);
    document.addEventListener("mouseup", onPointerEnd);
    document.addEventListener("touchmove", onPointerMove, { passive: false });
    document.addEventListener("touchend", onPointerEnd);
    document.addEventListener("touchcancel", onPointerEnd);
    panel.addEventListener("wheel", onWheel, { passive: false });
    const onResize = () => {
      controls.forEach(({ el }) => applyControlLayout(el, panel, positions, scales));
    };
    window.addEventListener("resize", onResize);
    return () => {
      controls.forEach(({ el }) => {
        el.removeEventListener("mousedown", onControlPointerDown);
        el.removeEventListener("touchstart", onControlPointerDown);
        el.removeEventListener("click", onControlClick, true);
      });
      document.removeEventListener("mousemove", onPointerMove);
      document.removeEventListener("mouseup", onPointerEnd);
      document.removeEventListener("touchmove", onPointerMove);
      document.removeEventListener("touchend", onPointerEnd);
      document.removeEventListener("touchcancel", onPointerEnd);
      panel.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      endSession();
    };
  }

  // js/views/map.js
  var MAP_ZOOM = 13;
  var MAP_ZOOM_OVERVIEW = 6;
  var MAP_OVERVIEW_CENTER = [51.1657, 10.4515];
  var _a3;
  var RADIUS_MIN = (_a3 = CONFIG.minRadius) != null ? _a3 : 1;
  var _a4;
  var RADIUS_MAX = (_a4 = CONFIG.maxRadius) != null ? _a4 : 50;
  var _a5;
  var RADIUS_DEFAULT = (_a5 = CONFIG.defaultRadius) != null ? _a5 : 10;
  function getInitialMapCenter() {
    const stored = getLastPosition();
    if (stored) return [stored.lat, stored.lng];
    return null;
  }
  var currentMapCenter = getInitialMapCenter();
  var GEO_WATCH_OPTIONS = {
    enableHighAccuracy: true,
    maximumAge: 5e3,
    timeout: 3e4
  };
  var OSM_REFRESH_DEBOUNCE_MS = 800;
  var LOCATION_MOVE_THRESHOLD_M = 100;
  var _a6;
  var MARKER_LIMIT = typeof window !== "undefined" && ((_a6 = window == null ? void 0 : window.L) == null ? void 0 : _a6.markerClusterGroup) ? 1e3 : 100;
  var mapControlsDragCleanup = null;
  var leafletMap = null;
  var activeTileLayer = null;
  var mapViewContainer = null;
  var activeCategoryFilter = "all";
  var activeSearchQuery = "";
  var currentRadiusKm = RADIUS_DEFAULT;
  var _resizeBound = false;
  var _mapStatusTimer = null;
  var homeLocationPending = false;
  var nearbySearchPending = false;
  var producersLoadStarted = false;
  var geoWatchId = null;
  var locationWatchActive = false;
  var shouldCenterMapOnNextFix = false;
  var lastTrackedLocation = null;
  var lastDataFetchLocation = null;
  var locationDataFetchInFlight = false;
  var osmRefreshDebounceTimer = null;
  var lastDataEmptyArea = false;
  var isPopupOpen = false;
  function applyDataLoadResult(result, cacheDurationMs = 4e3) {
    lastDataEmptyArea = !!(result == null ? void 0 : result.emptyArea) || (result == null ? void 0 : result.source) === "empty-area";
    if (result.fromCache && result.producers.length > 0) {
      showMapStatus(t("map.dataCached"), cacheDurationMs);
    } else if (lastDataEmptyArea) {
      showMapStatus(t("map.noDataInArea"), cacheDurationMs);
    } else if (result.apiFailed && !result.producers.length) {
      showMapStatus(t("map.dataError"), cacheDurationMs);
    }
  }
  eventBus2.on(EVENTS2.LOCATION_REQUESTED, () => {
    nearbySearchPending = false;
    homeLocationPending = true;
  });
  eventBus2.on(EVENTS2.NEARBY_SEARCH, () => {
    homeLocationPending = false;
    nearbySearchPending = true;
  });
  function distanceMeters(a, b) {
    if (!a || !b) return Infinity;
    return getDistanceKm(a.lat, a.lng, b.lat, b.lng) * 1e3;
  }
  function stopLocationWatch() {
    if (geoWatchId != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(geoWatchId);
      geoWatchId = null;
    }
    if (osmRefreshDebounceTimer) {
      clearTimeout(osmRefreshDebounceTimer);
      osmRefreshDebounceTimer = null;
    }
  }
  function hasMovedEnoughForDataRefresh(location) {
    if (!lastDataFetchLocation) return true;
    return distanceMeters(lastDataFetchLocation, location) >= LOCATION_MOVE_THRESHOLD_M;
  }
  function handlePositionUpdate(location) {
    if (!location || !leafletMap) return;
    saveLastPosition(location.lat, location.lng, "gps");
    lastTrackedLocation = location;
    const isFirstFix = !currentMapCenter;
    currentMapCenter = [location.lat, location.lng];
    applyMapCenter(currentMapCenter);
    if (isFirstFix && leafletMap) {
      leafletMap.setView(currentMapCenter, MAP_ZOOM);
    }
    if (shouldCenterMapOnNextFix) {
      shouldCenterMapOnNextFix = false;
      leafletMap.setView(currentMapCenter, leafletMap.getZoom());
    }
    const movedEnough = hasMovedEnoughForDataRefresh(location);
    eventBus2.emit(EVENTS2.LOCATION_UPDATED, {
      lat: location.lat,
      lng: location.lng,
      movedEnough
    });
    if (movedEnough) {
      lastDataFetchLocation = { lat: location.lat, lng: location.lng };
      eventBus2.emit(EVENTS2.LOCATION_CHANGED, { lat: location.lat, lng: location.lng });
    } else {
      refreshMapMarkers();
    }
  }
  function handleLocationWatchError(error) {
    const code = error == null ? void 0 : error.code;
    if (code === 1) {
      showMapStatus(t("msg.locationDenied"));
      locationWatchActive = false;
      stopLocationWatch();
    } else if (code !== 3) {
      showMapStatus(t("msg.locationUnavailable"));
    }
    eventBus2.emit(EVENTS2.LOCATION_ERROR, { code });
  }
  function startLocationWatch() {
    if (!navigator.geolocation) {
      showMapStatus(t("msg.locationUnavailable"));
      return false;
    }
    if (geoWatchId != null) return true;
    locationWatchActive = true;
    geoWatchId = navigator.geolocation.watchPosition(
      (position) => {
        handlePositionUpdate({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      handleLocationWatchError,
      GEO_WATCH_OPTIONS
    );
    return true;
  }
  function refreshOsmDataAtLocation(lat, lng) {
    return __async(this, null, function* () {
      if (!leafletMap || locationDataFetchInFlight) return;
      locationDataFetchInFlight = true;
      showMapSkeleton();
      try {
        const result = yield loadAllData(lat, lng, {
          radiusKm: currentRadiusKm,
          forceRefresh: true
        });
        refreshMapMarkers();
        applyDataLoadResult(result);
        console.info(
          `[Karte] OSM od\u015Bwie\u017Cono: ${result.producers.length} producent\xF3w (\u017Ar\xF3d\u0142o: ${result.source})`
        );
      } catch (error) {
        console.warn("[Karte] B\u0142\u0105d od\u015Bwie\u017Cania OSM:", error);
      } finally {
        hideMapSkeleton();
        locationDataFetchInFlight = false;
      }
    });
  }
  eventBus2.on(EVENTS2.LOCATION_UPDATED, ({ lat, lng, movedEnough }) => {
    if (!movedEnough || !leafletMap) return;
    if (osmRefreshDebounceTimer) clearTimeout(osmRefreshDebounceTimer);
    osmRefreshDebounceTimer = setTimeout(() => {
      osmRefreshDebounceTimer = null;
      refreshOsmDataAtLocation(lat, lng);
    }, OSM_REFRESH_DEBOUNCE_MS);
  });
  function formatRadiusHint(km, count) {
    return t("map.radiusFilter").replace("{km}", String(km)).replace("{count}", String(count));
  }
  function updateRadiusHint(count = getVisibleProducers().length) {
    const hint = document.querySelector("#radiusHint");
    if (hint) {
      hint.textContent = formatRadiusHint(currentRadiusKm, count);
    }
  }
  function refreshProducerList(producers = getVisibleProducers()) {
    const list = document.querySelector("#mapProducerListItems");
    const toggle = document.querySelector("#mapListToggle");
    if (!list) return;
    const visibleIds = new Set(producers.map((p) => String(p.id)));
    if (activeSearchQuery.trim()) {
      const categoryFiltered = filterProducersByCategory(getProducers(), activeCategoryFilter);
      const { items } = searchGlobalResults(categoryFiltered, activeSearchQuery, t);
      const visibleItems = items.filter((item) => visibleIds.has(String(item.producerId)));
      if (visibleItems.length === 0) {
        list.innerHTML = `<li class="map-producer-list-empty">${formatSearchNoResults(activeSearchQuery, t, escapeListLabel)}</li>`;
      } else {
        list.innerHTML = visibleItems.map((item) => `
                <li>
                    <button
                        type="button"
                        class="map-producer-list-btn"
                        data-producer-id="${String(item.producerId).replace(/"/g, "&quot;")}"
                    >
                        <span class="map-list-item-name">${escapeListLabel(item.name)}</span>
                        ${item.type === "product" ? `<span class="map-list-item-sub">${escapeListLabel(item.producerName)}</span>` : ""}
                    </button>
                </li>
            `).join("");
      }
      if (toggle) {
        toggle.textContent = t("map.listToggle").replace("{count}", String(visibleItems.length));
      }
      updateRadiusHint(producers.length);
      return;
    }
    if (producers.length === 0) {
      const emptyMsg = lastDataEmptyArea ? t("map.noDataInArea") : t("search.noResults");
      list.innerHTML = `<li class="map-producer-list-empty">${emptyMsg}</li>`;
    } else {
      list.innerHTML = producers.map((producer) => `
            <li>
                <button
                    type="button"
                    class="map-producer-list-btn"
                    data-producer-id="${String(producer.id).replace(/"/g, "&quot;")}"
                >${escapeListLabel(producer.name)}</button>
            </li>
        `).join("");
    }
    if (toggle) {
      toggle.textContent = t("map.listToggle").replace("{count}", String(producers.length));
    }
    updateRadiusHint(producers.length);
  }
  function escapeListLabel(text) {
    return String(text != null ? text : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function bindProducerList(container) {
    const list = container.querySelector("#mapProducerListItems");
    const toggle = container.querySelector("#mapListToggle");
    if (!list || !toggle || toggle.dataset.bound === "true") return;
    toggle.dataset.bound = "true";
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      list.hidden = expanded;
    });
    list.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-producer-id]");
      if (!btn || !leafletMap) return;
      const producerId = btn.dataset.producerId;
      focusProducerMarker(leafletMap, producerId);
      btn.classList.add("is-active");
      setTimeout(() => btn.classList.remove("is-active"), 1200);
    });
  }
  function applyNearbySearchDefaults() {
    if (!nearbySearchPending || !leafletMap) return;
    nearbySearchPending = false;
    const stored = getLastPosition() || lastTrackedLocation;
    if (stored) {
      currentMapCenter = [stored.lat, stored.lng];
      leafletMap.setView(currentMapCenter, MAP_ZOOM);
      applyMapCenter(currentMapCenter);
    } else {
      enableUserLocationTracking({ centerMap: true });
    }
    refreshMapMarkers({ fitBounds: true });
  }
  function fulfillHomeLocationIfReady() {
    if (!homeLocationPending || !leafletMap) return;
    homeLocationPending = false;
    const gpsBtn = document.querySelector("#mapGpsBtn");
    applyUserLocation(gpsBtn);
  }
  function buildMapSkeletonHtml() {
    const cards = Array.from({ length: 4 }, () => `
        <div class="map-skeleton-card">
            <div class="map-skeleton-line map-skeleton-line--title"></div>
            <div class="map-skeleton-line map-skeleton-line--short"></div>
            <div class="map-skeleton-line map-skeleton-line--medium"></div>
        </div>
    `).join("");
    return `
        <div id="mapSkeleton" class="map-skeleton" role="status" aria-live="polite" aria-busy="true" aria-label="${escapeListLabel(t("map.dataLoading"))}">
            ${cards}
        </div>
    `;
  }
  function showMapSkeleton() {
    const mapView = document.querySelector(".map-view");
    if (!mapView) return;
    let skeleton = mapView.querySelector("#mapSkeleton");
    if (!skeleton) {
      mapView.insertAdjacentHTML("beforeend", buildMapSkeletonHtml());
      skeleton = mapView.querySelector("#mapSkeleton");
    }
    if (skeleton) skeleton.hidden = false;
  }
  function hideMapSkeleton() {
    const skeleton = document.querySelector("#mapSkeleton");
    if (!skeleton) return;
    skeleton.hidden = true;
  }
  function showMapStatus(message, durationMs = 4e3) {
    const mapView = document.querySelector(".map-view");
    if (!mapView) return;
    let status = mapView.querySelector(".map-status");
    if (!status) {
      status = document.createElement("div");
      status.className = "map-status";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      mapView.appendChild(status);
    }
    status.textContent = message;
    status.hidden = false;
    if (_mapStatusTimer) clearTimeout(_mapStatusTimer);
    _mapStatusTimer = setTimeout(() => {
      status.hidden = true;
    }, durationMs);
  }
  function setSearchQuery(query) {
    activeSearchQuery = String(query || "").trim();
  }
  function setCategoryFilter(categoryId) {
    activeCategoryFilter = categoryId || "all";
  }
  function resetCategoryFilter() {
    activeCategoryFilter = "all";
    activeSearchQuery = "";
  }
  function getVisibleProducers() {
    if (!currentMapCenter) return [];
    const byCategory = filterProducersByCategory(getProducers(), activeCategoryFilter);
    const bySearch = filterProducersBySearch(byCategory, activeSearchQuery, t);
    const inRadius = getProducersInRadius(bySearch, currentRadiusKm, {
      lat: currentMapCenter[0],
      lng: currentMapCenter[1]
    });
    return inRadius.filter((producer) => isCategoryVisible(producer.category));
  }
  function limitVisibleProducers(producers) {
    if (!Array.isArray(producers) || producers.length <= MARKER_LIMIT) return producers || [];
    if (!currentMapCenter) return producers.slice(0, MARKER_LIMIT);
    const [lat, lng] = currentMapCenter;
    return producers.map((p) => ({
      p,
      d: getDistanceKm(lat, lng, Number(p == null ? void 0 : p.lat), Number(p == null ? void 0 : p.lng))
    })).filter((x) => Number.isFinite(x.d)).sort((a, b) => a.d - b.d).slice(0, MARKER_LIMIT).map((x) => x.p);
  }
  function applyTileLayer(styleId = getActiveMapStyle()) {
    if (!leafletMap || typeof window.L === "undefined") return;
    const style = MAP_STYLE_OPTIONS[styleId] || MAP_STYLE_OPTIONS.light;
    if (activeTileLayer) {
      leafletMap.removeLayer(activeTileLayer);
    }
    activeTileLayer = window.L.tileLayer(style.url, {
      attribution: style.attribution,
      maxZoom: 19,
      referrerPolicy: "strict-origin-when-cross-origin"
    }).addTo(leafletMap);
  }
  function applyMapSettingsFromPanel() {
    applyTileLayer();
    refreshMapMarkers();
    refreshMapLegend();
  }
  function buildMapLegendHtml() {
    return getLegendEntries(t).map((entry) => `
        <li class="map-legend-item">
            <span class="map-legend-swatch" style="background:${entry.color}" aria-hidden="true"></span>
            <span class="map-legend-icon" aria-hidden="true">${entry.icon}</span>
            <span class="map-legend-label">${escapeListLabel(entry.label)}</span>
        </li>
    `).join("");
  }
  function refreshMapLegend() {
    const list = document.querySelector("#mapLegendList");
    if (!list) return;
    list.innerHTML = buildMapLegendHtml();
  }
  function bindMapLegend(container) {
    const btn = container.querySelector("#mapLegendBtn");
    const panel = container.querySelector("#mapLegendPanel");
    if (!btn || !panel || btn.dataset.bound === "true") return;
    btn.dataset.bound = "true";
    refreshMapLegend();
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
      panel.hidden = expanded;
    });
  }
  function refreshMapMarkers({ fitBounds = false, force = false } = {}) {
    if (!leafletMap) return 0;
    const visibleAll = getVisibleProducers();
    const visible = limitVisibleProducers(visibleAll);
    const shouldReplace = force || !isPopupOpen;
    const markerCount = shouldReplace ? replaceMarkers(leafletMap, visible, { fitBounds: fitBounds && !isPopupOpen }) : visible.length;
    refreshProducerList(visible);
    eventBus2.emit(EVENTS2.PLACES_FILTERED, {
      producers: visible,
      category: activeCategoryFilter,
      query: activeSearchQuery,
      radius: currentRadiusKm
    });
    return markerCount;
  }
  function renderMap(container) {
    var _a7, _b;
    if (!container) return;
    if (mapControlsDragCleanup) {
      mapControlsDragCleanup();
      mapControlsDragCleanup = null;
    }
    stopLocationWatch();
    mapViewContainer = container;
    injectMapStyles();
    if (leafletMap) {
      leafletMap.remove();
      leafletMap = null;
    }
    resetRadiusCircle();
    resetGpsPin();
    resetMarkersLayer();
    activeTileLayer = null;
    initMapSettings();
    container.innerHTML = `
        <div class="map-view">
            <div id="map" role="region" aria-label="${t("a11y.map")}"></div>
            ${buildMapSkeletonHtml()}
            <div class="map-bottom-panel">
                <div id="radiusControl" class="radius-control map-draggable-control" data-map-control-id="suwak">
                    <div class="radius-control-row">
                        <span id="radiusValue" class="radius-value">${currentRadiusKm} km</span>
                        <input
                            type="range"
                            id="radiusSlider"
                            min="${RADIUS_MIN}"
                            max="${RADIUS_MAX}"
                            value="${currentRadiusKm}"
                            step="1"
                            aria-label="${t("a11y.searchRadius")}"
                        >
                    </div>
                    <p id="radiusHint" class="radius-hint">${formatRadiusHint(currentRadiusKm, 0)}</p>
                </div>
                <button type="button" id="mapGpsBtn" class="map-bottom-btn map-draggable-control" data-map-control-id="gps"><span class="map-btn-emoji" aria-hidden="true">\u{1F4CD}</span> ${t("map.gps")}</button>
                <button type="button" id="mapOsmBtn" class="map-bottom-btn map-draggable-control" data-map-control-id="osm"><span class="map-btn-emoji" aria-hidden="true">\u{1F5FA}\uFE0F</span> ${t("map.osm")}</button>
                <nav id="mapProducerList" class="map-producer-list map-draggable-control" data-map-control-id="lista" aria-label="${t("map.producerList")}">
                    <button type="button" id="mapListToggle" class="map-bottom-btn map-list-toggle" aria-expanded="false" aria-controls="mapProducerListItems">
                        ${t("map.listToggle").replace("{count}", "0")}
                    </button>
                    <ul id="mapProducerListItems" class="map-producer-list-items" hidden></ul>
                </nav>
                <div id="mapLegendWrap" class="map-legend-wrap map-draggable-control" data-map-control-id="legenda">
                    <button type="button" id="mapLegendBtn" class="map-bottom-btn map-legend-btn" aria-expanded="false" aria-controls="mapLegendPanel">
                        <span class="map-btn-emoji" aria-hidden="true">\u{1F4CB}</span> ${t("map.legend")}
                    </button>
                    <div id="mapLegendPanel" class="map-legend-panel" hidden>
                        <p class="map-legend-title">${t("map.legendTitle")}</p>
                        <ul id="mapLegendList" class="map-legend-list"></ul>
                    </div>
                </div>
            </div>
        </div>
    `;
    if (typeof window.L === "undefined") {
      console.error("[Karte] Leaflet nie za\u0142adowany \u2013 sprawd\u017A CDN w index.html");
      container.innerHTML = `<p class="error-view">${t("map.loadError")}</p>`;
      return;
    }
    if ((_b = (_a7 = window.L.TileLayer) == null ? void 0 : _a7.prototype) == null ? void 0 : _b.options) {
      window.L.TileLayer.prototype.options.referrerPolicy = "strict-origin-when-cross-origin";
    }
    const mapEl = container.querySelector("#map");
    if (!mapEl) return;
    void container.offsetHeight;
    void mapEl.offsetHeight;
    const startLeaflet = () => {
      if (!mapEl.isConnected) return;
      leafletMap = window.L.map(mapEl, {
        center: currentMapCenter || MAP_OVERVIEW_CENTER,
        zoom: currentMapCenter ? MAP_ZOOM : MAP_ZOOM_OVERVIEW,
        zoomControl: true,
        attributionControl: true
      });
      leafletMap.on("popupopen", () => {
        isPopupOpen = true;
      });
      leafletMap.on("popupclose", () => {
        isPopupOpen = false;
      });
      applyTileLayer();
      ensureMapSettingsPanel(container.querySelector(".map-view"));
      bindMapSettingsPanel(container, { onApply: applyMapSettingsFromPanel });
      bindResizeEvents();
      bindPopupActions(container);
      bindRadiusControl(container);
      bindMapToolbar(container);
      bindProducerList(container);
      bindMapLegend(container);
      initProducerModal();
      const bottomPanel = container.querySelector(".map-bottom-panel");
      if (bottomPanel) {
        mapControlsDragCleanup = initMapControlsDrag(bottomPanel, { map: leafletMap });
      }
      const finishMapInit = () => __async(null, null, function* () {
        if (!leafletMap) return;
        if (!currentMapCenter) {
          startLocationWatch();
          try {
            const resolved = yield resolveUserLocation();
            if (resolved) {
              currentMapCenter = [resolved.lat, resolved.lng];
            }
          } catch (_) {
          }
        }
        if (currentMapCenter) {
          leafletMap.invalidateSize(true);
          leafletMap.setView(currentMapCenter, MAP_ZOOM, { animate: false });
          applyMapCenter(currentMapCenter);
        } else {
          leafletMap.invalidateSize(true);
          showMapStatus(t("msg.locationUnavailable"), 6e3);
        }
        showMapSkeleton();
        if (currentMapCenter && !producersLoadStarted) {
          producersLoadStarted = true;
          try {
            const result = yield loadAllData(currentMapCenter[0], currentMapCenter[1], {
              radiusKm: currentRadiusKm
            });
            applyDataLoadResult(result, 6e3);
            console.info(
              `[Karte] Za\u0142adowano ${result.producers.length} producent\xF3w (\u017Ar\xF3d\u0142o: ${result.source})`
            );
          } catch (error) {
            console.error("[Karte] B\u0142\u0105d \u0142adowania danych:", error);
            showMapStatus(t("map.dataError"), 6e3);
          }
        } else if (!currentMapCenter) {
          enableUserLocationTracking({ centerMap: true });
        }
        const visibleProducers = limitVisibleProducers(getVisibleProducers());
        const markerCount = currentMapCenter ? replaceMarkers(leafletMap, visibleProducers, { fitBounds: !nearbySearchPending }) : 0;
        refreshProducerList(visibleProducers);
        hideMapSkeleton();
        if (activeSearchQuery && visibleProducers.length === 0 && currentMapCenter) {
          showMapStatus(formatSearchNoResults(activeSearchQuery, t));
        }
        if (homeLocationPending) {
          setTimeout(() => fulfillHomeLocationIfReady(), 150);
        } else if (nearbySearchPending) {
          setTimeout(() => applyNearbySearchDefaults(), 150);
        } else if (!geoWatchId) {
          startLocationWatch();
        }
        setTimeout(() => leafletMap == null ? void 0 : leafletMap.invalidateSize(true), 120);
        eventBus2.emit(EVENTS2.MAP_READY, {
          center: currentMapCenter,
          zoom: currentMapCenter ? MAP_ZOOM : MAP_ZOOM_OVERVIEW,
          markers: markerCount,
          category: activeCategoryFilter,
          query: activeSearchQuery
        });
        eventBus2.emit(EVENTS2.PLACES_FILTERED, {
          producers: visibleProducers,
          category: activeCategoryFilter,
          query: activeSearchQuery,
          radius: currentRadiusKm
        });
        console.info(`[Karte] ${markerCount} marker\xF3w (filtr: ${activeCategoryFilter})`);
      });
      leafletMap.whenReady(() => {
        requestAnimationFrame(finishMapInit);
      });
    };
    requestAnimationFrame(() => {
      requestAnimationFrame(startLeaflet);
    });
  }
  function applyMapCenter(center) {
    if (!leafletMap) return;
    updateRadiusCircle(leafletMap, center, currentRadiusKm);
    updateGpsPin(leafletMap, center);
  }
  function enableUserLocationTracking({ centerMap = false } = {}) {
    if (centerMap) shouldCenterMapOnNextFix = true;
    if (!startLocationWatch()) return false;
    if (lastTrackedLocation) {
      handlePositionUpdate(lastTrackedLocation);
      if (centerMap && leafletMap) {
        leafletMap.setView(currentMapCenter, leafletMap.getZoom());
        refreshMapMarkers();
      }
    }
    return true;
  }
  function applyUserLocation(gpsBtn) {
    const originalLabel = gpsBtn == null ? void 0 : gpsBtn.textContent;
    if (gpsBtn) {
      gpsBtn.disabled = true;
      gpsBtn.textContent = `\u{1F4CD} ${t("msg.loading")}`;
    }
    const started = enableUserLocationTracking({ centerMap: true });
    if (!started && gpsBtn) {
      gpsBtn.disabled = false;
      gpsBtn.textContent = originalLabel || `\u{1F4CD} ${t("map.gps")}`;
      return;
    }
    if (gpsBtn) {
      gpsBtn.disabled = false;
      gpsBtn.textContent = originalLabel || `\u{1F4CD} ${t("map.gps")}`;
    }
  }
  var popupClickHandler = null;
  function bindPopupActions(container) {
    if (popupClickHandler) {
      container.removeEventListener("click", popupClickHandler);
    }
    popupClickHandler = (event) => {
      const detailsBtn = event.target.closest("[data-details-id]");
      if (detailsBtn) {
        openProducerModal(detailsBtn.dataset.detailsId);
        return;
      }
      const favBtn = event.target.closest("[data-favorite-id]");
      if (favBtn) {
        const id = favBtn.dataset.favoriteId;
        if (isFavorite(id)) {
          removeFavorite(id);
        } else {
          addFavorite(id);
        }
        favBtn.textContent = isFavorite(id) ? `\u2B50 ${t("btn.favoriteSaved")}` : `\u2B50 ${t("btn.favorite")}`;
        refreshFavoritesBadge();
        return;
      }
    };
    container.addEventListener("click", popupClickHandler);
  }
  function bindMapToolbar(container) {
    const gpsBtn = container.querySelector("#mapGpsBtn");
    const osmBtn = container.querySelector("#mapOsmBtn");
    gpsBtn == null ? void 0 : gpsBtn.addEventListener("click", () => {
      applyUserLocation(gpsBtn);
    });
    osmBtn == null ? void 0 : osmBtn.addEventListener("click", () => __async(null, null, function* () {
      if (!leafletMap) return;
      const stored = getLastPosition() || lastTrackedLocation;
      if (!stored) {
        applyUserLocation(gpsBtn);
        return;
      }
      currentMapCenter = [stored.lat, stored.lng];
      lastDataFetchLocation = { lat: stored.lat, lng: stored.lng };
      leafletMap.setView(currentMapCenter, MAP_ZOOM);
      applyMapCenter(currentMapCenter);
      yield refreshOsmDataAtLocation(stored.lat, stored.lng);
      refreshMapMarkers({ fitBounds: true });
    }));
  }
  function bindRadiusControl(container) {
    const slider = container.querySelector("#radiusSlider");
    const valueLabel = container.querySelector("#radiusValue");
    if (!slider || !valueLabel) return;
    const updateSliderFill = () => {
      const min = Number(slider.min);
      const max = Number(slider.max);
      const val = Number(slider.value);
      const pct = (val - min) / (max - min) * 100;
      slider.style.setProperty("--radius-pct", `${pct}%`);
    };
    const updateRadius = (km) => {
      currentRadiusKm = km;
      valueLabel.textContent = `${km} km`;
      updateSliderFill();
      if (leafletMap) {
        updateRadiusCircle(leafletMap, currentMapCenter, km);
        refreshMapMarkers();
        eventBus2.emit(EVENTS2.FILTER_RADIUS_CHANGED, { radius: km });
      }
    };
    slider.addEventListener("input", () => {
      updateRadius(Number(slider.value));
    });
    updateSliderFill();
  }
  function bindResizeEvents() {
    if (_resizeBound) return;
    _resizeBound = true;
    eventBus2.on(EVENTS2.VIEW_CHANGED, ({ view }) => {
      if (view !== "map") {
        closeProducerModal();
        if (mapViewContainer) closeMapSettingsPanel(mapViewContainer);
        stopLocationWatch();
      }
      if (view === "map" && leafletMap) {
        setTimeout(() => {
          leafletMap.invalidateSize(true);
          if (currentMapCenter) {
            leafletMap.setView(currentMapCenter, leafletMap.getZoom() || MAP_ZOOM, { animate: false });
            refreshMapMarkers({ force: false });
          }
          fulfillHomeLocationIfReady();
          applyNearbySearchDefaults();
          if (!geoWatchId) {
            startLocationWatch();
          }
        }, 150);
      }
    });
    eventBus2.on(EVENTS2.PLACES_LOADED, () => {
      if (leafletMap) {
        refreshMapMarkers({ fitBounds: false });
      }
    });
  }
  function injectMapStyles() {
    let style = document.getElementById("map-view-styles");
    if (!style) {
      style = document.createElement("style");
      style.id = "map-view-styles";
      document.head.appendChild(style);
    }
    style.textContent = `
        [data-view-panel="map"] .leaflet-container {
            height: 100% !important;
            width: 100% !important;
            font-family: var(--font-sans);
        }
        .map-popup {
            font-size: 13px;
            line-height: 1.4;
        }
        .map-popup .producer-header-top {
            align-items: center;
        }
        .map-popup-desc em,
        .map-popup em {
            color: var(--color-text-muted);
            font-style: normal;
        }
        .map-popup-promo {
            margin-top: 8px;
            padding: 6px 8px;
            background: rgba(196, 124, 58, 0.12);
            border: 1px solid rgba(196, 124, 58, 0.35);
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            color: var(--color-btn-location-hover);
        }
        .map-popup-actions {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-top: 8px;
        }
        .map-popup-btn {
            font-size: 13px;
            padding: 10px 12px;
            min-height: 44px;
            min-width: 44px;
            border: 1px solid var(--color-bg);
            border-radius: 6px;
            background: #fff;
            cursor: pointer;
            text-align: center;
            text-decoration: none;
            color: inherit;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: inherit;
            box-sizing: border-box;
        }
        .map-popup-btn-details {
            min-height: 44px;
            padding: 10px 16px;
            background: var(--color-accent);
            color: #ffffff;
            border: none;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 700;
        }
        .map-popup-btn-details:hover {
            background: var(--color-accent-dark);
        }
        .map-popup-nav {
            font-weight: 600;
            color: var(--color-primary);
        }
        .map-bottom-controls {
            display: none;
        }
        .map-draggable-control {
            z-index: 460;
            touch-action: none;
        }
        .map-draggable-control.is-dragging {
            cursor: grabbing;
            z-index: 470;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
        }
        .map-producer-list {
            position: absolute;
            pointer-events: auto;
        }
        .map-list-toggle {
            width: 100%;
            min-height: auto;
        }
        .map-legend-panel {
            position: absolute;
            bottom: calc(100% + 6px);
            right: 0;
            min-width: 200px;
            padding: 10px 12px;
            background: rgba(255, 255, 255, 0.96);
            border: 1px solid rgba(69, 102, 150, 0.15);
            border-radius: var(--radius-md);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
            z-index: 470;
        }
        .map-legend-title {
            margin: 0 0 8px;
            font-size: 11px;
            font-weight: 700;
            color: var(--color-text-muted);
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }
        .map-legend-list {
            list-style: none;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .map-legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            font-weight: 600;
            color: #2a3340;
        }
        .map-legend-swatch {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 1px solid rgba(0, 0, 0, 0.12);
            flex-shrink: 0;
        }
        .map-legend-icon {
            font-size: 16px;
            line-height: 1;
        }
        .map-legend-wrap {
            position: absolute;
            pointer-events: auto;
        }
        .map-legend-btn {
            min-height: auto;
        }
        .map-producer-list-items {
            list-style: none;
            position: absolute;
            bottom: calc(100% + 6px);
            left: 0;
            right: 0;
            margin: 0;
            padding: 0;
            max-height: 34vh;
            overflow-y: auto;
            background: rgba(255, 255, 255, 0.92);
            border: 1px solid rgba(69, 102, 150, 0.12);
            border-radius: var(--radius-md);
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
            z-index: 465;
        }
        .map-producer-list-btn {
            width: 100%;
            min-height: 44px;
            padding: 10px 12px;
            border: none;
            border-bottom: 1px solid rgba(69, 102, 150, 0.08);
            background: transparent;
            text-align: left;
            font-family: inherit;
            font-size: 12px;
            font-weight: 600;
            color: #2a3340;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 2px;
        }
        .map-list-item-name {
            font-weight: 700;
        }
        .map-list-item-sub {
            font-size: 11px;
            font-weight: 500;
            color: var(--color-text-muted);
        }
        .map-producer-list-btn.is-active,
        .map-producer-list-btn:focus-visible {
            background: rgba(69, 102, 150, 0.12);
            outline: 2px solid var(--color-accent);
            outline-offset: -2px;
        }
        .map-producer-list-empty {
            padding: 12px;
            font-size: 12px;
            color: var(--color-text-muted);
        }
        .radius-hint {
            margin: 0;
            width: 100%;
            font-size: 11px;
            font-weight: 600;
            color: var(--color-primary);
            text-align: center;
        }
        .radius-control-row {
            display: flex;
            align-items: center;
            gap: 10px;
            width: 100%;
        }
    `;
  }

  // js/auth/authModalStyles.js
  function injectAuthModalStyles() {
    if (document.getElementById("auth-modal-styles")) return;
    const style = document.createElement("style");
    style.id = "auth-modal-styles";
    style.textContent = `
        .auth-modal { position: fixed; inset: 0; z-index: 1550; display: flex; align-items: center; justify-content: center; padding: 16px; }
        .auth-modal[hidden] { display: none !important; }
        .auth-modal-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.45); }
        .auth-modal-dialog { position: relative; width: min(100%, 420px); max-height: 90vh; overflow: auto; background: var(--color-card, #fff); border-radius: var(--radius-lg, 14px); box-shadow: 0 12px 40px rgba(0,0,0,0.2); padding: 24px; }
        .auth-modal-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
        .auth-modal-header h2 { margin: 0; font-size: 1.15rem; }
        .auth-modal-close { border: none; background: transparent; font-size: 1.5rem; line-height: 1; cursor: pointer; color: var(--color-text-muted); min-width: 44px; min-height: 44px; }
        .auth-form { display: flex; flex-direction: column; gap: 12px; }
        .auth-field label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 4px; }
        .auth-field input, .auth-field select { width: 100%; min-height: 44px; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font: inherit; background: var(--color-card); color: var(--color-text); box-sizing: border-box; }
        .auth-error { color: #b42318; font-size: 0.85rem; min-height: 1.2em; }
        .auth-trial-note { font-size: 0.8rem; color: var(--color-text-muted); margin: 0; }
        .auth-switch { margin-top: 12px; text-align: center; font-size: 0.9rem; }
        .auth-switch button { background: none; border: none; color: var(--color-accent); font-weight: 600; cursor: pointer; text-decoration: underline; padding: 4px; }
        .auth-type-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .auth-type-btn { min-height: 44px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-card); cursor: pointer; font: inherit; font-weight: 600; }
        .auth-type-btn.is-active { border-color: var(--color-primary); background: rgba(69,102,150,0.1); color: var(--color-primary); }
        .auth-checkboxes { display: flex; flex-wrap: wrap; gap: 8px 12px; margin-top: 6px; }
        .auth-check { display: flex; align-items: center; gap: 6px; font-size: 0.9rem; }
    `;
    document.head.appendChild(style);
  }
  function escapeHtml8(text) {
    return String(text != null ? text : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // js/auth/register.js
  var initialized2 = false;
  var selectedAccountType = ACCOUNT_TYPES.client;
  function authErrorMessage(code) {
    const key = `auth.errors.${code}`;
    const text = t(key);
    return text === key ? t("auth.errors.generic") : text;
  }
  function categoryLabel(id) {
    const text = t(`producer.types.${id}`);
    return text === `producer.types.${id}` ? id : text;
  }
  function renderProducerCategoriesHtml() {
    return PRODUCER_CATEGORIES.map((cat) => `
        <label class="auth-check">
            <input type="checkbox" name="producerCategories" value="${cat.id}">
            ${escapeHtml8(categoryLabel(cat.id))}
        </label>
    `).join("");
  }
  function ensureModal2() {
    injectAuthModalStyles();
    if (document.getElementById("authRegisterModal")) return;
    document.body.insertAdjacentHTML("beforeend", `
        <div id="authRegisterModal" class="auth-modal" hidden aria-hidden="true">
            <div class="auth-modal-backdrop" data-auth-close></div>
            <div class="auth-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="authRegisterTitle">
                <div class="auth-modal-header">
                    <h2 id="authRegisterTitle">${escapeHtml8(t("auth.registerTitle"))}</h2>
                    <button type="button" class="auth-modal-close" data-auth-close aria-label="${escapeHtml8(t("btn.close"))}">\xD7</button>
                </div>
                <form id="authRegisterForm" class="auth-form" novalidate>
                    <div class="auth-field" id="authRegisterTypeRow">
                        <label>${escapeHtml8(t("auth.accountType"))}</label>
                        <div class="auth-type-row" role="group" aria-label="${escapeHtml8(t("auth.accountType"))}">
                            <button type="button" class="auth-type-btn is-active" data-account-type="client">${escapeHtml8(t("auth.client"))}</button>
                            <button type="button" class="auth-type-btn" data-account-type="producer">${escapeHtml8(t("auth.producer"))}</button>
                        </div>
                    </div>
                    <fieldset class="auth-field" id="authRegisterCategoriesField" hidden>
                        <legend>${escapeHtml8(t("auth.registerCategories"))}</legend>
                        <div class="auth-checkboxes">${renderProducerCategoriesHtml()}</div>
                    </fieldset>
                    <div class="auth-field">
                        <label for="authRegisterEmail">${escapeHtml8(t("auth.email"))}</label>
                        <input id="authRegisterEmail" name="email" type="email" autocomplete="email" required>
                    </div>
                    <div class="auth-field">
                        <label for="authRegisterPassword">${escapeHtml8(t("auth.password"))}</label>
                        <input id="authRegisterPassword" name="password" type="password" autocomplete="new-password" required minlength="6">
                    </div>
                    <div class="auth-field">
                        <label for="authRegisterPasswordConfirm">${escapeHtml8(t("auth.passwordConfirm"))}</label>
                        <input id="authRegisterPasswordConfirm" name="passwordConfirm" type="password" autocomplete="new-password" required minlength="6">
                    </div>
                    <p class="auth-trial-note">${escapeHtml8(t("auth.trialNote"))}</p>
                    <p id="authRegisterError" class="auth-error" role="alert"></p>
                    <button type="submit" class="btn-primary">${escapeHtml8(t("auth.register"))}</button>
                </form>
                <p class="auth-switch">
                    ${escapeHtml8(t("auth.hasAccount"))}
                    <button type="button" id="authGoLogin">${escapeHtml8(t("auth.login"))}</button>
                </p>
            </div>
        </div>
    `);
  }
  function updateRegisterModalUi(modal, lockType = false) {
    const title = modal.querySelector("#authRegisterTitle");
    const typeRow = modal.querySelector("#authRegisterTypeRow");
    const categoriesField = modal.querySelector("#authRegisterCategoriesField");
    if (title) {
      title.textContent = selectedAccountType === ACCOUNT_TYPES.producer ? t("auth.registerAsProducer") : t("auth.registerAsClient");
    }
    if (typeRow) typeRow.hidden = lockType;
    if (categoriesField) categoriesField.hidden = selectedAccountType !== ACCOUNT_TYPES.producer;
    modal.querySelectorAll("[data-account-type]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.accountType === selectedAccountType);
    });
  }
  function closeRegisterModal() {
    const modal = document.getElementById("authRegisterModal");
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("auth-modal-open");
  }
  function openRegisterModal(accountType = null) {
    var _a7;
    ensureModal2();
    closeLoginModal();
    const modal = document.getElementById("authRegisterModal");
    const form = document.getElementById("authRegisterForm");
    const error = document.getElementById("authRegisterError");
    if (!modal || !form) return;
    selectedAccountType = accountType === ACCOUNT_TYPES.producer ? ACCOUNT_TYPES.producer : ACCOUNT_TYPES.client;
    updateRegisterModalUi(modal, accountType != null);
    form.reset();
    if (error) error.textContent = "";
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("auth-modal-open");
    (_a7 = form.querySelector("#authRegisterEmail")) == null ? void 0 : _a7.focus();
  }
  function handleSubmit(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const form = event.currentTarget;
      const errorEl = document.getElementById("authRegisterError");
      const producerCategories = selectedAccountType === ACCOUNT_TYPES.producer ? Array.from(form.querySelectorAll('input[name="producerCategories"]:checked')).map((el) => el.value) : [];
      const result = yield register({
        email: form.email.value,
        password: form.password.value,
        passwordConfirm: form.passwordConfirm.value,
        accountType: selectedAccountType,
        producerCategories
      });
      if (!result.ok) {
        if (errorEl) errorEl.textContent = authErrorMessage(result.error);
        return;
      }
      closeRegisterModal();
      showToast(t("auth.welcome"));
      navigateTo("profile", { force: true });
    });
  }
  function initRegisterModal() {
    var _a7;
    if (initialized2) return;
    ensureModal2();
    const modal = document.getElementById("authRegisterModal");
    const form = document.getElementById("authRegisterForm");
    if (!modal || !form) return;
    form.addEventListener("submit", handleSubmit);
    modal.querySelectorAll("[data-auth-close]").forEach((el) => {
      el.addEventListener("click", closeRegisterModal);
    });
    (_a7 = modal.querySelector("#authGoLogin")) == null ? void 0 : _a7.addEventListener("click", () => {
      closeRegisterModal();
      openLoginModal(selectedAccountType);
    });
    modal.querySelectorAll("[data-account-type]").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedAccountType = btn.dataset.accountType === ACCOUNT_TYPES.producer ? ACCOUNT_TYPES.producer : ACCOUNT_TYPES.client;
        updateRegisterModalUi(modal, false);
      });
    });
    modal.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeRegisterModal();
    });
    initialized2 = true;
  }

  // js/auth/login.js
  var initialized3 = false;
  var expectedAccountType = null;
  function authErrorMessage2(code) {
    const key = `auth.errors.${code}`;
    const text = t(key);
    return text === key ? t("auth.errors.generic") : text;
  }
  function ensureModal3() {
    injectAuthModalStyles();
    if (document.getElementById("authLoginModal")) return;
    document.body.insertAdjacentHTML("beforeend", `
        <div id="authLoginModal" class="auth-modal" hidden aria-hidden="true">
            <div class="auth-modal-backdrop" data-auth-close></div>
            <div class="auth-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="authLoginTitle">
                <div class="auth-modal-header">
                    <h2 id="authLoginTitle">${escapeHtml8(t("auth.loginTitle"))}</h2>
                    <button type="button" class="auth-modal-close" data-auth-close aria-label="${escapeHtml8(t("btn.close"))}">\xD7</button>
                </div>
                <p id="authLoginHint" class="auth-trial-note"></p>
                <form id="authLoginForm" class="auth-form" novalidate>
                    <div class="auth-field">
                        <label for="authLoginEmail">${escapeHtml8(t("auth.email"))}</label>
                        <input id="authLoginEmail" name="email" type="email" autocomplete="email" required>
                    </div>
                    <div class="auth-field">
                        <label for="authLoginPassword">${escapeHtml8(t("auth.password"))}</label>
                        <input id="authLoginPassword" name="password" type="password" autocomplete="current-password" required minlength="6">
                    </div>
                    <p id="authLoginError" class="auth-error" role="alert"></p>
                    <button type="submit" class="btn-primary">${escapeHtml8(t("auth.login"))}</button>
                </form>
                <p class="auth-switch">
                    ${escapeHtml8(t("auth.noAccount"))}
                    <button type="button" id="authGoRegister">${escapeHtml8(t("auth.register"))}</button>
                </p>
            </div>
        </div>
    `);
  }
  function updateLoginModalUi(modal) {
    const title = modal.querySelector("#authLoginTitle");
    const hint = modal.querySelector("#authLoginHint");
    if (!title) return;
    if (expectedAccountType === ACCOUNT_TYPES.producer) {
      title.textContent = t("auth.loginAsProducer");
      if (hint) hint.textContent = t("profile.producerSection");
    } else if (expectedAccountType === ACCOUNT_TYPES.client) {
      title.textContent = t("auth.loginAsClient");
      if (hint) hint.textContent = t("profile.consumerSection");
    } else {
      title.textContent = t("auth.loginTitle");
      if (hint) hint.textContent = "";
    }
  }
  function closeLoginModal() {
    const modal = document.getElementById("authLoginModal");
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("auth-modal-open");
  }
  function openLoginModal(accountType = null) {
    var _a7;
    ensureModal3();
    closeRegisterModal();
    const modal = document.getElementById("authLoginModal");
    const form = document.getElementById("authLoginForm");
    const error = document.getElementById("authLoginError");
    if (!modal || !form) return;
    expectedAccountType = accountType === ACCOUNT_TYPES.producer ? ACCOUNT_TYPES.producer : accountType === ACCOUNT_TYPES.client ? ACCOUNT_TYPES.client : null;
    updateLoginModalUi(modal);
    form.reset();
    if (error) error.textContent = "";
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("auth-modal-open");
    (_a7 = form.querySelector("#authLoginEmail")) == null ? void 0 : _a7.focus();
  }
  function handleSubmit2(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const form = event.currentTarget;
      const errorEl = document.getElementById("authLoginError");
      const result = yield login({
        email: form.email.value,
        password: form.password.value,
        expectedAccountType: expectedAccountType || void 0
      });
      if (!result.ok) {
        if (errorEl) errorEl.textContent = authErrorMessage2(result.error);
        return;
      }
      closeLoginModal();
      showToast(t("auth.welcome"));
      navigateTo("profile", { force: true });
    });
  }
  function initLoginModal() {
    var _a7;
    if (initialized3) return;
    ensureModal3();
    const modal = document.getElementById("authLoginModal");
    const form = document.getElementById("authLoginForm");
    if (!modal || !form) return;
    form.addEventListener("submit", handleSubmit2);
    modal.querySelectorAll("[data-auth-close]").forEach((el) => {
      el.addEventListener("click", closeLoginModal);
    });
    (_a7 = modal.querySelector("#authGoRegister")) == null ? void 0 : _a7.addEventListener("click", () => {
      closeLoginModal();
      openRegisterModal(expectedAccountType);
    });
    modal.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeLoginModal();
    });
    initialized3 = true;
  }

  // js/views/premium.js
  var selectedPlan = "monthly";
  function escapeHtml9(text) {
    return String(text != null ? text : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function injectPremiumStyles() {
    if (document.getElementById("premium-view-extra-styles")) return;
    const style = document.createElement("style");
    style.id = "premium-view-extra-styles";
    style.textContent = `
        .premium-login-card { text-align: center; padding: var(--space-2xl); }
        .premium-status-card { padding: var(--space-lg); border: 1px solid rgba(27,127,88,0.35); background: rgba(27,127,88,0.08); }
        .premium-status-badge { display: inline-block; padding: 4px 10px; border-radius: 999px; background: rgba(27,127,88,0.15); color: var(--color-accent-dark); font-size: 0.8rem; font-weight: 700; margin-bottom: 8px; }
        .premium-trial-counter { font-size: 0.95rem; font-weight: 600; color: var(--color-primary); margin: 8px 0 0; }
        .premium-plans { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .premium-plan-card { position: relative; text-align: left; padding: 14px; border: 2px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-card); cursor: pointer; font: inherit; color: inherit; }
        .premium-plan-card.is-selected { border-color: var(--color-primary); box-shadow: 0 0 0 1px var(--color-primary); }
        .premium-plan-save { display: inline-block; margin-top: 4px; font-size: 0.75rem; font-weight: 700; color: var(--color-accent); }
        .premium-plan-price { display: block; font-size: 1.1rem; font-weight: 700; margin-top: 6px; }
        .premium-trial-banner { text-align: center; padding: 10px 12px; border-radius: var(--radius-md); background: rgba(69,102,150,0.1); font-weight: 600; font-size: 0.9rem; }
        .premium-payment-note { font-size: 0.8rem; text-align: center; margin: 0; }
        .premium-feature-card.is-unlocked { border-left: 3px solid var(--color-accent); }
        .premium-feature-card.is-locked { opacity: 0.72; }
        @media (max-width: 520px) { .premium-plans { grid-template-columns: 1fr; } }
    `;
    document.head.appendChild(style);
  }
  function renderBenefitsList(unlocked) {
    const features = [
      { icon: "\u2B50", title: "feature1Title", desc: "feature1Desc" },
      { icon: "\u{1F5FA}\uFE0F", title: "feature2Title", desc: "feature2Desc" },
      { icon: "\u{1F6D2}", title: "feature3Title", desc: "feature3Desc" },
      { icon: "\u{1F514}", title: "feature4Title", desc: "feature4Desc" }
    ];
    return features.map((f) => `
        <li class="premium-feature-card card ${unlocked ? "is-unlocked" : "is-locked"}">
            <span class="premium-feature-icon" aria-hidden="true">${f.icon}</span>
            <div>
                <strong>${escapeHtml9(t(`premium.${f.title}`))}</strong>
                <p class="text-muted">${escapeHtml9(t(`premium.${f.desc}`))}</p>
            </div>
        </li>
    `).join("");
  }
  function renderLoginGate() {
    return `
        <section class="app-section premium-login-card card">
            <span class="premium-hero-icon" aria-hidden="true">\u{1F512}</span>
            <h3>${escapeHtml9(t("premium.loginRequired"))}</h3>
            <p class="text-muted">${escapeHtml9(t("premium.loginHint"))}</p>
            <button type="button" class="btn-primary" id="premiumLoginBtn">${escapeHtml9(t("premium.loginBtn"))}</button>
        </section>
    `;
  }
  function renderActiveStatus() {
    const status = getPremiumStatus();
    const daysLeft = getTrialDaysRemaining();
    const plan = getSelectedPlan();
    const planLabel = plan === "annual" ? t("premium.planAnnual") : t("premium.planMonthly");
    return `
        <section class="app-section premium-status-card card">
            <span class="premium-status-badge">\u{1F451} ${escapeHtml9(t("premium.statusActive"))}</span>
            <p>${escapeHtml9(t("premium.benefitsUnlocked"))}</p>
            <p class="text-muted">${escapeHtml9(planLabel)}</p>
            ${daysLeft > 0 ? `<p class="premium-trial-counter">${escapeHtml9(t("premium.trialRemaining").replace("{days}", String(daysLeft)))}</p>` : ""}
            ${(status == null ? void 0 : status.expiresAt) ? `<p class="text-muted">${escapeHtml9(t("premium.expiresOn").replace("{date}", formatPremiumExpiryDate(status.expiresAt)))}</p>` : ""}
        </section>
    `;
  }
  function renderPlansSection() {
    return `
        <section class="app-section">
            <h3 class="section-heading">${escapeHtml9(t("premium.selectPlan"))}</h3>
            <p class="premium-trial-banner">\u{1F381} ${escapeHtml9(t("premium.trialBadge"))}</p>
            <div class="premium-plans" role="radiogroup" aria-label="${escapeHtml9(t("premium.selectPlan"))}">
                <button type="button" class="premium-plan-card ${selectedPlan === "monthly" ? "is-selected" : ""}" data-plan="monthly" role="radio" aria-checked="${selectedPlan === "monthly"}">
                    <strong>${escapeHtml9(t("premium.monthlyPlan"))}</strong>
                    <span class="premium-plan-price">${escapeHtml9(t("premium.monthlyPrice"))}</span>
                </button>
                <button type="button" class="premium-plan-card ${selectedPlan === "annual" ? "is-selected" : ""}" data-plan="annual" role="radio" aria-checked="${selectedPlan === "annual"}">
                    <strong>${escapeHtml9(t("premium.annualPlan"))}</strong>
                    <span class="premium-plan-save">${escapeHtml9(t("premium.annualSave"))}</span>
                    <span class="premium-plan-price">${escapeHtml9(t("premium.annualPrice"))}</span>
                </button>
            </div>
        </section>

        <section class="app-section premium-cta-section">
            <button type="button" class="btn-primary premium-upgrade-btn" id="premiumUpgradeBtn">
                \u{1F451} ${escapeHtml9(t("premium.activate"))}
            </button>
            <p class="text-muted premium-payment-note">${escapeHtml9(t("premium.paymentSimulated"))}</p>
        </section>
    `;
  }
  function renderPremium(container) {
    if (!container) return;
    injectPremiumStyles();
    const loggedIn = isLoggedIn();
    const active = loggedIn && isPremiumActive();
    if (!loggedIn) {
      selectedPlan = "monthly";
    } else if (!active) {
      selectedPlan = getSelectedPlan() || "monthly";
    }
    container.innerHTML = `
        <div class="premium-page">
            <header class="view-hero premium-hero">
                <span class="premium-hero-icon" aria-hidden="true">\u{1F451}</span>
                <h2>${escapeHtml9(t("premium.title"))}</h2>
                <p class="text-muted">${escapeHtml9(t("premium.subtitle"))}</p>
            </header>

            ${!loggedIn ? renderLoginGate() : ""}
            ${loggedIn && active ? renderActiveStatus() : ""}

            <section class="app-section premium-features">
                <h3 class="section-heading">${escapeHtml9(t("premium.featuresTitle"))}</h3>
                <ul class="premium-feature-list">
                    ${renderBenefitsList(loggedIn && active)}
                </ul>
            </section>

            ${loggedIn && !active ? renderPlansSection() : ""}
        </div>
    `;
    bindPremiumEvents(container, loggedIn, active);
    document.body.classList.toggle("premium-active", Boolean(active));
  }
  function bindPremiumEvents(container, loggedIn, active) {
    var _a7, _b;
    (_a7 = container.querySelector("#premiumLoginBtn")) == null ? void 0 : _a7.addEventListener("click", () => {
      openLoginModal();
    });
    container.querySelectorAll("[data-plan]").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedPlan = btn.dataset.plan === "annual" ? "annual" : "monthly";
        renderPremium(container);
      });
    });
    (_b = container.querySelector("#premiumUpgradeBtn")) == null ? void 0 : _b.addEventListener("click", () => {
      if (!loggedIn) {
        openLoginModal();
        return;
      }
      const result = activatePremium(selectedPlan);
      if (!result.ok) {
        showToast(t("premium.loginRequired"));
        return;
      }
      showToast(t("premium.activated"));
      document.body.classList.add("premium-active");
      renderPremium(container);
    });
    if (!loggedIn) {
      document.body.classList.remove("premium-active");
    } else if (!active) {
      document.body.classList.remove("premium-active");
    }
  }

  // js/views/cart.js
  var STORAGE_KEY4 = "regionalny_smak_cart";
  function renderCart(container) {
    if (!container) return;
    injectStyles2();
    render2(container);
    bindEvents2(container);
  }
  function injectStyles2() {
    if (document.getElementById("cart-view-styles")) return;
    const style = document.createElement("style");
    style.id = "cart-view-styles";
    style.textContent = `
        .cart-page { display: flex; flex-direction: column; gap: var(--space-lg); }
        .cart-list { display: flex; flex-direction: column; gap: var(--space-sm); }
        .cart-item { display: flex; align-items: center; gap: var(--space-md); flex-wrap: wrap; }
        .cart-item .info { flex: 1; min-width: 160px; }
        .cart-item .name { font-weight: 600; }
        .cart-item .place { font-size: var(--text-sm); color: var(--text-muted); }
        .cart-item .price { font-weight: 600; color: var(--color-primary); min-width: 72px; text-align: right; }
        .cart-qty { display: flex; align-items: center; gap: var(--space-xs); }
        .cart-qty button { width: 32px; height: 32px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: var(--bg-card); font-size: var(--text-lg); }
        .cart-qty span { min-width: 24px; text-align: center; font-weight: 600; }
        .cart-remove { color: var(--color-error); font-size: var(--text-sm); padding: var(--space-xs) var(--space-sm); border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: transparent; }
        .cart-summary { display: flex; justify-content: space-between; align-items: center; padding: var(--space-lg); margin-top: var(--space-sm); }
        .cart-summary strong { font-size: var(--text-lg); color: var(--color-accent); }
        .cart-actions { display: flex; flex-direction: column; gap: var(--space-md); }
    `;
    document.head.appendChild(style);
  }
  function getCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY4);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (_) {
      return [];
    }
  }
  function setCart(items) {
    localStorage.setItem(STORAGE_KEY4, JSON.stringify(items));
    eventBus2.emit(EVENTS2.CART_CHANGED, { cart: items });
    updateNavBadge2(items.reduce((n, i) => n + (i.quantity || 1), 0));
  }
  function updateNavBadge2(count) {
    const label = document.querySelector('[data-view="cart"] .nav-label');
    if (label) {
      label.textContent = formatNavLabel("cart", count);
    }
  }
  function formatPrice3(value) {
    return formatCurrency(value);
  }
  function getTotal(items) {
    return items.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1), 0);
  }
  function render2(container) {
    const items = getCart();
    const total = getTotal(items);
    const count = items.reduce((n, i) => n + (i.quantity || 1), 0);
    container.innerHTML = `
        <div class="cart-page">
            <header class="view-hero">
                <h2>\u{1F6D2} ${t("cart.title")}</h2>
                <p class="text-muted">${t("cart.subtitle")}</p>
            </header>
            ${count === 0 ? renderEmpty2() : renderList2(items, total)}
        </div>
    `;
  }
  function renderEmpty2() {
    return `
        <div class="empty-state card">
            <span class="empty-icon" aria-hidden="true">\u{1F6D2}</span>
            <p>${t("cart.empty")}</p>
            <p class="empty-sub">${t("cart.emptySub")}</p>
            <button type="button" id="cartGoMapBtn" class="btn-primary">${t("btn.discover")}</button>
        </div>
    `;
  }
  function renderList2(items, total) {
    return `
        <div class="cart-list" id="cartList">
            ${items.map((item) => `
                <article class="list-item cart-item" data-id="${item.id}">
                    <div class="info">
                        <div class="name">${item.name || t("cart.product")}</div>                        <div class="place">${item.place || ""}</div>
                    </div>
                    <div class="cart-qty">
                        <button type="button" data-qty="dec" data-id="${item.id}" aria-label="${t("btn.less")}">\u2212</button>
                        <span>${item.quantity || 1}</span>
                        <button type="button" data-qty="inc" data-id="${item.id}" aria-label="${t("btn.more")}">+</button>                    </div>
                    <div class="price">${formatPrice3((item.price || 0) * (item.quantity || 1))}</div>
                    <button type="button" class="cart-remove" data-remove="${item.id}">${t("btn.remove")}</button>                </article>
            `).join("")}
        </div>
        <div class="cart-summary card">
            <span>${t("cart.total")}</span>
            <strong>${formatPrice3(total)}</strong>
        </div>
        <div class="cart-actions">
            <button type="button" id="cartCheckoutBtn" class="btn-primary">${t("btn.checkout")}</button>
            <button type="button" id="cartClearBtn" class="btn-secondary">${t("btn.clearCart")}</button>
        </div>    `;
  }
  function refreshCartBadge() {
    updateNavBadge2(getCart().reduce((n, i) => n + (i.quantity || 1), 0));
  }
  function bindEvents2(container) {
    container.addEventListener("click", (e) => {
      const qtyBtn = e.target.closest("[data-qty]");
      if (qtyBtn) {
        const id = qtyBtn.dataset.id;
        const items = getCart();
        const item = items.find((i) => i.id === id);
        if (!item) return;
        if (qtyBtn.dataset.qty === "inc") {
          item.quantity = (item.quantity || 1) + 1;
        } else {
          item.quantity = Math.max(1, (item.quantity || 1) - 1);
        }
        setCart(items);
        render2(container);
        return;
      }
      const removeBtn = e.target.closest("[data-remove]");
      if (removeBtn) {
        setCart(getCart().filter((i) => i.id !== removeBtn.dataset.remove));
        render2(container);
        return;
      }
      if (e.target.closest("#cartClearBtn")) {
        if (window.confirm(t("cart.confirmClear"))) {
          setCart([]);
          render2(container);
        }
        return;
      }
      if (e.target.closest("#cartGoMapBtn")) {
        navigateTo("map");
        return;
      }
      if (e.target.closest("#cartCheckoutBtn")) {
        showToast(t("msg.checkoutSoon"));
      }
    });
    updateNavBadge2(getCart().reduce((n, i) => n + (i.quantity || 1), 0));
  }
  function getCartItems() {
    return getCart();
  }
  function removeCartItem(id) {
    setCart(getCart().filter((i) => i.id !== id));
  }

  // js/core/settings.js
  var SETTINGS_KEY = "regionalny_smak_settings";
  function getSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      const data = raw ? JSON.parse(raw) : {};
      return data && typeof data === "object" ? data : {};
    } catch (_) {
      return {};
    }
  }
  function saveSettings(patch) {
    const next = __spreadValues(__spreadValues({}, getSettings()), patch);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    return next;
  }
  function isDarkMode() {
    return Boolean(getSettings().darkMode);
  }
  function applyDarkMode(enabled) {
    document.body.classList.toggle("dark-mode", enabled);
    const btn = document.getElementById("darkModeToggleBtn");
    if (btn) {
      btn.textContent = enabled ? "\u2600\uFE0F" : "\u{1F319}";
      btn.setAttribute("aria-label", enabled ? t("a11y.lightMode") : t("a11y.darkMode"));
    }
  }
  function setDarkMode(enabled) {
    saveSettings({ darkMode: enabled });
    applyDarkMode(enabled);
    eventBus2.emit(EVENTS2.THEME_CHANGED, { darkMode: enabled });
  }
  function setAppLanguage(code) {
    const lang = setLanguage(code);
    saveSettings({ language: lang });
    updateLanguageButtonLabel();
    eventBus2.emit(EVENTS2.LANGUAGE_CHANGED, { language: lang });
    return lang;
  }
  function updateLanguageButtonLabel() {
    const label = document.getElementById("languageSwitcherLabel");
    const option = getLanguageOption(getCurrentLanguage());
    if (label && option) {
      label.textContent = `${option.flag} ${option.label}`;
    }
    document.querySelectorAll(".language-option").forEach((btn) => {
      const active = btn.dataset.lang === getCurrentLanguage();
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
  }
  function closeLanguageDropdown() {
    const dropdown = document.getElementById("languageDropdown");
    const toggle = document.getElementById("languageSwitcherBtn");
    if (dropdown) dropdown.hidden = true;
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }
  function openLanguageDropdown() {
    const dropdown = document.getElementById("languageDropdown");
    const toggle = document.getElementById("languageSwitcherBtn");
    if (dropdown) dropdown.hidden = false;
    if (toggle) toggle.setAttribute("aria-expanded", "true");
  }
  function bindLanguageDropdown() {
    const toggle = document.getElementById("languageSwitcherBtn");
    const dropdown = document.getElementById("languageDropdown");
    if (!toggle || !dropdown) return;
    toggle.setAttribute("aria-label", t("a11y.chooseLanguage"));
    toggle.setAttribute("aria-controls", "languageDropdown");
    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      if (dropdown.hidden) {
        openLanguageDropdown();
      } else {
        closeLanguageDropdown();
      }
    });
    dropdown.querySelectorAll(".language-option").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.stopPropagation();
        const code = btn.dataset.lang;
        if (code) setAppLanguage(code);
        closeLanguageDropdown();
        toggle.focus();
      });
    });
    document.addEventListener("click", closeLanguageDropdown);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !dropdown.hidden) {
        closeLanguageDropdown();
        toggle.focus();
      }
    });
  }
  function bindShellPlaceholders() {
  }
  function bindDarkModeToggle() {
    const btn = document.getElementById("darkModeToggleBtn");
    if (!btn || btn.dataset.bound === "true") return;
    btn.dataset.bound = "true";
    btn.addEventListener("click", () => {
      setDarkMode(!isDarkMode());
      const profileCheckbox = document.getElementById("profileDarkMode");
      if (profileCheckbox) profileCheckbox.checked = isDarkMode();
    });
  }
  function populateLanguageDropdown() {
    const dropdown = document.getElementById("languageDropdown");
    if (!dropdown || dropdown.dataset.built === "true") return;
    dropdown.dataset.built = "true";
    dropdown.innerHTML = LANG_OPTIONS.map((lang) => `
        <li>
            <button type="button" class="language-option" role="option" data-lang="${lang.code}">
                ${lang.flag} ${lang.label} (${lang.short})
            </button>
        </li>
    `).join("");
  }
  function refreshShellAccessibility() {
    const menuBtn = document.getElementById("menuBtn");
    const langToggle = document.getElementById("languageSwitcherBtn");
    const bottomNav = document.querySelector(".bottom-nav");
    if (menuBtn) menuBtn.setAttribute("aria-label", t("a11y.menu"));
    if (langToggle) langToggle.setAttribute("aria-label", t("a11y.chooseLanguage"));
    if (bottomNav) bottomNav.setAttribute("aria-label", t("shell.label"));
    applyDarkMode(isDarkMode());
  }
  function initShellSettings() {
    const settings = getSettings();
    try {
      if (!localStorage.getItem("rs_lang") && settings.language) {
        setLanguage(settings.language);
      } else {
        initLanguage();
      }
    } catch (_) {
      initLanguage();
    }
    const current = getCurrentLanguage();
    if (settings.language !== current) {
      saveSettings({ language: current });
    }
    applyDarkMode(Boolean(settings.darkMode));
    populateLanguageDropdown();
    updateLanguageButtonLabel();
    refreshShellAccessibility();
    bindLanguageDropdown();
    bindDarkModeToggle();
    bindShellPlaceholders();
  }

  // js/views/clientPanel.js
  var FAVORITES_KEY = "regionalny_smak_favorites";
  var clientPanelUnsubscribe = null;
  function escapeHtml10(text) {
    return String(text != null ? text : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function getFavoriteIds2() {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list.map(String) : [];
    } catch (_) {
      return [];
    }
  }
  function getClientReviews(user) {
    var _a7, _b, _c;
    try {
      const raw = localStorage.getItem("rg_producer_reviews");
      const list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) return [];
      const name = (_a7 = user.displayName) == null ? void 0 : _a7.toLowerCase();
      const emailPrefix = (_c = (_b = user.email) == null ? void 0 : _b.split("@")[0]) == null ? void 0 : _c.toLowerCase();
      return list.filter((r) => {
        var _a8;
        const author = String(r.user || "").toLowerCase();
        return author === name || author === emailPrefix || author === ((_a8 = user.email) == null ? void 0 : _a8.toLowerCase());
      });
    } catch (_) {
      return [];
    }
  }
  function renderFavoritesList() {
    const ids = getFavoriteIds2();
    if (!ids.length) {
      return `<p class="account-empty">${escapeHtml10(t("clientPanel.noFavorites"))}</p>`;
    }
    return ids.map((id) => {
      const producer = getProducerById(id);
      const name = (producer == null ? void 0 : producer.name) || id;
      return `
            <div class="account-row" data-favorite-id="${escapeHtml10(id)}">
                <div class="account-row-info">
                    <div class="account-row-name">${escapeHtml10(name)}</div>
                </div>
                <button type="button" class="btn-remove-inline" data-remove-favorite="${escapeHtml10(id)}">${escapeHtml10(t("btn.remove"))}</button>
            </div>
        `;
    }).join("");
  }
  function renderCartList() {
    const items = getCartItems();
    if (!items.length) {
      return `<p class="account-empty">${escapeHtml10(t("clientPanel.noCart"))}</p>`;
    }
    return items.map((item) => `
        <div class="account-row" data-cart-id="${escapeHtml10(item.id)}">
            <div class="account-row-info">
                <div class="account-row-name">${escapeHtml10(item.name || t("cart.product"))}</div>
                <div class="account-row-meta">${escapeHtml10(item.place || "")} \xB7 ${escapeHtml10(formatCurrency((item.price || 0) * (item.quantity || 1)))}</div>
            </div>
            <button type="button" class="btn-remove-inline" data-remove-cart="${escapeHtml10(item.id)}">${escapeHtml10(t("btn.remove"))}</button>
        </div>
    `).join("");
  }
  function renderClientPanel(container) {
    const user = getCurrentUser();
    if (!user) return;
    const reviews = getClientReviews(user);
    container.innerHTML = `
        <section class="account-panel card">
            <h3 class="account-panel-title">${escapeHtml10(t("clientPanel.title"))}</h3>
            <p class="account-panel-sub">${escapeHtml10(t("clientPanel.subtitle"))}</p>

            <form id="clientProfileForm" class="account-form">
                <div class="account-field">
                    <label for="clientDisplayName">${escapeHtml10(t("clientPanel.name"))}</label>
                    <input id="clientDisplayName" name="displayName" type="text" value="${escapeHtml10(user.displayName)}" required>
                </div>
                <div class="account-field">
                    <label for="clientEmail">${escapeHtml10(t("auth.email"))}</label>
                    <input id="clientEmail" type="email" value="${escapeHtml10(user.email)}" disabled>
                </div>
                <button type="submit" class="btn-primary">${escapeHtml10(t("clientPanel.saveProfile"))}</button>
            </form>
        </section>

        <section class="account-panel card">
            <h3 class="account-panel-title">\u2764\uFE0F ${escapeHtml10(t("clientPanel.favoritesTitle"))}</h3>
            <div id="clientFavoritesList">${renderFavoritesList()}</div>
        </section>

        <section class="account-panel card">
            <h3 class="account-panel-title">\u{1F6D2} ${escapeHtml10(t("clientPanel.cartTitle"))}</h3>
            <div id="clientCartList">${renderCartList()}</div>
        </section>

        <section class="account-panel card">
            <h3 class="account-panel-title">${escapeHtml10(t("clientPanel.reviewsTitle"))}</h3>
            <p class="account-panel-sub">${escapeHtml10(t("clientPanel.reviewsHint"))}</p>
            ${reviews.length === 0 ? `<p class="account-empty">${escapeHtml10(t("clientPanel.noReviews"))}</p>` : `<ul class="account-list">${reviews.map((r) => `
                    <li class="client-review-item">
                        <strong>${escapeHtml10(r.user)}</strong> \xB7 ${"\u2605".repeat(r.rating)}${"\u2606".repeat(5 - r.rating)}
                        <p>${escapeHtml10(r.comment)}</p>
                        ${buildReviewImageHtml(r.imageUrl, "client-review-image")}
                    </li>
                `).join("")}</ul>`}
            <button type="button" class="btn-secondary" id="clientGoMapBtn">${escapeHtml10(t("clientPanel.findToReview"))}</button>
        </section>

        <section class="account-panel card">
            <h3 class="account-panel-title">\u{1F4E6} ${escapeHtml10(t("clientPanel.ordersTitle"))}</h3>
            <p class="account-empty">${escapeHtml10(t("clientPanel.ordersHint"))}</p>
        </section>

        <button type="button" id="clientLogoutBtn" class="btn-secondary account-logout">${escapeHtml10(t("auth.logout"))}</button>
    `;
    bindClientPanelEvents(container);
  }
  function refreshClientLists(container) {
    const favList = container.querySelector("#clientFavoritesList");
    const cartList = container.querySelector("#clientCartList");
    if (favList) favList.innerHTML = renderFavoritesList();
    if (cartList) cartList.innerHTML = renderCartList();
    bindClientListActions(container);
  }
  function bindClientListActions(container) {
    container.querySelectorAll("[data-remove-favorite]").forEach((btn) => {
      btn.replaceWith(btn.cloneNode(true));
    });
    container.querySelectorAll("[data-remove-cart]").forEach((btn) => {
      btn.replaceWith(btn.cloneNode(true));
    });
    container.querySelectorAll("[data-remove-favorite]").forEach((btn) => {
      btn.addEventListener("click", () => {
        removeFavorite(btn.dataset.removeFavorite);
        showToast(t("msg.removedFromFavorites"));
        refreshClientLists(container);
      });
    });
    container.querySelectorAll("[data-remove-cart]").forEach((btn) => {
      btn.addEventListener("click", () => {
        removeCartItem(btn.dataset.removeCart);
        refreshCartBadge();
        showToast(t("msg.removedFromCart"));
        refreshClientLists(container);
      });
    });
  }
  function bindClientPanelEvents(container) {
    var _a7, _b, _c;
    (_a7 = container.querySelector("#clientProfileForm")) == null ? void 0 : _a7.addEventListener("submit", (event) => {
      event.preventDefault();
      updateClientProfile({ displayName: event.currentTarget.displayName.value });
      showToast(t("clientPanel.saved"));
    });
    (_b = container.querySelector("#clientLogoutBtn")) == null ? void 0 : _b.addEventListener("click", () => {
      logout();
      showToast(t("auth.loggedOut"));
      navigateTo("profile", { force: true });
    });
    (_c = container.querySelector("#clientGoMapBtn")) == null ? void 0 : _c.addEventListener("click", () => {
      navigateTo("map");
    });
    bindClientListActions(container);
    if (clientPanelUnsubscribe) {
      clientPanelUnsubscribe();
      clientPanelUnsubscribe = null;
    }
    const onDataChange = () => {
      if (!container.isConnected) {
        clientPanelUnsubscribe == null ? void 0 : clientPanelUnsubscribe();
        clientPanelUnsubscribe = null;
        return;
      }
      refreshClientLists(container);
    };
    const unsubFav = eventBus.on(EVENTS.FAVORITES_CHANGED, onDataChange);
    const unsubCart = eventBus.on(EVENTS.CART_CHANGED, onDataChange);
    clientPanelUnsubscribe = () => {
      unsubFav();
      unsubCart();
    };
  }

  // js/views/producerPanel.js
  function escapeHtml11(text) {
    return String(text != null ? text : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function loadAccount(userId) {
    var _a7, _b;
    const coords = getLastPosition();
    return getProducerAccount(userId) || {
      profile: {
        name: "",
        description: "",
        address: "",
        phone: "",
        email: "",
        categories: ["farmer"],
        lat: (_a7 = coords == null ? void 0 : coords.lat) != null ? _a7 : null,
        lng: (_b = coords == null ? void 0 : coords.lng) != null ? _b : null
      },
      products: [],
      promotions: [],
      photos: []
    };
  }
  function categoryLabel2(id) {
    const text = t(`producer.types.${id}`);
    return text === `producer.types.${id}` ? id : text;
  }
  function renderProfileSection(account) {
    const p = account.profile;
    const selected = new Set(p.categories || []);
    return `
        <form id="producerProfileForm" class="account-form">
            <div class="account-field">
                <label for="producerName">${escapeHtml11(t("producerPanel.name"))}</label>
                <input id="producerName" name="name" type="text" value="${escapeHtml11(p.name)}" required>
            </div>
            <div class="account-field">
                <label for="producerDescription">${escapeHtml11(t("producerPanel.description"))}</label>
                <textarea id="producerDescription" name="description" rows="3">${escapeHtml11(p.description)}</textarea>
            </div>
            <div class="account-field">
                <label for="producerAddress">${escapeHtml11(t("producerPanel.address"))}</label>
                <input id="producerAddress" name="address" type="text" value="${escapeHtml11(p.address)}">
            </div>
            <div class="account-field">
                <label for="producerPhone">${escapeHtml11(t("producerPanel.phone"))}</label>
                <input id="producerPhone" name="phone" type="tel" value="${escapeHtml11(p.phone)}">
            </div>
            <div class="account-field">
                <label for="producerEmail">${escapeHtml11(t("producerPanel.email"))}</label>
                <input id="producerEmail" name="email" type="email" value="${escapeHtml11(p.email)}">
            </div>
            <fieldset class="account-field">
                <legend>${escapeHtml11(t("producerPanel.categories"))}</legend>
                <div class="account-checkboxes">
                    ${PRODUCER_CATEGORIES.map((cat) => `
                        <label class="account-check">
                            <input type="checkbox" name="categories" value="${cat.id}" ${selected.has(cat.id) ? "checked" : ""}>
                            ${escapeHtml11(categoryLabel2(cat.id))}
                        </label>
                    `).join("")}
                </div>
            </fieldset>
            <div class="account-grid-2">
                <div class="account-field">
                    <label for="producerLat">${escapeHtml11(t("producerPanel.lat"))}</label>
                    <input id="producerLat" name="lat" type="number" step="0.0001" value="${escapeHtml11(p.lat)}">
                </div>
                <div class="account-field">
                    <label for="producerLng">${escapeHtml11(t("producerPanel.lng"))}</label>
                    <input id="producerLng" name="lng" type="number" step="0.0001" value="${escapeHtml11(p.lng)}">
                </div>
            </div>
            <button type="submit" class="btn-primary">${escapeHtml11(t("producerPanel.saveProfile"))}</button>
        </form>
    `;
  }
  function renderProductsSection(account) {
    const products = account.products || [];
    return `
        <div class="account-list-header">
            <h4>${escapeHtml11(t("producerPanel.productsTitle"))}</h4>
            <button type="button" class="btn-secondary" id="producerAddProductBtn">+ ${escapeHtml11(t("producerPanel.addProduct"))}</button>
        </div>
        <div id="producerProductsList" class="account-items">
            ${products.length === 0 ? `<p class="account-empty">${escapeHtml11(t("producerPanel.noProducts"))}</p>` : products.map((product, index) => renderProductEditor(product, index)).join("")}
        </div>
        <button type="button" id="producerSaveProductsBtn" class="btn-primary">${escapeHtml11(t("producerPanel.saveProducts"))}</button>
    `;
  }
  function renderProductEditor(product, index) {
    return `
        <div class="account-item card" data-product-index="${index}">
            <div class="account-grid-2">
                <div class="account-field">
                    <label>${escapeHtml11(t("producerPanel.productName"))}</label>
                    <input type="text" data-field="name" value="${escapeHtml11(product.name)}">
                </div>
                <div class="account-field">
                    <label>${escapeHtml11(t("producerPanel.price"))}</label>
                    <input type="number" step="0.01" min="0" data-field="price" value="${escapeHtml11(product.price)}">
                </div>
            </div>
            <div class="account-grid-2">
                <div class="account-field">
                    <label>${escapeHtml11(t("producerPanel.unit"))}</label>
                    <input type="text" data-field="unit" value="${escapeHtml11(product.unit)}">
                </div>
                <div class="account-field">
                    <label>${escapeHtml11(t("producerPanel.promo"))}</label>
                    <input type="text" data-field="promo" value="${escapeHtml11(product.promo)}">
                </div>
            </div>
            <div class="account-field">
                <label>${escapeHtml11(t("producerPanel.productDescription"))}</label>
                <textarea rows="2" data-field="description">${escapeHtml11(product.description)}</textarea>
            </div>
            <div class="account-field">
                <label>${escapeHtml11(t("producerPanel.imageUrl"))}</label>
                <input type="url" data-field="imageUrl" value="${escapeHtml11(product.imageUrl)}" placeholder="https://">
            </div>
            <button type="button" class="btn-secondary account-remove-btn" data-remove-product="${index}">${escapeHtml11(t("btn.remove"))}</button>
        </div>
    `;
  }
  function renderPromotionEditor(promo, index, products) {
    const productOptions = [
      `<option value="">${escapeHtml11(t("producerPanel.noProductSelected"))}</option>`,
      ...products.map((product) => `
            <option value="${escapeHtml11(product.id)}" ${promo.productId === product.id ? "selected" : ""}>
                ${escapeHtml11(product.name || product.id)}
            </option>
        `)
    ].join("");
    return `
        <div class="account-item card" data-promo-index="${index}">
            <div class="account-field">
                <label>${escapeHtml11(t("producerPanel.promoTitle"))}</label>
                <input type="text" data-promo-field="title" value="${escapeHtml11(promo.title)}">
            </div>
            <div class="account-field">
                <label>${escapeHtml11(t("producerPanel.promoDescription"))}</label>
                <textarea rows="2" data-promo-field="description">${escapeHtml11(promo.description)}</textarea>
            </div>
            <div class="account-grid-2">
                <div class="account-field">
                    <label>${escapeHtml11(t("producerPanel.promoProduct"))}</label>
                    <select data-promo-field="productId">${productOptions}</select>
                </div>
                <div class="account-field">
                    <label>${escapeHtml11(t("producerPanel.discount"))}</label>
                    <input type="text" data-promo-field="discount" value="${escapeHtml11(promo.discount)}" placeholder="10%">
                </div>
            </div>
            <button type="button" class="btn-secondary account-remove-btn" data-remove-promo="${index}">${escapeHtml11(t("btn.remove"))}</button>
        </div>
    `;
  }
  function renderPromotionsSection(account) {
    const promotions = account.promotions || [];
    const products = account.products || [];
    return `
        <div class="account-list-header">
            <h4>${escapeHtml11(t("producerPanel.promotionsTitle"))}</h4>
            <button type="button" class="btn-secondary" id="producerAddPromoBtn">+ ${escapeHtml11(t("producerPanel.addPromotion"))}</button>
        </div>
        <div id="producerPromotionsList" class="account-items">
            ${promotions.length === 0 ? `<p class="account-empty">${escapeHtml11(t("producerPanel.noPromotions"))}</p>` : promotions.map((promo, index) => renderPromotionEditor(promo, index, products)).join("")}
        </div>
        <button type="button" id="producerSavePromosBtn" class="btn-primary">${escapeHtml11(t("producerPanel.savePromotions"))}</button>
    `;
  }
  function renderPhotosSection(account) {
    const photos = account.photos || [];
    return `
        <div class="account-list-header">
            <h4>${escapeHtml11(t("producerPanel.photosTitle"))}</h4>
        </div>
        <form id="producerPhotoForm" class="account-form account-inline-form">
            <div class="account-field">
                <label for="producerPhotoUrl">${escapeHtml11(t("producerPanel.photoUrl"))}</label>
                <input id="producerPhotoUrl" type="url" placeholder="https://" required>
            </div>
            <button type="submit" class="btn-secondary">${escapeHtml11(t("producerPanel.addPhoto"))}</button>
        </form>
        <ul id="producerPhotosList" class="account-list">
            ${photos.length === 0 ? `<li class="account-empty">${escapeHtml11(t("producerPanel.noPhotos"))}</li>` : photos.map((url, index) => `
                <li class="account-photo-item">
                    <img src="${escapeHtml11(url)}" alt="" loading="lazy" width="72" height="72">
                    <span>${escapeHtml11(url)}</span>
                    <button type="button" class="btn-secondary" data-remove-photo="${index}">${escapeHtml11(t("btn.remove"))}</button>
                </li>
            `).join("")}
        </ul>
    `;
  }
  function renderProducerPanel(container) {
    const user = getCurrentUser();
    if (!user) return;
    let account = loadAccount(user.id);
    container.innerHTML = `
        <section class="account-panel card">
            <h3 class="account-panel-title">${escapeHtml11(t("producerPanel.title"))}</h3>
            <p class="account-panel-sub">${escapeHtml11(t("producerPanel.subtitle"))}</p>
            <p class="auth-trial-note">${escapeHtml11(t("auth.trialNote"))}</p>
            <div class="account-tabs" role="tablist">
                <button type="button" class="account-tab is-active" data-tab="profile">${escapeHtml11(t("producerPanel.tabProfile"))}</button>
                <button type="button" class="account-tab" data-tab="products">${escapeHtml11(t("producerPanel.tabProducts"))}</button>
                <button type="button" class="account-tab" data-tab="promotions">${escapeHtml11(t("producerPanel.tabPromotions"))}</button>
                <button type="button" class="account-tab" data-tab="photos">${escapeHtml11(t("producerPanel.tabPhotos"))}</button>
                <button type="button" class="account-tab" data-tab="stats">${escapeHtml11(t("producerPanel.tabStats"))}</button>
            </div>
        </section>

        <section class="account-panel card" id="producerTabProfile">${renderProfileSection(account)}</section>
        <section class="account-panel card" id="producerTabProducts" hidden>${renderProductsSection(account)}</section>
        <section class="account-panel card" id="producerTabPromotions" hidden>${renderPromotionsSection(account)}</section>
        <section class="account-panel card" id="producerTabPhotos" hidden>${renderPhotosSection(account)}</section>
        <section class="account-panel card" id="producerTabStats" hidden>
            <h4>${escapeHtml11(t("producerPanel.statsTitle"))}</h4>
            <p class="account-empty">${escapeHtml11(t("producerPanel.statsHint"))}</p>
        </section>

        <div class="account-actions">
            <button type="button" id="producerViewMapBtn" class="btn-secondary">${escapeHtml11(t("producerPanel.viewOnMap"))}</button>
            <button type="button" id="producerLogoutBtn" class="btn-secondary account-logout">${escapeHtml11(t("auth.logout"))}</button>
        </div>
    `;
    bindProducerPanelEvents(container, user.id, account);
  }
  function bindProducerPanelEvents(container, userId, account) {
    var _a7, _b, _c, _d, _e, _f, _g, _h;
    const getAccount = () => loadAccount(userId);
    container.querySelectorAll(".account-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const id = tab.dataset.tab;
        container.querySelectorAll(".account-tab").forEach((t2) => t2.classList.toggle("is-active", t2 === tab));
        ["profile", "products", "promotions", "photos", "stats"].forEach((name) => {
          const panel = container.querySelector(`#producerTab${name.charAt(0).toUpperCase()}${name.slice(1)}`);
          if (panel) panel.hidden = name !== id;
        });
      });
    });
    (_a7 = container.querySelector("#producerProfileForm")) == null ? void 0 : _a7.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const current = getAccount();
      const categories = Array.from(form.querySelectorAll('input[name="categories"]:checked')).map((el) => el.value);
      current.profile = __spreadProps(__spreadValues({}, current.profile), {
        name: form.name.value.trim(),
        description: form.description.value.trim(),
        address: form.address.value.trim(),
        phone: form.phone.value.trim(),
        email: form.email.value.trim(),
        categories: categories.length ? categories : ["farmer"],
        lat: Number(form.lat.value) || current.profile.lat,
        lng: Number(form.lng.value) || current.profile.lng
      });
      saveProducerAccount(userId, current);
      refreshUserProducersOnMap();
      showToast(t("producerPanel.saved"));
    });
    (_b = container.querySelector("#producerAddProductBtn")) == null ? void 0 : _b.addEventListener("click", () => {
      const current = getAccount();
      current.products.push(createProduct());
      saveProducerAccount(userId, current);
      renderProducerPanel(container);
    });
    (_c = container.querySelector("#producerSaveProductsBtn")) == null ? void 0 : _c.addEventListener("click", () => {
      const current = getAccount();
      const items = container.querySelectorAll("[data-product-index]");
      current.products = Array.from(items).map((item, index) => {
        const base = current.products[index] || createProduct();
        const read = (field) => {
          var _a8, _b2;
          return (_b2 = (_a8 = item.querySelector(`[data-field="${field}"]`)) == null ? void 0 : _a8.value) != null ? _b2 : "";
        };
        return __spreadProps(__spreadValues({}, base), {
          name: read("name").trim(),
          price: Number(read("price")) || 0,
          unit: read("unit").trim(),
          promo: read("promo").trim(),
          description: read("description").trim(),
          imageUrl: read("imageUrl").trim()
        });
      }).filter((p) => p.name);
      saveProducerAccount(userId, current);
      refreshUserProducersOnMap();
      showToast(t("producerPanel.productsSaved"));
    });
    container.querySelectorAll("[data-remove-product]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const current = getAccount();
        current.products.splice(Number(btn.dataset.removeProduct), 1);
        saveProducerAccount(userId, current);
        renderProducerPanel(container);
      });
    });
    (_d = container.querySelector("#producerAddPromoBtn")) == null ? void 0 : _d.addEventListener("click", () => {
      const current = getAccount();
      current.promotions.push(createPromotion());
      saveProducerAccount(userId, current);
      renderProducerPanel(container);
    });
    (_e = container.querySelector("#producerSavePromosBtn")) == null ? void 0 : _e.addEventListener("click", () => {
      const current = getAccount();
      const items = container.querySelectorAll("[data-promo-index]");
      current.promotions = Array.from(items).map((item, index) => {
        const base = current.promotions[index] || createPromotion();
        const read = (field) => {
          var _a8, _b2;
          return (_b2 = (_a8 = item.querySelector(`[data-promo-field="${field}"]`)) == null ? void 0 : _a8.value) != null ? _b2 : "";
        };
        return __spreadProps(__spreadValues({}, base), {
          title: read("title").trim(),
          description: read("description").trim(),
          productId: read("productId").trim(),
          discount: read("discount").trim()
        });
      }).filter((p) => p.title);
      saveProducerAccount(userId, current);
      refreshUserProducersOnMap();
      showToast(t("producerPanel.promotionsSaved"));
    });
    container.querySelectorAll("[data-remove-promo]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const current = getAccount();
        current.promotions.splice(Number(btn.dataset.removePromo), 1);
        saveProducerAccount(userId, current);
        renderProducerPanel(container);
      });
    });
    (_f = container.querySelector("#producerPhotoForm")) == null ? void 0 : _f.addEventListener("submit", (event) => {
      var _a8;
      event.preventDefault();
      const input = container.querySelector("#producerPhotoUrl");
      const url = (_a8 = input == null ? void 0 : input.value) == null ? void 0 : _a8.trim();
      if (!url) return;
      const current = getAccount();
      current.photos.push(url);
      saveProducerAccount(userId, current);
      refreshUserProducersOnMap();
      renderProducerPanel(container);
    });
    container.querySelectorAll("[data-remove-photo]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const current = getAccount();
        current.photos.splice(Number(btn.dataset.removePhoto), 1);
        saveProducerAccount(userId, current);
        refreshUserProducersOnMap();
        renderProducerPanel(container);
      });
    });
    (_g = container.querySelector("#producerViewMapBtn")) == null ? void 0 : _g.addEventListener("click", () => {
      navigateTo("map", { force: true });
    });
    (_h = container.querySelector("#producerLogoutBtn")) == null ? void 0 : _h.addEventListener("click", () => {
      logout();
      showToast(t("auth.loggedOut"));
      navigateTo("profile", { force: true });
    });
  }

  // js/core/pushNotifications.js
  var SUBSCRIPTION_KEY = "rg_push_subscription";
  var SNAPSHOT_KEY = "rg_push_content_snapshot";
  var pollTimer = null;
  var placesDebounce = null;
  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64);
    const output = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) {
      output[i] = raw.charCodeAt(i);
    }
    return output;
  }
  function getStoredSubscription() {
    try {
      const raw = localStorage.getItem(SUBSCRIPTION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }
  function saveSubscription(subscription) {
    localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
  }
  function clearStoredSubscription() {
    localStorage.removeItem(SUBSCRIPTION_KEY);
  }
  function readSnapshot() {
    try {
      const raw = localStorage.getItem(SNAPSHOT_KEY);
      const data = raw ? JSON.parse(raw) : null;
      return Array.isArray(data == null ? void 0 : data.keys) ? new Set(data.keys) : null;
    } catch (_) {
      return null;
    }
  }
  function writeSnapshot(keys) {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify({
      keys: [...keys],
      updatedAt: Date.now()
    }));
  }
  function collectOfferKeys(producers) {
    const keys = /* @__PURE__ */ new Set();
    for (const producer of producers || []) {
      const producerId = String(producer.id);
      const producerName = producer.name || producerId;
      for (const product of producer.products || []) {
        const productId = product.id || product.name;
        if (!productId) continue;
        keys.add(JSON.stringify({
          type: "product",
          producerId,
          itemId: String(productId),
          producerName,
          itemLabel: product.name || String(productId)
        }));
      }
      for (const promo of producer.promotions || []) {
        const promoId = promo.id || promo.title;
        if (!promoId) continue;
        keys.add(JSON.stringify({
          type: "promotion",
          producerId,
          itemId: String(promoId),
          producerName,
          itemLabel: promo.title || String(promoId)
        }));
      }
    }
    return keys;
  }
  function parseOfferKey(key) {
    try {
      return JSON.parse(key);
    } catch (_) {
      return { type: "offer", producerName: "", itemLabel: "" };
    }
  }
  function isPushConfigured() {
    return getSettings().notifications !== false;
  }
  function getServiceWorkerRegistration() {
    return __async(this, null, function* () {
      if (!("serviceWorker" in navigator)) return null;
      try {
        return yield navigator.serviceWorker.ready;
      } catch (_) {
        return null;
      }
    });
  }
  function showNotification(_0) {
    return __async(this, arguments, function* ({ title, body, tag, url }) {
      const registration = yield getServiceWorkerRegistration();
      if (registration == null ? void 0 : registration.active) {
        registration.active.postMessage({
          type: "SHOW_NOTIFICATION",
          title,
          body,
          tag,
          url: url || "/?view=map"
        });
        return true;
      }
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/assets/icons/icon-192.png",
          tag
        });
        return true;
      }
      return false;
    });
  }
  function subscribeToPush() {
    return __async(this, null, function* () {
      if (!("Notification" in window)) {
        return { ok: false, reason: "unsupported" };
      }
      const permission = yield Notification.requestPermission();
      if (permission !== "granted") {
        return { ok: false, reason: "denied" };
      }
      const registration = yield getServiceWorkerRegistration();
      if (!registration) {
        return { ok: false, reason: "no-sw" };
      }
      let subscription = null;
      if ("pushManager" in registration) {
        try {
          const existing = yield registration.pushManager.getSubscription();
          if (existing) {
            subscription = existing;
          } else if (PUSH_VAPID_PUBLIC_KEY) {
            subscription = yield registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(PUSH_VAPID_PUBLIC_KEY)
            });
          }
        } catch (error) {
          console.warn("[Push] PushManager subscribe failed, using local mode:", error);
        }
      }
      const stored = subscription ? __spreadProps(__spreadValues({}, subscription.toJSON()), { mode: "push", savedAt: Date.now() }) : { mode: "local", permission: "granted", savedAt: Date.now() };
      saveSubscription(stored);
      writeSnapshot(collectOfferKeys(getProducers()));
      return { ok: true, subscription: stored };
    });
  }
  function unsubscribeFromPush() {
    return __async(this, null, function* () {
      const registration = yield getServiceWorkerRegistration();
      if (registration == null ? void 0 : registration.pushManager) {
        try {
          const sub = yield registration.pushManager.getSubscription();
          if (sub) yield sub.unsubscribe();
        } catch (error) {
          console.warn("[Push] unsubscribe failed:", error);
        }
      }
      clearStoredSubscription();
    });
  }
  function syncPushWithSettings(enabled) {
    return __async(this, null, function* () {
      if (!enabled) {
        stopPushPolling();
        yield unsubscribeFromPush();
        return true;
      }
      const result = yield subscribeToPush();
      if (!result.ok) {
        saveSettings({ notifications: false });
        return false;
      }
      startPushPolling();
      return true;
    });
  }
  function formatMessage(key, vars = {}) {
    let text = t(key);
    Object.entries(vars).forEach(([name, value]) => {
      text = text.replace(new RegExp(`\\{${name}\\}`, "g"), String(value != null ? value : ""));
    });
    return text;
  }
  function checkForNewOffers({ forceBaseline = false } = {}) {
    if (!isPushConfigured()) return { notified: 0 };
    if (typeof Notification === "undefined" || Notification.permission !== "granted") {
      return { notified: 0 };
    }
    if (!getStoredSubscription()) return { notified: 0 };
    const producers = getProducers();
    const currentKeys = collectOfferKeys(producers);
    const previousKeys = readSnapshot();
    if (!previousKeys || forceBaseline) {
      writeSnapshot(currentKeys);
      return { notified: 0, baselined: true };
    }
    const newKeys = [...currentKeys].filter((key) => !previousKeys.has(key));
    let notified = 0;
    for (const key of newKeys) {
      const { type, producerName, itemLabel } = parseOfferKey(key);
      let title = t("push.title");
      let body = "";
      if (type === "product") {
        body = formatMessage("push.newProduct", { name: itemLabel, producer: producerName });
      } else if (type === "promotion") {
        body = formatMessage("push.newPromotion", { title: itemLabel, producer: producerName });
      } else {
        body = formatMessage("push.newOffer", { producer: producerName });
      }
      showNotification({
        title,
        body,
        tag: key,
        url: "/?view=map"
      });
      notified += 1;
    }
    writeSnapshot(currentKeys);
    return { notified };
  }
  function startPushPolling() {
    stopPushPolling();
    if (!isPushConfigured() || !getStoredSubscription()) return;
    pollTimer = window.setInterval(() => {
      checkForNewOffers();
    }, PUSH_POLL_INTERVAL_MS);
  }
  function stopPushPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    if (placesDebounce) {
      clearTimeout(placesDebounce);
      placesDebounce = null;
    }
  }
  function bindPlacesUpdates() {
    const scheduleCheck = () => {
      if (!isPushConfigured() || !getStoredSubscription()) return;
      if (placesDebounce) clearTimeout(placesDebounce);
      placesDebounce = window.setTimeout(() => {
        checkForNewOffers();
      }, 2e3);
    };
    eventBus2.on(EVENTS2.PLACES_LOADED, scheduleCheck);
    eventBus2.on(EVENTS2.PLACES_CHANGED, scheduleCheck);
  }
  function bindServiceWorkerMessages() {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.addEventListener("message", (event) => {
      var _a7;
      if (((_a7 = event.data) == null ? void 0 : _a7.type) === "OPEN_VIEW" && event.data.url) {
        const url = new URL(event.data.url, window.location.origin);
        const view = url.searchParams.get("view");
        if (view && typeof window.navigateTo === "function") {
          window.navigateTo(view);
        }
      }
    });
  }
  function initPushNotifications() {
    return __async(this, null, function* () {
      bindPlacesUpdates();
      bindServiceWorkerMessages();
      if (!isPushConfigured()) return;
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        if (!getStoredSubscription()) {
          yield subscribeToPush();
        }
        startPushPolling();
        return;
      }
      if (getStoredSubscription() && Notification.permission !== "granted") {
        clearStoredSubscription();
        saveSettings({ notifications: false });
      }
    });
  }
  function checkPushOffersNow() {
    return checkForNewOffers();
  }

  // js/core/pwaInstall.js
  var deferredPrompt = null;
  function captureInstallPrompt(event) {
    if (!event) return;
    event.preventDefault();
    deferredPrompt = event;
    if (typeof window !== "undefined") {
      window.__deferredPwaPrompt = event;
    }
    refreshPwaInstallUi();
  }
  if (typeof window !== "undefined") {
    if (window.__deferredPwaPrompt) {
      deferredPrompt = window.__deferredPwaPrompt;
    }
    window.addEventListener("beforeinstallprompt", captureInstallPrompt);
  }
  function isPwaInstalled() {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }
  function canInstallPwa() {
    return Boolean(deferredPrompt) && !isPwaInstalled();
  }
  function getInstallButtons() {
    return [
      document.getElementById("pwaInstallMenuBtn"),
      document.getElementById("pwaInstallProfileBtn")
    ].filter(Boolean);
  }
  function getInstallContainers() {
    return [
      document.getElementById("pwaInstallProfileCard")
    ].filter(Boolean);
  }
  function updateInstallButtonsVisibility() {
    const visible = canInstallPwa();
    getInstallButtons().forEach((btn) => {
      btn.hidden = !visible;
      btn.disabled = !visible;
    });
    getInstallContainers().forEach((container) => {
      container.hidden = !visible;
    });
  }
  function refreshInstallLabels() {
    getInstallButtons().forEach((btn) => {
      const label = btn.querySelector("[data-pwa-install-label]");
      if (label) label.textContent = t("pwa.install");
      btn.setAttribute("aria-label", t("pwa.install"));
    });
  }
  function promptPwaInstall() {
    return __async(this, null, function* () {
      if (!deferredPrompt) return false;
      deferredPrompt.prompt();
      const { outcome } = yield deferredPrompt.userChoice;
      deferredPrompt = null;
      if (typeof window !== "undefined") {
        window.__deferredPwaPrompt = null;
      }
      updateInstallButtonsVisibility();
      if (outcome === "accepted") {
        showToast(t("pwa.installed"));
        return true;
      }
      showToast(t("pwa.dismissed"));
      return false;
    });
  }
  function bindInstallButtons() {
    getInstallButtons().forEach((btn) => {
      if (btn.dataset.bound === "true") return;
      btn.dataset.bound = "true";
      btn.addEventListener("click", (event) => __async(null, null, function* () {
        event.preventDefault();
        yield promptPwaInstall();
      }));
    });
  }
  function refreshPwaInstallUi() {
    bindInstallButtons();
    refreshInstallLabels();
    updateInstallButtonsVisibility();
  }
  function initPwaInstall() {
    if (!("serviceWorker" in navigator)) return;
    if (window.__deferredPwaPrompt && !deferredPrompt) {
      deferredPrompt = window.__deferredPwaPrompt;
    }
    window.addEventListener("appinstalled", () => {
      deferredPrompt = null;
      window.__deferredPwaPrompt = null;
      refreshPwaInstallUi();
      showToast(t("pwa.installed"));
    });
    refreshPwaInstallUi();
    eventBus2.on(EVENTS2.LANGUAGE_CHANGED, () => {
      refreshInstallLabels();
    });
  }

  // js/views/profile.js
  function escapeHtml12(text) {
    return String(text != null ? text : "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function renderProfile(container) {
    if (!container) return;
    injectStyles3();
    render3(container);
    bindEvents3(container);
  }
  function injectStyles3() {
    if (document.getElementById("profile-view-styles")) return;
    const style = document.createElement("style");
    style.id = "profile-view-styles";
    style.textContent = `
        .profile-page { display: flex; flex-direction: column; gap: var(--space-xl); }
        .profile-card { padding: var(--space-xl); }
        .profile-card-center { text-align: center; }
        .profile-avatar { font-size: 48px; display: block; margin-bottom: var(--space-sm); }
        .profile-card h3 { font-size: var(--text-lg); margin: 0 0 var(--space-xs); }
        .profile-sub { font-size: var(--text-sm); color: var(--text-muted); margin: 0 0 var(--space-md); }
        .profile-auth-paths { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
        .profile-path-actions { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
        .profile-settings-title { margin: 0 0 var(--space-sm); font-size: var(--text-md); color: var(--color-primary); }
        .profile-settings { display: flex; flex-direction: column; gap: var(--space-md); }
        .setting-item { display: flex; align-items: center; justify-content: space-between; gap: var(--space-md); padding: var(--space-md) var(--space-lg); }
        .setting-label { display: flex; align-items: center; justify-content: space-between; gap: var(--space-md); width: 100%; font-weight: 500; cursor: pointer; }
        .setting-item select { min-height: 40px; padding: var(--space-sm) var(--space-md); border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-card); color: var(--color-text); }
        .switch { position: relative; display: inline-block; width: 50px; height: 28px; flex-shrink: 0; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; inset: 0; background: var(--color-border); border-radius: 34px; cursor: pointer; transition: 0.2s; }
        .slider::before { content: ''; position: absolute; height: 20px; width: 20px; left: 4px; bottom: 4px; background: white; border-radius: 50%; transition: 0.2s; }
        .switch input:checked + .slider { background: var(--color-primary); }
        .switch input:checked + .slider::before { transform: translateX(22px); }
        .profile-meta { font-size: var(--text-sm); color: var(--text-muted); text-align: center; }
        .profile-meta a { color: var(--color-accent); }
        .profile-account-wrap { display: flex; flex-direction: column; gap: var(--space-md); }
        .account-panel { padding: var(--space-lg); }
        .account-panel-title { margin: 0 0 4px; font-size: var(--text-lg); }
        .account-panel-sub { margin: 0 0 12px; color: var(--text-muted); font-size: var(--text-sm); }
        .account-form { display: flex; flex-direction: column; gap: 10px; }
        .account-field label, .account-field legend { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 4px; }
        .account-field input, .account-field textarea, .account-field select { width: 100%; min-height: 40px; padding: 8px 10px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font: inherit; background: var(--color-card); color: var(--color-text); box-sizing: border-box; }
        .account-field textarea { min-height: 72px; resize: vertical; }
        .account-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .account-checkboxes { display: flex; flex-wrap: wrap; gap: 8px 12px; }
        .account-check { display: flex; align-items: center; gap: 6px; font-size: 0.9rem; }
        .account-tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
        .account-tab { border: 1px solid var(--color-border); background: var(--color-card); border-radius: var(--radius-sm); padding: 8px 10px; font: inherit; font-size: 0.85rem; cursor: pointer; }
        .account-tab.is-active { background: rgba(69,102,150,0.12); border-color: var(--color-primary); color: var(--color-primary); font-weight: 600; }
        .account-list-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
        .account-list-header h4 { margin: 0; }
        .account-items { display: flex; flex-direction: column; gap: 10px; }
        .account-item { padding: 12px; }
        .account-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--color-border); }
        .account-row:last-child { border-bottom: none; }
        .account-row-info { flex: 1; min-width: 0; }
        .account-row-name { font-weight: 600; }
        .account-row-meta { font-size: 0.85rem; color: var(--text-muted); }
        .account-empty { color: var(--text-muted); font-size: 0.9rem; }
        .account-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
        .account-actions { display: flex; flex-wrap: wrap; gap: 8px; }
        .account-logout { width: 100%; }
        .account-photo-item { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .account-photo-item img { object-fit: cover; border-radius: 8px; border: 1px solid var(--color-border); }
        .account-inline-form { flex-direction: row; align-items: flex-end; flex-wrap: wrap; }
        .account-remove-btn { margin-top: 4px; }
        .btn-secondary { min-height: 44px; padding: 10px 14px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-card); color: var(--color-text); font: inherit; font-weight: 600; cursor: pointer; }
        .btn-remove-inline { min-height: 36px; padding: 6px 10px; font-size: 0.85rem; color: var(--color-error, #b42318); border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: transparent; cursor: pointer; }
        .profile-install-btn { width: 100%; }
        .profile-install-hint { margin: 8px 0 0; text-align: center; }
        @media (max-width: 600px) { .profile-auth-paths { grid-template-columns: 1fr; } .account-grid-2 { grid-template-columns: 1fr; } }
    `;
    document.head.appendChild(style);
  }
  function renderGuestPaths() {
    return `
        <div class="profile-auth-paths">
            <article class="profile-card card">
                <span class="profile-avatar" aria-hidden="true">\u{1F6CD}\uFE0F</span>
                <h3>${escapeHtml12(t("profile.consumerSection"))}</h3>
                <p class="profile-sub">${escapeHtml12(t("profile.consumerDesc"))}</p>
                <div class="profile-path-actions">
                    <button type="button" class="btn-primary" data-login-type="client">${escapeHtml12(t("profile.loginAsConsumer"))}</button>
                    <button type="button" class="btn-secondary" data-register-type="client">${escapeHtml12(t("profile.registerAsConsumer"))}</button>
                </div>
            </article>
            <article class="profile-card card">
                <span class="profile-avatar" aria-hidden="true">\u{1F3EA}</span>
                <h3>${escapeHtml12(t("profile.producerSection"))}</h3>
                <p class="profile-sub">${escapeHtml12(t("profile.producerDesc"))}</p>
                <div class="profile-path-actions">
                    <button type="button" class="btn-primary" data-login-type="producer">${escapeHtml12(t("profile.loginAsProducer"))}</button>
                    <button type="button" class="btn-secondary" data-register-type="producer">${escapeHtml12(t("profile.registerAsProducer"))}</button>
                </div>
            </article>
        </div>
    `;
  }
  function renderLoggedInCard(user) {
    const typeLabel = user.accountType === "producer" ? t("profile.accountProducer") : t("profile.accountClient");
    const icon = user.accountType === "producer" ? "\u{1F3EA}" : "\u{1F6CD}\uFE0F";
    return `
        <div class="profile-card card profile-card-center">
            <span class="profile-avatar" aria-hidden="true">${icon}</span>
            <h3>${escapeHtml12(user.displayName)}</h3>
            <p class="profile-sub">${escapeHtml12(t("profile.loggedInAs"))} ${escapeHtml12(user.email)}<br>${escapeHtml12(typeLabel)}</p>
        </div>
    `;
  }
  function renderSettingsSection(darkMode, notifications, language) {
    return `
        <section class="profile-settings">
            <h3 class="profile-settings-title">${escapeHtml12(t("profile.settingsTitle"))}</h3>
            <div class="setting-item card profile-install-card" id="pwaInstallProfileCard" hidden>
                <button type="button" id="pwaInstallProfileBtn" class="btn-primary profile-install-btn">
                    <span data-pwa-install-label>\u2B07\uFE0F ${escapeHtml12(t("pwa.install"))}</span>
                </button>
                <p class="profile-sub profile-install-hint">${escapeHtml12(t("pwa.installHint"))}</p>
            </div>
            <div class="setting-item card">
                <label class="setting-label" for="profileDarkMode">
                    <span id="profileDarkModeLabel">\u{1F319} ${t("profile.darkMode")}</span>
                    <span class="switch">
                        <input type="checkbox" id="profileDarkMode" aria-labelledby="profileDarkModeLabel" ${darkMode ? "checked" : ""}>
                        <span class="slider"></span>
                    </span>
                </label>
            </div>
            <div class="setting-item card">
                <label class="setting-label" for="profileNotifications">
                    <span id="profileNotificationsLabel">\u{1F514} ${t("profile.notifications")}</span>
                    <span class="switch">
                        <input type="checkbox" id="profileNotifications" aria-labelledby="profileNotificationsLabel" ${notifications ? "checked" : ""}>
                        <span class="slider"></span>
                    </span>
                </label>
            </div>
            <div class="setting-item card">
                <label class="setting-label" for="profileLanguage">
                    <span id="profileLanguageLabel">\u{1F30D} ${t("profile.language")}</span>
                    <select id="profileLanguage" aria-labelledby="profileLanguageLabel">
                    ${LANG_OPTIONS.map((lang) => `
                        <option value="${lang.code}" ${lang.code === language ? "selected" : ""}>${lang.flag} ${lang.label} (${lang.short})</option>
                    `).join("")}
                    </select>
                </label>
            </div>
        </section>
    `;
  }
  function render3(container) {
    const settings = getSettings();
    const darkMode = isDarkMode();
    const notifications = settings.notifications !== false;
    const language = getCurrentLanguage();
    const user = getCurrentUser();
    container.innerHTML = `
        <div class="profile-page">
            <header class="view-hero">
                <h2>\u{1F464} ${t("profile.title")}</h2>
                <p class="text-muted">${t("profile.subtitle")}</p>
            </header>

            ${user ? renderLoggedInCard(user) : renderGuestPaths()}

            <div id="profileAccountPanel" class="profile-account-wrap"></div>

            ${renderSettingsSection(darkMode, notifications, language)}

            <div class="profile-meta surface-panel">
                <p>${APP_NAME} \xB7 v${APP_VERSION} (${APP_BUILD})</p>
                <p><a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
            </div>
        </div>
    `;
    const panelHost = container.querySelector("#profileAccountPanel");
    if (user && panelHost) {
      if (isProducer()) {
        renderProducerPanel(panelHost);
      } else {
        renderClientPanel(panelHost);
      }
    }
  }
  function bindEvents3(container) {
    var _a7, _b, _c, _d, _e;
    container.querySelectorAll("[data-login-type]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.loginType === "producer" ? ACCOUNT_TYPES.producer : ACCOUNT_TYPES.client;
        openLoginModal(type);
      });
    });
    container.querySelectorAll("[data-register-type]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.registerType === "producer" ? ACCOUNT_TYPES.producer : ACCOUNT_TYPES.client;
        openRegisterModal(type);
      });
    });
    (_a7 = container.querySelector("#profileLogoutBtn")) == null ? void 0 : _a7.addEventListener("click", () => {
      logout();
      showToast(t("auth.loggedOut"));
      renderProfile(container);
    });
    (_b = container.querySelector("#profileDarkMode")) == null ? void 0 : _b.addEventListener("change", (e) => {
      setDarkMode(e.target.checked);
    });
    (_c = container.querySelector("#profileNotifications")) == null ? void 0 : _c.addEventListener("change", (e) => __async(null, null, function* () {
      const enabled = e.target.checked;
      const ok = yield syncPushWithSettings(enabled);
      if (!ok) {
        e.target.checked = false;
        showToast(t("push.permissionDenied"));
        return;
      }
      saveSettings({ notifications: enabled });
      if (enabled) showToast(t("push.enabled"));
    }));
    (_d = container.querySelector("#profileLanguage")) == null ? void 0 : _d.addEventListener("change", (e) => {
      setAppLanguage(e.target.value);
    });
    (_e = container.querySelector("#pwaInstallProfileBtn")) == null ? void 0 : _e.addEventListener("click", () => __async(null, null, function* () {
      yield promptPwaInstall();
    }));
    refreshPwaInstallUi();
  }

  // js/controllers/navigation.js
  var VIEW_IDS = ["home", "map", "premium", "favorites", "cart", "profile"];
  var viewRenderers = {
    home: renderHome,
    map: renderMap,
    premium: renderPremium,
    favorites: renderFavorites,
    cart: renderCart,
    profile: renderProfile
  };
  var currentView = null;
  var appContainer = null;
  var isInitialized = false;
  function ensureViewPanels(container) {
    if (container.querySelector("[data-view-panel]")) return;
    container.innerHTML = VIEW_IDS.map((id) => `
        <div class="view-panel" data-view-panel="${id}" id="view-${id}" hidden></div>
    `).join("");
  }
  function getViewPanel(view) {
    return (appContainer == null ? void 0 : appContainer.querySelector(`[data-view-panel="${view}"]`)) || null;
  }
  function hideAllViews() {
    if (!appContainer) return;
    appContainer.querySelectorAll("[data-view-panel]").forEach((panel) => {
      panel.hidden = true;
      panel.classList.remove("active");
    });
  }
  function showView(view) {
    const panel = getViewPanel(view);
    if (!panel) return null;
    panel.hidden = false;
    panel.classList.add("active");
    return panel;
  }
  function updateMapLayoutState(view) {
    document.body.classList.toggle("view-map-active", view === "map");
    VIEW_IDS.forEach((id) => {
      document.body.classList.toggle(`view-${id}-active`, view === id);
    });
  }
  function updateNavLabels() {
    document.querySelectorAll(".bottom-nav .nav-item[data-view]").forEach((item) => {
      const view = item.dataset.view;
      const label = item.querySelector(".nav-label");
      if (label && view) {
        const key = view === "premium" ? "premium" : view;
        label.textContent = t(`nav.${key}`);
      }
    });
    refreshFavoritesBadge();
    refreshCartBadge();
  }
  function updateActiveNavItem(view) {
    document.querySelectorAll(".bottom-nav .nav-item[data-view]").forEach((item) => {
      const isActive = item.dataset.view === view;
      item.classList.toggle("active", isActive);
      if (isActive) {
        item.setAttribute("aria-current", "page");
      } else {
        item.removeAttribute("aria-current");
      }
    });
  }
  function renderView(view, panel) {
    const renderer = viewRenderers[view];
    if (!renderer || !panel) return;
    try {
      renderer(panel);
    } catch (error) {
      console.error(`Navigation: b\u0142\u0105d renderowania "${view}"`, error);
      panel.innerHTML = `
            <div class="error-view">
                <h2>\u274C ${t("msg.error")}</h2>
                <p>${t("msg.viewError")}</p>
            </div>
        `;
    }
  }
  function navigateTo(view, options = {}) {
    if (!view || !viewRenderers[view]) {
      console.warn(`Navigation: nieznany widok "${view}"`);
      return;
    }
    if (!appContainer) {
      console.warn("Navigation: brak kontenera #app");
      return;
    }
    const previousView = currentView;
    const force = Boolean(options.force);
    if (view === currentView && !force) return;
    currentView = view;
    hideAllViews();
    const panel = showView(view);
    updateMapLayoutState(view);
    if (panel) {
      void panel.offsetHeight;
      renderView(view, panel);
    }
    updateActiveNavItem(view);
    updateNavLabels();
    eventBus2.emit(EVENTS2.VIEW_CHANGED, { view, previousView });
    eventBus2.emit(EVENTS2.NAVIGATE, { view, previousView });
    console.log(`Navigation: widok "${view}"`);
  }
  function bindNavButtons() {
    document.querySelectorAll(".bottom-nav .nav-item[data-view]").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        const view = btn.dataset.view;
        if (view === "map" && currentView !== "map") {
          resetCategoryFilter();
        }
        if (view) navigateTo(view);
      });
    });
  }
  function initNavigation(container) {
    if (isInitialized) return;
    appContainer = container;
    if (!appContainer) {
      console.warn("Navigation: brak kontenera #app");
      return;
    }
    ensureViewPanels(appContainer);
    eventBus2.on(EVENTS2.NAVIGATE, (payload) => {
      const view = typeof payload === "string" ? payload : payload == null ? void 0 : payload.view;
      if (view && view !== currentView) {
        navigateTo(view);
      }
    });
    navigateTo("home");
    isInitialized = true;
    console.log("Navigation: zainicjalizowany");
  }
  function getCurrentView() {
    return currentView;
  }

  // js/core/sideMenu.js
  var VIEWS = {
    main: "main",
    terms: "terms",
    privacy: "privacy",
    about: "about",
    guide: "guide",
    download: "download",
    qr: "qr",
    recommendations: "recommendations",
    contact: "contact",
    author: "author",
    cooperation: "cooperation",
    "report-bug": "report-bug"
  };
  var VIEW_MENU_KEYS = {
    [VIEWS.main]: "title",
    [VIEWS.terms]: "terms",
    [VIEWS.privacy]: "privacy",
    [VIEWS.about]: "about",
    [VIEWS.guide]: "guide",
    [VIEWS.download]: "downloadApp",
    [VIEWS.qr]: "qr",
    [VIEWS.recommendations]: "recommendations",
    [VIEWS.contact]: "contact",
    [VIEWS.author]: "author",
    [VIEWS.cooperation]: "cooperation",
    [VIEWS["report-bug"]]: "reportBug"
  };
  var ACTION_MENU_KEYS = {
    home: "home",
    map: "map",
    favorites: "favorites",
    cart: "cart",
    terms: "terms",
    privacy: "privacy",
    about: "about",
    guide: "guide",
    "download-app": "downloadApp",
    qr: "qr",
    recommendations: "recommendations",
    "download-pdf": "downloadPdf",
    "install-pwa": "installApp",
    contact: "contact",
    author: "author",
    cooperation: "cooperation",
    "report-bug": "reportBug"
  };
  var NAV_ACTIONS = /* @__PURE__ */ new Set(["home", "map", "favorites", "cart"]);
  var initialized4 = false;
  var isOpen = false;
  var currentViewId = VIEWS.main;
  function menuLabel(key) {
    const text = t(`menu.${key}`);
    return text === `menu.${key}` ? key : text;
  }
  function aboutLabel(key) {
    const text = t(`aboutPage.${key}`);
    return text === `aboutPage.${key}` ? key : text;
  }
  function getRoot() {
    return document.getElementById("sideMenu");
  }
  function ensureQrCode() {
    const target = APP_DOWNLOAD_URL;
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(target)}`;
    ["sideMenuQrImage", "sideMenuAboutQrImage"].forEach((id) => {
      const img = document.getElementById(id);
      if (!img || img.dataset.loaded === "true") return;
      img.src = url;
      img.dataset.loaded = "true";
    });
  }
  function refreshSideMenuI18n() {
    const root = getRoot();
    if (!root) return;
    root.querySelectorAll("[data-i18n-menu]").forEach((el) => {
      const key = el.dataset.i18nMenu;
      if (key) el.textContent = menuLabel(key);
    });
    root.querySelectorAll("[data-i18n-menu-section]").forEach((el) => {
      const key = el.dataset.i18nMenuSection;
      if (key) {
        const icon = el.dataset.i18nMenuIcon || "";
        el.textContent = icon ? `${icon} ${menuLabel(key)}` : menuLabel(key);
      }
    });
    root.querySelectorAll("[data-side-menu-action]").forEach((btn) => {
      const action = btn.dataset.sideMenuAction;
      const menuKey = ACTION_MENU_KEYS[action];
      const labelEl = btn.querySelector(".side-menu-item-label");
      if (menuKey && labelEl) labelEl.textContent = menuLabel(menuKey);
    });
    const backBtn = root.querySelector('[data-side-menu-action="back"]');
    if (backBtn) backBtn.setAttribute("aria-label", menuLabel("back"));
    const closeBtn = root.querySelector(".side-menu-close");
    if (closeBtn) closeBtn.setAttribute("aria-label", menuLabel("close"));
    const title = root.querySelector("#sideMenuTitle");
    if (title) {
      const viewKey = VIEW_MENU_KEYS[currentViewId] || "title";
      title.textContent = menuLabel(viewKey);
    }
    root.querySelectorAll("[data-i18n-about]").forEach((el) => {
      const key = el.dataset.i18nAbout;
      if (key) el.textContent = aboutLabel(key);
    });
    const aboutQr = document.getElementById("sideMenuAboutQrImage");
    if (aboutQr) aboutQr.alt = aboutLabel("qrAlt");
  }
  function showView2(viewId) {
    const root = getRoot();
    if (!root) return;
    currentViewId = viewId;
    root.querySelectorAll("[data-side-menu-view]").forEach((el) => {
      const match = el.dataset.sideMenuView === viewId;
      el.hidden = !match;
    });
    const backBtn = root.querySelector('[data-side-menu-action="back"]');
    if (backBtn) backBtn.hidden = viewId === VIEWS.main;
    refreshSideMenuI18n();
    const body = root.querySelector(".side-menu-body");
    if (body) body.scrollTop = 0;
    if (viewId === VIEWS.qr || viewId === VIEWS.about) ensureQrCode();
  }
  function openSideMenu() {
    const root = getRoot();
    if (!root || isOpen) return;
    isOpen = true;
    root.hidden = false;
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("side-menu-open");
    showView2(VIEWS.main);
    const menuBtn = document.getElementById("menuBtn");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => {
      root.classList.add("is-open");
    });
    const closeBtn = root.querySelector(".side-menu-close");
    if (closeBtn) closeBtn.focus();
  }
  function closeSideMenu() {
    const root = getRoot();
    if (!root || !isOpen) return;
    isOpen = false;
    root.classList.remove("is-open");
    root.setAttribute("aria-hidden", "true");
    document.body.classList.remove("side-menu-open");
    const menuBtn = document.getElementById("menuBtn");
    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.focus();
    }
    window.setTimeout(() => {
      if (!isOpen) root.hidden = true;
    }, 300);
  }
  function handleAction(action) {
    if (NAV_ACTIONS.has(action)) {
      navigateTo(action);
      closeSideMenu();
      return;
    }
    switch (action) {
      case "download-pdf":
        window.location.href = "/docs/instrukcja-instalacji.pdf";
        break;
      case "install-pwa":
        promptPwaInstall().then(() => closeSideMenu());
        break;
      case "download-app":
        showView2(VIEWS.download);
        break;
      case "terms":
      case "privacy":
      case "about":
      case "guide":
      case "qr":
      case "recommendations":
      case "contact":
      case "author":
      case "cooperation":
      case "report-bug":
        showView2(VIEWS[action] || VIEWS.main);
        break;
      case "back":
        showView2(VIEWS.main);
        break;
      default:
        break;
    }
  }
  function bindEvents4() {
    const root = getRoot();
    if (!root || root.dataset.bound === "true") return;
    root.dataset.bound = "true";
    const menuBtn = document.getElementById("menuBtn");
    if (menuBtn && menuBtn.dataset.sideMenuBound !== "true") {
      menuBtn.dataset.sideMenuBound = "true";
      menuBtn.setAttribute("aria-controls", "sideMenu");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        if (isOpen) closeSideMenu();
        else openSideMenu();
      });
    }
    root.addEventListener("click", (event) => {
      const closeTarget = event.target.closest("[data-side-menu-close]");
      if (closeTarget) {
        closeSideMenu();
        return;
      }
      const actionBtn = event.target.closest("[data-side-menu-action]");
      if (actionBtn) {
        handleAction(actionBtn.dataset.sideMenuAction);
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !isOpen) return;
      const rootEl = getRoot();
      const mainView = rootEl == null ? void 0 : rootEl.querySelector('[data-side-menu-view="main"]');
      if (mainView && mainView.hidden) {
        showView2(VIEWS.main);
      } else {
        closeSideMenu();
      }
    });
  }
  function initSideMenu() {
    if (initialized4) return;
    initialized4 = true;
    bindEvents4();
    refreshSideMenuI18n();
    eventBus2.on(EVENTS2.LANGUAGE_CHANGED, refreshSideMenuI18n);
  }

  // js/core/analytics.js
  var PLACEHOLDER_ID = "G-XXXXXXXXXX";
  function isAnalyticsEnabled() {
    return Boolean(
      GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== PLACEHOLDER_ID && typeof window.gtag === "function"
    );
  }
  function trackPageView(pagePath, pageTitle) {
    if (!isAnalyticsEnabled()) return;
    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_title: pageTitle || document.title
    });
  }
  function trackEvent(name, params = {}) {
    if (!isAnalyticsEnabled()) return;
    window.gtag("event", name, params);
  }
  function bindNavigationTracking() {
    eventBus2.on(EVENTS2.VIEW_CHANGED, ({ view }) => {
      if (!view) return;
      trackPageView(`/${view}`, document.title);
    });
  }
  function bindClickTracking() {
    document.addEventListener("click", (event) => {
      var _a7;
      if (!isAnalyticsEnabled()) return;
      const target = event.target.closest(
        "[data-view], .nav-item, .btn-primary, .btn-secondary, [data-side-menu-action], [data-analytics-label]"
      );
      if (!target) return;
      const label = target.dataset.analyticsLabel || target.dataset.view || target.dataset.sideMenuAction || target.getAttribute("aria-label") || ((_a7 = target.textContent) == null ? void 0 : _a7.trim().slice(0, 48)) || "unknown";
      trackEvent("click", {
        event_category: "engagement",
        event_label: label,
        element: target.tagName.toLowerCase()
      });
    }, { capture: true, passive: true });
  }
  function initAnalytics() {
    if (!isAnalyticsEnabled()) {
      console.info("[Analytics] Nieaktywne \u2013 ustaw GA_MEASUREMENT_ID w config.js i index.html");
      return;
    }
    bindNavigationTracking();
    bindClickTracking();
    trackPageView(window.location.pathname + window.location.hash, document.title);
  }

  // js/app.js
  var VIEW_KEYS = ["home", "map", "premium", "favorites", "cart", "profile"];
  var bootstrapped = false;
  function bindCategoryFilter() {
    eventBus2.on(EVENTS2.CATEGORY_SELECTED, ({ category }) => {
      setSearchQuery("");
      setCategoryFilter(category || "all");
      navigateTo("map", { force: true });
    });
  }
  function bindSearch() {
    eventBus2.on(EVENTS2.SEARCH_PRODUCTS, ({ query }) => {
      setSearchQuery(query || "");
      setCategoryFilter("all");
      navigateTo("map", { force: true });
    });
  }
  function bindLocationAndNearby() {
    eventBus2.on(EVENTS2.LOCATION_REQUESTED, () => {
      resetCategoryFilter();
      navigateTo("map");
    });
    eventBus2.on(EVENTS2.NEARBY_SEARCH, () => {
      resetCategoryFilter();
      navigateTo("map");
    });
  }
  function bindShellEvents() {
    eventBus2.on(EVENTS2.VIEW_CHANGED, (payload) => {
      const view = payload == null ? void 0 : payload.view;
      if (view && VIEW_KEYS.includes(view)) {
        document.title = `${t(`nav.${view}`)} \u2013 ${APP_NAME}`;
      }
    });
    eventBus2.on(EVENTS2.LANGUAGE_CHANGED, () => {
      updateNavLabels();
      updateLanguageButtonLabel();
      refreshShellAccessibility();
      const current = getCurrentView();
      if (current) navigateTo(current, { force: true });
    });
    eventBus2.on(EVENTS2.AUTH_CHANGED, () => {
      document.body.classList.toggle("premium-active", isPremiumActive());
      const current = getCurrentView();
      if (current === "profile" || current === "premium" || current === "home") {
        navigateTo(current, { force: true });
      }
    });
    eventBus2.on(EVENTS2.PREMIUM_ACTIVATED, () => {
      document.body.classList.add("premium-active");
      const current = getCurrentView();
      if (current === "premium" || current === "home") {
        navigateTo(current, { force: true });
      }
    });
  }
  function bootstrap() {
    return __async(this, null, function* () {
      if (bootstrapped) return;
      bootstrapped = true;
      const app = document.getElementById("app");
      if (!app) throw new Error("Brak kontenera #app");
      initShellSettings();
      initSideMenu();
      initToast();
      initAuth();
      initLoginModal();
      initRegisterModal();
      initNavigation(app);
      bindNavButtons();
      bindCategoryFilter();
      bindSearch();
      bindLocationAndNearby();
      bindShellEvents();
      refreshFavoritesBadge();
      refreshCartBadge();
      document.body.classList.toggle("premium-active", isPremiumActive());
      yield initPushNotifications();
      initPwaInstall();
      initAnalytics();
      window.navigateTo = navigateTo;
      window.checkPushOffersNow = checkPushOffersNow;
      window.updatePwaInstallButtons = refreshPwaInstallUi;
      console.info(`[${APP_NAME}] nawigacja gotowa`);
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }
})();
