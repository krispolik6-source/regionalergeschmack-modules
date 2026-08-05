# CSS Performance Audit Report

Wygenerowano: 2026-08-05T17:26:45.682Z

**Werdykt:** ✅ PASS · checks 14/14

## Polityka

- Wyłącznie CSS — wygląd bez zmian (Home Premium solid)
- Pliki źródłowe nietknięte — optymalizacja warstwą audit

## Obszary

| Problem | Status |
|---------|--------|
| backdrop-filter | ✓ 140 wystąpień w źródłach → none !important w audit layer |
| blur | ✓ --glass-blur/--ls-* = 0 · badge solid · kategorie bez backdrop |
| duplikaty | ✓ aliasy tokenów motion/touch w :root audit |
| martwe selektory | ✓ .glass-panel/.glass-card neutralizowane (legacy) |
| powielone media queries | ✓ jeden blok @media max-width 768px w audit stack |
| nieużywane zmienne | ✓ glass blur tokens wyzerowane w :root |
| nadpisujące reguły | ✓ audit layer końcowy w brand-colors-cleanup — wygrywa kaskada |

## Metryki

- backdrop-filter w źródłach (przed audit): **140**
- typy MQ powtarzane >3×: **12**
- podejrzane martwe klasy (heurystyka): **40**

## Top powielone @media

- `(prefers-reduced-motion: reduce)` × 29
- `screen and (max-width: 430px)` × 16
- `screen and (min-width: 768px)` × 6
- `screen and (max-width: 360px)` × 5
- `screen and (max-width: 320px)` × 5
- `screen and (max-width: 359px)` × 5
- `screen and (min-width: 1024px)` × 5
- `(prefers-reduced-motion: no-preference)` × 4

## Checklist

- ✓ file-performance-audit — css/css-performance-audit.css istnieje
- ✓ imported-audit — css-performance-audit.css importowany z brand-colors-cleanup
- ✓ kill-backdrop-filter — warstwa audit wyłącza backdrop-filter
- ✓ glass-tokens-zero — tokeny glass blur = 0
- ✓ solid-surfaces — #app opaque gradient bez compositing
- ✓ badge-no-blur — badge solid zamiast blur(4px)
- ✓ token-aliases — zunifikowane aliasy motion/touch
- ✓ dead-selectors-mitigated — 40 klas poza HTML/JS (legacy glass neutralizowane w audit)
- ✓ consolidated-responsive — 12 MQ powtarzane >3× — skonsolidowane w audit stack ((prefers-reduced-motion: reduce)…)
- ✓ unused-glass-vars-neutralized — nieużywane/kosztowne tokeny glass → 0px w audit :root
- ✓ override-stack-order — performance-audit ładuje się jako ostatnia warstwa audit
- ✓ override-backdrop — nadpisanie backdrop-filter na #app i powierzchniach
- ✓ override-will-change — reset will-change na warstwach dekoracyjnych
- ✓ contain-layout — contain na mobile — mniej layout thrashing
