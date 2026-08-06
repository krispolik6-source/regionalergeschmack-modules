# Mobile Premium Audit — Responsive Premium Report

Wygenerowano: 2026-08-05T20:02:35.551Z

**Werdykt:** ✅ PASS · checks 34/34 · macierz 72 komórek

## Polityka

- Tylko CSS (`mobile-premium.css` + `mobile-premium-audit.css`)
- Bez zmiany Store / EventBus / HTML / logiki mapy

## Ekrany × viewporty

| Ekran | 320 | 360 | 375 | 390 | 412 | 430 | 480 | 600 | 768 |
|-------|---|---|---|---|---|---|---|---|---|
| Home | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Mapa | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Producent | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Ulubione | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Koszyk | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Premium | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Profil | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Menu | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

## Typy problemów (wykryte → złagodzone CSS)

- **ucięte teksty** — mitigated · CSS mobile-premium.css + mobile-premium-audit.css
- **nakładające się elementy** — mitigated · CSS mobile-premium.css + mobile-premium-audit.css
- **za małe przyciski** — mitigated · CSS mobile-premium.css + mobile-premium-audit.css
- **touch target poniżej 44px** — mitigated · CSS mobile-premium.css + mobile-premium-audit.css
- **scroll poziomy** — mitigated · CSS mobile-premium.css + mobile-premium-audit.css
- **złe marginesy** — mitigated · CSS mobile-premium.css + mobile-premium-audit.css
- **nierówne odstępy** — mitigated · CSS mobile-premium.css + mobile-premium-audit.css
- **przyciski wystające poza ekran** — mitigated · CSS mobile-premium.css + mobile-premium-audit.css

## Naprawy CSS

- **global:** overflow-x: clip — brak scrollu poziomego na html/body/#app
- **touch:** min-height/min-width 44px na przyciskach, nav, map, modal, listach (audit layer)
- **gutter:** --mpa-gutter per viewport 320→768; sync --app-gutter
- **spacing:** --mpa-gap spójne odstępy kart, sekcji, toolbar mapy
- **text:** overflow-wrap + line-clamp 2 na tytułach; ellipsis nav-label
- **home:** search/actions 44px; grid 2 kolumny; karuzele scroll wewnętrzny
- **map:** toolbar flex-wrap; przyciski bez wystawania; settings close 44px
- **producer:** footer wrap/kolumna 320px; padding gutter
- **menu:** pola formularza min 44px; panel max vw
- **legal-cookie:** linki 44px; cookie actions wrap
- **landscape:** touch 44px zachowany; mniejsze gap/etykiety nav

## Checklist techniczna

- ✓ file-mobile-premium — css/mobile-premium.css istnieje
- ✓ file-mobile-premium-audit — css/mobile-premium-audit.css istnieje
- ✓ imported-audit — mobile-premium-audit.css importowany z brand-colors-cleanup
- ✓ imported-mobile — @import mobile-premium.css
- ✓ overflow-x-clip — global overflow-x clip (audit)
- ✓ touch-min — min touch 44px (audit)
- ✓ touch-enforcement — touch enforcement na mobile
- ✓ text-safe — anty-ucięcie tekstu
- ✓ landscape-block — reguły landscape (audit)
- ✓ bp-320 — CSS zakres dla 320px
- ✓ bp-360 — CSS zakres dla 360px
- ✓ bp-375 — CSS zakres dla 375px
- ✓ bp-390 — CSS zakres dla 390px
- ✓ bp-412 — CSS zakres dla 412px
- ✓ bp-430 — CSS zakres dla 430px
- ✓ bp-480 — CSS zakres dla 480px
- ✓ bp-600 — CSS zakres dla 600px
- ✓ bp-768 — CSS zakres dla 768px
- ✓ screen-home — Home: selektory obecne w CSS Premium/mobile
- ✓ screen-map — Mapa: selektory obecne w CSS Premium/mobile
- ✓ screen-producer — Producent: selektory obecne w CSS Premium/mobile
- ✓ screen-favorites — Ulubione: selektory obecne w CSS Premium/mobile
- ✓ screen-cart — Koszyk: selektory obecne w CSS Premium/mobile
- ✓ screen-premium — Premium: selektory obecne w CSS Premium/mobile
- ✓ screen-profile — Profil: selektory obecne w CSS Premium/mobile
- ✓ screen-menu — Menu: selektory obecne w CSS Premium/mobile
- ✓ issue-ucięte-teksty — Mitigacja: ucięte teksty
- ✓ issue-nakładające-się-elementy — Mitigacja: nakładające się elementy
- ✓ issue-za-małe-przyciski — Mitigacja: za małe przyciski
- ✓ issue-touch-target-poniżej-44px — Mitigacja: touch target poniżej 44px
- ✓ issue-scroll-poziomy — Mitigacja: scroll poziomy
- ✓ issue-złe-marginesy — Mitigacja: złe marginesy
- ✓ issue-nierówne-odstępy — Mitigacja: nierówne odstępy
- ✓ issue-przyciski-wystające-poza-ekran — Mitigacja: przyciski wystające poza ekran

## Jak zweryfikować wizualnie

1. npm run mobile-premium-audit
1. npm start → DevTools device toolbar
1. Przejdź: Home → Mapa → Producent → Ulubione → Koszyk → Premium → Profil → Menu
1. Dla każdego: 320, 360, 375, 390, 412, 430, 480, 600, 768 + landscape
