/**
 * ETAP 24 – Real User Simulation · katalog 50 person
 * Czysty moduł (bez DOM) — używany przez przeglądarkę i CLI.
 */

export const JOURNEY_STEPS = Object.freeze([
    'open-app',
    'home',
    'search',
    'map',
    'filters',
    'producer-modal',
    'favorites',
    'cart',
    'profile',
    'premium',
    'language',
    'theme',
    'offline',
    'back-home'
]);

/**
 * @typedef {object} Persona
 * @property {number} id
 * @property {string} code
 * @property {string} name
 * @property {string} tagline
 * @property {number|null} age
 * @property {string} role
 * @property {{ family: string, model: string, width: number, height: number, dpr: number }} device
 * @property {'2g'|'3g'|'4g'|'wifi'|'offline-prone'} network
 * @property {string} language
 * @property {string[]} traits
 * @property {{ colorVision: string, reducedMotion: boolean, minTouchPx: number, fontScale: number }} a11y
 * @property {{ colorful: boolean, preferDark: boolean|null }} themes
 * @property {string[]} focus
 */

/** @type {Persona[]} */
export const PERSONAS = [
    {
        id: 1, code: 'P01', name: 'Elżbieta', tagline: '75 lat · nigdy nie używała smartfona',
        age: 75, role: 'senior-novice',
        device: { family: 'android', model: 'Budget phone', width: 360, height: 640, dpr: 2 },
        network: '3g', language: 'de',
        traits: ['novice', 'slow', 'large-touch', 'fear-mistakes', 'simple-nav'],
        a11y: { colorVision: 'normal', reducedMotion: true, minTouchPx: 48, fontScale: 1.35 },
        themes: { colorful: true, preferDark: false },
        focus: ['clarity', 'touch', 'simple-nav']
    },
    {
        id: 2, code: 'P02', name: 'Jonas', tagline: '25 lat · jedzie rowerem',
        age: 25, role: 'cyclist',
        device: { family: 'android', model: 'Midrange phone', width: 390, height: 844, dpr: 2.5 },
        network: '4g', language: 'de',
        traits: ['one-hand', 'outdoor', 'gps-heavy', 'fast', 'glare'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 40, fontScale: 1 },
        themes: { colorful: true, preferDark: null },
        focus: ['map', 'gps', 'one-hand']
    },
    {
        id: 3, code: 'P03', name: 'Emily', tagline: 'Turystka z Anglii',
        age: 29, role: 'tourist-en',
        device: { family: 'ios', model: 'iPhone 13', width: 390, height: 844, dpr: 3 },
        network: 'wifi', language: 'en',
        traits: ['tourist', 'i18n-en', 'search-first', 'photos'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 44, fontScale: 1 },
        themes: { colorful: true, preferDark: null },
        focus: ['i18n', 'search', 'map']
    },
    {
        id: 4, code: 'P04', name: 'Marta', tagline: 'Mama z dzieckiem',
        age: 34, role: 'parent',
        device: { family: 'android', model: 'Galaxy A', width: 384, height: 854, dpr: 2.75 },
        network: '4g', language: 'de',
        traits: ['interrupted', 'one-hand', 'fast-exit', 'cart', 'favorites'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 44, fontScale: 1 },
        themes: { colorful: true, preferDark: null },
        focus: ['speed', 'cart', 'clarity']
    },
    {
        id: 5, code: 'P05', name: 'Tomasz', tagline: 'Bardzo słaby internet',
        age: 41, role: 'slow-network',
        device: { family: 'android', model: 'Older phone', width: 360, height: 720, dpr: 2 },
        network: '2g', language: 'de',
        traits: ['slow-net', 'offline-prone', 'patience-low', 'data-saver'],
        a11y: { colorVision: 'normal', reducedMotion: true, minTouchPx: 40, fontScale: 1 },
        themes: { colorful: false, preferDark: null },
        focus: ['offline', 'performance', 'images']
    },
    {
        id: 6, code: 'P06', name: 'Klara', tagline: 'Kolorowe motywy wyłączone',
        age: 38, role: 'plain-theme',
        device: { family: 'ios', model: 'iPhone 12', width: 390, height: 844, dpr: 3 },
        network: 'wifi', language: 'de',
        traits: ['no-season-theme', 'reduced-decoration', 'focus-content'],
        a11y: { colorVision: 'normal', reducedMotion: true, minTouchPx: 44, fontScale: 1 },
        themes: { colorful: false, preferDark: false },
        focus: ['contrast', 'readability']
    },
    {
        id: 7, code: 'P07', name: 'Peter', tagline: 'Daltonista (deuteranopia)',
        age: 45, role: 'colorblind',
        device: { family: 'android', model: 'Pixel', width: 412, height: 915, dpr: 2.6 },
        network: 'wifi', language: 'de',
        traits: ['colorblind', 'map-colors', 'status-icons'],
        a11y: { colorVision: 'deuteranopia', reducedMotion: false, minTouchPx: 44, fontScale: 1 },
        themes: { colorful: true, preferDark: null },
        focus: ['a11y-color', 'map', 'contrast']
    },
    {
        id: 8, code: 'P08', name: 'Hans', tagline: 'Starszy Samsung',
        age: 52, role: 'legacy-android',
        device: { family: 'android', model: 'Galaxy S8', width: 360, height: 740, dpr: 4 },
        network: '4g', language: 'de',
        traits: ['low-ram', 'old-webview', 'performance'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 40, fontScale: 1 },
        themes: { colorful: true, preferDark: null },
        focus: ['performance', 'memory', 'map']
    },
    {
        id: 9, code: 'P09', name: 'Sophie', tagline: 'iPhone SE',
        age: 27, role: 'small-phone',
        device: { family: 'ios', model: 'iPhone SE', width: 375, height: 667, dpr: 2 },
        network: 'wifi', language: 'de',
        traits: ['small-screen', 'thumb-reach', 'compact-ui'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 44, fontScale: 1 },
        themes: { colorful: true, preferDark: null },
        focus: ['responsive', 'touch', 'overflow']
    },
    {
        id: 10, code: 'P10', name: 'Lukas', tagline: 'Tablet',
        age: 36, role: 'tablet',
        device: { family: 'android', model: 'Galaxy Tab', width: 800, height: 1280, dpr: 2 },
        network: 'wifi', language: 'de',
        traits: ['tablet', 'landscape-ok', 'large-canvas'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 40, fontScale: 1 },
        themes: { colorful: true, preferDark: null },
        focus: ['responsive', 'map', 'layout']
    },
    {
        id: 11, code: 'P11', name: 'Mia', tagline: 'Nastolatka · trendy farmy',
        age: 17, role: 'teen',
        device: { family: 'ios', model: 'iPhone 14', width: 390, height: 844, dpr: 3 },
        network: 'wifi', language: 'de',
        traits: ['fast', 'visual', 'social-share'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 40, fontScale: 1 },
        themes: { colorful: true, preferDark: true },
        focus: ['home', 'photos', 'premium']
    },
    {
        id: 12, code: 'P12', name: 'Georg', tagline: 'Rolnik · sprzedawca',
        age: 48, role: 'producer',
        device: { family: 'android', model: 'Work phone', width: 360, height: 800, dpr: 2 },
        network: '3g', language: 'de',
        traits: ['producer-view', 'profile', 'offline-prone'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 44, fontScale: 1.1 },
        themes: { colorful: true, preferDark: null },
        focus: ['profile', 'map', 'clarity']
    },
    {
        id: 13, code: 'P13', name: 'Anna', tagline: 'Subskrybentka Premium',
        age: 33, role: 'premium',
        device: { family: 'ios', model: 'iPhone 15', width: 393, height: 852, dpr: 3 },
        network: 'wifi', language: 'de',
        traits: ['premium', 'favorites', 'expect-polish'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 44, fontScale: 1 },
        themes: { colorful: true, preferDark: null },
        focus: ['premium', 'favorites', 'ux']
    },
    {
        id: 14, code: 'P14', name: 'Gość', tagline: 'Bez konta · pierwszy raz',
        age: 30, role: 'guest',
        device: { family: 'android', model: 'Generic', width: 390, height: 844, dpr: 2 },
        network: 'wifi', language: 'de',
        traits: ['guest', 'novice', 'fear-mistakes'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 44, fontScale: 1 },
        themes: { colorful: true, preferDark: null },
        focus: ['onboarding', 'clarity', 'cart']
    },
    {
        id: 15, code: 'P15', name: 'Lea', tagline: 'Leworęczna · jeden kciuk',
        age: 26, role: 'left-hand',
        device: { family: 'android', model: 'Pixel', width: 412, height: 915, dpr: 2.6 },
        network: '4g', language: 'de',
        traits: ['one-hand', 'left-hand', 'thumb-reach'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 44, fontScale: 1 },
        themes: { colorful: true, preferDark: null },
        focus: ['touch', 'nav']
    },
    {
        id: 16, code: 'P16', name: 'Omar', tagline: 'Jedną ręką w autobusie',
        age: 31, role: 'commuter',
        device: { family: 'android', model: 'Midrange', width: 384, height: 854, dpr: 2.5 },
        network: '3g', language: 'de',
        traits: ['one-hand', 'interrupted', 'slow-net'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 44, fontScale: 1 },
        themes: { colorful: true, preferDark: null },
        focus: ['touch', 'map', 'performance']
    },
    {
        id: 17, code: 'P17', name: 'Nina', tagline: 'Praca nocna · tylko dark mode',
        age: 28, role: 'night',
        device: { family: 'ios', model: 'iPhone 11', width: 414, height: 896, dpr: 2 },
        network: 'wifi', language: 'de',
        traits: ['dark-only', 'glare-sensitive'],
        a11y: { colorVision: 'normal', reducedMotion: true, minTouchPx: 44, fontScale: 1 },
        themes: { colorful: false, preferDark: true },
        focus: ['theme', 'contrast']
    },
    {
        id: 18, code: 'P18', name: 'Franz', tagline: 'Na słońcu · outdoor',
        age: 55, role: 'outdoor-sun',
        device: { family: 'android', model: 'Rugged', width: 360, height: 720, dpr: 2 },
        network: '4g', language: 'de',
        traits: ['glare', 'outdoor', 'high-contrast'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 48, fontScale: 1.15 },
        themes: { colorful: true, preferDark: false },
        focus: ['contrast', 'map', 'touch']
    },
    {
        id: 19, code: 'P19', name: 'Ingrid', tagline: 'Lokalna z Regensburga',
        age: 62, role: 'local',
        device: { family: 'android', model: 'Galaxy A', width: 384, height: 854, dpr: 2.5 },
        network: 'wifi', language: 'de',
        traits: ['local', 'favorites', 'map'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 44, fontScale: 1.1 },
        themes: { colorful: true, preferDark: null },
        focus: ['map', 'favorites', 'search']
    },
    {
        id: 20, code: 'P20', name: 'Kasia', tagline: 'Turystka z Polski',
        age: 24, role: 'tourist-pl',
        device: { family: 'android', model: 'Xiaomi', width: 393, height: 873, dpr: 2.75 },
        network: '4g', language: 'pl',
        traits: ['tourist', 'i18n-pl', 'search-first'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 44, fontScale: 1 },
        themes: { colorful: true, preferDark: null },
        focus: ['i18n', 'search', 'map']
    },
    {
        id: 21, code: 'P21', name: 'Mark', tagline: 'Głuchy · tylko wizualnie',
        age: 40, role: 'deaf',
        device: { family: 'ios', model: 'iPhone 12', width: 390, height: 844, dpr: 3 },
        network: 'wifi', language: 'de',
        traits: ['visual-only', 'no-audio-cues'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 44, fontScale: 1 },
        themes: { colorful: true, preferDark: null },
        focus: ['clarity', 'ux', 'status-icons']
    },
    {
        id: 22, code: 'P22', name: 'Helga', tagline: 'Słaby wzrok · duży tekst',
        age: 71, role: 'low-vision',
        device: { family: 'android', model: 'Large font phone', width: 360, height: 740, dpr: 2 },
        network: 'wifi', language: 'de',
        traits: ['large-text', 'high-contrast', 'slow'],
        a11y: { colorVision: 'normal', reducedMotion: true, minTouchPx: 48, fontScale: 1.5 },
        themes: { colorful: false, preferDark: false },
        focus: ['a11y', 'overflow', 'touch']
    },
    {
        id: 23, code: 'P23', name: 'Ralf', tagline: 'Drżenie rąk · motoryka',
        age: 67, role: 'motor',
        device: { family: 'android', model: 'Senior phone', width: 360, height: 640, dpr: 2 },
        network: '3g', language: 'de',
        traits: ['motor', 'large-touch', 'slow', 'fear-mistakes'],
        a11y: { colorVision: 'normal', reducedMotion: true, minTouchPx: 52, fontScale: 1.25 },
        themes: { colorful: true, preferDark: false },
        focus: ['touch', 'simple-nav']
    },
    {
        id: 24, code: 'P24', name: 'Sam', tagline: 'Czytnik ekranu (struktura a11y)',
        age: 35, role: 'screen-reader',
        device: { family: 'ios', model: 'iPhone + VoiceOver', width: 390, height: 844, dpr: 3 },
        network: 'wifi', language: 'en',
        traits: ['screen-reader', 'a11y-structure', 'i18n-en'],
        a11y: { colorVision: 'normal', reducedMotion: true, minTouchPx: 44, fontScale: 1 },
        themes: { colorful: false, preferDark: null },
        focus: ['a11y', 'i18n', 'nav']
    },
    {
        id: 25, code: 'P25', name: 'Tim', tagline: '12 lat · pod opieką',
        age: 12, role: 'child',
        device: { family: 'android', model: 'Family tablet phone', width: 360, height: 720, dpr: 2 },
        network: 'wifi', language: 'de',
        traits: ['child', 'simple-nav', 'visual'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 44, fontScale: 1.1 },
        themes: { colorful: true, preferDark: null },
        focus: ['clarity', 'home', 'simple-nav']
    },
    {
        id: 26, code: 'P26', name: 'Julia', tagline: 'Lunch biznesowy · 3 minuty',
        age: 39, role: 'rush',
        device: { family: 'ios', model: 'iPhone 14 Pro', width: 393, height: 852, dpr: 3 },
        network: '4g', language: 'de',
        traits: ['rush', 'search-first', 'fast'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 40, fontScale: 1 },
        themes: { colorful: true, preferDark: null },
        focus: ['search', 'speed', 'map']
    },
    {
        id: 27, code: 'P27', name: 'Familie Weber', tagline: 'Weekendowy wypad rodzinny',
        age: 42, role: 'family',
        device: { family: 'android', model: 'Shared phone', width: 384, height: 854, dpr: 2.5 },
        network: '4g', language: 'de',
        traits: ['family', 'favorites', 'cart', 'map'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 44, fontScale: 1 },
        themes: { colorful: true, preferDark: null },
        focus: ['map', 'favorites', 'cart']
    },
    {
        id: 28, code: 'P28', name: 'Sepp', tagline: 'Wieś · offline-first',
        age: 58, role: 'rural-offline',
        device: { family: 'android', model: 'Outdoor phone', width: 360, height: 720, dpr: 2 },
        network: 'offline-prone', language: 'de',
        traits: ['offline-prone', 'slow-net', 'map'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 44, fontScale: 1.1 },
        themes: { colorful: true, preferDark: null },
        focus: ['offline', 'map', 'pwa']
    },
    {
        id: 29, code: 'P29', name: 'Yara', tagline: 'Tryb oszczędzania danych',
        age: 22, role: 'data-saver',
        device: { family: 'android', model: 'Entry phone', width: 360, height: 780, dpr: 2 },
        network: '3g', language: 'de',
        traits: ['data-saver', 'slow-net', 'images'],
        a11y: { colorVision: 'normal', reducedMotion: true, minTouchPx: 40, fontScale: 1 },
        themes: { colorful: false, preferDark: true },
        focus: ['performance', 'images', 'offline']
    },
    {
        id: 30, code: 'P30', name: 'Chris', tagline: 'Telefon składany',
        age: 32, role: 'foldable',
        device: { family: 'android', model: 'Fold cover', width: 320, height: 840, dpr: 2.5 },
        network: 'wifi', language: 'de',
        traits: ['narrow', 'responsive', 'compact-ui'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 40, fontScale: 1 },
        themes: { colorful: true, preferDark: null },
        focus: ['responsive', 'overflow']
    },
    {
        id: 31, code: 'P31', name: 'Elena', tagline: 'Chromebook / desktop',
        age: 44, role: 'desktop',
        device: { family: 'desktop', model: 'Chromebook', width: 1280, height: 800, dpr: 1 },
        network: 'wifi', language: 'de',
        traits: ['desktop', 'mouse', 'wide'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 32, fontScale: 1 },
        themes: { colorful: true, preferDark: null },
        focus: ['responsive', 'layout', 'map']
    },
    {
        id: 32, code: 'P32', name: 'Ben', tagline: 'Telefon w landscape',
        age: 29, role: 'landscape',
        device: { family: 'android', model: 'Phone landscape', width: 740, height: 360, dpr: 2 },
        network: '4g', language: 'de',
        traits: ['landscape', 'map', 'responsive'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 40, fontScale: 1 },
        themes: { colorful: true, preferDark: null },
        focus: ['responsive', 'map', 'nav']
    },
    {
        id: 33, code: 'P33', name: 'Ahmed', tagline: 'Prosty niemiecki (ESL)',
        age: 37, role: 'esl',
        device: { family: 'android', model: 'Midrange', width: 390, height: 844, dpr: 2.5 },
        network: 'wifi', language: 'de',
        traits: ['simple-language', 'novice', 'icons-help'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 44, fontScale: 1.05 },
        themes: { colorful: true, preferDark: null },
        focus: ['clarity', 'i18n', 'simple-nav']
    },
    {
        id: 34, code: 'P34', name: 'Lisa', tagline: 'Szuka bezglutenowego',
        age: 31, role: 'gluten-free',
        device: { family: 'ios', model: 'iPhone 13', width: 390, height: 844, dpr: 3 },
        network: 'wifi', language: 'de',
        traits: ['filters', 'search-first', 'dietary'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 44, fontScale: 1 },
        themes: { colorful: true, preferDark: null },
        focus: ['filters', 'search', 'producer-modal']
    },
    {
        id: 35, code: 'P35', name: 'Nora', tagline: 'Wegetarianka · filtry',
        age: 26, role: 'vegetarian',
        device: { family: 'android', model: 'Pixel', width: 412, height: 915, dpr: 2.6 },
        network: 'wifi', language: 'de',
        traits: ['filters', 'search-first', 'dietary'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 44, fontScale: 1 },
        themes: { colorful: true, preferDark: null },
        focus: ['filters', 'search', 'map']
    },
    {
        id: 36, code: 'P36', name: 'Karl', tagline: 'Dużo w koszyku',
        age: 50, role: 'cart-heavy',
        device: { family: 'android', model: 'Galaxy', width: 384, height: 854, dpr: 2.5 },
        network: 'wifi', language: 'de',
        traits: ['cart', 'producer-modal', 'rush'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 44, fontScale: 1 },
        themes: { colorful: true, preferDark: null },
        focus: ['cart', 'producer-modal', 'ux']
    },
    {
        id: 37, code: 'P37', name: 'Eva', tagline: 'Kolekcjonerka ulubionych',
        age: 43, role: 'favorites-heavy',
        device: { family: 'ios', model: 'iPhone XR', width: 414, height: 896, dpr: 2 },
        network: 'wifi', language: 'de',
        traits: ['favorites', 'map', 'return-user'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 44, fontScale: 1 },
        themes: { colorful: true, preferDark: null },
        focus: ['favorites', 'map', 'home']
    },
    {
        id: 38, code: 'P38', name: 'Max', tagline: 'Tylko mapa · zero list',
        age: 35, role: 'map-only',
        device: { family: 'android', model: 'GPS phone', width: 360, height: 800, dpr: 2 },
        network: '4g', language: 'de',
        traits: ['map', 'gps-heavy', 'filters'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 40, fontScale: 1 },
        themes: { colorful: true, preferDark: null },
        focus: ['map', 'gps', 'filters']
    },
    {
        id: 39, code: 'P39', name: 'Iris', tagline: 'Zawsze zaczyna od szukajki',
        age: 28, role: 'search-first',
        device: { family: 'ios', model: 'iPhone SE 3', width: 375, height: 667, dpr: 2 },
        network: 'wifi', language: 'de',
        traits: ['search-first', 'fast', 'small-screen'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 44, fontScale: 1 },
        themes: { colorful: true, preferDark: null },
        focus: ['search', 'responsive', 'home']
    },
    {
        id: 40, code: 'P40', name: 'Paul', tagline: 'GPS wyłączony / odmowa',
        age: 46, role: 'no-gps',
        device: { family: 'android', model: 'Privacy phone', width: 360, height: 780, dpr: 2 },
        network: 'wifi', language: 'de',
        traits: ['no-gps', 'privacy', 'search-first'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 44, fontScale: 1 },
        themes: { colorful: true, preferDark: null },
        focus: ['map', 'search', 'clarity']
    },
    {
        id: 41, code: 'P41', name: 'Vera', tagline: 'Privacy-first · minimum danych',
        age: 34, role: 'privacy',
        device: { family: 'ios', model: 'iPhone 13 mini', width: 375, height: 812, dpr: 3 },
        network: 'wifi', language: 'de',
        traits: ['privacy', 'guest', 'no-gps'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 44, fontScale: 1 },
        themes: { colorful: false, preferDark: true },
        focus: ['clarity', 'profile', 'pwa']
    },
    {
        id: 42, code: 'P42', name: 'Otto', tagline: '68 lat · czyta wolno',
        age: 68, role: 'slow-reader',
        device: { family: 'android', model: 'Senior', width: 360, height: 720, dpr: 2 },
        network: 'wifi', language: 'de',
        traits: ['slow', 'large-text', 'simple-nav', 'novice'],
        a11y: { colorVision: 'normal', reducedMotion: true, minTouchPx: 48, fontScale: 1.4 },
        themes: { colorful: true, preferDark: false },
        focus: ['clarity', 'touch', 'simple-nav']
    },
    {
        id: 43, code: 'P43', name: 'Zoe', tagline: 'Fotografka · dużo zdjęć',
        age: 27, role: 'photographer',
        device: { family: 'ios', model: 'iPhone 15 Pro', width: 393, height: 852, dpr: 3 },
        network: 'wifi', language: 'en',
        traits: ['photos', 'visual', 'premium'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 44, fontScale: 1 },
        themes: { colorful: true, preferDark: null },
        focus: ['images', 'producer-modal', 'premium']
    },
    {
        id: 44, code: 'P44', name: 'OS High Contrast', tagline: 'Systemowy wysoki kontrast',
        age: 50, role: 'os-contrast',
        device: { family: 'android', model: 'A11y profile', width: 390, height: 844, dpr: 2.5 },
        network: 'wifi', language: 'de',
        traits: ['high-contrast', 'os-a11y'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 44, fontScale: 1.1 },
        themes: { colorful: false, preferDark: false },
        focus: ['contrast', 'a11y', 'theme']
    },
    {
        id: 45, code: 'P45', name: 'OS Reduce Motion', tagline: 'System: reduced motion',
        age: 33, role: 'reduce-motion',
        device: { family: 'ios', model: 'iPhone + Reduce Motion', width: 390, height: 844, dpr: 3 },
        network: 'wifi', language: 'de',
        traits: ['reduced-motion', 'vestibular'],
        a11y: { colorVision: 'normal', reducedMotion: true, minTouchPx: 44, fontScale: 1 },
        themes: { colorful: false, preferDark: null },
        focus: ['motion', 'ux', 'home']
    },
    {
        id: 46, code: 'P46', name: 'iPad mini', tagline: 'Mały tablet',
        age: 40, role: 'ipad-mini',
        device: { family: 'ios', model: 'iPad mini', width: 768, height: 1024, dpr: 2 },
        network: 'wifi', language: 'de',
        traits: ['tablet', 'touch', 'map'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 44, fontScale: 1 },
        themes: { colorful: true, preferDark: null },
        focus: ['responsive', 'map', 'layout']
    },
    {
        id: 47, code: 'P47', name: 'Android Go', tagline: 'Niski RAM · Go edition',
        age: 23, role: 'android-go',
        device: { family: 'android', model: 'Android Go', width: 360, height: 640, dpr: 1.5 },
        network: '3g', language: 'de',
        traits: ['low-ram', 'performance', 'slow-net'],
        a11y: { colorVision: 'normal', reducedMotion: true, minTouchPx: 40, fontScale: 1 },
        themes: { colorful: false, preferDark: true },
        focus: ['performance', 'memory', 'map']
    },
    {
        id: 48, code: 'P48', name: 'Huawei', tagline: 'Bez GMS · ograniczenia sklepu',
        age: 36, role: 'no-gms',
        device: { family: 'android', model: 'Huawei', width: 360, height: 780, dpr: 3 },
        network: '4g', language: 'de',
        traits: ['no-gms', 'pwa', 'install'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 44, fontScale: 1 },
        themes: { colorful: true, preferDark: null },
        focus: ['pwa', 'offline', 'install']
    },
    {
        id: 49, code: 'P49', name: 'First install', tagline: 'Pierwsza instalacja PWA',
        age: 29, role: 'first-pwa',
        device: { family: 'android', model: 'Chrome Android', width: 390, height: 844, dpr: 2.75 },
        network: 'wifi', language: 'de',
        traits: ['first-run', 'pwa', 'novice', 'onboarding'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 44, fontScale: 1 },
        themes: { colorful: true, preferDark: null },
        focus: ['pwa', 'onboarding', 'home']
    },
    {
        id: 50, code: 'P50', name: 'Power user', tagline: 'Wracający power user',
        age: 38, role: 'power',
        device: { family: 'ios', model: 'iPhone 15', width: 393, height: 852, dpr: 3 },
        network: 'wifi', language: 'de',
        traits: ['return-user', 'fast', 'favorites', 'filters', 'premium'],
        a11y: { colorVision: 'normal', reducedMotion: false, minTouchPx: 40, fontScale: 1 },
        themes: { colorful: true, preferDark: true },
        focus: ['speed', 'filters', 'favorites', 'premium']
    }
];

