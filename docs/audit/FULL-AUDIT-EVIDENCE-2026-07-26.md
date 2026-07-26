# Dowody do pełnego audytu — 2026-07-26

**Zasada:** każdy wpis potwierdzony odczytem kodu. **Brak wdrożonych poprawek.**

Źródło listy: `docs/audit/FULL-AUDIT-2026-07-26.md`

---

## 🔴 K1 — Learning Engine: IndexedDB bez prune

1. **Problem.** Sygnały learning są tylko dokładane do IndexedDB; odczyt bierze `getAll()` i obcina w pamięci — stare rekordy nie są usuwane z bazy.
2. **Plik.** `js/presentation/learningEngine.js`
3. **Linia.** 143–156 (zapis), 158–169 (odczyt)
4. **Fragment kodu.**
```143:169:js/presentation/learningEngine.js
async function persistSignalIdb(signal) {
    try {
        const db = await openIdb();
        await new Promise((resolve, reject) => {
            const tx = db.transaction(IDB_STORE, 'readwrite');
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
            tx.objectStore(IDB_STORE).add(signal);
        });
        db.close();
    } catch {
        /* fallback LS only */
    }
}

async function loadIdbSignals(limit = 400) {
    try {
        const db = await openIdb();
        const rows = await new Promise((resolve, reject) => {
            const tx = db.transaction(IDB_STORE, 'readonly');
            const req = tx.objectStore(IDB_STORE).getAll();
            req.onsuccess = () => resolve(req.result || []);
            // ...
        });
        db.close();
        return rows.slice(-limit);
```
5. **Dlaczego.** Brak `delete`/`clear` — baza rośnie bez limitu; `slice` nie czyści store.
6. **Skutki.** Rosnący IDB, wolniejsze `getAll` + rebuild modelu przy długim użytkowaniu.
7. **🔴 Błąd krytyczny**
8. **Poprawka:** zmiana wydajności / pamięci (prune IDB). Bez UI. Bez przebudowy architektury produktu — lokalna zmiana w learningEngine. **Nie „całkowicie bezpieczna”** (trzeba nie skasować potrzebnych sygnałów).

---

## 🔴 K2 — GPS: przebudowa listy producentów na każdym ticku

1. **Problem.** Przy każdym `LOCATION_UPDATED` wywoływane jest `softRefreshProducerListDistances()` → `refreshProducerList` z `innerHTML`, niezależnie od `movedEnough`.
2. **Plik.** `js/views/map.js`
3. **Linia.** 722–724, 932–934, 867–903
4. **Fragment kodu.**
```722:724:js/views/map.js
eventBus.on(EVENTS.LOCATION_UPDATED, ({ lat, lng, movedEnough }) => {
    // Odległości / kolejność listy – na żywo, bez przebudowy markerów
    softRefreshProducerListDistances();
```
```932:934:js/views/map.js
function softRefreshProducerListDistances() {
    if (!leafletMap) return;
    refreshProducerList(getVisibleProducers());
}
```
(`refreshProducerList` ustawia `list.innerHTML` — L867–903.)
5. **Dlaczego.** `movedEnough` ogranicza tylko OSM (L726+), nie odświeżenie listy HTML.
6. **Skutki.** Częsta praca main thread / layout na mobile przy Live GPS.
7. **🔴 Błąd krytyczny** (wydajność runtime)
8. **Poprawka:** zmiana wydajności (gate / throttle). Minimalna zmiana logiki mapy — **nie** wymaga nowej architektury Store; **nie** UI layout. Średnie ryzyko regresji odległości na liście.

---

## 🔴 K3 — Learning flood na każdym GPS fix

1. **Problem.** Każdy `LOCATION_UPDATED` zapisuje sygnał `route` (bez debounce / `movedEnough`).
2. **Plik.** `js/presentation/learningEngine.js`
3. **Linia.** 457–461
4. **Fragment kodu.**
```457:461:js/presentation/learningEngine.js
    eventBus.on(EVENTS.LOCATION_UPDATED, (payload) => {
        const grid = gridCoord(payload?.lat ?? payload?.latitude, payload?.lng ?? payload?.longitude);
        if (grid) {
            recordLearningSignal('route', { grid, at: Date.now() });
        }
    });
```
5. **Dlaczego.** Emit GPS (map.js L597–600) niesie `movedEnough`, ale learning go ignoruje → każdy tick = LS + IDB + schedule rebuild.
6. **Skutki.** Wzmacnia K1; zbędne I/O i CPU przy trackingu.
7. **🔴 Błąd krytyczny**
8. **Poprawka:** zmiana wydajności (debounce / `movedEnough`). Bezpieczna lokalnie, jeśli zachować sens tras.

---

