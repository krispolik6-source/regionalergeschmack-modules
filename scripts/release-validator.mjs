/**
 * ETAP 44 — Release Validator
 *
 * Przed wydaniem uruchamia suite testów / audytów / PWA / i18n / ikon / a11y…
 * Na konsoli wypisuje TYLKO wynik końcowy (chyba że --verbose).
 *
 * Usage:
 *   npm run release-validator
 *   npm run release-validator -- --verbose
 *   npm run release-validator -- --fast
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'docs', 'final');
const OUT_MD = join(OUT_DIR, 'RELEASE-VALIDATOR.md');
const OUT_JSON = join(OUT_DIR, 'RELEASE-VALIDATOR.json');
const OUT_LATEST = join(OUT_DIR, 'release-validator-latest.json');

const args = process.argv.slice(2);
const VERBOSE = args.includes('--verbose') || args.includes('-v');
const FAST = args.includes('--fast');

/**
 * @typedef {{ id: string, category: string, label: string, script: string, critical?: boolean, weight?: number, fastSkip?: boolean, timeoutMs?: number }} SuiteItem
 */

/** @type {SuiteItem[]} */
const SUITE = [
    // —— Audyty / testy ——
    { id: 'full-audit', category: 'audits', label: 'Full audit', script: 'scripts/full-audit.mjs', critical: true, weight: 8 },
    { id: 'functional', category: 'tests', label: 'Functional audit', script: 'scripts/functional-audit.mjs', critical: true, weight: 8, timeoutMs: 180000 },
    { id: 'premiere', category: 'tests', label: 'Premiere checklist', script: 'scripts/test-premiere-ready.mjs', critical: true, weight: 5 },
    { id: 'rc', category: 'tests', label: 'Release Candidate path', script: 'scripts/release-candidate.mjs', critical: true, weight: 6 },
    { id: 'predeploy', category: 'audits', label: 'Predeploy (OSM/offline smoke)', script: 'scripts/predeploy-check.mjs', critical: true, weight: 6, fastSkip: true, timeoutMs: 120000 },

    // —— Tłumaczenia ——
    { id: 'translations', category: 'translations', label: 'Translations keys', script: 'scripts/check-translations.mjs', critical: true, weight: 7 },
    { id: 'search-i18n', category: 'translations', label: 'Search i18n', script: 'scripts/test-search-i18n.mjs', critical: false, weight: 3 },
    { id: 'landing', category: 'translations', label: 'Landing', script: 'scripts/test-landing.mjs', critical: true, weight: 4 },

    // —— Ikony / brand ——
    { id: 'master-icon', category: 'icons', label: 'Master icon audit', script: 'scripts/master-icon-audit.mjs', critical: true, weight: 5 },
    { id: 'logo-audit', category: 'icons', label: 'Logo audit', script: 'scripts/logo-audit.mjs', critical: false, weight: 3 },
    { id: 'brand-protection', category: 'icons', label: 'Brand protection', script: 'scripts/test-brand-protection.mjs', critical: true, weight: 4 },
    { id: 'assets', category: 'icons', label: 'Asset audit', script: 'scripts/asset-audit.mjs', critical: false, weight: 3 },

    // —— Manifest / SW / PWA / offline ——
    { id: 'pwa', category: 'pwa', label: 'PWA (manifest · SW · install)', script: 'scripts/test-pwa.mjs', critical: true, weight: 8 },
    { id: 'push', category: 'pwa', label: 'Push notifications', script: 'scripts/test-push-notifications.mjs', critical: false, weight: 2 },
    { id: 'browser', category: 'pwa', label: 'Browser audit', script: 'scripts/browser-audit.mjs', critical: false, weight: 3 },

    // —— Responsive / a11y / performance ——
    { id: 'responsive', category: 'responsive', label: 'Responsive check', script: 'scripts/check-responsive.mjs', critical: true, weight: 4 },
    { id: 'device-lab', category: 'responsive', label: 'Device Lab', script: 'scripts/device-lab-audit.mjs', critical: true, weight: 5 },
    { id: 'mobile-premium', category: 'responsive', label: 'Mobile Premium audit', script: 'scripts/mobile-premium-audit.mjs', critical: false, weight: 3, fastSkip: true },
    { id: 'accessibility', category: 'accessibility', label: 'Accessibility', script: 'scripts/check-accessibility.mjs', critical: true, weight: 5 },
    { id: 'health', category: 'performance', label: 'Application health', script: 'scripts/application-health.mjs', critical: false, weight: 4 },
    { id: 'production-polish', category: 'performance', label: 'Production polish', script: 'scripts/production-polish-audit.mjs', critical: false, weight: 3 },
    { id: 'logging', category: 'performance', label: 'Production logging / silence', script: 'scripts/test-production-logging.mjs', critical: true, weight: 3 },

    // —— Guardians / RC polish ——
    { id: 'console-guardian', category: 'guardians', label: 'Console Guardian', script: 'scripts/test-console-guardian.mjs', critical: true, weight: 3 },
    { id: 'ui-guardian', category: 'guardians', label: 'UI Guardian', script: 'scripts/test-ui-guardian.mjs', critical: true, weight: 3 },
    { id: 'map-guardian', category: 'guardians', label: 'Map Guardian', script: 'scripts/test-map-guardian.mjs', critical: true, weight: 4 },
    { id: 'memory-cleaner', category: 'guardians', label: 'Memory Cleaner', script: 'scripts/test-memory-cleaner.mjs', critical: false, weight: 2 },
    { id: 'self-heal-39', category: 'guardians', label: 'Self Healing 39', script: 'scripts/test-self-healing-39.mjs', critical: false, weight: 2 },

    // —— Inne krytyczne produktowe ——
    { id: 'auth', category: 'tests', label: 'Auth flow', script: 'scripts/test-auth-flow.mjs', critical: false, weight: 3 },
    { id: 'product-images', category: 'tests', label: 'Product images', script: 'scripts/test-product-images.mjs', critical: false, weight: 2 },
    { id: 'reviews', category: 'tests', label: 'Reviews images', script: 'scripts/test-reviews-image.mjs', critical: false, weight: 2 }
];

