# Resilience Verification — ETAP 45-D · Zadanie 8

**Data:** 2026-08-06  
**Gate:** **CONDITIONAL**  
**STATIC:** **STATIC VERIFIED**  
**RUNTIME:** **NOT VERIFIED**

> **STATIC** = wiring offline/SW/error handling. **RUNTIME** = chaos test DevTools/telefon.

## Warstwy

| Warstwa | Werdykt |
|---------|---------|
| **STATIC** | **STATIC VERIFIED** (23/23) |
| **RUNTIME** | **NOT VERIFIED** (undefined pending) |
| Subprocess | 3/3 |
| **Gate** | **CONDITIONAL** |

## Scenariusze


### ✅ Brak internetu

| Check | Status | Odporność |
|-------|--------|-----------|
| SW offline shell (precache + navigate fallback) | ✅ | precache index.html · navigate → cache fallback |
| Banner offline na mapie + online sync | ✅ | updateOfflineBanner · eventy online/offline |
| Kolejka offline + flush po online | ✅ | rg_offline_sync_queue_v1 · SW sync tag |
| Rejestracja offline w Error Collector | ✅ | runtimeErrorCollector · kategoria network |

### ❌ Wolny internet

| Check | Status | Odporność |
|-------|--------|-----------|
| Mapa: fetch w tle bez blokowania UI | ✅ | generacja fetch · catch · finally — UI nie zawiesza się |
| SW: network-first z fallback cache | ✅ | stale-while-revalidate / cache fallback |
| Symulacja RUS/VU: offline + online | ❌ | Wykonanie __RG_VIRTUAL__ / __RG_REAL_USERS__ w przeglądarce — wiring ≠ chaos test |

### ✅ Timeout

| Check | Status | Odporność |
|-------|--------|-----------|
| Mapa: timeout GPS / OSM + AbortController | ✅ | timeout 12–20s · abort poprzedniego fetchu |
| GovData: AbortController + timeout error | ✅ | govDataService FETCH_TIMEOUT_MS |
| Fetch errors nie crashują app | ✅ | runtimeErrorCollector log · map catch |

### ✅ Uszkodzony cache

| Check | Status | Odporność |
|-------|--------|-----------|
| SW activate: purge starych cache | ✅ | activate → delete stale rg-* caches |
| safeCachePut — tylko 200 basic (bez corrupt partial) | ✅ | ignoruje 206 / opaque responses |
| Memory Cleaner: deleteStaleCaches | ✅ | Dev Vault → safe clean stale PWA cache |
| Runtime Error Feed: probe cache | ✅ | probeRuntimeSignals · warn gdy brak cache |

### ✅ Brak manifestu

| Check | Status | Odporność |
|-------|--------|-----------|
| index.html link manifest (normal path) | ✅ | standardowy link manifest |
| Wykrycie braku manifestu (feed) | ✅ | probeRuntimeSignals · nie crash |
| App boot bez twardego wymagania manifest | ✅ | PWA install może zawieść · shell działa |

### ✅ Brak ikon

| Check | Status | Odporność |
|-------|--------|-----------|
| SW: ikony offline fallback wersjonowany | ✅ | network-first · offline ?v= · push DEFAULT_ICON |
| Self-Heal: broken images / icons | ✅ | logo-master placeholder · nav text fallback |
| Image error collector | ✅ | IMG error → runtimeErrorStore |

### ✅ Restart Service Workera

| Check | Status | Odporność |
|-------|--------|-----------|
| SW skipWaiting + clients.claim | ✅ | nowy SW przejmuje kontrolę po activate |
| Self-Heal: healServiceWorker + prompt | ✅ | ETAP 39: prompt odświeżenia · nie skipWaiting z klienta |
| controllerchange logging | ✅ | runtimeErrorCollector · SW lifecycle events |
| Re-register on load | ✅ | index.html register · install precache |

## Zachowanie oczekiwane

| Reguła | Wartość |
|--------|---------|
| Brak białego ekranu | ✅ shell offline |
| Graceful degradation | ✅ manifest/ikony opcjonalne |
| Błędy | ✅ lokalny log (Error Feed / Guardian) |
| Auto-fix danych | ❌ wyłączone (autoApply=false) |

## Bramki automatyczne

| Test | Status |
|------|--------|
| pwa-lifecycle | ✅ PASS |
| service-worker | ✅ PASS |
| runtime-error-feed | ✅ PASS |

## RUNTIME — macierz chaos

| Scenariusz | Kroki | Pass |
|------------|-------|------|
| Brak internetu | DevTools → Offline / tryb samolotowy → Otwórz PWA (po wcześniejszej wizycie) → Home/Map z cache · banner offline | Brak białego ekranu · nawigacja działa · powrót online OK |
| Wolny internet | DevTools → Network → Slow 3G → Przejdź Home → Map → producent | UI responsywne · skeleton/map · brak freeze |
| Timeout | Network → Offline podczas ładowania OSM → Czekaj >15s → Włącz online | console.warn OSM · mapa odświeża markery · brak crash |
| Uszkodzony cache | Application → Cache Storage → usuń rg-pwa-v30 → Lub Memory Cleaner → safe clean → Reload | SW re-precache · app boot OK |
| Brak manifestu | Application → Manifest → simulate missing / block manifest.json → Reload | App działa · brak crash · ewentualny warn w Error Feed |
| Brak ikon | Block /assets/icons/* w Network → Reload / otwórz PWA | Placeholder / cache fallback · Self-Heal opcjonalnie · brak crash |
| Restart Service Workera | Application → Service Workers → Update / Unregister + Reload → Lub deploy nowej wersji SW | skipWaiting · clients.claim · prompt refresh · shell działa |

## Symulacja w konsoli

```javascript
// Symulacje w konsoli (localhost / ?dev=1):
// 1. Offline
window.dispatchEvent(new Event('offline'));
// 2. Online
window.dispatchEvent(new Event('online'));
// 3. SW update check
navigator.serviceWorker?.getRegistration()?.then(r => r?.update());
// 4. Cache keys
caches.keys().then(console.log);
// 5. Pełna symulacja sieci
await __RG_REAL_USERS__.runOne(1); // zawiera offline step
await __RG_VIRTUAL__.run({ scenarios: ['offline','online'] });
```

## Pliki kluczowe

| Plik | Rola |
|------|------|
| `sw.js` | offline precache · fetch fallback · cache purge |
| `js/views/map.js` | banner offline · OSM timeout/abort |
| `js/core/offlineSync.js` | kolejka offline |
| `js/diagnostics/runtimeErrorCollector.js` | network/SW/image errors |
| `js/diagnostics/selfHealing.js` | heal SW · icons · images |
| `js/diagnostics/memoryCleaner.js` | stale cache clean |

---
*ETAP 43-T8 · autoApply=false · uruchom: `npm run check:resilience`*
