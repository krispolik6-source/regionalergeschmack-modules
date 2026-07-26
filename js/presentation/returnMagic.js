// js/presentation/returnMagic.js – ETAP 15E Magia powrotu (UX, lokalnie)
import { getCurrentUser } from '../auth/auth.js';
import { getUserHistory } from '../core/userHistory.js';
import { getLocalDayKey } from '../data/liveRegion.js';
import { getProducerById, getProducers } from '../data/dataService.js';
import { getContentProducerById, getContentProducers } from '../data/contentProducers.js';
import { featuredProducts } from '../data/products.js';
import { getProducerOpenStatus } from '../data/openingHours.js';
import { getProductAvailability } from './productAvailability.js';
import { isSeasonalProduct } from '../data/seasonCalendar.js';
import { getFavoriteIds } from '../core/favoritesStore.js';
import { getAdvisorFirstName } from './tasteAdvisor.js';
import { t, getCurrentLanguage } from '../core/i18n.js';

const LAST_VISIT_KEY = 'rg_return_magic_last_v1';
const SNAP_KEY = 'rg_return_magic_snap_v1';
const DAY_BRIEF_KEY = 'rg_return_magic_day_v1';
/** Absencja ≥ 2 dni → magia powrotu */
const MIN_AWAY_DAYS = 2;

function daysBetween(fromTs, toTs = Date.now()) {
    return Math.floor((Number(toTs) - Number(fromTs || toTs)) / 86400000);
}

function fill(template, vars) {
    return String(template || '').replace(/\{(\w+)\}/g, (_, key) => (
        vars[key] != null ? String(vars[key]) : `{${key}}`
    ));
}

function resolveProducer(id) {
    return getProducerById(id) || getContentProducerById(id) || null;
}

function isBakery(producer) {
    const c = String(producer?.category || producer?.type || '').toLowerCase();
    const name = String(producer?.name || '').toLowerCase();
    return /bakery|bäck|baeck|piekarn|пекар/.test(`${c} ${name}`);
}

function collectCatalogEntries() {
    /** @type {{ id: string, name: string, producerId: string, product: object }[]} */
    const list = [];
    for (const p of featuredProducts) {
        list.push({
            id: String(p.id),
            name: String(p.imageSlug || p.id),
            producerId: String(p.producerId || ''),
            product: p
        });
    }
    for (const producer of getContentProducers()) {
        for (const prod of producer.products || []) {
            list.push({
                id: String(prod.id),
                name: String(prod.name || prod.imageSlug || prod.id),
                producerId: String(producer.id),
                product: prod
            });
        }
    }
    return list;
}

function readSnap() {
    try {
        const raw = localStorage.getItem(SNAP_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data || !Array.isArray(data.ids)) return null;
        return data;
    } catch {
        return null;
    }
}

function writeSnap() {
    try {
        const ids = collectCatalogEntries().map((x) => x.id);
        localStorage.setItem(SNAP_KEY, JSON.stringify({
            at: Date.now(),
            day: getLocalDayKey(),
            ids
        }));
    } catch {
        /* ignore */
    }
}

function dayBriefStorageKey(lang = getCurrentLanguage()) {
    return `${DAY_BRIEF_KEY}:${lang}`;
}

function readDayBrief() {
    try {
        const raw = localStorage.getItem(dayBriefStorageKey());
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (
            data?.day === getLocalDayKey()
            && data?.lang === getCurrentLanguage()
            && Array.isArray(data.paragraphs)
        ) {
            return data;
        }
    } catch {
        /* ignore */
    }
    return null;
}

function writeDayBrief(payload) {
    try {
        localStorage.setItem(dayBriefStorageKey(), JSON.stringify({
            day: getLocalDayKey(),
            lang: getCurrentLanguage(),
            ...payload
        }));
        localStorage.removeItem(DAY_BRIEF_KEY);
    } catch {
        /* ignore */
    }
}

export function invalidateReturnMagicDayCache() {
    try {
        if (typeof localStorage === 'undefined') return;
        for (const key of Object.keys(localStorage)) {
            if (key === DAY_BRIEF_KEY || key.startsWith(`${DAY_BRIEF_KEY}:`)) {
                localStorage.removeItem(key);
            }
        }
    } catch {
        /* ignore */
    }
}

function getLastVisitTs() {
    try {
        const n = Number(localStorage.getItem(LAST_VISIT_KEY) || 0);
        return n > 0 ? n : 0;
    } catch {
        return 0;
    }
}

function setLastVisitNow() {
    try {
        localStorage.setItem(LAST_VISIT_KEY, String(Date.now()));
    } catch {
        /* ignore */
    }
}

