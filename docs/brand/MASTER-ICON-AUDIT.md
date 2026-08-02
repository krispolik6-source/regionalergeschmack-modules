# MASTER ICON AUDIT — ETAP 28F

Wygenerowano: 2026-08-01T05:05:15.079Z

**Werdykt:** ✅ PASS · 49/49

## Master

- Plik: `assets/icons/logo-master.svg`
- Motyw: **dwa złote kłosy pochylone w prawo**
- Cache-bust: `?v=29`
- SW: `rg-pwa-v29` · image cache: `rg-runtime-images-v29` (network-first dla ikon)
- Hash: `668be70eec6ce347`

## Krytyczna naprawa 28F

- Stary `rg-runtime-images-v1` trzymał ikony **cache-first** → launcher widział starą grafikę mimo PASS 28A
- Teraz: ikony/manifest = **network-first**, purge wszystkich `rg-pwa-*` + `rg-runtime-images-*` przy activate
- Precache / cache-bust z `?v=29`

## Wymagane PNG (z logo-master)

- ✓ `assets/icons/icon-48.png`
- ✓ `assets/icons/icon-72.png`
- ✓ `assets/icons/icon-96.png`
- ✓ `assets/icons/icon-128.png`
- ✓ `assets/icons/icon-144.png`
- ✓ `assets/icons/icon-152.png`
- ✓ `assets/icons/icon-180.png`
- ✓ `assets/icons/icon-192.png`
- ✓ `assets/icons/icon-256.png`
- ✓ `assets/icons/icon-384.png`
- ✓ `assets/icons/icon-512.png`
- ✓ `assets/icons/icon-1024.png`
- ✓ `assets/icons/apple-touch-icon.png`
- ✓ `assets/icons/maskable-512.png`
- ✓ `assets/icons/monochrome-512.png`
- ✓ `assets/icons/favicon.ico`

## Aliasy SVG (= master)

- `assets/icons/icon-source.svg` ← logo-master.svg
- `assets/icons/icon-symbol.svg` ← logo-master.svg

## Powierzchnie użycia

- ✓ **manifest-192** — manifest.json · /icon-192\.png\?v=29/
- ✓ **manifest-512** — manifest.json · /icon-512\.png\?v=29/
- ✓ **manifest-maskable** — manifest.json · /maskable-512\.png\?v=29/
- ✓ **manifest-monochrome** — manifest.json · /monochrome-512\.png\?v=29/
- ✓ **manifest-apple** — manifest.json · /apple-touch-icon\.png\?v=29/
- ✓ **index-favicon** — index.html · /favicon\.ico\?v=29/
- ✓ **index-logo-master** — index.html · /logo-master\.svg\?v=29/
- ✓ **index-icon-192** — index.html · /icon-192\.png\?v=29/
- ✓ **index-apple** — index.html · /apple-touch-icon\.png\?v=29/
- ✓ **index-manifest** — index.html · /manifest\.json\?v=29/
- ✓ **index-og** — index.html · /og-share\.png\?v=29/
- ✓ **landing-logo** — landing.html · /logo-master\.svg\?v=29/
- ✓ **landing-icon-192** — landing.html · /icon-192\.png\?v=29/
- ✓ **home-brand** — js/views/home.js · /logo-master\.svg\?v=29/
- ✓ **push-icon** — js/core/pushNotifications.js · /icon-192\.png\?v=29/
- ✓ **brand-css** — css/brand-identity-final.css · /logo-master\.svg\?v=29/
- ✓ **sw-cache** — sw.js · /CACHE_VERSION\s*=\s*`rg-pwa-v\$\{PWA_VERSION\}`|rg-pwa-v\$\{PWA_VERSION\}/
- ✓ **sw-image-cache** — sw.js · /IMAGE_CACHE\s*=\s*`rg-runtime-images-v\$\{PWA_VERSION\}`|rg-runtime-images-v\$\{PWA_VERSION\}/
- ✓ **sw-network-first-icons** — sw.js · /isAppIconPath|network-first/
- ✓ **sw-default-icon** — sw.js · /icon-192\.png\?v=\$\{ICON_VERSION\}|ICON_VERSION\s*=\s*PWA_VERSION/
- ✓ **header-no-tile** — css/premium-header.css · /\.header-brand-mark[\s\S]{0,400}background:\s*transparent\s*!important/
- ✓ **og-asset** — assets/brand/og-share.png
- ✓ **splash-asset** — assets/brand/splash-logo.png
- ✓ **notify-asset** — assets/brand/notifications-icon.png
- ✓ **play-512** — assets/store/google-play/icon-512.png
- ✓ **store-1024** — assets/store/app-store/icon-1024.png

