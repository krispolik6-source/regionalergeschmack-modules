# Audyt przedpremierowy — Regionaler Geschmack

Data: 2026-07-21  
Zakres: sprzątanie · JS · CSS · PWA · smoke funkcjonalny (CLI)  
Zasady: bez zmiany wyglądu (kolory/układ) · usuwanie tylko zbędnych plików.

---

## KROK 1 — Sprzątanie

### Usunięte

| Ścieżka | Powód |
|---------|--------|
| `assets/images/_probe/` (10 plików JPG) | Tymczasowe próbki – nieużywane w aplikacji |
| `scripts/fix-taste-diary-icon.mjs` | Jednorazowy patch (już zastosowany) |
| `scripts/patch-taste-diary-html.mjs` | Jednorazowy patch (już zastosowany) |
| `scripts/etap31-production-polish-fixes.mjs` | Jednorazowy skrypt etapu (już wykonany) |
| `scripts/prelaunch-cleanup-inventory.mjs` | Pomocniczy skrypt inwentaryzacji (jednorazowy) |

### Nie znaleziono / zachowano

| Pozycja | Status |
|---------|--------|
| `*.bak` / `*.tmp` / `*.log` | brak |
| Puste foldery | brak |
| Duplikaty kodu produkcyjnego | brak wymagających usunięcia |
| `assets/images/*` (produkcyjne) | `asset-audit`: **0 nieużywanych** (poza sources) |
| `scripts/test-*.mjs` (nie w package.json) | **zachowane** — testy regresji / etapów |
| `scripts/repair-index-utf8.mjs` | **zachowany** — narzędzie naprawcze UTF-8 |
| `js/legacy/*` | **zachowane** — `npm run build:legacy` / iOS9 |

---

## KROK 2 — Kod JS / SW / PWA

| Test | Wynik |
|------|--------|
| `node --check` na 139 plikach JS (+ `sw.js`) | **PASS** |
| Graf importów z `js/app.js` (128 modułów) | **PASS** — wszystkie ścieżki istnieją |
| `full-audit.mjs` (statyczny JS/CSS/HTML) | **PASS** — OK 190 / błędy 0 |
| `sw.js` cache `rg-pwa-v23` + fetch/offline | **PASS** (`check:pwa`) |
| `manifest.json` + ikony 192/512 na dysku | **PASS** |
| Taste Diary (`check:taste-diary`) | **PASS** |
| Production logging | **PASS** |
| Health monitor | **PASS** |
| Translations 36 języków × 1155 kluczy | **PASS** |

### Naprawione w audycie

1. **`manifest.json` description** — uszkodzony UTF-8 (`Nhe` → `Nähe`).
2. **`test-prepublish-polish.mjs`** — sztywne `style.css?v=537` → regex `style.css?v=\d+` (cache-bust nie psuje testu).

### Uwagi (bez zmiany kodu runtime)

- `functional-audit.mjs`: Overpass/OSM timed out → fallback **stale-memory** (7 producentów). Wynik końcowy: **OK 54 / błędy 0** (nawigacja, szukaj, ulubione, koszyk, opinie, dark mode, side menu, auth).
- Brand Protection: **WARNING** (7) — świadome (m.in. radius pills / glow); `autoApply=false`.
- Production Polish: **91/100**, fail 0, warn 1.

---

## KROK 3 — CSS

| Pozycja | Wynik |
|---------|--------|
| Składnia krytyczna (zagnieżdżone `{{`) | brak wykrytych błędów |
| Importy (`experience-stack` / `brand-stack` / `prepublish`) | OK (≤10 top-level) |
| Duplikaty reguł w `style.css` | **dług techniczny** — nie usuwano masowo (ryzyko zmiany wyglądu) |
| Nieużywane klasy | nie usuwano agresywnie (selektory używane dynamicznie w JS) |

---

## KROK 4 — Funkcjonalność (ocena)

Legenda: ✅ potwierdzone testem CLI · ⚠️ wymaga ręcznego Ctrl+Shift+R · ⛔ niedostępne w tym audycie (sieć/OSM)

| Obszar | Status | Uwagi |
|--------|--------|--------|
| 1. Nawigacja (widoki w `VIEW_KEYS`) | ✅/⚠️ | kod + `full-audit`; UI ręcznie |
| 2. Home (kategorie / CTA / szukaj) | ✅/⚠️ | prepublish + searchFilter w functional (częściowo) |
| 3. Mapa / GPS / markery / modal | ⚠️ | CLI: kontrolki mapy OK; GPS/markery — ręcznie w przeglądarce |
| 4. Taste Diary | ✅ | store + modal + side menu + delete |
| 5. Wyszukiwarka | ✅ | PL/DE/EN + global results |
| 6. Ulubione | ✅ | localStorage API w functional-audit |
| 7. Koszyk | ✅ | storage API w functional-audit |
| 8. Opinie | ✅ | getReviews + addReview |
| 9. Premium | ✅ | `renderPremium` + polish |
| 10. Języki | ✅ | 36/36 komplet |
| 11. Tryb nocny | ✅ | `setDarkMode` w functional-audit |
| 12. Menu ☰ | ✅ | sekcje + formularz + share + QR |
| 13. PWA install | ✅ | manifest + SW + `pwaInstall` |
| 14. Offline | ✅/⚠️ | SW precache; pełny offline — ręcznie DevTools |

---

## Lista zmian w kodzie (ten audyt)

1. Usunięcie `assets/images/_probe/` + 4 skryptów jednorazowych.
2. Naprawa `manifest.json` → poprawny opis z `Nähe`.
3. Elastyczny assert cache-bust w `scripts/test-prepublish-polish.mjs`.
4. Dodanie narzędzia `scripts/prelaunch-js-check.mjs` (syntax + importy + SW/PWA).

---

## Gotowość do premiery

| Kryterium | Werdykt |
|-----------|---------|
| Składnia JS / importy | gotowe |
| PWA / ikony / SW | gotowe |
| i18n kompletność kluczy | gotowe |
| Assets produkcyjne | gotowe |
| Brand / polish | gotowe z ostrzeżeniami (nie blokujące) |
| Smoke UI w przeglądarce | **wymagany** Ctrl+Shift+R (Home · Mapa · Diary · GPS) |
| SMTP raportów e-mail | osobno — wymaga lokalnego `.env` |

### Werdykt

**Kod i bundel PWA są gotowe do premiery pod względem automatycznych testów.**  
Przed publikacją zalecany krótki checklist ręczny (5 min): Home → Mapa (marker + modal) → Taste Diary → Ulubione → język → dark mode → instalacja PWA.

---

## Jak powtórzyć audyt

```bash
node scripts/prelaunch-js-check.mjs
npm run check:assets
npm run check:pwa
npm run check:translations
npm run check:taste-diary
npm run check:prepublish
npm run check:health
npm run check:audit
# functional-audit wymaga sieci OSM — nie uruchamiać offline
```
