// js/presentation/producerMood.js – ETAP 17: charakter wizualny producenta (tylko UX/CSS hook)
import { normalizeCategoryIconKey } from './categoryIcons.js';

/**
 * Klucz nastroju do CSS: honey | bakery | farmer | meat | restaurant | shop
 * @param {object} producer
 * @returns {string}
 */
export function resolveProducerMood(producer) {
    if (!producer) return 'farmer';

    const key = normalizeCategoryIconKey(producer.category || producer.type);
    // Sklep / automat: zawsze „shop” – produkty (np. miód) nie zmieniają zdjęcia na pasiekę
    if (key === 'shop' || key === 'vending') return 'shop';
    if (key === 'bakery') return 'bakery';
    if (key === 'meat') return 'meat';
    if (key === 'restaurant' || key === 'fast_food') return 'restaurant';

    const blob = [
        producer.name,
        producer.description,
        producer.category,
        producer.type,
        ...(producer.products || []).map((p) => `${p.name || ''} ${p.imageSlug || ''}`)
    ].join(' ').toLowerCase();

    // Pasieka / imker – tylko poza sklepami
    if (/honey|honig|miód|мед|imker|pasiek|bienen|bee/.test(blob)) return 'honey';

    if (key === 'farmer') return 'farmer';
    return 'farmer';
}

/**
 * Ustawia data-character na istniejącym root modala (bez zmiany struktury HTML).
 * @param {HTMLElement | null} modalEl
 * @param {object} producer
 */
export function applyProducerMoodToModal(modalEl, producer) {
    if (!modalEl) return;
    const mood = resolveProducerMood(producer);
    modalEl.dataset.character = mood;
    modalEl.dataset.category = normalizeCategoryIconKey(producer?.category || producer?.type || 'other');
}

export function clearProducerMoodFromModal(modalEl) {
    if (!modalEl) return;
    delete modalEl.dataset.character;
    delete modalEl.dataset.category;
}

export default {
    resolveProducerMood,
    applyProducerMoodToModal,
    clearProducerMoodFromModal
};