## 🔴 K4 — Cykl premium ↔ auth ↔ userProducerStore

1. **Problem.** Zamknięty cykl importów ESM między trzema modułami.
2. **Pliki.** `js/core/premiumService.js`, `js/auth/auth.js`, `js/data/userProducerStore.js`
3. **Linie.** premium L5; auth L5, L12; userProducerStore L7
4. **Fragment kodu.**
```5:5:js/core/premiumService.js
import { getCurrentUser, isProducer } from '../auth/auth.js';
```
```5:12:js/auth/auth.js
import { initProducerAccount } from '../data/userProducerStore.js';
// ...
import { extendPremiumMonths } from '../core/premiumService.js';
```
```7:7:js/data/userProducerStore.js
import { isProducerPromoted } from '../core/premiumService.js';
```
5. **Dlaczego.** Cykl zależności = krucha kolejność inicjalizacji / ryzyko TDZ przy bundlingu.
6. **Skutki.** Trudniejszy build/legacy; potencjalne partial bindings.
7. **🔴 Błąd krytyczny** (architektura)
8. **Poprawka:** **wymaga zmiany architektury / refaktoryzacji importów.** Nie UI. Nie „całkowicie bezpieczna”.

---

## 🔴 K5 — Dark: Home `.home-page--v2` zostaje kremowe

1. **Problem.** LRE wymusza kremowy gradient tła Home; brak override `body.dark-mode .home-page--v2`.
2. **Plik.** `css/living-region-experience.css`
3. **Linia.** 55–60
4. **Fragment kodu.**
```55:60:css/living-region-experience.css
.home-page--v2 {
    gap: 14px !important;
    background:
        radial-gradient(ellipse 90% 40% at 50% -5%, rgba(240, 197, 110, 0.16) 0%, transparent 55%),
        radial-gradient(ellipse 70% 30% at 100% 20%, rgba(90, 122, 69, 0.06) 0%, transparent 50%),
        linear-gradient(180deg, var(--lre-cream) 0%, #faf3e6 40%, #f5ebd8 100%);
}
```
5. **Dlaczego.** Grep: zero dopasowań `body.dark-mode .home-page--v2` w `css/`.
6. **Skutki.** W trybie nocnym Home wygląda jak „jasna karta” na ciemnym shellu; niespójność dark mode.
7. **🔴 Błąd krytyczny** (kontrast / dark)
8. **Poprawka:** zmiana UI/CSS (tylko kolor tła w dark). **Wymaga akceptacji** (CSS). Relatywnie bezpieczna, jeśli tylko dark selector.

---

## 🔴 K6 — Dark: hero producenta krem + jasny tekst

1. **Problem.** Karty nagłówka producenta mają jasne tła `!important`; dark ustawia jasny kolor nazwy bez przyciemnienia tła karty.
2. **Pliki.** `css/living-region-experience.css`, `css/ux-polish-1.css`
3. **Linie.** LRE 229–237, 244–287; ux-polish 310–312
4. **Fragment kodu.**
```229:237:css/living-region-experience.css
.producer-header-card {
    margin-top: 0 !important;
    position: relative;
    z-index: 1;
    padding-left: 16px;
    background: linear-gradient(180deg, rgba(255, 248, 238, 0.96), var(--lre-cream)) !important;
    border: 1px solid rgba(140, 110, 60, 0.12) !important;
    box-shadow: 0 8px 24px var(--lre-shadow) !important;
}
```
```310:312:css/ux-polish-1.css
body.dark-mode .producer-modal .producer-header-name,
body.dark-mode .producer-modal .producer-section-title {
    color: #f5efe3 !important;
}
```
5. **Dlaczego.** Jasny tekst (`#f5efe3`) na kremowym tle karty = niski kontrast.
6. **Skutki.** Słaba czytelność nazwy producenta w dark.
7. **🔴 Błąd krytyczny**
8. **Poprawka:** zmiana UI/CSS (tło karty w dark lub kolor tekstu na ciemny atrament na kremie). Wymaga akceptacji CSS. Nie architektura Store.

---

## 🟠 B1 — Living Region Engine → learningEngine (presentation)

