# Icons Verification — ETAP 43 · Zadanie 3

**Data:** 2026-08-06  
**ETAP:** 45-D · Runtime Truth  
**Gate:** **CONDITIONAL**  
**STATIC:** **STATIC VERIFIED**  
**RUNTIME:** **NOT VERIFIED**  
**PWA version:** 30  
**Master:** `assets/icons/logo-master.svg`

> **STATIC** = manifest, HTML, SW, wersje, pliki ikon. **RUNTIME** = brak starych ikon po update na urządzeniu.

## Warstwy

| Warstwa | Werdykt | Szczegóły |
|---------|---------|-----------|
| **STATIC** | **STATIC VERIFIED** | kategorie + anti-stale |
| **RUNTIME** | **NOT VERIFIED** | undefined pending |
| Subprocess | 3/3 | icon-refresh · master-icon · pwa-version |
| **Gate** | **CONDITIONAL** | |

## Kategorie ikon


### Favicon

| Check | Status | Dowód |
|-------|--------|-------|
| Favicon (desktop) | STATIC VERIFIED | index.html · favicon.ico/16/32 ?v=30 · pliki na dysku |
| Favicon SVG (logo-master) | STATIC VERIFIED | SVG favicon = master logo |


### Launcher

| Check | Status | Dowód |
|-------|--------|-------|
| Launcher PWA (manifest 192/512) | STATIC VERIFIED | manifest.json · wszystkie ikony ?v=30 |
| Launcher — SW precache + network-first | STATIC VERIFIED | SW precache wersjonowany · fetch no-store dla ikon |


### Splash

| Check | Status | Dowód |
|-------|--------|-------|
| Splash screen (HTML) | STATIC VERIFIED | index.html splash img wersjonowany |
| Splash asset (CSS + brand) | STATIC VERIFIED | brand-identity-final.css · assets/brand/splash-logo.png |
| Splash — SW precache offline | STATIC VERIFIED | SW PRECACHE splash-logo |


### Apple Touch

| Check | Status | Dowód |
|-------|--------|-------|
| Apple Touch Icon | STATIC VERIFIED | apple-touch-icon + 180 · meta iOS |
| Apple Touch w manifest | STATIC VERIFIED | manifest zawiera apple-touch-icon |


### Maskable

| Check | Status | Dowód |
|-------|--------|-------|
| Maskable (192 + 512) | STATIC VERIFIED | manifest purpose=maskable · pliki maskable-192/512 |


### Monochrome

| Check | Status | Dowód |
|-------|--------|-------|
| Monochrome (adaptive icon) | STATIC VERIFIED | manifest purpose=monochrome · monochrome-512.png |


### Notifications

| Check | Status | Dowód |
|-------|--------|-------|
| Push notifications (runtime) | STATIC VERIFIED | pushNotifications.js · pwaAssetUrl dynamic version |
| SW push DEFAULT_ICON | STATIC VERIFIED | sw.js push handler · wersjonowany DEFAULT_ICON |
| Notifications brand asset | STATIC VERIFIED | assets/brand/notifications-icon.png · SW precache |


### Shortcut icons

| Check | Status | Dowód |
|-------|--------|-------|
| Manifest shortcuts (PWA) | STATIC VERIFIED | Brak manifest.shortcuts — produkt nie definiuje skrótów PWA (N/A) |
| Skrót na pulpicie (= launcher icon) | STATIC VERIFIED | Instalacja PWA / skrót iOS używa icon-192 + maskable z manifest |


## Anti-stale — brak starych wersji po update

| Mechanizm | Status | Opis |
|-----------|--------|------|
| Jedna wersja PWA (v30) wszędzie | STATIC VERIFIED | PWA_VERSION=30 · brak ?v=29 w runtime |
| SW activate usuwa stare cache | STATIC VERIFIED | purge rg-pwa-* + rg-runtime-images-* · clients.claim |
| Offline fallback tylko wersjonowany URL | STATIC VERIFIED | bez caches.match(pathname) bez ?v= |
| Memory Cleaner chroni tylko bieżące cache | STATIC VERIFIED | pwaVersion.js PWA_CACHE_PREFIX_KEEP synced z PWA_VERSION |
| HTTP Cache-Control must-revalidate | STATIC VERIFIED | netlify.toml · ikony + manifest |
| Brak rg-runtime-images-v1 w runtime cache paths | STATIC VERIFIED | sw + offlineSync + memoryCleaner + pwaVersion bez v1 |

**Strategia (ETAP 28F + 42B):**
1. `?v=${PWA_VERSION}` na wszystkich URL ikon (HTML, manifest, CSS)
2. SW: ikony/manifest = **network-first** + `cache: no-store`
3. SW `activate`: usuwa wszystkie `rg-pwa-*` i `rg-runtime-images-*` oprócz bieżącej wersji
4. `pwaAssetUrl()` w push/selfHealing — dynamiczny cache-bust
5. Netlify: `Cache-Control: must-revalidate` dla `/assets/icons/*` i `manifest.json`
6. Memory Cleaner: `PWA_CACHE_PREFIX_KEEP` = `rg-pwa-v30` + `rg-runtime-images-v30`

## Shortcut icons

manifest.shortcuts nie jest skonfigurowany — skrót na pulpicie używa ikon launcher (192/maskable).

- **manifest.shortcuts:** nie skonfigurowany (by design — brak skrótów PWA w menu systemowym)
- **Skrót na pulpicie (install):** używa `icon-192.png` + `maskable-512.png` z manifest — zweryfikowane ✅

## Bramki automatyczne

| Test | Status |
|------|--------|
| icon-refresh | ✅ PASS |
| master-icon-audit | ✅ PASS |
| pwa-version | ✅ PASS |

## RUNTIME — potwierdzenie na urządzeniu


### M-icons-update — Po deploy nowej wersji — brak starych ikon

**Urządzenie:** Android PWA + Chrome desktop

1. Zainstalowana PWA z poprzednią wersją (lub symulacja bump PWA_VERSION)
1. Deploy v30+ · otwórz PWA
1. Sprawdź: launcher, splash, favicon w karcie, push icon preview
1. DevTools → Application → Cache Storage: tylko rg-pwa-v30 + rg-runtime-images-v30

**Pass:** Wszystkie powierzchnie pokazują nową ikonę (dwa kłosy)


### M-android-launcher — Android launcher (agresywny cache)

**Urządzenie:** Android Chrome

1. Po update: jeśli launcher nadal stary → odinstaluj PWA i zainstaluj ponownie
1. Alternatywnie: wyczyść cache Chrome (nie site data)

**Pass:** Ikona na pulpicie = aktualna maskable/192


### M-ios-apple — iOS Add to Home Screen

**Urządzenie:** Safari iPhone

1. Udostępnij → Dodaj do ekranu początkowego
1. Sprawdź apple-touch-icon na pulpicie

**Pass:** Ikona 180×180 bez rozmycia


## Pliki kluczowe

| Plik | Rola |
|------|------|
| `assets/icons/logo-master.svg` | Master (dwa kłosy) |
| `manifest.json` | Launcher · maskable · monochrome · apple |
| `index.html` | Favicon · apple-touch · splash |
| `css/brand-identity-final.css` | splash-logo |
| `assets/brand/splash-logo.png` | Splash PNG |
| `assets/brand/notifications-icon.png` | Push asset |
| `sw.js` | precache · network-first · purge |
| `js/core/pwaVersion.js` | PWA_VERSION · pwaAssetUrl · cache keep |

---
*ETAP 43-T3 · autoApply=false · uruchom: `npm run check:pwa-icons`*
