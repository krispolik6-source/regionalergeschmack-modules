# ETAP 35A — Deep Project Audit

**Data:** 2026-07-23  
**Polityka:** `autoApply=false` · **zero napraw** · tylko inwentaryzacja i findings  
**Werdykt końcowy:** **WARN** (statyczne checki PASS, ale ryzyka produktowe/architektoniczne)

---

## Werdykt

| Status | Znaczenie |
|--------|-----------|
| **PASS** | Składnia JS/CSS, brak brakujących importów, asset paths OK, PWA smoke OK, struktura i18n 1202×36 OK |
| **WARN** | Dual module instances, SW version skew, Premium sticky, nav mismatch, UTF-8, i18n jakościowe, CSS cascade wars |
| **FAIL** | Brak (żaden check automatyczny nie padł w tym przebiegu) |

**Nie naprawiano niczego w tym etapie.**

---

## Inwentaryzacja

| Katalog | Pliki (ok.) | Rola |
|---------|------------:|------|
| `js/` | 151 | Aplikacja + diagnostics + intelligence + legacy |
| `css/` | 32 | Warstwy (stacks) + landing |
| `assets/` | 227 | Ikony, brand, images, audio |
| `docs/` | 182 | Raporty / brand / intelligence |
| `scripts/` | 149 | CLI audyty / generatory |
| `tools/` | 49 | AI Guardian itd. |
| Root | `index.html`, `landing.html`, `sw.js`, `manifest.json` | Entry + PWA |

**Git:** brak `.git` w workspace — brak historii do `git blame` / checkout.

### Automatyczne checki (uruchomione)

| Komenda | Wynik |
|---------|-------|
| `node scripts/full-audit.mjs` | PASS · OK 206 · err 0 |
| `node scripts/check-translations.mjs` | PASS · 36 jęz. × 1202 kluczy |
| `node scripts/asset-audit.mjs` | PASS · refs 176 · unused 0 |
| `node scripts/functional-audit.mjs` | PASS · OK 54 · err 0 |
| `node scripts/test-pwa.mjs` | PASS |
| `node scripts/predeploy-check.mjs` | PASS · OSM live 254 producentów · HTTP pominięte (brak `npm start`) |

---

## Severity rollup

| Severity | Liczba (distinct) | Tematy |
|----------|------------------:|--------|
| **Critical** | 3 | Dual ES modules (`producerModal` v6/v7, `categoryImages`/`mapSettings`); SW register `?v=25` vs `CACHE_VERSION` `rg-pwa-v27` |
| **High** | 14 | Premium sticky + marketing≠gates; nav search/cart/premium; multi-path GPS; UTF-8; i18n EN-placeholders; CSS category/theme/glass wars; image cache-first; legacy bundle drift; dead `thematicRoutes.js` |
| **Medium** | 18 | Satellite packs DE/EN/PL; empty `CATALOG_TRANSLATIONS`; EventBus dual paths; no Store; unused brand logos/audio; Font Awesome dead weight; hero CSS vs live Home; races mapy |
| **Low / Info** | 12+ | Orphan keys (nadmierne); currency locales; martwe eventy `OPEN_PREMIUM`/`STORE_RESET`; Brand Book cold blues |

---

## 1. Importy / eksporty / martwy kod

### Broken imports
**0** — wszystkie ścieżki `from` / `import()` (po strip `?v=`) wskazują istniejące pliki.

### Critical — dual ES module instances
Ten sam plik ładowany jako **różne rekordy modułu** (plain vs `?v=` lub różne `?v=`):

| Moduł | Konflikt |
|-------|----------|
| `js/views/producerModal.js` | UI: `?v=7` · sims: `?v=6` → osobne `initialized` / listenery |
| `js/presentation/categoryImages.js` | `home.js?v=6` vs plain w `selfHealing` / `producerTrust` / `contentProducers` |
| `js/map/mapSettings.js` | `views/map.js?v=2` vs plain |

### Dead / orphan
| Plik | Status |
|------|--------|
| `js/data/thematicRoutes.js` | **Martwy** — zero importów z app i scripts |
| `js/intelligence/*` (6) | Orphan w przeglądarce — **by design** (CLI) |
| `js/diagnostics/*Core.js` (dream/guardian/brain/reflect/brandProtection) | CLI-only — **by design** |

### Unused exports (heurystyka)
~119 plików / ~434 named exports bez importerów. Najgorsze: `premiumService.js`, `logger.js`, `pushNotifications.js`, `views/map.js`, `map/map.js`, `config.js`.

