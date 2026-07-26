/**
 * Smoke test — wspólna polityka inteligencji
 */
import {
    INTELLIGENCE_POLICY,
    INTELLIGENCE_PRINCIPLES,
    createModulePolicy,
    passesValueNotFeatureTest
} from '../js/intelligence/policy.js';
import { POLICY as brain } from '../js/intelligence/regionalBrain.js';
import { POLICY as taste } from '../js/intelligence/userTasteProfile.js';
import { POLICY as trust } from '../js/intelligence/producerTrustAudit.js';
import { POLICY as product } from '../js/intelligence/productIntelligenceDaily.js';
import { POLICY as living } from '../js/intelligence/livingRegionAi.js';

let failed = 0;
function assert(cond, msg) {
    if (!cond) {
        failed += 1;
        console.error(`❌ ${msg}`);
    } else {
        console.log(`✅ ${msg}`);
    }
}

assert(INTELLIGENCE_POLICY.autoApply === false, 'base autoApply');
assert(INTELLIGENCE_POLICY.chatbot === false, 'base chatbot');
assert(INTELLIGENCE_POLICY.reportToOwner === true, 'report to owner');
assert(INTELLIGENCE_PRINCIPLES.length === 8, '8 principles');

const locked = createModulePolicy({ autoApply: true, chatbot: true, role: 'x' });
assert(locked.autoApply === false, 'cannot override autoApply');
assert(locked.chatbot === false, 'cannot override chatbot');
assert(locked.role === 'x', 'role preserved');

for (const [name, p] of Object.entries({ brain, taste, trust, product, living })) {
    assert(p.autoApply === false, `${name} autoApply`);
    assert(p.chatbot === false, `${name} chatbot`);
    assert(p.reportToOwner === true, `${name} reportToOwner`);
    assert(p.uiChanges === false, `${name} uiChanges`);
}

assert(passesValueNotFeatureTest({ title: 'Defer Leaflet', expectedEffect: 'Szybszy Home' }), 'value ok');
assert(!passesValueNotFeatureTest({ title: 'Dodaj chatbot AI', addsFeature: true }), 'feature bloat rejected');

if (failed) {
    console.error(`\n${failed} failed`);
    process.exit(1);
}
console.log('\n--- Intelligence policy test ---');
console.log('OK');
