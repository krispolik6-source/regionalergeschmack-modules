// js/core/pushNotifications.js · web push: subskrypcja, polling ofert, powiadomienia

import { CONFIG } from '../config.js';
import { getProducers, getProducersInRadius } from '../data/dataService.js';
import { getLastPosition } from './userLocation.js';
import { getCurrentSeason, getSeasonalDemoItems } from '../data/seasonCalendar.js';
import { eventBus } from './eventBus.js';
import { EVENTS } from './events.js';
import { getSettings, saveSettings } from './settings.js';
import { t } from './i18n.js';
import { safeLocalStorageSetItem, byteLen, ensureLocalStorageHeadroom } from './safeStorage.js';

const SEASON_NOTIFY_KEY = 'rg_push_season_notified';
const NEARBY_NOTIFY_KEY = 'rg_push_nearby_ids';

/** Klucz VAPID z CONFIG (jedno źródło prawdy – bez osobnego named export). */
const PUSH_VAPID_PUBLIC_KEY = String(CONFIG.PUSH_VAPID_PUBLIC_KEY || '');
/** Interwał pollingu ofert – domyślnie 5 min, jeśli brak w CONFIG. */
const PUSH_POLL_INTERVAL_MS = Number(CONFIG.PUSH_POLL_INTERVAL_MS) > 0
    ? Number(CONFIG.PUSH_POLL_INTERVAL_MS)
    : 5 * 60 * 1000;

const SUBSCRIPTION_KEY = 'rg_push_subscription';
const SNAPSHOT_KEY = 'rg_push_content_snapshot';
const SNAPSHOT_BASELINE_KEY = 'rg_push_snapshot_v3_baseline';
const SNAPSHOT_VERSION = 3;
/** Maks. rozmiar snapshotu — powyżej tylko fingerprint + metadane. */
const SNAPSHOT_MAX_BYTES = 200 * 1024;

/** Kompaktowe klucze ofert w pamięci sesji (diff bez tysięcy kluczy w LS). */
/** @type {Set<string> | null} */
let runtimeSnapshotKeys = null;

let pollTimer = null;
let placesDebounce = null;

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    const output = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) {
        output[i] = raw.charCodeAt(i);
    }
    return output;
}

