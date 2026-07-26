# Pełny audit aplikacji — 2026-07-26

**Metoda:** skrypty CI + ręczna analiza kodu + 3 niezależne przeglądy (importy, runtime, UI).  
**Werdykt ogólny:** **NIE OK** — są pozycje krytyczne i błędy wymagające decyzji właściciela przed uznaniem za gotowe.

---

## Checklist weryfikacji

| Punkt | Zweryfikowano | Status |
|-------|:-------------:|--------|
| Wydajność | tak | problemy (GPS→DOM, learning) |
| Pamięć | tak | problemy (IDB, snapshoty) |
| Mobile | tak | problemy (mapa, touch) |
| Dark / light | tak | problemy kontrastu LRE |
| Regresja | tak | częściowa (favorites split, legacy) |
| Błędy JS | tak | cykle, race OSM |
| Błędy CSS | tak | `!important` light vs dark |
| Importy / zależności | tak | cykle, naruszenie warstw |
| Dead code | tak | FA, thematicRoutes, … |
| Wycieki | tak | IDB, immortal listeners |
| Async | tak | race abort OSM |
| A11y | tak | luki etykiet |
| Kontrast | tak | dark + LRE |
| Wszystkie podstrony | tak | przegląd ścieżek renderu |

---

## 🔴 Krytyczne

### K1 — Learning Engine: IndexedDB bez prune
- **Plik:** `js/presentation/learningEngine.js` (~L143–171, L294–298)
- **Problem:** `persistSignalIdb` tylko dodaje rekordy; `loadIdbSignals` robi `getAll()` i `slice(-400)` w pamięci — stare wiersze nigdy nie są usuwane.
- **Skutek:** rosnący IDB, koszt `rebuildLearningModel` na dłuższych sesjach.
- **Dowód:** brak `clear`/`delete` w store sygnałów.

### K2 — GPS: przebudowa listy producentów na każdym ticku
- **Plik:** `js/views/map.js` (~L597–601, L722–724, L932+)
- **Problem:** `LOCATION_UPDATED` → `softRefreshProducerListDistances` → sort + `innerHTML` bez progu `movedEnough`.
- **Skutek:** ciągła praca main thread przy włączonym GPS (mobile).

### K3 — Learning flood na każdym GPS fix
- **Plik:** `js/presentation/learningEngine.js` (~L457–461)
- **Problem:** każdy `LOCATION_UPDATED` → `recordLearningSignal('route')` → LS + IDB + rebuild (bez debounce).
- **Skutek:** sprzężenie z K1/K2; zużycie baterii/pamięci.

### K4 — Cykl zależności premium ↔ auth ↔ producer store
- **Pliki:** `js/core/premiumService.js` → `auth/auth.js` → `data/userProducerStore.js` → `premiumService.js`
- **Problem:** cykl ESM; ryzyko TDZ / kruchej kolejności init przy bundlowaniu.
- **Skutek:** niestabilność architektury (szczególnie `npm run build:legacy` / przyszły bundler).

### K5 — Dark mode: Home zostaje na kremie LRE
- **Plik:** `css/living-region-experience.css` L55–60 (`.home-page--v2` kremowy gradient)
- **Problem:** brak `body.dark-mode .home-page--v2` — jasna strona na ciemnym shellu.
- **Skutek:** niespójność trybu nocnego / lokalne problemy kontrastu na foldzie Home.

### K6 — Dark mode: karty hero producenta kremowe + jasny tekst
- **Plik:** `css/living-region-experience.css` L229–287 (`.producer-header-card` + `data-character=*`, tła `!important`)
- **Problem:** dark reguły (`ux-polish-1` / `prepublish`) ustawiają jasne tytuły bez przyciemnienia tych kart.
- **Skutek:** niski kontrast (jasny tekst na kremie) w modalu producenta.

---

## 🟠 Błędy

### B1 — Living Region Engine narusza czystość warstwy
- **Pliki:** `js/livingRegion/livingRegion.js` L8–11, `personalize.js` L6 → `presentation/learningEngine.js`
- **Problem:** Engine importuje moduł z `document` / `window.__RG_LEARNING__` (inicjalizacja przy `initLearningEngine`, ale zależność presentation pozostaje).
- **Kontrakt:** „tylko dane, bez DOM/views” — częściowo złamany przez warstwę presentation.

### B2 — Presentation/map importują `views/favorites` zamiast store
- **Pliki:** `js/presentation/surpriseMe.js` L10, `returnMagic.js` L11, `js/map/map.js` L10
- **Problem:** ciągnięcie całego widoku (nawigacja, modal, toast) → cykle i ciężki graf.
- **Powiązane:** `favoritesStore.js` istnieje, ale nie jest używany w tych miejscach.

