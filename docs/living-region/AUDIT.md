# Audit — Living Region Engine + integracja Home

**Data:** 2026-07-26  
**Zakres:** Engine (`js/livingRegion/`), podpięcie Home, favoritesStore, flaga ON/OFF  
**Werdykt ogólny:** **PASS** (z 2 ostrzeżeniami poza zakresem LR)

---

## Podsumowanie

| Obszar | Werdykt | Dowód |
|--------|---------|--------|
| Wydajność | **PASS** | cache miss ~1 ms, hit ~0 ms (smoke) |
| Pamięć | **PASS** | cache dnia ~0.6 KB; limity known/visit |
| Mobile | **PASS*** | ten sam markup; responsive OK; *mobile-premium audit 21/22 (import path — pre-existing) |
| Dark mode | **PASS** | reguły `body.dark-mode .home-living-region*` w `ux-polish-1.css` |
| Light mode | **PASS** | `css/living-region.css` bez zmian layoutu |
| Regresja | **PASS** | OFF → stary pulse; functional 54/54 |
| Błędy JS | **PASS** | syntax 175 plików; Engine smoke OK |
| Błędy CSS | **PASS** | brak nowych CSS LR; istniejące selektory zachowane |

\* Mobile Premium FAIL dotyczy heurystyki „`@import` w `style.css`” — plik jest w `brand-stack.css` (`?v=2`). Nie wprowadzone przez LR.

---

## 1. Wydajność

| Check | Wynik |
|-------|--------|
| Sieć w Engine | brak |
| Timery / RAF / animacje w Engine | brak |
| `getTodayHighlights` (miss) | ~1 ms (Node smoke, 2 producentów) |
| `getTodayHighlights` (hit) | ~0 ms |
| Praca na Home | 1× agregacja / render; potem cache `dayKey`+fingerprint |
| Cold start | +parse `livingRegion` przy `initLivingRegion()` w `app.js` — O(1) |

**Ryzyko residualne (niskie):** przy bardzo dużej puli OSM O(n) na pierwszym miss dnia (opening hours + scoring). Cache ogranicza to do raz na dzień / zmianę fingerprintu.

---

## 2. Pamięć

| Store | Klucz | Limit / rozmiar |
|-------|-------|-----------------|
| Cache highlights | `rg_living_region_day_v1` | ~0.6 KB w teście; typowo &lt; 5 KB |
| Known producers/products | `rg_living_region_known_v1` | max ~500 ID / ~2000 product keys |
| Visit snapshot | `rg_living_region_visit_v1` | osobny od mapy (`rg_map_visit_snapshot_v1`) |
| Ulubione | `regionalny_smak_favorites` | bez zmiany kontraktu |

Brak wycieków DOM (Engine bez `document`). Brak rosnących timerów.

---

## 3. Mobile

| Check | Wynik |
|-------|--------|
| `check:responsive` | OK |
| Markup sekcji | `.home-living-region*` — bez nowych klas layoutu |
| Touch / lista | istniejące style `living-region.css` (min. touch w mobile-premium) |
| `check:mobile-premium` | 21/22 — FAIL `imported` (heurystyka vs `brand-stack`) — **nie LR** |

Macierz ekranów 320–1024 w raporcie 28C: Home ✓.

---

## 4. Dark mode / Light mode

| Tryb | Źródło stylu | Status |
|------|--------------|--------|
| Light | `css/living-region.css` | bez zmian w tej iteracji |
| Dark | `css/ux-polish-1.css` — label/sub/item/hover | obecne |
| Engine | brak CSS | n/d |

Integracja Home tylko podmienia **tekst** w istniejących `<button class="home-living-region-item">` — kontrasty dark/light dziedziczone.

---

## 5. Brak regresji

| Scenariusz | Wynik |
|------------|--------|
| Engine ON + dane | highlights → lista Home |
| Engine OFF | `getLivingRegionPulse()` (3–4 pozycje) |
| Błąd Engine | try/catch → pulse |
| Ulubione API | `addFavorite` + `favoritesStore` — functional OK po korekcie heurystyki |
| Mapa „Co nowego?” | osobny snapshot — bez kolizji |
| `presentation/livingRegion.js` | nietknięty jako fallback |
| `check:living-region-ai` | OK (policy AI CLI) |
| `check:functional` | **54 OK / 0 błędów** |
| `check:predeploy` | **5 OK / 0 błędów** |
| `check:prelaunch-js` | syntax 175 OK, imports 155 OK |

**Naprawa audytu w trakcie:** `functional-audit.mjs` uznawał brak `localStorage` w `favorites.js` za FAIL po extract do `favoritesStore` — zaktualizowano heurystykę (API nadal działa).

---

## 6. Błędy JS

| Check | Wynik |
|-------|--------|
| `node --check` Engine + home + favorites + app | OK |
| `check:living-region-engine` | OK |
| `scripts/audit-living-region-home.mjs` | **PASS** (10/10) |
| Import `views/` w Engine | **0** |
| DOM / `innerHTML` w Engine | **0** |

---

## 7. Błędy CSS

| Check | Wynik |
|-------|--------|
| Nowe pliki CSS dla LR Engine | **brak** (zgodnie z briefem) |
| Usunięte selektory `.home-living-region*` | **nie** |
| Konflikty klas z Engine | brak (Engine nie emituje klas) |

---

## 8. Granica architektury (re-audit)

```
PASS  Engine nie importuje views/
PASS  Engine nie renderuje HTML
PASS  Engine nie zna CSS
PASS  Home mapuje dane → istniejący markup
PASS  Flaga OFF → stary system
```

---

## 9. Uruchomione komendy

```bash
node --check js/livingRegion/**/*.js   # + home, favorites, app
npm run check:living-region-engine
npm run check:living-region-ai
npm run check:prelaunch-js
npm run check:functional          # 54/54 po fix heurystyki favorites
npm run check:predeploy
npm run check:responsive
npm run check:mobile-premium      # 21/22 pre-existing
npm run check:accessibility
npm run brand-protection          # WARNING (0 FAIL) — Brand Book, poza LR
node scripts/audit-living-region-home.mjs
```

---

## 10. Ryzyka residualne / zalecenia

| Ryzyko | Sev | Rekomendacja |
|--------|-----|--------------|
| Heurystyka mobile-premium `@import` | INFO | zaktualizować audit, by akceptował `brand-stack.css` |
| Brand-protection WARNING×6 | INFO | poza LR; `autoApply=false` |
| HTTP smoke pominięty (brak `npm start`) | INFO | ręcznie: Home ON/OFF + dark toggle |
| Pierwszy miss dnia przy dużej puli OSM | LOW | już cache’owane; ewentualnie defer highlights po `requestIdleCallback` (opcjonalnie) |

---

## Werdykt końcowy

**Living Region Engine + Home: PASS — gotowe do użytku.**

Brak regresji krytycznych. Dark/light i mobile korzystają z istniejącego CSS. Wyłączenie flagą przywraca stary pulse.