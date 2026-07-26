# AI Product Director – codzienny przegląd produktu

Dzień: **2026-07-21**
Wygenerowano: 2026-07-21T17:01:20.103Z
Product score: **92%**

## Headline

[medium] Popraw UX / Mobile

## Priorytety dnia

- [medium] Popraw UX / Mobile
- Obce fonty (Inter / Roboto…) z landing / warstw CSS — zostaw Literata + Source Sans 3
- Pierwszy viewport Home: jedna obietnica + jedno CTA (mapa lub „Dla Ciebie”)

## 8 pytań Product Directora

### Co poprawić?

• [medium] Popraw UX / Mobile
• [medium] Potencjalne konflikty CSS: 40
• [medium] Uporządkuj konflikty CSS (40)
• Spójność marki (Living Brand 81%): Dryf marki — coś odbiega od Brand Book. Nie auto-fix: zgłoszono do zatwierdzenia.
• Persona P08 (Starszy Samsung) — 80%
• UX Health 85% — ergonomia pierwszego viewportu

_confidence: high · sources: improvement, living-brand, emotion, real-users_

### Co usunąć?

• Obce fonty (Inter / Roboto…) z landing / warstw CSS — zostaw Literata + Source Sans 3
• Konkurujące CTA / bloki na Home, które męczą zamiast witać
• Szum produktowy: sekcje Home bez jednej dominującej akcji (przytnij, nie doklejaj)

_confidence: medium · sources: living-brand, emotion, improvement_

### Co uprościć?

• Pierwszy viewport Home: jedna obietnica + jedno CTA (mapa lub „Dla Ciebie”)
• Premium: jedna jasna wartość, bez ściany benefitów

_confidence: high · sources: emotion, real-users, expert-review_

### Co spowalnia aplikację?

• Brak alarmu wydajności — pilnuj mapy i Home przy kolejnych feature’ach

_confidence: medium · sources: health, virtual-user, daily_

### Co denerwuje użytkownika?

• Tarcia persony: P08 — Starszy Samsung

_confidence: medium · sources: virtual-user, real-users, advisor_

### Co zwiększy liczbę powrotów?

• Emotion AI powrót 89% — Chce się wracać.
• Wzmacniaj Learning lokalnie — rozpoznawalny Home po 2–3 sesjach
• Ciepły powrót po przerwie (magia powrotu / smaki dnia) — jeden impuls, nie spam
• Ulubione + trasa zakupowa jako kotwica „wróć do mojego regionu”
• Spójna marka (Living Brand) buduje zaufanie — dryf osłabia chęć powrotu

_confidence: high · sources: emotion, learning, living-brand_

### Jak wygląda konkurencja?

• Google Maps: my wygrywamy „Emocja regionu + producenci, nie „kolejny pin”” (oni: Uniwersalna nawigacja wszystkiego, ranking reklamowy…)
• TripAdvisor: my wygrywamy „PWA regionu, nie ranking turystyczny” (oni: Globalne recenzje podróży / restauracji…)
• Yelp: my wygrywamy „Klimat i zaufanie lokalne > katalog” (oni: Katalog biznesów + recenzje miejskie…)
• Too Good To Go: my wygrywamy „Relacja z miejscem, nie tylko okazja last-minute” (oni: Nadwyżki żywności z dyskontem czasowym…)

Dziś Emotion AI wspiera przewagę emocjonalną vs katalogi (Maps/Yelp).

_confidence: high · sources: master-report, emotion, positioning_

### Czy produkt jest lepszy niż miesiąc temu?

Dziś ustalamy baseline produktScore: 92%. Za miesiąc Director odpowie porównaniem. Archiwum: docs/product-director/.

_confidence: low · sources: product-director-archive, health, emotion, daily_

## Snapshot

- Health: 98
- Daily app: 96
- Emotion return: 89
- Living Brand: 81
- Virtual User: —
- Real Users avg: 97

## Polityka

- autoFix: false
- To przegląd biznesowy — nie patch kodu
- To briefing biznesowy. Żadna poprawka nie jest wdrażana automatycznie — Ty decydujesz.

## Uruchomienie

```bash
npm run director
```

`__RG_DIRECTOR__.run()` · Panel Dev → Product Director
