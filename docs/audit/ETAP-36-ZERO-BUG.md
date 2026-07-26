# ETAP 36 — Zero Bug Release

**Data:** 2026-07-23  
**Polityka:** `autoApply=false` · `autoFix=false` · **find-only (zero napraw w tym etapie)**  
**Werdykt końcowy:** **WARNING**

Aplikacja przechodzi automatyczne checki (składnia, i18n struktura, PWA, asset refs, funkcjonalny smoke), ale **nie jest „zero bug”**: są błędy UTF-8 widoczne dla użytkownika, ryzyka SW/cache, race OSM oraz dług techniczny (CSS cascade, i18n treści, dead code).

---

## Werdykt

| Status | Znaczenie |
|--------|-----------|
| **PASS** | Dual ES modules = 0 · PWA `v28` zsynchronizowane · broken imports = 0 · full-audit / functional / i18n keys / PWA smoke OK |
| **WARNING** | UTF-8 UI · SW image cache-first · OSM pending race · CSS header-height · FA unused · i18n EN-klony · IDB growth |
| **FAIL** | Brak jako „aplikacja nie startuje” — ale **Zero Bug Release = NIE** przy CRITICAL UTF-8 |

---

## Inwentaryzacja

| Katalog / plik | Pliki (ok.) | Audyt |
|----------------|------------:|-------|
| `js/` | 151 | Importy, EventBus, mapa, GPS, leaks, UTF-8 |
| `css/` | 33 | Konflikty, orphan selectors, dark/responsive |
| `assets/` | 227 | Orphan audio/brand; refs vs dysk |
| `docs/` | 185 | Raporty (nie runtime) |
| `scripts/` | 149 | CLI audyty |
| `tools/` | 49 | AI Guardian |
| `sw.js` · `manifest.json` · `index.html` · `landing.html` | — | PWA / UTF-8 / cache |

**Git:** brak `.git` w workspace.

---

## Automatyczne checki (uruchomione)

| Komenda | Wynik |
|---------|-------|
| `node scripts/full-audit.mjs` | **PASS** · 207 OK · 0 err |
| `node scripts/functional-audit.mjs` | **PASS** · 54 OK · 0 err |
| `node scripts/check-translations.mjs` | **PASS** · 36 × 1202 kluczy |
| `node scripts/asset-audit.mjs` | **PASS** · 176 refs · unused 0* |
| `node scripts/test-pwa.mjs` | **PASS** |
| `node scripts/predeploy-check.mjs` | **PASS** · OSM live 254 · HTTP pominięte |

\* `asset-audit` liczy referencje w kodzie — nie oznacza braku orphan audio (heurystyka inna).

---

## Severity rollup (łącznie)

| Severity | Count | Tematy |
|----------|------:|--------|
| **CRITICAL** | **2** | UTF-8 `landing.html` (UI DE) · UTF-8 `home.js` `formatPrice` (€ → �) |
| **HIGH** | **14** | pushNotifications regex DE · header-height fight · SW addAll/cache-first · Font Awesome dead · CSS @import waterfall · CART_ADDED dead · OSM pending vs generation · Premium sticky (z 35A) · nav mismatch · multi-path GPS · i18n EN-clones · dark meta contrast · header density @320 |
| **MEDIUM** | **20+** | EventBus dead emits · IDB unbounded · thematicRoutes dead · legacy bundle · glass/category CSS wars · orphan audio/brand · dual LOCATION home refresh · selfHealing import no catch · CATALOG_TRANSLATIONS empty · experience-stack weight |
| **LOW / INFO** | **25+** | SPA listeners · unused EVENTS catalog · CLI intelligence · store assets · comment mojibake w CSS · `?v=` discipline |

---

## 1. Błędy JS / Promise / async / race

| Sev | Finding | Evidence |
|-----|---------|----------|
| CRITICAL | `formatPrice` pokazuje `�` zamiast `€` | `js/views/home.js` ~90 |
| HIGH | Regex DE uszkodzone (`ökologisch`, `Brötchen`, `Käse`…) | `home.js` ~580 · `pushNotifications.js` ~120–129 |
| HIGH | `CART_ADDED` — listener w learningEngine, **nigdy nie emitowany** | cart emituje tylko `CART_CHANGED` |
| HIGH | OSM: `pendingOsmRefresh` może utknąć po `dataFetchGeneration++` | `js/views/map.js` loadProducersInBackground |
| MEDIUM | Dynamic `import(selfHealing)` bez `.catch` | `producerModal.js` |
| MEDIUM | Cold start GPS: watch + resolveUserLocation równolegle | złagodzone `mapInitGeneration` |
| MEDIUM | Home: `NAVIGATE` + `setSearchQuery` timing | `home.js` seasonal |
| LOW | Fire-and-forget background loads (świadome) | map / dataService |

