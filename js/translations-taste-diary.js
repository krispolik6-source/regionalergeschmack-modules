/**
 * Taste Diary – i18n (DE / EN / PL + EN fallback)
 */

/** @type {Record<string, object>} */
export const TASTE_DIARY_I18N = Object.freeze({
    de: {
        tasteDiary: {
            add: 'Zum Tagebuch hinzufügen',
            title: 'Geschmackstagebuch',
            productName: 'Produktname',
            rating: 'Bewertung',
            note: 'Notiz',
            photo: 'Foto (optional)',
            save: 'Speichern',
            cancel: 'Abbrechen',
            saved: 'Zum Tagebuch hinzugefügt!',
            deleted: 'Eintrag gelöscht',
            empty: 'Keine Einträge. Füge deinen ersten Geschmack hinzu!',
            emptyHint: 'Öffne einen Produzenten und tippe auf „Zum Tagebuch hinzufügen”.',
            delete: 'Löschen',
            error: 'Speichern fehlgeschlagen',
            imageTooLarge: 'Foto zu groß – bitte kleineres Bild wählen',
            required: 'Bitte Produktname und Bewertung ausfüllen'
        }
    },
    en: {
        tasteDiary: {
            add: 'Add to Diary',
            title: 'Taste Diary',
            productName: 'Product name',
            rating: 'Rating',
            note: 'Note',
            photo: 'Photo (optional)',
            save: 'Save',
            cancel: 'Cancel',
            saved: 'Added to Taste Diary!',
            deleted: 'Entry deleted',
            empty: 'No entries. Add your first taste!',
            emptyHint: 'Open a producer and tap “Add to Diary”.',
            delete: 'Delete',
            error: 'Could not save',
            imageTooLarge: 'Photo too large – please choose a smaller image',
            required: 'Please enter a product name and rating'
        }
    },
    pl: {
        tasteDiary: {
            add: 'Dodaj do Pamiętnika',
            title: 'Pamiętnik smaków',
            productName: 'Nazwa produktu',
            rating: 'Ocena',
            note: 'Notatka',
            photo: 'Zdjęcie (opcjonalnie)',
            save: 'Zapisz',
            cancel: 'Anuluj',
            saved: 'Dodano do Pamiętnika!',
            deleted: 'Wpis usunięty',
            empty: 'Brak wpisów. Dodaj swój pierwszy smak!',
            emptyHint: 'Otwórz producenta i wybierz „Dodaj do Pamiętnika”.',
            delete: 'Usuń',
            error: 'Nie udało się zapisać',
            imageTooLarge: 'Zdjęcie za duże – wybierz mniejsze',
            required: 'Podaj nazwę produktu i ocenę'
        }
    }
});
