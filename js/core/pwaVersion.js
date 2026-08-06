/**
 * Jedyna kanoniczna wersja PWA (cache, ikony, SW, manifest, legacy bundle).
 * Bump: zmień PWA_VERSION → npm run sync:pwa-version
 */
export const PWA_VERSION = '30';

export const PWA_CACHE_NAME = `rg-pwa-v${PWA_VERSION}`;
export const PWA_IMAGE_CACHE_NAME = `rg-runtime-images-v${PWA_VERSION}`;

/** Cache names Memory Cleaner must never delete. */
export const PWA_CACHE_PREFIX_KEEP = [PWA_CACHE_NAME, PWA_IMAGE_CACHE_NAME];

/** @param {string} path Absolute or root-relative asset path (no query). */
export function pwaAssetUrl(path) {
    const base = String(path || '').split('?')[0];
    return `${base}?v=${PWA_VERSION}`;
}
