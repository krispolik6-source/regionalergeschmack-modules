/**
 * Smoke: Google AdSense – język (36) + lokalizacja + baner Home
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function assert(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error(`FAIL ${msg}`);
    } else {
        console.log(`OK   ${msg}`);
    }
}

const store = new Map();
globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k)
};
globalThis.sessionStorage = globalThis.localStorage;
try {
    Object.defineProperty(globalThis, 'navigator', {
        value: { language: 'de-DE', languages: ['de-DE', 'en'] },
        configurable: true,
        writable: true
    });
} catch {
    /* keep existing navigator */
}
const docEl = {
    lang: 'de',
    attrs: {},
    setAttribute(k, v) { this.attrs[k] = v; },
    getAttribute(k) { return this.attrs[k] ?? null; }
};
const headKids = [];
globalThis.document = {
    documentElement: docEl,
    getElementById: () => null,
    createElement: () => ({ setAttribute() {}, appendChild() {}, style: {} }),
    head: { appendChild(n) { headKids.push(n); } },
    querySelector: () => null,
    querySelectorAll: () => []
};
globalThis.window = {
    ...globalThis,
    location: { href: 'https://example.test/', pathname: '/', search: '', hash: '' },
    history: { replaceState() {} },
    adsbygoogle: []
};

store.set('cookie_consent', 'accepted');

const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
assert(html.includes('pagead2.googlesyndication.com'), 'AdSense script in index.html');
assert(html.includes('data-rg-adsense="1"'), 'AdSense loader marker');
assert(html.includes('window.adsbygoogle'), 'adsbygoogle bootstrap');

const cfg = readFileSync(join(ROOT, 'js/config.js'), 'utf8');
assert(cfg.includes('ADSENSE_CONFIG'), 'ADSENSE_CONFIG present');
assert(cfg.includes('enabled: true'), 'AdSense enabled');

const mod = await import(pathToFileURL(join(ROOT, 'js/presentation/adsense.js')).href);
assert(typeof mod.buildHomeAdSenseHtml === 'function', 'buildHomeAdSenseHtml export');
assert(typeof mod.initAdSense === 'function', 'initAdSense export');
assert(typeof mod.resolveAdSenseLanguage === 'function', 'resolveAdSenseLanguage');
assert(typeof mod.detectBrowserAdLanguage === 'function', 'detectBrowserAdLanguage');
assert(typeof mod.remountHomeAdSense === 'function', 'remountHomeAdSense');
assert(typeof mod.teardownHomeAdSense === 'function', 'teardownHomeAdSense');
assert(typeof mod.syncAdSenseDocumentLocale === 'function', 'syncAdSenseDocumentLocale');
assert(typeof mod.logAdSenseDiagnostics === 'function', 'logAdSenseDiagnostics');
assert(typeof mod.detectAdSenseLocaleSource === 'function', 'detectAdSenseLocaleSource');

const adsSrcCheck = readFileSync(join(ROOT, 'js/presentation/adsense.js'), 'utf8');
assert(adsSrcCheck.includes('[ADSENSE DIAGNOSTICS]'), 'diagnostics prefix');
assert(adsSrcCheck.includes('language-changed+remount'), 'P3 combined diagnostic event');
assert(adsSrcCheck.includes('scheduleLanguageRemount'), 'P1 debounced remount scheduler');
assert(adsSrcCheck.includes('scheduleAdLoad') || adsSrcCheck.includes('attachLazyAdObserver'), 'P1 lazy ad load');
assert(adsSrcCheck.includes('IntersectionObserver'), 'P1 IntersectionObserver lazy load');
assert(adsSrcCheck.includes('LANG_REMOUNT_DEBOUNCE_MS = 200') || adsSrcCheck.includes('200'), 'P1 debounce 200ms');
assert(adsSrcCheck.includes('lastRemountedLanguage'), 'P1 skip same language');
assert(adsSrcCheck.includes('isHostAlreadyInitialized') || adsSrcCheck.includes('data-rg-ad-initialized'), 'P3 prevent re-init');
assert(adsSrcCheck.includes('isElementVisibleForAds'), 'P2 skip hidden container');
assert(adsSrcCheck.includes('teardownHomeAdSense'), 'teardown on destroy');
assert(adsSrcCheck.includes('[AdsDiag]'), 'P4 localhost AdsDiag prefix');
assert(adsSrcCheck.includes('isLocalhostDiag'), 'P4 localhost-only diag gate');
assert(adsSrcCheck.includes('role="complementary"'), 'P6 aria role complementary');
assert(adsSrcCheck.includes('hasManualUiLanguage') || adsSrcCheck.includes("rs_lang"), 'P2 manual UI guard');
assert(adsSrcCheck.includes('navigator-languagechange-diag-only'), 'P2 diag-only when rs_lang set');
assert(adsSrcCheck.includes('languagechange'), 'listens navigator languagechange');
assert(adsSrcCheck.includes('NOT SUPPORTED'), 'logs NOT SUPPORTED for language param');
assert(adsSrcCheck.includes('console.groupCollapsed') || adsSrcCheck.includes('console.info'), 'styled/grouped console');
// P3: nie ma osobnego logu language-changed przed remount
assert(
    !/logAdSenseDiagnostics\(\s*'manual'\s*,\s*\{\s*event:\s*'language-changed'\s*\}\s*\)/.test(adsSrcCheck),
    'P3 no separate language-changed log'
);

