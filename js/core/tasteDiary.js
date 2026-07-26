/**
 * Taste Diary (Smakowy Pamiętnik) – P1
 * Dane wyłącznie w localStorage. Bez sync / backend.
 */

export const TASTE_DIARY_STORAGE_KEY = 'rg_taste_diary';

const MAX_IMAGE_CHARS = 450_000; // ~ok. 300–350 KB data-URL
const MAX_ENTRIES = 200;

function safeParse(raw) {
    try {
        const list = JSON.parse(raw);
        return Array.isArray(list) ? list : [];
    } catch {
        return [];
    }
}

/**
 * @returns {Array<{
 *   id: string,
 *   producerId: string,
 *   producerName: string,
 *   productName: string,
 *   rating: number,
 *   note: string,
 *   image: string,
 *   date: string
 * }>}
 */
export function getTasteDiaryEntries() {
    if (typeof localStorage === 'undefined') return [];
    const list = safeParse(localStorage.getItem(TASTE_DIARY_STORAGE_KEY));
    // Najnowsze pierwsze
    return list
        .slice()
        .sort((a, b) => {
            const tb = Date.parse(b?.date || '') || 0;
            const ta = Date.parse(a?.date || '') || 0;
            return tb - ta;
        });
}

export function getTasteDiaryCount() {
    return getTasteDiaryEntries().length;
}

function writeEntries(list) {
    const sorted = list
        .slice()
        .sort((a, b) => {
            const tb = Date.parse(b?.date || '') || 0;
            const ta = Date.parse(a?.date || '') || 0;
            return tb - ta;
        })
        .slice(0, MAX_ENTRIES);
    localStorage.setItem(TASTE_DIARY_STORAGE_KEY, JSON.stringify(sorted));
}

/**
 * @param {{
 *   producerId: string,
 *   producerName?: string,
 *   productName: string,
 *   rating: number,
 *   note?: string,
 *   image?: string
 * }} input
 */
export function addTasteDiaryEntry(input) {
    const producerId = String(input?.producerId || '').trim();
    const productName = String(input?.productName || '').trim();
    const rating = Math.max(1, Math.min(5, Math.round(Number(input?.rating) || 0)));
    if (!producerId || !productName || rating < 1) {
        return { ok: false, reason: 'invalid' };
    }

    let image = String(input?.image || '');
    if (image && image.length > MAX_IMAGE_CHARS) {
        return { ok: false, reason: 'image_too_large' };
    }
    if (image && !image.startsWith('data:image/')) {
        image = '';
    }

    const entry = {
        id: `td-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        producerId,
        producerName: String(input?.producerName || '').trim(),
        productName,
        rating,
        note: String(input?.note || '').trim().slice(0, 1000),
        image,
        date: new Date().toISOString()
    };

    const list = getTasteDiaryEntries();
    list.unshift(entry);
    writeEntries(list);
    return { ok: true, entry };
}

export function removeTasteDiaryEntry(id) {
    const target = String(id || '');
    if (!target) return false;
    const next = getTasteDiaryEntries().filter((e) => e.id !== target);
    writeEntries(next);
    return true;
}

export function clearTasteDiary() {
    localStorage.removeItem(TASTE_DIARY_STORAGE_KEY);
}

/**
 * @param {File} file
 * @returns {Promise<string>} data-URL or ''
 */
export function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        if (!file || !file.type?.startsWith('image/')) {
            resolve('');
            return;
        }
        if (file.size > 900_000) {
            reject(new Error('image_too_large'));
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const result = String(reader.result || '');
            if (result.length > MAX_IMAGE_CHARS) {
                reject(new Error('image_too_large'));
                return;
            }
            resolve(result);
        };
        reader.onerror = () => reject(new Error('read_failed'));
        reader.readAsDataURL(file);
    });
}
