# ETAP 40 — Console Guardian

**Werdykt:** PASS  
**Data:** 2026-08-04

## Produkcja

- **0 warningów** w konsoli
- **0 błędów** w konsoli
- Wyjątki / warn / error → **lokalny raport** (`localStorage`: `rg_console_guardian_v1`)
- **Bez wysyłania do Internetu**

## Pola raportu

| Pole | Opis |
|------|------|
| message | treść |
| stack | stack trace |
| device | UA, screen, viewport, memory… |
| browser | Chrome / Safari / … |
| pwaVersion | z `?v=` / SW |
| lastAction | ostatni click / navigate |
| transport | `local-only` |

## API

```js
__RG_CONSOLE_GUARDIAN__.reports()
__RG_CONSOLE_GUARDIAN__.clear()
__RG_CONSOLE_GUARDIAN__.lastAction()
__RG_CONSOLE_GUARDIAN__.capture('msg', error)
```

## Pliki

- `js/diagnostics/consoleGuardian.js`
- `js/core/logger.js` (hook + cisza produkcji)
- `js/app.js` — `initConsoleGuardian()` po loggerze
