/**
 * Ukryty panel deweloperski – dostęp po haśle (sessionStorage).
 * Jedyny mechanizm dostępu: PIN → sesja. Bez localhost / LAN / desktop / viewport.
 * Nie zmienia architektury Store/EventBus. AutoFix=false.
 */

export const DEV_VAULT_SESSION_KEY = 'rg_dev_vault_ok';
/** Hasło właściciela – tylko bramka UI (nie sekret API). */
export const DEV_VAULT_PASSWORD = '1973';

export const DEV_VAULT_FAILED_ATTEMPTS_KEY = 'devVault_failedAttempts';
export const DEV_VAULT_LOCK_UNTIL_KEY = 'devVault_lockUntil';
export const DEV_VAULT_MAX_FAILED_ATTEMPTS = 2;
export const DEV_VAULT_LOCK_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
/** Wizualne zmylenie – sugeruje dłuższy kod niż 4-cyfrowy PIN. */
export const DEV_VAULT_PIN_MASK = '....................';

const LOCK_MESSAGE = 'Dostęp zablokowany na 30 dni.';

function readLocalNumber(key, fallback = 0) {
    try {
        const raw = localStorage.getItem(key);
        const n = Number(raw);
        return Number.isFinite(n) ? n : fallback;
    } catch {
        return fallback;
    }
}

function writeLocalNumber(key, value) {
    try {
        localStorage.setItem(key, String(value));
        return true;
    } catch {
        return false;
    }
}

function removeLocalKey(key) {
    try {
        localStorage.removeItem(key);
    } catch {
        /* ignore */
    }
}

export function getDevVaultFailedAttempts() {
    return Math.max(0, Math.floor(readLocalNumber(DEV_VAULT_FAILED_ATTEMPTS_KEY, 0)));
}

export function getDevVaultLockUntil() {
    return readLocalNumber(DEV_VAULT_LOCK_UNTIL_KEY, 0);
}

export function isDevVaultAccessLocked() {
    const lockUntil = getDevVaultLockUntil();
    if (!lockUntil) return false;
    if (Date.now() >= lockUntil) {
        resetDevVaultLock();
        return false;
    }
    return true;
}

export function getDevVaultLockMessage() {
    return LOCK_MESSAGE;
}

/**
 * Reset licznika i blokady (właściciel — konsola / ukryty gest).
 */
export function resetDevVaultLock() {
    removeLocalKey(DEV_VAULT_FAILED_ATTEMPTS_KEY);
    removeLocalKey(DEV_VAULT_LOCK_UNTIL_KEY);
    return { ok: true };
}

/**
 * @returns {{ locked: boolean, attempts: number, lockUntil: number|null }}
 */
export function recordDevVaultFailedAttempt() {
    const attempts = getDevVaultFailedAttempts() + 1;
    writeLocalNumber(DEV_VAULT_FAILED_ATTEMPTS_KEY, attempts);

    if (attempts >= DEV_VAULT_MAX_FAILED_ATTEMPTS) {
        const lockUntil = Date.now() + DEV_VAULT_LOCK_DURATION_MS;
        writeLocalNumber(DEV_VAULT_LOCK_UNTIL_KEY, lockUntil);
        return { locked: true, attempts, lockUntil };
    }

    return { locked: false, attempts, lockUntil: null };
}

export function isDevVaultUnlocked() {
    try {
        return sessionStorage.getItem(DEV_VAULT_SESSION_KEY) === '1';
    } catch {
        return false;
    }
}

/** Kanoniczna bramka: panel deweloperski + raporty /docs/ po PIN w tej sesji. */
export function isDeveloperAccessGranted() {
    return isDevVaultUnlocked();
}

export function unlockDevVault(password) {
    if (isDevVaultAccessLocked()) {
        return { ok: false, reason: 'locked', message: LOCK_MESSAGE };
    }

    if (String(password ?? '') !== DEV_VAULT_PASSWORD) {
        const lockState = recordDevVaultFailedAttempt();
        if (lockState.locked) {
            return {
                ok: false,
                reason: 'locked',
                message: LOCK_MESSAGE,
                attempts: lockState.attempts
            };
        }
        return {
            ok: false,
            reason: 'bad_password',
            attempts: lockState.attempts,
            remaining: DEV_VAULT_MAX_FAILED_ATTEMPTS - lockState.attempts
        };
    }

    resetDevVaultLock();
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
