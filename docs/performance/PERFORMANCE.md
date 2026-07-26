# ETAP 32D — Performance

**Data:** 2026-07-22  
**Polityka:** `autoApply=false` · `autoFix=false` · **bez zmian kodu / assetów**  
**Cel:** zmniejszyć wagę aplikacji · nie zmieniać funkcji  
**Zakres:** lazy loading · audio · obrazy · cache · bundle · render · CLS · LCP

---

## Werdykt

| Metryka | Ocena |
|---------|--------|
| **Performance Score (szacunek lab)** | **44 / 100** |
| **Waga repo (assets audio+images+js+css)** | ~**48 MB** (z czego ~**33.3 MB** audio WAV+`_src` zbędne w deploy) |
| **Eager JS module graph** (`app.js` → static imports) | **~1.79 MB / 134 pliki** |
| **Funkcje** | bez zmian w tym etapie |
| **Werdykt wdrożeń** | **PWA działa**; **waga / first-load — NO-GO** na „lekki start” bez cięć deploy + defer |

Największy zysk bez ruszania funkcji: **nie hostować WAV ani `_src`**, **nie ładować Leaflet/FA na Home**, **odroczyć diagnostics**, **lazy i18n / widoki**.

---

## Inwentarz wagi

| Bucket | Pliki | Rozmiar |
|--------|------:|--------:|
| Audio nature (wszystko) | 42 | **34.70 MB** |
| → MP3 runtime (bez `_src`) | 16 | **1.35 MB** |
| → WAV (duplikat fallback) | 16 | **15.56 MB** |
| → `_src` (materiał fetcherów) | 8 | **17.78 MB** |
| Obrazy `assets/images` | 152 | **10.41 MB** |
| → WebP | 67 | 7.69 MB |
| → JPG | 57 | 2.70 MB |
| Ikony | 19 | 0.13 MB |
| CSS | 31 | 0.36 MB |
| JS (bez legacy) | 141 | 1.84 MB |
| Legacy `app.bundle.js` | 1 | **0.63 MB** |
| Diagnostics | 26 | 0.40 MB |

### Top ciężary (repo)

1. `assets/audio/nature/_src/*.mp3` (do **5.46 MB**/plik)  
2. Sezonowe `*-birds.wav` / `*-forest.wav` (~1–1.7 MB)  
3. `js/legacy/app.bundle.js` (~644 KB)  
4. `css/style.css` (~164 KB) + łańcuch `@import`  
5. `js/translations*.js` (łącznie w grafie ~**566 KB**)

---

## Checklist

| # | Obszar | Status | Score | Notatka |
|---|--------|--------|------:|---------|
| 1 | **Lazy loading** | ⚠️ Częściowo | 45 | Obrazy: często `loading="lazy"`. JS/CSS/CDN: **eager** (mapa, Leaflet, wszystkie widoki, diagnostics) |
| 2 | **Audio** | ⚠️ Ciężkie w repo | 35 | Runtime preferuje MP3 (~200 KB/sezon); WAV+`_src` ~**33 MB** niepotrzebne na hostingu |
| 3 | **Obrazy** | ✅ Dobre | 78 | WebP+`<picture>`, lazy+decoding, width/height w wielu miejscach; JPG równolegle OK jako fallback |
| 4 | **Cache** | ✅ Solidne | 82 | SW `rg-pwa-v25`: network-first code/audio, cache-first images, `safeCachePut` (bez 206) |
| 5 | **Bundle** | ❌ Słabe | 28 | Brak code-splitting produkcyjnego; eager graph **1.79 MB**; legacy 644 KB; FA CSS prawdopodobnie martwy |
| 6 | **Render** | ⚠️ | 48 | Sync Leaflet w `<head>`, `@import` waterfall CSS, Font Awesome + Google Fonts na krytycznej ścieżce |
| 7 | **CLS** | ⚠️ | 55 | Wymiary na logo/produktach pomagają; ryzyko: font-swap, climate DOM, AdSense, sekcje Home bez rezerwacji wysokości |
| 8 | **LCP** | ⚠️ | 50 | LCP ≈ tekst/marka Home; blokowane przez CSS chain + sync skrypty; brak `fetchpriority` / preload LCP |

**Średnia obszarów → 44** (zaokrąglone).

---

## 1. Lazy loading

### Jest

