/**
 * Harmonogram nocnych testów – codziennie 03:03 czasu lokalnego (zegar systemowy).
 */

/** Godzina lokalna uruchomienia */
export const NIGHTLY_HOUR = 3;
/** Minuta lokalna uruchomienia */
export const NIGHTLY_MINUTE = 3;

/**
 * Data lokalna YYYY-MM-DD (nie UTC).
 * @param {Date} [d]
 */
export function localDayStamp(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

/**
 * Czy `date` wypada w oknie 03:03 (ta sama minuta lokalna).
 * @param {Date} [date]
 */
export function isNightlySlot(date = new Date()) {
    return date.getHours() === NIGHTLY_HOUR && date.getMinutes() === NIGHTLY_MINUTE;
}

/**
 * Następny moment 03:03 lokalnego. Jeśli już po 03:03 dziś → jutro.
 * @param {Date} [from]
 */
export function nextNightlyRunAt(from = new Date()) {
    const next = new Date(from.getTime());
    next.setSeconds(0, 0);
    next.setMilliseconds(0);
    next.setHours(NIGHTLY_HOUR, NIGHTLY_MINUTE, 0, 0);
    if (next.getTime() <= from.getTime()) {
        next.setDate(next.getDate() + 1);
    }
    return next;
}

/**
 * @param {Date} [from]
 * @returns {number} ms do następnego 03:03
 */
export function msUntilNextNightly(from = new Date()) {
    return Math.max(0, nextNightlyRunAt(from).getTime() - from.getTime());
}

/**
 * Opis harmonogramu (log / raport).
 */
export function describeNightlySchedule(from = new Date()) {
    const next = nextNightlyRunAt(from);
    const ms = msUntilNextNightly(from);
    const hours = Math.floor(ms / 3_600_000);
    const minutes = Math.floor((ms % 3_600_000) / 60_000);
    return {
        hour: NIGHTLY_HOUR,
        minute: NIGHTLY_MINUTE,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'local',
        nextAt: next.toISOString(),
        nextLocal: next.toString(),
        msUntil: ms,
        humanUntil: `${hours}h ${minutes}m`
    };
}

/**
 * Śpij do następnego 03:03 (chunki, aby dało się przerwać).
 * @param {{ signal?: AbortSignal, chunkMs?: number, onWait?: (info: object) => void }} [opts]
 */
export async function sleepUntilNextNightly(opts = {}) {
    const { signal, chunkMs = 60_000, onWait } = opts;
    while (!signal?.aborted) {
        const ms = msUntilNextNightly();
        if (ms <= 0) return;
        if (typeof onWait === 'function') {
            onWait(describeNightlySchedule());
        }
        const wait = Math.min(ms, chunkMs);
        await new Promise((resolve, reject) => {
            const t = setTimeout(resolve, wait);
            if (!signal) return;
            const onAbort = () => {
                clearTimeout(t);
                reject(new Error('aborted'));
            };
            signal.addEventListener('abort', onAbort, { once: true });
        });
    }
    throw new Error('aborted');
}
