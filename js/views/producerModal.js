// js/views/producerModal.js – pełnoekranowy modal szczegółów producenta

import {
    getProducerById,
    getProducerProducts,
    getGoogleMapsDirectionsUrl,
    getProducers,
    findProducerNear,
    upsertProducer
} from '../data/dataService.js';
import { ensureLeafletLoaded } from '../core/mapLoader.js';
import { t, tProductField, formatNavLabel, getCurrentLanguage } from '../core/i18n.js';
import { CATALOG_TRANSLATIONS } from '../translations.js';
import {
    translatePage,
    getCachedTranslation
} from '../i18n/aiTranslationEngine.js';
import {
    buildPlaceHistoryHtml,
    buildPromotionsFlyerHtml,
    buildOpenStatusHtml,
    handlePromoFlyerToggle
} from '../presentation/producerDisplay.js';
import {
    applyProducerMoodToModal,
    clearProducerMoodFromModal
} from '../presentation/producerMood.js';
import { buildProductImageHtml } from '../presentation/productImage.js';
import { buildAmenitiesHtml, buildProducerPhotoHtml } from '../presentation/producerTrust.js';
import { buildAvailabilityBadgeHtml, getProductAvailability } from '../presentation/productAvailability.js';
import { isSeasonalProduct, getSeasonalDemoItems } from '../data/seasonCalendar.js';
import { trackProducerViewed, trackProductViewed } from '../core/userHistory.js';
import { eventBus } from '../core/eventBus.js';
import { EVENTS } from '../core/events.js';
import { getRecipes } from '../data/recipes.js';
import {
    getReviews,
    addReview,
    updateReview,
    reportReview,
    getAverageRating,
    formatRatingStars,
    buildReviewImageHtml
} from '../data/reviews.js';
import { REPORT_REASONS, submitProducerReport } from '../data/communityReports.js';
import { getCurrentUser } from '../auth/auth.js';
import { showToast } from '../core/toast.js';
import { enrichProducerWithProducts } from '../data/producerProducts.js';
import {
    addTasteDiaryEntry,
    fileToDataUrl
} from '../core/tasteDiary.js';
import { getProducerDisplayName } from '../presentation/chainBrands.js';
import { formatDistanceLabel, formatEtaLabels } from '../presentation/geoFormat.js';
import { getProducerTypeKey } from '../presentation/categoryIcons.js';
import { getDistanceKm } from '../data/producerHelpers.js';
import { getLastPosition } from '../core/userLocation.js';
import { getProducerStory } from '../data/producerStories.js';
import { isProducerPromoted } from '../core/premiumService.js';
import { refreshTasteDiaryMenuCount } from '../core/sideMenu.js';
import { addToCart, refreshCartBadge } from './cart.js';
import {
    addFavoriteId,
    removeFavoriteId,
    isFavorite as isProducerFavorite,
    getFavoriteIds
} from '../core/favoritesStore.js';

let initialized = false;
let lastFocusedElement = null;
let locationMiniMap = null;
/** Timestamp otwarcia – blokuje ghost-click zamykający modal w tym samym geście */
let modalOpenedAtMs = 0;
/** Aktualnie otwarty producent (Learning Engine – czas na ekranie) */
let openDetailProducer = null;
/** Dłuższy guard: popupclose / ghost-click po „Szczegóły” nie może zamknąć modala */
const MODAL_CLOSE_GUARD_MS = 800;
/** Jawna flaga – niezależna od DOM (popupclose / race z hidden) */
let isModalOpen = false;
/** Blokuje podwójne kliknięcie „Szczegóły” podczas otwierania modala */
let isOpening = false;

const MODAL_MAP_ZOOM = 14;
/** Limit kart produktów w jednym renderze – ochrona przed freeze na mobile */
const MODAL_PRODUCTS_RENDER_LIMIT = 24;
const MODAL_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const STORY_PREVIEW_CHARS = 160;

function buildProducerModalMetaLine(producer) {
    const parts = [];
    const user = getLastPosition();
    let km = Number(producer?.distanceKm);
    if (!Number.isFinite(km) && user && Number.isFinite(Number(producer?.lat)) && Number.isFinite(Number(producer?.lng))) {
        km = getDistanceKm(user.lat, user.lng, Number(producer.lat), Number(producer.lng));
    }
    if (Number.isFinite(km)) {
        parts.push(formatDistanceLabel(km));
        const eta = formatEtaLabels(km);
        parts.push(`🚶 ${eta.walk}`);
        parts.push(`🚗 ${eta.car}`);
    } else if (producer?.distance) {
        parts.push(String(producer.distance));
    }
    if (producer?.address) {
        parts.push(String(producer.address));
    }
    return parts.filter(Boolean).join(' · ');
}

function buildProducerModalHeaderHtml(producer) {
    const displayName = getProducerDisplayName(producer);
    const typeKey = getProducerTypeKey(producer?.category);
    const typeLabel = t(`producer.types.${typeKey}`);
    const ratingNum = Number(producer?.rating);
    const stars = Number.isFinite(ratingNum) && ratingNum > 0
        ? `${'★'.repeat(Math.min(5, Math.round(ratingNum)))}${'☆'.repeat(5 - Math.min(5, Math.round(ratingNum)))}`
        : '';
    const ratingHtml = stars
        ? `<span class="producer-modal-chip producer-modal-chip-rating"><span aria-hidden="true">${stars}</span> ${escapeHtml(String(ratingNum))}</span>`
        : '';
    const statusHtml = buildOpenStatusHtml(producer);
    const promotedHtml = isProducerPromoted(producer)
        ? `<span class="producer-modal-chip producer-modal-chip-promo">${escapeHtml(t('ads.promoted'))}</span>`
        : '';
    const metaLine = buildProducerModalMetaLine(producer);
    const promoHtml = producer?.promo
        ? `<p class="producer-modal-promo producer-modal-promo--compact">${escapeHtml(producer.promo)}</p>`
        : '';

    return `
        <div class="producer-modal-photo-hero">
            ${buildProducerPhotoHtml(producer, { className: 'producer-photo' })}
            <div class="producer-modal-photo-caption">
                <h2 class="producer-modal-photo-title" id="producerModalTitle">${escapeHtml(displayName)}</h2>
            </div>
        </div>
        ${metaLine ? `<p class="producer-modal-meta-line">${escapeHtml(metaLine)}</p>` : ''}
        <div class="producer-modal-header-chips">
            ${ratingHtml}
            <span class="producer-modal-chip producer-modal-chip-type">${escapeHtml(typeLabel)}</span>
            ${promotedHtml}
            ${statusHtml ? `<span class="producer-modal-chip producer-modal-chip-status">${statusHtml}</span>` : ''}
        </div>
        ${promoHtml}
    `;
}

