/**
 * ETAP 39 — Self-Healing
 *
 * Aplikacja wykrywa i naprawia drobne problemy w RUNTIME (stan),
 * bez przepisywania kodu źródłowego domeny / Store / API.
 *
 * Zakres:
 *  - zdjęcia kategorii / ikony / układ modalu (ETAP wcześniejszy)
 *  - mapa Leaflet (re-init) · GPS last-known · markery
 *  - EventBus / nav listeners (rebind)
 *  - obrazy → placeholder
 *  - stary Service Worker → propozycja odświeżenia
 */

import { getCategoryImage, getCategoryImageJpeg } from '../presentation/categoryImages.js?v=6';
import { ensureNavigationHealed } from '../controllers/navigation.js';
import { showToast } from '../core/toast.js';
import { getSettings } from '../core/settings.js';

const LOG_KEY = 'rg_self_heal_log';
const DAY_KEY = 'rg_self_heal_day';
const SW_PROMPT_KEY = 'rg_self_heal_sw_prompt';
const MAX_LOG = 80;
const WATCHDOG_MS = 28000;
const PLACEHOLDER_SRC = '/assets/icons/logo-master.svg?v=28';

/** @type {{ at: string, area: string, action: string, detail?: string }[]} */
let sessionFixes = [];
let bound = false;
let observer = null;
let watchdogTimer = null;
let imageErrorBound = false;
let swWatchBound = false;

function dayStamp() {
    return new Date().toISOString().slice(0, 10);
}

function pushFix(area, action, detail = '') {
    const entry = { at: new Date().toISOString(), area, action, detail };
    sessionFixes.push(entry);
    try {
        const prev = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
        const next = Array.isArray(prev) ? prev : [];
        next.push(entry);
        while (next.length > MAX_LOG) next.shift();
        localStorage.setItem(LOG_KEY, JSON.stringify(next));
    } catch {
        /* ignore */
    }
    console.info('[SelfHeal]', area, action, detail || '');
}

export function getSelfHealLog() {
    try {
        const raw = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
        return Array.isArray(raw) ? raw : [];
    } catch {
        return [...sessionFixes];
    }
}

export function getSessionSelfHealFixes() {
    return [...sessionFixes];
}

function expectedAssetForCategory(category) {
    const key = String(category || '').toLowerCase().trim();
    if (!key) return null;
    if (key === 'shop' || key === 'shops' || key === 'laden' || key === 'supermarket' || key === 'vending') {
        return 'category_shops';
    }
    if (key === 'honey') return 'category_honey';
    if (key === 'farmer' || key === 'farmers') return 'category_farmers';
    if (key === 'bakery' || key === 'bakeries') return 'category_bakeries';
    if (key === 'meat') return 'category_meat';
    if (key === 'restaurant' || key === 'restaurants') return 'category_restaurants';
    if (key === 'fast_food' || key === 'fastfood' || key === 'fastFood') return 'category_fastFood';
    return null;
}

function imgUsesAsset(el, assetStem) {
    const src = `${el.getAttribute('src') || ''} ${el.currentSrc || ''}`;
    const sources = el.closest('picture')
        ? [...el.closest('picture').querySelectorAll('source')].map((s) => s.getAttribute('srcset') || '')
        : [];
    const blob = `${src} ${sources.join(' ')}`;
    return blob.includes(assetStem);
}

/**
 * SMART FIX – zdjęcia: sklep ≠ pasieka, kategoria → właściwy asset.
 * @param {ParentNode} [root]
 * @returns {number}
 */
