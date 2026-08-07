/**
 * Interaktywne zarządzanie sugestiami w Developer Vault (tylko właściciel, PIN).
 * autoApply=false globalnie — apply wyłącznie po kliknięciu w panelu.
 */

import {
    normalizeStreamStatus,
    STREAM_STATUS
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

export const DEV_VAULT_DISMISSED_KEY = 'devVault_dismissedStreamIds';
export const DEV_VAULT_ACCEPTED_KEY = 'devVault_acceptedStreamIds';

/** Nagłówki opisów wg statusu (kolor w CSS panelu). */
export const STREAM_STATUS_HEADING = Object.freeze({
    FIXED: { label: 'Co zostało naprawione', tone: 'fixed' },
    SUGGESTION: { label: 'Co sugeruję do poprawy', tone: 'suggestion' },
    FAILED: { label: 'Co jest problemem', tone: 'failed' },
    INFO: { label: 'Co proponuję zmienić', tone: 'info' }
});

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

/**
 * @param {object} entry
 * @returns {{ heading: string, tone: string, text: string }}
 */
export function getStreamEntryDescription(entry) {
    const status = resolveEntryStreamStatus(entry);
    const meta = STREAM_STATUS_HEADING[status] || STREAM_STATUS_HEADING.INFO;
    const sys = entry?.systemEntry;

    let text = '';
    if (sys) {
        text = sys.description
            || sys.aiProposal?.fixSuggestion?.description
            || sys.aiProposal?.suggestion
            || sys.message
            || '';
    }
    if (!text) {
        text = entry?.title || entry?.name || entry?.rel || '';
    }
    text = String(text).replace(/^\[Gotowe do wdrożenia\]\s*/i, '').trim();

    return {
        heading: meta.label,
        tone: meta.tone,
        text: text || '—'
    };
}

/**
 * @param {object} entry
 * @returns {boolean}
 */
export function isStreamEntryDeployReady(entry) {
    if (readAcceptedSet().has(String(entry?.streamId))) return true;
    return Boolean(entry?.systemEntry?.ownerStatus === 'ready_to_deploy'
        || entry?.systemEntry?.deployReady);
}

/**
 * @param {object} entry
 * @returns {boolean}
 */
export function canApplyStreamEntry(entry) {
    const status = resolveEntryStreamStatus(entry);
    if (status === STREAM_STATUS.FAILED) return false;
    if (status === STREAM_STATUS.FIXED) return false;
    if (isStreamEntryDeployReady(entry)) return false;
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
            message: 'Oznaczono jako gotowe do wdrożenia (raport docs).'
        };
    }

    const systemEntry = entry.systemEntry;
    const mitigationId = resolveMitigationForEntry(systemEntry);

    if (mitigationId) {
        const mitResult = await applySafeMitigation(mitigationId, buildMitigationContext(systemEntry));
        if (mitResult.ok) {
            updateUnifiedHealthEntry(systemEntry, {
                status: HEALING_STATUS.FIXED,
                description: mitResult.detail || `Zastosowano mitigację: ${mitigationId}`,
                ownerStatus: 'applied',
                deployReady: false,
                ownerAcceptedAt: new Date().toISOString()
            });
            return {
                ok: true,
                applied: true,
                mitigationId,
                message: mitResult.detail || 'Mitigacja runtime zastosowana.'
            };
        }
    }

    updateUnifiedHealthEntry(systemEntry, {
        ownerStatus: 'ready_to_deploy',
        deployReady: true,
        ownerAcceptedAt: new Date().toISOString(),
        description: `[Gotowe do wdrożenia] ${systemEntry.description || systemEntry.message || 'Sugestia zaakceptowana'}`
    });

    return {
        ok: true,
        applied: false,
        readyToDeploy: true,
        message: 'Oznaczono jako gotowe do wdrożenia.'
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
