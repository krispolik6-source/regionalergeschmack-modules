# AI Translation Engine — raport wdrożenia

**Data:** 2026-07-24  
**Moduł:** `js/i18n/aiTranslationEngine.js`  
**Zasada:** zero UI „AI” / „Translating…” · autoApply=false względem wyglądu

## Nowe pliki

| Plik | Rola |
|------|------|
| `js/i18n/aiTranslationEngine.js` | Kanoniczny silnik (providers, cache, guards, API) |
| `scripts/test-ai-translation-engine.mjs` | Smoke test |
| `docs/i18n/AI-TRANSLATION-ENGINE.md` | Ten raport |

## Zmodyfikowane pliki

| Plik | Zmiana |
|------|--------|
| `js/core/dynamicTranslateEngine.js` | Shim → re-export z nowego silnika |
| `js/core/i18n.js` | `translateSoft` / `translate` + protect list |
| `js/app.js` | `initAiTranslationEngine()` |
| `js/presentation/producerDisplay.js` | soft + protect nazwa/adres |
| `js/views/producerModal.js` | soft promo + `data-rg-ai` |
| `index.html` | cache-bust `app.js?v=603` |
| `package.json` | `check:ai-i18n` |

## Sposób działania

1. **Język:** ustawienia (`rs_lang`) → `navigator.language` → **en**.
2. **Statyczne UI** nadal przez `t()` / katalogi.
3. **Dynamiczne treści** (opisy, produkty, historie, promo):  
   - hit cache (`to::oryginał` w `localStorage` `rg_ai_i18n_v2`) → synchronicznie,  
   - miss → pokaż oryginał, tłumacz w tle (kolejka, concurrency 2),  
   - po wyniku: event `DYNAMIC_TRANSLATIONS_UPDATED` + patch `[data-rg-ai-src]` (bez pełnego reflow jeśli to możliwe).
4. **Zmiana języka:** istniejący `LANGUAGE_CHANGED` → `navigateTo(force)` + `translatePage()` w tle.
5. **Providery (kolejność):** LibreTranslate → MyMemory.  
   Stuby gotowe: Google / DeepL / OpenAI (`registerProvider` / klucze w `AI_TRANSLATE_CONFIG`).

## API

```js
translate(text, { to, from, protect })
translateBatch(texts, opts)
translateProduct(product, { producerName, address })
translatePage(root?)
invalidateCache(filter?)
translateSoft(text, opts)   // sync cache / oryginał
__RG_AI_I18N__.stats()
```

## Czego nie tłumaczy

- `Regionaler Geschmack`
- e-mail, URL, telefon, GPS, SKU-like, czyste liczby
- teksty „address-like” (Straße/ul./street…)
- frazy z `protect[]` (np. nazwa producenta, adres)

## Wpływ na wydajność

| Aspekt | Ocena |
|--------|--------|
| Blokowanie UI | brak (async queue) |
| Sieć | tylko cache miss; throttle ~140 ms; max 2 równolegle |
| localStorage | max ~1200 wpisów; migracja z `rg_dyn_i18n_v1` |
| Cold start | +1 mały moduł ES; bez FA/Leaflet zmian |
| Migotanie | ograniczone: DOM patch tylko gdy tekst = src/prev |

## Ryzyko regresji

| Ryzyko | Poziom | Mitigacja |
|--------|--------|-----------|
| Złe API / CORS | medium | fallback MyMemory; cisza przy błędzie; retry 45 s |
| Przypadkowe tłumaczenie nazwy | low | `protect` + heurystyki |
| Podwójny refresh modala | low | debounce w `producerModal` |
| Wygląd / architektura | none | brak zmian Store/EventBus/CSS layout |

## Test

```bash
npm run check:ai-i18n
npm run check:dyn-i18n
```

Ręcznie: Ctrl+Shift+R → zmień język → otwórz producenta (opis/produkty). Brak toastów o tłumaczeniu.
