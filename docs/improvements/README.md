# Improvement Engine (ETAP 18C)

Raport dzienny **„Co można poprawić”**.

## Polityka (twarda)

- **Nie zmienia kodu aplikacji automatycznie**
- `autoApply: false`
- `autoCommit: false`
- Wymaga akceptacji człowieka

## Źródła analizy

- raporty Health (`docs/health/` + runtime)
- Learning Engine (lokalne zachowania)
- wydajność, pamięć, UX, błędy

## Uruchomienie

```bash
npm run health
npm run improve
```

Pliki:

- `docs/improvements/latest.md`
- `docs/improvements/latest.json`
- `docs/improvements/YYYY-MM-DD.md` (raport dnia)

## W aplikacji (dev)

- Panel Health → **Co poprawić**
- Konsola: `__RG_IMPROVE__.run()` / `.last()`

Każda propozycja zawiera: priorytet, wpływ, plik, funkcję, ryzyko, proponowaną poprawkę.
