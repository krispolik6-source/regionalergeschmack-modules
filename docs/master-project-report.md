# Regionaler Geschmack — Master Project Report (ETAP 20)

**Data raportu:** 2026-07-21  
**Zakres:** stan repozytorium `regionalergeschmack-modules`  
**Polityka tego dokumentu:** wyłącznie raport — **bez zmian kodu, bez napraw**.

---

## 0. Pozycjonowanie produktu (dla kogo / po co)

### Dla kogo jest aplikacja

Dla osób, które chcą **jeść i kupować lokalnie** w regionie (Teutoburger Wald / okolica): mieszkańców, turystów, rodzin, osób szukających świeżych produktów, gospodarstw, piekarni, mięsa, sklepów i miejsc z charakterem — nie „kolejnej ogólnej mapy”.

### Jaki problem rozwiązuje

Problem **odkrywania prawdziwych, lokalnych producentów i smaków** w jednym, ciepłym miejscu: mapa + kategorie + produkty + godziny + trasy zakupowe + emocja regionu — zamiast rozproszonych Google’owych pinów bez kontekstu smaku.

### Czym różni się od Google Maps

| Google Maps | Regionaler Geschmack |
|-------------|----------------------|
| Uniwersalna nawigacja wszystkiego | Fokus: **żywność regionalna i producenci** |
| Ranking/SEO reklamowy | Ranking pod kątem lokalności, sezonu, zaufania, historii |
| „Miejsce na mapie” | **Opowieść miejsca**, smaki dnia, żywy region |
| Trasa A→B | Trasa **zakupowa między producentami** |

### Czym różni się od TripAdvisora

TripAdvisor = recenzje podróży/restauracji globalnie.  
RG = **lokalny ekosystem żywności**: gospodarstwa, piekarnie, produkty, oferty, mapa regionu, PWA offline-friendly, bez typowego „rankingu turystycznego”.

### Czym różni się od Yelp

Yelp = katalog biznesów + recenzje w miastach.  
RG = **marka regionalnego smaku**, emocje (doradca smaku, dusza regionu, magia powrotu), produkty i kategorie żywności, nie ogólny „local business directory”.

### Czym różni się od Too Good To Go

TGTG = ratowanie nadwyżek żywności z dyskontem czasowym.  
RG = **odkrywanie i wspieranie lokalnych producentów na co dzień**, nie tylko „okazja na ostatnią chwilę”.

### Co ma poczuć użytkownik po otwarciu

Ciepło, spokój, lokalność, „jestem w regionie” — zaproszenie do smaku, nie dashboard.

### Jakie emocje ma wywoływać

Zaufanie · nostalgia łąki/pszenicy · ciekawość · bliskość · duma z lokalności · spokojna radość odkrywania.

### Filozofia projektu

**Jedna marka Premium regionalnego smaku** — mapa jest narzędziem, nie bohaterem; bohaterem jest **miejsce, produkt i człowiek za ladą**. Aplikacja ma być PWA, lokalna (uczenie się bez wysyłania zachowań), diagnostyczna dla deweloperów, ale dla użytkownika — ciepła i prosta.

---

## 1. Struktura projektu

### Drzewo katalogów (główne)

```
regionalergeschmack-modules/
├── assets/
│   ├── brand/              # OG, splash, notifications
│   ├── icons/              # logo-master + PWA icons
│   ├── images/             # products, backgrounds, categories, motifs, chains…
│   └── store/              # Google Play / App Store
├── css/                    # style + brand + prezentacja
├── docs/                   # health, daily, advisor, brand, reports…
├── downloads/
├── js/
│   ├── auth/
│   ├── controllers/         # navigation
│   ├── core/               # EventBus, settings, premium, PWA…
│   ├── data/               # producers, products, reviews…
│   ├── diagnostics/        # Health, Improve, Virtual, Advisor, Daily, Dashboard…
│   ├── legacy/             # app.bundle.js
│   ├── map/                # Leaflet wrapper
│   ├── presentation/       # UI presentation modules
│   └── views/              # home, map, cart, profile…
├── scripts/                # audyty, generatory, testy CLI
├── tools/ai-guardian/      # AI Guardian
├── index.html
├── landing.html
├── manifest.json
└── sw.js
```

*(~43 katalogi robocze poza `node_modules`)*

