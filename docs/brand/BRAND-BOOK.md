# Regionaler Geschmack — Brand Book

**Wersja:** 1.0 · **Data:** 2026-07-21  
**Status:** kanoniczny dokument identyfikacji wizualnej przed publikacją  
**Wersja wizualna (otwórz w przeglądarce):** [`brand-book.html`](./brand-book.html)

> Jedna marka. Jedno logo. Ciepły klimat regionu — wszędzie: w aplikacji, po instalacji, w sklepie i w promocji.

---

## 1. Istota marki

| | |
|--|--|
| **Nazwa (wordmark)** | Regionaler Geschmack — tekst Literata, **nie** część ikony |
| **Ikona aplikacji** | Dwa złote kłosy pochylone **w prawo** |
| **Obietnica** | Odkrywanie lokalnych producentów i smaków regionu |
| **Ton** | Ciepły · spokojny · lokalny · Premium bez chłodu |
| **Zakaz** | Zimny niebieski · obce fonty (Inter, Roboto…) · druga ikona / inne logo |

> **Zasada nadrzędna:** dwa kłosy = **ikona aplikacji** (PWA, favicon, Apple Touch, Google Play, App Store, powiadomienia).  
> Nazwa „Regionaler Geschmack” stoi **obok** ikony jako napis — nigdy nie rysujemy nazwy wewnątrz ikony.

---

## 2. Ikona aplikacji (= oficjalne logo-znak)

### Plik źródłowy (master)

| Plik | Rola |
|------|------|
| [`assets/icons/logo-master.svg`](../../assets/icons/logo-master.svg) | **Jedyna ikona aplikacji** — z niej regenerujesz wszystko |
| `assets/icons/icon-source.svg` | Alias = kopia master |
| `assets/icons/icon-symbol.svg` | Alias = kopia master |

**Motyw znaku (master SVG):** wyłącznie dwa złote kłosy, łodygi zielone, pochylenie w prawo — **bez tła** (glyph).  
**Ikony PWA/PNG:** generator dokłada krem `#f5efe3`.  
**Header / UI:** ten sam `logo-master.svg` (same kłosy, bez kafelka).  
**Bez tekstu** w pliku ikony.  
**Monochrome:** `assets/icons/monochrome-512.png` (Android 13+).

### Wersje pochodne (tylko z mastera — `npm run generate-icons`)

| Wariant | Plik | Użycie |
|---------|------|--------|
| Na jasnym | `assets/brand/logo-on-light.*` | dokumenty / print |
| Na ciemnym | `assets/brand/logo-on-dark.*` | dark / store |
| Znak = master | `assets/brand/logo-mark.svg` | kopia glyph |

Po zmianie master:

```bash
npm run generate-icons
```

---

## 3. Favicon i ikony systemowe (= ta sama ikona kłosów)

Wszystkie poniższe to **ta sama ikona aplikacji** (dwa kłosy), tylko inne rozmiary / formaty:

| Asset | Ścieżka |
|-------|---------|
| Favicon ICO | `assets/icons/favicon.ico` |
| Favicon SVG | `assets/icons/logo-master.svg` |
| Apple Touch (180) | `assets/icons/apple-touch-icon.png` |
| PWA 192 | `assets/icons/icon-192.png` |
| PWA 512 | `assets/icons/icon-512.png` |
| Maskable 512 | `assets/icons/maskable-512.png` |
| Pełna siatka | `icon-48` … `icon-1024.png` |
| Google Play | `assets/store/google-play/icon-512.png` |
| App Store | `assets/store/app-store/icon-1024.png` |

**Manifest:** `theme_color` `#2a3f28` · `background_color` `#f5efe3`

**Powiadomienia / OG / splash:**

| Asset | Ścieżka |
|-------|---------|
| Notifications | `assets/brand/notifications-icon.png` |
| Open Graph | `assets/brand/og-share.png` |
| Splash logo | `assets/brand/splash-logo.png` |

---

## 4. Paleta kolorów (Brand Book)

