# Co można poprawić

Dzień: **2026-07-21**
Wygenerowano: 2026-07-21T16:50:13.718Z
Propozycji: **3**

## Polityka

- **autoApply: false** — silnik nie zmienia kodu
- autoCommit: false
- wymaga akceptacji człowieka

## Priorytety

- critical: 0
- high: 0
- medium: 3
- low: 0

## Propozycje

### IMP-001 — Popraw UX / Mobile

| Pole | Wartość |
| --- | --- |
| Priorytet | medium |
| Wpływ | high |
| Plik | `css/style.css` |
| Funkcja | `@media mobile` |
| Ryzyko | low |
| Źródło | ux |
| autoApply | false |

**Proponowana poprawka:** Tap targets ≥44px, brak overflow nagłówków na wąskich ekranach.

### IMP-002 — Potencjalne konflikty CSS: 40

| Pole | Wartość |
| --- | --- |
| Priorytet | medium |
| Wpływ | medium |
| Plik | `docs/health/latest.json` |
| Funkcja | `finding:css` |
| Ryzyko | low |
| Źródło | health |
| autoApply | false |

**Proponowana poprawka:** body [color]; .lp-header [background]; .lp-brand [color]; body:not(.view-map-active)::after [background]

### IMP-003 — Uporządkuj konflikty CSS (40)

| Pole | Wartość |
| --- | --- |
| Priorytet | medium |
| Wpływ | medium |
| Plik | `css/style.css` |
| Funkcja | `selectors` |
| Ryzyko | medium |
| Źródło | ux |
| autoApply | false |

**Proponowana poprawka:** Scal zduplikowane reguły (background/z-index) wskazane w docs/health/latest.json → static.css.sample.
