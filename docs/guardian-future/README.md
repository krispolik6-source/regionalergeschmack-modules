# Guardian of the Future (ETAP 30)

Strażnik jakości, który **przewiduje problemy zanim się pojawią**.

## Czym jest

Analizuje trendy z raportów (Health, Emotion, Living Brand, Brand Protection, Improvement, Guardian, Self Reflection…) i ostrzega z wyprzedzeniem, np.:

> Jeśli utrzymamy obecny kierunek zmian, za miesiąc Home stanie się zbyt ciężki.

> Po ostatnich aktualizacjach rośnie liczba poważnych znalezisk / złożoność pending.

## Czym nie jest

- Nie hotfixuje kodu
- Nie wdraża zmian (`autoApply: false`)
- Nie zastępuje AI Guardiána „na dziś” — uzupełnia go o **horyzont 1–4 tygodnie**

## Status

| Status | Znaczenie |
|--------|-----------|
| **CLEAR** | Trendy stabilne |
| **WATCH** | Wczesne ostrzeżenia — planuj ostrożnie |
| **ALERT** | Silny negatywny trend — zmień kierunek |

## CLI

```bash
npm run future
npm run check:future
```

Historia metryk: `docs/guardian-future/history.json` (append-only, buduje pamięć trendów).

## Pliki

| Plik | Opis |
|------|------|
| `docs/guardian-future/latest.md` | prognozy dnia |
| `js/diagnostics/guardianOfTheFutureCore.js` | regresja + prognozy |
