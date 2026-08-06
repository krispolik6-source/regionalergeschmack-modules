import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const PWA_VERSION_RE = /export const PWA_VERSION = '(\d+)'/;

/** @param {string} root Repo root */
export function readPwaVersionFromModule(root) {
    const src = readFileSync(join(root, 'js/core/pwaVersion.js'), 'utf8');
    const m = src.match(PWA_VERSION_RE);
    if (!m) throw new Error('PWA_VERSION not found in js/core/pwaVersion.js');
    return m[1];
}

/** @param {string} root Repo root */
export function readPwaVersionFromGlobal(root) {
    const src = readFileSync(join(root, 'js/core/pwaVersion.global.js'), 'utf8');
    const m = src.match(/var PWA_VERSION = '(\d+)'/);
    if (!m) throw new Error('PWA_VERSION not found in js/core/pwaVersion.global.js');
    return m[1];
}

/** @param {string} root Repo root */
export function readPwaVersionFromSw(root) {
    const sw = readFileSync(join(root, 'sw.js'), 'utf8');
    if (!sw.includes("importScripts('/js/core/pwaVersion.global.js')")) {
        throw new Error('sw.js must importScripts pwaVersion.global.js');
    }
    if (/const PWA_VERSION\s*=/.test(sw)) {
        throw new Error('sw.js must not declare its own PWA_VERSION');
    }
    if (/CACHE_VERSION\s*=\s*`rg-pwa-v/.test(sw) || /IMAGE_CACHE\s*=\s*`rg-runtime-images-v/.test(sw)) {
        throw new Error('sw.js must use PWA_CACHE_NAME / PWA_IMAGE_CACHE_NAME from global bridge');
    }
    if (!sw.includes('CACHE_VERSION = PWA_CACHE_NAME') || !sw.includes('IMAGE_CACHE = PWA_IMAGE_CACHE_NAME')) {
        throw new Error('sw.js must assign CACHE_VERSION/IMAGE_CACHE from PWA_CACHE_NAME/PWA_IMAGE_CACHE_NAME');
    }
    return readPwaVersionFromGlobal(root);
}

/** @param {string} root Repo root */
export function readPwaCacheNamesFromGlobal(root) {
    const src = readFileSync(join(root, 'js/core/pwaVersion.global.js'), 'utf8');
    const shell = src.match(/var PWA_CACHE_NAME = '([^']+)'/);
    const images = src.match(/var PWA_IMAGE_CACHE_NAME = '([^']+)'/);
    if (!shell || !images) {
        throw new Error('PWA_CACHE_NAME / PWA_IMAGE_CACHE_NAME missing in pwaVersion.global.js — run npm run sync:pwa-version');
    }
    return { PWA_CACHE_NAME: shell[1], PWA_IMAGE_CACHE_NAME: images[1] };
}
