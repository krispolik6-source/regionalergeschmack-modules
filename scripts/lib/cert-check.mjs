/**
 * ETAP 45-E — certification layers: STATIC vs RUNTIME
 *
 * STATIC: struktura, importy, wersje, manifest, SW, obecność funkcji, konfiguracja
 * RUNTIME: przeglądarka · PWA · telefon · SW · localStorage · sessionStorage · Cache Storage
 *   — jeśli nie wykonano: NOT VERIFIED (nigdy PASS)
 */
export const RUNTIME_REQUIRES = [
    'browser',
    'PWA',
    'phone',
    'Service Worker',
    'localStorage',
    'sessionStorage',
    'Cache Storage'
];

/** Statyczna weryfikacja kodu / konfiguracji (Node grep, bez przeglądarki) */
export function checkStatic(fields, cond, detail = '') {
    const status = cond ? 'pass' : 'fail';
    return { ...fields, status, detail, layer: 'static' };
}

/** Wymaga runtime na urządzeniu / w przeglądarce — domyślnie NOT VERIFIED */
export function checkRuntime(fields, detail, how = '') {
    return { ...fields, status: 'not_verified', detail, how, layer: 'runtime' };
}

/** @deprecated alias */
export function checkAuto(fields, cond, detail = '') {
    return checkStatic(fields, cond, detail);
}

/** @deprecated alias */
export function checkManual(fields, detail, how = '') {
    return checkRuntime(fields, detail, how);
}

/**
 * Pomiar w Node ≠ RUNTIME VERIFIED.
 * Zapisuje nodeMeasured, status pozostaje not_verified.
 */
export function checkRuntimeNodeMeasured(fields, value, detail = '', note = '') {
    return {
        ...fields,
        status: 'not_verified',
        nodeMeasured: value,
        detail,
        note: note || 'Node benchmark — wymaga przeglądarki/PWA/telefonu',
        layer: 'runtime'
    };
}

/** Potwierdzone wykonanie runtime (manual sign-off / browser probe) */
export function checkRuntimeVerified(fields, detail, evidence = '') {
    return { ...fields, status: 'verified', detail, evidence, layer: 'runtime', runtimeVerified: true };
}

export function isRuntimeNotVerified(item) {
    return item.layer === 'runtime' && (
        item.status === 'not_verified'
        || item.status === 'runtime_required'
        || item.status === 'manual'
        || (item.status === 'pass' && !item.runtimeVerified)
    );
}

export function isRuntimeVerified(item) {
    return item.layer === 'runtime' && (item.status === 'verified' || (item.status === 'pass' && item.runtimeVerified));
}

export function staticPass(items) {
    const staticItems = items.filter((i) => i.layer === 'static');
    if (staticItems.length === 0) return true;
    return staticItems.every((i) => i.status === 'pass');
}

/** @deprecated */
export function autoPass(items) {
    return staticPass(items);
}

export function staticVerdict(items) {
    return staticPass(items) ? 'STATIC VERIFIED' : 'STATIC FAIL';
}

export function runtimeCount(items) {
    return items.filter((i) => i.layer === 'runtime').length;
}

/** @deprecated */
export function manualCount(items) {
    return items.filter((i) => isRuntimeNotVerified(i)).length;
}

export function runtimeVerdict(items) {
    const runtimeItems = items.filter((i) => i.layer === 'runtime');
    if (runtimeItems.length === 0) return 'RUNTIME VERIFIED';
    if (runtimeItems.some((i) => i.status === 'fail')) return 'RUNTIME FAIL';
    if (runtimeItems.every((i) => isRuntimeVerified(i))) return 'RUNTIME VERIFIED';
    if (runtimeItems.some((i) => isRuntimeNotVerified(i))) return 'NOT VERIFIED';
    return 'NOT VERIFIED';
}

export function gateVerdict(staticOk, subprocessOk, runtimeItems = []) {
    if (!staticOk || !subprocessOk) return 'FAIL';
    const rv = runtimeVerdict(runtimeItems);
    if (rv === 'RUNTIME FAIL') return 'FAIL';
    if (rv === 'NOT VERIFIED') return 'CONDITIONAL';
    return 'PASS';
}

export function staticSummary(items) {
    const staticItems = items.filter((i) => i.layer === 'static');
    return {
        passed: staticItems.filter((i) => i.status === 'pass').length,
        total: staticItems.length,
        failed: staticItems.filter((i) => i.status === 'fail').length,
        verdict: staticVerdict(items)
    };
}

export function runtimeSummary(items) {
    const runtimeItems = items.filter((i) => i.layer === 'runtime');
    return {
        required: runtimeItems.length,
        verified: runtimeItems.filter((i) => isRuntimeVerified(i)).length,
        failed: runtimeItems.filter((i) => i.status === 'fail').length,
        notVerified: runtimeItems.filter((i) => isRuntimeNotVerified(i)).length,
        verdict: runtimeVerdict(items)
    };
}

export function statusIcon(item) {
    if (item.layer === 'runtime') {
        if (isRuntimeVerified(item)) return '✅';
        if (item.status === 'fail') return '❌';
        return '⏳';
    }
    if (item.layer === 'static') {
        return item.status === 'pass' ? '✅' : '❌';
    }
    return item.status === 'pass' ? '✅' : '❌';
}

export function statusLabel(item) {
    if (item.layer === 'runtime') {
        if (isRuntimeVerified(item)) return 'RUNTIME VERIFIED';
        if (item.status === 'fail') return 'RUNTIME FAIL';
        return 'NOT VERIFIED';
    }
    if (item.layer === 'static') {
        return item.status === 'pass' ? 'STATIC VERIFIED' : 'STATIC FAIL';
    }
    return item.status === 'pass' ? 'PASS' : 'FAIL';
}
