// MODUŁ 1 – Code Guardian (statyczna analiza, bez zmian kodu)
import { spawnSync } from 'child_process';
import path from 'path';
import { PROJECT_ROOT, SEVERITY } from '../config.mjs';
import { finding } from '../lib/findings.mjs';
import { exists, listJsFiles, readText, shaShort } from '../lib/fs-utils.mjs';

function runNodeCheck(rel) {
    const full = path.join(PROJECT_ROOT, rel);
    const r = spawnSync(process.execPath, ['--check', full], { encoding: 'utf8' });
    return { ok: r.status === 0, stderr: (r.stderr || r.stdout || '').trim() };
}

function detectDoubleListeners(source, file) {
    const findings = [];
    const addListenerCount = (source.match(/\.addEventListener\s*\(/g) || []).length;
    const withoutOff = !source.includes('removeEventListener') && addListenerCount > 8;
    if (withoutOff && /render|init|mount|open/i.test(file)) {
        findings.push(finding({
            module: 'code',
            severity: SEVERITY.medium,
            title: `Możliwe podwójne listenery: ${file}`,
            cause: `Plik rejestruje ${addListenerCount} addEventListener bez widocznego removeEventListener.`,
            files: [file],
            proposal: 'Przy remount/rebind upewnij się, że handlery są jednorazowe (dataset.bound) lub czyszczone.',
            performanceImpact: 'średni (duplikacja handlerów)',
            regressionRisk: 'średnie',
            tags: ['listeners', 'memory']
        }));
    }
    // Brak guardu dataset.bound przy typowych pętlach
    if (source.includes('querySelectorAll') && source.includes('addEventListener')
        && !source.includes('dataset.bound') && !source.includes('data-bound')) {
        if (/views\/|controllers\//.test(file)) {
            findings.push(finding({
                module: 'code',
                severity: SEVERITY.cosmetic,
                title: `Brak wzorca dataset.bound w ${file}`,
                cause: 'Ponowne bindowanie przy re-render może dublować handlery.',
                files: [file],
                proposal: 'Stosuj flagę dataset.bound / AbortController przy rebind.',
                performanceImpact: 'niski–średni',
                regressionRisk: 'niskie',
                tags: ['listeners']
            }));
        }
    }
    return findings;
}

function detectRacePatterns(source, file) {
    const findings = [];
    if (/async\s+function|=\s*async\s*\(/.test(source) && /innerHTML\s*=/.test(source)) {
        if (!/AbortController|cancelled|disposed|token/.test(source)) {
            findings.push(finding({
                module: 'code',
                severity: SEVERITY.medium,
                title: `Możliwy race async→DOM: ${file}`,
                cause: 'Async aktualizuje DOM bez tokenu anulowania.',
                files: [file],
                proposal: 'Dodaj generation token / AbortController przed zapisem do DOM.',
                performanceImpact: 'niski',
                regressionRisk: 'średnie',
                tags: ['race']
            }));
        }
    }
    return findings;
}

function detectFetchNoise(source, file) {
    const findings = [];
    const fetches = source.match(/\bfetch\s*\(/g) || [];
    if (fetches.length >= 3 && !/cache|localStorage|sessionStorage/.test(source)) {
        findings.push(finding({
            module: 'code',
            severity: SEVERITY.medium,
            title: `Wiele fetch bez widocznego cache: ${file}`,
            cause: `${fetches.length} wywołań fetch – ryzyko zbędnych requestów.`,
            files: [file],
            proposal: 'Sprawdź deduplikację i cache dnia (localStorage) dla powtarzalnych zapytań.',
            performanceImpact: 'wysoki (sieć)',
            regressionRisk: 'średnie',
            tags: ['network']
        }));
    }
    return findings;
}

function detectDuplicates(filesContent) {
    const findings = [];
    const hashes = new Map();
    for (const [file, text] of filesContent) {
        // bloki > 400 znaków
        const chunks = text.split(/\n{2,}/).filter((c) => c.length > 400);
        for (const chunk of chunks) {
            const h = shaShort(chunk.replace(/\s+/g, ' ').slice(0, 800));
            if (!hashes.has(h)) hashes.set(h, []);
            hashes.get(h).push(file);
        }
    }
    for (const [, files] of hashes) {
        const unique = [...new Set(files)];
        if (unique.length >= 2) {
            findings.push(finding({
                module: 'code',
                severity: SEVERITY.cosmetic,
                title: 'Podejrzenie zduplikowanego bloku kodu',
                cause: `Podobny duży fragment w: ${unique.slice(0, 4).join(', ')}`,
                files: unique.slice(0, 6),
                proposal: 'Rozważ wspólny helper prezentacyjny (bez zmiany architektury Store/API).',
                performanceImpact: 'niski',
                regressionRisk: 'niskie',
                tags: ['duplicate']
            }));
        }
    }
    return findings.slice(0, 12);
}

function checkCacheBust() {
    const findings = [];
    if (!exists('index.html')) return findings;
    const html = readText('index.html');
    const css = html.match(/style\.css\?v=(\d+)/);
    const app = html.match(/app\.js\?v=(\d+)/);
    if (!css || !app) {
        findings.push(finding({
            module: 'code',
            severity: SEVERITY.high,
            title: 'Brak cache-bust w index.html',
            cause: 'style.css / app.js bez ?v=',
            files: ['index.html'],
            proposal: 'Utrzymuj bump ?v= przy zmianach CSS/JS.',
            performanceImpact: 'średni (stary cache u użytkowników)',
            regressionRisk: 'niskie',
            tags: ['cache', 'pwa']
        }));
    }
    return findings;
}

function checkServiceWorkerPwa() {
    const findings = [];
    if (!exists('sw.js')) {
        findings.push(finding({
            module: 'code',
            severity: SEVERITY.critical,
            title: 'Brak sw.js',
            cause: 'PWA wymaga Service Workera.',
            files: ['sw.js'],
            proposal: 'Przywróć / utrzymuj sw.js z cache offline.',
            performanceImpact: 'wysoki',
            regressionRisk: 'wysokie',
            tags: ['pwa', 'sw']
        }));
        return findings;
    }
    const sw = readText('sw.js');
    if (!sw.includes('fetch') || !sw.includes('caches')) {
        findings.push(finding({
            module: 'code',
            severity: SEVERITY.high,
            title: 'Service Worker bez pełnego cache/fetch',
            cause: 'sw.js wygląda na niekompletny.',
            files: ['sw.js'],
            proposal: 'Upewnij się, że install + fetch + navigate fallback działają.',
            performanceImpact: 'wysoki',
            regressionRisk: 'średnie',
            tags: ['pwa', 'sw']
        }));
    }
    if (!exists('manifest.json')) {
        findings.push(finding({
            module: 'code',
            severity: SEVERITY.high,
            title: 'Brak manifest.json',
            cause: 'PWA wymaga manifestu.',
            files: ['manifest.json'],
            proposal: 'Dodaj / utrzymuj manifest z ikonami 192/512.',
            performanceImpact: 'średni',
            regressionRisk: 'niskie',
            tags: ['pwa']
        }));
    }
    return findings;
}

/**
 * @returns {Promise<{ findings: import('../lib/findings.mjs').Finding[], meta: object }>}
 */
export async function runCodeGuardian() {
    const findings = [];
    const jsFiles = listJsFiles().filter((f) => !f.includes('legacy/app.bundle'));
    const filesContent = [];

    let syntaxErrors = 0;
    for (const file of jsFiles) {
        const check = runNodeCheck(file);
        if (!check.ok) {
            syntaxErrors += 1;
            findings.push(finding({
                module: 'code',
                severity: SEVERITY.critical,
                title: `Błąd składni: ${file}`,
                cause: check.stderr.slice(0, 400) || 'node --check failed',
                files: [file],
                proposal: 'Napraw błąd składni przed deployem.',
                performanceImpact: 'blokujący',
                regressionRisk: 'wysokie',
                tags: ['syntax']
            }));
        }
        try {
            const text = readText(file);
            filesContent.push([file, text]);
            findings.push(...detectDoubleListeners(text, file));
            findings.push(...detectRacePatterns(text, file));
            findings.push(...detectFetchNoise(text, file));

            if (/setInterval\s*\(/.test(text) && !/clearInterval/.test(text)) {
                findings.push(finding({
                    module: 'code',
                    severity: SEVERITY.high,
                    title: `setInterval bez clearInterval: ${file}`,
                    cause: 'Możliwy memory leak przy wielokrotnym starcie widoku.',
                    files: [file],
                    proposal: 'Czyść interwał przy unmount / hidden tab.',
                    performanceImpact: 'średni–wysoki',
                    regressionRisk: 'średnie',
                    tags: ['memory']
                }));
            }
        } catch {
            /* ignore read */
        }
    }

    findings.push(...detectDuplicates(filesContent));
    findings.push(...checkCacheBust());
    findings.push(...checkServiceWorkerPwa());

    // Tłumaczenia – szybki sygnał
    if (exists('scripts/check-translations.mjs')) {
        const r = spawnSync(process.execPath, ['scripts/check-translations.mjs'], {
            cwd: PROJECT_ROOT,
            encoding: 'utf8'
        });
        if (r.status !== 0) {
            findings.push(finding({
                module: 'code',
                severity: SEVERITY.high,
                title: 'check-translations zakończony błędem',
                cause: (r.stderr || r.stdout || '').slice(0, 500),
                files: ['js/translations.js', 'scripts/check-translations.mjs'],
                proposal: 'Uzupełnij brakujące klucze i18n.',
                performanceImpact: 'niski',
                regressionRisk: 'niskie',
                tags: ['i18n']
            }));
        }
    }

    return {
        findings,
        meta: {
            jsFiles: jsFiles.length,
            syntaxErrors,
            policy: 'read-only'
        }
    };
}
