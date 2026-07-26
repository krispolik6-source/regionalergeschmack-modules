// Filtrowanie i wyszukiwanie globalne – producenci + produkty (featured + katalog)

import { detectChainBrand } from './chainBrands.js';
import { getCategoryIcon, getProducerTypeKey } from './categoryIcons.js';
import {
    getMultilingualCategoryLabels,
    matchesSearchTerms
} from './searchLexicon.js';
import {
    featuredProducts,
    getFeaturedProductName,
    getFeaturedProductDesc,
    getFeaturedProducerName
} from '../data/products.js';
import { getProducerById } from '../data/dataService.js';
import { getProducerStory } from '../data/producerStories.js';
import { sortProducersByDistance } from './smartRecommend.js';

/**
 * @param {readonly object[]} producers
 * @param {string} query
 * @param {(key: string) => string} t
 */
export function filterProducersByQuery(producers, query, t = (k) => k) {
    const trimmed = String(query || '').trim();
    if (!trimmed) return [...producers];

    const terms = String(query || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [...producers];

    const matched = producers.filter((producer) => {
        const chain = detectChainBrand(producer.name) || detectChainBrand(producer.chain);
        const typeKey = getProducerTypeKey(producer.category);
        const typeLabel = t(`producer.types.${typeKey}`);
        const multilingualLabels = getMultilingualCategoryLabels(producer.category);
        const story = getProducerStory(producer);

        const city = String(producer.address || '')
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean)
            .slice(-2)
            .join(' ');

        const haystack = [
            producer.name,
            producer.description,
            producer.address,
            producer.city,
            city,
            producer.category,
            typeLabel,
            multilingualLabels,
            chain?.label,
            producer.chain,
            story,
            ...(producer.products || []).flatMap((p) => [p.name, p.description])
        ]
            .filter(Boolean)
            .join(' ');

        return matchesSearchTerms(haystack, terms);
    });

    return sortProducersByDistance(matched);
}