export function healCategoryPhotos(root = document) {
    let n = 0;
    const modal = root.querySelector?.('.producer-modal') || root.getElementById?.('producerModal');
    const scope = modal || root;
    const category =
        (modal && modal.dataset?.category) ||
        (modal && modal.dataset?.character === 'shop' ? 'shop' : '') ||
        '';

    const frames = scope.querySelectorAll?.(
        '.producer-photo-frame img, .producer-photo-img, .producer-modal-header picture img'
    ) || [];

    frames.forEach((img) => {
        const cat = category || img.closest('[data-category]')?.dataset?.category || '';
        const expected = expectedAssetForCategory(cat);
        if (!expected) return;

        const frame = img.closest('.producer-photo-frame');
        const isSample = frame?.classList.contains('is-sample') || imgUsesAsset(img, 'category_');
        if (!isSample) return;

        const isShop = expected === 'category_shops';
        const wrongHoney = isShop && imgUsesAsset(img, 'category_honey');
        const wrongCategory =
            imgUsesAsset(img, 'category_') && !imgUsesAsset(img, expected);

        if (!wrongHoney && !wrongCategory) return;

        const webp = getCategoryImage(isShop ? 'shop' : cat);
        const jpeg = getCategoryImageJpeg(isShop ? 'shop' : cat);
        if (!webp) return;

        const picture = img.closest('picture');
        if (picture) {
            picture.querySelectorAll('source').forEach((s) => {
                if ((s.getAttribute('srcset') || '').includes('.webp')) {
                    s.setAttribute('srcset', webp);
                }
            });
        }
        img.setAttribute('src', jpeg || webp);
        n += 1;
        pushFix('photos', 'category_image_corrected', `${cat} → ${expected}`);
    });

    root.querySelectorAll?.('[data-category].category-card--photo, .category-card--photo[data-category]').forEach((card) => {
        const cat = card.dataset.category || '';
        const expected = expectedAssetForCategory(cat);
        if (!expected) return;
        const style = card.getAttribute('style') || '';
        if (expected === 'category_shops' && style.includes('category_honey')) {
            const url = getCategoryImage(cat === 'shops' ? 'shops' : 'shop');
            if (!url) return;
            card.setAttribute('style', `--category-image:url('${url}')`);
            n += 1;
            pushFix('photos', 'home_category_image_corrected', cat);
        }
    });

    return n;
}

function isBrokenGlyph(text) {
    const s = String(text || '').trim();
    if (!s) return true;
    if (/^\?+$/.test(s)) return true;
    if (s.includes('\uFFFD')) return true;
    if (/^\?{1,4}$/.test(s.replace(/\s/g, ''))) return true;
    return false;
}

function emojiSupportOk() {
    try {
        if (typeof document === 'undefined') return true;
        const canvas = document.createElement('canvas');
        canvas.width = 2;
        canvas.height = 2;
        const ctx = canvas.getContext('2d');
        if (!ctx) return true;
        ctx.textBaseline = 'top';
        ctx.font = '16px sans-serif';
        ctx.fillText('\u{1F3E0}', 0, 0);
        const data = ctx.getImageData(0, 0, 2, 2).data;
        return data.some((v, i) => i % 4 !== 3 && v !== 0);
    } catch {
        return true;
    }
}

const NAV_TEXT = {
    home: 'Home',
    map: 'Map',
    search: 'Suche',
    favorites: 'Fav',
    profile: 'Profil'
};

/**
 * SMART FIX – ikony: ?? / brak emoji → krótki tekst (bez zmiany kolorów).
 * @param {ParentNode} [root]
 * @returns {number}
 */
export function healBrokenIcons(root = document) {
    let n = 0;
    const preferText = !emojiSupportOk();

    root.querySelectorAll?.('.bottom-nav .nav-item').forEach((item) => {
        const icon = item.querySelector('.nav-icon');
        if (!icon) return;
        const view = item.dataset.view || '';
        const label = NAV_TEXT[view] || view || '·';
        if (preferText || isBrokenGlyph(icon.textContent)) {
            if (icon.textContent !== label) {
                icon.textContent = label;
                icon.classList.add('rg-selfheal-text-icon');
                n += 1;
                pushFix('icons', 'nav_icon_text', view);
            }
        }
    });

    const menuBtn = root.getElementById?.('menuBtn') || root.querySelector?.('#menuBtn');
    if (menuBtn && (preferText || isBrokenGlyph(menuBtn.textContent))) {
        if (menuBtn.textContent !== 'Menu') {
            menuBtn.textContent = 'Menu';
            n += 1;
            pushFix('icons', 'menu_btn_text', 'Menu');
        }
    }

    const darkBtn = root.getElementById?.('darkModeToggleBtn');
    if (darkBtn && (preferText || isBrokenGlyph(darkBtn.textContent))) {
        const isDark = document.body.classList.contains('dark-mode');
        const next = isDark ? '🌙' : '🌞';
        if (darkBtn.textContent !== next) {
            darkBtn.textContent = next;
            n += 1;
            pushFix('icons', 'dark_btn_text', next);
        }
    }

    root.querySelectorAll?.('.side-menu-item-icon').forEach((el) => {
        if (el.querySelector('img')) return;
        if (preferText || isBrokenGlyph(el.textContent)) {
            const action = el.closest('[data-side-menu-action]')?.dataset?.sideMenuAction || '';
            const short = (action || '·').slice(0, 2).toUpperCase();
            if (el.textContent !== short) {
                el.textContent = short;
                n += 1;
                pushFix('icons', 'side_menu_icon_text', action);
            }
        }
    });

    return n;
}

