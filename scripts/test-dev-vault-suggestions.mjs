/**
 * Test: interaktywne sugestie Developer Vault
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
    HEALING_REPORT_KEY,
    HEALING_STATUS,
    addHealingReportEntry,
    getHealingReport,
    buildUnifiedSystemHealth
} = await import('../js/core/selfHealingLogger.js');

const {
    getStreamEntryDescription,
    canApplyStreamEntry,
    applyStreamSuggestion,
    rejectStreamSuggestion,
    filterDismissedStreamEntries,
    isStreamEntryDeployReady,
    STREAM_STATUS_HEADING
} = await import('../js/diagnostics/devVaultSuggestions.js');

const { STREAM_STATUS } = await import('../js/diagnostics/reportManagerClient.js');

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

ok('FIXED heading', STREAM_STATUS_HEADING.FIXED.label === 'Co zostało naprawione');
ok('SUGGESTION heading', STREAM_STATUS_HEADING.SUGGESTION.label === 'Co sugeruję do poprawy');
ok('FAILED heading', STREAM_STATUS_HEADING.FAILED.label === 'Co jest problemem');
ok('INFO heading', STREAM_STATUS_HEADING.INFO.label === 'Co proponuję zmienić');

localStorage.removeItem(HEALING_REPORT_KEY);
addHealingReportEntry({
    status: HEALING_STATUS.SUGGESTION,
    component: 'searchFilter.js',
    description: 'Dodaj limit 20 w searchFilter.js'
});

const unified = buildUnifiedSystemHealth();
const sysEntry = unified.entries.find((e) => e.source === 'healingReport');
ok('unified suggestion entry', Boolean(sysEntry));

const streamEntry = {
    kind: 'system',
    streamId: 'test-suggestion-1',
    streamStatus: STREAM_STATUS.SUGGESTION,
    systemEntry: sysEntry
};

const desc = getStreamEntryDescription(streamEntry);
ok('description text', desc.text.includes('limit 20'));
ok('description tone suggestion', desc.tone === 'suggestion');

ok('can apply suggestion', canApplyStreamEntry(streamEntry));

const failedEntry = {
    kind: 'system',
    streamId: 'test-failed-1',
    streamStatus: STREAM_STATUS.FAILED,
    systemEntry: {
        source: 'healingReport',
        status: HEALING_STATUS.FAILED,
        description: 'Błąd połączenia z Overpass API'
    }
};
ok('cannot apply FAILED', !canApplyStreamEntry(failedEntry));
ok('failed desc tone', getStreamEntryDescription(failedEntry).tone === 'failed');

const applyResult = await applyStreamSuggestion(streamEntry);
ok('apply suggestion ok', applyResult.ok === true);
ok('apply marks ready or applied', applyResult.applied === true || applyResult.readyToDeploy === true);

const refreshed = buildUnifiedSystemHealth().entries.find((e) => e.id === sysEntry.id);
ok('persist owner action', refreshed?.deployReady === true || refreshed?.status === HEALING_STATUS.FIXED);

const rejectTarget = {
    kind: 'system',
    streamId: 'test-reject-1',
    systemEntry: {
        id: sysEntry.id,
        source: sysEntry.source,
        status: HEALING_STATUS.SUGGESTION,
        description: 'temp'
    }
};
const rejectResult = await rejectStreamSuggestion(rejectTarget);
ok('reject ok', rejectResult.ok === true);
ok('dismissed filter', filterDismissedStreamEntries([rejectTarget]).length === 0);

console.log(`RESULT ${fail === 0 ? 'PASS' : 'FAIL'} (${pass} ok, ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
