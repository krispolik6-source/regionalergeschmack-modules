# Audyt systemu reklam (AdSense) — Regionaler Geschmack

**Data:** 2026-08-02  
**Status:** AUDYT + BEZPIECZNE OPTYMALIZACJE WDROŻONE  
**Zakres:** wyłącznie wydajność i UX reklam — bez zmian architektury, Brand Book, ID reklam, logiki mapy/GPS/popupów

---

## 1. Wyniki audytu (10 punktów)

| # | Obszar | Stan przed | Ocena |
|---|--------|------------|-------|
| 1 | Wielokrotna inicjalizacja | `mountHomeAdSense()` wołany przy każdym `renderHome`; `pushAdUnits` filtrował `:not([data-adsbygoogle-status])`, ale brak guard na poziomie hosta; `initAdSense()` mógł wejść 2× (bootstrap + cookie accept) | ⚠️ Średnie |
| 2 | Wycieki pamięci | `MutationObserver` w `watchAdUnitFill` bez centralnego cleanup; brak `teardown` przy `destroyHome()` | ⚠️ Średnie |
| 3 | IntersectionObserver | **Brak** — reklamy pushowane natychmiast | ❌ Brak |
| 4 | MutationObserver | Obserwatory w `watchAdUnitFill` — disconnect po 4 s lub fill, ale **nie** przy destroy Home | ⚠️ |
| 5 | Event listenery reklam | `bindLocaleListeners()` — guard `localeBound` ✓; brak listenerów per-slot | ✓ OK |
| 6 | Render poza viewportem | Push natychmiast przy mount, nawet gdy baner poniżej foldu | ❌ |
| 7 | Podwójny `adsbygoogle.push` | Selektor `:not([data-adsbygoogle-status])` chronił przed duplikatem na tym samym `<ins>` | ✓ OK |
| 8 | Remount po zmianie języka | Debounce 200 ms + `lastRemountedLanguage` skip — już wdrożone | ✓ OK |
| 9 | Home → Mapa → Home | `renderHome` niszczy DOM → nowy `<ins>` → jeden push; stary slot GC; brak teardown observerów | ⚠️ |
| 10 | Blokowanie FCP | Skrypt AdSense w `index.html` ładuje się **przed** zgodą cookie (`async`, ale nadal request sieciowy) | ⚠️ Ryzyko |

**Dodatkowo (P7/P8):**
- AdSense **tylko na Home** — na mapie brak slotu AdSense ✓
- Reklamy natywne w popupie mapy (`buildPopupAdHtml`) — wewnątrz popupu, nie nad mapą ✓
- Panel Home ukryty przy `view-map-active` — slot mógł nadal być „żywy” w tle

---

## 2. Wdrożone ulepszenia (P1–P8)

### P1 — Lazy loading (IntersectionObserver)
- `scheduleAdLoad()` + `attachLazyAdObserver()` — push dopiero gdy host w viewport (+200 px margines)
- Jeśli już blisko viewport → push natychmiast (bez czekania)

### P2 — Skip ukryty kontener
- `isElementVisibleForAds()` — sprawdza `hidden`, `display:none`, opacity 0, ukryty `[data-view-panel]`, mapa aktywna + panel Home hidden

### P3 — Zapobieganie ponownej inicjalizacji
- `data-rg-ad-initialized="1"` + sprawdzenie `data-adsbygoogle-status`
- `recordSkippedInit()` w diagnostyce localhost

### P4 — Diagnostyka localhost `[AdsDiag]`
- Metryki: `activeSlots`, `renders`, `errors`, `skippedInits`, `avgLoadMs`
- `window.__RG_ADSENSE__.diag()` tylko na localhost / 127.0.0.1
- Produkcja: **całkowicie wyłączone** (`isLocalhostDiag()` gate)

### P5 — Anti-CLS
- Istniejące: `height: 90px` na `<ins>`, `.rg-adsense-frame` 90 px
- Dodane: `min-height: 90px` na `.rg-adsense-home` i `.rg-adsense-frame`, `contain-intrinsic-size`
- Bez `display:none` na unfilled (zgodność AdSense)

### P6 — ARIA / role
- AdSense: `role="complementary"` na `<aside>`, `role="region"` na frame, etykieta `aria-hidden` na badge „Reklama”
- Native Home: `role="complementary"` + `role="region"` na karuzeli
- Popup native: `role="note"` + `aria-label`

