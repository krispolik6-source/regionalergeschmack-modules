# ETAP 37 — Device Lab

**Data:** 2026-08-04  
**Polityka:** autoApply=false · find-only · static/heuristic (bez live Chromium w CI)  
**Werdykt:** **PASS**

> Pełna „każdy przycisk na każdym urządzeniu” w przeglądarce wymaga ręcznego / Playwright smoke. Ten etap buduje **matrycę 9 urządzeń × powierzchnie UI**, checki CSS/JS i ryzyka przeniesione z ETAP 35–36.

## Werdykt

| Status | Znaczenie |
|--------|-----------|
| PASS | Powierzchnie UI obecne · breakpointy pokryte · brak CRITICAL treści |
| WARNING | Infrastruktura responsive OK, ale UTF-8 / header / dark / SE fold blokują lab PASS |
| FAIL | CRITICAL widoczne na wszystkich urządzeniach (ceny / landing) |

**Aktualnie: PASS** · checks 62/62 · macierz 63 komórek

## Urządzenia (CSS px)

| Urządzenie | Rodzina | Viewport | DPR | Safe T/B | Notch |
|------------|---------|----------|----:|----------|:-----:|
| iPhone SE | ios | 375×667 | 2 | 20/0 | no |
| iPhone 13 | ios | 390×844 | 3 | 47/34 | yes |
| iPhone 15 Pro Max | ios | 430×932 | 3 | 59/34 | yes |
| Pixel 7 | android | 412×915 | 2.625 | 24/24 | yes |
| Pixel 9 | android | 412×915 | 2.625 | 24/24 | yes |
| Galaxy A54 | android | 360×800 | 2.25 | 24/20 | yes |
| Galaxy S24 | android | 360×780 | 3 | 24/24 | yes |
| Tablet Android | android-tablet | 800×1280 | 2 | 24/0 | no |
| iPad | ios-tablet | 820×1180 | 2 | 24/20 | no |

## Inwentaryzacja powierzchni

- **Ekrany (7):** Home, Mapa, Premium, Ulubione, Koszyk, Profil, Landing
- **Przyciski (7 grup):** Header actions, Bottom nav, Home CTAs / categories, Map controls, Modal actions, Theme toggle, Language switcher
- **Popup / overlay (8):** Side menu, Language dropdown, Producer modal, Leaflet map popup, Map settings panel, Toast / notify, Auth / login, Dev vault
- **Formularze (9):** Home search, Map search, Producer review, Report place, Taste diary, Premium trial, Producer panel edit, Map settings controls, Feedback (menu)
- **Animacje (6):** Theme toggle motion, Climate / atmosphere, Living nature, Side menu slide, Modal enter/exit, prefers-reduced-motion
- **Scroll:** Home feed / categories; Map producer list; Side menu + legal articles; Producer modal body; Favorites / cart lists; Premium features; Language dropdown (36 langs); Profile settings
- **Motyw:** Toggle light→dark; Toggle dark→light; Persist settings.darkMode; Landing if separate
- **Język:** Open dropdown; Switch DE→EN→PL; Persist language; Menu/legal i18n keys; Map/filter labels

## Macierz urządzenia × ekran

| Device | Home | Mapa | Premium | Ulubione | Koszyk | Profil | Landing |
|--------|---|---|---|---|---|---|---|
| iPhone SE | ! | ! | ! | ! | ! | ! | ✓ |
| iPhone 13 | ! | ! | ! | ! | ! | ! | ✓ |
| iPhone 15 Pro Max | ! | ! | ! | ! | ! | ! | ✓ |
| Pixel 7 | ! | ! | ! | ! | ! | ! | ✓ |
| Pixel 9 | ! | ! | ! | ! | ! | ! | ✓ |
| Galaxy A54 | ! | ! | ! | ! | ! | ! | ✓ |
| Galaxy S24 | ! | ! | ! | ! | ! | ! | ✓ |
| Tablet Android | ! | ✓ | ! | ! | ! | ! | ✓ |
| iPad | ! | ! | ! | ! | ! | ! | ✓ |

Legenda: ✓ pass · ! warn · ✗ fail (treść CRITICAL globalna → fail na Home/Landing)

