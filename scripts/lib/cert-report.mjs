/**
 * ETAP 45-E — wspólne budowanie raportu bramki certyfikacji
 */
import {
    staticPass,
    staticVerdict,
    runtimeVerdict,
    staticSummary,
    runtimeSummary,
    manualCount,
    gateVerdict
} from './cert-check.mjs';

export function runtimeFromManual(manualSteps, labelFn = (m) => m.title || m.id) {
    return manualSteps.map((m) => ({
        id: `RT-${m.id}`,
        label: labelFn(m),
        status: 'not_verified',
        layer: 'runtime',
        detail: m.pass || m.steps?.join(' · ') || '',
        device: m.device || null,
        requires: ['browser', 'PWA', 'phone']
    }));
}

export function buildGateReport({ items, automated = [], etap, extra = {} }) {
    const staticOk = staticPass(items);
    const subprocessOk = !automated.length || automated.every((a) => a.ok);
    const verdict = gateVerdict(staticOk, subprocessOk, items);
    const manualRequired = manualCount(items);

    return {
        etap,
        verdict,
        staticVerdict: staticVerdict(items),
        runtimeVerdict: runtimeVerdict(items),
        static: staticSummary(items),
        runtime: runtimeSummary(items),
        manualRequired,
        runtimeRequires: ['browser', 'PWA', 'phone', 'Service Worker', 'localStorage', 'sessionStorage', 'Cache Storage'],
        automated: automated.length
            ? {
                passed: automated.filter((a) => a.ok).length,
                total: automated.length,
                runs: automated
            }
            : undefined,
        ...extra
    };
}

export function gateExitCode(verdict) {
    return verdict === 'FAIL' ? 1 : 0;
}
