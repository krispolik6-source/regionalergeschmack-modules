/**
 * ETAP 37 — Device Lab Audit (static + heuristic matrix)
 *
 * Simulates required device viewports against every UI surface.
 * Policy: autoApply=false · find-only · no architecture changes.
 *
 * Usage: npm run device-lab-audit
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'docs', 'audit');
const OUT_MD = join(OUT_DIR, 'ETAP-37-DEVICE-LAB.md');
const OUT_JSON = join(OUT_DIR, 'ETAP-37-DEVICE-LAB.json');

function read(rel) {
    const full = join(ROOT, rel);
    if (!existsSync(full)) return '';
    return readFileSync(full, 'utf8');
}

const cssBundle = [
    'css/style.css',
    'css/premium-header.css',
    'css/mobile-premium.css',
    'css/ux-polish-1.css',
    'css/theme-toggle-premium.css',
    'css/final-ux-premium.css',
    'css/production-polish.css',
    'css/home-v1.css'
].map(read).join('\n');

const html = read('index.html');
const homeJs = read('js/views/home.js');
const mapJs = read('js/views/map.js');
const producerModalJs = read('js/views/producerModal.js');
const settingsJs = read('js/core/settings.js');
const i18nJs = read('js/core/i18n.js');
const landingHtml = read('landing.html');

/** CSS logical pixels — Chrome DevTools / Apple HIG equivalents */
const DEVICES = [
    { id: 'iphone-se', label: 'iPhone SE', family: 'ios', w: 375, h: 667, dpr: 2, safeTop: 20, safeBottom: 0, notch: false },
    { id: 'iphone-13', label: 'iPhone 13', family: 'ios', w: 390, h: 844, dpr: 3, safeTop: 47, safeBottom: 34, notch: true },
    { id: 'iphone-15-pro-max', label: 'iPhone 15 Pro Max', family: 'ios', w: 430, h: 932, dpr: 3, safeTop: 59, safeBottom: 34, notch: true },
    { id: 'pixel-7', label: 'Pixel 7', family: 'android', w: 412, h: 915, dpr: 2.625, safeTop: 24, safeBottom: 24, notch: true },
    { id: 'pixel-9', label: 'Pixel 9', family: 'android', w: 412, h: 915, dpr: 2.625, safeTop: 24, safeBottom: 24, notch: true },
    { id: 'galaxy-a54', label: 'Galaxy A54', family: 'android', w: 360, h: 800, dpr: 2.25, safeTop: 24, safeBottom: 20, notch: true },
    { id: 'galaxy-s24', label: 'Galaxy S24', family: 'android', w: 360, h: 780, dpr: 3, safeTop: 24, safeBottom: 24, notch: true },
    { id: 'tablet-android', label: 'Tablet Android', family: 'android-tablet', w: 800, h: 1280, dpr: 2, safeTop: 24, safeBottom: 0, notch: false },
    { id: 'ipad', label: 'iPad', family: 'ios-tablet', w: 820, h: 1180, dpr: 2, safeTop: 24, safeBottom: 20, notch: false }
];

const SCREENS = [
    { id: 'home', label: 'Home', markers: ['.home-page', 'home-greeting', 'categories-grid', 'data-view-panel="home"'] },
    { id: 'map', label: 'Mapa', markers: ['data-view-panel="map"', 'map-view', 'map-bottom-btn', 'leaflet'] },
    { id: 'premium', label: 'Premium', markers: ['premium-page', 'premium-feature', 'trialTermsCheck'] },
    { id: 'favorites', label: 'Ulubione', markers: ['favorite-item', 'favorites'] },
    { id: 'cart', label: 'Koszyk', markers: ['cart-item', 'cart-summary'] },
    { id: 'profile', label: 'Profil', markers: ['setting-item', 'profile-page', 'account-item'] },
    { id: 'landing', label: 'Landing', markers: ['landing', 'landing.html'] }
];

