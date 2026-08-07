/**
 * Test: Inteligentna Diagnoza (diagnosticSweep)
 */
if (typeof localStorage === 'undefined') {
    const store = new Map();
    globalThis.localStorage = {
        getItem: (k) => (store.has(k) ? store.get(k) : null),
        setItem: (k, v) => { store.set(k, String(v)); },
        removeItem: (k) => { store.delete(k); }
    };
}

const origFetch = globalThis.fetch;

globalThis.fetch = async (url, options = {}) => {
    const u = String(url);
    if (u.includes('overpass-api.de') || u.includes('interpreter')) {
        return { ok: true, status: 200, json: async () => ({ elements: [] }) };
    }
    if (u.includes('mymemory.translated.net')) {
        return { ok: true, status: 200, json: async () => ({ responseData: { translatedText: 'hallo' } }) };
    }
    if (u.includes('manifest.json')) {
        return {
            ok: true,
            status: 200,
            json: async () => ({ name: 'Regionaler Geschmack', icons: [{ src: '/icon.png' }] })
        };
    }
    if (u.includes('pagead2.googlesyndication.com')) {
        return { ok: true, status: 200 };
    }
    if (typeof origFetch === 'function') return origFetch(url, options);
    return { ok: false, status: 404 };
};

const {
    HEALING_REPORT_KEY,
    HEALING_STATUS,
    getHealingReport
} = await import('../js/core/selfHealingLogger.js');

const {
    worstSweepLevel,
    resolveSweepOverallStatus,
    formatSweepCheckLine,
    formatSweepSummaryDescription,
    checkProducersRegistry,
    checkTranslationKeys,
    checkCacheHealth,
    runDiagnosticSweep,
    persistDiagnosticSweepReport,
    SWEEP_REPORT_TAG
} = await import('../js/diagnostics/diagnosticSweep.js');

let pass = 0;
let fail = 0;

function ok(label, cond) {
    if (cond) {
        pass += 1;
        console.log(`OK ${label}`);
    } else {
        fail += 1;
        console.error(`FAIL ${label}`);
    }
}

ok('worst level fail', worstSweepLevel('ok', 'fail') === 'fail');
ok('worst level warn', worstSweepLevel('ok', 'warn') === 'warn');
ok('overall all ok', resolveSweepOverallStatus([
    { level: 'ok' }, { level: 'ok' }
]) === HEALING_STATUS.FIXED);
ok('overall warn', resolveSweepOverallStatus([
    { level: 'ok' }, { level: 'warn' }
]) === HEALING_STATUS.SUGGESTION);
ok('overall fail', resolveSweepOverallStatus([
    { level: 'warn' }, { level: 'fail' }
]) === HEALING_STATUS.FAILED);

const sampleChecks = [
    { id: 'network', area: 'Sieć', level: 'ok', message: 'Overpass OK' },
    { id: 'cache', area: 'Cache', level: 'warn', message: 'wymaga czyszczenia' }
];
ok('format line green', formatSweepCheckLine(sampleChecks[0]).startsWith('✅'));
ok('format line orange', formatSweepCheckLine(sampleChecks[1]).startsWith('🟡'));
ok('summary multiline', formatSweepSummaryDescription(sampleChecks).includes('\n'));

const producers = await checkProducersRegistry();
ok('producers check', producers.level === 'ok' || producers.level === 'warn');
ok('producers message', Boolean(producers.message));

const i18n = await checkTranslationKeys();
ok('i18n check level', ['ok', 'warn', 'fail'].includes(i18n.level));
ok('i18n message', Boolean(i18n.message));

const cache = await checkCacheHealth();
ok('cache check', Boolean(cache.area === 'Cache'));

localStorage.removeItem(HEALING_REPORT_KEY);
const sweep = await runDiagnosticSweep({ reason: 'test' });
ok('sweep runs', Array.isArray(sweep.checks) && sweep.checks.length >= 8);
ok('sweep has network', sweep.checks.some((c) => c.id === 'network'));
ok('sweep has i18n', sweep.checks.some((c) => c.id === 'i18n'));
ok('sweep summary', sweep.summary.includes('Sieć') || sweep.summary.includes('✅'));

const id = persistDiagnosticSweepReport(sweep);
ok('persist id', Boolean(id));
const report = getHealingReport();
const auditRow = report.entries.find((e) => e.reportTag === SWEEP_REPORT_TAG);
ok('audit tag', auditRow?.reportTag === SWEEP_REPORT_TAG);
ok('audit checks stored', Array.isArray(auditRow?.auditChecks) && auditRow.auditChecks.length >= 8);
ok('audit description', String(auditRow?.description || '').includes('✅') || String(auditRow?.description || '').includes('🟡'));

console.log(`RESULT ${fail === 0 ? 'PASS' : 'FAIL'} (${pass} ok, ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
