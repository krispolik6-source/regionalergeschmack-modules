# ETAP 34B — Mobile Theme Toggle Polish

**Data:** 2026-07-22  
**Polityka:** `autoApply=false` · `autoFix=false`  
**Werdykt:** **PASS**

---

## Cel

Naprawić wyświetlanie przełącznika motywu na telefonach (320–430 px), gdzie etykiety tekstowe (Day / Dark / Night) wypychały przycisk poza prawą krawędź headera.

---

## Wykonane zmiany

| Zmiana | Opis |
|--------|------|
| Ikony zamiast tekstu | **🌞** = tryb dzienny aktywny · **🌙** = tryb nocny aktywny |
| Rozmiar = header | `width` / `height` = `var(--ph-btn)` (jak menu / Premium) |
| Wyśrodkowanie | `inline-flex` + `align/justify center` |
| Overflow | `max-width: var(--ph-btn)`, `overflow: hidden`, stały `flex-basis` |
| Breakpointy | 320 · 360 · 390 · 430 · 768 |
| Self-heal | usunięto fallback `Day` / `Night` (źródło overflow) |
| Cache-bust | `style.css?v=554`, `theme-toggle-premium.css?v=2` |

Logika przełączania (`setDarkMode` / `isDarkMode` / zapis settings / EventBus) — **bez zmian przepływu**. Zmiany JS to wyłącznie treść prezentacyjna ikony.

---

## Niewykonane zmiany (świadomie)

| Obszar | Powód |
|--------|--------|
| Home · Mapa · GPS · routing · Premium · PWA | poza zakresem |
| `app.js` · EventBus · Store | poza zakresem |
| Layout `.header-content` / język / logo | bez zmian strukturalnych |
| Nowa logika motywu | zabronione |

---

## Znalezione problemy

| # | Problem | Naprawa |
|---|---------|---------|
| 1 | Tekst Day/Night z self-heal rozszerzał przycisk na wąskich ekranach | zawsze 🌞/🌙 |
| 2 | Sztywne 44×44 vs `--ph-btn` 40–42 px na mobile | rozmiar = `--ph-btn` |
| 3 | Brak breakpointów 390/430 w CSS toggle | dodane w 34B |

---

## Weryfikacja szerokości (statyczna + checklist)

| Szerokość | Oczekiwanie | Stan |
|-----------|-------------|------|
| 320 px | przycisk = `--ph-btn` (40), w headerze, bez H-scroll | **PASS** (CSS) |
| 360 px | j.w. | **PASS** (CSS) |
| 390 px | j.w. (`--ph-btn` 42) | **PASS** (CSS) |
| 430 px | j.w. | **PASS** (CSS) |
| 768 px | j.w. (desktop `--ph-btn`) | **PASS** (CSS) |

### Checklist ręczny (właściciel)

| # | Scenariusz | ☐ |
|---|------------|---|
| 1 | 320–430: przycisk w pełni widoczny w headerze | |
| 2 | Brak poziomego scrolla dokumentu | |
| 3 | Klik → motyw + ikona 🌞 ↔ 🌙 | |
| 4 | Ikona wyśrodkowana, bez Day/Dark | |

---

## Testy

| Komenda | Wynik |
|---------|--------|
| `npm run check:responsive` | **PASS** |
| `npm run check:accessibility` | **PASS** |
| `node --check js/core/settings.js` | **PASS** |
| `node --check js/diagnostics/selfHealing.js` | **PASS** |

---

## PASS / WARNING / FAIL

| Kryterium | Wynik |
|-----------|--------|
| Ikony 🌞 / 🌙 zamiast Day/Dark | **PASS** |
| Ikona = aktywny motyw | **PASS** |
| Szerokość = pozostałe przyciski headera | **PASS** |
| Brak overflow / H-scroll (CSS) | **PASS** |
| Responsywność 320→desktop | **PASS** |
| Bez zmian logiki aplikacji | **PASS** |
| Ręczny screenshot na urządzeniu | **WARNING** (do odhaczenia właściciela) |

### Podsumowanie etapu: **PASS**

(z **WARNING** kosmetycznym: brak zautomatyzowanego pomiaru pikseli w przeglądarce — weryfikacja wizualna w checklist powyżej)

---

## Lista zmodyfikowanych plików

| Plik | Rodzaj |
|------|--------|
| `css/theme-toggle-premium.css` | polish mobile + `--ph-btn` + breakpointy |
| `css/style.css` | cache-bust importu toggle |
| `index.html` | 🌞 + `style.css?v=554` |
| `js/core/settings.js` | treść ikony 🌞/🌙 (prezentacja) |
| `js/diagnostics/selfHealing.js` | bez Day/Night |
| `scripts/check-responsive.mjs` | asercje 34B |
| `scripts/check-accessibility.mjs` | asercje 🌞/`--ph-btn` |
| `docs/mobile/THEME-TOGGLE-POLISH.md` | ten raport |

**Nietknięte:** `js/app.js`, mapa, GPS, Premium, PWA, EventBus, Store, routing.

---

`autoApply=false` · `autoFix=false`