function runOne(item) {
    const scriptPath = join(ROOT, item.script);
    if (!existsSync(scriptPath)) {
        return {
            id: item.id,
            category: item.category,
            label: item.label,
            critical: Boolean(item.critical),
            weight: item.weight || 3,
            status: 'skip',
            exit: null,
            ms: 0,
            detail: 'script missing'
        };
    }

    const started = Date.now();
    const r = spawnSync(process.execPath, [item.script], {
        cwd: ROOT,
        encoding: 'utf8',
        timeout: item.timeoutMs || 90000,
        maxBuffer: 8 * 1024 * 1024
    });
    const ms = Date.now() - started;
    const out = `${r.stdout || ''}\n${r.stderr || ''}`.trim();
    const tail = out.split('\n').filter(Boolean).slice(-4).join(' | ');

    let status = 'pass';
    if (r.error?.code === 'ETIMEDOUT' || r.signal === 'SIGTERM') {
        status = 'fail';
    } else if (r.status !== 0) {
        status = 'fail';
    }

    // Functional: Overpass/OSM 504/timeout to flaky external — nie blokuj Ready jako critical
    let critical = Boolean(item.critical);
    if (
        status === 'fail' &&
        item.id === 'functional' &&
        /OSM.*(504|timeout|Retry)/i.test(out) &&
        !/Błędy:\s*[1-9]|❌\s*Błędy:\s*[1-9]/i.test(out)
    ) {
        critical = false;
        status = 'fail';
    }

    return {
        id: item.id,
        category: item.category,
        label: item.label,
        critical,
        weight: item.weight || 3,
        status,
        exit: r.status,
        ms,
        detail: status === 'pass' ? (tail || 'OK') : (tail || r.error?.message || `exit ${r.status}`),
        output: VERBOSE ? out.slice(-4000) : undefined,
        softExternal: item.id === 'functional' && !critical && status === 'fail' ? 'osm-flaky' : undefined
    };
}

function computeScore(results) {
    const runnable = results.filter((r) => r.status !== 'skip');
    const totalWeight = runnable.reduce((n, r) => n + r.weight, 0) || 1;
    const earned = runnable.reduce((n, r) => n + (r.status === 'pass' ? r.weight : 0), 0);
    let score = Math.round((earned / totalWeight) * 100);

    const criticalFails = runnable.filter((r) => r.critical && r.status === 'fail').length;
    const highFails = runnable.filter((r) => !r.critical && r.status === 'fail').length;

    // Extra penalty for critical (so Ready stays honest)
    score = Math.max(0, score - criticalFails * 3);

    return {
        score,
        criticalFails,
        highFails,
        passed: runnable.filter((r) => r.status === 'pass').length,
        failed: runnable.filter((r) => r.status === 'fail').length,
        skipped: results.filter((r) => r.status === 'skip').length,
        total: runnable.length
    };
}

function readyVerdict(summary) {
    const ready = summary.criticalFails === 0 && summary.score >= 90;
    let reason = '';
    if (!ready) {
        const parts = [];
        if (summary.criticalFails > 0) {
            parts.push(
                `${summary.criticalFails} krytyczn${summary.criticalFails === 1 ? 'y błąd' : summary.criticalFails < 5 ? 'e błędy' : 'ych błędów'}`
            );
        }
        if (summary.score < 90) {
            parts.push(`Release Score ${summary.score}/100 (< 90)`);
        }
        if (summary.highFails > 0 && summary.criticalFails === 0) {
            parts.push(`${summary.highFails} niekrytyczne fail(e)`);
        }
        reason = parts.join(' · ') || 'warunki wydania niespełnione';
    }
    return { ready, reason };
}

