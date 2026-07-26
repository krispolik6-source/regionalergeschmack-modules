/**
 * Ukryty panel deweloperski – i18n
 */

/** @type {Record<string, object>} */
export const DEV_VAULT_I18N = Object.freeze({
    de: {
        menu: { devVault: 'Entwicklerpanel' },
        devVault: {
            title: 'Entwicklerpanel',
            passwordPrompt: 'Passwort eingeben, um Dev / Health freizuschalten.',
            password: 'Passwort',
            unlock: 'Entsperren',
            cancel: 'Abbrechen',
            close: 'Schließen',
            lock: 'Sperren',
            badPassword: 'Falsches Passwort',
            unlocked: 'Für diese Sitzung freigeschaltet.',
            unlockedToast: 'Panel freigeschaltet',
            locked: 'Panel gesperrt',
            loading: 'Laden…',
            healthEmpty: 'Kein Health-Bericht. „Health aktualisieren” tippen.',
            healthTitle: 'Anwendungsgesundheit',
            healthRefresh: 'Health aktualisieren',
            healthOpen: 'Vollständiges Health-Panel',
            reportMissing: 'Kein lokaler Bericht. CLI ausführen (npm run future / dream / brain), dann aktualisieren.',
            devHint: 'Entwicklerwerkzeuge (Dashboard).',
            openDev: 'Dev öffnen',
            tabDev: 'Dev',
            tabHealth: 'Health',
            tabReports: 'Berichte',
            reportsHint: 'Liste der Fehler- und Reparaturberichte.',
            reportGuardian: 'Fehler und Code-Alerts',
            reportDream: 'Produktreflexion / Snapshots',
            reportBrain: 'Vorschläge für Fixes und Verbesserungen',
            openReport: 'Öffnen'
        }
    },
    en: {
        menu: { devVault: 'Developer panel' },
        devVault: {
            title: 'Developer panel',
            passwordPrompt: 'Enter the password to unlock Dev / Health tools.',
            password: 'Password',
            unlock: 'Unlock',
            cancel: 'Cancel',
            close: 'Close',
            lock: 'Lock',
            badPassword: 'Incorrect password',
            unlocked: 'Unlocked for this browser session.',
            unlockedToast: 'Panel unlocked',
            locked: 'Panel locked',
            loading: 'Loading…',
            healthEmpty: 'No Health report. Tap “Refresh Health”.',
            healthTitle: 'Application health',
            healthRefresh: 'Refresh Health',
            healthOpen: 'Full Health panel',
            reportMissing: 'No local report. Run CLI (npm run future / dream / brain), then refresh.',
            devHint: 'Developer tools (dashboard).',
            openDev: 'Open Dev',
            tabDev: 'Dev',
            tabHealth: 'Health',
            tabReports: 'Reports',
            reportsHint: 'List of error and fix reports.',
            reportGuardian: 'Errors and code alerts',
            reportDream: 'Product reflection / snapshots',
            reportBrain: 'Fix and improvement proposals',
            openReport: 'Open'
        }
    },
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
            openReport: 'Otwórz'
        }
    }
});
