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

/** @typedef {{ file: string, line: number|null, description: string, suggestedCode: string }} FixSuggestion */

/** Wzorce heurystyczne — advisory only, bez autoApply. */
const FIX_SUGGESTION_RULES = [
    {
        test: (log) => /quota|QuotaExceeded/i.test(String(log?.message || log?.name || '')),
        suggest: () => ({
            file: 'js/core/safeStorage.js',
            line: null,
            description: 'Przekroczono limit localStorage — wymagane bezpieczne czyszczenie cache danych.',
            suggestedCode: 'import { cleanSafeData } from \'./diagnostics/memoryCleaner.js\';\nawait cleanSafeData();'
        })
    },
    {
        test: (log) => /producerModal|isOpening|openProducerModal|modal freeze/i.test(String(log?.message || ''))
            || log?.context?.area === 'producerModal',
        suggest: (log) => {
            const loc = parseStackLocation(log);
            return {
                file: loc.file.includes('.js') ? loc.file : 'js/views/producerModal.js',
                line: loc.line,
                description: 'Modal producenta zablokowany (podwójne otwarcie lub freeze) — zresetuj flagę otwierania.',
                suggestedCode: 'import { resetProducerModalOpeningState } from \'./views/producerModal.js\';\nresetProducerModalOpeningState();\n// render treści w requestAnimationFrame, limit produktów w UI'
            };
        }
    },
    {
        test: (log) => log?.context?.type === 'fetch' && /overpass|nominatim|dataService/i.test(String(log?.context?.url || '')),
        suggest: (log) => ({
            file: 'js/data/osmService.js',
            line: null,
            description: `Błąd API mapy (HTTP ${log?.context?.status ?? 'sieć'}) — dodaj retry lub fallback na cache.`,
            suggestedCode: 'const res = await fetch(url, { cache: \'no-store\' });\nif (!res.ok) {\n  // użyj loadAllData cache / pokaż map.dataCached\n}'
        })
    },
    {
        test: (log) => /navigation|navigateTo|viewRenderers|bindNavButtons/i.test(String(log?.message || '')),
        suggest: () => ({
            file: 'js/controllers/navigation.js',
            line: null,
            description: 'Problem z nawigacją — ponowne podpięcie handlerów widoków.',
            suggestedCode: 'import { ensureNavigationHealed } from \'./controllers/navigation.js\';\nensureNavigationHealed();'
        })
    },
    {
        test: (log) => /searchGlobalResults|filterProducers|SEARCH_RESULTS|searchFilter/i.test(String(log?.message || log?.stack || '')),
        suggest: () => ({
            file: 'js/presentation/searchFilter.js',
            line: 178,
            description: 'Wyszukiwanie zwraca zbyt wiele wyników lub obciąża UI — ogranicz liczbę wyświetlanych trafień.',
            suggestedCode: 'export const SEARCH_RESULTS_LIMIT = 20;\n// limitSearchDisplayItems(items, SEARCH_RESULTS_LIMIT)'
        })
    },
    {
        test: (log) => /leaflet|L\.map|replaceMarkers|tile/i.test(String(log?.message || '')),
        suggest: () => ({
            file: 'js/views/map.js',
            line: null,
            description: 'Problem warstwy mapy Leaflet — sprawdź reinicjalizację kafelków lub markerów.',
            suggestedCode: '// initMapGuardian / replaceMarkers po błędzie tiles\nif (mapInstance) mapInstance.invalidateSize();'
        })
    }
];

/**
 * Wyciąga plik i linię ze stack trace lub kontekstu.
 * @param {object} errorLog
 * @returns {{ file: string, line: number|null }}
 */
function parseStackLocation(errorLog) {
    const context = errorLog?.context || {};
    if (context.filename) {
        const file = String(context.filename).split(/[/\\]/).pop();
        const line = Number(context.lineno);
        return { file, line: Number.isFinite(line) ? line : null };
    }

    const stack = String(errorLog?.stack || '');
    const appFrame = stack.match(/(?:at\s+[^\n(]*\()?([/\w.-]+\.js):(\d+)(?::\d+)?\)?/g);
    if (appFrame) {
        for (const frame of appFrame) {
            const m = frame.match(/([/\w.-]+\.js):(\d+)/);
            if (!m) continue;
            const file = m[1].split('/').pop();
            if (file && !/node_modules|chrome-extension/.test(m[1])) {
                return { file, line: parseInt(m[2], 10) || null };
            }
        }
    }

    const simple = stack.match(/([\w./-]+\.js):(\d+)/);
    if (simple) {
        return {
            file: simple[1].split('/').pop(),
            line: parseInt(simple[2], 10) || null
        };
    }

    return { file: 'runtime', line: null };
}

/**
 * Generuje konkretną sugestię naprawy na podstawie logu błędu (heurystyka, bez eval).
 * @param {object} errorLog — wpis selfHealingLog lub { message, stack, context, name }
 * @returns {FixSuggestion|null}
 */
export function generateFixSuggestion(errorLog) {
    if (!errorLog || typeof errorLog !== 'object') return null;

    if (errorLog.mitigation?.applied || errorLog.type === 'error-fixed') {
        return null;
    }

    for (const rule of FIX_SUGGESTION_RULES) {
        try {
            if (rule.test(errorLog)) {
                const suggestion = rule.suggest(errorLog);
                if (suggestion?.file && suggestion?.description) {
                    return {
                        file: String(suggestion.file),
                        line: suggestion.line ?? null,
                        description: String(suggestion.description),
                        suggestedCode: String(suggestion.suggestedCode || '')
                    };
                }
            }
        } catch {
            /* ignore rule errors */
        }
    }

    const loc = parseStackLocation(errorLog);
    const message = String(errorLog.message || errorLog.name || 'nieznany błąd');
    return {
        file: loc.file,
        line: loc.line,
        description: `Krytyczny błąd: ${message}. Sprawdź wskazany plik i kontekst w panelu System Health.`,
        suggestedCode: loc.line
            ? `// ${loc.file}:${loc.line}\n// ${message}`
            : `// ${loc.file}\n// ${message}`
    };
}

/**
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
    listSafeMitigations,
    generateFixSuggestion,
    parseStackLocation
};
