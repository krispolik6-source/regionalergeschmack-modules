/**
 * ETAP 41 — UI Guardian
 *
 * Co kilka sekund sprawdza UI (stan DOM / layout):
 *  - nic poza ekranem · napisy widoczne · kontrast
 *  - przyciski ≥ 44px · brak overflow · safe-area
 *  - popup w viewport · karty nieucięte
 *
 * Lokalne raporty (localStorage). Bez sieci.
 * Opcjonalny soft-heal prezentacji (inline style) — bez zmiany architektury.
 */

import { eventBus } from '../core/eventBus.js';
import { EVENTS } from '../core/events.js';

const STORE_KEY = 'rg_ui_guardian_v1';
const MAX_FINDINGS = 60;
const INTERVAL_MS = 4000;
const TOUCH_MIN = 44;
const CONTRAST_MIN = 3.0; // AA large-text-ish; labels często 11–14px
const CONTRAST_MIN_BODY = 4.0;
const SAMPLE_LIMIT = 48;

let bound = false;
let timer = null;
let lastScanAt = null;
/** @type {object[]} */
let sessionFindings = [];

function nowIso() {
    return new Date().toISOString();
}

function loadStore() {
    try {
        const raw = localStorage.getItem(STORE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        return parsed && typeof parsed === 'object' ? parsed : { findings: [], scans: 0 };
    } catch {
        return { findings: [], scans: 0 };
    }
}

function saveStore(data) {
    try {
        localStorage.setItem(STORE_KEY, JSON.stringify(data));
    } catch {
        try {
            data.findings = (data.findings || []).slice(-20);
            localStorage.setItem(STORE_KEY, JSON.stringify(data));
        } catch {
            /* ignore */
        }
    }
}

function pushFinding(list, finding) {
    list.push({
        id: `ui-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        at: nowIso(),
        ...finding
    });
}

function describeEl(el) {
    if (!el || el.nodeType !== 1) return 'unknown';
    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : '';
    const cls = el.classList?.[0] ? `.${el.classList[0]}` : '';
    const text = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 48);
    return `${tag}${id}${cls}${text ? ` "${text}"` : ''}`.slice(0, 120);
}

function parseRgb(input) {
    if (!input || input === 'transparent') return null;
    const s = String(input).trim();
    if (s === 'rgba(0, 0, 0, 0)' || s === 'transparent') return null;
    let m = s.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i);
    if (m) {
        const a = m[4] != null ? Number(m[4]) : 1;
        if (a < 0.08) return null;
        return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a };
    }
    m = s.match(/#([0-9a-f]{3,8})/i);
    if (m) {
        let h = m[1];
        if (h.length === 3) h = h.split('').map((c) => c + c).join('');
        if (h.length === 8) h = h.slice(0, 6);
        if (h.length !== 6) return null;
        return {
            r: parseInt(h.slice(0, 2), 16),
            g: parseInt(h.slice(2, 4), 16),
            b: parseInt(h.slice(4, 6), 16),
            a: 1
        };
    }
    return null;
}

function relLuminance({ r, g, b }) {
    const lin = [r, g, b].map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function contrastRatio(fg, bg) {
    if (!fg || !bg) return null;
    const L1 = relLuminance(fg);
    const L2 = relLuminance(bg);
    const hi = Math.max(L1, L2);
    const lo = Math.min(L1, L2);
    return (hi + 0.05) / (lo + 0.05);
}

function effectiveBackground(el) {
    let node = el;
    for (let i = 0; i < 10 && node; i += 1) {
        const cs = getComputedStyle(node);
        const bg = parseRgb(cs.backgroundColor);
        if (bg && bg.a >= 0.45) return bg;
        node = node.parentElement;
    }
    const bodyBg = parseRgb(getComputedStyle(document.body).backgroundColor);
    if (bodyBg) return bodyBg;
    const dark = document.body.classList.contains('dark-mode');
    return dark ? { r: 28, g: 24, b: 18, a: 1 } : { r: 245, g: 239, b: 227, a: 1 };
}

function isVisible(el) {
    if (!el || el.nodeType !== 1) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    if (Number(cs.opacity) < 0.05) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
}

function viewportBox() {
    const w = window.innerWidth || document.documentElement.clientWidth || 0;
    const h = window.innerHeight || document.documentElement.clientHeight || 0;
    return { w, h, left: 0, top: 0, right: w, bottom: h };
}

function readSafeInsets() {
    const probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;'
        + 'top:env(safe-area-inset-top,0px);'
        + 'left:env(safe-area-inset-left,0px);'
        + 'bottom:env(safe-area-inset-bottom,0px);'
        + 'right:env(safe-area-inset-right,0px);'
        + 'padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';
    document.documentElement.appendChild(probe);
    const cs = getComputedStyle(probe);
    const pad = {
        top: parseFloat(cs.paddingTop) || 0,
        right: parseFloat(cs.paddingRight) || 0,
        bottom: parseFloat(cs.paddingBottom) || 0,
        left: parseFloat(cs.paddingLeft) || 0
    };
    probe.remove();
    return pad;
}

function querySample(selector, limit = SAMPLE_LIMIT) {
    const nodes = [...document.querySelectorAll(selector)];
    if (nodes.length <= limit) return nodes;
    const step = Math.ceil(nodes.length / limit);
    const out = [];
    for (let i = 0; i < nodes.length && out.length < limit; i += step) {
        out.push(nodes[i]);
    }
    return out;
}

/** Soft-heal: podnieś kontrast napisu (stan DOM). */
function healContrast(el, dark) {
    if (!el || el.dataset.uiGuardianContrast === '1') return false;
    el.dataset.uiGuardianContrast = '1';
    el.style.setProperty('color', dark ? '#f5efe3' : '#1c1812', 'important');
    return true;
}

function healOverflowX(el) {
    if (!el || el.dataset.uiGuardianOverflow === '1') return false;
    el.dataset.uiGuardianOverflow = '1';
    el.style.setProperty('overflow-x', 'clip', 'important');
    el.style.setProperty('max-width', '100%', 'important');
    return true;
}

/**
 * Pełny skan UI.
 * @param {{ heal?: boolean }} [opts]
 */
export function runUiGuardianScan(opts = {}) {
    const heal = opts.heal !== false;
    const findings = [];
    const vp = viewportBox();
    const safe = readSafeInsets();
    const dark = document.body.classList.contains('dark-mode');
    let healed = 0;

    // 1) Document horizontal overflow
    const doc = document.documentElement;
    if (doc.scrollWidth > vp.w + 2) {
        pushFinding(findings, {
            check: 'overflow',
            severity: 'high',
            message: `Poziomy overflow dokumentu (${doc.scrollWidth} > ${vp.w})`,
            selector: 'html'
        });
        if (heal && healOverflowX(document.body)) healed += 1;
    }

    // 2) Buttons ≥ 44px
    const tapTargets = querySample(
        'button, .btn, .nav-item, .map-bottom-btn, .header-icon, a.lp-btn, [role="button"]'
    );
    for (const el of tapTargets) {
        if (!isVisible(el)) continue;
        const r = el.getBoundingClientRect();
        const minSide = Math.min(r.width, r.height);
        // Szerokie CTA: wystarczy wysokość
        const ok = r.height >= TOUCH_MIN - 0.5 || (r.width >= TOUCH_MIN && r.height >= 36);
        if (!ok && minSide > 0) {
            pushFinding(findings, {
                check: 'touch-44',
                severity: 'medium',
                message: `Cel dotykowy < ${TOUCH_MIN}px (${Math.round(r.width)}×${Math.round(r.height)})`,
                target: describeEl(el)
            });
            if (heal && !el.dataset.uiGuardianTouch) {
                el.dataset.uiGuardianTouch = '1';
                el.style.setProperty('min-height', `${TOUCH_MIN}px`, 'important');
                healed += 1;
            }
        }
    }

    // 3) Text visible + contrast (labels / story / muted)
    const textNodes = querySample([
        '.home-region-story-label',
        '.home-region-story-sub',
        '.home-region-story-text',
        '.home-living-region-label',
        '.home-tastes-of-day-label',
        '.home-greeting-title',
        'h1', 'h2', 'h3',
        '.side-menu-item-label',
        '.nav-label',
        '.producer-modal-header h2',
        '.text-muted',
        '[class*="-label"]'
    ].join(','));

    for (const el of textNodes) {
        if (!isVisible(el)) continue;
        const text = (el.textContent || '').trim();
        if (!text) continue;

        const cs = getComputedStyle(el);
        const fg = parseRgb(cs.color);
        const bg = effectiveBackground(el);
        const ratio = contrastRatio(fg, bg);
        const fontSize = parseFloat(cs.fontSize) || 14;
        const minRatio = fontSize >= 18 || cs.fontWeight >= 600 ? CONTRAST_MIN : CONTRAST_MIN_BODY;

        if (ratio != null && ratio < minRatio) {
            const isRegionStory = el.classList.contains('home-region-story-label')
                || el.classList.contains('home-region-story-sub');
            pushFinding(findings, {
                check: 'contrast',
                severity: isRegionStory || dark ? 'high' : 'medium',
                message: `Słaby kontrast ${ratio.toFixed(2)}:1 (min ${minRatio}) — „${text.slice(0, 40)}"`,
                target: describeEl(el),
                meta: { ratio, dark, text: text.slice(0, 80) }
            });
            if (heal && healContrast(el, dark)) healed += 1;
        }

        // Invisible / clipped text
        if (cs.color === 'transparent' || Number(cs.opacity) < 0.15) {
            pushFinding(findings, {
                check: 'text-visible',
                severity: 'high',
                message: `Napis niewidoczny (opacity/color) — „${text.slice(0, 40)}"`,
                target: describeEl(el)
            });
            if (heal && healContrast(el, dark)) healed += 1;
        }

        const r = el.getBoundingClientRect();
        if (r.right < -2 || r.left > vp.w + 2 || r.bottom < -2 || r.top > vp.h + 2) {
            // poza viewportem — OK jeśli w scrollu; flaguj gdy w „fold” sekcji fixed/sticky parent
            const parent = el.closest('.main-header, .bottom-nav, .producer-modal, .side-menu-panel');
            if (parent) {
                pushFinding(findings, {
                    check: 'offscreen',
                    severity: 'high',
                    message: `Tekst poza ekranem w chrome/popup — „${text.slice(0, 40)}"`,
                    target: describeEl(el)
                });
            }
        }
    }

    // 4) Safe area — fixed chrome
    const chrome = querySample('.main-header, .bottom-nav, .map-recenter-btn, .app-toast, #rgSelfHealSwBanner');
    for (const el of chrome) {
        if (!isVisible(el)) continue;
        const cs = getComputedStyle(el);
        if (cs.position !== 'fixed' && cs.position !== 'sticky') continue;
        const r = el.getBoundingClientRect();
        if (r.top < safe.top - 1 && r.top >= -1) {
            // element wchodzi w notch bez paddingu
            const padTop = parseFloat(cs.paddingTop) || 0;
            if (padTop < safe.top - 0.5 && r.top < safe.top) {
                pushFinding(findings, {
                    check: 'safe-area',
                    severity: 'medium',
                    message: `Element nachodzi na safe-area top (${safe.top}px)`,
                    target: describeEl(el)
                });
            }
        }
        if (vp.h - r.bottom < safe.bottom - 1 && r.bottom <= vp.h + 1) {
            const padBottom = parseFloat(cs.paddingBottom) || 0;
            if (safe.bottom > 0 && padBottom < safe.bottom - 0.5) {
                // bottom-nav często sam jest w safe area — ostrzeżenie tylko gdy nachodzi mocno
                if (r.bottom > vp.h - 1) {
                    pushFinding(findings, {
                        check: 'safe-area',
                        severity: 'low',
                        message: `Element przy krawędzi bottom bez safe-area (${safe.bottom}px)`,
                        target: describeEl(el)
                    });
                }
            }
        }
    }

    // 5) Popups / modal / menu w viewport
    const popups = querySample(
        '.producer-modal:not([hidden]), .producer-modal.is-open, .side-menu-panel, '
        + '.language-dropdown:not([hidden]), .map-popup, .leaflet-popup, #rgSelfHealSwBanner'
    );
    for (const el of popups) {
        if (!isVisible(el)) continue;
        const r = el.getBoundingClientRect();
        const outLeft = r.left < -8;
        const outRight = r.right > vp.w + 8;
        const outTop = r.top < -8;
        const outBottom = r.bottom > vp.h + 8;
        if (outLeft || outRight || outTop || outBottom) {
            pushFinding(findings, {
                check: 'popup-bounds',
                severity: 'high',
                message: `Popup/panel wychodzi poza ekran (${Math.round(r.width)}×${Math.round(r.height)})`,
                target: describeEl(el),
                meta: { outLeft, outRight, outTop, outBottom }
            });
            if (heal && !el.dataset.uiGuardianPopup) {
                el.dataset.uiGuardianPopup = '1';
                el.style.setProperty('max-width', 'min(100vw, 100%)', 'important');
                el.style.setProperty('max-height', 'min(100dvh, 100%)', 'important');
                healed += 1;
            }
        }
    }

    // 6) Karty ucięte (overflow hidden + tekst szerszy niż karta)
    const cards = querySample(
        '.home-region-story, .category-card, .home-product-card, .home-venue-card, '
        + '.favorite-item, .cart-item, .premium-feature-card, .home-tastes-of-day-item'
    );
    for (const el of cards) {
        if (!isVisible(el)) continue;
        if (el.scrollWidth > el.clientWidth + 3) {
            pushFinding(findings, {
                check: 'card-clip',
                severity: 'medium',
                message: `Karta ucięta poziomo (scrollWidth ${el.scrollWidth} > ${el.clientWidth})`,
                target: describeEl(el)
            });
            if (heal && healOverflowX(el)) healed += 1;
        }
        const r = el.getBoundingClientRect();
        if (r.left < -4 || r.right > vp.w + 4) {
            pushFinding(findings, {
                check: 'offscreen',
                severity: 'medium',
                message: 'Karta wystaje poza ekran',
                target: describeEl(el)
            });
        }
    }

    // Deduplicate by check+target for this scan
    const uniq = [];
    const seen = new Set();
    for (const f of findings) {
        const key = `${f.check}|${f.target || f.selector || f.message}`;
        if (seen.has(key)) continue;
        seen.add(key);
        uniq.push(f);
    }

    sessionFindings = uniq;
    lastScanAt = nowIso();

    const store = loadStore();
    store.scans = (store.scans || 0) + 1;
    store.lastScanAt = lastScanAt;
    store.lastHealed = healed;
    store.findings = [...(store.findings || []), ...uniq].slice(-MAX_FINDINGS);
    store.lastSummary = {
        at: lastScanAt,
        count: uniq.length,
        healed,
        dark,
        byCheck: uniq.reduce((acc, f) => {
            acc[f.check] = (acc[f.check] || 0) + 1;
            return acc;
        }, {})
    };
    saveStore(store);

    if (uniq.length && typeof console !== 'undefined') {
        // Na localhost widać; na prod Console Guardian i tak uciszy warn
        console.info('[UI Guardian]', store.lastSummary);
    }

    return {
        ok: uniq.length === 0,
        count: uniq.length,
        healed,
        findings: uniq,
        summary: store.lastSummary
    };
}

