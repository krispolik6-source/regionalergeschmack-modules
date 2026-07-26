// MODUŁ 2 – UX Guardian (heurystyki jak użytkownik; bez automatycznych zmian)
import { SEVERITY } from '../config.mjs';
import { finding } from '../lib/findings.mjs';
import { exists, listCssFiles, readText } from '../lib/fs-utils.mjs';

const VIEWPORTS = [320, 360, 390, 412, 430, 768, 1024];

/**
 * Symulacje UX są heurystyczne (statyczne) – nie sterują przeglądarką automatycznie,
 * aby Guardian pozostał lekki i lokalny. Propozycje pod browser-audit.
 */
export async function runUxGuardian() {
    const findings = [];
    const cssFiles = listCssFiles();
    let cssBlob = '';
    for (const f of cssFiles) {
        try {
            cssBlob += `\n${readText(f)}`;
        } catch {
            /* ignore */
        }
    }

    // Za małe cele dotykowe
    const smallTap = cssBlob.match(/min-height:\s*([0-9.]+)px/gi) || [];
    const tooSmall = smallTap
        .map((m) => Number(m.replace(/[^\d.]/g, '')))
        .filter((n) => n > 0 && n < 40);
    if (tooSmall.length >= 3) {
        findings.push(finding({
            module: 'ux',
            severity: SEVERITY.medium,
            title: 'Wykryto min-height < 40px (cele dotykowe)',
            cause: `${tooSmall.length} deklaracji poniżej rekomendowanych ~44px.`,
            files: ['css/'],
            proposal: 'Na primary CTA utrzymuj min. 44px; na mapie chrome dopuszczalne mniejsze, ale z dobrym hit-area.',
            performanceImpact: 'niski',
            regressionRisk: 'niskie',
            tags: ['touch', 'a11y']
        }));
    }

    // Miganie / agresywne animacje
    if (/animation:\s*[^;]*(blink|flash|shake)/i.test(cssBlob)) {
        findings.push(finding({
            module: 'ux',
            severity: SEVERITY.high,
            title: 'Wykryto animację typu blink/flash',
            cause: 'Miganie psuje wrażenie żyjącego regionu i dostępność.',
            files: ['css/'],
            proposal: 'Usuń blink; używaj powolnego światła / oddechu z prefers-reduced-motion.',
            performanceImpact: 'średni',
            regressionRisk: 'niskie',
            tags: ['motion', 'a11y']
        }));
    }

    if (!/prefers-reduced-motion/.test(cssBlob)) {
        findings.push(finding({
            module: 'ux',
            severity: SEVERITY.medium,
            title: 'Brak prefers-reduced-motion w CSS',
            cause: 'Użytkownicy z redukcją ruchu nie mają wyłączenia animacji.',
            files: ['css/'],
            proposal: 'Dodaj @media (prefers-reduced-motion: reduce) w warstwach emocji.',
            performanceImpact: 'niski',
            regressionRisk: 'niskie',
            tags: ['a11y', 'motion']
        }));
    } else {
        // OK – living-region-experience ma to
    }

    // Kontrast – zimne/szare na jasnym
    if (/color:\s*#?(aaa|bbb|ccc|999)/i.test(cssBlob)) {
        findings.push(finding({
            module: 'ux',
            severity: SEVERITY.medium,
            title: 'Możliwy słaby kontrast tekstu (jasne szarości)',
            cause: 'Kolory #999–#ccc często nie spełniają WCAG na jasnym tle.',
            files: ['css/'],
            proposal: 'Podnieś kontrast muted text do ~#6a6048 / cieplejszych tokenów.',
            performanceImpact: 'niski',
            regressionRisk: 'niskie',
            tags: ['contrast', 'a11y']
        }));
    }

    // Popup / z-index wars
    const zIndexes = [...cssBlob.matchAll(/z-index:\s*(-?\d+)/gi)].map((m) => Number(m[1]));
    const maxZ = zIndexes.length ? Math.max(...zIndexes) : 0;
    if (maxZ > 10000) {
        findings.push(finding({
            module: 'ux',
            severity: SEVERITY.cosmetic,
            title: `Bardzo wysoki z-index (${maxZ})`,
            cause: 'Ryzyko nakładania popupów / warstw mapy.',
            files: ['css/'],
            proposal: 'Uporządkuj skalę z-index (modal > map chrome > content).',
            performanceImpact: 'niski',
            regressionRisk: 'średnie',
            tags: ['popup', 'overlap']
        }));
    }

    // Overflow / ucięcia
    if ((cssBlob.match(/overflow:\s*hidden/gi) || []).length > 40) {
        findings.push(finding({
            module: 'ux',
            severity: SEVERITY.cosmetic,
            title: 'Dużo overflow:hidden',
            cause: 'Może ucinać teksty/badge na małych ekranach.',
            files: ['css/'],
            proposal: 'Weryfikuj 320–430px: line-clamp zamiast ślepego hidden na tekstach.',
            performanceImpact: 'niski',
            regressionRisk: 'niskie',
            tags: ['responsive', 'clipping']
        }));
    }

    // Viewport checklist (symulacja planów testu)
    for (const w of VIEWPORTS) {
        if (w <= 360 && !cssBlob.includes(`${w}`) && !cssBlob.includes('max-width: 360')) {
            // nie spamuj per width – jeden finding
        }
    }
    if (!/max-width:\s*360px|max-width:\s*320px/.test(cssBlob)) {
        findings.push(finding({
            module: 'ux',
            severity: SEVERITY.medium,
            title: 'Słabe pokrycie breakpointów 320/360',
            cause: 'Brak wyraźnych reguł dla najmniejszych telefonów.',
            files: ['css/living-region-experience.css', 'css/final-ux-premium.css'],
            proposal: 'Utrzymuj media queries 320/360 jak w ETAP 17.',
            performanceImpact: 'niski',
            regressionRisk: 'niskie',
            tags: ['responsive']
        }));
    }

    // Offline / język / motyw – checklista manualna w raporcie
    findings.push(finding({
        module: 'ux',
        severity: SEVERITY.cosmetic,
        title: 'Checklist symulacji ręcznej (Guardian nie steruje przeglądarką)',
        cause: 'Pełna symulacja klik/GPS/offline wymaga sesji dev.',
        files: ['scripts/browser-audit.mjs'],
        proposal: [
            '1) localhost + DevTools: Offline',
            '2) zmiana języka w profilu (DE/EN/PL/MK)',
            '3) dark / legacy jeśli dostępne',
            '4) rotate + 320 CSS',
            '5) GPS mock w DevTools Sensors',
            'Opcjonalnie: npm run check:browser'
        ].join(' · '),
        performanceImpact: 'n/d',
        regressionRisk: 'n/d',
        tags: ['manual', 'simulation']
    }));

    if (exists('index.html')) {
        const html = readText('index.html');
        if (!/aria-|role=/.test(html)) {
            findings.push(finding({
                module: 'ux',
                severity: SEVERITY.medium,
                title: 'Mało atrybutów ARIA w index.html',
                cause: 'Shell może być ubogi w semantyke a11y.',
                files: ['index.html'],
                proposal: 'Utrzymuj aria-label na kluczowych kontrolkach mapy/nav.',
                performanceImpact: 'niski',
                regressionRisk: 'niskie',
                tags: ['a11y']
            }));
        }
    }

    return {
        findings,
        meta: {
            viewports: VIEWPORTS,
            cssFiles: cssFiles.length,
            mode: 'heuristic-static'
        }
    };
}
