# ETAP 45-C — Real Device Validation & Release Certification

**Data:** 2026-08-06  
**Werdykt:** **CONDITIONAL**  
**CONDITIONAL — auto PASS · manual 0/8 pending**

> Testy automatyczne ≠ sukces na urządzeniu. **Live only** — zero cache · zero override · FAIL pozostaje FAIL.

## Werdykt

| Warstwa | Wynik |
|---------|--------|
| Bramki automatyczne (live) | **9/9** PASS |
| Macierz manualna (real device) | **0/8** pass · 8 pending · 0 fail |
| Sign-off (signedBy/signedAt) | **NIE** |
| **Certification** | **CONDITIONAL** |

### Skala

| Certification | Warunek |
|---------------|---------|
| **CERTIFIED** | Live auto PASS + manual 8/8 pass + signedBy |
| **CONDITIONAL** | Live auto PASS · brak pełnego sign-off |
| **BLOCKED / FAIL** | Auto FAIL lub manual FAIL |

## ETAP 42 — zakres do potwierdzenia na urządzeniu

| ID | Obszar | Auto | Manual |
|----|--------|------|--------|
| 42A | PWA version v30 (SW/manifest/bundle) | ✅ check:pwa-version | pending |
| 42B | Icon refresh po update | ✅ check:icon-refresh | pending |
| 42C | Dev Panel · PIN (phone/LAN/PWA) | ✅ check:dev-access | pending |
| 42D | Diagnostyka lazy · prod shell | ✅ orchestrator | pending |
| 42E | Runtime Error Feed mobile | ✅ error-feed | pending |
| 42F | Bootstrap cold start | ✅ bootstrap | pending |
| 42G | Pełny suite | ✅ etap-42g | — (auto) |

## Bramki automatyczne

| Gate | Status |
|------|--------|
| ETAP 42G full suite | ✅ PASS |
| Release Candidate 22/22 | ✅ PASS |
| Device Lab matrix | ✅ PASS |
| PWA version v30 sync | ✅ PASS |
| Icon refresh v30 | ✅ PASS |
| Dev Vault PIN access | ✅ PASS |
| Diagnostics lazy orchestrator | ✅ PASS |
| Runtime Error Feed | ✅ PASS |
| Bootstrap Before/After | ✅ PASS |

## Macierz manualna — jak prawdziwy użytkownik


### 42A-pwa-version — PWA / SW / wersja (42A)

**Urządzenia:** iPhone PWA · Android PWA · Desktop  
**Status:** `pending`

1. Zainstaluj PWA z produkcji lub LAN
1. DevTools → Application → Service Worker: scriptURL zawiera ?v=30
1. Po deploy nowej wersji: SW skipWaiting + odświeżenie bez rozjechanych cache v28/v29

**Pass:** Jedna wersja PWA (30) w SW, manifest, ikonach, bundle


### 42B-icons — Ikony launcher / splash / favicon (42B)

**Urządzenia:** iPhone · Android · Desktop  
**Status:** `pending`

1. Po update PWA: ikona na ekranie domowym pokazuje aktualny master (dwa kłosy)
1. Splash / favicon / maskable — bez starej ikony z cache
1. Powiadomienie push (jeśli włączone) — ikona ?v=30

**Pass:** Ikony odświeżone po update bez odinstalowania


### 42C-dev-panel-phone — Panel deweloperski · PIN (42C)

**Urządzenia:** iPhone Safari · iPhone PWA · Android Chrome · LAN telefon  
**Status:** `pending`

1. ☰ → Panel deweloperski — widoczny bez localhost/desktop gate
1. PIN 1973 → Control Center otwarty fullscreen na telefonie
1. Zły PIN → bramka, brak narzędzi
1. Zablokuj → ponowne wejście wymaga PIN

**Pass:** Ten sam mechanizm PIN na telefonie, LAN i PWA


### 42D-prod-boot — Diagnostyka lazy · produkcja (42D)

**Urządzenia:** Produkcja PWA · Telefon bez ?dev=1  
**Status:** `pending`

1. Cold start produkcji (bez ?dev=1, bez rg_dev_mode)
1. Aplikacja startuje normalnie — mapa, koszyk, premium działają
1. Brak FAB Health/Dashboard na ekranie użytkownika
1. Dopiero PIN → lazy load diagnostyki

**Pass:** Użytkownik nie płaci kosztu 18 modułów diag przy starcie


### 42E-error-feed-mobile — Runtime Error Feed (42E)

**Urządzenia:** iPhone PWA · Android  
**Status:** `pending`

1. PIN → Runtime Error Feed
1. Lista kategorii scrolluje poziomo (mobile)
1. Dotknij wpis → stack / szczegóły
1. Odśwież · Kopiuj JSON · Zamknij — bez DevTools

**Pass:** Feed czytelny i używalny na telefonie


### 42F-cold-start-feel — Bootstrap · cold start (42F)

**Urządzenia:** iPhone PWA · Android PWA · Desktop  
**Status:** `pending`

1. Force-quit PWA → uruchom ponownie
1. Splash znika · Home/Map gotowe bez zawieszenia
1. Opcjonalnie: __RG_BOOTSTRAP__.report() po ?dev=1 — bootstrapMs ~50ms shell

**Pass:** Subiektywnie szybszy cold start vs ETAP 41 (brak lag diagnostyki)


### 43-user-journey — Ścieżka użytkownika (regresja) (43)

**Urządzenia:** Wszystkie  
**Status:** `pending`

1. Home → Mapa → producent → ulubione → koszyk
1. GPS / w pobliżu — mapa reaguje
1. Tryb offline → banner → powrót online
1. Zmiana języka · dark mode · powrót następnego dnia (persist)

**Pass:** Zero regresji produktu po ETAP 42


### 43-map-toolbar — Mapa · toolbar / footer (42 P0)

**Urządzenia:** iPhone SE · iPhone 15 · Android  
**Status:** `pending`

1. Mapa: dolny toolbar nie zasłania popupów
1. Rozwinięty header nie psuje viewport mapy
1. Scroll listy producentów na mapie — bez horizontal overflow

**Pass:** Mapa używalna na małym i dużym telefonie


## Sign-off właściciela (real device)

1. Wykonaj macierz na **iPhone (Safari + PWA)** i **Android (Chrome + PWA)** minimum.
2. LAN: `npm start` → telefon `http://192.168.x.x:3456`
3. Wypełnij `docs/certification/manual-device-results.json` (szablon poniżej).
4. Uruchom ponownie: `npm run etap-43-certification`

```json
{
  "signedBy": "właściciel",
  "signedAt": "2026-08-06T21:21:02.876Z",
  "results": [
    { "id": "42A-pwa-version", "status": "pass", "device": "iPhone 15 PWA", "testedAt": "2026-08-06", "notes": "" }
  ]
}
```

## Decyzja release

Nie release bez manual sign-off na telefonie/PWA.

---
*ETAP 45-C · live-only · autoApply=false · pending_acceptance do manual sign-off*
