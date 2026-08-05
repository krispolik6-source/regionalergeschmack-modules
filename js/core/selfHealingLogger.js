/**
 * Self-Healing Logger — krytyczne błędy · healingReport · retention 30 dni.
 *
 * localStorage:
 *  - selfHealingLog — surowe błędy (max ~1 MB)
 *  - healingReport — kolorowy raport sesji (FIXED / SUGGESTION / FAILED)
 *  - logs/system_health_[DATA].md — dzienne podsumowanie markdown
 *
 * Polityka: autoApply=false · bez eval · runtime tylko whitelist (selfHealingFixer.js)
 */

import { byteLen, safeLocalStorageSetItem } from './safeStorage.js';
import { applySafeMitigation, resolveSafeMitigationId } from './selfHealingFixer.js';
import { INTELLIGENCE_POLICY } from '../intelligence/policy.js';

/** Klucz localStorage (selfHealingLog) */
export const SELF_HEALING_LOG_KEY = 'selfHealingLog';
/** Klucz raportu sesji */
export const HEALING_REPORT_KEY = 'healingReport';
const CLEANUP_DAY_KEY = 'rg_self_healing_cleanup_day';
const LAST_SUMMARY_DAY_KEY = 'rg_self_healing_summary_day';
const HEALTH_LOG_INDEX_KEY = 'rg_system_health_index';
const AI_CONFIG_KEY = 'rg_self_heal_ai_config';

const LOG_VERSION = 2;
const REPORT_VERSION = 1;
const MAX_LOG_BYTES = 1024 * 1024;
const MAX_REPORT_ENTRIES = 200;
const RETENTION_DAYS = 30;
const MAX_STACK_CHARS = 4000;
const MAX_MESSAGE_CHARS = 1200;

/** @typedef {'FIXED'|'SUGGESTION'|'FAILED'} HealingStatus */

/** @readonly */
export const HEALING_STATUS = Object.freeze({
    FIXED: 'FIXED',
    SUGGESTION: 'SUGGESTION',
    FAILED: 'FAILED'
});

/** @readonly */
export const HEALING_STATUS_META = Object.freeze({
    FIXED: { emoji: '✅', cssClass: 'healing-status--fixed', markdown: '✅ FIXED' },
    SUGGESTION: { emoji: '🟡', cssClass: 'healing-status--suggestion', markdown: '🟡 SUGGESTION' },
    FAILED: { emoji: '🔴', cssClass: 'healing-status--failed', markdown: '🔴 FAILED' }
});

/** @readonly */
export const SELF_HEALING_LOGGER_POLICY = Object.freeze({
    autoApply: false,
    autoFix: false,
    autoModifyCode: false,
    advisoryOnly: true,
    requiresOwnerAcceptance: true,
    mutatesHtml: false,
    mutatesUserData: false,
    allowsRuntimeMitigation: true,
    usesEval: false
});

let initialized = false;
let nativeFetch = null;
let pendingWrite = false;
let pendingReportWrite = false;
/** @type {ReturnType<typeof setTimeout> | number | null} */
let idleWriteTimer = null;
/** @type {ReturnType<typeof setTimeout> | number | null} */
let idleReportWriteTimer = null;

const NON_CRITICAL_ERROR_PATTERNS = [
    /ResizeObserver loop/i,
    /Script error\.?$/i,
    /Loading chunk \d+ failed/i,
    /Non-Error promise rejection/i
];

const NON_CRITICAL_URL_PATTERNS = [
    /\.(png|jpe?g|webp|svg|gif|ico|css|woff2?|ttf|eot|mp3|wav)(\?|$)/i,
    /tile\.openstreetmap\.org/i,
    /fonts\.googleapis\.com/i,
    /fonts\.gstatic\.com/i,
    /googlesyndication\.com/i,
    /google-analytics\.com/i,
    /doubleclick\.net/i,
    /favicon/i,
    /logo-master\.svg/i,
    /category_/i,
    /assets\/icons\//i
];

const CRITICAL_API_URL_PATTERNS = [
    /overpass/i,
    /nominatim\.openstreetmap\.org/i,
    /\/api\//i,
    /dataService/i
];

