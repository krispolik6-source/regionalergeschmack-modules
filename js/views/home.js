// views/home.js · ekran główny (Etap 2 UI, logika bez zmian)

import { eventBus } from '../core/eventBus.js';
import { EVENTS } from '../core/events.js';
import { t, formatCurrency } from '../core/i18n.js';
import {
    getProducers,
    getProducerById,
    countProducersByHomeCategory,
    filterProducersByCategory,
    getProducersInRadius,
    loadAllData,
    isProducersEmptyArea,
    isProducersLoadSettled
} from '../data/dataService.js';
import { getDistanceKm, normalizeProducerCategory } from '../data/producerHelpers.js';
import { getContentProducerById } from '../data/contentProducers.js';
import {
    featuredProducts,
    getFeaturedProductName,
    getFeaturedProducerName
} from '../data/products.js';
import { getRecipes, getRecipeImageUrl } from '../data/recipes.js';
import { getReviews, getAverageRating, formatRatingStars } from '../data/reviews.js';
import { CATEGORY_ICONS } from '../presentation/categoryIcons.js';
import { buildCategoryImageStyle, getCategoryImage } from '../presentation/categoryImages.js?v=8';
import { resolveProducerChain, buildChainLogoHtml, buildProducerLogoHtml, getFastFoodImage } from '../presentation/chainBrands.js';
import { buildProductImageHtml } from '../presentation/productImage.js';
import { buildOpenStatusHtml } from '../presentation/producerDisplay.js';
import { getLastPosition } from '../core/userLocation.js';
import { openProducerModal, initProducerModal } from './producerModal.js?v=7';
import { addFavorite, removeFavorite, isFavorite, refreshFavoritesBadge, getFavoritesCount } from './favorites.js';
import { addToCart, refreshCartBadge } from './cart.js';
import { searchGlobalResults, buildSearchResultCardHtml, formatSearchNoResults, SEARCH_RESULTS_LIMIT, limitSearchDisplayItems, formatSearchResultsOverflow } from '../presentation/searchFilter.js?v=4';
import { isPremiumActive, isProducerPromoted } from '../core/premiumService.js';
import { CONFIG } from '../config.js';
import { formatDistanceLabel, formatEtaLabels } from '../presentation/geoFormat.js';
import { rankProducersSmart } from '../presentation/smartRecommend.js';
import { getSeasonalDemoItems, getCurrentSeason } from '../data/seasonCalendar.js';
import { getTodayLiveRegionItems } from '../data/liveRegion.js';
import { getTodayNatureMoments } from '../data/natureCalendar.js';
import { getTodayRegionStory } from '../data/regionStories.js';
import {
    getSmartTodayRecommendations,
    getSmartTodayCandidateById,
    refreshSmartTodayWeather
} from '../presentation/smartToday.js';
import { getTasteAdvisorBriefing } from '../presentation/tasteAdvisor.js';
import { getLivingRegionPulse, livingPulseCategory } from '../presentation/livingRegion.js';
import {
    isLivingRegionEnabled,
    getTodayHighlights
} from '../livingRegion/livingRegion.js';
import { getTastesOfDay } from '../presentation/tastesOfDay.js';
import { getReturnMagicBriefing } from '../presentation/returnMagic.js';
import { getRegionSoulNarration } from '../presentation/regionSoul.js';
import { getRegionalIntelligence } from '../presentation/regionalIntelligence.js';
import {
    isAmbientNatureEnabled,
    setAmbientNatureEnabled
} from '../presentation/climateAtmosphere.js';
import { getRecentlyViewedIds, trackSearchQuery } from '../core/userHistory.js';
import { scheduleSelfHealingMaintenance } from '../core/selfHealingLogger.js';
import { getProducerOpenStatus } from '../data/openingHours.js';
import { getProducerTrustLevel } from '../presentation/producerTrust.js';
import {
    buildHomeAdBannersHtml,
    startHomeAdRotation,
    stopHomeAdRotation,
    buildVenueCardsWithSponsoredHtml,
    handleNativeAdClick
} from '../presentation/nativeAds.js?v=3';
import { buildHomeAdSenseHtml, mountHomeAdSense, teardownHomeAdSense } from '../presentation/adsense.js';
import { showToast } from '../core/toast.js';
import { pickSurpriseProducer, formatSurpriseMessage } from '../presentation/surpriseMe.js';

const SEARCH_DEBOUNCE_MS = 280;
/** Timer wyszukiwania · modułowy, żeby remount nie zostawiał orphan timeout */
let homeSearchDebounceTimer = null;
const NEARBY_LIMIT = 5;
const VENUE_SECTION_LIMIT = 8;

/** Biała ikona głośnika – Premium Audio Button (SVG, nie emoji). */
const HOME_AMBIENT_SPEAKER_SVG = '<svg class="home-ambient-toggle-icon" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';

/** Zdjęcie karty rekomendacji — tylko warstwa prezentacji (bez zmiany inteligencji). */
const REGION_REC_PHOTO_OVERRIDES = {
    visitApiary: 'honey',
    eveningApiary: 'honey',
    honeyFlowPeak: 'honey',
    honeyMeadow: 'honey',
    orchardWalk: 'orchard',
    orchardFirstApples: 'orchard',
    firstApples: 'orchard',
    firstPlums: 'orchard',
    summerBerries: 'orchard',
    springBlossomWalk: 'orchard',
    hotOrchardShade: 'orchard',
    berryRipening: 'orchard'
};

function regionRecPhotoKey(category, tipId) {
    if (tipId && REGION_REC_PHOTO_OVERRIDES[tipId]) return REGION_REC_PHOTO_OVERRIDES[tipId];
    return category || 'farmers';
}
const MAP_PREFS_KEY = 'rg_map_prefs_v1';
const RADIUS_MIN = Number(CONFIG.minRadius) || 1;
const RADIUS_MAX = Number(CONFIG.maxRadius) || 50;
const RADIUS_DEFAULT = Number(CONFIG.defaultRadius) || 10;

function clampMapRadius(km) {
    const value = Number(km);
    if (!Number.isFinite(value)) return RADIUS_DEFAULT;
    return Math.min(RADIUS_MAX, Math.max(RADIUS_MIN, Math.round(value)));
}