1. **Problem.** Silnik „tylko dane” importuje `presentation/learningEngine.js`, który wiąże DOM/`window` przy init.
2. **Plik.** `js/livingRegion/livingRegion.js` (+ `personalize.js`)
3. **Linia.** 11; learningEngine 465–496
4. **Fragment kodu.**
```8:11:js/livingRegion/livingRegion.js
import { getFavoriteIds } from '../core/favoritesStore.js';
import { getRecentlyViewedIds } from '../core/userHistory.js';
import { getProducerById } from '../data/dataService.js';
import { getLearningModel } from '../presentation/learningEngine.js';
```
```465:484:js/presentation/learningEngine.js
    document.addEventListener('visibilitychange', () => {
        // ...
    });
}
export function initLearningEngine() {
    // ...
    window.__RG_LEARNING__ = {
```
5. **Dlaczego.** Narusza kontrakt warstwy Engine (zależność od presentation z efektami ubocznymi DOM).
6. **Skutki.** Silniejszy graf zależności; trudniej testować Engine w izolacji; sprzeczność z deklaracją w nagłówku pliku.
7. **🟠 Błąd**
8. **Poprawka:** **refaktoryzacja / zmiana importów** (wydzielić czysty odczyt modelu lub DI). Wymaga akceptacji architektury.

---

## 🟠 B2 — Presentation/map → `views/favorites`

1. **Problem.** Warstwa presentation/map importuje widok ulubionych zamiast `favoritesStore`.
2. **Pliki.** `js/presentation/surpriseMe.js`, `returnMagic.js`, `js/map/map.js`
3. **Linie.** surpriseMe L10; returnMagic L11; map.js L10
4. **Fragment kodu.**
```10:10:js/presentation/surpriseMe.js
import { getFavoriteIds } from '../views/favorites.js';
```
```11:11:js/presentation/returnMagic.js
import { getFavoriteIds } from '../views/favorites.js';
```
```10:10:js/map/map.js
import { isFavorite } from '../views/favorites.js';
```
5. **Dlaczego.** Widok ciągnie nawigację/modal/toast → cykle i ciężki import.
6. **Skutki.** Większy graf, utrudniony bundling, naruszenie warstw.
7. **🟠 Błąd**
8. **Poprawka:** **zmiana importów** (na `favoritesStore`). Wymaga akceptacji. Niska zmiana UI; ryzyko regresji ulubionych na mapie.

---

## 🟠 B3 — Split-brain odczytu ulubionych

1. **Problem.** `smartRecommend` czyta LS własną heurystyką (w tym martwe `rg_favorites*`), nie przez store.
2. **Plik.** `js/presentation/smartRecommend.js`
3. **Linia.** 13–26
4. **Fragment kodu.**
```13:21:js/presentation/smartRecommend.js
function readFavoriteIdsSafe() {
    try {
        const keys = Object.keys(localStorage).filter((k) => k === 'rg_favorites' || k.startsWith('rg_favorites__')
            || k === 'regionalny_smak_favorites' || k.startsWith('regionalny_smak_favorites'));
        // Prefer newest non-empty list
        for (const key of keys.reverse()) {
            const raw = localStorage.getItem(key);
            const list = raw ? JSON.parse(raw) : [];
            if (Array.isArray(list) && list.length) return list.map(String);
```
5. **Dlaczego.** `keys.reverse()` ≠ „najnowszy”; możliwe wybranie listy gościa zamiast konta; stare klucze `rg_favorites*`.
6. **Skutki.** Błędne rankingi „dla Ciebie” / boost ulubionych.
7. **🟠 Błąd**
8. **Poprawka:** zmiana importów/logiki (użyć store). Wymaga akceptacji. Bez UI.

---

## 🟠 B4 — Race: abort OSM vs stale-cache registry

1. **Problem.** Ukrycie karty abortuje OSM i podbija `dataFetchGeneration`, ale **nie** `registryEpoch`; catch w dataService przy tym samym epoch może zapisać stale-cache do rejestru.
2. **Pliki.** `js/views/map.js`, `js/data/dataService.js`
3. **Linie.** map 2364–2377; dataService 524–548
4. **Fragment kodu.**
```2364:2377:js/views/map.js
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearGeoWatch();
            // ...
            dataFetchGeneration += 1;
            try {
                abortInflightOsmRequests();
            } catch (_) {
                /* ignore */
            }
```
```524:548:js/data/dataService.js
        } catch (error) {
            if (epoch !== registryEpoch) {
                return { /* stale-superseded */ };
            }
            // ...
            const staleCache = readStaleCache();
            if (staleCache?.producers?.length) {
                // ...
                    return applyRegistryIfCurrent(epoch, enriched, {
                        source: 'stale-cache',
                        fromCache: true,
                        apiFailed: true
                    });
```
5. **Dlaczego.** Abort ≠ bump `registryEpoch` → catch może nadal `applyRegistryIfCurrent`.
6. **Skutki.** Podmiana listy producentów w tle mimo anulowania fetch UI.
7. **🟠 Błąd**
8. **Poprawka:** zmiana logiki async/data (epoch przy abort). **Refaktoryzacja ścieżki danych** — nie UI. Wymaga ostrożnych testów. Nie całkowicie bezpieczna.

---

## 🟠 B5 — Snapshoty bez limitu (LR visit + mapChanges)

