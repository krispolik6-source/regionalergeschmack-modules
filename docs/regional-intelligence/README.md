# Regional Intelligence (ETAP 29B)

Aplikacja zachowuje się jak **gospodarz regionu** — spokojny, naturalny przewodnik.

## Czym jest

- Uwzględnia pogodę, sezon, dzień tygodnia, porę dnia, lokalizację, historię, godziny otwarcia i dostępność produktów
- **Jedna** krótka rekomendacja na dzień (nagłówek + jedno zdanie wsparcia)
- Spokojny ton, bez pośpiechu

## Czym nie jest

- Nie chatbot
- Nie AI Assistant
- Bez reklam
- Bez sprzedaży
- Nigdy więcej niż jedna główna rekomendacja

## Przykład

> Dzisiaj warto odwiedzić pasiekę.  
> Pogoda sprzyja spacerowi, a świeży miód pojawił się rano.

## CLI

```bash
npm run regional
npm run check:regional
```

## Pliki

| Plik | Opis |
|------|------|
| `docs/regional-intelligence/latest.md` | rekomendacja dnia |
| `js/diagnostics/regionalIntelligenceCore.js` | logika (Node-safe) |
| `js/presentation/regionalIntelligence.js` | warstwa przeglądarki |
| Home greeting | jedna wskazówka gospodarza |