function buildModalStoryHtml(producer) {
    const storyRaw = getProducerStory(producer);
    if (!storyRaw) return '';

    const lang = getCurrentLanguage();
    const cached = lang !== 'de' ? getCachedTranslation(storyRaw, lang, 'de') : storyRaw;
    const story = cached || storyRaw;
    const needsAi = lang !== 'de' && !cached;
    const needsToggle = story.length > STORY_PREVIEW_CHARS;
    const preview = needsToggle
        ? `${story.slice(0, STORY_PREVIEW_CHARS).trim()}…`
        : story;
    const aiAttrs = needsAi
        ? ` data-rg-ai data-rg-ai-src="${escapeHtml(storyRaw)}" data-rg-ai-skip`
        : '';

    return `
        <section class="producer-story producer-story--collapsible" data-story-collapsible aria-label="${escapeHtml(t('producer.storyTitle'))}">
            <h3 class="producer-section-title">${escapeHtml(t('producer.storyTitle'))}</h3>
            <p class="producer-story-text" data-story-text${aiAttrs}>${escapeHtml(preview)}</p>
            ${needsToggle ? `<button type="button" class="producer-story-toggle" data-story-toggle aria-expanded="false">${escapeHtml(t('btn.more'))}</button>` : ''}
            ${needsToggle ? `<span class="visually-hidden" data-story-full${needsAi ? ` data-rg-ai data-rg-ai-src="${escapeHtml(storyRaw)}"` : ''}>${escapeHtml(story)}</span>` : ''}
        </section>
    `;
}

/** Po tłumaczeniu historii — zsynchronizuj podgląd/pełny tekst i etykietę Mehr/Weniger. */
function syncStoryToggleState(content) {
    const toggle = content.querySelector('[data-story-toggle]');
    const textEl = content.querySelector('[data-story-text]');
    const fullEl = content.querySelector('[data-story-full]');
    if (!toggle || !textEl || !fullEl) return;

    const fullText = (fullEl.textContent || '').trim();
    if (!fullText) return;

    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    if (expanded) {
        textEl.textContent = fullText;
        toggle.textContent = t('btn.less');
        toggle.setAttribute('aria-expanded', 'true');
        return;
    }

    textEl.textContent = fullText.length > STORY_PREVIEW_CHARS
        ? `${fullText.slice(0, STORY_PREVIEW_CHARS).trim()}…`
        : fullText;
    toggle.textContent = t('btn.more');
    toggle.setAttribute('aria-expanded', 'false');
}

/** Jedna kolejka tłumaczeń zamiast wielu równoległych zapytań API przy otwarciu modala. */
function scheduleModalTranslations(content, producer) {
    if (!content || getCurrentLanguage() === 'de') return;
    void translatePage(content, { from: 'de' }).then(() => {
        syncStoryToggleState(content);
    });
}

function resolveModalCatalogField(producerId, index, field, fallback) {
    const lang = getCurrentLanguage();
    const raw = String(fallback ?? '').trim();
    if (!raw || lang === 'de') return raw;
    const entry = CATALOG_TRANSLATIONS[lang]?.[producerId]?.products?.[index];
    if (entry?.[field]) return String(entry[field]);
    return getCachedTranslation(raw, lang, 'de') || raw;
}

function buildModalProductFieldHtml(tag, className, producerId, index, field, fallback) {
    const lang = getCurrentLanguage();
    const raw = String(fallback ?? '').trim();
    if (!raw) return '';
    const resolved = resolveModalCatalogField(producerId, index, field, raw);
    if (lang === 'de' || resolved !== raw) {
        return `<${tag} class="${className}">${escapeHtml(resolved)}</${tag}>`;
    }
    return `<${tag} class="${className}" data-rg-ai data-rg-ai-src="${escapeHtml(raw)}">${escapeHtml(raw)}</${tag}>`;
}

function bindStoryExpand(content) {
    const toggle = content.querySelector('[data-story-toggle]');
    const textEl = content.querySelector('[data-story-text]');
    const fullEl = content.querySelector('[data-story-full]');
    if (!toggle || !textEl || !fullEl || toggle.dataset.bound === 'true') return;
    toggle.dataset.bound = 'true';

    toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        if (expanded) {
            const preview = `${fullEl.textContent.slice(0, STORY_PREVIEW_CHARS).trim()}…`;
            textEl.textContent = preview;
            toggle.textContent = t('btn.more');
            toggle.setAttribute('aria-expanded', 'false');
        } else {
            textEl.textContent = fullEl.textContent;
            toggle.textContent = t('btn.less');
            toggle.setAttribute('aria-expanded', 'true');
        }
    });
}

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

function ensureModal() {
    if (document.getElementById('producerModal')) return;

    document.body.insertAdjacentHTML('beforeend', `
        <div id="producerModal" class="producer-modal" hidden inert>
            <div class="producer-modal-backdrop" data-close-modal></div>
            <div class="producer-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="producerModalTitle">
                <div class="producer-modal-content" id="producerModalContent"></div>
            </div>
        </div>
    `);
}

function setModalOpenState(modal, isOpen) {
    if (!modal) return;
    if (isOpen) {
        isModalOpen = true;
        modal.hidden = false;
        if ('inert' in modal) modal.inert = false;
        modal.removeAttribute('aria-hidden');
        return;
    }

    // Najpierw zabierz fokus z wnętrza, potem ukryj (bez aria-hidden na elemencie z focusem)
    if (modal.contains(document.activeElement)) {
        document.activeElement.blur?.();
    }
    if ('inert' in modal) modal.inert = true;
    modal.hidden = true;
    modal.removeAttribute('aria-hidden');
    isModalOpen = false;
}

/** Czy modal szczegółów jest otwarty (dla mapy / popupclose). */
export function isProducerModalOpen() {
    if (isModalOpen) return true;
    const modal = document.getElementById('producerModal');
    return Boolean(modal && !modal.hidden);
}

function getFocusableElements(root) {
    if (!root) return [];
    return Array.from(root.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ));
}

function handleModalKeydown(event) {
    const modal = document.getElementById('producerModal');
    if (!modal || modal.hidden) return;

    if (event.key === 'Escape') {
        event.preventDefault();
        // Escape zawsze zamyka – nawet w oknie guarda po „Szczegóły”
        closeProducerModal({ force: true });
        return;
    }

    if (event.key !== 'Tab') return;

    const dialog = modal.querySelector('.producer-modal-dialog');
    const focusable = getFocusableElements(dialog);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}

