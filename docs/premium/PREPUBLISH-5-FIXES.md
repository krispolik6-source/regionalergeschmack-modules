# 5 poprawek przed premierą — raport

Data: 2026-07-21  
Zakres: tylko CSS / HTML prezentacja / kolejność sekcji Home. Bez zmian Store · EventBus · API · GPS · Leaflet · routing.

## Poprawka 1 — CSS

| | |
|--|--|
| **Zmiany** | Utrzymane stacki (`experience-stack`, `brand-stack`) + `prepublish.css` v3. Tokeny `--photo-card-height` / `--photo-modal-height`. Cache `style.css?v=537`. |
| **Test** | `npm run check:prepublish` — **OK** (wszystkie 5) |

## Poprawka 2 — Home

| | |
|--|--|
| **Zmiany** | DOM: powitanie → szukaj → lokalizacja/mapa, potem kategorie / Polecane / Living Region / Smaki dnia; Premium i Return Magic na dole. CSS `order` w `prepublish.css`. Narracje widoczne po scrollu (nie `display:none`). |
| **Test** | Smoke P2 (kolejność w `home.js` + CSS order) — OK |

## Poprawka 3 — Mapa

| | |
|--|--|
| **Zmiany** | Edge-to-edge, bez ramek `#app` / mapy. Wysokość `calc(100vh − header − nav)`. Mniejsze pills GPS/OSM/Lista. Mniejszy zoom Leaflet. |
| **Test** | Smoke P3 (`map-viewport-height` w prepublish) — OK · wizualnie: Ctrl+Shift+R → widok Mapa |

## Poprawka 4 — Zdjęcia

| | |
|--|--|
| **Zmiany** | Karty: **180px** (`--photo-card-height`). Modal: **300px** (`--photo-modal-height`). Venue photo + product cards. |
| **Test** | Smoke P4 — OK · wizualnie: marker → modal |

## Poprawka 5 — Logo

| | |
|--|--|
| **Zmiany** | Wszędzie UI: `logo-master.svg?v=23` (header, side menu, Home, Premium, landing, favicon SVG). PWA PNG / apple-touch / splash = generaty z mastera (`?v=23`). Glyph bez kafelka (`prepublish`). |
| **Test** | Smoke P5 — OK |

## Gotowość do premiery

| Kryterium | Status |
|-----------|--------|
| Logika aplikacji nietknięta | tak |
| Brand Lock (kolory / fonty / master logo) | zachowany |
| Pierwszy ekran Home uproszczony | tak |
| Mapa czystsza / większa | tak |
| Zdjęcia większe | tak |
| Jedno logo | tak |
| SMTP raportów (osobny wątek) | wymaga lokalnego `.env` |

**Werdykt:** warstwa wizualna jest gotowa do premiery po ręcznym Ctrl+Shift+R na telefonie (Home + Mapa + modal).  
Automatyczny smoke: `npm run check:prepublish`.
