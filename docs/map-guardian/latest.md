# ETAP 42 — Map Guardian

**Werdykt:** PASS  
**Data:** 2026-08-04

## Cel

Najważniejszy strażnik mapy. Co ~5 s (gdy widok Mapa aktywny) sprawdza zdrowie Leaflet i przy zawieszeniu robi **restart tylko mapy** — bez przeładowania całej aplikacji.

## Checklista

| Check | Znaczenie |
|-------|-----------|
| leaflet-ready | `L` + instancja + kontener |
| tile-loaded | kafle załadowane (`load` / DOM) |
| markers | rejestr vs widoczni producenci |
| cluster | `markerClusterGroup` gdy plugin dostępny |
| gps | last-known / watch / tracking |
| radius | `currentRadiusKm` + slider |
| filter | `activeCategoryFilter` |
| popup | API Leaflet popup |
| routing | `buildMultiStopMapsUrl` (Google Maps dir) |

## Restart

1. Miękki `healMapRuntimeState()`
2. Jeśli nadal krytyczne → `restartMapOnly()` = `destroyLeafletMap` + `renderMap`
3. Cooldown ~28 s · bez `location.reload`

## API

```js
__RG_MAP_GUARDIAN__.run()
__RG_MAP_GUARDIAN__.restart()  // force
__RG_MAP_GUARDIAN__.log()
__RG_MAP_GUARDIAN__.clear()
```

Store: `localStorage.rg_map_guardian_v1`
