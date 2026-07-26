// js/data/reviews.js – opinie użytkowników (ETAP 8: reply, edit, report, sort)

import { eventBus } from '../core/eventBus.js';
import { EVENTS } from '../core/events.js';
import { enqueueOfflineAction } from '../core/offlineSync.js';
import { t } from '../core/i18n.js';
import { isReviewHidden } from './adminStore.js';

const STORAGE_KEY = 'rg_producer_reviews';
const REPORTS_KEY = 'rg_review_reports_v1';

function readStored() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
    } catch (_) {
        return [];
    }
}

function writeStored(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function createId() {
    return `rev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * @param {string | null | undefined} value
 * @returns {string}
 */
export function normalizeReviewImageUrl(value) {
    const url = String(value || '').trim();
    if (!url) return '';
    if (url.startsWith('data:image/') && url.length <= 900_000) return url;
    if (url.length > 500) return '';
    if (!/^https?:\/\//i.test(url)) return '';
    return url;
}

function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * @param {string | null | undefined} imageUrl
 * @param {string} [className]
 */
export function buildReviewImageHtml(imageUrl, className = 'producer-review-image') {
    const url = normalizeReviewImageUrl(imageUrl);
    if (!url) return '';

    return `
        <div class="producer-review-image-wrap">
            <img
                src="${escapeHtml(url)}"
                alt="${escapeHtml(t('reviews.photoAlt'))}"
                class="${escapeHtml(className)}"
                loading="lazy"
                decoding="async"
                referrerpolicy="no-referrer"
            >
        </div>
    `;
}

function reviewKey(r) {
    return r.id || `${r.producerId}|${r.date}|${r.user}|${(r.comment || '').slice(0, 24)}`;
}

/**
 * @param {string} producerId
 * @param {'newest'|'best'|'with_photos'} [sort]
 */
export function getReviews(producerId, sort = 'newest') {
    const id = String(producerId);
    let list = readStored()
        .filter((r) => String(r.producerId) === id)
        .filter((r) => !isReviewHidden(r));

    if (sort === 'best') {
        list = [...list].sort((a, b) => Number(b.rating) - Number(a.rating)
            || String(b.date).localeCompare(String(a.date)));
    } else if (sort === 'with_photos') {
        list = list.filter((r) => normalizeReviewImageUrl(r.imageUrl));
        list = [...list].sort((a, b) => String(b.date).localeCompare(String(a.date)));
    } else {
        list = [...list].sort((a, b) => String(b.updatedAt || b.date).localeCompare(String(a.updatedAt || a.date)));
    }
    return list;
}

export function getAllReviews() {
    return readStored();
}

/**
 * @param {string} producerId
 * @param {{ user: string, rating: number, comment: string, imageUrl?: string, userId?: string }} review
 */
export function addReview(producerId, review) {
    const imageUrl = normalizeReviewImageUrl(review.imageUrl);
    const entry = {
        id: createId(),
        producerId: String(producerId),
        user: String(review.user || '').trim(),
        rating: Math.min(5, Math.max(1, Number(review.rating) || 5)),
        comment: String(review.comment || '').trim(),
        date: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString(),
        reply: null
    };

    const userId = String(review.userId || '').trim();
    if (userId) entry.userId = userId;
    if (imageUrl) entry.imageUrl = imageUrl;

    if (!entry.user || !entry.comment) return null;

    const list = readStored();
    list.push(entry);
    writeStored(list);
    enqueueOfflineAction({ type: 'review', payload: entry });
    eventBus.emit(EVENTS.REVIEWS_CHANGED, { producerId: entry.producerId, review: entry });
    eventBus.emit(EVENTS.REVIEW_SUBMITTED, { review: entry });
    return entry;
}

/**
 * Edycja własnej opinii (po id lub userId+producerId+date).
 */
export function updateReview(reviewId, patch, userId) {
    const list = readStored();
    const idx = list.findIndex((r) => {
        if (r.id && String(r.id) === String(reviewId)) return true;
        return false;
    });
    if (idx === -1) return null;
    const current = list[idx];
    if (userId && current.userId && String(current.userId) !== String(userId)) return null;

    if (patch.rating != null) current.rating = Math.min(5, Math.max(1, Number(patch.rating) || current.rating));
    if (patch.comment != null) current.comment = String(patch.comment).trim();
    if (patch.imageUrl !== undefined) {
        const img = normalizeReviewImageUrl(patch.imageUrl);
        if (img) current.imageUrl = img;
        else delete current.imageUrl;
    }
    current.updatedAt = new Date().toISOString();
    list[idx] = current;
    writeStored(list);
    eventBus.emit(EVENTS.REVIEWS_CHANGED, { producerId: current.producerId, review: current });
    return current;
}

/** Odpowiedź producenta */
export function replyToReview(reviewId, replyText, ownerUserId) {
    const text = String(replyText || '').trim().slice(0, 800);
    if (!text) return null;
    const list = readStored();
    const idx = list.findIndex((r) => String(r.id) === String(reviewId));
    if (idx === -1) return null;
    list[idx] = {
        ...list[idx],
        reply: {
            text,
            userId: ownerUserId ? String(ownerUserId) : '',
            at: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
    };
    writeStored(list);
    eventBus.emit(EVENTS.REVIEWS_CHANGED, { producerId: list[idx].producerId, review: list[idx] });
    return list[idx];
}

export function reportReview(reviewId, reason, userId = null) {
    const list = readStored();
    const review = list.find((r) => String(r.id) === String(reviewId));
    if (!review) return null;

    let reports = [];
    try {
        const raw = localStorage.getItem(REPORTS_KEY);
        reports = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(reports)) reports = [];
    } catch (_) {
        reports = [];
    }

    const entry = {
        id: createId(),
        reviewId: String(reviewId),
        producerId: review.producerId,
        reason: String(reason || 'other').slice(0, 80),
        userId: userId ? String(userId) : null,
        createdAt: Date.now(),
        status: 'pending'
    };
    reports.unshift(entry);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports.slice(0, 100)));
    return entry;
}

export function getReviewReports() {
    try {
        const raw = localStorage.getItem(REPORTS_KEY);
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
    } catch (_) {
        return [];
    }
}

/**
 * @param {{ id?: string, displayName?: string, email?: string } | null | undefined} user
 */
export function getReviewsForUser(user) {
    if (!user) return [];
    const userId = String(user.id || '');
    const name = String(user.displayName || '').toLowerCase();
    const email = String(user.email || '').toLowerCase();
    const emailPrefix = email.split('@')[0] || '';

    return readStored()
        .filter((r) => {
            if (userId && r.userId && String(r.userId) === userId) return true;
            if (userId && r.userId) return false;
            const author = String(r.user || '').toLowerCase();
            return author === name || author === emailPrefix || author === email;
        })
        .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

/**
 * @param {string} producerId
 * @param {number} [fallbackRating]
 */
export function getAverageRating(producerId, fallbackRating = 0) {
    const reviews = getReviews(producerId);
    if (reviews.length === 0) {
        const fb = Number(fallbackRating);
        return Number.isFinite(fb) && fb > 0 ? fb : 0;
    }
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    return Math.round((sum / reviews.length) * 10) / 10;
}

export function formatRatingStars(rating) {
    const value = Number(rating);
    if (!Number.isFinite(value) || value <= 0) return '';
    const full = Math.min(5, Math.round(value));
    return `${'★'.repeat(full)}${'☆'.repeat(5 - full)}`;
}

export function getReviewStableKey(review) {
    return reviewKey(review);
}

export default {
    getReviews,
    getAllReviews,
    getReviewsForUser,
    addReview,
    updateReview,
    replyToReview,
    reportReview,
    getReviewReports,
    getAverageRating,
    formatRatingStars,
    normalizeReviewImageUrl,
    buildReviewImageHtml,
    getReviewStableKey
};
