import { SEVERITY } from '../config.mjs';

/** ASCII-only key (unikamy homoglifów Unicode w identyfikatorach). */
const SEV_KEY = 'sever' + 'ity';

/**
 * @typedef {{
 *   id: string,
 *   module: string,
 *   severity: 'critical'|'high'|'medium'|'cosmetic',
 *   title: string,
 *   cause: string,
 *   files: string[],
 *   proposal: string,
 *   performanceImpact: string,
 *   regressionRisk: string,
 *   tags?: string[]
 * }} Finding
 */

let seq = 0;

/**
 * @param {object} input
 * @returns {Finding}
 */
function pickSeverity(input) {
    if (!input || typeof input !== 'object') return SEVERITY.medium;
    if (input[SEV_KEY]) return input[SEV_KEY];
    const allowed = new Set(['critical', 'high', 'medium', 'cosmetic']);
    for (const key of Object.keys(input)) {
        const val = input[key];
        if (allowed.has(val) && /sev/i.test(key)) return val;
    }
    return SEVERITY.medium;
}

export function finding(input) {
    seq += 1;
    const severity = pickSeverity(input);
    return {
        id: input.id || `${input.module}-${seq}`,
        module: input.module,
        [SEV_KEY]: severity,
        title: input.title,
        cause: input.cause,
        files: input.files || [],
        proposal: input.proposal,
        performanceImpact: input.performanceImpact || 'niski',
        regressionRisk: input.regressionRisk || 'niskie',
        tags: input.tags || []
    };
}

export function resetFindingSeq() {
    seq = 0;
}

export function getSeverity(f) {
    return f?.[SEV_KEY] || f?.severityity || SEVERITY.medium;
}

export function scoreFromFindings(findings) {
    const weights = { critical: 18, high: 10, medium: 4, cosmetic: 1 };
    let penalty = 0;
    for (const f of findings) {
        penalty += weights[getSeverity(f)] || 2;
    }
    const score = Math.max(1, Math.min(10, 10 - penalty / 12));
    return Math.round(score * 10) / 10;
}

export function groupBySeverity(findings) {
    return {
        critical: findings.filter((f) => getSeverity(f) === SEVERITY.critical),
        high: findings.filter((f) => getSeverity(f) === SEVERITY.high),
        medium: findings.filter((f) => getSeverity(f) === SEVERITY.medium),
        cosmetic: findings.filter((f) => getSeverity(f) === SEVERITY.cosmetic)
    };
}

export { SEV_KEY };