function readMapPrefs() {
    if (typeof localStorage === 'undefined') return {};
    try {
        const raw = localStorage.getItem(MAP_PREFS_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

/** Ten sam środek i promień co mapa (rg_map_prefs_v1 + fallback GPS). */
function resolveHomeMapScope() {
    const prefs = readMapPrefs();
    const radiusKm = clampMapRadius(prefs.radiusKm ?? RADIUS_DEFAULT);
    const prefLat = Number(prefs.mapLat);
    const prefLng = Number(prefs.mapLng);
    if (Number.isFinite(prefLat) && Number.isFinite(prefLng)) {
        return { center: { lat: prefLat, lng: prefLng }, radiusKm };
    }
    const user = getLastPosition();
    if (user && Number.isFinite(Number(user.lat)) && Number.isFinite(Number(user.lng))) {
        return { center: { lat: Number(user.lat), lng: Number(user.lng) }, radiusKm };
    }
    return { center: null, radiusKm };
}

/** Producenci wyłącznie w okręgu mapy — bez fallbacku poza promień. */
function getMapAreaPool(sourceProducers) {
    const { center, radiusKm } = resolveHomeMapScope();
    if (!center) return [];
    return getProducersInRadius(sourceProducers, radiusKm, center);
}

function buildEmptySectionHtml() {
    return `<div class="empty-state home-empty-producers" role="status">
        <p class="home-no-data">${escapeHtml(t('msg.noProducersNearby'))}</p>
    </div>`;
}

/** Pusty stan tylko po zakończeniu pobrania OSM – nie podczas initial seed. */
function shouldShowProducersEmptyState(producers) {
    if (producers?.length) return false;
    if (isProducersEmptyArea()) return true;
    return isProducersLoadSettled();
}

function ensureHomeProducersLoaded() {
    const { center, radiusKm } = resolveHomeMapScope();
    if (!center) return;
    loadAllData(center.lat, center.lng, { radiusKm }).catch(() => {});
}

/** Siatka 2×4 · bez „Wszystkie” */
/** Kanoniczna siatka Home — bez duplikatów (honey/dairy itd. → farmers). */
const CATEGORY_IDS = Object.freeze([
    'farmers', 'bakeries', 'meat', 'shops', 'restaurants', 'fastFood', 'vending', 'favorites'
]);
const CATEGORY_ID_SET = new Set(CATEGORY_IDS);

function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatPrice(value) {
    return `${Number(value || 0).toFixed(2)} €`;
}

function formatDistanceEtaHtml(km) {
    if (!Number.isFinite(km)) return '';
    const dist = formatDistanceLabel(km);
    const eta = formatEtaLabels(km);
    return `<span class="home-product-distance" data-distance-km="${km.toFixed(4)}">${escapeHtml(dist)} · ${escapeHtml(eta.compact)}</span>`;
}

/** Przestawia karty w karuzeli bez przebudowy HTML (anty-miganie). */
function softReorderVenueCarousel(carousel, producers) {
    if (!carousel || !producers?.length) return false;
    const cards = [...carousel.querySelectorAll('.home-venue-card[data-producer-id]')];
    if (!cards.length || cards.length !== producers.length) return false;
    const byId = new Map(cards.map((card) => [String(card.dataset.producerId), card]));
    if (producers.some((p) => !byId.get(String(p.id)))) return false;

    const frag = document.createDocumentFragment();
    for (const producer of producers) {
        const card = byId.get(String(producer.id));
        const distEl = card.querySelector('[data-distance-km]');
        const km = resolveProducerDistanceKm(producer);
        if (distEl && Number.isFinite(km)) {
            const eta = formatEtaLabels(km);
            distEl.dataset.distanceKm = km.toFixed(4);
            distEl.textContent = `${formatDistanceLabel(km)} · ${eta.compact}`;
        }
        frag.appendChild(card);
    }
    carousel.appendChild(frag);
    return true;
}

function softRefreshVenueOrder(container) {
    const sections = [
        ['nearby', () => getRecommendedNearby(NEARBY_LIMIT)],
        ['foryou', () => getForYouProducers(NEARBY_LIMIT)],
        ['restaurants', () => getNearbyByHomeCategory('restaurants', VENUE_SECTION_LIMIT)],
        ['fastFood', () => getNearbyByHomeCategory('fastFood', VENUE_SECTION_LIMIT)],
        ['recent', () => getRecentlyViewedProducers(6)]
    ];
    for (const [key, getList] of sections) {
        const el = container.querySelector(`[data-carousel="${key}"]`);
        if (el) softReorderVenueCarousel(el, getList());
    }
    patchLiveDistances(container);
}

function getUserLocation() {
    return getLastPosition();
}

function resolveProducerDistanceKm(producer) {
    const user = getUserLocation();
    const pLat = Number(producer?.lat);
    const pLng = Number(producer?.lng);
    if (user && Number.isFinite(pLat) && Number.isFinite(pLng)) {
        return getDistanceKm(user.lat, user.lng, pLat, pLng);
    }
    return null;
}

function sortByDistance(producers) {
    return [...producers].sort((a, b) => {
        const da = resolveProducerDistanceKm(a);
        const db = resolveProducerDistanceKm(b);
        if (da == null && db == null) return String(a.name || '').localeCompare(String(b.name || ''));
        if (da == null) return 1;
        if (db == null) return -1;
        return da - db;
    });
}

function getNearbyByHomeCategory(homeCategoryId, limit = VENUE_SECTION_LIMIT) {
    const filtered = filterProducersByCategory(getProducers(), homeCategoryId);
    const pool = getMapAreaPool(filtered);
    return sortByDistance(pool).slice(0, limit);
}

function getRecommendedNearby(limit = NEARBY_LIMIT) {
    const user = getUserLocation();
    const all = getProducers().filter((p) => p && p.category !== 'other');
    const pool = getMapAreaPool(all);
    if (!pool.length) return [];
    return rankProducersSmart(pool, limit, user);
}

function getForYouProducers(limit = NEARBY_LIMIT) {
    // ETAP 18B · silniejsze wagi lokalnego uczenia dla sekcji „Dla Ciebie”
    const user = getUserLocation();
    const all = getProducers().filter((p) => p && p.category !== 'other');
    const pool = getMapAreaPool(all);
    if (!pool.length) return [];
    return rankProducersSmart(pool, limit, user, { learningWeight: 1.85 });
}

function getRecentlyViewedProducers(limit = 6) {
    const poolIds = new Set(getMapAreaPool(getProducers()).map((p) => String(p.id)));
    const ids = getRecentlyViewedIds(limit * 3);
    return ids
        .map((id) => getProducerById(id))
        .filter((p) => p && poolIds.has(String(p.id)))
        .slice(0, limit);
}

function getFeaturedProductsInMapArea() {
    const poolIds = new Set(getMapAreaPool(getProducers()).map((p) => String(p.id)));
    return featuredProducts.filter((p) => poolIds.has(String(p.producerId)));
}

function seasonalLabel(item) {
    const key = `seasonal.${item.id}`;
    const translated = t(key);
    return translated === key ? (item.name || item.nameEn || item.nameDe || item.id) : translated;
}

function buildSeasonalSectionHtml() {
    const season = getCurrentSeason();
    const items = getSeasonalDemoItems(season);
    return `
        <section class="home-seasonal app-section" aria-label="${escapeHtml(t('home.seasonalTitle'))}">
            ${buildSectionHeader(`🌿 ${t('home.seasonalTitle')}`, null)}
            <div class="home-carousel home-carousel--seasonal" data-carousel="seasonal">
                ${items.map((item) => {
                    const label = seasonalLabel(item);
                    return `
                    <button type="button" class="home-seasonal-card card" data-seasonal-query="${escapeHtml(label)}" aria-label="${escapeHtml(label)}">
                        <span class="home-seasonal-icon" aria-hidden="true">${item.icon}</span>
                        <strong class="home-seasonal-name">${escapeHtml(label)}</strong>
                    </button>
                `;
                }).join('')}
            </div>
        </section>
    `;
}

function smartTodayProductName(product) {
    const featuredName = getFeaturedProductName(product, t);
    if (featuredName && featuredName !== product.id) return featuredName;
    const key = `smartToday.product.${product.imageSlug}`;
    const translated = t(key);
    if (translated !== key) return translated;
    return product.imageSlug || product.id;
}

function buildSmartTodayProductCardsHtml(products) {
    return (products || []).map((product) => {
        const rawName = smartTodayProductName(product);
        const name = escapeHtml(rawName);
        const producerLabel = buildProducerLabel(product);
        const ratingHtml = buildRatingHtml(product);
        const priceLabel = `${formatPrice(product.price)}${product.unit ? ` / ${escapeHtml(product.unit)}` : ''}`;
        const imageHtml = buildProductImageHtml(product.imageUrl, t, {
            className: 'home-product-card-photo',
            alt: rawName,
            name: rawName,
            imageSlug: product.imageSlug,
            category: product.category || product.categoryKey,
            isSample: true
        });

        return `
        <article class="home-product-card home-product-card--compact home-product-card-open" data-product-id="${escapeHtml(product.id)}" data-producer-id="${escapeHtml(product.producerId)}" tabindex="0" role="button" aria-label="${name}">
            <div class="home-product-card-media">
                <div class="home-product-image">
                    ${imageHtml}
                </div>
            </div>
            <div class="home-product-card-body">
                <h3 class="home-product-name">${name}</h3>
                <p class="home-product-producer">${producerLabel}</p>
                ${buildProductMetaHtml(product)}
                ${ratingHtml}
                <p class="home-product-price"><span aria-hidden="true">💶</span> ${priceLabel}</p>
                <div class="home-product-actions">
                    ${buildFavoriteBtnHtml(product.producerId)}
                    ${buildCartBtnHtml(product)}
                </div>
            </div>
        </article>
    `;
    }).join('');
}

/** ETAP 14 · osobisty doradca smaku */
function buildTasteAdvisorSectionHtml() {
    const brief = getTasteAdvisorBriefing();
    if (!brief?.ready || !brief.paragraphs?.length) return '';

    const actionsHtml = (brief.actions || []).map((action) => {
        const label = escapeHtml(t(action.labelKey));
        if (action.type === 'producer') {
            return `<button type="button" class="btn-primary" data-taste-advisor-producer="${escapeHtml(action.producerId)}">${label}</button>`;
        }
        if (action.type === 'mapFarms') {
            const ids = (action.producerIds || []).join(',');
            return `<button type="button" class="btn-primary" data-taste-advisor-route="${escapeHtml(ids)}">${label}</button>`;
        }
        return `<button type="button" class="btn-secondary" data-taste-advisor-explore="1">${label}</button>`;
    }).join('');

    return `
        <section class="home-taste-advisor app-section" aria-labelledby="homeTasteAdvisorHeading" data-home-section="taste-advisor">
            <div class="home-taste-advisor-inner">
                <p class="home-taste-advisor-label" id="homeTasteAdvisorHeading">${escapeHtml(t('home.tasteAdvisorTitle'))}</p>
                <p class="home-taste-advisor-sub">${escapeHtml(t('home.tasteAdvisorSub'))}</p>
                <div class="home-taste-advisor-text">
                    ${brief.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}
                </div>
                ${actionsHtml ? `<div class="home-taste-advisor-actions">${actionsHtml}</div>` : ''}
            </div>
        </section>
    `;
}

/** ETAP 13C · inteligentne polecenia */
function buildSmartTodaySectionHtml() {
    const { reason, products } = getSmartTodayRecommendations({ limit: 4 });
    if (!products.length) return '';
    const reasonText = t(`smartToday.reason.${reason.id}`);

    return `
        <section class="home-smart-today app-section" aria-labelledby="homeSmartTodayHeading" data-home-section="smart-today">
            <div class="home-smart-today-head">
                <h3 class="section-title" id="homeSmartTodayHeading">${escapeHtml(t('home.smartTodayTitle'))}</h3>
                <p class="home-smart-today-sub">${escapeHtml(t('home.smartTodaySub'))}</p>
            </div>
            <p class="home-smart-today-reason">
                <span class="home-smart-today-reason-icon" aria-hidden="true">${reason.icon}</span>
                <span class="home-smart-today-reason-text">${escapeHtml(reasonText)}</span>
            </p>
            <div class="home-carousel home-carousel--products" data-carousel="smart-today">
                ${buildSmartTodayProductCardsHtml(products)}
            </div>
        </section>
    `;
}

/** ETAP 13D · jedna krótka historia / dzień */
function buildRegionStorySectionHtml() {
    const story = getTodayRegionStory();
    if (!story) return '';
    const text = t(`regionStory.${story.id}`);
    if (!text || text === `regionStory.${story.id}`) return '';

    return `
        <section class="home-region-story app-section" aria-labelledby="homeRegionStoryHeading">
            <div class="home-region-story-inner">
                <p class="home-region-story-label" id="homeRegionStoryHeading">${escapeHtml(t('home.regionStoryTitle'))}</p>
                <p class="home-region-story-sub">${escapeHtml(t('home.regionStorySub'))}</p>
                <div class="home-region-story-body">
                    <span class="home-region-story-icon" aria-hidden="true">${story.icon}</span>
                    <p class="home-region-story-text">${escapeHtml(text)}</p>
                </div>
            </div>
        </section>
    `;
}

/** ETAP 13B · elegancki etap roku (1–2 wpisy) */
function buildNatureCalendarSectionHtml() {
    const moments = getTodayNatureMoments();
    if (!moments.length) return '';

    return `
        <section class="home-nature-calendar app-section" aria-labelledby="homeNatureCalendarHeading">
            <div class="home-nature-calendar-inner">
                <p class="home-nature-calendar-label" id="homeNatureCalendarHeading">${escapeHtml(t('home.natureCalendarTitle'))}</p>
                <p class="home-nature-calendar-sub">${escapeHtml(t('home.natureCalendarSub'))}</p>
                <ul class="home-nature-calendar-list" role="list">
                    ${moments.map((item) => {
                        const text = t(`natureCalendar.${item.id}`);
                        return `
                        <li class="home-nature-moment">
                            <span class="home-nature-moment-icon" aria-hidden="true">${item.icon}</span>
                            <span class="home-nature-moment-text">${escapeHtml(text)}</span>
                        </li>
                    `;
                    }).join('')}
                </ul>
            </div>
        </section>
    `;
}

/** ETAP 29B — Regional Intelligence (jedna rekomendacja gospodarza; nie chatbot) */
function buildRegionalIntelligenceHtml() {
    const intel = getRegionalIntelligence();
    const rec = intel?.recommendation;
    if (!rec?.headline) {
        // fallback: ETAP 16 Region Soul (nadal jedna linia)
        const soul = getRegionSoulNarration();
        if (!soul?.text) return '';
        return `
        <div class="home-region-soul" data-home-section="region-soul" data-region-rec-photo="${escapeHtml(regionRecPhotoKey(soul.category, soul.id))}">
            <button type="button" class="home-region-soul-btn" data-region-soul-category="${escapeHtml(soul.category)}" aria-label="${escapeHtml(soul.text)}">
                <span class="home-region-soul-icon" aria-hidden="true">${soul.icon}</span>
                <span class="home-region-soul-body">
                    <span class="home-region-soul-label">${escapeHtml(t('home.regionSoulLabel'))}</span>
                    <span class="home-region-soul-line">${escapeHtml(soul.text)}</span>
                </span>
            </button>
        </div>
    `;
    }

    const aria = rec.support ? `${rec.headline} ${rec.support}` : rec.headline;
    return `
        <div class="home-region-soul home-regional-intel" data-home-section="regional-intelligence" data-region-rec-photo="${escapeHtml(regionRecPhotoKey(rec.category, rec.id))}">
            <button type="button" class="home-region-soul-btn" data-region-soul-category="${escapeHtml(rec.category)}" aria-label="${escapeHtml(aria)}">
                <span class="home-region-soul-icon" aria-hidden="true">${rec.icon}</span>
                <span class="home-region-soul-body">
                    <span class="home-region-soul-label">${escapeHtml(t('home.regionalIntelLabel'))}</span>
                    <span class="home-region-soul-line">${escapeHtml(rec.headline)}</span>
                    ${rec.support ? `<span class="home-regional-intel-support">${escapeHtml(rec.support)}</span>` : ''}
                </span>
            </button>
        </div>
    `;
}

/** ETAP 15E · Magia powrotu (rozmowa po absencji) */
function buildReturnMagicSectionHtml() {
    const brief = getReturnMagicBriefing();
    if (!brief?.ready || !brief.paragraphs?.length) return '';

    const actionsHtml = (brief.actions || []).map((action) => {
        const label = escapeHtml(t(action.labelKey));
        if (action.type === 'producer') {
            return `<button type="button" class="btn-primary" data-return-magic-producer="${escapeHtml(action.producerId)}">${label}</button>`;
        }
        return `<button type="button" class="btn-secondary" data-return-magic-explore="1">${label}</button>`;
    }).join('');

    return `
        <section class="home-return-magic app-section" aria-labelledby="homeReturnMagicHeading" data-home-section="return-magic">
            <div class="home-return-magic-inner">
                <p class="home-return-magic-label" id="homeReturnMagicHeading">${escapeHtml(t('home.returnMagicTitle'))}</p>
                <p class="home-return-magic-sub">${escapeHtml(t('home.returnMagicSub'))}</p>
                <div class="home-return-magic-text">
                    ${brief.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}
                </div>
                ${actionsHtml ? `<div class="home-return-magic-actions">${actionsHtml}</div>` : ''}
            </div>
        </section>
    `;
}

/** ETAP 15B · Smaki dnia (rekomendacje produktowe) */
function buildTastesOfDaySectionHtml() {
    const { items } = getTastesOfDay({ limit: 3 });
    if (!items.length) return '';

    return `
        <section class="home-tastes-of-day app-section" aria-labelledby="homeTastesOfDayHeading" data-home-section="tastes-of-day">
            <div class="home-tastes-of-day-head">
                <p class="home-tastes-of-day-label" id="homeTastesOfDayHeading">${escapeHtml(t('home.tastesOfDayTitle'))}</p>
                <p class="home-tastes-of-day-sub">${escapeHtml(t('home.tastesOfDaySub'))}</p>
            </div>
            <ul class="home-tastes-of-day-list" role="list">
                ${items.map((item) => {
                    const text = t(`tastesOfDay.${item.narrativeId}`);
                    const place = getFeaturedProducerName(item.product);
                    const openHint = item.open ? ` · ${t('home.statusOpen')}` : '';
                    const meta = place
                        ? `<span class="home-tastes-of-day-meta">${escapeHtml(place)}${item.open ? `<span class="home-tastes-of-day-open">${escapeHtml(openHint)}</span>` : ''}</span>`
                        : '';
                    return `
                    <li>
                        <button type="button" class="home-tastes-of-day-item" data-tastes-producer="${escapeHtml(item.producerId)}" data-tastes-narrative="${escapeHtml(item.narrativeId)}" aria-label="${escapeHtml(text)}">
                            <span class="home-tastes-of-day-icon" aria-hidden="true">${item.icon}</span>
                            <span class="home-tastes-of-day-body">
                                <span class="home-tastes-of-day-text">${escapeHtml(text)}</span>
                                ${meta}
                            </span>
                        </button>
                    </li>
                `;
                }).join('')}
            </ul>
        </section>
    `;
}

/** Mapowanie kategorii producenta → filtr Home (bez zmian UI). */
function livingRegionHomeCategory(producerOrCat) {
    const raw = typeof producerOrCat === 'string'
        ? producerOrCat
        : producerOrCat?.category || producerOrCat?.type || '';
    const cat = normalizeProducerCategory(raw);
    const map = {
        bakery: 'bakeries',
        farmer: 'farmers',
        restaurant: 'restaurants',
        fast_food: 'fastFood',
        meat: 'meat',
        shop: 'shops',
        vending: 'vending'
    };
    return map[cat] || 'farmers';
}

/**
 * Living Region Engine → pozycje listy w istniejącym markupu.
 * @returns {Array<{ id: string, text: string, category: string, producerId?: string }>}
 */
function mapEngineHighlightsToListItems(highlights) {
    const items = [];
    for (const h of highlights || []) {
        const kind = h.kind;
        const p = h.payload || {};
        let text = '';
        let category = 'farmers';
        let producerId = '';

        if (kind === 'producerOfDay' && p.producerId) {
            const prod = getProducerById(p.producerId);
            const name = prod?.name || t('livingRegion.engineFallbackName');
            text = t('livingRegion.engineProducerOfDay').replace('{name}', name);
            category = livingRegionHomeCategory(prod);
            producerId = String(p.producerId);
        } else if (kind === 'seasonal') {
            const names = (p.items || [])
                .map((x) => x.nameDe || x.nameEn || x.name)
                .filter(Boolean)
                .slice(0, 3)
                .join(', ');
            if (!names && !(p.productRefs || []).length) continue;
            text = t('livingRegion.engineSeasonal').replace(
                '{names}',
                names || String((p.productRefs || []).length)
            );
            const firstRef = (p.productRefs || [])[0];
            if (firstRef?.producerId) {
                producerId = String(firstRef.producerId);
                category = livingRegionHomeCategory(getProducerById(producerId));
            } else {
                category = 'farmers';
            }
        } else if (kind === 'newProducers') {
            const nProd = (p.producerIds || []).length;
            const nGoods = (p.productRefs || []).length;
            if (nProd > 0) {
                text = t('livingRegion.engineNewProducers').replace('{count}', String(nProd));
                producerId = String(p.producerIds[0] || '');
                const first = producerId ? getProducerById(producerId) : null;
                category = livingRegionHomeCategory(first);
            } else if (nGoods > 0) {
                text = t('livingRegion.engineNewProducts').replace('{count}', String(nGoods));
                producerId = String(p.productRefs[0]?.producerId || '');
                category = livingRegionHomeCategory(getProducerById(producerId));
            } else {
                continue;
            }
        } else if (kind === 'openNow') {
            const ids = p.producerIds || [];
            if (!ids.length) continue;
            text = t('livingRegion.engineOpenNow').replace('{count}', String(ids.length));
            producerId = String(ids[0]);
            category = livingRegionHomeCategory(getProducerById(producerId));
        } else if (kind === 'visitDelta') {
            const parts = [];
            if ((p.newProducerIds || []).length) {
                parts.push(
                    t('livingRegion.engineVisitDeltaProducers').replace(
                        '{count}',
                        String(p.newProducerIds.length)
                    )
                );
            }
            if ((p.newPromoProducerIds || []).length) {
                parts.push(
                    t('livingRegion.engineVisitDeltaPromos').replace(
                        '{count}',
                        String(p.newPromoProducerIds.length)
                    )
                );
            }
            if (!parts.length) continue;
            text = t('livingRegion.engineVisitDelta').replace('{summary}', parts.join(', '));
            producerId = String(p.newProducerIds?.[0] || p.newPromoProducerIds?.[0] || '');
            if (producerId) category = livingRegionHomeCategory(getProducerById(producerId));
        } else {
            continue;
        }

        if (!text) continue;
        items.push({
            id: h.id || kind,
            text,
            category,
            producerId: producerId || undefined
        });
    }
    return items;
}

/** Lista Living Region: Engine (gdy ON) albo stary pulse (gdy OFF / brak danych). */
function getLivingRegionListItems() {
    if (isLivingRegionEnabled()) {
        try {
            const pack = getTodayHighlights();
            if (pack?.enabled && pack.items?.length) {
                const mapped = mapEngineHighlightsToListItems(pack.items);
                if (mapped.length) return mapped;
            }
        } catch {
            /* fallback do starego systemu */
        }
    }

    const pulse = getLivingRegionPulse();
    if (!pulse?.items?.length) return [];
    return pulse.items.map((item) => ({
        id: item.id,
        text: t(`livingRegion.${item.id}`),
        category: livingPulseCategory(item)
    }));
}

/** ETAP 15A · Living Region — istniejąca sekcja (Engine lub stary pulse) */
function buildLivingRegionSectionHtml() {
    const listItems = getLivingRegionListItems();
    if (!listItems.length) return '';

    return `
        <section class="home-living-region app-section" aria-labelledby="homeLivingRegionHeading" data-home-section="living-region">
            <div class="home-living-region-inner">
                <p class="home-living-region-label" id="homeLivingRegionHeading">${escapeHtml(t('home.livingRegionTitle'))}</p>
                <p class="home-living-region-sub">${escapeHtml(t('home.livingRegionSub'))}</p>
                <ul class="home-living-region-list" role="list">
                    ${listItems.map((item) => {
                        const producerAttr = item.producerId
                            ? ` data-living-region-producer="${escapeHtml(item.producerId)}"`
                            : '';
                        return `
                        <li>
                            <button type="button" class="home-living-region-item" data-living-region-id="${escapeHtml(item.id)}" data-living-region-category="${escapeHtml(item.category)}"${producerAttr} aria-label="${escapeHtml(item.text)}">
                                <span class="home-living-region-text">${escapeHtml(item.text)}</span>
                            </button>
                        </li>
                    `;
                    }).join('')}
                </ul>
            </div>
        </section>
    `;
}

/** ETAP 13A · wieści społecznościowe (nie reklama) */
function buildLiveRegionSectionHtml() {
    const items = getTodayLiveRegionItems();
    if (!items.length) return '';

    return `
        <section class="home-live-region app-section" aria-labelledby="homeLiveRegionHeading">
            <div class="home-live-region-head">
                <h3 class="section-title" id="homeLiveRegionHeading">${escapeHtml(t('home.liveRegionTitle'))}</h3>
                <p class="home-live-region-sub">${escapeHtml(t('home.liveRegionSub'))}</p>
            </div>
            <ul class="home-live-region-list" role="list">
                ${items.map((item) => {
                    const text = t(`liveRegion.${item.id}`);
                    const catLabel = t(`categories.${item.category}.name`);
                    return `
                    <li>
                        <button type="button" class="home-live-region-item" data-live-region-id="${escapeHtml(item.id)}" data-live-region-category="${escapeHtml(item.category)}" aria-label="${escapeHtml(text)}">
                            <span class="home-live-region-icon" aria-hidden="true">${item.icon}</span>
                            <span class="home-live-region-body">
                                <span class="home-live-region-text">${escapeHtml(text)}</span>
                                <span class="home-live-region-meta">${escapeHtml(catLabel)}</span>
                            </span>
                        </button>
                    </li>
                `;
                }).join('')}
            </ul>
        </section>
    `;
}

function buildQuickFiltersHtml() {
    // Bez duplikatów kategorii (pełna siatka jest poniżej) — tylko filtry jakościowe
    const chips = [
        { id: 'open', label: t('home.quickOpen'), icon: '🟢' },
        { id: 'verified', label: t('home.quickVerified'), icon: '✅' },
        { id: 'near5', label: t('home.quickNear5'), icon: '📍' },
        { id: 'bio', label: t('home.quickBio'), icon: '🌿' }
    ];
    return `
        <section class="home-quick-filters app-section" aria-label="${escapeHtml(t('home.quickFilters'))}">
            <div class="home-quick-filters-row" role="toolbar">
                ${chips.map((chip) => `
                    <button type="button" class="home-quick-chip" data-quick-filter="${escapeHtml(chip.id)}">
                        <span aria-hidden="true">${chip.icon}</span> ${escapeHtml(chip.label)}
                    </button>
                `).join('')}
            </div>
        </section>
    `;
}

function applyQuickFilter(filterId) {
    const user = getUserLocation();
    let pool = getMapAreaPool(getProducers().filter((p) => p && p.category !== 'other'));

    if (filterId === 'open') {
        pool = pool.filter((p) => {
            const s = getProducerOpenStatus(p);
            return s.known && s.isOpen;
        });
    } else if (filterId === 'verified') {
        pool = pool.filter((p) => {
            const trust = getProducerTrustLevel(p);
            return trust === 'verified' || trust === 'confirmed';
        });
    } else if (filterId === 'near5') {
        const { center } = resolveHomeMapScope();
        if (center) pool = getProducersInRadius(pool, 5, center);
    } else if (filterId === 'bio') {
        pool = pool.filter((p) => /bio|organic|ökologisch|eko/i.test([
            p.name, p.description, ...(p.products || []).map((x) => x.name)
        ].filter(Boolean).join(' ')));
    }

    const ranked = rankProducersSmart(pool, Math.max(NEARBY_LIMIT, 8), user);
    const home = document.querySelector('.home-page');
    const nearbyEl = home?.querySelector('[data-carousel="nearby"]');
    const forYouEl = home?.querySelector('[data-carousel="foryou"]');
    if (nearbyEl) nearbyEl.innerHTML = buildVenueCardsHtml(ranked);
    if (forYouEl) forYouEl.innerHTML = buildVenueCardsHtml(ranked);
    if (home) bindVenueCardClicks(home);
}

function buildProducerLabel(product) {
    const producer = getProducerById(product.producerId);
    const name = escapeHtml(producer?.name || getFeaturedProducerName(product));
    const chain = resolveProducerChain(producer || { name, chain: '' });

    if (chain?.logo) {
        return `${buildChainLogoHtml(chain)}<span class="home-product-producer-name">${name}</span>`;
    }

    return `<span class="home-product-producer-name">${name}</span>`;
}

function buildProducerRatingHtml(producer) {
    if (!producer) {
        return `<p class="home-card-rating home-card-rating--missing">${escapeHtml(t('msg.noCurrentData'))}</p>`;
    }
    const reviews = getReviews(producer.id);
    if (reviews.length > 0) {
        const avg = getAverageRating(producer.id, producer.rating);
        const stars = formatRatingStars(avg);
        return `<p class="home-card-rating" aria-label="${avg}"><span aria-hidden="true">${stars}</span> <span class="home-card-rating-value">${avg}</span></p>`;
    }
    if (Number.isFinite(Number(producer.rating)) && Number(producer.rating) > 0) {
        const avg = Number(producer.rating).toFixed(1);
        const stars = formatRatingStars(producer.rating);
        return `<p class="home-card-rating" aria-label="${avg}"><span aria-hidden="true">${stars}</span> <span class="home-card-rating-value">${avg}</span></p>`;
    }
    return `<p class="home-card-rating home-card-rating--missing">${escapeHtml(t('msg.noCurrentData'))}</p>`;
}

function buildRatingHtml(product) {
    const producer = getProducerById(product.producerId);
    const fallbackRating = Number(product.rating);

    if (producer) {
        return buildProducerRatingHtml(producer);
    }

    if (Number.isFinite(fallbackRating) && fallbackRating > 0) {
        const avg = fallbackRating.toFixed(1);
        const stars = formatRatingStars(fallbackRating);
        return `<p class="home-card-rating" aria-label="${avg}"><span aria-hidden="true">${stars}</span> <span class="home-card-rating-value">${avg}</span></p>`;
    }

    return `<p class="home-card-rating home-card-rating--missing">${escapeHtml(t('msg.noCurrentData'))}</p>`;
}

function buildFavoriteBtnHtml(producerId) {
    const fav = isFavorite(producerId);
    const label = fav ? t('btn.favoriteSaved') : t('btn.favorite');
    return `<button type="button" class="home-product-btn home-product-btn-favorite${fav ? ' is-favorite' : ''}" data-favorite-id="${escapeHtml(producerId)}" aria-pressed="${fav}">❤️ ${escapeHtml(label)}</button>`;
}

function buildCartBtnHtml(product) {
    return `<button type="button" class="home-product-btn home-product-btn-cart" data-cart-product-id="${escapeHtml(product.id)}" data-cart-producer-id="${escapeHtml(product.producerId)}">🛒 ${escapeHtml(t('btn.addToCart'))}</button>`;
}

function resolveFeaturedDistanceKm(product) {
    const user = getUserLocation();
    const producer = getProducerById(product.producerId)
        || getContentProducerById(product.producerId);
    const pLat = Number(producer?.lat);
    const pLng = Number(producer?.lng);

    if (user && Number.isFinite(pLat) && Number.isFinite(pLng)) {
        return getDistanceKm(user.lat, user.lng, pLat, pLng);
    }

    const fallback = Number(product.distanceKm);
    return Number.isFinite(fallback) ? fallback : null;
}

function buildProductMetaHtml(product) {
    const distance = resolveFeaturedDistanceKm(product);
    const producer = getProducerById(product.producerId)
        || getContentProducerById(product.producerId);
    const statusHtml = producer ? buildOpenStatusHtml(producer) : '';

    return `
        <p class="home-product-meta">
            ${formatDistanceEtaHtml(distance)}
            ${statusHtml}
        </p>
    `;
}

function buildVenueCardHtml(producer) {
    const name = escapeHtml(
        String(producer.name || '').trim() || t('map.unknownProducer') || t('producer.types.other')
    );
    const distance = resolveProducerDistanceKm(producer);
    const logo = buildProducerLogoHtml(producer, {
        size: 48,
        className: 'chain-logo home-venue-logo',
        preferChainOnly: true
    });
    const fastFoodPhoto = getFastFoodImage(producer);
    const producerPhoto = String(producer.image || producer.logo || '').trim();
    const chainLogoUrl = logo.isChain && logo.url ? String(logo.url).trim() : '';
    const coverPhoto = fastFoodPhoto
        || (chainLogoUrl && /^https?:\/\//i.test(chainLogoUrl) ? chainLogoUrl : '')
        || (/^https?:\/\//i.test(producerPhoto) ? producerPhoto : '');
    const usePhoto = Boolean(coverPhoto);

    let media;
    let mediaClass = 'home-venue-media';
    if (usePhoto && coverPhoto) {
        media = `<img src="${escapeHtml(coverPhoto)}" alt="" class="home-venue-photo" width="320" height="180" loading="lazy" decoding="async" />`;
        mediaClass = 'home-venue-media home-venue-media--photo';
    } else if (logo.isChain && logo.url) {
        media = logo.html;
    } else {
        media = `<span class="home-venue-emoji" aria-hidden="true">${logo.icon}</span>`;
    }

    const ratingHtml = buildProducerRatingHtml(producer);
    const price = Number(producer.products?.[0]?.price);
    const priceHtml = Number.isFinite(price) && price > 0
        ? `<p class="home-card-price">${escapeHtml(formatPrice(price))}</p>`
        : '';
    const promoted = isProducerPromoted(producer);
    const promotedHtml = promoted
        ? `<span class="rg-promoted-badge">${escapeHtml(t('ads.promoted'))}</span>`
        : '';

    return `
        <article class="home-venue-card home-product-card-open${promoted ? ' is-promoted' : ''}" data-producer-id="${escapeHtml(String(producer.id))}" tabindex="0" role="button" aria-label="${name}">
            <div class="${mediaClass}">${media}</div>
            <div class="home-venue-body">
                ${promotedHtml}
                <h3 class="home-venue-name">${name}</h3>
                ${ratingHtml}
                <p class="home-venue-meta">
                    ${formatDistanceEtaHtml(distance)}
                    ${buildOpenStatusHtml(producer)}
                </p>
                ${priceHtml}
            </div>
        </article>
    `;
}

function buildVenueCardsHtml(producers, { sponsored = false } = {}) {
    if (!producers.length) {
        return shouldShowProducersEmptyState(producers) ? buildEmptySectionHtml() : '';
    }
    if (sponsored) {
        return buildVenueCardsWithSponsoredHtml(producers, buildVenueCardHtml);
    }
    return producers.map((p) => buildVenueCardHtml(p)).join('');
}

function buildSectionHeader(title, categoryId) {
    const seeAll = categoryId
        ? `<button type="button" class="home-see-all" data-see-all="${escapeHtml(categoryId)}">${escapeHtml(t('home.seeAll'))}</button>`
        : '';
    const hasImage = Boolean(getCategoryImage(categoryId));
    const imageAttr = hasImage ? ` ${buildCategoryImageStyle(categoryId)}` : '';
    const headClass = hasImage
        ? 'home-section-head home-section-head--photo'
        : 'home-section-head';
    const sampleBadge = hasImage
        ? `<span class="category-sample-badge">${escapeHtml(t('product.placeholderImage'))}</span>`
        : '';

    return `
        <div class="${headClass}"${imageAttr}>
            ${sampleBadge}
            <h2 class="section-title">${title}</h2>
            ${seeAll}
        </div>
    `;
}

function buildCategoriesHtml() {
    const counts = countProducersByHomeCategory(getMapAreaPool(getProducers()));
    const favoritesCount = getFavoritesCount();
    const seen = new Set();

    return CATEGORY_IDS.filter((id) => {
        if (!CATEGORY_ID_SET.has(id) || seen.has(id)) return false;
        seen.add(id);
        return true;
    }).map((id) => {
        const name = t(`categories.${id}.name`);
        const icon = CATEGORY_ICONS[id] || CATEGORY_ICONS.other;
        const count = id === 'favorites' ? favoritesCount : counts[id];
        const countLabel = t('home.categoryCount').replace('{count}', String(count));
        return `
        <button type="button" class="category-card category-card--tile category-card--photo" data-category="${id}">
            <span class="category-card-scrim" aria-hidden="true"></span>
            <span class="category-icon" aria-hidden="true">${icon}</span>
            <span class="category-name">${escapeHtml(name)}</span>
            <span class="category-count">${escapeHtml(countLabel)}</span>
        </button>
    `;
    }).join('');
}

/** Usuń z DOM karty spoza kanonicznej ósemki (np. honey / all). */
function pruneHomeCategoryCards(root) {
    const grid = root?.querySelector?.('#homeCategoriesGrid');
    if (!grid) return;
    grid.querySelectorAll('.category-card[data-category]').forEach((card) => {
        const id = card.getAttribute('data-category');
        if (!CATEGORY_ID_SET.has(id)) card.remove();
    });
}

function buildProductCardsHtml(limit) {
    const inArea = getFeaturedProductsInMapArea();
    const list = limit ? inArea.slice(0, limit) : inArea;
    return list.map((product) => {
        const rawName = getFeaturedProductName(product, t);
        const name = escapeHtml(rawName);
        const producerLabel = buildProducerLabel(product);
        const ratingHtml = buildRatingHtml(product);
        const priceLabel = `${formatPrice(product.price)}${product.unit ? ` / ${escapeHtml(product.unit)}` : ''}`;
        const imageHtml = buildProductImageHtml(product.imageUrl, t, {
            className: 'home-product-card-photo',
            alt: rawName,
            name: rawName,
            imageSlug: product.imageSlug,
            category: product.category,
            isSample: true
        });

        return `
        <article class="home-product-card home-product-card--compact home-product-card-open" data-product-id="${escapeHtml(product.id)}" data-producer-id="${escapeHtml(product.producerId)}" tabindex="0" role="button" aria-label="${name}">
            <div class="home-product-card-media">
                <div class="home-product-image">
                    ${imageHtml}
                </div>
            </div>
            <div class="home-product-card-body">
                <h3 class="home-product-name">${name}</h3>
                <p class="home-product-producer">${producerLabel}</p>
                ${buildProductMetaHtml(product)}
                ${ratingHtml}
                <p class="home-product-price"><span aria-hidden="true">💶</span> ${priceLabel}</p>
                <div class="home-product-actions">
                    ${buildFavoriteBtnHtml(product.producerId)}
                    ${buildCartBtnHtml(product)}
                </div>
            </div>
        </article>
    `;
    }).join('');
}

function difficultyLabel(level) {
    if (level === 'easy') return t('recipes.difficultyEasy');
    if (level === 'hard') return t('recipes.difficultyHard');
    return t('recipes.difficultyMedium');
}

function recipeName(recipe) {
    const key = `recipes.items.${recipe.id}.name`;
    const translated = t(key);
    return translated !== key ? translated : recipe.name;
}

function resolveRecipeLinkedProducer(recipe) {
    const id = recipe?.linkedProducerIds?.[0];
    if (!id) return null;
    return getProducerById(id) || getContentProducerById(id) || null;
}

function buildRecipeProducerLogoHtml(producer) {
    if (!producer) return '';
    const logo = buildProducerLogoHtml(producer, {
        size: 20,
        className: 'home-producer-logo',
        preferChainOnly: false
    });
    if (!logo.url) return '';
    return `<img class="home-producer-logo" src="${escapeHtml(logo.url)}" alt="${escapeHtml(String(producer.name || ''))}" width="20" height="20" loading="lazy" decoding="async" />`;
}

function buildRecipeBadgeTagsHtml(producer) {
    if (!producer) return '';
    const tags = [];
    if (isProducerPromoted(producer)) {
        tags.push(`<span class="home-recipe-badge home-recipe-badge--promo">${escapeHtml(t('ads.promoted'))}</span>`);
    }
    const price = Number(producer.products?.[0]?.price);
    if (Number.isFinite(price) && price > 0) {
        tags.push(`<span class="home-recipe-badge home-recipe-badge--price">${escapeHtml(formatPrice(price))}</span>`);
    }
    return tags.join('');
}

function buildRecipeBadgesHtml(recipe) {
    const producer = resolveRecipeLinkedProducer(recipe);
    const logoHtml = buildRecipeProducerLogoHtml(producer);
    const tagsHtml = buildRecipeBadgeTagsHtml(producer);
    return `<div class="home-recipe-badges">${logoHtml}${tagsHtml}</div>`;
}

function buildRecipesHtml() {
    return getRecipes().map((recipe) => {
        const rawName = recipeName(recipe);
        const name = escapeHtml(rawName);
        const linkedProducer = resolveRecipeLinkedProducer(recipe);
        const producerId = linkedProducer?.id || recipe.linkedProducerIds?.[0] || '';
        const imageHtml = buildProductImageHtml(getRecipeImageUrl(recipe), t, {
            className: 'home-recipe-photo',
            alt: rawName,
            name: rawName,
            imageSlug: recipe.imageSlug,
            isSample: true
        });
        const time = t('recipes.timeMin').replace('{min}', String(recipe.timeMin));
        const difficulty = difficultyLabel(recipe.difficulty);

        return `
            <article class="home-recipe-card home-recipe-card--compact" data-recipe-id="${escapeHtml(recipe.id)}">
                <div class="home-recipe-media">
                    ${imageHtml}
                    <button type="button" class="home-recipe-open" data-recipe-producer="${escapeHtml(String(producerId))}">
                        <span class="home-recipe-open-text">${escapeHtml(t('recipes.openProducer'))}</span>
                        <span class="home-recipe-open-arrow" aria-hidden="true">&rarr;</span>
                    </button>
                </div>
                <div class="home-recipe-body">
                    <div class="home-recipe-title-row">
                        <h3 class="home-recipe-name">${name}</h3>
                        <span class="home-recipe-chevron" aria-hidden="true">&rsaquo;</span>
                    </div>
                    <p class="home-recipe-meta">
                        <span>${escapeHtml(time)}</span>
                        <span>${escapeHtml(difficulty)}</span>
                    </p>
                    ${buildRecipeBadgesHtml(recipe)}
                </div>
            </article>
        `;
    }).join('');
}

export const renderHome = (container) => {
    if (!container) {
        console.warn('Home: brak kontenera');
        return;
    }

    scheduleSelfHealingMaintenance();

    destroyHome();

    const recommended = getRecommendedNearby(NEARBY_LIMIT);
    const forYou = getForYouProducers(NEARBY_LIMIT);
    const recent = getRecentlyViewedProducers(6);
    const restaurants = getNearbyByHomeCategory('restaurants', VENUE_SECTION_LIMIT);
    const fastFood = getNearbyByHomeCategory('fastFood', VENUE_SECTION_LIMIT);
    const welcomeTitle = recent.length ? t('home.welcomeBack') : t('home.greeting');
    const regionalIntelHtml = buildRegionalIntelligenceHtml();
    const regionRecBlock = regionalIntelHtml
        ? `<section class="home-region-rec app-section" data-home-section="region-rec" aria-label="${escapeHtml(t('home.regionalIntelLabel') || t('home.regionSoulLabel'))}">${regionalIntelHtml}</section>`
        : '';
    const ambientOn = isAmbientNatureEnabled();
    const ambientLabel = ambientOn ? t('home.ambientNatureMute') : t('home.ambientNaturePlay');
    const ambientStatusText = ambientOn ? t('home.ambientNatureStatusOn') : t('home.ambientNatureStatusOff');

    /* Home fold: logo · powitanie · szukaj (drugorzędne) · JEDNO CTA „Otwórz mapę”.
       Tip regionu / kategorie / filtry — poniżej foldu. Bez zmiany handlerów / EventBus. */
    container.innerHTML = `
        <div class="home-page home-page--v2 home-page--v1">
            <section class="home-greeting" aria-label="${escapeHtml(welcomeTitle)}">
                <p class="home-greeting-brand"><img class="home-brand-mark" src="/assets/icons/logo-master.svg?v=30" width="20" height="20" alt="" aria-hidden="true"> Regionaler Geschmack</p>
                <div class="home-greeting-title-row">
                    <h2 class="home-greeting-title">${escapeHtml(welcomeTitle)}</h2>
                    <div class="home-ambient-control">
                        <button
                            type="button"
                            id="homeAmbientNatureBtn"
                            class="home-ambient-toggle${ambientOn ? ' is-on' : ' is-off'}"
                            aria-pressed="${ambientOn ? 'true' : 'false'}"
                            aria-label="${escapeHtml(ambientLabel)}"
                            title="${escapeHtml(ambientLabel)}"
                        >${HOME_AMBIENT_SPEAKER_SVG}</button>
                        <p class="home-ambient-status${ambientOn ? ' is-on' : ' is-off'}" aria-live="polite">
                            <span class="home-ambient-status-dot" aria-hidden="true"></span>
                            <span class="home-ambient-status-text">${escapeHtml(ambientStatusText)}</span>
                        </p>
                    </div>
                </div>
                <p class="home-greeting-sub">${escapeHtml(t('home.greetingSub'))}</p>
            </section>

            <section class="home-hub app-section" aria-label="${t('home.hubLabel')}">
                <form class="home-search home-search--lg" id="homeSearchForm" role="search">
                    <label class="home-search-field" for="homeSearchInput">
                        <span class="home-search-icon" aria-hidden="true">🔍</span>
                        <input
                            type="search"
                            id="homeSearchInput"
                            class="home-search-input"
                            placeholder="${t('home.searchPlaceholder')}"
                            autocomplete="off"
                            enterkeyhint="search"
                        >
                    </label>
                    <button type="submit" class="home-search-submit">${escapeHtml(t('home.searchSubmit'))}</button>
                </form>
                <div id="homeSearchResults" class="home-search-results" hidden aria-live="polite"></div>
            </section>

            <section class="home-actions app-section home-actions--primary-only">
                <button type="button" class="btn-location" id="getLocationBtn">
                    <span aria-hidden="true">📍</span> ${t('home.getLocation')}
                </button>
                <button type="button" class="btn-nearby" id="findNearbyBtn">
                    <span aria-hidden="true">🗺️</span> ${t('home.findNearby')}
                </button>
            </section>

            ${regionRecBlock}

            ${buildQuickFiltersHtml()}

            <section class="home-categories app-section" aria-labelledby="homeCategoriesHeading">
                <button type="button" class="home-all-categories-btn" id="homeAllCategoriesBtn" aria-controls="homeCategoriesGrid">
                    <span class="home-all-categories-icon" aria-hidden="true">🗂️</span>
                    <span id="homeCategoriesHeading">${escapeHtml(t('home.allCategories'))}</span>
                </button>
                <div id="homeCategoriesGrid" class="categories-grid categories-grid--2x4">
                    ${buildCategoriesHtml()}
                </div>
            </section>

            ${buildLivingRegionSectionHtml()}
            ${buildReturnMagicSectionHtml()}

            <section class="home-recommended app-section" aria-label="${t('home.nearbyTitle')}" data-home-section="nearby">
                ${buildSectionHeader(`📍 ${t('home.nearbyTitle')}`, 'all')}
                <div class="home-carousel" data-carousel="nearby">
                    ${buildVenueCardsHtml(recommended, { sponsored: true })}
                </div>
            </section>

            <section class="home-foryou app-section" aria-label="${t('home.forYouTitle')}" data-home-section="foryou">
                ${buildSectionHeader(`✨ ${t('home.forYouTitle')}`, 'all')}
                <button type="button" class="btn-secondary home-surprise-btn" id="homeSurpriseBtn">
                    <span aria-hidden="true">🎲</span> ${escapeHtml(t('home.surpriseMe'))}
                </button>
                <div class="home-carousel" data-carousel="foryou">
                    ${buildVenueCardsHtml(forYou, { sponsored: true })}
                </div>
            </section>

            <section class="home-recent app-section" aria-label="${t('home.recentTitle')}" data-home-section="recent">
                ${buildSectionHeader(`🕒 ${t('home.recentTitle')}`, null)}
                <div class="home-carousel" data-carousel="recent">
                    ${buildVenueCardsHtml(recent)}
                </div>
            </section>

            ${buildTastesOfDaySectionHtml()}
            ${buildTasteAdvisorSectionHtml()}
            ${buildSmartTodaySectionHtml()}
            ${buildNatureCalendarSectionHtml()}
            ${buildRegionStorySectionHtml()}
            ${buildLiveRegionSectionHtml()}
            ${buildSeasonalSectionHtml()}
            ${buildHomeAdBannersHtml()}

            <section class="home-restaurants app-section" aria-label="${t('categories.restaurants.name')}" data-home-section="restaurants">
                ${buildSectionHeader(`🍽️ ${t('categories.restaurants.name')}`, 'restaurants')}
                <div class="home-carousel" data-carousel="restaurants">
                    ${buildVenueCardsHtml(restaurants, { sponsored: true })}
                </div>
            </section>

            <section class="home-fastfood app-section" aria-label="${t('categories.fastFood.name')}" data-home-section="fastFood">
                ${buildSectionHeader(`🍔 ${t('categories.fastFood.name')}`, 'fastFood')}
                <div class="home-carousel" data-carousel="fastFood">
                    ${buildVenueCardsHtml(fastFood, { sponsored: true })}
                </div>
            </section>

            <section class="home-recommended home-featured app-section" aria-label="${t('home.featured')}">
                ${buildSectionHeader(`⭐ ${t('home.featured')}`, null)}
                <div class="home-carousel home-carousel--products" data-carousel="products">
                    ${getFeaturedProductsInMapArea().length
                        ? buildProductCardsHtml()
                        : buildEmptySectionHtml()}
                </div>
            </section>

            <section class="home-recipes app-section" aria-label="${t('recipes.title')}">
                ${buildSectionHeader(`📖 ${t('recipes.title')}`, null)}
                <div class="home-carousel home-carousel--recipes home-recipes-list" data-carousel="recipes">
                    ${buildRecipesHtml()}
                </div>
            </section>

            <section class="app-section home-premium-section">
                <button type="button" class="home-premium-cta" id="homePremiumBtn" aria-label="${t('premium.title')}">
                    <img class="home-premium-icon home-brand-mark" src="/assets/icons/logo-master.svg?v=30" width="28" height="28" alt="" aria-hidden="true">
                    <span class="home-premium-text">
                        <strong class="home-premium-title">${t('premium.title')}${isPremiumActive() ? ` · ${t('premium.statusActive')}` : ''}</strong>
                        <span class="home-premium-desc">${isPremiumActive() ? t('premium.benefitsUnlocked') : t('home.premiumTeaser')}</span>
                    </span>
                    <span class="home-premium-arrow" aria-hidden="true">›</span>
                </button>
            </section>

            ${buildHomeAdSenseHtml()}

            <footer class="home-footer">
                <p class="home-motto">${escapeHtml(t('home.motto'))}</p>
                <p class="footer-brand"><img class="home-brand-mark" src="/assets/icons/logo-master.svg?v=30" width="18" height="18" alt="" aria-hidden="true"> Regionaler Geschmack</p>
                <p class="footer-row">
                    <span aria-hidden="true">✉️</span>
                    <a href="mailto:krispolik6@gmail.com">krispolik6@gmail.com</a>
                </p>
                <p class="footer-row">
                    <span aria-hidden="true">📍</span>
                    ${t('footer.address')}
                </p>
                <p class="copyright">${t('home.footerCopyright')}</p>
            </footer>
        </div>
    `;

    pruneHomeCategoryCards(container);
    setupEvents(container);
};

function renderHomeSearchResults(container, query) {
    const resultsEl = container.querySelector('#homeSearchResults');
    if (!resultsEl) return;

    const trimmed = String(query || '').trim();
    if (!trimmed) {
        resultsEl.hidden = true;
        resultsEl.innerHTML = '';
        return;
    }

    const { items } = searchGlobalResults(getMapAreaPool(getProducers()), trimmed, t);
    const { items: displayedItems, total, overflow } = limitSearchDisplayItems(items, SEARCH_RESULTS_LIMIT);

    if (items.length === 0) {
        resultsEl.hidden = false;
        resultsEl.innerHTML = `
            <div class="home-search-empty-wrap empty-state">
                <span class="empty-icon" aria-hidden="true">🔍</span>
                <p class="home-search-empty">${formatSearchNoResults(trimmed, t, escapeHtml)}</p>
                <p class="empty-sub">${escapeHtml(t('favorites.emptySub'))}</p>
                <button type="button" class="btn-primary" data-empty-go-map>${escapeHtml(t('search.emptyCta'))}</button>
            </div>
        `;
        resultsEl.querySelector('[data-empty-go-map]')?.addEventListener('click', () => {
            eventBus.emit(EVENTS.NEARBY_SEARCH);
        });
        return;
    }

    resultsEl.hidden = false;
    const overflowNote = formatSearchResultsOverflow(overflow, t);
    resultsEl.innerHTML = `
        <p class="home-search-results-label">${t('search.resultsCount').replace('{count}', String(total))}</p>
        <div class="home-search-results-list" role="list">
            ${displayedItems.map((item) => buildSearchResultCardHtml(item, t, formatCurrency)).join('')}
        </div>
        ${overflowNote ? `<p class="home-search-results-overflow">${escapeHtml(overflowNote)}</p>` : ''}
    `;
}

function bindHomeSearch(container, signal) {
    const searchForm = container.querySelector('#homeSearchForm');
    const searchInput = container.querySelector('#homeSearchInput');
    if (homeSearchDebounceTimer) {
        clearTimeout(homeSearchDebounceTimer);
        homeSearchDebounceTimer = null;
    }

    const runSearch = (query) => {
        renderHomeSearchResults(container, query);
    };

    const opts = signal ? { signal } : undefined;

    searchInput?.addEventListener('input', () => {
        const query = searchInput.value;
        const resultsEl = container.querySelector('#homeSearchResults');
        if (homeSearchDebounceTimer) clearTimeout(homeSearchDebounceTimer);
        if (query.trim() && resultsEl) {
            resultsEl.hidden = false;
            resultsEl.innerHTML = `<p class="home-search-empty">${t('search.searching')}</p>`;
        } else if (resultsEl) {
            resultsEl.hidden = true;
            resultsEl.innerHTML = '';
            eventBus.emit(EVENTS.SEARCH_PRODUCTS, { query: '', navigate: false });
        }
        homeSearchDebounceTimer = setTimeout(() => runSearch(query), SEARCH_DEBOUNCE_MS);
    }, opts);

    searchForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        const query = searchInput?.value?.trim() || '';
        runSearch(query);
        trackSearchQuery(query);
        eventBus.emit(EVENTS.SEARCH_PRODUCTS, { query });
    }, opts);

    container.querySelector('#homeSearchResults')?.addEventListener('click', (event) => {
        const card = event.target.closest('[data-producer-id]');
        if (!card) return;
        const producerId = card.dataset.producerId;
        if (!producerId) return;
        event.preventDefault();
        event.stopPropagation();
        openProducerModal(producerId);
    }, opts);
}

function updateFavoriteButton(btn) {
    const id = btn.dataset.favoriteId;
    const fav = isFavorite(id);
    btn.classList.toggle('is-favorite', fav);
    btn.setAttribute('aria-pressed', String(fav));
    btn.textContent = fav ? `❤️ ${t('btn.favoriteSaved')}` : `🤍 ${t('btn.favorite')}`;
}

function refreshProductRatings(container) {
    container.querySelectorAll('.home-product-card[data-product-id]').forEach((card) => {
        const product = featuredProducts.find((p) => p.id === card.dataset.productId);
        const ratingEl = card.querySelector('.home-card-rating, .home-product-rating');
        if (!product || !ratingEl) return;
        const wrapper = document.createElement('div');
        wrapper.innerHTML = buildRatingHtml(product);
        ratingEl.replaceWith(wrapper.firstElementChild);
    });
}

function patchLiveDistances(container) {
    container.querySelectorAll('[data-distance-km]').forEach((el) => {
        const card = el.closest('[data-producer-id], [data-product-id]');
        let km = null;
        if (card?.dataset?.producerId) {
            const producer = getProducerById(card.dataset.producerId);
            km = resolveProducerDistanceKm(producer);
        } else if (card?.dataset?.productId) {
            const product = featuredProducts.find((p) => p.id === card.dataset.productId);
            km = product ? resolveFeaturedDistanceKm(product) : null;
        }
        if (!Number.isFinite(km)) return;
        const eta = formatEtaLabels(km);
        el.dataset.distanceKm = km.toFixed(4);
        el.textContent = `${formatDistanceLabel(km)} · ${eta.compact}`;
    });
}

function refreshFeaturedDistances(container, { rebuild = false } = {}) {
    container.querySelectorAll('.home-product-card[data-product-id]').forEach((card) => {
        const product = featuredProducts.find((p) => p.id === card.dataset.productId);
        const metaEl = card.querySelector('.home-product-meta');
        if (!product || !metaEl) return;
        const wrapper = document.createElement('div');
        wrapper.innerHTML = buildProductMetaHtml(product);
        metaEl.replaceWith(wrapper.firstElementChild);
    });
    if (rebuild) refreshVenueSections(container);
    else softRefreshVenueOrder(container);
}

function refreshVenueSections(container) {
    const nearbyEl = container.querySelector('[data-carousel="nearby"]');
    const forYouEl = container.querySelector('[data-carousel="foryou"]');
    const restEl = container.querySelector('[data-carousel="restaurants"]');
    const ffEl = container.querySelector('[data-carousel="fastFood"]');
    if (nearbyEl) nearbyEl.innerHTML = buildVenueCardsHtml(getRecommendedNearby(NEARBY_LIMIT), { sponsored: true });
    if (forYouEl) forYouEl.innerHTML = buildVenueCardsHtml(getForYouProducers(NEARBY_LIMIT), { sponsored: true });
    if (restEl) restEl.innerHTML = buildVenueCardsHtml(getNearbyByHomeCategory('restaurants', VENUE_SECTION_LIMIT), { sponsored: true });
    if (ffEl) ffEl.innerHTML = buildVenueCardsHtml(getNearbyByHomeCategory('fastFood', VENUE_SECTION_LIMIT), { sponsored: true });
    // Delegacja na .home-carousel – zachowaj AbortSignal z setupEvents
    bindVenueCardClicks(container, homeUiAbort?.signal);
}

/** Odsubskrybowanie listenerów EventBus Home */
let homeBusUnsubs = [];
/** Abort poprzednich listenerów UI Home przy ponownym renderze */
let homeUiAbort = null;

export function destroyHome() {
    while (homeBusUnsubs.length) {
        try {
            homeBusUnsubs.pop()?.();
        } catch {
            /* ignore */
        }
    }
    if (homeSearchDebounceTimer) {
        clearTimeout(homeSearchDebounceTimer);
        homeSearchDebounceTimer = null;
    }
    if (homeUiAbort) {
        try { homeUiAbort.abort(); } catch { /* ignore */ }
        homeUiAbort = null;
    }
    stopHomeAdRotation();
    teardownHomeAdSense();
}

function refreshCategoryCounts(container) {
    const counts = countProducersByHomeCategory(getMapAreaPool(getProducers()));
    const favoritesCount = getFavoritesCount();

    container.querySelectorAll('.category-card').forEach((item) => {
        const id = item.dataset.category;
        const count = id === 'favorites' ? favoritesCount : counts[id];
        const countEl = item.querySelector('.category-count');
        if (countEl && id) {
            countEl.textContent = t('home.categoryCount').replace('{count}', String(count));
        }
    });
}

function syncHomeAmbientToggle(container, on) {
    const btn = container.querySelector('#homeAmbientNatureBtn');
    if (!btn) return;
    btn.classList.toggle('is-on', on);
    btn.classList.toggle('is-off', !on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    const label = on ? t('home.ambientNatureMute') : t('home.ambientNaturePlay');
    btn.setAttribute('aria-label', label);
    btn.title = label;
    const status = container.querySelector('.home-ambient-status');
    if (status) {
        status.classList.toggle('is-on', on);
        status.classList.toggle('is-off', !on);
        const textEl = status.querySelector('.home-ambient-status-text');
        if (textEl) {
            textEl.textContent = on ? t('home.ambientNatureStatusOn') : t('home.ambientNatureStatusOff');
        }
    }
}

function bindPlacesRefresh(container) {
    homeBusUnsubs.push(eventBus.on(EVENTS.PLACES_LOADED, () => {
        const home = document.querySelector('.home-page');
        if (home) {
            refreshCategoryCounts(home);
            refreshVenueSections(home);
            const input = home.querySelector('#homeSearchInput');
            if (input?.value.trim()) {
                renderHomeSearchResults(home.parentElement || container, input.value);
            }
        }
    }));
    homeBusUnsubs.push(eventBus.on(EVENTS.FAVORITES_CHANGED, () => {
        const home = document.querySelector('.home-page');
        if (home) refreshCategoryCounts(home);
    }));
}

function bindReviewsRefresh() {
    homeBusUnsubs.push(eventBus.on(EVENTS.REVIEWS_CHANGED, () => {
        const home = document.querySelector('.home-page');
        if (!home) return;
        refreshProductRatings(home);
    }));
}

function bindLocationRefresh() {
    homeBusUnsubs.push(eventBus.on(EVENTS.LOCATION_UPDATED, () => {
        const home = document.querySelector('.home-page');
        if (home) refreshFeaturedDistances(home, { rebuild: false });
    }));
    homeBusUnsubs.push(eventBus.on(EVENTS.LOCATION_CHANGED, () => {
        ensureHomeProducersLoaded();
        const home = document.querySelector('.home-page');
        if (home) refreshFeaturedDistances(home, { rebuild: true });
    }));
}

function bindVenueCardClicks(container, signal) {
    const opts = signal ? { signal } : undefined;
    container.querySelectorAll('.home-carousel').forEach((carousel) => {
        // Przy nowym sygnale zawsze bind; stary AbortController zdejmie poprzednie
        if (!signal && carousel.dataset.venueBound === 'true') return;
        carousel.dataset.venueBound = 'true';

        carousel.addEventListener('click', (event) => {
            if (event.target.closest('.home-product-actions')) return;
            const card = event.target.closest('.home-product-card-open, .home-venue-card');
            if (!card?.dataset?.producerId) return;
            event.preventDefault();
            event.stopPropagation();
            openProducerModal(card.dataset.producerId);
        }, opts);

        carousel.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            const card = event.target.closest('.home-product-card-open, .home-venue-card');
            if (!card || event.target.closest('.home-product-actions')) return;
            event.preventDefault();
            const producerId = card.dataset.producerId;
            if (!producerId) return;
            openProducerModal(producerId);
        }, opts);
    });
}

function setupEvents(container) {
    initProducerModal();
    bindPlacesRefresh(container);
    ensureHomeProducersLoaded();
    stopHomeAdRotation();
    startHomeAdRotation(container);
    mountHomeAdSense(container);

    // Cleanup poprzednich listenerów UI przed ponownym bind
    if (homeUiAbort) {
        try { homeUiAbort.abort(); } catch { /* ignore */ }
    }
    homeUiAbort = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const signal = homeUiAbort?.signal;
    const on = (el, type, fn, extra) => {
        if (!el) return;
        el.addEventListener(type, fn, signal ? { signal, ...extra } : extra);
    };

    on(container.querySelector('#homeAmbientNatureBtn'), 'click', () => {
        const next = !isAmbientNatureEnabled();
        setAmbientNatureEnabled(next, { userInitiated: next });
        // drugi kick w tym samym geście użytkownika (iOS / autoplay)
        if (next && typeof window !== 'undefined' && window.__RG_NATURE_AUDIO__?.start) {
            window.__RG_NATURE_AUDIO__.start({ userInitiated: true });
        }
        syncHomeAmbientToggle(container, next);
    });

    homeBusUnsubs.push(eventBus.on(EVENTS.AMBIENT_UNAVAILABLE, () => {
        syncHomeAmbientToggle(container, false);
    }));

    on(container.querySelector('#homePremiumBtn'), 'click', () => {
        eventBus.emit(EVENTS.NAVIGATE, { view: 'premium' });
    });

    on(container.querySelector('#getLocationBtn'), 'click', () => {
        eventBus.emit(EVENTS.LOCATION_REQUESTED);
    });

    on(container.querySelector('#findNearbyBtn'), 'click', () => {
        eventBus.emit(EVENTS.NEARBY_SEARCH);
    });

    on(container.querySelector('#homeSurpriseBtn'), 'click', () => {
        const pool = getMapAreaPool(getProducers().filter((p) => p && p.category !== 'other'));
        const pick = pickSurpriseProducer({ pool });
        if (!pick?.producer?.id) {
            showToast(t('msg.noProducersNearby'));
            return;
        }
        showToast(formatSurpriseMessage(pick, t));
        openProducerModal(pick.producer.id);
    });

    on(container.querySelector('#homeAllCategoriesBtn'), 'click', () => {
        const grid = container.querySelector('#homeCategoriesGrid');
        if (!grid) return;
        grid.hidden = false;
        grid.classList.add('is-highlighted');
        grid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        grid.querySelector('.category-card')?.focus?.();
        window.setTimeout(() => grid.classList.remove('is-highlighted'), 900);
    });

    // Jedna delegacja click zamiast dziesiątek listenerów na przyciskach
    on(container, 'click', (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (!target) return;

        if (handleNativeAdClick(event, {
            navigateTo: (view) => eventBus.emit(EVENTS.NAVIGATE, { view }),
            navigateToCategory: (category) => eventBus.emit(EVENTS.NAVIGATE, {
                view: 'map',
                filter: category
            })
        })) {
            return;
        }

        const tasteProducer = target.closest('[data-taste-advisor-producer]');
        if (tasteProducer?.dataset?.tasteAdvisorProducer) {
            openProducerModal(tasteProducer.dataset.tasteAdvisorProducer);
            return;
        }
        if (target.closest('[data-taste-advisor-route]')) {
            eventBus.emit(EVENTS.CATEGORY_SELECTED, { category: 'farmers' });
            return;
        }
        if (target.closest('[data-taste-advisor-explore], [data-return-magic-explore]')) {
            eventBus.emit(EVENTS.NEARBY_SEARCH);
            return;
        }

        const quick = target.closest('[data-quick-filter]');
        if (quick) {
            container.querySelectorAll('[data-quick-filter]').forEach((b) => b.classList.remove('is-active'));
            quick.classList.add('is-active');
            applyQuickFilter(quick.dataset.quickFilter);
            return;
        }

        const seasonal = target.closest('[data-seasonal-query]');
        if (seasonal) {
            const query = seasonal.dataset.seasonalQuery || '';
            trackSearchQuery(query);
            eventBus.emit(EVENTS.NAVIGATE, { view: 'map' });
            import('./map.js?v=48').then((mod) => {
                mod.setSearchQuery?.(query);
            }).catch(() => {});
            return;
        }

        const livingItem = target.closest('.home-living-region-item');
        if (livingItem) {
            const producerId = livingItem.dataset?.livingRegionProducer;
            if (producerId) {
                event.preventDefault();
                event.stopPropagation();
                openProducerModal(producerId);
                return;
            }
            if (livingItem.dataset?.livingRegionCategory) {
                eventBus.emit(EVENTS.CATEGORY_SELECTED, {
                    category: livingItem.dataset.livingRegionCategory
                });
            }
            return;
        }

        const tastesProducer = target.closest('[data-tastes-producer]');
        if (tastesProducer?.dataset?.tastesProducer) {
            openProducerModal(tastesProducer.dataset.tastesProducer);
            return;
        }

        const returnProducer = target.closest('[data-return-magic-producer]');
        if (returnProducer?.dataset?.returnMagicProducer) {
            openProducerModal(returnProducer.dataset.returnMagicProducer);
            return;
        }

        const soulCat = target.closest('[data-region-soul-category]');
        if (soulCat?.dataset?.regionSoulCategory) {
            eventBus.emit(EVENTS.CATEGORY_SELECTED, { category: soulCat.dataset.regionSoulCategory });
            return;
        }

        const liveCat = target.closest('[data-live-region-category]');
        if (liveCat?.dataset?.liveRegionCategory) {
            eventBus.emit(EVENTS.CATEGORY_SELECTED, { category: liveCat.dataset.liveRegionCategory });
            return;
        }

        const categoryCard = target.closest('.category-card');
        if (categoryCard?.dataset?.category) {
            const category = categoryCard.dataset.category;
            if (category === 'favorites') {
                eventBus.emit(EVENTS.NAVIGATE, { view: 'favorites' });
                return;
            }
            eventBus.emit(EVENTS.CATEGORY_SELECTED, { category });
            return;
        }

        const seeAll = target.closest('[data-see-all]');
        if (seeAll) {
            const category = seeAll.dataset.seeAll;
            if (category === 'all') eventBus.emit(EVENTS.NEARBY_SEARCH);
            else eventBus.emit(EVENTS.CATEGORY_SELECTED, { category });
            return;
        }

        const favBtn = target.closest('[data-favorite-id]');
        if (favBtn) {
            event.stopPropagation();
            const id = favBtn.dataset.favoriteId;
            if (isFavorite(id)) removeFavorite(id);
            else addFavorite(id);
            updateFavoriteButton(favBtn);
            refreshFavoritesBadge();
            refreshCategoryCounts(container.querySelector('.home-page') || container);
            return;
        }

        const cartBtn = target.closest('[data-cart-product-id]');
        if (cartBtn) {
            event.stopPropagation();
            const product = featuredProducts.find((p) => p.id === cartBtn.dataset.cartProductId)
                || getSmartTodayCandidateById(cartBtn.dataset.cartProductId);
            if (!product) return;
            addToCart({
                id: product.id,
                productId: product.id,
                producerId: product.producerId,
                name: smartTodayProductName(product),
                place: getFeaturedProducerName(product),
                price: product.price,
                unit: product.unit || ''
            });
            refreshCartBadge();
            return;
        }

        const recipeBtn = target.closest('[data-recipe-producer]');
        if (recipeBtn?.dataset?.recipeProducer) {
            event.preventDefault();
            event.stopPropagation();
            openProducerModal(recipeBtn.dataset.recipeProducer);
        }
    });

    refreshSmartTodayWeather().then((changed) => {
        if (!changed || signal?.aborted) return;
        const host = container.querySelector('[data-home-section="smart-today"]');
        if (!host) return;
        const wrap = document.createElement('div');
        wrap.innerHTML = buildSmartTodaySectionHtml().trim();
        const next = wrap.firstElementChild;
        if (!next) return;
        host.replaceWith(next);
        bindVenueCardClicks(container, signal);
    }).catch(() => {});

    bindVenueCardClicks(container, signal);
    bindHomeSearch(container, signal);
    bindReviewsRefresh();
    bindLocationRefresh();
}

export default { renderHome, destroyHome };
