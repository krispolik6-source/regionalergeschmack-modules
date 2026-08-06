# ETAP 45 — Runtime Truth Report

**Data:** 2026-08-06  
**Release Decision:** **CONDITIONAL**

STATIC VERIFIED · 23 test(ów) RUNTIME NOT VERIFIED · brak pełnego sign-off (manual pending).

---

## 1. STATIC VERIFIED

Obszary potwierdzone analizą kodu (struktura · importy · wersje · manifest · SW · konfiguracja).

**115** check(ów) · **0** FAIL

| ID | Obszar | Gate | Plik |
|----|--------|------|------|
| T01-first-launch | Pierwsze uruchomienie | Z2-pwa-lifecycle | `docs\certification\PWA-LIFECYCLE-VERIFICATION.json` |
| T02-relaunch | Ponowne uruchomienie | Z2-pwa-lifecycle | `docs\certification\PWA-LIFECYCLE-VERIFICATION.json` |
| T03-pwa-update | Aktualizacja PWA | Z2-pwa-lifecycle | `docs\certification\PWA-LIFECYCLE-VERIFICATION.json` |
| T04-pwa-install | Instalacja PWA | Z2-pwa-lifecycle | `docs\certification\PWA-LIFECYCLE-VERIFICATION.json` |
| T05-uninstall | Odinstalowanie | Z2-pwa-lifecycle | `docs\certification\PWA-LIFECYCLE-VERIFICATION.json` |
| T06-reinstall | Ponowna instalacja | Z2-pwa-lifecycle | `docs\certification\PWA-LIFECYCLE-VERIFICATION.json` |
| T07-cache-clear | Wyczyszczenie cache | Z2-pwa-lifecycle | `docs\certification\PWA-LIFECYCLE-VERIFICATION.json` |
| T08-site-data-clear | Wyczyszczenie danych strony | Z2-pwa-lifecycle | `docs\certification\PWA-LIFECYCLE-VERIFICATION.json` |
| T09-offline | Tryb offline | Z2-pwa-lifecycle | `docs\certification\PWA-LIFECYCLE-VERIFICATION.json` |
| T10-online-return | Powrót online | Z2-pwa-lifecycle | `docs\certification\PWA-LIFECYCLE-VERIFICATION.json` |
| I01-favicon | Favicon (desktop) | Z3-pwa-icons | `docs\certification\ICONS-VERIFICATION.json` |
| I01-favicon-svg | Favicon SVG (logo-master) | Z3-pwa-icons | `docs\certification\ICONS-VERIFICATION.json` |
| I02-launcher | Launcher PWA (manifest 192/512) | Z3-pwa-icons | `docs\certification\ICONS-VERIFICATION.json` |
| I02-launcher-sw | Launcher — SW precache + network-first | Z3-pwa-icons | `docs\certification\ICONS-VERIFICATION.json` |
| I03-splash-html | Splash screen (HTML) | Z3-pwa-icons | `docs\certification\ICONS-VERIFICATION.json` |
| I03-splash-css | Splash asset (CSS + brand) | Z3-pwa-icons | `docs\certification\ICONS-VERIFICATION.json` |
| I03-splash-sw | Splash — SW precache offline | Z3-pwa-icons | `docs\certification\ICONS-VERIFICATION.json` |
| I04-apple-touch | Apple Touch Icon | Z3-pwa-icons | `docs\certification\ICONS-VERIFICATION.json` |
| I04-apple-manifest | Apple Touch w manifest | Z3-pwa-icons | `docs\certification\ICONS-VERIFICATION.json` |
| I05-maskable | Maskable (192 + 512) | Z3-pwa-icons | `docs\certification\ICONS-VERIFICATION.json` |
| I06-monochrome | Monochrome (adaptive icon) | Z3-pwa-icons | `docs\certification\ICONS-VERIFICATION.json` |
| I07-notifications-push | Push notifications (runtime) | Z3-pwa-icons | `docs\certification\ICONS-VERIFICATION.json` |
| I07-notifications-sw | SW push DEFAULT_ICON | Z3-pwa-icons | `docs\certification\ICONS-VERIFICATION.json` |
| I07-notifications-asset | Notifications brand asset | Z3-pwa-icons | `docs\certification\ICONS-VERIFICATION.json` |
| I08-shortcuts-manifest | Manifest shortcuts (PWA) | Z3-pwa-icons | `docs\certification\ICONS-VERIFICATION.json` |
| I08-shortcuts-launcher-fallback | Skrót na pulpicie (= launcher icon) | Z3-pwa-icons | `docs\certification\ICONS-VERIFICATION.json` |
| S01-version-sync | Jedna wersja PWA (v30) wszędzie | Z3-pwa-icons | `docs\certification\ICONS-VERIFICATION.json` |
| S02-sw-purge | SW activate usuwa stare cache | Z3-pwa-icons | `docs\certification\ICONS-VERIFICATION.json` |
| S03-sw-offline-fallback | Offline fallback tylko wersjonowany URL | Z3-pwa-icons | `docs\certification\ICONS-VERIFICATION.json` |
| S04-memory-cleaner | Memory Cleaner chroni tylko bieżące cache | Z3-pwa-icons | `docs\certification\ICONS-VERIFICATION.json` |
| S05-netlify-headers | HTTP Cache-Control must-revalidate | Z3-pwa-icons | `docs\certification\ICONS-VERIFICATION.json` |
| S06-no-legacy-v1-runtime | Brak rg-runtime-images-v1 w runtime cache paths | Z3-pwa-icons | `docs\certification\ICONS-VERIFICATION.json` |
| SW01-install-handler | install event + waitUntil | Z4-service-worker | `docs\certification\SERVICE-WORKER-VERIFICATION.json` |
| SW01-install-precache | Precache shell (PRECACHE_URLS) | Z4-service-worker | `docs\certification\SERVICE-WORKER-VERIFICATION.json` |
| SW01-install-cache-open | Otwarcie CACHE_VERSION przy install | Z4-service-worker | `docs\certification\SERVICE-WORKER-VERIFICATION.json` |
| SW02-activate-handler | activate event + waitUntil | Z4-service-worker | `docs\certification\SERVICE-WORKER-VERIFICATION.json` |
| SW02-activate-keys | activate czyta caches.keys() | Z4-service-worker | `docs\certification\SERVICE-WORKER-VERIFICATION.json` |
| SW03-skip-waiting | skipWaiting po precache | Z4-service-worker | `docs\certification\SERVICE-WORKER-VERIFICATION.json` |
| SW03-no-client-skip | Klient nie wywołuje skipWaiting (selfHealing) | Z4-service-worker | `docs\certification\SERVICE-WORKER-VERIFICATION.json` |
| SW04-clients-claim | clients.claim po cleanup | Z4-service-worker | `docs\certification\SERVICE-WORKER-VERIFICATION.json` |
| SW05-cleanup-purge | Usuwa stare rg-pwa-* i rg-runtime-images-* | Z4-service-worker | `docs\certification\SERVICE-WORKER-VERIFICATION.json` |
| SW05-cleanup-keep-current | Nie usuwa bieżących cache | Z4-service-worker | `docs\certification\SERVICE-WORKER-VERIFICATION.json` |
| SW05-memory-cleaner-sync | Memory Cleaner — deleteStaleCaches | Z4-service-worker | `docs\certification\SERVICE-WORKER-VERIFICATION.json` |
| SW06-runtime-image-cache | IMAGE_CACHE dla obrazów runtime | Z4-service-worker | `docs\certification\SERVICE-WORKER-VERIFICATION.json` |
| SW06-runtime-code-cache | Runtime cache dla JS/CSS (network-first) | Z4-service-worker | `docs\certification\SERVICE-WORKER-VERIFICATION.json` |
| SW06-runtime-nav-cache | Navigate — aktualizacja index.html w cache | Z4-service-worker | `docs\certification\SERVICE-WORKER-VERIFICATION.json` |
| SW06-safe-cache-put | safeCachePut — tylko 200 basic | Z4-service-worker | `docs\certification\SERVICE-WORKER-VERIFICATION.json` |
| SW07-offline-precache | Precache offline shell | Z4-service-worker | `docs\certification\SERVICE-WORKER-VERIFICATION.json` |
| SW07-offline-navigate-fallback | Navigate offline → index.html | Z4-service-worker | `docs\certification\SERVICE-WORKER-VERIFICATION.json` |
| SW07-offline-code-fallback | JS/CSS offline → caches.match(request) | Z4-service-worker | `docs\certification\SERVICE-WORKER-VERIFICATION.json` |
| SW07-offline-icons | Ikony offline — wersjonowany fallback | Z4-service-worker | `docs\certification\SERVICE-WORKER-VERIFICATION.json` |
| SW07-offline-sync-bridge | Background sync + offline queue flush | Z4-service-worker | `docs\certification\SERVICE-WORKER-VERIFICATION.json` |
| SW08-bridge-import | SW importScripts pwaVersion.global.js | Z4-service-worker | `docs\certification\SERVICE-WORKER-VERIFICATION.json` |
| SW08-version-canonical | PWA_VERSION spójna (module = global = SW bridge) | Z4-service-worker | `docs\certification\SERVICE-WORKER-VERIFICATION.json` |
| SW08-index-register | index.html rejestruje sw.js?v= | Z4-service-worker | `docs\certification\SERVICE-WORKER-VERIFICATION.json` |
| SW08-cache-names | Nazwy cache zsynchronizowane z PWA_VERSION | Z4-service-worker | `docs\certification\SERVICE-WORKER-VERIFICATION.json` |
| SW08-self-healing-version | selfHealing używa pwaAssetUrl | Z4-service-worker | `docs\certification\SERVICE-WORKER-VERIFICATION.json` |
| E01-phone | Telefon — PIN mobile-friendly + fullscreen vault | Z5-dev-panel | `docs\certification\DEV-PANEL-VERIFICATION.json` |
| E02-desktop | Desktop — ten sam panel (bez viewport gate) | Z5-dev-panel | `docs\certification\DEV-PANEL-VERIFICATION.json` |
| E03-pwa | PWA standalone — dev-vault poza INTERNAL_MENU_ACTIONS | Z5-dev-panel | `docs\certification\DEV-PANEL-VERIFICATION.json` |
| E04-lan | LAN — auto-load diagnostyki (192.168.x / 10.x / 172.16–31) | Z5-dev-panel | `docs\certification\DEV-PANEL-VERIFICATION.json` |
| E05-production | Produkcja — shell only do PIN; pełna diag po unlock | Z5-dev-panel | `docs\certification\DEV-PANEL-VERIFICATION.json` |
| E06-menu-always | Menu Deweloper widoczne wszędzie | Z5-dev-panel | `docs\certification\DEV-PANEL-VERIFICATION.json` |
| F01-pin-api | Kanoniczna bramka isDeveloperAccessGranted | Z5-dev-panel | `docs\certification\DEV-PANEL-VERIFICATION.json` |
| F02-pin-gate | Bramka PIN w vault + dispatch unlock | Z5-dev-panel | `docs\certification\DEV-PANEL-VERIFICATION.json` |
| F03-pin-docs | Raporty /docs/ tylko po PIN | Z5-dev-panel | `docs\certification\DEV-PANEL-VERIFICATION.json` |
| F04-error-feed | Feed UI + max 100 + vault gate | Z5-dev-panel | `docs\certification\DEV-PANEL-VERIFICATION.json` |
| F05-error-feed-vault | Przycisk w Dev Vault + Console tile | Z5-dev-panel | `docs\certification\DEV-PANEL-VERIFICATION.json` |
| F06-error-feed-lazy | Lazy init przez orchestrator | Z5-dev-panel | `docs\certification\DEV-PANEL-VERIFICATION.json` |
| F07-guardian-boot | Boot na starcie (wszystkie środowiska) | Z5-dev-panel | `docs\certification\DEV-PANEL-VERIFICATION.json` |
| F08-guardian-collector | Runtime Error Collector z Guardian | Z5-dev-panel | `docs\certification\DEV-PANEL-VERIFICATION.json` |
| F09-guardian-status | Metryka Console w status board | Z5-dev-panel | `docs\certification\DEV-PANEL-VERIFICATION.json` |
| F10-guardian-prod-silent | Produkcja: cisza w konsoli + lokalny raport | Z5-dev-panel | `docs\certification\DEV-PANEL-VERIFICATION.json` |
| F11-bootstrap-profiler | Bootstrap Profiler w app.js | Z5-dev-panel | `docs\certification\DEV-PANEL-VERIFICATION.json` |
| F12-bootstrap-api | Global API __RG_BOOTSTRAP__.report() | Z5-dev-panel | `docs\certification\DEV-PANEL-VERIFICATION.json` |
| F13-bootstrap-orchestrator | Orchestrator mierzy lazy-load | Z5-dev-panel | `docs\certification\DEV-PANEL-VERIFICATION.json` |
| F14-bootstrap-docs | Raport CLI docs/bootstrap/latest | Z5-dev-panel | `docs\certification\DEV-PANEL-VERIFICATION.json` |
| F15-orch-boot | Jeden eager init: initDeveloperVault | Z5-dev-panel | `docs\certification\DEV-PANEL-VERIFICATION.json` |
| F16-orch-lazy | Lazy load 19 modułów | Z5-dev-panel | `docs\certification\DEV-PANEL-VERIFICATION.json` |
| F17-orch-api | Global API __RG_DIAGNOSTICS__ | Z5-dev-panel | `docs\certification\DEV-PANEL-VERIFICATION.json` |