/**
 * Pierwsza wizyta / brak absencji → zapisz baseline, bez magii.
 */
function ensureBaseline() {
    const last = getLastVisitTs();
    if (last) return last;
    setLastVisitNow();
    if (!readSnap()) writeSnap();
    return getLastVisitTs();
}

/**
 * Ile „nowych” produktów od ostatniej wizyty (snapshot) lub nowych dla Ciebie.
 * @param {number} daysAway
 */
export function countNewProductsSinceVisit(daysAway) {
    const catalog = collectCatalogEntries();
    const snap = readSnap();
    if (snap?.ids?.length) {
        const old = new Set(snap.ids.map(String));
        const added = catalog.filter((x) => !old.has(x.id));
        if (added.length) return Math.min(12, added.length);
    }

    const history = getUserHistory();
    const seen = new Set((history.products || []).map((x) => String(x.id)));
    const unseen = catalog.filter((x) => {
        if (seen.has(x.id)) return false;
        const avail = getProductAvailability(x.product);
        if (avail === 'soldout') return false;
        return isSeasonalProduct(x.product) || avail === 'available' || avail === 'low';
    });

    if (!unseen.length) return 0;
    const cap = Math.min(8, Math.max(1, Number(daysAway) + 1));
    return Math.min(unseen.length, cap);
}

/**
 * Ulubiona piekarnia, jeśli otwarta.
 */
export function findOpenFavoriteBakery() {
    const ids = getFavoriteIds();
    for (const id of ids) {
        const producer = resolveProducer(id);
        if (!producer || !isBakery(producer)) continue;
        const open = getProducerOpenStatus(producer);
        if (open.known && open.isOpen) {
            return producer;
        }
    }
    // Fallback: niedawno oglądana piekarnia
    const history = getUserHistory();
    for (const entry of [...(history.visited || []), ...(history.viewed || [])]) {
        const producer = resolveProducer(entry.id);
        if (!producer || !isBakery(producer)) continue;
        const open = getProducerOpenStatus(producer);
        if (open.known && open.isOpen) return producer;
    }
    return null;
}

/**
 * Produkt oglądany ~tydzień temu, nadal dostępny.
 */
export function findWeekAgoProductStillAvailable() {
    const history = getUserHistory();
    const now = Date.now();
    const weekAgo = now - 7 * 86400000;
    const windowMs = 5 * 86400000;

    const candidates = [...(history.products || [])]
        .map((entry) => {
            const at = Number(entry.at) || 0;
            if (!at) return null;
            const delta = Math.abs(at - weekAgo);
            if (delta > windowMs) return null;
            return { entry, at, delta };
        })
        .filter(Boolean)
        .sort((a, b) => a.delta - b.delta);

    const catalog = collectCatalogEntries();
    const byId = new Map(catalog.map((x) => [x.id, x]));

    for (const row of candidates) {
        const id = String(row.entry.id);
        let item = byId.get(id);
        if (!item) {
            // Szukaj po nazwie / slug w katalogu
            const blob = `${row.entry.name || ''} ${row.entry.id || ''}`.toLowerCase();
            item = catalog.find((x) => {
                const n = `${x.name} ${x.id} ${x.product?.imageSlug || ''}`.toLowerCase();
                return /apfel|apple|jabł|јабол|strawberr|truskaw|honig|honey|miód|brot|bread|chleb|käse|cheese|ser/.test(blob)
                    && (n.includes(blob.slice(0, 4)) || blob.split(/\s+/).some((w) => w.length > 3 && n.includes(w)));
            });
        }
        if (!item) continue;
        const avail = getProductAvailability(item.product);
        if (avail === 'soldout') continue;
        return {
            name: item.product?.name || item.name || row.entry.name || t('returnMagic.productFallback'),
            producerId: item.producerId,
            productId: item.id,
            label: shortenProductLabel(item.product?.name || item.name || row.entry.name)
        };
    }

    // Fallback: jabłka / owoc z historii producentów ~tydzień temu
    for (const entry of history.viewed || []) {
        const at = Number(entry.at) || 0;
        if (!at || Math.abs(at - weekAgo) > windowMs) continue;
        const producer = resolveProducer(entry.id);
        const product = (producer?.products || []).find((p) => {
            const blob = `${p.name || ''} ${p.imageSlug || ''}`.toLowerCase();
            return /apfel|apple|jabł|јабол|obst|fruit/.test(blob)
                && getProductAvailability(p) !== 'soldout';
        });
        if (product) {
            return {
                name: product.name,
                producerId: String(producer.id),
                productId: String(product.id),
                label: shortenProductLabel(product.name)
            };
        }
    }

    return null;
}

