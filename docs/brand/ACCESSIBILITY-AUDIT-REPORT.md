# Accessibility Audit Report

Wygenerowano: 2026-08-05T19:51:34.639Z

**Werdykt:** ✅ PASS · checks 33/33

## Polityka

- Wyłącznie CSS — bez zmiany funkcjonalności / logiki
- Pliki: `accessibility-audit.css` (warstwa końcowa) + istniejące dark/release/mobile

## Obszary audytu

| Obszar | Status |
|--------|--------|
| focus-visible | ✓ css/accessibility-audit.css — złoty pierścień :focus-visible na wszystkich kontrolkach |
| tab order | ✓ scroll-margin + overflow:visible — DOM order bez zmian (HTML/JS nietknięte) |
| contrast | ✓ tokeny --a11y-text / --a11y-text-muted · dark mode nav · prefers-contrast: more |
| touch targets | ✓ --a11y-touch 44px + mobile-premium-audit + release-cleanup |
| czytelność tekstów | ✓ line-height 1.5/1.55 · input 16px · optimizeLegibility |
| dark mode | ✓ dark-mode-contrast.css + accessibility-audit dark overrides |
| light mode | ✓ accessibility-audit light tokens + link underline |
| keyboard navigation | ✓ scroll-margin · focus-visible · reduced-motion · disabled focus |

## Checklist techniczna

- ✓ file-accessibility-audit — css/accessibility-audit.css istnieje
- ✓ imported-audit — accessibility-audit.css importowany z brand-colors-cleanup
- ✓ focus-visible-global — global :focus-visible
- ✓ focus-not-mouse — :focus:not(:focus-visible) — brak pierścienia na klik
- ✓ focus-gold — focus złoty Brand Book
- ✓ focus-interactive — focus na nav, formularzach, przyciskach
- ✓ focus-existing-layers — focus-visible na nav i mapie
- ✓ tab-scroll-margin — scroll-margin pod fixed header/nav (klawiatura)
- ✓ tab-focus-overflow — fokus nie obcinany w nav/header
- ✓ contrast-tokens-light — token tekstu light
- ✓ contrast-tokens-muted — token muted light
- ✓ contrast-dark-mode — dark mode tokeny
- ✓ contrast-dark-nav — dark mode: czytelne etykiety nav
- ✓ contrast-prefers-more — prefers-contrast: more
- ✓ touch-token — touch token 44px
- ✓ touch-enforcement — min-height touch na mobile/coarse
- ✓ touch-release — release-cleanup: legal/cookie 44px
- ✓ touch-mobile-audit — mobile-premium-audit: touch 44px
- ✓ readability-line-height — line-height body
- ✓ readability-input-16 — input ≥16px (iOS zoom)
- ✓ readability-paragraphs — line-height akapitów
- ✓ dark-text-primary — dark mode: nagłówki i tytuły
- ✓ dark-placeholder — dark mode: placeholder czytelny
- ✓ dark-forms — dark mode: formularze
- ✓ light-text — light mode: tytuły sekcji
- ✓ light-links — light mode: linki z underline offset
- ✓ light-mobile-muted — light mode: muted text token
- ✓ keyboard-reduced-motion — prefers-reduced-motion
- ✓ keyboard-disabled-focus — disabled: focus-visible widoczny
- ✓ keyboard-list-focus-bg — listy: tło przy focus-visible
- ✓ keyboard-range — slider mapy: focus-visible
- ✓ css-only-policy — brak ukrywania funkcji — tylko prezentacja
- ✓ no-pointer-events-none-global — brak globalnego pointer-events: none

## Weryfikacja ręczna

1. npm run accessibility-audit
1. Tab przez: header → home CTA → bottom nav → mapa → modal → menu
1. Sprawdź złoty focus-visible (nie na klik myszą)
1. Przełącz dark/light — kontrast tytułów i meta
1. DevTools → Rendering → Emulate prefers-reduced-motion / prefers-contrast