function nowIso() {
    return new Date().toISOString();
}

function dayStamp(d = new Date()) {
    return d.toISOString().slice(0, 10);
}

function systemHealthMarkdownKey(date = dayStamp()) {
    return `logs/system_health_${date}.md`;
}

function truncate(text, max) {
    const s = String(text ?? '');
    return s.length <= max ? s : `${s.slice(0, max)}…`;
}

function errorToParts(error) {
    if (error instanceof Error) {
        return {
            name: error.name || 'Error',
            message: truncate(error.message || String(error), MAX_MESSAGE_CHARS),
            stack: truncate(error.stack || '', MAX_STACK_CHARS)
        };
    }
    return {
        name: 'Error',
        message: truncate(String(error ?? 'unknown'), MAX_MESSAGE_CHARS),
        stack: ''
    };
}

function createSessionId() {
    return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * @returns {{ version: number, sessionId: string, sessionStartedAt: string, lastSummaryAt: string|null, entries: object[] }}
 */
function createEmptyHealingReport() {
    return {
        version: REPORT_VERSION,
        sessionId: createSessionId(),
        sessionStartedAt: nowIso(),
        lastSummaryAt: null,
        entries: []
    };
}

/**
 * @returns {{ version: number, sessionId: string, sessionStartedAt: string, lastSummaryAt: string|null, entries: object[] }}
 */
export function getHealingReport() {
    try {
        const raw = localStorage.getItem(HEALING_REPORT_KEY);
        if (!raw) return createEmptyHealingReport();
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return createEmptyHealingReport();
        return {
            version: REPORT_VERSION,
            sessionId: String(parsed.sessionId || createSessionId()),
            sessionStartedAt: String(parsed.sessionStartedAt || nowIso()),
            lastSummaryAt: parsed.lastSummaryAt ? String(parsed.lastSummaryAt) : null,
            entries: Array.isArray(parsed.entries) ? parsed.entries : []
        };
    } catch {
        return createEmptyHealingReport();
    }
}

function persistHealingReportNow(report) {
    try {
        const payload = { ...report };
        while (payload.entries.length > MAX_REPORT_ENTRIES) {
            payload.entries.shift();
        }
        safeLocalStorageSetItem(HEALING_REPORT_KEY, JSON.stringify(payload));
    } catch {
        /* ignore */
    }
}

function schedulePersistHealingReport(report) {
    pendingReportWrite = true;
    if (idleReportWriteTimer) return;

    const run = () => {
        idleReportWriteTimer = null;
        if (!pendingReportWrite) return;
        pendingReportWrite = false;
        persistHealingReportNow(report);
    };

    const ric = typeof globalThis.requestIdleCallback === 'function'
        ? globalThis.requestIdleCallback
        : null;
    if (ric) {
        idleReportWriteTimer = ric(run, { timeout: 2500 });
    } else {
        idleReportWriteTimer = globalThis.setTimeout(run, 100);
    }
}

/**
 * Wyciąga komponent z kontekstu / stack trace.
 * @param {object} context
 * @param {string} [fallback]
 */
export function resolveHealingComponent(context = {}, fallback = 'runtime') {
    if (context.component) return String(context.component);
    if (context.filename) {
        const parts = String(context.filename).split(/[/\\]/);
        return parts[parts.length - 1] || fallback;
    }
    if (context.area) return String(context.area);
    if (context.type === 'fetch' && context.url) {
        try {
            const u = new URL(String(context.url), 'https://local.invalid');
            return u.hostname + u.pathname.split('/').slice(-2).join('/');
        } catch {
            return String(context.url).slice(0, 80);
        }
    }
    const stack = String(context.stack || '');
    const match = stack.match(/([\w./-]+\.js):\d+/);
    if (match) return match[1].split('/').pop();
    return fallback;
}

/**
 * Dodaje wpis do healingReport.
 * @param {{ status: HealingStatus, component: string, description: string, timestamp?: string, relatedLogId?: string }} entry
 */
export function addHealingReportEntry(entry) {
    const status = HEALING_STATUS[entry?.status] ? entry.status : HEALING_STATUS.FAILED;
    const report = getHealingReport();
    report.entries.push({
        id: `hr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        status,
        component: truncate(entry.component || 'runtime', 120),
        description: truncate(entry.description || '', 500),
        timestamp: entry.timestamp || nowIso(),
        relatedLogId: entry.relatedLogId || null
    });
    persistHealingReportNow(report);
    return report.entries[report.entries.length - 1].id;
}

/**
 * Sugestia niskiego priorytetu (bez auto-wdrażenia kodu).
 * @param {string} component
 * @param {string} description
 * @param {object} [context]
 */
export function logHealingSuggestion(component, description, context = {}) {
    return addHealingReportEntry({
        status: HEALING_STATUS.SUGGESTION,
        component: resolveHealingComponent(context, component),
        description,
        timestamp: nowIso()
    });
}

function recordHealingOutcome(logEntry, mitigationId, mitResult) {
    const component = resolveHealingComponent(
        { ...logEntry.context, stack: logEntry.stack, component: mitigationId ? `selfHealingFixer/${mitigationId}` : undefined },
        logEntry.context?.filename?.split('/').pop() || 'runtime'
    );

    if (mitResult?.ok) {
        addHealingReportEntry({
            status: HEALING_STATUS.FIXED,
            component,
            description: mitResult.detail || `Mitigacja runtime: ${mitigationId}`,
            relatedLogId: logEntry.id
        });
        return;
    }

    if (mitigationId && mitResult && !mitResult.ok) {
        addHealingReportEntry({
            status: HEALING_STATUS.FAILED,
            component,
            description: mitResult.detail || `Mitigacja nie powiodła się: ${mitigationId}`,
            relatedLogId: logEntry.id
        });
        return;
    }

    if (logEntry.aiProposal?.suggestion) {
        addHealingReportEntry({
            status: HEALING_STATUS.SUGGESTION,
            component,
            description: truncate(logEntry.aiProposal.suggestion, 480),
            relatedLogId: logEntry.id
        });
        return;
    }

    addHealingReportEntry({
        status: HEALING_STATUS.FAILED,
        component,
        description: logEntry.message || 'Krytyczny błąd — wymaga ręcznej weryfikacji',
        relatedLogId: logEntry.id
    });
}

/**
 * @param {object} [report]
 * @param {string} [date]
 */
export function generateSessionSummaryMarkdown(report = getHealingReport(), date = dayStamp()) {
    const entries = Array.isArray(report.entries) ? report.entries : [];
    const fixed = entries.filter((e) => e.status === HEALING_STATUS.FIXED).length;
    const suggestion = entries.filter((e) => e.status === HEALING_STATUS.SUGGESTION).length;
    const failed = entries.filter((e) => e.status === HEALING_STATUS.FAILED).length;

    const lines = [
        `# System Health — ${date}`,
        '',
        `> Session: \`${report.sessionId}\` · started ${report.sessionStartedAt}`,
        '',
        `**Summary:** ✅ ${fixed} fixed · 🟡 ${suggestion} suggestions · 🔴 ${failed} failed`,
        '',
        '| Status | Component | Description | Time |',
        '| --- | --- | --- | --- |'
    ];

    const dayEntries = entries.filter((e) => String(e.timestamp || '').slice(0, 10) === date);
    const slice = (dayEntries.length ? dayEntries : entries).slice(-80);

    for (const entry of slice) {
        const meta = HEALING_STATUS_META[entry.status] || HEALING_STATUS_META.FAILED;
        const time = String(entry.timestamp || '').replace('T', ' ').slice(0, 16);
        const desc = String(entry.description || '').replace(/\|/g, '/').replace(/\n/g, ' ');
        lines.push(`| ${meta.markdown} | \`${entry.component}\` | ${desc} | ${time} |`);
    }

    lines.push('');
    lines.push('_autoApply=false · advisory only · no eval_');
    lines.push('');
    return lines.join('\n');
}

function updateHealthLogIndex(key, date) {
    try {
        const raw = localStorage.getItem(HEALTH_LOG_INDEX_KEY);
        const list = raw ? JSON.parse(raw) : [];
        const next = Array.isArray(list) ? list : [];
        if (!next.some((row) => row?.key === key)) {
            next.push({ key, date, generatedAt: nowIso() });
        }
        while (next.length > 60) next.shift();
        localStorage.setItem(HEALTH_LOG_INDEX_KEY, JSON.stringify(next));
    } catch {
        /* ignore */
    }
}

/**
 * Zapisuje dzienne podsumowanie markdown w localStorage.
 * @returns {string|null} klucz zapisu
 */
export function persistSessionSummaryMarkdown() {
    const date = dayStamp();
    const report = getHealingReport();
    if (!report.entries.length) return null;

    const key = systemHealthMarkdownKey(date);
    const markdown = generateSessionSummaryMarkdown(report, date);

    try {
        safeLocalStorageSetItem(key, markdown);
        updateHealthLogIndex(key, date);
        report.lastSummaryAt = nowIso();
        schedulePersistHealingReport(report);
        localStorage.setItem(LAST_SUMMARY_DAY_KEY, date);
    } catch {
        return null;
    }
    return key;
}

export function getLatestSystemHealthMarkdown(date = dayStamp()) {
    try {
        return localStorage.getItem(systemHealthMarkdownKey(date)) || '';
    } catch {
        return '';
    }
}

function cleanupOldMarkdownLogs(cutoffMs) {
    try {
        const raw = localStorage.getItem(HEALTH_LOG_INDEX_KEY);
        const list = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(list)) return 0;
        let removed = 0;
        const kept = [];
        for (const row of list) {
            const at = Date.parse(String(row?.generatedAt || row?.date || ''));
            if (Number.isFinite(at) && at < cutoffMs) {
                if (row?.key) {
                    try { localStorage.removeItem(row.key); } catch { /* ignore */ }
                }
                removed += 1;
            } else {
                kept.push(row);
            }
        }
        localStorage.setItem(HEALTH_LOG_INDEX_KEY, JSON.stringify(kept));
        return removed;
    } catch {
        return 0;
    }
}

function scheduleSessionSummaryIfDue() {
    const today = dayStamp();
    try {
        const last = localStorage.getItem(LAST_SUMMARY_DAY_KEY);
        if (last === today) return;
    } catch {
        /* ignore */
    }
    persistSessionSummaryMarkdown();
}

function onSessionEnd() {
    const run = () => {
        persistSessionSummaryMarkdown();
    };
    if (typeof globalThis.requestIdleCallback === 'function') {
        globalThis.requestIdleCallback(run, { timeout: 3000 });
    } else {
        globalThis.setTimeout(run, 150);
    }
}

function bindSessionEndHooks() {
    if (typeof document === 'undefined') return;
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') onSessionEnd();
    });
    window.addEventListener('pagehide', onSessionEnd);
}

