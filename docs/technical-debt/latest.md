# ETAP 32C — Technical Debt

**Data:** 2026-07-22  
**Polityka:** `autoApply=false` · `autoFix=false` · **nic nie usunięto**  
**Zakres:** całe repo (bez `node_modules`)

---

## Werdykt

**Dług techniczny (szacunek): 18 / 100 obciążenia** *(im wyżej, tym gorzej)*  
**Runtime Critical: 0** (aplikacja nie jest „zepsuta”)  
**Największy koszt:** rozmiar audio w repo (~34 MB WAV+_src), konflikt warstw CSS Home, legacy bundle 644 KB, monolity `map.js` / `home.js` / `style.css`.

`npm run check:assets` → **0 nieużywanych obrazków** (poza `sources.json`).  
SVG w `assets/`: **0 oczywistych osieroconych** względem JS/CSS/HTML (heurystyka nazw).

---

## Critical

| ID | Problem | Dowód | Rekomendacja (bez auto-apply) |
|----|---------|-------|-------------------------------|
| C1 | **Konflikt warstw CSS Home fold** — dwie „prawdy” o kolejności sekcji | `css/prepublish.css`: categories `order:11`; `css/production-polish.css`: categories `order:4`, quick-filters `order:2` | Ujednolicić jedną warstwę foldu (po akceptacji 32A) |
| C2 | **Legacy bundle vs żywe ES modules** | `js/legacy/app.bundle.js` ~644 KB / ~11 477 LOC; `index.html` ładuje go przez `nomodule` | Decyzja: przebudować z źródeł albo oficjalnie wycofać ścieżkę iOS9 |

> Brak CRITICAL typu „crash / security hole” w tym skanie. Powyższe to **krytyczny dług produktowy** (UX + dryf kodu), nie awaria.

---

## High

| ID | Problem | Dowód | Rekomendacja |
|----|---------|-------|--------------|
| H1 | **Duplikat audio WAV obok MP3** (~15.6 MB) | 16× `.wav` + 16× `.mp3` w `assets/audio/nature/`; runtime preferuje `mp3` (`climateAtmosphere.js` `EXT_CANDIDATES`) | WAV tylko jako fallback lokalny / nie w deploy produkcyjnym |
| H2 | **Źródła audio `_src`** (~17.8 MB) | `assets/audio/nature/_src/*.mp3` (8 plików) — materiał fetcherów, nie UI | Wyłączyć z hostingu / `.gitignore` deploy |
| H3 | **Health: ~40 konfliktów CSS** | `docs/health/latest.md` | Porządek selektorów / mniej `!important` warstw |
| H4 | **Monolit mapy i Home** | `map.js` ~2313 LOC · `home.js` ~1360 LOC · `style.css` ~6170 LOC / 164 KB | Nie refaktor architektury teraz — świadomy koszt utrzymania |
| H5 | **30 arkuszy CSS + stack importów** | `experience-stack.css` ~16 `@import`; `style.css` 9 | Ryzyko kolejności i duplikacji reguł |
| H6 | **Akumulacja raportów docs** | ~53 pliki datowane + ~46 `latest.*` w `docs/` | Polityka retencji (zostaw `latest` + N dni) |

---

## Medium

| ID | Problem | Dowód | Rekomendacja |
|----|---------|-------|--------------|
| M1 | **Martwy UI Region (export HTML)** | `buildRegionSelectOptionsHtml` — tylko `regionPresets.js` + test; UI usunięty z mapy | Usunąć lub zostawić wyłącznie pod testy / przyszły picker |
| M2 | **Warstwa diagnostyki 26 plików JS** | `js/diagnostics/*` (+ 9 `*Core.js`) importowana z `app.js` | OK dla właściciela; pilnować `isDevMode` na prod |
| M3 | **Luki i18n** | Health: 33 brakujące klucze (m.in. `menu.sectionDev` poza DE/EN/PL) | Dobić klucze albo nie eksportować klucza dev |
| M4 | **Mojibake w meta** | `index.html` / `landing.html` (`N?he`) | Naprawa UTF-8 w description |
| M5 | **Skrypty jednorazowe `fix-*` / `patch-*`** | 7+ w `scripts/` | Archiwum / `scripts/archive/` (bez kasowania w tym etapie) |
| M6 | **JPG + WebP równolegle** | `assets/images`: 57× `.jpg`, 67× `.webp`, 23× `.svg` | Audit mówi „używane”; rozważyć tylko WebP w runtime później |
| M7 | **Placeholder APK** | `downloads/app.apk` — tekstowy placeholder, nie binarka | Nie publikować jako release |
| M8 | **Feature graphic store 1024×1024** | Store Readiness 32B | Osobny dług go-to-market, nie runtime |

