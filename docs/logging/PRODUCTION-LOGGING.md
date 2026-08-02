# PRODUCTION LOGGING — ETAP 31A

Wygenerowano: 2026-08-01T05:05:16.042Z

## Cel

Przygotowanie konsoli do wersji produkcyjnej: cisza diagnostyczna, pełne logi tylko na localhost.

## Poziomy

| Poziom | Wartość | Produkcja | Localhost |
|--------|--------:|:---------:|:---------:|
| DEBUG | 10 | ukryty | ✔ |
| INFO | 20 | ukryty | ✔ |
| WARN | 30 | cisza (ETAP 40 → lokalny raport) | ✔ |
| ERROR | 40 | cisza (ETAP 40 → lokalny raport) | ✔ |
| FATAL | 50 | cisza (ETAP 40 → lokalny raport) | ✔ |

## Sterowanie

- **DEV** (localhost / 127.0.0.1 / file:) → domyślnie **DEBUG**
- **PRODUCTION** (Netlify / regionalergeschmack*) → **cisza konsoli** (ETAP 40)
- Localhost override: `?log=INFO` lub `localStorage.rg_log_level` · `__RG_LOG__.setMinLevel('WARN')`
- Raporty wyjątków: `__RG_CONSOLE_GUARDIAN__.reports()` · **bez sieci**

## ETAP 40 — Console Guardian

Na produkcji **0 warn / 0 error** w DevTools.  
Każdy wyjątek / warn / error → `localStorage` (`rg_console_guardian_v1`) ze stackiem, urządzeniem, przeglądarką, wersją PWA i ostatnią akcją.

## Implementacja

| Plik | Rola |
|------|------|
| `js/core/logger.js` | poziomy, filtr, `installProductionConsole()` |
| `js/app.js` | instalacja na starcie (przed diagnostykami) |

## Polityka

- **Nie zmienia architektury** (Store / EventBus / API / GPS / Leaflet / routing)
- **Nie zmienia funkcjonalności** produktu
- autoApply: false

## Smoke

`npm run check:logging` — PASS
