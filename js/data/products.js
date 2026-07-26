// js/data/products.js – polecane produkty na stronie głównej

import { getProducerById } from './dataService.js';
import { getProductImageUrl } from './productImages.js';
import { getContentProducerById } from './contentProducers.js';

/**
 * Karty produktów na Home – curated content do testów użytkowników.
 * @type {readonly object[]}
 */
export const featuredProducts = Object.freeze([
    {
        id: 'feat-apples',
        producerId: 'content-hof-mueller',
        producerName: 'Hof Müller',
        price: 3.8,
        unit: 'kg',
        imageSlug: 'apples',
        imageUrl: getProductImageUrl('apples'),
        category: 'farmer',
        categoryKey: 'farmers',
        distanceKm: 2.4,
        rating: 4.7,
        icon: '🍎',
        isSampleImage: true
    },
    {
        id: 'feat-bread',
        producerId: 'content-baeckerei-schmidt',
        producerName: 'Bäckerei Schmidt',
        price: 3.5,
        unit: '',
        imageSlug: 'bread',
        imageUrl: getProductImageUrl('bread'),
        category: 'bakery',
        categoryKey: 'bakeries',
        distanceKm: 1.1,
        rating: 4.8,
        icon: '🥖',
        isSampleImage: true
    },
    {
        id: 'feat-cheese',
        producerId: 'content-molkerei-rhein',
        producerName: 'Molkerei am Rhein',
        price: 4.2,
        unit: '200 g',
        imageSlug: 'cheese',
        imageUrl: getProductImageUrl('cheese'),
        category: 'shop',
        categoryKey: 'shops',
        distanceKm: 3.6,
        rating: 4.6,
        icon: '🧀',
        isSampleImage: true
    },
    {
        id: 'feat-sausage',
        producerId: 'content-metzgerei-berg',
        producerName: 'Metzgerei Berg',
        price: 3.2,
        unit: '3 szt',
        imageSlug: 'sausage',
        imageUrl: getProductImageUrl('sausage'),
        category: 'meat',
        categoryKey: 'meat',
        distanceKm: 4.2,
        rating: 4.5,
        icon: '🌭',
        isSampleImage: true
    },
    {
        id: 'feat-honey',
        producerId: 'content-imkerei-sonne',
        producerName: 'Imkerei Sonne',
        price: 7.5,
        unit: '500 g',
        imageSlug: 'honey',
        imageUrl: getProductImageUrl('honey'),
        category: 'farmer',
        categoryKey: 'farmers',
        distanceKm: 5.0,
        rating: 4.8,
        icon: '🍯',
        isSampleImage: true
    },
    {
        id: 'feat-yogurt',
        producerId: 'content-molkerei-rhein',
        producerName: 'Molkerei am Rhein',
        price: 1.9,
        unit: '500 g',
        imageSlug: 'yogurt',
        imageUrl: getProductImageUrl('yogurt'),
        category: 'shop',
        categoryKey: 'shops',
        distanceKm: 3.6,
        rating: 4.6,
        icon: '🥛',
        isSampleImage: true
    },
    {
        id: 'feat-eggs',
        producerId: 'content-hof-mueller',
        producerName: 'Hof Müller',
        price: 3.0,
        unit: '6 szt',
        imageSlug: 'eggs',
        imageUrl: getProductImageUrl('eggs'),
        category: 'farmer',
        categoryKey: 'farmers',
        distanceKm: 2.4,
        rating: 4.7,
        icon: '🥚',
        isSampleImage: true
    },
    {
        id: 'feat-daily',
        producerId: 'content-gasthof-eifel',
        producerName: 'Gasthof Eifelblick',
        price: 14.5,
        unit: '',
        imageSlug: 'daily-dish',
        imageUrl: getProductImageUrl('daily-dish'),
        category: 'restaurant',
        categoryKey: 'restaurants',
        distanceKm: 18.0,
        rating: 4.9,
        icon: '🍽️',
        isSampleImage: true
    }
]);

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
