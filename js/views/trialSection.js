// js/views/trialSection.js – trial / status Premium (bez płatności; dochód = AdSense)

import { t } from '../core/i18n.js';
import { showToast } from '../core/toast.js';
import {
    TRIAL_MONTHS,
    TRIAL_REMINDER_DAYS,
    getTrialPhase,
    getTrialDaysRemaining,
    getPremiumStatus,
    formatPremiumExpiryDate,
    canActivateTrial,
    activateFreeTrial,
    getTrialSyncMode,
    setTrialSyncMode,
    syncTrialStatus,
    getPremiumRole,
    isPaidPremium
} from '../core/premiumService.js';

function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * @param {'user'|'producer'} [role]
 */
export function renderTrialSection(role = getPremiumRole()) {
    const phase = getTrialPhase();
    const days = getTrialDaysRemaining();
    const status = getPremiumStatus();
    const syncMode = getTrialSyncMode();

    if (phase === 'paid' || isPaidPremium()) {
        return `
            <section class="trial-section trial-section--paid card" data-trial-section>
                <p class="producer-premium-badge" role="status">👑 ${escapeHtml(t('premium.statusActive'))}</p>
                <p class="text-muted">${escapeHtml(t('premium.adsFundedNote'))}</p>
            </section>
        `;
    }

    if (phase === 'offer' || canActivateTrial()) {
        return `
            <section class="trial-section trial-section--offer card" data-trial-section>
                <h4 class="trial-section-title">🎁 ${escapeHtml(t('premium.trialActivateTitle'))}</h4>
                <p class="trial-section-lead">${escapeHtml(t('premium.trialActivateLead').replace('{months}', String(TRIAL_MONTHS)))}</p>
                <p class="text-muted">${escapeHtml(t('premium.adsFundedNote'))}</p>
                <label class="trial-terms-check">
                    <input type="checkbox" id="trialTermsCheck">
                    <span>${escapeHtml(t('premium.trialAcceptTerms'))}</span>
                </label>
                <button type="button" class="btn-primary" id="trialActivateBtn" disabled>
                    ${escapeHtml(t('premium.trialActivateBtn'))}
                </button>
                <p class="trial-error" id="trialError" role="alert" hidden></p>
            </section>
        `;
    }

    if (phase === 'trial' || phase === 'reminder') {
        const ends = status?.trialEndsAt ? formatPremiumExpiryDate(status.trialEndsAt) : '';
        const showClaim = canActivateTrial();
        return `
            <section class="trial-section trial-section--active card" data-trial-section>
                <p class="producer-premium-badge" role="status">🎁 ${escapeHtml(t('premium.trialActiveBadge'))}</p>
                <p class="trial-days-counter" id="trialDaysCounter">
                    ${escapeHtml(t('premium.trialRemaining').replace('{days}', String(days)))}
                </p>
                ${ends ? `<p class="text-muted">${escapeHtml(t('premium.expiresOn').replace('{date}', ends))}</p>` : ''}
                ${phase === 'reminder' || days <= TRIAL_REMINDER_DAYS
        ? `<p class="trial-reminder" role="status">${escapeHtml(t('premium.trialEndingSoon').replace('{days}', String(days)))}</p>`
        : ''}
                ${showClaim ? `
                <div class="trial-claim-extra">
                    <label class="trial-terms-check">
                        <input type="checkbox" id="trialTermsCheck">
                        <span>${escapeHtml(t('premium.trialAcceptTerms'))}</span>
                    </label>
                    <button type="button" class="btn-primary" id="trialActivateBtn" disabled>
                        ${escapeHtml(t('premium.trialActivateBtn'))}
                    </button>
                    <p class="trial-error" id="trialError" role="alert" hidden></p>
                </div>` : ''}
                <div class="trial-sync">
                    <p class="trial-sync-label">${escapeHtml(t('premium.trialSyncLabel'))}</p>
                    <div class="trial-sync-modes" role="radiogroup">
                        <label class="trial-sync-option">
                            <input type="radio" name="trialSyncMode" value="auto" ${syncMode === 'auto' ? 'checked' : ''}>
                            <span>${escapeHtml(t('premium.trialSyncAuto'))}</span>
                        </label>
                        <label class="trial-sync-option">
                            <input type="radio" name="trialSyncMode" value="manual" ${syncMode === 'manual' ? 'checked' : ''}>
                            <span>${escapeHtml(t('premium.trialSyncManual'))}</span>
                        </label>
                    </div>
                    <button type="button" class="btn-secondary" id="trialRefreshBtn">
                        🔄 ${escapeHtml(t('premium.trialRefresh'))}
                    </button>
                </div>
            </section>
        `;
    }

    if (phase === 'expired') {
        return `
            <section class="trial-section trial-section--expired card" data-trial-section>
                <h4 class="trial-section-title">${escapeHtml(t('premium.trialExpiredTitle'))}</h4>
                <p class="trial-section-lead">${escapeHtml(t('premium.adsFundedNote'))}</p>
            </section>
        `;
    }

    return `
        <section class="trial-section card" data-trial-section>
            <p class="text-muted">${escapeHtml(t('premium.adsFundedNote'))}</p>
        </section>
    `;
}