1. **Problem.** Snapshoty zapisują pełną pulę ID (i names/promo) bez cap.
2. **Pliki.** `js/livingRegion/sources/visitDelta.js`, `js/presentation/mapChanges.js`
3. **Linie.** visitDelta 22–34, 50–53, 106; mapChanges 37–53, 68–70
4. **Fragment kodu.**
```22:34:js/livingRegion/sources/visitDelta.js
function buildSnapshot(producers) {
    const producerIds = [];
    const promoKeys = [];
    for (const p of producers) {
        if (!p?.id) continue;
        producerIds.push(String(p.id));
        promoKeys.push(...promoKeysFor(p));
    }
    return {
        at: Date.now(),
        producerIds,
        promoKeys: [...new Set(promoKeys)]
    };
}
```
```37:53:js/presentation/mapChanges.js
function buildSnapshot(producers = []) {
    const producerIds = [];
    const names = {};
    const promoKeys = [];
    for (const p of producers) {
        if (!p?.id) continue;
        const id = String(p.id);
        producerIds.push(id);
        names[id] = String(p.name || id).slice(0, 80);
        promoKeys.push(...promoKeysFor(p));
    }
    return { at: Date.now(), producerIds, names, promoKeys: [...new Set(promoKeys)] };
}
```
5. **Dlaczego.** Brak `slice`/limitu przy zapisie pełnej puli OSM.
6. **Skutki.** Duże wpisy LS, ryzyko QuotaExceeded.
7. **🟠 Błąd**
8. **Poprawka:** zmiana wydajności/pamięci (cap). Lokalna, raczej bezpieczna przy zachowaniu semantyki delty.

---

## 🟠 B6 — Push offer snapshot bez limitu

1. **Problem.** `collectOfferKeys` buduje Set JSON-kluczy per producent/produkt; `writeSnapshot` zapisuje całość.
2. **Plik.** `js/core/pushNotifications.js`
3. **Linia.** 66–70, 73–99
4. **Fragment kodu.**
```66:70:js/core/pushNotifications.js
function writeSnapshot(keys) {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify({
        keys: [...keys],
        updatedAt: Date.now()
    }));
}
```
```73:99:js/core/pushNotifications.js
export function collectOfferKeys(producers) {
    const keys = new Set();
    for (const producer of producers || []) {
        // ...
        for (const product of producer.products || []) {
            keys.add(JSON.stringify({ type: 'product', /* ... */ }));
```
5. **Dlaczego.** Skalowanie O(producers × products) bez limitu w LS.
6. **Skutki.** Duży LS; wolniejsze porównania ofert.
7. **🟠 Błąd**
8. **Poprawka:** wydajność/pamięć (limit kluczy). Bez UI. Średnie ryzyko (mogą umknąć niektóre powiadomienia).

---

## 🟠 B7 — Font Awesome CDN bez użycia

1. **Problem.** Ładowany FA CSS; brak klas `fa-*` w kodzie produktu.
2. **Plik.** `index.html`
3. **Linia.** 31
4. **Fragment kodu.**
```31:31:index.html
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer">
```
5. **Dlaczego.** Grep po `fa-` / `fa-solid` w widokach — brak użycia UI; tylko ten link.
6. **Skutki.** Zbędny request sieciowy, koszt CSP/parse CSS.
7. **🟠 Błąd** (dead dependency)
8. **Poprawka:** zmiana `index.html` (+ ewentualnie CSP). **Wymaga akceptacji** (reguła architektury). Bezpieczna po weryfikacji braku FA.

---

## 🟠 B8 — Orphan `thematicRoutes.js`

1. **Problem.** Moduł eksportuje API, ale nic w app go nie importuje.
2. **Plik.** `js/data/thematicRoutes.js`
3. **Linia.** 81–107 (eksporty); brak importerów poza sobą (grep w `js/`)
4. **Fragment kodu.**
```81:107:js/data/thematicRoutes.js
export function getThematicRouteStops(routeId, options = {}) {
// ...
export function getThematicRouteMapsUrl(routeId, options = {}) {
    const stops = getThematicRouteStops(routeId, options);
// ...
export default {
    getThematicRouteStops,
    getThematicRouteMapsUrl
};
```
5. **Dlaczego.** Dead code w drzewie runtime (nieosiągalny z `app.js`).
6. **Skutki.** Szum utrzymaniowy; myląca powierzchnia API.
7. **🟠 Błąd** (dead code) — albo **🟡** jeśli traktować jako przyszłą funkcję; potwierdzony brak importerów → **🟠**
8. **Poprawka:** usunięcie lub podłączenie — **refaktoryzacja / decyzja produktowa**. Wymaga akceptacji.

---

## 🟠 B9 — WhatsNew poza layoutem kontrolek mapy

