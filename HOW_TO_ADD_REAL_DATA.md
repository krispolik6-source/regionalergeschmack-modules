# Jak dodać prawdziwych niemieckich producentów

Ten przewodnik opisuje, w jakim formacie przygotować dane producentów, aby wkleić je do aplikacji **Regionaler Geschmack**.

> **Stan na dziś:** aplikacja nie zawiera żadnych producentów demo. Lista w `js/data/producerData.js` jest pusta – czeka na Twoje wpisy.

---

## 1. Gdzie wklejać dane

| Plik | Rola |
|------|------|
| **`js/data/producerData.js`** | **Tu wklejasz producentów** – tablica `PRODUCERS` |
| `js/data/contentProducers.js` | Automatycznie importuje z `producerData.js` – **nie edytuj ręcznie** |
| **`assets/images/producers/`** | Zdjęcia prawdziwych producentów (WebP lub JPG) |

Po zapisaniu pliku odśwież aplikację w przeglądarce (Ctrl+F5). Jeśli widzisz stare dane, wyczyść cache PWA / localStorage.

---

## 2. Wymagany format jednego producenta

Każdy wpis to obiekt JavaScript z **dokładnie tymi polami**:

| Pole | Typ | Przykład | Uwagi |
|------|-----|----------|-------|
| `id` | string lub number | `'baeckerei-schmidt-osnabrueck'` | Unikalny, bez spacji; małe litery i myślniki |
| `name` | string | `'Bäckerei Schmidt'` | Nazwa wyświetlana w aplikacji |
| `category` | string | `'Bäckerei'` | Patrz tabela kategorii poniżej |
| `lat` | number | `52.2799` | Szerokość geogr. (GPS) |
| `lng` | number | `8.0472` | Długość geogr. (GPS) |
| `imageUrl` | string | `'assets/images/producers/baeckerei-schmidt.webp'` | Ścieżka względem katalogu głównego projektu |
| `description` | string | `'Handwerksbäckerei mit Sauerteigbrot…'` | Krótki opis **po niemiecku** (1–2 zdania) |
| `address` | string | `'Marktstraße 4, 49074 Osnabrück'` | Ulica, kod pocztowy, miasto |
| `hours` | string | `'Mo-Fr 08:00-18:00; Sa 08:00-14:00'` | Godziny otwarcia w jednej linii |
| `products` | string[] | `['Brot', 'Brötchen', 'Croissants']` | Lista produktów / usług po niemiecku |

### Wzór w pliku (skopiuj i wypełnij)

W `js/data/producerData.js` znajdziesz gotowy szablon w komentarzu. Po wypełnieniu wklej obiekt **do tablicy** `PRODUCERS`:

```javascript
export const PRODUCERS = Object.freeze([
    {
        id: 'baeckerei-schmidt-osnabrueck',
        name: 'Bäckerei Schmidt',
        category: 'Bäckerei',
        lat: 52.2799,
        lng: 8.0472,
        imageUrl: 'assets/images/producers/baeckerei-schmidt.webp',
        description: 'Handwerksbäckerei mit Sauerteigbrot und frischen Brötchen.',
        address: 'Marktstraße 4, 49074 Osnabrück',
        hours: 'Mo-Fr 06:00-18:00; Sa 06:00-14:00',
        products: ['Brot', 'Brötchen', 'Croissants']
    }
    // kolejny producent…
]);
```

---

## 3. Kategorie (`category`)

Możesz używać **niemieckich nazw** (zalecane przy pracy w Excelu) lub **kluczy technicznych**:

| Wpisujesz (DE) | Klucz techniczny | Sekcja w aplikacji |
|----------------|------------------|---------------------|
| Bäckerei | `bakery` | Piekarnie |
| Metzgerei, Fleischerei | `meat` | Mięso |
| Hof, Bauernhof, Imkerei | `farmer` | Rolnicy |
| Molkerei, Laden | `shop` | Sklepy |
| Restaurant, Gasthof | `restaurant` | Restauracje |
| Imbiss | `fast_food` | Fast food |
| Automaten | `vending` | Automaty |

---

## 4. Zdjęcia producentów

1. Przygotuj zdjęcie w formacie **WebP** (zalecane) lub **JPG**.
2. Zapisz w folderze **`assets/images/producers/`**.
3. Nazwa pliku = slug z `id` producenta, np. `baeckerei-schmidt-osnabrueck.webp`.
4. W polu `imageUrl` podaj: `assets/images/producers/nazwa-pliku.webp`.