*… i 35 więcej (pełna lista w JSON)*



---

## 2. RUNTIME VERIFIED

Testy rzeczywiście wykonane (przeglądarka · PWA · telefon · SW · storage).

**0** test(ów)

_Brak — wymaga sign-off na urządzeniu._

---

## 3. RUNTIME NOT VERIFIED

Testy wymagające prawdziwego urządzenia / przeglądarki. Status: **NOT VERIFIED** (nigdy PASS).

**23** test(ów)

| ID | Test | Gate | Wymaga |
|----|------|------|--------|
| F19-pin-runtime | Runtime: PIN 1973 na urządzeniu/PWA | Z5-dev-panel | browser, PWA, phone… |
| J11-virtual-user-scenario | Virtual User: home-map-producer + favorites + language + restart | Z6-user-journey | browser, PWA, phone… |
| J12-rus-steps | Real User Simulation: open-app → map → producer → favorites → language | Z6-user-journey | browser, PWA, phone… |
| J13-persist-runtime | Runtime: ulubione + język po reopen (przeglądarka) | Z6-user-journey | browser, PWA, phone… |
| P01-bootstrap | Bootstrap (shell PWA) | Z7-performance | browser, PWA, phone… |
| P02-listeners | Listenery at boot | Z7-performance | browser, PWA, phone… |
| P03-timers | Timery at boot | Z7-performance | browser, PWA, phone… |
| P04-observers | Obserwery at boot | Z7-performance | browser, PWA, phone… |
| P06-render-home | Render Home (wiring) | Z7-performance | browser, PWA, phone… |
| P07-render-map | Render Map (wiring) | Z7-performance | browser, PWA, phone… |
| P08-render-producer | Render Producer (wiring) | Z7-performance | browser, PWA, phone… |
| P09-render-profiler | Health Monitor render sample | Z7-performance | browser, PWA, phone… |
| P10-fps-scroll | FPS podczas przewijania (Virtual User) | Z7-performance | browser, PWA, phone… |
| P11-memory-leak | Pamięć — leak detection (Virtual User) | Z7-performance | browser, PWA, phone… |
| R02-slow-rus | Symulacja RUS/VU: offline + online | Z8-resilience | browser, PWA, phone… |
| 42A-pwa-version | PWA / SW / wersja | ETAP-43 | PWA, Service Worker, Cache Storage… |
| 42B-icons | Ikony launcher / splash | ETAP-43 | PWA, phone, Cache Storage… |
| 42C-dev-panel-phone | Panel deweloperski · PIN | ETAP-43 | phone, PWA, sessionStorage… |
| 42D-prod-boot | Diagnostyka lazy · produkcja | ETAP-43 | PWA, phone… |
| 42E-error-feed-mobile | Runtime Error Feed mobile | ETAP-43 | phone, PWA… |
| 42F-cold-start-feel | Bootstrap · cold start | ETAP-43 | PWA, phone… |
| 43-user-journey | Ścieżka użytkownika | ETAP-43 | browser, PWA, localStorage… |
| 43-map-toolbar | Mapa · toolbar | ETAP-43 | phone, browser… |


