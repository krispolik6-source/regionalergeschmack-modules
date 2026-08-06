# ETAP 38 — Release Candidate

**Data:** 2026-08-06  
**Werdykt:** **PASS**  
**Persona:** Pierwszy użytkownik · install → reinstall

> To nie jest sam audyt — to ścieżka Release Candidate: od instalacji do reinstall.

## Werdykt

| Metryka | Wartość |
|---------|---------|
| Status | **PASS** |
| Kroki RC | 22/22 |
| Ścieżka persony | 14/14 |

## Ścieżka użytkownika

| # | Krok | Status | Szczegóły |
|---|------|--------|-----------|
| 1 | Instaluję aplikację pierwszy raz | ✅ | manifest + beforeinstallprompt + ikony |
| 2 | Pierwsze uruchomienie | ✅ | shell + UTF-8 clean + settings |
| 3 | GPS / lokalizacja | ✅ | watch + clearWatch + events |
| 4 | Wyszukiwanie | ✅ | home search + map query |
| 5 | Mapa | ✅ | map view + leaflet + offline banner |
| 6 | Producent (modal) | ✅ | producer modal open/close |
| 7 | Ulubione | ✅ | add/remove + view |
| 8 | Koszyk | ✅ | cart API + view |
| 9 | Premium | ✅ | premium view + entry points |
| 10 | Powrót następnego dnia (persist) | ✅ | settings + GPS + favorites + cart keys |
| 11 | Offline | ✅ | SW cache + offline event + banner |
| 12 | Aktualizacja (PWA version) | ✅ | PWA_VERSION=30 synced + skipWaiting |
| 13 | Uninstall (czyszczenie) | ✅ | rg_* keys · empty-storage safe boot |
| 14 | Reinstall | ✅ | SW re-register + install prompt + navigate |

## Kroki techniczne / child checks

| Krok | Status | Detail |
|------|--------|--------|
| Chrome header (padding = header height) | ✅ | header-height = ph-header-h |
| Push offer regex (DE) | ✅ | DE product matchers OK |
| Live user simulation wiring | ✅ | ?realusers=1 / __RG_REAL_USERS__.run() |
| Child: functional-audit | ✅ |  | --- Podsumowanie funkcjonalne --- | OK: 54 | Błędy: 0 |
| Child: translations | ✅ | --- Wymagane klucze testowe --- |  | ✅ Wszystkie języki mają wymagane klucze testowe. |
| Child: PWA | ✅ |  | --- PWA test --- | OK |
| Child: landing | ✅ |  | --- Landing test --- | OK |
| Child: device-lab | ✅ | [Device Lab] PASS · 62/62 checks · 63 cells | Wrote: docs\audit\ETAP-37-DEVICE-LAB.md |

## Child audits

- ✅ **functional-audit** (exit 0) —  | --- Podsumowanie funkcjonalne --- | OK: 54 | Błędy: 0
- ✅ **check-translations** (exit 0) — --- Wymagane klucze testowe --- |  | ✅ Wszystkie języki mają wymagane klucze testowe.
- ✅ **test-pwa** (exit 0) —  | --- PWA test --- | OK
- ✅ **test-landing** (exit 0) —  | --- Landing test --- | OK
- ✅ **device-lab** (exit 0) — [Device Lab] PASS · 62/62 checks · 63 cells | Wrote: docs\audit\ETAP-37-DEVICE-LAB.md

## Naprawy w ETAP 38 (żeby RC przeszło)

- UTF-8 home/landing/push
- header-height → --ph-header-h
- cache-bust home/app/css

## Live browser

1. `npm start`
2. Otwórz `/?realusers=1` lub konsola: `__RG_REAL_USERS__.run()`
3. Opcjonalnie PWA: zainstaluj → użyj offline → odinstaluj → zainstaluj ponownie

## Residual warnings (nie FAIL)

- Live browser smoke (install prompt / real GPS) nadal zalecany na urządzeniu
- OSM pendingOsmRefresh race (ETAP 36) — nie blokuje happy-path RC
- CART_ADDED learning asymmetry — nie blokuje koszyka użytkownika
- Image SW cache-first — świadoma strategia

---

*ETAP 38 · Release Candidate · PASS*
