# ETAP 45 — Product Director AI

**Dzień:** 2026-07-23  
**Wygenerowano:** 2026-07-23T18:35:51.015Z  
**autoApply:** false · max 3

## Dzisiaj największy wpływ na jakość aplikacji będzie miało:

1. Ładuj Leaflet + MarkerCluster dopiero przy pierwszym wejściu na mapę.
2. Jedna dyskretna linia wartości Premium pod CTA (bez nowego ekranu / popupu).
3. Ukryj lub zwiń najniżej zaangażowane sekcje Home + usuń martwy Font Awesome z krytycznej ścieżki.

## Szczegóły

### 1. Ładuj Leaflet + MarkerCluster dopiero przy pierwszym wejściu na mapę.

- **ID:** `pi-pi-defer-leaflet`
- **Dlaczego:** Mapa / cold start: tak (severity 67)
- **Wpływ:** high · **Ryzyko:** medium
- **Effort:** 4–8 h (lazy CDN + dynamic import widoku)
- **Efekt:** Szybszy Home i LCP; mapa bez regresji funkcji
- **Źródła:** product-intelligence, Performance overall ~44 (ETAP 32D), Leaflet + MarkerCluster sync w <head> na każdym starcie, Eager import views/map.js w grafie app.js (~1.8 MB JS), Health performance 99 (statyczny — nie neguje kosztu startu mapy)
- **Status:** `pending_acceptance`

### 2. Jedna dyskretna linia wartości Premium pod CTA (bez nowego ekranu / popupu).

- **ID:** `pi-pi-premium-subtle-signal`
- **Dlaczego:** Premium widoczność: nie (severity 62)
- **Wpływ:** medium · **Ryzyko:** low
- **Effort:** 1–2 h (copy + CSS, Brand Lock)
- **Efekt:** Jasny powód subskrypcji bez psucia foldu Home 1.0
- **Źródła:** product-intelligence, Home 1.0: Premium order:50 — poza pierwszym ekranem (świadomy trade-off), Wartość „dlaczego jutro zapłacić” nadal warunkowa (Final Review / Product Status)
- **Status:** `pending_acceptance`

### 3. Ukryj lub zwiń najniżej zaangażowane sekcje Home + usuń martwy Font Awesome z krytycznej ścieżki.

- **ID:** `pi-pi-hide-low-value-sections`
- **Dlaczego:** Prawie nieużywane: tak (severity 60)
- **Wpływ:** medium · **Ryzyko:** low
- **Effort:** 2–4 h
- **Efekt:** Lżejszy DOM/CSS, czytelniejszy scroll, mniej szumu
- **Źródła:** product-intelligence, Home poniżej foldu: wiele sekcji narracyjnych (Smaki dnia, Doradca, Nature, Story, Live…) — ryzyko scroll fatigue, Font Awesome all.min.css prawdopodobnie martwy (brak klas fa w app), Diagnostics (12+ init) w cold path — koszt bez wartości dla użytkownika końcowego, Health unusedJs count 1
- **Status:** `pending_acceptance`

## Źródła (obecność raportów)

| Źródło | Dostępne |
|--------|:--------:|
| productIntelligence | yes |
| livingRegion | yes |
| regionalBrain | yes |
| productBrain | yes |
| productDirector | yes |
| selfReflection | yes |
| dream | yes |
| emotion | yes |
| health | yes |
| releaseValidator | yes |
| uiGuardian | yes |
| mapGuardian | yes |
| productionPolish | yes |

## Polityka

- Żadnych automatycznych zmian w kodzie ani danych.
- Max 3 rekomendacje dziennie — czekają na akceptację właściciela.
- Agreguje Product Intelligence, Living Region AI, Regional Brain, Product Brain i raporty jakości.
