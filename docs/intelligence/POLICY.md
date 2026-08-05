# Polityka inteligencji (od ETAP 33E)

**Źródło kodu:** `js/intelligence/policy.js`  
**Zakres:** wszystkie moduły w `js/intelligence/` oraz przyszłe raporty AI produktu.

## Zasady

1. Aplikacja ma być **inteligentna, ale dyskretna**.
2. Użytkownik **nie może** mieć wrażenia rozmowy z AI.
3. AI **nigdy** nie zastępuje prostego interfejsu.
4. AI ma **pomagać, przewidywać i doradzać**.
5. AI **nie wykonuje** automatycznych zmian w kodzie ani danych (`autoApply=false`, `autoFix=false`).
6. **Wszystkie decyzje** są raportowane właścicielowi (Markdown/JSON w `docs/`).
7. Priorytetem jest **prostota, szybkość i klimat** regionalnego produktu.
8. Każda nowa propozycja musi **zwiększać wartość** aplikacji, a nie liczbę funkcji.

## Twarde zakazy

| Zakaz | Flaga |
|-------|--------|
| Chatbot / rozmowa AI | `chatbot`, `conversationUi`, `aiWindow` |
| Popup / okno AI | `popups`, `aiWindow` |
| Auto-zmiany kodu / danych | `autoApply`, `autoFix`, `mutatesAppCode`, `mutatesProducerData` |
| Zastępowanie prostego UI | `replacesSimpleUi`, `uiChanges` |

## Co wolno

- Analiza lokalna i synteza sygnałów
- Score / pulse / trust / taste (raport)
- Max N propozycji z `pending_acceptance`
- Jedno dyskretne zdanie klimatu (Living Region) — **tylko w raporcie**, dopóki właściciel nie zaakceptuje ujawnienia w UI

## Test propozycji

`proposalTest: increases-value-not-feature-count`  
Implementacja: `passesValueNotFeatureTest()` w `policy.js`.

## Moduły objęte

| Moduł | Etap |
|-------|------|
| `regionalBrain.js` | 33A |
| `userTasteProfile.js` | 33B |
| `producerTrustAudit.js` | 33C |
| `productIntelligenceDaily.js` | 33D |
| `livingRegionAi.js` | 33E |
| `policy.js` | wspólna baza |

---

## Self-Healing System (2026-08)

**Kod:** `js/core/selfHealingLogger.js` · `js/core/selfHealingFixer.js` · `js/diagnostics/selfHealing.js`  
**Inicjalizacja:** `initSelfHealingLogger()` w `js/app.js` (bootstrap)

### Zakres

| Warstwa | Plik | Co robi |
|---------|------|---------|
| Logger krytycznych błędów | `selfHealingLogger.js` | Tylko UI freeze, QuotaExceeded, krytyczne API (Overpass itd.) — bez szumu assetów |
| Retention 30 dni | `selfHealingLogger.js` | `cleanupOldReports()` — `selfHealingLog`, `healingReport`, markdown `logs/system_health_[DATA].md` |
| Raport sesji | `healingReport` (localStorage) | Statusy: **FIXED** ✅ · **SUGGESTION** 🟡 · **FAILED** 🔴 |
| Bezpieczne mitigacje | `selfHealingFixer.js` | Whitelist runtime (modal, quota-trim, retry fetch) — **bez eval**, bez zmian HTML |
| AI asystent | `selfHealingLogger.js` | Propozycje ze statusem `pending_acceptance` — **nigdy auto-wdrażanie kodu z sieci** |
| UI (dyskretny) | ☰ → Über die App → Systemstatus | Lista wpisów raportu — bez wrażenia chatbota AI |

### Polityka (zgodna z tym dokumentem)

- `autoApply: false` · `autoFix: false` · `usesEval: false`
- `mutatesHtml: false` · `mutatesUserData: false`
- Opcjonalne OpenAI: tylko gdy właściciel włączy `rg_self_heal_ai_config` w localStorage
- Debug (dev): `window.__RG_SELF_HEALING_LOG__`

### Klucze localStorage

| Klucz | Opis | Limit |
|-------|------|-------|
| `selfHealingLog` | Surowe błędy krytyczne | ~1 MB |
| `healingReport` | Kolorowy raport sesji | 200 wpisów |
| `logs/system_health_YYYY-MM-DD.md` | Dzienne podsumowanie markdown | retention 30 dni |

### Test

```bash
node scripts/test-self-healing-logger.mjs
```
