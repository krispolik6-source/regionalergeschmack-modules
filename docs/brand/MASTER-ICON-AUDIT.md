# MASTER ICON AUDIT — ETAP 28F

Wygenerowano: 2026-08-06T21:30:26.349Z

**Werdykt:** ✅ PASS · 50/50

## Master

- Plik: `assets/icons/logo-master.svg`
- Motyw: **dwa złote kłosy pochylone w prawo**
- Cache-bust: `?v=30`
- SW: `rg-pwa-v30` · image cache: `rg-runtime-images-v30` (network-first dla ikon)
- Hash: `668be70eec6ce347`

## Krytyczna naprawa 28F

- Stary `rg-runtime-images-v1` trzymał ikony **cache-first** → launcher widział starą grafikę mimo PASS 28A
- Teraz: ikony/manifest = **network-first**, purge wszystkich `rg-pwa-*` + `rg-runtime-images-*` przy activate
- Precache / cache-bust z `?v=30`

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

- ✓ **manifest-192** — manifest.json · /icon-192\.png\?v=30/
- ✓ **manifest-512** — manifest.json · /icon-512\.png\?v=30/
- ✓ **manifest-maskable** — manifest.json · /maskable-512\.png\?v=30/
- ✓ **manifest-monochrome** — manifest.json · /monochrome-512\.png\?v=30/
- ✓ **manifest-apple** — manifest.json · /apple-touch-icon\.png\?v=30/
- ✓ **index-favicon** — index.html · /favicon\.ico\?v=30/
- ✓ **index-logo-master** — index.html · /logo-master\.svg\?v=30/
- ✓ **index-icon-192** — index.html · /icon-192\.png\?v=30/
- ✓ **index-apple** — index.html · /apple-touch-icon\.png\?v=30/
- ✓ **index-manifest** — index.html · /manifest\.json\?v=30/
- ✓ **index-og** — index.html · /og-share\.png\?v=30/
- ✓ **landing-logo** — landing.html · /logo-master\.svg\?v=30/
- ✓ **landing-icon-192** — landing.html · /icon-192\.png\?v=30/
- ✓ **home-brand** — js/views/home.js · /logo-master\.svg\?v=30/
- ✓ **push-icon** — js/core/pushNotifications.js · /pwaAssetUrl\(['"]\/assets\/icons\/icon-192\.png['"]\)/
- ✓ **brand-css** — css/brand-identity-final.css · /logo-master\.svg\?v=30/
- ✓ **sw-bridge** — sw.js · /importScripts\(['"]\/js\/core\/pwaVersion\.global\.js['"]\)/
- ✓ **sw-cache** — sw.js · /CACHE_VERSION\s*=\s*PWA_CACHE_NAME/
- ✓ **sw-image-cache** — sw.js · /IMAGE_CACHE\s*=\s*PWA_IMAGE_CACHE_NAME/
- ✓ **sw-network-first-icons** — sw.js · /fetchPwaIconAsset|cache:\s*'no-store'/
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
- `/assets/icons/logo-icon.svg`

### `css/brand-identity-final.css`
- `/assets/icons/logo-master.svg?v=30`
- `/assets/icons/icon-192.png?v=30`
- `/assets/brand/splash-logo.png?v=30`

### `index.html`
- `/assets/icons/icon-144.png?v=30`
- `/assets/brand/og-share.png?v=30`
- `/assets/icons/logo-master.svg?v=30`
- `/assets/icons/favicon.ico?v=30`
- `/assets/icons/favicon-16.png?v=30`
- `/assets/icons/favicon-32.png?v=30`
- `/assets/icons/icon-192.png?v=30`
- `/assets/icons/apple-touch-icon.png?v=30`
- `/assets/icons/icon-180.png?v=30`

### `js/core/pushNotifications.js`
- `/assets/icons/icon-192.png`

### `js/diagnostics/livingBrandBook.js`
- `/assets/icons/logo-master.svg`

### `js/diagnostics/selfHealing.js`
- `/assets/icons/logo-master.svg`

### `js/legacy/app.bundle.js`
- `/assets/icons/logo-master.svg`
- `/assets/icons/logo-master.svg?v=30`
- `/assets/icons/icon-192.png`

### `js/views/home.js`
- `/assets/icons/logo-master.svg?v=30`

### `js/views/premium.js`
- `/assets/icons/logo-master.svg?v=30`

### `landing.html`
- `/assets/brand/og-share.png?v=30`
- `/assets/icons/favicon.ico?v=30`
- `/assets/icons/favicon-16.png?v=30`
- `/assets/icons/favicon-32.png?v=30`
- `/assets/icons/logo-master.svg?v=30`
- `/assets/icons/icon-192.png?v=30`
- `/assets/icons/apple-touch-icon.png?v=30`

### `manifest.json`
- `/assets/icons/favicon-16.png?v=30`
- `/assets/icons/favicon-32.png?v=30`
- `/assets/icons/icon-48.png?v=30`
- `/assets/icons/icon-72.png?v=30`
- `/assets/icons/icon-96.png?v=30`
- `/assets/icons/icon-128.png?v=30`
- `/assets/icons/icon-144.png?v=30`
- `/assets/icons/icon-152.png?v=30`
- `/assets/icons/icon-180.png?v=30`
- `/assets/icons/icon-192.png?v=30`
- `/assets/icons/icon-256.png?v=30`
- `/assets/icons/icon-384.png?v=30`
- `/assets/icons/icon-512.png?v=30`
- `/assets/icons/icon-1024.png?v=30`
- `/assets/icons/maskable-192.png?v=30`
- `/assets/icons/maskable-512.png?v=30`
- `/assets/icons/monochrome-512.png?v=30`
- `/assets/icons/apple-touch-icon.png?v=30`

### `sw.js`
- `/assets/icons/icon-192.png`
- `/assets/icons/favicon.ico`
- `/assets/icons/favicon-16.png`
- `/assets/icons/favicon-32.png`
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
- `/assets/icons/maskable-192.png`
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
- ✓ manifest-192 — manifest.json · /icon-192\.png\?v=30/
- ✓ manifest-512 — manifest.json · /icon-512\.png\?v=30/
- ✓ manifest-maskable — manifest.json · /maskable-512\.png\?v=30/
- ✓ manifest-monochrome — manifest.json · /monochrome-512\.png\?v=30/
- ✓ manifest-apple — manifest.json · /apple-touch-icon\.png\?v=30/
- ✓ index-favicon — index.html · /favicon\.ico\?v=30/
- ✓ index-logo-master — index.html · /logo-master\.svg\?v=30/
- ✓ index-icon-192 — index.html · /icon-192\.png\?v=30/
- ✓ index-apple — index.html · /apple-touch-icon\.png\?v=30/
- ✓ index-manifest — index.html · /manifest\.json\?v=30/
- ✓ index-og — index.html · /og-share\.png\?v=30/
- ✓ landing-logo — landing.html · /logo-master\.svg\?v=30/
- ✓ landing-icon-192 — landing.html · /icon-192\.png\?v=30/
- ✓ home-brand — js/views/home.js · /logo-master\.svg\?v=30/
- ✓ push-icon — js/core/pushNotifications.js · /pwaAssetUrl\(['"]\/assets\/icons\/icon-192\.png['"]\)/
- ✓ brand-css — css/brand-identity-final.css · /logo-master\.svg\?v=30/
- ✓ sw-bridge — sw.js · /importScripts\(['"]\/js\/core\/pwaVersion\.global\.js['"]\)/
- ✓ sw-cache — sw.js · /CACHE_VERSION\s*=\s*PWA_CACHE_NAME/
- ✓ sw-image-cache — sw.js · /IMAGE_CACHE\s*=\s*PWA_IMAGE_CACHE_NAME/
- ✓ sw-network-first-icons — sw.js · /fetchPwaIconAsset|cache:\s*'no-store'/
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
