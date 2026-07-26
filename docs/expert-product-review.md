# ETAP 21 — Ekspercki przegląd produktu

**Data:** 2026-07-21  
**Charakter:** ocena jakości produktu z perspektyw specjalistów — **nie** testy jednostkowe / nie naprawy kodu.  
**Źródła:** Master Report, Brand 20A, Health/Daily/Guardian, UX obserwowany w architekturze ekranów.

---

## Podsumowanie dla Product Ownera

| Specjalista | Ocena (0–10) | Werdykt jednym zdaniem |
|-------------|--------------|-------------------------|
| UX Designer | **8.4** | Ciepła, emocjonalna ścieżka; Home grozi przeładowaniem. |
| UI Designer | **8.7** | Spójna paleta Premium po 20A; CSS ma dług „konfliktów”. |
| Ekspert PWA | **8.8** | Solidna instalowalność i ikony; brak twardego E2E install CI. |
| Specjalista wydajności | **7.8** | Mapa i Home to ryzyka; legacy bundle ciąży. |
| Ekspert dostępności | **7.9** | Kontrast headera mocny; kontrolki ikoniczne do dogrania. |
| Ekspert i18n | **9.5** | 36×1104 komplet — klasa A. |
| Product Manager | **8.6** | Wyraźna nisza vs Maps/Yelp/TGTG; retencja ma fundamenty narracyjne. |

**Średnia ekspertów: 8.5 / 10** ≈ **85 / 100** (zbieżne z Master Report 86).

---

## 👨‍🎨 UX Designer — intuicyjność, wygląd, ergonomia

### Co działa
- Pierwszy kontakt buduje **atmosferę regionu**, nie „panel administracyjny”.
- Ścieżka **Home → kategoria/mapa → producent** jest naturalna.
- Modal producenta jako „pełny ekran szczegółu” zmniejsza zagubienie względem osobnej trasy routingu.
- Elementy typu Smaki dnia / Doradca / Magia powrotu dają **powód do emocji**, nie tylko do klikania pinów.

### Co frustruje
- Home zbiera wiele sekcji narracyjnych — ryzyko **przewijania bez hierarchii** („co jest najważniejsze dziś?”).
- Mapa (Leaflet) zawsze będzie trudniejsza dla nowicjusza niż lista — potrzebny mocny CTA „w pobliżu” na Home (już jest, ale konkuruje z innymi blokami).
- Health UX ~85% sygnalizuje, że ergonomia nie jest jeszcze „bezszwowa”.

### Rekomendacje (bez implementacji)
1. Jedna dominująca akcja w pierwszym viewporcie Home (mapa/lokalizacja LUB „Dla Ciebie”) — reszta niżej.  
2. Skrócić ścieżkę powrotu z modala (zawsze jasne Wstecz).  
3. Virtual User jako rytuał przed releasem UX.

**Ocena: 8.4 / 10**

---

## 🎨 UI Designer — kolory, typografia, odstępy, spójność

### Co działa
- Po ETAP 20A: **jedno logo**, ciepła paleta (zieleń / złoto / krem / miód), brak zimnego niebieskiego w brand tokenach.
- Typografia Literata + Source Sans 3 nadaje charakter Premium bez „startup purple”.
- Header z wysokim kontrastem — świadoma decyzja pod outdoor/słońce.
- Landing zsynchronizowany kolorystycznie z aplikacją.

### Co szwankuje
- Heurystyka Health: **~40 potencjalnych konfliktów CSS** — to dług wizualny (różne warstwy `@import`).
- Dolna nawigacja nadal emoji-driven — spójna kulturowo, ale nie „design system icon set”.
- Duży `style.css` utrudnia kontrolę odstępów globalnych.

### Rekomendacje
1. Design tokens tylko w jednej warstwie końcowej (brand-final jako source of truth).  
2. Audit spacing 4/8 px na kartach Home.  
3. Ikony systemowe (nav) rozważyć jako SVG w kolorach brand — osobny etap.

**Ocena: 8.7 / 10**

---

## 📱 Ekspert PWA — mobilność i instalowalność

### Co działa
- Manifest kompletny, ikony any + maskable, apple-touch, theme/background zgodne z brandem.
- `beforeinstallprompt` + baner instalacji z logo.
- SW z precache ikon i strategią cache; ikony powiadomień spójne.
- Test `check:pwa` przechodzi.

### Luki
- Brak automatycznego testu instalacji na urządzeniu w CI.  
- Soft „splash” głównie CSS — nie natywny splash iOS w pełnym zakresie.  
- Offline: jest wsparcie, ale doświadczenie offline mapy zawsze ograniczone (OSM/tiles).

### Rekomendacje
1. Checklista ręczna: Add to Home Screen iOS + Android przed każdym releasem.  
2. Upewnić się, że SW nie serwuje starego cache ikon po bumpie `?v=20` (użytkownicy z twardym cache).  

**Ocena: 8.8 / 10**

---