| Nazwa | Hex | Token CSS | Rola |
|-------|-----|-----------|------|
| Ciemna zieleń | `#2a3f28` | `--brand-green` | Header, theme, autorytet |
| Zieleń marki | `#3d5c34` | `--brand-green-mid` | Primary UI |
| Zieleń miękka | `#4f6b3c` | `--brand-green-soft` | Akcenty roślinne |
| Złoto | `#c9a227` | `--brand-gold` | Logo, kreski, Premium |
| Złoto głębokie | `#a67c1a` | `--brand-gold-deep` | Hover / głębia |
| Pszenica | `#e8c97a` | `--brand-wheat` | Światło, dark accent |
| Miód | `#d4a84b` | `--brand-honey` | CTA miękkie, ikony |
| Ciepły krem | `#f5efe3` | `--brand-cream` | Tło aplikacji |
| Krem karty | `#fff8ee` | `--brand-cream-card` | Karty / powierzchnie |
| Atrament | `#1c1812` | `--brand-ink` | Tekst |

### Zakazane

- Zimny niebieski UI (`#2563eb`, `#2980b9`, `#3498db`, `#456696`…)
- Fiolet / „startup glow”
- Czysta biel jako jedyne tło brandowe (zamiast kremu)

Kontrola: `npm run living-brand`

---

## 5. Typografia

| Rola | Font | Użycie |
|------|------|--------|
| Display | **Literata** | Nazwa marki, nagłówki hero |
| UI | **Source Sans 3** | Interfejs, body, przyciski |
| Fallback display | Georgia, Times New Roman | Serif awaryjny |
| Fallback UI | Segoe UI, system-ui | Sans awaryjny |

Źródło w produkcie: `css/brand-identity-final.css`  
Google Fonts: Literata + Source Sans 3 (wagi 500–800 / display 600–700).

**Nie używaj:** Inter, Roboto, Poppins, Montserrat, Nunito jako fontów marki.

---

## 6. Styl ikon

- **Znak aplikacji** = wyłącznie kłosy (nie emoji 🌾 jako logo końcowe; CSS może nadpisać emoji w menu).
- Ikony nawigacji / kategorii: ciepłe tokeny (`--nav-icon-*`, `--cat-icon-*`) — zieleń, miód, terracotta, nie niebieski.
- Grubość / charakter: przyjazne, czytelne na słońcu; unikaj cienkich hairline na mobile.
- PWA maskable: znak w safe zone (~72% kadru), tło jasne.

---

## 7. Styl fotografii

Fotografie budują emocję powrotu (Emotion AI). Zasady:

| Tak | Nie |
|-----|-----|
| Złota godzina, ciepłe światło | Ostre neonowe / biurowe światło |
| Wieś, pole, gospodarstwo, stragan | Stock „global city / cyber” |
| Ręce, chleb, ser, owoce, gleba | Plastikowe placeholdery |
| Naturalne kolory blisko palety (zieleń, złoto, krem) | Dominujący zimny niebieski w kadrze |
| Ludzie lokalni, autentyczność | Nadmierny HDR / filtr social |

**Formaty:** WebP/JPEG produktowe w `assets/`; OG 1:1 lub 1.91:1 z logo w bezpiecznej strefie.

---

## 8. Zasady użycia logo

### Dozwolone

1. Używaj **logo-master** / **logo-on-light** / **logo-on-dark** / **logo-mark** zgodnie z tłem.
2. Zachowaj proporcje (nie rozciągaj).
3. Clear space: min. ≈ ¼ wysokości znaku wokół kłosów.
4. Minimalny rozmiar cyfrowy: **24×24 px** (UI), **48×48** (favicon strefa), **180×180** (Apple).
5. Na zdjęciu: preferuj `logo-mark` lub `logo-on-dark` w rogu z delikatnym cieniem.

### Zakazane

