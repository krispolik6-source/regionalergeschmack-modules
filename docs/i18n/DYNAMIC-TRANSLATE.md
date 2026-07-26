# Dynamiczne tłumaczenia (tło)

Silnik tłumaczy **treści dynamiczne** (opisy producentów, produkty, historie, promo) gdy brakuje wpisu w katalogu statycznym.

## Zasady

- **Bez UI** — użytkownik nie widzi komunikatów o AI / tłumaczeniu.
- **Regionaler Geschmack** — nazwa marki nigdy nie jest tłumaczona.
- **Cache** — `localStorage` klucz `rg_dyn_i18n_v1` (tylko nowe teksty idą do API).
- **Fallback języka** — nieobsługiwany kod UI → EN.
- **Źródło** — LibreTranslate, potem MyMemory.

## API (konsola, opcjonalnie)

```js
__RG_DYN_I18N__.stats()
__RG_DYN_I18N__.soft('Frisches Brot')
__RG_DYN_I18N__.clear()
```

## Pliki

- `js/core/dynamicTranslateEngine.js`
- Wiring: `js/core/i18n.js` (`tProducerDescription`, `tProductField`)
- Init: `js/app.js` → `initDynamicTranslate()`

## Test

```bash
npm run check:dyn-i18n
```

Ctrl+Shift+R → zmień język → otwórz producenta (opis/produkty uzupełnią się z cache po chwili, bez toastów).
