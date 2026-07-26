# ETAP 35B — P0 STABILITY FIX

**Data:** 2026-07-23  
**Źródło CRITICAL:** `docs/audit/ETAP-35A.md`  
**Polityka:** `autoApply=false` · `autoFix=false`  
**Werdykt:** **PASS**

---

## Werdykt

| Status | Znaczenie |
|--------|-----------|
| **PASS** | Dual ES modules = 0 · SW/manifest/ikony = `v28` · Producer Modal init bez duplikatu w Favorites · testy PWA + full-audit OK |
| **WARNING** | Pozostawione poza P0 (nie CRITICAL): image strategy, legacy bundle, Premium sticky, i18n content |
| **FAIL** | Brak |

**UX:** nie zmieniono layoutu / Home 1.0 / GPS / Premium / EventBus / Leaflet logiki.

---

## Problemy CRITICAL z 35A — status

| ID | Problem (35A) | Status 35B |
|----|---------------|------------|
| C1 | Dual `producerModal` `?v=6` vs `?v=7` | **Rozwiązane** — kanon `producerModal.js?v=7` wszędzie |
| C2 | Dual `categoryImages` plain vs `?v=6` | **Rozwiązane** — kanon `categoryImages.js?v=6` wszędzie |
| C3 | Dual `mapSettings` plain vs `?v=2` | **Rozwiązane** — kanon `mapSettings.js?v=2` wszędzie |
| C4 | SW register `?v=25` vs `CACHE_VERSION` `rg-pwa-v27` | **Rozwiązane** — wspólne `PWA_VERSION = 28` |

Skan po naprawie (`scripts` dual-module scan): **DUAL_COUNT = 0**.

---

## Co zrobiono

### 1. Jedno kanoniczne źródło ES (per moduł)

| Moduł | Kanon |
|-------|-------|
| `js/views/producerModal.js` | `?v=7` |
| `js/presentation/categoryImages.js` | `?v=6` |
| `js/map/mapSettings.js` | `?v=2` |
| `js/map/mapSettingsPanel.js` | `?v=2` (importy z map view) |
| `js/presentation/nativeAds.js` | `?v=3` |
| `js/presentation/searchFilter.js` | `?v=4` |
| `js/data/osmService.js` | `?v=9` |
| `js/map/map.js` | `?v=25` |
| `js/views/map.js` | `?v=45` |
| `js/views/home.js` | `?v=38` |
| `js/diagnostics/selfHealing.js` | plain (app.js + dynamic import w modalu — ten sam URL) |

### 2. Synchronizacja PWA / SW / manifest / cache-bust

W `sw.js`:

```js
const PWA_VERSION = '28';
const CACHE_VERSION = `rg-pwa-v${PWA_VERSION}`;
const IMAGE_CACHE = `rg-runtime-images-v${PWA_VERSION}`;
const ICON_VERSION = PWA_VERSION;
```

| Powierzchnia | Wersja |
|--------------|--------|
| `sw.js` register (`index.html`) | `?v=28` |
| `CACHE_VERSION` | `rg-pwa-v28` |
| `IMAGE_CACHE` | `rg-runtime-images-v28` |
| `ICON_VERSION` / precache ikon | `28` |
| `manifest.json` ikony + link | `?v=28` |
| `index.html` / `landing.html` ikony | `?v=28` |
| Logo refs w Home / Premium / push | `?v=28` |

### 3. Producer Modal — bez podwójnej inicjalizacji

- `initProducerModal()` jest **idempotentne** (`if (initialized) return`).
- Usunięto zbędne wywołanie z `initFavorites()` (ścieżka nieużywana przez navigation; `renderFavorites` nadal inicjuje raz).
- Wywołania w `home` / `map` (first init vs resume) pozostawione — to ścieżki alternatywne, nie podwójna rejestracja przy jednym module instance.

### 4. Importy dynamiczne / statyczne