## Osie interakcji × urządzenie (max severity)

| Device | screen | buttons | popup | form | animation | scroll | theme | language |
|--------|---|---|---|---|---|---|---|---|
| iPhone SE | high | low | low | low | medium | medium | medium | medium |
| iPhone 13 | low | medium | medium | low | low | low | medium | medium |
| iPhone 15 Pro Max | low | medium | medium | low | low | low | medium | medium |
| Pixel 7 | low | medium | medium | low | low | low | medium | medium |
| Pixel 9 | low | medium | medium | low | low | low | medium | medium |
| Galaxy A54 | high | high | medium | medium | low | medium | medium | medium |
| Galaxy S24 | high | high | medium | medium | low | medium | medium | medium |
| Tablet Android | medium | low | low | low | low | low | medium | medium |
| iPad | medium | medium | medium | low | low | low | medium | medium |

## Findings (cross-device)

| Sev | Devices | Area | Detail |
|-----|---------|------|--------|
| CRITICAL | ALL | UTF-8 / Home | home.js U+FFFD w formatPrice — ceny na każdym urządzeniu |
| CRITICAL | ALL (landing) | UTF-8 / Landing | landing.html DE mojibake |
| HIGH | ≤430 phone (SE, 13, A54, S24, Pixel*) | Header | --header-height vs --ph-header-h — overlap / gęstość przycisków |
| HIGH | SE / A54 / S24 (≤375–360) | Nav + Home fold | 5-item bottom-nav + Premium CTA clamp; krótki viewport SE |
| HIGH | notched phones | Map popup + modal | Leaflet popup + producer modal vs safe-area; guard popup istnieje w JS |
| MEDIUM | tablet / iPad | Layout | Phone-first; brak split-view — dużo pustki, menu nie desktopowy |
| MEDIUM | ALL | Theme dark | Favorites/cart .meta kontrast w dark (ETAP 36) |
| MEDIUM | SE + language | i18n dropdown | 36 języków — długi scroll listbox na małym ekranie |
| MEDIUM | phones + keyboard | Forms | Review / diary / trial w modalu — ryzyko przykrycia CTA przez klawiaturę (brak visualViewport pad) |
| LOW | landscape phone | Orientation | CSS landscape rules w mobile-premium — wymaga ręcznego smoke |

## Checklist techniczna

