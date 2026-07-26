# Virtual User (ETAP 18D)

Wirtualny tester przechodzi kluczowe ścieżki aplikacji i zbiera raport problemów.

## Polityka

- Nie zmienia architektury (Store / EventBus / API / mapa)
- Nie naprawia kodu automatycznie
- Uruchomienie **opt-in** (nie na każdym użytkowniku produkcyjnym)

## Scenariusze

Home → Mapa → Producent → Powrót · wyszukiwanie · GPS · filtry · popup · modal · ulubione · koszyk · profil · premium · język · dark mode · offline · online · soft restart

## Wykrywane problemy

miganie · błędy JS · spadki FPS · memory leak · tłumaczenia · responsywność · dotyk · UX

## Uruchomienie (przeglądarka)

```text
?virtual=1
```
lub konsola:

```js
__RG_VIRTUAL__.run()
__RG_VIRTUAL__.export()  // skopiuj JSON
```

Panel Health (dev) → **Virtual User**.

## Zapis na dysk

```bash
npm run virtual-user
npm run virtual-user -- --import=vu-dump.json
```

→ `docs/virtual-user/latest.md`
