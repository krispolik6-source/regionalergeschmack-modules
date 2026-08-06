# Plan testów urządzeń — Regionaler Geschmack

**ETAP 43 · Zadanie 1**  
**Status:** pending_acceptance · autoApply=false  
**Data:** 2026-08-06

> Pełny plan testów na **prawdziwych urządzeniach**. Testy automatyczne (`npm run check:etap-42g`) to **bramka wstępna** — nie zastępują tego planu.

---

## 1. Cel

Potwierdzić, że aplikacja działa jak dla **prawdziwego użytkownika** na:

| Platforma | Przeglądarki | Form factor |
|-----------|--------------|-------------|
| **iPhone** | Safari, **PWA** | Telefon |
| **Android** | Chrome, **Samsung Internet**, **PWA** | Telefon |
| **Desktop** | Chrome, Edge, Firefox | Monitor |
| **Tablet** | Safari (iPad), Chrome | Tablet |

Bez DevTools jako jedynego źródła prawdy — dotyk, scroll, GPS, offline, instalacja PWA.

---

## 2. Środowiska

| ID | URL | Kiedy | Priorytet |
|----|-----|-------|-----------|
| **prod** | `https://regionalergeschmack.netlify.app/` | Release · PWA · offline · brak diag | **P0** |
| **lan** | `http://192.168.x.x:3456/` (`npm start`) | Dev Vault · PIN · Error Feed | **P0** |
| **localhost** | `http://localhost:3456/` | Smoke desktop · szybka regresja | P1 |

**LAN:** komputer i telefon w tej samej sieci Wi‑Fi; firewall Windows zezwala na port 3456.

---

## 3. Matryca platforma × przeglądarka

### 3.1 iPhone

| Urządzenie | Safari | PWA | Priorytet |
|------------|:------:|:---:|:---------:|
| iPhone SE (375px) | ✅ | ✅ | P0 — mały viewport |
| iPhone 13/14 (390px) | ✅ | ✅ | P0 |
| iPhone 15 Pro Max (430px) | ✅ | ✅ | P1 — notch / safe-area |

**Safari-only:** Add to Home Screen, safe-area, brak beforeinstallprompt, limity SW storage.

### 3.2 Android

| Urządzenie | Chrome | Samsung Internet | PWA | Priorytet |
|------------|:------:|:----------------:|:---:|:---------:|
| Galaxy S24 / A54 | ✅ | ✅ | ✅ | P0 |
| Pixel 7 / 9 | ✅ | — | ✅ | P1 |

**Samsung Internet:** domyślna przeglądarka na Galaxy — obowiązkowy smoke mapy, GPS, menu ☰.

### 3.3 Desktop

| Viewport | Chrome | Edge | Firefox | Priorytet |
|----------|:------:|:----:|:-------:|:---------:|
| 1280×720 | ✅ | ✅ | ✅ | P0 |
| 1920×1080 | ✅ | P1 | P1 | P1 |
| Ultrawide 2560+ | P1 | — | — | P2 |

**Firefox:** brak natywnego install prompt — testuj tylko w trybie kart (nie PWA), SW nadal działa.

### 3.4 Tablet

| Urządzenie | Safari | Chrome | PWA | Priorytet |
|------------|:------:|:------:|:---:|:---------:|
| iPad (~820px) | ✅ | — | P1 | P1 |
| Android tablet (~800px) | — | ✅ | P1 | P1 |

**Uwaga:** layout phone-first — dużo pustej przestrzeni OK; sprawdź mapę i menu ☰.

### 3.5 PWA (standalone)

| Platforma | Instalacja | Update | Reinstall | Priorytet |
|-----------|------------|--------|-----------|:---------:|
| iPhone | Udostępnij → Do ekranu początkowego | Po deploy | Usuń ikonę → dodaj | **P0** |
| Android Chrome | Zainstaluj aplikację / banner | Po deploy | Wyczyść dane / odinstaluj | **P0** |
| Desktop Chrome | Install w pasku URL | Po deploy | Odinstaluj z chrome://apps | P1 |

---

## 4. Minimalne pokrycie przed release (P0)

Wykonaj **minimum** przed podpisaniem certyfikacji:

- [ ] **iPhone** — Safari + PWA standalone
- [ ] **Android** — Chrome + PWA standalone
- [ ] **Android** — Samsung Internet (1× Galaxy)
- [ ] **Desktop** — Chrome
- [ ] **Desktop** — Firefox **lub** Edge (1×)
- [ ] **Tablet** — iPad Safari **lub** Android Chrome (1×)
- [ ] **Produkcja** — cold start PWA bez `?dev=1` (1× telefon)

---

## 5. Pakiety testów (suites)

### S01 — Instalacja i pierwsze uruchomienie · **P0**

