# Audyt QuotaExceededError — `rg_push_content_snapshot`

**Data:** 2026-08-02  
**Zakres:** `js/core/pushNotifications.js`, `js/core/safeStorage.js`  
**Status:** NAPRAWIONE

---

## Przyczyna problemu

`writeSnapshot()` zapisywała do `localStorage` **pełne klucze ofert** jako tablicę JSON-stringów. Każdy klucz zawierał m.in. `producerName`, `itemLabel`, `type`, `producerId`, `itemId` — po powtórzeniu dla tysięcy produktów/promocji/heurystyk snapshot mógł osiągnąć **>2 MB** (przy ~500 producentach syntetycznych: **2,76 MB**), przekraczając limit `localStorage` (~5 MB łącznie ze wszystkimi kluczami aplikacji).

Błąd:

```
QuotaExceededError: Failed to execute 'setItem' on 'Storage':
Setting the value of 'rg_push_content_snapshot' exceeded the quota.
```

Występował w `writeSnapshot()` przy pollingu push (`checkForNewOffers`) i subskrypcji — **bez try/catch**, co mogło przerywać łańcuch inicjalizacji.

---

## Wdrożona naprawa

### 1. Lekki snapshot v2 (`buildLightSnapshotPayload`)

Zamiast pełnych obiektów JSON zapisujemy:

| Pole | Opis |
|------|------|
| `v: 2` | Wersja formatu |
| `updatedAt` | Timestamp zapisu |
| `offerCount` | Liczba ofert |
| `fingerprint` | Hash całego zestawu (djb2 → base36) |
| `keys[]` | Kompaktowe klucze: `type\|producerId\|itemId` |
| `producers[]` | Per producent: `id`, `updatedAt`, `offerCount`, `fp` |

**Logika powiadomień bez zmian:** runtime nadal używa `collectOfferKeys()` z pełnymi danymi do treści push; porównanie diff używa `compactOfferKey()` — migracja v1→v2 przy odczycie.

### 2. Bezpieczny zapis (`js/core/safeStorage.js`)

Wszystkie `setItem` w `pushNotifications.js` przechodzą przez `safeLocalStorageSetItem()`:

- `try/catch`
- wykrycie `QuotaExceededError`
- `cleanupStaleLocalStorageCaches()` (cache diagnostyki, AI i18n, stary snapshot…)
- **jeden** ponowny zapis
- brak propagacji wyjątku — aplikacja działa dalej

---

## Rozmiar snapshotu — PRZED / PO

Pomiar: `node scripts/audit-push-snapshot-quota.mjs` (syntetyczni producenci, 8 produktów + 2 promocje / producent)

| Producenci | Klucze ofert | PRZED (legacy) | PO (v2 light) | Oszczędność |
|------------|--------------|----------------|---------------|-------------|
| 50 | 1 505 | **277,40 KB** | **54,99 KB** | −80,2% |
| 200 | 6 020 | **1,10 MB** | **227,42 KB** | −79,8% |
| 500 | 15 050 | **2,76 MB** | **578,28 KB** | −79,6% |

Przykład pojedynczego klucza:

- legacy: **168 B** (`{"type":"new_producer","producerId":…,"producerName":"Hofladen…"}`)
- compact: **34 B** (`new_producer|producer-0|producer-0`)

Test regresji: `node scripts/test-push-notifications.mjs` — **OK**

---

## Klucze localStorage — ryzyko przekroczenia limitu

| Ryzyko | Klucz | Uwagi |
|--------|-------|-------|
| **HIGH** | `rg_push_content_snapshot` | Naprawione (v2 compact) |
| **HIGH** | `rg_producers_data_v9` | Cache OSM — lean/minimal fallback w dataService |
| **HIGH** | `rg_ai_i18n_v2` | Duży cache tłumaczeń; cleanup w safeStorage |
| MEDIUM | `rg_dyn_i18n_v1` | Legacy i18n |
| MEDIUM | `rg_learning_events_v1` | Slice do MAX |
| MEDIUM | `rg_learning_model_v1` | Chroniony (Memory Cleaner) |
| MEDIUM | `rg_health_log_v1`, `rg_health_report_v1` | Raporty diagnostyczne |
| MEDIUM | `rg_osm_cache` | Cache zapytań mapy |
| LOW | `rg_push_subscription`, `rg_push_nearby_ids` | Małe payloady |
| LOW | `rg_favorites_v1`, `rg_cart_v1` | Listy ID |

Pozostałe ~80 wywołań `localStorage.setItem()` w projekcie — głównie małe obiekty (ustawienia, sesja, GPS). Największe ryzyko poza snapshotem push: **cache producentów** i **cache AI tłumaczeń**.

---

## Czy QuotaExceededError został całkowicie wyeliminowany?

| Aspekt | Status |
|--------|--------|
| Wyjątek nie propaguje z `writeSnapshot()` | ✅ Tak |
| Rozmiar snapshotu ~5× mniejszy | ✅ Tak (~80% redukcja) |
| Retry po cleanup cache | ✅ Tak (1×) |
| Logika powiadomień push | ✅ Bez zmian |
| UI / architektura | ✅ Bez zmian |

**Pełna eliminacja** QuotaExceeded przy ekstremalnym zapełnieniu całego `localStorage` (np. bardzo duży cache OSM + AI + 500+ producentów jednocześnie) nie jest możliwa bez większej refaktoryzacji — ale **główna przyczyna** (snapshot push >2 MB) została usunięta, a zapis jest **odporny na błąd** (graceful degradation).

---

## Pliki zmienione

- `js/core/pushNotifications.js` — v2 snapshot, compact diff, safe writes
- `js/core/safeStorage.js` — **nowy** moduł QuotaExceeded + cleanup
- `scripts/audit-push-snapshot-quota.mjs` — pomiar przed/po
- `scripts/test-push-notifications.mjs` — test compact diff + rozmiaru
