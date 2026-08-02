# ETAP 43 — Memory Cleaner

**Werdykt:** PASS  
**Data:** 2026-08-01

## Cel

Sam pilnuje `localStorage` · Cache API · IndexedDB · starych raportów/logów strażników.  
Pokazuje **Storage Health** i jednym kliknięciem czyści **wyłącznie bezpieczne** dane.

## UI (przykład)

| Metryka | Przykład |
|---------|----------|
| Storage Health | 98% |
| Cache | 34 MB |
| Raporty | 126 |
| Do usunięcia | 43 |

## Bezpieczne do usunięcia

- logi Console / UI / Map Guardian
- Self-Heal log
- learning events LS + nadmiar sygnałów IDB
- historie improvement / dashboard / virtual user
- **stare** cache PWA (nie `rg-pwa-v28` / `rg-runtime-images-v28`)

## Chronione (nigdy)

ustawienia · ulubione · koszyk · Premium · auth · GPS · map prefs · OSM cache · learning model

## API

```js
__RG_MEMORY__.open()
__RG_MEMORY__.health()
__RG_MEMORY__.clean()
```

Dev Vault → Utrzymanie → karta Memory Cleaner.
