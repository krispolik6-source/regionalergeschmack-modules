# ETAP 20A – Brand Identity Final · Raport końcowy

**Data:** 2026-07-21  
**Polityka:** bez zmian Store / EventBus / API / GPS / Leaflet / Routing / logiki aplikacji  

---

## Werdykt

Aplikacja ma **jeden spójny znak Premium**: dwa złote kłosy pochylone w prawo (`logo-master.svg`).  
Wszystkie ikony systemowe i marketingowe są z niego regenerowane. Paleta jest ciepła (zieleń / złoto / krem / miód) — **bez zimnego niebieskiego**. Nagłówek ma wysoki kontrast pod pełne słońce.

---

## Logo (kanoniczne)

| Element | Wartość |
|---------|---------|
| Plik źródłowy | `assets/icons/logo-master.svg` |
| Motyw | 2 złote kłosy, pochylenie w prawo |
| Alias | `icon-source.svg`, `icon-symbol.svg` (= kopia master) |
| Generowanie | `npm run generate-icons` |

### Gdzie występuje ten sam znak

| Miejsce | Realizacja |
|---------|------------|
| Header | `img.header-brand-mark` → logo-master.svg |
| Home / footer | `img.home-brand-mark` → logo-master.svg |
| Menu boczne | CSS: `.side-menu-brand-mark` → tło logo (zamiast emoji) |
| Landing | CSS: `.lp-brand-mark`, `.lp-hero-logo` → logo |
| Favicon | `favicon.ico` + SVG |
| Apple Touch | `apple-touch-icon.png` |
| PWA / Android | `icon-*.png`, `maskable-512.png`, manifest |
| Splash / loading | CSS + `assets/brand/splash-logo.png` |
| Instalacja PWA | `.pwa-install-banner::before` + manifest |
| Powiadomienia | `sw.js` DEFAULT_ICON + `assets/brand/notifications-icon.png` |
| Open Graph / Social | `assets/brand/og-share.png` + meta og/twitter |
| Google Play | `assets/store/google-play/` |
| App Store | `assets/store/app-store/icon-1024.png` |
| README | odwołanie do logo-master.svg |

---

## Paleta

| Nazwa | Hex |
|-------|-----|
| Ciemna zieleń | `#2a3f28` |
| Zieleń marki | `#3d5c34` |
| Złoto | `#c9a227` |
| Pszenica | `#e8c97a` |
| Miód | `#d4a84b` |
| Ciepły krem | `#f5efe3` |

Usunięto zimny niebieski z tokenów UI (`#2980b9`, `#456696` na landing).

---

## Typografia

- Display: **Literata** (nagłówki marki)
- UI: **Source Sans 3**
- Plik: `css/brand-identity-final.css`

---

## Kontrast nagłówka

- Tło: ciemna zieleń + złota kreska dolna  
- Tytuł „Regionaler Geschmack”: prawie biały + mocny text-shadow  
- Menu / język / Premium / Dark Mode: jasny tekst, obramowanie, tło półprzezroczyste; Premium w złocie  

---

## Pliki zmienione (warstwa wizualna)

- `assets/icons/logo-master.svg` (+ regeneracja PNG/ICO)
- `css/brand-identity-final.css` (nowy)
- `css/style.css`, `css/warm-summer.css`, `css/landing.css`
- `manifest.json`, `sw.js`
- `index.html` / `landing.html` – meta brand / ikony / OG (bez zmiany struktury UI)
- `scripts/generate-app-icons.mjs` – kopie store/OG/splash
- `assets/brand/*`, `assets/store/*`
- `README.md`, ten raport

---

## Czego nie ruszano

Store · EventBus · API · GPS · Leaflet · Routing · logika filtrów/mapy  

---

## Checklist jakości marki

- [x] Jedno logo (dwa kłosy →)
- [x] Ikony PWA / favicon / Apple z master
- [x] Manifest theme `#2a3f28`, background `#f5efe3`
- [x] Landing bez niebieskiego
- [x] Header high-contrast
- [x] Store + OG assety
- [x] Powiadomienia → ten sam icon-192
- [x] Raport końcowy

---

## Utrzymanie

Po każdej zmianie `logo-master.svg`:

```bash
npm run generate-icons
```

Nie dodawać równoległych plików logo ani emoji jako znaku aplikacji.

---

## Brand Book (dokument kanoniczny)

Pełna księga znaku przed publikacją:

- [`BRAND-BOOK.md`](./BRAND-BOOK.md)
- Wersja wizualna: [`brand-book.html`](./brand-book.html)