function normalizeExternalUrl(raw) {
    const value = String(raw || '').trim();
    if (!value) return '';
    if (/^https?:\/\//i.test(value)) return value;
    if (value.includes('facebook.com') || value.includes('instagram.com') || value.includes('.')) {
        return `https://${value.replace(/^\/+/, '')}`;
    }
    return '';
}

function buildContactHtml(producer) {
    const items = [];

    const phoneRaw = String(producer.phone || '').trim();
    if (phoneRaw) {
        const tel = phoneRaw.replace(/[^\d+]/g, '');
        if (tel.replace(/\D/g, '').length >= 3) {
            items.push(`<a class="producer-contact-item" href="tel:${escapeHtml(tel)}" aria-label="${escapeHtml(t('producer.phone'))}">📞 ${escapeHtml(phoneRaw)}</a>`);
        }
    }
    const emailRaw = String(producer.email || '').trim();
    if (emailRaw && emailRaw.includes('@')) {
        items.push(`<a class="producer-contact-item" href="mailto:${escapeHtml(emailRaw)}" aria-label="${escapeHtml(t('producer.email'))}">✉️ ${escapeHtml(emailRaw)}</a>`);
    }
    if (producer.website) {
        const href = normalizeExternalUrl(producer.website);
        if (href) {
            items.push(`<a class="producer-contact-item" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(t('producer.website'))}">🌐 ${escapeHtml(String(producer.website).replace(/^https?:\/\//i, ''))}</a>`);
        }
    }
    // Kontakt w aplikacji: wyłącznie telefon · e-mail · WWW (bez płatności / social CTA)

    if (items.length === 0) return '';

    return `
        <section class="producer-contact-section">
            <h3 class="producer-section-title">${t('producer.contactTitle')}</h3>
            <div class="producer-contact-list">${items.join('')}</div>
        </section>
    `;
}

function destroyLocationMiniMap() {
    if (!locationMiniMap) return;
    locationMiniMap.remove();
    locationMiniMap = null;
}

async function initLocationMiniMap(root) {
    try {
        destroyLocationMiniMap();

        const el = root?.querySelector('[data-producer-mini-map]');
        if (!el) return;

        await ensureLeafletLoaded();

        const lat = Number(el.dataset.lat);
        const lng = Number(el.dataset.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

        locationMiniMap = window.L.map(el, {
            zoomControl: false,
            attributionControl: true,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            touchZoom: false,
            boxZoom: false,
            keyboard: false
        }).setView([lat, lng], MODAL_MAP_ZOOM);

        window.L.tileLayer(MODAL_TILE_URL, {
            attribution: '© OpenStreetMap',
            maxZoom: 19
        }).addTo(locationMiniMap);

        window.L.marker([lat, lng]).addTo(locationMiniMap);

        requestAnimationFrame(() => locationMiniMap?.invalidateSize(true));
    } catch (error) {
        console.warn('[Modal] Mini-mapa niedostępna:', error);
        destroyLocationMiniMap();
    }
}

function buildLocationHtml(producer) {
    const lat = Number(producer.lat);
    const lng = Number(producer.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return '';

    const mapsUrl = getGoogleMapsDirectionsUrl(lat, lng);

    return `
        <section class="producer-location-section">
            <h3 class="producer-section-title">${t('producer.locationTitle')}</h3>
            <div class="producer-location-preview">
                <div
                    class="producer-location-map"
                    data-producer-mini-map
                    data-lat="${lat}"
                    data-lng="${lng}"
                    role="img"
                    aria-label="${escapeHtml(producer.address || producer.name)}"
                ></div>
                <a class="producer-location-nav" href="${escapeHtml(mapsUrl)}" target="_blank" rel="noopener noreferrer">
                    📍 ${escapeHtml(t('btn.navigate'))}
                </a>
            </div>
            ${producer.address ? `<p class="producer-location-address">${escapeHtml(producer.address)}</p>` : ''}
        </section>
    `;
}

function buildReviewsHtml(producer, sort = 'newest') {
    const reviews = getReviews(producer.id, sort);
    const avg = getAverageRating(producer.id, producer.rating);
    const stars = formatRatingStars(avg);
    const currentUser = getCurrentUser();

    const listHtml = reviews.length
        ? reviews.map((review) => {
            const canEdit = currentUser && review.userId && String(review.userId) === String(currentUser.id);
            return `
            <article class="producer-review-card" data-review-id="${escapeHtml(review.id || '')}">
                <div class="producer-review-head">
                    <strong>${escapeHtml(review.user)}</strong>
                    <span class="producer-review-stars" aria-label="${review.rating}">${formatRatingStars(review.rating)}</span>
                </div>
                <p class="producer-review-comment">${escapeHtml(review.comment)}</p>
                ${buildReviewImageHtml(review.imageUrl)}
                ${review.reply?.text ? `<p class="producer-review-reply"><strong>${escapeHtml(t('reviews.replyLabel'))}:</strong> ${escapeHtml(review.reply.text)}</p>` : ''}
                <time class="producer-review-date" datetime="${escapeHtml(review.date)}">${escapeHtml(review.date)}</time>
                <div class="producer-review-actions">
                    ${canEdit ? `<button type="button" class="btn-secondary" data-edit-review="${escapeHtml(review.id || '')}">${escapeHtml(t('reviews.edit'))}</button>` : ''}
                    <button type="button" class="btn-secondary" data-report-review="${escapeHtml(review.id || '')}">${escapeHtml(t('reviews.report'))}</button>
                </div>
            </article>`;
        }).join('')
        : `<p class="producer-reviews-empty">${t('reviews.empty')}</p>`;

    const reviewUserName = currentUser?.displayName || '';

    return `
        <section class="producer-reviews-section" data-reviews-root data-producer-id="${escapeHtml(producer.id)}">
            <h3 class="producer-section-title">${t('reviews.title')}${avg ? ` <span class="producer-reviews-avg">${stars} ${avg}</span>` : ''}</h3>
            <div class="producer-reviews-sort" role="toolbar" aria-label="${escapeHtml(t('reviews.title'))}">
                <button type="button" class="home-quick-chip${sort === 'newest' ? ' is-active' : ''}" data-review-sort="newest">${escapeHtml(t('reviews.sortNewest'))}</button>
                <button type="button" class="home-quick-chip${sort === 'best' ? ' is-active' : ''}" data-review-sort="best">${escapeHtml(t('reviews.sortBest'))}</button>
                <button type="button" class="home-quick-chip${sort === 'with_photos' ? ' is-active' : ''}" data-review-sort="with_photos">${escapeHtml(t('reviews.sortPhotos'))}</button>
            </div>
            <div class="producer-reviews-list">${listHtml}</div>
            <form class="producer-review-form" data-review-form data-producer-id="${escapeHtml(producer.id)}">
                <h4 class="producer-review-form-title">${t('reviews.add')}</h4>
                <label class="producer-review-field">
                    <span>${t('reviews.userName')}</span>
                    <input type="text" name="user" required maxlength="40" autocomplete="name" value="${escapeHtml(reviewUserName)}">
                </label>
                <label class="producer-review-field">
                    <span>${t('reviews.rating')}</span>
                    <select name="rating" required>
                        <option value="5">5 ★</option>
                        <option value="4">4 ★</option>
                        <option value="3">3 ★</option>
                        <option value="2">2 ★</option>
                        <option value="1">1 ★</option>
                    </select>
                </label>
                <label class="producer-review-field">
                    <span>${t('reviews.comment')}</span>
                    <textarea name="comment" rows="3" required maxlength="500"></textarea>
                </label>
                <label class="producer-review-field">
                    <span>${t('reviews.imageUrl')}</span>
                    <input type="url" name="imageUrl" inputmode="url" maxlength="500" placeholder="https://">
                    <small class="producer-review-field-hint">${escapeHtml(t('reviews.imageUrlHint'))}</small>
                </label>
                <label class="producer-review-field">
                    <span>${t('reviews.imageFile')}</span>
                    <input type="file" name="imageFile" accept="image/*" capture="environment">
                </label>
                <button type="submit" class="btn-primary producer-review-submit">${t('reviews.submit')}</button>
            </form>
        </section>
    `;
}

function buildReportHtml(producer) {
    return `
        <section class="producer-report-section" aria-label="${escapeHtml(t('report.title'))}">
            <h3 class="producer-section-title">${escapeHtml(t('report.title'))}</h3>
            <p class="producer-report-lead">${escapeHtml(t('report.lead'))}</p>
            <form class="producer-report-form" data-report-form data-producer-id="${escapeHtml(producer.id)}">
                <label class="producer-review-field">
                    <span>${escapeHtml(t('report.reason'))}</span>
                    <select name="reason" required>
                        ${REPORT_REASONS.map((r) => `
                            <option value="${escapeHtml(r.id)}">${escapeHtml(t(r.labelKey))}</option>
                        `).join('')}
                    </select>
                </label>
                <label class="producer-review-field">
                    <span>${escapeHtml(t('report.note'))}</span>
                    <textarea name="note" rows="2" maxlength="400" placeholder="${escapeHtml(t('report.notePlaceholder'))}"></textarea>
                </label>
                <button type="submit" class="btn-secondary">${escapeHtml(t('report.submit'))}</button>
            </form>
        </section>
    `;
}

function readFileAsDataUrl(file) {
    return new Promise((resolve) => {
        if (!file || !file.type?.startsWith('image/')) {
            resolve('');
            return;
        }
        if (file.size > 1_200_000) {
            showToast(t('reviews.imageTooLarge'), 'error');
            resolve('');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
    });
}

function resolveProductId(producerId, product, index) {
    return product?.id || `${producerId}-item-${index}`;
}

function buildProductActionMenuItems(producer, product, index) {
    const items = [];
    const soldOut = getProductAvailability(product) === 'soldout';

    if (!soldOut) {
        items.push({ action: 'cart', label: t('btn.addToCart'), icon: '🛒' });
    }

    const phoneRaw = String(producer?.phone || '').trim();
    if (phoneRaw) {
        const tel = phoneRaw.replace(/[^\d+]/g, '');
        if (tel.replace(/\D/g, '').length >= 3) {
            items.push({
                action: 'phone',
                label: t('producer.phone'),
                icon: '📞',
                href: `tel:${tel}`
            });
        }
    }

    const emailRaw = String(producer?.email || '').trim();
    if (emailRaw && emailRaw.includes('@')) {
        items.push({
            action: 'email',
            label: t('producer.email'),
            icon: '✉️',
            href: `mailto:${emailRaw}`
        });
    }

    if (producer?.website) {
        const href = normalizeExternalUrl(producer.website);
        if (href) {
            items.push({
                action: 'website',
                label: t('producer.website'),
                icon: '🌐',
                href,
                external: true
            });
        }
    }

    const lat = Number(producer?.lat);
    const lng = Number(producer?.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
        items.push({ action: 'navigate', label: t('btn.navigate'), icon: '📍' });
    }

    const fav = isProducerFavorite(producer?.id);
    items.push({
        action: 'favorite',
        label: fav ? t('btn.favoriteSaved') : t('btn.favorite'),
        icon: fav ? '❤️' : '🤍'
    });

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        items.push({ action: 'share', label: t('producer.actionShare'), icon: '↗️' });
    }

    return items;
}

function buildProductActionsDropdownHtml(producer, product, index) {
    if (!producer) return '';

    const productId = resolveProductId(producer.id, product, index);
    const items = buildProductActionMenuItems(producer, product, index);
    if (!items.length) return '';

    const menuItems = items.map((item) => {
        if (item.href) {
            const linkAttrs = item.external
                ? ` href="${escapeHtml(item.href)}" target="_blank" rel="noopener noreferrer"`
                : ` href="${escapeHtml(item.href)}"`;
            return `<li><a class="product-actions-item" data-product-action="${escapeHtml(item.action)}"${linkAttrs}>${item.icon} ${escapeHtml(item.label)}</a></li>`;
        }
        return `<li><button type="button" class="product-actions-item" data-product-action="${escapeHtml(item.action)}">${item.icon} ${escapeHtml(item.label)}</button></li>`;
    }).join('');

    return `
        <div class="product-actions-dropdown">
            <button type="button" class="dropdown-toggle product-actions-toggle"
                data-product-actions-toggle
                data-product-id="${escapeHtml(productId)}"
                data-producer-id="${escapeHtml(producer.id)}"
                data-product-index="${index}"
                aria-haspopup="menu"
                aria-expanded="false">
                ⚡ ${escapeHtml(t('producer.actionsMenu'))} ▾
            </button>
            <ul class="dropdown-menu product-actions-menu"
                data-product-id="${escapeHtml(productId)}"
                role="menu"
                hidden>
                ${menuItems}
            </ul>
        </div>
    `;
}

function buildProductCard(producerId, product, index, category, producer = null) {
    const nameRaw = product.name;
    const descRaw = product.description || '';
    const name = resolveModalCatalogField(producerId, index, 'name', nameRaw);
    const description = descRaw ? resolveModalCatalogField(producerId, index, 'description', descRaw) : '';
    const priceLabel = `${formatPrice(product.price)}${product.unit ? ` / ${escapeHtml(product.unit)}` : ''}`;
    const hasRealImage = Boolean(product.imageUrl) && product.isSampleImage === false;
    const imageHtml = buildProductImageHtml(product.imageUrl || null, t, {
        alt: name,
        name,
        imageSlug: product.imageSlug,
        category: category || '',
        isSample: !hasRealImage,
        imageSource: hasRealImage
            ? (producer?.source === 'osm' ? 'place' : 'producer')
            : 'sample',
        fromOsm: producer?.source === 'osm',
        className: 'producer-product-photo'
    });
    const availability = buildAvailabilityBadgeHtml(product, t);

    return `
        <article class="producer-product-card">
            <div class="producer-product-image">
                ${imageHtml}
            </div>
            <div class="producer-product-info">
                ${buildModalProductFieldHtml('h3', 'producer-product-name', producerId, index, 'name', nameRaw)}
                ${descRaw ? buildModalProductFieldHtml('p', 'producer-product-desc', producerId, index, 'description', descRaw) : ''}
                <p class="producer-product-price">${priceLabel}</p>
                <p class="producer-product-badges">${availability}</p>
                ${product.promo
        ? `<p class="producer-product-promo" data-rg-ai data-rg-ai-src="${escapeHtml(String(product.promo))}">${escapeHtml(String(product.promo))}</p>`
        : ''}
                ${buildProductActionsDropdownHtml(producer || getProducerById(producerId), product, index)}
            </div>
        </article>
    `;
}

function buildSmartOfferHtml(producer) {
    const products = Array.isArray(producer?.products) ? producer.products : getProducerProducts(producer.id);

    const popular = products.slice(0, 3);
    const mostBought = products.length ? [...products].reverse().slice(0, 3) : [];
    const seasonal = products.filter((p) => isSeasonalProduct(p)).slice(0, 3);
    const recommended = products.length
        ? [...products].sort((a, b) => Number(b.price || 0) - Number(a.price || 0)).slice(0, 3)
        : [];
    const recipes = getRecipes().slice(0, 3);

    const list = (title, items, renderItem) => {
        if (!items.length) return '';
        return `
            <div class="producer-smart-block">
                <h4 class="producer-smart-title">${escapeHtml(title)}</h4>
                <ul class="producer-smart-list">
                    ${items.map(renderItem).join('')}
                </ul>
            </div>
        `;
    };

    const productItem = (p) => `<li>${escapeHtml(p.name || t('productDefault'))}</li>`;
    const seasonDemo = seasonal.length
        ? seasonal
        : getSeasonalDemoItems().slice(0, 3).map((x) => ({ name: x.name }));

    const blocks = [
        list(t('producer.mostBought'), mostBought.length ? mostBought : popular, productItem),
        list(t('producer.mostPopular'), popular, productItem),
        list(t('producer.recommendedProducts'), recommended, productItem),
        list(t('home.seasonalTitle'), seasonDemo, productItem),
        list(t('producer.relatedRecipes'), recipes, (r) => `<li>${escapeHtml(r.name || '')}</li>`)
    ].join('');

    if (!blocks.trim()) return '';

    return `
        <section class="producer-smart-offer">
            <h3 class="producer-section-title">${escapeHtml(t('producer.smartOfferTitle'))}</h3>
            ${blocks}
        </section>
    `;
}

function menuSectionLabel(section) {
    const key = `producer.menuSections.${section}`;
    const label = t(key);
    return label !== key ? label : section;
}

function isExternalProducerWithoutCatalog(producer) {
    return (producer.source === 'osm' || producer.source === 'govdata')
        && getProducerProducts(producer.id).length === 0;
}

function buildPromotionsHtml(producer) {
    return buildPromotionsFlyerHtml(producer, { compact: false });
}

function sliceProductsForModalRender(products) {
    if (!Array.isArray(products) || products.length <= MODAL_PRODUCTS_RENDER_LIMIT) {
        return { visible: products || [], hiddenCount: 0 };
    }
    return {
        visible: products.slice(0, MODAL_PRODUCTS_RENDER_LIMIT),
        hiddenCount: products.length - MODAL_PRODUCTS_RENDER_LIMIT
    };
}

function buildProductsHtml(producer) {
    // Preferuj produkty już na obiekcie (po enrich) – unikaj pustej listy przy soft-match / fallback
    const fromObject = Array.isArray(producer?.products) ? producer.products : [];
    const allProducts = fromObject.length ? fromObject : getProducerProducts(producer.id);
    const totalCount = allProducts.length;
    const { visible: products, hiddenCount } = sliceProductsForModalRender(allProducts);

    if (!totalCount) {
        return `
            <section class="producer-products-section">
                <h3 class="producer-section-title">${t('producer.productsTitle')}</h3>
                <p class="producer-modal-empty">${t('msg.noCurrentData')}</p>
            </section>
        `;
    }

    const category = producer.category || '';
    const hasSections = products.some((p) => p.menuSection);
    let listHtml = '';

    if (hasSections) {
        const order = ['soups', 'mains', 'salads', 'breakfast', 'desserts', 'drinks'];
        const grouped = new Map();
        products.forEach((product, index) => {
            const section = product.menuSection || 'mains';
            if (!grouped.has(section)) grouped.set(section, []);
            grouped.get(section).push({ product, index });
        });

        const sectionKeys = [
            ...order.filter((key) => grouped.has(key)),
            ...[...grouped.keys()].filter((key) => !order.includes(key))
        ];

        listHtml = sectionKeys.map((section) => {
            const items = grouped.get(section) || [];
            return `
                <div class="producer-menu-section" data-menu-section="${escapeHtml(section)}">
                    <h4 class="producer-menu-section-title">${escapeHtml(menuSectionLabel(section))}</h4>
                    <div class="producer-modal-grid">
                        ${items.map(({ product, index }) => buildProductCard(producer.id, product, index, category, producer)).join('')}
                    </div>
                </div>
            `;
        }).join('');
    } else {
        listHtml = `
            <div class="producer-modal-grid" data-product-list>
                ${products.map((product, index) => buildProductCard(producer.id, product, index, category, producer)).join('')}
            </div>
        `;
    }

    const moreHint = hiddenCount > 0
        ? `<p class="producer-modal-empty producer-products-more-hint" role="status">+${hiddenCount}</p>`
        : '';

    return `
        <section class="producer-products-section">
            <h3 class="producer-section-title">${t('producer.productsTitle')}
                <span class="producer-products-count">(${totalCount})</span>
            </h3>
            ${listHtml}
            ${moreHint}
        </section>
    `;
}

function buildModalLoadingShell() {
    return `
        <div class="producer-modal-toolbar">
            <button type="button" class="producer-modal-back" data-close-modal aria-label="${t('btn.back')}">
                ← ${t('btn.back')}
            </button>
        </div>
        <div class="producer-modal-body">
            <p class="producer-modal-empty" role="status">${escapeHtml(t('msg.loading'))}</p>
        </div>
        <footer class="producer-modal-footer">
            <button type="button" class="producer-modal-close" data-close-modal>${t('btn.close')}</button>
        </footer>
    `;
}

function rebindModalForms(content, producerId) {
    bindReviewForm(content, producerId);
    bindReportForm(content, producerId);
    bindReviewExtras(content, producerId);
    bindProductActionsDropdown(content, producerId);
    bindTasteDiaryForm(content, producerId);
    bindStoryExpand(content);
    initLocationMiniMap(content);
}

function buildTasteDiaryHtml(producer) {
    const stars = [1, 2, 3, 4, 5]
        .map(
            (n) =>
                `<label class="taste-diary-star">
                    <input type="radio" name="tasteDiaryRating" value="${n}" ${n === 5 ? 'checked' : ''}>
                    <span aria-hidden="true">★</span>
                </label>`
        )
        .join('');

    return `
        <section class="taste-diary-block app-section" data-taste-diary-root aria-label="${escapeHtml(t('tasteDiary.title'))}">
            <button type="button" class="btn-secondary taste-diary-open-btn" data-taste-diary-toggle>
                ${escapeHtml(t('tasteDiary.add'))}
            </button>
            <form class="taste-diary-form" data-taste-diary-form hidden>
                <input type="hidden" name="producerId" value="${escapeHtml(String(producer.id || ''))}">
                <input type="hidden" name="producerName" value="${escapeHtml(getProducerDisplayName(producer) || producer.name || '')}">
                <label class="taste-diary-field">
                    <span>${escapeHtml(t('tasteDiary.productName'))}</span>
                    <input type="text" name="productName" required maxlength="120" autocomplete="off">
                </label>
                <fieldset class="taste-diary-rating">
                    <legend>${escapeHtml(t('tasteDiary.rating'))}</legend>
                    <div class="taste-diary-stars" role="radiogroup" aria-label="${escapeHtml(t('tasteDiary.rating'))}">
                        ${stars}
                    </div>
                </fieldset>
                <label class="taste-diary-field">
                    <span>${escapeHtml(t('tasteDiary.note'))}</span>
                    <textarea name="note" rows="3" maxlength="1000"></textarea>
                </label>
                <label class="taste-diary-field">
                    <span>${escapeHtml(t('tasteDiary.photo'))}</span>
                    <input type="file" name="image" accept="image/*">
                </label>
                <div class="taste-diary-actions">
                    <button type="submit" class="btn-primary">${escapeHtml(t('tasteDiary.save'))}</button>
                    <button type="button" class="btn-secondary" data-taste-diary-cancel>${escapeHtml(t('tasteDiary.cancel'))}</button>
                </div>
            </form>
        </section>
    `;
}

function bindTasteDiaryForm(content, producerId) {
    const root = content.querySelector('[data-taste-diary-root]');
    if (!root || root.dataset.bound === 'true') return;
    root.dataset.bound = 'true';

    const form = root.querySelector('[data-taste-diary-form]');
    const toggleBtn = root.querySelector('[data-taste-diary-toggle]');
    const cancelBtn = root.querySelector('[data-taste-diary-cancel]');

    const setOpen = (open) => {
        if (!form || !toggleBtn) return;
        form.hidden = !open;
        toggleBtn.hidden = open;
        if (open) {
            form.querySelector('input[name="productName"]')?.focus();
        }
    };

    toggleBtn?.addEventListener('click', () => setOpen(true));
    cancelBtn?.addEventListener('click', () => {
        form?.reset();
        setOpen(false);
    });

    form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const fd = new FormData(form);
        const productName = String(fd.get('productName') || '').trim();
        const rating = Number(fd.get('tasteDiaryRating') || 0);
        const note = String(fd.get('note') || '');
        const file = fd.get('image');

        if (!productName || !(rating >= 1 && rating <= 5)) {
            showToast(t('tasteDiary.required'), 'error');
            return;
        }

        let image = '';
        try {
            if (file instanceof File && file.size > 0) {
                image = await fileToDataUrl(file);
            }
        } catch (err) {
            const reason = String(err?.message || err);
            showToast(
                reason === 'image_too_large' ? t('tasteDiary.imageTooLarge') : t('tasteDiary.error'),
                'error'
            );
            return;
        }

        const producer = getProducerById(producerId);
        const result = addTasteDiaryEntry({
            producerId: String(fd.get('producerId') || producerId),
            producerName:
                String(fd.get('producerName') || '') ||
                (producer ? getProducerDisplayName(producer) : '') ||
                '',
            productName,
            rating,
            note,
            image
        });

        if (!result.ok) {
            showToast(
                result.reason === 'image_too_large'
                    ? t('tasteDiary.imageTooLarge')
                    : t('tasteDiary.error'),
                'error'
            );
            return;
        }

        form.reset();
        setOpen(false);
        try {
            refreshTasteDiaryMenuCount();
        } catch {
            /* side menu może nie być zainicjalizowane */
        }
        showToast(t('tasteDiary.saved'));
    });
}

function bindReviewExtras(content, producerId) {
    content.querySelectorAll('[data-review-sort]').forEach((btn) => {
        if (btn.dataset.bound === 'true') return;
        btn.dataset.bound = 'true';
        btn.addEventListener('click', () => {
            const sort = btn.dataset.reviewSort || 'newest';
            const root = content.querySelector('[data-reviews-root]');
            const producer = getProducerById(producerId);
            if (!root || !producer) return;
            root.outerHTML = buildReviewsHtml(producer, sort);
            rebindModalForms(content, producerId);
        });
    });

    content.querySelectorAll('[data-report-review]').forEach((btn) => {
        if (btn.dataset.bound === 'true') return;
        btn.dataset.bound = 'true';
        btn.addEventListener('click', () => {
            const ok = reportReview(btn.dataset.reportReview, 'inappropriate', getCurrentUser()?.id);
            showToast(ok ? t('reviews.reportSaved') : t('reviews.replyError'), ok ? 'success' : 'error');
        });
    });

    content.querySelectorAll('[data-edit-review]').forEach((btn) => {
        if (btn.dataset.bound === 'true') return;
        btn.dataset.bound = 'true';
        btn.addEventListener('click', () => {
            const card = btn.closest('.producer-review-card');
            const comment = card?.querySelector('.producer-review-comment')?.textContent || '';
            const next = window.prompt(t('reviews.saveEdit'), comment);
            if (next == null) return;
            const user = getCurrentUser();
            const updated = updateReview(btn.dataset.editReview, { comment: next }, user?.id);
            if (!updated) {
                showToast(t('reviews.replyError'), 'error');
                return;
            }
            showToast(t('reviews.saveEdit'));
            const producer = getProducerById(producerId);
            if (producer) {
                content.innerHTML = renderModalContent(producer);
                rebindModalForms(content, producerId);
                scheduleModalTranslations(content, producer);
            }
        });
    });
}

function refreshFavoritesNavBadge() {
    const label = document.querySelector('[data-view="favorites"] .nav-label');
    if (label) {
        label.textContent = formatNavLabel('favorites', getFavoriteIds().length);
    }
}

function closeAllProductActionMenus(content) {
    content.querySelectorAll('.product-actions-dropdown.is-open').forEach((wrap) => {
        wrap.classList.remove('is-open');
        const toggle = wrap.querySelector('[data-product-actions-toggle]');
        const menu = wrap.querySelector('.product-actions-menu');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
        if (menu) menu.hidden = true;
    });
}

function refreshProductFavoriteMenuLabels(content, producerId) {
    const fav = isProducerFavorite(producerId);
    const label = fav ? t('btn.favoriteSaved') : t('btn.favorite');
    const icon = fav ? '❤️' : '🤍';
    content.querySelectorAll('[data-product-action="favorite"]').forEach((btn) => {
        btn.textContent = `${icon} ${label}`;
    });
}

/** Rozwijane akcje produktu: koszyk, kontakt, nawigacja, ulubione, udostępnij. */
function bindProductActionsDropdown(content, producerId) {
    const producer = getProducerById(producerId);
    if (!producer) return;

    content.querySelectorAll('[data-product-actions-toggle]').forEach((toggle) => {
        if (toggle.dataset.bound === 'true') return;
        toggle.dataset.bound = 'true';

        toggle.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const wrap = toggle.closest('.product-actions-dropdown');
            const menu = wrap?.querySelector('.product-actions-menu');
            if (!wrap || !menu) return;

            const willOpen = !wrap.classList.contains('is-open');
            closeAllProductActionMenus(content);
            if (willOpen) {
                wrap.classList.add('is-open');
                menu.hidden = false;
                toggle.setAttribute('aria-expanded', 'true');
            }
        });
    });

    content.querySelectorAll('[data-product-action]').forEach((item) => {
        if (item.dataset.bound === 'true') return;
        item.dataset.bound = 'true';

        item.addEventListener('click', (event) => {
            const action = item.dataset.productAction;
            const wrap = item.closest('.product-actions-dropdown');
            const toggle = wrap?.querySelector('[data-product-actions-toggle]');
            const index = Number(toggle?.dataset.productIndex);
            const products = Array.isArray(producer.products) && producer.products.length
                ? producer.products
                : getProducerProducts(producerId);
            const product = products[index];
            if (!product) return;

            if (action === 'cart') {
                event.preventDefault();
                event.stopPropagation();
                const productId = resolveProductId(producerId, product, index);
                const name = tProductField(producerId, index, 'name', product.name);
                addToCart({
                    id: productId,
                    productId,
                    producerId,
                    name,
                    place: getProducerDisplayName(producer),
                    price: product.price,
                    unit: product.unit || ''
                });
                refreshCartBadge();
                showToast(t('msg.addedToCart'));
                closeAllProductActionMenus(content);
                return;
            }

            if (action === 'favorite') {
                event.preventDefault();
                event.stopPropagation();
                if (isProducerFavorite(producerId)) {
                    removeFavoriteId(producerId);
                    showToast(t('msg.removedFromFavorites'));
                } else {
                    addFavoriteId(producerId);
                    showToast(t('msg.addedToFavorites'));
                }
                eventBus.emit(EVENTS.FAVORITES_CHANGED, { favorites: getFavoriteIds() });
                refreshFavoritesNavBadge();
                refreshProductFavoriteMenuLabels(content, producerId);
                closeAllProductActionMenus(content);
                return;
            }

            if (action === 'navigate') {
                event.preventDefault();
                event.stopPropagation();
                const lat = Number(producer.lat);
                const lng = Number(producer.lng);
                if (Number.isFinite(lat) && Number.isFinite(lng)) {
                    window.open(getGoogleMapsDirectionsUrl(lat, lng), '_blank', 'noopener,noreferrer');
                }
                closeAllProductActionMenus(content);
                return;
            }

            if (action === 'share') {
                event.preventDefault();
                event.stopPropagation();
                const name = tProductField(producerId, index, 'name', product.name);
                const producerName = getProducerDisplayName(producer);
                const url = `${window.location.origin}${window.location.pathname}?producer=${encodeURIComponent(producerId)}`;
                navigator.share({
                    title: name,
                    text: `${name} – ${producerName}`,
                    url
                }).catch(() => {});
                closeAllProductActionMenus(content);
                return;
            }

            closeAllProductActionMenus(content);
        });
    });
}

