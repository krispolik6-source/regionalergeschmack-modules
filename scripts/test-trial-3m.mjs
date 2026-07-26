import { readFileSync } from 'node:fs';

const files = {
    service: readFileSync('js/core/premiumService.js', 'utf8'),
    trialUi: readFileSync('js/views/trialSection.js', 'utf8'),
    premium: readFileSync('js/views/premium.js', 'utf8'),
    producer: readFileSync('js/views/producerPanel.js', 'utf8'),
    app: readFileSync('js/app.js', 'utf8'),
    tr: readFileSync('js/translations.js', 'utf8')
};

const checks = [
    ['TRIAL_MONTHS = 3', files.service.includes('TRIAL_MONTHS = 3')],
    ['activateFreeTrial', files.service.includes('export function activateFreeTrial')],
    ['terms required', files.service.includes("error: 'termsRequired'")],
    ['sync 24h', files.service.includes('SYNC_INTERVAL_MS')],
    ['reminder 7 days', files.service.includes('TRIAL_REMINDER_DAYS = 7')],
    ['trialActivateBtn UI', files.trialUi.includes('trialActivateBtn')],
    ['terms checkbox', files.trialUi.includes('trialTermsCheck')],
    ['days counter', files.trialUi.includes('trialDaysCounter')],
    ['refresh btn', files.trialUi.includes('trialRefreshBtn')],
    ['pay btn', files.trialUi.includes('trialPayBtn')],
    ['premium uses trial section', files.premium.includes('renderTrialSection')],
    ['producer uses trial section', files.producer.includes('renderTrialSection')],
    ['initTrialSync in app', files.app.includes('initTrialSync')],
    ['PL activate label', files.tr.includes('Aktywuj 3 miesiące za darmo')],
    ['PL accept terms', files.tr.includes('Akceptuję warunki okresu testowego')]
];

let fail = 0;
for (const [name, ok] of checks) {
    console.log(ok ? 'OK' : 'FAIL', name);
    if (!ok) fail += 1;
}
console.log(fail ? 'RESULT FAIL' : 'RESULT PASS');
process.exit(fail ? 1 : 0);
