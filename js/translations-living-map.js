/**
 * ETAP 15C – Żywa mapa (delikatne wskazówki na markerach)
 * DE/EN/PL/MK + EN fallback
 */

/** @type {Record<string, object>} */
export const LIVING_MAP_I18N = Object.freeze({
    de: {
        livingMap: {
            closingSoon: 'Schließt in etwa einer Stunde',
            justOpened: 'Gerade geöffnet',
            freshOpen: 'Frisch geöffnet',
            recommended: 'Heute empfohlen',
            popular: 'Heute beliebt',
            freshDelivery: 'Frische Lieferung'
        }
    },
    en: {
        livingMap: {
            closingSoon: 'Closing in about an hour',
            justOpened: 'Just opened',
            freshOpen: 'Freshly open',
            recommended: 'Recommended today',
            popular: 'Popular today',
            freshDelivery: 'Fresh delivery'
        }
    },
    pl: {
        livingMap: {
            closingSoon: 'Zamyka za około godzinę',
            justOpened: 'Producent właśnie otworzył',
            freshOpen: 'Świeżo otwarte',
            recommended: 'Dziś polecane',
            popular: 'Dziś popularne',
            freshDelivery: 'Świeża dostawa'
        }
    },
    mk: {
        livingMap: {
            closingSoon: 'Затвора за околу еден час',
            justOpened: 'Штотуку отвори',
            freshOpen: 'Свежо отворено',
            recommended: 'Денес препорачано',
            popular: 'Денес популарно',
            freshDelivery: 'Свежа достава'
        }
    }
});
