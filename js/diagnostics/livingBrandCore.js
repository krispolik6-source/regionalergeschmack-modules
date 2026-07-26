/**
 * ETAP 26 – Living Brand · agregacja findings → raport
 */

import { POLICY } from './livingBrandBook.js';

const CHECK_IDS = [
    'logo',
    'colors',
    'icons',
    'photos',
    'coldBlue',
    'fonts',
    'shadows'
];

/**
 * @typedef {object} BrandFinding
 * @property {string} check
 * @property {'critical'|'high'|'medium'|'low'} severity
 * @property {string} title
 * @property {string} [detail]
 * @property {string} [file]
 * @property {string} [value]
 */

/**
 * @param {BrandFinding[]} findings
 * @param {object} [meta]
 */
export function buildLivingBrandReport(findings = [], meta = {}) {
    const byCheck = Object.fromEntries(CHECK_IDS.map((id) => [id, []]));
    for (const f of findings) {
        const key = CHECK_IDS.includes(f.check) ? f.check : 'colors';
        byCheck[key].push(f);
    }

    const scoreCheck = (list) => {
        let s = 100;
        for (const f of list) {
            if (f.severity === 'critical') s -= 25;
            else if (f.severity === 'high') s -= 15;
            else if (f.severity === 'medium') s -= 8;
            else s -= 3;
        }
        return Math.max(0, Math.min(100, s));
    };

    const scores = Object.fromEntries(
        CHECK_IDS.map((id) => [id, scoreCheck(byCheck[id])])
    );

    const overall = Math.round(
        Object.values(scores).reduce((a, b) => a + b, 0) / CHECK_IDS.length
    );

    const critical = findings.filter((f) => f.severity === 'critical').length;
    const high = findings.filter((f) => f.severity === 'high').length;
    const medium = findings.filter((f) => f.severity === 'medium').length;
    const low = findings.filter((f) => f.severity === 'low').length;

    let status = 'aligned';
    if (critical > 0 || high > 0) status = 'drift';
    else if (medium > 0) status = 'watch';
    else if (low > 0) status = 'almost';

    const verdict = (() => {
        if (status === 'aligned') {
            return 'Marka żyje spójnie — logo, kolory, ikony, fonty i cienie trzymają Brand Book.';
        }
        if (status === 'almost') {
            return 'Prawie idealnie — drobne odstępstwa low. Warto przejrzeć raport.';
        }
        if (status === 'watch') {
            return 'Wykryto odstępstwa średnie — marka zaczyna „pływać”. Popraw przed kolejnym dniem.';
        }
        return 'Dryf marki — coś odbiega od Brand Book. Nie auto-fix: zgłoszono do zatwierdzenia.';
    })();

    return {
        id: meta.id || `living-brand-${new Date().toISOString().replace(/[:.]/g, '-')}`,
        title: 'Living Brand – strażnik marki',
        generatedAt: meta.generatedAt || new Date().toISOString(),
        day: meta.day || new Date().toISOString().slice(0, 10),
        reason: meta.reason || 'audit',
        policy: { ...POLICY },
        question: 'Czy marka jest spójna wszędzie?',
        status,
        verdict,
        overall,
        scores,
        summary: {
            findings: findings.length,
            critical,
            high,
            medium,
            low,
            checks: CHECK_IDS.length,
            aligned: status === 'aligned' || status === 'almost'
        },
        checks: CHECK_IDS.map((id) => ({
            id,
            score: scores[id],
            ok: scores[id] >= 90,
            findingCount: byCheck[id].length,
            findings: byCheck[id]
        })),
        findings: findings.map((f, i) => ({
            id: `LB-${String(i + 1).padStart(3, '0')}`,
            status: 'reported',
            autoApply: false,
            requiresHumanAcceptance: true,
            ...f
        })),
        brandBook: {
            logo: 'assets/icons/logo-master.svg',
            motif: 'dwa złote kłosy pochylone w prawo',
            palette: 'zieleń / złoto / wheat / honey / cream',
            fonts: 'Literata + Source Sans 3',
            ban: 'zimny niebieski'
        },
        meta: meta.extra || {}
    };
}

export { CHECK_IDS };
export default { buildLivingBrandReport, CHECK_IDS };