/**
 * SMART FIX – układ: zdjęcie w modalu nie zasłania tekstu (tylko max-height/margin inline).
 * @param {ParentNode} [root]
 * @returns {number}
 */
export function healModalPhotoLayout(root = document) {
    let n = 0;
    const frames = root.querySelectorAll?.(
        '.producer-modal-header .producer-photo-frame, #producerModal .producer-photo-frame'
    ) || [];

    frames.forEach((frame) => {
        const h = frame.offsetHeight || 0;
        const style = frame.style;
        let changed = false;
        if (h > 160 || parseInt(style.maxHeight || '0', 10) > 160) {
            style.maxHeight = '160px';
            style.height = '160px';
            style.width = '100%';
            changed = true;
        }
        const mb = parseInt(getComputedStyle(frame).marginBottom || '0', 10);
        if (mb < 16) {
            style.marginBottom = '16px';
            changed = true;
        }
        if (changed) {
            n += 1;
            pushFix('layout', 'modal_photo_capped', `h=${h}`);
        }
    });

    const body = root.querySelector?.('.producer-modal-body');
    if (body) {
        const oy = getComputedStyle(body).overflowY;
        if (oy !== 'auto' && oy !== 'scroll') {
            body.style.overflowY = 'auto';
            n += 1;
            pushFix('layout', 'modal_body_scroll', oy);
        }
    }

    return n;
}

/**
 * ETAP 39 — mapa / GPS / markery (stan Leaflet via public heal API).
 * @returns {Promise<{ map: number, gps: number, markers: number }>}
 */
export async function healMapRuntime() {
    try {
        const mod = await import('../views/map.js?v=48');
        const r = mod.healMapRuntimeState?.() || { map: 0, gps: 0, markers: 0, detail: [] };
        if (r.map) pushFix('map', 'leaflet_repaired', (r.detail || []).join(','));
        if (r.gps) pushFix('gps', 'last_known_applied', (r.detail || []).join(','));
        if (r.markers) pushFix('markers', 'markers_rebuilt', (r.detail || []).join(','));
        return { map: r.map || 0, gps: r.gps || 0, markers: r.markers || 0 };
    } catch (err) {
        pushFix('map', 'heal_import_fail', err?.message || 'error');
        return { map: 0, gps: 0, markers: 0 };
    }
}

/**
 * ETAP 39 — EventBus / nav: zarejestruj ponownie krytyczne listenery.
 * @returns {number}
 */
export function healEventBusListeners() {
    try {
        const r = ensureNavigationHealed();
        const n = (r?.navButtons || 0) + (r?.navigateBus ? 1 : 0);
        if (n) pushFix('eventbus', 'listeners_rebound', `navButtons=${r.navButtons || 0}`);
        return n > 0 ? 1 : 0;
    } catch (err) {
        pushFix('eventbus', 'rebind_fail', err?.message || 'error');
        return 0;
    }
}

function applyImagePlaceholder(img) {
    if (!img || img.dataset.selfHealPlaceholder === '1') return false;
    img.dataset.selfHealPlaceholder = '1';
    img.classList.add('rg-selfheal-img-fallback');
    try {
        img.removeAttribute('srcset');
        const picture = img.closest('picture');
        picture?.querySelectorAll('source')?.forEach((s) => s.removeAttribute('srcset'));
    } catch {
        /* ignore */
    }
    img.src = PLACEHOLDER_SRC;
    img.alt = img.alt || 'Regionaler Geschmack';
    return true;
}

/**
 * ETAP 39 — uszkodzone <img> → logo placeholder (stan DOM).
 * @param {ParentNode} [root]
 * @returns {number}
 */
