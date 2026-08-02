# Naprawa przewijania popupu producenta (mobile)

**Data:** 2026-08-02  
**Status:** NAPRAWIONE

---

## Przyczyna problemu

Popup miał poprawne CSS (`overflow-y: auto`, `touch-action: pan-y`), ale **gesty dotykowe propagowały się do kontenera Leaflet**. Mapa reagowała na przewijanie palcem (`map.dragging`, `touchZoom`), co powodowało:

1. Przesuwanie mapy zamiast scrollu treści popupu
2. Utratę popupu (reposition / konflikt z klastrami / utrata kontekstu markera)
3. Konieczność ponownego kliknięcia markera

Dodatkowo blokada mapy (`map.dragging.disable`) działała **tylko podczas drag nagłówka**, nie podczas scrollu treści.

---

## Wdrożone rozwiązanie (P1–P12)

| Wymaganie | Implementacja |
|-----------|---------------|
| P1 | `overflow-y: auto` + `overscroll-behavior: contain` na wrapperze |
| P2–P3 | `lockMapInteraction()` + `touchmove` capture `stopPropagation` |
| P4 | Wyłączenie `map.dragging` + `map.touchZoom` na start scroll; restore na `pointerup/cancel` |
| P5 | `L.DomEvent.disableClickPropagation` — mapa nie odbiera kliknięć z popupu |
| P6 | `isInteractivePopupTarget()` — wyklucza przyciski, linki, promocje, zamknięcie |
| P7 | Pointer + touch + wheel + mouse (Leaflet DomEvent) |
| P8 | Bez zmian szerokości 320–430 px; max-height 90dvh z safe-area |
| P9–P10 | Scroll tylko w wrapperze; mapa zablokowana na czas gestu |
| P11 | Ujednolicone `touch-action`, `overscroll-behavior`, brak konfliktu z drag handle |
| P12 | `[PopupScrollDiag]` tylko localhost |

---

## Zmienione pliki

| Plik | Zmiana |
|------|--------|
| `js/map/draggableProducerPopup.js` | Izolacja scrollu, lock/unlock mapy, diag localhost, Leaflet DomEvent |
| `css/style.css` | `overscroll-behavior`, `map-popup-scroll-active`, `touch-action: manipulation` na CTA |
| `js/views/map.js` | Te same reguły w `injectMapStyles()` |
| `scripts/test-draggable-popup.mjs` | Testy scroll isolation |
| `docs/audit/POPUP-SCROLL-FIX-2026-08-02.md` | Ten raport |

**Bez zmian:** logika mapy, producentów, GPS, OSM, HTML popupu, Brand Book.

---

## Opis zmian technicznych

### `lockMapInteraction` / `unlockMapInteraction`
- Snapshot stanu `dragging` + `touchZoom`
- Klasa `body.map-popup-scroll-active` dla CSS
- Przywrócenie stanu po `pointerup` / cleanup

### Scroll gesture
- `pointerdown` na wrapperze (nie handle, nie interactive) → lock jeśli treść scrollowalna
- `touchmove` capture → `stopPropagation` do Leaflet
- `wheel` capture → scroll desktop bez przesuwania mapy

### Leaflet helpers
- `L.DomEvent.disableScrollPropagation(wrapper)`
- `L.DomEvent.disableClickPropagation(wrapper + container)`

### Diagnostyka localhost
```
[PopupScrollDiag] popup scroll start { popupHeight, scrollHeight, viewportHeight }
[PopupScrollDiag] map dragging disabled { reason }
[PopupScrollDiag] popup scroll end { ... }
[PopupScrollDiag] map dragging enabled { reason }
```

---

## Wpływ

| Obszar | Wpływ |
|--------|-------|
| **Mobile 320–430 px** | Scroll treści popupu bez przesuwania mapy; popup pozostaje otwarty |
| **Desktop** | Wheel scroll w popupie izolowany; drag nagłówka bez zmian |
| **Wydajność** | Minimalny — listenery tylko przy otwartym popupie, cleanup przy close |
| **Funkcje popupu** | Drag nagłówka, sticky CTA, przyciski — zachowane |

---

## Testy

```bash
node scripts/test-draggable-popup.mjs
```

**Wynik:** 39 OK, 0 FAIL

---

## Ryzyka

| Ryzyko | Poziom | Uwagi |
|--------|--------|-------|
| Krótki lock mapy przy tap na treść | Niski | Odblokowanie na pointerup |
| Leaflet DomEvent bez cleanup API | Niski | Popup niszczony przy close — listenery znikają z DOM |
| Dwa palce (pinch zoom) | Niski | `touchZoom` wyłączony na czas scrollu jednym palcem |