function bindReviewForm(content, producerId) {
    const form = content.querySelector('[data-review-form]');
    if (!form || form.dataset.bound === 'true') return;
    form.dataset.bound = 'true';

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (form.dataset.submitting === 'true') return;
        form.dataset.submitting = 'true';
        const submitBtn = form.querySelector('[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.setAttribute('aria-busy', 'true');
        }
        try {
            const data = new FormData(form);
            const file = data.get('imageFile');
            const fromFile = file instanceof File ? await readFileAsDataUrl(file) : '';
            const entry = addReview(producerId, {
                user: data.get('user'),
                rating: data.get('rating'),
                comment: data.get('comment'),
                imageUrl: fromFile || data.get('imageUrl'),
                userId: getCurrentUser()?.id
            });

            if (!entry) {
                showToast(t('reviews.validationError'), 'error');
                return;
            }

            showToast(t('reviews.saved'));
            const producer = getProducerById(producerId);
            if (producer) {
                content.innerHTML = renderModalContent(producer);
                rebindModalForms(content, producerId);
                scheduleModalTranslations(content, producer);
            }
        } finally {
            form.dataset.submitting = 'false';
            if (submitBtn && submitBtn.isConnected) {
                submitBtn.disabled = false;
                submitBtn.removeAttribute('aria-busy');
            }
        }
    });
}

