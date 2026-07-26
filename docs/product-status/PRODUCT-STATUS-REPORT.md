# ETAP 32 — Product Status Report

**Data:** 2026-07-22  
**Produkt:** Regionaler Geschmack  
**Charakter:** największy raport statusu produktu — **tylko analiza**, bez nowych funkcji, bez zmian kodu.  
**Pytanie nadrzędne:** *Czy użytkownik będzie chciał korzystać z aplikacji codziennie i za nią zapłaci?*

---

## Werdykt (1 akapit)

Aplikacja ma **kompletny rdzeń produktu** (mapa · GPS · OSM · producenci · wyszukiwarka · ulubione · koszyk · Premium · PWA · offline · 36 języków · marka). To więcej niż typowa lokalna PWA.  
Jednocześnie **największe ryzyko nie leży w braku modułów**, tylko w **gęstości Home**, długu CSS i niepełnych assetach store.  
**Gotowość produktowa: 89 / 100.**  
**Odpowiedź na pytanie o codzienność + płatność:** *fundamenty są — emocja, lokalność, mapa. Retencja płatna zależy teraz od uproszczenia pierwszego ekranu i jasnej wartości Premium, nie od kolejnego silnika diagnostycznego.*

---

## 1. Product Readiness — wyniki

| Obszar | Score | Źródło / uzasadnienie |
|--------|------:|------------------------|
| **Product Readiness** | **89%** | Core complete; store screenshots i Home fold niedomknięte |
| **UX** | **87%** | Health UX 85%; Self Reflection „return” 80; Home fatigue |
| **Brand** | **94%** | Production Polish Brand 94; Brand Protection WARNING (7), FAIL 0 |
| **Performance** | **91%** | Health Perf 99% (statycznie); ryzyko: Home + map.js + legacy |
| **Mapa** | **96%** | Leaflet, clustery, lista, filtry, regiony, popup→modal |
| **GPS** | **95%** | Live track, follow, recenter, cache pozycji |
| **Premium** | **91%** | Trial / PayPal / polish 91; wartość „dlaczego codziennie” do dogrania |
| **Offline** | **92%** | SW + cache + kolejka; mapa/kafelki nadal zależne od sieci |
| **PWA** | **98%** | Manifest, ikony, install, SW `safeCachePut`, `check:pwa` |
| **SEO** | **93%** | Landing + OG/brand; brak twardego SEO content pipeline |
| **Accessibility** | **91%** | Health a11y 100% (heurystyka); ryzyka: emoji nav, ikoniczne kontrolki |
| **Kod** | **84%** | Moduły ES OK; `legacy/app.bundle.js` ~11.5k LOC; duże widoki |
| **Dług techniczny** | **16%** | CSS conflicts ~40; legacy drift; diagnostyka > produkt |

**Średnia ważona (produkt > narzędzia):** ≈ **90 / 100**

> Scores nie są marketingiem. Są zakotwiczone w Health (2026-07-21), Production Polish (91), Brand Protection (WARNING), Self Reflection (92), Expert Review (85), Master Report (86) oraz stanie repo z 2026-07-22.

---

## 2. Pytanie nr 1 — codzienność i płatność

| Pytanie | Ocena | Komentarz |
|---------|-------|-----------|
| Czy użytkownik wróci jutro? | **Raczej tak / warunkowo** | Smaki dnia, Living Region, GPS „w pobliżu” — tak. Home gęsty — ryzyko zmęczenia. |
| Czy zapłaci za Premium? | **Możliwe, nie pewne** | Trial + PayPal są. Brakuje codziennego „bez Premium boli”. |
| Co blokuje płatność? | — | Przeładowany Home, Premium vs darmowe niewyraźne, brak store social proof |
| Co już sprzedaje produkt? | — | Mapa lokalnych smaków, marka, atmosfera, 36 języków, PWA install |

**Priorytet nr 1 (nie nowy moduł):** uprościć Home + doprecyzować Premium value — potem store.

---

## 3. Wszystkie funkcje użytkownika

### Core (musi działać codziennie)