## ⚡ Specjalista wydajności — szybkość i optymalizacja

### Co działa
- Health Performance **99%** (skan statyczny) — dobry sygnał.  
- WebP produktów, MarkerCluster na mapie.  
- Moduły ES — możliwość lazy (nie wszędzie wykorzystana).

### Ryzyka
- `home.js` + wiele sekcji narracyjnych = koszt pierwszego paint.  
- `map.js` bardzo duży (~2.5k LOC).  
- `legacy/app.bundle.js` ~644 KB — anty-pattern obok modules.  
- CSS: wiele `@import` = waterfall.  
- Folder `_probe` z ciężkimi JPG — nie powinien trafiać do prod cache.

### Rekomendacje
1. Defer sekcji below-the-fold na Home.  
2. Rozważyć scalenie krytycznego CSS / ograniczenie importów.  
3. Polityka: legacy bundle tylko dla starych WebView albo wycofanie.

**Ocena: 7.8 / 10**

---

## ♿ Ekspert dostępności — kontrast, klawiatura, czytelność

### Co działa
- Kontrast nagłówka po Brand 20A wyraźnie lepszy (tekst jasny na ciemnej zieleni + obramowania kontrolek).  
- Atrybuty `lang`, fokus w modalu (w kodzie są pathy focus/guard).  
- i18n kompletne — dostępność językowa wysoka.

### Ryzyka
- Przyciski ikoniczne bez `aria-label` (Improve/Health często to wskazują).  
- Emoji jako jedyny sygnał w bottom nav — problem dla readerów / wysokiego kontrastu OS.  
- Mapa Leaflet: dostępność markerów z natury słaba (typowe dla map).

### Rekomendacje
1. Przejść checklistę WCAG 2.2 AA na Home + modal + nav.  
2. Każdy icon-button = widoczna lub aria nazwa.  
3. Nie polegać wyłącznie na kolorze złota dla Premium CTA.

**Ocena: 7.9 / 10**

---

## 🌍 Ekspert i18n — tłumaczenia i lokalizacja

### Co działa
- **36 języków × 1104 klucze**, check vs DE = komplet.  
- To jest wyróżnik projektu — rzadko spotykany poziom w PWA regionalnych.  
- Osobne pakiety about/legal/content.

### Ryzyka
- Jakość językowa (naturalność) nie jest mierzona automatycznie — tylko kompletność kluczy.  
- Długie stringi DE mogą psuć layout w FI/DE na wąskich ekranach.  
- Fallback UX gdy `t()` zwróci klucz — monitorowane przez Health/VU.

### Rekomendacje
1. Spot-check 3 języków spoza DE/EN/PL przez native speakera.  
2. Pseudo-loc test na overflow.  

**Ocena: 9.5 / 10**

---

## 📈 Product Manager — retencja, wartość, przewaga

### Wartość
Produkt rozwiązuje realną lukę: **„chcę lokalnego smaku, nie kolejnej uniwersalnej mapy”**.  
Przewaga: emocja regionu + producenci + PWA + ogrom i18n + lokalne uczenie się bez oddawania danych.

### Retencja — co już macie
- Magia powrotu, Taste Advisor, Smaki dnia, Living Region, Learning Engine, trasy zakupowe, Premium trial.

### Retencja — co blokuje wzrost
- Cold start personalizacji (mało sygnałów).  
- Home może przytłaczać zamiast prowadzić do **jednego sukcesu** (pierwszy producent w 30 s).  
- Brak twardego nawyku tygodniowego dla użytkownika końcowego (raporty Weekly są dla dev).

### Vs konkurencja (skrót)
- vs Maps: kontekst smaku  
- vs Tripadvisor/Yelp: lokalna żywność, nie turystyka globalna  
- vs TGTG: codzienne odkrywanie, nie tylko surplus  

### Priorytety produktowe (kolejność)
1. Time-to-first-success (lokalizacja → 1 karta).  
2. „Dla Ciebie” wyraźnie różne od „Polecane”.  
3. Wróć do trasy / chip wyszukiwania.  
4. CSS debt nie blokuje launchu, ale blokuje polish.  

**Ocena: 8.6 / 10**

---

## Synteza — co zrobić dalej (kolejność biznesowa)

| Priorytet | Temat | Właściciel perspektywy |
|-----------|-------|------------------------|
| P0 | Time-to-first-success na Home | UX + PM |
| P1 | Porządek CSS / spójność tokenów | UI |
| P1 | A11y icon buttons | A11y |
| P2 | Odchudzenie Home / defer | Performance |
| P2 | Virtual User przed releasem | UX + PWA |
| P3 | Native-check i18n | i18n |

---

## Skala łączna ETAP 21

**8.5 / 10** — produkt wyróżniający się emocją i i18n, z solidną PWA i brandem; największy dług to warstwy CSS/Home weight oraz domknięcie a11y/ergonomii detali.

---

*Dokument wyłącznie analityczny. Nie wprowadza zmian w kodzie.*
