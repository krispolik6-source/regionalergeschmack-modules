/**
 * ETAP 34C — klient Report Manager (Control Center)
 * Kopiowanie: fetch z /docs/...
 * Usuwanie / cleanup / stats: lokalne API 127.0.0.1:3457 (opcjonalne)
 */

import { showToast } from '../core/toast.js';

export const REPORT_API_BASE = 'http://127.0.0.1:3457';

/** Po nieudanym probe nie spamuj fetch → ciszej w Network/konsoli (API opcjonalne). */
const API_OFFLINE_TTL_MS = 60_000;
/** @type {number} */
let apiOfflineUntil = 0;
/** @type {boolean | null} */
let apiOnlineCached = null;

function markApiOffline() {
    apiOnlineCached = false;
    apiOfflineUntil = Date.now() + API_OFFLINE_TTL_MS;
}

function markApiOnline() {
    apiOnlineCached = true;
    apiOfflineUntil = 0;
}

function shouldSkipApiProbe() {
    return apiOnlineCached === false && Date.now() < apiOfflineUntil;
}

/** Katalog raportów w UI (klucz → ścieżki md/json). */
export const REPORT_CATALOG = [
    { key: 'guardian', title: 'Guardian / Future', md: '/docs/guardian-future/latest.md', json: '/docs/guardian-future/latest.json', ico: '🛡' },
    { key: 'dream', title: 'Dream', md: '/docs/dream/latest.md', json: '/docs/dream/latest.json', ico: '🌙' },
    { key: 'brain', title: 'Product Brain', md: '/docs/product-brain/latest.md', json: '/docs/product-brain/latest.json', ico: '🧠' },
    { key: 'health', title: 'Health', md: '/docs/health/latest.md', json: '/docs/health/latest.json', ico: '💚' },
    { key: 'brand', title: 'Brand Protection', md: '/docs/brand-protection/latest.md', json: '/docs/brand-protection/latest.json', ico: '✨' },
    { key: 'reflect', title: 'Self Reflection', md: '/docs/self-reflection/latest.md', json: '/docs/self-reflection/latest.json', ico: '🪞' },
    { key: 'intelligence', title: 'Regional Brain', md: '/docs/intelligence/latest.md', json: '/docs/intelligence/latest.json', ico: '📍' },
    { key: 'livingRegion', title: 'Living Region AI', md: '/docs/living-region/latest.md', json: '/docs/living-region/latest.json', ico: '🌾' },
    { key: 'productIntel', title: 'Product Intelligence', md: '/docs/product-intelligence/latest.md', json: '/docs/product-intelligence/latest.json', ico: '🧭' },
    { key: 'trust', title: 'Trust Audit', md: '/docs/trust/latest.md', json: '/docs/trust/latest.json', ico: '🤝' }
];

async function fetchText(url) {
    try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return null;
        return await res.text();
    } catch {
        return null;
    }
}

async function apiJson(path, options = {}) {
    if (shouldSkipApiProbe()) {
        return { ok: false, status: 0, data: { reason: 'api-offline' } };
    }
    try {
        const res = await fetch(`${REPORT_API_BASE}${path}`, {
            cache: 'no-store',
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            }
        });
        const data = await res.json().catch(() => ({}));
        const ok = res.ok && data.ok !== false;
        if (ok) markApiOnline();
        else markApiOffline();
        return { ok, status: res.status, data };
    } catch {
        markApiOffline();
        return { ok: false, status: 0, data: { reason: 'api-offline' } };
    }
}

export async function isReportApiOnline() {
    if (shouldSkipApiProbe()) return false;
    const r = await apiJson('/status');
    return Boolean(r.ok && r.data?.ok);
}

/** Wymuś ponowny probe (np. po starcie `report-manager:api`). */
export function resetReportApiProbe() {
    apiOnlineCached = null;
    apiOfflineUntil = 0;
}

