// js/data/products.js – polecane produkty na stronie głównej

import { getProducerById } from './dataService.js';
import { getContentProducerById } from './contentProducers.js';

/**
 * Karty produktów na Home – puste do czasu rejestracji prawdziwych producentów.
 * @type {readonly object[]}
 */
export const featuredProducts = Object.freeze([]);

/**
 * @param {string} productId
 * @param {(key: string) => string} t
 */
export function getFeaturedProductLabel(productId, field, t) {
    const key = `home.featuredItems.${productId}.${field}`;
    const value = t(key);
    return value !== key ? value : '';
}

/**
 * @param {typeof featuredProducts[number]} product
 * @param {(key: string) => string} t
 */
export function getFeaturedProductName(product, t) {
    return getFeaturedProductLabel(product.id, 'name', t) || product.id;
}

export function getFeaturedProductDesc(product, t) {
    return getFeaturedProductLabel(product.id, 'desc', t) || '';
}

/**
 * @param {typeof featuredProducts[number]} product
 */
export function getFeaturedProducerName(product) {
    return getProducerById(product.producerId)?.name
        || getContentProducerById(product.producerId)?.name
        || product.producerName
        || '';
}

export function getFeaturedProductCartId(product) {
    return `feat-${product.id}`;
}

export default {
    featuredProducts,
    getFeaturedProductName,
    getFeaturedProductDesc,
    getFeaturedProducerName,
    getFeaturedProductCartId
};