### P7 — Brak reklam nad mapą / popupem
- CSS: `body.view-map-active [data-view-panel='home'] .rg-adsense-home, .rg-ad-home { visibility: hidden; pointer-events: none; content-visibility: hidden }`
- AdSense nie renderowany na mapie (architektura bez zmian)
- Popup native ad pozostaje **wewnątrz** popupu (nie zmieniano logiki popupów)

### P8 — Wydajność Home / mapa
- Lazy load → mniej pracy przy starcie Home i scrollu
- `teardownHomeAdSense()` w `destroyHome()` → cleanup IO/MO/timer
- Ukrycie reklam Home przy widoku mapy → brak repaint/interakcji w tle

### Dodatkowo
- `initAdSense()` — guard `adsenseInitialized` (jednorazowa inicjalizacja)
- `teardownHomeAdSense()` / `disconnectHostAdObservers()` — eksportowane API cleanup

---

## 3. Zmienione pliki

| Plik | Zmiana |
|------|--------|
| `js/presentation/adsense.js` | P1–P4, P3 guard, teardown, lazy IO, diag localhost, init guard, ARIA w HTML |
| `js/views/home.js` | `teardownHomeAdSense()` w `destroyHome()` |
| `js/presentation/nativeAds.js` | P6 role/aria (prezentacja HTML) |
| `css/style.css` | P5 min-height/CLS, P7 ukrycie reklam Home na mapie |
| `scripts/test-adsense.mjs` | Testy P1–P4, teardown, cookie consent w setup |
| `docs/audit/ADSENSE-AUDIT-2026-08-02.md` | Ten raport |

**Bez zmian:** `js/config.js` (ID slotów), `index.html` (client ID), logika mapy/GPS/popupów, Brand Book.

---

## 4. Wpływ na metryki

| Metryka | Wpływ | Opis |
|---------|-------|------|
| **CPU** | ↓ niski–średni | Mniej natychmiastowych push/render off-screen; cleanup observerów przy destroy |
| **Pamięć** | ↓ niski | `teardownHomeAdSense()` zwalnia IO/MO/timery; WeakMap na host |
| **CLS** | → stabilny | 90 px zarezerwowane przed load; brak ukrywania `display:none` |
| **LCP/FCP** | ↓ lekki | Lazy load opóźnia push do scrollu; skrypt w index.html nadal ładuje się async (patrz ryzyka) |
| **INP/UX** | ↑ | Brak reklam aktywnych nad mapą; mniej pracy przy przejściu Home↔Mapa |
| **Core Web Vitals** | Neutralny–pozytywny | CLS bez regresji; mniejszy main-thread przy starcie Home |

---

## 5. Zgodność Google AdSense

| Wymaganie | Status |
|-----------|--------|
| Brak `display:none` na `<ins>` unfilled | ✓ |
| Brak fałszywego `push({ language })` | ✓ |
| Cookie consent przed `initAdSense` / push | ✓ |
| Jedna jednostka na slot | ✓ (P3) |
| Responsywny format + stała wysokość 90 px | ✓ |
| Etykieta „Reklama” widoczna | ✓ |
| ID klienta / slot bez zmian | ✓ |

---

## 6. Wyniki testów

```bash
node scripts/test-adsense.mjs
```

**Wynik:** wszystkie asercje OK (w tym P1 lazy, P2 hidden, P3 re-init, P4 AdsDiag, P6 role, teardown).

---

## 7. Ryzyka i ograniczenia

| Ryzyko | Poziom | Uwagi |
|--------|--------|-------|
| Skrypt AdSense w `index.html` przed zgodą cookie | Średni | Request sieciowy może wystąpić przed accept; **nie zmieniano** (config/index). Rozważyć defer do consent w osobnym zadaniu. |
| Remount języka = nowy `<ins>` | Niski | Zamierzone przez Google (sygnały html[lang]); debounce + skip ten sam język |
| `content-visibility: hidden` na Home przy mapie | Niski | Tylko prezentacja; slot pozostaje w DOM |
| Brak IO w starszych WebView | Niski | Fallback: push natychmiast gdy IO niedostępny |

---

## 8. Potwierdzenie zakresu

- ✅ Architektura (Store, EventBus, routing) — bez zmian  
- ✅ Brand Book — bez zmian  
- ✅ Logika producentów, mapy, GPS, popupów — bez zmian  
- ✅ ID reklam / `ADSENSE_CONFIG` — bez zmian  
- ✅ Tylko bezpieczne optymalizacje wydajności i UX w warstwie prezentacji reklam
