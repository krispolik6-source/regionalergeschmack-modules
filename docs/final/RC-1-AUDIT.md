# Release Candidate Audit (RC-1)

**Data:** 2026-08-03T19:10:26Z  
## Ocena gotowości

# ★★★★☆ Ready with minor improvements

> Lighthouse + live browser QA + category image assets wymagają manualnego kroku przed ★★★★★

## Metryki

| Metryka | Wartość |
|---------|---------|
| Core audyty | 18/18 |
| Release Candidate | 22/22 |
| Tłumaczenia | 36×1313 |
| Test suite | 104 test-*.mjs — uruchom: node scripts/test-*.mjs (92/104 pass po aktualizacji testów) |

## Wykonane poprawki (RC-1)

- js/core/pwaInstall.js — aria-label dismiss banner (DE fallback)
- scripts/test-menu-icons-utf8.mjs — sun toggle + modal 200px
- scripts/test-producer-highlight.mjs — activateProfileHighlight (nie PayPal string)

## Core audyty

| Audyt | Status |
|-------|--------|
| release-candidate | ✅ ✅ child-device-lab — [Device Lab] PASS · 62/62 checks · 63 cells | Wrote: docs\audit\ETAP-37-DEVICE-LAB.md | Wrote: docs\final\RELEASE-CANDIDATE.md |
| full-audit | ✅  | Audyt statyczny: PASS |
| predeploy | ✅ --- Podsumowanie --- | OK: 5 | Błędy: 0 |
| translations | ✅  | ✅ Wszystkie języki mają wymagane klucze testowe. |
| pwa | ✅ --- PWA test --- | OK |
| splash | ✅ --- Splash screen test --- | OK |
| brand-protection | ✅  Policy: autoApply=false · nie zmienia kodu | ══════════════════════════════════════════ |
| visual-brand | ✅ ✓ App Store assets | Wrote: docs\brand\VISUAL-BRAND-VERIFICATION.md |
| device-lab | ✅ [Device Lab] PASS · 62/62 checks · 63 cells | Wrote: docs\audit\ETAP-37-DEVICE-LAB.md |
| popup-lifecycle | ✅  | Audyt popup lifecycle: OK |
| map-toolbar | ✅  | Wynik: 20 OK, 0 FAIL |
| draggable-popup | ✅  | Wynik: 43 OK, 0 FAIL |
| auth | ✅ --- Auth test --- | OK: 15 | Błędy: 0 |
| memory-cleaner | ✅  | Memory Cleaner smoke OK |
| ui-guardian | ✅  | UI Guardian smoke OK |
| browser-audit | ✅ --- Symulacja przeglądarki --- | OK: 17 | Błędy: 0 |
| landing | ✅ --- Landing test --- | OK |
| prepublish-polish | ✅  | Prepublish polish smoke OK |

## Tłumaczenia PL / DE / EN (spot)

- PL: ✅ `Wyróżnij profil`
- DE: ✅ `Profil hervorheben`
- EN: ✅ `Highlight profile`

## Bezpieczeństwo (statyczny)

- ✅ csp
- ✅ swCacheVersion
- ✅ skipWaiting
- ✅ noEval

## Znalezione problemy

- **[medium]** assets — Brak category_*.webp w repo — wymaga npm run process-images przed deployem
- **[low]** tests — 12 test-*.mjs fail (stale asercje / brak DOM mock / brak assetów lokalnie)
- **[low]** lighthouse — Lighthouse nie uruchomiony w CI — manual Chrome DevTools
- **[low]** i18n — Cookie banner tylko DE w HTML (bez kluczy 36 języków)
- **[low]** memory — Mapa bez destroyMap() — akceptowane dla SPA reuse Leaflet

## Rekomendacje przed publikacją

1. npm run process-images przed publikacją (category + product WebP)
1. Lighthouse Mobile na index.html + landing.html
1. Cold start PWA: Android / iOS / Samsung Internet
1. npm start → ?realusers=1 — live journey smoke
1. Po deploy: zweryfikuj category cards mają tła zdjęć

## Świadomie nie zmieniono

- Architektura Store/EventBus/API/GPS/Leaflet/routing
- Wygląd marki (Brand Lock)
- Logika biznesowa highlight producenta (activateProfileHighlight)
- console.log [Map] — tłumione na produkcji przez installProductionConsole

---

*RC-1 · ★★★★☆ Ready with minor improvements*
