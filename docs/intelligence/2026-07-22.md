# Regional Brain — Region Score

**Dzień:** 2026-07-22
**Wygenerowano:** 2026-07-22T19:25:04.931Z
**Etap:** 33A
**Powód:** dry-run

## Polityka

- **autoApply:** false
- **autoFix:** false
- Bez chatbota · bez UI · bez popupów · bez zmian aplikacji

## Region Score

# **82 / 100**

**Werdykt:** strong

## Sygnały dnia

| Sygnał | Wartość |
|--------|---------|
| Pora dnia | evening |
| Dzień tygodnia | wednesday (3) |
| Sezon | summer |
| Pogoda | warm  |
| Lokalizacja | nie |
| GPS | nie |
| Otwarte (farmers / total) | 2 / 4 |
| Historia lokalna (count) | — |
| Tip regionalny | eveningHof |
| Health Monitor | 96 |
| Brand Protection | WARNING |
| Product Brain | 91 |
| Self Reflection | 92 (return 80) |

## Wymiary (score × waga)

| Wymiar | Score | Waga | Notatka |
|--------|------:|-----:|---------|
| dayPart | 84 | 0.06 | pora dnia: evening |
| weekday | 76 | 0.05 | dzień: wednesday |
| season | 90 | 0.08 | sezon: summer |
| weather | 90 | 0.08 | pogoda: warm |
| location | 62 | 0.08 | brak lokalizacji użytkownika (CLI/proxy) |
| openFarms | 95 | 0.1 | otwarte gospodarstwa/sklepy: farmers=2, total≈4 |
| placeHistory | 58 | 0.07 | historia lokalna: brak snapshotu |
| gps | 60 | 0.07 | GPS niedostępny w tym przebiegu |
| healthMonitor | 96 | 0.12 | Health overall 96 |
| brandProtection | 74 | 0.09 | Brand Protection WARNING (fail=0, warn=7) |
| productBrain | 91 | 0.1 | Product Brain 91 |
| selfReflection | 92 | 0.1 | Self Reflection 92 |

## Źródła

- `health`
- `healthMonitor`
- `brandProtection`
- `productBrain`
- `selfReflection`
- `regionalIntelligence`
- `emotion`
- `livingBrand`

## Notatki

- Brak chatbota, UI, popupów i zmian w aplikacji.
- Region Score = ważona synteza sygnałów dnia + diagnostyk.
- autoApply=false · autoFix=false
