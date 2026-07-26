// MODUŁ 5 – Performance Guardian (statycznie + rozmiary assetów)
import { SEVERITY } from '../config.mjs';
import { finding } from '../lib/findings.mjs';
import { exists, fileSize, listCssFiles, listJsFiles, readText, walkFiles } from '../lib/fs-utils.mjs';

function kb(n) {
    return Math.round(n / 1024);
}

export async function runPerformanceGuardian() {
    const findings = [];
    const jsFiles = listJsFiles().filter((f) => !f.includes('legacy/app.bundle'));
    const cssFiles = listCssFiles();

    let jsTotal = 0;
    let largestJs = { file: '', size: 0 };
    for (const f of jsFiles) {
        const s = fileSize(f);
        jsTotal += s;
        if (s > largestJs.size) largestJs = { file: f, size: s };
    }

    let cssTotal = 0;
    for (const f of cssFiles) cssTotal += fileSize(f);

    if (jsTotal > 1.5 * 1024 * 1024) {
        findings.push(finding({
            module: 'performance',
            severity: SEVERITY.high,
            title: `Duży łączny JS: ${kb(jsTotal)} KB`,
            cause: 'Suma modułów JS przekracza ~1.5 MB.',
            files: [largestJs.file],
            proposal: 'Utrzymaj lazy import widoków; unikaj bundlowania wszystkiego do app (poza legacy).',
            performanceImpact: 'wysoki',
            regressionRisk: 'średnie',
            tags: ['bundle']
        }));
    }

    if (largestJs.size > 200 * 1024) {
        findings.push(finding({
            module: 'performance',
            severity: SEVERITY.medium,
            title: `Duży plik JS: ${largestJs.file} (${kb(largestJs.size)} KB)`,
            cause: 'Pojedynczy moduł może spowalniać parse.',
            files: [largestJs.file],
            proposal: 'Rozważ split prezentacji / lazy sections (bez zmiany Store).',
            performanceImpact: 'średni',
            regressionRisk: 'średnie',
            tags: ['bundle']
        }));
    }

    if (cssTotal > 800 * 1024) {
        findings.push(finding({
            module: 'performance',
            severity: SEVERITY.medium,
            title: `Duży CSS: ${kb(cssTotal)} KB`,
            cause: 'Wiele warstw CSS zwiększa paint.',
            files: ['css/style.css'],
            proposal: 'Nie usuwaj warstw emocji; unikaj duplikacji selektorów przy kolejnych etapach.',
            performanceImpact: 'średni',
            regressionRisk: 'niskie',
            tags: ['css', 'paint']
        }));
    }

    // Obrazy produktów > 400KB
    for (const img of walkFiles('assets/images/products', new Set(['.webp', '.jpg']))) {
        const s = fileSize(img);
        if (s > 400 * 1024) {
            findings.push(finding({
                module: 'performance',
                severity: SEVERITY.medium,
                title: `Ciężki obraz: ${img} (${kb(s)} KB)`,
                cause: 'Duży asset spowalnia LCP na Home/modal.',
                files: [img],
                proposal: 'Skompresuj (process-images) zachowując jakość fotograficzną.',
                performanceImpact: 'wysoki',
                regressionRisk: 'niskie',
                tags: ['images', 'lcp']
            }));
        }
    }

    // Leaflet – nie zmieniamy, tylko obserwacja
    if (exists('index.html')) {
        const html = readText('index.html');
        if (/leaflet/i.test(html) && !/loading="lazy"|media=/.test(html)) {
            findings.push(finding({
                module: 'performance',
                severity: SEVERITY.cosmetic,
                title: 'Leaflet ładowany z shella',
                cause: 'Mapa jest kluczowa – OK; pilnuj by nie dublować CSS Leaflet.',
                files: ['index.html'],
                proposal: 'Nie zmieniaj logiki Leaflet; unikaj dodatkowego full-map import poza widokiem mapy.',
                performanceImpact: 'średni',
                regressionRisk: 'wysokie (jeśli ruszać Leaflet)',
                tags: ['leaflet', 'gps']
            }));
        }
    }

    // SW cache
    if (exists('sw.js')) {
        const sw = readText('sw.js');
        const cacheNames = sw.match(/CACHE_NAME|CACHE_VERSION|v=\d+/g) || [];
        if (cacheNames.length < 1) {
            findings.push(finding({
                module: 'performance',
                severity: SEVERITY.medium,
                title: 'SW bez wyraźnej wersji cache',
                cause: 'Trudniej unieważnić stary cache.',
                files: ['sw.js'],
                proposal: 'Bump wersji cache SW razem z deployem (ręcznie po akceptacji).',
                performanceImpact: 'średni',
                regressionRisk: 'średnie',
                tags: ['sw', 'cache']
            }));
        }
    }

    // Legacy bundle size
    if (exists('js/legacy/app.bundle.js')) {
        const s = fileSize('js/legacy/app.bundle.js');
        findings.push(finding({
            module: 'performance',
            severity: s > 2 * 1024 * 1024 ? SEVERITY.medium : SEVERITY.cosmetic,
            title: `Legacy bundle: ${kb(s)} KB`,
            cause: 'Tylko nomodule / stare iOS.',
            files: ['js/legacy/app.bundle.js'],
            proposal: 'Rebuild legacy tylko gdy zmieniasz app entry (npm run build:legacy).',
            performanceImpact: 'niski dla modern',
            regressionRisk: 'niskie',
            tags: ['legacy']
        }));
    }

    // Lazy loading check
    let lazyHits = 0;
    for (const f of jsFiles.slice(0, 80)) {
        try {
            const t = readText(f);
            if (t.includes('import(')) lazyHits += 1;
        } catch {
            /* ignore */
        }
    }
    if (lazyHits < 3) {
        findings.push(finding({
            module: 'performance',
            severity: SEVERITY.medium,
            title: 'Mało dynamicznych import()',
            cause: `Znaleziono ${lazyHits} plików z import().`,
            files: ['js/controllers/navigation.js'],
            proposal: 'Utrzymuj lazy widoków (map/home już częściowo).',
            performanceImpact: 'średni',
            regressionRisk: 'średnie',
            tags: ['lazy']
        }));
    }

    return {
        findings,
        meta: {
            jsTotalKb: kb(jsTotal),
            cssTotalKb: kb(cssTotal),
            jsFiles: jsFiles.length,
            cssFiles: cssFiles.length,
            largestJs,
            note: 'FPS/paint runtime – mierz w DevTools Performance (Guardian nie instrumentuje produkcji)'
        }
    };
}
