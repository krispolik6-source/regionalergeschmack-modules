# ETAP 44 — Release Validator

Przed każdym wydaniem: jedna komenda, jeden wynik.

```bash
npm run release-validator
# aliasy: npm run check:release · npm run release:validate
```

Opcje:

- `--verbose` / `-v` — log suite (domyślnie tylko board)
- `--fast` — pomija wolne checki (`predeploy`, `mobile-premium`)

## Board (jedyna domyślna konsola)

```
Release Score
  98 / 100

Ready for Production
  YES
```

albo

```
Ready for Production
  NO

Powód:
  3 krytyczne błędy
```

**Ready = YES** tylko gdy: `criticalFails === 0` **oraz** `Release Score ≥ 90`.

## Suite (kategorie)

| Kategoria | Co wchodzi |
|-----------|------------|
| Audits / tests | full-audit · functional · premiere · RC · predeploy · auth · images · reviews |
| Translations | check-translations · search-i18n · landing |
| Icons / brand | master-icon · logo · brand-protection · assets |
| PWA / offline | test-pwa · push · browser (manifest · SW · install) |
| Responsive | device-lab · responsive · mobile-premium |
| Accessibility | check-accessibility |
| Performance | application-health · production-polish · production-logging |
| Guardians | console · UI · map · memory · self-heal 39 |

## Artefakty

- `docs/final/RELEASE-VALIDATOR.md` — pełny raport
- `docs/final/RELEASE-VALIDATOR.json` — szczegóły
- `docs/final/release-validator-latest.json` — score + Ready (do canvas / CI)

## Polityka

- Architektura bez zmian (Store / EventBus / API / GPS / Leaflet / routing).
- Brand Lock: validator nie regeneruje logo — tylko sprawdza spójność wersji z `PWA_VERSION`.
- Functional + Overpass 504/timeout: traktowane jako flaky external (nie-critical), żeby sieć nie blokowała Ready samotnie.