export function getPersonaById(id) {
    return PERSONAS.find((p) => p.id === Number(id)) || null;
}

export function getPersonaByCode(code) {
    return PERSONAS.find((p) => p.code === code) || null;
}

/** Opóźnienie kroku wg sieci persony (ms baza). */
export function networkDelayMs(network) {
    switch (network) {
        case '2g': return 900;
        case '3g': return 450;
        case 'offline-prone': return 700;
        case '4g': return 180;
        default: return 80;
    }
}

/**
 * Heurystyczna ocena persony vs sygnały aplikacji (CLI + szybki matrix).
 * @param {Persona} persona
 * @param {object} [signals]
 */
export function evaluatePersona(persona, signals = {}) {
    const s = {
        healthMobile: signals.healthMobile ?? 90,
        healthUx: signals.healthUx ?? 85,
        healthPerf: signals.healthPerformance ?? 90,
        healthA11y: signals.healthAccessibility ?? 80,
        healthPwa: signals.healthPwa ?? 90,
        healthTranslation: signals.healthTranslation ?? 95,
        virtualScore: signals.virtualScore ?? 80,
        touchIssues: signals.touchIssues ?? 1,
        i18nEn: signals.i18nEn ?? true,
        i18nPl: signals.i18nPl ?? true,
        offlineSupport: signals.offlineSupport ?? true,
        darkMode: signals.darkMode ?? true,
        seasonThemeOptional: signals.seasonThemeOptional ?? true,
        ...signals
    };

    const issues = [];
    const steps = JOURNEY_STEPS.map((step) => {
        const frictions = [];
        const push = (severity, title, detail) => {
            frictions.push({ severity, title, detail });
            issues.push({
                personaId: persona.id,
                persona: persona.code,
                step,
                type: 'persona-friction',
                severity,
                title,
                detail
            });
        };

        // sieć
        if ((persona.network === '2g' || persona.network === 'offline-prone') && step === 'map') {
            if (s.healthPerf < 92) push('medium', 'Mapa przy słabej sieci', 'Ryzyko długiego ładowania kafelków / markerów');
        }
        if (persona.traits.includes('offline-prone') && step === 'offline') {
            if (!s.offlineSupport) push('high', 'Brak wsparcia offline', 'Persona wiejska / słaby net wymaga PWA offline');
        }

        // touch / senior
        if ((persona.a11y.minTouchPx >= 48 || persona.traits.includes('large-touch')) && ['home', 'map', 'producer-modal', 'cart'].includes(step)) {
            if (s.touchIssues > 0 || s.healthMobile < 95) {
                push('high', 'Cele dotykowe za małe', `Wymaga ≥${persona.a11y.minTouchPx}px · mobile score ${s.healthMobile}`);
            }
        }

        // i18n
        if (persona.language === 'en' && ['home', 'language', 'producer-modal'].includes(step)) {
            if (!s.i18nEn || s.healthTranslation < 90) push('high', 'Angielski niepełny', 'Turysta EN potrzebuje kompletnego i18n');
        }
        if (persona.language === 'pl' && ['home', 'language'].includes(step)) {
            if (!s.i18nPl) push('medium', 'Polski może być niepełny', 'Turysta PL');
        }

        // colorblind
        if (persona.a11y.colorVision !== 'normal' && ['map', 'filters', 'theme'].includes(step)) {
            push('medium', 'Zależność od koloru', 'Statusy / kategorie mapy powinny mieć kształt lub etykietę');
        }

        // no colorful
        if (!persona.themes.colorful && step === 'theme') {
            if (!s.seasonThemeOptional) push('low', 'Motywy sezonowe trudne do wyłączenia', 'Persona bez kolorowych motywów');
        }

        // dark
        if (persona.themes.preferDark === true && step === 'theme') {
            if (!s.darkMode) push('high', 'Brak dark mode', 'Persona nocna');
        }

        // small / foldable / landscape
        if ((persona.device.width <= 375 || persona.device.height <= 400 || persona.traits.includes('narrow')) && ['home', 'map', 'producer-modal'].includes(step)) {
            if (s.healthMobile < 98) push('medium', 'Wąski / niski viewport', `${persona.device.width}×${persona.device.height}`);
        }

        // tablet / desktop layout
        if ((persona.role === 'tablet' || persona.role === 'desktop' || persona.role === 'ipad-mini') && ['home', 'map'].includes(step)) {
            if (s.healthUx < 90) push('low', 'Layout large-screen', 'Sprawdź gęstość treści na tablecie/desktop');
        }

        // low ram / old device
        if ((persona.traits.includes('low-ram') || persona.traits.includes('old-webview')) && ['map', 'producer-modal'].includes(step)) {
            if (s.healthPerf < 95 || s.virtualScore < 85) {
                push('high', 'Wydajność na starym urządzeniu', `perf ${s.healthPerf} · VU ${s.virtualScore}`);
            }
        }

        // novice / fear
        if ((persona.traits.includes('novice') || persona.traits.includes('fear-mistakes')) && ['open-app', 'home', 'premium'].includes(step)) {
            if (s.healthUx < 88) push('medium', 'Zbyt dużo opcji na starcie', 'Nowicjusz potrzebuje spokojnego pierwszego ekranu');
        }

        // a11y scores
        if ((persona.role === 'screen-reader' || persona.role === 'low-vision' || persona.a11y.fontScale >= 1.3) && ['home', 'producer-modal', 'profile'].includes(step)) {
            if (s.healthA11y < 85) push('high', 'A11y poniżej oczekiwań persony', `a11y score ${s.healthA11y}`);
        }

        // PWA first install / no GMS
        if ((persona.traits.includes('pwa') || persona.traits.includes('no-gms')) && ['open-app', 'offline'].includes(step)) {
            if (s.healthPwa < 90) push('medium', 'PWA / instalacja', 'Persona zależy od instalacji bez sklepu');
        }

        // rush / search
        if (persona.traits.includes('search-first') && step === 'search') {
            if (s.healthUx < 90) push('low', 'Szukajka musi być natychmiast widoczna', 'Search-first persona');
        }

        // GPS denied
        if (persona.traits.includes('no-gps') && step === 'map') {
            push('low', 'Mapa bez GPS', 'Musi działać wyszukiwanie / lista bez lokalizacji');
        }

        const status = frictions.some((f) => f.severity === 'high')
            ? 'friction-high'
            : frictions.some((f) => f.severity === 'medium')
                ? 'friction-medium'
                : frictions.length
                    ? 'friction-low'
                    : 'ok';

        return { step, status, frictions };
    });

    const high = issues.filter((i) => i.severity === 'high').length;
    const medium = issues.filter((i) => i.severity === 'medium').length;
    const low = issues.filter((i) => i.severity === 'low').length;
    const score = Math.max(0, Math.min(100, 100 - high * 10 - medium * 5 - low * 2));

    return {
        persona: {
            id: persona.id,
            code: persona.code,
            name: persona.name,
            tagline: persona.tagline,
            age: persona.age,
            role: persona.role,
            device: persona.device,
            network: persona.network,
            language: persona.language,
            traits: persona.traits
        },
        score,
        status: score >= 85 ? 'pass' : score >= 70 ? 'warn' : 'fail',
        steps,
        issues,
        summary: { high, medium, low, stepCount: steps.length }
    };
}

export default { PERSONAS, JOURNEY_STEPS, evaluatePersona, getPersonaById };
