# ETAP 32D — Release Checklist

**Data:** 2026-07-22  
**Produkt:** Regionaler Geschmack  
**Polityka:** tylko checklista · **bez zmian kodu**  
**Statusy:** `PASS` · `WARNING` · `FAIL`

### Legenda

| Status | Znaczenie |
|--------|-----------|
| **PASS** | Spełnione w kodzie/assetach + smoke CLI; gotowe do releasu w tym zakresie |
| **WARNING** | Działa częściowo / wymaga testu ręcznego na urządzeniu / drobne luki |
| **FAIL** | Blokuje publikację w danym kanale (np. store listing) |

### Werdykt kanałów

| Kanał | Status | Komentarz |
|-------|--------|-----------|
| **PWA (HTTPS produkcja)** | **WARNING** | Core PASS; Home fold + meta + privacy URL do domknięcia |
| **Google Play / App Store** | **FAIL** | Store Readiness 48% — brak screenshotów, feature 1024×500, privacy URL |
| **APK natywny** | **FAIL** | `downloads/app.apk` = placeholder, nie signed build |

---

## 1. Android

| # | Check | Status | Uwagi |
|---|--------|--------|-------|
| A1 | PWA w Chrome Android (Add to Home Screen / install) | WARNING | Kod + `check:pwa` PASS; **wymaga testu urządzenia** |
| A2 | Ikona launcher / maskable | PASS | `maskable-512.png`, Play `icon-512.png` 512×512 |
| A3 | Safe-area / bottom nav | WARNING | CSS safe-area; ręczny test notch |
| A4 | GPS permission flow | WARNING | Geolocation w mapie; ręczny test odmowy/zgody |
| A5 | Google Play listing kompletny | FAIL | Brak screenshotów + feature 1024×500 + copy (32B) |
| A6 | Signed release APK/AAB | FAIL | Placeholder w `downloads/app.apk` |

**Sekcja Android: FAIL** (blokuje sklep; PWA możliwa jako WARNING)

---

## 2. iPhone

| # | Check | Status | Uwagi |
|---|--------|--------|-------|
| I1 | Safari Add to Home Screen | WARNING | `apple-mobile-web-app-*`, `apple-touch-icon`; **test ręczny iOS** |
| I2 | Status bar / theme | PASS | `theme-color` `#2a3f28`, apple status bar meta |
| I3 | Brak pełnego `beforeinstallprompt` (oczekiwane) | PASS | Baner/menu instalacji; iOS inna ścieżka |
| I4 | App Store listing | FAIL | Brak screenshotów AS + copy EN/DE store + privacy URL |
| I5 | Splash natywny iOS | WARNING | Soft splash CSS ≠ pełny launch storyboard |

**Sekcja iPhone: FAIL** (sklep) / **WARNING** (PWA na urządzeniu)

---

## 3. Tablet

| # | Check | Status | Uwagi |
|---|--------|--------|-------|
| T1 | Layout ≥768px | WARNING | Breakpointy w CSS; brak dedykowanego testu E2E |
| T2 | Mapa usable na iPad / Android tablet | WARNING | Leaflet + invalidateSize; test ręczny |
| T3 | Screenshoty tablet (store opcjonalne) | FAIL | Brak assetów store tablet |
| T4 | Touch targets | WARNING | Production Polish mobile 91; tablet nieosobno audytowany |

**Sekcja Tablet: WARNING**

---

## 4. PWA

| # | Check | Status | Uwagi |
|---|--------|--------|-------|
| P1 | `manifest.json` (name, icons, display, theme) | PASS | `npm run check:pwa` OK |
| P2 | Service Worker rejestracja | PASS | `sw.js?v=22`, cache `rg-pwa-v24` |
| P3 | `safeCachePut` (anty-206) | PASS | Wdrożone w SW |
| P4 | Install prompt / menu | PASS | `pwaInstall.js` + side menu |
| P5 | Ikony 192/512 + apple-touch | PASS | Obecne na dysku |
| P6 | HTTPS / produkcyjny host | WARNING | Wymaga środowiska deploy (poza repo) |

**Sekcja PWA: PASS** (z WARNING hosta)

---

## 5. Offline

| # | Check | Status | Uwagi |
|---|--------|--------|-------|
| O1 | SW precache / fallback nawigacji | PASS | `check:pwa` |
| O2 | Banner offline na mapie | PASS | `bindOfflineBanner` |
| O3 | Kolejka sync (`offlineSync` + background sync tag) | PASS | Kod obecny |
| O4 | Mapa / kafelki OSM bez sieci | WARNING | Oczekiwane ograniczenie — pusta/stara mapa |
| O5 | Dane producentów ze stale cache | WARNING | Cache v9; timeout Overpass → stale (functional audit) |