export function getStoredSubscription() {
    try {
        const raw = localStorage.getItem(SUBSCRIPTION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (_) {
        return null;
    }
}

function saveSubscription(subscription) {
    safeLocalStorageSetItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
}

export function clearStoredSubscription() {
    localStorage.removeItem(SUBSCRIPTION_KEY);
}

export function compactOfferKey(jsonKey) {
    const parsed = typeof jsonKey === 'string' ? parseOfferKey(jsonKey) : jsonKey;
    const type = String(parsed?.type || 'offer');
    const producerId = String(parsed?.producerId || '');
    const itemId = String(parsed?.itemId || '');
    return `${type}|${producerId}|${itemId}`;
}

function hashFingerprint(input) {
    const str = String(input ?? '');
    let hash = 5381;
    for (let i = 0; i < str.length; i += 1) {
        hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    }
    return (hash >>> 0).toString(36);
}

function summarizeProducers(keys, producers) {
    const byProducer = new Map();
    for (const key of keys || []) {
        const compact = typeof key === 'string' && key.includes('|') && !key.startsWith('{')
            ? key
            : compactOfferKey(key);
        const producerId = compact.split('|')[1] || '';
        if (!producerId) continue;
        if (!byProducer.has(producerId)) byProducer.set(producerId, []);
        byProducer.get(producerId).push(compact);
    }

    const lookup = new Map((producers || []).map((p) => [String(p.id), p]));
    return [...byProducer.entries()].map(([id, producerKeys]) => {
        const producer = lookup.get(id);
        const updatedAt = producer?.updatedAt
            ?? producer?.updated_at
            ?? producer?.modifiedAt
            ?? null;
        return {
            id,
            updatedAt,
            offerCount: producerKeys.length,
            fp: hashFingerprint(producerKeys.sort().join('\n'))
        };
    });
}

export function buildMinimalSnapshotPayload(keys, producers) {
    const compactKeys = [...(keys || [])]
        .map((key) => compactOfferKey(key))
        .sort();
    const fingerprint = hashFingerprint(compactKeys.join('\n'));

    return {
        v: SNAPSHOT_VERSION,
        updatedAt: Date.now(),
        offerCount: compactKeys.length,
        fingerprint,
        producers: summarizeProducers(compactKeys, producers).map(({ id, updatedAt, offerCount, fp }) => ({
            id,
            updatedAt,
            offerCount,
            fp
        }))
    };
}

export function buildFingerprintOnlySnapshotPayload(keys) {
    const compactKeys = [...(keys || [])]
        .map((key) => compactOfferKey(key))
        .sort();

    return {
        v: SNAPSHOT_VERSION,
        updatedAt: Date.now(),
        offerCount: compactKeys.length,
        fingerprint: hashFingerprint(compactKeys.join('\n')),
        producers: []
    };
}

/** @deprecated v2 — zawierał keys[] (duży rozmiar). Użyj buildMinimalSnapshotPayload. */
export function buildLightSnapshotPayload(keys, producers) {
    const minimal = buildMinimalSnapshotPayload(keys, producers);
    const compactKeys = [...(keys || [])].map((key) => compactOfferKey(key)).sort();
    return {
        ...minimal,
        v: 2,
        keys: compactKeys
    };
}

/** @deprecated v1 – pełne JSON-klucze ofert (duży rozmiar). */
export function buildLegacySnapshotPayload(keys) {
    return {
        keys: [...keys],
        updatedAt: Date.now()
    };
}

function readSnapshotData() {
    try {
        const raw = localStorage.getItem(SNAPSHOT_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (_) {
        return null;
    }
}

/**
 * Odtwarza znane klucze z hashów producentów (bez pełnej listy w LS).
 * @param {object} data
 * @param {Set<string>} currentCompactSet
 */
function hydrateKnownKeysFromSnapshot(data, currentCompactSet) {
    if (!data) return null;

    const currentArr = [...currentCompactSet];
    const currentFp = hashFingerprint([...currentArr].sort().join('\n'));

    if (data.fingerprint === currentFp) {
        return new Set(currentArr);
    }

    const prevProducers = new Map((data.producers || []).map((p) => [String(p.id), p]));
    const known = new Set();
    const byProducer = new Map();

    for (const compact of currentArr) {
        const producerId = compact.split('|')[1] || '';
        if (!producerId) continue;
        if (!byProducer.has(producerId)) byProducer.set(producerId, []);
        byProducer.get(producerId).push(compact);
    }

    for (const [producerId, producerKeys] of byProducer.entries()) {
        const sorted = [...producerKeys].sort();
        const fp = hashFingerprint(sorted.join('\n'));
        const prev = prevProducers.get(producerId);
        if (prev && prev.fp === fp) {
            sorted.forEach((k) => known.add(k));
        }
    }

    return known;
}

function readSnapshot(currentKeys) {
    if (runtimeSnapshotKeys) {
        return new Set(runtimeSnapshotKeys);
    }

    const data = readSnapshotData();
    if (!data) return null;

    if (Array.isArray(data.keys) && data.keys.length > 0) {
        const compact = data.keys.map((key) => compactOfferKey(key));
        runtimeSnapshotKeys = new Set(compact);
        return runtimeSnapshotKeys;
    }

    const currentCompact = new Set([...(currentKeys || [])].map((key) => compactOfferKey(key)));
    const known = hydrateKnownKeysFromSnapshot(data, currentCompact);
    if (!known) return null;

    if (known.size === 0 && (data.producers || []).length > 0) {
        return null;
    }

    const currentFp = hashFingerprint([...currentCompact].sort().join('\n'));
    if (
        data.v === SNAPSHOT_VERSION
        && data.fingerprint !== currentFp
        && !localStorage.getItem(SNAPSHOT_BASELINE_KEY)
    ) {
        safeLocalStorageSetItem(SNAPSHOT_BASELINE_KEY, String(Date.now()), { skipOnQuota: true });
        return null;
    }

    runtimeSnapshotKeys = known;
    return known;
}

function writeSnapshot(keys, producers) {
    ensureLocalStorageHeadroom();

    const compactKeys = [...keys].map((key) => compactOfferKey(key));
    runtimeSnapshotKeys = new Set(compactKeys);

    let payload = buildMinimalSnapshotPayload(keys, producers);
    let json = JSON.stringify(payload);

    if (byteLen(json) > SNAPSHOT_MAX_BYTES) {
        payload = buildFingerprintOnlySnapshotPayload(keys);
        json = JSON.stringify(payload);
    }

    const result = safeLocalStorageSetItem(SNAPSHOT_KEY, json, { skipOnQuota: true });
    if (!result.ok && result.skipped) {
        console.warn('[Push] Pominięto zapis snapshotu — brak miejsca w localStorage');
    }
}

export function collectOfferKeys(producers) {
    const keys = new Set();

    for (const producer of producers || []) {
        const producerId = String(producer.id);
        const producerName = producer.name || producerId;

        if (String(producer.source) === 'user' || String(producer.id || '').startsWith('content-')) {
            keys.add(JSON.stringify({
                type: 'new_producer',
                producerId,
                itemId: producerId,
                producerName,
                itemLabel: producerName
            }));
        }

        for (const product of producer.products || []) {
            const productId = product.id || product.name;
            if (!productId) continue;
            keys.add(JSON.stringify({
                type: 'product',
                producerId,
                itemId: String(productId),
                producerName,
                itemLabel: product.name || String(productId)
            }));

            if (product.seasonal === true) {
                keys.add(JSON.stringify({
                    type: 'seasonal_product',
                    producerId,
                    itemId: String(productId),
                    producerName,
                    itemLabel: product.name || String(productId)
                }));
            }
            if (product.available === 'available' && product.onPromo) {
                keys.add(JSON.stringify({
                    type: 'back_in_stock',
                    producerId,
                    itemId: String(productId),
                    producerName,
                    itemLabel: product.name || String(productId)
                }));
            }
            const nameLower = String(product.name || '').toLowerCase();
            if (/brot|brötchen|bread|pieczy|bäck/.test(nameLower)) {
                keys.add(JSON.stringify({
                    type: 'fresh_bread',
                    producerId,
                    itemId: String(productId),
                    producerName,
                    itemLabel: product.name || String(productId)
                }));
            }
            if (/käse|cheese|ser/.test(nameLower)) {
                keys.add(JSON.stringify({
                    type: 'new_cheese',
                    producerId,
                    itemId: String(productId),
                    producerName,
                    itemLabel: product.name || String(productId)
                }));
            }
        }

        for (const promo of producer.promotions || []) {
            const promoId = promo.id || promo.title;
            if (!promoId) continue;
            keys.add(JSON.stringify({
                type: 'promotion',
                producerId,
                itemId: String(promoId),
                producerName,
                itemLabel: promo.title || String(promoId)
            }));
        }
    }

    return keys;
}

export function parseOfferKey(key) {
    try {
        return JSON.parse(key);
    } catch (_) {
        return { type: 'offer', producerName: '', itemLabel: '' };
    }
}

function isPushConfigured() {
    return getSettings().notifications !== false;
}

async function getServiceWorkerRegistration() {
    if (!('serviceWorker' in navigator)) return null;
    try {
        return await navigator.serviceWorker.ready;
    } catch (_) {
        return null;
    }
}

async function showNotification({ title, body, tag, url }) {
    const registration = await getServiceWorkerRegistration();

    if (registration?.active) {
        registration.active.postMessage({
            type: 'SHOW_NOTIFICATION',
            title,
            body,
            tag,
            url: url || '/?view=map'
        });
        return true;
    }

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: '/assets/icons/icon-192.png?v=29',
            tag
        });
        return true;
    }

    return false;
}

export async function subscribeToPush() {
    if (!('Notification' in window)) {
        return { ok: false, reason: 'unsupported' };
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        return { ok: false, reason: 'denied' };
    }

    const registration = await getServiceWorkerRegistration();
    if (!registration) {
        return { ok: false, reason: 'no-sw' };
    }

    let subscription = null;

    if ('pushManager' in registration) {
        try {
            const existing = await registration.pushManager.getSubscription();
            if (existing) {
                subscription = existing;
            } else if (PUSH_VAPID_PUBLIC_KEY) {
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(PUSH_VAPID_PUBLIC_KEY)
                });
            }
        } catch (error) {
            console.warn('[Push] PushManager subscribe failed, using local mode:', error);
        }
    }

    const stored = subscription
        ? { ...subscription.toJSON(), mode: 'push', savedAt: Date.now() }
        : { mode: 'local', permission: 'granted', savedAt: Date.now() };

    saveSubscription(stored);
    writeSnapshot(collectOfferKeys(getProducers()), getProducers());

    return { ok: true, subscription: stored };
}

