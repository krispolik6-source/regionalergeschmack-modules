# Audyt localStorage — Regionaler Geschmack

**Data:** 2026-08-02
**Skrypt:** `scripts/audit-localstorage-full.mjs`

---

## Podsumowanie

| Metryka | Wartość |
|---------|---------|
| Limit (szac.) | 5.00 MB |
| Próg cleanup | 80% |
| Zajętość przed cleanup | 3.17 MB (63.5%) |
| Zajętość po cleanup | 466.97 KB (9.1%) |
| Snapshot legacy | 2.75 MB |
| Snapshot v2 (keys[]) | 578.28 KB |
| Snapshot v3 (minimal) | 38.30 KB |
| Zapis v3 bez wyjątku | ✅ |

---

## Rozmiar kluczy (po cleanup, sort. malejąco)

| Klucz | KB |
|-------|-----|
| `rg_ai_i18n_v2` | 404.59 |
| `rg_push_content_snapshot` | 38.32 |
| `rg_console_guardian_v1` | 17.89 |
| `rg_health_log_v1` | 5.69 |
| `rg_favorites_v1` | 0.28 |
| `rg_push_subscription` | 0.06 |
| `regionalny_smak_settings` | 0.06 |
| `rg_cart_v1` | 0.05 |
| `rg_map_prefs_v1` | 0.03 |

---

## Snapshot push — przed / po

| Format | Rozmiar |
|--------|---------|
| Legacy (pełne JSON-klucze) | 2.75 MB |
| v2 (compact keys[]) | 578.28 KB |
| **v3 (minimal — producent hashes)** | **38.30 KB** |

Redukcja v3 vs legacy: **98.6%**

---

## QuotaExceededError

| Test | Wynik |
|------|-------|
| Wykrywanie QuotaExceededError | ✅ |
| safeLocalStorageSetItem nie propaguje wyjątku | ✅ |
| Cleanup przy >80% | ✅ |
| Trim rg_ai_i18n_v2 (LRU/FIFO) | ✅ |

---

## Wdrożone mechanizmy

1. **safeStorage.js** — `measureLocalStorage()`, `ensureLocalStorageHeadroom()` (>80%), cleanup cache/diagnostyki, trim AI.
2. **pushNotifications.js v3** — snapshot bez `keys[]`; max 200 KB → tylko fingerprint.
3. **aiTranslationEngine.js** — max 500 wpisów / 400 KB; LRU po timestamp; `safeLocalStorageSetItem`.
4. **Pominięcie zapisu** snapshotu zamiast QuotaExceededError gdy brak miejsca po cleanup.

---

## Klucze chronione (nie usuwane przez cleanup)

Ustawienia, ulubione, koszyk, map prefs, push subscription, auth, premium, cookie_consent.
