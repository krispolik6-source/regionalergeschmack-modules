// js/data/reservations.js – rezerwacje odbioru (bez płatności online)

import { eventBus } from '../core/eventBus.js';
import { EVENTS } from '../core/events.js';
import { enqueueOfflineAction } from '../core/offlineSync.js';
import { t } from '../core/i18n.js';

const KEY = 'rg_reservations_v1';
const MAX = 200;

export const RESERVATION_STATUSES = Object.freeze([
    'pending',
    'accepted',
    'ready',
    'picked_up',
    'cancelled'
]);

function readAll() {
    try {
        const raw = localStorage.getItem(KEY);
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
    } catch (_) {
        return [];
    }
}

function writeAll(list) {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
}

function createId() {
    return `res_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * @param {{
 *   producerId: string,
 *   producerName?: string,
 *   ownerId?: string,
 *   userId?: string,
 *   userName?: string,
 *   items: Array<{ productId?: string, name: string, quantity: number, unit?: string }>,
 *   pickupDay: 'today'|'tomorrow',
 *   pickupTime: string
 * }} payload
 */
export function createReservation(payload) {
    const items = (payload.items || [])
        .map((item) => ({
            productId: String(item.productId || ''),
            name: String(item.name || '').trim(),
            quantity: Math.max(1, Number(item.quantity) || 1),
            unit: String(item.unit || '').trim()
        }))
        .filter((item) => item.name);

    if (!payload.producerId || !items.length) return null;

    const pickupTime = String(payload.pickupTime || '').trim();
    if (!/^\d{1,2}:\d{2}$/.test(pickupTime)) return null;

    const entry = {
        id: createId(),
        producerId: String(payload.producerId),
        producerName: String(payload.producerName || ''),
        ownerId: String(payload.ownerId || ''),
        userId: payload.userId ? String(payload.userId) : null,
        userName: String(payload.userName || t('reservations.guestName')),
        items,
        pickupDay: payload.pickupDay === 'tomorrow' ? 'tomorrow' : 'today',
        pickupTime,
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now()
    };

    const list = readAll();
    list.unshift(entry);
    writeAll(list);
    enqueueOfflineAction({ type: 'reservation', payload: entry });
    eventBus.emit(EVENTS.RESERVATIONS_CHANGED, { reservation: entry });
    return entry;
}

export function getReservationsForUser(userId) {
    if (!userId) return [];
    return readAll().filter((r) => String(r.userId) === String(userId));
}

export function getReservationsForProducer(ownerId, producerId = '') {
    if (!ownerId && !producerId) return [];
    return readAll().filter((r) => {
        if (ownerId && String(r.ownerId) === String(ownerId)) return true;
        if (producerId && String(r.producerId) === String(producerId)) return true;
        return false;
    });
}

export function getAllReservations() {
    return readAll();
}

export function updateReservationStatus(reservationId, status) {
    if (!RESERVATION_STATUSES.includes(status)) return null;
    const list = readAll();
    const idx = list.findIndex((r) => String(r.id) === String(reservationId));
    if (idx === -1) return null;
    list[idx] = { ...list[idx], status, updatedAt: Date.now() };
    writeAll(list);
    eventBus.emit(EVENTS.RESERVATIONS_CHANGED, { reservation: list[idx] });
    return list[idx];
}

export default {
    RESERVATION_STATUSES,
    createReservation,
    getReservationsForUser,
    getReservationsForProducer,
    getAllReservations,
    updateReservationStatus
};
