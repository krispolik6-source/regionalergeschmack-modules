# Naprawa szerokości popupu producenta na mapie

**Data:** 2026-08-02  
**Status:** NAPRAWIONE

---

## Przyczyna

Popup Leaflet renderował się jako **wąski pionowy pasek** (tekst 1–2 znaki na linię), gdy:

1. **CSS** — `.leaflet-popup-content` miał `width: auto` + `min-width: 0` bez szerokości rodzica; `.map-popup` (flex column) nie miał `width: 100%`.
2. **Wrapper** — `.leaflet-popup-content-wrapper` miał `overflow: hidden` bez jawnej szerokości — Leaflet mierzył treść jako ~0–40 px.
3. **Brak integracji drag/layout** — `attachDraggableProducerPopup` nie był podpięty w `popupopen`, więc `ensureProducerPopupLayout` / `popup.update()` nie wymuszały szerokości po otwarciu.
4. **`bindPopup`** — `maxWidth: 320`, `minWidth: 240` w JS były nadpisywane przez CSS i nie trafiały na kontener DOM.

Efekt: zamiast karty ~280–320 px użytkownik widział wąski słup treści.

---

## Rozwiązanie (tylko renderowanie)

| Warstwa | Zmiana |
|---------|--------|
| **CSS `style.css`** | Stała szerokość `.leaflet-popup.producer-leaflet-popup`: `min(320px, calc(100vw - 24px))`; wrapper/content `width: 100%`; scroll `pan-y`; `max-height: 90dvh` + safe-area |
| **`injectMapStyles()`** | Te same reguły runtime + sticky footer akcji |
| **`draggableProducerPopup.js`** | `getProducerPopupTargetWidth()`, `ensureProducerPopupLayout()` — wymusza px na kontenerze i `popup.update()` |
| **`map.js`** | `popupopen` → `attachDraggableProducerPopup`; `popupclose` → `detachDraggableProducerPopup` |

Logika producentów, markerów, diff push — **bez zmian**.

---

## Szerokość popupu po viewport

| Viewport | Szerokość popupu |
|----------|------------------|
| 320 px | 296 px |
| 360 px | 320 px |
| 390 px | 320 px |
| 430 px | 320 px |

---

## Zmienione pliki

- `css/style.css` — wymiary popupu, sticky footer, touch-action
- `js/map/draggableProducerPopup.js` — `ensureProducerPopupLayout`, `getProducerPopupTargetWidth`
- `js/views/map.js` — import + popupopen/popupclose + CSS w `injectMapStyles`
- `scripts/test-draggable-popup.mjs` — testy szerokości 320–430 px
- `docs/audit/POPUP-WIDTH-FIX-2026-08-02.md` — ten raport

---

## Testy

```bash
node scripts/test-draggable-popup.mjs
```

**Wynik:** 31 OK, 0 FAIL

---

## Potwierdzenie

- Wąski pionowy pasek — **usunięty** (wymuszona szerokość 240–320 px)
- Pełna szerokość mobile — **OK** na 320 / 360 / 390 / 430 px
- Drag popup — **podpięty** (popupopen/popupclose)
- Scroll + sticky CTA + safe-area — **OK**
