// views/premium.js – Premium / trial (bez płatności; dochód = AdSense)

import { t } from '../core/i18n.js';
import { isLoggedIn } from '../auth/auth.js';
import { openLoginModal } from '../auth/login.js';
import { isPremiumActive } from '../core/premiumService.js';
import { renderTrialSection, bindTrialSection } from './trialSection.js';

function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function injectPremiumStyles() {
    if (document.getElementById('premium-view-extra-styles')) return;
    const style = document.createElement('style');
    style.id = 'premium-view-extra-styles';
    style.textContent = `
        .premium-login-card { text-align: center; padding: var(--space-2xl); }
        .premium-feature-card.is-unlocked { border-left: 3px solid var(--color-accent); }
        .premium-feature-card.is-locked { opacity: 0.72; }
        .premium-paypal-note { font-size: 0.85rem; text-align: center; margin: 8px 0 0; }
        .premium-paypal-link { word-break: break-all; font-size: 0.75rem; text-align: center; opacity: 0.75; }
        .trial-section { padding: var(--space-lg); margin-bottom: var(--space-md); }
        .trial-section-title { margin: 0 0 8px; font-size: 1.05rem; }
        .trial-section-lead { margin: 0 0 12px; color: var(--color-text-muted); line-height: 1.45; }
        .trial-terms-check { display: flex; gap: 10px; align-items: flex-start; margin: 0 0 12px; font-size: 14px; line-height: 1.4; cursor: pointer; }
        .trial-terms-check input { margin-top: 3px; width: 18px; height: 18px; flex-shrink: 0; }
        .trial-days-counter { font-size: 1.05rem; font-weight: 700; color: var(--color-primary); margin: 8px 0; }
        .trial-reminder { margin: 10px 0; padding: 10px 12px; border-radius: 10px; background: rgba(245, 158, 11, 0.14); color: #92400e; font-weight: 600; font-size: 0.92rem; }
        .trial-sync { margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(15,40,30,0.1); }
        .trial-sync-label { font-weight: 700; margin: 0 0 8px; font-size: 0.9rem; }
        .trial-sync-modes { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 10px; }
        .trial-sync-option { display: flex; gap: 6px; align-items: center; font-size: 0.9rem; cursor: pointer; }
        .trial-error { color: #b83b3b; font-size: 0.85rem; margin: 8px 0 0; }
        .trial-section--pay { border: 1px solid rgba(90, 55, 20, 0.22); background: rgba(90, 55, 20, 0.06); }
        .trial-price-tag { font-size: 1.05rem; font-weight: 800; color: var(--color-accent); margin: 0 0 12px; }
        #trialPayNowBtn { width: 100%; }
        body.dark-mode .trial-reminder { background: rgba(245, 158, 11, 0.18); color: #fcd34d; }
        body.dark-mode .trial-section--pay { background: rgba(196, 137, 58, 0.1); border-color: rgba(196, 137, 58, 0.28); }
    `;
    document.head.appendChild(style);
}

function renderBenefitsList(unlocked) {
    const features = [
        { icon: '⭐', title: 'feature1Title', desc: 'feature1Desc' },
        { icon: '🗺️', title: 'feature2Title', desc: 'feature2Desc' },
        { icon: '🛒', title: 'feature3Title', desc: 'feature3Desc' },
        { icon: '🔔', title: 'feature4Title', desc: 'feature4Desc' }
    ];

    return features.map((f) => `
        <li class="premium-feature-card card ${unlocked ? 'is-unlocked' : 'is-locked'}">
            <span class="premium-feature-icon" aria-hidden="true">${f.icon}</span>
            <div>
                <strong>${escapeHtml(t(`premium.${f.title}`))}</strong>
                <p class="text-muted">${escapeHtml(t(`premium.${f.desc}`))}</p>
            </div>
        </li>
    `).join('');
}

function renderLoginGate() {
    return `
        <section class="app-section premium-login-card card">
            <span class="premium-hero-icon" aria-hidden="true">🔒</span>
            <h3>${escapeHtml(t('premium.loginRequired'))}</h3>
            <p class="text-muted">${escapeHtml(t('premium.loginHint'))}</p>
            <button type="button" class="btn-primary" id="premiumLoginBtn">${escapeHtml(t('premium.loginBtn'))}</button>
        </section>
    `;
}

export function renderPremium(container) {
    if (!container) return;

    injectPremiumStyles();

    const loggedIn = isLoggedIn();
    const active = loggedIn && isPremiumActive();

    container.innerHTML = `
        <div class="premium-page">
            <header class="view-hero premium-hero">
                <img class="premium-hero-icon" src="/assets/icons/logo-master.svg?v=29" width="56" height="56" alt="" aria-hidden="true">
                <h2>${escapeHtml(t('premium.title'))}</h2>
                <p class="text-muted">${escapeHtml(t('premium.subtitle'))}</p>
            </header>

            ${!loggedIn ? renderLoginGate() : renderTrialSection('user')}

            <section class="app-section premium-features">
                <h3 class="section-heading">${escapeHtml(t('premium.featuresTitle'))}</h3>
                <ul class="premium-feature-list">
                    ${renderBenefitsList(active)}
                </ul>
            </section>
        </div>
    `;

    container.querySelector('#premiumLoginBtn')?.addEventListener('click', () => {
        openLoginModal();
    });

    if (loggedIn) {
        bindTrialSection(container, {
            role: 'user',
            onChanged: () => renderPremium(container)
        });
    }

    document.body.classList.toggle('premium-active', Boolean(active));
}

export default { renderPremium };
