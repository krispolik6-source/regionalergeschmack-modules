# Audyt refaktoringu AI Translation Engine

**Data:** 2026-08-02  
**Moduł:** `js/i18n/aiTranslationEngine.js` (wyłącznie)  
**Status:** PASS

---

## Wdrożone wymagania P1–P9

| ID | Wymaganie | Implementacja |
|----|-----------|---------------|
| P1 | Pusty `libreApiKey` → brak requestu | `isProviderAvailable()` pomija LibreTranslate przed `fetch` |
| P2 | Cache przed każdym requestem | `translate()` + ponowny check w `processQueue()` |
| P3 | Kolejka 1 równoległy, 750 ms odstęp | `QUEUE_CONCURRENCY=1`, `REQUEST_GAP_MS=750` |
| P4 | HTTP 429 → cooldown 60 s | `providerRateLimitedUntil` + fallback provider |
| P5 | Dedup Promise w sesji | `pendingByKey` Map — wspólny Promise per klucz |
| P6 | Diagnostyka tylko localhost | `IS_LOCALHOST` + `diag()` → `console.info` |
| P7 | Błąd HTTP → oryginał, cisza na prod | `resolve(text)` w catch, logi tylko localhost |
| P8 | Brak duplikatów w `translatePage()` | Grupowanie `bySource` + `Promise.all` + dedup batch |
| P9 | Wspólny cache | Jeden `memoryCache` + `rg_ai_i18n_v2` dla wszystkich API |

Publiczne API bez zmian: `translate`, `translateSoft`, `translateBatch`, `translatePage`, `translateProduct`, `initAiTranslationEngine`, …

---

## Audyt P10 — wyniki (symulacja)

Uruchomienie: `node scripts/audit-ai-translation-engine.mjs`

### Liczba requestów PRZED / PO (scenariusze)

| Scenariusz | PRZED (oczekiwane) | PO (zmierzone) |
|------------|-------------------|----------------|
| 5× ten sam tekst równolegle | 5 requestów | **1 request** |
| translateBatch 5 tekstów (3 unikalne) | 5 requestów | **3 requesty** |
| Cache hit (2. wywołanie) | 1 request | **0 requestów** |
| LibreTranslate bez klucza | 1× HTTP 400 | **0 requestów Libre** |
| Libre 400 → MyMemory | 2 requesty | **1 Libre + 1 MyMemory** (fallback) |

### Metryki (ostatni scenariusz audytu)

| Metryka | Wartość |
|---------|---------|
| Requesty łącznie | 2 |
| LibreTranslate | 1 |
| MyMemory | 1 |
| HTTP 400 | 1 |
| HTTP 429 | 0 |
| Cache hit ratio | 0% (scenariusz bez cache) |
| Średni czas requestu | ~32 ms (mock) |
| Odstęp kolejki | 750 ms |
| Provider skips | 0 |

### Cache hit ratio (scenariusz P2)

- 1. wywołanie: 1 request → zapis cache  
- 2. wywołanie: **0 requestów**, `cacheHits ≥ 1`  
- **Hit ratio drugiego przejścia: 100%**

### Eliminacja błędów HTTP

| Błąd | PRZED | PO |
|------|-------|-----|
| LibreTranslate 400 (brak klucza) | Request wysyłany → 400 | **Provider pominięty** — 0 requestów |
| MyMemory 429 | Retry bez cooldown providera | **Cooldown 60 s** + oryginał bez UI error |
| Duplikaty sesji | Wiele równoległych requestów | **1 Promise / klucz cache** |

Na produkcji: brak logów `[AI Translation]` (tylko `localhost` / `127.0.0.1`).

---

## P9 — wspólny cache (potwierdzenie)

Wszystkie ścieżki korzystają z tego samego silnika:

- `translate()` / `translateSoft()` / `translateBatch()`
- `translatePage()` (modal producenta, Home)
- `translateProduct()` / `translateProducerProfile()`
- `js/presentation/producerDisplay.js` → `translateSoft`
- `js/views/producerModal.js` → `translatePage`
- `js/core/i18n.js` → re-export `translateSoft`

Klucz cache: `text|from|to` · persystencja: `localStorage` `rg_ai_i18n_v2`

---

## Regresje

- `node scripts/test-ai-translation-engine.mjs` — **OK**
- `node scripts/audit-ai-translation-engine.mjs` — **6/6 PASS**
- UI / architektura / Brand Book — **bez zmian**

---

## Nowe metryki w `getAiTranslateStats()`

```js
stats.audit = {
  requests, cacheHits, cacheMisses, cacheHitRatio,
  libreRequests, mymemoryRequests,
  status400, status429, retries, providerSkips,
  avgMs, requestGapMs
}
```

Dostępne też przez `window.__RG_AI_I18N__.stats()` na localhost.