1. **Problem.** Przycisk ma `data-map-control-id="whatsnew"`, ale layout drag zna tylko gps/osm/lista/legenda/suwak.
2. **Pliki.** `js/views/map.js`, `js/map/mapControlsDrag.js`
3. **Linie.** map 1782–1784; mapControlsDrag 9–31
4. **Fragment kodu.**
```1782:1784:js/views/map.js
                <button type="button" id="mapWhatsNewBtn" class="map-bottom-btn map-draggable-control" data-map-control-id="whatsnew" aria-label="${t('map.whatsNew')}">
                    <span class="map-btn-emoji" aria-hidden="true">🔄</span> ${t('map.whatsNew')}
                </button>
```
```9:31:js/map/mapControlsDrag.js
const DEFAULT_POSITIONS = Object.freeze({
    gps: { x: 2, y: 82 },
    osm: { x: 16, y: 82 },
    lista: { x: 32, y: 82 },
    legenda: { x: 68, y: 82 },
    suwak: { x: 2, y: 70 }
});
const CONTROL_SELECTORS = {
    gps: '#mapGpsBtn',
    osm: '#mapOsmBtn',
    lista: '#mapProducerList',
    legenda: '#mapLegendWrap',
    suwak: '#radiusControl'
};
```
5. **Dlaczego.** WhatsNew nie dostaje `applyControlLayout` → zostaje w flow panelu, gdy inne są absolutnie pozycjonowane.
6. **Skutki.** Tłok / overlap na mobile.
7. **🟠 Błąd**
8. **Poprawka:** zmiana UI/layout mapy (dodać do layoutu **lub** usunąć klasę draggable). Wymaga akceptacji. Nie Store.

---

## 🟠 B10 — Touch targets mapy &lt; ~44px

1. **Problem.** `.map-bottom-btn` ma `min-height: 36px` / `34px` oraz `min-height: 0 !important` z prepublish; zoom 28×28.
2. **Pliki.** `css/living-region-experience.css`, `css/prepublish.css`
3. **Linie.** LRE 302–303, 503–504; prepublish 144–163
4. **Fragment kodu.**
```302:303:css/living-region-experience.css
.map-bottom-btn {
    min-height: 36px !important;
```
```144:163:css/prepublish.css
.map-bottom-btn {
    padding: 5px 10px !important;
    font-size: 12px !important;
    font-weight: 600;
    min-height: 0 !important;
}
[data-view-panel='map'] .leaflet-control-zoom a {
    width: 28px !important;
    height: 28px !important;
```
5. **Dlaczego.** Poniżej typowego minimum ~44px dla celów dotykowych.
6. **Skutki.** Trudniejsze trafianie przycisków na telefonie.
7. **🟠 Błąd**
8. **Poprawka:** zmiana UI/CSS. Wymaga akceptacji. Ryzyko przepełnienia panelu mapy.

---

## 🟠 B11 — Asymetria `isLivingRegionEnabled`

1. **Problem.** `enabled: true` i gałąź domyślna robią to samo — nie da się wymusić ON ponad config/LS.
2. **Plik.** `js/livingRegion/livingRegion.js`
3. **Linia.** 46–50
4. **Fragment kodu.**
```46:50:js/livingRegion/livingRegion.js
export function isLivingRegionEnabled() {
    if (runtimeEnabled === false) return false;
    if (runtimeEnabled === true) return readConfigEnabled();
    return readConfigEnabled();
}
```
5. **Dlaczego.** Force-OFF działa; force-ON nie nadpisuje `readConfigEnabled()`.
6. **Skutki.** Mylący API; trudniejsze testy/diagnostyka.
7. **🟠 Błąd**
8. **Poprawka:** mała zmiana logiki flagi. **Całkowicie bezpieczna** przy jasnej semantyce. Bez UI.

---

## 🟠 B12 — Legacy bundle vs favoritesStore

1. **Problem.** `nomodule` bundle liczy ulubione z gościnnego klucza LS, bez per-user store.
2. **Pliki.** `index.html`, `js/legacy/app.bundle.js`
3. **Linie.** index 564; bundle 7035–7041
4. **Fragment kodu.**
```564:564:index.html
    <script nomodule src="/js/legacy/app.bundle.js?v=27"></script>
```
```7035:7041:js/legacy/app.bundle.js
  var FAVORITES_STORAGE_KEY = "regionalny_smak_favorites";
  function getFavoritesCount() {
    try {
      const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list.length : 0;
```
5. **Dlaczego.** Modułowa app używa `favoritesStore` z kluczem użytkownika; legacy — tylko bazowy klucz.
6. **Skutki.** Rozjazd liczby ulubionych na starych przeglądarkach po logowaniu.
7. **🟠 Błąd**
8. **Poprawka:** rebuild legacy **lub** oznaczenie unsupported — **zmiana build / index**. Wymaga akceptacji.

