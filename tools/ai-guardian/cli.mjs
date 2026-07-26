#!/usr/bin/env node
/**
 * AI Guardian CLI – lokalne narzędzie developerskie
 *
 *   npm run guardian
 *   npm run guardian -- run
 *   npm run guardian -- behavior:import --file=dump.json
 *
 * Polityka: NIGDY nie zmienia kodu aplikacji, nie robi commitów, nie publikuje.
 */
import fs from 'fs';
import path from 'path';
import { POLICY, REPORTS_DIR } from './config.mjs';
import { resetFindingSeq } from './lib/findings.mjs';
import { ensureDir } from './lib/fs-utils.mjs';
import { writeReports } from './lib/report.mjs';
import { runCodeGuardian } from './modules/code-guardian.mjs';
import { runUxGuardian } from './modules/ux-guardian.mjs';
import { ingestBehaviorDump, runBehaviorGuardian } from './modules/behavior-guardian.mjs';
import { runContentGuardian } from './modules/content-guardian.mjs';
import { runPerformanceGuardian } from './modules/performance-guardian.mjs';
import { buildScores, runImprovementEngine } from './modules/improvement-engine.mjs';
import { runSelfLearning } from './modules/self-learning.mjs';

function parseArgs(argv) {
    const args = argv.slice(2);
    const cmd = args[0] || 'run';
    const flags = {};
    for (let i = 1; i < args.length; i += 1) {
        const a = args[i];
        if (a.startsWith('--')) {
            const [k, v] = a.replace(/^--/, '').split('=');
            flags[k] = v === undefined ? true : v;
        }
    }
    return { cmd, flags };
}

function reportId() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `guardian-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

async function cmdRun() {
    console.log('\n🛡  AI Guardian – skan lokalny (read-only)\n');
    console.log('Polityka:', JSON.stringify(POLICY));
    console.log('');

    resetFindingSeq();
    const id = reportId();

    const code = await runCodeGuardian();
    console.log(`✓ Code Guardian – ${code.findings.length} findingów`);

    const ux = await runUxGuardian();
    console.log(`✓ UX Guardian – ${ux.findings.length} findingów`);

    const behavior = await runBehaviorGuardian();
    console.log(`✓ Behavior Guardian – ${behavior.findings.length} findingów`);

    const content = await runContentGuardian();
    console.log(`✓ Content Guardian – ${content.findings.length} findingów`);

    const performance = await runPerformanceGuardian();
    console.log(`✓ Performance Guardian – ${performance.findings.length} findingów`);

    const findings = [
        ...code.findings,
        ...ux.findings,
        ...behavior.findings,
        ...content.findings,
        ...performance.findings
    ];

    const improvement = runImprovementEngine(findings);
    const scores = buildScores(findings, { securityBase: 8.5 });
    const learning = runSelfLearning({ findings, scores, reportId: id });

    const payload = {
        reportId: id,
        generatedAt: new Date().toISOString(),
        policy: POLICY,
        scores,
        findings,
        modules: {
            code: code.meta,
            ux: ux.meta,
            behavior: behavior.meta,
            content: content.meta,
            performance: performance.meta
        },
        improvement,
        learning: {
            ranking: learning.ranking
        },
        behaviorProposals: behavior.proposals || []
    };

    ensureDir(REPORTS_DIR);
    const paths = writeReports(payload);

    console.log('\n—— Oceny ——');
    console.log(`Jakość:              ${scores.quality}/10`);
    console.log(`UX:                  ${scores.ux}/10`);
    console.log(`Wydajność:           ${scores.performance}/10`);
    console.log(`PWA:                 ${scores.pwa}/10`);
    console.log(`Dostępność:          ${scores.accessibility}/10`);
    console.log(`Bezpieczeństwo:      ${scores.security}/10`);
    console.log(`Gotowość prod:       ${scores.productionReady}/10`);
    console.log('\n—— Findingi ——');
    console.log(improvement.grouped);
    console.log('\n—— Raporty ——');
    console.log(paths.mdPath);
    console.log(paths.htmlPath);
    console.log(paths.jsonPath);
    console.log(paths.patchesPath);
    console.log('\nPatche: status proposed – wymagana akceptacja. Guardian NIE zmienia kodu.\n');

    return payload;
}

function cmdBehaviorImport(flags) {
    const file = flags.file;
    if (!file) {
        console.error('Użycie: npm run guardian -- behavior:import --file=dump.json');
        process.exit(1);
    }
    const abs = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);
    const dump = JSON.parse(fs.readFileSync(abs, 'utf8'));
    const saved = ingestBehaviorDump(dump);
    console.log('Zaimportowano anonimowe statystyki:', Object.keys(saved.clicks || {}).length, 'kluczy kliknięć');
    console.log('Uruchom: npm run guardian -- run');
}

function cmdHelp() {
    console.log(`
AI Guardian (dev-only, lokalnie)

Komendy:
  run                 Pełny skan + raporty HTML/MD/JSON + patche (propozycje)
  behavior:import     Import dumpa z probe (--file=...)
  help                Ta pomoc

Włączenie probe (tylko localhost):
  localStorage.setItem('rg_ai_guardian_probe','1'); location.reload();
  Eksport: copy(JSON.stringify(__RG_AI_GUARDIAN__.export(),null,2))

Polityka:
  • nie zmienia kodu automatycznie
  • nie robi commitów
  • nie publikuje
  • nie wpływa na użytkowników produkcyjnych
`);
}

async function main() {
    const { cmd, flags } = parseArgs(process.argv);
    if (cmd === 'help' || cmd === '--help' || cmd === '-h') {
        cmdHelp();
        return;
    }
    if (cmd === 'behavior:import') {
        cmdBehaviorImport(flags);
        return;
    }
    if (cmd === 'run' || cmd === 'scan') {
        await cmdRun();
        return;
    }
    console.error(`Nieznana komenda: ${cmd}`);
    cmdHelp();
    process.exit(1);
}

main().catch((err) => {
    console.error('[AI Guardian] Błąd:', err);
    process.exit(1);
});
