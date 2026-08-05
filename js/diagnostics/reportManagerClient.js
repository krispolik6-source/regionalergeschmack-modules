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

export const REPORT_RETENTION_DAYS = 30;
export const REPORT_RETENTION_MS = REPORT_RETENTION_DAYS * 24 * 60 * 60 * 1000;

const MODULE_CATEGORY_LABELS = {
    'guardian-future': 'Guardian',
    dream: 'Dream',
    'product-brain': 'Product Brain',
    health: 'Health',
    'brand-protection': 'Brand',
    'self-reflection': 'Reflect',
    intelligence: 'Regional Brain',
    'living-region': 'Living Region',
    'product-intelligence': 'Product Intel',
    trust: 'Trust',
    'living-brand': 'Brand',
    'regional-intelligence': 'Intelligence',
    'real-users': 'Real Users',
    'self-healing': 'System',
    status: 'Status',
    dashboard: 'Dashboard'
};

/** Moduły docs/ objęte katalogiem raportów w panelu. */
export function getCatalogModuleIds() {
    return [...new Set(
        REPORT_CATALOG.map((c) => {
            const m = c.md.match(/^\/docs\/([^/]+)\//);
            return m?.[1] || null;
        }).filter(Boolean)
    )];
}

export function getReportTimestamp(entry) {
    if (!entry) return 0;
    if (entry.mtime) {
        const t = Date.parse(entry.mtime);
        if (Number.isFinite(t)) return t;
    }
    if (entry.generatedAt) {
        const t = Date.parse(entry.generatedAt);
        if (Number.isFinite(t)) return t;
    }
    const name = String(entry.name || entry.rel || '');
    const day = name.match(/(\d{4}-\d{2}-\d{2})/);
    if (day) {
        const t = Date.parse(`${day[1]}T12:00:00Z`);
        if (Number.isFinite(t)) return t;
    }
    return 0;
}

export function isExpiredReport(entry, now = Date.now()) {
    const ts = getReportTimestamp(entry);
    if (!ts) return false;
    return now - ts > REPORT_RETENTION_MS;
}

export function getReportCategoryLabel(entry) {
    if (entry?.kind === 'system' || entry?.categoryLabel === '[System]') {
        return '[System]';
    }
    const mod = String(entry?.module || '').trim();
    const mapped = MODULE_CATEGORY_LABELS[mod];
    if (mapped) return `[${mapped}]`;
    const cat = REPORT_CATALOG.find((c) => entry?.rel?.includes(c.md.replace(/^\//, '').split('/').slice(0, 2).join('/')));
    if (cat) {
        const short = cat.title.split('/')[0].trim();
        return `[${short}]`;
    }
    if (mod) {
        const pretty = mod.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
        return `[${pretty}]`;
    }
    return '[Report]';
}

export function formatSystemStreamEntry(entry) {
    if (!entry) return '';
    const lines = [
        `# System Health`,
        '',
        `- **Status:** ${entry.status || '—'}`,
        `- **Timestamp:** ${entry.timestamp || '—'}`,
        `- **Component:** ${entry.component || '—'}`,
        `- **Source:** ${entry.source || '—'}`,
        `- **Description:** ${entry.description || '—'}`
    ];
    if (entry.message) lines.push('', entry.message);
    if (entry.stack) lines.push('', '```', entry.stack, '```');
    if (entry.aiProposal?.fixSuggestion) {
        const fix = entry.aiProposal.fixSuggestion;
        lines.push('', `**Sugestia:** ${fix.description || '—'}`, `\`${fix.file || ''}\``);
    }
    return lines.join('\n');
}

export async function deleteStreamEntry(entry) {
    if (!entry) return { ok: false };
    if (entry.kind === 'system') {
        try {
            const { removeUnifiedHealthEntry } = await import('../core/selfHealingLogger.js');
            const ok = removeUnifiedHealthEntry(entry.systemEntry || entry);
            return { ok };
        } catch {
            return { ok: false };
        }
    }
    const rel = String(entry.rel || '').replace(/^\//, '');
    if (!rel) return { ok: false };
    return deleteReportPath(rel, { allowLatest: true });
}

export async function copyStreamEntry(entry) {
    if (!entry) return false;
    if (entry.kind === 'system') {
        const text = formatSystemStreamEntry(entry.systemEntry || entry);
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                const ta = document.createElement('textarea');
                ta.value = text;
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
    return copyReportToClipboard(entry.rel || entry);
}

function dedupeReportEntries(entries) {
    const map = new Map();
    for (const entry of entries) {
        const stem = String(entry.name || '').replace(/\.(md|json)$/i, '') || 'report';
        const key = `${entry.module || 'unknown'}/${stem}`;
        const existing = map.get(key);
        if (!existing) {
            map.set(key, entry);
            continue;
        }
        if (/\.md$/i.test(entry.name) && !/\.md$/i.test(existing.name)) {
            map.set(key, entry);
        }
    }
    return [...map.values()];
}

/**
 * Automatyczne usuwanie raportów starszych niż 30 dni (docs/ + localStorage).
 * Wywoływane przy otwarciu zakładki Raporty.
 */
export async function purgeExpiredReports() {
    let docsDeleted = 0;

    try {
        const { cleanupOldReports } = await import('../core/selfHealingLogger.js');
        cleanupOldReports();
    } catch {
        /* ignore */
    }

    const online = await isReportApiOnline();
    if (online) {
        const r = await cleanupReports('older-30');
        if (r.ok) {
            docsDeleted = Number(r.data?.deletedCount ?? r.data?.deleted?.length ?? 0);
        }
    }

    return { docsDeleted };
}

/**
 * Jeden strumień raportów — wszystkie kategorie, najnowsze pierwsze.
 */
export async function loadUnifiedReportStream() {
    await purgeExpiredReports();

    const index = await loadReportsIndex();
    const now = Date.now();

    let docEntries = (index.reports || []).filter((entry) => {
        if (!entry?.rel?.startsWith('docs/')) return false;
        if (!/\.(md|json)$/i.test(String(entry.name || entry.rel))) return false;
        return !isExpiredReport(entry, now);
    });

    docEntries = dedupeReportEntries(docEntries);

    let systemEntries = [];
    try {
        const { buildUnifiedSystemHealth } = await import('../core/selfHealingLogger.js');
        const unified = buildUnifiedSystemHealth();
        systemEntries = (unified.entries || [])
            .filter((entry) => {
                const ts = Date.parse(String(entry.timestamp || ''));
                if (!Number.isFinite(ts)) return true;
                return now - ts <= REPORT_RETENTION_MS;
            })
            .map((entry) => ({
                kind: 'system',
                streamId: String(entry.id || `system-${entry.timestamp}-${entry.component}`),
                categoryLabel: '[System]',
                name: `${entry.component || 'runtime'} · ${entry.status || '—'}`,
                title: `${entry.component || 'runtime'} · ${entry.status || '—'}`,
                rel: null,
                systemEntry: entry,
                mtime: entry.timestamp,
                sortTs: Date.parse(String(entry.timestamp || '')) || 0
            }));
    } catch {
        systemEntries = [];
    }

    const docStream = docEntries.map((entry) => ({
        ...entry,
        kind: 'doc',
        streamId: `doc-${entry.rel}`,
        categoryLabel: getReportCategoryLabel(entry),
        sortTs: getReportTimestamp(entry)
    }));

    const merged = [...docStream, ...systemEntries];
    merged.sort((a, b) => (b.sortTs || 0) - (a.sortTs || 0));

    return merged;
}
