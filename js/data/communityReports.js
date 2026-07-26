// js/data/communityReports.js – zgłoszenia błędów o producentach (localStorage + offline queue)

import { eventBus } from '../core/eventBus.js';
import { EVENTS } from '../core/events.js';
import { enqueueOfflineAction } from '../core/offlineSync.js';

const STORAGE_KEY = 'rg_community_reports_v1';
const MAX = 100;

/** @typedef {'hours_outdated'|'closed'|'wrong_phone'|'wrong_address'|'other'} ReportReason */

export const REPORT_REASONS = Object.freeze([
    { id: 'hours_outdated', labelKey: 'report.hoursOutdated' },
    { id: 'closed', labelKey: 'report.closed' },
    { id: 'wrong_phone', labelKey: 'report.wrongPhone' },
    { id: 'wrong_address', labelKey: 'report.wrongAddress' },
    { id: 'other', labelKey: 'report.other' }
]);

function readAll() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
    } catch (_) {
        return [];
    }
}

function writeAll(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX)));
}

/**
 * @param {{
 *   producerId: string,
 *   producerName?: string,
 *   reason: ReportReason|string,
 *   note?: string,
 *   userId?: string
 * }} payload
 */
export function submitProducerReport(payload) {
    const producerId = String(payload?.producerId || '').trim();
    const reason = String(payload?.reason || 'other').trim();
    if (!producerId || !reason) return null;

    const entry = {
        id: `report_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        producerId,
        producerName: String(payload.producerName || ''),
        reason,
        note: String(payload.note || '').trim().slice(0, 500),
        userId: payload.userId || null,
        createdAt: Date.now(),
        status: 'pending'
    };

    const list = readAll();
    list.unshift(entry);
    writeAll(list);

    enqueueOfflineAction({
        type: 'producer_report',
        payload: entry
    });

    eventBus.emit(EVENTS.PLACES_CHANGED, { report: entry.id });
    return entry;
}

export function getReportsForProducer(producerId) {
    const id = String(producerId);
    return readAll().filter((r) => String(r.producerId) === id);
}

export function getAllReports() {
    return readAll();
}

export default {
    REPORT_REASONS,
    submitProducerReport,
    getReportsForProducer,
    getAllReports
};