const POPUPS = [
    { id: 'side-menu', label: 'Side menu', markers: ['sideMenu', 'side-menu-panel'] },
    { id: 'lang-dropdown', label: 'Language dropdown', markers: ['languageDropdown', 'languageSwitcherBtn'] },
    { id: 'producer-modal', label: 'Producer modal', markers: ['producer-modal', 'producerModal'] },
    { id: 'map-popup', label: 'Leaflet map popup', markers: ['map-popup', 'popupopen'] },
    { id: 'map-settings', label: 'Map settings panel', markers: ['map-settings', 'mapSettingsPanel'] },
    { id: 'toast', label: 'Toast / notify', markers: ['toast', 'rg-toast'] },
    { id: 'auth', label: 'Auth / login', markers: ['auth-', 'login'] },
    { id: 'dev-vault', label: 'Dev vault', markers: ['dev-vault', 'devVault'] }
];

const FORMS = [
    { id: 'home-search', label: 'Home search', markers: ['type="search"', 'home-search'] },
    { id: 'map-search', label: 'Map search', markers: ['map-search', 'setSearchQuery'] },
    { id: 'review', label: 'Producer review', markers: ['name="rating"', 'name="comment"'] },
    { id: 'report', label: 'Report place', markers: ['name="reason"', 'report.notePlaceholder'] },
    { id: 'taste-diary', label: 'Taste diary', markers: ['tasteDiaryRating', 'productName'] },
    { id: 'trial', label: 'Premium trial', markers: ['trialTermsCheck', 'trialSyncMode'] },
    { id: 'producer-panel', label: 'Producer panel edit', markers: ['producerName', 'producerEmail'] },
    { id: 'map-settings-form', label: 'Map settings controls', markers: ['map-category-toggle', 'mapStyle'] },
    { id: 'feedback', label: 'Feedback (menu)', markers: ['feedback', 'report-bug'] }
];

const BUTTON_GROUPS = [
    { id: 'header', label: 'Header actions', markers: ['menuBtn', 'darkModeToggleBtn', 'languageSwitcherBtn', 'headerPremiumBtn'] },
    { id: 'bottom-nav', label: 'Bottom nav', markers: ['bottom-nav', 'nav-item', 'data-view'] },
    { id: 'home-cta', label: 'Home CTAs / categories', markers: ['home-premium-cta', 'category', 'CATEGOR'] },
    { id: 'map-controls', label: 'Map controls', markers: ['map-bottom-btn', 'locate', 'map-settings'] },
    { id: 'modal-footer', label: 'Modal actions', markers: ['producer-modal-footer', 'add-to-cart', 'favorite'] },
    { id: 'theme', label: 'Theme toggle', markers: ['darkModeToggleBtn', 'theme-toggle-premium'] },
    { id: 'language', label: 'Language switcher', markers: ['languageSwitcherBtn', 'setLanguage'] }
];

const ANIMATIONS = [
    { id: 'theme-toggle', label: 'Theme toggle motion', fileHint: 'theme-toggle-premium.css' },
    { id: 'climate', label: 'Climate / atmosphere', fileHint: 'emotions-climate' },
    { id: 'living-nature', label: 'Living nature', fileHint: 'living-nature.css' },
    { id: 'side-menu', label: 'Side menu slide', fileHint: 'side-menu' },
    { id: 'modal', label: 'Modal enter/exit', fileHint: 'producer-modal' },
    { id: 'reduced-motion', label: 'prefers-reduced-motion', fileHint: 'prefers-reduced-motion' }
];

const INTERACTION_AXES = [
    'screen',
    'buttons',
    'popup',
    'form',
    'animation',
    'scroll',
    'theme',
    'language'
];

const checks = [];
function assert(id, ok, detail, severity = 'info') {
    checks.push({ id, ok: Boolean(ok), detail, severity });
}

function markersPresent(markers, sources) {
    const blob = sources.join('\n');
    return markers.every((m) => blob.includes(m) || blob.toLowerCase().includes(String(m).toLowerCase()));
}

function anyMarker(markers, sources) {
    const blob = sources.join('\n');
    return markers.some((m) => blob.includes(m));
}