export async function unsubscribeFromPush() {
    const registration = await getServiceWorkerRegistration();
    if (registration?.pushManager) {
        try {
            const sub = await registration.pushManager.getSubscription();
            if (sub) await sub.unsubscribe();
        } catch (error) {
            console.warn('[Push] unsubscribe failed:', error);
        }
    }
    clearStoredSubscription();
}

export async function syncPushWithSettings(enabled) {
    if (!enabled) {
        stopPushPolling();
        await unsubscribeFromPush();
        return true;
    }

    const result = await subscribeToPush();
    if (!result.ok) {
        saveSettings({ notifications: false });
        return false;
    }

    startPushPolling();
    return true;
}

function formatMessage(key, vars = {}) {
    let text = t(key);
    Object.entries(vars).forEach(([name, value]) => {
        text = text.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value ?? ''));
    });
    return text;
}

function notifySeasonalIfNeeded() {
    const season = getCurrentSeason();
    try {
        if (localStorage.getItem(SEASON_NOTIFY_KEY) === season) return 0;
        safeLocalStorageSetItem(SEASON_NOTIFY_KEY, season);
    } catch (_) {
        return 0;
    }
    const items = getSeasonalDemoItems(season).slice(0, 3).map((x) => x.name).join(', ');
    showNotification({
        title: t('push.seasonalTitle'),
        body: formatMessage('push.seasonalBody', { items }),
        tag: `seasonal-${season}`,
        url: '/?view=home'
    });
    return 1;
}

