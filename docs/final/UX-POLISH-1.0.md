# ETAP 35 — UX Polish 1.0 (FINAL QUALITY POLISH)

**Data:** 2026-07-23  
**Polityka:** `autoApply=false` · `autoFix=false`  
**Zakres:** wyłącznie UX / prezentacja / stabilność bezpieczna  
**Werdykt końcowy:** **PASS (z WARNING)**

---

## Werdykt obszarów

| Obszar | Ocena | Status |
|--------|-------|--------|
| UX | 8.5 / 10 | **PASS** |
| Brand | 9 / 10 | **PASS** |
| Performance | 7.5 / 10 | **WARNING** |
| Accessibility | 8 / 10 | **PASS** |
| Responsywność | 8.5 / 10 | **PASS** |
| Mapa | 8 / 10 | **PASS** |
| Dark Mode | 8.5 / 10 | **PASS** |
| Spójność | 7.5 / 10 | **WARNING** |
| Kod | 8 / 10 | **PASS** |
| Gotowość produkcyjna | 8 / 10 | **PASS (WARNING)** |

**Łącznie:** aplikacja gotowa do 1.0 z znanymi warningami (i18n jakościowe EN-klony, ciężki boot diagnostics, image cache-first SW) — bez blokujących FAIL.

---

## Zasady przestrzegane

- Brak nowych funkcji / ekranów / modułów AI  
- Brak zmian architektury (Store, EventBus, API, GPS logika, Premium logika, Leaflet core)  
- Brak zmiany UX Home 1.0 (order / sekcje / clutter)  
- `app.js` **nie edytowany**  
- Brand Lock: bez zmiany logo / palety / fontów marki  
- Każda naprawa minimalna  

---

## 1. Znalezione problemy

### Critical / High (naprawione lub złagodzone)

| ID | Problem | Obszar | Status |
|----|---------|--------|--------|
| F01 | Dual ES module: `producerModal` `?v=6` vs `?v=7` | JS / mapa+modal | **Naprawione** → wszędzie `?v=7` |
| F02 | Dual ES module: `categoryImages` plain vs `?v=6` | JS | **Naprawione** → wszędzie `?v=6` |
| F03 | Dual ES module: `mapSettings` plain vs `?v=2` | JS / mapa | **Naprawione** → wszędzie `?v=2` |
| F04 | SW register `sw.js?v=25` vs `CACHE_VERSION` `rg-pwa-v27` | PWA | **Naprawione** → `?v=27` |
| F05 | Dark: Smaki dnia / Region żyje bez reguł kontrastu | Dark | **Naprawione** (CSS) |
| F06 | Header: ryzyko nierównych wysokości przycisków (warstwy CSS) | Header | **Naprawione** (ux-polish-1) |
| F07 | Overflow-x / poziomy scroll na wąskich viewportach | Responsive | **Naprawione** (`overflow-x: clip`) |
| F08 | Mojibake w fallbackach PL w `index.html` (menu testerów) | UTF-8 / UX | **Naprawione** |

### Medium (częściowo / odłożone)

| ID | Problem | Status |
|----|---------|--------|
| F09 | CSS cascade wars (warm-summer vs final-ux category names) | **Warning** — nie scalano warstw (ryzyko Home look); ostatnia warstwa polish nie zmienia Home 1.0 |
| F10 | Image SW cache-first (`rg-runtime-images-v5`) | **Warning** — bez zmiany strategii (ryzyko offline) |
| F11 | i18n: ~33 języki jako klony EN | **Warning** — poza zakresem polish UI |
| F12 | Font Awesome CDN bez użycia w widokach | **Warning** — nie usuwano (może być użyte w przyszłości / CSP) |
| F13 | Martwy `js/data/thematicRoutes.js` | **Warning** — nie usuwano (poza minimal UX) |
| F14 | UTF-8 w `home.js` / `pushNotifications.js` (komentarze + regex) | **Warning** — nie ruszano logiki regex; tylko UI HTML |
| F15 | Legacy `app.bundle.js` drift | **Warning** — bez rebuild (wymaga osobnego etapu) |
| F16 | Ciężki boot diagnostics w `app.js` | **Warning** — nie ruszano `app.js` |

### Low / Info (świadomie nie zmieniane)

| ID | Problem |
|----|---------|
| F17 | Hero CSS (`.home-hero`) dla ścieżki legacy — live Home używa `.home-greeting` |
| F18 | Orphan brand logos / nieużywane audio nature |
| F19 | Eventy martwe: `OPEN_PREMIUM`, `STORE_RESET` |
| F20 | Premium sticky flags — logika biznesowa (zakaz zmiany Premium) |
| F21 | Multi-path GPS — zakaz zmiany GPS |

### Mapa (audyt)

| Check | Wynik |
|-------|-------|
| `safeInvalidateSize` przy otwartym popup | Obecne — OK |
| Guard popup vs marker refresh | Obecne — OK |
| Podwójne `invalidateSize` bez sensu | Nie usuwano ścieżek GPS; dual-import mapSettings naprawiony |
| Race conditions | Udokumentowane w 35A; bez zmiany logiki |

---

## 2. Naprawione problemy (lista)

1. **Warstwa CSS** `css/ux-polish-1.css` (import na końcu stacku):
   - brak poziomego scrolla (`overflow-x: clip`)
   - header: równa wysokość `--ph-btn` dla wszystkich akcji
   - dark contrast: Smaki dnia, Region żyje, Polecamy (sub), badge, toast, menu, kategorie photo, Premium cards
   - touch targets 44px (nav / CTA / map buttons)
   - `:focus-visible` (WCAG)
   - spokojniejsze transition + `prefers-reduced-motion`
