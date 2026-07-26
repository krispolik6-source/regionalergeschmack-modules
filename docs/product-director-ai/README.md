# ETAP 45 — Product Director AI

Jeden moduł zbiera wnioski ze wszystkich raportów inteligencji i jakości.
Codziennie proponuje **maksymalnie 3** ulepszenia.

**Żadnych automatycznych zmian** — tylko rekomendacje dla właściciela.

## Uruchomienie

```bash
npm run director-ai
# aliasy: product-director-ai · check:director-ai (smoke)
```

`--verbose` — dodatkowy log źródeł / ścieżki raportu.

## Board (domyślna konsola)

```
Dzisiaj największy wpływ na jakość aplikacji będzie miało:

1. Skrócenie czasu ładowania mapy.
2. Poprawa kontrastu w trybie nocnym.
3. Uzupełnienie zdjęć producentów.

Żadnych automatycznych zmian — tylko rekomendacje.
```

## Źródła (agregacja)

| Moduł | Ścieżka |
|-------|---------|
| Product Intelligence | `docs/product-intelligence/latest.json` |
| Living Region AI | `docs/living-region/latest.json` |
| Regional Brain | `docs/intelligence/latest.json` |
| Product Brain | `docs/product-brain/latest.json` |
| Product Director (27) | `docs/product-director/latest.json` |
| Dream / Self-reflection / Emotion / Health | `docs/*/latest.json` |
| Release Validator | `docs/final/release-validator-latest.json` |
| UI / Map Guardian | `docs/ui-guardian`, `docs/map-guardian` |

## Artefakty

- `latest.md` / `latest.json`
- `YYYY-MM-DD.{md,json}`
- `pending-acceptance.json`

## Polityka

- `autoApply: false`
- `requiresOwnerAcceptance: true`
- max 3 / dzień · deduplikacja po temacie
- test wartości: zwiększa wartość, nie liczbę funkcji (`js/intelligence/policy.js`)

ETAP 27 (`npm run director`) pozostaje briefingiem Q&A — ten moduł to warstwa **dziennych rekomendacji jakości**.
