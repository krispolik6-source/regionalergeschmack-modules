# AI Guardian (dev-only)

Lokalne narzędzie developerskie dla **Regionaler Geschmack**.

## Polityka (twarda)

- **Nigdy** nie zmienia kodu aplikacji automatycznie  
- **Nigdy** nie tworzy commitów  
- **Nigdy** nie publikuje  
- **Nigdy** nie aplikuje patchy bez akceptacji człowieka  
- **Nie wpływa** na użytkowników produkcyjnych  

Działa jako obserwator: skan → analiza → raport → propozycje.

## Moduły

1. **Code Guardian** – składnia, listenery, race, fetch, SW/PWA, cache, i18n  
2. **UX Guardian** – heurystyki touch/kontrast/motion/responsive + checklista symulacji  
3. **Behavior Guardian** – anonimowe statystyki lokalne (opt-in probe)  
4. **Content Guardian** – zdjęcia, ikony, placeholdery, kolory  
5. **Performance Guardian** – rozmiary JS/CSS/obrazów, lazy, SW  
6. **Improvement Engine** – Krytyczne / Wysokie / Średnie / Kosmetyczne + patche `proposed`  
7. **Self Learning** – historia raportów, recurring issues, hot files  

## Uruchomienie

```bash
npm run guardian
# lub
npm run guardian -- run
```

Raporty:

- `tools/ai-guardian/reports/latest.html`
- `tools/ai-guardian/reports/latest.md`
- `tools/ai-guardian/reports/latest.json`
- `tools/ai-guardian/reports/latest.patches.json`

## Behavior probe (opcjonalnie)

Tylko na `localhost` / `127.0.0.1` i po jawnym opt-in:

```js
localStorage.setItem('rg_ai_guardian_probe', '1');
location.reload();
```

Eksport z konsoli:

```js
copy(JSON.stringify(window.__RG_AI_GUARDIAN__.export(), null, 2));
```

Import do Guardiana:

```bash
npm run guardian -- behavior:import --file=dump.json
npm run guardian -- run
```

Wyłączenie:

```js
localStorage.removeItem('rg_ai_guardian_probe');
```

Probe **nie zbiera** imion, e-maili ani współrzędnych GPS i **nie wysyła** danych na serwer.

## Patche

Każdy patch ma `status: "proposed"` i `requiresHumanAcceptance: true`.  
Guardian przygotowuje listę – **Ty** decydujesz, czy i kiedy wprowadzić zmianę.