| Funkcja | Status |
|---------|--------|
| Mapa (Leaflet) | ✓ |
| GPS / lokalizacja | ✓ |
| OSM / producenci | ✓ |
| Modal producenta | ✓ |
| Produkty / katalog | ✓ |
| Wyszukiwarka | ✓ |
| Kategorie / filtry / promień | ✓ |
| Ulubione | ✓ |
| Koszyk | ✓ |
| Recenzje / zgłoszenia | ✓ |
| Premium (trial / PayPal) | ✓ |
| Profil / ustawienia | ✓ |
| Dark mode | ✓ |
| i18n (36 języków) | ✓ |
| PWA / instalacja | ✓ |
| Service Worker / cache | ✓ |
| Offline banner / sync queue | ✓ |
| Powiadomienia (push / SW) | ✓ |
| Landing page | ✓ |
| Auth / konta / referral | ✓ |
| Trasy zakupowe (favorites) | ✓ |
| Region presets (miasta) | ✓ |

### Warstwa emocji / prezentacji

| Funkcja | Status |
|---------|--------|
| Smaki dnia / Smart Today | ✓ |
| Doradca smaku | ✓ |
| Living Region / Region Soul | ✓ |
| Magia powrotu | ✓ |
| Ambient nature (dźwięk) | ✓ |
| Historia miejsca / trust | ✓ |
| Learning lokalne („Dla Ciebie”) | ✓ |

### Dev-only / ops (nie produkt użytkownika)

| Narzędzie | Status |
|-----------|--------|
| Health Monitor | ✓ (dev) |
| AI Guardian | ✓ (CLI) |
| Dream / Product Brain / Emotion AI | ✓ (dev) |
| Living Brand / Quality Loop | ✓ (dev) |
| Guardian of the Future | ✓ (dev) |
| Virtual User / Real Users | ✓ (dev) |
| Daily / Weekly reports | ✓ (dev) |
| Brand Protection | ✓ (CLI) |
| Self Reflection / Self Heal | ✓ (dev) |

---

## 4. Wszystkie błędy i ryzyka

### Critical

| # | Problem | Uwagi |
|---|---------|--------|
| — | **Brak otwartych CRITICAL w ostatnim Health / full-audit** | Functional audit: OK 54 / błędy 0 (przy timeout OSM → stale) |

### High

| # | Problem | Obszar |
|---|---------|--------|
| H1 | Home przeładowany — ryzyko „nie wrócę jutro” | UX / retencja |
| H2 | `js/legacy/app.bundle.js` vs żywe moduły — dryf | Kod |
| H3 | Store: brak kompletnych screenshotów Play/App Store | Go-to-market |
| H4 | OSM/Overpass bywa timeout — UX „pusta mapa” przy złej sieci | Mapa / dane |

### Medium

| # | Problem | Obszar |
|---|---------|--------|
| M1 | Health: ~40 potencjalnych konfliktów CSS | UI / dług |
| M2 | Brand Protection: 7× WARNING (radius pills, logo meta) | Brand |
| M3 | i18n: brakujący klucz `menu.sectionDev` w większości języków | i18n |
| M4 | Health translation score ~84% (luki poza DE/EN/PL) | i18n |
| M5 | Production Polish: możliwe mojibake w meta/aria | UI |
| M6 | Brak E2E instalacji PWA w CI (tylko checklista ręczna) | PWA / CI |
| M7 | Analytics (GA) często placeholder | Ops |

### Low

| # | Problem | Obszar |
|---|---------|--------|
| L1 | Emoji w bottom nav — nie design-system icon set | UI |
| L2 | Duże pliki widoków (`map.js` ~2670 LOC, `home.js` ~1510) | Kod |
| L3 | Virtual User pełny tylko w przeglądarce | Testy |
| L4 | Soft splash CSS ≠ natywny splash iOS | PWA |

---

## 5. Co można usunąć (bez nowych funkcji)

| Kandydat | Powód | Ryzyko |
|----------|-------|--------|
| Martwy / rzadko używany kod w `js/legacy` (po wycofaniu iOS9) | ~11.5k LOC obciążenia | medium — najpierw decyzja o supportcie |
| Duplikaty reguł CSS (heurystyka Health) | konflikty, trudniejszy brand lock | medium |
| Nieużywane klucze i18n / luki tylko-dev (`menu.sectionDev`) | szum tłumaczeń | low |
| Nadmiar paneli diagnostycznych w świadomości produktu | użytkownik nie potrzebuje 15 „mózgów” | n/a (zostają jako CLI) |
| Robocze assety / probe (jeśli wrócą) | ciężar repo | low |
| Kolejny etap funkcji / nowy raport AI | **świadomie: STOP** | — |

---

## 6. Co można uprościć

