# PWA Lifecycle — weryfikacja (ETAP 43 · Zadanie 2)

**Data:** 2026-08-06  
**ETAP:** 45-D · Runtime Truth  
**Gate:** **CONDITIONAL**  
**STATIC:** **STATIC VERIFIED**  
**RUNTIME:** **NOT VERIFIED**  
**PWA version:** 30

> **STATIC** = struktura, importy, wersje, SW wiring w kodzie. **RUNTIME** = potwierdzenie na urządzeniu.

## Warstwy

| Warstwa | Werdykt | Szczegóły |
|---------|---------|-----------|
| **STATIC** | **STATIC VERIFIED** | 10/10 scenariuszy kodu |
| **RUNTIME** | **NOT VERIFIED** | undefined pending · undefined pass |
| Subprocess | 3/3 | npm gates |
| **Gate** | **CONDITIONAL** | |

## Scenariusze — STATIC (kod / konfiguracja)

| # | Scenariusz | Status | Dowód |
|---|------------|--------|-------|
| 1 | Pierwsze uruchomienie | STATIC VERIFIED | bootstrap → splash dismiss · settings toleruje pusty LS |
| 2 | Ponowne uruchomienie | STATIC VERIFIED | idempotent bootstrap · persist settings/fav/cart |
| 3 | Aktualizacja PWA | STATIC VERIFIED | PWA v30 · skipWaiting · activate purge starych cache |
| 4 | Instalacja PWA | STATIC VERIFIED | beforeinstallprompt · appinstalled · manifest |
| 5 | Odinstalowanie | STATIC VERIFIED | getSettings try/catch · stores try/catch · app bez bezpośredniego LS |
| 6 | Ponowna instalacja | STATIC VERIFIED | SW re-register · install prompt · navigate |
| 7 | Wyczyszczenie cache | STATIC VERIFIED | SW activate purge · Memory Cleaner stale caches |
| 8 | Wyczyszczenie danych strony | STATIC VERIFIED | Memory Cleaner: safe vs protected · settings/fav/cart chronione |
| 9 | Tryb offline | STATIC VERIFIED | SW precache · map banner · offline queue |
| 10 | Powrót online | STATIC VERIFIED | online event → banner hide · flush queue · cache v=PWA_VERSION |

## Bramki automatyczne

| Test | Status |
|------|--------|
| test-pwa | ✅ PASS |
| pwa-version | ✅ PASS |
| icon-refresh | ✅ PASS |

## RUNTIME — potwierdzenie na urządzeniu


### T01-first-launch — Pierwsze uruchomienie

**Urządzenie:** Telefon PWA lub przeglądarka

1. Wyczyść dane strony (1×) LUB pierwsza wizyta
1. Otwórz prod/LAN
1. Splash znika · Home widoczny · cookie banner

**Pass:** Brak białego ekranu · nawigacja działa


### T02-relaunch — Ponowne uruchomienie

**Urządzenie:** PWA standalone

1. Force-quit aplikację
1. Uruchom z ikony
1. Home/ustawienia/język jak przed zamknięciem

**Pass:** Persist bez pełnego onboarding


### T03-pwa-update — Aktualizacja PWA

**Urządzenie:** PWA zainstalowana

1. Deploy nowej wersji (v30+)
1. Otwórz PWA
1. SW skipWaiting · nowe ikony · brak starych cache

**Pass:** Update bez odinstalowania


### T04-pwa-install — Instalacja PWA

**Urządzenie:** Chrome Android / Desktop

1. Otwórz w Chrome
1. Baner/menu → Zainstaluj
1. Ikona na pulpicie · standalone

**Pass:** Instalacja native prompt


### T05-uninstall — Odinstalowanie

**Urządzenie:** PWA

1. Usuń ikonę / odinstaluj z systemu
1. Otwórz URL w przeglądarce
1. App boot bez crash

**Pass:** Czysty start jak nowy użytkownik (LS pusty)


### T06-reinstall — Ponowna instalacja

**Urządzenie:** PWA

1. Po uninstall → zainstaluj ponownie
1. SW register · prompt install
1. Nawigacja Home/Map

**Pass:** Pełna ścieżka reinstall


### T07-cache-clear — Wyczyszczenie cache

**Urządzenie:** Chrome DevTools / Ustawienia

1. Application → Clear cache (NIE site data)
1. Reload
1. App działa · SW re-cache

**Pass:** Cache wyczyszczony · dane użytkownika zostają


### T08-site-data-clear — Wyczyszczenie danych strony

**Urządzenie:** Chrome / Safari

1. Wyczyść dane strony / localStorage
1. Reload
1. App boot · ustawienia domyślne · brak crash

**Pass:** Safe boot na pustym LS


### T09-offline — Tryb offline

**Urządzenie:** Telefon PWA

1. Tryb samolotowy ON
1. Otwórz PWA (już odwiedzoną)
1. Home/Map cache · banner offline

**Pass:** Aplikacja użyteczna offline (shell + mapa cache)


### T10-online-return — Powrót online

**Urządzenie:** Telefon PWA

1. Tryb samolotowy OFF
1. Banner znika
1. Mapa/GPS odświeża · sync queue flush

**Pass:** Powrót online bez reload


## Mapowanie RC (Release Candidate)

| RC step | Scenariusz |
|---------|------------|
| first-launch | T01 |
| next-day | T02 (persist) |
| update | T03 |
| install | T04 |
| uninstall | T05 |
| reinstall | T06 |
| offline | T09 |
| (online sync) | T10 |

## Pliki kluczowe

| Plik | Rola |
|------|------|
| `index.html` | SW register `sw.js?v=30` |
| `sw.js` | install · activate · fetch · skipWaiting |
| `js/core/pwaInstall.js` | beforeinstallprompt · appinstalled |
| `js/core/splashScreen.js` | pierwsze uruchomienie |
| `js/core/offlineSync.js` | online → flush queue |
| `js/views/map.js` | banner offline/online |
| `js/diagnostics/memoryCleaner.js` | cache + safe LS clean |

---
*ETAP 43-T2 · autoApply=false · uruchom: `npm run check:pwa-lifecycle`*
