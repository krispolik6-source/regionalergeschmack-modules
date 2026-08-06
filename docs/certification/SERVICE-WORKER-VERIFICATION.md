# Service Worker Verification — ETAP 43 · Zadanie 4

**Data:** 2026-08-06  
**ETAP:** 45-D · Runtime Truth  
**Gate:** **CONDITIONAL**  
**STATIC:** **STATIC VERIFIED**  
**RUNTIME:** **NOT VERIFIED**  
**PWA version:** 30  
**Cache:** `rg-pwa-v30` · `rg-runtime-images-v30`

> **STATIC** = sw.js, manifest wiring, wersje. **RUNTIME** = DevTools / telefon.

## Warstwy

| Warstwa | Werdykt | Szczegóły |
|---------|---------|-----------|
| **STATIC** | **STATIC VERIFIED** | 25/25 obszarów |
| **RUNTIME** | **NOT VERIFIED** | undefined pending |
| Subprocess | 2/2 | npm gates |
| **Gate** | **CONDITIONAL** | |

## Cykl życia SW

```
install  → caches.open(CACHE_VERSION) → addAll(PRECACHE_URLS) → skipWaiting()
activate → caches.keys() → delete stale rg-pwa-* / rg-runtime-images-* → clients.claim()
fetch    → icons: network-first | navigate/code: network-first + cache | images: IMAGE_CACHE | default: cache-first
```

## Obszary weryfikacji


### Install

| Check | Status | Dowód |
|-------|--------|-------|
| install event + waitUntil | STATIC VERIFIED | sw.js: install listener · event.waitUntil |
| Precache shell (PRECACHE_URLS) | STATIC VERIFIED | index.html · CSS · ikony · manifest w precache |
| Otwarcie CACHE_VERSION przy install | STATIC VERIFIED | precache do rg-pwa-v30 |

### Activate

| Check | Status | Dowód |
|-------|--------|-------|
| activate event + waitUntil | STATIC VERIFIED | sw.js: activate listener |
| activate czyta caches.keys() | STATIC VERIFIED | enumerate cache przed cleanup |

### skipWaiting

| Check | Status | Dowód |
|-------|--------|-------|
| skipWaiting po precache | STATIC VERIFIED | install → addAll → skipWaiting (natychmiastowa aktywacja nowego SW) |
| Klient nie wywołuje skipWaiting (selfHealing) | STATIC VERIFIED | ETAP 39: prompt odświeżenia zamiast skipWaiting z klienta |

### clients.claim

| Check | Status | Dowód |
|-------|--------|-------|
| clients.claim po cleanup | STATIC VERIFIED | activate → purge → clients.claim (kontrola od razu) |

### Cache cleanup

| Check | Status | Dowód |
|-------|--------|-------|
| Usuwa stare rg-pwa-* i rg-runtime-images-* | STATIC VERIFIED | filter + delete · zachowuje CACHE_VERSION + IMAGE_CACHE |
| Nie usuwa bieżących cache | STATIC VERIFIED | wyjątek dla bieżącej wersji |
| Memory Cleaner — deleteStaleCaches | STATIC VERIFIED | memoryCleaner.js · import z pwaVersion.js |

### Runtime cache

| Check | Status | Dowód |
|-------|--------|-------|
| IMAGE_CACHE dla obrazów runtime | STATIC VERIFIED | rg-runtime-images-v30 · cache-first z network update |
| Runtime cache dla JS/CSS (network-first) | STATIC VERIFIED | fetch → put CACHE_VERSION · offline caches.match |
| Navigate — aktualizacja index.html w cache | STATIC VERIFIED | network navigate → update cached shell |
| safeCachePut — tylko 200 basic | STATIC VERIFIED | bez cache 206 / opaque / error |

### Offline cache

| Check | Status | Dowód |
|-------|--------|-------|
| Precache offline shell | STATIC VERIFIED | 29 URL w precache |
| Navigate offline → index.html | STATIC VERIFIED | fetch fail → cached /index.html lub / |
| JS/CSS offline → caches.match(request) | STATIC VERIFIED | code assets offline fallback |
| Ikony offline — wersjonowany fallback | STATIC VERIFIED | network-first · offline tylko ?v= bieżącej wersji |
| Background sync + offline queue flush | STATIC VERIFIED | SW sync → postMessage · offlineSync.js online handler |

### Version sync

| Check | Status | Dowód |
|-------|--------|-------|
| SW importScripts pwaVersion.global.js | STATIC VERIFIED | brak lokalnej kopii PWA_VERSION w sw.js |
| PWA_VERSION spójna (module = global = SW bridge) | STATIC VERIFIED | PWA_VERSION=30 · pwaVersion.js = pwaVersion.global.js |
| index.html rejestruje sw.js?v= | STATIC VERIFIED | register('/sw.js?v=30') |
| Nazwy cache zsynchronizowane z PWA_VERSION | STATIC VERIFIED | rg-pwa-v30 · rg-runtime-images-v30 |
| selfHealing używa pwaAssetUrl | STATIC VERIFIED | dynamiczny cache-bust w diagnostyce |

## Bramki automatyczne

| Test | Status |
|------|--------|
| test-pwa | ✅ PASS |
| pwa-version-sync | ✅ PASS |

## RUNTIME — potwierdzenie


### M-sw-install — Install + precache

**Urządzenie:** Chrome DevTools

1. Application → Service Workers → Update / Register
1. Cache Storage: pojawia się rg-pwa-v30 z index.html, CSS, ikonami
1. Status: activated · skipWaiting wykonany

**Pass:** Precache w rg-pwa-v30 bez błędów addAll


### M-sw-update — Update + cleanup starych cache

**Urządzenie:** Chrome / PWA

1. Bump PWA_VERSION → deploy
1. Nowy SW: installing → activated
1. Cache Storage: tylko rg-pwa-v30 + rg-runtime-images-v30
1. Stare rg-pwa-* / rg-runtime-images-* usunięte

**Pass:** Activate purge · brak starych cache


### M-sw-offline — Offline shell

**Urządzenie:** Telefon PWA

1. Odwiedź app online (precache)
1. Tryb samolotowy ON
1. Reload → Home/Map z cache · banner offline

**Pass:** Aplikacja działa offline po precache


### M-sw-online — Powrót online + runtime cache

**Urządzenie:** Chrome

1. Online → nawigacja odświeża index.html w cache
1. Obrazy runtime w rg-runtime-images-v30
1. Offline queue flush (offlineSync)

**Pass:** Runtime cache aktualizuje się · sync działa


## Pliki kluczowe

| Plik | Rola |
|------|------|
| `sw.js` | install · activate · fetch · push · sync |
| `js/core/pwaVersion.global.js` | Bridge PWA_VERSION dla importScripts |
| `js/core/pwaVersion.js` | Kanoniczna wersja · cache names · pwaAssetUrl |
| `index.html` | `serviceWorker.register('/sw.js?v=30')` |
| `js/diagnostics/memoryCleaner.js` | Usuwanie starych cache (PWA_CACHE_PREFIX_KEEP) |
| `js/diagnostics/selfHealing.js` | Prompt odświeżenia przy waiting SW |
| `js/core/offlineSync.js` | Flush kolejki po online / FLUSH_OFFLINE_QUEUE |

---
*ETAP 43-T4 · autoApply=false · uruchom: `npm run check:service-worker`*
