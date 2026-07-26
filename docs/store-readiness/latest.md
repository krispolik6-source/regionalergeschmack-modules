# ETAP 32B — Store Readiness

**Data:** 2026-07-22  
**Sklepy:** Google Play · Apple App Store  
**Polityka:** `autoApply=false` · `autoFix=false` · **bez zmian kodu**

---

## Werdykt

**Store Readiness: 48 / 100**

Aplikacja jest **mocna jako PWA + branding + ikony**, ale **nie jest gotowa do uploadu listingów** w Play / App Store: brak screenshotów, brak feature graphic 1024×500, brak spakowanego copy DE/EN oraz brak **publicznego URL** polityki prywatności.

---

## Checklist

| # | Obszar | Status | Dowód / luka |
|---|--------|--------|----------------|
| 1 | **Ikony** | ✅ Gotowe | Play `icon-512.png` 512×512 · App Store `icon-1024.png` 1024×1024 · z `logo-master` |
| 2 | **Screenshoty** | ❌ Brak | Brak folderu `assets/store/screenshots` · Brand Book §9 wymaga 5 kadrów |
| 3 | **Feature graphic** | ⚠️ Częściowo | Jest `feature-graphic-source.png` **1024×1024** — wymagane **1024×500** (Brand Book checklist) |
| 4 | **Opis DE** | ⚠️ Częściowo | `manifest.json` + meta DE; brak pliku listing store (pełny opis Play/AS) |
| 5 | **Opis EN** | ❌ Brak | Brak gotowego pełnego opisu EN pod sklep |
| 6 | **Short description** | ⚠️ Częściowo | Manifest: *„Regionale Lebensmittel…”* (~70 znaków DE); brak wersji EN + limity Play (80) / AS subtitle |
| 7 | **Privacy policy** | ⚠️ Częściowo | Treść DE/EN/PL w app (`translations-legal-help.js` + side menu); **brak** `privacy.html` / stałego HTTPS URL |
| 8 | **Contact** | ✅ Gotowe | `krispolik6@gmail.com` · Polikarski Krzysztof, Germany (także w privacy) |
| 9 | **Metadata** | ⚠️ Częściowo | Manifest OK; `index.html` / `landing.html` description z mojibake (`N?he`) |
| 10 | **Manifest** | ✅ Gotowe | name, short_name, icons 192/512/maskable, theme `#2a3f28`, bg `#f5efe3`, standalone |
| 11 | **PWA** | ✅ Gotowe | `npm run check:pwa` → OK · SW · install · apple-touch |
| 12 | **Branding** | ✅ Gotowe* | Brand Book + store icons z master; *Brand Protection WARNING (7) poza FAIL |

\* Gotowe do marki wizualnej; nie mylić z kompletnością listingu sklepu.

---

## Szczegóły assetów

### Ikony (OK)

| Plik | Wymiary | Sklep |
|------|---------|-------|
| `assets/store/google-play/icon-512.png` | 512×512 | Google Play |
| `assets/store/app-store/icon-1024.png` | 1024×1024 | App Store |
| PWA set `assets/icons/icon-*.png` + maskable | pełny | PWA / TWA |

### Feature graphic (NIEOK końcowy)

| Plik | Stan |
|------|------|
| `assets/store/google-play/feature-graphic-source.png` | 1024×1024 — **źródło**, nie final |
| `feature-graphic-1024x500.png` | **brak** |

### Screenshoty (NIEOK)

Brak plików. Spec Brand Book §9:

1. Home / klimat  
2. Mapa  
3. Producent / modal  
4. Ulubione / trasa  
5. Premium  

Wymiary: Play 1080×1920 (lub 1080×2340) · App Store 1290×2796 (lub 1242×2688).

### Copy listing (NIEOK / częściowe)

| Pole | DE | EN |
|------|----|----|
| Short (≤80 Play) | częściowo z manifest | brak |
| Full description | brak pakietu store | brak |
| Subtitle (AS ≤30) | brak | brak |
| Keywords (AS) | brak | brak |

### Privacy URL (blokada sklepu)

Sklepy wymagają **publicznego linku**. Obecnie: tylko widok w menu bocznym aplikacji.  
Kontakt w treści: Polikarski Krzysztof, Germany · mail — treść merytorycznie jest, **kanał dystrybucji URL — nie**.

---

## Google Play vs App Store

| Wymaganie | Play | App Store |
|-----------|------|-----------|
| Ikona | ✅ | ✅ |
| Feature graphic 1024×500 | ❌ (tylko source) | n/a |
| Screenshoty telefon | ❌ | ❌ |
| Privacy URL | ❌ | ❌ |
| Opis + short | ⚠️ / ❌ | ❌ |
| Kontakt | ✅ | ✅ |
| PWA/TWA / native wrapper | PWA gotowa; wrapper (TWA/Capacitor) **poza zakresem tego audytu assetów** | j.w. |

---

## Score breakdown

| Obszar | Score |
|--------|------:|
| Ikony | 100 |
| Screenshoty | 0 |
| Feature graphic | 40 |
| Opisy DE/EN + short | 25 |
| Privacy (URL) | 35 |
| Contact | 100 |
| Metadata | 70 |
| Manifest | 98 |
| PWA | 98 |
| Branding | 94 |
| **Overall Store Readiness** | **48** |

---

## Priorytet do v1.0 store (kolejność)

1. **5 screenshotów** (Play + warianty AS) wg Brand Book §9  
2. **Feature graphic 1024×500** z source  
3. **Publiczny URL privacy** (statyczna strona DE+EN)  
4. **Pakiet copy:** short + full DE/EN (i subtitle AS)  
5. Naprawa mojibake w meta `index.html` / `landing.html` (przy okazji listingu)

---

## Status

Raport tylko do odczytu. **Żadnych zmian kodu w ETAP 32B.**
