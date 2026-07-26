# ETAP 34C — Developer Report Manager

**Data:** 2026-07-22  
**Polityka:** `autoApply=false` · `autoFix=false`  
**Werdykt:** **PASS**

---

## Cel

Rozbudowa Developer Control Center o zarządzanie raportami: kopiowanie, usuwanie z potwierdzeniem, utrzymanie katalogu `docs/`.

---

## Wykonane zmiany

1. **UI Control Center** (`developerVaultPanel.js`)
   - Przy każdym raporcie (Raporty + Inteligencja): **📋 Kopiuj raport**, **🗑 Usuń raport**
   - Sekcja **Utrzymanie → Zarządzanie raportami**:
     - Usuń stare raporty (30 dni **lub** ostatnich 20 / moduł)
     - Odśwież listę raportów
     - Pokaż rozmiar katalogu docs
     - Liczba wszystkich raportów
     - Lista plików z Kopiuj / Usuń
2. **Kopiowanie** — pełna treść `.md` (fallback `.json`) → schowek → toast **„Raport skopiowany”**
3. **Usuwanie** — `window.confirm` przed kasowaniem; wyłącznie ścieżki `docs/`
4. **Core Node** `scripts/lib/report-manager-core.mjs` — walidacja ścieżek, cleanup, stats, index
5. **CLI** `npm run report-manager` — `index | stats | list | read | delete | cleanup`
6. **Lokalne API** `npm run report-manager:api` — `127.0.0.1:3457` (wymagane do delete/cleanup z UI)
7. **Index** `docs/dev-center/reports-index.json` (odczyt offline listy / stats)

### Chronione (nigdy)

`js/` · `css/` · `assets/` · `index.html` · `manifest.json` · `sw.js` · `package.json` · `docs/brand/` · stałe README/POLICY

### Auto-czyszczenie

- starsze niż 30 dni **lub** keep-last-20 / moduł  
- **nie usuwa** `latest.md` / `latest.json`

---

## Niewykonane zmiany (świadomie)

| Obszar | Powód |
|--------|--------|
| Home · Mapa · GPS · Premium · PWA | poza zakresem |
| `app.js` · EventBus · routing · logika aplikacji | poza zakresem |
| Usuwanie bez lokalnego API w czystym `npx serve` | przeglądarka nie ma FS — API localhost |
| Auto-delete bez potwierdzenia | zabronione / autoFix=false |
| Kasowanie poza `docs/` | zabronione |

---

## Znalezione problemy

| # | Problem | Status |
|---|---------|--------|
| 1 | Przeglądarka nie może usuwać plików z dysku | **WARNING** — delete/cleanup wymaga `npm run report-manager:api` |
| 2 | Kopiowanie działa bez API (fetch `/docs/...`) | OK |

---

## Testy

| Komenda | Wynik |
|---------|--------|
| `npm run check:report-manager` | **PASS** |
| `npm run check:dev-vault` | **PASS** |
| `node --check` vault + client | **PASS** |

---

## PASS / WARNING / FAIL

| Kryterium | Wynik |
|-----------|--------|
| Kopiuj + toast | **PASS** |
| Usuń z potwierdzeniem (docs only) | **PASS** |
| Utrzymanie — 4 akcje | **PASS** |
| Auto cleanup bez latest.* | **PASS** |
| Blokada js/css/assets/index/… | **PASS** |
| Bez zmian Home/Map/app.js | **PASS** |
| Delete w UI bez uruchomionego API | **WARNING** (świadome ograniczenie) |

### Podsumowanie etapu: **PASS**

(z **WARNING**: usuwanie z panelu wymaga lokalnego API właściciela)

---

## Użycie (właściciel)

```bash
npm run report-manager -- index
npm run report-manager:api
# w aplikacji: ☰ → Panel deweloperski → PIN → Raporty / Utrzymanie
```

CLI bez UI:

```bash
npm run report-manager -- cleanup --mode older-30 --yes
npm run report-manager -- cleanup --mode keep-20 --yes
npm run report-manager -- delete --path docs/health/health-….json --yes
```

---

## Lista zmodyfikowanych / nowych plików

| Plik | Rodzaj |
|------|--------|
| `js/diagnostics/developerVaultPanel.js` | UI 34C |
| `js/diagnostics/reportManagerClient.js` | **nowy** klient |
| `scripts/lib/report-manager-core.mjs` | **nowy** core |
| `scripts/report-manager.mjs` | **nowy** CLI |
| `scripts/dev-report-api.mjs` | **nowy** API localhost |
| `scripts/test-report-manager.mjs` | **nowy** testy |
| `scripts/test-dev-vault.mjs` | asercje 34C |
| `package.json` | npm scripts |
| `docs/dev-center/reports-index.json` | index |
| `docs/dev-center/ETAP-34C.md` | ten raport |

**Nietknięte:** `js/app.js`, mapa, GPS, Premium, PWA, EventBus, Store, routing.

---

`autoApply=false` · `autoFix=false`
