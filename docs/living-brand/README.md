# Living Brand (ETAP 26)

AI pilnuje marki — codziennie.

## Co sprawdza

| Check | Pytanie |
|-------|---------|
| logo | Czy wszędzie jest to samo logo (`logo-master.svg`)? |
| colors | Czy kolory są zgodne z Brand Book? |
| icons | Czy ikony PWA / favicon są z tej samej linii? |
| photos | Czy fotografie pasują do klimatu regionu? |
| coldBlue | Czy nigdzie nie pojawił się zimny niebieski? |
| fonts | Czy nie ma obcych fontów (Inter, Roboto…)? |
| shadows | Czy cienie trzymają rodzinę marki? |

Jeżeli coś odbiega → **raport**. Bez auto-fix.

## Brand Book (oficjalny)

Pełny dokument przed publikacją:

- Markdown: [`docs/brand/BRAND-BOOK.md`](../brand/BRAND-BOOK.md)
- Wizualnie: [`docs/brand/brand-book.html`](../brand/brand-book.html)

Skrót: logo = dwa złote kłosy → · paleta zieleń/złoto/pszenica/miód/krem · Literata + Source Sans 3 · zakaz zimnego niebieskiego.

## CLI

```bash
npm run living-brand
npm run check:living-brand
```

→ `docs/living-brand/latest.md`

## Przeglądarka

```js
__RG_LIVING_BRAND__.run()
```

Panel Dev → **Living Brand**.