**Dual ES modules:** **0** (po ETAP 35B).  
**Broken imports:** **0**.

---

## 2. EventBus

| Sev | Finding |
|-----|---------|
| HIGH | `CART_ADDED` dead (listen ≠ emit) |
| MEDIUM | `LOCATION_CHANGED` + `LOCATION_UPDATED` → podwójny refresh Home przy dużym ruchu |
| MEDIUM | Emit bez listenerów: `MAP_READY`, `PLACES_FILTERED`, `THEME_CHANGED`, `CACHE_UPDATED`, `PREMIUM_EXPIRED`, … |
| INFO | Martwy katalog: `OPEN_PREMIUM`, `STORE_RESET`, Supabase/OFF events |
| INFO | `NAVIGATE` emit+listen — **bez pętli** (guard `currentView`) |

---

## 3. Mapa / GPS / Leaflet

| Check | Status |
|-------|--------|
| Dual `mapSettings` / `producerModal` | **OK** (35B) |
| `safeInvalidateSize` przy popup | **OK** |
| `watchPosition` + `clearWatch` | **OK** (pause/visibility) |
| OSM pending vs generation | **HIGH risk** |
| Multi-path GPS (Home → Map → watch) | **WARNING** (z 35A; logika nietknięta) |
| Listener leaks Leaflet | **LOW** — cleanup przy `remove()` / guards |

---

## 4. Service Worker / cache / PWA

| Sev | Finding |
|-----|---------|
| HIGH | `cache.addAll` atomowe — 1 fail → brak `skipWaiting` |
| HIGH | Images **cache-first** (`rg-runtime-images-v28`) — stale bez bump `PWA_VERSION` |
| MEDIUM | CSS/JS nie w precache — cold offline fragile |
| MEDIUM | Navigate cache → zawsze `/index.html` (landing risk) |
| INFO | `PWA_VERSION=28` zsynchronizowane: SW register · CACHE · ICON · manifest · HTML |

---

## 5. localStorage / IndexedDB

| Sev | Finding |
|-----|---------|
| MEDIUM | IndexedDB `rg_learning_engine` — `add` bez prune; `getAll` + slice — store rośnie |
| INFO | localStorage: producers cache v9, map prefs, premium, auth, reviews — try/catch quota |
| INFO | Jedyna IDB w runtime: `learningEngine.js` |

---

## 6. i18n / UTF-8

| Sev | Finding |
|-----|---------|
| CRITICAL | `landing.html` — 42× U+FFFD (`Öffnen`, `Nähe`, `€`…) |
| CRITICAL/HIGH | `home.js` — 22× U+FFFD (cena + regex) |
| HIGH | `pushNotifications.js` — 16× U+FFFD (regex ofert) |
| LOW | `css/style.css` — 1× w komentarzach |
| PASS struktura | 1202 kluczy × 36 języków; 0 missing static `t()` |
| HIGH jakość | ~33 języki ≈ klony EN; `CATALOG_TRANSLATIONS` puste |

---

## 7. CSS / dark / light / responsive

| Sev | Finding |
|-----|---------|
| HIGH | `--header-height` (44–48px) vs `--ph-header-h` (58–62px) @≤430 → treść pod headerem |
| HIGH | Header density @320 (4 przyciski + lang + 2-line title) |
| HIGH | Dark: `.favorite-item .meta` / `.section-desc` forced `#4a3f32` bez dark override |
| MEDIUM | Glass/category !important wars (landscapes / warm-summer / final-ux / prepublish) |
| MEDIUM | Dark palette warm-brown vs brand green-black |
| INFO | Brak orphan CSS **files** (33/33 w grafie) |
| HIGH | Dead selectors: `.home-chip`, `.category-desc` (tylko legacy) |

---

## 8. Assety / orphan

| Sev | Finding |
|-----|---------|
| HIGH | Orphan audio: birds, frogs, insects, wind, *-forest, meadow… (climate używa tylko `*-birds`) |
| MEDIUM | Brand `logo-on-*` / `logo-mark` — poza runtime UI |
| INFO | `screen-settings.webp` **obecny** (364 990 B) — wcześniejszy alarm 404 **nieaktualny** |
| INFO | Store pack — dystrybucja, nie orphan bug |
| PASS | asset-audit: 0 brakujących ścieżek w referencjach kodu |

---

## 9. Wydajność

