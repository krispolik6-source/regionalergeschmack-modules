# Bootstrap — Before / After (ETAP 42F)

**Data:** 2026-08-06T21:30:34.420Z  
**Status:** pending_acceptance · autoApply=false

## Podsumowanie

| Metryka | Before | After | Δ |
|---------|--------|-------|---|
| Czas bootstrap (ms) | 428.6 | 49.6 | −379 ms (-88.4%) |
| Inicjalizacje (diag+eager app) | 40 | 22 | −18 diagnostycznych eager |
| Listenery (diag @ boot) | 52 | 31 | −21 odłożone |
| Timery (diag @ boot) | 39 | 0 | −39 odłożone |
| Fetch hooks/wywołania (diag) | 5 | 3 | |
| Observery (diag @ boot) | 3 | 0 | −3 odłożone |
| Globalne hooki (diag @ boot) | 25 | 14 | |
| Bajty modułów diag @ boot | 343 KB | 80 KB shell | −263 KB |
| Legacy bundle | — | 4589 KB | |

## Before — eager diagnostyka (pre-42D)

- **18×** `init*` diagnostycznych w `app.js` przy starcie
- Moduły: Health Monitor, Self-Healing, UI/Map Guardian, Memory Cleaner, Health Dev Panel, Learning, Improvement, Virtual/Real User, Emotion AI, Living Brand, Product Director, Project Advisor, Daily Report, Dev Dashboard, Weekly Premium, Self-Healing Logger
- Szacowane listenery @ boot: **52**
- Szacowane timery @ boot: **39** (UI/Map Guardian intervaly)
- Observery @ boot: **3** (Health Monitor PerformanceObserver)
- Globalne hooki: **25** (fetch patch ×2, EventTarget patch, console capture)

## After — lazy orchestrator (42D–E)

- **1×** eager: `initDeveloperVault` (shell PIN)
- **19×** lazy po odblokowaniu / `?dev=1` / LAN
- Pre-boot: `installProductionConsole` + `initConsoleGuardian` + `initRuntimeErrorCollector`
- App bootstrap: **24** rejestrowanych init (profiler)
- Shell diag: **80 KB** vs **343 KB** przed

### Inicjalizacje produktowe (After, `bootstrap()`)

- `initShellSettings`
- `initHeaderShell`
- `initAiTranslationEngine`
- `initLivingRegion`
- `initSeasonTheme`
- `initClimateAtmosphere`
- `initSideMenu`
- `initToast`
- `initAuth`
- `initLoginModal`
- `initRegisterModal`
- `initNavigation`
- `initLegalFooter`
- `initCookieBanner`
- `initTrialSync`
- `initPushNotifications`
- `initOfflineSync`
- `initPwaInstall`
- `initAnalytics`
- `initAdSense`
- `initDiagnosticsOrchestrator`

## Lazy load (tylko po PIN / dev)

Po `ensureDiagnosticsLoaded()`: **19** modułów · szac. **360 KB** kodu.

Pomiar lazy: odblokuj Vault lub `?dev=1` — zapis w `localStorage.rg_bootstrap_profile_v1`.

## Runtime — jak zmierzyć

1. Otwórz PWA (produkcja lub localhost)
2. W konsoli (dev) lub po PIN: `__RG_BOOTSTRAP__.report()`
3. Skopiuj JSON do `docs/bootstrap/runtime-snapshot.json`
4. Uruchom ponownie: `npm run bootstrap-audit`

## Wnioski

- Produkcja **nie płaci** za 18 diagnostycznych init + intervaly + Health Monitor observer przy starcie.
- Koszt boot: shell Vault + Console/Error Collector (minimalny fetch patch).
- Pełna diagnostyka: **on-demand** — Vault PIN lub `?dev=1`.

---
*Tylko odczyt · raport właściciela · bez autoApply*
