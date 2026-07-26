# AI Quality Loop (ETAP 23)

Codzienna pętla jakości — **orkiestracja diagnostyk**, bez auto-fixów.

## Pipeline

```
AI Guardian
    ↓
Health
    ↓
Virtual User
    ↓
Learning (browser-local; CLI bierze sygnały pośrednio)
    ↓
Improvement
    ↓
Project Advisor
    ↓
Emotion → Living Brand → Product Director
    ↓
raport Quality Loop
    ↓
porównanie z wczoraj → regresje → poprawki (pending_approval)
    ↓
Daily Developer Mail (ETAP 28D — tylko właściciel)
    ↓
AI Dream Mode (ETAP 29A — Product Owner, bez zmian kodu)
    ↓
Regional Intelligence (ETAP 29B — gospodarz regionu, 1 rekomendacja)
    ↓
Brand Protection AI (ETAP 29C — Brand Book, bez zmian kodu)
    ↓
Product Brain (ETAP 29D — 3 propozycje na jutro, bez wdrożenia)
    ↓
Self Reflection (ETAP 29E — samoocena dnia, bez zmian kodu)
    ↓
Guardian of the Future (ETAP 30 — trendy + prognozy, bez zmian kodu)
```

## Polityka

- **autoApply: false** — pętla nigdy nie zmienia kodu aplikacji
- **autoCommit: false**
- **requiresHumanAcceptance: true** — Ty tylko zatwierdzasz
- Store / EventBus / API / GPS / Leaflet / routing — nietknięte

## CLI

```bash
npm run quality-loop
npm run quality-loop -- --skip-guardian   # szybszy przebieg bez Guardian
npm run quality-loop -- --skip-mail       # bez Daily Developer Mail
npm run quality-loop -- --skip-dream      # bez AI Dream Mode
npm run quality-loop -- --skip-regional   # bez Regional Intelligence
npm run quality-loop -- --skip-brand-protection
npm run quality-loop -- --skip-brain
npm run quality-loop -- --skip-reflect
npm run quality-loop -- --skip-future
npm run quality-loop -- --dry-run         # tylko agregacja istniejących docs/*
npm run check:quality-loop
```

SMTP / instrukcja maila: [`docs/daily/DEVELOPER-MAIL.md`](../daily/DEVELOPER-MAIL.md)  
Dream Mode: [`docs/dream/README.md`](../dream/README.md) · `npm run dream`  
Regional Intelligence: [`docs/regional-intelligence/README.md`](../regional-intelligence/README.md) · `npm run regional`  
Brand Protection: [`docs/brand-protection/README.md`](../brand-protection/README.md) · `npm run brand-protection`  
Product Brain: [`docs/product-brain/README.md`](../product-brain/README.md) · `npm run brain`  
Self Reflection: [`docs/self-reflection/README.md`](../self-reflection/README.md) · `npm run reflect`  
Guardian of the Future: [`docs/guardian-future/README.md`](../guardian-future/README.md) · `npm run future`

## Pliki wyjściowe

| Plik | Opis |
|------|------|
| `latest.json` / `latest.md` | Dzisiejszy raport pętli |
| `YYYY-MM-DD.json` / `.md` | Archiwum dnia |
| `fixes-pending.json` | Lista poprawek do zatwierdzenia |
| `approvals.json` | Twoje decyzje (ręcznie) |

## Jak zatwierdzać

1. Przejrzyj `fixes-pending.json` / `latest.md`
2. Wybierz ID (`QL-FIX-001` …)
3. Wpisz w `approvals.json` → `approvedIds` / `rejectedIds`
4. Wdróż zatwierdzone poprawki ręcznie (Cursor / PR) — **nie ma auto-patch**
