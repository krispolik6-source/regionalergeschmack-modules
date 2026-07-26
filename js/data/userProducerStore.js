// js/data/userProducerStore.js – konta producentów (localStorage)

import { getLastPosition } from '../core/userLocation.js';
import { eventBus } from '../core/eventBus.js';
import { EVENTS } from '../core/events.js';
import { t } from '../core/i18n.js';
import { isProducerPromoted } from '../core/premiumService.js';

const STORE_KEY = 'rg_user_producer_accounts';

export const PRODUCER_CATEGORIES = Object.freeze([
    { id: 'farmer', labelKey: 'producer.types.farmer' },
    { id: 'bakery', labelKey: 'producer.types.bakery' },
    { id: 'restaurant', labelKey: 'producer.types.restaurant' },
    { id: 'meat', labelKey: 'producer.types.meat' },
    { id: 'shop', labelKey: 'producer.types.shop' },
    { id: 'vending', labelKey: 'producer.types.vending' }
]);

function readAll() {
    try {
        const raw = localStorage.getItem(STORE_KEY);
        const data = raw ? JSON.parse(raw) : {};
        return data && typeof data === 'object' ? data : {};
    } catch (_) {
        return {};
    }
}

function writeAll(data) {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

function createId(prefix = 'item') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function defaultProfileCoords() {
    const stored = getLastPosition();
    if (stored) {
        return { lat: stored.lat, lng: stored.lng };
    }
    return { lat: null, lng: null };
}

function defaultAccount(name = '', email = '') {
    const coords = defaultProfileCoords();
    return {
        profile: {
            name,
            description: '',
            address: '',
            phone: '',
            email,
            website: '',
            facebook: '',
            instagram: '',
            tiktok: '',
            openingHours: '',
            categories: ['farmer'],
            lat: coords.lat,
            lng: coords.lng
        },
        products: [],
        promotions: [],
        photos: []
    };
}

export function initProducerAccount(userId, { name = '', email = '', categories = ['farmer'] } = {}) {
    const all = readAll();
    const cats = Array.isArray(categories) && categories.length ? [...categories] : ['farmer'];
    if (!all[userId]) {
        all[userId] = defaultAccount(name, email);
        all[userId].profile.categories = cats;
        writeAll(all);
    }
    return all[userId];
}

export function getProducerAccount(userId) {
    if (!userId) return null;
    const all = readAll();
    return all[userId] ? structuredClone(all[userId]) : null;
}

export function saveProducerAccount(userId, account) {
    if (!userId || !account) return null;
    const all = readAll();
    all[userId] = structuredClone(account);
    writeAll(all);
    eventBus.emit(EVENTS.BUSINESS_DATA_CHANGED, { userId });
    eventBus.emit(EVENTS.PLACES_CHANGED, {});
    return all[userId];
}

function applyPromotionsToProducts(products, promotions) {
    const items = (products || []).map((product) => ({ ...product }));

    for (const promo of promotions || []) {
        if (!promo?.productId) continue;
        const product = items.find((item) => item.id === promo.productId);
        if (!product) continue;

        const parts = [promo.title];
        if (promo.discount) parts.push(`-${promo.discount}%`);
        product.promo = parts.filter(Boolean).join(' ');
    }

    return items;
}

function buildProducerPromoSummary(products, promotions) {
    const lines = (promotions || [])
        .filter((promo) => promo?.title?.trim())
        .map((promo) => {
            const product = products.find((item) => item.id === promo.productId);
            const prefix = product?.name ? `${product.name}: ` : '';
            const discount = promo.discount ? ` (-${promo.discount}%)` : '';
            return `${prefix}${promo.title.trim()}${discount}`;
        });

    return lines.join(' · ');
}

export function accountToProducer(userId, account) {
    const profile = account?.profile || {};
    const categories = Array.isArray(profile.categories) && profile.categories.length
        ? profile.categories
        : ['farmer'];
    const primaryCategory = categories[0];
    const products = applyPromotionsToProducts(account.products || [], account.promotions || []).map((p) => ({
        ...p,
        isSampleImage: p.isSampleImage === true ? true : !p.imageUrl
    }));
    const promoSummary = buildProducerPromoSummary(products, account.promotions || []);
    const photos = Array.isArray(account.photos) ? account.photos : [];
    const heroPhoto = typeof photos[0] === 'string' ? photos[0] : photos[0]?.url;

    const coords = defaultProfileCoords();

    const visibleProducts = products.filter((p) => p.hidden !== true);

    return {
        id: `user-producer-${userId}`,
        name: profile.name || t('producerPanel.defaultName'),
        category: primaryCategory,
        categories,
        description: profile.description || '',
        address: profile.address || '',
        phone: profile.phone || '',
        email: profile.email || '',
        website: profile.website || '',
        facebook: profile.facebook || '',
        instagram: profile.instagram || '',
        tiktok: profile.tiktok || '',
        openingHours: profile.openingHours || profile.hours || '',
        hours: profile.openingHours || profile.hours || '',
        lat: Number(profile.lat) || coords.lat,
        lng: Number(profile.lng) || coords.lng,
        products: visibleProducts,
        promotions: account.promotions || [],
        photos,
        image: heroPhoto || '',
        logo: heroPhoto || '',
        imageSource: heroPhoto ? 'producer' : 'sample',
        trustStatus: heroPhoto || profile.phone ? 'pending' : 'partial',
        promo: promoSummary,
        source: 'user',
        ownerId: userId,
        rating: 0,
        promoted: isProducerPromoted(`user-producer-${userId}`)
    };
}

export function getRegisteredUserProducers() {
    const all = readAll();
    return Object.entries(all)
        .filter(([, account]) => account?.profile?.name?.trim())
        .map(([userId, account]) => accountToProducer(userId, account))
        .filter((producer) => Number.isFinite(producer.lat) && Number.isFinite(producer.lng));
}

export function createProduct() {
    return {
        id: createId('product'),
        name: '',
        price: 0,
        unit: t('producerPanel.defaultUnit'),
        promo: '',
        description: '',
        imageUrl: '',
        category: '',
        available: 'available',
        seasonal: false,
        onPromo: false,
        hidden: false,
        stockQty: null
    };
}

export function createPromotion() {
    return {
        id: createId('promo'),
        title: '',
        description: '',
        productId: '',
        discount: ''
    };
}

export default {
    PRODUCER_CATEGORIES,
    initProducerAccount,
    getProducerAccount,
    saveProducerAccount,
    getRegisteredUserProducers,
    accountToProducer,
    createProduct,
    createPromotion
};