export function healBrokenImages(root = document) {
    let n = 0;
    root.querySelectorAll?.('img').forEach((img) => {
        if (img.dataset.selfHealPlaceholder === '1') return;
        // naturalWidth 0 po complete = broken
        if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) {
            if (applyImagePlaceholder(img)) {
                n += 1;
                pushFix('images', 'placeholder', img.getAttribute('src') || '');
            }
        }
    });
    return n;
}

function bindImageErrorHealing() {
    if (imageErrorBound || typeof document === 'undefined') return;
    imageErrorBound = true;
    document.addEventListener('error', (event) => {
        const t = event.target;
        if (!t || t.tagName !== 'IMG') return;
        if (applyImagePlaceholder(t)) {
            pushFix('images', 'placeholder_onerror', t.getAttribute('src') || '');
        }
    }, true);
}

function showSwRefreshPrompt() {
    try {
        const today = dayStamp();
        if (sessionStorage.getItem(SW_PROMPT_KEY) === today) return;
        sessionStorage.setItem(SW_PROMPT_KEY, today);
    } catch {
        /* ignore */
    }

    let banner = document.getElementById('rgSelfHealSwBanner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'rgSelfHealSwBanner';
        banner.setAttribute('role', 'status');
        banner.style.cssText = [
            'position:fixed',
            'left:50%',
            'bottom:calc(var(--nav-height, 60px) + var(--safe-bottom, 0px) + 12px)',
            'transform:translateX(-50%)',
            'z-index:10050',
            'max-width:min(92vw,420px)',
            'padding:12px 14px',
            'border-radius:12px',
            'background:#2a3f28',
            'color:#f5efe3',
            'font:600 14px/1.35 "Source Sans 3",system-ui,sans-serif',
            'box-shadow:0 8px 28px rgba(0,0,0,.28)',
            'display:flex',
            'gap:10px',
            'align-items:center'
        ].join(';');
        banner.innerHTML = `
            <span style="flex:1" data-rg-sw-msg></span>
            <button type="button" data-rg-sw-reload style="
                border:0;border-radius:999px;padding:8px 14px;cursor:pointer;
                background:#c9a227;color:#1c1812;font:700 13px/1 Source Sans 3,system-ui,sans-serif;
            ">OK</button>
            <button type="button" data-rg-sw-dismiss aria-label="Close" style="
                border:0;background:transparent;color:#f5efe3;cursor:pointer;font-size:18px;line-height:1;
            ">×</button>
        `;
        document.body.appendChild(banner);
        banner.querySelector('[data-rg-sw-reload]')?.addEventListener('click', () => {
            pushFix('sw', 'user_refresh', 'reload');
            location.reload();
        });
        banner.querySelector('[data-rg-sw-dismiss]')?.addEventListener('click', () => {
            banner.hidden = true;
            pushFix('sw', 'user_dismiss', 'banner');
        });
    }

    const msg = banner.querySelector('[data-rg-sw-msg]');
    if (msg) {
        let lang = 'de';
        try {
            lang = String(getSettings()?.language || 'de').slice(0, 2).toLowerCase();
        } catch {
            /* ignore */
        }
        msg.textContent = lang === 'pl'
            ? 'Nowa wersja jest gotowa. Odśwież aplikację.'
            : lang === 'en'
                ? 'A new version is ready. Refresh the app.'
                : 'Neue Version verfügbar. App aktualisieren?';
    }
    banner.hidden = false;
    try {
        showToast(msg?.textContent || 'Update', 'info');
    } catch {
        /* ignore */
    }
    pushFix('sw', 'update_prompt_shown', 'waiting');
}

/**
 * ETAP 39 — stary SW waiting → zaproponuj odświeżenie (nie skipWaiting w tle).
 * @returns {Promise<number>}
 */
export async function healServiceWorker() {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return 0;
    try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg) return 0;

        if (!swWatchBound) {
            swWatchBound = true;
            reg.addEventListener('updatefound', () => {
                const installing = reg.installing;
                if (!installing) return;
                installing.addEventListener('statechange', () => {
                    if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                        showSwRefreshPrompt();
                    }
                });
            });
        }

        // Sprawdź aktualizacje (stan) — bez agresywnego skipWaiting
        try {
            await reg.update();
        } catch {
            /* ignore network */
        }

        if (reg.waiting && navigator.serviceWorker.controller) {
            showSwRefreshPrompt();
            return 1;
        }
        return 0;
    } catch (err) {
        pushFix('sw', 'check_fail', err?.message || 'error');
        return 0;
    }
}

