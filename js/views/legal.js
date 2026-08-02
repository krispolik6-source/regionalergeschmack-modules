// js/views/legal.js – Impressum, Datenschutz, AGB (placeholder do wklejenia treści prawnej)

import { t } from '../core/i18n.js';
import { navigateTo } from '../controllers/navigation.js';

const PLACEHOLDERS = Object.freeze({
    impressum: '[Tutaj wklej wygenerowany tekst Impressum]',
    datenschutz: '[Tutaj wklej wygenerowany tekst Datenschutz]',
    agb: '[Tutaj wklej wygenerowany tekst AGB]'
});

function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function renderLegalPage(container, { title, placeholderKey }) {
    if (!container) return;

    const placeholder = PLACEHOLDERS[placeholderKey] || '';
    const backLabel = t('btn.back');

    container.innerHTML = `
        <div class="legal-page">
            <button type="button" class="legal-page-back btn-secondary" data-legal-back>
                ← ${escapeHtml(backLabel)}
            </button>
            <h2 class="legal-page-title">${escapeHtml(title)}</h2>
            <article class="legal-page-body">
                <p class="legal-page-placeholder">${escapeHtml(placeholder)}</p>
            </article>
        </div>
    `;

    container.querySelector('[data-legal-back]')?.addEventListener('click', () => {
        navigateTo('home', { force: true });
    });
}

export function renderImpressum(container) {
    renderLegalPage(container, { title: 'Impressum', placeholderKey: 'impressum' });
}

export function renderDatenschutz(container) {
    renderLegalPage(container, { title: 'Datenschutz', placeholderKey: 'datenschutz' });
}

export function renderAgb(container) {
    renderLegalPage(container, { title: 'AGB', placeholderKey: 'agb' });
}

export function initLegalFooter() {
    const footer = document.getElementById('appLegalFooter');
    if (!footer || footer.dataset.bound === 'true') return;
    footer.dataset.bound = 'true';

    footer.querySelectorAll('[data-legal-view]').forEach((btn) => {
        btn.addEventListener('click', (event) => {
            event.preventDefault();
            const view = btn.getAttribute('data-legal-view');
            if (view) navigateTo(view, { force: true });
        });
    });
}

export default {
    renderImpressum,
    renderDatenschutz,
    renderAgb,
    initLegalFooter
};
