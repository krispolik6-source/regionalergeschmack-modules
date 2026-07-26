// MODUŁ 6 – Improvement Engine (propozycje, NIGDY auto-patch kodu aplikacji)
import { SEVERITY } from '../config.mjs';
import { getSeverity, groupBySeverity } from '../lib/findings.mjs';

/**
 * @param {import('../lib/findings.mjs').Finding[]} findings
 */
export function runImprovementEngine(findings) {
    const grouped = groupBySeverity(findings);

    const patches = findings.map((f, i) => ({
        patchId: `PATCH-${String(i + 1).padStart(3, '0')}`,
        status: 'proposed', // nigdy applied automatycznie
        severity: getSeverity(f),
        title: f.title,
        cause: f.cause,
        files: f.files,
        proposedSolution: f.proposal,
        performanceImpact: f.performanceImpact,
        regressionRisk: f.regressionRisk,
        module: f.module,
        requiresHumanAcceptance: true,
        autoApply: false
    }));

    return {
        grouped: {
            critical: grouped.critical.length,
            high: grouped.high.length,
            medium: grouped.medium.length,
            cosmetic: grouped.cosmetic.length
        },
        lists: grouped,
        patches,
        policy: {
            autoModifyCode: false,
            autoCommit: false,
            autoPublish: false,
            preparePatchOnlyAfterAcceptance: true
        }
    };
}

export function buildScores(allFindings, extras = {}) {
    const byMod = (mod) => allFindings.filter((f) => f.module === mod);
    const penalize = (list) => {
        const w = { critical: 2.2, high: 1.2, medium: 0.45, cosmetic: 0.12 };
        let p = 0;
        for (const f of list) p += w[getSeverity(f)] || 0.3;
        return Math.max(1, Math.min(10, Math.round((10 - p) * 10) / 10));
    };

    const quality = penalize(allFindings);
    const ux = penalize([...byMod('ux'), ...byMod('behavior')]);
    const performance = penalize(byMod('performance'));
    const pwa = penalize(allFindings.filter((f) => (f.tags || []).includes('pwa') || (f.tags || []).includes('sw')));
    const a11y = penalize(allFindings.filter((f) => (f.tags || []).includes('a11y') || (f.tags || []).includes('contrast')));
    const security = penalize(allFindings.filter((f) => (f.tags || []).includes('security')));
    // security: jeśli brak findingów, bazuj na braku oczywistych problemów
    const securityScore = security === 10 && !allFindings.some((f) => (f.tags || []).includes('security'))
        ? (extras.securityBase ?? 8.5)
        : security;

    const productionReady = Math.round(
        ((quality + ux + performance + pwa + a11y + securityScore) / 6) * 10
    ) / 10;

    return {
        quality,
        ux,
        performance,
        pwa: Math.min(10, pwa + 0.5),
        accessibility: a11y,
        security: securityScore,
        productionReady
    };
}

export { SEVERITY };
