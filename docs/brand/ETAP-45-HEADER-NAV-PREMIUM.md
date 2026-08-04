# ETAP – Final Premium UI Polish (Header + Bottom Navigation)

Wygenerowano: 2026-08-04T18:19:43.506Z

**Werdykt:** ✅ PASS · 64/64

## Cel

Wyłącznie poprawki wizualne (CSS + minimalny HTML). Rynek DE — spokojny, elegancki, czytelny chrome.

## Bez zmian

- logika aplikacji
- EventBus
- Store
- GPS
- Leaflet
- popupów
- mapy
- routing
- danych
- tłumaczeń
- architektury
- Brand Book

## Kanoniczne źródła (bez warstwy audit)

- `css/premium-header.css`
- `css/theme-toggle-premium.css`
- `css/home-v1.css`
- `css/map-premium.css`

## Zakres

- Header Premium (logo, tytuł, odstępy, oś, przyciski 44px)
- Przełącznik dzień/noc (okrągła ikona, odstęp od języka)
- Bottom Navigation (biała aktywna pigułka, bez zielonego kwadratu)
- Podpisy nav (wyśrodkowanie, line-height, bez obcinania liter)
- Dark Mode · Responsive 320–768 (375 · 480 · 600)
- Animacje: fade · hover lift · active scale (bez bounce/pulse/floating)
- Brand Book: kolory · tokeny · fonty · radius · cieni · dark mode — bez zmian

## Checklist

- ✓ no-overlay-layer — brak osobnej warstwy etap-45 w brand-colors-cleanup
- ✓ release-ready-no-nav-override — release-ready-audit nie nadpisuje bottom nav (źródło: home-v1.css)
- ✓ header-gradient — header gradient Brand Book
- ✓ header-logo-token — większe logo (--ph-logo ≥48px)
- ✓ header-title-token — większy tytuł Literata (DE premium)
- ✓ header-spacing-system — jednolity spacing Home Premium + grupa marki
- ✓ header-menu-gap — odstęp Menu ↔ marka (token --ph-gap-chrome)
- ✓ header-touch-44 — header touch ≥44px
- ✓ header-hover-lift — header hover lift Home Premium
- ✓ header-active-tap — header active tap
- ✓ header-focus-gold — focus złoty
- ✓ header-lang-de — język DE-first: „Deutsch”, wyśrodkowany, wrap bez nachodzenia na toggle
- ✓ header-lang-wrap-reserve — rezerwa miejsca na Premium + toggle
- ✓ header-lang-centered — flaga + etykieta wyśrodkowane w przycisku
- ✓ header-axis — wyrównanie do jednej osi
- ✓ theme-toggle-file — css/theme-toggle-premium.css istnieje
- ✓ theme-toggle-circle — okrągła ikona 🌞/🌙
- ✓ theme-toggle-44 — hit area 44×44 px
- ✓ html-header-brand — HTML: .header-brand grupuje logo + tytuł
- ✓ theme-toggle-gap-lang — odstęp 8–12 px od języka · toggle nie kurczy się
- ✓ theme-toggle-no-overlap — header-right nie ściska toggle vs język
- ✓ theme-toggle-emoji — emoji z DOM (bez maski SVG)
- ✓ theme-toggle-no-header-icon — HTML: toggle bez klasy header-icon (minimalny HTML)
- ✓ nav-home-surface — nav powierzchnia Home Premium
- ✓ nav-icon-before — ikona w pigułce (::before)
- ✓ nav-active-no-green-square — aktywna: kremowa pigułka + delikatna ramka (bez ciemnozielonego kwadratu)
- ✓ nav-no-style-double-layer — style.css nie nakłada drugiej warstwy na aktywną ikonę
- ✓ nav-inactive-no-pill — nieaktywne: bez pigułki (tylko aktywna zakładka)
- ✓ nav-touch-44 — nav touch 44×44 WCAG
- ✓ nav-touch-no-40-override — production-polish nie obniża touch nav poniżej 44px
- ✓ nav-label-center — podpisy wyśrodkowane pod ikoną (grid)
- ✓ nav-label-line-height — line-height 1.45 — bez obcinania g/j/y/p/q
- ✓ nav-label-no-tight-lh — brak ciasnego line-height na etykietach nav
- ✓ nav-label-slot — stała wysokość rzędu etykiet
- ✓ nav-chrome-height — stała wysokość paska nav
- ✓ nav-source-sans — etykiety Source Sans 3
- ✓ nav-dark — dark mode nav
- ✓ home-v1-canonical — home-v1 wzorzec bottom nav
- ✓ bp-header-nav-320 — viewport 320px — header + bottom nav (premium-header + home-v1)
- ✓ bp-header-nav-360 — viewport 360px — header + bottom nav (premium-header + home-v1)
- ✓ bp-header-nav-375 — viewport 375px — header + bottom nav (premium-header + home-v1)
- ✓ bp-header-nav-390 — viewport 390px — header + bottom nav (premium-header + home-v1)
- ✓ bp-header-nav-412 — viewport 412px — header + bottom nav (premium-header + home-v1)
- ✓ bp-header-nav-430 — viewport 430px — header + bottom nav (premium-header + home-v1)
- ✓ bp-header-nav-480 — viewport 480px — header + bottom nav (premium-header + home-v1)
- ✓ bp-header-nav-600 — viewport 600px — header + bottom nav (premium-header + home-v1)
- ✓ bp-header-nav-768 — viewport 768px — header + bottom nav (premium-header + home-v1)
- ✓ responsive-nav-section — home-v1: sekcja responsive nav ze wszystkimi viewportami
- ✓ responsive-header-480-600 — premium-header: breakpointy 480 · 600
- ✓ reduced-motion — reduced motion
- ✓ motion-header-hover-lift — header: hover lift −2px
- ✓ motion-header-active-scale — header: active scale 0.985
- ✓ motion-nav-active-scale — bottom nav: active scale
- ✓ motion-nav-no-hover-lift — bottom nav: bez hover lift (tylko kolor + fade pigułki)
- ✓ motion-no-bounce-pulse-float — chrome: brak bounce · pulse · floating (tylko fade · lift · scale)
- ✓ motion-header-animation-none — header przyciski: animation none (tylko transition)
- ✓ motion-nav-fade-before — nav aktywna pigułka: fade przez opacity ::before
- ✓ brand-fonts-chrome — fonty chrome: Literata + Source Sans 3 · bez Inter/Roboto
- ✓ brand-colors-chrome — kolory chrome zgodne z paletą Brand Book
- ✓ brand-no-cold-blue — brak zimnego niebieskiego w chrome
- ✓ brand-radius-shadow-tokens — radius i cienie header — istniejące tokeny --ph-* (bez nowej palety)
- ✓ brand-dark-mode-chrome — dark mode chrome — istniejące reguły (bez zmiany tokenów marki)
- ✓ brand-no-chrome-token-drift — chrome nie nadpisuje globalnych tokenów --brand-*
- ✓ map-z-index — mapa: warstwy chrome (map-premium.css)
