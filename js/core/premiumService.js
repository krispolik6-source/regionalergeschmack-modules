// js/core/premiumService.js – Premium: trial / wyróżnienie profilu (bez płatności w app)
// Dochód aplikacji: wyłącznie Google AdSense.

import { eventBus } from './eventBus.js';
import { EVENTS } from './events.js';
import { getCurrentUser, isProducer } from '../auth/auth.js';
import { PAYPAL_ME_PRODUCER_URL, PAYPAL_ME_USER_URL, PAYMENTS_ENABLED } from '../config.js';

const STORE_KEY = 'rg_premium_subscriptions';
const LEGACY_FLAG_KEY = 'premium_active';
export const PREMIUM_PRODUCER_KEY = 'premium_producer';
export const PREMIUM_USER_KEY = 'premium_user';
/** ID producentów z wyróżnieniem „Promowane” (mapa / listy). */
export const PROMOTED_PRODUCERS_KEY = 'rg_promoted_producers';
const PAYPAL_PENDING_KEY = 'rg_paypal_pending';
const SYNC_MODE_KEY = 'rg_trial_sync_mode';
const LAST_SYNC_KEY = 'rg_trial_last_sync';
const REMINDER_KEY = 'rg_trial_reminder_for';

/** 3 miesiące okresu testowego */
export const TRIAL_MONTHS = 3;
export const TRIAL_REMINDER_DAYS = 7;
export const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000;

export const PAYPAL_LINKS = Object.freeze({
    producer: PAYPAL_ME_PRODUCER_URL,
    user: PAYPAL_ME_USER_URL
});

export const PLANS = Object.freeze({
    monthly: { id: 'monthly', price: 9.99, interval: 'month' },
    annual: { id: 'annual', price: 89.99, interval: 'year', savingsPercent: 25 }
});

function readStore() {
    try {
        const raw = localStorage.getItem(STORE_KEY);
        const data = raw ? JSON.parse(raw) : {};
        return data && typeof data === 'object' ? data : {};
    } catch (_) {
        return {};
    }
}

function writeStore(data) {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

function addMonths(date, months) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
}

function addYears(date, years) {
    const d = new Date(date);
    d.setFullYear(d.getFullYear() + years);
    return d;
}

export function getPremiumRole() {
    return isProducer() ? 'producer' : 'user';
}

export function getPremiumStatus(userId = getCurrentUser()?.id) {
    if (!userId) return null;
    const store = readStore();
    return store[userId] || null;
}

export function isUserPremiumFlag() {
    try {
        return localStorage.getItem(PREMIUM_USER_KEY) === 'true';
    } catch (_) {
        return false;
    }
}

export function isProducerPremiumFlag() {
    try {
        return localStorage.getItem(PREMIUM_PRODUCER_KEY) === 'true';
    } catch (_) {
        return false;
    }
}

function readPromotedIds() {
    try {
        const raw = localStorage.getItem(PROMOTED_PRODUCERS_KEY);
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list.map(String) : [];
    } catch (_) {
        return [];
    }
}

function writePromotedIds(ids) {
    try {
        localStorage.setItem(PROMOTED_PRODUCERS_KEY, JSON.stringify([...new Set(ids.map(String))]));
    } catch (_) {
        /* ignore */
    }
}

/**
 * Oznacza producenta jako wyróżnionego (Promowane).
 * @param {string} producerId
 */
export function markProducerPromoted(producerId) {
    const id = String(producerId || '').trim();
    if (!id) return false;
    const next = readPromotedIds();
    if (!next.includes(id)) next.push(id);
    writePromotedIds(next);
    return true;
}

/**
 * Wyróżnienie profilu producenta (mapa / listy) — bez płatności w aplikacji.
 * @param {string} [producerId]
 */
export function activateProfileHighlight(producerId) {
    const user = getCurrentUser();
    const id = String(producerId || (user?.id ? `user-producer-${user.id}` : '')).trim();
    if (!id) return { ok: false, error: 'missingProducer' };
    markProducerPromoted(id);
    try {
        localStorage.setItem(PREMIUM_PRODUCER_KEY, 'true');
    } catch (_) {
        /* ignore */
    }
    eventBus.emit(EVENTS.PREMIUM_ACTIVATED, { kind: 'producer', highlight: true, paid: false, at: new Date().toISOString() });
    return { ok: true, producerId: id };
}

