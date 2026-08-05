# Animation Audit Report

Wygenerowano: 2026-08-05T17:26:38.266Z

**Werdykt:** ✅ PASS · checks 36/36

## Polityka

- Wyłącznie CSS — bez zmiany funkcjonalności
- Dozwolone: **fade · hover · active · focus** (Home Premium)
- Usunięte: pulse · blink · drift · breathe · bounce · float

## Checklist

- ✓ file-animation-audit — css/animation-audit.css istnieje
- ✓ imported-audit — animation-audit.css importowany z brand-colors-cleanup
- ✓ fade-keyframes — keyframes motion-fade-in (fade)
- ✓ fade-home — fade wejścia Home
- ✓ fade-views — fade przejść ekranów
- ✓ fade-map — fade mapa
- ✓ fade-markers — fade markerów
- ✓ hover-lift — hover lift −2px (Home Premium)
- ✓ hover-rules — hover translateY
- ✓ active-tap — active tap scale
- ✓ active-rules — active scale
- ✓ focus-motion — focus bez transform bounce
- ✓ motion-tokens — tokeny Home Premium
- ✓ home-v1-alignment — home-v1.css spójne tokeny ruchu
- ✓ kill-infinite-climate — wyłącz climate atmosphere
- ✓ kill-breathe-lre — wyłącz breathe/glow region soul
- ✓ kill-ln-drift — wyłącz living-nature drift/sway
- ✓ kill-card-rise — wyłącz climate-card-rise
- ✓ kill-ambient-transform — wyłącz drift transform tła
- ✓ side-menu-fade-not-slide — menu: fade zamiast slide
- ✓ splash-fade-only — splash: fade bez scale bounce
- ✓ kill-theme-bounce — wyłącz bounce theme toggle
- ✓ reduced-motion — prefers-reduced-motion
- ✓ residual-infinite-mitigated — infinite w źródłach (emotions-climate-13e.css, emotions-climate.css, living-nature.css, living-region-experience.css) — nadpisane audit layer
- ✓ residual-keyframes-mitigated — keyframes dekoracyjne (emotions-climate-13e.css:climate-rays-breathe, emotions-climate-13e.css:climate-grass-sway, emotions-climate.css:climate-meadow-drift, emotions-climate.css:climate-motif-drift, living-nature.css:ln-clouds-drift…) — wyłączone audit layer
- ✓ allowed-fade — dozwolone: fade
- ✓ allowed-hover — dozwolone: hover
- ✓ allowed-active — dozwolone: active
- ✓ allowed-focus — dozwolone: focus
- ✓ removed-pulse — usunięte/mitigowane: pulse
- ✓ removed-blink — usunięte/mitigowane: blink
- ✓ removed-drift — usunięte/mitigowane: drift
- ✓ removed-breath — usunięte/mitigowane: breath
- ✓ removed-bounce — usunięte/mitigowane: bounce
- ✓ removed-float — usunięte/mitigowane: float
- ✓ removed-sway — usunięte/mitigowane: sway

## Pliki źródłowe z `infinite` (nadpisane audit layer)

- `emotions-climate-13e.css`
- `emotions-climate.css`
- `living-nature.css`
- `living-region-experience.css`

## Weryfikacja

1. npm run animation-audit
1. Home: brak pulsowania tła / kart — tylko fade wejścia
1. Hover: delikatny lift −2px · Active: scale 0.985
1. Mapa: fade markerów · menu boczne: fade (nie slide)
1. DevTools → Rendering → prefers-reduced-motion: reduce
