# ETAP 32C — Store Ready

**Data:** 2026-07-22  
**Sklepy:** Google Play · Apple App Store  
**Polityka:** `autoApply=false` · `autoFix=false` · **bez zmian kodu / assetów**  
**Poprzedni audyt:** ETAP 32B → `docs/store-readiness/latest.md` (48/100)

---

## Werdykt

| Kanał | Status |
|-------|--------|
| **Google Play listing** | **NO-GO** |
| **App Store listing** | **NO-GO** |
| **PWA (HTTPS / install)** | **GO z ostrzeżeniami** (`npm run check:pwa` → OK) |
| **Native wrapper (TWA / Capacitor / signed APK·IPA)** | **NO-GO** — brak projektu wrapper; `downloads/app.apk` = placeholder tekstowy |

**Store Ready Score: 52 / 100** (+4 vs 32B — naprawione meta UTF-8 w `index.html` / `landing.html`)

Aplikacja ma **gotowe ikony sklepowe + PWA + treść privacy w app**, ale **nie da się wysłać listingu**: brak screenshotów, brak feature graphic 1024×500, brak publicznego URL privacy, brak pakietu copy DE/EN pod sklep, brak binarki sklepowej.

---

## Checklist (żądany zakres)

| # | Obszar | Status | Score | Dowód / luka |
|---|--------|--------|------:|--------------|
| 1 | **Screenshoty** | ❌ Brak | 0 | Brak `assets/store/screenshots/` · Brand Book §9 wymaga **5 kadrów** |
| 2 | **Feature graphic** | ⚠️ Częściowo | 40 | Jest `feature-graphic-source.png` **1024×1024** · brak final **1024×500** |
| 3 | **Opisy** | ⚠️ / ❌ | 28 | DE częściowo (manifest/meta) · EN pełny listing **brak** · short/subtitle AS **brak** |
| 4 | **Privacy** | ⚠️ Częściowo | 35 | Treść DE/EN/PL(+mk) w app · **brak** publicznego HTTPS URL (`privacy.html` nie istnieje) |
| 5 | **Metadata** | ✅ Poprawione* | 95 | Manifest + meta DE OK (Nähe) · brak osobnego pakietu store metadata |
| 6 | **Ikony** | ✅ Gotowe | 100 | Play 512×512 · AS 1024×1024 · PWA set + maskable |
| 7 | **Manifest** | ✅ Gotowe | 98 | name, short_name, icons, theme `#2a3f28`, bg `#f5efe3`, standalone |

\* Metadata web/PWA gotowa; to nie zastępuje pól listingu w konsolach sklepów.

---

## 1. Screenshoty — FAIL

| Wymaganie | Stan |
|-----------|------|
| Folder `assets/store/screenshots` | **nie istnieje** |
| Liczba plików | **0** / wymagane **5** |
| Play telefon 1080×1920 (lub 1080×2340) | brak |
| App Store telefon 1290×2796 (lub 1242×2688) | brak |
| Tablet (opcjonalnie) | brak |

**Kolejność kadrów (Brand Book §9):**

1. Home / klimat  
2. Mapa  
3. Producent / modal  
4. Trasa / ulubione  
5. Premium / wartość  

Ramka: gradient `#243d28`→`#2a3f28` lub krem `#f5efe3`, Literata headline, bez zimnego niebieskiego tła sklepu.

---

## 2. Feature graphic — PARTIAL

| Plik | Wymiary (zmierzono) | Sklep |
|------|---------------------|-------|
| `assets/store/google-play/feature-graphic-source.png` | **1024×1024** | źródło — **nie** nadaje się do uploadu |
| `feature-graphic-1024x500.png` (lub równoważny) | **brak** | wymagane **1024×500** |

App Store nie używa feature graphic Play — wymaga screenshotów + ikony 1024.

---

## 3. Opisy — PARTIAL / FAIL

### Dostępne w repo (nie = listing sklepu)

| Źródło | Tekst | Znaki |
|--------|-------|------:|
| `manifest.json` `description` | Regionale Lebensmittel und Produzenten in deiner Nähe entdecken. | 64 (OK pod Play short ≤80) |
| `index.html` meta description | …Nähe… Karte, Favoriten, Bewertungen. | 118 |
| `landing.html` meta | …Teutoburger Wald Region… | dłuższy DE |

### Brakuje jako pakiet store

| Pole | Limit | DE | EN |
|------|-------|----|----|
| Play short description | ≤80 | częściowo (manifest) | ❌ |
| Play full description | ≤4000 | ❌ plik listing | ❌ |
| App Store subtitle | ≤30 | ❌ | ❌ |
| App Store promotional text | ≤170 | ❌ | ❌ |
| App Store description | ≤4000 | ❌ | ❌ |
| App Store keywords | ≤100 | ❌ | ❌ |
| What's New | — | ❌ | ❌ |

**Rekomendacja (bez auto-apply):** dodać `docs/store/listing-de.md` + `listing-en.md` (short/full/subtitle) — dopiero po akceptacji właściciela.

---

## 4. Privacy — PARTIAL (blokada uploadu)