---

## 🟠 B13 — Data → presentation

1. **Problem.** Warstwa `data/` importuje `presentation/`.
2. **Plik.** `js/data/contentProducers.js`
3. **Linia.** 3–4
4. **Fragment kodu.**
```3:4:js/data/contentProducers.js
import { getProductImageUrl } from './productImages.js';
import { getCategoryImage } from '../presentation/categoryImages.js?v=6';
```
5. **Dlaczego.** Odwrócona zależność warstw (data nie powinno zależeć od presentation).
6. **Skutki.** Cięższy graf; trudniejsza izolacja danych.
7. **🟠 Błąd** (architektura warstw)
8. **Poprawka:** **refaktoryzacja / zmiana importów.** Wymaga akceptacji.

---

## 🟡 O1 — Immortalne handlery EventBus / document

1. **Problem.** Wiele `eventBus.on` / `document.addEventListener` bez `off` (lifetime SPA).
2. **Przykład pliku.** `js/presentation/learningEngine.js`
3. **Linia.** 457–470
4. **Fragment.**
```457:470:js/presentation/learningEngine.js
    eventBus.on(EVENTS.LOCATION_UPDATED, (payload) => { /* ... */ });
    document.addEventListener('visibilitychange', () => { /* ... */ });
```
5. **Dlaczego.** Brak teardown — OK w jednej sesji SPA, problem przy HMR/testach/wielokrotnym init.
6. **Skutki.** Potencjalne podwójne handlery przy błędnym re-init.
7. **🟡 Ostrzeżenie**
8. **Poprawka:** refaktoryzacja lifecycle. Nie UI. Wymaga akceptacji przy szerszym sprzątaniu.

---

## 🟡 O2 — Learning model maps bez cap (LS)

1. **Problem.** Mapy `categories`/`producers`/`products`/`searches` w modelu tylko rosną (`bump`).
2. **Plik.** `js/presentation/learningEngine.js` (budowa modelu ~L178–245; persist modelu)
3. **Linia.** (model build — potwierdzone w audycie runtime; events LS ma `MAX_EVENTS_LS`, mapy nie)
4. **Fragment.** (struktura empty model + bump — bez prune kluczy)
5. **Dlaczego.** Unikalne ID z czasem powiększają `rg_learning_model_v1`.
6. **Skutki.** Wolniejszy parse LS przy dużym modelu.
7. **🟡 Ostrzeżenie**
8. **Poprawka:** wydajność (cap top-N). Bezpieczna przy ostrożnym limicie.

---

## 🟡 O3 — Podwójny cache OSM + producers

1. **Problem.** Dwa magazyny overlapping: OSM cache + producers data cache.
2. **Pliki.** `js/data/osmService.js`, `js/data/dataService.js` (klucze cache)
3. **Dowód.** Obecność obu ścieżek zapisu (potwierdzone w audycie runtime).
4. **Dlaczego.** Duplikacja JSON w LS.
5. **Skutki.** Większe zużycie storage / cold parse.
6. **🟡 Ostrzeżenie**
7. **Poprawka:** architektura cache — **wymaga akceptacji**.

---

## 🟡 O4 — `getProducers()` kopiuje tablicę

1. **Problem.** Każde wywołanie zwraca shallow copy całego rejestru.
2. **Plik.** `js/data/dataService.js`
3. **Linia.** 75–77
4. **Fragment.**
```75:77:js/data/dataService.js
export function getProducers() {
    return [...producersRegistry];
}
```
5. **Dlaczego.** Hot path (lista mapy, LR, search) płaci kopiowanie O(n).
6. **Skutki.** Extra GC/CPU przy częstych wywołaniach (wzmocnienie K2).
7. **🟡 Ostrzeżenie**
8. **Poprawka:** wydajność (readonly export / cache). **Refaktoryzacja API** — wymaga akceptacji (ryzyko mutacji registry).

---

## 🟡 O5 — Diagnostyki na cold path

1. **Problem.** `app.js` startuje Health/UI/Map Guardian + Learning itd. dla wszystkich.
2. **Plik.** `js/app.js`
3. **Linia.** ~213–227 (initHealthMonitor, initUiGuardian, initMapGuardian, initLearningEngine)
4. **Dlaczego.** Intervale + patch `fetch`/`addEventListener` w produkcji.
5. **Skutki.** Koszt CPU/baterii; szersza powierzchnia błędów.
6. **🟡 Ostrzeżenie**
7. **Poprawka:** architektura boot (feature flag) — wymaga akceptacji.

---