function notifyNearbyProducers(producers) {
    const user = getLastPosition();
    if (!user) return 0;
    const nearby = getProducersInRadius(producers, 5, user).slice(0, 12);
    let known = new Set();
    try {
        const raw = localStorage.getItem(NEARBY_NOTIFY_KEY);
        known = new Set(raw ? JSON.parse(raw) : []);
    } catch (_) {
        known = new Set();
    }

    let notified = 0;
    const nextIds = nearby.map((p) => String(p.id));
    for (const producer of nearby) {
        const id = String(producer.id);
        if (known.has(id)) continue;
        if (producer.source !== 'osm' && producer.source !== 'user' && !String(id).startsWith('content-')) {
            continue;
        }
        showNotification({
            title: t('push.nearbyTitle'),
            body: formatMessage('push.nearbyBody', { name: producer.name || id }),
            tag: `nearby-${id}`,
            url: '/?view=map'
        });
        notified += 1;
        known.add(id);
        if (notified >= 2) break;
    }

    try {
        safeLocalStorageSetItem(
            NEARBY_NOTIFY_KEY,
            JSON.stringify([...new Set([...known, ...nextIds])].slice(-80))
        );
    } catch (_) {
        /* ignore */
    }
    return notified;
}

export function checkForNewOffers({ forceBaseline = false } = {}) {
    if (!isPushConfigured()) return { notified: 0 };
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
        return { notified: 0 };
    }
    if (!getStoredSubscription()) return { notified: 0 };

    const producers = getProducers();
    const currentKeys = collectOfferKeys(producers);
    const previousKeys = readSnapshot(currentKeys);

    if (!previousKeys || forceBaseline) {
        writeSnapshot(currentKeys, producers);
        notifySeasonalIfNeeded();
        return { notified: 0, baselined: true };
    }

    const newKeys = [...currentKeys].filter((key) => !previousKeys.has(compactOfferKey(key)));
    let notified = 0;

    for (const key of newKeys) {
        const { type, producerName, itemLabel } = parseOfferKey(key);
        let title = t('push.title');
        let body = '';

        if (type === 'product') {
            body = formatMessage('push.newProduct', { name: itemLabel, producer: producerName });
        } else if (type === 'promotion') {
            body = formatMessage('push.newPromotion', { title: itemLabel, producer: producerName });
            title = t('push.promo');
        } else if (type === 'seasonal_product') {
            title = t('push.seasonalProducts');
            body = `${itemLabel} · ${producerName}`;
        } else if (type === 'new_producer') {
            title = t('push.newProducer');
            body = producerName;
        } else if (type === 'back_in_stock') {
            title = t('push.backInStock');
            body = `${itemLabel} · ${producerName}`;
        } else if (type === 'fresh_bread') {
            title = t('push.freshBread');
            body = `${itemLabel} · ${producerName}`;
        } else if (type === 'new_cheese') {
            title = t('push.newCheese');
            body = `${itemLabel} · ${producerName}`;
        } else {
            body = formatMessage('push.newOffer', { producer: producerName });
        }

        showNotification({
            title,
            body,
            tag: key,
            url: '/?view=map'
        });
        notified += 1;
    }

    notified += notifySeasonalIfNeeded();
    notified += notifyNearbyProducers(producers);

    writeSnapshot(currentKeys, producers);
    return { notified };
}

