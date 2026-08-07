/**
 * Interaktywne zarządzanie sugestiami w Developer Vault (tylko właściciel, PIN).
 * autoApply=false globalnie — apply wyłącznie po kliknięciu w panelu.
 */

import {
    normalizeStreamStatus,
    STREAM_STATUS,
    loadStreamEntryPreview
} from './reportManagerClient.js';
import {
    removeUnifiedHealthEntry,
    updateUnifiedHealthEntry,
    HEALING_STATUS
} from '../core/selfHealingLogger.js';
import {
    applySafeMitigation,
    resolveSafeMitigationId
} from '../core/selfHealingFixer.js';
import { devVaultPl } from '../translations-dev-vault.js';

/** Nagłówki opisów wg statusu (kolor w CSS panelu). */
export const STREAM_STATUS_HEADING = Object.freeze({
    FIXED: { label: devVaultPl('suggestions.fixedHeading', 'Co zostało naprawione'), tone: 'fixed' },
    SUGGESTION: { label: devVaultPl('suggestions.suggestionHeading', 'Co sugeruję do poprawy'), tone: 'suggestion' },
    FAILED: { label: devVaultPl('suggestions.failedHeading', 'Co jest problemem'), tone: 'failed' },
    INFO: { label: devVaultPl('suggestions.infoHeading', 'Co proponuję zmienić'), tone: 'info' }
});

export const DEV_VAULT_DISMISSED_KEY = 'devVault_dismissedStreamIds';
export const DEV_VAULT_ACCEPTED_KEY = 'devVault_acceptedStreamIds';

function readDismissedSet() {
    try {
        const raw = localStorage.getItem(DEV_VAULT_DISMISSED_KEY);
        const list = raw ? JSON.parse(raw) : [];
        return new Set(Array.isArray(list) ? list.map(String) : []);
    } catch {
        return new Set();
    }
}

function writeDismissedSet(set) {
    try {
        localStorage.setItem(DEV_VAULT_DISMISSED_KEY, JSON.stringify([...set].slice(-500)));
    } catch {
        /* ignore */
    }
}

function readAcceptedSet() {
    try {
        const raw = localStorage.getItem(DEV_VAULT_ACCEPTED_KEY);
        const list = raw ? JSON.parse(raw) : [];
        return new Set(Array.isArray(list) ? list.map(String) : []);
    } catch {
        return new Set();
    }
}

function writeAcceptedSet(set) {
    try {
        localStorage.setItem(DEV_VAULT_ACCEPTED_KEY, JSON.stringify([...set].slice(-500)));
    } catch {
        /* ignore */
    }
}

/**
 * @param {object} entry
 * @returns {boolean}
 */
export function isStreamEntryDismissed(entry) {
    if (!entry?.streamId) return false;
    return readDismissedSet().has(String(entry.streamId));
}

/**
 * @param {object[]} entries
 * @returns {object[]}
 */
export function filterDismissedStreamEntries(entries) {
    const dismissed = readDismissedSet();
    return (entries || []).filter((entry) => !dismissed.has(String(entry.streamId)));
}

/**
 * @param {object} entry
 * @returns {'FIXED'|'SUGGESTION'|'FAILED'|'INFO'}
 */
export function resolveEntryStreamStatus(entry) {
    const raw = entry?.streamStatus
        ?? entry?.systemEntry?.status
        ?? entry?.status;
    return normalizeStreamStatus(raw);
}

/** Domyślny opis gdy brak treści raportu. */
export const STREAM_ENTRY_NO_DETAILS = devVaultPl('suggestions.noDetails', 'Brak szczegółów dla tej sugestii.');
export const FAILED_MANUAL_ANALYSIS_HINT = devVaultPl('suggestions.manualAnalysis', 'Wymaga ręcznej analizy kodu');
export const OWNER_APPROVED_FIX_NOTE = devVaultPl('suggestions.ownerApproved', 'Naprawa zatwierdzona przez użytkownika');

const EXCERPT_MAX_LEN = 110;