function bindReportForm(content, producerId) {
    const form = content.querySelector('[data-report-form]');
    if (!form || form.dataset.bound === 'true') return;
    form.dataset.bound = 'true';

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const producer = getProducerById(producerId);
        const entry = submitProducerReport({
            producerId,
            producerName: producer?.name || '',
            reason: String(data.get('reason') || 'other'),
            note: String(data.get('note') || ''),
            userId: getCurrentUser()?.id
        });
        if (!entry) {
            showToast(t('report.error'), 'error');
            return;
        }
        form.reset();
        showToast(t('report.saved'));
    });
}

function renderModalContent(producer) {
    return `
        <div class="producer-modal-toolbar">
            <button type="button" class="producer-modal-back" data-close-modal aria-label="${t('btn.back')}">
                ← ${t('btn.back')}
            </button>
        </div>
        <header class="producer-modal-header producer-modal-header--compact">
            ${buildProducerModalHeaderHtml(producer)}
        </header>
        <div class="producer-modal-body">
            ${buildTasteDiaryHtml(producer)}
            ${buildModalStoryHtml(producer)}
            ${buildPlaceHistoryHtml(producer)}
            ${buildSmartOfferHtml(producer)}
            ${buildProductsHtml(producer)}
            ${buildPromotionsHtml(producer)}
            ${buildContactHtml(producer)}
            ${buildAmenitiesHtml(producer)}
            ${buildReviewsHtml(producer)}
            ${buildReportHtml(producer)}
            ${buildLocationHtml(producer)}
        </div>
        <footer class="producer-modal-footer">
            <button type="button" class="producer-modal-close" data-close-modal>${t('btn.close')}</button>
        </footer>
    `;
}

