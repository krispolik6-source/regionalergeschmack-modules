# Application Health Monitor (ETAP 18A)

Warstwa diagnostyczna aplikacji. **Tylko obserwacja i raport** — nigdy nie zmienia kodu, Store, EventBus, API, GPS, mapy ani routingu.

## Runtime (w aplikacji)

Po starcie aplikacji automatycznie uruchamia się Health Check.

- Konsola: `window.__RG_HEALTH__.run()`
- Ostatni raport: `window.__RG_HEALTH__.last()`
- Tryb deweloperski (panel „Health”):
  - `localStorage.setItem('rg_dev_mode','1')` + reload, lub
  - `?dev=1`, lub
  - `localhost` / `127.0.0.1`

Panel pozwala skopiować JSON raportu. Monitor **nie zapisuje plików na dysk** (przeglądarka nie ma dostępu do `docs/health/`).

## Zapis do `docs/health/`

```bash
npm run health
# opcjonalnie scal z dumpem z przeglądarki:
npm run health -- --import=runtime-dump.json
```

Pliki:

- `docs/health/latest.json`
- `docs/health/latest.md`
- `docs/health/health-<timestamp>.json` (archiwum)

## Oceny (%)

Performance · UX · Accessibility · Memory · Data Quality · Translation · Mobile · PWA

## Polityka

- `autoFix: false`
- `autoCommit: false`
- `readOnly: true`