/**
 * @param {string} text
 * @returns {boolean}
 */
export function looksLikeFileName(text) {
    const s = String(text || '').trim();
    if (!s) return true;
    if (/^latest(\s·\s*bieżący)?$/i.test(s)) return true;
    if (/^latest\.(md|json)$/i.test(s)) return true;
    if (/\.(md|json)$/i.test(s) && !/\s/.test(s)) return true;
    if (/^docs\//i.test(s)) return true;
    return false;
}

/**
 * @param {string} raw
 * @param {number} [maxLen]
 * @returns {string}
 */
export function trimExcerpt(raw, maxLen = EXCERPT_MAX_LEN) {
    let s = String(raw || '').replace(/\s+/g, ' ').trim();
    if (!s || looksLikeFileName(s)) return '';
    if (s.length <= maxLen) return s;
    const cut = s.slice(0, maxLen);
    const lastSpace = cut.lastIndexOf(' ');
    return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

/**
 * Wyciąga pierwsze zdanie / akapit z markdown (bez nagłówków i metadanych).
 * @param {string} md
 * @param {number} [maxLen]
 */
export function extractMarkdownExcerpt(md, maxLen = EXCERPT_MAX_LEN) {
    const parts = [];
    for (const line of String(md || '').split('\n')) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (/^#{1,6}\s/.test(trimmed)) continue;
        if (/^>\s/.test(trimmed)) continue;
        if (/^[-|]{3,}$/.test(trimmed.replace(/\s/g, ''))) continue;
        if (/^\|/.test(trimmed)) {
            const cells = trimmed.split('|').map((c) => c.trim()).filter(Boolean);
            const cellText = cells.find((c) => !/^[-:]+$/.test(c) && !looksLikeFileName(c));
            if (cellText) parts.push(cellText);
            continue;
        }
        let plain = trimmed
            .replace(/^[-*+]\s+/, '')
            .replace(/^\d+\.\s+/, '')
            .replace(/\*\*(.+?)\*\*/g, '$1')
            .replace(/__(.+?)__/g, '$1')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .trim();
        if (!plain || looksLikeFileName(plain)) continue;
        parts.push(plain);
        if (parts.join(' ').length >= maxLen) break;
    }

    const joined = parts.join(' ').replace(/\s+/g, ' ').trim();
    if (!joined) return '';

    const sentenceMatch = joined.match(/^(.+?[.!?])(?:\s|$)/);
    const first = (sentenceMatch ? sentenceMatch[1] : joined).trim();
    return trimExcerpt(first, maxLen);
}

/**
 * @param {string} text
 * @param {'markdown'|'json'|'text'} [format]
 * @param {number} [maxLen]
 */
export function extractReportContentExcerpt(text, format = 'markdown', maxLen = EXCERPT_MAX_LEN) {
    if (!text || !String(text).trim()) return '';

    if (format === 'json') {
        try {
            const data = JSON.parse(text);
            const candidates = [
                data.summary?.description,
                data.description,
                data.proposal,
                data.suggestion,
                data.findings?.[0]?.message,
                data.findings?.[0]?.detail,
                data.findings?.[0]?.description,
                data.suggestions?.[0]?.description,
                data.suggestions?.[0]?.text,
                data.proposals?.[0]?.description,
                data.proposals?.[0]?.text,
                data.entries?.[0]?.description
            ];
            for (const candidate of candidates) {
                const excerpt = trimExcerpt(String(candidate || ''), maxLen);
                if (excerpt) return excerpt;
            }
        } catch {
            /* fall through to markdown */
        }
    }

    return extractMarkdownExcerpt(text, maxLen);
}

/**
 * Uzupełnia wpisy strumienia o krótki opis z treści .md / .json (zamiast nazwy pliku).
 * @param {object[]} entries
 */
export async function enrichStreamEntriesWithDescriptions(entries) {
    await Promise.all((entries || []).map(async (entry) => {
        if (entry?.mdExcerpt) return;

        const sys = entry?.systemEntry;
        const sysText = sys?.description
            || sys?.aiProposal?.fixSuggestion?.description
            || sys?.aiProposal?.suggestion
            || sys?.message
            || '';

        if (sysText && !looksLikeFileName(sysText)) {
            entry.mdExcerpt = trimExcerpt(
                String(sysText).replace(/^\[Gotowe do wdrożenia\]\s*/i, ''),
                EXCERPT_MAX_LEN
            );
            return;
        }

        if (entry?.kind === 'system') {
            entry.mdExcerpt = sysText && !looksLikeFileName(sysText)
                ? trimExcerpt(sysText, EXCERPT_MAX_LEN)
                : '';
            return;
        }

        const rel = entry?.rel || entry?.md || '';
        if (!rel || !/\.(md|json)$/i.test(String(rel))) {
            entry.mdExcerpt = '';
            return;
        }

        try {
            const preview = await loadStreamEntryPreview(entry);
            if (!preview.ok || !preview.text?.trim()) {
                entry.mdExcerpt = '';
                return;
            }
            entry.mdExcerpt = extractReportContentExcerpt(
                preview.text,
                preview.format === 'json' ? 'json' : 'markdown',
                EXCERPT_MAX_LEN
            );
        } catch {
            entry.mdExcerpt = '';
        }
    }));
}

/**
 * @param {object} entry
 * @returns {{ heading: string, tone: string, text: string }}
 */
export function getStreamEntryDescription(entry) {
    const status = resolveEntryStreamStatus(entry);
    const meta = STREAM_STATUS_HEADING[status] || STREAM_STATUS_HEADING.INFO;
    const sys = entry?.systemEntry;

    let text = '';
    if (entry?.mdExcerpt) {
        text = entry.mdExcerpt;
    } else if (sys) {
        text = sys.description
            || sys.aiProposal?.fixSuggestion?.description
            || sys.aiProposal?.suggestion
            || sys.message
            || '';
    }

    if (!text || looksLikeFileName(text)) {
        const fallback = entry?.title || entry?.name || entry?.rel || '';
        text = looksLikeFileName(fallback) ? '' : fallback;
    }

    text = String(text).replace(/^\[Gotowe do wdrożenia\]\s*/i, '').trim();

    return {
        heading: meta.label,
        tone: meta.tone,
        text: text || STREAM_ENTRY_NO_DETAILS
    };
}

/**
 * @param {object} entry
 * @returns {boolean}
 */
export function isStreamEntryDeployReady(entry) {
    if (readAcceptedSet().has(String(entry?.streamId))) return true;
    return Boolean(entry?.systemEntry?.ownerStatus === 'ready_to_deploy'
        || entry?.systemEntry?.deployReady
        || entry?.systemEntry?.ownerStatus === 'owner_approved_fix');
}

/**
 * @param {object} entry
 * @returns {{ description?: string, suggestedCode?: string, file?: string }|null}
 */
export function getStreamEntryFixProposal(entry) {
    const sys = entry?.systemEntry;
    const candidates = [
        entry?.fixSuggestion,
        sys?.fixSuggestion,
        sys?.aiProposal?.fixSuggestion,
        entry?.aiProposal?.fixSuggestion
    ];
    for (const fix of candidates) {
        if (!fix || typeof fix !== 'object') continue;
        if (fix.description?.trim() || fix.suggestedCode?.trim()) return fix;
    }
    const directCode = sys?.aiProposal?.suggestedCode || entry?.aiProposal?.suggestedCode;
    if (directCode) {
        return { description: '', suggestedCode: String(directCode) };
    }
    return null;
}

/**
 * @param {object} entry
 * @returns {boolean}
 */
export function hasStreamEntryFixProposal(entry) {
    return Boolean(getStreamEntryFixProposal(entry));
}

/**
 * @param {object} entry
 * @returns {boolean}
 */
export function isAuditStreamEntry(entry) {
    return entry?.systemEntry?.reportTag === 'AUDIT' || entry?.reportTag === 'AUDIT';
}

/**
 * @param {object} entry
 * @param {number} [maxLen]
 * @returns {string}
 */
export function getStreamEntryFixProposalSummary(entry, maxLen = EXCERPT_MAX_LEN) {
    const fix = getStreamEntryFixProposal(entry);
    if (!fix) return '';
    const text = fix.description?.trim()
        || String(fix.suggestedCode || '').split('\n').map((l) => l.trim()).find(Boolean)
        || '';
    return trimExcerpt(text, maxLen);
}

/**
 * @param {object} entry
 * @returns {{ enabled: boolean, hint: string, title: string, hintTone: 'ok'|'warn'|'' }}
 */
export function getStreamEntryApplyMeta(entry) {
    if (isAuditStreamEntry(entry)) {
        return {
            enabled: false,
            hint: '',
            title: devVaultPl('suggestions.auditReadOnly', 'Raport audytu — podgląd tylko do odczytu'),
            hintTone: ''
        };
    }
    const enabled = canApplyStreamEntry(entry);
    const status = resolveEntryStreamStatus(entry);

    if (status === STREAM_STATUS.FAILED) {
        if (enabled && hasStreamEntryFixProposal(entry)) {
            const summary = getStreamEntryFixProposalSummary(entry);
            const prefix = devVaultPl('suggestions.proposedFixPrefix', 'Proponowana naprawa');
            return {
                enabled: true,
                hint: `${prefix}: ${summary || '—'}`,
                title: devVaultPl('suggestions.approveFixTitle', 'Zatwierdź proponowaną naprawę'),
                hintTone: 'ok'
            };
        }
        return {
            enabled: false,
            hint: FAILED_MANUAL_ANALYSIS_HINT,
            title: FAILED_MANUAL_ANALYSIS_HINT,
            hintTone: 'warn'
        };
    }

    return {
        enabled,
        hint: '',
        title: enabled
            ? devVaultPl('suggestions.applyReadyTitle', 'Zatwierdź sugestię (mitigacja runtime lub oznaczenie gotowe)')
            : (isStreamEntryDeployReady(entry)
                ? devVaultPl('suggestions.applyAlreadyReady', 'Już oznaczone jako gotowe do wdrożenia')
                : devVaultPl('suggestions.applyDisabled', 'Zmiana już wprowadzona lub niedostępna')),
        hintTone: ''
    };
}

/**
 * @param {object} entry
 * @returns {boolean}
 */
export function canApplyStreamEntry(entry) {
    if (isAuditStreamEntry(entry)) return false;
    const status = resolveEntryStreamStatus(entry);
    if (status === STREAM_STATUS.FIXED) return false;
    if (isStreamEntryDeployReady(entry)) return false;
    if (status === STREAM_STATUS.FAILED) {
        return hasStreamEntryFixProposal(entry);
    }
    return true;
}

function buildMitigationContext(systemEntry) {
    const ctx = { ...(systemEntry?.context || {}) };
    if (systemEntry?.message) ctx.message = systemEntry.message;
    if (systemEntry?.stack) ctx.stack = systemEntry.stack;
    return ctx;
}

function resolveMitigationForEntry(systemEntry) {
    const ctx = buildMitigationContext(systemEntry);
    const errorLike = {
        name: systemEntry?.context?.name || 'Error',
        message: systemEntry?.message || systemEntry?.description || ''
    };
    const fromProposal = systemEntry?.aiProposal?.expectedEffect;
    if (fromProposal && /mitigacja runtime:\s*(\S+)/i.test(fromProposal)) {
        const m = fromProposal.match(/mitigacja runtime:\s*(\S+)/i);
        if (m?.[1]) return m[1];
    }
    if (systemEntry?.mitigation?.id) return systemEntry.mitigation.id;
    return resolveSafeMitigationId(errorLike, ctx);
}

/**
 * Właściciel zatwierdza sugestię — whitelist runtime lub oznaczenie „gotowe”.
 * @param {object} entry — wpis strumienia (kind system | doc)
 */
export async function applyStreamSuggestion(entry) {
    if (!canApplyStreamEntry(entry)) {
        return { ok: false, reason: 'apply-disabled' };
    }

    if (entry.kind !== 'system' || !entry.systemEntry) {
        const accepted = readAcceptedSet();
        accepted.add(String(entry.streamId));
        writeAcceptedSet(accepted);
        return {
            ok: true,
            applied: false,
            readyToDeploy: true,
            message: devVaultPl('suggestions.docsReady', 'Oznaczono jako gotowe do wdrożenia (raport docs).')
        };
    }

    const systemEntry = entry.systemEntry;
    const mitigationId = resolveMitigationForEntry(systemEntry);
    const isFailed = resolveEntryStreamStatus(entry) === STREAM_STATUS.FAILED;

    if (mitigationId) {
        const mitResult = await applySafeMitigation(mitigationId, buildMitigationContext(systemEntry));
        if (mitResult.ok) {
            const approvedNote = isFailed && hasStreamEntryFixProposal(entry)
                ? OWNER_APPROVED_FIX_NOTE
                : null;
            updateUnifiedHealthEntry(systemEntry, {
                status: HEALING_STATUS.FIXED,
                description: approvedNote
                    ? `${approvedNote}. ${mitResult.detail || `${devVaultPl('suggestions.mitigationUsed', 'Zastosowano mitigację')}: ${mitigationId}`}`
                    : (mitResult.detail || `${devVaultPl('suggestions.mitigationUsed', 'Zastosowano mitigację')}: ${mitigationId}`),
                ownerStatus: 'applied',
                ownerNote: approvedNote || undefined,
                deployReady: false,
                ownerAcceptedAt: new Date().toISOString()
            });
            return {
                ok: true,
                applied: true,
                mitigationId,
                message: approvedNote || mitResult.detail || devVaultPl('suggestions.mitigationApplied', 'Mitigacja runtime zastosowana.')
            };
        }
    }

    if (isFailed && hasStreamEntryFixProposal(entry)) {
        const summary = getStreamEntryFixProposalSummary(entry);
        updateUnifiedHealthEntry(systemEntry, {
            ownerStatus: 'owner_approved_fix',
            deployReady: true,
            ownerAcceptedAt: new Date().toISOString(),
            ownerNote: OWNER_APPROVED_FIX_NOTE,
            description: `${OWNER_APPROVED_FIX_NOTE}${summary ? `. ${summary}` : ''}`
        });
        return {
            ok: true,
            applied: false,
            readyToDeploy: true,
            ownerApproved: true,
            message: OWNER_APPROVED_FIX_NOTE
        };
    }

    updateUnifiedHealthEntry(systemEntry, {
        ownerStatus: 'ready_to_deploy',
        deployReady: true,
        ownerAcceptedAt: new Date().toISOString(),
        description: `[Gotowe do wdrożenia] ${systemEntry.description || systemEntry.message || devVaultPl('suggestions.markedReady', 'Sugestia zaakceptowana')}`
    });

    return {
        ok: true,
        applied: false,
        readyToDeploy: true,
        message: devVaultPl('suggestions.markedReady', 'Oznaczono jako gotowe do wdrożenia.')
    };
}

/**
 * Odrzuca sugestię — usuwa z listy (persist dismiss + usuń z healingReport/log).
 * @param {object} entry
 */
export async function rejectStreamSuggestion(entry) {
    if (!entry?.streamId) return { ok: false, reason: 'missing-id' };

    const dismissed = readDismissedSet();
    dismissed.add(String(entry.streamId));
    writeDismissedSet(dismissed);

    const accepted = readAcceptedSet();
    if (accepted.has(String(entry.streamId))) {
        accepted.delete(String(entry.streamId));
        writeAcceptedSet(accepted);
    }

    if (entry.kind === 'system' && entry.systemEntry) {
        removeUnifiedHealthEntry(entry.systemEntry);
    }

    return { ok: true };
}