/**
 * @param {string} producerId
 * @param {{ id?: string, name?: string, lat?: number, lng?: number, category?: string, address?: string, source?: string } | null} [hint]
 */
function resolveProducerForModal(producerId, hint = null) {
    const raw = String(producerId ?? hint?.id ?? '').trim();

    if (raw) {
        const direct = getProducerById(raw);
        if (direct) return direct;
    }

    const lat = Number(hint?.lat);
    const lng = Number(hint?.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
        const near = findProducerNear(lat, lng);
        if (near) return near;
    }

    // Fallback z danych popupu mapy – nadal pokaż produkty z katalogu kategorii
    if (hint && (hint.name || (Number.isFinite(lat) && Number.isFinite(lng)))) {
        const fallbackId = raw || `map-fallback-${lat}-${lng}`;
        return upsertProducer({
            id: fallbackId,
            name: hint.name || t('msg.producerUnavailable'),
            lat: Number.isFinite(lat) ? lat : null,
            lng: Number.isFinite(lng) ? lng : null,
            category: hint.category || 'shop',
            address: hint.address || '',
            description: '',
            products: [],
            promotions: [],
            source: hint.source || 'map-fallback'
        });
    }

    // Soft match po liście (gdy brak hintu)
    if (raw) {
        const list = getProducers();
        const normalized = raw.toLowerCase();
        const soft = list.find((p) => {
            const id = String(p.id || '');
            return id === raw
                || id.toLowerCase() === normalized
                || id.endsWith(raw)
                || raw.endsWith(id)
                || id.replace(/^osm-/i, '') === raw.replace(/^osm-/i, '');
        });
        if (soft) return soft;
    }

    return null;
}

