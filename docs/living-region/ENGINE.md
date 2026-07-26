# Living Region Engine

**Status:** wdrożony (etap 1 — tylko dane)  
**Data:** 2026-07-26  
**UI / Home:** etap 2 — istniejąca sekcja `.home-living-region` konsumuje Engine (bez nowego layoutu / bez CSS)

## Cel

Dostawca danych dnia dla regionu (highlights). Widoki mogą go konsumować później — silnik **nie zna** Home, CSS ani HTML.

## Nowe pliki

| Plik | Rola |
|------|------|
| `js/livingRegion/livingRegion.js` | API publiczne |
| `js/livingRegion/index.js` | barrel |
| `js/livingRegion/config.js` | flaga, limity, klucze LS |
| `js/livingRegion/cache.js` | cache dnia |
| `js/livingRegion/personalize.js` | miękkie wagi |
| `js/livingRegion/sources/pool.js` | pula okolicy |
| `js/livingRegion/sources/producerOfDay.js` | producent dnia |
| `js/livingRegion/sources/seasonal.js` | sezon |
| `js/livingRegion/sources/newcomers.js` | nowi producenci/produkty |
| `js/livingRegion/sources/openNow.js` | otwarte teraz |
| `js/livingRegion/sources/visitDelta.js` | delta wizyty |
| `js/core/favoritesStore.js` | magazyn ulubionych bez widoku |
| `scripts/test-living-region-engine.mjs` | smoke |
| `docs/living-region/ENGINE.md` | ten raport |

## Zmodyfikowane pliki

| Plik | Zmiana |
|------|--------|
| `js/config.js` | `LIVING_REGION_ENGINE: true` |
| `js/views/favorites.js` | delegacja do `favoritesStore` (zachowanie UI bez zmian) |
| `js/app.js` | `initLivingRegion()` — jedna linia, bez logiki |
| `index.html` | cache-bust `app.js?v=605` |
| `package.json` | `check:living-region-engine` |

## API

```js
initLivingRegion({ enabled? })
isLivingRegionEnabled()
getTodayHighlights(ctx?)
getSeasonalProducts(ctx?)
getNewProducers(ctx?)
getOpenNow(ctx?)
getChangesSinceLastVisit(ctx?)
invalidateLivingRegionCache()
```

`Highlight`: `{ id, kind, rank, score, payload }` — bez HTML/CSS.

## Wyłączenie

- `CONFIG.LIVING_REGION_ENGINE = false`
- lub `localStorage.rg_living_region_engine = '0'`

## Sposób działania

1. `init` ustawia flagę.  
2. `getTodayHighlights` buduje kontekst (pula, ulubione, recently viewed, learning boost).  
3. Źródła zwracają fakty; agregator sortuje po `score`, max 5.  
4. Cache: `dayKey` + fingerprint puli (`rg_living_region_day_v1`).  
5. Snapshoty known/visit Engine są **osobne** od toastu mapy (`mapChanges`).

## Wydajność

- Brak sieci w silniku.  
- Brak timerów / animacji.  
- O(n) po już załadowanych producentach, raz na dzień (cache hit = O(1)).  
- Cold start: +mały koszt parse modułu przy `init`.

## Ryzyko regresji

| Obszar | Ryzyko | Uwaga |
|--------|--------|--------|
| Home / UI | niskie | ten sam markup; OFF → stary pulse |
| Ulubione | niskie | ten sam klucz LS |
| Mapa „Co nowego?” | brak | osobny snapshot |
| Dark/light | brak | brak CSS |
| Konsola | niskie | smoke `npm run check:living-region-engine` |

## Test

```bash
npm run check:living-region-engine
```
