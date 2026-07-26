# ETAP 32A — Home Premium (analiza foldu)

**Data:** 2026-07-22  
**Polityka:** `autoApply=false` · `autoFix=false`  
**Zakaz:** nowe funkcje · EventBus · Store · API · logika aplikacji · architektura  
**Cel:** pierwsze ~10 s po starcie = efekt „wow” (marka + jedna akcja + atmosfera)

---

## Werdykt

Home ma **zbyt dużo konkurencji nad i tuż pod foldem**. Intencja prepublish („powitanie · szukaj · CTA mapy”) jest **nadpisana** przez `production-polish.css` (kategorie `order:4`, quick-filters `order:2`, Premium `order:8`) oraz przez **ukrycie logo marki na mobile**.  
Efekt: zamiast „wow — region / smak / mapa”, użytkownik widzi **tytuł + search + 2 CTA + chipy + siatkę 8 kategorii**.

**Home Fold Score (szacunek): 62 / 100**  
**Potencjał po 3 zmianach CSS/prezentacji: ~85 / 100**

---

## Inwentarz sekcji (kolejność w `home.js`)

| # | Sekcja | Klasa / data | Nad foldem? (mobile ~typowe) |
|---|--------|--------------|------------------------------|
| 1 | Greeting (+ ambient + Region Soul / Intel) | `.home-greeting` | **Tak** |
| 2 | Search hub | `.home-hub` | **Tak** |
| 3 | 2× CTA lokalizacja / okolica | `.home-actions` | **Tak** |
| 4 | Quick filters | `.home-quick-filters` | **Często tak** (`order:2` w polish) |
| 5 | Kategorie 2×4 | `.home-categories` | **Tak / tuż pod** (`order:4`) |
| 6 | Polecane / Dla Ciebie / Ostatnie | carousels | Poniżej |
| 7 | Living Region · Smaki dnia · Doradca · Smart Today · Nature · Story · Live · Seasonal | narracje | Poniżej (gęsty scroll) |
| 8 | Restauracje / Fast food / Featured / Recipes | listy | Daleko |
| 9 | Return Magic · Premium CTA · hint · footer | koniec | Premium podniesione w polish |

Źródła: `js/views/home.js` (`renderHome`), `css/prepublish.css`, `css/production-polish.css`.

---

## Diagnoza (szukane problemy)

### 1. Zbyt wiele nad foldem
- Greeting + search + **dwa** przyciski + (polish) filtry + **siatka kategorii**.
- Region Soul / Regional Intel wklejony w greeting → drugi „blok CTA” obok tytułu.
- Ambient 🎵 konkuruje wizualnie z tytułem powitania.

### 2. Konkurujące CTA
- `#getLocationBtn` vs `#findNearbyBtn` (oba primary w odczuciu).
- Quick filters i „Wszystkie kategorie” = kolejne decyzje przed mapą.
- Premium `order:8` pojawia się wcześniej niż treść „wow” (smaki / miejsca).

### 3. Słaba hierarchia
- Na mobile **`.home-greeting-brand { display: none }`** (`production-polish.css`) — brand znika z pierwszego viewportu (nagłówek shell ≠ hero Home).
- Wiele sekcji narracyjnych o podobnej wadze (label + sub + lista) — brak jednego bohatera wizualnego.

### 4. Co przenieść niżej (bez kasowania funkcji)
- Quick filters, pełna siatka kategorii, Premium teaser, Return Magic, Nature Calendar, Region Story, Live Region, Seasonal, Recipes.
- Zostawić w zasięgu pierwszego scrolla: **1** belka emocji (np. Smaki dnia **albo** Living Region — nie obie naraz na górze).

---

## Propozycje (max 3) — tylko do akceptacji

### P1 — Jeden bohater foldu: marka + 1 CTA mapy
- **Problem:** dwa CTA lokalizacji; logo Home ukryte na mobile; brak „wow” marki.
- **Propozycja (CSS / drobna prezentacja HTML):** przywrócić widoczność `.home-greeting-brand` na mobile; wizualnie zdegradować `#getLocationBtn` (secondary / mniejszy) lub ukryć go CSS-em na wąskich ekranach; wyróżnić tylko `#findNearbyBtn` jako jedyne primary.
- **Efekt:** w 10 s: marka + „idź na mapę / okolica”.
- **Zakres plików (szacunek):** `css/production-polish.css` (± `css/prepublish.css`); ewentualnie klasa na przycisku w `home.js` bez zmiany handlerów.
- **Wpływ:** wysoki (retencja / pierwsze wrażenie)
- **Ryzyko:** low
- **Czas:** ~45–60 min

### P2 — Kategorie i quick-filters pod fold (naprawa order)
- **Problem:** `production-polish` stawia `.home-quick-filters` na `order:2` i `.home-categories` na `order:4` — zabija krótki fold z prepublish.
- **Propozycja:** CSS-only: filtry i kategorie `order ≥ 12` (jak w `prepublish.css`); fold = greeting → hub → actions.
- **Efekt:** mniej clutteru, kategorie dostępne po krótkim scrollu (funkcja zostaje).
- **Zakres plików:** `css/production-polish.css` (ew. synchronizacja z `prepublish.css`).
- **Wpływ:** wysoki
- **Ryzyko:** low
- **Czas:** ~20–30 min

### P3 — Greeting bez drugiego „ekranu” narracji
- **Problem:** Region Soul / Regional Intel + ambient w greeting rozpraszają od marki i CTA.
- **Propozycja:** przenieść `buildRegionalIntelligenceHtml()` **pod** `.home-actions` (niżej w DOM / wyższy `order`), bez zmiany logiki klików; ambient zostawić, ale mniejszy / mniej konkurujący (CSS).
- **Efekt:** spokojniejszy hero; emocja regionu nadal w scrollu.
- **Zakres plików:** `js/views/home.js` (kolejność markup), `css/production-polish.css` / `region-soul.css`.
- **Wpływ:** średni–wysoki
- **Ryzyko:** low–medium (mniej „impulsów” w pierwszym kadrze — świadomie)
- **Czas:** ~40–50 min

---

## Co świadomie NIE proponujemy

- Usuwania sekcji narracyjnych z produktu
- Nowych ekranów / modułów / CTA Premium na foldzie
- Zmian EventBus / GPS / mapy / Store
- Auto-apply jakichkolwiek fixów

---

## Kryteria sukcesu (po akceptacji i wdrożeniu)

1. Pierwszy viewport mobile: **logo/wordmark + powitanie + search + 1 primary CTA**.  
2. Brak siatki 8 kategorii w pierwszym kadrze.  
3. Self Reflection „Home przeładowany” ↑ z 68 w kolejnym cyklu (cel ≥ 80).

---

## Status

**Czekam na akceptację:** tak / nie / zmień (per P1–P3).  
Dopiero po „tak” — wdrożenie wyłącznie zaakceptowanych punktów.