---

## 4. FALSE POSITIVE

Testy, które wcześniej mogły zwracać PASS mimo braku rzeczywistej weryfikacji — **naprawione w ETAP 45**.

| Plik | Linia / ID | Przyczyna | Wpływ |
|------|------------|-----------|-------|
| `scripts/etap-43-pwa-lifecycle-verification.mjs` | T05-uninstall | Warunek `|| true` wymuszał PASS bez weryfikacji localStorage | Scenariusz odinstalowania raportowany jako PASS mimo braku dowodu persist/LS |
| `scripts/test-self-reflection.mjs` | T05-uninstall | `|| true` maskowało FAIL | Self-reflection suite fałszywie zielona |
| `scripts/etap-43-final-report.mjs` | cacheFresh() | Cached PASS dla bramek Z2–Z8 przy świeżym cache | Release gate PASS bez live run |
| `scripts/etap-43-final-report.mjs` | verdict override | Static FAIL→PASS override w werdykcie | NIEGOTOWA zamieniana na GOTOWA WARUNKOWO |
| `scripts/etap-43-performance-verification.mjs` | P10–P11 | Grep wiring liczony jako auto PASS (render/FPS) | Wydajność PASS bez pomiaru w przeglądarce |
| `scripts/etap-43-performance-verification.mjs` | P01–P04 | Node bootstrap ms jako RUNTIME PASS | Bootstrap raportowany PASS bez PWA/telefonu |
| `scripts/etap-43-user-journey-verification.mjs` | J11–J13 | Node mock persist / Virtual User jako auto PASS | Pełna ścieżka użytkownika PASS bez przeglądarki |
| `scripts/etap-43-dev-panel-verification.mjs` | E03 / F19 | Logika PIN bez wymogu runtime na urządzeniu | Panel dev PASS bez telefonu/PWA |
| `scripts/etap-43-resilience-verification.mjs` | R02 / R05 | Chaos wiring bez DevTools/telefonu | Odporność PASS bez symulacji offline |
| `scripts/etap-43-icons-verification.mjs` | I08 shortcuts | Brak shortcuts = auto PASS zamiast N/A/runtime | Ikony PASS bez weryfikacji launchera |
| `js/core/offlineSync.js` | caches.open | Hardcoded `rg-runtime-images-v1` | Stary cache ikon po update PWA |
| `sw.js` | CACHE_VERSION | Hardcoded cache name poza pwaVersion.js | Rozjechane wersje cache v28/v29/v30 |
| `scripts/etap-43-*-verification.mjs` | release-candidate nested | Zagnieżdżony RC w Z2/Z4/Z6/Z8 | Flaky chain · fałszywy PASS przy cache RC |

---

## 5. Release Decision

**CONDITIONAL**

STATIC VERIFIED · 23 test(ów) RUNTIME NOT VERIFIED · brak pełnego sign-off (manual pending).

| Sygnał | Wartość |
|--------|---------|
| STATIC VERIFIED | 115 |
| STATIC FAIL | 0 |
| RUNTIME VERIFIED | 0 |
| RUNTIME NOT VERIFIED | 23 |
| Fałszywie pozytywne (naprawione) | 13 |
| Cache artifacts usunięte | 7 |
| Final gate (45-C) | CONDITIONAL |

---

*ETAP 45-E · `npm run check:runtime-truth` · `--fresh` odświeża Z2–Z8*