## Wszystkie odwołania (icons/brand)

### `assets/brand/README.md`
- `/assets/icons/logo-master.svg`

### `css/brand-identity-final.css`
- `/assets/icons/logo-master.svg?v=29`

### `index.html`
- `/assets/icons/icon-144.png?v=29`
- `/assets/brand/og-share.png?v=29`
- `/assets/icons/favicon.ico?v=29`
- `/assets/icons/logo-master.svg?v=29`
- `/assets/icons/icon-192.png?v=29`
- `/assets/icons/apple-touch-icon.png?v=29`
- `/assets/icons/icon-180.png?v=29`

### `js/core/pushNotifications.js`
- `/assets/icons/icon-192.png?v=29`

### `js/diagnostics/livingBrandBook.js`
- `/assets/icons/logo-master.svg`

### `js/diagnostics/selfHealing.js`
- `/assets/icons/logo-master.svg?v=29`

### `js/legacy/app.bundle.js`
- `/assets/icons/icon-192.png`

### `js/views/home.js`
- `/assets/icons/logo-master.svg?v=29`

### `js/views/premium.js`
- `/assets/icons/logo-master.svg?v=29`

### `landing.html`
- `/assets/brand/og-share.png?v=29`
- `/assets/icons/favicon.ico?v=29`
- `/assets/icons/logo-master.svg?v=29`
- `/assets/icons/icon-192.png?v=29`
- `/assets/icons/apple-touch-icon.png?v=29`

### `manifest.json`
- `/assets/icons/icon-48.png?v=29`
- `/assets/icons/icon-72.png?v=29`
- `/assets/icons/icon-96.png?v=29`
- `/assets/icons/icon-128.png?v=29`
- `/assets/icons/icon-144.png?v=29`
- `/assets/icons/icon-152.png?v=29`
- `/assets/icons/icon-192.png?v=29`
- `/assets/icons/icon-256.png?v=29`
- `/assets/icons/icon-384.png?v=29`
- `/assets/icons/icon-512.png?v=29`
- `/assets/icons/icon-1024.png?v=29`
- `/assets/icons/maskable-512.png?v=29`
- `/assets/icons/monochrome-512.png?v=29`
- `/assets/icons/apple-touch-icon.png?v=29`

### `sw.js`
- `/assets/icons/icon-192.png`
- `/assets/icons/favicon.ico`
- `/assets/icons/logo-master.svg`
- `/assets/icons/apple-touch-icon.png`
- `/assets/icons/icon-48.png`
- `/assets/icons/icon-72.png`
- `/assets/icons/icon-96.png`
- `/assets/icons/icon-128.png`
- `/assets/icons/icon-144.png`
- `/assets/icons/icon-152.png`
- `/assets/icons/icon-180.png`
- `/assets/icons/icon-256.png`
- `/assets/icons/icon-384.png`
- `/assets/icons/icon-512.png`
- `/assets/icons/icon-1024.png`
- `/assets/icons/maskable-512.png`
- `/assets/icons/monochrome-512.png`
- `/assets/brand/og-share.png`
- `/assets/brand/splash-logo.png`
- `/assets/brand/notifications-icon.png`

## Checklist

