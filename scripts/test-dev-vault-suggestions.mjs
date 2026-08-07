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
    STREAM_STATUS_HEADING,
    extractMarkdownExcerpt,
    looksLikeFileName,
    STREAM_ENTRY_NO_DETAILS,
    enrichStreamEntriesWithDescriptions,
    getStreamEntryFixProposal,
    hasStreamEntryFixProposal,
    getStreamEntryApplyMeta,
    getStreamEntryFixProposalSummary,
    OWNER_APPROVED_FIX_NOTE,
    FAILED_MANUAL_ANALYSIS_HINT
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

ok('looksLikeFileName latest.md', looksLikeFileName('latest.md'));
ok('looksLikeFileName rejects sentence', !looksLikeFileName('Rozważ zwiększenie kontrastu przycisku.'));

const mdSample = `# Living Region — 2026-08-03

> Status: INFO

Rozważ zwiększenie kontrastu przycisku primary w stopce.
Druga linia nie powinna dominować.`;
ok('markdown excerpt', extractMarkdownExcerpt(mdSample).includes('kontrastu'));
ok('markdown excerpt length', extractMarkdownExcerpt(mdSample).length <= 112);

const docEntry = {
    kind: 'doc',
    streamId: 'doc-test',
    streamStatus: STREAM_STATUS.INFO,
    rel: 'docs/intelligence/latest.md',
    name: 'latest.md',
    title: 'latest.md · bieżący'
};
await enrichStreamEntriesWithDescriptions([{
    ...docEntry,
    mdExcerpt: 'Rozważ zwiększenie kontrastu przycisków w menu bocznym.'
}]);
const docDesc = getStreamEntryDescription({
    ...docEntry,
    mdExcerpt: 'Rozważ zwiększenie kontrastu przycisków w menu bocznym.'
});
ok('doc description not filename', !docDesc.text.includes('latest.md'));
ok('doc description has content', docDesc.text.includes('kontrastu'));

const emptyDocDesc = getStreamEntryDescription({
    kind: 'doc',
    streamStatus: STREAM_STATUS.INFO,
    name: 'latest.md',
    mdExcerpt: ''
});
ok('empty doc default message', emptyDocDesc.text === STREAM_ENTRY_NO_DETAILS);

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
ok('cannot apply FAILED without fix', !canApplyStreamEntry(failedEntry));
ok('failed desc tone', getStreamEntryDescription(failedEntry).tone === 'failed');
ok('failed manual hint', getStreamEntryApplyMeta(failedEntry).hint === FAILED_MANUAL_ANALYSIS_HINT);

const failedWithFix = {
    kind: 'system',
    streamId: 'test-failed-fix',
    streamStatus: STREAM_STATUS.FAILED,
    systemEntry: {
        id: 'report-hr-failed-fix',
        source: 'healingReport',
        status: HEALING_STATUS.FAILED,
        description: 'Błąd połączenia z Overpass API',
        aiProposal: {
            fixSuggestion: {
                file: 'js/data/osmService.js',
                description: 'Błąd API mapy — dodaj retry lub fallback na cache.',
                suggestedCode: 'const res = await fetch(url, { cache: "no-store" });'
            }
        }
    }
};
ok('FAILED with fixSuggestion detected', hasStreamEntryFixProposal(failedWithFix));
ok('can apply FAILED with fix', canApplyStreamEntry(failedWithFix));
ok('apply meta shows proposal', getStreamEntryApplyMeta(failedWithFix).hint.includes('Proponowana naprawa'));
ok('apply meta enabled', getStreamEntryApplyMeta(failedWithFix).enabled === true);

localStorage.removeItem(HEALING_REPORT_KEY);
addHealingReportEntry({
    status: HEALING_STATUS.FAILED,
    component: 'osmService.js',
    description: 'Błąd połączenia z Overpass API',
    aiProposal: {
        fixSuggestion: failedWithFix.systemEntry.aiProposal.fixSuggestion
    }
});
const failedUnified = buildUnifiedSystemHealth().entries.find((e) => e.status === HEALING_STATUS.FAILED);
const failedStreamEntry = {
    kind: 'system',
    streamId: 'test-failed-apply',
    streamStatus: STREAM_STATUS.FAILED,
    systemEntry: failedUnified
};
const approveResult = await applyStreamSuggestion(failedStreamEntry);
ok('owner approve FAILED fix', approveResult.ok === true);
ok('owner approve note', approveResult.message === OWNER_APPROVED_FIX_NOTE);
const reportAfter = getHealingReport();
ok('healingReport owner note', reportAfter.entries.some((e) => e.ownerNote === OWNER_APPROVED_FIX_NOTE));

addHealingReportEntry({
    status: HEALING_STATUS.SUGGESTION,
    component: 'searchFilter.js',
    description: 'Dodaj limit 20 w searchFilter.js'
});
const suggestionUnified = buildUnifiedSystemHealth().entries.find(
    (e) => e.source === 'healingReport' && e.status === HEALING_STATUS.SUGGESTION
);
const suggestionStreamEntry = {
    kind: 'system',
    streamId: 'test-suggestion-1',
    streamStatus: STREAM_STATUS.SUGGESTION,
    systemEntry: suggestionUnified
};

const applyResult = await applyStreamSuggestion(suggestionStreamEntry);
ok('apply suggestion ok', applyResult.ok === true);
ok('apply marks ready or applied', applyResult.applied === true || applyResult.readyToDeploy === true);

const refreshed = buildUnifiedSystemHealth().entries.find((e) => e.id === suggestionUnified.id);
ok('persist owner action', refreshed?.deployReady === true || refreshed?.status === HEALING_STATUS.FIXED);

const rejectTarget = {
    kind: 'system',
    streamId: 'test-reject-1',
    systemEntry: {
        id: suggestionUnified.id,
        source: suggestionUnified.source,
        status: HEALING_STATUS.SUGGESTION,
        description: 'temp'
    }
};
const rejectResult = await rejectStreamSuggestion(rejectTarget);
ok('reject ok', rejectResult.ok === true);
ok('dismissed filter', filterDismissedStreamEntries([rejectTarget]).length === 0);

console.log(`RESULT ${fail === 0 ? 'PASS' : 'FAIL'} (${pass} ok, ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