export function getUiGuardianFindings() {
    return loadStore().findings || [];
}

export function getUiGuardianLastScan() {
    return loadStore().lastSummary || null;
}

export function clearUiGuardianFindings() {
    saveStore({ findings: [], scans: 0 });
    sessionFindings = [];
    return true;
}

export function initUiGuardian() {
    if (bound || typeof window === 'undefined') {
        return { ok: false, reason: 'already' };
    }
    bound = true;

    const tick = () => {
        if (document.visibilityState === 'hidden') return;
        try {
            runUiGuardianScan({ heal: true });
        } catch (err) {
            console.info('[UI Guardian] scan error', err?.message || err);
        }
    };

    // Pierwszy skan po hydracji UI
    requestAnimationFrame(() => {
        setTimeout(tick, 1200);
    });

    timer = window.setInterval(tick, INTERVAL_MS);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') tick();
    });

    // Po zmianie motywu — od razu (tu wykryje m.in. „Opowieści regionu”)
    try {
        eventBus.on(EVENTS.THEME_CHANGED, () => setTimeout(tick, 250));
    } catch {
        document.getElementById('darkModeToggleBtn')?.addEventListener('click', () => {
            setTimeout(tick, 300);
        });
    }

    window.__RG_UI_GUARDIAN__ = {
        run: runUiGuardianScan,
        findings: getUiGuardianFindings,
        last: getUiGuardianLastScan,
        clear: clearUiGuardianFindings,
        session: () => [...sessionFindings],
        policy: {
            intervalMs: INTERVAL_MS,
            touchMin: TOUCH_MIN,
            contrastMin: CONTRAST_MIN_BODY,
            localOnly: true,
            noNetwork: true,
            softHeal: true,
            architectureUnchanged: true
        }
    };

    console.info('[UI Guardian] ETAP 41 active · co', INTERVAL_MS / 1000, 's · __RG_UI_GUARDIAN__.run()');
    return { ok: true, intervalMs: INTERVAL_MS };
}

export default {
    initUiGuardian,
    runUiGuardianScan,
    getUiGuardianFindings,
    getUiGuardianLastScan,
    clearUiGuardianFindings
};
