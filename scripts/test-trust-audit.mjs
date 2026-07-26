/**
 * Smoke test ETAP 33C — Producer Trust Audit
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
    POLICY,
    CHECK_IDS,
    buildTrustAuditReport,
    scoreProducerTrust,
    findDuplicateGroups,
    checkPhone,
    checkCoordinates
} from '../js/intelligence/producerTrustAudit.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function assert(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error(`❌ ${msg}`);
    } else {
        console.log(`✅ ${msg}`);
    }
}

assert(POLICY.autoFix === false, 'autoFix false');
assert(POLICY.mutatesProducerData === false, 'no data mutation');
assert(CHECK_IDS.length === 7, '7 checks');

const core = readFileSync(join(ROOT, 'js/intelligence/producerTrustAudit.js'), 'utf8');
assert(!/localStorage\.setItem|writeFileSync\([^)]*contentProducers/.test(core), 'nie zapisuje do producer store');
assert(!/navigateTo|innerHTML/.test(core), 'bez UI');

const good = {
    id: 'p1',
    name: 'Hof Test',
    phone: '+49 5424 123456',
    website: 'https://example.de',
    openingHours: 'Mo-Sa 09:00-18:00',
    lat: 52.14,
    lng: 8.04,
    photos: ['https://cdn.example/hof.jpg'],
    products: [{ id: 'a', name: 'Brot' }, { id: 'b', name: 'Honig' }, { id: 'c', name: 'Eier' }]
};
const scored = scoreProducerTrust(good, new Map());
assert(scored.trustScore >= 85, `good producer high score (got ${scored.trustScore})`);

assert(checkPhone({}).ok === false, 'missing phone fails');
assert(checkCoordinates({ lat: 0, lng: 0 }).ok === false, '0,0 coords fail');

const dupes = findDuplicateGroups([
    { id: 'a', name: 'Hof X', phone: '+491234567890', lat: 52.1, lng: 8.0 },
    { id: 'b', name: 'Hof Y', phone: '+49 123 4567890', lat: 52.2, lng: 8.1 }
]);
assert((dupes.get('a') || []).includes('b'), 'duplicate phone detected');

const report = buildTrustAuditReport([
    good,
    { id: 'p2', name: 'Empty Shop', lat: 50, lng: 7 }
], { day: '2026-07-22', reason: 'unit' });
assert(report.producers.length === 2, '2 producers');
assert(report.summary.averageTrustScore >= 0, 'avg score');
assert(report.policy.autoFix === false, 'report autoFix');

const cli = spawnSync(process.execPath, ['scripts/trust-audit.mjs'], {
    cwd: ROOT,
    encoding: 'utf8'
});
assert(cli.status === 0, `CLI exit 0 (got ${cli.status})`);
assert(existsSync(join(ROOT, 'docs/trust/latest.md')), 'latest.md');

const md = readFileSync(join(ROOT, 'docs/trust/latest.md'), 'utf8');
assert(/Trust Score/i.test(md), 'md Trust Score');
assert(/autoFix/i.test(md), 'md autoFix');
assert(/telefon|phone/i.test(md), 'md phone check');

const appJs = readFileSync(join(ROOT, 'js/app.js'), 'utf8');
assert(!/producerTrustAudit/.test(appJs), 'app.js bez importu trust audit');

if (failed) {
    console.error(`\n${failed} failed`);
    process.exit(1);
}
console.log('\n--- Trust Audit test ---');
console.log('OK');
