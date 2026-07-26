# Living Brand – strażnik marki

Dzień: **2026-07-21**
Wygenerowano: 2026-07-21T17:32:41.543Z
Status: **watch** · overall **95%**

## Czy marka jest spójna wszędzie?

Wykryto odstępstwa średnie — marka zaczyna „pływać”. Popraw przed kolejnym dniem.

## Scores

- **logo**: 92% · findings 1 · OK
- **colors**: 100% · findings 0 · OK
- **icons**: 100% · findings 0 · OK
- **photos**: 100% · findings 0 · OK
- **coldBlue**: 100% · findings 0 · OK
- **fonts**: 100% · findings 0 · OK
- **shadows**: 74% · findings 7

## Brand Book

- Logo: `assets/icons/logo-master.svg` (dwa złote kłosy pochylone w prawo)
- Paleta: zieleń / złoto / wheat / honey / cream
- Fonty: Literata + Source Sans 3
- Zakaz: zimny niebieski

## Odstępstwa

### LB-001 [medium] logo — Podejrzenie obcego pliku logo

- plik: `css/brand-identity-final.css`
- logo-master
- wartość: `logo-master`
- autoApply: false

### LB-002 [medium] shadows — Duża różnorodność cieni (112 unikalnych)

- plik: `css/`
- Brand Book preferuje spójną rodzinę miękkich cieni + złoty akcent headera
- autoApply: false

### LB-003 [low] shadows — Cień poza kanonicznymi rodzinami

- plik: `css/emotions-climate.css`
- var(--glass-shadow), inset -8px -6px 0 -4px rgba(255, 200, 130, 0.06)
- wartość: `var(--glass-shadow), inset -8px -6px 0 -4px rgba(255, 200, 130, 0.06)`
- autoApply: false

### LB-004 [low] shadows — Cień poza kanonicznymi rodzinami

- plik: `css/emotions-climate.css`
- var(--glass-shadow), inset -8px -6px 0 -4px rgba(230, 120, 50, 0.1)
- wartość: `var(--glass-shadow), inset -8px -6px 0 -4px rgba(230, 120, 50, 0.1)`
- autoApply: false

### LB-005 [low] shadows — Cień poza kanonicznymi rodzinami

- plik: `css/emotions-climate.css`
- var(--glass-shadow), inset -8px -6px 0 -4px rgba(160, 200, 120, 0.1)
- wartość: `var(--glass-shadow), inset -8px -6px 0 -4px rgba(160, 200, 120, 0.1)`
- autoApply: false

### LB-006 [low] shadows — Cień poza kanonicznymi rodzinami

- plik: `css/emotions-climate.css`
- inset 0 0 0 1px rgba(255, 200, 130, 0.12)
- wartość: `inset 0 0 0 1px rgba(255, 200, 130, 0.12)`
- autoApply: false

### LB-007 [low] shadows — Cień poza kanonicznymi rodzinami

- plik: `css/emotions-climate.css`
- 0 4px 28px rgba(90, 55, 20, 0.1), inset 0 1px 0 rgba(255, 236, 200, 0.45)
- wartość: `0 4px 28px rgba(90, 55, 20, 0.1), inset 0 1px 0 rgba(255, 236, 200, 0.45)`
- autoApply: false

### LB-008 [low] shadows — Cień poza kanonicznymi rodzinami

- plik: `css/final-ux-premium.css`
- var(--fx-shadow-sm)
- wartość: `var(--fx-shadow-sm)`
- autoApply: false

## Polityka

- autoFix: false
- codzienny raport
- Ty zatwierdzasz poprawki

## Uruchomienie

```bash
npm run living-brand
```

Przeglądarka: `__RG_LIVING_BRAND__.run()`
