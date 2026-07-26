# Logo Audit — ETAP 28A

Wygenerowano: 2026-07-23T18:32:59.754Z

## Zasada

Jedyna oficjalna **ikona aplikacji**: `assets/icons/logo-master.svg`
Motyw: **dwa złote kłosy pochylone w prawo**
Master SHA (16): `668be70eec6ce347`

**Werdykt:** ⚠ wymaga uwagi

## ✓ Miejsca gdzie logo zostało znalezione

- **header** — `index.html` · ok-master · wskazuje logo-master / ikony z master
- **side-menu** — `index.html` · ok-master · wskazuje logo-master / ikony z master
- **home-greeting** — `js/views/home.js` · ok-master · wskazuje logo-master / ikony z master
- **home-footer** — `js/views/home.js` · ok-master · wskazuje logo-master / ikony z master
- **favicon-ico** — `index.html` · ok-master · wskazuje logo-master / ikony z master
- **favicon-svg** — `index.html` · ok-master · wskazuje logo-master / ikony z master
- **apple-touch** — `index.html` · ok-master · wskazuje logo-master / ikony z master
- **pwa-manifest** — `manifest.json` · ok-master · wskazuje logo-master / ikony z master
- **android-maskable** — `manifest.json` · ok-master · wskazuje logo-master / ikony z master
- **sw-precache** — `sw.js` · ok-master · wskazuje logo-master / ikony z master
- **sw-notify-icon** — `sw.js` · ok-master · wskazuje logo-master / ikony z master
- **push-icon** — `js/core/pushNotifications.js` · ok-master · wskazuje logo-master / ikony z master
- **og-image** — `index.html` · ok-master · wskazuje logo-master / ikony z master
- **landing-favicon** — `landing.html` · ok-master · wskazuje logo-master / ikony z master
- **landing-header** — `landing.html` · ok-master · wskazuje logo-master / ikony z master
- **landing-hero** — `landing.html` · ok-master · wskazuje logo-master / ikony z master
- **brand-css-token** — `css/brand-identity-final.css` · ok-master · wskazuje logo-master / ikony z master
- **splash-css** — `css/brand-identity-final.css` · ok-master · wskazuje logo-master / ikony z master
- **pwa-install-banner** — `css/brand-identity-final.css` · ok-master · wskazuje logo-master / ikony z master
- **google-play** — `assets/store/google-play/icon-512.png` · ok-asset · asset pochodny z master (generate-icons)
- **app-store** — `assets/store/app-store/icon-1024.png` · ok-asset · asset pochodny z master (generate-icons)
- **readme** — `README.md` · ok-master · wskazuje logo-master / ikony z master
- **brand-book-md** — `docs/brand/BRAND-BOOK.md` · ok-master · wskazuje logo-master / ikony z master
- **brand-book-html** — `docs/brand/brand-book.html` · ok-master · wskazuje logo-master / ikony z master
- **notifications-asset** — `assets/brand/notifications-icon.png` · ok-asset · asset pochodny z master (generate-icons)
- **splash-asset** — `assets/brand/splash-logo.png` · ok-asset · asset pochodny z master (generate-icons)
- **og-asset** — `assets/brand/og-share.png` · ok-asset · asset pochodny z master (generate-icons)
- **alias** — `assets/icons/icon-source.svg` · ok-identical · SHA = master (668be70eec6ce347)
- **alias** — `assets/icons/icon-symbol.svg` · ok-identical · SHA = master (668be70eec6ce347)

## ✓ Miejsca gdzie zostało podmienione (ETAP 28A)

- **emoji→logo-master** — `index.html` · Sloty marki używają <img logo-master.svg> zamiast emoji 🌾
- **emoji→logo-master** — `landing.html` · Sloty marki używają <img logo-master.svg> zamiast emoji 🌾
- **landing-header** — `landing.html` · 🌾 → <img class="lp-brand-mark" src="logo-master.svg">
- **landing-hero** — `landing.html` · 🌾 → <img class="lp-hero-logo" src="logo-master.svg">
- **side-menu** — `index.html` · 🌾 → <img class="side-menu-brand-mark" src="logo-master.svg">
- **css-brand-slots** — `css/brand-identity-final.css` · Usunięto overlay emoji→CSS; style pod <img> logo-master
- **cache-bust** — `index.html / landing / manifest / sw / home` · Ikony ?v=20 → ?v=21 · SW rg-pwa-v21

## ✗ Miejsca których nie udało się znaleźć / problemy

- **foreign-file** — `assets/icons/monochrome-512.png` · nie na liście kanonicznych pochodnych

## Notatki

- `assets/images/motifs/wheat.svg` — Dekoracyjny motyw klimatu (1 kłos) — NIE jest ikoną aplikacji. Zachowany jako ornament UI.

## Powierzchnie (checklist)

Header · Splash · PWA · favicon · Apple Touch · Android maskable · Google Play · App Store · manifest · powiadomienia · instalacja PWA · landing · README · Brand Book
