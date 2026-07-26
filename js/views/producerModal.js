// js/views/producerModal.js – pełnoekranowy modal szczegółów producenta

import {
    getProducerById,
    getProducerProducts,
    getGoogleMapsDirectionsUrl,
    getProducers,
    findProducerNear,
    upsertProducer
} from '../data/dataService.js';
import { t, tProductField } from '../core/i18n.js';
import { translateSoft } from '../i18n/aiTranslationEngine.js';
import {
    buildProducerHeaderHtml,
    buildProducerStoryHtml,
    buildPlaceHistoryHtml,
    buildPromotionsFlyerHtml,
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
import { refreshTasteDiaryMenuCount } from '../core/sideMenu.js';

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

const MODAL_MAP_ZOOM = 14;
const MODAL_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

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

function initLocationMiniMap(root) {
    try {
        destroyLocationMiniMap();

        const el = root?.querySelector('[data-producer-mini-map]');
        if (!el || typeof window.L === 'undefined') return;

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

function buildProductCard(producerId, product, index, category, producer = null) {
    const name = tProductField(producerId, index, 'name', product.name);
    const description = tProductField(producerId, index, 'description', product.description || '');
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
        <article class="producer-product-card" style="content-visibility:auto;contain-intrinsic-size:120px">
            <div class="producer-product-image">
                ${imageHtml}
            </div>
            <div class="producer-product-info">
                <h3 class="producer-product-name">${escapeHtml(name)}</h3>
                ${description ? `<p class="producer-product-desc">${escapeHtml(description)}</p>` : ''}
                <p class="producer-product-price">${priceLabel}</p>
                <p class="producer-product-badges">${availability}</p>
                ${product.promo ? `<p class="producer-product-promo" data-rg-ai>${escapeHtml(translateSoft(product.promo, { from: 'de' }))}</p>` : ''}
                ${getProductAvailability(product) === 'soldout'
        ? ''
        : `<button type="button" class="btn-secondary producer-contact-focus-btn" data-contact-focus aria-label="${escapeHtml(t('producer.contactTitle'))}: ${escapeHtml(name)}">
                    ${escapeHtml(t('producer.contactCta') || t('producer.contactTitle'))}
                </button>`}
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

function buildProductsHtml(producer) {
    // Preferuj produkty już na obiekcie (po enrich) – unikaj pustej listy przy soft-match / fallback
    const fromObject = Array.isArray(producer?.products) ? producer.products : [];
    const products = fromObject.length ? fromObject : getProducerProducts(producer.id);

    if (!products.length) {
        const messageKey = isExternalProducerWithoutCatalog(producer)
            ? 'msg.noOfferProducts'
            : 'msg.noProducts';

        return `
            <section class="producer-products-section">
                <h3 class="producer-section-title">${t('producer.productsTitle')}</h3>
                <p class="producer-modal-empty">${t(messageKey)}</p>
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

    return `
        <section class="producer-products-section">
            <h3 class="producer-section-title">${t('producer.productsTitle')}
                <span class="producer-products-count">(${products.length})</span>
            </h3>
            ${listHtml}
        </section>
    `;
}

function rebindModalForms(content, producerId) {
    bindReviewForm(content, producerId);
    bindReportForm(content, producerId);
    bindReviewExtras(content, producerId);
    bindReserveButtons(content, producerId);
    bindTasteDiaryForm(content, producerId);
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
            }
        });
    });
}

/** Kontakt z producentem (telefon / e-mail / WWW) — bez koszyka / płatności. */
function bindReserveButtons(content, _producerId) {
    content.querySelectorAll('[data-contact-focus]').forEach((btn) => {
        if (btn.dataset.bound === 'true') return;
        btn.dataset.bound = 'true';
        btn.addEventListener('click', () => {
            const section = content.querySelector('.producer-contact-section');
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                section.classList.add('is-highlighted');
                window.setTimeout(() => section.classList.remove('is-highlighted'), 1200);
            }
            showToast(t('producer.contactHint') || t('producer.contactTitle'));
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
        <header class="producer-modal-header">
            ${buildProducerPhotoHtml(producer, { className: 'producer-photo' })}
            ${buildProducerHeaderHtml(producer)}
        </header>
        <div class="producer-modal-body">
            ${buildTasteDiaryHtml(producer)}
            ${buildProducerStoryHtml(producer)}
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
    const id = String(producerId ?? hint?.id ?? '').trim();
    console.log('[Modal] Otwieranie:', id || producerId);

    const found = resolveProducerForModal(id || producerId, hint);
    if (!found) {
        console.warn('[Modal] Nie znaleziono producenta:', id || producerId, hint);
        showProducerUnavailable(id || producerId);
        return;
    }
    console.log('[Modal] Znaleziono:', found.id, found.name);

    let producer;
    try {
        producer = upsertProducer(
            Array.isArray(found.products) && found.products.length
                ? found
                : enrichProducerWithProducts(found)
        );
    } catch (error) {
        console.error('[Modal] enrich/upsert:', error);
        producer = found;
    }

    try {
        trackProducerViewed(producer.id, {
            name: producer.name,
            category: producer.category || producer.type || ''
        });
    } catch (_) {
        /* ignore */
    }

    ensureModal();
    const modal = document.getElementById('producerModal');
    const content = document.getElementById('producerModalContent');
    if (!modal || !content) {
        console.warn('[ProducerModal] Brak elementów #producerModal w DOM');
        showToast(t('msg.producerUnavailable'));
        return;
    }

    lastFocusedElement = document.activeElement;

    try {
        content.innerHTML = renderModalContent(producer);
        rebindModalForms(content, producer.id);
    } catch (error) {
        console.error('[ProducerModal] Błąd renderowania:', error);
        showToast(t('msg.producerUnavailable'));
        return;
    }

    // ETAP 17 – charakter wizualny (CSS), bez zmiany struktury HTML
    applyProducerMoodToModal(modal, producer);

    // Self-Heal: zdjęcie kategorii + wysokość (bez zmiany kolorów marki)
    try {
        // Ten sam URL co app.js (plain) — jedna instancja modułu
        import('../diagnostics/selfHealing.js')
            .then((m) => {
                m.healCategoryPhotos?.(modal);
                m.healModalPhotoLayout?.(modal);
            })
            .catch(() => { /* self-heal optional */ });
    } catch (_) {
        /* ignore */
    }

    // Najpierw pokaż modal – mini-mapa nie może blokować otwarcia
    modalOpenedAtMs = Date.now();
    openDetailProducer = {
        id: String(producer.id),
        category: String(producer.category || producer.type || '')
    };
    setModalOpenState(modal, true);
    document.body.classList.add('producer-modal-open');
    console.log('[Modal] Otwarty:', producer.id);

    try {
        eventBus.emit(EVENTS.SHOW_DETAIL, {
            id: openDetailProducer.id,
            category: openDetailProducer.category
        });
    } catch (_) {
        /* ignore */
    }

    try {
        initLocationMiniMap(content);
    } catch (error) {
        console.warn('[Modal] Mini-mapa:', error);
    }

    // Fokus dopiero po guardzie against ghost-click na data-close-modal (przycisk Wstecz)
    window.setTimeout(() => {
        if (document.getElementById('producerModal')?.hidden) return;
        content.querySelector('.producer-modal-back')?.focus({ preventScroll: true });
    }, MODAL_CLOSE_GUARD_MS + 50);
}

export function closeProducerModal({ force = false } = {}) {
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

    // Ciche odświeżenie opisów po dociągnięciu tłumaczeń (debounce — bez migotania)
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
            try {
                const scrollTop = content.scrollTop;
                content.innerHTML = renderModalContent(producer);
                rebindModalForms(content, producer.id);
                content.scrollTop = scrollTop;
                applyProducerMoodToModal(modal, producer);
            } catch {
                /* ignore soft refresh */
            }
        }, 280);
    });

    ensureModal();

    document.addEventListener('click', (event) => {
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

export default { openProducerModal, closeProducerModal, initProducerModal, isProducerModalOpen };
