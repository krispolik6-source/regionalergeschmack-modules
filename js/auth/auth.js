// js/auth/auth.js – rejestracja, logowanie, sesja (localStorage, później Supabase)

import { eventBus } from '../core/eventBus.js';
import { EVENTS } from '../core/events.js';
import { initProducerAccount } from '../data/userProducerStore.js';
import {
    ensureReferralProfile,
    applyReferralOnRegister,
    validateReferralCode,
    REFERRAL_BONUS_MONTHS
} from '../core/referralService.js';
import { extendPremiumMonths } from '../core/premiumService.js';

const USERS_KEY = 'rg_auth_users';
const SESSION_KEY = 'rg_auth_session';

export const ACCOUNT_TYPES = Object.freeze({
    client: 'client',
    producer: 'producer',
    admin: 'admin'
});

/** Seed lokalnego konta admina (hasło: Admin123!) – tylko gdy brak admina. */
const ADMIN_SEED_EMAIL = 'admin@regionaler.local';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readUsers() {
    try {
        const raw = localStorage.getItem(USERS_KEY);
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
    } catch (_) {
        return [];
    }
}

function writeUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readSession() {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (_) {
        return null;
    }
}

function writeSession(session) {
    if (!session) {
        localStorage.removeItem(SESSION_KEY);
        return;
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function createId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `u_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function bytesToHex(bytes) {
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: enc.encode(salt),
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        256
    );
    return bytesToHex(new Uint8Array(bits));
}

export function validateEmail(email) {
    return EMAIL_RE.test(String(email || '').trim().toLowerCase());
}

export function validatePassword(password) {
    return String(password || '').length >= 6;
}

export function getCurrentUser() {
    const session = readSession();
    if (!session?.userId) return null;

    const user = readUsers().find((u) => u.id === session.userId);
    if (!user) {
        writeSession(null);
        return null;
    }

    const referral = ensureReferralProfile(user.id);

    return {
        id: user.id,
        email: user.email,
        accountType: user.accountType,
        displayName: user.displayName || user.email.split('@')[0],
        createdAt: user.createdAt,
        referralCode: referral.code,
        referrals: referral.referrals,
        referralBonusMonths: referral.bonusMonths,
        referredBy: referral.referrer
    };
}

export function isLoggedIn() {
    return getCurrentUser() !== null;
}

export function isProducer() {
    return getCurrentUser()?.accountType === ACCOUNT_TYPES.producer;
}

export function isClient() {
    return getCurrentUser()?.accountType === ACCOUNT_TYPES.client;
}

export function isAdmin() {
    return getCurrentUser()?.accountType === ACCOUNT_TYPES.admin;
}

/** Jednorazowy seed konta admina (local-only). */
export async function ensureAdminSeed() {
    const users = readUsers();
    if (users.some((u) => u.accountType === ACCOUNT_TYPES.admin || u.email === ADMIN_SEED_EMAIL)) {
        return false;
    }
    const salt = createId();
    const passwordHash = await hashPassword('Admin123!', salt);
    users.push({
        id: createId(),
        email: ADMIN_SEED_EMAIL,
        accountType: ACCOUNT_TYPES.admin,
        displayName: 'Admin',
        passwordHash,
        salt,
        createdAt: new Date().toISOString()
    });
    writeUsers(users);
    return true;
}

/**
 * @param {{ email: string, password: string, passwordConfirm?: string, accountType: string, displayName?: string, referralCode?: string }} data
 */
export async function register(data) {
    const email = String(data.email || '').trim().toLowerCase();
    const password = String(data.password || '');
    const passwordConfirm = String(data.passwordConfirm ?? password);
    const accountType = data.accountType === ACCOUNT_TYPES.producer
        ? ACCOUNT_TYPES.producer
        : ACCOUNT_TYPES.client;
    const displayName = String(data.displayName || '').trim();
    const referralCodeRaw = String(data.referralCode || '').trim();

    if (!validateEmail(email)) {
        return { ok: false, error: 'invalidEmail' };
    }
    if (!validatePassword(password)) {
        return { ok: false, error: 'passwordShort' };
    }
    if (password !== passwordConfirm) {
        return { ok: false, error: 'passwordMismatch' };
    }

    if (referralCodeRaw) {
        const check = validateReferralCode(referralCodeRaw);
        if (!check.ok) {
            return { ok: false, error: check.error === 'invalid' ? 'invalidReferral' : 'invalidReferral' };
        }
    }

    const users = readUsers();
    if (users.some((u) => u.email === email)) {
        return { ok: false, error: 'emailTaken' };
    }

    const producerCategories = accountType === ACCOUNT_TYPES.producer
        ? (Array.isArray(data.producerCategories) ? data.producerCategories.filter(Boolean) : [])
        : [];

    if (accountType === ACCOUNT_TYPES.producer && producerCategories.length === 0) {
        return { ok: false, error: 'categoriesRequired' };
    }

    const salt = createId();
    const passwordHash = await hashPassword(password, salt);
    const user = {
        id: createId(),
        email,
        accountType,
        displayName: displayName || email.split('@')[0],
        passwordHash,
        salt,
        createdAt: new Date().toISOString()
    };

    users.push(user);
    writeUsers(users);

    // Kod polecający nowego użytkownika
    ensureReferralProfile(user.id);

    let referralResult = null;
    if (referralCodeRaw) {
        referralResult = applyReferralOnRegister(user.id, referralCodeRaw);
        if (referralResult?.ok) {
            extendPremiumMonths(user.id, REFERRAL_BONUS_MONTHS, { reason: 'referral_new' });
            extendPremiumMonths(referralResult.referrerId, REFERRAL_BONUS_MONTHS, {
                reason: 'referral_owner'
            });
        }
    }

    if (accountType === ACCOUNT_TYPES.producer) {
        initProducerAccount(user.id, {
            name: user.displayName,
            email: user.email,
            categories: producerCategories
        });
    }

    writeSession({ userId: user.id, loggedInAt: new Date().toISOString() });
    const current = getCurrentUser();
    eventBus.emit(EVENTS.AUTH_CHANGED, { user: current });
    return { ok: true, user: current, referral: referralResult };
}

/**
 * @param {{ email: string, password: string }} data
 */
export async function login(data) {
    const email = String(data.email || '').trim().toLowerCase();
    const password = String(data.password || '');

    if (!validateEmail(email)) {
        return { ok: false, error: 'invalidEmail' };
    }
    if (!validatePassword(password)) {
        return { ok: false, error: 'passwordShort' };
    }

    const user = readUsers().find((u) => u.email === email);
    if (!user) {
        return { ok: false, error: 'invalidCredentials' };
    }

    const passwordHash = await hashPassword(password, user.salt);
    if (passwordHash !== user.passwordHash) {
        return { ok: false, error: 'invalidCredentials' };
    }

    if (data.expectedAccountType && user.accountType !== data.expectedAccountType) {
        return { ok: false, error: 'wrongAccountType' };
    }

    writeSession({ userId: user.id, loggedInAt: new Date().toISOString() });
    const current = getCurrentUser();
    eventBus.emit(EVENTS.AUTH_CHANGED, { user: current });
    return { ok: true, user: current };
}

export function logout() {
    writeSession(null);
    eventBus.emit(EVENTS.AUTH_CHANGED, { user: null });
}

/**
 * @param {{ displayName?: string }} patch
 */
export function updateClientProfile(patch) {
    const current = getCurrentUser();
    if (!current) return { ok: false, error: 'notLoggedIn' };

    const users = readUsers();
    const idx = users.findIndex((u) => u.id === current.id);
    if (idx === -1) return { ok: false, error: 'notFound' };

    if (patch.displayName != null) {
        users[idx].displayName = String(patch.displayName).trim() || users[idx].email.split('@')[0];
    }

    writeUsers(users);
    const user = getCurrentUser();
    eventBus.emit(EVENTS.AUTH_CHANGED, { user });
    return { ok: true, user };
}

/**
 * @param {{ currentPassword: string, newPassword: string, newPasswordConfirm?: string }} data
 */
export async function changePassword(data) {
    const current = getCurrentUser();
    if (!current) return { ok: false, error: 'notLoggedIn' };

    const currentPassword = String(data.currentPassword || '');
    const newPassword = String(data.newPassword || '');
    const newPasswordConfirm = String(data.newPasswordConfirm ?? newPassword);

    if (!validatePassword(currentPassword) || !validatePassword(newPassword)) {
        return { ok: false, error: 'passwordShort' };
    }
    if (newPassword !== newPasswordConfirm) {
        return { ok: false, error: 'passwordMismatch' };
    }

    const users = readUsers();
    const idx = users.findIndex((u) => u.id === current.id);
    if (idx === -1) return { ok: false, error: 'notFound' };

    const currentHash = await hashPassword(currentPassword, users[idx].salt);
    if (currentHash !== users[idx].passwordHash) {
        return { ok: false, error: 'invalidCredentials' };
    }

    const salt = createId();
    users[idx].salt = salt;
    users[idx].passwordHash = await hashPassword(newPassword, salt);
    writeUsers(users);
    return { ok: true };
}

export function initAuth() {
    ensureAdminSeed().catch(() => {});
    const user = getCurrentUser();
    if (user) {
        eventBus.emit(EVENTS.AUTH_CHANGED, { user });
    }
}

export default {
    ACCOUNT_TYPES,
    register,
    login,
    logout,
    getCurrentUser,
    isLoggedIn,
    isProducer,
    isClient,
    isAdmin,
    ensureAdminSeed,
    updateClientProfile,
    changePassword,
    validateEmail,
    validatePassword,
    initAuth
};
