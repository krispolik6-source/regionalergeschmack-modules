# AI Dream Mode (ETAP 29A)

Codzienna refleksja **Product Owner** na koniec dnia diagnostyki.

## Czym jest

- Analiza Health · Guardian · Learning · Improvement · Virtual User · Emotion · Living Brand · Product Director · Real Users
- Odpowiedzi na pytania produktowe (najlepsze / najgorsze / uproszczenia / powroty / klimat / top 3…)
- **dream-score 0–100**

## Czym nie jest

- Nie chatbot
- Nie odpowiada użytkownikowi końcowemu
- **Nie zmienia kodu** (`autoApply: false`)

## CLI

```bash
npm run dream
npm run dream -- --dry-run
npm run check:dream
```

Po `npm run quality-loop` Dream Mode odpala się automatycznie (opcjonalnie `--skip-dream`).

## Pliki

| Plik | Opis |
|------|------|
| `docs/dream/latest.md` | raport czytelny |
| `docs/dream/latest.json` | raport maszynowy |
| `js/diagnostics/dreamModeCore.js` | logika (bez side-effects) |
