/**
 * Smoke: language switcher w nagłówku (settings.js)
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

const listeners = new Map();
function el(tag, attrs = {}) {
    const node = {
        tagName: tag.toUpperCase(),
        id: attrs.id || '',
        className: attrs.class || '',
        hidden: Boolean(attrs.hidden),
        dataset: {},
        style: {},
        attrs: { ...attrs },
        children: [],
        parent: null,
        textContent: '',
        setAttribute(k, v) {
            this.attrs[k] = String(v);
            if (k === 'hidden') this.hidden = v !== null && v !== false;
        },
        getAttribute(k) {
            return this.attrs[k] ?? null;
        },
        classList: {
            _owner: null,
            add(c) {
                const o = this._owner;
                const set = new Set(String(o.className || '').split(/\s+/).filter(Boolean));
                set.add(c);
                o.className = [...set].join(' ');
            },
            remove(c) {
                const o = this._owner;
                const set = new Set(String(o.className || '').split(/\s+/).filter(Boolean));
                set.delete(c);
                o.className = [...set].join(' ');
            },
            contains(c) {
                return String(this._owner.className || '')
                    .split(/\s+/)
                    .includes(c);
            },
            toggle(c, on) {
                if (on) this.add(c);
                else this.remove(c);
            }
        },
        contains(other) {
            let n = other;
            while (n) {
                if (n === this) return true;
                n = n.parent;
            }
            return false;
        },
        closest(sel) {
            let n = this;
            while (n) {
                if (sel === '.language-option' && String(n.className || '').includes('language-option')) {
                    return n;
                }
                if (sel.startsWith('#') && n.id === sel.slice(1)) return n;
                n = n.parent;
            }
            return null;
        },
        focus() {},
        addEventListener(type, fn) {
            const key = `${this.id || this.className}:${type}`;
            if (!listeners.has(key)) listeners.set(key, []);
            listeners.get(key).push(fn);
            if (!listeners.has(`node:${type}`)) listeners.set(`node:${type}`, []);
            listeners.get(`node:${type}`).push({ node: this, fn });
        },
        querySelectorAll(sel) {
            if (sel === '.language-option') {
                return this.children.flatMap((li) => li.children || []).filter((b) =>
                    String(b.className || '').includes('language-option')
                );
            }
            return [];
        },
        getBoundingClientRect() {
            return { top: 0, bottom: 56, left: 200, right: 320, width: 120, height: 40 };
        }
    };
    node.classList._owner = node;
    return node;
}

const wrap = el('div', { class: 'header-lang-wrap' });
const toggle = el('button', { id: 'languageSwitcherBtn', class: 'header-lang' });
const label = el('span', { id: 'languageSwitcherLabel' });
label.textContent = 'PL';
const dropdown = el('ul', { id: 'languageDropdown', class: 'language-dropdown', hidden: true });
dropdown.hidden = true;
wrap.children = [toggle, dropdown];
toggle.parent = wrap;
dropdown.parent = wrap;

const byId = {
    languageSwitcherBtn: toggle,
    languageDropdown: dropdown,
    languageSwitcherLabel: label,
    darkModeToggleBtn: null,
    headerPremiumBtn: null,
    menuBtn: null
};

globalThis.window = {
    innerWidth: 390,
    innerHeight: 844,
    addEventListener() {},
    location: { href: 'http://localhost/', search: '', pathname: '/', hash: '' },
    history: { replaceState() {} }
};
try {
    Object.defineProperty(globalThis, 'navigator', {
        value: { language: 'pl-PL', languages: ['pl-PL', 'en'] },
        configurable: true
    });
} catch {
    /* keep host navigator */
}
globalThis.document = {
    documentElement: { lang: 'pl', setAttribute() {}, getAttribute() { return null; } },
    head: { appendChild() {} },
    createElement: () => ({ setAttribute() {}, appendChild() {}, style: {} }),
    body: { classList: { toggle() {} } },
    getElementById: (id) => byId[id] || null,
    querySelector: (sel) => (sel === '.header-lang-wrap' ? wrap : null),
    querySelectorAll: (sel) => {
        if (sel === '.language-option') {
            return dropdown.querySelectorAll('.language-option');
        }
        return [];
    },
    addEventListener(type, fn) {
        if (!listeners.has(`doc:${type}`)) listeners.set(`doc:${type}`, []);
        listeners.get(`doc:${type}`).push(fn);
    }
};

// Minimal parse of innerHTML assignment used by populateLanguageDropdown
Object.defineProperty(dropdown, 'innerHTML', {
    set(html) {
        const codes = [...String(html).matchAll(/data-lang="([^"]+)"/g)].map((m) => m[1]);
        dropdown.children = codes.map((code) => {
            const li = el('li');
            const btn = el('button', { class: 'language-option' });
            btn.dataset.lang = code;
            btn.parent = li;
            li.children = [btn];
            li.parent = dropdown;
            return li;
        });
        dropdown._optionCount = codes.length;
    },
    get() {
        return '';
    }
});

const mod = await import(pathToFileURL(join(ROOT, 'js/core/settings.js')).href);
mod.initShellSettings();

assert(dropdown.dataset.built === 'true', 'dropdown populated');
assert(dropdown._optionCount === 36, `36 languages (got ${dropdown._optionCount})`);
assert(toggle.dataset.bound === 'true', 'toggle bound');

// Simulate open click
const clickHandlers = listeners.get('node:click') || [];
const toggleHandler = clickHandlers.find((h) => h.node === toggle)?.fn;
assert(typeof toggleHandler === 'function', 'toggle has click handler');
toggleHandler({ preventDefault() {}, stopPropagation() {}, target: toggle });
assert(dropdown.hidden === false, 'dropdown opens on click');
assert(wrap.classList.contains('is-open'), 'wrap has is-open');
assert(dropdown.style.position === 'fixed', 'dropdown positioned fixed');
assert(toggle.getAttribute('aria-expanded') === 'true', 'aria-expanded true');

// Select German
const deBtn = dropdown.querySelectorAll('.language-option').find((b) => b.dataset.lang === 'de');
assert(Boolean(deBtn), 'has de option');
const ddHandler = clickHandlers.find((h) => h.node === dropdown)?.fn;
ddHandler({
    preventDefault() {},
    stopPropagation() {},
    target: deBtn
});
assert(dropdown.hidden === true, 'closes after select');
assert(localStorage.getItem('rs_lang') === 'de', 'saves rs_lang=de');

// CSS: mobile overflow must not clip
const themeCss = readFileSync(join(ROOT, 'css/theme-toggle-premium.css'), 'utf8');
assert(
    !/\.main-header \.header-right\s*\{[^}]*overflow:\s*hidden/.test(
        themeCss.replace(/\/\*[\s\S]*?\*\//g, '')
    ),
    'theme CSS: header-right not overflow:hidden'
);
assert(themeCss.includes('overflow: visible'), 'theme CSS keeps overflow visible');

const styleCss = readFileSync(join(ROOT, 'css/style.css'), 'utf8');
assert(styleCss.includes('.language-dropdown:not([hidden])'), 'style shows dropdown when not hidden');

const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
assert(html.includes('id="languageSwitcherBtn"'), 'header has language button');
assert(html.includes('id="languageDropdown"'), 'header has language dropdown');

if (failed) {
    console.error(`\n${failed} failure(s)`);
    process.exit(1);
}
console.log('\nLanguage dropdown checks passed.');
