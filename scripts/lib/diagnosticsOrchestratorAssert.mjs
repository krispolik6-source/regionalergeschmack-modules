/**
 * Wspólne asercje ETAP 42D — diagnostyka lazy przez orchestrator.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export function readDiagnosticsWiring(root) {
    return {
        app: readFileSync(join(root, 'js/app.js'), 'utf8'),
        orch: readFileSync(join(root, 'js/diagnostics/diagnosticsOrchestrator.js'), 'utf8')
    };
}

/**
 * @param {(cond: boolean, msg: string) => void} assert
 * @param {string} root
 * @param {string} lazyInitCall np. `memoryCleaner.initMemoryCleaner`
 * @param {string} [label]
 */
export function assertLazyDiagnosticsInit(assert, root, lazyInitCall, label) {
    const { app, orch } = readDiagnosticsWiring(root);
    assert(app.includes('initDiagnosticsOrchestrator'), 'app.js orchestrator');
    assert(orch.includes(lazyInitCall), label || `orchestrator lazy: ${lazyInitCall}`);
}