### Liczba plików

| Metryka | Wartość (ok.) |
|---------|----------------|
| Pliki w repo (bez node_modules) | **~472** |
| `.js` | 120 |
| `.mjs` | 78 |
| `.css` | 23 |
| `.html` | 6 |
| `.json` | 29 |
| `.md` | 26 |
| `.svg` | 26 |
| `.webp` / `.jpg` (produkty + tła + probe) | ~134 |
| `.png` (ikony + brand) | 20 |

### Liczba linii kodu

| Zakres | Linie (ok.) |
|--------|-------------|
| JS + MJS + CSS + HTML (bez node_modules) | **~71 121** |
| w tym `js/legacy/app.bundle.js` | ~11 553 |
| `css/style.css` | ~6 735 |

*Uwaga: bundle legacy mocno zawyża sumę; „żywy” kod aplikacji to głównie `js/` bez legacy + `css/`.*

### Największe pliki (LOC)

| Plik | LOC (ok.) |
|------|-----------|
| `js/legacy/app.bundle.js` | 11 553 |
| `css/style.css` | 6 735 |
| `js/views/map.js` | 2 557 |
| `js/translations.js` | 1 599 |
| `js/views/home.js` | 1 490 |
| `js/translations-about.js` | 1 447 |
| `js/views/producerModal.js` | 991 |
| `js/map/map.js` | 778 |
| `js/diagnostics/virtualUser.js` | 657 |
| `js/data/dataService.js` | 611 |

### Największe moduły JS (liczba plików)

| Moduł | Pliki `.js` |
|-------|-------------|
| `js/data` | 23 |
| `js/presentation` | 23 |
| `js/core` | 14 |
| `js/views` | 12 |
| `js/diagnostics` | 8 |
| `js/auth` | 4 |
| `js/map` | 4 |
| `js/legacy` | 3 |
| `js/controllers` | 1 |

---

## 2. Architektura

### Styl

**Vanilla JS PWA (ES modules)** — bez React/Vue. Warstwy:

1. **Shell / bootstrap** — `js/app.js`
2. **Core** — EventBus, i18n, settings, premium, PWA, offline, analytics
3. **Data** — producenci, produkty, recenzje, trasy…
4. **Views** — ekrany (home, map, cart…)
5. **Presentation** — warstwa wizualna / narracyjna (bez zmiany API mapy)
6. **Diagnostics** — Health, Learning, Improve, Virtual User, Advisor, Daily, Dashboard, Weekly (dev)

### Moduły (skrót)

| Obszar | Rola |
|--------|------|
| `controllers/navigation.js` | Routing widoków, `navigateTo`, `VIEW_CHANGED` |
| `core/eventBus.js` + `events.js` | Pub/sub zdarzeń |
| `core/settings.js` | język, dark mode |
| `core/premiumService.js` | trial / PayPal / status Premium |
| `core/userLocation.js` | cache GPS |
| `core/pwaInstall.js` | baner instalacji |
| `core/offlineSync.js` | kolejka offline |
| `core/userHistory.js` + `learningEngine.js` | lokalna historia / uczenie |
| `data/dataService.js` | dostęp do producentów / upsert |
| `map/map.js` + `views/map.js` | Leaflet + UI mapy |
| `views/*` | ekrany |
| `presentation/*` | rekomendacje, smaki dnia, living region… |
| `diagnostics/*` | narzędzia jakości (dev) |
| `tools/ai-guardian` | skaner CLI jakości kodu/UX/content |

### Zależności (wysoki poziom)

```
app.js
  ├─ EventBus / navigation
  ├─ views (home, map, cart, favorites, profile, premium…)
  │    ├─ dataService / producers / products
  │    └─ presentation (smartRecommend, tasteAdvisor…)
  ├─ map (Leaflet)
  ├─ auth / premium / PWA / offline
  └─ diagnostics (dev-only / opt-in)
```

### EventBus

Centralny `eventBus` (`on` / `emit` / `off`). Kluczowe zdarzenia: `view:changed`, `category:selected`, `food:search:products`, `location:*`, `favorites:changed`, `cart:*`, `detail:show/hide`, `language:changed`, `theme:changed`.

### Store

Brak Redux/Vuex. Stan w:

