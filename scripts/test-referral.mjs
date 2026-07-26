import { readFileSync } from 'node:fs';

const files = {
    ref: readFileSync('js/core/referralService.js', 'utf8'),
    premium: readFileSync('js/core/premiumService.js', 'utf8'),
    auth: readFileSync('js/auth/auth.js', 'utf8'),
    register: readFileSync('js/auth/register.js', 'utf8'),
    client: readFileSync('js/views/clientPanel.js', 'utf8'),
    producer: readFileSync('js/views/producerPanel.js', 'utf8'),
    ui: readFileSync('js/views/referralSection.js', 'utf8'),
    tr: readFileSync('js/translations.js', 'utf8')
};

const checks = [
    ['REGIO- code generator', files.ref.includes('REGIO-')],
    ['ensureReferralProfile', files.ref.includes('ensureReferralProfile')],
    ['applyReferralOnRegister', files.ref.includes('applyReferralOnRegister')],
    ['referrals counter', files.ref.includes('referrals:')],
    ['extendPremiumMonths', files.premium.includes('export function extendPremiumMonths')],
    ['register uses referral', files.auth.includes('referralCode')],
    ['register form field', files.register.includes('authRegisterReferral')],
    ['client panel section', files.client.includes('renderReferralSection')],
    ['producer panel section', files.producer.includes('renderReferralSection')],
    ['status text PL', files.tr.includes('Poleciłeś {count} osób')],
    ['bonus months 3', files.ref.includes('BONUS_MONTHS = 3')]
];

let fail = 0;
for (const [name, ok] of checks) {
    console.log(ok ? 'OK' : 'FAIL', name);
    if (!ok) fail += 1;
}

// Runtime smoke with mock localStorage
globalThis.localStorage = (() => {
    const m = new Map();
    return {
        getItem: (k) => (m.has(k) ? m.get(k) : null),
        setItem: (k, v) => m.set(k, String(v)),
        removeItem: (k) => m.delete(k)
    };
})();

const {
    ensureReferralProfile,
    applyReferralOnRegister,
    getReferralStats,
    normalizeReferralCode
} = await import('../js/core/referralService.js');

const a = ensureReferralProfile('user-a');
const b = ensureReferralProfile('user-b');
console.log('code A', a.code, normalizeReferralCode(a.code).startsWith('REGIO-') ? 'OK format' : 'FAIL format');

const applied = applyReferralOnRegister('user-b', a.code);
console.log(applied.ok ? 'OK apply referral' : 'FAIL apply', applied);
const statsA = getReferralStats('user-a');
const statsB = getReferralStats('user-b');
console.log(statsA.referrals === 1 ? 'OK referrals=1' : 'FAIL referrals', statsA);
console.log(statsB.referrer === a.code ? 'OK referrer set' : 'FAIL referrer', statsB);
console.log(statsA.bonusMonths >= 3 && statsB.bonusMonths >= 3 ? 'OK bonus months' : 'FAIL bonus');

console.log(fail ? 'RESULT FAIL' : 'RESULT PASS');
process.exit(fail || !applied.ok || statsA.referrals !== 1 ? 1 : 0);
