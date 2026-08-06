# User Journey Verification — ETAP 43 · Zadanie 6

**Data:** 2026-08-06  
**ETAP:** 45-D · Runtime Truth  
**Gate:** **CONDITIONAL**  
**STATIC:** **STATIC VERIFIED**  
**RUNTIME:** **NOT VERIFIED**

> **STATIC** = wiring nawigacji, store, importy. **RUNTIME** = pełna ścieżka w przeglądarce/PWA.

## Warstwy

| Warstwa | Werdykt |
|---------|---------|
| **STATIC** | **STATIC VERIFIED** (10/10) |
| **RUNTIME** | **NOT VERIFIED** (undefined pending) |
| **Gate** | **CONDITIONAL** |

## Scenariusz — STATIC (kod)

| # | Krok | Warstwa | Status |
|---|------|---------|--------|
| 1 | Otwórz aplikację | static | STATIC VERIFIED |
| 2 | Przejdź Home | static | STATIC VERIFIED |
| 3 | Otwórz mapę | static | STATIC VERIFIED |
| 4 | Otwórz producenta | static | STATIC VERIFIED |
| 5 | Dodaj do ulubionych | static | STATIC VERIFIED |
| 6 | Zmień język | static | STATIC VERIFIED |
| 7 | Wróć | static | STATIC VERIFIED |
| 8 | Zamknij aplikację | static | STATIC VERIFIED |
| 9 | Otwórz ponownie | static | STATIC VERIFIED |
| 10 | Stan zachowany po reopen | static | STATIC VERIFIED |
| 10 | Runtime: ulubione + język po reopen (przeglądarka) | runtime | NOT VERIFIED |

## RUNTIME — Virtual User / persist / pełna ścieżka

| Check | Status |
|-------|--------|
| Virtual User: home-map-producer + favorites + language + restart | NOT VERIFIED |
| Real User Simulation: open-app → map → producer → favorites → language | NOT VERIFIED |

**Klucze LS:** `regionalny_smak_favorites` · `regionalny_smak_settings`

## Bramki automatyczne

| Test | Status |
|------|--------|
| favorites-store | ✅ PASS |
| real-users | ✅ PASS |

## RUNTIME — krok po kroku (urządzenie)

1. **Otwórz aplikację (URL / PWA)** → Splash → Home, bez białego ekranu
2. **Klik 🏠 Home (dolny nav)** → Widok Home aktywny
3. **Klik 🗺️ Mapa** → Mapa Leaflet · markery
4. **Klik marker / producent → modal** → Pełnoekranowy modal producenta
5. **Dodaj do ulubionych (❤️ w modalu)** → Toast · badge ulubionych
6. **Zmień język (nagłówek DE/EN/PL…)** → UI przetłumaczone · LS settings
7. **Wróć (zamknij modal · nav Home)** → Home bez zawieszenia
8. **Zamknij app (force-quit PWA / zamknij kartę)** → —
9. **Otwórz ponownie** → Bootstrap · ten sam język
10. **☰ Ulubione — producent nadal na liście** → Persist favorites + language

## Automatyzacja w przeglądarce

```javascript
// W konsoli (localhost / ?dev=1 / po PIN):
await __RG_VIRTUAL__.run({ scenarios: ['home-map-producer-back','favorites','language'] });
// lub pełna symulacja:
await __RG_REAL_USERS__.runOne(1);

// Hard reload persist (po ręcznym dodaniu ulubionych + zmianie języka):
location.reload();
// Po reload: localStorage.regionalny_smak_favorites · regionalny_smak_settings
```

## Pliki kluczowe

| Plik | Rola |
|------|------|
| `js/app.js` | bootstrap · syncFavoritesOnStartup |
| `js/controllers/navigation.js` | Home · Map · widoki |
| `js/views/producerModal.js` | Modal producenta |
| `js/views/favorites.js` | addFavorite UI |
| `js/core/favoritesStore.js` | Persist ulubionych |
| `js/core/settings.js` | Persist języka |
| `js/diagnostics/virtualUser.js` | __RG_VIRTUAL__.run() |
| `js/diagnostics/realUserSimulation.js` | __RG_REAL_USERS__.run() |

---
*ETAP 43-T6 · autoApply=false · uruchom: `npm run check:user-journey`*