- pamięci modułów + DOM widoków  
- **localStorage** (ulubione, koszyk, settings, historia, learning, diagnostyka)  
- opcjonalnie IndexedDB (Learning Engine signals)

### Routing

„Routing” = **przełączanie widoków** w `#app` przez `navigateTo(view)` — widoki: `home | map | premium | favorites | cart | profile` (+ specjalne `search` → home z fokusem). Hash/query wspierane lekko w `initNavigation`.

### API

Brak klasycznego backendu w tym repo jako „jedynego źródła”. Dane producentów/produktów głównie lokalne (`contentProducers`, enrichment). Integracje: OSM/kontekst mapy, PayPal.me (checkout zewnętrzny), opcjonalnie Supabase/GA gdy skonfigurowane, push przez SW.

### GPS

`geolocation` + zdarzenia `LOCATION_*` / `NEARBY_SEARCH`; cache `rg_last_position`; mapa reaguje na lokalizację użytkownika.

### Leaflet

Mapa w `js/map` + `js/views/map.js` — markery, clustery, popup, filtry promienia/kategorii. **Architektura mapy traktowana jako nietykalna w etapach prezentacyjnych.**

### PWA

`manifest.json`, ikony, `theme_color` / `background_color`, `display: standalone`, baner instalacji, apple-touch.

### Service Worker

`sw.js` — precache assetów/ikon, strategia cache, ikony powiadomień (`DEFAULT_ICON`), komunikacja offline flush.

---

## 3. Wszystkie ekrany aplikacji

