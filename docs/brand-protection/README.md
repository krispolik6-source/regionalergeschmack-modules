# Brand Protection AI (ETAP 29C)

**Brand Book** (`docs/brand/BRAND-BOOK.md`) jest najwyższym autorytetem.

## Czym jest

Automatyczne porównanie zmian / stanu produktu z Brand Book:

- HTML · CSS · SVG · PNG · Manifest · PWA
- logo · kolory · fonty · ikony · cienie · fotografie · odstępy · radius · gradienty · animacje

## Czym nie jest

- **Nie poprawia kodu** (`autoApply: false`, `autoFix: false`)
- Przy naruszeniu: **tylko ostrzeżenie w raporcie**

## Status

| Status | Znaczenie |
|--------|-----------|
| **PASS** | Brak naruszeń |
| **WARNING** | Dryf / heurystyka — wymaga przeglądu |
| **FAIL** | Naruszenie Brand Book |

## CLI

```bash
npm run brand-protection
npm run brand-protection -- --strict   # exit 1 przy FAIL
npm run check:brand-protection
```

## Raporty

| Plik | Opis |
|------|------|
| `docs/brand-protection/latest.md` | raport ETAP 29C |
| `docs/brand/BRAND-PROTECTION.md` | ten sam raport (kompatybilność) |