1. Drugie / równoległe logo (inny symbol, inicjały, inny kłos).
2. Obrót inne niż kanoniczne pochylenie w prawo.
3. Zmiana kolorów kłosów na niebieski / róż / neon.
4. Obramowanie w „startup glow”, drop-shadow fioletowy.
5. Umieszczanie na chaotycznym tle bez kontrastu.
6. Emoji jako oficjalny znak w store / PWA / OG.

---

## 9. Sklep: Google Play i App Store

### Ikony sklepowe (już w repo)

| Sklep | Plik | Rozmiar |
|-------|------|---------|
| Google Play | `assets/store/google-play/icon-512.png` | 512×512 |
| Google Play feature | `assets/store/google-play/feature-graphic-source.png` | baza 1024 (przytnij do **1024×500**) |
| App Store | `assets/store/app-store/icon-1024.png` | 1024×1024 |

### Specyfikacja zrzutów ekranu (projekt)

| Platforma | Telefon (portret) | Tablet (opcjonalnie) |
|-----------|-------------------|----------------------|
| **Google Play** | **1080×1920** (lub 1080×2340) | 1920×1200 |
| **App Store** | **1290×2796** (iPhone 15 Pro Max) lub **1242×2688** | 2048×2732 (iPad) |

### Zestaw 5 kadrów (kolejność w sklepie)

1. **Home / klimat** — pierwszy ekran, logo, ciepło regionu  
2. **Mapa** — producenci w okolicy  
3. **Producent / modal** — smak, zdjęcie, zaufanie  
4. **Trasa / ulubione** — powód do powrotu  
5. **Premium / wartość** — jedna jasna obietnica  

### Ramka wizualna zrzutu

- Tło: gradient `#243d28` → `#2a3f28` lub krem `#f5efe3`
- Telefon wyśrodkowany, zaokrąglone rogi, lekki cień `0 8px 24px rgba(0,0,0,.28)`
- Nad telefonem krótki headline Literata (krem / złoto), max 6–8 słów
- **Bez** zimnego niebieskiego tła sklepu
- Status bar systemu: jasny lub ciemny spójny z kadrą — nie mieszać marek

Szablony wizualne: sekcja „Store” w [`brand-book.html`](./brand-book.html).

---

## 10. Gdzie marka musi być identyczna

| Powierzchnia | Realizacja |
|--------------|------------|
| Header aplikacji | `logo-master.svg` |
| Home / footer | `home-brand-mark` → master |
| Menu boczne / landing | CSS `--brand-logo` |
| Favicon / PWA / Apple | wygenerowane z master |
| Powiadomienia | `notifications-icon.png` = icon-192 |
| OG / social | `og-share.png` |
| Google Play / App Store | `assets/store/…` |
| Living Brand (codziennie) | `npm run living-brand` |

---

## 11. Checklist przed publikacją

- [ ] Otwórz [`brand-book.html`](./brand-book.html) i zweryfikuj wizualnie  
- [ ] `npm run generate-icons` po ostatniej zmianie logo  
- [ ] `npm run living-brand` — status bez critical coldBlue / obce logo  
- [ ] Feature graphic Play przycięty do 1024×500  
- [ ] 5 zrzutów telefonu w ramce Brand Book  
- [ ] Brak Inter/Roboto w landing (Living Brand → fonts)  
- [ ] Manifest theme/background zgodne z tabelą kolorów  

---

## 12. Pliki pokrewne

| Dokument | Treść |
|----------|--------|
| Ten Brand Book | Reguły kanoniczne |
| [`brand-book.html`](./brand-book.html) | Wersja do oglądania |
| [`ETAP-20A-BRAND-REPORT.md`](./ETAP-20A-BRAND-REPORT.md) | Raport wdrożenia 20A |
| `css/brand-identity-final.css` | Tokeny w produkcie |
| `js/diagnostics/livingBrandBook.js` | Strażnik automatyczny |
| `assets/brand/README.md` | Skrót assetów |

---

*Regionaler Geschmack Brand Book v1.0 — identyfikacja wizualna spójna w aplikacji, na telefonie, w sklepie i w promocji.*