/**
 * Czy producent ma być oznaczony jako „Promowane” na mapie / listach.
 * @param {object | string | null | undefined} producerOrId
 */
export function isProducerPromoted(producerOrId) {
    if (producerOrId == null) return false;
    const producer = typeof producerOrId === 'object' ? producerOrId : null;
    const id = String(producer?.id ?? producerOrId ?? '').trim();
    if (!id) return false;

    if (
        producer?.promoted === true ||
        producer?.premium === true ||
        producer?.isPromoted === true ||
        producer?.highlight === true
    ) {
        return true;
    }

    if (readPromotedIds().includes(id)) return true;

    // Zalogowany producent Premium → jego profil user-producer-*
    if (isProducerPremiumFlag()) {
        const user = getCurrentUser();
        if (user?.id && (id === `user-producer-${user.id}` || producer?.ownerId === user.id)) {
            return true;
        }
    }

    return false;
}

export function getPromotedProducerIds() {
    return readPromotedIds();
}

export function isPaidPremium() {
    if (isUserPremiumFlag() || isProducerPremiumFlag()) return true;
    const status = getPremiumStatus();
    return Boolean(status?.paypalMe || status?.paid === true);
}

export function getTrialDaysRemaining(userId = getCurrentUser()?.id) {
    const status = getPremiumStatus(userId);
    if (!status?.trialEndsAt) return 0;
    const diff = new Date(status.trialEndsAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

export function isTrialActive(userId = getCurrentUser()?.id) {
    if (isPaidPremium()) return false;
    const status = getPremiumStatus(userId);
    if (!status?.trialEndsAt || status.trialCancelled) return false;
    return new Date(status.trialEndsAt).getTime() > Date.now();
}

export function isTrialExpired(userId = getCurrentUser()?.id) {
    if (isPaidPremium()) return false;
    const status = getPremiumStatus(userId);
    if (!status?.trialEndsAt) return false;
    return new Date(status.trialEndsAt).getTime() <= Date.now();
}

export function hasStartedTrial(userId = getCurrentUser()?.id) {
    const status = getPremiumStatus(userId);
    // Tylko oficjalna aktywacja „3 miesiące za darmo” (nie bonus z poleceń)
    return Boolean(status?.termsAcceptedAt);
}

export function canActivateTrial(userId = getCurrentUser()?.id) {
    if (!userId) return false;
    if (isPaidPremium()) return false;
    if (hasStartedTrial(userId)) return false;
    return true;
}

/**
 * Przedłuża Premium o N miesięcy (kumulacja z trial / poleceniami).
 * @param {string} userId
 * @param {number} months
 * @param {{ reason?: string }} [meta]
 */
export function extendPremiumMonths(userId, months = TRIAL_MONTHS, meta = {}) {
    if (!userId || !Number.isFinite(months) || months <= 0) {
        return { ok: false, error: 'invalid' };
    }

    const store = readStore();
    const prev = store[userId] || {};
    const now = new Date();
    const currentEnd = prev.trialEndsAt ? new Date(prev.trialEndsAt) : null;
    const base = currentEnd && currentEnd.getTime() > now.getTime() ? currentEnd : now;
    const trialEndsAt = addMonths(base, months);

    store[userId] = {
        ...prev,
        active: true,
        premium_active: true,
        trial: true,
        trialStartedAt: prev.trialStartedAt || now.toISOString(),
        trialEndsAt: trialEndsAt.toISOString(),
        activatedAt: prev.activatedAt || now.toISOString(),
        referralBonusMonths: (Number(prev.referralBonusMonths) || 0)
            + (meta.reason?.startsWith('referral') ? months : 0),
        lastExtensionAt: now.toISOString(),
        lastExtensionReason: meta.reason || 'extend'
    };
    writeStore(store);
    localStorage.setItem(LEGACY_FLAG_KEY, 'true');
    touchTrialSync();

    return { ok: true, status: store[userId] };
}

export function isPremiumActive(userId = getCurrentUser()?.id) {
    if (isPaidPremium()) return true;
    return isTrialActive(userId);
}

/**
 * @returns {'none'|'offer'|'trial'|'reminder'|'expired'|'paid'}
 */
export function getTrialPhase(userId = getCurrentUser()?.id) {
    if (isPaidPremium()) return 'paid';
    if (!userId) return 'none';
    // Najpierw aktywny okres (także bonus z poleceń) – potem oferta aktywacji trialu
    if (isTrialActive(userId)) {
        const days = getTrialDaysRemaining(userId);
        return days > 0 && days <= TRIAL_REMINDER_DAYS ? 'reminder' : 'trial';
    }
    if (canActivateTrial(userId)) return 'offer';
    if (isTrialExpired(userId)) return 'expired';
    return 'none';
}

/**
 * Aktywacja 3 miesięcy za darmo – wymaga akceptacji warunków.
 * @param {{ acceptedTerms?: boolean }} opts
 */
export function activateFreeTrial(opts = {}) {
    const user = getCurrentUser();
    if (!user) return { ok: false, error: 'notLoggedIn' };
    if (!opts.acceptedTerms) return { ok: false, error: 'termsRequired' };
    if (isPaidPremium()) return { ok: false, error: 'alreadyPaid' };
    if (hasStartedTrial(user.id)) return { ok: false, error: 'alreadyStarted' };

    const now = new Date();
    const role = getPremiumRole();
    const store = readStore();
    const prev = store[user.id] || {};
    const currentEnd = prev.trialEndsAt ? new Date(prev.trialEndsAt) : null;
    const base = currentEnd && currentEnd.getTime() > now.getTime() ? currentEnd : now;
    const trialEndsAt = addMonths(base, TRIAL_MONTHS);

    const entry = {
        ...prev,
        active: true,
        premium_active: true,
        plan: 'trial_3m',
        role,
        trial: true,
        trialStartedAt: prev.trialStartedAt || now.toISOString(),
        trialEndsAt: trialEndsAt.toISOString(),
        termsAcceptedAt: now.toISOString(),
        activatedAt: prev.activatedAt || now.toISOString(),
        paymentSimulated: false,
        paypalMe: false,
        paid: false
    };

    store[user.id] = entry;
    writeStore(store);
    localStorage.setItem(LEGACY_FLAG_KEY, 'true');
    touchTrialSync();

    eventBus.emit(EVENTS.PREMIUM_ACTIVATED, {
        userId: user.id,
        kind: role,
        trial: true,
        ...entry
    });
    return { ok: true, status: entry };
}

export function getTrialSyncMode() {
    try {
        const mode = localStorage.getItem(SYNC_MODE_KEY);
        return mode === 'manual' ? 'manual' : 'auto';
    } catch (_) {
        return 'auto';
    }
}

export function setTrialSyncMode(mode) {
    const next = mode === 'manual' ? 'manual' : 'auto';
    try {
        localStorage.setItem(SYNC_MODE_KEY, next);
    } catch (_) {
        /* ignore */
    }
    return next;
}

export function getLastTrialSyncAt() {
    try {
        const raw = localStorage.getItem(LAST_SYNC_KEY);
        const n = Number(raw);
        return Number.isFinite(n) ? n : 0;
    } catch (_) {
        return 0;
    }
}

function touchTrialSync() {
    try {
        localStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
    } catch (_) {
        /* ignore */
    }
}

/**
 * Przelicza stan trial (dni, wygaśnięcie, przypomnienie).
 * @returns {{ daysLeft: number, phase: string, reminded: boolean, expiredJustNow: boolean }}
 */
export function syncTrialStatus() {
    const user = getCurrentUser();
    const status = getPremiumStatus(user?.id);
    touchTrialSync();

    if (!status) {
        return { daysLeft: 0, phase: getTrialPhase(), reminded: false, expiredJustNow: false };
    }

    const daysLeft = getTrialDaysRemaining(user?.id);
    const phase = getTrialPhase(user?.id);
    let reminded = false;
    let expiredJustNow = false;

    if (phase === 'expired' && status.active) {
        const store = readStore();
        if (store[user.id]) {
            store[user.id].active = false;
            store[user.id].premium_active = false;
            store[user.id].trialExpiredAt = new Date().toISOString();
            writeStore(store);
            expiredJustNow = true;
            eventBus.emit(EVENTS.PREMIUM_EXPIRED, { userId: user.id, reason: 'trial' });
        }
    }

    if ((phase === 'reminder' || (phase === 'trial' && daysLeft <= TRIAL_REMINDER_DAYS && daysLeft > 0))
        && status.trialEndsAt) {
        try {
            const shownFor = localStorage.getItem(REMINDER_KEY);
            if (shownFor !== status.trialEndsAt) {
                localStorage.setItem(REMINDER_KEY, status.trialEndsAt);
                reminded = true;
                eventBus.emit(EVENTS.PREMIUM_SUBSCRIBE_APPROVED, {
                    type: 'trial_reminder',
                    daysLeft,
                    userId: user?.id
                });
            }
        } catch (_) {
            reminded = true;
        }
    }

    return { daysLeft, phase: getTrialPhase(user?.id), reminded, expiredJustNow };
}

/** Auto-sync co 24h (gdy tryb auto) lub wymuszenie. */
export function maybeAutoSyncTrial({ force = false } = {}) {
    if (!force && getTrialSyncMode() !== 'auto') {
        return { skipped: true, reason: 'manual' };
    }
    const last = getLastTrialSyncAt();
    if (!force && last && Date.now() - last < SYNC_INTERVAL_MS) {
        return { skipped: true, reason: 'fresh', ...syncTrialStatus() };
    }
    return { skipped: false, ...syncTrialStatus() };
}

export function initTrialSync() {
    maybeAutoSyncTrial({ force: false });
    if (typeof window === 'undefined') return;
    if (window.__rgTrialSyncTimer) return;
    window.__rgTrialSyncTimer = window.setInterval(() => {
        maybeAutoSyncTrial({ force: false });
    }, Math.min(SYNC_INTERVAL_MS, 60 * 60 * 1000));

    if (!window.__rgTrialSyncCleanupBound) {
        window.__rgTrialSyncCleanupBound = true;
        const clear = () => {
            if (window.__rgTrialSyncTimer) {
                clearInterval(window.__rgTrialSyncTimer);
                window.__rgTrialSyncTimer = null;
            }
        };
        window.addEventListener('pagehide', clear);
        window.addEventListener('beforeunload', clear);
    }
}

/**
 * Zapis Premium po PayPal.me (producer | user).
 * @param {'producer'|'user'} kind
 */
export function activatePayPalPremium(kind) {
    const role = kind === 'producer' ? 'producer' : 'user';
    const now = new Date().toISOString();
    const user = getCurrentUser();

    if (role === 'producer') {
        localStorage.setItem(PREMIUM_PRODUCER_KEY, 'true');
        if (user?.id) {
            markProducerPromoted(`user-producer-${user.id}`);
        }
    } else {
        localStorage.setItem(PREMIUM_USER_KEY, 'true');
    }
    localStorage.setItem(LEGACY_FLAG_KEY, 'true');

    if (user?.id) {
        const store = readStore();
        store[user.id] = {
            ...(store[user.id] || {}),
            active: true,
            premium_active: true,
            plan: 'paypal_me',
            role,
            activatedAt: now,
            paidAt: now,
            paid: true,
            paypalMe: true,
            trial: false,
            amount: role === 'producer' ? 5 : 3,
            promoted: role === 'producer'
        };
        writeStore(store);
    }

    try {
        localStorage.removeItem(PAYPAL_PENDING_KEY);
    } catch (_) {
        /* ignore */
    }

    eventBus.emit(EVENTS.PREMIUM_ACTIVATED, { kind: role, paypalMe: true, paid: true, at: now });
    return { ok: true, kind: role };
}

export function startPayPalCheckout(_kind) {
    // Brak transakcji w aplikacji — dochód wyłącznie z AdSense.
    if (!PAYMENTS_ENABLED) {
        return { ok: false, error: 'paymentsDisabled' };
    }
    const role = _kind === 'producer' || (_kind == null && isProducer())
        ? 'producer'
        : 'user';
    const url = PAYPAL_LINKS[role];
    if (!url) return { ok: false, error: 'missingUrl' };

    try {
        localStorage.setItem(PAYPAL_PENDING_KEY, role);
        localStorage.setItem('rg_paypal_pending_at', String(Date.now()));
    } catch (_) {
        /* ignore */
    }

    window.location.href = url;
    return { ok: true, kind: role };
}

/**
 * @param {{ force?: boolean, clearOnly?: boolean }} [opts]
 * - query `?premium=` aktywuje od razu
 * - sam klucz pending wymaga `force: true` (potwierdzenie użytkownika)
 */
export function completePendingPayPal(opts = {}) {
    const force = Boolean(opts.force);
    const clearOnly = Boolean(opts.clearOnly);
    let pending = null;
    let fromQuery = false;

    try {
        const params = new URLSearchParams(window.location.search || '');
        const q = params.get('premium') || params.get('paypal');
        if (q === 'producer' || q === 'user') {
            pending = q;
            fromQuery = true;
        } else {
            pending = localStorage.getItem(PAYPAL_PENDING_KEY);
        }
    } catch (_) {
        pending = null;
    }

    if (pending !== 'producer' && pending !== 'user') {
        return { activated: false };
    }

    if (clearOnly) {
        try {
            localStorage.removeItem(PAYPAL_PENDING_KEY);
            localStorage.removeItem('rg_paypal_pending_at');
        } catch (_) {
            /* ignore */
        }
        return { activated: false, cleared: true, kind: pending };
    }

    // Bez potwierdzenia / query – nie przyznawaj Premium po samym powrocie z PayPal
    if (!fromQuery && !force) {
        return { activated: false, pending };
    }

    activatePayPalPremium(pending);

    try {
        if (window.history?.replaceState && window.location.search) {
            const url = new URL(window.location.href);
            url.searchParams.delete('premium');
            url.searchParams.delete('paypal');
            window.history.replaceState({}, '', url.pathname + url.search + url.hash);
        }
    } catch (_) {
        /* ignore */
    }

    return { activated: true, kind: pending };
}

export function getSelectedPlan(userId = getCurrentUser()?.id) {
    return getPremiumStatus(userId)?.plan || null;
}

/** @deprecated – użyj activateFreeTrial */
export function activatePremium(planId = 'monthly') {
    const result = activateFreeTrial({ acceptedTerms: true });
    if (!result.ok) return result;
    const user = getCurrentUser();
    const store = readStore();
    if (user && store[user.id]) {
        store[user.id].plan = PLANS[planId] ? planId : 'trial_3m';
        writeStore(store);
    }
    return result;
}

export function deactivatePremium(userId = getCurrentUser()?.id) {
    if (!userId) return;
    const store = readStore();
    if (store[userId]) {
        store[userId].active = false;
        store[userId].premium_active = false;
        writeStore(store);
    }
    if (!Object.values(store).some((s) => s?.active)) {
        localStorage.removeItem(LEGACY_FLAG_KEY);
    }
    eventBus.emit(EVENTS.PREMIUM_EXPIRED, { userId });
}

export function formatPremiumExpiryDate(isoDate) {
    if (!isoDate) return '';
    try {
        return new Date(isoDate).toLocaleDateString();
    } catch (_) {
        return isoDate.slice(0, 10);
    }
}

export default {
    TRIAL_MONTHS,
    TRIAL_REMINDER_DAYS,
    PLANS,
    PAYPAL_LINKS,
    PREMIUM_PRODUCER_KEY,
    PREMIUM_USER_KEY,
    PROMOTED_PRODUCERS_KEY,
    getPremiumStatus,
    getPremiumRole,
    isPremiumActive,
    isUserPremiumFlag,
    isProducerPremiumFlag,
    isProducerPromoted,
    markProducerPromoted,
    activateProfileHighlight,
    getPromotedProducerIds,
    isPaidPremium,
    isTrialActive,
    isTrialExpired,
    canActivateTrial,
    hasStartedTrial,
    getTrialPhase,
    getTrialDaysRemaining,
    extendPremiumMonths,
    activateFreeTrial,
    getTrialSyncMode,
    setTrialSyncMode,
    getLastTrialSyncAt,
    syncTrialStatus,
    maybeAutoSyncTrial,
    initTrialSync,
    getSelectedPlan,
    activatePremium,
    activatePayPalPremium,
    startPayPalCheckout,
    completePendingPayPal,
    deactivatePremium,
    formatPremiumExpiryDate
};