const snippet = mod.buildHomeAdSenseHtml();
assert(snippet.includes('data-home-adsense'), 'home container data-home-adsense');
assert(snippet.includes('data-rg-ad-lang'), 'ad lang attribute');
assert(snippet.includes('rg-adsense-label') || snippet.includes('rg-ad-label'), 'Reklama label class');
assert(mod.shouldShowAdSense() === true, 'AdSense shown');
// P8: jednostka responsywna (buildInsHtml; placeholder bez client/slot nie zawiera <ins>)
assert(adsSrcCheck.includes('data-full-width-responsive="true"'), 'P8 full-width responsive true');
assert(!adsSrcCheck.includes('data-full-width-responsive="false"'), 'P8 not false');
assert(/buildInsHtml[\s\S]*?height:\s*90px/.test(adsSrcCheck), 'P8 keeps 90px height on ins');
assert(
    /rg-adsense-frame\s*\{[^}]*max-height:\s*90px/.test(
        readFileSync(join(ROOT, 'css/style.css'), 'utf8')
    ),
    'P8 frame CSS max-height 90px'
);

const home = readFileSync(join(ROOT, 'js/views/home.js'), 'utf8');
assert(home.includes('buildHomeAdSenseHtml'), 'home uses AdSense HTML');
assert(home.includes('mountHomeAdSense'), 'home mounts AdSense');
assert(home.includes('teardownHomeAdSense'), 'home teardown AdSense on destroy');

const app = readFileSync(join(ROOT, 'js/app.js'), 'utf8');
assert(app.includes('initAdSense'), 'app inits AdSense');