**Wymagania:**
- Poziome lub kwadratowe ujęcie (min. ok. 800×600 px).
- Prawdziwe zdjęcie lokalu / produktu – bez stocków demo.
- Nie zmieniaj logo ani kolorów marki aplikacji – dotyczy to tylko zdjęć producentów.

---

## 5. Przygotowanie danych w Excelu (CSV)

Jeśli wygodniej zbierać dane w arkuszu:

### Nagłówki kolumn (wiersz 1)

```
id;name;category;lat;lng;imageUrl;description;address;hours;products
```

### Przykładowy wiersz danych

```
baeckerei-schmidt-osnabrueck;Bäckerei Schmidt;Bäckerei;52.2799;8.0472;assets/images/producers/baeckerei-schmidt.webp;Handwerksbäckerei mit Sauerteigbrot;Marktstraße 4, 49074 Osnabrück;Mo-Fr 06:00-18:00;Brot|Brötchen|Croissants
```

**Zasady CSV:**
- Separator: średnik `;` (Excel DE).
- Produkty w jednej komórce oddziel **`|** (pipe), np. `Brot|Brötchen|Croissants`.
- Pola z przecinkami lub cudzysłowami – otocz całą komórkę cudzysłowem `"`.
- Zapisz jako **CSV UTF-8**.

### Konwersja CSV → JSON (opcjonalnie)

Możesz użyć narzędzia online (np. convertcsv.com) albo krótkiego skryptu Node. Docelowo każdy wiersz staje się obiektem w tablicy `PRODUCERS`.

Alternatywnie trzymaj dane w pliku **`producers-import.json`** (obok projektu) w formacie:

```json
[
  {
    "id": "baeckerei-schmidt-osnabrueck",
    "name": "Bäckerei Schmidt",
    "category": "Bäckerei",
    "lat": 52.2799,
    "lng": 8.0472,
    "imageUrl": "assets/images/producers/baeckerei-schmidt.webp",
    "description": "Handwerksbäckerei mit Sauerteigbrot und frischen Brötchen.",
    "address": "Marktstraße 4, 49074 Osnabrück",
    "hours": "Mo-Fr 06:00-18:00; Sa 06:00-14:00",
    "products": ["Brot", "Brötchen", "Croissants"]
  }
]
```

Następnie skopiuj zawartość tablicy do `PRODUCERS` w `producerData.js` (zamień cudzysłowy JSON na składnię JS – klucze bez cudzysłowów są opcjonalne w JS).

---

## 6. Współrzędne GPS (`lat`, `lng`)

- Google Maps: kliknij prawym na miejsce → współrzędne skopiuj.
- Format: **kropka** jako separator dziesiętny (`52.2799`, nie `52,2799`).
- Sprawdź, czy `lat` to pierwsza liczba (szerokość), `lng` druga (długość).

---

## 7. Godziny otwarcia (`hours`)

Jedna linia tekstu, np.:

```
Mo-Fr 08:00-18:00; Sa 08:00-14:00; So geschlossen
```

Skróty dni po niemiecku: Mo, Di, Mi, Do, Fr, Sa, So.

---

## 8. Checklist przed wklejeniem

- [ ] Każdy `id` jest unikalny
- [ ] Wszystkie wymagane pola wypełnione
- [ ] Opisy po **niemiecku**
- [ ] Zdjęcie istnieje w `assets/images/producers/`
- [ ] `lat` / `lng` to liczby (nie stringi w JS – bez cudzysłowów)
- [ ] `products` to tablica stringów: `['Brot', 'Brötchen']`
- [ ] Plik zapisany, aplikacja odświeżona

---

## 9. Co dalej?

Gdy będziesz gotowy z pierwszą paczką producentów:

1. Wklej obiekty do `PRODUCERS` w `js/data/producerData.js`.
2. Dodaj zdjęcia do `assets/images/producers/`.
3. Otwórz aplikację – producenci pojawią się na **Home** i **Mapie** w promieniu GPS użytkownika.

Jeśli chcesz, w kolejnym kroku możemy dodać skrypt importu CSV → `producerData.js` albo pierwszą paczkę prawdziwych wpisów.
