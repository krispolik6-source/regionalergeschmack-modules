# Product Brain (ETAP 29D)

Codziennie: *„Gdybym był właścicielem tej aplikacji, co zrobiłbym jutro?”*

## Czym jest

Analiza przez soczewki:

UX · Mobile · PWA · wydajność · retencja · wygląd · emocje · łatwość obsługi · konkurencja

Następnie **tylko 3** najważniejsze propozycje — każda z:

- wpływ
- ryzyko
- czas wykonania
- oczekiwany efekt

## Czym nie jest

- Nie wdraża zmian
- Nie proponuje więcej niż 3 dziennie
- Czeka na **akceptację właściciela** (`autoApply: false`)

## CLI

```bash
npm run brain
npm run check:brain
```

Po `npm run quality-loop` odpala się automatycznie (`--skip-brain` żeby pominąć).

## Pliki

| Plik | Opis |
|------|------|
| `docs/product-brain/latest.md` | 3 propozycje na jutro |
| `docs/product-brain/pending-acceptance.json` | lista do decyzji właściciela |
| `js/diagnostics/productBrainCore.js` | logika (bez side-effects) |
