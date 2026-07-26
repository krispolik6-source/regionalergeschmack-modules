// MODUŁ 4 – Content Guardian
import { spawnSync } from 'child_process';
import path from 'path';
import { PROJECT_ROOT, SEVERITY } from '../config.mjs';
import { finding } from '../lib/findings.mjs';
import { exists, readText, walkFiles } from '../lib/fs-utils.mjs';

export async function runContentGuardian() {
    const findings = [];

    // Zdjęcia produktów
    const productDir = 'assets/images/products';
    const products = walkFiles(productDir, new Set(['.webp', '.jpg']));
    const webp = new Set(products.filter((p) => p.endsWith('.webp')).map((p) => path.basename(p, '.webp')));
    const jpg = new Set(products.filter((p) => p.endsWith('.jpg')).map((p) => path.basename(p, '.jpg')));
    for (const slug of webp) {
        if (!jpg.has(slug) && slug !== 'sources') {
            findings.push(finding({
                module: 'content',
                severity: SEVERITY.medium,
                title: `Brak JPEG fallback: ${slug}`,
                cause: 'iOS9 / starsze mogą potrzebować .jpg',
                files: [`${productDir}/${slug}.webp`],
                proposal: 'Wygeneruj twin .jpg (process-images).',
                performanceImpact: 'niski',
                regressionRisk: 'niskie',
                tags: ['images']
            }));
        }
    }

    if (exists('js/data/productImages.js')) {
        const src = readText('js/data/productImages.js');
        const slugs = [...src.matchAll(/^\s{4}([a-z0-9-]+):\s*'/gm)].map((m) => m[1]);
        for (const slug of slugs) {
            if (!webp.has(slug) && slug !== 'imageSlug') {
                // PRODUCT_IMAGE_SLUGS keys
            }
        }
        // sprawdź znane slugi z eksportu
        const known = [
            'bread', 'honey', 'apples', 'potatoes', 'sausage', 'cheese', 'vegetables', 'steak'
        ];
        for (const slug of known) {
            if (!webp.has(slug)) {
                findings.push(finding({
                    module: 'content',
                    severity: SEVERITY.high,
                    title: `Brak pliku produktu: ${slug}.webp`,
                    cause: 'Slug używany w kodzie nie ma assetu.',
                    files: [`assets/images/products/${slug}.webp`],
                    proposal: 'Dodaj dopasowane zdjęcie produktu (nie jezioro przy marchwi).',
                    performanceImpact: 'niski',
                    regressionRisk: 'niskie',
                    tags: ['images', 'mismatch']
                }));
            }
        }
    }

    // Kategorie tła
    const backgrounds = walkFiles('assets/images/backgrounds', new Set(['.webp']));
    for (const need of [
        'category_bakeries', 'category_farmers', 'category_honey',
        'category_meat', 'category_shops', 'category_restaurants'
    ]) {
        if (!backgrounds.some((b) => b.includes(need))) {
            findings.push(finding({
                module: 'content',
                severity: SEVERITY.high,
                title: `Brak tła kategorii: ${need}`,
                cause: 'Hero/charakter producenta wymaga assetu.',
                files: [`assets/images/backgrounds/${need}.webp`],
                proposal: 'Dodaj tematyczne tło (nie losowy krajobraz).',
                performanceImpact: 'niski',
                regressionRisk: 'niskie',
                tags: ['images', 'category']
            }));
        }
    }

    // Placeholdery w tłumaczeniach
    if (exists('js/translations.js')) {
        const t = readText('js/translations.js');
        if (/lorem ipsum|TODO_TRANSLATE|FIXME|xxxText/i.test(t)) {
            findings.push(finding({
                module: 'content',
                severity: SEVERITY.critical,
                title: 'Placeholder / lorem w translations',
                cause: 'Wykryto lorem/TODO w pakiecie i18n.',
                files: ['js/translations.js'],
                proposal: 'Zastąp prawdziwymi tekstami DE/EN/PL/MK.',
                performanceImpact: 'niski',
                regressionRisk: 'niskie',
                tags: ['i18n', 'placeholder']
            }));
        }
    }

    // Ikony PWA
    for (const icon of ['assets/icons/icon-192.png', 'assets/icons/icon-512.png']) {
        if (!exists(icon)) {
            findings.push(finding({
                module: 'content',
                severity: SEVERITY.high,
                title: `Brak ikony PWA: ${icon}`,
                cause: 'Manifest wymaga ikon.',
                files: [icon],
                proposal: 'npm run generate-icons',
                performanceImpact: 'niski',
                regressionRisk: 'niskie',
                tags: ['pwa', 'icons']
            }));
        }
    }

    // Kolory – zimne resztki w CSS bazowym
    if (exists('css/style.css')) {
        const css = readText('css/style.css');
        if (/#2980b9|#3498db|rgb\(\s*41\s*,\s*128\s*,\s*185/.test(css)) {
            findings.push(finding({
                module: 'content',
                severity: SEVERITY.cosmetic,
                title: 'Zimny niebieski nadal w style.css',
                cause: 'ETAP 17 nadpisuje w LRE, ale baza ma fallback.',
                files: ['css/style.css', 'css/living-region-experience.css'],
                proposal: 'Docelowo zamień tokeny bazowe na ciepłe (po akceptacji patcha).',
                performanceImpact: 'niski',
                regressionRisk: 'niskie',
                tags: ['color']
            }));
        }
    }

    // Uruchom istniejące audyty assetów jeśli są
    if (exists('scripts/test-product-images.mjs')) {
        const r = spawnSync(process.execPath, ['scripts/test-product-images.mjs'], {
            cwd: PROJECT_ROOT,
            encoding: 'utf8'
        });
        if (r.status !== 0) {
            findings.push(finding({
                module: 'content',
                severity: SEVERITY.high,
                title: 'test-product-images failed',
                cause: (r.stderr || r.stdout || '').slice(0, 400),
                files: ['scripts/test-product-images.mjs'],
                proposal: 'Napraw brakujące/złe dopasowania zdjęć produktów.',
                performanceImpact: 'niski',
                regressionRisk: 'niskie',
                tags: ['images']
            }));
        }
    }

    return {
        findings,
        meta: {
            productWebp: webp.size,
            backgrounds: backgrounds.length
        }
    };
}
