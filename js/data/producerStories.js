// Krótkie historie producentów – curated + szablony kategorii przez i18n

import { t } from '../core/i18n.js';
import { getContentProducerById } from './contentProducers.js';

const STORY_KEYS = Object.freeze({
    farmer: ['stories.farmer0', 'stories.farmer1'],
    bakery: ['stories.bakery0', 'stories.bakery1'],
    meat: ['stories.meat0', 'stories.meat1'],
    restaurant: ['stories.restaurant0', 'stories.restaurant1'],
    shop: ['stories.shop0', 'stories.shop1'],
    vending: ['stories.vending0', 'stories.vending1'],
    other: ['stories.other0']
});

function hashString(value) {
    let hash = 0;
    const text = String(value || '');
    for (let i = 0; i < text.length; i += 1) {
        hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
}

/**
 * @param {object} producer
 * @returns {string}
 */
export function getProducerStory(producer) {
    if (!producer) return '';

    const content = getContentProducerById(producer.id);
    if (content?.story) return content.story;

    if (typeof producer.story === 'string' && producer.story.trim()) {
        return producer.story.trim();
    }

    const category = String(producer.category || 'other').toLowerCase();
    const keys = STORY_KEYS[category] || STORY_KEYS.other;
    const index = hashString(producer.id || producer.name) % keys.length;
    return t(keys[index]);
}

export default { getProducerStory };
