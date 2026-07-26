// js/core/referralService.js – kody polecające REGIO-XXXX (+3 miesiące dla obu stron)

import { eventBus } from './eventBus.js';
import { EVENTS } from './events.js';

const STORE_KEY = 'rg_referrals';
const BONUS_MONTHS = 3;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function readStore() {
    try {
        const raw = localStorage.getItem(STORE_KEY);
        const data = raw ? JSON.parse(raw) : null;
        if (data && typeof data === 'object') {
            return {
                byUserId: data.byUserId && typeof data.byUserId === 'object' ? data.byUserId : {},
                byCode: data.byCode && typeof data.byCode === 'object' ? data.byCode : {}
            };
        }
    } catch (_) {
        /* ignore */
    }
    return { byUserId: {}, byCode: {} };
}

function writeStore(store) {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

function randomSuffix(length = 4) {
    let out = '';
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const bytes = new Uint8Array(length);
        crypto.getRandomValues(bytes);
        for (let i = 0; i < length; i++) {
            out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
        }
        return out;
    }
    for (let i = 0; i < length; i++) {
        out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
    return out;
}

export function normalizeReferralCode(code) {
    return String(code || '')
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '')
        .replace(/^REGIO-?/, 'REGIO-');
}

function makeUniqueCode(store) {
    for (let i = 0; i < 40; i++) {
        const code = `REGIO-${randomSuffix(4)}`;
        if (!store.byCode[code]) return code;
    }
    return `REGIO-${Date.now().toString(36).slice(-4).toUpperCase()}`;
}

/**
 * Zapewnia kod polecający użytkownika (tworzy, jeśli brak).
 * @param {string} userId
 * @returns {{ code: string, referrer: string|null, referrals: number, bonusMonths: number }}
 */
export function ensureReferralProfile(userId) {
    if (!userId) {
        return { code: '', referrer: null, referrals: 0, bonusMonths: 0 };
    }

    const store = readStore();
    let entry = store.byUserId[userId];

    if (!entry?.code) {
        const code = makeUniqueCode(store);
        entry = {
            code,
            referrer: entry?.referrer || null,
            referrals: Number(entry?.referrals) || 0,
            bonusMonths: Number(entry?.bonusMonths) || 0
        };
        store.byUserId[userId] = entry;
        store.byCode[code] = userId;
        writeStore(store);
    } else if (!store.byCode[entry.code]) {
        store.byCode[entry.code] = userId;
        writeStore(store);
    }

    return {
        code: entry.code,
        referrer: entry.referrer || null,
        referrals: Number(entry.referrals) || 0,
        bonusMonths: Number(entry.bonusMonths) || 0
    };
}

export function getReferralCode(userId) {
    return ensureReferralProfile(userId).code;
}

export function getReferralStats(userId) {
    return ensureReferralProfile(userId);
}

export function findUserIdByReferralCode(code) {
    const normalized = normalizeReferralCode(code);
    if (!normalized.startsWith('REGIO-') || normalized.length < 10) return null;
    const store = readStore();
    return store.byCode[normalized] || null;
}

export function validateReferralCode(code, { excludeUserId = null } = {}) {
    const normalized = normalizeReferralCode(code);
    if (!normalized) return { ok: false, error: 'empty' };
    const ownerId = findUserIdByReferralCode(normalized);
    if (!ownerId) return { ok: false, error: 'invalid' };
    if (excludeUserId && ownerId === excludeUserId) {
        return { ok: false, error: 'self' };
    }
    return { ok: true, code: normalized, referrerId: ownerId };
}

/**
 * Po rejestracji: powiąż kod, zwiększ licznik, daj +3 miesiące obu stronom.
 * @param {string} newUserId
 * @param {string} referralCode
 */
export function applyReferralOnRegister(newUserId, referralCode) {
    if (!newUserId) return { ok: false, error: 'noUser' };

    ensureReferralProfile(newUserId);
    const validation = validateReferralCode(referralCode, { excludeUserId: newUserId });
    if (!validation.ok) return validation;

    const store = readStore();
    const newbie = store.byUserId[newUserId] || ensureReferralProfile(newUserId);
    if (newbie.referrer) {
        return { ok: false, error: 'alreadyReferred' };
    }

    const referrerId = validation.referrerId;
    ensureReferralProfile(referrerId);

    store.byUserId[newUserId] = {
        ...store.byUserId[newUserId],
        referrer: validation.code,
        referrals: Number(store.byUserId[newUserId]?.referrals) || 0,
        bonusMonths: (Number(store.byUserId[newUserId]?.bonusMonths) || 0) + BONUS_MONTHS
    };

    store.byUserId[referrerId] = {
        ...store.byUserId[referrerId],
        referrals: (Number(store.byUserId[referrerId]?.referrals) || 0) + 1,
        bonusMonths: (Number(store.byUserId[referrerId]?.bonusMonths) || 0) + BONUS_MONTHS
    };

    writeStore(store);

    eventBus.emit(EVENTS.PREMIUM_ACTIVATED, {
        kind: 'referral',
        newUserId,
        referrerId,
        code: validation.code,
        months: BONUS_MONTHS
    });

    return {
        ok: true,
        code: validation.code,
        referrerId,
        newUserId,
        months: BONUS_MONTHS,
        referrals: store.byUserId[referrerId].referrals
    };
}

export const REFERRAL_BONUS_MONTHS = BONUS_MONTHS;

export default {
    REFERRAL_BONUS_MONTHS,
    ensureReferralProfile,
    getReferralCode,
    getReferralStats,
    normalizeReferralCode,
    findUserIdByReferralCode,
    validateReferralCode,
    applyReferralOnRegister
};