- `loading="lazy"` + `decoding="async"`: produkty, venue, markery, trust photos, reviews, taste diary  
- Dynamic `import('./map.js')` w jednym miejscu Home (nawigacja) — **równolegle** mapa i tak jest w eager graph przez `navigation.js` / `app.js`  
- Ambient audio: `ensurePlayers()` dopiero przy włączeniu ambientu (domyślnie off)

### Brak / problem

| Problem | Dowód |
|---------|--------|
| Wszystkie widoki importowane statycznie | `navigation.js`: home, map, premium, favorites, cart, profile |
| Mapa w cold start | `app.js` → `setSearchQuery` z `views/map.js` |
| Leaflet + MarkerCluster w `<head>` zawsze | `index.html` — nawet na Home |
| Diagnostics boot zawsze | 12× `init*` z `js/diagnostics/*` w `bootstrap()` |
| CSS `@import` waterfall | `style.css` → stacks → ~15 arkuszy experience |

**Potencjał (bez zmiany funkcji):** defer Leaflet do pierwszego `navigateTo('map')`; dynamic import widoków; diagnostics tylko `isDevMode` / po haśle.

---

## 2. Audio

| Warstwa | Użycie runtime | Deploy? |
|---------|----------------|---------|
| `*-birds.mp3` (~200 KB / sezon) | ✅ `EXT_CANDIDATES[0]` | tak |
| `*.wav` (~15.6 MB) | fallback gdy MP3 fail | **nie na prod** (opcjonalnie) |
| `_src/*.mp3` (~17.8 MB) | nie UI | **nie hostować** |
| `preload = 'auto'` | przy starcie ambientu tworzy **4** playery | tylko aktywny sezon wystarczy |

Aktywne pliki sezonowe (MP3): spring/summer/autumn/winter-birds ≈ **205–209 KB** każdy.

**Oszczędność hostingu bez zmiany UX:** ~**33 MB** (WAV + `_src`).  
**Oszczędność sieci przy ambient ON:** ładować 1 warstwę sezonu zamiast 4× `preload=auto`.

---

## 3. Obrazy

| Praktyka | Stan |
|----------|------|
| WebP + JPEG fallback (`productImage.js` `<picture>`) | ✅ |
| `loading="lazy"` / `decoding="async"` | ✅ szeroko |
| `width` / `height` na logo Home / kartach | ✅ częściowo |
| Runtime image cache SW (`rg-runtime-images-v3`) | ✅ cache-first |
| Duplikat JPG+WebP w repo | świadomy koszt (~2.7 MB JPG) |
| `npm run check:assets` (wcześniejszy dług) | 0 orphan images |

**LCP image:** brak dużego hero image — LCP raczej tekst/tytuł, nie photo. To pomaga wadze, utrudnia „image LCP” optymalizację klasyczną.

---

## 4. Cache

| Strategia | Zasób |
|-----------|--------|
| Precache | `/`, index, manifest, ikony, brand |
| Network-first | JS/CSS, audio, navigate, ikony (launcher fresh) |
| Cache-first | obrazy runtime |
| `safeCachePut` | tylko `200` + `basic` (naprawa 206) |
| Cache-bust | `?v=` na app/style/SW (`app.js?v=586`, `style.css?v=552`, SW `v25`) |
| localStorage producers/OSM | v9 / v5 + clear legacy |

**Ryzyko wagi cache urządzenia:** po włączeniu ambientu SW może zapisać MP3 (OK); WAV nie powinno trafiać do prod. Obrazy producentów rosną w `IMAGE_CACHE` — akceptowalne.

---

## 5. Bundle / JS graph

### Eager graph z `js/app.js` (static imports)

| Segment | ~KB |
|---------|----:|
| **Razem** | **1794** |
| translations* | **566** |
| diagnostics* | **323** |
| `views/map.js` + `views/home.js` | **161** |
| reszta (core, data, auth, modal…) | ~744 |

Dodatkowo (nie w module graph, ale w pierwszym dokumencie):

| Zewnętrzne | Szacunek |
|------------|----------|
| Leaflet JS+CSS + MarkerCluster | ~180–220 KB transfer |
| Font Awesome `all.min.css` (+ fonty) | ~80–300 KB — **brak klas `fa`/`fas` w HTML/JS aplikacji** → prawdopodobnie martwy koszt |
| Google Fonts (Literata + Source Sans 3) | Brand Lock — zostaje; `display=swap` już jest |
| Legacy `nomodule` bundle | 644 KB tylko stare Safari |

**Brak** produkcyjnego bundlera tree-shake / split dla ES modules (świadoma architektura PWA).

