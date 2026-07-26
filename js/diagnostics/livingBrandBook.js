/**
 * ETAP 26 – Living Brand · kanoniczny Brand Book (pure)
 * Źródło prawdy dla codziennego pilnowania marki.
 */

export const POLICY = Object.freeze({
    autoFix: false,
    autoModifyCode: false,
    advisoryOnly: true,
    daily: true,
    focus: 'brand-consistency'
});

/** Kanoniczna paleta (ETAP 20A) */
export const BRAND_PALETTE = Object.freeze({
    green: '#2a3f28',
    greenMid: '#3d5c34',
    greenSoft: '#4f6b3c',
    gold: '#c9a227',
    goldDeep: '#a67c1a',
    wheat: '#e8c97a',
    honey: '#d4a84b',
    cream: '#f5efe3',
    creamCard: '#fff8ee',
    ink: '#1c1812',
    inkSoft: '#3d3428',
    headerDeep: '#243d28',
    btnLocation: '#5a7d48',
    warmTerracotta: '#b85c38',
    warmMeat: '#a84a3a',
    warmRestaurant: '#c47a3a',
    warmFast: '#8a5a2a',
    textMuted: '#5c4e3a',
    textLight: '#fffef8',
    themeColor: '#2a3f28',
    backgroundColor: '#f5efe3'
});

/** Zimne niebieskie / UI-niebieskie — zakazane w warstwie marki */
export const FORBIDDEN_COLD_BLUE = Object.freeze([
    '#2980b9',
    '#3498db',
    '#456696',
    '#2563eb',
    '#3b82f6',
    '#1e40af',
    '#1d4ed8',
    '#0ea5e9',
    '#0284c7',
    '#38bdf8',
    '#60a5fa',
    '#007aff',
    '#2196f3',
    '#03a9f4',
    '#00bcd4'
]);

export const LOGO = Object.freeze({
    master: 'assets/icons/logo-master.svg',
    masterUrl: '/assets/icons/logo-master.svg',
    aliases: [
        'assets/icons/icon-source.svg',
        'assets/icons/icon-symbol.svg'
    ],
    derivedIcons: [
        'assets/icons/favicon.ico',
        'assets/icons/icon-192.png',
        'assets/icons/icon-512.png',
        'assets/icons/apple-touch-icon.png',
        'assets/icons/maskable-512.png'
    ],
    selectors: [
        '.header-brand-mark',
        '.home-brand-mark',
        '.side-menu-brand-mark',
        '.lp-brand-mark',
        '.lp-hero-logo'
    ],
    motif: 'dwa złote kłosy pochylone w prawo',
    role: 'app-icon',
    note: 'Ikona aplikacji = wyłącznie kłosy; nazwa to wordmark obok, nie w ikonie'
});

export const FONTS = Object.freeze({
    display: 'Literata',
    sans: 'Source Sans 3',
    allowed: [
        'literata',
        'source sans 3',
        'source sans pro',
        'segoe ui',
        'system-ui',
        'sans-serif',
        'serif',
        'georgia',
        'times new roman',
        'arial', // ostatnia deska ratunku legacy – ostrzeżenie, nie fail
        'helvetica',
        'ui-sans-serif',
        'ui-serif',
        'emoji',
        'apple color emoji',
        'segoe ui emoji'
    ],
    foreignHard: [
        'inter',
        'roboto',
        'poppins',
        'montserrat',
        'nunito',
        'raleway',
        'open sans',
        'lato',
        'rubik',
        'work sans',
        'dm sans',
        'space grotesk',
        'jetbrains mono',
        'fira sans',
        'ubuntu',
        'mulish',
        'manrope'
    ]
});

/** Akceptowane „rodziny” cieni marki (wzorce) */
export const SHADOW_FAMILIES = Object.freeze([
    {
        id: 'header',
        re: /0\s+2px\s+0\s+rgba\(201,\s*162,\s*39/i
    },
    {
        id: 'soft-dark',
        re: /rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.(1|12|2|25|28|35)/i
    },
    {
        id: 'gold-glow',
        re: /rgba\(\s*201\s*,\s*162\s*,\s*39/i
    },
    {
        id: 'cream-inset',
        re: /rgba\(\s*245\s*,\s*239\s*,\s*227/i
    },
    {
        id: 'none',
        re: /^none$/i
    }
]);

/** Cienie obce / „AI glow” (nie flaguj białego rgba — trzeci kanał 255 ≠ zimny niebieski) */
export const FORBIDDEN_SHADOW = Object.freeze([
    /0\s+0\s+\d+px\s+#(?:4f46e5|7c3aed|8b5cf6|6366f1|3b82f6)/i,
    /#(?:4f46e5|7c3aed|8b5cf6|6366f1|3b82f6)/i,
    /\bpurple\b|\bindigo\b/i
]);

/** true gdy w cieniu dominuje zimny niebieski (B >> R,G), nie biel/szarość */
export function isColdBlueShadowValue(value) {
    const re = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/gi;
    let m;
    while ((m = re.exec(String(value || '')))) {
        const r = Number(m[1]);
        const g = Number(m[2]);
        const b = Number(m[3]);
        if (b >= 180 && b > r + 35 && b > g + 35) return true;
    }
    return false;
}

export const PHOTO_CLIMATE = Object.freeze({
    warmPathHints: [
        'farm', 'hof', 'bauer', 'brot', 'kaese', 'käse', 'fleisch', 'markt',
        'regional', 'producer', 'product', 'food', 'harvest', 'ernte',
        'wheat', 'gold', 'cream', 'natur', 'land'
    ],
    coldPathHints: [
        'neon', 'cyber', 'tech-blue', 'stock-office', 'skyscraper', 'abstract-blue'
    ]
});

export function normalizeHex(hex) {
    if (!hex) return '';
    let h = String(hex).trim().toLowerCase();
    if (!h.startsWith('#')) h = `#${h}`;
    if (/^#[0-9a-f]{3}$/.test(h)) {
        h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
    }
    return h;
}

export function isForbiddenBlue(hex) {
    const n = normalizeHex(hex);
    return FORBIDDEN_COLD_BLUE.includes(n);
}

export function paletteValues() {
    return Object.values(BRAND_PALETTE).map(normalizeHex);
}

export default {
    POLICY,
    BRAND_PALETTE,
    FORBIDDEN_COLD_BLUE,
    LOGO,
    FONTS,
    SHADOW_FAMILIES,
    FORBIDDEN_SHADOW,
    isColdBlueShadowValue,
    PHOTO_CLIMATE
};