| Sev | Finding |
|-----|---------|
| HIGH | Font Awesome CDN — brak użycia `fa-` w widokach |
| HIGH | ~30 CSS przez `@import` waterfall |
| HIGH | Duplikat Google Fonts (HTML + `brand-identity-final` @import) |
| MEDIUM | experience-stack 16 arkuszy na każdy boot |
| MEDIUM | GPS `LOCATION_UPDATED` → soft refresh listy producentów |
| LOW | `legacy-ios9.css` zawsze pobierany |

---

## 10. Dead code / duplicate / TODO

| Sev | Finding |
|-----|---------|
| MEDIUM | `js/data/thematicRoutes.js` — zero importerów |
| MEDIUM | Legacy `app.bundle.js` drift vs module app |
| MEDIUM | Duplikaty day-context stacks (smartToday / tastesOfDay / returnMagic / …) |
| INFO | CLI-only `intelligence/*`, `*Core.js` — by design |
| INFO | TODO/FIXME w kodzie produkcyjnym — nieliczne (głównie komentarze/config) |

---

## 11. Memory / listener leaks

| Sev | Finding |
|-----|---------|
| MEDIUM | IDB learning unbounded |
| MEDIUM | GPS tick → list soft-refresh |
| LOW | Document/EventBus listeners na życie SPA (guards `*_bound`) |
| INFO | Home `AbortController` przy remount — dobry wzorzec |

---

## Cross-cut: status po ETAP 35 / 35B

| Temat | Status |
|-------|--------|
| Dual ES modules | **PASS** (0) |
| SW `PWA_VERSION` sync | **PASS** (28) |
| Producer Modal dual init | **PASS** (idempotent + Favorites cleanup) |
| UTF-8 UI | **FAIL / CRITICAL** (pozostaje) |
| Image SW strategy | **WARNING** |
| Premium sticky | **WARNING** (poza zakresem logiki) |

---

## Priorytet do Zero Bug (kolejne etapy — nie w 36)

1. **P0** — UTF-8: `landing.html`, `home.js` (`formatPrice` + regex), `pushNotifications.js`  
2. **P0** — Align `--header-height` ↔ `--ph-header-h`  
3. **P1** — SW: nieatomowy precache + image network/stale-while-revalidate  
4. **P1** — OSM `pendingOsmRefresh` vs `dataFetchGeneration`  
5. **P1** — `CART_ADDED` ↔ `CART_CHANGED` w learning  
6. **P2** — Usunąć FA / flatten CSS / orphan audio / `thematicRoutes`  
7. **P2** — i18n content + catalog translations  
8. **P3** — EventBus trim · IDB prune · legacy rebuild  

---

## Testy matrix (status)

| Obszar | Auto | Uwaga |
|--------|------|-------|
| JS syntax / imports | PASS | |
| Functional smoke | PASS | 54 OK |
| i18n structure | PASS | treść WARNING |
| Assets paths | PASS | orphan audio poza skryptem |
| PWA / SW register | PASS | strategy WARNING |
| Leaflet / GPS / Map | PASS smoke | race WARNING |
| Dark / Light | — | CSS contrast WARNING |
| Responsive | — | header-height WARNING |
| Performance | — | FA + @import HIGH |
| Accessibility | — | focus z 35; contrast lists WARNING |
| Offline / Install | PWA OK | HTTP server nie działał w predeploy |

---

## Ocena końcowa (skale)

| Obszar | Ocena | Status |
|--------|------:|--------|
| Stabilność runtime | 8 / 10 | PASS |
| Poprawność UI (UTF-8) | 5 / 10 | **FAIL** |
| Mapa / GPS | 7.5 / 10 | WARNING |
| PWA / cache | 7 / 10 | WARNING |
| CSS / Dark / Responsive | 7 / 10 | WARNING |
| i18n | 6 / 10 | WARNING |
| Wydajność | 6.5 / 10 | WARNING |
| Higiena kodu | 7 / 10 | WARNING |
| **Gotowość „Zero Bug”** | **6.5 / 10** | **WARNING** |

---

## Źródła

- Skrypty: full-audit, functional-audit, check-translations, asset-audit, test-pwa, predeploy-check  
- Audyt CSS/assets/PWA (explore)  
- Audyt JS/EventBus/mapa/GPS (explore)  
- Raporty: `ETAP-35A.md`, `ETAP-35B-P0-STABILITY.md`, `docs/final/UX-POLISH-1.0.md`

**Koniec ETAP 36 — Zero Bug Release (find-only).**  
`autoApply=false` · `autoFix=false`
