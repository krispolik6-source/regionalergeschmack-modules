# Product Intelligence — codzienne pytania

**Dzień:** 2026-07-22
**Wygenerowano:** 2026-07-22T19:25:05.733Z
**Etap:** 33D
**Powód:** cli-product-intelligence

## Polityka

- **autoApply:** false
- **Nie zmienia kodu** aplikacji
- Max **3** propozycje · status: `pending_acceptance`

## Odpowiedzi dnia

### Czy Home jest zbyt ciężki?

**Odpowiedź:** nie
**Severity (problem):** 25 / 100 · confidence 78

Dowody:
- Home 1.0 wdrożony (fold uproszczony)
- Emotion fatigue 50
- Self Reflection homeOverloaded score 68
- Health UX 85

### Czy mapa jest za wolna?

**Odpowiedź:** tak
**Severity (problem):** 67 / 100 · confidence 72

Dowody:
- Performance overall ~44 (ETAP 32D)
- Leaflet + MarkerCluster sync w <head> na każdym starcie
- Eager import views/map.js w grafie app.js (~1.8 MB JS)
- Health performance 99 (statyczny — nie neguje kosztu startu mapy)

### Czy Premium jest dobrze widoczne?

**Odpowiedź:** nie
**Severity (problem):** 62 / 100 · confidence 80

Dowody:
- Home 1.0: Premium order:50 — poza pierwszym ekranem (świadomy trade-off)
- Wartość „dlaczego jutro zapłacić” nadal warunkowa (Final Review / Product Status)

### Czy użytkownik szybko znajduje producenta?

**Odpowiedź:** tak
**Severity (problem):** 2 / 100 · confidence 85

Dowody:
- Self Reflection findProducer30s: 98 (yes)
- Fold: search + CTA „w pobliżu” — ścieżka do mapy czytelna
- Mapa / GPS / kategorie dostępne w rdzeniu produktu

### Czy jakaś sekcja jest prawie nieużywana?

**Odpowiedź:** tak
**Severity (problem):** 60 / 100 · confidence 65

Dowody:
- Home poniżej foldu: wiele sekcji narracyjnych (Smaki dnia, Doradca, Nature, Story, Live…) — ryzyko scroll fatigue
- Font Awesome all.min.css prawdopodobnie martwy (brak klas fa w app)
- Diagnostics (12+ init) w cold path — koszt bez wartości dla użytkownika końcowego
- Health unusedJs count 1

## 3 najlepsze propozycje

### 1. Ładuj Leaflet + MarkerCluster dopiero przy pierwszym wejściu na mapę

- **ID:** `pi-defer-leaflet`
- **Pytanie:** mapSlow
- **Dlaczego:** Mapa / cold start: tak (severity 67)
- **Wpływ:** high · **Ryzyko:** medium
- **Effort:** 4–8 h (lazy CDN + dynamic import widoku)
- **Efekt:** Szybszy Home i LCP; mapa bez regresji funkcji
- **Priority:** 85
- **Status:** pending_acceptance

### 2. Jedna dyskretna linia wartości Premium pod CTA (bez nowego ekranu / popupu)

- **ID:** `pi-premium-subtle-signal`
- **Pytanie:** premiumVisible
- **Dlaczego:** Premium widoczność: nie (severity 62)
- **Wpływ:** medium · **Ryzyko:** low
- **Effort:** 1–2 h (copy + CSS, Brand Lock)
- **Efekt:** Jasny powód subskrypcji bez psucia foldu Home 1.0
- **Priority:** 70
- **Status:** pending_acceptance

### 3. Ukryj lub zwiń najniżej zaangażowane sekcje Home + usuń martwy Font Awesome z krytycznej ścieżki

- **ID:** `pi-hide-low-value-sections`
- **Pytanie:** unusedSection
- **Dlaczego:** Prawie nieużywane: tak (severity 60)
- **Wpływ:** medium · **Ryzyko:** low
- **Effort:** 2–4 h
- **Efekt:** Lżejszy DOM/CSS, czytelniejszy scroll, mniej szumu
- **Priority:** 70
- **Status:** pending_acceptance

## Podsumowanie

| Pole | Wartość |
|------|---------|
| Problemy (tak/częściowo) | 3 / 5 |
| Kandydaci | 3 |
| Wybrane propozycje | 3 |
| Focus na jutro | Ładuj Leaflet + MarkerCluster dopiero przy pierwszym wejściu na mapę |

## Notatki

- Nie zmienia kodu aplikacji.
- autoApply=false — czekaj na akceptację właściciela.
- Maks. 3 propozycje dziennie.