- Dynamiczny `import('../diagnostics/selfHealing.js')` w modalu = ten sam plain URL co `app.js`.
- Dynamiczny `import('./map.js?v=45')` w Home = ten sam `?v=45` co `app.js` / `navigation.js`.
- Brak mieszanych plain/`?v=` dla krytycznych modułów (skan = 0).

---

## Testy uruchomione

| Test | Wynik |
|------|-------|
| Dual-module scan | **PASS** · DUAL_COUNT 0 |
| `node scripts/test-pwa.mjs` | **PASS** |
| `node scripts/full-audit.mjs` | **PASS** · 207 OK |
| `node --check` (favorites, producerModal, sw) | **PASS** |

### Zakres funkcjonalny (smoke / bez zmiany logiki)

| Obszar | Uwaga |
|--------|-------|
| PWA / Service Worker | wersje zsynchronizowane `28` |
| Leaflet / Mapa | bez zmiany logiki; kanoniczny `mapSettings` / `map.js` |
| GPS | nietknięte |
| Home | tylko cache-bust logo `?v=28` |
| Premium | tylko logo `?v=28` |
| Producer Modal | jedna instancja + idempotent init |

---

## Zmodyfikowane pliki

| Plik | Zmiana |
|------|--------|
| `sw.js` | `PWA_VERSION=28` · CACHE / IMAGE / ICON z jednego źródła |
| `index.html` | ikony/manifest `?v=28` · `sw.js?v=28` · `app.js?v=593` |
| `landing.html` | ikony/manifest `?v=28` |
| `manifest.json` | ikony `?v=28` |
| `js/views/home.js` | logo `?v=28` |
| `js/views/premium.js` | logo `?v=28` |
| `js/core/pushNotifications.js` | icon `?v=28` |
| `js/views/favorites.js` | usunięte podwójne `initProducerModal` z `initFavorites` |
| `js/views/producerModal.js` | komentarz: ten sam URL selfHealing |
| `js/views/map.js` | komentarz przy init (bez zmiany zachowania) |
| `docs/audit/ETAP-35B-P0-STABILITY.md` | ten raport |

*(Kanon `?v=` dla producerModal / categoryImages / mapSettings ustalony już w ETAP 35 / przed 35B — potwierdzony skanem DUAL_COUNT=0.)*

---

## Problemy rozwiązane

1. Dual ES module instances (producerModal / categoryImages / mapSettings) — **0 pozostałych**  
2. SW register vs CACHE_VERSION skew — **zsynchronizowane na 28**  
3. Manifest / ICON_VERSION / precache — **ta sama wersja 28**  
4. Podwójne `initProducerModal` w Favorites — **usunięte**  

---

## Problemy pozostawione (WARNING — nie CRITICAL / poza zakresem P0)

| Problem | Powód pozostawienia |
|---------|---------------------|
| Image fetch nadal cache-first (strategia) | Zmiana mogłaby wpłynąć na offline UX — nie w P0 CRITICAL |
| Legacy `app.bundle.js` drift | Wymaga rebuild; nie CRITICAL dual-instance w module path |
| Premium sticky flags | Logika biznesowa — zakaz zmiany Premium |
| i18n EN-placeholder langs | Content, nie stabilność runtime |
| CSS cascade wars | UX polish — nie CRITICAL modules |
| Martwy `thematicRoutes.js` | Cleanup, nie dual instance |
| UTF-8 w `home.js` / `pushNotifications.js` | Nie CRITICAL dual/SW |
| Wielokrotne wywołania `initProducerModal` z Home/Map | Idempotentne; usunięcie z Map resume mogłoby zepsuć cold path — WARNING tylko |

---

## Reguły

- `autoApply=false`  
- `autoFix=false`  
- Brak zmian UX / architektury / GPS / Premium / EventBus  

**Koniec ETAP 35B — P0 STABILITY FIX**
