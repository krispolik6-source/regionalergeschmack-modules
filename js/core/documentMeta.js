/**
 * Synchronizacja meta title/description/keywords z i18n (język UI).
 */
import { t } from './i18n.js';

function setMetaByName(name, content) {
    if (!content || typeof document === 'undefined') return;
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

function setMetaByProperty(property, content) {
    if (!content || typeof document === 'undefined') return;
    let el = document.querySelector(`meta[property="${property}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

/** Aktualizuje meta aplikacji (index) według bieżącego języka. */
export function syncDocumentMeta() {
    if (typeof document === 'undefined') return;

    const title = t('meta.title');
    const description = t('meta.description');
    const ogDescription = t('meta.ogDescription');
    const keywords = t('meta.keywords');
    const appleTitle = t('meta.appleTitle');

    if (title && title !== 'meta.title') {
        // Nie nadpisuj tytułu widoku (nav.*) jeśli już ustawiony w nawigacji —
        // ustaw tylko gdy brak „ – ” (pierwsze ładowanie / shell).
        const current = document.title || '';
        if (!current.includes('–') && !current.includes('-')) {
            document.title = title;
        }
        setMetaByProperty('og:title', title);
    }
    if (description && description !== 'meta.description') {
        setMetaByName('description', description);
    }
    if (ogDescription && ogDescription !== 'meta.ogDescription') {
        setMetaByProperty('og:description', ogDescription);
    }
    if (keywords && keywords !== 'meta.keywords') {
        setMetaByName('keywords', keywords);
    }
    if (appleTitle && appleTitle !== 'meta.appleTitle') {
        setMetaByName('apple-mobile-web-app-title', appleTitle);
    }
}

export default { syncDocumentMeta };