### Duplikaty logiki
- Stack „day / region / recommend”: `smartToday`, `tasteAdvisor`, `tastesOfDay`, `returnMagic`, `livingRegion`, `regionSoul`, `regionalIntelligence`, `smartRecommend`, `learningEngine`
- `getDayPart` skopiowany 3–4× (presentation + diagnostics + intelligence)
- `virtualUser` + `realUserSimulation` — podobne flows, oba z `app.js`

---

## 2. Niespójności nazw

| Obszar | Problem |
|--------|---------|
| Kategorie | `farmers`/`farmer`, `bakeries`/`bakery`, `fastFood`/`fast_food`/`fastfood` — bridge w `searchLexicon.js` |
| i18n | `categories.fastFood` vs `types.fast_food` |
| Cache-bust | `producerModal` v6 vs v7; `app.js?v=591` vs `app.bundle.js?v=27` vs `sw.js?v=25` vs `rg-pwa-v27` |

---

## 3. Konflikty CSS

Cascade: `style.css` → landscapes → polish → legacy-ios9 → warm-summer → production-polish → **experience-stack** → brand-stack → prepublish → home-v1 → **theme-toggle-premium**.

| Obszar | Severity | Co koliduje |
|--------|----------|-------------|
| Category cards | **High** | `landscapes` / `warm-summer` (16px !important) / `final-ux-premium` (13px !important) / `living-region-experience` hover / `mobile-premium` |
| Theme toggle | **High** | `brand-identity-final` square · `premium-header` · `theme-toggle-premium` circle — trzy warstwy `!important` |
| Glass / blur | **High** | Token 12px vs hardcode 18/8/4px w style/landscapes/polish/warm-summer |
| Hero | **Medium** | `.home-hero` w CSS + legacy bundle; live Home używa `.home-greeting` |
| Unused CSS file | — | Tylko `landing.css` poza graph `index.html` (OK — używa `landing.html`) |

---

## 4. Konflikty JS / routing / mapa / GPS

### Routing
| ID | Bottom nav | `VIEW_IDS` | Uwaga |
|----|------------|------------|-------|
| `search` | tak | nie | Alias → home + focus search |
| `cart` | nie | tak | Tylko menu; badge updater szuka `[data-view="cart"]` — **martwy** |
| `premium` | nie | tak | Menu / header / CTA; auto-redirect po login jeśli trial |

Brak `hashchange`; deep link tylko `?view=` (bez `search`).

### GPS — wiele ścieżek (High)
Home `LOCATION_REQUESTED` → app nawiguje do mapy → map pending flags → `toggleGpsTracking` / watch; równolegle `NEARBY_SEARCH`, `resolveUserLocation`, `LOCATION_CHANGED` vs `LOCATION_UPDATED`.

### Mapa
- Leaflet CDN + guard `window.L`
- Races: popup vs marker refresh, OSM fetch generation, init generation — lokalnie złagodzone
- God-module: `js/views/map.js`

### Legacy drift (High)
`nomodule` → `app.bundle.js` bez diagnostics / emotion / livingBrand / vault / selfHealing; Premium gating w bundle ≠ modern `home.js`.

---

## 5. i18n

| Check | Wynik |
|-------|-------|
| Struktura kluczy DE/EN/PL/… | **1202 × 36** — komplet |
| Użyte `t('…')` missing w DE/EN | **0** |
| Jakość treści | DE/EN/PL realne; ~33 języki głównie **klony EN** (EXTRA ~94% EN) |
| Packs satelitarne | Wiele tylko de/en/pl(/mk) |
| `CATALOG_TRANSLATIONS` | **puste** `{}` dla pl/en/… |
| UTF-8 w stringach tłumaczeń | **czyste** (heurystyka) |

---

## 6. Błędy UTF-8 (poza translations)

| Plik | Severity | Objaw |
|------|----------|-------|
| `js/views/home.js` | **High** | ~22× U+FFFD (komentarze PL + `€` → replacement) |
| `js/core/pushNotifications.js` | **High** | ~16× U+FFFD w regex/komentarzach (`br�tchen`, `k�se`) |
| `index.html` | **High** | Widoczne fallbacki PL: `Urz?dzenie`, `J?zyk`, `powiod?a si?` |
| `landing.html` | **Medium** | Mojibake (`�ffnen`) |
| `css/style.css` | **Medium** | Komentarze z `?` zamiast polskich znaków |
| Inne | Medium | `searchLexicon.js`, `translations-about/asian/menu.js` (hit lista) |

---

## 7. Assety / ikony / PWA / SW / manifest

