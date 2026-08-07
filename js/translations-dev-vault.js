/**
 * Developer Vault – tylko język polski
 * Panel deweloperski nie korzysta z globalnego i18n aplikacji.
 */

export const DEV_VAULT_PANEL_LANG = 'pl';

/** @type {Record<string, object>} */
export const DEV_VAULT_I18N = Object.freeze({
    pl: {
        menu: { devVault: 'Panel deweloperski' },
        devVault: {
            title: 'Panel deweloperski',
            passwordPrompt: 'Wpisz hasło, aby odblokować narzędzia Dev / Health.',
            password: 'Hasło',
            unlock: 'Odblokuj',
            cancel: 'Anuluj',
            close: 'Zamknij',
            lock: 'Zablokuj',
            badPassword: 'Nieprawidłowe hasło',
            unlocked: 'Odblokowano na tę sesję przeglądarki.',
            unlockedToast: 'Panel odblokowany',
            locked: 'Panel zablokowany',
            loading: 'Ładowanie…',
            healthEmpty: 'Brak raportu Health. Kliknij „Odśwież Health”.',
            healthTitle: 'Zdrowie aplikacji',
            healthRefresh: 'Odśwież Health',
            healthOpen: 'Pełny panel Health',
            reportMissing: 'Brak lokalnego raportu. Uruchom CLI (npm run future / dream / brain), potem odśwież.',
            devHint: 'Narzędzia deweloperskie (dashboard).',
            openDev: 'Otwórz Dev',
            tabDev: 'Dev',
            tabHealth: 'Health',
            tabReports: 'Raporty',
            reportsHint: 'Lista raportów błędów i napraw.',
            reportGuardian: 'Błędy i alerty straży kodu',
            reportDream: 'Refleksja / snapy produktu',
            reportBrain: 'Propozycje napraw i usprawnień',
            openReport: 'Otwórz',
            clearReports: '🧹 Wyczyść stare raporty',
            clearReportsConfirm: 'Czy na pewno chcesz usunąć wszystkie raporty?',
            clearReportsDone: '🧹 Wszystkie raporty zostały wyczyszczone.',
            clearReportsFail: 'Nie udało się wyczyścić raportów.',
            runSweep: '🧠 Inteligentna Diagnoza',
            sweepRunning: 'Uruchamianie inteligentnej diagnozy...',
            sweepDone: 'Diagnoza zakończona.',
            sweepFail: 'Nie udało się uruchomić diagnozy.',
            prodOnly: 'Dostępne tylko lokalnie lub z ?dev=1.',
            panelTitle: 'Panel deweloperski',
            panelAria: 'Panel deweloperski',
            panelSubtitle: 'Wersja {version} · Panel deweloperski · Status i raporty',
            statusHint: 'Kluczowe metryki aplikacji — tylko odczyt, bez auto-napraw.',
            previewTitle: 'Podgląd raportu',
            systemHealth: 'Zdrowie systemu',
            errorFeed: 'Strumień błędów runtime',
            refreshDashboard: 'Odśwież pulpit',
            copyReport: 'Kopiuj raport',
            deleteReport: 'Usuń raport',
            applyChange: 'Wprowadź zmianę',
            rejectChange: 'Odrzuć zmianę',
            deployReady: 'Gotowe do wdrożenia',
            reportCategory: 'Kategoria',
            reportStatus: 'Status raportu',
            showRelevantOnly: 'Pokaż tylko istotne',
            showAll: 'Pokaż wszystko',
            noReports: 'Brak raportów do wyświetlenia.',
            noRelevantReports: 'Brak istotnych raportów — włącz „Pokaż wszystko”, aby zobaczyć wpisy techniczne.',
            filterAll: 'Pełna lista ({count} wpisów).',
            filterVisible: 'Widoczne: {visible} wpisów (FIXED · SUGGESTION · INFO · FAILED).',
            filterHidden: 'Widoczne: {visible} z {total} (ukryto {hidden} wpisów technicznych).',
            reportsHintLong: 'Tylko istotne statusy: naprawione, sugestie, info UI/UX i błędy. Auto-czyszczenie wpisów starszych niż 30 dni.',
            sweepDoneCount: 'Diagnoza zakończona ({ok}/{total} OK).',
            sweepSaveFail: 'Nie udało się zapisać raportu audytu.',
            lockReset: 'Blokada dostępu zresetowana',
            reportNotFound: 'Nie znaleziono wpisu raportu',
            reportDeleted: 'Raport usunięty',
            reportDeleteFail: 'Nie usunięto',
            changeApplied: 'Zmiana wprowadzona',
            readyToDeploy: 'Gotowe do wdrożenia',
            applyFail: 'Nie udało się zatwierdzić sugestii',
            rejectDone: 'Sugestia odrzucona',
            rejectFail: 'Nie udało się odrzucić',
            errorFeedFail: 'Nie udało się otworzyć strumienia błędów',
            deleteConfirm: 'Usunąć raport?',
            openErrorFeedTitle: 'Otwórz strumień błędów runtime'
        },
        suggestions: {
            fixedHeading: 'Co zostało naprawione',
            suggestionHeading: 'Co sugeruję do poprawy',
            failedHeading: 'Co jest problemem',
            infoHeading: 'Co proponuję zmienić',
            noDetails: 'Brak szczegółów dla tej sugestii.',
            manualAnalysis: 'Wymaga ręcznej analizy kodu',
            ownerApproved: 'Naprawa zatwierdzona przez użytkownika',
            proposedFixPrefix: 'Proponowana naprawa',
            approveFixTitle: 'Zatwierdź proponowaną naprawę',
            auditReadOnly: 'Raport audytu — podgląd tylko do odczytu',
            applyReadyTitle: 'Zatwierdź sugestię (mitigacja runtime lub oznaczenie gotowe)',
            applyAlreadyReady: 'Już oznaczone jako gotowe do wdrożenia',
            applyDisabled: 'Zmiana już wprowadzona lub niedostępna',
            docsReady: 'Oznaczono jako gotowe do wdrożenia (raport docs).',
            markedReady: 'Oznaczono jako gotowe do wdrożenia.',
            mitigationApplied: 'Mitigacja runtime zastosowana.',
            mitigationUsed: 'Zastosowano mitigację'
        },
        statusLabels: {
            FIXED: 'Naprawione',
            SUGGESTION: 'Sugestia',
            FAILED: 'Błąd',
            INFO: 'Info'
        },
        metrics: {
            Overall: 'Ogółem',
            Health: 'Zdrowie',
            Performance: 'Wydajność',
            Brand: 'Marka',
            PWA: 'PWA',
            Offline: 'Offline',
            GPS: 'GPS',
            Mapa: 'Mapa',
            UI: 'UI',
            Accessibility: 'Dostępność',
            Security: 'Bezpieczeństwo',
            Console: 'Konsola',
            Warnings: 'Ostrzeżenia',
            Reports: 'Raporty',
            Storage: 'Pamięć',
            Release: 'Wydanie',
            releaseReady: 'GOTOWE',
            releaseNotReady: 'NIE GOTOWE',
            consoleError: '1 błąd',
            consoleErrors: '{n} błędów'
        }
    }
});

/**
 * @param {string} path — np. devVault.title lub suggestions.noDetails
 * @param {string} [fallback]
 * @returns {string}
 */
export function devVaultPl(path, fallback = '') {
    const parts = String(path || '').split('.').filter(Boolean);
    let node = DEV_VAULT_I18N[DEV_VAULT_PANEL_LANG];
    for (const part of parts) {
        node = node?.[part];
    }
    if (node === undefined || node === null || typeof node === 'object') {
        return fallback;
    }
    const text = String(node).trim();
    return text || fallback;
}

/** @type {Record<string, string>} */
export const DEV_VAULT_STATUS_LABELS = Object.freeze({ ...DEV_VAULT_I18N.pl.statusLabels });

/** @type {Record<string, string>} */
export const DEV_VAULT_METRIC_LABELS = Object.freeze({ ...DEV_VAULT_I18N.pl.metrics });
