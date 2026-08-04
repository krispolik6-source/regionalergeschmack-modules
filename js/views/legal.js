// js/views/legal.js – Impressum, Datenschutz, AGB (treść z translations-legal-help)

import { t } from '../core/i18n.js';
import { navigateTo } from '../controllers/navigation.js';

function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function legalText(key) {
    const text = t(`legal.${key}`);
    return text === `legal.${key}` ? '' : text;
}

function renderParagraphs(keys) {
    return keys
        .map((key) => legalText(key))
        .filter(Boolean)
        .map((text) => `<p>${text}</p>`)
        .join('');
}

function renderList(keys) {
    const items = keys.map((key) => legalText(key)).filter(Boolean);
    if (!items.length) return '';
    return `<ul class="legal-page-list">${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
}

function renderSections(sections) {
    return sections.map((section) => {
        const title = legalText(section.titleKey);
        if (!title) return '';

        let body = '';
        if (section.paragraphKeys?.length) {
            body += renderParagraphs(section.paragraphKeys);
        }
        if (section.listKeys?.length) {
            body += renderList(section.listKeys);
        }
        if (section.bodyKey) {
            const raw = legalText(section.bodyKey);
            if (raw) {
                body += section.html ? `<p>${raw}</p>` : `<p>${escapeHtml(raw)}</p>`;
            }
        }

        return `
            <section class="legal-page-section">
                <h3 class="legal-page-section-title">${escapeHtml(title)}</h3>
                ${body}
            </section>
        `;
    }).join('');
}

const IMPRESSUM_SECTIONS = [
    { titleKey: 'impressumS1Title', bodyKey: 'impressumS1Body', html: true },
    { titleKey: 'impressumS2Title', bodyKey: 'impressumS2Body' },
    { titleKey: 'impressumS3Title', bodyKey: 'impressumS3Body' }
];

const PRIVACY_SECTIONS = [
    { titleKey: 'privacyS1Title', bodyKey: 'privacyS1Body', html: true },
    {
        titleKey: 'privacyS2Title',
        paragraphKeys: ['privacyS2P1', 'privacyS2P2'],
        listKeys: ['privacyS2Li1', 'privacyS2Li2', 'privacyS2Li3', 'privacyS2Li4', 'privacyS2Li5']
    },
    {
        titleKey: 'privacyS3Title',
        paragraphKeys: ['privacyS3Intro'],
        listKeys: ['privacyS3Li1', 'privacyS3Li2']
    },
    {
        titleKey: 'privacyS4Title',
        paragraphKeys: ['privacyS4Intro'],
        listKeys: ['privacyS4Li1', 'privacyS4Li2'],
        bodyKey: 'privacyS4Note',
        html: true
    },
    {
        titleKey: 'privacyS5Title',
        paragraphKeys: ['privacyS5Intro'],
        listKeys: ['privacyS5Li1', 'privacyS5Li2', 'privacyS5Li3', 'privacyS5Li4', 'privacyS5Li5', 'privacyS5Li6', 'privacyS5Li7'],
        bodyKey: 'privacyS5Contact',
        html: true
    },
    {
        titleKey: 'privacyS6Title',
        paragraphKeys: ['privacyS6Intro'],
        listKeys: ['privacyS6Li1', 'privacyS6Li2']
    },
    { titleKey: 'privacyS7Title', bodyKey: 'privacyS7Body' },
    { titleKey: 'privacyS8Title', bodyKey: 'privacyS8Body' }
];

const TERMS_SECTIONS = [
    { titleKey: 'termsS1Title', bodyKey: 'termsS1Body' },
    { titleKey: 'termsS2Title', bodyKey: 'termsS2Body', html: true },
    { titleKey: 'termsS3Title', bodyKey: 'termsS3Body' },
    { titleKey: 'termsS4Title', bodyKey: 'termsS4Body' },
    { titleKey: 'termsS5Title', bodyKey: 'termsS5Body' },
    { titleKey: 'termsS6Title', bodyKey: 'termsS6Body' },
    {
        titleKey: 'termsS7Title',
        paragraphKeys: ['termsS7P1', 'termsS7P2Intro'],
        listKeys: ['termsS7Li1', 'termsS7Li2', 'termsS7Li3', 'termsS7Li4'],
        bodyKey: 'termsS7P3'
    },
    {
        titleKey: 'termsS8Title',
        paragraphKeys: ['termsS8P1', 'termsS8P2', 'termsS8P3']
    },
    {
        titleKey: 'termsS9Title',
        paragraphKeys: ['termsS9P1', 'termsS9P2']
    },
    {
        titleKey: 'termsS10Title',
        paragraphKeys: ['termsS10P1', 'termsS10P2', 'termsS10P3']
    }
];

function renderLegalPage(container, { titleKey, metaKey, sections }) {
    if (!container) return;

    const title = legalText(titleKey) || titleKey;
    const meta = metaKey ? legalText(metaKey) : '';
    const backLabel = t('btn.back');

    container.innerHTML = `
        <div class="legal-page">
            <button type="button" class="legal-page-back btn-secondary" data-legal-back>
                ← ${escapeHtml(backLabel)}
            </button>
            <h2 class="legal-page-title">${escapeHtml(title)}</h2>
            ${meta ? `<p class="legal-page-meta">${escapeHtml(meta)}</p>` : ''}
            <article class="legal-page-body">
                ${renderSections(sections)}
            </article>
        </div>
    `;

    container.querySelector('[data-legal-back]')?.addEventListener('click', () => {
        navigateTo('home', { force: true });
    });
}

export function renderImpressum(container) {
    renderLegalPage(container, {
        titleKey: 'impressumTitle',
        sections: IMPRESSUM_SECTIONS
    });
}

export function renderDatenschutz(container) {
    renderLegalPage(container, {
        titleKey: 'privacyTitle',
        metaKey: 'privacyUpdated',
        sections: PRIVACY_SECTIONS
    });
}

export function renderAgb(container) {
    renderLegalPage(container, {
        titleKey: 'termsTitle',
        sections: TERMS_SECTIONS
    });
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
