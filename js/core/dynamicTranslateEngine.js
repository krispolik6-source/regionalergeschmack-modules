/**
 * Kompatybilność wsteczna — kanoniczny silnik:
 * js/i18n/aiTranslationEngine.js
 */
export {
    translate as translateDynamic,
    translateSoft as translateDynamicSoft,
    translateBatch,
    translateProduct,
    translatePage,
    invalidateCache as clearDynamicTranslateCache,
    getCachedTranslation,
    getAiTranslateStats as getDynamicTranslateStats,
    initAiTranslationEngine as initDynamicTranslate,
    resolveTargetLanguage,
    AI_TRANSLATE_CONFIG as DYNAMIC_TRANSLATE_CONFIG
} from '../i18n/aiTranslationEngine.js';

import { translateSoft } from '../i18n/aiTranslationEngine.js';

/** @deprecated użyj translateBatch / map + translateSoft */
export function translateManySoft(texts, opts = {}) {
    return (texts || []).map((t) => translateSoft(t, opts));
}

export { default } from '../i18n/aiTranslationEngine.js';