/**
 * Czy URL to krytyczne API (nie zwykły asset).
 * @param {string} url
 */
export function isCriticalNetworkUrl(url) {
    const u = String(url || '').trim();
    if (!u) return false;
    if (NON_CRITICAL_URL_PATTERNS.some((re) => re.test(u))) return false;
    return CRITICAL_API_URL_PATTERNS.some((re) => re.test(u));
}

/**
 * Czy błąd kwalifikuje się do zapisu.
 * @param {Error|unknown} error
 * @param {object} [context]
 */
export function isCriticalError(error, context = {}) {
    const parts = errorToParts(error);
    const message = parts.message;
    const name = parts.name;

    if (NON_CRITICAL_ERROR_PATTERNS.some((re) => re.test(message))) {
        return false;
    }

    if (name === 'QuotaExceededError' || /quota exceeded|QuotaExceeded/i.test(message)) {
        return true;
    }

    const ctxType = String(context?.type || '');

    if (ctxType === 'fetch') {
        const url = String(context.url || '');
        const status = Number(context.status);
        if (!isCriticalNetworkUrl(url)) return false;
        if (status >= 500 && status <= 599) return true;
        if (status === 404) return true;
        if (context.networkFailure === true) return true;
        return false;
    }

    if (context.source === 'window.error' || context.source === 'unhandledrejection') {
        return true;
    }

    if (context.critical === true) return true;

    return false;
}

