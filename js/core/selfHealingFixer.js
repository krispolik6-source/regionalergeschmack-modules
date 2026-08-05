/**
 * Self-Healing Fixer — wyłącznie bezpieczne mitigacje RUNTIME (stan / retry).
 *
 * Polityka (zgodna z js/intelligence/policy.js):
 *  - autoModifyCode: false — brak eval / brak wstrzykiwania kodu z AI
 *  - mutatesHtml: false · mutatesUserData: false
 *  - Dozwolone: reset flag, zamknięcie modala, trim cache, jednorazowy retry fetch
 */

import { cleanSafeData } from '../diagnostics/memoryCleaner.js';
import { ensureNavigationHealed } from '../controllers/navigation.js';

/** @type {Map<string, { apply: (ctx: object) => Promise<{ ok: boolean, detail?: string }>, label: string }>} */
const SAFE_MITIGATIONS = new Map([
    ['quota-trim', {
        label: 'Trim bezpiecznych danych cache (QuotaExceeded)',
        apply: async () => {
            try {
                const result = await cleanSafeData();
                return { ok: Boolean(result?.ok ?? result), detail: 'cleanSafeData' };
            } catch (error) {
                return { ok: false, detail: String(error?.message || error) };
            }
        }
    }],
    ['modal-force-close', {
        label: 'Wymuś zamknięcie modala producenta',
        apply: async () => {
            try {
                const mod = await import('../views/producerModal.js');
                mod.closeProducerModal?.({ force: true });
                mod.resetProducerModalOpeningState?.();
                return { ok: true, detail: 'closeProducerModal(force)' };
            } catch (error) {
                return { ok: false, detail: String(error?.message || error) };
            }
        }
    }],
    ['modal-reset-opening', {
        label: 'Reset flagi isOpening modala',
        apply: async () => {
            try {
                const mod = await import('../views/producerModal.js');
                mod.resetProducerModalOpeningState?.();
                return { ok: true, detail: 'resetProducerModalOpeningState' };
            } catch (error) {
                return { ok: false, detail: String(error?.message || error) };
            }
        }
    }],
    ['navigation-rebind', {
        label: 'Ponowne podpięcie nawigacji',
        apply: async () => {
            try {
                ensureNavigationHealed();
                return { ok: true, detail: 'ensureNavigationHealed' };
            } catch (error) {
                return { ok: false, detail: String(error?.message || error) };
            }
        }
    }],
    ['fetch-retry-once', {
        label: 'Jednorazowy retry krytycznego fetch',
        apply: async (ctx) => {
            const url = String(ctx?.url || '').trim();
            if (!url || ctx?._retried) return { ok: false, detail: 'no-url-or-already-retried' };
            try {
                const res = await fetch(url, { ...(ctx.fetchInit || {}), cache: 'no-store' });
                return { ok: res.ok, detail: `retry status ${res.status}` };
            } catch (error) {
                return { ok: false, detail: String(error?.message || error) };
            }
        }
    }]
]);

/**
 * Mapuje błąd + kontekst na ID bezpiecznej mitigacji (bez AI).
 * @param {Error|unknown} error
 * @param {object} context
 * @returns {string|null}
 */
export function resolveSafeMitigationId(error, context = {}) {
    const name = String(error?.name || '');
    const message = String(error?.message || error || '').toLowerCase();
    const ctxType = String(context?.type || '');

    if (name === 'QuotaExceededError' || /quota/i.test(message)) {
        return 'quota-trim';
    }

    if (ctxType === 'fetch' && context.url && !context._retried) {
        return 'fetch-retry-once';
    }

    if (/producerModal|openProducerModal|isOpening|modal/i.test(message)
        || context?.area === 'producerModal') {
        return 'modal-reset-opening';
    }

    if (/navigation|navigateTo|viewRenderers/i.test(message)) {
        return 'navigation-rebind';
    }

    if (context?.source === 'window.error' && /modal|producer/i.test(message)) {
        return 'modal-force-close';
    }

    return null;
}

/**
 * Stosuje wyłącznie whitelistowaną mitigację runtime.
 * @param {string} mitigationId
 * @param {object} [context]
 * @returns {Promise<{ ok: boolean, id: string, detail?: string }>}
 */
export async function applySafeMitigation(mitigationId, context = {}) {
    const entry = SAFE_MITIGATIONS.get(String(mitigationId || ''));
    if (!entry) {
        return { ok: false, id: String(mitigationId || ''), detail: 'unknown-mitigation' };
    }
    try {
        const result = await entry.apply(context);
        return { ok: Boolean(result?.ok), id: mitigationId, detail: result?.detail || entry.label };
    } catch (error) {
        return { ok: false, id: mitigationId, detail: String(error?.message || error) };
    }
}

export function listSafeMitigations() {
    return [...SAFE_MITIGATIONS.keys()];
}

export default {
    resolveSafeMitigationId,
    applySafeMitigation,
    listSafeMitigations
};
