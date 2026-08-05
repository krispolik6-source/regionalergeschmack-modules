/**
 * Test: Self-Healing Logger — filtrowanie · retention · polityka
 */

if (typeof localStorage === 'undefined') {
    const store = new Map();
    globalThis.localStorage = {
        getItem: (k) => (store.has(k) ? store.get(k) : null),
        setItem: (k, v) => { store.set(k, String(v)); },
        removeItem: (k) => { store.delete(k); }
    };
}

const {
    isCriticalError,
    isCriticalNetworkUrl,
    cleanupOldReports,
    SELF_HEALING_LOGGER_POLICY,
    SELF_HEALING_LOG_KEY,
    HEALING_REPORT_KEY,
    HEALING_STATUS,
    addHealingReportEntry,
    generateSessionSummaryMarkdown,
    persistSessionSummaryMarkdown,
    getHealingReport,
    getLatestSystemHealthMarkdown,
    buildUnifiedSystemHealth
} = await import('../js/core/selfHealingLogger.js');

const {
    resolveSafeMitigationId,
    listSafeMitigations,
    generateFixSuggestion
} = await import('../js/core/selfHealingFixer.js');

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

ok('policy autoApply false', SELF_HEALING_LOGGER_POLICY.autoApply === false);
ok('policy usesEval false', SELF_HEALING_LOGGER_POLICY.usesEval === false);
ok('policy allowsRuntimeMitigation', SELF_HEALING_LOGGER_POLICY.allowsRuntimeMitigation === true);

ok('QuotaExceeded is critical', isCriticalError(new DOMException('quota', 'QuotaExceededError')));
ok('ResizeObserver not critical', !isCriticalError(new Error('ResizeObserver loop limit exceeded'), { source: 'window.error' }));
ok('asset 404 not critical', !isCriticalError(new Error('404'), { type: 'fetch', url: '/assets/icons/logo.svg', status: 404 }));
ok('overpass 500 critical', isCriticalError(new Error('500'), { type: 'fetch', url: 'https://overpass-api.de/api/interpreter', status: 500 }));
ok('tile osm not critical url', !isCriticalNetworkUrl('https://a.tile.openstreetmap.org/10/512/512.png'));
ok('overpass is critical url', isCriticalNetworkUrl('https://overpass-api.de/api/interpreter'));

ok('mitigation quota', resolveSafeMitigationId(new DOMException('x', 'QuotaExceededError')) === 'quota-trim');
ok('mitigation modal', resolveSafeMitigationId(new Error('openProducerModal freeze'), { area: 'producerModal' }) === 'modal-reset-opening');
ok('safe mitigations list', listSafeMitigations().length >= 4);

const modalFix = generateFixSuggestion({
    message: 'openProducerModal freeze',
    stack: 'Error: freeze\n    at openProducerModal (js/views/producerModal.js:142:10)',
    context: { area: 'producerModal' }
});
ok('fixSuggestion modal file', modalFix?.file === 'producerModal.js');
ok('fixSuggestion modal description PL', /Modal producenta/.test(modalFix?.description || ''));
ok('fixSuggestion modal code', /resetProducerModalOpeningState/.test(modalFix?.suggestedCode || ''));

ok('fixSuggestion null when fixed', generateFixSuggestion({
    message: 'fixed',
    type: 'error-fixed',
    mitigation: { applied: true }
}) === null);

localStorage.setItem(SELF_HEALING_LOG_KEY, JSON.stringify({
    version: 1,
    entries: [{
        id: 'old',
        at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'error',
        message: 'stale'
    }, {
        id: 'new',
        at: new Date().toISOString(),
        type: 'error',
        message: 'fresh'
    }]
}));
const { removed, remaining } = cleanupOldReports();
ok('cleanup removes old', removed === 1);
ok('cleanup keeps fresh', remaining === 1);
localStorage.removeItem(SELF_HEALING_LOG_KEY);

addHealingReportEntry({
    status: HEALING_STATUS.FIXED,
    component: 'producerModal.js',
    description: 'Test mitigacja runtime'
});
const report = getHealingReport();
ok('healing report entry', report.entries.length >= 1);
ok('healing report FIXED', report.entries.some((e) => e.status === 'FIXED'));

const md = generateSessionSummaryMarkdown(report);
ok('markdown summary', md.includes('System Health') && md.includes('FIXED'));

const key = persistSessionSummaryMarkdown();
ok('markdown persisted', Boolean(key));
ok('markdown readable', getLatestSystemHealthMarkdown().includes('|'));

localStorage.setItem(SELF_HEALING_LOG_KEY, JSON.stringify({
    version: 2,
    entries: [{
        id: 'orphan-log',
        at: new Date().toISOString(),
        type: 'error',
        name: 'Error',
        message: 'Orphan critical for unified test',
        stack: 'Error: test\\n    at unified.test.js:1:1',
        context: { source: 'test' }
    }]
}));
const unified = buildUnifiedSystemHealth();
ok('unified health object', unified && Array.isArray(unified.entries));
ok('unified includes report', unified.entries.some((e) => e.source === 'healingReport'));
ok('unified includes orphan log', unified.entries.some((e) => e.source === 'selfHealingLog'));
ok('unified sorted newest first', unified.entries.length < 2
    || Date.parse(unified.entries[0].timestamp) >= Date.parse(unified.entries[1].timestamp));
localStorage.removeItem(SELF_HEALING_LOG_KEY);

localStorage.removeItem(HEALING_REPORT_KEY);
if (key) localStorage.removeItem(key);

console.log(`RESULT ${fail === 0 ? 'PASS' : 'FAIL'} (${pass} ok, ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