function readLogRaw() {
    try {
        const raw = localStorage.getItem(SELF_HEALING_LOG_KEY);
        if (!raw) return { version: LOG_VERSION, entries: [] };
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return { version: LOG_VERSION, entries: [] };
        const entries = Array.isArray(parsed.entries) ? parsed.entries : [];
        return { version: LOG_VERSION, entries };
    } catch {
        return { version: LOG_VERSION, entries: [] };
    }
}

function trimLogToMaxBytes(log) {
    let payload = JSON.stringify(log);
    while (byteLen(payload) > MAX_LOG_BYTES && log.entries.length > 1) {
        log.entries.shift();
        payload = JSON.stringify(log);
    }
    if (byteLen(payload) > MAX_LOG_BYTES && log.entries.length === 1) {
        const e = log.entries[0];
        e.stack = truncate(e.stack, 800);
        e.message = truncate(e.message, 400);
        if (e.aiProposal?.suggestion) {
            e.aiProposal.suggestion = truncate(e.aiProposal.suggestion, 600);
        }
    }
    return log;
}

function schedulePersistLog(log) {
    pendingWrite = true;
    if (idleWriteTimer) return;

    const run = () => {
        idleWriteTimer = null;
        if (!pendingWrite) return;
        pendingWrite = false;
        try {
            const trimmed = trimLogToMaxBytes(log);
            safeLocalStorageSetItem(SELF_HEALING_LOG_KEY, JSON.stringify(trimmed));
        } catch {
            /* ignore */
        }
    };

    const ric = typeof globalThis.requestIdleCallback === 'function'
        ? globalThis.requestIdleCallback
        : null;

    if (ric) {
        idleWriteTimer = ric(run, { timeout: 3000 });
    } else {
        idleWriteTimer = globalThis.setTimeout(run, 120);
    }
}

