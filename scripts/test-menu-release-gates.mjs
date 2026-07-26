/**
 * Smoke test Partia 1 – bramki menu (F1–F3, W3, W5).
 * Wymaga `npm start` (http://127.0.0.1:3456).
 */
import { MENU_RELEASE_GATES } from '../js/config.js';

const BASE = process.env.RG_TEST_URL || 'http://127.0.0.1:3456/';

function assert(cond, msg) {
    if (!cond) throw new Error(msg);
}

class El {
    constructor(attrs = {}) {
        this.attrs = attrs;
        this.hidden = Object.prototype.hasOwnProperty.call(attrs, 'hidden');
        this.children = [];
    }
    querySelectorAll(sel) {
        const out = [];
        const walk = (nodes) => {
            for (const n of nodes) {
                if (sel.startsWith('[data-menu-gate=')) {
                    const v = sel.match(/"([^"]+)"/)?.[1];
                    if (n.attrs['data-menu-gate'] === v) out.push(n);
                } else if (sel === '[data-menu-internal]') {
                    if ('data-menu-internal' in n.attrs) out.push(n);
                }
                if (n.children.length) walk(n.children);
            }
        };
        walk(this.children);
        return out;
    }
}

function parseGated(html) {
    const root = new El();
    const re = /<([\w-]+)([^>]*)>/g;
    let m;
    let currentDownloads = null;
    while ((m = re.exec(html))) {
        const attrStr = m[2] || '';
        if (!/data-menu-gate|data-menu-internal|side-menu-downloads/.test(attrStr)) continue;
        const attrs = {};
        for (const am of attrStr.matchAll(/([\w:-]+)(?:=("([^"]*)"|'([^']*)'))?/g)) {
            attrs[am[1]] = am[3] ?? am[4] ?? '';
            if (am[1] === 'hidden' && am[2] == null) attrs.hidden = '';
        }
        // bare hidden without =
        if (/\shidden(\s|>|$)/.test(`${attrStr} `) || /\shidden$/.test(attrStr.trim())) {
            attrs.hidden = '';
        }
        const el = new El(attrs);
        if ((attrs.class || '').includes('side-menu-downloads')) {
            currentDownloads = el;
            root.children.push(el);
            continue;
        }
        if (attrs['data-menu-gate'] && currentDownloads) {
            currentDownloads.children.push(el);
            continue;
        }
        currentDownloads = null;
        root.children.push(el);
    }
    return root;
}

function applyGates(root, showInternal) {
    const map = {
        apk: MENU_RELEASE_GATES.showApkDownload,
        pdf: MENU_RELEASE_GATES.showInstallPdf,
        stores: MENU_RELEASE_GATES.showStoreLinks
    };
    for (const [gate, enabled] of Object.entries(map)) {
        root.querySelectorAll(`[data-menu-gate="${gate}"]`).forEach((el) => {
            el.hidden = !enabled;
        });
    }
    root.querySelectorAll('[data-menu-internal]').forEach((el) => {
        el.hidden = !showInternal;
    });
    for (const el of root.children) {
        if (!(el.attrs.class || '').includes('side-menu-downloads')) continue;
        const gated = el.children.filter((c) => c.attrs['data-menu-gate']);
        el.hidden = !gated.some((c) => !c.hidden);
    }
}

const res = await fetch(BASE);
assert(res.ok, `HTTP ${res.status} from ${BASE}`);
const html = await res.text();
const js = await (await fetch(new URL('/js/core/sideMenu.js', BASE))).text();
const cfg = await (await fetch(new URL('/js/config.js', BASE))).text();

assert(cfg.includes('MENU_RELEASE_GATES'), 'config.js not serving MENU_RELEASE_GATES');
assert(js.includes('applyMenuVisibilityGates'), 'sideMenu.js missing applyMenuVisibilityGates');
assert(js.includes('showInternalMenuSections'), 'sideMenu.js missing showInternalMenuSections');

assert(MENU_RELEASE_GATES.showApkDownload === false, 'F1: showApkDownload must be false');
assert(MENU_RELEASE_GATES.showInstallPdf === false, 'F2: showInstallPdf must be false');
assert(MENU_RELEASE_GATES.showStoreLinks === false, 'F3: showStoreLinks must be false');

assert(html.includes('data-menu-gate="apk"'), 'HTML: apk gate');
assert(html.includes('data-menu-gate="pdf"'), 'HTML: pdf gate');
assert(html.includes('data-menu-gate="stores"'), 'HTML: stores gate');
assert(html.includes('data-menu-internal'), 'HTML: internal marker');
assert(html.includes('Imię'), 'W5: Imię');
assert(html.includes('Ocena (1–5)'), 'W5: Ocena (1–5)');
assert(!html.includes('Imi?'), 'W5: Imi? still present');
assert(!html.includes('1?5'), 'W5: 1?5 still present');

const root = parseGated(html);
assert(root.querySelectorAll('[data-menu-gate="apk"]').length >= 2, 'expected multiple apk gates');
assert(root.querySelectorAll('[data-menu-internal]').length >= 4, 'expected testing+dev blocks');

applyGates(root, false);
assert(root.querySelectorAll('[data-menu-gate="apk"]').every((e) => e.hidden), 'F1 prod-sim');
assert(root.querySelectorAll('[data-menu-gate="pdf"]').every((e) => e.hidden), 'F2 prod-sim');
assert(root.querySelectorAll('[data-menu-gate="stores"]').every((e) => e.hidden), 'F3 prod-sim');
assert(root.querySelectorAll('[data-menu-internal]').every((e) => e.hidden), 'W3 prod-sim hidden');

applyGates(root, true);
assert(root.querySelectorAll('[data-menu-internal]').every((e) => !e.hidden), 'W3 localhost-sim visible');
assert(root.querySelectorAll('[data-menu-gate="apk"]').every((e) => e.hidden), 'F1 still hidden on localhost');

console.log('PASS test-menu-release-gates @', BASE);
console.log('  F1 APK hidden | F2 PDF hidden | F3 stores hidden');
console.log('  W3 internal: hidden (prod-sim) / visible (localhost-sim)');
console.log('  W5 mojibake fixed');
