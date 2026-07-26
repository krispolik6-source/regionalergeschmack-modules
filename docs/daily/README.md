# Daily Developer Report / Mail

| Etap | Opis |
|------|------|
| **19A** | Agregacja Health / Guardian / Improve / VU / Advisor |
| **28D** | Pełny mail developerski + Emotion · Living Brand · Director · Quality Loop |

## Polityka

- **autoFix: false**
- **Tylko właściciel** — `krispolik6@gmail.com`
- **Nie wysyła** raportów użytkownikom końcowym
- Credentials SMTP **tylko** w lokalnym `.env` (patrz [DEVELOPER-MAIL.md](./DEVELOPER-MAIL.md))
- Na produkcji (`NODE_ENV=production`) — brak wysyłki

## Źródła

| Moduł | Źródło |
|--------|--------|
| Health | `docs/health/` |
| Guardian | `tools/ai-guardian/reports/` |
| Learning | lokalnie (browser) / sygnały Advisor |
| Virtual User | `docs/virtual-user/` |
| Emotion | `docs/emotion/` |
| Living Brand | `docs/living-brand/` |
| Product Director | `docs/product-director/` |
| Quality Loop | `docs/quality-loop/` |

Raport zawiera też: nowe błędy, regresje, proponowane poprawki, ocenę aplikacji, krytyczne problemy, zmiany od wczoraj.

## CLI

```bash
npm run send-report           # agregacja + SMTP (zalecane)
npm run send-report -- --fresh  # Quality Loop + mail
npm run daily-report          # pliki + draft
npm run daily-mail            # alias --send
npm run quality-loop          # diagnostyka → na końcu Daily Mail
```

| | |
|--|--|
| **Temat** | `Raport – Regionaler Geschmack [DATA]` |
| **Nadawca** | `Regionaler Geschmack <raporty@regionalergeschmack.com>` |
| **Odbiorca** | `krispolik6@gmail.com` |
| **20:00** | Task Scheduler / GitHub Action — zob. [DEVELOPER-MAIL.md](./DEVELOPER-MAIL.md) |

## Przeglądarka (dev)

Panel Health → **Daily Report** · `__RG_DAILY__.run()`  
W przeglądarce: tylko przygotowanie (mailto / konsola) — bez SMTP w bundlu.