function shortenProductLabel(name) {
    const raw = String(name || '').trim();
    if (!raw) return t('returnMagic.productFallback');
    // Uprość do rzeczownika w narracji (jabłka, miód…)
    if (/apfel|apple|jabł|јабол/i.test(raw)) return t('returnMagic.productApples');
    if (/honig|honey|miód|мед/i.test(raw)) return t('returnMagic.productHoney');
    if (/brot|bread|chleb|леб/i.test(raw)) return t('returnMagic.productBread');
    if (/käse|cheese|ser|сирењ/i.test(raw)) return t('returnMagic.productCheese');
    if (/truskaw|strawberr|erdbeer|јагод/i.test(raw)) return t('returnMagic.productStrawberries');
    return raw.length > 28 ? `${raw.slice(0, 26)}…` : raw;
}

/**
 * Czy pokazać magię powrotu.
 */
export function isReturnMagicReady() {
    const last = ensureBaseline();
    const daysAway = daysBetween(last);
    if (daysAway < MIN_AWAY_DAYS) return false;
    const history = getUserHistory();
    const touches = (history.viewed || []).length
        + (history.visited || []).length
        + (history.products || []).length
        + getFavoriteIds().length;
    return touches >= 1;
}

/**
 * @returns {{ ready: boolean, paragraphs: string[], actions: object[], daysAway: number, firstName: string }}
 */
export function getReturnMagicBriefing() {
    // Cache dnia przed sprawdzeniem absencji (po pokazie last visit się odświeża)
    const cached = readDayBrief();
    if (cached?.paragraphs?.length) {
        return {
            ready: true,
            paragraphs: cached.paragraphs,
            actions: cached.actions || [],
            daysAway: cached.daysAway || 0,
            firstName: cached.firstName || ''
        };
    }

    ensureBaseline();

    if (!isReturnMagicReady()) {
        // Odśwież baseline przy krótkiej absencji (ten sam „pobyt”)
        const last = getLastVisitTs();
        if (last && daysBetween(last) < MIN_AWAY_DAYS) {
            try {
                const lastDay = getLocalDayKey(new Date(last));
                if (lastDay !== getLocalDayKey()) setLastVisitNow();
            } catch {
                /* ignore */
            }
        }
        return { ready: false, paragraphs: [], actions: [], daysAway: 0, firstName: '' };
    }

    const last = getLastVisitTs();
    const daysAway = daysBetween(last);
    const firstName = getAdvisorFirstName(getCurrentUser()?.displayName);
    const paragraphs = [];
    const actions = [];

    paragraphs.push(fill(
        t(firstName ? 'returnMagic.welcomeNamed' : 'returnMagic.welcome'),
        { name: firstName }
    ));

    const newCount = countNewProductsSinceVisit(daysAway);
    if (newCount >= 1) {
        paragraphs.push(fill(t('returnMagic.newProducts'), { count: String(newCount) }));
        actions.push({ type: 'explore', labelKey: 'returnMagic.ctaExplore' });
    }

    const bakery = findOpenFavoriteBakery();
    if (bakery) {
        paragraphs.push(fill(t('returnMagic.favoriteBakeryOpen'), {
            place: bakery.name || t('categories.bakeries.name')
        }));
        actions.push({
            type: 'producer',
            producerId: String(bakery.id),
            labelKey: 'returnMagic.ctaBakery'
        });
    }

    const weekProduct = findWeekAgoProductStillAvailable();
    if (weekProduct) {
        paragraphs.push(fill(t('returnMagic.stillAvailable'), {
            product: weekProduct.label
        }));
        if (weekProduct.producerId && !actions.some((a) => a.producerId === weekProduct.producerId)) {
            actions.push({
                type: 'producer',
                producerId: weekProduct.producerId,
                labelKey: 'returnMagic.ctaProduct'
            });
        }
    }

    // Gdy mało faktów – ciepłe domknięcie rozmowy
    if (paragraphs.length < 3) {
        paragraphs.push(fill(t('returnMagic.missedRegion'), {
            days: String(Math.max(2, daysAway))
        }));
    }

    const brief = {
        ready: true,
        firstName,
        daysAway,
        paragraphs: paragraphs.slice(0, 4),
        actions: actions.slice(0, 3)
    };

    writeDayBrief(brief);
    setLastVisitNow();
    writeSnap();

    // Lekki touch lokalnej puli (bez requestów) – tylko żeby resolveProducer miał dane
    try {
        getProducers();
    } catch {
        /* ignore */
    }

    return brief;
}

export default {
    isReturnMagicReady,
    getReturnMagicBriefing,
    countNewProductsSinceVisit,
    findOpenFavoriteBakery,
    findWeekAgoProductStillAvailable
};
