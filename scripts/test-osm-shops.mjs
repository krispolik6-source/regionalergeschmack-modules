const lat = 52.14;
const lng = 8.04;
const r = 10000;

const q = `[out:json][timeout:25];
(
  node(around:${r},${lat},${lng})["shop"="supermarket"];
  node(around:${r},${lat},${lng})["shop"="convenience"];
  node(around:${r},${lat},${lng})["amenity"="vending_machine"];
  nwr(around:${r},${lat},${lng})["shop"="supermarket"];
  nwr(around:${r},${lat},${lng})["amenity"="vending_machine"];
);
out center;`;

const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`;
const res = await fetch(url, { headers: { 'User-Agent': 'RG-test/1.0' } });
const data = await res.json();
const els = data.elements || [];

console.log('Found:', els.length);
const tags = {};
for (const e of els) {
    const t = e.tags || {};
    const key = t.shop ? `shop=${t.shop}` : t.amenity ? `amenity=${t.amenity}` : 'other';
    tags[key] = (tags[key] || 0) + 1;
}
console.log('Tag breakdown:', tags);
console.log('Samples:', els.slice(0, 8).map((e) => ({
    type: e.type,
    name: e.tags?.name,
    shop: e.tags?.shop,
    amenity: e.tags?.amenity,
    brand: e.tags?.brand
})));