/**
 * @param {ParentNode} root
 * @param {{ role?: 'user'|'producer', onChanged?: () => void }} [opts]
 */
export function bindTrialSection(root, opts = {}) {
    if (!root) return;
    const onChanged = typeof opts.onChanged === 'function' ? opts.onChanged : null;

    const check = root.querySelector('#trialTermsCheck');
    const activateBtn = root.querySelector('#trialActivateBtn');
    const errorEl = root.querySelector('#trialError');

    if (check && activateBtn) {
        const syncDisabled = () => {
            activateBtn.disabled = !check.checked;
        };
        check.addEventListener('change', syncDisabled);
        syncDisabled();

        activateBtn.addEventListener('click', () => {
            if (!check.checked) {
                if (errorEl) {
                    errorEl.hidden = false;
                    errorEl.textContent = t('premium.trialTermsRequired');
                }
                return;
            }
            const result = activateFreeTrial({ acceptedTerms: true });
            if (!result.ok) {
                if (errorEl) {
                    errorEl.hidden = false;
                    errorEl.textContent = t(`premium.trialErrors.${result.error}`) !== `premium.trialErrors.${result.error}`
                        ? t(`premium.trialErrors.${result.error}`)
                        : t('premium.trialTermsRequired');
                }
                showToast(t('premium.trialTermsRequired'));
                return;
            }
            showToast(t('premium.trialActivated'));
            document.body.classList.add('premium-active');
            onChanged?.();
        });
    }

    root.querySelectorAll('input[name="trialSyncMode"]').forEach((input) => {
        input.addEventListener('change', () => {
            if (!input.checked) return;
            setTrialSyncMode(input.value);
            showToast(
                input.value === 'manual'
                    ? t('premium.trialSyncManualOn')
                    : t('premium.trialSyncAutoOn')
            );
        });
    });

    root.querySelector('#trialRefreshBtn')?.addEventListener('click', () => {
        const result = syncTrialStatus();
        const counter = root.querySelector('#trialDaysCounter');
        if (counter) {
            counter.textContent = t('premium.trialRemaining').replace('{days}', String(result.daysLeft));
        }
        if (result.reminded) {
            showToast(t('premium.trialEndingSoon').replace('{days}', String(result.daysLeft)));
        }
        if (result.expiredJustNow || result.phase === 'expired') {
            showToast(t('premium.trialExpiredTitle'));
            onChanged?.();
            return;
        }
        showToast(t('premium.trialSynced'));
        onChanged?.();
    });
}

export default { renderTrialSection, bindTrialSection };