/**
 * Pełny przebieg Self-Heal (prezentacja + stan runtime).
 * @param {{ reason?: string, deep?: boolean }} [opts]
 */
export async function runSelfHeal(opts = {}) {
    const reason = opts.reason || 'manual';
    const deep = opts.deep !== false;

    const photos = healCategoryPhotos(document);
    const icons = healBrokenIcons(document);
    const layout = healModalPhotoLayout(document);
    const images = healBrokenImages(document);
    const eventbus = healEventBusListeners();

    let map = 0;
    let gps = 0;
    let markers = 0;
    let sw = 0;

    if (deep) {
        const mapResult = await healMapRuntime();
        map = mapResult.map;
        gps = mapResult.gps;
        markers = mapResult.markers;
        sw = await healServiceWorker();
    }

    const total = photos + icons + layout + images + eventbus + map + gps + markers + sw;
    if (total) {
        pushFix('health', 'run_complete', `${reason}: ${total} fix(es)`);
    }
    return {
        photos,
        icons,
        layout,
        images,
        eventbus,
        map,
        gps,
        markers,
        sw,
        total,
        reason,
        day: dayStamp(),
        fixes: getSessionSelfHealFixes()
    };
}

function maybeDailyHeal() {
    try {
        const today = dayStamp();
        if (localStorage.getItem(DAY_KEY) === today) return;
        localStorage.setItem(DAY_KEY, today);
        runSelfHeal({ reason: 'daily' });
    } catch {
        runSelfHeal({ reason: 'daily-fallback' });
    }
}

function startWatchdog() {
    if (watchdogTimer != null) return;
    const tick = () => {
        if (document.visibilityState === 'hidden') return;
        // Lekki tick: nav + broken images + map gdy panel mapy widoczny
        healEventBusListeners();
        healBrokenImages(document);
        const mapPanel = document.querySelector?.('[data-view-panel="map"]');
        if (mapPanel && !mapPanel.hidden) {
            healMapRuntime();
        }
    };
    watchdogTimer = window.setInterval(tick, WATCHDOG_MS);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') tick();
    });
}

export function initSelfHealing() {
    if (bound) return;
    bound = true;

    bindImageErrorHealing();

    requestAnimationFrame(() => {
        healBrokenIcons(document);
        healEventBusListeners();
        maybeDailyHeal();
        healServiceWorker();
    });

    startWatchdog();

    if (typeof MutationObserver !== 'undefined') {
        observer = new MutationObserver((mutations) => {
            let relevant = false;
            for (const m of mutations) {
                if (m.type === 'childList' && m.addedNodes.length) {
                    relevant = true;
                    break;
                }
                if (m.type === 'attributes' && (m.attributeName === 'data-category' || m.attributeName === 'src')) {
                    relevant = true;
                    break;
                }
            }
            if (!relevant) return;
            healCategoryPhotos(document);
            healModalPhotoLayout(document);
            healBrokenIcons(document);
            healBrokenImages(document);
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src', 'srcset', 'data-category', 'data-character', 'style']
        });
    }

    window.__RG_SELF_HEAL__ = {
        run: runSelfHeal,
        healPhotos: healCategoryPhotos,
        healIcons: healBrokenIcons,
        healLayout: healModalPhotoLayout,
        healImages: healBrokenImages,
        healMap: healMapRuntime,
        healGps: healMapRuntime,
        healMarkers: healMapRuntime,
        healEventBus: healEventBusListeners,
        healSw: healServiceWorker,
        log: getSelfHealLog,
        policy: {
            autoFix: true,
            repairsStateOnly: true,
            doesNotRewriteSource: true,
            scope: ['photos', 'icons', 'layout', 'images', 'map', 'gps', 'markers', 'eventbus', 'sw'],
            brandLock: true,
            architectureUnchanged: true
        }
    };

    console.info('[SelfHeal] ETAP 39 active · __RG_SELF_HEAL__.run()');
}

export default {
    initSelfHealing,
    runSelfHeal,
    healCategoryPhotos,
    healBrokenIcons,
    healModalPhotoLayout,
    healBrokenImages,
    healMapRuntime,
    healEventBusListeners,
    healServiceWorker,
    getSelfHealLog
};
