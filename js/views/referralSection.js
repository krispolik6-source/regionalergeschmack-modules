// js/views/referralSection.js – kod polecający + status w profilu

import { t } from '../core/i18n.js';
import { showToast } from '../core/toast.js';
import { getReferralStats, REFERRAL_BONUS_MONTHS } from '../core/referralService.js';

function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export function renderReferralSection(userId) {
    if (!userId) return '';
    const stats = getReferralStats(userId);
    const months = stats.bonusMonths || (stats.referrals * REFERRAL_BONUS_MONTHS);

    return `
        <section class="account-panel card referral-section" data-referral-section>
            <h3 class="account-panel-title">🎁 ${escapeHtml(t('referral.title'))}</h3>
            <p class="account-panel-sub">${escapeHtml(t('referral.subtitle').replace('{months}', String(REFERRAL_BONUS_MONTHS)))}</p>
            <div class="referral-code-box">
                <span class="referral-code-label">${escapeHtml(t('referral.yourCode'))}</span>
                <code class="referral-code-value" id="referralCodeValue">${escapeHtml(stats.code)}</code>
                <button type="button" class="btn-secondary" id="referralCopyBtn">${escapeHtml(t('referral.copy'))}</button>
            </div>
            <p class="referral-status" id="referralStatusText">
                ${escapeHtml(
        t('referral.status')
            .replace('{count}', String(stats.referrals))
            .replace('{months}', String(months))
    )}
            </p>
            ${stats.referrer
        ? `<p class="text-muted referral-used">${escapeHtml(t('referral.usedCode').replace('{code}', stats.referrer))}</p>`
        : ''}
        </section>
    `;
}

export function bindReferralSection(root) {
    const codeEl = root?.querySelector('#referralCodeValue');
    const copyBtn = root?.querySelector('#referralCopyBtn');
    if (!copyBtn || !codeEl) return;

    copyBtn.addEventListener('click', async () => {
        const code = codeEl.textContent?.trim() || '';
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(code);
            } else {
                const tmp = document.createElement('textarea');
                tmp.value = code;
                document.body.appendChild(tmp);
                tmp.select();
                document.execCommand('copy');
                tmp.remove();
            }
            showToast(t('referral.copied'));
        } catch (_) {
            showToast(code);
        }
    });
}

export default { renderReferralSection, bindReferralSection };
