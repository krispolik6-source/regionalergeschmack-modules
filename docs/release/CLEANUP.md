# ETAP 32B — Release Cleanup

**Data:** 2026-07-22  
**Polityka:** `autoApply=false` · bez nowych funkcji · **bez zmiany wyglądu UI**  
**Cel:** konflikty CSS, martwy kod, stare bundle, nieużywane klasy, cache, warningi

---

## Werdykt

| Obszar | Stan po cleanup |
|--------|-----------------|
| Konflikty CSS Home `order` | **naprawione** (jedna prawda: `home-v1.css`) |
| Warning i18n (`menu.sectionDev` itd.) | **naprawione** (`npm run check:translations` → PASS) |
| Meta UTF-8 (mojibake `N?he`) | **naprawione** |
| Cache producers / OSM legacy | już OK (v9 / v5 + clear) · **SW bump** |
| Legacy `app.bundle.js` | **odłożone** (decyzja produktowa) |
| Masowe usuwanie nieużywanych klas CSS | **odłożone** (ryzyko wyglądu) |
| Emoji `??` w `index.html` | **odłożone** (Brand Lock / wygląd) |
| Audio WAV + `_src` | **odłożone** (deploy policy) |

---

## Zastosowane poprawki

### 1. Konflikty CSS — Home fold

**Problem:** trzy warstwy walczyły o `order` sekcji Home:
- `css/production-polish.css` (ETAP 31)
- `css/prepublish.css`
- `css/home-v1.css` (ETAP 32A — właściwa prawda)

**Zrobione:**
- Usunięto blok `order` + regułę ukrywania logo z `production-polish.css` (zostawiono typografię / install / touch).
- Usunięto blok `order` z `prepublish.css` (zostawiono gap, CTA, ads-off, map polish).
- **Źródło prawdy foldu:** `css/home-v1.css` (selektory `.home-page--v1`).

**Cache-bust:** `production-polish.css?v=3`, `prepublish.css?v=11`, `style.css?v=552`.

**Wygląd:** bez zmian względem Home 1.0 — usunięto tylko martwe / nadpisane reguły kolejności.

### 2. Warningi i18n

**Problem:** klucze `menu.sectionDev` / `tasteDiary` / `devVault` niepełne w części języków → warningi Health / `check:translations`.

**Zrobione:** w `js/translations.js` przy merge `MENU_I18N` — fallback EN dla tych trzech kluczy.

**Weryfikacja:** `npm run check:translations` → **36/36 komplet**, wymagane klucze testowe OK.

**Cache-bust:** `app.js?v=586`.

### 3. Meta / UTF-8

**Zrobione:**
- `index.html` — `description` / `og:description`: „Nähe” zamiast „N?he”.
- `landing.html` — description, og:description, title (myślnik + Nähe).
- Komentarz AdSense w `index.html` (tylko komentarz HTML).

### 4. Martwy kod (oznaczenie, bez kasowania)

| Element | Akcja |
|---------|--------|
| `buildRegionSelectOptionsHtml` (`regionPresets.js`) | `@deprecated` — UI Region usunięty z mapy; zostaje pod `check:regions` / testy |

### 5. Cache

| Warstwa | Stan |
|---------|------|
| Producers `rg_producers_data_v9` + clear v2–v8 | bez zmian (już aktywne) |
| OSM `rg_osm_overpass_cache_v5` + legacy clear | bez zmian |
| Service Worker | `CACHE_VERSION` → `rg-pwa-v25`, register `/sw.js?v=23` |
| Style / app | `style.css?v=552`, `app.js?v=586` |

---

## Odłożone (świadomie)

### D1 — Legacy bundle `js/legacy/app.bundle.js` (~644 KB)

- Ładowany przez `nomodule` w `index.html`.
- Bundle jest **stary względem źródeł** (np. wewnątrz nadal `rg_producers_data_v3`).
- **Nie usunięto** — wymaga decyzji: `npm run build:legacy` z aktualnych źródeł **albo** oficjalne wycofanie ścieżki iOS9/`nomodule`.

### D2 — Nieużywane klasy CSS

- Brak masowego purge — ryzyko regresji wizualnej i false-positive przy klasach ustawianych z JS.
- Rekomendacja: osobny etap z PurgeCSS / coverage w przeglądarce + akceptacja właściciela.

### D3 — Mojibake emoji `??` w shellu HTML (`index.html`)

- Brand Protection: **WARNING** logo / „??” przy ikonach menu.
- Naprawa przywróciłaby emoji → **zmiana wyglądu** (obecnie widać `??`).
- Wymaga akceptacji właściciela + mapy ikon (Brand Lock).

### D4 — Brand Protection WARNING (7)

- Pill radius / `lre-warm-glow` w CSS — **nie ruszano** (wygląd + Brand Lock).
- Status skanu po cleanup: **WARNING** · FAIL 0 · `autoApply=false`.

### D5 — Audio WAV + `assets/audio/nature/_src`

- ~33 MB poza krytyczną ścieżką MP3 runtime.
- Polityka deploy / `.gitignore` hostingu — poza tym etapem.

### D6 — Placeholder APK / store assets

- Go-to-market (Store Readiness), nie runtime cleanup.

---

## Weryfikacja

| Check | Wynik |
|-------|--------|
| `npm run check:translations` | ✅ PASS |
| `npm run brand-protection` | ⚠️ WARNING (7) · FAIL 0 · bez auto-fix |
| Zmiana architektury (Store / EventBus / API / GPS / Leaflet) | ❌ brak |
| Nowe funkcje | ❌ brak |

---

## Pliki zmienione

| Plik | Zmiana |
|------|--------|
| `css/production-polish.css` | usunięto konfliktujący `order` + hide brand |
| `css/prepublish.css` | usunięto konfliktujący `order` Home |
| `css/style.css` | bump importów polish / prepublish |
| `js/translations.js` | fallback EN kluczy menu dev |
| `js/data/regionPresets.js` | `@deprecated` na martwy export HTML |
| `index.html` | meta UTF-8, komentarz AdSense, cache-bust style/app/SW |
| `landing.html` | meta / title UTF-8 |
| `sw.js` | `rg-pwa-v25` |
| `docs/release/CLEANUP.md` | ten raport |

---

## Następne kroki (opcjonalne, po akceptacji)

1. `npm run build:legacy` albo usunięcie `nomodule` path.  
2. Przywrócenie emoji w shellu HTML (akceptacja Brand).  
3. Wyłączenie WAV/`_src` z deploy.  
4. Purge nieużywanych klas CSS z coverage.

→ **autoApply=false** — dalsze kasowanie / przebudowa legacy / emoji tylko po TAK właściciela.