function getSearchTerms(query) {
    return String(query || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
}

function matchesTerms(haystack, terms) {
    return matchesSearchTerms(haystack, terms);
}

/**
 * Wyszukiwanie po katalogu produktów (featuredProducts + products[] producentów).
 * @returns {Array<{ id: string, type: 'product', name: string, producerId: string, producerName: string, price: number|null, unit?: string, category: string, icon: string }>}
 */
export function searchProducts(producers, query, t = (k) => k) {
    const terms = getSearchTerms(query);
    if (!terms.length) return [];

    const hits = [];
    const seen = new Set();

    for (const product of featuredProducts) {
        const name = getFeaturedProductName(product, t);
        const desc = getFeaturedProductDesc(product, t);
        const producerName = getFeaturedProducerName(product)
            || getProducerById(product.producerId)?.name
            || '';
        const producer = getProducerById(product.producerId);
        const multilingualLabels = producer
            ? getMultilingualCategoryLabels(producer.category)
            : '';
        const haystack = [name, desc, producerName, product.id, multilingualLabels].join(' ');

        if (!matchesTerms(haystack, terms)) continue;

        const key = `feat-${product.id}`;
        if (seen.has(key)) continue;
        seen.add(key);

        hits.push({
            id: key,
            type: 'product',
            name: name || t('map.unknownProducer') || 'Nieznany producent',
            producerId: product.producerId,
            producerName: producerName || t('map.unknownProducer') || 'Nieznany producent',
            price: product.price ?? null,
            unit: product.unit,
            category: product.category,
            icon: getCategoryIcon(product.category)
        });
    }

    for (const producer of producers) {
        const multilingualLabels = getMultilingualCategoryLabels(producer.category);
        const story = getProducerStory(producer);
        const producerLabel = String(producer.name || '').trim()
            || t('map.unknownProducer')
            || 'Nieznany producent';
        for (const product of producer.products || []) {
            const haystack = [
                product.name,
                product.description,
                producer.name,
                producer.description,
                producer.address,
                producer.chain,
                story,
                multilingualLabels
            ].filter(Boolean).join(' ');

            if (!matchesTerms(haystack, terms)) continue;

            const key = `prod-${producer.id}-${product.name}`;
            if (seen.has(key)) continue;
            seen.add(key);

            hits.push({
                id: key,
                type: 'product',
                name: String(product.name || '').trim() || producerLabel,
                producerId: producer.id,
                producerName: producerLabel,
                price: product.price ?? null,
                unit: product.unit,
                category: producer.category,
                icon: getCategoryIcon(producer.category)
            });
        }
    }

    return hits;
}

/**
 * Producenci pasujący do zapytania (nazwa lub powiązany produkt).
 */
export function filterProducersBySearch(producers, query, t = (k) => k) {
    const trimmed = String(query || '').trim();
    if (!trimmed) return [...producers];

    const { producers: directMatches, products } = searchGlobalResults(producers, query, t);
    const ids = new Set([
        ...directMatches.map((p) => String(p.id)),
        ...products.map((p) => String(p.producerId))
    ]);

    return producers.filter((p) => ids.has(String(p.id)));
}

/**
 * @returns {{ items: object[], producers: object[], products: object[] }}
 */
export function searchGlobalResults(producers, query, t = (k) => k) {
    const terms = getSearchTerms(query);
    if (!terms.length) {
        return { items: [], producers: [], products: [] };
    }

    const products = searchProducts(producers, query, t);
    const matchedProducers = filterProducersByQuery(producers, query, t);
    const items = [];
    const seenItemIds = new Set();
    const producerIdsFromProducts = new Set(products.map((p) => String(p.producerId)));

    for (const product of products) {
        if (seenItemIds.has(product.id)) continue;
        seenItemIds.add(product.id);
        items.push(product);
    }

    for (const producer of matchedProducers) {
        if (producerIdsFromProducts.has(String(producer.id))) continue;
        const id = `producer-${producer.id}`;
        if (seenItemIds.has(id)) continue;
        seenItemIds.add(id);

        const producerLabel = String(producer.name || '').trim()
            || t('map.unknownProducer')
            || 'Nieznany producent';
        items.push({
            id,
            type: 'producer',
            name: producerLabel,
            producerId: producer.id,
            producerName: producerLabel,
            price: null,
            unit: null,
            category: producer.category,
            icon: getCategoryIcon(producer.category)
        });
    }

    return { items, producers: matchedProducers, products };
}

function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * HTML karty wyniku wyszukiwania (Home / mapa).
 * @param {object} item
 * @param {(key: string) => string} t
 * @param {(value: number) => string} [formatPrice]
 */
export function buildSearchResultCardHtml(item, t, formatPrice = (v) => `${Number(v).toFixed(2)} €`) {
    const typeKey = getProducerTypeKey(item.category);
    const categoryLabel = t(`producer.types.${typeKey}`);
    const priceHtml = item.price != null
        ? `<span class="search-result-price">${escapeHtml(formatPrice(item.price))}${item.unit ? ` / ${escapeHtml(item.unit)}` : ''}</span>`
        : '';
    const subtitle = item.type === 'product'
        ? escapeHtml(item.producerName)
        : escapeHtml(categoryLabel);

    return `
        <button
            type="button"
            class="search-result-card"
            data-producer-id="${escapeHtml(item.producerId)}"
            data-search-type="${escapeHtml(item.type)}"
        >
            <span class="search-result-icon" aria-hidden="true">${item.icon || '📍'}</span>
            <span class="search-result-body">
                <span class="search-result-name">${escapeHtml(item.name)}</span>
                <span class="search-result-meta">${subtitle}${priceHtml ? ` · ${priceHtml}` : ''}</span>
            </span>
            <span class="search-result-category">${escapeHtml(categoryLabel)}</span>
        </button>
    `;
}

/**
 * @param {string} query
 * @param {(key: string) => string} t
 * @param {(text: string) => string} [escapeFn]
 */
export function formatSearchNoResults(query, t, escapeFn = (text) => text) {
    const trimmed = String(query || '').trim();
    if (!trimmed) return t('search.noResults');
    const label = escapeFn(trimmed);
    const text = t('search.noResultsFor');
    return text.includes('{query}') ? text.replace('{query}', label) : `${text} '${label}'`;
}

export default {
    filterProducersByQuery,
    filterProducersBySearch,
    searchProducts,
    searchGlobalResults,
    buildSearchResultCardHtml
};