const adsSrc = readFileSync(join(ROOT, 'js/presentation/adsense.js'), 'utf8');
assert(adsSrc.includes('adsenseAcceptsLanguageParam: false'), 'documents no language push param');
assert(adsSrc.includes('LANGUAGE_CHANGED'), 'listens language change');
assert(adsSrc.includes('remountHomeAdSense'), 'remounts on language change');
assert(adsSrc.includes('syncAdSenseUrlLang') || adsSrc.includes('searchParams.set'), 'URL ?lang= signal');
assert(adsSrc.includes('navigator.language') || adsSrc.includes('detectBrowserAdLanguage'), 'reads navigator.language');
assert(!/adsbygoogle\.push\(\s*\{[^}]*language\s*:/.test(adsSrc), 'does not fake language in push()');

const { SUPPORTED_LANGUAGE_CODES } = await import(pathToFileURL(join(ROOT, 'js/translations.js')).href);
assert(SUPPORTED_LANGUAGE_CODES.length === 36, `36 languages (got ${SUPPORTED_LANGUAGE_CODES.length})`);
assert(SUPPORTED_LANGUAGE_CODES.includes('de'), 'has de');
assert(SUPPORTED_LANGUAGE_CODES.includes('zh'), 'has zh');
assert(SUPPORTED_LANGUAGE_CODES.includes('ru'), 'has ru');
assert(SUPPORTED_LANGUAGE_CODES.includes('zh-tw'), 'has zh-tw');

assert(mod.detectBrowserAdLanguage() === 'de', 'browser de-DE → de');
assert(mod.toHtmlLang('zh-tw') === 'zh-Hant', 'zh-tw → zh-Hant');
assert(mod.toHtmlLang('zh') === 'zh-Hans', 'zh → zh-Hans');
assert(mod.toHtmlLang('no') === 'nb', 'no → nb');
assert(mod.resolveAdSenseLanguage('ru') === 'ru', 'resolve ru');
assert(mod.resolveAdSenseLanguage('zh') === 'zh', 'resolve zh');

// P6: pełna mapa BCP-47 dla 36 języków
let htmlMapMiss = 0;
for (const code of SUPPORTED_LANGUAGE_CODES) {
    const html = mod.toHtmlLang(code);
    if (!html || html === 'undefined') htmlMapMiss += 1;
}
assert(htmlMapMiss === 0, `P6 toHtmlLang covers all 36 (miss=${htmlMapMiss})`);
assert(mod.toHtmlLang('de') === 'de', 'P6 de → de');
assert(mod.toHtmlLang('ja') === 'ja', 'P6 ja → ja');
assert(adsSrc.includes("no: 'nb'") || adsSrc.includes('no: "nb"'), 'P6 map has no→nb');
assert(adsSrc.includes("zh: 'zh-Hans'") || adsSrc.includes('zh: "zh-Hans"'), 'P6 map has zh→zh-Hans');
assert((adsSrc.match(/^\s+[a-z]{2}(?:-tw)?: '/gm) || []).length >= 30 || adsSrc.includes("hi: 'hi'"), 'P6 map is full');

// P4: brak GPS request w ścieżce AdSense
assert(!/import\s*\{[^}]*requestCurrentPosition/.test(adsSrc), 'P4 no requestCurrentPosition import');
assert(!/requestCurrentPosition\s*\(/.test(adsSrc), 'P4 no requestCurrentPosition call');
assert(adsSrc.includes('getLastPosition'), 'P4 uses stored position only');
assert(adsSrc.includes("data-rg-adsense-gps=\"none\"") || adsSrc.includes("adsense-gps=\"none\""), 'P4 gps none when no stored');

// P5: unfilled watch bez display:none
assert(adsSrc.includes('watchAdUnitFill') || adsSrc.includes('data-ad-status'), 'P5 watches ad status');
assert(adsSrc.includes('UNFILLED_WATCH_MS') || adsSrc.includes('4000'), 'P5 timeout ~4s');
assert(adsSrc.includes('unfilled'), 'P5 handles unfilled');
assert(!/ins\.style\.display\s*=\s*['"]none['"]/.test(adsSrc), 'P5 never display:none on ins');
assert(!/setProperty\(\s*['"]display['"]\s*,\s*['"]none['"]/.test(adsSrc), 'P5 no display none via setProperty');

// P7: ?lang= tylko przy zmianie + zachowanie UTM
assert(adsSrc.includes('current === lang') || /searchParams\.get\('lang'\)\s*===\s*lang/.test(adsSrc), 'P7 skip when lang unchanged');
let replaceCalls = 0;
const utmHref = 'https://example.test/?utm_source=test&utm_medium=cpc&lang=de';
globalThis.window.location = {
    href: utmHref,
    pathname: '/',
    search: '?utm_source=test&utm_medium=cpc&lang=de',
    hash: ''
};
globalThis.window.history = {
    replaceState(_s, _t, next) {
        replaceCalls += 1;
        const u = new URL(next, 'https://example.test');
        globalThis.window.location = {
            href: u.href,
            pathname: u.pathname,
            search: u.search,
            hash: u.hash
        };
    }
};
mod.syncAdSenseUrlLang('de');
assert(replaceCalls === 0, 'P7 no replaceState when lang unchanged');
mod.syncAdSenseUrlLang('pl');
assert(replaceCalls === 1, 'P7 replaceState once on real change');
assert(
    String(globalThis.window.location.search).includes('utm_source=test') &&
        String(globalThis.window.location.search).includes('utm_medium=cpc') &&
        String(globalThis.window.location.search).includes('lang=pl'),
    'P7 preserves UTM params'
);

const ctx = mod.getAdSenseLocaleContext();
assert(ctx.adsenseAcceptsLanguageParam === false, 'no language API param');
assert(ctx.supportedCount === 36, 'context: 36 langs');
assert(ctx.languageSignal.includes('html-lang'), 'language signal described');
assert(ctx.adsenseAcceptsGps === false, 'P4 adsenseAcceptsGps false');

const synced = mod.syncAdSenseDocumentLocale('zh');
assert(synced === 'zh', 'sync returns zh');
assert(docEl.lang === 'zh-Hans' || docEl.getAttribute('data-rg-ui-lang') === 'zh', 'html lang synced for zh');

if (failed) {
    console.error(`\n${failed} failure(s)`);
    process.exit(1);
}
console.log('\nAll adsense language checks passed.');
