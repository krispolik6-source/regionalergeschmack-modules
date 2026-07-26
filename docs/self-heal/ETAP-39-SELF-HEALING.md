# ETAP 39 — Self Healing

**Data:** 2026-07-23  
**Werdykt:** **PASS** (moduł runtime aktywny)  
**Polityka:** naprawia **tylko stan aplikacji** · nie przepisuje kodu źródłowego domeny · Brand Lock · bez zmiany Store / API / routingu core

## Cel

Aplikacja sama wykrywa i naprawia drobne problemy podczas działania.

## Co naprawia (stan)

| Problem | Reakcja | API |
|---------|---------|-----|
| Mapa / Leaflet nie żyje | Ponowna inicjalizacja Leaflet | `healMapRuntimeState()` |
| GPS nie odpowiada | Ostatnia znana lokalizacja (`rg_last_position`) | ten sam + `LOCATION_UPDATED` |
| Marker zniknął | `refreshMapMarkers({ force })` gdy brak w rejestrze | `healMapRuntimeState()` |
| EventBus / nav listener | Idempotentny rebind `NAVIGATE` + `bindNavButtons` | `ensureNavigationHealed()` |
| Obraz nie wczytany | Placeholder `logo-master.svg` | `healBrokenImages` + capture `error` |
| Stary Service Worker | Banner + toast „odśwież” (bez cichego skipWaiting) | `healServiceWorker()` |
| Zdjęcia / ikony / modal | Jak wcześniej (kategoria, emoji, layout) | photos / icons / layout |

## Czego NIE robi

- Nie zmienia plików źródłowych na dysku
- Nie mutuje Store / schematu API
- Nie wymusza `skipWaiting` w tle (użytkownik potwierdza odświeżenie)
- Nie zmienia kolorów / logo marki (placeholder = logo-master)

## Uruchomienie

Automatycznie: `initSelfHealing()` w `app.js`  
Watchdog: co ~28 s (gdy dokument widoczny) + MutationObserver  
Ręcznie:

```js
__RG_SELF_HEAL__.run()
__RG_SELF_HEAL__.healMap()
__RG_SELF_HEAL__.healEventBus()
__RG_SELF_HEAL__.healSw()
__RG_SELF_HEAL__.log()
```

## Pliki

| Plik | Rola |
|------|------|
| `js/diagnostics/selfHealing.js` | Orchestrator ETAP 39 |
| `js/views/map.js` | `healMapRuntimeState()` — stan mapy |
| `js/controllers/navigation.js` | `ensureNavigationHealed()` — stan listenerów |
| `js/views/producerModal.js` | `.catch` na dynamicznym imporcie heal |

## Cache-bust

- `map.js?v=46`
- `home.js?v=40`
- `app.js?v=595`