export async function loadReportsIndex() {
    const live = await apiJson('/index');
    if (live.ok && Array.isArray(live.data?.reports)) return live.data;

    try {
        const res = await fetch('/docs/dev-center/reports-index.json', { cache: 'no-store' });
        if (res.ok) return await res.json();
    } catch { /* ignore */ }

    return {
        generatedAt: null,
        stats: { reportCount: REPORT_CATALOG.length, docsHuman: '—', docsBytes: 0 },
        reports: REPORT_CATALOG.map((c) => ({
            rel: c.md.replace(/^\//, ''),
            module: c.key,
            name: 'latest.md',
            isLatest: true
        })),
        offline: true
    };
}

export async function loadDocsStats() {
    const live = await apiJson('/stats');
    if (live.ok) return live.data;
    const idx = await loadReportsIndex();
    return idx.stats || { reportCount: 0, docsHuman: '—', docsBytes: 0 };
}

/** Pełna treść raportu (preferuj .md, potem .json). */
export async function fetchReportFullText(entryOrPath) {
    const paths = [];
    if (typeof entryOrPath === 'string') {
        paths.push(entryOrPath.startsWith('/') ? entryOrPath : `/${entryOrPath}`);
    } else if (entryOrPath) {
        if (entryOrPath.md) paths.push(entryOrPath.md);
        if (entryOrPath.json) paths.push(entryOrPath.json);
        if (entryOrPath.rel) paths.push(entryOrPath.rel.startsWith('/') ? entryOrPath.rel : `/${entryOrPath.rel}`);
    }
    for (const p of paths) {
        const text = await fetchText(p);
        if (text != null && text.length) return { ok: true, text, path: p };
    }
    // fallback API (tylko gdy lokalne API działa — bez spamu ERR_CONNECTION_REFUSED)
    if (!shouldSkipApiProbe()) {
        for (const p of paths) {
            const rel = p.replace(/^\//, '');
            try {
                const res = await fetch(`${REPORT_API_BASE}/file?path=${encodeURIComponent(rel)}`, { cache: 'no-store' });
                if (res.ok) {
                    markApiOnline();
                    const text = await res.text();
                    if (text) return { ok: true, text, path: p };
                } else {
                    markApiOffline();
                }
            } catch {
                markApiOffline();
            }
        }
    }
    return { ok: false, text: '', path: paths[0] || '' };
}

export async function copyReportToClipboard(entryOrPath) {
    const r = await fetchReportFullText(entryOrPath);
    if (!r.ok) {
        showToast('Brak treści raportu', 'error');
        return false;
    }
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(r.text);
        } else {
            const ta = document.createElement('textarea');
            ta.value = r.text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
        }
        showToast('Raport skopiowany');
        return true;
    } catch {
        showToast('Nie udało się skopiować', 'error');
        return false;
    }
}

export async function deleteReportPath(relPath, { allowLatest = true } = {}) {
    const rel = String(relPath || '').replace(/^\//, '');
    if (!rel.startsWith('docs/')) {
        showToast('Można usuwać tylko docs/', 'error');
        return { ok: false };
    }
    const online = await isReportApiOnline();
    if (!online) {
        showToast('API offline — npm run report-manager:api', 'error');
        return { ok: false, offline: true };
    }
    return apiJson('/delete', {
        method: 'POST',
        body: JSON.stringify({ path: rel, confirm: true, allowLatest })
    });
}

export async function cleanupReports(mode) {
    const online = await isReportApiOnline();
    if (!online) {
        showToast('API offline — npm run report-manager:api', 'error');
        return { ok: false, offline: true };
    }
    return apiJson('/cleanup', {
        method: 'POST',
        body: JSON.stringify({ mode, confirm: true })
    });
}

export async function refreshReportsIndex() {
    resetReportApiProbe();
    const online = await isReportApiOnline();
    if (online) {
        const r = await apiJson('/refresh', { method: 'POST', body: '{}' });
        if (r.ok) {
            showToast('Lista raportów odświeżona');
            return r.data;
        }
    }
    const idx = await loadReportsIndex();
    showToast(idx.offline ? 'Lista z cache (API offline)' : 'Lista odświeżona');
    return idx;
}

export function catalogEntry(key) {
    return REPORT_CATALOG.find((c) => c.key === key) || null;
}