function showProducerUnavailable(producerId) {
    ensureModal();
    const modal = document.getElementById('producerModal');
    const content = document.getElementById('producerModalContent');
    if (!modal || !content) {
        showToast(t('msg.producerUnavailable'));
        return;
    }

    lastFocusedElement = document.activeElement;
    content.innerHTML = `
        <div class="producer-modal-toolbar">
            <button type="button" class="producer-modal-back" data-close-modal aria-label="${t('btn.back')}">
                ← ${t('btn.back')}
            </button>
        </div>
        <div class="producer-modal-body">
            <p class="producer-modal-empty" role="status">${escapeHtml(t('msg.producerUnavailable'))}</p>
            <p class="producer-modal-empty-hint">${escapeHtml(t('msg.producerUnavailableHint'))}</p>
        </div>
        <footer class="producer-modal-footer">
            <button type="button" class="producer-modal-close" data-close-modal>${t('btn.close')}</button>
        </footer>
    `;

    modalOpenedAtMs = Date.now();
    setModalOpenState(modal, true);
    document.body.classList.add('producer-modal-open');
    window.setTimeout(() => {
        content.querySelector('.producer-modal-back')?.focus({ preventScroll: true });
    }, MODAL_CLOSE_GUARD_MS + 50);
    showToast(t('msg.producerUnavailable'));
    console.info('[ProducerModal] Producent niedostępny:', producerId);
}