| Ekran | Propozycja uproszczenia | Efekt |
|-------|-------------------------|--------|
| **Home** | 1 hero + 1 CTA (mapa/okolica) + 1 belka „dziś”; reszta niżej | retencja, mniej clutteru |
| **Mapa** | Już mocna; pilnować liczby kontrolek (region / GPS / OSM / lista) | mniej tarcia |
| **Premium** | Jedna obietnica („codzienny region bez reklam / więcej smaku”) + 1 CTA | konwersja |
| **Profile** | Grupować ustawienia; schować dev | czytelność |
| **Landing** | Jedna kompozycja: marka + 1 zdanie + CTA do app | brand test |

---

## 7. Co już jest gotowe

| Obszar | Status | Dowód |
|--------|--------|-------|
| **PWA** | Gotowe | manifest, SW, install banner, ikony, `check:pwa` |
| **Brand** | Gotowe (z WARNING) | Brand Book, logo-master, lock, protection FAIL=0 |
| **Manifest / ikony** | Gotowe | 14 ikon, maskable, apple-touch, theme `#2a3f28` |
| **SEO bazowe** | Gotowe | landing + OG share |
| **Play Store — ikona** | Częściowo | `assets/store/google-play/icon-512.png` + feature graphic source |
| **App Store — ikona** | Częściowo | `assets/store/app-store/icon-1024.png` |
| **Play / App — listing** | **Niegotowe** | brak pełnego zestawu screenshotów (Brand Book §9) |
| **Core produkt** | Gotowe | mapa→producent→ulubione/koszyk |
| **i18n** | Gotowe z lukami | 36 języków; 1 klucz `menu.sectionDev` brakuje szeroko |
| **Diagnostyka właściciela** | Gotowe | Health…Future — autoApply=false |

---

## 8. Co jeszcze brakuje do wersji 1.0

**Dokładnie 5 rzeczy (kolejność priorytetu):**

1. **Uproszczenie Home (fold 1 viewport)** — jeden bohater, jedna akcja, mniej sekcji narracyjnych na starcie.  
2. **Jasna wartość Premium na co dzień** — co użytkownik traci bez subskrypcji (bez dodawania nowych silników).  
3. **Komplet store listing** — 5 screenshotów + feature graphic 1024×500 + krótkie copy DE/EN/PL.  
4. **Porządki CSS / brand warnings** — zejść z ~40 konfliktów i 7 Brand WARNING (za akceptacją).  
5. **Checklista release na urządzeniu** — instalacja Android + iOS, GPS, OSM offline/timeout, płatność trial (ręcznie; bez nowego modułu CI).

---

## 9. Metryki repo (stan 2026-07-22)

| Metryka | Wartość |
|---------|---------|
| Pliki (bez node_modules) | ~744 |
| `.js` / `.mjs` / `.css` | 146 / 143 / 30 |
| Widoki | 12 (`home`, `map`, `premium`, `favorites`, `cart`, `profile`, …) |
| Diagnostyka JS | 26 plików |
| Skrypty npm | 104 |
| SW cache | `rg-pwa-v24` (+ `safeCachePut`) |
| `map.js` / `home.js` / `style.css` | ~2670 / ~1510 / ~7120 LOC |
| Legacy bundle | ~11553 LOC |

---

## 10. Jak korzystać z tego raportu codziennie

1. Rano: przeczytaj **Werdykt** + tabelę scores — czy coś spadło po wczorajszym Health.  
2. Pracuj tylko nad pozycjami z sekcji **8 (braki 1.0)** lub **High**.  
3. **Nie dodawaj** nowych funkcji / modułów diagnostycznych.  
4. Wieczorem: `npm run health` (+ opcjonalnie `brand-protection`) — zaktualizuj scores w kolejnej rewizji tego pliku.  
5. Canvas obok czatu: szybki podgląd scores i braków 1.0.

**Rewizje:** dopisuj datę i delta score na dole pliku.

### Changelog rewizji

| Data | Zmiana |
|------|--------|
| 2026-07-22 | Utworzenie ETAP 32 — baseline Product Status |

---

## Aneks — komendy (bez wdrażania zmian)

```bash
npm run health
npm run brand-protection
npm run check:pwa
npm run check:translations
npm run production-polish
```

---

*Koniec ETAP 32 — Product Status Report. Następny ruch produktowy: uproszczenie, nie ekspansja.*