- ✓ master-exists — assets/icons/logo-master.svg
- ✓ master-hash — sha256…668be70eec6ce347
- ✓ alias-icon-source.svg — identyczny z master
- ✓ alias-icon-symbol.svg — identyczny z master
- ✓ png-icon-48.png — assets/icons/icon-48.png
- ✓ png-icon-72.png — assets/icons/icon-72.png
- ✓ png-icon-96.png — assets/icons/icon-96.png
- ✓ png-icon-128.png — assets/icons/icon-128.png
- ✓ png-icon-144.png — assets/icons/icon-144.png
- ✓ png-icon-152.png — assets/icons/icon-152.png
- ✓ png-icon-180.png — assets/icons/icon-180.png
- ✓ png-icon-192.png — assets/icons/icon-192.png
- ✓ png-icon-256.png — assets/icons/icon-256.png
- ✓ png-icon-384.png — assets/icons/icon-384.png
- ✓ png-icon-512.png — assets/icons/icon-512.png
- ✓ png-icon-1024.png — assets/icons/icon-1024.png
- ✓ png-apple-touch-icon.png — assets/icons/apple-touch-icon.png
- ✓ png-maskable-512.png — assets/icons/maskable-512.png
- ✓ png-monochrome-512.png — assets/icons/monochrome-512.png
- ✓ png-favicon.ico — assets/icons/favicon.ico
- ✓ no-stale-v21-icons — OK
- ✓ manifest-192 — manifest.json · /icon-192\.png\?v=29/
- ✓ manifest-512 — manifest.json · /icon-512\.png\?v=29/
- ✓ manifest-maskable — manifest.json · /maskable-512\.png\?v=29/
- ✓ manifest-monochrome — manifest.json · /monochrome-512\.png\?v=29/
- ✓ manifest-apple — manifest.json · /apple-touch-icon\.png\?v=29/
- ✓ index-favicon — index.html · /favicon\.ico\?v=29/
- ✓ index-logo-master — index.html · /logo-master\.svg\?v=29/
- ✓ index-icon-192 — index.html · /icon-192\.png\?v=29/
- ✓ index-apple — index.html · /apple-touch-icon\.png\?v=29/
- ✓ index-manifest — index.html · /manifest\.json\?v=29/
- ✓ index-og — index.html · /og-share\.png\?v=29/
- ✓ landing-logo — landing.html · /logo-master\.svg\?v=29/
- ✓ landing-icon-192 — landing.html · /icon-192\.png\?v=29/
- ✓ home-brand — js/views/home.js · /logo-master\.svg\?v=29/
- ✓ push-icon — js/core/pushNotifications.js · /icon-192\.png\?v=29/
- ✓ brand-css — css/brand-identity-final.css · /logo-master\.svg\?v=29/
- ✓ sw-cache — sw.js · /CACHE_VERSION\s*=\s*`rg-pwa-v\$\{PWA_VERSION\}`|rg-pwa-v\$\{PWA_VERSION\}/
- ✓ sw-image-cache — sw.js · /IMAGE_CACHE\s*=\s*`rg-runtime-images-v\$\{PWA_VERSION\}`|rg-runtime-images-v\$\{PWA_VERSION\}/
- ✓ sw-network-first-icons — sw.js · /isAppIconPath|network-first/
- ✓ sw-default-icon — sw.js · /icon-192\.png\?v=\$\{ICON_VERSION\}|ICON_VERSION\s*=\s*PWA_VERSION/
- ✓ header-no-tile — css/premium-header.css · /\.header-brand-mark[\s\S]{0,400}background:\s*transparent\s*!important/
- ✓ og-asset — assets/brand/og-share.png
- ✓ splash-asset — assets/brand/splash-logo.png
- ✓ notify-asset — assets/brand/notifications-icon.png
- ✓ play-512 — assets/store/google-play/icon-512.png
- ✓ store-1024 — assets/store/app-store/icon-1024.png
- ✓ no-mipmap — brak natywnego mipmap (PWA-only) — OK
- ✓ motif-wheat-not-app-icon — assets/images/motifs/wheat.svg = dekoracja klimatu (nie launcher)

## Reinstall (Android / iOS)

1. Wdróż build (Netlify / host)
2. Chrome Android: Site settings → Clear & reset (lub odinstaluj skrót PWA)
3. Otwórz stronę → Zainstaluj ponownie
4. iOS Safari: usuń z ekranu głównego → Share → Add to Home Screen
5. Sprawdź: dwa złote kłosy pochylone w prawo (logo-master)
