# Header Audit — ETAP 28B Premium Header

Wygenerowano: 2026-08-04T18:00:54.076Z

**Werdykt:** ⚠ FAIL · 25/26

## Polityka

- Tylko CSS/UI (`css/premium-header.css`)
- Bez zmiany architektury (Store / EventBus / HTML shell)
- Breakpointy: 320 · 360 · 390 · 412 · 430 · 768 · 1024

## Checklist

- ✓ **file-premium-header** — css/premium-header.css
- ✗ **imported-in-style** — @import premium-header.css w style.css
- ✓ **html-header** — struktura .main-header + logo
- ✓ **html-logo-master** — logo = logo-master.svg
- ✓ **html-title** — napis Regionaler Geschmack
- ✓ **html-menu** — przycisk menu
- ✓ **html-lang** — wybór języka
- ✓ **html-premium** — Premium
- ✓ **html-dark** — Dark Mode
- ✓ **bp-320** — breakpoint / zakres dla 320px
- ✓ **bp-360** — breakpoint / zakres dla 360px
- ✓ **bp-390** — breakpoint / zakres dla 390px
- ✓ **bp-412** — breakpoint / zakres dla 412px
- ✓ **bp-430** — breakpoint / zakres dla 430px
- ✓ **bp-768** — breakpoint / zakres dla 768px
- ✓ **bp-1024** — breakpoint / zakres dla 1024px
- ✓ **larger-logo** — większe logo (token --ph-logo)
- ✓ **larger-title** — większy napis + Literata
- ✓ **gap-brand** — większy odstęp logo–tekst
- ✓ **high-contrast** — wysoki kontrast tytułu
- ✓ **menu-style** — styl menu
- ✓ **lang-style** — styl języka
- ✓ **premium-style** — styl Premium (złoto)
- ✓ **dark-style** — styl Dark Mode
- ✓ **no-arch-change** — bez zmiany architektury HTML (tylko CSS)
- ✓ **architecture-untouched** — Store/EventBus nietknięte – tylko warstwa CSS

## Co poprawiono (28B)

- Większe logo (`--ph-logo` do 48px na 1024)
- Większy napis Regionaler Geschmack (Literata + clamp)
- Wyższy kontrast (#fffef8 + mocny text-shadow na ciemnej zieleni)
- Większy odstęp logo–tekst (`--ph-gap-brand`)
- Menu / język / Premium / Dark Mode — większe cele, złoty Premium, czytelne obramowania
- Responsywność 320–1024 — tytuł nie znika (ellipsis / 2 linie na 320)

## Rekomendacje

- @import premium-header.css w style.css
