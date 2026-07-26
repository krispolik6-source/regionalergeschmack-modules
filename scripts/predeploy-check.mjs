/**
 * Weryfikacja przed wdrożeniem – składnia JS, API danych, brak demo w kodzie.
 * Run: npm run check:predeploy  (z katalogu projektu)
 */
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fetchProducers } from '../js/data/osmService.js';
import { fetchGovData } from '../js/data/govDataService.js';
import { loadAllData, resetProducersForTests } from '../js/data/dataService.js';

const ROOT = process.cwd();
const failures = [];
const passes = [];

function pass(msg) {
    passes.push(msg);
    console.log(`✅ ${msg}`);
}

function fail(msg) {
    failures.push(msg);
    console.error(`❌ ${msg}`);
}

// 1. Składnia głównych modułów
try {
    execSync('node --check js/app.js', { cwd: ROOT, stdio: 'pipe' });
    pass('Składnia app.js');
} catch (_) {
    fail('Składnia app.js – błąd');
}

// 2. Brak pozostałości demo w źródłach
let demoClean = true;
const forbidden = [
    { file: 'js/app.js', patterns: ['seedDemoCartItem'] },
    { file: 'js/views/cart.js', patterns: ['seedDemoCartItem', 'demo-bread'] },
    { file: 'js/data/reviews.js', patterns: ['SAMPLE_REVIEWS'] },
    { file: 'js/data/products.js', patterns: ["producerId: 'local-"] }
];

const configPath = join(ROOT, 'js/config.js');
if (existsSync(configPath)) {
    const configContent = readFileSync(configPath, 'utf8');
    if (!/DEMO_CART_ENABLED:\s*false/.test(configContent)) {
        fail('js/config.js: DEMO_CART_ENABLED musi być false');
        demoClean = false;
    }
} else {
    fail('Brak pliku: js/config.js');
    demoClean = false;
}

for (const { file, patterns } of forbidden) {
    const full = join(ROOT, file);
    if (!existsSync(full)) {
        fail(`Brak pliku: ${file}`);
        demoClean = false;
        continue;
    }
    const content = readFileSync(full, 'utf8');
    for (const pattern of patterns) {
        if (content.includes(pattern)) {
            fail(`${file} zawiera demo: ${pattern}`);
            demoClean = false;
        }
    }
}
if (demoClean) {
    pass('Brak znanych wzorców demo w kluczowych plikach');
}

// 3. API OSM + GovData
const lat = 52.14;
const lng = 8.04;

try {
    const osm = await fetchProducers(lat, lng, 5000);
    if (osm.length > 0) {
        pass(`OSM: ${osm.length} producentów`);
    } else {
        fail('OSM: 0 producentów');
    }
} catch (e) {
    const msg = String(e.message || e);
    // Przejściowe błędy sieci / Overpass – loadAllData poniżej weryfikuje fallback
    if (/429|502|503|504|timeout|fetch failed|network|ECONNRESET|ENOTFOUND|AbortError/i.test(msg)) {
        console.log(`⚠️  OSM: przejściowy błąd (${msg}) – sprawdzono fallback w loadAllData`);
    } else {
        fail(`OSM: ${msg}`);
    }
}

try {
    const gov = await fetchGovData('farmer', lat, lng, 10);
    pass(`GovData: ${gov.length} rekordów (0 = normalne poza NRW)`);
} catch (e) {
    fail(`GovData: ${e.message}`);
}

resetProducersForTests();
const loaded = await loadAllData(lat, lng, { radiusKm: 10, forceRefresh: true });
if (loaded.producers.length > 0) {
    pass(`loadAllData: ${loaded.producers.length} producentów (źródło: ${loaded.source})`);
} else if (loaded.source === 'empty') {
    console.log('⚠️  loadAllData: puste (API niedostępne, brak cache w Node)');
} else {
    fail(`loadAllData: brak producentów (źródło: ${loaded.source})`);
}

// 4. HTTP – opcjonalnie gdy serwer działa
try {
    const res = await fetch('http://127.0.0.1:3456/');
    if (res.ok) {
        pass('Serwer lokalny: index.html 200 OK');
    } else {
        fail(`Serwer lokalny: HTTP ${res.status}`);
    }
} catch (_) {
    console.log('ℹ️  Serwer nie działa (npm start) – pominięto test HTTP');
}

console.log('\n--- Podsumowanie ---');
console.log(`OK: ${passes.length} | Błędy: ${failures.length}`);
if (failures.length) {
    failures.forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
}