/**
 * Usuwa wpisy starsze niż 30 dni.
 * @returns {{ removed: number, remaining: number, markdownRemoved: number }}
 */
export function cleanupOldReports() {
    const log = readLogRaw();
    const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
    const before = log.entries.length;
    log.entries = log.entries.filter((entry) => {
        const at = Date.parse(String(entry?.at || ''));
        return Number.isFinite(at) && at >= cutoff;
    });
    const removed = before - log.entries.length;
    schedulePersistLog(log);

    const report = getHealingReport();
    const reportBefore = report.entries.length;
    report.entries = report.entries.filter((entry) => {
        const at = Date.parse(String(entry?.timestamp || ''));
        return Number.isFinite(at) && at >= cutoff;
    });
    if (report.entries.length !== reportBefore) {
        schedulePersistHealingReport(report);
    }

    const markdownRemoved = cleanupOldMarkdownLogs(cutoff);

    try {
        localStorage.setItem(CLEANUP_DAY_KEY, dayStamp());
    } catch {
        /* ignore */
    }
    return { removed, remaining: log.entries.length, markdownRemoved };
}

/**
 * Raz dziennie — przy starcie lub wejściu na Home.
 */
export function scheduleSelfHealingMaintenance() {
    const run = () => {
        try {
            const last = localStorage.getItem(CLEANUP_DAY_KEY);
            if (last !== dayStamp()) cleanupOldReports();
            scheduleSessionSummaryIfDue();
        } catch {
            /* ignore */
        }
    };

    if (typeof globalThis.requestIdleCallback === 'function') {
        globalThis.requestIdleCallback(run, { timeout: 5000 });
    } else {
        globalThis.setTimeout(run, 800);
    }
}

