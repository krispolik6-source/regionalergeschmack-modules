/** Tłumaczenia raportu System Health (☰ → Über die App → Systemstatus) */

/** @type {Record<string, Record<string, string>>} */
export const SYSTEM_HEALTH_I18N = Object.freeze({
    de: {
        title: 'Systemstatus',
        lead: 'Automatische Stabilitätsprotokolle dieser Sitzung. Keine AI-Oberfläche — nur Fakten.',
        empty: 'Keine Einträge — alles stabil.',
        summaryTitle: 'Tageszusammenfassung',
        openFromAbout: 'Systemstatus anzeigen',
        statusFixed: 'Behoben',
        statusSuggestion: 'Hinweis',
        statusFailed: 'Manuell prüfen',
        colStatus: 'Status',
        colComponent: 'Komponente',
        colDescription: 'Beschreibung',
        colTime: 'Zeit',
        counts: '{fixed} behoben · {suggestion} Hinweise · {failed} offen'
    },
    en: {
        title: 'System status',
        lead: 'Automatic stability logs for this session. No AI chat — facts only.',
        empty: 'No entries — all stable.',
        summaryTitle: 'Daily summary',
        openFromAbout: 'View system status',
        statusFixed: 'Fixed',
        statusSuggestion: 'Suggestion',
        statusFailed: 'Needs review',
        colStatus: 'Status',
        colComponent: 'Component',
        colDescription: 'Description',
        colTime: 'Time',
        counts: '{fixed} fixed · {suggestion} hints · {failed} open'
    },
    pl: {
        title: 'Status systemu',
        lead: 'Automatyczne logi stabilności tej sesji. Bez rozmowy z AI — same fakty.',
        empty: 'Brak wpisów — wszystko stabilne.',
        summaryTitle: 'Podsumowanie dnia',
        openFromAbout: 'Pokaż status systemu',
        statusFixed: 'Naprawiono',
        statusSuggestion: 'Sugestia',
        statusFailed: 'Wymaga ręcznej weryfikacji',
        colStatus: 'Status',
        colComponent: 'Komponent',
        colDescription: 'Opis',
        colTime: 'Czas',
        counts: '{fixed} napraw · {suggestion} sugestii · {failed} otwartych'
    }
});
