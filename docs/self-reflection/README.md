# Self Reflection (ETAP 29E)

Raz dziennie aplikacja **ocenia samą siebie** — nie tylko błędy.

## Pytania

- Czy jest piękna?
- Czy jest intuicyjna?
- Czy jest ciepła?
- Czy zachęca do powrotu?
- Czy ekran Home nie jest przeładowany?
- Czy użytkownik odnajdzie producenta w mniej niż 30 sekund?
- Czy aplikacja wygląda lepiej niż tydzień temu?
- Czy marka jest spójna?
- Czy fotografie są autentyczne?
- Czy użytkownik będzie chciał polecić aplikację znajomym?

## Oceny

UX · Brand · Performance · Emotion · Climate · Navigation · Photos · Return Score · **Overall**

Na końcu jedno zdanie:

> Czy chciałbym korzystać z tej aplikacji codziennie?

## Polityka

- **Nie zmienia kodu**
- **Nigdy nie wdraża zmian automatycznie** (`autoApply: false`)

## CLI

```bash
npm run reflect
npm run check:reflect
```

## Pliki

| Plik | Opis |
|------|------|
| `docs/self-reflection/latest.md` | samoocena dnia |
| `js/diagnostics/selfReflectionCore.js` | logika (bez side-effects) |
