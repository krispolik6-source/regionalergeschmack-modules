// js/data/producerData.js
// ═══════════════════════════════════════════════════════════════════════════
//  TUTAJ WKLEJASZ PRAWDZIWYCH NIEMIECKICH PRODUCENTÓW
//  Na razie lista jest pusta – poniżej znajduje się tylko wzór (w komentarzu).
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @typedef {Object} RealProducer
 * @property {string|number} id           – unikalny identyfikator (np. 'baeckerei-schmidt-osnabrueck')
 * @property {string} name                – nazwa widoczna w aplikacji (np. 'Bäckerei Schmidt')
 * @property {string} category            – kategoria (np. 'Bäckerei', 'Metzgerei', 'Hof') – patrz HOW_TO_ADD_REAL_DATA.md
 * @property {number} lat                 – szerokość geogr. GPS (np. 52.2799)
 * @property {number} lng                 – długość geogr. GPS (np. 8.0472)
 * @property {string} imageUrl            – ścieżka do zdjęcia (np. 'assets/images/producers/baeckerei-schmidt.webp')
 * @property {string} description         – krótki opis po niemiecku (1–2 zdania)
 * @property {string} address             – ulica i miasto (np. 'Marktstraße 4, 49074 Osnabrück')
 * @property {string} hours               – godziny otwarcia (np. 'Mo-Fr 08:00-18:00; Sa 08:00-14:00')
 * @property {string[]} products          – lista produktów / usług (np. ['Brot', 'Brötchen'])
 */

/**
 * Główna tablica producentów – wklej tutaj obiekty według wzoru poniżej.
 * @type {readonly RealProducer[]}
 */
export const PRODUCERS = Object.freeze([]);

// ─── WZÓR JEDNEGO PRODUCENTA (skopiuj, wypełnij, wklej do tablicy PRODUCERS) ───
//
// {
//     id: 'baeckerei-schmidt-osnabrueck',
//     name: 'Bäckerei Schmidt',
//     category: 'Bäckerei',
//     lat: 52.2799,
//     lng: 8.0472,
//     imageUrl: 'assets/images/producers/baeckerei-schmidt.webp',
//     description: 'Handwerksbäckerei mit Sauerteigbrot und frischen Brötchen – seit drei Generationen in Osnabrück.',
//     address: 'Marktstraße 4, 49074 Osnabrück',
//     hours: 'Mo-Fr 06:00-18:00; Sa 06:00-14:00',
//     products: ['Brot', 'Brötchen', 'Croissants']
// },
//
// ─── Przykład JSON (do importu z pliku .json lub konwersji z CSV) ───
//
// {
//   "id": "metzgerei-berg-koeln",
//   "name": "Metzgerei Berg",
//   "category": "Metzgerei",
//   "lat": 50.9375,
//   "lng": 6.9603,
//   "imageUrl": "assets/images/producers/metzgerei-berg.webp",
//   "description": "Fleisch und Wurst aus regionaler Haltung im Herzen von Köln.",
//   "address": "Bergstraße 19, 50678 Köln",
//   "hours": "Di-Fr 08:00-18:00; Sa 08:00-13:00",
//   "products": ["Hausmacherwurst", "Rindersteak", "Schweinerücken"]
// }

export default { PRODUCERS };