**Sekcja Offline: WARNING**

---

## 6. Premium

| # | Check | Status | Uwagi |
|---|--------|--------|-------|
| R1 | Widok Premium + trial | PASS | `premium.js` / `premiumService` |
| R2 | PayPal / checkout zewnętrzny | WARNING | Flow w kodzie; **test płatności na prod** |
| R3 | Status aktywny w UI | PASS | Home CTA / teaser |
| R4 | Jasna wartość „dlaczego codziennie” | WARNING | Product Status 32 — do doprecyzowania copy |
| R5 | Dev ukryty na prod | PASS | Production Polish checklist |

**Sekcja Premium: WARNING**

---

## 7. GPS

| # | Check | Status | Uwagi |
|---|--------|--------|-------|
| G1 | Geolocation + cache pozycji | PASS | `userLocation.js` |
| G2 | Live tracking / follow / recenter | PASS | `map.js` toolbar GPS |
| G3 | UI stany tracking/fetching | PASS | `#mapGpsBtn` classes |
| G4 | Test na urządzeniu (zgoda / odmowa / indoor) | WARNING | Tylko ręcznie |
| G5 | Region picker UI | PASS* | Usunięty świadomie; GPS zostaje |

**Sekcja GPS: PASS** (WARNING = test terenowy)

---

## 8. Mapa

| # | Check | Status | Uwagi |
|---|--------|--------|-------|
| M1 | Leaflet + markery + clustery | PASS | Architektura mapy |
| M2 | Popup → modal producenta | PASS | |
| M3 | Filtry kategorii / promień / lista | PASS | |
| M4 | OSM / Overpass mirrors | WARNING | Timeout możliwy → stale / pusta okolica |
| M5 | SW cache 206 audio/map assets | PASS | `safeCachePut` |
| M6 | Test interakcji touch (popup ghost-click) | WARNING | Guard w kodzie; regresja ręczna |

**Sekcja Mapa: PASS** (WARNING sieć OSM)

---

## 9. Instalacja

| # | Check | Status | Uwagi |
|---|--------|--------|-------|
| N1 | Baner / prompt instalacji PWA | PASS | |
| N2 | Logo na banerze = master | PASS | Production Polish |
| N3 | Instalacja z landing → app | WARNING | Landing `check:landing` OK; ścieżka E2E ręczna |
| N4 | Instalacja ze sklepu (Play/AS) | FAIL | Listing niekompletny (32B) |

**Sekcja Instalacja: WARNING** (PWA) / **FAIL** (store)

---

## 10. Aktualizacja

| # | Check | Status | Uwagi |
|---|--------|--------|-------|
| U1 | Cache-bust `?v=` na app/SW/manifest | PASS | Wzorzec w `index.html` |
| U2 | SW `skipWaiting` + `clients.claim` | PASS | `sw.js` |
| U3 | UX „nowa wersja — odśwież” | WARNING | Brak dedykowanego promptu update (twardy reload) |
| U4 | Migracja cache producentów | PASS | `rg_producers_data_v9` + legacy clear |

**Sekcja Aktualizacja: WARNING**

---

## 11. Powiadomienia

| # | Check | Status | Uwagi |
|---|--------|--------|-------|
| Q1 | Web Push / SW `push` + `notificationclick` | PASS | `sw.js` + `pushNotifications.js` |
| Q2 | VAPID w CONFIG | PASS | Klucz publiczny w `config.js` |
| Q3 | Smoke `npm run check:push` | PASS | OK |
| Q4 | Backend push / zgoda użytkownika na prod | WARNING | Zależne od hostingu i ustawień profilu |
| Q5 | Ikona powiadomień = brand | PASS | `DEFAULT_ICON` / brand notifications |

**Sekcja Powiadomienia: WARNING**

---

## 12. Accessibility

| # | Check | Status | Uwagi |
|---|--------|--------|-------|
| X1 | Health a11y (heurystyka) | PASS | 100% w ostatnim Health |
| X2 | Kontrast header / install dismiss | PASS | Brand / Polish |
| X3 | Emoji nav / kontrolki ikoniczne | WARNING | Expert review — etykiety do dogrania |
| X4 | Modal focus / Escape | WARNING | Guard w modalu; test klawiatury ręczny |
| X5 | Mojibake / `??` w menu | WARNING | `index.html` side menu |

**Sekcja Accessibility: WARNING**

---

## 13. SEO

| # | Check | Status | Uwagi |
|---|--------|--------|-------|
| S1 | Landing page | PASS | `check:landing` OK |
| S2 | OG / Twitter image | PASS | `og-share.png` |
| S3 | Meta description UTF-8 | FAIL | Mojibake `N?he` w `index.html` / `landing.html` |
| S4 | Manifest description DE | PASS | Poprawny tekst w `manifest.json` |
| S5 | Indeksacja / robots / canonical prod | WARNING | Zależne od deploy |