### B3 — Split-brain ulubionych (3 ścieżki odczytu)
- **Pliki:** `favoritesStore.js`, `views/favorites.js`, `presentation/smartRecommend.js` (~L13–26)
- **Problem:** `smartRecommend` skanuje też stare `rg_favorites*` i „odwraca” klucze LS (nie = najnowszy).
- **Skutek:** możliwe złe rekomendacje przy gość + konto.

### B4 — Race: abort OSM vs zapis stale-cache do rejestru
- **Pliki:** `js/views/map.js` (pause/visibility abort), `js/data/dataService.js` (~L500–548), `osmService.js`
- **Problem:** abort requestu nie zawsze blokuje `applyRegistryIfCurrent` ze stale-cache; UI mapy ignoruje gen, rejestr może się zmienić.
- **Skutek:** niespójność Home/mapa po ukryciu karty / wyjściu z mapy.

### B5 — Snapshoty bez limitu (LR visit + mapChanges)
- **Pliki:** `js/livingRegion/sources/visitDelta.js`, `js/presentation/mapChanges.js`
- **Problem:** pełna lista ID (+ names/promo) bez cap; duże obszary OSM → duże wpisy LS.
- **Skutek:** ryzyko QuotaExceeded / wolniejsze odczyty.

### B6 — Push offer snapshot bez limitu kluczy
- **Plik:** `js/core/pushNotifications.js` (~L66–148)
- **Problem:** klucze per produkt/promo rosną z rejestrem.

### B7 — Font Awesome CDN bez użycia w UI
- **Plik:** `index.html` L31
- **Dowód:** brak klas `fa-*` w widokach/JS produktu.
- **Skutek:** zbędny koszt sieci/CSP; dead dependency.

### B8 — Orphan: `js/data/thematicRoutes.js`
- Brak importerów w aplikacji — martwy kod w drzewie `js/`.

### B9 — WhatsNew poza systemem layoutu kontrolek mapy
- **Przycisk:** `js/views/map.js` (~L1782, `data-map-control-id="whatsnew"`)
- **Layout:** `js/map/mapControlsDrag.js` L9–31 — tylko gps/osm/lista/legenda/suwak
- **Skutek:** przycisk zostaje w flow panelu, podczas gdy inne są absolutnie pozycjonowane → tłok / overlap na mobile.

### B10 — Touch targets mapy poniżej ~44px
- **Pliki:** `css/living-region-experience.css` (map-bottom-btn 36px / 34px), `css/prepublish.css` (`min-height: 0 !important` na `.map-bottom-btn`, zoom ~28–30px)
- **Skutek:** gorsza używalność na telefonie.

### B11 — `isLivingRegionEnabled()` — asymetria API
- **Plik:** `js/livingRegion/livingRegion.js` L46–50
- **Problem:** `initLivingRegion({ enabled: true })` nie wymusza ON (oba branch’e wołają `readConfigEnabled()`); force OFF działa.
- **Skutek:** mylący kontrakt; testy przechodzą tylko przy domyślnym config true.

### B12 — Legacy `nomodule` bundle vs favoritesStore
- **Plik:** `index.html` (script nomodule), `js/legacy/app.bundle.js`
- **Problem:** stary bundel czyta ulubione gościa bez per-user store.
- **Skutek:** rozjazd z aplikacją modułową na starych przeglądarkach.

### B13 — Data → presentation (naruszenie warstw)
- **Pliki:** `js/data/contentProducers.js` → `categoryImages`, `placeHistory.js` → `categoryIcons`

---

## 🟡 Ostrzeżenia

### O1 — Immortalne handlery EventBus / document
- `app.js`, `map.js`, `learningEngine`, diagnostics (Health/UI/Map Guardian) — `on` bez `off` (OK dla SPA lifetime, złe dla HMR/testów).
- `map.js`: `MutationObserver` na `body` bez disconnect.

### O2 — Learning model maps bez cap (LS)
- `categories` / `producers` / `products` / `searches` rosną w `rg_learning_model_v1`.

### O3 — Podwójny cache OSM + producers
- `rg_osm_overpass_cache_v5` + `rg_producers_data_v9` — overlapping payload.

### O4 — `getProducers()` kopiuje tablicę przy każdym wywołaniu
- Amplifikuje koszt przy refresh listy / LR / search.

### O5 — Diagnostyki zawsze włączone z bootu
- Health Monitor patchuje `addEventListener`/`fetch`; UI/Map Guardian intervale — koszt dla wszystkich użytkowników.

### O6 — Cykle navigation ↔ views (home/cart/modal/login…)
- Duży graf cykliczny; działa w natywnym ESM, utrudnia bundling i testy.

### O7 — Warm-summer vs ux-polish: category-count dark
- `warm-summer.css` nadal koduje krem + `#2a2218` w dark; wygrywa późniejszy ux-polish — kruche.

