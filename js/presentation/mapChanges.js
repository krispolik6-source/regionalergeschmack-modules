/**
 * Mapa zmian — porównanie okolicy z poprzednią wizytą.
 * Działa lokalnie, bez komunikatów „AI”. Tylko efekt dla użytkownika (toast / fokus).
 */

import { getProducers } from '../data/dataService.js';
import { getProducersInRadius } from '../data/producerHelpers.js';
import { getLastPosition } from '../core/userLocation.js';

const STORE_KEY = 'rg_map_visit_snapshot_v1';

/**
 * @param {object} producer
 * @returns {string[]}
 */
function promoKeysFor(producer) {
    const keys = [];
    if (!producer) return keys;
    const id = String(producer.id || '');
    if (producer.promo) keys.push(`${id}::promo::${String(producer.promo).slice(0, 80)}`);
    if (producer.isPromoted || producer.promoted) keys.push(`${id}::flag::promoted`);
    const list = Array.isArray(producer.promotions) ? producer.promotions : [];
    for (const p of list) {
        const pid = p?.id || p?.title || p?.name;
        if (pid) keys.push(`${id}::prom::${String(pid)}`);
    }
    const products = Array.isArray(producer.products) ? producer.products : [];
    for (const prod of products) {
        if (prod?.promo) keys.push(`${id}::ppromo::${String(prod.id || prod.slug || prod.name)}:${String(prod.promo).slice(0, 40)}`);
    }
    return keys;
}

/**
 * @param {object[]} producers
 */
function buildSnapshot(producers = []) {
    const producerIds = [];
    const names = {};
    const promoKeys = [];
    for (const p of producers) {
        if (!p?.id) continue;
        const id = String(p.id);
        producerIds.push(id);
        names[id] = String(p.name || id).slice(0, 80);
        promoKeys.push(...promoKeysFor(p));
    }
    return {
        at: Date.now(),
        producerIds,
        names,
        promoKeys: [...new Set(promoKeys)]
    };
}

function readSnapshot() {
    try {
        const raw = localStorage.getItem(STORE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.producerIds)) return null;
        return parsed;
    } catch {
        return null;
    }
}

function writeSnapshot(snap) {
    try {
        localStorage.setItem(STORE_KEY, JSON.stringify(snap));
    } catch {
        /* ignore quota */
    }
}

/**
 * Producenci w aktualnym promieniu (lub wszyscy, gdy brak GPS).
 * @param {number} [radiusKm]
 */
export function getNearbyProducersForChanges(radiusKm = 25) {
    const all = (getProducers() || []).filter((p) => p && p.id && p.category !== 'other');
    const user = getLastPosition();
    if (!user?.lat || !user?.lng) return all;
    return getProducersInRadius(all, radiusKm, user);
}

/**
 * Zapisz stan okolicy (pełny snapshot).
 * @param {number} [radiusKm]
 */
export function rememberMapVisit(radiusKm = 25) {
    const nearby = getNearbyProducersForChanges(radiusKm);
    if (!nearby.length) return null;
    const snap = buildSnapshot(nearby);
    writeSnapshot(snap);
    return snap;
}

/**
 * Pierwsza wizyta: zapisz bazę w tle (bez nadpisywania przy kolejnych odświeżeniach).
 * @param {number} [radiusKm]
 */
export function ensureMapVisitBaseline(radiusKm = 25) {
    if (readSnapshot()) return null;
    return rememberMapVisit(radiusKm);
}

/**
 * Porównaj z poprzednią wizytą.
 * @param {{ radiusKm?: number }} [opts]
 * @returns {{
 *   firstVisit: boolean,
 *   newProducers: { id: string, name: string }[],
 *   newPromos: { id: string, name: string }[],
 *   removedCount: number,
 *   changed: boolean
 * }}
 */
export function diffMapChanges(opts = {}) {
    const radiusKm = Number(opts.radiusKm) > 0 ? Number(opts.radiusKm) : 25;
    const nearby = getNearbyProducersForChanges(radiusKm);
    const current = buildSnapshot(nearby);
    const prev = readSnapshot();

    if (!prev) {
        writeSnapshot(current);
        return {
            firstVisit: true,
            newProducers: [],
            newPromos: [],
            removedCount: 0,
            changed: false
        };
    }

    const prevIds = new Set((prev.producerIds || []).map(String));
    const prevPromos = new Set(prev.promoKeys || []);
    const prevNames = prev.names || {};

    const newProducers = [];
    for (const id of current.producerIds) {
        if (!prevIds.has(id)) {
            newProducers.push({ id, name: current.names[id] || id });
        }
    }

    const newPromoIds = new Set();
    for (const key of current.promoKeys) {
        if (!prevPromos.has(key)) {
            const id = String(key).split('::')[0];
            if (id) newPromoIds.add(id);
        }
    }
    const newPromos = [...newPromoIds].map((id) => ({
        id,
        name: current.names[id] || prevNames[id] || id
    }));

    const currIds = new Set(current.producerIds);
    let removedCount = 0;
    for (const id of prevIds) {
        if (!currIds.has(id)) removedCount += 1;
    }

    writeSnapshot(current);

    return {
        firstVisit: false,
        newProducers,
        newPromos,
        removedCount,
        changed: newProducers.length > 0 || newPromos.length > 0 || removedCount > 0
    };
}

/**
 * Krótki komunikat po ludzku (bez słowa AI).
 * @param {ReturnType<typeof diffMapChanges>} diff
 * @param {(key: string, vars?: object) => string} t
 */
export function formatMapChangesMessage(diff, t) {
    if (!diff) return t('map.whatsNewEmpty');
    if (diff.firstVisit) return t('map.whatsNewFirst');

    const parts = [];
    if (diff.newProducers.length) {
        const names = diff.newProducers.slice(0, 3).map((p) => p.name).join(', ');
        const more = diff.newProducers.length > 3 ? ` (+${diff.newProducers.length - 3})` : '';
        parts.push(t('map.whatsNewProducers').replace('{names}', names + more).replace('{count}', String(diff.newProducers.length)));
    }
    if (diff.newPromos.length) {
        parts.push(t('map.whatsNewPromos').replace('{count}', String(diff.newPromos.length)));
    }
    if (diff.removedCount > 0 && !parts.length) {
        parts.push(t('map.whatsNewRemoved').replace('{count}', String(diff.removedCount)));
    }
    if (!parts.length) return t('map.whatsNewEmpty');
    return parts.join(' · ');
}
