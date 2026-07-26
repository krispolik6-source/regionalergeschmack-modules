// js/data/adminStore.js – moderacja (localStorage, bez zmiany API)

import { eventBus } from '../core/eventBus.js';
import { EVENTS } from '../core/events.js';
import { getAllReports } from './communityReports.js';

const TRUST_KEY = 'rg_admin_trust_overrides_v1';
const REVIEW_MOD_KEY = 'rg_admin_review_moderation_v1';
const PHOTO_MOD_KEY = 'rg_admin_photo_moderation_v1';

function readJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        const data = raw ? JSON.parse(raw) : fallback;
        return data && typeof data === 'object' ? data : fallback;
    } catch (_) {
        return fallback;
    }
}

function writeJson(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.warn('[AdminStore] localStorage write failed:', key, error);
    }
}

export function getTrustOverrides() {
    return readJson(TRUST_KEY, {});
}

/** @param {string} producerId @param {'verified'|'pending'|'rejected'|'community'} status */
export function setProducerTrustOverride(producerId, status) {
    const id = String(producerId || '');
    if (!id) return null;
    const all = getTrustOverrides();
    all[id] = { status, updatedAt: Date.now() };
    writeJson(TRUST_KEY, all);
    eventBus.emit(EVENTS.PLACES_CHANGED, { reason: 'admin-trust' });
    return all[id];
}

export function getReviewModeration() {
    return readJson(REVIEW_MOD_KEY, {});
}

/** @param {string} reviewKey @param {'hidden'|'ok'} status */
export function setReviewModeration(reviewKey, status) {
    const key = String(reviewKey || '');
    if (!key) return null;
    const all = getReviewModeration();
    all[key] = { status, updatedAt: Date.now() };
    writeJson(REVIEW_MOD_KEY, all);
    eventBus.emit(EVENTS.REVIEWS_CHANGED, { reason: 'admin' });
    return all[key];
}

export function isReviewHidden(review) {
    const key = `${review?.producerId || ''}|${review?.date || ''}|${review?.user || ''}|${(review?.comment || '').slice(0, 24)}`;
    return getReviewModeration()[key]?.status === 'hidden';
}

export function getPhotoModeration() {
    return readJson(PHOTO_MOD_KEY, {});
}

export function setPhotoModeration(photoKey, status) {
    const key = String(photoKey || '');
    if (!key) return null;
    const all = getPhotoModeration();
    all[key] = { status, updatedAt: Date.now() };
    writeJson(PHOTO_MOD_KEY, all);
    eventBus.emit(EVENTS.PLACES_CHANGED, { reason: 'admin-photo' });
    return all[key];
}

/** Rozwiąż zgłoszenie – mutacja statusu w community reports */
export function resolveReport(reportId, status = 'resolved') {
    const KEY = 'rg_community_reports_v1';
    let list = [];
    try {
        const raw = localStorage.getItem(KEY);
        list = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(list)) list = [];
    } catch (_) {
        list = [];
    }
    const idx = list.findIndex((r) => String(r.id) === String(reportId));
    if (idx === -1) return null;
    list[idx] = { ...list[idx], status, resolvedAt: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(list));
    eventBus.emit(EVENTS.PLACES_CHANGED, { reason: 'admin-report' });
    return list[idx];
}

export function listPendingReports() {
    return getAllReports().filter((r) => !r.status || r.status === 'pending');
}

export default {
    getTrustOverrides,
    setProducerTrustOverride,
    getReviewModeration,
    setReviewModeration,
    isReviewHidden,
    getPhotoModeration,
    setPhotoModeration,
    resolveReport,
    listPendingReports
};
