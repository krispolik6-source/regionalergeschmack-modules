import { readFileSync } from 'node:fs';

const files = {
    panel: readFileSync('js/views/producerPanel.js', 'utf8'),
    premium: readFileSync('js/views/premium.js', 'utf8'),
    trial: readFileSync('js/views/trialSection.js', 'utf8'),
    service: readFileSync('js/core/premiumService.js', 'utf8'),
    app: readFileSync('js/app.js', 'utf8'),
    cfg: readFileSync('js/config.js', 'utf8'),
    tr: readFileSync('js/translations.js', 'utf8'),
    css: readFileSync('css/style.css', 'utf8')
};

const checks = [
    ['PayPal producer URL', files.cfg.includes('paypalme/regionaler_smak/5')],
    ['PayPal user URL', files.cfg.includes('paypalme/regionaler_smak/3')],
    ['Producer trial section', files.panel.includes("renderTrialSection('producer')")],
    ['startPayPalCheckout', files.trial.includes('startPayPalCheckout(role)')],
    ['Pay now button', files.trial.includes('trialPayNowBtn')],
    ['premium_producer key', files.service.includes("PREMIUM_PRODUCER_KEY = 'premium_producer'")],
    ['premium_user key', files.service.includes("PREMIUM_USER_KEY = 'premium_user'")],
    ['Premium trial section', files.premium.includes("renderTrialSection('user')")],
    ['completePending in app', files.app.includes('applyPayPalReturn')],
    ['PayPal confirm gate', files.service.includes('force') && files.app.includes('confirmPaid')],
    ['PL highlight label', files.tr.includes('Wyróżnij profil')],
    ['CSS badge', files.css.includes('producer-premium-badge')]
];

let fail = 0;
for (const [name, ok] of checks) {
    console.log(ok ? 'OK' : 'FAIL', name);
    if (!ok) fail += 1;
}
console.log(fail ? 'RESULT FAIL' : 'RESULT PASS');
process.exit(fail ? 1 : 0);