---

## 6. Render (ścieżka krytyczna)

Kolejność w `index.html` (uproszczenie):

1. Font Awesome CSS (blokujący)  
2. Google Fonts CSS (blokujący)  
3. `style.css` + `@import` waterfall (blokujący, wieloetapowy)  
4. **Leaflet + MarkerCluster sync** w `<head>` (parser-blocking)  
5. AdSense async (OK)  
6. `app.js` module → ciągnie map+home+i18n+diagnostics  

**Efekt:** opóźniony First Paint / TTI na Home mimo że mapa nie jest widoczna.

CSS: `style.css` 164 KB + experience-stack 15 `@import` + brand-stack — wiele round-tripów bez HTTP/2 push.

---

## 7. CLS (Cumulative Layout Shift)

| Czynnik | Ryzyko | Uwagi |
|---------|--------|-------|
| Logo Home `width`/`height` | niskie | `20×20` / `28×28` |
| Product / venue lazy + wymiary | niskie–średnie | często ustawione |
| Google Fonts `display=swap` | średnie | FOUT na Literata (tytuł Home) |
| `#climateAtmosphere` prepend + landscape DOM | średnie | wstrzyknięcie na `body` przy init |
| AdSense placeholder / baner | średnie | `showPlaceholder: true` |
| Dynamiczne sekcje Home (soul, living region…) | średnie | brak stałego skeleton height |
| Mapa / markery | wysokie na widoku mapy | oczekiwane; MarkerCluster pomaga CPU |

**Brak pomiaru field/lab w tym etapie** (Lighthouse nie uruchomiony) — ocena heurystyczna.

---

## 8. LCP (Largest Contentful Paint)

| Hipoteza LCP na Home | Wpływ |
|----------------------|--------|
| `.home-greeting-title` (Literata) | czeka na CSS + font |
| Brand line + małe SVG | szybkie, mało „largest” |
| Region tip / CTA | po JS render Home |

**Hamulce LCP:** sync Leaflet, FA, `@import` CSS, duży JS graph przed `renderHome`.  
**Brak:** `<link rel="preload">` na Literata / krytyczny CSS; `fetchpriority="high"` na elemencie LCP.

---

## Priorytet cięć wagi (bez zmiany funkcji)

| Rank | Działanie | Szac. zysk | Ryzyko | Funkcje |
|-----:|-----------|------------|--------|---------|
| 1 | Deploy bez `assets/audio/nature/_src` + bez `*.wav` | **~33 MB** hostingu | low | brak |
| 2 | Leaflet + MarkerCluster dopiero na widoku mapy | **~200 KB** + parse na Home | medium | brak |
| 3 | Usunąć Font Awesome jeśli potwierdzony dead CSS | **~100–300 KB** | low* | brak* |
| 4 | Diagnostics: dynamic import / tylko dev | **~323 KB** JS cold | medium | brak dla usera |
| 5 | Lazy `import()` widoków (map poza cold path) | **~100–200 KB+** earlier | medium | brak |
| 6 | i18n: ładuj aktywny język (+ fallback) | duże CPU/parse | medium–high | brak |
| 7 | Audio: 1 player sezonu, `preload="metadata"` | ~600 KB mniej przy ambient | low | brak |
| 8 | Złożyć CSS (1 plik krytyczny / mniej `@import`) | TTFB round-trips | medium | brak |
| 9 | Legacy bundle: rebuild lub drop `nomodule` | 644 KB starych clients | product | — |

\* Wymaga szybkiego potwierdzenia, że ikony UI nie polegają na FA (grep: brak `fa-` w app markup).

---

## Co już jest dobrze

- Obrazy produktowe: WebP + lazy + async decode  
- SW: rozdział code / image / audio; bump cache; brak cache 206  
- Ambient off by default → brak ściągania audio na starcie  
- Preferencja MP3 nad WAV w runtime  
- Logo / część kart ma wymiary (CLS)  
- MarkerCluster ogranicza koszt renderu mapy  

---

## Czego nie robiono w 32D

- Żadnych zmian w kodzie, CSS, SW, assetach  
- Brak Lighthouse / WebPageTest (brak URL prod w tym przebiegu)  
- Brak usuwania plików audio z dysku  

---

## Status

Raport tylko do odczytu.  
`autoApply=false` — wdrożenie cięć wagi tylko po akceptacji właściciela (szczególnie: deploy audio, defer Leaflet, FA, diagnostics).
