/**
 * ETAP 33F — wspólna polityka modułów inteligencji
 * (obowiązuje od 33E wzwyż dla całego folderu js/intelligence/)
 *
 * Inteligentna · dyskretna · bez wrażenia rozmowy z AI · bez auto-zmian.
 * Decyzje tylko w raportach dla właściciela.
 */

/** @typedef {Readonly<{
 *   autoApply: false,
 *   autoFix: false,
 *   autoModifyCode: false,
 *   advisoryOnly: true,
 *   requiresOwnerAcceptance: true,
 *   chatbot: false,
 *   aiAssistant: false,
 *   conversationUi: false,
 *   popups: false,
 *   aiWindow: false,
 *   userFacingAi: false,
 *   uiChanges: false,
 *   replacesSimpleUi: false,
 *   networkRequired: false,
 *   mutatesProducerData: false,
 *   mutatesAppCode: false,
 *   reportToOwner: true,
 *   priority: readonly string[],
 *   proposalTest: string,
 *   tone: string,
 *   roleFamily: string
 * }>} IntelligencePolicyBase */

/** @type {IntelligencePolicyBase} */
export const INTELLIGENCE_POLICY = Object.freeze({
    autoApply: false,
    autoFix: false,
    autoModifyCode: false,
    advisoryOnly: true,
    requiresOwnerAcceptance: true,

    /** Nigdy wrażenie rozmowy z AI */
    chatbot: false,
    aiAssistant: false,
    conversationUi: false,
    popups: false,
    aiWindow: false,
    userFacingAi: false,

    /** AI nie zastępuje prostego UI i nie zmienia wyglądu „przy okazji” */
    uiChanges: false,
    replacesSimpleUi: false,

    /** Pomaga / przewiduje / doradza — bez mutacji */
    networkRequired: false,
    mutatesProducerData: false,
    mutatesAppCode: false,

    /** Wszystkie decyzje → raport właściciela */
    reportToOwner: true,

    /** Priorytet produktu */
    priority: Object.freeze([
        'simplicity',
        'speed',
        'regional-climate',
        'user-value'
    ]),

    /** Każda propozycja musi zwiększać wartość, nie liczbę funkcji */
    proposalTest: 'increases-value-not-feature-count',

    tone: 'discreet-regional-host',
    roleFamily: 'intelligence'
});

export const INTELLIGENCE_PRINCIPLES = Object.freeze([
    'Aplikacja ma być inteligentna, ale dyskretna.',
    'Użytkownik nie może mieć wrażenia rozmowy z AI.',
    'AI nigdy nie zastępuje prostego interfejsu.',
    'AI ma pomagać, przewidywać i doradzać.',
    'AI nie wykonuje automatycznych zmian w kodzie ani danych.',
    'Wszystkie decyzje są raportowane właścicielowi.',
    'Priorytetem jest prostota, szybkość i klimat regionalnego produktu.',
    'Każda nowa propozycja musi zwiększać wartość aplikacji, a nie liczbę funkcji.'
]);

/**
 * Polityka modułu = baza + pola roli (rola nie może złamać twardych zakazów).
 * @param {Record<string, unknown>} extras
 */
export function createModulePolicy(extras = {}) {
    const merged = {
        ...INTELLIGENCE_POLICY,
        ...extras,
        // twarde zamki — nie do nadpisania
        autoApply: false,
        autoFix: false,
        autoModifyCode: false,
        advisoryOnly: true,
        requiresOwnerAcceptance: true,
        chatbot: false,
        aiAssistant: false,
        conversationUi: false,
        popups: false,
        aiWindow: false,
        userFacingAi: false,
        uiChanges: false,
        replacesSimpleUi: false,
        mutatesProducerData: false,
        mutatesAppCode: false,
        reportToOwner: true,
        roleFamily: 'intelligence'
    };
    return Object.freeze(merged);
}

/**
 * Czy propozycja przechodzi test wartości (heurystyka tekstowa).
 * @param {{ title?: string, expectedEffect?: string, why?: string, addsFeature?: boolean }} proposal
 */
export function passesValueNotFeatureTest(proposal = {}) {
    if (proposal.addsFeature === true) return false;
    const blob = `${proposal.title || ''} ${proposal.expectedEffect || ''} ${proposal.why || ''}`.toLowerCase();
    const featureBloat = [
        'nowy ekran',
        'new screen',
        'chatbot',
        'asystent ai',
        'ai assistant',
        'kolejny moduł diagnost',
        'nowe okno',
        'popup ai'
    ];
    if (featureBloat.some((k) => blob.includes(k))) return false;
    return true;
}

export default {
    INTELLIGENCE_POLICY,
    INTELLIGENCE_PRINCIPLES,
    createModulePolicy,
    passesValueNotFeatureTest
};