| Ekran | Opis | Funkcje | Komponenty / moduły |
|-------|------|---------|---------------------|
| **Home** | Hub emocji i odkrywania | kategorie, wyszukiwanie, Polecane/Dla Ciebie, smaki dnia, living region, doradca, premium CTA | `home.js`, presentation/*, product cards |
| **Mapa** | Mapa producentów | GPS, filtry, promień, search, markery, popup → modal | `views/map.js`, `map/map.js`, Leaflet |
| **Producent (modal)** | Pełny detal | opis, produkty, godziny, recenzje, koszyk, historia miejsca | `producerModal.js` |
| **Ulubione** | Lista + trasy | dodawanie/usuwanie, zapis trasy zakupowej | `favorites.js`, shoppingRoutes |
| **Koszyk** | Produkty do zakupu | add/remove, suma | `cart.js` |
| **Premium** | Trial / płatność | trial 3 mies., PayPal, status | `premium` view + `premiumService` |
| **Profil** | Konto / ustawienia | język, dark mode, about, pomoc | `profile.js`, settings |
| **Landing** | Marketing / wejście | CTA do app, features | `landing.html` + `landing.css` |
| **Side menu** | Nawigacja dodatkowa | about, share, install, legal | `sideMenu.js` |

---

## 4. Wszystkie funkcje użytkownika (katalog)

- Przeglądanie Home i kategorii  
- Wyszukiwanie producentów/produktów  
- Mapa + GPS + „w pobliżu”  
- Filtry kategorii / promienia  
- Otwarcie szczegółów producenta (modal)  
- Ulubione + trasy zakupowe  
- Koszyk produktów  
- Recenzje (dodawanie / ocena)  
- Premium trial / PayPal  
- Logowanie / rejestracja / kody polecające  
- Zmiana języka (36)  
- Dark mode  
- Instalacja PWA  
- Powiadomienia push (gdy włączone)  
- Offline (banner / kolejka sync)  
- Udostępnianie / about / pomoc prawna  
- Personalizacja lokalna (Learning → „Dla Ciebie”) — bez wysyłki zachowań  

---

## 5. Raporty diagnostyczne

| Narzędzie | Ścieżka / komenda | Ostatni znany wynik |
|-----------|-------------------|---------------------|
| **Health Monitor** | `docs/health/` · `npm run health` | Overall **98%** (CSS conflicts medium) |
| **AI Guardian** | `tools/ai-guardian/reports/` · `npm run guardian` | productionReady **~8.7/10** |
| **Learning Engine** | lokalnie LS/IDB · `__RG_LEARNING__` | lokalny model preferencji |
| **Improvement Engine** | `docs/improvements/` · `npm run improve` | propozycje, autoApply=false |
| **Project Advisor** | `docs/advisor/` · `npm run advisor` | 7 pytań dnia |
| **Virtual User** | `docs/virtual-user/` · `__RG_VIRTUAL__.run()` | scenariusze UI (opt-in) |
| **Daily Developer Report / Mail (28D)** | `docs/daily/` · `npm run daily-mail` · [DEVELOPER-MAIL.md](./daily/DEVELOPER-MAIL.md) | tylko właściciel · SMTP z `.env` |
| **AI Dream Mode (29A)** | `docs/dream/` · `npm run dream` · [README](./dream/README.md) | Product Owner reflection · **autoApply=false** · nie chatbot |
| **Regional Intelligence (29B)** | `docs/regional-intelligence/` · `npm run regional` · [README](./regional-intelligence/README.md) | gospodarz regionu · **1 rekomendacja/dzień** · nie chatbot |
| **Brand Protection AI (29C)** | `docs/brand-protection/` · `npm run brand-protection` · [README](./brand-protection/README.md) | Brand Book authority · PASS/WARNING/FAIL · **autoApply=false** |
| **Product Brain (29D)** | `docs/product-brain/` · `npm run brain` · [README](./product-brain/README.md) | max **3** propozycje na jutro · czekaj na akceptację · **autoApply=false** |
| **Self Reflection (29E)** | `docs/self-reflection/` · `npm run reflect` · [README](./self-reflection/README.md) | samoocena dnia · 9 scores + Overall · **autoApply=false** |
| **Guardian of the Future (30)** | `docs/guardian-future/` · `npm run future` · [README](./guardian-future/README.md) | trendy + prognozy · CLEAR/WATCH/ALERT · **autoApply=false** |
| **Production Polish (31)** | `docs/premium/PRODUCTION-POLISH.md` · `npm run production-polish` | premium store-ready · bez nowych funkcji · **autoApply=false** |
| **Production Logging (31A)** | `docs/logging/PRODUCTION-LOGGING.md` · `npm run check:logging` | DEV=DEBUG · PROD=WARN/ERROR · bez szumu diagnostycznego |
| **Weekly Premium** | `docs/premium-weekly/` · `npm run weekly-premium` | Top 20 tygodnia |
| **Dev Dashboard** | localhost · `__RG_DASHBOARD__` | panel Dev |

Wszystkie z polityką **autoFix = false** (nie zmieniają kodu automatycznie).

---

## 6. Wszystkie testy

### Smoke / CLI (uruchomione 2026-07-21 w sesji raportu)

| Test | Wynik |
|------|-------|
| `npm run check:health` | ✅ OK |
| `npm run check:learning` | ✅ OK |
| `npm run check:improve` | ✅ OK |
| `npm run check:virtual-user` | ✅ OK |
| `npm run check:advisor` | ✅ OK |
| `npm run check:daily-report` | ✅ OK |
| `npm run check:dev-dashboard` | ✅ OK |
| `npm run check:weekly-premium` | ✅ OK |
| `npm run check:translations` | ✅ 36 języków × 1104 klucze |
| `npm run check:pwa` | ✅ OK |

### Inne skrypty w `package.json` (nie wszystkie odpalane w tej sesji)

`check:all`, `check:browser`, `check:assets`, `check:search`, `check:auth`, `check:push`, `check:reviews`, `check:analytics`, `check:landing`, `check:functional`, `check:predeploy`, `test:product-images` — **status w tej sesji: nie uruchamiane zbiorczo** (nie oznaczamy jako FAIL).

### Co „nie przeszło” / ryzyka

- Health/Daily: **konflikty CSS** (heurystyka ~40) — jedyny stały failed check w Daily.  
- Virtual User CLI bez importu z przeglądarki = placeholder (pełny run wymaga `?virtual=1`).  
- Legacy bundle vs kod źródłowy — ryzyko dryfu.  
- GA ID placeholder — analytics nieaktywne bez konfiguracji.

---

## 7. Wszystkie zasoby

### Logo / branding

- **Kanoniczne:** `assets/icons/logo-master.svg` (dwa złote kłosy →)  
- Alias: `icon-source.svg`, `icon-symbol.svg`  
- Brand pack: `assets/brand/` (og-share, splash, notifications)  
- Store: `assets/store/google-play/`, `assets/store/app-store/`

### Ikony PWA

`favicon.ico`, `apple-touch-icon.png`, `maskable-512.png`, `icon-{48…1024}.png` — z mastera (`npm run generate-icons`).

### Obrazy

- Produkty: `assets/images/products/` (~webp/jpg)  
- Tła ekranów/kategorii: `assets/images/backgrounds/`  
- Kategorie SVG, chains, fastfood, hero, motifs  
- `_probe/` — materiały robocze (duże JPG)

### SVG

~26 plików (logo + kategorie + motywy).

---

## 8. Tłumaczenia

| Metryka | Wartość |
|---------|---------|
| Języki | **36** |
| Klucze (DE kanoniczne) | **1104** |
| Kompletność vs DE | **100%** (check:translations) |
| Fallback | typowo DE / klucz `t()` gdy brak |

Pakiety: `translations.js` + about / legal / content / testing packs.

---

## 9. Performance

| Obszar | Stan |
|--------|------|
| Bundle | Brak jednego nowoczesnego bundla produkcyjnego; ES modules + opcjonalny `legacy/app.bundle.js` (~644 KB) |
| CSS | `style.css` ~156 KB + wiele arkuszy `@import` |
| JS | Duże widoki: `map.js`, `home.js`, modal |
| Obrazy | WebP produktów; tła webp; probe JPG ciężkie |
| Cache | SW precache ikon/assetów; Health cache score wysoki |
| Health Performance | **99%** (ostatni raport statyczny) |

---

## 10. Accessibility

- Health a11y score (statyczny): **100%** (heurystyka)  
- Guardian a11y: wysoki (~9.6/10 w ostatnim raporcie)  
- Header: kontrast poprawiony w Brand 20A  
- Ryzyka: przyciski ikoniczne bez etykiet (Improve), fokus w modalach, zależność od emoji w nawigacji dolnej  

---

## 11. Responsive

- Mobile-first, bottom nav, safe-area  
- Health Mobile **100%** (ostatni skan)  
- Brand CSS: cele tap / overflow w checklistach Improve/VU  
- Landing osobny layout  

---

## 12. Branding

**Brand Book (kanoniczny, przed publikacją):**  
[`docs/brand/BRAND-BOOK.md`](./brand/BRAND-BOOK.md) · wizualnie [`docs/brand/brand-book.html`](./brand/brand-book.html)  
**Logo Audit 28A:** [`docs/brand/LOGO-AUDIT.md`](./brand/LOGO-AUDIT.md) · `npm run logo-audit`  
**Header Audit 28B:** [`docs/brand/HEADER-AUDIT.md`](./brand/HEADER-AUDIT.md) · `npm run header-audit`  
**Responsive Premium 28C:** [`docs/brand/RESPONSIVE-PREMIUM-REPORT.md`](./brand/RESPONSIVE-PREMIUM-REPORT.md) · `npm run mobile-premium-audit`  
**Premium Audit 28E:** [`docs/brand/PREMIUM-AUDIT.md`](./brand/PREMIUM-AUDIT.md) · `npm run premium-audit`  
**Master Icon Audit 28F:** [`docs/brand/MASTER-ICON-AUDIT.md`](./brand/MASTER-ICON-AUDIT.md) · `npm run master-icon-audit` · cache `?v=23` / `rg-pwa-v23`  
**Brand Consistency / Lock / Protection:** [`BRAND-CONSISTENCY-100.md`](./brand/BRAND-CONSISTENCY-100.md) · [`BRAND-LOCK-FINAL-REPORT.md`](./brand/BRAND-LOCK-FINAL-REPORT.md) · `npm run brand-protection`  
**Visual Brand 28G:** [`VISUAL-BRAND-VERIFICATION.md`](./brand/VISUAL-BRAND-VERIFICATION.md) · `npm run visual-brand` — PASS tylko przy identycznym logo

Raport wdrożenia: `docs/brand/ETAP-20A-BRAND-REPORT.md`.

- **Ikona aplikacji** = dwa złote kłosy → (`logo-master.svg`); nazwa = wordmark obok  
- Warianty ikony light/dark w `assets/brand/`  
- Jedna paleta (zieleń/złoto/pszenica/miód/krem)  
- Bez zimnego niebieskiego w tokenach marki  
- Literata + Source Sans 3  
- Manifest theme `#2a3f28`, background `#f5efe3`  
- Spec zrzutów Play / App Store w Brand Book §9  

---

## 13. UX

Mocne: ciepły Home, narracje (doradca, smaki dnia, living region), ścieżka mapa→modal, personalizacja lokalna.  
Słabsze: Health UX **85%**, możliwe miganie przy nawigacji, złożoność Home (wiele sekcji), Virtual User nie zawsze odpalany na CI.

---

## 14. Design System (faktyczny)

Tokeny CSS w `:root` / `warm-summer` / `brand-identity-final`:

- kolory brand + semantyka przycisków  
- spacing `--space-*`, radius, shadow  
- komponenty: karty home, bottom nav, modal, toast, banery  
- **nie** jest to osobna biblioteka komponentów (Storybook) — system „przez CSS + konwencje nazw klas”

---

## 15. Znane problemy

1. Heurystyczne **konflikty CSS** (~40) w Health/Daily.  
2. `js/legacy/app.bundle.js` vs źródła — ryzyko rozjazdu.  
3. Virtual User pełny tylko w przeglądarce (opt-in).  
4. Analytics GA często placeholder.  
5. Duże pliki `_probe` w assets (śmieci robocze?).  
6. Home może być ciężki przy pierwszym paint (wiele sekcji narracyjnych).  
7. Część findingów Guardian (listenery / setInterval) — do ręcznego review.  
8. Brak jednego oficjalnego „production build” (bundling/minify) poza legacy.

---

## 16. Lista TODO

W kodzie aplikacji **brak systematycznej listy `TODO:`** (poza placeholderami typu `G-XXXXXXXXXX`, formatem `REGIO-XXXX`).  
TODO produktowe wynikają z raportów Improve / Advisor / Weekly Top 20 (np. CSS, touch, personalizacja Home).

---

## 17. Co jest ukończone

- PWA z mapą Leaflet i pełnym shell nawigacji  
- Home z bogatą warstwą prezentacji (ETAP 14–17)  
- i18n 36 × 1104  
- Premium trial / PayPal flow  
- Ulubione, koszyk, modal producenta  
- Brand Identity Final (20A)  
- Warstwa diagnostyczna 18A–E + 19A–C (Health→Weekly)  
- AI Guardian (dev)  
- Landing page  
- Store/OG assety z jednego logo  

---

## 18. Co jeszcze można poprawić

- Uporządkować konflikty CSS (priorytet Daily)  
- Odchudzić pierwszy render Home  
- Zautomatyzować Virtual User w CI (Playwright — obecnie brak)  
- Usunąć/przenieść `assets/images/_probe`  
- Skoordynować legacy bundle lub wycofać  
- Wzmocnić a11y kontrolek ikonicznych  
- Product: chip wyszukiwania + „wróć do trasy” (Advisor)  

---

## 19. Gotowość produkcyjna

| Kryterium | Ocena |
|-----------|-------|
| Funkcje core dla użytkownika | Wysoka |
| i18n | Wysoka |
| PWA / ikony / brand | Wysoka |
| Diagnostyka dev | Wysoka |
| Czystość CSS / dług techniczny | Średnia |
| CI E2E przeglądarkowy | Niska–średnia |
| Backend / analytics prod | Zależne od konfiguracji |

**Werdykt:** gotowa jako **PWA produktowa do wdrożenia frontowego** przy ręcznym review CSS/Guardian; nie jako „zero debt”.

---

## 20. Ocena 0–100

| Obszar | Punkty |
|--------|--------|
| Produkt / wartość | 88 |
| UX emocjonalny | 86 |
| Brand / wizualne | 90 |
| i18n | 95 |
| PWA | 90 |
| Architektura prostoty | 82 |
| Jakość kodu / dług | 74 |
| Testy / CI | 78 |
| Performance percepcyjna | 80 |
| Diagnostyka / ops deweloperskie | 92 |

### **Ocena łączna projektu: 86 / 100**

*(ważona praktycznie pod PWA regionalną — nie pod skalę enterprise backend)*

---

## Aneks — komendy raportów

```bash
npm run health
npm run improve
npm run advisor
npm run daily-mail
# SMTP: docs/daily/DEVELOPER-MAIL.md
npm run weekly-premium
npm run guardian
npm run generate-icons
```

---

*Koniec Master Project Report (ETAP 20). Raport ekspercki specjalistów: `docs/expert-product-review.md` (ETAP 21).*