### Assety
- Referencje → dysk: **0 brakujących**
- Unused runtime: brand `logo-on-*` / `logo-mark` (tylko brand-book); ~10 stemów audio nature niewyrejestrowanych w `climateAtmosphere.js`
- Zdjęcia kategorii: `/assets/images/backgrounds/category_*.webp` (nie `categories/` — tam SVG)

### Ikony / manifest
- `ICON_VERSION=23` spójne w manifest / SW precache / HTML
- Dual `apple-touch-icon` + `icon-180`
- Font Awesome CDN w `index.html` — brak realnego użycia `fa-` w widokach (**dead weight**)

### Service Worker
| Issue | Severity |
|-------|----------|
| `sw.js?v=25` w `index.html` vs `CACHE_VERSION=rg-pwa-v27` | **Critical** |
| Image **cache-first** (`rg-runtime-images-v5`) | **High** — ryzyko „znikających/starych” zdjęć |
| `cache.addAll` all-or-nothing → przy fail brak `skipWaiting` | **High** |
| Ikony network-first | OK |
| JS/CSS network-first | OK |
| Scope `/` | OK |

---

## 8. Premium

| Finding | Severity |
|---------|----------|
| Marketing (rekomendacje / mapa / ordering) vs realne gate’y (głównie ads + highlight) | **High** |
| `isPaidPremium()` + device flags `premium_user` / `premium_producer` — **nie czyszczone** przy deactivate/trial expiry | **High** |
| Trial → nadal ads (`isPaidPremium` false) | **Medium** |
| `body.premium-active` (JS) vs CSS `body.view-premium-active` | **Medium** |
| `EVENTS.OPEN_PREMIUM` — zdefiniowany, nie używany | **Low** |

---

## 9. Diagnostyka / inteligencja

### Boot z `app.js` (runtime)
HealthMonitor, HealthDevPanel, DeveloperVault, SelfHealing, LearningEngine, ImprovementEngine, VirtualUser, RealUserSimulation, EmotionAi, LivingBrand, ProductDirector, ProjectAdvisor, DailyDeveloperReport, DeveloperDashboard, WeeklyPremiumReport (+ SeasonTheme, ClimateAtmosphere).

### CLI-only (nie w browser graph)
`intelligence/*`, `dreamModeCore`, `guardianOfTheFutureCore`, `productBrainCore`, `selfReflectionCore`, `brandProtectionCore` — Vault czyta tylko `docs/**/latest.json`.

### Zapach
Ciężki boot diagnostics w ścieżce użytkownika; brak centralnego Store; EventBus sprawl + martwe eventy Supabase/OFF/`STORE_RESET`.

---

## 10. Brand Lock (raport only)

- Fonty: Literata + Source Sans 3 — **OK** (brak Inter/Roboto)
- Logo runtime: `logo-master.svg` — **OK**
- Cold navy w `prepublish.css` / części landscapes/landing — **WARNING** względem Brand Book (zieleń/złoto/krem)
- `--color-primary: #4f6b3c` w `style.css` vs Brand `#2a3f28` — warstwy warm/brand mogą nadpisywać

---

## Priorytet napraw (kolejne etapy — NIE w 35A)

1. **P0** — ujednolicić importy `?v=` (jeden URL na moduł: `producerModal`, `categoryImages`, `mapSettings`)
2. **P0** — zsynchronizować `sw.js?v=` z `CACHE_VERSION` / `IMAGE_CACHE`
3. **P1** — naprawa UTF-8 (`home.js`, `pushNotifications.js`, `index.html`, `landing.html`)
4. **P1** — Premium flags lifecycle + spójność marketing ↔ gates
5. **P1** — nav: search/cart/premium (UX + martwy badge)
6. **P2** — CSS cascade: category / theme-toggle / glass (jedna warstwa zwycięska)
7. **P2** — jakość i18n (nie tylko struktura) + `CATALOG_TRANSLATIONS`
8. **P2** — usunąć `thematicRoutes.js` lub podpiąć; przebudować legacy bundle; Font Awesome
9. **P3** — GPS single-path; EventBus cleanup; audio/brand orphan assets

---

## Świadomie poza naprawą (ten etap)

- Store / EventBus / API / GPS / Leaflet / routing core — tylko opisane
- Brand colors / logo / fonts — tylko ostrzeżenia
- Żadne `autoApply` / autoFix

---

## Źródła audytu

- Eksploracja statyczna `js/`, `css/`, `assets/`, PWA, i18n, routing, mapa, Premium
- Skrypty: `full-audit`, `check-translations`, `asset-audit`, `functional-audit`, `test-pwa`, `predeploy-check`
- Poprzednie raporty: `docs/health`, brand audits, ETAP 34A/C

**Koniec ETAP 35A — Deep Project Audit (find-only).**