| Krok | Oczekiwany wynik |
|------|------------------|
| Otwórz prod / LAN | Splash → Home, bez białego ekranu |
| Cookie banner | Akceptuj / odrzuć — banner znika |
| UTF-8 | Ceny, „Regionaler Geschmack”, menu ☰ — bez `` |
| Bottom nav | 5 ikon, aktywna Home |

**Platformy:** wszystkie.

---

### S02 — Nawigacja core (7 ekranów) · **P0**

| Ekran | Akcje | Pass |
|-------|-------|------|
| Home | Kategorie, wyszukiwanie, scroll | Treść czytelna, CTA działają |
| Mapa | Filtr, lista, popup producenta | Leaflet, markery, brak horizontal scroll |
| Premium | CTA, trial (jeśli dotyczy) | Bez crash |
| Ulubione | Dodaj/usuń (z mapy) | Badge aktualny |
| Koszyk | Dodaj, badge | Persist po reload |
| Profil | Login / ustawienia | Modal auth |
| ☰ Menu | Otwórz/zamknij, legal, kontakt | Side menu slide |

**Platformy:** wszystkie · na telefonie **tylko kciuk**, bez myszy.

---

### S03 — Mapa · GPS · offline · **P0**

| Krok | iPhone | Android | Desktop |
|------|--------|---------|---------|
| Zezwól na lokalizację | System prompt iOS | System prompt Android | Browser prompt |
| „W pobliżu” / GPS | Mapa centruje | j.w. | j.w. |
| Tryb offline | Wi‑Fi off → banner | j.w. | DevTools offline |
| Powrót online | Banner znika, mapa żyje | j.w. | j.w. |
| Popup + toolbar | Nie zasłonięty (SE!) | j.w. | N/A |

**Przeglądarki:** Chrome, Safari, **Samsung Internet** (Android P0).

---

### S04 — PWA lifecycle · **P0**

| Faza | Kroki | Pass |
|------|-------|------|
| Install | Banner / menu → ikona na pulpicie | Ikona master (dwa kłosy) |
| Standalone | Uruchom z ikony — bez paska URL | `display: standalone` |
| Update | Deploy v30+ → reload / skipWaiting | Nowa wersja, brak v28/v29 |
| Offline w PWA | Tryb samolotowy → Home/Map cache | Banner offline |
| Reinstall | Usuń PWA → zainstaluj ponownie | Czysty start, dane użytkownika OK |

**ETAP 42A/B** — wersja i ikony.

---

### S05 — Manifest · SW · ikony v30 · **P0**

| Powierzchnia | Gdzie sprawdzić | Pass |
|--------------|-----------------|------|
| SW script | DevTools → Application (desktop/LAN) | `sw.js?v=30` |
| Manifest | Ikony `?v=30` | Wszystkie rozmiary |
| Favicon | Tab browser | Aktualny |
| Launcher | Ekran domowy | Po update bez reinstall |
| Splash | Cold start PWA | Logo master |
| Push icon | Powiadomienie (jeśli wł.) | `?v=30` |

---

### S06 — Język · motyw · **P0**

| Test | Kroki | Pass |
|------|-------|------|
| Język DE→EN→PL | ☰ → język → Mapa/Home etykiety | Persist po reload |
| Dark mode | Toggle ☰ / ustawienia | Home, mapa, ulubione czytelne |
| Safe-area | Notch phone, PWA | Header/footer nie pod notch |

---

### S07 — Premium · persist · **P1**

| Test | Pass |
|------|------|
| Wejście Premium z Home / menu | Ekran się ładuje |
| Zamknij app → następnego dnia | Ustawienia, ulubione, koszyk, GPS prefs |

---

### S08 — Dev Vault · PIN · **P0** (właściciel)

| Krok | Pass |
|------|------|
| ☰ → **Panel deweloperski** — widoczny zawsze (nie tylko localhost) | ✅ |
| Zły PIN → błąd, bramka | ✅ |
| PIN **1973** → Control Center fullscreen | ✅ |
| Telefon + LAN + PWA — ten sam flow | ✅ |
| Zablokuj → wymaga PIN ponownie | ✅ |

**ETAP 42C** · testuj na **LAN telefon** i **prod PWA**.

---

### S09 — Produkcja bez kosztu diagnostyki · **P0**

| Krok | Pass |
|------|------|
| Prod URL **bez** `?dev=1` | Brak FAB Health/Dashboard |
| Cold start | Mapa, koszyk, premium działają |
| Dopiero PIN → lazy load diag | Control Center po odblokowaniu |

**ETAP 42D** · widoczne tylko na prod / PWA użytkownika.

---

### S10 — Runtime Error Feed · **P1**

