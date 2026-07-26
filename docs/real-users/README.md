# Real User Simulation (ETAP 24)

Nie jeden Virtual User — **50 różnych osób**, każda przechodzi całą aplikację.

## Przykłady person

| # | Persona |
|---|---------|
| P01 | 75 lat · nigdy nie używała smartfona |
| P02 | 25 lat · jedzie rowerem |
| P03 | Turystka z Anglii |
| P04 | Mama z dzieckiem |
| P05 | Bardzo słaby internet |
| P06 | Kolorowe motywy wyłączone |
| P07 | Daltonista |
| P08 | Starszy Samsung |
| P09 | iPhone SE |
| P10 | Tablet |
| … | … do **P50** (power user) |

Pełny katalog: `docs/real-users/latest.md` lub `__RG_REAL_USERS__.list()`.

## Journey (każda persona)

`open-app → home → search → map → filters → producer-modal → favorites → cart → profile → premium → language → theme → offline → back-home`

## Polityka

- **autoFix: false**
- Bez zmiany Store / EventBus / API / GPS / Leaflet / routing
- **Opt-in** (nie na produkcji u zwykłych użytkowników)

## Przeglądarka

```text
?realusers=1
```

```js
__RG_REAL_USERS__.run()              // wszystkie 50 (live)
__RG_REAL_USERS__.runOne(7)          // np. daltonista
__RG_REAL_USERS__.heuristic()        // szybka macierz bez UI
__RG_REAL_USERS__.run({ ids: [1,5,9] })
__RG_REAL_USERS__.export()
```

Panel Health (dev) → **Real Users**.

## CLI

```bash
npm run real-users
npm run real-users -- --import=rus-dump.json
npm run check:real-users
```

→ `docs/real-users/latest.md` · `latest.json`
