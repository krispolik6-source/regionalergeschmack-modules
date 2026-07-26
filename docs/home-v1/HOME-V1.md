# ETAP 32A — Home 1.0

**Data:** 2026-07-22  
**Polityka:** `autoApply=false` · bez nowych funkcji · bez EventBus / Store / Mapa / GPS  
**Zakres:** wyłącznie UX (kolejność DOM + CSS fold)

---

## Cel (3 sekundy)

Użytkownik ma wiedzieć:

1. **gdzie jestem** — logo + powitanie + podtytuł regionu  
2. **co mogę zrobić** — jedna rekomendacja regionu (Regional Intelligence / Soul tip)  
3. **gdzie kliknąć** — wyszukiwarka + jedno CTA „w pobliżu / mapa”

---

## Co zmieniono (wdrożone UX)

| # | Wymaganie | Realizacja |
|---|-----------|------------|
| 1 | Usunąć rozpraszacze z pierwszego ekranu | Quick filters / kategorie / Premium / narracje poniżej foldu; 2. CTA lokalizacji ukryte wizualnie; reklamy ukryte |
| 2 | Fold: logo · powitanie · 1 rekomendacja · szukaj · 1 CTA | `home-greeting` → `home-region-rec` → `home-hub` → `home-actions` |
| 3 | Kategorie niżej | `order: 20` |
| 4 | Premium niżej | `order: 50` |
| 5 | Region Soul poniżej kategorii | Sekcja **Living Region** (`home-living-region`) zaraz po kategoriach (`order: 21`). Tip na foldzie = Regional Intelligence / Soul **rekomendacja** (jeden blok) |
| 6 | Return Magic poniżej Region Soul | DOM + `order: 22` zaraz po Living Region |
| 7 | Puste odstępy | `gap: 6–8px`, zbite margin/padding greeting/hub/actions |
| 8 | Kolejność sekcji | Warstwa `css/home-v1.css` (ostatni import) |
| 9 | Bez logiki | Handlery / EventBus / Store bez zmian; `#getLocationBtn` nadal w DOM (sr-only) |

### Pliki

- `js/views/home.js` — kolejność sekcji, klasa `home-page--v1`, rekomendacja jako `home-region-rec`
- `css/home-v1.css` — fold order + jedno CTA + logo widoczne na mobile
- `css/style.css` — `@import home-v1.css`
- Cache-bust: `style.css?v=551`, `home.js?v=38`, `app.js?v=585`

---

## Fold — mapa elementów

### Pierwszy ekran (zamierzone)

1. Logo + wordmark  
2. Powitanie (tytuł)  
3. Podtytuł (`home.greetingSub`)  
4. Jedna rekomendacja regionu (`home-region-rec`)  
5. Wyszukiwarka  
6. Jedno CTA: `#findNearbyBtn`

### Świadomie poza pierwszym ekranem

- Siatka kategorii + quick filters  
- Living Region (Region Soul / impulsy)  
- Return Magic  
- Premium + hint  
- Smaki dnia, doradca, smart today, nature, story, live, seasonal, listy, przepisy, footer  

---

## Ocena

### Czy Home jest prostszy?

**Tak.** Pierwszy viewport ma jedną ścieżkę: marka → tip regionu → szukaj → mapa/okolica. Kategorie i Premium nie konkurują o uwagę w 3 s.

### Ile elementów zniknęło z pierwszego ekranu?

| Było (typowy mobile przed 1.0) | Po 1.0 |
|-------------------------------|--------|
| Logo (często ukryte polish) | Logo **zawsze** |
| Tytuł + ambient + sub (często ukryty przy soul) | Tytuł + sub + ambient wyciszony |
| Region tip w greeting | Tip jako osobny kompaktowy blok |
| Search | Search |
| **2 CTA** (lokalizacja + okolica) | **1 CTA** (okolica) |
| Quick filters | ↓ poniżej |
| Siatka 8 kategorii | ↓ poniżej |
| Premium wcześnie (polish order 8) | ↓ order 50 |
| Narracje / carousele | ↓ poniżej |

**Szacunek: ~6–8 bloków UI zniknęło z pierwszego kadru** (2. CTA, filtry, kategorie, Premium, ewentualnie 2–4 sekcje narracyjne / carouseli, które wcześniej „wchodziły” przy krótkim scrollu lub złym order).

### Czy pierwszy ekran mieści się na telefonie 320–430 px?

**Tak — z założenia projektowego (CSS).**  
Szacunek wysokości foldu @390×844 (orientacyjnie):

| Blok | ~px |
|------|----:|
| Logo + tytuł + sub | 88–110 |
| Rekomendacja regionu | 56–72 |
| Search | 48–56 |
| CTA | 48 |
| Gap ×4 | ~24–32 |
| **Suma** | **~265–320 px** |

Przy viewport wysokości ~640–720 (telefon 320–430 szerokości, chrome UI) fold **mieści się bez scrolla** w typowych warunkach.  
**Uwaga:** długi tekst rekomendacji lub duża czcionka systemowa może lekko wypchnąć CTA — wtedy 1 krótki scroll; nie wraca siatka kategorii.

---

## Mapowanie nazw (ważne)

| W briefie | W kodzie |
|-----------|----------|
| Rekomendacja regionu (fold) | `home-region-rec` = Regional Intelligence **lub** Soul tip (jeden) |
| Region Soul poniżej kategorii | `home-living-region` (Living Region) bezpośrednio po kategoriach |
| Return Magic | `home-return-magic` zaraz potem |
| Jedno CTA | `#findNearbyBtn`; `#getLocationBtn` ukryty wizualnie |

---

## Regresja / test ręczny

1. Ctrl+Shift+R  
2. Home na szerokości 360–390 px — bez kategorii na starcie  
3. Jedno zielone/brązowe CTA „okolica”  
4. Logo widoczne  
5. Scroll: kategorie → Living Region → Return Magic → … → Premium  
6. Klik CTA / search / tip regionu — nadal działa  

---

## Status

| | |
|--|--|
| Home prostszy | **Tak** |
| Elementy zniknęły z 1. ekranu | **~6–8** |
| Fold 320–430 px | **Tak (szacunek PASS)** |
| autoApply | **false** (kolejne zmiany tylko po akceptacji) |

---

*Koniec ETAP 32A Home 1.0.*
