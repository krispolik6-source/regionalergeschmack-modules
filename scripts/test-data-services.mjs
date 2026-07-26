import { fetchProducers } from '../js/data/osmService.js';
import { fetchGovData } from '../js/data/govDataService.js';
import { loadAllData } from '../js/data/dataService.js';

const lat = 52.14;
const lng = 8.04;

try {
    const osm = await fetchProducers(lat, lng, 5000);
    console.log('OSM OK:', osm.length, osm.slice(0, 2).map((p) => p.name));
} catch (e) {
    console.error('OSM FAIL:', e.message);
}

try {
    const gov = await fetchGovData('farmer', lat, lng, 10);
    console.log('GovData OK:', gov.length, gov.slice(0, 2).map((p) => p.name));
} catch (e) {
    console.error('GovData FAIL:', e.message);
}

const all = await loadAllData(lat, lng, { radiusKm: 10, forceRefresh: true });
console.log('loadAllData:', all.producers.length, all.source, 'apiFailed:', all.apiFailed);
