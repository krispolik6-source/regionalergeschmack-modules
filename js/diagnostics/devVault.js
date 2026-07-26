/**
 * Ukryty panel deweloperski – dostęp po haśle (sessionStorage).
 * Nie zmienia architektury Store/EventBus. AutoFix=false.
 */

export const DEV_VAULT_SESSION_KEY = 'rg_dev_vault_ok';
/** Hasło właściciela – tylko bramka UI (nie sekret API). */
export const DEV_VAULT_PASSWORD = '1973';

export function isDevVaultUnlocked() {
    try {
        return sessionStorage.getItem(DEV_VAULT_SESSION_KEY) === '1';
    } catch {
        return false;
    }
}

export function unlockDevVault(password) {
    if (String(password ?? '') !== DEV_VAULT_PASSWORD) {
        return { ok: false, reason: 'bad_password' };
    }
    try {
        sessionStorage.setItem(DEV_VAULT_SESSION_KEY, '1');
    } catch {
        /* ignore */
    }
    return { ok: true };
}

export function lockDevVault() {
    try {
        sessionStorage.removeItem(DEV_VAULT_SESSION_KEY);
    } catch {
        /* ignore */
    }
}