function printBoard({ score, ready, reason }) {
    const line = '══════════════════════════════════════';
    console.log('');
    console.log(line);
    console.log('  RELEASE VALIDATOR · ETAP 44');
    console.log(line);
    console.log('');
    console.log('Release Score');
    console.log(`  ${score} / 100`);
    console.log('');
    console.log('Ready for Production');
    console.log(`  ${ready ? 'YES' : 'NO'}`);
    if (!ready) {
        console.log('');
        console.log('Powód:');
        console.log(`  ${reason}`);
    }
    console.log('');
    console.log(line);
    console.log('');
}

function byCategory(results) {
    const map = {};
    for (const r of results) {
        if (!map[r.category]) map[r.category] = [];
        map[r.category].push(r);
    }
    return map;
}

function toMarkdown(report) {
    const lines = [
        '# ETAP 44 — Release Validator',
        '',
        `**Data:** ${report.generatedAt.slice(0, 10)}  `,
        `**Release Score:** **${report.summary.score} / 100**  `,
        `**Ready for Production:** **${report.ready ? 'YES' : 'NO'}**  `,
        report.ready ? '' : `**Powód:** ${report.reason}`,
        '',
        '## Podsumowanie',
        '',
        `| Metryka | Wartość |`,
        `|---------|---------|`,
        `| Score | ${report.summary.score}/100 |`,
        `| Ready | ${report.ready ? 'YES' : 'NO'} |`,
        `| Pass | ${report.summary.passed}/${report.summary.total} |`,
        `| Critical fails | ${report.summary.criticalFails} |`,
        `| Other fails | ${report.summary.highFails} |`,
        `| Skipped | ${report.summary.skipped} |`,
        `| Fast mode | ${report.fast ? 'yes' : 'no'} |`,
        '',
        '## Suite',
        '',
        '| ID | Category | Critical | Status | ms | Detail |',
        '|----|----------|:--------:|:------:|---:|--------|'
    ];
    for (const r of report.results) {
        lines.push(
            `| ${r.id} | ${r.category} | ${r.critical ? 'yes' : ''} | ${r.status} | ${r.ms} | ${String(r.detail).replace(/\|/g, '/').slice(0, 120)} |`
        );
    }
    if (!report.ready) {
        lines.push('', '## Failed (critical)', '');
        for (const r of report.results.filter((x) => x.critical && x.status === 'fail')) {
            lines.push(`- **${r.label}** (\`${r.id}\`) — ${r.detail}`);
        }
    }
    lines.push('', '---', '', `*npm run release-validator*`, '');
    return lines.join('\n');
}

// ——— run ———
const queue = SUITE.filter((item) => !(FAST && item.fastSkip));
if (!VERBOSE) {
    // cisza podczas suite — tylko końcowa tablica
} else {
    console.log(`[Release Validator] running ${queue.length} checks${FAST ? ' (fast)' : ''}…`);
}

const results = [];
for (const item of queue) {
    if (VERBOSE) process.stdout.write(`  · ${item.id}… `);
    const r = runOne(item);
    results.push(r);
    if (VERBOSE) {
        console.log(r.status === 'pass' ? 'PASS' : r.status === 'skip' ? 'SKIP' : 'FAIL');
    }
}

const summary = computeScore(results);
const { ready, reason } = readyVerdict(summary);

const report = {
    id: 'etap-44-release-validator',
    title: 'ETAP 44 — Release Validator',
    generatedAt: new Date().toISOString(),
    fast: FAST,
    verbose: VERBOSE,
    summary: {
        ...summary,
        categories: Object.fromEntries(
            Object.entries(byCategory(results)).map(([k, list]) => [
                k,
                {
                    pass: list.filter((x) => x.status === 'pass').length,
                    fail: list.filter((x) => x.status === 'fail').length,
                    skip: list.filter((x) => x.status === 'skip').length
                }
            ])
        )
    },
    ready,
    reason,
    board: {
        releaseScore: summary.score,
        readyForProduction: ready ? 'YES' : 'NO',
        reason: ready ? null : reason
    },
    results,
    policy: {
        readyRequires: 'criticalFails === 0 && score >= 90',
        consoleDefault: 'board-only',
        architectureUnchanged: true
    }
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_JSON, JSON.stringify(report, null, 2), 'utf8');
writeFileSync(OUT_LATEST, JSON.stringify({
    releaseScore: summary.score,
    readyForProduction: ready ? 'YES' : 'NO',
    reason: ready ? null : reason,
    generatedAt: report.generatedAt,
    criticalFails: summary.criticalFails
}, null, 2), 'utf8');
writeFileSync(OUT_MD, toMarkdown(report), 'utf8');

printBoard({ score: summary.score, ready, reason });

if (VERBOSE) {
    console.log(`Full report: ${relative(ROOT, OUT_MD)}`);
}

process.exit(ready ? 0 : 1);
