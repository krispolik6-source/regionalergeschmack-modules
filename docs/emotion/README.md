# Emotion AI (ETAP 25)

Nie: „czy działa”. Nie: „czy jest szybka”.

**Czy ta aplikacja wywołuje emocje?**  
**Czy chce się do niej wrócić?**

## Co ocenia

| Wymiar | Pytanie |
|--------|---------|
| climate | Czy jest klimat / atmosfera regionu? |
| colors | Czy kolory są ciepłe i markowe? |
| photos | Czy zdjęcia budzą smak i miejsce? |
| textLoad | Czy tekst nie dusi ekranu? |
| fatigue | Czy użytkownik się nie męczy? |
| friendliness | Czy ekran jest przyjazny? |

Na końcu: **wantToReturn** — score + ludzka odpowiedź.

## Polityka

- **autoFix: false**
- Advisory only — nie zmienia kodu ani architektury
- Opt-in / dev

## Przeglądarka

```js
__RG_EMOTION__.run()
__RG_EMOTION__.export()
```

Panel Health (dev) → **Emotion AI**.

## CLI

```bash
npm run emotion
npm run emotion -- --import=emotion-dump.json
npm run check:emotion
```

→ `docs/emotion/latest.md`