---

## Low

| ID | Problem | Dowód | Rekomendacja |
|----|---------|-------|--------------|
| L1 | **Wzorzec `*Core.js` + wrapper** | 9 core w diagnostics | Świadoma separacja CLI/UI — nie „duplikat biznesowy” |
| L2 | **`detect.js` + `polyfills.js` legacy** | małe; potrzebne dla `nomodule` | Zostawić dopóki C2 nierozstrzygnięte |
| L3 | **Emoji / `??` w side menu HTML** | `index.html` side-menu ikony | Kosmetyka a11y |
| L4 | **Duże pliki poza produktem** | Top: `_src` MP3 1.9–5.5 MB każdy | Jak H2 |
| L5 | **Nieużywane tłumaczenia (pełny orphan scan)** | Nie wykonano pełnego reverse-i18n (kosztowny); Health mierzy **braki**, nie orphany | Opcjonalny skrypt orphan-keys w przyszłości |
| L6 | **SVG** | 29 w `assets/` — heurystyka: brak oczywistych orphanów | OK |

---

## Inwentarz (fakty)

| Metryka | Wartość |
|---------|---------|
| `.js` / `.mjs` / `.css` | 146 / 143 / 30 |
| Docs `latest.*` | ~46 |
| Docs datowane (health/W*/daty) | ~53 |
| Legacy bundle | ~644 KB |
| Audio WAV | ~15.6 MB |
| Audio `_src` | ~17.8 MB |
| Audio MP3 (runtime nature) | ~1.4 MB (warstwa sezonowa + starsze pętle) |
| Asset audit unused images | **0** |
| Health CSS conflicts | ~40 |
| Health missing i18n keys | 33 |

### Top duże pliki (repo)

1. `assets/audio/nature/_src/*.mp3` (do ~5.5 MB / plik)  
2. `assets/audio/nature/*-birds.wav` / `*-forest.wav` (~1–1.7 MB)  
3. `js/legacy/app.bundle.js` (~644 KB)  
4. `css/style.css` (~164 KB)  
5. `js/translations.js` (~122 KB)  
6. `js/views/map.js` (~93 KB)

---

## Duplikaty — podsumowanie

| Typ | Stan |
|-----|------|
| **CSS** | Tak — konflikt order Home + ~40 heurystycznych konfliktów Health |
| **JS** | Częściowo — legacy bundle vs modules; Core/wrapper świadome; Region HTML dead |
| **Obrazki** | Brak nieużywanych wg `check:assets`; możliwa reduncja JPG/WebP |
| **SVG** | Brak oczywistych orphanów |
| **Audio** | Silna reduncja WAV + `_src` vs MP3 |
| **Tłumaczenia** | Braki (nie orphany) — 33 klucze |
| **Raporty** | Duża historia w `docs/` |
| **Legacy** | `detect` + `polyfills` + `app.bundle` |

---

## Czego NIE robiono w 32C

- Usuwania plików  
- Auto-fix / auto-apply  
- Refaktorów architektury  
- Pełnego orphan-scan wszystkich kluczy i18n (odłożone — L5)

---

## Priorytet sprzątania (gdy właściciel pozwoli)

1. Ujednolicić CSS fold Home (C1) — po akceptacji 32A  
2. Wyłączyć `_src` + WAV z deploy (H1–H2)  
3. Decyzja o legacy bundle (C2)  
4. Retencja starych raportów `docs/` (H6)  
5. i18n `menu.sectionDev` + meta UTF-8 (M3–M4)

---

*Koniec ETAP 32C — Technical Debt. Raport tylko do odczytu.*
