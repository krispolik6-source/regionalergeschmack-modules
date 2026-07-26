/* eslint-disable no-restricted-globals */
// sw.js – PWA: cache offline + web push
// ETAP 28F – ikony: network-first + twardy bump cache (Android launcher)

/** ETAP 35B — jedna kanoniczna wersja PWA (SW + manifest + ikony). */
const PWA_VERSION = '28';
const CACHE_VERSION = `rg-pwa-v${PWA_VERSION}`;
const IMAGE_CACHE = `rg-runtime-images-v${PWA_VERSION}`;
const ICON_VERSION = PWA_VERSION;
const DEFAULT_ICON = `/assets/icons/icon-192.png?v=${ICON_VERSION}`;

const PRECACHE_URLS = [
    '/',
    '/index.html',
    `/manifest.json?v=${ICON_VERSION}`,
    `/assets/icons/favicon.ico?v=${ICON_VERSION}`,
    `/assets/icons/logo-master.svg?v=${ICON_VERSION}`,
    `/assets/icons/apple-touch-icon.png?v=${ICON_VERSION}`,
    `/assets/icons/icon-48.png?v=${ICON_VERSION}`,
    `/assets/icons/icon-72.png?v=${ICON_VERSION}`,
    `/assets/icons/icon-96.png?v=${ICON_VERSION}`,
    `/assets/icons/icon-128.png?v=${ICON_VERSION}`,
    `/assets/icons/icon-144.png?v=${ICON_VERSION}`,
    `/assets/icons/icon-152.png?v=${ICON_VERSION}`,
    `/assets/icons/icon-180.png?v=${ICON_VERSION}`,
    `/assets/icons/icon-192.png?v=${ICON_VERSION}`,
    `/assets/icons/icon-256.png?v=${ICON_VERSION}`,
    `/assets/icons/icon-384.png?v=${ICON_VERSION}`,
    `/assets/icons/icon-512.png?v=${ICON_VERSION}`,
    `/assets/icons/icon-1024.png?v=${ICON_VERSION}`,
    `/assets/icons/maskable-512.png?v=${ICON_VERSION}`,
    `/assets/icons/monochrome-512.png?v=${ICON_VERSION}`,
    `/assets/brand/og-share.png?v=${ICON_VERSION}`,
    `/assets/brand/splash-logo.png?v=${ICON_VERSION}`,
    `/assets/brand/notifications-icon.png?v=${ICON_VERSION}`
];

function isAppIconPath(pathname) {
    return pathname.startsWith('/assets/icons/')
        || pathname === '/assets/brand/og-share.png'
        || pathname === '/assets/brand/splash-logo.png'
        || pathname === '/assets/brand/notifications-icon.png'
        || pathname === '/manifest.json';
}

/**
 * Cache API nie obsługuje odpowiedzi częściowych (206) ani innych niż pełne 200 basic.
 * @param {Cache} cache
 * @param {RequestInfo} request
 * @param {Response} response
 * @returns {Promise<void>}
 */
async function safeCachePut(cache, request, response) {
    if (!cache || !response) return;
    if (!response.ok) return;
    if (response.status !== 200) return;
    if (response.type !== 'basic') return;
    try {
        await cache.put(request, response);
    } catch (error) {
        console.warn('[SW] safeCachePut skipped:', error);
    }
}

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then((cache) => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
            .catch((error) => {
                console.warn('[SW] Precache failed:', error);
            })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys
                    .filter((key) => {
                        if (key === CACHE_VERSION || key === IMAGE_CACHE) return false;
                        // Usuń wszystkie stare PWA + runtime image caches (w tym v1 ikon)
                        return key.startsWith('rg-pwa-') || key.startsWith('rg-runtime-images-');
                    })
                    .map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    // Ikony / manifest – ZAWSZE network-first (Android/iOS launcher + cache-bust ?v=)
    if (isAppIconPath(url.pathname)) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_VERSION).then((cache) => safeCachePut(cache, request, clone));
                    return response;
                })
                .catch(() => caches.match(request).then((cached) => {
                    if (cached) return cached;
                    // fallback bez query
                    return caches.match(url.pathname);
                }))
        );
        return;
    }

    const isCodeAsset = url.pathname.startsWith('/js/')
        || url.pathname.startsWith('/css/')
        || url.pathname.endsWith('.js')
        || url.pathname.endsWith('.css')
        || url.pathname.endsWith('.mjs');

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_VERSION).then((cache) => safeCachePut(cache, '/index.html', clone));
                    return response;
                })
                .catch(() => caches.match('/index.html').then((cached) => cached || caches.match('/')))
        );
        return;
    }

    if (isCodeAsset) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_VERSION).then((cache) => safeCachePut(cache, request, clone));
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // Audio ambient – network-first (nie trzymaj starego 404 / pustego cache)
    const isAudio = request.destination === 'audio'
        || url.pathname.startsWith('/assets/audio/')
        || /\.(?:mp3|wav|webm|ogg)(?:\?|$)/i.test(url.pathname);

    if (isAudio) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_VERSION).then((cache) => safeCachePut(cache, request, clone));
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    const isImage = request.destination === 'image'
        || /\.(?:png|jpe?g|webp|gif|svg|ico)(?:\?|$)/i.test(url.pathname);

    if (isImage) {
        event.respondWith(
            caches.open(IMAGE_CACHE).then((cache) => cache.match(request).then((cached) => {
                const networkFetch = fetch(request)
                    .then((response) => {
                        safeCachePut(cache, request, response.clone());
                        return response;
                    })
                    .catch(() => cached);
                return cached || networkFetch;
            }))
        );
        return;
    }

    event.respondWith(
        caches.match(request).then((cached) => {
            const networkFetch = fetch(request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_VERSION).then((cache) => safeCachePut(cache, request, clone));
                    return response;
                })
                .catch(() => cached);

            return cached || networkFetch;
        })
    );
});

// Replay lokalnej kolejki po odzyskaniu sieci (klient woła flush)
self.addEventListener('sync', (event) => {
    if (event.tag !== 'rg-offline-sync') return;
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            clients.forEach((client) => client.postMessage({ type: 'FLUSH_OFFLINE_QUEUE' }));
        })
    );
});

self.addEventListener('push', (event) => {
    let payload = {};
    try {
        payload = event.data ? event.data.json() : {};
    } catch (_) {
        payload = {};
    }

    const title = payload.title || 'Regionaler Geschmack';
    const options = {
        body: payload.body || '',
        icon: payload.icon || DEFAULT_ICON,
        badge: payload.badge || DEFAULT_ICON,
        tag: payload.tag || 'rg-offer',
        data: { url: payload.url || '/' }
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = event.notification.data?.url || '/?view=map';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            for (const client of clients) {
                if ('focus' in client) {
                    client.postMessage({ type: 'OPEN_VIEW', url: targetUrl });
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(targetUrl);
            }
            return undefined;
        })
    );
});

self.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || data.type !== 'SHOW_NOTIFICATION') return;

    const { title, body, tag, url } = data;
    event.waitUntil(
        self.registration.showNotification(title || 'Regionaler Geschmack', {
            body: body || '',
            icon: DEFAULT_ICON,
            badge: DEFAULT_ICON,
            tag: tag || 'rg-offer',
            data: { url: url || '/?view=map' }
        })
    );
});