| Krok | Pass |
|------|------|
| PIN → **Runtime Error Feed** | Panel fullscreen |
| Chipy kategorii — scroll poziomy | Mobile OK |
| Tap wpis → stack | Bez DevTools |
| Odśwież · Kopiuj · Zamknij | Touch 44px |

**ETAP 42E** · iPhone PWA + Android.

---

### S11 — Bootstrap · cold start · **P1**

| Krok | Pass |
|------|------|
| Force-quit PWA → start | Splash → Home < 3s subiektywnie |
| Brak „zawieszenia” po splash | ETAP 42F |
| Opcjonalnie `?dev=1` → `__RG_BOOTSTRAP__.report()` | bootstrapMs ~50ms shell |

---

### S12 — Specyfika przeglądarek · **P1**

| Przeglądarka | Co sprawdzić | Ryzyko |
|--------------|--------------|--------|
| **Safari iOS** | PWA install, SW, safe-area, scroll bounce | SW quota, brak push na iOS <16.4 |
| **Samsung Internet** | Mapa Leaflet, GPS, menu ☰ | Inny UA, adblock |
| **Firefox desktop** | Core S02, mapa, offline (SW) | Brak install prompt |
| **Edge desktop** | Core S02, PWA install (Chromium) | Secondary |
| **Chrome Android** | Install prompt, PWA, push | Referencja |

---

## 6. Macierz wykonania (skrót)

Oznacz: ✅ pass · ⚠️ warn · ❌ fail · — skip

| Suite | iPhone Safari | iPhone PWA | Android Chrome | Android Samsung | Android PWA | Desktop Chrome | Desktop Edge | Desktop Firefox | iPad | Android tablet |
|-------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| S01 Install | | | | | | | | | | |
| S02 Nav | | | | | | | | | | |
| S03 Map/GPS | | | | | | — | — | — | | |
| S04 PWA life | | | | | | | P1 | — | P1 | P1 |
| S05 Icons v30 | | | | | | | | | | |
| S06 i18n/theme | | | | | | | | | | |
| S07 Premium | | | | | | | | | | |
| S08 Dev Vault | | | | | LAN | | | | P1 | P1 |
| S09 Prod diag | | | | | | — | — | — | — | — |
| S10 Error feed | | | | | | — | — | — | — | — |
| S11 Bootstrap | | | | | | | | | | |
| S12 Browser quirks | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 7. Kolejność wykonania (1 sesja ~90 min)

1. **Automaty:** `npm run check:etap-42g` → musi być PASS  
2. **Desktop Chrome** — S01–S02 (15 min)  
3. **LAN + telefon Android Chrome** — S03, S08 (20 min)  
4. **Android Samsung Internet** — S03, S02 (15 min)  
5. **iPhone Safari** — S02, S03 (15 min)  
6. **iPhone PWA + Android PWA** — S04, S05, S09, S11 (25 min)  
7. **Desktop Firefox lub Edge** — S02, S12 (10 min)  
8. **Tablet** — S02, S03 (10 min)  
9. **Sign-off** — wypełnij JSON, `npm run etap-43-certification`

---

## 8. Raportowanie defektów

Przy **fail** zapisz:

```
Platforma: Android / Samsung S24
Przeglądarka: Samsung Internet 25
Suite: S03
Krok: GPS — mapa nie centruje
Oczekiwane: …
Rzeczywiste: …
Zrzut: (opcjonalnie)
```

Severity: **Blocker** (release stop) · **Major** · **Minor** · **Cosmetic**

**Blocker na release:** crash, brak mapy/GPS, PWA nie instaluje, prod pokazuje FAB diag, PIN nie działa na telefonie.

---

## 9. Sign-off

1. Wypełnij [`manual-device-results.template.json`](manual-device-results.template.json) → zapisz jako `manual-device-results.json`
2. Uruchom: `npm run etap-43-certification`
3. Werdykt **CERTIFIED** gdy auto 9/9 + manual 8/8 ETAP 42 + macierz P0 wypełniona

---

## 10. Powiązane dokumenty

| Dokument | Rola |
|----------|------|
| [`DEVICE-TEST-PLAN.json`](DEVICE-TEST-PLAN.json) | Maszyna — matryca platform |
| [`../audit/ETAP-37-DEVICE-LAB.md`](../audit/ETAP-37-DEVICE-LAB.md) | Static device lab (CI) |
| [`../final/ETAP-43-RELEASE-CERTIFICATION.md`](../final/ETAP-43-RELEASE-CERTIFICATION.md) | Certyfikacja release |
| [`../bootstrap/latest.md`](../bootstrap/latest.md) | ETAP 42F bootstrap |

---

*ETAP 43 T1 · Plan testów urządzeń · pending_acceptance · autoApply=false*