2. **Ujednolicenie importów modułów** (eliminacja dual instances).
3. **SW register** zsynchronizowany z `rg-pwa-v27`.
4. **UTF-8** w widocznych fallbackach `index.html` (menu feedback / test guide / share / SW warn).
5. Cache-bust: `style.css?v=558`, `app.js?v=592`.

---

## 3. Czego nie zmieniono (świadomie)

| Obszar | Powód |
|--------|--------|
| Home 1.0 order / clutter / sekcje | Zakaz ETAP 35 |
| GPS / Premium / EventBus / Store / API | Zakaz |
| `app.js` | Zakaz bez konieczności |
| Leaflet init / marker pipeline | Tylko dual-import settings |
| Image SW strategy cache-first | Ryzyko offline |
| Usuwanie FA / thematicRoutes / audio | Poza minimal UX; wymaga osobnego cleanup |
| Rebuild legacy bundle | Osobny etap |
| Tłumaczenia 33 języków | Content, nie polish UI |
| Brand colors / logo / fonts | Brand Lock |

---

## 4. Zmodyfikowane pliki

| Plik | Zmiana |
|------|--------|
| `css/ux-polish-1.css` | **NOWY** — warstwa polish |
| `css/style.css` | `@import` ux-polish-1 |
| `index.html` | CSS/JS/?v= SW; UTF-8 fallbacki |
| `js/diagnostics/virtualUser.js` | producerModal `?v=7` |
| `js/diagnostics/realUserSimulation.js` | producerModal `?v=7` |
| `js/diagnostics/selfHealing.js` | categoryImages `?v=6` |
| `js/presentation/producerTrust.js` | categoryImages `?v=6` |
| `js/data/contentProducers.js` | categoryImages `?v=6` |
| `js/map/map.js` | mapSettings `?v=2` |
| `js/map/mapSettingsPanel.js` | mapSettings `?v=2` |
| `docs/final/UX-POLISH-1.0.md` | ten raport |

---

## 5. Testy wykonane

| Test | Wynik |
|------|-------|
| `node scripts/full-audit.mjs` | **PASS** (207 OK) |
| `node scripts/check-translations.mjs` | **PASS** (36×1202) |
| `node scripts/test-pwa.mjs` | **PASS** |
| `node --check` (zmienione JS) | **PASS** |
| Responsive 320–desktop | Naprawione CSS (overflow / header); pełny browser matrix wymaga ręcznego QA na urządzeniu |
| Dark / Light | Reguły kontrastu dodane; ręczny przegląd zalecany |
| Mapa / GPS / Premium / Offline | Logika nietknięta; dual-import settings/modal naprawiony |
| Accessibility | focus-visible + touch 44px |
| Brand | Literata / Source Sans 3 / logo-master bez zmian |

### Ręczny QA (zalecany przed release)

- [ ] 320 / 360 / 390 / 430 / 768 / desktop — Home, Mapa, Modal, Menu  
- [ ] Dark: Smaki dnia, Region żyje, Doradca, Polecamy, Premium, Toast  
- [ ] Header: równe przyciski, brak overflow  
- [ ] Mapa: markery + popup + GPS po hard reload  
- [ ] PWA install + SW update (`?v=27`)  
- [ ] Offline smoke  

---

## 6. Ocena końcowa (szczegóły)

### UX — PASS
Header, karty, touch, brak poziomego scrolla, spokojniejsze animacje. Home 1.0 nietknięty strukturalnie.

### Brand — PASS
Logo master, Literata + Source Sans 3, zieleń/złoto/krem w polish warstwie. Cold navy w map chrome — odziedziczone, nie ruszane.

### Performance — WARNING
Diagnostics nadal w boot path; FA CDN; image cache-first. Brak agresywnego cleanup (bezpieczeństwo).

### Accessibility — PASS
`:focus-visible`, min 44px targets, lepszy kontrast dark. Pełny audit WCAG AA (axe) nie uruchomiony w CI.

### Responsywność — PASS
Shell clip + header breakpoints 320+ zachowane/wzmocnione.

### Mapa — PASS
Dual `mapSettings` / `producerModal` usunięte; `safeInvalidateSize` już chroni popupy.

### Dark Mode — PASS
Kluczowe sekcje Home + menu + toast + kategorie photo.

### Spójność — WARNING
CSS multi-layer nadal istnieje; martwe pliki/orphans z 35A bez cleanup.

### Kod — PASS
0 błędów full-audit; importy spójne.

### Gotowość produkcyjna — PASS (WARNING)
Można freeze 1.0 po ręcznym QA checklist. WARNING: i18n content, SW image strategy, legacy bundle, diagnostics boot weight.

---

## 7. Rekomendowane kolejne etapy (po 1.0)

1. Rebuild `app.bundle.js` (`npm run build:legacy`)  
2. Network-first lub stale-while-revalidate dla `/assets/images/`  
3. Content i18n (nie tylko struktura kluczy)  
4. Cleanup: FA, `thematicRoutes`, orphan audio  
5. UTF-8 restore w `home.js` / `pushNotifications.js`  

---

**Koniec ETAP 35 — UX Polish 1.0**  
`autoApply=false` · `autoFix=false`
