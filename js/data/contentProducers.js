// Curated sample producers for home featured / user testing (not OSM demo spam)

import { getProductImageUrl } from './productImages.js';
import { getCategoryImage } from '../presentation/categoryImages.js?v=6';

function product(slug, name, price, unit, description, extras = {}) {
    return {
        id: extras.id || slug,
        name,
        description,
        price,
        unit: unit || '',
        promo: extras.promo || '',
        imageSlug: extras.imageSlug || slug,
        imageUrl: getProductImageUrl(extras.imageSlug || slug) || '',
        isSampleImage: extras.isSampleImage !== false
    };
}

function photo(category) {
    return getCategoryImage(category) || getCategoryImage('farmers') || '';
}

/** @type {readonly object[]} */
export const CONTENT_PRODUCERS = Object.freeze([
    {
        id: 'content-hof-mueller',
        name: 'Hof Müller',
        category: 'farmer',
        chain: '',
        address: 'Langenberg 12, 49176 Hilter',
        city: 'Hilter',
        lat: 52.1412,
        lng: 8.0452,
        description: 'Bio-Hof mit Hofladen – Kartoffeln, Äpfel, Eier und Honig.',
        story: 'Hof Müller besteht seit 1968 als Familienbetrieb an der Sieg. Spezialität sind Kartoffeln und Äpfel aus dem eigenen Obstgarten. Gemüse wächst ohne Pestizide, die Eier stammen von Freilandhühnern. Die Familie legt Wert auf kurze Wege vom Feld zum Kunden.',
        rating: 4.7,
        promo: '🍎 Frische Ernte!',
        phone: '+49 5424 981234',
        email: 'info@hof-mueller-demo.de',
        website: 'https://www.hof-mueller-demo.de',
        openingHours: 'Mo-Sa 08:00-18:00; Su 09:00-13:00',
        hours: 'Mo-Sa 08:00-18:00; Su 09:00-13:00',
        image: photo('farmer'),
        imageSource: 'sample',
        trustStatus: 'verified',
        verified: true,
        source: 'content',
        products: [
            product('potatoes', 'Kartoffeln (bio)', 2.5, 'kg', 'Regionale Sorten', { id: 'content-hof-mueller-potatoes' }),
            product('apples', 'Äpfel (bio)', 3.8, 'kg', 'Frisch vom Obstgarten', { id: 'content-hof-mueller-apples', promo: '🍎 Saison!' }),
            product('eggs', 'Eier (bio)', 3.0, '6 St.', 'Freilandhaltung', { id: 'content-hof-mueller-eggs' }),
            product('honey', 'Lindenhonig', 8.9, '500 g', 'Von eigenen Bienen', { id: 'content-hof-mueller-honey' })
        ],
        promotions: [{ title: '🍎 Frische Ernte!', description: 'Saisonales Obst und Gemüse vom Hof.' }]
    },
    {
        id: 'content-baeckerei-schmidt',
        name: 'Bäckerei Schmidt',
        category: 'bakery',
        chain: '',
        address: 'Marktstraße 4, 53111 Bonn',
        city: 'Bonn',
        lat: 50.7374,
        lng: 7.0982,
        description: 'Handwerksbäckerei mit Sauerteigbrot und frischen Brötchen.',
        story: 'Die Bäckerei Schmidt backt seit drei Generationen nach Bonner Handwerkstradition. Sauerteigbrot reift über 18 Stunden. Das Mehl kommt von Mühlen aus dem Rheinland. Spezialität sind frische Brötchen und täglich gebackenes Hefegebäck.',
        rating: 4.8,
        promo: '🔥 20% auf Brot!',
        phone: '+49 228 5550123',
        email: 'kontakt@baeckerei-schmidt-demo.de',
        website: 'https://www.baeckerei-schmidt-demo.de',
        openingHours: 'Mo-Fr 06:00-18:00; Sa 06:00-14:00; Su off',
        hours: 'Mo-Fr 06:00-18:00; Sa 06:00-14:00; Su off',
        image: photo('bakery'),
        imageSource: 'sample',
        trustStatus: 'verified',
        verified: true,
        source: 'content',
        products: [
            product('bread', 'Bauernbrot', 3.5, '', 'Mit Sauerteig gebacken', { id: 'content-baeckerei-schmidt-bread', promo: '🔥 -20%' }),
            product('rolls', 'Brötchen', 0.8, '', 'Knusprige Weizenbrötchen', { id: 'content-baeckerei-schmidt-rolls' }),
            product('croissant', 'Croissants', 2.0, '', 'Buttrig und frisch', { id: 'content-baeckerei-schmidt-croissant' }),
            product('pastries', 'Tagesgebäck', 2.4, '', 'Süßes Hefegebäck', { id: 'content-baeckerei-schmidt-pastries', imageSlug: 'pastries' })
        ],
        promotions: [{ title: '🔥 20% auf Brot', description: 'Aktion auf Bauernbrot bis Wochenende.' }]
    },
    {
        id: 'content-molkerei-rhein',
        name: 'Molkerei am Rhein',
        category: 'shop',
        chain: '',
        address: 'Rheinufer 8, 50678 Köln',
        city: 'Köln',
        lat: 50.9375,
        lng: 6.9603,
        description: 'Regionale Milchprodukte von Höfen am Rhein.',
        story: 'Die Molkerei am Rhein verbindet lokale Höfe mit Kölner Haushalten. Die Milch wird morgens abgeholt und noch am selben Tag verkauft. Käse reift in Kühlräumen am Rhein. Butter und Joghurt entstehen nach einfachen, traditionellen Rezepten.',
        rating: 4.6,
        promo: '🧈 10% günstiger!',
        phone: '+49 221 9876543',
        email: 'hello@molkerei-rhein-demo.de',
        website: 'https://www.molkerei-rhein-demo.de',
        openingHours: 'Mo-Sa 09:00-19:00; Su 10:00-14:00',
        hours: 'Mo-Sa 09:00-19:00; Su 10:00-14:00',
        image: photo('shop'),
        imageSource: 'sample',
        trustStatus: 'verified',
        verified: true,
        source: 'content',
        products: [
            product('milk', 'Regionale Milch', 1.5, '1 l', 'Von regionalen Lieferanten', { id: 'content-molkerei-rhein-milk' }),
            product('butter', 'Butter', 2.5, '250 g', 'Cremige Landbutter', { id: 'content-molkerei-rhein-butter', promo: '🧈 -10%' }),
            product('cheese', 'Regionaler Käse', 4.2, '200 g', 'Gereifter Käse', { id: 'content-molkerei-rhein-cheese' }),
            product('yogurt', 'Naturjoghurt', 1.9, '500 g', 'Ohne Zusätze', { id: 'content-molkerei-rhein-yogurt', imageSlug: 'yogurt' })
        ],
        promotions: [{ title: '🧈 -10% auf Butter', description: 'Regionale Butter zum Aktionspreis.' }]
    },
    {
        id: 'content-metzgerei-berg',
        name: 'Metzgerei Berg',
        category: 'meat',
        chain: '',
        address: 'Bergstraße 19, 53639 Königswinter',
        city: 'Königswinter',
        lat: 50.6744,
        lng: 7.1947,
        description: 'Fleisch und Wurst aus dem Siebengebirge.',
        story: 'Die Metzgerei Berg führt die Familie seit 1954 in Königswinter. Fleisch kommt ausschließlich von geprüften Betrieben im Siebengebirge. Wurst und Aufschnitt entstehen nach eigenen Gewürzen. Der Laden setzt auf transparente Herkunft und Handarbeit.',
        rating: 4.5,
        promo: '🔥 Frische Wurst!',
        phone: '+49 2223 441122',
        email: 'laden@metzgerei-berg-demo.de',
        website: 'https://www.metzgerei-berg-demo.de',
        openingHours: 'Tu-Fr 08:00-18:00; Sa 08:00-13:00; Mo,Su off',
        hours: 'Tu-Fr 08:00-18:00; Sa 08:00-13:00; Mo,Su off',
        image: photo('meat'),
        imageSource: 'sample',
        trustStatus: 'pending',
        verified: false,
        source: 'content',
        products: [
            product('sausage', 'Hausmacherwurst', 3.2, '3 St.', 'Nach Familienrezept', { id: 'content-metzgerei-berg-sausage', promo: '🔥 Frisch!' }),
            product('steak', 'Rindersteak', 6.9, '200 g', 'Aus lokaler Haltung', { id: 'content-metzgerei-berg-steak' }),
            product('pork', 'Schweinerücken', 5.5, 'kg', 'Schweinefleisch aus der Region', { id: 'content-metzgerei-berg-pork' })
        ],
        promotions: [{ title: '🔥 Frische Wurst', description: 'Täglich frische Charge Hausmacherwurst.' }]
    },
    {
        id: 'content-gasthof-eifel',
        name: 'Gasthof Eifelblick',
        category: 'restaurant',
        chain: '',
        address: 'Panoramaweg 3, 54595 Prüm',
        city: 'Prüm',
        lat: 50.2081,
        lng: 6.4192,
        description: 'Eifeler Küche mit saisonalen Zutaten.',
        story: 'Der Gasthof Eifelblick kocht seit über vierzig Jahren Eifeler Küche. Die Gerichte basieren auf saisonalen Produkten von Bauern aus der Umgebung. Spezialität sind Bauernfrühstück und Gemüsesuppen. Der Betrieb verbindet Tradition mit familiärer Gastfreundschaft.',
        rating: 4.9,
        promo: '🍽️ Tagesgericht empfohlen!',
        phone: '+49 6551 778899',
        email: 'gast@eifelblick-demo.de',
        website: 'https://www.eifelblick-demo.de',
        openingHours: 'We-Su 11:30-21:00; Mo,Tu off',
        hours: 'We-Su 11:30-21:00; Mo,Tu off',
        image: photo('restaurant'),
        imageSource: 'sample',
        trustStatus: 'verified',
        verified: true,
        source: 'content',
        products: [
            product('daily-dish', 'Tagesgericht', 14.5, '', 'Saisonales Regionalgericht', { id: 'content-gasthof-eifel-daily', promo: '🍽️ Empfohlen!' }),
            product('soup', 'Tagessuppe', 6.5, '', 'Hausgemachte Gemüsesuppe', { id: 'content-gasthof-eifel-soup' }),
            product('salad', 'Saisonsalat', 8.9, '', 'Gemüse von lokalen Lieferanten', { id: 'content-gasthof-eifel-salad' })
        ],
        promotions: [{ title: '🍽️ Tagesgericht', description: 'Täglich neu mit lokalen Zutaten.' }]
    },
    {
        id: 'content-imbiss-markt',
        name: 'Imbiss am Markt',
        category: 'fast_food',
        chain: '',
        address: 'Marktplatz 7, 53111 Bonn',
        city: 'Bonn',
        lat: 50.7352,
        lng: 7.1006,
        description: 'Burger, Pommes und Döner – schnell und regional.',
        story: 'Der Imbiss am Markt steht seit Jahren am Bonner Marktplatz. Neben klassischen Burgern gibt es Pommes und Döner. Die Zutaten kommen möglichst von Lieferanten aus der Region. Gäste holen sich das Essen zum Mitnehmen oder essen an den Stehtischen.',
        rating: 4.4,
        promo: '🍔 Lunch-Deal!',
        phone: '+49 228 334455',
        email: 'imbiss@markt-demo.de',
        website: 'https://www.imbiss-markt-demo.de',
        hours: 'Mo-Sa 11:00-21:00; Su off',
        openingHours: 'Mo-Sa 11:00-21:00; Su off',
        image: photo('fastFood'),
        imageSource: 'sample',
        trustStatus: 'community',
        communityEdited: true,
        verified: false,
        source: 'content',
        products: [
            product('burger', 'Hausburger', 6.5, '', 'Mit regionalem Rindfleisch', { id: 'content-imbiss-markt-burger', promo: '🍔 Deal!' }),
            product('fries', 'Pommes', 3.2, '', 'Knusprig frittiert', { id: 'content-imbiss-markt-fries', imageSlug: 'burger' }),
            product('doner', 'Döner', 5.5, '', 'Frisch zubereitet', { id: 'content-imbiss-markt-doner', imageSlug: 'burger' })
        ],
        promotions: [{ title: '🍔 Lunch-Deal', description: 'Burger + Pommes zum Mittagstarif.' }]
    },
    {
        id: 'content-imkerei-sonne',
        name: 'Imkerei Sonne',
        category: 'farmer',
        chain: '',
        address: 'Immenweg 2, 49176 Hilter',
        city: 'Hilter',
        lat: 52.1388,
        lng: 8.0395,
        description: 'Honig und Bienenprodukte aus der Region.',
        story: 'Die Imkerei Sonne führt Bienenstöcke bei Brühl seit 1982. Die Honige entstehen aus Linden-, Akazien- und Wiesenblüten der Rheinebene. Die Familie schützt die Bienen ohne unnötige Chemie. Neben Honig gibt es Pollen und Kerzen aus Bienenwachs.',
        rating: 4.8,
        promo: '🍯 Honig aus eigener Imkerei',
        phone: '+49 5424 556677',
        email: 'bienen@imkerei-sonne-demo.de',
        website: 'https://www.imkerei-sonne-demo.de',
        openingHours: 'Fr 14:00-18:00; Sa 09:00-13:00',
        hours: 'Fr 14:00-18:00; Sa 09:00-13:00',
        image: photo('honey'),
        imageSource: 'sample',
        trustStatus: 'verified',
        verified: true,
        source: 'content',
        products: [
            product('honey', 'Blütenhonig', 7.5, '500 g', 'Von rheinischen Wiesen', { id: 'content-imkerei-sonne-honey' }),
            product('apples', 'Äpfel vom Obstgarten', 3.2, 'kg', 'Lokale Sorten', { id: 'content-imkerei-sonne-apples' })
        ],
        promotions: [{ title: '🍯 Saisonhonig', description: 'Frischer Honig vom aktuellen Flug.' }]
    }
]);

const byId = new Map(CONTENT_PRODUCERS.map((p) => [String(p.id), p]));

export function getContentProducers() {
    return [...CONTENT_PRODUCERS];
}

export function getContentProducerById(id) {
    return byId.get(String(id)) || null;
}

export default {
    CONTENT_PRODUCERS,
    getContentProducers,
    getContentProducerById
};
