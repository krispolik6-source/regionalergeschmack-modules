# Naprawa: popup producenta przy przesuwaniu mapy

**Data:** 2026-08-02  
**Status:** NAPRAWIONE

---

## Problem

Po otwarciu popupu użytkownik przesuwał mapę, aby zobaczyć dolną część karty (np. „Szczegóły”). Popup **zamykał się natychmiast** po rozpoczęciu panu.

---

## Kto zamykał popup i dlaczego

| Źródło | Mechanizm | Ocena |
|--------|-----------|-------|
| **MarkerCluster `removeOutsideVisibleBounds: true` (domyślne)** | Przy panie markery poza viewport były usuwane z warstwy → Leaflet zamykał popup | **Główna przyczyna** |
| **`popupclose` bez recovery** | Zamknięcie traktowane jako finalne — brak ponownego `openPopup()` | **Wtórna przyczyna** |
| **`refreshMapMarkers` + `allowReopen: false`** | Po sync markerów popup nie był przywracany | **Przy odświeżeniu warstwy** |
| **`closePopup()` jawnie** | Tylko filtr wykluczający producenta / modal „Szczegóły” | **Zamierzone** |
| **`moveend` / `dragstart`** | Nie wołały `closePopup()` — OK | ✓ |
| **`fitBounds` / `invalidateSize`** | Pomijane przy otwartym popupie — OK | ✓ |
| **`clearLayers`** | Tylko `resetMarkersLayer()` przy destroy mapy | ✓ |

---

## Wdrożone rozwiązanie

### 1. `js/map/map.js`
- `removeOutsideVisibleBounds: false` — markery nie znikają przy panie
- `autoClose: false` na `bindPopup` — brak auto-zamknięcia

### 2. `js/views/map.js`
- **`pinnedPopupProducerId`** — aktywny producent z otwartym popupem
- **`schedulePinnedPopupRecovery()`** — ponowne `openPopup()` po przypadkowym zamknięciu
- **`bindPopupMapGesturePreserve()`** — `movestart`/`dragstart`/`zoomstart` → recovery na `moveend`/`dragend`/`zoomend`
- **`markIntentionalPopupClose()`** — X, filtr, modal, opuszczenie widoku mapy
- **`allowReopen: Boolean(openedPopupId)`** — po sync markerów popup wraca na marker

### Popup zamyka się tylko gdy:
- ✓ klik X (`markIntentionalPopupClose`)
- ✓ inny marker (nowy `popupopen` aktualizuje pin)
- ✓ filtr wyklucza producenta (`closePopup` + intentional)
- ✓ modal „Szczegóły” (`markIntentionalPopupClose`)
- ✓ opuszczenie widoku mapy

---

## Zmienione pliki

| Plik | Zmiana |
|------|--------|
| `js/map/map.js` | Cluster `removeOutsideVisibleBounds: false`, `autoClose: false` |
| `js/views/map.js` | Pin popupu, recovery, gesture preserve, allowReopen |
| `scripts/test-draggable-popup.mjs` | Testy preserve + cluster |
| `scripts/audit-popup-lifecycle.mjs` | Audyt pan/recovery |
| `docs/audit/POPUP-MAP-PAN-FIX-2026-08-02.md` | Ten raport |

**Bez zmian:** GPS, OSM, architektura Store/EventBus, Brand Book, logika producentów.

---

## Testy

```bash
node scripts/test-draggable-popup.mjs
node scripts/audit-popup-lifecycle.mjs
```

**Wynik:** 43 OK + audyt lifecycle OK

---

## Potwierdzenie

| Scenariusz | Status |
|------------|--------|
| Pan mapy z otwartym popupem | Popup **pozostaje otwarty** (recovery jeśli cluster zamknął) |
| Pozycja względem markera | Leaflet utrzymuje anchor; drag popupu bez zmian |
| Odświeżenie markerów | `allowReopen` + defer przy otwartym popupie |
| Zamknięcie X / filtr / inny marker | Działa jak wcześniej |