function buildHeuristicAiProposal(error, context) {
    const parts = errorToParts(error);
    const mitigationId = resolveSafeMitigationId(error, context);
    const area = String(context?.area || context?.type || 'runtime');
    return {
        status: 'pending_acceptance',
        at: nowIso(),
        source: 'heuristic',
        expectedEffect: mitigationId
            ? `Bezpieczna mitigacja runtime: ${mitigationId}`
            : 'Analiza właściciela — brak whitelistowej mitigacji',
        stackExcerpt: truncate(parts.stack, 1200),
        contextSummary: truncate(JSON.stringify({
            area,
            url: context?.url || null,
            status: context?.status ?? null
        }), 600),
        suggestion: [
            'Propozycja (bez auto-wdrażenia kodu — polityka autoApply=false):',
            `- Obszar: ${area}`,
            `- Komunikat: ${parts.message}`,
            mitigationId
                ? `- Dozwolona mitigacja runtime: ${mitigationId}`
                : '- Wymaga ręcznej akceptacji właściciela w docs/',
            INTELLIGENCE_POLICY.requiresOwnerAcceptance
                ? '- Status: pending_acceptance'
                : ''
        ].filter(Boolean).join('\n')
    };
}

function readAiConfig() {
    try {
        const raw = localStorage.getItem(AI_CONFIG_KEY);
        if (!raw) return null;
        const cfg = JSON.parse(raw);
        if (!cfg?.enabled || !String(cfg?.apiKey || '').trim()) return null;
        return cfg;
    } catch {
        return null;
    }
}

async function requestAiFixProposal(logEntry) {
    const cfg = readAiConfig();
    const parts = errorToParts(logEntry);
    const prompt = [
        'Jesteś audytorem PWA. NIE generujesz kodu do eval.',
        'Zwróć krótką propozycję naprawy (max 800 znaków) dla właściciela aplikacji.',
        'Oczekiwany efekt: stabilność na mobile, bez zmiany layoutu HTML.',
        `Stack:\n${parts.stack || parts.message}`,
        `Kontekst: ${JSON.stringify(logEntry.context || {})}`
    ].join('\n\n');

    if (!cfg) {
        return buildHeuristicAiProposal(logEntry, logEntry.context || {});
    }

    try {
        const endpoint = String(cfg.endpoint || 'https://api.openai.com/v1/chat/completions');
        const model = String(cfg.model || 'gpt-4o-mini');
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${cfg.apiKey}`
            },
            body: JSON.stringify({
                model,
                temperature: 0.2,
                max_tokens: 500,
                messages: [
                    { role: 'system', content: 'Advisory only. No executable code blocks. Polish or German.' },
                    { role: 'user', content: prompt }
                ]
            })
        });
        if (!res.ok) {
            return buildHeuristicAiProposal(logEntry, logEntry.context || {});
        }
        const data = await res.json();
        const suggestion = truncate(
            data?.choices?.[0]?.message?.content || '',
            800
        );
        return {
            status: 'pending_acceptance',
            at: nowIso(),
            source: 'openai',
            expectedEffect: 'Propozycja od AI — wymaga akceptacji właściciela',
            stackExcerpt: truncate(parts.stack, 1200),
            contextSummary: truncate(JSON.stringify(logEntry.context || {}), 600),
            suggestion: suggestion || buildHeuristicAiProposal(logEntry, logEntry.context || {}).suggestion
        };
    } catch {
        return buildHeuristicAiProposal(logEntry, logEntry.context || {});
    }
}

async function processCriticalEntry(entry) {
    const mitigationId = resolveSafeMitigationId(entry, entry.context || {});
    let mitResult = null;

    if (mitigationId) {
        mitResult = await applySafeMitigation(mitigationId, {
            ...(entry.context || {}),
            _retried: entry.context?.type === 'fetch'
        });
        entry.mitigation = {
            id: mitigationId,
            applied: mitResult.ok,
            at: nowIso(),
            detail: mitResult.detail || ''
        };
        if (mitResult.ok) {
            entry.type = entry.type === 'error' ? 'error-fixed' : entry.type;
        }
    }

    try {
        entry.aiProposal = await requestAiFixProposal(entry);
    } catch {
        entry.aiProposal = buildHeuristicAiProposal(entry, entry.context || {});
    }

    recordHealingOutcome(entry, mitigationId, mitResult);
}

/**
 * Zapisuje wyłącznie błąd krytyczny (+ opcjonalna mitigacja + propozycja AI).
 * @param {Error|unknown} error
 * @param {object} [context]
 */
export function logCriticalError(error, context = {}) {
    if (!isCriticalError(error, context)) return null;

    const parts = errorToParts(error);
    const entry = {
        id: `sh-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        at: nowIso(),
        type: 'error',
        critical: true,
        name: parts.name,
        message: parts.message,
        stack: parts.stack,
        context: {
            ...context,
            policy: {
                autoApply: SELF_HEALING_LOGGER_POLICY.autoApply,
                usesEval: false
            }
        },
        mitigation: null,
        aiProposal: null
    };

    const log = readLogRaw();
    log.entries.push(entry);
    schedulePersistLog(log);

    const finalize = () => {
        void processCriticalEntry(entry).then(() => {
            const latest = readLogRaw();
            const idx = latest.entries.findIndex((e) => e.id === entry.id);
            if (idx >= 0) {
                latest.entries[idx] = { ...latest.entries[idx], ...entry };
                schedulePersistLog(latest);
            }
        });
    };

    if (typeof globalThis.requestIdleCallback === 'function') {
        globalThis.requestIdleCallback(finalize, { timeout: 4000 });
    } else {
        globalThis.setTimeout(finalize, 200);
    }

    return entry.id;
}