| Element | Stan |
|---------|------|
| Treść w aplikacji (side menu) | ✅ `js/translations-legal-help.js` — **de / en / pl / mk** |
| Kontakt w privacy | ✅ Polikarski Krzysztof, Germany · `krispolik6@gmail.com` |
| Publiczny URL HTTPS | ❌ brak `privacy.html` / `/privacy` |
| Privacy Nutrition Labels (App Store) | ❌ nie przygotowane |
| Data safety form (Play) | ❌ nie przygotowane (GPS lokalnie, localStorage, brak konta) |

**Uwaga spójności (WARNING):** `ADSENSE_CONFIG.enabled: true` w `js/config.js` (puste `clientId`), a privacy mówi o braku Google Analytics / trackingu cookies — przed store należy **albo** dopisać AdSense w privacy, **albo** wyłączyć reklamy w buildzie sklepowym. `autoApply=false` — bez zmian w tym etapie.

---

## 5. Metadata — READY (web)

| Pole | Wartość | Status |
|------|---------|--------|
| `name` | Regionaler Geschmack | ✅ |
| `short_name` | Regionaler | ✅ (≤12 znaków — OK) |
| `lang` | de | ✅ |
| `categories` | food, shopping, lifestyle | ✅ |
| `theme_color` | `#2a3f28` | ✅ Brand |
| `background_color` | `#f5efe3` | ✅ Brand |
| `display` | standalone (+ override) | ✅ |
| `orientation` | portrait-primary | ✅ |
| Meta description UTF-8 | Nähe (naprawione w 32B cleanup) | ✅ |
| OG image | `og-share.png` **512×512** | ⚠️ działa; sklepy wolą screenshoty, nie OG |

---

## 6. Ikony — READY

Zmierzono (sharp):

| Plik | W×H | Sklep |
|------|-----|-------|
| `assets/store/google-play/icon-512.png` | 512×512 | Google Play ✅ |
| `assets/store/app-store/icon-1024.png` | 1024×1024 | App Store ✅ |
| `assets/icons/icon-512.png` | 512×512 | PWA ✅ |
| `assets/icons/icon-1024.png` | 1024×1024 | PWA / AS ✅ |
| `assets/icons/maskable-512.png` | 512×512 | Android adaptive ✅ |
| `assets/icons/apple-touch-icon.png` | 180×180 | iOS home screen ✅ |
| `assets/icons/logo-master.svg` | master | źródło marki ✅ |

Regeneracja: `npm run generate-icons` (tylko po akceptacji zmiany logo — Brand Lock).

---

## 7. Manifest — READY

- Plik: `manifest.json` (link `?v=23` w HTML)
- Ikony: 48…1024 + maskable + monochrome + apple-touch
- `prefer_related_applications: false`
- `npm run check:pwa` → **OK** (manifest, SW, install, ikony 192/512)

---

## Google Play vs App Store

| Wymaganie | Play | App Store |
|-----------|------|-----------|
| Ikona | ✅ 512 | ✅ 1024 |
| Feature graphic 1024×500 | ❌ | n/a |
| Screenshoty telefon | ❌ | ❌ |
| Privacy URL | ❌ | ❌ |
| Data safety / privacy labels | ❌ | ❌ |
| Opis short + full | ⚠️/❌ | ❌ |
| Kontakt dewelopera | ✅ | ✅ |
| Signed APK/AAB / IPA | ❌ placeholder APK | ❌ brak |
| Wrapper (TWA/Capacitor) | ❌ | ❌ |

---

## Score breakdown

| Obszar | Score |
|--------|------:|
| Screenshoty | 0 |
| Feature graphic | 40 |
| Opisy (DE/EN/short) | 28 |
| Privacy (treść + URL) | 35 |
| Metadata | 95 |
| Ikony | 100 |
| Manifest | 98 |
| PWA (wsparcie) | 98 |
| Branding | 94 |
| Contact | 100 |
| Native package | 5 |
| **Overall Store Ready** | **52** |

---

## Blokery v1.0 store (kolejność)

1. **5 screenshotów** Play (+ warianty App Store) wg Brand Book §9  
2. **Feature graphic 1024×500** z `feature-graphic-source.png`  
3. **Publiczny URL Privacy** (statyczna strona DE+EN, HTTPS produkcji)  
4. **Pakiet copy** short + full DE/EN (+ subtitle / keywords AS)  
5. **Wrapper + podpisany build** (TWA/Bubblewrap lub Capacitor) — zastąpić `downloads/app.apk`  
6. **Spójność AdSense ↔ privacy** przed Data safety / Nutrition Labels  

---

## Już gotowe (nie blokuje listingu assetami)

- Ikony Play / App Store z `logo-master`  
- Pełny zestaw PWA + maskable + apple-touch  
- Manifest + SW + `check:pwa`  
- Treść Datenschutz w aplikacji (DE/EN/PL)  
- Kontakt właściciela  
- Spec zrzutów w Brand Book §9 + `assets/store/README.md`  
- Meta web bez mojibake (po 32B cleanup)

---

## Status

Raport tylko do odczytu. **Żadnych zmian kodu ani generacji assetów w ETAP 32C.**  
`autoApply=false` — wdrożenie blokerów tylko po wyraźnej akceptacji właściciela.