## 🟡 O9 — A11y: karty kategorii bez aria-label

1. **Problem.** Przycisk kategorii ma widoczny tekst, ale ikona `aria-hidden`; brak zbiorczego `aria-label`.
2. **Plik.** `js/views/home.js`
3. **Linia.** 916–920
4. **Fragment.**
```916:920:js/views/home.js
        <button type="button" class="category-card category-card--tile category-card--photo" data-category="${id}">
            <span class="category-card-scrim" aria-hidden="true"></span>
            <span class="category-icon" aria-hidden="true">${icon}</span>
            <span class="category-name">${escapeHtml(name)}</span>
            <span class="category-count">${escapeHtml(countLabel)}</span>
```
5. **Dlaczego.** Reader zwykle czyta name+count, ale brak jawnego `aria-label` / nazwy dostępnej przy złożonym tile.
6. **Skutki.** Słabsza a11y na custom tile.
7. **🟡 Ostrzeżenie**
8. **Poprawka:** zmiana HTML atrybutu (UI a11y). Wymaga akceptacji drobnej zmiany markupu.

---

## 🟡 O11 — Cart qty 32×32

1. **Problem.** Przyciski ilości w koszyku mają 32×32 px.
2. **Plik.** `js/views/cart.js`
3. **Linia.** 75
4. **Fragment.**
```75:75:js/views/cart.js
        .cart-qty button { width: 32px; height: 32px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: var(--bg-card); font-size: var(--text-lg); }
```
5. **Dlaczego.** Poniżej ~44px touch target.
6. **Skutki.** Trudniejsze kliknięcie na mobile.
7. **🟡 Ostrzeżenie**
8. **Poprawka:** zmiana UI/CSS wstrzykniętego stylu. Wymaga akceptacji.

---

## 🟡 O14 — `package.json` stub build / check:js

1. **Problem.** `build` nic nie buduje; `check:js` sprawdza tylko jeden plik.
2. **Plik.** `package.json`
3. **Linia.** 10, 37
4. **Fragment.**
```10:10:package.json
    "build": "echo 'Build not configured yet'",
```
(oraz `"check:js": "node --check js/app.js"`)
5. **Dlaczego.** Fałszywe poczucie „build/check OK”.
6. **Skutki.** Luki w CI.
7. **🟡 Ostrzeżenie**
8. **Poprawka:** zmiana `package.json` — **wymaga akceptacji**.

---

## 🟡 O6 — Cykle navigation ↔ views

1. **Problem.** `navigation` importuje widoki; `cart` (i inne) importują `navigation` → cykl.
2. **Pliki.** `js/controllers/navigation.js`, `js/views/cart.js`
3. **Linie.** navigation L5–9; cart L6
4. **Fragment.**
```5:9:js/controllers/navigation.js
import { renderHome } from '../views/home.js?v=43';
// ...
import { renderCart, refreshCartBadge } from '../views/cart.js';
```
```6:6:js/views/cart.js
import { navigateTo } from '../controllers/navigation.js';
```
5. **Dlaczego.** Cykl ESM utrudnia bundling i izolację.
6. **Skutki.** Kruchość grafu zależności.
7. **🟡 Ostrzeżenie**
8. **Poprawka:** refaktoryzacja nawigacji (EventBus-only) — **zmiana architektury**, wymaga akceptacji.

---

## 🟡 O7 — Warm-summer dark category-count

1. **Problem.** W dark wymuszany kremowy badge + ciemny tekst; może kolidować z późniejszymi regułami.
2. **Plik.** `css/warm-summer.css`
3. **Linia.** 319–321
4. **Fragment.**
```319:321:css/warm-summer.css
body.dark-mode .category-card--photo .category-count {
    background: rgba(255, 248, 235, 0.9) !important;
    color: #2a2218 !important;
}
```
5. **Dlaczego.** `!important` w dark z jasnym tłem — kruche względem kolejności CSS (ux-polish też celuje w ten selektor).
6. **Skutki.** Niespójny wygląd badge przy zmianie kolejności arkuszy.
7. **🟡 Ostrzeżenie**
8. **Poprawka:** CSS — wymaga akceptacji.

---

## 🟡 O8 — Konflikty palet dark modala producenta