function startPushPolling() {
    stopPushPolling();
    if (!isPushConfigured() || !getStoredSubscription()) return;

    pollTimer = window.setInterval(() => {
        checkForNewOffers();
    }, PUSH_POLL_INTERVAL_MS);
}

function stopPushPolling() {
    if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
    }
    if (placesDebounce) {
        clearTimeout(placesDebounce);
        placesDebounce = null;
    }
}

function bindPlacesUpdates() {
    const scheduleCheck = () => {
        if (!isPushConfigured() || !getStoredSubscription()) return;
        if (placesDebounce) clearTimeout(placesDebounce);
        placesDebounce = window.setTimeout(() => {
            checkForNewOffers();
        }, 2000);
    };

    eventBus.on(EVENTS.PLACES_LOADED, scheduleCheck);
    eventBus.on(EVENTS.PLACES_CHANGED, scheduleCheck);
}

function bindServiceWorkerMessages() {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'OPEN_VIEW' && event.data.url) {
            const url = new URL(event.data.url, window.location.origin);
            const view = url.searchParams.get('view');
            if (view && typeof window.navigateTo === 'function') {
                window.navigateTo(view);
            }
        }
    });
}

let pushInitialized = false;

export async function initPushNotifications() {
    if (pushInitialized) return;
    pushInitialized = true;
    bindPlacesUpdates();
    bindServiceWorkerMessages();

    if (!isPushConfigured()) return;

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        if (!getStoredSubscription()) {
            await subscribeToPush();
        }
        startPushPolling();
        return;
    }

    if (getStoredSubscription() && Notification.permission !== 'granted') {
        clearStoredSubscription();
        saveSettings({ notifications: false });
    }
}

export function checkPushOffersNow() {
    return checkForNewOffers();
}

export default {
    initPushNotifications,
    subscribeToPush,
    unsubscribeFromPush,
    syncPushWithSettings,
    checkForNewOffers,
    checkPushOffersNow,
    getStoredSubscription,
    collectOfferKeys,
    compactOfferKey,
    buildMinimalSnapshotPayload,
    buildFingerprintOnlySnapshotPayload,
    buildLightSnapshotPayload,
    buildLegacySnapshotPayload
};
