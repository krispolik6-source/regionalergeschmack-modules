/**
 * AI Guardian – Behavior Probe (DEV ONLY)
 *
 * Włączanie (localhost):
 *   localStorage.setItem('rg_ai_guardian_probe', '1'); location.reload();
 *
 * Wyłączanie:
 *   localStorage.removeItem('rg_ai_guardian_probe');
 *
 * Eksport statystyk do konsoli:
 *   copy(JSON.stringify(window.__RG_AI_GUARDIAN__.export(), null, 2))
 *
 * NIE wysyła danych na serwer. NIE zbiera PII (brak imion, email, GPS coords).
 */
(function initAiGuardianBehaviorProbe() {
    const KEY = 'rg_ai_guardian_stats_v1';
    const FLAG = 'rg_ai_guardian_probe';

    try {
        if (localStorage.getItem(FLAG) !== '1') return;
        const host = location.hostname;
        if (host !== 'localhost' && host !== '127.0.0.1') {
            console.info('[AI Guardian] Probe zablokowany poza localhost.');
            return;
        }
    } catch {
        return;
    }

    function load() {
        try {
            return JSON.parse(localStorage.getItem(KEY) || '{}') || {};
        } catch {
            return {};
        }
    }

    function save(data) {
        try {
            localStorage.setItem(KEY, JSON.stringify(data));
        } catch {
            /* quota */
        }
    }

    const state = {
        clicks: {},
        screens: {},
        scrollDepth: {},
        dwellMs: {},
        dropoffs: [],
        ...load()
    };

    let screenKey = 'unknown';
    let screenEntered = Date.now();

    function anonLabel(el) {
        if (!el || !el.closest) return 'unknown';
        const btn = el.closest('button, a, [role="button"], input, select');
        if (!btn) return 'document';
        const id = btn.id ? `#${btn.id}` : '';
        const data = btn.getAttribute('data-category')
            || btn.getAttribute('data-view')
            || btn.getAttribute('data-action')
            || '';
        const cls = (btn.className && typeof btn.className === 'string')
            ? `.${btn.className.trim().split(/\s+/).slice(0, 2).join('.')}`
            : '';
        const tag = (btn.tagName || 'EL').toLowerCase();
        // bez tekstu użytkownika / PII
        return `${tag}${id}${data ? `[${data}]` : ''}${cls}`.slice(0, 120);
    }

    function setScreen(next) {
        const now = Date.now();
        const spent = now - screenEntered;
        if (screenKey) {
            state.dwellMs[screenKey] = (state.dwellMs[screenKey] || 0) + spent;
            state.screens[screenKey] = (state.screens[screenKey] || 0) + 1;
        }
        screenKey = String(next || 'unknown').slice(0, 64);
        screenEntered = now;
        save(state);
    }

    document.addEventListener('click', (ev) => {
        const label = anonLabel(ev.target);
        state.clicks[label] = (state.clicks[label] || 0) + 1;
        save(state);
    }, { passive: true });

    document.addEventListener('scroll', () => {
        const el = document.scrollingElement || document.documentElement;
        const max = Math.max(1, el.scrollHeight - el.clientHeight);
        const pct = Math.round((el.scrollTop / max) * 100);
        const bucket = `${screenKey}:${Math.min(100, Math.floor(pct / 10) * 10)}`;
        state.scrollDepth[bucket] = (state.scrollDepth[bucket] || 0) + 1;
        save(state);
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            state.dropoffs.push({
                t: Date.now(),
                screen: screenKey,
                type: 'visibility-hidden'
            });
            if (state.dropoffs.length > 100) state.dropoffs = state.dropoffs.slice(-100);
            setScreen(screenKey);
        }
    });

    // Hook nawigacji EventBus jeśli dostępny (bez PII)
    try {
        window.addEventListener('rg:navigate', (e) => {
            const view = e?.detail?.view;
            if (view) setScreen(String(view));
        });
    } catch {
        /* ignore */
    }

    // Obserwuj body class view-* jeśli istnieje
    const mo = new MutationObserver(() => {
        const cls = [...document.body.classList].find((c) => c.startsWith('view-') || c.startsWith('screen-'));
        if (cls) setScreen(cls);
    });
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    setScreen(document.body.dataset.view || 'home');

    window.__RG_AI_GUARDIAN__ = {
        export() {
            return {
                clicks: state.clicks,
                screens: state.screens,
                scrollDepth: state.scrollDepth,
                dwellMs: state.dwellMs,
                dropoffs: state.dropoffs,
                note: 'anonymous-local-only'
            };
        },
        clear() {
            localStorage.removeItem(KEY);
            Object.keys(state).forEach((k) => {
                if (typeof state[k] === 'object') state[k] = Array.isArray(state[k]) ? [] : {};
            });
        }
    };

    console.info('[AI Guardian] Behavior probe ON (localhost, opt-in). Export: __RG_AI_GUARDIAN__.export()');
}());
