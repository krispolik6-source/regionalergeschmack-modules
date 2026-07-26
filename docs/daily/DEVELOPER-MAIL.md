# Daily Developer Mail

Codzienny raport e-mail **tylko dla właściciela projektu** — nigdy dla użytkowników końcowych.

| | |
|--|--|
| **Odbiorca** | `krispolik6@gmail.com` |
| **Nadawca (tygodniowy)** | `Regionaler Smak <raporty@regionalergeschmack.com>` |
| **Temat (tygodniowy)** | `Raport tygodniowy – Regionaler Smak [DATA]` |
| **Trigger** | **poniedziałek ~20:00** · `npm run send-report` · `--clean` po wysyłce |

## Format wiadomości

- **Zwykły e-mail** — treść w body (`text/plain`)
- **Bez HTML** · **bez załączników**
- Sekcje tygodniowe: Health Score · Guardian · Taste Diary · Błędy · Poprawki

## Zawartość (raport tygodniowy)

1. **Health Score** — Health overall + ocena aplikacji  
2. **Guardian** — findings  
3. **Taste Diary** — lokalnie w przeglądarce (`rg_taste_diary`; CLI nie czyta wpisów)  
4. **Błędy (Errors)** — krytyczne / failed checks  
5. **Poprawki (Fixes)** — Quality Loop / Improve  

## Czyszczenie po wysyłce (`--clean`)

Po **udanej** wysyłce SMTP usuwa wygenerowane artefakty raportów (`docs/daily`, `docs/health`, …).

**Zachowane zawsze:**

- `docs/instrukcja-instalacji.pdf`
- `downloads/`
- `docs/brand/**` (Brand Lock — Brand Book)

```bash
npm run send-report -- --clean          # clean tylko po udanym SMTP
npm run send-report -- --clean-force    # wymuś clean (test lokalny)
```

## Polityka

- **autoFix: false**
- brak wysyłki do użytkowników
- brak credentials w kodzie / repo
- na produkcji (`NODE_ENV=production` / `RG_PRODUCTION=1`) — brak przygotowania i wysyłki

## Konfiguracja SMTP (bez sekretów w kodzie)

1. Zainstaluj transporter (devDependency):

```bash
npm i nodemailer --save-dev
```

2. Skopiuj `.env.example` → `.env` (`.env` jest w `.gitignore`).

3. Uzupełnij w `.env`:

```env
DEVELOPER_REPORT_EMAIL=krispolik6@gmail.com
DEVELOPER_MAIL_SEND=1

SMTP_HOST=smtp.twoj-hosting.pl
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=raporty@regionalergeschmack.com
SMTP_PASS=********
SMTP_FROM=Regionaler Smak <raporty@regionalergeschmack.com>
```

### Gmail (alternatywa testowa)

Jeśli SMTP domeny nie jest jeszcze gotowy, możesz tymczasowo użyć Gmail + hasła aplikacji — wtedy `SMTP_FROM` musi być zgodny z kontem Gmail (niektóre serwery odrzucają „spoofing” From). Docelowo: skrzynka `raporty@regionalergeschmack.com`.

1. Konto Google → Bezpieczeństwo → weryfikacja 2-etapowa  
2. Hasła aplikacji → „Mail”  
3. `SMTP_HOST=smtp.gmail.com` · `SMTP_USER=…@gmail.com` · `SMTP_PASS=xxxx…`

## Uruchomienie

```bash
# Ręczna wysyłka (zalecane)
npm run send-report

# Świeża diagnostyka (Quality Loop) + mail
npm run send-report -- --fresh

# Alias
npm run daily-mail

# Tylko pliki (bez SMTP)
npm run daily-report
```

Bez skonfigurowanego SMTP skrypt:

- zapisuje `docs/daily/latest.md` + `latest.json`
- zapisuje draft `docs/daily/latest.email.txt`
- **nie pada** — loguje instrukcję (ten plik)

## Harmonogram — poniedziałek 20:00

### Windows (Task Scheduler)

```powershell
schtasks /Create /TN "RG-WeeklyReport" /SC WEEKLY /D MON /ST 20:00 /TR "powershell -NoProfile -Command \"cd 'E:\regionalergeschmack-modules'; npm run send-report -- --fresh --clean\"" /F
```

### GitHub Actions (UTC)

Workflow: `.github/workflows/daily-report.yml` — cron `0 18 * * 1` ≈ **poniedziałek 20:00 CEST**.  
Wymaga Secrets: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.

```bash
npm run send-report -- --fresh --clean
```

## Pliki

| Plik | Opis |
|------|------|
| `docs/daily/latest.md` | raport czytelny |
| `docs/daily/latest.json` | raport maszynowy |
| `docs/daily/latest.email.txt` | draft RFC822 |
| `scripts/lib/developer-smtp.mjs` | helper SMTP (bez sekretów) |
| `scripts/daily-developer-report.mjs` | agregacja + opcjonalna wysyłka |
| `scripts/send-report.mjs` | `npm run send-report` |

## Wyłączenie maila w Quality Loop

```bash
npm run quality-loop -- --skip-mail
```