export function getSelfHealingLog() {
    return readLogRaw();
}

function onWindowError(event) {
    const err = event?.error instanceof Error
        ? event.error
        : new Error(String(event?.message || 'window.error'));
    logCriticalError(err, {
        source: 'window.error',
        filename: event?.filename || '',
        lineno: event?.lineno,
        colno: event?.colno
    });
}

function onUnhandledRejection(event) {
    const reason = event?.reason;
    const err = reason instanceof Error ? reason : new Error(String(reason ?? 'unhandledrejection'));
    logCriticalError(err, { source: 'unhandledrejection' });
}

function wrapFetchForCriticalLogging() {
    if (typeof window.fetch !== 'function' || nativeFetch) return;
    nativeFetch = window.fetch.bind(window);

    window.fetch = async function patchedFetch(input, init) {
        const url = typeof input === 'string'
            ? input
            : (input?.url || String(input || ''));
        try {
            const res = await nativeFetch(input, init);
            if (!res.ok && isCriticalNetworkUrl(url)) {
                logCriticalError(new Error(`HTTP ${res.status} ${url}`), {
                    type: 'fetch',
                    url,
                    status: res.status,
                    method: String(init?.method || 'GET')
                });
            }
            return res;
        } catch (error) {
            if (isCriticalNetworkUrl(url)) {
                logCriticalError(error, {
                    type: 'fetch',
                    url,
                    networkFailure: true,
                    method: String(init?.method || 'GET')
                });
            }
            throw error;
        }
    };
}

/**
 * Inicjalizacja w tle — hooki błędów, fetch, cleanup, podsumowanie sesji.
 */
export function initSelfHealingLogger() {
    if (initialized) return;
    initialized = true;

    window.addEventListener('error', onWindowError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    wrapFetchForCriticalLogging();
    bindSessionEndHooks();
    scheduleSelfHealingMaintenance();

    window.__RG_SELF_HEALING_LOG__ = {
        policy: SELF_HEALING_LOGGER_POLICY,
        log: getSelfHealingLog,
        report: getHealingReport,
        logCriticalError,
        addHealingReportEntry,
        logHealingSuggestion,
        cleanupOldReports,
        generateSessionSummaryMarkdown,
        persistSessionSummaryMarkdown,
        isCriticalError,
        isCriticalNetworkUrl,
        HEALING_STATUS,
        HEALING_STATUS_META
    };
}

export default {
    SELF_HEALING_LOG_KEY,
    HEALING_REPORT_KEY,
    HEALING_STATUS,
    HEALING_STATUS_META,
    SELF_HEALING_LOGGER_POLICY,
    initSelfHealingLogger,
    logCriticalError,
    addHealingReportEntry,
    logHealingSuggestion,
    getHealingReport,
    cleanupOldReports,
    scheduleSelfHealingMaintenance,
    generateSessionSummaryMarkdown,
    persistSessionSummaryMarkdown,
    getLatestSystemHealthMarkdown,
    getSelfHealingLog,
    isCriticalError,
    isCriticalNetworkUrl,
    resolveHealingComponent
};