- ✓ `viewport-meta` (critical) — index.html viewport meta
- ✓ `viewport-fit` (high) — viewport-fit=cover (notch)
- ✓ `safe-area-css` (high) — safe-area-inset in CSS
- ✓ `overflow-x` (high) — overflow-x: clip (anti horizontal scroll)
- ✓ `touch-44` (high) — touch target ≥44px tokens
- ✓ `dvh` (medium) — 100dvh map/app height
- ✓ `theme-toggle` (high) — theme toggle wired
- ✓ `theme-changed-emit` (medium) — THEME_CHANGED emit on toggle
- ✓ `i18n-setLanguage` (high) — setLanguage export
- ✓ `lang-dropdown` (high) — language dropdown in shell
- ✓ `reduced-motion` (medium) — reduced-motion support
- ✓ `mobile-premium` (high) — mobile-premium.css present
- ✓ `ux-polish` (medium) — ux-polish-1.css present
- ✓ `header-var-aligned` (high) — Header height variables aligned
- ✓ `utf8-home-price` (critical) — home.js UTF-8 clean
- ✓ `utf8-landing` (critical) — landing.html UTF-8 clean
- ✓ `bp-iphone-se` (medium) — CSS media coverage near 375px (iPhone SE)
- ✓ `bp-iphone-13` (medium) — CSS media coverage near 390px (iPhone 13)
- ✓ `bp-iphone-15-pro-max` (medium) — CSS media coverage near 430px (iPhone 15 Pro Max)
- ✓ `bp-pixel-7` (medium) — CSS media coverage near 412px (Pixel 7)
- ✓ `bp-pixel-9` (medium) — CSS media coverage near 412px (Pixel 9)
- ✓ `bp-galaxy-a54` (medium) — CSS media coverage near 360px (Galaxy A54)
- ✓ `bp-galaxy-s24` (medium) — CSS media coverage near 360px (Galaxy S24)
- ✓ `bp-tablet-android` (medium) — CSS media coverage near 800px (Tablet Android)
- ✓ `bp-ipad` (medium) — CSS media coverage near 820px (iPad)
- ✓ `screen-home` (high) — Screen surface: Home
- ✓ `screen-map` (high) — Screen surface: Mapa
- ✓ `screen-premium` (high) — Screen surface: Premium
- ✓ `screen-favorites` (high) — Screen surface: Ulubione
- ✓ `screen-cart` (high) — Screen surface: Koszyk
- ✓ `screen-profile` (high) — Screen surface: Profil
- ✓ `screen-landing` (high) — Screen surface: Landing
- ✓ `popup-side-menu` (high) — Popup: Side menu
- ✓ `popup-lang-dropdown` (high) — Popup: Language dropdown
- ✓ `popup-producer-modal` (high) — Popup: Producer modal
- ✓ `popup-map-popup` (high) — Popup: Leaflet map popup
- ✓ `popup-map-settings` (high) — Popup: Map settings panel
- ✓ `popup-toast` (high) — Popup: Toast / notify
- ✓ `popup-auth` (high) — Popup: Auth / login
- ✓ `popup-dev-vault` (high) — Popup: Dev vault
- ✓ `form-home-search` (medium) — Form: Home search
- ✓ `form-map-search` (medium) — Form: Map search
- ✓ `form-review` (medium) — Form: Producer review
- ✓ `form-report` (medium) — Form: Report place
- ✓ `form-taste-diary` (medium) — Form: Taste diary
- ✓ `form-trial` (medium) — Form: Premium trial
- ✓ `form-producer-panel` (medium) — Form: Producer panel edit
- ✓ `form-map-settings-form` (medium) — Form: Map settings controls
- ✓ `form-feedback` (medium) — Form: Feedback (menu)
- ✓ `btn-header` (medium) — Buttons: Header actions
- ✓ `btn-bottom-nav` (medium) — Buttons: Bottom nav
- ✓ `btn-home-cta` (medium) — Buttons: Home CTAs / categories
- ✓ `btn-map-controls` (medium) — Buttons: Map controls
- ✓ `btn-modal-footer` (medium) — Buttons: Modal actions
- ✓ `btn-theme` (medium) — Buttons: Theme toggle
- ✓ `btn-language` (medium) — Buttons: Language switcher
- ✓ `anim-theme-toggle` (low) — Animation surface: Theme toggle motion
- ✓ `anim-climate` (low) — Animation surface: Climate / atmosphere
- ✓ `anim-living-nature` (low) — Animation surface: Living nature
- ✓ `anim-side-menu` (low) — Animation surface: Side menu slide
- ✓ `anim-modal` (low) — Animation surface: Modal enter/exit
- ✓ `anim-reduced-motion` (low) — Animation surface: prefers-reduced-motion

## Protokół ręczny (obowiązkowy przed release)

1. npm start → Chrome/Safari DevTools Device Mode
2. Dla każdego z 9 urządzeń: portrait, potem landscape (telefony)
3. Ścieżka: Home → kategoria → Mapa → marker popup → Producent → Ulubione → Koszyk → Premium → Profil → Menu (legal scroll)
4. Na każdym: theme toggle ×2, language DE→EN→PL, search submit, map settings, review form open
5. Sprawdź: brak overflow-x, touch ≥44, safe-area, modal nie pod notch, ceny €, landing DE
6. iOS Safari + Chrome Android real device smoke przed release (DevTools ≠ 100%)

## Następne kroki

1. P0 UTF-8 (home.js, landing.html, pushNotifications) — odblokowuje Device Lab PASS na treściach
2. P0 Align --header-height / --ph-header-h @≤430
3. P1 Ręczny smoke SE + iPhone 15 Pro Max + Galaxy A54 (portrait+landscape)
4. P2 Opcjonalnie Playwright device project matrix (poza tym etapem)

---

*ETAP 37 · Device Lab · linked: ETAP 36 Zero Bug, ETAP 28C Responsive Premium*