// —— Global infrastructure ——
assert('viewport-meta', /name=["']viewport["']/.test(html), 'index.html viewport meta', 'critical');
assert('viewport-fit', /viewport-fit=cover/.test(html) || /viewport-fit=cover/.test(cssBundle), 'viewport-fit=cover (notch)', 'high');
assert('safe-area-css', cssBundle.includes('safe-area-inset'), 'safe-area-inset in CSS', 'high');
assert('overflow-x', /overflow-x:\s*clip/.test(cssBundle), 'overflow-x: clip (anti horizontal scroll)', 'high');
assert('touch-44', cssBundle.includes('--mp-touch-min: 44px') || /min-height:\s*44px/.test(cssBundle), 'touch target ≥44px tokens', 'high');
assert('dvh', cssBundle.includes('100dvh'), '100dvh map/app height', 'medium');
assert('theme-toggle', html.includes('darkModeToggleBtn') && settingsJs.includes('applyDarkMode'), 'theme toggle wired', 'high');
assert('theme-changed-emit', settingsJs.includes('THEME_CHANGED'), 'THEME_CHANGED emit on toggle', 'medium');
assert('i18n-setLanguage', i18nJs.includes('export function setLanguage'), 'setLanguage export', 'high');
assert('lang-dropdown', html.includes('languageDropdown'), 'language dropdown in shell', 'high');
assert('reduced-motion', cssBundle.includes('prefers-reduced-motion'), 'reduced-motion support', 'medium');
assert('mobile-premium', Boolean(read('css/mobile-premium.css')), 'mobile-premium.css present', 'high');
assert('ux-polish', Boolean(read('css/ux-polish-1.css')), 'ux-polish-1.css present', 'medium');
{
    const style = read('css/style.css');
    const ph = read('css/premium-header.css');
    const fight = /@media[^{]*max-width:\s*430px[\s\S]*?--header-height:\s*48px/.test(style)
        && /--ph-header-h:\s*5[89]px|--ph-header-h:\s*6[0-2]px/.test(ph);
    assert('header-var-aligned', !fight, fight
        ? 'CONFLICT: style.css shrinks --header-height @≤430 while premium-header keeps taller --ph-header-h'
        : 'Header height variables aligned', 'high');
}

assert('utf8-home-price', !homeJs.includes('\uFFFD') && !/formatPrice[\s\S]{0,80}�/.test(homeJs),
    homeJs.includes('\uFFFD') ? 'home.js still has U+FFFD (prices/regex) — visible on all devices' : 'home.js UTF-8 clean',
    'critical');
assert('utf8-landing', !landingHtml.includes('\uFFFD'),
    landingHtml.includes('\uFFFD') ? 'landing.html U+FFFD — breaks DE UI on all devices' : 'landing.html UTF-8 clean',
    'critical');

// Breakpoint coverage for each device width
for (const d of DEVICES) {
    const covered =
        (d.w <= 320 && cssBundle.includes('320px')) ||
        (d.w <= 360 && (cssBundle.includes('360px') || cssBundle.includes('359px'))) ||
        (d.w <= 390 && cssBundle.includes('390px')) ||
        (d.w <= 412 && (cssBundle.includes('412px') || cssBundle.includes('430px'))) ||
        (d.w <= 430 && cssBundle.includes('430px')) ||
        (d.w >= 768 && (cssBundle.includes('768px') || cssBundle.includes('1024px')));
    assert(`bp-${d.id}`, covered, `CSS media coverage near ${d.w}px (${d.label})`, 'medium');
}

for (const s of SCREENS) {
    const src = [html, homeJs, mapJs, cssBundle, landingHtml, read('js/views/premium.js'), read('js/views/favorites.js'), read('js/views/cart.js'), read('js/views/profile.js')];
    assert(`screen-${s.id}`, anyMarker(s.markers, src), `Screen surface: ${s.label}`, 'high');
}
for (const p of POPUPS) {
    assert(`popup-${p.id}`, anyMarker(p.markers, [html, mapJs, producerModalJs, cssBundle, read('js/map/mapSettingsPanel.js'), read('js/ui/sideMenu.js')]),
        `Popup: ${p.label}`, 'high');
}
for (const f of FORMS) {
    assert(`form-${f.id}`, anyMarker(f.markers, [homeJs, mapJs, producerModalJs, read('js/views/trialSection.js'), read('js/views/producerPanel.js'), read('js/map/mapSettingsPanel.js'), html]),
        `Form: ${f.label}`, 'medium');
}
for (const b of BUTTON_GROUPS) {
    assert(`btn-${b.id}`, anyMarker(b.markers, [html, homeJs, mapJs, producerModalJs, settingsJs, cssBundle]),
        `Buttons: ${b.label}`, 'medium');
}
for (const a of ANIMATIONS) {
    const hit = cssBundle.includes(a.fileHint)
        || read('css/living-nature.css').includes('@keyframes')
        || read('css/emotions-climate.css').includes('animation')
        || (a.id === 'reduced-motion' && cssBundle.includes('prefers-reduced-motion'))
        || (a.id === 'theme-toggle' && read('css/theme-toggle-premium.css').includes('transition'))
        || (a.id === 'side-menu' && (cssBundle.includes('side-menu') || html.includes('side-menu')))
        || (a.id === 'modal' && (cssBundle.includes('producer-modal') || producerModalJs.includes('producer-modal')));
    assert(`anim-${a.id}`, hit, `Animation surface: ${a.label}`, 'low');
}

/** Risk scoring per device × axis */
function deviceRisks(device) {
    const risks = [];
    const isPhone = device.w < 600;
    const isNarrow = device.w <= 375;
    const isShort = device.h <= 700;
    const isTablet = device.w >= 768;

    if (isNarrow || isShort) {
        risks.push({ axis: 'screen', sev: 'high', note: 'Gęsty header + bottom-nav; fold Home ciasny (ETAP 36 header-height)' });
        risks.push({ axis: 'scroll', sev: 'medium', note: 'Dłuższe listy / menu legal — więcej scrollu; overflow-x clip OK' });
    }
    if (device.notch || device.safeBottom > 0) {
        risks.push({ axis: 'buttons', sev: 'medium', note: 'Safe-area bottom-nav / map FAB — CSS ma env(safe-area-*)' });
        risks.push({ axis: 'popup', sev: 'medium', note: 'Producer modal + Leaflet popup vs notch / home indicator' });
    }
    if (device.w <= 360) {
        risks.push({ axis: 'buttons', sev: 'high', note: 'Bottom-nav etykiety + 5 pozycji: ellipsis / clamp (mobile-premium)' });
        risks.push({ axis: 'form', sev: 'medium', note: 'Review / taste-diary w modalu: klawiatura może przykryć CTA' });
    }
    if (isTablet) {
        risks.push({ axis: 'screen', sev: 'medium', note: 'Tablet: więcej whitespace; layout phone-first (brak dedykowanego split-pane)' });
        risks.push({ axis: 'popup', sev: 'low', note: 'Side menu max-width; modal nie full-bleed' });
    }
    if (landingHtml.includes('\uFFFD')) {
        risks.push({ axis: 'language', sev: 'critical', note: 'landing.html DE mojibake — wszystkie urządzenia' });
    }
    if (homeJs.includes('\uFFFD')) {
        risks.push({ axis: 'screen', sev: 'critical', note: 'Home formatPrice — zamiast euro znak U+FFFD na wszystkich urządzeniach' });
    }
    risks.push({ axis: 'theme', sev: 'medium', note: 'Dark: list meta contrast (favorites/cart) — ETAP 36 HIGH' });
    risks.push({ axis: 'language', sev: 'medium', note: '36 języków; ~33 EN-klony — dropdown długi na SE' });
    risks.push({ axis: 'animation', sev: device.family.includes('ios') && isNarrow ? 'medium' : 'low',
        note: 'Climate/nature animacje; prefers-reduced-motion obecne' });
    if (isPhone) {
        risks.push({ axis: 'form', sev: 'low', note: 'File capture=environment OK na Android/iOS dla review photo' });
    }
    return risks;
}

function cellVerdict(device, screenId) {
    const all = deviceRisks(device);
    let risks;
    if (screenId === 'landing') {
        risks = all.filter((r) => r.note.includes('landing') || (r.axis === 'language' && r.sev === 'critical'));
    } else if (screenId === 'home') {
        risks = all.filter((r) => ['screen', 'scroll', 'buttons', 'theme', 'language'].includes(r.axis));
    } else if (screenId === 'map') {
        risks = all.filter((r) =>
            ['popup', 'buttons', 'scroll', 'animation'].includes(r.axis)
            || /map|Leaflet|FAB|safe-area/i.test(r.note));
    } else {
        // Other app screens: layout/theme risks only (UTF-8 price is Home-specific)
        risks = all.filter((r) =>
            (r.sev !== 'critical' || r.note.includes('landing'))
            && ['buttons', 'scroll', 'theme', 'form', 'popup'].includes(r.axis));
    }
    const hasCrit = risks.some((r) => r.sev === 'critical');
    const hasHigh = risks.some((r) => r.sev === 'high');
    const hasMed = risks.some((r) => r.sev === 'medium');
    return {
        status: hasCrit ? 'fail' : hasHigh ? 'warn' : hasMed ? 'warn' : 'pass',
        topRisks: risks.slice(0, 3)
    };
}

const matrix = DEVICES.map((d) => {
    const screens = {};
    for (const s of SCREENS) {
        screens[s.id] = cellVerdict(d, s.id);
    }
    const axes = {};
    for (const axis of INTERACTION_AXES) {
        const related = deviceRisks(d).filter((r) => r.axis === axis);
        const sev = related.some((r) => r.sev === 'critical')
            ? 'critical'
            : related.some((r) => r.sev === 'high')
                ? 'high'
                : related.some((r) => r.sev === 'medium')
                    ? 'medium'
                    : 'low';
        axes[axis] = {
            severity: sev,
            notes: related.map((r) => r.note)
        };
    }
    return {
        device: d,
        screens,
        axes,
        landscape: {
            status: d.h < 500 || d.w > d.h ? 'n/a' : 'warn',
            note: 'Landscape phone: mobile-premium kompresuje nav (@media max-height 480px) — ręcznie zweryfikować mapę'
        }
    };
});

const interactionChecklist = {
    screens: SCREENS.map((s) => s.label),
    buttonGroups: BUTTON_GROUPS.map((b) => b.label),
    popups: POPUPS.map((p) => p.label),
    forms: FORMS.map((f) => f.label),
    animations: ANIMATIONS.map((a) => a.label),
    scrollSurfaces: [
        'Home feed / categories',
        'Map producer list',
        'Side menu + legal articles',
        'Producer modal body',
        'Favorites / cart lists',
        'Premium features',
        'Language dropdown (36 langs)',
        'Profile settings'
    ],
    theme: ['Toggle light→dark', 'Toggle dark→light', 'Persist settings.darkMode', 'Landing if separate'],
    language: ['Open dropdown', 'Switch DE→EN→PL', 'Persist language', 'Menu/legal i18n keys', 'Map/filter labels']
};

const failed = checks.filter((c) => !c.ok);
const criticalFails = failed.filter((c) => c.severity === 'critical');
const highFails = failed.filter((c) => c.severity === 'high');

const verdict = criticalFails.length
    ? 'FAIL'
    : highFails.length || matrix.some((m) => Object.values(m.screens).some((c) => c.status === 'fail'))
        ? 'WARNING'
        : failed.length
            ? 'WARNING'
            : 'PASS';

const report = {
    id: 'etap-37-device-lab',
    title: 'ETAP 37 — Device Lab',
    generatedAt: new Date().toISOString(),
    policy: { autoApply: false, autoFix: false, mode: 'static-heuristic', liveBrowser: false },
    verdict,
    summary: {
        devices: DEVICES.length,
        screens: SCREENS.length,
        popups: POPUPS.length,
        forms: FORMS.length,
        buttonGroups: BUTTON_GROUPS.length,
        animations: ANIMATIONS.length,
        matrixCells: DEVICES.length * SCREENS.length,
        checksPassed: checks.filter((c) => c.ok).length,
        checksTotal: checks.length,
        criticalOpen: criticalFails.length,
        highOpen: highFails.length
    },
    devices: DEVICES,
    interactionChecklist,
    matrix,
    checks,
    findings: [
        {
            sev: 'CRITICAL',
            devices: 'ALL',
            area: 'UTF-8 / Home',
            detail: 'home.js U+FFFD w formatPrice — ceny na każdym urządzeniu'
        },
        {
            sev: 'CRITICAL',
            devices: 'ALL (landing)',
            area: 'UTF-8 / Landing',
            detail: 'landing.html DE mojibake'
        },
        {
            sev: 'HIGH',
            devices: '≤430 phone (SE, 13, A54, S24, Pixel*)',
            area: 'Header',
            detail: '--header-height vs --ph-header-h — overlap / gęstość przycisków'
        },
        {
            sev: 'HIGH',
            devices: 'SE / A54 / S24 (≤375–360)',
            area: 'Nav + Home fold',
            detail: '5-item bottom-nav + Premium CTA clamp; krótki viewport SE'
        },
        {
            sev: 'HIGH',
            devices: 'notched phones',
            area: 'Map popup + modal',
            detail: 'Leaflet popup + producer modal vs safe-area; guard popup istnieje w JS'
        },
        {
            sev: 'MEDIUM',
            devices: 'tablet / iPad',
            area: 'Layout',
            detail: 'Phone-first; brak split-view — dużo pustki, menu nie desktopowy'
        },
        {
            sev: 'MEDIUM',
            devices: 'ALL',
            area: 'Theme dark',
            detail: 'Favorites/cart .meta kontrast w dark (ETAP 36)'
        },
        {
            sev: 'MEDIUM',
            devices: 'SE + language',
            area: 'i18n dropdown',
            detail: '36 języków — długi scroll listbox na małym ekranie'
        },
        {
            sev: 'MEDIUM',
            devices: 'phones + keyboard',
            area: 'Forms',
            detail: 'Review / diary / trial w modalu — ryzyko przykrycia CTA przez klawiaturę (brak visualViewport pad)'
        },
        {
            sev: 'LOW',
            devices: 'landscape phone',
            area: 'Orientation',
            detail: 'CSS landscape rules w mobile-premium — wymaga ręcznego smoke'
        }
    ],
    manualProtocol: [
        'npm start → Chrome/Safari DevTools Device Mode',
        'Dla każdego z 9 urządzeń: portrait, potem landscape (telefony)',
        'Ścieżka: Home → kategoria → Mapa → marker popup → Producent → Ulubione → Koszyk → Premium → Profil → Menu (legal scroll)',
        'Na każdym: theme toggle ×2, language DE→EN→PL, search submit, map settings, review form open',
        'Sprawdź: brak overflow-x, touch ≥44, safe-area, modal nie pod notch, ceny €, landing DE',
        'iOS Safari + Chrome Android real device smoke przed release (DevTools ≠ 100%)'
    ],
    nextSteps: [
        'P0 UTF-8 (home.js, landing.html, pushNotifications) — odblokowuje Device Lab PASS na treściach',
        'P0 Align --header-height / --ph-header-h @≤430',
        'P1 Ręczny smoke SE + iPhone 15 Pro Max + Galaxy A54 (portrait+landscape)',
        'P2 Opcjonalnie Playwright device project matrix (poza tym etapem)'
    ]
};

function statusIcon(st) {
    if (st === 'pass') return '✓';
    if (st === 'warn') return '!';
    return '✗';
}

function toMarkdown(r) {
    const lines = [
        `# ${r.title}`,
        '',
        `**Data:** ${r.generatedAt.slice(0, 10)}  `,
        `**Polityka:** autoApply=false · find-only · static/heuristic (bez live Chromium w CI)  `,
        `**Werdykt:** **${r.verdict}**`,
        '',
        '> Pełna „każdy przycisk na każdym urządzeniu” w przeglądarce wymaga ręcznego / Playwright smoke. Ten etap buduje **matrycę 9 urządzeń × powierzchnie UI**, checki CSS/JS i ryzyka przeniesione z ETAP 35–36.',
        '',
        '## Werdykt',
        '',
        '| Status | Znaczenie |',
        '|--------|-----------|',
        '| PASS | Powierzchnie UI obecne · breakpointy pokryte · brak CRITICAL treści |',
        '| WARNING | Infrastruktura responsive OK, ale UTF-8 / header / dark / SE fold blokują lab PASS |',
        '| FAIL | CRITICAL widoczne na wszystkich urządzeniach (ceny / landing) |',
        '',
        `**Aktualnie: ${r.verdict}** · checks ${r.summary.checksPassed}/${r.summary.checksTotal} · macierz ${r.summary.matrixCells} komórek`,
        '',
        '## Urządzenia (CSS px)',
        '',
        '| Urządzenie | Rodzina | Viewport | DPR | Safe T/B | Notch |',
        '|------------|---------|----------|----:|----------|:-----:|'
    ];
    for (const d of r.devices) {
        lines.push(`| ${d.label} | ${d.family} | ${d.w}×${d.h} | ${d.dpr} | ${d.safeTop}/${d.safeBottom} | ${d.notch ? 'yes' : 'no'} |`);
    }

    lines.push('', '## Inwentaryzacja powierzchni', '');
    lines.push(`- **Ekrany (${r.summary.screens}):** ${r.interactionChecklist.screens.join(', ')}`);
    lines.push(`- **Przyciski (${r.summary.buttonGroups} grup):** ${r.interactionChecklist.buttonGroups.join(', ')}`);
    lines.push(`- **Popup / overlay (${r.summary.popups}):** ${r.interactionChecklist.popups.join(', ')}`);
    lines.push(`- **Formularze (${r.summary.forms}):** ${r.interactionChecklist.forms.join(', ')}`);
    lines.push(`- **Animacje (${r.summary.animations}):** ${r.interactionChecklist.animations.join(', ')}`);
    lines.push('- **Scroll:** ' + r.interactionChecklist.scrollSurfaces.join('; '));
    lines.push('- **Motyw:** ' + r.interactionChecklist.theme.join('; '));
    lines.push('- **Język:** ' + r.interactionChecklist.language.join('; '));

    lines.push('', '## Macierz urządzenia × ekran', '');
    const screenIds = SCREENS.map((s) => s.id);
    lines.push('| Device | ' + SCREENS.map((s) => s.label).join(' | ') + ' |');
    lines.push('|--------|' + SCREENS.map(() => '---').join('|') + '|');
    for (const row of r.matrix) {
        const cells = screenIds.map((id) => statusIcon(row.screens[id].status));
        lines.push(`| ${row.device.label} | ${cells.join(' | ')} |`);
    }
    lines.push('', 'Legenda: ✓ pass · ! warn · ✗ fail (treść CRITICAL globalna → fail na Home/Landing)', '');

    lines.push('## Osie interakcji × urządzenie (max severity)', '');
    lines.push('| Device | ' + INTERACTION_AXES.join(' | ') + ' |');
    lines.push('|--------|' + INTERACTION_AXES.map(() => '---').join('|') + '|');
    for (const row of r.matrix) {
        const cells = INTERACTION_AXES.map((a) => row.axes[a].severity);
        lines.push(`| ${row.device.label} | ${cells.join(' | ')} |`);
    }

    lines.push('', '## Findings (cross-device)', '');
    lines.push('| Sev | Devices | Area | Detail |');
    lines.push('|-----|---------|------|--------|');
    for (const f of r.findings) {
        lines.push(`| ${f.sev} | ${f.devices} | ${f.area} | ${f.detail} |`);
    }

    lines.push('', '## Checklist techniczna', '');
    for (const c of r.checks) {
        lines.push(`- ${c.ok ? '✓' : '✗'} \`${c.id}\` (${c.severity}) — ${c.detail}`);
    }

    lines.push('', '## Protokół ręczny (obowiązkowy przed release)', '');
    r.manualProtocol.forEach((step, i) => lines.push(`${i + 1}. ${step}`));

    lines.push('', '## Następne kroki', '');
    r.nextSteps.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
    lines.push('', '---', '', '*ETAP 37 · Device Lab · linked: ETAP 36 Zero Bug, ETAP 28C Responsive Premium*');
    lines.push('');
    return lines.join('\n');
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_JSON, JSON.stringify(report, null, 2), 'utf8');
writeFileSync(OUT_MD, toMarkdown(report), 'utf8');

console.log(`[Device Lab] ${verdict} · ${report.summary.checksPassed}/${report.summary.checksTotal} checks · ${report.summary.matrixCells} cells`);
console.log(`Wrote: ${relative(ROOT, OUT_MD)}`);
process.exit(criticalFails.length ? 1 : 0);