### O8 — Konflikty palet dark modala producenta
- `style.css` (navy), `prepublish.css` (#121f33), LRE cream cards — walka `!important`.

### O9 — A11y: braki etykiet
- Karty kategorii Home bez `aria-label` (`home.js` ~L916)
- Zdjęcia venue `alt=""` przy nazwie tylko w artykule
- Rating `aria-label` jako sama liczba
- Cart remove bez `aria-label` (tylko tekst)

### O10 — Soul label/hint bez pełnych reguł dark
- `css/region-soul.css` — label/hint słabo pokryte vs LRE soul-line

### O11 — Cart qty 32×32
- `js/views/cart.js` — poniżej rekomendowanego touch

### O12 — Home Surprise + CTA mapa
- Dodatkowa wysokość foldu na krótkich viewportach (`home-v1` + Surprise)

### O13 — Dead helpers
- `activeStorageKey()` w favorites (nieużywane), `getGuestFavoritesStorageKey` bez callerów, `livingRegion/index.js` barrel nieużywany przez app

### O14 — `package.json`
- `build` = stub echo
- `check:js` sprawdza tylko `app.js`
- Alias mismatch: `brand-protection` ≠ `check:brand-protection`

### O15 — `check:mobile-premium` 21/22
- Heurystyka „import w style.css” vs faktyczny import w `brand-stack.css`

### O16 — Engine ON + puste mapowanie → cichy fallback do pulse
- Brak sygnału diagnostycznego gdy highlights nie dadzą się zmapować

---

## 🟢 Sugestie

### S1 — Przenieść odczyt ulubionych w surprise/returnMagic/map na `favoritesStore` (wymaga akceptacji zmian importów)
### S2 — Usunąć FA CDN po akceptacji właściciela
### S3 — Cap snapshotów visit/mapChanges/push (np. top N ID)
### S4 — Debounce GPS learning + list refresh (`movedEnough`)
### S5 — Prune IDB learning (delete older than N / keep last 400)
### S6 — Zarejestrować `whatsnew` w `mapControlsDrag` **albo** nie oznaczać go jako draggable
### S7 — Dark override dla `.home-page--v2` i `.producer-header-card` (tylko kolor tła — po akceptacji CSS)
### S8 — Tree-shake / lazy diagnostics poza produkcją
### S9 — Usunąć lub podłączyć `thematicRoutes.js`
### S10 — Naprawić asymetrię `isLivingRegionEnabled`
### S11 — Odświeżyć legacy bundle albo jasno oznaczyć jako unsupported
### S12 — Category cards: `aria-label` z nazwą + liczbą

---

## Podstrony (ścieżki renderu)

| Widok | Render | Audyt UI (skrót) |
|-------|--------|------------------|
| Home | `renderHome` → `#view-home` | LRE cream w dark; Surprise; Living Region Engine/pulse |
| Mapa | `renderMap` | WhatsNew layout; touch; lista; GPS cost |
| Ulubione | `renderFavorites` | store OK; legacy rozjazd |
| Koszyk | `renderCart` | qty 32px; a11y remove |
| Profil | `renderProfile` | zależny od globalnych kart |
| Premium | `renderPremium` | dark przez shared rules |
| Modal producenta | `openProducerModal` | K6 kontrast |
| Side menu | `#sideMenu` + `sideMenu.js` | dark labels OK w ux-polish |

---

## Skrypty (pomocnicze, nie wystarczające same)

| Komenda | Wynik (ten audit) |
|---------|-------------------|
| `check:prelaunch-js` | syntax/imports OK |
| `check:functional` | 54/54 (po wcześniejszej korekcie heurystyki favorites) |
| `check:predeploy` | OK (bez HTTP) |
| `check:living-region-engine` | OK smoke |
| `check:living-region-audit` | PASS wąski — **nie pokrywa** K5/K6/B9 |
| `check:responsive` | OK |
| `check:mobile-premium` | 21/22 |
| `check:accessibility` | OK wąski (header dark toggle) |
| `brand-protection` | WARNING (0 FAIL) |

Wąskie skrypty **nie** unieważniają ustaleń ręcznych powyżej.

---

## Werdykt

**Projekt nie jest oznaczony jako OK.**

Najwyższy priorytet przed „gotowe”:
1. K1–K3 (pamięć/CPU GPS+learning)  
2. K5–K6 (kontrast dark × LRE)  
3. B4 (race OSM)  
4. B9–B10 (mapa mobile)  
5. B2–B3 (favorites warstwy)

Zgodnie z regułą architektury: **naprawy wymagające zmian importów / CSS / index.html / package.json — tylko po Twojej akceptacji propozycji.**

---

*Raport: `docs/audit/FULL-AUDIT-2026-07-26.md`*