**Sekcja SEO: WARNING** (FAIL na meta UTF-8)

---

## 14. Performance

| # | Check | Status | Uwagi |
|---|--------|--------|-------|
| F1 | Health Performance | PASS | 99% (statyczny) |
| F2 | Production Polish Performance | PASS | 96 |
| F3 | Home pierwszy paint (wiele sekcji) | WARNING | Fold score 62 (32A); dług CSS |
| F4 | Audio repo bloat (WAV + `_src`) | WARNING | ~34 MB — ryzyko deploy size (32C) |
| F5 | Legacy bundle 644 KB na `nomodule` | WARNING | Dryf vs modules |
| F6 | MarkerCluster / WebP produktów | PASS | |

**Sekcja Performance: WARNING**

---

## 15. Store

| # | Check | Status | Uwagi |
|---|--------|--------|-------|
| Z1 | Ikona Play 512 | PASS | |
| Z2 | Ikona App Store 1024 | PASS | |
| Z3 | Feature graphic 1024×500 | FAIL | Tylko source 1024×1024 |
| Z4 | 5 screenshotów | FAIL | Brak folderu |
| Z5 | Opis DE/EN + short | FAIL | Brak pakietu listing |
| Z6 | Privacy URL publiczny | FAIL | Tylko in-app |
| Z7 | Kontakt | PASS | Mail + adres |
| Z8 | Overall Store Readiness | FAIL | **48 / 100** (ETAP 32B) |

**Sekcja Store: FAIL**

---

## 16. Brand

| # | Check | Status | Uwagi |
|---|--------|--------|-------|
| B1 | Logo master / Brand Book | PASS | |
| B2 | Manifest theme/background | PASS | `#2a3f28` / `#f5efe3` |
| B3 | Brand Protection | WARNING | Status WARNING · FAIL 0 · 7 ostrzeżeń |
| B4 | Literata + Source Sans 3 | PASS | |
| B5 | Store icons = master | PASS | Visual brand / store README |
| B6 | Home logo ukryte na mobile (polish) | WARNING | Osłabia brand w foldzie (32A) |

**Sekcja Brand: WARNING**

---

## Macierz podsumowania

| Obszar | Status |
|--------|--------|
| Android | **FAIL** |
| iPhone | **FAIL** |
| Tablet | **WARNING** |
| PWA | **PASS** |
| Offline | **WARNING** |
| Premium | **WARNING** |
| GPS | **PASS** |
| Mapa | **PASS** |
| Instalacja | **WARNING** |
| Aktualizacja | **WARNING** |
| Powiadomienia | **WARNING** |
| Accessibility | **WARNING** |
| SEO | **WARNING** |
| Performance | **WARNING** |
| Store | **FAIL** |
| Brand | **WARNING** |

### Liczniki (sekcje główne)

| PASS | WARNING | FAIL |
|-----:|--------:|-----:|
| 3 | 10 | 3 |

*(Android / iPhone / Store = FAIL jako kanał sklepu; PWA/GPS/Mapa = PASS)*

---

## Go / No-Go

| Cel releasu | Decyzja | Warunek |
|-------------|--------|---------|
| **Soft launch PWA (HTTPS)** | **GO z ostrzeżeniami** | Napraw meta UTF-8; checklista ręczna Android+iPhone; privacy URL zalecany |
| **Google Play / App Store** | **NO-GO** | Screenshoty + feature 1024×500 + privacy URL + copy DE/EN |
| **APK/AAB natywny** | **NO-GO** | Brak signed build |

---

## Checklista ręczna przed soft launch PWA (must)

1. [ ] Ctrl+Shift+R na prod → Home, Mapa, GPS, Premium  
2. [ ] Android Chrome: instalacja + ikona + offline airplane  
3. [ ] iPhone Safari: Add to Home Screen + modal producenta  
4. [ ] Odmowa GPS → app nie pada  
5. [ ] OSM timeout → komunikat / stale, nie biały ekran  
6. [ ] Powiadomienia: zgoda + test lokalny (jeśli włączone)  
7. [ ] `npm run check:pwa` · `check:push` · `brand-protection` · `health`

---

## Źródła

- ETAP 32B Store Readiness · 32C Technical Debt · 32A Home Premium  
- `npm run check:pwa` · `check:push` · `check:landing`  
- Health / Production Polish / Brand Protection latest  
- `manifest.json` · `sw.js` · Brand Book §9  

---

*Koniec ETAP 32D — Release Checklist. Bez zmian kodu.*