/**
 * @param {string} producerId
 * @param {{ id?: string, name?: string, lat?: number, lng?: number, category?: string, address?: string, source?: string } | null} [hint]
 */
export function openProducerModal(producerId, hint = null) {
    if (isOpening) {
        console.warn('[Modal] Ignoruję podwójne otwarcie');
        return;
    }
    if (isModalOpen && openDetailProducer?.id === String(producerId ?? hint?.id ?? '').trim()) {
        console.warn('[Modal] Modal już otwarty dla tego producenta');
        return;
    }

    isOpening = true;
    const id = String(producerId ?? hint?.id ?? '').trim();

    try {
        console.log('[Modal] Otwieranie:', id || producerId);

        const found = resolveProducerForModal(id || producerId, hint);
        if (!found) {
            console.warn('[Modal] Nie znaleziono producenta:', id || producerId, hint);
            showProducerUnavailable(id || producerId);
            isOpening = false;
            return;
        }
        console.log('[Modal] Znaleziono:', found.id, found.name);

        ensureModal();
        const modal = document.getElementById('producerModal');
        const content = document.getElementById('producerModalContent');
        if (!modal || !content) {
            console.warn('[ProducerModal] Brak elementów #producerModal w DOM');
            showToast(t('msg.producerUnavailable'));
            isOpening = false;
            return;
        }

        lastFocusedElement = document.activeElement;

        // Natychmiast pokaż szkielet z przyciskiem Wstecz – użytkownik może wyjść nawet przy błędzie renderu
        content.innerHTML = buildModalLoadingShell();
        modalOpenedAtMs = Date.now();
        setModalOpenState(modal, true);
        document.body.classList.add('producer-modal-open');

        window.requestAnimationFrame(() => {
            try {
                let producer;
                try {
                    producer = upsertProducer(found);
                } catch (error) {
                    console.error('[Modal] enrich/upsert:', error);
                    producer = enrichProducerWithProducts(found);
                }

                try {
                    trackProducerViewed(producer.id, {
                        name: producer.name,
                        category: producer.category || producer.type || ''
                    });
                } catch (_) {
                    /* ignore */
                }

                content.innerHTML = renderModalContent(producer);
                rebindModalForms(content, producer.id);
                scheduleModalTranslations(content, producer);

                applyProducerMoodToModal(modal, producer);

                try {
                    import('../diagnostics/selfHealing.js')
                        .then((m) => {
                            m.healCategoryPhotos?.(modal);
                            m.healModalPhotoLayout?.(modal);
                        })
                        .catch(() => { /* self-heal optional */ });
                } catch (_) {
                    /* ignore */
                }

                openDetailProducer = {
                    id: String(producer.id),
                    category: String(producer.category || producer.type || '')
                };
                console.log('[Modal] Otwarty:', producer.id);

                try {
                    eventBus.emit(EVENTS.SHOW_DETAIL, {
                        id: openDetailProducer.id,
                        category: openDetailProducer.category
                    });
                } catch (_) {
                    /* ignore */
                }

                window.setTimeout(() => {
                    if (document.getElementById('producerModal')?.hidden) return;
                    content.querySelector('.producer-modal-back')?.focus({ preventScroll: true });
                }, MODAL_CLOSE_GUARD_MS + 50);
            } catch (error) {
                console.error('[ProducerModal] Błąd renderowania:', error);
                showProducerUnavailable(id || producerId);
            } finally {
                isOpening = false;
            }
        });
    } catch (error) {
        console.error('[ProducerModal] openProducerModal:', error);
        isOpening = false;
        showProducerUnavailable(id || String(producerId ?? ''));
    }
}

export function resetProducerModalOpeningState() {
    isOpening = false;
}

export function closeProducerModal({ force = false } = {}) {
    isOpening = false;
    const modal = document.getElementById('producerModal');
    if (!modal || (modal.hidden && !isModalOpen)) return;

    // Ignoruj zamknięcie wywołane tym samym gestem co otwarcie (ghost-click / popupclose)
    if (!force && Date.now() - modalOpenedAtMs < MODAL_CLOSE_GUARD_MS) {
        console.log('[Modal] Ignoruję wczesne zamknięcie (guard)');
        return;
    }

    destroyLocationMiniMap();

    // Fokus poza modal PRZED inert/hidden
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
    } else if (modal.contains(document.activeElement)) {
        document.activeElement.blur?.();
    }
    lastFocusedElement = null;

    const dwellMs = modalOpenedAtMs ? Date.now() - modalOpenedAtMs : 0;
    const closed = openDetailProducer;
    openDetailProducer = null;

    setModalOpenState(modal, false);
    clearProducerMoodFromModal(modal);
    document.body.classList.remove('producer-modal-open');
    console.log('[Modal] Zamknięty');

    if (closed) {
        try {
            eventBus.emit(EVENTS.HIDE_DETAIL, {
                id: closed.id,
                category: closed.category,
                dwellMs
            });
        } catch (_) {
            /* ignore */
        }
    }
}

export function initProducerModal() {
    if (initialized) return;
    initialized = true;

    // Ciche uzupełnienie tłumaczeń w DOM (bez pełnego re-renderu — mniej zapytań API)
    let dynRefreshTimer = 0;
    eventBus.on(EVENTS.DYNAMIC_TRANSLATIONS_UPDATED, () => {
        if (!isModalOpen || !openDetailProducer?.id) return;
        window.clearTimeout(dynRefreshTimer);
        dynRefreshTimer = window.setTimeout(() => {
            const modal = document.getElementById('producerModal');
            const content = document.getElementById('producerModalContent');
            if (!modal || modal.hidden || !content) return;
            const producer = getProducerById(openDetailProducer.id);
            if (!producer) return;
            scheduleModalTranslations(content, producer);
        }, 280);
    });

    ensureModal();

    document.addEventListener('click', (event) => {
        if (isModalOpen) {
            const content = document.getElementById('producerModalContent');
            if (content && !event.target.closest('.product-actions-dropdown')) {
                closeAllProductActionMenus(content);
            }
        }

        if (handlePromoFlyerToggle(event.target)) {
            return;
        }

        const closeEl = event.target?.closest?.('[data-close-modal]');
        if (!closeEl) return;

        // Nie zamykaj, jeśli klik należy do gestu otwierającego modal / zamykania popupu
        if (Date.now() - modalOpenedAtMs < MODAL_CLOSE_GUARD_MS) {
            event.preventDefault();
            event.stopPropagation();
            console.log('[Modal] Blokada ghost-click na close');
            return;
        }

        closeProducerModal();
    }, true);

    document.addEventListener('keydown', handleModalKeydown);
}

export default { openProducerModal, closeProducerModal, initProducerModal, isProducerModalOpen, resetProducerModalOpeningState };