1. **Problem.** Różne warstwy dark (navy / #121f33 / krem LRE) walczą `!important`.
2. **Dowód powiązany.** K6 (LRE cream cards) + ux-polish jasne tytuły L310–312 + prepublish dark modal backgrounds (osobny plik).
3. **Dlaczego.** Brak jednej powierzchni prawdy dla dark modala.
4. **Skutki.** Niespójny chrome / kontrast.
5. **🟡 Ostrzeżenie** (skutek uboczny K6)
6. **Poprawka:** CSS / UI — wymaga akceptacji.

---

## 🟡 O10 — Soul label/hint bez pełnego dark

1. **Problem.** Label/hint używają `--color-primary` / muted; brak dedykowanych reguł dark dla label/hint (w przeciwieństwie do linii w LRE).
2. **Plik.** `css/region-soul.css`
3. **Linia.** 75–98
4. **Fragment.**
```75:98:css/region-soul.css
.home-region-soul-label {
    /* ... */
    color: var(--color-primary, #4f6b3c);
}
.home-region-soul-hint {
    /* ... */
    color: var(--color-text-muted);
}
```
5. **Dlaczego.** Zależność od tokenów; przy kremowym tle sekcji w dark (K5) czytelność bywa nierówna.
6. **Skutki.** Słabszy kontrast etykiet sekcji.
7. **🟡 Ostrzeżenie**
8. **Poprawka:** CSS — wymaga akceptacji.

---

## 🟡 O12 — Home Surprise + CTA (wysokość foldu)

1. **Problem.** Dwa pełnoszerokościowe CTA (mapa + Surprise) zwiększają wysokość pierwszego ekranu.
2. **Plik.** `js/views/home.js` (markup), `css/home-v1.css` (stack)
3. **Dowód.** Sekcja `home-actions--primary-only` z `#findNearbyBtn` + `#homeSurpriseBtn` (home.js ~1080+); `home-v1.css` gap + min-height 52/44.
4. **Dlaczego.** Krótki viewport — mniej treści poniżej foldu.
5. **Skutki.** Więcej scrolla na mobile.
6. **🟡 Ostrzeżenie**
7. **Poprawka:** UI — wymaga akceptacji.

---

## 🟡 O13 — Dead helpers favorites

1. **Problem.** `activeStorageKey()` w favorites view nieużywane po extract store.
2. **Plik.** `js/views/favorites.js`
3. **Linia.** 41–43
4. **Fragment.**
```41:43:js/views/favorites.js
function activeStorageKey() {
    return favoritesStorageKey();
}
```
5. **Dlaczego.** Brak wywołań (po delegacji do store).
6. **Skutki.** Szum / mylący kod.
7. **🟡 Ostrzeżenie**
8. **Poprawka:** usunięcie — refaktoryzacja kosmetyczna, wymaga akceptacji.

---

## 🟡 O15 — mobile-premium 21/22

1. **Problem.** Audit szuka `@import` w `style.css`; faktyczny import jest w `brand-stack.css`.
2. **Plik.** `css/brand-stack.css` L6 (`mobile-premium.css?v=2`); heurystyka w `scripts/mobile-premium-audit.mjs`
3. **Dlaczego.** Fałszywy FAIL narzędzia, nie brak CSS.
4. **Skutki.** Hałas w raportach.
5. **🟡 Ostrzeżenie** (narzędzie)
6. **Poprawka:** skrypt audytu — zmiana skryptu, wymaga akceptacji.

---

## 🟡 O16 — Engine ON + puste mapowanie → cichy pulse

1. **Problem.** Gdy highlights nie zmapują się do tekstu, Home wraca do pulse bez logu.
2. **Plik.** `js/views/home.js`
3. **Linia.** ~597–615 (`getLivingRegionListItems`)
4. **Dlaczego.** `if (mapped.length) return mapped` else fallthrough do pulse.
5. **Skutki.** Trudna diagnostyka „dlaczego nie widać Engine”.
6. **🟡 Ostrzeżenie**
7. **Poprawka:** obserwowalność (log) — bezpieczna; bez UI.

---

## 🟢 Sugestie S1–S12

To **kierunki napraw** do potwierdzonych K/B/O — nie osobne nowe usterki:

| Sugestia | Adresuje | Typ zmiany (wymaga TAK) |
|----------|----------|-------------------------|
| S1 | B2 | zmiana importów |
| S2 | B7 | `index.html` |
| S3 | B5/B6 | wydajność/pamięć |
| S4 | K2/K3 | wydajność |
| S5 | K1 | wydajność/pamięć |
| S6 | B9 | UI mapy |
| S7 | K5/K6 | CSS/UI |
| S8 | O5 | architektura boot |
| S9 | B8 | dead code |
| S10 | B11 | logika flagi (bezpieczna) |
| S11 | B12 | build/legacy |
| S12 | O9 | a11y markup |

---

## Podsumowanie potwierdzeń

| ID | Potwierdzony w kodzie? |
|----|:----------------------:|
| K1–K6 | tak |
| B1–B13 | tak |
| O1–O16 | tak |
| S1–S12 | jako mapowanie napraw (nie nowe bugi) |

**Nic nie naprawiono.** Wybierz ID → dostaniesz propozycję → dopiero po **tak** kod.
